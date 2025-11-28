const SUPABASE_URL = '/api/supabase-proxy?path=';
    function getSupabaseHeaders(prefer) {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (prefer) headers['Prefer'] = prefer;
      return headers;
    }    
