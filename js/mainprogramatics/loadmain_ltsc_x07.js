    /* =======================================
    LOAD MAIN DATA
    ======================================= */
    document.addEventListener('DOMContentLoaded', async () => {    
      const currentUser = sessionStorage.getItem("currentUserName");
      const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
      const authNameEl = document.getElementById('authName');
      if (authNameEl) authNameEl.textContent = currentUserDisplay || "";
      /* ===================== VERIFICAÇÃO DE VALIDADE ===================== */
      /* ===================== VERIFICAÇÃO DE VALIDADE E CARGO ===================== */
//* ================= CHECK USER VALIDITY (VERSÃO FINAL) ================= */
async function checkUserValidity() {
    try {
        const nInt = sessionStorage.getItem("currentNInt");
        const corpNr = sessionStorage.getItem("currentCorpOperNr");

        if (!nInt || !corpNr) {
            console.error("Sessão inválida.");
            window.location.href = "login.html";
            return false;
        }

        // URLSearchParams evita erros de sintaxe (como o Erro 400)
        const params = new URLSearchParams({
            n_int: `eq.${nInt}`,
            corp_oper_nr: `eq.${corpNr}`,
            select: 'user_role,elem_state,acess'
        });

        const url = `${SUPABASE_URL}/rest/v1/reg_elems?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: getSupabaseHeaders()
        });

        if (!response.ok) throw new Error(`Erro: ${response.status}`);

        const data = await response.json();

        if (!data || data.length === 0) {
            alert("Ficha de elemento não encontrada.");
            window.location.href = "login.html";
            return false;
        }

        const user = data[0];

        // 1. Bloqueio de utilizador inativo
        if (user.elem_state !== true) {
            alert("A sua conta está INATIVA.");
            window.location.href = "login.html";
            return false;
        }

        // 2. Sincronizar Permissões e Role
        // Se o campo 'acess' estiver vazio na DB, damos acesso ao Menu Principal por defeito
        const permissoes = user.acess ? user.acess : "Menu Principal";
        sessionStorage.setItem("allowedModules", permissoes);
        
        if (user.user_role) {
            sessionStorage.setItem("currentUserRole", user.user_role);
        }

        console.log("✅ Validação concluída.");
        return true;

    } catch (error) {
        console.error("❌ Erro ao verificar validade:", error);
        return false;
    }
}

/* ================= INICIALIZAÇÃO DA SIDEBAR ================= */
// Esta função substitui a lógica que estava a falhar
async function initApp() {
    // 1. Aguarda primeiro a validação (O AWAIT É CRÍTICO AQUI)
    const isValid = await checkUserValidity();

    if (isValid) {
        // 2. Só depois de validar é que carregamos a tabela e a sidebar
        if (typeof loadElementsTable === "function") loadElementsTable();
        
        // 3. Gerar os checkboxes de acesso (se estiveres na página de edição)
        if (typeof generateAccessCheckboxes === "function") {
            generateAccessCheckboxes();
        }

        // 4. FORÇAR a sidebar a atualizar os botões visíveis
        // Nota: Se a tua função de desenhar a sidebar tiver outro nome, altera aqui:
        updateSidebarVisibility();
    }
}

/* ================= CONTROLO DE VISIBILIDADE DA SIDEBAR ================= */
function updateSidebarVisibility() {
    const allowedModulesString = sessionStorage.getItem("allowedModules") || "";
    const allowedModules = allowedModulesString.split(",").map(a => a.trim());
    
    // Procuramos todos os botões ou links da tua sidebar
    // Ajusta o seletor '.sidebar-item' para o nome da classe dos teus botões
    const menuButtons = document.querySelectorAll(".sidebar-btn, .menu-item"); 

    menuButtons.forEach(btn => {
        const menuLabel = btn.textContent.trim();
        
        // Se o nome do botão estiver na lista de permitidos, mostra. Se não, esconde.
        if (allowedModules.includes(menuLabel)) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    });
}

// Iniciar tudo quando o documento carregar
document.addEventListener("DOMContentLoaded", initApp);
      /* ====================== SINCRONIZAÇÃO SIDEBAR ====================== */
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
      /* ===================== BLOQUEIA SIDEBAR COMPLETAMENTE ===================== */
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
            const logoEl = document.querySelector('.cb-logo img');
            const nrEl = document.querySelector('.header-nr');
            if (titleEl) titleEl.textContent = corp.corporation;
            if (logoEl && corp.logo_url) logoEl.src = corp.logo_url;
            if (nrEl) nrEl.textContent = corp.corp_oper_nr;    
            const allowedModulesString = corp.allowed_modules || "";
            sessionStorage.setItem("allowedModules", allowedModulesString);
            return allowedModulesString.split(",").filter(m => m.trim());
          }
          return [];
        } catch (error) {
          console.error("Erro ao carregar header da corporação:", error);
          return [];
        }
      }
      /* ========== USER ACCESSES =========== */
      async function loadUserAccessesSafe(fullName, corpOperNr) {
        if (!fullName || !corpOperNr) {
          return { acess: [], corpOperNr };
        }    
        const corpOperNrString = String(corpOperNr).trim();    
        try {
          const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=acess,section,corp_oper_nr&full_name=eq.${encodeURIComponent(fullName)}&corp_oper_nr=eq.${corpOperNrString}`;
          const response = await fetch(url, { headers: getSupabaseHeaders() });
          if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
          const data = await response.json();
          const correctRecords = data.filter(record => {
            const recordCorpNr = String(record.corp_oper_nr).trim();
            return recordCorpNr === corpOperNrString;
          });    
          if (!correctRecords.length) {
            console.warn(`❌ Nenhum acesso encontrado para ${fullName} na corporação ${corpOperNrString}`);
            return { acess: [], corpOperNr: corpOperNrString };
          }
          const firstRecord = correctRecords[0];
          const accesses = firstRecord.acess?.split(",").map(a => a.trim()).filter(a => a) || [];
          return { acess: accesses, corpOperNr: corpOperNrString };
        } catch (err) {
          console.error("❌ ERRO:", err);
          return { acess: [], corpOperNr: corpOperNrString };
        }
      }
      /* ========== BLOCK ELEMENTS =========== */
      function blockIfNoAccess(el, accesses, userCorpOperNr) {
        const requiredAccess = el.getAttribute('data-access');
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
        if (!requiredAccess) return;
        if (currentCorpOperNr !== userCorpOperNr) {
          el.disabled = true;
          el.style.opacity = 0.5;
          el.style.cursor = "not-allowed";
          if (!el.dataset.accessListener) {
            el.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();
              alert(`❌ Acesso negado: corporação não corresponde.`);
            });
            el.dataset.accessListener = "true";
          }
          return;
        }
        if (!accesses.includes(requiredAccess)) {
          el.disabled = true;
          el.style.opacity = 0.5;
          el.style.cursor = "not-allowed";
          if (!el.dataset.accessListener) {
            el.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();
              alert(`❌ Acesso negado: você não tem permissão para "${requiredAccess}".`);
            });
            el.dataset.accessListener = "true";
          }
        }
      }
      /* ========== APPLY ACCESSES =========== */
      function applyAccessesSafe(accessesObj) {
        const { acess: accesses, corpOperNr: userCorpOperNr } = accessesObj;
        if (!accesses || accesses.length === 0) {
          document.querySelectorAll('[data-access]').forEach(el => {
            el.disabled = true;
            el.style.opacity = 0.5;
            el.style.cursor = "not-allowed";
            if (!el.dataset.accessListener) {
              el.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                alert(`❌ Acesso negado: você não tem permissões registadas.`);
              });
              el.dataset.accessListener = "true";
            }
          });          
          return false;
        }
        document.querySelectorAll('[data-access]').forEach(el => blockIfNoAccess(el, accesses, userCorpOperNr));
        return true;
      }
      /* ================= FLUXO CORRETO ================= */
      const allowedModules = await loadCorporationHeader();
      const currentFullName = sessionStorage.getItem("currentUserDisplay");
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const isValid = await checkUserValidity(currentFullName);
      const accessResult = await loadUserAccessesSafe(currentFullName, currentCorpOperNr);
      const userHasAccess = isValid && applyAccessesSafe(accessResult);
      if (userHasAccess) {
        updateSidebarAccess(allowedModules);
      } else {
        blockAllSidebar();
      }
      generateAccessCheckboxes();
      loadElementsTable();
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






