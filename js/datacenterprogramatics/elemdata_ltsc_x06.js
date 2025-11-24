/* =======================================
                FIREFIGHTER LISTING
    ======================================= */
    const ACCESS_OPTIONS = [
    {label: "DECIR 360",
      children: [{label: "Controlo de Pagamentos"}, {label: "Escalas e Assinaturas"}]},
    {label: "FOMIO 360",
      children: [{label: "DECIR"}, {label: "1ª Secção"}, {label: "2ª Secção"}, {label: "Emissão Escala"}, {label: "Consultar Escalas"}]},
    {label: "EMPLOYEES 360"},
    {label: "SALOC 360",
      children: [{label: "Planos Prévios de Intervenção",
                children: [{ label: "PPI A2"}, {label: "PPI A22"}, {label: "PPI Aeroporto de Faro"}, {label: "PPI Linha Férrea"}, {label: "PPI Aérodromo de Portimão"}]},
    {label: "Registos Recusas/INOPS",
      children: [{label: "Recusas de Serviços"}, {label: "Inoperacionalidades INEM"}, {label: "Relatórios Mensais"}, {label: "DashBoard"}]},
    {label: "Documentação Importante",
      children: [{label: "CREPC Algarve"}, {label: "Planeamento Diário"}, {label: "Sitop. Veículos"}, {label: "Refeições DECIR"}]},
    {label: "Consola de Alarmes"}]},
    {label: "WSMS 360",
      children: [{label: "Ocorrências em Curso"}, {label: "Inserir/Alterar Ocorrência"}, {label: "Encerrar Ocorrência"}, {label: "Solicitar Disponibilidades"}, {label: "Indisponibiliedade Veículos"}, {label: "Info. Grelha Município"}]},
    {label: "Utilitários"},
    {label: "Data Center"}];
    /* ================= LOAD TABLE ================= */
    async function loadElementsTable() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=*`, {
          method: "GET",
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
        let data = await response.json();
        //data = data.filter(row => row.elem_state === true);
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
          return aVal.toString().localeCompare(bVal.toString(), "pt", {
            numeric: true
          });
        });
        data.forEach(row => {
          const tr = document.createElement("tr");
          ["n_int", "n_file", "patent", "full_name", "elem_state",].forEach(field => {
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
          deleteBtn.addEventListener("click", () => deleteRecord(row.id, row.n_int));
          tdAction.appendChild(deleteBtn);
          tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("❌ Erro ao carregar tabela:", error);
      }
    }
    /* ================= DELETE RECORD ================= */
    async function deleteRecord(recordId, n_int) {
      try {
        const confirmDelete = confirm(`Tem certeza que deseja remover o registo Nº Interno "${n_int}"?`);
        if (!confirmDelete) return;
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${recordId}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`Erro ao remover registro: ${response.status}`);
        alert("Registro removido com sucesso!");
        loadElementsTable();
        loadSummaryCounts();
      } catch (err) {
        console.error("❌ Erro ao remover registro:", err);
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
      ["win_n_int", "win_n_file", "win_patent", "win_patent_abv", "win_abv_name", "win_full_name", "win_MP", "win_TAS", "win_user_name", "win_password", "win_section"].forEach(id => {
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

    function openEditWindow(row) {
      ["win_n_int", "win_n_file", "win_patent", "win_patent_abv", "win_abv_name", "win_full_name", "win_MP", "win_TAS", "win_user_name", "win_password", "win_section"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = row[id.replace("win_", "")] ?? "";
      });
      const stateSelect = document.getElementById("win_state");
      if (stateSelect) {
        if (row.elem_state === true) stateSelect.value = "Ativo";
        else if (row.elem_state === false) stateSelect.value = "Inativo";
        else stateSelect.value = ""
      }
      mapPatentToAbv();
      const userAccesses = row.acess ? row.acess.split(",").map(a => a.trim()) : [];
      document.querySelectorAll('.access-checkbox').forEach(cb => {
        cb.checked = userAccesses.includes(cb.value);
      });
      currentEditId = row.id;
      document.getElementById("editWindow").style.display = "flex";
      document.getElementById("windowTitle").textContent = "Editar Registo";
      if (row.last_updated) {
        document.querySelector('.window-bottom-bar b').textContent =
          new Date(row.last_updated).toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
      } else {
        document.querySelector('.window-bottom-bar b').textContent = "";
      }
      resetToFirstTab();
    }
    /* ================= CLOSE WINDOW ================= */
    document.getElementById("closeWindow").addEventListener("click", () => {
      document.getElementById("editWindow").style.display = "none";
    });
    /* ================= FORM SUBMIT ================= */
    document.getElementById("winForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const n_intValue = document.getElementById("win_n_int").value;
      const acessos = Array.from(document.querySelectorAll('.access-checkbox:checked')).map(cb => cb.value);
      const payload = {
        n_int: n_intValue,
        n_file: document.getElementById("win_n_file").value,
        patent: document.getElementById("win_patent").value,
        patent_abv: document.getElementById("win_patent_abv").value,
        abv_name: document.getElementById("win_abv_name").value,
        full_name: document.getElementById("win_full_name").value,
        MP: document.getElementById("win_MP").value === "true",
        TAS: document.getElementById("win_TAS").value === "true",
        user_name: document.getElementById("win_user_name").value,
        password: document.getElementById("win_password").value,
        section: document.getElementById("win_section").value,
        elem_state: document.getElementById("win_state").value === "Ativo",
        acess: acessos.join(", "),
        last_updated: new Date().toISOString()
      };
      try {
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${n_intValue}`, {
          headers: getSupabaseHeaders()
        });
        if (!checkResponse.ok) throw new Error(`Erro ao verificar registro: ${checkResponse.status}`);
        const existingData = await checkResponse.json();
        if (existingData.length > 0) {
          const confirmUpdate = confirm(`O nº interno "${n_intValue}" já existe. Deseja atualizar o registro existente?`);
          if (!confirmUpdate) return;
          const recordId = existingData[0].id;
          const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${recordId}`, {
            method: "PATCH",
            headers: getSupabaseHeaders({
              returnRepresentation: true
            }),
            body: JSON.stringify(payload)
          });
          if (!updateResponse.ok) throw new Error(`Erro ao atualizar: ${updateResponse.status}`);
          alert("Registro atualizado com sucesso!");
        } else {
          const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems`, {
            method: "POST",
            headers: getSupabaseHeaders({
              returnRepresentation: true
            }),
            body: JSON.stringify(payload)
          });
          if (!createResponse.ok) throw new Error(`Erro ao criar: ${createResponse.status}`);
          alert("Novo registro criado com sucesso!");
        }
        lastUpdated = payload.last_updated;
        document.querySelector('.window-bottom-bar b').textContent =
          new Date(lastUpdated).toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        document.getElementById("editWindow").style.display = "none";
        loadElementsTable();
      } catch (err) {
        console.error(err);
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
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("access-container");
      closeAllCheckboxContainers();
      ACCESS_OPTIONS.forEach(option => {
        container.appendChild(createCheckbox(option));
      });
      loadElementsTable();
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

