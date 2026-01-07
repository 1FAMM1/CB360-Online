/* =======================================
           AIR RESOURCE CENTERS
======================================= */

async function loadCMAsFromSupabase() {
    try {
        const corpOperNr = localStorage.getItem("currentCorpOperNr");
        if (!corpOperNr) return;

        createCmaInputs(); // Cria os elementos HTML

        let res = await fetch(
            `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpOperNr}&order=id.asc`, 
            { headers: getSupabaseHeaders() }
        );
        
        let data = await res.json();

        // SE NÃO EXISTIREM DADOS, VAMOS CRIAR 6 LINHAS PARA ESTA CORPORAÇÃO
        if (data.length === 0) {
            console.log("CMA vazio. A criar linhas iniciais...");
            const initialRows = Array.from({ length: 6 }, () => ({
                corp_oper_nr: corpOperNr,
                aero_name: "",
                aero_type: "",
                aero_autonomy: ""
            }));

            const createRes = await fetch(`${SUPABASE_URL}/rest/v1/air_centers`, {
                method: "POST",
                headers: getSupabaseHeaders({ returnRepresentation: true }),
                body: JSON.stringify(initialRows)
            });
            
            data = await createRes.json();
        }

        // PREENCHER OS INPUTS
        data.forEach((row, index) => {
            const n = String(index + 1).padStart(2, '0');
            const nameInput = document.getElementById(`cma_aero_type_${n}`);
            const typeSelect = document.getElementById(`cma_type_${n}`);
            const autoInput = document.getElementById(`cma_auto_${n}`);
            const imageElement = document.getElementById(`cma_image_${n}`);

            if (nameInput) {
                nameInput.value = row.aero_name || "";
                nameInput.dataset.rowId = row.id; // IMPORTANTE: Guarda o ID para o SAVE
            }
            if (typeSelect) {
                typeSelect.value = row.aero_type || "";
                updateCMAImage(typeSelect.value, imageElement);
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
        
        for (let i = 1; i <= 6; i++) {
            const n = String(i).padStart(2, '0');
            const nameInput = document.getElementById(`cma_aero_type_${n}`);
            const typeSelect = document.getElementById(`cma_type_${n}`);
            const autoInput = document.getElementById(`cma_auto_${n}`);

            if (!nameInput || !nameInput.dataset.rowId) continue;

            const payload = {
                aero_name: nameInput.value || null,
                aero_type: typeSelect.value || null,
                aero_autonomy: autoInput.value || null
            };

            const resPatch = await fetch(
                `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${nameInput.dataset.rowId}&corp_oper_nr=eq.${corpOperNr}`, 
                {
                    method: "PATCH",
                    headers: getSupabaseHeaders(),
                    body: JSON.stringify(payload)
                }
            );

            if (!resPatch.ok) throw new Error(`Erro no CMA ${n}`);
        }
        showPopupSuccess("✅ Dados guardados!");
    } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        showPopupWarning("❌ Erro ao guardar dados!");
    }
}

// Função auxiliar para imagens
function updateCMAImage(type, imgEl) {
    if (!imgEl) return;
    const paths = {
        "Heli Ligeiro": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg",
        "Heli Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg",
        "Heli Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg",
        "Avião de Asa Fixa Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg",
        "Avião de Asa Fixa Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"
    };
    imgEl.src = paths[type] || "https://i.imgur.com/4Ho5HRV.png";
}

    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);

