import fetch from "node-fetch";

export default async function handler(req, res) {
  // === CORS ===
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou restrinja ao seu domínio
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const SUPABASE_URL = "https://rjkbodfqsvckvnhjwmhg.supabase.co";
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    // Pegando informações do body ou query
    const { path, method = req.method, body = null } = req.body || {};

    if (!path && ["POST","PATCH","DELETE"].includes(req.method)) {
      return res.status(400).json({ error: "É necessário informar o path" });
    }

    const url = path ? `${SUPABASE_URL}${path}` : SUPABASE_URL;

    const supaRes = await fetch(url, {
      method,
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await supaRes.json();
    return res.status(supaRes.ok ? 200 : supaRes.status).json(data);

  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
