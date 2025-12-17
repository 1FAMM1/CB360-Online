    import nextConnect from 'next-connect';
    import multer from 'multer';
    import FormData from 'form-data';
    import fetch from 'node-fetch';
    import { createClient } from '@supabase/supabase-js';
    const upload = multer();
    const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const TOKEN = '7966236313:AAHxnDaMxRFxujCdB_Cu4RZ1ObzftkaPNZU';
    const apiRoute = nextConnect({
      onError(error, req, res) {
        res.status(500).json({ success: false, error: error.message });
      },
      onNoMatch(req, res) {
        res.status(405).json({ success: false, error: 'Method not allowed' });
      },
    });
    apiRoute.use(upload.array('photos'));
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
          const media = files.slice(0, 10).map((file, index) => ({
            type: 'photo',
            media: `attach://photo${index}`,
            caption: index === 0 && message ? message : undefined,
            parse_mode: index === 0 && message ? 'HTML' : undefined,
          }));
          const formData = new FormData();
          formData.append('chat_id', CHAT_ID);
          formData.append('media', JSON.stringify(media));
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
