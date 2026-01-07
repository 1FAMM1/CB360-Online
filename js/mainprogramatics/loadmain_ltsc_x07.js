  /* =======================================
    LOAD MAIN DATA
======================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
    const authNameEl = document.getElementById('authName');
    if (authNameEl) authNameEl.textContent = currentUserDisplay || "";

    /* ===================== VERIFICAÇÃO DE VALIDADE ===================== */
   /* ===================== VERIFICAÇÃO DE VALIDADE & DATA ===================== */
async function checkUserValidity() {
    try {
        const nInt = sessionStorage.getItem("currentNInt");
        const corpNr = sessionStorage.getItem("currentCorpOperNr");

        if (!nInt || !corpNr) {
            window.location.href = "login.html";
            return false;
        }

        // Adicionámos 'validate' (ou o nome exato da tua coluna) no select
        // Se a coluna estiver na reg_elems, este código funciona:
        const params = new URLSearchParams({
            n_int: `eq.${nInt}`,
            corp_oper_nr: `eq.${corpNr}`,
            select: 'user_role,elem_state,acess,validate' 
        });

        const url = `${SUPABASE_URL}/rest/v1/reg_elems?${params.toString()}`;
        const response = await fetch(url, {
            method: "GET",
            headers: getSupabaseHeaders()
        });

        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();

        if (!data || data.length === 0) {
            window.location.href = "login.html";
            return false;
        }

        const user = data[0];

        // 1. Verificação de Estado (Ativo/Inativo)
        if (user.elem_state !== true) {
            alert("A sua conta está INATIVA.");
            window.location.href = "login.html";
            return false;
        }

        // 2. Verificação de Data de Validade (Coluna 'validate')
        if (user.validate) {
            const dataAtual = new Date();
            const dataExpiracao = new Date(user.validate);

            // Se a data atual for maior que a data de expiração, bloqueia
            if (dataAtual > dataExpiracao) {
                alert("O seu acesso expirou em: " + dataExpiracao.toLocaleDateString('pt-PT'));
                window.location.href = "login.html";
                return false;
            }
        }

        // Sincroniza permissões se passar nos testes acima
        sessionStorage.setItem("allowedModules", user.acess || "Menu Principal");
        return true;

    } catch (error) {
        console.error("❌ Erro ao verificar validade:", error);
        return false;
    }
}

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

    /* ======================= LOAD CORPORATION DATA ====================== */
    async function loadCorporationHeader() {
        try {
            const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/corporation_data?select=corporation,logo_url,corp_oper_nr,allowed_modules&corp_oper_nr=eq.${corpOperNr}`, 
                { headers: getSupabaseHeaders() }
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

    /* ========== APPLY ACCESSES NO CONTEÚDO =========== */
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
                // Previne cliques se não tiver acesso
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

    /* ================= FLUXO DE EXECUÇÃO ================= */
    // 1. Validar utilizador primeiro
    const isValid = await checkUserValidity();
    
    // 2. Carregar dados da corporação
    const allowedModules = await loadCorporationHeader();
    
    // 3. Obter os acessos que acabámos de gravar no sessionStorage em checkUserValidity
    const userAccessStr = sessionStorage.getItem("allowedModules") || "";
    const userAccessArray = userAccessStr.split(",").map(a => a.trim());

    if (isValid && userAccessArray.length > 0) {
        updateSidebarAccess(allowedModules); // Filtra os botões da sidebar
        applyAccessesSafe(userAccessArray);  // Bloqueia botões de ação no conteúdo
    } else {
        blockAllSidebar();
    }

    // 4. Carregar tabelas e UI específica
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

