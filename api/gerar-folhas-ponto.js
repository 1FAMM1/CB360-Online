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
  CombinePDFJob,
  CombinePDFResult,
} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx";

export default async function handler(req, res) {
  // --- CONFIGURAÇÃO DE CORS (Essencial para o CodePen/CDPN.IO) ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const tempFiles = [];

  try {
    const { year, month, employees, workingHours } = req.body;

    if (!year || !month || !employees) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // 1. Instanciar Credenciais Adobe
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });
    const tempDir = os.tmpdir();

    // 2. Cache do Template (Baixa uma única vez para todos os funcionários)
    const freshTemplateResponse = await fetch(TEMPLATE_URL);
    if (!freshTemplateResponse.ok) throw new Error("Erro ao baixar template do GitHub");
    const freshTemplateBuffer = await freshTemplateResponse.arrayBuffer();

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

    // 3. Função de Processamento Individual
    const processEmployee = async (emp, empIdx) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(freshTemplateBuffer);
      const worksheet = workbook.worksheets[0];

      // Preenchimento de Cabeçalho
      worksheet.getCell("D8").value = emp.abv_name || "";
      worksheet.getCell("J8").value = emp.function || "";
      worksheet.getCell("L46").value = workingHours;
      worksheet.getCell("L44").value = emp.total || 0;

      // Preenchimento de Dias
      for (let d = 1; d <= 31; d++) {
        const row = 11 + d;
        if (d <= daysInMonth) {
          const date = new Date(year, month - 1, d, 12, 0, 0);
          worksheet.getCell(row, 2).value = d;
          worksheet.getCell(row, 3).value = WEEKDAY_NAMES[date.getDay()];
          
          const turno = emp.shifts?.[d - 1] || "";
          const cellTurno = worksheet.getCell(row, 4);
          cellTurno.value = turno;

          if (turno && SHIFT_COLORS[turno]) {
            const colorHex = SHIFT_COLORS[turno];
            cellTurno.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + colorHex } };
            cellTurno.font = { bold: true, color: { argb: isDarkColor(colorHex) ? "FFFFFFFF" : "FF000000" } };
            cellTurno.alignment = { horizontal: "center", vertical: "middle" };
          }
        } else {
          worksheet.getCell(row, 2).value = "";
          worksheet.getCell(row, 3).value = "";
          worksheet.getCell(row, 4).value = "";
        }
      }

      const xlsxPath = path.join(tempDir, `f_${empIdx}_${Date.now()}.xlsx`);
      await workbook.xlsx.writeFile(xlsxPath);
      tempFiles.push(xlsxPath);

      // Upload e Conversão para PDF (Adobe)
      const inputAsset = await pdfServices.upload({
        readStream: fs.createReadStream(xlsxPath),
        mimeType: MimeType.XLSX,
      });

      const createJob = new CreatePDFJob({ inputAsset });
      const pollingURL = await pdfServices.submit({ job: createJob });
      const pdfResponse = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });

      return pdfResponse.result.asset;
    };

    // 4. Execução em Paralelo (Ganho de performance)
    // Se tiver mais de 10 funcionários, a Vercel pode dar timeout aqui.
    const pdfAssets = await Promise.all(employees.map((emp, idx) => processEmployee(emp, idx)));

    if (!pdfAssets || pdfAssets.length === 0) throw new Error("Falha ao gerar PDFs individuais");

    // 5. Merge dos PDFs
    const combineJob = new CombinePDFJob({ assets: pdfAssets });
    const combinePollingURL = await pdfServices.submit({ job: combineJob });
    const combineResponse = await pdfServices.getJobResult({
      pollingURL: combinePollingURL,
      resultType: CombinePDFResult,
    });

    const streamAsset = await pdfServices.getContent({ asset: combineResponse.result.asset });
    
    // Converter Stream para Buffer
    const chunks = [];
    for await (let chunk of streamAsset.readStream) { chunks.push(chunk); }
    const pdfBuffer = Buffer.concat(chunks);

    // Limpeza de arquivos temporários
    tempFiles.forEach(f => { if(fs.existsSync(f)) fs.unlinkSync(f); });

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error("❌ Erro:", error);
    // Limpeza em caso de erro
    tempFiles.forEach(f => { if(fs.existsSync(f)) fs.unlinkSync(f); });
    return res.status(500).json({ error: "Erro na geração das folhas", details: error.message });
  }
}
