/* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
   async function loadCMAsFromSupabase() {
  console.log("🚀 [CMA] Iniciando leitura segura...");
  try {
    if (typeof createCmaInputs === "function") createCmaInputs();

    const corpId = sessionStorage.getItem('currentCorpOperNr'); // Ex: "0805"
    if (!corpId) {
      console.error("❌ Erro: currentCorpOperNr não encontrado no session!");
      return;
    }

    // Prepara os headers e garante que o x-my-corpo está lá
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
      console.warn("⚠️ O banco devolveu 0 linhas. Verifique se a coluna corp_oper_nr no Supabase tem o valor:", corpId);
      return;
    }

    // Preencher os campos
    data.forEach((row, index) => {
      const n = String(index + 1).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
          nameInput.value = row.aero_name || "";
          nameInput.dataset.rowId = row.id; // Guarda o ID para o SAVE
        }
        if (typeSelect) {
          typeSelect.value = row.aero_type || "";
          // Atualização da imagem
          const imgs = {
            "Heli Ligeiro": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg",
            "Heli Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg",
            "Heli Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg",
            "Avião de Asa Fixa Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg",
            "Avião de Asa Fixa Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"
          };
          if (imageElement) imageElement.src = imgs[typeSelect.value] || "https://i.imgur.com/4Ho5HRV.png";
        }
        if (autoInput) autoInput.value = row.aero_autonomy || "";
      });
    }
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




