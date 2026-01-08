    /* =======================================
    RELEVANT INFORMATION
    ======================================= */
    async function createDefaultInfoRows(corp) {
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = corp;
      const defaultRows = [1, 2, 3, 4].map(n => ({corp_oper_nr: corp, group_nr: n, from: "", destination: "", info: ""}));
      const res = await fetch(`${SUPABASE_URL}/rest/v1/infos_select`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=representation" },
        body: JSON.stringify(defaultRows)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    async function waitForInputs() {
      const requiredIds = ['relev-info-01', 'relev-info-02', 'relev-info-03', 'relev-info-04'];
      return new Promise(resolve => {
        const interval = setInterval(() => {
          const allExist = requiredIds.every(id => document.getElementById(id));
          if (allExist) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }
    async function loadInfosFromSupabase() {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpOperNr) return console.error("❌ currentCorpOperNr não definido!");    
      try {
        createRelevInfoInputs();
        await waitForInputs();
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        let res = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?select=id,group_nr,from,destination,info&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, {
            method: 'GET',
            headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        let rows = await res.json();    
        if (!rows || rows.length === 0) {
          console.warn("⚠ Nenhuma info encontrada — criando linhas padrão...");
          rows = await createDefaultInfoRows(currentCorpOperNr);
        }
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const group = document.getElementById(`relev-info-${n}`);
          if (!group) return;
          group.dataset.rowId = row.id;
          const fromInput = document.getElementById(`from-${n}`);
          const toInput = document.getElementById(`to-${n}`);
          const infoTA = document.getElementById(`info-${n}`);
          if (fromInput) fromInput.value = row.from || "";
          if (toInput) toInput.value = row.destination || "";
          if (infoTA) infoTA.value = row.info || "";
        });
      } catch (e) {
        console.error("❌ Erro no loadInfosFromSupabase:", e);
      }
    }
    async function saveInfoGroupFields(n) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const group = document.getElementById(`relev-info-${n}`);
      if (!group || !currentCorpOperNr) return;    
      const fromVal = document.getElementById(`from-${n}`).value || "";
      const toVal = document.getElementById(`to-${n}`).value || "";
      const infoVal = document.getElementById(`info-${n}`).value || "";    
      let rowId = group.dataset.rowId;
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = currentCorpOperNr;
      try {
        if (!rowId) {
          const resGet = await fetch(
            `${SUPABASE_URL}/rest/v1/infos_select?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${parseInt(n,10)}`, {
              method: 'GET',
              headers: headers
            }
          );
          const dataGet = await resGet.json();
          if (dataGet.length > 0) rowId = group.dataset.rowId = dataGet[0].id;
        }
        if (!rowId) return console.error(`⚠️ Sem rowId para relev-info-${n}`);
        const resPatch = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
            method: "PATCH",
            headers: { ...headers, "Prefer": "return=representation" },
            body: JSON.stringify({from: fromVal, destination: toVal, info: infoVal, corp_oper_nr: currentCorpOperNr})
          }
        );
        if (!resPatch.ok) throw new Error(await resPatch.text());
        showPopupSuccess(`A informação ${n} foi atualizada com sucesso.`, false);
      } catch (e) {
        console.error("❌ Erro ao salvar info:", e);
      }
    }
    async function clearInfoGroupFields(n) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr"); 
      const group = document.getElementById(`relev-info-${n}`);
      if (!group || !currentCorpOperNr) return;
      const rowId = group.dataset.rowId;
      if (!rowId) return console.error(`⚠️ Sem rowId para limpar relev-info-${n}`);
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = currentCorpOperNr;
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
            method: "PATCH",
            headers: { ...headers, "Prefer": "return=representation" },
            body: JSON.stringify({from: "", destination: "", info: "", corp_oper_nr: currentCorpOperNr})
          }
        );
        if (!res.ok) throw new Error(await res.text());
        document.getElementById(`from-${n}`).value = "";
        document.getElementById(`to-${n}`).value = "";
        document.getElementById(`info-${n}`).value = "";
        showPopupWSuccess(`A informação ${n} foi limpa com sucesso.`);
      } catch (e) {
        console.error("❌ Erro ao limpar info:", e);
      }
    }
