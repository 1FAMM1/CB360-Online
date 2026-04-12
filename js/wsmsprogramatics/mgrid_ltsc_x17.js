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
