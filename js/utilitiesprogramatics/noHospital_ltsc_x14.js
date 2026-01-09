    /* =======================================
    NO HOSPITAL
    ======================================= */    
    async function loadNoHospFromSupabase(total = 12) {
      createNoHospInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) return console.error("❌ [NOHOSP] CorpOperNr não definido!");
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/hospital_restrictions?select=*&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, { 
            method: "GET", 
            headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const fields = {
            nohosp: document.getElementById(`nohosp-${n}`),
            serv: document.getElementById(`nohosp-serv-${n}`),
            fromDate: document.getElementById(`nohosp-form-date-${n}`),
            fromTime: document.getElementById(`nohosp-form-time-${n}`),
            toDate: document.getElementById(`nohosp-to-date-${n}`),
            toTime: document.getElementById(`nohosp-to-time-${n}`),
            nextHosp: document.getElementById(`nextHosp-${n}`)
          };
          if (fields.nohosp) {
            fields.nohosp.dataset.rowId = row.id;
            fields.nohosp.value = row.hospital || "";
            fields.serv.value = row.service || "";
            fields.fromDate.value = row.start_date || "";
            fields.fromTime.value = row.start_time || "";
            fields.toDate.value = row.end_date || "";
            fields.toTime.value = row.end_time || "";
            fields.nextHosp.value = row.next_hospital || "";
          }
        });
      } catch (e) {
        console.error("❌ [NOHOSP] Erro ao carregar:", e);
      }
    }
    async function saveNoHospGroupFields(total = 12) {
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
          const mainInput = document.getElementById(`nohosp-${n}`);
          if (!mainInput) continue;
          const payload = {corp_oper_nr: currentCorpOperNr, group_nr: i, hospital: mainInput.value.trim(), service: document.getElementById(`nohosp-serv-${n}`).value.trim(), 
                           start_date: document.getElementById(`nohosp-form-date-${n}`).value, start_time: document.getElementById(`nohosp-form-time-${n}`).value,
                           end_date: document.getElementById(`nohosp-to-date-${n}`).value, end_time: document.getElementById(`nohosp-to-time-${n}`).value,
                           next_hospital: document.getElementById(`nextHosp-${n}`).value.trim()};
          let rowId = mainInput.dataset.rowId;
          if (!rowId) {
            const resCheck = await fetch(
              `${SUPABASE_URL}/rest/v1/hospital_restrictions?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`, {
                headers: headers
              }
            );
            const dataCheck = await resCheck.json();
            if (dataCheck.length > 0) rowId = dataCheck[0].id;
          }
          if (!rowId) {
            await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions`, {
              method: "POST",
              headers: {...headers, "Prefer": "return=representation"},
              body: JSON.stringify([payload])
            });
          } else {
            await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions?id=eq.${rowId}`, {
              method: "PATCH",
              headers: headers,
              body: JSON.stringify(payload)
            });
          }
        }
        showPopupSuccess("✅ Dados hospitalares atualizados!");
        loadNoHospFromSupabase(total);
      } catch (error) {
        console.error("❌ [NOHOSP] Erro ao gravar:", error);
        showPopupWarning("Erro ao gravar dados hospitalares.");
      }
    }
