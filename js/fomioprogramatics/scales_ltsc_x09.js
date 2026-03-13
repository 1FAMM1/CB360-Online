    /* =======================================
    SCALES MODULE
    ======================================= */
    /* ─── CONSTANTS ─────────────────────────────────────────── */
    const TITLE_MAIN_STYLE = "text-align:center;margin-top:30px;background:#ffcccc;padding:8px;font-weight:bold;font-size:18px;";
    const TITLE_SUB_STYLE = "text-align:center;margin-bottom:5px;margin-top:-15px;font-size:14px;background:#ffcccc;padding:6px;";
    const TITLE_MONTHYEAR_STYLE = "text-align:center;margin-bottom:-15px;font-size:14px;font-weight:bold;background:#ffffcc;padding:6px;";
    const COMMON_TH_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;width:35px;padding:2px;font-size:11px;text-align:center;background:#f0f0f0;";
    const COMMON_THTOTAL_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;padding:2px;text-align:center;font-size:10px;width:30px;";
    const COMMON_TD_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;padding:4px;text-align:center;font-size:13px;width:35px;";
    const COMMON_TDSPECIAL_STYLE = "font-weight:bold;font-size:15px;background:#2b284f;color:#cfcfcf;height:12px;line-height:12px;";
    const COMMON_TDTOTAL_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;padding:4px;width:30px;text-align:center;font-weight:bold;";
    const COMMON_TDLABEL_STYLE = "border:1px solid #ccc;border-top:0;border-bottom:0;border-left:0;padding:4px;width:30px;text-align:center;font-weight:bold;";
    const TABLE_STYLE = "margin-top:10px;border-collapse:separate;border-spacing:0 5px;font-size:12px;text-align:center;margin-left:auto;margin-right:auto;";
    const TD_CODE_STYLE = "border:1px solid #ccc;font-weight:bold;padding:4px 6px;width:40px;white-space:nowrap;";
    const TD_DESC_STYLE = "border:1px solid #ccc;background:#fff;padding:4px 6px;width:110px;text-align:left;font-size:13px;white-space:nowrap;border-left:0;";
    const TD_SPACER_STYLE = "width:5px;";
    const MAX_COLS_PER_ROW = 30;
    const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
    const SCALES_MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const WEEKEND_COLOR = "#f9e0b0";
    const BLOCKED_MONTHS_DECIR = [0,1,2,3,10,11];
    const CELL_COLORS = {PD:{background:"#2fc41a",color:"#fff"}, PN:{background:"#add8e6",color:"#000"}, PT:{background:"#183b7a",color:"#fff"},
                         BX:{background:"#ed1111",color:"#fff"}, FO:{background:"#b3b3b3",color:"#000"}, FE:{background:"#995520",color:"#fff"},
                         FD:{background:"#519294",color:"#fff"}, FN:{background:"#4f1969",color:"#fff"}, ED:{background:"#b6fcb6",color:"#000"},
                         EN:{background:"#1e3a8a",color:"#fff"}, ET:{background:"#006400",color:"#fff"}, EP:{background:"#ff9800",color:"#000"},
                         N: {background:"#383838",color:"#fff"}};
    const CONFLICT_MESSAGES = {DECIR_TO_PIQUETE: "Elemento já escalado para serviço de Piquete, selecione apenas ED ou solicite ao Chefe de Secção a remoção do elemento do serviço de Piquete!",
                               PIQUETE_TO_DECIR: "Elemento já escalado para serviço de DECIR, selecione outro dia ou solicite ao responsável pela escala de DECIR a remoção do elemento do serviço de DECIR!"};
    const DECIR_LEGEND  = [{code:"ED",desc:"ECIN Dia"},{code:"EN",desc:"ECIN Noite"},{code:"ET",desc:"ECIN 24 Hrs."}];
    const ESCALA_LEGEND = [{code:"PD",desc:"Piquete Dia"},{code:"PN",desc:"Piquete Noite"},{code:"PT",desc:"Piquete 24 Hrs."},
                           {code:"BX",desc:"Baixa"},{code:"FE",desc:"Férias"},{code:"FO",desc:"Formação"},{code:"FD",desc:"Estágio Dia"},{code:"FN",desc:"Estágio Noite"}];
    const ECIN_EXTRA = [{code:"ED",desc:"ECIN Dia"},{code:"EN",desc:"ECIN Noite"},{code:"ET",desc:"ECIN 24 Hrs."},{code:"EP",desc:"ECIN D\\Piquete N"}];
    /* ─── STATE ──────────────────────────────────────────────── */
    let currentSection  = "1ª Secção";
    let currentTableData = [];
    const yearAtual = new Date().getFullYear();
    /* ─── HELPERS ────────────────────────────────────────────── */
    const getCorpId = () => sessionStorage.getItem('currentCorpOperNr') || "0805";
    async function supabaseFetch(path, opts = {}) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: getSupabaseHeaders(), ...opts });
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      return res.json();
    }
    function atNoonLocal(y, mIndex, d) {
      return new Date(y, mIndex, d, 12, 0, 0, 0);
    }
    function addDays(baseDate, days) {
      const d = new Date(baseDate);
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + days);
      return d;
    }
    /* ─── HOLIDAYS ───────────────────────────────────────────── */
    function getPortugalHolidays(year) {
      const fixed = [{month:1,day:1,name:"Ano Novo"},{month:4,day:25,name:"Dia da Liberdade"},{month:5,day:1,name:"Dia do Trabalhador"},
                     {month:6,day:10,name:"Dia de Portugal"},{month:8,day:15,name:"Assunção de Nossa Senhora"},{month:9,day:7,name:"Dia da Cidade de Faro"},
                     {month:10,day:5,name:"Implantação da República"},{month:11,day:1,name:"Todos os Santos"},{month:12,day:1,name:"Restauração da Independência"},
                     {month:12,day:8,name:"Imaculada Conceição"},{month:12,day:25,name:"Natal"}];
      const a=year%19, b=Math.floor(year/100), c=year%100, d=Math.floor(b/4), e=b%4;
      const f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30;
      const i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451);
      const month=Math.floor((h+l-7*m+114)/31), day=((h+l-7*m+114)%31)+1;
      const easter = atNoonLocal(year, month-1, day);
      const mobile = [{date:addDays(easter,-47),name:"Carnaval",optional:true},{date:addDays(easter,-2),name:"Sexta-feira Santa",optional:false},
                      {date:easter,name:"Páscoa",optional:false},{date:addDays(easter,60),name:"Corpo de Deus",optional:false}];
      return [...fixed.map(h => ({date:atNoonLocal(year,h.month-1,h.day),name:h.name,optional:false})), ...mobile];
    }
    /* ─── CELL COLOR ─────────────────────────────────────────── */
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
    /* ─── TOTAL CALCULATIONS ─────────────────────────────────── */
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
        if (totalCell) {totalCell.textContent = dayTotal; applyTotalCellStyle(totalCell, dayTotal, section === "DECIR");}
      }
    }
    /* ─── SUMMARY ROWS (ML / MP / TAS) ──────────────────────── */
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
        const dia = makeSummaryRow(tbody, "mp-dia-row",   "Motoristas de Pesados Turno D", "#fde8a3", "#fde8a390", "mp-dia");
        const noite = makeSummaryRow(tbody, "mp-noite-row", "Motoristas de Pesados Turno N", "#466c9a", "#466c9a50", "mp-noite");
        showHideCells(dia,   "mp-dia",   daysInMonth);
        showHideCells(noite, "mp-noite", daysInMonth);
      } else {
        const row = makeSummaryRow(tbody, "mp-row", "Motoristas de Pesados", "#fde8a3", "#fde8a390", "mp");
        showHideCells(row, "mp", daysInMonth);
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
        const mpDia = tbody.querySelector(".mp-dia-row");
        const mpNoite = tbody.querySelector(".mp-noite-row");
        if (!mpDia || !mpNoite) return;
        for (let d = 1; d <= daysInMonth; d++) {
          let dia = 0, noite = 0;
          tbody.querySelectorAll("tr:not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.fixed-row)").forEach(tr => {
            const nInt = parseInt(tr.getAttribute("data-nint"), 10);
            const person = data.find(item => parseInt(item.n_int, 10) === nInt);
            if (!person?.MP) return;
            const td = tr.querySelector(`.day-cell-${d}`);
            if (!td || td.style.display === "none") return;
            const v = td.textContent.toUpperCase().trim();
            if (v === "ED") dia++; else if (v === "EN") noite++; else if (v === "ET") {dia++; noite++;}
          });
          const cDia = mpDia.querySelector(`.mp-dia-${d}`); if (cDia) cDia.textContent = dia;
          const cNoite = mpNoite.querySelector(`.mp-noite-${d}`); if (cNoite) cNoite.textContent = noite;
        }
      } else {
        calculateSummaryRow(tbody, daysInMonth, data, "mp-row", "mp", p => p.MP === true, v => ["PD","PN","PT","EP"].includes(v) ? 1 : 0);
      }
    }
    /* ─── TOTALS ROW ─────────────────────────────────────────── */
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
    /* ─── CONFLICT CHECK ─────────────────────────────────────── */
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
    /* ─── KEYBOARD NAVIGATION ────────────────────────────────── */
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
    /* ─── CELL COLOR HELPERS ─────────────────────────────────── */
    function getCellBg(d, month, holidays) {
      const date = new Date(0, month - 1, d);
      const holiday = holidays?.find(h => h.date.getDate() === d && h.date.getMonth() === month - 1);
      if (holiday) return {bg: holiday.optional ? "#2ecc71" : "#ffcccc", color: holiday.optional ? "#fff" : "#000"};
      if (date.getDay() === 0 || date.getDay() === 6) return {bg: WEEKEND_COLOR, color: "#000"};
      return { bg: "transparent", color: "#000" };
    }
    /* ─── DAY CELL — NORMAL ROW ──────────────────────────────── */
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
          showPopupWarning(conflictMsg); td.textContent = ""; setInitialColor();
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
        if (value.length === 2) {const next = td.nextElementSibling; if (next?.contentEditable === "true") next.focus();}
      });
      td.addEventListener("keydown", e => handleKeyNav(e, td, tr));
      td.addEventListener("blur", () => {savedMap[`${String(parseInt(tr.getAttribute("data-nint"),10)).padStart(3,"0")}_${d}`] = td.textContent.toUpperCase().slice(0,2);});
      return td;
    }
    /* ─── DAY CELL — FIXED ROW ───────────────────────────────── */
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
    /* ─── TABLE STRUCTURE ────────────────────────────────────── */
    function createTableHeaders(container, year, month, section) {
      const h2 = document.createElement("h2");
      h2.textContent = "ESCALA DE SERVIÇO"; h2.style.cssText = TITLE_MAIN_STYLE;
      container.appendChild(h2);
      if (section !== "Emissão Escala" && section !== "Consultar Escalas") {
        const h3 = document.createElement("h3");
        h3.textContent = section ? section.toUpperCase() : ""; h3.style.cssText = TITLE_SUB_STYLE;
        container.appendChild(h3);
      }
      const h3m = document.createElement("h3");
      h3m.textContent = `${MONTH_NAMES[month-1]} ${year}`; h3m.style.cssText = TITLE_MONTHYEAR_STYLE;
      container.appendChild(h3m);
    }
    function createTableWrapper(container) {
      let wrapper = container.querySelector(".table-container");
      if (!wrapper) {wrapper = document.createElement("div"); wrapper.className = "table-container"; container.appendChild(wrapper);}
      wrapper.innerHTML = "";
      Object.assign(wrapper.style, {position:"relative", maxHeight:"75vh", height:"370px", overflowY:"auto"});
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
    /* ─── DAY HEADERS ────────────────────────────────────────── */
    function updateDayHeaders(table, year, month, daysInMonth, holidays) {
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
    /* ─── FIXED ROWS ─────────────────────────────────────────── */
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
    /* ─── DATA ROWS ──────────────────────────────────────────── */
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
    /* ─── MAIN TABLE FUNCTION ────────────────────────────────── */
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
      updateDayHeaders(table, year, month, daysInMonth, holidays);
      const sectionToLoad = currentSection === "Consultar Escalas" ? "Emissão Escala" : currentSection;
      const savedMap = await loadSavedData(sectionToLoad, year, month);
      const tbody = table.querySelector("tbody");
      const isEscala = currentSection === "Emissão Escala" || currentSection === "Consultar Escalas";
      if (isEscala) createFixedRows(tbody, data, savedMap, year, month, daysInMonth, currentSection, calculateVolunteersRowTotal, calculateColumnTotals, holidays);
      createDataRows(tbody, data, savedMap, year, month, daysInMonth, currentSection, calculateVolunteersRowTotal, calculateColumnTotals, holidays);
      const needsMP = ["DECIR","1ª Secção","2ª Secção","Emissão Escala"].includes(currentSection);
      const needsTAS = ["1ª Secção","2ª Secção","Emissão Escala"].includes(currentSection);
      if (needsMP) createMPRows(tbody, daysInMonth, currentSection);
      if (needsTAS) createTASRows(tbody, daysInMonth);
      if (currentSection === "Emissão Escala") createMLRow(tbody, daysInMonth);
      if (needsMP) calculateMPTotals(tbody, daysInMonth, data, currentSection);
      if (needsTAS) calculateTASTotals(tbody, daysInMonth, data);
      if (currentSection === "Emissão Escala") {
        calculateMLTotals(tbody, daysInMonth, data); calculateMPTotals(tbody, daysInMonth, data, currentSection); calculateTASTotals(tbody, daysInMonth, data);}
      createTotalsRow(tbody, daysInMonth);
      calculateColumnTotals(tbody, currentSection, daysInMonth);
    }
    /* ─── LEGEND ─────────────────────────────────────────────── */
    function createLegendScale(containerId, legendItems) {
      const container = $(containerId);
      if (!container) return;
      container.querySelector(".legend-scale")?.remove();
      const table = document.createElement("table");
      table.className = "legend-scale"; table.style.cssText = TABLE_STYLE;
      let tr = document.createElement("tr"), colCount = 0;
      legendItems.forEach((item, i) => {
        const tdCode = document.createElement("td"); tdCode.textContent = item.code; tdCode.style.cssText = TD_CODE_STYLE; updateCellColor(tdCode, item.code, new Date());
        const tdDesc = document.createElement("td"); tdDesc.textContent = item.desc; tdDesc.style.cssText = TD_DESC_STYLE;
        tr.append(tdCode, tdDesc); colCount += 2;
        if (i < legendItems.length - 1) { const tdSpacer = document.createElement("td"); tdSpacer.style.cssText = TD_SPACER_STYLE; tr.appendChild(tdSpacer); colCount++;}
        if (colCount >= MAX_COLS_PER_ROW) {table.appendChild(tr); tr = document.createElement("tr"); colCount = 0; }
      });
      if (tr.children.length > 0) table.appendChild(tr);
      container.appendChild(table);
    }
    function handleLegend(containerId) {
      const items = currentSection === "DECIR" ? DECIR_LEGEND
        : (currentSection === "Emissão Escala" || currentSection === "Consultar Escalas") ? ESCALA_LEGEND.concat(ECIN_EXTRA)
        : ESCALA_LEGEND;
      createLegendScale(containerId, items);
    }
    /* ─── LOADERS ────────────────────────────────────────────── */
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
    /* ─── MONTH BUTTONS ──────────────────────────────────────── */
    function createMonthButtons(containerId, tableContainerId, year) {
      const container = $(containerId);
      if (!container) return;
      const saveBtn = $("save-button");
      const emitBtn = $("emit-button");
      container.innerHTML = "";
      if (emitBtn) emitBtn.style.marginTop = "20px";
      const mainWrapper = document.createElement("div");
      Object.assign(mainWrapper.style, {display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"});
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
      const toggleButtons = (showSave, showEmit) => {
        if (saveBtn) saveBtn.style.display = showSave ? "inline-block" : "none";
        if (emitBtn) emitBtn.style.display = showEmit ? "inline-block" : "none";
      };
      SCALES_MONTH_NAMES.forEach((month, index) => {
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
            showPopupWarning(`⛔ Durante o mês de ${month}, não existe DECIR. Salvo prolongamento ou antecipação declarados pela ANEPC.`); return;
          }
          monthsWrapper.querySelectorAll(".btn.btn-add").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          if (currentSection === "Emissão Escala") toggleButtons(true, true);
          else if (currentSection === "Consultar Escalas") toggleButtons(false, false);
          else toggleButtons(true, false);
          const data = await loadSectionData();
          createMonthTable(tableContainerId, selectedYear, index + 1, data);
          handleLegend(tableContainerId);
        });
        monthsWrapper.appendChild(btn);
      });
      yearSelect.addEventListener("change", () => {
        createMonthButtons(containerId, tableContainerId, parseInt(yearSelect.value, 10));
        const tc = $(tableContainerId); if (tc) tc.innerHTML = "";
        if (saveBtn) saveBtn.style.display = "none";
        if (emitBtn) emitBtn.style.display = "none";
      });
      mainWrapper.append(yearContainer, monthsWrapper);
      container.appendChild(mainWrapper);
      setTimeout(() => { yearSelect.value = targetYear; }, 0);
    }
    /* ─── SIDEBAR HANDLERS ───────────────────────────────────── */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page, access = btn.dataset.access;
        if (page === "page-scales") {
          const header = $("scales-card-header");
          if (header) header.textContent = access === "Emissão Escala" ? "EMISSÃO DE ESCALAS"
            : access === "Consultar Escalas" ? "CONSULTA DE ESCALAS"
            : `ESCALA DE SERVIÇO ${access.toUpperCase()}`;
        }
      });
    });
    function initSidebarSecaoButtons() {
      document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
        btn.addEventListener("click", async () => {
          currentSection = btn.getAttribute("data-access");
          createMonthButtons("months-container", "table-container", yearAtual);
          $("table-container").innerHTML = "";
          document.querySelectorAll(".btn.btn-add").forEach(b => b.classList.remove("active"));
          const saveButton = $("save-button"), emitButton = $("emit-button");
          if (saveButton) saveButton.style.display = "none";
          if (emitButton) emitButton.style.display = "none";
        });
      });
    }
    /* ─── INIT ───────────────────────────────────────────────── */
    document.addEventListener("DOMContentLoaded", () => {
      createMonthButtons("months-container", "table-container", yearAtual);
      initSidebarSecaoButtons();
      initSaveButton();
      const emitBtn = $("emit-button");
      if (emitBtn) emitBtn.addEventListener("click", () => {if (currentSection === "Emissão Escala") initScaleEmission();});
    });
    /* ─── SAVE ───────────────────────────────────────────────── */
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
      const toInsert=[], toUpdate=[], toDelete=[];
      table.querySelectorAll("tr.fixed-row").forEach(row => {
        const fixedId = row.getAttribute("data-fixed");
        if (!["1","2","3"].includes(fixedId) || row.cells.length < 10) return;
        const n_int = fixedId==="1"?3:fixedId==="2"?4:9;
        const abv_name = row.cells[1]?.textContent.trim() || "FIXO";
        for (let d=3; d<row.cells.length-1; d++) {
          const value = row.cells[d]?.textContent.toUpperCase().slice(0,1).trim();
          const day = d-2, key = `${n_int}_${day}`, existingVal = savedMap[key];
          const existingValue = typeof existingVal==='object' ? existingVal?.value : existingVal;
          const existingSection = typeof existingVal==='object' ? existingVal?.section : "Emissão Escala";
          if (existingValue) {
            if (!value) toDelete.push({n_int, day, section:existingSection});
            else if (existingValue.toUpperCase() !== value) toUpdate.push({n_int, day, value, section:existingSection});
          } else if (value) toInsert.push({n_int, abv_name, day, value, section:"Emissão Escala"});
        }
      });
      const normalRows = table.querySelectorAll("tr:not(.fixed-row):not(.totals-row):not(.mp-dia-row):not(.mp-noite-row):not(.mp-row):not(.tas-row)");
      normalRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const n_int = parseInt(cells[0]?.textContent, 10);
        if (isNaN(n_int)) return;
        const abv_name = cells[1]?.textContent;
        const person = currentTableData.find(item => parseInt(item.n_int,10) === n_int);
        const elemSection = person?.section || "Emissão Escala";
        for (let d=3; d<cells.length-1; d++) {
          const value = cells[d]?.textContent.toUpperCase().slice(0,2).trim();
          const day = d-2, key = `${n_int}_${day}`, existingVal = savedMap[key];
          const existingValue = typeof existingVal==='object' ? existingVal?.value : existingVal;
          const existingSection = typeof existingVal==='object' ? existingVal?.section : elemSection;
          if (existingValue) {
            if (!value) toDelete.push({n_int, day, section:existingSection});
            else if (existingValue.toUpperCase() !== value) toUpdate.push({n_int, day, value, section:existingSection});
          } else if (value) toInsert.push({n_int, abv_name, day, value, section:elemSection});
        }
      });
      return {toInsert, toUpdate, toDelete};
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
        saveBtn.disabled = true; saveBtn.textContent = "A guardar...";
        try {
          const monthIndex = getActiveMonthIndex();
          if (!monthIndex) throw new Error("Nenhum mês selecionado.");
          const savedMap = await fetchSavedData(currentSection, selectedYear, monthIndex);
          const changes = currentSection === "Emissão Escala" ? diffFixedRowsChanges(table, savedMap) : diffTableChanges(table, savedMap);
          await saveChanges({...changes, section:currentSection, year:selectedYear, month:monthIndex});
          showPopupSuccess("✅ Escala gravada com sucesso!");
        } catch (err) {console.error(err); alert("❌ Erro ao salvar a tabela: " + err.message);}
        finally {saveBtn.disabled=false; saveBtn.textContent="Guardar Escala";}
      });
    }
    /* ─── EMIT SCALE ─────────────────────────────────────────── */
    async function initScaleEmission() {
      const table = document.querySelector(".month-table tbody");
      if (!table) return;
      const saveBtn = $("save-button-emissao");
      if (saveBtn) {saveBtn.disabled=true; saveBtn.textContent="A guardar...";}
      try {
        const selectedYear = parseInt($("year-selector")?.value, 10);
        if (!selectedYear) throw new Error("Year selector não encontrado");
        const monthIndex = getActiveMonthIndex();
        if (!monthIndex) throw new Error("Nenhum mês selecionado.");
        const corp_oper_nr = getCorpId();
        const savedMap = await fetchSavedData(currentSection, selectedYear, monthIndex);
        const changes = diffFixedRowsChanges(table, savedMap);
        await saveChanges({...changes, section:currentSection, year:selectedYear, month:monthIndex});
        try {
          const nomeMes = SCALES_MONTH_NAMES[parseInt(monthIndex)-1];
          const respUsers = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp_oper_nr}&elem_state=eq.true&select=n_int`, {headers: getSupabaseHeaders()});
          const activeUsers = await respUsers.json();
          if (activeUsers.length > 0) {
            const now = new Date().toISOString();
            const msgNotif = `📅 A escala de Serviço para ${nomeMes}/${selectedYear} foi emitida. Consulta a área "Escalas"!`;
            await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
              method:'POST', headers:getSupabaseHeaders(),
              body: JSON.stringify(activeUsers.map(u => ({n_int:u.n_int, corp_oper_nr, title:"Escala Emitida", message:msgNotif, is_read:false, created_at:now})))
            });
            try {
              await fetch('https://cb-360-app.vercel.app/api/sendPush', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({recipient_nint:'geral', corp_nr:corp_oper_nr, sender_name:'CB360 Online', message_text:msgNotif, sender_nint:'0'})
              });
            } catch (errPush) {console.error('Erro ao enviar push:', errPush);}
          }
        } catch (errNotif) {console.error("Erro no fluxo de notificações:", errNotif);}
        showPopupSuccess("✅ Escala emitida com sucesso! Por favor aguarde uns breves segundos pelo download automático. Obrigado.");
        await exportScheduleToExcel(table, selectedYear, monthIndex);
      } catch (err) {console.error(err); alert("❌ Erro ao salvar as linhas fixas: " + err.message);}
      finally {if (saveBtn) {saveBtn.disabled=false; saveBtn.textContent="Guardar Emissão";}}
    }
    /* ─── EXCEL EXPORT ───────────────────────────────────────── */
    async function exportScheduleToExcel(tbody, year, month) {
      const fileName = `Escala FOMIO ${SCALES_MONTH_NAMES[month-1]} ${year}`;
      const daysInMonth = new Date(year, month, 0).getDate();
      const table = tbody.parentElement;
      const holidays = getPortugalHolidays(year);
      const mesIdx = month - 1;
      const holidayDays  = holidays.filter(h => !h.optional && h.date.getMonth()===mesIdx).map(h => h.date.getDate());
      const optionalDays = holidays.filter(h =>  h.optional && h.date.getMonth()===mesIdx).map(h => h.date.getDate());
      const weekdays = [];
      for (let d=1; d<=daysInMonth; d++) weekdays.push(table.querySelector(`.day-header-${d}`)?.textContent.trim() || "");
      const fixedRows = [];
      tbody.querySelectorAll("tr.fixed-row").forEach(tr => {
        if (tr.cells.length <= 1) return;
        const rowData = {ni:tr.cells[0].textContent.trim(), nome:tr.cells[1].textContent.trim(), catg:tr.cells[2].textContent.trim(), days:{}};
        for (let d=1; d<=daysInMonth; d++) rowData.days[d] = tr.querySelector(`.fixed-day-cell-${d}`)?.textContent.trim() || "";
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
      const payload = {year, month, monthName:SCALES_MONTH_NAMES[month-1], fileName, daysInMonth, weekdays, fixedRows, normalRows, holidayDays, optionalDays};
      try {
        const response = await fetch('https://cb360-online.vercel.app/api/scales_convert', {
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
        });
        if (response.ok) {
          const url = URL.createObjectURL(await response.blob());
          const a = document.createElement("a"); a.href=url; a.download=`${fileName}.pdf`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
          if (typeof showPopupSuccess==='function') showPopupSuccess(`✅ PDF gerado com sucesso!`);
        } else {
          const err = await response.json().catch(()=>({}));
          alert(`Erro: ${err.error||'Erro no servidor'}`);
        }
      } catch (error) {console.error("Erro:", error); alert(`❌ Erro de ligação ao serviço.`);}
    }
