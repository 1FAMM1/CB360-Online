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

export const config = {
  api: { bodyParser: { sizeLimit: "5mb" } },
};

const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { year, month, employee, workingHours } = req.body;

    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const templateResponse = await fetch(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // --- CONFIGURAÇÕES DE CORES (IGUAL ÀS ESCALAS) ---
    const WEEKEND_COLOR = "F9E0B0"; 
    const HOLIDAY_COLOR = "F7C6C7"; 
    const CARNIVAL_COLOR = "D6ECFF"; // Azul claro para o Carnaval
    const DRIVER_BG = "FF69B4";      // Rosa Choque (Driver)
    const FE_BG = "00B0F0";          // Azul (FE)
    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    function breakStyle(cell) {
      cell.style = { ...(cell.style || {}) };
      if (cell.style.fill) cell.style.fill = { ...cell.style.fill };
      if (cell.style.font) cell.style.font = { ...cell.style.font };
    }

    function normalizeHex6(hex) {
      return String(hex || "FFFFFF").replace("#", "").toUpperCase().padStart(6, "0").slice(0, 6);
    }

    function isDarkHex(hex6) {
      const h = normalizeHex6(hex6);
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 150;
    }

    // --- LÓGICA DE FERIADOS (MELHORADA COM CARNAVAL) ---
    function getPortugalHolidaysInfo(y) {
      const fixed = [{m:1,d:1},{m:4,d:25},{m:5,d:1},{m:6,d:10},{m:8,d:15},{m:9,d:7},{m:10,d:5},{m:11,d:1},{m:12,d:1},{m:12,d:8},{m:12,d:25}];
      const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,mE=Math.floor((a+11*h+22*l)/451),monthE=Math.floor((h+l-7*mE+114)/31),dayE=((h+l-7*mE+114)%31)+1;
      const easter = new Date(y, monthE - 1, dayE, 12, 0, 0);
      const add = (base, ds) => { const nd = new Date(base); nd.setDate(nd.getDate() + ds); return nd; };
      
      const holidayMap = new Map();
      fixed.forEach(f => holidayMap.set(`${y}-${f.m}-${f.d}`, HOLIDAY_COLOR));
      
      // Feriados móveis
      holidayMap.set(`${add(easter,-47).getFullYear()}-${add(easter,-47).getMonth()+1}-${add(easter,-47).getDate()}`, CARNIVAL_COLOR);
      holidayMap.set(`${add(easter,-2).getFullYear()}-${add(easter,-2).getMonth()+1}-${add(easter,-2).getDate()}`, HOLIDAY_COLOR);
      holidayMap.set(`${easter.getFullYear()}-${easter.getMonth()+1}-${easter.getDate()}`, HOLIDAY_COLOR);
      holidayMap.set(`${add(easter,60).getFullYear()}-${add(easter,60).getMonth()+1}-${add(easter,60).getDate()}`, HOLIDAY_COLOR);
      
      return holidayMap;
    }

    const holidayMap = getPortugalHolidaysInfo(year);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Cabeçalho
    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours;
    worksheet.getCell("L44").value = employee.total || 0;

    // --- PREENCHIMENTO ---
    for (let d = 1; d <= 31; d++) {
      const row = 11 + d;
      const cellDia = worksheet.getCell(row, 2);
      const cellSemana = worksheet.getCell(row, 3);
      const cellTurno = worksheet.getCell(row, 4);
      const cellEntrada = worksheet.getCell(row, 5);
      const cellSaida = worksheet.getCell(row, 6);
      
      [cellDia, cellSemana, cellTurno, cellEntrada, cellSaida].forEach(breakStyle);

      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const wDay = date.getDay();
        const turno = (employee.shifts?.[d - 1] || "").toString().toUpperCase();

        cellDia.value = d;
        cellSemana.value = WEEKDAY_NAMES[wDay];
        cellTurno.value = turno;

        // 1. Lógica de Entrada/Saída Automática
        let ent = "", sai = "";
        const siglas = ["FE", "BX", "FO", "FI", "FJ", "LC", "LN", "LP", "DP"];
        if (siglas.includes(turno)) { ent = turno; sai = turno; }
        else if (turno === "D" || turno === "FR") { ent = "08:00"; sai = "20:00"; }
        else if (turno === "N") { ent = "20:00"; sai = "08:00"; }
        else if (turno === "M") { ent = "08:00"; sai = "15:00"; }
        cellEntrada.value = ent;
        cellSaida.value = sai;

        // 2. Pintar Dia e Semana (Feriados/Carnaval/FDS)
        const dateKey = `${year}-${month}-${d}`;
        let dateBg = holidayMap.get(dateKey) || ((wDay === 0 || wDay === 6) ? WEEKEND_COLOR : null);

        if (dateBg) {
          [cellDia, cellSemana].forEach(c => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + dateBg } };
            c.font = { bold: true, color: { argb: "FF000000" } };
          });
        }

        // 3. Pintar Turno com Lógica de Contraste
        const bgHex = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");
        cellTurno.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bgHex } };
        
        // Regra de texto: Drivers e FE sempre PRETO
        let textColor = (bgHex === DRIVER_BG || bgHex === FE_BG) ? "FF000000" : (isDarkHex(bgHex) ? "FFFFFFFF" : "FF000000");
        
        cellTurno.font = { bold: true, color: { argb: textColor } };

        [cellDia, cellSemana, cellTurno, cellEntrada, cellSaida].forEach(c => {
          c.alignment = { horizontal: "center", vertical: "middle" };
        });

      } else {
        worksheet.getRow(row).hidden = true;
      }
    }

    const tempDir = os.tmpdir();
    const xlsxPath = path.join(tempDir, `f_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(xlsxPath);

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(xlsxPath),
      mimeType: MimeType.XLSX,
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: result.result.asset });
    
    const chunks = [];
    for await (let chunk of streamAsset.readStream) { chunks.push(chunk); }
    fs.unlinkSync(xlsxPath);

    res.setHeader("Content-Type", "application/pdf");
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
