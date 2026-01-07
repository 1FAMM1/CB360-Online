/* =======================================
           AIR RESOURCE CENTERS
======================================= */

async function loadCMAsFromSupabase() {
  try {
    const corpOperNr = localStorage.getItem("currentCorpOperNr");
    if (!corpOperNr) return;

    createCmaInputs(); // Gera o HTML

    // 1. Tentar ler os dados
    let res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpOperNr}&order=id.asc`, 
      { headers: getSupabaseHeaders() }
    );
    
    let data = await res.json();

    // 2. SE ESTIVER VAZIO PARA ESTA CORPORAÇÃO: Criar 6 linhas padrão
    if (data.length === 0) {
      console.log("CMA vazio. A criar 6 registos para a corporação:", corpOperNr);
      const rowsToCreate = Array.from({ length: 6 }, () => ({
        corp_oper_nr: corpOperNr,
        aero_name: "",
        aero_type: "",
        aero_autonomy: ""
      }));

      const postRes = await fetch(`${SUPABASE_URL}/rest/v1/air_centers`, {
        method: "POST",
        headers: getSupabaseHeaders({ returnRepresentation: true }),
        body: JSON.stringify(rowsToCreate)
      });

      if (!postRes.ok) throw new Error("Falha ao inicializar linhas");
      data = await postRes.json();
    }

    // 3. Preencher os inputs com os dados (reais ou recém-criados)
    data.forEach((row, index) => {
      const n = String(index + 1).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
        nameInput.value = row.aero_name || "";
        nameInput.dataset.rowId = row.id; // GUARDA O ID PARA O SAVE
      }
      if (typeSelect) {
        typeSelect.value = row.aero_type || "";
        updateCmaVisuals(typeSelect.value, imageElement);
      }
      if (autoInput) autoInput.value = row.aero_autonomy || "";
    });

  } catch (error) {
    console.error("❌ Erro no loadCMAs:", error);
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

      // Crucial: Usa o ID que o Load guardou no dataset
      if (!nameInput || !nameInput.dataset.rowId) continue;

      const payload = {
        aero_name: nameInput.value || "",
        aero_type: typeSelect.value || "",
        aero_autonomy: autoInput.value || ""
      };

      const resPatch = await fetch(
        `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${nameInput.dataset.rowId}&corp_oper_nr=eq.${corpOperNr}`, 
        {
          method: "PATCH",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (!resPatch.ok) console.error(`Erro ao gravar linha ${i}`);
    }
    showToast("Dados guardados com sucesso!", "success");
  } catch (error) {
    console.error("❌ Erro ao salvar:", error);
    showToast("Erro ao guardar dados!", "error");
  }
}

// Função para centralizar a lógica de imagem
function updateCmaVisuals(type, imgEl) {
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

document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);


