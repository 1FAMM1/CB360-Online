/* ===============================
       GRUPO CONSOLA DO PAINEL DIGITAL      
    =============================== */
    /* ---- CONTROLO DOS BOTÕES DA SIDEBAR ----*/
    function showPanelCard(cardId) {
      const allCards = document.querySelectorAll('.panel-card');
      allCards.forEach(card => {
        card.classList.remove('active');
      });
      const allButtons = document.querySelectorAll('.panel-menu-button');
      allButtons.forEach(button => {
        button.classList.remove('active');
      });
      document.getElementById('panel-' + cardId).classList.add('active');
      event.target.classList.add('active');
    }
    /* ---- ESTADOS DE PRONTIDÃO ESPECIAL ----*/
    /* --- Controlo de Cores EPE ---*/
    class EPEButtonColorManager {
      constructor(supabaseUrl, supabaseKey) {
        this.SUPABASE_URL = supabaseUrl;
        this.SUPABASE_ANON_KEY = supabaseKey;
        const epeColors = [{bg: 'green', text: 'white'},
                           {bg: 'blue', text: 'white'},
                           {bg: 'yellow', text: 'black'},
                           {bg: 'orange', text: 'black'},
                           {bg: 'red', text: 'white'},
                           {bg: 'lightgrey',text: 'black'}];
        const ppiAeroColors = [{bg: 'green', text: 'white'},
                               {bg: 'yellow', text: 'black'},
                               {bg: 'red', text: 'white'},
                               {bg: 'lightgrey', text: 'black'},
                               {bg: 'lightgrey', text: 'black'},
                               {bg: 'lightgrey', text: 'black'}];
        const ppiA22LinferColors = [{bg: 'green', text: 'white'},
                                    {bg: 'yellow', text: 'black'},
                                    {bg: 'orange', text: 'black'},
                                    {bg: 'red', text: 'white'},
                                    {bg: 'lightgrey', text: 'black'},
                                    {bg: 'lightgrey', text: 'black'}];
        this.buttonColors = {"epe-decir": epeColors, "epe-diops": epeColors, "epe-nrbq": epeColors, "ppi-aero": ppiAeroColors, "ppi-a22": ppiA22LinferColors, "ppi-linfer": ppiA22LinferColors};
        this.initializeButtons();
      }
      initializeButtons() {
        Object.keys(this.buttonColors).forEach(containerId => {
          const container = document.getElementById(containerId);
          if (!container) return;
          const buttons = container.querySelectorAll('.panel-btn');
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
        container.querySelectorAll('.panel-btn').forEach(btn => {
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
      }
      async saveToSupabase(epe_type, epe_value) {
        try {
          const body = {
            epe: epe_value
          };
          const resp = await fetch(`${this.SUPABASE_URL}/rest/v1/epe_status?epe_type=eq.${encodeURIComponent(epe_type)}`, {
            method: 'PATCH',
            headers: {
              'apikey': this.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(body)
          });
          if (!resp.ok) {
            console.error('Erro ao atualizar EPE no Supabase', resp.status, await resp.text());
          } else {
            console.log(`EPE atualizado: ${epe_type} = ${epe_value}`);
          }
        } catch (e) {
          console.error('Erro na requisição Supabase:', e);
        }
      }
      async loadFromSupabase() {
        try {
          const resp = await fetch(`${this.SUPABASE_URL}/rest/v1/epe_status`, {
            headers: getSupabaseHeaders()
          });
          if (!resp.ok) throw new Error(`Erro ao ler EPE: ${resp.status}`);
          const data = await resp.json();
          data.forEach(row => {
            const containerId = row.epe_type;
            const epeValue = row.epe;
            const container = document.getElementById(containerId);
            if (!container) return;
            const buttons = container.querySelectorAll('.panel-btn');
            buttons.forEach((btn, index) => {
              if (btn.textContent.trim() === epeValue) {
                const colors = this.buttonColors[containerId][index];
                btn.style.backgroundColor = colors.bg;
                btn.style.color = colors.text;
                btn.dataset.active = 'true';
              } else {
                btn.style.backgroundColor = 'lightgrey';
                btn.style.color = 'black';
                btn.dataset.active = 'false';
              }
            });
          });
        } catch (e) {
          console.error('Erro ao carregar estados do Supabase:', e);
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
    /* ---- ESTADOS OPERACIONAIS DE VEÍCULOS ----*/
    /* --- Controlo de Status de Veículos ---*/
        const API_URL = 'https://geostat-360-api.vercel.app/api/vehicle_control';
    let currentVehicleList = [];
    let vehicleStatuses = {};
    let vehicleINOP = {};
    let selectedVehicleCode = null;
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

    function updateVehicleButtonColors() {
      document.querySelectorAll('.vehicle-btn').forEach(btn => {
        const vehicleCode = btn.dataset.vehicle;
        if (!vehicleCode) return;
        btn.classList.remove('inop', 'em-servico');
        if (vehicleINOP[vehicleCode] === true) {
          btn.classList.add('inop');
        } else if (vehicleStatuses[vehicleCode] === 'Em Serviço') {
          btn.classList.add('em-servico');
        }
      });
    }
    async function loadVehiclesFromAPI() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.vehicles)) {
          const typeOrder = {'VCOT': 1, 'VCOC': 2, 'VTTP': 3, 'VFCI': 4, 'VECI': 5, 'VRCI': 6, 'VUCI': 7, 'VSAT': 8, 'VSAE': 9, 'VTTU': 10,
                             'VTTF': 11, 'VTTR': 12, 'VALE': 13, 'VOPE': 14, 'VETA': 15,  'ABSC': 20, 'ABCI': 21, 'ABTM': 22, 'ABTD': 23, 'VDTD': 24};
          currentVehicleList = data.vehicles.sort((a, b) => {
            const [typeA, numA] = a.split('-');
            const [typeB, numB] = b.split('-');
            const orderA = typeOrder[typeA] || 999;
            const orderB = typeOrder[typeB] || 999;
            if (orderA === orderB) {
              return parseInt(numA) - parseInt(numB);
            }
            return orderA - orderB;
          });
          vehicleStatuses = data.vehicleStatuses || {};
          vehicleINOP = data.vehicleINOP || {};
          generateVehicleButtons(currentVehicleList);
          updateVehicleButtonColors();
          document.getElementById('vehicleStatus').style.display = 'none';
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (e) {
        console.error('❌ Erro ao carregar veículos:', e);
      }
    }
    async function loadVehicleStatuses() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.success) {
          vehicleStatuses = data.vehicleStatuses || {};
          vehicleINOP = data.vehicleINOP || {};
          updateVehicleButtonColors();
        }
      } catch (error) {
        console.error('Erro ao carregar status:', error);
      }
    }
    async function updateVehicleStatusAPI(vehicleCode, newStatus) {
      let dados = {};
      if (newStatus === "Inop") {
        dados.inop = true;
      } else if (newStatus === "Em Serviço") {
        dados.current_status = "Em Serviço";
        dados.inop = false;
      } else {
        dados.inop = false;
        dados.current_status = "Disponível no Quartel";
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
          if (dados.inop) {
            vehicleINOP[vehicleCode] = true;
            vehicleStatuses[vehicleCode] = "Inop";
          } else {
            vehicleINOP[vehicleCode] = false;
            vehicleStatuses[vehicleCode] = dados.current_status;
          }
          updateVehicleButtonColors();
        } else {
          alert('Erro ao atualizar status: ' + (result.error || 'Desconhecido'));
        }
      } catch (error) {
        alert('Erro na requisição: ' + error.message);
      }
    }
    function generateVehicleButtons(vehicles) {
      const vehicleGrid = document.getElementById('vehicleGrid');
      vehicleGrid.innerHTML = '';
      vehicles.forEach(vehicleCode => {
        const type = vehicleCode.split('-')[0];
        const icon = getVehicleIcon(type);
        const btn = document.createElement('div');
        const typeClass = type.toLowerCase();
        btn.className = `vehicle-btn ${typeClass}`;
        btn.dataset.vehicle = vehicleCode;
        btn.innerHTML = `<span class="vehicle-icon">${icon}</span><div class="vehicle-code">${vehicleCode}</div>`;
        btn.addEventListener('click', () => openVehicleStatusModal(vehicleCode));
        vehicleGrid.appendChild(btn);
      });
    }

    function openVehicleStatusModal(vehicleCode) {
      selectedVehicleCode = vehicleCode;
      vehicleStatusTitle.textContent = `${vehicleCode}`;
      if (vehicleINOP[vehicleCode]) {
        vehicleStatusSelect.value = "Inop";
      } else if (vehicleStatuses[vehicleCode] === "Em Serviço") {
        vehicleStatusSelect.value = "Em Serviço";
      } else {
        vehicleStatusSelect.value = "Disponível no Quartel";
      }
      vehicleStatusModal.classList.add('show');
    }

    function closeVehicleStatusModal() {
      vehicleStatusModal.classList.remove('show');
      selectedVehicleCode = null;
    }
    vehicleStatusOkBtn.addEventListener('click', async () => {
      if (!selectedVehicleCode) return;
      const newStatus = vehicleStatusSelect.value;
      await updateVehicleStatusAPI(selectedVehicleCode, newStatus);
      closeVehicleStatusModal();
    });
    vehicleStatusCancelBtn.addEventListener('click', closeVehicleStatusModal);
    window.addEventListener('click', (e) => {
      if (e.target === vehicleStatusModal) closeVehicleStatusModal();
    });
    window.addEventListener('load', async () => {
      await loadVehiclesFromAPI();
      await loadVehicleStatuses();
    });
    // Atualização automática a cada 5s
    setInterval(loadVehicleStatuses, 5000);
