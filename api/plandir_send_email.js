import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { GMAIL_EMAIL, GMAIL_APP_PASSWORD } = process.env;

  // Verifica se as variáveis de ambiente estão definidas
  if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      success: false,
      error: "Variáveis de ambiente GMAIL_EMAIL ou GMAIL_APP_PASSWORD não definidas.",
      details: {
        GMAIL_EMAIL: !!GMAIL_EMAIL,
        GMAIL_APP_PASSWORD: !!GMAIL_APP_PASSWORD
      }
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verifica conexão
    await transporter.verify();

    const info = await transporter.sendMail({
      from: GMAIL_EMAIL,
      to: GMAIL_EMAIL,
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
      success: false,
      error: err.message,
      code: err.code,
      command: err.command
    });
  }
}
