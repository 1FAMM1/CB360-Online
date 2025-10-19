    /* =======================================
            RELEVANT INFORMATION
    ======================================= */
    async function loadInfosFromSupabase() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/infos_select?select=id,from,destination,info&order=id.asc`, {
          method: 'GET',
          headers: getSupabaseHeaders(),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro HTTP ${res.status}: ${errText}`);
        }
        const rows = await res.json();
        console.log('✅ Rows recebidas:', rows);
        ['01', '02', '03', '04'].forEach(n => {
          const group = document.getElementById(`relev-info-${n}`);
          if (!group) return;
          group.dataset.rowId = '';
          const fromInput = document.getElementById(`from-${n}`);
          const toInput = document.getElementById(`to-${n}`);
          const infoTA = document.getElementById(`info-${n}`);
          if (fromInput) fromInput.value = '';
          if (toInput) toInput.value = '';
          if (infoTA) infoTA.value = '';
        });
        rows.forEach(row => {
          const n = String(row.id).padStart(2, '0');
          const group = document.getElementById(`relev-info-${n}`);
          if (!group) return console.warn(`⚠️ Não existe grupo HTML para a row id=${row.id}`);
          group.dataset.rowId = row.id;
          const fromInput = document.getElementById(`from-${n}`);
          const toInput = document.getElementById(`to-${n}`);
          const infoTA = document.getElementById(`info-${n}`);
          if (fromInput) fromInput.value = row.from || '';
          if (toInput) toInput.value = row.destination || '';
          if (infoTA) infoTA.value = row.info || '';
        });
      } catch (e) {
        console.error('❌ Erro ao carregar infos:', e);
      }
    }
    async function saveInfoGroupFields(n) {
      const group = document.getElementById(`relev-info-${n}`);
      if (!group) return;
      const rowId = group.dataset.rowId;
      if (!rowId) return console.error(`⚠️ Grupo relev-info-${n} não tem rowId!`);
      const fromVal = document.getElementById(`from-${n}`)?.value || '';
      const toVal = document.getElementById(`to-${n}`)?.value || '';
      const infoVal = document.getElementById(`info-${n}`)?.value || '';
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders({
            returnRepresentation: true
          }),
          body: JSON.stringify({
            from: fromVal,
            destination: toVal,
            info: infoVal
          })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro HTTP ${res.status}: ${errText}`);
        }
        showPopupSuccess(`A informação ${n} foi atualizada com sucesso.`, false);
        console.log(`✅ Row ${rowId} atualizada no Supabase`);
      } catch (e) {
        console.error('❌ Erro ao atualizar Supabase:', e);
      }
    }
    async function clearInfoGroupFields(n) {
      const group = document.getElementById(`relev-info-${n}`);
      if (!group) return;
      group.querySelectorAll('input[type="text"]').forEach(i => i.value = '');
      group.querySelectorAll('textarea').forEach(t => t.value = '');
      const rowId = group.dataset.rowId;
      if (!rowId) return console.error(`⚠️ Nenhum rowId definido para relev-info-${n}`);
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders({
            returnRepresentation: true
          }),
          body: JSON.stringify({
            from: '',
            destination: '',
            info: ''
          })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro HTTP ${res.status}: ${errText}`);
        }
        showPopupWarning(`Os campos da informação ${n} foram limpos com sucesso. Pode usar novamente o grupo de informação ${n}.`);
        console.log(`✅ Row ${rowId} limpa no Supabase`);
      } catch (e) {
        console.error('❌ Erro ao atualizar Supabase:', e);
      }
    }