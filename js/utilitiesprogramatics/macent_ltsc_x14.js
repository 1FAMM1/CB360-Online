/* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
    async function loadCMAsFromSupabase() {
  try {
    createCmaInputs();
    const corpOperNr = localStorage.getItem("currentCorpOperNr");

    // FILTRO ADICIONADO: corp_oper_nr=eq.XXXX
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpOperNr}&order=id.asc`, {
        method: "GET",
        headers: getSupabaseHeaders()
      }
    );

    if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
    const data = await res.json();

    // Mapeamos os dados para os inputs (01 a 06) baseado na ordem que chegam
    data.forEach((row, index) => {
      const n = String(index + 1).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
        nameInput.value = row.aero_name || "";
        // GUARDAMOS O ID REAL: Crucial para o SAVE saber qual linha editar
        nameInput.dataset.rowId = row.id; 
      }

      if (typeSelect) {
        typeSelect.value = row.aero_type || "";
        // Lógica de imagens mantida...
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

    for (let i = 1; i <= 6; i++) {
      const n = String(i).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);

      // SÓ AVANÇA SE O INPUT EXISTIR E TIVER UM ID VINCULADO
      if (!nameInput || !nameInput.dataset.rowId) continue;

      const realDbId = nameInput.dataset.rowId;

      const payload = {
        aero_name: nameInput.value || null,
        aero_type: typeSelect.value || null,
        aero_autonomy: autoInput.value || null,
        corp_oper_nr: corpOperNr
      };

      // PATCH usando o ID real da base de dados e garantindo a corporação
      const resPatch = await fetch(
        `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${realDbId}&corp_oper_nr=eq.${corpOperNr}`, {
          method: "PATCH",
          headers: getSupabaseHeaders({ returnRepresentation: true }),
          body: JSON.stringify(payload)
        }
      );

      if (!resPatch.ok) throw new Error(`Erro ao atualizar linha ID ${realDbId}`);
    }
    showPopupSuccess("✅ Dados guardados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao salvar CMAs:", error);
    showPopupWarning("❌ Erro ao guardar os dados!");
  }
}
