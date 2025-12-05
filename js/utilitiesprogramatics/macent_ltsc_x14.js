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
        if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
        const data = await res.json();
        data.forEach(row => {
          const n = String(row.id).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          const imageElement = document.getElementById(`cma_image_${n}`);
          if (nameInput) nameInput.value = row.aero_name || "";

          if (typeSelect) {
            typeSelect.value = row.aero_type || "";
            nameInput.dataset.rowId = row.id;
          }
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
          if (autoInput) autoInput.value = row.aero_autonomy || "";
        });
      } catch (error) {
        console.error("❌ Erro ao carregar CMAs:", error);
      }
    }
    
    async function saveCMAsGroupFields() {
      try {
        for (let i = 1; i <= 6; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          if (!nameInput || !typeSelect || !autoInput) continue;
          const payload = {
            aero_name: nameInput.value || null, aero_type: typeSelect.value || null, aero_autonomy: autoInput.value || null};
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