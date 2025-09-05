    /* ==============================
       GRUPO SOLICITAÇÕES
    ============================== */
    /* ---- CRIAÇÃO DE MENSAGEM DE SOLICITAÇÃO DE ELEMENTOS ----*/
    function generateAvailability() {
      function formatDate(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      const dateService = document.getElementById('solicitation_date')?.value?.trim();
      const typeRequest = document.getElementById('solicitation_type')?.value?.trim();
      const motiveRequest = document.getElementById('solicitation_motive')?.value?.trim();
      const shift = document.getElementById('solicitation_shift')?.value?.trim();
      const drivers = document.querySelector('#drivers')?.value?.trim();
      const elements = document.querySelector('#elements')?.value?.trim();
      const hourOut = document.querySelector('#exit_hour')?.value;
      const destination = document.querySelector('#uls_desteny')?.value?.trim() || '';
      if (!typeRequest && !motiveRequest && !drivers && !elements) {
        showPopupWarning('Por favor, preencha pelo menos um dos campos antes de efetuar a solicitação.');
        return;
      }
      let message = '*🚨🚨INFORMAÇÃO🚨🚨*\n\n';
      let partes = [];
      if (drivers || elements) {
        let meioText = 'Solicita-se ';
        if (drivers) meioText += `${drivers} Motorista(s)`;
        if (drivers && elements) meioText += ' e ';
        if (elements) meioText += `${elements} Elemento(s)`;
        if (typeRequest === 'INEM') meioText += ' TAS';
        if (typeRequest === 'Reforço Piquete') meioText += ' Preferencialmente TAS';
        partes.push(meioText);
      }
      if (typeRequest) {
        let tipoText = `para efetuar serviço de ${typeRequest}`;
        if (typeRequest === 'Transporte de Doentes') {
          tipoText += ` para ${destination}`;
          if (dateService) tipoText += ` no dia ${formatDate(dateService)}`;
          if (hourOut) tipoText += `, com saída da unidade pelas ${hourOut}`;
          else tipoText += `, com saída da unidade pelas 10:10`;
        } else {
          if (dateService) tipoText += ` no dia ${formatDate(dateService)}`;
          if (shift) tipoText += ` no turno ${shift}`;
        }
        partes.push(tipoText);
      }
      if (typeRequest === 'Reforço Piquete' && motiveRequest === 'Grelha Município') {
        partes.push(`afim de assegurar a ${motiveRequest}`);
      }
      message += partes.join(' ') + '. ';
      let destinatario = 'SALOC';
      if (typeRequest === 'DECIR' || typeRequest === 'DIOPS') destinatario = 'Sr. Adjunto de Comando';
      message += `As disponibilidades deverão ser remetidas ao ${destinatario}, com a maior brevidade possível. Obrigado!`;
      const out = document.getElementById('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).catch(() => {});
      }
      showPopupSuccess("Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
      document.getElementById('solicitation_motive').disabled = true;
      document.getElementById('solicitation_shift').disabled = true;
      document.getElementById('exit_hour').disabled = true;
      document.getElementById('uls_desteny').disabled = true;
      return message;
    }

    function toggleFields() {
      const typeSelect = document.getElementById('solicitation_type');
      const motiveSelect = document.getElementById('solicitation_motive');
      const shieftSelect = document.getElementById('solicitation_shift');
      const hourOutInput = document.getElementById('exit_hour');
      const destinationInput = document.getElementById('uls_desteny');
      if (typeSelect.value === 'Transporte de Doentes') {
        hourOutInput.disabled = false;
        destinationInput.disabled = false;
        motiveSelect.disabled = true;
        shieftSelect.disabled = true;
      } else if (typeSelect.value) {
        hourOutInput.disabled = true;
        destinationInput.disabled = true;
        motiveSelect.disabled = false;
        shieftSelect.disabled = false;
        hourOutInput.value = '';
        destinationInput.value = '';
      }
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('solicitation_motive').disabled = true;
      document.getElementById('solicitation_shift').disabled = true;
      document.getElementById('exit_hour').disabled = true;
      document.getElementById('uls_desteny').disabled = true;
      toggleFields();
      document.getElementById('solicitation_type')
        .addEventListener('change', toggleFields);
    });
