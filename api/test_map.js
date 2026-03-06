import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handleMapaSalarialExcel(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  let tempFilePath = null;

  try {
    const { year, month, employees } = req.body;
    const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];

    // 1️⃣ Carregar template do GitHub
    const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
    const templateResponse = await fetch(TEMPLATE_URL);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template do GitHub");

    const arrayBuffer = await templateResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];

    // 2️⃣ Cabeçalho
    worksheet.getCell("B6").value = `MAPA DE PROCESSAMENTO - ${MONTH_NAMES[month-1]} ${year}`;

    // 3️⃣ Preenchimento de funcionários
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

    const colMap = {
      name: "B",
      baixas: "C",
      ferias: "D",
      parental: "E",
      nojo: "F",
      justificadas: "G",
      injustificadas: "H"
    };

    employees.forEach((emp, index) => {
      const currentRow = ROW_START + index;
      if (currentRow > ROW_MAX) return;

      Object.keys(colMap).forEach(key => {
        const cell = worksheet.getCell(`${colMap[key]}${currentRow}`);
        cell.value = emp[key] != null ? String(emp[key]) : "-";
        cell.alignment = { vertical: 'middle', horizontal: key === "name" ? 'left' : 'center', wrapText: true };
        setBorder(cell);
      });
    });

    // 4️⃣ Ocultar linhas extras
    for (let i = ROW_START + employees.length; i <= ROW_MAX; i++) {
      worksheet.getRow(i).hidden = true;
    }

    // 5️⃣ Configuração de impressão (opcional)
    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2 }
    };

    // 6️⃣ Salvar arquivo temporário
    tempFilePath = path.join(os.tmpdir(), `MapaSalarial_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(tempFilePath);

    // 7️⃣ Retornar Excel para download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=MapaSalarial_${year}_${month}.xlsx`);
    const stream = fs.createReadStream(tempFilePath);
    stream.pipe(res);

    stream.on("close", () => {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    });

  } catch (error) {
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    console.error("Erro API Excel:", error);
    res.status(500).json({ error: error.message });
  }
}
