import nextConnect from 'next-connect';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

/* Fotos: até 10, até 10 MB cada (a Mobile já as comprime antes de enviar) */
const upload = multer({ limits: { files: 10, fileSize: 10 * 1024 * 1024 } });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
// Service Role Key — ignora RLS. Só aqui no backend (Vercel > Environment Variables).
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Token do bot — SÓ no Vercel (Environment Variables > TELEGRAM_BOT_TOKEN), nunca no código.
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/* Valida o token do utilizador no Supabase (assinatura, validade, token revogado) */
async function whoami(userToken) {
  if (!userToken) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cb360_whoami`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (!r.ok) return null;
    const c = await r.json();
    return c && c.role === 'authenticated' && c.corp_oper_nr ? c : null;
  } catch {
    return null;
  }
}

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error('sendToTelegram:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    const tooBig = error && (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT');
    res.status(tooBig ? 400 : 500).json({ success: false, error: tooBig ? 'Fotos demasiado grandes ou em excesso' : 'Erro no envio' });
  },
  onNoMatch(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(405).json({ success: false, error: 'Method not allowed' });
  },
});

apiRoute.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

/* Só com sessão iniciada (antes de receber as fotos) */
apiRoute.use(async (req, res, next) => {
  const userToken = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const claims = await whoami(userToken);
  if (!claims) return res.status(401).json({ success: false, error: 'Sessão inválida' });
  req.cb360 = claims;
  next();
});

apiRoute.use(upload.array('photos'));

apiRoute.post(async (req, res) => {
  /* a corporação vem do token, não do pedido */
  const corp_oper_nr = String(req.cb360.corp_oper_nr);
  const message = String((req.body && req.body.message) || '');
  const files = req.files || [];

  if (!message && files.length === 0) return res.status(400).json({ success: false, error: 'Mensagem ou fotos vazias' });
  if (files.length > 0 ? message.length > 1024 : message.length > 4096) {
    return res.status(400).json({ success: false, error: 'Mensagem demasiado longa' });
  }
  if (!SUPABASE_SERVICE_ROLE_KEY || !TOKEN) {
    console.error('sendToTelegram: falta SUPABASE_SERVICE_ROLE_KEY ou TELEGRAM_BOT_TOKEN no Vercel');
    return res.status(500).json({ success: false, error: 'Configuração em falta' });
  }

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
    let telegramRes;

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
      telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMediaGroup`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });
    } else {
      telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
      });
    }

    if (!telegramRes.ok) {
      console.error('Telegram respondeu', telegramRes.status, await telegramRes.text());
      return res.status(502).json({ success: false, error: 'O Telegram recusou a mensagem' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('sendToTelegram:', err);
    return res.status(500).json({ success: false, error: 'Erro no envio' });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default apiRoute;
