    /* =======================================
    INITIAL CONFIG
    ======================================= */
    const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

function getSupabaseHeaders(options = {}) {

  const corp = sessionStorage.getItem("currentCorpOperNr");
  const nint = sessionStorage.getItem("currentNInt");

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'x-my-corpo': corp,
    'x-my-nint': nint,
  };

  if (options.returnRepresentation) {
    headers['Prefer'] = 'return=representation';
  }

  return headers;
}
