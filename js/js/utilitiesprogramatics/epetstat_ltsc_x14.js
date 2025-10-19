    /* =======================================
            SPECIAL READINESS STATES
    ======================================= */
    /* ========== COLOR CONTROL EPE ========== */
    class EPEButtonColorManager {
      constructor(supabaseUrl, supabaseKey) {
        this.SUPABASE_URL = supabaseUrl;
        this.SUPABASE_ANON_KEY = supabaseKey;
        const epeColors = [{bg: 'green', text: 'white'}, {bg: 'blue', text: 'white'}, {bg: 'yellow', text: 'black'}, {bg: 'orange', text: 'black'}, {bg: 'red', text: 'white'}, {bg: 'lightgrey', text: 'black'}];
        const ppiAeroColors = [{bg: 'green', text: 'white'}, {bg: 'yellow', text: 'black'}, {bg: 'red', text: 'white'}, {bg: 'lightgrey', text: 'black'}, {bg: 'lightgrey', text: 'black'}, {bg: 'lightgrey', text: 'black'}];
        const ppiA22LinferColors = [{bg: 'green', text: 'white'}, {bg: 'yellow', text: 'black'}, {bg: 'orange', text: 'black'}, {bg: 'red', text: 'white'}, {bg: 'lightgrey', text: 'black'}, {bg: 'lightgrey', text: 'black'}];
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
            headers: getSupabaseHeaders({
              returnRepresentation: true
            }),
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