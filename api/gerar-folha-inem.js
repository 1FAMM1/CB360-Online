import ExcelJS from "exceljs";
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { year, month, employees } = req.body;

    const workbook = new ExcelJS.Workbook();
    const templateResponse = await fetch(
      "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx"
    );

    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // ===== FIX: evitar "style shared" do template =====
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
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF" + h },
      };
    }

    (employees || []).forEach((emp, idx) => {
      const excelRow = 13 + idx; // Linha 13, 14, 15...

      // Colunas fixas (B,C,D,E,AL) sempre brancas
      const infoCols = [2, 3, 4, 5, 38];
      infoCols.forEach((col) => {
        const cell = worksheet.getCell(excelRow, col);

        // garantir que não herda estilos de outras células
        breakStyle(cell);

        cell.value =
          col === 2
            ? emp.n_int
            : col === 3
            ? emp.abv_name
            : col === 4
            ? emp.function
            : col === 5
            ? emp.team
            : emp.total;

        setFill(cell, "FFFFFF");
      });

      // Turnos (G em diante)
      (emp.shifts || []).forEach((turno, dIdx) => {
        const colIndex = 7 + dIdx; // G(7), H(8)...
        const cell = worksheet.getCell(excelRow, colIndex);

        breakStyle(cell);

        cell.value = turno;
        cell.alignment = { horizontal: "center", vertical: "middle" };

        const hexColor = normalizeHex6(emp.cellColors?.[dIdx] || "FFFFFF");
        setFill(cell, hexColor);

        // grelha
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // texto branco em cores escuras
        const isDark = ["00008B", "0000FF"].includes(hexColor);
        cell.font = {
          bold: true,
          color: { argb: isDark ? "FFFFFFFF" : "FF000000" },
        };
      });

      // Reforço final: garantir brancas mesmo se algo "vazar"
      infoCols.forEach((col) => {
        const cell = worksheet.getCell(excelRow, col);
        setFill(cell, "FFFFFF");
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
