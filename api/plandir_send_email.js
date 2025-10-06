import nodemailer from "nodemailer";
import formidable from "formidable";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const { shift, date } = fields;
    const file = files.file;

    if (!file || !shift || !date) {
      return res.status(400).json({ error: "Faltam dados" });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL, // ou múltiplos separados por vírgula
        subject: "AUTO_PLANEAMENTO",
        text: `Planeamento ${shift} - ${date}`,
        attachments: [
          {
            filename: file.originalFilename,
            path: file.filepath
          }
        ]
      });

      res.status(200).json({ success: true, message: "Email enviado!" });
    } catch (err) {
      console.error("Erro ao enviar email:", err);
      res.status(500).json({ error: "Erro ao enviar email", details: err.message });
    }
  });
}
