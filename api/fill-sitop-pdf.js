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
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/sitop_template.xlsx";

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
        const sheet = workbook.worksheets[0];

        // Preenche células
        sheet.getCell('S11').value = data.vehicle || '';
        sheet.getCell('E17').value = data.registration || '';
        sheet.getCell('B17').value = data.gdh_inop || '';
        sheet.getCell('O14').value = data.failure_type || '';
        sheet.getCell('K16').value = data.failure_description ? `Descrição: ${data.failure_description}` : '';
        sheet.getCell('G30').value = data.gdh_op || '';
        sheet.getCell('E41').value = data.optel || '';

        // Marcações de PPI
        if (data.ppi_part) {
            sheet.getCell('R20').value = 'X';
            sheet.getCell('T20').value = '';
        } else {
            sheet.getCell('R20').value = '';
            sheet.getCell('T20').value = 'X';
        }

        sheet.getCell('O23').value = data.ppi_airport ? 'X' : '';
        sheet.getCell('O26').value = data.ppi_a22 ? 'X' : '';
        sheet.getCell('O29').value = data.ppi_a2 ? 'X' : '';
        sheet.getCell('O32').value = data.ppi_linfer ? 'X' : '';
        sheet.getCell('O35').value = data.ppi_airfield ? 'X' : '';

        if (data.ppi_subs) {
            sheet.getCell('R38').value = 'X';
            sheet.getCell('T38').value = '';
        } else {
            sheet.getCell('R38').value = '';
            sheet.getCell('T38').value = 'X';
        }

        // Configuração de página
        sheet.pageSetup = {
            orientation: 'landscape',
            paperSize: 9,
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            horizontalCentered: true,
            verticalCentered: true,
            margins: {
                left: 0.059,
                right: 0.059,
                top: 0.25,
                bottom: 0.25,
                header: 0.1,
                footer: 0.1
            }
        };

        // 🚨 NOME FIXO: apenas prefixo + veículo + 0805
        const prefix = (!data.gdh_op || data.gdh_op.trim() === '') ? 'INOP' : 'OP';
        const fileName = `${prefix}_${data.vehicle}_0805`;

        inputFilePath = path.join(tempDir, `${fileName}.xlsx`);
        outputFilePath = path.join(tempDir, `${fileName}.pdf`);

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
        await new Promise((resolve, reject) => { writeStream.on('finish', resolve); writeStream.on('error', reject); });

        const pdfBuffer = fs.readFileSync(outputFilePath);

        try { if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch {}

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        try { if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch {}
        if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
            return res.status(500).json({ error: "Erro no serviço Adobe PDF Services", details: error.message });
        }
        return res.status(500).json({ error: "Erro interno ao converter para PDF", details: error.message });
    }
}
