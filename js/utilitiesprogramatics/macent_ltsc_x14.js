/* =======================================
           AIR RESOURCE CENTERS
======================================= */

async function loadCMAsFromSupabase() {
    console.log("🚀 [CMA] Iniciando carga...");

    try {
        // 1. PRIMEIRO: Criar o HTML (essencial)
        if (typeof createCmaInputs === "function") {
            createCmaInputs(); 
            console.log("✅ [CMA] HTML dos inputs gerado.");
        }

        // 2. SEGUNDO: Preencher as opções do Select (se tiveres uma função global)
        // Só chamamos isto DEPOIS do createCmaInputs
        if (typeof populateGlobalSelects === "function") {
            populateGlobalSelects();
        }

        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        
        // 3. TERCEIRO: Buscar dados no Supabase
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpOperNr}&order=id.asc`, 
            { headers: getSupabaseHeaders() }
        );

        const data = await res.json();

        // 4. QUARTO: Inserir os dados nos campos já criados
        if (data && data.length > 0) {
            fillCmaFields(data);
        } else {
            console.log("ℹ️ [CMA] Sem dados, criando iniciais...");
            await seedInitialCMAs(corpOperNr);
        }

    } catch (error) {
        console.error("❌ [CMA] Erro no fluxo:", error);
    }
}

async function saveCMAsGroupFields() {
  console.log("💾 [CMA] Gravando...");
  try {
    const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');

    for (let i = 1; i <= 6; i++) {
      const n = String(i).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);

      if (nameInput && nameInput.dataset.rowId) {
        const payload = {
          aero_name: nameInput.value || "",
          aero_type: typeSelect.value || "",
          aero_autonomy: autoInput.value || ""
        };

        await fetch(`${SUPABASE_URL}/rest/v1/air_centers?id=eq.${nameInput.dataset.rowId}&corp_oper_nr=eq.${corp_oper_nr}`, {
          method: "PATCH",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        });
      }
    }
    showPopupSuccess("✅ Dados guardados!");
  } catch (error) {
    console.error("❌ [CMA] Erro ao gravar:", error);
  }
}

function updateCMAImage(type, imgEl) {
  if (!imgEl) return;
  const map = {
    "Heli Ligeiro": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg",
    "Heli Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg",
    "Heli Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg",
    "Avião de Asa Fixa Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg",
    "Avião de Asa Fixa Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"
  };
  imgEl.src = map[type] || "https://i.imgur.com/4Ho5HRV.png";
}

// Iniciar
document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);
    loadCMAsFromSupabase();
});


