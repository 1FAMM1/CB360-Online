import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import fs from "fs";
import puppeteer from "puppeteer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { GMAIL_EMAIL, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      success: false,
      error: "Variáveis de ambiente GMAIL_EMAIL ou GMAIL_APP_PASSWORD não definidas."
    });
  }

  try {
    const { excelBase64, shift, date } = req.body || {};
    if (!excelBase64 || !shift || !date) {
      return res.status(400).json({ error: "Faltam excelBase64, shift ou date" });
    }

    // Converte base64 para buffer
    const excelBuffer = Buffer.from(excelBase64, "base64");
    
    // Lê o Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
    const sheet = workbook.getWorksheet(1);

    // Converte planilha para HTML
    let html = `<table border="1" style="border-collapse: collapse;">`;
    sheet.eachRow((row) => {
      html += "<tr>";
      row.eachCell({ includeEmpty: true }, (cell) => {
        html += `<td style="padding:5px">${cell.value || ""}</td>`;
      });
      html += "</tr>";
    });
    html += "</table>";

    // Converte HTML para PDF usando Puppeteer
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Cria transporter e envia email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
      tls: { rejectUnauthorized: false }
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: GMAIL_EMAIL,
      to: GMAIL_EMAIL,
      subject: `Planeamento Diário ${date} - Turno ${shift}`,
      text: `Segue em anexo o planeamento do turno ${shift} do dia ${date} em PDF.`,
      attachments: [
        { filename: `Planeamento_${date}_${shift}.pdf`, content: pdfBuffer }
      ]
    });

    return res.status(200).json({ success: true, messageId: info.messageId });

  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
