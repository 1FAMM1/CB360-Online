    import nodemailer from 'nodemailer';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({success: false, error: 'Método não permitido'});
  const {to, subject, message, corpOperNr, corpName, logoUrl, senderName, isBulk, cc, attachment} = req.body;
  if (!to || !subject || !message) return res.status(400).json({success: false, error: 'Campos obrigatórios em falta'});
  const senderDisplayName = `CB360 Online - ${corpOperNr || 'Corporação'}`;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {user: process.env.GMAIL_EMAIL, pass: process.env.GMAIL_APP_PASSWORD},
  });
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: #333333; }
        .email-container { max-width: 1000px; margin: 25px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .email-header { background: linear-gradient(135deg, #a70c0c 0%, #d81c1c 50%, #b91010 100%); padding: 15px 20px; text-align: center; color: #ffffff; }
        .brand-logo { max-height: 75px; width: auto; margin-bottom: 12px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2)); }
        .email-header h2 { margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.4; }
        .email-header p { margin: 6px 0 0 0; font-size: 13px; color: #fecaca; opacity: 0.9; }
        .email-body { padding: 15px 10px; line-height: 1.6; font-size: 14px; }
        .message-box { background-color: #f8fafc; border-left: 4px solid #d81c1c; padding: 20px; margin: 0 0 25px 0; border-radius: 0 6px 6px 0; white-space: pre-line; color: #1e293b; font-size: 14.5px; }
        .signature-section { margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 13px; color: #475569; }
        .signature-user { font-weight: bold; font-size: 14px; color: #1e293b; text-transform: uppercase; margin-bottom: 2px; }
        .signature-corp { font-weight: bold; color: #d81c1c; font-size: 12px; text-transform: uppercase; margin-bottom: 2px; }
        .signature-contacts { color: #475569; font-size: 11.5px; }
        .eco-note { font-size: 11px; color: #16a34a; margin-top: 25px; line-height: 1.4; }
        .confidentiality-note { font-size: 10px; color: #94a3b8; margin-top: 15px; line-height: 1.4; text-align: justify; border-top: 1px solid #f1f5f9; padding-top: 10px; }
        .email-footer { background-color: #f9fafb; padding: 18px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logótipo" class="brand-logo" height="100" style="height: 100px; max-height: 100px;" />` : ''}
          <h2>${corpName}</h2>
          <p>Mensagem Enviada via CB360 Online</p>
        </div>
        <div class="email-body">
          <div class="message-box">${message}</div>
          <div style="margin-top:20px; margin-bottom:10px; font-size:14px; color:#1e293b;">
  Com os melhores cumprimentos,
</div>
          <div class="signature-section">
            <div class="signature-user">${senderName}</div>
            <div class="signature-corp">CORPO DE BOMBEIROS DE FARO CRUZ LUSA</div>
            <div class="signature-contacts">
              Rua Comandante Francisco Manuel, 7 a 13 | 8000-250 Faro | Portugal<br>
              Telem.: +351 917 629 626 | Telef: +351 289 803 066
            </div>
          </div>
          <div class="eco-note">
            🌱 <strong>Antes de imprimir este e-mail pense bem se é mesmo necessário.</strong> Poupe eletricidade, toner e papel.
          </div>
          <div class="confidentiality-note">
            <strong>AVISO DE CONFIDENCIALIDADE:</strong><br>
            Esta mensagem e quaisquer anexos, podem conter informação confidencial para uso exclusivo do destinatário. Cabe ao destinatário assegurar a verificação de vírus e outras medidas que assegurem que esta mensagem não afeta os seus sistemas. Se não for o destinatário, não deverá usar, distribuir ou copiar este email, devendo proceder à sua eliminação e informar o emissor. É estritamente proibido o uso, a distribuição, a cópia ou qualquer forma de disseminação não autorizada deste email e dos seus anexos. Obrigado.
          </div>
        </div>
        <div class="email-footer">
          &copy; ${new Date().getFullYear()} CB360 Online - Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
  `;
  let mailOptions = {
    from: `"${senderDisplayName}" <${process.env.GMAIL_EMAIL}>`,
    subject: subject,
    html: htmlTemplate,
  };
  if (isBulk && Array.isArray(cc)) {
    mailOptions.to = process.env.GMAIL_EMAIL;
    mailOptions.cc = cc;
  } else {
    mailOptions.to = to;
  }
  if (attachment) {
    mailOptions.attachments = [{
      filename: attachment.filename,
      content: attachment.content,
      encoding: 'base64'
    }];
  }
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({success: true, message: 'Processado com sucesso!'});
  } catch (error) {
    console.error('Erro de envio:', error);
    return res.status(500).json({success: false, error: error.message});
  }
}
