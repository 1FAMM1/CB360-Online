/* =======================================
            AIR RESOURCE CENTERS
======================================= */
async function loadCMAsFromSupabase() {
  console.log("🚀 Iniciando carga de Air Centers...");
  try {
    // 1. Criar os inputs primeiro para os IDs existirem no DOM
    if (typeof createCmaInputs === "function") {
        createCmaInputs();
    }

    // 2. Tentar obter a corporação (usando sessionStorage como nos Eventos)
    const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
    
    // 3. Fetch com filtro de corporação
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corp_oper_nr}&order=id.asc`, {
        method: "GET",
        headers: getSupabaseHeaders()
      }
    );

    if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
    const data = await res.json();
    console.log("📦 Dados recebidos:", data);

    // 4. Preencher os inputs 01 a 06 baseando-se na ORDEM dos dados (index)
    // Não usamos row.id para o nome do input, usamos a posição (index + 1)
    data.forEach((row, index) => {
      const n = String(index + 1).padStart(2, '0');
      
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
        nameInput.value = row.aero_name || "";
        // GUARDAR O ID REAL PARA O PATCH
        nameInput.dataset.rowId = row.id; 
      }

      if (typeSelect) {
        typeSelect.value = row.aero_type || "";
        
        // Atualizar imagem
        if (imageElement) {
            let src;
            switch (typeSelect.value) {
                case "Heli Ligeiro": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg"; break;
                case "Heli Médio": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg"; break;
                case "Heli Pesado": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg"; break;
                case "Avião de Asa Fixa Médio": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg"; break;
                case "Avião de Asa Fixa Pesado": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"; break;
                default: src = "https://i.imgur.com/4Ho5HRV.png";
            }
            imageElement.src = src;
        }
      }
      if (autoInput) autoInput.value = row.aero_autonomy || "";
    });

  } catch (error) {
    console.error("❌ Erro ao carregar CMAs:", error);
  }
}

async function saveCMAsGroupFields() {
  try {
    const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');

    for (let i = 1; i <= 6; i++) {
      const n = String(i).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);

      // SÓ AVANÇA SE TIVERMOS O ID REAL DA LINHA (dataset.rowId)
      if (!nameInput || !nameInput.dataset.rowId) continue;
      
      const realId = nameInput.dataset.rowId;

      const payload = {
        aero_name: nameInput.value || null, 
        aero_type: typeSelect.value || null, 
        aero_autonomy: autoInput.value || null,
        corp_oper_nr: corp_oper_nr
      };

      const resPatch = await fetch(
        `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${realId}`, {
          method: "PATCH",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (!resPatch.ok) throw new Error(`Erro ao atualizar CMA ID ${realId}`);
    }
    showPopupSuccess("✅ Dados guardados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao salvar CMAs:", error);
    showPopupWarning("❌ Erro ao guardar os dados!");
  }
}

// Iniciar
document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);



