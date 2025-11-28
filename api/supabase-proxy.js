// api/supabase-proxy.js
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    const { path, method = req.method, body } = req.query;

    if (!path) {
      return res.status(400).json({ error: 'Missing "path" query param' });
    }

    const supabaseEndpoint = `${SUPABASE_URL}${path}`;

    const response = await fetch(supabaseEndpoint, {
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(JSON.parse(body)) : undefined
    });

    const text = await response.text();

    res.status(response.status).send(text);

  } catch (err) {
    console.error('Supabase proxy error:', err);
    res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
