    /* =======================================
    INITIAL CONFIG
    ======================================= */
    const SUPABASE_URL = 'https://jbwwmjhtgblukrkvbabi.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impid3dtamh0Z2JsdWtya3ZiYWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMjE3ODIsImV4cCI6MjEwMDg5Nzc4Mn0.09w8ELO4BwJw51qFUeIWq6jbYSVHvopDTz1OJCeSwrE';
    function getSupabaseHeaders(options = {}) {
      const corp = sessionStorage.getItem("currentCorpOperNr"); 
      const nint = sessionStorage.getItem("currentNInt");
      const token = sessionStorage.getItem("authToken");
      const headers = {        
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-my-corpo': corp,
        'x-my-nint': nint,
      };
      if (options.returnRepresentation) {        
        headers['Prefer'] = 'return=representation';
      }
      return headers;
    }
    /* =======================================
    AUTOLOGOUT AUTOMÁTICO
    ======================================= */
    function checkSessionExpiration() {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;
      try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        if (now >= exp) {
          console.log("Sessão expirada pelo relógio interno.");
          sessionStorage.clear();
          window.location.href = "index.html";
        }
      } catch (e) {
        console.error("Erro ao validar token:", e);
      }
    }
    checkSessionExpiration();
    setInterval(checkSessionExpiration, 60000);
