    /*========================================
    SIDEBAR NAVIGATION
    ========================================*/
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        item.classList.add('active');
        const sectionId = item.dataset.section;
        document.getElementById(sectionId).classList.add('active');
      });
    });
    /*========================================
    TOASTER's
    ========================================*/
    function showToast(message, type = 'success', duration = 3000) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 100);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 500);
      }, duration);
    }
    /* =======================================
    ADD NEW CORPORATIONS
    ======================================= */
    document.addEventListener('DOMContentLoaded', () => {
      const addLogoBtn = document.getElementById('add-logo-btn');
      const logoInput = document.getElementById('logo-input');
      const corpLogoImg = document.getElementById('corp-logo');
      const modal = document.getElementById('logoWarningModal');
      const confirmBtn = document.getElementById('modalConfirmBtn');
      const closeBtn = modal ? modal.querySelector('.close-btn') : null;
      if (addLogoBtn && logoInput && corpLogoImg && modal && confirmBtn) {
        addLogoBtn.addEventListener('click', (e) => {
          e.preventDefault();
          modal.style.display = 'block';
        });
        confirmBtn.addEventListener('click', () => {
          modal.style.display = 'none';
          logoInput.click();
        });
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
          });
        }
        window.addEventListener('click', (event) => {
          if (event.target == modal) {
            modal.style.display = 'none';
          }
        });
        logoInput.addEventListener('change', (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => (corpLogoImg.src = e.target.result);
            reader.readAsDataURL(file);
          }
        });
      }
      initHierarchicalSelects();
    });
    /* =========== RESIZE E COMPRESS LOGO ========== */
    function resizeAndCompressImage(file, maxWidth = 512, maxHeight = 512, quality = 1.0) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            let type = 'image/jpeg';
            if (file.type === 'image/png') type = 'image/png';
            if (file.type === 'image/webp') type = 'image/webp';
            canvas.toBlob(
              (blob) => resolve(blob),
              type,
              type === 'image/jpeg' ? quality : 1
            );
          };
          img.onerror = (err) => reject(err);
          img.src = event.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }
    /* ====== UPLOAD LOGO TO SUPABASE STORAGE ====== */
    async function uploadLogoToSupabase(file, corpOperNr) {
      try {
        const resizedBlob = await resizeAndCompressImage(file);
        const fileExt = file.type.split('/')[1];
        const fileName = `logo_cb_${corpOperNr}.${fileExt}`;
        const {
          data,
          error
        } = await supabase.storage
          .from('cb_logos')
          .upload(fileName, resizedBlob, {
            upsert: true
          });
        if (error) {
          console.error("❌ Erro no Upload para Storage:", error.message);
          throw error;
        }
        const {
          data: urlData,
          error: urlError
        } = supabase
          .storage
          .from('cb_logos')
          .getPublicUrl(fileName);
        if (urlError) {
          console.error("❌ ERRO NO GET PUBLIC URL (Verificar políticas RLS):", urlError.message);
          throw urlError;
        }
        return urlData.publicUrl;
      } catch (err) {
        console.error("❌ Erro GERAL ao processar logo:", err.message);
        showErrorMessage(`Erro ao enviar logo: ${err.message}. Verifique o console.`);
        return null;
      }
    }
    /* ============== LOAD DISTRICTS =============== */
    async function loadDistricts(selectId) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/districts_select?select=id,district`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">Selecione o Distrito...</option>`;
        data.forEach((d) => {
          const opt = document.createElement("option");
          opt.value = d.id;
          opt.textContent = d.district;
          select.appendChild(opt);
        });
      } catch (error) {
        console.error("Erro ao carregar Distritos:", error);
      }
    }
    async function findDistrictIdByName(districtName) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/districts_select?select=id&district=eq.${encodeURIComponent(districtName)}`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        return data.length ? data[0].id : null;
      } catch (error) {
        console.error("Erro ao buscar ID do distrito:", error);
        return null;
      }
    }
    function getSelectedDistrictName() {
      const districtSelect = document.getElementById('district_select_corp');
      if (!districtSelect || !districtSelect.value) return null;
      return districtSelect.options[districtSelect.selectedIndex].textContent.trim();
    }
    /* =============== LOAD COUNCILS =============== */
    async function populateCouncilSelectByDistrict(districtId, selectId) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/councils_select?select=id,council&district_id=eq.${districtId}`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">Selecione o Concelho...</option>`;
        data.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = c.council;
          select.appendChild(opt);
        });
        document.getElementById("parish_select_corp").innerHTML = `<option value="">Selecione a Freguesia...</option>`;
      } catch (error) {
        console.error("Erro ao carregar Concelhos:", error);
      }
    }
    async function findCouncilIdByName(councilName) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/councils_select?select=id&council=eq.${encodeURIComponent(councilName)}`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        return data.length ? data[0].id : null;
      } catch (error) {
        console.error("Erro ao buscar ID do concelho:", error);
        return null;
      }
    }
    function getSelectedCouncilName() {
      const councilSelect = document.getElementById('council_select_corp');
      if (!councilSelect || !councilSelect.value) return null;
      return councilSelect.options[councilSelect.selectedIndex].textContent.trim();
    }
    /* =============== LOAD PARISHES =============== */
    async function populateParishesByCouncil(councilId, selectId) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/parishes_select?select=id,parish&council_id=eq.${councilId}`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">Selecione a Freguesia...</option>`;
        data.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = p.parish;
          select.appendChild(opt);
        });
      } catch (error) {
        console.error("Erro ao carregar Freguesias:", error);
      }
    }
    function getSelectedParishName() {
      const parishSelect = document.getElementById('parish_select_corp');
      if (!parishSelect || !parishSelect.value) return null;
      return parishSelect.options[parishSelect.selectedIndex].textContent.trim();
    }
    /* ========= LOAD HIERARCHICAL SELECTS ========= */
    async function initHierarchicalSelects() {
      await loadDistricts("district_select_corp");
      document.getElementById("district_select_corp").addEventListener("change", async (e) => {
        if (e.target.value) {
          await populateCouncilSelectByDistrict(e.target.value, "council_select_corp");
        }
      });
      document.getElementById("council_select_corp").addEventListener("change", async (e) => {
        if (e.target.value) {
          await populateParishesByCouncil(e.target.value, "parish_select_corp");
        }
      });
    }
    /* =========== POSTAL CODE FUNCTIONS =========== */
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
        if (/^\d{4}$/.test(cp1) && /^\d{3}$/.test(cp2)) {
          return `${cp1}-${cp2}`;
        } else {
          return null;
        }
      }
      if (cp1 && /^\d{4}$/.test(cp1)) return cp1;
      if (cp2 && /^\d{3}$/.test(cp2)) return cp2;
      return null;
    }
    /* ============ VALIDATION FUNCTION ============ */
    function validateCorporationData(data) {
      for (let key in data) {
        if (typeof data[key] === "string") {
          data[key] = data[key].trim();
        }
      }
      if (!data.corporation) return {isValid: false, message: 'O nome da corporação é de caracter obrigatório'};
      if (!data.corp_adress) return {isValid: false, message: 'A morada da corporação é de caracter obrigatório'};
      if (!data.corp_localitie) return {isValid: false, message: 'A localidade da corporação é de caracter obrigatório'};
      if (!data.corp_cp) return {isValid: false, message: 'O código postal da corporação é de caracter obrigatório'};
      if (data.corp_cp && !/^\d{4}-\d{3}$/.test(data.corp_cp)) return {isValid: false, message: 'Código postal deve ter o formato XXXX-XXX'};
      if (!data.corp_district) return {isValid: false, message: 'O distrito da corporação é de caracter obrigatório'};
      if (!data.corp_council) return {isValid: false, message: 'O concelho da corporação é de caracter obrigatório'};
      if (!data.corp_parish) return {isValid: false, message: 'A freguesia da corporação é de caracter obrigatório'};
      if (!data.corp_fiscal_nr) return {isValid: false, message: 'O NIF da corporação é de caracter obrigatório'};
      if (!/^\d{9}$/.test(data.corp_fiscal_nr)) return {isValid: false, message: 'O NIF da corporação deve ter 9 dígitos'};
      if (!data.corp_oper_nr) return {isValid: false, message: 'O número Operacional da corporação é de caracter obrigatório'};
      return {isValid: true};
    }
    /* ============= SAVE CORPORATION ============== */
    async function saveCorporationDataWithLogo() {
      const saveButton = document.querySelector('button[onclick="saveCorporationDataWithLogo()"]');
      const originalText = saveButton ? saveButton.textContent : 'A GRAVAR...';
      try {
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.textContent = 'A GRAVAR...';
        }
        const corpOperNr = document.getElementById('assoc-operacional')?.value?.trim() || null;
        const logoInput = document.getElementById('logo-input');
        const corporationData = {
          corporation: document.getElementById('assoc-name')?.value?.trim() || null,
          corp_adress: document.getElementById('assoc-address')?.value?.trim() || null,
          corp_localitie: document.getElementById('assoc-locality')?.value?.trim() || null,
          corp_cp: getCombinedPostalCode(),
          corp_district: getSelectedDistrictName(),
          corp_council: getSelectedCouncilName(),
          corp_parish: getSelectedParishName(),
          corp_fiscal_nr: document.getElementById('assoc-nif')?.value?.trim() || null,
          corp_oper_nr: corpOperNr,
          logo_url: null,
          allowed_modules: ""
        };
        const validation = validateCorporationData(corporationData);
        if (!validation.isValid) throw new Error(validation.message);
        if (logoInput?.files?.length > 0) {
          corporationData.logo_url = await uploadLogoToSupabase(logoInput.files[0], corpOperNr);
        }
        const checkUrl = `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corpOperNr}&select=id`;
        const checkRes = await fetch(checkUrl, {
          headers: getSupabaseHeaders()
        });
        const existing = await checkRes.json();
        if (existing.length > 0) throw new Error("Número Operacional já registado!");
        const response = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data`, {
          method: "POST",
          headers: getSupabaseHeaders({
            returnRepresentation: true
          }),
          body: JSON.stringify(corporationData)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao inserir na base de dados");
        }
        showSuccessMessage('Dados da corporação gravados com sucesso!');
        loadCorporations();
      } catch (err) {
        console.error(err);
        showErrorMessage(err.message || "Erro ao gravar dados");
      } finally {
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = originalText;
        }
      }
    }
    /* =======================================
    GRANTING OF ACCESS BY CORPORATION
    ======================================= */
    /* ============= LOAD CORPORATIONS ============= */
    async function loadCorporations() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data`, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error("Erro ao buscar corporações");
        let corps = await res.json();
        corps.sort((a, b) => {
          if (a.corp_oper_nr < b.corp_oper_nr) return -1;
          if (a.corp_oper_nr > b.corp_oper_nr) return 1;
          return 0;
        });
        const tbody = document.querySelector("#corpTable tbody");
        tbody.innerHTML = "";
        corps.forEach(corp => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${corp.corp_oper_nr}</td>
            <td>${corp.corporation}</td>
            <td><span class="edit-icon" data-corpid="${corp.id}">✏️</span></td>
          `;
          tbody.appendChild(tr);
          const trTree = document.createElement("tr");
          const tdTree = document.createElement("td");
          tdTree.colSpan = 3;
          tdTree.className = "checkbox-cell";
          tdTree.style.display = "none";
          const containerDiv = document.createElement("div");
          containerDiv.className = "checkbox-container";
          containerDiv.dataset.corpid = corp.id;
          const allowedModules = (corp.allowed_modules || "")
            .split(",")
            .map(s => s.trim());
          modulesHierarchy.forEach(parent =>
            createCheckboxTree(parent, containerDiv, 0, allowedModules)
          );
          const saveBtn = document.createElement("button");
          saveBtn.className = "save-btn";
          saveBtn.textContent = "Gravar Acessos";
          saveBtn.addEventListener("click", () =>
            saveAccesses(corp.id, containerDiv)
          );
          containerDiv.appendChild(saveBtn);
          tdTree.appendChild(containerDiv);
          trTree.appendChild(tdTree);
          tbody.appendChild(trTree);
          const icon = tr.querySelector(".edit-icon");
          icon.addEventListener("click", () => {
            const cell = tdTree;
            document.querySelectorAll("td.checkbox-cell").forEach(c => {
              if (c !== cell) {
                c.style.display = "none";
                const prevRow = c.previousElementSibling;
                if (prevRow) prevRow.classList.remove("active-corp");
              }
            });
            const isOpening = cell.style.display === "none";
            cell.style.display = isOpening ? "table-cell" : "none";
            document.querySelectorAll("#corpTable tbody tr").forEach(r => {
              if (r !== tr && !r.classList.contains("checkbox-cell")) {
                r.classList.remove("active-corp");
              }
            });
            if (isOpening) tr.classList.add("active-corp");
            else tr.classList.remove("active-corp");
          });
        });
      } catch (err) {
        showErrorMessage("Erro ao carregar corporações.");
        console.error(err);
      }
    }
    /* ============ CHECKBOX HIERARCHY ============= */
    const modulesHierarchy = [
      {name: "Menu Principal"},
      {name: 'Gestão Financeira', children: [
        {name: 'Atualização de Valores'},
          {name: 'Controlo de Pagamentos', children: [
            {name: 'Registo por Elemento'},
            {name: 'Núcleo Financeiro'},
            {name: 'Relatórios ANEPC'}
          ]},
        {name: 'Assinaturas Diárias'}
      ]},
      {name: 'Gestão Operacional', children: [
        {name: 'Escalas', children: [
          {name: 'DECIR'},
          {name: '1ª Secção'},
          {name: '2ª Secção'},
          {name: '3ª Secção'},
          {name: '4ª Secção'},
          {name: 'Emissão Escala'},
          {name: 'Consultar Escalas'}
        ]},
        {name: "Eventos", children: [
          {name: "Criação de Eventos"},
          {name: "Consultar Disponibilidades"}
        ]},
        {name: "Pedidos de Férias", children: [
          {name: "Consultar Pedidos"}
        ]},
      ]},
      {name: 'Gestão Funcionários'},
      {name: 'SALOC', children: [
        {name: 'Planos Prévios de Intervenção', children: [
          {name: "PPI A2"},
          {name: 'PPI A22'},
          {name: 'PPI Aeroporto de Faro'},
          {name: 'PPI Linha Férrea'},
          {name: "PPI Aérodromo de Portimão"}
        ]},
        {name: 'Registos Recusas/INOPS', children: [
          {name: 'Recusas de Serviços'},
          {name: 'Inoperacionalidades INEM'},
          {name: 'Relatórios Mensais'},
          {name: 'DashBoard'}
        ]},
        {name: 'Documentação Importante', children: [
          {name: 'CREPC Algarve'},
          {name: 'Planeamento Diário'},
          {name: 'Sitop de Veículos'},
          {name: 'Refeições DECIR'}
        ]},
        {name: 'Consola de Alarmes'}
      ]},
      {name: 'Comunicação WSMS', children: [
        {name: 'Ocorrências em Curso'},
        {name: 'Inserir/Alterar Ocorrência'},
        {name: 'Encerrar Ocorrência'},
        {name: 'Solicitar Disponibilidades'},
        {name: 'Indisponibilidade Veículos'},
        {name: 'Info. Grelha Município'},
        {name: 'Serviços EMS'},
        {name: 'Avisos METEO'}
      ]},
      {name: 'Utilitários'},
      {name: 'Data Center'}
    ];
    /* ========== CREATION CHECKBOX TREE =========== */
    function createCheckboxTree(node, container, level = 0, allowed = []) {
      const nodeDiv = document.createElement("div");
      nodeDiv.className = "tree-node";
      nodeDiv.dataset.level = level;
      const hasChildren = node.children && node.children.length > 0;
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "toggle-btn";
      toggleBtn.textContent = hasChildren ? "+" : "";
      if (!hasChildren) toggleBtn.style.visibility = "hidden";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = node.name;
      checkbox.checked = allowed.includes(node.name);
      const label = document.createTextNode(" " + node.name);
      nodeDiv.appendChild(toggleBtn);
      nodeDiv.appendChild(checkbox);
      nodeDiv.appendChild(label);
      container.appendChild(nodeDiv);
      let childrenContainer;
      if (hasChildren) {
        childrenContainer = document.createElement("div");
        childrenContainer.className = "children-container";
        node.children.forEach(child => createCheckboxTree(child, childrenContainer, level + 1, allowed));
        container.appendChild(childrenContainer);
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (level === 0 && !childrenContainer.classList.contains("open")) {
            let rootContainer = container;
            while (rootContainer && !rootContainer.classList.contains('checkbox-container')) {
              rootContainer = rootContainer.parentElement;
            }
            if (rootContainer) {
              rootContainer.querySelectorAll('.children-container').forEach(cc => {
                cc.classList.remove('open');
                const btn = cc.previousElementSibling?.querySelector('.toggle-btn');
                if (btn) btn.textContent = '+';
              });
            }
          }
          childrenContainer.classList.toggle("open");
          toggleBtn.textContent = childrenContainer.classList.contains("open") ? "−" : "+";
        });
      }
      checkbox.addEventListener("change", () => {
        if (hasChildren && !checkbox.checked) {
          childrenContainer.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
        }
        if (checkbox.checked) {
          let parent = nodeDiv.parentElement;
          while (parent && !parent.classList.contains('checkbox-container')) {
            const parentNodeDiv = parent.previousElementSibling;
            if (parentNodeDiv && parentNodeDiv.querySelector("input[type='checkbox']")) {
              parentNodeDiv.querySelector("input[type='checkbox']").checked = true;
            }
            parent = parent.parentElement;
          }
        }
      });
    }
    /* ========== SAVE ASSIGNED ACCESSES =========== */
    async function saveAccesses(corpId, container) {
      const checked = [...container.querySelectorAll("input[type='checkbox']:checked")]
        .map(cb => cb.value);
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?id=eq.${corpId}`, {
          method: "PATCH",
          headers: getSupabaseHeaders("return=representation"),
          body: JSON.stringify({
            allowed_modules: checked.join(",")
          })
        });
        if (!res.ok) throw new Error("Erro ao gravar acessos");
        showSuccessMessage("Acessos gravados!");
      } catch (err) {
        showErrorMessage("Erro ao gravar!");
        console.error(err);
      }
    }
    loadCorporations();
    /* =======================================
    ADD USERS BY CORPORATION
    ======================================= */
    /* ======= LOAD REGISTERED CORPORATIONS ======== */
    const userManagementItem = document.querySelector('.sidebar-item[data-section="user-management"]');
    if (userManagementItem) {
      userManagementItem.addEventListener('click', () => {
        loadCorpOperSelect("cb_select");
      });
    }
    async function loadCorpOperSelect(cb_select_id) {
      const selectEl = document.getElementById(cb_select_id);
      if (!selectEl) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/corporation_data?select=corp_oper_nr`;
        const response = await fetch(url, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error("Erro ao carregar dados de users.");
        const data = await response.json();
        const uniqueValues = [...new Set(data.map(item => item.corp_oper_nr).filter(val => val && val !== "0000"))];
        uniqueValues.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        selectEl.innerHTML = "";
        const blankOption = document.createElement("option");
        blankOption.value = "";
        blankOption.textContent = "";
        selectEl.appendChild(blankOption);
        uniqueValues.forEach(val => {
          const option = document.createElement("option");
          option.value = val;
          option.textContent = val;
          selectEl.appendChild(option);
        });
      } catch (err) {
        console.error("Erro ao carregar corp_oper_nr:", err);
      }
    }
    /* ================ SAVE USERS ================= */
    async function saveUserData() {
      const corpOper = document.getElementById("cb_select")?.value;
      const fullName = document.getElementById("new-user-name")?.value.trim();
      const username = document.getElementById("user-online")?.value.trim();
      const password = document.getElementById("pass-online")?.value.trim();
      if (!corpOper) return showErrorMessage("Selecione um Corpo de Bombeiros.");
      if (!fullName) return showErrorMessage("Digite o nome completo.");
      if (!username) return showErrorMessage("Digite o username App Online.");
      if (!password) return showErrorMessage("Digite a password App Online.");
      try {
        const checkUrl = `${SUPABASE_URL}/rest/v1/users?select=username&username=eq.${username}`;
        const checkResponse = await fetch(checkUrl, {
          headers: getSupabaseHeaders()
        });
        if (!checkResponse.ok) throw new Error("Erro ao verificar username.");
        const existing = await checkResponse.json();
        if (existing.length > 0) {
          return showErrorMessage(`❌ O username "${username}" já existe. Escolha outro.`);
        }
        const body = {
          corp_oper_nr: corpOper,
          full_name: fullName,
          username: username,
          password: password
        };
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/users`, {
            method: "POST",
            headers: {
              ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(body)
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ao salvar usuário: ${errorText}`);
        }
        showSuccessMessage("✅ Usuário adicionado com sucesso!");
        document.getElementById("cb_select").value = "";
        document.getElementById("new-user-name").value = "";
        document.getElementById("user-online").value = "";
        document.getElementById("pass-online").value = "";
      } catch (err) {
        console.error(err);
        showErrorMessage(`❌ Erro ao salvar usuário: ${err.message}`);
      }
    }
    /* =======================================
    LOGOUT FUNCTION
    ======================================= */
    document.addEventListener('DOMContentLoaded', () => {
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          sessionStorage.removeItem("currentUserName");
          sessionStorage.removeItem("currentUserDisplay");
          sessionStorage.removeItem("currentUserCorpNr");
          sessionStorage.removeItem("currentUserPatent");
          window.location.replace("index.html");
        });
      }
    });
    /* =======================================
    MESSAGING FUNCTIONS
    ======================================= */
    function showSuccessMessage(message) {
      showToast(`${message}`);
    }
    function showErrorMessage(message) {
      showToast(`❌ ${message}`);
    }
