/* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
   async function loadCMAsFromSupabase() {
  console.log("🚀 [CMA] Iniciando leitura segura com imagens...");
  try {
    if (typeof createCmaInputs === "function") createCmaInputs();

    // Nota: Certifica-te se usas sessionStorage ou localStorage (vimos anteriormente que o teu getHeaders usa localStorage)
    const corpId = localStorage.getItem('currentCorpOperNr') || sessionStorage.getItem('currentCorpOperNr'); 
    
    if (!corpId) {
      console.error("❌ Erro: currentCorpOperNr não encontrado!");
      return;
    }

    const headers = getSupabaseHeaders();
    headers['x-my-corpo'] = corpId; 

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpId}&order=id.asc`, 
      {
        method: "GET",
        headers: headers
      }
    );

    if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);

    const data = await res.json();
    console.log("📦 Dados recebidos:", data);

    if (data.length === 0) {
      console.warn("⚠️ O banco devolveu 0 linhas para a corp:", corpId);
      return;
    }

    // Mapeamento das imagens
    const imagensAeronaves = {
      "Heli Ligeiro": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg",
      "Heli Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg",
      "Heli Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg",
      "Avião de Asa Fixa Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg",
      "Avião de Asa Fixa Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"
    };

    data.forEach((row, index) => {
      const n = String(index + 1).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
        nameInput.value = row.aero_name || "";
        nameInput.dataset.rowId = row.id; 
      }

      if (typeSelect) {
        typeSelect.value = row.aero_type || "";
        
        // --- PARTE DAS IMAGENS ---
        if (imageElement) {
          const src = imagensAeronaves[row.aero_type] || "https://i.imgur.com/4Ho5HRV.png";
          imageElement.src = src;
        }
      }

      if (autoInput) {
        autoInput.value = row.aero_autonomy || "";
      }
    });

    console.log("✅ [CMA] Dados e imagens carregados com sucesso.");

  } catch (error) {
    console.error("❌ Erro no load:", error);
  }
}







    
    async function saveCMAsGroupFields() {
      try {
        for (let i = 1; i <= 6; i++) {
          const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          if (!nameInput || !typeSelect || !autoInput) continue;
          const payload = {
            aero_name: nameInput.value || null, aero_type: typeSelect.value || null, aero_autonomy: autoInput.value || null, corp_oper_nr: corp_oper_nr};
          const resPatch = await fetch(
            `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${i}`, {
              method: "PATCH",
              headers: getSupabaseHeaders({ Prefer: "return=representation" }),
              body: JSON.stringify(payload)
            }
          );
          if (!resPatch.ok) throw new Error(`Erro ao atualizar CMA ${i}: ${resPatch.status}`);
        }
        showPopupSuccess("✅ Dados dos CMAs guardados com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao salvar CMAs:", error);
        showPopupWarning("❌ Ocorreu um erro ao guardar os dados!");
      }
    }
    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);





