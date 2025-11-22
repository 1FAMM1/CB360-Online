import {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    CreatePDFJob,
    CreatePDFResult
} from "@adobe/pdfservices-node-sdk";
import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/decir_reg_template.xlsx";

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } }
};

async function downloadTemplate(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).json({ error: 'Chaves da Adobe não configuradas.' });

    const tempDir = os.tmpdir();
    let inputFilePath = null;
    let outputFilePath = null;

    try {
        const data = req.body; // Deve ter: year, monthName, daysInMonth, weekdays[], holidayDays[], fixedRows[], normalRows[], fileName
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);
        const sheet = workbook.worksheets[0];

        // --- Cabeçalho ---
        sheet.getCell("C9").value = `${data.monthName} ${data.year}`;
        const rowWeekdays = sheet.getRow(9);
        const rowNumbers = sheet.getRow(10);
        for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1); // coluna F = 6
            rowWeekdays.getCell(col).value = data.weekdays[d - 1] || '';
            rowNumbers.getCell(col).value = d;
        }
        rowWeekdays.commit();
        rowNumbers.commit();

        // --- Feriados ---
        const rowHolidays = sheet.getRow(8);
        (data.holidayDays || []).forEach(day => {
            const col = 6 + (day - 1);
            rowHolidays.getCell(col).value = 'FR';
        });
        rowHolidays.commit();

        // --- Escalas D/N ---
        let currentRow = 11;
        const allRows = [...data.fixedRows, ...data.normalRows];
        allRows.forEach(person => {
            // Linha D
            let rowD = sheet.getRow(currentRow);
            rowD.getCell(2).value = person.ni; // coluna B
            rowD.getCell(3).value = person.nome; // coluna C
            for (let d = 1; d <= data.daysInMonth; d++) {
                const col = 6 + (d - 1);
                rowD.getCell(col).value = person.days[d]?.D || '';
            }
            rowD.commit();
            // Linha N
            let rowN = sheet.getRow(currentRow + 1);
            for (let d = 1; d <= data.daysInMonth; d++) {
                const col = 6 + (d - 1);
                rowN.getCell(col).value = person.days[d]?.N || '';
            }
            rowN.commit();
            currentRow += 2;
        });

        // --- Ocultar linhas vazias ---
        for (let r = currentRow; r <= 117; r++) {
            const cellB = sheet.getCell(`B${r}`);
            if (!cellB.value || cellB.value.toString().trim() === '') {
                sheet.getRow(r).hidden = true;
            }
        }

        // --- Ocultar colunas sem dias ---
        for (let c = 6; c <= 36; c++) {
            const cell = sheet.getRow(10).getCell(c);
            if (!cell.value || cell.value.toString().trim() === '') {
                sheet.getColumn(c).hidden = true;
            }
        }

        // --- Page Setup ---
        sheet.pageSetup = {
            orientation: 'portrait',
            paperSize: 9,
            fitToPage: true,
            fitToWidth: 0,
            fitToHeight: 1,
            horizontalCentered: true,
            verticalCentered: true,
            margins: { left:0.059, right:0.059, top:0.25, bottom:0.25, header:0.1, footer:0.1 }
        };

        // --- Guardar XLSX temporário ---
        inputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.pdf`);
        await workbook.xlsx.writeFile(inputFilePath);

        // --- Adobe PDF Services ---
        const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
        const pdfServices = new PDFServices({ credentials });
        const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX });
        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await pdfServices.submit({ job });
        const pdfResult = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const resultAsset = pdfResult.result.asset;
        const streamAsset = await pdfServices.getContent({ asset: resultAsset });
        const writeStream = fs.createWriteStream(outputFilePath);
        streamAsset.readStream.pipe(writeStream);
        await new Promise((resolve, reject) => { writeStream.on('finish', resolve); writeStream.on('error', reject); });

        const pdfBuffer = fs.readFileSync(outputFilePath);
        try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch {}
        try { if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch {}

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch {}
        try { if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch {}
        return res.status(500).json({ error: "Erro interno ao gerar PDF", details: error.message });
    }
}
