    /* ==============================
       GRUPO ENCERRAMENTO OCORRÊNCIAS
    ============================== */
    /* ---- COVERSÃO DE MT²-Ha ---- */
    function updateHectares() {
      const m2Input = document.getElementById('area_m2');
      const haInput = document.getElementById('area_ha');
      const m2 = parseFloat(m2Input.value) || 0;
      const ha = m2 / 10000;
      haInput.value = ha.toFixed(2);
    }
    /* ---- CRIAÇÃO DE MENSAGEM DE ENCERRAMENTO DE OCORRÊNCIA CREPC ----*/
    function validateClsVehicle() {
      const firstCard = document.querySelector('.vehicle-card');
      if (!firstCard) return false;
      const vehicleSelect = firstCard.querySelector('select')?.value?.trim();
      if (!vehicleSelect) return false;
      const dates = firstCard.querySelectorAll('input[type="date"]');
      const times = firstCard.querySelectorAll('input[type="time"]');
      if (!dates[0]?.value || !times[0]?.value) return false;
      if (!dates[1]?.value || !times[1]?.value) return false;
      if (!dates[2]?.value || !times[2]?.value) return false;
      const kms = firstCard.querySelectorAll('input[type="text"]')[0]?.value?.trim();
      if (!kms) return false;
      return true;
    }

    function generateCloseCREPCMessage() {
      const nrOccurrence = document.getElementById('close_nr_occurrence')?.value?.trim();
      if (!nrOccurrence) {
        showPopupWarning("Por favor, preencha o Nr. de Ocorrência para poder encerrar a ocorrência.");
        return;
      }

      if (!validateClsVehicle()) {
        showPopupWarning("Por favor, preencha os dados do veículo para poder encerrar a ocorrência.");
        return;
      }
      
      const sections = [];
      sections.push(`*❌ Encerramento de Ocorrência*`);
      sections.push(`*N. OC:* ${nrOccurrence}`);
      const vehicleBlocks = [];
      document.querySelectorAll('.vehicle-card').forEach(card => {
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
        lines.push(`*GDH Ch TO:* ${vehicle} | ${formatGDH(chTODate, chTOTime)}`);
        lines.push(`*GDH Sd TO:* ${vehicle} | ${formatGDH(sdTODate, sdTOTime)}`);
        lines.push(`*GDH Ch Und:* ${vehicle} | ${formatGDH(chUndDate, chUndTime)}${kms ? ' | ' + kms + ' Kms' : ''}`);
        if (timePumpH || timePumpM) {
          lines.push(`*TEMPO BOMBA:* ${timePumpH || '00'} Hrs. ${timePumpM || '00'} Mins.`);
        }
        vehicleBlocks.push(lines.join('\n'));
      });
      if (vehicleBlocks.length) {
        sections.push(vehicleBlocks.join('\n\n'));
      }
      const victimLines = [];
      for (let i = 1; i <= victimsCount; i++) {
        const gender = document.getElementById(`victim_${i}_gender`)?.value?.trim();
        const age = document.getElementById(`victim_${i}_age`)?.value?.trim();
        const ageUnit = document.getElementById(`victim_${i}_age_unit`)?.value?.trim();
        const nation = document.getElementById(`victim_${i}_nation`)?.value?.trim();
        const type = document.getElementById(`victim_${i}_type`)?.value?.trim();
        const status = document.getElementById(`victim_${i}_status`)?.value?.trim();
        if (gender || age || nation || type || status) {
          const parts = [];
          if (gender) parts.push(gender);
          if (age) parts.push(`${age}${ageUnit ? ' ' + ageUnit : ''}`);
          if (nation) parts.push(`Nacion: ${nation}`);
          if (type) parts.push(type);
          if (status) parts.push(status);
          victimLines.push(parts.join(' | '));
        }
      }
      if (victimLines.length) {
        sections.push(`*VÍTIMAS:*\n${victimLines.join('\n')}`);
      }
      const extrasLines = [];
      document.querySelectorAll('.extras-card').forEach(card => {
        const label = card.querySelector('label')?.textContent?.trim();
        if (label?.toLowerCase().includes('outros meios')) {
          card.querySelectorAll('.form-row').forEach(row => {
            const inputs = row.querySelectorAll('input[type="text"]');
            const meio = inputs[0]?.value?.trim();
            const veics = inputs[1]?.value?.trim();
            const elems = inputs[2]?.value?.trim();
            if (meio || veics || elems) {
              const parts = [];
              if (meio) parts.push(meio);
              if (veics) parts.push(`Veícs.: ${veics}`);
              if (elems) parts.push(`Elems.: ${elems}`);
              extrasLines.push(parts.join(' | '));
            }
          });
        }
      });
      if (extrasLines.length) {
        sections.push(`*OUTROS MEIOS NO TO:*\n${extrasLines.join('\n')}`);
      }
      const damageLines = [];
      document.querySelectorAll('.demage-card').forEach(card => {
        const label = card.querySelector('label')?.textContent?.trim();
        if (label?.toLowerCase().includes('danos')) {
          card.querySelectorAll('input[type="text"]').forEach(input => {
            const dano = input?.value?.trim();
            if (dano) damageLines.push(dano);
          });
        }
      });
      if (damageLines.length) {
        sections.push(`*DANOS:*\n${damageLines.join('\n')}`);
      }
      const areaM2 = document.getElementById('area_m2')?.value?.trim();
      const areaHa = document.getElementById('area_ha')?.value?.trim();
      if (areaM2 || areaHa) {
        const parts = [];
        if (areaM2) parts.push(`${areaM2} m²`);
        if (areaHa) parts.push(`${areaHa} ha`);
        sections.push(`*ÁREA ARDIDA:*\n${parts.join(' | ')}`);
      }
      const observations = document.querySelector('.observ-card textarea')?.value?.trim();
      if (observations) {
        sections.push(`*OBSERVAÇÕES:*\n${observations}`);
      }
      const message = sections.join('\n\n');
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).catch(() => {});
      }
      showPopupSuccess("Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
      return message;
    }

    function toggleClsOcorrSection(section, button) {
      const el = document.querySelector(`.${section}`);
      if (!el) return;
      const isHidden = el.classList.toggle('hidden');
      button.classList.toggle('active', !isHidden);
    }
