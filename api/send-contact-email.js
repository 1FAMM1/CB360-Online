import nodemailer from "nodemailer";

const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};

export default async function handler(req, res) {
  // Configuração de CORS para permitir pedidos do teu painel
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Utilize POST." });
  }

  try {
    const { to, subject, message } = req.body || {};

    // Validação de dados essenciais
    if (!to || !subject || !message) {
      return res.status(400).json({
        error: "Faltam dados essenciais para o envio.",
        details: "Certifique-se que preencheu o destinatário, o assunto e o corpo da mensagem."
      });
    }

    // Configuração do Transportador do Nodemailer (usando o teu Gmail atual)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD }
    });        

    // Envio do e-mail
    await transporter.sendMail({
      from: GMAIL_EMAIL,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #111827 100%); color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">Corpo de Bombeiros de Faro</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #93c5fd;">Mensagem Enviada via Painel CB360 Online</p>
            </div>
            <div style="padding: 24px; line-height: 1.6; font-size: 14px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
              Por favor, não responda diretamente a este e-mail automático.
            </div>
          </div>
        </div>
      `,
      // Versão em texto limpo caso o cliente do elemento não suporte HTML
      text: message 
    });

    return res.status(200).json({
      success: true,
      message: "E-mail enviado com sucesso em segundo plano."
    });

  } catch (err) {
    console.error("Erro no processo de envio de email:", err);
    return res.status(500).json({
      error: "Erro ao enviar o e-mail.",
      details: err.message
    });
  }
}
