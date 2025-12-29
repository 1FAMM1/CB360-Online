import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    const { method = "GET", path, body } = req.body;

    if (!path) return res.status(400).json({ error: "O path do Supabase é obrigatório" });

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao conectar ao Supabase" });
  }
}
