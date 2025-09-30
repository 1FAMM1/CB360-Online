import nodemailer from "nodemailer";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

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

    // ===== 1️⃣ Criar HTML com layout igual ao frontend =====
    const hora = shift === "D" ? "08:00-20:00" : "20:00-08:00";
    const tableHTML = tables.map(tbl => {
      const rowsHTML = tbl.rows.map(r => `
        <tr>
          <td>${r.n_int || ""}</td>
          <td>${r.patente || ""}</td>
          <td>${r.nome || ""}</td>
          <td>${r.entrada || ""}</td>
          <td>${r.saida || ""}</td>
          <td>${r.MP ? "X" : ""}</td>
          <td>${r.TAS ? "X" : ""}</td>
          <td>${r.obs || ""}</td>
        </tr>
      `).join('');

      return `
        <div style="margin-bottom:20px;">
          <h3>${tbl.title}</h3>
          <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width:100%;">
            <thead>
              <tr>
                <th>N. Int.</th>
                <th>Patente</th>
                <th>Nome</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>MP</th>
                <th>TAS</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 4px; text-align: left; }
            th { background: #eee; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Planeamento Diário - Turno ${shift} - ${date} (${hora})</h2>
          ${tableHTML}
        </body>
      </html>
    `;

    // ===== 2️⃣ Gerar PDF com Puppeteer =====
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    // ===== 3️⃣ Enviar PDF por email =====
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
      text: `Segue em anexo o planeamento diário ${shift} - ${date}`,
      attachments: [
        {
          filename: `planeamento_${date}_${shift}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    return res.status(200).json({ success: true, message: "PDF gerado e email enviado!" });
  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ error: err.message });
  }
}
