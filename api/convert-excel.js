// api/convert-excel.js
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
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/fomio_template.xlsx";

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

async function downloadTemplate(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).json({ error: "Chaves Adobe não configuradas." });

    const tempDir = os.tmpdir();
    let inputFilePath = null;
    let outputFilePath = null;

    try {
        const data = req.body;
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);

        if (!workbook.worksheets.length) workbook.addWorksheet('Escala');
        while (workbook.worksheets.length > 1) workbook.removeWorksheet(workbook.worksheets[1].id);

        const sheet = workbook.worksheets[0];

        // Preencher título
        sheet.getCell("C9").value = `${data.monthName} ${data.year}`;

        // Cabeçalhos
        const row11 = sheet.getRow(11);
        const row12 = sheet.getRow(12);
        for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1);
            row11.getCell(col).value = data.weekdays[d - 1] || '';
            row12.getCell(col).value = d;
        }
        row11.commit(); row12.commit();

        // Função auxiliar para preencher linhas
        const fillRows = (rows, startRow) => {
            let currentRow = startRow;
            rows.forEach(r => {
                const row = sheet.getRow(currentRow);
                row.getCell(3).value = r.ni || '';
                row.getCell(4).value = r.nome || '';
                row.getCell(5).value = r.catg || '';
                for (let d = 1; d <= data.daysInMonth; d++) row.getCell(6 + (d - 1)).value = r.days[d] || '';
                row.commit();
                currentRow++;
            });
        };

        fillRows(data.fixedRows.filter(r => r.type !== 'header'), 15);
        fillRows(data.normalRows, 18);

        // Ajuste página
        sheet.pageSetup = {
            orientation: 'portrait',
            paperSize: 9,
            fitToPage: true,
            fitToWidth: 0,
            fitToHeight: 1,
            horizontalCentered: true,
            verticalCentered: true,
            margins: { left: 0.059, right: 0.059, top: 0.25, bottom: 0.25, header: 0.1, footer: 0.1 }
        };

        // Limpar células vazias
        sheet.eachRow(row => row.eachCell(cell => { if (cell.value == null) cell.value = ''; }));

        inputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.pdf`);
        await workbook.xlsx.writeFile(inputFilePath);

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
        await new Promise((r, j) => { writeStream.on('finish', r); writeStream.on('error', j); });

        const pdfBuffer = fs.readFileSync(outputFilePath);
        if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        return res.status(500).json({ error: "Erro ao converter para PDF", details: error.message });
    }
}
