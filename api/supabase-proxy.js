// api/supabase-proxy.js - Versão 3.0 (Corrigida a Variável e Adicionado Debug)

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = process.env.CB_ANON_KEY; // Usa o novo nome

export default async function handler(req, res) {
  // CRUCIAL: Log de debug para ver no Vercel Dashboard
  console.log("CHAVE CB_ANON_KEY CARREGADA:", !!SUPABASE_KEY); 

  if (!SUPABASE_KEY) {
    // ERRO CORRIGIDO PARA USAR O NOME CERTO DA VARIÁVEL
    console.error("ERRO DE CONFIGURAÇÃO: CB_ANON_KEY não está definida.");
    return res.status(500).json({ 
      error: 'Variável de ambiente de segurança em falta.',
      details: 'CB_ANON_KEY não carregada. Por favor, verifique se a variável está definida no Vercel.' 
    });
  }

  try {
    let path = req.query.path;
    if (!path) return res.status(400).json({ error: 'Missing ?path=' });

    path = path.replace(/^\/+/, '');
    const queryIndex = path.indexOf('?');
    const basePath = queryIndex > -1 ? path.substring(0, queryIndex) : path;
    const queryString = queryIndex > -1 ? path.substring(queryIndex) : '';
    const supabaseURL = `${SUPABASE_URL}/${basePath}${queryString}`;

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };
    
    if (req.headers['prefer']) {
        headers['Prefer'] = req.headers['prefer'];
    }

    const options = { method: req.method, headers };

    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }
    
    // MENSAGEM DE DEBUG PARA VER SE O SUPABASE RESPONDE
    console.log(`A enviar pedido para: ${supabaseURL}`);
    
    const supabaseResponse = await fetch(supabaseURL, options);
    
    // MENSAGEM DE DEBUG PARA VER O STATUS HTTP DO SUPABASE
    console.log(`Resposta do Supabase Status: ${supabaseResponse.status}`);


    res.status(supabaseResponse.status);
    supabaseResponse.headers.forEach((value, name) => {
        res.setHeader(name, value);
    });

    const contentType = supabaseResponse.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await supabaseResponse.json();
      // MENSAGEM DE DEBUG PARA VER OS DADOS
      console.log('Dados recebidos (Length):', body.length || 0); 
      res.json(body);
    } else {
      body = await supabaseResponse.text();
      res.send(body);
    }

  } catch (err) {
    console.error("Proxy Internal Error:", err);
    res.status(500).json({ error: "Proxy internal error", details: err.message });
  }
}
