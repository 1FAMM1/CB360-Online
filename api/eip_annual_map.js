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
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/eip_annual_map_template.xlsx";

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

const MONTH_START_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const ROW_START = 11; 

// --- Helpers de Estilo ---
function setFill(cell, hex6) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + hex6 } };
}

function setFont(cell, hex6Text, bold = false) {
  cell.font = { name: 'Arial', size: 8, bold, color: { argb: "FF" + hex6Text } };
}

function setBorder(cell, remove = false) {
  if (remove) { cell.border = null; return; }
  const c = { style: "thin", color: { argb: "FFD1D1D1" } };
  cell.border = { top: c, left: c, bottom: c, right: c };
}

function centerAlign(cell) {
  cell.alignment = { horizontal: "center", vertical: "middle" };
}

// --- Cálculo de Feriados com Segurança UTC ---
function getPortugalHolidays(y) {
  const fixed = [{m:1,d:1},{m:4,d:25},{m:5,d:1},{m:6,d:10},{m:8,d:15},{m:10,d:5},{m:11,d:1},{m:12,d:1},{m:12,d:8},{m:12,d:25}];
  
  const a=y%19, b=Math.floor(y/100), c=y%100, d=Math.floor(b/4), e=b%4, f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30, i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451), em=Math.floor((h+l-7*m+114)/31), ed=((h+l-7*m+114)%31)+1;
  
  // Páscoa em UTC para comparação direta
  const easter = new Date(Date.UTC(y, em-1, ed));
  const add = (dt, n) => { const r = new Date(dt); r.setUTCDate(r.getUTCDate() + n); return r; };
  
  const mobile = [add(easter,-2), easter, add(easter,60)]; // Sexta-feira Santa, Páscoa, Corpo de Deus
  
  const set = new Set();
  fixed.forEach(h => set.add(`${h.m}-${h.d}`));
  mobile.forEach(dt => set.add(`${dt.getUTCMonth()+1}-${dt.getUTCDate()}`));
  return set;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  
  let inputPath = null;
  try {
    const { year, days } = req.body;
    const eipMap = {};
    days.forEach(d => { eipMap[`${d.month}-${d.day}`] = d.team; });
    const holidays = getPortugalHolidays(year);

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

        // Limpeza de dias que não existem no mês (ex: 31 de Abril)
        if (day > daysInMonth) {
          [cellDay, cellWd, cellTeam].forEach(c => {
            c.value = null;
            setFill(c, COLOR.EMPTY);
            setBorder(c, true);
          });
          continue;
        }

        // --- CÁLCULO UTC SEGURO ---
        const dateUTC = new Date(Date.UTC(year, mi, day));
        const wd = dateUTC.getUTCDay(); // 0-Dom, 1-Seg...
        const team = eipMap[`${month}-${day}`] || "";
        const isWeekend = (wd === 0 || wd === 6);
        const isHoliday = holidays.has(`${month}-${day}`);

        let bgColor = COLOR.WHITE;
        if (isHoliday) bgColor = COLOR.HOLIDAY;
        else if (isWeekend) bgColor = COLOR.WEEKEND;

        // Escrita
        cellDay.value = String(day).padStart(2, "0");
        cellWd.value = WEEKDAY_NAMES[wd];
        cellTeam.value = team;

        // Estilos
        [cellDay, cellWd, cellTeam].forEach(c => {
          setFill(c, bgColor);
          setFont(c, "000000", c === cellDay);
          setBorder(c);
          centerAlign(c);
        });

        if (team === "EIP-01") {
          setFill(cellTeam, COLOR.EIP01_BG);
          setFont(cellTeam, COLOR.EIP01_TEXT, true);
        } else if (team === "EIP-02") {
          setFill(cellTeam, COLOR.EIP02_BG);
          setFont(cellTeam, COLOR.EIP02_TEXT, true);
        }
      }
    }

    ws.pageSetup = {
      orientation: "landscape", paperSize: 9,
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      horizontalCentered: true,
      margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.25, header: 0, footer: 0 }
    };

    // Conversão PDF
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
    res.setHeader("Content-Disposition", `attachment; filename="Mapa_Anual_EIP_${year}.pdf"`);
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    if (inputPath && fs.existsSync(inputPath)) try { fs.unlinkSync(inputPath); } catch {}
    console.error("Erro EIP:", error);
    return res.status(500).json({ error: error.message });
  }
}
