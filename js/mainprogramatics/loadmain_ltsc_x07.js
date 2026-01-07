    /* =======================================
    LOAD MAIN DATA
======================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
    const authNameEl = document.getElementById('authName');
    if (authNameEl) authNameEl.textContent = currentUserDisplay || "";

    /* ================= CHECK USER VALIDITY & SYNC ================= */
    async function checkUserValidity() {
        try {
            const nInt = sessionStorage.getItem("currentNInt");
            const corpNr = sessionStorage.getItem("currentCorpOperNr");

            if (!nInt || !corpNr) {
                window.location.href = "login.html";
                return null;
            }

            const params = new URLSearchParams({
                n_int: `eq.${nInt}`,
                corp_oper_nr: `eq.${corpNr}`,
                select: 'user_role,elem_state,acess'
            });

            const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?${params.toString()}`, {
                method: "GET",
                headers: getSupabaseHeaders()
            });

            if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);

            const data = await response.json();
            if (!data || data.length === 0) {
                alert("Ficha não encontrada.");
                window.location.href = "login.html";
                return null;
            }

            const user = data[0];
            if (user.elem_state !== true) {
                alert("Conta INATIVA.");
                window.location.href = "login.html";
                return null;
            }

            // Sincroniza dados na sessão
            sessionStorage.setItem("allowedModules", user.acess || "Menu Principal");
            if (user.user_role) sessionStorage.setItem("currentUserRole", user.user_role);

            return user;
        } catch (error) {
            console.error("❌ Erro na validação:", error);
            return null;
        }
    }

    /* ================= APLICAR ACESSOS À SIDEBAR ================= */
    function applySidebarPermissions() {
        const allowedStr = sessionStorage.getItem("allowedModules") || "";
        const allowedArray = allowedStr.split(",").map(a => a.trim());
        
        // Seleciona todos os botões que têm o atributo data-access
        const sidebarButtons = document.querySelectorAll("[data-access]");
        
        sidebarButtons.forEach(btn => {
            const required = btn.getAttribute('data-access');
            
            if (allowedArray.includes(required)) {
                // MOSTRAR E ATIVAR
                btn.style.display = "block";
                btn.style.opacity = "1";
                btn.style.pointerEvents = "auto";
                btn.style.filter = "none";
                btn.disabled = false;
            } else {
                // ESCONDER OU BLOQUEAR (escolhe um dos dois abaixo)
                btn.style.display = "none"; // Se preferires que desapareça
            }
        });
    }

    /* ================= FLUXO DE INICIALIZAÇÃO ================= */
    // 1. Carrega dados da Corporação (Logo, Nome, etc)
    await loadCorporationHeader(); 

    // 2. Valida utilizador e obtém permissões da BD
    const userData = await checkUserValidity();

    if (userData) {
        // 3. Se estiver tudo OK, desenha a interface
        applySidebarPermissions();
        if (typeof generateAccessCheckboxes === "function") generateAccessCheckboxes();
        if (typeof loadElementsTable === "function") loadElementsTable();
    } else {
        // Se falhar, bloqueia tudo por segurança
        if (typeof blockAllSidebar === "function") blockAllSidebar();
    }

    /* ============== LOGOUT ============== */
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.clear(); // Limpa TUDO de uma vez
            window.location.replace("index.html");
        });
    }
});
