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

    const headers = {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    };

    const options = { method, headers };
    if (body && method !== "GET") options.body = JSON.stringify(body);

    const supabaseRes = await fetch(`${SUPABASE_URL}${path}`, options);

    const text = await supabaseRes.text();
    try {
      // Tenta converter para JSON
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch {
      // Retorna texto cru se não for JSON
      return res.status(200).send(text);
    }

  } catch (err) {
    console.error("Erro na API:", err);
    return res.status(500).json({ error: "Erro ao conectar com o Supabase" });
  }
}
