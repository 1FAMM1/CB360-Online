import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult } from "@adobe/pdfservices-node-sdk";

export default async function handler(req, res) {
  // CONFIGURAÇÃO DE CORS PARA EVITAR BLOQUEIO NO CODEPEN
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let inputPath = null;
  try {
    const { year, employees } = req.body;
    if (!employees) throw new Error("Sem dados de funcionários.");

    const templateURL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/vacation_map_template.xlsx";
    const templateResponse = await fetch(templateURL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const ROW_START = 10;

    employees.forEach((emp, index) => {
      const row = ROW_START + index;
      worksheet.getCell(row, 2).value = emp.name;
      worksheet.getCell(row, 15).value = emp.totalDays;

      const periods = emp.periods.map(p => ({ s: new Date(p.s), e: new Date(p.e) }));

      // LÓGICA DE PREENCHIMENTO E MERGE IGUAL AO FRONTEND
      for (let m = 1; m <= 12; m++) {
        // Encontrar períodos que começam neste mês
        let mP = periods.filter(x => (x.s.getMonth() + 1) === m);
        
        if (mP.length > 0) {
          let last = mP[mP.length - 1];
          // Calcula o span de colunas (se atravessa meses)
          let span = (last.e.getMonth() + 1 - m) + 1;
          let txt = mP.map(x => {
            const dS = x.s.getDate().toString().padStart(2, '0');
            const dE = x.e.getDate().toString().padStart(2, '0');
            return dS === dE ? dS : `${dS} a ${dE}`;
          }).join(' e ');

          const startCol = 2 + m; // Jan = Col 3
          const endCol = startCol + (span - 1);

          if (span > 1) {
            try { worksheet.mergeCells(row, startCol, row, endCol); } catch(e){}
          }

          const cell = worksheet.getCell(row, startCol);
          cell.value = txt;
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          
          m += (span - 1); // Salta os meses fundidos
        }
      }
    });

    // CONVERSÃO ADOBE PDF
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
