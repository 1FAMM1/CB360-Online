    /* =======================================
   DECIR PROGRAMATICS — REFACTORED
   ======================================= */

/* ─── CONSTANTS ─────────────────────────────────────────── */
const MONTH_NAMES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTH_NAMES_UPPER = MONTH_NAMES_PT.map(m => m.toUpperCase());
const BLOCKED_MONTHS_DEFAULT = [0,1,2,3,10,11];
const CORP = () => sessionStorage.getItem("currentCorpOperNr") || "0805";

/* ─── HELPERS ────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const parseCurrency = txt => !txt ? 0 : parseFloat(txt.replace('€','').replace(/\s/g,'').replace(/\./g,'').replace(',','.')) || 0;
const parseVal   = id => parseFloat(($( id)?.value||"0").replace(",",".")) || 0;
const formatCurrency = v => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
const formatNumber   = v => new Intl.NumberFormat('pt-PT',{minimumFractionDigits:0,maximumFractionDigits:0}).format(v);

async function supabaseFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: getSupabaseHeaders(), ...opts });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json();
}

function makeWrapper(container) {
  if (typeof createTableWrapper === 'function') return createTableWrapper(container);
  const w = document.createElement("div");
  Object.assign(w.style, {maxHeight:"380px", overflowY:"auto", height:"380px"});
  container.appendChild(w);
  return w;
}

function makeTh(txt, cssExtra = "", style = {}) {
  const th = document.createElement("th");
  th.innerHTML = txt;
  th.style.cssText = COMMON_TH_STYLE + cssExtra;
  Object.assign(th.style, style);
  return th;
}

function makeTd(txt = "", cssExtra = "") {
  const td = document.createElement("td");
  td.textContent = txt;
  td.style.cssText = COMMON_TD_STYLE + cssExtra;
  return td;
}

function makeTitle(text, bg = "#3ac55b") {
  const h = document.createElement("h3");
  h.textContent = text;
  Object.assign(h.style, {textAlign:"center",margin:"20px 0 -15px 0",background:bg,height:"30px",borderRadius:"3px",lineHeight:"30px",padding:"0 8px"});
  return h;
}

/* ─── SIDEBAR BUTTON — MODAL CONFIG ─────────────────────── */
document.querySelectorAll(".sidebar-submenu-button").forEach(btn => {
  btn.addEventListener("click", e => {
    if (btn.getAttribute("data-access") === "Atualização de Valores") {
      e.preventDefault(); e.stopPropagation();
      openConfigDecirModal();
    }
  });
});

async function openConfigDecirModal() {
  $('modalConfigDecir').classList.add('show');
  try {
    const data = await supabaseFetch(`decir_values_config?corp_oper_nr=eq.${CORP()}`);
    if (data?.length) {
      $('amal_value').value = data[0].amal_value;
      $('anepc_value').value = data[0].anepc_value;
    }
  } catch (err) { console.error("Erro ao carregar dados:", err); }
}

function closeConfigModal() { $('modalConfigDecir').classList.remove('show'); }

