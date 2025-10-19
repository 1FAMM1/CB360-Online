    /* =======================================
            VEHICLE OPERATIONAL STATUS
    ======================================= */
    const API_URL = 'https://geostat-360-api.vercel.app/api/vehicle_control';
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
    const vehicleSelect = document.getElementById('remove_vehicle');
    const vehicleInput = document.getElementById('add_vehicle');
    const btnAdd = document.getElementById('add_vehicle_btn');
    const btnRemove = document.getElementById('remove_vehicle_btn');
    const statusMessage = document.getElementById('vehicle_status_message');

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

    function showStatus(message, type = '') {
      statusMessage.textContent = message;
      statusMessage.className = 'status ' + type;
    }
    async function loadVehiclesFromAPI() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.vehicles)) {
          vehicles = sortVehicles(data.vehicles);
          vehicleStatuses = data.vehicleStatuses || {};
          vehicleINOP = data.vehicleINOP || {};
          generateVehicleButtons();
          populateVehicleSelect();
          updateVehicleButtonColors();
          updateVehicleCount();
          updateVehicleStats();
          document.getElementById('vehicleStatus').style.display = 'none';
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (e) {
        console.error('❌ Erro ao carregar veículos:', e);
      }
    }

    function updateVehicleCount() {
      const totalVehicles = vehicles.length;
      const sumVehiclesElement = document.getElementById('sum-vehicles');
      if (sumVehiclesElement) {
        sumVehiclesElement.textContent = totalVehicles;
      }
    }

    function updateVehicleCount() {
      const totalVehicles = vehicles.length;
      const sumVehiclesElement = document.getElementById('sum-vehicles');
      if (sumVehiclesElement) {
        sumVehiclesElement.textContent = totalVehicles;
      }
    }

    function updateVehicleStats() {
      let countQuartel = 0;
      let countServico = 0;
      let countInop = 0;
      vehicles.forEach(vehicleCode => {
        if (vehicleINOP[vehicleCode]) {
          countInop++;
        } else if (vehicleStatuses[vehicleCode] === 'Em Serviço') {
          countServico++;
        } else {
          countQuartel++;
        }
      });
      const quartelElement = document.getElementById('count-quartel');
      const servicoElement = document.getElementById('count-servico');
      const inopElement = document.getElementById('count-inop');
      if (quartelElement) quartelElement.textContent = countQuartel;
      if (servicoElement) servicoElement.textContent = countServico;
      if (inopElement) inopElement.textContent = countInop;
    }
    async function updateVehicleStatusAPI(vehicleCode, newStatus) {
      let dados = {};
      if (newStatus === "Inop") {
        dados.inop = true;
      } else if (newStatus === "Em Serviço") {
        dados.current_status = "Em Serviço";
        dados.inop = false;
      } else {
        dados.current_status = "Disponível no Quartel";
        dados.inop = false;
      }
      try {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vehicle: vehicleCode,
            ...dados
          })
        });
        const result = await response.json();
        if (result.success) {
          vehicleINOP[vehicleCode] = dados.inop;
          vehicleStatuses[vehicleCode] = dados.inop ? "Inop" : dados.current_status;
          updateVehicleButtonColors();
          updateVehicleStats();
        } else {
          alert('Erro ao atualizar status: ' + (result.error || 'Desconhecido'));
        }
      } catch (error) {
        alert('Erro na requisição: ' + error.message);
      }
    }
    async function addVehicle() {
      const novoVeiculo = vehicleInput.value.trim().toUpperCase();
      if (!novoVeiculo) return showStatus('❌ Informe o código do veículo.', 'error');
      if (vehicles.includes(novoVeiculo)) return showStatus(`⚠️ O veículo "${novoVeiculo}" já existe.`, 'error');
      showStatus('➕ Adicionando veículo...', 'loading');
      btnAdd.disabled = btnRemove.disabled = true;
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vehicle: novoVeiculo,
            status: "Disponível no Quartel",
            action: "add"
          }),
        });
        const data = await res.json();
        if (data.success) {
          showStatus(`✅ Veículo "${novoVeiculo}" adicionado!`, 'success');
          vehicleInput.value = '';
          await loadVehiclesFromAPI();
        } else {
          showStatus('❌ Erro ao adicionar: ' + (data.error || 'Desconhecido'), 'error');
        }
      } catch (error) {
        showStatus('❌ Erro ao adicionar veículo: ' + error.message, 'error');
      } finally {
        btnAdd.disabled = btnRemove.disabled = false;
      }
    }
    async function removeVehicle() {
      const veiculoSelecionado = vehicleSelect.value;
      if (!veiculoSelecionado) return showStatus('❌ Selecione um veículo para remover.', 'error');
      if (!confirm(`Remover veículo "${veiculoSelecionado}"?`)) return;
      showStatus('❌ Removendo veículo...', 'loading');
      btnAdd.disabled = btnRemove.disabled = true;
      try {
        const res = await fetch(`${API_URL}?vehicle=${encodeURIComponent(veiculoSelecionado)}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          showStatus(`✅ Veículo "${veiculoSelecionado}" removido!`, 'success');
          await loadVehiclesFromAPI();
        } else {
          showStatus('❌ Erro ao remover: ' + (data.error || 'Desconhecido'), 'error');
        }
      } catch (error) {
        showStatus('❌ Erro ao remover veículo: ' + error.message, 'error');
      } finally {
        btnAdd.disabled = btnRemove.disabled = false;
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

    function populateVehicleSelect() {
      vehicleSelect.innerHTML = '';
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        vehicleSelect.appendChild(option);
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
      await updateVehicleStatusAPI(selectedVehicleCode, vehicleStatusSelect.value);
      closeVehicleStatusModal();
    });
    vehicleStatusCancelBtn.addEventListener('click', closeVehicleStatusModal);
    window.addEventListener('click', (e) => {
      if (e.target === vehicleStatusModal) closeVehicleStatusModal();
    });
    btnAdd.addEventListener('click', addVehicle);
    btnRemove.addEventListener('click', removeVehicle);
    window.addEventListener('load', loadVehiclesFromAPI);
    setInterval(loadVehiclesFromAPI, 10 * 60 * 1000);