import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { PassThrough } from 'stream';

export default async function handler(req, res) {
  const { shift, date, tables, recipients } = req.body;

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const bufferStream = new PassThrough();
  const chunks = [];

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
    const pdfBuffer = Buffer.concat(chunks);

    // Enviar email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: recipients.join(','),
      subject: `Planeamento Diário ${shift} - ${date}`,
      text: `Segue em anexo o planeamento diário do turno ${shift} para o dia ${date}.`,
      attachments: [{ filename: `Planeamento_${date}_${shift}.pdf`, content: pdfBuffer }]
    });

    res.status(200).json({ success: true });
  });
}
