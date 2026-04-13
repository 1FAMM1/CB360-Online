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
