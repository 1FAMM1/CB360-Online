import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // ==========================================
  // CONFIGURAÇÃO DE CORS (Tratamento do Erro Preflight)
  // ==========================================
  // Permite que qualquer site (incluindo o StackBlitz) consulte esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Quando o browser faz a verificação prévia ("Preflight" ou pedido OPTIONS),
  // a API tem de responder imediatamente com o status 200 (OK)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas permite o processamento real em pedidos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  // ==========================================
  // PROCESSAMENTO DO E-MAIL
  // ==========================================
  const { to, subject, message, corpName, logoUrl } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios em falta' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: #333333; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .email-header { background: linear-gradient(135deg, #a70c0c 0%, #d81c1c 50%, #b91010 100%); padding: 25px 20px; text-align: center; color: #ffffff; }
        .brand-logo { max-height: 70px; width: auto; margin-bottom: 12px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2)); }
        .email-header h2 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 0.5px; }
        .email-header p { margin: 5px 0 0 0; font-size: 12px; color: #fecaca; opacity: 0.9; }
        .email-body { padding: 25px; line-height: 1.6; font-size: 14px; }
        .email-body h3 { color: #111827; margin-top: 0; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .message-box { background-color: #f8fafc; border-left: 4px solid #d81c1c; padding: 15px; margin: 15px 0; border-radius: 0 6px 6px 0; white-space: pre-line; color: #1e293b; }
        .email-footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logótipo" class="brand-logo" />` : ''}
          <h2>${corpName}</h2>
          <p>Mensagem Enviada via Painel CB360 Online</p>
        </div>
        <div class="email-body">
          <h3>Assunto: ${subject}</h3>
          <div class="message-box">${message}</div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 25px;">
            Este é um e-mail automático enviado a partir do módulo de listagem de contactos.
          </p>
        </div>
        <div class="email-footer">
          &copy; ${new Date().getFullYear()} CB360 Online
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${corpName}" <${process.env.GMAIL_EMAIL}>`,
    to: to,
    subject: subject,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erro interno no servidor' });
  }
}
