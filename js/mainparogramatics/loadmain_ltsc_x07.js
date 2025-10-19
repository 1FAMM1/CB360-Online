    /* =======================================
       LOAD MAIN DATA
    ======================================= */
    document.addEventListener('DOMContentLoaded', () => {
      const currentUser = sessionStorage.getItem("currentUserName");
      const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
      const authNameEl = document.getElementById('authName');
      if (authNameEl) authNameEl.textContent = currentUserDisplay || "";
      /* ========= COPORATION DATA ========== */
      async function loadCorporationHeader() {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/corporation_data?select=corporation,logo_url&limit=1`, {
              headers: getSupabaseHeaders()
            }
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const corp = data[0];
            const titleEl = document.querySelector('.header-title');
            const logoEl = document.querySelector('.header-logo');
            if (titleEl) titleEl.textContent = corp.corporation;
            if (logoEl && corp.logo_url) logoEl.src = corp.logo_url;
          }
        } catch (error) {
          console.error("Erro ao carregar header da corporação:", error);
        }
      }
      loadCorporationHeader();
      /* ========== USER ACCESSES =========== */
      async function loadUserAccesses(userName) {
        if (!userName) return null;
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=acess,section&user_name=eq.${userName}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
        const data = await response.json();
        return data.length ? data[0] : null;
      }
      /* ========== USER BLOCATONS ========== */
      function blockIfNoAccess(el, accesses) {
        const requiredAccess = el.getAttribute('data-access');
        if (!requiredAccess) return;
        if (!accesses.includes(requiredAccess)) {
          el.disabled = true;
          el.style.opacity = 0.5;
          el.style.cursor = "not-allowed";
          if (!el.dataset.accessListener) {
            el.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`❌ Acesso negado: você não tem permissão para "${requiredAccess}".`);
            });
            el.dataset.accessListener = "true";
          }
        }
      }
      /* ======== USER APPLY ACESSES ======== */
      function applyAccesses(accesses) {
        document.querySelectorAll('[data-access]').forEach(el => blockIfNoAccess(el, accesses));
        console.log("✅ Acessos aplicados:", accesses);
      }
      loadUserAccesses(currentUser).then(userData => {
        if (userData) {
          const accesses = userData.acess ? userData.acess.split(",").map(a => a.trim()) : [];
          applyAccesses(accesses);
        }
      });
      /* ============== LOGOUT ============== */
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          sessionStorage.removeItem("currentUserName");
          sessionStorage.removeItem("currentUserDisplay");
          window.location.href = "index.html";
        });
      }
    });