// /api/employees_unified.js

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
  SDKError,
  ServiceUsageError,
  ServiceApiError,
} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

const TEMPLATES = {
  escalas: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx",
  folha_ponto: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx"
};

// ========== FUNÇÕES PARTILHADAS ==========
const HOLIDAY_COLOR = "F7C6C7";
const HOLIDAY_OPTIONAL_COLOR = "D6ECFF";
const WEEKEND_COLOR = "F9E0B0";
const DRIVER_BG = "FF69B4";
const FE_BG = "00B0F0";

function breakStyle(cell) {
  cell.style = { ...(cell.style || {}) };
  if (cell.style.fill) cell.style.fill = { ...cell.style.fill };
  if (cell.style.font) cell.style.font = { ...cell.style.font };
  if (cell.style.alignment) cell.style.alignment = { ...cell.style.alignment };
  if (cell.style.border) cell.style.border = { ...cell.style.border };
}

function normalizeHex6(hex) {
  return String(hex || "FFFFFF").replace("#", "").toUpperCase().padStart(6, "0").slice(0, 6);
}

function setFill(cell, hex6) {
  breakStyle(cell);
  const h = normalizeHex6(hex6);
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + h } };
}

function isDarkHex(hex6) {
  const h = normalizeHex6(hex6);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 150;
}

function setFontKeepTemplate(cell, { bold = null, italic = false, bgHex = "FFFFFF", forceTextColor = null } = {}) {
  breakStyle(cell);
  const base = cell.font || {};
  const bg = normalizeHex6(bgHex);
  
  let colorArgb;
  if (bg === normalizeHex6(DRIVER_BG) || bg === normalizeHex6(FE_BG)) {
    colorArgb = "FF000000";
  } else if (forceTextColor) {
    colorArgb = forceTextColor.toUpperCase().startsWith("FF") ? forceTextColor : "FF" + forceTextColor;
  } else {
    const dark = isDarkHex(bg);
    colorArgb = dark ? "FFFFFFFF" : "FF000000";
  }

  cell.font = {
    ...base,
    ...(bold === null ? {} : { bold: !!bold }),
    italic: !!italic,
    color: { argb: colorArgb },
  };
}

function setBorder(cell) {
  breakStyle(cell);
  const c = { argb: "FFD1D1D1" };
  cell.border = {
    top: { style: "thin", color: c },
    left: { style: "thin", color: c },
    bottom: { style: "thin", color: c },
    right: { style: "thin", color: c },
  };
}

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
    { month: 1, day: 1, name: "Ano Novo" },
    { month: 4, day: 25, name: "Dia da Liberdade" },
    { month: 5, day: 1, name: "Dia do Trabalhador" },
    { month: 6, day: 10, name: "Dia de Portugal" },
    { month: 8, day: 15, name: "Assunção de Nossa Senhora" },
    { month: 9, day: 7, name: "Dia da Cidade de Faro" },
    { month: 10, day: 5, name: "Implantação da República" },
    { month: 11, day: 1, name: "Todos os Santos" },
    { month: 12, day: 1, name: "Restauração da Independência" },
    { month: 12, day: 8, name: "Imaculada Conceição" },
    { month: 12, day: 25, name: "Natal" },
  ];

  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const emonth = Math.floor((h + l - 7 * m + 114) / 31);
  const eday = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = atNoonLocal(y, emonth - 1, eday);

  const mobile = [
    { date: addDays(easter, -47), name: "Carnaval", optional: true },
    { date: addDays(easter, -2), name: "Sexta-feira Santa", optional: false },
    { date: easter, name: "Páscoa", optional: false },
    { date: addDays(easter, 60), name: "Corpo de Deus", optional: false },
  ];

  const fixedDates = fixed.map((x) => ({
    date: atNoonLocal(y, x.month - 1, x.day),
    name: x.name,
    optional: false,
  }));

  return [...fixedDates, ...mobile];
}

function getHolidayMapForMonth(y, mo) {
  const holidays = getPortugalHolidays(y);
  const map = new Map();
  holidays.forEach((h) => {
    const dt = h.date;
    if (dt.getFullYear() === y && dt.getMonth() === mo - 1) {
      map.set(dt.getDate(), { name: h.name, optional: !!h.optional });
    }
  });
  return map;
}

// ========== HANDLER PRINCIPAL ==========
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { mode } = req.body;

    if (!mode || !["escalas", "folha_ponto"].includes(mode)) {
      return res.status(400).json({ error: "Modo inválido. Use 'escalas' ou 'folha_ponto'" });
    }

    if (mode === "escalas") {
      return await handleEscalas(req, res);
    } else {
      return await handleFolhaPonto(req, res);
    }

  } catch (error) {
    if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
      return res.status(500).json({ error: "Erro no serviço Adobe", details: error.message });
    }
    return res.status(500).json({ error: "Erro ao processar", details: error?.message || String(error) });
  }
}

