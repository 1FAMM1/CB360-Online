// pages/api/plandir_pdf_email.js
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { PassThrough } from 'stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { shift, date, tables, recipients } = req.body;

    if (!shift || !date || !tables || !Array.isArray(tables) || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Faltam shift, date, tables ou recipients' });
    }

    // Criar PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    const bufferStream = new PassThrough();

    doc.pipe(bufferStream);

    // Cabeçalho
    doc.fontSize(20).text('Planeamento Diário', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Dia: ${date} | Turno: ${shift}`);
    doc.moveDown();

    // Tabelas
    tables.forEach(tbl => {
      doc.fontSize(14).text(tbl.title, { underline: true });
      doc.moveDown(0.5);

      // Cabeçalho da tabela
      doc.fontSize(10).text(
        'N. Int. | Patente | Nome | Entrada | Saída | MP | TAS | Observações'
      );

      tbl.rows.forEach(r => {
        doc.text(
          `${r.n_int || ''} | ${r.patente || ''} | ${r.nome || ''} | ${r.entrada || ''} | ${r.saida || ''} | ${r.MP ? 'X' : ''} | ${r.TAS ? 'X' : ''} | ${r.obs || ''}`
        );
      });

      doc.moveDown();
    });

    // Rodapé
    doc.moveDown(2);
    doc.fontSize(10).text('Empresa XYZ - Contacto: info@empresa.pt - Telefone: +351 123 456 789', { align: 'center' });

    doc.end();

    bufferStream.on('data', chunk => chunks.push(chunk));
    bufferStream.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);

        // Configurar Nodemailer
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });

        // Enviar email
        await transporter.sendMail({
          from: process.env.GMAIL_EMAIL,
          to: recipients.join(','),
          subject: `Planeamento Diário ${shift} - ${date}`,
          text: `Segue em anexo o planeamento diário do turno ${shift} para o dia ${date}.`,
          attachments: [
            {
              filename: `Planeamento_${date}_${shift}.pdf`,
              content: pdfBuffer
            }
          ]
        });

        console.log('Email enviado com sucesso!');
        return res.status(200).json({ success: true, message: 'PDF gerado e email enviado!' });
      } catch (emailErr) {
        console.error('Erro ao enviar email:', emailErr);
        return res.status(500).json({ error: 'Erro ao enviar email', details: emailErr.message });
      }
    });

    bufferStream.on('error', pdfErr => {
      console.error('Erro ao gerar PDF:', pdfErr);
      return res.status(500).json({ error: 'Erro ao gerar PDF', details: pdfErr.message });
    });

  } catch (err) {
    console.error('Erro inesperado no handler:', err);
    return res.status(500).json({ error: 'Erro inesperado', details: err.message });
  }
}
