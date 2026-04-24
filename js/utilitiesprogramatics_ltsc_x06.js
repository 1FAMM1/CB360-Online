    /* =======================================
    DIGITAL PANEL CONSOLE GROUP
    ======================================= */
    /* ========== SIDEBAR BUTTON CONTROL AND NAVIGATION ========== */
    function showPanelCard(cardId) {
      const allCards = document.querySelectorAll('.panel-card');
      allCards.forEach(card => {
        card.classList.remove('active');
      });
      const allButtons = document.querySelectorAll('.panel-sidebar-menu-button');
      allButtons.forEach(button => {
        button.classList.remove('active');
      });
      document.getElementById('panel-' + cardId).classList.add('active');
      event.target.classList.add('active');
    }
    /* =======================================
    SPECIAL READINESS STATES
    ======================================= */
    /* ========== COLOR CONTROL EPE ========== */
    class EPEButtonColorManager {
      constructor(supabaseUrl, supabaseKey) {
        this.SUPABASE_URL = supabaseUrl;
        this.SUPABASE_ANON_KEY = supabaseKey;
        const epeColors = [{bg: '#4CAF50', text: 'white'}, {bg: '#5B9BD5', text: 'white'}, {bg: '#FFD966', text: 'black'}, 
                           {bg: '#F4A460', text: 'black'}, {bg: '#E57373', text: 'white'}, {bg: '#D3D1C7', text: '#5F5E5A'}];
        const ppiAeroColors = [{bg: '#4CAF50', text: 'white'}, {bg: '#FFD966', text: 'black'}, {bg: '#E57373', text: 'white'},
                               {bg: '#D3D1C7', text: '#5F5E5A'}, {bg: '#D3D1C7', text: '#5F5E5A'}, {bg: '#D3D1C7', text: '#5F5E5A'}];
        const ppiA22LinferColors = [{bg: '#4CAF50', text: 'white'}, {bg: '#FFD966', text: 'black'}, {bg: '#F4A460', text: 'black'},
                                    {bg: '#E57373', text: 'white'}, {bg: '#D3D1C7', text: '#5F5E5A'}, {bg: '#D3D1C7', text: '#5F5E5A'}];
        this.buttonColors = {"epe-decir": epeColors, "epe-diops": epeColors, "epe-nrbq": epeColors, "ppi-aero": ppiAeroColors, "ppi-a22": ppiA22LinferColors, "ppi-linfer": ppiA22LinferColors};
        this.initializeButtons();
      }
      initializeButtons() {
        Object.keys(this.buttonColors).forEach(containerId => {
          const container = document.getElementById(containerId);
          if (!container) return;
          const buttons = container.querySelectorAll('.epeppi-panel-btn');
          buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
              this.toggleButton(containerId, button, index);
            });
          });
        });
      }
      toggleButton(containerId, button, index) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.querySelectorAll('.epeppi-panel-btn').forEach(btn => {
          btn.style.backgroundColor = 'lightgrey';
          btn.style.color = 'black';
          btn.dataset.active = 'false';
        });
        const colors = this.buttonColors[containerId][index];
        button.style.backgroundColor = colors.bg;
        button.style.color = colors.text;
        button.dataset.active = 'true';
        const epe_type = containerId;
        const epe_value = button.textContent.trim();
        this.saveToSupabase(epe_type, epe_value);
        showPopup('popup-success', `Estado do <b>${epe_type.toUpperCase()}</b>, atualizado para <b>${epe_value}</b>.`);
      }
      async loadFromSupabase() {
      try {
        const corpId = sessionStorage.getItem('currentCorpOperNr') || "0805";
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = corpId;
        const resp = await fetch(`${this.SUPABASE_URL}/rest/v1/epe_status?corp_oper_nr=eq.${corpId}`, {
          method: 'GET',
          headers: headers
        });
        if (!resp.ok) throw new Error(`Erro ao ler EPE: ${resp.status}`);
        const data = await resp.json();
        data.forEach(row => {
          const containerId = row.epe_type;
          const epeValue = row.epe;
          const container = document.getElementById(containerId);
          if (!container) return;
          const buttons = container.querySelectorAll('.epeppi-panel-btn');
          buttons.forEach((btn, index) => {
            if (btn.textContent.trim() === epeValue) {
              const colors = this.buttonColors[containerId][index];
              btn.style.backgroundColor = colors.bg;
              btn.style.color = colors.text;
              btn.dataset.active = 'true';
              const stateClass = stateMap[epeValue];
              if (stateClass) btn.classList.add(stateClass);
            } else {
              btn.style.backgroundColor = 'lightgrey';
              btn.style.color = 'black';
              btn.dataset.active = 'false';
              if (btn.textContent.trim()) btn.classList.add('inactive');
            }
          });
        });
      } catch (e) {
        console.error('❌ Erro ao carregar estados EPE:', e);
      }
     }
      async saveToSupabase(epe_type, epe_value) {
        try {
          const corpId = sessionStorage.getItem('currentCorpOperNr') || "0805";
          const headers = getSupabaseHeaders({ returnRepresentation: true });
          headers['x-my-corpo'] = corpId;
          const body = {epe: epe_value, corp_oper_nr: corpId};
          const resp = await fetch(`${this.SUPABASE_URL}/rest/v1/epe_status?epe_type=eq.${encodeURIComponent(epe_type)}&corp_oper_nr=eq.${corpId}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(body)
          });
          if (!resp.ok) {
            console.error('❌ Erro RLS ao atualizar EPE:', resp.status);
          }
        } catch (e) {
          console.error('❌ Erro na requisição EPE:', e);
        }
      }      
    }
    document.addEventListener('DOMContentLoaded', () => {
      window.colorManager = new EPEButtonColorManager(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.colorManager.loadFromSupabase();
      document.querySelectorAll('.sidebar-menu-button').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = btn.dataset.page;
          if (page === 'page-utilities') {
            if (window.colorManager) {
              window.colorManager.loadFromSupabase();
            }
          }
        });
      });
    });
    /* =======================================
    VEHICLE OPERATIONAL STATUS
    ======================================= */
    const TYPE_ORDER = {'VCOT': 1, 'VCOC': 2, 'VTTP': 3, 'VLCI': 4, 'VFCI': 5, 'VECI': 6, 'VRCI': 7, 'VUCI': 8, 'VSAT': 9, 'VSAE': 10, 'VTTU': 11, 'VTTF': 12, 'VTTR': 13, 
                        'VALE': 14, 'VOPE': 15, 'VETA': 16, 'VE30': 17, 'VE32': 18, 'VP00': 19, 'ABSC': 20, 'ABCI': 21, 'ABTM': 22, 'ABTD': 23, 'VDTD': 24, 'ATRL': 25};
    let vehicles = [];
    let vehicleStatuses = {};
    let vehicleINOP = {};
    let selectedVehicleCode = null;
    const vehicleGrid = document.getElementById('vehicleGrid');
    const vehicleStatusModal = document.getElementById('vehicle-status-modal');
    const vehicleStatusTitle = document.getElementById('vehicle-status-modal-title');
    const vehicleStatusSelect = document.getElementById('vehicle-status-select');
    const vehicleStatusOkBtn = document.getElementById('vehicle-status-ok-btn');
    const vehicleStatusCancelBtn = document.getElementById('vehicle-status-cancel-btn');
    function getVehicleIcon(type) {
      const icons = {'VCOT': '🚒', 'VCOC': '🚒', 'VTTP': '🚒', 'VFCI': '🚒', 'VLCI': '🚒', 'VECI': '🚒', 'VRCI': '🚒', 'VUCI': '🚒', 'VSAT': '🚒', 'VSAE': '🚒',
                     'VTTU': '🚒', 'VTTF': '🚒', 'VTTR': '🚒', 'VALE': '🚒', 'VOPE': '🚒', 'VETA': '🚒', 'VE30': '🚒', 'VE32': '🚒', 'VP00': '🚒', 'ABCI': '🚑',
                     'ABSC': '🚑', 'ABTM': '🚑', 'ABTD': '🚑', 'VDTD': '🚑'};
      return icons[type] || '🚗';
    }
    function sortVehicles(list) {
      return list.sort((a, b) => {
        const [typeA, numA] = a.split('-');
        const [typeB, numB] = b.split('-');
        const orderA = TYPE_ORDER[typeA] || 999;
        const orderB = TYPE_ORDER[typeB] || 999;
        if (orderA === orderB) return parseInt(numA) - parseInt(numB);
        return orderA - orderB;
      });
    }
    async function loadVehiclesFromsessionStorage() {
      const vehicleStatusEl = document.getElementById('vehicleStatus');
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!currentCorpOperNr) {
        vehicleGrid.style.display = "block";
        vehicleGrid.innerHTML = `
          <div style="padding: 10px; font-size: 16px; color: #333; text-align: center;">
            ⚠️ Nenhuma corporação selecionada. Selecione uma corporação para visualizar os veículos.
          </div>
        `;
        vehicleStatusEl.style.display = "none";
        return;
      }
      try {
        vehicleStatusEl.textContent = '🔄 A carregar veículos...';
        vehicleStatusEl.style.display = 'block';
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle,current_status,is_inop,vehic_id,corp_oper_nr`, {
            method: 'GET',
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        let vehiclesData = await response.json();
        if (currentCorpOperNr) {
          vehiclesData = vehiclesData.filter(v => v.corp_oper_nr == currentCorpOperNr);
        }
        if (vehiclesData.length === 0) {
          vehicleStatusEl.style.display = "none";
          vehicleGrid.style.display = "block";
          vehicleGrid.innerHTML = `
            <div style="padding: 10px; font-size: 16px; color: #333; text-align: center;">
              🚫 Ainda não existem veículos registados para a sua corporação.
            </div>
          `;
          return;
        }
        const allVehicles = [];
        vehicleStatuses = {};
        vehicleINOP = {};
        vehiclesData.forEach(vehicle => {
          allVehicles.push(vehicle.vehicle);
          vehicleStatuses[vehicle.vehicle] = vehicle.current_status || 'Disponível';
          vehicleINOP[vehicle.vehicle] = vehicle.is_inop;
        });
        vehicles = sortVehicles(allVehicles);
        generateVehicleButtons();
        updateVehicleButtonColors();
        vehicleStatusEl.style.display = 'none';
      } catch (e) {
        console.error('❌ Erro ao carregar veículos:', e);
        vehicleStatusEl.textContent = '❌ Erro ao carregar. Verifique a consola.';
        vehicleStatusEl.className = 'error';
      }
    }
    async function updateVehicleStatussessionStorage(vehicleCode, newStatus) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Nenhuma corporação selecionada.");
        return;
      }
      let statusData = {corp_oper_nr: currentCorpOperNr};
      if (newStatus === "Inop") {
        statusData.is_inop = true;
        statusData.current_status = "Inoperacional";
      } else if (newStatus === "Em Serviço") {
        statusData.is_inop = false;
        statusData.current_status = "Em Serviço";
      } else {
        statusData.is_inop = false;
        statusData.current_status = "Disponível no Quartel";
      }
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicleCode)}&corp_oper_nr=eq.${currentCorpOperNr}`, {
            method: 'PATCH',
            headers: getSupabaseHeaders({Prefer: 'return=representation'}),
            body: JSON.stringify(statusData)
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        let result = null;
        try {
          result = await response.json();
        } catch (e) {
          result = null;
        }
        vehicleINOP[vehicleCode] = statusData.is_inop;
        vehicleStatuses[vehicleCode] = statusData.current_status;
        updateVehicleButtonColors();
        showPopup('popup-success', `Status do veículo ${vehicleCode} atualizado para "${statusData.current_status}"`);
      } catch (error) {
        console.error('❌ Erro ao atualizar:', error);
        showPopup('popup-danger', 'Erro ao atualizar status: ' + error.message);
      }
    }
    function generateVehicleButtons() {
      vehicleGrid.innerHTML = '';
      vehicles.forEach(vehicleCode => {
        const type = vehicleCode.split('-')[0];
        const btn = document.createElement('div');
        btn.className = `vehicle-btn ${type.toLowerCase()}`;
        btn.dataset.vehicle = vehicleCode;
        btn.innerHTML = `<span class="vehicle-icon">${getVehicleIcon(type)}</span><div class="vehicle-code">${vehicleCode}</div>`;
        btn.addEventListener('click', () => openVehicleStatusModal(vehicleCode));
        vehicleGrid.appendChild(btn);
      });
    }
    function updateVehicleButtonColors() {
      document.querySelectorAll('.vehicle-btn').forEach(btn => {
        const code = btn.dataset.vehicle;
        btn.classList.remove('inop', 'em-servico');
        if (vehicleINOP[code]) btn.classList.add('inop');
        else if (vehicleStatuses[code] === 'Em Serviço') btn.classList.add('em-servico');
      });
    }
    function openVehicleStatusModal(vehicleCode) {
      selectedVehicleCode = vehicleCode;
      vehicleStatusTitle.textContent = vehicleCode;
      if (vehicleINOP[vehicleCode]) vehicleStatusSelect.value = "Inop";
      else vehicleStatusSelect.value = vehicleStatuses[vehicleCode] || "Disponível no Quartel";
      vehicleStatusUpdateBadge(vehicleStatusSelect.value);
      vehicleStatusModal.classList.add('show');
    }
    function closeVehicleStatusModal() {
      vehicleStatusModal.classList.remove('show');
      selectedVehicleCode = null;
    }
    function vehicleStatusUpdateBadge(val) {
      const badge = document.getElementById('vehicle-status-badge');
      if (!badge) return;
      const map = {'Disponível no Quartel': 'disponivel', 'Em Serviço': 'servico', 'Inop': 'inop'};
      badge.className = 'vehicle-status-badge ' + (map[val] || 'disponivel');
      badge.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg> ${val}`;
    }
    vehicleStatusOkBtn.addEventListener('click', async () => {
      if (!selectedVehicleCode) return;
      await updateVehicleStatussessionStorage(selectedVehicleCode, vehicleStatusSelect.value);
      closeVehicleStatusModal();
    });
    vehicleStatusCancelBtn.addEventListener('click', closeVehicleStatusModal);
    window.addEventListener('click', (e) => {
      if (e.target === vehicleStatusModal) closeVehicleStatusModal();
    });
    window.addEventListener('load', loadVehiclesFromsessionStorage);
    setInterval(loadVehiclesFromsessionStorage, 10 * 60 * 1000);
    /* =======================================
    RELEVANT INFORMATION
    ======================================= */
    async function createDefaultInfoRows(corp) {
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = corp;
      const defaultRows = [1, 2, 3, 4].map(n => ({corp_oper_nr: corp, group_nr: n, from: "", destination: "", info: ""}));
      const res = await fetch(`${SUPABASE_URL}/rest/v1/infos_select`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=representation" },
        body: JSON.stringify(defaultRows)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    async function waitForInputs() {
      const requiredIds = ['relev-info-01', 'relev-info-02', 'relev-info-03', 'relev-info-04'];
      return new Promise(resolve => {
        const interval = setInterval(() => {
          const allExist = requiredIds.every(id => document.getElementById(id));
          if (allExist) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }
    async function loadInfosFromSupabase() {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!currentCorpOperNr) return console.error("❌ currentCorpOperNr não definido!");
      try {
        const infoContainer = document.getElementById('info-container');
        if (infoContainer) infoContainer.innerHTML = '';
        currentInfoCount = 0;
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        let res = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?select=id,group_nr,from,destination,info&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, {
            method: 'GET', headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        let rows = await res.json();
        if (!rows || rows.length === 0) {
          rows = await createDefaultInfoRows(currentCorpOperNr);
        }
        rows.forEach(row => {
          const hasContent = (row.from && row.from.trim() !== "") || (row.destination && row.destination.trim() !== "") || (row.info && row.info.trim() !== "");
          if (hasContent) {
            addNewRelevInfoCard();
            const n = String(currentInfoCount).padStart(2, '0');
            const group = document.getElementById(`relev-info-${n}`);
            if (group) {
              group.dataset.rowId = row.id;
              const fromInput = document.getElementById(`from-${n}`);
              const toInput = document.getElementById(`to-${n}`);
              const infoTA = document.getElementById(`info-${n}`);
              if (fromInput) fromInput.value = row.from || "";
              if (toInput) toInput.value = row.destination || "";
              if (infoTA) infoTA.value = row.info || "";
            }
          }
        });
      } catch (e) {
        console.error("❌ Erro no loadInfosFromSupabase:", e);
      }
    }
    async function saveInfoGroupFields(n) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const group = document.getElementById(`relev-info-${n}`);
      if (!group || !currentCorpOperNr) return;    
      const fromVal = document.getElementById(`from-${n}`).value || "";
      const toVal = document.getElementById(`to-${n}`).value || "";
      const infoVal = document.getElementById(`info-${n}`).value || "";    
      let rowId = group.dataset.rowId;
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = currentCorpOperNr;
      try {
        if (!rowId) {
          const resGet = await fetch(
            `${SUPABASE_URL}/rest/v1/infos_select?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${parseInt(n,10)}`, {
              method: 'GET',
              headers: headers
            }
          );
          const dataGet = await resGet.json();
          if (dataGet.length > 0) rowId = group.dataset.rowId = dataGet[0].id;
        }
        if (!rowId) return console.error(`⚠️ Sem rowId para relev-info-${n}`);
        const resPatch = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
            method: "PATCH",
            headers: { ...headers, "Prefer": "return=representation" },
            body: JSON.stringify({from: fromVal, destination: toVal, info: infoVal, corp_oper_nr: currentCorpOperNr})
          }
        );
        if (!resPatch.ok) throw new Error(await resPatch.text());
        showPopup('popup-success', `A informação ${n} foi atualizada com sucesso.`, false);
      } catch (e) {
        console.error("❌ Erro ao salvar info:", e);
      }
    }
    async function clearInfoGroupFields(n) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805"; 
      const group = document.getElementById(`relev-info-${n}`);
      if (!group || !currentCorpOperNr) return;
      const rowId = group.dataset.rowId;
      if (!rowId) return console.error(`⚠️ Sem rowId para limpar relev-info-${n}`);
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = currentCorpOperNr;
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
            method: "PATCH",
            headers: { ...headers, "Prefer": "return=representation" },
            body: JSON.stringify({from: "", destination: "", info: "", corp_oper_nr: currentCorpOperNr})
          }
        );
        if (!res.ok) throw new Error(await res.text());
        document.getElementById(`from-${n}`).value = "";
        document.getElementById(`to-${n}`).value = "";
        document.getElementById(`info-${n}`).value = "";
        showPopup('popup-success', `A informação ${n} foi limpa com sucesso.`);
      } catch (e) {
        console.error("❌ Erro ao limpar info:", e);
      }
    }
    /* =======================================
    ROAD CLOSURES
    ======================================= */
    async function waitForRouteInputs(total = 12) {
      const requiredIds = Array.from({ length: total }, (_, i) => `route-${String(i + 1).padStart(2, '0')}-name`);
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (requiredIds.every(id => document.getElementById(id))) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }
    async function loadRoutesFromSupabase(total = 12) {
      createRouteInputs(total);
      await waitForRouteInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!currentCorpOperNr) {
        return console.error("❌ [ROUTES] currentCorpOperNr não definido!");
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/street_cut?select=id,group_nr,street_name,cut_motive,cut_until&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, {
            method: "GET",
            headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (nameInput && motiveInput && untilInput) {
            nameInput.dataset.rowId = row.id;
            nameInput.dataset.groupNr = row.group_nr;
            nameInput.value = row.street_name || "";
            motiveInput.value = row.cut_motive || "";
            untilInput.value = row.cut_until || "";
          }
        });
      } catch (e) {
        console.error("❌ [ROUTES] Erro ao carregar:", e);
      }
    }
    async function saveRoutesGroupFields(total = 12) {
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Erro: Sessão não identificada.");
        return;
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (!nameInput) continue;
          const streetName = nameInput.value.trim();
          const cutMotive = motiveInput.value.trim();
          const cutUntil = untilInput.value.trim();
          let rowId = nameInput.dataset.rowId;
          if (!rowId) {
            const resCheck = await fetch(
              `${SUPABASE_URL}/rest/v1/street_cut?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`, {
                headers: headers
              }
            );
            const dataCheck = await resCheck.json();
            if (dataCheck.length > 0) {
              rowId = nameInput.dataset.rowId = dataCheck[0].id;
            }
          }
          if (!rowId) {
            const payloadInsert = [{corp_oper_nr: currentCorpOperNr, group_nr: i, street_name: streetName, cut_motive: cutMotive, cut_until: cutUntil}];
            const resCreate = await fetch(`${SUPABASE_URL}/rest/v1/street_cut`, {
              method: "POST",
              headers: { ...headers, "Prefer": "return=representation" },
              body: JSON.stringify(payloadInsert)
            });
            if (resCreate.ok) {
              const created = await resCreate.json();
              nameInput.dataset.rowId = created[0].id;
            }
          } 
          else {
            const payloadUpdate = {street_name: streetName, cut_motive: cutMotive, cut_until: cutUntil, corp_oper_nr: currentCorpOperNr};
            await fetch(`${SUPABASE_URL}/rest/v1/street_cut?id=eq.${rowId}`, {
              method: "PATCH",
              headers: headers,
              body: JSON.stringify(payloadUpdate)
            });
          }
        }
        showPopup('popup-success', "Cortes/Interrompimento de Vias atualizados com sucesso!");
        loadRoutesFromSupabase(total);
      } catch (error) {
        console.error("❌ [ROUTES] Erro ao gravar:", error);
        showPopup('popup-danger', "Erro ao gravar Cortes/Interrompimento de Vias.");
      }
    }
    document.addEventListener("DOMContentLoaded", () => loadRoutesFromSupabase());
    /* =======================================
    AIR RESOURCE CENTERS
    ======================================= */
    async function loadCMAsFromSupabase() {
      try {
        if (typeof createCmaInputs === "function") createCmaInputs();
        const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
        if (!currentCorpOperNr) {
          console.error("❌ Erro: currentCorpOperNr não encontrado!");
          return;
        }
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr; 
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${currentCorpOperNr}&order=id.asc`, {
            method: "GET",
            headers: headers
          }
        );
        if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
        const data = await res.json();
        if (data.length === 0) {
          console.warn("⚠️ O banco devolveu 0 linhas para a corp:", currentCorpOperNr);
          return;
        }
        const imagensAeronaves = {
          "Heli Ligeiro": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg",
          "Heli Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg",
          "Heli Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg",
          "Avião de Asa Fixa Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg",
          "Avião de Asa Fixa Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"
        };
        data.forEach((row, index) => {
          const n = String(index + 1).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          const imageElement = document.getElementById(`cma_image_${n}`);
          if (nameInput) {
            nameInput.value = row.aero_name || "";
            nameInput.dataset.rowId = row.id; 
          }
          if (typeSelect) {
            typeSelect.value = row.aero_type || "";
            if (imageElement) {
              const src = imagensAeronaves[row.aero_type] || "https://i.imgur.com/4Ho5HRV.png";
              imageElement.src = src;
            }
          }
          if (autoInput) {
            autoInput.value = row.aero_autonomy || "";
          }
        });
      } catch (error) {
        console.error("❌ Erro no load:", error);
      }
    }
    async function saveCMAsGroupFields() {
      try {
        const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
        if (!currentCorpOperNr) {
          showPopup('popup-danger', "Erro: Sessão expirada. Faça login novamente.");
          return;
        }
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        for (let i = 1; i <= 6; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          if (nameInput && nameInput.dataset.rowId) {
            const dbId = nameInput.dataset.rowId;
            const payload = {aero_name: nameInput.value || "", aero_type: typeSelect.value || "", aero_autonomy: autoInput.value || "", corp_oper_nr: currentCorpOperNr};
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${dbId}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(payload)
              }
            );
            if (!res.ok) {
              const errorData = await res.json();
              console.error(`❌ Erro no Card ${n}:`, errorData.message);
              throw new Error(`Falha ao gravar card ${n}`);
            }
          }
        }
        showPopup('popup-success', "Centros de Meios Aéreos atualizados com sucesso!");
        loadCMAsFromSupabase();
      } catch (error) {
        console.error("❌ Erro fatal na gravação:", error);
        showPopup('popup-danger', "Ocorreu um erro ao guardar os dados. Verifique a consola.");
      }
    }
    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);
    /* =======================================
    NO HOSPITAL
    ======================================= */    
    async function loadNoHospFromSupabase(total = 12) {
      createNoHospInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!currentCorpOperNr) return console.error("❌ [NOHOSP] CorpOperNr não definido!");
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/hospital_restrictions?select=*&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, { 
            method: "GET", 
            headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const fields = {
            nohosp: document.getElementById(`nohosp-${n}`),
            serv: document.getElementById(`nohosp-serv-${n}`),
            fromDate: document.getElementById(`nohosp-form-date-${n}`),
            fromTime: document.getElementById(`nohosp-form-time-${n}`),
            toDate: document.getElementById(`nohosp-to-date-${n}`),
            toTime: document.getElementById(`nohosp-to-time-${n}`),
            nextHosp: document.getElementById(`nextHosp-${n}`)
          };
          if (fields.nohosp) {
            fields.nohosp.dataset.rowId = row.id;
            fields.nohosp.value = row.hospital || "";
            fields.serv.value = row.service || "";
            fields.fromDate.value = row.start_date || "";
            fields.fromTime.value = row.start_time || "";
            fields.toDate.value = row.end_date || "";
            fields.toTime.value = row.end_time || "";
            fields.nextHosp.value = row.next_hospital || "";
          }
        });
      } catch (e) {
        console.error("❌ [NOHOSP] Erro ao carregar:", e);
      }
    }
    /* ====== SAVE NO HOSP GROUP FIELDS (VERSÃO OTIMIZADA) ====== */
    async function saveNoHospGroupFields(total = 12) {
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Erro: Sessão não identificada.");
        return;
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, '0');
          const mainInput = document.getElementById(`nohosp-${n}`);
          if (!mainInput) continue;
          const hospitalValue = mainInput.value.trim();
          if (hospitalValue === "") {
            console.log(`[NOHOSP] Linha ${n} vazia, a saltar...`);
            continue; 
          }
          const clean = (id) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const val = el.value.trim();
            return val === "" ? null : val;
          };
          const payload = {corp_oper_nr: currentCorpOperNr, group_nr: i, hospital: hospitalValue, service: clean(`nohosp-serv-${n}`), start_date: clean(`nohosp-form-date-${n}`),
                           start_time: clean(`nohosp-form-time-${n}`), end_date: clean(`nohosp-to-date-${n}`), end_time: clean(`nohosp-to-time-${n}`), next_hospital: clean(`nextHosp-${n}`)};
          let rowId = mainInput.dataset.rowId;
          if (!rowId) {
            const resCheck = await fetch(
              `${SUPABASE_URL}/rest/v1/hospital_restrictions?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`,
              {headers: headers}
            );
            const dataCheck = await resCheck.json();
            if (dataCheck && dataCheck.length > 0) rowId = dataCheck[0].id;
          }
          if (!rowId) {
            await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions`, {
              method: "POST",
              headers: {...headers, "Prefer": "return=representation"},
              body: JSON.stringify([payload])
            });
          } else {
            await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions?id=eq.${rowId}`, {
              method: "PATCH",
              headers: headers,
              body: JSON.stringify(payload)
            });
          }
        }
        showPopup('popup-success', "Constrangimentos hospitalares atualizados com sucesso.");
        loadNoHospFromSupabase(total);
      } catch (error) {
        console.error("❌ [NOHOSP] Erro ao gravar:", error);
        showPopup('popup-danger', "Erro ao gravar constrangimentos hospitalares.");
      }
    }
    /* =======================================
    MISSING REPORTS
    ======================================= */
    async function loadocrReportsFromSupabase(total = 24) {
      createOcrReportsInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Erro: Sessão não identificada.");
        return;
      }
      try {
        const url = `${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${currentCorpOperNr}&order=report_date.desc`;
        const response = await fetch(url, {headers: getSupabaseHeaders()});
        const raw = await response.text();
        const data = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(data)) {
          console.error("Resposta inválida:", data);
          showPopup('popup-danger', "Erro ao carregar dados.");
          return;
        }
        data.slice(0, total).forEach((report, index) => {
          const n = String(index + 1).padStart(2, '0');
          const nIntInput = document.getElementById(`report-${n}-nint`);
          const nrInput   = document.getElementById(`report-${n}-nr`);
          const dateInput = document.getElementById(`report-${n}-date`);
          const statusSel = document.getElementById(`report-${n}-status`);
          if (nIntInput) nIntInput.value = report.n_int ?? '';
          if (nrInput)   nrInput.value   = report.report_nr ?? '';
          if (dateInput) {
            if (report.report_date) {
              const d = new Date(report.report_date);
              dateInput.value = !isNaN(d) ? d.toISOString().split('T')[0] : '';
            } else {
              dateInput.value = '';
            }
          }
          if (statusSel) {
            statusSel.value = (report.report_state === true) ? 'done' : 'pending';
          }
        });
      } catch (err) {
        console.error("Erro ao carregar OCR reports:", err);
        showPopup('popup-danger', "Erro de ligação ao servidor.");
      }
    }
    async function saveOcrReportsToSupabase(total = 24) {
      const saveBtn = document.getElementById("save-ocr-reports");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
      }    
      const corp_oper_nr_raw = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!corp_oper_nr_raw) {
        showPopup('popup-danger', "Erro: Corporação não identificada.");
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Guardar"; }
        return;
      }
      const corp_oper_nr = corp_oper_nr_raw.toString().padStart(4, "0");
      const headers = getSupabaseHeaders();
      const normText = (s) => (s || "").toString().trim();
      const normKeyText = (s) => normText(s).toLowerCase();
      const makeKey = (r) =>
        `${r.corp_oper_nr}|${r.n_int}|${normKeyText(r.report_nr)}|${r.report_date || ""}`;    
      try {
        const rowsRaw = [];
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, "0");    
          const nIntEl = document.getElementById(`report-${n}-nint`);
          const nrEl   = document.getElementById(`report-${n}-nr`);
          const dateEl = document.getElementById(`report-${n}-date`);
          const stEl   = document.getElementById(`report-${n}-status`);    
          const n_int_raw   = normText(nIntEl?.value);
          const report_nr   = normText(nrEl?.value);
          const report_date = normText(dateEl?.value);
          const status      = normText(stEl?.value);    
          if (!n_int_raw && !report_nr && !report_date && !status) continue;    
          const n_int = n_int_raw ? parseInt(n_int_raw, 10) : null;
          if (!Number.isInteger(n_int)) continue;    
          rowsRaw.push({corp_oper_nr, n_int, report_nr: report_nr || null, report_date: report_date || null, report_state: status === "done"});
        }
        if (rowsRaw.length === 0) {
          showPopup('popup-danger', "Sem registos para guardar.");
          return;
        }
        const formMap = new Map();
        for (const r of rowsRaw) formMap.set(makeKey(r), r);
        const rows = [...formMap.values()];
        const getUrl = `${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${corp_oper_nr}`;    
        const getRes = await fetch(getUrl, { headers });
        const getRaw = await getRes.text();
        const existing = getRaw ? JSON.parse(getRaw) : [];    
        if (!Array.isArray(existing)) {
          console.error("Existing inválido:", existing);
          showPopup('popup-danger', "Erro ao validar dados existentes.");
          return;
        }
        const existingMap = new Map();
        for (const r of existing) {
          const key = makeKey({corp_oper_nr, n_int: r.n_int, report_nr: r.report_nr || null, report_date: r.report_date ? new Date(r.report_date).toISOString().split("T")[0] : null});
          existingMap.set(key, { report_state: r.report_state === true });
        }
        const toInsert = [];
        const toUpdate = [];    
        for (const r of rows) {
          const key = makeKey(r);
          const old = existingMap.get(key);    
          if (!old) {
            toInsert.push(r);
          } else {
            if (old.report_state !== (r.report_state === true)) {
              toUpdate.push(r);
            }
          }
        }    
        if (toInsert.length === 0 && toUpdate.length === 0) {
          showPopup('popup-danger', "Sem alterações para guardar.");
          return;
        }
        if (toInsert.length > 0) {
          const insRes = await fetch(`${SUPABASE_URL}/rest/v1/reports_control`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation"
            },
            body: JSON.stringify(toInsert)
          });    
          if (!insRes.ok) {
            const t = await insRes.text();
            console.error("Erro INSERT reports_control:", t);
            showPopup('popup-danger', "Erro ao inserir novos registos.");
            return;
          }
        }
        for (const r of toUpdate) {
          const reportNrEncoded = encodeURIComponent(r.report_nr || "");
          const reportDateVal = r.report_date || "";    
          const updUrl =
            `${SUPABASE_URL}/rest/v1/reports_control` +
            `?corp_oper_nr=eq.${corp_oper_nr}` +
            `&n_int=eq.${r.n_int}` +
            `&report_nr=eq.${reportNrEncoded}` +
            `&report_date=eq.${reportDateVal}`;    
          const updRes = await fetch(updUrl, {
            method: "PATCH",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ report_state: r.report_state === true })
          });    
          if (!updRes.ok) {
            const t = await updRes.text();
            console.error("Erro UPDATE reports_control:", t, "URL:", updUrl);
            showPopup('popup-danger', "Erro ao atualizar registos.");
            return;
          }
        }
        try {
          const affected = [...toInsert, ...toUpdate];
          const uniqueNints = [...new Set(affected.map(r => r.n_int).filter(n => Number.isInteger(n)))];    
          if (uniqueNints.length > 0) {
            const now = new Date().toISOString();
            const msgNotif = `⚠️ ATENÇÃO! Tem Relatórios de Ocorrência Pendentes. Consulte o menú "Relatórios de Ocorrência".`;    
            const notifications = uniqueNints.map(nint => ({n_int: nint, corp_oper_nr: corp_oper_nr, title: "Relatórios de Ocorrência", message: msgNotif, is_read: false, created_at: now}));    
            const notifRes = await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify(notifications)
            });
    
            if (!notifRes.ok) {
              const rawN = await notifRes.text();
              console.error("Erro ao inserir user_notifications:", rawN);
            }    
            for (const nint of uniqueNints) {
              try {
                await fetch("https://cb-360-app.vercel.app/api/sendPush", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({recipient_nint: nint.toString(), corp_nr: corp_oper_nr, sender_name: "CB360 Online", message_text: msgNotif, sender_nint: "0"})
                });
              } catch (errPush) {
                console.error("Erro ao enviar push (nint=" + nint + "):", errPush);
              }
            }
          }
        } catch (errNotif) {
          console.error("Erro no fluxo de notificações:", errNotif);
        }    
        showPopup('popup-success', `Relatórios de Ocorrência Guardados! Novos: ${toInsert.length} | Atualizados: ${toUpdate.length}`);    
      } catch (err) {
        console.error("Erro geral save OCR reports:", err);
        showPopup('popup-danger', "Erro de ligação ao servidor.");
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar";
        }
      }
    }