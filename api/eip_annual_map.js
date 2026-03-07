import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import {
  ServicePrincipalCredentials, PDFServices, MimeType,
  CreatePDFJob, CreatePDFResult
} from "@adobe/pdfservices-node-sdk";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/eip_annual_map_template.xlsx";

// Cores padrão
const COLOR = {
  HOLIDAY: "FFF7C6C7", // Rosa para feriados
  WEEKEND: "FFF9E0B0", // Amarelo para fins de semana
  EMPTY:   "FFF8FAFC", // Cinza claro para dias inexistentes
  WHITE:   "FFFFFFFF"  // Branco para dias úteis
};

const MONTH_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

// Função de feriados (calculada estritamente pelo ano enviado)
function getHolidaySet(y) {
  const year = parseInt(y, 10);
  const set = new Set();
  const fixed = [[1,1],[4,25],[5,1],[6,10],[8,15],[9,7],[10,5],[11,1],[12,1],[12,8],[12,25]];
  fixed.forEach(([m, d]) => set.add(`${m}-${d}`));

  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451), mon = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const easter = new Date(Date.UTC(year, mon - 1, day));
  const add = (n) => {
    const d = new Date(easter);
    d.setUTCDate(d.getUTCDate() + n);
    return `${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  };
  [add(-47), add(-2), add(0), add(60)].forEach(s => set.add(s));
  return set;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let inputPath = null;
  try {
    const { year, days } = req.body;
    const targetYear = parseInt(year, 10);
    const holidays = getHolidaySet(targetYear);
    
    // Mapear apenas o texto da equipa (sem cores do front)
    const teamMap = {};
    days.forEach(d => { teamMap[`${d.month}-${d.day}`] = d.team; });

    const templateRes = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateRes.arrayBuffer());
    const ws = workbook.worksheets[0];

    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${targetYear}`;

    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_COLS[mi];
      const daysInMonth = new Date(targetYear, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = 11 + (day - 1);
        const cellDay = ws.getCell(row, startCol);
        const cellWd = ws.getCell(row, startCol + 1);
        const cellTeam = ws.getCell(row, startCol + 2);

        if (day > daysInMonth) {
          [cellDay, cellWd, cellTeam].forEach(c => {
            c.value = null;
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EMPTY } };
            c.border = null;
          });
          continue;
        }

        const date = new Date(Date.UTC(targetYear, mi, day));
        const wd = date.getUTCDay();
        const isHoliday = holidays.has(`${month}-${day}`);
        const isWeekend = (wd === 0 || wd === 6);

        let bg = COLOR.WHITE;
        if (isHoliday) bg = COLOR.HOLIDAY;
        else if (isWeekend) bg = COLOR.WEEKEND;

        cellDay.value = String(day).padStart(2, "0");
        cellWd.value = WEEKDAY_NAMES[wd];
        cellTeam.value = teamMap[`${month}-${day}`] || "";

        // Aplicar estilo e cores (Apenas Feriados e Fins de Semana)
        [cellDay, cellWd, cellTeam].forEach(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          c.alignment = { horizontal: "center", vertical: "middle" };
          c.font = { name: 'Arial', size: 8, color: { argb: "FF000000" } };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
          };
        });
      }
    }

    ws.pageSetup = {
      orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.2, right: 0.2, top: 0.4, bottom: 0.2, header: 0, footer: 0 }
    };

    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `eip_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputPath);

    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputPath), mimeType: MimeType.XLSX });
    const job = new CreatePDFJob({ inputAsset });
    const result = await pdfServices.getJobResult({ 
      pollingURL: await pdfServices.submit({ job }), 
      resultType: CreatePDFResult 
    });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (const chunk of streamAsset.readStream) chunks.push(chunk);
    fs.unlinkSync(inputPath);

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    return res.status(500).json({ error: error.message });
  }
}
