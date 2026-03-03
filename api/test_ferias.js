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
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let inputFilePath = null;
  const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
  const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employee_vacations_mark_template.xlsx";

  try {
    const { employeeName, nInt, periods } = req.body;

    // 1. Download do Template
    const response = await fetch(TEMPLATE_URL);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.worksheets[0];

    // 2. Preenchimento Básico (Teste de sanidade)
    worksheet.getCell("F7").value = employeeName || "TESTE NOME";
    worksheet.getCell("Q7").value = nInt || "000";

    // 3. Preenchimento de Períodos com tratamento de data local
    if (periods && Array.isArray(periods)) {
      periods.forEach((p, i) => {
        if (i > 2) return;
        const row = 11 + (i * 2);
        
        // O replace(/-/g, '/') é vital para inputs do tipo date
        const start = new Date(p.start.replace(/-/g, '/'));
        const end = new Date(p.end.replace(/-/g, '/'));

        if (!isNaN(start.getTime())) {
          worksheet.getCell(`C${row}`).value = start.getDate();
          worksheet.getCell(`E${row}`).value = start.getMonth() + 1;
          worksheet.getCell(`G${row}`).value = start.getFullYear();
        }
        if (!isNaN(end.getTime())) {
          worksheet.getCell(`I${row}`).value = end.getDate();
          worksheet.getCell(`K${row}`).value = end.getMonth() + 1;
          worksheet.getCell(`M${row}`).value = end.getFullYear();
        }
        worksheet.getCell(`Q${row}`).value = Number(p.days) || 0;
      });
    }

    // 4. Salvar temporário
    const tempDir = os.tmpdir();
    inputFilePath = path.join(tempDir, `test_vac_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputFilePath);

    // 5. Adobe PDF Services
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

    // Limpeza
    if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    console.error("DEBUG ERROR:", error);
    if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
    return res.status(500).json({ error: error.message });
  }
}
