/* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
    async function loadCMAsFromSupabase() {
    try {
        createCmaInputs(); // Cria os esqueletos dos inputs
        
        const corpOperNr = localStorage.getItem("currentCorpOperNr");
        if (!corpOperNr) {
            console.error("CorpOperNr não encontrado no localStorage");
            return;
        }

        // Filtramos no URL para trazer apenas o que pertence à corporação logada
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpOperNr}&order=id.asc`, {
                method: "GET",
                headers: getSupabaseHeaders()
            }
        );

        if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
        
        const data = await res.json();

        // Se a tabela estiver vazia para esta corporação, o data virá []
        data.forEach((row, index) => {
            // Usamos o index + 1 ou um contador para mapear para os teus inputs cma_01, cma_02...
            const n = String(index + 1).padStart(2, '0');
            
            const nameInput = document.getElementById(`cma_aero_type_${n}`);
            const typeSelect = document.getElementById(`cma_type_${n}`);
            const autoInput = document.getElementById(`cma_auto_${n}`);
            const imageElement = document.getElementById(`cma_image_${n}`);

            if (nameInput) {
                nameInput.value = row.aero_name || "";
                nameInput.dataset.rowId = row.id; // Guarda o ID real da linha para o PATCH
            }

            if (typeSelect) {
                typeSelect.value = row.aero_type || "";
                
                // Atualiza a imagem baseada no tipo carregado
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
        console.error("❌ Erro ao carregar CMAs:", error);
    }
}
    
    async function saveCMAsGroupFields() {
    try {
        const corpOperNr = localStorage.getItem("currentCorpOperNr");
        
        // Loop pelos 6 campos do formulário
        for (let i = 1; i <= 6; i++) {
            const n = String(i).padStart(2, '0');
            const nameInput = document.getElementById(`cma_aero_type_${n}`);
            const typeSelect = document.getElementById(`cma_type_${n}`);
            const autoInput = document.getElementById(`cma_auto_${n}`);

            if (!nameInput) continue;

            const rowId = nameInput.dataset.rowId; // O ID único da linha
            if (!rowId) continue;

            const payload = {
                aero_name: nameInput.value || null,
                aero_type: typeSelect.value || null,
                aero_autonomy: autoInput.value || null,
                corp_oper_nr: corpOperNr // Mantém o vínculo da corporação
            };

            // PATCH filtrando por ID e por Corporação (Segurança RLS)
            const resPatch = await fetch(
                `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${rowId}&corp_oper_nr=eq.${corpOperNr}`, {
                    method: "PATCH",
                    headers: getSupabaseHeaders({ returnRepresentation: true }),
                    body: JSON.stringify(payload)
                }
            );

            if (!resPatch.ok) {
                const errData = await resPatch.json();
                console.error(`Erro no CMA ${n}:`, errData);
                throw new Error(`Erro ao atualizar CMA ${n}`);
            }
        }
        
        showPopupSuccess("✅ Dados dos CMAs guardados com sucesso!");
        
    } catch (error) {
        console.error("❌ Erro ao salvar CMAs:", error);
        showPopupWarning("❌ Ocorreu um erro ao guardar os dados!");
    }
}

    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);
