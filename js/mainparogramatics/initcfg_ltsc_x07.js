    const SUPABASE_URL = '/api/supabase-proxy?path=';    
    function getSupabaseHeaders(options = {}) {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (options.returnRepresentation) {
        headers['Prefer'] = 'return=representation';
      }
      if (typeof options === 'string') {
        headers['Prefer'] = options;
      }
      return headers;
    }