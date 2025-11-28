    /* =======================================
        DATA LOADING FIELDS
    ======================================= */
    /* ================== VEHICLES ================== */
    async function fetchVehiclesFromSupabase(corpOperNr = sessionStorage.getItem("currentCorpOperNr")) {
      if (!corpOperNr) return [];
      try {
        const response = await fetch(
          ``${SUPABASE_URL}rest/v1/vehicle_status?select=vehicle&corp_oper_nr=eq.${corpOperNr}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const vehicles = await response.json();
        return vehicles.map(item => item.vehicle);
      } catch (error) {
        console.error('Erro ao carregar veículos do Supabase:', error);
        return [];
      }
    }
    /* ================== FUNÇÃO PARA PREENCHER SELECT ================== */
    function fillSelectWithVehicles(select, vehicles) {
      select.innerHTML = '';
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = '';
      select.appendChild(emptyOption);
      if (!vehicles || vehicles.length === 0) return;
      vehicles.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        select.appendChild(option);
      });
    }
    /* ================== SELECTS ================== */
    async function populateSingleVehicleSelect(select) {
      const vehicles = await fetchVehiclesFromSupabase();
      fillSelectWithVehicles(select, vehicles);
    }
    async function populateIndependentVehicleSelect() {
      const selectId = 'new_vehicle_unavailable';
      const select = document.getElementById(selectId);
      if (!select) return console.warn(`Select com id "${selectId}" não encontrado.`);
      const vehicles = await fetchVehiclesFromSupabase();
      fillSelectWithVehicles(select, vehicles);
    }
    async function populateSitopVehicleSelect() {
      const selectId = 'sitop_veíc';
      const select = document.getElementById(selectId);
      if (!select) return console.warn(`Select com id "${selectId}" não encontrado.`);
      const vehicles = await fetchVehiclesFromSupabase();
      fillSelectWithVehicles(select, vehicles);
    }
    /* ================== ON LOAD ================== */
    document.addEventListener('DOMContentLoaded', async () => {
      await populateIndependentVehicleSelect();
      await populateSitopVehicleSelect();
    });
    /* ===== OCCORRNECE DESCRIPTIONS ====== */
    async function fetchClassOccorrById(classId) {
      try {
        const response = await fetch(``${SUPABASE_URL}rest/v1/class_occorr?select=occorr_descr&class_occorr=eq.${encodeURIComponent(classId)}`, {
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
    /* ============= DISTRICTS ============ */    
    async function fetchDistrictsFromSupabase() {
      try {
        const resp = await fetch(``${SUPABASE_URL}rest/v1/districts_select?select=id,district`, {
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
    async function populateAllDistrictSelects(defaultDistrictId = 8) {
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
    /* ============= COUNCILS ============= */
    async function fetchCouncilsByDistrict(districtId) {
      if (!districtId) return [];
      try {
        const resp = await fetch(``${SUPABASE_URL}rest/v1/councils_select?select=id,council&district_id=eq.${districtId}`, {
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
    async function populateCouncilSelectByDistrict(districtId, triggerSelectId = null) {
      let councilSelects;
      if (triggerSelectId) {
        const councilSelectId = triggerSelectId.replace('district', 'council');
        const specificSelect = document.getElementById(councilSelectId);
        councilSelects = specificSelect ? [specificSelect] : [];
      } else {
        councilSelects = document.querySelectorAll('[id*="council_select"]');
      }
      if (councilSelects.length === 0) return;
      const councils = await fetchCouncilsByDistrict(districtId);
      councilSelects.forEach(sel => {
        sel.innerHTML = '';
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        sel.appendChild(emptyOption);
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
    /* ============= PARISHES ============= */
    async function fetchParishesByCouncil(councilId) {
      if (!councilId) return [];
      try {
        const resp = await fetch(``${SUPABASE_URL}rest/v1/parishes_select?select=parish&council_id=eq.${councilId}`, {
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
    async function populateParishesByCouncil(councilId, triggerSelectId) {
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

    function setupHierarchicalSelects() {
      document.querySelectorAll('[id*="district_select"]').forEach(districtSelect => {
        districtSelect.addEventListener('change', async (e) => {
          const districtId = e.target.value;
          await populateCouncilSelectByDistrict(districtId, e.target.id);
        });
      });
      document.querySelectorAll('[id*="council_select"]').forEach(councilSelect => {
        councilSelect.addEventListener('change', async (e) => {
          const councilId = e.target.value;
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
    document.addEventListener('DOMContentLoaded', async () => {
      const defaultDistrictId = 8;
      console.log('🚀 Inicializando sistema de selects hierárquicos múltiplos...');
      await populateAllDistrictSelects(defaultDistrictId);
      setupHierarchicalSelects();
      const districtSelects = document.querySelectorAll('[id*="district_select"]');
      for (const select of districtSelects) {
        await populateCouncilSelectByDistrict(select.value, select.id);
      }
      console.log('✅ Sistema inicializado com sucesso!');
    });

    function initializeNewSelectGroup(containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return;
      const districtSelects = container.querySelectorAll('[id*="district_select"]');
      const councilSelects = container.querySelectorAll('[id*="council_select"]');
      districtSelects.forEach(select => {
        select.addEventListener('change', async (e) => {
          const districtId = e.target.value;
          await populateCouncilSelectByDistrict(districtId, e.target.id);
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
      districtSelects.forEach(async (select) => {
        await populateAllDistrictSelects(8);
        await populateCouncilSelectByDistrict(select.value, select.id);
      });
    }
    /* ============= VICTIMS ============== */
    async function fetchVictimOptions(category) {
      try {
        const resp = await fetch(``${SUPABASE_URL}rest/v1/static_options?select=value&category=eq.${category}`, {
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
    /* ======== GLOBAL PARAMETRES ========= */
    async function fetchGlobalOptions(category) {
      try {
        const resp = await fetch(``${SUPABASE_URL}rest/v1/static_options?select=value&category=eq.${category}`, {
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
    async function populateGlobalSelects() {
      const globalFields = [{id: 'alert_type', category: 'alert_type'}, {id: 'alert_source', category: 'alert_source'}, {id: 'channel_maneuver', category: 'channel_maneuver'},
                            {id: 'ppi_type', category: 'ppi_type'}, {id: 'solicitation_type', category: 'solicitation_type'}, {id: 'solicitation_motive', category: 'solicitation_motive'},
                            {id: 'solicitation_shift', category: 'solicitation_shift'}, {id: 'new_reason_unavailability', category: 'reason_unavailability'}, {id: 'new_unavailability_local', category: 'local_unavailability'},
                            {id: 'state_municipality_grid', category: 'municipality_grid'}, {id: 'cma_type_01', category: 'cma_type'}, {id: 'cma_type_02', category: 'cma_type'}, {id: 'cma_type_03', category: 'cma_type'},
                            {id: 'cma_type_04', category: 'cma_type'}, {id: 'cma_type_05', category: 'cma_type'}, {id: 'cma_type_06', category: 'cma_type'}, {id: 'win_patent', category: 'patent_choice'},
                            {id: 'service_refusal_type', category: 'refusal_type'}, {id: 'service_refusal_motive', category: 'refusal_motive'}, {id: 'reason_for_ineinop', category: 'refusal_motive'},
                            {id: 'refusals_year_filter', category: 'refusal_year_filter'}, {id: 'ineinop_year_filter', category: 'refusal_year_filter'}, {id: 'refusal_month_filter', category: 'refusal_month_filter'},
                            {id: 'refusal_year_filter', category: 'refusal_year_filter'},{id: 'sitop_type_failure', category: 'sitop_failure_type'},
                            <!---- MOA FIELDS ---->
                            {id: 'moa_cb', category: 'moa_cb_choose'}, {id: 'moa_device_type', category: 'moa_device'}, {id: 'moa_epe_type', category: 'moa_epe_state'},
                            {id: 'moa_eco_sit', category: 'moa_situation'}, {id: 'moa_oco_sit', category: 'moa_situation'}, {id: 'moa_era_sit', category: 'moa_situation'},
                            {id: 'moa_eob_sit', category: 'moa_situation'}, {id: 'moa_mef_sit', category: 'moa_mef_val'},
                            {id: 'moa_eco_pront', category: 'moa_pertime'}, {id: 'moa_ned_pront', category: 'moa_formnot'}, {id: 'moa_oco_pront', category: 'moa_pertime'}, 
                            {id: 'moa_era_pront', category: 'moa_pertime'}, {id: 'moa_eob_pront', category: 'moa_pertime'}, {id: 'moa_rsc_pront', category: 'moa_optref'}];
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