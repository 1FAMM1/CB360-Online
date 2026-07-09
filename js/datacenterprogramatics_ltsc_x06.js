    /* =======================================
    DATA CENTER
    ======================================= */
    function showPanelCard(panelId) {
      document.querySelectorAll(".panel-card").forEach(el => el.classList.remove("active"));
      document.getElementById(`panel-${panelId}`).classList.add("active");
      document.querySelectorAll(".panel-sidebar-menu-button").forEach(btn => btn.classList.remove("active"));
      const activeBtn = document.querySelector(`.panel-sidebar-menu-button[onclick="showPanelCard('${panelId}')"]`);
      if (activeBtn) activeBtn.classList.add("active");
      if (panelId === "assoc") {
        loadCorporationData();
      }
      if (panelId === "elems") {
        resetElementsTable();
        const search = document.getElementById("win_search_element");
        if (search) search.value = "";
      }
      const list = document.getElementById("elements-list");
      const edit = document.getElementById("elements-edit");
      if (list) list.style.display = "block";
      if (edit) edit.style.display = "none";
    }
    /* =======================================
    CORPORATION DATA
    ======================================= */
    /* ================= STATE ================= */
    let originalCorpLogo = null;
    let tempCorpLogoFile = null;
    /* ================= DOM READY SAFE ================= */
    document.addEventListener("DOMContentLoaded", () => {
      const fileInput = document.getElementById("corp-logo-input");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          tempCorpLogoFile = file;
          const reader = new FileReader();
          reader.onload = (ev) => {
            document.querySelector(".data-logo").src = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      }
      const resetBtn = document.querySelector("#btn-reset-logo");
      if (resetBtn) {
        resetBtn.addEventListener("click", resetCorpLogo);
      }
    });
    /* ================= RESET LOGO ================= */
    function resetCorpLogo() {
      const img = document.querySelector(".data-logo");
      const input = document.getElementById("corp-logo-input");
      if (!img) return;
      if (originalCorpLogo) {
        img.src = originalCorpLogo;
      } else {
        img.src = "";
      }
      if (input) input.value = "";
      tempCorpLogoFile = null;
    }
    /* ================= CHECK EXISTING ================= */
    async function checkExistingCorporation() {
      try {
        const currentCorpNr = sessionStorage.getItem("currentUserCorpNr") || "0805";
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?select=id&corp_oper_nr=eq.${currentCorpNr}&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error("Erro ao verificar corporação existente:", error);
        return null;
      }
    }
    /* ================= LOAD CORPORATION DATA ================= */
    async function loadCorporationData() {
      try {
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!currentCorpNr) return;
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${encodeURIComponent(currentCorpNr)}&select=*`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.length) return;
        const corporation = data[0];
        document.getElementById("assoc-name").value = corporation.corporation || "";
        document.getElementById("cb-name").value = corporation.cb_name || "";
        document.getElementById("assoc-address").value = corporation.corp_address || "";
        document.getElementById("assoc-localidade").value = corporation.corp_localitie || "";
        document.getElementById("assoc-nif").value = corporation.corp_fiscal_nr || "";
        document.getElementById("assoc-operational-nr").value = corporation.corp_oper_nr || "";
        const {cp1, cp2} = splitPostalCode(corporation.corp_cp);
        document.getElementById("assoc-cp1").value = cp1;
        document.getElementById("assoc-cp2").value = cp2;
        document.getElementById("assoc-mobile-phone").value = corporation.corp_phone_mobile || "";
        document.getElementById("assoc-landline-phone").value = corporation.corp_phone_landline || "";
        document.getElementById("assoc-email").value = corporation.corp_email || "";
        await loadHierarchicalSelects(corporation);
      } catch (error) {
        console.error("❌ Erro ao carregar dados da corporação:", error);
      }
    }
    /* ================= LOAD LOGO ================= */
    async function loadCorporationLogo() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!corpOperNr) return;
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?select=logo_url&corp_oper_nr=eq.${corpOperNr}&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        if (data?.length > 0 && data[0].logo_url) {
          const img = document.querySelector(".data-logo");
          if (img) {
            originalCorpLogo = data[0].logo_url;
            img.src = originalCorpLogo;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar logo:", error);
      }
    }
    document.addEventListener("DOMContentLoaded", loadCorporationLogo);
    /* ================= SAVE CORPORATION ================= */
    async function saveCorporationData() {
      const saveButton = document.querySelector(
        'button[onclick="saveCorporationData()"]'
      );
      const originalText = saveButton?.textContent || "ATUALIZAR";
      try {
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.textContent = "A SALVAR...";
        }
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const corporationData = {corporation: document.getElementById("assoc-name")?.value?.trim() || null, cb_name: document.getElementById("cb-name")?.value?.trim() || null, 
                                 corp_address: document.getElementById("assoc-address")?.value?.trim() || null, corp_localitie: document.getElementById("assoc-localidade")?.value?.trim() || null, 
                                 corp_cp: getCombinedPostalCode(), corp_district: getSelectedDistrictName(), corp_council: getSelectedCouncilName(), corp_parish: document.getElementById("parish_select_corp")?.value?.trim() || null,
                                 corp_fiscal_nr: document.getElementById("assoc-nif")?.value?.trim() || null, corp_oper_nr: currentCorpNr || document.getElementById("assoc-operational-nr")?.value?.trim() || null,
                                 corp_phone_mobile: document.getElementById("assoc-mobile-phone")?.value?.trim() || null, corp_phone_landline: document.getElementById("assoc-landline-phone")?.value?.trim() || null,
                                 corp_email: document.getElementById("assoc-email")?.value?.trim() || null
                                };
        const validation = validateCorporationData(corporationData);
        if (!validation.isValid) throw new Error(validation.message);
        const existingResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${encodeURIComponent(corporationData.corp_oper_nr)}&select=id&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );
        const existingData = await existingResponse.json();
        let response;
        if (existingData.length > 0) {
          response = await updateCorporationData(
            existingData[0].id,
            corporationData
          );
        } else {
          response = await createCorporationData(corporationData);
        }
        showPopup("popup-success", "Dados da corporação salvos com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        showPopup("popup-danger", error.message || "Erro ao salvar dados da corporação");
      } finally {
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = originalText;
        }
      }
    }
    /* ================= CREATE ================= */
    async function createCorporationData(data) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data`, {
        method: "POST",
        headers: {...getSupabaseHeaders(), "Content-Type": "application/json", Prefer: "return=representation"},
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`CREATE ERROR: ${errorText}`);
      }
      return await response.json();
    }
    /* ================= UPDATE ================= */
    async function updateCorporationData(id, data) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/corporation_data?id=eq.${id}`, {
          method: "PATCH",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", Prefer: "return=representation"},
          body: JSON.stringify(data)
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`UPDATE ERROR: ${errorText}`);
      }
      return await response.json();
    }
    /* ================= HELPERS ================= */
    function splitPostalCode(fullPostalCode) {
      if (!fullPostalCode) return { cp1: "", cp2: "" };
      if (fullPostalCode.includes("-")) {
        const [cp1, cp2] = fullPostalCode.split("-");
        return { cp1: cp1 || "", cp2: cp2 || "" };
      }
      if (fullPostalCode.length === 7 && /^\d{7}$/.test(fullPostalCode)) {
        return {cp1: fullPostalCode.substring(0, 4), cp2: fullPostalCode.substring(4, 7)};
      }
      return {cp1: fullPostalCode, cp2: ""};
    }
    function getCombinedPostalCode() {
      const cp1 = document.getElementById("assoc-cp1")?.value?.trim();
      const cp2 = document.getElementById("assoc-cp2")?.value?.trim();
      if (cp1 && cp2) return `${cp1}-${cp2}`;
      return cp1 || cp2 || null;
    }
    function getSelectedDistrictName() {
      const el = document.getElementById("district_select_corp");
      if (!el?.value) return null;
      return el.options[el.selectedIndex]?.textContent?.trim() || null;
    }
    function getSelectedCouncilName() {
      const el = document.getElementById("council_select_corp");
      if (!el?.value) return null;
      return el.options[el.selectedIndex]?.textContent?.trim() || null;
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
    function validateCorporationData(data) {
      if (!data.corporation)
        return {isValid: false, message: "Nome da associação obrigatório"};
      if (!data.cb_name)
        return {isValid: false, message: "Nome do CB obrigatório"};
      if (!data.corp_fiscal_nr)
        return {isValid: false, message: "NIF obrigatório"};
      if (!/^\d{9}$/.test(data.corp_fiscal_nr))
        return {isValid: false, message: "NIF inválido"};
      if (!data.corp_oper_nr)
        return {isValid: false, message: "Operacional obrigatório"};
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
    /* ================= LOAD INIT ================= */
    document.addEventListener("DOMContentLoaded", async () => {
      setTimeout(async () => {
        await loadCorporationData();
      }, 500);
    });
    async function uploadCorpLogo(file, corpOperNr) {
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const fileName = `logo_cb_${corpOperNr}_${timestamp}.${fileExt}`;
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/cb_logos/${fileName}`, {
          method: "POST",
          headers: {Authorization: `Bearer ${SUPABASE_ANON_KEY}`},
          body: formData
        }
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return {
        fileName,
        url: `${SUPABASE_URL}/storage/v1/object/public/cb_logos/${fileName}`
      };
    }
    async function saveCorpLogo() {
      try {
        if (!tempCorpLogoFile) {
          showPopup("popup-danger", "Seleciona uma imagem primeiro!");
          return;
        }
        const localPreviewUrl = URL.createObjectURL(tempCorpLogoFile);
        const logoImg = document.querySelector(".data-logo");
        const logoHeaderImg = document.querySelector(".cb-logo img");
        if (logoImg) logoImg.src = localPreviewUrl;
        if (logoHeaderImg) logoHeaderImg.src = localPreviewUrl;
        const corpOperNr = (sessionStorage.getItem("currentCorpOperNr") || "0805").trim();
        console.log("1. A apagar ficheiro antigo...");
        await deleteCorpLogo(originalCorpLogo);
        console.log("2. A fazer upload novo...");
        const upload = await uploadCorpLogo(tempCorpLogoFile, corpOperNr);
        console.log("3. Upload OK:", upload.url);
        console.log("4. A atualizar DB...");
        await updateLogoInDB(corpOperNr, upload.url);
        console.log("5. DB OK");
        const cacheBusterUrl = `${upload.url}?t=${Date.now()}`;
        if (logoImg) logoImg.src = cacheBusterUrl;
        if (logoHeaderImg) logoHeaderImg.src = cacheBusterUrl;
        originalCorpLogo = upload.url;
        tempCorpLogoFile = null;
        const input = document.getElementById("corp-logo-input");
        if (input) input.value = "";
        showPopup("popup-success", "Logo atualizado com sucesso!");
      } catch (error) {
        console.error("SAVE LOGO ERROR:", error);
        showPopup("popup-danger", error.message || "Erro ao guardar logo");
        loadCorporationHeader();
      }
    }
    async function updateLogoInDB(corpOperNr, logoUrl) {
      const findRes = await fetch(
        `${SUPABASE_URL}/rest/v1/corporation_data?select=id&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        }
      );
      const findData = await findRes.json();
      if (!findData.length) {
        throw new Error("Corporação não encontrada");
      }
      const id = findData[0].id;
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/corporation_data?id=eq.${id}`, {
          method: "PATCH",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=representation"},
          body: JSON.stringify({logo_url: logoUrl})
        }
      );
      const text = await updateRes.text();
      if (!updateRes.ok) {
        throw new Error(text);
      }
      return JSON.parse(text);
    }
    async function deleteCorpLogo(oldFileUrl) {
      if (!oldFileUrl) return;
      try {
        const fileName = oldFileUrl.split("/cb_logos/")[1];
        if (!fileName) return;
        await fetch(
          `${SUPABASE_URL}/storage/v1/object/cb_logos/${fileName}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${SUPABASE_ANON_KEY}`}
          }
        );
      } catch (e) {
        console.warn("Erro ao apagar logo antigo:", e);
      }
    }
    /* =======================================
    FIREFIGHTER LISTING
    ======================================= */
    let currentEditId = null;
    const ACCESS_OPTIONS = [
      {label: "Menu Principal"},
      {label: "Gestão DECIR", children: [
        {label: "Configurações DECIR", children: [{label: "Atualização de Valores"}, {label: "Restaurantes e LEPPs"}]},
        {label: "Ver Escalas"},
        {label: "Gestão Financeira", children: [{label: "Registo por Elemento"}, {label: "Núcleo Financeiro"}, {label: "Relatórios ANEPC"}, {label: "Auditoria de Logs"}]},
        {label: "Gestão Despesas", children: [{label: "Despesas Danos"}, {label: "Despesas Refeições"}]},
        {label: "Registos Complementares", children: [{label: "Controlo de Ocorrências"}, {label: "Assinaturas Diárias"}, {label: "Refeições Diárias"}, {label: "Pré Posicionamentos"}, {label: "EPE DECIR IV"}]},
        {label: "DashBoard DECIR"}
      ]},
      {label: "Gestão Operacional", children: [
        {label: "Escalas", children: [{label: "DECIR"}, {label: "1ª Secção"}, {label: "2ª Secção"}, {label: "3ª Secção"}, {label: "4ª Secção"}, {label: "Emissão Escala"}, {label: "Consultar Escalas"}]},
        {label: "Eventos", children: [{label: "Criação de Eventos"}, {label: "Consulta Disponibilidades"}]},
        {label: "Pedidos de Férias", children: [{label: "Consultar Pedidos"}]},
        {label: "Serviços de Voluntariado", children: [{label: "Registo de Serviços"}, {label: "Consulta de Serviços"}, {label: "Configuração de Valores"}]}
      ]},
      {label: "Recursos Humanos", children: [
        {label: "Escalas Mensais"}, {label: "Controlo de Horas Extras"}, {label: "Registos Individuais"},
        {label: "Gestão de Férias", children: [{label: "Marcação de Férias"}, {label: "Mapa de Férias"}, {label: "Mapa de Prioridade"}]},
        {label: "Utilitários RH", children: [{label: "Subsidio de Turno"}, {label: "Processamento Salarial"}, {label: "Enquadramento EIPs"}, {label: "DashBoard RH"}]},
        {label: "Cadastro de Funcionários"}
      ]},
      {label: "Verbetes INEM"},
      {label: "SALOC", children: [
        {label: "Planos Prévios de Intervenção", children: [{label: "PPI A2"}, {label: "PPI A22"}, {label: "PPI Aeroporto de Faro"}, {label: "PPI Linha Férrea"}, {label: "PPI Aérodromo de Portimão"}]},
        {label: "Registos Recusas/INOPS", children: [{label: "Recusas de Serviços"}, {label: "Inoperacionalidades INEM"}, {label: "Relatórios Mensais"}, {label: "DashBoard"}]},
        {label: "Documentação Importante", children: [{label: "CREPC Algarve"}, {label: "Planeamento Diário"}, {label: "Sitop de Veículos"}]},
        {label: "Diversos"},
        {label: "Consola de Alarmes"}
      ]},
      {label: "Comunicação WSMS", children: [
        {label: "Ocorrências em Curso"}, {label: "Inserir/Alterar Ocorrência"}, {label: "Encerrar Ocorrência"}, {label: "Solicitar Disponibilidades"},
        {label: "Indisponibilidade Veículos"}, {label: "Info. Grelha Município"}, {label: "Serviços EMS"}, {label: "Avisos METEO"}
      ]},
      {label: "Utilitários"},
      {label: "Data Center"}
    ];
    function resetElementsTable() {
      const tbody = document.querySelector("#elements-container tbody");
      if (!tbody) return;
      tbody.querySelectorAll("tr").forEach(tr => {
        if (tr.querySelector('td[colspan]')) {
          const icon = tr.querySelector(".toggle-icon");
          if (icon) icon.textContent = "▶";
        } else {
          tr.style.display = "none";
        }
      });
    }
    function initTabs() {
      document.querySelectorAll("#elements-tabs .tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetId = btn.dataset.tab;
          document.querySelectorAll("#elements-tabs .tab-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          document.querySelectorAll("#elements-edit .tab-content").forEach(content => {
            content.style.display = "none";
            content.classList.remove("active");
          });
          const targetDiv = document.getElementById(targetId);
          if (targetDiv) {
            targetDiv.style.display = "block";
            targetDiv.classList.add("active");
          }
        });
      });
    }
    function resetToFirstTab() {
      const firstTab = document.querySelector("#elements-tabs .tab-btn[data-tab='mainData']");
      if (firstTab) firstTab.click();
    }
    function toggleElementsView() {
      const list = document.getElementById("elements-list");
      const edit = document.getElementById("elements-edit");
      if (list.style.display !== "none") {
        list.style.display = "none";
        edit.style.display = "block";
        resetToFirstTab();
        openNewCard();
        clearEditForm();
      } else {
        list.style.display = "block";
        edit.style.display = "none";
      }
    }
    function toggleStateDateVisibility() {
      const stateSelect = document.getElementById("win_state");
      const stateFromInput = document.getElementById("win_state_from");
      const stateFromLabel = stateFromInput ? stateFromInput.previousElementSibling : null;
      if (stateSelect && stateSelect.value === "Inativo") {
        if (stateFromInput) stateFromInput.style.display = "inline-block";
        if (stateFromLabel && stateFromLabel.tagName === "LABEL") {
          stateFromLabel.style.display = "inline-block";
        }
      } else {
        if (stateFromInput) {
          stateFromInput.style.display = "none";
          stateFromInput.value = "";
        }
        if (stateFromLabel && stateFromLabel.tagName === "LABEL") {
          stateFromLabel.style.display = "none";
        }
      }
    }
    async function loadElementsTable() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=*&corp_oper_nr=eq.${corpOperNr}`, {
          method: "GET",
          headers: getSupabaseHeaders()
        });
        let data = await response.json();
        const tbody = document.querySelector("#elements-container tbody");
        tbody.innerHTML = "";
        data.sort((a, b) => String(a.n_int).localeCompare(String(b.n_int), undefined, {numeric: true}));
        const quadDef = [{code: "QCOM", title: "QUADRO DE COMANDO"}, {code: "QATIV", title: "QUADRO ATIVO"}, {code: "QEST", title: "QUADRO DE ESTAGIÁRIOS"}, {code: "QEA", title: "QUADRO DE ESPECIALISTAS E AUXILIARES"}, 
                         {code: "QRES", title: "QUADRO DE RESERVA"}, {code: "QHR", title: "QUADRO DE HONRA"}, {code: null, title: "SEM QUADRO"}];
        quadDef.forEach(quadro => {
          const elems = data.filter(row => 
            quadro.code === null 
              ? !row.type_quad || row.type_quad === "" 
              : row.type_quad === quadro.code
          );
          if (!elems.length) return;
          const headerTr = document.createElement("tr");
          headerTr.innerHTML = `
            <td colspan="6" style="background:#ffebeb;color:#a70c0c;font-weight:bold;text-align:left;
              padding:8px 10px;font-size:12px;border-left:2px solid #d81c1c;
              letter-spacing:0.05em;cursor:pointer;user-select:none;">
              <span style="float:right;font-size:16px;" class="toggle-icon">▶</span>
              🔹 ${quadro.title} (${elems.length})
            </td>
          `;
          tbody.appendChild(headerTr);
          const quadroRows = [];
          elems.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td style="text-align:center">${row.n_int ?? ""}</td>
              <td style="text-align:center">${row.n_file ?? ""}</td>
              <td style="text-align:center">${row.patent ?? ""}</td>
              <td style="text-align:center">${row.full_name ?? ""}</td>
              <td style="text-align:center; color: ${row.elem_state ? 'green' : 'red'}">${row.elem_state ? 'ATIVO' : 'INATIVO'}</td>
              <td style="text-align:center">
                <button class="btn-action" onclick='openEditCard(${JSON.stringify(row)})'>✏️</button>
                <button class="btn-delete" onclick="deleteRecord('${row.id}', '${row.full_name}', '${row.corp_oper_nr}')">🗑️</button>
              </td>
            `;
            tbody.appendChild(tr);
            quadroRows.push(tr);
          });
          quadroRows.forEach(tr => tr.style.display = "none");
          headerTr.querySelector(".toggle-icon").textContent = "▶";
          headerTr.addEventListener("click", () => {
            const icon = headerTr.querySelector(".toggle-icon");
            const isVisible = quadroRows[0]?.style.display !== "none";
            document.querySelectorAll("#elements-container tbody tr").forEach(tr => {
              if (tr === headerTr) return;
              if (tr.querySelector('td[colspan]')) {
                tr.querySelector(".toggle-icon").textContent = "▶";
              } else {
                tr.style.display = "none";
              }
            });
            quadroRows.forEach(tr => tr.style.display = isVisible ? "none" : "");
            icon.textContent = isVisible ? "▶" : "▼";
          })
        });        
      } catch (error) {
        console.error("Erro ao carregar tabela:", error);
      }
    }
    function clearEditForm() {
      const ids = ["win_state", "win_state_from", "win_type", "win_ofope", "win_n_int", "win_n_file", "win_patent", "win_patent_abv", "win_section", "win_quad", "win_abv_name", "win_full_name", "win_MP", 
                   "win_ML", "win_TAS", "win_nif", "win_niss", "win_nib", "win_phone", "win_mobile", "win_mail", "win_user_name_main", "win_password_main", "win_user_name_mobile", "win_password_mobile"];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      toggleStateDateVisibility();
    }
    function mapPatentToAbv() {
      const patentSelect = document.getElementById("win_patent");
      const patentAbvInput = document.getElementById("win_patent_abv");
      const value = patentSelect.value;
      if (!value) { patentAbvInput.value = ""; return; }
      if (value === "Comandante") patentAbvInput.value = "COM";
      else if (value === "2º Comandante") patentAbvInput.value = "2COM";
      else if (value === "Adj. de Comando") patentAbvInput.value = "ACOM";
      else if (value.includes("Oficial")) patentAbvInput.value = "OFICI";
      else if (value === "Chefe") patentAbvInput.value = "CH";
      else if (value === "Subchefe") patentAbvInput.value = "SCH";
      else if (value === "Bombeiro(a) 1ª") patentAbvInput.value = "B1C";
      else if (value === "Bombeiro(a) 2ª") patentAbvInput.value = "B2C";
      else if (value === "Bombeiro(a) 3ª") patentAbvInput.value = "B3C";
      else if (value === "Estagiário(a)") patentAbvInput.value = "EST";
      else if (value === "Bº Especialista") patentAbvInput.value = "BESP";
      else patentAbvInput.value = "";
    }
    document.getElementById("win_patent").addEventListener("change", mapPatentToAbv);
    function openNewCard() {
      currentEditId = null;
      document.querySelector("#elements-edit h3").textContent = "Adicionar elemento";
      generateAccessCheckboxes();
      window.scrollTo({top: 0, behavior: "smooth"});
    }
    async function openEditCard(row) {
      currentEditId = row.id;
      document.getElementById("elements-list").style.display = "none";
      document.getElementById("elements-edit").style.display = "block";
      document.querySelector("#elements-edit h3").textContent = "Editar: " + (row.abv_name || "");
      const fields = ["n_int", "n_file", "patent", "patent_abv", "abv_name", "full_name", "section", "nif", "niss", "nib"];
      fields.forEach(f => {
        const el = document.getElementById("win_" + f);
        if (el) el.value = row[f] ?? "";
      });
      if (document.getElementById("win_ML")) document.getElementById("win_ML").value = String(row.ML);
      if (document.getElementById("win_MP")) document.getElementById("win_MP").value = String(row.MP);      
      if (document.getElementById("win_TAS")) document.getElementById("win_TAS").value = String(row.TAS);
      document.getElementById("win_quad").value = row.type_quad || "";
      document.getElementById("win_phone").value = row.phone || "";
      document.getElementById("win_mobile").value = row.mobile_phone || "";
      document.getElementById("win_mail").value = row.email || "";
      if (document.getElementById("win_state")) {
        document.getElementById("win_state").value = row.elem_state ? "Ativo" : "Inativo";
      }
      if (document.getElementById("win_state_from")) {
        document.getElementById("win_state_from").value = row.inactive_from ?? "";
      }
      if (document.getElementById("win_ofope")) {
        document.getElementById("win_ofope").value = row.is_ofope ? "Sim" : "Não";
      }
      toggleStateDateVisibility();
      const roleMap = {admin: "Administrador", subadmin: "Sub-Administrador", user: "Utilizador"};
      if (document.getElementById("win_type")) document.getElementById("win_type").value = roleMap[row.user_role] || "";
      generateAccessCheckboxes();
      const userAccesses = row.acess ? row.acess.split(",").map(a => a.trim()) : [];
      setTimeout(() => {
        document.querySelectorAll(".access-checkbox").forEach(cb => {
          cb.checked = userAccesses.includes(cb.value);
        });
      }, 100);
      const login = await loadUserLogin(row.full_name, row.corp_oper_nr);
      document.getElementById("win_user_name_main").value = login?.username || "";
      document.getElementById("win_password_main").value = login?.password || "";
      resetToFirstTab();
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
    async function saveElement() {
      const nInt = document.getElementById("win_n_int").value.trim();
      const fullName = document.getElementById("win_full_name").value.trim();
      if (!nInt || !fullName) {
        showPopup('popup-danger', "O Nº Interno e o Nome Completo são obrigatórios.");
        return;
      }
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const payloadReg = {n_int: document.getElementById("win_n_int").value, n_file: document.getElementById("win_n_file").value, patent: document.getElementById("win_patent").value,
                          patent_abv: document.getElementById("win_patent_abv").value, abv_name: document.getElementById("win_abv_name").value, full_name: document.getElementById("win_full_name").value,
                          ML: document.getElementById("win_ML").value === "true", MP: document.getElementById("win_MP").value === "true", TAS: document.getElementById("win_TAS").value === "true", 
                          section: document.getElementById("win_section").value, type_quad: document.getElementById("win_quad").value, phone: document.getElementById("win_phone").value, 
                          mobile_phone: document.getElementById("win_mobile").value, email: document.getElementById("win_mail").value, nif: document.getElementById("win_nif").value, 
                          is_ofope: document.getElementById("win_ofope").value === "Sim", nib: document.getElementById("win_nib").value, elem_state: document.getElementById("win_state").value === "Ativo", 
                          inactive_from: document.getElementById("win_state").value === "Inativo" ? document.getElementById("win_state_from").value : null,
                          acess: Array.from(document.querySelectorAll('.access-checkbox:checked')).map(cb => cb.value).join(", "), 
                          user_role: mapUserRole(), corp_oper_nr: corpOperNr,last_updated: new Date().toISOString()};
      if (!payloadReg.user_role) {
        showPopup('popup-danger', "⚠️ Selecione o tipo de utilizador (Administrador / Sub-Administrador / Utilizador).");
        return;
      }
      const payloadUsers = {username: document.getElementById("win_user_name_main").value, password: document.getElementById("win_password_main").value,
                            n_int: payloadReg.n_int, full_name: payloadReg.full_name, patent: payloadReg.patent, corp_oper_nr: corpOperNr};
      try {
        const url = currentEditId
          ? `${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${currentEditId}`
          : `${SUPABASE_URL}/rest/v1/reg_elems`;
        const resReg = await fetch(url, {
          method: currentEditId ? "PATCH" : "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=representation"},
          body: JSON.stringify(payloadReg)
        });
        if (!resReg.ok) throw new Error("Erro ao gravar reg_elems");
        const checkUser = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${payloadUsers.username}`, {
          headers: getSupabaseHeaders()
        });
        if (!checkUser.ok) throw new Error("Erro ao verificar user");
        const usersFound = await checkUser.json();
        if (usersFound && usersFound.length > 0) {
          const userSameCorp = usersFound.find(u => u.corp_oper_nr === corpOperNr);
          if (!userSameCorp) {
            showPopup('popup-danger', "⚠️ Já existe um utilizador com estas credenciais em outra corporação.\nPor favor introduza outras credenciais.");
            document.getElementById("win_user_name_main").value = "";
            document.getElementById("win_password_main").value = "";
            return;
          }
          await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userSameCorp.id}`, {
            method: "PATCH",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
            body: JSON.stringify(payloadUsers)
          });
        } else {
          await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
            body: JSON.stringify(payloadUsers)
          });
        }
        showPopup('popup-success', currentEditId ? "✅ Elemento editado com sucesso!" : "✅ Elemento adicionado com sucesso!");
        toggleElementsView();
        loadElementsTable();        
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', "Erro ao gravar registro.");
      }
    }
    async function deleteRecord(id, name, corp) {
      if (!confirm(`Deseja remover ${name}?`)) return;
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${id}`, { method: "DELETE", headers: getSupabaseHeaders() });
        await fetch(`${SUPABASE_URL}/rest/v1/users?full_name=eq.${encodeURIComponent(name)}&corp_oper_nr=eq.${corp}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        loadElementsTable();
      } catch (e) {
        alert("Erro ao eliminar");
      }
    }
    function generateAccessCheckboxes() {
      const container = document.getElementById("access-container");
      if (!container) return;
      container.innerHTML = '';
      ACCESS_OPTIONS.forEach(option => container.appendChild(createCheckbox(option, 0)));
    }
    function createCheckbox(option, level) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("access-wrapper");
      wrapper.style.marginLeft = level === 0 ? "0px" : "20px";
      wrapper.style.marginBottom = "5px";
      const closeAllChildren = (parent) => {
        parent.querySelectorAll(".child-container").forEach(c => c.style.display = "none");
        parent.querySelectorAll(".toggle-icon").forEach(t => t.textContent = "▶");
        parent.querySelectorAll(".label-text").forEach(l => {
          l.style.color = "#444";
          l.style.fontWeight = "normal";
        });
      };
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "8px";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "access-checkbox";
      cb.value = option.label;
      cb.setAttribute("style", `width: 18px !important; height: 18px !important; cursor: pointer !important; outline: none !important; box-shadow: none !important; appearance: none; -webkit-appearance: checkbox;`);
      const labelText = document.createElement("span");
      labelText.className = "label-text";
      labelText.textContent = option.label;
      labelText.style.fontSize = "14px";
      labelText.style.color = "#444";
      labelText.style.transition = "color 0.2s, font-weight 0.2s";
      const toggleContainer = document.createElement("div");
      toggleContainer.style.width = "15px";
      toggleContainer.style.display = "flex";
      toggleContainer.style.justifyContent = "center";
      const childContainer = document.createElement("div");
      childContainer.className = "child-container";
      childContainer.style.display = "none";
      if (option.children && option.children.length > 0) {
        const toggle = document.createElement("span");
        toggle.className = "toggle-icon";
        toggle.textContent = "▶";
        toggle.style.cursor = "pointer";
        toggle.style.fontSize = "10px";
        toggle.style.color = "#666";
        toggle.addEventListener("click", () => {
          const isOpen = childContainer.style.display !== "none";
          if (isOpen) {
            childContainer.style.display = "none";
            toggle.textContent = "▶";
            labelText.style.color = "#444";
            labelText.style.fontWeight = "normal";
            closeAllChildren(childContainer);
          } else {
            const parentElement = wrapper.parentElement;
            if (parentElement) {
              const siblings = parentElement.querySelectorAll(`:scope > .access-wrapper`);
              siblings.forEach(sibling => {
                if (sibling !== wrapper) {
                  const sChildContainer = sibling.querySelector(".child-container");
                  const sToggle = sibling.querySelector(".toggle-icon");
                  const sLabel = sibling.querySelector(".label-text");
                  if (sChildContainer) {
                    sChildContainer.style.display = "none";
                    if (sToggle) sToggle.textContent = "▶";
                    if (sLabel) {
                      sLabel.style.color = "#444";
                      sLabel.style.fontWeight = "normal";
                    }
                    closeAllChildren(sChildContainer);
                  }
                }
              });
            }
            childContainer.style.display = "block";
            toggle.textContent = "▼";
            labelText.style.color = "#e74c3c";
            labelText.style.fontWeight = "bold";
          }
        });
        toggleContainer.appendChild(toggle);
        option.children.forEach(child => {
          childContainer.appendChild(createCheckbox(child, level + 1));
        });
      }
      row.appendChild(toggleContainer);
      row.appendChild(cb);
      row.appendChild(labelText);
      wrapper.appendChild(row);
      wrapper.appendChild(childContainer);
      cb.addEventListener("change", () => {
        if (cb.checked) {
          let currentWrapper = wrapper;
          while (currentWrapper) {
            const parentWrapper = currentWrapper.parentElement.closest(".access-wrapper");
            if (parentWrapper) {
              const parentCb = parentWrapper.querySelector(":scope > div > .access-checkbox");
              if (parentCb) parentCb.checked = true;
              currentWrapper = parentWrapper;
            } else {
              currentWrapper = null;
            }
          }
        } else {
          childContainer.querySelectorAll(".access-checkbox").forEach(c => {
            c.checked = false;
          });
        }
      });
      return wrapper;
    }
    function mapUserRole() {
      const val = document.getElementById("win_type").value;
      return val === "Administrador" ? "admin" : (val === "Sub-Administrador" ? "subadmin" : "user");
    }
    async function loadUserLogin(name, corp) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?full_name=eq.${encodeURIComponent(name)}&corp_oper_nr=eq.${corp}`, {
        headers: getSupabaseHeaders()
      });
      const data = await res.json();
      return data[0] || null;
    }
    document.addEventListener("DOMContentLoaded", () => {      
      initTabs();
      loadElementsTable();
    });
    document.addEventListener("DOMContentLoaded", () => {
      initTabs();
      loadElementsTable();
      document.getElementById("elems-saveBtn").addEventListener("click", saveElement);
      document.getElementById("win_state").addEventListener("change", toggleStateDateVisibility);
    });
    document.getElementById("win_search_element")?.addEventListener("input", function() {
      const filterText = this.value.toLowerCase().trim();
      const tbody = document.querySelector("#elements-container tbody");
      if (!tbody) return;
      const rows = tbody.querySelectorAll("tr");
      rows.forEach(row => {
        if (row.querySelector('td[colspan]')) return;
        const nInt = row.children[0]?.textContent.toLowerCase() || "";
        const nFile = row.children[1]?.textContent.toLowerCase() || "";
        const patent = row.children[2]?.textContent.toLowerCase() || "";
        const fullName = row.children[3]?.textContent.toLowerCase() || "";
        if (nInt.includes(filterText) || nFile.includes(filterText) || patent.includes(filterText) || fullName.includes(filterText)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
      rows.forEach(row => {
        if (!row.querySelector('td[colspan]')) return;
        let next = row.nextElementSibling;
        let hasVisible = false;
        while (next && !next.querySelector('td[colspan]')) {
          if (next.style.display !== "none") {hasVisible = true; break;}
          next = next.nextElementSibling;
        }
        row.style.display = hasVisible || filterText === "" ? "" : "none";
      });
    });
    /* =======================================
    VEHICLE LISTING
    ======================================= */
    /* ================= LOAD VEHICLES TABLE ================= */
    async function loadVehiclesTable() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!corpOperNr) throw new Error("Corporação não definida");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?select=*&corp_oper_nr=eq.${encodeURIComponent(corpOperNr)}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
        const data = await response.json();
        const tbody = document.querySelector("#veícs-container tbody");
        tbody.innerHTML = "";
        if (!data.length) {
          const tr = document.createElement("tr");
          tr.innerHTML = 
            `<td colspan="5" style="text-align:center; padding:20px; color:#666;">
                Nenhum veículo encontrado.
             </td>            
            `;
          tbody.appendChild(tr);
          return;
        }
        data.sort((a, b) => (a.vehicle ?? "").localeCompare(b.vehicle ?? "", "pt", { numeric: true }));
        data.forEach(row => {
          const tr = document.createElement("tr");
          ["vehicle", "vehicle_registration", "current_status"].forEach(field => {
            const td = document.createElement("td");
            td.textContent = row[field] ?? "";
            td.style.textAlign = "center";
            if (field === "current_status") {
              if (row.current_status === "Disponível no Quartel") td.style.color = "green";
             else if (row.current_status === "Em Serviço") td.style.color = "orange";
             else if (row.current_status === "Inoperacional") td.style.color = "red";
            }
            tr.appendChild(td);
          });
          const tdAction = document.createElement("td");
          tdAction.style.textAlign = "center";
          const editBtn = document.createElement("button");
          editBtn.textContent = "✏️";
          editBtn.classList.add("btn-action");
          editBtn.style.marginRight = "5px";
          editBtn.addEventListener("click", () => fillVehicleForm(row));
          tdAction.appendChild(editBtn);
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "🗑️";
          deleteBtn.classList.add("btn-delete");
          deleteBtn.addEventListener("click", () => deleteVehicle(row.id, row.vehicle));
          tdAction.appendChild(deleteBtn);
          tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error("❌ Erro ao carregar veículos:", err);
      }
    }
    /* ================= FILL FORM FOR EDIT ================= */
    let editVehicleId = null;
    function fillVehicleForm(vehicle) {
      editVehicleId = vehicle.id;
      document.getElementById("new-veíc-name").value = vehicle.vehicle ?? "";
      document.getElementById("new-veíc-registration").value = vehicle.vehicle_registration ?? "";
      document.getElementById("new-veíc-brand").value = vehicle.vehicle_brand ?? "";
      document.getElementById("new-veíc-model").value = vehicle.vehicle_model ?? "";
      document.getElementById("new-veíc-buy-date").value = vehicle.buy_date ?? "";
      document.getElementById("new-veíc-registration-date").value = vehicle.registration_date ?? "";
      document.getElementById("new-veíc-state").value = vehicle.current_status ?? "";
    }
    /* ================= ADD / UPDATE VEHICLE ================= */
    document.querySelector("#new-veíc-save-update").addEventListener("click", async () => {
      const vehicleName = document.getElementById("new-veíc-name").value.trim();
      const vehicleRegistration = document.getElementById("new-veíc-registration").value.trim();
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!vehicleName || !vehicleRegistration) {
        showPopup('popup-danger', "Nome e matrícula são obrigatórios!");
        return;
      }
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Corporação não definida!");
        return;
      }
      const payload = {vehicle: vehicleName, vehicle_registration: vehicleRegistration, vehicle_brand: document.getElementById("new-veíc-brand").value,
                       vehicle_model: document.getElementById("new-veíc-model").value, buy_date: document.getElementById("new-veíc-buy-date").value,
                       registration_date: document.getElementById("new-veíc-registration-date").value, current_status: document.getElementById("new-veíc-state").value,
                       is_inop: document.getElementById("new-veíc-state").value === "Inoperacional", corp_oper_nr: currentCorpOperNr};
      try {
        let method, url;
        if (editVehicleId) {
          method = "PATCH";
          url = `${SUPABASE_URL}/rest/v1/vehicle_status?id=eq.${editVehicleId}`;
        } else {
          method = "POST";
          url = `${SUPABASE_URL}/rest/v1/vehicle_status`;
        }
        const response = await fetch(url, {
          method,
          headers: getSupabaseHeaders({ Prefer: "return=representation" }),
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`${response.status} - ${errorData.message || ''}`);
        }
        showPopup('popup-success', editVehicleId ? "Veículo atualizado com sucesso!" : "Veículo adicionado com sucesso!");
        editVehicleId = null;
        ["new-veíc-name","new-veíc-registration","new-veíc-brand","new-veíc-model","new-veíc-buy-date","new-veíc-registration-date","new-veíc-state"]
          .forEach(id => document.getElementById(id).value = "");
        loadVehiclesTable();
      } catch (err) {
        console.error("Erro:", err);
        showPopup('popup-danger', `Erro: ${err.message}`);
      }
    });
    /* ================= DELETE VEHICLE ================= */
    async function deleteVehicle(id, vehicleName) {
      const confirmDelete = confirm(`Tem certeza que deseja remover o veículo "${vehicleName}"?`);
      if (!confirmDelete) return;
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?id=eq.${id}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao remover veículo");
        showPopup('popup-success', "Veículo removido com sucesso!");
        loadVehiclesTable();
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', "Erro ao remover veículo.");
      }
    }
    /* ================= INITIAL LOAD ================= */
    document.addEventListener("DOMContentLoaded", () => {
      loadVehiclesTable();
    });
    /* =======================================
    EMAIL's FUNCTIONS
    ======================================= */
    /* ========== LOAD DE EMAILS ========== */
    async function loadMailsConfig() {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) return;
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}`, {
            method: "GET",
            headers: getSupabaseHeaders()
          }
        );
        const rows = await resp.json();
        if (!Array.isArray(rows)) return;
        document.getElementById("config_sitop_mail_to").value = rows.find(r => r.category === "crepcsitop_mail_to")?.value || "";
        document.getElementById("config_sitop_mail_cc").value = rows.find(r => r.category === "crepcsitop_mail_cc")?.value || "";
        document.getElementById("config_sitop_mail_bcc").value = rows.find(r => r.category === "crepcsitop_mail_bcc")?.value || "";
        document.getElementById("config_moa_mail_to").value = rows.find(r => r.category === "crepcmoa_mail_to")?.value || "";
        document.getElementById("config_moa_mail_cc").value = rows.find(r => r.category === "crepcmoa_mail_cc")?.value || "";
        document.getElementById("config_moa_mail_bcc").value = rows.find(r => r.category === "crepcmoa_mail_bcc")?.value || "";
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', "Erro ao carregar emails: " + err.message);
      }
    }
    /* ======= INSERT INTO SUPABASE ======= */
    async function insertMailsIntoSupabase(table, payload) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}`, {
            method: "POST",
            headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
            body: JSON.stringify(payload)
          }
        );
        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Erro Supabase POST: ${err}`);
        }
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    /* ========= EMAIL VALIDATION ========= */
function validateEmails(emailString) {
  if (!emailString) return true;
  const emails = emailString.split(",").map(e => e.trim());
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.every(email => regex.test(email));
}
/* ===== UPSERT HELPER (shared logic inline, no DRY sharing across other functions) ===== */
async function saveMailConfigRow(corpOperNr, category, value) {
  const checkUrl = `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpOperNr}&category=eq.${category}&select=id`;
  const checkRes = await fetch(checkUrl, { headers: getSupabaseHeaders() });
  const existing = await checkRes.json();
  if (existing.length > 0) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpOperNr}&category=eq.${category}`, {
        method: "PATCH",
        headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
        body: JSON.stringify({ value })
      }
    );
  } else {
    await fetch(
      `${SUPABASE_URL}/rest/v1/mails_config`, {
        method: "POST",
        headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
        body: JSON.stringify({ corp_oper_nr: corpOperNr, category, value })
      }
    );
  }
}
/* ============ SAVE SITOP ============ */
async function saveSitopMails() {
  const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
  if (!currentCorpNr) return;
  const rows = [{category: "crepcsitop_mail_to",  value: document.getElementById("config_sitop_mail_to").value},
                {category: "crepcsitop_mail_cc",  value: document.getElementById("config_sitop_mail_cc").value},
                {category: "crepcsitop_mail_bcc", value: document.getElementById("config_sitop_mail_bcc").value}];
  for (const row of rows) {
    await saveMailConfigRow(currentCorpNr, row.category, row.value);
  }
  showPopup('popup-success', "Emails para envio de Situações Operacionais de Veículos, atualizados com sucesso.");
}
/* ============= SAVE MOA ============= */
async function saveMoaMails() {
  const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
  if (!currentCorpNr) return;
  const rows = [{category: "crepcmoa_mail_to",  value: document.getElementById("config_moa_mail_to").value},
                {category: "crepcmoa_mail_cc",  value: document.getElementById("config_moa_mail_cc").value},
                {category: "crepcmoa_mail_bcc", value: document.getElementById("config_moa_mail_bcc").value}];
  for (const row of rows) {
    await saveMailConfigRow(currentCorpNr, row.category, row.value);
  }
  showPopup('popup-success', "Emails para envio de Medidas Operacionais de Anticipação, atualizados com sucesso.");
}
/* ========= EVENT LISTENERS ========== */
document.getElementById("config_sitop_mail_save").addEventListener("click", saveSitopMails);
document.getElementById("config_moa_mail_save").addEventListener("click", saveMoaMails);
const btnLoadMails = document.querySelector("button[onclick*=\"showPanelCard('mails')\"]");
if (btnLoadMails) {
  btnLoadMails.addEventListener("click", () => {
    showPanelCard("mails");
    loadMailsConfig();
  });
} else {
  console.warn("Botão Emails Config não encontrado!");
}
