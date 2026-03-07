import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import {
  ServicePrincipalCredentials, PDFServices, MimeType,
  CreatePDFJob, CreatePDFResult
} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/eip_annual_map_template.xlsx";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let inputPath = null;
  try {
    const { year, days } = req.body; // 'days' agora deve trazer a cor e o nome do dia da semana

    const templateRes = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateRes.arrayBuffer());
    const ws = workbook.worksheets[0];

    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${year}`;

    const MONTH_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];

    // Mapear os dados recebidos para facilitar o acesso
    // Esperamos que o front envie: { month, day, team, weekdayName, bgColor }
    const dataMap = {};
    days.forEach(d => {
      dataMap[`${d.month}-${d.day}`] = d;
    });

    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_COLS[mi];
      const daysInMonth = new Date(year, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = 11 + (day - 1);
        const cellDay = ws.getCell(row, startCol);
        const cellWd = ws.getCell(row, startCol + 1);
        const cellTeam = ws.getCell(row, startCol + 2);

        if (day > daysInMonth) {
          [cellDay, cellWd, cellTeam].forEach(c => {
            c.value = null;
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; // Cor de vazio
            c.border = null;
          });
          continue;
        }

        const info = dataMap[`${month}-${day}`] || {};
        
        cellDay.value = String(day).padStart(2, "0");
        cellWd.value = info.weekdayName || "";
        cellTeam.value = info.team || "";

        // Aplicar a cor que vem do FRONT-END (info.bgColor deve ser algo como "F7C6C7")
        const bg = info.bgColor || "FFFFFF";
        
        [cellDay, cellWd, cellTeam].forEach(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg.replace("#","") } };
          c.alignment = { horizontal: "center", vertical: "middle" };
          c.font = { name: 'Arial', size: 8 };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
          };
        });

        // Cores específicas das Equipas (override)
        if (info.team === "EIP-01") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FF1D4ED8' } };
        } else if (info.team === "EIP-02") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FF15803D' } };
        }
      }
    }

    // Gerar PDF via Adobe
    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `eip_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputPath);

    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputPath), mimeType: MimeType.XLSX });
    const job = new CreatePDFJob({ inputAsset });
    const result = await pdfServices.getJobResult({ 
      pollingURL: await pdfServices.submit({ job }), 
      resultType: CreatePDFResult 
    });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

    const chunks = [];
    for await (const chunk of streamAsset.readStream) chunks.push(chunk);
    fs.unlinkSync(inputPath);

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    return res.status(500).json({ error: error.message });
  }
}
