    /* =======================================
    FOMIO
    ======================================= */
    /* Notificações push (sendPush): o servidor exige o token da sessão */
    function cb360PushHeaders() {
      const tk = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      return {'Content-Type': 'application/json', 'Authorization': `Bearer ${tk}`};
    }
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
      const DECIR_HIDDEN_MONTHS = [0, 1, 2, 3, 10, 11];
      MONTH_NAMES_PT.forEach((month, index) => {
        const btn = document.createElement("button");
        btn.textContent = month; btn.className = "btn btn-add";
        Object.assign(btn.style, {fontSize:"14px",fontWeight:"bold",width:"110px",height:"40px",borderRadius:"4px",margin:"2px"});
        if (currentSection === "DECIR" && DECIR_HIDDEN_MONTHS.includes(index)) {
          btn.style.display = "none";
        }
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
          const data = await loadSectionData(selectedYear, index + 1);
          createMonthTable(tableContainerId, selectedYear, index + 1, data);          
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
        if (["PN","ED","EN","ET"].includes(value)) {
          const corpOperNr = getCorpId();
          if (["ED","ET"].includes(value)) {
            const respD = await fetch(
              `${SUPABASE_URL}/rest/v1/reg_employee_shifts?n_int=eq.${n_int}&year=eq.${year}&month=eq.${month}&day=eq.${day}&shift=eq.D&corp_oper_nr=eq.${corpOperNr}`,
              { headers: getSupabaseHeaders() }
            );
            if (respD.ok && (await respD.json()).length > 0)
              return "Este elemento está escalado como funcionário durante o dia neste dia.";
          }
          if (["EN","ET","PN"].includes(value)) {
            const respN = await fetch(
              `${SUPABASE_URL}/rest/v1/reg_employee_shifts?n_int=eq.${n_int}&year=eq.${year}&month=eq.${month}&day=eq.${day}&shift=eq.N&corp_oper_nr=eq.${corpOperNr}`,
              { headers: getSupabaseHeaders() }
            );
            if (respN.ok && (await respN.json()).length > 0)
              return "Este elemento está escalado como funcionário durante a noite neste dia.";
          }
        }    
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
      const ofopeItems = data.filter(p => p.is_ofope).slice(0, 6);
      const fixedRowsData = [{idx: 0, text: savedMap[`fixed_0_text`] || "OFOPE", isHeader: true}];
      for (let i = 0; i < 6; i++) {
        fixedRowsData.push({idx: i + 1, item: ofopeItems[i] || null});
      }
      fixedRowsData.push({idx: 7, text: savedMap[`fixed_3_text`] || "CORPO ATIVO", isHeader: true});
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
            const item = rowInfo.item;
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
        if (!rowInfo.isHeader && !rowInfo.item) fixedRow.style.display = "none";
        else fixedRow.style.display = "";
      });
    }
    /* ─── LINHAS DE DADOS (FOMIO) ────────────────────────────── */
    function createDataRows(tbody, data, savedMap, year, month, daysInMonth, section, calculateVolunteersRowTotal, calculateColumnTotals, holidays) {
      const isEscalaSection = section === "Emissão Escala" || section === "Consultar Escalas";
      data.forEach((item) => {
        if (isEscalaSection && item.is_ofope) return;
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
      container.style.transition = "opacity 0.5s";
      container.style.opacity = "0.5";
      await new Promise(r => setTimeout(r, 150));
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
        calculateElementsDayNightTotals(tbody, daysInMonth);  }
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
      handleLegend(containerId); 
      container.style.opacity = "1";
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
    async function loadSetionData(secao, year, month) {
      try {
        const data = await supabaseFetch(
          `reg_elems?select=n_int,abv_name,patent_abv,MP,TAS,elem_state,inactive_from,is_ofope&section=eq.${secao}&corp_oper_nr=eq.${getCorpId()}&n_int=lt.900`
        );
        const firstOfMonth = new Date(year, month - 1, 1);
        return data
          .filter(item => {
            if (!item.inactive_from && item.elem_state) return true;
            if (!item.inactive_from) return false;
            return new Date(item.inactive_from) > firstOfMonth;
          })
          .sort((a, b) => parseInt(a.n_int, 10) - parseInt(b.n_int, 10));
      } catch (err) {
        console.error(err); return [];
      }
    }
    async function loadDecirData(year, month) {
      try {
        const data = await supabaseFetch(
          `reg_elems?select=n_int,abv_name,patent_abv,MP,elem_state,inactive_from,is_ofope&corp_oper_nr=eq.${getCorpId()}`
        );
        const firstOfMonth = new Date(year, month - 1, 1);
        return data
          .filter(item => {
          const n = parseInt(item.n_int, 10);
          if (n <= 8) return false;
          if (n >= 400 && n < 700) return false;
          if (n >= 800) return false;
          if (!item.inactive_from && item.elem_state) return true;
          if (!item.inactive_from) return false;
          return new Date(item.inactive_from) > firstOfMonth;
        })
          .sort((a, b) => {
          const n1 = parseInt(a.n_int, 10);
          const n2 = parseInt(b.n_int, 10);
          const isDecir1 = n1 >= 700 && n1 < 800;
          const isDecir2 = n2 >= 700 && n2 < 800;
          if (isDecir1 && !isDecir2) return -1;
          if (!isDecir1 && isDecir2) return 1;
          return n1 - n2;
        });
      } catch (err) {
        console.error(err); return [];
      }
    }
    async function loadAllSectionsData(year, month) {
      try {
        const data = await supabaseFetch(
          `reg_elems?select=n_int,abv_name,patent_abv,section,MP,TAS,ML,elem_state,inactive_from,is_ofope&corp_oper_nr=eq.${getCorpId()}&n_int=gte.003&n_int=lt.900`
        );
        const firstOfMonth = new Date(year, month - 1, 1);
        const seen = new Set();
        return data
          .filter(item => {
            const n = parseInt(item.n_int, 10);
            if (seen.has(n)) return false;
            seen.add(n);
            if (!item.inactive_from && item.elem_state) return true;
            if (!item.inactive_from) return false;
            return new Date(item.inactive_from) > firstOfMonth;
          })
          .sort((a, b) => parseInt(a.n_int, 10) - parseInt(b.n_int, 10));
      } catch (err) {
        console.error(err); return [];
      }
    }
    async function loadSectionData(year, month) {
      switch (currentSection) {
        case "Emissão Escala": case "Consultar Escalas": return loadAllSectionsData(year, month);
        case "DECIR": return loadDecirData(year, month);
        default: return loadSetionData(currentSection, year, month);
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
    async function opsCheckResponses(responses, label) {
      for (const r of [].concat(responses)) {
        if (r && !r.ok) {
          const t = await r.text().catch(() => "");
          let msg = t;
          try { msg = JSON.parse(t).message || t; } catch (e) {}
          throw new Error(`${label}: ${msg || r.status}`);
        }
      }
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
      if (requests.length > 0) {
        const responses = await Promise.all(requests);
        await opsCheckResponses(responses, "Erro ao gravar escala");
      }
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
        const fixedId = parseInt(row.getAttribute("data-fixed"), 10);
        if (!(fixedId >= 1 && fixedId <= 6) || row.cells.length < 10) return;
        if (row.style.display === "none") return;
        const n_int = parseInt(row.cells[0]?.textContent.trim(), 10);
        if (!n_int) return;
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
          let value = cellText.slice(0, 2).trim();
          const day = d - 2, key = `${n_int}_${day}`, existingVal = savedMap[key];
          const existingValue = typeof existingVal === 'object' ? existingVal?.value : existingVal;
          const existingSection = typeof existingVal === 'object' ? existingVal?.section : elemSection;
          let saveSection = existingSection;
          if (value === "EP") {
            value = "ED";
            saveSection = "DECIR";
          }
          if (existingValue) {
            if (!value) toDelete.push({n_int, day, section: saveSection});
            else if (existingValue.toUpperCase() !== value) toUpdate.push({n_int, day, value, section: saveSection});
          } else if (value) {
            toInsert.push({n_int, abv_name, day, value, section: saveSection});
          }
        }
      });
      return {toInsert, toUpdate, toDelete};
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
      } catch (err) {console.error("Erro ao carregar modo DECIR:", err);}
      const DECIR_MODES = {'1_ecin': {minMP: 1, minTotal: 5, minChiefs: 1}, '1_ecin_1_elac': {minMP: 2, minTotal: 7, minChiefs: 2}, 'brigada': {minMP: 3, minTotal: 12, minChiefs: 3}};
      const CHIEFS = ["B2C", "B1C", "SCH", "CH"];
      const CHIEFS_LABEL = {"CH": "Chefe", "SCH": "Subchefe", "B1C": "Bombeiro(a) 1ª", "B2C": "Bombeiro(a) 2ª"};
      const limits = DECIR_MODES[mode] || DECIR_MODES['1_ecin'];
      const minBBs = limits.minTotal - limits.minMP;
      const daysInMonth = new Date(selectedYear, monthIndex, 0).getDate();
      const startDay = monthIndex === 5 ? 15 : 1;
      const endDay = monthIndex === 10 ? 15 : daysInMonth;
      const issuesAbsents = [];
      const issuesChiefs = [];
      for (let d = startDay; d <= endDay; d++) {
        let mpDayCount = 0, mpNightCount = 0, totalDayCount = 0, totalNightCount = 0;
        const dayPatents = [], nightPatents = [];
        tbody.querySelectorAll("tr:not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.elem-dia-row):not(.elem-noite-row):not(.fixed-row)").forEach(tr => {
          const nInt = parseInt(tr.getAttribute("data-nint"), 10);
          const person = currentTableData.find(p => parseInt(p.n_int, 10) === nInt);
          if (!person) return;
          const td = tr.querySelector(`.day-cell-${d}`);
          if (!td || td.style.display === "none") return;
          const v = td.textContent.toUpperCase().trim();
          const isDay = (v === "ED" || v === "ET");
          const isNight = (v === "EN" || v === "ET");
          if (isDay) {totalDayCount++; dayPatents.push(person.patent_abv || "");}
          if (isNight) {totalNightCount++; nightPatents.push(person.patent_abv || "");}
          if (person.MP) {
            if (v === "ED") mpDayCount++;
            else if (v === "EN") mpNightCount++;
            else if (v === "ET") {mpDayCount++; mpNightCount++;}
          }
        });
        const red = (txt) => `<span style="color: #ff4d4d;">${txt}</span>`;
        const styleED = `<span style="color: #DAA520;">Turno ED</span>`;
        const styleEN = `<span style="color: #4A90E2;">Turno EN</span>`;
        const checkChiefs = (patents, totalCount) => {
          const msgs = [];
          if (totalCount < limits.minTotal) return msgs;
          const chiefsCount = patents.filter(p => CHIEFS.includes(p.toUpperCase())).length;
          const allB3C = chiefsCount === 0;
          const modeLabel = {'1_ecin': '1 ECIN', '1_ecin_1_elac': '1 ECIN + 1 ELAC', 'brigada': 'Brigada'}[mode];
          if (allB3C) {
            msgs.push(red(`todos os elementos são B3C, deve conter pelo menos ${limits.minChiefs} graduado(s) (Chefe, Subchefe, Bombeiro(a) 1ª ou Bombeiro(a) 2ª).`));
          } else if (chiefsCount < limits.minChiefs) {
            const absents = limits.minChiefs - chiefsCount;
            const chiefAbv = patents.find(p => CHIEFS.includes(p.toUpperCase())) || "";
            const chiefLabel = CHIEFS_LABEL[chiefAbv.toUpperCase()] || chiefAbv;
            msgs.push(red(`o modo ativo é ${modeLabel}, tem apenas como graduado ${chiefsCount} ${chiefLabel}, deve conter pelo menos mais ${absents} graduado(s) (Chefe, Subchefe, Bombeiro(a) 1ª ou no mínimo Bombeiro(a) 2ª).`));
          }
          return msgs;
        };
        let dayED_absents = [], dayED_chiefs = [], dayEN_absents = [], dayEN_chiefs = [];
        let absentMP_D = 0;
        if (mpDayCount < limits.minMP) {absentMP_D = limits.minMP - mpDayCount; dayED_absents.push(`MP: ${red(absentMP_D)}`);}
        if (totalDayCount < limits.minTotal) {
          const openPositionsD = limits.minTotal - totalDayCount;
          const absentBBsD = openPositionsD - absentMP_D;
          if (absentBBsD > 0) dayED_absents.push(`BBs: ${red(absentBBsD)}`);
        } else if (totalDayCount > limits.minTotal) {
          dayED_absents.push(red(`${totalDayCount - limits.minTotal} BBs em excesso`));
        }
        dayED_chiefs.push(...checkChiefs(dayPatents, totalDayCount));
        let absentMP_N = 0;
        if (mpNightCount < limits.minMP) {absentMP_N = limits.minMP - mpNightCount; dayEN_absents.push(`MP: ${red(absentMP_N)}`);}
        if (totalNightCount < limits.minTotal) {
          const openPositionsN = limits.minTotal - totalNightCount;
          const absentBBsN = openPositionsN - absentMP_N;
          if (absentBBsN > 0) dayEN_absents.push(`BBs: ${red(absentBBsN)}`);
        } else if (totalNightCount > limits.minTotal) {
          dayEN_absents.push(red(`${totalNightCount - limits.minTotal} BBs em excesso`));
        }
        dayEN_chiefs.push(...checkChiefs(nightPatents, totalNightCount));
        if (dayED_absents.length > 0) issuesAbsents.push(`Dia ${d}: ${styleED} ${dayED_absents.join(" | ")}`);
        if (dayEN_absents.length > 0) issuesAbsents.push(`Dia ${d}: ${styleEN} ${dayEN_absents.join(" | ")}`);
        if (dayED_chiefs.length > 0) issuesChiefs.push(`Dia ${d}: ${styleED} ${dayED_chiefs.join(" | ")}`);
        if (dayEN_chiefs.length > 0) issuesChiefs.push(`Dia ${d}: ${styleEN} ${dayEN_chiefs.join(" | ")}`);
      }
      const modeLabel = {'1_ecin': '1 ECIN', '1_ecin_1_elac': '1 ECIN + 1 ELAC', 'brigada': 'Brigada'}[mode] || mode;
      if (issuesAbsents.length === 0 && issuesChiefs.length === 0) {
        showPopup('popup-success', `✅ Dotação mínima assegurada para <b>${modeLabel}</b>.`);
      } else {
        const popupDecir = document.getElementById('popup-analyze-decir');
        if (popupDecir) {
          const absentsSection = issuesAbsents.length > 0
            ? `<b>🚫 Turnos por Preencher / Excessos:</b><br>${issuesAbsents.join("<br>")}`
            : "";
          const chiefsSection = issuesChiefs.length > 0
            ? `<br><br><b>🚫 Turnos sem Graduados:</b><br>${issuesChiefs.join("<br>")}<br><br><small>ℹ️ A alteração aos graduados é facultativa mas aconselhável.</small>`
            : "";
          popupDecir.querySelector('.popup-body').innerHTML = `
            <ul style="list-style:none; padding:0; margin:0;">
              <li><span style="font-size:20px;">•</span> <b>⚠️ Turnos DECIR por Preencher e/ou Turnos com excessos. (${modeLabel})</b></li>
              <li style="margin-left: 14px;"><small>Dotação: ${limits.minMP} Motoristas + ${minBBs} Bombeiros (Total: ${limits.minTotal} Elementos.)</small></li>
              <li>
                <div style='max-height:200px; overflow-y:auto; margin: 10px 0; font-weight: bold;'>
                  <div id="decir-absents-section">${absentsSection}</div>
                  <div id="decir-chiefs-section">${chiefsSection}</div>
                </div>
              </li>
              <li><small>ℹ️ A análise verifica as dotações mínimas por turno (Dia/Noite) de acordo com o modo DECIR configurado. Separando Motoristas de Pesados e Bombeiros.</small></li>
            </ul>`;
          popupDecir.classList.add('show');
          opsGetDecirDispMails(); // pré-carrega para a cópia ser imediata
        }
      }
    }
    /* ===== Emails para onde se enviam as disponibilidades DECIR (Emails Config. → decir_disp_mail_*) ===== */
    let opsDecirDispMailsCache = null;
    async function opsGetDecirDispMails() {
      if (opsDecirDispMailsCache) return opsDecirDispMailsCache;
      try {
        const corpNr = sessionStorage.getItem("currentCorpOperNr");
        const res = await fetch(`${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpNr}&category=in.(decir_disp_mail_to,decir_disp_mail_cc)&select=category,value`, {headers: getSupabaseHeaders()});
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        const val = (cat) => String(rows.find(r => r.category === cat)?.value || "").split(",").map(e => e.trim()).filter(Boolean).join(", ");
        opsDecirDispMailsCache = {to: val("decir_disp_mail_to"), cc: val("decir_disp_mail_cc")};
        return opsDecirDispMailsCache;
      } catch (err) {
        console.warn("Não foi possível obter os emails das disponibilidades DECIR:", err);
        return {to: "", cc: ""};
      }
    }
    async function requestDecirElements() {
      const selectedYear = parseInt($("year-selector")?.value, 10);
      const monthIndex = getActiveMonthIndex();
      const nameMonth = MONTH_NAMES_PT[monthIndex - 1];
      const divIssues = document.querySelector('#decir-absents-section');
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
        const restOfLine = parts.slice(1).join(':');
        const isED = restOfLine.toUpperCase().includes('ED');
        const isEN = restOfLine.toUpperCase().includes('EN');
        const issues = restOfLine.split('|')
          .map(i => i.trim())
          .filter(i => i !== "" && !i.toLowerCase().includes('excesso'));
        if (issues.length === 0) return;
        const clearText = (text) => {
          return text
            .replace(/Turno|ED|EN/gi, "")
            .replace(/Motoristas (de )?Pesados/gi, "MP")
            .replace(/Elementos|Elems\.?|Elems/gi, "BBs")
            .replace(/:\s*(\d+)/g, ": *$1*")
            .replace(/\s+/g, " ")
            .trim();
        };
        const cleanedIssues = issues.map(clearText).join(' | ');
        if (isED) {
          finalLines.push(`${diaLabel}: Turno ED ${cleanedIssues}`);
        } else if (isEN) {
          finalLines.push(`${diaLabel}: Turno EN ${cleanedIssues}`);
        }
      });
      let message = `*🚨INFORMAÇÃO🚨*\n\n`;
      message += `*Turnos DECIR por Preencher - ${nameMonth} ${selectedYear}*\n\n`;
      message += `${finalLines.join('\n')}\n\n`;
      const dispMails = await opsGetDecirDispMails();
      if (dispMails.to) message += `As disponibilidades devem ser remetidas para ${dispMails.to}${dispMails.cc ? ` com conhecimento de ${dispMails.cc}` : ""}.\n`;
      message += `Obrigado pela vossa colaboração!`;
      navigator.clipboard.writeText(message).then(() => {
        closePopup('popup-analyze-decir');
        showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.");
      }).catch(() => {
        showPopup('popup-danger', 'Erro ao copiar.');
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
          showPopup('popup-success', "Escala gravada com sucesso!");
        } catch (err) {
          console.error(err); 
          showPopup('popup-danger', "Erro ao salvar a tabela: " + err.message);
        } finally {
          table.querySelectorAll("tr.fixed-row td[data-original-val]").forEach(td => {
            td.textContent = td.getAttribute('data-original-val');
            td.removeAttribute('data-original-val');
          });
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
              headers: cb360PushHeaders(),
              body: JSON.stringify({recipient_nint: 'geral', tipo: 'aviso', pagina: 'ScalesView', sender_name: 'CB360 Online', message_text: msgNotif})
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
          rowData.days[d] = val;
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
        if (!response.ok) throw new Error(`Erro ao gerar o PDF da escala (${response.status}).`);
        const url = URL.createObjectURL(await response.blob());
        const a = document.createElement("a"); a.href=url; a.download=`${fileName}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Erro PDF:", error);
        throw error;
      }
    }
    /* =======================================
    EVENTS
    ======================================= */
    document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (btn && btn.getAttribute('data-page') === 'page-event-disp') {
        await loadEvents();
      }
    });
    /* ============ CRIAR EVENTO: estilo do formulário ============ */
    (function evcInjectCss() {
      if (document.getElementById('evc-css')) return;
      const css = `
      .evc {display: grid; grid-template-columns: 1fr 320px; gap: 14px; align-items: start;}
      .evc-col {display: flex; flex-direction: column; gap: 14px; min-width: 0;}
      .evc-card {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 14px 16px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
      .evc-title {margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #2c3e50; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: .4px;}
      .evc-title > span {width: 22px; height: 22px; border-radius: 50%; background: #c62828; color: #fff; font-size: 12px; display: inline-flex; align-items: center; justify-content: center;}
      .evc-title small {font-size: 11px; color: #1565c0; font-weight: 700; text-transform: none; letter-spacing: 0; margin-left: auto;}
      .evc-grid {display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 12px;}
      .evc-span2 {grid-column: span 2;} .evc-span3 {grid-column: span 3;}
      .evc-f {display: flex; flex-direction: column; gap: 5px; font-size: 11.5px; font-weight: 600; color: #6c757d;}
      .evc-f input, .evc-f select, .evc-quick input, .evc-shift input {height: 36px; border: 1px solid #dee2e6; border-radius: 8px; padding: 0 10px; font-size: 13px; color: #2c3e50; background: #fff; box-sizing: border-box; width: 100%; font-family: inherit;}
      .evc-f input:focus, .evc-f select:focus, .evc-quick input:focus, .evc-shift input:focus {outline: none; border-color: #c62828; box-shadow: 0 0 0 3px rgba(198,40,40,.12);}
      .evc-quick {display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 12px; background: #f8f9fa; border: 1px dashed #dee2e6; border-radius: 10px; font-size: 12px; color: #6c757d; margin-bottom: 12px;}
      .evc-quick input {width: 130px; height: 32px;}
      .evc-btn-soft {height: 32px; border: 0; border-radius: 8px; padding: 0 14px; background: #2c3e50; color: #fff; font-weight: 700; font-size: 12px; cursor: pointer;}
      .evc-btn-soft:hover {background: #1f2d3a;}
      .evc-shifts {display: flex; flex-direction: column; gap: 8px; max-height: 340px; overflow-y: auto;}
      .evc-shift {display: grid; grid-template-columns: 28px 1.4fr 1fr 1fr 32px; gap: 8px; align-items: center; padding: 8px 10px; border: 1px solid #e9ecef; border-radius: 10px; background: #fff;}
      .evc-shift .evc-n {width: 24px; height: 24px; border-radius: 50%; background: #eef2f7; color: #45556a; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;}
      .evc-shift input {height: 32px;}
      .evc-shift .evc-del {width: 30px; height: 30px; border: 1px solid #f1c0c0; background: #fff5f5; color: #c62828; border-radius: 8px; cursor: pointer; font-size: 12px;}
      .evc-shift .evc-del:hover {background: #ffe9e9;}
      .evc-empty {padding: 16px; text-align: center; font-size: 12.5px; color: #9aa3ab; border: 1px dashed #e1e5e9; border-radius: 10px;}
      .evc-add {margin-top: 10px; width: 100%; height: 38px; border: 1.5px dashed #c62828; background: #fff; color: #c62828; border-radius: 10px; font-weight: 700; font-size: 12.5px; cursor: pointer;}
      .evc-add:hover {background: #fdf1f1;}
      .evc-side {position: sticky; top: 10px;}
      .evc-summary {border-top: 4px solid #c62828;}
      .evc-sum-name {font-size: 16px; font-weight: 700; color: #2c3e50; word-break: break-word;}
      .evc-sum-type {display: inline-block; margin: 6px 0 10px; font-size: 10.5px; font-weight: 700; letter-spacing: .4px; padding: 3px 9px; border-radius: 999px; background: #eef2f7; color: #45556a;}
      .evc-sum-row {display: flex; justify-content: space-between; gap: 10px; font-size: 12px; color: #6c757d; padding: 6px 0; border-top: 1px solid #f1f3f5;}
      .evc-sum-row b {color: #2c3e50; text-align: right;}
      .evc-sum-kpis {display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 10px 0;}
      .evc-sum-kpis div {background: #f8f9fa; border-radius: 8px; padding: 8px 4px; text-align: center;}
      .evc-sum-kpis b {display: block; font-size: 18px; color: #2c3e50;}
      .evc-sum-kpis small {font-size: 10px; color: #6c757d; text-transform: uppercase; letter-spacing: .3px;}
      .evc-sum-cost {display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #e8f5e9; border-radius: 8px; font-size: 12px; color: #2e7d32; font-weight: 600; margin-bottom: -8px;}
      .evc-sum-cost b {font-size: 17px;}
      .evc-hint {margin: 10px 0 0; font-size: 11px; color: #8a949e; line-height: 1.4;}
      @media (max-width: 1100px) {.evc {grid-template-columns: 1fr;} .evc-side {position: static;}}
      `;
      const st = document.createElement('style');
      st.id = 'evc-css';
      st.textContent = css;
      document.head.appendChild(st);
    })();
    /* ============ ADD SHIFT ============= */
    function addShift(date = '', start = '', end = '') {
      const container = document.getElementById('shiftsList');
      container.querySelector('.evc-empty')?.remove();
      const div = document.createElement('div');
      div.className = 'events-shift-item evc-shift';
      div.innerHTML = `
        <span class="evc-n"></span>
        <input type="date" class="shift-date" value="${date}" title="Data" onchange="evcUpdateSummary()">
        <input type="time" class="shift-start-time" value="${start}" title="Início" onchange="evcUpdateSummary()">
        <input type="time" class="shift-end-time" value="${end}" title="Fim" onchange="evcUpdateSummary()">
        <button type="button" class="evc-del" onclick="removeShift(this)" title="Remover turno">✕</button>
      `;
      container.appendChild(div);
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      updateCounter();
    }
    function updateCounter() {
      const items = document.querySelectorAll('.events-shift-item');
      items.forEach((it, i) => { const n = it.querySelector('.evc-n'); if (n) n.textContent = i + 1; });
      const cnt = document.getElementById('turno-count');
      if (cnt) cnt.innerText = `(${items.length} Inseridos)`;
      const list = document.getElementById('shiftsList');
      if (list && !items.length && !list.querySelector('.evc-empty')) list.innerHTML = '<div class="evc-empty">Ainda não há turnos. Gere um por dia ou adicione à mão.</div>';
      evcUpdateSummary();
    }
    /* =========== REMOVE SHIFT =========== */
    function removeShift(btn) {
      btn.closest('.events-shift-item').remove();
      updateCounter();
    }
    /* ===== GERAR UM TURNO POR DIA (do início ao fim do evento) ===== */
    function evcGenerateShifts() {
      const s = document.getElementById('eventStartDate').value, e = document.getElementById('eventEndDate').value || s;
      const hs = document.getElementById('evcQuickStart').value, he = document.getElementById('evcQuickEnd').value;
      if (!s) return showPopup('popup-danger', 'Indique primeiro a data de início do evento.');
      if (!hs || !he) return showPopup('popup-danger', 'Indique a hora de início e de fim dos turnos.');
      if (e < s) return showPopup('popup-danger', 'A data de fim é anterior à data de início.');
      const d = new Date(s + 'T12:00:00'), end = new Date(e + 'T12:00:00');
      let n = 0;
      while (d <= end && n < 62) {
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        addShift(iso, hs, he);
        d.setDate(d.getDate() + 1); n++;
      }
    }
    /* ============ RESUMO (lado direito) ============ */
    function evcUpdateSummary() {
      const $ = id => document.getElementById(id);
      if (!$('evcSumName')) return;
      const fmt = v => v ? v.split('-').reverse().join('/') : '';
      const name = $('eventName').value.trim(), type = $('eventType').value, loc = $('eventLocation').value.trim();
      const s = $('eventStartDate').value, e = $('eventEndDate').value;
      const ops = parseInt($('operational').value) || 0, vh = parseFloat($('valueHour').value) || 0;
      let shifts = 0, hours = 0;
      document.querySelectorAll('.events-shift-item').forEach(it => {
        const a = it.querySelector('.shift-start-time').value, b = it.querySelector('.shift-end-time').value;
        if (!it.querySelector('.shift-date').value || !a || !b) return;
        shifts++;
        const [ah, am] = a.split(':').map(Number), [bh, bm] = b.split(':').map(Number);
        let m = (bh * 60 + bm) - (ah * 60 + am);
        if (m <= 0) m += 24 * 60;                 /* turno que passa a meia-noite */
        hours += m / 60;
      });
      $('evcSumName').textContent = name || 'Evento sem nome';
      $('evcSumType').textContent = type || '—';
      $('evcSumLoc').textContent = loc || '—';
      $('evcSumDates').textContent = s ? (e && e !== s ? `${fmt(s)} → ${fmt(e)}` : fmt(s)) : '—';
      $('evcSumShifts').textContent = shifts;
      $('evcSumSlots').textContent = shifts * ops;
      $('evcSumHours').textContent = (Math.round(hours * 10) / 10).toString().replace('.', ',') + 'h';
      $('evcSumCost').textContent = (hours * ops * vh).toLocaleString('pt-PT', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' €';
    }
    /* ============ CLEAR FORM ============ */
    function clearEventsForm() {
      document.querySelectorAll('#page-events .evc-f input').forEach(i => i.value = '');
      document.getElementById('eventType').value = '';
      document.getElementById('shiftsList').innerHTML = '';
      updateCounter();
    }
    document.addEventListener('DOMContentLoaded', () => { if (document.getElementById('shiftsList')) updateCounter(); });
    /* =========== SUBMIT EVENT =========== */
    async function submitEvent() {
      const eventName = document.getElementById('eventName').value.trim();
      const eventType = document.getElementById('eventType').value;
      const location = document.getElementById('eventLocation').value.trim();
      const startDate = document.getElementById('eventStartDate').value;
      const endDate = document.getElementById('eventEndDate').value;
      const operational = parseInt(document.getElementById('operational').value);
      const valueHour = parseFloat(document.getElementById('valueHour').value);
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
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
          body : JSON.stringify({event: eventName, event_type: eventType, corp_oper_nr, date_start: startDate, date_end: endDate, value: valueHour, location, is_ended: false})
        });       
        if (!respEvent.ok) throw new Error("Erro ao criar cabeçalho do evento");        

        const shiftResponses = await Promise.all(shifts.map(shift => fetch(`${SUPABASE_URL}/rest/v1/event_shifts`, {
          method : 'POST',
          headers,
          body : JSON.stringify({event: eventName, event_shift_date: shift.event_shift_date, event_shift: shift.event_shift, nec_oper: shift.nec_oper, act_oper: 0, corp_oper_nr})
        })));
        await opsCheckResponses(shiftResponses, "Evento criado, mas falharam os turnos");
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
              fetch('https://cb-360-app.vercel.app/api/sendPush', {
                method : 'POST',
                headers: cb360PushHeaders(),
                body : JSON.stringify({recipient_nint: 'geral', tipo: 'aviso', pagina: 'Events', sender_name: 'CB360 Online', message_text: `📢 Novo evento: "${eventName}". Inscrições abertas!`})
              }).catch(e => console.error('Erro Push:', e));   /* não espera pelo envio */
            } catch (errPush) {
              console.error('Erro ao enviar push notifications:', errPush);
            }
          }
        } catch (errNotif) {
          console.error("Erro ao notificar elementos:", errNotif);
        }
        showPopup('popup-success', "Evento criado e operacionais notificados com sucesso!");
        clearEventsForm();
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
    function badgeEventsStyle(cssClass) {
      const map = {'bg-aprovado' : 'background:#2e7d32;', 'bg-rejeitado': 'background:#e53935;', 'bg-pendente' : 'background:#7f0000;', 'bg-default' : 'background:#6c757d;'};
      return (map[cssClass] || map['bg-default']) +
        'padding:3px 8px;border-radius:10px;color:#fff;font-weight:bold;font-size:10px;display:inline-block;min-width:80px;text-align:center;';
    }
    /* ========== LOADING EVENT ===========
       painel novo (createEventsBoard, mais abaixo neste ficheiro) */
    async function loadEvents() {
      window.evBoardPanel = window.evBoardPanel || createEventsBoard({root: 'evBoard'});
      await window.evBoardPanel.load();
    }
    /* =========== DELETE EVENT =========== */
    async function deleteFullEvent(eventName) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const confirmation = confirm(`Deseja eliminar o evento "${eventName}"?`);
      if (!confirmation) return;

      try {
        const headers = getSupabaseHeaders();
        const filter = `event=eq.${encodeURIComponent(eventName)}&corp_oper_nr=eq.${corp_oper_nr}`;        
        const delResponses = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/event_list?${filter}`, {method: 'DELETE', headers}),
          fetch(`${SUPABASE_URL}/rest/v1/event_shifts?${filter}`, {method: 'DELETE', headers}),
          fetch(`${SUPABASE_URL}/rest/v1/event_disp?${filter}`, {method: 'DELETE', headers})
        ]);
        await opsCheckResponses(delResponses, "Erro ao eliminar evento");
        showPopup('popup-success', "Eliminado com sucesso.");
        loadEvents();
      } catch (e) {
        console.error(e);
        showPopup('popup-danger', e.message || "Erro ao eliminar evento.");
      }
    }
    /* =====================================================================
       CONSULTA DE DISPONIBILIDADES (layout novo)
       Eventos em cartões à esquerda; à direita o evento escolhido com os turnos,
       as vagas (aprovados / necessários) e quem se disponibilizou, com ✓ / ✕.
       Usa o estilo base do painel de férias (classes vb-*, que estão no mainconfig).
       ===================================================================== */
    (function evbInjectCss() {
      if (document.getElementById('evb-css')) return;
      const css = `
      .evb-layout {display: grid; grid-template-columns: 340px 1fr; gap: 14px; align-items: start;}
      .evb-list {display: flex; flex-direction: column; gap: 9px; max-height: calc(100vh - 360px); overflow-y: auto; overflow-x: hidden; padding: 9px 10px 4px 2px;}
      .evb-ev {position: relative; background: #fff; border: 1px solid #e9ecef; border-radius: 10px; padding: 8px 12px 7px; cursor: pointer; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; border-left: 4px solid var(--c, #adb5bd);}
      .evb-ev:hover {transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.08);}
      .evb-ev.sel {border-color: #c62828; border-left-color: #c62828; box-shadow: 0 0 0 2px rgba(198,40,40,.18);}
      .evb-ev.ended {opacity: .6;}
      .evb-ev-top {display: flex; align-items: center; gap: 8px;}
      .evb-ev-name {font-weight: 700; font-size: 13px; color: #2c3e50; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
      .evb-type {font-size: 10px; font-weight: 700; letter-spacing: .4px; padding: 2px 8px; border-radius: 999px; background: #eef2f7; color: #45556a; white-space: nowrap;}
      .evb-ev-meta {font-size: 11.5px; color: #6c757d; margin-top: 3px; display: flex; flex-wrap: wrap; gap: 2px 10px;}
      .evb-bar {height: 5px; border-radius: 3px; background: #f1f3f5; overflow: hidden; margin-top: 6px;}
      .evb-bar span {display: block; height: 100%; background: linear-gradient(90deg, #66bb6a, #2e7d32); border-radius: 3px;}
      .evb-bar.full span {background: linear-gradient(90deg, #42a5f5, #1565c0);}
      .evb-ev-foot {display: flex; justify-content: space-between; font-size: 11px; color: #6c757d; margin-top: 3px;}
      .evb-pend {position: absolute; top: -7px; right: -7px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; background: #f39c12; color: #fff; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(243,156,18,.45);}
      .evb-detail {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.05); height:550px;}
      .evb-dhead {padding: 14px 16px; border-bottom: 1px solid #e9ecef; background: #fafbfc; display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap;}
      .evb-dhead h4 {margin: 0; font-size: 16px; color: #2c3e50;}
      .evb-dinfo {display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12px; color: #6c757d; margin-top: 5px;}
      .evb-dinfo b {color: #2c3e50;}
      .evb-dact {margin-left: auto; display: flex; gap: 8px; align-items: center;}
      .evb-del {border: 1px solid #f1c0c0; background: #fff5f5; color: #c62828; border-radius: 8px; height: 32px; padding: 0 12px; font-size: 12px; font-weight: 700; cursor: pointer;}
      .evb-del:hover {background: #ffe9e9;}
      .evb-days {padding: 10px 16px 14px; display: flex; flex-direction: column; gap: 12px; max-height: calc(100vh - 480px); overflow-y: auto;}
      .evb-day-title {font-size: 12px; font-weight: 700; color: #8b0000; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;}
      .evb-day-title::after {content: ""; flex: 1; height: 1px; background: #f1f3f5;}
      .evb-shifts {display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 10px; align-items: start;}
      .evb-shift {border: 1px solid #e9ecef; border-radius: 10px; overflow: hidden; background: #fff;}
      .evb-shift-head {display: flex; align-items: center; gap: 10px; padding: 6px 12px; background: #f8f9fa; border-bottom: 1px solid #f1f3f5;}
      .evb-time {font-weight: 700; font-size: 13px; color: #2c3e50;}
      .evb-vagas {margin-left: auto; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: #e8f5e9; color: #2e7d32; white-space: nowrap;}
      .evb-vagas.low {background: #fff3e0; color: #e65100;}
      .evb-vagas.full {background: #e3f2fd; color: #1565c0;}
      .evb-shift .evb-bar {margin: 0; border-radius: 0; height: 4px;}
      .evb-people {padding: 2px 0;}
      .evb-person {display: flex; align-items: center; gap: 8px; padding: 4px 12px;}
      .evb-person + .evb-person {border-top: 1px solid #f6f7f8;}
      .evb-days, .evb-list {scrollbar-width: thin; scrollbar-color: #cfd4da transparent;}
      .evb-days::-webkit-scrollbar, .evb-list::-webkit-scrollbar {width: 5px;}
      .evb-days::-webkit-scrollbar-track, .evb-list::-webkit-scrollbar-track {background: transparent;}
      .evb-days::-webkit-scrollbar-thumb, .evb-list::-webkit-scrollbar-thumb {background: #cfd4da; border-radius: 10px;}
      .evb-days::-webkit-scrollbar-thumb:hover, .evb-list::-webkit-scrollbar-thumb:hover {background: #adb5bd;}
      .evb-avatar {width: 26px; height: 26px; border-radius: 50%; background: #eef2f7; color: #45556a; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
      .evb-pname {flex: 1; min-width: 0;}
      .evb-pname b {display: block; font-size: 12.5px; color: #2c3e50; line-height: 1.2;}
      .evb-pname small {display: block; font-size: 10.5px; line-height: 1.2; color: #8a949e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
      .evb-person.dim {opacity: .5;}
      .evb-person .vb-state {font-size: 10.5px; padding: 2px 8px; flex-shrink: 0;}
      .evb-person .vb-btn {flex-shrink: 0;}
      .evb-person .vb-btn {width: 25px; height: 25px; font-size: 12.5px;}
      .evb-person .vb-btn + .vb-btn {margin-left: 4px;}
      .evb-none {padding: 10px 12px; font-size: 12px; color: #9aa3ab; font-style: italic;}
      .evb-empty {padding: 40px 20px; text-align: center; color: #8a949e;}
      @media (max-width: 1100px) {.evb-layout {grid-template-columns: 1fr;} .evb-list {max-height: none;}}
      `;
      const st = document.createElement('style');
      st.id = 'evb-css';
      st.textContent = css;
      document.head.appendChild(st);
    })();

    function createEventsBoard(cfg) {
      /* cfg: {root} */
      const S = {events: [], shifts: [], disps: [], elems: {}, sel: null, filter: 'next', q: '', loaded: false};
      const ST = {'Em Aprovação': 'p', 'Aprovado': 'a', 'Não Aprovado': 'r'};
      const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const corp = () => sessionStorage.getItem('currentCorpOperNr');
      const root = () => document.getElementById(cfg.root);
      const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
      const fmt = d => { if (!d) return '—'; const [y, m, dd] = String(d).slice(0, 10).split('-'); return `${dd}/${m}/${y}`; };
      const WD = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
      const fmtDay = d => { const [y, m, dd] = String(d).slice(0, 10).split('-').map(Number); return `${WD[new Date(y, m - 1, dd).getDay()]}, ${String(dd).padStart(2, '0')}/${String(m).padStart(2, '0')}`; };
      const initials = n => String(n || '?').split(/\s+/).filter(Boolean).map(w => w[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join('').toUpperCase();
      const typeColor = t => ({'PREVENÇÃO': '#c62828', 'TRANSPORTE': '#1565c0', 'OUTRO': '#6d4c41'}[String(t || '').toUpperCase()] || '#607d8b');
      function phase(ev) {
        const t = today(), s = String(ev.date_start || '').slice(0, 10), e = String(ev.date_end || ev.date_start || '').slice(0, 10);
        if (ev.is_ended === true || (e && e < t)) return 'ended';
        if (s && s <= t) return 'now';
        return 'next';
      }
      const shiftsOf = name => S.shifts.filter(s => s.event === name);
      const dispsOf = name => S.disps.filter(d => d.event === name);
      const shiftKey = (date, time) => `${String(date).slice(0, 10)}|${time}`;
      function eventStats(name) {
        const sh = shiftsOf(name);
        const nec = sh.reduce((t, s) => t + (parseInt(s.nec_oper) || 0), 0);
        const act = sh.reduce((t, s) => t + Math.min(parseInt(s.act_oper) || 0, parseInt(s.nec_oper) || 0), 0);
        const pend = dispsOf(name).filter(d => ST[d.shift_state] === 'p').length;
        return {nec, act, pend, shifts: sh.length};
      }

      async function load() {
        const el = root(); if (!el) return;
        if (!S.loaded) el.innerHTML = '<div class="vb-loading">A carregar eventos...</div>';
        const c = corp(), h = {headers: getSupabaseHeaders()};
        try {
          const [rE, rS, rD] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/event_list?corp_oper_nr=eq.${c}&order=date_start.desc`, h),
            fetch(`${SUPABASE_URL}/rest/v1/event_shifts?corp_oper_nr=eq.${c}&order=event_shift_date.asc,event_shift.asc`, h),
            fetch(`${SUPABASE_URL}/rest/v1/event_disp?corp_oper_nr=eq.${c}&order=event_shift_date.asc,event_shift.asc`, h)
          ]);
          if (!rE.ok || !rS.ok || !rD.ok) throw new Error('Erro ao ler eventos');
          [S.events, S.shifts, S.disps] = await Promise.all([rE.json(), rS.json(), rD.json()]);
          const missing = [...new Set(S.disps.map(d => d.n_int))].filter(n => !S.elems[n]);
          if (missing.length) {
            const rEl = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,full_name,abv_name,patent&corp_oper_nr=eq.${c}&n_int=in.(${missing.join(',')})`, h);
            if (rEl.ok) (await rEl.json()).forEach(e => { S.elems[e.n_int] = e; S.elems[String(parseInt(e.n_int, 10))] = e; });
          }
          if (!S.sel || !S.events.some(e => e.event === S.sel)) {
            const vis = visibleEvents();
            const first = vis.find(e => eventStats(e.event).pend) || vis[0] || S.events[0];
            S.sel = first ? first.event : null;
          }
          S.loaded = true;
          render();
        } catch (e) {
          console.error('Painel de eventos:', e);
          el.innerHTML = '<div class="vb-empty" style="color:#c62828;">Erro ao carregar os eventos.</div>';
        }
      }
      function visibleEvents() {
        const q = S.q.trim().toLowerCase();
        let list = S.events.filter(e => (S.filter === 'all' || phase(e) === S.filter || (S.filter === 'next' && phase(e) === 'now')) &&
          (!q || String(e.event).toLowerCase().includes(q) || String(e.location || '').toLowerCase().includes(q)));
        if (S.filter === 'next') list = list.slice().sort((a, b) => String(a.date_start).localeCompare(String(b.date_start)));
        return list;
      }
      function render() {
        const el = root(); if (!el) return;
        const active = S.events.filter(e => phase(e) !== 'ended').map(e => e.event);
        const pend = S.disps.filter(d => active.includes(d.event) && ST[d.shift_state] === 'p').length;
        const open = S.shifts.filter(s => active.includes(s.event) && (parseInt(s.act_oper) || 0) < (parseInt(s.nec_oper) || 0)).length;
        const appr = S.disps.filter(d => active.includes(d.event) && ST[d.shift_state] === 'a').length;
        const kpi = (c, ico, n, label) => `<div class="vb-kpi" style="--c:${c}"><div class="vb-kpi-ico">${ico}</div><div><b>${n}</b><small>${label}</small></div></div>`;
        const chip = (k, label) => `<button type="button" class="vb-chip ${S.filter === k ? 'on' : ''}" data-f="${k}">${label}</button>`;
        const list = visibleEvents();
        el.innerHTML = `
          <div class="vb">
            <div class="vb-toolbar">
              <div class="vb-chips">${chip('next', 'Próximos e a decorrer')}${chip('ended', 'Terminados')}${chip('all', 'Todos')}</div>
              <input type="text" class="vb-search" placeholder="Procurar evento ou local…" value="${esc(S.q)}">
            </div>
            <div class="vb-kpis">
              ${kpi('#c62828', '📣', active.length, 'Eventos ativos')}
              ${kpi('#ef6c00', '⏳', pend, 'Disponibilidades por tratar')}
              ${kpi('#1565c0', '🧩', open, 'Turnos com vagas')}
              ${kpi('#2e7d32', '✓', appr, 'Operacionais aprovados')}
            </div>
            <div class="evb-layout">
              <div class="evb-list">${list.length ? list.map(evCard).join('') : '<div class="evb-empty">Sem eventos para mostrar.</div>'}</div>
              <div class="evb-detail">${detail()}</div>
            </div>
          </div>`;
        el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { S.filter = b.dataset.f; const v = visibleEvents(); if (!v.some(e => e.event === S.sel)) S.sel = v[0] ? v[0].event : S.sel; render(); });
        el.querySelectorAll('.evb-ev').forEach(b => b.onclick = () => { S.sel = b.dataset.ev; render(); });
        const search = el.querySelector('.vb-search');
        search.oninput = () => { S.q = search.value; const pos = search.selectionStart; render(); const s2 = root().querySelector('.vb-search'); s2.focus(); s2.setSelectionRange(pos, pos); };
        el.querySelectorAll('.vb-btn[data-id]').forEach(b => b.onclick = () => setState(Number(b.dataset.id), b.dataset.s, b));
        const del = el.querySelector('.evb-del');
        if (del) del.onclick = () => typeof deleteFullEvent === 'function' && deleteFullEvent(S.sel);
      }
      function evCard(ev) {
        const st = eventStats(ev.event), ph = phase(ev), pct = st.nec ? Math.round(st.act / st.nec * 100) : 0;
        const dates = String(ev.date_start).slice(0, 10) === String(ev.date_end).slice(0, 10) || !ev.date_end ? fmt(ev.date_start) : `${fmt(ev.date_start)} → ${fmt(ev.date_end)}`;
        return `<div class="evb-ev ${S.sel === ev.event ? 'sel' : ''} ${ph === 'ended' ? 'ended' : ''}" data-ev="${esc(ev.event)}" style="--c:${typeColor(ev.event_type)}">
          ${st.pend ? `<span class="evb-pend" title="${st.pend} por tratar">${st.pend}</span>` : ''}
          <div class="evb-ev-top"><span class="evb-ev-name" title="${esc(ev.event)}">${esc(ev.event)}</span><span class="evb-type">${esc(ev.event_type || '—')}</span></div>
          <div class="evb-ev-meta"><span>📅 ${dates}</span>${ev.location ? `<span>📍 ${esc(ev.location)}</span>` : ''}${ph === 'now' ? '<span style="color:#2e7d32;font-weight:700;">● A decorrer</span>' : ''}</div>
          <div class="evb-bar ${st.nec && st.act >= st.nec ? 'full' : ''}"><span style="width:${pct}%"></span></div>
          <div class="evb-ev-foot"><span>${st.shifts} turno${st.shifts === 1 ? '' : 's'}</span><span>${st.act}/${st.nec} vagas preenchidas</span></div>
        </div>`;
      }
      function detail() {
        const ev = S.events.find(e => e.event === S.sel);
        if (!ev) return '<div class="evb-empty">Escolha um evento.</div>';
        const st = eventStats(ev.event);
        const sh = shiftsOf(ev.event), ds = dispsOf(ev.event);
        const byDay = {};
        sh.forEach(s => { const d = String(s.event_shift_date).slice(0, 10); (byDay[d] = byDay[d] || []).push(s); });
        ds.forEach(d => { const k = String(d.event_shift_date).slice(0, 10); if (!byDay[k]) byDay[k] = []; if (!byDay[k].some(s => s.event_shift === d.event_shift)) byDay[k].push({event_shift_date: k, event_shift: d.event_shift, nec_oper: 0, act_oper: 0, _orphan: true}); });
        const days = Object.keys(byDay).sort();
        const head = `<div class="evb-dhead">
            <div>
              <h4>${esc(ev.event)}</h4>
              <div class="evb-dinfo">
                <span>Tipo: <b>${esc(ev.event_type || '—')}</b></span>
                <span>Local: <b>${esc(ev.location || '—')}</b></span>
                <span>Datas: <b>${fmt(ev.date_start)}${ev.date_end && String(ev.date_end).slice(0, 10) !== String(ev.date_start).slice(0, 10) ? ' → ' + fmt(ev.date_end) : ''}</b></span>
                ${ev.value != null ? `<span>Valor/hora: <b>${Number(ev.value).toFixed(2)} €</b></span>` : ''}
                <span>Vagas: <b>${st.act}/${st.nec}</b></span>
              </div>
            </div>
            <div class="evb-dact"><button type="button" class="evb-del" title="Eliminar o evento, os turnos e as disponibilidades">🗑️ Eliminar evento</button></div>
          </div>`;
        if (!days.length) return head + '<div class="evb-empty">Este evento ainda não tem turnos.</div>';
        return head + `<div class="evb-days">${days.map(d => `
            <div>
              <div class="evb-day-title">${fmtDay(d)}</div>
              <div class="evb-shifts">${byDay[d].sort((a, b) => String(a.event_shift).localeCompare(String(b.event_shift))).map(s => shiftCard(ev.event, d, s)).join('')}</div>
            </div>`).join('')}</div>`;
      }
      function shiftCard(name, day, s) {
        const act = parseInt(s.act_oper) || 0, nec = parseInt(s.nec_oper) || 0, full = nec > 0 && act >= nec;
        const people = S.disps.filter(d => d.event === name && String(d.event_shift_date).slice(0, 10) === day && d.event_shift === s.event_shift)
          .sort((a, b) => ['a', 'p', 'r'].indexOf(ST[a.shift_state] || 'p') - ['a', 'p', 'r'].indexOf(ST[b.shift_state] || 'p'));
        const vcls = full ? 'full' : (nec && act / nec < .5 ? 'low' : '');
        return `<div class="evb-shift">
          <div class="evb-shift-head"><span class="evb-time">🕒 ${esc(s.event_shift)}</span><span class="evb-vagas ${vcls}">${full ? 'Completo' : 'Vagas'} ${act}/${nec}</span></div>
          <div class="evb-bar ${full ? 'full' : ''}"><span style="width:${nec ? Math.min(100, act / nec * 100) : 0}%"></span></div>
          <div class="evb-people">${people.length ? people.map(d => {
            const k = ST[d.shift_state] || 'p', e = S.elems[d.n_int] || S.elems[String(parseInt(d.n_int, 10))] || {};
            const blocked = full && k !== 'a';
            const label = blocked ? 'Turno cheio' : (k === 'p' ? 'Em aprovação' : k === 'a' ? 'Aprovado' : 'Não aprovado');
            return `<div class="evb-person ${blocked ? 'dim' : ''}">
              <span class="evb-avatar">${esc(initials(e.full_name || d.n_int))}</span>
              <span class="evb-pname"><b>${esc(e.full_name || 'Nº ' + d.n_int)}</b><small>Nº ${esc(d.n_int)}${e.patent ? ' · ' + esc(e.patent) : ''}</small></span>
              <span class="vb-state ${blocked ? '' : k}" ${blocked ? 'style="background:#f1f3f5;color:#6c757d;"' : ''}>${label}</span>
              <button type="button" class="vb-btn ok" data-id="${d.id}" data-s="Aprovado" title="Aprovar" ${k === 'a' || blocked ? 'disabled' : ''}>✓</button>
              <button type="button" class="vb-btn no" data-id="${d.id}" data-s="Não Aprovado" title="Não aprovar" ${k === 'r' ? 'disabled' : ''}>✕</button>
            </div>`;
          }).join('') : '<div class="evb-none">Ninguém se disponibilizou ainda.</div>'}</div>
        </div>`;
      }
      /* mesma lógica da versão anterior: vagas, estado, notificação, push e contagem de aprovados no turno */
      async function setState(id, newState, btn) {
        const d = S.disps.find(x => Number(x.id) === id);
        if (!d || d.shift_state === newState) return;
        const c = corp(), oldState = d.shift_state;
        const shiftUrl = `${SUPABASE_URL}/rest/v1/event_shifts?event=eq.${encodeURIComponent(d.event)}&event_shift_date=eq.${String(d.event_shift_date).slice(0, 10)}&event_shift=eq.${encodeURIComponent(d.event_shift)}&corp_oper_nr=eq.${c}`;
        root().querySelectorAll(`.vb-btn[data-id="${id}"]`).forEach(b => b.classList.add('busy'));
        try {
          if (newState === 'Aprovado') {
            const r = await fetch(shiftUrl, {headers: getSupabaseHeaders()});
            const s = await r.json();
            if (s.length && (parseInt(s[0].act_oper) || 0) >= (parseInt(s[0].nec_oper) || 0)) {
              showPopup('popup-danger', 'Atenção: este turno já atingiu o limite de vagas!');
              return;
            }
          }
          const rUp = await fetch(`${SUPABASE_URL}/rest/v1/event_disp?id=eq.${id}`, {method: 'PATCH', headers: getSupabaseHeaders(), body: JSON.stringify({shift_state: newState})});
          if (!rUp.ok) throw new Error('Erro ao atualizar o estado da disponibilidade');
          const inc = newState === 'Aprovado' && oldState !== 'Aprovado' ? 1 : (newState !== 'Aprovado' && oldState === 'Aprovado' ? -1 : 0);
          if (inc) {
            const rGet = await fetch(shiftUrl, {headers: getSupabaseHeaders()});
            const cur = await rGet.json();
            if (cur.length) {
              await fetch(`${SUPABASE_URL}/rest/v1/event_shifts?id=eq.${cur[0].id}`, {method: 'PATCH', headers: getSupabaseHeaders(), body: JSON.stringify({act_oper: Math.max(0, (parseInt(cur[0].act_oper) || 0) + inc)})});
            }
          }
          const msg = newState === 'Aprovado'
            ? `✅ A tua disponibilidade para o evento "${d.event}" (${fmt(d.event_shift_date)}) foi APROVADA.`
            : `❌ A tua disponibilidade para o evento "${d.event}" (${fmt(d.event_shift_date)}) não foi aprovada.`;
          fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {method: 'POST', headers: getSupabaseHeaders(),
            body: JSON.stringify({n_int: d.n_int, corp_oper_nr: c, title: 'Eventos', message: msg, is_read: false, created_at: new Date().toISOString()})}).catch(e => console.error('Erro notificação:', e));
          try {
            fetch('https://cb-360-app.vercel.app/api/sendPush', {method: 'POST', headers: cb360PushHeaders(),
              body: JSON.stringify({recipient_nint: d.n_int, tipo: 'aviso', pagina: 'Events', sender_name: 'CB360 Online', message_text: msg})}).catch(e => console.error('Erro Push:', e));
          } catch (e) { console.error('Erro ao enviar push:', e); }
        } catch (e) {
          console.error('Erro ao mudar o estado:', e);
          showPopup('popup-danger', 'Ocorreu um erro ao processar o estado ou a notificação.');
        } finally {
          await load();
        }
      }
      return {load, select(name) { S.sel = name; }};
    }
    /* =======================================
    VACATIONS
    ======================================= */
    /* abre o painel novo (createVacBoard, no mainconfig) ao entrar na página */
    document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (btn && btn.getAttribute('data-page') === 'page-vacations-request') {
        window.vacBoardGOPanel = window.vacBoardGOPanel || createVacBoard({
          root: 'vacBoardGO',
          type: 'Voluntariado',
          badgeId: id => `badge-${id}`,
          setState: (id, state, year, month) => updateVacatState(id, state, year, month)
        });
        await window.vacBoardGOPanel.load();
      }
    });
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
            fetch('https://cb-360-app.vercel.app/api/sendPush', {
              method: 'POST',
              headers: cb360PushHeaders(),
              body: JSON.stringify({recipient_nint: Number(request.n_int), tipo: 'aviso', pagina: 'SolVacat', sender_name: "Gestão de Férias", message_text: msgNotif})
            }).catch(e => console.error('Erro Push:', e));   /* não espera pelo envio */
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
        } else {
          throw new Error("Falha ao atualizar o estado no servidor.");
        }
      } catch (err) {
        console.error("Erro no fluxo updateVacatState:", err);
        showPopup('popup-danger', "Erro ao processar alteração: " + (err.message || err));
      }
    }
    /* ========== SAVE VACATIONS ========== */
    async function recordDaysOnVacation(request) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const respElem = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${request.n_int}&corp_oper_nr=eq.${corp_oper_nr}`, {
        headers: getSupabaseHeaders()
      });
      if (!respElem.ok) throw new Error("Erro ao ler o elemento.");
      const [elem] = await respElem.json();
      if (!elem) throw new Error("Elemento não encontrado.");
      const listaDias = request.day.split(',').map(d => d.trim());    
      const promises = listaDias.map(dia => fetch(`${SUPABASE_URL}/rest/v1/reg_serv`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({n_int: request.n_int, section: elem.section, abv_name: elem.abv_name, year: request.year, month: request.month, day: parseInt(dia), value: "FE", corp_oper_nr: corp_oper_nr})
        })
      );
      const responses = await Promise.all(promises);
      await opsCheckResponses(responses, "Erro ao gravar os dias de férias na escala");
    }    
    /* ========= DELETE VACATIONS ========= */
    async function deleteDaysOnVacation(request) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const query = `n_int=eq.${request.n_int}&year=eq.${request.year}&month=eq.${request.month}&value=eq.FE&corp_oper_nr=eq.${corp_oper_nr}`;      
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_serv?${query}`, {
        method: 'DELETE',
        headers: getSupabaseHeaders()
      });
      await opsCheckResponses(res, "Erro ao apagar os dias de férias da escala");
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
    /* =======================================
    PEDIDOS DE FARDAMENTO
    (colar no fomioprogramatics, a seguir à secção VACATIONS)
    Pedidos: tabela uniform_orders (feitos na Mobile, página SolFardam)
    Artigos: tabela uniform_items (lista que a Mobile mostra)
    ======================================= */
    let unifOrdersCache = [];
    let unifElemMap = {};
    let unifItemsCache = [];
    const UNIF_TH = 'padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #333;';
    function unifEsc(v) {
      return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    }
    function unifCorp() {
      const c = sessionStorage.getItem('currentCorpOperNr');
      return c ? c.padStart(4, "0") : null;
    }
    function unifFmtDate(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      return d.toLocaleDateString('pt-PT', {day: '2-digit', month: '2-digit', year: 'numeric'}) + ' ' +
             d.toLocaleTimeString('pt-PT', {hour: '2-digit', minute: '2-digit'});
    }
    function unifBadge(state) {
      const colors = {"Em Aprovação": "#f39c12", "Aprovado": "#0282fa", "Entregue": "#2e7d32", "Rejeitado": "#e53935"};
      return `<span style="background:${colors[state] || '#7f8c8d'}; color:#fff; padding:3px 8px; border-radius:50px; font-size:11px; white-space:nowrap;">${unifEsc(state)}</span>`;
    }
    document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (!btn) return;
      const page = btn.getAttribute('data-page');
      if (page === 'page-uniform-orders') await unifLoadOrders();
      if (page === 'page-uniform-items') await unifLoadItems();
    });
    /* ========== PEDIDOS: CARREGAR ========== */
    async function unifLoadOrders() {
      const tbody = document.getElementById('unifOrdersBody');
      const corp = unifCorp();
      if (!tbody || !corp) return;
      tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH}">A carregar pedidos...</td></tr>`;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_orders?select=id,n_int,items,notes,status,order_date,approved_date,delivery_date,delivery_n_int&corp_oper_nr=eq.${corp}&order=order_date.desc&limit=500`, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        unifOrdersCache = await res.json();
        const nInts = [...new Set(unifOrdersCache.flatMap(o => [o.n_int, o.delivery_n_int]).filter(v => v !== null && v !== undefined && v !== ""))];
        unifElemMap = {};
        if (nInts.length) {
          const rElems = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp}&n_int=in.(${nInts.join(',')})&select=n_int,full_name,abv_name,patent`, {
            headers: getSupabaseHeaders()
          });
          if (rElems.ok) (await rElems.json()).forEach(e => unifElemMap[String(e.n_int)] = e);
        }
        unifRenderOrders();
      } catch (err) {
        console.error("Erro ao carregar pedidos de fardamento:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH} color:red;">Erro ao carregar os pedidos.</td></tr>`;
      }
    }
    /* ========== PEDIDOS: DESENHAR (com filtro) ========== */
    function unifRenderOrders() {
      const tbody = document.getElementById('unifOrdersBody');
      if (!tbody) return;
      const filter = document.getElementById('unifStateFilter')?.value || 'pendentes';
      const search = (document.getElementById('unifSearch')?.value || '').trim().toLowerCase();
      const rows = unifOrdersCache.filter(o => {
        if (filter === 'pendentes' && !['Em Aprovação', 'Aprovado'].includes(o.status)) return false;
        if (!['pendentes', 'todos'].includes(filter) && o.status !== filter) return false;
        if (search) {
          const el = unifElemMap[String(o.n_int)] || {};
          if (!String(o.n_int).includes(search) && !String(el.full_name || '').toLowerCase().includes(search)) return false;
        }
        return true;
      });
      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH} color:#666;">Sem pedidos para mostrar.</td></tr>`;
        return;
      }
      const btnStyle = 'padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold; color: #fff;';
      tbody.innerHTML = rows.map(o => {
        const el = unifElemMap[String(o.n_int)] || {};
        const items = (o.items || []).map(i =>
          `<div>${unifEsc(i.quantity)}x <b>${unifEsc(i.articleLabel || i.article)}</b>${i.size && i.size !== 'N/A' ? ' · Tam. ' + unifEsc(i.size) : ''}${i.brand && i.brand !== 'Não Aplicável' ? ' · ' + unifEsc(i.brand) : ''}</div>`
        ).join('');
        const notes = o.notes ? `<div style="color:#666; font-style:italic; margin-top:3px;">"${unifEsc(o.notes)}"</div>` : '';
        const meta = [];
        if (o.approved_date) meta.push(`Aprovado ${unifFmtDate(o.approved_date)}`);
        if (o.delivery_date) {
          const who = unifElemMap[String(o.delivery_n_int)];
          meta.push(`Entregue ${unifFmtDate(o.delivery_date)}${o.delivery_n_int ? ' por ' + unifEsc(who?.abv_name || who?.full_name || 'Nº ' + o.delivery_n_int) : ''}`);
        }
        let actions = '—';
        if (o.status === 'Em Aprovação') {
          actions = `<button title="Aprovar" onclick="unifSetState(${o.id}, 'Aprovado')" style="${btnStyle} background:#2e7d32;">✓</button>
                     <button title="Rejeitar" onclick="unifSetState(${o.id}, 'Rejeitado')" style="${btnStyle} background:#e53935;">✕</button>`;
        } else if (o.status === 'Aprovado') {
          actions = `<button title="Marcar como entregue" onclick="unifSetState(${o.id}, 'Entregue')" style="${btnStyle} background:#0282fa;">📦</button>
                     <button title="Rejeitar" onclick="unifSetState(${o.id}, 'Rejeitado')" style="${btnStyle} background:#e53935;">✕</button>`;
        }
        return `
          <tr>
            <td style="${UNIF_TH}">${unifFmtDate(o.order_date)}</td>
            <td style="${UNIF_TH}">${unifEsc(o.n_int)}</td>
            <td style="${UNIF_TH} text-align:left;">${unifEsc(el.patent ? el.patent + ' ' : '')}${unifEsc(el.full_name || '')}</td>
            <td style="${UNIF_TH} text-align:left;">${items}${notes}</td>
            <td style="${UNIF_TH}">${unifBadge(o.status)}${meta.length ? `<div style="font-size:10px; color:#777; margin-top:4px;">${meta.join('<br>')}</div>` : ''}</td>
            <td style="${UNIF_TH}"><div style="display:flex; gap:4px; justify-content:center;">${actions}</div></td>
          </tr>`;
      }).join('');
    }
    /* ========== PEDIDOS: MUDAR ESTADO ========== */
    async function unifSetState(id, newState) {
      const order = unifOrdersCache.find(o => o.id === id);
      if (!order || order.status === newState) return;
      const now = new Date().toISOString();
      const patch = {status: newState};
      if (newState === 'Aprovado') patch.approved_date = now;
      if (newState === 'Entregue') {
        patch.delivery_date = now;
        patch.delivery_n_int = sessionStorage.getItem('currentNInt') || null;
        if (!order.approved_date) patch.approved_date = now;
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_orders?id=eq.${id}`, {
          method: 'PATCH',
          headers: {...getSupabaseHeaders(), 'Prefer': 'return=representation'},
          body: JSON.stringify(patch)
        });
        if (!res.ok) throw new Error(await res.text());
        const [updated] = await res.json();
        if (!updated) throw new Error("Sem permissão para alterar este pedido.");
        Object.assign(order, updated);
        unifRenderOrders();
        const msg = newState === 'Aprovado' ? 'O teu pedido de fardamento foi aprovado! ✅'
                  : newState === 'Entregue' ? 'O teu pedido de fardamento foi marcado como entregue. 📦'
                  : 'O teu pedido de fardamento foi rejeitado. ❌';
        fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({n_int: order.n_int, corp_oper_nr: unifCorp(), title: "Pedidos de Fardamento", message: msg, is_read: false, created_at: now})
        }).catch(e => console.error('Erro notificação:', e));
        fetch('https://cb-360-app.vercel.app/api/sendPush', {
          method: 'POST',
          headers: cb360PushHeaders(),
          body: JSON.stringify({recipient_nint: Number(order.n_int), tipo: 'aviso', pagina: 'SolFardam', sender_name: "Pedidos de Fardamento", message_text: msg})
        }).catch(e => console.error('Erro Push:', e));   /* não espera pelo envio */
        showPopup('popup-success', `Pedido marcado como ${newState}.`);
      } catch (err) {
        console.error("Erro ao mudar estado do pedido:", err);
        showPopup('popup-danger', "Erro ao alterar o pedido: " + (err.message || err));
      }
    }
    /* ========== ARTIGOS: CARREGAR ========== */
    async function unifLoadItems() {
      const tbody = document.getElementById('unifItemsBody');
      const corp = unifCorp();
      if (!tbody || !corp) return;
      tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH}">A carregar artigos...</td></tr>`;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_items?select=id,code,label,size_type,brand,sort_order,active&corp_oper_nr=eq.${corp}&order=sort_order.asc,label.asc`, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        unifItemsCache = await res.json();
        unifRenderItems();
      } catch (err) {
        console.error("Erro ao carregar artigos:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH} color:red;">Erro ao carregar os artigos.</td></tr>`;
      }
    }
    function unifItemRowHTML(it) {
      const key = it ? it.id : 'new';
      const inp = 'width:100%; height:28px; padding:0 6px; font-size:12px; border:1px solid #ced4da; border-radius:4px; box-sizing:border-box;';
      const sizeSel = (v) => `
        <select id="unifSize_${key}" style="${inp}">
          <option value="" ${!v ? 'selected' : ''}>Sem tamanho</option>
          <option value="letter" ${v === 'letter' ? 'selected' : ''}>Letra (S, M, L…)</option>
          <option value="numeric" ${v === 'numeric' ? 'selected' : ''}>Número</option>
        </select>`;
      const nextOrder = unifItemsCache.reduce((m, x) => Math.max(m, x.sort_order || 0), 0) + 1;
      return `
        <tr style="${it ? (it.active ? '' : 'opacity:0.55;') : 'background:#fff8e1;'}">
          <td style="${UNIF_TH}"><input type="number" id="unifOrder_${key}" value="${it ? (it.sort_order ?? 0) : nextOrder}" style="${inp} text-align:center;"></td>
          <td style="${UNIF_TH}"><input type="text" id="unifLabel_${key}" value="${unifEsc(it ? it.label : '')}" placeholder="${it ? '' : 'Novo artigo...'}" maxlength="80" style="${inp}"></td>
          <td style="${UNIF_TH}">${sizeSel(it ? it.size_type : '')}</td>
          <td style="${UNIF_TH}"><input type="text" id="unifBrand_${key}" value="${unifEsc(it ? (it.brand || '') : '')}" placeholder="Não Aplicável" maxlength="60" style="${inp}"></td>
          <td style="${UNIF_TH}">${it ? `<input type="checkbox" id="unifActive_${key}" ${it.active ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;">` : ''}</td>
          <td style="${UNIF_TH}">
            <button onclick="unifSaveItem(${it ? it.id : 'null'})" style="padding: 4px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold; background: ${it ? '#ce1212' : '#2e7d32'}; color: #fff;">${it ? 'Guardar' : 'Adicionar'}</button>
          </td>
        </tr>`;
    }
    function unifRenderItems() {
      const tbody = document.getElementById('unifItemsBody');
      if (!tbody) return;
      tbody.innerHTML = unifItemRowHTML(null) + unifItemsCache.map(unifItemRowHTML).join('');
    }
    /* ========== ARTIGOS: GRAVAR (novo ou existente) ========== */
    function unifMakeCode(label) {
      let base = label.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'artigo';
      let code = base, n = 2;
      while (unifItemsCache.some(x => x.code === code)) code = `${base}_${n++}`;
      return code;
    }
    async function unifSaveItem(id) {
      const key = id === null ? 'new' : id;
      const label = (document.getElementById(`unifLabel_${key}`)?.value || '').trim();
      const sizeType = document.getElementById(`unifSize_${key}`)?.value || null;
      const brand = (document.getElementById(`unifBrand_${key}`)?.value || '').trim() || null;
      const sortOrder = parseInt(document.getElementById(`unifOrder_${key}`)?.value, 10) || 0;
      if (!label) return showPopup('popup-danger', "Indique o nome do artigo.");
      const dup = unifItemsCache.find(x => x.id !== id && x.label.trim().toLowerCase() === label.toLowerCase());
      if (dup) return showPopup('popup-danger', `Já existe um artigo com o nome "${dup.label}".`);
      const body = {label, size_type: sizeType || null, brand, sort_order: sortOrder};
      try {
        let res;
        if (id === null) {
          body.corp_oper_nr = unifCorp();
          body.code = unifMakeCode(label);
          body.active = true;
          res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_items`, {
            method: 'POST',
            headers: {...getSupabaseHeaders(), 'Prefer': 'return=representation'},
            body: JSON.stringify(body)
          });
        } else {
          body.active = !!document.getElementById(`unifActive_${key}`)?.checked;
          res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_items?id=eq.${id}`, {
            method: 'PATCH',
            headers: {...getSupabaseHeaders(), 'Prefer': 'return=representation'},
            body: JSON.stringify(body)
          });
        }
        if (!res.ok) throw new Error(await res.text());
        const [saved] = await res.json();
        if (!saved) throw new Error("Sem permissão para gravar artigos.");
        showPopup('popup-success', id === null ? "Artigo adicionado." : "Artigo guardado.");
        await unifLoadItems();
      } catch (err) {
        console.error("Erro ao gravar artigo:", err);
        showPopup('popup-danger', "Erro ao gravar o artigo: " + (err.message || err));
      }
    }
    /* =======================================
    SERVIÇOS VOLUNTARIADO
    ======================================= */
    /* ============= INSERÇÃO ============= */
    let vsValuesCache = [];
    async function loadVsValuesCache() {
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!corpOperNr) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?corp_oper_nr=eq.${corpOperNr}&select=*`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return;
        vsValuesCache = await response.json();
        populateVsTypeSelect();
        populateVsLocalSelect();
      } catch (err) {
        console.error('Erro ao carregar valores:', err);
      }
    }
    const transportFields = ['vsValue', 'vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue'];
    const transportValueOnly = ['vsValue'];
    const transportExtraFields = ['vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue'];
    const prevFields = ['vsPrevValueHour', 'vsQtdPrevHours', 'vsPrevValue'];
    function setFieldsState(fieldIds, disabled) {
      fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = disabled;
        el.style.opacity = disabled ? '0.4' : '1';
        el.style.pointerEvents = disabled ? 'none' : '';
        if (disabled) el.value = '';
      });
    }
    function clearFields(fieldIds) {
      fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = '';
      });
    }
    const typeChangeClearFields = ['vsLocal', 'vsValue', 'vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue', 'vsPrevValueHour', 'vsQtdPrevHours', 'vsPrevValue', 'vsElementValue', 'vsElementNInt', 'vsElementName'];
    function handleVsTypeChange() {
      clearFields(typeChangeClearFields);
      const typeValue = document.getElementById('vsType').value;
      const typeNormalized = normalizeText(typeValue);
      const containerLocal = document.getElementById('container-vsLocal');
      const localSelect = document.getElementById('vsLocal');
      const localText = document.getElementById('vsLocalText');
      if (containerLocal) {
        if (typeNormalized === 'transporte de doentes') {
          containerLocal.style.display = '';
          localSelect.style.display = 'block';
          localText.style.display = 'none';
          localText.value = '';
        }
        else if (typeNormalized === 'prevencao' || typeNormalized === 'outro') {
          containerLocal.style.display = '';
          localSelect.style.display = 'none';
          localText.style.display = 'block';
          localSelect.value = ''; 
        }
        else {
          containerLocal.style.display = 'none';
          localSelect.value = '';
          localText.value = '';
        }
      }
      switch (typeValue) {
        case 'PREVENÇÃO':
        case 'OUTRO':
          setFieldsState(transportFields, true);
          setFieldsState(prevFields, false);
          break;
        case 'TRANSPORTE DE DOENTES':
          setFieldsState(transportFields, false);
          setFieldsState(prevFields, true);
          break;
        case 'SERVIÇO GERAL':
        case 'CENTRAL':
        case 'EIP':
        case 'INEM':
        case 'REMOÇÃO DE CADÁVER':
          setFieldsState(transportValueOnly, false);
          setFieldsState(transportExtraFields, true);
          setFieldsState(prevFields, true);
          break;
        default:
          setFieldsState(transportFields, true);
          setFieldsState(prevFields, true);
          break;
      }    
      calculateGlobalTotal();
    }
    function normalizeText(text) {
      return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }
    function applyRules() {
      const typeRaw = document.getElementById('vsType').value;
      const type = normalizeText(typeRaw);
      const localRaw = document.getElementById('vsLocal').value;
      const local = normalizeText(localRaw);
      const vsValue = document.getElementById('vsValue');
      const vsPrevValueHour = document.getElementById('vsPrevValueHour');
      const containerOtherLocal = document.getElementById('container-vsOtherLocal');
      const vsOtherLocal = document.getElementById('vsOtherLocal');
      vsValue.value = '';
      vsPrevValueHour.value = '';
      containerOtherLocal.style.display = 'none';
      vsOtherLocal.value = '';
      if (type === 'transporte de doentes') {
        if (localRaw === 'Outro') {
          containerOtherLocal.style.display = 'flex';
        } else {
          const match = vsValuesCache.find(item => item.type === 'TRANSPORTE DE DOENTES' && normalizeText(item.desteny) === local);
          if (match) {
            vsValue.value = match.value || '';
            document.getElementById('vsQtdSick')._extraSickRate = parseFloat(match.extra_sick) || 0;
            document.getElementById('vsWaitHrs')._extraHourRate = parseFloat(match.extra_hour) || 0;
          }
        }
      }
      else if (type === 'prevencao') {
        const match = vsValuesCache.find(item => normalizeText(item.type) === 'prevencao');
        if (match) vsPrevValueHour.value = match.value || '';
      }
      else if (type !== '') {
        const match = vsValuesCache.find(item => normalizeText(item.type) === type);
        if (match) vsValue.value = match.value || '';
      }
      calculateGlobalTotal();
    }
    function populateVsTypeSelect() {
      const vsType = document.getElementById('vsType');
      if (!vsType) return;
      const allTypes = [...new Set(vsValuesCache.map(item => item.type).filter(Boolean))].sort();
      vsType.innerHTML = `
        <option value="">Selecione...</option>
        ${allTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
      `;
    }
    function populateVsLocalSelect() {
      const vsLocal = document.getElementById('vsLocal');
      if (!vsLocal) return;
      const destinos = vsValuesCache
      .filter(item => item.type === 'TRANSPORTE DE DOENTES' && item.desteny && item.desteny.trim() !== '-')
      .map(item => item.desteny);
      const uniqueDestinos = [...new Set(destinos)].sort();
      vsLocal.innerHTML = `
        <option value="">Selecione...</option>
        ${uniqueDestinos.map(d => `<option value="${d}">${d}</option>`).join('')}
      `;
    }
    function calculateSickValue() {
      const qtd = parseFloat(document.getElementById('vsQtdSick').value) || 0;
      const rate = document.getElementById('vsQtdSick')._extraSickRate || 5;
      document.getElementById('vsSickValue').value = qtd * rate;
      calculateGlobalTotal();
    }
    function calculateWaitHrsValue() {
      const hrs = parseFloat(document.getElementById('vsWaitHrs').value) || 0;
      const rate = document.getElementById('vsWaitHrs')._extraHourRate || 3;
      document.getElementById('vsWaitHrsValue').value = hrs * rate;
      calculateGlobalTotal();
    }
    function calculatePrevValue() {
      const valHour = parseFloat(document.getElementById('vsPrevValueHour').value) || 0;
      const qtdHours = parseFloat(document.getElementById('vsQtdPrevHours').value) || 0;
      document.getElementById('vsPrevValue').value = (valHour * qtdHours);
      calculateGlobalTotal();
    }
    function calculateGlobalTotal() {
      const vBase = parseFloat(document.getElementById('vsValue').value) || 0;
      const vSick = parseFloat(document.getElementById('vsSickValue').value) || 0;
      const vWait = parseFloat(document.getElementById('vsWaitHrsValue').value) || 0;
      const vPrev = parseFloat(document.getElementById('vsPrevValue').value) || 0;
      const total = vBase + vSick + vWait + vPrev;
      const globalField = document.getElementById('vsElementValue');
      if (globalField) {
        globalField.value = total > 0 ? total.toFixed(2) : '';
        const baseStyle = "width:100px; text-align:center; font-size:20px !important; height:40px !important;";
        if (total > 0) {
          globalField.setAttribute('style', baseStyle + " background:#d4edda !important; border:1.5px solid #28a745 !important; color:#155724 !important;");
        } else {
          globalField.setAttribute('style', baseStyle);
        }
      }
    }
    async function fetchElementName() {
      const n_int = document.getElementById('vsElementNInt').value.trim();
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const nameField = document.getElementById('vsElementName');
      nameField.value = '';
      if (!n_int || !corp_oper_nr) return;
      if (n_int.length < 3) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${n_int}&corp_oper_nr=eq.${corp_oper_nr}&select=abv_name`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.length > 0) {
          nameField.value = data[0].abv_name;
        } else {
          showPopup('popup-danger', `Elemento com Nº ${n_int} não existe na base de dados.`);
          document.getElementById('vsElementNInt').value = '';
        }
      } catch (err) {console.error('Erro de rede:', err);}
    }
    let vsLoggedUserNameCache = null;
    async function getVsLoggedUserName() {
      if (vsLoggedUserNameCache) return vsLoggedUserNameCache;
      const nInt = sessionStorage.getItem('currentNInt');
      const corpNr = sessionStorage.getItem('currentCorpOperNr');
      // 1) Procura em reg_elems pelo n_int + corp_oper_nr da sessão
      if (nInt && corpNr) {
        try {
          const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name&n_int=eq.${encodeURIComponent(nInt)}&corp_oper_nr=eq.${encodeURIComponent(corpNr)}&limit=1`;
          const response = await fetch(url, {method: 'GET', headers: getSupabaseHeaders()});
          if (response.ok) {
            const data = await response.json();
            if (data[0]?.abv_name) vsLoggedUserNameCache = data[0].abv_name;
            else console.warn('[updated_by] reg_elems sem resultado para', nInt, corpNr);
          } else {
            console.warn('[updated_by] reg_elems respondeu', response.status, await response.text());
          }
        } catch (err) {
          console.warn('[updated_by] Erro ao consultar reg_elems:', err);
        }
      }
      // 2) Assinatura do OPTEL (mesma função usada noutros módulos)
      if (!vsLoggedUserNameCache && typeof getOptelSignature === 'function') {
        try {
          const sig = await getOptelSignature();
          if (sig) vsLoggedUserNameCache = String(sig).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } catch (e) {
          console.warn('Erro ao obter assinatura do OPTEL:', e);
        }
      }
      // 3) Último recurso: nome completo guardado na sessão
      if (!vsLoggedUserNameCache) {
        vsLoggedUserNameCache = sessionStorage.getItem('currentUserDisplay')
                             || sessionStorage.getItem('currentUserName')
                             || null;
      }
      return vsLoggedUserNameCache;
    }
    function debounce(fn, delay) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
      };
    }
    async function saveVolunteerService() {
      const serviceDate = document.getElementById('vsDate').value;
      const serviceType = document.getElementById('vsType').value;
      const nInt = document.getElementById('vsElementNInt').value;
      const abvName = document.getElementById('vsElementName').value;
      const globalValue = document.getElementById('vsElementValue').value;
      const typeNormalized = normalizeText(serviceType);
      const valSelect = document.getElementById('vsLocal').value;
      const valText = document.getElementById('vsLocalText').value;
      const valOther = document.getElementById('vsOtherLocal').value;
      let finalLocal = valSelect === 'Outro' ? valOther : (valSelect || valText);
      if (!serviceDate || !serviceType || !nInt || !abvName) {
        showPopup('popup-danger', 'Falta preencher campos obrigatórios.');
        return;
      }
      if (typeNormalized === 'transporte de doentes' && !finalLocal) {
        showPopup('popup-danger', 'Para este serviço, o Local é obrigatório.');
        return;
      }
      const internalServices = ['CENTRAL', 'EIP', 'SERVIÇO GERAL', 'INEM'];
      if (internalServices.includes(serviceType)) {
        finalLocal = 'Quartel Sede';
      }
      const payload = {service_date: serviceDate, service_type: serviceType, service_local: finalLocal || null, service_type_global_value: document.getElementById('vsValue').value || null,
                       service_sicks: document.getElementById('vsQtdSick').value || null, service_sicks_value: document.getElementById('vsSickValue').value || null,
                       service_whait_hours: document.getElementById('vsWaitHrs').value || null, service_whait_hours_value: document.getElementById('vsWaitHrsValue').value || null,
                       prev_value_hour: document.getElementById('vsPrevValueHour').value || null, prev_total_hours: document.getElementById('vsQtdPrevHours').value || null,
                       prev_global_value: document.getElementById('vsPrevValue').value || null, n_int: nInt, abv_name: abvName, global_value: globalValue,
                       corp_oper_nr: sessionStorage.getItem('currentCorpOperNr'),
                       updated_at: new Date().toISOString(),
                       updated_by: await getVsLoggedUserName()};
      const btn = document.getElementById('services-save-button');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '⏳ A guardar...';
      try {
        const checkUrl = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?service_date=eq.${payload.service_date}&service_type=eq.${encodeURIComponent(payload.service_type)}&n_int=eq.${payload.n_int}&corp_oper_nr=eq.${payload.corp_oper_nr}&select=id`;
        const checkRes = await fetch(checkUrl, {headers: getSupabaseHeaders()});
        const existing = await checkRes.json();
        if (existing.length > 0) {
          showPopup('popup-danger', 'Já existe um registo idêntico para este elemento.');
          btn.disabled = false;
          btn.innerHTML = originalText;
          return;
        }
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services`, {
          method: 'POST',
          headers: getSupabaseHeaders({returnRepresentation: true}),
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw await response.json();
        showPopup('popup-success', `Serviço de voluntariado guardado com sucesso, no elemento ${payload.abv_name}!`);
        clearVolunteerForm();
        handleVsTypeChange();
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', 'Erro ao guardar serviço.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
    function clearVolunteerForm() {
      const ids = ['vsDate', 'vsType', 'vsLocal', 'vsValue', 'vsQtdSick', 'vsSickValue', 'vsWaitHrs', 'vsWaitHrsValue', 'vsPrevValueHour',
                   'vsQtdPrevHours', 'vsPrevValue', 'vsElementNInt', 'vsElementName', 'vsElementValue'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = '';
        if (id === 'vsElementValue') {
          el.setAttribute('style', 'width:100px; text-align:center; font-size:20px !important; height:40px !important;');
        }
      });
      document.getElementById('vsLocalText').value = '';
      document.getElementById('vsLocalText').style.display = 'none';
      document.getElementById('vsOtherLocal').value = '';
      document.getElementById('container-vsOtherLocal').style.display = 'none';
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('services-save-button')?.addEventListener('click', saveVolunteerService);
      loadVsValuesCache();
      const vsType = document.getElementById('vsType');
      const vsLocal = document.getElementById('vsLocal');
      if (vsType) {
        vsType.addEventListener('change', () => {handleVsTypeChange(); applyRules();});
        handleVsTypeChange();
      }
      vsLocal?.addEventListener('change', applyRules);
      document.getElementById('vsQtdSick')?.addEventListener('input', calculateSickValue);
      document.getElementById('vsWaitHrs')?.addEventListener('input', calculateWaitHrsValue);
      document.getElementById('vsPrevValueHour')?.addEventListener('input', calculatePrevValue);
      document.getElementById('vsQtdPrevHours')?.addEventListener('input', calculatePrevValue);
      document.getElementById('vsValue')?.addEventListener('input', calculateGlobalTotal);
      document.getElementById('vsElementNInt')?.addEventListener('input', debounce(fetchElementName, 10));
    });
    /* =========== VISULIZAÇÃO ============ */
    let currentVolunteerData = [];
    const container = document.getElementById('services-table-container');
    if (!document.getElementById('hide-scrollbar-style')) {
      const style = document.createElement('style');
      style.id = 'hide-scrollbar-style';
      style.innerHTML = `
        .no-scrollbar::-webkit-scrollbar {display: none;}
        .no-scrollbar {-ms-overflow-style: none; scrollbar-width: none;}
      `;
      document.head.appendChild(style);
    }
    const tableHTML = `
      <div class="no-scrollbar" style="max-height: 500px; overflow-y: auto; margin-top: 15px; border: 1px solid #aaa; border-radius: 4px;">
        <table style="width:100%; border-collapse: separate; border-spacing: 0; font-family: sans-serif; font-size: 10px; text-align: center; table-layout: fixed;">
          <colgroup>
            <col style="width: 70px;">  <col style="width: 180px;"> <col style="width: 100px;">
            <col style="width: 55px;">  <col style="width: 45px;">  <col style="width: 40px;">
            <col style="width: 50px;">  <col style="width: 40px;">  <col style="width: 50px;">
            <col style="width: 40px;">  <col style="width: 50px;">  <col style="width: 110px;">
            <col style="width: 70px;">  <col style="width: 60px;">
          </colgroup>
          <thead>
            <tr>
              <th colspan="3" rowspan="2" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-bottom:1px solid #aaa; padding:5px;">Data | Tipo de Serviço</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor do<br>Serviço</th>
              <th colspan="3" rowspan="2" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Prevenções</th>
              <th colspan="4" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Transporte de Doentes</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Elemento</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor Global<br>a Receber</th>
              <th rowspan="3" style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Ações</th>
            </tr>
            <tr>
              <th colspan="2" style="position:sticky; top:27px; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:4px;">Doentes Extra</th>
              <th colspan="2" style="position:sticky; top:27px; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:4px;">Horas Espera</th>
            </tr>
            <tr>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-bottom:1px solid #aaa; padding:5px;">Data do Serviço</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Tipo de Serviço</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Local do Serviço</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor/Hora</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Qtd.</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Total</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Qtd.</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Qtd.</th>
              <th style="position:sticky; top:52px; z-index:10; background-color:#d1d1d1; color:black; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:5px;">Valor</th>
            </tr>
          </thead>
          <tbody id="table-body"></tbody>
        </table>
      </div>
    `;
    function vsFormatDate(dataISO) {
      if (!dataISO) return '';
      const [year, month, day] = String(dataISO).slice(0, 10).split('-');
      return `${day}/${month}/${year}`;
    }
    function vsFormatDateTime(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d)) return '';
      return d.toLocaleString('pt-PT', {
        timeZone: 'Europe/Lisbon',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).replace(',', '');
    }
    async function getUniqueServiceTypes() {
      const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?select=type`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error('Erro ao carregar tipos');
        const data = await response.json();
        return [...new Set(data.map(item => item.type))]
          .filter(t => t && String(t).trim() !== '')
          .sort();
      } catch (error) {
        console.error("Erro na busca de tipos:", error);
        return [];
      }
    }
    async function loadVolunteerServicesTable() {
      const container = document.getElementById('services-table-container');
      const yearEl = document.getElementById('vsConsYear');
      const monthEl = document.getElementById('vsConsMonth');
      const typeEl = document.getElementById('vsConsType');
      const elementEl = document.getElementById('vsConsElement');
      const localEl = document.getElementById('vsConsLocal');
      if (!container || !yearEl || !monthEl || !typeEl) return;
      // Liga os botões Editar/Eliminar uma única vez (event delegation)
      if (!container.dataset.actionsBound) {
        container.addEventListener('click', onVsTableActionClick);
        container.dataset.actionsBound = '1';
      }
      const type = typeEl.value;
      const selectedYear = yearEl.value;
      const selectedMonth = monthEl.value;
      const selectedElement = elementEl ? elementEl.value : 'todos';
      const selectedLocal = localEl ? localEl.value : 'todos';
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      document.getElementById('vsReportSelect').value = '';
      const pdfBtn = document.getElementById('vsPDFReport');
      const excelBtn = document.getElementById('vsEXCELReport');
      const setButtonsState = (disabled) => {
        [pdfBtn, excelBtn].forEach(btn => {
          if (btn) {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '1';
            btn.style.cursor  = disabled ? 'not-allowed' : 'pointer';
          }
        });
      };
      setButtonsState(true);
      if (!document.getElementById('table-body')) {
        container.innerHTML = typeof tableHTML !== 'undefined' ? tableHTML : '<div class="no-scrollbar" style="max-height: 500px; overflow-y: auto; margin-top: 15px; border: 1px solid #aaa; border-radius: 4px;"><table style="width:100%; border-collapse: separate; border-spacing: 0;"><tbody id="table-body"></tbody></table></div>';
      }
      const tableBody = document.getElementById('table-body');
      tableBody.style.opacity = "0.5";
      let dateFilter = "";
      if (selectedMonth === "todos") {
        dateFilter = `&service_date=gte.${selectedYear}-01-01&service_date=lte.${selectedYear}-12-31`;
      } else {
        const lastDay = new Date(selectedYear, parseInt(selectedMonth), 0).getDate();
        dateFilter = `&service_date=gte.${selectedYear}-${selectedMonth}-01&service_date=lte.${selectedYear}-${selectedMonth}-${lastDay}`;
      }
      let typeFilter = (type !== "todos") ? `&service_type=eq.${encodeURIComponent(type)}` : "";
      let elementFilter = (selectedElement !== "todos") ? `&n_int=eq.${encodeURIComponent(selectedElement)}` : "";
      let localFilter = (selectedLocal !== "todos") ? `&service_local=eq.${encodeURIComponent(selectedLocal)}` : "";
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?corp_oper_nr=eq.${corpOperNr}${dateFilter}${typeFilter}${elementFilter}${localFilter}&order=service_date.asc`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error('Erro na resposta do servidor');
        const data = await response.json();
        currentVolunteerData = data;
        tableBody.style.opacity = "1";
        tableBody.innerHTML = '';
        if (data.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="14" style="padding: 20px; font-size: 13px; text-align: center;">Nenhum registo encontrado para este período ou tipo.</td></tr>';
          updateSummary(0, 0);
          return;
        }
        setButtonsState(false);
        tableBody.innerHTML = data.map(item => {
          const tdStyle = `border-bottom: 1px solid #ccc; padding: 6px; font-size: 12px;`;
          const actBtnStyle = `padding: 3px 7px; font-size: 12px; line-height: 1; margin: 0 2px;`;
          return `
            <tr>
              <td style="${tdStyle}">${vsFormatDate(item.service_date)}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_type || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_local || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${vsFmtEur(item.service_type_global_value, '0,00')}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${vsFmtEur(item.prev_value_hour)}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.prev_total_hours || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${vsFmtEur(item.prev_global_value)}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_sicks || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${vsFmtEur(item.service_sicks_value)}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.service_whait_hours || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right;">${vsFmtEur(item.service_whait_hours_value)}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center;">${item.abv_name || ''}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: right; font-weight: bold; font-size: 13px;">${vsFmtEur(item.global_value, '0,00')}</td>
              <td style="${tdStyle} border-left: 1px solid #ccc; text-align: center; white-space: nowrap;">
                <button class="btn btn-add vs-btn-edit" data-id="${item.id}" title="Editar" style="${actBtnStyle}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-danger vs-btn-delete" data-id="${item.id}" title="Eliminar" style="${actBtnStyle}"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `;
        }).join('');
        const total = data.reduce((sum, item) => sum + vsToNum(item.global_value), 0);
        const lastItem = data.reduce((last, item) => {
          if (!item.updated_at) return last;
          return (!last || new Date(item.updated_at) > new Date(last.updated_at)) ? item : last;
        }, null);
        updateSummary(total, data.length, lastItem?.updated_at || null, lastItem?.updated_by || null);
      } catch (err) {
        tableBody.style.opacity = "1";
        console.error('Erro:', err);
        tableBody.innerHTML = '<tr><td colspan="14" style="padding: 20px; color: red; text-align: center;">Erro ao carregar dados. Verifique a consola.</td></tr>';
      }
    }

    /* =========== AÇÕES: EDITAR / ELIMINAR ============ */
    function onVsTableActionClick(e) {
      const editBtn = e.target.closest('.vs-btn-edit');
      const delBtn = e.target.closest('.vs-btn-delete');
      if (editBtn) openVsEditModal(editBtn.dataset.id);
      if (delBtn) deleteVolunteerService(delBtn.dataset.id);
    }
    function vsToNum(v) {
      if (v === null || v === undefined || v === '') return 0;
      return parseFloat(String(v).replace(',', '.')) || 0;
    }
    function vsFmtEur(v, empty = '-') {
      const n = vsToNum(v);
      if (!n) return `${empty} €`;
      return `${n.toFixed(2).replace('.', ',')} €`;
    }
    function ensureVsEditModal() {
      const existingModal = document.getElementById('vsEditModal');
      if (existingModal) {
        if (document.getElementById('vsEditLocal')) return; // já é o modal novo
        existingModal.remove();                            // modal antigo no HTML: remove
      }
      const inp = `width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; height: 30px; box-sizing: border-box; font-size: 12px;`;
      const ro  = `${inp} background: #f1f1f1; font-weight: bold;`;
      const lbl = `display: block; margin: 0 0 4px 0; font-weight: bold; font-size: 12px; white-space: nowrap;`;
      const sec = `grid-column: 1 / -1; margin-top: 6px; padding: 4px 8px; background-color: #2b6ca3; color: white; font-weight: bold; font-size: 11px; border-radius: 3px;`;
      const modal = document.createElement('div');
      modal.id = 'vsEditModal';
      modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); align-items: center; justify-content: center; z-index: 9999;';
      modal.innerHTML = `
        <div class="major-card" style="width: 640px; max-width: 95vw; max-height: 90vh; overflow-y: auto; margin: 0;">
          <div class="major-card-header header-red" style="display: flex; align-items: center; justify-content: space-between;">
            <span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="opacity:.9; vertical-align: middle;">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
              </svg>
              EDITAR SERVIÇO
            </span>
            <span id="vsEditClose" title="Fechar" style="cursor: pointer; font-size: 18px; line-height: 1; padding: 0 4px;"><i class="fa-solid fa-xmark"></i></span>
          </div>
          <div class="major-card-body">
            <input type="hidden" id="vsEditId">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 12px;">
              <div style="grid-column: 1 / -1;">
                <label style="${lbl}">Elemento</label>
                <input type="text" id="vsEditElement" readonly style="${ro}">
              </div>
              <div>
                <label for="vsEditDate" style="${lbl}">Data do Serviço</label>
                <input type="date" id="vsEditDate" style="${inp}">
              </div>
              <div>
                <label for="vsEditType" style="${lbl}">Tipo de Serviço</label>
                <select id="vsEditType" style="${inp}"></select>
              </div>
              <div>
                <label for="vsEditLocal" style="${lbl}">Local do Serviço</label>
                <input type="text" id="vsEditLocal" style="${inp}">
              </div>
              <div>
                <label for="vsEditServiceValue" style="${lbl}">Valor do Serviço (€)</label>
                <input type="number" step="0.01" min="0" id="vsEditServiceValue" class="vs-recalc" style="${inp}">
              </div>

              <div style="${sec}">PREVENÇÕES</div>
              <div>
                <label for="vsEditPrevValueHour" style="${lbl}">Valor/Hora (€)</label>
                <input type="number" step="0.01" min="0" id="vsEditPrevValueHour" class="vs-recalc" style="${inp}">
              </div>
              <div>
                <label for="vsEditPrevHours" style="${lbl}">Qtd. Horas</label>
                <input type="number" step="0.5" min="0" id="vsEditPrevHours" class="vs-recalc" style="${inp}">
              </div>
              <div>
                <label style="${lbl}">Total (€)</label>
                <input type="text" id="vsEditPrevTotal" readonly style="${ro}">
              </div>

              <div style="${sec}">TRANSPORTE DE DOENTES</div>
              <div>
                <label for="vsEditSicks" style="${lbl}">Doentes Extra - Qtd.</label>
                <input type="number" step="1" min="0" id="vsEditSicks" style="${inp}">
              </div>
              <div style="grid-column: span 2;">
                <label for="vsEditSicksValue" style="${lbl}">Doentes Extra - Valor (€)</label>
                <input type="number" step="0.01" min="0" id="vsEditSicksValue" class="vs-recalc" style="${inp}">
              </div>
              <div>
                <label for="vsEditWaitHours" style="${lbl}">Horas Espera - Qtd.</label>
                <input type="number" step="0.5" min="0" id="vsEditWaitHours" style="${inp}">
              </div>
              <div style="grid-column: span 2;">
                <label for="vsEditWaitValue" style="${lbl}">Horas Espera - Valor (€)</label>
                <input type="number" step="0.01" min="0" id="vsEditWaitValue" class="vs-recalc" style="${inp}">
              </div>

              <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; margin-top: 6px;">
                <div style="border: 1px solid #aaa; border-radius: 4px; overflow: hidden; display: flex; height: 28px; align-items: center;">
                  <div style="padding: 0 12px; background-color: #2b6ca3; color: white; font-weight: bold; font-size: 12px; border-right: 1px solid #aaa; line-height: 28px;">
                    Valor Global a Receber
                  </div>
                  <div id="vsEditGlobal" style="padding: 0 15px; background-color: white; color: darkred; font-weight: bold; font-size: 14px; min-width: 100px; text-align: right; line-height: 28px;">
                    0.00 €
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="major-card-footer" style="display: flex; justify-content: flex-end; gap: 5px;">
            <button id="vsEditCancel" class="btn btn-danger"><i class="fa-solid fa-ban" style="margin-right: 5px;"></i>Cancelar</button>
            <button id="vsEditSave" class="btn btn-success"><i class="fa-solid fa-floppy-disk" style="margin-right: 5px;"></i>Gravar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('vsEditClose').onclick = closeVsEditModal;
      document.getElementById('vsEditCancel').onclick = closeVsEditModal;
      document.getElementById('vsEditSave').onclick = saveVsEdit;
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVsEditModal(); });
      modal.querySelectorAll('.vs-recalc').forEach(el => el.addEventListener('input', recalcVsEdit));
    }
    function recalcVsEdit() {
      const val = id => vsToNum(document.getElementById(id).value);
      const prevTotal = val('vsEditPrevValueHour') * val('vsEditPrevHours');
      const global = val('vsEditServiceValue') + prevTotal + val('vsEditSicksValue') + val('vsEditWaitValue');
      document.getElementById('vsEditPrevTotal').value = prevTotal.toFixed(2);
      document.getElementById('vsEditGlobal').textContent = `${global.toFixed(2).replace('.', ',')} €`;
      return { prevTotal, global };
    }
    async function openVsEditModal(id) {
      const item = currentVolunteerData.find(r => String(r.id) === String(id));
      if (!item) {
        showPopup('popup-danger', "Registo não encontrado. Atualize a tabela.");
        return;
      }
      ensureVsEditModal();
      const typeSel = document.getElementById('vsEditType');
      const types = await getUniqueServiceTypes();
      if (item.service_type && !types.includes(item.service_type)) types.push(item.service_type);
      typeSel.innerHTML = types.map(t => `<option value="${t}">${t}</option>`).join('');
      const set = (elId, v) => document.getElementById(elId).value = (v ?? '');
      set('vsEditId', item.id);
      set('vsEditElement', `${item.n_int || ''} - ${item.abv_name || ''}`);
      set('vsEditDate', item.service_date);
      set('vsEditType', item.service_type);
      set('vsEditLocal', item.service_local);
      set('vsEditServiceValue', item.service_type_global_value);
      set('vsEditPrevValueHour', item.prev_value_hour);
      set('vsEditPrevHours', item.prev_total_hours);
      set('vsEditSicks', item.service_sicks);
      set('vsEditSicksValue', item.service_sicks_value);
      set('vsEditWaitHours', item.service_whait_hours);
      set('vsEditWaitValue', item.service_whait_hours_value);
      recalcVsEdit();
      document.getElementById('vsEditModal').style.display = 'flex';
    }
    function closeVsEditModal() {
      const modal = document.getElementById('vsEditModal');
      if (modal) modal.style.display = 'none';
    }
    async function saveVsEdit() {
      const id = document.getElementById('vsEditId').value;
      const date = document.getElementById('vsEditDate').value;
      const type = document.getElementById('vsEditType').value;
      if (!date || !type) {
        showPopup('popup-danger', "Preencha a data e o tipo de serviço.");
        return;
      }
      const numOrNull = elId => {
        const v = document.getElementById(elId).value;
        return v === '' ? null : vsToNum(v);
      };
      const money = elId => {
        const v = document.getElementById(elId).value;
        return v === '' ? null : vsToNum(v).toFixed(2);
      };
      const { prevTotal, global } = recalcVsEdit();
      const payload = {
        service_date: date,
        service_type: type,
        service_local: document.getElementById('vsEditLocal').value.trim(),
        service_type_global_value: money('vsEditServiceValue'),
        prev_value_hour: money('vsEditPrevValueHour'),
        prev_total_hours: numOrNull('vsEditPrevHours'),
        prev_global_value: prevTotal ? prevTotal.toFixed(2) : null,
        service_sicks: numOrNull('vsEditSicks'),
        service_sicks_value: money('vsEditSicksValue'),
        service_whait_hours: numOrNull('vsEditWaitHours'),
        service_whait_hours_value: money('vsEditWaitValue'),
        global_value: global.toFixed(2),
        updated_at: new Date().toISOString(),
        updated_by: await getVsLoggedUserName()
      };
      const btn = document.getElementById('vsEditSave');
      btn.disabled = true;
      btn.style.opacity = '0.5';
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?id=eq.${encodeURIComponent(id)}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: { ...getSupabaseHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await response.text());
        closeVsEditModal();
        showPopup('popup-success', "Serviço atualizado com sucesso!");
        loadVolunteerServicesTable();
      } catch (err) {
        console.error("Erro ao gravar serviço:", err);
        showPopup('popup-danger', "Erro ao gravar: " + err.message);
      } finally {
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    }
    async function deleteVolunteerService(id) {
      const item = currentVolunteerData.find(r => String(r.id) === String(id));
      const desc = item ? `\n\n${vsFormatDate(item.service_date)} | ${item.service_type || ''} | ${item.abv_name || ''}` : '';
      if (!confirm(`Tem a certeza que pretende eliminar este serviço?${desc}`)) return;
      try {
        const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?id=eq.${encodeURIComponent(id)}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { ...getSupabaseHeaders(), 'Prefer': 'return=minimal' }
        });
        if (!response.ok) throw new Error(await response.text());
        showPopup('popup-success', "Serviço eliminado.");
        loadVolunteerServicesTable();
      } catch (err) {
        console.error("Erro ao eliminar serviço:", err);
        showPopup('popup-danger', "Erro ao eliminar: " + err.message);
      }
    }

    async function updateSummary(total, count, lastUpdate = null, lastUpdateBy = null) {
      const summaryContainer = document.getElementById('services-summary-container');
      if (!summaryContainer) return;
      const displayCount = count || 0;
      const displayTotal = typeof total === 'number' ? total.toFixed(2).replace('.', ',') : '0,00';
      summaryContainer.style.display = "flex";
      summaryContainer.style.flexDirection = "column";
      summaryContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 10px; font-family: sans-serif;">
          <div style="border: 1px solid #aaa; border-radius: 4px; overflow: hidden; display: flex; height: 28px; align-items: center;">
            <div style="padding: 0 12px; background-color: #2b6ca3; color: white; font-weight: bold; font-size: 12px; border-right: 1px solid #aaa; line-height: 28px;">
              Total de Serviços
            </div>
            <div style="padding: 0 15px; background-color: white; color: darkred; font-weight: bold; font-size: 14px; min-width: 50px; text-align: center; line-height: 28px;">
              ${displayCount}
            </div>
          </div>
          <div style="border: 1px solid #aaa; border-radius: 4px; overflow: hidden; display: flex; height: 28px; align-items: center;">
            <div style="padding: 0 12px; background-color: #2b6ca3; color: white; font-weight: bold; font-size: 12px; border-right: 1px solid #aaa; line-height: 28px;">
              Valor Global
            </div>
            <div style="padding: 0 15px; background-color: white; color: darkred; font-weight: bold; font-size: 14px; min-width: 120px; text-align: right; line-height: 28px;">
              ${displayTotal} €
            </div>
          </div>    
        </div>
        <div id="validation-card" class="major-card card major-last-card" style="display: none; margin: 8px 0 0 0; min-width: 15%; align-self: flex-end; clear: both;">
          <div class="major-card-header header-red" style="padding: 1px 8px; font-size: 11px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align: middle; margin-right: 4px;">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1-2.83-2.83l-3.94 3.6z"/>
              <path d="M11.5 9.5l-7 7l-2 3l3-2l7-7"/><path d="M10 22L13 19"/><path d="M22 10l-3 3"/><path d="M12 12l-6-6"/><circle cx="12" cy="12" r="3"/>
            </svg>
            VALIDAÇÃO
          </div>            
          <div style="padding: 6px 10px; display: flex; align-items: center; justify-content: flex-end; background: #fff; gap: 8px;">
            <div style="display: flex; gap: 8px;">
              <label style="display: flex; align-items: center; cursor: pointer; color: #155724; font-weight: bold; font-size: 12px; white-space: nowrap;">
                <input type="checkbox" id="vsValidado" style="margin-right: 3px; width: 15px; height: 15px; cursor: pointer;"> 
                Validado
              </label>
              <label style="display: flex; align-items: center; cursor: pointer; color: #721c24; font-weight: bold; font-size: 12px; white-space: nowrap;">
                <input type="checkbox" id="vsNaoValidado" style="margin-right: 3px; width: 15px; height: 15px; cursor: pointer;"> 
                Não Validado
              </label>
            </div>              
            <button id="btnConfirmarValidacao" style="background-color: #2b6ca3; color: white; border: none; margin-left: 10px; padding: 4px 8px; border-radius: 3px; font-weight: bold; 
                                                      cursor: pointer; font-size: 11px;">
              OK
            </button>
          </div>
        </div>
        <div id="direct-send-container" style="display: none; margin-top: 10px; align-self: flex-end;">
          <button id="btnEnviarVoluntario" style="background-color: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; 
                                                  display: flex; align-items: center; gap: 8px; transition: background 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            ENVIAR PARA VALIDAÇÃO
          </button>
        </div>
        ${lastUpdate ? `
          <div style="align-self: flex-end; margin-top: 6px; font-size: 11px; color: #555; font-family: sans-serif;">
            <i class="fa-solid fa-clock-rotate-left" style="margin-right: 4px;"></i>
            Última atualização: <b>${vsFormatDateTime(lastUpdate)}</b>${lastUpdateBy ? ` - <b style="color: #c00;">${lastUpdateBy}</b>` : ''}
          </div>
        ` : ''}
      `;
      const cbV = document.getElementById('vsValidado');
      const cbN = document.getElementById('vsNaoValidado');
      const btnOk = document.getElementById('btnConfirmarValidacao');
      const validationCard = document.getElementById('validation-card');
      const directSendContainer = document.getElementById('direct-send-container');
      const btnEnviar = document.getElementById('btnEnviarVoluntario');
      try {
        const nInt = sessionStorage.getItem("currentNInt");
        const corpNr = sessionStorage.getItem("currentCorpOperNr");
        const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=patent&n_int=eq.${nInt}&corp_oper_nr=eq.${corpNr}&limit=1`;
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          const patente = data[0]?.patent?.toLowerCase() || '';
          if (patente.includes('comandante')) {
            validationCard.style.display = 'block';
          } else if (patente.includes('bombeiro')) {
            directSendContainer.style.display = 'block';
          }
        }
      } catch (err) {
        console.warn("Erro ao verificar patente:", err);
      }
      if (cbV && cbN) {
        [cbV, cbN].forEach(cb => {
          cb.addEventListener('change', () => {
            const header = document.querySelector('#validation-card .major-card-header');
            if (cb.checked) {
              if (cb === cbV) {
                cbN.checked = false;
                header.classList.remove('header-red');
                header.classList.add('header-green');
              } else {
                cbV.checked = false;
                header.classList.remove('header-green');
                header.classList.add('header-red');
              }
            } else {
              if (!cbV.checked && !cbN.checked) {
                header.classList.remove('header-green');
                header.classList.add('header-red');
              }
            }
          });
        });
        btnOk.onclick = () => confirmValidation(cbV, cbN, btnOk);
      }
      if (btnEnviar) {
        btnEnviar.onmouseover = () => btnEnviar.style.backgroundColor = "#218838";
        btnEnviar.onmouseout = () => btnEnviar.style.backgroundColor = "#28a745";
        btnEnviar.onclick = () => {
          if(typeof confirmValidation === 'function') {
            confirmValidation(null, null, btnEnviar);
          }
        };
      }
    }
    /* ===== Destinatários (Centro de Dados → Emails Config.): volunt_verify / volunt_valid / volunt_invalid ===== */
    async function vsGetMailRecipients(corpNr, prefix) {
      const cats = [`${prefix}_mail_to`, `${prefix}_mail_cc`, `${prefix}_mail_bcc`];
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpNr}&category=in.(${cats.join(",")})&select=category,value`, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error("Não foi possível obter os destinatários (Emails Config.).");
      const rows = await res.json();
      const val = (cat) => String(rows.find(r => r.category === cat)?.value || "").split(",").map(e => e.trim()).filter(Boolean).join(", ");
      const out = {to: val(cats[0]), cc: val(cats[1]), bcc: val(cats[2])};
      if (!out.to) throw new Error("Configure os destinatários em Centro de Dados → Emails Config. → Voluntariado.");
      if (!out.cc) delete out.cc;
      if (!out.bcc) delete out.bcc;
      return out;
    }
    async function confirmValidation(cbV, cbN, btn) {
      const isDirectSend = !cbV || !cbN;
      const selected = isDirectSend ? "SEND" : (cbV.checked ? "SIM" : cbN.checked ? "NÃO" : null);
      if (!isDirectSend && !selected) {
        showPopup('popup-danger', "Por favor selecione Validado ou Não Validado.");
        return;
      }
      if (!isDirectSend) {
        cbV.disabled = true;
        cbN.disabled = true;
      }
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      const corpNr = sessionStorage.getItem("currentCorpOperNr");
      const greeting = getGreeting();
      const commanderName = await getCommanderName(corpNr);
      const MONTHS_PT = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const now = new Date();
      const reportYear = document.getElementById('vsConsYear')?.value || now.getFullYear();
      const reportMonthValue = document.getElementById('vsConsMonth')?.value || String(now.getMonth() + 1).padStart(2, '0');
      const periodText = reportMonthValue === 'todos'
        ? `no ano de ${reportYear}`
        : `no mês de ${MONTHS_PT[parseInt(reportMonthValue)]} de ${reportYear}`;
      let optelName = '';
      try {
        optelName = getOptelName();
      } catch (e) {
        console.warn("Não foi possível obter o OPTEL:", e);
      }
      if (!optelName) optelName = sessionStorage.getItem("currentUserName") || "";
      const emailValidated = {
        cat: "volunt_valid",
        subject: "Validação de Serviços Remunerados - Voluntariado",
        body: `${greeting}<br><br>
               Foi validado o formulário de serviços remunerados efetuados por elementos em regime de voluntariado.<br><br>Proceda à sua impressão em CB360 Online.<br><br>
               Com os melhores cumprimentos,<br><br>
               O Comandante,<br>
               ${commanderName}`};
      const emailNotValidated = {
        cat: "volunt_invalid",
        subject: "Inconsistências - Serviços Remunerados - Voluntariado",
        body: `${greeting}<br><br>
               O formulário de serviços remunerados efetuados por elementos em regime de voluntariado contém inconsistências.<br><br>Proceda à sua correção.<br><br>
               Com os melhores cumprimentos,<br><br>
               O Comandante,<br>
               ${commanderName}`};
      const EmailForVerification = {
        cat: "volunt_verify",
        subject: "Novo Mapa de Serviços para Validação - Voluntariado",
        body: `${greeting}<br><br>
               Venho através do presente remeter para validação o relatório de serviços de voluntariado efetuados ${periodText}.<br><br>
               Por favor aceda ao CB360 Online para validar os dados.<br><br>
               Com os melhores cumprimentos,<br><br>
               O OPTEL,<br>
               ${optelName}`};
      let emailData;
      if (isDirectSend) {
        emailData = EmailForVerification;
      } else {
        emailData = selected === "SIM" ? emailValidated : emailNotValidated;
      }
      try {
        btn.textContent = "A enviar...";
        const {cat, ...mailContent} = emailData;
        const recipients = await vsGetMailRecipients(corpNr, cat);
        const response = await fetch("https://cb360-online.vercel.app/api/prevpay_convert_and_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({action: "send-email", ...recipients, ...mailContent})
        });
        const result = await response.json();
        if (response.ok) {
          showPopup('popup-success', isDirectSend ? "Enviado para o Comando com sucesso!" : "Email de validação enviado!");
          if (isDirectSend) btn.textContent = "ENVIADO";
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Erro:", err);
        showPopup('popup-danger', "Erro ao enviar: " + err.message);
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.textContent = isDirectSend ? "ENVIAR PARA VALIDAÇÃO" : "OK";
        if (!isDirectSend) {
          cbV.disabled = false;
          cbN.disabled = false;
        }
      }
    }
    async function initializeFilters() {
      const yearSelect = document.getElementById('vsConsYear');
      const monthSelect = document.getElementById('vsConsMonth');
      const typeSelect = document.getElementById('vsConsType');
      const elementSelect = document.getElementById('vsConsElement');
      const localSelect = document.getElementById('vsConsLocal');
      if (!yearSelect || !monthSelect) return;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      let yearsHTML = '';
      for (let year = 2026; year <= 2036; year++) {
        yearsHTML += `<option value="${year}">${year}</option>`;
      }
      yearSelect.innerHTML = yearsHTML;
      const months = [{val: 'todos', name: 'Todos os Meses'}, {val: '01', name: 'Janeiro'}, {val: '02', name: 'Fevereiro'}, {val: '03', name: 'Março'}, 
                      {val: '04', name: 'Abril'}, {val: '05', name: 'Maio'}, {val: '06', name: 'Junho'}, {val: '07', name: 'Julho'}, {val: '08', name: 'Agosto'}, 
                      {val: '09', name: 'Setembro'}, {val: '10', name: 'Outubro'}, {val: '11', name: 'Novembro'}, {val: '12', name: 'Dezembro'}];
      monthSelect.innerHTML = months.map(m => `<option value="${m.val}">${m.name}</option>`).join('');
      yearSelect.value = currentYear;
      monthSelect.value = currentMonth;
      async function refreshDynamicFilters() {
        const year = yearSelect.value;
        const month = monthSelect.value;
        const corpNr = sessionStorage.getItem("currentCorpOperNr");
        if (typeSelect) typeSelect.innerHTML = '<option value="todos">A carregar...</option>';
        if (elementSelect) elementSelect.innerHTML = '<option value="todos">A carregar...</option>';
        if (localSelect) localSelect.innerHTML = '<option value="todos">A carregar...</option>';
        let dateFilter;
        if (month === 'todos') {
          dateFilter = `service_date=gte.${year}-01-01&service_date=lt.${parseInt(year) + 1}-01-01`;
        } else {
          let nextMonth = parseInt(month) + 1;
          let nextYear = parseInt(year);
          if (nextMonth > 12) {nextMonth = 1; nextYear++;}
          dateFilter = `service_date=gte.${year}-${month}-01&service_date=lt.${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
        }
        try {
          const url = `${SUPABASE_URL}/rest/v1/reg_volunteer_services?select=n_int,abv_name,service_type,service_local&corp_oper_nr=eq.${corpNr}&${dateFilter}&order=n_int.asc`;
          const response = await fetch(url, {
            method: 'GET',
            headers: getSupabaseHeaders()
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Status: ${response.status} - ${errorText}`);
          }
          const data = await response.json();
          if (!data || data.length === 0) {
            if (elementSelect) elementSelect.innerHTML = '<option value="todos">Sem elementos (período vazio)</option>';
            if (typeSelect) typeSelect.innerHTML = '<option value="todos">Sem serviços (período vazio)</option>';
            if (localSelect) localSelect.innerHTML = '<option value="todos">Sem locais (período vazio)</option>';
            return;
          }
          const uniqueElements = [...new Map(data.map(e => [e.n_int, e])).values()];
          elementSelect.innerHTML = '<option value="todos">Todos os Elementos</option>' + uniqueElements.map(e => `<option value="${e.n_int}">${e.n_int} - ${e.abv_name}</option>`).join('');
          const uniqueTypes = [...new Set(data.map(e => e.service_type))].filter(Boolean).sort();
          typeSelect.innerHTML = '<option value="todos">Todos os Tipos</option>' + uniqueTypes.map(t => `<option value="${t}">${t}</option>`).join('');
          if (localSelect) {
            const uniqueLocals = [...new Set(data.map(e => (e.service_local || '').trim()))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt'));
            localSelect.innerHTML = '<option value="todos">Todos os Locais</option>' + uniqueLocals.map(l => `<option value="${l.replace(/"/g, '&quot;')}">${l}</option>`).join('');
          }
        } catch (err) {
          console.error("ERRO CRÍTICO FILTROS:", err);
          if (elementSelect) elementSelect.innerHTML = '<option value="todos">Erro de Conexão</option>';
          if (typeSelect) typeSelect.innerHTML = '<option value="todos">Erro de Conexão</option>';
          if (localSelect) localSelect.innerHTML = '<option value="todos">Erro de Conexão</option>';
        }
      }
      const onMasterChange = async () => {
        await refreshDynamicFilters();
        loadVolunteerServicesTable();
      };
      yearSelect.onchange = onMasterChange;
      monthSelect.onchange = onMasterChange;
      if (typeSelect) typeSelect.onchange = loadVolunteerServicesTable;
      if (elementSelect) elementSelect.onchange = loadVolunteerServicesTable;
      if (localSelect) localSelect.onchange = loadVolunteerServicesTable;
      await refreshDynamicFilters();
      loadVolunteerServicesTable();
    }
    /* ============= EMISSÃO DE RELATÓRIOS ============== */
    function setVsReportButtonsState(disabled) {
      ['vsPDFReport', 'vsEXCELReport'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.disabled = disabled;
          btn.style.opacity = disabled ? '0.5' : '1';
          btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
        }
      });
    }
    async function generateVolunteerReport(format) {
      const EXTENDED_MONTHS = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const year = document.getElementById('vsConsYear').value;
      const monthValue = document.getElementById('vsConsMonth').value;
      const reportType = document.getElementById('vsReportSelect').value;
      if (!reportType || reportType.trim() === "") {
        showPopup('popup-danger', 'Selecione o Tipo de Relatório.');
        return;
      }
      if (!currentVolunteerData || currentVolunteerData.length === 0) {
        showPopup('popup-danger', 'Não existem serviços para emitir.');
        return;
      }
      const monthName = monthValue === 'todos' ? 'Anual' : (EXTENDED_MONTHS[parseInt(monthValue)] || 'Mes');
      const typesToGenerate = reportType === 'Ambos' ? ['Simplificado', 'Detalhado'] : [reportType];
      const globalTotal = currentVolunteerData.reduce((sum, item) => sum + vsToNum(item.global_value), 0);
      setVsReportButtonsState(true); // bloqueia só durante a geração
      try {
        for (const type of typesToGenerate) {
          let rows;
          if (type === 'Detalhado') {
            rows = [...currentVolunteerData];
          } else {
            const grouped = {};
            currentVolunteerData.forEach(item => {
              const key = item.n_int;
              if (!grouped[key]) {
                grouped[key] = {n_int: item.n_int, abv_name: item.abv_name, total: 0};
              }
              grouped[key].total += vsToNum(item.global_value);
            });
            rows = Object.values(grouped);
          }
          rows.sort((a, b) => (parseInt(a.n_int) || 0) - (parseInt(b.n_int) || 0));
          const tipoFicheiro = format === 'pdf' ? 'PDF' : 'EXCEL';
          showLoadingPopup(`A gerar relatório ${type} em ${tipoFicheiro}...`);
          try {
            const response = await fetch('https://cb360-online.vercel.app/api/prevpay_convert_and_send', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({action: 'generate-report', rows, year, month: monthValue, format, globalTotal, reportType: type})
            });
            if (!response.ok) throw new Error(`Falha na API`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const reportSuffix = type.toLowerCase();
            const extension = format === 'pdf' ? 'pdf' : 'xlsx';
            a.download = `pagamento_${reportSuffix}_${monthName}_${year}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            if (reportType === 'Ambos' && type === 'Simplificado') {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (e) {
            console.error("Erro:", e);
            showPopup('popup-danger', `Erro ao gerar ${type}: ` + e.message);
            break;
          }
        }
      } finally {
        hideLoadingPopup();
        setVsReportButtonsState(!currentVolunteerData || currentVolunteerData.length === 0);
      }
    }
    document.getElementById('vsPDFReport').addEventListener('click', async function () {
      await generateVolunteerReport('pdf');
    });
    document.getElementById('vsEXCELReport').addEventListener('click', async function () {
      await generateVolunteerReport('excel');
    });
    /* ====== CONFIGURAÇÃO DE VALORES ===== */
    let currentEditingValueId = null;
    async function saveVolunteerServiceValue() {
      const btn = document.getElementById('services-values-save-button');
      const lcDesteny = document.getElementById('vsLCDesteny').value.trim();
      const lcValue = document.getElementById('vsLCValue').value.trim();
      const lcESick = document.getElementById('vsLCESick').value.trim();
      const lcEHour = document.getElementById('vsLCEHour').value.trim();
      const oType = document.getElementById('vsOType').value.trim();
      const oValue = document.getElementById('vsOValue').value.trim();
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (lcDesteny && oType) {
        showPopup('popup-danger', 'Preencha apenas um lado: Longo Curso OU Prevenções/Outros.');
        return;
      }
      if (!lcDesteny && !oType) {
        showPopup('popup-danger', 'Por favor preencha pelo menos um dos campos.');
        return;
      }
      let payload = {};
      if (lcDesteny) {
        if (!lcValue) {
          showPopup('popup-danger', 'Por favor preencha o Valor do Longo Curso.');
          return;
        }
        payload = {type: 'TRANSPORTE DE DOENTES', desteny: lcDesteny, value: lcValue, extra_sick: lcESick || null, extra_hour: lcEHour || null, corp_oper_nr: corpOperNr};
      } else {
        if (!oValue) {
          showPopup('popup-danger', 'Por favor preencha o Valor/Hora.');
          return;
        }
        payload = {type: oType, value: oValue, desteny: null, extra_sick: null, extra_hour: null, corp_oper_nr: corpOperNr};
      }
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 5px;"></i>A processar...';
      try {
        let response;
        if (currentEditingValueId) {
          response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?id=eq.${currentEditingValueId}`, {
            method: 'PATCH',
            headers: getSupabaseHeaders({returnRepresentation: true}),
            body: JSON.stringify(payload)
          });
        } else {
          const checkUrl = `${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?type=eq.${encodeURIComponent(payload.type)}&desteny=eq.${payload.desteny ?? ''}&corp_oper_nr=eq.${payload.corp_oper_nr}&select=id`;
          const checkRes = await fetch(checkUrl, {headers: getSupabaseHeaders()});
          const existing = await checkRes.json();
          if (existing.length > 0) {
            showPopup('popup-danger', 'Já existe um registo para este tipo e destino.');
            btn.disabled = false;
            btn.innerHTML = originalText;
            return;
          }
          response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values`, {
            method: 'POST',
            headers: getSupabaseHeaders({returnRepresentation: true}),
            body: JSON.stringify(payload)
          });
        }
        if (!response.ok) throw await response.json();
        showPopup('popup-success', currentEditingValueId ? 'Registo atualizado!' : 'Valor guardado com sucesso!');
        clearServiceValuesForm();
      } catch (err) {
        console.error('Erro:', err);
        showPopup('popup-danger', 'Erro ao processar o pedido.');
        btn.innerHTML = originalText;
      } finally {
        btn.disabled = false;
      }
    }
    function editServiceValue(itemJson) {
      const item = JSON.parse(decodeURIComponent(itemJson));
      currentEditingValueId = item.id;
      ['vsLCDesteny', 'vsLCValue', 'vsLCESick', 'vsLCEHour', 'vsOType', 'vsOValue'].forEach(id => document.getElementById(id).value = '');
      if (item.type === 'TRANSPORTE DE DOENTES') {
        document.getElementById('vsLCDesteny').value = item.desteny || '';
        document.getElementById('vsLCValue').value = item.value || '';
        document.getElementById('vsLCESick').value = item.extra_sick || '';
        document.getElementById('vsLCEHour').value = item.extra_hour || '';
      } else {
        document.getElementById('vsOType').value = item.type || '';
        document.getElementById('vsOValue').value = item.value || '';
      }
      const btn = document.getElementById('services-values-save-button');
      btn.innerHTML = '<i class="fa-solid fa-pen-to-square" style="margin-right: 5px;"></i>Atualizar';
      btn.classList.remove('btn-add');
      btn.classList.add('btn-danger');
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
    const svValuesTableHTML = `
      <div style="margin: 10px 0 15px 0;">
        <div class="no-scrollbar" style="max-height: 400px; overflow-y: auto; border: 1px solid #aaa; border-radius: 4px;">
          <table style="width:100%; border-collapse: separate; border-spacing: 0; font-family: sans-serif; font-size: 11px; text-align: center; table-layout: fixed;">
            <colgroup>
              <col style="width: 180px;">
              <col style="width: 140px;">
              <col style="width: 80px;">
              <col style="width: 80px;">
              <col style="width: 80px;">
              <col style="width: 70px;">
            </colgroup>
            <thead>
              <tr>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-bottom:1px solid #aaa; padding:6px;">Tipo</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Destino</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Valor</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Extra Doente</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Hora Espera</th>
                <th style="position:sticky; top:0; z-index:10; background-color:#2b6ca3; color:white; border-left:1px solid #aaa; border-bottom:1px solid #aaa; padding:6px;">Ações</th>
              </tr>
            </thead>
            <tbody id="sv-values-table-body">
              <tr><td colspan="6" style="padding: 20px;">A carregar...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    async function loadServiceValuesTable() {
      const container = document.getElementById('sv-values-table-container');
      if (!container) return;
      if (!document.getElementById('sv-values-table-body')) {
        container.innerHTML = svValuesTableHTML;
      }
      const tbody = document.getElementById('sv-values-table-body');
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      tbody.style.opacity = '0.5';
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?corp_oper_nr=eq.${corpOperNr}&order=type.asc,desteny.asc`, {
          headers: getSupabaseHeaders()
        });
        const data = await response.json();
        tbody.style.opacity = '1';
        if (data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;">Nenhum registo configurado.</td></tr>';
          return;
        }
        const tdStyle = `border-bottom: 1px solid #ccc; padding: 6px; font-size: 12px;`;
        tbody.innerHTML = data.map(item => {
          const itemData = encodeURIComponent(JSON.stringify(item));
          return `
            <tr>
              <td style="${tdStyle}">${item.type || ''}</td>
              <td style="${tdStyle} border-left:1px solid #ccc;">${item.desteny || '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc; text-align:right;">${item.value ? item.value + ' €' : '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc; text-align:right;">${item.extra_sick ? item.extra_sick + ' €' : '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc; text-align:right;">${item.extra_hour ? item.extra_hour + ' €' : '-'}</td>
              <td style="${tdStyle} border-left:1px solid #ccc;">
                <button onclick="editServiceValue('${itemData}')" class="btn btn-add" style="padding: 3px 7px; font-size: 12px; line-height: 1;" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteServiceValue(${item.id})" class="btn btn-danger" style="padding: 3px 7px; font-size: 12px; line-height: 1; margin-left: 5px;" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `;
        }).join('');
      } catch (err) {
        tbody.style.opacity = '1';
        tbody.innerHTML = '<tr><td colspan="6" style="padding:20px; color:red;">Erro ao carregar dados.</td></tr>';
      }
    }
    async function deleteServiceValue(id) {
      if (!confirm('Tem a certeza que pretende eliminar este registo?')) return;
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_volunteer_services_values?id=eq.${id}`, {
          method: 'DELETE',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error();
        showPopup('popup-success', 'Registo eliminado!');
        loadServiceValuesTable();
      } catch (err) {
        showPopup('popup-danger', 'Erro ao eliminar.');
      }
    }
    function clearServiceValuesForm() {
      currentEditingValueId = null; 
      ['vsLCDesteny', 'vsLCValue', 'vsLCESick', 'vsLCEHour', 'vsOType', 'vsOValue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const btn = document.getElementById('services-values-save-button');
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-right: 5px;"></i>Guardar';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-add'); 
      }
      loadServiceValuesTable();
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('services-values-save-button')?.addEventListener('click', saveVolunteerServiceValue);
      loadServiceValuesTable();
    });
