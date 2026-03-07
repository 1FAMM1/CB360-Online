import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import {
  ServicePrincipalCredentials, PDFServices, MimeType,
  CreatePDFJob, CreatePDFResult, SDKError, ServiceUsageError, ServiceApiError
} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "5mb" } },
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/eip_annual_map_template.xlsx";

// ─── Colors ──────────────────────────────────────────────────────────────────
const COLOR = {
  EIP01_BG:   "DBEAFE",
  EIP01_TEXT: "1D4ED8",
  EIP02_BG:   "DCFCE7",
  EIP02_TEXT: "15803D",
  HOLIDAY:    "F7C6C7",
  WEEKEND:    "F9E0B0",
  EMPTY:      "F8FAFC",
  WHITE:      "FFFFFF",
};

// ─── Month start columns (1-based) ───────────────────────────────────────────
// Janeiro=B(2), Fevereiro=E(5), Março=H(8), Abril=K(11), Maio=N(14),
// Junho=Q(17), Julho=T(20), Agosto=W(23), Setembro=Z(26),
// Outubro=AC(29), Novembro=AF(32), Dezembro=AI(35)
const MONTH_START_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const ROW_START = 11; // day 1
const ROW_END   = 41; // day 31

// ─── Helpers ─────────────────────────────────────────────────────────────────
function setFill(cell, hex6) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + hex6 } };
}

function setFont(cell, hex6Text, bold = false) {
  cell.font = { ...(cell.font || {}), bold, color: { argb: "FF" + hex6Text } };
}

function setBorder(cell) {
  const c = { style: "thin", color: { argb: "FFD1D1D1" } };
  cell.border = { top: c, left: c, bottom: c, right: c };
}

function centerAlign(cell) {
  cell.alignment = { horizontal: "center", vertical: "middle" };
}

function getPortugalHolidays(y) {
  const fixed = [
    [1,1],[4,25],[5,1],[6,10],[8,15],[9,7],[10,5],[11,1],[12,1],[12,8],[12,25]
  ];
  const a = y%19, b = Math.floor(y/100), c = y%100;
  const d = Math.floor(b/4), e = b%4;
  const f = Math.floor((b+8)/25), g = Math.floor((b-f+1)/3);
  const h = (19*a+b-d-g+15)%30;
  const i = Math.floor(c/4), k = c%4, l = (32+2*e+2*i-h-k)%7;
  const m = Math.floor((a+11*h+22*l)/451);
  const eMonth = Math.floor((h+l-7*m+114)/31);
  const eDay   = ((h+l-7*m+114)%31)+1;
  const easter = new Date(y, eMonth-1, eDay, 12);
  const addD = (dt, n) => { const r = new Date(dt); r.setDate(r.getDate()+n); return r; };
  const set = new Set();
  fixed.forEach(([mo, dy]) => set.add(`${mo}-${dy}`));
  [addD(easter,-2), easter, addD(easter,60)].forEach(dt =>
    set.add(`${dt.getMonth()+1}-${dt.getDate()}`)
  );
  return set;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  let inputPath = null;

  try {
    const { year, days, format = "pdf" } = req.body;
    // days: array of { month, day, team } — all 365/366 days

    if (!year || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: "Dados incompletos. Necessário: year, days[]" });
    }

    if (format === "pdf" && (!CLIENT_ID || !CLIENT_SECRET)) {
      return res.status(500).json({ error: "Chaves Adobe não configuradas" });
    }

    // Build lookup map: "month-day" -> team
    const eipMap = {};
    days.forEach(({ month, day, team }) => { eipMap[`${month}-${day}`] = team; });

    const holidays = getPortugalHolidays(year);

    // Load template
    const templateRes = await fetch(TEMPLATE_URL);
    if (!templateRes.ok) throw new Error("Erro ao carregar template");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateRes.arrayBuffer());
    const ws = workbook.worksheets[0];

    // Set title
    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${year}`;

    // Fill data
    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_START_COLS[mi];
      const daysInMonth = new Date(year, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = ROW_START + (day - 1);
        const colDay  = startCol;
        const colWd   = startCol + 1;
        const colTeam = startCol + 2;

        const cellDay  = ws.getCell(row, colDay);
        const cellWd   = ws.getCell(row, colWd);
        const cellTeam = ws.getCell(row, colTeam);

        if (day > daysInMonth) {
          // Day doesn't exist in this month
          [cellDay, cellWd, cellTeam].forEach(c => {
            c.value = "";
            setFill(c, COLOR.EMPTY);
            setBorder(c);
            centerAlign(c);
          });
          continue;
        }

        const date = new Date(year, mi, day, 12);
        const wd = date.getDay();
        const isWeekend = wd === 0 || wd === 6;
        const isHoliday = holidays.has(`${month}-${day}`);
        const team = eipMap[`${month}-${day}`] || "";
        const isEIP01 = team === "EIP-01";
        const isEIP02 = team === "EIP-02";

        // Determine background
        let bgColor = COLOR.WHITE;
        if (isHoliday)      bgColor = COLOR.HOLIDAY;
        else if (isWeekend) bgColor = COLOR.WEEKEND;

        // Day cell
        cellDay.value = String(day).padStart(2, "0");
        setFill(cellDay, bgColor);
        setFont(cellDay, "000000", true);
        setBorder(cellDay);
        centerAlign(cellDay);

        // Weekday cell
        cellWd.value = WEEKDAY_NAMES[wd];
        setFill(cellWd, bgColor);
        setFont(cellWd, "475569", false);
        setBorder(cellWd);
        centerAlign(cellWd);

        // Team cell — EIP color overrides weekend/holiday bg
        let teamBg   = bgColor;
        let teamText = "000000";
        if (isEIP01) { teamBg = COLOR.EIP01_BG; teamText = COLOR.EIP01_TEXT; }
        if (isEIP02) { teamBg = COLOR.EIP02_BG; teamText = COLOR.EIP02_TEXT; }

        cellTeam.value = team;
        setFill(cellTeam, teamBg);
        setFont(cellTeam, teamText, true);
        setBorder(cellTeam);
        centerAlign(cellTeam);
      }
    }

    // Page setup
    ws.pageSetup = {
      orientation: "landscape", paperSize: 9,
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      horizontalCentered: true,
      margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.25, header: 0, footer: 0 }
    };

    // Return XLSX
    if (format !== "pdf") {
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="EIP_Annual_Map_${year}.xlsx"`);
      return res.status(200).send(Buffer.from(buffer));
    }

    // Convert to PDF via Adobe
    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `eip_${year}_${Date.now()}.xlsx`);
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
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="EIP_Annual_Map_${year}.pdf"`);
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    if (inputPath && fs.existsSync(inputPath)) try { fs.unlinkSync(inputPath); } catch {}
    if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
      return res.status(500).json({ error: "Erro no serviço Adobe", details: error.message });
    }
    console.error("Erro EIP Annual Map:", error);
    return res.status(500).json({ error: error.message });
  }
}
