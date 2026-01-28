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
    /* ====== SAVE NO HOSP GROUP FIELDS (VERSÃO OTIMIZADA) ====== */
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

      const hospitalValue = mainInput.value.trim();
      
      // --- REGRA DE OURO: Se o hospital estiver vazio, não gravamos esta linha ---
      if (hospitalValue === "") {
        console.log(`[NOHOSP] Linha ${n} vazia, a saltar...`);
        continue; 
      }

      const clean = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const val = el.value.trim();
        return val === "" ? null : val;
      };

      const payload = {
        corp_oper_nr: currentCorpOperNr,
        group_nr: i,
        hospital: hospitalValue,
        service: clean(`nohosp-serv-${n}`),
        start_date: clean(`nohosp-form-date-${n}`),
        start_time: clean(`nohosp-form-time-${n}`),
        end_date: clean(`nohosp-to-date-${n}`),
        end_time: clean(`nohosp-to-time-${n}`),
        next_hospital: clean(`nextHosp-${n}`)
      };

      let rowId = mainInput.dataset.rowId;

      // Se não temos o ID, verificamos se já existe no banco para decidir entre POST ou PATCH
      if (!rowId) {
        const resCheck = await fetch(
          `${SUPABASE_URL}/rest/v1/hospital_restrictions?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`, 
          { headers: headers }
        );
        const dataCheck = await resCheck.json();
        if (dataCheck && dataCheck.length > 0) rowId = dataCheck[0].id;
      }

      if (!rowId) {
        // Criar nova entrada
        await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions`, {
          method: "POST",
          headers: { ...headers, "Prefer": "return=representation" },
          body: JSON.stringify([payload])
        });
      } else {
        // Atualizar existente
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
