// pages/api/plandir_pdf_email.js
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

function generateCorporateHTML(shift, date, tables) {
  const shiftHours = shift === 'D' ? '08:00-20:00' : '20:00-08:00';

  const header = `
    <header style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #004080; padding-bottom:10px; margin-bottom:20px;">
      <img src="https://via.placeholder.com/150x60.png?text=LOGO" style="height:60px">
      <h1 style="color:#004080;font-size:24px;">Planeamento Diário</h1>
    </header>
    <div style="margin-bottom:20px;font-weight:bold;">
      Dia: ${date} | Turno ${shift} | ${shiftHours}
    </div>
  `;

  let tablesHTML = '';
  tables.forEach(tbl => {
    let rowsHTML = tbl.rows.map(r => `
      <tr>
        <td>${r.n_int || ''}</td>
        <td>${r.patente || ''}</td>
        <td>${r.nome || ''}</td>
        <td>${r.entrada || ''}</td>
        <td>${r.saida || ''}</td>
        <td style="text-align:center;">${r.MP ? 'X' : ''}</td>
        <td style="text-align:center;">${r.TAS ? 'X' : ''}</td>
        <td>${r.obs || ''}</td>
      </tr>
    `).join('');

    tablesHTML += `
      <h3 style="margin-top:20px;">${tbl.title}</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background-color:#cce0ff;">
            <th>N. Int.</th><th>Patente</th><th>Nome</th><th>Entrada</th><th>Saída</th><th>MP</th><th>TAS</th><th>Observações</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    `;
  });

  const footer = `
    <footer style="border-top:2px solid #004080; text-align:center; font-size:10px; padding-top:10px; color:#666;">
      Empresa XYZ - Contacto: info@empresa.pt - Telefone: +351 123 456 789
    </footer>
  `;

  return `<html><body style="font-family:Arial, sans-serif;">${header}${tablesHTML}${footer}</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { shift, date, tables, recipients } = req.body;

    if (!shift || !date || !tables || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: "Faltam shift, date, tables ou recipients" });
    }

    // 1️⃣ Gerar HTML corporativo
    const html = generateCorporateHTML(shift, date, tables);

    // 2️⃣ Gerar PDF com Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 3️⃣ Enviar e-mail com nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: recipients.join(","),
      subject: `Planeamento Diário ${shift} - ${date}`,
      text: `Segue em anexo o planeamento diário do turno ${shift} para o dia ${date}.`,
      attachments: [
        {
          filename: `Planeamento_${date}_${shift}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    return res.status(200).json({ success: true, message: "PDF gerado e email enviado!" });

  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ error: "Erro ao gerar PDF ou enviar email", details: err.message });
  }
}
