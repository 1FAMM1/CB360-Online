import fetch from "node-fetch";

export default async function handler(req, res) {
  // === CORS ===
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou restringir para o domínio da AppCreator24
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Preflight request
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const SUPABASE_URL = "https://rjkbodfqsvckvnhjwmhg.supabase.co";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  try {
    const { path, method = "GET", body = null } = req.body;
    if (!path) return res.status(400).json({ error: "É necessário informar o path" });

    const supaRes = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await supaRes.json();
    if (!supaRes.ok) return res.status(supaRes.status).json(data);

    return res.status(200).json(data);

  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
