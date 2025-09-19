    /* ==============================
        GRUPO UTILITÁRIOS
     ============================== */
    /* ---- TRATAMENTO SCROLL BAR ----*/
    function showPageAndResetScroll(pageId, {
      smooth = false
    } = {}) {
      document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });
      const page = document.getElementById(pageId);
      if (!page) return;
      page.style.display = 'block';
      page.classList.add('active');
      requestAnimationFrame(() => {
        const main = document.querySelector('.main-content');
        if (main) {
          if (smooth) main.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          else main.scrollTop = 0;
        }
        if (page.scrollTop !== undefined) {
          if (smooth) page.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          else page.scrollTop = 0;
        }
        if (smooth) window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        else window.scrollTo(0, 0);
        clearFormFields();
      });
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.sidebar-menu-button[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const pageId = btn.getAttribute('data-page');
          if (!pageId) return;
          showPageAndResetScroll(pageId, {
            smooth: false
          });
          document.querySelectorAll('.sidebar-menu-button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    });
    /* ---- NAVEGAÇÃO DA SIDEBAR ----*/
    document.addEventListener("DOMContentLoaded", () => {
      const buttons = document.querySelectorAll(".sidebar-menu-button");
      const pages = document.querySelectorAll(".page");

      function hideAllPages() {
        pages.forEach(p => p.classList.remove("active"));
      }

      function removeActiveFromButtons() {
        buttons.forEach(btn => btn.classList.remove("active"));
      }
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          hideAllPages();
          removeActiveFromButtons();
          btn.classList.add("active");
          const page = document.getElementById(btn.getAttribute("data-page"));
          if (page) page.classList.add("active");
          // === AQUI ===
          // Se clicou em "📱 Utilitários", ativa o painel EPE/PPI
          if (btn.getAttribute("data-page") === "page-utilities") {
            const epeButton = document.querySelector('.panel-menu-button[onclick*="showPanelCard(\'epe\'"]');
            if (epeButton) epeButton.click();
            loadVehiclesFromAPI()
            loadInfosFromSupabase()
            loadRoutesFromSupabase()
            loadCMAsFromSupabase()
            loadElemsButtons()
          }
          if (btn.getAttribute("data-page") === "page-data") {
          const elemsButton = document.querySelector('.panel-menu-button[onclick*="showPanelCard(\'assoc\'"]');
          if (elemsButton) elemsButton.click();
          }
        });
      });
    });
    /* ---- OBTENÇÃO E FORMATAÇÃO DE DATAS ----*/
    function padNumber(num) {
      return String(num).padStart(2, '0');
    }

    function getCurrentDateStr() {
      const d = new Date();
      return `${d.getFullYear()}-${padNumber(d.getMonth()+1)}-${padNumber(d.getDate())}`;
    }

    function formatGDH(dateStr, timeStr) {
      if (!dateStr || !timeStr) return '';
      const date = new Date(dateStr + 'T' + timeStr);
      const day = padNumber(date.getDate());
      const hours = padNumber(date.getHours());
      const minutes = padNumber(date.getMinutes());
      const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const month = monthNames[date.getMonth()];
      const year = String(date.getFullYear()).slice(-2);
      return `${day} *${hours}${minutes}* ${month}${year}`;
    }
    /* ---- CARREGAMENTO DE DADOS PARA CAMPOS ---- */
    /* --- Carregamento de Veículos ---*/
    async function fetchVehiclesFromSupabase() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const vehicles = await response.json();
        return vehicles.map(vehicle => vehicle.vehicle);
      } catch (error) {
        console.error('Erro ao carregar veículos do Supabase:', error);
        return fallbackVehicles;
      }
    }
    async function populateSingleVehicleSelect(select) {
      let vehicles = await fetchVehiclesFromSupabase();
      vehicles.sort((a, b) => a.localeCompare(b, 'pt', {
        sensitivity: 'base'
      }));
      select.innerHTML = '<option value=""></option>';
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        select.appendChild(option);
      });
    }
    async function populateIndependentVehicleSelect() {
      const selectId = 'new_vehicle_unavailable';
      const select = document.getElementById(selectId);
      if (!select) return console.warn(`Select com id "${selectId}" não encontrado.`);
      const vehicles = await fetchVehiclesFromSupabase();
      vehicles.sort((a, b) => a.localeCompare(b, 'pt', {
        sensitivity: 'base'
      }));
      select.innerHTML = '<option value=""></option>';
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        select.appendChild(option);
      });
    }
    document.addEventListener('DOMContentLoaded', async () => {
      await populateIndependentVehicleSelect();
    });
    /* --- Tratamento Tipo de Ocorrência --- */
    async function fetchClassOccorrById(classId) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/class_occorr?select=occorr_descr&class_occorr=eq.${encodeURIComponent(classId)}`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.length > 0 ? data[0].occorr_descr : '';
      } catch (error) {
        console.error("Erro ao buscar descrição da classe:", error);
        return '';
      }
    }
    const classOccorrInput = document.getElementById('class_occorr_input');
    if (classOccorrInput) {
      classOccorrInput.addEventListener('input', async (e) => {
        const classId = e.target.value.trim();
        const descrInput = document.getElementById('occorr_descr_input');
        if (!classId) {
          descrInput.value = '';
          return;
        }
        const descr = await fetchClassOccorrById(classId);
        descrInput.value = descr;
      });
    }
    /* --- Sistema de Selects Hierárquicos Múltiplos --- */
    /* --- Busca Distritos --- */
    async function fetchDistrictsFromSupabase() {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/districts_select?select=id,district`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const districts = await resp.json();
        return districts.map(d => ({
          id: d.id,
          name: d.district
        }));
      } catch (e) {
        console.error("Erro ao buscar distritos:", e);
        return fallbackDistricts || [];
      }
    }
    /* --- Popula TODOS os Selects de Distritos --- */
    async function populateAllDistrictSelects(defaultDistrictId = 8) { // Faro = 8
      // Busca TODOS os selects com ID que contenha 'district_select'
      const districtSelects = document.querySelectorAll('[id*="district_select"]');
      if (districtSelects.length === 0) {
        return console.warn("Nenhum select de distritos encontrado");
      }
      console.log(`🔍 Encontrados ${districtSelects.length} select(s) de distritos`);
      const districts = await fetchDistrictsFromSupabase();
      const defaultDistrict = districts.find(d => d.id === defaultDistrictId);
      if (!defaultDistrict) {
        return console.warn(`⚠ Distrito com ID ${defaultDistrictId} não encontrado`);
      }
      const otherDistricts = districts
        .filter(d => d.id !== defaultDistrictId)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt', {
          sensitivity: 'base'
        }));
      const orderedDistricts = [defaultDistrict, ...otherDistricts];
      // Popula CADA select de distrito encontrado
      districtSelects.forEach((sel, index) => {
        sel.innerHTML = '';
        orderedDistricts.forEach(d => {
          const option = document.createElement('option');
          option.value = String(d.id);
          option.textContent = d.name;
          sel.appendChild(option);
        });
        sel.value = String(defaultDistrictId);
        console.log(`✅ Select ${index + 1} (ID: ${sel.id}) - Distrito selecionado: ${sel.options[sel.selectedIndex].textContent}`);
      });
    }
    /* --- Busca Concelhos por Distrito --- */
    async function fetchCouncilsByDistrict(districtId) {
      if (!districtId) return [];
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/councils_select?select=id,council&district_id=eq.${districtId}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const councils = await resp.json();
        return councils.map(c => ({
          id: c.id,
          name: c.council
        }));
      } catch (e) {
        console.error("Erro ao buscar concelhos:", e);
        return fallbackCouncils[districtId] || [];
      }
    }
    /* --- Popula Concelhos Relacionados a um Distrito Específico --- */
    async function populateCouncilSelectsByDistrict(districtId, triggerSelectId = null) {
      // Se um select específico foi o trigger, busca o select de concelho relacionado
      let councilSelects;
      if (triggerSelectId) {
        // Estratégia: busca select com ID similar (troca 'district' por 'council')
        const councilSelectId = triggerSelectId.replace('district', 'council');
        const specificSelect = document.getElementById(councilSelectId);
        councilSelects = specificSelect ? [specificSelect] : [];
      } else {
        // Busca todos os selects de concelho
        councilSelects = document.querySelectorAll('[id*="council_select"]');
      }
      if (councilSelects.length === 0) return;
      const councils = await fetchCouncilsByDistrict(districtId);
      councilSelects.forEach(sel => {
        // Limpa select de concelhos
        sel.innerHTML = '';
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        sel.appendChild(emptyOption);
        // Limpa select de freguesias relacionado
        const parishSelectId = sel.id.replace('council', 'parish');
        const parishSelect = document.getElementById(parishSelectId);
        if (parishSelect) {
          parishSelect.innerHTML = '';
        }
        if (!councils.length) return;
        const orderedC = councils.sort((a, b) => a.name.localeCompare(b.name, 'pt', {
          sensitivity: 'base'
        }));
        orderedC.forEach(c => {
          const option = document.createElement('option');
          option.value = String(c.id);
          option.textContent = c.name;
          sel.appendChild(option);
        });
        console.log(`✅ Concelhos populados para select: ${sel.id}`);
      });
    }
    /* --- Busca Freguesias por Concelho --- */
    async function fetchParishesByCouncil(councilId) {
      if (!councilId) return [];
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/parishes_select?select=parish&council_id=eq.${councilId}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const parishes = await resp.json();
        return parishes.map(p => p.parish);
      } catch (e) {
        console.error("Erro ao buscar freguesias:", e);
        return fallbackParishes[councilId] || [];
      }
    }
    /* --- Popula Freguesias Relacionadas a um Concelho Específico --- */
    async function populateParishesByCouncil(councilId, triggerSelectId) {
      // Busca o select de freguesia relacionado
      const parishSelectId = triggerSelectId.replace('council', 'parish');
      const parishSelect = document.getElementById(parishSelectId);
      if (!parishSelect) return;
      const parishes = (await fetchParishesByCouncil(councilId))
        .sort((a, b) => a.localeCompare(b, 'pt', {
          sensitivity: 'base'
        }));
      parishSelect.innerHTML = '';
      parishes.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        parishSelect.appendChild(option);
      });
      console.log(`✅ Freguesias populadas para select: ${parishSelect.id}`);
    }
    /* --- Configuração de Event Listeners --- */
    function setupHierarchicalSelects() {
      // Event listeners para TODOS os selects de distrito
      document.querySelectorAll('[id*="district_select"]').forEach(districtSelect => {
        districtSelect.addEventListener('change', async (e) => {
          const districtId = e.target.value;
          await populateCouncilSelectsByDistrict(districtId, e.target.id);
        });
      });
      // Event listeners para TODOS os selects de concelho
      document.querySelectorAll('[id*="council_select"]').forEach(councilSelect => {
        councilSelect.addEventListener('change', async (e) => {
          const councilId = e.target.value;
          // Limpa freguesias se não há concelho selecionado
          if (!councilId) {
            const parishSelectId = e.target.id.replace('council', 'parish');
            const parishSelect = document.getElementById(parishSelectId);
            if (parishSelect) {
              parishSelect.innerHTML = '';
            }
            return;
          }
          await populateParishesByCouncil(councilId, e.target.id);
        });
      });
    }
    /* --- Inicialização --- */
    document.addEventListener('DOMContentLoaded', async () => {
      const defaultDistrictId = 8; // Faro
      console.log('🚀 Inicializando sistema de selects hierárquicos múltiplos...');
      // Popula todos os selects de distrito
      await populateAllDistrictSelects(defaultDistrictId);
      // Configura event listeners
      setupHierarchicalSelects();
      // Popula concelhos iniciais para todos os selects de distrito
      const districtSelects = document.querySelectorAll('[id*="district_select"]');
      for (const select of districtSelects) {
        await populateCouncilSelectsByDistrict(select.value, select.id);
      }
      console.log('✅ Sistema inicializado com sucesso!');
    });
    /* --- Função auxiliar para adicionar novos selects dinamicamente --- */
    function initializeNewSelectGroup(containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return;
      const districtSelects = container.querySelectorAll('[id*="district_select"]');
      const councilSelects = container.querySelectorAll('[id*="council_select"]');
      // Adiciona event listeners aos novos selects
      districtSelects.forEach(select => {
        select.addEventListener('change', async (e) => {
          const districtId = e.target.value;
          await populateCouncilSelectsByDistrict(districtId, e.target.id);
        });
      });
      councilSelects.forEach(select => {
        select.addEventListener('change', async (e) => {
          const councilId = e.target.value;
          if (!councilId) {
            const parishSelectId = e.target.id.replace('council', 'parish');
            const parishSelect = document.getElementById(parishSelectId);
            if (parishSelect) parishSelect.innerHTML = '';
            return;
          }
          await populateParishesByCouncil(councilId, e.target.id);
        });
      });
      // Popula os novos selects
      districtSelects.forEach(async (select) => {
        await populateAllDistrictSelects(8); // Faro como padrão
        await populateCouncilSelectsByDistrict(select.value, select.id);
      });
    }
    /* --- Carregamento de vítimas ---*/
    async function fetchVictimOptions(category) {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/static_options?select=value&category=eq.${category}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return data.map(d => d.value).filter(v => v);
      } catch (e) {
        console.error(`Erro ao buscar opções de ${category}:`, e);
        return [];
      }
    }
    async function populateSingleVictimSelect(select, category) {
      const options = await fetchVictimOptions(category);
      select.innerHTML = '<option value=""></option>';
      options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });
    }
    /* --- Carregamento de Parâmetros Globais ---*/
    async function fetchGlobalOptions(category) {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/static_options?select=value&category=eq.${category}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return data.map(d => d.value).filter(v => v); // ignora nulos
      } catch (e) {
        console.error(`Erro ao buscar opções de ${category}:`, e);
        return [];
      }
    }
    async function populateGlobalSelects() {
      const globalFields = [{id: 'alert_type', category: 'alert_type'},
                            {id: 'alert_source', category: 'alert_source'},
                            {id: 'channel_maneuver', category: 'channel_maneuver'},
                            {id: 'ppi_type', category: 'ppi_type'},
                            {id: 'solicitation_type', category: 'solicitation_type'},
                            {id: 'solicitation_motive', category: 'solicitation_motive'},
                            {id: 'solicitation_shift', category: 'solicitation_shift'},
                            {id: 'new_reason_unavailability', category: 'reason_unavailability'},
                            {id: 'new_unavailability_local', category: 'local_unavailability'},
                            {id: 'state_municipality_grid', category: 'municipality_grid'},
                            {id: 'cma_type_01', category: 'cma_type'}, {id: 'cma_type_02', category: 'cma_type'},
                            {id: 'cma_type_03', category: 'cma_type'}, {id: 'cma_type_04', category: 'cma_type'},
                            {id: 'cma_type_05', category: 'cma_type'}, {id: 'cma_type_06', category: 'cma_type'},
                            {id: 'win_patent', category: 'patent_choice'}];
      for (let field of globalFields) {
        const select = document.getElementById(field.id);
        if (!select) {
          console.warn(`Select com id "${field.id}" não encontrado.`);
          continue;
        }
        select.innerHTML = '<option value=""></option>';
        const options = await fetchGlobalOptions(field.category);
        options.forEach(opt => {
          const optionEl = document.createElement('option');
          optionEl.value = opt;
          optionEl.textContent = opt;
          select.appendChild(optionEl);
        });
      }
    }
    document.addEventListener('DOMContentLoaded', populateGlobalSelects);
    /* ---- POPUPUS E AVISOS ----*/
    function showPopupMissingFields(fields) {
      const modal = document.getElementById('popup-modal');
      const list = document.getElementById('missing-fields-list');
      if (!modal || !list) return;
      list.innerHTML = '';
      fields.forEach(f => {
        const li = document.createElement('li');
        li.textContent = f;
        list.appendChild(li);
      });
      modal.classList.add('show');
      const okBtn = document.getElementById('popup-ok-btn');
      if (okBtn) okBtn.onclick = () => modal.classList.remove('show');
    }

    function showPopupSuccess(message = "", clearFields = false) {
      const modal = document.getElementById('popup-success-modal');
      if (!modal) return;
      const textElem = modal.querySelector('p');
      if (textElem) textElem.textContent = message;
      modal.classList.add('show');
      const okBtn = document.getElementById('popup-success-ok-btn');
      if (okBtn) {
        okBtn.onclick = () => {
          modal.classList.remove('show');
          if (clearFields) clearFormFields();
        };
      }
    }

    function showPopupWarning(message) {
      const modal = document.getElementById('popup-warning-modal');
      if (!modal) return;
      const textElem = modal.querySelector('p');
      if (textElem) textElem.textContent = message;
      modal.classList.add('show');
      const okBtn = document.getElementById('popup-warning-ok-btn');
      if (okBtn) okBtn.onclick = () => modal.classList.remove('show');
    }
