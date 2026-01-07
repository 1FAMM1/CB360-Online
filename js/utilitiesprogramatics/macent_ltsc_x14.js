/* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
    async function loadCMAsFromSupabase() {
  try {
    createCmaInputs();
    
    // USAR LOCALSTORAGE para coincidir com os teus headers
    const corp_oper_nr = localStorage.getItem('currentCorpOperNr'); 
    
    console.log("🚀 [CMA] A ler com ID:", corp_oper_nr);

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corp_oper_nr}&order=id.asc`, 
      {
        method: "GET",
        headers: getSupabaseHeaders() // Já inclui o x-my-corpo: 0805
      }
    );

    if (!res.ok) throw new Error(`Erro: ${res.status}`);
    
    const data = await res.json();
    console.log("📦 [CMA] Dados recebidos:", data);

    if (data.length > 0) {
      data.forEach((row, index) => {
        // Usamos o index para preencher os cartões 01 a 06
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


