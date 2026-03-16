    /* =======================================
    CONSTANTES
    ======================================= */
    /* ─── CONSTANTES PARTILHADAS (DECIR + FOMIO) ────────────── */
    const MONTH_NAMES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const MONTH_NAMES_UPPER = MONTH_NAMES_PT.map(m => m.toUpperCase());
    const DECIR_MONTH_NAMES = ["Maio","Junho","Julho","Agosto","Setembro","Outubro"];
    const BLOCKED_MONTHS_DEFAULT = [0,1,2,3,10,11];
    /* ─── CONSTANTES FOMIO (SCALES) ─────────────────────────── */
    const SCALES_TITLE_MAIN_STYLE = "text-align:center;margin-top:30px;background:#ffcccc;padding:8px;font-weight:bold;font-size:18px;";
    const SCALES_TITLE_SUB_STYLE = "text-align:center;margin-bottom:5px;margin-top:-15px;font-size:14px;background:#ffcccc;padding:6px;";
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
    /* ─── HELPERS PARTILHADOS ────────────────────────────────── */
    const $ = id => document.getElementById(id);
    const parseCurrency = txt => !txt ? 0 : parseFloat(txt.replace('€','').replace(/\s/g,'').replace(/\./g,'').replace(',','.')) || 0;
    const parseVal = id => parseFloat(($( id)?.value||"0").replace(",",".")) || 0;
    const formatCurrency = v => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
    const formatNumber = v => new Intl.NumberFormat('pt-PT',{minimumFractionDigits:0,maximumFractionDigits:0}).format(v);
    const getCorpId = () => sessionStorage.getItem('currentCorpOperNr') || "0805";
    async function supabaseFetch(path, opts = {}) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {headers: getSupabaseHeaders(), ...opts});
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
      Object.assign(h.style, {textAlign: "center", margin: "20px 0 -15px 0", background: bg, height: "30px", borderRadius: "3px", lineHeight: "30px", padding: "0 8px"});
      return h;
    }
    /* ─── BOTÕES GENÉRICOS DE MÊS (DECIR) ───────────────────── */
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
      for (let y = 2026; y <= 2036; y++) {
        const opt = document.createElement("option");
        opt.value = y; opt.textContent = y;
        if (y === targetYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }
      setTimeout(() => {yearSelect.value = targetYear;}, 0);
      yearContainer.append(yearLabel, yearSelect);
      const monthsWrapper = document.createElement("div");
      Object.assign(monthsWrapper.style, {display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"4px",maxWidth:"800px"});
      monthNames.forEach((month, idx) => {
        const btn = document.createElement("button");
        btn.textContent = month;
        btn.className = "btn btn-add";
        Object.assign(btn.style, {fontSize:"14px",fontWeight:"bold",width:"110px",height:"40px",borderRadius:"4px",margin:"2px"});
        btn.addEventListener("click", async () => {
          const tableContainer = $(tableContainerId);
          const tableCodA33 = $("table-container-dec-coda33");
          const optionsContainer = $(optionsContainerId);
          const optionsCodA33 = $("decir-coda33-options");
          const totalContainer = totalContainerId ? $(totalContainerId) : null;
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
    /* ─── SIDEBAR BUTTON — MODAL CONFIG ─────────────────────── */
    async function openConfigDecirModal() {
      $('modalConfigDecir').classList.add('show');
      try {
        const data = await supabaseFetch(`decir_values_config?corp_oper_nr=eq.${getCorpId()}`);
        if (data?.length) {
          $('amal_value').value = data[0].amal_value;
          $('anepc_value').value = data[0].anepc_value;
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    function closeConfigModal() { 
      $('modalConfigDecir').classList.remove('show');
    }
    async function updateDecirValues() {
      const btn = $('btnSaveConfig');
      const amal = $('amal_value').value.replace(',','.');
      const anepc = $('anepc_value').value.replace(',','.');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A guardar...';
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/decir_values_config?corp_oper_nr=eq.${getCorpId()}`, {
          method: 'PATCH',
          headers: {...getSupabaseHeaders(), 'Content-Type':'application/json', 'Prefer':'return=minimal'},
          body: JSON.stringify({amal_value:parseFloat(amal), anepc_value:parseFloat(anepc), updated_at:new Date().toISOString()})
        });
        if (res.ok) { 
          alert("✅ Configurações guardadas com sucesso!"); closeConfigModal();
        }
      } catch {
        alert("❌ Erro ao ligar ao servidor.");
      }
      finally {btn.disabled = false; btn.innerText = "Gravar Alterações";}
    }
    /* ─── SIDEBAR SUB-SUBMENU HANDLER (DECIR) ───────────────── */
    const PAGE_CONFIGS = {
      "decir-reg": {tableId: "table-container-dec-reg", optionsId: "decir-reg-options", monthsId: "months-container-dec-reg",
                    generic: {containerId: "months-container-dec-reg", tableContainerId: "table-container-dec-reg", yearSelectId: "year-dec-reg", optionsContainerId: "decir-reg-options",
                              monthNames: DECIR_MONTH_NAMES, blockedMonths:[], loadDataFunc: async () => loadDecirRegData(), createTableFunc: (cId, y, m, d) => createDecirRegTable(cId, y, m + 4, d), 
                              loadByMonthFunc: async (y, m) => window.loadDecirByMonth?.(y, m + 4)}},
      "decir-pag": {tableId: "table-container-dec-pag", optionsId: "decir-pag-options", monthsId: "months-container-dec-pag",
                    extra: ["table-container-dec-coda33","decir-coda33-options","decir-payment-totals"],
                    generic: {containerId: "months-container-dec-pag", tableContainerId: "table-container-dec-pag", yearSelectId: "year-dec-pag", optionsContainerId: "decir-pag-options",
                    monthNames: [...DECIR_MONTH_NAMES, "Cod.A33"], includeExtraButton: true, extraButtonFunc: handleCodA33Button,
                    loadDataFunc: async (y, m) => ({elems: await loadDecirPayElements(), turnos: await loadShiftsByNI(y, m + 4)}), 
                    createTableFunc: (cId, y, m, d) => createDecirPayTable(cId, y, m + 4, d.elems, d.turnos),
                    totalContainerId: "decir-payment-totals", blockedMonths: []}},
      "decir-anepc": {tableId: "table-container-dec-anepc", optionsId: "decir-anepc-options", monthsId: "months-container-dec-anepc",
                      generic: {containerId: "months-container-dec-anepc", tableContainerId: "table-container-dec-anepc", yearSelectId: "year-dec-anepc", optionsContainerId: "decir-anepc-options",
                      monthNames: DECIR_MONTH_NAMES, blockedMonths: [], loadDataFunc: async (y, m) => ({elems: await loadDecirANEPCElements(), turnos: await loadShiftsByNI(y, m + 4)}),
                      createTableFunc: (cId, y, m, d) => createDecirAnepcTable(cId, y, m + 4, d.elems, d.turnos)}},
      "decir-reg-ocorr": {init: createDecirOccurrencesTable},
      "decir-reg-ref": {tableId: "table-container-dec-ref", optionsId: "decir-ref-options", monthsId: "months-container-dec-ref",
                        generic: {containerId: "months-container-dec-ref", tableContainerId: "table-container-dec-ref", yearSelectId: "year-dec-ref", optionsContainerId: "decir-ref-options",
                        monthNames: DECIR_MONTH_NAMES, blockedMonths: [], loadDataFunc: async (y, m) => m, createTableFunc: (cId, y, m, d) => createDecirMealTable(cId, y, m + 4, d)}},
      "decir-reg-signa": {init: createDecirSignaTable}
    };
    document.querySelectorAll(".sidebar-submenu-button, .sidebar-sub-submenu-button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (btn.dataset.page === "decir-sca-view") {
          const container = document.getElementById("months-container-dec-view");
          if (!container) return;
          container.innerHTML = "";
          createDecirButtonsGeneric({
            containerId: "months-container-dec-view", tableContainerId: "table-container-dec-view", yearSelectId: "year-dec-view", 
            optionsContainerId: "decir-view-options", monthNames: DECIR_MONTH_NAMES, blockedMonths: [], loadDataFunc: async (y, m) => loadDecirData(), 
            createTableFunc: (cId, y, m, data) => createDecirViewTable(cId, y, m + 4, data)});
          return;
        }
        if (btn.getAttribute("data-access") === "Atualização de Valores") {
          e.preventDefault(); e.stopPropagation();
          openConfigDecirModal();
          return;
        }
        const cfg = PAGE_CONFIGS[btn.dataset.page];
        if (!cfg) return;
        if (cfg.init) {cfg.init(); return;}
        const clear = id => {const el = $(id); if (el) el.innerHTML = "";};
        clear(cfg.tableId);
        const opt = $(cfg.optionsId); if (opt) opt.style.display = "none";
        (cfg.extra || []).forEach(id => {
          const el = $(id);
          if (!el) return;
          if (id.startsWith("table-container")) el.innerHTML = "";
          el.style.display = "none";
        });
        document.querySelectorAll(`#${cfg.monthsId} .btn`).forEach(b => b.classList.remove("active"));
        createDecirButtonsGeneric(cfg.generic);
        loadDecirConfigValues();
      });
    });
    /* ─── LOADERS (DECIR) ────────────────────────────────────── */
    async function loadDecirConfigValues() {
      try {
        const data = await supabaseFetch("decir_values_config?select=amal_value,anepc_value&limit=1");
        if (!data.length) return;
        const fmt = v => v.toLocaleString('pt-PT',{minimumFractionDigits:2,maximumFractionDigits:2});
        const [fA, fN] = [fmt(data[0].amal_value), fmt(data[0].anepc_value)];
        ["amal-value-reg","anepc-value-reg","amal-value-pag","anepc-value-pag","amal-value-anepc","anepc-value-anepc"]
          .forEach((id,i) => {const el=$(id); if(el) el.value = i%2===0 ? fA : fN;});
        updateAllValues();
      } catch {
        showPopupWarning("Erro ao carregar valores de configuração.");
      }
    }
    async function loadDecirRegData() {
      try {
        const data = await supabaseFetch("reg_elems?select=n_int,abv_name,patent_abv&n_int=gt.008&n_int=lt.400&elem_state=eq.true");
        return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch {
        showPopupWarning("Erro ao carregar dados dos elementos.");
        return [];
      }
    }
    async function loadDecirElements(select) {
      try {
        const data = await supabaseFetch(`reg_elems?select=${select}&n_int=gt.008&n_int=lt.400&elem_state=eq.true`);
        return data.sort((a,b) => parseInt(a.n_int,10) - parseInt(b.n_int,10));
      } catch {
        showPopupWarning("Erro ao carregar lista de elementos.");
        return [];
      }
    }
    const loadDecirPayElements = () => loadDecirElements("n_int,full_name,nif,nib");
    const loadDecirCodA33Elements = () => loadDecirElements("n_int,full_name,nif");
    const loadDecirANEPCElements = () => loadDecirElements("n_int,n_file,patent,full_name");
    async function loadShiftsByNI(year, month) {
      try {
        const data = await supabaseFetch(`decir_reg_pag?select=n_int,turno,day&year=eq.${year}&month=eq.${month}`);
        return data.reduce((map,item) => {
          const ni = parseInt(item.n_int,10);
          map[ni] = (map[ni]||0) + 1;
          return map;
        }, {});
      } catch {
        return {};
      }
    }
    /* ─── SAVED DATA LOADER DECIR (IIFE) ─────────────────────── */
    (function() {
      async function loadDecirSavedData(year, month) {
        try {
          const url = `${window.SUPABASE_URL||SUPABASE_URL}/rest/v1/decir_reg_pag?select=n_int,day,turno&year=eq.${year}&month=eq.${month}&corp_oper_nr=eq.${getCorpId()}`;
          const res = await fetch(url, {headers: window.getSupabaseHeaders ? window.getSupabaseHeaders() : getSupabaseHeaders()});
          if (!res.ok) return {};
          const data = await res.json();
          return data.reduce((map,item) => {map[`${item.n_int}_${item.turno}_${item.day}`]="X"; return map;}, {});
        } catch {
          return {};
        }
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
            if (cell && map[`${n_int}_${turno}_${d}`]) {cell.textContent = "X"; marked = true;}
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
          await new Promise(r => setTimeout(r, 0));
          const tbody = document.querySelector("#table-container-dec-reg table tbody");
          if (!tbody) return;
          const map = await loadDecirSavedData(year, month);
          if (Object.keys(map).length) applyDecirMapToTable(map);
        } catch(err) {
          console.error("Erro ao carregar DECIR:", err);
        }
      }
      window.loadDecirByMonth = loadDecirByMonth;
    })();
    /* ─── HEADERS DE DIA (DECIR) ─────────────────────────────── */
    function updateDECIRDayHeaders(table, year, month, daysInMonth, holidays) {
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
    /* ─── CONSULTA ESCALAS DECIR ─────────────────────────────── */
    /* ─── TABELA: VISUALIZAÇÃO ESCALAS DECIR ─────────────────── */
    async function createDecirViewTable(containerId, year, month, data) {
      const container = document.getElementById(containerId) || $(containerId);
      if (!container) return;
      container.innerHTML = "";
      createTableHeaders(container, year, month, "DECIR");
      const wrapper = createTableWrapper(container);
      const table = createTableStructure(wrapper);
      const daysInMonth = new Date(year, month, 0).getDate();
      const holidays = getPortugalHolidays(year);
      updateScalesDayHeaders(table, year, month, daysInMonth, holidays);
      const savedMap = await loadSavedData("DECIR", year, month);
      const tbody = table.querySelector("tbody");
      data.forEach(item => {
        const nIntStr = String(item.n_int).padStart(3,"0");
        const tr = document.createElement("tr");
        tr.setAttribute("data-nint", nIntStr);
        ["NI","Nome","Catg."].forEach(f => {
          const td = document.createElement("td");
          td.style.cssText = COMMON_TD_STYLE;
          td.textContent = f==="NI" ? nIntStr : f==="Nome" ? item.abv_name : item.patent_abv||"";
          tr.appendChild(td);
        });
        for (let d = 1; d <= 31; d++) {
          const td = document.createElement("td");
          td.className = `day-cell-${d}`;
          td.style.cssText = COMMON_TD_STYLE;
          td.style.fontWeight = "bold";
          td.style.display = d <= daysInMonth ? "" : "none";
          td._year = year;
          if (d <= daysInMonth) {
            const cellValue = (savedMap[`${nIntStr}_${d}`] || "").toUpperCase();
            td.textContent = cellValue;
            const date = new Date(year, month - 1, d);
            if (cellValue) {
              updateCellColor(td, cellValue, date);
            } else {
              const holiday = holidays?.find(h => h.date.getDate() === d && h.date.getMonth() === month - 1);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              if (holiday) {
                td.style.background = holiday.optional ? "#2ecc71" : "#ffcccc";
                td.style.color = holiday.optional ? "#fff" : "#000";
              } else if (isWeekend) {
                td.style.background = WEEKEND_COLOR;
                td.style.color = "#000";
              } else {
                td.style.background = "transparent";
                td.style.color = "#000";
              }
            }
          }
          tr.appendChild(td);
        }
        const tdTotal = document.createElement("td");
        tdTotal.className = "total-cell";
        tdTotal.style.cssText = COMMON_TDTOTAL_STYLE;
        tr.appendChild(tdTotal);
        calculateVolunteersRowTotal(tr, "DECIR", daysInMonth);
        tbody.appendChild(tr);
      });
      createMPRows(tbody, daysInMonth, "DECIR");
      calculateMPTotals(tbody, daysInMonth, data, "DECIR");
      createTotalsRow(tbody, daysInMonth);
      calculateColumnTotals(tbody, "DECIR", daysInMonth);
      createLegendScale(containerId, DECIR_LEGEND);
    }
    /* ─── TABELA: REGISTOS (DECIR) ───────────────────────────── */    
    async function createDecirRegTable(containerId, year, month, data) {
      const container = $(containerId);
      if (!container) return;
      container.innerHTML = "";
      const daysInMonth = new Date(year, month, 0).getDate();
      container.appendChild(makeTitle(`REGISTO DECIR - ${MONTH_NAMES_UPPER[month-1]} ${year}`));
      const wrapper = makeWrapper(container);
      const table = document.createElement("table");
      table.className = "decir-reg-table";
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
      const holidays = getPortugalHolidays(year);
      updateDECIRDayHeaders(table, year, month, daysInMonth, holidays);
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
        if (dir==="right") return idx<cells.length-1 ? cells[idx+1] : (rows[rowIdx+1] ? getEditable(rows[rowIdx+1])[0] : null);
        if (dir==="left") return idx>0 ? cells[idx-1] : null;
        if (dir==="down") {const nr=rows[rowIdx+1]; return nr ? getEditable(nr)[Math.min(idx,getEditable(nr).length-1)] : null;}
        if (dir==="up") {const pr=rows[rowIdx-1]; return pr ? getEditable(pr)[Math.min(idx,getEditable(pr).length-1)] : null;}
        return null;
      };
      const createDayCell = (dayNum, trRef) => {
            const td = document.createElement("td");
        td.className = `day-cell-${dayNum}`;
        td.contentEditable = true;
        td.style.cssText = COMMON_TD_STYLE;
        if (trRef.querySelector("td")?.textContent.trim()==="N") td.style.borderBottom = "2px solid #ccc";
        const date = new Date(year, month - 1, dayNum);
        const holiday = holidays.find(h => h.date.getDate() === dayNum && h.date.getMonth() === month - 1);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const setDayCellBg = () => {
          if (holiday) {td.style.background = holiday.optional ? "#2ecc71" : "#ffcccc"; td.style.color = holiday.optional ? "#fff" : "#000";}
          else if (isWeekend) {td.style.background = WEEKEND_COLOR; td.style.color = "#000";}
          else {td.style.background = ""; td.style.color = "";}
        };
        setDayCellBg();
        td.addEventListener("input", () => {
          let v = td.textContent.toUpperCase().trim();
          v = v.length>1 ? v[0] : v;
          td.textContent = v==="X" ? "X" : "";
          setDayCellBg();
          updateRowTotal(trRef);
          if (v==="X") {const next=navigate(td,"right"); if(next) setTimeout(()=>focusCell(next),0);}
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
        tbody.querySelectorAll("tr:not(.total-elements-row) .total-cell").forEach(tc => {totalGeral += parseInt(tc.textContent,10)||0;});
        totalRow.querySelector(".total-general").textContent = totalGeral;
      };
      updateDailyTotals();
      updateAllValues();
      const firstEditable = tbody.querySelector("td[contenteditable='true']");
      if (firstEditable) firstEditable.focus();
    }
    /* ─── TABELA: PAGAMENTOS (DECIR) ─────────────────────────── */
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
        tr.appendChild(makeTd(elem.nif||"", "text-align:center;padding:6px 8px;"));
        tr.appendChild(makeTd(elem.nib||"", "text-align:center;padding:6px 8px;"));
        const tdTurnos = makeTd(String(qtdTurnos), "text-align:center;font-weight:bold;padding:6px 8px;");
        tr.appendChild(tdTurnos);
        const tdValor = document.createElement("td");
        tdValor.style.cssText = COMMON_TDTOTAL_STYLE + "text-align:right;font-weight:bold;padding:6px 8px;";
        const updateValor = () => {
          const total = (parseVal("amal-value-pag") + parseVal("anepc-value-pag")) * qtdTurnos;
          tdValor.textContent = formatCurrency(total);
        };
        updateValor();
        ["amal-value-pag","anepc-value-pag"].forEach(id => {const el=$(id); if(el) el.addEventListener("input", updateValor);});
        tr.appendChild(tdValor);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      wrapper.appendChild(table);
      $("decir-pag-options") && ($("decir-pag-options").style.display="flex");
      updateDECIRTotalPaymentsByMonth();
    }
    /* ─── TABELA: COD A33 (DECIR) ────────────────────────────── */
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
        tr.appendChild(makeTd(elem.nif||"", "text-align:center;padding:6px 8px;"));
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
      ["amal-value-pag","anepc-value-pag"].forEach(id => {const el=$(id); if(el) el.addEventListener("input", updateAllValues);});
      if (typeof updateDECIRTotalPaymentsByMonth==='function') updateDECIRTotalPaymentsByMonth();
    }
    /* ─── TABELA: ANEPC (DECIR) ──────────────────────────────── */
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
      const trh = document.createElement("tr");
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
        const updateValor = () => {tdValue.textContent = formatCurrency(parseVal("anepc-value-anepc") * qtyShifts);};
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
    /* ─── CÁLCULOS (DECIR) ───────────────────────────────────── */
    function updateAllValues() {
      const amalCents  = Math.round(parseVal("amal-value-reg") * 100);
      const anepcCents = Math.round(parseVal("anepc-value-reg") * 100);
      const tbody = document.querySelector("#decir-reg table.month-table tbody");
      console.log("updateAllValues tbody:", tbody);
  console.log("amalCents:", amalCents, "anepcCents:", anepcCents);
      if (!tbody) return;
      const rows = Array.from(tbody.querySelectorAll("tr"));
      for (let i=0; i<rows.length; i+=2) {
        const [trD, trN] = [rows[i], rows[i+1]];
        if (!trN) continue;
        const sum = (Number(trD.querySelector("td.total-cell")?.textContent)||0) + (Number(trN.querySelector("td.total-cell")?.textContent)||0);
        const tds = Array.from(trD.querySelectorAll("td"));
        const [amalCell, anepcCell, globalCell] = tds.slice(-3);
        if (amalCell) amalCell.textContent = formatCurrency((sum * amalCents)  / 100);
        if (anepcCell) anepcCell.textContent = formatCurrency((sum * anepcCents) / 100);
        if (globalCell) globalCell.textContent = formatCurrency((sum * (amalCents + anepcCents)) / 100);
      }
      setTimeout(updateGeneralTotals, 0);
    }
    function updateGeneralTotals() {
      const tbody = document.querySelector("#decir-reg table.month-table tbody");
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
        <div style="display: flex; justify-content: flex-end; font-size: 16px; font-weight: bold;">
          <div style="padding: 8px 10px; border: 1px solid #ccc; border-right: 0; background: #f7f7f7; width: 163px; text-align: right; border-top-left-radius: 5px;
                      border-bottom-left-radius:5px;">TOTAL A PAGAR:</div>
          <div style="padding: 8px 10px; border: 1px solid #ccc; background: #e0f7e0; color: #006400; width: 203px; text-align: right; border-top-right-radius: 5px;
                      border-bottom-right-radius: 5px;">${formatCurrency(grandTotalCents/100)}</div>
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
        monthIndices.forEach((idx,i) => {if(idx>=0&&tds[idx]) monthSums[i] += Math.round(parseCurrency(tds[idx].textContent)*100);});
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
    /* ─── LIMPAR TABELA (DECIR) ──────────────────────────────── */
    async function clearDecirTable() {
      if (!$("table-container-dec-reg")) return;
      const monthBtn = document.querySelector("#months-container-dec-reg .btn.active");
      if (!monthBtn) return showPopupWarning("Nenhum mês selecionado.");
      const month = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthBtn) + 1 + 4;
      const year  = parseInt($("year-dec-reg").value, 10);
      if (!confirm(`Tem certeza que quer limpar os dados de ${monthBtn.textContent.trim()} de ${year}?`)) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_pag?year=eq.${year}&month=eq.${month}`, {method:"DELETE", headers:getSupabaseHeaders()});
        if (!res.ok) throw new Error(await res.text()||"Erro ao apagar dados");
        showPopupSuccess(`✅ Dados de ${monthBtn.textContent.trim()} de ${year} apagados com sucesso!`);
      } catch(err) {
        console.error(err); showPopupWarning("❌ Erro ao apagar: "+err.message);
      }
    }
    /* ─── GUARDAR REGISTO (DECIR) ────────────────────────────── */
    async function saveDecirFull() {
      const table = document.querySelector("#table-container-dec-reg table tbody");
      if (!table) return showPopupWarning("Nenhuma tabela aberta.");
      const corpOperNr = getCorpId();
      const year = parseInt($("year-dec-reg")?.value, 10);
      const monthBtn = document.querySelector("#months-container-dec-reg .btn.active");
      if (!monthBtn) return showPopupWarning("Nenhum mês selecionado.");
      const month = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthBtn) + 1 + 4;
      const btn = $("guardar-dec-btn");
      if (btn) {btn.disabled=true; btn.textContent="A gravar...";}
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
        }).then(r => {if(!r.ok) throw new Error("Erro ao limpar registos antigos");});
        if (payload.length>0) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_pag`, {
            method:"POST",
            headers:{...getSupabaseHeaders(),"Content-Type":"application/json","Prefer":"return=minimal"},
            body:JSON.stringify(payload)
          });
          if (!r.ok) throw new Error(await r.text()||"Erro desconhecido ao gravar");
        }
        showPopupSuccess("✅ Registo DECIR gravado com sucesso!");
      } catch(err) {
        console.error(err);
        showPopupWarning("❌ Erro ao gravar: "+err.message);
      }
      finally {if(btn) {btn.disabled=false; btn.textContent="Guardar";}}
    }
    /* ─── GERAR FICHEIROS EXCEL (DECIR) ──────────────────────── */
    async function generateDECIRFiles(type, format = "xlsx") {
      let data = { type, format };
      if (type === 'reg') {
        const table = document.querySelector("#table-container-dec-reg table tbody");
        if (!table) return alert("Tabela de registo diário não encontrada.");
        const monthSelect = document.querySelector("#months-container-dec-reg .btn.active");
        const yearInput = $("year-dec-reg");
        if (!monthSelect||!yearInput) return alert("Selecione mês e ano.");
        const monthIdx = Array.from(document.querySelectorAll("#months-container-dec-reg .btn")).indexOf(monthSelect) + 1 + 4;
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
          return {ni: parseInt(cells[0].textContent.trim(),10), nome: cells[1]?.textContent.trim()||"", nif: cells[2]?.textContent.trim()||"", nib: cells[3]?.textContent.trim()||"",
                  qtdTurnos: parseInt(cells[4]?.textContent.trim()||0,10), valor: parseCurrency(cells[5]?.textContent)};});
        data = {...data, fileName:`PAGAMENTOS_DECIR_${monthName}_${year}`, monthName, year, rows};
      } else if (type === 'code_a33') {
        const table = document.querySelector("#table-container-dec-coda33 tbody");
        if (!table) return alert("Tabela Cod.A33 não encontrada.");
        const yearInput = $("year-dec-pag");
        if (!yearInput) return alert("Selecione ano.");
        const year = parseInt(yearInput.value,10);
        const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
          const cells = tr.querySelectorAll("td");
          return {ni: parseInt(cells[0]?.textContent.trim(),10)||0, nome: cells[1]?.textContent.trim()||'', nif: cells[2]?.textContent.trim()||'',
                  ABRIL: parseCurrency(cells[4]?.textContent), MAIO: parseCurrency(cells[6]?.textContent), JUNHO: parseCurrency(cells[8]?.textContent), JULHO: parseCurrency(cells[10]?.textContent),
                  AGOSTO: parseCurrency(cells[12]?.textContent), SETEMBRO: parseCurrency(cells[14]?.textContent), OUTUBRO: parseCurrency(cells[16]?.textContent)};
        }).filter(r => r.ni>0 && (r.ABRIL||r.MAIO||r.JUNHO||r.JULHO||r.AGOSTO||r.SETEMBRO||r.OUTUBRO));
        data = {...data, fileName:`CODA33_DECIR_${year}`, year, rows};
      } else if (type === 'anepc') {
        const table = document.querySelector(".anepc-table tbody");
        if (!table) return alert("Tabela ANEPC não encontrada.");
        const monthSelect = document.querySelector("#months-container-dec-anepc .btn.active");
        const yearInput = $("year-dec-anepc");
        const monthName = monthSelect ? monthSelect.textContent.trim() : 'MÊS';
        const year = yearInput ? parseInt(yearInput.value,10) : new Date().getFullYear();
        const rows = Array.from(table.querySelectorAll("tr")).map(tr => {
          const cells = tr.querySelectorAll("td");
          if (cells.length<5) return null;
          return {niFile:cells[0]?.textContent.trim()||'', funcao:cells[1]?.textContent.trim()||'', nome:cells[2]?.textContent.trim()||'', 
                  qtdTurnos:parseInt(cells[3]?.textContent.trim()||0,10), valor:parseCurrency(cells[4]?.textContent)};
        }).filter(r => r && (r.qtdTurnos>0||r.valor>0));
        data = {...data, fileName:`RELATORIO_ANEPC_${monthName}_${year}`, monthName, year, rows};
      } else if (type === 'ocorr') {
        const year = document.getElementById("year-dec-ocorr")?.value || String(new Date().getFullYear());
        const OCORR_MONTHS = ["Maio","Junho","Julho","Agosto","Setembro","Outubro"];
        const tbody = document.querySelector("#decir-reg-ocorr table tbody");
        if (!tbody) return alert("Tabela não encontrada.");
        const rows = Array.from(tbody.querySelectorAll("tr")).map((tr, rowIdx) => {
          const tds = Array.from(tr.querySelectorAll("td"));
          const record = { row_index: rowIdx };
          OCORR_MONTHS.forEach((month, mIdx) => {
            const base = mIdx * 3;
            record[month] = {occurrence: tds[base]?.textContent.trim() || "", date: tds[base+1]?.textContent.trim() || "", acting: tds[base+2]?.querySelector("select")?.value || ""};
          });
          return record;
        }).filter(r => OCORR_MONTHS.some(m => r[m].occurrence));
        data = {...data, fileName:`OCORRENCIAS_DECIR_${year}`, year, rows};
      } else if (type === 'ref') {
        const monthBtn = document.querySelector("#months-container-dec-ref .btn.active");
        const yearInput = document.getElementById("year-dec-ref");
        if (!monthBtn || !yearInput) return alert("Selecione mês e ano.");
        const monthName = monthBtn.textContent.trim();
        const year = yearInput.value;
        const tbody = document.querySelector("#table-container-dec-ref table tbody");
        if (!tbody) return alert("Tabela não encontrada.");
        const rows = Array.from(tbody.querySelectorAll("tr")).map(tr => {
          const tds = Array.from(tr.querySelectorAll("td"));
          const day = tds[0]?.textContent.trim();
          const alert_state = tds[2]?.querySelector("select")?.value || "";
          const restaurant = tds[3]?.querySelector("select")?.value || "";
          const meal_prev = tds[4]?.textContent.trim();
          const meal_efet = tds[5]?.textContent.trim();
          const meal_devi = tds[6]?.textContent.trim();
          const resp_name = tds[8]?.textContent.trim();
          if (!alert_state && !restaurant && !meal_prev && !meal_efet && !resp_name) return null;
          return {day, alert_state, restaurant, meal_prev, meal_efet, meal_devi, resp_name};
        }).filter(r => r !== null);
        data = {...data, fileName:`REFEICOES_DECIR_${monthName}_${year}`, monthName, year, rows};
      }
      try {
        const res = await fetch("https://cb360-online.vercel.app/api/decir_reg_pag", {
          method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)
        });
        if (!res.ok) {const err=await res.json(); return alert("Erro: "+(err.details||err.error));}
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href=url; a.download=`${data.fileName}.${format}`;
        document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
      } catch(err) {
        alert("Erro ao gerar ficheiro: "+err.message);
      }
    }
    /* ─── EVENT LISTENERS (DECIR) ────────────────────────────── */
    ["emit-pag-dec-btn","emit-reg-dec-btn","emit-coda33-dec-btn","emit-anepc-dec-btn","emit-ocorr-dec-btn","emit-ref-dec-btn"].forEach((id,i) => {
      $(id)?.addEventListener("click", () => generateDECIRFiles(['pag','reg','code_a33','anepc','ocorr','ref'][i]));
    });
    $("emit-reg-pdf-btn")?.addEventListener("click", () => generateDECIRFiles('reg', 'pdf'));
    $("delete-dec-btn")?.addEventListener("click", clearDecirTable);
    $("guardar-dec-btn")?.addEventListener("click", saveDecirFull);
    $("emit-pag-pdf-btn")?.addEventListener("click", () => generateDECIRFiles('pag', 'pdf'));
    $("emit-coda33-pdf-btn")?.addEventListener("click", () => generateDECIRFiles('code_a33', 'pdf'));
    $("emit-anepc-pdf-btn")?.addEventListener("click", () => generateDECIRFiles('anepc', 'pdf'));
    $("guardar-ocorr-btn")?.addEventListener("click", saveDecirOccurrences);
    $("emit-ocorr-pdf-btn")?.addEventListener("click", () => generateDECIRFiles('ocorr', 'pdf'));
    $("guardar-ref-btn")?.addEventListener("click", saveDecirMeals);
    $("emit-ref-pdf-btn")?.addEventListener("click", () => generateDECIRFiles('ref', 'pdf'));    
    /* ─── COD A33 HANDLER (DECIR) ────────────────────────────── */
    async function handleCodA33Button() {
      const tableContainer = $("table-container-dec-coda33");
      const emitBtn = $("emit-coda33-dec-btn");
      if (emitBtn) emitBtn.style.display = "block";
      if (tableContainer) tableContainer.style.display = "block";
      const year = parseInt($("year-dec-pag")?.value || new Date().getFullYear(), 10);
      try {
        const elements = await loadDecirCodA33Elements();
        const months = [4, 5, 6, 7, 8, 9, 10];
        const turnosPorMes = {};
        const allShifts = await Promise.all(months.map(m => loadShiftsByNI(year, m)));
        allShifts.forEach((t, i) => {turnosPorMes[months[i]] = t;});
        if (!elements.length) {
          tableContainer.innerHTML = "<p>Nenhum elemento encontrado.</p>";
          return;
        }
        createDecirCodA33Table("table-container-dec-coda33", year, elements, turnosPorMes);
      } catch (err) {
        console.error("Erro no COD.A33:", err);
      }
    }
    /* ─── TABELA: CONTROLO DE OCORRÊNCIAS (DECIR) ───────────── */
    function createDecirOccurrencesTable() {
      const container = document.querySelector("#decir-reg-ocorr .card-body");
      if (!container) return;
      container.innerHTML = "";
      const OCORR_MONTHS = ["Maio","Junho","Julho","Agosto","Setembro","Outubro"];
      const NUM_ROWS = 30;
      const style = document.createElement("style");
      style.textContent = `#decir-reg-ocorr .card-body > div::-webkit-scrollbar {display: none;}
        .ocorr-select {width: 100%; border: none; background: transparent; cursor: pointer; font-size: 11px; text-align: center; outline: none; appearance: none;
        -webkit-appearance: none; color: #333; padding: 0;}
        .ocorr-select:focus {background: #eef0ff;}
        .ocorr-select option {background: #fff; color: #333;}
        `;
      document.head.appendChild(style);
      const title = document.createElement("div");
      title.textContent = "REGISTO DE OCORRÊNCIAS DECIR";
      Object.assign(title.style, {textAlign: "center", fontWeight: "bold", fontSize: "15px", fontFamily: "Segoe UI, sans-serif", color: "#131a69", marginBottom: "10px", letterSpacing: "0.5px"});
      container.appendChild(title);
      const yearContainer = document.createElement("div");
      Object.assign(yearContainer.style, {display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "10px"});
      const yearLabel = document.createElement("label");
      yearLabel.textContent = "Ano:";
      yearLabel.style.fontWeight = "bold";
      yearLabel.style.fontFamily = "Segoe UI, sans-serif";
      const yearSelect = document.createElement("select");
      yearSelect.id = "year-dec-ocorr";
      Object.assign(yearSelect.style, {padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer"});
      const targetYear = new Date().getFullYear();
      for (let y = 2026; y <= 2036; y++) { 
        const opt = document.createElement("option");
        opt.value = y; opt.textContent = y;
        if (y === targetYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }
      setTimeout(() => {yearSelect.value = targetYear;}, 0);
      yearSelect.addEventListener("change", () => {
        const tbody = document.querySelector("#decir-reg-ocorr table tbody");
        if (tbody) {
          tbody.querySelectorAll("tr").forEach(tr => {
            Array.from(tr.querySelectorAll("td")).forEach(td => {
              if (td.querySelector("select")) {
                const sel = td.querySelector("select");
                sel.value = "";
                sel.dispatchEvent(new Event("change"));
              } else {
                td.textContent = "";
              }
            });
          });
        }
        loadDecirOccurrences();
      });
      yearContainer.append(yearLabel, yearSelect);
      container.appendChild(yearContainer);
      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {overflowX: "auto", overflowY: "auto", width: "100%", maxHeight: "500px", marginTop: "0px", scrollbarWidth: "none", msOverflowStyle: "none",
                                    borderRadius: "8px", border: "1px solid #ddd", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"});
      const table = document.createElement("table");
      Object.assign(table.style, {width: "100%", borderCollapse: "separate", borderSpacing: "0", fontFamily: "Segoe UI, sans-serif", fontSize: "13px"});
      const thead = document.createElement("thead");
      const trMonths = document.createElement("tr");
      OCORR_MONTHS.forEach((month, mIdx) => {
        const th = document.createElement("th");
        th.textContent = month;
        th.colSpan = 3;
        Object.assign(th.style, {borderBottom: "1px solid #2a3580", borderLeft: mIdx === 0 ? "none" : "1px solid #2a3580", background: "#131a69", color: "#fff", textAlign: "center",
                                 padding: "8px 4px", fontWeight: "bold", position: "sticky", top: "0", zIndex: "2"});
        if (mIdx === 0) th.style.borderTopLeftRadius = "8px";
        if (mIdx === OCORR_MONTHS.length - 1) th.style.borderTopRightRadius = "8px";
        trMonths.appendChild(th);
      });
      thead.appendChild(trMonths);
      const trSubs = document.createElement("tr");
      OCORR_MONTHS.forEach((_, mIdx) => {
        ["Ocorrência","Data","Atuação"].forEach((sub, sIdx) => {
          const th = document.createElement("th");
          th.textContent = sub;
          th.className = "ocorr-sub-header";
          Object.assign(th.style, {borderBottom: "1px solid #ddd", borderLeft: mIdx === 0 && sIdx === 0 ? "none" : "1px solid #2a3580", background: "#1e2a80", color: "#fff", textAlign: "center",
                                   padding: "6px 4px", fontWeight: "normal", fontSize: "12px", whiteSpace: "nowrap", position: "sticky", top: "37px", zIndex: "2"});
          trSubs.appendChild(th);
        });
      });
      thead.appendChild(trSubs);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      for (let r = 0; r < NUM_ROWS; r++) {
        const tr = document.createElement("tr");
        const isLast = r === NUM_ROWS - 1;
        tr.style.background = r % 2 === 0 ? "#fff" : "#f5f6fa";
        OCORR_MONTHS.forEach((_, mIdx) => {
          ["ocorrencia","data","atuacao"].forEach((type, sIdx) => {
            const td = document.createElement("td");
            const isFirstCol = mIdx === 0 && sIdx === 0;
            const isLastCol = mIdx === OCORR_MONTHS.length - 1 && sIdx === 2;
            Object.assign(td.style, {borderBottom: isLast ? "none" : "1px solid #ddd", borderLeft: isFirstCol ? "none" : "1px solid #ddd", padding: "2px 4px",
                                     minWidth: type === "ocorrencia" ? "80px" : type === "data" ? "60px" : "70px", height: "24px", verticalAlign: "middle", textAlign: "center", fontSize: "11px"});
            if (isLast && isFirstCol) td.style.borderBottomLeftRadius = "8px";
            if (isLast && isLastCol) td.style.borderBottomRightRadius = "8px";
            if (type === "atuacao") {
              const sel = document.createElement("select");
              sel.className = "ocorr-select";
              ["","Sim","Não"].forEach(opt => {
                const o = document.createElement("option");
                o.value = opt; o.textContent = opt;
                sel.appendChild(o);
              });
              sel.addEventListener("change", () => {
                td.style.background = sel.value === "Sim" ? "#e0f7e0" : sel.value === "Não" ? "#ffe0e0" : "";
                sel.style.color = sel.value === "Sim" ? "#006400" : sel.value === "Não" ? "#8B0000" : "#333";
                sel.style.fontWeight = sel.value ? "bold" : "normal";
              });
              td.appendChild(sel);
            } else if (type === "data") {
              td.contentEditable = true;
              td.style.outline = "none";
              td.style.cursor = "text";
              td.addEventListener("focus", () => td.style.background = "#eef0ff");
              td.addEventListener("blur", () => {
                td.style.background = "";
                const raw = td.textContent.replace(/\D/g,"").slice(0,2);
                if (raw.length > 0) {
                  const OCORR_MONTHS_NR = ["05","06","07","08","09","10"];
                  const mon = OCORR_MONTHS_NR[mIdx];
                  const yr = document.getElementById("year-dec-ocorr")?.value || String(new Date().getFullYear());
                  td.textContent = raw.padStart(2,"0") + "/" + mon + "/" + yr;
                } else {
                  td.textContent = "";
                }
              });
              td.addEventListener("keydown", e => {
                const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab"];
                if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
                if (/^\d$/.test(e.key) && td.textContent.replace(/\D/g,"").length >= 2) e.preventDefault();
              });
            } else {
              td.contentEditable = true;
              td.style.outline = "none";
              td.style.cursor = "text";
              td.addEventListener("focus", () => td.style.background = "#eef0ff");
              td.addEventListener("blur",  () => td.style.background = "");
              td.addEventListener("keydown", e => {
                const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab"];
                if (!allowed.includes(e.key) && td.textContent.length >= 11) e.preventDefault();
              });
              td.addEventListener("input", () => {
                if (td.textContent.length > 11) td.textContent = td.textContent.slice(0,11);
              });
            }
            tr.appendChild(td);
          });
        });
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      wrapper.appendChild(table);
      container.appendChild(wrapper);
      const options = document.getElementById("decir-ocorr-options");
      if (options) options.style.display = "flex";
      requestAnimationFrame(() => {
        const firstRow = thead.querySelector("tr");
        if (firstRow) {
          const h = firstRow.offsetHeight + "px";
          table.querySelectorAll(".ocorr-sub-header").forEach(th => th.style.top = h);
        }
      });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          loadDecirOccurrences();
        });
      });
    }
    /* ─── LOAD OCORRÊNCIAS (DECIR) ────────────────────────── */
    async function loadDecirOccurrences() {
      const year = document.getElementById("year-dec-ocorr")?.value || String(new Date().getFullYear());
      const corpOperNr = getCorpId();
      try {
        const data = await supabaseFetch(`decir_reg_ocorr?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}`);
        if (!data?.length) return;
        const tbody = document.querySelector("#decir-reg-ocorr table tbody");
        if (!tbody) return;
        const OCORR_MONTHS_NR = ["05","06","07","08","09","10"];
        data.forEach(item => {
          const mIdx = OCORR_MONTHS_NR.indexOf(item.month);
          if (mIdx === -1) return;
          const rows = Array.from(tbody.querySelectorAll("tr"));
          const tr = rows[item.row_index];
          if (!tr) return;
          const tds = Array.from(tr.querySelectorAll("td"));
          const base = mIdx * 3;
          if (tds[base]) tds[base].textContent = item.occurrence || "";
          if (tds[base + 1]) tds[base + 1].textContent = item.day && item.month && item.year
            ? `${item.day}/${item.month}/${item.year}` : "";
          const sel = tds[base + 2]?.querySelector("select");
          if (sel) {
            sel.value = item.acting === true ? "Sim" : item.acting === false ? "Não" : "";
            sel.dispatchEvent(new Event("change"));
          }
        });
      } catch(err) {
        console.error("Erro ao carregar ocorrências:", err);
        showPopupWarning("Erro ao carregar ocorrências.");
      }
    }
    /* ─── GUARDAR OCORRÊNCIAS (DECIR) ────────────────────────── */
    async function saveDecirOccurrences() {
      const container = document.querySelector("#decir-reg-ocorr .card-body");
      if (!container) return showPopupWarning("Tabela não encontrada.");
      const year = document.getElementById("year-dec-ocorr")?.value || String(new Date().getFullYear());
      const corpOperNr = getCorpId();
      const btn = document.getElementById("guardar-ocorr-btn");
      if (btn) {btn.disabled = true; btn.textContent = "A gravar...";}
      try {
        const payload = [];
        const rows = container.querySelectorAll("tbody tr");
        const OCORR_MONTHS = ["Maio","Junho","Julho","Agosto","Setembro","Outubro"];
        rows.forEach((tr, rowIdx) => {
          const tds = Array.from(tr.querySelectorAll("td"));
          OCORR_MONTHS.forEach((_, mIdx) => {
            const base = mIdx * 3;
            const occTd = tds[base];
            const dataTd = tds[base + 1];
            const actTd = tds[base + 2];
            const occurrence = occTd?.textContent.trim();
            if (!occurrence) return;
            const rawDate = dataTd?.textContent.trim();
            const parts = rawDate ? rawDate.split("/") : [];
            const day = parts[0] || "";
            const month = parts[1] || "";
            const yr = parts[2] || year;
            const selEl = actTd?.querySelector("select");
            const acting = selEl?.value === "Sim" ? true : selEl?.value === "Não" ? false : null;
            payload.push({corp_oper_nr: corpOperNr, occurrence, day, month, year: yr, acting, row_index: rowIdx});
          });
        });
        await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_ocorr?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}`, {
          method: "DELETE", headers: getSupabaseHeaders()
        }).then(r => {if (!r.ok) throw new Error("Erro ao limpar registos antigos");});
        if (payload.length > 0) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_ocorr`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
            body: JSON.stringify(payload)
          });
          if (!r.ok) throw new Error(await r.text() || "Erro desconhecido ao gravar");
        }
        showPopupSuccess("✅ Ocorrências gravadas com sucesso!");
      } catch(err) {
        console.error(err);
        showPopupWarning("❌ Erro ao gravar: " + err.message);
      } finally {
        if (btn) {btn.disabled = false; btn.textContent = "Guardar";}
      }
    }
    /* ─── TABELA: REFEIÇÕES (DECIR) ──────────────────────────── */
    function createDecirMealTable(containerId, year, month, data) {
      const container = document.getElementById(containerId) || $(containerId);
      if (!container) return;
      container.innerHTML = "";
      const ALERT_OPTIONS = ["","Monitorização","Nível I - Moderado","Nível II - Elevado","Nível III - Muito Elevado","Nível IV - Extremo"];
      const RESTAURANT_OPTIONS = ["","O Cristina","O Sol"];
      const daysInMonth = new Date(year, month, 0).getDate();
      const holidays = getPortugalHolidays(year);
      const title = document.createElement("div");
      title.textContent = `REGISTO DE REFEIÇÕES DECIR - ${MONTH_NAMES_UPPER[month-1]} ${year}`;
      Object.assign(title.style, {textAlign: "center", fontWeight: "bold", fontSize: "15px", fontFamily: "Segoe UI, sans-serif", color: "#131a69", marginBottom: "10px", marginTop: "10px", letterSpacing: "0.5px"});
      container.appendChild(title);
      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {overflowX: "auto", overflowY: "auto", width: "100%", maxHeight: "500px", scrollbarWidth: "none", msOverflowStyle: "none", borderRadius: "8px", border: "1px solid #ddd",
                                    boxShadow:"0 2px 8px rgba(0,0,0,0.08)"});
      const style = document.createElement("style");
      style.textContent = `
        #decir-reg-ref .card-body > div::-webkit-scrollbar { display: none; }
        .ref-select { width:100%; border:none; background:transparent; cursor:pointer; font-size:11px; text-align:center;
          outline:none; appearance:none; -webkit-appearance:none; color:#333; padding:0; }
        .ref-select:focus { background:#eef0ff; }
        .ref-select option { background:#fff; color:#333; }
      `;
      document.head.appendChild(style);
      const table = document.createElement("table");
      Object.assign(table.style, {width: "100%", borderCollapse: "separate", borderSpacing: "0", fontFamily: "Segoe UI, sans-serif", fontSize: "13px"});
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      const headers = [{label: "Dia", width: "45px", colSpan: 2}, {label: "Estado de Alerta", width: "190px", colSpan: 1}, {label: "Restaurante", width: "190px", colSpan: 1},
                       {label: "Ref. Previstas", width: "120px", colSpan: 1}, {label: "Ref. Efetivas", width: "120px", colSpan: 1}, {label: "Desvio", width: "120px", colSpan: 1},
                       {label: "Responsável", width: "220px", colSpan: 2}];
      headers.forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h.label;
        if (h.colSpan > 1) th.colSpan = h.colSpan;
        Object.assign(th.style, {borderBottom: "1px solid #ddd", borderLeft: "1px solid #ddd", background: "#131a69", color: "#fff", textAlign: "center", padding: "8px 4px", fontWeight: "bold", 
                                 position: "sticky", top: "0", zIndex: "2", width: h.width, whiteSpace: "nowrap"});
        if (i === 0) th.style.borderTopLeftRadius = "8px";
        if (i === headers.length - 1) th.style.borderTopRightRadius = "8px";
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      const getDayBg = (d) => {
        const date = new Date(year, month - 1, d);
        const holiday = holidays.find(h => h.date.getDate() === d && h.date.getMonth() === month - 1);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        if (holiday) return {bg: holiday.optional ? "#2ecc71" : "#ffcccc", color:"#000", title:holiday.name};
        if (isWeekend) return {bg: WEEKEND_COLOR, color:"#000", title:""};
        return {bg:"", color:"", title:""};
      };
      const WEEKDAYS_PT = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
      const allEditableCells = [];
      const navigateCell = (currentTd, dir) => {
        const idx = allEditableCells.indexOf(currentTd);
        if (idx === -1) return;
        if (dir === "right" || dir === "down") {
          const next = allEditableCells[idx + 1];
          if (next) next.focus();
        } else if (dir === "left" || dir === "up") {
          const prev = allEditableCells[idx - 1];
          if (prev) prev.focus();
        }
      };
      for (let d = 1; d <= daysInMonth; d++) {
        const tr = document.createElement("tr");
        const isLast = d === daysInMonth;
        const dayStyle = getDayBg(d);
        const date = new Date(year, month - 1, d);
        const weekday = WEEKDAYS_PT[date.getDay()];
        tr.style.background = dayStyle.bg || (d % 2 === 0 ? "#f5f6fa" : "#fff");
        const makeTdBase = (isFirst, isLast_col) => {
          const td = document.createElement("td");
          Object.assign(td.style, {borderBottom:"1px solid #ddd", borderLeft:"1px solid #ddd", padding:"3px 4px", height:"28px", verticalAlign:"middle", textAlign:"center", fontSize:"11px", 
                                   background:dayStyle.bg || "", color:dayStyle.color || "", borderBottomLeftRadius: isLast && isFirst ? "8px" : "", borderBottomRightRadius: isLast && isLast_col ? "8px" : ""});
          if (dayStyle.title) td.title = dayStyle.title;
          return td;
        };
        const tdDay = makeTdBase(true, false);
        tdDay.textContent = String(d).padStart(2,"0");
        tdDay.style.fontWeight = "bold";
        tdDay.style.width = "80px";
        tr.appendChild(tdDay);
        const tdWek = makeTdBase(false, false);
        tdWek.textContent = weekday;
        tdWek.style.fontWeight = "bold";
        tdWek.style.width = "100px";
        tr.appendChild(tdWek);
        const tdAlert = makeTdBase(false, false);
        const selAlert = document.createElement("select");
        selAlert.className = "ref-select";
        ALERT_OPTIONS.forEach(opt => {
          const o = document.createElement("option");
          o.value = opt; o.textContent = opt || "—";
          selAlert.appendChild(o);
        });
        selAlert.addEventListener("change", () => {
          const colors = {"Monitorização": {bg: "#a5d6a7", color: "#1b5e20"}, "Nível I - Moderado": {bg: "#90caf9", color: "#0d47a1"}, "Nível II - Elevado": {bg: "#fff176", color: "#f57f17"},
                          "Nível III - Muito Elevado": {bg: "#ffb74d", color: "#bf360c"}, "Nível IV - Extremo": {bg: "#ef9a9a", color: "#b71c1c"}};
          const c = colors[selAlert.value];
          tdAlert.style.background = c ? c.bg : (dayStyle.bg || "");
          selAlert.style.color = c ? c.color : "#333";
          selAlert.style.fontWeight = selAlert.value ? "bold" : "normal";
        });
        tdAlert.appendChild(selAlert);
        tr.appendChild(tdAlert);
        const tdRest = makeTdBase(false, false);
        const selRest = document.createElement("select");
        selRest.className = "ref-select";
        RESTAURANT_OPTIONS.forEach(opt => {
          const o = document.createElement("option");
          o.value = opt; o.textContent = opt || "—";
          selRest.appendChild(o);
        });
        tdRest.appendChild(selRest);
        tr.appendChild(tdRest);
        const tdPrev = makeTdBase(false, false);
        tdPrev.style.outline = "none";
        tdPrev.style.cursor = "text";
        tdPrev.addEventListener("focus", () => tdPrev.style.background = "#eef0ff");
        tdPrev.addEventListener("blur", () => {tdPrev.style.background = dayStyle.bg || ""; updateDeviation();});
        tdPrev.addEventListener("keydown", e => {
          if (["ArrowRight","ArrowDown","Enter"].includes(e.key)) {e.preventDefault(); navigateCell(tdPrev, "right");}
          else if (["ArrowLeft","ArrowUp"].includes(e.key)) {e.preventDefault(); navigateCell(tdPrev, "left");}
          else if (!/^\d$/.test(e.key) && !["Backspace","Delete","Tab"].includes(e.key)) e.preventDefault();
        });
        tdPrev.addEventListener("input", updateDeviation);
        tr.appendChild(tdPrev);
        allEditableCells.push(tdPrev);
        const tdEfet = makeTdBase(false, false);
        tdEfet.contentEditable = true;
        tdEfet.style.outline = "none";
        tdEfet.style.cursor = "text";
        tdEfet.addEventListener("focus", () => tdEfet.style.background = "#eef0ff");
        tdEfet.addEventListener("blur", () => {tdEfet.style.background = dayStyle.bg || ""; updateDeviation();});
        tdEfet.addEventListener("keydown", e => {
          if (["ArrowRight","ArrowDown","Enter"].includes(e.key)) {e.preventDefault(); navigateCell(tdEfet, "right");}
          else if (["ArrowLeft","ArrowUp"].includes(e.key)) {e.preventDefault(); navigateCell(tdEfet, "left");}
          else if (!/^\d$/.test(e.key) && !["Backspace","Delete","Tab"].includes(e.key)) e.preventDefault();
        });
        tdEfet.addEventListener("input", updateDeviation);
        tr.appendChild(tdEfet);
        allEditableCells.push(tdEfet);
        const tdDeviation = makeTdBase(false, false);
        tdDeviation.style.fontWeight = "bold";
        function updateDeviation() {
          const prev = parseInt(tdPrev.textContent.trim()) || 0;
          const efet = parseInt(tdEfet.textContent.trim()) || 0;
          const desvio = efet - prev;
          const hasPrev = tdPrev.textContent.trim() !== "";
          const hasEfet = tdEfet.textContent.trim() !== "";
          if (!hasPrev && !hasEfet) {
            tdDeviation.textContent = "";
            tdDeviation.style.color = "#333";
          } else {
            tdDeviation.textContent = desvio > 0 ? `+${desvio}` : String(desvio);
            tdDeviation.style.color = desvio < 0 ? "#c62828" : desvio > 0 ? "#006400" : "#333";
          }
        }
        tr.appendChild(tdDeviation);
        const tdResp = makeTdBase(false, true);
        tdResp.style.textAlign = "left";
        tdResp.style.paddingLeft = "6px";
        const tdNI = makeTdBase(false, false);
        tdNI.contentEditable = true;
        tdNI.style.outline = "none";
        tdNI.style.cursor = "text";
        tdNI.style.width = "80px";
        tdNI.style.minWidth = "80px";
        tdNI.style.maxWidth = "80px";
        tdNI.addEventListener("focus", () => tdNI.style.background = "#eef0ff");
        tdNI.addEventListener("blur", () => tdNI.style.background = dayStyle.bg || "");
        tdNI.addEventListener("keydown", e => {
          if (["ArrowRight","ArrowDown","Enter"].includes(e.key)) {e.preventDefault(); navigateCell(tdNI, "right");}
          else if (["ArrowLeft","ArrowUp"].includes(e.key)) {e.preventDefault(); navigateCell(tdNI, "left");}
          else if (/^\d$/.test(e.key) && tdNI.textContent.replace(/\D/g,"").length >= 3) e.preventDefault();
          else if (!/^\d$/.test(e.key) && !["Backspace","Delete","Tab"].includes(e.key)) e.preventDefault();
        });
        tdNI.addEventListener("input", async () => {
          const ni = tdNI.textContent.trim();
          if (ni.length === 3) {
            try {
              const result = await supabaseFetch(`reg_elems?select=patent_abv,abv_name&n_int=eq.${ni}&corp_oper_nr=eq.${getCorpId()}&limit=1`);
              tdResp.textContent = result?.length ? `${result[0].patent_abv || ""} ${result[0].abv_name || ""}`.trim() : "";
            } catch {
              tdResp.textContent = "";
            }
          } else {
            tdResp.textContent = "";
          }
        });
        tr.appendChild(tdNI);
        allEditableCells.push(tdNI);
        tr.appendChild(tdResp);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      wrapper.appendChild(table);
      container.appendChild(wrapper);
      const options = document.getElementById("decir-ref-options");
      if (options) options.style.display = "flex";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          loadDecirMeals();
        });
      });
    }
    /* ─── LOAD REFEIÇÕES (DECIR) ─────────────────────────────── */
    async function loadDecirMeals() {
      const month_btn = document.querySelector("#months-container-dec-ref .btn.active");
      if (!month_btn) return;
      const monthIdx = Array.from(document.querySelectorAll("#months-container-dec-ref .btn")).indexOf(month_btn) + 1;
      const month = String(monthIdx + 4).padStart(2,"0");
      const year = document.getElementById("year-dec-ref")?.value || String(new Date().getFullYear());
      const corpOperNr = getCorpId();
      try {
        const [data, regServ] = await Promise.all([
          supabaseFetch(`decir_reg_meals?corp_oper_nr=eq.${corpOperNr}&month=eq.${month}&year=eq.${year}`),
          supabaseFetch(`reg_serv?corp_oper_nr=eq.${corpOperNr}&month=eq.${month}&year=eq.${year}&value=in.(ED,ET)`)
        ]);
        const prevByDay = {};
        (regServ || []).forEach(item => {
          const d = String(parseInt(item.day, 10));
          prevByDay[d] = (prevByDay[d] || 0) + 1;
        });
        if (!data?.length && Object.keys(prevByDay).length === 0) return;
        const tbody = document.querySelector("#table-container-dec-ref table tbody");
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll("tr"));
        rows.forEach((tr, idx) => {
          const day = String(idx + 1);
          const tds = Array.from(tr.querySelectorAll("td"));
          if (tds[4]) tds[4].textContent = String(prevByDay[day] || 0);
        });
        (data || []).forEach(item => {
          const day = parseInt(item.day, 10);
          const tr = rows[day - 1];
          if (!tr) return;
          const tds = Array.from(tr.querySelectorAll("td"));
          const selAlert = tds[2]?.querySelector("select");
          if (selAlert && item.alert_state) {
            selAlert.value = item.alert_state;
            selAlert.dispatchEvent(new Event("change"));
          }
          const selRest = tds[3]?.querySelector("select");
          if (selRest && item.restaurant) selRest.value = item.restaurant;
          if (tds[5]) tds[5].textContent = item.meal_efet || "";
          if (tds[6]) {
            const prev = parseInt(tds[4]?.textContent) || 0;
            const efet = parseInt(item.meal_efet) || 0;
            const desvio = efet - prev;
            const hasEfet = (item.meal_efet || "") !== "";
            if (hasEfet || prev > 0) {
              tds[6].textContent = desvio > 0 ? `+${desvio}` : String(desvio);
              tds[6].style.color = desvio < 0 ? "#c62828" : desvio > 0 ? "#006400" : "#333";
            }
          }
          if (tds[7]) tds[7].textContent = item.ni_resp || "";
          if (item.ni_resp && tds[8]) {
            supabaseFetch(`reg_elems?select=patent_abv,abv_name&n_int=eq.${item.ni_resp}&corp_oper_nr=eq.${corpOperNr}&limit=1`)
              .then(res => {
              if (res?.length) tds[8].textContent = `${res[0].patent_abv || ""} ${res[0].abv_name || ""}`.trim();
            }).catch(() => {});
          }
        });
      } catch(err) {
        console.error("Erro ao carregar refeições:", err);
        showPopupWarning("Erro ao carregar refeições.");
      }
    }
    /* ─── GUARDAR REFEIÇÕES (DECIR) ──────────────────────────── */
    async function saveDecirMeals() {
      const tbody = document.querySelector("#table-container-dec-ref table tbody");
      if (!tbody) return showPopupWarning("Nenhuma tabela aberta.");
      const monthBtn = document.querySelector("#months-container-dec-ref .btn.active");
      if (!monthBtn) return showPopupWarning("Nenhum mês selecionado.");
      const monthIdx = Array.from(document.querySelectorAll("#months-container-dec-ref .btn")).indexOf(monthBtn) + 1;
      const month = String(monthIdx + 4).padStart(2,"0");
      const year = document.getElementById("year-dec-ref")?.value || String(new Date().getFullYear());
      const corpOperNr = getCorpId();
      const btn = document.getElementById("guardar-ref-btn");
      if (btn) {btn.disabled = true; btn.textContent = "A gravar...";}
      try {
        const payload = [];
        Array.from(tbody.querySelectorAll("tr")).forEach(tr => {
          const tds = Array.from(tr.querySelectorAll("td"));
          const day = tds[0]?.textContent.trim();
          const alert_state = tds[2]?.querySelector("select")?.value || "";
          const restaurant = tds[3]?.querySelector("select")?.value || "";          
          const meal_efet = tds[5]?.textContent.trim();
          const ni_resp = tds[7]?.textContent.trim();
          if (!alert_state && !restaurant && !meal_efet && !ni_resp) return;
          payload.push({corp_oper_nr: corpOperNr, day, month, year, alert_state, restaurant, meal_efet, ni_resp});
        });
        await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_meals?corp_oper_nr=eq.${corpOperNr}&month=eq.${month}&year=eq.${year}`, {
          method: "DELETE", headers: getSupabaseHeaders()
        }).then(r => {if (!r.ok) throw new Error("Erro ao limpar registos antigos");});
        if (payload.length > 0) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/decir_reg_meals`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
            body: JSON.stringify(payload)
          });
          if (!r.ok) throw new Error(await r.text() || "Erro desconhecido ao gravar");
        }
        showPopupSuccess("✅ Refeições gravadas com sucesso!");
      } catch(err) {
        console.error(err);
        showPopupWarning("❌ Erro ao gravar: " + err.message);
      } finally {
        if (btn) {btn.disabled = false; btn.textContent = "Guardar";}
      }
    }
    /* ─── FUNÇÕES GLOBAIS SIGNA (DECIR) ─────────────────────── */
    function signaCheckETPlaced(container, nint, day) {
      let hasDay = false, hasNight = false;
      container.querySelectorAll(".signa-drop-zone.filled").forEach(z => {
        if (parseInt(z.dataset.nint, 10) === nint && z.dataset.valueType === "ET" && z.dataset.day === day) {
          if (z.dataset.shift === "day") hasDay = true;
          if (z.dataset.shift === "night") hasNight = true;
        }
      });
      return hasDay && hasNight;
    }
    function signaFillZone(zone, data) {
      const tr = zone.closest("tr");
      if (!tr) return;
      zone.textContent = String(data.nint).padStart(3,"0");
      zone.className = "signa-drop-zone filled" + (data.mp ? " mp-fill" : "");
      zone.dataset.nint = data.nint;
      zone.dataset.valueType = data.valueType;
      zone.dataset.day = data.day;
      zone.dataset.fullname = data.full_name || "";
      zone.draggable = true;
      tr.querySelector(".field-nfile").value = data.n_file || "";
      tr.querySelector(".field-patent").value = data.patent || "";
      tr.querySelector(".field-abvname").value = data.abv_name || "";
    }
    function signaClearRow(zone) {
      const tr = zone.closest("tr");
      if (!tr) return;
      const keepDay = zone.dataset.day;
      const keepShift = zone.dataset.shift;
      const keepSection = zone.dataset.section;
      zone.textContent = "—";
      zone.className = "signa-drop-zone";
      zone.draggable = false;
      zone.dataset.nint = "";
      zone.dataset.valueType = "";
      zone.dataset.day = keepDay;
      zone.dataset.shift = keepShift;
      zone.dataset.section = keepSection;
      tr.querySelector(".field-nfile").value = "";
      tr.querySelector(".field-patent").value = "";
      tr.querySelector(".field-abvname").value = "";
    }
    function signaGetZoneData(zone) {
      const tr = zone.closest("tr");
      if (!tr || !zone.dataset.nint) return null;
      return {nint: parseInt(zone.dataset.nint, 10), n_file: tr.querySelector(".field-nfile").value, patent: tr.querySelector(".field-patent").value, abv_name: tr.querySelector(".field-abvname").value,
              mp: zone.classList.contains("mp-fill"), valueType: zone.dataset.valueType, shift: zone.dataset.shift, day: zone.dataset.day, section: zone.dataset.section};
    }
    function signaBuildTurnoBlock(title, subTitle, positions, shift, turnoDay, section, makePositionRowFn) {
      const block = document.createElement("div");
      block.className = "signa-shift-block";
      const header = document.createElement("div");
      header.className = "signa-shift-header";
      header.textContent = title;
      const sub = document.createElement("div");
      sub.className = "signa-shift-subheader";
      sub.textContent = subTitle;
      block.append(header, sub);
      const table = document.createElement("table");
      table.className = "signa-inner-table";
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      ["","Nº Int.","Nº Mec.","Categ.","Nome Abrev.",""].forEach(h => {
        const th = document.createElement("th"); th.textContent = h; trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      positions.forEach(p => makePositionRowFn(p, tbody, shift, turnoDay, section));
      table.appendChild(tbody);
      block.appendChild(table);
      return block;
    }
    /* ─── EMISSÃO FORMULÁRIOS ANEPC (DECIR) ─────────────────── */
    function createDecirSignaTable() {
      const container = document.querySelector("#decir-reg-signa .card-body");
      if (!container) return;
      container.innerHTML = "";
      const style = document.createElement("style");
      style.textContent = `
        .signa-wrapper {display: flex; gap: 16px; font-family: 'Segoe UI', sans-serif;}
        .signa-tables {flex: 1; min-width: 0;}
        .signa-sidebar {width: 500px; flex-shrink: 0; margin-top: 12px;}
        .signa-date-row {display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;}
        .signa-date-row label {font-weight: bold; font-size: 13px;}
        .signa-date-row input[type="date"] {padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; cursor: pointer;}
        .signa-load-btn {padding: 7px 16px; background: #131a69; color: #fff; border: none; border-radius: 4px; font-weight: bold; font-size: 13px; cursor: pointer;}
        .signa-load-btn:hover {background: #1e2a80;}
        .signa-format-btn {padding: 7px 16px; background: #2e7d32; color: #fff; border: none; border-radius: 4px; font-weight: bold; font-size: 13px; cursor: pointer;}
        .signa-format-btn:hover {background: #1b5e20;}
        .signa-section-title {background: #131a69; color: #fff; font-weight: bold; font-size: 13px; padding: 6px 10px; border-radius: 4px 4px 0 0; margin-top: 12px;}
        .signa-shift-grid {display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px;}
        .signa-shift-block {border: 1px solid #ddd; border-radius: 0 0 4px 4px; overflow: hidden;}
        .signa-shift-header {background: #1e2a80; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 8px; text-align: center;}
        .signa-shift-subheader {background: #f0f0f0; font-size: 10px; font-weight: bold; padding: 2px 6px; color: #333; border-bottom: 1px solid #ddd; text-align: center;}
        .signa-inner-table {width: 100%; border-collapse: collapse; font-size: 11px;}
        .signa-inner-table thead th {background: #2a3580; color: #fff; padding: 3px 5px; text-align: center; font-size: 10px; font-weight: bold; border: 1px solid #1e2a80; white-space: nowrap;}
        .signa-inner-table tbody tr {border-bottom: 1px solid #eee;}
        .signa-inner-table tbody tr:hover {background: #f8f9ff;}
        .signa-inner-table tbody td {padding: 2px 4px; border: 1px solid #eee; text-align: center; font-size: 11px; height: 26px; vertical-align: middle;}
        .signa-pos-label {font-weight: bold; color: #555; background: #f5f5f5; white-space: nowrap; width: 32px;}
        .signa-drop-cell {min-width: 40px; width: 40px;}
        .signa-drop-zone {min-height: 22px; border: 1px dashed #ccc; border-radius: 2px; padding: 1px 4px; background: #fafafa; display: flex; align-items: center; justify-content: center; 
                          font-size: 10px; color: #aaa; transition: background 0.15s; cursor: default;}
        .signa-drop-zone.drag-over {background: #e8f0ff; border-color: #131a69; border-style: solid;}
        .signa-drop-zone.drag-invalid {background: #ffeeee; border-color: #c62828; border-style: solid;}
        .signa-drop-zone.filled { background: #eef4ff; border-color: #3a4fb0; border-style: solid; color: #222; font-weight: bold; font-size: 11px; cursor: grab;}
        .signa-drop-zone.mp-fill {background: #fff9e6; border-color: #f0a500; border-style: solid;}
        .signa-auto-field {background: transparent; border: none; font-size: 11px; color: #333; width: 100%; text-align: center; outline: none;}
        .signa-clear-btn {color: #ccc; cursor: pointer; font-size: 11px; padding: 0 2px; flex-shrink: 0;}
        .signa-clear-btn:hover {color: #c62828;}
        .signa-sidebar-title {background: #333; color: #fff; font-weight: bold; font-size: 12px; padding: 6px 10px; border-radius: 4px 4px 0 0;}
        .signa-sidebar-day-title {font-size: 11px; font-weight: bold; padding: 5px 8px; background: #131a69; color: #fff; border-bottom: 1px solid #0a0f40;}
        .signa-sidebar-group-title {font-size: 10px; font-weight: bold; padding: 3px 8px; background: #f0f0f0; color: #555; border-bottom: 1px solid #ddd;}
        .signa-sidebar-list {border: 1px solid #ddd; border-top: none; border-radius: 0 0 4px 4px; height: calc(100% - 35px); overflow-y: auto;}
        .signa-sidebar-item {display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-bottom: 1px solid #f5f5f5; cursor: grab; background: #fff; user-select: none; font-size: 11px;}
        .signa-sidebar-item:hover {background: #f0f4ff;}
        .signa-sidebar-item.dragging {opacity: 0.4;}
        .signa-sidebar-item.used {opacity: 0.3; pointer-events: none; text-decoration: line-through;}
        .signa-ni {color: #888; min-width: 26px; font-size: 10px;}
        .signa-cat {color: #555; min-width: 28px; font-size: 10px;}
        .signa-name {font-weight: bold; color: #222; flex: 1;}
        .signa-mp-badge {font-size: 9px; background: #f0a500; color: #fff; border-radius: 2px; padding: 1px 3px; font-weight: bold; flex-shrink: 0;}
      `;
      document.head.appendChild(style);
      const dateRow = document.createElement("div");
      dateRow.className = "signa-date-row";
      const lbl1 = document.createElement("label"); lbl1.textContent = "Dia 1:";
      const inp1 = document.createElement("input"); inp1.type = "date"; inp1.id = "signa-date1";
      const lbl2 = document.createElement("label"); lbl2.textContent = "Dia 2:";
      const inp2 = document.createElement("input"); inp2.type = "date"; inp2.id = "signa-date2";
      const loadBtn = document.createElement("button");
      loadBtn.className = "signa-load-btn"; loadBtn.textContent = "⟳ Carregar Elementos";
      const formatBtn = document.createElement("button");
      formatBtn.className = "signa-format-btn"; formatBtn.textContent = "⚡ Formatar Equipas";
      dateRow.append(lbl1, inp1, lbl2, inp2, loadBtn, formatBtn);
      container.appendChild(dateRow);
      const wrapper = document.createElement("div");
      wrapper.className = "signa-wrapper";
      const tablesDiv = document.createElement("div");
      tablesDiv.className = "signa-tables";
      const sidebarDiv = document.createElement("div");
      sidebarDiv.className = "signa-sidebar";
      const sidebarTitle = document.createElement("div");
      sidebarTitle.className = "signa-sidebar-title";
      sidebarTitle.textContent = "ELEMENTOS ESCALADOS";
      sidebarTitle.style.textAlign = "center";
      const sidebarList = document.createElement("div");
      sidebarList.className = "signa-sidebar-list";
      sidebarList.id = "signa-sidebar-list";
      sidebarList.innerHTML = `<div style="padding: 12px; font-size: 11px; color: #999; text-align: center;">Selecione as datas e clique em Carregar</div>`;
      sidebarDiv.append(sidebarTitle, sidebarList);
      wrapper.append(tablesDiv, sidebarDiv);
      container.appendChild(wrapper);
      let dragData = null;
      function updateSidebarItem(nint, valueType, day) {
        sidebarList.querySelectorAll(".signa-sidebar-item").forEach(item => {
          if (parseInt(item.dataset.nint, 10) === nint && item.dataset.valueType === valueType && item.dataset.day === day) {
            setTimeout(() => {
              if (valueType === "ET") {
                if (signaCheckETPlaced(container, nint, day)) item.classList.add("used");
                else item.classList.remove("used");
              } else {
                item.classList.add("used");
              }
            }, 0);
          }
        });
      }
      function restoreSidebarItem(nint, valueType, day) {
        sidebarList.querySelectorAll(".signa-sidebar-item").forEach(item => {
          if (parseInt(item.dataset.nint, 10) === nint && item.dataset.valueType === valueType && item.dataset.day === day) {
            setTimeout(() => {
              if (valueType === "ET") {
                if (!signaCheckETPlaced(container, nint, day)) item.classList.remove("used");
              } else {
                const stillPlaced = container.querySelector(`.signa-drop-zone.filled[data-nint="${nint}"][data-day="${day}"]`);
                if (!stillPlaced) item.classList.remove("used");
              }
            }, 0);
          }
        });
      }
      function makePositionRow(posLabel, tbody, shift, turnoDay, section) {
        const tr = document.createElement("tr");
        const tdLabel = document.createElement("td");
        tdLabel.className = "signa-pos-label";
        tdLabel.textContent = posLabel;
        tr.appendChild(tdLabel);
        const tdDrop = document.createElement("td");
        tdDrop.className = "signa-drop-cell";
        const zone = document.createElement("div");
        zone.className = "signa-drop-zone";
        zone.textContent = "—";
        zone.dataset.nint = "";
        zone.dataset.shift = shift;
        zone.dataset.day = turnoDay;
        zone.dataset.section = section;
        zone.dataset.valueType = "";
        zone.draggable = false;
        zone.addEventListener("dragover", e => {
          e.preventDefault();
          if (!dragData) return;
          const shiftOk = dragData.valueType === "ED" ? shift === "day" : dragData.valueType === "EN" ? shift === "night" : true;
          const dayOk = dragData.day === turnoDay;
          zone.classList.remove("drag-over", "drag-invalid");
          zone.classList.add(shiftOk && dayOk ? "drag-over" : "drag-invalid");
        });
        zone.addEventListener("dragleave", () => zone.classList.remove("drag-over", "drag-invalid"));
        zone.addEventListener("drop", e => {
          e.preventDefault();
          zone.classList.remove("drag-over", "drag-invalid");
          if (!dragData) return;
          const shiftOk = dragData.valueType === "ED" ? shift === "day" : dragData.valueType === "EN" ? shift === "night" : true;
          const dayOk = dragData.day === turnoDay;
          if (!shiftOk || !dayOk) {
            const msg = !dayOk ? `⛔ Elemento do Dia ${dragData.day} não pode ser colocado no Dia ${turnoDay}!`
                               : `⛔ Elemento ${dragData.valueType} não pode ser colocado neste turno!`;
            showPopupWarning(msg);
            dragData = null;
            return;
          }
          const destExisting = signaGetZoneData(zone);
          if (dragData.sourceZone && dragData.sourceZone !== zone) {
            if (destExisting) {
              const srcShift = dragData.sourceZone.dataset.shift;
              const srcDay = dragData.sourceZone.dataset.day;
              const swapShiftOk = destExisting.valueType === "ED" ? srcShift === "day" : destExisting.valueType === "EN" ? srcShift === "night" : true;
              const swapDayOk = destExisting.day === srcDay;
              if (swapShiftOk && swapDayOk) {
                signaFillZone(dragData.sourceZone, destExisting);
                updateSidebarItem(destExisting.nint, destExisting.valueType, destExisting.day);
              } else {
                signaClearRow(dragData.sourceZone);
                restoreSidebarItem(dragData.nint, dragData.valueType, dragData.day);
              }
            } else {
              signaClearRow(dragData.sourceZone);
            }
            restoreSidebarItem(dragData.nint, dragData.valueType, dragData.day);
          }
          signaFillZone(zone, dragData);
          updateSidebarItem(dragData.nint, dragData.valueType, dragData.day);
          dragData = null;
        });
        zone.addEventListener("dragstart", e => {
          if (!zone.dataset.nint) {e.preventDefault(); return;}
          const data = signaGetZoneData(zone);
          if (!data) {e.preventDefault(); return;}
          dragData = {...data, sourceZone: zone};
          e.dataTransfer.effectAllowed = "move";
        });
        tdDrop.appendChild(zone);
        tr.appendChild(tdDrop);
        ["field-nfile","field-patent","field-abvname"].forEach(cls => {
          const td = document.createElement("td");
          const inp = document.createElement("input");
          inp.className = `signa-auto-field ${cls}`;
          inp.readOnly = true;
          td.appendChild(inp);
          tr.appendChild(td);
        });
        const tdClear = document.createElement("td");
        tdClear.style.width = "16px";
        const clearBtn = document.createElement("span");
        clearBtn.className = "signa-clear-btn";
        clearBtn.textContent = "✕";
        clearBtn.addEventListener("click", () => {
          const nint = parseInt(zone.dataset.nint, 10);
          const vt = zone.dataset.valueType;
          const dy = zone.dataset.day;
          signaClearRow(zone);
          if (nint) restoreSidebarItem(nint, vt, dy);
        });
        tdClear.appendChild(clearBtn);
        tr.appendChild(tdClear);
        tbody.appendChild(tr);
        return zone;
      }
      function buildSignaTables() {        
        tablesDiv.innerHTML = "";
        const date1 = inp1.value ? new Date(inp1.value).toLocaleDateString("pt-PT") : "";
        const date2 = inp2.value ? new Date(inp2.value).toLocaleDateString("pt-PT") : "";
        const ecinTitle = document.createElement("div");
        ecinTitle.className = "signa-section-title";
        ecinTitle.textContent = "ECIN";
        ecinTitle.style.textAlign = "center";
        tablesDiv.appendChild(ecinTitle);
        const ecinGrid = document.createElement("div");
        ecinGrid.className = "signa-shift-grid";
        ecinGrid.append(
          signaBuildTurnoBlock(`${date1} | DIA`, `☀️ 08:00 → 20:00`, ["CE","MO","Elem.1","Elem.2","Elem.3"], "day",   "1", "ecin", makePositionRow),
          signaBuildTurnoBlock(`${date1} | NOITE`, `🌙 20:00 → 08:00`, ["CE","MO","Elem.1","Elem.2","Elem.3"], "night", "1", "ecin", makePositionRow),
          signaBuildTurnoBlock(`${date2} | DIA`, `☀️ 08:00 → 20:00`, ["CE","MO","Elem.1","Elem.2","Elem.3"], "day",   "2", "ecin", makePositionRow),
          signaBuildTurnoBlock(`${date2} | NOITE`, `🌙 20:00 → 08:00`, ["CE","MO","Elem.1","Elem.2","Elem.3"], "night", "2", "ecin", makePositionRow)
        );
        tablesDiv.appendChild(ecinGrid);
        const elacTitle = document.createElement("div");
        elacTitle.className = "signa-section-title";
        elacTitle.textContent = "ELAC";
        elacTitle.style.textAlign = "center";
        tablesDiv.appendChild(elacTitle);
        const elacGrid = document.createElement("div");
        elacGrid.className = "signa-shift-grid";
        elacGrid.append(
          signaBuildTurnoBlock(`${date1} | DIA`, `☀️ 08:00 → 20:00`, ["CE","MO"], "day",   "1", "elac", makePositionRow),
          signaBuildTurnoBlock(`${date1} | NOITE`, `🌙 20:00 → 08:00`, ["CE","MO"], "night", "1", "elac", makePositionRow),
          signaBuildTurnoBlock(`${date2} | DIA`, `☀️ 08:00 → 20:00`, ["CE","MO"], "day",   "2", "elac", makePositionRow),
          signaBuildTurnoBlock(`${date2} | NOITE`, `🌙 20:00 → 08:00`, ["CE","MO"], "night", "2", "elac", makePositionRow)
        );
        tablesDiv.appendChild(elacGrid);
      }
      buildSignaTables();
      function makeSidebarItem(elem, valueType, day) {
        const item = document.createElement("div");
        item.className = "signa-sidebar-item";
        item.draggable = true;
        item.dataset.nint = parseInt(elem.n_int, 10);
        item.dataset.valueType = valueType;
        item.dataset.day = day;
        item.dataset.mp = elem.MP ? "1" : "0";
        item.dataset.nfile = elem.n_file || "";
        item.dataset.fullname = elem.full_name || "";
        item.innerHTML = `
          <span class="signa-ni">${String(elem.n_int).padStart(3,"0")}</span>
          <span class="signa-cat">${elem.patent||""}</span>
          <span class="signa-name">${elem.abv_name||""}</span>
          ${elem.MP ? '<span class="signa-mp-badge">MP</span>' : ""}
        `;
        item.addEventListener("dragstart", e => {
          if (item.classList.contains("used")) {e.preventDefault(); return;}
          dragData = {nint: parseInt(elem.n_int, 10), n_file: elem.n_file || "", patent: elem.patent || "", abv_name: elem.abv_name || "", full_name: elem.full_name || "", 
                      mp: elem.MP, valueType: valueType, day: day, sourceZone: null};
          item.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
        });
        item.addEventListener("dragend", () => item.classList.remove("dragging"));
        return item;
      }
      // ── Formatar Equipas ──
      formatBtn.addEventListener("click", () => {
        const sidebarItems = sidebarList.querySelectorAll(".signa-sidebar-item");
        if (!sidebarItems.length) return showPopupWarning("Carregue os elementos primeiro.");
        const getAllForShift = (day, shift) => {
          const items = [];
          sidebarList.querySelectorAll(".signa-sidebar-item").forEach(item => {
            if (item.dataset.day !== day) return;
            const vt = item.dataset.valueType;
            if (vt === "ED" && shift !== "day") return;
            if (vt === "EN" && shift !== "night") return;
            items.push({nint: parseInt(item.dataset.nint, 10), n_file: item.dataset.nfile || "", patent: item.querySelector(".signa-cat").textContent.trim(),
                        abv_name: item.querySelector(".signa-name").textContent.trim(), full_name: item.dataset.fullname || "", mp: item.dataset.mp === "1", valueType: vt, day: day});});
          return items.sort((a,b) => a.nint - b.nint);
        };
        const distributeToZones = (items, day, shift, section) => {
          if (!items.length) return;
          const mpItems = items.filter(i => i.mp);
          let ceIdx = 0, moIdx = -1;
          if (mpItems.length === 1 && items[0].nint === mpItems[0].nint) {
            moIdx = 0; ceIdx = items.length > 1 ? 1 : -1;
          } else if (mpItems.length > 0) {
            ceIdx = 0;
            const mc = items.findIndex((i, idx) => i.mp && idx !== 0);
            moIdx = mc >= 0 ? mc : items.findIndex(i => i.mp);
          } else {
            ceIdx = 0; moIdx = items.length > 1 ? 1 : -1;
          }
          const assigned = [];
          const used = new Set();
          if (ceIdx >= 0 && items[ceIdx]) {assigned.push(items[ceIdx]); used.add(ceIdx);}
          else assigned.push(null);
          if (moIdx >= 0 && moIdx !== ceIdx && items[moIdx]) {assigned.push(items[moIdx]); used.add(moIdx);}
          else assigned.push(null);
          items.forEach((item, idx) => {if (!used.has(idx)) assigned.push(item);});
          const zones = Array.from(container.querySelectorAll(
            `.signa-drop-zone[data-day="${day}"][data-shift="${shift}"][data-section="${section}"]`
          ));
          zones.forEach((zone, i) => {
            if (!assigned[i]) return;
            if (zone.dataset.nint) signaClearRow(zone);
            signaFillZone(zone, assigned[i]);
            updateSidebarItem(assigned[i].nint, assigned[i].valueType, assigned[i].day);
          });
        };
        ["1","2"].forEach(day => {
          ["day","night"].forEach(shift => {
            const all = getAllForShift(day, shift);
            if (!all.length) return;
            const mpItems = all.filter(i => i.mp);
            const nonMpItems = all.filter(i => !i.mp);
            let elacMP = null, elacCE = null;
            if (mpItems.length >= 2) {
              elacMP = mpItems[mpItems.length - 1];
              elacCE = nonMpItems.length > 0 ? nonMpItems[nonMpItems.length - 1] : mpItems[mpItems.length - 2];
            } else if (mpItems.length === 1) {
              elacMP = mpItems[0];
              elacCE = nonMpItems.length > 0 ? nonMpItems[nonMpItems.length - 1] : null;
            } else {
              elacCE = all.length > 1 ? all[all.length - 2] : null;
              elacMP = all[all.length - 1];
            }
            const elacNints = new Set([elacMP?.nint, elacCE?.nint].filter(Boolean));
            const ecinItems = all.filter(i => !elacNints.has(i.nint));
            const elacAssigned = [elacCE || null, elacMP || null];
            const elacZones = Array.from(container.querySelectorAll(
              `.signa-drop-zone[data-day="${day}"][data-shift="${shift}"][data-section="elac"]`
            ));
            elacZones.forEach((zone, i) => {
              if (!elacAssigned[i]) return;
              if (zone.dataset.nint) signaClearRow(zone);
              signaFillZone(zone, elacAssigned[i]);
              updateSidebarItem(elacAssigned[i].nint, elacAssigned[i].valueType, elacAssigned[i].day);
            });
            distributeToZones(ecinItems, day, shift, "ecin");
          });
        });
      });
      // ── Carregar elementos ──
      loadBtn.addEventListener("click", async () => {
        const date1 = inp1.value;
        const date2 = inp2.value;
        buildSignaTables();
        if (!date1 || !date2) return showPopupWarning("Selecione as duas datas.");
        const [y1,m1,d1] = date1.split("-");
        const [y2,m2,d2] = date2.split("-");
        const corp = getCorpId();
        const isSameDay = date1 === date2;
        sidebarList.innerHTML = `<div style="padding:12px;font-size:11px;color:#999;text-align:center;">A carregar...</div>`;
        try {
          const data1 = await supabaseFetch(`reg_serv?corp_oper_nr=eq.${corp}&year=eq.${y1}&month=eq.${m1}&day=eq.${d1}&value=in.(ED,EN,ET)&select=n_int,value`);
          const data2 = isSameDay ? data1 : await supabaseFetch(`reg_serv?corp_oper_nr=eq.${corp}&year=eq.${y2}&month=eq.${m2}&day=eq.${d2}&value=in.(ED,EN,ET)&select=n_int,value`);
          const allNInts = [...new Set([...data1, ...data2].map(i => String(i.n_int).padStart(3,"0")))];
          if (!allNInts.length) {
            sidebarList.innerHTML = `<div style="padding:12px;font-size:11px;color:#999;text-align:center;">Nenhum elemento encontrado.</div>`;
            return;
          }
          const elemsData = await supabaseFetch(`reg_elems?n_int=in.(${allNInts.join(",")})&corp_oper_nr=eq.${corp}&select=n_int,abv_name,patent,n_file,MP,full_name`);
          const elemsMap = Object.fromEntries(elemsData.map(e => [String(e.n_int).padStart(3,"0"), e]));
          sidebarList.innerHTML = "";
          const day1Title = document.createElement("div");
          day1Title.className = "signa-sidebar-day-title";
          day1Title.textContent = `📅 Dia 1 — ${inp1.value}`;
          sidebarList.appendChild(day1Title);
          const day1Groups = {
            "ED (Turno Dia)": data1.filter(i => i.value === "ED").map(i => ({elem: elemsMap[String(i.n_int).padStart(3,"0")], vt: "ED"})).filter(i => i.elem),
            "EN (Turno Noite)": data1.filter(i => i.value === "EN").map(i => ({elem: elemsMap[String(i.n_int).padStart(3,"0")], vt: "EN"})).filter(i => i.elem),
            "ET (Dia + Noite)": data1.filter(i => i.value === "ET").map(i => ({elem: elemsMap[String(i.n_int).padStart(3,"0")], vt: "ET"})).filter(i => i.elem),
          };
          Object.entries(day1Groups).forEach(([groupName, items]) => {
            if (!items.length) return;
            const grpTitle = document.createElement("div");
            grpTitle.className = "signa-sidebar-group-title";
            grpTitle.textContent = groupName;
            sidebarList.appendChild(grpTitle);
            items.sort((a,b) => parseInt(a.elem.n_int,10) - parseInt(b.elem.n_int,10))
              .forEach(({elem, vt}) => sidebarList.appendChild(makeSidebarItem(elem, vt, "1")));
          });
          if (!isSameDay) {
            const day2Title = document.createElement("div");
            day2Title.className = "signa-sidebar-day-title";
            day2Title.textContent = `📅 Dia 2 — ${inp2.value}`;
            sidebarList.appendChild(day2Title);
            const day2Groups = {
              "ED (Turno Dia)":   data2.filter(i => i.value === "ED").map(i => ({elem: elemsMap[String(i.n_int).padStart(3,"0")], vt: "ED"})).filter(i => i.elem),
              "EN (Turno Noite)": data2.filter(i => i.value === "EN").map(i => ({elem: elemsMap[String(i.n_int).padStart(3,"0")], vt: "EN"})).filter(i => i.elem),
              "ET (Dia + Noite)": data2.filter(i => i.value === "ET").map(i => ({elem: elemsMap[String(i.n_int).padStart(3,"0")], vt: "ET"})).filter(i => i.elem),
            };
            Object.entries(day2Groups).forEach(([groupName, items]) => {
              if (!items.length) return;
              const grpTitle = document.createElement("div");
              grpTitle.className = "signa-sidebar-group-title";
              grpTitle.textContent = groupName;
              sidebarList.appendChild(grpTitle);
              items.sort((a,b) => parseInt(a.elem.n_int,10) - parseInt(b.elem.n_int,10))
                .forEach(({elem, vt}) => sidebarList.appendChild(makeSidebarItem(elem, vt, "2")));
            });
          }
          setTimeout(() => {
            container.querySelectorAll(".signa-drop-zone.filled").forEach(zone => {
              const nint = parseInt(zone.dataset.nint, 10);
              const vt = zone.dataset.valueType;
              const dy = zone.dataset.day;
              sidebarList.querySelectorAll(".signa-sidebar-item").forEach(item => {
                if (parseInt(item.dataset.nint, 10) === nint && item.dataset.valueType === vt && item.dataset.day === dy) {
                  if (vt === "ET") {if (signaCheckETPlaced(container, nint, dy)) item.classList.add("used");}
                  else item.classList.add("used");
                }
              });
            });
          }, 50);
        } catch(err) {
          console.error(err);
          sidebarList.innerHTML = `<div style="padding:12px;font-size:11px;color:#c62828;text-align:center;">Erro ao carregar elementos.</div>`;
        }
      });
      const options = document.getElementById("decir-signa-options");
      if (options) options.style.display = "flex";
    }
    const emitSigna = async (format) => {
      const inp1 = document.getElementById("signa-date1");
      const inp2 = document.getElementById("signa-date2");
      if (!inp1?.value || !inp2?.value) return showPopupWarning("Selecione as duas datas.");
      const getTeamData = (day, shift, section) => {
        const container = document.querySelector("#decir-reg-signa .card-body");
        return Array.from(container.querySelectorAll(
          `.signa-drop-zone[data-day="${day}"][data-shift="${shift}"][data-section="${section}"]`
        )).map(zone => {
          const tr = zone.closest("tr");
          return {nint: zone.dataset.nint || "", n_file: tr?.querySelector(".field-nfile")?.value || "", patent: tr?.querySelector(".field-patent")?.value || "",
                  abv_name: tr?.querySelector(".field-abvname")?.value || "", full_name: zone.dataset.fullname || ""};});};
      try {
        const payload = {type: "signa", date1: inp1.value, date2: inp2.value, year: inp1.value.split("-")[0], fileName: "SIGNA_DECIR", format,
                         ecin: {day1: {day: getTeamData("1","day","ecin"), night: getTeamData("1","night","ecin")}, day2: {day: getTeamData("2","day","ecin"), night: getTeamData("2","night","ecin")}},
                         elac: {day1: {day: getTeamData("1","day","elac"), night: getTeamData("1","night","elac")}, day2: {day: getTeamData("2","day","elac"), night: getTeamData("2","night","elac")}}};
        const res = await fetch("https://cb360-online.vercel.app/api/decir_reg_pag", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });
        if (!res.ok) {const err = await res.json(); return alert("Erro: " + (err.details || err.error));}
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SIGNA_DECIR.${format}`;
        document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
      } catch(err) {
        alert("Erro: " + err.message);
      }
    };
    document.getElementById("emit-signa-xlsx-btn")?.addEventListener("click", () => emitSigna("xlsx"));
    document.getElementById("emit-signa-pdf-btn")?.addEventListener("click", () => emitSigna("pdf"));


    /* =======================================
    FOMIO
    ======================================= */
    function createFOMIOMonthButtons(containerId, tableContainerId, year) {
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
        if (totalCell) {totalCell.textContent = dayTotal; applyTotalCellStyle(totalCell, dayTotal, section === "DECIR");}
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
    /* ─── LEGENDA (FOMIO) ────────────────────────────────────── */
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
          createFOMIOMonthButtons("months-container", "table-container", yearAtual);
          $("table-container").innerHTML = "";
          document.querySelectorAll(".btn.btn-add").forEach(b => b.classList.remove("active"));
          const saveButton = $("save-button"), emitButton = $("emit-button");
          if (saveButton) saveButton.style.display = "none";
          if (emitButton) emitButton.style.display = "none";
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
          const nomeMes = MONTH_NAMES_PT[parseInt(monthIndex)-1];
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
    async function exportScheduleToExcel(tbody, year, month) {
      const fileName = `Escala FOMIO ${MONTH_NAMES_PT[month-1]} ${year}`;
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
      const payload = {year, month, monthName:MONTH_NAMES_PT[month-1], fileName, daysInMonth, weekdays, fixedRows, normalRows, holidayDays, optionalDays};
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
