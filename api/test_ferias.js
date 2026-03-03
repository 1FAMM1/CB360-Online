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
  // --- ADICIONAR ISTO PARA RESOLVER O ERRO DE CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // --------------------------------------------------

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let inputFilePath = null;
  const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
  const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employee_vacations_mark_template.xlsx";

  try {
    const { employeeName, nInt, periods } = req.body;

    const response = await fetch(TEMPLATE_URL);
    if (!response.ok) throw new Error("Falha ao baixar template");
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.worksheets[0];

    // Preenchimento
    worksheet.getCell("F7").value = String(employeeName || "");
    worksheet.getCell("Q7").value = String(nInt || "");

    if (periods && Array.isArray(periods)) {
      periods.forEach((p, i) => {
        if (i > 2) return;
        const row = 11 + (i * 2);
        
        // Tratamento das datas dos inputs
        const start = p.start ? new Date(p.start.replace(/-/g, '/')) : null;
        const end = p.end ? new Date(p.end.replace(/-/g, '/')) : null;

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
        worksheet.getCell(`Q${row}`).value = Number(p.days) || 0;
      });
    }

    const tempDir = os.tmpdir();
    inputFilePath = path.join(tempDir, `test_vac_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputFilePath);

    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
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

    if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    console.error("DEBUG ERROR:", error);
    if (inputFilePath && fs.existsSync(inputFilePath)) {
      try { fs.unlinkSync(inputFilePath); } catch(e) {}
    }
    return res.status(500).json({ error: error.message });
  }
}
