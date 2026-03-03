import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult } from "@adobe/pdfservices-node-sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let inputPath = null;

  try {
    const { year, employees } = req.body;
    if (!year || !employees) {
      throw new Error("Parâmetros obrigatórios 'year' e 'employees' não foram fornecidos.");
    }

    console.log(`Gerando PDF para o ano ${year} com ${employees.length} funcionários`);

    // 1. Verificar credenciais Adobe
    if (!process.env.ADOBE_CLIENT_ID || !process.env.ADOBE_CLIENT_SECRET) {
      throw new Error("Credenciais Adobe não configuradas.");
    }

    // 2. Carregar template Excel
    const templateURL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/vacation_map_template.xlsx";
    const templateResponse = await fetch(templateURL);
    if (!templateResponse.ok) throw new Error("Falha ao baixar template Excel.");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const ROW_START = 10;

    // 3. Preencher dados
    employees.forEach((emp, index) => {
      const row = ROW_START + index;

      worksheet.getCell(row, 2).value = emp.name || "N/A";

      // Criar bordas
      for (let m = 3; m <= 14; m++) {
        const cell = worksheet.getCell(row, m);
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      }

      if (Array.isArray(emp.periods)) {
        emp.periods.forEach((p) => {
          const startCol = 2 + (parseInt(p.startMonth) || 0);
          const endCol = 2 + (parseInt(p.endMonth) || 0);

          if (startCol >= 3 && endCol <= 14 && startCol <= endCol) {
            if (startCol !== endCol) worksheet.mergeCells(row, startCol, row, endCol);
            const cell = worksheet.getCell(row, startCol);
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7C6C7" } };
            cell.alignment = { horizontal: "center" };
          }
        });
      }

      worksheet.getCell(row, 15).value = emp.totalDays || 0;
    });

    // 4. Salvar XLSX temporário
    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `mapa_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputPath);
    console.log("XLSX gerado em:", inputPath);

    // 5. Converter para PDF usando Adobe
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputPath), mimeType: MimeType.XLSX });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (let chunk of streamAsset.readStream) chunks.push(chunk);

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    res.status(200).send(Buffer.concat(chunks));
  } catch (err) {
    console.error("ERRO DETALHADO:", err);
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
