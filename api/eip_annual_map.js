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

// Cores ARGB (Obrigatório FF no início para a Adobe ler bem)
const COLOR = {
  EIP01_BG: "FFDBEAFE", EIP01_TEXT: "FF1D4ED8",
  EIP02_BG: "FFDCFCE7", EIP02_TEXT: "FF15803D",
  HOLIDAY: "FFF7C6C7", WEEKEND: "FFF9E0B0",
  EMPTY: "FFF8FAFC", WHITE: "FFFFFFFF"
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

    // Título
    ws.getCell("B7").value = `ENQUADRAMENTO EQUIPAS DE INTERVENÇÃO PERMANENTE - ${targetYear}`;

    // Criar Mapa de Dados para procura rápida
    const dataMap = {};
    days.forEach(d => { dataMap[`${d.month}-${d.day}`] = d; });

    // Loop pelos 12 meses
    for (let mi = 0; mi < 12; mi++) {
      const month = mi + 1;
      const startCol = MONTH_COLS[mi];
      
      // Determinar dias no mês sem usar UTC (evita o erro de 2025/2026)
      const lastDayOfMonth = new Date(targetYear, month, 0).getDate();

      for (let day = 1; day <= 31; day++) {
        const row = 11 + (day - 1);
        const cellDay = ws.getCell(row, startCol);
        const cellWd = ws.getCell(row, startCol + 1);
        const cellTeam = ws.getCell(row, startCol + 2);

        if (day > lastDayOfMonth) {
          // Limpar células fora do mês (ex: 30 de Fevereiro)
          [cellDay, cellWd, cellTeam].forEach(c => {
            c.value = null;
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EMPTY } };
            c.border = null;
          });
          continue;
        }

        // Dados do dia
        const info = dataMap[`${month}-${day}`] || {};
        const dateObj = new Date(targetYear, mi, day, 12, 0, 0);
        const wdIdx = dateObj.getDay();

        cellDay.value = String(day).padStart(2, "0");
        cellWd.value = WEEKDAY_NAMES[wdIdx];
        cellTeam.value = info.team || "";

        // Lógica de Cores (Prioridade: Feriado > Fim de Semana > Branco)
        let bg = COLOR.WHITE;
        if (info.isHoliday) bg = COLOR.HOLIDAY;
        else if (wdIdx === 0 || wdIdx === 6) bg = COLOR.WEEKEND;

        // Estilo Base
        [cellDay, cellWd, cellTeam].forEach(c => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          c.alignment = { horizontal: "center", vertical: "middle" };
          c.font = { name: 'Arial', size: 8, color: { argb: "FF000000" } };
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            left: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D1D1' } },
            right: { style: 'thin', color: { argb: 'FFD1D1D1' } }
          };
        });

        // Estilo especial para Equipas
        if (info.team === "EIP-01") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP01_BG } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP01_TEXT } };
        } else if (info.team === "EIP-02") {
          cellTeam.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.EIP02_BG } };
          cellTeam.font = { name: 'Arial', size: 8, bold: true, color: { argb: COLOR.EIP02_TEXT } };
        }
      }
    }

    // Configuração de Impressão (idêntica à API que funciona)
    ws.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.2, right: 0.2, top: 0.4, bottom: 0.2, header: 0, footer: 0 }
    };

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
    console.error("ERRO:", error);
    return res.status(500).json({ error: error.message });
  }
}
