import fetch from 'node-fetch';

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_ANON_KEY não definida' });
  }

  try {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Missing ?path=' });

    // Remove possíveis barras no início
    path = path.replace(/^\/+/, '');

    // Divide entre caminho e query string
    const queryIndex = path.indexOf('?');
    const basePath = queryIndex > -1 ? path.substring(0, queryIndex) : path;
    const queryString = queryIndex > -1 ? path.substring(queryIndex) : '';

    const supabaseURL = `${SUPABASE_URL}/${basePath}${queryString}`;

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...req.headers['prefer'] ? { 'Prefer': req.headers['prefer'] } : {}
    };

    const options = { method: req.method, headers };
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length) {
      options.body = JSON.stringify(req.body);
    }

    const supabaseResponse = await fetch(supabaseURL, options);

    // Replicar headers importantes
    supabaseResponse.headers.forEach((value, name) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });

    const contentType = supabaseResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await supabaseResponse.json();
      res.status(supabaseResponse.status).json(body);
    } else {
      const body = await supabaseResponse.text();
      res.status(supabaseResponse.status).send(body);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: 'Erro interno no proxy', details: err.message });
  }
}
