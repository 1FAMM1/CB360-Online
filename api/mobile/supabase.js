import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { path, method = "GET", body = null } = req.body;

    if (!path) return res.status(400).json({ error: "Falta o path" });

    const SUPABASE_URL = "https://rjkbodfqsvckvnhjwmhg.supabase.co";
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    const supabaseRes = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await supabaseRes.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao conectar com o Supabase" });
  }
