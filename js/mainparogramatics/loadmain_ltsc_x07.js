/* =======================================
       LOAD MAIN DATA
    ======================================= */
    document.addEventListener('DOMContentLoaded', () => {
      const currentUser = sessionStorage.getItem("currentUserName");
      const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
      const authNameEl = document.getElementById('authName');
      if (authNameEl) authNameEl.textContent = currentUserDisplay || "";
    /* ====================== SINCRONIZAÇÃO SIDEBAR ====================== */
    function updateSidebarAccess(allowedModules) {
      const sidebarButtons = document.querySelectorAll(".sidebar-menu-button, .sidebar-submenu-button, .sidebar-sub-submenu-button");
      sidebarButtons.forEach(btn => {
        const access = btn.dataset.access;
        if (access) {
          if (allowedModules.includes(access)) {
            btn.style.display = "block";
          } else {
            btn.style.display = "none";
          }
        }
      });
    }
    /* ======================= LOAD COPORATION DATA ====================== */
    async function loadCorporationHeader() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?select=corporation,logo_url,corp_oper_nr,allowed_modules&corp_oper_nr=eq.${corpOperNr}`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const corp = data[0];
          const titleEl = document.querySelector('.header-title');
          const logoEl = document.querySelector('.header-logo');
          const nrEl = document.querySelector('.header-nr');
          if (titleEl) titleEl.textContent = corp.corporation;
          if (logoEl && corp.logo_url) logoEl.src = corp.logo_url;
          if (nrEl) nrEl.textContent = corp.corp_oper_nr;
          const allowedModulesString = corp.allowed_modules || "";
          sessionStorage.setItem("allowedModules", allowedModulesString);
          const allowedModules = allowedModulesString.split(",");
          updateSidebarAccess(allowedModules);
        }
      } catch (error) {
        console.error("Erro ao carregar header da corporação:", error);
      }
      generateAccessCheckboxes(); 
    }
    loadCorporationHeader(); 
    loadElementsTable();
    /* ========== USER ACCESSES =========== */
    async function loadUserAccesses(fullName, corpOperNr) {
      if (!fullName || !corpOperNr) return null;
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=acess,section&full_name=eq.${encodeURIComponent(fullName)}&corp_oper_nr=eq.${corpOperNr}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
        const data = await response.json();
        return data.length ? data[0] : null;
      } catch (err) {
        console.error("Erro ao carregar acessos:", err);
        return null;
      }
    }
    /* ========== USER BLOCATONS =========== */
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
    /* ======== USER APPLY ACCESSES ======== */
    function applyAccesses(accesses) {
      document.querySelectorAll('[data-access]').forEach(el => blockIfNoAccess(el, accesses));
      console.log("✅ Acessos aplicados:", accesses);
    }
    const currentFullName = sessionStorage.getItem("currentUserDisplay");
    const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
    loadUserAccesses(currentFullName, currentCorpOperNr).then(userData => {
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
          sessionStorage.removeItem("currentUserCorpNr");
          sessionStorage.removeItem("currentUserPatent");
          window.location.replace("index.html");
       });
      }
    });
