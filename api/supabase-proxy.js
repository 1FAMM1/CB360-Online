// api/supabase-proxy.js

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    // 1) Ler o path via query
    let path = req.query.path || '';
    if (!path) {
      return res.status(400).json({ error: 'Missing ?path=' });
    }

    // 2) Remover barra inicial se existir
    if (path.startsWith('/')) path = path.slice(1);

    // 3) Construir URL final para o Supabase
    const supabaseURL = `${SUPABASE_URL}/${path}`;

    // 4) Preparar headers
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };

    // 5) Preparar opções do fetch
    const options = {
      method: req.method,
      headers
    };

    // 6) Incluir body se não for GET
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }

    // 7) Enviar request ao Supabase
    const supabaseResponse = await fetch(supabaseURL, options);
    const text = await supabaseResponse.text();

    // 8) Retornar status + resposta original
    res.status(supabaseResponse.status).send(text);

  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({
      error: "Proxy internal error",
      details: err.message
    });
  }
}
