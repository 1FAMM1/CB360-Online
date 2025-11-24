import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const TEMPLATE_PAG_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/decir_pag_template.xlsx";
const TEMPLATE_REG_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/decir_reg_template.xlsx";
const TEMPLATE_CODE_A33_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/cod_a33_template.xlsx";
const TEMPLATE_ANEPC_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/anepc_template.xlsx";

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

function monthNameToIndex(ptName) {
  if (!ptName) return null;
  const m = ptName.trim().toLowerCase();
  const map = {
    'janeiro': 1,'fevereiro': 2,'março': 3,'marco': 3,'abril': 4,'maio': 5,'junho': 6,
    'julho': 7,'agosto': 8,'setembro': 9,'outubro': 10,'novembro': 11,'dezembro': 12
  };
  return map[m] || null;
}

/* ============================================================
                         HANDLER PRINCIPAL
============================================================ */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const tempDir = os.tmpdir();
  let outputFile = null;
  try {
    const data = req.body;
    if (!data || !data.type) return res.status(400).json({ error: "Tipo não especificado" });
    const workbook = new ExcelJS.Workbook();
    let sheet;
    /* ============================================================
                          REGISTO DIÁRIO
    ============================================================ */
    // ---------- REGISTO DIÁRIO ----------
    if (data.type === 'reg') {
      const requiredFields = ['monthName','year','daysInMonth','weekdays','fixedRows','normalRows'];
      if (!requiredFields.every(f => f in data)) return res.status(400).json({ error: "Dados incompletos para registo diário" });

      const templateBuffer = await downloadTemplate(TEMPLATE_REG_URL);
      await workbook.xlsx.load(templateBuffer);
      sheet = workbook.worksheets[0];

      // Título
      sheet.getCell("B7").value = `Registo Diário de Elementos - ${data.monthName} ${data.year}`;

      // Cabeçalho dias e weekdays
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
      if (Array.isArray(data.holidayDays)) {
        const rowHolidays = sheet.getRow(8);
        data.holidayDays.forEach(day => {
          const col = 6 + (day - 1);
          rowHolidays.getCell(col).value = 'FR';
        });
        rowHolidays.commit();
      }

      // Combinar fixedRows e normalRows
      const allPersons = {};
      (data.fixedRows || []).forEach(p => allPersons[p.ni] = { ...p, days: p.days });
      (data.normalRows || []).forEach(p => {
        if (!allPersons[p.ni]) allPersons[p.ni] = { ...p, days: {} };
        Object.keys(p.days).forEach(d => {
          if (!allPersons[p.ni].days[d]) allPersons[p.ni].days[d] = {};
          allPersons[p.ni].days[d].N = p.days[d].N || '';
        });
      });

      let currentRow = 11;
      Object.values(allPersons).forEach(person => {
        // Linha D
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

        // Linha N
        const rowN = sheet.getRow(currentRow + 1);
        rowN.getCell(3).value = person.nome;
        for (let d = 1; d <= data.daysInMonth; d++) {
          const col = 6 + (d - 1);
          rowN.getCell(col).value = person.days[d]?.N || '';
        }
        rowN.commit();
        currentRow += 2;
      });

      // Ocultar linhas vazias restantes
      for (let r = currentRow; r <= 214; r++) {
        const cellB = sheet.getCell(`B${r}`);
        if (!cellB.value || cellB.value.toString().trim() === '') sheet.getRow(r).hidden = true;
      }

      // Ocultar colunas sem dias
      for (let c = 6; c <= 36; c++) {
        const cell = sheet.getRow(10).getCell(c);
        if (!cell.value || cell.value.toString().trim() === '') sheet.getColumn(c).hidden = true;
      }
    }
    /* ============================================================
                           PAGAMENTOS DECIR
    ============================================================ */
    else if (data.type === "pag") {
      const buffer = await downloadTemplate(TEMPLATE_PAG_URL);
      await workbook.xlsx.load(buffer);
      sheet = workbook.worksheets[0];
      sheet.getCell("B7").value = `Pagamentos DECIR - ${data.monthName} ${data.year}`;
      let row = 10;
      data.rows.forEach(r => {
        const line = sheet.getRow(row);
        line.getCell(2).value = String(r.ni).padStart(3,'0');
        line.getCell(3).value = r.nome;
        line.getCell(4).value = r.nif;
        line.getCell(5).value = r.nib;
        line.getCell(6).value = r.qtdTurnos;
        line.getCell(7).value = r.valor;
        line.commit();
        row++;
      });
    }
    /* ============================================================
                             CÓDIGO A33
    ============================================================ */
    else if (data.type === "code_a33") {
      const buffer = await downloadTemplate(TEMPLATE_CODE_A33_URL);
      await workbook.xlsx.load(buffer);
      sheet = workbook.worksheets[0];
      sheet.getCell("B7").value = `Cod.A33 - ${data.year}`;
      sheet.getCell("D3").value = `Pagamentos DECIR_${data.year} Cód.A33`;
      let row = 11;
      for (const p of data.rows) {
        const r = sheet.getRow(row);
        r.getCell("B").value = String(p.ni).padStart(3,'0');
        r.getCell("C").value = p.nome;
        r.getCell("G").value = p.nif;
        const map = { ABRIL:"J", MAIO:"L", JUNHO:"N", JULHO:"P", AGOSTO:"R", SETEMBRO:"T", OUTUBRO:"V" };
        Object.entries(map).forEach(([m, col]) => {
          r.getCell(col).value = Number(p[m]) || 0;
        });
        r.commit();
        row++;
      }
      for (let r = 11; r <= 112; r++) {
        const rowX = sheet.getRow(r);
        const monthlyCols = ["J","L","N","P","R","T","V"];
        const all0 = monthlyCols.every(c => (Number(rowX.getCell(c).value) || 0) === 0);
        if (all0) rowX.hidden = true;
      }
    }
    /* ============================================================
                                 ANEPC
    ============================================================ */
    else if (data.type === "anepc") {
      const buffer = await downloadTemplate(TEMPLATE_ANEPC_URL);
      await workbook.xlsx.load(buffer);
      sheet = workbook.worksheets[0];
      const monthName = data.monthName;
      const year = Number(data.year);
      const mIdx = monthNameToIndex(monthName);
      let firstDay = 1;
      let lastDay = new Date(year, mIdx, 0).getDate();
      if (mIdx === 5) {
        firstDay = 15;
      }
      if (mIdx === 10) {
        lastDay = 15;
      }
      const mm = String(mIdx).padStart(2,'0');
      const periodStr = `Período: ${String(firstDay).padStart(2,'0')} / ${mm} / ${year}  a  ${String(lastDay).padStart(2,'0')} / ${mm} / ${year}`;
      sheet.getCell("B7").value = `Dispositivo Especial Combate Incêndios Rurais (DECIR ${year})         ${periodStr}`;
      let row = 10;
      data.rows.forEach(r => {
        const line = sheet.getRow(row);
        line.getCell("B").value = r.niFile;
        line.getCell("C").value = r.funcao;
        line.getCell("D").value = r.nome;
        line.getCell("F").value = r.qtdTurnos;
        line.getCell("H").value = r.valor;
        line.commit();
        row++;
      });
      for (let r = 10; r <= 111; r++) {
        const line = sheet.getRow(r);
        const empty =
          (!line.getCell("B").value || line.getCell("B").value === "") &&
          (!line.getCell("C").value || line.getCell("C").value === "") &&
          (!line.getCell("D").value || line.getCell("D").value === "");
        const qtd = Number(line.getCell("F").value) || 0;
        const val = Number(line.getCell("H").value) || 0;
        if (empty || (qtd === 0 && val === 0)) {
          line.hidden = true;
        }
      }
    }
    /* ============================================================
                           GUARDAR E DEVOLVER
    ============================================================ */
    outputFile = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(outputFile);
    const fileBuffer = fs.readFileSync(outputFile);
    try { fs.unlinkSync(outputFile); } catch {}
    res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition",`attachment; filename="${data.fileName}.xlsx"`);
    return res.status(200).send(fileBuffer);
  } catch (e) {
    try { if (outputFile) fs.unlinkSync(outputFile); } catch {}
    return res.status(500).json({ error: "Erro interno", details: e.message });
  }
}
