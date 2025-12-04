    /* =======================================
    VEHICLE UNAVAILABILITY GROUP
    ========================================*/
    /* == CREATION OF MESSAGE FOR UNAVAILABLE VEHICLES === */
    let lastUnavailabilityData = null;
    async function generateNewUnvailability() {
      let vehicle = document.getElementById('new_vehicle_unavailable')?.value || '';
      const startDate = document.getElementById('new_unavailability_date')?.value || '';
      const startHour = document.getElementById('new_unavailability_hour')?.value || '';
      const motive = document.getElementById('new_reason_unavailability')?.value || '';
      const local = document.getElementById('new_unavailability_local')?.value || '';
      if (!vehicle || !startDate || !startHour || !motive || !local) {
        showPopupWarning("Preencha todos os campos obrigatórios!");
        return '';
      }
      if (vehicle === 'ABSC-02') vehicle = 'INEM-Reserva';
      else if (vehicle === 'ABSC-01' || vehicle === 'ABSC-03') vehicle = 'INEM';
      const gdh = formatWSMSGDH(startDate, startHour);
      const currentData = {vehicle, startDate, startHour, motive, local};
      lastUnavailabilityData = currentData;
      let message = '';
      if (motive === "Pausa para Alimentação") {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\n${motive}, ${local}, ${gdh}`;
      } else if (motive === "Falta de Macas" || motive === "Aguarda Triagem") {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nRetido(a) por: ${motive}, ${local}, ${gdh}`;
      } else {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nInoperacional por: ${motive}, ${local}, ${gdh}.`;
      }
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopupSuccess("Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
      try {
        await saveUnavailabilityToSupabase(currentData);
      } catch (e) {
        console.error("Erro silencioso ao gravar indisponibilidade:", e);
      }
      loadActiveUnavailability();
      return message;
    }
    /* === RECORDING UNAVAILABLE VEHICLES IN DATABASE ==== */    
    async function saveUnavailabilityToSupabase(data) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "";
      try {
        const insertResp = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_unavailability`, {
            method: 'POST',
            headers: getSupabaseHeaders({returnRepresentation: true}),
            body: JSON.stringify({vehicle: data.vehicle, start_unavailability_date: data.startDate, start_unavailability_hour: data.startHour, 
                                  unavailability_motive: data.motive, status: "Em Aberto", corp_oper_nr: currentCorpOperNr})
          }
        );
        if (!insertResp.ok) {
          const errorText = await insertResp.text();
          console.error("❌ Erro ao gravar no Supabase:", errorText);
          return null;
        }
        const inserted = await insertResp.json();
        return inserted;
      } catch (e) {
        console.error("❌ Erro inesperado ao gravar no Supabase:", e);
        return null;
      }
    }
    /* === LOADING UNAVAILABLE VEHICLES FROM DATABASE ==== */    
    async function loadActiveUnavailability() {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "";
      const tbody = document.getElementById('active-unavailability-tbody');
      if (!tbody) return;
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_unavailability?status=eq.Em%20Aberto&corp_oper_nr=eq.${currentCorpOperNr}`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await resp.json();
        tbody.innerHTML = '';
        if (data.length === 0) {
          tbody.innerHTML = `
          <tr>
            <td colspan="8" style="padding: 20px; text-align: center; color: #6C757D;">
              Não existem veículos indisponíveis neste momento.
            </td>
          </tr>
        `;
          return;
        }

        function formatDateDisplay(dateTimeStr) {
          if (!dateTimeStr) return '';
          const [datePart, timePart] = dateTimeStr.split(' ');
          const [year, month, day] = datePart.split('-');
          return `${day}/${month}/${year} ${timePart}`;
        }
        data.forEach(item => {
          const tr = document.createElement('tr');
          const dateHour = formatDateDisplay(`${item.start_unavailability_date} ${item.start_unavailability_hour}`);
          tr.innerHTML = `
            <td style="text-align:center; border: 1px solid #DEE2E6;">${dateHour}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">${item.vehicle}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">${item.unavailability_motive}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">${item.status}</td>
            <td style="text-align:center; border: 1px solid #DEE2E6;">
              <button class="btn btn-danger btn-sm finalize-btn">Finalizar Indisponibilidade</button>
            </td>
          `;
          const finalizeBtn = tr.querySelector('.finalize-btn');
          finalizeBtn.addEventListener('click', () => {
            document.getElementById('end_vehicle_unavailable').value = item.vehicle;
            document.getElementById('end_reason_unavailability').value = item.unavailability_motive;
            const endCard = document.getElementById('availability-card');
            if (endCard) {
              endCard.style.display = 'block';
            }
          });
          tbody.appendChild(tr);
        });
      } catch (e) {
        console.error("Erro ao carregar indisponibilidades:", e);
        showPopupWarning("❌ Erro ao carregar indisponibilidades em aberto.");
      }
    }
    /* = CREATION OF MESSAGE ABOUT END OF VEHICLE UNAVAILABILITY AND REMOVAL FROM DB = */
    async function generateEndUnavailability() {
      const vehicle = document.getElementById('end_vehicle_unavailable')?.value || '';
      const motive = document.getElementById('end_reason_unavailability')?.value || '';
      const endDateField = document.getElementById('end_unavailability_date')?.value;
      const endHourField = document.getElementById('end_unavailability_hour')?.value;
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "";
      if (!vehicle || !motive || !endDateField || !endHourField) {
        showPopupWarning("Preencha os campos obrigatórios!");
        return '';
      }
      try {
        const query = `vehicle=eq.${encodeURIComponent(vehicle)}` + `&unavailability_motive=eq.${encodeURIComponent(motive)}` + `&status=eq.Em%20Aberto` + `&corp_oper_nr=eq.${currentCorpOperNr}`;
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_unavailability?${query}`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await resp.json();
        if (data.length === 0) {
          showPopupWarning("Não foi encontrada indisponibilidade em aberto para este veículo.");
          return '';
        }
        const record = data[0];
        const startDateTime = new Date(`${record.start_unavailability_date}T${record.start_unavailability_hour}`);
        const endDateTime = new Date(`${endDateField}T${endHourField}`);
        const diffMs = endDateTime - startDateTime;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const timeUnavailable = `${padNumber(hours)}h${padNumber(minutes)}m`;
        const gdhEnd = formatWSMSGDH(endDateField, endHourField);
        let displayName = vehicle;
        if (vehicle === "ABSC-02") {
          displayName = "INEM-Reserva";
        } else if (vehicle === "ABSC-01" || vehicle === "ABSC-03") {
          displayName = "INEM";
        }
        let message = '';
        if (motive === "Pausa para Alimentação") {
          message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nFim de: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
        } else if (motive === "Falta de Macas" || motive === "Aguarda Triagem") {
          message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nFim de Retenção por: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
        } else {
          message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nFim de Inoperacionalidade por: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
        }
        const out = document.getElementById('wsms_output');
        if (out) out.value = message;
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
        showPopupSuccess("Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
        await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_unavailability?id=eq.${record.id}`, {
            method: 'DELETE',
            headers: getSupabaseHeaders()
          }
        );
        const endCard = document.getElementById('availability-card');
        if (endCard) {
          endCard.style.display = 'none';
        }
        loadActiveUnavailability();
        return message;
      } catch (e) {
        console.error("❌ Erro ao gerar fim de indisponibilidade:", e);
        showPopupWarning("Erro ao gerar mensagem de fim de indisponibilidade.");
        return '';
      }
    }
    document.addEventListener('DOMContentLoaded', () => {
      loadActiveUnavailability();
    });    
    /* ============= UPDATE SIDEBAR BLINKER ============== */ 
    async function refreshVehícIndispAndBlinker() {
      await loadActiveUnavailability();
      await veícIndispBlinker.update();
    }
    refreshVehícIndispAndBlinker();
    setInterval(refreshVehícIndispAndBlinker, 10000);