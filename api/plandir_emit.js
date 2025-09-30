// pages/api/emitir_planeamento.js
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { shift, date, tables } = req.body || {};
    if (!shift || !date || !tables) {
      return res.status(400).json({ error: "Faltam shift, date ou tables" });
    }

    // 1️⃣ Gerar HTML do planeamento
    let html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          h2, h3 { margin: 5px 0; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: center; }
          th { background-color: #eee; }
        </style>
      </head>
      <body>
        <h2>Planeamento Diário - Turno ${shift} - ${date}</h2>
    `;

    tables.forEach(tbl => {
      html += `<h3>${tbl.title}</h3>`;
      html += `<table>
        <thead>
          <tr>
            <th>Nº Int</th>
            <th>Patente</th>
            <th>Nome</th>
            <th>Entrada</th>
            <th>Saída</th>
            <th>MP</th>
            <th>TAS</th>
            <th>Obs</th>
          </tr>
        </thead>
        <tbody>`;

      tbl.rows.forEach(r => {
        html += `<tr>
          <td>${r.n_int || ''}</td>
          <td>${r.patente || ''}</td>
          <td>${r.nome || ''}</td>
          <td>${r.entrada || ''}</td>
          <td>${r.saida || ''}</td>
          <td>${r.MP ? 'X' : ''}</td>
          <td>${r.TAS ? 'X' : ''}</td>
          <td>${r.obs || ''}</td>
        </tr>`;
      });

      html += `</tbody></table>`;
    });

    html += `</body></html>`;

    // 2️⃣ Gerar PDF com Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "10px", right: "10px" }
    });

    await browser.close();

    // 3️⃣ Enviar email com PDF
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL, // ou outro destinatário
      subject: `Planeamento Diário - ${shift} ${date}`,
      text: "Segue em anexo o planeamento diário.",
      attachments: [
        { filename: `planeamento_${date}_${shift}.pdf`, content: pdfBuffer }
      ]
    });

    return res.status(200).json({ success: true, message: "PDF gerado e email enviado!" });
  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ error: err.message });
  }
}
