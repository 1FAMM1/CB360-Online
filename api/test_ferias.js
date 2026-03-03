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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  let inputFilePath = null;
  const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
  const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employee_vacations_mark_template.xlsx";

  try {
    const { employeeName, nInt, periods } = req.body;

    const response = await fetch(TEMPLATE_URL);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.worksheets[0];

    // Cabeçalho
    worksheet.getCell("F7").value = String(employeeName || "");
    worksheet.getCell("Q7").value = String(nInt || "");

    // Preenchimento dos Períodos baseado no teu objeto do Frontend
    if (periods && Array.isArray(periods)) {
      periods.forEach((p, i) => {
        if (i > 2) return; 
        const row = 11 + (i * 2);

        // Como o teu frontend já envia { day, month, year }
        if (p.start && typeof p.start === 'object') {
          worksheet.getCell(`C${row}`).value = p.start.day;
          worksheet.getCell(`E${row}`).value = p.start.month;
          worksheet.getCell(`G${row}`).value = p.start.year;
        }

        if (p.end && typeof p.end === 'object') {
          worksheet.getCell(`I${row}`).value = p.end.day;
          worksheet.getCell(`K${row}`).value = p.end.month;
          worksheet.getCell(`M${row}`).value = p.end.year;
        }

        worksheet.getCell(`Q${row}`).value = Number(p.days) || 0;
      });
    }

    // Configuração de página
    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1
    };

    const tempDir = os.tmpdir();
    inputFilePath = path.join(tempDir, `vac_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputFilePath);

    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX });
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
    console.error("ERRO:", error);
    if (inputFilePath && fs.existsSync(inputFilePath)) try { fs.unlinkSync(inputFilePath); } catch(e) {}
    return res.status(500).json({ error: error.message });
  }
}
