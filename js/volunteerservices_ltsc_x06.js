    /* =======================================
    SERVIÇOS VOLUNTARIADO
    ======================================= */
    /* ============= INSERÇÃO ============= */
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
      const type = document.getElementById('vsType').value;
      switch (type) {
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
      const type = normalizeText(document.getElementById('vsType').value);
      const local = normalizeText(document.getElementById('vsLocal').value);
      const vsValue = document.getElementById('vsValue');
      if (type === 'transporte de doentes') {
        if (local === 'lisboa') {
          vsValue.value = 50;
        } else if (local === 'coimbra') {
          vsValue.value = 65;
        }
        calculateGlobalTotal();
      }
    }
    function calculateSickValue() {
      const qtd = parseFloat(document.getElementById('vsQtdSick').value) || 0;
      document.getElementById('vsSickValue').value = qtd * 5;
      calculateGlobalTotal();
    }
    function calculateWaitHrsValue() {
      const hrs = parseFloat(document.getElementById('vsWaitHrs').value) || 0;
      document.getElementById('vsWaitHrsValue').value = hrs * 3;
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
      if (n_int.length < 2) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${n_int}&corp_oper_nr=eq.${corp_oper_nr}&select=abv_name`;
        const response = await fetch(url, {method: 'GET', headers: getSupabaseHeaders()});
        if (!response.ok) return;
        const data = await response.json();
        if (data.length > 0) nameField.value = data[0].abv_name;
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
      const payload = {service_date: document.getElementById('vsDate').value || null, service_type: document.getElementById('vsType').value || null,
                       service_local: document.getElementById('vsLocal').value || null, service_type_global_value: document.getElementById('vsValue').value || null,
                       service_sicks: document.getElementById('vsQtdSick').value || null, service_sicks_value: document.getElementById('vsSickValue').value || null,
                       service_whait_hours: document.getElementById('vsWaitHrs').value || null, service_whait_hours_value: document.getElementById('vsWaitHrsValue').value || null,
                       prev_value_hour: document.getElementById('vsPrevValueHour').value || null, prev_total_hours: document.getElementById('vsQtdPrevHours').value || null,
                       prev_global_value: document.getElementById('vsPrevValue').value || null, n_int: document.getElementById('vsElementNInt').value || null,
                       abv_name: document.getElementById('vsElementName').value || null, global_value: document.getElementById('vsElementValue').value || null,
                       corp_oper_nr: sessionStorage.getItem('currentCorpOperNr') || null,};
      if (!payload.service_date || !payload.service_type) {
        showPopup('popup-danger', 'Por favor preencha a Data e o Tipo de Serviço.');
        return;
      }
      const btn = document.getElementById('services-save-button');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ A verificar...';
      try {
        const checkUrl = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?service_date=eq.${payload.service_date}&service_type=eq.${encodeURIComponent(payload.service_type)}&n_int=eq.${payload.n_int}&corp_oper_nr=eq.${payload.corp_oper_nr}&select=id`;
        const checkResponse = await fetch(checkUrl, { method: 'GET', headers: getSupabaseHeaders() });
        const existing = await checkResponse.json();
        
        if (existing.length > 0) {
            showPopup('popup-danger', 'Já existe um registo para este elemento, neste tipo de serviço e nesta data.');
            return;
        }
        btn.innerHTML = '⏳ A guardar...';
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services`, {
            method: 'POST',
            headers: getSupabaseHeaders({ returnRepresentation: true }),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw await response.json();
        showPopup('popup-success', 'Serviço guardado com sucesso!');
        clearVolunteerForm();
      } catch (err) {
        console.error('Erro:', err);
        showPopup('popup-danger', 'Erro ao guardar.');
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
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('services-save-button')?.addEventListener('click', saveVolunteerService);
      const vsType = document.getElementById('vsType');
      const vsLocal = document.getElementById('vsLocal');
      if (vsType) {
        vsType.addEventListener('change', () => {handleVsTypeChange();applyRules();});
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
              <th colspan="3" rowspan="2" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-bottom:1px solid #aaa; padding:5px;">Data | Tipo Serviço</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor<br>Serviço</th>
              <th colspan="3" rowspan="2" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Prevenções</th>
              <th colspan="4" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Transporte Doentes</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Elemento</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor Global</th>
            </tr>
            <tr>
              <th colspan="2" style="position:sticky; top:27px; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:4px;">Doentes Extra</th>
              <th colspan="2" style="position:sticky; top:27px; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:4px;">Horas Espera</th>
            </tr>
            <tr>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-bottom:1px solid #aaa; padding:5px;">Data</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Tipo</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Prevenção/<br>Destino</th>
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
    async function loadVolunteerServicesTable() {
      const container = document.getElementById('services-table-container');
      const yearEl = document.getElementById('vsConsYear');
      const monthEl = document.getElementById('vsConsMonth');
      if (!container || !yearEl || !monthEl) return;
      if (!document.getElementById('table-body')) {
        container.innerHTML = tableHTML;
      }
      const tableBody = document.getElementById('table-body');
      const selectedYear = yearEl.value;
      const selectedMonth = monthEl.value;
      tableBody.style.opacity = "0.5";
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      let dateFilter = "";
      if (selectedMonth === "todos") {
        dateFilter = `&service_date=gte.${selectedYear}-01-01&service_date=lte.${selectedYear}-12-31`;
      } else {
        const lastDay = new Date(selectedYear, parseInt(selectedMonth), 0).getDate();
        dateFilter = `&service_date=gte.${selectedYear}-${selectedMonth}-01&service_date=lte.${selectedYear}-${selectedMonth}-${lastDay}`;
      }
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?corp_oper_nr=eq.${corpOperNr}${dateFilter}&order=service_date.desc`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error('Erro na resposta');
        const data = await response.json();
        currentVolunteerData = data;
        tableBody.style.opacity = "1";
        tableBody.innerHTML = '';
        if (data.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="13" style="padding: 20px; font-size: 13px;">Nenhum registo encontrado para este período.</td></tr>';
          const summaryContainer = document.getElementById('services-summary-container');
          if (summaryContainer) {
            summaryContainer.innerHTML = `
              <table style="border-collapse: collapse; font-family: sans-serif; font-size: 12px; margin-top: 8px;">
                <tr>
                  <td style="border: 1px solid #aaa; padding: 5px 10px; background-color: #2b6ca3; color: white; font-weight: bold;">Valor Global</td>
                  <td style="width: 100px; border: 1px solid #aaa; padding: 5px 15px; font-weight: bold; font-size: 13px; text-align: right;">0.00 €</td>
                </tr>
              </table>
            `;
          }
          return;
        }
        const rowsHTML = data.map(item => {
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
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right; font-weight: bold; font-size: 13px;">
                ${item.global_value || '0,00'} €
              </td>
            </tr>
          `;
        }).join('');
        tableBody.innerHTML = rowsHTML;
        const total = data.reduce((sum, item) => {
          const val = parseFloat(item.global_value) || 0;
          return sum + val;
        }, 0);
        const summaryContainer = document.getElementById('services-summary-container');
        if (summaryContainer) {
          summaryContainer.innerHTML = `
            <table style="border-collapse: collapse; font-family: sans-serif; font-size: 12px; margin-top: 8px;">
              <tr>
                <td style="border: 1px solid #aaa; padding: 5px 10px; background-color: #2b6ca3; color: white; font-weight: bold;">Valor Global</td>
                <td style="width: 100px; border: 1px solid #aaa; padding: 5px 15px; font-weight: bold; font-size: 13px; text-align: right;">${total.toFixed(2)} €</td>
              </tr>
            </table>
          `;
        }
      } catch (err) {
        tableBody.style.opacity = "1";
        console.error('Erro:', err);
        tableBody.innerHTML = '<tr><td colspan="13" style="padding: 20px; color: red;">Erro ao carregar dados.</td></tr>';
      }
    }
    function initializeFilters() {
      const yearSelect  = document.getElementById('vsConsYear');
      const monthSelect = document.getElementById('vsConsMonth');
      if (!yearSelect || !monthSelect) return;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      let yearsHTML = '';
      for (let year = 2026; year <= 2036; year++) {
        const isSelected = year === currentYear ? 'selected' : '';
        yearsHTML += `<option value="${year}" ${isSelected}>${year}</option>`;
      }
      yearSelect.innerHTML = yearsHTML;
      const months = [{val: 'todos', name: 'Todos os Meses'}, {val: '01', name: 'Janeiro'}, {val: '02', name: 'Fevereiro'}, {val: '03', name: 'Março'},
                      {val: '04', name: 'Abril'}, {val: '05', name: 'Maio'}, {val: '06', name: 'Junho'}, {val: '07', name: 'Julho'}, {val: '08', name: 'Agosto'},
                      {val: '09', name: 'Setembro'}, {val: '10', name: 'Outubro'}, {val: '11', name: 'Novembro'}, {val: '12', name: 'Dezembro'},];
      monthSelect.innerHTML = months.map(m => {
        const isSelected = m.val === currentMonth ? 'selected="selected"' : '';
        return `<option value="${m.val}" ${isSelected}>${m.name}</option>`;
      }).join('');
      yearSelect.value = currentYear;
      monthSelect.value = currentMonth;
      yearSelect.onchange = loadVolunteerServicesTable;
      monthSelect.onchange = loadVolunteerServicesTable;
      loadVolunteerServicesTable();
      const reportSelect = document.getElementById('vsReportSelect');
      const pdfBtn = document.getElementById('vsPDFReport');
      const excelBtn = document.getElementById('vsEXCELReport');
      pdfBtn.disabled = true;
      excelBtn.disabled = true;
      reportSelect.addEventListener('change', function () {
        const hasValue = this.value.trim() !== '';
        pdfBtn.disabled = !hasValue;
        excelBtn.disabled = !hasValue;
        pdfBtn.style.opacity = hasValue ? '1' : '0.5';
        excelBtn.style.opacity = hasValue ? '1' : '0.5';
        pdfBtn.style.cursor = hasValue ? 'pointer' : 'not-allowed';
        excelBtn.style.cursor = hasValue ? 'pointer' : 'not-allowed';
      });
    }
    /* ============= EMISSÃO ============== */
    async function generateVolunteerReport(format) {
      const year = document.getElementById('vsConsYear').value;
      const month = document.getElementById('vsConsMonth').value;
      const reportType = document.getElementById('vsReportSelect').value;
      let rows;
      if (reportType === 'Detalhado') {
        rows = currentVolunteerData;
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
      const globalTotal = currentVolunteerData.reduce((sum, item) => {
        return sum + (parseFloat(item.global_value) || 0);
      }, 0);
      const tipoRelatorio = reportType === 'Detalhado' ? 'detalhado' : 'simplificado';
      const tipoFicheiro  = format === 'pdf' ? 'PDF' : 'EXCEL';
      showLoadingPopup(`A gerar relatório de pagamentos ${tipoRelatorio} em ${tipoFicheiro}...`);
      try {
        const response = await fetch('https://cb360-online.vercel.app/api/prevpay_convert_and_send', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({rows, year, month, format, globalTotal, reportType})
        });
        if (!response.ok) {
          let errMsg = 'Erro desconhecido';
          try {
            const err = await response.json();
            errMsg = err.details || err.error || errMsg;
          } catch {
            errMsg = `Erro HTTP ${response.status}`;
          }
          hideLoadingPopup();
          alert('Erro ao gerar relatório: ' + errMsg);
          return;
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pagamento_prevencoes_${year}_${String(month).padStart(2, '0')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert('Erro de ligação: ' + e.message);
      } finally {
        hideLoadingPopup();
        document.getElementById('vsReportSelect').value = '';
        const pdfBtn = document.getElementById('vsPDFReport');
        const excelBtn = document.getElementById('vsEXCELReport');
        pdfBtn.disabled = true;
        excelBtn.disabled = true;
        pdfBtn.style.opacity = '0.5';
        excelBtn.style.opacity = '0.5';
        pdfBtn.style.cursor = 'not-allowed';
        excelBtn.style.cursor = 'not-allowed';
      }
    }
    document.getElementById('vsPDFReport').addEventListener('click', async function () {
      await generateVolunteerReport('pdf');
    });
    document.getElementById('vsEXCELReport').addEventListener('click', async function () {
      await generateVolunteerReport('excel');
    });
