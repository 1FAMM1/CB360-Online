/*************************************************************************
 * CB360 — verificação de sessão comum a todas as APIs
 * Ficheiro com "_" no início: o Vercel NÃO o publica como API,
 * só serve para ser importado pelas outras.
 *
 * Uso, dentro do handler, logo a seguir ao OPTIONS:
 *   import { requireSession } from "./_cb360auth.js";
 *   const claims = await requireSession(req, res); if (!claims) return;
 *   // claims.corp_oper_nr, claims.n_int, claims.user_role (só Online) ...
 *************************************************************************/
const SB_URL = process.env.SUPABASE_URL || "https://rjkbodfqsvckvnhjwmhg.supabase.co";

export async function whoami(token) {
  if (!token) return null;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/cb360_whoami`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    if (!r.ok) return null;
    const c = await r.json();
    return c && c.role === "authenticated" && c.corp_oper_nr ? c : null;
  } catch {
    return null;
  }
}

/* Devolve os claims do token, ou responde 401 e devolve null */
export async function requireSession(req, res) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const claims = await whoami(token);
  if (!claims) {
    res.status(401).json({ success: false, error: "Sessão inválida" });
    return null;
  }
  return claims;
}

/* Só tokens do CB360 Online (têm user_role) ou do utilizador mestre */
export async function requireOnline(req, res) {
  const claims = await requireSession(req, res);
  if (!claims) return null;
  if (!claims.user_role && String(claims.corp_oper_nr) !== "0000") {
    res.status(403).json({ success: false, error: "Sem permissão" });
    return null;
  }
  return claims;
}
