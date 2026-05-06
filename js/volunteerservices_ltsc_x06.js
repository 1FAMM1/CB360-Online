    /* =======================================
    SERVIÇOS VOLUNTARIADO
    ======================================= */
    /* ============= INSERÇÃO ============= */
    let vsValuesCache = [];
    async function loadVsValuesCache() {
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!corpOperNr) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?corp_oper_nr=eq.${corpOperNr}&select=*`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return;
        vsValuesCache = await response.json();
        populateVsTypeSelect();
        populateVsLocalSelect();
      } catch (err) {
        console.error('Erro ao carregar valores:', err);
      }
    }
    const transportFields = ['vsValue', 'vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue'];
    const transportValueOnly = ['vsValue'];
    const transportExtraFields = ['vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue'];
    const prevFields = ['vsPrevValueHour', 'vsQtdPrevHours', 'vsPrevValue'];
    function setFieldsState(fieldIds, disabled) {
      fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = disabled;
        el.style.opacity = disabled ? '0.4' : '1';
        el.style.pointerEvents = disabled ? 'none' : '';
        if (disabled) el.value = '';
      });
    }
    function clearFields(fieldIds) {
      fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = '';
      });
    }
    const typeChangeClearFields = ['vsLocal', 'vsValue', 'vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue', 'vsPrevValueHour',
                                   'vsQtdPrevHours', 'vsPrevValue', 'vsElementValue', 'vsElementNInt', 'vsElementName'];
    function handleVsTypeChange() {
      clearFields(typeChangeClearFields);
      const typeValue = document.getElementById('vsType').value;
      const typeNormalized = normalizeText(typeValue);
      const containerLocal = document.getElementById('container-vsLocal');
      const localSelect = document.getElementById('vsLocal');
      const localText = document.getElementById('vsLocalText');
      if (containerLocal) {
        if (typeNormalized === 'transporte de doentes') {
          containerLocal.style.display = '';
          localSelect.style.display = 'block';
          localText.style.display = 'none';
          localText.value = '';
        }
        else if (typeNormalized === 'prevencao' || typeNormalized === 'outro') {
          containerLocal.style.display = '';
          localSelect.style.display = 'none';
          localText.style.display = 'block';
          localSelect.value = ''; 
        }
        else {
          containerLocal.style.display = 'none';
          localSelect.value = '';
          localText.value = '';
        }
      }
      switch (typeValue) {
        case 'PREVENÇÃO':
        case 'OUTRO':
          setFieldsState(transportFields, true);
          setFieldsState(prevFields, false);
          break;
        case 'TRANSPORTE DE DOENTES':
          setFieldsState(transportFields, false);
          setFieldsState(prevFields, true);
          break;
        case 'SERVIÇO GERAL':
        case 'CENTRAL':
        case 'EIP':
        case 'INEM':
        case 'REMOÇÃO DE CADÁVER':
          setFieldsState(transportValueOnly, false);
          setFieldsState(transportExtraFields, true);
          setFieldsState(prevFields, true);
          break;
        default:
          setFieldsState(transportFields, true);
          setFieldsState(prevFields, true);
          break;
      }    
      calculateGlobalTotal();
    }
    function normalizeText(text) {
      return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }
    function applyRules() {
      const typeRaw = document.getElementById('vsType').value;
      const type = normalizeText(typeRaw);
      const localRaw = document.getElementById('vsLocal').value;
      const local = normalizeText(localRaw);
      const vsValue = document.getElementById('vsValue');
      const vsPrevValueHour = document.getElementById('vsPrevValueHour');
      const containerOtherLocal = document.getElementById('container-vsOtherLocal');
      const vsOtherLocal = document.getElementById('vsOtherLocal');
      vsValue.value = '';
      vsPrevValueHour.value = '';
      containerOtherLocal.style.display = 'none';
      vsOtherLocal.value = '';
      if (type === 'transporte de doentes') {
        if (localRaw === 'Outro') {
          containerOtherLocal.style.display = 'flex';
        } else {
          const match = vsValuesCache.find(item => item.type === 'TRANSPORTE DE DOENTES' && normalizeText(item.desteny) === local);
          if (match) {
            vsValue.value = match.value || '';
            document.getElementById('vsQtdSick')._extraSickRate = parseFloat(match.extra_sick) || 0;
            document.getElementById('vsWaitHrs')._extraHourRate = parseFloat(match.extra_hour) || 0;
          }
        }
      }
      else if (type === 'prevencao') {
        const match = vsValuesCache.find(item => normalizeText(item.type) === 'prevencao');
        if (match) vsPrevValueHour.value = match.value || '';
      }
      else if (type !== '') {
        const match = vsValuesCache.find(item => normalizeText(item.type) === type);
        if (match) vsValue.value = match.value || '';
      }
      calculateGlobalTotal();
    }
    function populateVsTypeSelect() {
      const vsType = document.getElementById('vsType');
      if (!vsType) return;
      const allTypes = [...new Set(vsValuesCache.map(item => item.type).filter(Boolean))].sort();
      vsType.innerHTML = `
        <option value="">Selecione...</option>
        ${allTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
      `;
    }
    function populateVsLocalSelect() {
      const vsLocal = document.getElementById('vsLocal');
      if (!vsLocal) return;
      const destinos = vsValuesCache
      .filter(item => item.type === 'TRANSPORTE DE DOENTES' && item.desteny && item.desteny.trim() !== '-')
      .map(item => item.desteny);
      const uniqueDestinos = [...new Set(destinos)].sort();
      vsLocal.innerHTML = `
        <option value="">Selecione...</option>
        ${uniqueDestinos.map(d => `<option value="${d}">${d}</option>`).join('')}
      `;
    }
    function calculateSickValue() {
      const qtd = parseFloat(document.getElementById('vsQtdSick').value) || 0;
      const rate = document.getElementById('vsQtdSick')._extraSickRate || 5;
      document.getElementById('vsSickValue').value = qtd * rate;
      calculateGlobalTotal();
    }
    function calculateWaitHrsValue() {
      const hrs = parseFloat(document.getElementById('vsWaitHrs').value) || 0;
      const rate = document.getElementById('vsWaitHrs')._extraHourRate || 3;
      document.getElementById('vsWaitHrsValue').value = hrs * rate;
      calculateGlobalTotal();
    }
    function calculatePrevValue() {
      const valHour = parseFloat(document.getElementById('vsPrevValueHour').value) || 0;
      const qtdHours = parseFloat(document.getElementById('vsQtdPrevHours').value) || 0;
      document.getElementById('vsPrevValue').value = (valHour * qtdHours);
      calculateGlobalTotal();
    }
    function calculateGlobalTotal() {
      const vBase = parseFloat(document.getElementById('vsValue').value) || 0;
      const vSick = parseFloat(document.getElementById('vsSickValue').value) || 0;
      const vWait = parseFloat(document.getElementById('vsWaitHrsValue').value) || 0;
      const vPrev = parseFloat(document.getElementById('vsPrevValue').value) || 0;
      const total = vBase + vSick + vWait + vPrev;
      const globalField = document.getElementById('vsElementValue');
      if (globalField) {
        globalField.value = total > 0 ? total.toFixed(2) : '';
        const baseStyle = "width:100px; text-align:center; font-size:20px !important; height:40px !important;";
        if (total > 0) {
          globalField.setAttribute('style', baseStyle + " background:#d4edda !important; border:1.5px solid #28a745 !important; color:#155724 !important;");
        } else {
          globalField.setAttribute('style', baseStyle);
        }
      }
    }
    async function fetchElementName() {
      const n_int = document.getElementById('vsElementNInt').value.trim();
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const nameField = document.getElementById('vsElementName');
      nameField.value = '';
      if (!n_int || !corp_oper_nr) return;
      if (n_int.length < 3) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${n_int}&corp_oper_nr=eq.${corp_oper_nr}&select=abv_name`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.length > 0) {
          nameField.value = data[0].abv_name;
        } else {
          showPopup('popup-danger', `Elemento com Nº ${n_int} não existe na base de dados.`);
          document.getElementById('vsElementNInt').value = '';
        }
      } catch (err) {console.error('Erro de rede:', err);}
    }
    function debounce(fn, delay) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
      };
    }
    async function saveVolunteerService() {
      const serviceDate = document.getElementById('vsDate').value;
      const serviceType = document.getElementById('vsType').value;
      const nInt = document.getElementById('vsElementNInt').value;
      const abvName = document.getElementById('vsElementName').value;
      const globalValue = document.getElementById('vsElementValue').value;
      const typeNormalized = normalizeText(serviceType);
      const valSelect = document.getElementById('vsLocal').value;
      const valText = document.getElementById('vsLocalText').value;
      const valOther = document.getElementById('vsOtherLocal').value;
      let finalLocal = valSelect === 'Outro' ? valOther : (valSelect || valText);
      if (!serviceDate || !serviceType || !nInt || !abvName) {
        showPopup('popup-danger', 'Falta preencher campos obrigatórios.');
        return;
      }
      if (typeNormalized === 'transporte de doentes' && !finalLocal) {
        showPopup('popup-danger', 'Para este serviço, o Local é obrigatório.');
        return;
      }
      const internalServices = ['CENTRAL', 'EIP', 'SERVIÇO GERAL', 'INEM'];
      if (internalServices.includes(serviceType)) {
        finalLocal = 'Quartel Sede';
      }
      const payload = {service_date: serviceDate, service_type: serviceType, service_local: finalLocal || null, service_type_global_value: document.getElementById('vsValue').value || null,
                       service_sicks: document.getElementById('vsQtdSick').value || null, service_sicks_value: document.getElementById('vsSickValue').value || null,
                       service_whait_hours: document.getElementById('vsWaitHrs').value || null, service_whait_hours_value: document.getElementById('vsWaitHrsValue').value || null,
                       prev_value_hour: document.getElementById('vsPrevValueHour').value || null, prev_total_hours: document.getElementById('vsQtdPrevHours').value || null,
                       prev_global_value: document.getElementById('vsPrevValue').value || null, n_int: nInt, abv_name: abvName, global_value: globalValue,
                       corp_oper_nr: sessionStorage.getItem('currentCorpOperNr')};
      const btn = document.getElementById('services-save-button');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ A guardar...';
      try {
        const checkUrl = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?service_date=eq.${payload.service_date}&service_type=eq.${encodeURIComponent(payload.service_type)}&n_int=eq.${payload.n_int}&corp_oper_nr=eq.${payload.corp_oper_nr}&select=id`;
        const checkRes = await fetch(checkUrl, {headers: getSupabaseHeaders()});
        const existing = await checkRes.json();
        if (existing.length > 0) {
          showPopup('popup-danger', 'Já existe um registo idêntico para este elemento.');
          btn.disabled = false;
          btn.innerHTML = originalText;
          return;
        }
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services`, {
          method: 'POST',
          headers: getSupabaseHeaders({returnRepresentation: true}),
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw await response.json();
        showPopup('popup-success', `Serviço de voluntariado guardado com sucesso, no elemento ${payload.abv_name}!`);
        clearVolunteerForm();
        handleVsTypeChange();
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', 'Erro ao guardar serviço.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
    function clearVolunteerForm() {
      const ids = ['vsDate', 'vsType', 'vsLocal', 'vsValue', 'vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue',
                   'vsPrevValueHour', 'vsQtdPrevHours', 'vsPrevValue', 'vsElementNInt', 'vsElementName', 'vsElementValue'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = '';
        if (id === 'vsElementValue') {
          el.setAttribute('style', 'width:100px; text-align:center; font-size:20px !important; height:40px !important;');
        }
      });
      document.getElementById('vsLocalText').value = '';
      document.getElementById('vsLocalText').style.display = 'none';
      document.getElementById('vsOtherLocal').value = '';
      document.getElementById('container-vsOtherLocal').style.display = 'none';
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('services-save-button')?.addEventListener('click', saveVolunteerService);
      loadVsValuesCache();
      const vsType = document.getElementById('vsType');
      const vsLocal = document.getElementById('vsLocal');
      if (vsType) {
        vsType.addEventListener('change', () => {handleVsTypeChange(); applyRules();});
        handleVsTypeChange();
      }
      vsLocal?.addEventListener('change', applyRules);
      document.getElementById('vsQtdSick')?.addEventListener('input', calculateSickValue);
      document.getElementById('vsWaitHrs')?.addEventListener('input', calculateWaitHrsValue);
      document.getElementById('vsPrevValueHour')?.addEventListener('input', calculatePrevValue);
      document.getElementById('vsQtdPrevHours')?.addEventListener('input', calculatePrevValue);
      document.getElementById('vsValue')?.addEventListener('input', calculateGlobalTotal);
      document.getElementById('vsElementNInt')?.addEventListener('input', debounce(fetchElementName, 50));
    });
    /* =========== VISULIZAÇÃO ============ */
    let currentVolunteerData = [];
    const container = document.getElementById('services-table-container');
    if (!document.getElementById('hide-scrollbar-style')) {
      const style = document.createElement('style');
      style.id = 'hide-scrollbar-style';
      style.innerHTML = `
        .no-scrollbar::-webkit-scrollbar {display: none;}
        .no-scrollbar {-ms-overflow-style: none; scrollbar-width: none;}
      `;
      document.head.appendChild(style);
    }
    const tableHTML = `
      <div class="no-scrollbar" style="max-height: 500px; overflow-y: auto; margin-top: 15px; border: 1px solid #aaa; border-radius: 4px;">
        <table style="width:100%; border-collapse: separate; border-spacing: 0; font-family: sans-serif; font-size: 10px; text-align: center; table-layout: fixed;">
          <colgroup>
            <col style="width: 70px;">  <col style="width: 180px;"> <col style="width: 100px;">
            <col style="width: 55px;">  <col style="width: 45px;">  <col style="width: 40px;">
            <col style="width: 50px;">  <col style="width: 40px;">  <col style="width: 50px;">
            <col style="width: 40px;">  <col style="width: 50px;">  <col style="width: 110px;">
            <col style="width: 70px;">
          </colgroup>
          <thead>
            <tr>
              <th colspan="3" rowspan="2" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-bottom:1px solid #aaa; padding:5px;">Data | Tipo de Serviço</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor do<br>Serviço</th>
              <th colspan="3" rowspan="2" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Prevenções</th>
              <th colspan="4" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Transporte de Doentes</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Elemento</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor Global<br>a Receber</th>
            </tr>
            <tr>
              <th colspan="2" style="position:sticky; top:27px; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:4px;">Doentes Extra</th>
              <th colspan="2" style="position:sticky; top:27px; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:4px;">Horas Espera</th>
            </tr>
            <tr>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-bottom:1px solid #aaa; padding:5px;">Data do Serviço</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Tipo de Serviço</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Local do Serviço</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor/Hora</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Qtd.</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Total</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Qtd.</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Qtd.</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor</th>
            </tr>
          </thead>
          <tbody id="table-body"></tbody>
        </table>
      </div>
    `;
    function formatDate(dataISO) {
      if (!dataISO) return '';
      const [year, month, day] = dataISO.split('-');
      return `${day}/${month}/${year}`;
    }
    async function getUniqueServiceTypes() {
      const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?select=type`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error('Erro ao carregar tipos');
        const data = await response.json();
        return [...new Set(data.map(item => item.type))]
          .filter(t => t && String(t).trim() !== '')
          .sort();
      } catch (error) {
        console.error("Erro na busca de tipos:", error);
        return [];
      }
    }
    async function loadVolunteerServicesTable() {
      const container = document.getElementById('services-table-container');
      const yearEl = document.getElementById('vsConsYear');
      const monthEl = document.getElementById('vsConsMonth');
      const typeEl = document.getElementById('vsConsType');
      const elementEl = document.getElementById('vsConsElement');
      if (!container || !yearEl || !monthEl || !typeEl) return;
      const type = typeEl.value;
      const selectedYear = yearEl.value;
      const selectedMonth = monthEl.value;
      const selectedElement = elementEl ? elementEl.value : 'todos';
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      document.getElementById('vsReportSelect').value = '';
      const pdfBtn = document.getElementById('vsPDFReport');
      const excelBtn = document.getElementById('vsEXCELReport');
      const setButtonsState = (disabled) => {
        [pdfBtn, excelBtn].forEach(btn => {
          if (btn) {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '1';
            btn.style.cursor  = disabled ? 'not-allowed' : 'pointer';
          }
        });
      };
      setButtonsState(true);
      if (!document.getElementById('table-body')) {
        container.innerHTML = typeof tableHTML !== 'undefined' ? tableHTML : '<div class="no-scrollbar" style="max-height: 500px; overflow-y: auto; margin-top: 15px; border: 1px solid #aaa; border-radius: 4px;"><table style="width:100%; border-collapse: separate; border-spacing: 0;"><tbody id="table-body"></tbody></table></div>';
      }
      const tableBody = document.getElementById('table-body');
      tableBody.style.opacity = "0.5";
      let dateFilter = "";
      if (selectedMonth === "todos") {
        dateFilter = `&service_date=gte.${selectedYear}-01-01&service_date=lte.${selectedYear}-12-31`;
      } else {
        const lastDay = new Date(selectedYear, parseInt(selectedMonth), 0).getDate();
        dateFilter = `&service_date=gte.${selectedYear}-${selectedMonth}-01&service_date=lte.${selectedYear}-${selectedMonth}-${lastDay}`;
      }
      let typeFilter = (type !== "todos") ? `&service_type=eq.${encodeURIComponent(type)}` : "";
      let elementFilter = (selectedElement !== "todos") ? `&n_int=eq.${encodeURIComponent(selectedElement)}` : "";
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?corp_oper_nr=eq.${corpOperNr}${dateFilter}${typeFilter}${elementFilter}&order=service_date.asc`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error('Erro na resposta do servidor');
        const data = await response.json();
        currentVolunteerData = data;
        tableBody.style.opacity = "1";
        tableBody.innerHTML = '';
        if (data.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="13" style="padding: 20px; font-size: 13px; text-align: center;">Nenhum registo encontrado para este período ou tipo.</td></tr>';
          updateSummary(0, 0);
          return;
        }
        setButtonsState(false);
        tableBody.innerHTML = data.map(item => {
          const tdStyle = `border-bottom: 1px solid #ccc; padding: 6px; font-size: 12px;`;
          return `
            <tr>
              <td style="${tdStyle}">${formatDate(item.service_date)}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_type || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_local || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${item.service_type_global_value || '0,00'} €</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${item.prev_value_hour || '-'} €</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.prev_total_hours || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${item.prev_global_value || '-'} €</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_sicks || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${item.service_sicks_value || '-'} €</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_whait_hours || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${item.service_whait_hours_value || '-'} €</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.abv_name || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right; font-weight: bold; font-size: 13px;">${item.global_value || '0,00'} €</td>
            </tr>
          `;
        }).join('');
        const total = data.reduce((sum, item) => sum + (parseFloat(item.global_value) || 0), 0);
        updateSummary(total, data.length);
      } catch (err) {
        tableBody.style.opacity = "1";
        console.error('Erro:', err);
        tableBody.innerHTML = '<tr><td colspan="13" style="padding: 20px; color: red; text-align: center;">Erro ao carregar dados. Verifique a consola.</td></tr>';
      }
    }
    async function updateSummary(total, count) {
      const summaryContainer = document.getElementById('services-summary-container');
      if (!summaryContainer) return;
      const displayCount = count || 0;
      const displayTotal = typeof total === 'number' ? total.toFixed(2) : '0.00';
      summaryContainer.style.display = "flex";
      summaryContainer.style.flexDirection = "column";
      summaryContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 10px; font-family: sans-serif;">
          <div style="border: 1px solid #aaa; border-radius: 4px; overflow: hidden; display: flex; height: 28px; align-items: center;">
            <div style="padding: 0 12px; background-color: #2b6ca3; color: white; font-weight: bold; font-size: 12px; border-right: 1px solid #aaa; line-height: 28px;">
              Total de Serviços
            </div>
            <div style="padding: 0 15px; background-color: white; color: darkred; font-weight: bold; font-size: 14px; min-width: 50px; text-align: center; line-height: 28px;">
              ${displayCount}
            </div>
          </div>
          <div style="border: 1px solid #aaa; border-radius: 4px; overflow: hidden; display: flex; height: 28px; align-items: center;">
            <div style="padding: 0 12px; background-color: #2b6ca3; color: white; font-weight: bold; font-size: 12px; border-right: 1px solid #aaa; line-height: 28px;">
              Valor Global
            </div>
            <div style="padding: 0 15px; background-color: white; color: darkred; font-weight: bold; font-size: 14px; min-width: 120px; text-align: right; line-height: 28px;">
              ${displayTotal} €
            </div>
          </div>    
        </div>
        <div id="validation-card" class="major-card card major-last-card" style="display: none; margin: 8px 0 0 0; min-width: 15%; align-self: flex-end; clear: both;">
          <div class="major-card-header header-red" style="padding: 1px 8px; font-size: 11px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align: middle; margin-right: 4px;">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1-2.83-2.83l-3.94 3.6z"/>
              <path d="M11.5 9.5l-7 7l-2 3l3-2l7-7"/><path d="M10 22L13 19"/><path d="M22 10l-3 3"/><path d="M12 12l-6-6"/><circle cx="12" cy="12" r="3"/>
            </svg>
            VALIDAÇÃO
          </div>            
          <div style="padding: 6px 10px; display: flex; align-items: center; justify-content: flex-end; background: #fff; gap: 8px;">
            <div style="display: flex; gap: 8px;">
              <label style="display: flex; align-items: center; cursor: pointer; color: #155724; font-weight: bold; font-size: 12px; white-space: nowrap;">
                <input type="checkbox" id="vsValidado" style="margin-right: 3px; width: 15px; height: 15px; cursor: pointer;"> 
                Validado
              </label>
              <label style="display: flex; align-items: center; cursor: pointer; color: #721c24; font-weight: bold; font-size: 12px; white-space: nowrap;">
                <input type="checkbox" id="vsNaoValidado" style="margin-right: 3px; width: 15px; height: 15px; cursor: pointer;"> 
                Não Validado
              </label>
            </div>              
            <button id="btnConfirmarValidacao" style="background-color: #2b6ca3; color: white; border: none; margin-left: 10px; padding: 4px 8px; border-radius: 3px; font-weight: bold; 
                                                      cursor: pointer; font-size: 11px;">
              OK
            </button>
          </div>
        </div>
        <div id="direct-send-container" style="display: none; margin-top: 10px; align-self: flex-end;">
          <button id="btnEnviarVoluntario" style="background-color: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; 
                                                  display: flex; align-items: center; gap: 8px; transition: background 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            ENVIAR PARA VALIDAÇÃO
          </button>
        </div>
      `;
      const cbV = document.getElementById('vsValidado');
      const cbN = document.getElementById('vsNaoValidado');
      const btnOk = document.getElementById('btnConfirmarValidacao');
      const validationCard = document.getElementById('validation-card');
      const directSendContainer = document.getElementById('direct-send-container');
      const btnEnviar = document.getElementById('btnEnviarVoluntario');
      try {
        const nInt = sessionStorage.getItem("currentNInt") || "205";
        const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=patent&n_int=eq.${nInt}&corp_oper_nr=eq.${corpNr}&limit=1`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          const patente = data[0]?.patent?.toLowerCase() || '';
          if (patente.includes('comandante')) {
            validationCard.style.display = 'block';
          } else if (patente.includes('bombeiro')) {
            directSendContainer.style.display = 'block';
          }
        }
      } catch (err) {
        console.warn("Erro ao verificar patente:", err);
      }
      if (cbV && cbN) {
        [cbV, cbN].forEach(cb => {
          cb.addEventListener('change', () => {
            const header = document.querySelector('#validation-card .major-card-header');
            if (cb.checked) {
              if (cb === cbV) {
                cbN.checked = false;
                header.classList.remove('header-red');
                header.classList.add('header-green');
              } else {
                cbV.checked = false;
                header.classList.remove('header-green');
                header.classList.add('header-red');
              }
            } else {
              if (!cbV.checked && !cbN.checked) {
                header.classList.remove('header-green');
                header.classList.add('header-red');
              }
            }
          });
        });
        btnOk.onclick = () => confirmValidation(cbV, cbN, btnOk);
      }
      if (btnEnviar) {
        btnEnviar.onmouseover = () => btnEnviar.style.backgroundColor = "#218838";
        btnEnviar.onmouseout = () => btnEnviar.style.backgroundColor = "#28a745";
        btnEnviar.onclick = () => {
          console.log("Enviando dados para validação pelo utilizador comum...");
          if(typeof confirmValidation === 'function') {
            confirmValidation(null, null, btnEnviar);
          }
        };
      }
    }
    async function confirmValidation(cbV, cbN, btn) {
      const isDirectSend = !cbV || !cbN;
      const selected = isDirectSend ? "SEND" : (cbV.checked ? "SIM" : cbN.checked ? "NÃO" : null);
      if (!isDirectSend && !selected) {
        showPopup('popup-danger', "Por favor selecione Validado ou Não Validado.");
        return;
      }
      if (!isDirectSend) {
        cbV.disabled = true;
        cbN.disabled = true;
      }
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const greeting = getGreeting();
      const commanderName = await getCommanderName(corpNr);
      const senderName = sessionStorage.getItem("currentUserName") || "Elemento do Corpo Ativo";
      const emailValidated = {
        to: "secretaria.ahbfaro@gmail.com",
        cc: "comando0805.ahbfaro@gmail.com",
        subject: "Validação de Serviços Remunerados - Voluntariado",
        body: `${greeting}<br><br>
               Foi validado o formulário de serviços remunerados efetuados por elementos em regime de voluntariado.<br><br>Proceda à sua impressão em CB360 Online.<br><br>
               Com os melhores cumprimentos,<br><br>
               O Comandante,<br>
               ${commanderName}`};
      const emailNotValidated = {
        to: "mcavaco.ahbfaro@gmail.com",
        cc: "comando0805.ahbfaro@gmail.com",
        subject: "Inconsistências - Serviços Remunerados - Voluntariado",
        body: `${greeting}<br><br>
               O formulário de serviços remunerados efetuados por elementos em regime de voluntariado contém inconsistências.<br><br>Proceda à sua correção.<br><br>
               Com os melhores cumprimentos,<br><br>
               O Comandante,<br>
               ${commanderName}`};
      const EmailForVerification = {
        to: "comandante.faroahb@gmail.com",
        cc: "comando0805.ahbfaro@gmail.com",
        subject: "Novo Mapa de Serviços para Validação - Voluntariado",
        body: `${greeting}<br><br>
               O elemento <b>${senderName}</b> submeteu um novo mapa de serviços remunerados (Voluntariado) para validação.<br><br>
               Aceda ao CB360 Online para validar os dados.<br><br>
               Com os melhores cumprimentos.`};
      let emailData;
      if (isDirectSend) {
        emailData = EmailForVerification;
      } else {
        emailData = selected === "SIM" ? emailValidated : emailNotValidated;
      }
      try {
        const originalText = btn.textContent;
        btn.textContent = "A enviar...";
        const response = await fetch("https://cb360-online.vercel.app/api/prevpay_convert_and_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({action: "send-email", ...emailData})
        });
        const result = await response.json();
        if (response.ok) {
          showPopup('popup-success', isDirectSend ? "Enviado para o Comando com sucesso!" : "Email de validação enviado!");
          if(isDirectSend) btn.textContent = "ENVIADO";
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Erro:", err);
        showPopup('popup-danger', "Erro ao enviar: " + err.message);
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.textContent = isDirectSend ? "ENVIAR PARA VALIDAÇÃO" : "OK";
        if (!isDirectSend) {
          cbV.disabled = false;
          cbN.disabled = false;
        }
      }
    }
    async function initializeFilters() {
      const yearSelect = document.getElementById('vsConsYear');
      const monthSelect = document.getElementById('vsConsMonth');
      const typeSelect = document.getElementById('vsConsType');
      const elementSelect = document.getElementById('vsConsElement');
      if (!yearSelect || !monthSelect) return;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      let yearsHTML = '';
      for (let year = 2026; year <= 2036; year++) {
        yearsHTML += `<option value="${year}">${year}</option>`;
      }
      yearSelect.innerHTML = yearsHTML;
      const months = [{val: 'todos', name: 'Todos os Meses'}, {val: '01', name: 'Janeiro'}, {val: '02', name: 'Fevereiro'}, {val: '03', name: 'Março'}, 
                      {val: '04', name: 'Abril'}, {val: '05', name: 'Maio'}, {val: '06', name: 'Junho'}, {val: '07', name: 'Julho'}, {val: '08', name: 'Agosto'}, 
                      {val: '09', name: 'Setembro'}, {val: '10', name: 'Outubro'}, {val: '11', name: 'Novembro'}, {val: '12', name: 'Dezembro'}];
      monthSelect.innerHTML = months.map(m => `<option value="${m.val}">${m.name}</option>`).join('');
      yearSelect.value = currentYear;
      monthSelect.value = currentMonth;
      async function refreshDynamicFilters() {
        const year = yearSelect.value;
        const month = monthSelect.value;
        const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (typeSelect) typeSelect.innerHTML = '<option value="todos">A carregar...</option>';
        if (elementSelect) elementSelect.innerHTML = '<option value="todos">A carregar...</option>';
        let nextMonth = parseInt(month) + 1;
        let nextYear = parseInt(year);
        if (nextMonth > 12) {nextMonth = 1; nextYear++;}
        const startDate = `${year}-${month}-01`;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
        let dateFilter = `service_date=gte.${startDate}&service_date=lt.${endDate}`;
        if (month === 'todos') {
          dateFilter = `service_date=gte.${year}-01-01&service_date=lt.${nextYear}-01-01`;
        }
        try {
          const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?select=n_int,abv_name,service_type&corp_oper_nr=eq.${corpNr}&${dateFilter}&order=n_int.asc`;
          const response = await fetch(url, {
            method: 'GET',
            headers: getSupabaseHeaders()
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Status: ${response.status} - ${errorText}`);
          }
          const data = await response.json();
          if (!data || data.length === 0) {
            if (elementSelect) elementSelect.innerHTML = '<option value="todos">Sem elementos (período vazio)</option>';
            if (typeSelect) typeSelect.innerHTML = '<option value="todos">Sem serviços (período vazio)</option>';
            return;
          }
          const uniqueElements = [...new Map(data.map(e => [e.n_int, e])).values()];
          elementSelect.innerHTML = '<option value="todos">Todos os Elementos</option>' + uniqueElements.map(e => `<option value="${e.n_int}">${e.n_int} - ${e.abv_name}</option>`).join('');
          const uniqueTypes = [...new Set(data.map(e => e.service_type))].filter(Boolean).sort();
          typeSelect.innerHTML = '<option value="todos">Todos os Tipos</option>' + uniqueTypes.map(t => `<option value="${t}">${t}</option>`).join('');
        } catch (err) {
          console.error("ERRO CRÍTICO FILTROS:", err);
          if (elementSelect) elementSelect.innerHTML = '<option value="todos">Erro de Conexão</option>';
          if (typeSelect) typeSelect.innerHTML = '<option value="todos">Erro de Conexão</option>';
        }
      }
      const onMasterChange = async () => {
        await refreshDynamicFilters();
        loadVolunteerServicesTable();
      };
      yearSelect.onchange = onMasterChange;
      monthSelect.onchange = onMasterChange;
      if (typeSelect) typeSelect.onchange = loadVolunteerServicesTable;
      if (elementSelect) elementSelect.onchange = loadVolunteerServicesTable;
      await refreshDynamicFilters();
      loadVolunteerServicesTable();
    }
    /* ============= EMISSÃO DE RELATÓRIOS ============== */
    async function generateVolunteerReport(format) {
      const EXTENDED_MONTHS = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const year = document.getElementById('vsConsYear').value;
      const monthValue = document.getElementById('vsConsMonth').value;
      const reportType = document.getElementById('vsReportSelect').value;
      if (!reportType || reportType.trim() === "") return;
      const monthName = EXTENDED_MONTHS[parseInt(monthValue)] || 'Mes';
      const typesToGenerate = reportType === 'Ambos' ? ['Simplificado', 'Detalhado'] : [reportType];
      for (const type of typesToGenerate) {
        let rows;
        if (type === 'Detalhado') {
          rows = [...currentVolunteerData];
        } else {
          const grouped = {};
          currentVolunteerData.forEach(item => {
            const key = item.abv_name;
            if (!grouped[key]) {
              grouped[key] = {n_int: item.n_int, abv_name: item.abv_name, total: 0};
            }
            grouped[key].total += parseFloat(item.global_value) || 0;
          });
          rows = Object.values(grouped);
        }
        rows.sort((a, b) => (parseInt(a.n_int) || 0) - (parseInt(b.n_int) || 0));
        const globalTotal = currentVolunteerData.reduce((sum, item) => sum + (parseFloat(item.global_value) || 0), 0);
        const tipoFicheiro = format === 'pdf' ? 'PDF' : 'EXCEL';
        showLoadingPopup(`A gerar relatório ${type} em ${tipoFicheiro}...`);
        try {
          const response = await fetch('https://cb360-online.vercel.app/api/prevpay_convert_and_send', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: 'generate-report', rows, year, month: monthValue, format, globalTotal, reportType: type})
          });
          if (!response.ok) throw new Error(`Falha na API`);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const reportSuffix = type.toLowerCase();
          const extension = format === 'pdf' ? 'pdf' : 'xlsx';
          a.download = `pagamento_${reportSuffix}_${monthName}_${year}.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          if (reportType === 'Ambos' && type === 'Simplificado') {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (e) {
          console.error("Erro:", e);
          showPopup('popup-danger', `Erro ao gerar ${type}: ` + e.message);
          break;
        }
      }
      hideLoadingPopup();
      document.getElementById('vsReportSelect').value = '';
      const pdfBtn = document.getElementById('vsPDFReport');
      const excelBtn = document.getElementById('vsEXCELReport');
      [pdfBtn, excelBtn].forEach(btn => {
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        }
      });
    }
    document.getElementById('vsPDFReport').addEventListener('click', async function () {
      await generateVolunteerReport('pdf');
    });
    document.getElementById('vsEXCELReport').addEventListener('click', async function () {
      await generateVolunteerReport('excel');
    }); 
    /* ====== CONFIGURAÇÃO DE VALORES ===== */
    let currentEditingValueId = null;
    async function saveVolunteerServiceValue() {
      const btn = document.getElementById('services-values-save-button');
      const lcDesteny = document.getElementById('vsLCDesteny').value.trim();
      const lcValue = document.getElementById('vsLCValue').value.trim();
      const lcESick = document.getElementById('vsLCESick').value.trim();
      const lcEHour = document.getElementById('vsLCEHour').value.trim();
      const oType = document.getElementById('vsOType').value.trim();
      const oValue = document.getElementById('vsOValue').value.trim();
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (lcDesteny && oType) {
        showPopup('popup-danger', 'Preencha apenas um lado: Longo Curso OU Prevenções/Outros.');
        return;
      }
      if (!lcDesteny && !oType) {
        showPopup('popup-danger', 'Por favor preencha pelo menos um dos campos.');
        return;
      }
      let payload = {};
      if (lcDesteny) {
        if (!lcValue) {
          showPopup('popup-danger', 'Por favor preencha o Valor do Longo Curso.');
          return;
        }
        payload = {type: 'TRANSPORTE DE DOENTES', desteny: lcDesteny, value: lcValue, extra_sick: lcESick || null, extra_hour: lcEHour || null, corp_oper_nr: corpOperNr};
      } else {
        if (!oValue) {
          showPopup('popup-danger', 'Por favor preencha o Valor/Hora.');
          return;
        }
        payload = {type: oType, value: oValue, desteny: null, extra_sick: null, extra_hour: null, corp_oper_nr: corpOperNr};
      }
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ A processar...';
      try {
        let response;
        if (currentEditingValueId) {
          response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?id=eq.${currentEditingValueId}`, {
            method: 'PATCH',
            headers: getSupabaseHeaders({returnRepresentation: true}),
            body: JSON.stringify(payload)
          });
        } else {
          const checkUrl = `${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?type=eq.${encodeURIComponent(payload.type)}&desteny=eq.${payload.desteny ?? ''}&corp_oper_nr=eq.${payload.corp_oper_nr}&select=id`;
          const checkRes = await fetch(checkUrl, {headers: getSupabaseHeaders()});
          const existing = await checkRes.json();
          if (existing.length > 0) {
            showPopup('popup-danger', 'Já existe um registo para este tipo e destino.');
            btn.disabled = false;
            btn.innerHTML = originalText;
            return;
          }
          response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values`, {
            method: 'POST',
            headers: getSupabaseHeaders({returnRepresentation: true}),
            body: JSON.stringify(payload)
          });
        }
        if (!response.ok) throw await response.json();
        showPopup('popup-success', currentEditingValueId ? 'Registo atualizado!' : 'Valor guardado com sucesso!');
        clearServiceValuesForm();
      } catch (err) {
        console.error('Erro:', err);
        showPopup('popup-danger', 'Erro ao processar o pedido.');
      } finally {
        btn.disabled = false;
      }
    }
    function editServiceValue(itemJson) {
      const item = JSON.parse(decodeURIComponent(itemJson));
      currentEditingValueId = item.id;
      ['vsLCDesteny', 'vsLCValue', 'vsLCESick', 'vsLCEHour', 'vsOType', 'vsOValue'].forEach(id => document.getElementById(id).value = '');
      if (item.type === 'TRANSPORTE DE DOENTES') {
        document.getElementById('vsLCDesteny').value = item.desteny || '';
        document.getElementById('vsLCValue').value = item.value || '';
        document.getElementById('vsLCESick').value = item.extra_sick || '';
        document.getElementById('vsLCEHour').value = item.extra_hour || '';
      } else {
        document.getElementById('vsOType').value = item.type || '';
        document.getElementById('vsOValue').value = item.value || '';
      }
      const btn = document.getElementById('services-values-save-button');
      btn.innerHTML = '✏️ Atualizar';
      btn.classList.remove('btn-add');
      btn.classList.add('btn-danger');
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
    const svValuesTableHTML = `
      <div style="margin: 10px 0 15px 0;">
        <div class="no-scrollbar" style="max-height: 400px; overflow-y: auto; border: 1px solid #aaa; border-radius: 4px;">
          <table style="width:100%; border-collapse: separate; border-spacing: 0; font-family: sans-serif; font-size: 11px; text-align: center; table-layout: fixed;">
            <colgroup>
              <col style="width: 180px;">
              <col style="width: 140px;">
              <col style="width: 80px;">
              <col style="width: 80px;">
              <col style="width: 80px;">
              <col style="width: 70px;">
            </colgroup>
            <thead>
              <tr>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-bottom:1px solid #aaa; padding:6px;">Tipo</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Destino</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Valor</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Extra Doente</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Hora Espera</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Ações</th>
              </tr>
            </thead>
            <tbody id="sv-values-table-body">
              <tr><td colspan="6" style="padding: 20px;">A carregar...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    async function loadServiceValuesTable() {
      const container = document.getElementById('sv-values-table-container');
      if (!container) return;
      if (!document.getElementById('sv-values-table-body')) {
        container.innerHTML = svValuesTableHTML;
      }
      const tbody = document.getElementById('sv-values-table-body');
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      tbody.style.opacity = '0.5';
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?corp_oper_nr=eq.${corpOperNr}&order=type.asc,desteny.asc`, {
          headers: getSupabaseHeaders()
        });
        const data = await response.json();
        tbody.style.opacity = '1';
        if (data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;">Nenhum registo configurado.</td></tr>';
          return;
        }
        const tdStyle = `border-bottom: 1px solid #ccc; padding: 6px; font-size: 12px;`;
        tbody.innerHTML = data.map(item => {
          const itemData = encodeURIComponent(JSON.stringify(item));
          return `
            <tr>
              <td style="${tdStyle}">${item.type || ''}</td>
              <td style="${tdStyle} border-left:1px solid #ccc;">${item.desteny || '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc; text-align:right;">${item.value ? item.value + ' €' : '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc; text-align:right;">${item.extra_sick ? item.extra_sick + ' €' : '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc; text-align:right;">${item.extra_hour ? item.extra_hour + ' €' : '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc;">
                <button onclick="editServiceValue('${itemData}')" class="btn btn-add" style="padding: 2px 8px; font-size: 14px;" title="Editar">✏️</button>
                <button onclick="deleteServiceValue(${item.id})" class="btn btn-danger" style="padding: 2px 8px; font-size:14px; margin-left:5px;" title="Eliminar">🗑️</button>
              </td>
            </tr>
          `;
        }).join('');
      } catch (err) {
        tbody.style.opacity = '1';
        tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; color:red;">Erro ao carregar dados.</td></tr>';
      }
    }
    async function deleteServiceValue(id) {
      if (!confirm('Tem a certeza que pretende eliminar este registo?')) return;
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?id=eq.${id}`, {
          method: 'DELETE',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error();
        showPopup('popup-success', 'Registo eliminado!');
        loadServiceValuesTable();
      } catch (err) {
        showPopup('popup-danger', 'Erro ao eliminar.');
      }
    }
    function clearServiceValuesForm() {
      currentEditingValueId = null; 
      ['vsLCDesteny', 'vsLCValue', 'vsLCESick', 'vsLCEHour', 'vsOType', 'vsOValue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const btn = document.getElementById('services-values-save-button');
      if (btn) {
        btn.innerHTML = '💾 Guardar';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-add'); 
      }
      loadServiceValuesTable();
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('services-values-save-button')?.addEventListener('click', saveVolunteerServiceValue);
      loadServiceValuesTable();
    });
