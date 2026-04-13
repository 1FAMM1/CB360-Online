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
