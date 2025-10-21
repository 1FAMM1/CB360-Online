export default async function handler(req, res) {
  // Permitir qualquer origem (ou coloque seu domínio no lugar de '*')
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end(); // Preflight

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem vazia' });

  const TOKEN = '8014555896:AAEb3ulaMJknmxvLKMln0H4N_lmZ7U0z6rI';
  const CHAT_ID = '7961378096';

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
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
