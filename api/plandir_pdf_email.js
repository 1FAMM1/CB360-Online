const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  logger: true,   // logs detalhados
  debug: true     // debug SMTP
});

// Função para enviar email
async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Planeamento Diário" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject,
      text,
      html
    });

    console.log('=== EMAIL ENVIADO COM SUCESSO ===');
    console.log('MessageId:', info.messageId);
    console.log('Envelope:', info.envelope);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    console.log('Pending:', info.pending);
    console.log('Response completa:', info.response);

    if (info.rejected.length > 0) {
      console.warn('Emails rejeitados:', info.rejected);
    }

  } catch (err) {
    console.error('=== ERRO AO ENVIAR EMAIL ===');
    console.error('Mensagem de erro:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

// Teste rápido
sendMail(
  'fmartins.ahbfaro@gmail.com', // substituir pelo seu email de teste
  'Teste Nodemailer Completo',
  'Este é um teste de envio detalhado',
  '<b>Este é um teste de envio detalhado</b>'
);
