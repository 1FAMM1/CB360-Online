const SUPABASE_URL = '/api/supabase-proxy?path=';
    function getSupabaseHeaders(prefer) {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (prefer) headers['Prefer'] = prefer;
      return headers;
    }   
async function fetchSupabase(path, options = {}) {
  const url = SUPABASE_PROXY + encodeURIComponent(path);
  const resp = await fetch(url, {
    method: options.method || 'GET',
    headers: getSupabaseHeaders(options),
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!resp.ok) throw new Error(`Erro Supabase: ${resp.status}`);
  return resp.json();
}
