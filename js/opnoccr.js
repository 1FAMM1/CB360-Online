    /* ==============================
       GRUPO INSERIR OCORRÊNCIAS
    ============================== */
    /* ---- TOOGLE DE CAMPO DINÂMICOS ----*/
    /* --- Toogle Tipo de Alerta ---*/
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
    /* --- Toogle INEM-CODU ---*/
    function toggleEMSNrField() {
      const alertSource = document.getElementById('alert_source')?.value;
      const emsGroup = document.getElementById('ems_group');
      if (!emsGroup) return;
      emsGroup.style.display = (alertSource === 'CODU' || alertSource === 'INEM') ? 'flex' : 'none';
    }
    /* --- Toogle Contactos ---*/
    function toggleContactFields() {
      const alertSource = document.getElementById('alert_source')?.value;
      const contactName = document.getElementById('contact_name');
      const contactNr = document.getElementById('contact_nr');
      if (!contactName || !contactNr) return;
      if (alertSource === 'Popular') {
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
    /* ---- LIMPEZA E VALIDALÇÃO DE CAMPOS ---- */
    function getAlertTime() {
      const t = document.getElementById('alert_time')?.value;
      return t || '';
    }

    function clearFormFields() {
      const today = getCurrentDateStr();
      document.querySelectorAll('input[type="text"], input[type="time"]').forEach(i => i.value = '');
      document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
      document.querySelectorAll('input[type="date"]').forEach(i => i.value = today);
      document.querySelectorAll('textarea').forEach(t => t.value = '');
      setTimeout(() => {
        const parishSelect = document.getElementById('parish_select');
        if (parishSelect) {
          parishSelect.innerHTML = '';
        }
      }, 10);
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
        const animalType = document.getElementById('animal-type')?.value.trim();
        if (!animalType) {
          missingFields.push("Tipo de Animal");
        }
      }
      const hasVehicle = Array.from(document.querySelectorAll('.vehicle-card select'))
        .some(sel => sel.value.trim() !== '');
      if (!hasVehicle) missingFields.push("A ocorrência deve conter pelo menos 1 Veículo");
      if (missingFields.length > 0) {
        showPopupMissingFields(missingFields);
        return false;
      }
      return true;
    }
    /* ---- CRIAÇÃO DE MENSAGEM DE NOVA OCORRÊNCIA CREPC ----*/
    function generateNewCREPCMessage() {
      if (!validateRequiredFields()) return '';
      const alertSource = document.getElementById('alert_source')?.value || '';
      const alertDate = document.getElementById('alert_date')?.value || '';
      const alertTime = document.getElementById('alert_time')?.value || '';
      const classOccorr = document.getElementById('class_occorr_input')?.value || '';
      const localOccorr = document.getElementById('occorr_local_input')?.value || '';
      const localitie = document.getElementById('occorr_localitie_input')?.value || '';
      const councilSelect = document.getElementById('council_select');
      const council = councilSelect ? councilSelect.options[councilSelect.selectedIndex]?.text || '' : '';
      const parishSelect = document.getElementById('parish_select');
      const parish = parishSelect ? parishSelect.options[parishSelect.selectedIndex]?.text || '' : '';
      const nrOccurrence = document.getElementById('nr_occurrence_input')?.value?.trim() || '';
      const gdhAlerta = formatGDH(alertDate, alertTime);
      const vehicles = [];
      document.querySelectorAll('.vehicle-card').forEach(card => {
        const vehicle = card.querySelector('select')?.value?.trim() || '';
        const bbs = card.querySelector('input[type="text"]')?.value?.trim() || '';
        const vDate = card.querySelector('input[type="date"]')?.value || '';
        const vTime = card.querySelector('input[type="time"]')?.value || '';
        const gdhVehicle = formatGDH(vDate, vTime);
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
          `*➕ Agregar à Ocorrência*\n\n` +
          `*FONTE ALERTA:* ${alertSource}\n` +
          `*N. OC:* ${nrOccurrence}\n` +
          `*GDH ALERTA:* ${gdhAlerta}\n` +
          `*CLASS OC:* ${classOccorr}\n` +
          `*LOCAL:* ${localOccorr} - ${localitie} - ${council} - ${parish}\n` +
          `${vehicles.join('\n')}`;
      } else {
        message =
          `*✅ Registo de Nova Ocorrência*\n\n` +
          `*FONTE ALERTA:* ${alertSource}\n` +
          `*GDH ALERTA:* ${gdhAlerta}\n` +
          `*CLASS OC:* ${classOccorr}\n` +
          `*LOCAL:* ${localOccorr} - ${localitie} - ${council} - ${parish}\n` +
          `${vehicles.join('\n')}\n\n` +
          `${contacInfo}` +
          `${animalInfo}` +
          `*Agradeço N. OC:*`;
        }
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
        showPopupSuccess("Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
        return message;
    }
    /* ---- CRIAÇÃO DE MENSAGEM DE NOVA OCORRÊNCIA GLOBAL ----*/
    let lastWSMSData = null;
    async function generateWSMSMessage() {
      if (!validateRequiredFields()) return '';
      const alertTime = getAlertTime();
      const alertType = document.getElementById('alert_type')?.value || '';
      const alertSource = document.getElementById('alert_source')?.value || '';
      const descrOccorr = document.getElementById('occorr_descr_input')?.value || '';
      const localitie = document.getElementById('occorr_localitie_input')?.value || '';
      const localOccorr = document.getElementById('occorr_local_input')?.value || '';
      const ppiType = document.getElementById('ppi_type')?.value || '';
      const alertLevel = document.getElementById('alert_level')?.value || '';
      const ppiGrid = document.getElementById('alarm_grid')?.value || '';
      const ppiKm = document.getElementById('km')?.value || '';
      const ppiDirection = document.getElementById('on_going')?.value || '';
      const ppiIncident = document.getElementById('incident_type')?.value || '';
      const channelManeuver = document.getElementById('channel_maneuver')?.value?.trim() || '';
      const vehicles = [];
      document.querySelectorAll('.vehicle-card').forEach(card => {
        const vehicle = card.querySelector('select')?.value?.trim() || '';
        const bbs = card.querySelector('input[type="text"]')?.value?.trim() || '';
        if (vehicle) vehicles.push(bbs ? `${vehicle}|${bbs} BBs.` : vehicle);
      });
      const currentData = {alertType, alertSource, descrOccorr, localitie, localOccorr, ppiType, alertLevel, ppiGrid, ppiKm, ppiDirection, ppiIncident, vehicles: vehicles.join(',')};
      if (lastWSMSData && JSON.stringify(lastWSMSData) === JSON.stringify(currentData)) {
        showPopupWarning("Já existe uma ocorrência com as mesmas características.");
        return document.getElementById('wsms_output')?.value || '';
      }
      lastWSMSData = currentData;
      let message = '';
      const vehicleText = vehicles.length ? `Saída de ${vehicles.join(', ')}` : '';
      const vehicleSufix = vehicleText ? `, ${vehicleText}` : '';
      if (alertType === 'Ocorrência') {
        message = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*\\\\${alertSource}, HI: ${alertTime}, Ativação para ${descrOccorr} em Faro\\${localitie}\\${localOccorr}${vehicleSufix}* `;
      } else if (alertType === 'Plano Prévio de Intervenção') {
        if (ppiType === 'PPI Aeroporto Gago Coutinho') {
          if (alertLevel === 'Amarelo') {
            message = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*\\\\${alertSource}, HI: ${alertTime}, Ativação do ${ppiType} de nível ${alertLevel}, para a Grelha ${ppiGrid}, PREVENÇÃO LOCAL.*`;
          } else if (alertLevel === 'Vermelho') {
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
      if (channelManeuver) {
        message += `*Canal Manobra:${channelManeuver}*`;
      }
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopupSuccess("Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", false);
      await saveOccurrenceToSupabase(currentData, vehicles.length);
      loadActiveOccurrences();
      return message;
    }
    /* ---- GRAVAÇÃO DE OCORRÊNCIA EM DB ----*/
    async function saveOccurrenceToSupabase(data, vehiclesCount) {
      try {
        const alertDate = document.getElementById('alert_date')?.value || '';
        const alertTime = document.getElementById('alert_time')?.value || '';
        if (!alertDate || !alertTime) {
          console.error("Data ou hora do alerta em falta");
          return null;
        }
        const startDateTime = new Date(`${alertDate}T${alertTime}`);
        const formattedDate =
          `${String(startDateTime.getDate()).padStart(2,'0')}/${String(startDateTime.getMonth()+1).padStart(2,'0')}/${startDateTime.getFullYear()} ` +
          `${String(startDateTime.getHours()).padStart(2,'0')}:${String(startDateTime.getMinutes()).padStart(2,'0')}`;
        const query = `occorrence=eq.${encodeURIComponent(data.descrOccorr)}&local=eq.${encodeURIComponent(data.localOccorr)}&localitie=eq.${encodeURIComponent(data.localitie)}&start_date=eq.${encodeURIComponent(formattedDate)}`;
        const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?${query}`, {
          headers: getSupabaseHeaders()
        });
        const existing = await checkResp.json();
        if (existing.length > 0) {
          const existingOccurrence = existing[0];
          let existingVehiclesCount = 0;
          if (Array.isArray(existingOccurrence.vehicles)) {
            existingVehiclesCount = existingOccurrence.vehicles.length;
          } else if (typeof existingOccurrence.vehicles === 'string') {
            existingVehiclesCount = existingOccurrence.vehicles.split(',').filter(v => v.trim() !== '').length;
          }
          if (existingVehiclesCount === vehiclesCount) {
            showPopupWarning("Já existe uma ocorrência com estas características.");
            return null;
          } else {
            const updateResp = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?id=eq.${existingOccurrence.id}`, {
              method: 'PATCH',
              headers: getSupabaseHeaders({ returnRepresentation: true }),
              body: JSON.stringify({
                vehicles: vehiclesCount
              })
            });
            return await updateResp.json();
          }
        }
        const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control`, {
          method: 'POST',
          headers: getSupabaseHeaders({ returnRepresentation: true }),
          body: JSON.stringify({
            start_date: formattedDate,
            occorrence: data.descrOccorr,
            local: data.localOccorr,
            localitie: data.localitie,
            vehicles: vehiclesCount,
            status: "Em Curso"
          })
        });
        return await insertResp.json();
      } catch (e) {
        console.error("Erro ao gravar ocorrência:", e);
        showPopupWarning("❌ Erro inesperado.");
        return null;
      }
    }
    document.addEventListener('DOMContentLoaded', async () => {
      document.querySelectorAll('input[type="date"]').forEach(i => i.value = getCurrentDateStr());
      document.querySelectorAll('input[type="time"]').forEach(i => i.value = '');
      await populateCouncilSelect();
      await populateIndependentVehicleSelect();
      toggleEMSNrField();
      toggleContactFields();
      document.getElementById('alert_source')?.addEventListener('change', () => {
        toggleEMSNrField();
        toggleContactFields();
      });
    });
