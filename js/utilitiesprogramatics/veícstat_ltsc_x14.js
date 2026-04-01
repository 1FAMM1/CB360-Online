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
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
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
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
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
