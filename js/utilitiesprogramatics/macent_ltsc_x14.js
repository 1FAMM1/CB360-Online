/* =======================================
           AIR RESOURCE CENTERS
======================================= */
async function loadCMAsFromSupabase() {
  try {
    createCmaInputs();
    
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?order=id.asc`, {
        method: "GET",
        headers: getSupabaseHeaders()
      }
    );

    const data = await res.json();
    console.log("🔍 Dados recebidos do Supabase:", data); // Vê o que aparece na consola (F12)

    if (data.length === 0) {
      console.warn("⚠️ A base de dados não devolveu nenhuma linha para esta corporação.");
      return;
    }

    data.forEach((row, index) => {
      // Usamos o index + 1 para garantir que preenchemos os campos 01 a 06
      const n = String(index + 1).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
        nameInput.value = row.aero_name || "";
        nameInput.dataset.rowId = row.id; // IMPORTANTE guardar o ID real para gravar
      }
      
      if (typeSelect) {
        typeSelect.value = row.aero_type || "";
        // Atualiza a imagem (podes manter o teu switch aqui)
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
document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);

