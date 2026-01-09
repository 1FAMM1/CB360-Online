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
        const fullName = sessionStorage.getItem("currentFullName");

        if (!nInt || !corpNr) {
            window.location.href = "login.html";
            return false;
        }

        const headers = getSupabaseHeaders();

        // 1. Verificar Estado Operacional
        const urlReg = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${nInt}&corp_oper_nr=eq.${corpNr}&select=user_role,elem_state,acess`;
        const respReg = await fetch(urlReg, { headers });
        const dataReg = await respReg.json();

        if (!dataReg || dataReg.length === 0 || dataReg[0].elem_state === false) {
            alert("Conta Inativa ou não encontrada.");
            window.location.href = "login.html";
            return false;
        }

        // 2. Verificar Validade (Tabela Users)
        if (fullName) {
            const urlUsers = `${SUPABASE_URL}/rest/v1/users?full_name=eq.${encodeURIComponent(fullName)}&select=validate`;
            const respUsers = await fetch(urlUsers, { headers });
            const dataUsers = await respUsers.json();

            // 🔍 DEBUG: Ver o que está a vir
            console.log("🔍 Resposta da tabela users:", dataUsers);

            if (!dataUsers || dataUsers.length === 0) {
                console.warn("⚠️ Utilizador não encontrado na tabela users");
                // Se não encontrar, continua (pode adicionar bloqueio aqui se preferir)
            } else if (dataUsers[0].validate) {
                console.log("📅 Data de validade encontrada:", dataUsers[0].validate);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expireDate = new Date(dataUsers[0].validate);
                expireDate.setHours(0, 0, 0, 0);

                console.log("📅 Hoje:", today);
                console.log("📅 Expira em:", expireDate);
                console.log("📅 Comparação (expirou?):", expireDate < today);

                if (expireDate < today) {
                    alert(`❌ ACESSO BLOQUEADO\n\nA sua conta expirou a ${expireDate.toLocaleDateString()}.\nContacte a administração para renovar.`);
                    window.location.href = "login.html";
                    return false;
                }
            } else {
                console.log("✅ Sem data de validade - acesso ilimitado");
            }
        }

        // Se passou em tudo, guarda os acessos e retorna true
        sessionStorage.setItem("allowedModules", dataReg[0].acess || "Menu Principal");
        if (dataReg[0].user_role) sessionStorage.setItem("currentUserRole", dataReg[0].user_role);

        return true;

    } catch (error) {
        console.error("Erro na validação:", error);
        return false; // Em caso de erro, por segurança, não deixa entrar
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