async function updateDecirValues() {
  const btn = $('btnSaveConfig');
  const amal = $('amal_value').value.replace(',','.');
  const anepc = $('anepc_value').value.replace(',','.');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A guardar...';
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/decir_values_config?corp_oper_nr=eq.${CORP()}`, {
      method: 'PATCH',
      headers: {...getSupabaseHeaders(), 'Content-Type':'application/json', 'Prefer':'return=minimal'},
      body: JSON.stringify({amal_value:parseFloat(amal), anepc_value:parseFloat(anepc), updated_at:new Date().toISOString()})
    });
    if (res.ok) { alert("✅ Configurações guardadas com sucesso!"); closeConfigModal(); }
  } catch { alert("❌ Erro ao ligar ao servidor."); }
  finally { btn.disabled = false; btn.innerText = "Gravar Alterações"; }
}

/* ─── GENERIC MONTH BUTTONS ─────────────────────────────── */
function createDecirButtonsGeneric({
  containerId, tableContainerId, yearSelectId, optionsContainerId,
  blockedMonths = BLOCKED_MONTHS_DEFAULT,
  monthNames = MONTH_NAMES_PT,
  loadDataFunc, createTableFunc, loadByMonthFunc = null,
  includeExtraButton = false, extraButtonFunc = null, totalContainerId = null
}) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = "";

  const mainWrapper = document.createElement("div");
  Object.assign(mainWrapper.style, {display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"});

  const yearContainer = document.createElement("div");
  Object.assign(yearContainer.style, {display:"flex",alignItems:"center",gap:"8px"});

  const yearLabel = document.createElement("label");
  yearLabel.textContent = "Ano:";
  yearLabel.style.fontWeight = "bold";

  const yearSelect = document.createElement("select");
  yearSelect.id = yearSelectId;
  Object.assign(yearSelect.style, {padding:"6px 10px",borderRadius:"4px",border:"1px solid #ccc",cursor:"pointer"});
  const targetYear = new Date().getFullYear();
  for (let y = 2025; y <= 2035; y++) {
    const opt = document.createElement("option");
    opt.value = y; opt.textContent = y;
    if (y === targetYear) opt.selected = true;
    yearSelect.appendChild(opt);
  }
  setTimeout(() => { yearSelect.value = targetYear; }, 0);
  yearContainer.append(yearLabel, yearSelect);

  const monthsWrapper = document.createElement("div");
  Object.assign(monthsWrapper.style, {display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"4px",maxWidth:"800px"});

  monthNames.forEach((month, idx) => {
    const btn = document.createElement("button");
    btn.textContent = month;
    btn.className = "btn btn-add";
    Object.assign(btn.style, {fontSize:"14px",fontWeight:"bold",width:"110px",height:"40px",borderRadius:"4px",margin:"2px"});

    btn.addEventListener("click", async () => {
      const tableContainer  = $(tableContainerId);
      const tableCodA33     = $("table-container-dec-coda33");
      const optionsContainer = $(optionsContainerId);
      const optionsCodA33   = $("decir-coda33-options");
      const totalContainer  = totalContainerId ? $(totalContainerId) : null;
      const isExtra = includeExtraButton && idx === monthNames.length - 1;
      const isActive = btn.classList.contains("active");

      if (tableCodA33) tableCodA33.innerHTML = "";
      if (optionsContainer) optionsContainer.style.display = "none";
      if (optionsCodA33) optionsCodA33.style.display = "none";
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
        if (optionsCodA33) optionsCodA33.style.display = "flex";
        if (totalContainer) totalContainer.style.display = "none";
        return;
      }

      if (blockedMonths.includes(idx)) {
        if (tableContainer) tableContainer.innerHTML = "";
        setTimeout(() => showPopupWarning(`⛔ Durante o mês de ${month}, não existe DECIR. Salvo prolongamento ou antecipação declarados pela ANEPC.`), 10);
        return;
      }

      const yearVal = parseInt(yearSelect.value, 10);
      const data = await loadDataFunc(yearVal, idx + 1);
      await createTableFunc(tableContainerId, yearVal, idx + 1, data);
      if (loadByMonthFunc) await loadByMonthFunc(yearVal, idx + 1);

      if (optionsContainer) optionsContainer.style.display = "flex";
      if (totalContainer) totalContainer.style.display = "flex";
    });

    monthsWrapper.appendChild(btn);
  });

  mainWrapper.append(yearContainer, monthsWrapper);
  container.appendChild(mainWrapper);
}

/* ─── SIDEBAR SUB-SUBMENU HANDLER ───────────────────────── */
const PAGE_CONFIGS = {
  "decir-reg": {
    tableId: "table-container-dec-reg",
    optionsId: "decir-reg-options",
    monthsId: "months-container-dec-reg",
    generic: {
      containerId: "months-container-dec-reg",
      tableContainerId: "table-container-dec-reg",
      yearSelectId: "year-dec-reg",
      optionsContainerId: "decir-reg-options",
      loadDataFunc: async () => loadDecirRegData(),
      createTableFunc: createDecirRegTable,
      loadByMonthFunc: async (y,m) => window.loadDecirByMonth?.(y,m)
    }
  },
  "decir-pag": {
    tableId: "table-container-dec-pag",
    optionsId: "decir-pag-options",
    monthsId: "months-container-dec-pag",
    extra: ["table-container-dec-coda33","decir-coda33-options","decir-payment-totals"],
    generic: {
      containerId: "months-container-dec-pag",
      tableContainerId: "table-container-dec-pag",
      yearSelectId: "year-dec-pag",
      optionsContainerId: "decir-pag-options",
      monthNames: [...MONTH_NAMES_PT, "Cod.A33"],
      includeExtraButton: true,
      extraButtonFunc: handleCodA33Button,
      loadDataFunc: async (y,m) => ({ elems: await loadDecirPayElements(), turnos: await loadShiftsByNI(y,m) }),
      createTableFunc: (cId,y,m,d) => createDecirPayTable(cId,y,m,d.elems,d.turnos),
      totalContainerId: "decir-payment-totals"
    }
  },
  "decir-anepc": {
    tableId: "table-container-dec-anepc",
    optionsId: "decir-anepc-options",
    monthsId: "months-container-dec-anepc",
    generic: {
      containerId: "months-container-dec-anepc",
      tableContainerId: "table-container-dec-anepc",
      yearSelectId: "year-dec-anepc",
      optionsContainerId: "decir-anepc-options",
      loadDataFunc: async (y,m) => ({ elems: await loadDecirANEPCElements(), turnos: await loadShiftsByNI(y,m) }),
      createTableFunc: (cId,y,m,d) => createDecirAnepcTable(cId,y,m,d.elems,d.turnos)
    }
  }
};

document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const cfg = PAGE_CONFIGS[btn.dataset.page];
    if (!cfg) return;

    const hide = id => { const el = $(id); if (el) { el.innerHTML=""; el.style.display="none"; } };
    const clear = id => { const el = $(id); if (el) el.innerHTML = ""; };

    clear(cfg.tableId);
    const opt = $(cfg.optionsId); if (opt) opt.style.display = "none";
    (cfg.extra || []).forEach(id => { const el=$(id); if(el){ el.innerHTML=""; el.style.display="none"; } });
    document.querySelectorAll(`#${cfg.monthsId} .btn`).forEach(b => b.classList.remove("active"));

    createDecirButtonsGeneric(cfg.generic);
    loadDecirConfigValues();
  });
});

/* ─── LOADERS ────────────────────────────────────────────── */
async function loadDecirConfigValues() {
  try {
    const data = await supabaseFetch("decir_values_config?select=amal_value,anepc_value&limit=1");
    if (!data.length) return;
    const fmt = v => v.toLocaleString('pt-PT',{minimumFractionDigits:2,maximumFractionDigits:2});
    const [fA, fN] = [fmt(data[0].amal_value), fmt(data[0].anepc_value)];
    ["amal-value-reg","anepc-value-reg","amal-value-pag","anepc-value-pag","amal-value-anepc","anepc-value-anepc"]
      .forEach((id,i) => { const el=$(id); if(el) el.value = i%2===0 ? fA : fN; });
    updateAllValues();
  } catch { showPopupWarning("Erro ao carregar valores de configuração."); }
}

async function loadDecirRegData() {
  try {
    const data = await supabaseFetch("reg_elems?select=n_int,abv_name,patent_abv&n_int=gt.008&n_int=lt.400&elem_state=eq.true");
    return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
  } catch { showPopupWarning("Erro ao carregar dados dos elementos."); return []; }
}

async function loadDecirElements(select) {
  try {
    const data = await supabaseFetch(`reg_elems?select=${select}&n_int=gt.008&n_int=lt.400&elem_state=eq.true`);
    return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
  } catch { showPopupWarning("Erro ao carregar lista de elementos."); return []; }
}

const loadDecirPayElements   = () => loadDecirElements("n_int,full_name,nif,nib");
const loadDecirCodA33Elements = () => loadDecirElements("n_int,full_name,nif");
const loadDecirANEPCElements  = () => loadDecirElements("n_int,n_file,patent,full_name");

async function loadShiftsByNI(year, month) {
  try {
    const data = await supabaseFetch(`decir_reg_pag?select=n_int,turno,day&year=eq.${year}&month=eq.${month}`);
    return data.reduce((map,item) => {
      const ni = parseInt(item.n_int,10);
      map[ni] = (map[ni]||0) + 1;
      return map;
    }, {});
  } catch { return {}; }
}

