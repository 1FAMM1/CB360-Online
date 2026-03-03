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

export default async function handler(req, res) {
  // 1. Configuração de CORS (Essencial para o Codepen)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let inputFilePath = null;
  const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
  const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employee_vacations_mark_template.xlsx";

  try {
    const { employeeName, nInt, periods } = req.body;

    // 2. Carregar o Template
    const response = await fetch(TEMPLATE_URL);
    if (!response.ok) throw new Error("Não foi possível baixar o template do GitHub");
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.worksheets[0];

    // 3. Preenchimento do Cabeçalho
    worksheet.getCell("F7").value = String(employeeName || "");
    worksheet.getCell("Q7").value = String(nInt || "");

    // 4. Preenchimento dos Períodos (Linhas 11, 13, 15)
    if (periods && Array.isArray(periods)) {
      periods.forEach((p, i) => {
        if (i > 2) return; // Limite de 3 períodos no Excel
        const row = 11 + (i * 2);
        
        // CORREÇÃO: Converter para String antes do replace para evitar erro de tipo
        const startRaw = p.start ? String(p.start) : null;
        const endRaw = p.end ? String(p.end) : null;

        const start = startRaw ? new Date(startRaw.replace(/-/g, '/')) : null;
        const end = endRaw ? new Date(endRaw.replace(/-/g, '/')) : null;

        if (start && !isNaN(start.getTime())) {
          worksheet.getCell(`C${row}`).value = start.getDate();
          worksheet.getCell(`E${row}`).value = start.getMonth() + 1;
          worksheet.getCell(`G${row}`).value = start.getFullYear();
        }
        
        if (end && !isNaN(end.getTime())) {
          worksheet.getCell(`I${row}`).value = end.getDate();
          worksheet.getCell(`K${row}`).value = end.getMonth() + 1;
          worksheet.getCell(`M${row}`).value = end.getFullYear();
        }
        
        const daysValue = Number(p.days);
        worksheet.getCell(`Q${row}`).value = !isNaN(daysValue) ? daysValue : 0;
      });
    }

    // 5. Salvar ficheiro temporário para o Adobe
    const tempDir = os.tmpdir();
    inputFilePath = path.join(tempDir, `test_vac_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputFilePath);

    // 6. Adobe PDF Services
    const credentials = new ServicePrincipalCredentials({ 
      clientId: CLIENT_ID, 
      clientSecret: CLIENT_SECRET 
    });
    const pdfServices = new PDFServices({ credentials });
    
    const inputAsset = await pdfServices.upload({ 
      readStream: fs.createReadStream(inputFilePath), 
      mimeType: MimeType.XLSX 
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (let chunk of streamAsset.readStream) { chunks.push(chunk); }

    // 7. Limpeza e Envio
    if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=formulario_ferias.pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    console.error("DEBUG ERROR:", error);
    if (inputFilePath && fs.existsSync(inputFilePath)) {
      try { fs.unlinkSync(inputFilePath); } catch(e) {}
    }
    return res.status(500).json({ error: error.message });
  }
}
