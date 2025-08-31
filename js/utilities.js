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
    
    const API_URL = 'https://geostat-360-api.vercel.app/api/vehicle_control';
    let currentVehicleList = [];
    let vehicleStatuses = {};
    let vehicleINOP = {};
    async function loadVehiclesFromAPI() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        if (data.success && data.vehicles && Array.isArray(data.vehicles)) {
          currentVehicleList = data.vehicles.sort();
          if (data.vehicleStatuses) vehicleStatuses = data.vehicleStatuses;
          if (data.vehicleINOP) vehicleINOP = data.vehicleINOP;
          generateVehicleButtons(currentVehicleList);
          document.getElementById('vehicleStatus').style.display = 'none';
          updateVehicleButtonColors();
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (e) {
        loadBackupVehicles();
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
        btn.addEventListener('click', () => {
          showVehicleStatusPopup(vehicleCode);
        });
        vehicleGrid.appendChild(btn);
      });
    }

    function getVehicleIcon(type) {
      const icons = {'VCOT': '🚒', 'VCOC': '🚒', 'VTTP': '🚒', 'VFCI': '🚒', 'VECI': '🚒', 'VRCI': '🚒', 'VUCI': '🚒', 'VSAT': '🚒', 'VSAE': '🚒', 'VTTU': '🚒', 
                     'VTTF': '🚒', 'VTTR': '🚒', 'VALE': '🚒', 'VOPE': '🚒', 'VETA': '🚒', 'ABCI': '🚑', 'ABSC': '🚑', 'ABTM': '🚑', 'ABTD': '🚑', 'VDTD': '🚑'};
      return icons[type] || '🚗';}    
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
    window.addEventListener('load', async () => {
      await loadVehiclesFromAPI();
      await loadVehicleStatuses();
    });
    setInterval(loadVehicleStatuses, 5000);
