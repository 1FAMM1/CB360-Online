    /* =======================================
    WSMS 360
    ======================================= */    
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
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "";
      const tbody = document.getElementById('active-occurrences-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/occurrences_control?select=*,vehicles&corp_oper_nr=eq.${currentCorpOperNr}&status=in.(Em Curso,Em Resolução,Em Conclusão)`, {
            headers: getSupabaseHeaders()
          }
        );
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
    let originalPositStatus = null;
    /* ======= OPEN POPUP WITH THE EVENT ======= */
    function openPositPopup(occurrence) {
      currentPositId = occurrence.id;
      originalPositStatus = occurrence.status;
      document.getElementById('posit-description').value = occurrence.occorrence || '';
      document.getElementById('posit-local').value = occurrence.local || '';
      document.getElementById('posit-localidade-hidden').value = occurrence.localitie || '';
      document.getElementById('posit-status').value = occurrence.status || '';
      document.getElementById('posit-text').value = '';
      document.getElementById('posit-time').value = '';
      document.getElementById('desmobilizacao').checked = false;
      document.getElementById('popup-posit-modal').style.display = 'flex';
    }
    /* ============== CLOSE POPUP ============== */    
    function closePositPopup() {
      document.getElementById('popup-posit-modal').style.display = 'none';
      loadActiveOccurrences();
    }
    /* ========= TIME FIELD VALIDATION ========= */    
    const positTimeInput = document.getElementById('posit-time');
    positTimeInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 4) val = val.slice(0, 4);
      const hours = val.slice(0, 2);
      const minutes = val.slice(2, 4);
      if ((hours.length === 2 && Number(hours) > 23) ||
          (minutes.length === 2 && Number(minutes) > 59)) {
        e.target.value = "";
        return;
      }
      e.target.value = minutes ? `${hours}:${minutes}` : hours;
    });
    /* ============== SEND POSIT =============== */
    document.getElementById('posit-send-btn').onclick = async function () {
      if (!currentPositId) {
        showPopup('popup-danger', "Nenhuma ocorrência selecionada.");
        return;
      }
      const occorrence = document.getElementById('posit-description').value;
      const local = document.getElementById('posit-local').value;
      const localidade = document.getElementById('posit-localidade-hidden').value;
      const status = document.getElementById('posit-status').value;
      const horaPosit = document.getElementById('posit-time').value.trim();
      const positText = document.getElementById('posit-text').value.trim();
      const desmobilizacao = document.getElementById('desmobilizacao').checked;
      /* ============== VALIDATIONS ============== */
      if (!horaPosit || horaPosit.length < 5) {
        showPopup('popup-danger', "Indique a hora do POSIT (HH:MM).");
        return;
      }
      if (!positText) {
        showPopup('popup-danger', "Indique o texto do POSIT.");
        return;
      }
      /* ======== GENERATE POSIT MESSAGE ========= */
      let mensagem = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n`;
      mensagem += `*Ocorrência: ${occorrence}, _${local}, ${localidade}._*\n`;
      mensagem += `*\\\\POSIT: ${horaPosit},* _${positText}_`;
      if (desmobilizacao) mensagem += ` _*Desmobilização dos Meios Integrantes.*_`;
      try {
        /* ========== IF CLOSED → DELETE =========== */
        if (status === "Encerrada") {
          const del = await fetch(
            `${SUPABASE_URL}/rest/v1/occurrences_control?id=eq.${currentPositId}`, {
              method: "DELETE", headers: getSupabaseHeaders()
            }
          );
          if (!del.ok) throw new Error("Erro ao apagar ocorrência.");
        }        
        /* ==== IF STATUS HAS CHANGED → UPDATE ===== */
        else if (status !== originalPositStatus) {
          const upd = await fetch(
            `${SUPABASE_URL}/rest/v1/occurrences_control?id=eq.${currentPositId}`, {
              method: "PATCH",
              headers: getSupabaseHeaders({ returnRepresentation: true }),
              body: JSON.stringify({ status })
            }
          );
          if (!upd.ok) throw new Error("Erro ao atualizar status.");
        }
        /* ============= COPY MESSAGE ============== */
        await navigator.clipboard.writeText(mensagem);
        showPopup('popup-success', "POSIT criado e copiado! Pode colar no WhatsApp.", true);
        setTimeout(closePositPopup, 500);
      } catch (err) {
        console.error("Erro no POSIT:", err);
        showPopup('popup-danger', "Erro ao criar POSIT!");
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
    setInterval(refreshOccurrencesAndBlinker, 10000);
    /* =======================================
    GROUP INSERT OCCURRENCES
    ======================================= */
    /* ========== DYNAMIC FIELDS TOOGLE ========== */
    function toggleAlertTypeFields() {
      const alertType = document.getElementById('alert_type')?.value;
      const ppiType = document.getElementById('ppi_type')?.value;
      const ppiTypeField = document.getElementById('ppi_type');
      const alertLevel = document.getElementById('alert_level');
      const alarmGrid = document.getElementById('alarm_grid');
      const kmField = document.getElementById('km');
      const kmLabel = document.querySelector('label[for="km"]');
      const onGoing = document.getElementById('on_going');
      const incidentType = document.getElementById('incident_type');
      const blockFields = [ppiTypeField, alertLevel, alarmGrid, kmField, onGoing, incidentType];
      if (alertType !== 'Plano Prévio de Intervenção') {
        blockFields.forEach(field => {
          if (!field) return;
          field.value = '';
          field.disabled = true;
          if (field.tagName === 'SELECT' && field !== ppiTypeField) {
            field.innerHTML = '<option value=""></option>';
          }
        });
        if (ppiTypeField) {
          ppiTypeField.disabled = true;
          ppiTypeField.value = '';
        }
        if (kmLabel) kmLabel.textContent = "Km:";
        return;
      }
      blockFields.forEach(field => {
        if (field) field.disabled = false;
      });
      if (ppiType === 'PPI Aeroporto Gago Coutinho') {
        ['km', 'on_going', 'incident_type'].forEach(id => {
          const f = document.getElementById(id);
          if (f) f.disabled = true;
        });
      }
      if (kmLabel || kmField) {
        let label = kmLabel || kmField?.previousElementSibling;
        if (label) {
          if (ppiType === 'PPI Via do Infante - A22') {
            label.textContent = "Km:";
          } else if (ppiType === 'PPI Linha Férrea do Algarve') {
            label.textContent = "Pkm:";
          } else {
            label.textContent = "Km:";
          }
        }
      }
      if (alertLevel) {
        alertLevel.innerHTML = '<option value=""></option>';
        let options = [];
        if (ppiType === 'PPI Aeroporto Gago Coutinho') {
          options = ['AMARELO', 'VERMELHO'];
        } else if (ppiType) {
          options = ['1º ALARME', '2º ALARME', 'ALARME ESPECIAL'];
        }
        options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          alertLevel.appendChild(o);
        });
      }
      if (alarmGrid) {
        alarmGrid.innerHTML = '<option value=""></option>';
        let gridOptions = [];
        if (ppiType === 'PPI Aeroporto Gago Coutinho') {
          gridOptions = ['A1', 'A2', 'A3', 'A4', 'B1'];
        } else if (ppiType === 'PPI Via do Infante - A22') {
          const letters = 'ABCDEFGHIJKLMNOPQRST';
          letters.split('').forEach(l => {
            gridOptions.push(`1${l}`);
            gridOptions.push(`2${l}`);
          });
        } else if (ppiType === 'PPI Linha Férrea do Algarve') {
          const letters = 'ABCDEFGHIJKLMNOP';
          gridOptions = letters.split('');
        }
        gridOptions.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          alarmGrid.appendChild(o);
        });
      }
      if (incidentType) {
        incidentType.innerHTML = '<option value=""></option>';
        let incidents = [];
        if (ppiType === 'PPI Via do Infante - A22') {
          incidents = ['Acidente', 'Substâncias Perigosas', 'Incêndio em Transportes'];
        } else if (ppiType === 'PPI Linha Férrea do Algarve') {
          incidents = [
            'Acidente - Abalroamento, Choque e Descarrilamento',
            'Substâncias Perigosas - Produtos Químicos/Produtos Biológicos',
            'Incêndio em Transportes'
          ];
        }
        incidents.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          incidentType.appendChild(o);
        });
      }
      if (onGoing) {
        onGoing.innerHTML = '<option value=""></option>';
        let directions = [];
        if (ppiType === 'PPI Via do Infante - A22') {
          directions = [
            'Faro --- Vila Real de Santo António',
            'Faro --- Portimão'
          ];
        } else if (ppiType === 'PPI Linha Férrea do Algarve') {
          directions = [
            'Tunes --- Lagos',
            'Tunes --- Vila Real de Santo António'
          ];
        }
        directions.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          onGoing.appendChild(o);
        });
      }
    }
    function toggleEMSNrField() {
      const alertSource = document.getElementById('alert_source')?.value;
      const emsGroup = document.getElementById('ems_group');
      if (!emsGroup) return;
      emsGroup.style.display = (alertSource === 'CODU' || alertSource === 'INEM') ? 'flex' : 'none';
    }
    function toggleContactFields() {
      const alertSource = document.getElementById('alert_source')?.value;
      const contactName = document.getElementById('contact_name');
      const contactNr = document.getElementById('contact_nr');
      if (!contactName || !contactNr) return;
      if (alertSource === 'Popular' || alertSource === 'Particular') {
        contactName.disabled = false;
        contactNr.disabled = false;
      } else {
        contactName.disabled = true;
        contactNr.disabled = true;
        contactName.value = '';
        contactNr.value = '';
      }
    }
    function toggleAnimalTypeField() {
      const clsOcorr = document.getElementById('class_occorr_input')?.value;
      const animalType = document.getElementById('animal-type');
      if (!animalType) return;
      if (clsOcorr === '4331' || clsOcorr === '4333') {
        animalType.disabled = false;
      } else {
        animalType.disabled = true;
        animalType.value = '';
      }
    }
    document.addEventListener('DOMContentLoaded', () => {
      toggleAlertTypeFields();
      document.getElementById('alert_type')?.addEventListener('change', toggleAlertTypeFields);
      document.getElementById('ppi_type')?.addEventListener('change', toggleAlertTypeFields);
      const alertSourceSelect = document.getElementById('alert_source');
      if (alertSourceSelect) {
        toggleEMSNrField();
        toggleContactFields();
        alertSourceSelect.addEventListener('change', () => {
          toggleEMSNrField();
          toggleContactFields();
        });
      }
      toggleAnimalTypeField();
      document.getElementById('class_occorr_input')?.addEventListener('change', toggleAnimalTypeField);
    });
    function getAlertTime() {
      const t = document.getElementById('alert_time')?.value;
      return t || '';
    }       
    function validateRequiredFields() {
      const missingFields = [];
      const alertType = document.getElementById('alert_type')?.value;
      const alertSource = document.getElementById('alert_source')?.value;
      if (!alertType) missingFields.push("Tipo de Alerta");
      if (!alertSource) missingFields.push("Fonte do Alerta");
      const emsGroup = document.getElementById('ems_group');
      const emsNr = document.getElementById('ems_nr');
      if (emsGroup && emsGroup.style.display !== 'none' && !emsNr.value.trim()) {
        missingFields.push("Nr. CODU");
      }
      const classOccorr = document.getElementById('class_occorr_input')?.value;
      if (!document.getElementById('alert_time')?.value) missingFields.push("Hora do Alerta");
      if (!classOccorr) missingFields.push("Classificação da Ocorrência");
      if (!document.getElementById('occorr_local_input')?.value) missingFields.push("Local da Ocorrência");
      if (!document.getElementById('occorr_localitie_input')?.value) missingFields.push("Localidade da Ocorrência");
      if (alertSource === 'Popular') {
        if (!document.getElementById('contact_name')?.value.trim()) missingFields.push("Nome do Contactante");
        if (!document.getElementById('contact_nr')?.value.trim()) missingFields.push("Contacto do Contactante");
      }
      if (classOccorr === '4331' || classOccorr === '4333') {
        if (!document.getElementById('animal-type')?.value.trim()) missingFields.push("Tipo de Animal");
      }
      const hasVehicle = Array.from(document.querySelectorAll('.wsms-vehicle-card select'))
      .some(sel => sel.value.trim() !== '');
      if (!hasVehicle) missingFields.push("A ocorrência deve conter pelo menos 1 Veículo");
      if (missingFields.length > 0) {
        const list = missingFields.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
        return false;
      }
      return true;
    }
    /* ========== CREATION OF NEW CREPC INCIDENT MESSAGE ========== */
    function generateNewCREPCMessage() {
      if (!validateRequiredFields()) return '';
      const alertSource = document.getElementById('alert_source')?.value || '';
      const alertDate = document.getElementById('alert_date')?.value || '';
      const alertTime = document.getElementById('alert_time')?.value || '';
      const classOccorr = document.getElementById('class_occorr_input')?.value || '';
      const localOccorr = document.getElementById('occorr_local_input')?.value || '';
      const districtSelect = document.getElementById('district_select');
      const localitie = districtSelect ? districtSelect.options[districtSelect.selectedIndex].text : '';
      const councilSelect = document.getElementById('council_select');
      const council = councilSelect ? councilSelect.options[councilSelect.selectedIndex]?.text || '' : '';
      const parishSelect = document.getElementById('parish_select');
      const parish = parishSelect ? parishSelect.options[parishSelect.selectedIndex]?.text || '' : '';
      const nrOccurrence = document.getElementById('nr_occurrence_input')?.value?.trim() || '';
      const gdhAlerta = formatWSMSGDH(alertDate, alertTime);
      const emsNr = document.getElementById('ems_nr')?.value?.trim() || '';
      let emsInfo = '';
      if (emsNr) {
        emsInfo = `*Nr. CODU:* ${emsNr}\n`;
      }
      const vehicles = [];
      document.querySelectorAll('.wsms-vehicle-card').forEach(card => {
        const vehicle = card.querySelector('select')?.value?.trim() || '';
        const bbs = card.querySelector('input[type="text"]')?.value?.trim() || '';
        const vDate = card.querySelector('input[type="date"]')?.value || '';
        const vTime = card.querySelector('input[type="time"]')?.value || '';
        const gdhVehicle = formatWSMSGDH(vDate, vTime);
        if (vehicle) {
          vehicles.push(`*GDH Sd Und:* ${vehicle} | ${gdhVehicle} | ${bbs ? bbs + ' BBs.' : ''}`);
        }
      });
      let contacInfo = '';
      const alertSourceTrimmed = alertSource.trim();
      if (alertSourceTrimmed === 'Popular' || alertSourceTrimmed === 'Particular') {
        const contactName = document.getElementById('contact_name')?.value?.trim() || '';
        const contacNr = document.getElementById('contact_nr')?.value?.trim() || '';
        contacInfo = `*CONTACTANTE:* ${contactName} - ${contacNr}.\n\n`;
      }
      let animalInfo = '';
      const animalType = document.getElementById('animal-type')?.value?.trim() || '';
      if (animalType) {
        animalInfo = `*Ser Vivo Não-Humano:* ${animalType}\n\n`;
      }
      let message = '';
      if (nrOccurrence) {
        message =
          `*🔗 Agregar à Ocorrência*\n\n` +
          `*FONTE ALERTA:* ${alertSource}\n` +
          `*N. OC:* ${nrOccurrence}\n` +
          `*GDH ALERTA:* ${gdhAlerta}\n` +
          `*CLASS OC:* ${classOccorr}\n` +
          `*LOCAL:* ${localOccorr} - ${localitie} - ${council} - ${parish}\n` +
          `${vehicles.join('\n')}`;
      } else {
        message =
          `*📋 Registo de Nova Ocorrência*\n\n` +
          `*FONTE ALERTA:* ${alertSource}\n` +
          emsInfo +
          `*GDH ALERTA:* ${gdhAlerta}\n` +
          `*CLASS OCORR.:* ${classOccorr}\n` +
          `*LOCAL:* ${localOccorr} - ${localitie} - ${council} - ${parish}\n` +
          `${vehicles.join('\n')}\n\n` +
          `${contacInfo}` +
          `${animalInfo}` +
          `*Agradeço N. OC:*`;
      }
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.", true);
      return message;
    }
    /* ========== CREATION OF NEW GLOBAL EVENT MESSAGE ========== */
    async function generateWSMSMessage() {
      if (!validateRequiredFields()) return '';
      await new Promise(resolve => {
        const interval = setInterval(() => {
          const allFieldsReady =
            document.getElementById('alert_type') &&
            document.getElementById('alert_source') &&
            document.getElementById('alert_level') &&
            document.getElementById('ppi_type') &&
            document.getElementById('km') &&
            document.getElementById('on_going') &&
            document.getElementById('incident_type');
          if (allFieldsReady) {
            clearInterval(interval);
            resolve(true);
          }
        }, 50);
      });
      const alertType = document.getElementById('alert_type')?.value || '';
      const alertSource = document.getElementById('alert_source')?.value || '';
      const alertTime = getAlertTime();
      const descrOccorr = document.getElementById('occorr_descr_input')?.value || '';
      const localOccorr = document.getElementById('occorr_local_input')?.value || '';
      const localitie = document.getElementById('occorr_localitie_input')?.value || '';
      const ppiType = document.getElementById('ppi_type')?.value || '';
      const alertLevel = document.getElementById('alert_level')?.value || '';
      const ppiGrid = document.getElementById('alarm_grid')?.value || '';
      const ppiKm = document.getElementById('km')?.value || '';
      const ppiDirection = document.getElementById('on_going')?.value || '';
      const ppiIncident = document.getElementById('incident_type')?.value || '';
      const channelManeuver = document.getElementById('channel_maneuver')?.value?.trim() || '';
      const vehicles = [];
      document.querySelectorAll('.wsms-vehicle-card').forEach(card => {
        const vehicle = card.querySelector('select')?.value?.trim() || '';
        const bbs = card.querySelector('input[type="text"]')?.value?.trim() || '';
        if (vehicle) vehicles.push(bbs ? `${vehicle}|${bbs} BBs.` : vehicle);
      });
      try {
        const saveResult = await saveOccurrenceToSupabase({
            descrOccorr,
            localOccorr,
            localitie
          },
          vehicles.length
        );
        if (saveResult === "DUPLICATE") {
          return '';
        }
      } catch (e) {
        console.warn("Erro ao gravar no Supabase:", e);
        showPopup('popup-danger', "Erro ao gravar no Supabase, mas a mensagem será criada.");
      }
      let message = '';
      const vehicleText = vehicles.length ? `Saída de ${vehicles.join(', ')}` : '';
      const vehicleSufix = vehicleText ? `, ${vehicleText}` : '';
      if (alertType === 'Ocorrência') {
        message = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*\\\\${alertSource}, HI: ${alertTime}, Ativação para ${descrOccorr} em Faro\\${localitie}\\${localOccorr}${vehicleSufix}* `;
      } else if (alertType === 'Plano Prévio de Intervenção') {
        if (ppiType === 'PPI Aeroporto Gago Coutinho') {
          if (alertLevel.toUpperCase() === 'AMARELO') {
            message = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*\\\\${alertSource}, HI: ${alertTime}, Ativação do ${ppiType} de nível ${alertLevel.toUpperCase()}, para a Grelha ${ppiGrid}, PREVENÇÃO LOCAL.*`;
          } else if (alertLevel.toUpperCase() === 'VERMELHO') {
            const zoneLRT = "37.020046,-7.973326";
            const zoneZCR = "37.019382,-7.977624";
            const vehiclesLRT = "VCOT, ABSC - Devem Posicionar-se na LRT";
            const vehiclesZCR = "VCI, VTT - Devem Posicionar-se na ZCR";
            message = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*\\\\${alertSource}, HI: ${alertTime}, Ativação do ${ppiType} de nível VERMELHO, para a Grelha ${ppiGrid}, MOBILIZAÇÃO TOTAL DO CB.*\n\n*Veículos: ${vehiclesLRT}*\n*Veículos: ${vehiclesZCR}*\n\n*LOCALIZAÇÃO LRT:* (https://www.google.com/maps?q=${zoneLRT})\n*LOCALIZAÇÃO ZCR:* (https://www.google.com/maps?q=${zoneZCR})`;
          }
        } else {
          message = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*\\\\${alertSource}, HI: ${alertTime}, Ativação do ${alertLevel} para o ${ppiType}, para a Grelha ${ppiGrid}, ao km: ${ppiKm}, no sentido ${ppiDirection} para ${ppiIncident}*`;
        }
      }
      if (channelManeuver) message += `\n*Canal Manobra:* ${channelManeuver}`;
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.", false);
      loadActiveOccurrences();
      return message;
    }    
    /* ========== RECORDING INCIDENTS IN DATABASE ========== */
    async function safeJson(resp) {
      try {
        return await resp.json();
      } catch {
        return null;
      }
    }    
    async function saveOccurrenceToSupabase(data, vehiclesCount) {
      try {
        const alertDate = document.getElementById('alert_date')?.value || '';
        const alertTime = document.getElementById('alert_time')?.value || '';
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
        if (!alertDate || !alertTime || !currentCorpOperNr) {
          console.error("Dados em falta: Data, Hora ou Corp ID");
          return null;
        }
        const startDateTime = new Date(`${alertDate}T${alertTime}`);
        const formattedDate =
              `${String(startDateTime.getDate()).padStart(2,'0')}/${String(startDateTime.getMonth()+1).padStart(2,'0')}/${startDateTime.getFullYear()} ` +
              `${String(startDateTime.getHours()).padStart(2,'0')}:${String(startDateTime.getMinutes()).padStart(2,'0')}`;
        let totalElements = 0;
        document.querySelectorAll('.wsms-vehicle-card').forEach(card => {
          const bbs = parseInt(card.querySelector('input[type="text"]')?.value || '0', 10);
          if (!isNaN(bbs)) totalElements += bbs;
        });
        const query = `occorrence=eq.${encodeURIComponent(data.descrOccorr)}&local=eq.${encodeURIComponent(data.localOccorr)}&start_date=eq.${encodeURIComponent(formattedDate)}`;
        const checkResp = await fetch(
          `${SUPABASE_URL}/rest/v1/occurrences_control?${query}`, {
            headers: getSupabaseHeaders()
          }
        );
        const existing = await safeJson(checkResp);
        if (existing && existing.length > 0) {
          const existingOccurrence = existing[0];
          const existingVehicles = Number(existingOccurrence.vehicles || 0);
          const existingElements = Number(existingOccurrence.elements || 0);
          if (existingVehicles === vehiclesCount && existingElements === totalElements) {
            showPopup('popup-danger', "Já existe uma ocorrência idêntica registada.");
            return "DUPLICATE";
          } else {
            const updateResp = await fetch(
              `${SUPABASE_URL}/rest/v1/occurrences_control?id=eq.${existingOccurrence.id}`, {
                method: 'PATCH',
                headers: getSupabaseHeaders({ returnRepresentation: true }),
                body: JSON.stringify({
                  vehicles: vehiclesCount,
                  elements: totalElements
                })
              }
            );
            return await safeJson(updateResp);
          }
        }
        const insertResp = await fetch(
          `${SUPABASE_URL}/rest/v1/occurrences_control`, {
            method: 'POST',
            headers: getSupabaseHeaders({returnRepresentation: true}),
            body: JSON.stringify({start_date: formattedDate, occorrence: data.descrOccorr, local: data.localOccorr, localitie: data.localitie, vehicles: vehiclesCount, elements: totalElements,
                                  status: "Em Curso", corp_oper_nr: currentCorpOperNr})
          });
        return await safeJson(insertResp);
      } catch (e) {
        console.error("Erro ao gravar ocorrência:", e);
        showPopup('popup-danger', "❌ Erro ao comunicar com a base de dados.");
        return null;
      }
    }
    document.addEventListener('DOMContentLoaded', async () => {
      document.querySelectorAll('input[type="date"]').forEach(i => i.value = getCurrentDateStr());
      document.querySelectorAll('input[type="time"]').forEach(i => i.value = '');
      await populateCouncilSelectByDistrict();
      await populateIndependentVehicleSelect();
      toggleEMSNrField();
      toggleContactFields();
      document.getElementById('alert_source')?.addEventListener('change', () => {
        toggleEMSNrField();
        toggleContactFields();
      });
    });
    /* =======================================
    CLOSING GROUP INCIDENTS
    ======================================= */
    /* ========== CONVERSION FROM MT² TO Ha ========== */
    function updateHectares() {
      const m2Input = document.getElementById('area_m2');
      const haInput = document.getElementById('area_ha');
      const m2 = parseFloat(m2Input.value) || 0;
      const ha = m2 / 10000;
      haInput.value = ha.toFixed(2);
    }
    /* ========== CREATION OF INCIDENT CLOSING MESSAGE CREPC ========== */
    function generateCloseCREPCMessage() {
      const nrOccurrence = document.getElementById('close_nr_occurrence')?.value?.trim();
      if (!nrOccurrence) {
        showPopup('popup-danger', "Por favor, preencha o Nr. de Ocorrência para poder encerrar a ocorrência.");
        return;
      }
      const sections = [];
      sections.push(`*⛔ Encerramento de Ocorrência*`);
      sections.push(`*N. OC:* ${nrOccurrence}`);

      /* ---- VEÍCULOS ---- */
      const vehicleBlocks = [];
      document.querySelectorAll('#vehicles-container .wsms-card-mini').forEach(card => {
        const vehicle = card.querySelector('select')?.value?.trim();
        if (!vehicle) return;
        const dates = card.querySelectorAll('input[type="date"]');
        const times = card.querySelectorAll('input[type="time"]');
        const texts = card.querySelectorAll('input[type="text"]');
        const chTODate = dates[0]?.value;
        const chTOTime = times[0]?.value;
        const sdTODate = dates[1]?.value;
        const sdTOTime = times[1]?.value;
        const chUndDate = dates[2]?.value;
        const chUndTime = times[2]?.value;
        const kms = texts[0]?.value?.trim() || '';
        const timePumpH = texts[1]?.value?.trim();
        const timePumpM = texts[2]?.value?.trim();
        const lines = [];
        if (chTODate || chTOTime) lines.push(`*GDH Ch TO:* ${vehicle} | ${formatWSMSGDH(chTODate, chTOTime)}`);
        if (sdTODate || sdTOTime) lines.push(`*GDH Sd TO:* ${vehicle} | ${formatWSMSGDH(sdTODate, sdTOTime)}`);
        if (chUndDate || chUndTime || kms) {
          let line = `*GDH Ch Und:* ${vehicle} | ${formatWSMSGDH(chUndDate, chUndTime)}`;
          if (kms) line += ` | ${kms} Kms`;
          lines.push(line);
        }
        if (timePumpH || timePumpM) {
          lines.push(`*TEMPO BOMBA:* ${timePumpH || '00'} Hrs. ${timePumpM || '00'} Mins.`);
        }
        if (lines.length) vehicleBlocks.push(lines.join('\n'));
      });
      if (vehicleBlocks.length) sections.push(vehicleBlocks.join('\n\n'));

      /* ---- VÍTIMAS ---- */
      const victimLines = [];
      document.querySelectorAll('#victims-container .wsms-card-mini').forEach((card, idx) => {
        const i = idx + 1;
        const gender = document.getElementById(`victim_${i}_gender`)?.value?.trim();
        const age = document.getElementById(`victim_${i}_age`)?.value?.trim();
        const ageUnit = document.getElementById(`victim_${i}_age_unit`)?.value?.trim();
        const nation = document.getElementById(`victim_${i}_nation`)?.value?.trim();
        const type = document.getElementById(`victim_${i}_type`)?.value?.trim();
        const status = document.getElementById(`victim_${i}_status`)?.value?.trim();
        if (gender || age || nation || type || status) {
          const parts = [];
          if (gender) parts.push(gender);
          if (ageUnit || age) parts.push(`${ageUnit || ''} ${age || ''}`.trim());
          if (nation) parts.push(`Nacion: ${nation}`);
          if (type) parts.push(type);
          if (status) parts.push(status);
          victimLines.push(parts.join(' | '));
        }
      });
      if (victimLines.length) sections.push(`*VÍTIMA(s):*\n${victimLines.join('\n')}`);
      /* ---- OUTROS MEIOS ---- */
      const extrasLines = [];
      document.querySelectorAll('#extras-container .wsms-card-mini').forEach(card => {
        const inputs = card.querySelectorAll('input[type="text"]');
        const meio  = inputs[0]?.value?.trim();
        const veics = inputs[1]?.value?.trim();
        const elems = inputs[2]?.value?.trim();
        if (meio || veics || elems) {
          const parts = [];
          if (meio)  parts.push(meio);
          if (veics) parts.push(`Veícs.: ${veics}`);
          if (elems) parts.push(`Elems.: ${elems}`);
          extrasLines.push(parts.join(' | '));
        }
      });
      if (extrasLines.length) sections.push(`*OUTROS MEIOS NO TO:*\n${extrasLines.join('\n')}`);
      /* ---- DANOS ---- */
      const damageLines = [];
      document.querySelectorAll('#damages-container .wsms-card-mini').forEach(card => {
        const input = card.querySelector('input[type="text"]');
        const dano = input?.value?.trim();
        if (dano) damageLines.push(dano);
      });
      if (damageLines.length) sections.push(`*DANOS:*\n${damageLines.join('\n')}`);
      /* ---- ÁREA ARDIDA ---- */
      const areaM2 = document.querySelector('.wsms-burned-card #area_m2')?.value?.trim();
      const areaHa = document.querySelector('.wsms-burned-card #area_ha')?.value?.trim();
      if (areaM2 || areaHa) {
        const parts = [];
        if (areaM2) parts.push(`${areaM2} m²`);
        if (areaHa) parts.push(`${areaHa} ha`);
        sections.push(`*ÁREA ARDIDA:*\n${parts.join(' | ')}`);
      }
      /* ---- OBSERVAÇÕES ---- */
      const observations = document.querySelector('.wsms-observ-card textarea')?.value?.trim();
      if (observations) sections.push(`*OBSERVAÇÕES:*\n${observations}`);
      const message = sections.join('\n\n');
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.", true);
      return message;
    }
    function toggleClsOcorrSection(sectionClass, btn) {
      const el = document.querySelector(`.${sectionClass}`);
      if (!el) return;
      const isHidden = el.classList.toggle('hidden');
      btn.classList.toggle('active', !isHidden);
    }
    /* =======================================
    GROUP REQUESTS
    ======================================= */
    /* ============== FIELD VALIDATION ============== */
    function validateAvailabilityForm() {
      const fields = [{id: 'solicitation_type', label: 'Tipo de Solicitação'}, {id: 'solicitation_motive', label: 'Motivo'}, {id: 'solicitation_shift', label: 'Turno'},
                      {id: 'exit_hour', label: 'Hora de Saída'}, {id: 'uls_desteny', label: 'Destino'}, {id: 'drivers', label: 'Motoristas'}, {id: 'elements', label: 'Elementos'}];
      const typeSelect = document.getElementById('solicitation_type')?.value;
      const missing = [];
      fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        if (f.id === 'solicitation_motive' || f.id === 'solicitation_shift' || f.id === 'exit_hour' || f.id === 'uls_desteny') {
          if (!typeSelect) return;
          if (typeSelect === 'Transporte de Doentes' && f.id === 'uls_desteny' && !el.value.trim()) missing.push(f.label);
          if (typeSelect === 'Transporte de Doentes' && f.id === 'exit_hour' && !el.value.trim()) missing.push(f.label);
          if (typeSelect !== 'Transporte de Doentes' && f.id === 'solicitation_motive' && !el.value.trim()) missing.push(f.label);
          if (typeSelect !== 'Transporte de Doentes' && f.id === 'solicitation_shift' && !el.value.trim()) missing.push(f.label);
          return;
        }
        if (!el.value?.trim()) missing.push(f.label);
      });
      if (missing.length > 0) {
        const list = missing.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
        return false;
      }
      return true;
    }
    /* ============== GENERATE MESSAGE ============== */
    function generateAvailability() {
      if (!validateAvailabilityForm()) return;
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };
      const dateService = document.getElementById('solicitation_date')?.value?.trim();
      const typeRequest = document.getElementById('solicitation_type')?.value?.trim();
      const motiveRequest = document.getElementById('solicitation_motive')?.value?.trim();
      const shift = document.getElementById('solicitation_shift')?.value?.trim();
      const drivers = document.getElementById('drivers')?.value?.trim();
      const elements = document.getElementById('elements')?.value?.trim();
      const hourOut = document.getElementById('exit_hour')?.value;
      const destination = document.getElementById('uls_desteny')?.value?.trim() || '';
      let message = '*🚨🚨INFORMAÇÃO🚨🚨*\n\n';
      let parts = [];
      if (drivers || elements) {
        let meioText = 'Solicita-se ';
        if (drivers) meioText += `${drivers} Motorista(s)`;
        if (drivers && elements) meioText += ' e ';
        if (elements) meioText += `${elements} Elemento(s)`;
        if (typeRequest === 'INEM') meioText += ' TAS';
        if (typeRequest === 'Reforço Piquete') meioText += ' Preferencialmente TAS';
        parts.push(meioText);
      }
      if (typeRequest) {
        let tipoText = `para efetuar serviço de ${typeRequest}`;
        if (typeRequest === 'Transporte de Doentes') {
          tipoText += ` para ${destination}`;
          if (dateService) tipoText += ` no dia ${formatDate(dateService)}`;
          tipoText += `, com saída da unidade pelas ${hourOut || '10:10'}`;
        } else {
          if (dateService) tipoText += ` no dia ${formatDate(dateService)}`;
          if (shift) tipoText += ` no turno ${shift}`;
        }
        parts.push(tipoText);
      }
      if (typeRequest === 'Reforço Piquete' && motiveRequest === 'Grelha Município') {
        parts.push(`afim de assegurar a ${motiveRequest}`);
      }
      message += parts.join(' ') + '. ';
      const destinatario = (typeRequest === 'DECIR' || typeRequest === 'DIOPS') ? 'ao Sr. Adjunto de Comando' : 'à SALOC';
      message += `As disponibilidades deverão ser remetidas ${destinatario}, com a maior brevidade possível. Obrigado!`;
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).catch(() => {});
      }
      showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.", true);
      ['solicitation_motive','solicitation_shift','exit_hour','uls_desteny'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });
      return message;
    }
    /* ============== TOGGLE FIELDS BASED ON TYPE ============== */
    function toggleFields() {
      const typeSelect = document.getElementById('solicitation_type');
      const motiveSelect = document.getElementById('solicitation_motive');
      const shiftSelect = document.getElementById('solicitation_shift');
      const hourOutInput = document.getElementById('exit_hour');
      const destinationInput = document.getElementById('uls_desteny');
      [motiveSelect, shiftSelect, hourOutInput, destinationInput].forEach(el => {
        if (el) el.disabled = true;
      });
      if (!typeSelect || !typeSelect.value) return;
      if (typeSelect.value === 'Transporte de Doentes') {
        if (hourOutInput) hourOutInput.disabled = false;
        if (destinationInput) destinationInput.disabled = false;
      } else {
        if (motiveSelect) motiveSelect.disabled = false;
        if (shiftSelect) shiftSelect.disabled = false;
        if (hourOutInput) hourOutInput.value = '';
        if (destinationInput) destinationInput.value = '';
      }
    }
    /* ============== INIT ============== */
    document.addEventListener('DOMContentLoaded', () => {
      ['solicitation_motive','solicitation_shift','exit_hour','uls_desteny'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });
      toggleFields();
      document.getElementById('solicitation_type')?.addEventListener('change', toggleFields);
    });
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
      const originalVehicle = document.getElementById('new_vehicle_unavailable')?.value || '';
      const startDate = document.getElementById('new_unavailability_date')?.value || '';
      const startHour = document.getElementById('new_unavailability_hour')?.value || '';
      const motive = document.getElementById('new_reason_unavailability')?.value || '';
      const local = document.getElementById('new_unavailability_local')?.value || '';
      let displayVehicle = originalVehicle;
      if (originalVehicle === 'ABSC-02') displayVehicle = 'INEM-Reserva';
      else if (originalVehicle === 'ABSC-01' || originalVehicle === 'ABSC-03') displayVehicle = 'INEM';
      const gdh = formatWSMSGDH(startDate, startHour);
      const currentData = {vehicle: originalVehicle, startDate, startHour, motive, local};
      lastUnavailabilityData = currentData;
      let message = '';
      if (motive === "Pausa para Alimentação") {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${displayVehicle}:*\n${motive}, ${local}, ${gdh}`;
      } else if (["Falta de Macas", "Aguarda Triagem"].includes(motive)) {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${displayVehicle}:*\nRetido(a) por: ${motive}, ${local}, ${gdh}`;
      } else {
        message = `*🚨INFORMAÇÃO🚨*\n\n*${displayVehicle}:*\nInoperacional por: ${motive}, ${local}, ${gdh}.`;
      }
      document.getElementById('wsms_output').value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.", true);
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
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
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
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
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
            </tr>
          `;
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
            </td>
          `;
          tr.querySelector('.finalize-btn').addEventListener('click', () => {
            document.getElementById('end_vehicle_unavailable').value = item.vehicle;
            document.getElementById('end_reason_unavailability').value = item.unavailability_motive;
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('end_unavailability_date').value = hoje;
            document.getElementById('end_unavailability_hour').value = "";
            document.getElementById('availability-card').style.display = 'block';
            document.getElementById('end_unavailability_hour').focus();
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
    /* ============== GENERATE END OF UNAVAILABILITY MESSAGE (FINAL & BLINDADA) ============== */
     async function generateEndUnavailability() {
      if (!validateVehicleUnavailabilityForm(true)) return '';
      const vehicle = document.getElementById('end_vehicle_unavailable')?.value;
      const motive = document.getElementById('end_reason_unavailability')?.value;
      const endDate = document.getElementById('end_unavailability_date')?.value;
      const endHour = document.getElementById('end_unavailability_hour')?.value;
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
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
        showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.", true);
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
    /* =======================================
    MUNICIPALITY GRID GROUP
    ======================================= */
    /* ============== FIELD VALIDATION ============== */
    function validateMunicipalityGridForm() {
      const state = document.getElementById('state_municipality_grid')?.value?.trim();
      const motiveEl = document.getElementById('municipality_grid_output');
      if (!state) {
        showPopup('popup-danger', 'Por favor, selecione o estado da Grelha do Município.');
        return false;
      }
      if ((state === 'Com Constrangimentos' || state === 'Inoperacional') && (!motiveEl || !motiveEl.value.trim())) {
        showPopup('popup-danger', 'Por favor, indique o motivo do constrangimento ou inoperacionalidade.');
        return false;
      }
      return true;
    }
    /* ========== AUTOMATIC MESSAGE FILLING AND FIELD TOGGLE ========== */
    function autoFillMunicipalityGrid() {
      const state = document.getElementById('state_municipality_grid')?.value?.trim();
      const out = document.getElementById('municipality_grid_output');
      if (!out || !state) return;
      if (state === 'Sem Constrangimentos') {
        out.value = 'Selecionou Sem Constrangimentos, a mensagem foi gerada de forma automática.';
        out.readOnly = true;
      } else {
        out.value = '';
        out.readOnly = false;
      }
    }
    document.getElementById('state_municipality_grid')?.addEventListener('change', autoFillMunicipalityGrid);
    /* ========== CREATION OF MUNICIPALITY GRID STATUS MESSAGE ========== */
    function generateMunicipalityGridMessage() {
      if (!validateMunicipalityGridForm()) return '';
      const state = document.getElementById('state_municipality_grid')?.value?.trim();
      const motive = document.getElementById('municipality_grid_output');
      let message = '';
      if (state === 'Sem Constrangimentos') {
        message = `*🚨INFORMAÇÃO🚨*\n\n*✅ Grelha do Município 100% assegurada sem qualquer constrangimento.*\n_Planeamento será emitido oportunamente._`;
      } else if (state === 'Com Constrangimentos') {
        message = `*🚨INFORMAÇÃO🚨*\n\n*⚠️ Grelha do Município irá encontrar-se com constrangimentos.*\n\n*Motivo: ${motive.value}*\n_Planeamento será emitido oportunamente._`;
      } else if (state === 'Inoperacional') {
        message = `*🚨INFORMAÇÃO🚨*\n\n*❌ Grelha do Município irá ficar Inoperacional.*\n\n*Motivo: ${motive.value}*\n_Planeamento será emitido oportunamente._`;
      }
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).catch(() => {});
      }
      showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.", false);
      return message;
    }
    /* =======================================
    EMS SERVICES
    ======================================= */
    const inem = document.getElementById('alert-inem');
    const reserv = document.getElementById('alert-reserv');
    const optInem = document.getElementById('opt-inem');
    const optReserv = document.getElementById('opt-reserv');
    let selectedInemServiceType = "";
    function openInemTypePopup() {
      const modal = document.getElementById("popup-inem-type-modal");
      if (!modal) return;
      document.querySelectorAll('input[name="popup-inem-type"]').forEach(el => {
        el.checked = false;
      });
      selectedInemServiceType = "";
      modal.classList.add("show");
    }
    function closeInemTypePopup() {
      const modal = document.getElementById("popup-inem-type-modal");
      if (modal) modal.classList.remove("show");
    }
    function setCurrentTimeForINEMService() {
      const input = document.getElementById("alert-service");
      if (!input) return;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      input.value = time;
    }
    function initTasAutoFill() {
      const niInput = document.getElementById("resp-tas-ni");
      const nameInput = document.getElementById("resp-tas-name");
      if (!niInput || !nameInput) {
        setTimeout(initTasAutoFill, 200);
        return;
      }
      niInput.addEventListener("input", async function () {
        const ni = this.value.trim();
        if (ni.length < 3) {
          nameInput.value = "";
          return;
        }
        try {
          const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
          const data = await supabaseFetch(
            `reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=eq.${ni}&select=abv_name&limit=1`
          );
          nameInput.value = data?.[0]?.abv_name || "";
        } catch (err) {
          console.error("Erro ao procurar elemento:", err);
          nameInput.value = "";
        }
      });
    }
    document.addEventListener("DOMContentLoaded", initTasAutoFill);
    function updateTypeSelection() {
      optInem.classList.toggle('active', inem.checked);
      optReserv.classList.toggle('active', reserv.checked);
      const card = inem.closest('.wsms-card');
      if (card) card.classList.toggle('theme-inem', inem.checked);
      const header = card?.querySelector('.wsms-card-header-ems span');
      if (header) {
        header.textContent = reserv.checked
          ? 'SERVIÇOS DE EMERGÊNCIA MÉDICA - RESERVA'  : 'SERVIÇOS DE EMERGÊNCIA MÉDICA';
      }
    }
    inem.addEventListener('change', () => {
      if (inem.checked) {
        reserv.checked = false;
        selectedInemServiceType = "";
        openInemTypePopup();
      }
      updateTypeSelection();
    });
    reserv.addEventListener('change', () => {
      if (reserv.checked) {
        inem.checked = false;
        selectedInemServiceType = "";
        setCurrentTimeForINEMService();
      }
      updateTypeSelection();
    });
    optInem.addEventListener('click', (e) => {
      if (e.target !== inem) {
        inem.checked = !inem.checked;
        inem.dispatchEvent(new Event('change'));
      }
    });
    optReserv.addEventListener('click', (e) => {
      if (e.target !== reserv) {
        reserv.checked = !reserv.checked;
        reserv.dispatchEvent(new Event('change'));
      }
    });
    document.getElementById("popup-inem-type-ok-btn")?.addEventListener("click", () => {
      const selected = document.querySelector('input[name="popup-inem-type"]:checked');
      if (!selected) {
        showPopup('popup-danger', "Selecione o tipo de serviço.");
        return;
      }
      selectedInemServiceType = selected.value;
      closeInemTypePopup();
      setTimeout(() => {
        setCurrentTimeForINEMService();
        document.getElementById("address-service")?.focus();
      }, 100);
    });
    document.getElementById("popup-inem-type-cancel-btn")?.addEventListener("click", () => {
      inem.checked = false;
      updateTypeSelection();
      closeInemTypePopup();
    });
    function validateCODUServiceForm() {
      const fields = [{id: 'alert-inem', label: 'Tipo de Serviço (INEM ou Reserva)', type: 'checkbox-group'}, {id: 'alert-service', label: 'Hora Alerta'}, {id: 'address-service', label: 'Morada'},
                      {id: 'location-service', label: 'Localidade'}, {id: 'victim-gender-service', label: 'Género da Vítima'}, {id: 'victim-age-service', label: 'Idade da Vítima'},
                      {id: 'victim-age-type-service', label: 'Tipo de Idade'}, {id: 'situation-service', label: 'Situação'}, {id: 'nr-codu-service', label: 'Nr. CODU'}, {id: 'resp-tas-name', label: 'Nr. TAS'}];
      const missing = [];
      for (const field of fields) {
        if (field.type === 'checkbox-group') {
          if (!inem.checked && !reserv.checked) {
            missing.push(field.label);
          }
          continue;
        }
        const el = document.getElementById(field.id);
        if (!el?.value?.trim()) missing.push(field.label);
      }
      if (missing.length) {
        const list = missing.map(f => `<li style="list-style:none;">• ${f}</li>`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br><ul style="margin:0;padding:0;">${list}</ul>`);
        return false;
      }
      return true;
    }
    async function generateCODUserviceMessage() {
      if (!validateCODUServiceForm()) return;
      if (inem.checked && !selectedInemServiceType) {
        openInemTypePopup();
        return;
      }
      const hourAlert = document.getElementById('alert-service')?.value || '';
      const address = document.getElementById('address-service')?.value?.trim() || '';
      const locality = document.getElementById('location-service')?.value?.trim() || '';
      const referencePoint = document.getElementById('reference-address-service')?.value?.trim() || '';
      const gender = document.getElementById('victim-gender-service')?.value || '';
      const age = document.getElementById('victim-age-service')?.value?.trim() || '';
      const ageType = document.getElementById('victim-age-type-service')?.value || '';
      const situation = document.getElementById('situation-service')?.value?.trim() || '';
      const nrCODU = document.getElementById('nr-codu-service')?.value?.trim() || '';
      const tasName = document.getElementById('resp-tas-name')?.value?.trim() || '';
      const observations = document.getElementById('observations-service')?.value?.trim() || '';
      const messageTitle = reserv.checked
        ? '*🚨⚠️ SERVIÇO INEM-Reserva ⚠️🚨*' : '*🚨⚠️ SERVIÇO INEM ⚠️🚨*';
      let message = `${messageTitle}\n\n`;
      if (nrCODU) message += `*Nr. CODU:* ${nrCODU}\n`;
      if (hourAlert) message += `*Hora Alerta:* ${hourAlert}\n`;
      if (address || locality) message += `*Local:* ${address}${address && locality ? ' - ' : ''}${locality}\n`;
      if (referencePoint) message += `*Ponto Ref.:* ${referencePoint}\n`;
      if (gender || age) message += `*Vítima:* ${gender}${age ? `, ${age} ${ageType}` : ''}\n`;
      if (situation) message += `*Situação:* ${situation}\n\n`;
      if (observations) message += `*Observações:* ${observations}`;
      const victimTypeMap = {"Masc.": "Masculino", "Fem.": "Feminino", "Desc.": "Desconhecido"};
      const victimType = victimTypeMap[gender] || gender;
      const serviceType = selectedInemServiceType || (inem.checked ? "ITeams" : "Verbete");
      const now = new Date();
      const alertDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      try {
        await navigator.clipboard.writeText(message);
        showPopup('popup-success', "Mensagem criada e copiada!");
        const record = {corp_oper_nr: corpOperNr, nr_codu: nrCODU || null, alert_date: alertDate, alert_hour: hourAlert || null, victim_type: victimType || null, victim_age_type: age || null,
                        victim_age_unit: ageType || null, victim_address: address || null, victim_location: locality || null, service_type: serviceType || null, tas: tasName || null};
        await fetch(`${SUPABASE_URL}/rest/v1/inem_entries`, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
          body: JSON.stringify(record)
        });
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', "Erro ao copiar ou guardar registo.");
      }
      clearFormFields();
      selectedInemServiceType = "";
      document.querySelectorAll('input[name="popup-inem-type"]').forEach(el => el.checked = false);
    }
    /* =======================================
    WEATHER WARNINGS
    ======================================= */
    async function fetchIPMAWarnings() {
      try {
        const response = await fetch("https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json");
        const data = await response.json();
        return data.filter(a => a.idAreaAviso === "FAR" && a.awarenessLevelID !== "green");
      } catch (err) {
        console.error("Erro ao buscar avisos IPMA:", err);
        return [];
      }
    }
    function createIPMAAlertCard(alert) {
      const card = document.createElement("div");    
      const levelClass = { yellow: "ipma-yellow", orange: "ipma-orange", red: "ipma-red" }[alert.awarenessLevelID];
      card.className = `ipma-card ${levelClass}`;    
      card.dataset.startTime = alert.startTime;
      card.dataset.endTime = alert.endTime;
      card.innerHTML = `
        <div>
          <div class="ipma-title">${alert.awarenessTypeName}</div>
          <div>Zona: <b>Algarve (Faro)</b></div>
          <div class="ipma-time"><b>Início:</b> ${new Date(alert.startTime).toLocaleString("pt-PT")}</div>
          <div class="ipma-time"><b>Fim:</b> ${new Date(alert.endTime).toLocaleString("pt-PT")}</div>
          ${alert.text ? `<div style="margin-top:6px">${alert.text}</div>` : ""}
        </div>
      `;
      const btn = document.createElement("button");
      btn.textContent = "Emitir Aviso";
      btn.onclick = () => issueNotice(card);
      card.appendChild(btn);    
      return card;
    }
    async function updateWarnings() {
      const container = document.getElementById("ipma-alerts");
      container.innerHTML = "A carregar avisos...";
      const warnings = await fetchIPMAWarnings();
      container.innerHTML = "";
      if (warnings.length === 0) {
        const card = document.createElement("div");
        card.className = "ipma-card ipma-green";
        card.innerHTML = `
          <div>
            <div class="ipma-title">Sem avisos meteorológicos</div>
            <div>Zona: <b>Algarve (Faro)</b></div>
            <div class="ipma-time">Não existem avisos meteorológicos para o Algarve.</div>
          </div>
        `;
        container.appendChild(card);
        return;
      }
      warnings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      warnings.forEach(alert => container.appendChild(createIPMAAlertCard(alert)));
    }
    setInterval(() => {
      const now = new Date();
      document.querySelectorAll("#ipma-alerts .ipma-card").forEach(card => {
        const endTime = new Date(card.dataset.endTime);
        if (endTime <= now) card.remove();
      });    
      const container = document.getElementById("ipma-alerts");
      if (!container.querySelector(".ipma-card")) {
        const card = document.createElement("div");
        card.className = "ipma-card ipma-green";
        card.innerHTML = `
          <div>
            <div class="ipma-title">Sem avisos meteorológicos</div>
            <div>Zona: <b>Algarve (Faro)</b></div>
            <div class="ipma-time">Não existem avisos meteorológicos para o Algarve.</div>
          </div>
        `;
        container.appendChild(card);
      }
    }, 60 * 1000);
    updateWarnings();
    setInterval(updateWarnings, 10 * 60 * 1000);
    function issueNotice(card) {
      if (!card) return alert("Aviso não encontrado.");
      const tipo = card.querySelector(".ipma-title")?.textContent || "Aviso";
      const startTime = card.dataset.startTime;
      const endTime = card.dataset.endTime;
      const texto = card.querySelector("div > div:nth-child(5)")?.textContent || "";
      let nivel = "";
      if (card.classList.contains("ipma-yellow")) nivel = "AMARELO";
      else if (card.classList.contains("ipma-orange")) nivel = "LARANJA";
      else if (card.classList.contains("ipma-red")) nivel = "VERMELHO";
      let mensagem = "";
      if (nivel === "AMARELO") {
        mensagem =
          `*⚠️🚨AVISO METEOROLÓGICO🚨⚠️*\n\n` +
          `*🟡 AVISO METEO ${nivel}* para o Distrito de *${formatDate(startTime)}* até *${formatDate(endTime)}*.\n` +
          `*${texto}* \\\Fonte IPMA`;
      }
      else if (nivel === "LARANJA") {
        mensagem =
          `*⚠️🚨AVISO METEOROLÓGICO🚨⚠️*\n\n` +
          `*🟠 AVISO METEO ${nivel}* para o Distrito de *${formatDate(startTime)}* até *${formatDate(endTime)}*.\n` +
          `*${texto}* \\\\Fonte IPMA\n\n` +
          `_Solicita-se disponibilidade de elementos para eventual elevado número de ocorrências._\n` +
          `_As disponibilidades devem ser remetidas à SALOC com a maior brevidade possível._\n` +
          `Obrigado!`;
      }
      else if (nivel === "VERMELHO") {
        mensagem =
          `*⚠️🚨AVISO METEOROLÓGICO🚨⚠️*\n\n` +
          `*🔴 AVISO METEO ${nivel}* para o Distrito de *${formatDate(startTime)}* até *${formatDate(endTime)}*.\n` +
          `*${texto}* \\\Fonte IPMA\n\n` +
          `_*MOBILIZAÇÃO GERAL DO EFETIVO DO CORPO DE BOMBEIROS.*_\n` +
          `Obrigado!`;
      }
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(mensagem).then(() => {
          showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.");
        }).catch(() => {
          showPopup('popup-danger', "Não foi possível copiar automaticamente. Copie manualmente:\n\n" + mensagem);
        });
      } else {
        showPopup('popup-danger', "Copie manualmente a mensagem:\n\n" + mensagem);
      }
    }    
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      if (isNaN(date)) return dateStr;
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const year = String(date.getFullYear()).slice(-2);
      return `${day}${hour}${min}${month}${year}`;
    }
