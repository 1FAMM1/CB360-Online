import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult, SDKError, ServiceUsageError, ServiceApiError } from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

const TEMPLATES = {
  saloc: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_saloc_template.xlsx",
  global: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_global_template.xlsx"
};

// Função para converter o Workbook preenchido em Buffer PDF via Adobe
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
    const pdfServicesResponse = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const streamAsset = await pdfServices.getContent({ asset: pdfServicesResponse.result.asset });

    const writeStream = fs.createWriteStream(outputFilePath);
    streamAsset.readStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const pdfBuffer = fs.readFileSync(outputFilePath);
    cleanup();
    return pdfBuffer;
  } catch (err) {
    cleanup();
    throw err;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { type, data } = req.body;

    if (!data || !Array.isArray(data)) return res.status(400).json({ error: "Dados incompletos" });
    if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).json({ error: "Chaves Adobe não configuradas" });

    const sqx = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "SQX");
    const tqs = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "TQS");

    const { PDFDocument } = await import("pdf-lib");
    const mergedPdf = await PDFDocument.create();

    // --- TEMPLATE SALOC ---
    if (type === "saloc" || type === "ambos") {
      const tplRes = await fetch(TEMPLATES.saloc);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];

      // Configuração de Impressão para SALOC
      ws.pageSetup = {
        paperSize: 9,
        orientation: 'portrait',
        fitToPage: false, // Mantém escala original para respeitar as 2 páginas
        margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0, footer: 0 }
      };
      ws.getRow(50).addPageBreak(); // Garante que TQS começa na página 2

      // Limpeza de células (evita nomes do template original)
      for (let i = 14; i <= 36; i++) ws.getCell(`B${i}`).value = null;
      for (let i = 57; i <= 79; i++) ws.getCell(`B${i}`).value = null;

      // Preenchimento SQX (Pág 1)
      sqx.filter(u => u.utent_shift === "07:00-12:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${14 + i}`).value = u.utent_name; });
      sqx.filter(u => u.utent_shift === "11:00-17:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${22 + i}`).value = u.utent_name; });
      sqx.filter(u => u.utent_shift === "16:00-23:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${30 + i}`).value = u.utent_name; });

      // Preenchimento TQS (Pág 2)
      tqs.filter(u => u.utent_shift === "07:00-12:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${57 + i}`).value = u.utent_name; });
      tqs.filter(u => u.utent_shift === "11:00-17:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${65 + i}`).value = u.utent_name; });
      tqs.filter(u => u.utent_shift === "16:00-23:00").forEach((u, i) => { if (i < 7) ws.getCell(`B${73 + i}`).value = u.utent_name; });

      const pdfBuf = await workbookToPdfBuffer(workbook, "saloc");
      const doc = await PDFDocument.load(pdfBuf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // --- TEMPLATE GLOBAL ---
    if (type === "global" || type === "ambos") {
      const tplRes = await fetch(TEMPLATES.global);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];

      ws.pageSetup = { 
        paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
        margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0, footer: 0 } 
      };

      const fillGlobal = (list, startRow) => {
        list.forEach((u, i) => {
          if (i >= 21) return;
          const r = startRow + i;
          ws.getCell(`A${r}`).value = u.utent_name || "";
          ws.getCell(`B${r}`).value = u.utent_niss || "";
          ws.getCell(`C${r}`).value = u.utent_adress || "";
          ws.getCell(`D${r}`).value = u.utent_localitie || "";
          ws.getCell(`E${r}`).value = u.utent_desteny || "";
          ws.getCell(`F${r}`).value = u.utent_contact || "";
          ws.getCell(`G${r}`).value = u.utent_position || "";
        });
      };

      fillGlobal(sqx, 13);
      fillGlobal(tqs, 37);

      const pdfBuf = await workbookToPdfBuffer(workbook, "global");
      const doc = await PDFDocument.load(pdfBuf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    const finalPdf = await mergedPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(Buffer.from(finalPdf));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar", details: err.message });
  }
}
