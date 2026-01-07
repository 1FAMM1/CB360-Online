/* =======================================
           AIR RESOURCE CENTERS
======================================= */

async function loadCMAsFromSupabase() {
  console.log("🚀 [CMA] Iniciando carga...");
  try {
    // 1. LER DA SESSION (Igual aos Eventos)
    const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
    console.log("🔍 [CMA] Corporação detetada:", corpOperNr);

    if (!corpOperNr) {
      console.warn("⚠️ [CMA] Sem corp_oper_nr no sessionStorage. Re-tentando...");
      return; 
    }

    if (typeof createCmaInputs === "function") createCmaInputs();

    // 2. FETCH
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpOperNr}&order=id.asc`, 
      { headers: getSupabaseHeaders() }
    );

    let data = await res.json();
    console.log("📦 [CMA] Dados recebidos:", data);

    // 3. SE VAZIO: Criar 6 linhas padrão
    if (data.length === 0) {
      console.log("🌱 [CMA] Criando linhas iniciais...");
      const rows = Array.from({ length: 6 }, () => ({
        corp_oper_nr: corpOperNr,
        aero_name: "",
        aero_type: "",
        aero_autonomy: ""
      }));

      const resPost = await fetch(`${SUPABASE_URL}/rest/v1/air_centers`, {
        method: "POST",
        headers: getSupabaseHeaders({ returnRepresentation: true }),
        body: JSON.stringify(rows)
      });
      data = await resPost.json();
    }

    // 4. PREENCHER INPUTS
    data.forEach((row, index) => {
      const n = String(index + 1).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
        nameInput.value = row.aero_name || "";
        nameInput.dataset.rowId = row.id; // Crucial para o SAVE
      }
      if (typeSelect) {
        typeSelect.value = row.aero_type || "";
        updateCMAImage(typeSelect.value, imageElement);
      }
      if (autoInput) autoInput.value = row.aero_autonomy || "";
    });

  } catch (error) {
    console.error("❌ [CMA] Erro:", error);
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

