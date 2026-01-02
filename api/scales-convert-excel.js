import {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    CreatePDFJob,
    CreatePDFResult,
    SDKError,
    ServiceUsageError,
    ServiceApiError
} from "@adobe/pdfservices-node-sdk";
import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/fomio_template.xlsx";

export const config = {
    api: {
        bodyParser: { sizeLimit: '10mb' }
    }
};

async function downloadTemplate(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).json({ error: "Erro: Chaves da Adobe não configuradas." });

    const tempDir = os.tmpdir();
    let inputFilePath = null;
    let outputFilePath = null;

    try {
        const data = req.body;
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);

        while (workbook.worksheets.length > 1) {
            workbook.removeWorksheet(workbook.worksheets[1].id);
        }

        const sheet = workbook.worksheets[0];

        sheet.getCell("C9").value = `${data.monthName} ${data.year}`;
        
        const row11 = sheet.getRow(11);
        const row12 = sheet.getRow(12);
        for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1);
            row11.getCell(col).value = data.weekdays[d - 1] || '';
            row12.getCell(col).value = d;
        }
        row11.commit();
        row12.commit();

        const holidayDays = data.holidayDays || [];
        console.log('Feriados recebidos:', holidayDays);
        
        const row8 = sheet.getRow(8);
        holidayDays.forEach(day => {
            const col = 6 + (day - 1);
            const cell = row8.getCell(col);
            console.log(`Colocando FR na row 8, dia ${day}, coluna ${col}`);
            cell.value = 'FR';
        });
        row8.commit();

        let currentRow = 14;
        data.fixedRows.forEach(fixedRow => {
            if (fixedRow.type !== 'header') {
                const row = sheet.getRow(currentRow);
                row.getCell(3).value = fixedRow.ni;
                row.getCell(4).value = fixedRow.nome;
                row.getCell(5).value = fixedRow.catg;
                for (let d = 1; d <= data.daysInMonth; d++) {
                    const col = 6 + (d - 1);
                    row.getCell(col).value = fixedRow.days[d] || '';
                }
                row.commit();
                currentRow++;
            }
        });

        currentRow = 18;
        data.normalRows.forEach(normalRow => {
            const row = sheet.getRow(currentRow);
            row.getCell(3).value = normalRow.ni;
            row.getCell(4).value = normalRow.nome;
            row.getCell(5).value = normalRow.catg;
            for (let d = 1; d <= data.daysInMonth; d++) {
                const col = 6 + (d - 1);
                row.getCell(col).value = normalRow.days[d] || '';
            }
            row.commit();
            currentRow++;
        });

        for (let r = 18; r <= 117; r++) {
            const row = sheet.getRow(r);
            const cellC = row.getCell(3);
            if (!cellC.value || cellC.value.toString().trim() === '') {
                row.hidden = true;
            }
        }

        const colStart = 6; // F
        const colEnd = 36;  // AJ
        for (let c = colStart; c <= colEnd; c++) {
            const cell = sheet.getRow(11).getCell(c);
            if (!cell.value || cell.value.toString().trim() === '') {
                sheet.getColumn(c).hidden = true;
            }
        }

        sheet.properties.outlineLevelCol = undefined;
        sheet.properties.outlineLevelRow = undefined;
        sheet.eachRow(row => row.eachCell(cell => {
            if (cell.value === undefined || cell.value === null) cell.value = '';
        }));

        sheet.pageSetup = {
            orientation: 'landscape', // MUDANÇA: Horizontal é obrigatório para 31 dias
            paperSize: 9,             // A4
            fitToPage: true,
            fitToWidth: 1,            // FORÇA a largura a caber em 1 folha
            fitToHeight: 0,           // Deixa a altura crescer se houver muitas linhas
            horizontalCentered: true,
            verticalCentered: false,  // Melhor deixar falso para começar no topo
            margins: {
                left: 0.2,
                right: 0.2,
                top: 0.3,
                bottom: 0.3,
                header: 0.1,
                footer: 0.1
            }
        };

        inputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.pdf`);

        try {
            await workbook.xlsx.writeFile(inputFilePath);
            const stats = fs.statSync(inputFilePath);
            if (stats.size < 5000) throw new Error('Ficheiro XLSX muito pequeno, pode estar corrompido');
            const testWorkbook = new ExcelJS.Workbook();
            await testWorkbook.xlsx.readFile(inputFilePath);
        } catch {
            const newWorkbook = new ExcelJS.Workbook();
            const newSheet = newWorkbook.addWorksheet('Escala');
            newSheet.columns = [
                { width: 5 }, { width: 5 }, { width: 8 }, { width: 20 }, { width: 8 }
            ];
            for (let d = 1; d <= data.daysInMonth; d++) {
                newSheet.getColumn(5 + d).width = 5;
            }
            newSheet.mergeCells('C9:H9');
            const titleCell = newSheet.getCell('C9');
            titleCell.value = `ESCALA DE SERVIÇO - ${data.monthName} ${data.year}`;
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            titleCell.font = { bold: true, size: 14 };
            newSheet.getCell('C11').value = 'NI';
            newSheet.getCell('D11').value = 'Nome';
            newSheet.getCell('E11').value = 'Catg.';
            
            for (let d = 1; d <= data.daysInMonth; d++) {
                const col = 6 + (d - 1);
                const colLetter = String.fromCharCode(64 + col);
                newSheet.getCell(`${colLetter}11`).value = data.weekdays[d - 1] || '';
                newSheet.getCell(`${colLetter}12`).value = d;
                
                if (holidayDays.includes(d)) {
                    newSheet.getCell(`${colLetter}8`).value = 'FR';
                }
            }
            
            let rowNum = 15;
            data.fixedRows.forEach(fixedRow => {
                newSheet.getCell(`C${rowNum}`).value = fixedRow.ni;
                newSheet.getCell(`D${rowNum}`).value = fixedRow.nome;
                newSheet.getCell(`E${rowNum}`).value = fixedRow.catg;
                for (let d = 1; d <= data.daysInMonth; d++) {
                    const col = 6 + (d - 1);
                    const colLetter = String.fromCharCode(64 + col);
                    newSheet.getCell(`${colLetter}${rowNum}`).value = fixedRow.days[d] || '';
                }
                rowNum++;
            });
            rowNum = 18;
            data.normalRows.forEach(normalRow => {
                newSheet.getCell(`C${rowNum}`).value = normalRow.ni;
                newSheet.getCell(`D${rowNum}`).value = normalRow.nome;
                newSheet.getCell(`E${rowNum}`).value = normalRow.catg;
                for (let d = 1; d <= data.daysInMonth; d++) {
                    const col = 6 + (d - 1);
                    const colLetter = String.fromCharCode(64 + col);
                    newSheet.getCell(`${colLetter}${rowNum}`).value = normalRow.days[d] || '';
                }
                rowNum++;
            });

            for (let r = 18; r <= 117; r++) {
                const cellC = newSheet.getCell(`C${r}`);
                if (!cellC.value || cellC.value.toString().trim() === '') {
                    newSheet.getRow(r).hidden = true;
                }
            }

            for (let c = 6; c <= 36; c++) {
                const cell = newSheet.getRow(11).getCell(c);
                if (!cell.value || cell.value.toString().trim() === '') {
                    newSheet.getColumn(c).hidden = true;
                }
            }

            await newWorkbook.xlsx.writeFile(inputFilePath);
        }

        const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
        const pdfServices = new PDFServices({ credentials });
        const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX });
        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await pdfServices.submit({ job });
        const pdfServicesResponse = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({ asset: resultAsset });

        const writeStream = fs.createWriteStream(outputFilePath);
        streamAsset.readStream.pipe(writeStream);
        await new Promise((resolve, reject) => { writeStream.on('finish', resolve); writeStream.on('error', reject); });

        const pdfBuffer = fs.readFileSync(outputFilePath);

        try { 
            if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); 
            if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); 
        } catch {}

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        try { 
            if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); 
            if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); 
        } catch {}
        if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
            return res.status(500).json({ error: "Erro no serviço Adobe PDF Services", details: error.message });
        }
        return res.status(500).json({ error: "Erro interno ao converter para PDF", details: error.message });
    }
}
