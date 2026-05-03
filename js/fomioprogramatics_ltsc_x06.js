    /* =======================================
    FOMIO
    ======================================= */
    function createFOMIOMonthButtons(containerId, tableContainerId, year) {
      const container = $(containerId);
      if (!container) return;
      const analyzeBtn = $("analyze-button");
      const saveBtn = $("save-button");
      const emitBtn = $("emit-button");
      container.innerHTML = "";
      if (emitBtn) emitBtn.style.marginTop = "20px";
      if (analyzeBtn) analyzeBtn.style.marginTop = "20px";
      const mainWrapper = document.createElement("div");
      Object.assign(mainWrapper.style, {display:"flex",flexDirection:"column",alignItems:"center",gap:"0px"});
      const yearContainer = document.createElement("div");
      Object.assign(yearContainer.style, {marginBottom:"10px",display:"flex",alignItems:"center",gap:"8px"});
      const yearLabel = document.createElement("label"); yearLabel.textContent = "Ano:"; yearLabel.style.fontWeight = "bold";
      const yearSelect = document.createElement("select"); yearSelect.id = "year-selector";
      Object.assign(yearSelect.style, {padding:"6px 10px",borderRadius:"4px",border:"1px solid #ccc",cursor:"pointer"});
      const targetYear = parseInt(year || yearAtual, 10);
      for (let y=2025; y<=2035; y++) {
        const opt = document.createElement("option"); opt.value=y; opt.textContent=y;
        if (y===targetYear) opt.selected=true;
        yearSelect.appendChild(opt);
      }
      yearSelect.value = targetYear;
      yearContainer.append(yearLabel, yearSelect);
      const monthsWrapper = document.createElement("div");
      Object.assign(monthsWrapper.style, {display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"3px",maxWidth:"800px"});
      const toggleButtons = (showSave, showEmit, showAnalyze = false) => {
        if (analyzeBtn) analyzeBtn.style.display = showAnalyze ? "inline-block" : "none";
        if (saveBtn) saveBtn.style.display = showSave ? "inline-block" : "none";
        if (emitBtn) emitBtn.style.display = showEmit ? "inline-block" : "none";
      };
      MONTH_NAMES_PT.forEach((month, index) => {
        const btn = document.createElement("button");
        btn.textContent = month; btn.className = "btn btn-add";
        Object.assign(btn.style, {fontSize:"14px",fontWeight:"bold",width:"110px",height:"40px",borderRadius:"4px",margin:"2px"});
        btn.addEventListener("click", async () => {
          const selectedYear = parseInt(yearSelect.value, 10);
          const tableContainer = $(tableContainerId);
          if (btn.classList.contains("active")) {
            btn.classList.remove("active"); tableContainer.innerHTML = ""; toggleButtons(false, false); return;
          }
          if (currentSection === "DECIR" && BLOCKED_MONTHS_DECIR.includes(index)) {
            showPopup('popup-danger', `Durante o mês de ${month}, não existe DECIR. Salvo prolongamento ou antecipação declarados pela ANEPC.`); return;
          }
          monthsWrapper.querySelectorAll(".btn.btn-add").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          if (currentSection === "Emissão Escala") toggleButtons(true, true, true);
          else if (currentSection === "DECIR") toggleButtons(true, false, true);
          else if (currentSection === "Consultar Escalas") toggleButtons(false, false, false);
          else toggleButtons(true, false, false);
          const data = await loadSectionData();
          createMonthTable(tableContainerId, selectedYear, index + 1, data);
          handleLegend(tableContainerId);
        });
        monthsWrapper.appendChild(btn);
      });
      yearSelect.addEventListener("change", () => {
        createFOMIOMonthButtons(containerId, tableContainerId, parseInt(yearSelect.value, 10));
        const tc = $(tableContainerId); if (tc) tc.innerHTML = "";
        if (saveBtn) saveBtn.style.display = "none";
        if (emitBtn) emitBtn.style.display = "none";
      });
      mainWrapper.append(yearContainer, monthsWrapper);
      container.appendChild(mainWrapper);
      setTimeout(() => { yearSelect.value = targetYear; }, 0);
    }
    /* ─── STATE (FOMIO) ──────────────────────────────────────── */
    let currentSection  = "1ª Secção";
    let currentTableData = [];
    const yearAtual = new Date().getFullYear();
    /* ─── COR DA CÉLULA (FOMIO) ──────────────────────────────── */
    function updateCellColor(td, value, date) {
      value = value.toUpperCase();
      if (CELL_COLORS[value]) {td.style.background = CELL_COLORS[value].background; td.style.color = CELL_COLORS[value].color; return;}
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      td.style.background = isWeekend ? WEEKEND_COLOR : (value === "" ? "transparent" : "#fff");
      td.style.color = "#000";
    }
    function applyDayBackground(td, d, month, holidays) {
      const date = new Date(td._year ?? 0, month - 1, d);
      const holiday = holidays?.find(h => h.date.getDate() === d && h.date.getMonth() === month - 1);
      if (holiday) {td.style.background = holiday.optional ? "#2ecc71" : "#ffcccc"; td.style.color = holiday.optional ? "#fff" : "#000";}
      else if (date.getDay() === 0 || date.getDay() === 6) {td.style.background = WEEKEND_COLOR; td.style.color = "#000";}
      else {td.style.background = "transparent"; td.style.color = "#000";}
    }
    /* ─── CÁLCULOS DE TOTAIS (FOMIO) ────────────────────────── */
    function computeTotalValue(value, isDecir, isRow = false) {
      if (!value) return 0;
      if (isDecir) {
        if (["ED","EN","EP"].includes(value)) return 1;
        if (value === "ET") return 2;
      } else {
        if (["PN","EP","N"].includes(value)) return 1;
        if (value === "PT") return isRow ? 2 : 1;
      }
      return 0;
    }
    function applyTotalCellStyle(cell, total, isDecir, threshold = 4) {
      if (cell.parentElement.classList.contains("totals-row")) return;
      if (isDecir) {cell.style.background = "#f0f0f0"; cell.style.color = "#000";}
      else {cell.style.background = total >= threshold ? "green" : "red"; cell.style.color = "white";}
    }
    function calculateVolunteersRowTotal(tr, section, daysInMonth) {
      let total = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const td = tr.querySelector(`.day-cell-${d}, .fixed-day-cell-${d}`);
        if (td && td.style.display !== "none") total += computeTotalValue(td.textContent.toUpperCase().trim(), section === "DECIR", true);
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
        tbody.querySelectorAll("tr:not(.totals-row):not(.fixed-row)").forEach(tr => {
          const td = tr.querySelector(`.day-cell-${d}, .fixed-day-cell-${d}`);
          if (td && td.style.display !== "none") dayTotal += computeTotalValue(td.textContent.toUpperCase().trim(), section === "DECIR", false);
        });
        const totalCell = totalsRow.querySelector(`.total-day-${d}`);
        if (totalCell) {totalCell.textContent = dayTotal; totalCell.style.fontWeight = "bold"; applyTotalCellStyle(totalCell, dayTotal, section === "DECIR");}
      }
    }
    /* ─── LINHAS DE RESUMO ML / MP / TAS (FOMIO) ────────────── */
    function makeSummaryRow(tbody, className, label, bgLabel, bgCell, colPrefix) {
      let row = tbody.querySelector(`.${className}`);
      if (!row) {
        row = document.createElement("tr");
        row.className = className;
        const tdLabel = document.createElement("td");
        tdLabel.textContent = label; tdLabel.colSpan = 3;
        tdLabel.style.cssText = COMMON_TDLABEL_STYLE + `background:${bgLabel};`;
        if (className === "mp-noite-row") tdLabel.style.color = "#eee";
        if (className === "tas-row") tdLabel.style.fontWeight = "bold";
        row.appendChild(tdLabel);
        for (let d = 1; d <= 31; d++) {
          const td = document.createElement("td");
          td.className = `${colPrefix}-${d}`; td.style.cssText = COMMON_TD_STYLE; td.style.background = bgCell;
          row.appendChild(td);
        }
        const tdEmpty = document.createElement("td");
        tdEmpty.style.border = "none"; tdEmpty.style.background = "#ebebebd9";
        row.appendChild(tdEmpty);
        tbody.appendChild(row);
      }
      return row;
    }
    function showHideCells(row, prefix, daysInMonth) {
      for (let d = 1; d <= 31; d++) row.querySelector(`.${prefix}-${d}`).style.display = d <= daysInMonth ? "" : "none";
    }
    function createMLRow(tbody, daysInMonth) {
      const row = makeSummaryRow(tbody, "ml-row", "Motoristas de Ligeiros", "#c8e6c9", "#c8e6c990", "ml");
      showHideCells(row, "ml", daysInMonth);
    }
    function createTASRows(tbody, daysInMonth) {
      const row = makeSummaryRow(tbody, "tas-row", "Tripulantes de Ambulância de Socorro (TAS)", "#b5e4b5", "#b5e4b550", "tas");
      showHideCells(row, "tas", daysInMonth);
    }
    function createMPRows(tbody, daysInMonth, section) {
      if (section === "DECIR") {
        const mpDay = makeSummaryRow(tbody, "mp-dia-row",   "Motoristas de Pesados Turno ED", "#fde8a3", "#fde8a390", "mp-dia");
        const mpNight = makeSummaryRow(tbody, "mp-noite-row", "Motoristas de Pesados Turno EN", "#466c9a", "#466c9a50", "mp-noite");
        showHideCells(mpDay, "mp-dia",   daysInMonth);
        showHideCells(mpNight, "mp-noite", daysInMonth);
      } else {
        const row = makeSummaryRow(tbody, "mp-row", "Motoristas de Pesados", "#fde8a3", "#fde8a390", "mp");
        showHideCells(row, "mp", daysInMonth);
      }
    }
    function createElementsDayNightRows(tbody, daysInMonth) {
      const elementsDay = makeSummaryRow(tbody, "elem-dia-row", "Elementos Turno ED", "#b6fcb6", "#b6fcb690", "elem-dia");
      const elementsNight = makeSummaryRow(tbody, "elem-noite-row", "Elementos Turno EN", "#1e3a8a", "#1e3a8a50", "elem-noite");
      const nightLabel = elementsNight.querySelector("td");
      if (nightLabel) nightLabel.style.color = "#fff";
      showHideCells(elementsDay, "elem-dia", daysInMonth);
      showHideCells(elementsNight, "elem-noite", daysInMonth);
    }
    function calculateElementsDayNightTotals(tbody, daysInMonth) {
      const dayRow = tbody.querySelector(".elem-dia-row");
      const nightRow = tbody.querySelector(".elem-noite-row");
      if (!dayRow || !nightRow) return;
      for (let d = 1; d <= daysInMonth; d++) {
        let day = 0, night = 0;
        tbody.querySelectorAll("tr:not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.elem-dia-row):not(.elem-noite-row):not(.fixed-row)").forEach(tr => {
          const td = tr.querySelector(`.day-cell-${d}`);
          if (!td || td.style.display === "none") return;
          const v = td.textContent.toUpperCase().trim();
          if (v === "ED" || v === "ET") day++;
          if (v === "EN" || v === "ET") night++;
        });
        const cDay = dayRow.querySelector(`.elem-dia-${d}`);
        if (cDay) {cDay.textContent = day; cDay.style.fontWeight = "bold";}
        const cNight = nightRow.querySelector(`.elem-noite-${d}`);
        if (cNight) {cNight.textContent = night; cNight.style.fontWeight = "bold";}
      }
    }
    function calculateSummaryRow(tbody, daysInMonth, data, rowClass, cellPrefix, filterFn, valueFn) {
      const row = tbody.querySelector(`.${rowClass}`);
      if (!row) return;
      for (let d = 1; d <= daysInMonth; d++) {
        let count = 0;
        tbody.querySelectorAll(`tr:not(.totals-row):not(.${rowClass}):not(.fixed-row)`).forEach(tr => {
          const nInt = parseInt(tr.getAttribute("data-nint"), 10);
          const person = data.find(item => parseInt(item.n_int, 10) === nInt);
          if (!person || !filterFn(person)) return;
          const td = tr.querySelector(`.day-cell-${d}`);
          if (td && td.style.display !== "none") count += valueFn(td.textContent.toUpperCase().trim());
        });
        const cell = row.querySelector(`.${cellPrefix}-${d}`);
        if (cell) {cell.textContent = count; cell.style.fontWeight = "bold";}
      }
    }
    function calculateMLTotals(tbody, daysInMonth, data) {
      calculateSummaryRow(tbody, daysInMonth, data, "ml-row", "ml", p => p.ML === true, v => ["PD","PN","PT","EP"].includes(v) ? 1 : 0);
    }
    function calculateTASTotals(tbody, daysInMonth, data) {
      calculateSummaryRow(tbody, daysInMonth, data, "tas-row", "tas", p => p.TAS === true, v => ["PD","PN","PT","EP"].includes(v) ? 1 : 0);
    }
    function calculateMPTotals(tbody, daysInMonth, data, section) {
      if (section === "DECIR") {
        const mpDay = tbody.querySelector(".mp-dia-row");
        const mpNight = tbody.querySelector(".mp-noite-row");
        if (!mpDay || !mpNight) return;
        for (let d = 1; d <= daysInMonth; d++) {
          let day = 0, night = 0;
          tbody.querySelectorAll("tr:not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.fixed-row)").forEach(tr => {
            const nInt = parseInt(tr.getAttribute("data-nint"), 10);
            const person = data.find(item => parseInt(item.n_int, 10) === nInt);
            if (!person?.MP) return;
            const td = tr.querySelector(`.day-cell-${d}`);
            if (!td || td.style.display === "none") return;
            const v = td.textContent.toUpperCase().trim();
            if (v === "ED") day++; else if (v === "EN") night++; else if (v === "ET") {day++; night++;}
          });
          const cDay = mpDay.querySelector(`.mp-dia-${d}`);
          if (cDay) { cDay.textContent = day; cDay.style.fontWeight = "bold";}
          const cNight = mpNight.querySelector(`.mp-noite-${d}`);
          if (cNight) { cNight.textContent = night; cNight.style.fontWeight = "bold";}
        }
      } else {
        calculateSummaryRow(tbody, daysInMonth, data, "mp-row", "mp", p => p.MP === true, v => ["PD","PN","PT","EP"].includes(v) ? 1 : 0);
      }
    }
    /* ─── LINHA DE TOTAIS (FOMIO) ────────────────────────────── */
    function createTotalsRow(tbody, daysInMonth) {
      let totalsRow = tbody.querySelector(".totals-row");
      if (!totalsRow) {
        totalsRow = document.createElement("tr");
        totalsRow.className = "totals-row";
        const tdLabel = document.createElement("td");
        tdLabel.textContent = "Total de Elementos"; tdLabel.colSpan = 3;
        tdLabel.style.cssText = COMMON_TDLABEL_STYLE + "background:#993333;color:#eee;";
        totalsRow.appendChild(tdLabel);
        for (let d = 1; d <= 31; d++) {
          const td = document.createElement("td");
          td.className = `total-day-${d}`; td.style.cssText = COMMON_TD_STYLE; td.style.background = "#99333350";
          totalsRow.appendChild(td);
        }
        const tdEmpty = document.createElement("td");
        tdEmpty.style.border = "none"; tdEmpty.style.background = "#ebebebd9";
        totalsRow.appendChild(tdEmpty);
        tbody.appendChild(totalsRow);
      }
      for (let d = 1; d <= 31; d++) totalsRow.querySelector(`.total-day-${d}`).style.display = d <= daysInMonth ? "" : "none";
    }
    /* ─── VERIFICAÇÃO DE CONFLITOS (FOMIO) ───────────────────── */
    async function hasConflict(params, values) {
      const valueQuery = Array.isArray(values) ? `in.(${values.join(",")})` : `eq.${values}`;
      const query = Object.entries(params).map(([k,v]) => `${k}=eq.${v}`).join("&");
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/reg_serv?select=value&${query}&value=${valueQuery}`, {headers: getSupabaseHeaders()});
      if (!resp.ok) throw new Error(`Erro ao verificar conflito: ${resp.status}`);
      return (await resp.json()).length > 0;
    }
    async function checkConflict(section, n_int, year, month, day, newValue) {
      try {
        const value = newValue.toUpperCase();
        const params = { n_int, year, month, day, corp_oper_nr: getCorpId() };
        if (section === "DECIR" && ["EN","ET"].includes(value) && await hasConflict(params, "PN")) return CONFLICT_MESSAGES.DECIR_TO_PIQUETE;
        if (section !== "DECIR" && value === "PN" && await hasConflict({...params, section:"DECIR"}, ["EN","ET"])) return CONFLICT_MESSAGES.PIQUETE_TO_DECIR;
        return null;
      } catch (err) {
        console.error("Erro ao verificar conflitos:", err);
        return null;
      }
    }
    /* ─── NAVEGAÇÃO POR TECLADO (FOMIO) ─────────────────────── */
    function handleKeyNav(e, td, tr) {
      const cells = Array.from(tr.querySelectorAll("td")).filter(c => c.contentEditable === "true");
      const idx = cells.indexOf(td);
      const dirs = {ArrowRight: [cells, idx+1], ArrowLeft: [cells, idx-1]};
      if (dirs[e.key]) {
        const [arr, i] = dirs[e.key];
        if (arr[i]) {e.preventDefault(); arr[i].focus();}
        return;
      }
      const sibling = e.key === "ArrowUp" ? tr.previousElementSibling : e.key === "ArrowDown" ? tr.nextElementSibling : null;
      if (sibling) {
        const sibCells = Array.from(sibling.querySelectorAll("td")).filter(c => c.contentEditable === "true");
        if (sibCells[idx]) {e.preventDefault(); sibCells[idx].focus();}
      }
    }
    function selectAllOnFocus(td) {
      td.addEventListener("focus", () => {
        const range = document.createRange(); range.selectNodeContents(td);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      });
    }
    /* ─── FUNDO DE CÉLULA (FOMIO) ────────────────────────────── */
    function getCellBg(d, month, holidays) {
      const date = new Date(0, month - 1, d);
      const holiday = holidays?.find(h => h.date.getDate() === d && h.date.getMonth() === month - 1);
      if (holiday) return {bg: holiday.optional ? "#2ecc71" : "#ffcccc", color: holiday.optional ? "#fff" : "#000"};
      if (date.getDay() === 0 || date.getDay() === 6) return {bg: WEEKEND_COLOR, color: "#000"};
      return { bg: "transparent", color: "#000" };
    }
    /* ─── CÉLULA DE DIA — LINHA NORMAL (FOMIO) ───────────────── */
    function createDayCellWithListeners(d, tr, year, month, savedMap, section, daysInMonth, calculateVolunteersRowTotal, calculateColumnTotals, holidays) {
      const td = document.createElement("td");
      td.className = `day-cell-${d}`;
      td.contentEditable = section !== "Consultar Escalas";
      td.style.cssText = COMMON_TD_STYLE; td.style.fontWeight = "bold";
      const dateObj = new Date(year, month - 1, d);
      const holiday = holidays?.find(h => h.date.getDate() === d && h.date.getMonth() === month - 1);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const setInitialColor = () => {
        if (holiday) {td.style.background = holiday.optional ? "#2ecc71" : "#ffcccc"; td.style.color = holiday.optional ? "#fff" : "#000";}
        else if (isWeekend) {td.style.background = WEEKEND_COLOR; td.style.color = "#000";}
        else {td.style.background = "transparent"; td.style.color = "#000";}
      ;}
      setInitialColor();
      selectAllOnFocus(td);
      td.addEventListener("input", async () => {
        let value = td.textContent.toUpperCase().slice(0, 2);
        if (td.textContent !== value) {
          const sel = window.getSelection(); td.textContent = value;
          if (td.firstChild) sel.collapse(td.firstChild, value.length);
        }
        const n_int = parseInt(tr.getAttribute("data-nint"), 10);
        const conflictMsg = await checkConflict(section, n_int, year, month, d, value);
        if (conflictMsg) {
          showPopup('popup-danger', conflictMsg); td.textContent = ""; setInitialColor();
          calculateVolunteersRowTotal(tr, section, daysInMonth);
          calculateColumnTotals(tr.parentElement, section, daysInMonth);
          return;
        }
        value.trim() === "" ? setInitialColor() : updateCellColor(td, value, dateObj);
        calculateVolunteersRowTotal(tr, section, daysInMonth);
        calculateColumnTotals(tr.parentElement, section, daysInMonth);
        calculateMLTotals(tr.parentElement, daysInMonth, currentTableData);
        calculateMPTotals(tr.parentElement, daysInMonth, currentTableData, section);
        calculateTASTotals(tr.parentElement, daysInMonth, currentTableData);
        if (section === "DECIR") {
          calculateElementsDayNightTotals(tr.parentElement, daysInMonth);
        }
        if (value.length === 2) {const next = td.nextElementSibling; if (next?.contentEditable === "true") next.focus();}
      });
      td.addEventListener("keydown", e => handleKeyNav(e, td, tr));
      td.addEventListener("blur", () => {savedMap[`${String(parseInt(tr.getAttribute("data-nint"),10)).padStart(3,"0")}_${d}`] = td.textContent.toUpperCase().slice(0,2);});
      return td;
    }
    /* ─── CÉLULA DE DIA — LINHA FIXA (FOMIO) ────────────────── */
    function createFixedDayCellWithListeners(d, fixedRow, year, month, savedMap, nIntStr, daysInMonth, calculateVolunteersRowTotal, calculateColumnTotals, holidays) {
      const td = document.createElement("td");
      td.className = `fixed-day-cell-${d}`;
      td.contentEditable = currentSection !== "Consultar Escalas";
      td.style.cssText = COMMON_TD_STYLE; td.style.fontWeight = "bold";
      const date = new Date(year, month - 1, d);
      const holiday = holidays?.find(h => h.date.getDate() === d && h.date.getMonth() === month - 1);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const val = (savedMap[`${nIntStr}_${d}`] || "").toUpperCase();
      td.textContent = val;
      if (currentSection === "Emissão Escala" && ["ED","EN","ET","EP"].includes(val)) {
        td.contentEditable = "false";
        td.style.cursor = "not-allowed";
        td.style.opacity = "0.8";
      } else if (currentSection === "Emissão Escala") {
        td.contentEditable = "true";
        td.style.cursor = "";
        td.style.opacity = "";
      }
      const setFixedColor = v => {
        if (v) {updateCellColor(td, v, date); return;}
        if (holiday) {td.style.background = holiday.optional ? "#2ecc71" : "#ffcccc"; td.style.color = holiday.optional ? "#fff" : "#000";}
        else if (isWeekend) {td.style.background = WEEKEND_COLOR; td.style.color = "#000";}
        else {td.style.background = "transparent"; td.style.color = "#000";}
      };
      setFixedColor(val);
      selectAllOnFocus(td);
      td.addEventListener("input", () => {
        let value = td.textContent.toUpperCase().slice(0, 1);
        if (td.textContent !== value) td.textContent = value;
        value.trim() === "" ? setFixedColor("") : updateCellColor(td, value, date);
        calculateVolunteersRowTotal(fixedRow, currentSection, daysInMonth);
        calculateColumnTotals(fixedRow.parentElement, currentSection, daysInMonth);
        const cells = Array.from(fixedRow.querySelectorAll("td")).filter(c => c.contentEditable === "true");
        const idx = cells.indexOf(td);
        if (value.length === 1 && cells[idx + 1]) cells[idx + 1].focus();
      });
      td.addEventListener("blur", () => {savedMap[`${nIntStr}_${d}`] = td.textContent.toUpperCase().slice(0,1);});
      td.addEventListener("keydown", e => handleKeyNav(e, td, fixedRow));
      return td;
    }
    /* ─── ESTRUTURA DA TABELA (FOMIO) ────────────────────────── */
    function createTableHeaders(container, year, month, section) {
      const h2 = document.createElement("h2");
      h2.textContent = "ESCALA DE SERVIÇO"; h2.style.cssText = SCALES_TITLE_MAIN_STYLE;
      container.appendChild(h2);
      if (section !== "Emissão Escala" && section !== "Consultar Escalas") {
        const h3 = document.createElement("h3");
        h3.textContent = section ? section.toUpperCase() : ""; h3.style.cssText = SCALES_TITLE_SUB_STYLE;
        container.appendChild(h3);
      }
      const h3m = document.createElement("h3");
      h3m.textContent = `${MONTH_NAMES_UPPER[month-1]} ${year}`; h3m.style.cssText = TITLE_MONTHYEAR_STYLE;
      container.appendChild(h3m);
    }
    function createTableWrapper(container) {
      let wrapper = container.querySelector(".table-container");
      if (!wrapper) {wrapper = document.createElement("div"); wrapper.className = "table-container"; container.appendChild(wrapper);}
      wrapper.innerHTML = "";
      Object.assign(wrapper.style, {position:"relative", maxHeight:"75vh", height:"450px", overflowY:"auto"});
      return wrapper;
    }
    function createTableStructure(wrapper) {
      const table = document.createElement("table");
      table.className = "month-table"; table.style.width = "100%"; table.style.borderCollapse = "separated";
      const thead = document.createElement("thead");
      const trWeekdays = document.createElement("tr");
      ["NI","Nome","Catg."].forEach((h,i) => {
        const th = document.createElement("th"); th.textContent = h; th.rowSpan = 2; th.style.cssText = COMMON_TH_STYLE;
        th.style.width = i===0?"50px":i===1?"150px":"50px";
        trWeekdays.appendChild(th);
      });
      for (let d=1; d<=31; d++) {
        const th = document.createElement("th"); th.className = `day-header-${d}`; th.style.cssText = COMMON_TH_STYLE;
        trWeekdays.appendChild(th);
      }
      const thTotal = document.createElement("th"); thTotal.textContent = "TOTAL"; thTotal.rowSpan = 2; thTotal.style.cssText = COMMON_THTOTAL_STYLE;
      trWeekdays.appendChild(thTotal);
      thead.appendChild(trWeekdays);
      const trNumbers = document.createElement("tr");
      for (let d=1; d<=31; d++) {
        const th = document.createElement("th"); th.className = `day-number-${d}`; th.textContent = d; th.style.cssText = COMMON_TH_STYLE;
        trNumbers.appendChild(th);
      }
      thead.appendChild(trNumbers);
      table.appendChild(thead);
      table.appendChild(document.createElement("tbody"));
      wrapper.appendChild(table);
      return table;
    }
    /* ─── HEADERS DE DIA (FOMIO) ─────────────────────────────── */
    function updateScalesDayHeaders(table, year, month, daysInMonth, holidays) {
      const hList = holidays || getPortugalHolidays(year);
      const mesIdx = month - 1;
      for (let d=1; d<=31; d++) {
        const h = table.querySelector(`.day-header-${d}`);
        const n = table.querySelector(`.day-number-${d}`);
        if (!h || !n) continue;
        if (d <= daysInMonth) {
          const date = new Date(year, mesIdx, d);
          h.textContent = date.toLocaleDateString("pt-PT",{weekday:"short"}).toUpperCase().slice(0,3);
          h.style.display = ""; n.style.display = "";
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const holiday = hList.find(hol => hol.date.getDate() === d && hol.date.getMonth() === mesIdx);
          if (holiday) {
            const bg = holiday.optional ? "#2ecc71" : "#ffcccc", fg = holiday.optional ? "#fff" : "#000";
            [h, n].forEach(el => { el.style.background=bg; el.style.color=fg; el.title=holiday.name; el.classList.add(holiday.optional?"holiday-optional":"holiday"); });
          } else {
            const bg = isWeekend ? WEEKEND_COLOR : "#f0f0f0";
            [h, n].forEach(el => { el.style.background=bg; el.style.color="#000"; el.classList.remove("holiday","holiday-optional"); });
          }
        } else { h.style.display="none"; n.style.display="none"; }
      }
    }
    /* ─── LINHAS FIXAS (FOMIO) ───────────────────────────────── */
    function createFixedRows(tbody, data, savedMap, year, month, daysInMonth, section, calculateVolunteersRowTotal, calculateColumnTotals, holidays) {
      const fixedRowsData = [{idx:0, text:savedMap[`fixed_0_text`]||"OFOPE", isHeader:true}, {idx:1, dataIndex:0}, {idx:2, dataIndex:1}, {idx:3, dataIndex:2},
                             {idx:5, text:savedMap[`fixed_3_text`]||"CORPO ATIVO", isHeader:true}];
      fixedRowsData.forEach(rowInfo => {
        let fixedRow = tbody.querySelector(`tr.fixed-row[data-fixed="${rowInfo.idx}"]`);
        if (!fixedRow) {
          fixedRow = document.createElement("tr");
          fixedRow.className = "fixed-row"; fixedRow.setAttribute("data-fixed", rowInfo.idx);
          if (rowInfo.isHeader) {
            const td = document.createElement("td");
            td.colSpan = 3+31+1; td.style.cssText = COMMON_TDSPECIAL_STYLE; td.textContent = rowInfo.text;
            fixedRow.appendChild(td);
          } else {
            const item = data[rowInfo.dataIndex];
            ["NI","Nome","Catg."].forEach(f => {
              const td = document.createElement("td"); td.style.cssText = COMMON_TD_STYLE;
              if (item) td.textContent = f==="NI" ? String(item.n_int).padStart(3,"0") : f==="Nome" ? item.abv_name : item.patent_abv||"";
              fixedRow.appendChild(td);
            });
            const nIntStr = item ? String(item.n_int).padStart(3,"0") : "000";
            for (let d=1; d<=31; d++) {
              const td = createFixedDayCellWithListeners(d, fixedRow, year, month, savedMap, nIntStr, daysInMonth, calculateVolunteersRowTotal, calculateColumnTotals, holidays);
              if (d > daysInMonth) td.style.display = "none";
              fixedRow.appendChild(td);
            }
            const tdTotal = document.createElement("td"); tdTotal.className="fixed-total-cell"; tdTotal.style.cssText=COMMON_TDTOTAL_STYLE;
            fixedRow.appendChild(tdTotal);
          }
          tbody.appendChild(fixedRow);
          if (!rowInfo.isHeader) calculateVolunteersRowTotal(fixedRow, section, daysInMonth);
        }
      });
    }
    /* ─── LINHAS DE DADOS (FOMIO) ────────────────────────────── */
    function createDataRows(tbody, data, savedMap, year, month, daysInMonth, section, calculateVolunteersRowTotal, calculateColumnTotals, holidays) {
      const isEscalaSection = section === "Emissão Escala" || section === "Consultar Escalas";
      data.forEach((item, dataIdx) => {
        if (isEscalaSection && dataIdx < 3) return;
        const nIntStr = String(item.n_int).padStart(3,"0");
        let tr = tbody.querySelector(`tr[data-nint="${nIntStr}"]`);
        if (!tr) {
          tr = document.createElement("tr"); tr.setAttribute("data-nint", nIntStr);
          ["NI","Nome","Catg."].forEach(f => {
            const td = document.createElement("td"); td.style.cssText = COMMON_TD_STYLE;
            td.textContent = f==="NI" ? nIntStr : f==="Nome" ? item.abv_name : item.patent_abv||"";
            tr.appendChild(td);
          });
          for (let d=1; d<=31; d++) tr.appendChild(createDayCellWithListeners(d, tr, year, month, savedMap, section, daysInMonth, calculateVolunteersRowTotal, calculateColumnTotals, holidays));
          const tdTotal = document.createElement("td"); tdTotal.className="total-cell"; tdTotal.style.cssText=COMMON_TDTOTAL_STYLE;
          tr.appendChild(tdTotal);
          tbody.appendChild(tr);
        }
        for (let d=1; d<=31; d++) {
          const td = tr.querySelector(`.day-cell-${d}`);
          if (!td) continue;
          td.style.display = d <= daysInMonth ? "" : "none";
          if (d <= daysInMonth) {
            const date = new Date(year, month-1, d);
            const cellValue = (savedMap[`${nIntStr}_${d}`] || "").toUpperCase();
            td.textContent = cellValue;
            if (section === "Consultar Escalas") {
              td.contentEditable = "false";
              td.style.cursor = "not-allowed";
              td.style.opacity = "1";
            } else if (isEscalaSection && ["ED","EN","ET","EP"].includes(cellValue)) {
              td.contentEditable = "false";
              td.style.cursor = "not-allowed";
              td.style.opacity = "0.8";
            } else if (isEscalaSection) {
              td.contentEditable = "true";
              td.style.cursor = "";
              td.style.opacity = "";
            }
            if (cellValue.trim() === "") {
              const holiday = holidays?.find(h => h.date.getDate()===d && h.date.getMonth()===month-1);
              const isWeekend = date.getDay()===0 || date.getDay()===6;
              if (holiday) {td.style.background=holiday.optional?"#2ecc71":"#ffcccc"; td.style.color=holiday.optional?"#fff":"#000";}
              else if (isWeekend) {td.style.background=WEEKEND_COLOR; td.style.color="#000";}
              else {td.style.background="transparent"; td.style.color="#000";}
            } else {updateCellColor(td, cellValue, date);}
          }
        }
        calculateVolunteersRowTotal(tr, section, daysInMonth);
      });
    }
    /* ─── FUNÇÃO PRINCIPAL DA TABELA (FOMIO) ─────────────────── */
    async function createMonthTable(containerId, year, month, data) {
      currentTableData = data;
      const container = $(containerId);
      if (!container) return;
      container.innerHTML = "";
      createTableHeaders(container, year, month, currentSection);
      const wrapper = createTableWrapper(container);
      const table = createTableStructure(wrapper);
      const daysInMonth = new Date(year, month, 0).getDate();
      const holidays = getPortugalHolidays(year);
      updateScalesDayHeaders(table, year, month, daysInMonth, holidays);
      const sectionToLoad = currentSection === "Consultar Escalas" ? "Emissão Escala" : currentSection;
      const savedMap = await loadSavedData(sectionToLoad, year, month);
      const tbody = table.querySelector("tbody");
      const isEscala = currentSection === "Emissão Escala" || currentSection === "Consultar Escalas";
      if (isEscala) createFixedRows(tbody, data, savedMap, year, month, daysInMonth, currentSection, calculateVolunteersRowTotal, calculateColumnTotals, holidays);
      createDataRows(tbody, data, savedMap, year, month, daysInMonth, currentSection, calculateVolunteersRowTotal, calculateColumnTotals, holidays);
      if (currentSection === "DECIR") {
        createElementsDayNightRows(tbody, daysInMonth);
        calculateElementsDayNightTotals(tbody, daysInMonth);
      }
      const needsMP = ["DECIR","1ª Secção","2ª Secção","Emissão Escala"].includes(currentSection);
      const needsTAS = ["1ª Secção","2ª Secção","Emissão Escala"].includes(currentSection);
      if (needsMP) createMPRows(tbody, daysInMonth, currentSection);
      if (needsTAS) createTASRows(tbody, daysInMonth);
      if (currentSection === "Emissão Escala") createMLRow(tbody, daysInMonth);
      if (needsMP) calculateMPTotals(tbody, daysInMonth, data, currentSection);
      if (needsTAS) calculateTASTotals(tbody, daysInMonth, data);
      if (currentSection === "Emissão Escala") {
        calculateMLTotals(tbody, daysInMonth, data);
        calculateMPTotals(tbody, daysInMonth, data, currentSection);
        calculateTASTotals(tbody, daysInMonth, data);
      }
      createTotalsRow(tbody, daysInMonth);
      calculateColumnTotals(tbody, currentSection, daysInMonth);
    }
    /* ─── LEGENDA (FOMIO) ────────────────────────────────────── */
    function createLegendScale(containerId, legendItems) {
      const container = $(containerId);
      if (!container) return;
      container.querySelector(".legend-scale")?.remove();
      const wrapper = document.createElement("div");
      wrapper.className = "legend-scale";
      wrapper.style.cssText = "display:flex;flex-wrap:wrap;justify-content:center;gap:5px;margin-top:10px;";
      legendItems.forEach(item => {
        const cell = document.createElement("div");
        cell.style.cssText = "display:flex;align-items:center;";
        const tdCode = document.createElement("span");
        tdCode.textContent = item.code;
        tdCode.style.cssText = "border:1px solid #ccc;font-weight:bold;padding:4px 6px;width:40px;height:31px;white-space:nowrap;text-align:center;box-sizing:border-box;";
        updateCellColor(tdCode, item.code, new Date());
        const tdDesc = document.createElement("span");
        tdDesc.textContent = item.desc;
        tdDesc.style.cssText = "border:1px solid #ccc;background:#fff;padding:4px 6px;width:120px;text-align:left;font-size:13px;white-space:nowrap;border-left:0;box-sizing:border-box;";
        cell.append(tdCode, tdDesc);
        wrapper.appendChild(cell);
      });
      container.appendChild(wrapper);
    }
    function handleLegend(containerId) {
      const items = currentSection === "DECIR" ? DECIR_LEGEND
        : (currentSection === "Emissão Escala" || currentSection === "Consultar Escalas") ? ESCALA_LEGEND.concat(ECIN_EXTRA)
        : ESCALA_LEGEND;
      createLegendScale(containerId, items);
    }
    /* ─── LOADERS (FOMIO) ────────────────────────────────────── */
    async function loadSetionData(secao) {
      try {
        const data = await supabaseFetch(`reg_elems?select=n_int,abv_name,patent_abv,MP,TAS&section=eq.${secao}&corp_oper_nr=eq.${getCorpId()}&n_int=lt.900&elem_state=eq.true`);
        return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch (err) {
        console.error(err); return [];
      }
    }
    async function loadDecirData() {
      try {
        const data = await supabaseFetch(`reg_elems?select=n_int,abv_name,patent_abv,MP&corp_oper_nr=eq.${getCorpId()}&elem_state=eq.true`);
        return data.filter(item => parseInt(item.n_int,10) > 8 && parseInt(item.n_int,10) < 400).sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch (err) {
        console.error(err); return [];
      }
    }
    async function loadAllSectionsData() {
      try {
        const data = await supabaseFetch(`reg_elems?select=n_int,abv_name,patent_abv,section,MP,TAS,ML&corp_oper_nr=eq.${getCorpId()}&n_int=gte.003&n_int=lt.900&elem_state=eq.true`);
        const seen = new Set();
        return data.filter(item => {const n=parseInt(item.n_int,10); if(seen.has(n)) return false; seen.add(n); return true;})
                   .sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch (err) {
        console.error(err); return [];
      }
    }
    async function loadSectionData() {
      switch (currentSection) {
        case "Emissão Escala": case "Consultar Escalas": return loadAllSectionsData();
        case "DECIR": return loadDecirData();
        default: return loadSetionData(currentSection);
      }
    }
    async function loadSavedData(section, year, month) {
      try {
        const corp = getCorpId();
        let query = `reg_serv?select=n_int,day,value&corp_oper_nr=eq.${corp}&year=eq.${year}&month=eq.${month}`;
        if (section !== "Emissão Escala") query += `&section=eq.${section}`;
        const data = await supabaseFetch(query);
        return data.reduce((map, item) => {
          const key = `${String(item.n_int).padStart(3,'0')}_${item.day}`;
          if (section === "Emissão Escala" && map[key]) map[key] = "EP";
          else if (map[key]) map[key] += `/${item.value}`;
          else map[key] = item.value;
          return map;
        }, {});
      } catch (err) { console.error(err); return {}; }
    }
    /* ─── SIDEBAR HANDLERS (FOMIO) ───────────────────────────── */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page, access = btn.dataset.access;
        if (page === "page-scales") {
          const header = $("scales-card-header");
          if (header) {
            const iconSvg = `
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path>
              </svg>`;
            const headerText = access === "Emissão Escala" ? "EMISSÃO DE ESCALAS"
                             : access === "Consultar Escalas" ? "CONSULTA DE ESCALAS"
                             : `ESCALA DE SERVIÇO ${access.toUpperCase()}`;
            header.innerHTML = `${iconSvg} ${headerText}`;
          }
        }
      });
    });
    function initSidebarSecaoButtons() {
      document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
        btn.addEventListener("click", async () => {
          currentSection = btn.getAttribute("data-access");
          createFOMIOMonthButtons("months-container", "table-container", yearAtual);
          $("table-container").innerHTML = "";
          document.querySelectorAll(".btn.btn-add").forEach(b => b.classList.remove("active"));
          const saveButton = $("save-button"), emitButton = $("emit-button"), analyzeButton = $("analyze-button");
          if (saveButton) saveButton.style.display = "none";
          if (emitButton) emitButton.style.display = "none";
          if (analyzeButton) analyzeButton.style.display = "none";
        });
      });
    }
    /* ─── INIT (FOMIO) ───────────────────────────────────────── */
    document.addEventListener("DOMContentLoaded", () => {
      createFOMIOMonthButtons("months-container", "table-container", yearAtual);
      initSidebarSecaoButtons();
      initSaveButton();
      const emitBtn = $("emit-button");
      if (emitBtn) emitBtn.addEventListener("click", () => {if (currentSection === "Emissão Escala") initScaleEmission();});
      const analyzeBtn = $("analyze-button");
      if (analyzeBtn) analyzeBtn.addEventListener("click", () => {
        if (currentSection === "Emissão Escala") analyzeSchedule();
        else if (currentSection === "DECIR") analyzeDecirSchedule();
      });
    });
    function getActiveMonthIndex() {
      const container = document.querySelector("#months-container, #months-container-scales");
      if (!container) return null;
      const activeBtn = container.querySelector(".btn.btn-add.active");
      if (!activeBtn) return null;
      return Array.from(container.querySelectorAll(".btn.btn-add")).indexOf(activeBtn) + 1;
    }
    async function fetchSavedData(section, year, month) {
      const corp = getCorpId();
      const base = `reg_serv?year=eq.${year}&month=eq.${month}&corp_oper_nr=eq.${corp}`;
      const url = section === "Emissão Escala"
        ? `${SUPABASE_URL}/rest/v1/${base}&select=n_int,day,value,section`
        : `${SUPABASE_URL}/rest/v1/${base}&select=n_int,day,value&section=eq.${section}`;
      const response = await fetch(url, { headers: getSupabaseHeaders() });
      if (!response.ok) throw new Error("Erro ao carregar dados do mês.");
      return (await response.json()).reduce((map, {n_int, day, value, section:sec}) => {
        map[`${n_int}_${day}`] = section === "Emissão Escala" ? {value, section:sec} : value;
        return map;
      }, {});
    }
    async function saveChanges({toInsert, toUpdate, toDelete, section, year, month}) {
      const corp = getCorpId();
      const requests = [];
      if (toInsert.length) {
        requests.push(fetch(`${SUPABASE_URL}/rest/v1/reg_serv`, {
          method:"POST", headers:{...getSupabaseHeaders(),"Content-Type":"application/json","Prefer":"return=minimal"},
          body: JSON.stringify(toInsert.map(item => ({section:item.section||section, n_int:item.n_int, abv_name:item.abv_name, year, month, day:item.day, value:item.value, corp_oper_nr:corp})))
        }));
      }
      const makeFilter = item => `section=eq.${item.section||section}&n_int=eq.${item.n_int}&year=eq.${year}&month=eq.${month}&day=eq.${item.day}&corp_oper_nr=eq.${corp}`;
      toUpdate.forEach(item => requests.push(fetch(`${SUPABASE_URL}/rest/v1/reg_serv?${makeFilter(item)}`, {
        method:"PATCH", headers:{...getSupabaseHeaders(),"Content-Type":"application/json"}, body:JSON.stringify({value:item.value})
      })));
      toDelete.forEach(item => requests.push(fetch(`${SUPABASE_URL}/rest/v1/reg_serv?${makeFilter(item)}`, {
        method:"DELETE", headers:getSupabaseHeaders()
      })));
      if (requests.length > 0) await Promise.all(requests);
    }
    function diffTableChanges(table, savedMap) {
      const toInsert=[], toUpdate=[], toDelete=[];
      table.querySelectorAll("tr").forEach(row => {
        const cells = row.querySelectorAll("td");
        const n_int = parseInt(cells[0]?.textContent, 10);
        if (isNaN(n_int)) return;
        const abv_name = cells[1]?.textContent;
        for (let d=3; d<cells.length-1; d++) {
          const value = cells[d].textContent.toUpperCase().slice(0,2).trim();
          const day = d-2, key = `${n_int}_${day}`, existingVal = savedMap[key];
          if (existingVal) {
            if (!value) toDelete.push({n_int, day});
            else if (existingVal.toUpperCase() !== value) toUpdate.push({n_int, day, value});
          } else if (value) toInsert.push({n_int, abv_name, day, value});
        }
      });
      return {toInsert, toUpdate, toDelete};
    }
    function diffFixedRowsChanges(table, savedMap) {
      const toInsert = [], toUpdate = [], toDelete = [];
      const PROTECTED = ["ED", "EN", "ET", "EP"];
      table.querySelectorAll("tr.fixed-row").forEach(row => {
        const fixedId = row.getAttribute("data-fixed");
        if (!["1", "2", "3"].includes(fixedId) || row.cells.length < 10) return;
        const n_int = fixedId === "1" ? 3 : fixedId === "2" ? 4 : 9;
        const abv_name = row.cells[1]?.textContent.trim() || "FIXO";
        for (let d = 3; d < row.cells.length - 1; d++) {
          const cellText = row.cells[d]?.textContent.trim().toUpperCase();
          if (PROTECTED.includes(cellText)) continue;
          const value = cellText.slice(0, 1).trim();
          const day = d - 2, key = `${n_int}_${day}`, existingVal = savedMap[key];
          const existingValue = typeof existingVal === 'object' ? existingVal?.value : existingVal;
          const existingSection = typeof existingVal === 'object' ? existingVal?.section : "Emissão Escala";
          if (existingValue) {
            if (!value) toDelete.push({n_int, day, section: existingSection});
            else if (existingValue.toUpperCase() !== value) toUpdate.push({n_int, day, value, section: existingSection});
          } else if (value) {
            toInsert.push({n_int, abv_name, day, value, section: "Emissão Escala"});
          }
        }
      });
      const normalRows = table.querySelectorAll("tr:not(.fixed-row):not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.mp-row):not(.tas-row)");
      normalRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const n_int = parseInt(cells[0]?.textContent, 10);
        if (isNaN(n_int)) return;
        const abv_name = cells[1]?.textContent;
        const person = typeof currentTableData !== 'undefined' ? currentTableData.find(item => parseInt(item.n_int, 10) === n_int) : null;
        const elemSection = person?.section || "Emissão Escala";
        for (let d = 3; d < cells.length - 1; d++) {
          const cellText = cells[d]?.textContent.trim().toUpperCase();
          const value = cellText.slice(0, 2).trim();
          const day = d - 2, key = `${n_int}_${day}`, existingVal = savedMap[key];
          const existingValue = typeof existingVal === 'object' ? existingVal?.value : existingVal;
          const existingSection = typeof existingVal === 'object' ? existingVal?.section : elemSection;
          if (existingValue) {
            if (!value) toDelete.push({n_int, day, section: existingSection});
            else if (existingValue.toUpperCase() !== value) toUpdate.push({n_int, day, value, section: existingSection});
          } else if (value) {
            toInsert.push({n_int, abv_name, day, value, section: elemSection});
          }
        }
      });
      return { toInsert, toUpdate, toDelete };
    }
    function analyzeSchedule() {
      const tbody = document.querySelector(".month-table tbody");
      if (!tbody) {
        showPopup('popup-danger', "Nenhuma escala carregada.");
        return;
      }
      const selectedYear = parseInt($("year-selector")?.value, 10);
      const monthIndex = getActiveMonthIndex();
      if (!monthIndex) {
        showPopup('popup-danger', "Nenhum mês selecionado.");
        return;
      }
      const daysInMonth = new Date(selectedYear, monthIndex, 0).getDate();
      const issues = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dayIssues = [];
        let mpCount = 0;
        const mpNints = new Set();
        tbody.querySelectorAll("tr:not(.fixed-row):not(.totals-row):not(.mp-row):not(.mp-dia-row):not(.mp-noite-row):not(.tas-row):not(.ml-row)").forEach(tr => {
          const nInt = parseInt(tr.getAttribute("data-nint"), 10);
          const person = currentTableData.find(p => parseInt(p.n_int, 10) === nInt);
          if (!person?.MP) return;
          const td = tr.querySelector(`.day-cell-${d}`);
          if (!td || td.style.display === "none") return;
          const v = td.textContent.toUpperCase().trim();
          if (["PD","PN","PT","EP"].includes(v)) {mpCount++; mpNints.add(nInt);}
        });
        const mpSurplus = Math.max(0, mpCount - 1);
        let tasCount = 0;
        const tasNints = new Set();
        tbody.querySelectorAll("tr:not(.fixed-row):not(.totals-row):not(.mp-row):not(.mp-dia-row):not(.mp-noite-row):not(.tas-row):not(.ml-row)").forEach(tr => {
          const nInt = parseInt(tr.getAttribute("data-nint"), 10);
          const person = currentTableData.find(p => parseInt(p.n_int, 10) === nInt);
          if (!person?.TAS) return;
          const td = tr.querySelector(`.day-cell-${d}`);
          if (!td || td.style.display === "none") return;
          const v = td.textContent.toUpperCase().trim();
          if (["PD","PN","PT","EP"].includes(v)) {tasCount++; tasNints.add(nInt);}
        });
        const tasSurplus = Math.max(0, tasCount - 1);
        let mlCount = 0;
        tbody.querySelectorAll("tr:not(.fixed-row):not(.totals-row):not(.mp-row):not(.mp-dia-row):not(.mp-noite-row):not(.tas-row):not(.ml-row)").forEach(tr => {
          const nInt = parseInt(tr.getAttribute("data-nint"), 10);
          const person = currentTableData.find(p => parseInt(p.n_int, 10) === nInt);
          if (!person?.ML) return;
          if (mpNints.has(nInt)) return;
          if (tasNints.has(nInt)) return;
          const td = tr.querySelector(`.day-cell-${d}`);
          if (!td || td.style.display === "none") return;
          const v = td.textContent.toUpperCase().trim();
          if (["PD","PN","PT","EP"].includes(v)) mlCount++;
        });
        const mlTotal = mlCount + mpSurplus + tasSurplus;
        if (mpCount < 1) dayIssues.push(`Pesados: ${mpCount}/1`);
        if (mlTotal < 2) dayIssues.push(`Ligeiros: ${mlTotal}/2`);
        if (tasCount < 1) dayIssues.push(`TAS: ${tasCount}/1`);
        if (dayIssues.length > 0) issues.push(`Dia ${d}: ${dayIssues.join(" | ")}`);
      }
      if (issues.length === 0) {
        showPopup('popup-success', "✅ Todos os dias têm a dotação mínima assegurada.");
      } else {
        showPopup('popup-analyze', "<b>⚠️ Dias com dotação insuficiente:</b>" + "<div style='max-height:200px; overflow-y:auto; margin: 10px 0; font-weight: bold;'>" + issues.join("<br>") + "</div>" +
                  "<small>ℹ️ A análise é efetuada com base nas diferenciações registadas para cada elemento e nas dotações mínimas necessárias ao funcionamento da Grelha Municipal e demais necessidades operacionais do Corpo de Bombeiros.</small>"
                 );
      }
    }
    async function analyzeDecirSchedule() {
      const tbody = document.querySelector(".month-table tbody");
      if (!tbody) {
        showPopup('popup-danger', "Nenhuma escala carregada.");
        return;
      }
      const selectedYear = parseInt($("year-selector")?.value, 10);
      const monthIndex = getActiveMonthIndex();
      if (!monthIndex) {
        showPopup('popup-danger', "Nenhum mês selecionado.");
        return;
      }
      let mode = '1_ecin';
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/decir_mode?corp_oper_nr=eq.${getCorpId()}&select=mode`, {
          headers: getSupabaseHeaders()
        });
        const modeData = await resp.json();
        if (modeData.length > 0) mode = modeData[0].mode;
      } catch (err) {
        console.error("Erro ao carregar modo DECIR:", err);
      }
      const DECIR_MODES = {'1_ecin': {minMP: 1, minTotal: 5}, '1_ecin_1_elac': {minMP: 2, minTotal: 7}, 'brigada': {minMP: 3, minTotal: 12}};
      const limits = DECIR_MODES[mode] || DECIR_MODES['1_ecin'];
      const minBBs = limits.minTotal - limits.minMP;
      const daysInMonth = new Date(selectedYear, monthIndex, 0).getDate();
      const startDay = monthIndex === 5 ? 15 : 1;
      const endDay = monthIndex === 10 ? 15 : daysInMonth;
      const issues = [];
      for (let d = startDay; d <= endDay; d++) {
        let mpDayCount = 0, mpNightCount = 0, totalDayCount = 0, totalNightCount = 0;
        tbody.querySelectorAll("tr:not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.elem-dia-row):not(.elem-noite-row):not(.fixed-row)").forEach(tr => {
          const nInt = parseInt(tr.getAttribute("data-nint"), 10);
          const person = currentTableData.find(p => parseInt(p.n_int, 10) === nInt);
          if (!person) return;
          const td = tr.querySelector(`.day-cell-${d}`);
          if (!td || td.style.display === "none") return;
          const v = td.textContent.toUpperCase().trim();
          const isDay = (v === "ED" || v === "ET");
          const isNight = (v === "EN" || v === "ET");
          if (isDay) totalDayCount++;
          if (isNight) totalNightCount++;
          if (person.MP) {
            if (v === "ED") mpDayCount++;
            else if (v === "EN") mpNightCount++;
            else if (v === "ET") {mpDayCount++; mpNightCount++;}
          }
        });
        const red = (txt) => `<span style="color: #ff4d4d;">${txt}</span>`;
        const styleED = `<span style="color: #DAA520;">Turno ED</span>`;
        const styleEN = `<span style="color: #4A90E2;">Turno EN</span>`;
        let dayED = [];
        let dayEN = [];
        if (mpDayCount < limits.minMP) {
          dayED.push(`MP: ${red(limits.minMP - mpDayCount)}`);
        }
        if (totalDayCount < limits.minTotal) {
          const faltaTotal = limits.minTotal - totalDayCount;
          dayED.push(`BBs: ${red(faltaTotal)}`);
        } else if (totalDayCount > limits.minTotal) {
          dayED.push(red(`${totalDayCount - limits.minTotal} BBs em excesso`));
        }
        if (mpNightCount < limits.minMP) {
          dayEN.push(`MP: ${red(limits.minMP - mpNightCount)}`);
        }
        if (totalNightCount < limits.minTotal) {
          const faltaTotal = limits.minTotal - totalNightCount;
          dayEN.push(`BBs: ${red(faltaTotal)}`);
        } else if (totalNightCount > limits.minTotal) {
          dayEN.push(red(`${totalNightCount - limits.minTotal} BBs em excesso`));
        }
        if (dayED.length > 0) issues.push(`Dia ${d}: ${styleED} ${dayED.join(" | ")}`);
        if (dayEN.length > 0) issues.push(`Dia ${d}: ${styleEN} ${dayEN.join(" | ")}`);
      }
      const modeLabel = { '1_ecin': '1 ECIN', '1_ecin_1_elac': '1 ECIN + 1 ELAC', 'brigada': 'Brigada' }[mode] || mode;
      if (issues.length === 0) {
        showPopup('popup-success', `✅ Dotação mínima assegurada para <b>${modeLabel}</b>.`);
      } else {
        const popupDecir = document.getElementById('popup-analyze-decir');
        if (popupDecir) {
          popupDecir.querySelector('.popup-body').innerHTML = `
            <ul style="list-style:none; padding:0; margin:0;">
              <li><span style="font-size:20px;">•</span> <b>⚠️ Análise DECIR (${modeLabel})</b></li>
              <li style="margin-left: 14px;"><small>Dotação: ${limits.minMP} MP + ${minBBs} BBs (Total: ${limits.minTotal})</small></li>
              <li><div style='max-height:200px; overflow-y:auto; margin: 10px 0; font-weight: bold;'>${issues.join("<br>")}</div></li>
              <li><small>ℹ️ Faltas de MP são prioritárias. Falta de BBs só aparece se o total for inferior a ${limits.minTotal}.</small></li>
            </ul>`;
          popupDecir.classList.add('show');
        }
      }
    }
    function requestDecirElements() {
      const selectedYear = parseInt($("year-selector")?.value, 10);
      const monthIndex = getActiveMonthIndex();
      const nameMonth = MONTH_NAMES_PT[monthIndex - 1];
      const divIssues = document.querySelector('#popup-analyze-decir .popup-body div');
      if (!divIssues) return;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = divIssues.innerHTML;
      tempDiv.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      let lines = tempDiv.innerText.split('\n').filter(line => line.trim() !== "");
      let finalLines = [];
      lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length < 2) return;
        const diaLabel = parts[0].trim();
        const content = parts.slice(1).join(':');
        const issues = content.split('|')
        .map(i => i.trim())
        .filter(i => i !== "" && !i.toLowerCase().includes('excesso'));
        const clearText = (text) => {
          let cleaned = text
          .replace(/Motoristas (de )?Pesados/gi, "MP")
          .replace(/Elementos|Elems\.?|Elems/gi, "BBs")
          .replace(/Turno|ED|EN/gi, "")
          .replace(/\s+/g, " ")
          .trim();
          return cleaned.replace(/:\s*(\d+)/, ": *$1*");
        };
        const absencesED = issues.filter(i => i.toUpperCase().includes('ED')).map(clearText);
        const absencesEN = issues.filter(i => i.toUpperCase().includes('EN')).map(clearText);
        if (absencesED.length > 0) {
          finalLines.push(`${diaLabel}: Turno ED ${absencesED.join(' | ')}`);
        }
        if (absencesEN.length > 0) {
          finalLines.push(`${diaLabel}: Turno EN ${absencesEN.join(' | ')}`);
        }
      });
      let message = `*🚨INFORMAÇÃO🚨*\n\n`;
      message += `*Turnos DECIR por Preencher - ${nameMonth} ${selectedYear}*\n\n`;
      message += `${finalLines.join('\n')}\n\n`;
      message += `As disponibilidades devem ser remetidas para adjunto.faroahb@gamil.com com conhecimento de comando0805.ahbfaro@gamil.com.\n`;
      message += `Obrigado pela vossa colaboração!`;
      navigator.clipboard.writeText(message).then(() => {
        closePopup('popup-analyze-decir');
        showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.");
      }).catch(() => {
        showPopup('popup-danger', 'Erro ao copiar. Tente novamente.');
      });
    }
    function initSaveButton() {
      const saveBtn = $("save-button");
      if (!saveBtn) return;
      saveBtn.style.marginTop = "20px";
      saveBtn.addEventListener("click", async () => {
        const table = document.querySelector(".month-table tbody");
        if (!table) return;
        const selectedYear = parseInt($("year-selector")?.value, 10);
        if (!selectedYear) throw new Error("Year selector não encontrado");
        saveBtn.disabled = true; 
        saveBtn.textContent = "A guardar...";
        try {
          const monthIndex = getActiveMonthIndex();
          if (!monthIndex) throw new Error("Nenhum mês selecionado.");
          if (currentSection === "Emissão Escala") {
            const PROTECTED = ["ED", "EN", "ET", "EP"];
            table.querySelectorAll("tr.fixed-row").forEach(tr => {
              tr.querySelectorAll('td[class*="fixed-day-cell-"]').forEach(td => {
                if (PROTECTED.includes(td.textContent.trim().toUpperCase())) {
                  td.setAttribute('data-original-val', td.textContent);
                  td.textContent = "";
                }
              });
            });
          }
          const savedMap = await fetchSavedData(currentSection, selectedYear, monthIndex);
          const changes = currentSection === "Emissão Escala" ? diffFixedRowsChanges(table, savedMap) : diffTableChanges(table, savedMap);
          await saveChanges({...changes, section:currentSection, year:selectedYear, month:monthIndex});
          if (currentSection === "Emissão Escala") {
            table.querySelectorAll("tr.fixed-row td[data-original-val]").forEach(td => {
              td.textContent = td.getAttribute('data-original-val');
              td.removeAttribute('data-original-val');
            });
          }
          showPopup('popup-success', "Escala gravada com sucesso!");
        } catch (err) {
          console.error(err); 
          showPopup('popup-danger', "Erro ao salvar a tabela: " + err.message);
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = "💾 GUARDAR";
        }
      });
    }
    async function initScaleEmission() {
      const table = document.querySelector(".month-table tbody");
      if (!table) return;
      const saveBtn = $("save-button-emissao");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "⌛ A processar...";
      }
      try {
        const selectedYear = parseInt($("year-selector")?.value, 10);
        const monthIndex = getActiveMonthIndex();
        if (!selectedYear || !monthIndex) {
          throw new Error("Ano ou Mês não selecionado.");
        }
        const corp_oper_nr = getCorpId();
        const nomeMes = MONTH_NAMES_PT[parseInt(monthIndex) - 1];
        showLoadingPopup(`A gerar escala de serviço de ${nomeMes} ${selectedYear}...`);
        /* ───────── NOTIFICAÇÕES ───────── */
        try {
          const respUsers = await fetch(
            `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp_oper_nr}&elem_state=eq.true&select=n_int`,
            {headers: getSupabaseHeaders()
            }
          );
          const activeUsers = await respUsers.json();
          if (activeUsers.length > 0) {
            const now = new Date().toISOString();
            const msgNotif = `📅 A escala de Serviço para ${nomeMes}/${selectedYear} foi emitida. Consulta a área "Escalas"!`;
            await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
              method: 'POST',
              headers: getSupabaseHeaders(),
              body: JSON.stringify(
                activeUsers.map(u => ({n_int: u.n_int, corp_oper_nr, title: "Escala Emitida", message: msgNotif, is_read: false, created_at: now}))
              )
            });
            fetch('https://cb-360-app.vercel.app/api/sendPush', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({recipient_nint: 'geral', corp_nr: corp_oper_nr, sender_name: 'CB360 Online', message_text: msgNotif, sender_nint: '0'})
            }).catch(err => console.error('Erro Push:', err));
          }
        } catch (errNotif) {
          console.error("Erro Notificações:", errNotif);
        }
        /* ───────── EXPORT ───────── */
        await exportScheduleToExcel(table, selectedYear, monthIndex);
        setTimeout(() => {
          hideLoadingPopup();
          showPopup('popup-info', `Escala de serviço para ${nomeMes} ${selectedYear} gerada com sucesso.`);
        }, 400);
      } catch (err) {
        console.error(err);
        hideLoadingPopup();
        showPopup('popup-danger', "Erro ao emitir escala: " + err.message);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Emissão";
        }
      }
    }
    async function exportScheduleToExcel(tbody, year, month) {
      const PROTECTED = ["ED", "EN", "ET", "EP"];
      const fileName = `Escala FOMIO ${MONTH_NAMES_PT[month-1]} ${year}`;
      const daysInMonth = new Date(year, month, 0).getDate();
      const table = tbody.parentElement;
      const holidays = getPortugalHolidays(year);
      const mesIdx = month - 1;
      const holidayDays = holidays.filter(h => !h.optional && h.date.getMonth()===mesIdx).map(h => h.date.getDate());
      const optionalDays = holidays.filter(h => h.optional && h.date.getMonth()===mesIdx).map(h => h.date.getDate());
      const weekdays = [];
      for (let d=1; d<=daysInMonth; d++) weekdays.push(table.querySelector(`.day-header-${d}`)?.textContent.trim() || "");
      const fixedRows = [];
      tbody.querySelectorAll("tr.fixed-row").forEach(tr => {
        if (tr.cells.length <= 1) return;
        const rowData = {ni:tr.cells[0].textContent.trim(), nome:tr.cells[1].textContent.trim(), catg:tr.cells[2].textContent.trim(), days:{}};
        for (let d=1; d<=daysInMonth; d++) {
          const val = tr.querySelector(`.fixed-day-cell-${d}`)?.textContent.trim() || "";
          rowData.days[d] = PROTECTED.includes(val.toUpperCase()) ? "" : val;
        }
        fixedRows.push(rowData);
      });
      const normalRows = [];
      tbody.querySelectorAll("tr:not(.fixed-row):not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.mp-row):not(.tas-row):not(.ml-row)").forEach(tr => {
        const cells = tr.querySelectorAll("td");
        if (cells.length < 3) return;
        const rowData = {ni:cells[0].textContent.trim(), nome:cells[1].textContent.trim(), catg:cells[2].textContent.trim(), days:{}};
        for (let d=1; d<=daysInMonth; d++) {
          const cell = tr.querySelector(`.day-cell-${d}`);
          rowData.days[d] = (cell && cell.style.display !== 'none') ? cell.textContent.trim() : "";
        }
        normalRows.push(rowData);
      });
      const payload = {year, month, monthName:MONTH_NAMES_PT[month-1], fileName, daysInMonth, weekdays, fixedRows, normalRows, holidayDays, optionalDays};
      try {
        const response = await fetch('https://cb360-online.vercel.app/api/scales_convert', {
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
        });
        if (response.ok) {
          const url = URL.createObjectURL(await response.blob());
          const a = document.createElement("a"); a.href=url; a.download=`${fileName}.pdf`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Erro PDF:", error);      
      }
    }
    /* =======================================
    EVENTS
    ======================================= */
    document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (btn && btn.getAttribute('data-page') === 'page-event-disp') {
        console.log("A carregar eventos para consulta...");
        await loadEvents();
      }
    });
    /* ============ ADD SHIFT ============= */
    function addShift() {
      const container = document.getElementById('shiftsList');
      const div = document.createElement('div');
      div.className = 'events-shift-item';
      div.style.cssText = 'display: flex; align-items: center; gap: 5px; margin-bottom: 3px; background: transparent; padding: 0px;';
      div.innerHTML = `
        <div class="major-field">
          <label>Data:</label>
          <input type="date" class="shift-date">
        </div>
        <div class="major-field">
          <label>Início:</label>
          <input type="time" class="shift-start-time">
        </div>
        <div class="major-field">
          <label>Fim:</label>
          <input type="time" class="shift-end-time">
        </div>
        <button type="button" onclick="removeShift(this)" style="background:#fff5f5;border:1px solid #ffcccc;color:red;width:22px;height:22px;cursor:pointer;border-radius:3px;font-size:10px;">✕</button>
      `;
      container.appendChild(div);
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      updateCounter();
    }
    function updateCounter() {
      const totalShifs = document.querySelectorAll('.events-shift-item').length;
      document.getElementById('turno-count').innerText = `(${totalShifs} Inseridos)`;
    }
    /* =========== REMOVE SHIFT =========== */
    function removeShift(btn) {
      btn.parentElement.remove();
      updateCounter();
    }
    /* ============ CLEAR FORM ============ */
    function clearForm() {
      document.querySelectorAll('.admin-container input').forEach(i => i.value = '');
      document.getElementById('eventType').value = '';
      document.getElementById('shiftsList').innerHTML = '';
    }
    /* =========== SUBMIT EVENT =========== */
    async function submitEvent() {
      const eventName = document.getElementById('eventName').value.trim();
      const eventType = document.getElementById('eventType').value;
      const location = document.getElementById('eventLocation').value.trim();
      const startDate = document.getElementById('eventStartDate').value;
      const endDate = document.getElementById('eventEndDate').value;
      const operational = parseInt(document.getElementById('operational').value);
      const valueHour = parseFloat(document.getElementById('valueHour').value);
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!eventName || !eventType || !location || !startDate || !endDate || isNaN(operational) || isNaN(valueHour)) {
        showPopup('popup-danger', "Preencha todos os campos corretamente!"); 
        return;
      }
      const shifts = [...document.querySelectorAll('.events-shift-item')].map(item => ({
        event_shift_date : item.querySelector('.shift-date').value, 
        event_shift : `${item.querySelector('.shift-start-time').value}-${item.querySelector('.shift-end-time').value}`, 
        nec_oper : operational
      })).filter(t => t.event_shift_date && t.event_shift !== "-");
      if (shifts.length === 0) {
        showPopup('popup-danger', "Adicione pelo menos um turno completo!");
        return;
      }
      try {
        const headers = getSupabaseHeaders();
        const respCheck = await fetch(
          `${SUPABASE_URL}/rest/v1/event_list?event=eq.${encodeURIComponent(eventName)}&corp_oper_nr=eq.${corp_oper_nr}`, {
            headers
          }
        );
        const existingEvents = await respCheck.json();
        if (existingEvents.length > 0) { 
          showPopup('popup-danger', `O evento "${eventName}" já existe na sua corporação!`);
          return;
        }        

        const respEvent = await fetch(`${SUPABASE_URL}/rest/v1/event_list`, {
          method : 'POST',
          headers,
          body : JSON.stringify({event: eventName, event_type: eventType, corp_oper_nr, date_start: startDate, date_end: endDate, value: valueHour, location})
        });        
        if (!respEvent.ok) throw new Error("Erro ao criar cabeçalho do evento");        

        await Promise.all(shifts.map(shift => fetch(`${SUPABASE_URL}/rest/v1/event_shifts`, {
          method : 'POST',
          headers,
          body : JSON.stringify({event: eventName, event_shift_date: shift.event_shift_date, event_shift: shift.event_shift, nec_oper: shift.nec_oper, act_oper: 0, corp_oper_nr})
        })));
        try {
          const respUsers  = await fetch(
            `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp_oper_nr}&elem_state=eq.true&select=n_int`, {
              headers
            }
          );
          const activeUsers = await respUsers.json();          
          if (activeUsers.length > 0) {
            const now           = new Date().toISOString();
            const notifications = activeUsers.map(u => ({n_int : u.n_int, corp_oper_nr, title : "EVENTOS", message : `📢 Novo evento: "${eventName}". Inscrições abertas na área de eventos!`,
                                                         is_read : false, created_at : now}));
            await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
              method : 'POST',
              headers,
              body : JSON.stringify(notifications)
            });
            try {
              await fetch('https://cb-360-app.vercel.app/api/sendPush', {
                method : 'POST',
                headers : {'Content-Type': 'application/json'},
                body : JSON.stringify({recipient_nint: 'geral', corp_nr: corp_oper_nr, sender_name: 'CB360 Online', message_text: `📢 Novo evento: "${eventName}". Inscrições abertas!`, sender_nint: '0'})
              });
              console.log('Push notifications enviadas com sucesso!');
            } catch (errPush) {
              console.error('Erro ao enviar push notifications:', errPush);
            }
          }
        } catch (errNotif) {
          console.error("Erro ao notificar elementos:", errNotif);
        }
        showPopup('popup-success', "Evento criado e operacionais notificados com sucesso!");
        clearForm();
        if (typeof loadEvents === "function") loadEvents();
      } catch(e) { 
        console.error("Erro no submitEvent:", e);
        showPopup('popup-danger', "Erro ao criar evento.");
      }
    }
    /* ========== HELPERS ========== */    
    function formatDateDisplay(dateStr) {
      if (!dateStr) return '---';
      const parts = dateStr.split('-');
      return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
    }
    function getEventsStatusClass(state) {
      if (state === 'Aprovado') return 'bg-aprovado';
      if (state === 'Não Aprovado') return 'bg-rejeitado';
      if (state === 'Em Aprovação') return 'bg-pendente';
      return 'bg-default';
    }
    function badgeStyle(cssClass) {
      const map = {'bg-aprovado' : 'background:#2e7d32;', 'bg-rejeitado': 'background:#e53935;', 'bg-pendente' : 'background:#7f0000;', 'bg-default' : 'background:#6c757d;'};
      return (map[cssClass] || map['bg-default']) +
        'padding:3px 8px;border-radius:10px;color:#fff;font-weight:bold;font-size:10px;display:inline-block;min-width:80px;text-align:center;';
    }
    /* ========== LOADING EVENT =========== */    
    async function loadEvents() {
      const tbody = document.querySelector('#eventTable tbody');
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!tbody) {console.warn("loadEvents: #eventTable tbody não encontrado"); return;}
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 12px; font-size: 13px; color: #666;">A carregar...</td></tr>';
      try {
        const resp   = await fetch(
          `${SUPABASE_URL}/rest/v1/event_list?corp_oper_nr=eq.${corp_oper_nr}&order=date_start.desc`, {
            headers: getSupabaseHeaders()
          }
        );
        const eventos = await resp.json();
        tbody.innerHTML = '';
        if (eventos.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 12px; font-size: 13px; color: #888;">Sem eventos registados.</td></tr>';
          return;
        }
        eventos.forEach(ev => {
          const safeId = ev.event.replace(/\W/g, '');
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;"><b>${ev.event}</b></td>
            <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;">${ev.location || '---'}</td>
            <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;">${formatDateDisplay(ev.date_start)}</td>
            <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;">${formatDateDisplay(ev.date_end)}</td>
            <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;">
              <button id="btn-v-${safeId}"
                onclick="toggleDisp('${ev.event.replace(/'/g,"\\'")}', this)"
                style="display: inline-flex; align-items: center; justify-content: center; height: 26px; padding: 0 12px; font-size: 11px; border-radius: 4px; border:none; cursor: pointer; 
                       font-weight: 600; background: #1976d2; color: #fff;">Ver</button>
              <button onclick="deleteFullEvent('${ev.event.replace(/'/g,"\\'")}')"
                      style="display: inline-flex; align-items: center; justify-content: center; height: 26px; padding: 0 12px; font-size: 11px; border-radius: 4px; border: none; cursor:pointer;
                             font-weight: 600; background: #ce1212; color: #fff;">🗑️</button>
            </td>
          `;
          tbody.appendChild(tr);
          const trExp = document.createElement('tr');
          trExp.id = `row-expand-${safeId}`;
          trExp.style.display = 'none';
          trExp.innerHTML = `<td colspan="5" id="container-${safeId}" style="padding: 15px; background: #f9f9f9; border: 1px solid #dee2e6;"></td>`;
          tbody.appendChild(trExp);
        });
      } catch(e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:12px;color:red;font-size:13px;">Erro ao carregar dados.</td></tr>'; 
      }
    }
    /* ======= BUILD DISP TABLE ======= */
    async function buildDispTable(eventName) {
      const corp_oper_nr  = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const encodedName   = encodeURIComponent(eventName);
      try {
        const [rShifts, rDisp] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/event_shifts?event=eq.${encodedName}&corp_oper_nr=eq.${corp_oper_nr}&order=event_shift_date.asc,event_shift.asc`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/event_disp?event=eq.${encodedName}&corp_oper_nr=eq.${corp_oper_nr}&order=event_shift_date.asc,event_shift.asc`,   {
            headers: getSupabaseHeaders()
          })
        ]);
        const shifts = await rShifts.json();
        const disps  = await rDisp.json();
        if (disps.length === 0) {
          return "<div style='padding:10px;color:#666;font-size:13px;'>Sem disponibilidades registadas para este evento.</div>";
        }
        const nInts  = disps.map(d => d.n_int);
        const rElems = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp_oper_nr}&n_int=in.(${nInts.join(',')})&select=n_int,full_name,patent`, {
            headers: getSupabaseHeaders()
          }
        );
        const elems   = await rElems.json();
        const elemMap = {};
        elems.forEach(e => {elemMap[e.n_int] = {full_name: e.full_name, patent: e.patent };});
        const thStyle = 'background: #f1f3f5; padding: 8px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 11px; text-transform: uppercase; color: #495057;';
        const tdStyle = 'padding:6px 5px;border:1px solid #dee2e6;text-align:center;font-size:12px;color:#333;';
        let html = `
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;background:#fff;">
              <thead>
                <tr>
                  <th style="${thStyle}">Nº Int</th>
                  <th style="${thStyle}">Patente</th>
                  <th style="${thStyle}">Nome</th>
                  <th style="${thStyle}">Data</th>
                  <th style="${thStyle}">Turno</th>
                  <th style="${thStyle}">Estado</th>
                  <th style="${thStyle}">Ações</th>
                </tr>
              </thead>
              <tbody>
        `;
        disps.forEach(d => {
          const sInfo = shifts.find(s => s.event_shift_date === d.event_shift_date && s.event_shift === d.event_shift);
          const act = sInfo ? parseInt(sInfo.act_oper || 0) : 0;
          const nec = sInfo ? parseInt(sInfo.nec_oper || 0) : 0;
          const isFull = act >= nec;
          const canAction = !isFull || d.shift_state === 'Aprovado';
          const rowBg = (isFull && d.shift_state !== 'Aprovado') ? 'background:#f8f9fa;color:#adb5bd;' : '';
          const statusCls = (isFull && d.shift_state !== 'Aprovado') ? 'bg-default' : getEventsStatusClass(d.shift_state);
          const statusText = (isFull && d.shift_state !== 'Aprovado') ? 'Turno Cheio'  : d.shift_state;
          const elemData = elemMap[d.n_int] || {};
          const safeEvent = d.event.replace(/'/g, "\\'");
          html += `
            <tr id="disp-row-${d.id}" style="${rowBg}">
              <td style="${tdStyle}">${d.n_int}</td>
              <td style="${tdStyle}">${elemData.patent || '---'}</td>
              <td style="${tdStyle}">${elemData.full_name || d.n_int}</td>
              <td style="${tdStyle}">${formatDateDisplay(d.event_shift_date)}</td>
              <td style="${tdStyle}">${d.event_shift}<br><small style="color: #666;">Vagas: ${act}/${nec}</small></td>
              <td style="${tdStyle}">
                <span style="${badgeStyle(statusCls)}" data-state="${d.shift_state}">${statusText}</span>
              </td>
              <td style="${tdStyle}">
                <div style="display:flex;gap:4px;justify-content:center;">
                  ${canAction ? `
                    <button title="Aprovar"
                      onclick="updateState(${d.id},'Aprovado','${safeEvent}','${d.event_shift_date}','${d.event_shift}')"
                      style="padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold; background: #2e7d32; color: #fff;">✓</button>
                    <button title="Rejeitar"
                      onclick="updateState(${d.id},'Não Aprovado','${safeEvent}','${d.event_shift_date}','${d.event_shift}')"
                      style="padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold; background: #e53935; color: #fff;">✕</button>
                  ` : '<small style="color:#999;">Esgotado</small>'}
                </div>
              </td>
            </tr>
          `;
        });
        html += `</tbody></table></div>`;
        return html;    
      } catch (e) {
        console.error("Erro em buildDispTable:", e);
        return "<div style='color:red;padding:10px;'>Erro ao processar tabela de detalhes.</div>";
      }
    }
    /* ========== TOGGLE DISPLAY ========== */
    async function toggleDisp(eventName, btn) {
      const safeId    = eventName.replace(/\W/g, '');
      const container = document.getElementById(`container-${safeId}`);
      const trParent  = document.getElementById(`row-expand-${safeId}`);
      if (trParent.style.display !== 'table-row') {
        document.querySelectorAll('[id^="row-expand-"]').forEach(el => el.style.display = 'none');
        document.querySelectorAll('[id^="btn-v-"]').forEach(b => {
          b.textContent = 'Ver';
          b.style.background = '#1976d2';
        });
      }
      if (trParent.style.display === 'table-row') {
        trParent.style.display = 'none';
        btn.textContent = 'Ver';
        btn.style.background = '#1976d2';
        return;
      }
      btn.textContent = 'Fechar';
      btn.style.background = '#6c757d';
      trParent.style.display = 'table-row';
      container.innerHTML = "<em style='font-size: 13px; color: #666;'>A carregar...</em>";
      try {
        container.innerHTML = await buildDispTable(eventName);
      } catch(e) {
        console.error(e);
        container.innerHTML = "<span style='color: red; font-size: 13px;'>Erro ao carregar detalhes.</span>";
      }
    }
    /* ========== REFRESH TABLE =========== */
    async function refreshTableOnly(eventName, safeId) {
      const container = document.getElementById(`container-${safeId}`);
      try {
        container.innerHTML = await buildDispTable(eventName);
      } catch(e) { 
        console.error(e);
      }
    }
    /* =========== UPDATE STATE =========== */
    async function updateState(id, newState, evName, sDate, sTime) {
      const row = document.getElementById(`disp-row-${id}`);
      const badge = row.querySelector('[data-state]');
      const oldState = badge.dataset.state;
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const userNInt = row.cells[0].innerText;
      if (oldState === newState) return;
      try {
        if (newState === 'Aprovado') {
          const r = await fetch(
            `${SUPABASE_URL}/rest/v1/event_shifts?event=eq.${encodeURIComponent(evName)}&event_shift_date=eq.${sDate}&event_shift=eq.${sTime}&corp_oper_nr=eq.${corp_oper_nr}`, {
              headers: getSupabaseHeaders()
            }
          );
          const s = await r.json();
          if (s.length > 0) {
            const currentAct = parseInt(s[0].act_oper) || 0;
            const currentNec = parseInt(s[0].nec_oper) || 0;
            if (currentAct >= currentNec) {
              showPopup('popup-danger', "Atenção: Este turno já atingiu o limite de vagas!");
              return;
            }
          }
        }
        const rUp = await fetch(`${SUPABASE_URL}/rest/v1/event_disp?id=eq.${id}`, {
          method : 'PATCH',
          headers : getSupabaseHeaders(),
          body : JSON.stringify({ shift_state: newState })
        });
        if (!rUp.ok) throw new Error("Erro ao atualizar o estado da disponibilidade");
        const msgNotif = newState === 'Aprovado' 
          ? `✅ A tua disponibilidade para o evento "${evName}" (${formatDateDisplay(sDate)}) foi APROVADA.`
          : `❌ A tua disponibilidade para o evento "${evName}" (${formatDateDisplay(sDate)}) não foi aprovada.`;
        await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
          method : 'POST',
          headers : getSupabaseHeaders(),
          body : JSON.stringify({n_int: userNInt, corp_oper_nr, title: "Eventos", message: msgNotif, is_read: false, created_at: new Date().toISOString()})
        });
        try {
          await fetch('https://cb-360-app.vercel.app/api/sendPush', {
            method : 'POST',
            headers : { 'Content-Type': 'application/json' },
            body : JSON.stringify({recipient_nint: userNInt, corp_nr: corp_oper_nr, sender_name: 'CB360 Online', message_text: msgNotif, sender_nint: '0'})
          });
          console.log(`Push notification enviada para ${userNInt}`);
        } catch (errPush) {
          console.error('Erro ao enviar push notification:', errPush);
        }
        let inc = 0;
        if (newState === 'Aprovado'  && oldState !== 'Aprovado') inc =  1;
        else if (newState !== 'Aprovado' && oldState === 'Aprovado') inc = -1;
        if (inc !== 0) {
          const rGet = await fetch(
            `${SUPABASE_URL}/rest/v1/event_shifts?event=eq.${encodeURIComponent(evName)}&event_shift_date=eq.${sDate}&event_shift=eq.${sTime}&corp_oper_nr=eq.${corp_oper_nr}`,
            { headers: getSupabaseHeaders() }
          );
          const cur = await rGet.json();
          if (cur.length > 0) {
            const newActOper = Math.max(0, (parseInt(cur[0].act_oper) || 0) + inc);
            await fetch(`${SUPABASE_URL}/rest/v1/event_shifts?id=eq.${cur[0].id}`, {
              method : 'PATCH',
              headers : getSupabaseHeaders(),
              body : JSON.stringify({act_oper: newActOper})
            });
          }
        }
        const safeId = evName.replace(/\W/g, '');
        await refreshTableOnly(evName, safeId);
        console.log(`Estado atualizado: ${userNInt} -> ${newState}`);
      } catch (e) {
        console.error("Erro crítico no updateState:", e);
        showPopup('popup-danger', "Ocorreu um erro ao processar o estado ou a notificação.");
      }
    }
    /* =========== DELETE EVENT =========== */
    async function deleteFullEvent(eventName) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const confirmation = confirm(`Deseja eliminar o evento "${eventName}"?`);
      if (!confirmation) return;

      try {
        const headers = getSupabaseHeaders();
        const filter = `event=eq.${encodeURIComponent(eventName)}&corp_oper_nr=eq.${corp_oper_nr}`;        
        await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/event_list?${filter}`, {method: 'DELETE', headers}),
          fetch(`${SUPABASE_URL}/rest/v1/event_shifts?${filter}`, {method: 'DELETE', headers}),
          fetch(`${SUPABASE_URL}/rest/v1/event_disp?${filter}`, {method: 'DELETE', headers})
        ]);        
        showPopup('popup-success', "Eliminado com sucesso.");
        loadEvents();
      } catch (e) {
        console.error(e);
        showPopup('popup-danger', "Erro ao eliminar evento.");
      }
    }
    /* =======================================
    VACATIONS
    ======================================= */
     document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (btn && btn.getAttribute('data-page') === 'page-vacations-request') {
        console.log("A carregar eventos para consulta...");
        await loadVacationsAdmin();
      }
    });
    /* === LOAD VACATIONS SOLICITATIONS === */    
    async function loadVacationsAdmin() {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const tbody = document.getElementById('vacationsSummaryBody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="4">A carregar pedidos...</td></tr>';
       try {
         const res = await fetch(`${SUPABASE_URL}/rest/v1/ped_vacat?corp_oper_nr=eq.${corp_oper_nr}&order=year.desc,month.desc`, {
           headers: getSupabaseHeaders()
         });
         const allData = await res.json();
         if (!allData || allData.length === 0) {
           tbody.innerHTML = '<tr><td colspan="4">Não existem pedidos de férias registados.</td></tr>';
           return;
         }
         const summary = {};
         allData.forEach(item => {
           const key = `${item.year}-${item.month}`;
           if (!summary[key]) {
             summary[key] = { year: item.year, month: item.month, total: 0, pending: 0 };
           }
           summary[key].total++;
           if (item.state === 'Em Aprovação') summary[key].pending++;
         });
         const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
         let html = '';
         Object.values(summary).forEach((s, index) => {
           const rowId = `details-vacat-${index}`;
           const counterId = `pending-count-${s.year}-${s.month}`;
           html += `
             <tr>
               <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;"><b>${monthNames[s.month - 1]} ${s.year}</b></td>
               <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;">${s.total}</td>
               <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;">
                 <span id="${counterId}" style="color: ${s.pending > 0 ? '#e67e22' : '#27ae60'}; font-weight: bold;">${s.pending}</span>
               </td>
               <td style="padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px;">
                  <button class="view-btn" style="display: inline-flex; align-items: center; justify-content: center; height: 26px; padding: 0 12px; font-size: 11px; border-radius: 4px; border: none; cursor:pointer;
                                                  font-weight: 600; background: #ce1212; color: #fff;" onclick="toggleVacatDetails('${rowId}', ${s.month}, ${s.year})">Ver</button>
               </td>
             </tr>
             <tr id="${rowId}" class="expandable" style="display: none;">
               <td colspan="4" id="content-${rowId}" style="padding:15px; background:#f0f0f0"></td>
             </tr>
           `;
         });
         tbody.innerHTML = html;
       } catch (err) {
         console.error(err);
         tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Erro ao carregar dados.</td></tr>';
       }
    }
    /* ========== TOGGLE DISPLAY ========== */
    async function toggleVacatDetails(rowId, month, year) {
      const trParent = document.getElementById(rowId);
      const container = document.getElementById(`content-${rowId}`);
      const btn = event.target;
      if (trParent.style.display !== 'table-row') {
        document.querySelectorAll('.expandable').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.view-btn').forEach(b => {
          b.textContent = "Ver";
          b.classList.remove('close-btn');
        });
        trParent.style.display = 'table-row';
        btn.textContent = "Fechar";
        btn.classList.add('close-btn');
        container.innerHTML = "<em>A carregar...</em>";
        container.innerHTML = await buildVacatTable(month, year);
      } else {
        trParent.style.display = 'none';
        btn.textContent = "Ver";
        btn.classList.remove('close-btn');
      }
    }    
    /* ====== BUILD VACATIONS TABLE ======= */
    async function buildVacatTable(month, year) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      try {
        const rVacat = await fetch(
          `${SUPABASE_URL}/rest/v1/ped_vacat?month=eq.${month}&year=eq.${year}&corp_oper_nr=eq.${corp_oper_nr}&order=n_int.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        const vacations = await rVacat.json();
        if (!vacations.length) {
          return "<div style='padding: 10px; color: #666; font-size: 13px;'>Sem pedidos para este período.</div>";
        }
        const nInts = [...new Set(vacations.map(v => v.n_int))];
        const rElems = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp_oper_nr}&n_int=in.(${nInts.join(',')})&select=n_int,full_name,patent`, {
            headers: getSupabaseHeaders()
          }
        );
        const elems = await rElems.json();
        const elemMap = {};
        elems.forEach(e => {
          elemMap[e.n_int] = e;
        });
        const thStyle = 'background: #f1f3f5; padding: 8px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 11px; text-transform: uppercase; color: #495057;';
        const tdStyle = 'padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #333;';
        let html = `
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;background:#fff;">
              <thead>
                <tr>
                  <th style="${thStyle}">Nº Int</th>
                  <th style="${thStyle}">Patente</th>
                  <th style="${thStyle}">Nome</th>
                  <th style="${thStyle}">Dias</th>
                  <th style="${thStyle}">Estado</th>
                  <th style="${thStyle}">Ações</th>
                </tr>
              </thead>
              <tbody>
            `;
        vacations.forEach(v => {
          const elem = elemMap[v.n_int] || { full_name: v.n_int, patent: '---' };
          const statusCls = getVacatiosStatusClass(v.state);
          const statusText = v.state;
          html += `
            <tr id="vacat-row-${v.id}">
              <td style="${tdStyle}">${v.n_int}</td>
              <td style="${tdStyle}">${elem.patent}</td>
              <td style="${tdStyle}">${elem.full_name}</td>
              <td style="${tdStyle}"><strong>${formatDaysGrouped(v.day)}</strong></td>
              <td style="${tdStyle}">
                <span id="badge-${v.id}" style="${badgeStyle(statusCls)}">${statusText}</span>
              </td>
              <td style="${tdStyle}">
                <div style="display:flex;gap:4px;justify-content:center;">
                  <button title="Aprovar"
                    onclick="updateVacatState(${v.id}, 'Aprovadas', ${year}, ${month})"
                    style="padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold; background: #2e7d32; color: #fff;">✓</button>
    
                  <button title="Rejeitar"
                    onclick="updateVacatState(${v.id}, 'Recusadas', ${year}, ${month})"
                    style="padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold; background: #e53935; color: #fff;">✕</button>
                </div>
              </td>
            </tr>
          `;
        });
        html += `</tbody></table></div>`;
        return html;
      } catch (e) {
        console.error(e);
        return "<div style='color:red;padding:10px;'>Erro ao processar tabela.</div>";
      }
    }
    /* ====== UPDATE VACATIONS STATE ====== */
    async function updateVacatState(id, newState, year, month) {
      try {
        const badge = document.getElementById(`badge-${id}`);
        const oldState = badge ? badge.textContent.trim() : "";
        if (oldState === newState) return;
        const respPed = await fetch(`${SUPABASE_URL}/rest/v1/ped_vacat?id=eq.${id}`, {
          headers: getSupabaseHeaders()
        });
        const [request] = await respPed.json();
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ped_vacat?id=eq.${id}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({ state: newState })
        });
        if (res.ok) {
          if (newState === 'Aprovadas') {
            await deleteDaysOnVacation(request);
            await recordDaysOnVacation(request);
          } else if (oldState === 'Aprovadas' && newState !== 'Aprovadas') {
            await deleteDaysOnVacation(request);
          }
          const MONTH_NAMES_PT_VACT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
          const monthName = MONTH_NAMES_PT_VACT[parseInt(month) - 1] || month;
          const msgNotif = newState === 'Aprovadas'
            ? `As tuas férias de voluntariado para ${monthName} de ${year} foram aprovadas! ✅` 
            : newState === 'Recusadas'
            ? `As tuas férias de voluntariado para ${monthName} de ${year} foram recusadas. ❌`
            : `O teu pedido de férias de voluntariado para ${monthName} de ${year} foi colocado como: ${newState}.`;
          await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
            method: 'POST',
            headers: getSupabaseHeaders(),
            body: JSON.stringify({n_int: request.n_int, corp_oper_nr: request.corp_oper_nr, title: "Gestão de Férias", message: msgNotif, is_read: false, created_at: new Date().toISOString()})
          });
          try {
            await fetch('https://cb-360-app.vercel.app/api/sendPush', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({recipient_nint: Number(request.n_int), corp_nr: String(request.corp_oper_nr), sender_name: "Gestão de Férias", message_text: msgNotif, sender_nint: 0})
            });
          } catch (e) {
            console.error("Erro no Push de férias:", e);
          }
          if (badge) {
            const cls = getVacatiosStatusClass(newState);
            badge.textContent = newState;
            badge.setAttribute('style', badgeStyle(cls));
          }
          if (oldState === "Em Aprovação") {
            const counterSpan = document.getElementById(`pending-count-${year}-${month}`);
            if (counterSpan) {
              let currentVal = parseInt(counterSpan.textContent) || 0;
              if (currentVal > 0) {
                let newVal = currentVal - 1;
                counterSpan.textContent = newVal;
                if (newVal === 0) counterSpan.style.color = '#27ae60';
              }
            }
          }
          console.log("Fluxo concluído: Base de dados atualizada e notificação enviada.");
        } else {
          throw new Error("Falha ao atualizar o estado no servidor.");
        }
      } catch (err) {
        console.error("Erro no fluxo updateVacatState:", err);
        showPopup('popup-danger', "Erro ao processar alteração.");
      }
    }
    /* ========== SAVE VACATIONS ========== */
    async function recordDaysOnVacation(request) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const respElem = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${request.n_int}&corp_oper_nr=eq.${corp_oper_nr}`, {
        headers: getSupabaseHeaders()
      });
      const [elem] = await respElem.json();
      if (!elem) return;    
      const listaDias = request.day.split(',').map(d => d.trim());    
      const promises = listaDias.map(dia => fetch(`${SUPABASE_URL}/rest/v1/reg_serv`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({n_int: request.n_int, section: elem.section, abv_name: elem.abv_name, year: request.year, month: request.month, day: parseInt(dia), value: "FE", corp_oper_nr: corp_oper_nr})
        })
      );
      await Promise.all(promises);
    }    
    /* ========= DELETE VACATIONS ========= */
    async function deleteDaysOnVacation(request) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const query = `n_int=eq.${request.n_int}&year=eq.${request.year}&month=eq.${request.month}&value=eq.FE&corp_oper_nr=eq.${corp_oper_nr}`;      
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_serv?${query}`, {
          method: 'DELETE',
          headers: getSupabaseHeaders()
        });       
      } catch (err) {
        console.error("Erro ao apagar dias de férias:", err);
      }
    }
    function formatDaysGrouped(daysString) {
      const days = daysString.split(',').map(Number).sort((a, b) => a - b);
      let groups = [], start = days[0], end = start;
      for (let i = 1; i <= days.length; i++) {
        if (days[i] === end + 1) { end = days[i]; } 
        else {
          groups.push(start === end ? String(start).padStart(2,'0') : `${String(start).padStart(2,'0')} a ${String(end).padStart(2,'0')}`);
          start = days[i]; end = start;
        }
      }
      return groups.join(', ');
    }
    function getVacatiosStatusClass(state) {
      const s = state ? state.trim() : '';      
      if (s === 'Aprovadas' || s === 'Aprovado') return 'bg-approved';
      if (s === 'Recusadas' || s === 'Não Aprovado' || s === 'Rejeitado') return 'bg-rejected';
      return 'bg-pending';
    }
    function badgeStyle(cls) {
      if (cls === 'bg-approved') {
        return 'background: #2e7d32; color:#fff; padding: 3px 6px;border-radius: 50px;';
      }
      if (cls === 'bg-rejected') {
        return 'background: #e53935; color:#fff; padding: 3px 6px;border-radius: 50px;';
      }
      return 'background: #f39c12; color:#fff; padding: 3px 6px;border-radius: 50px;';
    }
