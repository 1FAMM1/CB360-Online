import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verifica conexão
    await transporter.verify();

    const info = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL,
      subject: "Teste API Email",
      text: "Este é um teste de envio de email."
    });

    return res.status(200).json({ 
      success: true, 
      messageId: info.messageId 
    });

  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ 
      error: err.message,
      code: err.code,
      command: err.command
    });
  }
}
