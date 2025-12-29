import fetch from "node-fetch";

/* =================== SUPABASE HEADERS (GENÉRICO) =================== */
function getSupabaseHeaders(options = {}) {
  const headers = {
    apikey: process.env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json"
  };

  const prefer = [];

  if (options.returnRepresentation) {
    prefer.push("return=representation");
  }

  if (options.count) {
    prefer.push(`count=${options.count}`);
  }

  if (options.prefer) {
    prefer.push(options.prefer);
  }

  if (prefer.length > 0) {
    headers["Prefer"] = prefer.join(",");
  }

  return headers;
}

/* ============================ HANDLER ============================= */
export default async function handler(req, res) {
  /* === CORS === */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const SUPABASE_URL = "https://rjkbodfqsvckvnhjwmhg.supabase.co";

    let path, method, bodyContent, options = {};

    if (req.method === "GET") {
      path = req.query.path;
      method = "GET";
    } else {
      const {
        path: bPath,
        method: bMethod = req.method,
        body = null,
        options: bOptions = {}
      } = req.body || {};

      path = bPath;
      method = bMethod;
      bodyContent = body ? JSON.stringify(body) : undefined;
      options = bOptions;
    }

    if (!path) {
      return res.status(400).json({ error: "É necessário informar o path" });
    }

    const supaRes = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: getSupabaseHeaders(options),
      body: bodyContent
    });

    const text = await supaRes.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return res.status(supaRes.status).json(data);

  } catch (err) {
    console.error("Supabase proxy error:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
