/* =======================================
    VEHICLE UNAVAILABILITY GROUP
    ======================================= */
    /* ============== FIELD VALIDATION ============== */
    function validateVehicleUnavailabilityForm(isEnd = false) {
      const fields = isEnd ? [{id: 'end_vehicle_unavailable', label: 'Veículo'}, {id: 'end_reason_unavailability', label: 'Motivo'}, {id: 'end_unavailability_date', label: 'Data de Fim'},
                              {id: 'end_unavailability_hour', label: 'Hora de Fim'}]
                           : [{id: 'new_vehicle_unavailable', label: 'Veículo'}, {id: 'new_unavailability_date', label: 'Data de Início'}, {id: 'new_unavailability_hour', label: 'Hora de Início'},
                              {id: 'new_reason_unavailability', label: 'Motivo'}, {id: 'new_unavailability_local', label: 'Local'}];
      const missing = fields.filter(f => {
        const el = document.getElementById(f.id);
        return !el || !el.value.trim();
      }).map(f => f.label);
      if (missing.length > 0) {
        const list = missing.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
        return false;
      }
      return true;
    }
    /* ============== GENERATE NEW UNAVAILABILITY MESSAGE ============== */
    let lastUnavailabilityData = null;
    async function generateNewUnavailability() {
      if (!validateVehicleUnavailabilityForm()) return '';
      let vehicle = document.getElementById('new_vehicle_unavailable')?.value || '';
      const startDate = document.getElementById('new_unavailability_date')?.value || '';
      const startHour = document.getElementById('new_unavailability_hour')?.value || '';
      const motive = document.getElementById('new_reason_unavailability')?.value || '';
      const local = document.getElementById('new_unavailability_local')?.value || '';
      if (vehicle === 'ABSC-02') vehicle = 'INEM-Reserva';
      else if (vehicle === 'ABSC-01' || vehicle === 'ABSC-03') vehicle = 'INEM';
      const gdh = formatWSMSGDH(startDate, startHour);
      const currentData = {vehicle, startDate, startHour, motive, local};
      lastUnavailabilityData = currentData;
      let message = '';
      if (motive === "Pausa para Alimentação") {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\n${motive}, ${local}, ${gdh}`;
      } else if (["Falta de Macas", "Aguarda Triagem"].includes(motive)) {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nRetido(a) por: ${motive}, ${local}, ${gdh}`;
      } else {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nInoperacional por: ${motive}, ${local}, ${gdh}.`;
      }
      document.getElementById('wsms_output').value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopup('popup-success', "Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
      try {
        await saveUnavailabilityToSupabase(currentData);
      } catch (e) {
        console.error("Erro ao gravar indisponibilidade:", e);
      }
      loadActiveUnavailability();
      return message;
    }
    /* ============== SAVE UNAVAILABILITY TO DATABASE ============== */
    async function saveUnavailabilityToSupabase(data) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability`, {
          method: 'POST',
          headers: getSupabaseHeaders({returnRepresentation: true}),
          body: JSON.stringify({vehicle: data.vehicle, start_unavailability_date: data.startDate, start_unavailability_hour: data.startHour, unavailability_motive: data.motive,
                                status: "Em Aberto", corp_oper_nr: currentCorpOperNr})
        });
        if (!insertResp.ok) {
          console.error("❌ Erro ao gravar no Supabase:", await insertResp.text());
          return null;
        }
        return await insertResp.json();
      } catch (e) {
        console.error("❌ Erro inesperado ao gravar no Supabase:", e);
        return null;
      }
    }
    /* ============== LOAD ACTIVE UNAVAILABILITIES ============== */
    async function loadActiveUnavailability() {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const tbody = document.getElementById('active-unavailability-tbody');
      if (!tbody) return;
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?status=eq.Em%20Aberto&corp_oper_nr=eq.${currentCorpOperNr}`, {
          headers: getSupabaseHeaders()
        });
        const data = await resp.json();
        tbody.innerHTML = '';
        if (!data.length) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="padding: 20px; text-align: center; color: #6C757D;">
                Não existem veículos indisponíveis neste momento.
              </td>
            </tr>`;
          return;
        }
        data.forEach(item => {
          const tr = document.createElement('tr');
          const dateHour = formatDisplayDateTime(item.start_unavailability_date, item.start_unavailability_hour);
          tr.innerHTML = `
            <td style="text-align:center; border: 1px solid #DEE2E6;">${dateHour}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">${item.vehicle}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">${item.unavailability_motive}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">${item.status}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">
              <button class="btn btn-danger btn-sm finalize-btn">Finalizar Indisponibilidade</button>
            </td>`;
          tr.querySelector('.finalize-btn').addEventListener('click', () => {
            document.getElementById('end_vehicle_unavailable').value = item.vehicle;
            document.getElementById('end_reason_unavailability').value = item.unavailability_motive;
            document.getElementById('availability-card').style.display = 'block';
          });
          tbody.appendChild(tr);
        });
      } catch (e) {
        console.error("Erro ao carregar indisponibilidades:", e);
      }
    }
    /* ============== FORMAT DISPLAY DATE/TIME ============== */
    function formatDisplayDateTime(dateStr, timeStr) {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year} ${timeStr || ''}`;
    }
    /* ============== GENERATE END OF UNAVAILABILITY MESSAGE ============== */
    async function generateEndUnavailability() {
      if (!validateVehicleUnavailabilityForm(true)) return '';
      const vehicle = document.getElementById('end_vehicle_unavailable')?.value;
      const motive = document.getElementById('end_reason_unavailability')?.value;
      const endDate = document.getElementById('end_unavailability_date')?.value;
      const endHour = document.getElementById('end_unavailability_hour')?.value;
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const query = `vehicle=eq.${encodeURIComponent(vehicle)}&unavailability_motive=eq.${encodeURIComponent(motive)}&status=eq.Em%20Aberto&corp_oper_nr=eq.${currentCorpOperNr}`;
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?${query}`, {
          headers: getSupabaseHeaders()
        });
        const data = await resp.json();
        if (!data.length) {
          showPopup('popup-danger', "Não foi encontrada nenhuma indisponibilidade em aberto para este veículo.");
          return '';
        }
        const record = data[0];
        const startDateTime = new Date(`${record.start_unavailability_date}T${record.start_unavailability_hour}`);
        const endDateTime = new Date(`${endDate}T${endHour}`);
        const diffMs = endDateTime - startDateTime;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const timeUnavailable = `${padNumber(hours)}h${padNumber(minutes)}m`;
        const gdhEnd = formatWSMSGDH(endDate, endHour);
        let displayName = vehicle === "ABSC-02" ? "INEM-Reserva" : ["ABSC-01","ABSC-03"].includes(vehicle) ? "INEM" : vehicle;
        let message = '';
        if (motive === "Pausa para Alimentação") {
          message = `*🚨INFORMAÇÃO🚨*\n\n*${displayName}:*\nFim de: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
        } else if (["Falta de Macas","Aguarda Triagem"].includes(motive)) {
          message = `*🚨INFORMAÇÃO🚨*\n\n*${displayName}:*\nFim de Retenção por: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
        } else {
          message = `*🚨INFORMAÇÃO🚨*\n\n*${displayName}:*\nFim de Inoperacionalidade por: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
        }
        const out = document.getElementById('wsms_output');
        if (out) out.value = message;
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
        showPopup('popup-success', "Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
        await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?id=eq.${record.id}`, {
          method: 'DELETE',
          headers: getSupabaseHeaders()
        });
        document.getElementById('availability-card').style.display = 'none';
        loadActiveUnavailability();
        return message;
      } catch (e) {
        console.error("Erro ao gerar fim de indisponibilidade:", e);
        showPopup('popup-danger', "Erro ao gerar mensagem de fim de indisponibilidade.");
        return '';
      }
    }
    /* ============== INITIALIZE ============== */
    document.addEventListener('DOMContentLoaded', () => {
      loadActiveUnavailability();
      refreshVehicleIndispAndBlinker();
      setInterval(refreshVehicleIndispAndBlinker, 10000);
    });
    /* ============== HELPER ============== */
    function padNumber(n) {return String(n).padStart(2,'0');}
    async function refreshVehicleIndispAndBlinker() {
      await loadActiveUnavailability();
      if (window.veícIndispBlinker?.update) await veícIndispBlinker.update();
    }