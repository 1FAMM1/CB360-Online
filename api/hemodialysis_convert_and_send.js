import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult } from "@adobe/pdfservices-node-sdk";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

const TEMPLATES = {
  saloc: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_saloc_template.xlsx",
  global: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_global_template.xlsx"
};

async function workbookToPdfBuffer(workbook, prefix = "doc") {
  const tempDir = os.tmpdir();
  const inputFilePath = path.join(tempDir, `${prefix}_${Date.now()}.xlsx`);
  const outputFilePath = path.join(tempDir, `${prefix}_${Date.now()}_out.pdf`);
  const cleanup = () => {
    try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch { }
    try { if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch { }
  };
  try {
    await workbook.xlsx.writeFile(inputFilePath);
    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });
    const inputAsset = await pdfServices.upload({ readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX });
    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const resAdobe = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: resAdobe.result.asset });
    const writeStream = fs.createWriteStream(outputFilePath);
    streamAsset.readStream.pipe(writeStream);
    await new Promise((res, rej) => { writeStream.on("finish", res); writeStream.on("error", rej); });
    const buf = fs.readFileSync(outputFilePath);
    cleanup();
    return buf;
  } catch (err) { cleanup(); throw err; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { type, data } = req.body;
    const { PDFDocument } = await import("pdf-lib");
    const mergedPdf = await PDFDocument.create();

    // 1. LÓGICA SALOC (Turnos - Portrait)
    if (type === "saloc" || type === "ambos") {
      const sqx = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "SQX");
      const tqs = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "TQS");

      const tplRes = await fetch(TEMPLATES.saloc);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];

      ws.pageSetup = { 
        paperSize: 9, 
        orientation: 'portrait', 
        fitToPage: false,
        margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.4, header: 0, footer: 0 }
      };
      ws.getRow(43).addPageBreak();

      // Preenchimento SALOC (Lógica de turnos específicos)
      sqx.filter(u => u.utent_shift === "07:00-12:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${14 + i}`).value = u.utent_name; });
      sqx.filter(u => u.utent_shift === "11:00-17:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${22 + i}`).value = u.utent_name; });
      sqx.filter(u => u.utent_shift === "16:00-23:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${30 + i}`).value = u.utent_name; });

      tqs.filter(u => u.utent_shift === "07:00-12:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${57 + i}`).value = u.utent_name; });
      tqs.filter(u => u.utent_shift === "11:00-17:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${65 + i}`).value = u.utent_name; });
      tqs.filter(u => u.utent_shift === "16:00-23:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${73 + i}`).value = u.utent_name; });

      const pdfBuf = await workbookToPdfBuffer(workbook, "saloc");
      const doc = await PDFDocument.load(pdfBuf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // 2. LÓGICA GLOBAL (Listagem Detalhada - LANDSCAPE)
    if (type === "global" || type === "ambos" || type === "saloc") {
      const sqxGlobal = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "SQX");
      const tqsGlobal = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "TQS");

      const tplRes = await fetch(TEMPLATES.global);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];
      
      // FORÇAR LANDSCAPE AQUI
      ws.pageSetup = { 
        paperSize: 9, 
        orientation: 'landscape', 
        fitToPage: true, 
        fitToWidth: 1, 
        fitToHeight: 0 
      };

      const fillGlobal = (list, startRow) => {
        list.forEach((u, i) => {
          if (i >= 21) return;
          const r = startRow + i;
          ws.getCell(`B${r}`).value = u.utent_name || "";
          ws.getCell(`C${r}`).value = u.utent_niss || "";
          ws.getCell(`D${r}`).value = u.utent_adress || "";
          ws.getCell(`E${r}`).value = u.utent_localitie || "";
          ws.getCell(`F${r}`).value = u.utent_desteny || "";
          ws.getCell(`G${r}`).value = u.utent_contact || "";
          ws.getCell(`H${r}`).value = u.utent_position || "";
        });
      };

      fillGlobal(sqxGlobal, 13);
      fillGlobal(tqsGlobal, 37);

      const pdfBuf = await workbookToPdfBuffer(workbook, "global");
      const doc = await PDFDocument.load(pdfBuf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    const finalPdf = await mergedPdf.save();
    const dataHoje = new Date().toLocaleDateString('pt-PT').replace(/\//g, '-');
    const nomeFicheiro = `Listagem_Hemo_${type}_${dataHoje}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${nomeFicheiro}"`);
    res.status(200).send(Buffer.from(finalPdf));

  } catch (err) {
    res.status(500).json({ error: "Erro", details: err.message });
  }
}
