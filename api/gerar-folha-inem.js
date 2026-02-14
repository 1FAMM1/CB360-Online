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

    // 1) Buscar template
    const templateUrl =
      "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    if (workbook.worksheets.length === 0) throw new Error("Template não tem worksheets");

    const worksheet = workbook.worksheets[0];

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

    function setFontForBg(cell, bgHex6, forceBold = true) {
      breakStyle(cell);
      const dark = isDarkHex(bgHex6);
      cell.font = {
        name: "Calibri",
        size: 11,
        bold: !!forceBold,
        color: { argb: dark ? "FFFFFFFF" : "FF000000" },
      };
    }

    function clearBorders(cell) {
      breakStyle(cell);
      cell.border = {};
    }

    // 2) Cabeçalho
    worksheet.getCell("B7").value = `${MONTH_NAMES[month - 1]} ${year}`;
    worksheet.getCell("B68").value = workingHours;

    // 3) Dias do mês + cabeçalhos
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let d = 1; d <= 31; d++) {
      const colIndex = 6 + d; // igual à tua API antiga
      const cellWeek = worksheet.getCell(10, colIndex);
      const cellDay = worksheet.getCell(11, colIndex);

      breakStyle(cellWeek);
      breakStyle(cellDay);

      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        cellWeek.value = WEEKDAY_NAMES[date.getDay()];
        cellDay.value = d;
      } else {
        cellWeek.value = "";
        cellDay.value = "";
      }
    }

    // 4) Preencher funcionários (até 20)
    const maxEmployees = Math.min(employees.length, 20);

    for (let idx = 0; idx < maxEmployees; idx++) {
      const emp = employees[idx];
      const excelRow = 13 + idx;

      // Colunas info (B,C,D,E,AL) sempre branco
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
        cell.font = { name: "Calibri", size: 11, bold: false, color: { argb: "FF000000" } };
        clearBorders(cell);
      });

      // Turnos (G em diante)
      for (let d = 0; d < daysInMonth; d++) {
        const colIndex = 7 + d;
        const cell = worksheet.getCell(excelRow, colIndex);

        breakStyle(cell);

        const turno = (emp.shifts?.[d] || "").toString();
        cell.value = turno;
        cell.alignment = { horizontal: "center", vertical: "middle" };

        // cor por célula vinda do site
        let bg = normalizeHex6(emp.cellColors?.[d] || "FFFFFF");

        // compatibilidade com API antiga: se vier drivers[], força rosa
        const isDriver = !!(emp.drivers && emp.drivers[d]);
        if (isDriver) bg = "FF69B4";

        setFill(cell, bg);
        clearBorders(cell);

        // cor da letra automática (motorista fica preto porque rosa é claro)
        setFontForBg(cell, bg, true);
      }

      // Reforço final: garantir brancas nas infos
      infoCols.forEach((col) => setFill(worksheet.getCell(excelRow, col), "FFFFFF"));
    }

    // 5) Limpar linhas vazias (13..32 = 20 linhas)
    for (let i = maxEmployees; i < 20; i++) {
      const excelRow = 13 + i;
      for (let col = 2; col <= 38; col++) {
        const cell = worksheet.getCell(excelRow, col);
        breakStyle(cell);
        cell.value = "";
        // opcional: limpar qualquer cor herdada do template nessas linhas
        setFill(cell, "FFFFFF");
        clearBorders(cell);
        cell.font = { name: "Calibri", size: 11, bold: false, color: { argb: "FF000000" } };
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
