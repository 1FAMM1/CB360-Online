// Este código pressupõe que está num ambiente Node.js/Vercel
// e que a variável de ambiente SUPABASE_ANON_KEY está configurada no Vercel.

const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
// Usa a variável de ambiente do Vercel
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY; 

export default async function handler(req, res) {
    
    // --- 1. Verificação de Chave ---
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
        
        // --- 2. Validação do Caminho ---
        if (!path) {
            return res.status(400).json({ error: 'Missing ?path=' });
        }
        
        // Remove barras iniciais se existirem
        path = path.replace(/^\/+/, '');
        
        // --- 3. Construção da URL (CORRIGIDA) ---
        // Usa o path completo (ex: rest/v1/tabela?select=coluna&filtro=eq.valor)
        // para evitar problemas de codificação de URL com filtros.
        const supabaseURL = `${SUPABASE_URL}/${path}`;
        
        // --- 4. Headers de Autenticação ---
        const headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        };    
        
        // Propaga o header 'Prefer' (ex: para return=minimal)
        if (req.headers['prefer']) headers['Prefer'] = req.headers['prefer'];

        // --- 5. Opções da Requisição ---
        const options = { 
            method: req.method, 
            headers 
        };
        
        // Adiciona o corpo para métodos que não são GET (POST, PATCH, DELETE)
        if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
            options.body = JSON.stringify(req.body);
        }

        // --- 6. Execução do Fetch ---
        console.log(`Enviando pedido para: ${supabaseURL}`);
        const supabaseResponse = await fetch(supabaseURL, options);
        console.log(`Resposta do Supabase Status: ${supabaseResponse.status}`);
        
        // --- 7. Passagem de Headers de Volta ---
        supabaseResponse.headers.forEach((value, name) => {
            // Evita erros comuns de proxy com headers de codificação/conexão
            if (!['content-encoding', 'transfer-encoding', 'connection'].includes(name.toLowerCase())) {
                res.setHeader(name, value);
            }
        });

        // --- 8. Retorno da Resposta ---
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
