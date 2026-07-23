    // ==============================================================================
    // == 0. VARIÁVEIS GLOBAIS / CONSTANTES                                       ==
    // ==============================================================================
    let cb360Pagination = {fullData: [], resourceCounts: {}, currentPage: 1, pageSize: 25};
    let cb360IncidentMode = 'novo';
    let cb360CurrentIncident = null;
    let cb360ActiveTab = 'characterization';
    let cb360PendingClosed = false;
    let cb360DataClassification = [];
    let cb360SelectedRating = null;
    let cb360ClassActiveIndex = -1;
    let cb360BRespData = [];
    let cb360BRespSelected = null;
    let cb360BRespActiveIndex = -1;
    let cb360ResourcesVehicles = [];
    let cb360ResourcesFirefighters = [];
    let cb360ResourcesVictims = [];
    let cb360VehiclesCollapsed = false;
    let cb360FirefightersCollapsed = false;
    let cb360VehicleUnderDevelopment = null;
    let cb360LeafletMap = null;
    let cb360LeafletMarker = null;
    let cb360AddressSearchTimeout = null;
    let cb360AddressSearchController = null;
    let cb360OutOfBoundsData = [];
    let cb360OutOfBoundsSelected = null;
    let cb360OutOfBoundsActiveIndex = -1;
    let cb360EntityInvoiceData = [];
    let cb360EntityInvoiceSelected = null;
    let cb360EntityInvoiceActiveIndex = -1;
    let cb360VehicleData = [];
    let cb360VehicleSelected = null;
    let cb360VehicleActiveIndex = -1;
    let cb360CountriesCache = null;
    let cb360VehicleRegistrations = {};
    let cb360TimelineEvents = [];
    const CB360_VICTIM_CATEGORIES = ['Bombeiro', 'APC', 'Civil'];
    const CB360_VICTIM_SEVERITIES = ['Leve', 'Grave', 'Morto', 'Assistido'];
    const STATUS_COLORS = {"": "#FFF", "Alerta": "#FFE0B2", "Análise": "#FFE0B2", "Despacho": "#FFE0B2", "Despacho 1º Alerta": "#FFE0B2", "Chegada ao TO": "#FFE0B2", "Em Curso": "#FFCDD2", "Recusada": "#FFCDD2", 
                           "Em Resolução": "#BBDEFB", "Vigilância": "#BBDEFB", "Conclusão": "#C8E6C9", "Encerrada": "#C8E6C9", "Falso Alarme": "#C8E6C9", "Falso Alerta": "#C8E6C9", "Anulada": "#C8E6C9"};
    // ==============================================================================
    // == HELPERS PARTILHADOS (adicionados no refactor — sem alteração de comportamento) ==
    // ==============================================================================
    async function supaFetch(pathOrUrl, init = {}) {
      const url = pathOrUrl.startsWith('http')
        ? pathOrUrl
        : `${SUPABASE_URL}${pathOrUrl}`;
      const baseHeaders = getSupabaseHeaders();
      const headers = init.headers
        ? { ...baseHeaders, ...init.headers }
        : baseHeaders;
      return fetch(url, { ...init, headers });
    }
     // ==============================================================================
    // == 1. EVENTOS GLOBAIS                                                      ==
    // ==============================================================================
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchCb360Incidents();
      }
    });

    (function initCb360GlobalButtonHover() {
      const EXCLUDE_SELECTOR = ['.cb360-edit-btn', '.cb360-delete-btn', '.goc-vehicle-toggle', '.goc-vehicle-remove', '.goc-firefighter-toggle', '.goc-firefighter-remove', '.goc-victim-toggle',
                                '.goc-victim-remove', '.goc-posit-edit', '.goc-posit-remove', '.goc-summary-arrival-save'].join(', ');
      document.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('button');
        if (!btn || btn.matches(EXCLUDE_SELECTOR) || btn.disabled) return;
        btn.style.filter = 'brightness(0.8)';
        btn.style.transition = 'filter 0.15s';
      });
      document.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('button');
        if (!btn || btn.matches(EXCLUDE_SELECTOR)) return;
        btn.style.filter = '';
      });
    })();
    // ==============================================================================
        // == 2. SWITCHING TAB                                                        ==
    // ==============================================================================
    function switchTabCb360(tab) {
      cb360ActiveTab = tab;
      document.querySelectorAll('.goc-tab').forEach(el => {
        const ativo = el.dataset.tab === tab;
        el.style.background = ativo ? '#fff' : 'transparent';
        el.style.borderLeft = ativo ? '3px solid #2b6ecb' : '3px solid transparent';
        el.style.fontWeight = ativo ? '600' : '400';
        const arrow = el.querySelector('.goc-tab-arrow');
        if (arrow) arrow.style.display = ativo ? 'block' : 'none';
      });
      document.querySelectorAll('.goc-tab-content').forEach(el => {el.style.display = 'none';});
      const conteudo = document.getElementById(`goc-tab-content-${tab}`);
      if (conteudo) conteudo.style.display = 'block';
      if (tab === 'characterization' && cb360LeafletMap) {
        setTimeout(() => cb360LeafletMap.invalidateSize(), 100);
      }
      if (tab === 'vehicles' && !document.getElementById('goc-vehicles-table-body')) {
        renderCb360ResourcesTab();
      }
      if (tab === 'victims'  && !document.getElementById('goc-victims-table-body')) {
        renderCb360VictimsTab()
      }
      if (tab === 'communications' && !document.getElementById('goc-comm-vehicles-table-body')) {
        renderCb360CommunicationsTab();
      }
      if (tab === 'summary' && !document.getElementById('goc-summary-vehicles-table-body')) {
        renderCb360SummaryTab();
      }
      if (tab === 'timeline' && !document.getElementById('goc-timeline-list')) {
        renderCb360TimelineTab();
      }
    }
    // ==============================================================================
    // == 3. TABELA PRINCIPAL (listagem de todas as ocorrências)                  ==
    // ==============================================================================
    function formatCb360VehicleTooltipLine(detail) {
      let line = detail.vehicle || '';
      if (detail.registration) line += ` (${detail.registration})`;
      const brandModel = [detail.brand, detail.model].filter(Boolean).join(' ');
      if (brandModel) line += ` - ${brandModel}`;
      const km = (detail.kmEnd != null && detail.kmStart != null && detail.kmEnd !== '' && detail.kmStart !== '')
        ? (Number(detail.kmEnd) - Number(detail.kmStart)) : null;
      if (km !== null && !isNaN(km)) line += ` - (${km} km)`;
      return line;
    }
    function formatCb360CrewTooltipLine(detail) {
      let line = detail.nInt || '';
      if (detail.nFile) line += ` (${detail.nFile})`;
      if (detail.fullName) line += ` - ${detail.fullName}`;
      if (detail.patentAbv) line += ` - ${detail.patentAbv}`;
      return line;
    }
    function formatCb360VictimTooltipLine(detail) {
      return detail.patientName || '';
    }
    function formatCb360DurationTooltipLine(detail) {
      return `${detail.label}: ${detail.time}`;
    }
    function showCb360LineTooltip(anchorEl, details, formatter) {
      if (!details || !details.length) return;
      hideCb360LineTooltip();
      const tooltip = document.createElement('div');
      tooltip.id = 'cb360-line-tooltip';
      tooltip.style.cssText = 'position:fixed; z-index:500; background:#fff; border:1px solid #2b6ecb; border-radius:6px; padding:6px 10px; font-size:10px; font-weight:700; color:#333; box-shadow:0 2px 8px rgba(0,0,0,0.18); pointer-events:none; white-space:nowrap;';
      tooltip.innerHTML = details.map(d => formatter(d)).join('<br>');
      document.body.appendChild(tooltip);
      const rect = anchorEl.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      left = Math.max(6, Math.min(left, window.innerWidth - tooltipRect.width - 6));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${rect.top - tooltipRect.height - -4}px`;
      const anchorCenter = rect.left + (rect.width / 2);
      let arrowLeft = anchorCenter - left - 7;
      arrowLeft = Math.max(6, Math.min(arrowLeft, tooltipRect.width - 20));
      const arrowOuter = document.createElement('div');
      arrowOuter.style.cssText = `position:absolute; left:${arrowLeft}px; bottom:-7px; width:0; height:0; border-left:7px solid transparent; border-right:7px solid transparent; border-top:7px solid #2b6ecb;`;
      const arrowInner = document.createElement('div');
      arrowInner.style.cssText = `position:absolute; left:${arrowLeft + 1}px; bottom:-5.5px; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid #fff;`;
      tooltip.appendChild(arrowOuter);
      tooltip.appendChild(arrowInner);
    }
    function hideCb360LineTooltip() {
      const existing = document.getElementById('cb360-line-tooltip');
      if (existing) existing.remove();
    }
    // ---- FETCH: fetchCb360ResourceCounts() ----
    async function fetchCb360ResourceCounts(internalNumbers) {
      if (!internalNumbers.length) return {};
      try {
        const list = internalNumbers.filter(Boolean).join(',');
        if (!list) return {};
        const url = `${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?internal_number=in.(${list})&select=internal_number,vehicle,km_start,km_end,scene_arrival_time,cb_arrival_time,cb360_dispatch_crew(id,n_int)`;
        const response = await supaFetch(url, { method: 'GET' });
        const counts = {};
        const vehicleCodes = new Set();
        const crewCodes = new Set();
        if (response.ok) {
          const data = await response.json();
          data.forEach(row => {
            const key = row.internal_number;
            if (!counts[key]) counts[key] = {vehicles: 0, crew: 0, victims: 0, vehicleDetails: [], crewDetails: [], firstArrival: null, lastReturn: null};
            counts[key].vehicles += 1;
            counts[key].crew += (row.cb360_dispatch_crew?.length || 0);
            counts[key].vehicleDetails.push({vehicle: row.vehicle || '', kmStart: row.km_start, kmEnd: row.km_end});
            if (row.vehicle) vehicleCodes.add(row.vehicle);
            if (row.scene_arrival_time && (!counts[key].firstArrival || row.scene_arrival_time < counts[key].firstArrival)) {
              counts[key].firstArrival = row.scene_arrival_time;
            }
            if (row.cb_arrival_time && (!counts[key].lastReturn || row.cb_arrival_time > counts[key].lastReturn)) {
              counts[key].lastReturn = row.cb_arrival_time;
            }
            (row.cb360_dispatch_crew || []).forEach(c => {
              if (c.n_int) { counts[key].crewDetails.push({nInt: c.n_int}); crewCodes.add(c.n_int); }
            });
          });
        }
        if (vehicleCodes.size) {
          const codesList = Array.from(vehicleCodes).join(',');
          const vehiclesUrl = `${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=in.(${codesList})&select=vehicle,vehicle_registration,vehicle_brand,vehicle_model`;
          const vehiclesResponse = await supaFetch(vehiclesUrl, { method: 'GET' });
          if (vehiclesResponse.ok) {
            const vehiclesData = await vehiclesResponse.json();
            const vehicleInfoMap = {};
            vehiclesData.forEach(v => { vehicleInfoMap[v.vehicle] = v; });
            Object.values(counts).forEach(entry => {
            entry.vehicleDetails.forEach(detail => {
            const info = vehicleInfoMap[detail.vehicle];
            detail.registration = info?.vehicle_registration || '';
            detail.brand = info?.vehicle_brand || '';
            detail.model = info?.vehicle_model || '';
          });
        });
      }
    }
    if (crewCodes.size) {
      const crewCodesList = Array.from(crewCodes).join(',');
      const crewInfoUrl = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=in.(${crewCodesList})&select=n_int,n_file,full_name,patent_abv`;
      const crewInfoResponse = await supaFetch(crewInfoUrl, { method: 'GET' });
      if (crewInfoResponse.ok) {
        const crewInfoData = await crewInfoResponse.json();
        const crewInfoMap = {};
        crewInfoData.forEach(c => { crewInfoMap[c.n_int] = c; });
        Object.values(counts).forEach(entry => {
          entry.crewDetails.forEach(detail => {
            const info = crewInfoMap[detail.nInt];
            detail.nFile = info?.n_file || '';
            detail.fullName = info?.full_name || '';
            detail.patentAbv = info?.patent_abv || '';
          });
        });
      }
    }
    const victimsUrl = `${SUPABASE_URL}/rest/v1/cb360_victims?internal_number=in.(${list})&select=internal_number,patient_name`;
    const victimsResponse = await supaFetch(victimsUrl, { method: 'GET' });
    if (victimsResponse.ok) {
      const victimsData = await victimsResponse.json();
      victimsData.forEach(row => {
        const key = row.internal_number;
        if (!counts[key]) counts[key] = {vehicles: 0, crew: 0, victims: 0, vehicleDetails: [], crewDetails: [], victimDetails: [], firstArrival: null, lastReturn: null};
        counts[key].victims += 1;
        if (!counts[key].victimDetails) counts[key].victimDetails = [];
        counts[key].victimDetails.push({patientName: row.patient_name || 'Sem nome'});
      });
    }
    return counts;
      } catch (err) {
        console.error('Erro fetchCb360ResourceCounts:', err);
        return {};
      }
    }
    // ---- FETCH: fetchCb360Incidents() ----
    async function fetchCb360Incidents(filters) {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        let url = `${SUPABASE_URL}/rest/v1/cb360_incidents?select=*&order=internal_number.desc`;
        if (corpOperNr) url += `&corp_oper_nr=eq.${corpOperNr}`;
        if (filters.periodFrom) url += `&alert_date=gte.${filters.periodFrom}`;
        if (filters.periodTo) url += `&alert_date=lte.${filters.periodTo}`;
        if (filters.species) url += `&classification=like.${filters.species}*`;
        if (filters.alertSource) url += `&caller=eq.${filters.alertSource}`;
        if (filters.risk) url += `&risk=eq.${filters.risk}`;
        if (filters.state) url += `&status=eq.${(filters.state)}`;
        if (filters.aap) {
          const isOutside = filters.aap === 'Fora' ? 'true' : 'false';
          url += `&outside_area=eq.${isOutside}`;
        }
        const response = await supaFetch(url, { method: 'GET' });
        return response.ok ? await response.json() : [];
      } catch (err) {
        console.error('Erro fetchCb360Incidents:', err);
        return [];
      }
    }
    // ---- INITIALIZE (combobox de filtro Espécie): loadCb360SpeciesOptions() ----
    async function loadCb360SpeciesOptions() {
      const select = document.getElementById('cb360-input-species');
      if (!select) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/class_occorr?select=gen_class&gen_class=not.is.null`;
        const response = await supaFetch(url, { method: 'GET' });
        if (!response.ok) return;
        const data = await response.json();
        const uniqueValues = [...new Set(data.map(row => row.gen_class).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt'));
        select.innerHTML = '<option value=""></option>' +
        uniqueValues.map(val => {
          const code = val.split(' - ')[0].trim();
          return `<option value="${code}">${val}</option>`;
        }).join('');
      } catch (err) {
        console.error('Erro loadCb360SpeciesOptions:', err);
      }
    }
    // ---- RENDER: renderCb360RedundPage() ----
    function renderCb360RedundPage() {
      const page = document.getElementById('page-cb360-redund');
      if (!page) return;
      const body = page.querySelector('.major-card-body');
      const footer = page.querySelector('.major-card-footer');
      const selectStyle = 'padding:0 8px; border:1px solid #ccc; border-radius:4px; height:25px; line-height:25px; box-sizing:border-box; font-size:11px;';  
      body.innerHTML = `
        <style>
          #cb360-table-container::-webkit-scrollbar {width: 8px; height: 8px;}
          #cb360-table-container::-webkit-scrollbar-track {background: #f0f0f0; border-radius: 10px;}
          #cb360-table-container::-webkit-scrollbar-thumb {background: linear-gradient(180deg, #b0b0b0, #888); border-radius: 10px; border: 2px solid #f0f0f0;}
          #cb360-table-container::-webkit-scrollbar-thumb:hover {background: linear-gradient(180deg, #999, #6b6b6b);}
          .cb360-edit-btn:hover i, .goc-vehicle-toggle:hover i, .goc-firefighter-toggle:hover i, .goc-victim-toggle:hover i {color: #1a4d8f;}
          .cb360-delete-btn:hover i, .goc-vehicle-remove:hover i, .goc-firefighter-remove:hover i, .goc-victim-remove:hover i {color: #a94442;}
        </style>
        <div id="cb360-filters" style="display:flex; flex-direction:column; gap:5px; padding:10px 0; position:relative;">
          <div style="display:flex; align-items:center; gap:100px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="width:60px; font-weight:600; font-size:12px;">Pesquisa:</label>
              <input type="text" id="cb360-input-search" style="${selectStyle} width:250px;">
            </div>
            <div style="display:flex; align-items:center;">
              <button id="cb360-toggle-dia" class="cb360-period-toggle" data-period="dia" style="padding:0 14px; height:25px; line-height:23px; box-sizing:border-box; border:1px solid #2b6ecb; background:#2b6ecb; color:#fff; font-size:12.5px; font-weight:600; cursor:pointer; border-radius:4px 0 0 4px;" onclick="setDateFilter('day')"><i class="fa fa-indent fa-sm"></i> Dia</button>
              <button id="cb360-toggle-mes" class="cb360-period-toggle" data-period="mes" style="padding:0 14px; height:25px; line-height:23px; box-sizing:border-box; border:1px solid #ccc; border-left:none; background:#fff; color:#333; font-size:12.5px; font-weight:600; cursor:pointer;" onclick="setDateFilter('month')"><i class="fa fa-list-ul fa-sm"></i> Mês</button>
              <button id="cb360-toggle-ano" class="cb360-period-toggle" data-period="ano" style="padding:0 14px; height:25px; line-height:23px; box-sizing:border-box; border:1px solid #ccc; border-left:none; background:#fff; color:#333; font-size:12.5px; font-weight:600; cursor:pointer; border-radius:0 4px 4px 0;" onclick="setDateFilter('year')"><i class="fa fa-list fa-sm"></i> Ano</button>
            </div>
            <div id="cb360-period-fields" style="display:flex; align-items:center; gap:12px;">
              <div id="cb360-period-day-fields" style="display:flex; align-items:center; gap:12px;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <label style="font-weight:600; font-size:13px;">De:</label>
                  <input type="date" id="cb360-input-period-from" style="${selectStyle}">
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <label style="font-weight:600; font-size:13px;">Até:</label>
                  <input type="date" id="cb360-input-period-to" style="${selectStyle}">
                </div>
              </div>
              <div id="cb360-period-month-fields" style="display:none; align-items:center; gap:6px;">
                <label style="font-weight:600; font-size:13px;">Mês:</label>
                <select id="cb360-input-month" style="${selectStyle}">
                  <option value="1">Janeiro</option><option value="2">Fevereiro</option><option value="3">Março</option><option value="4">Abril</option><option value="5">Maio</option><option value="6">Junho</option>
                  <option value="7">Julho</option><option value="8">Agosto</option><option value="9">Setembro</option><option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
                </select>
                <select id="cb360-input-year-month" style="${selectStyle}"></select>
              </div>
              <div id="cb360-period-year-fields" style="display:none; align-items:center; gap:6px;">
                <label style="font-weight:600; font-size:13px;">Ano:</label>
                <select id="cb360-input-year" style="${selectStyle}"></select>
              </div>
            </div>            
          </div>
          <div style="display:flex; align-items:center; flex-wrap:wrap;">  
            <div style="display:flex; align-items:center; gap:8px; height:25px; margin-right:15px;">
              <label style="width:60px; font-weight:600; font-size:12px;">Espécie:</label>
              <select id="cb360-input-species" style="${selectStyle} width:250px;">
                <option value=""></option>
              </select>
            </div>  
            <div style="display:flex; align-items:center; gap:5px; height:25px; margin-right:3px;">
              <label style="font-weight:600; font-size:12px;">Fonte Alerta:</label>
              <select id="cb360-input-alert-source" style="${selectStyle} width:200px;">
                <option value=""></option>
              </select>
            </div>  
            <div style="display:flex; align-items:center; height:25px; margin-right:3px;">
              <select id="cb360-select-risk" style="${selectStyle} width:110px;">
                <option value=""></option>
                <option value="Reduzido">Reduzido</option>
                <option value="Moderado">Moderado</option>
                <option value="Elevado">Elevado</option>
              </select>
            </div>  
            <div style="display:flex; align-items:center; height:25px; margin-right:25px;">
              <select id="cb360-select-state" style="${selectStyle} width:110px;">
                <option value=""></option><option value="Em Curso">Em Curso</option>
                <option value="Encerrada">Encerrada</option><option value="Recusada">Recusada</option>
              </select>
            </div>
            <div style="display:flex; align-items:center; gap:5px; height:25px; margin-right:25px;">
              <label style="font-weight:600; font-size:12px;">AAP:</label>
              <select id="cb360-input-aap" style="${selectStyle} width:100px;">
                <option value=""></option><option value="Dentro">Dentro</option><option value="Fora">Fora</option>
              </select>
            </div>  
            <div style="display:flex; align-items:center; gap:5px; height:25px;">
              <label style="font-weight:600; font-size:12px;">Relatório:</label>
              <select id="cb360-input-report" style="${selectStyle} width:150px;">
                <option value=""></option><option value="Por Fazer">Por Fazer</option>
                <option value="Por Finalizar">Por Finalizar</option><option value="Finalizado">Finalizado</option>
              </select>
            </div>
          </div>
        </div>
        <div style="position:absolute; right:100px; margin-top: 40px; transform:translateY(-50%);">
          <button id="cb360-btn-search" title="Pesquisar" style="background:transparent; color:#17a2b8; border:none; width:38px; height:38px; border-radius:6px; font-size:30px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fa fa-search"></i></button>
        </div>
        <div id="cb360-table-container" style="overflow-x:auto; margin-top:24px; overflow-y:auto; max-height:411px; overscroll-behavior:contain; position:relative; border:1px solid #c4c4c4; border-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,0.12);">
          <table id="cb360-tabela-ocorrencias" style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px; text-align:center; margin-bottom:0;">
            <thead>
              <tr>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:90px;">N° Interno</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:90px;">N° SADO</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:90px;">N° CODU</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:100px;">Data Alerta</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:60px;">H. Saída</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:250px;">Nome Alerta/Pedido</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Morada</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:60px;">Cód. Serviço</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:130px;">Estado</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:60px; font-size:16px;"><i class="fa-solid fa-truck"></i></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:60px; font-size:16px;"><i class="fa-solid fa-helmet-safety"></i></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:60px; font-size:16px;"><i class="fa-solid fa-kit-medical"></i></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:50px;"><i class="fa fa-file-text fa-lg igreen"></i></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:50px;"></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:35px;"></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:35px;"></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:35px;"></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:50px;"></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; width:50px;"></th>
              </tr>
            </thead>
            <tbody id="cb360-table-body"></tbody>
          </table>
        </div>
        <div id="cb360-table-footer" style="margin-top:0; padding-top:16px;">
          <div style="position:relative; display:flex; align-items:center; min-height:25px;">
            <div id="cb360-register-counter" style="font-size:14px; color:#555; font-weight:600;">
              Registos: 0 a 0 de 0
            </div>
            <div id="cb360-pagination-controls" style="position:absolute; left:50%; top:50%; transform:translate(-50%, -50%); display:flex; align-items:center; gap:10px;">
              <button id="cb360-page-prev" style="background:#eee; border:1px solid #ccc; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:12px;"><i class="fa-solid fa-chevron-left"></i></button>
              <span id="cb360-page-indicator" style="font-size:12px; font-weight:600; color:#555;">Página 1 de 1</span>
              <button id="cb360-page-next" style="background:#eee; border:1px solid #ccc; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:12px;"><i class="fa-solid fa-chevron-right"></i></button>
              <select id="cb360-page-size" style="${selectStyle} width:90px; margin-left:15px;">
                <option value="25">25 / pág.</option>
                <option value="50" selected>50 / pág.</option>
                <option value="100">100 / pág.</option>
              </select>
            </div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin:50px 0 20px 0;">
            <div id="cb360-register-export" style="display:flex; align-items:center; gap:10px; font-size:14px; color:#555; font-weight:600; cursor:pointer;">
              <span>Exportar</span><i class="fa-solid fa-file-excel" style="font-size:18px; color:#217346;"></i>
            </div>
            <div style="display:flex; gap:10px; justify-content:center; flex-grow:1;">
              <button id="cb360-btn-ocorrence-list" style="background:#5c93e0; color:#fff; border:none; padding:9px 26px; border-radius:5px; font-weight:600; cursor:pointer;"><i class="fa fa-globe fa-lg"></i>&nbsp;&nbsp;Mapa de Ocorrências</button>
              <button id="cb360-btn-new" style="background:#2b6ecb; color:#fff; border:none; padding:9px 26px; border-radius:5px; font-weight:600; cursor:pointer;"><i class="fa-regular fa-file"></i>&nbsp;&nbsp;Novo</button>
              <button id="cb360-btn-print" style="background:#2b6ecb; color:#fff; border:none; padding:9px 26px; border-radius:5px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-print"></i>&nbsp;&nbsp;Imprimir</button>
              <button id="cb360-btn-close" style="background:#f0ad4e; color:#fff; border:none; padding:9px 26px; border-radius:5px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button>
            </div>
          </div>
        </div>
      `;
      footer.innerHTML = "";
      body.querySelectorAll('input, select, textarea').forEach(el => {
        const originalBorder = el.style.border;
        const originalBoxShadow = el.style.boxShadow;
        el.addEventListener('focus', () => {
          el.style.outline = 'none';
          el.style.border = '1px solid #d9534f';
          el.style.boxShadow = '0 0 4px rgba(217, 83, 79, 0.3)';
          el.style.transition = 'border-color 0.2s, box-shadow 0.2s';
        });
        el.addEventListener('blur', () => {
          el.style.border = originalBorder;
          el.style.boxShadow = originalBoxShadow;
        });
      });
      document.getElementById('cb360-btn-search').addEventListener('click', searchCb360Incidents);
      document.getElementById('cb360-btn-new').addEventListener('click', () => openCb360Incidents('novo'));
      document.getElementById('cb360-btn-ocorrence-list').addEventListener('click', () => {
        openCb360ActiveIncidentsMapModal();
      });
      document.querySelectorAll('.cb360-period-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.cb360-period-toggle').forEach(b => {
            b.style.background = '#fff';
            b.style.color = '#333';
            b.style.borderColor = '#ccc';
          });
          btn.style.background = '#2b6ecb';
          btn.style.color = '#fff';
          btn.style.borderColor = '#2b6ecb';
        });
      });
      document.getElementById('cb360-page-prev').addEventListener('click', () => {
        if (cb360Pagination.currentPage > 1) {
          cb360Pagination.currentPage--;
          renderCb360Page();
        }
      });
      document.getElementById('cb360-page-next').addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(cb360Pagination.fullData.length / cb360Pagination.pageSize));
        if (cb360Pagination.currentPage < totalPages) {
          cb360Pagination.currentPage++;
          renderCb360Page();
        }
      });
      document.getElementById('cb360-page-size').addEventListener('change', (e) => {
        cb360Pagination.pageSize = parseInt(e.target.value, 10) || 50;
        cb360Pagination.currentPage = 1;
        renderCb360Page();
      });
      populateCb360YearSelects();
      document.getElementById('cb360-input-month').addEventListener('change', applyCb360MonthFilter);
      document.getElementById('cb360-input-year-month').addEventListener('change', applyCb360MonthFilter);
      document.getElementById('cb360-input-year').addEventListener('change', applyCb360YearFilter);
      ['cb360-input-species', 'cb360-input-alert-source', 'cb360-select-risk', 'cb360-select-state', 'cb360-input-aap', 'cb360-input-report']
        .forEach(id => {
          document.getElementById(id).addEventListener('change', searchCb360Incidents);
      });
      loadStaticOptionsIntoSelect('alert_source', 'cb360-input-alert-source');
      loadCb360SpeciesOptions();
      setDateFilter('day');
    }
    // ---- RENDER: renderCb360Page() ----
    function renderCb360Page() {
      const {fullData, resourceCounts, currentPage, pageSize} = cb360Pagination;
      const totalRegisters = fullData.length;
      const totalPages = Math.max(1, Math.ceil(totalRegisters / pageSize));
      const safePage = Math.min(currentPage, totalPages);
      cb360Pagination.currentPage = safePage;
      const startIdx = (safePage - 1) * pageSize;
      const endIdx = Math.min(startIdx + pageSize, totalRegisters);
      const pageItems = fullData.slice(startIdx, endIdx);
      renderCb360Lines(pageItems, resourceCounts);
      const counter = document.getElementById('cb360-register-counter');
      if (counter) {
      counter.innerText = totalRegisters === 0
        ? "Nenhum registo encontrado"
        : `Registos: ${startIdx + 1} a ${endIdx} de ${totalRegisters}`;
      }
      const pageIndicator = document.getElementById('cb360-page-indicator');
      if (pageIndicator) pageIndicator.textContent = `Página ${safePage} de ${totalPages}`;
      const prevBtn = document.getElementById('cb360-page-prev');
      const nextBtn = document.getElementById('cb360-page-next');
      if (prevBtn) {
        prevBtn.disabled = safePage <= 1;
        prevBtn.style.opacity = safePage <= 1 ? '0.5' : '1';
        prevBtn.style.cursor = safePage <= 1 ? 'not-allowed' : 'pointer';
      }
      if (nextBtn) {
        nextBtn.disabled = safePage >= totalPages;
        nextBtn.style.opacity = safePage >= totalPages ? '0.5' : '1';
        nextBtn.style.cursor = safePage >= totalPages ? 'not-allowed' : 'pointer';
      }
    }
    // ---- RENDER: renderCb360Lines() ----
    function renderCb360Lines(incidents, resourceCounts = {}) {      
      const tbody = document.getElementById('cb360-table-body');
      const cellPadding = '2px 4px';
      tbody.innerHTML = incidents.length ? incidents.map(oc => {
        let formattedDate = "";
        if (oc.alert_date) {
          const [year, month, day] = oc.alert_date.split('-');
          formattedDate = `${day}-${month}-${year}`;
        }
        const alertHour = oc.alert_time ? oc.alert_time.substring(0, 5) : "--:--";
        const exitHour = oc.exit_time ? oc.exit_time.substring(0, 5) : "--:--";
        const counts = resourceCounts[oc.internal_number] || {vehicles: 0, crew: 0, victims: 0};
        const statusColor = STATUS_COLORS[oc.status] || "#f0f0f0";
        const isClosedRow = ['Encerrada', 'Falso Alarme', 'Falso Alerta', 'Anulada', 'Recusada'].includes(oc.status);
        const bl = 'border-left:0px solid #c4c4c4;';
        const br = 'border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;';
        return `          
          <tr>
            <td style="padding:6px; ${bl} ${br} text-align:center;">
              <a href="#" class="cb360-internal-link" data-id="${oc.id ?? ''}" style="color:#2b6ecb; text-decoration:none; font-size: 12px; font-weight: 700;">${oc.internal_number || ''}</a>
            </td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500;">${oc.sado_number || ''}</td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500;">${oc.codu || ''}</td>
            <td style="${cellPadding}; ${br} color:#2b6ecb; text-align:center; font-size: 12px; font-weight: 700;">${formattedDate}<br>${alertHour}</td>
            <td style="${cellPadding}; ${br} color:#2b6ecb; text-align:center; font-size: 12px; font-weight: 700;">${exitHour}</td>
            <td style="${cellPadding}; padding-left: 10px; ${br} color:#2b6ecb; text-align:left; font-size: 12px; font-weight: 700;">${oc.caller || ''}</td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500;">${oc.address || ''}</td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500;">${oc.classification || ''}</td>            
            <td style="${cellPadding}; ${br} background:${statusColor}; text-align:center; font-size:11px; font-weight:600;">${oc.status || ''}</td>
            <td class="cb360-vehicle-cell" data-internal="${oc.internal_number || ''}" style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500; cursor:${counts.vehicles ? 'pointer' : 'default'};">${counts.vehicles} <i class="fa-solid fa-truck"style="font-size:14px;"></i></td>
            <td class="cb360-crew-cell" data-internal="${oc.internal_number || ''}" style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500; cursor:${counts.crew ? 'pointer' : 'default'};">${counts.crew} <i class="fa-solid fa-helmet-safety"style="font-size:14px;"></i></td>
            <td class="cb360-victim-cell" data-internal="${oc.internal_number || ''}" style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500; cursor:${counts.victims ? 'pointer' : 'default'};">${counts.victims} <i class="fa-solid fa-kit-medical" style="font-size:14px;"></i></td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 500;"><i class="fa-regular fa-file" style="font-size: 16px; font-weight: 700; color: red;"></i></td>
            <td class="cb360-duration-cell" data-internal="${oc.internal_number || ''}" style="${cellPadding}; ${br} text-align:center; font-size: 16px; font-weight: 700; cursor:${isClosedRow ? 'pointer' : 'default'};">${isClosedRow ? '<i class="fa-solid fa-circle-info"></i>' : ''}</td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 700;"></td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 700;"></td>
            <td style="${cellPadding}; ${br} text-align:center; font-size: 12px; font-weight: 700;"></td>
            <td style="${cellPadding}; ${br} text-align:center;">
              <button class="cb360-edit-btn" data-id="${oc.id ?? ''}" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; font-size:14px;"><i class="fa-solid fa-pencil"></i></button>
            </td>
            <td style="${cellPadding}; ${br} text-align:center;">
              <button class="cb360-delete-btn" data-id="${oc.id ?? ''}" data-internal="${oc.internal_number || ''}" style="background:transparent; border:none; color:#d9534f; cursor:pointer; font-size:14px;"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `;
        }).join('') : `
        <tr>
          <td colspan="19" style="padding:20px; border:1px solid #c4c4c4; text-align:center; color:#888;">
            Sem registos para apresentar.
          </td>
        </tr>
      `;
      document.querySelectorAll('.cb360-vehicle-cell').forEach(cell => {
        const details = (resourceCounts[cell.dataset.internal]?.vehicleDetails) || [];
        if (!details.length) return;
        cell.addEventListener('mouseenter', () => showCb360LineTooltip(cell, details, formatCb360VehicleTooltipLine));
        cell.addEventListener('mouseleave', hideCb360LineTooltip);
      });
      document.querySelectorAll('.cb360-crew-cell').forEach(cell => {
        const details = (resourceCounts[cell.dataset.internal]?.crewDetails) || [];
        if (!details.length) return;
        cell.addEventListener('mouseenter', () => showCb360LineTooltip(cell, details, formatCb360CrewTooltipLine));
        cell.addEventListener('mouseleave', hideCb360LineTooltip);
      });
      document.querySelectorAll('.cb360-victim-cell').forEach(cell => {
        const details = (resourceCounts[cell.dataset.internal]?.victimDetails) || [];
        if (!details.length) return;
        cell.addEventListener('mouseenter', () => showCb360LineTooltip(cell, details, formatCb360VictimTooltipLine));
        cell.addEventListener('mouseleave', hideCb360LineTooltip);
      });
      document.querySelectorAll('.cb360-duration-cell').forEach(cell => {
        const info = resourceCounts[cell.dataset.internal];
        if (!info || (!info.firstArrival && !info.lastReturn)) return;
        const details = [
          {label: 'Hora Chegada', time: info.firstArrival ? info.firstArrival.substring(0, 5) : '--:--'},
          {label: 'Hora Regresso', time: info.lastReturn ? info.lastReturn.substring(0, 5) : '--:--'}
        ];
        cell.addEventListener('mouseenter', () => showCb360LineTooltip(cell, details, formatCb360DurationTooltipLine));
        cell.addEventListener('mouseleave', hideCb360LineTooltip);
      });
      document.querySelectorAll('.cb360-internal-link, .cb360-edit-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const id = el.dataset.id;
          const incident = incidents.find(o => o.id == id);
          openCb360Incidents('editar', incident);
        });
      });
      document.querySelectorAll('.cb360-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const internalNumber = btn.dataset.internal;
          const confirmMsg = `Tem a certeza que pretende eliminar a ocorrência "${internalNumber}"? Esta ação remove também todas as viaturas, bombeiros e vítimas associados e não pode ser revertida.`;
          if (!confirm(confirmMsg)) return;
          btn.disabled = true;
          await deleteCb360Occorrence(id, internalNumber, btn);
        });
      });
    }
    // ---- SEARCH: searchCb360Incidents() ----
    async function searchCb360Incidents() {
      const filters = {search: document.getElementById('cb360-input-search').value.trim(),  periodFrom: document.getElementById('cb360-input-period-from').value, periodTo: document.getElementById('cb360-input-period-to').value, 
                       species: document.getElementById('cb360-input-species').value, alertSource: document.getElementById('cb360-input-alert-source').value, risk: document.getElementById('cb360-select-risk').value,
                       state: document.getElementById('cb360-select-state').value, aap: document.getElementById('cb360-input-aap').value, report: document.getElementById('cb360-input-report').value
                      };
      const incidents = await fetchCb360Incidents(filters);
      const resourceCounts = await fetchCb360ResourceCounts(incidents.map(oc => oc.internal_number));
      cb360Pagination.fullData = incidents;
      cb360Pagination.resourceCounts = resourceCounts;
      cb360Pagination.currentPage = 1;
      renderCb360Page();
    }
    // ---- HELPERS: pad2() / toLocalISODate() ----
    function pad2(n) { return String(n).padStart(2, '0'); }
    function toLocalISODate(d) {
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    }
    // ---- INITIALIZE: populateCb360YearSelects() ----
    function populateCb360YearSelects() {
      const startYear = 2026;
      const endYear = 2036;
      const optionsHtml = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
        .map(y => `<option value="${y}">${y}</option>`)
        .join('');
      const yearMonthSelect = document.getElementById('cb360-input-year-month');
      const yearSelect = document.getElementById('cb360-input-year');
      if (yearMonthSelect) yearMonthSelect.innerHTML = optionsHtml;
      if (yearSelect) yearSelect.innerHTML = optionsHtml;
    }
    // ---- FILTROS: applyCb360MonthFilter() / applyCb360YearFilter()
    function applyCb360MonthFilter() {
      const month = parseInt(document.getElementById('cb360-input-month').value, 10);
      const year = parseInt(document.getElementById('cb360-input-year-month').value, 10);
      const from = new Date(year, month - 1, 1);
      const to = new Date(year, month, 0);
      document.getElementById('cb360-input-period-from').value = toLocalISODate(from);
      document.getElementById('cb360-input-period-to').value = toLocalISODate(to);
      searchCb360Incidents();
    }
    function applyCb360YearFilter() {
      const year = parseInt(document.getElementById('cb360-input-year').value, 10);
      const from = new Date(year, 0, 1);
      const to = new Date(year, 11, 31);
      document.getElementById('cb360-input-period-from').value = toLocalISODate(from);
      document.getElementById('cb360-input-period-to').value = toLocalISODate(to);
      searchCb360Incidents();
    }
    function updateCb360PeriodToggleStyle(period) {
      const map = {day: 'cb360-toggle-dia', month: 'cb360-toggle-mes', year: 'cb360-toggle-ano'};
      Object.entries(map).forEach(([key, id]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const active = key === period;
        btn.style.background = active ? '#2b6ecb' : '#fff';
        btn.style.color = active ? '#fff' : '#333';
        btn.style.borderColor = active ? '#2b6ecb' : '#ccc';
      });
    }
    function setDateFilter(period) {
      document.getElementById('cb360-period-day-fields').style.display = period === 'day' ? 'flex' : 'none';
      document.getElementById('cb360-period-month-fields').style.display = period === 'month' ? 'flex' : 'none';
      document.getElementById('cb360-period-year-fields').style.display = period === 'year' ? 'flex' : 'none';
      updateCb360PeriodToggleStyle(period);
      const now = new Date();
      if (period === 'day') {
        const today = toLocalISODate(now);
        document.getElementById('cb360-input-period-from').value = today;
        document.getElementById('cb360-input-period-to').value = today;
        searchCb360Incidents();
      } else if (period === 'month') {
        document.getElementById('cb360-input-month').value = String(now.getMonth() + 1);
        document.getElementById('cb360-input-year-month').value = String(now.getFullYear());
        applyCb360MonthFilter();
      } else if (period === 'year') {
        document.getElementById('cb360-input-year').value = String(now.getFullYear());
        applyCb360YearFilter();
      }
    }
    // ---- DELETE: deleteCb360Ocorrencia() ----
    async function deleteCb360Occorrence(id, internalNumber, btn) {
      try {
        const victimsDeleteResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_victims?internal_number=eq.${internalNumber}`, { method: "DELETE" });
        if (!victimsDeleteResp.ok) {
          console.error('Erro ao apagar vítimas associadas:', await victimsDeleteResp.text());
          showPopup('popup-danger', `Erro ao apagar as vítimas associadas. A ocorrência não foi removida.`);
          if (btn) btn.disabled = false;
          return;
        }
        const crewDeleteResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?internal_number=eq.${internalNumber}`, { method: "DELETE" });
        if (!crewDeleteResp.ok) {
          console.error('Erro ao apagar bombeiros associados:', await crewDeleteResp.text());
          showPopup('popup-danger', `Erro ao apagar os bombeiros associados. A ocorrência não foi removida.`);
          if (btn) btn.disabled = false;
          return;
        }
        const timelineDeleteResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_timeline_events?internal_number=eq.${internalNumber}`, { method: "DELETE" });
        if (!timelineDeleteResp.ok) {
          console.error('Erro ao apagar eventos da fita do tempo:', await timelineDeleteResp.text());
          showPopup('popup-danger', `Erro ao apagar a fita do tempo associada. A ocorrência não foi removida.`);
          if (btn) btn.disabled = false;
          return;
        }
        const vehiclesDeleteResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?internal_number=eq.${internalNumber}`, { method: "DELETE" });
        if (!vehiclesDeleteResp.ok) {
          console.error('Erro ao apagar viaturas associadas:', await vehiclesDeleteResp.text());
          showPopup('popup-danger', `Erro ao apagar as viaturas associadas. A ocorrência não foi removida.`);
          if (btn) btn.disabled = false;
          return;
        }
        const incidentDeleteResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_incidents?id=eq.${id}`, { method: "DELETE" });
        if (!incidentDeleteResp.ok) {
          console.error('Erro ao apagar ocorrência:', await incidentDeleteResp.text());
          showPopup('popup-danger', `Erro ao apagar a ocorrência.`);
          if (btn) btn.disabled = false;
          return;
        }
        cb360Pagination.fullData = cb360Pagination.fullData.filter(o => o.id != id);
        delete cb360Pagination.resourceCounts[internalNumber];
        showPopup('popup-success', `Ocorrência e todos os dados associados eliminados com sucesso.`);
        renderCb360Page();
      } catch (err) {
        console.error('Erro crítico ao eliminar ocorrência:', err);
        showPopup('popup-danger', `Erro de rede ao eliminar a ocorrência.`);
        if (btn) btn.disabled = false;
      }
    }
    async function openCb360ActiveIncidentsMapModal() {
      let modal = document.getElementById('goc-map-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'goc-map-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;';
        modal.innerHTML = `
          <div style="background:#fff; width:80%; height:80%; border-radius:6px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            <div style="background:#2b6ecb; color:#fff; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; font-weight:600;">
              <span>Ocorrências em Curso - Mapa Geral</span>
              <button id="goc-close-map-modal" style="background:transparent; border:none; color:#fff; font-size:18px; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="goc-modal-map-container" style="flex:1; width:100%;"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('goc-close-map-modal').addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      modal.style.display = 'flex';
      if (!window.cb360ModalMap) {
        window.cb360ModalMap = L.map('goc-modal-map-container').setView([38.736946, -9.142685], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.cb360ModalMap);
      } else {
        window.cb360ModalMap.invalidateSize();
      }
      try {
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_incidents?corp_oper_nr=eq.${currentCorpOperNr}&is_closed=eq.false`, { method: 'GET' });
        if (!response.ok) throw new Error('Erro ao carregar ocorrências ativas');
        const activeIncidents = await response.json();
        if (window.cb360MarkerClusterGroup) {
          window.cb360ModalMap.removeLayer(window.cb360MarkerClusterGroup);
        }
        window.cb360MarkerClusterGroup = L.markerClusterGroup({
          maxClusterRadius: 5,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false
        });
        const pulsePinIcon = L.divIcon({
          className: 'custom-exact-pulse-pin',
          html: `
            <div style="position: relative; width: 32px; height: 42px;">
              <svg viewBox="0 0 384 512" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; fill: #ff0033; animation: pin-pulse-wave 1.5s infinite; transform-origin: bottom center; z-index: 1;">
                <path d="M172.268 501.67C26.97 291.03 0 269.41 0 192 0 85.96 85.96 0 192 0s192 85.96 192 192c0 77.41-26.97 99.03-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
              </svg>
              <div style="position: relative; width: 32px; height: 42px; z-index: 2;">
                <svg viewBox="0 0 384 512" style="width: 100%; height: 100%; fill: #ff0033; filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4));">
                  <path d="M172.268 501.67C26.97 291.03 0 269.41 0 192 0 85.96 85.96 0 192 0s192 85.96 192 192c0 77.41-26.97 99.03-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
                </svg>
                <i class="fa-solid fa-fire" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: white; font-size: 14px;"></i>
              </div>
            </div>
            <style>
              @keyframes pin-pulse-wave {
                0% { transform: scale(1); opacity: 0.8; }
                70% { transform: scale(1.45); opacity: 0; }
                100% { transform: scale(1); opacity: 0; }
              }
            </style>
          `,
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -40]
        });
        const seenCoords = {};
        activeIncidents.forEach(inc => {
          if (inc.coord_x && inc.coord_y) {
            let lat = parseFloat(inc.coord_x);
            let lng = parseFloat(inc.coord_y);
            const coordKey = `${lat.toFixed(5)}_${lng.toFixed(5)}`;
            if (seenCoords[coordKey]) {
              seenCoords[coordKey]++;
              lat += (Math.random() - 0.5) * 0.0003 * seenCoords[coordKey];
              lng += (Math.random() - 0.5) * 0.0003 * seenCoords[coordKey];
            } else {
              seenCoords[coordKey] = 1;
            }
            const markerText = `<b>Ocorrência:</b> ${inc.internal_number}<br><b>Estado:</b> ${inc.status}<br><b>Morada:</b> ${inc.address || ''}`;            
            const marker = L.marker([lat, lng], { icon: pulsePinIcon }).bindPopup(markerText);
            window.cb360MarkerClusterGroup.addLayer(marker);
          }
        });
        window.cb360ModalMap.addLayer(window.cb360MarkerClusterGroup);
        window.cb360ModalMap.invalidateSize();

        if (window.cb360MarkerClusterGroup.getLayers().length > 0) {
          window.cb360ModalMap.fitBounds(window.cb360MarkerClusterGroup.getBounds().pad(0.1));
        }
      } catch (err) {
        console.error('Erro ao gerar mapa de ocorrências:', err);
        alert('Não foi possível carregar as ocorrências no mapa.');
      }
    }
    // ---- Chamada inicial (fora de qualquer função) ----
    renderCb360RedundPage();
    // ==============================================================================
    // == 4. LAYOUT DA OCORRÊNCIA (cria a barra de tabs + os containers de cada  ==
    // ==    tab — Caraterização, Meios, Vítimas, etc.) — corre sempre PRIMEIRO, ==
    // ==    ao abrir uma ocorrência (nova ou editar)                            ==
    // ==============================================================================
    // ---- renderCb360OccorrenceForm() ----
    async function renderCb360OccorrenceForm() {
      const page = document.getElementById('page-cb360-redund');
      if (!page) return;
      if (document.getElementById('cb360-incident-wrapper')) return;
      const wrapper = document.createElement('div');
      wrapper.id = 'cb360-incident-wrapper';
      wrapper.className = 'major-card';
      wrapper.style.setProperty('background', '#fff', 'important');
      wrapper.style.display = 'none';
      const field = (label, inputHtml, labelWidth = '80px') => `
        <div class="goc-row">
          <label class="goc-label" style="width:${labelWidth};">${label}</label>
          ${inputHtml}
        </div>
      `;
      wrapper.innerHTML = `
        <style>
          #cb360-incident-wrapper .goc-row { display:flex; align-items:center; gap:6px; }
          #cb360-incident-wrapper .goc-label {font-size:12px; font-weight:600; text-align:left; white-space:nowrap; flex-shrink:0;}             
          #cb360-incident-wrapper .goc-input {height:24px; line-height:22px; padding:0 7px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box; font-size:11px;}
          #cb360-incident-wrapper .goc-input:read-only {background:#fff;}
          #cb360-incident-wrapper .goc-input-flex {flex:1;}
          #cb360-incident-wrapper .goc-input-full {width:100%;}
          #cb360-incident-wrapper .goc-w-50 {width:50px; flex-shrink:0;}
          #cb360-incident-wrapper .goc-w-100 {width:100px; flex-shrink:0;}
          #cb360-incident-wrapper textarea.goc-input {height:auto; padding:6px; line-height:1.3; resize:vertical;}
        </style>
        <div class="major-card-header" style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:5px; font-weight:600; font-size:14px;">
            <span id="goc-header-icon">✏️</span>
            <span id="goc-header-title">Novo Registo de Ocorrência</span>
          </div>
          <div style="display:flex; gap:4px;">
            <button id="goc-btn-min" style="background:transparent; border:none; color:inherit; font-size:16px; cursor:pointer; padding:0 8px;">–</button>
            <button id="goc-btn-max" style="background:transparent; border:none; color:inherit; font-size:14px; cursor:pointer; padding:0 8px;">▢</button>
            <button id="goc-btn-x" style="background:transparent; border:none; color:inherit; font-size:14px; cursor:pointer; padding:0 8px;">✕</button>
          </div>
        </div>
        <div class="major-card-body" style="padding:0; font-size:13px;">
          <div id="goc-bar-summary" style="display:none; background: rgb(220, 220, 220); align-items:center; justify-content:space-between; padding:7px 14px; border-bottom:1px solid #eee; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <div style="display:flex; flex-direction:column; gap:4px; min-width:250px;">
                <div style="display:flex; font-size:14px;">
                  <span style="font-weight:600; width:110px; display:inline-block;">Núm. Interno:</span>
                  <span id="goc-internal-summary"></span>
                </div>
                <div style="display:flex; font-size:14px;">
                  <span style="font-weight:600; width:110px; display:inline-block;">Núm. SADO:</span>
                  <span id="goc-summary-sado"></span>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; min-width:16px;">
                <i class="fa fa-truck" style="font-size:22px;color:#666;"></i>
                <span id="goc-count-vehicles" style="font-weight:700;">0</span>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; min-width:36px;">
                <i class="fa-solid fa-helmet-safety" style="font-size:22px;color:#666;"></i>
                <span id="goc-staff-count" style="font-weight:700;">0</span>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; min-width:36px;">
                <i class="fa-solid fa-kit-medical" style="font-size:22px;color:#666;"></i>
                <span id="goc-count-victims" style="font-weight:700;">0</span>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; min-width:36px;">
                <i class="fa-solid fa-users" style="font-size:22px;color:#666;"></i>
                <span id="goc-count-people" style="font-weight:700;">0</span>
              </div>
              <div style="display:flex; flex-direction:column; align-items:center; min-width:36px;">
                <i class="fa fa-plane fa-2x" style="font-size:22px;color:#666;"></i>
                <span id="goc-count-aerial-means" style="font-weight:700;">0</span>
              </div>
              <div style="text-align:left; font-size:16px; margin-left:100px;">
                <div id="goc-summary-class-desc" style="font-weight:700;"></div>
                <div id="goc-summary-standings"></div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:16px;">
              <div style="text-align:right; font-size:14px; font-weight:700;">
                <div id="goc-summary-date"></div>
                <div style="display:flex; align-items:center; gap:4px; justify-content:flex-end;">
                  <i id="goc-duration-icon" class="fa-solid fa-clock"></i>
                  <span id="goc-summary-duration"></span>
                </div>
              </div>
              <button id="goc-btn-close-incident" style="background:#f0ad4e; color:#fff; border:none; padding:10px 15px; border-radius:5px; font-weight:600; cursor:pointer; white-space:nowrap;">Fechar Ocorrência</button>
            </div>
          </div>
          <div id="goc-body" style="display:flex;">
            <div id="goc-sidebar" style="display:none; width:220px; background:#e9e9e9; border-right:1px solid #ddd; padding:10px 0; flex-shrink:0;">
              <div class="goc-tab" data-tab="characterization" style="position:relative; padding:11px 18px; cursor:pointer; border:1px solid #d6d6d6; border-left:3px solid transparent; background:#f7f7f7; margin:3px 6px; border-radius:4px;">
                Caracterização
                <span class="goc-tab-arrow" style="display:block; position:absolute; right:0px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-right:11px solid #999;"></span>
              </div>
              <div class="goc-tab" data-tab="vehicles" style="position:relative; padding:11px 18px; cursor:pointer; border:1px solid #d6d6d6; border-left:3px solid transparent; background:#f7f7f7; margin:3px 6px; border-radius:4px;">
              Meios 
              <span id="goc-tab-count-vehicles"></span>
              <span class="goc-tab-arrow" style="display:block; position:absolute; right:0px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-right:11px solid #999;"></span>
              </div>
              <div class="goc-tab" data-tab="victims" style="position:relative; padding:11px 18px; cursor:pointer; border:1px solid #d6d6d6; border-left:3px solid transparent; background:#f7f7f7; margin:3px 6px; border-radius:4px;">
              Vítimas 
              <span id="goc-tab-count-victims"></span>
              <span class="goc-tab-arrow" style="display:block; position:absolute; right:0px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-right:11px solid #999;"></span>
              </div>
              <div class="goc-tab" data-tab="communications" style="position:relative; padding:11px 18px; cursor:pointer; border:1px solid #d6d6d6; border-left:3px solid transparent; background:#f7f7f7; margin:3px 6px; border-radius:4px;">
              Comunicações
              <span class="goc-tab-arrow" style="display:block; position:absolute; right:0px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-right:11px solid #999;"></span>
              </div>
              <div class="goc-tab" data-tab="summary" style="position:relative; padding:11px 18px; cursor:pointer; border:1px solid #d6d6d6; border-left:3px solid transparent; background:#f7f7f7; margin:3px 6px; border-radius:4px;">
              Resumo da Ocorrência
              <span class="goc-tab-arrow" style="display:block; position:absolute; right:0px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-right:11px solid #999;"></span>
              </div>
              <div class="goc-tab" data-tab="timeline" style="position:relative; padding:11px 18px; cursor:pointer; border:1px solid #d6d6d6; border-left:3px solid transparent; background:#f7f7f7; margin:3px 6px; border-radius:4px;">
              Fita do Tempo
              <span class="goc-tab-arrow" style="display:block; position:absolute; right:0px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-right:11px solid #999;"></span>
              </div>
              <div class="goc-tab" data-tab="sms" style="position:relative; padding:11px 18px; cursor:pointer; border:1px solid #d6d6d6; border-left:3px solid transparent; background:#f7f7f7; margin:3px 6px; border-radius:4px;">
              SMS&nbsp&nbsp<span style="color:#f0ad4e;"><i class="fa-solid fa-triangle-exclamation" style="font-size:18px;"></i></span>
              <span class="goc-tab-arrow" style="display:block; position:absolute; right:0px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-right:11px solid #999;"></span>
              </div>
              <div style="padding:14px;">
                <button id="goc-btn-reforco-sms" style="width:100%; background:#f0ad4e; color:#fff; border:none; padding:8px; border-radius:5px; font-size:12px; cursor:pointer;"><i class="fa-solid fa-comment-sms"></i> Reforço Meios SMS</button>
              </div>
            </div>
            <div style="flex:1; padding:12px 16px; overflow-y:auto;">
              <div id="goc-tab-content-characterization" class="goc-tab-content">
                <div style="display:grid; grid-template-columns: 1.1fr 1.3fr 1fr 0.8fr 1fr; gap:10px; margin-bottom:4px;">
                  ${field('Núm. Interno', `<input type="text" id="goc-internal-nr" readonly class="goc-input goc-input-flex">`, '90px')}
                  ${field('Núm. SADO', `<input type="text" id="goc-sado-nr" class="goc-input goc-input-flex">`, '85px')}
                  ${field('D. Alerta', `<input type="date" id="goc-alert-date" class="goc-input goc-input-flex">`, '65px')}
                  ${field('H. Alerta', `<input type="time" id="goc-alert-hour" class="goc-input goc-input-flex">`, '65px')}
                  <div style="display:flex; align-items:center; gap:0">
                    <label id="goc-state-badge" style="font-size:12px; font-weight:600; background:#f0ad4e; color:#444; padding:0 15px; height:24px; line-height:24px; border-radius:4px; white-space:nowrap; box-sizing:border-box;">Estado</label>
                    <select id="goc-state" class="goc-input goc-input-flex">
                      <option value=""></option><option value="Alerta">Alerta</option><option value="Análise">Análise</option><option value="Despacho">Despacho</option><option value="Despacho 1º Alerta">Despacho 1º Alerta</option><option value="Em Curso">Em Curso</option>
                      <option value="Chegada ao TO">Chegada ao TO</option><option value="Em Resolução">Em Resolução</option><option value="Conclusão">Conclusão</option><option value="Vigilância">Vigilância</option><option value="Encerrada">Encerrada</option>
                      <option value="Falso Alarme">Falso Alarme</option><option value="Falso Alerta">Falso Alerta</option><option value="Anulada">Anulada</option><option value="Recusada">Recusada</option>
                    </select>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns: 0.9fr 1.7fr 0.9fr 0.9fr; gap:10px; margin-bottom:4px;">
                  ${field('Fonte Alerta', `<select id="goc-alert-source" class="goc-input goc-input-flex"><option value=""></option></select>`, '90px')}
                  <div class="goc-row">
                    <label class="goc-label" style="width:80px;">Contactante</label>
                    <input type="text" id="goc-contact" class="goc-input goc-input-flex">
                    <button id="goc-btn-search-contact" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; font-size:14px;"><i class="fa-solid fa-magnifying-glass"></i></button>
                  </div>
                  ${field('Telefone', `<input type="text" id="goc-phone" class="goc-input goc-input-flex">`, '60px')}
                  ${field('Risco', `
                    <select id="goc-risk" class="goc-input goc-input-flex">
                      <option value=""></option>
                      <option value="Reduzido">Reduzido</option>
                      <option value="Moderado">Moderado</option>
                      <option value="Elevado">Elevado</option>
                    </select>
                  `, '50px')}
                </div>
                <div style="display:grid; grid-template-columns: 1.1fr 1.6fr 0.9fr; gap:10px; margin-bottom:4px;">
                  <div class="goc-row">
                    <label class="goc-label" style="width:90px;">Classificação</label>
                    <div style="position:relative; flex:1;">
                      <input type="text" id="goc-classification-input" placeholder="Pesquisar..." autocomplete="off" class="goc-input goc-input-full" readonly style="cursor:pointer; padding-right:24px;"><i id="goc-classification-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color:#000; pointer-events:none; transition:transform 0.15s;"></i>
                        <div id="goc-classification-dropdown" style="display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; z-index:50; background:#fff; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; max-height:220px; box-shadow:0 4px 8px rgba(0,0,0,0.12);">
                          <input type="text" id="goc-classification-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
                          <div id="goc-classification-list" style="overflow-y:auto; max-height:160px;"></div>
                      </div>
                    </div>
                  </div>
                  ${field('Descrição', `<input type="text" id="goc-description" class="goc-input goc-input-flex">`, '75px')}
                  ${field('N° CODU', `<input type="text" id="goc-codu" class="goc-input goc-input-flex">`, '65px')}
                </div>
                <div style="display:grid; grid-template-columns: 1.2fr 1.1fr 1fr; gap:10px; margin-bottom:12px;">
                  <div class="goc-row">
                    <label class="goc-label" style="width:90px;">B. Resp. Rel.</label>
                    <div style="position:relative; flex:1;">
                      <input type="text" id="goc-bresp-input" placeholder="Pesquisar..." autocomplete="off" class="goc-input goc-input-full" readonly style="cursor:pointer; padding-right:24px;"><i id="goc-bresp-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color:#000; pointer-events:none; transition:transform 0.15s;"></i>
                        <div id="goc-bresp-dropdown" style="display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; z-index:50; background:#fff; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; max-height:220px; box-shadow:0 4px 8px rgba(0,0,0,0.12);">
                        <input type="text" id="goc-bresp-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
                        <div id="goc-bresp-list" style="overflow-y:auto; max-height:160px;"></div>
                      </div>
                    </div>
                    <input type="checkbox" id="goc-bresp-check" checked style="width:16px; height:16px; cursor:pointer !important;">
                    <span style="color:#5cb85c;"><i class="fa-solid fa-mobile-screen"></i></span>
                  </div>
                  <div class="goc-row">
                    <label class="goc-label" style="width:80px;">Ent. Faturar</label>
                    <div style="position:relative; flex:1;">
                      <input type="text" id="goc-entity-invoice-input" placeholder="Pesquisar..." autocomplete="off" class="goc-input goc-input-full" readonly style="cursor:pointer; padding-right:24px;"><i id="goc-entity-invoice-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color: #000; pointer-events:none; transition:transform 0.15s;"></i>
                      <div id="goc-entity-invoice-dropdown" style="display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; z-index:50; background:#fff; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; max-height:220px; box-shadow:0 4px 8px rgba(0,0,0,0.12);">
                        <input type="text" id="goc-entity-invoice-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
                        <div id="goc-entity-invoice-list" style="overflow-y:auto; max-height:160px;"></div>
                      </div>
                    </div>
                  </div>
                  ${field('Associar Evento', `<select id="goc-associate-event" class="goc-input goc-input-flex"><option value=""></option></select>`, '100px')}
                </div>
                <div style="display:flex; gap:14px; flex-wrap:wrap; border-top:1px solid #eee; padding-top:10px;">
                  <div style="flex:1; min-width:240px; display:flex; flex-direction:column; gap:6px;">
                    <div class="goc-row" style="position:relative;">
                      <label class="goc-label" style="width:100px;">Morada</label>
                      <input type="text" id="goc-address" class="goc-input goc-input-flex" autocomplete="off"><span style="color:#2b6ecb;"><i class="fa-solid fa-globe"></i></span>
                      <div id="goc-address-suggestions" style="display:none; position:absolute; top:100%; left:100px; right:20px; z-index:400; background:#fff; border:1px solid #ccc; border-radius:4px; box-shadow:0 4px 10px rgba(0,0,0,0.15); max-height:220px; overflow-y:auto; font-size:12px;"></div>
                    </div>
                    <div class="goc-row">
                      <label class="goc-label" style="width:100px;">Número</label>
                      <input type="text" id="goc-address-nr" class="goc-input goc-w-100">
                      <label class="goc-label">Andar</label>
                      <input type="text" id="goc-address-nr-floor" class="goc-input goc-input-flex">
                    </div>
                    <div class="goc-row">
                      <label class="goc-label" style="width:100px;">Localidade</label>
                      <input type="text" id="goc-address-city" class="goc-input goc-input-flex">
                    </div>
                    <div class="goc-row">
                      <label class="goc-label" style="width:100px;">Código Postal</label>
                      <input type="text" id="goc-cp1" placeholder="0000" class="goc-input goc-w-50">
                      <span>-</span>
                      <input type="text" id="goc-cp2" placeholder="000" class="goc-input goc-w-50">
                      <input type="text" id="goc-cp-city" placeholder="Localidade" class="goc-input goc-input-flex">
                    </div>
                    <div class="goc-row">
                      <label class="goc-label" style="width:100px;">Distrito</label>
                      <select id="goc-district_select" class="goc-input goc-input-flex"></select>
                    </div>
                    <div class="goc-row">
                      <label class="goc-label" style="width:100px;">Concelho</label>
                      <select id="goc-council_select" class="goc-input goc-input-flex"></select>
                    </div>
                    <div class="goc-row">
                      <label class="goc-label" style="width:100px;">Freguesia</label>
                      <select id="goc-parish_select" class="goc-input goc-input-flex"></select>
                    </div>
                    <div class="goc-row">
                      <label class="goc-label" style="width:100px; white-space:normal; line-height:1.1;">Ponto Referência</label>
                      <input type="text" id="goc-reference-point" class="goc-input goc-input-flex">
                    </div>
                    <div class="goc-row" style="background:#eef4fb; padding:5px 7px; border-radius:4px; margin-top:2px;">
                      <label class="goc-label" style="width:100px;">Coordenadas</label>
                      <select id="goc-coord-system" class="goc-input goc-w-100">
                        <option value="SIRESP">SIRESP</option>
                        <option value="WGS84">WGS 84</option>
                        <option value="Decimais">Decimais</option>
                      </select>
                      <button id="goc-btn-refresh-map" style="height:23px; background:#2b6ecb; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; white-space:nowrap; font-size:11px; flex-shrink:0;"><i class="fa fa-compass"></i> Atualizar Mapa</button>
                    </div>
                    <div style="display:flex; gap:6px; padding-left:106px;">
                      <input type="text" id="goc-coord-x" placeholder="Latitude" class="goc-input goc-input-flex">
                      <input type="text" id="goc-coord-y" placeholder="Longitude" class="goc-input goc-input-flex">
                    </div>
                    <div class="goc-row" style="margin-top:0px;">
                      <input type="checkbox" id="goc-out-of-bounds" style="width:14px; height:14px; flex-shrink:0; cursor:pointer !important;">
                      <label for="goc-out-of-bounds" style="font-size:11px; white-space:normal; line-height:1.1; cursor:pointer;">  Fora da área de intervenção.</label>
                      <div style="position:relative; flex:1;">
                        <input type="text" id="goc-out-of-bounds-input" placeholder="Pesquisar corpo..." autocomplete="off" class="goc-input goc-input-full" readonly style="cursor:pointer; padding-right:24px;"><i id="goc-out-of-bounds-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color:#000; pointer-events:none; transition:transform 0.15s;"></i>
                          <div id="goc-out-of-bounds-dropdown" style="display:none; flex-direction:column; position:absolute; bottom:100%; top:auto; left:0; right:0; z-index:50; background:#fff; border:1px solid #ccc; border-bottom:none; border-radius:4px 4px 0 0; max-height:280px; box-shadow:0 -4px 8px rgba(0,0,0,0.12);">
                          <input type="text" id="goc-out-of-bounds-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
                          <div id="goc-out-of-bounds-list" style="overflow-y:auto; max-height:220px;"></div>
                        </div>
                      </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:3px; margin-top:6px;">
                      <label style="font-size:11.5px; font-weight:600;">Observações</label>
                      <textarea id="goc-observations" rows="3" class="goc-input"></textarea>
                    </div>
                  </div>
                  <div style="flex:1.4; min-width:400px;">
                    <div id="goc-map" style="width:100%; height:100%; min-height:330px; border:1px solid #ccc; border-radius:4px; position:relative; z-index:1;"></div>
                  </div>
                </div>
                <div id="goc-sms-block" style="display:flex; align-items:center; gap:18px; flex-wrap:wrap; border-top:1px solid #eee; margin-top:10px; padding-top:8px;">
                  <span style="font-size:12.5px; font-weight:600; display:flex; align-items:center; gap:4px;">💬 Envio de Sms de Alerta:</span>
                  <label style="font-size:12.5px; display:flex; align-items:center; gap:4px;"><input type="radio" name="goc-sms" value="no" checked> Não enviar</label>
                  <label style="font-size:12.5px; display:flex; align-items:center; gap:4px;"><input type="radio" name="goc-sms" value="save"> Enviar ao Guardar Ocorrência</label>
                  <label style="font-size:12.5px; display:flex; align-items:center; gap:4px;"><input type="radio" name="goc-sms" value="schedule"> Agendar Envio</label>
                  <label style="font-size:12.5px; display:flex; align-items:center; gap:4px; margin-left:auto;"><input type="checkbox" id="goc-sms-com-resposta"> Com número de Resposta</label>
                </div>                                
              </div>
              <div id="goc-tab-content-vehicles" class="goc-tab-content" style="display:none;"><p style="color:#888;">Aba "Meios" — por construir.</p></div>
              <div id="goc-tab-content-victims" class="goc-tab-content" style="display:none;"><p style="color:#888;">Aba "Vítimas" — por construir.</p></div>
              <div id="goc-tab-content-communications" class="goc-tab-content" style="display:none;"><p style="color:#888;">Aba "Comunicações" — por construir.</p></div>
              <div id="goc-tab-content-summary" class="goc-tab-content" style="display:none;"><p style="color:#888;">Aba "Resumo Ocorrência" — por construir.</p></div>
              <div id="goc-tab-content-timeline" class="goc-tab-content" style="display:none;"><p style="color:#888;">Aba "Fita do Tempo" — por construir.</p></div>
              <div id="goc-tab-content-sms" class="goc-tab-content" style="display:none;"><p style="color:#888;">Aba "SMS" — por construir.</p></div>
            </div>          
          </div> 
          <div id="goc-call-logs-block" style="display:flex; background: rgb(220, 220, 220); justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div id="goc-logs-optel" style="font-size:11px; font-weight:700; color:#555; margin:10px 20px;"></div>
            <div style="display:flex; align-items:center; gap:14px;">
              <div id="goc-block-logs" style="display:none; flex-direction:column; align-items:flex-start; gap:4px; font-size:11.5px;">
                <div><a href="#" style="display:none; color:#2b6ecb; font-weight:700;">Logs de Comunicação dos Status do INEM <i class="fa fa-info-circle fa-sm"></i></a></div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span id="goc-sado-log-count" style="display:none; background:#5cb85c; color:#fff; font-size:10.5px; font-weight:700; padding:1px 6px; border-radius:10px; align-items:center; gap:3px;"><i class="fa-solid fa-comment-dots"></i> 0</span>
                  <a href="#" style="display:none; color:#2b6ecb; font-weight:700;">Logs de Comunicação ao SADO <i class="fa fa-info-circle fa-sm"></i></a>
                </div>
              </div>
              <button id="goc-btn-link-calls" style="display:none; background:#5bc0de; color:#fff; border:none; padding:9px 14px; border-radius:5px; cursor:pointer; font-size:12px;  margin:10px 20px;"><i class="fa fa-phone-square fa-lg"></i> Associar Chamadas</button>
            </div>
          </div>
        </div>
        <div class="major-card-footer">
          <div style="display:flex; justify-content:flex-end; align-items:center; gap:5px; flex-wrap:wrap; width:100%;">
            <button id="goc-btn-add-posit" style="display:none; background:#2b6ecb; color:#fff; border:none; padding:9px 14px; border-radius:5px; cursor:pointer; font-size:12.5px; font-weight:600;"><i class="fa fa-tags fa-lg"></i>&nbsp;&nbsp;Adicionar POSIT</button>
            <button id="goc-btn-print-export" style="display:none; background:#2b6ecb; color:#fff; border:none; padding:9px 14px; border-radius:5px; cursor:pointer; font-size:12.5px; font-weight:600;"><i class="fa fa-download fa-lg"></i>&nbsp;&nbsp;Imprimir / Exportar</button>
            <div style="position:relative; display:inline-block;">
              <button id="goc-btn-reports" style="display:none; background:#2b6ecb; color:#fff; border:none; padding:9px 14px; border-radius:5px; cursor:pointer; font-size:12.5px; font-weight:600;"><i class="fa fa-clipboard fa-lg"></i>&nbsp;&nbsp;Relatórios <span id="goc-reports-arrow">▾</span></button>
            </div>
            <button id="goc-btn-docs" style="display:none; background:#2b6ecb; color:#fff; border:none; padding:9px 14px; border-radius:5px; cursor:pointer; font-size:12.5px; font-weight:600;"><i class="fa fa-folder-open fa-lg"></i>&nbsp;&nbsp;Docs</button>
            <button id="goc-btn-alerts" style="background:#d9534f; color:#fff; border:none; padding:8px 9px; border-radius:5px; cursor:pointer; font-size:14px; font-weight:600; margin-right:auto;"><i class="fa fa-bullhorn fa-lg"></i></button>
            <button id="goc-btn-decline" style="display:none; background:#d9534f; color:#fff; border:none; padding:9px 14px; border-radius:5px; cursor:pointer; font-size:12.5px; font-weight:600;"><i class="fa fa-ban fa-lg"></i>&nbsp;&nbsp;Recusa</button>
            <button id="goc-btn-save-sado" style="display: none; background: #5cb85c; color: #fff; border: none; padding: 9px 16px; border-radius: 5px; font-weight: 600; cursor: pointer; font-size: 12.5px;"><i class="fa fa-cloud-upload fa-lg"></i>&nbsp;&nbsp;Guardar e Enviar SADO</button>
            <button id="goc-btn-save" style="background:#5cb85c; color:#fff; border:none; padding:9px 16px; border-radius:5px; font-weight:600; cursor:pointer; font-size:12.5px;"><i class="fa-regular fa-floppy-disk"></i>&nbsp;&nbsp;Guardar</button>
            <button id="goc-btn-close" style="background:#f0ad4e; color:#fff; border:none; padding:9px 16px; border-radius:5px; font-weight:600; cursor:pointer; font-size:12.5px;"><i class="fa fa-power-off fa-lgf"></i>&nbsp;&nbsp;Fechar</button>
          </div>
        </div>
      `;
      const body = wrapper.querySelector('.major-card-body');
      if (body) body.style.setProperty('background', '#fff', 'important');
      wrapper.querySelectorAll('.goc-tab').forEach(tabEl => {
        tabEl.addEventListener('mouseenter', () => {
          if (tabEl.dataset.tab !== cb360ActiveTab) {
            tabEl.style.background = '#f5f5f5';
          }
        });
        tabEl.addEventListener('mouseleave', () => {
          if (tabEl.dataset.tab !== cb360ActiveTab) {
            tabEl.style.background = 'transparent';
          }
        });
      });
      page.appendChild(wrapper);
      wrapper.querySelectorAll('input, select, textarea').forEach(el => {
        const originalBorder = el.style.border;
        const originalBoxShadow = el.style.boxShadow;
        el.addEventListener('focus', () => {
          el.style.outline = 'none';
          el.style.border = '1px solid #d9534f';
          el.style.boxShadow = '0 0 4px rgba(217, 83, 79, 0.3)';
          el.style.transition = 'border-color 0.2s, box-shadow 0.2s';
        });
        el.addEventListener('blur', () => {
          el.style.border = originalBorder;
          el.style.boxShadow = originalBoxShadow;
        });   
      });
      document.getElementById('goc-out-of-bounds').addEventListener('change', (e) => {
        const input = document.getElementById('goc-out-of-bounds-input');
        input.disabled = !e.target.checked;
        if (!e.target.checked) {
          input.value = '';
          cb360OutOfBoundsSelected = null;
          document.getElementById('goc-out-of-bounds-dropdown').style.display = 'none';
        }
      });
      document.getElementById('goc-btn-x').addEventListener('click', closeCb360Incident);
      document.getElementById('goc-btn-close').addEventListener('click', closeCb360Incident);
      document.getElementById('goc-btn-min').addEventListener('click', () => {
        const corpo = document.getElementById('goc-corpo');
        corpo.style.display = (corpo.style.display === 'none') ? 'flex' : 'none';
      });
      document.getElementById('goc-btn-max').addEventListener('click', () => {
        wrapper.style.maxWidth = (wrapper.style.maxWidth === '100%') ? '' : '100%';
      });
      document.getElementById('goc-btn-refresh-map').addEventListener('click', updateCb360Map);
      document.getElementById('goc-btn-add-posit').addEventListener('click', () => openCb360PositModal(null));
      document.getElementById('goc-btn-reports').addEventListener('click', (e) => {
        e.stopPropagation();
        const arrow = document.getElementById('goc-reports-arrow');
        const existing = document.getElementById('goc-reports-dropdown');
        if (existing) {
          existing.remove();
          if (arrow) arrow.textContent = '▾';
          return;
        }
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const dropdown = document.createElement('div');
        dropdown.id = 'goc-reports-dropdown';
        dropdown.style.cssText = `position:fixed; left:${rect.left}px; bottom:${window.innerHeight - rect.top + 6}px; background:#fff; border:1px solid #ccc; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.18); min-width:170px; overflow:hidden; z-index:9999;`;
        dropdown.innerHTML = `
          <button class="goc-reports-option" data-report="relatorio" style="display:flex; align-items:center; gap:8px; width:100%; background:transparent; border:none; padding:10px 14px; text-align:left; cursor:pointer; font-size:12.5px; color:#333;"><i class="fa-regular fa-file-lines" style="color:#2b6ecb;"></i> Relatório</button>
          <button class="goc-reports-option" data-report="anexo-g2" style="display:flex; align-items:center; gap:8px; width:100%; background:transparent; border:none; padding:10px 14px; text-align:left; cursor:pointer; font-size:12.5px; color:#333; border-top:1px solid #eee;"><i class="fa-regular fa-file-lines" style="color:#2b6ecb;"></i> Anexo G2</button>
        `;
        document.body.appendChild(dropdown);
        if (arrow) arrow.textContent = '▴';
        dropdown.querySelectorAll('.goc-reports-option').forEach(opt => {
          opt.addEventListener('mouseenter', () => { opt.style.background = '#f0f6ff'; });
          opt.addEventListener('mouseleave', () => { opt.style.background = 'transparent'; });
          opt.addEventListener('click', () => {
            dropdown.remove();
            if (arrow) arrow.textContent = '▾';
            console.log('Relatório selecionado:', opt.dataset.report);
            // TODO: abrir o modal correspondente (Relatório / Anexo G2)
          });
        });
        const closeOnClickOutside = (ev) => {
          if (!dropdown.contains(ev.target) && ev.target !== btn) {
            dropdown.remove();
            if (arrow) arrow.textContent = '▾';
            document.removeEventListener('click', closeOnClickOutside);
          }
        };
        setTimeout(() => document.addEventListener('click', closeOnClickOutside), 0);
      });
      initCb360AddressAutocomplete();
      document.getElementById('goc-coord-system').addEventListener('change', updateCoordinateDisplay);
      document.getElementById('goc-btn-save').addEventListener('click', () => saveCb360Incident({sendSado:false}));
      document.getElementById('goc-btn-save-sado').addEventListener('click', () => saveCb360Incident({sendSado: true}));
      document.getElementById('goc-btn-close-incident').addEventListener('click', () => {
        const wasClosed = cb360PendingClosed;
        cb360PendingClosed = !cb360PendingClosed;
        applyCb360CloseButtonState(cb360PendingClosed);
        if (wasClosed && !cb360PendingClosed) {
          applyCb360FieldsLockState(false);
          document.getElementById('goc-state').value = 'Análise';
          updateCb360StateBadge();
        }
      });
      wrapper.querySelectorAll('.goc-tab').forEach(tabEl => {
        tabEl.addEventListener('click', () => switchTabCb360(tabEl.dataset.tab));
      });      
      initializeNewSelectGroup('#cb360-incident-wrapper');
      document.getElementById('goc-state').addEventListener('change', updateCb360StateBadge);
      await loadStaticOptionsIntoSelect('alert_source', 'goc-alert-source');
    }
    // ==============================================================================
    // == 5. CARATERIZAÇÃO (organizado pela ordem visual dos campos no ecrã)     ==
    // ==============================================================================
    // ---- 5.1 IDENTIFICAÇÃO (Núm. Interno, Estado) ----
    // generateInternalNr()
    async function generateInternalNr() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const year = new Date().getFullYear();
      try {
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_incidents?corp_oper_nr=eq.${corpOperNr}&order=internal_number.desc&limit=1`);
        const data = await response.json();
        if (data && data.length > 0 && data[0].internal_number) {
          const lastNr = parseInt(data[0].internal_number);
          return (lastNr + 1).toString();
        } else {
          return `${year}0000001`;
        }
      } catch (err) {
        console.error("Erro ao gerar número interno:", err);
        return `${year}0000000`;
      }
    }
    // updateCb360StateBadge()
    function updateCb360StateBadge() {
      const select = document.getElementById('goc-state');
      const badge = document.getElementById('goc-state-badge');
      if (!select || !badge) return;
      badge.style.background = STATUS_COLORS[select.value] || '#f0ad4e';
    }
    // ---- 5.2 ORIGEM DO ALERTA (Fonte Alerta) ----
    // loadStaticOptionsIntoSelect()
    async function loadStaticOptionsIntoSelect(category, selectId, valorSelecionado = null) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/static_options?category=eq.${category}&select=value&order=value`, {
            headers: {'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`}
          }
        );
        const data = await res.json();
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = `<option value=""></option>`;
        data.forEach(row => {
          const opt = document.createElement('option');
          opt.value = row.value;
          opt.textContent = row.value;
          if (row.value === valorSelecionado) opt.selected = true;
          select.appendChild(opt);
        });
      } catch (err) {
        console.error(`Erro ao carregar opções (${category}):`, err);
      }
    }
    // ---- 5.3 CONTACTANTE ----
    async function openCb360ContactModal() {
      const page = document.getElementById('page-cb360-redund');
      if (!page || document.getElementById('goc-contact-modal-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'goc-contact-modal-overlay';
      overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; align-items:center; justify-content:center;';
      overlay.innerHTML = `
        <style>
          #goc-contact-body input:focus, #goc-contact-body select:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
        </style>
        <div style="background:#fff; width:750px; height:620px; border-radius:8px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.25); font-family:sans-serif;">
          <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px; border-radius:8px 8px 0 0;">
            <div style="font-weight:600; font-size:14px;"><i class="fa-solid fa-search"></i>&nbsp;&nbsp;Pesquisa de Terceiros</div>
            <button class="goc-close-btn" style="background:transparent; border:none; color:#fff; cursor:pointer; font-size:16px;">✕</button>
          </div>
          <div id="goc-contact-body" style="padding:16px; background:#fff; flex:1; display:flex; flex-direction:column; min-height:0;">
            <div style="display:flex; flex-wrap:wrap; gap:24px; align-items:center; margin-bottom:16px; font-size:13px; font-weight:600; color:#333;">
              <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer !important;">
                <input type="checkbox" id="cb360-chk-activas" checked style="width:16px; height:16px; accent-color:#2b6ecb; cursor:pointer;"> Activas
              </label>
              <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer !important;">
                <input type="checkbox" id="cb360-chk-socios" checked style="width:16px; height:16px; accent-color:#2b6ecb; cursor:pointer;"> Sócios
              </label>
              <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer !important;">
                <input type="checkbox" id="cb360-chk-particulares" checked style="width:16px; height:16px; accent-color:#2b6ecb; cursor:pointer;"> Particulares
              </label>
              <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer !important;">
                <input type="checkbox" id="cb360-chk-entidades" checked style="width:16px; height:16px; accent-color:#2b6ecb; cursor:pointer;"> Entidades
              </label>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
              <span style="font-size:12.5px; font-weight:600; color:#444; min-width:60px;">Pesquisa</span>
              <div style="display:flex; align-items:center; flex:1; gap:6px;">
                <input type="text" id="cb360-input-search-terceiros" placeholder="Introduza código (ex: E407) ou nome e prima Enter..." style="flex:1; padding:7px 10px; border:1px solid #ccc; border-radius:4px; font-size:12.5px; box-sizing:border-box;">
                <button id="cb360-btn-search-trigger" style="background:#2b6ecb; color:#fff; border:none; padding:7px 12px; border-radius:4px; cursor:pointer; font-size:13px;" title="Pesquisar">
                  <i class="fa-solid fa-search"></i>
                </button>
              </div>
            </div>
            <div style="border:1px solid #c4c4c4; border-radius:4px; flex:1; overflow-y:auto; min-height:0;">
              <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px; text-align:left;">
                <thead>
                  <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600;">
                    <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px 12px; width:90px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Código</th>
                    <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px 12px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Nome</th>
                    <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px 12px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Morada</th>
                    <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px 12px; width:90px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Tipo</th>
                    <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:8px 12px; width:50px; text-align:center; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;"></th>
                  </tr>
                </thead>
                <tbody id="cb360-table-results-terceiros">
                  <tr>
                    <td colspan="5" style="padding:12px; text-align:center; color:#777; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">Introduza um termo e prima Enter...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; padding:12px 16px; border-top:1px solid #eee; background:#fafafa; border-radius:0 0 8px 8px;">
            <button class="goc-close-btn" style="background:#f0ad4e; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer; font-size:12.5px; display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-power-off"></i> Fechar
            </button>
          </div>
        </div>
      `;
      page.appendChild(overlay);
      const closeModal = () => { overlay.remove(); };
      overlay.querySelectorAll('.goc-close-btn').forEach(btn => btn.addEventListener('click', closeModal));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
      const searchTriggerBtn = overlay.querySelector('#cb360-btn-search-trigger');
      const searchInput = overlay.querySelector('#cb360-input-search-terceiros');
      const tableBody = overlay.querySelector('#cb360-table-results-terceiros');
      const executarPesquisa = async () => {
        const termo = searchInput.value.trim().toLowerCase();
        const chkActivas = overlay.querySelector('#cb360-chk-activas').checked;
        const chkSocios = overlay.querySelector('#cb360-chk-socios').checked;
        const chkParticulares = overlay.querySelector('#cb360-chk-particulares').checked;
        const chkEntidades = overlay.querySelector('#cb360-chk-entidades').checked;
        tableBody.innerHTML = `<tr><td colspan="5" style="padding:12px; text-align:center; color:#777; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">A pesquisar...</td></tr>`;
        try {
          const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
          if (!currentCorpOperNr) {
            tableBody.innerHTML = `<tr><td colspan="5" style="padding:12px; text-align:center; color:#d9534f; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">Erro: Operador ativo não definido.</td></tr>`;
            return;
          }
          const url = `${SUPABASE_URL}/rest/v1/cb360_entities?select=*&corp_oper_nr=eq.${currentCorpOperNr}`;
          const response = await supaFetch(url, { method: 'GET' });
          if (!response.ok) {
            tableBody.innerHTML = `<tr><td colspan="5" style="padding:12px; text-align:center; color:#d9534f; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">Erro ao obter resultados da base de dados.</td></tr>`;
            return;
          }
          const data = await response.json();
          const tiposPermitidos = [];
          if (chkSocios) tiposPermitidos.push('sócio', 'socio', 'sócios', 's');
          if (chkParticulares) tiposPermitidos.push('particular', 'particulares', 'p');
          if (chkEntidades) tiposPermitidos.push('entidade', 'entidades', 'e');
          const filteredData = data.filter(item => {
            if (tiposPermitidos.length > 0) {
              const tipoItem = String(item.ent_type || '').toLowerCase();
              const tipoMatch = tiposPermitidos.some(t => tipoItem.includes(t));
              if (!tipoMatch) return false;
            }
            if (chkActivas && item.is_active === false) {
              return false;
            }
            if (termo) {
              const codigo = String(item.ent_code || '').toLowerCase();
              const nome = String(item.ent_name || '').toLowerCase();
              if (!codigo.includes(termo) && !nome.includes(termo)) {
                return false;
              }
            }
            return true;
          });
          if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="padding:12px; text-align:center; color:#777; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">Sem resultados encontrados para "${searchInput.value}".</td></tr>`;
            return;
          }
          tableBody.innerHTML = '';
          filteredData.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom:1px solid #eee; cursor:pointer;';
            tr.innerHTML = `
              <td style="padding:8px 12px; font-weight:600; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${item.ent_code || ''}</td>
              <td style="padding:8px 12px; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${item.ent_name || ''}</td>
              <td style="padding:8px 12px; color:#555; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${item.ent_address || ''}</td>
              <td style="padding:8px 12px; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${item.ent_type || ''}</td>
              <td style="padding:8px 12px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
                <button class="goc-select-item" style="background:#2b6ecb; color:#fff; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:11px;" title="Selecionar">
                  <i class="fa-solid fa-check"></i>
                </button>
              </td>
            `;
            const selecionarRegisto = () => {
              const contactInput = document.getElementById('goc-contact');
              if (contactInput) {
                contactInput.value = item.ent_name || '';
                contactInput.dispatchEvent(new Event('input', { bubbles: true }));
                contactInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
              const phoneInput = document.getElementById('goc-phone');
              if (phoneInput) {
                phoneInput.value = item.ent_phone ? String(item.ent_phone) : '';
                phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
              closeModal();
            };
            tr.addEventListener('click', selecionarRegisto);
            tableBody.appendChild(tr);
          });
        } catch (err) {
          console.error('Erro na pesquisa de terceiros:', err);
          tableBody.innerHTML = `<tr><td colspan="5" style="padding:12px; text-align:center; color:#d9534f; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">Ocorreu um erro na requisição.</td></tr>`;
        }
      };
      searchTriggerBtn.addEventListener('click', executarPesquisa);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executarPesquisa();
        }
      });
      setTimeout(() => {
        overlay.style.display = 'flex';
      }, 10);
    }
    // Ligar ao botão da lupa assim que o DOM estiver pronto ou logo após renderizares o HTML acima
    document.addEventListener('click', (e) => {
      const searchBtn = e.target.closest('#goc-btn-search-contact');
      if (searchBtn) {
        openCb360ContactModal();
      }
    });
    // ---- 5.4 CLASSIFICAÇÃO ----
    // INITIALIZE: initializeComboboxClassification()
    function initializeComboboxClassification(list, classAtualId = null) {
      cb360DataClassification = list || [];
      cb360SelectedRating = classAtualId
        ? (list.find(i => i.id == classAtualId) || null)
        : null;
      cb360ClassActiveIndex = -1;
      const mainInput = document.getElementById('goc-classification-input');
      const dropdown = document.getElementById('goc-classification-dropdown');
      const searchInput = document.getElementById('goc-classification-search');
      const listContainer = document.getElementById('goc-classification-list');
      const chevron = document.getElementById('goc-classification-chevron');
      if (!mainInput || !dropdown || !searchInput || !listContainer) return;
      mainInput.value = cb360SelectedRating ? cb360SelectedRating.label : '';
      if (cb360SelectedRating) {
        document.getElementById('goc-description').value = cb360SelectedRating.descr;
      }
      const summaryClassDesc = document.getElementById('goc-summary-class-desc');
      const summaryStandings = document.getElementById('goc-summary-standings');
      if (summaryClassDesc) summaryClassDesc.textContent = cb360SelectedRating?.id ?? '';
      if (summaryStandings) summaryStandings.textContent = cb360SelectedRating?.descr ?? '';
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)';
      }
      function openDropdown() {
        if (mainInput.disabled) return;
        searchInput.value = '';
        cb360ClassActiveIndex = -1;
        renderCb360ClassOcorrList(cb360DataClassification, listContainer, mainInput, searchInput, dropdown, chevron);
        setDropdownOpen(true);
        setTimeout(() => searchInput.focus(), 0);
      }
      mainInput.addEventListener('click', openDropdown);
      mainInput.addEventListener('focus', openDropdown);      
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360DataClassification.filter(item => item.label.toLowerCase().includes(term));
        cb360ClassActiveIndex = (term.length > 0 && filtered.length > 0) ? 0 : -1;
        renderCb360ClassOcorrList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
      });
      searchInput.addEventListener('keydown', (e) => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360DataClassification.filter(item => item.label.toLowerCase().includes(term));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360ClassActiveIndex = (cb360ClassActiveIndex + 1) % filtered.length;
          renderCb360ClassOcorrList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360ClassActiveIndex = (cb360ClassActiveIndex - 1 + filtered.length) % filtered.length;
          renderCb360ClassOcorrList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = filtered[cb360ClassActiveIndex];
          if (chosen) {
            cb360SelectedRating = chosen;
            mainInput.value = chosen.label;
            document.getElementById('goc-description').value = chosen.descr;
            setDropdownOpen(false);
          }
        } else if (e.key === 'Escape') {
          setDropdownOpen(false);
        }
      });
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
    }
    // FETCH: fetchCb360ClassOcorrList()
    async function fetchCb360ClassOcorrList() {
      try {
        const url = `${SUPABASE_URL}/rest/v1/class_occorr?select=class_occorr,occorr_descr&order=class_occorr.asc`;
        const response = await supaFetch(url, {method: 'GET'});
        if (!response.ok) {
          console.error('Erro ao obter class_occorr:', response.status);
          return [];
        }
        const data = await response.json();
        return data.map(d => ({id: d.class_occorr, label: `${d.class_occorr} - ${d.occorr_descr}`, descr: d.occorr_descr}));
      } catch (err) {
        console.error('Erro fetchCb360ClassOcorrList:', err);
        return [];
      }
    }
    // RENDER: renderCb360ClassOcorrList()
    function renderCb360ClassOcorrList(list, listContainer, mainInput, searchInput, dropdown, chevron) {
      listContainer.innerHTML = '';
      const term = searchInput ? searchInput.value.trim() : '';
      if (!term) {
        const blankLine = document.createElement('div');
        blankLine.innerHTML = '&nbsp;';
        blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
        blankLine.addEventListener('mouseenter', () => {
          cb360ClassActiveIndex = -1;
          Array.from(listContainer.children).forEach((el, i) => {
            el.style.background = i === 0 ? '#2b6ecb' : '#fff';
            if (i !== 0) el.style.color = '#333';
          });
        });
        blankLine.addEventListener('click', () => {
          cb360SelectedRating = null;
          mainInput.value = '';
          document.getElementById('goc-description').value = '';
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(blankLine);
      }
      if (list.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'Sem resultados.';
        empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
        listContainer.appendChild(empty);
        return;
      }
      list.forEach((item, idx) => {
        const isActive = idx === cb360ClassActiveIndex;
        const line = document.createElement('div');
        line.textContent = item.label;
        line.style.padding = '6px 10px';
        line.style.fontSize = '11px';
        line.style.cursor = 'pointer';
        line.style.background = isActive ? '#2b6ecb' : '#fff';
        line.style.color = isActive ? '#fff' : '#333';        
        line.addEventListener('mouseenter', () => {
          cb360ClassActiveIndex = idx;
          const hasBlank = !term;
          Array.from(listContainer.children).forEach((el, i) => {
            if (hasBlank && i === 0) {
              el.style.background = '#fff';
            } else {
              const itemIndex = hasBlank ? i - 1 : i;
              const active = itemIndex === idx;
              el.style.background = active ? '#2b6ecb' : '#fff';
              el.style.color = active ? '#fff' : '#333';
            }
          });
        });
        line.addEventListener('click', () => {
          cb360SelectedRating = item;
          mainInput.value = item.label;
          document.getElementById('goc-description').value = item.descr;
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(line);
      });
      const offsetIndex = (!term) ? cb360ClassActiveIndex + 1 : cb360ClassActiveIndex;
      const activeEl = listContainer.children[offsetIndex];
      if (activeEl) activeEl.scrollIntoView({block: 'nearest'});
    }
    // ---- 5.5 RESPONSÁVEL / FATURAÇÃO ----
    // B. Resp. Rel. — INITIALIZE: initializeFFRespCombobox()
    function initializeFFRespCombobox(list, brespAtualId = null) {
      cb360BRespData = list || [];
      cb360BRespSelected = brespAtualId ? (list.find(i => i.id === brespAtualId) || null) : null;
      cb360BRespActiveIndex = -1;
      const mainInput = document.getElementById('goc-bresp-input');
      const dropdown = document.getElementById('goc-bresp-dropdown');
      const searchInput = document.getElementById('goc-bresp-search');
      const listContainer = document.getElementById('goc-bresp-list');
      const chevron = document.getElementById('goc-bresp-chevron');
      if (!mainInput || !dropdown || !searchInput || !listContainer) return;
      mainInput.value = cb360BRespSelected ? cb360BRespSelected.label : '';
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)';
      }
      function openDropdown() {
        if (mainInput.disabled) return;
        searchInput.value = '';
        cb360BRespActiveIndex = -1;
        renderCb360BRespList(cb360BRespData, listContainer, mainInput, searchInput, dropdown, chevron);
        setDropdownOpen(true);
        setTimeout(() => searchInput.focus(), 0);
      }
      mainInput.addEventListener('click', openDropdown);
      mainInput.addEventListener('focus', openDropdown);      
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360BRespData.filter(item => item.label.toLowerCase().includes(term));
        // Se houver texto digitado e resultados, seleciona automaticamente o 1º (índice 0)
        cb360BRespActiveIndex = (term.length > 0 && filtered.length > 0) ? 0 : -1;
        renderCb360BRespList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
      });
      searchInput.addEventListener('keydown', (e) => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360BRespData.filter(item => item.label.toLowerCase().includes(term));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360BRespActiveIndex = (cb360BRespActiveIndex + 1) % filtered.length;
          renderCb360BRespList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360BRespActiveIndex = (cb360BRespActiveIndex - 1 + filtered.length) % filtered.length;
          renderCb360BRespList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = filtered[cb360BRespActiveIndex];
          if (chosen) {
            cb360BRespSelected = chosen;
            mainInput.value = chosen.label;
            setDropdownOpen(false);
          }
        } else if (e.key === 'Escape') {
          setDropdownOpen(false);
        }
      });
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
    }
    // B. Resp. Rel. — FETCH: fetchCb360BRespList()
    async function fetchCb360BRespList() {
      try {
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!currentCorpOperNr) return [];
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,full_name,patent_abv&corp_oper_nr=eq.${currentCorpOperNr}&elem_state=eq.true&type_quad=not.is.null&type_quad=neq.&order=n_int.asc`;
        const response = await supaFetch(url, { method: 'GET' });
        if (!response.ok) {
          console.error('Erro ao obter reg_elems:', response.status);
          return [];
        }
        const data = await response.json();
        return data.map(d => ({
          id: d.n_int,
          label: `${d.n_int} - ${d.full_name} - ${d.patent_abv}`
        }));
      } catch (err) {
        console.error('Erro fetchCb360BRespList:', err);
        return [];
      }
    }
    // B. Resp. Rel. — RENDER: renderCb360BRespList()
    function renderCb360BRespList(list, listContainer, mainInput, searchInput, dropdown, chevron) {
      listContainer.innerHTML = '';      
      const term = searchInput ? searchInput.value.trim() : '';
      // Só cria e adiciona a linha em branco se NÃO estiver a ser efetuada nenhuma pesquisa
      if (!term) {
        const blankLine = document.createElement('div');
        blankLine.innerHTML = '&nbsp;';
        blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
        blankLine.addEventListener('mouseenter', () => {
          cb360BRespActiveIndex = -1;
          Array.from(listContainer.children).forEach((el, i) => {
            el.style.background = i === 0 ? '#2b6ecb' : '#fff';
            if (i !== 0) el.style.color = '#333';
          });
        });
        blankLine.addEventListener('click', () => {
          cb360BRespSelected = null;
          mainInput.value = '';
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(blankLine);
      }
      if (list.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'Sem resultados.';
        empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
        listContainer.appendChild(empty);
        return;
      }
      list.forEach((item, idx) => {
        const isActive = idx === cb360BRespActiveIndex;
        const line = document.createElement('div');
        line.textContent = item.label;
        line.style.padding = '6px 10px';
        line.style.fontSize = '11px';
        line.style.cursor = 'pointer';
        line.style.background = isActive ? '#2b6ecb' : '#fff';
        line.style.color = isActive ? '#fff' : '#333';        
        line.addEventListener('mouseenter', () => {
          cb360BRespActiveIndex = idx;
          const hasBlank = !term;
          Array.from(listContainer.children).forEach((el, i) => {
            if (hasBlank && i === 0) {
              el.style.background = '#fff';
            } else {
              const itemIndex = hasBlank ? i - 1 : i;
              const active = itemIndex === idx;
              el.style.background = active ? '#2b6ecb' : '#fff';
              el.style.color = active ? '#fff' : '#333';
            }
          });
        });
        line.addEventListener('click', () => {
          cb360BRespSelected = item;
          mainInput.value = item.label;
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(line);
      });
      const offsetIndex = (!term) ? cb360BRespActiveIndex + 1 : cb360BRespActiveIndex;
      const activeEl = listContainer.children[offsetIndex];
      if (activeEl) activeEl.scrollIntoView({block: 'nearest'});
    }
    // Ent. Faturar — INITIALIZE: initializeEntityInvoiceCombobox()
    function initializeEntityInvoiceCombobox(list, selectedId = null) {
      cb360EntityInvoiceData = list || [];
      cb360EntityInvoiceSelected = selectedId ? (list.find(i => i.id == selectedId) || null) : null;
      cb360EntityInvoiceActiveIndex = -1;      
      const mainInput = document.getElementById('goc-entity-invoice-input');
      const dropdown = document.getElementById('goc-entity-invoice-dropdown');
      const searchInput = document.getElementById('goc-entity-invoice-search');
      const listContainer = document.getElementById('goc-entity-invoice-list');
      const chevron = document.getElementById('goc-entity-invoice-chevron');      
      if (!mainInput || !dropdown || !searchInput || !listContainer) return;
      mainInput.value = cb360EntityInvoiceSelected ? cb360EntityInvoiceSelected.label : '';      
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)';
      }      
      function openDropdown() {
        if (mainInput.disabled) return;
        searchInput.value = '';
        cb360EntityInvoiceActiveIndex = -1;
        renderCb360EntityInvoiceList([], listContainer, mainInput, searchInput, dropdown, chevron);
        setDropdownOpen(true);
        setTimeout(() => searchInput.focus(), 0);
      }      
      mainInput.addEventListener('click', openDropdown);
      mainInput.addEventListener('focus', openDropdown);      
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase().trim();
        if (!term) {
          cb360EntityInvoiceActiveIndex = -1;
          renderCb360EntityInvoiceList([], listContainer, mainInput, searchInput, dropdown, chevron);
          return;
        }
        const filtered = cb360EntityInvoiceData.filter(item => item.label.toLowerCase().includes(term));
        cb360EntityInvoiceActiveIndex = filtered.length > 0 ? 0 : -1;
        renderCb360EntityInvoiceList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
      });      
      searchInput.addEventListener('keydown', (e) => {
        const term = searchInput.value.toLowerCase().trim();
        if (!term) return;
        const filtered = cb360EntityInvoiceData.filter(item => item.label.toLowerCase().includes(term));        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360EntityInvoiceActiveIndex = (cb360EntityInvoiceActiveIndex + 1) % filtered.length;
          renderCb360EntityInvoiceList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360EntityInvoiceActiveIndex = (cb360EntityInvoiceActiveIndex - 1 + filtered.length) % filtered.length;
          renderCb360EntityInvoiceList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = filtered[cb360EntityInvoiceActiveIndex];
          if (chosen) {
            cb360EntityInvoiceSelected = chosen;
            mainInput.value = chosen.label;
            setDropdownOpen(false);
          }
        } else if (e.key === 'Escape') {
          setDropdownOpen(false);
        }
      });      
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
    }
    // Ent. Faturar — FETCH: fetchCb360EntityInvoiceList()
    async function fetchCb360EntityInvoiceList() {
      try {
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!currentCorpOperNr) {
          console.error("Erro: Operador ativo não definido.");
          return [];
        }
        const url = `${SUPABASE_URL}/rest/v1/cb360_entities?select=*&corp_oper_nr=eq.${currentCorpOperNr}`;
        const response = await supaFetch(url, { method: 'GET' });
        if (!response.ok) {
          console.error('Erro ao consultar cb360_entities para furação:', response.status);
          return [];
        }
        const data = await response.json();
        return data.map((item, index) => {
          let ent_group = 'Entidades';
          const ent_type = String(item.ent_type || '').toLowerCase();          
          if (ent_type.includes('particular') || ent_type.includes('p')) {
            ent_group = 'Particulares';
          } else if (ent_type.includes('sócio') || ent_type.includes('socio') || ent_type.includes('s')) {
            ent_group = 'Sócios';
          } else {
            ent_group = 'Entidades';
          }
          const ent_code = item.ent_code || '';
          const ent_name = item.ent_name || '';
          return {
            id: item.id || index + 1,
            label: `${ent_code} - ${ent_name}`,
            group: ent_group
          };
        });
      } catch (err) {
        console.error('Erro em fetchCb360EntityInvoiceList:', err);
        return [];
      }
    }
    // Ent. Faturar — RENDER: renderCb360EntityInvoiceList()
    function renderCb360EntityInvoiceList(filteredList, listContainer, mainInput, searchInput, dropdown, chevron) {
      listContainer.innerHTML = '';
      const term = searchInput ? searchInput.value.trim() : '';
      // Se não houver texto de pesquisa, mostra apenas a linha em branco (os grupos não aparecem)
      if (!term) {
        const blankLine = document.createElement('div');
        blankLine.innerHTML = '&nbsp;';
        blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
        blankLine.addEventListener('click', () => {
          cb360EntityInvoiceSelected = null;
          mainInput.value = '';
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(blankLine);
        return;
      }
      if (filteredList.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'Sem resultados.';
        empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
        listContainer.appendChild(empty);
        return;
      }
      const grupos = ['Entidades', 'Particulares', 'Sócios'];
      let globalIdx = 0;
      grupos.forEach(grupoName => {
        const itensDoGrupo = filteredList.filter(item => item.group === grupoName);
        if (itensDoGrupo.length === 0) return;
        const groupHeader = document.createElement('div');
        groupHeader.textContent = grupoName.toUpperCase();
        groupHeader.style.cssText = 'padding:6px 10px; font-size:10px; font-weight:bold; background:#e9ecef; color:#555; border-top:1px solid #ddd; border-bottom:1px solid #ddd;';
        listContainer.appendChild(groupHeader);
        itensDoGrupo.forEach(item => {
          const currentIdx = globalIdx;
          const isActive = currentIdx === cb360EntityInvoiceActiveIndex;
          const line = document.createElement('div');
          line.textContent = item.label;
          line.style.cssText = `padding:6px 10px 6px 20px; font-size:11px; cursor:pointer; background:${isActive ? '#2b6ecb' : '#fff'}; color:${isActive ? '#fff' : '#333'};`;
          line.addEventListener('mouseenter', () => {
            cb360EntityInvoiceActiveIndex = currentIdx;
            let pointer = 0;
            Array.from(listContainer.children).forEach(child => {
              if (!child.style.fontWeight) { // Se não for cabeçalho
                const active = pointer === cb360EntityInvoiceActiveIndex;
                child.style.background = active ? '#2b6ecb' : '#fff';
                child.style.color = active ? '#fff' : '#333';
                pointer++;
              }
            });
          });
          line.addEventListener('click', () => {
            cb360EntityInvoiceSelected = item;
            mainInput.value = item.label;
            dropdown.style.display = 'none';
            if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
          });
          listContainer.appendChild(line);
          globalIdx++;
        });
      });
      let pointer = 0;
      let targetElement = null;
      Array.from(listContainer.children).forEach(child => {
        if (!child.style.fontWeight) {
          if (pointer === cb360EntityInvoiceActiveIndex) targetElement = child;
          pointer++;
        }
      });
      if (targetElement) targetElement.scrollIntoView({ block: 'nearest' });
    }
    // ---- 5.6 LOCALIZAÇÃO ----
    // Morada — INITIALIZE: initCb360AddressAutocomplete()
    function initCb360AddressAutocomplete() {
      const input = document.getElementById('goc-address');
      const suggestionsBox = document.getElementById('goc-address-suggestions');
      if (!input || !suggestionsBox) return;
      input.addEventListener('input', () => {
        const query = input.value.trim();
        clearTimeout(cb360AddressSearchTimeout);
        if (query.length < 4) {
          suggestionsBox.style.display = 'none';
          suggestionsBox.innerHTML = '';
          return;
        }
        cb360AddressSearchTimeout = setTimeout(() => searchCb360Address(query), 200);
      });
      document.addEventListener('click', (e) => {
        if (e.target !== input && !suggestionsBox.contains(e.target)) {
          suggestionsBox.style.display = 'none';
        }
      });
    }
    // Morada — SEARCH: searchCb360Address()
    async function searchCb360Address(query) {
      const suggestionsBox = document.getElementById('goc-address-suggestions');
      if (!suggestionsBox) return;
      if (cb360AddressSearchController) cb360AddressSearchController.abort();
      cb360AddressSearchController = new AbortController();
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pt&addressdetails=1&limit=8&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {signal: cb360AddressSearchController.signal, headers: {'Accept-Language': 'pt-PT'}});
        if (!response.ok) {suggestionsBox.style.display = 'none'; return;}
        const results = await response.json();
        if (!results.length) {
          suggestionsBox.innerHTML = `<div style="padding:8px 10px; color:#999;">Sem resultados.</div>`;
          suggestionsBox.style.display = 'block';
          return;
        }
        suggestionsBox.innerHTML = results.map((r, idx) => `<div class="goc-address-suggestion" data-idx="${idx}" style="padding:6px 10px; cursor:pointer; border-bottom:1px solid #eee;">${r.display_name}</div>`).join('');
        suggestionsBox.style.display = 'block';
        suggestionsBox.querySelectorAll('.goc-address-suggestion').forEach(el => {
          el.addEventListener('mouseenter', () => {el.style.background = '#f0f6ff';});
          el.addEventListener('mouseleave', () => {el.style.background = '#fff';});
          el.addEventListener('click', () => {
            applyCb360AddressSuggestion(results[el.dataset.idx]);
            suggestionsBox.style.display = 'none';
          });
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Erro pesquisa de morada:', err);
      }
    }    
    /// Função auxiliar robusta com limpeza de acentos e correspondência exata/parcial segura
    function selectCb360OptionByPartialText(selectElement, searchText) {
      if (!selectElement || !searchText) return false;
      const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();  
      const cleanSearch = normalize(searchText);  
      // 1. Tenta correspondência exata (normalizada sem acentos)
      for (let option of selectElement.options) {
        if (normalize(option.text) === cleanSearch) {
          if (selectElement.value !== option.value) {
            selectElement.value = option.value;
            selectElement.dispatchEvent(new Event('change'));
          }
          return true;
        }
      }
      // 2. Tenta correspondência parcial segura (se o nome da BD contiver o texto pesquisado ou vice-versa)
      for (let option of selectElement.options) {
        const optTextNorm = normalize(option.text);
        if (optTextNorm.includes(cleanSearch) || cleanSearch.includes(optTextNorm)) {
          if (optTextNorm.length > 3 && cleanSearch.length > 3) { // Evita correspondências muito curtas
            if (selectElement.value !== option.value) {
              selectElement.value = option.value;
              selectElement.dispatchEvent(new Event('change'));
            }
            return true;
          }
        }
      }  
      // Se não encontrar nenhuma correspondência válida, NÃO mexe para evitar selecionar valores errados (como o "Amor")
      return false;
    }
    // Morada — APPLY: applyCb360AddressSuggestion()
    async function applyCb360AddressSuggestion(result) {
      const addr = result.address || {};
      const road = addr.road || addr.pedestrian || addr.footway || '';
      const houseNumber = addr.house_number || '';  
      const city = addr.city || addr.town || addr.village || addr.municipality || '';
      const postcode = addr.postcode || '';
      // Preenchimento de campos de texto básicos
      document.getElementById('goc-address').value = road || result.display_name.split(',')[0];
      if (houseNumber) document.getElementById('goc-address-nr').value = houseNumber;
      document.getElementById('goc-address-city').value = city;
      if (postcode.includes('-')) {
        const [cp1, cp2] = postcode.split('-');
        document.getElementById('goc-cp1').value = cp1 || '';
        document.getElementById('goc-cp2').value = cp2 || '';
      }
      document.getElementById('goc-cp-city').value = city;
      // Coordenadas e Mapa
      document.getElementById('goc-coord-x').value = parseFloat(result.lat).toFixed(6);
      document.getElementById('goc-coord-y').value = parseFloat(result.lon).toFixed(6);
      updateCb360Map();
      const districtSel = document.getElementById('goc-district_select');
      const councilSel = document.getElementById('goc-council_select');
      // Concelho principal
      const councilName = addr.city || addr.town || addr.municipality || addr.city_district || '';  
      // Freguesia: Prioridade absoluta ao suburb/village real. Só recorre à sede se vier totalmente vazio.
      let parishName = addr.suburb || addr.village || addr.neighbourhood || addr.quarter || '';
      if (!parishName) {
        parishName = addr.city_district || councilName;
      }
      // Distrito via código ISO
      const isoCode = addr['ISO3166-2-lvl6'] || '';
      let districtOk = false;
      if (districtSel && isoCode.startsWith('PT-')) {
        const districtCode = parseInt(isoCode.replace('PT-', ''), 10);
        const hasDistrictOption = [...districtSel.options].some(o => o.value === String(districtCode));
        if (hasDistrictOption) {
          districtSel.value = String(districtCode);
          districtSel.dispatchEvent(new Event('change'));
          districtOk = true;
        }
      }
      if (!districtOk && districtSel) {
        if (selectCb360OptionByPartialText(districtSel, addr.state || '')) {
          districtOk = true;
        }
      }
      // Sequência em cascata passando o parishName diretamente para o populate
      if (districtOk && districtSel.value) {
        await populateCouncilSelectByDistrict(districtSel.value, districtSel.id);    
        if (councilSel && councilName) {
          if (selectCb360OptionByPartialText(councilSel, councilName)) {
            // Passamos o parishName diretamente para dentro, selecionando a freguesia no momento da criação
            await populateParishesByCouncil(councilSel.value, councilSel.id, parishName);
          }
        }
      }
    }
    // Morada — HELPERS: normalizeCb360Text() / selectCb360OptionByText()
    function normalizeCb360Text(str) {
      return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }
    function selectCb360OptionByText(selectEl, text) {
      if (!selectEl || !text) return false;
      const target = normalizeCb360Text(text);
      const option = Array.from(selectEl.options).find(opt => normalizeCb360Text(opt.textContent) === target);
      if (!option) return false;
      selectEl.value = option.value;
      return true;
    }
    // Distrito/Concelho/Freguesia — APPLY: applyLocationCb360Edit()
    function applyLocationCb360Edit(oc) {
      const districtSel = document.getElementById('goc-district_select');
      const municipalitySel = document.getElementById('goc-council_select');
      const parishSel = document.getElementById('goc-parish_select');
      if (!districtSel) return;
      if (oc.district_id) {
        districtSel.value = String(oc.district_id);
        districtSel.dispatchEvent(new Event('change'));
      }
      setTimeout(() => {
        if (municipalitySel && oc.county_id) {
          municipalitySel.value = String(oc.county_id);
          municipalitySel.dispatchEvent(new Event('change'));
        }
        setTimeout(() => {
          if (parishSel && oc.parish) {
            parishSel.value = oc.parish;
          }
        }, 150);
      }, 150);
    }
    // Fora da Área — INITIALIZE: initializeOutOfBoundsCombobox()
    function initializeOutOfBoundsCombobox(list, selectedId = null) {
      cb360OutOfBoundsData = list || [];
      cb360OutOfBoundsSelected = selectedId ? (list.find(i => i.id == selectedId) || null) : null;
      cb360OutOfBoundsActiveIndex = -1;
      const mainInput = document.getElementById('goc-out-of-bounds-input');
      const dropdown = document.getElementById('goc-out-of-bounds-dropdown');
      const searchInput = document.getElementById('goc-out-of-bounds-search');
      const listContainer = document.getElementById('goc-out-of-bounds-list');
      const chevron = document.getElementById('goc-out-of-bounds-chevron');
      if (!mainInput || !dropdown || !searchInput || !listContainer) return;
      mainInput.value = cb360OutOfBoundsSelected ? cb360OutOfBoundsSelected.label : '';
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)';
      }
      function openDropdown() {
        if (mainInput.disabled) return;
        searchInput.value = '';
        cb360OutOfBoundsActiveIndex = -1;
        renderCb360OutOfBoundsList(cb360OutOfBoundsData, listContainer, mainInput, searchInput, dropdown, chevron);
        setDropdownOpen(true);
        listContainer.scrollTop = 0;
        setTimeout(() => searchInput.focus(), 0);
      }
      mainInput.addEventListener('click', openDropdown);
      mainInput.addEventListener('focus', openDropdown);
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360OutOfBoundsData.filter(item => item.label.toLowerCase().includes(term));
        cb360OutOfBoundsActiveIndex = -1;
        renderCb360OutOfBoundsList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
      });
      searchInput.addEventListener('keydown', (e) => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360OutOfBoundsData.filter(item => item.label.toLowerCase().includes(term));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360OutOfBoundsActiveIndex = (cb360OutOfBoundsActiveIndex + 1) % filtered.length;
          renderCb360OutOfBoundsList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360OutOfBoundsActiveIndex = (cb360OutOfBoundsActiveIndex - 1 + filtered.length) % filtered.length;
          renderCb360OutOfBoundsList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = filtered[cb360OutOfBoundsActiveIndex];
          if (chosen) {
            cb360OutOfBoundsSelected = chosen;
            mainInput.value = chosen.label;
            setDropdownOpen(false);
          }
        } else if (e.key === 'Escape') {
          setDropdownOpen(false);
        }
      });
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
    }
    // Fora da Área — FETCH: fetchCb360OutOfBoundsList()
    async function fetchCb360OutOfBoundsList() {
      try {
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/national_corporations?select=oper_nr,cb_name&order=oper_nr.asc`, { method: 'GET' });
        if (!response.ok) {
          console.error('Erro ao obter corpos:', response.status);
          return [];
        }
        const data = await response.json();
        return data.map(d => ({id: d.oper_nr, label: `${d.oper_nr} - ${d.cb_name}`}));
      } catch (err) {
        console.error('Erro fetchCb360OutOfBoundsList:', err);
        return [];
      }
    }
    // Fora da Área — RENDER: renderCb360OutOfBoundsList()
    function renderCb360OutOfBoundsList(list, listContainer, mainInput, searchInput, dropdown, chevron) {
      listContainer.innerHTML = '';
      const blankLine = document.createElement('div');
      blankLine.innerHTML = '&nbsp;';
      blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
      blankLine.addEventListener('mouseenter', () => {
        cb360OutOfBoundsActiveIndex = -1;
        Array.from(listContainer.children).forEach((el, i) => {
          el.style.background = i === 0 ? '#2b6ecb' : '#fff';
          if (i !== 0) el.style.color = '#333';
        });
      });
      blankLine.addEventListener('click', () => {
        cb360OutOfBoundsSelected = null;
        mainInput.value = '';
        dropdown.style.display = 'none';
        if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
      });
      listContainer.appendChild(blankLine);
      if (list.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'Sem resultados.';
        empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
        listContainer.appendChild(empty);
        return;
      }
      list.forEach((item, idx) => {
        const isActive = idx === cb360OutOfBoundsActiveIndex;
        const line = document.createElement('div');
        line.textContent = item.label;
        line.style.padding = '6px 10px';
        line.style.fontSize = '11px';
        line.style.cursor = 'pointer';
        line.style.background = isActive ? '#2b6ecb' : '#fff';
        line.style.color = isActive ? '#fff' : '#333';
        line.addEventListener('mouseenter', () => {
          cb360OutOfBoundsActiveIndex = idx;
          Array.from(listContainer.children).forEach((el, i) => {
            if (i === 0) {
              el.style.background = '#fff';
            } else {
              const active = (i - 1) === idx;
              el.style.background = active ? '#2b6ecb' : '#fff';
              el.style.color = active ? '#fff' : '#333';
            }
          });
        });
        line.addEventListener('click', () => {
          cb360OutOfBoundsSelected = item;
          mainInput.value = item.label;
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(line);
      });
      const activeEl = listContainer.children[cb360OutOfBoundsActiveIndex + 1];
      if (activeEl) activeEl.scrollIntoView({block: 'nearest'});
    }
    // Mapa/Coordenadas — INITIALIZE: initializeMap()
    function initializeMap(inccident = null) {
      const container = document.getElementById('goc-map');
      if (!container || typeof L === 'undefined') {
        console.error('Leaflet não carregado ou container inexistente.');
        return;
      }
      const lat = parseFloat(inccident?.coord_x) || 37.014151;
      const lng = parseFloat(inccident?.coord_y) || -7.935543;      
      cb360LeafletMap = L.map('goc-map').setView([lat, lng], inccident ? 16 : 15);      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 20
      }).addTo(cb360LeafletMap);
      cb360LeafletMarker = L.marker([lat, lng], { draggable: true }).addTo(cb360LeafletMap);
      cb360LeafletMarker.on('dragend', () => {
        updateCoordinateDisplay();
      });
      cb360LeafletMap.on('click', (e) => {
        cb360LeafletMarker.setLatLng(e.latlng);
        updateCoordinateDisplay();
      });
      setTimeout(() => {
        if (cb360LeafletMap) cb360LeafletMap.invalidateSize();
      }, 275);
      updateCoordinateDisplay();
    }
    // Mapa/Coordenadas — UPDATE: updateCb360Map()
    function updateCb360Map() {
      if (!cb360LeafletMap || !cb360LeafletMarker) return;
      const lat = parseFloat(document.getElementById('goc-coord-x').value);
      const lng = parseFloat(document.getElementById('goc-coord-y').value);
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Coordenadas inválidas.');
        return;
      }
      cb360LeafletMap.setView([lat, lng], 16);
      cb360LeafletMarker.setLatLng([lat, lng]);
    }
    function decimalToDMS(value, lat = true) {
      const dir = lat
        ? (value >= 0 ? 'N' : 'S')
        : (value >= 0 ? 'E' : 'W');
      value = Math.abs(value);
      const deg = Math.floor(value);
      const minFloat = (value - deg) * 60;
      const min = Math.floor(minFloat);
      const sec = Math.round((minFloat - min) * 60);
      return `${deg.toString().padStart(3, '0')} º ${min.toString().padStart(2, '0')} ' ${sec.toString().padStart(2, '0')} '' ${dir}`;
    }
    function decimalToSIRESP(value, lat = true) {
      const dir = lat
        ? (value >= 0 ? 'N' : 'S')
        : (value >= 0 ? 'E' : 'W');
      value = Math.abs(value);
      const deg = Math.floor(value);
      const min = (value - deg) * 60;
      return `${deg.toString().padStart(3,'0')} º ${min.toFixed(4).padStart(7,'0')} " ${dir}`;
    }
    function updateCoordinateDisplay() {
      const system = document.getElementById('goc-coord-system').value;
      const coordX = document.getElementById('goc-coord-x');
      const coordY = document.getElementById('goc-coord-y');
      const lat = cb360LeafletMarker.getLatLng().lat;
      const lng = cb360LeafletMarker.getLatLng().lng;
      if (system === "Decimais") {
        coordX.value = lat.toFixed(6);
        coordY.value = lng.toFixed(6);
      } else if (system === "WGS84") {
        coordX.value = decimalToDMS(lat, true);
        coordY.value = decimalToDMS(lng, false);
      } else if (system === "SIRESP") {
        coordX.value = decimalToSIRESP(lat, true);
        coordY.value = decimalToSIRESP(lng, false);
      }
    }
    // ---- 5.7 CHAMADAS / LOGS ----
    // UPDATE: updateCb360OptelPatents()
    async function updateCb360OptelPatents(oc) {
      const [startPatent, endPatent] = await Promise.all([getPatentByFullName(oc.optel_user), getPatentByFullName(oc.optel_end_user)]);
      const el = document.getElementById('goc-logs-optel');
      if (!el) return;
      const startText = oc.optel_user ? `${oc.optel_user}${startPatent ? ` (${startPatent})` : ''}` : '';
      const endText = oc.optel_end_user ? `${oc.optel_end_user}${endPatent ? ` (${endPatent})` : ''}` : '';
      el.innerHTML = `
        <div>OPTEL: <span style="font-weight:600;">${formatTimeStampPT(oc.created_at)} - ${startText}</span></div>
        <div>Última alteração: <span style="font-weight:600;">${formatTimeStampPT(oc.updated_at)} - ${endText}</span></div>
      `;
    }
    // FETCH: getPatentByFullName()
    async function getPatentByFullName(fullName) {
      if (!fullName) return '';
      const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      try {
        const resp = await supaFetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=patent&full_name=eq.${encodeURIComponent(fullName)}&corp_oper_nr=eq.${corpNr}&limit=1`);
        const data = await resp.json();
        return data?.[0]?.patent || '';
      } catch (err) {
        console.error('Erro ao obter patente OPTEL:', err);
        return '';
      }
    }
    // HELPERS: formatDatePT() / formatTimePT() / formatTimeStampPT()
    function formatDatePT(date) {
      if (!date) return '';
      const partes = date.split('-');
      if (partes.length !== 3) return date;
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    function formatTimePT(hour) {
      if (!hour) return '';
      return hour.substring(0, 5);
    }
    function formatTimeStampPT(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      if (isNaN(d)) return '';
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    // ---- 5.8 CICLO DE VIDA DO FORMULÁRIO (abrir/preencher/validar/guardar/fechar)
    //      Não pertence a um campo específico — controla o formulário inteiro.
    // OPEN: openCb360Incidents()
    async function openCb360Incidents(mode, incident = null) {
      cb360IncidentMode = mode;
      cb360CurrentIncident = incident;
      cb360ActiveTab = 'characterization';
      const majorCard = document.querySelector('#page-cb360-redund .major-card');
      if (majorCard) majorCard.style.display = 'none';
      await renderCb360OccorrenceForm();
      const wrapper = document.getElementById('cb360-incident-wrapper');
      const listBResp = await fetchCb360BRespList();
      const classificationList = await fetchCb360ClassOcorrList();
      const corporationsList = await fetchCb360OutOfBoundsList();
      const entityInvoiceList = await fetchCb360EntityInvoiceList();
      let dispatchedResources = [];
      let internalNr = null;
      if (mode === 'novo') {
        internalNr = await generateInternalNr();
      } else {
        dispatchedResources = await fetchDispatchData(incident.internal_number);
        cb360ResourcesVictims = await fetchCb360Victims(incident.internal_number);
      }
      wrapper.style.display = 'block';
      applyCb360IncidentMode(mode);
      if (mode === 'novo') {
        const today = new Date();
        document.getElementById('goc-alert-date').value = today.toISOString().split('T')[0];
        document.getElementById('goc-alert-hour').value = today.toTimeString().slice(0, 5);
        document.getElementById('goc-internal-nr').value = internalNr;
        clearCb360Fields();
        cb360ResourcesVehicles = [];
        cb360ResourcesFirefighters = [];
        cb360ResourcesVictims = [];
        cb360PendingClosed = false;
        await refreshCb360VehicleRegistrations();
        renderCb360ResourcesTab();
        renderCb360VictimsTab();
      } else {
        fillCb360Fields(incident);
        cb360ResourcesVehicles = dispatchedResources.map(mean => ({
          id: String(mean.id), vehicle: mean.vehicle || '', crew: mean.cb360_dispatch_crew?.length || 0, departureDateCB: mean.cb_departure_date || '', departureTimeCB: mean.cb_departure_time || '',
          arrivalDateScene: mean.scene_arrival_date || '', arrivalTimeScene: mean.scene_arrival_time || '', departureDateScene: mean.scene_departure_date || '', departureTimeScene: mean.scene_departure_time || '',
          arrivalDateCB: mean.cb_arrival_date || '', arrivalTimeCB: mean.cb_arrival_time || '',kmStart: mean.km_start || '', kmEnd: mean.km_end || '', radio_issi_siresp: mean.radio_issi_siresp || '', pumpHours: mean.pump_hours ?? '', 
          pumpMinutes: mean.pump_minutes ?? '', editing: false
        }));
        cb360ResourcesFirefighters = dispatchedResources.flatMap(mean => {
          const crewList = mean.cb360_dispatch_crew || [];
          const minorNInt = crewList.length
            ? crewList.reduce((minor, actual) => String(actual.n_int) < String(minor) ? actual.n_int : minor, crewList[0].n_int) : null;
          return crewList.map(crew => ({
            id: String(crew.id), vehicle: mean.vehicle || '', confirmed: crew.n_int === minorNInt, code: crew.n_int || '', role: crew.role || '', specialty: crew.specialty || '',
            departureDate: crew.departure_date || '', departureTime: crew.departure_time || '', returnDate: crew.return_date || '', returnTime: crew.return_time || '', radio_assigned: crew.radio_assigned || '', editing: false
          }));
        });
        cb360PendingClosed = !!incident.is_closed;
        applyCb360CloseButtonState(cb360PendingClosed);
        applyCb360FieldsLockState(cb360PendingClosed);
        await refreshCb360VehicleRegistrations();
        renderCb360ResourcesTab();
        renderCb360VictimsTab();
        document.getElementById('goc-summary-duration').textContent = calculateCb360Duration(incident, cb360ResourcesVehicles);
        const isClosed = ['Encerrada', 'Falso Alarme', 'Falso Alerta', 'Anulada', 'Recusada'].includes(incident.status);
        const durationColor = isClosed ? '#2e7d32' : '#8b0000';
        document.getElementById('goc-summary-duration').style.color = durationColor;
        document.getElementById('goc-duration-icon').style.color = durationColor;
      }
      initializeFFRespCombobox(listBResp, mode === 'editar' ? incident?.resp_member_id : null);
      initializeComboboxClassification(classificationList, mode === 'editar' ? incident?.classification : null);
      initializeOutOfBoundsCombobox(corporationsList, mode === 'editar' ? incident?.outside_area_corp : null);
      initializeEntityInvoiceCombobox(entityInvoiceList, mode === 'editar' ? incident?.billing_entity : null);
      if (mode === 'editar') {
        setTimeout(() => applyLocationCb360Edit(incident), 400);
      }
      setTimeout(() => initializeMap(mode === 'editar' ? incident : null), 100);
      setTimeout(() => {
        const gocBody = document.getElementById('goc-body');
        if (gocBody) {
          gocBody.style.height = gocBody.scrollHeight + 'px';
        }
      }, 50);
    }
    // APPLY: applyCb360CloseButtonState()
    function applyCb360CloseButtonState(isClosed) {
      const btn = document.getElementById('goc-btn-close-incident');
      if (!btn) return;
      btn.style.background = isClosed ? '#28a745' : '#f0ad4e';
      btn.innerHTML = isClosed 
        ? '<i class="fa-regular fa-square-check"></i> Reabrir Ocorrência' 
        : '<i class="fa-solid fa-power-off"></i> Fechar Ocorrência';
    }
    // APPLY: applyCb360FieldsLockState()
    function applyCb360FieldsLockState(isClosed) {
      const body = document.getElementById('goc-corpo');
      if (body) {
        body.querySelectorAll('input, select, textarea').forEach(el => {
          el.disabled = isClosed;
        });
        body.querySelectorAll('button').forEach(btnEl => {
          btnEl.disabled = isClosed;
          btnEl.style.opacity = isClosed ? '0.5' : '';
          btnEl.style.cursor = isClosed ? 'not-allowed' : 'pointer';
        });
      }
      ['goc-btn-decline', 'goc-btn-save-sado', 'goc-btn-save'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = isClosed;
        btn.style.opacity = isClosed ? '0.5' : '1';
        btn.style.cursor = isClosed ? 'not-allowed' : 'pointer';
      });
    }
    // APPLY: applyCb360IncidentMode()
    function applyCb360IncidentMode(mode) {
      const isEdit = mode === 'editar';
      document.getElementById('goc-header-icon').textContent = isEdit ? '✏️' : '➕';
      document.getElementById('goc-header-title').textContent = isEdit
        ? `Editar a Ocorrência ${cb360CurrentIncident?.internal_number ?? ''}`
        : 'Novo Registo de Ocorrência';
      document.getElementById('goc-bar-summary').style.display = isEdit ? 'flex' : 'none';
      document.getElementById('goc-sidebar').style.display = 'block';
      document.getElementById('goc-block-logs').style.display = isEdit ? 'flex' : 'none';
      document.getElementById('goc-sms-block').style.display = isEdit ? 'none' : 'flex';
      ['goc-btn-add-posit', 'goc-btn-reports', 'goc-btn-decline']
        .forEach(id => {
        document.getElementById(id).style.display = isEdit ? 'inline-block' : 'none';
      });
      switchTabCb360('characterization');
    }
    // CLEAR: clearCb360Fields()
    function clearCb360Fields() {
      ['goc-sado-nr','goc-alert-source','goc-contact','goc-phone','goc-risk', 'goc-description','goc-codu','goc-associate-event','goc-address','goc-address-nr',
       'goc-address-nr-floor','goc-address-city','goc-cp1','goc-cp2','goc-cp-city','goc-reference-point','goc-coord-x','goc-coord-y','goc-observations'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      document.getElementById('goc-state').value = 'Em Curso';
      document.getElementById('goc-risk').value = 'Reduzido';
      document.getElementById('goc-out-of-bounds').checked = false;
      document.getElementById('goc-out-of-bounds-input').disabled = true;
      document.getElementById('goc-classification-input').value = '';
      document.getElementById('goc-entity-invoice-input').value = '';
      cb360SelectedRating = null;
      cb360EntityInvoiceSelected = null;
      updateCb360StateBadge();
    }
    // FILL: fillCb360Fields()
    function fillCb360Fields(oc) { 
      document.getElementById('goc-internal-nr').value = oc.internal_number ?? '';
      document.getElementById('goc-sado-nr').value = oc.sado_number ?? '';
      document.getElementById('goc-alert-date').value = oc.alert_date ?? '';
      document.getElementById('goc-alert-hour').value = oc.alert_time ?? '';
      document.getElementById('goc-state').value = oc.status ?? 'Em Curso';
      document.getElementById('goc-alert-source').value = oc.alert_source ?? '';
      document.getElementById('goc-contact').value = oc.caller ?? '';
      document.getElementById('goc-phone').value = oc.phone ?? '';
      document.getElementById('goc-risk').value = oc.risk ?? '';
      if (oc.classification) {
        cb360SelectedRating = cb360DataClassification.find(c => String(c.id) === String(oc.classification)) || null;
        document.getElementById('goc-classification-input').value = cb360SelectedRating?.label ?? '';
      } else {
        cb360SelectedRating = null;
        document.getElementById('goc-classification-input').value = '';
      }
      document.getElementById('goc-description').value = oc.description ?? '';
      document.getElementById('goc-codu').value = oc.codu ?? '';
      document.getElementById('goc-associate-event').value = oc.associate_event ?? '';
      document.getElementById('goc-address').value = oc.address ?? '';
      document.getElementById('goc-address-nr').value = oc.number ?? '';
      document.getElementById('goc-address-nr-floor').value = oc.floor ?? '';
      document.getElementById('goc-address-city').value = oc.locality ?? '';
      document.getElementById('goc-cp1').value = oc.zip_code_part1 ?? '';
      document.getElementById('goc-cp2').value = oc.zip_code_part2 ?? '';
      document.getElementById('goc-cp-city').value = oc.zip_code_locality ?? '';
      document.getElementById('goc-reference-point').value = oc.reference_point ?? '';
      document.getElementById('goc-coord-x').value = oc.coord_x ?? '';
      document.getElementById('goc-coord-y').value = oc.coord_y ?? '';
      document.getElementById('goc-out-of-bounds').checked = !!oc.outside_area;
      document.getElementById('goc-out-of-bounds-input').disabled = !oc.outside_area;
      document.getElementById('goc-observations').value = oc.observations ?? '';
      document.getElementById('goc-internal-summary').textContent = oc.internal_number ?? '';
      document.getElementById('goc-summary-sado').textContent = oc.sado_number ?? '';
      document.getElementById('goc-count-vehicles').textContent = oc.vehicle_count ?? 0;
      document.getElementById('goc-staff-count').textContent = oc.personnel_count ?? 0;
      document.getElementById('goc-count-victims').textContent = oc.victim_count ?? 0;
      document.getElementById('goc-count-people').textContent = oc.people_count ?? 0;
      document.getElementById('goc-count-aerial-means').textContent = oc.air_means_count ?? 0;
      document.getElementById('goc-summary-date').innerHTML = `${formatDatePT(oc.alert_date)}&nbsp;&nbsp;${formatTimePT(oc.alert_time)}`;      
      document.getElementById('goc-tab-count-vehicles').textContent = oc.total_means_count ? `(${oc.total_means_count})` : '';
      document.getElementById('goc-tab-count-victims').textContent =  oc.victim_count ? `(${oc.victim_count})` : '';
      document.getElementById('goc-logs-optel').innerHTML = `
        <div>OPTEL: <span style="font-weight:600;">${formatTimeStampPT(oc.created_at)} - ${oc.optel_user ?? ''}</span></div>
        <div>Última alteração: <span style="font-weight:600;">${formatTimeStampPT(oc.updated_at)} - ${oc.optel_end_user ?? ''}</span></div>
      `;
      updateCb360OptelPatents(oc);
      updateCb360StateBadge();
    }
    /* ===== VALIDAÇÃO DE FECHO ===== */
    // VALIDATE: validateVehiclesForClosure()
    function validateVehiclesForClosure() {
      return cb360ResourcesVehicles.every(v => v.departureDateCB && v.departureTimeCB && v.arrivalDateScene && v.arrivalTimeScene && v.departureDateScene && v.departureTimeScene && v.arrivalDateCB && v.arrivalTimeCB);
    }
    // VALIDATE: validateFirefightersForClosure()
    function validateFirefightersForClosure() {
      return cb360ResourcesFirefighters.every(b => b.departureDate && b.departureTime && b.returnDate && b.returnTime);
    }
    /* ===== SAVE FORM ===== */
    // SAVE: saveCb360Incident()    
    async function saveCb360Incident({sendSado} = {}) {
      if (cb360PendingClosed) {
        if (!validateVehiclesForClosure()) {
          showPopup('popup-danger', 'Não é possível fechar a ocorrência: existem veículos com dados de despacho incompletos (Chegada ao TO, Saída do TO, Chegada ao CB).');
          return;
        }
        if (!validateFirefightersForClosure()) {
          showPopup('popup-danger', 'Não é possível fechar a ocorrência: existem bombeiros sem data/hora de saída ou regresso preenchidas.');
          return;
        }
      }
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const currentUser = sessionStorage.getItem("currentUserDisplay") || sessionStorage.getItem("currentUserName") || "FMartins";
      const getVal = (id) => document.getElementById(id)?.value || null;
      const pos = cb360LeafletMarker.getLatLng();
      const newStatus = cb360PendingClosed ? 'Encerrada' : getVal('goc-state');
      const oldStatus = cb360CurrentIncident?.status || null;
      const payload = {corp_oper_nr: currentCorpOperNr, sado_number: getVal('goc-sado-nr'), alert_date: getVal('goc-alert-date'), alert_time: getVal('goc-alert-hour'), status: newStatus,
                       alert_source: getVal('goc-alert-source'), caller: getVal('goc-contact'), phone: getVal('goc-phone'), risk: getVal('goc-risk'), classification: cb360SelectedRating?.id ?? null, description: getVal('goc-description'),
                       codu: getVal('goc-codu'), resp_member_id: cb360BRespSelected?.id ?? null, billing_entity: cb360EntityInvoiceSelected?.id ?? null, associate_event: getVal('goc-associate-event'), address: getVal('goc-address'),
                       number: getVal('goc-address-nr'), floor: getVal('goc-address-nr-floor'), locality: getVal('goc-address-city'), zip_code_part1: getVal('goc-cp1'), zip_code_part2: getVal('goc-cp2'), zip_code_locality: getVal('goc-cp-city'),
                       district_id: parseInt(getVal('goc-district_select')) || null, county_id: parseInt(getVal('goc-council_select')) || null, parish: getVal('goc-parish_select'), reference_point: getVal('goc-reference-point'),
                       coord_x: pos.lat, coord_y: pos.lng, outside_area: document.getElementById('goc-out-of-bounds')?.checked || false, outside_area_corp: cb360OutOfBoundsSelected?.id ?? null, observations: getVal('goc-observations'), is_closed: cb360PendingClosed
                      };
      if (cb360IncidentMode === 'novo') { 
        payload.optel_user = currentUser;
      } else {
        payload.optel_end_user = currentUser;
      }
      try {
        const isNew = cb360IncidentMode === 'novo';
        let url = `${SUPABASE_URL}/rest/v1/cb360_incidents`;
        if (!isNew) {
          const intNr = cb360CurrentIncident?.internal_number;
          url += `?internal_number=eq.${intNr}&corp_oper_nr=eq.${currentCorpOperNr}`;
        } else {
          payload.internal_number = getVal('goc-internal-nr');
          payload.sms_option = document.querySelector('input[name="goc-sms"]:checked')?.value;
        }
        console.log(payload);
        const response = await supaFetch(url, { method: isNew ? 'POST' : 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(payload) });
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }
        const data = await response.json();
        const savedIncident = Array.isArray(data)
          ? data[0]
          : data;
        cb360CurrentIncident = savedIncident;
        const wasClosing = cb360PendingClosed;
        if (cb360PendingClosed) {
          cb360PendingClosed = false;
        }
        if (isNew) {
          cb360IncidentMode = 'editar';
          applyCb360IncidentMode('editar');
          try {
            const now = new Date();
            const pad = n => String(n).padStart(2, '0');
            const dateVal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
            const timeVal = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            const dateTimeStr = `${dateVal} ${timeVal}`;

            let authorName = currentUser;
            const patent = typeof getPatentByFullName === 'function' ? await getPatentByFullName(currentUser) : null;
            if (patent) {
              authorName = `${currentUser} (${patent})`;
            }
            const alertDate = getVal('goc-alert-date') || '';
            const alertTime = getVal('goc-alert-hour') || '';
            const formattedDateAlert = alertDate ? alertDate.split('-').reverse().join('-') : '';
            const classificationText = cb360SelectedRating ? `${cb360SelectedRating.id} - ${cb360SelectedRating.name || ''}` : (payload.classification || '');
            const localityText = getVal('goc-address-city') || getVal('goc-address') || '';
            const timelineInfo = `Nr. Ocorrência: ${savedIncident.internal_number} Estado: ${payload.status} Início: ${alertTime} ${formattedDateAlert} Classificação: ${classificationText} Local: ${localityText}`;
            const timelinePayload = {internal_number: savedIncident.internal_number, date_val: dateVal, time_val: timeVal, date_time: dateTimeStr, type_val: 'Comunicação', from_val: '', to_val: '', info_val: timelineInfo, person_name: authorName};
            const timelineHeaders = getSupabaseHeaders();
            timelineHeaders['Content-Type'] = 'application/json';
            timelineHeaders['Prefer'] = 'return=representation';
            const tResponse = await fetch(`${SUPABASE_URL}/rest/v1/cb360_timeline_events`, {
              method: 'POST',
              headers: timelineHeaders,
              body: JSON.stringify(timelinePayload)
            });
            if (tResponse.ok) {
              const tData = await tResponse.json();
              if (tData && tData[0] && typeof cb360TimelineEvents !== 'undefined') {
                cb360TimelineEvents.push({
                  id: tData[0].id, internal_number: tData[0].internal_number, dateVal: tData[0].date_val, timeVal: tData[0].time_val, dateTime: tData[0].date_time, typeVal: tData[0].type_val, fromVal: tData[0].from_val,
                  toVal: tData[0].to_val, infoVal: tData[0].info_val, personName: tData[0].person_name
                });
                if (typeof renderCb360TimelineList === 'function') {
                  renderCb360TimelineList();
                }
              }
            }
          } catch (tErr) {
            console.error('Erro ao registar abertura na fita do tempo:', tErr);
          }
          const dispatchedResources = await fetchDispatchData(savedIncident.internal_number);
          cb360ResourcesVehicles = dispatchedResources.map(mean => ({
            id: String(mean.id), vehicle: mean.vehicle || '', crew: mean.cb360_dispatch_crew?.length || 0, departureDateCB: mean.cb_departure_date || '', departureTimeCB: mean.cb_departure_time || '', arrivalDateScene: mean.scene_arrival_date || '', arrivalTimeScene: mean.scene_arrival_time || '', departureDateScene: mean.scene_departure_date || '', departureTimeScene: mean.scene_departure_time || '', arrivalDateCB: mean.cb_arrival_date || '', arrivalTimeCB: mean.cb_arrival_time || '', kmStart: mean.km_start || '', kmEnd: mean.km_end || '', radio_issi_siresp: mean.radio_issi_siresp || '', editing: false
          }));
          cb360ResourcesFirefighters =
            dispatchedResources.flatMap(mean => {
            const crewList = mean.cb360_dispatch_crew || [];
            const minorNInt = crewList.length
              ? crewList.reduce(
                (minor, actual) =>
                String(actual.n_int) < String(minor)
                ? actual.n_int
                : minor,
                crewList[0].n_int
              )
              : null;
            return crewList.map(crew => ({
              id: String(crew.id), vehicle: mean.vehicle || '', confirmed: crew.n_int === minorNInt, code: crew.n_int || '', role: crew.role || '', specialty: crew.specialty || '', departureDate: crew.departure_date || '', 
              departureTime: crew.departure_time || '',  returnDate: crew.return_date || '', returnTime: crew.return_time || '', radio_assigned: crew.radio_assigned || '', editing: false
            }));
          });
          await refreshCb360VehicleRegistrations();
        } else {
          if (oldStatus && oldStatus !== newStatus) {
            try {
              const now = new Date();
              const pad = n => String(n).padStart(2, '0');
              const dateVal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
              const timeVal = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
              const dateTimeStr = `${dateVal} ${timeVal}`;
              let authorName = currentUser;
              const patent = typeof getPatentByFullName === 'function' ? await getPatentByFullName(currentUser) : null;
              if (patent) {
                authorName = `${currentUser} (${patent})`;
              }
              const timelineInfo = `Estado da Ocorrência ${savedIncident.internal_number} alterado para ${newStatus}`;
              const timelinePayload = {internal_number: savedIncident.internal_number, date_val: dateVal, time_val: timeVal, date_time: dateTimeStr, type_val: 'Comunicação', from_val: '', to_val: '', info_val: timelineInfo, person_name: authorName};
              const timelineHeaders = getSupabaseHeaders();
              timelineHeaders['Content-Type'] = 'application/json';
              timelineHeaders['Prefer'] = 'return=representation';
              const tResponse = await fetch(`${SUPABASE_URL}/rest/v1/cb360_timeline_events`, {
                method: 'POST',
                headers: timelineHeaders,
                body: JSON.stringify(timelinePayload)
              });
              if (tResponse.ok) {
                const tData = await tResponse.json();
                if (tData && tData[0] && typeof cb360TimelineEvents !== 'undefined') {
                  cb360TimelineEvents.push({
                    id: tData[0].id, internal_number: tData[0].internal_number, dateVal: tData[0].date_val, timeVal: tData[0].time_val, dateTime: tData[0].date_time, typeVal: tData[0].type_val, fromVal: tData[0].from_val,
                    toVal: tData[0].to_val, infoVal: tData[0].info_val, personName: tData[0].person_name
                  });
                  if (typeof renderCb360TimelineList === 'function') {
                    renderCb360TimelineList();
                  }
                }
              }
            } catch (tErr) {
              console.error('Erro ao registar alteração de estado na fita do tempo:', tErr);
            }
          }
        }
        fillCb360Fields(savedIncident);
        const alertSourceSelect = document.getElementById('goc-alert-source');
        if (alertSourceSelect) {
          alertSourceSelect.value = payload.alert_source || '';
        }
        renderCb360ResourcesTab();
        renderCb360VictimsTable();
        applyCb360CloseButtonState(false);
        applyCb360FieldsLockState(
          savedIncident.is_closed
        );
        document.getElementById('goc-summary-duration').textContent = calculateCb360Duration(savedIncident, cb360ResourcesVehicles);
        const isClosed = ['Encerrada', 'Falso Alarme', 'Falso Alerta', 'Anulada', 'Recusada'].includes(savedIncident.status);
        const durationColor = isClosed ? '#2e7d32' : '#8b0000';
        document.getElementById('goc-summary-duration').style.color = durationColor;
        document.getElementById('goc-duration-icon').style.color = durationColor;
        searchCb360Incidents();
        showPopup('popup-success', wasClosing
          ? 'Ocorrência encerrada com sucesso!'
          : (isNew ? 'Ocorrência gerada com sucesso!' : 'Ocorrência atualizada com sucesso!'));
        setTimeout(() => {
          closeCb360Incident();
        }, 0);
      } catch (err) {
        console.error('Falha ao guardar CB360:', err);
        alert('Erro ao guardar a ocorrência.');
      }
    }
    /* ===== CLOSE FORM ===== */
    // CLOSE: closeCb360Incident()
    function closeCb360Incident() {
      const wrapper = document.getElementById('cb360-incident-wrapper');
      if (wrapper) wrapper.remove();
      if (cb360LeafletMap) {
        cb360LeafletMap.remove();
        cb360LeafletMap = null;
        cb360LeafletMarker = null;
      }
      cb360BRespData = [];
      cb360BRespSelected = null;
      cb360DataClassification = [];
      cb360SelectedRating = null;
      cb360IncidentMode = 'novo';
      cb360CurrentIncident = null;
      cb360ActiveTab = 'characterization';
      const majorCard = document.querySelector('#page-cb360-redund .major-card');
      if (majorCard) majorCard.style.display = 'block';
      if (typeof setDateFilter === "function") {
        const tbody = document.getElementById('cb360-table-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="19" style="padding:20px; text-align:center; color:#888;">A carregar...</td></tr>`;
        setDateFilter('day');
      } else {
        searchCb360Incidents();
      }
    }
    // ==============================================================================
    // == 6. MEIOS (Viaturas / Bombeiros / Despacho)                              ==
    // ==============================================================================
    // ---- RENDER (shell da tab): renderCb360ResourcesTab() ----
    function renderCb360ResourcesTab() {
      const container = document.getElementById('goc-tab-content-vehicles');
      if (!container) return;
      const arrowSort = `<span style="color:#bbb; font-size:9px; margin-left:2px;">⇅</span>`;
      const isClosed = !!cb360CurrentIncident?.is_closed;
      container.innerHTML = `
      <style>
          #cb360-table-container::-webkit-scrollbar {width: 8px; height: 8px;}
          #cb360-table-container::-webkit-scrollbar-track {background: #f0f0f0; border-radius: 10px;}
          #cb360-table-container::-webkit-scrollbar-thumb {background: linear-gradient(180deg, #b0b0b0, #888); border-radius: 10px; border: 2px solid #f0f0f0;}
          #cb360-table-container::-webkit-scrollbar-thumb:hover {background: linear-gradient(180deg, #999, #6b6b6b);}
          .cb360-edit-btn:hover i, .goc-vehicle-toggle:hover i, .goc-firefighter-toggle:hover i, .goc-victim-toggle:hover i {color: #1a4d8f;}
          .cb360-delete-btn:hover i, .goc-vehicle-remove:hover i, .goc-firefighter-remove:hover i, .goc-victim-remove:hover i {color: #a94442;}
        </style>
        <div style="margin-bottom:20px;">
          <div id="goc-vehicles-header" style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:14px; padding:4px 0; color:#2b6ecb;">
            <span id="goc-vehicles-label" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
              <span id="goc-vehicles-arrow" style="font-size:16px;">▾</span> Viaturas:
            </span>
            <div style="margin-left:auto; margin-right:20px; display:flex; align-items:center; gap:30px;">
              <span id="goc-btn-location" style="color:#5bc0de; cursor:pointer;" title="Localizar"><i class="fa-solid fa-location-dot" style="font-size:18px; color:#666;"></i></span>
              <span id="goc-btn-pin" style="color:#5bc0de; cursor:pointer; margin-top:5px;" title="Fixar"><i class="fa-solid fa-thumbtack" style="font-size:18px; color:#666;"></i></span>
            </div>
          </div>
          <div id="goc-vehicles-wrap" style="overflow-x:auto; overflow-y:auto; max-height:255px; border:1px solid #eee; border-radius:4px;">
            <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px;">
              <thead>
                <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:10px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">${arrowSort}</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:10px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">#</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:100px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Viatura</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:20px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;"><i class="fa-solid fa-users"></i></th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:80px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;" colspan="2">Saída do C.B.</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:60px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;" colspan="2">Chegada ao T.O.</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:100px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;" colspan="2">Saída do T.O.</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:100px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;" colspan="2">Chegada ao C.B.</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:100px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;" colspan="2">Kms</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;" colspan="2">
                ${isClosed ? '' : `<button id="goc-btn-add-vehicles" style="background:#2b6ecb; color:#fff; border:none; width:20px; height:20px; border-radius:50%; cursor:pointer; font-size:12px; line-height:1;">+</button>`}
                  </th>
                </tr>
                <tr style="background:#f7f7f7; color:#555; font-size:10px; text-align:center;">
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;"></th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;"></th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;"></th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;"></th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Data</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Hora</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Data</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Hora</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Data</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Hora</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Data</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:100px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Hora</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:120px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Início</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; padding:4px 8px; width:120px; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Fim</th>
                  <th style="position:sticky; top:34px; z-index:2; background:#e9e9e9; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;" colspan="2"></th>
                </tr>
              </thead>
              <tbody id="goc-vehicles-table-body"></tbody>
            </table>
          </div>
        </div>        
        <div id="goc-firefighters-header" style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:14px; padding:4px 0; color:#2b6ecb;">
          <span id="goc-firefighters-label" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <span id="goc-firefighters-arrow" style="font-size:16px;">▾</span> Bombeiros:
          </span>
        </div>
        <div id="goc-firefighters-wrap" style="overflow-x:auto; overflow-y:auto; max-height:237px; border:1px solid #eee; border-radius:4px; max-height:233px; ">
          <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px; ">
            <thead>
              <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:10px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">${arrowSort}</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:10px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">#</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:100px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Viatura</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:20px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;"><i class="fa-solid fa-user"></i></th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:150px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Código Bombeiros</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:150px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Função</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:50px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Esp.</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:150px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Data Saída</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:150px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Hora Saída</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:150px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Data Regr.</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:150px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;">Hora Regr.</th>
                <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4; text-align:center;" colspan="2">
              ${isClosed ? '' : `<button id="goc-btn-add-firefighters" style="background:#2b6ecb; color:#fff; border:none; width:20px; height:20px; border-radius:50%; cursor:pointer; font-size:12px; line-height:1;">+</button>`}
                </th>
              </tr>
            </thead>
            <tbody id="goc-firefighters-table-body"></tbody>
          </table>
        </div>
      `;
      renderCb360VehiclesTable();
      renderCb360FirefightersTable();      
      document.getElementById('goc-vehicles-label').addEventListener('click', () => {
        cb360VehiclesCollapsed = !cb360VehiclesCollapsed;
        document.getElementById('goc-vehicles-wrap').style.display = cb360VehiclesCollapsed ? 'none' : 'block';
        document.getElementById('goc-vehicles-arrow').textContent = cb360VehiclesCollapsed ? '▸' : '▾';
      });
      document.getElementById('goc-firefighters-label').addEventListener('click', () => {
        cb360FirefightersCollapsed = !cb360FirefightersCollapsed;
        document.getElementById('goc-firefighters-wrap').style.display = cb360FirefightersCollapsed ? 'none' : 'block';
        document.getElementById('goc-firefighters-arrow').textContent = cb360FirefightersCollapsed ? '▸' : '▾';
      });
      const btnAddVehicles = document.getElementById('goc-btn-add-vehicles');
      if (btnAddVehicles) {
        btnAddVehicles.addEventListener('click', () => {
          openCb360DispatchModal(null);
        });
      }
      const btnLocation = document.getElementById('goc-btn-location');
      if (btnLocation) {
        btnLocation.addEventListener('click', () => {
          openCb360LocateVehiclesModal();
        });
      }
      const btnPin = document.getElementById('goc-btn-pin');
      if (btnPin) {
        btnPin.addEventListener('click', () => {
          const internalNum = document.getElementById('goc-internal-nr')?.value?.trim();
          if (internalNum) {
            openCb360LocateIncidentModal(internalNum);
          } else {
            console.warn('Número interno não encontrado.');
            alert('Por favor, selecione ou abra uma ocorrência primeiro.');
          }
        });
      }
      const btnAddFirefighters = document.getElementById('goc-btn-add-firefighters');
      if (btnAddFirefighters) {
        btnAddFirefighters.addEventListener('click', () => {
          openCb360InsertFirefighterModal();
        });
      }
      renderCb360FirefightersTable();      
    }
    // ---- 6.1 VIATURAS ----
    // INITIALIZE: initializeVehicleCombobox()
    function initializeVehicleCombobox(list, selectedVehicle = null) {
      cb360VehicleData = list || [];
      cb360VehicleSelected = selectedVehicle ? (list.find(i => i.id === selectedVehicle) || null) : null;
      cb360VehicleActiveIndex = -1;
      const mainInput = document.getElementById('goc-vehicle-input');
      const dropdown = document.getElementById('goc-vehicle-dropdown');
      const searchInput = document.getElementById('goc-vehicle-search');
      const listContainer = document.getElementById('goc-vehicle-list');
      const chevron = document.getElementById('goc-vehicle-chevron');
      if (!mainInput || !dropdown || !searchInput || !listContainer) return;
      mainInput.value = cb360VehicleSelected ? cb360VehicleSelected.label : '';
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)';
      }
      function openDropdown() {
        if (mainInput.disabled) return;
        searchInput.value = '';
        cb360VehicleActiveIndex = -1;
        renderCb360VehicleList(cb360VehicleData, listContainer, mainInput, searchInput, dropdown, chevron);
        setDropdownOpen(true);
        setTimeout(() => searchInput.focus(), 0);
      }
      mainInput.addEventListener('click', openDropdown);
      mainInput.addEventListener('focus', openDropdown);
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360VehicleData.filter(item => item.label.toLowerCase().includes(term));
        cb360VehicleActiveIndex = (term.length > 0 && filtered.length > 0) ? 0 : -1;
        renderCb360VehicleList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
      });
      searchInput.addEventListener('keydown', (e) => {
        const term = searchInput.value.toLowerCase();
        const filtered = cb360VehicleData.filter(item => item.label.toLowerCase().includes(term));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360VehicleActiveIndex = (cb360VehicleActiveIndex + 1) % filtered.length;
          renderCb360VehicleList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!filtered.length) return;
          cb360VehicleActiveIndex = (cb360VehicleActiveIndex - 1 + filtered.length) % filtered.length;
          renderCb360VehicleList(filtered, listContainer, mainInput, searchInput, dropdown, chevron);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = filtered[cb360VehicleActiveIndex];
          if (chosen) {
            cb360VehicleSelected = chosen;
            mainInput.value = chosen.label;
            setDropdownOpen(false);
          }
        } else if (e.key === 'Escape') {
          setDropdownOpen(false);
        }
      });
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
    }
    // RENDER (combobox): renderCb360VehicleList()
    function renderCb360VehicleList(list, listContainer, mainInput, searchInput, dropdown, chevron) {
      listContainer.innerHTML = '';
      const term = searchInput ? searchInput.value.trim() : '';
      if (!term) {
        const blankLine = document.createElement('div');
        blankLine.innerHTML = '&nbsp;';
        blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
        blankLine.addEventListener('mouseenter', () => {
          cb360VehicleActiveIndex = -1;
          Array.from(listContainer.children).forEach((el, i) => {
            el.style.background = i === 0 ? '#2b6ecb' : '#fff';
            if (i !== 0) el.style.color = '#333';
          });
        });
        blankLine.addEventListener('click', () => {
          cb360VehicleSelected = null;
          mainInput.value = '';
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(blankLine);
      }
      if (list.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'Sem resultados.';
        empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
        listContainer.appendChild(empty);
        return;
      }
      list.forEach((item, idx) => {
        const isActive = idx === cb360VehicleActiveIndex;
        const line = document.createElement('div');
        line.textContent = item.label;
        line.style.padding = '6px 10px';
        line.style.fontSize = '11px';
        line.style.cursor = 'pointer';
        line.style.background = isActive ? '#2b6ecb' : '#fff';
        line.style.color = isActive ? '#fff' : '#333';
        line.addEventListener('mouseenter', () => {
          cb360VehicleActiveIndex = idx;
          const hasBlank = !term;
          Array.from(listContainer.children).forEach((el, i) => {
            if (hasBlank && i === 0) {
              el.style.background = '#fff';
            } else {
              const itemIndex = hasBlank ? i - 1 : i;
              const active = itemIndex === idx;
              el.style.background = active ? '#2b6ecb' : '#fff';
              el.style.color = active ? '#fff' : '#333';
            }
          });
        });
        line.addEventListener('click', () => {
          cb360VehicleSelected = item;
          mainInput.value = item.label;
          dropdown.style.display = 'none';
          if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
        });
        listContainer.appendChild(line);
      });
      const offsetIndex = (!term) ? cb360VehicleActiveIndex + 1 : cb360VehicleActiveIndex;
      const activeEl = listContainer.children[offsetIndex];
      if (activeEl) activeEl.scrollIntoView({block: 'nearest'});
    }
    // ---- HELPER: cb360VehicleLabel() — devolve "código (matrícula)" ----
    function cb360VehicleLabel(code) {
      if (!code) return '';
      const reg = cb360VehicleRegistrations[code];
      return reg ? `${code} (${reg})` : code;
    }
    // ---- FETCH: fetchCb360VehicleRegistrations() ----
    async function fetchCb360VehicleRegistrations(codes) {
      if (!codes || !codes.length) return {};
      try {
        const list = codes.filter(Boolean).join(',');
        if (!list) return {};
        const url = `${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=in.(${list})&select=vehicle,vehicle_registration`;
        const response = await supaFetch(url, { method: 'GET' });
        if (!response.ok) return {};
        const data = await response.json();
        const map = {};
        data.forEach(v => { map[v.vehicle] = v.vehicle_registration || ''; });
        return map;
      } catch (err) {
        console.error('Erro fetchCb360VehicleRegistrations:', err);
        return {};
      }
    }
    // ---- HELPER: refreshCb360VehicleRegistrations() — repõe o mapa de matrículas com base nas viaturas atuais ----
    async function refreshCb360VehicleRegistrations() {
      const codes = cb360ResourcesVehicles.map(v => v.vehicle).filter(Boolean);
      cb360VehicleRegistrations = await fetchCb360VehicleRegistrations(codes);
    }
    // ---- FETCH: fetchCb360FirefighterDetails() — detalhes (nome/patente) de uma lista de códigos de bombeiro ----
    async function fetchCb360FirefighterDetails(codes) {
      if (!codes || !codes.length) return {};
      try {
        const list = codes.filter(Boolean).join(',');
        if (!list) return {};
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=in.(${list})&select=n_int,full_name,patent_abv`;
        const response = await supaFetch(url, { method: 'GET' });
        if (!response.ok) return {};
        const data = await response.json();
        const map = {};
        data.forEach(d => { map[d.n_int] = d; });
        return map;
      } catch (err) {
        console.error('Erro fetchCb360FirefighterDetails:', err);
        return {};
      }
    }
    // ===================================================================
    // NEW INCCIDENT - EDIT INCCIDENT
    // ===================================================================
    // RENDER (tabela principal de viaturas): renderCb360VehiclesTable()
    function renderCb360VehiclesTable() {
      const tbody = document.getElementById('goc-vehicles-table-body');
      if (!tbody) return;
      const t = (v, id, field, w = '65px') => `<input type="text" data-id="${id}" data-field="${field}" value="${v ?? ''}" style="width:${w}; padding:3px 4px; border:1px solid #ccc; border-radius:3px; font-size:12px;">`;
      const d = (v, id, field) => `<input type="date" data-id="${id}" data-field="${field}" value="${v ?? ''}" style="padding:3px 4px; border:1px solid #ccc; border-radius:3px; font-size:12px;">`;
      const h = (v, id, field) => `<input type="time" data-id="${id}" data-field="${field}" value="${v ?? ''}" style="padding:3px 4px; border:1px solid #ccc; border-radius:3px; font-size:12px;">`;
      const isClosed = !!cb360CurrentIncident?.is_closed;
      tbody.innerHTML = cb360ResourcesVehicles.length ? cb360ResourcesVehicles.map((v, idx) => `        
        <tr style="border-bottom:1px solid #eee;" data-row-id="${v.id}">
          <td style="padding:6px 8px; width:30px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; color:#999;">▸</td>
          <td style="padding:6px 8px; width:40px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${idx + 1}</td>
          <td style="padding:6px 8px; width:100px; font-weight:600; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? t(v.vehicle, v.id, 'vehicle', '80px') : (v.vehicle)}</td>
          <td style="padding:6px 8px; width:50px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? t(v.crew, v.id, 'crew', '35px') : (v.crew || '0')}</td>
          <td style="padding:6px 8px; width:110px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? d(v.departureDateCB, v.id, 'departureDateCB') : formatDatePT(v.departureDateCB)}</td>
          <td style="padding:6px 8px; width:80px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? h(v.departureTimeCB, v.id, 'departureTimeCB') : formatTimePT(v.departureTimeCB)}</td>
          <td style="padding:6px 8px; width:110px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? d(v.arrivalDateScene, v.id, 'arrivalDateScene') : formatDatePT(v.arrivalDateScene)}</td>
          <td style="padding:6px 8px; width:80px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? h(v.arrivalTimeScene, v.id, 'arrivalTimeScene') : formatTimePT(v.arrivalTimeScene)}</td>
          <td style="padding:6px 8px; width:110px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? d(v.departureDateScene, v.id, 'departureDateScene') : formatDatePT(v.departureDateScene)}</td>
          <td style="padding:6px 8px; width:80px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? h(v.departureTimeScene, v.id, 'departureTimeScene') : formatTimePT(v.departureTimeScene)}</td>
          <td style="padding:6px 8px; width:110px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? d(v.arrivalDateCB, v.id, 'arrivalDateCB') : formatDatePT(v.arrivalDateCB)}</td>
          <td style="padding:6px 8px; width:80px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? h(v.arrivalTimeCB, v.id, 'arrivalTimeCB') : formatTimePT(v.arrivalTimeCB)}</td>
          <td style="padding:6px 8px; width:60px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? t(v.kmStart, v.id, 'kmStart', '45px') : (v.kmStart || '')}</td>
          <td style="padding:6px 8px; width:60px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.editing ? t(v.kmEnd, v.id, 'kmEnd', '45px') : (v.kmEnd || '')}</td>
          <td style="padding:6px 8px; width:45px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; white-space:nowrap;">
            ${isClosed ? '' : `<button class="goc-vehicle-toggle" data-id="${v.id}" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; font-size:13px;"><i class="fa-solid fa-pencil"></i></button>`}
          </td>
          <td style="padding:6px 8px; width:45px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; white-space:nowrap;">  
            ${isClosed ? '' : `<button class="goc-vehicle-remove" data-id="${v.id}" style="background:transparent; border:none; color:#d9534f; cursor:pointer; font-size:13px;"><i class="fa-solid fa-trash"></i></button>`}
          </td>
        </tr>`).join('') : `<tr><td colspan="16" style="padding:14px; text-align:center; color:#999;">Nenhuma viatura associada.</td></tr>
      `;
      tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
          const item = cb360ResourcesVehicles.find(v => v.id === input.dataset.id);
          if (item) item[input.dataset.field] = input.value;
        });
      });
      tbody.querySelectorAll('.goc-vehicle-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = cb360ResourcesVehicles.find(v => v.id === btn.dataset.id);
          if (item) openCb360DispatchModal(item);
        });
      });
      tbody.querySelectorAll('.goc-vehicle-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const vehicleId = btn.dataset.id;
          const item = cb360ResourcesVehicles.find(v => v.id === vehicleId);
          const confirmMsg = `Tem a certeza que pretende eliminar a viatura "${item?.vehicle || ''}"? Esta ação também remove os bombeiros associados a esta viatura e não pode ser revertida.`;
          if (!confirm(confirmMsg)) return;
          btn.disabled = true;
          try {
            const crewDeleteResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?dispatch_vehicle_id=eq.${vehicleId}`, { method: "DELETE" });
            if (!crewDeleteResp.ok) {
              console.error('Erro ao apagar bombeiros associados:', await crewDeleteResp.text());
              showPopup('popup-danger', `Erro ao apagar os bombeiros associados. A viatura não foi removida.`);
              btn.disabled = false;
              return;
            }
            const vehicleDeleteResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?id=eq.${vehicleId}`, { method: "DELETE" });
            if (!vehicleDeleteResp.ok) {
              console.error('Erro ao apagar viatura:', await vehicleDeleteResp.text());
              showPopup('popup-danger', `Erro ao apagar a viatura.`);
              btn.disabled = false;
              return;
            }
            cb360ResourcesVehicles = cb360ResourcesVehicles.filter(v => v.id !== vehicleId);
            cb360ResourcesFirefighters = cb360ResourcesFirefighters.filter(b => b.vehicle !== item?.vehicle);
            showPopup('popup-success', `Viatura e bombeiros associados eliminados com sucesso.`);
            renderCb360VehiclesTable();
            renderCb360FirefightersTable();
          } catch (err) {
            console.error('Erro crítico ao eliminar viatura:', err);
            showPopup('popup-danger', `Erro de rede ao eliminar a viatura.`);
            btn.disabled = false;
          }
        });
      });
      updateMediaCounter();
    }
    // ---- 6.2 BOMBEIROS ----
    // INITIALIZE: initializeNewVehicleFirefightersComboBox()
    async function initializeNewVehicleFirefightersComboBox(list) {
      const listContainer = document.getElementById('goc-firefighters-list');
      const mainInput = document.getElementById('goc-desp-firefighters-input');
      const dropdown = document.getElementById('goc-firefighters-dropdown');
      const searchInput = document.getElementById('goc-firefighters-search');
      const chevron = document.getElementById('goc-firefighters-chevron');
      if (!listContainer || !mainInput || !dropdown || !searchInput) return;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const currentInternalNr = document.getElementById('goc-internal-nr')?.value;
      let busyMap = {};      
      try {
        const openIncidentsUrl = `${SUPABASE_URL}/rest/v1/cb360_incidents?corp_oper_nr=eq.${corpOperNr}&is_closed=eq.false&internal_number=neq.${currentInternalNr}&select=internal_number`;
        const openIncidentsResp = await supaFetch(openIncidentsUrl, { method: 'GET' });
        const openIncidents = openIncidentsResp.ok ? await openIncidentsResp.json() : [];
        const openInternalNumbers = openIncidents.map(o => o.internal_number).filter(Boolean);        
        if (openInternalNumbers.length > 0) {
          const crewOtherUrl = `${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?internal_number=in.(${openInternalNumbers.join(',')})&corp_oper_nr=eq.${corpOperNr}&select=n_int,internal_number`;
          const crewOtherResp = await supaFetch(crewOtherUrl, { method: 'GET' });
          const crewOther = crewOtherResp.ok ? await crewOtherResp.json() : [];
          crewOther.forEach(c => { busyMap[String(c.n_int)] = c.internal_number; });
        }
      } catch (err) {
        console.error('Erro ao verificar disponibilidade de bombeiros:', err);
      }
      function renderFirefighterList(searchTerm = '') {
        listContainer.innerHTML = '';
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
          const blankLine = document.createElement('div');
          blankLine.innerHTML = '&nbsp;';
          blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
          blankLine.addEventListener('mouseenter', () => { blankLine.style.background = '#2b6ecb'; });
          blankLine.addEventListener('mouseleave', () => { blankLine.style.background = '#fff'; });
          blankLine.addEventListener('click', () => {
            listContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
            updateFirefightersCountSelected();
          });
          listContainer.appendChild(blankLine);
        }
        const filteredList = list.filter(b => b.label.toLowerCase().includes(term));
        if (filteredList.length === 0) {
          const empty = document.createElement('div');
          empty.textContent = 'Sem resultados.';
          empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
          listContainer.appendChild(empty);
          return;
        }
        filteredList.forEach(b => {
          const isBusy = !!busyMap[String(b.id)];
          const div = document.createElement('div');
          div.className = 'firefighter-item';
          div.style.padding = "5px 10px";
          div.style.cursor = isBusy ? "not-allowed" : "pointer";
          div.style.display = "flex";
          div.style.alignItems = "center";
          div.style.gap = "8px";
          div.style.opacity = isBusy ? "0.5" : "1";          
          const checkboxId = `ff-${b.id}`;
          div.innerHTML = `
            <input type="checkbox" id="${checkboxId}" value="${b.id}" ${isBusy ? 'disabled' : ''} style="cursor:${isBusy ? 'not-allowed' : 'pointer'} !important;">
            <label for="${checkboxId}" style="font-size:12px; cursor:${isBusy ? 'not-allowed' : 'pointer'};">${b.label}${isBusy ? ` (Ocorr. ${busyMap[String(b.id)]})` : ''}</label>
          `;
          
          if (!isBusy) {
            div.addEventListener('mouseenter', () => {
              div.style.background = '#2b6ecb';
              div.querySelector('label').style.color = '#fff';
            });
            div.addEventListener('mouseleave', () => {
              div.style.background = '#fff';
              div.querySelector('label').style.color = '#333';
            });
          }
          listContainer.appendChild(div);
        });
        listContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.addEventListener('change', () => {
            updateFirefightersCountSelected();
          });
        });
      }
      searchInput.removeEventListener('input', searchInput._handler);
      searchInput._handler = (e) => renderFirefighterList(e.target.value);
      searchInput.addEventListener('input', searchInput._handler);
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)';
      }
      mainInput.onclick = (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'flex';
        searchInput.value = '';
        renderFirefighterList('');
        setDropdownOpen(!isOpen);
        if (!isOpen) setTimeout(() => searchInput.focus(), 0);
      };
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
      renderFirefighterList('');
    }
    // INITIALIZE: initializeAddFirefighterCombobox()
    async function initializeAddFirefighterCombobox(list) {
      const listContainer = document.getElementById('goc-ff-firefighters-list');
      const mainInput = document.getElementById('goc-ff-firefighters-input');
      const dropdown = document.getElementById('goc-ff-firefighters-dropdown');
      const searchInput = document.getElementById('goc-ff-firefighters-search');
      const chevron = document.getElementById('goc-ff-firefighters-chevron');
      if (!listContainer || !mainInput || !dropdown || !searchInput) return;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const currentInternalNr = document.getElementById('goc-internal-nr')?.value;
      let busyMap = {};
      try {
        const openIncidentsUrl = `${SUPABASE_URL}/rest/v1/cb360_incidents?corp_oper_nr=eq.${corpOperNr}&is_closed=eq.false&internal_number=neq.${currentInternalNr}&select=internal_number`;
        const openIncidentsResp = await supaFetch(openIncidentsUrl, { method: 'GET' });
        const openIncidents = openIncidentsResp.ok
          ? await openIncidentsResp.json()
          : [];
        const openInternalNumbers = openIncidents
        .map(o => o.internal_number)
        .filter(Boolean);
        if (openInternalNumbers.length > 0) {
          const crewOtherUrl = `${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?internal_number=in.(${openInternalNumbers.join(',')})&corp_oper_nr=eq.${corpOperNr}&select=n_int,internal_number`;
          const crewOtherResp = await supaFetch(crewOtherUrl, { method: 'GET' });
          const crewOther = crewOtherResp.ok
            ? await crewOtherResp.json()
            : [];
          crewOther.forEach(c => { busyMap[String(c.n_int)] = c.internal_number; });
        }
      } catch (err) {
        console.error('Erro ao verificar disponibilidade de bombeiros:', err);
      }
      const updateCounter = () => {
        const selected = listContainer.querySelectorAll('input[type="checkbox"]:checked').length;
        mainInput.value = selected > 0 ? `${selected} seleccionado(s)` : '';
      };
      window.updateFFModalCounter = updateCounter;
      function renderFirefighterList(searchTerm = '') {
        listContainer.innerHTML = '';
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
          const blankLine = document.createElement('div');
          blankLine.innerHTML = '&nbsp;';
          blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
          blankLine.addEventListener('mouseenter', () => { blankLine.style.background = '#2b6ecb'; });
          blankLine.addEventListener('mouseleave', () => { blankLine.style.background = '#fff'; });
          blankLine.addEventListener('click', () => {
            listContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
            updateCounter();
          });
          listContainer.appendChild(blankLine);
        }
        const filteredList = list.filter(b => b.label.toLowerCase().includes(term));
        if (filteredList.length === 0) {
          const empty = document.createElement('div');
          empty.textContent = 'Sem resultados.';
          empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
          listContainer.appendChild(empty);
          return;
        }
        filteredList.forEach(b => {
          const isBusy = !!busyMap[String(b.id)];
          const div = document.createElement('div');        
          div.className = 'ff-modal-item';
          div.style.padding = '5px 10px';
          div.style.cursor = isBusy ? 'not-allowed' : 'pointer';
          div.style.display = 'flex';
          div.style.alignItems = 'center';
          div.style.gap = '8px';
          div.style.opacity = isBusy ? '0.5' : '1';
          const checkboxId = `ff-modal-${b.id}`;
          div.innerHTML = `
            <input type="checkbox" id="${checkboxId}" value="${b.id}" ${isBusy ? 'disabled' : ''} style="cursor:${isBusy ? 'not-allowed' : 'pointer'} !important;">
            <label for="${checkboxId}" style="font-size:12px; cursor:${isBusy ? 'not-allowed' : 'pointer'};"> ${b.label}${isBusy ? ` (Ocorr. ${busyMap[String(b.id)]})` : ''}</label>
          `;
          if (!isBusy) {
            div.addEventListener('mouseenter', () => {
              div.style.background = '#2b6ecb';
              div.querySelector('label').style.color = '#fff';
            });
            div.addEventListener('mouseleave', () => {
              div.style.background = '#fff';
              div.querySelector('label').style.color = '#333';
            });
          }
          listContainer.appendChild(div);
        });
        listContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.addEventListener('change', updateCounter);
        });
      }
      searchInput.removeEventListener('input', searchInput._handler);
      searchInput._handler = (e) => renderFirefighterList(e.target.value);
      searchInput.addEventListener('input', searchInput._handler);
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) {
          chevron.style.transform = isOpen
            ? 'translateY(-50%) rotate(180deg)'
            : 'translateY(-50%) rotate(0deg)';
        }
      }
      mainInput.onclick = (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'flex';
        searchInput.value = '';
        renderFirefighterList('');
        setDropdownOpen(!isOpen);
        if (!isOpen) {
          setTimeout(() => searchInput.focus(), 0);
        }
      };
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
      renderFirefighterList('');
    }
    // ===================================================================
    // RENDERS
    // ===================================================================
    // ===== RENDER TABS ===== //
    // FETCH: fetchCb360FirefightersList()
    async function fetchCb360FirefightersList() {
      try {
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!currentCorpOperNr) return [];
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,full_name,patent_abv&corp_oper_nr=eq.${currentCorpOperNr}&elem_state=eq.true&type_quad=not.is.null&type_quad=neq.&order=n_int.asc`;
        const response = await supaFetch(url, { method: 'GET' });
        if (!response.ok) {
          console.error('Erro ao obter bombeiros:', response.status);
          return [];
        }
        const data = await response.json();
        return data.map(d => ({id: d.n_int, label: `${d.n_int} - ${d.full_name} - ${d.patent_abv}`}));
      } catch (err) {
        console.error('Erro fetchCb360FirefightersList:', err);
        return [];
      }
    }
    // HELPER: updateFirefightersCountSelected()
    function updateFirefightersCountSelected() {
      const input = document.getElementById('goc-desp-firefighters-input');
      const selecionados = document.querySelectorAll(
        '#goc-firefighters-dropdown input[type="checkbox"]:checked'
      ).length;
      if (input) {
        input.value = selecionados > 0 
          ? `${selecionados} bombeiro(s) selecionado(s)`
          : '';
      }
    }
    // HELPER: filterFirefighters()
    function filterFirefighters(e) {
      const term = e.target.value.toLowerCase();
      const itens = document.querySelectorAll('.firefighter-item, .ff-modal-item');
      itens.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
      });
    }
    // RENDER (tabela principal de bombeiros): renderCb360FirefightersTable()
    function renderCb360FirefightersTable() {
      const tbody = document.getElementById('goc-firefighters-table-body');
      if (!tbody) return;
      const vehicleIndexMap = {};
      cb360ResourcesVehicles.forEach((v, idx) => {
        vehicleIndexMap[v.vehicle] = idx + 1;
      });
      const isClosed = !!cb360CurrentIncident?.is_closed;
      tbody.innerHTML = cb360ResourcesFirefighters.length ? cb360ResourcesFirefighters.map((b) => {
        const vehicleIdx = vehicleIndexMap[b.vehicle] ?? '-';
        return `
          <tr style="border-bottom:1px solid #eee;" data-row-id="${b.id}">
            <td style="padding:6px 8px; width:30px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; color:#999;">▸</td>     
            <td style="padding:6px 8px; width:40px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${vehicleIdx}</td>
            <td style="padding:6px 8px; width:100px; font-weight:600; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${b.vehicle || '-'}</td>
            <td style="padding:6px 8px; width:50px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
              <span class="goc-firefighter-confirmed" data-id="${b.id}" style="cursor:pointer; display:inline-block; width:16px; height:16px; border-radius:3px; background:${b.confirmed ? '#5cb85c' : '#ddd'}; color:#fff; font-size:11px; line-height:16px;">${b.confirmed ? '✓' : ''}</span>
            </td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; width: 125px;">${b.code || ''}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; width: 250px;">${b.role || ''}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; width: 75px;">${b.specialty || ''}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; width: 150px;">${formatDatePT(b.departureDate)}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; width: 150px;">${formatTimePT(b.departureTime)}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; width: 150px;">${formatDatePT(b.returnDate)}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; width: 150px;">${formatTimePT(b.returnTime)}</td>
            <td style="padding:6px 8px; width:45px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; white-space:nowrap;">
              ${isClosed ? '' : `<button class="goc-firefighter-toggle" data-id="${b.id}" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; font-size:13px;"><i class="fa-solid fa-pencil"></i></button>`}
            </td>
            <td style="padding:6px 8px; width:45px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc; white-space:nowrap;">
              ${isClosed ? '' : `<button class="goc-firefighter-remove" data-id="${b.id}" style="background:transparent; border:none; color:#d9534f; cursor:pointer; font-size:13px;"><i class="fa-solid fa-trash"></i></button>`}
            </td>
          </tr>
        `;}).join('') : `<tr><td colspan="13" style="padding:14px; text-align:center; color:#999;">Nenhum bombeiro associado.</td></tr>
      `;
      tbody.querySelectorAll('.goc-firefighter-confirmed').forEach(span => {
        span.addEventListener('click', () => {
          const item = cb360ResourcesFirefighters.find(b => b.id === span.dataset.id);
          if (item) item.confirmed = !item.confirmed;
          renderCb360FirefightersTable();
        });
      });
      tbody.querySelectorAll('.goc-firefighter-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = cb360ResourcesFirefighters.find(b => b.id === btn.dataset.id);
          if (item) openCb360EditFirefighterModal(item);
        });
      });
      tbody.querySelectorAll('.goc-firefighter-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          cb360ResourcesFirefighters = cb360ResourcesFirefighters.filter(b => b.id !== btn.dataset.id);
          renderCb360FirefightersTable();
        });
      });
      updateMediaCounter();
    }
    // ---- 6.3 DESPACHO (modal que adiciona viatura + equipa em conjunto) ----
    // HELPER: calculateCb360Duration()
    function calculateCb360Duration(oc, vehicles = []) {
      if (!oc.alert_date || !oc.alert_time) return '';
      const start = new Date(`${oc.alert_date}T${oc.alert_time}`);
      const formatDuration = (diffMs) => {
        const totalMinutes = Math.floor(diffMs / 60000);
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;
        return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
      };
      if (!vehicles.length) {
        const diffMs = new Date() - start;
        if (isNaN(diffMs) || diffMs < 0) return '';
        return formatDuration(diffMs);
      }
      const allArrived = vehicles.every(v => v.arrivalDateCB && v.arrivalTimeCB);
      let end;
      if (allArrived) {
        const arrivalTimes = vehicles.map(v => new Date(`${v.arrivalDateCB}T${v.arrivalTimeCB}`));
        end = new Date(Math.max(...arrivalTimes));
        if (isNaN(end) || end < start) end = new Date();
      } else {
        end = new Date();
      }
      const diffMs = end - start;
      if (isNaN(diffMs) || diffMs < 0) return '';
      return formatDuration(diffMs);
    }
    // HELPER: updateMediaCounter()
    function updateMediaCounter() {
      const totalVehicles = cb360ResourcesVehicles.length;
      const totalFirefighters = cb360ResourcesFirefighters.length;
      const badge = document.getElementById('goc-tab-count-vehicles');
      const summaryVehicles = document.getElementById('goc-count-vehicles');
      const summaryStaff = document.getElementById('goc-staff-count');
      if (badge) badge.textContent = totalVehicles ? `(${totalVehicles})` : '';
      if (summaryVehicles) summaryVehicles.textContent = totalVehicles;
      if (summaryStaff) summaryStaff.textContent = totalFirefighters;
    }
    // FETCH: fetchDispatchData()
    async function fetchDispatchData(internal_number) {
      const url = `${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?internal_number=eq.${internal_number}&select=*,cb360_dispatch_crew(*)&cb360_dispatch_crew.order=id.asc`;
      try {
        const response = await supaFetch(url, { headers: { "Accept": "application/json" },
          cache: 'no-store' });
        if (!response.ok) {
          console.error("Erro no fetch do despacho:", await response.text());
          return [];
        }
        return await response.json();
      } catch (err) {
        console.error("Erro na comunicação com o Supabase:", err);
        return [];
      }
    }
    // RENDER: renderCb360ModalDispatch()
    async function renderCb360ModalDispatch(vehicle = null) {
      const page = document.getElementById('page-cb360-redund');
      if (!page || document.getElementById('goc-modal-dispatch-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'goc-modal-dispatch-overlay';
      overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; align-items:center; justify-content:center;';
      const inputStyle = 'width:100%; height:25px; padding:4px 8px; border:1px solid #5bc0de; border-radius:4px; font-size:11px; box-sizing:border-box;';
      const labelStyle = 'width: 100px; font-size:12px; font-weight:600; color:#333; flex-shrink:0;';
      window.fillDate = (id) => {
        const el = document.getElementById(id);
        if (el) el.value = new Date().toISOString().split('T')[0];
      };
      window.fillTime = (id) => {
        const el = document.getElementById(id);
        if (el) el.value = new Date().toTimeString().substring(0, 5);
      };
      const field = (label, inputHtml, onclick) => `
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="${labelStyle}" onclick="${onclick || ''}">${label}</label>
          <div style="flex:1;">${inputHtml}</div>
        </div>
      `;
      overlay.innerHTML = `
        <style>
          #goc-dispatch-body input:focus, #goc-dispatch-body select:focus {
            outline: none !important;
            border: 1px solid #d9534f !important;
            box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
        </style>
        <div id="goc-dispatch-window" style="background:#fff; width:550px; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.25);">
          <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px; border-radius:8px 8px 0 0;">
            <div style="font-weight:600; font-size:14px;"><i class="fa-solid fa-pencil"></i> Novo Despacho de Meios</div>
            <button id="goc-dispatch-btn-x" style="background:transparent; border:none; color:#fff; cursor:pointer;">✕</button>
          </div>      
          <div id="goc-dispatch-body" style="padding:20px; display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
            <div style="grid-column: span 2;">
              ${field('Viatura', `
              <div style="position:relative; flex:1;">
                <input type="text" id="goc-vehicle-input" placeholder="Pesquisar..." autocomplete="off" class="goc-input goc-input-full" readonly style="${inputStyle}; cursor:pointer; padding-right:24px;"><i id="goc-vehicle-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color:#000; pointer-events:none; transition:transform 0.15s;"></i>
                <div id="goc-vehicle-dropdown" style="display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; z-index:50; background:#fff; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; max-height:220px; box-shadow:0 4px 8px rgba(0,0,0,0.12);">
                  <input type="text" id="goc-vehicle-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
                  <div id="goc-vehicle-list" style="overflow-y:auto; max-height:160px;"></div>
                </div>
              </div>
            `)}
          </div>
            ${field('N° Verbete INEM', `<input type="text" id="goc-inem-verbete" style="${inputStyle}; width: 130px !important;">`)}
            ${field('Unidade INEM', `<select id="goc-inem-unidade" style="${inputStyle}; width: 130px !important;"><option value=""></option></select>`)}       
            ${field('Data Saída CB', `<input type="date" id="dataSCB" style="${inputStyle}; width: 110px !important;">`, "fillDate('dataSCB')")}
            ${field('Hora Saída CB', `<input type="time" id="horaSCB" style="${inputStyle}; width: 80px !important;">`, "fillTime('horaSCB')")}        
            ${field('Data Chegada TO', `<input type="date" id="dataCTO" style="${inputStyle}; width: 110px !important;">`, "fillDate('dataCTO')")}
            ${field('Hora Chegada TO', `<input type="time" id="horaCTO" style="${inputStyle}; width: 80px !important;">`, "fillTime('horaCTO')")}        
            ${field('Data Saída TO', `<input type="date" id="dataSTO" style="${inputStyle}; width: 110px !important;">`, "fillDate('dataSTO')")}
            ${field('Hora Saída TO', `<input type="time" id="horaSTO" style="${inputStyle}; width: 80px !important;">`, "fillTime('horaSTO')")}        
            ${field('Data Chegada CB', `<input type="date" id="dataCCB" style="${inputStyle}; width: 110px !important;">`, "fillDate('dataCCB')")}
            ${field('Hora Chegada CB', `<input type="time" id="horaCCB" style="${inputStyle}; width: 80px !important;">`, "fillTime('horaCCB')")}        
            ${field('Kms Início', `<input id="goc-km-start" type="text" style="${inputStyle}; width:130px !important;">`)}
            ${field('Kms Fim', `<input id="goc-km-end" type="text" style="${inputStyle}; width:130px !important;">`)}        
            <div style="grid-column: span 2; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
              <div style="font-weight:600; color:#2b6ecb; font-size:13px; margin-bottom:4px;">Guarnição</div>
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                <label style="${labelStyle}">Equipa(s)</label>
                <div style="flex:1;"><select multiple style="${inputStyle}; height:25px;"></select></div>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle}">Bombeiro(s)</label>
                <div style="position:relative; flex:1;">
                  <input type="text" id="goc-desp-firefighters-input" placeholder="Pesquisar..." autocomplete="off" class="goc-input goc-input-full" readonly style="${inputStyle}; cursor:pointer; padding-right:24px; background:#fff;"><i id="goc-firefighters-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color:#000; pointer-events:none; transition:transform 0.15s;"></i>
                  <div id="goc-firefighters-dropdown" style="display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; z-index:300; background:#fff; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; max-height:300px; box-shadow:0 4px 8px rgba(0,0,0,0.12);">
                    <input type="text" id="goc-firefighters-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
                    <div id="goc-firefighters-list" style="overflow-y:auto; max-height:250px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>    
          <div style="display:flex; justify-content:flex-end; gap:10px; padding:15px 20px; border-top:1px solid #eee; background:#fafafa; border-radius:0 0 8px 8px;">
            <button id="goc-desp-btn-guardar" style="background:#5cb85c; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="far fa-save"></i>&nbsp;&nbsp;Guardar</button>
            <button id="goc-desp-btn-fechar" style="background:#f0ad4e; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button>
          </div>
        </div>
      `;
      page.appendChild(overlay);
      try {
        const url = `${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle,vehicle_registration,is_inop&order=vehicle.asc`;
        const response = await supaFetch(url, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          const vehicleList = data.filter(v => v.is_inop === false).map(item => ({id: item.vehicle, label: item.vehicle_registration ? `${item.vehicle} (${item.vehicle_registration})` : item.vehicle}));
          initializeVehicleCombobox(vehicleList, vehicle?.vehicle || null);
          if (vehicle) {
            document.getElementById('dataSCB').value = vehicle.departureDateCB?.substring(0, 10) || '';
            document.getElementById('dataCTO').value = vehicle.arrivalDateScene?.substring(0, 10) || '';
            document.getElementById('dataSTO').value = vehicle.departureDateScene?.substring(0, 10) || '';
            document.getElementById('dataCCB').value = vehicle.arrivalDateCB?.substring(0, 10) || '';
            document.getElementById('horaSCB').value = vehicle.departureTimeCB?.substring(0, 5) || '';
            document.getElementById('horaCTO').value = vehicle.arrivalTimeScene?.substring(0, 5) || '';
            document.getElementById('horaSTO').value = vehicle.departureTimeScene?.substring(0, 5) || '';
            document.getElementById('horaCCB').value = vehicle.arrivalTimeCB?.substring(0, 5) || '';
            document.getElementById('goc-km-start').value = vehicle.kmStart ?? '';
            document.getElementById('goc-km-end').value = vehicle.kmEnd ?? '';
          }
        }
      } catch (err) {console.error('Erro ao carregar viaturas:', err);}
      const firefightersList = await fetchCb360FirefightersList();
      await initializeNewVehicleFirefightersComboBox(firefightersList);
      if (vehicle && vehicle.id) {
        try {
          const crewUrl = `${SUPABASE_URL}/rest/v1/cb360_dispatch_crew` + `?dispatch_vehicle_id=eq.${vehicle.id}` + `&corp_oper_nr=eq.${sessionStorage.getItem("currentCorpOperNr") || "0805"}`;
          const crewResponse = await supaFetch(crewUrl, { method: "GET" });
          if (crewResponse.ok) {
            const associatedFirefighters = await crewResponse.json();
            const idsSelected = associatedFirefighters.map(b => String(b.n_int));
            document
              .querySelectorAll('#goc-firefighters-dropdown input[type="checkbox"]')
              .forEach(cb => {
              if (idsSelected.includes(String(cb.value))) {
                cb.checked = true;
              }
            });
            updateFirefightersCountSelected();
          }
        } catch (err) {
          console.error("Erro ao carregar bombeiros da viatura:", err);
        }
      }      
      document.getElementById('goc-dispatch-btn-x').addEventListener('click', closeCb360DispatchModal);
      document.getElementById('goc-desp-btn-fechar').addEventListener('click', closeCb360DispatchModal);
      document.getElementById('goc-desp-btn-guardar').addEventListener('click', saveCb360Dispatch);
      overlay.addEventListener('click', (e) => {if (e.target === overlay) closeCb360DispatchModal();});
      setTimeout(() => {
        overlay.style.display = 'flex';
      }, 10);
    }
    // OPEN: openCb360DispatchModal()
    async function openCb360DispatchModal(vehicle = null) {
      cb360VehicleUnderDevelopment = vehicle;
      await renderCb360ModalDispatch(vehicle);
      const overlay = document.getElementById('goc-modal-dispatch-overlay');
      if (overlay) overlay.style.display = 'flex';
      if (!vehicle) {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);
        const dateSCB = document.getElementById('dataSCB');
        const hourSCB = document.getElementById('horaSCB');
        if (dateSCB) dateSCB.value = today;
        if (hourSCB) hourSCB.value = now;
      }
      const cbDate = document.getElementById('dataSCB')?.value;
      ['dataCTO', 'dataSTO', 'dataCCB'].forEach(id => {
        const field = document.getElementById(id);
        if (field && !field.value && cbDate) {
          field.value = cbDate;
        }
      });
    }
    // CLOSE: closeCb360DispatchModal()
    function closeCb360DispatchModal() {
      const overlay = document.getElementById('goc-modal-dispatch-overlay');
      if (overlay) overlay.remove();
    }
    // SAVE: saveCb360Dispatch()
    async function saveCb360Dispatch() {
      const modalWindow = document.getElementById('goc-dispatch-window');
      if (!modalWindow) {
        showPopup('popup-danger', `Erro interno: janela do despacho não encontrada.`);
        return;
      }
      const getVal = (selector) => {
        const el = modalWindow.querySelector(selector);
        return (el && el.value !== "") ? el.value : null;
      };
      const horaCTO = getVal('#horaCTO');
      const horaSTO = getVal('#horaSTO');
      const horaCCB = getVal('#horaCCB');
      if (horaCCB && (!horaCTO || !horaSTO)) {
        showPopup('popup-danger', 'Ainda existem meios sem hora de saída do TO.'
        );
        return;
      }
      const vehicleData = {
        corp_oper_nr: sessionStorage.getItem("currentCorpOperNr") || "0805", internal_number: document.getElementById('goc-internal-nr')?.value, vehicle: cb360VehicleSelected?.id || null,
        inem_report_number: getVal('#goc-inem-verbete'), inem_unit: getVal('#goc-inem-unidade'), cb_departure_date: getVal('#dataSCB'), cb_departure_time: getVal('#horaSCB'), scene_arrival_date: getVal('#dataCTO'), 
        scene_arrival_time: horaCTO, scene_departure_date: horaSTO ? getVal('#dataSTO') : null, scene_departure_time: horaSTO, cb_arrival_date: horaCCB ? getVal('#dataCCB') : null, cb_arrival_time: horaCCB, km_start: getVal('#goc-km-start'), km_end: getVal('#goc-km-end')
      };
      if (!vehicleData.vehicle) {
        showPopup('popup-danger', `Selecione uma viatura antes de gravar.`);
        return;
      }
      if (!vehicleData.cb_departure_date || !vehicleData.cb_departure_time) {
        showPopup('popup-danger', `Preencha a Data e Hora de Saída do C.B.`);
        return;
      }      
      const cronologia = [
        {label: 'Saída do CB', date: vehicleData.cb_departure_date, time: vehicleData.cb_departure_time},
        {label: 'Chegada ao TO', date: vehicleData.scene_arrival_date, time: vehicleData.scene_arrival_time},
        {label: 'Saída do TO', date: vehicleData.scene_departure_date, time: vehicleData.scene_departure_time},
        {label: 'Chegada ao CB', date: vehicleData.cb_arrival_date, time: vehicleData.cb_arrival_time}
      ].filter(p => p.date && p.time)
       .map(p => ({label: p.label, ts: new Date(`${p.date}T${p.time}`)}));
      for (let i = 1; i < cronologia.length; i++) {
        if (cronologia[i].ts < cronologia[i - 1].ts) {
          showPopup('popup-danger', `A hora de ${cronologia[i].label} não pode ser anterior à hora de ${cronologia[i - 1].label}.`);
          return;
        }
      }
      const checkedFirefighters = modalWindow.querySelectorAll('#goc-firefighters-dropdown input:checked');
      if (checkedFirefighters.length === 0) {
        showPopup('popup-danger', `Selecione pelo menos 1 bombeiro para a guarnição.`);
        return;
      }
      const checkedIds = Array.from(checkedFirefighters).map(cb => String(cb.value));
      const conflitosMesmaOcorrencia = cb360ResourcesFirefighters.filter(b =>
        checkedIds.includes(String(b.code)) && b.vehicle !== vehicleData.vehicle
      );
      if (conflitosMesmaOcorrencia.length > 0) {
        const lista = conflitosMesmaOcorrencia.map(b => `${b.code} (${b.vehicle})`).join(', ');
        showPopup('popup-danger', `Bombeiro(s) já associado(s) a outra viatura nesta ocorrência: ${lista}`);
        return;
      }
      try {
        const openIncidentsUrl = `${SUPABASE_URL}/rest/v1/cb360_incidents?corp_oper_nr=eq.${vehicleData.corp_oper_nr}&is_closed=eq.false&internal_number=neq.${vehicleData.internal_number}&select=internal_number`;
        const openIncidentsResp = await supaFetch(openIncidentsUrl, { method: 'GET' });
        const openIncidents = openIncidentsResp.ok ? await openIncidentsResp.json() : [];
        const openInternalNumbers = openIncidents.map(o => o.internal_number).filter(Boolean);
        if (openInternalNumbers.length > 0) {
          const crewOtherUrl = `${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?n_int=in.(${checkedIds.join(',')})&internal_number=in.(${openInternalNumbers.join(',')})&corp_oper_nr=eq.${vehicleData.corp_oper_nr}&select=n_int,internal_number`;
          const crewOtherResp = await supaFetch(crewOtherUrl, { method: 'GET' });
          const crewOther = crewOtherResp.ok ? await crewOtherResp.json() : [];
          if (crewOther.length > 0) {
            const lista = crewOther.map(c => `${c.n_int} (Ocorr. ${c.internal_number})`).join(', ');
            showPopup('popup-danger', `Bombeiro(s) já associado(s) a outra ocorrência em aberto: ${lista}`);
            return;
          }
        }
      } catch (err) {
        console.error('Erro ao validar disponibilidade de bombeiros:', err);
        showPopup('popup-danger', `Erro ao validar disponibilidade dos bombeiros. Tenta novamente.`);
        return;
      }
      try {
        let response;
        if (cb360VehicleUnderDevelopment) {
          const url = `${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?id=eq.${cb360VehicleUnderDevelopment.id}`;
          response = await supaFetch(url, { method: "PATCH",
            headers: { "Content-Type": "application/json", "Prefer": "return=representation" },
            body: JSON.stringify(vehicleData) });
        } else {
          response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles`, { method: "POST",
            headers: { "Content-Type": "application/json", "Prefer": "return=representation" },
            body: JSON.stringify(vehicleData) });
        }
        const data = await response.json();
        if (!response.ok) throw new Error("Erro ao gravar veículo: " + JSON.stringify(data));
        const dispatchVehicleId = data[0].id;
        const existingCrewResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?dispatch_vehicle_id=eq.${dispatchVehicleId}`);
        const existingCrew = existingCrewResp.ok ? await existingCrewResp.json() : [];
        const existingIds = new Set(existingCrew.map(c => String(c.n_int)));
        const checkedSet = new Set(checkedIds);
        const idsToRemove = [...existingIds].filter(id => !checkedSet.has(id));
        const idsToAdd = checkedIds.filter(id => !existingIds.has(id));
        if (idsToRemove.length > 0) {
          await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?dispatch_vehicle_id=eq.${dispatchVehicleId}&n_int=in.(${idsToRemove.join(',')})`, { method: "DELETE" });
        }
        if (idsToAdd.length > 0) {
          const newRegistrations = idsToAdd.map(n_int => {
            const existente = cb360ResourcesFirefighters.find(b => b.code === n_int);
            return {corp_oper_nr: vehicleData.corp_oper_nr, dispatch_vehicle_id: dispatchVehicleId, internal_number: vehicleData.internal_number, n_int, role: existente?.role || null,
                    specialty: existente?.specialty || null, departure_date: vehicleData.cb_departure_date, departure_time: vehicleData.cb_departure_time,
                    return_date: vehicleData.cb_arrival_date || null, return_time: vehicleData.cb_arrival_time || null
                   };
          });
          const crewResponse = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew`, { method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRegistrations) });
          if (!crewResponse.ok) console.error("Erro ao gravar equipa.");
        }
        const idsToUpdate = checkedIds.filter(id => existingIds.has(id));
        if (idsToUpdate.length > 0) {
          const updateResponse = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?dispatch_vehicle_id=eq.${dispatchVehicleId}&n_int=in.(${idsToUpdate.join(',')})`, { method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                departure_date: vehicleData.cb_departure_date,
                departure_time: vehicleData.cb_departure_time,
                return_date: vehicleData.cb_arrival_date || null,
                return_time: vehicleData.cb_arrival_time || null
              }) });
          if (!updateResponse.ok) console.error("Erro ao atualizar bombeiros existentes.");
        }
        showPopup('popup-success', `Despacho gravado com sucesso!`);
        const refreshResponse = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?corp_oper_nr=eq.${vehicleData.corp_oper_nr}&internal_number=eq.${vehicleData.internal_number}&select=*,cb360_dispatch_crew(*)&order=id.asc&cb360_dispatch_crew.order=id.asc`);
        if (refreshResponse.ok) {
          const freshData = await refreshResponse.json();
          cb360ResourcesVehicles = freshData.map(mean => ({
            id: String(mean.id), vehicle: mean.vehicle || '', crew: mean.cb360_dispatch_crew?.length || 0, departureDateCB: mean.cb_departure_date || '', departureTimeCB: mean.cb_departure_time || '',
            arrivalDateScene: mean.scene_arrival_date || '', arrivalTimeScene: mean.scene_arrival_time || '', departureDateScene: mean.scene_departure_date || '', departureTimeScene: mean.scene_departure_time || '',
            arrivalDateCB: mean.cb_arrival_date || '', arrivalTimeCB: mean.cb_arrival_time || '', kmStart: mean.km_start || '', kmEnd: mean.km_end || '', radio_issi_siresp: mean.radio_issi_siresp || '',
          }));
          cb360ResourcesFirefighters = freshData.flatMap(mean => {
            const crewList = mean.cb360_dispatch_crew || [];
            const minorNInt = crewList.length
              ? crewList.reduce((minor, actual) => String(actual.n_int) < String(minor) ? actual.n_int : minor, crewList[0].n_int) : null;
            return crewList.map(crew => ({
              id: String(crew.id), code: String(crew.n_int), vehicle: mean.vehicle || '', role: crew.role || '', specialty: crew.specialty || '', departureDate: crew.departure_date || '',
              departureTime: crew.departure_time || '', returnDate: crew.return_date || '', returnTime: crew.return_time || '', confirmed: crew.n_int === minorNInt, radio_assigned: crew.radio_assigned || '', editing: false
            }));
          });
          await refreshCb360VehicleRegistrations();
        }
        cb360VehicleUnderDevelopment = null;
        renderCb360VehiclesTable();
        renderCb360FirefightersTable();
        closeCb360DispatchModal();
      } catch (err) {
        console.error("Erro crítico:", err);
        showPopup('popup-danger', `Ocorreu um erro ao gravar. Verifica a consola.`);
      }
    }
    // ---- 6.4 INSERIR / EDITAR BOMBEIRO INDIVIDUAL (modais à parte do Despacho) ----
    // OPEN: openCb360InsertFirefighterModal()
    async function openCb360InsertFirefighterModal() {
      const page = document.getElementById('page-cb360-redund');
      if (!page || document.getElementById('goc-firefighter-modal-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'goc-firefighter-modal-overlay';
      overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; align-items:center; justify-content:center;';
      const inputStyle = 'width:100%; height:28px; padding:4px 8px; border:1px solid #5bc0de; border-radius:4px; font-size:12px; box-sizing:border-box;';
      const labelStyle = 'font-size:12px; font-weight:600; color:#333; white-space:nowrap; cursor:pointer; flex-shrink:0;';
      window.fillDate = (id) => {
        const el = document.getElementById(id);
        if (el) el.value = new Date().toISOString().split('T')[0];
      };
      window.fillTime = (id) => {
        const el = document.getElementById(id);
        if (el) el.value = new Date().toTimeString().substring(0, 5);
      };
      overlay.innerHTML = `
        <style>
          #goc-ff-janela input:focus, #goc-ff-janela select:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
        </style>
        <div id="goc-ff-janela" style="background:#fff; width:560px; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.25);">
          <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px; border-radius:8px 8px 0 0;">
            <div style="font-weight:600; font-size:14px;"><i class="fa-solid fa-plus"></i> Inserir Bombeiro</div>
            <button id="goc-ff-btn-x" style="background:transparent; border:none; color:#fff; cursor:pointer;">✕</button>
          </div>
          <div style="padding:20px; display:flex; flex-direction:column; gap:5px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <label style="${labelStyle} width:100px;">Viatura</label>
              <select id="goc-ff-vehicle-select" style="${inputStyle}">
                <option value=""></option>
              </select>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle} width:100px;" onclick="fillDate('goc-ff-departure-date')">Data Saída</label>
                <input type="date" id="goc-ff-departure-date" style="${inputStyle}">
              </div>
              <div style="display:flex; align-items:center; gap:0px;">
                <label style="${labelStyle} width:100px; margin-left:40px;" onclick="fillTime('goc-ff-departure-time')">Hora Saída CB</label>
                <input type="time" id="goc-ff-departure-time" style="${inputStyle}">
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle} width:100px;" onclick="fillDate('goc-ff-return-date')">Data Regresso</label>
                <input type="date" id="goc-ff-return-date" style="${inputStyle}">
              </div>
              <div style="display:flex; align-items:center; gap:0px;">
                <label style="${labelStyle} width:100px; margin-left:40px;" onclick="fillTime('goc-ff-return-time')">Hora Regresso</label>
                <input type="time" id="goc-ff-return-time" style="${inputStyle}">
              </div>
            </div>
            <div style="border-top:1px solid #eee; padding-top:12px;">
              <div style="font-weight:600; color:#2b6ecb; font-size:13px; margin-bottom:4px;">Guarnição</div>
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                <label style="${labelStyle} width:100px; cursor:default;">Equipa(s)</label>
                <select id="goc-ff-team-select" style="${inputStyle}">
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle} width:100px; cursor:default;">Bombeiro(s)</label>
                <div style="position:relative; flex:1;">
                  <input type="text" id="goc-ff-firefighters-input" placeholder="Pesquisar..." autocomplete="off" class="goc-input goc-input-full" readonly style="${inputStyle}; cursor:pointer; padding-right:24px; background:#fff;"><i id="goc-ff-firefighters-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color:#000; pointer-events:none; transition:transform .15s;"></i>
                  <div id="goc-ff-firefighters-dropdown" style="display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; z-index:300; background:#fff; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; max-height:300px; box-shadow:0 4px 8px rgba(0,0,0,.12);">
                    <input type="text" id="goc-ff-firefighters-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
                    <div id="goc-ff-firefighters-list" style="overflow-y:auto; max-height:250px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; padding:15px 20px; border-top:1px solid #eee; background:#fafafa; border-radius:0 0 8px 8px;">
            <button id="goc-ff-btn-guardar" style="background:#5cb85c; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="far fa-save"></i>&nbsp;&nbsp;Guardar</button>
            <button id="goc-ff-btn-fechar" style="background:#f0ad4e; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button>
          </div>
        </div>
      `;
      page.appendChild(overlay);
      const vehicleSelect = document.getElementById('goc-ff-vehicle-select');
      cb360ResourcesVehicles.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `#${idx + 1} - ${cb360VehicleLabel(v.vehicle)}`;
        vehicleSelect.appendChild(opt);
      });
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().slice(0, 5);
      document.getElementById('goc-ff-departure-date').value = today;
      document.getElementById('goc-ff-departure-time').value = now;
      document.getElementById('goc-ff-return-date').value = today;
      const firefightersList = await fetchCb360FirefightersList();
      await initializeAddFirefighterCombobox(firefightersList);
      vehicleSelect.addEventListener('change', async () => {
        document.querySelectorAll('#goc-ff-firefighters-dropdown input[type="checkbox"]').forEach(cb => {
          cb.checked = false;
        });
        const selectedVehicleId = vehicleSelect.value;
        if (!selectedVehicleId) {
          if (typeof window.updateFFModalCounter === 'function') window.updateFFModalCounter();
          return;
        }
        try {
          const crewUrl = `${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?dispatch_vehicle_id=eq.${selectedVehicleId}` +
            `&corp_oper_nr=eq.${sessionStorage.getItem("currentCorpOperNr") || "0805"}`;
          const crewResponse = await supaFetch(crewUrl, { method: 'GET' });
          if (crewResponse.ok) {
            const associatedFirefighters = await crewResponse.json();
            const idsSelected = associatedFirefighters.map(b => String(b.n_int));
            document.querySelectorAll('#goc-ff-firefighters-dropdown input[type="checkbox"]').forEach(cb => {
              if (idsSelected.includes(String(cb.value))) cb.checked = true;
            });
            if (typeof window.updateFFModalCounter === 'function') window.updateFFModalCounter();
          }
        } catch (err) {
          console.error('Erro ao carregar bombeiros da viatura selecionada:', err);
        }
      });
      document.getElementById('goc-ff-btn-x').addEventListener('click', closeCb360InsertFirefighterModal);
      document.getElementById('goc-ff-btn-fechar').addEventListener('click', closeCb360InsertFirefighterModal);
      document.getElementById('goc-ff-btn-guardar').addEventListener('click', saveCb360InsertedFirefighters);
      overlay.addEventListener('click', (e) => {if (e.target === overlay) closeCb360InsertFirefighterModal();});
      setTimeout(() => {
        overlay.style.display = 'flex';
      }, 10);
    }
    // CLOSE: closeCb360InsertFirefighterModal()
    function closeCb360InsertFirefighterModal() {
      const overlay = document.getElementById('goc-firefighter-modal-overlay');
      if (overlay) overlay.remove();
    }
    // SAVE: saveCb360InsertedFirefighters()
    async function saveCb360InsertedFirefighters() {
      const vehicleSelect = document.getElementById('goc-ff-vehicle-select');
      const dispatchVehicleId = vehicleSelect.value;
      if (!dispatchVehicleId) {
        showPopup('popup-danger', "Selecione uma viatura.");
        return;
      }
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const internalNumber = document.getElementById('goc-internal-nr')?.value;
      const departureDate = document.getElementById('goc-ff-departure-date').value || null;
      const departureTime = document.getElementById('goc-ff-departure-time').value || null;
      const returnTime = document.getElementById('goc-ff-return-time').value || null;
      const checkedIds = Array.from(
        document.querySelectorAll('#goc-ff-firefighters-dropdown input[type="checkbox"]:checked')
      ).map(cb => String(cb.value));
      if (checkedIds.length === 0) {
        showPopup('popup-danger', "Selecione pelo menos um bombeiro.");
        return;
      }
      try {
        const existingCrewResp = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?dispatch_vehicle_id=eq.${dispatchVehicleId}&corp_oper_nr=eq.${currentCorpOperNr}`);
        const existingCrew = existingCrewResp.ok ? await existingCrewResp.json() : [];
        const existingIds = new Set(existingCrew.map(c => String(c.n_int)));
        const idsToAdd = checkedIds.filter(id => !existingIds.has(id));
        if (idsToAdd.length === 0) {
          showPopup('popup-danger', "Os bombeiros selecionados já estão associados a esta viatura.");
          return;
        }
        const selected = idsToAdd.map(n_int => ({
          corp_oper_nr: currentCorpOperNr, dispatch_vehicle_id: dispatchVehicleId, internal_number: internalNumber, n_int, departure_date: departureDate, departure_time: departureTime,
          return_time: returnTime
        }));
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew`, { method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify(selected) });
        if (!response.ok) {
          console.error('Erro ao gravar bombeiros:', await response.text());
          showPopup('popup-danger', "Erro ao gravar os bombeiros.");
          return;
        }
        const refreshed = await fetchDispatchData(internalNumber);
        cb360ResourcesVehicles = refreshed.map(mean => ({
          id: String(mean.id), vehicle: mean.vehicle || '', crew: mean.cb360_dispatch_crew?.length || 0, departureDateCB: mean.cb_departure_date || '', departureTimeCB: mean.cb_departure_time || '',
          arrivalDateScene: mean.scene_arrival_date || '', arrivalTimeScene: mean.scene_arrival_time || '', departureDateScene: mean.scene_departure_date || '', departureTimeScene: mean.scene_departure_time || '',
          arrivalDateCB: mean.cb_arrival_date || '', arrivalTimeCB: mean.cb_arrival_time || '', kmStart: mean.km_start || '', kmEnd: mean.km_end || '', radio_issi_siresp: mean.radio_issi_siresp || '', editing: false
        }));
        cb360ResourcesFirefighters = refreshed.flatMap(mean => {
          const crewList = mean.cb360_dispatch_crew || [];
          const minorNInt = crewList.length
            ? crewList.reduce((minor, actual) => String(actual.n_int) < String(minor) ? actual.n_int : minor, crewList[0].n_int) : null;
          return crewList.map(crew => ({
            id: String(crew.id), vehicle: mean.vehicle || '', confirmed: crew.n_int === minorNInt, code: crew.n_int || '', role: crew.role || '', specialty: crew.specialty || '',
            departureDate: crew.departure_date || '', departureTime: crew.departure_time || '', returnDate: crew.return_date || '', returnTime: crew.return_time || '', radio_assigned: crew.radio_assigned || '', editing: false
          }));
        });
        await refreshCb360VehicleRegistrations();
        renderCb360VehiclesTable();
        renderCb360FirefightersTable();
        closeCb360InsertFirefighterModal();
      } catch (err) {
        console.error('Erro fetch saveCb360InsertedFirefighters:', err);
        showPopup('popup-danger', "Erro de rede ao gravar os bombeiros.");
      }
    }
    // OPEN: openCb360EditFirefighterModal()
    async function openCb360EditFirefighterModal(firefighter) {
      const page = document.getElementById('page-cb360-redund');
      if (!page || document.getElementById('goc-edit-ff-modal-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'goc-edit-ff-modal-overlay';
      overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; align-items:center; justify-content:center;';
      const inputStyle = 'width:100%; height:25px; padding:4px 8px; border:1px solid #5bc0de; border-radius:4px; font-size:12px; box-sizing:border-box;';
      const labelStyle = 'width:100px; font-size:12px; font-weight:600; color:#333; flex-shrink:0;';
      window.fillDate = (id) => {
        const el = document.getElementById(id);
        if (el) el.value = new Date().toISOString().split('T')[0];
      };
      window.fillTime = (id) => {
        const el = document.getElementById(id);
        if (el) el.value = new Date().toTimeString().substring(0, 5);
      };
      overlay.innerHTML = `
        <style>
          #goc-edit-ff-corpo input:focus, #goc-edit-ff-corpo select:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
        </style>
        <div id="goc-edit-ff-janela" style="background:#fff; width:460px; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.25); overflow:hidden;">
          <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px;">
            <div style="font-weight:600; font-size:14px;"><i class="fa-solid fa-pencil"></i> Editar Bombeiro</div>
            <button id="goc-edit-ff-btn-x" style="background:transparent; border:none; color:#fff; cursor:pointer;">✕</button>
            </div>
            <div id="goc-edit-ff-corpo" style="padding:20px; display:flex; flex-direction:column; gap:5px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle}">Viatura</label>
                <select id="goc-edit-ff-vehicle-select" style="${inputStyle}">
                  <option value=""></option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle}">Bombeiro</label>
                <select id="goc-edit-ff-firefighter-select" style="${inputStyle}">
                  <option value=""></option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle}">Função</label>
                <select id="goc-edit-ff-role-select" style="${inputStyle}">
                  <option value=""></option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle}">Desc. Função</label>
                <input type="text" id="goc-edit-ff-role-desc" style="${inputStyle}">
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="${labelStyle}">Espécie</label>
                <select id="goc-edit-ff-specialty-select" style="${inputStyle}">
                  <option value=""></option>
                </select>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <label style="${labelStyle} cursor:pointer;" onclick="fillDate('goc-edit-ff-departure-date')">Data Saída</label>
                  <input type="date" id="goc-edit-ff-departure-date" style="${inputStyle}">
                </div>
                <div style="display:flex; align-items:center; gap:0px;">
                  <label style="${labelStyle} margin-left: 5px; cursor:pointer;" onclick="fillTime('goc-edit-ff-departure-time')">Hora Saída CB</label>
                  <input type="time" id="goc-edit-ff-departure-time" style="${inputStyle}">
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <label style="${labelStyle} cursor:pointer;" onclick="fillDate('goc-edit-ff-return-date')">Data Regresso</label>
                  <input type="date" id="goc-edit-ff-return-date" style="${inputStyle}">
                </div>
                <div style="display:flex; align-items:center; gap:0px;">
                  <label style="${labelStyle} margin-left: 5px; cursor:pointer;" onclick="fillTime('goc-edit-ff-return-time')">Hora Regresso</label>
                  <input type="time" id="goc-edit-ff-return-time" style="${inputStyle}">
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:15px;">
                <input type="checkbox" id="goc-edit-ff-chefe" disabled style="width:14px; height:14px;">
                <label for="goc-edit-ff-chefe" style="font-size:12px; color:#666;">Chefe de Viatura</label>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; padding:15px 20px; border-top:1px solid #eee; background:#fafafa;">
              <button id="goc-edit-ff-btn-guardar" style="background:#5cb85c; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="far fa-save"></i>&nbsp;&nbsp;Guardar</button>
              <button id="goc-edit-ff-btn-fechar" style="background:#f0ad4e; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button>
            </div>
          </div>
        `;
      page.appendChild(overlay);
      const vehicleSelect = document.getElementById('goc-edit-ff-vehicle-select');
      cb360ResourcesVehicles.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = v.vehicle;
        opt.textContent = `#${idx + 1} - ${cb360VehicleLabel(v.vehicle)}`;
        vehicleSelect.appendChild(opt);
      });
      vehicleSelect.value = firefighter.vehicle || '';
      const firefightersList = await fetchCb360FirefightersList();
      const firefighterSelect = document.getElementById('goc-edit-ff-firefighter-select');
      firefightersList.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.label;
        firefighterSelect.appendChild(opt);
      });
      firefighterSelect.value = firefighter.code || '';
      document.getElementById('goc-edit-ff-role-desc').value = firefighter.role || '';
      document.getElementById('goc-edit-ff-departure-date').value = firefighter.departureDate || '';
      document.getElementById('goc-edit-ff-departure-time').value = firefighter.departureTime || '';
      document.getElementById('goc-edit-ff-return-date').value = firefighter.returnDate || document.getElementById('goc-edit-ff-departure-date').value || '';
      document.getElementById('goc-edit-ff-return-time').value = firefighter.returnTime || '';
      document.getElementById('goc-edit-ff-chefe').checked = !!firefighter.confirmed;
      document.getElementById('goc-edit-ff-btn-x').addEventListener('click', closeCb360EditFirefighterModal);
      document.getElementById('goc-edit-ff-btn-fechar').addEventListener('click', closeCb360EditFirefighterModal);
      document.getElementById('goc-edit-ff-btn-guardar').addEventListener('click', () => saveCb360EditFirefighter(firefighter));
      overlay.addEventListener('click', (e) => {if (e.target === overlay) closeCb360EditFirefighterModal();});
      setTimeout(() => {
        overlay.style.display = 'flex';
      }, 10);
    }
    // CLOSE: closeCb360EditFirefighterModal()
    function closeCb360EditFirefighterModal() {
      const overlay = document.getElementById('goc-edit-ff-modal-overlay');
      if (overlay) overlay.remove();
    }
    // SAVE: saveCb360EditFirefighter()
    async function saveCb360EditFirefighter(firefighter) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const departureTimeVal = document.getElementById('goc-edit-ff-departure-time').value || null;
      const returnTimeVal = document.getElementById('goc-edit-ff-return-time').value || null;
      const payload = {corp_oper_nr: currentCorpOperNr, n_int: document.getElementById('goc-edit-ff-firefighter-select').value || null, role: document.getElementById('goc-edit-ff-role-desc').value || null,
                       departure_date: departureTimeVal ? (document.getElementById('goc-edit-ff-departure-date').value || null) : null, departure_time: departureTimeVal,
                       return_date: returnTimeVal ? (document.getElementById('goc-edit-ff-return-date').value || null) : null, return_time: returnTimeVal
                      };
      try {
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?id=eq.${firefighter.id}`, { method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify(payload) });
        if (!response.ok) {
          console.error('Erro ao atualizar bombeiro:', await response.text());
          alert('Erro ao gravar as alterações.');
          return;
        }
        const internalNumber = document.getElementById('goc-internal-nr')?.value;
        const refreshed = await fetchDispatchData(internalNumber);
        cb360ResourcesVehicles = refreshed.map(mean => ({
          id: String(mean.id), vehicle: mean.vehicle || '', crew: mean.cb360_dispatch_crew?.length || 0, departureDateCB: mean.cb_departure_date || '', departureTimeCB: mean.cb_departure_time || '',
          arrivalDateScene: mean.scene_arrival_date || '', arrivalTimeScene: mean.scene_arrival_time || '', departureDateScene: mean.scene_departure_date || '', departureTimeScene: mean.scene_departure_time || '',
          arrivalDateCB: mean.cb_arrival_date || '', arrivalTimeCB: mean.cb_arrival_time || '', kmStart: mean.km_start || '', kmEnd: mean.km_end || '', radio_issi_siresp: mean.radio_issi_siresp || '', editing: false
        }));
        cb360ResourcesFirefighters = refreshed.flatMap(mean => {
          const crewList = mean.cb360_dispatch_crew || [];
          const minorNInt = crewList.length
            ? crewList.reduce((minor, actual) => String(actual.n_int) < String(minor) ? actual.n_int : minor, crewList[0].n_int) : null;
          return crewList.map(crew => ({
            id: String(crew.id), vehicle: mean.vehicle || '', confirmed: crew.n_int === minorNInt, code: crew.n_int || '', role: crew.role || '', specialty: crew.specialty || '',
            departureDate: crew.departure_date || '', departureTime: crew.departure_time || '', returnDate: crew.return_date || '', returnTime: crew.return_time || '', radio_assigned: crew.radio_assigned || '', editing: false
          }));
        });
        await refreshCb360VehicleRegistrations();
        renderCb360VehiclesTable();
        renderCb360FirefightersTable();
        closeCb360EditFirefighterModal();
      } catch (err) {
        console.error('Erro saveCb360EditFirefighter:', err);
        alert('Erro de rede ao gravar as alterações.');
      }
    }
    // ---- 6.5 LOCALIZAR VIATURAS (modal simples, sem lógica por agora) ----
async function openCb360LocateVehiclesModal() {
  const page = document.getElementById('page-cb360-redund');
  if (!page || document.getElementById('goc-locate-vehicles-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'goc-locate-vehicles-overlay';
  overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; align-items:center; justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff; width:780px; height:620px; border-radius:8px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.25); font-family:sans-serif;">
      <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px; border-radius:8px 8px 0 0;">
        <div style="font-weight:600; font-size:14px;"><i class="fa-solid fa-truck"></i>&nbsp;&nbsp;Localizar Viaturas</div>
        <button class="goc-close-btn" style="background:transparent; border:none; color:#fff; cursor:pointer; font-size:16px;">✕</button>
      </div>
      <div id="goc-locate-vehicles-map" style="width:100%; height:380px; background:#f9f9f9; position:relative;"></div>
      <div style="flex:1; overflow-y:auto; padding:16px; color:#777; font-size:13px;">
        A ocorrência não tem as coordenadas registadas
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; padding:15px 20px; border-top:1px solid #eee; background:#fafafa; border-radius:0 0 8px 8px;">
        <button class="goc-close-btn" style="background:#f0ad4e; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button>
      </div>
    </div>
  `;
  page.appendChild(overlay);
  const closeModal = () => {
    if (window.cb360LocateVehiclesMap) {
      window.cb360LocateVehiclesMap.remove();
      window.cb360LocateVehiclesMap = null;
    }
    overlay.remove();
  };
  overlay.querySelectorAll('.goc-close-btn').forEach(btn => btn.addEventListener('click', closeModal));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  setTimeout(() => {
    overlay.style.display = 'flex';
    window.cb360LocateVehiclesMap = L.map('goc-locate-vehicles-map').setView([39.5, -8.0], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(window.cb360LocateVehiclesMap);
    setTimeout(() => {
      if (window.cb360LocateVehiclesMap) window.cb360LocateVehiclesMap.invalidateSize();
    }, 50);
  }, 10);
}


    async function getRoadRouteWithGeometry(lat1, lon1, lat2, lon2) {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distanceText: route.distance < 1000 ? Math.round(route.distance) + ' m' : (route.distance / 1000).toFixed(2) + ' km', 
            timeText: Math.round(route.duration / 60) <= 1 ? '1 min' : `${Math.round(route.duration / 60)} mins`, coordinates: route.geometry.coordinates
          };
        }
      } catch (error) {
        console.warn('Erro ao obter rota detalhada:', error);
      }
      return null;
    }
    async function openCb360LocateIncidentModal(internalNumber) {
      document.querySelectorAll('#goc-locate-modal').forEach(el => el.remove());
      const modal = document.createElement('div');
      modal.id = 'goc-locate-modal';
      modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:9999; display:flex; align-items:center; justify-content:center;';
      modal.innerHTML = `
        <div style="background:#fff; width:780px; height:680px; border-radius:8px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.25); font-family: sans-serif;">
          <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px; border-radius:8px 8px 0 0;">
            <div style="font-weight:600; font-size:14px;"><i class="fa-solid fa-location-dot"></i> Localizar Viaturas e Ocorrência</div>
            <button class="goc-close-btn" style="background:transparent; border:none; color:#fff; cursor:pointer;">✕</button>
          </div>
          <div style="padding: 12px 16px; background:#fff; border-bottom: 1px solid #eee; font-size: 13px;">
            <div style="display:flex; gap: 24px;">
              <div>
                <span style="color:#2b6ecb; font-weight:600;">Ocorrência:</span>
                <span id="goc-loc-number" style="color:#333; font-weight:600;">--</span>
              </div>
              <div>
                <span style="color:#2b6ecb; font-weight:600;">Código Serviço:</span>
                <span id="goc-loc-service" style="color:#333;">--</span>
              </div>
            </div>
          </div>
          <div style="background:#fff; border-bottom: 1px solid #eee; max-height: 130px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: separate; border-spacing:0; font-size: 12px; text-align: center;">
              <thead>
                <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color: #333; font-weight: 600;">
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:10%; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Num.</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:22%; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Veículo</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:38%; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Ocorrência</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:15%; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Distância</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:15%; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Tempo Estimado</th>
                </tr>
              </thead>
              <tbody id="goc-vehicles-table-body">
                <tr><td colspan="5" style="padding:12px; text-align:center; color:#777;">A carregar dados...</td></tr>
              </tbody>
            </table>
          </div>
          <div id="goc-locate-map-container" style="flex:1; width:100%; background:#f9f9f9; position: relative;"></div>
          <div style="display:flex; justify-content:flex-end; gap:10px; padding:15px 20px; border-top:1px solid #eee; background:#fafafa; border-radius:0 0 8px 8px;">
            <button class="goc-close-btn" style="background:#f0ad4e; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const closeModal = () => { modal.remove(); };
      modal.querySelectorAll('.goc-close-btn').forEach(btn => btn.addEventListener('click', closeModal));
      try {
        const incResponse = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_incidents?internal_number=eq.${internalNumber}`, { method: 'GET' });
        if (!incResponse.ok) throw new Error('Erro na ocorrência');
        const incData = await incResponse.json();
        if (!incData || incData.length === 0) throw new Error('Ocorrência não encontrada.');
        const inc = incData[0];
        const vehResponse = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?internal_number=eq.${internalNumber}`, { method: 'GET' });
        let vehicles = [];
        if (vehResponse.ok) {
          vehicles = await vehResponse.json();
        }
        const locNumberElem = modal.querySelector('#goc-loc-number');
        const locServiceElem = modal.querySelector('#goc-loc-service');
        const tbody = modal.querySelector('#goc-vehicles-table-body');
        const mapContainer = modal.querySelector('#goc-locate-map-container');
        if (locNumberElem) locNumberElem.innerText = inc.internal_number || '--';
        if (locServiceElem) {
          const sType = inc.classification || '';
          const sDesc = inc.description || '';
          locServiceElem.innerText = sType && sDesc ? `${sType} - ${sDesc}` : (sType || sDesc || '--');
        }
        // Cálculo da Rota, Distância e Tempo por Estrada
        let calculatedDistanceText = '--';
        let calculatedTimeText = '--';
        let routeCoordinates = null;
        if (inc.coord_x && inc.coord_y) {
          const baseLat = 37.014151;
          const baseLon = -7.935543;
          const occLat = parseFloat(inc.coord_x);
          const occLon = parseFloat(inc.coord_y);
          const routeInfo = await getRoadRouteWithGeometry(baseLat, baseLon, occLat, occLon);
          if (routeInfo) {
            calculatedDistanceText = routeInfo.distanceText;
            calculatedTimeText = routeInfo.timeText;
            routeCoordinates = routeInfo.coordinates;
          }
        }
        // Preencher a tabela de veículos
        if (tbody) {
          tbody.innerHTML = '';
          const descriptionText = inc.description;
          if (Array.isArray(vehicles) && vehicles.length > 0) {
            vehicles.forEach((veh, index) => {
              const vehicleCode = veh.vehicle;
              const timeVal = veh.estimated_time !== undefined && veh.estimated_time !== null ? veh.estimated_time : calculatedTimeText;
              const tr = document.createElement('tr');
              tr.style.borderBottom = '1px solid #eee';
              tr.innerHTML = `
                <td style="padding:6px 8px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${index + 1}</td>
                <td style="padding:6px 8px; text-align:center; font-weight:600; color:#2b6ecb; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${vehicleCode}</td>
                <td style="padding:6px 8px; text-align:left; padding-left:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px; border-right:1px solid #ccc; border-bottom:1px solid #ccc;" title="${descriptionText}">${descriptionText}</td>
                <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${calculatedDistanceText}</td>
                <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${timeVal}</td>
              `;
              tbody.appendChild(tr);
            });
          } else {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td style="padding:6px 8px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">1</td>
              <td style="padding:6px 8px; text-align:center; font-weight:600; color:#2b6ecb; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">ABSC-01</td>
              <td style="padding:6px 8px; text-align:left; padding-left:10px; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${descriptionText}</td>
              <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${calculatedDistanceText}</td>
              <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${calculatedTimeText}</td>
            `;
            tbody.appendChild(tr);
          }
        }
        // Inicializar o mapa Leaflet
        if (window.cb360LocateMap) {
          window.cb360LocateMap.remove();
          window.cb360LocateMap = null;
        }
        window.cb360LocateMap = L.map(mapContainer).setView([38.736946, -9.142685], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.cb360LocateMap);
        if (inc.coord_x && inc.coord_y) {
          let lat = parseFloat(inc.coord_x);
          let lng = parseFloat(inc.coord_y);
          // Desenhar a rota no mapa se existir geometria disponível
          if (routeCoordinates && routeCoordinates.length > 0) {
            const latLngs = routeCoordinates.map(coord => [coord[1], coord[0]]);
            const routePolyline = L.polyline(latLngs, {
              color: '#2b6ecb',
              weight: 5,
              opacity: 0.8
            }).addTo(window.cb360LocateMap);
            window.cb360LocateMap.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
          } else {
            window.cb360LocateMap.setView([lat, lng], 16);
          }
          const megaphonePulseIcon = L.divIcon({
            className: 'custom-exact-pulse-pin-megaphone',
            html: `
              <div style="position: relative; width: 32px; height: 42px;">
                <svg viewBox="0 0 384 512" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; fill: #ff0033; animation: pin-pulse-wave 1.5s infinite; transform-origin: bottom center; z-index: 1;">
                  <path d="M172.268 501.67C26.97 291.03 0 269.41 0 192 0 85.96 85.96 0 192 0s192 85.96 192 192c0 77.41-26.97 99.03-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
                </svg>
                <div style="position: relative; width: 32px; height: 42px; z-index: 2;">
                  <svg viewBox="0 0 384 512" style="width: 100%; height: 100%; fill: #ff0033; filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4));">
                    <path d="M172.268 501.67C26.97 291.03 0 269.41 0 192 0 85.96 85.96 0 192 0s192 85.96 192 192c0 77.41-26.97 99.03-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
                  </svg>
                  <i class="fa-solid fa-bullhorn" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: white; font-size: 13px;"></i>
                </div>
              </div>
              <style>
                @keyframes pin-pulse-wave {0% {transform: scale(1); opacity: 0.8;} 70% {transform: scale(1.45); opacity: 0;} 100% {transform: scale(1); opacity: 0;}}
              </style>
            `,
            iconSize: [32, 42],
            iconAnchor: [16, 42],
            popupAnchor: [0, -40]
          });
          const markerText = `<b>Ocorrência:</b> ${inc.internal_number}<br><b>Estado:</b> ${inc.status}<br><b>Morada:</b> ${inc.address || ''}`;
          const marker = L.marker([lat, lng], { icon: megaphonePulseIcon }).bindPopup(markerText);
          window.cb360LocateMap.addLayer(marker);
          marker.openPopup();
        }
        setTimeout(() => {
          if (window.cb360LocateMap) {
            window.cb360LocateMap.invalidateSize();
          }
        }, 250);
      } catch (err) {
        console.error('ERRO:', err);
        const tbody = modal.querySelector('#goc-vehicles-table-body');
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="5" style="padding:12px; text-align:center; color:#d9534f;">Erro ao carregar dados.</td></tr>`;
        }
      }
    }
    function calculateDistanceKm(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *  Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    // ==============================================================================
    // == 7. VÍTIMAS                                                              ==
    // ==============================================================================
    // ---- RENDER (shell da tab): renderCb360VictimsTab() ----
    function renderCb360VictimsTab() {
      const container = document.getElementById('goc-tab-content-victims');
      if (!container) return;
      const isClosed = !!cb360CurrentIncident?.is_closed;
      const sumCell = (cat, sev) => `<input type="text" id="goc-vict-sum-${cat}-${sev}" readonly class="goc-summary-input" style="width:100%; height:24px; text-align:center; border:1px solid #5bc0de; border-radius:4px; background:#f5f5f5; font-size:11px;">`;
      container.innerHTML = `
        <style>.goc-summary-input:focus {outline: none !important; border: 1px solid #2b6ecb !important; box-shadow: 0 0 4px rgba(43, 110, 203, 0.3) !important;}</style>
        <div style="margin-bottom:16px;">
          <div style="font-weight:600; font-size:13px; color:#2b6ecb; margin-bottom:8px;">Resumo de Vítimas: <i class="fa-solid fa-circle-info" style="color:#5bc0de; font-size:12px;"></i></div>
          <div style="display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap;">
            <div style="border:1px solid #ddd; border-radius:4px; padding:10px 14px;">
              <div style="display:grid; grid-template-columns: 90px repeat(4, 72px); gap:8px; align-items:center;">
                <div></div>
                <div style="font-size:11.5px; font-weight:600; text-align:center;">Leves</div>
                <div style="font-size:11.5px; font-weight:600; text-align:center;">Graves</div>
                <div style="font-size:11.5px; font-weight:600; text-align:center;">Mortos</div>
                <div style="font-size:11.5px; font-weight:600; text-align:center;">Assistidos</div>
                <div style="font-size:11.5px; font-weight:600;">Bombeiro</div>
                ${sumCell('Bombeiro', 'Leve')}${sumCell('Bombeiro', 'Grave')}${sumCell('Bombeiro', 'Morto')}${sumCell('Bombeiro', 'Assistido')}
                <div style="font-size:11.5px; font-weight:600;">APC</div>
                ${sumCell('APC', 'Leve')}${sumCell('APC', 'Grave')}${sumCell('APC', 'Morto')}${sumCell('APC', 'Assistido')}
                <div style="font-size:11.5px; font-weight:600;">Civis</div>
                ${sumCell('Civil', 'Leve')}${sumCell('Civil', 'Grave')}${sumCell('Civil', 'Morto')}${sumCell('Civil', 'Assistido')}
              </div>
            </div>
            <div style="border:1px solid #ddd; border-radius:4px; padding:10px 14px;">
              <div style="font-size:11.5px; font-weight:600; margin-bottom:6px;">Sem Trauma</div>
                <input type="text" id="goc-vict-sum-sem-trauma" readonly class="goc-summary-input" style="width:70px; height:24px; text-align:center; border:1px solid #5bc0de; border-radius:4px; background:#f5f5f5; font-size:11px;">
              </div>
            </div>
          </div>
          <div>
          <div style="font-weight:600; font-size:13px; color:#2b6ecb; margin-bottom:6px;">Detalhe de Vítimas:</div>
          <div id="goc-victims-wrap" style="overflow-x:auto; overflow-y:auto; max-height:320px; border:1px solid #eee; border-radius:4px;">
            <table style="width:100%; table-layout:fixed; border-collapse:separate; border-spacing:0; font-size:12px;">
              <colgroup>
                <col style="width:26px;">
                <col style="width:34px;">
                <col style="width:120px;">
                <col style="width:auto;">
                <col style="width:90px;">
                <col style="width:90px;">
                <col style="width:120px;">
                <col style="width:120px;">
                <col style="width:auto;">
                <col style="width:60px;">
                <col style="width:60px;">
              </colgroup>
              <thead>
                <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">▸</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">#</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Viatura</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Doente</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Sexo</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Idade</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Tipo</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Gravidade</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Destino</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;" colspan="2">
                    <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
                      ${isClosed ? '' : `<button id="goc-btn-add-victim" style="background:none; border:none; cursor:pointer; font-size:15px; line-height:1;"><i class="fa fa-medkit fa-lg" style="color:#333;"></i></button>`}
                      ${isClosed ? '' : `<button id="goc-btn-clock" style="background:none; border:none; cursor:pointer; font-size:14px; line-height:1;"><i class="fa-regular fa-clock" style="font-size:16px;"></i></button>`}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody id="goc-victims-table-body"></tbody>
            </table>
          </div>
        </div>
      `;      
      renderCb360VictimsTable();
      const btnAddVictim = document.getElementById('goc-btn-add-victim');
      if (btnAddVictim) {
        const icon = btnAddVictim.querySelector('i');
        btnAddVictim.addEventListener('mouseenter', () => {
          icon.style.color = '#2b6ecb';
        });
        btnAddVictim.addEventListener('mouseleave', () => {
          icon.style.color = '#333';
        });
        btnAddVictim.addEventListener('click', () => {
          openCb360VictimModal(null);
        });
      }
    }
    // ===== RENDER PAGES ===== //
    // RENDER: renderCb360VictimsTable()
    function renderCb360VictimsTable() {
      const tbody = document.getElementById('goc-victims-table-body');
      if (!tbody) return;
      const isClosed = !!cb360CurrentIncident?.is_closed;
      tbody.innerHTML = cb360ResourcesVictims.length ? cb360ResourcesVictims.map((v, idx) => `
        <tr style="border-bottom:1px solid #eee;" data-row-id="${v.id}">
          <td style="padding:6px 8px; width:30px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; color:#999;">▸</td>
          <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${idx + 1}</td>
          <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.vehicle || '-'}</td>
          <td style="padding:6px 8px; text-align:left; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.patient_name || ''}</td>
          <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.sex || ''}</td>
          <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.age || ''}</td>
          <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.category || ''}</td>
          <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.severity || ''}</td>
          <td style="padding:6px 8px; text-align:left; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${v.destination || ''}</td>
          <td style="padding:6px 8px; width:35px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
          ${isClosed ? '' : `<button class="goc-victim-toggle" data-id="${v.id}" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; font-size:13px;"><i class="fa-solid fa-pencil"></i></button>`}</td>
          <td style="padding:6px 8px; width:35px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
          ${isClosed ? '' : `<button class="goc-victim-remove" data-id="${v.id}" style="background:transparent; border:none; color:#d9534f; cursor:pointer; font-size:13px;"><i class="fa-solid fa-trash"></i></button>`}</td>
        </tr>`).join('') : `<tr><td colspan="11" style="padding:14px; text-align:center; color:#2b6ecb;">Sem nenhuma Vítima!</td></tr>
      `;
      tbody.querySelectorAll('.goc-victim-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = cb360ResourcesVictims.find(v => String(v.id) === btn.dataset.id);
          if (item) openCb360VictimModal(item);
        });
      });
      tbody.querySelectorAll('.goc-victim-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const victimId = btn.dataset.id;
          if (!confirm('Tem a certeza que pretende eliminar esta vítima?')) return;
          btn.disabled = true;
          try {
            const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_victims?id=eq.${victimId}`, { method: 'DELETE' });
            if (!response.ok) {
              console.error('Erro ao apagar vítima:', await response.text());
              showPopup('popup-danger', 'Erro ao apagar a vítima.');
              btn.disabled = false;
              return;
            }
            cb360ResourcesVictims = cb360ResourcesVictims.filter(v => String(v.id) !== victimId);
            showPopup('popup-success', 'Vítima eliminada com sucesso.');
            renderCb360VictimsTable();
          } catch (err) {
            console.error('Erro crítico ao eliminar vítima:', err);
            showPopup('popup-danger', 'Erro de rede ao eliminar a vítima.');
            btn.disabled = false;
          }
        });
      });
      updateCb360VictimsSummary();
    }
    // UPDATE: updateCb360VictimsSummary()
    function updateCb360VictimsSummary() {
      CB360_VICTIM_CATEGORIES.forEach(cat => {
        CB360_VICTIM_SEVERITIES.forEach(sev => {
          const el = document.getElementById(`goc-vict-sum-${cat}-${sev}`);
          if (el) {
            const count = cb360ResourcesVictims.filter(v => v.category === cat && v.severity === sev).length;
            el.value = count ? count : '';
          }
        });
      });
      const withoutTraumaEl = document.getElementById('goc-vict-sum-sem-trauma');
      if (withoutTraumaEl) {
        const withoutTraumaCount = cb360ResourcesVictims.filter(v => v.no_trauma).length;
        withoutTraumaEl.value = withoutTraumaCount ? withoutTraumaCount : '';
      }
      const badgeVictims = document.getElementById('goc-tab-count-victims');
      const summaryVictims = document.getElementById('goc-count-victims');
      if (badgeVictims) badgeVictims.textContent = cb360ResourcesVictims.length ? `(${cb360ResourcesVictims.length})` : '';
      if (summaryVictims) summaryVictims.textContent = cb360ResourcesVictims.length;
    }
    // FETCH: fetchCb360Victims()
    async function fetchCb360Victims(internal_number) {
      try {
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const url = `${SUPABASE_URL}/rest/v1/cb360_victims?internal_number=eq.${internal_number}&corp_oper_nr=eq.${currentCorpOperNr}&order=id.asc`;
        const response = await supaFetch(url, { cache: 'no-store' });
        if (!response.ok) {
          console.error('Erro ao obter vítimas:', await response.text());
          return [];
        }
        return await response.json();
      } catch (err) {
        console.error('Erro fetchCb360Victims:', err);
        return [];
      }
    }
    // FETCH: fetchCb360Countries()
    async function fetchCb360Countries() {
      if (cb360CountriesCache) return cb360CountriesCache;
      try {
        const url = `${SUPABASE_URL}/rest/v1/countries?select=iso_code,name,display_label&order=name.asc`;
        const response = await supaFetch(url, { cache: 'no-store' });
        if (!response.ok) {
          console.error('Erro ao obter países:', await response.text());
          return [];
        }
        cb360CountriesCache = await response.json();
        return cb360CountriesCache;
      } catch (err) {
        console.error('Erro fetchCb360Countries:', err);
        return [];
      }
    }
    // FETCH: fetchCb360AllVehiclesList() — todas as viaturas ativas do corpo (não apenas as despachadas na ocorrência)
    async function fetchCb360AllVehiclesList() {
      try {
        const url = `${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle,vehicle_registration,is_inop&order=vehicle.asc`;
        const response = await supaFetch(url, { method: 'GET' });
        if (!response.ok) {
          console.error('Erro ao obter viaturas:', response.status);
          return [];
        }
        const data = await response.json();
        return data.filter(v => v.is_inop === false).map(item => ({
          id: item.vehicle,
          label: item.vehicle_registration ? `${item.vehicle} (${item.vehicle_registration})` : item.vehicle
        }));
      } catch (err) {
        console.error('Erro fetchCb360AllVehiclesList:', err);
        return [];
      }
    }
    // OPEN: openCb360VictimModal()
    async function openCb360VictimModal(victim = null) {
      const page = document.getElementById('page-cb360-redund');
      if (!page || document.getElementById('goc-victim-modal-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'goc-victim-modal-overlay';
      overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; align-items:center; justify-content:center;';
      const inputStyle = 'width:100%; height:25px; padding:4px 8px; border:1px solid #5bc0de; border-radius:4px; font-size:12px; box-sizing:border-box;';
      const labelStyle = 'font-size:12px; font-weight:600; color:#333; flex-shrink:0;';
      const field = (label, inputHtml, labelWidth) => `
        <div style="display:flex; align-items:center; gap:8px;">
          <label style="${labelStyle} width:${labelWidth || '90px'};">${label}</label>
          <div style="flex:1;">${inputHtml}</div>
        </div>
      `;
      const searchCombo = (mainId, labelWidth) => `
        <div style="position:relative; flex:1;">
          <input type="text" id="${mainId}-input" placeholder="Pesquisar..." autocomplete="off" class="goc-input goc-input-full" readonly style="${inputStyle}; cursor:pointer; padding-right:24px;"><i id="${mainId}-chevron" class="fa fa-chevron-down" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:10px; color:#000; pointer-events:none; transition:transform 0.15s;"></i>
          <div id="${mainId}-dropdown" style="display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; z-index:60; background:#fff; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; max-height:220px; box-shadow:0 4px 8px rgba(0,0,0,0.12);">
            <input type="text" id="${mainId}-search" placeholder="Pesquisar..." autocomplete="off" style="margin:6px; padding:6px 8px; border:1px solid #2b6ecb; border-radius:4px; font-size:12.5px; outline:none;">
            <div id="${mainId}-list" style="overflow-y:auto; max-height:160px;"></div>
          </div>
        </div>
      `;
      const incidentClass = cb360SelectedRating ? `${cb360SelectedRating.id} - ${cb360SelectedRating.descr}` : (cb360CurrentIncident?.classification || '');
      const now = new Date();
      const nowLabel = `${toLocalISODate(now).split('-').reverse().join('-')} ${now.toTimeString().slice(0, 5)}`;
      const LEFT_LABEL_W = '105px';
      const RIGHT_LABEL_W = '80px';
      overlay.innerHTML = `
        <style>
          #goc-victim-body input:focus, #goc-victim-body select:focus, #goc-victim-body textarea:focus, #gv-observations:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
          .gv-triage-opt:hover {filter: brightness(1.12);}
        </style>
        <div id="goc-victim-window" style="background:#fff; width:900px; max-height:90vh; overflow-y:auto; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.25);">
          <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px; border-radius:8px 8px 0 0;">
            <div style="font-weight:600; font-size:14px;">${victim ? '<i class="fa-solid fa-pencil"></i> Editar Reserva Individual de Doente/Ferido' : '<i class="fa-solid fa-plus"></i> Reserva Individual de Doente/Ferido'}</div>
            <button id="goc-victim-btn-x" style="background:transparent; border:none; color:#fff; cursor:pointer;">✕</button>
          </div>
          <div style="padding:12px 20px; border-bottom:1px solid #eee;">
            <div style="display:flex; gap:20px; font-size:12.5px; font-weight:600; color:#555;">
              <div>ID: <span style="color:#2b6ecb;">${cb360CurrentIncident?.internal_number ?? document.getElementById('goc-internal-nr')?.value ?? ''}</span></div>
              <div>Data: <span style="color:#2b6ecb;">${nowLabel}</span></div>
              <div>Serviço: <span style="color:#2b6ecb;">${incidentClass}</span></div>
            </div>
          </div>
          <div style="padding:12px 20px 0 20px; font-weight:600; color:#2b6ecb; font-size:13px;">Inserir Reserva Individual:</div>
          <div id="goc-victim-body" style="padding:16px 20px 20px 20px; display:flex; gap:24px; align-items:flex-start;">
            <div style="flex:1.05; display:flex; flex-direction:column; gap:5px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">Doente</label>
                <input type="text" id="gv-patient-name" style="${inputStyle}; flex:1;">
                <button type="button" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; flex-shrink:0;"><i class="fa fa-search"></i></button>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">Idade</label>
                <input type="text" id="gv-age" style="${inputStyle}; width:60px; text-align:center; flex:none;">
                <select id="gv-age-unit" style="${inputStyle}; width:70px; flex:none;">
                  <option value=""></option><option value="anos">anos</option>
                  <option value="meses">meses</option><option value="dias">dias</option>
                </select>
                <label style="${labelStyle} white-space:nowrap; margin-left:6px;">Sexo</label>
                <select id="gv-sex" style="${inputStyle}; flex:1;">
                  <option value=""></option><option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option><option value="Indefinido">Indefinido</option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">Telefone</label>
                <input type="text" id="gv-phone" style="${inputStyle}; flex:1;">
                <label style="${labelStyle} white-space:nowrap; margin-left:6px;">Telemóvel</label>
                <input type="text" id="gv-mobile" style="${inputStyle}; flex:1;">
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">Gravidade</label>
                <select id="gv-severity" style="${inputStyle}; flex:1;">
                  <option value=""></option>
                  ${CB360_VICTIM_SEVERITIES.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <label style="${labelStyle} white-space:nowrap; margin-left:6px;">Tipo</label>
                <select id="gv-category" style="${inputStyle}; flex:1;">
                  <option value=""></option>
                  ${CB360_VICTIM_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">Cor da Triagem</label>
                <div id="gv-triage-color-wrap" style="position:relative; flex:1;">
                  <input type="hidden" id="gv-triage-color" value="">
                  <div id="gv-triage-color-display" tabindex="0"style="${inputStyle}; cursor:pointer; display:flex; align-items:center; justify-content:space-between; font-weight:600; background:#fff; color:#333; box-sizing:border-box;"><span id="gv-triage-color-label">&nbsp;</span><i class="fa fa-chevron-down" style="font-size:10px;"></i></div>
                  <div id="gv-triage-color-list" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:50; border:1px solid #ccc; border-radius:4px; box-shadow:0 4px 10px rgba(0,0,0,0.12); overflow:hidden; margin-top:2px;">
                    <div class="gv-triage-opt" data-value="" data-color="#fff" data-text="#333" style="padding:6px 10px; cursor:pointer; background:#fff; color:#333;">&nbsp;</div>
                    <div class="gv-triage-opt" data-value="Azul" data-color="#4A90D9" data-text="#fff" style="padding:6px 10px; cursor:pointer; background:#4A90D9; color:#fff;">● Azul</div>
                    <div class="gv-triage-opt" data-value="Verde" data-color="#5CB85C" data-text="#fff" style="padding:6px 10px; cursor:pointer; background:#5CB85C; color:#fff;">● Verde</div>
                    <div class="gv-triage-opt" data-value="Amarelo" data-color="#E8C547" data-text="#fff" style="padding:6px 10px; cursor:pointer; background:#E8C547; color:#fff;">● Amarelo</div>
                    <div class="gv-triage-opt" data-value="Laranja" data-color="#F0913A" data-text="#fff" style="padding:6px 10px; cursor:pointer; background:#F0913A; color:#fff;">● Laranja</div>
                    <div class="gv-triage-opt" data-value="Vermelho" data-color="#D9534F" data-text="#fff" style="padding:6px 10px; cursor:pointer; background:#D9534F; color:#fff;">● Vermelho</div>
                  </div>
                </div>
                <label style="${labelStyle} white-space:nowrap; margin-left:6px; display:flex; align-items:center; gap:4px;"><input type="checkbox" id="gv-no-trauma" style="width:16px; height:16px; cursor:pointer !important;">Sem Trauma</label>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">Nº Beneficiário</label>
                <input type="text" id="gv-beneficiary-number" style="${inputStyle}; flex:1;">
                <label style="${labelStyle} white-space:nowrap; margin-left:6px;">Nº Utente</label>
                <input type="text" id="gv-user-number" style="${inputStyle}; flex:1;">
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">País</label>
                <div id="gv-country-wrap" style="position:relative; flex:1;">
                  <input type="text" id="gv-country" autocomplete="off" value="PT - Portugal" style="${inputStyle}">
                  <div id="gv-country-list" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:50; background:#fff; border:1px solid #ccc; border-radius:4px; box-shadow:0 4px 10px rgba(0,0,0,0.12); max-height:220px; overflow-y:auto; margin-top:2px;"></div>
                </div>
                <label style="${labelStyle} white-space:nowrap; margin-left:6px;">Nº Ep. Hosp.</label>
                <input type="text" id="gv-hospital-ep-number" style="${inputStyle}; flex:1;">
              </div>
              <div style="display:flex; align-items:flex-start; gap:6px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W}; margin-top:4px;">Morada</label>
                <textarea id="gv-address" rows="2" style="${inputStyle}; height:auto; padding:6px; resize:vertical; flex:1;"></textarea>
              </div>
              ${field('Localidade', `<input type="text" id="gv-locality" style="${inputStyle}">`, LEFT_LABEL_W)}
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="${labelStyle} width:${LEFT_LABEL_W};">Código Postal</label>
                <input type="text" id="gv-zip1" placeholder="0000" style="${inputStyle}; width:70px; flex:none;">
                <input type="text" id="gv-zip2" placeholder="000" style="${inputStyle}; width:70px; flex:none;">
              </div>
              ${field('Rota', searchCombo('gv-route'), LEFT_LABEL_W)}
            </div>
            <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${RIGHT_LABEL_W};">Nº Pessoas</label>
                <input type="text" id="gv-people-number" style="${inputStyle}; width:50px; text-align:center;">
                <label style="${labelStyle} white-space:nowrap;">Hora Tratamento</label>
                <input type="time" id="gv-treatment-hour" style="${inputStyle}; width:85px; flex:none;">
              </div>
              ${field('Destino', `<input type="text" id="gv-destination" style="${inputStyle}">`, RIGHT_LABEL_W)}
              ${field('Posição', `<select id="gv-position" style="${inputStyle}"><option value=""></option><option value="Sentado">Sentado</option><option value="Deitado">Deitado</option><option value="Cadeira de Rodas">Cadeira de Rodas</option></select>`, RIGHT_LABEL_W)}
              ${field('Viatura Ida', searchCombo('gv-outbound-vehicle'), RIGHT_LABEL_W)}
              ${field('Motorista Ida', searchCombo('gv-outbound-driver'), RIGHT_LABEL_W)}
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} display:flex; align-items:center; gap:4px; white-space:nowrap; width:${RIGHT_LABEL_W};"><input type="checkbox" id="gv-return-flag" style="width:16px; height:16px; cursor:pointer !important;">Retorno</label>
                <label style="${labelStyle} white-space:nowrap;">Hora Retorno</label>
                <input type="time" id="gv-return-hour" style="${inputStyle}; width:85px;">
              </div>
              ${field('Socorrista', searchCombo('gv-rescue-body'), RIGHT_LABEL_W)}
              ${field('Viatura Volta', searchCombo('gv-return-vehicle'), RIGHT_LABEL_W)}
              ${field('Motor. Volta', searchCombo('gv-return-driver'), RIGHT_LABEL_W)}              
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${RIGHT_LABEL_W};">Tipo Tratam.</label>
                <div style="display:flex; flex-direction:column; gap:5px; flex:1;">
                  <select id="gv-treatment-type" style="${inputStyle}"><option value=""></option></select>
                  <input type="text" id="gv-treatment-type-detail" style="${inputStyle}">
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="${labelStyle} width:${RIGHT_LABEL_W};">Terc. Faturar</label>
                <input type="text" id="gv-third-party" style="${inputStyle}; flex:1;">
                <button type="button" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; flex-shrink:0;"><i class="fa fa-search"></i></button>
                <button type="button" id="gv-third-party-clear" style="background:transparent; border:none; color:#d9534f; cursor:pointer; flex-shrink:0;"><i class="fa fa-times"></i></button>
              </div>
            </div>
          </div>
          <div style="padding:0 20px 20px 20px;">
            <label style="font-size:12px; font-weight:600;">Observações</label>
            <textarea id="gv-observations" rows="2" style="${inputStyle}; height:auto; padding:6px; resize:vertical; margin-top:4px;"></textarea>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; padding:15px 20px; border-top:1px solid #eee; background:#fafafa; border-radius:0 0 8px 8px;">
            <button id="goc-victim-btn-save" style="background:#5cb85c; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;">${victim ? '<i class="fa-regular fa-floppy-disk"></i>' : '<i class="fa fa-plus"></i>'}&nbsp;&nbsp;${victim ? 'Guardar' : 'Adicionar'}</button>
            <button id="goc-victim-btn-close" style="background:#f0ad4e; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button>
          </div>
        </div>
      `;
      page.appendChild(overlay);
      const vehicleComboData = cb360ResourcesVehicles.map((v, idx) => ({id: v.vehicle, label: `#${idx + 1} - ${cb360VehicleLabel(v.vehicle)}`}));
      const dispatchedCodes = cb360ResourcesFirefighters.map(f => f.code).filter(Boolean);
      const dispatchedFirefightersDetails = await fetchCb360FirefighterDetails(dispatchedCodes);
      const outboundFirefighterComboData = cb360ResourcesFirefighters.map(f => {
        const info = dispatchedFirefightersDetails[f.code];
        return {id: f.code, label: info ? `${f.code} - ${info.full_name} - ${info.patent_abv}` : f.code};
      });
      const allFirefightersList = await fetchCb360FirefightersList();
      const allVehiclesList = await fetchCb360AllVehiclesList();
      const outboundVehicleCombo = createCb360SearchCombobox({
        mainInputId: 'gv-outbound-vehicle-input', dropdownId: 'gv-outbound-vehicle-dropdown', searchInputId: 'gv-outbound-vehicle-search', listId: 'gv-outbound-vehicle-list', chevronId: 'gv-outbound-vehicle-chevron',
        list: vehicleComboData, selectedValue: victim?.outbound_vehicle ?? null
      });
      const outboundDriverCombo = createCb360SearchCombobox({
        mainInputId: 'gv-outbound-driver-input', dropdownId: 'gv-outbound-driver-dropdown', searchInputId: 'gv-outbound-driver-search', listId: 'gv-outbound-driver-list', chevronId: 'gv-outbound-driver-chevron',
        list: outboundFirefighterComboData, selectedValue: victim?.outbound_driver ?? null
      });
      const returnVehicleCombo = createCb360SearchCombobox({
        mainInputId: 'gv-return-vehicle-input', dropdownId: 'gv-return-vehicle-dropdown', searchInputId: 'gv-return-vehicle-search', listId: 'gv-return-vehicle-list', chevronId: 'gv-return-vehicle-chevron',
        list: allVehiclesList, selectedValue: victim?.return_vehicle ?? null
      });
      const returnDriverCombo = createCb360SearchCombobox({
        mainInputId: 'gv-return-driver-input', dropdownId: 'gv-return-driver-dropdown', searchInputId: 'gv-return-driver-search', listId: 'gv-return-driver-list', chevronId: 'gv-return-driver-chevron',
        list: allFirefightersList, selectedValue: victim?.return_driver ?? null
      });
      const routeCombo = createCb360SearchCombobox({
        mainInputId: 'gv-route-input', dropdownId: 'gv-route-dropdown', searchInputId: 'gv-route-search', listId: 'gv-route-list', chevronId: 'gv-route-chevron',
        list: [], selectedValue: victim?.route ?? null
      });
      const rescueBodyCombo = createCb360SearchCombobox({
        mainInputId: 'gv-rescue-body-input', dropdownId: 'gv-rescue-body-dropdown', searchInputId: 'gv-rescue-body-search', listId: 'gv-rescue-body-list', chevronId: 'gv-rescue-body-chevron',
        list: allFirefightersList, selectedValue: victim?.rescue_body ?? null
      });
      function initTriageColorDropdown() {
        const display = document.getElementById('gv-triage-color-display');
        const list = document.getElementById('gv-triage-color-list');
        const hiddenInput = document.getElementById('gv-triage-color');
        const label = document.getElementById('gv-triage-color-label');
        if (!display || !list || !hiddenInput || !label) return;
        display.addEventListener('click', () => {
          list.style.display = list.style.display === 'none' ? 'block' : 'none';
        });
        list.querySelectorAll('.gv-triage-opt').forEach(opt => {
          opt.addEventListener('click', () => {
            hiddenInput.value = opt.dataset.value;
            label.textContent = opt.textContent;
            display.style.background = opt.dataset.color;
            display.style.color = opt.dataset.text;
            list.style.display = 'none';
          });
        });
        document.addEventListener('click', (e) => {
          if (!e.target.closest('#gv-triage-color-wrap')) list.style.display = 'none';          
        });
      }
      async function initCountrySearch() {
        const input = document.getElementById('gv-country');
        const list = document.getElementById('gv-country-list');
        if (!input || !list) return;
        const countries = await fetchCb360Countries();
        function renderList(filter) {
          const term = (filter || '').toLowerCase();
          const matches = countries.filter(c => c.display_label.toLowerCase().includes(term));
          list.innerHTML = matches.length
            ? matches.map(c => `<div class="gv-country-opt" data-value="${c.display_label}" style="padding:6px 10px; cursor:pointer; font-size:12px;">${c.display_label}</div>`).join('')
            : `<div style="padding:6px 10px; font-size:12px; color:#999;">Sem resultados</div>`;
          list.querySelectorAll('.gv-country-opt').forEach(opt => {
            opt.addEventListener('mouseenter', () => opt.style.background = '#eef5fc');
            opt.addEventListener('mouseleave', () => opt.style.background = 'transparent');
            opt.addEventListener('click', () => {
              input.value = opt.dataset.value;
              list.style.display = 'none';
            });
          });
        }
        input.addEventListener('focus', () => {renderList(''); list.style.display = 'block';});
        input.addEventListener('input', () => {renderList(input.value); list.style.display = 'block';});
        document.addEventListener('click', (e) => {
          if (!e.target.closest('#gv-country-wrap')) list.style.display = 'none';
        });
      }
      initTriageColorDropdown();
      await initCountrySearch();
      if (victim) {
        document.getElementById('gv-patient-name').value = victim.patient_name || '';
        document.getElementById('gv-people-number').value = victim.people_number || '';
        document.getElementById('gv-treatment-hour').value = victim.treatment_hour || '';
        document.getElementById('gv-age').value = victim.age || '';
        document.getElementById('gv-age-unit').value = victim.age_unit || 'anos';
        document.getElementById('gv-destination').value = victim.destination || '';
        document.getElementById('gv-sex').value = victim.sex || '';
        document.getElementById('gv-position').value = victim.position || '';
        document.getElementById('gv-phone').value = victim.phone || '';
        document.getElementById('gv-mobile').value = victim.mobile || '';
        document.getElementById('gv-severity').value = victim.severity || '';
        document.getElementById('gv-category').value = victim.category || '';
        if (victim.triage_color) {
          const match = document.querySelector(`.gv-triage-opt[data-value="${victim.triage_color}"]`);
          if (match) {
            document.getElementById('gv-triage-color').value = match.dataset.value;
            document.getElementById('gv-triage-color-label').textContent = match.textContent;
            document.getElementById('gv-triage-color-display').style.background = match.dataset.color;
            document.getElementById('gv-triage-color-display').style.color = match.dataset.text;
          }
        }
        document.getElementById('gv-return-flag').checked = !!victim.return_flag;
        document.getElementById('gv-return-hour').value = victim.return_hour || '';
        document.getElementById('gv-no-trauma').checked = !!victim.no_trauma;
        document.getElementById('gv-beneficiary-number').value = victim.beneficiary_number || '';
        document.getElementById('gv-user-number').value = victim.user_number || '';
        document.getElementById('gv-country').value = victim.country || 'PT - Portugal';
        document.getElementById('gv-hospital-ep-number').value = victim.hospital_ep_number || '';
        document.getElementById('gv-treatment-type').value = victim.treatment_type || '';
        document.getElementById('gv-treatment-type-detail').value = victim.treatment_type_detail || '';
        document.getElementById('gv-address').value = victim.address || '';
        document.getElementById('gv-locality').value = victim.locality || '';
        document.getElementById('gv-zip1').value = victim.zip_part1 || '';
        document.getElementById('gv-zip2').value = victim.zip_part2 || '';
        document.getElementById('gv-third-party').value = victim.third_party || '';
        document.getElementById('gv-observations').value = victim.observations || '';
      } else if (cb360ResourcesVehicles.length === 1) {
        outboundVehicleCombo.selectByValue(cb360ResourcesVehicles[0].vehicle);
      }
      document.getElementById('gv-third-party-clear').addEventListener('click', () => {
        document.getElementById('gv-third-party').value = '';
      });
      document.getElementById('goc-victim-btn-x').addEventListener('click', closeCb360VictimModal);
      document.getElementById('goc-victim-btn-close').addEventListener('click', closeCb360VictimModal);
      document.getElementById('goc-victim-btn-save').addEventListener('click', () => saveCb360Victim(victim, {
        outboundVehicleCombo, outboundDriverCombo, returnVehicleCombo, returnDriverCombo, routeCombo, rescueBodyCombo
      }));
      overlay.addEventListener('click', (e) => {if (e.target === overlay) closeCb360VictimModal();});
      setTimeout(() => {
        overlay.style.display = 'flex';
      }, 10);
    }
    function createCb360SearchCombobox({ mainInputId, dropdownId, searchInputId, listId, chevronId, list, selectedValue = null }) {
      let data = list || [];
      let selected = selectedValue ? (data.find(i => i.id == selectedValue) || null) : null;
      let activeIndex = -1;
      const mainInput = document.getElementById(mainInputId);
      const dropdown = document.getElementById(dropdownId);
      const searchInput = document.getElementById(searchInputId);
      const listContainer = document.getElementById(listId);
      const chevron = document.getElementById(chevronId);
      if (!mainInput || !dropdown || !searchInput || !listContainer) return null;
      mainInput.value = selected ? selected.label : (selectedValue || '');      
      function setDropdownOpen(isOpen) {
        dropdown.style.display = isOpen ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)';
      }      
      function renderList(filtered) {
        listContainer.innerHTML = '';
        const term = searchInput ? searchInput.value.trim() : '';
        if (!term) {
          const blankLine = document.createElement('div');
          blankLine.innerHTML = '&nbsp;';
          blankLine.style.cssText = 'padding:6px 10px; font-size:11px; cursor:pointer;';
          blankLine.addEventListener('mouseenter', () => {
            activeIndex = -1;
            Array.from(listContainer.children).forEach((el, i) => {
              el.style.background = i === 0 ? '#2b6ecb' : '#fff';
              if (i !== 0) el.style.color = '#333';
            });
          });
          blankLine.addEventListener('click', () => {
            selected = null;
            mainInput.value = '';
            dropdown.style.display = 'none';
            if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
          });
          listContainer.appendChild(blankLine);
        }
        if (!filtered.length) {
          const empty = document.createElement('div');
          empty.textContent = 'Sem resultados.';
          empty.style.cssText = 'padding:8px; color:#999; font-size:11px;';
          listContainer.appendChild(empty);
          return;
        }
        filtered.forEach((item, idx) => {
          const isActive = idx === activeIndex;
          const line = document.createElement('div');
          line.textContent = item.label;
          line.style.padding = '6px 10px';
          line.style.fontSize = '11px';
          line.style.cursor = 'pointer';
          line.style.background = isActive ? '#2b6ecb' : '#fff';
          line.style.color = isActive ? '#fff' : '#333';          
          line.addEventListener('mouseenter', () => {
            activeIndex = idx;
            const hasBlank = !term;
            Array.from(listContainer.children).forEach((el, i) => {
              if (hasBlank && i === 0) {
                el.style.background = '#fff';
              } else {
                const itemIndex = hasBlank ? i - 1 : i;
                const active = itemIndex === idx;
                el.style.background = active ? '#2b6ecb' : '#fff';
                el.style.color = active ? '#fff' : '#333';
              }
            });
          });
          line.addEventListener('click', () => {
            selected = item;
            mainInput.value = item.label;
            dropdown.style.display = 'none';
            if (chevron) chevron.style.transform = 'translateY(-50%) rotate(0deg)';
          });
          listContainer.appendChild(line);
        });
        const offsetIndex = (!term) ? activeIndex + 1 : activeIndex;
        const activeEl = listContainer.children[offsetIndex];
        if (activeEl) activeEl.scrollIntoView({block: 'nearest'});
      }
      function openDropdown() {
        if (mainInput.disabled) return;
        searchInput.value = '';
        activeIndex = -1;
        renderList(data);
        setDropdownOpen(true);
        setTimeout(() => searchInput.focus(), 0);
      }
      mainInput.addEventListener('click', openDropdown);
      mainInput.addEventListener('focus', openDropdown);
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtered = data.filter(item => item.label.toLowerCase().includes(term));
        activeIndex = (term.length > 0 && filtered.length > 0) ? 0 : -1;
        renderList(filtered);
      });
      searchInput.addEventListener('keydown', (e) => {
        const term = searchInput.value.toLowerCase();
        const filtered = data.filter(item => item.label.toLowerCase().includes(term));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!filtered.length) return;
          activeIndex = (activeIndex + 1) % filtered.length;
          renderList(filtered);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (!filtered.length) return;
          activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
          renderList(filtered);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = filtered[activeIndex];
          if (chosen) {
            selected = chosen;
            mainInput.value = chosen.label;
            setDropdownOpen(false);
          }
        } else if (e.key === 'Escape') {
          setDropdownOpen(false);
        }
      });
      document.addEventListener('click', (e) => {
        if (!mainInput.contains(e.target) && !dropdown.contains(e.target)) {
          setDropdownOpen(false);
        }
      });
      return {
        getSelected: () => selected,
        setData: (newList) => { data = newList || []; },
        selectByValue: (value) => {
          const found = data.find(i => i.id == value);
          if (found) {
            selected = found;
            mainInput.value = found.label;
          }
        }
      };
    }
    // CLOSE: closeCb360VictimModal()
    function closeCb360VictimModal() {
      const overlay = document.getElementById('goc-victim-modal-overlay');
      if (overlay) overlay.remove();
    }
    // SAVE: saveCb360Victim()
    async function saveCb360Victim(existingVictim, combos = {}) {
      const { outboundVehicleCombo, outboundDriverCombo, returnVehicleCombo, returnDriverCombo, routeCombo, rescueBodyCombo } = combos;
      const getVal = (id) => document.getElementById(id)?.value || null;
      const internalNumber = cb360CurrentIncident?.internal_number ?? document.getElementById('goc-internal-nr')?.value;
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const outboundVehicle = outboundVehicleCombo?.getSelected()?.id ?? null;
      const outboundDriver = outboundDriverCombo?.getSelected()?.id ?? null;
      const returnVehicle = returnVehicleCombo?.getSelected()?.id ?? null;
      const returnDriver = returnDriverCombo?.getSelected()?.id ?? null;
      const route = routeCombo?.getSelected()?.id ?? null;
      const rescueBody = rescueBodyCombo?.getSelected()?.id ?? null;
      const payload = {
        corp_oper_nr: currentCorpOperNr, internal_number: internalNumber, vehicle: outboundVehicle, patient_name: getVal('gv-patient-name'), people_number: getVal('gv-people-number'),
        treatment_hour: getVal('gv-treatment-hour'), age: getVal('gv-age'), age_unit: getVal('gv-age-unit'), sex: getVal('gv-sex'), destination: getVal('gv-destination'), position: getVal('gv-position'),
        phone: getVal('gv-phone'), mobile: getVal('gv-mobile'), severity: getVal('gv-severity'), outbound_vehicle: outboundVehicle, category: getVal('gv-category'), outbound_driver: outboundDriver,
        triage_color: getVal('gv-triage-color'), return_flag: document.getElementById('gv-return-flag')?.checked || false, return_hour: getVal('gv-return-hour'), no_trauma: document.getElementById('gv-no-trauma')?.checked || false,
        rescue_body: rescueBody, beneficiary_number: getVal('gv-beneficiary-number'), return_vehicle: returnVehicle, user_number: getVal('gv-user-number'), return_driver: returnDriver,
        country: getVal('gv-country'), hospital_ep_number: getVal('gv-hospital-ep-number'), treatment_type: getVal('gv-treatment-type'), treatment_type_detail: getVal('gv-treatment-type-detail'),
        address: getVal('gv-address'), locality: getVal('gv-locality'), zip_part1: getVal('gv-zip1'), zip_part2: getVal('gv-zip2'), route: route, third_party: getVal('gv-third-party'), observations: getVal('gv-observations')
      };
      if (!payload.patient_name) {
        showPopup('popup-danger', 'Indique o nome do doente/ferido.');
        return;
      }
      try {
        let response;
        if (existingVictim) {
          response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_victims?id=eq.${existingVictim.id}`, { method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(payload) });
        } else {
          response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_victims`, { method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(payload) });
        }
        if (!response.ok) {
          console.error('Erro ao gravar vítima:', await response.text());
          showPopup('popup-danger', 'Erro ao gravar a vítima.');
          return;
        }
        cb360ResourcesVictims = await fetchCb360Victims(internalNumber);
        renderCb360VictimsTable();
        showPopup('popup-success', existingVictim ? 'Vítima atualizada com sucesso!' : 'Vítima adicionada com sucesso!');
        closeCb360VictimModal();
      } catch (err) {
        console.error('Erro crítico ao gravar vítima:', err);
        showPopup('popup-danger', 'Erro de rede ao gravar a vítima.');
      }
    }
    // ==============================================================================
    // == 8. COMUNICAÇÕES (Canais de Comunicação / Central de Chamadas)          ==
    // ==============================================================================
    // RENDER (shell da tab): renderCb360CommunicationsTab()
    function renderCb360CommunicationsTab() {
      const container = document.getElementById('goc-tab-content-communications');
      if (!container) return;
      container.innerHTML = `
        <style>
          #goc-tab-content-communications input:focus, #goc-tab-content-communications select:focus, #goc-tab-content-communications textarea:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
        </style>
        <div style="display:flex; gap:6px; margin-bottom:14px;">
          <button id="goc-comm-tab-channels" class="goc-comm-subtab" data-subtab="channels" style="padding:8px 16px; border:1px solid #ccc; border-radius:5px; background:#2b6ecb; color:#fff; font-weight:600; font-size:12.5px; cursor:pointer;"><i class="fa fa-podcast"></i> Canais de Comunicação</button>
          <button id="goc-comm-tab-calls" class="goc-comm-subtab" data-subtab="calls" style="padding:8px 16px; border:1px solid #ccc; border-radius:5px; background:#fff; color:#333; font-weight:600; font-size:12.5px; cursor:pointer;"><i class="fa fa-phone"></i> Central de Chamadas</button>
        </div>
        <div id="goc-comm-subtab-channels" class="goc-comm-subtab-content">
          <div style="margin-bottom:16px;">
            <div style="font-weight:600; font-size:13px; color:#2b6ecb; margin-bottom:8px;">Canais de Comunicação:</div>
            <div style="border:1px solid #ddd; border-radius:4px; padding:10px 14px; display:flex; gap:24px;">
              <div class="goc-row">
                <label class="goc-label" style="width:60px;">ROB</label>
                <input type="text" id="goc-comm-rob" class="goc-input" style="width:150px; font-weight:600; text-align:center;">
              </div>
              <div class="goc-row">
                <label class="goc-label" style="width:60px;">SIRESP</label>
                <input type="text" id="goc-comm-siresp" class="goc-input" style="width:150px; font-weight:600; text-align:center;">
              </div>
              <div class="goc-row">
                <label class="goc-label" style="width:60px;">MANOBRA</label>
                <input type="text" id="goc-comm-maneuver" class="goc-input" style="width:150px; font-weight:600; text-align:center;">
              </div>
            </div>
          </div>
          <div style="display:flex; gap:20px; flex-wrap:wrap;">
            <div style="flex:1; min-width:280px;">
              <div style="font-weight:600; font-size:13px; color:#2b6ecb; margin-bottom:6px;">Rádios das Viaturas:</div>
              <div id="goc-comm-vehicles-wrap" style="overflow-x:auto; overflow-y:auto; max-height:280px; border:1px solid #eee; border-radius:4px;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px;">
                  <thead>
                    <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:35%; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Viaturas</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">ISSI SIRESP</th>
                    </tr>
                  </thead>
                  <tbody id="goc-comm-vehicles-table-body"></tbody>
                </table>
              </div>
            </div>
            <div style="flex:1; min-width:320px;">
              <div style="font-weight:600; font-size:13px; color:#2b6ecb; margin-bottom:6px;">Rádios dos Bombeiros:</div>
              <div id="goc-comm-firefighters-wrap" style="overflow-x:auto; overflow-y:auto; max-height:280px; border:1px solid #eee; border-radius:4px;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px;">
                  <thead>
                    <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Bombeiros</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Rádios Existentes</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Rádio Utilizado</th>
                    </tr>
                  </thead>
                  <tbody id="goc-comm-firefighters-table-body"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div id="goc-comm-subtab-calls" class="goc-comm-subtab-content" style="display:none;">
          <div style="font-weight:600; font-size:13px; color:#2b6ecb; margin-bottom:8px;">Central de Chamadas: <i class="fa-solid fa-circle-info" style="color:#5bc0de; font-size:12px;"></i></div>
          <textarea id="goc-comm-calls-text" class="goc-input" style="width:100%; min-height:340px; height:auto; padding:10px; resize:vertical;"></textarea>
        </div>
      `;
      renderCb360CommRadiosTable();
      document.querySelectorAll('.goc-comm-subtab').forEach(btn => {
        btn.addEventListener('click', () => switchCb360CommSubTab(btn.dataset.subtab));
      });
      const robInput = document.getElementById('goc-comm-rob');
      const sirespInput = document.getElementById('goc-comm-siresp');
      if (robInput) robInput.value = cb360CurrentIncident?.comm_rob || '';
      if (sirespInput) sirespInput.value = cb360CurrentIncident?.comm_siresp || '';
      robInput?.addEventListener('change', () => saveCb360CommField('comm_rob', robInput.value));
      sirespInput?.addEventListener('change', () => saveCb360CommField('comm_siresp', sirespInput.value));
      const callsTextarea = document.getElementById('goc-comm-calls-text');
      if (callsTextarea) callsTextarea.value = cb360CurrentIncident?.comm_calls_text || '';
      callsTextarea?.addEventListener('change', () => saveCb360CommField('comm_calls_text', callsTextarea.value));
    }
    // SWITCH: switchCb360CommSubTab()
    function switchCb360CommSubTab(subtab) {
      document.querySelectorAll('.goc-comm-subtab').forEach(btn => {
        const ativo = btn.dataset.subtab === subtab;
        btn.style.background = ativo ? '#2b6ecb' : '#fff';
        btn.style.color = ativo ? '#fff' : '#333';
      });
      document.getElementById('goc-comm-subtab-channels').style.display = subtab === 'channels' ? 'block' : 'none';
      document.getElementById('goc-comm-subtab-calls').style.display = subtab === 'calls' ? 'block' : 'none';
    }    
    // RENDER: renderCb360CommRadiosTable — popula as duas tabelas a partir dos meios já despachados
    function renderCb360CommRadiosTable() {
      const vehiclesBody = document.getElementById('goc-comm-vehicles-table-body');
      if (vehiclesBody) {
        vehiclesBody.innerHTML = cb360ResourcesVehicles.length ? cb360ResourcesVehicles.map(v => `
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:6px 8px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; font-weight:600;">${v.vehicle || ''}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
              <input type="text" class="goc-input goc-comm-vehicle-issi" data-dispatch-id="${v.id || ''}" value="${v.radio_issi_siresp || ''}" style="width:150px; font-weight:600; text-align:center;">
            </td>
          </tr>`).join('') : `<tr><td colspan="2" style="padding:14px; text-align:center; color:#999;">Nenhuma viatura associada.</td></tr>
        `;
        document.querySelectorAll('.goc-comm-vehicle-issi').forEach(input => {
          input.addEventListener('change', () => {
            saveCb360VehicleIssi(input.dataset.dispatchId, input.value);
          });
        });
      }
      const firefightersBody = document.getElementById('goc-comm-firefighters-table-body');
      if (firefightersBody) {
        firefightersBody.innerHTML = cb360ResourcesFirefighters.length ? cb360ResourcesFirefighters.map(b => `
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:6px 8px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; font-weight:600;">${b.code || ''}</td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
              <select class="goc-input" style="width:150px;"><option value=""></option></select>
            </td>
            <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
              <input type="text" class="goc-input goc-comm-firefighter-radio" data-crew-id="${b.id || ''}" value="${b.radio_assigned || ''}" style="width:150px; font-weight:600; text-align:center;">
            </td>
          </tr>`).join('') : `<tr><td colspan="3" style="padding:14px; text-align:center; color:#999;">Nenhum bombeiro associado.</td></tr>
        `;
        document.querySelectorAll('.goc-comm-firefighter-radio').forEach(input => {
          input.addEventListener('change', () => {
            saveCb360FirefighterRadio(input.dataset.crewId, input.value);
          });
        });
      }
    }
    // SAVE: saveCb360CommField() — grava ROB/SIRESP da ocorrência (auto-save no change)
    async function saveCb360CommField(field, value) {
      const internalNumber = cb360CurrentIncident?.internal_number;
      if (!internalNumber) return;
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      try {
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_incidents?internal_number=eq.${internalNumber}&corp_oper_nr=eq.${currentCorpOperNr}`, { method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({[field]: value || null}) });
        if (!response.ok) {
          console.error('Erro ao gravar campo de comunicações:', await response.text());
          showPopup('popup-danger', 'Erro ao gravar.');
          return;
        }
        if (cb360CurrentIncident) cb360CurrentIncident[field] = value || null;
      } catch (err) {
        console.error('Erro saveCb360CommField:', err);
        showPopup('popup-danger', 'Erro de rede ao gravar.');
      }
    }
    // SAVE: saveCb360VehicleIssi — grava o ISSI SIRESP na tabela de veículos despachados
    async function saveCb360VehicleIssi(dispatchId, value) {
      if (!dispatchId) return;
      try {
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?id=eq.${dispatchId}`, { method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ radio_issi_siresp: value || null }) });
        if (!response.ok) {
          console.error('Erro ao gravar rádio da viatura:', await response.text());
          showPopup('popup-danger', 'Erro ao gravar rádio da viatura.');
          return;
        }
        const found = cb360ResourcesVehicles.find(v => String(v.id) === String(dispatchId));
        if (found) found.radio_issi_siresp = value || null;
      } catch (err) {
        console.error('Erro saveCb360VehicleIssi:', err);
        showPopup('popup-danger', 'Erro de rede ao gravar.');
      }
    }
    // SAVE: saveCb360FirefighterRadio — grava o rádio na tabela de tripulação despachada
    async function saveCb360FirefighterRadio(crewId, value) {
      if (!crewId) return;
      try {
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_crew?id=eq.${crewId}`, { method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ radio_assigned: value || null }) });
        if (!response.ok) {
          console.error('Erro ao gravar rádio do bombeiro:', await response.text());
          showPopup('popup-danger', 'Erro ao gravar rádio do bombeiro.');
          return;
        }
        const found = cb360ResourcesFirefighters.find(b => String(b.id) === String(crewId));
        if (found) found.radio_assigned = value || null;
      } catch (err) {
        console.error('Erro saveCb360FirefighterRadio:', err);
        showPopup('popup-danger', 'Erro de rede ao gravar.');
      }
    }
    // Rádios Existentes — FETCH: fetchCb360RadiosList()
    async function fetchCb360RadiosList() {
      // TODO: ligar à tabela certa quando definida (ex: radios?select=id,radio_code&corp_oper_nr=eq.X)
      return [];
    }
    // ==============================================================================
    // == 9. RESUMO OCORRÊNCIA (Resumo / Meios Envolvidos / Meios Aéreos /       ==
    // ==     Efeitos do Sinistro / Comparências)                                ==
    // ==============================================================================
    // RENDER (shell da tab): renderCb360SummaryTab()
    function renderCb360SummaryTab() {
      const container = document.getElementById('goc-tab-content-summary');
      if (!container) return;
      const inputStyle = 'width:100%; height:24px; padding:4px 8px; border:1px solid #5bc0de; border-radius:4px; font-size:12px; box-sizing:border-box;';
      container.innerHTML = `
        <style>
          #goc-tab-content-summary input:focus, #goc-tab-content-summary select:focus, #goc-tab-content-summary textarea:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
          .goc-summary-arrival-save { transition: color 0.15s; }
          .goc-summary-arrival-save:hover i { color: #2b6ecb; }
        </style>
        <div style="display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap;">
          <button id="goc-summary-tab-resumo" class="goc-summary-subtab" data-subtab="resumo" style="padding:8px 16px; border:1px solid #ccc; border-radius:5px; background:#2b6ecb; color:#fff; font-weight:600; font-size:12.5px; cursor:pointer;"><i class="fa fa-list"></i> Resumo</button>
          <button id="goc-summary-tab-meios-envolvidos" class="goc-summary-subtab" data-subtab="meios-envolvidos" style="padding:8px 16px; border:1px solid #ccc; border-radius:5px; background:#fff; color:#333; font-weight:600; font-size:12.5px; cursor:pointer;"><i class="fa fa-truck"></i> Meios Envolvidos</button>
          <button id="goc-summary-tab-meios-aereos" class="goc-summary-subtab" data-subtab="meios-aereos" style="padding:8px 16px; border:1px solid #ccc; border-radius:5px; background:#fff; color:#333; font-weight:600; font-size:12.5px; cursor:pointer;"><i class="fa fa-plane"></i> Meios Aéreos</button>
          <button id="goc-summary-tab-efeitos-sinistro" class="goc-summary-subtab" data-subtab="efeitos-sinistro" style="padding:8px 16px; border:1px solid #ccc; border-radius:5px; background:#fff; color:#333; font-weight:600; font-size:12.5px; cursor:pointer;"><i class="fa fa-fire"></i> Efeitos do Sinistro</button>
          <button id="goc-summary-tab-comparencias" class="goc-summary-subtab" data-subtab="comparencias" style="padding:8px 16px; border:1px solid #ccc; border-radius:5px; background:#fff; color:#333; font-weight:600; font-size:12.5px; cursor:pointer;"><i class="fa fa-user"></i> Comparências</button>
        </div>
        <div id="goc-summary-subtab-resumo" class="goc-summary-subtab-content" style="display:flex; flex-direction:column; gap:10px;">
          <div id="goc-summary-resumo-line" style="font-weight:600; color:#8b0000; font-size:16px;"></div>
          <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start;">
            <div style="flex:1; min-width:380px;">
              <div id="goc-summary-vehicles-wrap" style="overflow-x:auto; overflow-y:auto; max-height:200px; border:1px solid #eee; border-radius:4px; margin-bottom:16px;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px;">
                  <thead>
                    <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                      <th style="width:130px; position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Viaturas</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Tempo de Utilização</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Tempo no Local</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Kms Percorridos</th>
                    </tr>
                  </thead>
                  <tbody id="goc-summary-vehicles-table-body"></tbody>
                </table>
              </div>
              <div id="goc-summary-firefighters-wrap" style="overflow-x:auto; overflow-y:auto; max-height:200px; border:1px solid #eee; border-radius:4px;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px;">
                  <thead>
                    <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Bombeiro</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Tempo do Bombeiro fora da corporação</th>
                    </tr>
                  </thead>
                  <tbody id="goc-summary-firefighters-table-body"></tbody>
                </table>
              </div>
            </div>
            <div style="flex:1.4; min-width:460px;">
              <div id="goc-summary-arrival-wrap" style="overflow-x:auto; overflow-y:auto; max-height:360px; border:1px solid #eee; border-bottom:none; border-radius:4px 4px 0 0;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px;">
                  <thead>
                    <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:130px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Viatura</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Chefe Viatura</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Chegada ao T.O.</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Saída ao T.O.</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Chegada ao C.B.</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:70px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Horas</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:70px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Minutos</th>
                      <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; width:40px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;"></th>
                    </tr>
                  </thead>
                  <tbody id="goc-summary-arrival-table-body"></tbody>
                </table>
              </div>
              <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px; border:1px solid #eee; border-radius:0 0 4px 4px; padding:8px 12px; background:#fafafa;">
                <span style="font-weight:600; font-size:12px;">Total:</span>
                <input type="text" id="goc-summary-arrival-total" readonly style="width:200px; height:24px; text-align:center; border:1px solid #ccc; border-radius:4px; background:#f5f5f5; font-size:12px;">
              </div>
            </div>
          </div>
        </div>
        <div id="goc-summary-subtab-meios-envolvidos" class="goc-summary-subtab-content" style="display:none;">
          <div style="display: flex; gap: 5px; flex-wrap: wrap; align-items: flex-start;">
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; background: #fff;">
              <div style="font-weight: 600; color: #2b6ecb; font-size: 13px; margin-bottom: 10px;">Meios Internos</div>
              <div style="display: grid; grid-template-columns: repeat(3, 100px); gap: 14px;">
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Homens</label><input type="text" id="goc-summary-int-men" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Veículos</label><input type="text" id="goc-summary-int-vehicles" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">C. Bombeiros</label><input type="text" id="goc-summary-int-corps" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
              </div>
            </div>
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; background: #fff;">
              <div style="font-weight: 600; color: #2b6ecb; font-size: 13px; margin-bottom: 10px;">Meios Externos</div>
              <div style="display: grid; grid-template-columns: repeat(3, 100px); gap: 14px;">
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Homens</label><input type="text" id="goc-summary-ext-men" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Veículos</label><input type="text" id="goc-summary-ext-vehicles" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Entidades</label><input type="text" id="goc-summary-ext-entities" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
              </div>
            </div>
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; background: #fff;">
              <div style="font-weight: 600; color: #2b6ecb; font-size: 13px; margin-bottom: 10px;">Total de Meios</div>
              <div style="display: grid; grid-template-columns: repeat(3, 100px); gap: 14px;">
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Homens</label><input type="text" id="goc-summary-total-men" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Veículos</label><input type="text" id="goc-summary-total-vehicles" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
                <div><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Total/C.B.</label><input type="text" id="goc-summary-total-corps" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
              </div>
            </div>
          </div>
        </div>
        <div id="goc-summary-subtab-meios-aereos" class="goc-summary-subtab-content" style="display:none;">
          <div style="border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; display: flex; gap: 5px; flex-wrap: nowrap; overflow-x: auto;">
            <div style="width: 140px; flex-shrink: 0;"><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Aviões Bombard. Ligeiros</label><input type="text" id="goc-summary-air-light-tankers" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
            <div style="width: 140px; flex-shrink: 0;"><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Aviões Bombard. Pesados</label><input type="text" id="goc-summary-air-heavy-tankers" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
            <div style="width: 140px; flex-shrink: 0;"><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Helis Bombard. Médios</label><input type="text" id="goc-summary-heli-medium" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
            <div style="width: 140px; flex-shrink: 0;"><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Helis Bombard. Pesados</label><input type="text" id="goc-summary-heli-heavy" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
            <div style="width: 140px; flex-shrink: 0;"><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Helis Coordenação</label><input type="text" id="goc-summary-heli-coord" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
            <div style="width: 140px; flex-shrink: 0;"><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Helis Ligeiros</label><input type="text" id="goc-summary-heli-light" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
            <div style="width: 140px; flex-shrink: 0;"><label style="font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 4px;">Total Meios Aéreos</label><input type="text" id="goc-summary-total-air" readonly style="${inputStyle} text-align: center; background: #f5f5f5;"></div>
          </div>
        </div>
        <div id="goc-summary-subtab-efeitos-sinistro" class="goc-summary-subtab-content" style="display:none;">
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; background: #fff;">
              <div style="font-weight: 600; color: #2b6ecb; font-size: 13px; margin-bottom: 8px;">Danos Causados</div>
              <textarea id="goc-summary-damages" rows="4" style="width: 100%; min-height: 100px; border: 1px solid #ccc; border-radius: 4px; padding: 8px; font-size: 12px; resize: vertical;"></textarea>
            </div>
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; background: #fff;">
              <div style="font-weight: 600; color: #2b6ecb; font-size: 13px; margin-bottom: 8px;">Incêndios Rurais</div>
              <div id="goc-summary-rural-fires" style="display: flex; flex-direction: column; gap: 6px;"></div>
            </div>
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; background: #fff;">
              <div style="font-weight: 600; color: #2b6ecb; font-size: 13px; margin-bottom: 8px;">Desalojados</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-size: 12px; font-weight: 600;">Qt.</label>
                <input type="text" id="goc-summary-displaced-qty" style="${inputStyle} width: 100px; text-align: center;">
                <label style="font-size: 12px; font-weight: 600;">Desc.</label>
                <input type="text" id="goc-summary-displaced-desc" style="${inputStyle} flex: 1;">
              </div>
            </div>
          </div>
        </div>
        </div>
        <div id="goc-summary-subtab-comparencias" class="goc-summary-subtab-content" style="display:none;">
          <div id="goc-summary-attendance-wrap" style="overflow-x:auto; overflow-y:auto; max-height:400px; border:1px solid #eee; border-radius:4px;">
            <table style="width:100%; border-collapse:separate; border-spacing:0; font-size:12px;">
              <thead>
                <tr style="background:linear-gradient(#f4f4f4,#e5e5e5); color:#333; font-weight:600; text-align:center;">
                  <th style="width:100px; position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-left:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Núm. Interno</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Nome</th>
                  <th style="width:250px; position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Categoria</th>
                  <th style="position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Evento</th>
                  <th style="width:150px; position:sticky; top:0; z-index:2; background:#dcdcdc; padding:6px 8px; border-top:1px solid #c4c4c4; border-right:1px solid #c4c4c4; border-bottom:1px solid #c4c4c4;">Data</th>
                </tr>
              </thead>
              <tbody id="goc-summary-attendance-table-body">
                <tr><td colspan="5" style="padding:14px; text-align:center; color:#999;">Sem registos.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      // Incêndios Rurais: 5 linhas (nome/local + ha), tal como no exemplo
      const ruralFiresContainer = document.getElementById('goc-summary-rural-fires');
      for (let i = 0; i < 5; i++) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:center; gap:8px;';
        row.innerHTML = `
          <input type="text" class="goc-summary-rural-fire-name" style="${inputStyle} flex:1;"><input type="text" class="goc-summary-rural-fire-area" style="${inputStyle} width:100px; text-align:center;">
          <span style="font-size:12px;">ha</span>`;
        ruralFiresContainer.appendChild(row);
      }
      renderCb360SummaryResumoTables();
      renderCb360SummaryArrivalTable();
      renderCb360SummaryMeiosEnvolvidos();
      ['goc-summary-ext-men', 'goc-summary-ext-vehicles', 'goc-summary-ext-entities'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateCb360SummaryTotalMeios);
      });
      document.querySelectorAll('.goc-summary-subtab').forEach(btn => {
        btn.addEventListener('click', () => switchCb360SummarySubTab(btn.dataset.subtab));
      });
    }
    // SWITCH: switchCb360SummarySubTab()
    function switchCb360SummarySubTab(subtab) {
      document.querySelectorAll('.goc-summary-subtab').forEach(btn => {
        const ativo = btn.dataset.subtab === subtab;
        btn.style.background = ativo ? '#2b6ecb' : '#fff';
        btn.style.color = ativo ? '#fff' : '#333';
      });
      ['resumo', 'meios-envolvidos', 'meios-aereos', 'efeitos-sinistro', 'comparencias'].forEach(name => {
        const el = document.getElementById(`goc-summary-subtab-${name}`);
        if (el) el.style.display = name === subtab ? (name === 'resumo' ? 'flex' : 'block') : 'none';
      });
    }
    // HELPER: computeCb360DurationBetween() — calcula a duração entre duas datas/horas, devolve string formatada (ex: "2h 15m")
    function computeCb360DurationBetween(dateStart, timeStart, dateEnd, timeEnd) {
      if (!dateStart || !timeStart || !dateEnd || !timeEnd) return '';
      const start = new Date(`${dateStart}T${timeStart}`);
      const end = new Date(`${dateEnd}T${timeEnd}`);
      if (isNaN(start) || isNaN(end)) return '';
      const diffMs = end - start;
      if (diffMs < 0) return '';
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
    }
    // RENDER: renderCb360SummaryResumoTables() — preenche as tabelas de Viaturas e Bombeiros na sub-tab Resumo
    function renderCb360SummaryResumoTables() {
      // ---- Linha de totais (ex: "1 Viatura; 7 Kms; 1 Doente; 2 Bombeiros.") ----
      const resumoLineEl = document.getElementById('goc-summary-resumo-line');
      if (resumoLineEl) {
        const totalVehicles = cb360ResourcesVehicles.length;
        const totalFirefighters = cb360ResourcesFirefighters.length;
        const totalVictims = cb360ResourcesVictims.length;
        const totalKms = cb360ResourcesVehicles.reduce((sum, v) => {
          const kmStart = parseFloat(v.kmStart);
          const kmEnd = parseFloat(v.kmEnd);
          if (!isNaN(kmStart) && !isNaN(kmEnd)) return sum + (kmEnd - kmStart);
          return sum;
        }, 0);
        const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;
        resumoLineEl.textContent = `${plural(totalVehicles, 'Viatura', 'Viaturas')}; ${totalKms} Kms; ${plural(totalVictims, 'Doente', 'Doentes')}; ${plural(totalFirefighters, 'Bombeiro', 'Bombeiros')}.`;
      }
      // ---- Tabela de Viaturas ----
      const vehiclesBody = document.getElementById('goc-summary-vehicles-table-body');
      if (vehiclesBody) {
        vehiclesBody.innerHTML = cb360ResourcesVehicles.length ? cb360ResourcesVehicles.map(v => {
          const usageTime = computeCb360DurationBetween(v.departureDateCB, v.departureTimeCB, v.arrivalDateCB, v.arrivalTimeCB);
          const LocalTime = computeCb360DurationBetween(v.arrivalDateScene, v.arrivalTimeScene, v.departureDateScene, v.departureTimeScene);
          const kmStart = parseFloat(v.kmStart);
          const kmEnd = parseFloat(v.kmEnd);
          const kmsTraveled = (!isNaN(kmStart) && !isNaN(kmEnd)) ? (kmEnd - kmStart) : '';
          return `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:6px 8px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; font-weight:600;">${v.vehicle || ''}</td>
              <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${usageTime}</td>
              <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${LocalTime}</td>
              <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${kmsTraveled}</td>
            </tr>`;
        }).join('') : `<tr><td colspan="4" style="padding:14px; text-align:center; color:#999;">Nenhuma viatura associada.</td></tr>`;
      }
      // ---- Tabela de Bombeiros ----
      const firefightersBody = document.getElementById('goc-summary-firefighters-table-body');
      if (firefightersBody) {
        firefightersBody.innerHTML = cb360ResourcesFirefighters.length ? cb360ResourcesFirefighters.map(b => {
          const tempoTotal = computeCb360DurationBetween(b.departureDate, b.departureTime, b.returnDate, b.returnTime);
          return `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:6px 8px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; font-weight:600;">${b.code || ''}</td>
              <td style="padding:6px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${tempoTotal}</td>
            </tr>`;
        }).join('') : `<tr><td colspan="2" style="padding:14px; text-align:center; color:#999;">Nenhum bombeiro associado.</td></tr>`;
      }
    }
    // RENDER: renderCb360SummaryArrivalTable() — tabela de Viatura/Chefe/Chegada-Saída T.O./Chegada C.B. + Horas/Minutos de Bomba
    function renderCb360SummaryArrivalTable() {
      const tbody = document.getElementById('goc-summary-arrival-table-body');
      if (!tbody) return;
      const formatDateTime = (date, time) => {
        if (!date && !time) return '';
        return `${formatDatePT(date)}<br>${formatTimePT(time)}`;
      };
      tbody.innerHTML = cb360ResourcesVehicles.length ? cb360ResourcesVehicles.map(v => {
        const chefe = cb360ResourcesFirefighters.find(b => b.vehicle === v.vehicle && b.confirmed);
        return `
          <tr style="border-bottom:1px solid #eee;" data-vehicle-id="${v.id}">
            <td style="padding:3px 8px; text-align:center; border-left:1px solid #ccc; border-right:1px solid #ccc; border-bottom:1px solid #ccc; font-weight:600;">${v.vehicle || ''}</td>
            <td style="padding:3px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${chefe?.code || ''}</td>
            <td style="padding:3px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${formatDateTime(v.arrivalDateScene, v.arrivalTimeScene)}</td>
            <td style="padding:3px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${formatDateTime(v.departureDateScene, v.departureTimeScene)}</td>
            <td style="padding:3px 8px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">${formatDateTime(v.arrivalDateCB, v.arrivalTimeCB)}</td>
            <td style="padding:3px 6px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
              <input type="text" class="goc-summary-arrival-hours" data-id="${v.id}" value="${padCb360PumpValue(v.pumpHours)}" style="width:45px; padding:3px 4px; border:1px solid #ccc; border-radius:3px; font-size:12px; text-align:center;">
            </td>
            <td style="padding:3px 6px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
              <input type="text" class="goc-summary-arrival-minutes" data-id="${v.id}" value="${padCb360PumpValue(v.pumpMinutes)}" style="width:45px; padding:3px 4px; border:1px solid #ccc; border-radius:3px; font-size:12px; text-align:center;">
            </td>
            <td style="padding:3px 6px; text-align:center; border-right:1px solid #ccc; border-bottom:1px solid #ccc;">
              <button class="goc-summary-arrival-save" data-id="${v.id}" style="background:transparent; border:none; color:#7fa8dd; cursor:pointer; font-size:13px;"><i class="fa-regular fa-floppy-disk" style="font-size:17px;"></i></button>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="8" style="padding:14px; text-align:center; color:#999;">Nenhuma viatura associada.</td></tr>
     `;
      tbody.querySelectorAll('.goc-summary-arrival-save').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const row = btn.closest('tr');
          const hoursInput = row.querySelector('.goc-summary-arrival-hours');
          const minutesInput = row.querySelector('.goc-summary-arrival-minutes');
          const item = cb360ResourcesVehicles.find(v => v.id === id);
          if (!item) return;
          btn.disabled = true;
          const ok = await saveCb360VehiclePumpTime(id, hoursInput.value, minutesInput.value);
          if (ok) {
            item.pumpHours = hoursInput.value;
            item.pumpMinutes = minutesInput.value;
            updateCb360SummaryArrivalTotal();
          }
          btn.disabled = false;
        });
      });
      updateCb360SummaryArrivalTotal();
    }
    function padCb360PumpValue(value) {
      if (value === '' || value === null || value === undefined) return '';
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      return String(Math.trunc(num)).padStart(2, '0');
    }
    // HELPER: updateCb360SummaryArrivalTotal() — soma as Horas/Minutos de Bomba e mostra no rodapé
    function updateCb360SummaryArrivalTotal() {
      const totalInput = document.getElementById('goc-summary-arrival-total');
      if (!totalInput) return;
      let totalMinutes = 0;
      cb360ResourcesVehicles.forEach(v => {
        const h = parseFloat(v.pumpHours) || 0;
        const m = parseFloat(v.pumpMinutes) || 0;
        totalMinutes += (h * 60) + m;
      });
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      const horaLabel = hours === 1 ? 'hora' : 'horas';
      const minutoLabel = minutes === 1 ? 'minuto' : 'minutos';
      totalInput.value = totalMinutes ? `${hours} ${horaLabel} e ${minutes} ${minutoLabel}` : '';
    }
    // SAVE: saveCb360VehiclePumpTime() — grava Horas/Minutos de Bomba de uma viatura (PATCH cb360_dispatch_vehicles)
    async function saveCb360VehiclePumpTime(vehicleId, hours, minutes) {
      try {
        const payload = {
          pump_hours: hours !== '' ? parseFloat(hours) : null,
          pump_minutes: minutes !== '' ? parseFloat(minutes) : null
        };
        const response = await supaFetch(`${SUPABASE_URL}/rest/v1/cb360_dispatch_vehicles?id=eq.${vehicleId}`, { method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload) });
        if (!response.ok) {
          console.error('Erro ao gravar tempo de bomba:', await response.text());
          showPopup('popup-danger', 'Erro ao gravar o tempo de bomba.');
          return false;
        }
        showPopup('popup-success', 'Tempo de bomba gravado com sucesso!');
        return true;
      } catch (err) {
        console.error('Erro saveCb360VehiclePumpTime:', err);
        showPopup('popup-danger', 'Erro de rede ao gravar o tempo de bomba.');
        return false;
      }
    }
    // RENDER: renderCb360SummaryMeiosEnvolvidos() — preenche os campos automáticos da sub-tab "Meios Envolvidos"
    function renderCb360SummaryMeiosEnvolvidos() {
      const totalMenInt = cb360ResourcesFirefighters.length;
      const totalVehiclesInt = cb360ResourcesVehicles.length;
      const menIntEl = document.getElementById('goc-summary-int-men');
      const vehiclesIntEl = document.getElementById('goc-summary-int-vehicles');
      const corpsIntEl = document.getElementById('goc-summary-int-corps');
      if (menIntEl) menIntEl.value = totalMenInt;
      if (vehiclesIntEl) vehiclesIntEl.value = totalVehiclesInt;
      if (corpsIntEl) corpsIntEl.value = 1;
      updateCb360SummaryTotalMeios();
    }
    // HELPER: updateCb360SummaryTotalMeios() — soma Meios Internos + Meios Externos
    function updateCb360SummaryTotalMeios() {
      const menInt = parseFloat(document.getElementById('goc-summary-int-men')?.value) || 0;
      const vehiclesInt = parseFloat(document.getElementById('goc-summary-int-vehicles')?.value) || 0;
      const corpsInt = document.getElementById('goc-summary-int-corps')?.value ? 1 : 0;
      const menExt = parseFloat(document.getElementById('goc-summary-ext-men')?.value) || 0;
      const vehiclesExt = parseFloat(document.getElementById('goc-summary-ext-vehicles')?.value) || 0;
      const entitiesExt = parseFloat(document.getElementById('goc-summary-ext-entities')?.value) || 0;
      const totalMenEl = document.getElementById('goc-summary-total-men');
      const totalVehiclesEl = document.getElementById('goc-summary-total-vehicles');
      const totalCorpsEl = document.getElementById('goc-summary-total-corps');
      if (totalMenEl) totalMenEl.value = menInt + menExt;
      if (totalVehiclesEl) totalVehiclesEl.value = vehiclesInt + vehiclesExt;
      if (totalCorpsEl) totalCorpsEl.value = corpsInt + entitiesExt;
    }
    // ==============================================================================
    // == 10. FITA DO TEMPO (POSITs — cards numa timeline vertical)              ==
    // ==============================================================================    
    // CARREGAR DADOS DO SUPABASE PARA O INCIDENTE ATUAL
    async function loadCb360TimelineEvents() {
      if (!cb360CurrentIncident || !cb360CurrentIncident.internal_number) {
        cb360TimelineEvents = [];
        return;
      }
      try {
        const url = `${SUPABASE_URL}/rest/v1/cb360_timeline_events?internal_number=eq.${encodeURIComponent(cb360CurrentIncident.internal_number)}&select=*`;
        const response = await supaFetch(url, { method: 'GET' });        
        if (!response.ok) throw new Error('Erro ao carregar fita do tempo');        
        const data = await response.json();        
        cb360TimelineEvents = (data || []).map(item => ({
          id: item.id, internal_number: item.internal_number, dateVal: item.date_val, timeVal: item.time_val, dateTime: item.date_time, typeVal: item.type_val, fromVal: item.from_val, 
          toVal: item.to_val, infoVal: item.info_val, personName: item.person_name
        }));
      } catch (err) {
        console.error('Erro ao carregar fita do tempo:', err);
        cb360TimelineEvents = [];
      }
    }
    // RENDER (shell da tab): renderCb360TimelineTab()
async function renderCb360TimelineTab() {
  const container = document.getElementById('goc-tab-content-timeline');
  if (!container) return;
  container.innerHTML = `
    <style>
      #goc-tab-content-timeline input:focus, #goc-tab-content-timeline select:focus, #goc-tab-content-timeline textarea:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
      .goc-posit-edit:hover i, .goc-posit-remove:hover i {filter: brightness(0.8);}
      #goc-timeline-wrap::-webkit-scrollbar {width: 8px;}
      #goc-timeline-wrap::-webkit-scrollbar-track {background: #f0f0f0; border-radius: 10px;}
      #goc-timeline-wrap::-webkit-scrollbar-thumb {background: linear-gradient(180deg, #b0b0b0, #888); border-radius: 10px;}
    </style>
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px; flex-shrink:0;">
      <button id="goc-btn-add-posit-timeline" style="background:#2b6ecb; color:#fff; border:none; padding:9px 18px; border-radius:5px; font-weight:600; cursor:pointer; font-size:12.5px; display:flex; align-items:center; gap:8px;"><i class="fa fa-tags"></i> Adicionar POSIT</button>
      <label style="font-size:12.5px; font-weight:600;">Tipo Comunicação</label>
      <select id="goc-timeline-comm-type" style="height:30px; padding:0 8px; border:1px solid #ccc; border-radius:4px; font-size:12px; width:180px;">
        <option value=""></option>
        <option value="Comunicação">Comunicação</option>
        <option value="POSIT">POSIT</option>
      </select>
    </div>
    <div id="goc-timeline-wrap" style="max-height:500px; overflow-y:auto; padding-right:6px; margin-top:20px;">
      <div id="goc-timeline-list" style="position:relative; padding-left:0px;"></div>
    </div>
  `;      
  await loadCb360TimelineEvents();
  renderCb360TimelineList();      
  document.getElementById('goc-btn-add-posit-timeline').addEventListener('click', () => openCb360PositModal(null));
  document.getElementById('goc-timeline-comm-type').addEventListener('change', () => {
    renderCb360TimelineList();
  });
}
    function formatCb360TimelineDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      const d = new Date(dateTimeStr.replace(' ', 'T'));
      if (isNaN(d)) return dateTimeStr;
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    // RENDER: renderCb360TimelineList()
    function renderCb360TimelineList() {
      const list = document.getElementById('goc-timeline-list');
      if (!list) return;
      const isClosed = !!cb360CurrentIncident?.is_closed;      
      const filterType = document.getElementById('goc-timeline-comm-type')?.value || '';
      let filteredEvents = cb360TimelineEvents;
      if (filterType !== '') {
        filteredEvents = cb360TimelineEvents.filter(ev => ev.typeVal === filterType);
      }
      const sorted = [...filteredEvents].sort((a, b) => b.dateTime.localeCompare(a.dateTime));      
      if (!sorted.length) {
        list.innerHTML = `<p style="color:#999; padding:14px 0;">Sem registos encontrados.</p>`;
        return;
      }      
      list.innerHTML = `
        <style>
          .goc-timeline-dot {transition: transform 0.15s, background-color 0.15s, box-shadow 0.15s; cursor:pointer;}
          .goc-timeline-dot:hover {background: #d9534f !important; border-color: #f2dede !important; transform: scale(1.25); box-shadow: 0 0 0 2px rgba(217, 83, 79, 0.4);}
        </style>
        <div style="position:relative;">
          <div style="position:absolute; left:146px; top:16px; bottom:16px; width:2px; background:#dbe6f5;"></div>
          ${sorted.map(ev => {
            const isPosit = ev.typeVal === 'POSIT';
            const icon = isPosit
              ? '<i class="fa-solid fa-bullseye" style="color:#d9534f; font-size:16px;"></i>'
              : '<i class="fa-solid fa-tty" style="color:#666; font-size:16px;"></i>';            
            return `
            <div style="position:relative; padding-bottom:22px;" data-id="${ev.id}">
              <div style="position:absolute; left:0px; top:12px; width:130px; text-align:right; font-weight:700; color:#333; font-size:12.5px; white-space:nowrap;">${formatCb360TimelineDateTime(ev.dateTime)}</div>
              <div class="goc-timeline-dot" style="position:absolute; left:140px; top:15px; width:14px; height:14px; border-radius:50%; background:#b0b0b0; border:3px solid #fff; box-shadow:0 0 0 1px #b0b0b0; z-index:2;"></div>
              <div style="margin-left:162px; border:1px solid #ddd; border-radius:4px; padding:10px 14px; background:#fff;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    ${icon}
                    <span style="font-weight:600; color:#d9534f; font-size:14px;">${ev.personName || 'Operador'}</span>
                  </div>
                  ${isClosed ? '' : `
                    <div style="display:flex; gap:6px;">
                      <button class="goc-posit-edit" data-id="${ev.id}" style="background:transparent; border:none; color:#2b6ecb; cursor:pointer; font-size:13px;"><i class="fa-solid fa-pencil"></i></button>
                      <button class="goc-posit-remove" data-id="${ev.id}" style="background:transparent; border:none; color:#d9534f; cursor:pointer; font-size:13px;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                  `}
                </div>
                <div style="font-size:12.5px; color:#333; display:flex; flex-direction:column; gap:4px; line-height:1.4;">
                  ${ev.fromVal ? `<div><strong style="color:#222;">De:</strong> ${ev.fromVal}</div>` : ''}
                  ${ev.toVal ? `<div><strong style="color:#222;">Para:</strong> ${ev.toVal}</div>` : ''}
                  <div style="margin-top:2px;">${ev.infoVal || ''}</div>
                </div>
              </div>
            </div>
          `;}).join('')}
        </div>
      `;      
      list.querySelectorAll('.goc-posit-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = cb360TimelineEvents.find(ev => String(ev.id) === String(btn.dataset.id));
          if (item) openCb360PositModal(item);
        });
      });      
      list.querySelectorAll('.goc-posit-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Tem a certeza que pretende eliminar este registo?')) return;
          const idToDelete = btn.dataset.id;          
          try {
            const headers = getSupabaseHeaders();
            headers['Prefer'] = 'return=representation';
            const response = await fetch(`${SUPABASE_URL}/rest/v1/cb360_timeline_events?id=eq.${idToDelete}`, {
              method: 'DELETE',
              headers: headers
            });            
            if (!response.ok) throw new Error('Erro ao eliminar registo');            
            cb360TimelineEvents = cb360TimelineEvents.filter(ev => String(ev.id) !== String(idToDelete));
            renderCb360TimelineList();
          } catch (err) {
            console.error('Erro ao eliminar:', err);
            alert('Erro ao eliminar o registo na base de dados.');
          }
        });
      });
    }
    // OPEN: openCb360PositModal()
    async function openCb360PositModal(existing = null) {
      const page = document.getElementById('page-cb360-redund');
      if (!page || document.getElementById('goc-posit-modal-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'goc-posit-modal-overlay';
      overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; align-items:center; justify-content:center;';      
      const inputStyle = 'height:30px; padding:4px 8px; border:1px solid #5bc0de; border-radius:4px; font-size:12px; box-sizing:border-box; width:100%;';
      const labelStyle = 'font-size:12px; font-weight:600; color:#333;';
      const now = new Date();
      const defaultDate = toLocalISODate(now);
      const defaultTime = now.toTimeString().slice(0, 5);
      const dateVal = existing ? existing.dateVal : defaultDate;
      const timeVal = existing ? existing.timeVal : defaultTime;
      const typeVal = existing ? existing.typeVal : '';
      const fromVal = existing ? existing.fromVal : '';
      const toVal = existing ? existing.toVal : '';
      const infoVal = existing ? existing.infoVal : '';
      overlay.innerHTML = `
        <style>
          #goc-posit-body input:focus, #goc-posit-body select:focus, #goc-posit-body textarea:focus {outline: none !important; border: 1px solid #d9534f !important; box-shadow: 0 0 4px rgba(217, 83, 79, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;}
        </style>
        <div style="background:#fff; width:520px; border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,0.25); overflow:hidden;">
          <div style="display:flex; align-items:center; justify-content:space-between; background:#2b6ecb; color:#fff; padding:10px 16px; gap:10px;">
            <div style="font-weight:600; font-size:13.5px; display:flex; align-items:center; gap:8px;"><i class="fa fa-tags"></i> ${existing ? 'Editar POSIT' : 'Novo POSIT'}</div>
            <button id="goc-posit-btn-x" style="background:transparent; border:none; color:#fff; cursor:pointer; font-size:14px; font-weight:bold;">✕</button>
          </div>
          <div id="goc-posit-body" style="padding:16px 20px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <label style="${labelStyle}">Data</label>
                <input type="date" id="goc-posit-date" value="${dateVal}" style="${inputStyle}">
              </div>
              <div style="display:flex; flex-direction:column; gap:4px;">
                <label style="${labelStyle}">Hora</label>
                <input type="time" id="goc-posit-time" value="${timeVal}" style="${inputStyle}">
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="${labelStyle}">Tipo</label>
              <select id="goc-posit-type" style="${inputStyle}">
                <option value=""></option>
                <option value="Comunicação" ${typeVal === 'Comunicação' ? 'selected' : ''}>Comunicação</option>
                <option value="POSIT" ${typeVal === 'POSIT' ? 'selected' : ''}>POSIT</option>
              </select>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="${labelStyle}">De</label>
              <input type="text" id="goc-posit-from" value="${fromVal}" style="${inputStyle}">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="${labelStyle}">Para</label>
              <input type="text" id="goc-posit-to" value="${toVal}" style="${inputStyle}">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="${labelStyle}">Informação</label>
              <textarea id="goc-posit-info" style="width:100%; height:90px; padding:6px 8px; border:1px solid #5bc0de; border-radius:4px; font-size:12px; box-sizing:border-box; resize:none;">${infoVal}</textarea>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; padding:12px 20px; background:#f9f9f9; border-top:1px solid #eee;">
            <button id="goc-posit-btn-save" style="background:#5cb85c; color:#fff; border:none; padding:9px 15px; border-radius:4px; font-weight:600; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px;"><i class="far fa-save"></i> Guardar</button>
            <button id="goc-posit-btn-close" style="background:#f0ad4e; color:#fff; border:none; padding:9px 15px; border-radius:4px; font-weight:600; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-power-off"></i> Fechar</button>
          </div>
        </div>
      `;
      page.appendChild(overlay);
      document.getElementById('goc-posit-btn-x').addEventListener('click', closeCb360PositModal);
      document.getElementById('goc-posit-btn-close').addEventListener('click', closeCb360PositModal);      
      document.getElementById('goc-posit-btn-save').addEventListener('click', async () => {
        const dateVal = document.getElementById('goc-posit-date').value.trim();
        const timeVal = document.getElementById('goc-posit-time').value.trim();
        const typeVal = document.getElementById('goc-posit-type').value;
        const fromVal = document.getElementById('goc-posit-from').value.trim();
        const toVal = document.getElementById('goc-posit-to').value.trim();
        const infoVal = document.getElementById('goc-posit-info').value.trim();        
        const dateTime = `${dateVal} ${timeVal}`;
        const internalNumber = cb360CurrentIncident?.internal_number || '';
        const currentUser = sessionStorage.getItem("currentUserDisplay") || sessionStorage.getItem("currentUserName") || "Operador";
        let authorName = currentUser;
        const patent = typeof getPatentByFullName === 'function' ? await getPatentByFullName(currentUser) : null;
        if (patent) {
          authorName = `${currentUser} (${patent})`;
        }
        const payload = {internal_number: internalNumber, date_val: dateVal, time_val: timeVal, date_time: dateTime, type_val: typeVal, from_val: fromVal, to_val: toVal, info_val: infoVal, person_name: authorName};
        try {
          const headers = getSupabaseHeaders();
          headers['Content-Type'] = 'application/json';
          headers['Prefer'] = 'return=representation';
          if (existing) {
            // UPDATE
            const response = await fetch(`${SUPABASE_URL}/rest/v1/cb360_timeline_events?id=eq.${existing.id}`, {
              method: 'PATCH',
              headers: headers,
              body: JSON.stringify(payload)
            });            
            if (!response.ok) throw new Error('Erro ao atualizar POSIT');
            existing.dateVal = dateVal;
            existing.timeVal = timeVal;
            existing.typeVal = typeVal;
            existing.fromVal = fromVal;
            existing.toVal = toVal;
            existing.infoVal = infoVal;
            existing.dateTime = dateTime;
          } else {
            // INSERT
            const response = await fetch(`${SUPABASE_URL}/rest/v1/cb360_timeline_events`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(payload)
            });            
            if (!response.ok) throw new Error('Erro ao inserir POSIT');
            const data = await response.json();
            if (data && data[0]) {
              cb360TimelineEvents.push({
                id: data[0].id, internal_number: data[0].internal_number, dateVal: data[0].date_val, timeVal: data[0].time_val, dateTime: data[0].date_time, typeVal: data[0].type_val, fromVal: data[0].from_val,
                toVal: data[0].to_val, infoVal: data[0].info_val, personName: data[0].person_name
              });
            }
          }          
          closeCb360PositModal();
          renderCb360TimelineList();
        } catch (err) {
          console.error('Erro ao guardar POSIT no Supabase:', err);
          alert('Erro ao guardar o registo na base de dados.');
        }
      });
      overlay.addEventListener('click', (e) => {if (e.target === overlay) closeCb360PositModal();});
      setTimeout(() => {overlay.style.display = 'flex';}, 10);
    }
    // CLOSE: closeCb360PositModal()
    function closeCb360PositModal() {
      const overlay = document.getElementById('goc-posit-modal-overlay');
      if (overlay) overlay.remove();
    }
