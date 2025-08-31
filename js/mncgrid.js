   /* ==============================
       GRUPO GRELHA MUNICÍPIO      
    ============================== */
    /* ---- PREENCHIMENTO AUTOMÁTICO DE MENSAGEM E TOOGLE DE CAMPOS ---- */
    function autoFillMunicipalityGrid() {
      const state = document.getElementById('state_municipality_grid')?.value?.trim();
      const out = document.getElementById('municipality_grid_output');
      if (!out || !state) return;
      if (state === 'Sem Constrangimentos') {
        out.value = 'Selecionou Sem Constrangimentos, a mensagem foi gerada de forma automática.';
      } else {
        out.value = '';
      }
    }
    document.getElementById('state_municipality_grid').addEventListener('change', autoFillMunicipalityGrid);

    function toggleMunicipalityGridOutput() {
      const state = document.getElementById('state_municipality_grid')?.value?.trim();
      const motive = document.getElementById('municipality_grid_output');
      if (!motive) return;
      if (state === 'Sem Constrangimentos') {
        motive.value = "Selecionou Sem Constrangimentos, a mensagem foi gerada de forma automática.";
        motive.readOnly = true;
      } else {
        motive.value = "";
        motive.readOnly = false;
      }
    }
    /* ---- CRIAÇÃO DE MENSAGEM DE ESTADO DA GRELHA DO MUNICÍPIO ---- */
    function generateMunicipalityGridMessage() {
      const state = document.getElementById('state_municipality_grid')?.value?.trim();
      const motive = document.getElementById('municipality_grid_output');
      let message = '';
      if (state === 'Sem Constrangimentos') {
        message = `*🚨INFORMAÇÃO🚨*\n\n*✅ Grelha do Município 100% assegurada sem qualquer constrangimento.*\n\n_Planeamento será emitido oportunamente._`;
      } else if (state === 'Com Constrangimentos') {
        message = `*🚨INFORMAÇÃO🚨*\n\n*⚠️ Grelha do Município irá encontrar-se com constrangimentos.*\n\n*Motivo: ${motive.value}*\n\n_Planeamento será emitido oportunamente._`;
      } else if (state === 'Inoperacional') {
        message = `*🚨INFORMAÇÃO🚨*\n\n*❌ Grelha do Município irá ficar Inoperacional.*\n\n*Motivo: ${motive.value}*\n\n_Planeamento será emitido oportunamente._`;
      }
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).catch(() => {});
      }
      showPopupSuccess(false);
      return message;
    }  
