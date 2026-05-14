import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult, SDKError, ServiceUsageError, ServiceApiError} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: {bodyParser: {sizeLimit: "10mb"}},
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

const TEMPLATES = {
  saloc:  "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_saloc_template.xlsx",
  global: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_global_template.xlsx"
};

async function workbookToPdfBuffer(workbook, prefix = "doc") {
  const tempDir = os.tmpdir();
  const inputFilePath  = path.join(tempDir, `${prefix}_${Date.now()}.xlsx`);
  const outputFilePath = path.join(tempDir, `${prefix}_${Date.now()}_out.pdf`);
  const cleanup = () => {
    try {if (fs.existsSync(inputFilePath))  fs.unlinkSync(inputFilePath);} catch {}
    try {if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);} catch {}
  };
  try {
    await workbook.xlsx.writeFile(inputFilePath);
    const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
    const pdfServices = new PDFServices({credentials});
    const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX});
    const job = new CreatePDFJob({inputAsset});
    const pollingURL = await pdfServices.submit({job});
    const pdfServicesResponse = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
    const streamAsset = await pdfServices.getContent({asset: pdfServicesResponse.result.asset});
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
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({error: "Método não permitido"});

  try {
    const {type, data} = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({error: "Dados incompletos"});
    }
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({error: "Chaves Adobe não configuradas"});
    }
    if (!["saloc", "global", "ambos"].includes(type)) {
      return res.status(400).json({error: "Tipo inválido. Use: saloc, global ou ambos"});
    }

    // Separar por grupo
    const sqx = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "SQX");
    const tqs = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "TQS");

    const {PDFDocument} = await import("pdf-lib");
    const mergedPdf = await PDFDocument.create();

    // ─── TEMPLATE SALOC ───────────────────────────────────
    if (type === "saloc" || type === "ambos") {
      const tplRes = await fetch(TEMPLATES.saloc);
      if (!tplRes.ok) throw new Error("Erro ao carregar template SALOC");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];

      ws.pageSetup = {
  paperSize: 9,          // Formato A4
  orientation: 'portrait',
  fitToPage: true,       // Ativar o ajuste automático
  fitToWidth: 1,         // Forçar a largura a caber numa página
  fitToHeight: 0,        // Deixar a altura livre (cria nova página se necessário)
  margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0, footer: 0 }
};

      // SQX - só nomes por turno
      const sqx0700 = sqx.filter(u => u.utent_shift === "07:00-12:00");
      const sqx1100 = sqx.filter(u => u.utent_shift === "11:00-17:00");
      const sqx1600 = sqx.filter(u => u.utent_shift === "16:00-23:00");
      sqx0700.forEach((u, i) => { if (i < 7) ws.getCell(`B${14 + i}`).value = u.utent_name || ""; });
      sqx1100.forEach((u, i) => { if (i < 7) ws.getCell(`B${22 + i}`).value = u.utent_name || ""; });
      sqx1600.forEach((u, i) => { if (i < 7) ws.getCell(`B${30 + i}`).value = u.utent_name || ""; });

      // TQS - só nomes por turno
      const tqs0700 = tqs.filter(u => u.utent_shift === "07:00-12:00");
      const tqs1100 = tqs.filter(u => u.utent_shift === "11:00-17:00");
      const tqs1600 = tqs.filter(u => u.utent_shift === "16:00-23:00");
      tqs0700.forEach((u, i) => { if (i < 7) ws.getCell(`B${57 + i}`).value = u.utent_name || ""; });
      tqs1100.forEach((u, i) => { if (i < 7) ws.getCell(`B${65 + i}`).value = u.utent_name || ""; });
      tqs1600.forEach((u, i) => { if (i < 7) ws.getCell(`B${73 + i}`).value = u.utent_name || ""; });

      const salocPdf = await workbookToPdfBuffer(workbook, "hemo_saloc");
      const salocDoc = await PDFDocument.load(salocPdf);
      const salocPages = await mergedPdf.copyPages(salocDoc, salocDoc.getPageIndices());
      salocPages.forEach(p => mergedPdf.addPage(p));
    }

    // ─── TEMPLATE GLOBAL ──────────────────────────────────
    if (type === "global" || type === "ambos") {
      const tplRes = await fetch(TEMPLATES.global);
      if (!tplRes.ok) throw new Error("Erro ao carregar template GLOBAL");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];

      // SQX - todos os dados linha 13
      sqx.forEach((u, i) => {
        if (i >= 21) return;
        const row = 13 + i;
        ws.getCell(`A${row}`).value = u.utent_name     || "";
        ws.getCell(`B${row}`).value = u.utent_niss     || "";
        ws.getCell(`C${row}`).value = u.utent_adress   || "";
        ws.getCell(`D${row}`).value = u.utent_localitie|| "";
        ws.getCell(`E${row}`).value = u.utent_desteny  || "";
        ws.getCell(`F${row}`).value = u.utent_contact  || "";
        ws.getCell(`G${row}`).value = u.utent_position || "";
      });

      // TQS - todos os dados linha 37
      tqs.forEach((u, i) => {
        if (i >= 21) return;
        const row = 37 + i;
        ws.getCell(`A${row}`).value = u.utent_name     || "";
        ws.getCell(`B${row}`).value = u.utent_niss     || "";
        ws.getCell(`C${row}`).value = u.utent_adress   || "";
        ws.getCell(`D${row}`).value = u.utent_localitie|| "";
        ws.getCell(`E${row}`).value = u.utent_desteny  || "";
        ws.getCell(`F${row}`).value = u.utent_contact  || "";
        ws.getCell(`G${row}`).value = u.utent_position || "";
      });

      const globalPdf = await workbookToPdfBuffer(workbook, "hemo_global");
      const globalDoc = await PDFDocument.load(globalPdf);
      const globalPages = await mergedPdf.copyPages(globalDoc, globalDoc.getPageIndices());
      globalPages.forEach(p => mergedPdf.addPage(p));
    }

    const pdfBuffer = await mergedPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Hemodialises.pdf`);
    return res.status(200).send(Buffer.from(pdfBuffer));

  } catch (err) {
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      return res.status(500).json({error: "Erro no serviço Adobe", details: err.message});
    }
    console.error("Erro hemodialysis_convert_and_send:", err);
    return res.status(500).json({error: "Erro ao processar", details: err?.message || String(err)});
  }
}
