    export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { caption, photo } = req.body; // photo deve ser Base64 ou URL
  if (!photo) return res.status(400).json({ error: 'Foto vazia' });

  const TOKEN = '8014555896:AAEb3ulaMJknmxvLKMln0H4N_lmZ7U0z6rI';
  const CHAT_ID = '7961378096';

  try {
    // Se a foto for Base64, Telegram aceita "data:image/jpeg;base64,..."
    const body = {
      chat_id: CHAT_ID,
      photo: photo, // Base64 ou URL
      caption: caption || '', // texto opcional
      parse_mode: 'HTML'
    };

    const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
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