/* ─── SAVED DATA LOADER (IIFE) ───────────────────────────── */
(function() {
  async function loadDecirSavedData(year, month) {
    try {
      const url = `${window.SUPABASE_URL||SUPABASE_URL}/rest/v1/decir_reg_pag?select=n_int,day,turno&year=eq.${year}&month=eq.${month}&corp_oper_nr=eq.${CORP()}`;
      const res = await fetch(url, { headers: window.getSupabaseHeaders ? window.getSupabaseHeaders() : getSupabaseHeaders() });
      if (!res.ok) return {};
      const data = await res.json();
      return data.reduce((map,item) => { map[`${item.n_int}_${item.turno}_${item.day}`]="X"; return map; }, {});
    } catch { return {}; }
  }

  function applyDecirMapToTable(map) {
    const rows = document.querySelectorAll("#table-container-dec-reg table tbody tr");
    if (!rows.length) return;
    let last_n_int = null;
    const rowsToUpdate = new Set();
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 4) return;
      const turnoCell = cells.find(td => ["D","N"].includes(td.textContent.trim().toUpperCase()));
      if (!turnoCell) return;
      const turno = turnoCell.textContent.trim().toUpperCase();
      const turnoIndex = cells.indexOf(turnoCell);
      let n_int = turnoIndex === 0 ? last_n_int : parseInt(cells[0].textContent.trim(),10);
      if (!isNaN(n_int) && turnoIndex !== 0) last_n_int = n_int;
      if (!n_int || isNaN(n_int)) return;
      let marked = false;
      for (let d = 1; d <= 31; d++) {
        const cell = cells[turnoIndex + d];
        if (cell && map[`${n_int}_${turno}_${d}`]) { cell.textContent = "X"; marked = true; }
      }
      if (marked) rowsToUpdate.add(row);
    });

    rowsToUpdate.forEach(row => {
      const count = Array.from(row.querySelectorAll("td[contenteditable='true']")).filter(td=>td.textContent.trim().toUpperCase()==="X").length;
      const tc = row.querySelector("td.total-cell");
      if (tc) tc.textContent = String(count);
    });

    const tbody = document.querySelector("#table-container-dec-reg table tbody");
    if (!tbody) return;
    const totalRow = tbody.querySelector("tr.total-elements-row");
    if (!totalRow) return;
    const firstRow = tbody.querySelector("tr:not(.total-elements-row)");
    if (!firstRow) return;
    const daysInMonth = firstRow.querySelectorAll("td[contenteditable='true']").length;
    for (let d = 1; d <= daysInMonth; d++) {
      const count = Array.from(tbody.querySelectorAll(`.day-cell-${d}`)).filter(td=>td.textContent.trim().toUpperCase()==="X").length;
      const cell = totalRow.querySelector(`.total-day-${d}`);
      if (cell) cell.textContent = count;
    }
    window.updateAllValues?.();
  }

  async function loadDecirByMonth(year, month) {
    try {
      await new Promise(r => setTimeout(r, 200));
      const tbody = document.querySelector("#table-container-dec-reg table tbody");
      if (!tbody) return;
      const map = await loadDecirSavedData(year, month);
      if (Object.keys(map).length) applyDecirMapToTable(map);
    } catch(err) { console.error("Erro ao carregar DECIR:", err); }
  }
  window.loadDecirByMonth = loadDecirByMonth;
})();

