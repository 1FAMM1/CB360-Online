import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

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

  const tempDir = os.tmpdir();
  let outputFilePath = null;

  try {
    const data = req.body; // { monthName, year, daysInMonth, weekdays, holidayDays, fixedRows, normalRows, fileName }
    const templateBuffer = await downloadTemplate(TEMPLATE_URL);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    // --- Cabeçalho ---
    sheet.getCell("B7").value = `REGISTO DE ELEMENTOS - ${data.monthName} ${data.year}`;
    const rowWeekdays = sheet.getRow(9);
    const rowNumbers = sheet.getRow(10);
    for (let d = 1; d <= data.daysInMonth; d++) {
      const col = 6 + (d - 1);
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

    // --- Escalas D/N e valores extras ---
    let currentRow = 11;

    // Combinar fixedRows e normalRows em um único array por pessoa
    const allPersons = {};
    (data.fixedRows || []).forEach(p => {
      allPersons[p.ni] = { ...p, days: p.days };
    });
    (data.normalRows || []).forEach(p => {
      if (!allPersons[p.ni]) allPersons[p.ni] = { ...p, days: {} };
      Object.keys(p.days).forEach(d => {
        if (!allPersons[p.ni].days[d]) allPersons[p.ni].days[d] = {};
        allPersons[p.ni].days[d].N = p.days[d].N || '';
      });
    });

    Object.values(allPersons).forEach(person => {
      // Linha D
      const rowD = sheet.getRow(currentRow);
      rowD.getCell(2).value = String(person.ni).padStart(3, "0"); 
      rowD.getCell(3).value = person.nome;
      for (let d = 1; d <= data.daysInMonth; d++) {
        const col = 6 + (d - 1);
        rowD.getCell(col).value = person.days[d]?.D || '';
      }
      // Valores extras AMAL/ANEPC/GLOBAL
      rowD.getCell(38).value = person.amal || '';   // AL na planilha
      rowD.getCell(39).value = person.anepc || '';  // AM na planilha
      rowD.getCell(40).value = person.global || ''; // AN na planilha
      rowD.commit();

      // Linha N
      const rowN = sheet.getRow(currentRow + 1);
      rowN.getCell(2).value = person.ni;
      rowN.getCell(3).value = person.nome;
      for (let d = 1; d <= data.daysInMonth; d++) {
        const col = 6 + (d - 1);
        rowN.getCell(col).value = person.days[d]?.N || '';
      }
      rowN.commit();

      currentRow += 2;
    });

    // --- Ocultar linhas vazias ---
    for (let r = currentRow; r <= 214; r++) {
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

    // --- Guardar XLSX temporário ---
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
