import FormData from 'form-data';
import fetch from 'node-fetch';
import multer from 'multer';
import nextConnect from 'next-connect';

// Configurar multer para receber arquivos
const upload = multer();

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  },
});

apiRoute.use(upload.array('photos')); // campo 'photos' do FormData

apiRoute.options((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

apiRoute.post(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { message } = req.body;
  const files = req.files; // array de arquivos enviados

  if (!message && (!files || files.length === 0)) {
    return res.status(400).json({ success: false, error: 'Mensagem ou foto vazia' });
  }

  const TOKEN = '8014555896:AAEb3ulaMJknmxvLKMln0H4N_lmZ7U0z6rI';
  const CHAT_ID = '7961378096';

  try {
    // Se houver fotos, enviar cada uma como 'sendPhoto'
    if (files && files.length > 0) {
      for (const file of files) {
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', file.buffer, { filename: file.originalname });
        if (message) form.append('caption', message);
        form.append('parse_mode', 'HTML');

        const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
          method: 'POST',
          body: form,
          headers: form.getHeaders(),
        });

        if (!telegramRes.ok) {
          const text = await telegramRes.text();
          return res.status(500).json({ success: false, error: text });
        }
      }
    } else {
      // Se não houver fotos, apenas enviar mensagem
      const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
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

export const config = {
  api: {
    bodyParser: false, // necessário para multer
  },
};

export default apiRoute;