/* ─── TABLE: REGISTERS ───────────────────────────────────── */
async function createDecirRegTable(containerId, year, month, data) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = "";
  const daysInMonth = new Date(year, month, 0).getDate();

  container.appendChild(makeTitle(`REGISTO DECIR - ${MONTH_NAMES_UPPER[month-1]} ${year}`));
  const wrapper = makeWrapper(container);

  const table = document.createElement("table");
  table.className = "month-table";
  Object.assign(table.style, {width:"100%", borderCollapse:"separated"});

  /* thead */
  const thead = document.createElement("thead");
  const trTop = document.createElement("tr");
  ["NI","Nome","Catg.","Turno"].forEach((h,i) => {
    const th = makeTh(h, "border-bottom:2px solid #ccc;");
    th.rowSpan = 2;
    th.style.width = i===0?"40px":i===1?"140px":"40px";
    trTop.appendChild(th);
  });
  for (let d = 1; d <= 31; d++) {
    const th = document.createElement("th");
    th.className = `day-header-${d}`;
    th.style.cssText = COMMON_TH_STYLE;
    trTop.appendChild(th);
  }
  [["TOTAL<br>Turnos","60px","#131a69"],["Valor<br>AMAL","120px",null],["Valor<br>ANEPC","120px",null],["Valor<br>GLOBAL","120px",null]]
    .forEach(([txt,w,bg]) => {
      const th = makeTh(txt, `width:${w};text-align:center;vertical-align:middle;border-bottom:2px solid #ccc;${bg?`background:${bg};color:#fff`:""}`, {});
      th.style.cssText = COMMON_THTOTAL_STYLE + `width:${w};text-align:center;vertical-align:middle;border-bottom:2px solid #ccc;${bg?`background:${bg};color:#fff`:""}`;
      th.rowSpan = 2;
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

  /* navigation helpers */
  const getRows = () => Array.from(tbody.querySelectorAll("tr"));
  const getEditable = row => Array.from(row.querySelectorAll("td[contenteditable='true']"));
  const focusCell = td => {
    if (!td) return;
    td.focus();
    const range = document.createRange();
    range.selectNodeContents(td);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const updateRowTotal = tr => {
    const count = getEditable(tr).filter(td=>td.textContent.trim().toUpperCase()==="X").length;
    const tc = tr.querySelector("td.total-cell");
    if (tc) tc.textContent = String(count);
    updateAllValues();
    updateDailyTotals();
  };
  const navigate = (td, dir) => {
    const rows = getRows();
    const tr = td.parentElement;
    const rowIdx = rows.indexOf(tr);
    const cells = getEditable(tr);
    const idx = cells.indexOf(td);
    if (dir==="right")  return idx<cells.length-1 ? cells[idx+1] : (rows[rowIdx+1] ? getEditable(rows[rowIdx+1])[0] : null);
    if (dir==="left")   return idx>0 ? cells[idx-1] : null;
    if (dir==="down")   { const nr=rows[rowIdx+1]; return nr ? getEditable(nr)[Math.min(idx,getEditable(nr).length-1)] : null; }
    if (dir==="up")     { const pr=rows[rowIdx-1]; return pr ? getEditable(pr)[Math.min(idx,getEditable(pr).length-1)] : null; }
    return null;
  };
  const createDayCell = (dayNum, trRef) => {
    const td = document.createElement("td");
    td.className = `day-cell-${dayNum}`;
    td.contentEditable = true;
    td.style.cssText = COMMON_TD_STYLE;
    if (trRef.querySelector("td")?.textContent.trim()==="N") td.style.borderBottom = "2px solid #ccc";
    td.addEventListener("input", () => {
      let v = td.textContent.toUpperCase().trim();
      v = v.length>1 ? v[0] : v;
      td.textContent = v==="X" ? "X" : "";
      updateRowTotal(trRef);
      if (v==="X") { const next=navigate(td,"right"); if(next) setTimeout(()=>focusCell(next),0); }
    });
    td.addEventListener("paste", ev => {
      ev.preventDefault();
      const char = (ev.clipboardData||window.clipboardData).getData("text").toUpperCase().trim()[0]==="X"?"X":"";
      document.execCommand("insertText",false,char);
    });
    td.addEventListener("keydown", ev => {
      if (["ArrowRight","ArrowLeft","ArrowUp","ArrowDown","Enter"].includes(ev.key)) {
        ev.preventDefault();
        const dir = ev.key==="ArrowRight"||ev.key==="Enter" ? "right" : ev.key==="ArrowLeft" ? "left" : ev.key==="ArrowUp" ? "up" : "down";
        const next = navigate(td, dir);
        if (next) focusCell(next);
      }
    });
    td.addEventListener("focus", () => focusCell(td));
    return td;
  };

  /* rows */
  data.forEach(item => {
    const nInt = parseInt(item.n_int,10);
    ["D","N"].forEach((turno, tIdx) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-nint", nInt);
      if (tIdx===0) {
        [String(nInt).padStart(3,"0"), item.abv_name||"", item.patent_abv||""].forEach(txt => {
          const td = document.createElement("td");
          td.textContent = txt;
          td.style.cssText = COMMON_TD_STYLE + "border-bottom:2px solid #ccc;";
          td.rowSpan = 2;
          tr.appendChild(td);
        });
      }
      const tdTurno = document.createElement("td");
      tdTurno.textContent = turno;
      tdTurno.style.cssText = COMMON_TD_STYLE + `font-weight:bold;text-align:center;${turno==="N"?"border-bottom:2px solid #ccc;":""}`;
      tr.appendChild(tdTurno);
      for (let d=1; d<=daysInMonth; d++) tr.appendChild(createDayCell(d, tr));
      const tdTotal = document.createElement("td");
      tdTotal.className = "total-cell";
      tdTotal.textContent = "0";
      tdTotal.style.cssText = COMMON_TDTOTAL_STYLE + (turno==="N"?"border-bottom:2px solid #ccc;":"");
      tdTotal.style.setProperty("font-weight","bold","important");
      if (turno==="N") tdTotal.style.setProperty("border-bottom","2px solid #ccc","important");
      tr.appendChild(tdTotal);
      if (tIdx===0) {
        [["0.00"],["0.00"],["0.00"]].forEach(([txt]) => {
          const td = document.createElement("td");
          td.rowSpan = 2; td.textContent = txt;
          td.style.cssText = COMMON_TDTOTAL_STYLE + "text-align:center;border-bottom:2px solid #ccc;";
          tr.appendChild(td);
        });
      }
      tbody.appendChild(tr);
    });
  });

  /* daily totals row */
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
      for (let d=1; d<=daysInMonth; d++) {
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
    for (let d=1; d<=daysInMonth; d++) {
      const count = Array.from(tbody.querySelectorAll(`.day-cell-${d}`)).filter(td=>td.textContent.trim().toUpperCase()==="X").length;
      totalRow.querySelector(`.total-day-${d}`).textContent = count;
    }
    tbody.querySelectorAll("tr:not(.total-elements-row) .total-cell").forEach(tc => { totalGeral += parseInt(tc.textContent,10)||0; });
    totalRow.querySelector(".total-general").textContent = totalGeral;
  };

  updateDailyTotals();
  updateAllValues();
  for (let d=1; d<=daysInMonth; d++) {
    const date = new Date(year, month-1, d);
    if (date.getDay()===0 || date.getDay()===6) {
      tbody.querySelectorAll(`.day-cell-${d}`).forEach(td => { td.style.background = WEEKEND_COLOR||"#f9e0b0"; });
    }
  }
  const firstEditable = tbody.querySelector("td[contenteditable='true']");
  if (firstEditable) firstEditable.focus();
}

/* ─── TABLE: PAYMENTS ────────────────────────────────────── */
function createDecirPayTable(containerId, year, month, elements, turnosPorNI) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = "";

  container.appendChild(makeTitle(`RELATÓRIO PAGAMENTOS DECIR - ${MONTH_NAMES_UPPER[month-1]} ${year}`));
  const wrapper = makeWrapper(container);

  const table = document.createElement("table");
  table.className = "pag-table";
  Object.assign(table.style, {width:"100%", borderCollapse:"separated", fontFamily:"Segoe UI, sans-serif"});

  const thead = document.createElement("thead");
  const trh   = document.createElement("tr");
  const headers = ["NI","Nome","NIF","NIB","Qtd. Turnos","Valor a Receber (€)"];
  const widths  = ["40px","175px","120px","175px","100px","120px"];
  headers.forEach((h,i) => {
    const th = makeTh(h, "height:40px;line-height:40px;");
    th.style.width = widths[i];
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const rowsCount = elements.length > 0 ? elements.length : 10;

  for (let i=0; i<rowsCount; i++) {
    const elem = elements[i] || {};
    const tr = document.createElement("tr");
    const niKey = parseInt(elem.n_int,10);
    const qtdTurnos = turnosPorNI?.[niKey] || 0;

    tr.appendChild(makeTd(elem.n_int ? String(elem.n_int).padStart(3,'0') : ""));
    tr.appendChild(makeTd(elem.full_name||"", "text-align:center;padding:6px 8px;"));
    tr.appendChild(makeTd(elem.nif||"",      "text-align:center;padding:6px 8px;"));
    tr.appendChild(makeTd(elem.nib||"",      "text-align:center;padding:6px 8px;"));
    const tdTurnos = makeTd(String(qtdTurnos), "text-align:center;font-weight:bold;padding:6px 8px;");
    tr.appendChild(tdTurnos);

    const tdValor = document.createElement("td");
    tdValor.style.cssText = COMMON_TDTOTAL_STYLE + "text-align:right;font-weight:bold;padding:6px 8px;";
    const updateValor = () => {
      const total = (parseVal("amal-value-pag") + parseVal("anepc-value-pag")) * qtdTurnos;
      tdValor.textContent = formatCurrency(total);
    };
    updateValor();
    ["amal-value-pag","anepc-value-pag"].forEach(id => { const el=$(id); if(el) el.addEventListener("input", updateValor); });
    tr.appendChild(tdValor);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  wrapper.appendChild(table);
  $("decir-pag-options") && ($("decir-pag-options").style.display="flex");
  updateDECIRTotalPaymentsByMonth();
}

/* ─── TABLE: COD A33 ─────────────────────────────────────── */
function createDecirCodA33Table(containerId, year, elements, turnosPorMes) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = "";

  container.appendChild(makeTitle(`RELATÓRIO ANUAL DECIR ${year} - Cod.A33`));
  const wrapper = makeWrapper(container);

  const table = document.createElement("table");
  table.className = "coda33-table";
  Object.assign(table.style, {width:"100%", borderCollapse:"separate", fontFamily:"Segoe UI, sans-serif"});

  const thead = document.createElement("thead");
  const trh   = document.createElement("tr");
  [["NI","40px"],["Nome","175px"],["NIF","120px"]].forEach(([h,w]) => {
    const th = makeTh(h, "height:40px;line-height:40px;");
    th.style.width = w;
    trh.appendChild(th);
  });
  const CODA33_MONTHS = ["ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO"];
  CODA33_MONTHS.forEach(m => {
    const thS = makeTh(`Turnos ${m}`, "width:90px;display:none;");
    const thV = makeTh(m, "width:100px;height:40px;line-height:40px;");
    trh.appendChild(thS); trh.appendChild(thV);
  });
  const thTotal = document.createElement("th");
  thTotal.innerHTML = "Total por<br>Contribuinte";
  thTotal.style.cssText = COMMON_THTOTAL_STYLE + "width:130px;height:40px;line-height:20px;";
  trh.appendChild(thTotal);
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const amalI = parseVal("amal-value-pag");
  const anepcI = parseVal("anepc-value-pag");
  const rowsCount = elements.length > 0 ? elements.length : 10;

  for (let i=0; i<rowsCount; i++) {
    const elem = elements[i] || {};
    const tr   = document.createElement("tr");
    const niKey = parseInt(elem.n_int,10);
    tr.appendChild(makeTd(elem.n_int ? String(elem.n_int).padStart(3,'0') : ""));
    tr.appendChild(makeTd(elem.full_name||"", "text-align:center;padding:6px 8px;"));
    tr.appendChild(makeTd(elem.nif||"",       "text-align:center;padding:6px 8px;"));

    let totalForRow = 0;
    const tdTotalContributor = document.createElement("td");
    tdTotalContributor.className = "total-contributor";
    tdTotalContributor.style.cssText = COMMON_TD_STYLE + "font-weight:bold;padding:6px 8px;text-align:right;";

    for (let m=4; m<=10; m++) {
      const qtd = turnosPorMes?.[m]?.[niKey] || 0;
      const tdT = makeTd(String(qtd), "text-align:center;font-weight:bold;padding:6px 8px;");
      tdT.style.display = "none";
      const val = (amalI + anepcI) * qtd;
      const tdV = document.createElement("td");
      tdV.style.cssText = COMMON_TD_STYLE + "font-weight:bold;padding:6px 8px;text-align:right;";
      tdV.className = `valor-mes-${m}`;
      tdV.textContent = formatCurrency(val);
      tdV.setAttribute("data-value", val);
      totalForRow += val;
      tr.appendChild(tdT); tr.appendChild(tdV);
    }
    tdTotalContributor.textContent = formatCurrency(totalForRow);
    tr.appendChild(tdTotalContributor);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrapper.appendChild(table);

  ["amal-value-pag","anepc-value-pag"].forEach(id => { const el=$(id); if(el) el.addEventListener("input", updateAllValues); });
  if (typeof updateDECIRTotalPaymentsByMonth==='function') updateDECIRTotalPaymentsByMonth();
}

/* ─── TABLE: ANEPC ───────────────────────────────────────── */
function createDecirAnepcTable(containerId, year, month, elements, turnosPorNI) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = "";

  container.appendChild(makeTitle(`RELATÓRIO ANEPC DECIR - ${MONTH_NAMES_UPPER[month-1]} ${year}`));
  const wrapper = makeWrapper(container);

  const table = document.createElement("table");
  table.className = "anepc-table";
  Object.assign(table.style, {width:"100%", borderCollapse:"separated", fontFamily:"Segoe UI, sans-serif"});

  const thead = document.createElement("thead");
  const trh   = document.createElement("tr");
  [["Nº Mecanográfico","120px"],["Função","100px"],["Nome","200px"],["Qtd. Turnos","100px"],["Valor ANEPC (€)","140px"]]
    .forEach(([h,w]) => {
      const th = makeTh(h, "height:40px;line-height:40px;");
      th.style.width = w;
      trh.appendChild(th);
    });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const rowsCount = elements.length > 0 ? elements.length : 10;

  for (let i=0; i<rowsCount; i++) {
    const elem = elements[i] || {};
    const tr   = document.createElement("tr");
    const niKey = parseInt(elem.n_int,10);
    const qtyShifts = turnosPorNI?.[niKey] || 0;

    tr.appendChild(makeTd(elem.n_file ? String(elem.n_file) : "", "text-align:center;"));
    tr.appendChild(makeTd(elem.patent||"",    "text-align:center;padding:6px 8px;"));
    tr.appendChild(makeTd(elem.full_name||"", "text-align:center;padding:6px 8px;"));
    tr.appendChild(makeTd(String(qtyShifts),  "text-align:center;font-weight:bold;padding:6px 8px;"));

    const tdValue = document.createElement("td");
    tdValue.style.cssText = COMMON_TDTOTAL_STYLE + "text-align:right;font-weight:bold;padding:6px 8px;";
    const updateValor = () => { tdValue.textContent = formatCurrency(parseVal("anepc-value-anepc") * qtyShifts); };
    updateValor();
    const inp = $("anepc-value-anepc"); if(inp) inp.addEventListener("input", updateValor);
    tr.appendChild(tdValue);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrapper.appendChild(table);

  const optAnepc = $("decir-anepc-options"); if(optAnepc) optAnepc.style.display="flex";
  if (typeof updateAnepcTotals==='function') updateAnepcTotals();
}
window.createDecirAnepcTable = createDecirAnepcTable;

/* ─── CALCULATIONS ───────────────────────────────────────── */
function updateAllValues() {
  const amalCents  = Math.round(parseVal("amal-value-reg") * 100);
  const anepcCents = Math.round(parseVal("anepc-value-reg") * 100);
  const tbody = document.querySelector("table.month-table tbody");
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll("tr"));
  for (let i=0; i<rows.length; i+=2) {
    const [trD, trN] = [rows[i], rows[i+1]];
    if (!trN) continue;
    const sum = (Number(trD.querySelector("td.total-cell")?.textContent)||0) + (Number(trN.querySelector("td.total-cell")?.textContent)||0);
    const tds = Array.from(trD.querySelectorAll("td"));
    const [amalCell, anepcCell, globalCell] = tds.slice(-3);
    if (amalCell)   amalCell.textContent   = formatCurrency((sum * amalCents)  / 100);
    if (anepcCell)  anepcCell.textContent  = formatCurrency((sum * anepcCents) / 100);
    if (globalCell) globalCell.textContent = formatCurrency((sum * (amalCents + anepcCents)) / 100);
  }
  setTimeout(updateGeneralTotals, 0);
}

function updateGeneralTotals() {
  const tbody = document.querySelector("table.month-table tbody");
  if (!tbody) return;
  let [amal, anepc, global] = [0,0,0];
  const toCents = cell => {
    if (!cell) return 0;
    return Math.round((parseFloat(cell.textContent.replace(/[€\s]/g,"").replace(/\./g,"").replace(",",".")) || 0) * 100);
  };
  const isMoney = cell => (cell?.textContent||"").includes("€") || (cell?.textContent||"").includes(",");
  Array.from(tbody.querySelectorAll("tr")).forEach((_,i,arr) => {
    if (i%2!==0) return;
    const tds = Array.from(arr[i].querySelectorAll("td"));
    if (tds.length < 3) return;
    const [aC, nC, gC] = tds.slice(-3);
    if (!isMoney(aC)||!isMoney(nC)||!isMoney(gC)) return;
    amal += toCents(aC); anepc += toCents(nC); global += toCents(gC);
  });

  let totalContainer = $("decir-general-totals");
  if (!totalContainer) {
    totalContainer = document.createElement("div");
    totalContainer.id = "decir-general-totals";
    totalContainer.style.marginTop = "8px";
    (tbody.closest("div") || document.body).appendChild(totalContainer);
  }
  const colSpan = tbody.querySelector("tr").children.length - 2;
  totalContainer.innerHTML = `
    <table style="width:100%;border-collapse:collapse;border:none;margin:0 0 10px 0;">
      ${[["Total AMAL:",amal/100,""],["Total ANEPC:",anepc/100,""],["Total GLOBAL:",global/100,"font-size:14px;color:#8B0000;"]]
        .map(([lbl,val,style]) => `
          <tr>
            <td colspan="${colSpan}" style="border:none;background:#fff;"></td>
            <td style="text-align:left;width:100px;border:1px solid #ccc;"><strong>${lbl}</strong></td>
            <td style="text-align:right;font-weight:bold;${style}width:116px;border:1px solid #ccc;">${formatCurrency(val)}</td>
          </tr>`).join('')}
    </table>`;
}

function updateDECIRTotalPaymentsByMonth() {
  const table = document.querySelector("table.pag-table");
  if (!table) return;
  const grandTotalCents = Array.from(table.querySelectorAll("tbody tr")).reduce((acc, tr) => {
    const tds = Array.from(tr.querySelectorAll("td"));
    const last = tds[tds.length-1];
    if (!last) return acc;
    return acc + Math.round((parseCurrency(last.textContent))*100);
  }, 0);
  let tc = $("decir-payment-totals");
  const cardBody = document.querySelector("#decir-pag .card-body");
  if (!cardBody) return;
  if (!tc) {
    tc = document.createElement("div");
    tc.id = "decir-payment-totals";
    Object.assign(tc.style, {margin:"5px 0 0 0", width:"100%", display:"none"});
    cardBody.appendChild(tc);
    }
  tc.innerHTML = `
    <div style="display:flex;justify-content:flex-end;font-size:16px;font-weight:bold;">
      <div style="padding:8px 10px;border:1px solid #ccc;border-right:0;background:#f7f7f7;width:163px;text-align:right;border-top-left-radius:5px;border-bottom-left-radius:5px;">TOTAL A PAGAR:</div>
      <div style="padding:8px 10px;border:1px solid #ccc;background:#e0f7e0;color:#006400;width:203px;text-align:right;border-top-right-radius:5px;border-bottom-right-radius:5px;">${formatCurrency(grandTotalCents/100)}</div>
    </div>`;
  tc.style.display = "flex";
  tc.style.justifyContent = "flex-end";
}

function updateDECIRTotalCodA33() {
  const table = document.querySelector("#table-container-dec-coda33 table");
  if (!table) return;
  const tbody = table.querySelector("tbody");
  if (!tbody) return;
  tbody.querySelector(".total-coda33")?.remove();

  const CODA33_MONTHS = ["ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO"];
  const headerCells = Array.from(table.querySelector("thead tr").children);
  const monthIndices = CODA33_MONTHS.map(name => headerCells.findIndex(th => th.textContent.trim().toUpperCase()===name));
  const monthSums = monthIndices.map(() => 0);
  Array.from(tbody.querySelectorAll("tr")).forEach(tr => {
    const tds = Array.from(tr.querySelectorAll("td"));
    monthIndices.forEach((idx,i) => { if(idx>=0&&tds[idx]) monthSums[i] += Math.round(parseCurrency(tds[idx].textContent)*100); });
  });
  const grandTotal = monthSums.reduce((a,b)=>a+b,0);

  const totalRow = document.createElement("tr");
  totalRow.className = "total-coda33";
  Object.assign(totalRow.style, {fontWeight:"bold", backgroundColor:"#e0f7e0"});
  const tdFixed = document.createElement("td");
  tdFixed.textContent = "Somatórios:";
  tdFixed.colSpan = 3;
  Object.assign(tdFixed.style, {textAlign:"right", backgroundColor:"#f7f7f7"});
  totalRow.appendChild(tdFixed);
  monthSums.forEach(sum => {
    const td = document.createElement("td");
    td.textContent = formatCurrency(sum/100);
    td.style.textAlign = "right";
    totalRow.appendChild(td);
  });
  const tdTotal = document.createElement("td");
  tdTotal.textContent = formatCurrency(grandTotal/100);
  Object.assign(tdTotal.style, {textAlign:"right", backgroundColor:"#c0ffc0"});
  totalRow.appendChild(tdTotal);
  tbody.appendChild(totalRow);
}

/* ─── CLEAR TABLE ────────────────────────────────────────── */
async function clearDecirTable() {
  if (!$("table-container-dec-reg")) return;
  const monthBtn = document.querySelector("#months-container-dec-reg .btn.active");
  if (!monthBtn) return showPopupWarning("Nenhum mês selecionado.");
  const month = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthBtn) + 1;
  const year  = parseInt($("year-dec-reg").value, 10);
  if (!confirm(`Tem certeza que quer limpar os dados de ${monthBtn.textContent.trim()} de ${year}?`)) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_pag?year=eq.${year}&month=eq.${month}`, { method:"DELETE", headers:getSupabaseHeaders() });
    if (!res.ok) throw new Error(await res.text()||"Erro ao apagar dados");
    showPopupSuccess(`✅ Dados de ${monthBtn.textContent.trim()} de ${year} apagados com sucesso!`);
  } catch(err) { console.error(err); showPopupWarning("❌ Erro ao apagar: "+err.message); }
}

/* ─── SAVE REGISTER TABLE ────────────────────────────────── */
async function saveDecirFull() {
  const table = document.querySelector("#table-container-dec-reg table tbody");
  if (!table) return showPopupWarning("Nenhuma tabela aberta.");
  const corpOperNr = CORP();
  const year = parseInt($("year-dec-reg")?.value, 10);
  const monthBtn = document.querySelector("#months-container-dec-reg .btn.active");
  if (!monthBtn) return showPopupWarning("Nenhum mês selecionado.");
  const month = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthBtn) + 1;

  const btn = $("guardar-dec-btn");
  if (btn) { btn.disabled=true; btn.textContent="A gravar..."; }

  try {
    let last_n_int=null, last_abv_name=null;
    const payload = [];
    Array.from(table.querySelectorAll("tr")).forEach(row => {
      const cells = Array.from(row.querySelectorAll("td"));
      let n_int = parseInt((cells[0]?.textContent||"").trim(),10);
      if (isNaN(n_int)) n_int = last_n_int;
      let nameRaw = (cells[1]?.textContent||"").trim();
      if (nameRaw==="X") nameRaw="";
      const abv_name = nameRaw || last_abv_name;
      if (!n_int||!abv_name) return;
      last_n_int=n_int; if(nameRaw) last_abv_name=nameRaw;
      const turnoCell = cells.find(td=>["D","N"].includes((td.textContent||"").trim()));
      if (!turnoCell) return;
      const turno = turnoCell.textContent.trim();
      cells.filter(td=>td.isContentEditable).forEach((cell,idx) => {
        if (cell.textContent.trim().toUpperCase()==="X")
          payload.push({n_int, abv_name, year, month, day:idx+1, turno, corp_oper_nr:corpOperNr});
      });
    });

    await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_pag?year=eq.${year}&month=eq.${month}&corp_oper_nr=eq.${corpOperNr}`, {
      method:"DELETE", headers:getSupabaseHeaders()
    }).then(r => { if(!r.ok) throw new Error("Erro ao limpar registos antigos"); });

    if (payload.length>0) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_pag`, {
        method:"POST",
        headers:{...getSupabaseHeaders(),"Content-Type":"application/json","Prefer":"return=minimal"},
        body:JSON.stringify(payload)
      });
      if (!r.ok) throw new Error(await r.text()||"Erro desconhecido ao gravar");
    }
    showPopupSuccess("✅ Registo DECIR gravado com sucesso!");
  } catch(err) { console.error(err); showPopupWarning("❌ Erro ao gravar: "+err.message); }
  finally { if(btn) { btn.disabled=false; btn.textContent="Guardar"; } }
}

/* ─── GENERATE FILES (EXCEL EXPORT) ─────────────────────── */
async function generateDECIRFiles(type) {
  let data = { type };

  if (type === 'reg') {
    const table = document.querySelector("#table-container-dec-reg table tbody");
    if (!table) return alert("Tabela de registo diário não encontrada.");
    const monthSelect = document.querySelector("#months-container-dec-reg .btn.active");
    const yearInput = $("year-dec-reg");
    if (!monthSelect||!yearInput) return alert("Selecione mês e ano.");
    const monthIdx = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthSelect)+1;
    const monthName = monthSelect.textContent.trim();
    const year = parseInt(yearInput.value,10);
    const daysInMonth = new Date(year,monthIdx,0).getDate();
    const weekdays=[], holidayDays=[];
    for (let d=1; d<=daysInMonth; d++) {
      const date = new Date(year,monthIdx-1,d);
      weekdays.push(['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][date.getDay()]);
      if (date.getDay()===0||date.getDay()===6) holidayDays.push(d);
    }
    const parseValue = txt => parseFloat(txt.trim().replace(/\s/g,'').replace(/\./g,'').replace(',','.')) || 0;
    const fixedRows=[], normalRows=[];
    let lastNI=null, lastNome=null, lastAmal=null, lastAnepc=null, lastGlobal=null;
    Array.from(table.querySelectorAll("tr")).filter(tr=>!tr.classList.contains("total-elements-row")).forEach(row => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (!cells.length) return;
      let nInt, nome, turno, startIdx;
      if (cells[0].rowSpan===2) {
        nInt=parseInt(cells[0].textContent.trim(),10); nome=cells[1].textContent.trim();
        turno=cells[3]?.textContent.trim()||'D'; startIdx=4;
        lastNI=nInt; lastNome=nome;
        lastAmal=parseValue(cells[cells.length-3].textContent);
        lastAnepc=parseValue(cells[cells.length-2].textContent);
        lastGlobal=parseValue(cells[cells.length-1].textContent);
      } else {
        nInt=lastNI; nome=lastNome; turno=cells[0].textContent.trim(); startIdx=1;
      }
      const daysData={};
      for (let d=0; d<daysInMonth; d++) {
        const cell=cells[startIdx+d];
        daysData[d+1]={D:'',N:''};
        if (cell&&cell.textContent.trim().toUpperCase()==='X') daysData[d+1][turno]='X';
      }
      const rowObj={ni:nInt,nome,days:daysData,amal:lastAmal,anepc:lastAnepc,global:lastGlobal};
      turno==='D' ? fixedRows.push(rowObj) : normalRows.push(rowObj);
    });
    data = {...data, fileName:`REGISTOS_DECIR_${monthName}_${year}`, monthName, year, daysInMonth, weekdays, holidayDays, fixedRows, normalRows};

  } else if (type === 'pag') {
    const table = document.querySelector("#table-container-dec-pag table tbody");
    if (!table) return alert("Tabela de pagamentos não encontrada.");
    const monthSelect = document.querySelector("#months-container-dec-pag .btn.active");
    const yearInput = $("year-dec-pag");
    if (!monthSelect||!yearInput) return alert("Selecione mês e ano.");
    const monthName = monthSelect.textContent.trim();
    const year = parseInt(yearInput.value,10);
    const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
      const cells = tr.querySelectorAll("td");
      return {
        ni: parseInt(cells[0].textContent.trim(),10),
        nome: cells[1]?.textContent.trim()||"",
        nif: cells[2]?.textContent.trim()||"",
        nib: cells[3]?.textContent.trim()||"",
        qtdTurnos: parseInt(cells[4]?.textContent.trim()||0,10),
        valor: parseCurrency(cells[5]?.textContent)
      };
    });
    data = {...data, fileName:`PAGAMENTOS_DECIR_${monthName}_${year}`, monthName, year, rows};

  } else if (type === 'code_a33') {
    const table = document.querySelector("#table-container-dec-coda33 tbody");
    if (!table) return alert("Tabela Cod.A33 não encontrada.");
    const yearInput = $("year-dec-pag");
    if (!yearInput) return alert("Selecione mês e ano.");
    const year = parseInt(yearInput.value,10);
    const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
      const cells = tr.querySelectorAll("td");
      return {
        ni: parseInt(cells[0]?.textContent.trim(),10)||0,
        nome: cells[1]?.textContent.trim()||'',
        nif: cells[2]?.textContent.trim()||'',
        ABRIL: parseCurrency(cells[4]?.textContent), MAIO: parseCurrency(cells[6]?.textContent),
        JUNHO: parseCurrency(cells[8]?.textContent), JULHO: parseCurrency(cells[10]?.textContent),
        AGOSTO: parseCurrency(cells[12]?.textContent), SETEMBRO: parseCurrency(cells[14]?.textContent),
        OUTUBRO: parseCurrency(cells[16]?.textContent)
      };
    }).filter(r => r.ni>0 && (r.ABRIL||r.MAIO||r.JUNHO||r.JULHO||r.AGOSTO||r.SETEMBRO||r.OUTUBRO));
    console.log("Dados Cod.A33 a enviar:", rows);
    data = {...data, fileName:`CODA33_DECIR_${year}`, year, rows};

  } else if (type === 'anepc') {
    const table = document.querySelector(".anepc-table tbody");
    if (!table) return alert("Tabela ANEPC não encontrada. Certifique-se de que foi gerada.");
    const monthSelect = document.querySelector("#months-container-dec-anepc .btn.active");
    const yearInput = $("year-dec-anepc");
    const monthName = monthSelect ? monthSelect.textContent.trim() : 'MÊS';
    const year = yearInput ? parseInt(yearInput.value,10) : new Date().getFullYear();
    const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
      const cells = tr.querySelectorAll("td");
      if (cells.length<5) return null;
      return { niFile:cells[0]?.textContent.trim()||'', funcao:cells[1]?.textContent.trim()||'', nome:cells[2]?.textContent.trim()||'', qtdTurnos:parseInt(cells[3]?.textContent.trim()||0,10), valor:parseCurrency(cells[4]?.textContent) };
    }).filter(r => r && (r.qtdTurnos>0||r.valor>0));
    console.log("Dados ANEPC a enviar:", rows);
    data = {...data, fileName:`RELATORIO_ANEPC_${monthName}_${year}`, monthName, year, rows};
  }

  try {
    const res = await fetch("https://cb360-online.vercel.app/api/decir_reg_pag", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)
    });
    if (!res.ok) { const err=await res.json(); return alert("Erro: "+(err.details||err.error)); }
    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download=data.fileName+".xlsx";
    document.body.appendChild(a); a.click(); a.remove();
    window.URL.revokeObjectURL(url);
  } catch(err) { alert("Erro ao gerar Excel: "+err.message); }
}

/* ─── EVENT LISTENERS ────────────────────────────────────── */
["emit-pag-dec-btn","emit-reg-dec-btn","emit-coda33-dec-btn","emit-anepc-dec-btn"].forEach((id,i) => {
  $(id)?.addEventListener("click", () => generateDECIRFiles(['pag','reg','code_a33','anepc'][i]));
});

/* ─── COD A33 HANDLER (CORRIGIDO PARA O SEU HTML) ──────────────── */
async function handleCodA33Button() {
  const tableContainer = $("table-container-dec-coda33");
  if (tableContainer) tableContainer.style.display = "block";
  
  const year = parseInt($("year-dec-pag")?.value || new Date().getFullYear(), 10);
  
  try {
    const elements = await loadDecirCodA33Elements();
    const months = [4, 5, 6, 7, 8, 9, 10];
    const turnosPorMes = {};
    const allShifts = await Promise.all(months.map(m => loadShiftsByNI(year, m)));
    allShifts.forEach((t, i) => { turnosPorMes[months[i]] = t; });

    if (!elements.length) {
      tableContainer.innerHTML = "<p>Nenhum elemento encontrado.</p>";
      return;
    }

    createDecirCodA33Table("table-container-dec-coda33", year, elements, turnosPorMes);
    updateDECIRTotalCodA33();

    // Mostrar o container do botão de emissão (não o botão directamente)
    const optionsCodA33 = $("decir-coda33-options");
    if (optionsCodA33) optionsCodA33.style.display = "flex";
    
  } catch (err) {
    console.error("Erro no COD.A33:", err);
  }
}
