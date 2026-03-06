import ExcelJS from "exceljs";
import fetch from "node-fetch";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handleMapaSalarialExcel(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { year, month, employees } = req.body;
    const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];

    const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
    const templateResponse = await fetch(TEMPLATE_URL);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template");

    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await templateResponse.arrayBuffer();
    await workbook.xlsx.load(Buffer.from(arrayBuffer));
    const worksheet = workbook.worksheets[0];

    // Título
    const titleCell = worksheet.getCell("B6");
    titleCell.value = `MAPA DE PROCESSAMENTO - ${MONTH_NAMES[month - 1]} ${year}`;

    const ROW_START = 8;
    const ROW_MAX = 60;
    const borderColor = { argb: "FFD1D1D1" };

    employees.forEach((emp, index) => {
      const currentRow = ROW_START + index;
      if (currentRow > ROW_MAX) return;

      const colMap = { name: "B", baixas: "C", ferias: "D", parental: "E", nojo: "F", justificadas: "G", injustificadas: "H" };

      Object.entries(colMap).forEach(([key, col]) => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        
        // Em vez de breakStyle, atribuímos os valores diretamente. 
        // O ExcelJS trata da imutabilidade internamente se não tocarmos no objeto .style bruto.
        cell.value = emp[key] || "-";
        
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: key === "name" ? 'left' : 'center', 
          wrapText: true 
        };

        cell.border = {
          top: { style: "thin", color: borderColor },
          left: { style: "thin", color: borderColor },
          bottom: { style: "thin", color: borderColor },
          right: { style: "thin", color: borderColor },
        };
      });
    });

    // Ocultar linhas
    for (let i = ROW_START + employees.length; i <= ROW_MAX; i++) {
      worksheet.getRow(i).hidden = true;
    }

    // Setup de página
    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9, 
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Mapa_Salarial.xlsx`);
    
    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error("Erro API Excel:", error);
    return res.status(500).json({ error: error.message });
  }
}
