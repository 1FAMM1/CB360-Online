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
  global: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_global_template.xlsx",
  veiculos: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_veícs_template.xlsx"
};

// Função de ajuste: agora só aplica se a célula tiver valor
const fitCell = (cell) => {
  if (cell.value) {
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  } else {
    cell.value = null; // Garante que a célula fica "vazia" para o Excel
  }
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

    const sqx = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "SQX");
    const tqs = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "TQS");

    // 1. SALOC
    if (type === "saloc" || type === "ambos") {
      const tplRes = await fetch(TEMPLATES.saloc);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];
      ws.pageSetup = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
      ws.getRow(43).addPageBreak();

      const fillS = (list, rows) => {
        const shifts = ["07:00-12:00", "11:00-17:00", "16:00-23:00"];
        shifts.forEach((s, idx) => {
          const shiftData = list.filter(u => u.utent_shift === s);
          for (let i = 0; i < 7; i++) {
            const cell = ws.getCell(`B${rows[idx] + i}`);
            const u = shiftData[i];
            cell.value = u ? (u.utent_name || "") : null;
            fitCell(cell);
          }
        });
      };
      fillS(sqx, [14, 22, 30]);
      fillS(tqs, [57, 65, 73]);

      const pdfBuf = await workbookToPdfBuffer(workbook, "saloc");
      const doc = await PDFDocument.load(pdfBuf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // 2. VEÍCULOS
    if (type === "veículos" || type === "ambos") {
      const tplRes = await fetch(TEMPLATES.veiculos);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];
      ws.pageSetup = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
      ws.getRow(53).addPageBreak();

      const fillV = (list, startRows) => {
        const shifts = ["07:00-12:00", "11:00-17:00", "16:00-23:00"];
        shifts.forEach((s, idx) => {
          const shiftData = list.filter(u => u.utent_shift === s);
          for (let i = 0; i < 7; i++) {
            const r = startRows[idx] + i;
            const u = shiftData[i];
            const cells = [ws.getCell(`B${r}`), ws.getCell(`F${r}`), ws.getCell(`I${r}`)];
            
            if (u) {
              cells[0].value = u.utent_name || "";
              cells[1].value = u.utent_desteny || "";
              cells[2].value = u.utent_contact || "";
            } else {
              cells.forEach(c => c.value = null);
            }
            cells.forEach(fitCell);
          }
        });
      };
      fillV(sqx, [16, 28, 40]);
      fillV(tqs, [69, 81, 93]);

      const pdfBuf = await workbookToPdfBuffer(workbook, "veiculos");
      const doc = await PDFDocument.load(pdfBuf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // 3. GLOBAL (Intervalos 13-33 e 37-57)
    if (["saloc", "veículos", "veiculos", "ambos", "global"].includes(type)) {
      const tplRes = await fetch(TEMPLATES.global);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await tplRes.arrayBuffer());
      const ws = workbook.worksheets[0];
      ws.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };

      const fillG = (list, start) => {
        // Ordenamos por turno para manter a organização visual
        const sortedList = [...list].sort((a, b) => (a.utent_shift || "").localeCompare(b.utent_shift || ""));
        
        for (let i = 0; i < 21; i++) {
          const r = start + i;
          const u = sortedList[i];
          const cells = [
            ws.getCell(`B${r}`), ws.getCell(`C${r}`), ws.getCell(`D${r}`),
            ws.getCell(`E${r}`), ws.getCell(`F${r}`), ws.getCell(`G${r}`), ws.getCell(`H${r}`)
          ];

          if (u) {
            cells[0].value = u.utent_name || "";
            cells[1].value = u.utent_niss || "";
            cells[2].value = u.utent_adress || "";
            cells[3].value = u.utent_localitie || "";
            cells[4].value = u.utent_desteny || "";
            cells[5].value = u.utent_contact || "";
            cells[6].value = u.utent_position || "";
          } else {
            // Se não há utente, "limpamos" as células (ocultando dados residuais)
            cells.forEach(c => c.value = null);
          }
          cells.forEach(fitCell);
        }
      };

      fillG(sqx, 13);
      fillG(tqs, 37);

      const pdfBuf = await workbookToPdfBuffer(workbook, "global");
      const doc = await PDFDocument.load(pdfBuf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    const finalPdf = await mergedPdf.save();
    const dataHoje = new Date().toLocaleDateString('pt-PT').replace(/\//g, '-');
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Listagem_Hemo_${dataHoje}.pdf"`);
    res.status(200).send(Buffer.from(finalPdf));

  } catch (err) {
    res.status(500).json({ error: "Erro", details: err.message });
  }
}
