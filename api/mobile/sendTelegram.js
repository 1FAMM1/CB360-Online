import nextConnect from 'next-connect';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const upload = multer(); // processa uploads multipart/form-data

// Config Supabase
const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Token do bot
const TOKEN = '8411352322:AAGlROALJiNcy4HgP4_Pkod30kQr85QHKxo';

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  },
});

// Middleware para múltiplos arquivos
apiRoute.use(upload.array('photos'));

// CORS
apiRoute.options((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

apiRoute.post(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { message, corp_oper_nr } = req.body;
  const files = req.files || [];

  if (!corp_oper_nr) {
    return res.status(400).json({ success: false, error: 'corp_oper_nr é obrigatório' });
  }
  if (!message && files.length === 0) {
    return res.status(400).json({ success: false, error: 'Mensagem ou fotos vazias' });
  }

  try {
    // 1️⃣ Buscar chat_id da corporação no Supabase
    const { data, error } = await supabase
      .from('corporation_chats')
      .select('chat_id')
      .eq('corp_oper_nr', corp_oper_nr)
      .single();

    if (error || !data?.chat_id) {
      return res.status(404).json({ success: false, error: 'Chat ID não encontrado para a corporação' });
    }

    const CHAT_ID = data.chat_id;

    // 2️⃣ Criar item na "fila" (simples: tabela no Supabase)
    const { error: queueError } = await supabase
      .from('telegram_queue')
      .insert({
        corp_oper_nr,
        chat_id: CHAT_ID,
        message,
        files: files.length > 0 ? JSON.stringify(files.map(f => ({
          originalname: f.originalname,
          buffer: f.buffer.toString('base64'), // salva em base64 temporariamente
          mimetype: f.mimetype
        }))) : null,
        status: 'pending', // pending -> worker vai processar
      });

    if (queueError) {
      return res.status(500).json({ success: false, error: queueError.message });
    }

    // ✅ Resposta imediata: request recebeu, envio será feito pelo worker
    return res.status(200).json({ success: true, queued: true });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default apiRoute;
