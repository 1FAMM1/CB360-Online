import fetch from "node-fetch";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const SUPABASE_URL = "https://rjkbodfqsvckvnhjwmhg.supabase.co";
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    let path, method, bodyContent;
    if (req.method === "GET") {
      path = req.query.path;
      method = "GET";
      bodyContent = undefined;
    } else {
      const { path: bPath, method: bMethod = req.method, body: bBody = null } = req.body || {};
      path = bPath;
      method = bMethod;
      bodyContent = bBody ? JSON.stringify(bBody) : undefined;
    }
    if (!path) return res.status(400).json({ error: "É necessário informar o path" });
    const supaRes = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: bodyContent
    });
    const data = await supaRes.json();
    return res.status(supaRes.ok ? 200 : supaRes.status).json(data);
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
