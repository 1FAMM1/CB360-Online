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

    const templateURL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/vacation_map_template.xlsx";
    const templateResponse = await fetch(templateURL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const ROW_START = 10;

    employees.forEach((emp, index) => {
      const row = ROW_START + index;
      
      // Preenche Nome e Total de Dias
      worksheet.getCell(row, 2).value = emp.name;
      worksheet.getCell(row, 15).value = emp.totalDays;

      // Agrupa os textos por mês para evitar sobreposição
      const monthsData = {};
      if (emp.periods) {
        emp.periods.forEach(p => {
          if (!monthsData[p.month]) monthsData[p.month] = [];
          monthsData[p.month].push(p.text);
        });
      }

      // Preenche apenas o texto nas colunas dos meses (3 a 14)
      Object.keys(monthsData).forEach(m => {
        const col = 2 + Number(m);
        const cell = worksheet.getCell(row, col);
        // Une os intervalos se houver mais do que um no mesmo mês
        cell.value = monthsData[m].join(' e ');
        // Alinhamento básico para garantir que o texto fica visível
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
    });

    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `mapa_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputPath);

    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET
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

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (err) {
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    res.status(500).json({ error: err.message });
  }
}
