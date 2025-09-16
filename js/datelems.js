// ===============================
    // LISTAGEM DE BOMBEIROS
    // ===============================
    /* ---- Lista de Bombeiros ---- */
    async function loadElementsTable() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=*`, {
          method: "GET",
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
        const data = await response.json();
        if (!data.length) {
          document.getElementById("table-container").textContent = "Nenhum registo encontrado.";
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
        const container = document.getElementById("table-container");
        container.innerHTML = "";
        const fields = ["n_int", "n_file", "full_name"];
        const columnTitles = {
          n_int: "Nº Interno",
          n_file: "Nº Mecanográfico",
          full_name: "Nome Completo"
        };
        const table = document.createElement("table");
        table.classList.add("reg-table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        fields.forEach(field => {
          const th = document.createElement("th");
          th.textContent = columnTitles[field];
          th.style.textAlign = "center";
          headerRow.appendChild(th);
        });
        const thAction = document.createElement("th");
        thAction.textContent = "Ações";
        thAction.style.textAlign = "center";
        headerRow.appendChild(thAction);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        data.forEach(row => {
          const tr = document.createElement("tr");
          fields.forEach(field => {
            const td = document.createElement("td");
            td.textContent = row[field] ?? "";
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
        table.appendChild(tbody);
        container.appendChild(table);
      } catch (error) {
        console.error("❌ Erro ao carregar tabela:", error);
      }
    }
    document.addEventListener("DOMContentLoaded", loadElementsTable);
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
    /* ---- Janela de Criação e Edição ---- */
    /* ---- Movimento da Janela ---- */
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
    /* ---- Variáveis Globais ---- */
    let currentEditId = null;
    let lastUpdated = null;
    /* ---- Abertura para Novo ---- */
    function openNewWindow() {
      document.getElementById("win_n_int").value = "";
      document.getElementById("win_n_file").value = "";
      document.getElementById("win_patent").value = "";
      document.getElementById("win_abv_name").value = "";
      document.getElementById("win_full_name").value = "";
      document.getElementById("win_MP").value = "";
      document.getElementById("win_TAS").value = "";
      currentEditId = null;
      document.getElementById("editWindow").style.display = "flex";
      document.getElementById("windowTitle").textContent = "Novo Registo";
      // Limpa a última alteração
      document.querySelector('.window-bottom-bar b').textContent = "";
      loadSummaryCounts();
    }
    /* ---- Abertura para Edição ---- */
    function openEditWindow(row) {
      document.getElementById("win_n_int").value = row.n_int || "";
      document.getElementById("win_n_file").value = row.n_file || "";
      document.getElementById("win_patent").value = row.patent || "";
      document.getElementById("win_abv_name").value = row.abv_name || "";
      document.getElementById("win_full_name").value = row.full_name || "";
      document.getElementById("win_MP").value = row.MP ? "true" : "false";
      document.getElementById("win_TAS").value = row.TAS ? "true" : "false";
      currentEditId = row.id;
      document.getElementById("editWindow").style.display = "flex";
      document.getElementById("windowTitle").textContent = "Editar Registo";
      // Exibe a última alteração se existir
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
      loadSummaryCounts();
    }
    /* ---- Fechar Janela ---- */
    document.getElementById("closeWindow").addEventListener("click", () => {
      document.getElementById("editWindow").style.display = "none";
    });
    /* ---- Gravação ---- */
    document.getElementById("winForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const n_intValue = document.getElementById("win_n_int").value;
      const payload = {
        n_int: n_intValue,
        n_file: document.getElementById("win_n_file").value,
        patent: document.getElementById("win_patent").value,
        abv_name: document.getElementById("win_abv_name").value,
        full_name: document.getElementById("win_full_name").value,
        MP: document.getElementById("win_MP").value === "true",
        TAS: document.getElementById("win_TAS").value === "true",
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
        // Atualiza a última alteração
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
        loadSummaryCounts();
      } catch (err) {
        console.error(err);
        alert("Erro ao gravar registro.");
      }
    });
    /* ---- Lista de Valências ---- */
    async function loadSummaryCounts() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=MP,TAS`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error("Erro ao carregar contagem");
        const data = await response.json();
        const totalBombeiros = data.length;
        const totalMP = data.filter(r => r.MP === true || r.MP === "true").length;
        const totalTAS = data.filter(r => r.TAS === true || r.TAS === "true").length;
        const totalTAT = data.filter(r => r.TAS === false || r.TAS === "false").length;
        document.getElementById("win_bombeiros_display").textContent = totalBombeiros;
        document.getElementById("win_mp_display").textContent = totalMP;
        document.getElementById("win_tas_display").textContent = totalTAS;
        document.getElementById("win_tat_display").textContent = totalTAT;
      } catch (err) {
        console.error("❌ Erro loadSummaryCounts:", err);
      }
    }
