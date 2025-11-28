// api/supabase-proxy.js

// A sua chave DEVE ser carregada pelo ambiente de execução (Vercel, Netlify, .env, etc.)
const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  // ADICIONADO: Verificação de segurança e depuração
  if (!SUPABASE_KEY) {
    console.error("ERRO DE CONFIGURAÇÃO: SUPABASE_ANON_KEY não está definida.");
    return res.status(500).json({ 
      error: 'Variável de ambiente de segurança em falta.',
      details: 'SUPABASE_ANON_KEY não carregada. Por favor, verifique o seu ficheiro .env ou as variáveis de ambiente na plataforma de hosting.' 
    });
  }

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
      // O Supabase precisa da chave nos headers 'apikey' e 'Authorization'
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };
    
    // 5) Headers opcionais do frontend (como 'Prefer' para formato de resposta)
    if (req.headers['prefer']) {
        headers['Prefer'] = req.headers['prefer'];
    }

    // 6) Preparar opções do fetch
    const options = { method: req.method, headers };

    // 7) Incluir body se não for GET
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }
    
    // 8) Fazer request ao Supabase
    const supabaseResponse = await fetch(supabaseURL, options);

    // 9) Copiar headers de volta para o cliente (ex: headers de erros do Supabase)
    supabaseResponse.headers.forEach((value, name) => {
        res.setHeader(name, value);
    });

    // 10) Processar a resposta
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
    console.error("Proxy Internal Error:", err);
    res.status(500).json({ error: "Proxy internal error", details: err.message });
  }
}
