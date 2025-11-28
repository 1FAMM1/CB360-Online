    /* =======================================
              GROUP CURRENT EVENTS
    ======================================= */
    function parseDateTime(dateTimeStr) {
      if (!dateTimeStr) return null;
      const [datePart, timePart] = dateTimeStr.split(' ');
      if (!datePart || !timePart) return null;
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    /* ========== READING AND CHARGING ========== */
    async function loadActiveOccurrences() {
      const tbody = document.getElementById('active-occurrences-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      try {
        const resp = await fetch(``${SUPABASE_URL}rest/v1/occurrences_control?select=*,vehicles&status=in.(Em Curso,Em Resolução,Em Conclusão)`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const occurrences = await resp.json();
        if (occurrences.length === 0) {
          tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 20px; text-align: center; color: #6C757D;">
            Não existem ocorrências ativas neste momento.
          </td>
        </tr>`;
          return;
        }
        occurrences.forEach(occ => {
          const startDate = parseDateTime(occ.start_date);
          let formattedDate = occ.start_date;
          if (startDate) {
            formattedDate = `${String(startDate.getDate()).padStart(2,'0')}/${String(startDate.getMonth()+1).padStart(2,'0')}/${startDate.getFullYear()} ${String(startDate.getHours()).padStart(2,'0')}:${String(startDate.getMinutes()).padStart(2,'0')}`;
          }
          let vehiclesCount = 0;
          if (Array.isArray(occ.vehicles)) vehiclesCount = occ.vehicles.length;
          else if (typeof occ.vehicles === 'string') vehiclesCount = occ.vehicles.split(',').filter(v => v.trim() !== '').length;
          const tr = document.createElement('tr');
          tr.innerHTML = `
        <td style="text-align: center; border: 1px solid #DEE2E6;">${formattedDate}</td>
        <td style="text-align: center; border: 1px solid #DEE2E6;">${occ.occorrence}</td>
        <td style="text-align: center; border: 1px solid #DEE2E6;">${occ.local}</td>
        <td style="text-align: center; border: 1px solid #DEE2E6;">${occ.localitie}</td>
        <td style="text-align: center; border: 1px solid #DEE2E6;">${vehiclesCount}</td>
        <td style="text-align: center; border: 1px solid #DEE2E6;">${occ.status}</td>
        <td style="text-align: center; border: 1px solid #DEE2E6;">
          <button class="btn btn-danger posit-btn" style="font-size: 10px;">POSIT</button>
        </td>        
      `;
          tbody.appendChild(tr);
          tr.querySelector('.posit-btn').addEventListener('click', () => openPositPopup(occ));
        });
      } catch (error) {
        console.error("Erro ao carregar ocorrências ativas:", error);
        tbody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 20px; text-align: center; color: red;">
          Erro ao carregar ocorrências
        </td>
      </tr>`;
      }
    }
    /* ========== POSIT SPECIAL POPUP ========== */
    let currentPositId = null;

    function openPositPopup(occurrence) {
      currentPositId = occurrence.id;
      document.getElementById('posit-description').value = occurrence.occorrence || '';
      document.getElementById('posit-local').value = occurrence.local || '';
      document.getElementById('posit-localidade-hidden').value = occurrence.localitie || '';
      document.getElementById('posit-status').value = occurrence.status || '';
      document.getElementById('posit-text').value = '';
      document.getElementById('posit-time').value = '';
      document.getElementById('desmobilizacao').checked = false;
      document.getElementById('popup-posit-modal').style.display = 'flex';
    }
    const positTimeInput = document.getElementById('posit-time');
    positTimeInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 4) val = val.slice(0, 4);
      let hours = val.slice(0, 2);
      let minutes = val.slice(2, 4);
      if ((hours.length === 2 && Number(hours) > 23) || (minutes.length === 2 && Number(minutes) > 59)) {
        e.target.value = '';
        return;
      }
      e.target.value = minutes ? `${hours}:${minutes}` : hours;
    });

    function closePositPopup() {
      document.getElementById('popup-posit-modal').style.display = 'none';
      loadActiveOccurrences();
    }
    document.getElementById('posit-send-btn').onclick = async function() {
      const status = document.getElementById('posit-status').value;
      if (!currentPositId) {
        showPopupWarning("Não selecionou nenhuma ocorrência.");
        return;
      }
      const occorrence = document.getElementById('posit-description').value;
      const local = document.getElementById('posit-local').value;
      const localidade = document.getElementById('posit-localidade-hidden').value;
      const horaPosit = document.getElementById('posit-time').value;
      const positText = document.getElementById('posit-text').value;
      const desmobilizacao = document.getElementById('desmobilizacao').checked;
      let mensagem = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n`;
      mensagem += `*Ocorrência: ${occorrence}, _${local}, ${localidade}._*\n`;
      mensagem += `*\\\\POSIT: ${horaPosit},* _${positText}_`;
      if (desmobilizacao) mensagem += ` _*Desmobilização dos Meios Integrantes.*_`;
      try {
        if (status === "Encerrada") {
          const resp = await fetch(``${SUPABASE_URL}rest/v1/occurrences_control?id=eq.${currentPositId}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          });
          if (!resp.ok) throw new Error(`Erro ao apagar ocorrência: ${resp.status}`);
        } else if (status !== document.getElementById('posit-status').defaultValue) {
          const resp = await fetch(``${SUPABASE_URL}rest/v1/occurrences_control?id=eq.${currentPositId}`, {
            method: "PATCH",
            headers: getSupabaseHeaders({
              returnRepresentation: true
            }),
            body: JSON.stringify({
              status
            })
          });
          if (!resp.ok) throw new Error(`Erro ao atualizar ocorrência: ${resp.status}`);
        }
        navigator.clipboard.writeText(mensagem).then(() => {
          if (typeof showPopupSuccess === 'function') {}
          showPopupSuccess("POSIT criado com sucesso, entre no WhatsApp e cole no grupo interno Ocorrências!");
          setTimeout(() => closePositPopup(), 500);
        }).catch(err => {
          console.error("Erro ao copiar POSIT:", err);
        });
      } catch (err) {
        console.error("Erro POSIT:", err);
        showPopupWarning("Erro ao enviar POSIT!");
      }
    };
    document.addEventListener('DOMContentLoaded', () => {
      const btnActive = document.querySelector('button[data-page="page-active_occurrences"]');
      if (btnActive) {
        btnActive.addEventListener('click', () => {
          loadActiveOccurrences();
        });
      }
    });
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('popup-posit-modal').style.display = 'none';
      loadActiveOccurrences();
    });
    
    async function refreshOccurrencesAndBlinker() {
      await loadActiveOccurrences();
      await occurrencesBlinker.update();
    }
    refreshOccurrencesAndBlinker();
    setInterval(refreshOccurrencesAndBlinker, 8000);