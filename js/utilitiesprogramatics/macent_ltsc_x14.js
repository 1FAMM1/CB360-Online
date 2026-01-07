    /* =======================================
    AIR RESOURCE CENTERS
    ======================================= */
    async function loadCMAsFromSupabase() {
      try {
        if (typeof createCmaInputs === "function") createCmaInputs();
        const corpId = sessionStorage.getItem('currentCorpOperNr');
        if (!corpId) {
          console.error("❌ Erro: currentCorpOperNr não encontrado!");
          return;
        }
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = corpId; 
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpId}&order=id.asc`, {
            method: "GET",
            headers: headers
          }
        );
        if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
        const data = await res.json();
        if (data.length === 0) {
          console.warn("⚠️ O banco devolveu 0 linhas para a corp:", corpId);
          return;
        }
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
            if (imageElement) {
              const src = imagensAeronaves[row.aero_type] || "https://i.imgur.com/4Ho5HRV.png";
              imageElement.src = src;
            }
          }
          if (autoInput) {
            autoInput.value = row.aero_autonomy || "";
          }
        });
      } catch (error) {
        console.error("❌ Erro no load:", error);
      }
    }
    async function saveCMAsGroupFields() {
      try {
        const corpId = localStorage.getItem('currentCorpOperNr') || sessionStorage.getItem('currentCorpOperNr');
        if (!corpId) {
          showPopupWarning("❌ Erro: Sessão expirada. Faça login novamente.");
          return;
        }
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = corpId;
        for (let i = 1; i <= 6; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          if (nameInput && nameInput.dataset.rowId) {
            const dbId = nameInput.dataset.rowId;
            const payload = {aero_name: nameInput.value || "", aero_type: typeSelect.value || "", aero_autonomy: autoInput.value || "", corp_oper_nr: corpId};
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${dbId}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(payload)
              }
            );
            if (!res.ok) {
              const errorData = await res.json();
              console.error(`❌ Erro no Card ${n}:`, errorData.message);
              throw new Error(`Falha ao gravar card ${n}`);
            }
          }
        }
        showPopupSuccess("✅ Todos os dados foram guardados com sucesso!");
        loadCMAsFromSupabase();
      } catch (error) {
        console.error("❌ Erro fatal na gravação:", error);
        showPopupWarning("❌ Ocorreu um erro ao guardar os dados. Verifique a consola.");
      }
    }
    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);
