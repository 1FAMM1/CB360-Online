import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { htmlContent, shift, date } = req.body;
    if (!htmlContent || !shift || !date)
      return res.status(400).json({ error: "Faltam htmlContent, shift ou date" });

    // 🚀 Gerar PDF com Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "10px", right: "10px" },
    });

    await browser.close();

    // 📧 Enviar por email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL, // ou outro destinatário
      subject: `Planeamento Diário - ${shift} ${date}`,
      text: `Segue em anexo o planeamento diário ${shift} - ${date}`,
      attachments: [
        {
          filename: `planeamento_${date}_${shift}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).json({ success: true, message: "PDF gerado e email enviado!" });
  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ error: err.message });
  }
}
