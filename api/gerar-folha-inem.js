// /api/gerar-folha-inem.js
import ExcelJS from "exceljs";
import fetch from "node-fetch";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { year, month, employees, workingHours } = req.body;

    if (!year || !month || !employees || workingHours === undefined || workingHours === null) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const MONTH_NAMES = [
      "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
      "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
    ];
    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // (sem Páscoa / sem feriados no backend)
    const WEEKEND_COLOR = "F9E0B0"; // cor do cabeçalho para sáb/dom (se quiseres)

    const DRIVER_BG = "FF69B4"; // motorista (rosa)
    const BORDER_COLOR = { argb: "FFBFBFBF" };

    // ===== Helpers (fix style shared do template) =====
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

    // ✅ Mantém o tipo de letra do TEMPLATE:
    // só altera bold/italic/cor, preservando name/size/etc.
    function setFontKeepTemplate(cell, { bold = null, italic = false, bgHex = "FFFFFF" } = {}) {
      breakStyle(cell);
      const base = cell.font || {};
      const dark = isDarkHex(bgHex);
      cell.font = {
        ...base,
        ...(bold === null ? {} : { bold: !!bold }),
        italic: !!italic, // nós passamos sempre false
        color: { argb: dark ? "FFFFFFFF" : "FF000000" },
      };
    }

    // ✅ Bordas #BFBFBF
    function setBorder(cell) {
      breakStyle(cell);
      cell.border = {
        top: { style: "thin", color: BORDER_COLOR },
        left: { style: "thin", color: BORDER_COLOR },
        bottom: { style: "thin", color: BORDER_COLOR },
        right: { style: "thin", color: BORDER_COLOR },
      };
    }

    // 1) Buscar template
    const templateUrl =
      "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    if (workbook.worksheets.length === 0) throw new Error("Template não tem worksheets");

    const worksheet = workbook.worksheets[0];

    // Detecta a coluna real onde começa o dia 1 (linha 11 do template)
    function detectDayStartCol(ws) {
      const r = 11;
      for (let c = 1; c <= 150; c++) {
        const v = ws.getCell(r, c).value;
        if (v === 1 || v === "1") return c;
      }
      return 7; // fallback
    }
    const DAY_START_COL = detectDayStartCol(worksheet);

    // 2) Cabeçalho
    worksheet.getCell("B7").value = `${MONTH_NAMES[month - 1]} ${year}`;
    worksheet.getCell("B68").value = workingHours;

    // 3) Dias do mês (cabeçalhos) — sem feriados no backend
    const daysInMonth = new Date(year, month, 0).getDate();

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

        // Se quiseres a API a pintar sáb/dom no cabeçalho:
        let headerBg = null;
        if (weekdayIndex === 0 || weekdayIndex === 6) headerBg = WEEKEND_COLOR;

        if (headerBg) {
          setFill(cellWeek, headerBg);
          setFill(cellDay, headerBg);
          setFontKeepTemplate(cellWeek, { bold: true, italic: false, bgHex: headerBg });
          setFontKeepTemplate(cellDay, { bold: true, italic: false, bgHex: headerBg });
        } else {
          // garante NÃO itálico (mantém fonte do template)
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

    // 4) Funcionários (até 20)
    const maxEmployees = Math.min(employees.length, 20);

    for (let idx = 0; idx < maxEmployees; idx++) {
      const emp = employees[idx];
      const excelRow = 13 + idx;

      // Info (B,C,D,E,AL) brancas
      const infoCols = [2, 3, 4, 5, 38];
      infoCols.forEach((col) => {
        const cell = worksheet.getCell(excelRow, col);
        breakStyle(cell);

        cell.value =
          col === 2 ? emp.n_int :
          col === 3 ? emp.abv_name :
          col === 4 ? emp.function :
          col === 5 ? emp.team :
          emp.total;

        setFill(cell, "FFFFFF");
        setFontKeepTemplate(cell, { bold: null, italic: false, bgHex: "FFFFFF" });
        setBorder(cell);
      });

      // Turnos (coluna do dia 1 em diante)
      for (let d = 0; d < daysInMonth; d++) {
        const colIndex = DAY_START_COL + d;
        const cell = worksheet.getCell(excelRow, colIndex);

        breakStyle(cell);

        const turno = (emp.shifts?.[d] || "").toString();
        cell.value = turno;
        cell.alignment = { horizontal: "center", vertical: "middle" };

        // cor final vem do frontend (inclui turnos/fds/feriados)
        let bg = normalizeHex6(emp.cellColors?.[d] || "FFFFFF");

        // se vier drivers, força rosa motorista
        const isDriver = !!(emp.drivers && emp.drivers[d]);
        if (isDriver) bg = DRIVER_BG;

        setFill(cell, bg);
        setBorder(cell);

        // mantém fonte do template, remove itálico, ajusta cor/bold
        setFontKeepTemplate(cell, { bold: true, italic: false, bgHex: bg });
      }

      // reforço final: info cols brancas
      infoCols.forEach((col) => setFill(worksheet.getCell(excelRow, col), "FFFFFF"));
    }

    // 5) Limpar linhas vazias (restantes até 20)
    for (let i = maxEmployees; i < 20; i++) {
      const excelRow = 13 + i;
      for (let col = 2; col <= 38; col++) {
        const cell = worksheet.getCell(excelRow, col);
        breakStyle(cell);
        cell.value = "";
        setFill(cell, "FFFFFF");
        setFontKeepTemplate(cell, { bold: null, italic: false, bgHex: "FFFFFF" });
        setBorder(cell);
      }
    }

    // 6) Gerar Excel
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Folha_INEM_${MONTH_NAMES[month - 1]}_${year}.xlsx"`
    );
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Erro ao gerar folha:", error);
    res.status(500).json({ error: error.message });
  }
}
