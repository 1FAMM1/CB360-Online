import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CreatePDFJob,
  CreatePDFResult,
} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "5mb" } },
};

const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { year, month, employee, workingHours } = req.body;

    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const templateResponse = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // --- FUNÇÕES DE AUXÍLIO ---
    function normalizeHex6(hex) {
      return String(hex || "FFFFFF").replace("#", "").toUpperCase().padStart(6, "0").slice(0, 6);
    }

    function isDarkHex(hex6) {
      const h = normalizeHex6(hex6);
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 150;
    }

    // --- LÓGICA DE FERIADOS (IGUAL À ESCALA) ---
    function getPortugalHolidays(y) {
      const fixed = [
        {m:1, d:1}, {m:4, d:25}, {m:5, d:1}, {m:6, d:10}, {m:8, d:15}, 
        {m:9, d:7}, {m:10, d:5}, {m:11, d:1}, {m:12, d:1}, {m:12, d:8}, {m:12, d:25}
      ];
      const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
            f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
            i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
            monthE = Math.floor((h + l - 7 * m + 114) / 31), dayE = ((h + l - 7 * m + 114) % 31) + 1;
      const easter = new Date(y, monthE - 1, dayE, 12, 0, 0);
      const add = (base, days) => { const nd = new Date(base); nd.setDate(nd.getDate() + days); return nd; };
      const mobile = [add(easter, -47), add(easter, -2), easter, add(easter, 60)];
      const holidaySet = new Set(fixed.map(f => `${y}-${f.m}-${f.d}`));
      mobile.forEach(dt => holidaySet.add(`${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}`));
      return holidaySet;
    }

    const holidays = getPortugalHolidays(year);
    const WEEKEND_COLOR = "F9E0B0";
    const HOLIDAY_COLOR = "F7C6C7";
    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const daysInMonth = new Date(year, month, 0).getDate();

    // --- PREENCHIMENTO DO CABEÇALHO ---
    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours;
    worksheet.getCell("L44").value = employee.total || 0;

    // --- PREENCHIMENTO DOS DIAS (LINHAS 12 A 42) ---
    for (let d = 1; d <= 31; d++) {
      const rowIdx = 11 + d;
      const row = worksheet.getRow(rowIdx);
      const cellDia = worksheet.getCell(rowIdx, 2);
      const cellDiaSemana = worksheet.getCell(rowIdx, 3);
      const cellTurno = worksheet.getCell(rowIdx, 4);
      const turno = employee.shifts?.[d - 1] || "";

      // 1. OCULTAR SE O DIA NÃO EXISTE OU SE O TURNO ESTÁ VAZIO
      if (d > daysInMonth || turno === "") {
        row.hidden = true;
        continue;
      }

      row.hidden = false;
      const date = new Date(year, month - 1, d, 12, 0, 0);
      const wDay = date.getDay();
      const isWeekend = (wDay === 0 || wDay === 6);
      const isHoliday = holidays.has(`${year}-${month}-${d}`);

      // Preencher valores
      cellDia.value = d;
      cellDiaSemana.value = WEEKDAY_NAMES[wDay];
      cellTurno.value = turno;

      // 2. PINTAR DIA E DIA DA SEMANA (Feriados ou Fim de Semana)
      let dateBg = null;
      if (isHoliday) dateBg = HOLIDAY_COLOR;
      else if (isWeekend) dateBg = WEEKEND_COLOR;

      if (dateBg) {
        [cellDia, cellDiaSemana].forEach(cell => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + dateBg } };
          cell.font = { bold: true, color: { argb: "FF000000" } };
        });
      }

      // 3. PINTAR TURNO (Cor que vem do Frontend)
      const shiftBg = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");
      cellTurno.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + shiftBg } };
      cellTurno.font = { 
        bold: true, 
        color: { argb: isDarkHex(shiftBg) ? "FFFFFFFF" : "FF000000" } 
      };

      // Bordas e Alinhamento
      [cellDia, cellDiaSemana, cellTurno].forEach(c => {
        c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        c.alignment = { horizontal: "center", vertical: "middle" };
      });
    }

    // --- GERAR PDF ---
    const tempDir = os.tmpdir();
    const xlsxPath = path.join(tempDir, `folha_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(xlsxPath);

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(xlsxPath),
      mimeType: MimeType.XLSX,
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });
    
    const chunks = [];
    for await (let chunk of streamAsset.readStream) { chunks.push(chunk); }
    fs.unlinkSync(xlsxPath);

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
