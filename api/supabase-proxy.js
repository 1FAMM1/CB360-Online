// api/supabase-proxy.js

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    // 1) ler path via query (como o frontend já faz)
    const path = req.query.path;

    if (!path) {
      return res.status(400).json({ error: 'Missing ?path=' });
    }

    // 2) construir URL final para o Supabase
    const supabaseURL = `${SUPABASE_URL}${path}`;

    // 3) preparar headers
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };

    // 4) preparar opções do fetch
    const options = {
      method: req.method,
      headers
    };

    // 5) incluir body se não for GET
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }

    // 6) enviar request ao Supabase
    const supabaseResponse = await fetch(supabaseURL, options);
    const text = await supabaseResponse.text();

    // 7) devolver status e resposta original
    res.status(supabaseResponse.status).send(text);

  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({
      error: "Proxy internal error",
      details: err.message
    });
  }
}
