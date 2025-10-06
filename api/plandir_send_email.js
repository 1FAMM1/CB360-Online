import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { excelBase64, shift, date } = req.body || {};

    if (!excelBase64 || !shift || !date) {
      return res.status(400).json({ error: "Faltam dados" });
    }

    // Variáveis de teste direto no código
    const GMAIL_EMAIL = "fmartins.ahbfaro@gmail.com";
    const GMAIL_APP_PASSWORD = "xsimbfgitjbmrruf";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: GMAIL_EMAIL,
      to: "fmartins.ahbfaro@gmail.com",
      subject: "AUTO_PLANEAMENTO",
      text: `Planeamento ${shift} - ${date}`,
      attachments: [
        {
          filename: `planeamento_${date}_${shift}.pdf`, // se você está usando PDF agora
          content: Buffer.from(excelBase64, "base64")
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Email enviado com sucesso!"
    });

  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return res.status(500).json({
      error: "Erro ao enviar email",
      details: err.message
    });
  }
}
