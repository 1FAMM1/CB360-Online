import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import https from 'https';
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFResult, CreatePDFJob }
  from "@adobe/pdfservices-node-sdk";

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/preventations_payment_template.xlsx";

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
};

async function downloadTemplate(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function convertXLSXToPDF(xlsxBuffer, fileName) {
  if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("Chaves Adobe não configuradas.");
  const inputFilePath = `/tmp/${fileName}_input_${Date.now()}.xlsx`;
  fs.writeFileSync(inputFilePath, xlsxBuffer);
  try {
    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX });
    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });
    const chunks = [];
    await new Promise((resolve, reject) => {
      streamAsset.readStream.on("data", chunk => chunks.push(chunk));
      streamAsset.readStream.on("end", resolve);
      streamAsset.readStream.on("error", reject);
    });
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Erro Adobe:", error);
    throw new Error("Falha na conversão XLSX para PDF.");
  } finally {
    try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch {}
  }
}

const MONTH_NAMES = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const tempDir = os.tmpdir();
  let outputFile = null;

  try {
    const { rows, year, month, format } = req.body;

    if (!Array.isArray(rows)) return res.status(400).json({ error: 'Rows inválidas' });

    const templateBuffer = await downloadTemplate(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    // Mês e Ano
    const monthName = MONTH_NAMES[parseInt(month)] || month;
    sheet.getCell('D5').value = monthName;
    sheet.getCell('F5').value = year;

    // Preencher dados — 20 linhas por lado (linhas 9 a 28)
    // Lado esquerdo: B, C, D | Lado direito: F, G, H
    const MAX_PER_SIDE = 20;

    rows.forEach((item, idx) => {
      if (idx < MAX_PER_SIDE) {
        const rowNum = 10 + idx;
        sheet.getCell(`B${rowNum}`).value = item.n_int || '';
        sheet.getCell(`C${rowNum}`).value = item.abv_name || '';
        sheet.getCell(`D${rowNum}`).value = parseFloat(item.total) || 0;
      } else {
        const rowNum = 10 + (idx - MAX_PER_SIDE);
        sheet.getCell(`F${rowNum}`).value = item.n_int || '';
        sheet.getCell(`G${rowNum}`).value = item.abv_name || '';
        sheet.getCell(`H${rowNum}`).value = parseFloat(item.total) || 0;
      }
    });

    // Atualizar fórmula do Global
    sheet.getCell('G31').value = '=IFERROR(SUM(D9:D28,H9:H28),"")';

    sheet.pageSetup = {
      orientation: "portrait", paperSize: 9, fitToPage: true,
      fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
      margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    };

    const safeFileName = `pagamento_prevencoes_${year}_${String(month).padStart(2, '0')}`;

    if (format === 'pdf') {
      const xlsxBuffer = await workbook.xlsx.writeBuffer();
      const pdfBuffer = await convertXLSXToPDF(xlsxBuffer, safeFileName);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } else {
      outputFile = `${tempDir}/${safeFileName}_${Date.now()}.xlsx`;
      await workbook.xlsx.writeFile(outputFile);
      const fileBuffer = fs.readFileSync(outputFile);
      try { fs.unlinkSync(outputFile); } catch {}
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.xlsx"`);
      return res.status(200).send(fileBuffer);
    }

  } catch (e) {
    try { if (outputFile) fs.unlinkSync(outputFile); } catch {}
    return res.status(500).json({ error: 'Erro interno', details: e.message });
  }
}
