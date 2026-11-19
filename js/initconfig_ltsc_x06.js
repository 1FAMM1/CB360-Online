    /* =======================================
    INITIAL CONFIG
    ======================================= */
    const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0';
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
          sessionStorage.clear();
          window.location.href = "index.html";
        }
      } catch (e) {
        console.error("Erro ao validar token:", e);
      }
    }
    checkSessionExpiration();
    setInterval(checkSessionExpiration, 60000);
    /* =======================================
    BIBLIOTECAS SÓ QUANDO SÃO PRECISAS
    - XLSX (exportar listagem de ocorrências) e PDF-LIB (folhas de ponto do RH) já não carregam
      no arranque: são pedidas na primeira vez que se usam e ficam em memória.
    ======================================= */
    const CB360_LIBS = {
      xlsx:   {url: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', ready: () => !!window.XLSX},
      pdflib: {url: 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js', ready: () => !!window.PDFLib}
    };
    const cb360LibPromises = {};
    function cb360LoadLib(name) {
      const lib = CB360_LIBS[name];
      if (!lib) return Promise.reject(new Error(`Biblioteca desconhecida: ${name}`));
      if (lib.ready()) return Promise.resolve();
      if (!cb360LibPromises[name]) {
        cb360LibPromises[name] = new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = lib.url;
          s.onload = () => lib.ready() ? resolve() : reject(new Error(`Biblioteca ${name} não ficou disponível`));
          s.onerror = () => { delete cb360LibPromises[name]; s.remove(); reject(new Error(`Não foi possível carregar a biblioteca ${name}`)); };
          document.head.appendChild(s);
        });
      }
      return cb360LibPromises[name];
    }
