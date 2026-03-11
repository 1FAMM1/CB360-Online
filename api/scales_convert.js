import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult } from "@adobe/pdfservices-node-sdk";

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/fomio_template.xlsx";

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

async function downloadTemplate(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const data = req.body;
    const tempDir = os.tmpdir();
    const inputFilePath = path.join(tempDir, `in_${Date.now()}.xlsx`);
    const outputFilePath = path.join(tempDir, `out_${Date.now()}.pdf`);

    try {
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);
        const sheet = workbook.worksheets[0];

        // 1. Título e Datas
        sheet.getCell("C9").value = `${data.monthName} ${data.year}`;

        // 2. Pintar Feriados (Rosa) e Carnaval (Verde)
        const applyStyle = (day, color) => {
            const col = 6 + (day - 1);
            sheet.getRow(8).getCell(col).value = 'FR';
            [8, 11, 12].forEach(r => {
                const cell = sheet.getRow(r).getCell(col);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
            });
        };

        (data.holidayDays || []).forEach(d => applyStyle(d, 'FFFFCCCC')); // Rosa
        (data.optionalDays || []).forEach(d => applyStyle(d, 'FF2ECC71')); // Verde

        // 3. Preencher Cabeçalhos dos Dias
        for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1);
            sheet.getRow(11).getCell(col).value = data.weekdays[d - 1] || '';
            sheet.getRow(12).getCell(col).value = d;
        }

        // 4. Preencher Funcionários Fixos (Linha 14 em diante)
        let rowIdx = 14;
        data.fixedRows.forEach(f => {
            const r = sheet.getRow(rowIdx);
            r.getCell(3).value = f.ni; r.getCell(4).value = f.nome; r.getCell(5).value = f.catg;
            for (let d = 1; d <= data.daysInMonth; d++) r.getCell(6 + (d - 1)).value = f.days[d] || '';
            rowIdx++;
        });

        // 5. Preencher Corpo Ativo (Linha 18 em diante)
        rowIdx = 18;
        data.normalRows.forEach(n => {
            const r = sheet.getRow(rowIdx);
            r.getCell(3).value = n.ni; r.getCell(4).value = n.nome; r.getCell(5).value = n.catg;
            for (let d = 1; d <= data.daysInMonth; d++) r.getCell(6 + (d - 1)).value = n.days[d] || '';
            rowIdx++;
        });

        // 6. Esconder colunas/linhas vazias
        for (let c = 6; c <= 36; c++) if (c > 6 + data.daysInMonth - 1) sheet.getColumn(c).hidden = true;
        for (let r = 18; r <= 117; r++) {
            const val = sheet.getRow(r).getCell(3).value;
            if (!val || val.toString().trim() === '') sheet.getRow(r).hidden = true;
        }

        await workbook.xlsx.writeFile(inputFilePath);

        // 7. Conversão Adobe
        const creds = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
        const pdfServices = new PDFServices({ credentials: creds });
        const asset = await pdfServices.upload({ readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX });
        const result = await pdfServices.getJobResult({ 
            pollingURL: await pdfServices.submit({ job: new CreatePDFJob({ inputAsset: asset }) }), 
            resultType: CreatePDFResult 
        });
        const stream = await pdfServices.getContent({ asset: result.result.asset });
        
        const writeStream = fs.createWriteStream(outputFilePath);
        stream.readStream.pipe(writeStream);
        await new Promise((res) => writeStream.on('finish', res));

        res.setHeader('Content-Type', 'application/pdf');
        res.send(fs.readFileSync(outputFilePath));

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    } finally {
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    }
}
