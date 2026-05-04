import nodemailer from "nodemailer";

const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { to, subject, body } = req.body || {};

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Faltam dados essenciais (to, subject, body)." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: GMAIL_EMAIL,
      to,
      subject,
      html: body
    });

    return res.status(200).json({ success: true, message: "Email enviado com sucesso." });

  } catch (err) {
    console.error("Erro no envio de email:", err);
    return res.status(500).json({ error: "Erro no envio de email", details: err.message });
  }
}
