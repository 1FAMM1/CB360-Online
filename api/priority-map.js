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
    // Recebemos o ano de prioridade (ex: 2027) e o array de funcionários com as pontuações
    const { priorityYear, employees } = req.body;
    
    // URL do teu novo template de prioridades
    const templateURL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/priority-vacation-template.xlsx";
    
    const templateResponse = await fetch(templateURL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // 1. Preencher o Título na Célula C3
    worksheet.getCell("C3").value = `MAPA DE PRIORIDADE DE MARCAÇÃO DE FÉRIAS - ${priorityYear}`;

    const ROW_START = 10;
    const ROW_END = 43;

    // 2. Preencher os dados dos funcionários e pontuações
    employees.forEach((emp, index) => {
      const rowNumber = ROW_START + index;
      
      if (rowNumber <= ROW_END) {
        // Coluna B: Nome do Funcionário
        worksheet.getCell(`B${rowNumber}`).value = emp.name;

        // Preencher as 24 quinzenas (Colunas C até Z)
        // emp.scores deve ser um array de 24 números correspondente às quinzenas
        if (emp.scores && Array.isArray(emp.scores)) {
          emp.scores.forEach((score, qIndex) => {
            // Coluna C é a 3ª coluna. qIndex 0 -> Coluna 3, qIndex 1 -> Coluna 4...
            const colIndex = 3 + qIndex; 
            const cell = worksheet.getCell(rowNumber, colIndex);
            
            cell.value = score > 0 ? score : "-";
            
            // Estilo opcional: Negrito se houver dados
            if (score > 0) {
              cell.font = { bold: true };
            }
          });
        }

        // Coluna AA: Total de Pontos (Coluna 27)
        worksheet.getCell(rowNumber, 27).value = emp.totalScore;
      }
    });

    // 3. Ocultar linhas não utilizadas para o PDF ficar limpo
    for (let i = ROW_START; i <= ROW_END; i++) {
      const nameCell = worksheet.getCell(`B${i}`).value;
      if (!nameCell || nameCell.toString().trim() === "") {
        worksheet.getRow(i).hidden = true;
      }
    }

    // 4. Processo de conversão para PDF via Adobe
    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `prioridades_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputPath);

    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID, 
      clientSecret: process.env.ADOBE_CLIENT_SECRET
    });
    
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ 
        readStream: fs.createReadStream(inputPath), 
        mimeType: MimeType.XLSX 
    });
    
    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (let chunk of streamAsset.readStream) chunks.push(chunk);
    
    // Limpeza do ficheiro temporário
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Prioridades_${priorityYear}.pdf`);
    return res.status(200).send(Buffer.concat(chunks));

  } catch (err) {
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    console.error("Erro API Prioridades:", err);
    res.status(500).json({ error: err.message });
  }
}
