 export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, photo } = req.body;

  // Verifica se há algo para enviar
  if (!message && !photo) {
    return res.status(400).json({ error: 'Mensagem ou foto vazia' });
  }

  const TOKEN = 'YOUR_BOT_TOKEN_HERE';
  const CHAT_ID = 'YOUR_CHAT_ID_HERE';

  let endpoint = '';
  let body = { chat_id: CHAT_ID };

  try {
    if (photo) {
      // Se tiver foto, envia como foto (com legenda opcional)
      endpoint = 'sendPhoto';
      body.photo = photo; // pode ser URL ou Base64
      if (message) body.caption = message;
      body.parse_mode = 'HTML';
    } else {
      // Se só tiver texto
      endpoint = 'sendMessage';
      body.text = message;
      body.parse_mode = 'HTML';
    }

    const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!telegramRes.ok) {
      const text = await telegramRes.text();
      return res.status(500).json({ success: false, error: text });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
