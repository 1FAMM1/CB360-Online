import nextConnect from 'next-connect';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';

const upload = multer();

const apiRoute = nextConnect();

apiRoute.use(upload.array('photos')); // campo 'photos'

apiRoute.post(async (req, res) => {
  const { message } = req.body;
  const files = req.files;
      try {
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
      // apenas mensagem
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

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export const config = { api: { bodyParser: false } };
export default apiRoute;
