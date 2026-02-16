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
  // --- CONFIGURAÇÃO DE CORS PARA AMBIENTES EXTERNOS (CodePen, etc) ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const tempFiles = [];

  try {
    const { year, month, employee, workingHours } = req.body;

    // Validação básica
    if (!employee || !year || !month) {
      return res.status(400).json({ error: "Dados do funcionário ausentes" });
    }

    // 1. Configurar Credenciais Adobe
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    // 2. Buscar Template Excel
    const freshTemplateResponse = await fetch(TEMPLATE_URL);
    const freshTemplateBuffer = await freshTemplateResponse.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(freshTemplateBuffer);
    const worksheet = workbook.worksheets[0];

    // --- LÓGICA DE PREENCHIMENTO ---
    const SHIFT_COLORS = {
      "D": "FFFF00", "N": "00008B", "M": "D3D3D3", "FR": "FFA500",
      "FO": "008000", "FE": "00B0F0", "BX": "FF0000", "LC": "FF0000",
      "LN": "FF0000", "LP": "FF0000", "FI": "FF0000", "FJ": "FF0000",
      "FOR": "808080", "DP": "000000"
    };

    const isDarkColor = (hex) => {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 150;
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Preencher Cabeçalho
    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours;
    worksheet.getCell("L44").value = employee.total || 0;

    // Preencher Dias
    for (let d = 1; d <= 31; d++) {
      const row = 11 + d;
      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        worksheet.getCell(row, 2).value = d;
        worksheet.getCell(row, 3).value = WEEKDAY_NAMES[date.getDay()];
        
        const turno = employee.shifts?.[d - 1] || "";
        const cellTurno = worksheet.getCell(row, 4);
        cellTurno.value = turno;

        if (turno && SHIFT_COLORS[turno]) {
          const colorHex = SHIFT_COLORS[turno];
          cellTurno.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + colorHex } };
          cellTurno.font = { bold: true, color: { argb: isDarkColor(colorHex) ? "FFFFFFFF" : "FF000000" } };
          cellTurno.alignment = { horizontal: "center", vertical: "middle" };
        }
      } else {
        // Limpa células extras para meses com menos de 31 dias
        worksheet.getCell(row, 2).value = "";
        worksheet.getCell(row, 3).value = "";
        worksheet.getCell(row, 4).value = "";
      }
    }

    // 3. Salvar Excel Temporário
    const tempDir = os.tmpdir();
    const xlsxPath = path.join(tempDir, `folha_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(xlsxPath);
    tempFiles.push(xlsxPath);

    // 4. Converter para PDF via Adobe
    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(xlsxPath),
      mimeType: MimeType.XLSX,
    });

    const createPDFJob = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job: createPDFJob });
    const pdfResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult,
    });

    // 5. Baixar o PDF gerado
    const streamAsset = await pdfServices.getContent({ asset: pdfResponse.result.asset });
    
    const chunks = [];
    for await (let chunk of streamAsset.readStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Cleanup
    if (fs.existsSync(xlsxPath)) fs.unlinkSync(xlsxPath);

    // Retornar o PDF individual
    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error("❌ Erro na API:", error);
    // Cleanup em caso de erro
    tempFiles.forEach(f => { if(fs.existsSync(f)) fs.unlinkSync(f); });
    return res.status(500).json({ error: "Erro ao processar PDF", details: error.message });
  }
}
