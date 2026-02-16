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

    // --- CONSTANTES ---
    const HOLIDAY_COLOR = "F7C6C7"; // Rosa (feriados obrigatórios)
    const HOLIDAY_OPTIONAL_COLOR = "D6ECFF"; // Azul claro (Carnaval)
    const WEEKEND_COLOR = "F9E0B0"; // Bege
    const DRIVER_BG = "FF69B4"; // Rosa motoristas
    const FE_BG = "00B0F0"; // Azul férias

    // --- FUNÇÕES DE ESTILO ---
    function breakStyle(cell) {
      cell.style = { ...(cell.style || {}) };
      if (cell.style.fill) cell.style.fill = { ...cell.style.fill };
      if (cell.style.font) cell.style.font = { ...cell.style.font };
    }

    function normalizeHex6(hex) {
      return String(hex || "FFFFFF").replace("#", "").toUpperCase().padStart(6, "0").slice(0, 6);
    }

    function isDarkHex(hex6) {
      const h = normalizeHex6(hex6);
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 150;
    }

    function setFill(cell, hex6) {
      breakStyle(cell);
      const h = normalizeHex6(hex6);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + h } };
    }

    function setFontKeepTemplate(cell, { bold = null, italic = false, bgHex = "FFFFFF" } = {}) {
      breakStyle(cell);
      const base = cell.font || {};
      const bg = normalizeHex6(bgHex);
      
      let colorArgb;
      // ✨ DRIVER e FE sempre PRETO
      if (bg === normalizeHex6(DRIVER_BG) || bg === normalizeHex6(FE_BG)) {
        colorArgb = "FF000000";
      } else {
        // Outros: automático baseado na luminância
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

    // --- LÓGICA DE FERIADOS PORTUGAL ---
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
        { month: 10, day: 5, name: "Implantação da República" },
        { month: 11, day: 1, name: "Todos os Santos" },
        { month: 12, day: 1, name: "Restauração da Independência" },
        { month: 12, day: 8, name: "Imaculada Conceição" },
        { month: 12, day: 25, name: "Natal" },
      ];

      // Cálculo da Páscoa
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
        { date: addDays(easter, -47), name: "Carnaval", optional: true }, // ✨ CARNAVAL OPCIONAL
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

    const holidays = getHolidayMapForMonth(year, month);
    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const daysInMonth = new Date(year, month, 0).getDate();

    // --- CABEÇALHO ---
    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours;
    worksheet.getCell("L44").value = employee.total || 0;

    // --- PREENCHIMENTO ---
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

        // 1. PINTAR DIA E SEMANA (Feriados e Fins de Semana)
        let dateBg = null;
        if (holiday) {
          // ✨ CARNAVAL = Azul claro, outros feriados = Rosa
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

        // 2. PINTAR TURNO (Cor do Frontend)
        const bgHex = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");
        setFill(cellTurno, bgHex);
        setFontKeepTemplate(cellTurno, { bold: true, italic: false, bgHex: bgHex });

        // Alinhamento
        [cellDia, cellSemana, cellTurno].forEach(c => {
          c.alignment = { horizontal: "center", vertical: "middle" };
        });

      } else {
        // Oculta linhas de dias inexistentes
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
    return res.status(500).json({ error: error.message });
  }
}
