/* =======================================
   CONFIGURAÇÃO SUPABASE (PROXY)
======================================= */
function buildSupabaseURL(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `/api/supabase-proxy?path=${encodeURIComponent(cleanEndpoint)}`;
}

function getSupabaseHeaders(options = {}) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (options.returnRepresentation) {
    headers['Prefer'] = 'return=representation';
  }
  return headers;
}

/* =======================================
   LOAD MAIN DATA
======================================= */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 INICIANDO APLICAÇÃO...');
  
  // Exibir nome do usuário
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

  /* ======================= LOAD CORPORATION DATA ====================== */
  async function loadCorporationHeader() {
    console.log('📊 Carregando dados da corporação...');
    try {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      console.log('   Corp Oper Nr:', corpOperNr);
      
      const endpoint = `/rest/v1/corporation_data?select=corporation,logo_url,corp_oper_nr,allowed_modules&corp_oper_nr=eq.${corpOperNr}`;
      const url = buildSupabaseURL(endpoint);
      console.log('   URL:', url);
      
      const response = await fetch(url, { headers: getSupabaseHeaders() });
      console.log('   Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('   ❌ Erro:', errorText);
        return;
      }

      const data = await response.json();
      console.log('   ✅ Data recebida:', data);

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
        const allowedModules = allowedModulesString.split(",").map(m => m.trim());
        
        console.log('   📦 Módulos permitidos:', allowedModules);
        updateSidebarAccess(allowedModules);
      }
    } catch (error) {
      console.error("   ❌ ERRO:", error);
    }
  }

  /* ========== USER ACCESSES =========== */
  async function loadUserAccesses(fullName, corpOperNr) {
    console.log('🔐 Carregando acessos do usuário...');
    console.log('   Full Name:', fullName);
    console.log('   Corp Oper Nr:', corpOperNr);
    
    if (!fullName || !corpOperNr) {
      console.warn('   ⚠️ FALTAM DADOS!');
      return null;
    }

    try {
      const endpoint = `/rest/v1/reg_elems?select=acess,section&full_name=eq.${encodeURIComponent(fullName)}&corp_oper_nr=eq.${corpOperNr}`;
      const url = buildSupabaseURL(endpoint);
      console.log('   URL:', url);
      
      const response = await fetch(url, { headers: getSupabaseHeaders() });
      console.log('   Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('   ❌ Erro:', errorText);
        throw new Error("Erro ao buscar dados do usuário");
      }

      const data = await response.json();
      console.log('   ✅ Data recebida:', data);
      console.log('   Quantidade de registros:', data.length);
      
      if (data.length > 0) {
        console.log('   Primeiro registro:', data[0]);
        console.log('   Campo "acess":', data[0].acess);
      }
      
      return data.length ? data[0] : null;
    } catch (err) {
      console.error("   ❌ ERRO:", err);
      return null;
    }
  }

  /* ========== USER BLOCKATIONS =========== */
  function blockIfNoAccess(el, accesses) {
    const requiredAccess = el.getAttribute('data-access');
    if (!requiredAccess) return;

    const hasAccess = accesses.includes(requiredAccess);
    console.log(`   🔒 Elemento "${requiredAccess}":`, hasAccess ? '✅ LIBERADO' : '❌ BLOQUEADO');

    if (!hasAccess) {
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
    } else {
      // DESBLOQUEAR elemento (caso já estivesse bloqueado)
      el.disabled = false;
      el.style.opacity = 1;
      el.style.cursor = "pointer";
    }
  }

  /* ======== USER APPLY ACCESSES ======== */
  function applyAccesses(accesses) {
    console.log('🔑 Aplicando acessos...');
    console.log('   Acessos do usuário:', accesses);
    
    const elements = document.querySelectorAll('[data-access]');
    console.log(`   Total de elementos com data-access: ${elements.length}`);
    
    if (elements.length === 0) {
      console.warn('   ⚠️ NENHUM ELEMENTO COM data-access ENCONTRADO!');
    }
    
    elements.forEach((el, index) => {
      const requiredAccess = el.getAttribute('data-access');
      console.log(`   Elemento ${index + 1}: data-access="${requiredAccess}"`);
      blockIfNoAccess(el, accesses);
    });
    
    console.log("   ✅ Processo concluído!");
  }

  /* ========== INICIALIZAÇÃO (ORDEM CORRETA) ========== */
  try {
    console.log('\n═══════════════════════════════════');
    console.log('ETAPA 1: Carregar Corporation Data');
    console.log('═══════════════════════════════════');
    await loadCorporationHeader();
    
    console.log('\n═══════════════════════════════════');
    console.log('ETAPA 2: Carregar Tabela de Elementos');
    console.log('═══════════════════════════════════');
    if (typeof loadElementsTable === 'function') {
      loadElementsTable();
    } else {
      console.log('   ⚠️ Função loadElementsTable não existe');
    }
    
    console.log('\n═══════════════════════════════════');
    console.log('ETAPA 3: Gerar Checkboxes de Acesso');
    console.log('═══════════════════════════════════');
    if (typeof generateAccessCheckboxes === 'function') {
      generateAccessCheckboxes();
    } else {
      console.log('   ⚠️ Função generateAccessCheckboxes não existe');
    }

    console.log('\n═══════════════════════════════════');
    console.log('ETAPA 4: Carregar Acessos do Usuário');
    console.log('═══════════════════════════════════');
    
    const currentFullName = sessionStorage.getItem("currentUserDisplay");
    const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");

    const userData = await loadUserAccesses(currentFullName, currentCorpOperNr);
    
    console.log('\n═══════════════════════════════════');
    console.log('ETAPA 5: Aplicar Acessos');
    console.log('═══════════════════════════════════');
    
    if (userData && userData.acess) {
      const accesses = userData.acess.split(",").map(a => a.trim());
      applyAccesses(accesses);
    } else {
      console.warn('⚠️ NENHUM DADO DE ACESSO ENCONTRADO!');
      console.log('   userData:', userData);
      applyAccesses([]); // Bloqueia tudo
    }

    console.log('\n✅ APLICAÇÃO INICIADA COM SUCESSO!\n');

  } catch (error) {
    console.error('\n❌ ERRO DURANTE INICIALIZAÇÃO:', error);
  }

  /* ============== LOGOUT ============== */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("currentUserName");
      sessionStorage.removeItem("currentUserDisplay");
      sessionStorage.removeItem("currentCorpOperNr");
      sessionStorage.removeItem("currentUserPatent");
      sessionStorage.removeItem("allowedModules");
      window.location.replace("index.html");
    });
  }
});

/* =======================================
   FUNÇÃO DE DEBUG MANUAL (CONSOLE)
======================================= */
// Cole isto no console para testar manualmente:
window.debugAccesses = function() {
  console.log('\n🔍 DEBUG MANUAL DE ACESSOS');
  console.log('════════════════════════════════════');
  
  console.log('\n📋 SessionStorage:');
  console.log('  currentUserDisplay:', sessionStorage.getItem("currentUserDisplay"));
  console.log('  currentCorpOperNr:', sessionStorage.getItem("currentCorpOperNr"));
  console.log('  allowedModules:', sessionStorage.getItem("allowedModules"));
  
  console.log('\n🎯 Elementos com data-access:');
  const elements = document.querySelectorAll('[data-access]');
  elements.forEach((el, i) => {
    console.log(`  ${i + 1}. data-access="${el.getAttribute('data-access')}"`, {
      disabled: el.disabled,
      opacity: el.style.opacity,
      tag: el.tagName
    });
  });
  
  console.log('\n════════════════════════════════════');
};

console.log('💡 TIP: Digite debugAccesses() no console para ver estado atual');
