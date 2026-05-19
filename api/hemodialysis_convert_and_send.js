  import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import nodemailer from "nodemailer";
import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CreatePDFJob,
  CreatePDFResult
} from "@adobe/pdfservices-node-sdk";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

const TEMPLATES = {
  saloc: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_saloc_template.xlsx",
  global: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_global_template.xlsx",
  veiculos: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_veícs_template.xlsx",
  formacao: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/formation_template.xlsx",
  fleet_cards: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/fleet_cards_template.xlsx",
  equipment_request: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/request_equipment_template.xlsx",
  contact_list: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/contact_list_template.xlsx",
};

// ================= HELPERS =================
const fitCell = (cell) => {
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
};

const fitCellTemplate = (cell) => {
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
};

// ================= PDF ENGINE =================
async function workbookToPdfBuffer(workbook, prefix = "doc") {
  const tempDir = os.tmpdir();
  const inputFilePath = path.join(tempDir, `${prefix}_${Date.now()}.xlsx`);
  const outputFilePath = path.join(tempDir, `${prefix}_${Date.now()}.pdf`);

  const cleanup = () => {
    try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch {}
    try { if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath); } catch {}
  };

  try {
    await workbook.xlsx.writeFile(inputFilePath);

    const credentials = new ServicePrincipalCredentials({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });

    const pdfServices = new PDFServices({ credentials });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType: MimeType.XLSX
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });

    const result = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult
    });

    const streamAsset = await pdfServices.getContent({
      asset: result.result.asset
    });

    const writeStream = fs.createWriteStream(outputFilePath);
    streamAsset.readStream.pipe(writeStream);

    await new Promise((res, rej) => {
      writeStream.on("finish", res);
      writeStream.on("error", rej);
    });

    const buf = fs.readFileSync(outputFilePath);
    cleanup();
    return buf;

  } catch (err) {
    cleanup();
    throw err;
  }
}

