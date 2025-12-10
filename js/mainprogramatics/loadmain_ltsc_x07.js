    /* =======================================
               LOAD MAIN DATA
======================================= */
document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = sessionStorage.getItem("currentUserName");
  const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
  const authNameEl = document.getElementById('authName');
  if (authNameEl) authNameEl.textContent = currentUserDisplay || "";    

  // ==================== VERIFICAÇÃO DE VALIDADE ====================
  async function checkUserValidity(fullName) {
    if (!fullName) return true; // Sem usuário logado, ignora

    try {
      const url = `${SUPABASE_URL}/rest/v1/users?select=validate&full_name=eq.${encodeURIComponent(fullName)}`;
      const response = await fetch(url, { headers: getSupabaseHeaders() });
      if (!response.ok) throw new Error("Erro ao buscar validade do usuário");
      const data = await response.json();
      if (!data || data.length === 0) return true; // Sem registro, considera válido

      const validade = data[0].validate; // Valor da coluna validate
      if (!validade) return true; // NULL ou vazio = ilimitado

      const today = new Date();
      const expireDate = new Date(validade);
      const diffTime = expireDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Já expirou: bloqueia todos os acessos
        alert("❌ Sua conta expirou. Todos os acessos foram bloqueados.");
        blockAllSidebar();
        return false;
      } else if (diffDays <= 30) {
        // Aviso próximo da expiração
        alert(`⚠️ Sua conta expira em ${diffDays} dias.`);
      }

      return true; // Válido
    } catch (err) {
      console.error("Erro ao verificar validade do usuário:", err);
      return true; // Em caso de erro, não bloqueia
    }
  }

  /* ====================== SINCRONIZAÇÃO SIDEBAR ====================== */
  function updateSidebarAccess(allowedModules) {
    const sidebarButtons = document.querySelectorAll(".sidebar-menu-button, .sidebar-submenu-button, .sidebar-sub-submenu-button");
    sidebarButtons.forEach(btn => {
      const access = btn.dataset.access;
      if (access) {
        btn.style.display = allowedModules.includes(access) ? "block" : "none";
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

  // <<< VERIFICA VALIDADE AQUI
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
