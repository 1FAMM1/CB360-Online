    /* =======================================
    LOAD MAIN DATA
    ======================================= */
    document.addEventListener('DOMContentLoaded', async () => {
      const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
      const authNameEl = document.getElementById('authName');
      if (authNameEl) authNameEl.textContent = currentUserDisplay || "";
     /* ========== VALIDITY CHECK ========== */
     async function checkUserValidity() {
        try {
          const nInt = sessionStorage.getItem("currentNInt");
          const corpNr = sessionStorage.getItem("currentCorpOperNr");
          if (!nInt || !corpNr) {
            window.location.href = "login.html";
            return false;
          }
          const headers = getSupabaseHeaders();
          const urlReg = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${nInt}&corp_oper_nr=eq.${corpNr}&select=full_name,elem_state,acess`;
          const respReg = await fetch(urlReg, { headers });
          const dataReg = await respReg.json();
          if (!dataReg || dataReg.length === 0) {
            console.error(`❌ Acesso Negado: O utilizador ${nInt} não existe na corporação ${corpNr}`);
            alert("Erro: Utilizador ou Corporação inválidos para este acesso.");
            window.location.href = "login.html";
            return false;
          }
          const userReg = dataReg[0];
          const officialName = userReg.full_name;
          const urlUsers = `${SUPABASE_URL}/rest/v1/users?full_name=eq.${encodeURIComponent(officialName)}&corp_oper_nr=eq.${corpNr}&select=validate`;
          const respUsers = await fetch(urlUsers, { headers });
          const dataUsers = await respUsers.json();
          if (dataUsers && dataUsers.length > 0) {
            const validade = dataUsers[0].validate;
            if (validade) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const expireDate = new Date(validade);
              expireDate.setHours(0, 0, 0, 0);
              if (expireDate < today) {
                alert(`❌ CONTA EXPIRADA (${corpNr})\nO seu acesso terminou a ${expireDate.toLocaleDateString()}.`);
                window.location.href = "index.html";
                return false;
              }
            }
          }
          sessionStorage.setItem("allowedModules", userReg.acess || "");
          return true;
        } catch (error) {
          console.error("Erro crítico no login/validação:", error);
          return false;
        }
      }
      /* ===== SIDEBAR SYNCHRONIZATION ====== */
      function updateSidebarAccess(allowedModules) {
        const sidebarButtons = document.querySelectorAll(".sidebar-menu-button, .sidebar-submenu-button, .sidebar-sub-submenu-button");
        sidebarButtons.forEach(btn => {
          const access = btn.dataset.access;
          if (access && allowedModules.includes(access)) {
            btn.style.display = "block";
          } else {
            btn.style.display = "none";
          }
        });
      }
      /* ========== BLOCK SIDEBAR =========== */      
      function blockAllSidebar() {
        const sidebarButtons = document.querySelectorAll(".sidebar-menu-button, .sidebar-submenu-button, .sidebar-sub-submenu-button");
        sidebarButtons.forEach(btn => {
          btn.style.opacity = "0.4";
          btn.style.cursor = "not-allowed";
          btn.style.pointerEvents = "none";
          btn.style.filter = "grayscale(100%)";
          btn.disabled = true;
          if (!btn.dataset.blocked && !btn.querySelector('.blocked-icon')) {
            const lockIcon = document.createElement('span');
            lockIcon.className = 'blocked-icon';
            lockIcon.textContent = ' 🔒';
            lockIcon.style.marginLeft = '5px';
            btn.appendChild(lockIcon);
          }
          if (!btn.dataset.blocked) {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("❌ Acesso negado: você não tem permissões registadas.");
            }, true);
            btn.dataset.blocked = "true";
          }
        });
      }      
      /* ========= LOAD CORPORATION ========= */
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
            if (document.querySelector('.header-title')) document.querySelector('.header-title').textContent = corp.corporation;
            if (document.querySelector('.cb-logo img') && corp.logo_url) document.querySelector('.cb-logo img').src = corp.logo_url;
            if (document.querySelector('.header-nr')) document.querySelector('.header-nr').textContent = corp.corp_oper_nr;
            const allowedModulesString = corp.allowed_modules || "";
            return allowedModulesString.split(",").map(m => m.trim()).filter(m => m);
          }
          return [];
        } catch (error) {
          console.error("Erro ao carregar header da corporação:", error);
          return [];
        }
      }
      /* ========== APPLY ACCESSES ========== */      
      function applyAccessesSafe(accesses) {
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const allDataAccess = document.querySelectorAll('[data-access]');
        if (!accesses || accesses.length === 0) {
          allDataAccess.forEach(el => {
            el.disabled = true;
            el.style.opacity = 0.5;
            el.style.cursor = "not-allowed";
          });
          return false;
        }
        allDataAccess.forEach(el => {
          const required = el.getAttribute('data-access');
          if (!accesses.includes(required)) {
            el.disabled = true;
            el.style.opacity = 0.5;
            el.style.cursor = "not-allowed";
            if (!el.dataset.listenerAdded) {
              el.addEventListener('click', (e) => {
                e.preventDefault();
                alert(`Acesso negado a: ${required}`);
              }, true);
              el.dataset.listenerAdded = "true";
            }          
          }
        });
        return true;
      }
      /* ========== EXECUTION FLOW ========== */
      const isValid = await checkUserValidity();
      const allowedModules = await loadCorporationHeader();
      const userAccessStr = sessionStorage.getItem("allowedModules") || "";
      const userAccessArray = userAccessStr.split(",").map(a => a.trim());
      if (isValid && userAccessArray.length > 0) {
        updateSidebarAccess(allowedModules);
        applyAccessesSafe(userAccessArray);
      } else {
        blockAllSidebar();
      }
      if (typeof generateAccessCheckboxes === "function") generateAccessCheckboxes();
      if (typeof loadElementsTable === "function") loadElementsTable();
      /* ============== LOGOUT ============== */
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          sessionStorage.clear();
          window.location.replace("index.html");
        });
      }
    });










