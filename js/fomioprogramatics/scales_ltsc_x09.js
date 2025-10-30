    /* =======================================
       FOMIO 360 PROGRAMATICS
    ======================================= */
    /* =======================================
       SCALES MOULE
    ======================================= */
    /* =  SCALES DYNAMIC TABLE - MAIN INIT  */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        const access = btn.dataset.access;
        if (page === "page-scales") {
          const header = document.getElementById("scales-card-header");
          if (header) {
            if (access === "Emissão Escala") {
              header.textContent = "EMISSÃO DE ESCALAS";
            } else if (access === "Consultar Escalas") {
              header.textContent = "CONSULTA DE ESCALAS";
            } else {
              header.textContent = `ESCALA DE SERVIÇO ${access.toUpperCase()}`;
            }
          }
        }
      });
    });
    let currentSection = "1ª Secção";
    let currentTableData = [];
    const yearAtual = new Date().getFullYear();
    document.addEventListener("DOMContentLoaded", () => {
      createMonthButtons("months-container", "table-container", yearAtual);
      initSidebarSecaoButtons();
      initSaveButton();
      const emitBtn = document.getElementById("emit-button");
      if (!emitBtn) return;
      emitBtn.addEventListener("click", () => {
        if (currentSection === "Emissão Escala") {
          initScaleEmission();
        }
      });
    });
    /* =========  SIDEBAR BUTTONS ========== */
    function initSidebarSecaoButtons() {
      document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
        btn.addEventListener("click", async () => {
          currentSection = btn.getAttribute("data-access");
          createMonthButtons("months-container", "table-container", yearAtual);
          document.getElementById("table-container").innerHTML = "";
          document.querySelectorAll(".btn.btn-add").forEach(b => b.classList.remove("active"));
          const saveButton = document.getElementById("save-button");
          const emitButton = document.getElementById("emit-button");
          if (saveButton) saveButton.style.display = "none";
          if (emitButton) emitButton.style.display = "none";
        });
      });
    }
    /* ==========  MONTH BUTTONS =========== */
    function createMonthButtons(containerId, tableContainerId, year) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const saveBtn = document.getElementById("save-button");
      const emitBtn = document.getElementById("emit-button");
      container.innerHTML = "";
      if (emitBtn) emitBtn.style.marginTop = "20px";
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const blockedMonthsForDecir = [0, 1, 2, 10, 11];
      const toggleButtonsVisibility = (showSave, showEmit) => {
        if (saveBtn) saveBtn.style.display = showSave ? "inline-block" : "none";
        if (emitBtn) emitBtn.style.display = showEmit ? "inline-block" : "none";
      };
      const clearActiveState = () => {
        container.querySelectorAll(".btn.btn-add").forEach(b => b.classList.remove("active"));
      };
      const loadSectionData = async () => {
        switch (currentSection) {
          case "Emissão Escala":
          case "Consultar Escalas":
            return await loadAllSectionsData();
          case "DECIR":
            return await loadDecirData();
          default:
            return await loadSetionData(currentSection);
        }
      };
      monthNames.forEach((month, index) => {
        const btn = document.createElement("button");
        btn.textContent = month;
        Object.assign(btn, {
          className: "btn btn-add",
        });
        Object.assign(btn.style, {
          fontSize: "14px",
          fontWeight: "bold",
          width: "122px",
          height: "40px",
        });
        btn.addEventListener("click", async () => {
          const tableContainer = document.getElementById(tableContainerId);
          const isActive = btn.classList.contains("active");
          if (isActive) {
            btn.classList.remove("active");
            tableContainer.innerHTML = "";
            toggleButtonsVisibility(false, false);
            return;
          }
          if (currentSection === "DECIR" && blockedMonthsForDecir.includes(index)) {
            showPopupWarning(`Durante o mês de ${month}, não existe DECIR.`);
            return;
          }
          clearActiveState();
          btn.classList.add("active");
          if (currentSection === "Emissão Escala") {
            toggleButtonsVisibility(false, true);
          } else if (currentSection === "Consultar Escalas") {
            toggleButtonsVisibility(false, false);
          } else {
            toggleButtonsVisibility(true, false);
          }
          const data = await loadSectionData();
          createMonthTable(tableContainerId, year, index + 1, data);
          handleLegend(tableContainerId);
        });
        container.appendChild(btn);
      });
    }
    /* ============  LOAD DATA ============ */
    async function loadSetionData(secao) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,abv_name,patent_abv,MP,TAS&section=eq.${secao}&n_int=lt.500&elem_state=eq.true`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar dados da secção");
        const data = await response.json();
        return data.sort((a, b) => parseInt(a.n_int, 10) - parseInt(b.n_int, 10));
      } catch (err) {
        console.error(err);
        return [];
      }
    }
    async function loadDecirData() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,abv_name,patent_abv,MP&elem_state=eq.true`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar dados do DECIR");
        const data = await response.json();
        return data
          .filter(item => parseInt(item.n_int, 10) > 8 && parseInt(item.n_int, 10) < 400)
          .sort((a, b) => parseInt(a.n_int, 10) - parseInt(b.n_int, 10));
      } catch (err) {
        console.error(err);
        return [];
      }
    }
    async function loadAllSectionsData() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,abv_name,patent_abv&n_int=gte.003&n_int=lt.500&elem_state=eq.true`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao buscar dados de todas as secções");
        const data = await response.json();
        const uniqueData = [];
        const seenNInt = new Set();
        data.forEach(item => {
          const nInt = parseInt(item.n_int, 10);
          if (!seenNInt.has(nInt)) {
            seenNInt.add(nInt);
            uniqueData.push(item);
          }
        });
        return uniqueData.sort((a, b) => parseInt(a.n_int, 10) - parseInt(b.n_int, 10));
      } catch (err) {
        console.error(err);
        return [];
      }
    }
    async function loadSavedData(section, year, month) {
      try {
        let query = `${SUPABASE_URL}/rest/v1/reg_serv?select=n_int,day,value`;
        if (section === "Emissão Escala") {
          query += `&year=eq.${year}&month=eq.${month}`;
        } else {
          query += `&section=eq.${section}&year=eq.${year}&month=eq.${month}`;
        }
        const response = await fetch(query, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error("Erro ao buscar dados salvos");
        const data = await response.json();
        const map = {};
        data.forEach(item => {
          const nIntStr = String(item.n_int).padStart(3, '0');
          const key = `${nIntStr}_${item.day}`;
          if (section === "Emissão Escala" && map[key]) {
            map[key] = "EP";
          } else if (map[key]) {
            map[key] += `/${item.value}`;
          } else {
            map[key] = item.value;
          }
        });
        return map;
      } catch (err) {
        console.error(err);
        return {};
      }
    }
    /* ===== CELL COLORS CONFIGURATION ==== */
    const CELL_COLORS = {PD: {background: "#2fc41a", color: "#fff"}, PN: {background: "#add8e6", color: "#000"}, PT: {background: "#183b7a", color: "#fff"},
                         BX: {background: "#ed1111", color: "#fff"}, FO: {background: "#b3b3b3", color: "#000"}, FE: {background: "#995520", color: "#fff"},
                         FD: {background: "#519294", color: "#fff"}, FN: {background: "#4f1969", color: "#fff"}, ED: {background: "#b6fcb6", color: "#000"},
                         EN: {background: "#1e3a8a", color: "#fff"}, ET: {background: "#006400", color: "#fff"}, EP: {background: "#ff9800", color: "#000"},
                         N: {background: "#383838", color: "#fff"}};
    const WEEKEND_COLOR = "#f9e0b0";
    const TRANSPARENT = "transparent";
    const WHITE = "#fff";
    const BLACK = "#000";

    function updateCellColor(td, value, date) {
      value = value.toUpperCase();
      if (CELL_COLORS[value]) {
        td.style.background = CELL_COLORS[value].background;
        td.style.color = CELL_COLORS[value].color;
        return;
      }
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      td.style.background = isWeekend ? WEEKEND_COLOR : (value === "" ? TRANSPARENT : WHITE);
      td.style.color = BLACK;
    }
    /* =======================================
       CONFLICT VALIDATION
    ======================================= */
    const CONFLICT_MESSAGES = {
      DECIR_TO_PIQUETE: "Elemento já escalado para serviço de Piquete, selecione apenas ED ou solicite ao Chefe de Secção a remoção do elemento do serviço de Piquete!",
      PIQUETE_TO_DECIR: "Elemento já escalado para serviço de DECIR, selecione outro dia ou solicite ao responsável pela escala de DECIR a remoção do elemento do serviço de DECIR!"
    };
    async function checkConflict(section, n_int, year, month, day, newValue) {
      try {
        const value = newValue.toUpperCase();
        const params = {n_int, year, month, day};
        if (section === "DECIR" && ["EN", "ET"].includes(value)) {
          if (await hasConflict(params, "PN")) {
            return CONFLICT_MESSAGES.DECIR_TO_PIQUETE;
          }
        }
        if (section !== "DECIR" && value === "PN") {
          if (await hasConflict({
              ...params,
              section: "DECIR"
            }, ["EN", "ET"])) {
            return CONFLICT_MESSAGES.PIQUETE_TO_DECIR;
          }
        }
        return null;
      } catch (err) {
        console.error("Erro ao verificar conflitos:", err);
        return null;
      }
    }
    async function hasConflict(params, values) {
      const valueQuery = Array.isArray(values) ?
        `in.(${values.join(",")})` :
        `eq.${values}`;
      const query = Object.entries(params)
        .map(([k, v]) => `${k}=eq.${v}`)
        .join("&");
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/reg_serv?select=value&${query}&value=${valueQuery}`, {
          headers: getSupabaseHeaders()
        }
      );
      if (!resp.ok) throw new Error(`Erro ao verificar conflito: ${resp.status}`);
      const data = await resp.json();
      return data.length > 0;
    }
    /* ======== CREATE SCALE TABLE ======== */
    /* ============= CONSTANTS ============ */
    const TITLE_MAIN_STYLE = "text-align: center; margin-top: 30px; background: #ffcccc; padding: 8px; font-weight: bold; font-size: 18px;"
    const TITLE_SUB_STYLE = "text-align: center; margin-bottom: 5px; margin-top: -15px; font-size: 14px; background: #ffcccc; padding: 6px;"
    const TITLE_MONTHYEAR_STYLE = "text-align: center; margin-bottom: -15px; font-size: 14px; font-weight: bold; background: #ffffcc; padding: 6px;"
    const COMMON_TH_STYLE = "border: 1px solid #ccc; border-top: 0px solid #ccc; border-left: 0px solid #ccc; width: 35px; padding: 2px; font-size: 11px; text-align: center; background: #f0f0f0;";
    const COMMON_THTOTAL_STYLE = "border: 1px solid #ccc; border-top: 0px solid #ccc; border-left: 0px solid #ccc; padding: 2px; text-align: center; font-size: 10px; width: 30px;"
    const COMMON_TD_STYLE = "border: 1px solid #ccc; border-top: 0px solid #ccc; border-left: 0px solid #ccc; padding: 4px; text-align: center; font-size: 13px; width: 35px;";
    const COMMON_TDSPECIAL_STYLE = "font-weight: bold; font-size: 15px; background: #2b284f; color: #cfcfcf; height: 12px; line-height: 12px;"
    const COMMON_TDTOTAL_STYLE = "border: 1px solid #ccc; border-top: 0px solid #ccc; border-left: 0px solid #ccc; padding: 4px; width: 30px; text-align: center; font-weight: bold";
    const COMMON_TDLABEL_STYLE = "border: 1px solid #ccc; border-top: 0px solid #ccc; border-bottom: 0px solid #ccc; border-left: 0px solid #ccc; padding: 4px; width: 30px; text-align: center; font-weight: bold";
    const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    /* == AUXILIARY CALCULATION FUNCTIONS = */
    function computeTotalValue(value, isDecir) {
      if (!value) return 0;
      if (isDecir) {
        if (["ED", "EN", "EP"].includes(value)) return 1;
        if (value === "ET") return 2;
      } else {
        if (["PN", "EP", "N"].includes(value)) return 1;
        if (value === "PT") return 2;
      }
      return 0;
    }

    function applyTotalCellStyle(cell, total, isDecir, threshold = 4) {
      if (cell.parentElement.classList.contains("totals-row")) {
        return;
      }
      if (isDecir) {
        cell.style.background = "#f0f0f0";
        cell.style.color = "#000";
      } else {
        if (total >= threshold) {
          cell.style.background = "green";
          cell.style.color = "white";
        } else {
          cell.style.background = "red";
          cell.style.color = "white";
        }
      }
    }
    /* ======== CREATION OF TITLES ======== */
    function createTableHeaders(container, year, month, section) {
      const titleMain = document.createElement("h2");
      titleMain.textContent = "ESCALA DE SERVIÇO";
      titleMain.style.cssText = TITLE_MAIN_STYLE;
      container.appendChild(titleMain);
      if (section !== "Emissão Escala" && section !== "Consultar Escalas") {
        const titleSub = document.createElement("h3");
        titleSub.textContent = section ? section.toUpperCase() : "";
        titleSub.style.cssText = TITLE_SUB_STYLE;
        container.appendChild(titleSub);
      }
      const titleMonthYear = document.createElement("h3");
      titleMonthYear.textContent = `${MONTH_NAMES[month - 1]} ${year}`;
      titleMonthYear.style.cssText = TITLE_MONTHYEAR_STYLE;
      container.appendChild(titleMonthYear);
    }
    /* ========= CREATION OF THE TABLE STRUCTURE ========= */
    function createTableWrapper(container) {
      let wrapper = container.querySelector(".table-container");
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "table-container";
        container.appendChild(wrapper);
      }
      wrapper.innerHTML = "";
      wrapper.style.position = "relative";
      wrapper.style.maxHeight = "75vh";
      wrapper.style.height = "370px";
      wrapper.style.overflowY = "auto";
      return wrapper;
    }

    function createTableStructure(wrapper) {
      const table = document.createElement("table");
      table.className = "month-table";
      table.style.width = "100%";
      table.style.borderCollapse = "separated";
      const thead = document.createElement("thead");
      const trWeekdays = document.createElement("tr");
      ["NI", "Nome", "Catg."].forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.rowSpan = 2;
        th.style.cssText = COMMON_TH_STYLE;
        th.style.width = i === 0 ? "50px" : i === 1 ? "150px" : "50px";
        trWeekdays.appendChild(th);
      });
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-header-${d}`;
        th.style.cssText = COMMON_TH_STYLE;
        trWeekdays.appendChild(th);
      }
      const thTotal = document.createElement("th");
      thTotal.textContent = "TOTAL";
      thTotal.rowSpan = 2;
      thTotal.style.cssText = COMMON_THTOTAL_STYLE;
      trWeekdays.appendChild(thTotal);
      thead.appendChild(trWeekdays);
      const trNumbers = document.createElement("tr");
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-number-${d}`;
        th.textContent = d;
        th.style.cssText = COMMON_TH_STYLE;
        trNumbers.appendChild(th);
      }
      thead.appendChild(trNumbers);
      table.appendChild(thead);
      table.appendChild(document.createElement("tbody"));
      wrapper.appendChild(table);
      return table;
    }
    /* ========= DAY HEADER UPDATE ======== */
    function updateDayHeaders(table, year, month, daysInMonth) {
      for (let d = 1; d <= 31; d++) {
        const h = table.querySelector(`.day-header-${d}`);
        const n = table.querySelector(`.day-number-${d}`);
        if (d <= daysInMonth) {
          const date = new Date(year, month - 1, d);
          h.textContent = date.toLocaleDateString("pt-PT", {
              weekday: "short"
            })
            .toUpperCase().slice(0, 3);
          h.style.display = "";
          n.style.display = "";
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          h.style.background = isWeekend ? "#f9e0b0" : "#f0f0f0";
          n.style.background = isWeekend ? "#f9e0b0" : "#f0f0f0";
        } else {
          h.style.display = "none";
          n.style.display = "none";
        }
      }
    }
    /* ======== CREATING DAY CELLS ======== */
    function createDayCellWithListeners(d, tr, year, month, savedMap, section, daysInMonth, calculateRowTotal, calculateColumnTotals) {
      const td = document.createElement("td");
      td.className = `day-cell-${d}`;
      td.contentEditable = section !== "Emissão Escala" && section !== "Consultar Escalas";
      td.style.cssText = COMMON_TD_STYLE;
      td.style.fontWeight = "bold";
      td.addEventListener("focus", () => {
        const range = document.createRange();
        range.selectNodeContents(td);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
      td.addEventListener("input", async (e) => {
        let value = td.textContent.toUpperCase().slice(0, 2);
        if (td.textContent !== value) {
          const sel = window.getSelection();
          td.textContent = value;
          if (td.firstChild) sel.collapse(td.firstChild, value.length);
        }
        const dayNum = parseInt(td.className.match(/day-cell-(\d+)/)[1], 10);
        const n_int = parseInt(tr.getAttribute("data-nint"), 10);
        const conflictMsg = await checkConflict(section, n_int, year, month, dayNum, value);
        if (conflictMsg) {
          showPopupWarning(conflictMsg);
          td.textContent = "";
          const date = new Date(year, month - 1, dayNum);
          td.style.background = date.getDay() === 0 || date.getDay() === 6 ? "#f9e0b0" : "transparent";
          td.style.color = "#000";
          calculateRowTotal(tr, section, daysInMonth);
          calculateColumnTotals(tr.parentElement, section, daysInMonth);
          return;
        }
        updateCellColor(td, value, new Date(year, month - 1, dayNum));
        calculateRowTotal(tr, section, daysInMonth);
        calculateColumnTotals(tr.parentElement, section, daysInMonth);
        if (section === "DECIR") {
          calculateMPTotals(tr.parentElement, daysInMonth, currentTableData);
        }
        if (value.length === 2) {
          const nextTd = td.nextElementSibling;
          if (nextTd && nextTd.contentEditable === "true") nextTd.focus();
        }
      });
      td.addEventListener("keydown", (e) => {
        const cells = Array.from(tr.querySelectorAll("td")).filter(c => c.contentEditable === "true");
        const idx = cells.indexOf(td);
        switch (e.key) {
          case "ArrowRight":
            if (cells[idx + 1]) {
              e.preventDefault();
              cells[idx + 1].focus();
            }
            break;
          case "ArrowLeft":
            if (cells[idx - 1]) {
              e.preventDefault();
              cells[idx - 1].focus();
            }
            break;
          case "ArrowUp":
            if (tr.previousElementSibling) {
              const prevRowCells = Array.from(tr.previousElementSibling.querySelectorAll("td"))
                .filter(c => c.contentEditable === "true");
              if (prevRowCells[idx]) {
                e.preventDefault();
                prevRowCells[idx].focus();
              }
            }
            break;
          case "ArrowDown":
            if (tr.nextElementSibling) {
              const nextRowCells = Array.from(tr.nextElementSibling.querySelectorAll("td"))
                .filter(c => c.contentEditable === "true");
              if (nextRowCells[idx]) {
                e.preventDefault();
                nextRowCells[idx].focus();
              }
            }
            break;
        }
      });
      td.addEventListener("blur", async () => {
        const dayNum = parseInt(td.className.match(/day-cell-(\d+)/)[1], 10);
        const n_int = parseInt(tr.getAttribute("data-nint"), 10);
        const value = td.textContent.toUpperCase().slice(0, 2);
        const nIntStr = String(n_int).padStart(3, "0");
        savedMap[`${nIntStr}_${dayNum}`] = value;
      });
      return td;
    }
    /* ====== CREATION OF FIXED CELLS ===== */    
    function createFixedDayCellWithListeners(d, fixedRow, year, month, savedMap, nIntStr, daysInMonth, calculateRowTotal, calculateColumnTotals) {
      const td = document.createElement("td");
      td.className = `fixed-day-cell-${d}`;
      td.contentEditable = currentSection !== "Consultar Escalas";
      td.style.cssText = COMMON_TD_STYLE;
      td.style.fontWeight = "bold";
      td.textContent = savedMap[`${nIntStr}_${d}`] ? savedMap[`${nIntStr}_${d}`].toUpperCase() : "";
      const date = new Date(year, month - 1, d);
      updateCellColor(td, td.textContent, date);
      td.addEventListener("focus", () => {
        const range = document.createRange();
        range.selectNodeContents(td);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
      td.addEventListener("input", () => {
        let value = td.textContent.toUpperCase().slice(0, 1);
        if (td.textContent !== value) td.textContent = value;
        updateCellColor(td, value, date);
        calculateRowTotal(fixedRow, currentSection, daysInMonth);
        calculateColumnTotals(fixedRow.parentElement, currentSection, daysInMonth);
        const cells = Array.from(fixedRow.querySelectorAll("td"))
          .filter(c => c.contentEditable === "true");
        const idx = cells.indexOf(td);
        if (value.length === 1 && cells[idx + 1]) cells[idx + 1].focus();
      });
      td.addEventListener("blur", () => {
        savedMap[`${nIntStr}_${d}`] = td.textContent.toUpperCase().slice(0, 1);
      });
      td.addEventListener("keydown", (e) => {
        const cells = Array.from(fixedRow.querySelectorAll("td"))
          .filter(c => c.contentEditable === "true");
        const idx = cells.indexOf(td);
        switch (e.key) {
          case "ArrowRight":
            if (cells[idx + 1]) {
              e.preventDefault();
              cells[idx + 1].focus();
            }
            break;
          case "ArrowLeft":
            if (cells[idx - 1]) {
              e.preventDefault();
              cells[idx - 1].focus();
            }
            break;
          case "ArrowUp":
            if (fixedRow.previousElementSibling && fixedRow.previousElementSibling.classList.contains("fixed-row")) {
              const prevCells = Array.from(fixedRow.previousElementSibling.querySelectorAll("td"))
                .filter(c => c.contentEditable === "true");
              if (prevCells[idx]) {
                e.preventDefault();
                prevCells[idx].focus();
              }
            }
            break;
          case "ArrowDown":
            if (fixedRow.nextElementSibling && fixedRow.nextElementSibling.classList.contains("fixed-row")) {
              const nextCells = Array.from(fixedRow.nextElementSibling.querySelectorAll("td"))
                .filter(c => c.contentEditable === "true");
              if (nextCells[idx]) {
                e.preventDefault();
                nextCells[idx].focus();
              }
            }
            break;
        }
      });
      return td;
    }
    /* ====== CREATION OF FIXED LINES ===== */
    function createFixedRows(tbody, data, savedMap, year, month, daysInMonth, section, calculateRowTotal, calculateColumnTotals) {
      const fixedRowsData = [{idx: 0, text: savedMap[`fixed_0_text`] || "OFOPE", isHeader: true},
                             {idx: 1, dataIndex: 0}, {idx: 2, dataIndex: 1},
                             {idx: 3, text: savedMap[`fixed_3_text`] || "CORPO ATIVO", isHeader: true}];
      fixedRowsData.forEach(rowInfo => {
        let fixedRow = tbody.querySelector(`tr.fixed-row[data-fixed="${rowInfo.idx}"]`);
        if (!fixedRow) {
          fixedRow = document.createElement("tr");
          fixedRow.className = "fixed-row";
          fixedRow.setAttribute("data-fixed", rowInfo.idx);
          if (rowInfo.isHeader) {
            const td = document.createElement("td");
            td.colSpan = 3 + daysInMonth + 1;
            td.style.cssText = COMMON_TD_STYLE;
            td.style.cssText = COMMON_TDSPECIAL_STYLE;
            td.textContent = rowInfo.text;
            fixedRow.appendChild(td);
          } else {
            ["NI", "Nome", "Catg."].forEach((f) => {
              const td = document.createElement("td");
              td.contentEditable = "false";
              td.style.cssText = COMMON_TD_STYLE;
              const item = data[rowInfo.dataIndex];
              if (item) {
                if (f === "NI") td.textContent = String(item.n_int).padStart(3, "0");
                else if (f === "Nome") td.textContent = item.abv_name;
                else if (f === "Catg.") td.textContent = item.patent_abv || "";
              } else {
                const fieldName = f === "NI" ? "ni" : f === "Nome" ? "nome" : "catg";
                td.textContent = savedMap[`fixed_${rowInfo.idx}_${fieldName}`] || "";
              }
              fixedRow.appendChild(td);
            });
            const nIntStr = String(data[rowInfo.dataIndex].n_int).padStart(3, "0");
            for (let d = 1; d <= daysInMonth; d++) {
              const td = createFixedDayCellWithListeners(
                d, fixedRow, year, month, savedMap, nIntStr, daysInMonth,
                calculateRowTotal, calculateColumnTotals
              );
              fixedRow.appendChild(td);
            }
            const tdTotal = document.createElement("td");
            tdTotal.className = "fixed-total-cell";
            tdTotal.style.cssText = COMMON_TDTOTAL_STYLE;
            fixedRow.appendChild(tdTotal);
          }
          tbody.appendChild(fixedRow);
          if (!rowInfo.isHeader) {
            calculateRowTotal(fixedRow, section, daysInMonth);
          }
        }
      });
    }
    /* ====== CREATION OF DATA LINES ====== */
    function createDataRows(tbody, data, savedMap, year, month, daysInMonth, section, calculateRowTotal, calculateColumnTotals) {
      const isEditable = section === "Emissão Escala";
      const isEscalaSection = isEditable || section === "Consultar Escalas";
      for (let dataIdx = 0; dataIdx < data.length; dataIdx++) {
        if (isEscalaSection && dataIdx < 2) continue;
        const item = data[dataIdx];
        const nIntStr = String(item.n_int).padStart(3, "0");
        let tr = tbody.querySelector(`tr[data-nint="${nIntStr}"]`);
        if (!tr) {
          tr = document.createElement("tr");
          tr.setAttribute("data-nint", nIntStr);
          ["NI", "Nome", "Catg."].forEach((f) => {
            const td = document.createElement("td");
            td.style.cssText = COMMON_TD_STYLE;
            if (f === "NI") td.textContent = nIntStr;
            else if (f === "Nome") td.textContent = item.abv_name;
            else if (f === "Catg.") td.textContent = item.patent_abv || "";
            tr.appendChild(td);
          });
          for (let d = 1; d <= 31; d++) {
            const td = createDayCellWithListeners(
              d, tr, year, month, savedMap, section, daysInMonth,
              calculateRowTotal, calculateColumnTotals, isEditable // Passa a flag
            );
            tr.appendChild(td);
          }
          const tdTotal = document.createElement("td");
          tdTotal.className = "total-cell";
          tdTotal.style.cssText = COMMON_TDTOTAL_STYLE;
          tr.appendChild(tdTotal);
          tbody.appendChild(tr);
        }
        for (let d = 1; d <= 31; d++) {
          const td = tr.querySelector(`.day-cell-${d}`);
          const date = new Date(year, month - 1, d);
          if (d <= daysInMonth) {
            td.style.display = "";
            const cellValue = savedMap[`${nIntStr}_${d}`] ? savedMap[`${nIntStr}_${d}`].toUpperCase() : "";
            if (isEditable) {
              const input = td.querySelector('input');
              if (input) {
                input.value = cellValue;
              }
              td.textContent = cellValue;
            } else {
              td.textContent = cellValue;
            }
            updateCellColor(td, td.textContent, date);
          } else {
            td.style.display = "none";
          }
        }
        calculateRowTotal(tr, section, daysInMonth);
      }
    }
    /* === CREATION OF THE TOTAL LINES ==== */    
    function createTotalsRow(tbody, daysInMonth) {
      let totalsRow = tbody.querySelector(".totals-row");
      if (!totalsRow) {
        totalsRow = document.createElement("tr");
        totalsRow.className = "totals-row";
        const tdLabel = document.createElement("td");
        tdLabel.textContent = "Total de Elementos";
        tdLabel.colSpan = 3;
        tdLabel.style.cssText = COMMON_TDLABEL_STYLE;
        tdLabel.style.background = "#993333";
        tdLabel.style.color = "#eee";
        totalsRow.appendChild(tdLabel);
        for (let d = 1; d <= 31; d++) {
          const td = document.createElement("td");
          td.className = `total-day-${d}`;
          td.style.cssText = COMMON_TD_STYLE;
          td.style.background = "#99333350";
          totalsRow.appendChild(td);
        }
        const tdEmpty = document.createElement("td");
        tdEmpty.style.border = "none";
        tdEmpty.style.background = "#ebebebd9";
        totalsRow.appendChild(tdEmpty);
        tbody.appendChild(totalsRow);
      }
      for (let d = 1; d <= 31; d++) {
        const totalCell = totalsRow.querySelector(`.total-day-${d}`);
        if (d <= daysInMonth) {
          totalCell.style.display = "";
        } else {
          totalCell.style.display = "none";
        }
      }
      return totalsRow;
    }
    /* === CREATION OF MP ROWS (DECIR) ==== */
    function createMPRows(tbody, daysInMonth, currentSection) {
      const isDecir = currentSection === "DECIR";
      if (isDecir) {
        let mpDiaRow = tbody.querySelector(".mp-dia-row");
        if (!mpDiaRow) {
          mpDiaRow = document.createElement("tr");
          mpDiaRow.className = "mp-dia-row";
          const tdLabel = document.createElement("td");
          tdLabel.textContent = "Motoristas de Pesados Turno D";
          tdLabel.colSpan = 3;
          tdLabel.style.cssText = COMMON_TDLABEL_STYLE;
          tdLabel.style.background = "#fde8a3";
          mpDiaRow.appendChild(tdLabel);
          for (let d = 1; d <= 31; d++) {
            const td = document.createElement("td");
            td.className = `mp-dia-${d}`;
            td.style.cssText = COMMON_TD_STYLE;
            td.style.background = "#fde8a390";
            mpDiaRow.appendChild(td);
          }
          const tdEmpty = document.createElement("td");
          tdEmpty.style.border = "none";
          tdEmpty.style.background = "#ebebebd9";
          mpDiaRow.appendChild(tdEmpty);
          tbody.appendChild(mpDiaRow);
        }    
        let mpNoiteRow = tbody.querySelector(".mp-noite-row");
        if (!mpNoiteRow) {
          mpNoiteRow = document.createElement("tr");
          mpNoiteRow.className = "mp-noite-row";
          const tdLabel = document.createElement("td");
          tdLabel.textContent = "Motoristas de Pesados Turno N";
          tdLabel.colSpan = 3;
          tdLabel.style.cssText = COMMON_TDLABEL_STYLE;
          tdLabel.style.background = "#466c9a";
          tdLabel.style.color = "#eee";
          mpNoiteRow.appendChild(tdLabel);
          for (let d = 1; d <= 31; d++) {
            const td = document.createElement("td");
            td.className = `mp-noite-${d}`;
            td.style.cssText = COMMON_TD_STYLE;
            td.style.background = "#466c9a50";
            mpNoiteRow.appendChild(td);
          }
          const tdEmpty = document.createElement("td");
          tdEmpty.style.border = "none";
          tdEmpty.style.background = "#ebebebd9";
          mpNoiteRow.appendChild(tdEmpty);
          tbody.appendChild(mpNoiteRow);
        }    
        for (let d = 1; d <= 31; d++) {
          const mpDiaCell = mpDiaRow.querySelector(`.mp-dia-${d}`);
          const mpNoiteCell = mpNoiteRow.querySelector(`.mp-noite-${d}`);
          if (d <= daysInMonth) {
            mpDiaCell.style.display = "";
            mpNoiteCell.style.display = "";
          } else {
            mpDiaCell.style.display = "none";
            mpNoiteCell.style.display = "none";
          }
        }    
      } else {
        let mpRow = tbody.querySelector(".mp-row");
        if (!mpRow) {
          mpRow = document.createElement("tr");
          mpRow.className = "mp-row";
          const tdLabel = document.createElement("td");
          tdLabel.textContent = "Motoristas de Pesados";
          tdLabel.colSpan = 3;
          tdLabel.style.cssText = COMMON_TDLABEL_STYLE;
          tdLabel.style.background = "#fde8a3";
          mpRow.appendChild(tdLabel);
          for (let d = 1; d <= 31; d++) {
            const td = document.createElement("td");
            td.className = `mp-${d}`;
            td.style.cssText = COMMON_TD_STYLE;
            td.style.background = "#fde8a390";
            mpRow.appendChild(td);
          }
          const tdEmpty = document.createElement("td");
          tdEmpty.style.border = "none";
          tdEmpty.style.background = "#ebebebd9";
          mpRow.appendChild(tdEmpty);
          tbody.appendChild(mpRow);
        }    
        for (let d = 1; d <= 31; d++) {
          const mpCell = mpRow.querySelector(`.mp-${d}`);
          mpCell.style.display = d <= daysInMonth ? "" : "none";
        }
      }
    }
    
    function calculateMPTotals(tbody, daysInMonth, data, currentSection) {
      const isDecir = currentSection === "DECIR";    
      if (isDecir) {
        const mpDiaRow = tbody.querySelector(".mp-dia-row");
        const mpNoiteRow = tbody.querySelector(".mp-noite-row");
        if (!mpDiaRow || !mpNoiteRow) return;    
        for (let d = 1; d <= daysInMonth; d++) {
          let mpDiaCount = 0;
          let mpNoiteCount = 0;
          const rows = tbody.querySelectorAll("tr:not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.fixed-row)");
          rows.forEach(tr => {
            const nInt = parseInt(tr.getAttribute("data-nint"), 10);
            const person = data.find(item => parseInt(item.n_int, 10) === nInt);
            if (person && person.MP === true) {
              const td = tr.querySelector(`.day-cell-${d}`);
              if (td && td.style.display !== "none") {
                const value = td.textContent.toUpperCase().trim();
                if (value === "ED") mpDiaCount++;
                else if (value === "EN") mpNoiteCount++;
                else if (value === "ET") {
                  mpDiaCount++;
                  mpNoiteCount++;
                }
              }
            }
          });
          const mpDiaCell = mpDiaRow.querySelector(`.mp-dia-${d}`);
          const mpNoiteCell = mpNoiteRow.querySelector(`.mp-noite-${d}`);
          if (mpDiaCell) mpDiaCell.textContent = mpDiaCount;
          if (mpNoiteCell) mpNoiteCell.textContent = mpNoiteCount;
        }    
      } else {
        const mpRow = tbody.querySelector(".mp-row");
        if (!mpRow) return;    
        for (let d = 1; d <= daysInMonth; d++) {
          let totalCount = 0;
          const rows = tbody.querySelectorAll("tr:not(.totals-row):not(.mp-row):not(.fixed-row)");
          rows.forEach(tr => {
            const nInt = parseInt(tr.getAttribute("data-nint"), 10);
            const person = data.find(item => parseInt(item.n_int, 10) === nInt);
            if (person && person.MP === true) {
              const td = tr.querySelector(`.day-cell-${d}`);
              if (td && td.style.display !== "none") {
                const value = td.textContent.toUpperCase().trim();
                if (value === "PN") totalCount++;
              }
            }
          });    
          const mpCell = mpRow.querySelector(`.mp-${d}`);
          if (mpCell) {
            mpCell.textContent = totalCount;
            mpCell.style.fontWeight = "bold";
          }
        }
      }
    }
    
    function createTASRows(tbody, daysInMonth) {
      let tasRow = tbody.querySelector(".tas-row");
      if (!tasRow) {
        tasRow = document.createElement("tr");
        tasRow.className = "tas-row";    
        const tdLabel = document.createElement("td");
        tdLabel.textContent = "Tripulantes de Ambulância de Socorro (TAS)";
        tdLabel.colSpan = 3;
        tdLabel.style.cssText = COMMON_TDLABEL_STYLE;
        tdLabel.style.background = "#b5e4b5";
        tdLabel.style.fontWeight = "bold";
        tasRow.appendChild(tdLabel);    
        for (let d = 1; d <= 31; d++) {
          const td = document.createElement("td");
          td.className = `tas-${d}`;
          td.style.cssText = COMMON_TD_STYLE;
          td.style.background = "#b5e4b550";
          tasRow.appendChild(td);
        }    
        const tdEmpty = document.createElement("td");
        tdEmpty.style.border = "none";
        tdEmpty.style.background = "#ebebebd9";
        tasRow.appendChild(tdEmpty);    
        tbody.appendChild(tasRow);
      }    
      for (let d = 1; d <= 31; d++) {
        const tasCell = tasRow.querySelector(`.tas-${d}`);
        tasCell.style.display = d <= daysInMonth ? "" : "none";
      }
    }
    
    function calculateTASTotals(tbody, daysInMonth, data) {
      const tasRow = tbody.querySelector(".tas-row");
      if (!tasRow) return;    
      for (let d = 1; d <= daysInMonth; d++) {
        let totalCount = 0;
        const rows = tbody.querySelectorAll("tr:not(.totals-row):not(.tas-row):not(.fixed-row)");    
        rows.forEach(tr => {
          const nInt = parseInt(tr.getAttribute("data-nint"), 10);
          const person = data.find(item => parseInt(item.n_int, 10) === nInt);
          if (person && person.TAS === true) {
            const td = tr.querySelector(`.day-cell-${d}`);
            if (td && td.style.display !== "none") {
              const value = td.textContent.toUpperCase().trim();
              if (value !== "") totalCount++;
            }
          }
        });    
        const tasCell = tasRow.querySelector(`.tas-${d}`);
        if (tasCell) {
          tasCell.textContent = totalCount;
          tasCell.style.fontWeight = "bold";
        }
      }
    }
    /* === TOTAL CALCULATION FUNCTIONS ==== */
    function calculateRowTotal(tr, section, daysInMonth) {
      let total = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const td = tr.querySelector(`.day-cell-${d}, .fixed-day-cell-${d}`);
        if (td && td.style.display !== "none") {
          const value = td.textContent.toUpperCase().trim();
          total += computeTotalValue(value, section === "DECIR");
        }
      }
      const tdTotal = tr.cells[tr.cells.length - 1];
      tdTotal.textContent = total;
      applyTotalCellStyle(tdTotal, total, section === "DECIR");
      return total;
    }
    
    function calculateColumnTotals(tbody, section, daysInMonth) {
      const totalsRow = tbody.querySelector(".totals-row");
      if (!totalsRow) return;
      for (let d = 1; d <= daysInMonth; d++) {
        let dayTotal = 0;
        const rows = tbody.querySelectorAll("tr:not(.totals-row):not(.fixed-row)");
        rows.forEach(tr => {
          const td = tr.querySelector(`.day-cell-${d}, .fixed-day-cell-${d}`);
          if (td && td.style.display !== "none") {
            const value = td.textContent.toUpperCase().trim();
            dayTotal += computeTotalValue(value, section === "DECIR");
          }
        });
        const totalCell = totalsRow.querySelector(`.total-day-${d}`);
        if (totalCell) {
          totalCell.textContent = dayTotal;
          applyTotalCellStyle(totalCell, dayTotal, section === "DECIR");
        }
      }
    }
    /* ========== MAIN FUNCTION  ========== */
    async function createMonthTable(containerId, year, month, data) {
      currentTableData = data;
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";
    
      createTableHeaders(container, year, month, currentSection);
      const wrapper = createTableWrapper(container);
      const table = createTableStructure(wrapper);
      const daysInMonth = new Date(year, month, 0).getDate();
    
      updateDayHeaders(table, year, month, daysInMonth);
    
      const sectionToLoad =
        currentSection === "Consultar Escalas" ? "Emissão Escala" : currentSection;
    
      const savedMap = await loadSavedData(sectionToLoad, year, month);
      const tbody = table.querySelector("tbody");
    
      const isEscalaSection =
        currentSection === "Emissão Escala" ||
        currentSection === "Consultar Escalas";
    
      if (isEscalaSection) {
        createFixedRows(tbody, data, savedMap, year, month, daysInMonth,
          currentSection,
          calculateRowTotal,
          calculateColumnTotals
        );
      }
    
      createDataRows(tbody, data, savedMap, year, month, daysInMonth,
        currentSection,
        calculateRowTotal,
        calculateColumnTotals
      );    
      createTotalsRow(tbody, daysInMonth);
      if (
        currentSection === "DECIR" ||
        currentSection === "1ª Secção" ||
        currentSection === "2ª Secção"
      ) {
        createMPRows(tbody, daysInMonth, currentSection);
      }
      if (currentSection === "1ª Secção" || currentSection === "2ª Secção") {
        createTASRows(tbody, daysInMonth);
      }
      calculateColumnTotals(tbody, currentSection, daysInMonth);
      if (
        currentSection === "DECIR" ||
        currentSection === "1ª Secção" ||
        currentSection === "2ª Secção"
      ) {
        calculateMPTotals(tbody, daysInMonth, data, currentSection);
      }
      if (currentSection === "1ª Secção" || currentSection === "2ª Secção") {
        calculateTASTotals(tbody, daysInMonth, data);
      }
    }
    /* =======================================
       CREATION OF SCALE LEGEND
    ======================================= */
    /* ============ CONSTANTS  ============ */    
    const TABLE_STYLE = "margin-top: 10px; border-collapse: separate; border-spacing: 0 5px; font-size: 12px; text-align: center; margin-left: auto; margin-right: auto;"
    const TD_CODE_STYLE = "border: 1px solid #ccc; font-weight: bold; padding: 4px 6px; width: 40px; white-space: nowrap;"
    const TD_DESC_STYLE = "border: 1px solid #ccc; background: #fff; padding: 4px 6px; width: 110px; text-align: left; font-size: 13px; white-space: nowrap; border-left: 0px;"
    const TD_SPACER_STYLE = "width: 5px;"
    const MAX_COLS_PER_ROW = 30;
    /* ===== FUNCTION CREATE LEGEND  ====== */
    function createLegendScale(containerId, legendItems) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const oldLegenda = container.querySelector(".legend-scale");
      if (oldLegenda) oldLegenda.remove();
      const table = document.createElement("table");
      table.className = "legend-scale";
      table.style.cssText = TABLE_STYLE;
      let tr = document.createElement("tr");
      let colCount = 0;
      legendItems.forEach((item, i) => {
        const tdCode = document.createElement("td");
        tdCode.textContent = item.code;
        tdCode.style.cssText = TD_CODE_STYLE;
        updateCellColor(tdCode, item.code, new Date());
        const tdDesc = document.createElement("td");
        tdDesc.textContent = item.desc;
        tdDesc.style.cssText = TD_DESC_STYLE;
        tr.appendChild(tdCode);
        tr.appendChild(tdDesc);
        colCount += 2;
        if (i < legendItems.length - 1) {
          const tdSpacer = document.createElement("td");
          tdSpacer.style.cssText = TD_SPACER_STYLE;
          tr.appendChild(tdSpacer);
          colCount++;
        }
        if (colCount >= MAX_COLS_PER_ROW) {
          table.appendChild(tr);
          tr = document.createElement("tr");
          colCount = 0;
        }
      });
      if (tr.children.length > 0) table.appendChild(tr);
      container.appendChild(table);
    }
    /* ======== PUT CREATED LEGEND  ======= */
    function handleLegend(containerId) {
      const DECIR_LEGEND = [{code: "ED", desc: "ECIN Dia"}, {code: "EN", desc: "ECIN Noite"}, {code: "ET", desc: "ECIN 24 Hrs."},];
      const ESCALA_LEGEND = [{code: "PD", desc: "Piquete Dia"}, {code: "PN", desc: "Piquete Noite"}, {code: "PT", desc: "Piquete 24 Hrs."},
                             {code: "BX", desc: "Baixa"}, {code: "FE", desc: "Férias"}, {code: "FO", desc: "Formação"}, {code: "FD", desc: "Estágio Dia"}, {code: "FN", desc: "Estágio Noite"}];
      const ECIN_EXTRA = [{code: "ED", desc: "ECIN Dia"}, {code: "EN", desc: "ECIN Noite"}, {code: "ET", desc: "ECIN 24 Hrs."}, {code: "EP", desc: "ECIN D\\Piquete N"}];
      let legendItems;
      if (currentSection === "DECIR") {
        legendItems = DECIR_LEGEND;
      } else if (currentSection === "Emissão Escala" || currentSection === "Consultar Escalas") {
        legendItems = ESCALA_LEGEND.concat(ECIN_EXTRA);
      } else {
        legendItems = ESCALA_LEGEND;
      }
      createLegendScale(containerId, legendItems);
    }
    /* =======================================
       SAVE SCALE
    ======================================= */
    function initSaveButton() {
      const saveBtn = document.getElementById("save-button");
      if (!saveBtn) return;
      saveBtn.style.marginTop = "20px";
      saveBtn.addEventListener("click", async () => {
        const table = document.querySelector(".month-table tbody");
        if (!table) return;
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
        try {
          const monthIndex = getActiveMonthIndex();
          if (!monthIndex) throw new Error("Nenhum mês selecionado.");
          const savedMap = await fetchSavedData(currentSection, yearAtual, monthIndex);
          const {toInsert, toUpdate, toDelete} = diffTableChanges(table, savedMap);
          await saveChanges({toInsert, toUpdate, toDelete, section: currentSection, year: yearAtual, month: monthIndex});
          showPopupSuccess("✅ Escala gravada com sucesso!");
        } catch (err) {
          console.error(err);
          alert("❌ Erro ao salvar a tabela: " + err.message);
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Escala";
        }
      });
    }

    function getActiveMonthIndex() {
      const activeBtn = document.querySelector(".btn.btn-add.active");
      if (!activeBtn) return null;
      return Array.from(document.querySelectorAll(".btn.btn-add")).indexOf(activeBtn) + 1;
    }
    async function fetchSavedData(section, year, month) {
      const url = `${SUPABASE_URL}/rest/v1/reg_serv?select=n_int,day,value&section=eq.${section}&year=eq.${year}&month=eq.${month}`;
      const response = await fetch(url, {
        headers: getSupabaseHeaders()
      });
      if (!response.ok) throw new Error("Erro ao carregar dados do mês.");
      const data = await response.json();
      const map = {};
      data.forEach(({n_int, day, value}) => {
        map[`${n_int}_${day}`] = value;
      });
      return map;
    }

    function diffTableChanges(table, savedMap) {
      const toInsert = [];
      const toUpdate = [];
      const toDelete = [];
      const rows = table.querySelectorAll("tr");
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        const n_int = parseInt(cells[0].textContent, 10);
        const abv_name = cells[1].textContent;
        if (isNaN(n_int)) continue;
        for (let d = 3; d < cells.length - 1; d++) {
          const value = cells[d].textContent.toUpperCase().slice(0, 2).trim();
          const day = d - 2;
          const key = `${n_int}_${day}`;
          const existingVal = savedMap[key];
          if (existingVal) {
            if (!value) {
              toDelete.push({n_int, day});
            } else if (existingVal.toUpperCase() !== value) {
              toUpdate.push({ n_int, day, value});
            }
          } else if (value) {
            toInsert.push({n_int, abv_name, day, value});
          }
        }
      }
      return {toInsert, toUpdate, toDelete};
    }
    async function saveChanges({toInsert, toUpdate, toDelete, section, year, month}) {
      const requests = [];
      if (toInsert.length) {
        const insertBody = toInsert.map(item => ({section, n_int: item.n_int, abv_name: item.abv_name, year, month, day: item.day, value: item.value,}));
        requests.push(
          fetch(`${SUPABASE_URL}/rest/v1/reg_serv`, {
            method: "POST",
            headers: {
              ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal",
            },
            body: JSON.stringify(insertBody),
          })
        );
      }
      for (const {n_int, day, value} of toUpdate) {
        const filter = `section=eq.${section}&n_int=eq.${n_int}&year=eq.${year}&month=eq.${month}&day=eq.${day}`;
        requests.push(
          fetch(`${SUPABASE_URL}/rest/v1/reg_serv?${filter}`, {
            method: "PATCH",
            headers: {
              ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal",
            },
            body: JSON.stringify({value}),
          })
        );
      }
      for (const {n_int, day} of toDelete) {
        const filter = `section=eq.${section}&n_int=eq.${n_int}&year=eq.${year}&month=eq.${month}&day=eq.${day}`;
        requests.push(
          fetch(`${SUPABASE_URL}/rest/v1/reg_serv?${filter}`, {
            method: "DELETE",
            headers: getSupabaseHeaders(),
          })
        );
      }
      if (requests.length > 0) await Promise.all(requests);
    }
    /* =======================================
       EMIT SCALE
    ======================================= */
    async function initScaleEmission() {
      const table = document.querySelector(".month-table tbody");
      if (!table) return;
      const saveBtn = document.getElementById("save-button-emissao");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
      }
      try {
        const monthIndex = getActiveMonthIndex();
        if (!monthIndex) throw new Error("Nenhum mês selecionado.");  
        const savedMap = await fetchSavedData(currentSection, yearAtual, monthIndex);
        const {toInsert, toUpdate, toDelete} = diffFixedRowsChanges(table, savedMap);
        await saveChanges({toInsert, toUpdate, toDelete, section: currentSection, year: yearAtual, month: monthIndex});
        showPopupSuccess("✅ Escala emitida com sucesso! Por favor agurde uns breves segundos pelo download automático. Obrigado.");
        await exportScheduleToExcel(table, yearAtual, monthIndex);
      } catch (err) {
        console.error(err);
        alert("❌ Erro ao salvar as linhas fixas: " + err.message);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Emissão";
        }
      }
    }

    function diffFixedRowsChanges(table, savedMap) {
      const toInsert = [];
      const toUpdate = [];
      const toDelete = [];
      const rows = table.querySelectorAll("tr.fixed-row");
      for (const row of rows) {
        const fixedId = row.getAttribute("data-fixed");
        if (fixedId !== "1" && fixedId !== "2") continue;
        const n_int = fixedId === "1" ? 3 : 4;
        const abv_name = row.cells[1].textContent;
        for (let d = 3; d < row.cells.length - 1; d++) {
          const value = row.cells[d].textContent.toUpperCase().slice(0, 1).trim();
          const day = d - 2;
          const key = `${n_int}_${day}`;
          const existingVal = savedMap[key];
          if (existingVal) {
            if (!value) toDelete.push({n_int, day});
            else if (existingVal.toUpperCase() !== value)
              toUpdate.push({n_int, day, value});
          } else if (value) {
            toInsert.push({n_int, abv_name, day, value});
          }
        }
      }
      return {toInsert, toUpdate, toDelete};
    }
    /* =======================================
       CONVERT SCALE
    ======================================= */
    async function exportScheduleToExcel(tbody, year, month) {
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const fileName = `Escala_FOMIO_${monthNames[month - 1]}_${year}`;
      const daysInMonth = new Date(year, month, 0).getDate();
      const weekdays = [];
      const table = tbody.parentElement;
      for (let d = 1; d <= daysInMonth; d++) {
        const headerCell = table.querySelector(`.day-header-${d}`);
        if (headerCell) {
          weekdays.push(headerCell.textContent || '');
        } else {
          const date = new Date(year, month - 1, d);
          weekdays.push(date.toLocaleDateString("pt-PT", {
            weekday: "long"
          }).substring(0, 3).toUpperCase());
        }
      }
      const fixedRows = [];
      tbody.querySelectorAll("tr.fixed-row").forEach(tr => {
        if (tr.cells.length === 1) return;
        const rowData = {type: 'data', ni: tr.cells[0].textContent, nome: tr.cells[1].textContent, catg: tr.cells[2].textContent, days: {}};
        for (let d = 1; d <= daysInMonth; d++) {
          const cell = tr.querySelector(`.fixed-day-cell-${d}`);
          if (cell) rowData.days[d] = cell.textContent || '';
        }
        fixedRows.push(rowData);
      });
      const normalRows = [];
      tbody.querySelectorAll("tr:not(.fixed-row):not(.totals-row):not(.mp-dia-row):not(.mp-noite-row)").forEach(tr => {
        const rowData = {ni: tr.cells[0].textContent, nome: tr.cells[1].textContent, catg: tr.cells[2].textContent, days: {}};
        for (let d = 1; d <= daysInMonth; d++) {
          const cell = tr.querySelector(`.day-cell-${d}`);
          if (cell && cell.style.display !== 'none') rowData.days[d] = cell.textContent || '';
        }
        normalRows.push(rowData);
      });
      const payload = {year, month, monthName: monthNames[month - 1], fileName, daysInMonth, weekdays, fixedRows, normalRows};
      const vercelApiEndpoint = 'https://cb360-mobile.vercel.app/api/convert-excel';
      try {
        const response = await fetch(vercelApiEndpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const pdfBlob = await response.blob();
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fileName}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showPopupSuccess(`✅ A escala foi gerada e descarregada como ${fileName}.pdf!`);
        } else {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            alert(`Erro (${response.status}):\n${errorJson.error}\n\nDetalhes: ${errorJson.details || 'Sem detalhes'}`);
          } else {
            const errorText = await response.text();
            alert(`Erro no servidor (${response.status}):\n${errorText}`);
          }
        }
      } catch (error) {
        alert(`❌ Erro: Não foi possível comunicar com o serviço de conversão.\n\nTipo: ${error.name}\nMensagem: ${error.message}`);
      }
    }
