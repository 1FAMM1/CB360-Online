/* =======================================
           AIR RESOURCE CENTERS
======================================= */

async function loadCMAsFromSupabase() {
    console.log("🚀 [CMA] Iniciando loadCMAsFromSupabase...");
    try {
        // 1. Criar inputs no HTML
        if (typeof createCmaInputs === "function") {
            createCmaInputs();
        } else {
            console.error("❌ Erro: função createCmaInputs não encontrada!");
        }

        const corpOperNr = localStorage.getItem("currentCorpOperNr");
        console.log("🔍 [CMA] Corporação no LocalStorage:", corpOperNr);

        // 2. Pedir dados ao Supabase
        const res = await fetch(`${SUPABASE_URL}/rest/v1/air_centers?order=id.asc`, {
            method: "GET",
            headers: getSupabaseHeaders()
        });

        if (!res.ok) throw new Error(`Status: ${res.status}`);

        const data = await res.json();
        console.log("📦 [CMA] Dados recebidos:", data);

        if (data.length === 0) {
            console.warn("⚠️ [CMA] Nenhuma linha encontrada para esta corporação.");
            return;
        }

        // 3. Preencher os inputs
        data.forEach((row, index) => {
            const n = String(index + 1).padStart(2, '0');
            const nameInput = document.getElementById(`cma_aero_type_${n}`);
            const typeSelect = document.getElementById(`cma_type_${n}`);
            const autoInput = document.getElementById(`cma_auto_${n}`);
            const imageElement = document.getElementById(`cma_image_${n}`);

            if (nameInput) {
                nameInput.value = row.aero_name || "";
                // GUARDA O ID REAL DA BASE DE DATOS
                nameInput.dataset.rowId = row.id; 
                console.log(`✅ [CMA] Vinculado Input ${n} ao ID DB ${row.id}`);
            }

            if (typeSelect) {
                typeSelect.value = row.aero_type || "";
                // Atualizar imagem conforme o tipo
                let src;
                switch (typeSelect.value) {
                    case "Heli Ligeiro": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg"; break;
                    case "Heli Médio": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg"; break;
                    case "Heli Pesado": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg"; break;
                    case "Avião de Asa Fixa Médio": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg"; break;
                    case "Avião de Asa Fixa Pesado": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"; break;
                    default: src = "https://i.imgur.com/4Ho5HRV.png";
                }
                if (imageElement) imageElement.src = src;
            }
            if (autoInput) autoInput.value = row.aero_autonomy || "";
        });

    } catch (error) {
        console.error("❌ [CMA] Erro no carregamento:", error);
    }
}

async function saveCMAsGroupFields() {
    console.log("💾 [CMA] Iniciando salvamento...");
    try {
        const corpOperNr = localStorage.getItem("currentCorpOperNr");

        for (let i = 1; i <= 6; i++) {
            const n = String(i).padStart(2, '0');
            const nameInput = document.getElementById(`cma_aero_type_${n}`);
            const typeSelect = document.getElementById(`cma_type_${n}`);
            const autoInput = document.getElementById(`cma_auto_${n}`);

            // IMPORTANTE: Só grava se tivermos capturado o dataset.rowId no Load
            if (!nameInput || !nameInput.dataset.rowId) {
                console.warn(`⚠️ [CMA] Ignorando campo ${n}: sem ID de base de dados.`);
                continue;
            }

            const dbId = nameInput.dataset.rowId;

            const payload = {
                aero_name: nameInput.value || null,
                aero_type: typeSelect.value || null,
                aero_autonomy: autoInput.value || null,
                corp_oper_nr: corpOperNr // Garante que mantém o vínculo
            };

            console.log(`Sending PATCH for ID ${dbId}...`);

            const resPatch = await fetch(
                `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${dbId}&corp_oper_nr=eq.${corpOperNr}`, {
                    method: "PATCH",
                    headers: getSupabaseHeaders({ returnRepresentation: true }),
                    body: JSON.stringify(payload)
                }
            );

            if (!resPatch.ok) throw new Error(`Erro ao atualizar ID ${dbId}: ${resPatch.status}`);
        }

        showPopupSuccess("✅ Dados guardados com sucesso!");
    } catch (error) {
        console.error("❌ [CMA] Erro ao salvar:", error);
        showPopupWarning("❌ Ocorreu um erro ao guardar os dados!");
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    loadCMAsFromSupabase();
});
