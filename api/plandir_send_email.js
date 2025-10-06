import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { pdfBase64, shift, date, recipients } = req.body || {};

    if (!pdfBase64 || !shift || !date) {
      return res.status(400).json({ error: "Faltam dados" });
    }

    // Para teste, variáveis direto no código
    const GMAIL_EMAIL = "fmartins.ahbfaro@gmail.com";
    const GMAIL_APP_PASSWORD = "xsimbfgitjbmrruf";

    // Se não passar destinatários, envia para você mesmo
    const toEmails = Array.isArray(recipients) && recipients.length > 0
      ? recipients.join(", ")
      : GMAIL_EMAIL;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true para SSL
      auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: GMAIL_EMAIL,
      to: toEmails,
      subject: `AUTO_PLANEAMENTO - ${shift} - ${date}`,
      text: `Segue em anexo o planeamento do turno ${shift} do dia ${date}.`,
      attachments: [
        {
          filename: `planeamento_${date}_${shift}.pdf`,
          content: Buffer.from(pdfBase64, "base64")
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email enviado:", info);

    return res.status(200).json({
      success: true,
      message: "Email enviado com sucesso!",
      info
    });

  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return res.status(500).json({
      error: "Erro ao enviar email",
      details: err.toString()
    });
  }
}
