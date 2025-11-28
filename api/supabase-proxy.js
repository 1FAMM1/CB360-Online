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
    
    if (!path) {
      return res.status(400).json({ error: 'Missing ?path=' });
    }

    // Decodificar o path (vem encoded do frontend)
    path = decodeURIComponent(path);
    
    // Remover barras iniciais
    path = path.replace(/^\/+/, '');
    
    // Separar base path e query string
    const queryIndex = path.indexOf('?');
    const basePath = queryIndex > -1 ? path.substring(0, queryIndex) : path;
    const queryString = queryIndex > -1 ? path.substring(queryIndex) : '';
    
    const supabaseURL = `${SUPABASE_URL}/${basePath}${queryString}`;
    
    // Headers para Supabase
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };
    
    // Adicionar header Prefer se existir
    if (req.headers['prefer']) {
      headers['Prefer'] = req.headers['prefer'];
    }
    
    // Configurar opções do fetch
    const options = { 
      method: req.method, 
      headers 
    };
    
    // Adicionar body para métodos não-GET
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }
    
    // ✅ CORRIGIDO: console.log com parênteses
    console.log(`Enviando pedido para: ${supabaseURL}`);
    console.log(`Método: ${req.method}`);
    
    // Fazer request para Supabase
    const supabaseResponse = await fetch(supabaseURL, options);
    
    // ✅ CORRIGIDO: console.log com parênteses
    console.log(`Resposta do Supabase Status: ${supabaseResponse.status}`);
    
    // Copiar headers relevantes da resposta
    supabaseResponse.headers.forEach((value, name) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });
    
    // Processar resposta
    const contentType = supabaseResponse.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await supabaseResponse.json();
      console.log('Dados recebidos (Quantidade):', Array.isArray(body) ? body.length : 'N/A');
      return res.status(supabaseResponse.status).json(body);
    } else {
      const body = await supabaseResponse.text();
      console.log('Resposta em texto (Length):', body.length);
      return res.status(supabaseResponse.status).send(body);
    }
    
  } catch (err) {
    console.error("❌ Proxy Internal Error:", err);
    console.error("Stack:", err.stack);
    return res.status(500).json({ 
      error: "Proxy internal error", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
