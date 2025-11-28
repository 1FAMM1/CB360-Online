const SUPABASE_PROXY = '/api/supabase-proxy?path=';

function getSupabaseHeaders(options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (options.returnRepresentation) headers['Prefer'] = 'return=representation';
  return headers;
}
