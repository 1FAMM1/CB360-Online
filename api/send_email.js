/*************************************************************************
 * 🟦 CB360 ONLINE - API ENGINE
 * 🚀 Desenvolvido por: [Fábio Martins / Sistemas de Informação]
 * 📅 Ano: 2023 - 2026
 *
 * Descrição: Handler genérico para envio de e-mails simples (sem anexo/PDF).
 * Reutilizável por qualquer módulo do CB360 (Justificação de Picagens,
 * notificações, avisos, etc.) que apenas precise de enviar uma mensagem
 * com o template visual padrão da corporação.
 *************************************************************************/
import nodemailer from "nodemailer";
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const config = {api: {bodyParser: {sizeLimit: "5mb"}}};
/* ======================= TEMPLATE HTML PARTILHADO ======================= */
function buildEmailTemplate({title, subtitle, logoUrl, emailBody, corpName, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail,}) {
  const addressLine = [corpAddress, [corpCp, corpLocalitie].filter(Boolean).join(" "), "Portugal"]
    .filter(Boolean)
    .join(" | ");
  const phoneLine = [
    corpPhoneMobile ? `Telem.: ${corpPhoneMobile}` : "",
    corpPhoneLandline ? `Telef: ${corpPhoneLandline}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  const emailLine = corpEmail ? `Email: ${corpEmail}` : "";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: #333333;}
        .email-container {max-width: 1200px; margin: 25px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);}
        .email-header {background: linear-gradient(135deg, #a70c0c 0%, #d81c1c 50%, #b91010 100%); padding: 15px 20px; text-align: center; color: #ffffff;}
        .brand-logo {max-height: 75px; width: auto; margin-bottom: 12px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));}
        .email-header h2 {margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.4;}
        .email-header p {margin: 6px 0 0 0; font-size: 13px; color: #fecaca; opacity: 0.9;}
        .email-body {padding: 15px 10px; line-height: 1.6; font-size: 14px;}
        .message-box {background-color: #f8fafc; border-left: 4px solid #d81c1c; padding: 20px; margin: 0 0 25px 0; border-radius: 0 6px 6px 0; white-space: pre-line; color: #1e293b; font-size: 14.5px;}
        .signature-section {margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 13px; color: #475569;}
        .signature-corp {font-weight: bold; color: #d81c1c; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;}
        .signature-contacts {color: #475569; font-size: 11.5px;}
        .eco-note {font-size: 11px; color: #16a34a; margin-top: 25px; line-height: 1.4;}
        .confidentiality-note {font-size: 10px; color: #94a3b8; margin-top: 15px; line-height: 1.4; text-align: justify; border-top: 1px solid #f1f5f9; padding-top: 10px;}
        .email-footer {background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6;}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logotipo" class="brand-logo" height="100" style="height: 100px; max-height: 100px;" />` : ""}
          <h2>${title || ""}</h2>
          <p>${subtitle || ""}</p>
        </div>
        <div class="email-body">
          <div class="message-box">${emailBody || ""}</div>
          <div class="signature-section">
            <div class="signature-corp">${corpName || ""}</div>
            <div class="signature-contacts">
              ${addressLine}<br>
              ${phoneLine}<br>
              ${emailLine}
            </div>
          </div>
          <div class="eco-note">
             🌱 <strong>Antes de imprimir este e-mail pense bem se é mesmo necessário.</strong> Poupe eletricidade, toner e papel.
          </div>
          <div class="confidentiality-note">
            <strong>AVISO DE CONFIDENCIALIDADE:</strong><br>
            Esta mensagem e quaisquer anexos, podem conter informacao confidencial para uso exclusivo do destinatario. Cabe ao destinatario assegurar a verificacao de virus e outras medidas que assegurem que esta mensagem nao afeta os seus sistemas. Se nao for o destinatario, nao devera usar, distribuir ou copiar este email, devendo proceder a sua eliminacao e informar o emissor. E estritamente proibido o uso, a distribuicao, a copia ou qualquer forma de disseminacao nao autorizada deste email e dos seus anexos. Obrigado.
          </div>
        </div>
        <div class="email-footer">
          &copy; 2023 - ${new Date().getFullYear()} CB360 Mobile - Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
  `;
}
/* ============================ HANDLER PRINCIPAL =========================== */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido. Use POST." });
  try {
    const {recipients, ccRecipients, bccRecipients,  emailSubject, emailBody, title, subtitle, corp_oper_nr, logoUrl, corpName, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail,} = req.body || {};
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: "A lista de destinatários principais está vazia." });
    }
    if (!emailSubject || !emailBody) {
      return res.status(400).json({ error: "Faltam campos obrigatórios: emailSubject e/ou emailBody." });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
    });
    const htmlEmail = buildEmailTemplate({
      title: title || corpName || "",
      subtitle: subtitle || "",
      logoUrl: logoUrl || "",
      emailBody,
      corpName: corpName || "",
      corpAddress: corpAddress || "",
      corpCp: corpCp || "",
      corpLocalitie: corpLocalitie || "",
      corpPhoneMobile: corpPhoneMobile || "",
      corpPhoneLandline: corpPhoneLandline || "",
      corpEmail: corpEmail || "",
    });
    await transporter.sendMail({
      from: `"CB360 Mobile ${corp_oper_nr || "Corporacao"}" <${GMAIL_EMAIL}>`,
      to: recipients.join(", "),
      cc: ccRecipients && ccRecipients.length > 0 ? ccRecipients.join(", ") : "",
      bcc: bccRecipients && bccRecipients.length > 0 ? bccRecipients.join(", ") : "",
      subject: emailSubject,
      html: htmlEmail,
      text: emailBody.replace(/<[^>]*>/g, ""),
    });
    return res.status(200).json({
      success: true,
      message: `E-mail enviado com sucesso para ${recipients.length} destinatario(s).`,
    });
  } catch (err) {
    console.error("Erro no envio de email:", err);
    return res.status(500).json({
      error: "Erro no envio de email",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}
