import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';
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

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/fomio_template.xlsx";

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
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

    // 1. Baixar template Excel
    const templateBuffer = await downloadTemplate(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);

    // 2. Manter apenas a primeira worksheet
    while (workbook.worksheets.length > 1) {
      workbook.removeWorksheet(workbook.worksheets[1].id);
    }

    const sheet = workbook.worksheets[0];

    // 3. Preencher título e cabeçalhos
    sheet.getCell("C9").value = `${data.monthName} ${data.year}`;
    const row11 = sheet.getRow(11); // nomes dos dias da semana
    const row12 = sheet.getRow(12); // números dos dias
    for (let d = 1; d <= data.daysInMonth; d++) {
      const col = 6 + (d - 1);
      row11.getCell(col).value = data.weekdays[d - 1] || '';
      row12.getCell(col).value = d;
    }
    row11.commit();
    row12.commit();

    // 4. Marcar linha 8 com FR ou CA
    const row8 = sheet.getRow(8);
    (data.holidayDays || []).forEach(day => {
      const col = 6 + (day - 1);
      const cell = row8.getCell(col);
      cell.value = 'FR';
    });
    (data.optionalDays || []).forEach(day => {
      const col = 6 + (day - 1);
      const cell = row8.getCell(col);
      cell.value = 'CA';
    });
    row8.commit();

    // 5. Preencher linhas fixas e normais
    let currentRow = 14;
    (data.fixedRows || []).forEach(fixedRow => {
      const row = sheet.getRow(currentRow++);
      row.getCell(3).value = fixedRow.ni;
      row.getCell(4).value = fixedRow.nome;
      row.getCell(5).value = fixedRow.catg;
      for (let d = 1; d <= data.daysInMonth; d++) {
        const col = 6 + (d - 1);
        row.getCell(col).value = fixedRow.days[d] || '';
      }
      row.commit();
    });

    currentRow = 18;
    (data.normalRows || []).forEach(normalRow => {
      const row = sheet.getRow(currentRow++);
      row.getCell(3).value = normalRow.ni;
      row.getCell(4).value = normalRow.nome;
      row.getCell(5).value = normalRow.catg;
      for (let d = 1; d <= data.daysInMonth; d++) {
        const col = 6 + (d - 1);
        row.getCell(col).value = normalRow.days[d] || '';
      }
      row.commit();
    });

    // 6. Ocultar linhas e colunas vazias
    for (let r = 18; r <= 117; r++) {
      const row = sheet.getRow(r);
      if (!row.getCell(3).value || row.getCell(3).value.toString().trim() === '') row.hidden = true;
    }
    for (let c = 6; c <= 6 + data.daysInMonth - 1; c++) {
      if (!sheet.getRow(11).getCell(c).value || sheet.getRow(11).getCell(c).value.toString().trim() === '') {
        sheet.getColumn(c).hidden = true;
      }
    }

    // 7. Pintar colunas de feriados, opcionais e fins de semana (linhas 11–117)
    for (let d = 1; d <= data.daysInMonth; d++) {
      const col = 6 + (d - 1);
      const header8 = sheet.getRow(8).getCell(col).value;
      const weekdayName = sheet.getRow(11).getCell(col).value;

      let color = null;
      if (header8 === 'FR') color = 'FFFFC0CB';      // rosa
      else if (header8 === 'CA') color = 'FF90EE90'; // verde
      else if (weekdayName === 'SÁB' || weekdayName === 'DOM') color = 'FFD3D3D3'; // cinza claro

      if (color) {
        for (let r = 11; r <= 117; r++) {
          const cell = sheet.getRow(r).getCell(col);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        }
      }
    }

    // 8. Limpar valores nulos
    sheet.eachRow(row => row.eachCell(cell => {
      if (cell.value === undefined || cell.value === null) cell.value = '';
    }));

    // 9. Configurar página
    sheet.pageSetup = {
      orientation: 'portrait',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      verticalCentered: false,
      margins: { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0, footer: 0 }
    };

    // 10. Salvar temporário
    inputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
    outputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.pdf`);
    await workbook.xlsx.writeFile(inputFilePath);

    // 11. Converter para PDF com Adobe PDF Services
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

    // 12. Limpeza
    try {
      if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
      if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    } catch { }

    // 13. Retornar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    try {
      if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
      if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    } catch { }

    if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
      return res.status(500).json({ error: "Erro no serviço Adobe PDF Services", details: error.message });
    }

    return res.status(500).json({ error: "Erro interno ao converter para PDF", details: error.message });
  }
}
