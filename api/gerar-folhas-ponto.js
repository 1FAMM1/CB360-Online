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

const TEMPLATE_URL =
  "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  let xlsxPath = null;

  try {
    const { year, month, employee, workingHours } = req.body;

    if (!year || !month || !employee) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    if (!process.env.ADOBE_CLIENT_ID || !process.env.ADOBE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Chaves da Adobe não configuradas." });
    }

    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const templateResponse = await fetch(TEMPLATE_URL);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // --- CORES (mesmas da tua lógica principal) ---
    const WEEKEND_COLOR = "F9E0B0";           // Bege FDS
    const HOLIDAY_COLOR = "F7C6C7";           // Rosa feriado obrigatório
    const HOLIDAY_OPTIONAL_COLOR = "D6ECFF";  // Azul feriado facultativo (Carnaval)
    const DRIVER_BG = "FF69B4";               // Rosa driver (texto PRETO)
    const FE_BG = "00B0F0";                   // Azul FE (texto PRETO)

    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const daysInMonth = new Date(year, month, 0).getDate();

    // --- FUNÇÕES DE ESTILO ---
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

    function isDarkHex(hex6) {
      const h = normalizeHex6(hex6);
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b < 150;
    }

    // --- FERIADOS PT (inclui Páscoa + facultativo Carnaval) ---
    function getPortugalHolidays(y) {
      const fixed = [
        { m: 1, d: 1, optional: false },   // Ano Novo
        { m: 4, d: 25, optional: false },  // 25 Abril
        { m: 5, d: 1, optional: false },   // 1 Maio
        { m: 6, d: 10, optional: false },  // 10 Junho
        { m: 8, d: 15, optional: false },  // 15 Agosto
        { m: 9, d: 7, optional: false },   // Faro (se quiseres aqui)
        { m: 10, d: 5, optional: false },  // 5 Outubro
        { m: 11, d: 1, optional: false },  // 1 Novembro
        { m: 12, d: 1, optional: false },  // 1 Dezembro
        { m: 12, d: 8, optional: false },  // 8 Dezembro
        { m: 12, d: 25, optional: false }, // Natal
      ];

      // Algoritmo Páscoa
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
      const monthE = Math.floor((h + l - 7 * m + 114) / 31);
      const dayE = ((h + l - 7 * m + 114) % 31) + 1;

      const easter = new Date(y, monthE - 1, dayE, 12, 0, 0);

      const add = (base, ds) => {
        const nd = new Date(base);
        nd.setDate(nd.getDate() + ds);
        return nd;
      };

      const mobile = [
        { dt: add(easter, -47), optional: true },  // Carnaval (FACULTATIVO)
        { dt: add(easter, -2), optional: false },  // Sexta-Feira Santa
        { dt: easter, optional: false },           // Páscoa
        { dt: add(easter, 60), optional: false },  // Corpo de Deus
      ];

      const map = new Map();
      fixed.forEach((f) => map.set(`${y}-${f.m}-${f.d}`, { optional: f.optional }));
      mobile.forEach((x) =>
        map.set(`${x.dt.getFullYear()}-${x.dt.getMonth() + 1}-${x.dt.getDate()}`, {
          optional: x.optional,
        })
      );

      return map; // key -> { optional }
    }

    const holidaysMap = getPortugalHolidays(year);

    // --- CABEÇALHO ---
    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours ?? "";
    worksheet.getCell("L44").value = employee.total || 0;

    // --- PREENCHIMENTO ---
    for (let d = 1; d <= 31; d++) {
      const row = 11 + d;
      const rowObj = worksheet.getRow(row);

      const cellDia = worksheet.getCell(row, 2);
      const cellSemana = worksheet.getCell(row, 3);
      const cellTurno = worksheet.getCell(row, 4);

      breakStyle(cellDia);
      breakStyle(cellSemana);
      breakStyle(cellTurno);

      if (d <= daysInMonth) {
        rowObj.hidden = false;

        const date = new Date(year, month - 1, d, 12, 0, 0);
        const wDay = date.getDay();
        const isWeekend = wDay === 0 || wDay === 6;

        const hKey = `${year}-${month}-${d}`;
        const holidayInfo = holidaysMap.get(hKey); // {optional} ou undefined

        cellDia.value = d;
        cellSemana.value = WEEKDAY_NAMES[wDay];
        cellTurno.value = employee.shifts?.[d - 1] || "";

        // 1) PINTAR DIA + SEMANA (Feriados/FDS)
        let dateBg = null;
        if (holidayInfo) {
          dateBg = holidayInfo.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
        } else if (isWeekend) {
          dateBg = WEEKEND_COLOR;
        }

        if (dateBg) {
          [cellDia, cellSemana].forEach((c) => {
            c.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF" + dateBg },
            };
            c.font = { bold: true, color: { argb: "FF000000" } };
          });
        }

        // 2) PINTAR TURNO (cor vem do Frontend)
        const bgHex = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");
        cellTurno.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF" + bgHex },
        };

        // Texto preto sempre em DRIVER e FE
        let fontColor;
        if (bgHex === normalizeHex6(DRIVER_BG) || bgHex === normalizeHex6(FE_BG)) {
          fontColor = "FF000000";
        } else {
          fontColor = isDarkHex(bgHex) ? "FFFFFFFF" : "FF000000";
        }

        cellTurno.font = { bold: true, color: { argb: fontColor } };

        // Alinhamento
        [cellDia, cellSemana, cellTurno].forEach((c) => {
          c.alignment = { horizontal: "center", vertical: "middle" };
        });
      } else {
        // Oculta linhas de dias inexistentes (ex: 31 Abril)
        rowObj.hidden = true;
      }
    }

    // --- Converter para PDF ---
    const tempDir = os.tmpdir();
    xlsxPath = path.join(tempDir, `stitch_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(xlsxPath);

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(xlsxPath),
      mimeType: MimeType.XLSX,
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });

    const result = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult,
    });

    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (const chunk of streamAsset.readStream) chunks.push(chunk);

    // limpar tmp
    try {
      if (xlsxPath && fs.existsSync(xlsxPath)) fs.unlinkSync(xlsxPath);
    } catch {}

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));
  } catch (error) {
    try {
      if (xlsxPath && fs.existsSync(xlsxPath)) fs.unlinkSync(xlsxPath);
    } catch {}
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
