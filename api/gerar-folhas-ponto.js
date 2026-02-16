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
  api: { bodyParser: { sizeLimit: "5mb" } },
};

const TEMPLATE_URL =
  "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx";

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: "Erro: Chaves da Adobe não configuradas." });
  }

  let xlsxPath = null;

  try {
    const { year, month, employee, workingHours } = req.body;
    if (!year || !month || !employee) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // ===== CORES (iguais ao módulo 01) =====
    const WEEKEND_COLOR = "F9E0B0";
    const HOLIDAY_COLOR = "F7C6C7";
    const HOLIDAY_OPTIONAL_COLOR = "D6ECFF";
    const DRIVER_BG = "FF69B4";
    const FE_BG = "00B0F0";

    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // ===== Helpers (iguais ao módulo 01) =====
    function breakStyle(cell) {
      cell.style = { ...(cell.style || {}) };
      if (cell.style.fill) cell.style.fill = { ...cell.style.fill };
      if (cell.style.font) cell.style.font = { ...cell.style.font };
      if (cell.style.alignment) cell.style.alignment = { ...cell.style.alignment };
      if (cell.style.border) cell.style.border = { ...cell.style.border };
    }

    function normalizeHex6(hex) {
      return String(hex || "FFFFFF")
        .replace("#", "")
        .toUpperCase()
        .padStart(6, "0")
        .slice(0, 6);
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

    function setFontKeepTemplate(cell, { bold = null, italic = false, bgHex = "FFFFFF" } = {}) {
      breakStyle(cell);
      const base = cell.font || {};
      const bg = normalizeHex6(bgHex);

      let colorArgb;
      if (bg === normalizeHex6(DRIVER_BG) || bg === normalizeHex6(FE_BG)) {
        colorArgb = "FF000000"; // força preto
      } else {
        colorArgb = isDarkHex(bg) ? "FFFFFFFF" : "FF000000";
      }

      cell.font = {
        ...base,
        ...(bold === null ? {} : { bold: !!bold }),
        italic: !!italic,
        color: { argb: colorArgb },
      };
    }

    // ===== Feriados PT (com facultativo) =====
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
        { month: 1, day: 1, name: "Ano Novo", optional: false },
        { month: 4, day: 25, name: "Dia da Liberdade", optional: false },
        { month: 5, day: 1, name: "Dia do Trabalhador", optional: false },
        { month: 6, day: 10, name: "Dia de Portugal", optional: false },
        { month: 8, day: 15, name: "Assunção de Nossa Senhora", optional: false },
        { month: 9, day: 7, name: "Dia da Cidade de Faro", optional: false },
        { month: 10, day: 5, name: "Implantação da República", optional: false },
        { month: 11, day: 1, name: "Todos os Santos", optional: false },
        { month: 12, day: 1, name: "Restauração da Independência", optional: false },
        { month: 12, day: 8, name: "Imaculada Conceição", optional: false },
        { month: 12, day: 25, name: "Natal", optional: false },
      ];

      // Algoritmo da Páscoa
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
        optional: !!x.optional,
      }));

      return [...fixedDates, ...mobile];
    }

    function getHolidayMapForMonth(y, mo) {
      const holidays = getPortugalHolidays(y);
      const map = new Map(); // day -> { optional }
      holidays.forEach((h) => {
        const dt = h.date;
        if (dt.getFullYear() === y && dt.getMonth() === mo - 1) {
          map.set(dt.getDate(), { optional: !!h.optional });
        }
      });
      return map;
    }

    // ===== Load template =====
    const templateResponse = await fetch(TEMPLATE_URL);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // Cabeçalho (igual ao teu)
    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours ?? "";
    worksheet.getCell("L44").value = employee.total || 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    const holidayMap = getHolidayMapForMonth(year, month);

    // --- PREENCHIMENTO ---
    for (let d = 1; d <= 31; d++) {
      const row = 11 + d;

      const cellDia = worksheet.getCell(row, 2);    // B
      const cellSemana = worksheet.getCell(row, 3); // C
      const cellTurno = worksheet.getCell(row, 4);  // D

      breakStyle(cellDia);
      breakStyle(cellSemana);
      breakStyle(cellTurno);

      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const wDay = date.getDay();
        const isWeekend = wDay === 0 || wDay === 6;

        cellDia.value = d;
        cellSemana.value = WEEKDAY_NAMES[wDay];
        cellTurno.value = employee.shifts?.[d - 1] || "";

        // 1) Dia/Semana: feriados (obrigatório/facultativo) e fds
        const holiday = holidayMap.get(d);
        let dateBg = null;

        if (holiday) dateBg = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
        else if (isWeekend) dateBg = WEEKEND_COLOR;

        if (dateBg) {
          setFill(cellDia, dateBg);
          setFill(cellSemana, dateBg);
          setFontKeepTemplate(cellDia, { bold: true, bgHex: dateBg });
          setFontKeepTemplate(cellSemana, { bold: true, bgHex: dateBg });
        } else {
          // mantém normal, mas garante bold/legível se o template exigir
          setFontKeepTemplate(cellDia, { bold: true, bgHex: "FFFFFF" });
          setFontKeepTemplate(cellSemana, { bold: true, bgHex: "FFFFFF" });
        }

        // 2) Turno: cor vem do frontend
        //    + se for driver no payload, forçamos fundo rosa driver
        let bg = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");

        const isDriver =
          !!(employee.drivers && employee.drivers[d - 1]) ||
          !!(employee.is_driver && employee.is_driver[d - 1]);

        if (isDriver) bg = DRIVER_BG;

        setFill(cellTurno, bg);
        setFontKeepTemplate(cellTurno, { bold: true, bgHex: bg });

        // alinhamento
        [cellDia, cellSemana, cellTurno].forEach((c) => {
          breakStyle(c);
          c.alignment = { horizontal: "center", vertical: "middle" };
        });
      } else {
        worksheet.getRow(row).hidden = true;
      }
    }

    // ===== XLSX temp -> PDF =====
    const tempDir = os.tmpdir();
    xlsxPath = path.join(tempDir, `stitch_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(xlsxPath);

    const credentials = new ServicePrincipalCredentials({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(xlsxPath),
      mimeType: MimeType.XLSX,
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (const chunk of streamAsset.readStream) chunks.push(chunk);

    try {
      if (xlsxPath && fs.existsSync(xlsxPath)) fs.unlinkSync(xlsxPath);
    } catch {}

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));
  } catch (error) {
    try {
      if (xlsxPath && fs.existsSync(xlsxPath)) fs.unlinkSync(xlsxPath);
    } catch {}

    if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
      return res.status(500).json({ error: "Erro no serviço Adobe PDF Services", details: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}
