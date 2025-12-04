    /* =======================================
            ROAD CLOSURES
    ======================================= */
    async function waitForRouteInputs(total = 13) {
      const requiredIds = Array.from({ length: total }, (_, i) => `route-${String(i + 1).padStart(2, '0')}-name`);
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (requiredIds.every(id => document.getElementById(id))) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }

    async function loadRoutesFromSupabase(total = 13) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpOperNr) return console.error("❌ currentCorpOperNr não definido!");    
      try {
        createRouteInputs(total);
        await waitForRouteInputs(total);    
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/street_cut?select=id,group_nr,street_name,cut_motive,cut_until&corp_oper_nr=eq.${currentCorpOperNr}`, {
            method: "GET",
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();    
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (!nameInput || !motiveInput || !untilInput) return;    
          nameInput.dataset.rowId = row.id;
          nameInput.dataset.groupNr = row.group_nr;    
          nameInput.value = row.street_name || "";
          motiveInput.value = row.cut_motive || "";
          untilInput.value = row.cut_until || "";
        });
      } catch (e) {
        console.error("❌ Erro ao carregar Routes:", e);
      }
    }

    async function saveRoutesGroupFields(total = 13) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpOperNr) return console.error("❌ currentCorpOperNr não definido!");    
      try {
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (!nameInput || !motiveInput || !untilInput) continue;    
          const streetName = nameInput.value.trim();
          const cutMotive = motiveInput.value.trim();
          const cutUntil = untilInput.value.trim();    
          let rowId = nameInput.dataset.rowId;
          if (!rowId) {
            try {
              const resGet = await fetch(
                `${SUPABASE_URL}/rest/v1/street_cut?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`, {
                  method: "GET",
                  headers: getSupabaseHeaders()
                }
              );
              if (!resGet.ok) throw new Error(await resGet.text());
              const dataGet = await resGet.json();
              if (dataGet.length > 0) rowId = nameInput.dataset.rowId = dataGet[0].id;
            } catch (e) {
              console.error(`❌ Erro ao buscar row existente para route ${n}:`, e);
            }
          }
          if (!rowId) {
            try {
              const resCreate = await fetch(`${SUPABASE_URL}/rest/v1/street_cut`, {
                method: "POST",
                headers: getSupabaseHeaders({ Prefer: "return=representation" }),
                body: JSON.stringify([{corp_oper_nr: currentCorpOperNr, group_nr: i, street_name: streetName || "", cut_motive: cutMotive || "", cut_until: cutUntil || ""}])
              });
              if (!resCreate.ok) throw new Error(await resCreate.text());
              const createdRow = await resCreate.json();
              rowId = nameInput.dataset.rowId = createdRow[0].id;
            } catch (e) {
              console.error(`❌ Erro ao criar linha para route ${n}:`, e);
              continue;
            }
          }
          try {
            const resPatch = await fetch(`${SUPABASE_URL}/rest/v1/street_cut?id=eq.${rowId}`, {
              method: "PATCH",
              headers: getSupabaseHeaders({ Prefer: "return=representation" }),
              body: JSON.stringify({street_name: streetName || "", cut_motive: cutMotive || "", cut_until: cutUntil || ""})
            });
            if (!resPatch.ok) throw new Error(await resPatch.text());
          } catch (e) {
            console.error(`❌ Erro ao atualizar route ${n}:`, e);
          }
        }    
        showPopupSuccess("Todos os cortes de Vias/Arruamentos foram atualizados com sucesso!");
      } catch (error) {
        console.error("❌ Erro geral ao gravar Routes:", error);
        alert("Erro ao gravar no Supabase. Ver consola.");
      }
    }
    document.addEventListener("DOMContentLoaded", () => loadRoutesFromSupabase());