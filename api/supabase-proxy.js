// api/supabase-proxy.js

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    // 1) Ler path via query
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Missing ?path=' });

    // 2) Limpar barras iniciais
    path = path.replace(/^\/+/, '');

    // 3) Construir URL final (mantendo query string do frontend)
    const queryIndex = path.indexOf('?');
    const basePath = queryIndex > -1 ? path.substring(0, queryIndex) : path;
    const queryString = queryIndex > -1 ? path.substring(queryIndex) : '';
    const supabaseURL = `${SUPABASE_URL}/${basePath}${queryString}`;

    // 4) Preparar headers
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };

    // 5) Preparar opções do fetch
    const options = { method: req.method, headers };

    // 6) Incluir body se não for GET
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }

    // 7) Fazer request ao Supabase
    const supabaseResponse = await fetch(supabaseURL, options);

    // 8) Ler corpo da resposta
    const contentType = supabaseResponse.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await supabaseResponse.json();
      res.status(supabaseResponse.status).json(body);
    } else {
      body = await supabaseResponse.text();
      res.status(supabaseResponse.status).send(body);
    }

  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({ error: "Proxy internal error", details: err.message });
  }
}
