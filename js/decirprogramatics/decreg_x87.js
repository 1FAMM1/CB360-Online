/* =======================================
                DECIR FUNCTIONS
    ======================================= */
    /* ======= GENERIC FUNCTION TO CREATE DECIR MONTH BUTTONS ======= */
    function createDecirButtonsGeneric({
      containerId,
      tableContainerId,
      yearSelectId,
      optionsContainerId,      
      blockedMonths = [],
      monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
      loadDataFunc,
      createTableFunc,
      loadByMonthFunc = null,
      includeExtraButton = false,
      extraButtonFunc = null,
      totalContainerId = null
    }) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";    
      const mainWrapper = document.createElement("div");
      Object.assign(mainWrapper.style, {display: "flex", flexDirection: "column", alignItems: "center", gap: "12px"});
      const yearContainer = document.createElement("div");
      Object.assign(yearContainer.style, {display: "flex", alignItems: "center", gap: "8px"});    
      const yearLabel = document.createElement("label");
      yearLabel.textContent = "Ano:";
      yearLabel.style.fontWeight = "bold";    
      const yearSelect = document.createElement("select");
      yearSelect.id = yearSelectId;
      Object.assign(yearSelect.style, {padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc"});    
      const currentYear = new Date().getFullYear();
      for (let y = 2025; y <= 2035; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }    
      yearContainer.append(yearLabel, yearSelect);
      const monthsWrapper = document.createElement("div");
      Object.assign(monthsWrapper.style, {display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px", maxWidth: "800px"});    
      monthNames.forEach((month, idx) => {
        const btn = document.createElement("button");
        btn.textContent = month;
        btn.className = "btn btn-add";
        Object.assign(btn.style, {fontSize: "14px", fontWeight: "bold", width: "110px", height: "40px", borderRadius: "4px", margin: "2px"});    
        btn.addEventListener("click", async () => {
          const tableContainer = document.getElementById(tableContainerId);
          const tableCodA33Container = document.getElementById("table-container-dec-coda33");          
          const optionsContainer = document.getElementById(optionsContainerId);
          const optionsCodA33Container = document.getElementById("decir-coda33-options");
          const totalContainer = totalContainerId ? document.getElementById(totalContainerId) : null;
          const isExtra = includeExtraButton && idx === monthNames.length - 1;
          const isActive = btn.classList.contains("active");
          if (tableCodA33Container) tableCodA33Container.innerHTML = "";
          if (optionsContainer) optionsContainer.style.display = "none";
          if (optionsCodA33Container) optionsCodA33Container.style.display = "none";
          if (totalContainer) totalContainer.style.display = "none";          
          if (isActive) {
            if (tableContainer) tableContainer.innerHTML = "";
            btn.classList.remove("active");
            return;
          }          
          monthsWrapper.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");          
          if (isExtra) {
            if (extraButtonFunc) await extraButtonFunc();
            if (tableContainer) tableContainer.innerHTML = "";
            if (optionsContainer) optionsContainer.style.display = "none";
            if (optionsCodA33Container) optionsCodA33Container.style.display = "flex";
            if (totalContainer) totalContainer.style.display = "none";
            return;
          }          
          if (blockedMonths.includes(idx)) {
            if (tableContainer) tableContainer.innerHTML = "";
            setTimeout(() => {
              showPopupWarning(`⛔ Durante o mês de ${month}, não existe DECIR. Salvo prolongamento ou antecipação declarados pela ANEPC.`);
            }, 10);
            return;
          }
          const year = parseInt(yearSelect.value, 10);
          const data = await loadDataFunc(year, idx + 1);
          await createTableFunc(tableContainerId, year, idx + 1, data);
          if (loadByMonthFunc) await loadByMonthFunc(year, idx + 1);          
          if (optionsContainer) optionsContainer.style.display = "flex";
          if (totalContainer) totalContainer.style.display = "flex";
        });
        monthsWrapper.appendChild(btn);
      });    
      mainWrapper.append(yearContainer, monthsWrapper);
      container.appendChild(mainWrapper);
    }
    /* ======== MENU SIDEBAR CLICK HANDLER PARA DECIR MONTHS ======== */
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.page;
        /* ===== PAGE REGISTERS ===== */    
        if (page === "decir-reg") {
          const tableContainer = document.getElementById("table-container-dec-reg");
          const optionsContainer = document.getElementById("decir-reg-options");
          if (tableContainer) tableContainer.innerHTML = "";
          if (optionsContainer) optionsContainer.style.display = "none";
          document.querySelectorAll("#months-container-dec-reg .btn").forEach(b => b.classList.remove("active"));    
          createDecirButtonsGeneric({
            containerId: "months-container-dec-reg",
            tableContainerId: "table-container-dec-reg",
            yearSelectId: "year-dec-reg",
            optionsContainerId: "decir-reg-options",
            blockedMonths: [0,1,2,3,10,11],
            loadDataFunc: async (year, month) => await loadDecirRegData(),
            createTableFunc: createDecirRegTable,
            loadByMonthFunc: async (year, month) => window.loadDecirByMonth?.(year, month)
          });    
          loadDecirConfigValues();
        }
        /* ===== PAGE PAYMENTS ====== */
        if (page === "decir-pag") {
          const tableContainer = document.getElementById("table-container-dec-pag");
          const tableCodA33Container = document.getElementById("table-container-dec-coda33");
          const optionsCodA33Container = document.getElementById("decir-coda33-options");
          const optionsContainer = document.getElementById("decir-pag-options");
          const totalContainer = document.getElementById("decir-payment-totals");
          if (tableContainer) tableContainer.innerHTML = "";
          if (tableCodA33Container) tableCodA33Container.innerHTML = "";
          if (optionsCodA33Container) optionsCodA33Container.style.display = "none"; 
          if (optionsContainer) optionsContainer.style.display = "none";
          if (totalContainer) totalContainer.style.display = "none";
          document.querySelectorAll("#months-container-dec-pag .btn").forEach(b => b.classList.remove("active"));    
          createDecirButtonsGeneric({
            containerId: "months-container-dec-pag",
            tableContainerId: "table-container-dec-pag",
            yearSelectId: "year-dec-pag",
            optionsContainerId: "decir-pag-options",
            blockedMonths: [0,1,2,3,10,11],
            monthNames: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro","Cod.A33"],
            includeExtraButton: true,
            extraButtonFunc: handleCodA33Button,
            loadDataFunc: async (year, month) => ({
              elems: await loadDecirPayElements(),
              turnos: await loadShiftsByNI(year, month)
            }),
            createTableFunc: (containerId, year, month, data) =>
              createDecirPayTable(containerId, year, month, data.elems, data.turnos),
            totalContainerId: "decir-payment-totals"
          });    
          loadDecirConfigValues();
        }
        /* ==== PAGE ANEPC FILES ==== */
        if (page === "decir-anepc") {
          const tableContainer = document.getElementById("table-container-dec-anepc");
          const optionsContainer = document.getElementById("decir-anepc-options");
          if (tableContainer) tableContainer.innerHTML = "";
          if (optionsContainer) optionsContainer.style.display = "none";
          document.querySelectorAll("#months-container-dec-anepc .btn").forEach(b => b.classList.remove("active"));    
          createDecirButtonsGeneric({
            containerId: "months-container-dec-anepc",
            tableContainerId: "table-container-dec-anepc",
            yearSelectId: "year-dec-anepc",
            optionsContainerId: "decir-anepc-options",
            blockedMonths: [0,1,2,3,10,11],
            loadDataFunc: async (year, month) => ({
              elems: await loadDecirANEPCElements(),
              turnos: await loadShiftsByNI(year, month)
            }),
            createTableFunc: (containerId, year, month, data) =>
            createDecirAnepcTable(containerId, year, month, data.elems, data.turnos)
          });
          loadDecirConfigValues();
        }
      });
    });
    /* ========================== LOADERS =========================== */
    /* ================== LOAD DECIR CONFIG VALUES ================== */
    async function loadDecirConfigValues() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/decir_values_config?select=amal_value,anepc_value&limit=1`, {
          headers: getSupabaseHeaders()
        });    
        if (!response.ok) throw new Error("Erro ao buscar valores de configuração DECIR");    
        const data = await response.json();
        if (data.length === 0) return;    
        const config = data[0];
        const formatValue = (val) => val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });    
        const formattedAmal = formatValue(config.amal_value);
        const formattedAnepc = formatValue(config.anepc_value);    
        ["amal-value-reg", "anepc-value-reg", "amal-value-pag", "anepc-value-pag", "amal-value-anepc", "anepc-value-anepc"].forEach((id, idx) => {
          const input = document.getElementById(id);
          if (input) input.value = idx % 2 === 0 ? formattedAmal : formattedAnepc;
        });    
        updateAllValues();
      } catch (err) {
        console.error(err);
        showPopupWarning("Erro ao carregar valores de configuração.");
      }
    }
    /* ================ LOAD DECIR REGISTER ELEMENTS ================ */
    async function loadDecirRegData() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,abv_name,patent_abv&n_int=gt.008&n_int=lt.400&elem_state=eq.true`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar dados do DECIR REG PAG");
        const data = await response.json();
        return data.sort((a, b) => parseInt(a.n_int, 10) - parseInt(b.n_int, 10));
      } catch (err) {
        console.error(err);
        showPopupWarning("Erro ao carregar dados dos elementos.");
        return [];
      }
    }
    /* =============== LOAD AND APPLY DECIR SAVED DATA ============== */
    (function() {
      async function loadDecirSavedData(year, month) {
        try {
          const supabaseUrl = window.SUPABASE_URL || SUPABASE_URL;
          const query = `${supabaseUrl}/rest/v1/decir_reg_pag?select=n_int,day,turno&year=eq.${year}&month=eq.${month}`;
          const headers = window.getSupabaseHeaders ? window.getSupabaseHeaders() : getSupabaseHeaders();
          const response = await fetch(query, { headers });      
          if (!response.ok) return {};      
          const data = await response.json();
          return data.reduce((map, item) => {
            map[`${item.n_int}_${item.turno}_${item.day}`] = "X";
            return map;
          }, {});
        } catch (err) {
          return {};
        }
      }

      function applyDecirMapToTable(map) {
        const rows = document.querySelectorAll("#table-container-dec-reg table tbody tr");
        if (rows.length === 0) return;    
        let last_n_int = null;
        const rowsToUpdate = new Set();    
        rows.forEach((row) => {
          const cells = Array.from(row.querySelectorAll("td"));
          if (cells.length < 4) return;      
          const turnoCell = cells.find(td => ["D","N"].includes(td.textContent.trim().toUpperCase()));
          if (!turnoCell) return;      
          const turno = turnoCell.textContent.trim().toUpperCase();
          const turnoIndex = cells.indexOf(turnoCell);      
          let n_int;
          if (turnoIndex === 0) {
            n_int = last_n_int;
          } else {
            n_int = parseInt(cells[0].textContent.trim(), 10);
            if (!isNaN(n_int)) last_n_int = n_int;
          }      
          if (!n_int || isNaN(n_int)) return;      
          const startIndex = turnoIndex + 1;
          let marcouAlgo = false;      
          for (let d = 1; d <= 31; d++) {
            const cell = cells[startIndex + d - 1];
            if (!cell) continue;        
            const key = `${n_int}_${turno}_${d}`;
            if (map[key]) {
              cell.textContent = "X";
              marcouAlgo = true;
            }
          }      
          if (marcouAlgo) rowsToUpdate.add(row);
        });
        rowsToUpdate.forEach(row => {
          const count = Array.from(row.querySelectorAll("td[contenteditable='true']"))
            .filter(td => td.textContent.trim().toUpperCase() === "X").length;      
          const totalCell = row.querySelector("td.total-cell");
          if (totalCell) totalCell.textContent = String(count);
        });
        const tbody = document.querySelector("#table-container-dec-reg table tbody");
        if (!tbody) return;    
        const totalRow = tbody.querySelector("tr.total-elements-row");
        if (!totalRow) return;    
        const firstRow = tbody.querySelector("tr:not(.total-elements-row)");
        if (!firstRow) return;    
        const daysInMonth = firstRow.querySelectorAll("td[contenteditable='true']").length;    
        for (let d = 1; d <= daysInMonth; d++) {
          const count = Array.from(tbody.querySelectorAll(`.day-cell-${d}`))
            .filter(td => td.textContent.trim().toUpperCase() === "X").length;      
          const totalDayCell = totalRow.querySelector(`.total-day-${d}`);
          if (totalDayCell) totalDayCell.textContent = count;
        }    
        if (typeof window.updateAllValues === 'function') {
          window.updateAllValues();
        }
      }
  
      async function loadDecirByMonth(year, month) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));      
          const table = document.querySelector("#table-container-dec-reg table tbody");
          if (!table) return;      
          const map = await loadDecirSavedData(year, month);
          if (Object.keys(map).length === 0) return;      
          applyDecirMapToTable(map);
        } catch (err) {
          console.error("Erro ao carregar DECIR:", err);
        }
      }
      window.loadDecirByMonth = loadDecirByMonth;
    })();
    /* =================== LOAD DECIR PAY ELEMENTS ================== */
    async function loadDecirPayElements() {
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,full_name,nif,nib&n_int=gt.008&n_int=lt.400&elem_state=eq.true`;
        const res = await fetch(url, { headers: getSupabaseHeaders() });
        if (!res.ok) throw new Error("Erro ao buscar elementos DECIR (reg_elems).");
        const data = await res.json();
        return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch (err) {
        console.error(err);
        showPopupWarning && showPopupWarning("Erro ao carregar lista de elementos.");
        return [];
      }
    }
    /* ================= LOAD DECIR COD.A33 ELEMENTS ================ */
    async function loadDecirCodA33Elements() {
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,full_name,nif&n_int=gt.008&n_int=lt.400&elem_state=eq.true`;
        const res = await fetch(url, { headers: getSupabaseHeaders() });
        if (!res.ok) throw new Error("Erro ao buscar elementos DECIR (reg_elems).");
        const data = await res.json();
        return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch (err) {
        console.error(err);
        showPopupWarning && showPopupWarning("Erro ao carregar lista de elementos.");
        return [];
      }
    }
    /* ================== LOAD DECIR ANEPC ELEMENTS ================= */
    async function loadDecirANEPCElements() {
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,n_file,patent,full_name&n_int=gt.008&n_int=lt.400&elem_state=eq.true`;
        const res = await fetch(url, { headers: getSupabaseHeaders() });
        if (!res.ok) throw new Error("Erro ao buscar elementos DECIR (reg_elems).");
        const data = await res.json();
        return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch (err) {
        console.error(err);
        showPopupWarning && showPopupWarning("Erro ao carregar lista de elementos.");
        return [];
      }
    }
    /* =================== LOAD DECIR SHIFTS BY NI ================== */
    async function loadShiftsByNI(year, month) {
      try {
        const query = `${SUPABASE_URL}/rest/v1/decir_reg_pag?select=n_int,turno,day&year=eq.${year}&month=eq.${month}`;
        const res = await fetch(query, { headers: getSupabaseHeaders() });
        if (!res.ok) return {};
        const data = await res.json();
        const turnosPorNI = {};
        data.forEach(item => {
          const ni = parseInt(item.n_int, 10);
          if (!turnosPorNI[ni]) turnosPorNI[ni] = 0;
          turnosPorNI[ni] += 1;
        });
        return turnosPorNI;
      } catch (err) {
        console.error("Erro ao carregar turnos DECIR:", err);
        return {};
      }
    }
    /* =========================== TABLES =========================== */
    /* ======================= TABLE REGISTERS ====================== */
    async function createDecirRegTable(containerId, year, month, data) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";  
      const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
      const daysInMonth = new Date(year, month, 0).getDate();
      const title = document.createElement("h3");
      title.textContent = `REGISTO DECIR - ${MONTH_NAMES[month - 1]} ${year}`;
      Object.assign(title.style, {textAlign: "center", margin: "20px 0 -15px 0", background: "#3ac55b", height: "30px", borderRadius: "3px"});
      container.appendChild(title);  
      const wrapper = createTableWrapper(container);
      wrapper.style.height = "380px";
      wrapper.style.overflowY = "auto";  
      const table = document.createElement("table");
      table.className = "month-table";
      Object.assign(table.style, {width: "100%", borderCollapse: "separated"});
      const thead = document.createElement("thead");
      const trTop = document.createElement("tr");  
      ["NI", "Nome", "Catg.", "Turno"].forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.rowSpan = 2;
        th.style.cssText = COMMON_TH_STYLE + "border-bottom:2px solid #ccc;";
        th.style.width = i === 0 ? "40px" : i === 1 ? "140px" : "40px";
        trTop.appendChild(th);
      });  
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-header-${d}`;
        th.style.cssText = COMMON_TH_STYLE;
        trTop.appendChild(th);
      }  
      [["TOTAL<br>Turnos", "60px", "#131a69"], ["Valor<br>AMAL", "120px"], ["Valor<br>ANEPC", "120px"], ["Valor<br>GLOBAL", "120px"]].forEach(([txt, w, bg]) => {
        const th = document.createElement("th");
        th.innerHTML = txt;
        th.rowSpan = 2;
        th.style.cssText = COMMON_THTOTAL_STYLE + `width:${w};text-align:center;vertical-align:middle;border-bottom:2px solid #ccc;${bg ? `background:${bg};color:#fff` : ""}`;
        trTop.appendChild(th);
      });  
      thead.appendChild(trTop);  
      const trNums = document.createElement("tr");
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-number-${d}`;
        th.textContent = d;
        th.style.cssText = COMMON_TH_STYLE + "border-bottom:2px solid #ccc;";
        trNums.appendChild(th);
      }
      thead.appendChild(trNums);
      table.appendChild(thead);  
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      wrapper.appendChild(table);  
      updateDayHeaders(table, year, month, daysInMonth);
      const getRows = () => Array.from(tbody.querySelectorAll("tr"));
      const getEditableCells = (row) => Array.from(row.querySelectorAll("td[contenteditable='true']"));
      const getCellIndex = (td) => getEditableCells(td.parentElement).indexOf(td);  
      const focusCell = (td) => {
        if (!td) return;
        td.focus();
        const range = document.createRange();
        range.selectNodeContents(td);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };  
      const updateRowTotal = (tr) => {
        const count = getEditableCells(tr).filter(td => td.textContent.trim().toUpperCase() === "X").length;
        const totalCell = tr.querySelector("td.total-cell");
        if (totalCell) totalCell.textContent = String(count);
        updateAllValues();
        updateDailyTotals();
      };  
      const navigate = (td, dir) => {
        if (!td) return null;
        const rows = getRows();
        const tr = td.parentElement;
        const rowIdx = rows.indexOf(tr);
        const idx = getCellIndex(td);
        const cells = getEditableCells(tr);    
        if (dir === "right") {
          if (idx < cells.length - 1) return cells[idx + 1];
          const nextRow = rows[rowIdx + 1];
          return nextRow ? getEditableCells(nextRow)[0] : null;
        }
        if (dir === "left") return idx > 0 ? cells[idx - 1] : null;
        if (dir === "down") {
          const nextRow = rows[rowIdx + 1];
          return nextRow ? getEditableCells(nextRow)[Math.min(idx, getEditableCells(nextRow).length - 1)] : null;
        }
        if (dir === "up") {
          const prevRow = rows[rowIdx - 1];
          return prevRow ? getEditableCells(prevRow)[Math.min(idx, getEditableCells(prevRow).length - 1)] : null;
        }
        return null;
      };  
      const createDayCell = (dayNum, trRef) => {
        const td = document.createElement("td");
        td.className = `day-cell-${dayNum}`;
        td.contentEditable = true;
        td.style.cssText = COMMON_TD_STYLE;    
        if (trRef.querySelector("td")?.textContent.trim() === "N") {
          td.style.borderBottom = "2px solid #ccc";
        }    
        td.addEventListener("input", () => {
          let v = td.textContent.toUpperCase().trim();
          v = v.length > 1 ? v[0] : v;
          td.textContent = v === "X" ? "X" : "";
          updateRowTotal(trRef);
          if (v === "X") {
            const next = navigate(td, "right");
            if (next) setTimeout(() => focusCell(next), 0);
          }
        });    
        td.addEventListener("paste", (ev) => {
          ev.preventDefault();
          const char = (ev.clipboardData || window.clipboardData).getData("text").toUpperCase().trim()[0] === "X" ? "X" : "";
          document.execCommand("insertText", false, char);
        });    
        td.addEventListener("keydown", (ev) => {
          if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Enter"].includes(ev.key)) {
            ev.preventDefault();
            const dir = ev.key === "ArrowRight" || ev.key === "Enter" ? "right" : ev.key === "ArrowLeft" ? "left" : ev.key === "ArrowUp" ? "up" : "down";
            const next = navigate(td, dir);
            if (next) focusCell(next);
          }
        });    
        td.addEventListener("focus", () => focusCell(td));
        return td;
      };
      data.forEach(item => {
        const nInt = parseInt(item.n_int, 10);    
        ["D", "N"].forEach((turno, tIdx) => {
          const tr = document.createElement("tr");
          tr.setAttribute("data-nint", nInt);      
          if (tIdx === 0) {
            [String(nInt).padStart(3, "0"), item.abv_name || "", item.patent_abv || ""].forEach(txt => {
              const td = document.createElement("td");
              td.textContent = txt;
              td.style.cssText = COMMON_TD_STYLE + "border-bottom:2px solid #ccc;border-bottom:2px solid #ccc;";
              td.rowSpan = 2;
              tr.appendChild(td);
            });
          }      
          const tdTurno = document.createElement("td");
          tdTurno.textContent = turno;
          tdTurno.style.cssText = COMMON_TD_STYLE + `font-weight:bold;text-align:center;${turno === "N" ? "border-bottom:2px solid #ccc;" : ""}`;
          tr.appendChild(tdTurno);      
          for (let d = 1; d <= daysInMonth; d++) tr.appendChild(createDayCell(d, tr));      
          const tdTotal = document.createElement("td");
          tdTotal.className = "total-cell";
          tdTotal.textContent = "0";
          tdTotal.style.cssText = COMMON_TDTOTAL_STYLE + (turno === "N" ? "border-bottom:2px solid #ccc;" : "");
          tdTotal.style.setProperty("font-weight", "bold", "important");
          if (turno === "N") {
            tdTotal.style.setProperty("border-bottom", "2px solid #ccc", "important");
          }
          tr.appendChild(tdTotal);      
          if (tIdx === 0) {
            [["0.00"], ["0.00"], ["0.00"]].forEach(([txt]) => {
              const td = document.createElement("td");
              td.rowSpan = 2;
              td.textContent = txt;
              td.style.cssText = COMMON_TDTOTAL_STYLE + "text-align:center;border-bottom:2px solid #ccc;";
              tr.appendChild(td);
            });
          }      
          tbody.appendChild(tr);
        });
      });
      const updateDailyTotals = () => {
        let totalRow = tbody.querySelector("tr.total-elements-row");
        if (!totalRow) {
          totalRow = document.createElement("tr");
          totalRow.className = "total-elements-row";
          totalRow.style.cssText = "height:25px;line-height:16px;";      
          const tdTitle = document.createElement("td");
          tdTitle.colSpan = 4;
          tdTitle.style.cssText = "font-weight:bold;text-align:center;padding:2px 4px;border:1px solid #ccc;border-top:0;border-left:0;background:#f7c277;";
          tdTitle.textContent = "Total diário de elementos:";
          totalRow.appendChild(tdTitle);      
          for (let d = 1; d <= daysInMonth; d++) {
            const td = document.createElement("td");
            td.className = `total-day-${d}`;
            td.style.cssText = "font-weight:bold;text-align:center;padding:2px 4px;border:1px solid #ccc;border-top:0;border-left:0;height:18px;line-height:16px;";
            totalRow.appendChild(td);
          }      
          const tdGeral = document.createElement("td");
          tdGeral.className = "total-general";
          tdGeral.style.cssText = "font-weight:bold;text-align:center;padding:2px 4px;border:1px solid #ccc;border-top:0;border-left:0;background:#f7c277;";
          totalRow.appendChild(tdGeral);
          tbody.appendChild(totalRow);
        }    
        let totalGeral = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const count = Array.from(tbody.querySelectorAll(`.day-cell-${d}`)).filter(td => td.textContent.trim().toUpperCase() === "X").length;
          totalRow.querySelector(`.total-day-${d}`).textContent = count;
        }    
        tbody.querySelectorAll("tr:not(.total-elements-row) .total-cell").forEach(tc => {
          totalGeral += parseInt(tc.textContent, 10) || 0;
        });    
        totalRow.querySelector(".total-general").textContent = totalGeral;
      };  
      updateDailyTotals();
      updateAllValues();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        if (date.getDay() === 0 || date.getDay() === 6) {
          tbody.querySelectorAll(`.day-cell-${d}`).forEach(td => {
            td.style.background = WEEKEND_COLOR || "#f9e0b0";
          });
        }
      }
      const firstEditable = tbody.querySelector("td[contenteditable='true']");
      if (firstEditable) firstEditable.focus();
    }
    /* ======================= TABLE PAYMENTS ======================= */
    function createDecirPayTable(containerId, year, month, elements, turnosPorNI) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";
      const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];      
      const title = document.createElement("h3");
      title.textContent = `RELATÓRIO PAGAMENTOS DECIR - ${MONTH_NAMES[month-1]} ${year}`;
      Object.assign(title.style, {textAlign: "center", margin: "20px 0 -15px 0", background: "#3ac55b", height: "30px", borderRadius: "3px"});      
      container.appendChild(title);      
      const wrapper = createTableWrapper ? createTableWrapper(container) : (() => {
        const w = document.createElement("div");
        w.style.maxHeight = "380px";
        w.style.overflowY = "auto";
        container.appendChild(w);
        return w;
      })();      
      const table = document.createElement("table");
      table.className = "pag-table";
      table.style.width = "100%";
      table.style.borderCollapse = "separated";
      table.style.fontFamily = "Segoe UI, sans-serif";      
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      const headers = ["NI","Nome","NIF","NIB","Qtd. Turnos","Valor a Receber (€)"];
      headers.forEach((h,i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.style.cssText = COMMON_TH_STYLE;
        if (i === 0) th.style.width = "40px";
        if (i === 1) th.style.width = "175px";
        if (i === 2) th.style.width = "120px";
        if (i === 3) th.style.width = "175px";
        if (i === 4) th.style.width = "100px";
        if (i === 5) th.style.width = "120px";
        th.style.height = "40px";
        th.style.lineHeight = "40px";
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);      
      const tbody = document.createElement("tbody");
      const rowsCount = elements.length > 0 ? elements.length : 10;      
      for (let i = 0; i < rowsCount; i++) {
        const elem = elements[i] || {};
        const tr = document.createElement("tr");        
        const tdNI = document.createElement("td");
        tdNI.style.cssText = COMMON_TD_STYLE;
        tdNI.textContent = elem.n_int ? String(elem.n_int).padStart(3,'0') : "";
        tr.appendChild(tdNI);        
        const tdName = document.createElement("td");
        tdName.style.cssText = COMMON_TD_STYLE + "text-align:center;padding:6px 8px;";
        tdName.textContent = elem.full_name || "";
        tr.appendChild(tdName);        
        const tdNIF = document.createElement("td");
        tdNIF.style.cssText = COMMON_TD_STYLE + "text-align:center;padding:6px 8px;";
        tdNIF.textContent = elem.nif || "";
        tr.appendChild(tdNIF);        
        const tdNIB = document.createElement("td");
        tdNIB.style.cssText = COMMON_TD_STYLE + "text-align:center;padding:6px 8px;";
        tdNIB.textContent = elem.nib || "";
        tr.appendChild(tdNIB);        
        const tdTurnos = document.createElement("td");
        tdTurnos.style.cssText = COMMON_TD_STYLE + "text-align:center;font-weight:bold;padding:6px 8px;";
        const niKey = parseInt(elem.n_int,10);
        const qtdTurnos = turnosPorNI && turnosPorNI[niKey] ? turnosPorNI[niKey] : 0;
        tdTurnos.textContent = qtdTurnos;
        tr.appendChild(tdTurnos);        
        const tdValor = document.createElement("td");
        tdValor.style.cssText = COMMON_TDTOTAL_STYLE + "text-align:right;font-weight:bold;padding:6px 8px;";        
        function updateValor() {
          const amal = parseFloat((document.getElementById("amal-value-pag")?.value || "0").replace(",", "."));
          const anepc = parseFloat((document.getElementById("anepc-value-pag")?.value || "0").replace(",", "."));
          const total = (amal + anepc) * qtdTurnos;
          tdValor.textContent = total.toLocaleString("pt-PT", {style: 'currency', currency: 'EUR', useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        updateValor();        
        ["amal-value-pag","anepc-value-pag"].forEach(id => {
          const input = document.getElementById(id);
          if (input) input.addEventListener("input", updateValor);
        });        
        tr.appendChild(tdValor);    
        tbody.appendChild(tr);
      }      
      table.appendChild(tbody);
      wrapper.appendChild(table);      
      wrapper.style.height = "380px";
      wrapper.style.overflowY = "auto";      
      const optionsContainer = document.getElementById("decir-pag-options");
      if (optionsContainer) optionsContainer.style.display = "flex";      
      updateDECIRTotalPaymentsByMonth();
    }
    /* ======================= TABLE COD A33 ======================== */
    function createDecirCodA33Table(containerId, year, elements, turnosPorMes) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";
      const title = document.createElement("h3");
      title.textContent = `RELATÓRIO ANUAL DECIR ${year} - Cod.A33`;
      Object.assign(title.style, {textAlign: "center", margin: "20px 0 -15px 0", background: "#3ac55b", height: "30px", borderRadius: "3px", padding: "0 8px"});
      container.appendChild(title);
      const wrapper = typeof createTableWrapper === 'function' ? createTableWrapper(container) : (() => {
        const w = document.createElement("div");
        w.style.maxHeight = "380px";
        w.style.overflowY = "auto";
        container.appendChild(w);
        return w;
      })();
      const table = document.createElement("table");
      table.className = "coda33-table";
      table.style.width = "100%";
      table.style.borderCollapse = "separate";
      table.style.fontFamily = "Segoe UI, sans-serif";
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      const fixedHeaders = ["NI", "Nome", "NIF"];
      fixedHeaders.forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.style.cssText = COMMON_TH_STYLE;
        if (i === 0) th.style.width = "40px";
        if (i === 1) th.style.width = "175px";
        if (i === 2) th.style.width = "120px";
        th.style.height = "40px";
        th.style.lineHeight = "40px";
        trh.appendChild(th);
      });
      const months = ["ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO"];
      months.forEach(month => {
        const thShifts = document.createElement("th");
        thShifts.textContent = `Turnos ${month}`;
        thShifts.style.cssText = COMMON_TH_STYLE;
        thShifts.style.width = "90px";
        thShifts.style.display = "none";
        trh.appendChild(thShifts);
        const thValue = document.createElement("th");
        thValue.textContent = `${month}`;
        thValue.style.cssText = COMMON_TH_STYLE;
        thValue.style.width = "100px";
        thValue.style.height = "40px";
        thValue.style.lineHeight = "40px";
        trh.appendChild(thValue);
      });
      const thTotal = document.createElement("th");
      thTotal.innerHTML = "Total por<br>Contribuinte";
      thTotal.style.cssText = COMMON_THTOTAL_STYLE;
      thTotal.style.width = "130px";
      thTotal.style.height = "40px";
      thTotal.style.lineHeight = "20px";
      trh.appendChild(thTotal);
      thead.appendChild(trh);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      const rowsCount = elements.length > 0 ? elements.length : 10;
      for (let i = 0; i < rowsCount; i++) {
        const elem = elements[i] || {};
        const tr = document.createElement("tr");
        const tdNI = document.createElement("td");
        tdNI.style.cssText = COMMON_TD_STYLE;
        tdNI.textContent = elem.n_int ? String(elem.n_int).padStart(3, '0') : "";
        tr.appendChild(tdNI);
        const tdName = document.createElement("td");
        tdName.style.cssText = COMMON_TD_STYLE + "text-align:center;padding:6px 8px;";
        tdName.textContent = elem.full_name || "";
        tr.appendChild(tdName);
        const tdNIF = document.createElement("td");
        tdNIF.style.cssText = COMMON_TD_STYLE + "text-align:center;padding:6px 8px;";
        tdNIF.textContent = elem.nif || "";
        tr.appendChild(tdNIF);
        const niKey = parseInt(elem.n_int, 10);        
        const tdTotalContributor = document.createElement("td");
        tdTotalContributor.className = "total-contributor";
        tdTotalContributor.style.cssText = COMMON_TD_STYLE + "font-weight:bold;padding:6px 8px;text-align:right;";
        let totalForLoop = 0;
        const amalInitial = parseFloat((document.getElementById("amal-value-pag")?.value || "0").replace(",", "."));
        const anepcInitial = parseFloat((document.getElementById("anepc-value-pag")?.value || "0").replace(",", "."));
        for (let month = 4; month <= 10; month++) {
          const tdTurnos = document.createElement("td");
          tdTurnos.style.cssText = COMMON_TD_STYLE + "text-align:center;font-weight:bold;padding:6px 8px;";
          const qtdTurnos = turnosPorMes && turnosPorMes[month] && turnosPorMes[month][niKey] 
          ? turnosPorMes[month][niKey] 
          : 0;
          tdTurnos.textContent = qtdTurnos;
          tdTurnos.style.display = "none";
          tr.appendChild(tdTurnos);
          const tdValue = document.createElement("td");
          tdValue.style.cssText = COMMON_TD_STYLE + "font-weight:bold;padding:6px 8px;text-align:right;";
          tdValue.className = `valor-mes-${month}`;
          const valueInitial = (amalInitial + anepcInitial) * qtdTurnos;
          tdValue.textContent = formatCurrency(valueInitial); 
          tdValue.setAttribute("data-value", valueInitial);
          totalForLoop += valueInitial;
          tr.appendChild(tdValue);
        }
        tdTotalContributor.textContent = formatCurrency(totalForLoop); 
        tr.appendChild(tdTotalContributor);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      wrapper.appendChild(table);
      wrapper.style.height = "380px";
      wrapper.style.overflowY = "auto";
      ["amal-value-pag", "anepc-value-pag"].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener("input", updateAllValues);
      });
      if (typeof updateDECIRTotalPaymentsByMonth === 'function') {
        updateDECIRTotalPaymentsByMonth();
      }
    }
    /* ========================= TABLE ANEPC ======================== */
    function createDecirAnepcTable(containerId, year, month, elements, turnosPorNI) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";  
      const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];  
      const title = document.createElement("h3");
      title.textContent = `RELATÓRIO ANEPC DECIR - ${MONTH_NAMES[month-1]} ${year}`;
      Object.assign(title.style, {textAlign: "center", margin: "20px 0 -15px 0", background: "#3ac55b", height: "30px", borderRadius: "3px", lineHeight: "30px", padding: "0 8px"});
      container.appendChild(title);  
      const wrapper = createTableWrapper ? createTableWrapper(container) : (() => {
        const w = document.createElement("div");
        w.style.maxHeight = "380px";
        w.style.overflowY = "auto";
        container.appendChild(w);
        return w;
      })();  
      const table = document.createElement("table");
      table.className = "anepc-table";
      table.style.width = "100%";
      table.style.borderCollapse = "separated";
      table.style.fontFamily = "Segoe UI, sans-serif";  
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      const headers = ["Nº Mecanográfico", "Função", "Nome", "Qtd. Turnos", "Valor ANEPC (€)"];  
      headers.forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.style.cssText = COMMON_TH_STYLE;
        if (i === 0) th.style.width = "120px";
        if (i === 1) th.style.width = "100px";
        if (i === 2) th.style.width = "200px";
        if (i === 3) th.style.width = "100px";
        if (i === 4) th.style.width = "140px";
        th.style.height = "40px";
        th.style.lineHeight = "40px";
        trh.appendChild(th);
      });  
      thead.appendChild(trh);
      table.appendChild(thead);  
      const tbody = document.createElement("tbody");
      const rowsCount = elements.length > 0 ? elements.length : 10;  
      for (let i = 0; i < rowsCount; i++) {
        const elem = elements[i] || {};
        const tr = document.createElement("tr");
        const tdNI = document.createElement("td");
        tdNI.style.cssText = COMMON_TD_STYLE + "text-align:center;";
        tdNI.textContent = elem.n_file ? String(elem.n_file) : "";
        tr.appendChild(tdNI);
        const tdPatent = document.createElement("td");
        tdPatent.style.cssText = COMMON_TD_STYLE + "text-align:center;padding:6px 8px;";
        tdPatent.textContent = elem.patent || "";
        tr.appendChild(tdPatent);
        const tdName = document.createElement("td");
        tdName.style.cssText = COMMON_TD_STYLE + "text-align:center;padding:6px 8px;";
        tdName.textContent = elem.full_name || "";
        tr.appendChild(tdName);
        const tdShifts = document.createElement("td");
        tdShifts.style.cssText = COMMON_TD_STYLE + "text-align:center;font-weight:bold;padding:6px 8px;";
        const niKey = parseInt(elem.n_int, 10);
        const qtyShifts = turnosPorNI && turnosPorNI[niKey] ? turnosPorNI[niKey] : 0;
        tdShifts.textContent = qtyShifts;
        tr.appendChild(tdShifts);
        const tdValue = document.createElement("td");
        tdValue.style.cssText = COMMON_TDTOTAL_STYLE + "text-align:right;font-weight:bold;padding:6px 8px;";    
        function updateValor() {
          const anepc = parseFloat((document.getElementById("anepc-value-anepc")?.value || "0").replace(",", "."));
          const total = anepc * qtyShifts;      
          tdValue.textContent = formatCurrency(total);
        }    
        updateValor();    
        const input = document.getElementById("anepc-value-anepc");
        if (input) input.addEventListener("input", updateValor);    
        tr.appendChild(tdValue);
        tbody.appendChild(tr);
      }  
      table.appendChild(tbody);
      wrapper.appendChild(table);  
      wrapper.style.height = "380px";
      wrapper.style.overflowY = "auto";  
      const optionsContainer = document.getElementById("decir-anepc-options");
      if (optionsContainer) optionsContainer.style.display = "flex";      
      if (typeof updateAnepcTotals === 'function') {
        updateAnepcTotals();
      }
    }
    window.createDecirAnepcTable = createDecirAnepcTable;
    /* ==================== AUXILIARY FUNCTIONS ===================== */
    /* ============ AUXILIARY FUNCTIONS FOR CALCULATIONS ============ */
    function getValuesFromInputs() {
      const getValue = (id) => parseFloat((document.getElementById(id)?.value || "0").replace(",", ".")) || 0;
      return {
        amalValue: getValue("amal-value-reg"),
        anepcValue: getValue("anepc-value-reg")
      };
    }
    
    function updateAllValues() {
      const {amalValue, anepcValue} = getValuesFromInputs();
      const amalCents = Math.round(amalValue * 100);
      const anepcCents = Math.round(anepcValue * 100);
      const tbody = document.querySelector("table.month-table tbody");
      if (!tbody) return;  
      const rows = Array.from(tbody.querySelectorAll("tr"));  
      for (let i = 0; i < rows.length; i += 2) {
        const trD = rows[i];
        const trN = rows[i + 1];
        if (!trN) continue;    
        const totalD = Number(trD.querySelector("td.total-cell")?.textContent?.trim()) || 0;
        const totalN = Number(trN.querySelector("td.total-cell")?.textContent?.trim()) || 0;
        const sum = totalD + totalN;    
        const amalTotalCents = sum * amalCents;
        const anepcTotalCents = sum * anepcCents;
        const globalTotalCents = amalTotalCents + anepcTotalCents;    
        const tds = Array.from(trD.querySelectorAll("td"));
        const [amalCell, anepcCell, globalCell] = tds.slice(-3);    
        if (amalCell) amalCell.textContent = formatCurrency(amalTotalCents / 100);
        if (anepcCell) anepcCell.textContent = formatCurrency(anepcTotalCents / 100);
        if (globalCell) globalCell.textContent = formatCurrency(globalTotalCents / 100);
      }  
      setTimeout(updateGeneralTotals, 0);
    }

    function updateGeneralTotals() {
      const tbody = document.querySelector("table.month-table tbody");
      if (!tbody) return;  
      let totalAmalCents = 0, totalAnepcCents = 0, totalGlobalCents = 0;  
      const parseValueToCents = (cell) => {
        if (!cell) return 0;
        const text = cell.textContent.replace(/[€\s]/g, "").replace(/\./g, "").replace(",", ".");
        return Math.round((parseFloat(text) || 0) * 100);
      };  
      const isMoneyCell = (cell) => {
        const text = cell?.textContent || "";
        return text.includes("€") || text.includes(",");
      };  
      const rows = Array.from(tbody.querySelectorAll("tr"));  
      for (let i = 0; i < rows.length; i += 2) {
        const tds = Array.from(rows[i].querySelectorAll("td"));
        if (tds.length < 3) continue;    
        const [amalCell, anepcCell, globalCell] = tds.slice(-3);    
        if (!isMoneyCell(amalCell) || !isMoneyCell(anepcCell) || !isMoneyCell(globalCell)) {
          continue;
        }    
        totalAmalCents += parseValueToCents(amalCell);
        totalAnepcCents += parseValueToCents(anepcCell);
        totalGlobalCents += parseValueToCents(globalCell);
      }  
      let totalContainer = document.getElementById("decir-general-totals");  
      if (!totalContainer) {
        totalContainer = document.createElement("div");
        totalContainer.id = "decir-general-totals";
        totalContainer.style.marginTop = "8px";
        (tbody.closest("div") || document.body).appendChild(totalContainer);
      }  
      const colSpanEmpty = tbody.querySelector("tr").children.length - 2;  
      totalContainer.innerHTML = `
        <table style="width:100%; border-collapse:collapse; border:none; margin: 0 0 10px 0;">
          ${[
            ["Total AMAL:", totalAmalCents / 100, ""],
            ["Total ANEPC:", totalAnepcCents / 100, ""],
            ["Total GLOBAL:", totalGlobalCents / 100, "font-size: 14px; color:#8B0000;"]
          ].map(([label, value, style]) => `
            <tr>
              <td colspan="${colSpanEmpty}" style="border:none; background-color:#fff;"></td>
              <td style="text-align:left; width:100px; border:1px solid #ccc;"><strong>${label}</strong></td>
              <td style="text-align:right; font-weight:bold; ${style} width:116px;border:1px solid #ccc;">${formatCurrency(value)}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }
    
    function formatNumber(value) {
      return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    function formatCurrency(value) {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        useGrouping: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    function updateDECIRTotalPaymentsByMonth() {
      const table = document.querySelector("table.pag-table");
      if (!table) return;
      const tbody = table.querySelector("tbody");
      if (!tbody) return;
      const parseCurrencyToCents = (cell) => {
        if (!cell) return 0;
        const text = cell.textContent.replace(/[€\s]/g,"").replace(/\./g,"").replace(",",".");
        return Math.round((parseFloat(text)||0)*100);
      };
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const grandTotalCents = rows.reduce((acc, tr) => {
        const tds = Array.from(tr.querySelectorAll("td"));
        const lastCell = tds[tds.length-1];
        return acc + parseCurrencyToCents(lastCell);
      }, 0);
      const grandTotal = grandTotalCents / 100;
      let totalContainer = document.getElementById("decir-payment-totals");
      const cardBody = document.querySelector("#decir-pag .card-body");
      if (!cardBody) return;
      if (!totalContainer) {
        totalContainer = document.createElement("div");
        totalContainer.id = "decir-payment-totals";
        totalContainer.style.margin = "5px 0 0 0";
        totalContainer.style.width = "100%";
        totalContainer.style.display = "none";
        cardBody.appendChild(totalContainer);
      }
      totalContainer.innerHTML = `
        <div style="display:flex; justify-content:flex-end; font-size:16px; font-weight:bold;">
          <div style="padding:8px 10px; border:1px solid #ccc; border-right:0; background:#f7f7f7; width:163px; text-align:right; border-top-left-radius:5px; border-bottom-left-radius:5px;">
            TOTAL A PAGAR:
          </div>
          <div style="padding:8px 10px; border:1px solid #ccc; background:#e0f7e0; color:#006400; width:203px; text-align:right; border-top-right-radius:5px; border-bottom-right-radius:5px;">
            ${formatCurrency(grandTotal)}
          </div>
        </div>
      `;
      totalContainer.style.display = "flex";
      totalContainer.style.justifyContent = "flex-end";
    }
    
    function updateDECIRTotalCodA33() {
      const table = document.querySelector("#table-container-dec-coda33 table");
      if (!table) return;
      const tbody = table.querySelector("tbody");
      if (!tbody) return;
      const existingTotalRow = tbody.querySelector(".total-coda33");
      if (existingTotalRow) existingTotalRow.remove();
      const headerCells = Array.from(table.querySelector("thead tr").children);
      const monthNames = ["ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO"];
      const monthIndices = monthNames.map(name => headerCells.findIndex(th => th.textContent.trim().toUpperCase() === name));
      const monthSums = monthIndices.map(() => 0);
      const parseCurrencyToCents = (txt) => {
        if (!txt) return 0;
        const text = txt.replace(/[€\s]/g,"").replace(/\./g,"").replace(",",".");
        return Math.round((parseFloat(text)||0)*100);
      };
      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.forEach(tr => {
        const tds = Array.from(tr.querySelectorAll("td"));
        monthIndices.forEach((idx,i) => {
          if (idx >= 0 && tds[idx]) {
            monthSums[i] += parseCurrencyToCents(tds[idx].textContent.trim());
          }
        });
      });
      const grandTotal = monthSums.reduce((a,b)=>a+b,0);
      const totalRow = document.createElement("tr");
      totalRow.className = "total-coda33";
      totalRow.style.fontWeight = "bold";
      totalRow.style.backgroundColor = "#e0f7e0";
      const tdFixed = document.createElement("td");
      tdFixed.textContent = "Somatórios:";
      tdFixed.colSpan = 3;
      tdFixed.style.textAlign = "right";
      tdFixed.style.backgroundColor = "#f7f7f7";
      totalRow.appendChild(tdFixed);
      monthSums.forEach(sum => {
        const td = document.createElement("td");
        td.textContent = formatCurrency(sum/100);
        td.style.textAlign = "right";
        totalRow.appendChild(td);
      });
      const tdTotal = document.createElement("td");
      tdTotal.textContent = formatCurrency(grandTotal/100);
      tdTotal.style.textAlign = "right";
      tdTotal.style.backgroundColor = "#c0ffc0";
      totalRow.appendChild(tdTotal);
      tbody.appendChild(totalRow);
    }
    /* ================= CLEAR REGISTRATION TABLE =================== */
    async function clearDecirTable() {
      const tableContainer = document.getElementById("table-container-dec-reg");
      if (!tableContainer) return;    
      const monthBtn = document.querySelector("#months-container-dec-reg .btn.active");
      if (!monthBtn) {
        alert("Nenhum mês selecionado.");
        return;
      }    
      const month = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthBtn) + 1;
      const year = parseInt(document.getElementById("year-dec-reg").value, 10);    
      if (!confirm(`Tem certeza que quer limpar os dados de ${monthBtn.textContent.trim()} de ${year}?`)) return;    
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/decir_reg_pag?year=eq.${year}&month=eq.${month}`,
          { method: "DELETE", headers: getSupabaseHeaders() }
        );    
        if (!res.ok) throw new Error(await res.text() || "Erro ao apagar dados");    
        showPopupSuccess(`✅ Dados de ${monthBtn.textContent.trim()} de ${year} apagados com sucesso!`);
      } catch (err) {
        console.error(err);
        alert("❌ Erro ao apagar: " + err.message);
      }
    }
    /* =================== SAVE DATA RECORD TABLE =================== */
    async function saveDecirFull() {
      const table = document.querySelector("#table-container-dec-reg table tbody");
      if (!table) {
        alert("Nenhuma tabela aberta.");
        return;
      }
      const year = parseInt(document.getElementById("year-dec-reg").value, 10);
      const monthBtn = document.querySelector("#months-container-dec-reg .btn.active");
      if (!monthBtn) {
        alert("Nenhum mês selecionado.");
        return;
      }
      const month = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthBtn) + 1;
      const guardarBtn = document.getElementById("guardar-dec-btn");
      if (guardarBtn) {
        guardarBtn.disabled = true;
        guardarBtn.textContent = "A gravar...";
      }
      try {
        const rows = Array.from(table.querySelectorAll("tr"));
        const payload = [];
        let last_n_int = null;
        let last_abv_name = null;
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll("td"));
          let n_int_raw = (cells[0]?.textContent || "").trim();
          let n_int = parseInt(n_int_raw, 10);
          if (isNaN(n_int)) n_int = last_n_int;
          let nameRaw = (cells[1]?.textContent || "").trim();
          if (nameRaw === "X") nameRaw = "";
          let abv_name = nameRaw || last_abv_name;
          if (!n_int || !abv_name) return;
          last_n_int = n_int;
          if (nameRaw) last_abv_name = nameRaw;
          const turnoCell = cells.find(td => {
            const t = (td.textContent || "").trim();
            return t === "D" || t === "N";
          });
          if (!turnoCell) return;
          const turno = turnoCell.textContent.trim();
          const dayCells = cells.filter(td => td.isContentEditable);
          dayCells.forEach((cell, index) => {
            if (cell.textContent.trim().toUpperCase() === "X") {
              payload.push({n_int, abv_name, year, month, day: index + 1, turno});
            }
          });
        });
        const deleteRes = await fetch(
          `${SUPABASE_URL}/rest/v1/decir_reg_pag?year=eq.${year}&month=eq.${month}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        );
        if (!deleteRes.ok) {
          const errText = await deleteRes.text();
          throw new Error("Erro ao limpar registos antigos: " + errText);
        }
        if (payload.length > 0) {
          const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_pag`, {
            method: "POST",
            headers: {
              ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(payload)
          });
          if (!insertRes.ok) {
            const errText = await insertRes.text();
            throw new Error(errText || "Erro desconhecido ao gravar no Supabase");
          }
        }
        showPopupSuccess("✅ Registo DECIR gravado com sucesso!");
      } catch (err) {
        console.error(err);
        alert("❌ Erro ao gravar: " + err.message);
      } finally {
        if (guardarBtn) {
          guardarBtn.disabled = false;
          guardarBtn.textContent = "Guardar";
        }
      }
    }
    /* ===================== EMIT GLOBAL REPORTS (CORRIGIDO) ==================== */
    async function generateDECIRFiles(type) {
      let data = { type };    
      /* ========================== REGISTERS ========================= */
      if (type === 'reg') {
        const table = document.querySelector("#table-container-dec-reg table tbody");
        if (!table) return alert("Tabela de registo diário não encontrada.");        
        const monthSelect = document.querySelector("#months-container-dec-reg .btn.active");
        const yearInput = document.getElementById("year-dec-reg");
        if (!monthSelect || !yearInput) return alert("Selecione mês e ano.");        
        const monthIdx = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthSelect) + 1;
        const monthName = monthSelect.textContent.trim();
        const year = parseInt(yearInput.value, 10);
        const daysInMonth = new Date(year, monthIdx, 0).getDate();        
        const weekdays = [];
        const holidayDays = [];
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, monthIdx - 1, d);
          const wd = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][date.getDay()];
          weekdays.push(wd);
          if (date.getDay() === 0 || date.getDay() === 6) holidayDays.push(d);
        }        
        const rows = Array.from(table.querySelectorAll("tr")).filter(tr => !tr.classList.contains("total-elements-row"));
        let lastNI = null, lastNome = null, lastAmal = null, lastAnepc = null, lastGlobal = null;
        const fixedRows = [], normalRows = [];        
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll("td"));
          if (!cells.length) return;          
          let nInt, nome, turno, startIdx;          
          if (cells[0].rowSpan === 2) {
            nInt = parseInt(cells[0].textContent.trim(), 10);
            nome = cells[1].textContent.trim();
            turno = cells[3]?.textContent.trim() || 'D';
            startIdx = 4;
            lastNI = nInt;
            lastNome = nome;            
            const parseValue = (txt) => parseFloat(txt.trim().replace(/\s/g,'').replace(/\./g,'').replace(',','.')) || 0;
            lastAmal = parseValue(cells[cells.length - 3].textContent);
            lastAnepc = parseValue(cells[cells.length - 2].textContent);
            lastGlobal = parseValue(cells[cells.length - 1].textContent);
          } else {
            nInt = lastNI;
            nome = lastNome;
            turno = cells[0].textContent.trim();
            startIdx = 1;
          }          
          const daysData = {};
          for (let d = 0; d < daysInMonth; d++) {
            const cell = cells[startIdx + d];
            daysData[d + 1] = { D: '', N: '' };
            if (cell && cell.textContent.trim().toUpperCase() === 'X') {
              daysData[d + 1][turno] = 'X';
            }
          }          
          const rowObj = {ni: nInt, nome, days: daysData, amal: lastAmal, anepc: lastAnepc, global: lastGlobal};          
          turno === 'D' ? fixedRows.push(rowObj) : normalRows.push(rowObj);
        });        
        data = {...data, fileName: `REGISTOS_DECIR_${monthName}_${year}`, monthName, year, daysInMonth, weekdays, holidayDays, fixedRows, normalRows };
      /* ========================== PAYMENTS ========================== */
      } else if (type === 'pag') {
        const table = document.querySelector("#table-container-dec-pag table tbody");
        if (!table) return alert("Tabela de pagamentos não encontrada.");        
        const monthSelect = document.querySelector("#months-container-dec-pag .btn.active");
        const yearInput = document.getElementById("year-dec-pag");
        if (!monthSelect || !yearInput) return alert("Selecione mês e ano.");        
        const monthName = monthSelect.textContent.trim();
        const year = parseInt(yearInput.value, 10);        
        const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
          const cells = tr.querySelectorAll("td");
          return {
            ni: parseInt(cells[0].textContent.trim(), 10),
            nome: cells[1]?.textContent.trim() || "",
            nif: cells[2]?.textContent.trim() || "",
            nib: cells[3]?.textContent.trim() || "",
            qtdTurnos: parseInt(cells[4]?.textContent.trim() || 0, 10),
            valor: parseFloat(
              cells[5]?.textContent
                .trim()
                .replace(/\s/g, '')
                .replace("€", '')
                .replace(",", ".")
              || 0
            )
          };
        });        
        data = {...data, fileName: `PAGAMENTOS_DECIR_${monthName}_${year}`, monthName, year, rows};
      /* ========================== COD A33 =========================== */
      } else if (type === 'code_a33') {
        const table = document.querySelector("#table-container-dec-coda33 tbody");
        if (!table) return alert("Tabela Cod.A33 não encontrada.");
        const yearInput = document.getElementById("year-dec-pag");
        if (!yearInput) return alert("Selecione mês e ano.");
        const year = parseInt(yearInput.value, 10);
        const parseCurrency = (txt) => {
          if (!txt) return 0;
          return parseFloat(txt.replace('€', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        };
        const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
          const cells = tr.querySelectorAll("td");
          return {
            ni: parseInt(cells[0]?.textContent.trim(), 10) || 0,
            nome: cells[1]?.textContent.trim() || '',
            nif: cells[2]?.textContent.trim() || '',
            ABRIL: parseCurrency(cells[4]?.textContent),
            MAIO: parseCurrency(cells[6]?.textContent),
            JUNHO: parseCurrency(cells[8]?.textContent),
            JULHO: parseCurrency(cells[10]?.textContent),
            AGOSTO: parseCurrency(cells[12]?.textContent),
            SETEMBRO: parseCurrency(cells[14]?.textContent),
            OUTUBRO: parseCurrency(cells[16]?.textContent),
          };
        }).filter(r => {
          const hasNI = r.ni > 0;
          const hasValues = r.ABRIL || r.MAIO || r.JUNHO || r.JULHO || r.AGOSTO || r.SETEMBRO || r.OUTUBRO;
          return hasNI && hasValues;
        });    
        console.log("Dados Cod.A33 a enviar:", rows);
        data = {...data, fileName: `CODA33_DECIR_${year}`, year, rows};
      /* ========================== ANEPC ============================= */
      } else if (type === 'anepc') {
        const table = document.querySelector(".anepc-table tbody");
        if (!table) return alert("Tabela ANEPC não encontrada. Certifique-se de que foi gerada.");        
        const monthSelect = document.querySelector("#months-container-dec-anepc .btn.active");
        const yearInput = document.getElementById("year-dec-anepc");        
        const monthName = monthSelect ? monthSelect.textContent.trim() : 'MÊS';
        const year = yearInput ? parseInt(yearInput.value, 10) : new Date().getFullYear();        
        const parseCurrency = (txt) => {
          if (!txt) return 0;
          return parseFloat(txt.replace('€', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        };        
        const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
          const cells = tr.querySelectorAll("td");
          if (cells.length < 5) return null;          
          return {
            niFile: cells[0]?.textContent.trim() || '',
            funcao: cells[1]?.textContent.trim() || '',
            nome: cells[2]?.textContent.trim() || '',
            qtdTurnos: parseInt(cells[3]?.textContent.trim() || 0, 10),
            valor: parseCurrency(cells[4]?.textContent)
          };
        }).filter(r => r && (r.qtdTurnos > 0 || r.valor > 0));        
        console.log("Dados ANEPC a enviar:", rows);
        data = { ...data, fileName: `RELATORIO_ANEPC_${monthName}_${year}`, monthName, year, rows };
      }
      /* ========================== FETCH API ========================= */
      try {
        const res = await fetch("https://cb360-mobile.vercel.app/api/decir_reg_pag/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });        
        if (!res.ok) {
          const err = await res.json();
          return alert("Erro: " + (err.details || err.error));
        }        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.fileName + ".xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);        
      } catch (err) {
        alert("Erro ao gerar Excel: " + err.message);
      }
    }
    /* ========================== EVENT LISTENERS ========================= */
    document.getElementById("emit-pag-dec-btn")?.addEventListener("click", () => generateDECIRFiles('pag'));
    document.getElementById("emit-reg-dec-btn")?.addEventListener("click", () => generateDECIRFiles('reg'));
    document.getElementById("emit-coda33-dec-btn")?.addEventListener("click", () => generateDECIRFiles('code_a33'));
    document.getElementById("emit-anepc-dec-btn")?.addEventListener("click", () => generateDECIRFiles('anepc'));
    /* =================== HANDLER COD A33 BUTTON =================== */
    async function handleCodA33Button() {
      console.log("Cod.A33 clicked");
      const tableContainer = document.getElementById("table-container-dec-coda33");
      const optionsContainer = document.getElementById("decir-pag-options");
      if (!tableContainer || !optionsContainer) return console.warn("Containers não encontrados");  
      optionsContainer.style.display = "none";
      const yearSelect = document.getElementById("year-dec-pag");
      const year = yearSelect ? parseInt(yearSelect.value, 10) : new Date().getFullYear();
      try {
        const elements = await loadDecirCodA33Elements();
        console.log("elements:", elements);
        const months = Array.from({length: 7}, (_, i) => i + 4);
        const turnosPromises = months.map(m => loadShiftsByNI(year, m));
        const turnosArray = await Promise.all(turnosPromises);
        const turnosPorMes = {};
        months.forEach((m, i) => turnosPorMes[m] = turnosArray[i]);
        console.log("turnosPorMes:", turnosPorMes);
        if (!elements.length) {
          tableContainer.innerHTML = "<p style='text-align:center'>Nenhum elemento encontrado.</p>";
          return;
        }
        createDecirCodA33Table("table-container-dec-coda33", year, elements, turnosPorMes);
        updateDECIRTotalCodA33();
        optionsContainer.style.display = "flex";
      } catch (err) {
        console.error("Erro ao carregar Cod.A33:", err);
        tableContainer.innerHTML = "<p style='text-align:center;color:red'>Erro ao carregar dados anuais.</p>";
      }
    }
