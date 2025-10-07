import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendPlanningEmail({ base64Excel, shift, date, recipients }) {
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: recipients.join(','), // múltiplos destinatários
    subject: `Planeamento Diário - ${date} - Turno ${shift}`,
    text: `Segue em anexo o planeamento diário para o turno ${shift} do dia ${date}.`,
    attachments: [
      {
        filename: `Planeamento Diário ${date} ${shift}.xlsx`,
        content: Buffer.from(base64Excel, 'base64'),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

export async function emitPlanning(shift, date, tables, recipients = []) {
  // 1️⃣ Gerar o Excel via sua API ou função existente
  const response = await fetch(
    'https://corsproxy.io/?' + encodeURIComponent('https://cb360-mobile.vercel.app/api/plandir_emit'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shift, date, tables })
    }
  );

  if (!response.ok) throw new Error('Erro ao gerar planeamento');

  const blob = await response.blob();
  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64 = reader.result.split(',')[1];
    try {
      await sendPlanningEmail({ base64Excel: base64, shift, date, recipients });
      console.log('Email enviado com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar email:', err);
    }
  };

  reader.readAsDataURL(blob);
}
