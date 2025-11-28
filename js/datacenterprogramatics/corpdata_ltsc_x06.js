/* =======================================
            DATA CENTER
    ======================================= */
    /* =======================================
            CORPORATION DATA
    ======================================= */
    async function checkExistingCorporation() {
      try {
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?select=id&corp_oper_nr=eq.${currentCorpNr}&limit=1`, { 
            headers: getSupabaseHeaders() }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error('Erro ao verificar corporação existente:', error);
        return null;
      }
    }
    
    async function loadCorporationData() {
      try {
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        if (!currentCorpNr) {
          console.warn('⚠️ Nenhuma corporação identificada. Faça login novamente.');
          return;
        }
        const response = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${encodeURIComponent(currentCorpNr)}&select=*`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.length) {
          console.log(`ℹ️ Nenhum dado de corporação encontrado para corpOperNr: ${currentCorpNr}`);
          return;
        }
        const corporation = data[0];
        document.getElementById('assoc-nome').value = corporation.corporation || '';
        document.getElementById('assoc-morada').value = corporation.corp_adress || '';
        document.getElementById('assoc-localidade').value = corporation.corp_localitie || '';
        document.getElementById('assoc-nif').value = corporation.corp_fiscal_nr || '';
        document.getElementById('assoc-operacional').value = corporation.corp_oper_nr || '';
        const { cp1, cp2 } = splitPostalCode(corporation.corp_cp);
        document.getElementById('assoc-cp1').value = cp1;
        document.getElementById('assoc-cp2').value = cp2;
        await loadHierarchicalSelects(corporation);
        console.log('✅ Dados da corporação carregados para corpOperNr:', currentCorpNr);
      } catch (error) {
        console.error('❌ Erro ao carregar dados da corporação:', error);
      }
    }

    async function loadCorporationLogo() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");        
        if (!corpOperNr) {
          console.warn("currentCorpOperNr não encontrado no sessionStorage. Não foi possível carregar o logo.");
          return;
        }
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?select=logo_url&corp_oper_nr=eq.${corpOperNr}&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );        
        const data = await response.json();        
        if (data && data.length > 0) {
          const corp = data[0];
          if (corp.logo_url) {
            document.querySelector('.data-logo').src = corp.logo_url;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar logo da corporação:", error);
      }
    }    
    document.addEventListener('DOMContentLoaded', loadCorporationLogo);
    
    async function saveCorporationData() {
      const saveButton = document.querySelector('button[onclick="saveCorporationData()"]');
      const originalText = saveButton ? saveButton.textContent : 'ATUALIZAR';
      try {
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.textContent = 'A SALVAR...';
        }
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        const corporationData = {
          corporation: document.getElementById('assoc-nome')?.value?.trim() || null,
          corp_adress: document.getElementById('assoc-morada')?.value?.trim() || null,
          corp_localitie: document.getElementById('assoc-localidade')?.value?.trim() || null,
          corp_cp: getCombinedPostalCode(),
          corp_district: getSelectedDistrictName(),
          corp_council: getSelectedCouncilName(),
          corp_parish: document.getElementById('parish_select_corp')?.value?.trim() || null,
          corp_fiscal_nr: document.getElementById('assoc-nif')?.value?.trim() || null,
          corp_oper_nr: currentCorpNr || document.getElementById('assoc-operacional')?.value?.trim() || null
        };
        const validation = validateCorporationData(corporationData);
        if (!validation.isValid) throw new Error(validation.message);
        let response;
        const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${encodeURIComponent(corporationData.corp_oper_nr)}&select=id&limit=1`, {
          headers: getSupabaseHeaders()
        });
        const existingData = await existingResponse.json();
        if (existingData.length > 0) {
          response = await updateCorporationData(existingData[0].id, corporationData);
        } else {
          response = await createCorporationData(corporationData);
        }
        showSuccessMessage('Dados da corporação salvos com sucesso!');
        console.log('✅ Dados salvos:', corporationData);
      } catch (error) {
        console.error('❌ Erro ao salvar dados da corporação:', error);
        showErrorMessage(error.message || 'Erro ao salvar dados da corporação');
      } finally {
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = originalText;
        }
      }
    }
    
    async function createCorporationData(data) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data`, {
        method: 'POST',
        headers: {
          ...getSupabaseHeaders(),
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ao criar corporação: ${response.status} - ${errorData}`);
      }
      return await response.json();
    }
    
    async function updateCorporationData(id, data) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          ...getSupabaseHeaders(),
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ao atualizar corporação: ${response.status} - ${errorData}`);
      }
      return await response.json();
    }

    function splitPostalCode(fullPostalCode) {
      if (!fullPostalCode) return {cp1: '', cp2: ''};
      if (fullPostalCode.includes('-')) {
        const [cp1, cp2] = fullPostalCode.split('-');
        return {cp1: cp1 || '', cp2: cp2 || ''};
      }
      if (fullPostalCode.length === 7 && /^\d{7}$/.test(fullPostalCode)) {
        return {cp1: fullPostalCode.substring(0, 4), cp2: fullPostalCode.substring(4, 7)};
      }
      return {cp1: fullPostalCode, cp2: ''};
    }
    
    function getCombinedPostalCode() {
      const cp1 = document.getElementById('assoc-cp1')?.value?.trim();
      const cp2 = document.getElementById('assoc-cp2')?.value?.trim();
      if (cp1 && cp2) {
        return `${cp1}-${cp2}`;
      }
      return cp1 || cp2 || null;
    }

    function getSelectedDistrictName() {
      const districtSelect = document.getElementById('district_select_corp');
      if (!districtSelect || !districtSelect.value || districtSelect.value === '') return null;
      const selectedOption = districtSelect.options[districtSelect.selectedIndex];
      return selectedOption ? selectedOption.textContent.trim() : null;
    }

    function getSelectedCouncilName() {
      const councilSelect = document.getElementById('council_select_corp');
      if (!councilSelect || !councilSelect.value || councilSelect.value === '') return null;
      const selectedOption = councilSelect.options[councilSelect.selectedIndex];
      return selectedOption ? selectedOption.textContent.trim() : null;
    }

    function validateCorporationData(data) {
      if (!data.corporation) {
        return {isValid: false, message: 'Nome da corporação é obrigatório'};
      }
      if (!data.corp_fiscal_nr) {
        return {isValid: false, message: 'NIF é obrigatório'};
      }
      if (data.corp_fiscal_nr && !/^\d{9}$/.test(data.corp_fiscal_nr.replace(/\s/g, ''))) {
        return {isValid: false, message: 'NIF deve ter 9 dígitos'};
      }
      if (!data.corp_oper_nr) {
        return {isValid: false, message: 'Número Operacional da corporação é obrigatório'};
      }
      if (data.corp_cp && !/^\d{4}-\d{3}$/.test(data.corp_cp)) {
        return {isValid: false, message: 'Código postal deve ter o formato XXXX-XXX'};
      }
      return {isValid: true};
    }
    
    async function findDistrictIdByName(districtName) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/districts_select?select=id&district=eq.${encodeURIComponent(districtName)}`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.length > 0 ? data[0].id : null;
      } catch (error) {
        console.error('Erro ao buscar ID do distrito:', error);
        return null;
      }
    }
    
    async function findCouncilIdByName(councilName) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/councils_select?select=id&council=eq.${encodeURIComponent(councilName)}`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.length > 0 ? data[0].id : null;
      } catch (error) {
        console.error('Erro ao buscar ID do concelho:', error);
        return null;
      }
    }
    
    async function loadHierarchicalSelects(corporation) {
      try {
        if (corporation.corp_district) {
          const districtId = await findDistrictIdByName(corporation.corp_district);
          if (districtId) {
            document.getElementById('district_select_corp').value = districtId;
            await populateCouncilSelectByDistrict(districtId, 'district_select_corp');
          }
        }
        if (corporation.corp_council) {
          const councilId = await findCouncilIdByName(corporation.corp_council);
          if (councilId) {
            document.getElementById('council_select_corp').value = councilId;
            await populateParishesByCouncil(councilId, 'council_select_corp');
          }
        }
        if (corporation.corp_parish) {
          document.getElementById('parish_select_corp').value = corporation.corp_parish;
        }
      } catch (error) {
        console.error('❌ Erro ao carregar selects hierárquicos:', error);
      }
    }
    
    function showSuccessMessage(message) {
      alert(`${message}`);
    }

    function showErrorMessage(message) {
      alert(`❌ ${message}`);
    }
    
    document.addEventListener('DOMContentLoaded', async () => {
      setTimeout(async () => {
        await loadCorporationData();
      }, 1000);
    });

    function showPanelCard(panelId) {
      document.querySelectorAll(".panel-card").forEach(el => el.classList.remove("active"));
      document.getElementById(`panel-${panelId}`).classList.add("active");
      document.querySelectorAll(".panel-sidebar-menu-button").forEach(btn => btn.classList.remove("active"));
      const activeBtn = document.querySelector(`.panel-sidebar-menu-button[onclick="showPanelCard('${panelId}')"]`);
      if (activeBtn) activeBtn.classList.add("active");
      if (panelId === "assoc") {
        loadCorporationData();
      }
    }
