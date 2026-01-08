    /* =======================================
       REFUSALS OF SERVICES AND INOPs INEM
    ======================================= */
    /* =======================================
       REFUSAL OF TRANSPORT SERVICES
    ======================================= */
    /* ========== VERIFICATION OF REFUSAL FIELDS ========== */
    function validateRequiredServiceRefusalFields() {
      const missingFields = [];
      const refusalTime = document.getElementById('service_refusal_time')?.value.trim();
      const serviceType = document.getElementById('service_refusal_type')?.value.trim();
      const refusalMotive = document.getElementById('service_refusal_motive')?.value.trim();
      const serviceOrigin = document.getElementById('service_refusal_origin')?.value.trim();
      const serviceDestination = document.getElementById('service_refusal_destination')?.value.trim();
      const optelRefusal = document.getElementById('service_refusal_optel')?.value.trim();
      const validatedRefusal = document.getElementById('service_refusal_validation')?.value.trim();
      if (!refusalTime) missingFields.push("Hora da Recusa");
      if (!serviceType) missingFields.push("Tipo de Serviço");
      if (!refusalMotive) missingFields.push("Motivo da Recusa");
      if (!serviceOrigin) missingFields.push("Origem do Serviço");
      if (!serviceDestination) missingFields.push("Destino do Serviço");
      if (!optelRefusal) missingFields.push("Optel de Serviço");
      if (!validatedRefusal) missingFields.push("Validado por");
      if (missingFields.length > 0) {
        showPopupMissingFields(missingFields);
        return false;
      }
      return true;
    }
    /* ============= INSERTION OF NEW REFUSAL ============= */
    async function insertServiceRefusal() { 
      if (!validateRequiredServiceRefusalFields()) return;
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      const payload = {
        corp_oper_nr: corpOperNr,
        refusal_date: document.getElementById('service_refusal_date').value,
        refusal_time: document.getElementById('service_refusal_time').value,
        service_type: document.getElementById('service_refusal_type').value,
        reason_for_refusal: document.getElementById('service_refusal_motive').value,
        service_origin: document.getElementById('service_refusal_origin').value,
        service_destination: document.getElementById('service_refusal_destination').value,
        optel_refusal: document.getElementById('service_refusal_optel').value,
        validated_refusal: document.getElementById('service_refusal_validation').value
      };
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showPopupSuccess("✅ Recusa de serviço registada com sucesso!");
          loadServiceRefusals();
          document.getElementById('service_refusal_time').value = '';
          document.getElementById('service_refusal_type').value = '';
          document.getElementById('service_refusal_motive').value = '';
          document.getElementById('service_refusal_origin').value = '';
          document.getElementById('service_refusal_destination').value = '';
          document.getElementById('service_refusal_optel').value = '';
          document.getElementById('service_refusal_validation').value = '';
        } else {
          const err = await res.text();
          showPopupWarning("❌ Erro ao gravar recusa:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopupWarning("❌ Erro de conexão com o servidor.");
      }
    }
    /* ================ REFUSAL ELIMINATION =============== */
    async function deleteServiceRefusal(id) {
      if (!confirm("Tem certeza que quer eliminar este registro?")) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?id=eq.${id}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (res.ok) {
          alert("✅ Registro eliminado!");
          loadServiceRefusals();
        } else {
          const err = await res.text();
          alert("❌ Erro ao eliminar registro:\n" + err);
        }
      } catch (error) {
        console.error(error);
        alert("❌ Erro de conexão com o servidor.");
      }
    }
    /* ========== FORMATTING DATES IN THE TABLE =========== */
    function ServiceRefusalsformatDate(dateStr) {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    /* ================= LOADING REFUSALS ================= */
    async function loadServiceRefusals() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        const url = `${SUPABASE_URL}/rest/v1/service_refusals?corp_oper_nr=eq.${corpOperNr}&order=refusal_date.desc`;
        const res = await fetch(url, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const tbody = document.querySelector("#service-refusals-table tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        if (data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">Não foram encontradas recusas para a corporação ${corpOperNr}.</td></tr>`;
          return;
        }
        data.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${ServiceRefusalsformatDate(item.refusal_date)}</td>
            <td>${item.refusal_time}</td>
            <td>${item.service_type}</td>
            <td>${item.service_origin}</td>
            <td>${item.service_destination}</td>
            <td>${item.reason_for_refusal}</td>
            <td>${item.optel_refusal}</td>
            <td>${item.validated_refusal}</td>
            <td style="width: 10px;"><button class="btn-delete" onclick="deleteServiceRefusal('${item.id}')">🗑️</button></td>
          `;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Erro ao carregar recusas:", error);
      }
    }
    /* ============= FILTER REFUSALS BY YEAR ============== */
    function filterServiceRefusalsByYear(year) {
      const rows = document.querySelectorAll('#service-refusals-table tbody tr');
      rows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) {
          const [day, month, yearStr] = dateCell.textContent.split('-');
          row.style.display = yearStr == year ? '' : 'none';
        }
      });
    }

    function populateRefusalsYearFilter() {
      const select = document.getElementById('refusals_year_filter');
      if (!select) return;
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }
    }
    const yearSelect = document.getElementById('refusals_year_filter');
    if (yearSelect) {
      yearSelect.addEventListener('change', function() {
        filterServiceRefusalsByYear(this.value);
      });
    }
    populateRefusalsYearFilter();
    /* ============== LOAD REFUSALS ON OPEN =============== */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId === 'page-recserv') {
          loadServiceRefusals();
        }
      });
    });
    /* =======================================
       INEM NON-OPERATIONALITY
    ======================================= */
    /* ==== VERIFICATION OF NON-OPERATIONALITY FIELDS ===== */
    function validateRequiredIneInopFields() {
      const missingFields = [];
      const ineinopDate = document.getElementById('ineinop_date')?.value.trim();
      const ineinopShift = document.getElementById('ineinop_shift')?.value.trim();
      const ineinopHourQtd = document.getElementById('ineinop_hour_qtd')?.value.trim();
      const reasonForIneInop = document.getElementById('reason_for_ineinop')?.value.trim();
      const ineinopCrew = document.getElementById('ineinop_crew')?.value.trim();
      const optelRefusal = document.getElementById('ineinop_optel')?.value.trim();
      const validatedRefusal = document.getElementById('ineinop_validation')?.value.trim();
      if (!ineinopShift) missingFields.push("Turno");
      if (!ineinopHourQtd) missingFields.push("Horas/Qtde");
      if (!reasonForIneInop) missingFields.push("Motivo");
      if (!ineinopCrew) missingFields.push("Tripulação");
      if (!optelRefusal) missingFields.push("Optel de Serviço");
      if (!validatedRefusal) missingFields.push("Validado por");
      if (missingFields.length > 0) {
        showPopupMissingFields(missingFields);
        return false;
      }
      return true;
    }
    /* ======= INSERTION OF NEW NON-OPERATIONALITY ======== */
    async function insertIneInop() {
      if (!validateRequiredIneInopFields()) return;
      const corpOperNr = localStorage.getItem('currentCorpOperNr');    
      const payload = {
        corp_oper_nr: corpOperNr,
        ineinop_date: document.getElementById('ineinop_date').value,
        ineinop_shift: document.getElementById('ineinop_shift').value,
        ineinop_hour_qtd: document.getElementById('ineinop_hour_qtd').value,
        reason_for_ineinop: document.getElementById('reason_for_ineinop').value,
        ineinop_crew: document.getElementById('ineinop_crew').value,
        optel_refusal: document.getElementById('ineinop_optel').value,
        validated_refusal: document.getElementById('ineinop_validation').value
      };    
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        });    
        if (res.ok) {
          showPopupSuccess("✅ Inoperacionalidade registada com sucesso!");
          loadIneInops();
          document.getElementById('ineinop_shift').value = '';
          document.getElementById('ineinop_hour_qtd').value = '';
          document.getElementById('reason_for_ineinop').value = '';
          document.getElementById('ineinop_crew').value = '';
          document.getElementById('ineinop_optel').value = '';
          document.getElementById('ineinop_validation').value = '';
        } else {
          const err = await res.text();
          alert("❌ Erro ao gravar inoperacionalidade:\n" + err);
        }
      } catch (error) {
        console.error(error);
        alert("❌ Erro de conexão com o servidor.");
      }
    }
    /* ============= REMOVAL OF INOPERABILITY ============= */
    async function deleteIneInop(id) {
      if (!confirm("Tem certeza que quer eliminar este registro?")) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?id=eq.${id}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (res.ok) {
          alert("✅ Registro eliminado!");
          loadIneInops();
        } else {
          const err = await res.text();
          alert("❌ Erro ao eliminar registro:\n" + err);
        }
      } catch (error) {
        console.error(error);
        alert("❌ Erro de conexão com o servidor.");
      }
    }
    /* ========== FORMATTING DATES IN THE TABLE =========== */
    function IneInopFormatDate(dateStr) {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    /* =========== LOADING NON-OPERATIONALITIES =========== */
    async function loadIneInops(yearFilter = null) {
      try {
        const corpOperNr = localStorage.getItem('currentCorpOperNr');
        let url = `${SUPABASE_URL}/rest/v1/inem_inop?corp_oper_nr=eq.${corpOperNr}&order=ineinop_date.desc`;
        if (yearFilter) url += `&ineinop_date=ilike.${yearFilter}%`;    
        const res = await fetch(url, {
          headers: getSupabaseHeaders()
        });    
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const tbody = document.querySelector("#ineinop-table tbody");
        if (!tbody) return;    
        tbody.innerHTML = "";        
        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                Não foram encontradas inoperacionalidades INEM para a corporação ${corpOperNr}.
              </td>
            </tr>`;
          return;
        }    
        data.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${IneInopFormatDate(item.ineinop_date)}</td>
            <td>${item.ineinop_shift}</td>
            <td>${item.ineinop_hour_qtd}</td>
            <td>${item.reason_for_ineinop}</td>
            <td>${item.ineinop_crew}</td>
            <td>${item.optel_refusal}</td>
            <td>${item.validated_refusal}</td>
            <td style="width: 10px;"><button class="btn-delete" onclick="deleteIneInop('${item.id}')">🗑️</button></td>
          `;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Erro ao carregar inoperacionalidades:", error);
      }
    }
    /* ======= FILTER NON-OPERATIONALITIES BY YEAR ======== */
    function filterIneInopByYear(year) {
      const rows = document.querySelectorAll('#ineinop-table tbody tr');
      rows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) {
          const [day, month, yearStr] = dateCell.textContent.split('-');
          row.style.display = yearStr == year ? '' : 'none';
        }
      });
    }

    function populateIneInopYearFilter() {
      const select = document.getElementById('ineinop_year_filter');
      if (!select) return;
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }
    }
    const ineYearSelect = document.getElementById('ineinop_year_filter');
    if (ineYearSelect) {
      ineYearSelect.addEventListener('change', function() {
        filterIneInopByYear(this.value);
      });
    }
    populateIneInopYearFilter();
    /* ======== LOAD NON-OPERATIONALITIES ON OPEN ========= */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId === 'page-ineminop') {
          loadIneInops();
        }
      });
    });
    /* =======================================
       DASHBOARD: NON-OPERATIONALITIES
       DASHBOARD: REFUSALS
    ======================================= */
    const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const charts = {};
    function groupByMonth(records, dateField) {
      const monthCounts = {};
      records.forEach(item => {
        if (!item[dateField]) return;
        const date = new Date(item[dateField]);
        if (isNaN(date)) return;
        const month = date.getMonth();
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });
      return monthCounts;
    }
    function createOrUpdateChart(canvasId, labels, data, label, color) {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      if (charts[canvasId]) {
        charts[canvasId].data.labels = labels;
        charts[canvasId].data.datasets[0].data = data;
        charts[canvasId].update();
      } else {
        charts[canvasId] = new Chart(ctx, {
          type: 'line',
          data: {labels, datasets: [{label, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, pointRadius: 5}]},
          options: {responsive: true,
            plugins: {legend: { display: true},
            tooltip: {mode: 'index', intersect: false}},
            scales: {y: {beginAtZero: true, ticks: {stepSize: 1}}}}});}}
    function createOrUpdateMultiDatasetChart(canvasId, labels, datasets) {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      if (charts[canvasId]) {
        charts[canvasId].data.labels = labels;
        charts[canvasId].data.datasets = datasets;
        charts[canvasId].update();
      } else {
        charts[canvasId] = new Chart(ctx, {
          type: 'line',
          data: {labels, datasets},
          options: {responsive: true,
            plugins: {legend: {display: true},
            tooltip: {mode: 'index', intersect: false}},
            scales: {y: {beginAtZero: true, ticks: {stepSize: 1}}}}});}}
    /* ================== SUMARY DATA ===================== */
    async function loadSummaryData() {
      try {
        const corpOperNr = localStorage.getItem('currentCorpOperNr');
        const inemRes = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?select=ineinop_shift,ineinop_hour_qtd&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!inemRes.ok) throw new Error("Falha ao carregar inem_inop");
        const inemData = await inemRes.json();    
        const parseHourQuantity = (str) => {
          if (!str) return {h: 0, m: 0};
          const [h, m] = str.split(':').map(Number);
          return {h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m};
        };    
        const sumTimes = (records) => {
          let totalH = 0, totalM = 0;
          records.forEach(r => {
            const {h, m} = parseHourQuantity(r.ineinop_hour_qtd);
            totalH += h;
            totalM += m;
          });
          totalH += Math.floor(totalM / 60);
          totalM = totalM % 60;
          return `🕒 ${totalH} Hrs. ${totalM} Mts.`;
        };    
        const dRecords = inemData.filter(r => (r.ineinop_shift || "").toUpperCase() === "D");
        const nRecords = inemData.filter(r => (r.ineinop_shift || "").toUpperCase() === "N");    
        document.getElementById("sum-inop-d").textContent = sumTimes(dRecords);
        document.getElementById("sum-inop-n").textContent = sumTimes(nRecords);
        document.getElementById("sum-inop-total").textContent = sumTimes(inemData);
        const refusalsRes = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?select=id&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });
        const refusalsData = await refusalsRes.json();
        document.getElementById("sum-refusals-total").textContent = `🤒 ${refusalsData.length}`;    
      } catch (e) {
        console.error("❌ Erro ao atualizar cards resumo:", e);
      }
    }
    /* ================== REFUSALS CHARTS ================= */
    const refusalColors = ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
                           'rgba(199, 199, 199, 0.7)', 'rgba(255, 99, 71, 0.7)', 'rgba(60, 179, 113, 0.7)', 'rgba(100, 149, 237, 0.7)', 'rgba(255, 140, 0, 0.7)', 'rgba(220, 20, 60, 0.7)',
                           'rgba(186, 85, 211, 0.7)', 'rgba(46, 139, 87, 0.7)', 'rgba(70, 130, 180, 0.7)'];
    async function loadServiceRefusalsCharts() {
      try {
        const corpOperNr = localStorage.getItem('currentCorpOperNr');
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?select=refusal_date,service_type&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!res.ok) throw new Error(await res.text());
        const registros = await res.json();
        if (!registros?.length) return;    
        const serviceTypes = [...new Set(registros.map(r => r.service_type).filter(Boolean))];
        const datasets = serviceTypes.map((type, index) => {
          const typeRecords = registros.filter(r => r.service_type === type);
          const countsByMonth = groupByMonth(typeRecords, 'refusal_date');
          const data = monthLabels.map((_, i) => countsByMonth[i] || 0);
          const color = refusalColors[index % refusalColors.length];
          return {label: type, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, pointRadius: 5};
        });    
        createOrUpdateMultiDatasetChart('chart-refusals-type', monthLabels, datasets);    
        const totalCounts = {};
        registros.forEach(r => {
          if (!r.refusal_date) return;
          const m = new Date(r.refusal_date).getMonth();
          if (!isNaN(m)) totalCounts[m] = (totalCounts[m] || 0) + 1;
        });
        const totalData = monthLabels.map((_, i) => totalCounts[i] || 0);
        createOrUpdateChart('chart-refusals-total', monthLabels, totalData, 'Total de Recusas', 'rgba(255, 159, 64, 0.7)');    
      } catch (e) {
        console.error("Erro Recusas:", e);
      }
    }
    /* ========= INEM NON-OPERATIONALITIES CHARTS ========= */
    async function loadIneInopsCharts() {
      try {
        const corpOperNr = localStorage.getItem('currentCorpOperNr');
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?select=ineinop_date,ineinop_shift&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!res.ok) throw new Error(await res.text());
        const registros = await res.json();
        if (!registros?.length) return;    
        const dShifts = registros.filter(r => r.ineinop_shift === 'D');
        const nShifts = registros.filter(r => r.ineinop_shift === 'N');
        const dCounts = groupByMonth(dShifts, 'ineinop_date');
        const nCounts = groupByMonth(nShifts, 'ineinop_date');    
        createOrUpdateChart('chart-ine-d', monthLabels, monthLabels.map((_, i) => dCounts[i] || 0), 'Inoperacionalidades D', 'rgba(75,192,192,0.6)');
        createOrUpdateChart('chart-ine-n', monthLabels, monthLabels.map((_, i) => nCounts[i] || 0), 'Inoperacionalidades N', 'rgba(255,99,132,0.6)');        
        const totalData = monthLabels.map((_, i) => (dCounts[i] || 0) + (nCounts[i] || 0));
        createOrUpdateChart('chart-ine-total', monthLabels, totalData, 'Inoperacionalidades Total', 'rgba(54,162,235,0.6)');    
      } catch (e) {
        console.error("Erro INEM Charts:", e);
      }
    }
    /* ================ LOAD DASHBORAD ==================== */
    function loadDashboardCharts() {
      loadIneInopsCharts();
      loadServiceRefusalsCharts();
      loadSummaryData()
    }
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('data-page') === 'page-dashboard') {
          loadDashboardCharts();
        }
      });
    });