// ========== ESCALAS (MÚLTIPLOS FUNCIONÁRIOS) ==========
async function handleEscalas(req, res) {
  let inputFilePath = null;
  let outputFilePath = null;

  try {
    const { year, month, employees, workingHours, format = "xlsx" } = req.body;

    if (!year || !month || !employees || workingHours === undefined) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    if (format === "pdf" && (!CLIENT_ID || !CLIENT_SECRET)) {
      return res.status(500).json({ error: "Chaves Adobe não configuradas" });
    }

    const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

    const templateResponse = await fetch(TEMPLATES.escalas);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    if (workbook.worksheets.length === 0) throw new Error("Template sem worksheets");

    const worksheet = workbook.worksheets[0];

    function detectDayStartCol(ws) {
      const r = 11;
      for (let c = 1; c <= 150; c++) {
        const v = ws.getCell(r, c).value;
        if (v === 1 || v === "1") return c;
      }
      return 7;
    }

    const DAY_START_COL = detectDayStartCol(worksheet);
    worksheet.getCell("B7").value = `${MONTH_NAMES[month - 1]} ${year}`;
    worksheet.getCell("B65").value = `${workingHours} Horas`;

    const daysInMonth = new Date(year, month, 0).getDate();
    const holidayMap = getHolidayMapForMonth(year, month);

    for (let d = 1; d <= 31; d++) {
      const colIndex = DAY_START_COL + (d - 1);
      const cellWeek = worksheet.getCell(10, colIndex);
      const cellDay = worksheet.getCell(11, colIndex);
      breakStyle(cellWeek);
      breakStyle(cellDay);

      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const weekdayIndex = date.getDay();
        const weekday = WEEKDAY_NAMES[weekdayIndex];
        cellWeek.value = weekday;
        cellDay.value = d;

        const holiday = holidayMap.get(d);
        let headerBg = null;
        if (holiday) headerBg = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
        else if (weekdayIndex === 0 || weekdayIndex === 6) headerBg = WEEKEND_COLOR;

        if (headerBg) {
          setFill(cellWeek, headerBg);
          setFill(cellDay, headerBg);
          setFontKeepTemplate(cellWeek, { bold: true, italic: false, bgHex: headerBg });
          setFontKeepTemplate(cellDay, { bold: true, italic: false, bgHex: headerBg });
        } else {
          setFontKeepTemplate(cellWeek, { bold: true, italic: false, bgHex: "FFFFFF" });
          setFontKeepTemplate(cellDay, { bold: true, italic: false, bgHex: "FFFFFF" });
        }

        setBorder(cellWeek);
        setBorder(cellDay);
      } else {
        cellWeek.value = "";
        cellDay.value = "";
        setFontKeepTemplate(cellWeek, { bold: true, italic: false, bgHex: "FFFFFF" });
        setFontKeepTemplate(cellDay, { bold: true, italic: false, bgHex: "FFFFFF" });
        setBorder(cellWeek);
        setBorder(cellDay);
      }
    }

    for (let d = 1; d <= 31; d++) {
      const colIndex = DAY_START_COL + (d - 1);
      const col = worksheet.getColumn(colIndex);
      col.hidden = d > daysInMonth;
    }

    const GROUP_RANGES = {
      INEM: { start: 13, end: 32 },
      TDNU: { start: 34, end: 39 },
      OPC: { start: 41, end: 45 },
      EP1: { start: 47, end: 51 },
      EP2: { start: 53, end: 57 },
    };

    function normalizeTeam(t) {
      return String(t || "").trim().toUpperCase().replace(/\s+/g, "").replace(/[-_]/g, "");
    }

    function getGroupKey(teamRaw) {
      const t = normalizeTeam(teamRaw);
      if (t.startsWith("EQ")) return "INEM";
      if (t.startsWith("TDNU")) return "TDNU";
      if (t.startsWith("OPC")) return "OPC";
      if (t.startsWith("EP1") || t.startsWith("EP01") || t.startsWith("EIP1") || t.startsWith("EIP01")) return "EP1";
      if (t.startsWith("EP2") || t.startsWith("EP02") || t.startsWith("EIP2") || t.startsWith("EIP02")) return "EP2";
      return null;
    }

    function isValidEmployee(emp) {
      const n = String(emp?.n_int ?? "").trim();
      const team = String(emp?.team ?? "").trim();
      return /^\d+$/.test(n) && team.length > 0;
    }

    const byGroup = { INEM: [], TDNU: [], OPC: [], EP1: [], EP2: [] };
    (employees || []).filter(isValidEmployee).forEach((emp) => {
      const key = getGroupKey(emp.team);
      if (key) byGroup[key].push(emp);
    });

    function fillEmployeeAtRow(emp, excelRow) {
      worksheet.getRow(excelRow).hidden = false;
      const infoCols = [2, 3, 4, 5, 38];
      infoCols.forEach((col) => {
        const cell = worksheet.getCell(excelRow, col);
        breakStyle(cell);
        cell.value = col === 2 ? emp.n_int : col === 3 ? emp.abv_name : col === 4 ? emp.function : col === 5 ? emp.team : emp.total;
        setFill(cell, "FFFFFF");
        setFontKeepTemplate(cell, { bold: null, italic: false, bgHex: "FFFFFF" });
        setBorder(cell);
      });

      for (let d = 0; d < daysInMonth; d++) {
        const colIndex = DAY_START_COL + d;
        const cell = worksheet.getCell(excelRow, colIndex);
        breakStyle(cell);
        const turno = (emp.shifts?.[d] || "").toString();
        cell.value = turno;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        const bg = normalizeHex6(emp.cellColors?.[d] || "FFFFFF");
        setFill(cell, bg);
        setBorder(cell);
        setFontKeepTemplate(cell, { bold: true, italic: false, bgHex: bg });
      }

      infoCols.forEach((col) => setFill(worksheet.getCell(excelRow, col), "FFFFFF"));
    }

    function clearAndHideRow(excelRow) {
      const row = worksheet.getRow(excelRow);
      for (let col = 2; col <= 38; col++) {
        const cell = row.getCell(col);
        breakStyle(cell);
        cell.value = "";
        setFill(cell, "FFFFFF");
        setFontKeepTemplate(cell, { bold: null, italic: false, bgHex: "FFFFFF" });
        setBorder(cell);
      }
      row.hidden = true;
    }

    const ORDER = ["INEM", "TDNU", "OPC", "EP1", "EP2"];
    ORDER.forEach((key) => {
      const range = GROUP_RANGES[key];
      const list = byGroup[key] || [];
      const capacity = range.end - range.start + 1;
      const n = Math.min(list.length, capacity);
      for (let i = 0; i < n; i++) fillEmployeeAtRow(list[i], range.start + i);
      for (let i = n; i < capacity; i++) clearAndHideRow(range.start + i);
    });

    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: false,
      margins: { left: 0.1, right: 0.1, top: 0.15, bottom: 0.15, header: 0, footer: 0 },
    };

    if (format !== "pdf") {
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="Escala_Profissionais_${MONTH_NAMES[month - 1]}_${year}.xlsx"`);
      return res.status(200).send(Buffer.from(buffer));
    }

    const tempDir = os.tmpdir();
    inputFilePath = path.join(tempDir, `Escala_${month}_${year}_${Date.now()}.xlsx`);
    outputFilePath = path.join(tempDir, `Escala_${month}_${year}_${Date.now()}.pdf`);

    await workbook.xlsx.writeFile(inputFilePath);

    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType: MimeType.XLSX,
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult,
    });

    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    const writeStream = fs.createWriteStream(outputFilePath);
    streamAsset.readStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const pdfBuffer = fs.readFileSync(outputFilePath);

    try {
      if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
      if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    } catch {}

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Escala_Profissionais_${MONTH_NAMES[month - 1]}_${year}.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    try {
      if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
      if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    } catch {}
    throw error;
  }
}

// ========== FOLHA DE PONTO (1 FUNCIONÁRIO) ==========
async function handleFolhaPonto(req, res) {
  try {
    const { year, month, employee, workingHours } = req.body;

    if (!year || !month || !employee || workingHours === undefined) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const credentials = new ServicePrincipalCredentials({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const templateResponse = await fetch(TEMPLATES.folha_ponto);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const daysInMonth = new Date(year, month, 0).getDate();
    const holidays = getHolidayMapForMonth(year, month);

    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours;
    worksheet.getCell("L44").value = employee.total || 0;

    for (let d = 1; d <= 31; d++) {
      const row = 11 + d;
      const cellDia = worksheet.getCell(row, 2);
      const cellSemana = worksheet.getCell(row, 3);
      const cellTurno = worksheet.getCell(row, 4);

      breakStyle(cellDia);
      breakStyle(cellSemana);
      breakStyle(cellTurno);

      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const wDay = date.getDay();
        const isWeekend = (wDay === 0 || wDay === 6);
        const holiday = holidays.get(d);

        cellDia.value = d;
        cellSemana.value = WEEKDAY_NAMES[wDay];
        cellTurno.value = employee.shifts?.[d - 1] || "";

        let dateBg = null;
        if (holiday) {
          dateBg = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
        } else if (isWeekend) {
          dateBg = WEEKEND_COLOR;
        }

        if (dateBg) {
          setFill(cellDia, dateBg);
          setFill(cellSemana, dateBg);
          setFontKeepTemplate(cellDia, { bold: true, italic: false, bgHex: dateBg });
          setFontKeepTemplate(cellSemana, { bold: true, italic: false, bgHex: dateBg });
        }

        const bgHex = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");
        setFill(cellTurno, bgHex);
        setFontKeepTemplate(cellTurno, { bold: true, italic: false, bgHex: bgHex });

        [cellDia, cellSemana, cellTurno].forEach(c => {
          c.alignment = { horizontal: "center", vertical: "middle" };
        });

      } else {
        worksheet.getRow(row).hidden = true;
      }
    }

    const tempDir = os.tmpdir();
    const xlsxPath = path.join(tempDir, `f_${Date.now()}.xlsx`);
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
    throw error;
  }
}
