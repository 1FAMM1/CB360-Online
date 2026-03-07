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
  EIP01_BG:   "FFDBEAFE",
  EIP01_TEXT: "FF1D4ED8",
  EIP02_BG:   "FFDCFCE7",
  EIP02_TEXT: "FF15803D",
  HOLIDAY:    "FFF7C6C7",
  WEEKEND:    "FFF9E0B0",
  EMPTY:      "FFF8FAFC",
  WHITE:      "FFFFFFFF",
};

const MONTH_START_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const ROW_START = 11;

// --- Lógica de Feriados Robusta (Forçando o Ano) ---
function getHolidaySet(y) {
  const year = Number(y);
  const set = new Set();
  
  // Feriados Fixos
  const fixed = [[1,1],[4,25],[5,1],[6,10],[8,15],[9,7],[10,5],[11,1],[12,1],[12,8],[12,25]];
  fixed.forEach(([m, d]) => set.add(`${m}-${d}`));

  // Algoritmo de Butcher-Meeus (Páscoa)
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451), month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const easter = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const add = (base, n) => {
    const dt = new Date(base);
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt;
  };

  // Carnaval (-47), Sexta Santa (-2), Corpo de Deus (+60)
  [add(easter, -47), add(easter, -2), easter, add(easter, 60)].forEach(dt => {
    set.add(`${dt.getUTCMonth() + 1}-${dt.getUTCDate()}`);
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
    const eipMap = {};
    days.forEach(d => { eipMap[`${d.month}-${d.day}`] = d.team; });
    
    const holidaysSet = getHolidaySet(targetYear);

    const templateRes = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateRes.arrayBuffer());
    const ws = workbook.worksheets[0];

    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${targetYear}`;

    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_START_COLS[mi];
      // Dias no mês para o ano específico
      const daysInMonth = new Date(targetYear, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = ROW_START + (day - 1);
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

        // Cálculo do dia da semana (Domingo=0, Sábado=6)
        // Usamos meio-dia para evitar problemas de fuso horário
        const currentDt = new Date(targetYear, mi, day, 12, 0, 0);
        const wdIndex = currentDt.getDay();
        
        const isWeekend = (wdIndex === 0 || wdIndex === 6);
        const isHoliday = holidaysSet.has(`${month}-${day}`);
        const team = eipMap[`${month}-${day}`] || "";

        let currentBg = COLOR.WHITE;
        if (isHoliday) currentBg = COLOR.HOLIDAY;
        else if (isWeekend) currentBg = COLOR.WEEKEND;

        cellDay.value = String(day).padStart(2, "0");
        cellWd.value = WEEKDAY_NAMES[wdIndex];
        cellTeam.value = team;

        [cellDay, cellWd, cellTeam].forEach(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentBg } };
          c.alignment = { horizontal: "center", vertical: "middle" };
          c.font = { name: 'Arial', size: 8, bold: (c === cellDay), color: { argb: "FF000000" } };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
          };
        });

        if (team === "EIP-01") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP01_BG } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP01_TEXT } };
        } else if (team === "EIP-02") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP02_BG } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP02_TEXT } };
        }
      }
    }

    ws.pageSetup = {
      orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.2, right: 0.2, top: 0.4, bottom: 0.2, header: 0, footer: 0 }
    };

    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `eip_annual_${Date.now()}.xlsx`);
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
    res.setHeader("Content-Disposition", `attachment; filename="Mapa_Anual_EIP_${targetYear}.pdf"`);
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
