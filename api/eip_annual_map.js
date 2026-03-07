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
  EIP01_BG: "FFDBEAFE",
  EIP01_TEXT: "FF1D4ED8",
  EIP02_BG: "FFDCFCE7",
  EIP02_TEXT: "FF15803D",
  HOLIDAY: "FFF7C6C7", // Rosa
  WEEKEND: "FFF9E0B0", // Amarelo
  EMPTY: "FFF8FAFC",
  WHITE: "FFFFFFFF",
};

const MONTH_START_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const ROW_START = 11;

// ─── A TUA LÓGICA DE DATAS (IGUAL ÀS ESCALAS) ────────────────────────────────
function atNoonLocal(y, mIndex, d) {
  return new Date(y, mIndex, d, 12, 0, 0, 0);
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

function getPortugalHolidays(y) {
  const fixed = [
    {month: 1, day: 1, name: "Ano Novo"}, {month: 4, day: 25, name: "Dia da Liberdade"}, {month: 5, day: 1, name: "Dia do Trabalhador"},
    {month: 6, day: 10, name: "Dia de Portugal"}, {month: 8, day: 15, name: "Assunção de Nossa Senhora"}, {month: 9, day: 7, name: "Dia da Cidade de Faro"},
    {month: 10, day: 5, name: "Implantação da República"}, {month: 11, day: 1, name: "Todos os Santos"}, {month: 12, day: 1, name: "Restauração da Independência"},
    {month: 12, day: 8, name: "Imaculada Conceição"}, {month: 12, day: 25, name: "Natal"},
  ];
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451), emonth = Math.floor((h + l - 7 * m + 114) / 31), eday = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = atNoonLocal(y, emonth - 1, eday);
  const mobile = [
    {date: addDays(easter, -47), name: "Carnaval", optional: true},
    {date: addDays(easter, -2), name: "Sexta-feira Santa", optional: false},
    {date: easter, name: "Páscoa", optional: false},
    {date: addDays(easter, 60), name: "Corpo de Deus", optional: false},
  ];
  const fixedDates = fixed.map((x) => ({ date: atNoonLocal(y, x.month - 1, x.day), name: x.name, optional: false }));
  return [...fixedDates, ...mobile];
}

function getHolidaySet(y) {
  const holidays = getPortugalHolidays(y);
  const set = new Set();
  holidays.forEach(h => {
    // Apenas feriados não opcionais (ou conforme a tua regra)
    if(!h.optional) set.add(`${h.date.getMonth() + 1}-${h.date.getDate()}`);
  });
  return set;
}

// ─── HANDLER ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let inputPath = null;
  try {
    const { year, days } = req.body;
    const eipMap = {};
    days.forEach(d => { eipMap[`${d.month}-${d.day}`] = d.team; });
    const holidaysSet = getHolidaySet(year);

    const templateRes = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateRes.arrayBuffer());
    const ws = workbook.worksheets[0];

    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${year}`;

    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_START_COLS[mi];
      const daysInMonth = new Date(year, month, 0).getDate();

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

        // Criar a data exatamente como na tua lógica de sucesso
        const currentDt = atNoonLocal(year, mi, day);
        const wdIndex = currentDt.getDay();
        const isWeekend = (wdIndex === 0 || wdIndex === 6);
        const isHoliday = holidaysSet.has(`${month}-${day}`);
        const team = eipMap[`${month}-${day}`] || "";

        let currentBg = COLOR.WHITE;
        if (isHoliday) currentBg = COLOR.HOLIDAY;
        else if (isWeekend) currentBg = COLOR.WEEKEND;

        // Escrita
        cellDay.value = String(day).padStart(2, "0");
        cellWd.value = WEEKDAY_NAMES[wdIndex];
        cellTeam.value = team;

        // Estilos (Lógica das escalas)
        [cellDay, cellWd, cellTeam].forEach(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: currentBg } };
          c.alignment = { horizontal: "center", vertical: "middle" };
          c.font = { name: 'Arial', size: 8, bold: (c === cellDay) };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
          };
        });

        // Pintar a Equipa (EIP-01/EIP-02)
        if (team === "EIP-01") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP01_BG } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP01_TEXT } };
        } else if (team === "EIP-02") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP02_BG } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP02_TEXT } };
        }
      }
    }

    // Configurações de página (landscape)
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
    const pollingURL = await pdfServices.submit({ job });
    const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (const chunk of streamAsset.readStream) chunks.push(chunk);
    fs.unlinkSync(inputPath);

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
