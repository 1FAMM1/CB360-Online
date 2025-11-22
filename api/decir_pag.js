import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/decir_pag_template.xlsx";

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

  const tempDir = os.tmpdir();
  let outputFilePath = null;

  try {
    const data = req.body; // { fileName, rows: [{ni,nome,nif,nib,qtdTurnos,valor},...] }
    if (!data || !data.rows || !Array.isArray(data.rows)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const templateBuffer = await downloadTemplate(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    let startRow = 10; // B10 começa o NI
    data.rows.forEach((row, idx) => {
      const r = sheet.getRow(startRow + idx);
      r.getCell(2).value = String(row.ni).padStart(3,'0'); // NI
      r.getCell(3).value = row.nome || '';
      r.getCell(4).value = row.nif || '';
      r.getCell(5).value = row.nib || '';
      r.getCell(6).value = row.qtdTurnos || 0;
      r.getCell(7).value = row.valor || 0;
      r.commit();
    });

    const startRow = 10;
const endRow = 113;

for (let r = startRow; r <= endRow; r++) {
  const row = sheet.getRow(r);
  const cellG = row.getCell(7);
  const valor = Number(cellG.value) || 0;

  // Verifica se todas as células da linha (colunas 2 a 7) estão vazias
  const allEmpty = [2,3,4,5,6,7].every(c => {
    const v = row.getCell(c).value;
    return v === null || v === undefined || v === '';
  });

  if (valor === 0 || allEmpty) {
    row.hidden = true;
  }
}

    outputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(outputFilePath);

    const excelBuffer = fs.readFileSync(outputFilePath);
    try { if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch {}

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.xlsx"`);
    return res.status(200).send(excelBuffer);

  } catch (error) {
    try { if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch {}
    return res.status(500).json({ error: "Erro interno ao gerar Excel", details: error.message });
  }
}
