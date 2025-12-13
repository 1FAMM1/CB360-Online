import nextConnect from 'next-connect';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';

const upload = multer(); // para processar uploads multipart/form-data

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  },
});

apiRoute.use(upload.array('photos')); // campo 'photos'

// CORS
apiRoute.options((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

apiRoute.post(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { message } = req.body;
  const files = req.files || [];

  if (!message && files.length === 0) {
    return res.status(400).json({ success: false, error: 'Mensagem ou fotos vazias' });
  }

  const TOKEN = '8014555896:AAEb3ulaMJknmxvLKMln0H4N_lmZ7U0z6rI';
      const CHAT_ID = '7961378096';

  try {
    if (files.length > 0) {
      // Telegram aceita até 10 fotos em sendMediaGroup
      const media = files.slice(0, 10).map((file, index) => ({
        type: 'photo',
        media: `attach://photo${index}`,
        caption: index === 0 && message ? message : undefined,
        parse_mode: index === 0 && message ? 'HTML' : undefined,
      }));

      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('media', JSON.stringify(media));

      // Adiciona cada foto ao FormData
      files.slice(0, 10).forEach((file, index) => {
        formData.append(`photo${index}`, file.buffer, { filename: file.originalname });
      });

      const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMediaGroup`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!telegramRes.ok) {
        const text = await telegramRes.text();
        return res.status(500).json({ success: false, error: text });
      }
    } else {
      // Apenas mensagem
      const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
      });

      if (!telegramRes.ok) {
        const text = await telegramRes.text();
        return res.status(500).json({ success: false, error: text });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export const config = { api: { bodyParser: false } };
export default apiRoute;
