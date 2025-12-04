    /* =======================================
            VEHICLE OPERATIONAL STATUS
    ======================================= */
    const TYPE_ORDER = {'VCOT': 1, 'VCOC': 2, 'VTTP': 3, 'VFCI': 4, 'VECI': 5, 'VRCI': 6, 'VUCI': 7, 'VSAT': 8, 'VSAE': 9, 'VTTU': 10, 'VTTF': 11, 'VTTR': 12,
                                                  'VALE': 13, 'VOPE': 14, 'VETA': 15, 'ABSC': 20, 'ABCI': 21, 'ABTM': 22, 'ABTD': 23, 'VDTD': 24, 'ATRL': 25};
    let vehicles = [];
    let vehicleStatuses = {};
    let vehicleINOP = {};
    let selectedVehicleCode = null;
    const vehicleGrid = document.getElementById('vehicleGrid');
    const vehicleStatusModal = document.getElementById('popup-vehicle-status');
    const vehicleStatusTitle = document.getElementById('popup-vehicle-title');
    const vehicleStatusSelect = document.getElementById('vehicle-status-select');
    const vehicleStatusOkBtn = document.getElementById('popup-vehicle-ok-btn');
    const vehicleStatusCancelBtn = document.getElementById('popup-vehicle-cancel-btn');

    function getVehicleIcon(type) {
      const icons = {'VCOT': '🚒', 'VCOC': '🚒', 'VTTP': '🚒', 'VFCI': '🚒', 'VECI': '🚒', 'VRCI': '🚒', 'VUCI': '🚒', 'VSAT': '🚒', 'VSAE': '🚒', 'VTTU': '🚒',
                                   'VTTF': '🚒', 'VTTR': '🚒', 'VALE': '🚒', 'VOPE': '🚒', 'VETA': '🚒', 'ABCI': '🚑', 'ABSC': '🚑', 'ABTM': '🚑', 'ABTD': '🚑', 'VDTD': '🚑'};
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
          <div style="padding: 10px; font-size: 16px; color: #333;  text-align: center;">
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
          <div style="padding: 10px; font-size: 16px; color: #333;  text-align: center;">
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
      let statusData = {corp_oper_nr: currentCorpOperNr};
      if (newStatus === "Inop") {
        statusData.is_inop = true;
        statusData.current_status = "Inoperacional";
      } else if (newStatus === "Em Serviço") {
        statusData.current_status = "Em Serviço";
        statusData.is_inop = false;
      } else {
        statusData.current_status = "Disponível no Quartel";
        statusData.is_inop = false;
      }
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicleCode)}&corp_oper_nr=eq.${currentCorpOperNr}`, {
            method: 'PATCH',
            headers: getSupabaseHeaders({ Prefer: 'return=representation' }),
            body: JSON.stringify(statusData)
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        const result = await response.json();
        vehicleINOP[vehicleCode] = statusData.is_inop;
        vehicleStatuses[vehicleCode] = statusData.current_status;
        updateVehicleButtonColors();
      } catch (error) {
        console.error('❌ Erro ao atualizar:', error);
        alert('Erro ao atualizar status: ' + error.message);
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
      vehicleStatusModal.classList.add('show');
    }

    function closeVehicleStatusModal() {
      vehicleStatusModal.classList.remove('show');
      selectedVehicleCode = null;
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