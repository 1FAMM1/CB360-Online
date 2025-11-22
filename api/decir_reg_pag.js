import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const TEMPLATES = {
  pag: "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/decir_pag_template.xlsx",
  reg: "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/decir_reg_template.xlsx"
};

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
    if (!data || !data.type || !['pag','reg'].includes(data.type)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    const templateBuffer = await downloadTemplate(TEMPLATES[data.type]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    if (data.type === 'pag') {
      // --- PAGAMENTOS DECIR ---
      sheet.getCell("B7").value = `PAGAMENTOS DECIR - ${data.monthName} ${data.year}`;
      const startRow = 10;
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

      const endRow = 113;
      for (let r = startRow; r <= endRow; r++) {
        const row = sheet.getRow(r);
        const valor = Number(row.getCell(7).value) || 0;
        const allEmpty = [2,3,4,5,6,7].every(c => {
          const v = row.getCell(c).value;
          return v === null || v === undefined || v === '';
        });
        if (valor === 0 || allEmpty) row.hidden = true;
      }

    } else if (data.type === 'reg') {
      // --- REGISTO DIÁRIO DECIR ---
      sheet.getCell("B7").value = `Registo Diário de Elementos - ${data.monthName} ${data.year}`;
      const rowWeekdays = sheet.getRow(9);
      const rowNumbers = sheet.getRow(10);

      for (let d = 1; d <= data.daysInMonth; d++) {
        const col = 6 + (d - 1);
        rowWeekdays.getCell(col).value = data.weekdays[d - 1] || '';
        rowNumbers.getCell(col).value = d;
      }
      rowWeekdays.commit();
      rowNumbers.commit();

      // Feriados
      const rowHolidays = sheet.getRow(8);
      (data.holidayDays || []).forEach(day => {
        const col = 6 + (day - 1);
        rowHolidays.getCell(col).value = 'FR';
      });
      rowHolidays.commit();

      // Linhas D/N
      let currentRow = 11;
      const allPersons = {};
      (data.fixedRows || []).forEach(p => allPersons[p.ni] = { ...p, days: p.days });
      (data.normalRows || []).forEach(p => {
        if (!allPersons[p.ni]) allPersons[p.ni] = { ...p, days: {} };
        Object.keys(p.days).forEach(d => {
          if (!allPersons[p.ni].days[d]) allPersons[p.ni].days[d] = {};
          allPersons[p.ni].days[d].N = p.days[d].N || '';
        });
      });

      Object.values(allPersons).forEach(person => {
        const rowD = sheet.getRow(currentRow);
        rowD.getCell(2).value = String(person.ni).padStart(3,"0");
        rowD.getCell(3).value = person.nome;
        for (let d = 1; d <= data.daysInMonth; d++) {
          const col = 6 + (d - 1);
          rowD.getCell(col).value = person.days[d]?.D || '';
        }
        rowD.getCell(38).value = person.amal || '';
        rowD.getCell(39).value = person.anepc || '';
        rowD.getCell(40).value = person.global || '';
        rowD.commit();

        const rowN = sheet.getRow(currentRow + 1);
        rowN.getCell(3).value = person.nome;
        for (let d = 1; d <= data.daysInMonth; d++) {
          const col = 6 + (d - 1);
          rowN.getCell(col).value = person.days[d]?.N || '';
        }
        rowN.commit();

        currentRow += 2;
      });

      // Ocultar linhas e colunas sem dados
      for (let r = currentRow; r <= 214; r++) {
        const cellB = sheet.getCell(`B${r}`);
        if (!cellB.value || cellB.value.toString().trim() === '') sheet.getRow(r).hidden = true;
      }

      for (let c = 6; c <= 36; c++) {
        const cell = sheet.getRow(10).getCell(c);
        if (!cell.value || cell.value.toString().trim() === '') sheet.getColumn(c).hidden = true;
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
