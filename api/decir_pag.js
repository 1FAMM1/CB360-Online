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
    const data = req.body;
    const templateBuffer = await downloadTemplate(TEMPLATE_URL);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    // Começa a escrever no row 10
    let startRow = 10;

    data.table.forEach((item, index) => {
      const row = sheet.getRow(startRow + index);

      // Assumindo colunas:
      // B = NI, C = Nome, D = NIF, E = NIB, F = Qtd Turnos, G = Valor
      row.getCell(2).value = String(item.ni).padStart(3, "0");
      row.getCell(3).value = item.nome;
      row.getCell(4).value = item.nif;
      row.getCell(5).value = item.nib;
      row.getCell(6).value = item.turnos;
      row.getCell(7).value = item.valor;

      row.commit();
    });

    // Guarda o ficheiro gerado
    outputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(outputFilePath);

    const excelBuffer = fs.readFileSync(outputFilePath);
    try { fs.unlinkSync(outputFilePath); } catch {}

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.xlsx"`);
    res.status(200).send(excelBuffer);

  } catch (error) {
    if (outputFilePath && fs.existsSync(outputFilePath)) {
      try { fs.unlinkSync(outputFilePath); } catch {}
    }
    res.status(500).json({ error: "Erro interno", details: error.message });
  }
}
