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

    // --- CORES ---
    const WEEKEND_COLOR = "F9E0B0"; 
    const HOLIDAY_COLOR = "F7C6C7"; 
    const CARNIVAL_COLOR = "D6ECFF"; 
    const DRIVER_BG = "FF69B4";
    const FE_BG = "00B0F0";
    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    function normalizeHex6(hex) {
      return String(hex || "FFFFFF").replace("#", "").toUpperCase().padStart(6, "0").slice(0, 6);
    }

    function isDarkHex(hex6) {
      const h = normalizeHex6(hex6);
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 150;
    }

    // --- FERIADOS MÓVEIS ---
    const getMovel = (y) => {
      const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,mE=Math.floor((a+11*h+22*l)/451),monthE=Math.floor((h+l-7*mE+114)/31),dayE=((h+l-7*mE+114)%31)+1;
      const easter = new Date(y, monthE - 1, dayE, 12, 0, 0);
      const add = (base, ds) => { const nd = new Date(base); nd.setDate(nd.getDate() + ds); return nd; };
      return {
        carnaval: add(easter, -47),
        sexta: add(easter, -2),
        pascoa: easter,
        corpo: add(easter, 60)
      };
    };

    const movel = getMovel(year);
    const fixed = [{m:1,d:1},{m:4,d:25},{m:5,d:1},{m:6,d:10},{m:8,d:15},{m:9,d:7},{m:10,d:5},{m:11,d:1},{m:12,d:1},{m:12,d:8},{m:12,d:25}];
    const daysInMonth = new Date(year, month, 0).getDate();

    worksheet.getCell("D8").value = employee.abv_name || "";
    worksheet.getCell("J8").value = employee.function || "";
    worksheet.getCell("L46").value = workingHours;
    worksheet.getCell("L44").value = employee.total || 0;

    for (let d = 1; d <= 31; d++) {
      const rowIdx = 11 + d;
      const row = worksheet.getRow(rowIdx);
      
      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const wDay = date.getDay();
        const turno = (employee.shifts?.[d - 1] || "").toString().toUpperCase();

        const cDia = row.getCell(2);
        const cSem = row.getCell(3);
        const cTur = row.getCell(4);
        const cEnt = row.getCell(5);
        const cSai = row.getCell(6);

        cDia.value = d;
        cSem.value = WEEKDAY_NAMES[wDay];
        cTur.value = turno;

        // Horários
        const siglas = ["FE", "BX", "FO", "FI", "FJ", "LC", "LN", "LP", "DP"];
        if (siglas.includes(turno)) { cEnt.value = turno; cSai.value = turno; }
        else if (turno === "D" || turno === "FR") { cEnt.value = "08:00"; cSai.value = "20:00"; }
        else if (turno === "N") { cEnt.value = "20:00"; cSai.value = "08:00"; }
        else if (turno === "M") { cEnt.value = "08:00"; cSai.value = "15:00"; }

        // Cor Feriado/FDS
        let bg = null;
        const isFixed = fixed.some(f => f.m === month && f.d === d);
        const isMovel = [movel.sexta, movel.pascoa, movel.corpo].some(h => h.getMonth()+1 === month && h.getDate() === d);
        const isCarnaval = movel.carnaval.getMonth()+1 === month && movel.carnaval.getDate() === d;

        if (isCarnaval) bg = CARNIVAL_COLOR;
        else if (isFixed || isMovel) bg = HOLIDAY_COLOR;
        else if (wDay === 0 || wDay === 6) bg = WEEKEND_COLOR;

        if (bg) {
          [cDia, cSem].forEach(c => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + bg } };
            c.font = { bold: true, color: { argb: "FF000000" } };
          });
        }

        // Cor Turno
        const shBg = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");
        cTur.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + shBg } };
        const txt = (shBg === DRIVER_BG || shBg === FE_BG) ? "FF000000" : (isDarkHex(shBg) ? "FFFFFFFF" : "FF000000");
        cTur.font = { bold: true, color: { argb: txt } };

        [cDia, cSem, cTur, cEnt, cSai].forEach(c => {
          c.alignment = { horizontal: "center", vertical: "middle" };
        });
      } else {
        row.hidden = true;
      }
    }

    const tempDir = os.tmpdir();
    const xlsxPath = path.join(tempDir, `f_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(xlsxPath);

    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(xlsxPath), mimeType: MimeType.XLSX });
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
    console.error("ERRO:", error);
    return res.status(500).json({ error: error.message });
  }
}
