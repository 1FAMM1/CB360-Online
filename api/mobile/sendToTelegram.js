import nextConnect from 'next-connect';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const upload = multer();

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
// Service Role Key — ignora RLS. Nunca expor no frontend, só aqui no backend.
// Definir no Vercel em: Project Settings > Environment Variables > SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TOKEN = '8596696700:AAGpN0uh_XPAjDkajIR-Wpey8_EkWFPjbPI';

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(405).json({ success: false, error: 'Method not allowed' });
  },
});

apiRoute.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

apiRoute.use(upload.array('photos'));

apiRoute.post(async (req, res) => {
  const { message, corp_oper_nr } = req.body;
  const files = req.files || [];

  if (!corp_oper_nr) return res.status(400).json({ success: false, error: 'corp_oper_nr é obrigatório' });
  if (!message && files.length === 0) return res.status(400).json({ success: false, error: 'Mensagem ou fotos vazias' });

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor' });
  }

  // Cliente com Service Role: acesso direto, sem restrições de RLS.
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabase
      .from('corporation_data')
      .select('chat_id')
      .eq('corp_oper_nr', corp_oper_nr)
      .single();

    if (error || !data?.chat_id) {
      return res.status(404).json({ success: false, error: 'Chat ID não encontrado para a corporação' });
    }

    const CHAT_ID = data.chat_id;

    if (files.length > 0) {
      const formData = new FormData();
      const media = files.slice(0, 10).map((file, index) => ({
        type: 'photo',
        media: `attach://file${index}`,
        caption: index === 0 && message ? message : undefined,
        parse_mode: index === 0 && message ? 'HTML' : undefined,
      }));

      formData.append('chat_id', CHAT_ID);
      formData.append('media', JSON.stringify(media));

      files.slice(0, 10).forEach((file, index) => {
        formData.append(`file${index}`, Buffer.from(file.buffer), { filename: file.originalname });
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

export const config = {
  api: { bodyParser: false },
};

export default apiRoute;
