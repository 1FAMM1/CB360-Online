import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import {
  ServicePrincipalCredentials, PDFServices, MimeType,
  CreatePDFJob, CreatePDFResult
} from "@adobe/pdfservices-node-sdk";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/eip_annual_map_template.xlsx";

// Definição estrita de cores
const COLOR = {
  WEEKEND: "FFF9E0B0", // Amarelo suave apenas para FDS
  EMPTY:   "FFF8FAFC", // Cinza para dias fora do mês
  WHITE:   "FFFFFFFF", // Branco para tudo o resto
  BLACK:   "FF000000"
};

const MONTH_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let inputPath = null;
  try {
    const { year, days } = req.body;
    const targetYear = parseInt(year, 10);

    const templateRes = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateRes.arrayBuffer());
    const ws = workbook.worksheets[0];

    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${targetYear}`;

    const teamMap = {};
    days.forEach(d => { teamMap[`${d.month}-${d.day}`] = d.team; });

    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_COLS[mi];
      const daysInMonth = new Date(targetYear, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = 11 + (day - 1);
        const cellDay = ws.getCell(row, startCol);
        const cellWd = ws.getCell(row, startCol + 1);
        const cellTeam = ws.getCell(row, startCol + 2);

        if (day > daysInMonth) {
          [cellDay, cellWd, cellTeam].forEach(c => {
            c.value = null;
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EMPTY } };
            c.border = null;
          });
          continue;
        }

        // Cálculo do dia da semana (UTC para evitar saltos de fuso horário)
        const date = new Date(Date.UTC(targetYear, mi, day));
        const wdIdx = date.getUTCDay();
        const isWeekend = (wdIdx === 0 || wdIdx === 6); // 0 = Domingo, 6 = Sábado

        // COR: Apenas se for Fim de Semana, caso contrário Branco
        let bg = isWeekend ? COLOR.WEEKEND : COLOR.WHITE;

        cellDay.value = String(day).padStart(2, "0");
        cellWd.value = WEEKDAY_NAMES[wdIdx];
        cellTeam.value = teamMap[`${month}-${day}`] || "";

        // Aplicar estilo uniforme
        [cellDay, cellWd, cellTeam].forEach(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          c.alignment = { horizontal: "center", vertical: "middle" };
          c.font = { name: 'Arial', size: 8, color: { argb: COLOR.BLACK }, bold: false };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
          };
        });
      }
    }

    // Configuração de página para PDF
    ws.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `eip_limpo_${Date.now()}.xlsx`);
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
