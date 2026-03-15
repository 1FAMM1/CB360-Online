import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const TEMPLATE_SIGNA_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/000.xlsx";

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

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

function formatDate(dateStr) {
  // "2026-05-15" → "15 / 05 / 2026"
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d} / ${m} / ${y}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const tempDir = os.tmpdir();
  let outputFile = null;

  try {
    const { date1, date2, year, fileName } = req.body;
    if (!date1 || !date2 || !year) return res.status(400).json({ error: "Dados incompletos" });

    const templateBuffer = await downloadTemplate(TEMPLATE_SIGNA_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    const title = `Dispositivo Especial Combate Incêndios Rurais (DECIR ${year})`;
    const period = `Período: ${formatDate(date1)}  a  ${formatDate(date2)}`;

    // Preencher título e período nas 4 secções
    [7, 60, 113, 167].forEach(row => sheet.getCell(`B${row}`).value = title);
    [9, 62, 115, 169].forEach(row => sheet.getCell(`B${row}`).value = period);

    outputFile = path.join(tempDir, `${fileName || "signa"}_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(outputFile);
    const fileBuffer = fs.readFileSync(outputFile);
    try { fs.unlinkSync(outputFile); } catch {}

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName || "signa"}.xlsx"`);
    return res.status(200).send(fileBuffer);

  } catch (e) {
    try { if (outputFile) fs.unlinkSync(outputFile); } catch {}
    return res.status(500).json({ error: "Erro interno", details: e.message });
  }
}
