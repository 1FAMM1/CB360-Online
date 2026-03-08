    /* =======================================
              FIREFIGHTER LISTING
    ======================================= */
    const ACCESS_OPTIONS = [
      {label: "Menu Principal"},
      {label: "Gestão Financeira", children: [
        {label: "Atualização de Valores"},
        {label: "Controlo de Pagamentos", children: [
          {label: "Registo por Elemento"},
          {label: "Núcleo Financeiro"},
          {label: "Relatórios ANEPC"}
        ]},
        {label: "Assinaturas Diárias"}
      ]},
      {label: "Gestão Operacional", children: [
        {label: "Escalas", children: [
          {label: "DECIR"},
          {label: "1ª Secção"},
          {label: "2ª Secção"},
          {label: "3ª Secção"},
          {label: "4ª Secção"},
          {label: "Emissão Escala"},
          {label: "Consultar Escalas"}
        ]},
        {label: "Eventos", children: [
          {label: "Criação de Eventos"},
          {label: "Consultar Disponibilidades"}
        ]},
        {label: "Pedidos de Férias", children: [
          {label: "Consultar Pedidos"}
        ]}, 
      ]},
      {label: "Gestão Funcionários", children: [
        {label: "Escalas Mensais"},
        {label: "Controlo de Horas Extras"},
        {label: "Registos Individuais"},
        {label: "Gestão de Férias", children: [
          {label: "Marcação de Férias"},
          {label: "Mapa de Férias"},
          {label: "Mapa de Prioridade"}
        ]},
        {label: "Utilitários RH", children: [
          {label: "Subsidio de Turno"},
          {label: "Processamento Salarial"},
          {label: "Enquadramento EIPs"}
        ]},
        {label: "Cadastro de Funcionários"}
      ]},
      {label: "SALOC", children: [
        {label: "Planos Prévios de Intervenção", children: [
          {label: "PPI A2"},
          {label: "PPI A22"},
          {label: "PPI Aeroporto de Faro"},
          {label: "PPI Linha Férrea"},
          {label: "PPI Aérodromo de Portimão"}
        ]},
        {label: "Registos Recusas/INOPS", children: [
          {label: "Recusas de Serviços"}, 
          {label: "Inoperacionalidades INEM"}, 
          {label: "Relatórios Mensais"}, 
          {label: "DashBoard"}
        ]},
        {label: "Documentação Importante", children: [
          {label: "CREPC Algarve"},
          {label: "Planeamento Diário"},
          {label: "Sitop de Veículos"},
          {label: "Refeições DECIR"}
        ]},
        {label: "Consola de Alarmes"}
      ]},
      {label: "Comunicação WSMS", children: [
        {label: "Ocorrências em Curso"},
        {label: "Inserir/Alterar Ocorrência"},
        {label: "Encerrar Ocorrência"},
        {label: "Solicitar Disponibilidades"},
        {label: "Indisponibilidade Veículos"},
        {label: "Info. Grelha Município"},
        {label: "Serviços EMS"},
        {label: "Avisos METEO"}]},
      {label: "Utilitários"},
      {label: "Data Center"}
    ];
    /* ================= LOAD TABLE ================= */
    async function loadElementsTable() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!corpOperNr) throw new Error("Corporação não definida");
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=*&corp_oper_nr=eq.${corpOperNr}`, {
          method: "GET",
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
        let data = await response.json();
        const tbody = document.querySelector("#elements-container tbody");
        tbody.innerHTML = "";
        if (!data.length) {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td colspan="5" style="text-align:center; padding:20px; color:#666;">
                               Nenhum registo encontrado.
                          </td>`;
          tbody.appendChild(tr);
          return;
        }
        data.sort((a, b) => {
          const aVal = a.n_int ?? "";
          const bVal = b.n_int ?? "";
          if (!isNaN(aVal) && !isNaN(bVal)) return Number(aVal) - Number(bVal);
          return aVal.toString().localeCompare(bVal.toString(), "pt", { numeric: true });
        });
        data.forEach(row => {
          const tr = document.createElement("tr");
          ["n_int", "n_file", "patent", "full_name", "elem_state"].forEach(field => {
            const td = document.createElement("td");
            if (field === "elem_state") {
              td.textContent = row[field] ? "ATIVO" : "INATIVO";
              td.style.color = row[field] ? "green" : "red";
            } else {
              td.textContent = row[field] ?? "";
            }
            td.style.textAlign = "center";
            tr.appendChild(td);
          });
          const tdAction = document.createElement("td");
          tdAction.style.textAlign = "center";
          const editBtn = document.createElement("button");
          editBtn.innerHTML = "✏️";
          editBtn.classList.add("btn-action");
          editBtn.style.marginRight = "5px";
          editBtn.addEventListener("click", () => openEditWindow(row));
          tdAction.appendChild(editBtn);
          const deleteBtn = document.createElement("button");
          deleteBtn.innerHTML = "🗑️";
          deleteBtn.classList.add("btn-delete");
          deleteBtn.style.marginLeft = "5px";
          deleteBtn.addEventListener("click", () => {
            const corpOperNr = row.corp_oper_nr || document.querySelector('.header-nr')?.textContent.trim();
            deleteRecord(row.id, row.full_name, corpOperNr);
          });
          tdAction.appendChild(deleteBtn);tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("❌ Erro ao carregar tabela:", error);
      }
    }
    /* ========== USER LOGIN DATA =========== */
    async function loadUserLogin(fullName, corpOperNr) {
      if (!fullName || !corpOperNr) return null;
      const encodedFullName = encodeURIComponent(fullName);
      const url = `${SUPABASE_URL}/rest/v1/users?select=username,password&full_name=eq.${encodedFullName}&corp_oper_nr=eq.${corpOperNr}`;
      const response = await fetch(url, {
        headers: getSupabaseHeaders()
      });
      if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
      const data = await response.json();
      return data.length ? data[0] : null;
    }
    /* ========== USER DELETE DATA ========== */
    async function deleteRecord(recordId, fullName, corpOperNr) {
      try {
        if (!corpOperNr) throw new Error("CorpOperNr não definido");
        const confirmDelete = confirm(`Tem certeza que deseja remover "${fullName}"?`);
        if (!confirmDelete) return;
        const delReg = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${recordId}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
        });
        if (!delReg.ok) throw new Error("Erro ao remover da reg_elems");
        const debugCheck = await fetch(
          `${SUPABASE_URL}/rest/v1/users?full_name=eq.${encodeURIComponent(fullName)}&corp_oper_nr=eq.${corpOperNr}`, { 
            headers: getSupabaseHeaders() }
        );
        const debugUsers = await debugCheck.json();
        console.log("DEBUG USERS ENCONTRADOS PARA APAGAR:", debugUsers);
        const delUser = await fetch(
          `${SUPABASE_URL}/rest/v1/users?full_name=eq.${encodeURIComponent(fullName)}&corp_oper_nr=eq.${corpOperNr}`, {
            method: "DELETE", headers: getSupabaseHeaders() }
        );
        if (!delUser.ok) console.warn("⚠️ User não removido:", delUser);
        alert("Registro removido com sucesso!");
        loadElementsTable();
      } catch (err) {
        console.error("❌ Erro geral ao remover registro:", err);
        alert("Erro ao remover registro.");
      }
    }
    /* ================= WINDOW DRAGGING ================= */
    (function() {
      const win = document.querySelector('.window');
      const title = document.querySelector('.window-titlebar');
      let dragging = false,
        offsetX = 0,
        offsetY = 0;
      title.addEventListener('mousedown', (e) => {
        if (window.innerWidth < 980) return;
        dragging = true;
        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        win.style.position = 'absolute';
        win.style.margin = '0';
        win.style.left = rect.left + 'px';
        win.style.top = rect.top + 'px';
        win.style.transition = 'none';
        win.style.transform = 'none';
        document.body.style.userSelect = 'none';
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
      });
      document.addEventListener('mouseup', () => {
        dragging = false;
        document.body.style.userSelect = 'auto';
      });
    })();
    let currentEditId = null;
    let lastUpdated = null;
    /* ================= OPEN WINDOWS ================= */
    function mapPatentToAbv() {
      const patentSelect = document.getElementById("win_patent");
      const patentAbvInput = document.getElementById("win_patent_abv");
      const value = patentSelect.value;
      if (!value) {
        patentAbvInput.value = "";
        return;
      }
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
    function openNewWindow() {
      ["win_n_int", "win_n_file", "win_patent", "win_patent_abv", "win_abv_name", "win_full_name", "win_MP", "win_TAS", "win_user_name_main", "win_password_main", "win_section", "win_nif", "win_niss", "win_nib", "win_type"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      const stateSelect = document.getElementById("win_state");
      if (stateSelect) stateSelect.value = "Ativo";
      document.querySelectorAll('.access-checkbox').forEach(cb => cb.checked = false);
      currentEditId = null;
      document.getElementById("editWindow").style.display = "flex";
      document.getElementById("windowTitle").textContent = "Novo Registo";
      document.querySelector('.window-bottom-bar b').textContent = "";
      mapPatentToAbv();
      resetToFirstTab();
    }

    async function openEditWindow(row) {
      ["win_n_int", "win_n_file", "win_patent", "win_patent_abv", "win_abv_name", "win_full_name", "win_MP", "win_TAS", "win_section", "win_nif", "win_niss", "win_nib"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = row[id.replace("win_", "")] ?? "";
      });
      const roleMap = {admin: "Administrador", subadmin: "Sub-Administrador", user: "Utilizador"};
      const typeSelect = document.getElementById("win_type");
      if (typeSelect) typeSelect.value = roleMap[row.user_role] || "";
      const stateSelect = document.getElementById("win_state");
      if (stateSelect) {
        stateSelect.value =
          row.elem_state === true ? "Ativo" :
        row.elem_state === false ? "Inativo" : "";
      }
      mapPatentToAbv();
      const userAccesses = row.acess ? row.acess.split(",").map(a => a.trim()) : [];
      document.querySelectorAll(".access-checkbox").forEach(cb => {
        cb.checked = userAccesses.includes(cb.value);
      });
      currentEditId = row.id;
      document.getElementById("editWindow").style.display = "flex";
      document.getElementById("windowTitle").textContent = "Editar Registo";
      document.getElementById("win_user_name_main").value = "";
      document.getElementById("win_password_main").value = "";
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      try {
        const userLogin = await loadUserLogin(row.full_name, corpOperNr);
        if (userLogin) {
          document.getElementById("win_user_name_main").value = userLogin.username ?? "";
          document.getElementById("win_password_main").value = userLogin.password ?? "";
        }
      } catch (err) {
        console.error("Erro ao carregar user login:", err);
      }
      if (row.last_updated) {
        document.querySelector(".window-bottom-bar b").textContent =
          new Date(row.last_updated).toLocaleString("pt-PT", {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"});
      } else {
        document.querySelector(".window-bottom-bar b").textContent = "";
      }
      resetToFirstTab();
    }
    /* ================= CLOSE WINDOW ================= */
    document.getElementById("closeWindow").addEventListener("click", () => {
      document.getElementById("editWindow").style.display = "none";
    });
    /* ================= FORM SUBMIT ================= */
    function mapUserRole() {
      const type = document.getElementById("win_type").value;
      if (type === "Administrador") return "admin";
      if (type === "Sub-Administrador") return "subadmin";
      if (type === "Utilizador") return "user";
      return null;
    }
    async function safeJson(response) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    document.getElementById("winForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const n_intValue = document.getElementById("win_n_int").value;
      const corpOperNr = document.querySelector('.header-nr')?.textContent.trim() || sessionStorage.getItem("currentCorpOperNr") || "0805";
      const payloadRegElems = {n_int: n_intValue, n_file: document.getElementById("win_n_file").value, patent: document.getElementById("win_patent").value,
                               patent_abv: document.getElementById("win_patent_abv").value, abv_name: document.getElementById("win_abv_name").value,
                               full_name: document.getElementById("win_full_name").value, MP: document.getElementById("win_MP").value === "true",
                               TAS: document.getElementById("win_TAS").value === "true", section: document.getElementById("win_section").value,
                               nif: document.getElementById("win_nif").value,
                               nib: document.getElementById("win_nib").value, elem_state: document.getElementById("win_state").value === "Ativo",
                               acess: Array.from(document.querySelectorAll('.access-checkbox:checked')).map(cb => cb.value).join(", "),
                               last_updated: new Date().toISOString(), corp_oper_nr: corpOperNr, user_role: mapUserRole()};
      if (!payloadRegElems.user_role) {
        alert("Selecione o tipo de utilizador (Administrador / Sub-Administrador / Utilizador).");
        return;
      }
      const payloadUsers = {username: document.getElementById("win_user_name_main").value, password: document.getElementById("win_password_main").value,
                            full_name: document.getElementById("win_full_name").value, patent: document.getElementById("win_patent").value, corp_oper_nr: corpOperNr};
      try {
        const checkFirefighter = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${n_intValue}&corp_oper_nr=eq.${corpOperNr}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!checkFirefighter.ok) throw new Error(`Erro ao verificar reg_elems: ${checkFirefighter.status}`);
        const existingFirefighter = await safeJson(checkFirefighter);
        if (existingFirefighter && existingFirefighter.length > 0) {
          const confirmUpdate = confirm(`O nº interno "${n_intValue}" já existe nesta corporação. Deseja atualizar o registro existente?`);
          if (!confirmUpdate) return;
          const recordId = existingFirefighter[0].id;
          const updateFirefighter = await fetch(
            `${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${recordId}`, {
              method: "PATCH",
              headers: getSupabaseHeaders({ Prefer: "return=representation" }),
              body: JSON.stringify(payloadRegElems)
            }
          );
          if (!updateFirefighter.ok) throw new Error(`Erro ao atualizar reg_elems: ${updateFirefighter.status}`);
          await safeJson(updateFirefighter);
          alert("Bombeiro atualizado com sucesso!");
        } else {
          const createBombeiro = await fetch(
            `${SUPABASE_URL}/rest/v1/reg_elems`, {
              method: "POST",
              headers: getSupabaseHeaders({ Prefer: "return=representation" }),
              body: JSON.stringify(payloadRegElems)
            }
          );
          if (!createBombeiro.ok) throw new Error(`Erro ao criar reg_elems: ${createBombeiro.status}`);
          await safeJson(createBombeiro);
          alert("Novo bombeiro criado com sucesso!");
        }
        const checkUserGlobal = await fetch(
          `${SUPABASE_URL}/rest/v1/users?username=eq.${payloadUsers.username}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!checkUserGlobal.ok) throw new Error(`Erro ao verificar user: ${checkUserGlobal.status}`);
        const usersFound = await safeJson(checkUserGlobal);
        if (usersFound && usersFound.length > 0) {
          const userSameCorp = usersFound.find(u => u.corp_oper_nr === corpOperNr);
          if (!userSameCorp) {
            alert("⚠️ Já existe um utilizador com estas credênciais.\nPor favor introduza outras credenciais.");
            document.getElementById("win_user_name_main").value = "";
            document.getElementById("win_password_main").value = "";
            return;
          }
          const updateUser = await fetch(
            `${SUPABASE_URL}/rest/v1/users?id=eq.${userSameCorp.id}`, {
              method: "PATCH",
              headers: getSupabaseHeaders({ Prefer: "return=representation" }),
              body: JSON.stringify(payloadUsers)
            }
          );
          if (!updateUser.ok) throw new Error(`Erro ao atualizar user: ${updateUser.status}`);
          await safeJson(updateUser);
        } else {
          const createUser = await fetch(
            `${SUPABASE_URL}/rest/v1/users`, {
              method: "POST",
              headers: getSupabaseHeaders({ Prefer: "return=representation" }),
              body: JSON.stringify(payloadUsers)
            }
          );
          if (!createUser.ok) throw new Error(`Erro ao criar user: ${createUser.status}`);
          await safeJson(createUser);
        }
        document.querySelector('.window-bottom-bar b').textContent =
          new Date(payloadRegElems.last_updated).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById("editWindow").style.display = "none";
        loadElementsTable();
      } catch (err) {
        console.error("Erro geral ao gravar registro:", err);
        alert("Erro ao gravar registro.");
      }
    });
    /* ================= GENERATE ACCESS CHECKBOXES ================= */
    const TOGGLE_BTN_STYLE = "color: #eee; margin-right: 6px; margin-left: -20px; width: 14px; height: 14px; border-radius: 50%; border: 0; background: #1f4b91; cursor: pointer;"
    function closeSiblingContainers(currentContainer) {
      const parent = currentContainer.parentElement;
      if (!parent) return;
      Array.from(parent.children).forEach(sibling => {
        if (sibling === currentContainer) return; 
        const siblingChildContainer = sibling.querySelector(":scope > div[style*='flex-direction: column']");
        const siblingBtn = sibling.querySelector(":scope > label > button");        
        if (siblingChildContainer && siblingChildContainer.style.marginLeft === "20px") {
          siblingChildContainer.style.display = "none";
          if (siblingBtn) siblingBtn.textContent = "+";
        }
      });
    }    
    function closeAllCheckboxContainers() {
      document.querySelectorAll(".access-checkbox-container > div[style*='flex-direction: column']").forEach(container => {
        if (container.style.marginLeft === "20px") {
          container.style.display = "none";
        }
      });
      document.querySelectorAll(".access-checkbox-container button").forEach(btn => {
        btn.textContent = "+";
      });
    }    
    function createCheckbox(option) {
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.marginLeft = "10px";
      container.classList.add("access-checkbox-container");
      const labelEl = document.createElement("label");
      labelEl.style.display = "flex";
      labelEl.style.alignItems = "center";
      labelEl.style.gap = "6px";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = option.label;
      checkbox.classList.add("access-checkbox");
      const span = document.createElement("span");
      span.textContent = option.label;
        if (option.children && option.children.length > 0) {
        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.textContent = "+";
        toggleBtn.style.cssText = TOGGLE_BTN_STYLE; 
        const childContainer = document.createElement("div");
        childContainer.style.display = "none";
        childContainer.style.flexDirection = "column";
        childContainer.style.marginLeft = "20px";
        childContainer.classList.add("access-checkbox-container");
        option.children.forEach(child => {
          childContainer.appendChild(createCheckbox(child));
        });
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (childContainer.style.display === "none") {
            closeSiblingContainers(container);
              childContainer.style.display = "flex";
              toggleBtn.textContent = "−";
            } else {
              childContainer.style.display = "none";
              toggleBtn.textContent = "+";
            }
        });
          labelEl.appendChild(toggleBtn);
          labelEl.appendChild(checkbox);
          labelEl.appendChild(span);
          container.appendChild(labelEl);
          container.appendChild(childContainer);
        } else {
          const spacer = document.createElement("span");
          spacer.style.width = "14px";
          spacer.style.marginRight = "6px";
          spacer.style.marginLeft = "-20px";
          labelEl.appendChild(spacer);
          labelEl.appendChild(checkbox);
          labelEl.appendChild(span);
          container.appendChild(labelEl);
        }
      return container;
    }    
    function filterAccessOptions(options, allowedModules) {
      if (!options || options.length === 0) {
        return [];
      }
      return options.reduce((acc, option) => {
        if (!allowedModules.includes(option.label)) {
          return acc;
        }
        const filteredOption = { ...option };
        if (filteredOption.children && filteredOption.children.length > 0) {
          filteredOption.children = filterAccessOptions(filteredOption.children, allowedModules);
        }
        acc.push(filteredOption);
        return acc;
      }, []);
    }    
    function generateAccessCheckboxes() {
      const container = document.getElementById("access-container");
      if (!container) return;
      container.innerHTML = '';
      closeAllCheckboxContainers();
      const myPosition = sessionStorage.getItem("currentUserRole");
      let optionsToRender;
      if (myPosition === 'admin') {
        optionsToRender = ACCESS_OPTIONS;
      } else {  
        const allowedModulesString = sessionStorage.getItem("allowedModules") || "";
        const allowedModules = allowedModulesString.split(",").map(a => a.trim());
        optionsToRender = filterAccessOptions(ACCESS_OPTIONS, allowedModules);
      }
      optionsToRender.forEach(option => {
        container.appendChild(createCheckbox(option));
      });
    }
    /* ================= TAB SWITCH ================= */
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        closeAllCheckboxContainers();
      });
    });    
    function resetToFirstTab() {
      const tabs = document.querySelectorAll('.tab-btn');
      const contents = document.querySelectorAll('.tab-content');
      if (!tabs.length || !contents.length) return;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      const firstTab = tabs[0];
      if (firstTab) {
        firstTab.classList.add('active');
        const firstContent = document.getElementById('tab-' + firstTab.dataset.tab);
        if (firstContent) {
          firstContent.classList.add('active');
        }
      }
    }



