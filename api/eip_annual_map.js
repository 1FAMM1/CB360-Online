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

const COLOR = {
  EIP01_BG: "FFDBEAFE", EIP01_TEXT: "FF1D4ED8",
  EIP02_BG: "FFDCFCE7", EIP02_TEXT: "FF15803D",
  HOLIDAY: "FFF7C6C7", WEEKEND: "FFF9E0B0",
  EMPTY: "FFF8FAFC", WHITE: "FFFFFFFF"
};

const MONTH_START_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

// --- CÁLCULO DE FERIADOS (IGUAL AO TEU FRONT QUE FUNCIONA) ---
function getPortugalHolidays(y) {
  const year = Number(y);
  const atNoon = (m, d) => new Date(year, m - 1, d, 12, 0, 0);
  const addDays = (base, n) => {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d;
  };

  const fixed = [
    {m:1, d:1}, {m:4, d:25}, {m:5, d:1}, {m:6, d:10}, {m:8, d:15}, 
    {m:9, d:7}, {m:10, d:5}, {m:11, d:1}, {m:12, d:1}, {m:12, d:8}, {m:12, d:25}
  ];

  const a = year % 19, b = Math.floor(year / 100), c = year % 100,
        d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        em = Math.floor((h + l - 7 * m + 114) / 31),
        ed = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = atNoon(em, ed);
  const set = new Set();
  
  // Adicionar fixos
  fixed.forEach(f => set.add(`${f.m}-${f.d}`));
  // Adicionar móveis (Carnaval -47, Sexta Santa -2, Páscoa 0, Corpo Deus 60)
  [addDays(easter, -47), addDays(easter, -2), easter, addDays(easter, 60)].forEach(dt => {
    set.add(`${dt.getMonth() + 1}-${dt.getDate()}`);
  });
  
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
    const targetYear = Number(year);
    
    // Criar um mapa de equipas [mês-dia]: "EIP-01"
    const teamMap = {};
    days.forEach(d => { teamMap[`${d.month}-${d.day}`] = d.team; });
    
    const holidays = getPortugalHolidays(targetYear);

    const templateRes = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateRes.arrayBuffer());
    const ws = workbook.worksheets[0];

    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${targetYear}`;

    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_START_COLS[mi];
      const daysInMonth = new Date(targetYear, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = 11 + (day - 1);
        const cDay = ws.getCell(row, startCol);
        const cWd = ws.getCell(row, startCol + 1);
        const cTeam = ws.getCell(row, startCol + 2);

        if (day > daysInMonth) {
          [cDay, cWd, cTeam].forEach(c => {
            c.value = null;
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EMPTY } };
            c.border = null;
          });
          continue;
        }

        // Criar data com MEIO-DIA para não falhar fuso horário
        const date = new Date(targetYear, mi, day, 12, 0, 0);
        const wd = date.getDay();
        const team = teamMap[`${month}-${day}`] || "";
        const isHoliday = holidays.has(`${month}-${day}`);
        const isWeekend = (wd === 0 || wd === 6);

        let bg = COLOR.WHITE;
        if (isHoliday) bg = COLOR.HOLIDAY;
        else if (isWeekend) bg = COLOR.WEEKEND;

        cDay.value = String(day).padStart(2, "0");
        cWd.value = WEEKDAY_NAMES[wd];
        cTeam.value = team;

        [cDay, cWd, cTeam].forEach(c => {
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

        if (team === "EIP-01") {
          cTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP01_BG } };
          cTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP01_TEXT } };
        } else if (team === "EIP-02") {
          cTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP02_BG } };
          cTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP02_TEXT } };
        }
      }
    }

    // PDF Generation
    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `eip_${targetYear}_${Date.now()}.xlsx`);
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
