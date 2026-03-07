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

const MONTH_START_COLS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
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
      const startCol = MONTH_START_COLS[mi];
      const daysInMonth = new Date(targetYear, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = 11 + (day - 1);
        const cells = [
          ws.getCell(row, startCol),     // Dia
          ws.getCell(row, startCol + 1), // Semana
          ws.getCell(row, startCol + 2)  // Equipa
        ];

        // 1. RESET TOTAL DA CÉLULA (Limpa qualquer pintura fantasma)
        cells.forEach(c => {
          c.value = null;
          c.fill = { type: 'pattern', pattern: 'none' }; // Remove qualquer cor
          c.font = { name: 'Arial', size: 8, bold: false, color: { argb: 'FF000000' } };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
          };
          c.alignment = { horizontal: "center", vertical: "middle" };
        });

        if (day > daysInMonth) {
          cells.forEach(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            c.border = null;
          });
          continue;
        }

        // 2. CÁLCULO DE DADOS
        const date = new Date(targetYear, mi, day, 12, 0, 0);
        const wdIdx = date.getDay();
        const isWeekend = (wdIdx === 0 || wdIdx === 6);

        // 3. ESCREVER VALORES
        cells[0].value = String(day).padStart(2, "0");
        cells[1].value = WEEKDAY_NAMES[wdIdx];
        cells[2].value = teamMap[`${month}-${day}`] || "";

        // 4. PINTAR APENAS FINS DE SEMANA
        if (isWeekend) {
          cells.forEach(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9E0B0' } };
          });
        } else {
          cells.forEach(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
          });
        }
      }
    }

    // Configuração Adobe PDF
    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `final_clean_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(inputPath);

    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputPath), mimeType: MimeType.XLSX });
    const job = new CreatePDFJob({ inputAsset });
    const result = await pdfServices.getJobResult({ pollingURL: await pdfServices.submit({ job }), resultType: CreatePDFResult });
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
