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
      createRouteInputs(total);
      await waitForRouteInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) {
        return console.error("❌ [ROUTES] currentCorpOperNr não definido!");
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/street_cut?select=id,group_nr,street_name,cut_motive,cut_until&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, {
            method: "GET",
            headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (nameInput && motiveInput && untilInput) {
            nameInput.dataset.rowId = row.id;
            nameInput.dataset.groupNr = row.group_nr;
            nameInput.value = row.street_name || "";
            motiveInput.value = row.cut_motive || "";
            untilInput.value = row.cut_until || "";
          }
        });
      } catch (e) {
        console.error("❌ [ROUTES] Erro ao carregar:", e);
      }
    }
    async function saveRoutesGroupFields(total = 13) {
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) {
        showPopupWarning("❌ Erro: Sessão não identificada.");
        return;
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (!nameInput) continue;
          const streetName = nameInput.value.trim();
          const cutMotive = motiveInput.value.trim();
          const cutUntil = untilInput.value.trim();
          let rowId = nameInput.dataset.rowId;
          if (!rowId) {
            const resCheck = await fetch(
              `${SUPABASE_URL}/rest/v1/street_cut?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`, {
                headers: headers
              }
            );
            const dataCheck = await resCheck.json();
            if (dataCheck.length > 0) {
              rowId = nameInput.dataset.rowId = dataCheck[0].id;
            }
          }
          if (!rowId) {
            const payloadInsert = [{corp_oper_nr: currentCorpOperNr, group_nr: i, street_name: streetName, cut_motive: cutMotive, cut_until: cutUntil}];
            const resCreate = await fetch(`${SUPABASE_URL}/rest/v1/street_cut`, {
              method: "POST",
              headers: { ...headers, "Prefer": "return=representation" },
              body: JSON.stringify(payloadInsert)
            });
            if (resCreate.ok) {
              const created = await resCreate.json();
              nameInput.dataset.rowId = created[0].id;
            }
          } 
          else {
            const payloadUpdate = {street_name: streetName, cut_motive: cutMotive, cut_until: cutUntil, corp_oper_nr: currentCorpOperNr};
            await fetch(`${SUPABASE_URL}/rest/v1/street_cut?id=eq.${rowId}`, {
              method: "PATCH",
              headers: headers,
              body: JSON.stringify(payloadUpdate)
            });
          }
        }
        showPopupSuccess("✅ Vias atualizadas com sucesso!");
        loadRoutesFromSupabase(total);
      } catch (error) {
        console.error("❌ [ROUTES] Erro ao gravar:", error);
        showPopupWarning("Erro ao gravar dados das vias.");
      }
    }
    document.addEventListener("DOMContentLoaded", () => loadRoutesFromSupabase());
