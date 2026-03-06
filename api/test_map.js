// pages/api/test_map_excel.js

import ExcelJS from "exceljs";
import fetch from "node-fetch";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handleMapaSalarialExcel(req, res) {
  // ==============================
  //       HEADERS CORS
  // ==============================
  res.setHeader("Access-Control-Allow-Origin", "*"); // permite qualquer domínio
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Resposta para preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { year, month, employees } = req.body;

    const MONTH_NAMES = [
      "JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO",
      "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"
    ];

    // 1️⃣ Carregar template do GitHub
    const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
    const templateResponse = await fetch(TEMPLATE_URL);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template do GitHub");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // 2️⃣ Cabeçalho
    worksheet.getCell("B6").value = `MAPA DE PROCESSAMENTO - ${MONTH_NAMES[month - 1]} ${year}`;

    // 3️⃣ Preenchimento de dados
    const ROW_START = 8;
    const ROW_MAX = 60;

    const breakStyle = (cell) => {
      cell.style = { ...(cell.style || {}) };
      if (cell.style.alignment) cell.style.alignment = { ...cell.style.alignment };
      if (cell.style.border) cell.style.border = { ...cell.style.border };
    };

    const setBorder = (cell) => {
      breakStyle(cell);
      const c = { argb: "FFD1D1D1" };
      cell.border = {
        top: { style: "thin", color: c },
        left: { style: "thin", color: c },
        bottom: { style: "thin", color: c },
        right: { style: "thin", color: c },
      };
    };

    employees.forEach((emp, index) => {
      const currentRow = ROW_START + index;
      if (currentRow > ROW_MAX) return;

      const colMap = {
        name: "B",
        baixas: "C",
        ferias: "D",
        parental: "E",
        nojo: "F",
        justificadas: "G",
        injustificadas: "H"
      };

      const writeData = (col, val) => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        breakStyle(cell);
        cell.value = val || "-"; // ⚡ sem \n, apenas texto
        cell.alignment = { vertical: 'middle', horizontal: col === "B" ? 'left' : 'center', wrapText: true };
        setBorder(cell);
      };

      writeData(colMap.name, emp.name);
      writeData(colMap.baixas, emp.baixas);
      writeData(colMap.ferias, emp.ferias);
      writeData(colMap.parental, emp.parental);
      writeData(colMap.nojo, emp.nojo);
      writeData(colMap.justificadas, emp.justificadas);
      writeData(colMap.injustificadas, emp.injustificadas);
    });

    // 4️⃣ Ocultar linhas não usadas
    for (let i = ROW_START + employees.length; i <= ROW_MAX; i++) {
      worksheet.getRow(i).hidden = true;
    }

    // 5️⃣ Configurar impressão
    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2 }
    };

    // 6️⃣ Gerar buffer e enviar
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Mapa_Salarial_${year}_${month}.xlsx`);
    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error("Erro API Excel:", error);
    return res.status(500).json({ error: error.message });
  }
}