// ================= EMAIL (API 02) =================
async function sendEmail(data) {
  const {
    to,
    subject,
    message,
    corpOperNr,
    corpName,
    logoUrl,
    senderName,
    isBulk,
    cc,
    attachment
  } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const ALWAYS_TO = [
    "comando0805.ahbfaro@gmail.com",
    "central0805.ahbfaro@gmail.com"
  ];

  const html = `
    <div style="font-family:Arial;background:#f3f4f6;padding:20px">
      <div style="max-width:900px;margin:auto;background:#fff">
        <div style="background:#d81c1c;color:#fff;padding:15px;text-align:center">
          ${logoUrl ? `<img src="${logoUrl}" style="height:70px"/>` : ""}
          <h2>${corpName || ""}</h2>
        </div>

        <div style="padding:20px;white-space:pre-line;background:#f8fafc;border-left:4px solid #d81c1c">
          ${message}
        </div>

        <div style="padding:20px">
          <b>${senderName || ""}</b><br/>
          CB360 Online
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `CB360 <${process.env.GMAIL_EMAIL}>`,
    subject,
    html
  };

  if (isBulk && Array.isArray(cc)) {
    mailOptions.to = ALWAYS_TO;
    mailOptions.cc = cc;
  } else {
    mailOptions.to = to;
  }

  if (attachment) {
    mailOptions.attachments = [{
      filename: attachment.filename,
      content: attachment.content,
      encoding: "base64"
    }];
  }

  return transporter.sendMail(mailOptions);
}

// ================= HANDLER =================
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { type, data } = req.body;
    const { PDFDocument } = await import("pdf-lib");
    const mergedPdf = await PDFDocument.create();

    // ================= EMAIL =================
    if (type === "email") {
      await sendEmail(data);
      return res.status(200).json({ success: true });
    }

    // ================= FORMAÇÃO =================
    if (type === "formacao") {
      const tpl = await fetch(TEMPLATES.formacao);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await tpl.arrayBuffer());

      const pdf = await workbookToPdfBuffer(wb, "formacao");
      const doc = await PDFDocument.load(pdf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // ================= EQUIPMENT =================
    if (type === "equipment_request") {
      const tpl = await fetch(TEMPLATES.equipment_request);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await tpl.arrayBuffer());
      const ws = wb.worksheets[0];

      ws.getCell("W12").value = data.requesting_name || "";
      ws.getCell("B14").value = data.requesting_cc || "";
      ws.getCell("Z14").value = data.requesting_contact || "";
      ws.getCell("B18").value = data.requesting_equipment || "";

      const pdf = await workbookToPdfBuffer(wb, "equipment");
      const doc = await PDFDocument.load(pdf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // ================= FLEET =================
    if (type === "fleet_cards") {
      const tpl = await fetch(TEMPLATES.fleet_cards);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await tpl.arrayBuffer());
      const ws = wb.worksheets[0];

      data.forEach((i, idx) => {
        const r = 13 + idx;
        ws.getCell(`C${r}`).value = i.vehicle;
        ws.getCell(`F${r}`).value = i.registration;
        ws.getCell(`I${r}`).value = i.contact;
        ws.getCell(`L${r}`).value = i.card_code;
      });

      const pdf = await workbookToPdfBuffer(wb, "fleet");
      const doc = await PDFDocument.load(pdf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // ================= CONTACTS =================
    if (type === "contact_list") {
      const tpl = await fetch(TEMPLATES.contact_list);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await tpl.arrayBuffer());
      const ws = wb.worksheets[0];

      const map = {
        QCOM: [9, 11],
        QATIV: [17, 116],
        QEST: [122, 142],
        QEA: [148, 157],
        QHR: [163, 182]
      };

      ws.getRow(117).addPageBreak();

      data.quadros.forEach(({ code, elements }) => {
        const m = map[code];
        if (!m) return;

        elements.slice(0, m[1] - m[0] + 1).forEach((e, i) => {
          const r = m[0] + i;

          ws.getCell(`B${r}`).value = e.n_int;
          ws.getCell(`C${r}`).value = e.patent;
          ws.getCell(`F${r}`).value = e.full_name;
          ws.getCell(`M${r}`).value = e.phone;
          ws.getCell(`N${r}`).value = e.mobile_phone;
          ws.getCell(`O${r}`).value = e.email;
        });
      });

      const pdf = await workbookToPdfBuffer(wb, "contacts");
      const doc = await PDFDocument.load(pdf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // ================= HEMODIÁLISES (IMPORTANTE - COMPLETO) =================
    const sqx = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "SQX");
    const tqs = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "TQS");

    if (type === "saloc" || type === "ambos") {
      const tpl = await fetch(TEMPLATES.saloc);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await tpl.arrayBuffer());
      const ws = wb.worksheets[0];

      const fill = (list, rows) => {
        const shifts = ["07:00-12:00", "11:00-17:00", "16:00-23:00"];
        shifts.forEach((s, i) => {
          list.filter(u => u.utent_shift === s).forEach((u, j) => {
            if (j < 7) ws.getCell(`B${rows[i] + j}`).value = u.utent_name;
          });
        });
      };

      fill(sqx, [14, 22, 30]);
      fill(tqs, [57, 65, 73]);

      const pdf = await workbookToPdfBuffer(wb, "saloc");
      const doc = await PDFDocument.load(pdf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    if (type === "veículos" || type === "ambos") {
      const tpl = await fetch(TEMPLATES.veiculos);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await tpl.arrayBuffer());
      const ws = wb.worksheets[0];

      const fill = (list, rows) => {
        const shifts = ["07:00-12:00", "11:00-17:00", "16:00-23:00"];
        shifts.forEach((s, i) => {
          list.filter(u => u.utent_shift === s).forEach((u, j) => {
            if (j < 7) {
              const r = rows[i] + j;
              ws.getCell(`B${r}`).value = u.utent_name;
              ws.getCell(`F${r}`).value = u.utent_desteny;
              ws.getCell(`I${r}`).value = u.utent_contact;
            }
          });
        });
      };

      fill(sqx, [16, 28, 40]);
      fill(tqs, [69, 81, 93]);

      const pdf = await workbookToPdfBuffer(wb, "veiculos");
      const doc = await PDFDocument.load(pdf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    if (["saloc", "veiculos", "veículos", "ambos", "global"].includes(type)) {
      const tpl = await fetch(TEMPLATES.global);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await tpl.arrayBuffer());
      const ws = wb.worksheets[0];

      const fill = (list, start) => {
        for (let i = 0; i < 21; i++) {
          const r = start + i;
          const u = list[i];
          if (!u) continue;

          ws.getCell(`B${r}`).value = u.utent_name;
          ws.getCell(`C${r}`).value = u.utent_niss;
          ws.getCell(`D${r}`).value = u.utent_adress;
          ws.getCell(`E${r}`).value = u.utent_localitie;
          ws.getCell(`F${r}`).value = u.utent_desteny;
          ws.getCell(`G${r}`).value = u.utent_contact;
          ws.getCell(`H${r}`).value = u.utent_position;
        }
      };

      fill(sqx, 13);
      fill(tqs, 37);

      const pdf = await workbookToPdfBuffer(wb, "global");
      const doc = await PDFDocument.load(pdf);
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    // ================= FINAL OUTPUT =================
    const final = await mergedPdf.save();
    return res.status(200).send(Buffer.from(final));

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
