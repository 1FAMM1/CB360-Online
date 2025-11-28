// api/supabase-proxy.js - Proxy seguro Node 18+

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  console.log("CHAVE SUPABASE_ANON_KEY CARREGADA:", !!SUPABASE_KEY); 

  if (!SUPABASE_KEY) {
    console.error("ERRO: SUPABASE_ANON_KEY não definida.");
    return res.status(500).json({ 
      error: 'Variável de ambiente em falta.',
      details: 'SUPABASE_ANON_KEY não carregada no Vercel.'
    });
  }

  try {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Missing ?path=' });

    // Remove barra inicial se houver
    path = path.replace(/^\/+/, '');

    // Separar query string se existir
    const queryIndex = path.indexOf('?');
    const basePath = queryIndex > -1 ? path.substring(0, queryIndex) : path;
    const queryString = queryIndex > -1 ? path.substring(queryIndex) : '';
    const supabaseURL = `${SUPABASE_URL}/${basePath}${queryString}`;

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };
    
    if (req.headers['prefer']) headers['Prefer'] = req.headers['prefer'];

    const options = { method: req.method, headers };

    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }

    console.log(`Enviando pedido para: ${supabaseURL}`);

    const supabaseResponse = await fetch(supabaseURL, options);
    console.log(`Resposta do Supabase Status: ${supabaseResponse.status}`);

    // Replicar headers, ignorando content-encoding (gzip/br)
    supabaseResponse.headers.forEach((value, name) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });

    const contentType = supabaseResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await supabaseResponse.json();
      console.log('Dados recebidos (Length):', body.length || 0); 
      res.status(supabaseResponse.status).json(body);
    } else {
      const body = await supabaseResponse.text();
      res.status(supabaseResponse.status).send(body);
    }

  } catch (err) {
    console.error("Proxy Internal Error:", err);
    res.status(500).json({ error: "Proxy internal error", details: err.message });
  }
}
