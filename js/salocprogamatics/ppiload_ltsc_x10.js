    /* =======================================
    PPI MODULE
    ======================================= */
    /* ─── STYLE CONSTANTS ────────────────────────────────────── */
    const HIGHLIGHT_WORDS = [`Rede Nacional de Áreas Protegidas`,`Rede Natura 2000`,`Linha de Média Tensão`,`áreas de declives acentuados`, `Passagem Superior`,`linhas de média e alta tensão`,
                             `linhas de média tensão`,`atravessa curso de água navegável`, `atravessa curso de água e pontos de água`,`outros compromissos internacionais`,`ALARME ESPECIAL`,
                             `ALARME CONDICIONADO`, `Troço com grandes limitações no acesso a meios terrestres, deverá ser avaliada a necessidade de mobilizar meios suplementares táticos (4x4).`];
    const A22_TITLE_STYLE = `background: linear-gradient(to right,#888,#c0c0c0); color: black; font-weight: bold; font-size: 12px; width: 100%; max-width: 1572px; height:20px; display: flex; 
                             justify-content: center; align-items: center;margin: 0;`;
    const A22_ROW_STYLE = `display: flex; justify-content: flex-start ;margin: 0;`;
    const A22_GRID_BUTTON_STYLE = `margin: 5px 0; width: 78px; height: 40px;`;
    const A22_GRID_CONTAINER_STYLE  = `display: flex; flex-direction: column; align-items: center;`;
    const A22_TABLE_STYLE = `width: 100%; table-layout: fixed; border-collapse: collapse; margin: 20px 0 10px;`;
    const A22_CELL_STYLE = `border:1px solid #bbb;padding:5px;font-weight:bold;`;
    const A22_CELL_STYLE_NORMAL = `border: 1px solid #bbb; padding: 5px; font-weight: normal;`;
    const A22_LABEL_CELL_STYLE = `border: 1px solid #bbb; padding: 5px; font-weight: bold;text-align: left;`;
    const A22_DIRECTION_TOP_STYLE = `font-size: 14px;`;
    const A22_DIRECTION_MID_STYLE = `font-weight: bold; font-size: 14px;`;
    const A22_DIRECTION_BOT_STYLE = `font-size: 11px;`;
    const A22_NODE_KM_STYLE = `font-size: 10px;`;
    const INTERVENTION_NOTICE_STYLE = `padding: 10px 14px; margin: 5px 0 -10px 0; border-radius: 5px; text-align: center; font-weight: 700; font-size: 15px;`;
    const FINAL_H_TABLE_STYLE = `width: 100%; margin-top: -5px; border-collapse: collapse;`;
    const FINAL_H_CELL_STYLE = `background-color: navy; color: white; font-weight: bold; text-align: center; width: 80px; line-height: 15px; padding: 5px; border: 1px solid #bbb;`;
    const CUMULATIVE_ALERT_STYLE = `padding: 10px 14px; margin: 5px 0 -5px 0; border-radius: 5px; font-weight: 700; text-align: center; font-size: 15px; color: #842029; background-color: #f8d7da;
                                    border: 1px solid #842029;`;
    const FINAL_H_TEXT_STYLE = `padding: 5px; text-align: left; border: 1px solid #bbb; line-height: 15px;`;
    const AERO_LABEL_STYLE = {background: "linear-gradient(to light,#888,#c0c0c0)", borderRadius: "3px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "17px", fontWeight: "bold", color: "black", width: "100%", maxWidth: "920px", margin: "3px auto 0 auto"};
    const AERO_ROW_STYLE = {display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "5px"};
    const AERO_BUTTON_STYLE = {marginTop: "5px", width: "180px", height: "30px", fontSize: "12px", fontWeight: "bold"};
    const AERO_HEADER_TABLE_STYLE = {width: "100%", margin: "5px 0 0 0", borderCollapse: "separated"};
    const AERO_HEADER_CELL_STYLE = {width: "100%", textAlign: "center", background: "#e7f1ff", color: "#084298", fontWeight: "700", fontSize: "15px", padding: "10px 12px", borderRadius: "6px",
                                    whiteSpace: "pre-line", border: "1px solid #084298"};
    const AERO_INFO_TABLE_STYLE = {width: "100%", margin: "5px 0 5px 0", borderCollapse: "collapse", border: "1px solid #bbb"};
    const AERO_CELL_STYLE = {textAlign: "left", padding: "4px", border: "1px solid #bbb", minHeight: "25px", verticalAlign: "top"};
    const AERO_RESERVA_CELL_STYLE = {textAlign: "center", padding: "4px", border: "1px solid #bbb", backgroundColor: "green", color: "white", fontWeight:"bold"};
    const AERO_ABS_NOTE_STYLE = {width: "100%", margin: "0", borderCollapse: "collapse", lineHeight: "15px", border: "1px solid #bbb"};
    const AERO_B1_TABLE_STYLE = {tableLayout: "fixed", width: "100%", marginBottom: "5px", marginTop: "10px"};
    const AERO_B1_COL_STYLE = ["10%","40%","10%","40%"];
    const AERO_B1_HEADER1_STYLE = {textAlign: "center", padding: "4px", fontWeight: "bold", backgroundColor: "red", color: "white"};
    const AERO_B1_HEADER2_STYLE = {textAlign: "center", padding: "4px", fontSize: "12px", backgroundColor: "#f0f0f0", color:"black"};
    const AERO_B1_WRAPPER_STYLE = {display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px"};
    const AERO_B1_TITLE_DIV_STYLE = {flex: "1", textAlign: "center"};
    const LINFER_TITLE_STYLE = `background: linear-gradient(to right,#888,#c0c0c0); color: black; font-weight: bold; font-size: 17px; width: 100%; max-width: 1580px; height: 30px; display: flex;
                                justify-content: center; align-items: center; margin: 0 0 5px 0; border-radius: 3px;`;
    const LINFER_ROW_STYLE = `display: flex; justify-content: flex-start; margin: 0;`;
    const LINFER_GRID_BUTTON_STYLE = `margin: 5px 0;width: 94px; height: 40px; font-size: 12px;`;
    const LINFER_DIRECTION_BUTTON_STYLE = `width: 160px; height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-weight: bold;`;
    const LINFER_DIRECTION_TOP_STYLE = `font-size: 14px;`;
    const LINFER_DIRECTION_BOT_STYLE = `font-size: 11px; font-weight: normal;`;
    const LINFER_INPUT_STYLE = `padding: 8px; width: 160px; text-align: center; border: 1px solid #ccc; border-radius: 4px; outline: none; transition: all 0.2s ease;`;
    const LINFER_CARD_STYLE = `display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; width: 400px; margin: 0 auto; margin-bottom: 5px;`;
    const LINFER_TITLE_LABEL_STYLE = `font-size: 16px; font-weight: bold;`;
    const LINFER_TABLE_STYLE = `width: 100%; table-layout: fixed; border-collapse: collapse; margin: 20px 0 10px;`;
    const LINFER_CELL_STYLE = `border: 1px solid #bbb; padding: 5px; font-weight: bold;`;
    const LINFER_CELL_STYLE_NORMAL = `border: 1px solid #bbb; padding: 5px; font-weight: normal;`;
    const LINFER_LABEL_CELL_STYLE = `border: 1px solid #bbb; padding: 5px; font-weight: bold; text-align: left;`;
    const LINFER_PKM_FIRST_LINE_STYLE = `font-weight: bold; font-size: 16px;`;
    const LINFER_PKM_SECOND_LINE_STYLE = `font-size: 14px; color: #666; margin-top: 2px;`;
    const LINFER_SPECIAL_TITLE_STYLE = `background-color: #fff3b0; font-weight: bold; text-align: center; padding: 4px; margin: -5px 0 -1px 0; border: 1px solid #bbb;`;
    const LINFER_SPECIAL_ITEM_STYLE = `border: 1px solid #bbb; padding: 4px 8px; margin-bottom: -1px; text-align: left;`;
    const LINFER_ABS_TABLE_STYLE = `width: 100%; margin-top: -5px; border-collapse: collapse;`;
    const LINFER_ABS_CELL_STYLE = `border: 1px solid #bbb; padding: 5px; text-align: left;`;
    /* ─── HELPERS ────────────────────────────────────────────── */
    const getCorpNr = () => sessionStorage.getItem("currentCorpOperNr") || "0805";
    async function fetchFromSupabase(table, filter) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&${filter}`, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error(`Erro ao buscar ${table}: ${res.status}`);
      return res.json();
    }
    async function fetchJSON(url) {
      const res = await fetch(url, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error(`Erro ao buscar ${url}: ${res.status}`);
      return res.json();
    }
    function ensureLoadingMarker(container) {
      if (!container.querySelector(".loading-mark")) {
        const lm = document.createElement("div");
        lm.className = "loading-mark"; lm.style.display = "none";
        container.appendChild(lm);
      }
    }
    function renderNoData(container) {
      container.querySelector("table")?.remove();
      let noData = container.querySelector(".no-data-msg");
      if (!noData) {noData = document.createElement("div"); noData.className = "no-data-msg"; noData.style.padding = "10px 0"; container.appendChild(noData);}
      noData.textContent = "Sem dados na tabela ppi_data.";
    }
    function showError(container, message) {
      let errDiv = container.querySelector(".data-error");
      if (!errDiv) {errDiv = document.createElement("div"); errDiv.className = "data-error"; errDiv.style.color = "red"; errDiv.style.padding = "8px 0"; container.appendChild(errDiv);}
      errDiv.textContent = message;
    }
    function createColGroup(widths) {
      const cg = document.createElement("colgroup");
      widths.forEach(w => {const col = document.createElement("col"); col.style.width = w; cg.appendChild(col);});
      return cg;
    }
    function groupByRow(data) {
      return data.reduce((acc, s) => {acc[s.row_order] ??= {}; acc[s.row_order][s.col] = s.content; return acc;}, {});
    }
    function syncRowCount(tbody, targetCount) {
      while (tbody.rows.length < targetCount) tbody.insertRow();
      while (tbody.rows.length > targetCount) tbody.deleteRow(-1);
    }
    function sortedMeans(means, refId, alarmLevel) {
      return means.filter(m => m.reference_id === refId && (m.alarm_level || "").toUpperCase() === alarmLevel)
                  .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
    }
    /* ─── AUDIO ──────────────────────────────────────────────── */
    function playGenericSirene(type, gridId, level, occurrenceType = null) {
      const mapAlarmsA22 = {"1º Alarme" : "1Alarme", "2º Alarme" : "2Alarme", "Alarme Especial" : "AlarmeEspecial"};
      const mapTypesA22 = {"Acidente" : "Acidente", "Substâncias Perigosas" : "SubstanciasPerigosas", "Incêndio em Transportes" : "IncendioTransportes"};
      const mapTypesLinFer = {"Acidente - Abalroamento, Choque e Descarrilamento" : "Acidente", "Substâncias Perigosas - Produtos Químicos/Produtos Biológicos" : 
                              "SubstanciasPerigosas","Incêndio em Transportes":"IncendioTransportes"};
      let fileName, soundFolder;
      switch (type) {
        case 'A22' : soundFolder='A22'; fileName=`${gridId}-${mapTypesA22[occurrenceType]}-${mapAlarmsA22[level]}.mp3`;
          break;
        case 'Aeroporto' : soundFolder='Aeroporto'; fileName=`${gridId}-${level}.mp3`;
          break;
        case 'LinhaFerrea' : soundFolder='LinhaFerrea'; fileName=`${gridId}-${mapTypesLinFer[occurrenceType]}-${mapAlarmsA22[level]}.mp3`;
          break;
        default: console.error(`Tipo de PPI não reconhecido: ${type}`);
          return;
      }
      const audio = new Audio(`https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/sounds/${soundFolder}/${fileName}`);
      audio.play().then(() => console.log(`▶️ A tocar: ${fileName}`)).catch(err => console.error("Erro ao tocar áudio:", err));
    }
    function createAudioButton(type, gridId, level, occurrenceType = null, customTitle = null) {
      const btn = document.createElement("button");
      btn.textContent = "🔊"; btn.title = customTitle || `Toque rápido ${level}`; btn.style.cursor = "pointer";
      btn.onclick = e => {e.stopPropagation(); playGenericSirene(type, gridId, level, occurrenceType);};
      return btn;
    }
    /* ─── ALARM HEADER ROW (shared by A22 + LinFer) ─────────── */
    function createAlarmHeaderRow(refs, means, ppiType, gridId, alarmLevels, bgColors, textColors, colSpans) {
      const tr = document.createElement("tr");
      const corpNr = getCorpNr();
      alarmLevels.forEach((level, i) => {
        const th = document.createElement("th");
        th.style.textAlign = "center"; th.style.padding = "4px";
        th.style.backgroundColor = bgColors[i]; th.style.color = textColors[i];
        if (colSpans[i]) th.colSpan = colSpans[i];
        const hasCB = corpNr && refs.some(ref => means.some(m => m.reference_id === ref.id && m.alarm_level === level && m.means?.includes(corpNr)));
        if (hasCB) {
          const wrapper = document.createElement("div");
          Object.assign(wrapper.style, {display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"});
          const titleDiv = document.createElement("div"); titleDiv.textContent = level; titleDiv.style.flex = "1"; titleDiv.style.textAlign = "center";
          const btn = createAudioButton(ppiType, gridId, level, refs[0]?.occurrence_type || null, `Toque rápido ${level}`);
          btn.style.marginLeft = "8px";
          wrapper.append(titleDiv, btn);
          th.innerHTML = ""; th.appendChild(wrapper);
        } else {
          th.textContent = level;
        }
        tr.appendChild(th);
      });
      return tr;
    }
    /* ─── GENERIC ALARM CELLS ────────────────────────────────── */
    function renderGenericAlarmCells(tr, alarmArray, i, skipState) {
      const corpNr = getCorpNr();
      if (skipState.count > 0) {skipState.count--; return;}
      const item = alarmArray[i];
      if (!item) {tr.appendChild(document.createElement("td")); tr.appendChild(document.createElement("td")); return;}
      let meio, corp;
      if (item.means?.includes("*")) {
        const parts = item.means.split("*"); meio = parts[0] + "*"; corp = parts[1] ? parts[1].trim().replace(/^[-\s]+/, "") : "";
      } else {
        const parts = (item.means || "").trim().split(/\s+(.+)/); meio = parts[0] || ""; corp = parts[1] ? parts[1].trim() : "";
      }
      const td1 = document.createElement("td"); td1.textContent = meio; td1.style.textAlign = "left";
      const td2 = document.createElement("td"); td2.textContent = corp; td2.style.textAlign = "left";
      if (corpNr && corp.includes(corpNr)) [td1, td2].forEach(td => {td.style.backgroundColor = "#839ec9"; td.style.color = "white"; td.style.fontWeight = "bold";});
      tr.append(td1, td2);
    }
    function applyTdStyle(td, center = false) {
      Object.assign(td.style, {border:"1px solid #bbb",padding:"4px",textAlign:center?"center":"left",verticalAlign:center?"middle":"top"});
    }
    function renderAlarmCell(tr, alarmMeans, idx, colSpan = 1, center = false) {
      const td = tr.insertCell(); td.colSpan = colSpan; applyTdStyle(td, center);
      if (alarmMeans[idx]) td.textContent = alarmMeans[idx].means;
    }
    /* ─── SHARED OCCURRENCE TABLE BUILDER ───────────────────── */
    function buildOccurrenceTable(occurrenceTypes, references, means, ppiType, gridId, colWidths) {
      const frag = document.createDocumentFragment();
      for (const [type, bgColor] of Object.entries(occurrenceTypes)) {
        const refs = references.filter(r => r.occurrence_type === type);
        if (!refs.length) continue;
        const h3 = document.createElement("h3");
        h3.textContent = `TIPO DE OCORRÊNCIA: ${type}`;
        Object.assign(h3.style, {fontSize:"15px",fontWeight:"bold",margin:"10px 0 0 0",padding:"3px 5px",backgroundColor:bgColor,color:"black",borderRadius:"2px"});
        frag.appendChild(h3);
        const table = document.createElement("table");
        table.classList.add("table-elements");
        Object.assign(table.style, {tableLayout:"fixed",width:"100%",marginBottom:"10px"});
        table.appendChild(createColGroup(colWidths));
        const alarmLevels = ["1º Alarme","2º Alarme","Alarme Especial"];
        const headerRow = createAlarmHeaderRow(refs, means, ppiType, gridId, alarmLevels, ["yellow","orange","red"], ["black","black","white"], [2,2,null]);
        table.createTHead().appendChild(headerRow);
        const tbody = table.createTBody();
        refs.forEach(ref => {
          const firstAlarm  = means.filter(m => m.reference_id === ref.id && m.alarm_level === "1º Alarme" ).sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const secondAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "2º Alarme" ).sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const specialAlarm= means.filter(m => m.reference_id === ref.id && m.alarm_level === "Alarme Especial").sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const maxRows = Math.max(firstAlarm.length, secondAlarm.length, specialAlarm.length);
          let skipFirst = {count:0}, skipSecond = {count:0};
          for (let i = 0; i < maxRows; i++) {
            const tr = tbody.insertRow();
            renderGenericAlarmCells(tr, firstAlarm,  i, skipFirst);
            renderGenericAlarmCells(tr, secondAlarm, i, skipSecond);
            if (i === 0) {
              const tdSpecial = tr.insertCell(); tdSpecial.rowSpan = maxRows; applyTdStyle(tdSpecial, true);
              tdSpecial.textContent = specialAlarm.map(m => m.means).join(", ") || "-";
            }
          }
        });
        frag.appendChild(table);
      }
      return frag;
    }
    /* ─── INTERVENTION NOTICE & CUMULATIVE ALERT ─────────────── */
    function createOrUpdateInterventionNotice(parentContainer, isIntervention) {
      let notice = parentContainer.querySelector(".intervention-notice");
      if (!notice) {
        notice = document.createElement("div");
        notice.className = "intervention-notice";
        notice.setAttribute("role", "alert");
        notice.setAttribute("aria-live", "polite");
        notice.style.cssText = INTERVENTION_NOTICE_STYLE;
        parentContainer.insertBefore(notice, parentContainer.firstChild);
      }
      notice.style.background = isIntervention ? "#e6f7ec" : "#fdeaea";
      notice.style.color = isIntervention ? "#1e7a3b" : "#a11a1a";
      notice.style.border = `1px solid ${isIntervention ? "#1e7a3b" : "#a11a1a"}`;
      notice.textContent = isIntervention
        ? "COM INTERVENSÃO DO CORPO DE BOMBEIROS" : "SEM INTERVENSÃO DO CORPO DE BOMBEIROS";
    }
    function checkIfHasCBIntervention(parentContainer) {
      const corpNr = getCorpNr();
      if (!corpNr) return false;
      for (const cell of parentContainer.querySelectorAll("table td")) {
        if (cell.textContent?.includes(corpNr)) return true;
      }
      return false;
    }
    function createOrUpdateCumulativeAlert(parentContainer) {
      let alertDiv = parentContainer.querySelector(".cumulative-alert");
      if (!checkIfHasCBIntervention(parentContainer)) {alertDiv?.remove(); return;}
      if (!alertDiv) {
        alertDiv = document.createElement("div"); alertDiv.className = "cumulative-alert";
        alertDiv.style.cssText = CUMULATIVE_ALERT_STYLE;
        alertDiv.textContent = "ATENÇÃO! OS ALERTAS SÃO CUMULATIVOS, SE FOR ATIVADO O 2º ALARME SAEM OS MEIOS DE AMBOS OS ALARMES";
        const notice = parentContainer.querySelector(".intervention-notice");
        notice ? notice.insertAdjacentElement('afterend', alertDiv) : parentContainer.insertBefore(alertDiv, parentContainer.firstChild);
      }
    }
    /* ─── FINAL H TABLE (ULS note) ───────────────────────────── */
    function createFinalHTable(container) {
      if (container.querySelector(".ppi-final-table")) return;
      const table = document.createElement("table");
      table.classList.add("table-elements","ppi-final-table"); table.style.cssText = FINAL_H_TABLE_STYLE;
      const tr = document.createElement("tr");
      const tdH = document.createElement("td"); tdH.textContent = "H"; tdH.style.cssText = FINAL_H_CELL_STYLE;
      const tdText = document.createElement("td"); tdText.textContent = "ULS, EPE ou de acordo com a Autoridade de Saúde no local, ou a definir pelo CODU/INEM."; tdText.style.cssText = FINAL_H_TEXT_STYLE;
      tr.append(tdH, tdText); table.appendChild(tr); container.appendChild(table);
    }
    /* ─── SPECIALS CONTENT ───────────────────────────────────── */
    function formatSpecialsContentWithHighlights(text) {
      if (!text) return "";
      let out = text.replace(/\\n/g,"<br>").replace(/\n/g,"<br>");
      HIGHLIGHT_WORDS.sort((a,b) => b.length - a.length).forEach(word => {
        out = out.replace(new RegExp(`(${word.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')})`, "gi"), "<b>$1</b>");
      });
      return out;
    }
    function applySpecialsCellStyle(td) {
      Object.assign(td.style, {border:"1px solid #bbb",padding:"0 0 0 8px",textAlign:"left",verticalAlign:"top"});
    }
    function renderSpecialRow(tr, rowCols) {
      const col1 = rowCols[1] || "", col2 = rowCols[2] || "";
      if ((col1 && !col2) || (!col1 && col2)) {
        tr.innerHTML = ""; const td = tr.insertCell(); td.colSpan = 2; applySpecialsCellStyle(td); td.innerHTML = formatSpecialsContentWithHighlights(col1 || col2); return;
      }
      while (tr.cells.length < 2) tr.insertCell();
      while (tr.cells.length > 2) tr.deleteCell(-1);
      [col1, col2].forEach((content, i) => {const td = tr.cells[i]; applySpecialsCellStyle(td); td.colSpan = 1; td.innerHTML = formatSpecialsContentWithHighlights(content);});
    }
    /* ─── SPECIALS CONTAINER (shared setup) ─────────────────── */
    function ensureSpecialsContainer(containerId, parentContainerId, titleClass, insertBefore = false) {
      const parentEl = document.getElementById(parentContainerId);
      if (!parentEl) return null;
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement("div"); container.id = containerId;
        insertBefore ? parentEl.parentNode.insertBefore(container, parentEl) : parentEl.parentNode.insertBefore(container, parentEl.nextSibling);
      } else if (!insertBefore && container.nextSibling !== parentEl.nextSibling) {
        parentEl.parentNode.insertBefore(container, parentEl.nextSibling);
      }
      return container;
    }    
    /* ─── CLEAR / RESET ──────────────────────────────────────── */
    function clearPPIContainers(ppiPrefix) {
      [`${ppiPrefix}-grid-references`,`${ppiPrefix}-grid-container`,`${ppiPrefix}-specials-container`,`${ppiPrefix}-abs-note`]
        .forEach(id => {const el = document.getElementById(id); if (el) el.innerHTML = "";});
    }
    function resetModulePage(modulePrefix) {
      const ids = ["main-options","grid-controls","grid-references","grid-container","specials-container","abs-note"];
      const els = ids.reduce((acc,s) => {acc[s] = document.getElementById(`${modulePrefix}-${s}`); return acc;}, {});
      if (els["main-options"]) els["main-options"].style.display = "flex";
      if (els["grid-controls"]) {els["grid-controls"].style.display = "none"; els["grid-controls"].querySelectorAll("button").forEach(b => b.classList.remove("active"));}
      ["grid-references","grid-container","specials-container","abs-note"].forEach(s => {if (els[s]) els[s].innerHTML = "";});
    }
    /* ─── SIDEBAR RESET ──────────────────────────────────────── */
    document.addEventListener("DOMContentLoaded", () => {
      function hideAllPPITables() {
        ["ppia2","ppia22","ppiaero","ppilinfer"].forEach(prefix => {
          [`${prefix}-specials-container`,`${prefix}-grid-container`,`${prefix}-grid-references`,`${prefix}-abs-note`]
            .forEach(id => {const el = document.getElementById(id); if (el) el.innerHTML = "";});
        });
        document.getElementById("ppiaero-grid-info-container") && (document.getElementById("ppiaero-grid-info-container").innerHTML = "");
        document.getElementById("ppia22-abs-note") && (document.getElementById("ppia22-abs-note").innerHTML = "");
        document.getElementById("ppilinfer-abs-note") && (document.getElementById("ppilinfer-abs-note").innerHTML = "");
        document.querySelectorAll("#ppia2-grid-controls button,#ppia22-grid-controls button,#ppiaero-grid-controls button,#ppilinfer-grid-controls button")
          .forEach(btn => btn.classList.remove("active"));
      }
      document.querySelector(".sidebar-submenu-button.sub-submenu-toggle")?.addEventListener("click", hideAllPPITables);
      renderAeroCustomButtons();
    });
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
      btn.addEventListener("click", () => {
        const map = {"page-ppia22":"ppia22","page-ppilinfer":"ppilinfer"};
        const prefix = map[btn.getAttribute("data-page")];
        if (prefix) resetModulePage(prefix);
      });
    });
    /* ─── ENSURE ABS CONTAINER ───────────────────────────────── */
    function ensureAbsContainer(id, controlsId) {
      let absContainer = document.getElementById(id);
      if (!absContainer) {
        absContainer = document.createElement("div"); absContainer.id = id; absContainer.style.marginTop = "10px";
        document.getElementById(controlsId).parentNode.appendChild(absContainer);
      }
      return absContainer;
    }
    /* =============== PPI A22 =============== */
    function consultationGridA22KmType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      ShowA22KmControls();
    }
    function consultationGridA22ButtonType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      document.getElementById("ppia22-grid-controls").style.display = "block";
      ShowA22GridButtons();
    }
    /* ─── KM INPUT (shared between A22 and LinFer) ──────────── */
    function createKmInputField({id, placeholder, maxLen, decimalPlaces, style}) {
      const input = document.createElement("input");
      input.type = "text"; input.placeholder = placeholder; input.id = id;
      input.style.cssText = style || `padding:8px;width:160px;text-align:center;border:1px solid #ccc;border-radius:4px;transition:all 0.2s ease;outline:none;`;
      input.addEventListener("focus", () => {input.style.borderColor="#ccc"; input.style.boxShadow="0 0 5px rgba(0,0,0,0.1)";});
      input.addEventListener("blur",  () => {input.style.borderColor="#ccc"; input.style.boxShadow="none";});
      input.addEventListener("input", () => {
        let val = input.value.replace(",",".").replace(/[^\d.]/g,"");
        const parts = val.split(".");
        if (parts.length > 2) val = parts[0]+"."+parts[1];
        if (parts[1]) parts[1] = parts[1].slice(0, decimalPlaces);
        if (parts[0]) parts[0] = parts[0].slice(0, maxLen - (decimalPlaces + 1));
        val = parts[1] !== undefined ? parts[0]+"."+parts[1] : parts[0];
        input.value = val;
      });
      return input;
    }
    function createKmInput() {
      return createKmInputField({id:"ppia22-km-input", placeholder:"Introduza o Quilómetro", maxLen:6, decimalPlaces:2});
    }
    function createPKmInput() {
      return createKmInputField({id:"ppiLinFer-Pkm-input", placeholder:"Introduza o PKm", maxLen:7, decimalPlaces:3, style:LINFER_INPUT_STYLE});
    }
    /* ─── DIRECTION BUTTONS (shared) ─────────────────────────── */
    function createDirectionButtons(dirRow, directions, idPrefix, btnStyle, topStyle, botStyle, controlsSelector) {
      directions.forEach(d => {
        const btn = document.createElement("button");
        btn.id = idPrefix + d.id; btn.className = "btn btn-add options-btn"; btn.style.cssText = btnStyle;
        const l1 = document.createElement("div"); l1.textContent = d.line1; l1.style.cssText = topStyle;
        const l2 = document.createElement("div"); l2.textContent = d.line2; l2.style.cssText = botStyle;
        btn.append(l1, l2);
        btn.onclick = () => {
          const isActive = btn.classList.contains("active");
          document.querySelectorAll(`${controlsSelector} .btn`).forEach(b => b.classList.remove("active"));
          if (!isActive) btn.classList.add("active");
        };
        dirRow.appendChild(btn);
      });
    }
    function createKmDirectionButtons() {
      const dirRow = document.createElement("div"); dirRow.style.display="flex"; dirRow.style.gap="10px";
      createDirectionButtons(
        dirRow, [{id:"O-E",line1:"OESTE - ESTE",line2:"Lagos → VRSA"},{id:"E-O",line1:"ESTE - OESTE",line2:"VRSA → Lagos"}],
        "km-dir-", `width:160px;height:50px;display:flex;flex-direction:column;justify-content:center;align-items:center;font-weight:bold;`,
        "font-size:14px;", "font-size:11px;font-weight:normal;", "#ppia22-grid-controls");
      return dirRow;
    }
    function createPKmDirectionButtons() {
      const dirRow = document.createElement("div"); dirRow.style.cssText = LINFER_ROW_STYLE; dirRow.style.gap = "10px";
      createDirectionButtons(
        dirRow, [{id:"T-L",line1:"TROÇO",line2:"Tunes → Lagos"},{id:"T-V",line1:"TROÇO",line2:"Tunes → VRSA"}],
        "Pkm-dir-", LINFER_DIRECTION_BUTTON_STYLE, LINFER_DIRECTION_TOP_STYLE, LINFER_DIRECTION_BOT_STYLE, "#ppilinfer-grid-controls");
      return dirRow;
    }
    function buildKmSearchCard({containerId, titleText, directionButtons, inputEl, searchHandler, cardStyle, titleStyle}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.style.display = "block"; container.innerHTML = "";
      const card = document.createElement("div"); card.className = "options-main-card"; card.style.cssText = cardStyle;
      const title = document.createElement("label"); title.textContent = titleText; title.style.cssText = titleStyle;
      const btnSearch = document.createElement("button"); btnSearch.textContent = "Procurar"; btnSearch.className = "btn btn-add options-black-btn"; btnSearch.style.width = "150px";
      btnSearch.onclick = searchHandler;
      card.append(title, directionButtons, inputEl, btnSearch);
      container.appendChild(card);
    }
    function ShowA22KmControls() {
      const inputKm = createKmInput();
      buildKmSearchCard({
        containerId: "ppia22-grid-controls", titleText: "Selecione o Sentido",
        directionButtons: createKmDirectionButtons(), inputEl: inputKm,
        cardStyle: `display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;width:400px;margin:0 auto;margin-bottom:5px;`,
        titleStyle: `font-size:16px;font-weight:bold;`,
        searchHandler: async () => {
          const kmStr = inputKm.value.trim();
          const activeDir = document.querySelector("#ppia22-grid-controls .btn.active");
          if (!activeDir) return showPopup('popup-info', "Selecione o sentido primeiro!");
          if (!kmStr || isNaN(parseFloat(kmStr))) return showPopup('popup-info', "Introduza um quilómetro válido!");
          await loadPPIA22DataFromKm(parseFloat(kmStr), activeDir.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE");
        }
      });
    }
    function ShowLinFerPKmControls() {
      const inputKm = createPKmInput();
      buildKmSearchCard({
        containerId: "ppilinfer-grid-controls", titleText: "Selecione o Troço",
        directionButtons: createPKmDirectionButtons(), inputEl: inputKm,
        cardStyle: LINFER_CARD_STYLE, titleStyle: LINFER_TITLE_LABEL_STYLE,
        searchHandler: async () => {
          const kmStr = inputKm.value.trim();
          const activeDir = document.querySelector("#ppilinfer-grid-controls .btn.active");
          if (!activeDir) return showPopup('popup-info', "Selecione o troço primeiro!");
          if (!kmStr || isNaN(parseFloat(kmStr))) return showPopup('popup-info', "Introduza um ponto quilométrico válido!");
          await loadPPILinFerDataFromKm(parseFloat(kmStr), activeDir.id === "Pkm-dir-T-L" ? "TUNES-LAGOS" : "TUNES-VRSA");
        }
      });
    }
    /* ─── A22 GRID BUTTONS ───────────────────────────────────── */
    function createA22SenceTitle(text, isTop) {
      const row = document.createElement("div"); row.className = "form-row";
      row.style.cssText = A22_TITLE_STYLE; row.style.borderRadius = isTop ? "3px 3px 0 0" : "0 0 3px 3px";
      const label = document.createElement("label"); label.textContent = text;
      row.appendChild(label); return row;
    }
    function createA22GridButtons(id, specialButtons) {
      const btn = document.createElement("button"); btn.id = id; btn.textContent = id; btn.className = "btn btn-add options-btn"; btn.style.cssText = A22_GRID_BUTTON_STYLE;
      if (specialButtons.has(id) && getCorpNr() === "0805") btn.classList.add("options-yellow-btn");
      btn.onclick = e => {
        e.preventDefault();
        const isActive = btn.classList.contains("active");
        document.querySelectorAll("#ppia22-grid-controls button").forEach(b => b.classList.remove("active"));
        isActive ? clearPPIContainers("ppia22") : (btn.classList.add("active"), loadPPIA22DataFromButton(id));
      };
      return btn;
    }
    function ShowA22GridButtons() {
      const container = document.getElementById("ppia22-grid-controls");
      if (!container) return;
      container.style.cssText = A22_GRID_CONTAINER_STYLE; container.innerHTML = "";
      const directions = [{label:"SENTIDO OESTE - ESTE",sublabel:"(Lagos - Vila Real de Santo António)",prefix:"1"},
                          {label:"SENTIDO ESTE - OESTE",sublabel:"(Vila Real de Santo António - Lagos)",prefix:"2"}];
      const specialButtons = new Set(["1M","1N","1O","1P","1Q","1R","2J","2K","2L","2M","2N","2O","2P"]);
      directions.forEach(dir => {
        container.append(createA22SenceTitle(dir.label, true), createA22SenceTitle(dir.sublabel, false));
        const rowButtons = document.createElement("div"); rowButtons.className = "form-row";
        rowButtons.style.cssText = A22_ROW_STYLE; rowButtons.style.justifyContent = "center";
        for (let i=0; i<19; i++) rowButtons.appendChild(createA22GridButtons(`${dir.prefix}${String.fromCharCode(65+i)}`, specialButtons));
        container.appendChild(rowButtons);
      });
    }
    /* ─── A22 CELL HELPERS ───────────────────────────────────── */
    function createCell(text, {colSpan=1, rowSpan=1, bold=false, center=false} = {}) {
      const td = document.createElement("td"); td.colSpan=colSpan; td.rowSpan=rowSpan; td.textContent=text||"";
      td.style.cssText = bold ? A22_CELL_STYLE : A22_CELL_STYLE_NORMAL;
      td.style.textAlign = center ? "center" : "inherit"; return td;
    }
    function createDirectionCell(ppi) {
      const td = createCell("", {rowSpan:2, center:true});
      const top = document.createElement("div"); top.textContent="SENTIDO"; top.style.cssText=A22_DIRECTION_TOP_STYLE;
      const mid = document.createElement("div"); mid.textContent=ppi.ppi_sence; mid.style.cssText=A22_DIRECTION_MID_STYLE;
      const bot = document.createElement("div"); bot.textContent=ppi.ppi_direction; bot.style.cssText=A22_DIRECTION_BOT_STYLE;
      td.append(top, mid, bot); return td;
    }
    function createNodeCell(nodeStr="") {
      const [main, km] = nodeStr.split("(");
      const td = createCell("", {bold:true, center:true});
      td.innerHTML = `${main||""}<span style="${A22_NODE_KM_STYLE}">(${km||""}</span>`; return td;
    }
    /* ─── A22 LOAD DATA ──────────────────────────────────────── */
    async function loadPPIA22DataFromButton(buttonId) {
      await loadPPIA22DataInfoGrid(buttonId);
      await loadPPIA22DataSpecials(buttonId);
      await loadPPIA22GridSeparated(buttonId);
      const tempContainer = document.getElementById("ppia22-grid-container")?.firstChild;
      if (tempContainer) createFinalHTable(tempContainer);
      ppia22ABSNoteTable(ensureAbsContainer("ppia22-abs-note","ppia22-grid-controls"), buttonId);
    }
    async function loadPPIA22DataFromKm(km, sentido) {
      try {
        const data = await fetchFromSupabase("ppia22_data", `ppi_sence=eq.${sentido}`);
        const filtered = data.filter(ppi => {
          const f = parseFloat((ppi.ppi_first_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          const s = parseFloat((ppi.ppi_secound_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          return km >= Math.min(f,s) && km <= Math.max(f,s);
        });
        if (!filtered.length) {
          showPopup('popup-danger', "Nenhuma grelha encontrada para este quilómetro.");           
          return;
        }
        const limiteGrelhas = filtered.filter(ppi => {
          const f = parseFloat((ppi.ppi_first_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          const s = parseFloat((ppi.ppi_secound_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          return km === f || km === s;
        });
        if (limiteGrelhas.length > 1) {
          const grelhas = limiteGrelhas.map(p=>p.ppi_grid).sort((a,b)=>a.localeCompare(b));
          showPopup('popup-danger', `O quilómetro <b style="color:red">${km.toFixed(2)}</b> corresponde ao limite entre duas grelhas, 
                            <b style="color:red">${grelhas.length===2?grelhas.join(" e "):grelhas.join(", ")}</b>.<br>Para garantir maior precisão na atribuição de meios, 
                            recomenda-se a consulta direta por grelha. Obrigado.`);
          return;
        }
        const gridContainer = document.getElementById("ppia22-grid-container");
        for (const ppi of filtered) {
          await loadPPIA22DataInfoGrid(ppi.ppi_grid);
          await loadPPIA22DataSpecials(ppi.ppi_grid);
          await loadPPIA22GridSeparated(ppi.ppi_grid);
          const tempContainer = gridContainer.firstChild;
          if (tempContainer) createFinalHTable(tempContainer);
          ppia22ABSNoteTable(ensureAbsContainer("ppia22-abs-note","ppia22-grid-controls"), ppi.ppi_grid);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }
    async function loadPPIA22DataInfoGrid(gridId) {
      const container = document.getElementById("ppia22-grid-references");
      if (!container) return;
      ensureLoadingMarker(container);
      const loading = container.querySelector(".loading-mark");
      loading.style.display = "block";
      try {
        const corpNr = getCorpNr();
        const data  = await fetchFromSupabase("ppia22_data", `ppi_grid=eq.${gridId}`);
        const refs  = await fetchFromSupabase("ppia22_references", `grid_code=eq.${gridId}`);
        const refIds = refs.map(r => r.id);
        const means = refIds.length ? await fetchFromSupabase("ppia22_means", `reference_id=in.(${refIds.join(",")})`) : [];
        createOrUpdateInterventionNotice(container, corpNr && means.some(m => typeof m.means==="string" && m.means.includes(corpNr)));
        if (!data.length) return renderNoData(container);
        const ppi = data[0];
        let table = container.querySelector("table");
        if (!table) {table=document.createElement("table"); table.className="table-elements"; table.style.cssText=A22_TABLE_STYLE; container.appendChild(table);}
        table.innerHTML = "";
        table.appendChild(createColGroup(["260px","262px","calc(33% - 40px)","calc(33% - 40px)"]));
        const tr1 = document.createElement("tr");
        tr1.append(createCell(`GRELHA ${ppi.ppi_grid} - CB`,{rowSpan:2,bold:true,center:true}), createDirectionCell(ppi), createCell("TROÇO",{colSpan:2,bold:true,center:true}));
        table.appendChild(tr1);
        const tr2 = document.createElement("tr"); tr2.append(createNodeCell(ppi.ppi_first_node), createNodeCell(ppi.ppi_secound_node)); table.appendChild(tr2);
        [["COORDENADAS LAT/LONG",ppi.ppi_first_coordinate,ppi.ppi_secound_coordinate],
         ["ALTITUDE (m)",ppi.ppi_first_height,ppi.ppi_secound_height],
         ["Ponto de Trânsito (PT) / Local de Reforço Tático (LRT)",ppi.ppi_ptlrt_coordinates,ppi.ppi_ptlrt_coordinates]
        ].forEach(([label,left,right], index) => {
          const tr = document.createElement("tr");
          const tdLabel = document.createElement("td"); tdLabel.colSpan=2; tdLabel.style.cssText=A22_LABEL_CELL_STYLE; tdLabel.textContent=label||"";
          const tdLeft = document.createElement("td"); tdLeft.textContent=left||""; tdLeft.style.cssText=A22_CELL_STYLE;
          if (index===2) {tdLeft.colSpan=2; tr.append(tdLabel,tdLeft);}
          else {const tdRight=document.createElement("td"); tdRight.textContent=right||""; tdRight.style.cssText=A22_CELL_STYLE; tr.append(tdLabel,tdLeft,tdRight);}
          table.appendChild(tr);
        });
      } catch (err) {
        console.error("❌ Erro ao carregar PPI data:", err);
        showError(container,"Erro ao carregar PPI data. Veja o console.");
      }
      finally {loading.style.display = "none";}
    }
    async function loadPPIA22DataSpecials(gridId) {
      const container = ensureSpecialsContainer("ppia22-specials-container","ppia22-grid-references");
      if (!container) return;
      if (!container.querySelector(".ppia22-title")) {
        const titleDiv = document.createElement("div"); titleDiv.textContent="SITUAÇÕES ESPECIAIS";
        Object.assign(titleDiv.style,{backgroundColor:"#fff3b0",fontWeight:"bold",textAlign:"center",padding:"4px",margin:"-5px 0 -1px 0",border:"1px solid #bbb"});
        titleDiv.classList.add("ppia22-title"); container.appendChild(titleDiv);
      }
      let dataContainer = container.querySelector(".ppia22-data");
      if (!dataContainer) {dataContainer=document.createElement("div"); dataContainer.classList.add("ppia22-data"); container.appendChild(dataContainer);}
      try {
        dataContainer = container.querySelector(".ppia22-data");
        const specials = await fetchFromSupabase("ppia22_specials",`grid_code=eq.${gridId}&order=part,row_order,col`);
        if (!specials.length) {dataContainer.innerHTML="Sem informações especiais para esta grelha."; return;}
        const part1 = specials.filter(s=>s.part===1);
        let p1Div = dataContainer.querySelector(".ppia22-part1");
        if (!p1Div) {p1Div=document.createElement("div"); Object.assign(p1Div.style,{border:"1px solid #bbb",padding:"0 0 0 8px",marginBottom:"-5px",textAlign:"left"});
                     p1Div.classList.add("ppia22-part1"); dataContainer.appendChild(p1Div);}
        p1Div.innerHTML = part1.map(s=>formatSpecialsContentWithHighlights(s.content)).join("<br>");
        let table = dataContainer.querySelector("table");
        if (!table) {
          table=document.createElement("table"); table.classList.add("table-elements"); 
          Object.assign(table.style,{width:"100%",borderCollapse:"collapse",margin:"4px 0 5px 0"}); dataContainer.appendChild(table);}
        const rowsMap = groupByRow(specials.filter(s=>s.part===2));
        const tbody = table.tBodies[0] || table.createTBody();
        syncRowCount(tbody, Object.keys(rowsMap).length);
        Object.values(rowsMap).forEach((cols,idx) => renderSpecialRow(tbody.rows[idx], cols));
      } catch (err) {
        console.error("❌ Erro ao carregar specials PPIA22:", err); dataContainer.innerHTML="Erro ao carregar informações especiais. Veja o console.";
      }
    }
    async function fetchAllMeans() {
      const all=[]; let start=0; const pageSize=1000;
      while(true) {
        const end=start+pageSize-1;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ppia22_means?select=*`,{headers:{...getSupabaseHeaders(),Range:`${start}-${end}`}});
        if(!res.ok) throw new Error(`Erro ao buscar ppia22_means: ${res.status}`);
        const chunk=await res.json(); all.push(...chunk);
        if(chunk.length<pageSize) break; start+=pageSize;
      }
      return all;
    }
    async function fetchRelevantMeans(ids) {
      if(!ids.length) return [];
      return fetchFromSupabase("ppia22_means",`reference_id=in.(${ids.join(",")})`);
    }
    async function loadPPIA22GridSeparated(gridId) {
      const container = document.getElementById("ppia22-grid-container");
      if (!container) return;
      const tempContainer = document.createElement("div"); tempContainer.style.display="none";
      try {
        const references = await fetchFromSupabase("ppia22_references",`grid_code=eq.${gridId}`);
        if (!references.length) return;
        const means = await fetchRelevantMeans(references.map(r=>r.id));
        const occurrenceTypes = {"Acidente":"#a5d6a7","Substâncias Perigosas":"#ffcc80","Incêndio em Transportes":"#90caf9"};
        tempContainer.appendChild(buildOccurrenceTable(occurrenceTypes, references, means, 'A22', gridId, ["80px","calc(33% - 40px)","80px","calc(33% - 40px)","33%"]));
        container.innerHTML=""; container.appendChild(tempContainer); tempContainer.style.display="block";
        createOrUpdateCumulativeAlert(tempContainer);
      } catch(err) {
        console.error("❌ Erro ao carregar grelha PPI A22:", err); container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    function ppia22ABSNoteTable(container, buttonId) {
      if(!container||!buttonId||buttonId.length<2) return;
      const dir=buttonId[0], index=buttonId[1].toUpperCase().charCodeAt(0)-65;
      let number = dir==='1' ? (index<=1?1:index) : (index===0?1:index>=16?18:index+1);
      container.innerHTML="";
      const table=document.createElement("table"); table.classList.add("table-elements");
      Object.assign(table.style,{width:"100%",marginTop:"-5px",borderCollapse:"collapse",lineHeight:"15px"});
      const tr=document.createElement("tr"), td=document.createElement("td");
      td.textContent=`* As ABSC a despacho para o PPI da Via do Infante de Sagres, não devem ser as afetas ao PEM do INEM, sendo complementares às mobilizadas pelo CODU do INEM (GRELHA ${number} INEM)`;
      Object.assign(td.style,{padding:"5px",textAlign:"left",border:"1px solid #bbb"});
      tr.appendChild(td); table.appendChild(tr); container.appendChild(table);
    }
    /* ============ PPI AEROPORTO ============ */
    function renderAeroCustomButtons() {
      const container = document.getElementById("ppiaero-grid-controls");
      if (!container) return;
      container.innerHTML="";
      const buttonsData=[{id:"A1",label:"11 a 20 Pessoas"},{id:"A2",label:"21 a 30 Pessoas"},{id:"A3",label:"31 a 100 Pessoas"},{id:"A4",label:"+ de 101 Pessoas"},{id:"B1",label:"Queda Declarada"}];
      const labelDiv=document.createElement("div"); labelDiv.textContent="GRELHAS DE ALARME"; Object.assign(labelDiv.style,AERO_LABEL_STYLE);
      container.appendChild(labelDiv);
      const rowButtons=document.createElement("div"); Object.assign(rowButtons.style, AERO_ROW_STYLE);
      buttonsData.forEach(btnData => {
        const btn=document.createElement("button"); btn.id=btnData.id; btn.className="btn btn-add options-btn";
        btn.textContent=`${btnData.id} (${btnData.label})`;
        const bgMap={B1:"black", A1:"green", A2:"yellow", A3:"orange", A4:"red"};
        const colorMap={B1:"red",A2:"black",A3:"black"};
        Object.assign(btn.style,{...AERO_BUTTON_STYLE,background:bgMap[btnData.id]||"red",color:colorMap[btnData.id]||"white"});
        btn.addEventListener("click", e=>handleAeroButtonClick(e,btn,btnData));
        rowButtons.appendChild(btn);
      });
      container.appendChild(rowButtons);
    }
    function handleAeroButtonClick(event, btn, btnData) {
      event.preventDefault();
      const isActive=btn.classList.contains("active");
      document.querySelectorAll("#ppiaero-grid-controls button").forEach(b=>b.classList.remove("active"));
      if (isActive) {
        document.getElementById("ppiaero-grid-container").innerHTML="";
        ["ppiaero-grid-header","ppiaero-grid-info"].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display="none";});
        return;
      }
      btn.classList.add("active");
      btn.id==="B1" ? loadPPIAeroGridB1(btn.id) : loadPPIAeroGridSeparated(btn.id);
      ppiaeroHeaderTable(btn.id, btnData.label);
      ppiaeroInfoTable();
    }
    function ppiaeroHeaderTable(gridId, label) {
      const container=document.getElementById("ppiaero-grid-info-container"); if(!container) return;
      let table=document.getElementById("ppiaero-grid-header");
      if (!table) {
        table=document.createElement("table"); table.id="ppiaero-grid-header";
        Object.assign(table.style,AERO_HEADER_TABLE_STYLE); container.prepend(table);
      }
      table.innerHTML="";
      const tr=document.createElement("tr"), td=document.createElement("td"); Object.assign(td.style,AERO_HEADER_CELL_STYLE);
      td.textContent=gridId==="B1"?`Grelha de Alarmes dos Corpos de Bombeiros - ${gridId} - Queda Declarada de Aeronave`:`Grelha de Alarmes dos Corpos de Bombeiros - ${gridId} - Aeronave com (${label} a Bordo)`;
      tr.appendChild(td); table.appendChild(tr); table.style.display="table";
    }
    function ppiaeroInfoTable() {
      const container=document.getElementById("ppiaero-grid-info-container"); if(!container) return;
      let table=document.getElementById("ppiaero-grid-info");
      if (!table) {
        table=document.createElement("table"); table.id="ppiaero-grid-info"; Object.assign(table.style,AERO_INFO_TABLE_STYLE);
        const cg=document.createElement("colgroup");
        [["col1","17%"],["col2","83%"]].forEach(([,w])=>{const col=document.createElement("col");col.style.width=w;cg.appendChild(col);});
        table.appendChild(cg);
        const tr=document.createElement("tr");
        const td1=document.createElement("td"); td1.textContent="GRELHA DE ALARME PARA OS CORPOS DE BOMBEIROS";
        Object.assign(td1.style,{...AERO_CELL_STYLE,textAlign:"center",backgroundColor:"orange",color:"black",fontWeight:"bold"});
        const td2=document.createElement("td"); 
        td2.textContent="Esta grelha aplica-se aos cenários de proteção e socorro. Podendo aplicar-se aos restantes cenários definidos pelo PAE Gago Coutinho - Faro, Algarve, desde que solicitado pelas forças de segurança ao CRERPC.";
        Object.assign(td2.style,{...AERO_CELL_STYLE,textAlign:"left",fontWeight:"bold"});
        tr.append(td1,td2); table.appendChild(tr); container.appendChild(table);
      }
      table.style.display="table";
    }
    function splitMeans(means) {
      if (!means) return {meio:"",corp:""};
      if (means.includes("**")) {const [a,b]=means.split("**"); return {meio:a+"**",corp:b?.trim()||""};}
      if (means.includes("*"))  {const [a,b]=means.split("*");  return {meio:a+"*", corp:b?.trim()||""};}
      const [a,b]=(means.trim().split(/\s+(.+)/)||["",""]);
      return {meio:a||"",corp:b||""};
    }
    function renderPPIAeroAlarmCells(tr, item) {
      const corpNr=getCorpNr();
      const {meio,corp}=item?.means?splitMeans(item.means):{meio:"",corp:""};
      [meio,corp].forEach(content=>{
        const td=document.createElement("td"); td.textContent=content; Object.assign(td.style,AERO_CELL_STYLE);
        if(corpNr&&corp.includes(corpNr)) Object.assign(td.style,{backgroundColor:"#839ec9",color:"white",fontWeight:"bold"});
        tr.appendChild(td);
      });
    }
    function appendReservaCell(tr) {
      const td=document.createElement("td"); td.textContent="RESERVA"; td.colSpan=2; Object.assign(td.style,AERO_RESERVA_CELL_STYLE); tr.appendChild(td);
    }
    function appendEmptyCells(tr,count) {
      for(let i=0;i<count;i++){const td=document.createElement("td");td.textContent="";Object.assign(td.style,{border:"1px solid #bbb"});tr.appendChild(td);}
    }
    function appendPPIAeroCells(tr,item){
      if(!item) return appendEmptyCells(tr,2);
      const corpNr=getCorpNr(), {meio,corp}=splitMeans(item.means);
      [meio,corp].forEach(content=>{
        const td=document.createElement("td"); td.textContent=content; Object.assign(td.style,AERO_CELL_STYLE);
        if(corpNr&&corp.includes(corpNr)) Object.assign(td.style,{backgroundColor:"#839ec9",color:"white",fontWeight:"bold"});
        tr.appendChild(td);
      });
    }
    function createAeroHeaderRow(gridId) {
      const tr=document.createElement("tr");
      [{title:"ALERTA AMARELO",bg:"yellow",color:"black"},{title:"ALERTA VERMELHO",bg:"red",color:"white"}].forEach(({title,bg,color})=>{
        const th=document.createElement("th"); th.colSpan=2; th.style.textAlign="center"; th.style.padding="4px"; th.style.fontWeight="bold";
        th.style.backgroundColor=bg; th.style.color=color;
        const wrapper=document.createElement("div"); Object.assign(wrapper.style,{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"6px"});
        const titleDiv=document.createElement("div"); titleDiv.textContent=title; titleDiv.style.flex="1"; titleDiv.style.textAlign="center";
        const btn=createAudioButton('Aeroporto',gridId,title,null,`Toque rápido ${title.split(" ")[1]}`);
        wrapper.append(titleDiv,btn); th.innerHTML=""; th.appendChild(wrapper); tr.appendChild(th);
      });
      return tr;
    }
    async function loadPPIAeroGridSeparated(gridId) {
      const container=document.getElementById("ppiaero-grid-container"); if(!container) return;
      const tempContainer=document.createElement("div"); tempContainer.style.display="none";
      try {
        const [references,means]=await Promise.all([fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_references?select=*&grid_code=eq.${gridId}`),fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_means?select=*`)]);
        const table=document.createElement("table"); table.classList.add("table-elements");
        Object.assign(table.style,{tableLayout:"fixed",width:"100%",margin:"10px 0 5px 0"});
        table.appendChild(createColGroup(AERO_B1_COL_STYLE));
        table.appendChild(createAeroHeaderRow(gridId));
        const tbody=document.createElement("tbody");
        references.forEach(ref=>{
          const amareloMeans=sortedMeans(means,ref.id,"AMARELO"), vermelhoMeans=sortedMeans(means,ref.id,"VERMELHO");
          const maxRows=Math.max(amareloMeans.length?Math.max(...amareloMeans.map(m=>m.display_order??1)):0,vermelhoMeans.length?Math.max(...vermelhoMeans.map(m=>m.display_order??1)):0);
          const reserveIndex=amareloMeans.length>1?Math.max(...amareloMeans.map(m=>m.display_order??1))-1:null;
          for(let i=1;i<=maxRows;i++){
            const tr=document.createElement("tr");
            const aItem=amareloMeans.find(m=>(m.display_order??1)===i), vItem=vermelhoMeans.find(m=>(m.display_order??1)===i);
            if(reserveIndex&&i===reserveIndex&&!aItem){appendReservaCell(tr);appendPPIAeroCells(tr,vItem);}
            else{appendPPIAeroCells(tr,aItem);appendPPIAeroCells(tr,vItem);}
            tbody.appendChild(tr);
          }
        });
        table.appendChild(tbody); tempContainer.appendChild(table);
        container.innerHTML=""; tempContainer.style.display="block"; container.appendChild(tempContainer);
        createOrUpdateCumulativeAlert(tempContainer); ppiaeroABSNoteTable(tempContainer);
      } catch(err){
        console.error("❌ Erro ao carregar grelha PPIAero:",err);container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    async function loadPPIAeroGridB1(gridId) {
      const container=document.getElementById("ppiaero-grid-container"); if(!container) return;
      const tempContainer=document.createElement("div"); tempContainer.style.display="none";
      try {
        const [references,means]=await Promise.all([fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_references?select=*&grid_code=eq.${gridId}`),fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_means?select=*`)]);
        const table=document.createElement("table"); table.classList.add("table-elements"); Object.assign(table.style,AERO_B1_TABLE_STYLE);
        table.appendChild(createColGroup(AERO_B1_COL_STYLE));
        const thead=document.createElement("thead");
        const trHead1=document.createElement("tr"), th=document.createElement("th"); th.colSpan=4; Object.assign(th.style,AERO_B1_HEADER1_STYLE);
        const wrapper=document.createElement("div");
        Object.assign(wrapper.style,AERO_B1_WRAPPER_STYLE);
        const titleDiv=document.createElement("div"); titleDiv.textContent="ALERTA VERMELHO"; Object.assign(titleDiv.style,AERO_B1_TITLE_DIV_STYLE);
        const btn=createAudioButton('Aeroporto',gridId,'ALERTA VERMELHO',null,'Toque rápido VERMELHO');
        wrapper.append(titleDiv,btn); th.innerHTML=""; th.appendChild(wrapper); trHead1.appendChild(th); thead.appendChild(trHead1);
        const trHead2=document.createElement("tr");
        ["Frente Aeroporto - Portaria do Aeroporto","Frente Cidade - Parque Ribeirinho"].forEach((title, i) => {
          const th = document.createElement("th"); th.textContent = title; th.colSpan = 2; Object.assign(th.style, AERO_B1_HEADER2_STYLE);
          if (i === 0) {
            th.style.backgroundColor = "#e7f1ff";
            th.style.color = "#084298";
            th.style.border = "1px solid #b6d4fe";
          } else {
            th.style.backgroundColor = "#e9f7ef";
            th.style.color = "#146c43";
            th.style.border = "1px solid #badbcc";
          }
          trHead2.appendChild(th);
        });
        thead.appendChild(trHead2); table.appendChild(thead);
        const tbody=document.createElement("tbody");
        references.forEach(ref=>{
          const aeroportoMeans=means.filter(m=>m.reference_id===ref.id&&m.alarm_level==="Frente Aeroporto - Portaria do Aeroporto").sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const cidadeMeans=means.filter(m=>m.reference_id===ref.id&&m.alarm_level==="Frente Cidade - Parque Ribeirinho").sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const maxRows=Math.max(aeroportoMeans.length,cidadeMeans.length);
          if(maxRows===0) return;
          for(let i=1;i<=maxRows;i++){
            const tr=document.createElement("tr");
            renderPPIAeroAlarmCells(tr,aeroportoMeans.find(m=>(m.display_order??1)===i));
            renderPPIAeroAlarmCells(tr,cidadeMeans.find(m=>(m.display_order??1)===i));
            tbody.appendChild(tr);
          }
        });
        table.appendChild(tbody); tempContainer.appendChild(table);
        container.innerHTML=""; tempContainer.style.display="block"; container.appendChild(tempContainer);
        ppiaeroABSNoteTable(tempContainer);
      } catch(err) {
        console.error("❌ Erro ao carregar grelha B1:",err);container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    function ppiaeroABSNoteTable(container) {
      const table=document.createElement("table"); table.classList.add("table-elements"); Object.assign(table.style,AERO_ABS_NOTE_STYLE);
      const tr=document.createElement("tr"), td=document.createElement("td");
      Object.assign(td.style,{padding:"5px",textAlign:"left",whiteSpace:"pre-line",border:"none"});
      const line1=document.createElement("span"); line1.textContent="* As ABSC a despacho para o PPI do Aeroporto Gago Coutinho, não devem ser as afetas ao PEM do INEM.\n";
      Object.assign(line1.style,{fontSize:"12px",fontWeight:"bold",fontStyle:"italic"});
      const line2=document.createElement("span"); line2.textContent="** Equipas com capacidade de Resgate."; Object.assign(line2.style,{fontSize:"12px",fontWeight:"bold",fontStyle:"italic"});
      td.append(line1,line2); tr.appendChild(td); table.appendChild(tr); container.appendChild(table);
    }
    /* ===== PPI LINHA FÉRREA DO ALGARVE ===== */
    function consultationGridLinFerKmType() {
      document.getElementById("ppilinfer-main-options").style.display="none";
      ShowLinFerPKmControls();
    }
    function consultationGridLinFerButtonType() {
      document.getElementById("ppilinfer-main-options").style.display="none";
      document.getElementById("ppilinfer-grid-controls").style.display="block";
      ShowLinFerGridButtons();
    }
    function createLinFerGridButtons(id, specialButtons) {
      const btn=document.createElement("button"); btn.id=id; btn.textContent=id; btn.className="btn btn-add options-btn"; btn.style.cssText=LINFER_GRID_BUTTON_STYLE;
      if(specialButtons.has(id)&&getCorpNr()==="0805") btn.classList.add("options-yellow-btn");
      btn.onclick=e=>{
        e.preventDefault();
        const isActive=btn.classList.contains("active");
        document.querySelectorAll("#ppilinfer-grid-controls button").forEach(b=>b.classList.remove("active"));
        if(isActive){clearPPIContainers("ppilinfer");const a=document.getElementById("ppilinfer-abs-note");if(a)a.innerHTML="";}
        else{btn.classList.add("active");loadPPILinFerDataFromButton(id);}
      };
      return btn;
    }
    function ShowLinFerGridButtons() {
      const container=document.getElementById("ppilinfer-grid-controls"); if(!container) return;
      Object.assign(container.style,{display:"flex",flexDirection:"column",alignItems:"center"}); container.innerHTML="";
      const titleRow=document.createElement("div"); titleRow.className="form-row"; titleRow.style.cssText=LINFER_TITLE_STYLE;
      const label=document.createElement("label"); label.textContent="GRELHAS DE ALARME"; titleRow.appendChild(label); container.appendChild(titleRow);
      const specialButtons=new Set(["F","G","H","I","J","K","L","M","N","O","P"]);
      const rowButtons=document.createElement("div"); rowButtons.className="form-row"; rowButtons.style.cssText=LINFER_ROW_STYLE; rowButtons.style.justifyContent="center";
      "ABCDEFGHIJKLMNOP".split("").forEach(letter=>rowButtons.appendChild(createLinFerGridButtons(letter,specialButtons)));
      container.appendChild(rowButtons);
    }
    async function loadPPILinFerDataFromButton(buttonId) {
      await loadPPILinFerDataInfoGrid(buttonId);
      await loadPPILinFerDataSpecials(buttonId);
      await loadPPILinFerGridSeparated(buttonId);
      const tempContainer=document.getElementById("ppilinfer-grid-container")?.firstChild;
      if(tempContainer) createFinalHTable(tempContainer);
      ppiLinFerABSNoteTable(ensureAbsContainer("ppilinfer-abs-note","ppilinfer-grid-controls"), buttonId);
    }
    async function loadPPILinFerDataFromKm(km, sentido) {
      try {
        ["ppilinfer-grid-container","ppilinfer-grid-references","ppilinfer-specials-container","ppilinfer-abs-note"]
          .forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML="";});
        const data=await fetchFromSupabase("ppilinfer_data",`ppi_sence=ilike.*${sentido}*`);
        const filtered=data.filter(ppi=>{
          const f=parseFloat(ppi.ppi_first_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          const s=parseFloat(ppi.ppi_secound_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          return km>=Math.min(f,s)&&km<=Math.max(f,s);
        });
        if(!filtered.length){
          showPopup('popup-danger', "Nenhuma grelha encontrada para este ponto quilométrico no troço selecionado.");
          return;
        }
        const limiteGrelhas=filtered.filter(ppi=>{
          const f=parseFloat(ppi.ppi_first_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          const s=parseFloat(ppi.ppi_secound_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          return km===f||km===s;
        });
        if(limiteGrelhas.length>1){
          const grelhas=limiteGrelhas.map(p=>p.grid_id).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
          showPopup('popup-danger', `O Ponto Quilométrico <b style="color:red">${km.toFixed(3)}</b> corresponde ao limite entre duas grelhas 
                            <b style="color:red">${grelhas.length===2?grelhas.join(" e "):grelhas.join(", ")}</b>.<br>Para garantir maior precisão na atribuição de meios, 
                            recomenda-se a consulta direta por grelha. Obrigado.`);
          return;
        }
        const gridContainer=document.getElementById("ppilinfer-grid-container");
        for(const ppi of filtered){
          const gridId=ppi.grid_id;
          await loadPPILinFerDataInfoGrid(gridId); await loadPPILinFerDataSpecials(gridId); await loadPPILinFerGridSeparated(gridId);
          const tempContainer=gridContainer.firstChild; if(tempContainer) createFinalHTable(tempContainer);
          ppiLinFerABSNoteTable(ensureAbsContainer("ppilinfer-abs-note","ppilinfer-grid-controls"), gridId);
        }
      } catch(err){
        console.error("Erro ao carregar dados:",err);alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }
    /* ─── LINFER CELL HELPERS ────────────────────────────────── */
    function createTd(text="",colSpan=1,rowSpan=1,align="left",bold=false,border="1px",bgColor="",color="",fontSize="14px") {
      const td=document.createElement("td"); td.colSpan=colSpan; td.rowSpan=rowSpan; td.textContent=text;
      let css=`border:${border} solid #bbb;padding:5px;text-align:${align};font-weight:${bold?"bold":"normal"};font-size:${fontSize};`;
      if(bgColor) css+=` background:${bgColor};`; if(color) css+=` color:${color};`;
      td.style.cssText=css; return td;
    }
    function createPkmTd(pkmStr) {
      const td=document.createElement("td"); td.style.cssText=`border:1px solid #bbb;padding:5px;text-align:center;vertical-align:middle;`;
      if(!pkmStr) return td;
      const parts=pkmStr.split('\\n');
      const firstLine=document.createElement("div"); firstLine.textContent=parts[0]||""; firstLine.style.cssText=LINFER_PKM_FIRST_LINE_STYLE;
      td.appendChild(firstLine);
      if(parts[1]){const secondLine=document.createElement("div");secondLine.textContent=parts[1];secondLine.style.cssText=LINFER_PKM_SECOND_LINE_STYLE;td.appendChild(secondLine);}
      return td;
    }
    async function loadPPILinFerDataInfoGrid(gridId) {
      const container=document.getElementById("ppilinfer-grid-references"); if(!container) return;
      ensureLoadingMarker(container);
      const loading=container.querySelector(".loading-mark"); loading.style.display="block";
      try {
        const corpNr=getCorpNr();
        const data=await fetchFromSupabase("ppilinfer_data",`grid_id=eq.${gridId}`);
        const refs=await fetchFromSupabase("ppilinfer_references",`grid_code=eq.${gridId}`);
        const means=refs.length?await fetchFromSupabase("ppilinfer_means",`reference_id=in.(${refs.map(r=>r.id).join(",")})`):[]; 
        createOrUpdateInterventionNotice(container,corpNr&&means.some(m=>typeof m.means==="string"&&m.means.includes(corpNr)));
        if(!data.length) return renderNoData(container);
        const ppi=data[0];
        let table=container.querySelector("table");
        if(!table){table=document.createElement("table");table.className="table-elements";table.style.cssText=LINFER_TABLE_STYLE;container.appendChild(table);}
        table.innerHTML="";
        table.appendChild(createColGroup(["200px","200px","calc(33% - 40px)","calc(33% - 40px)"]));
        const tr1=document.createElement("tr");
        tr1.append(createTd("",2,2,"center","bold","0px"),createTd(`GRELHA ${ppi.grid_id} - ${ppi.ppi_sence||"TROÇO"}`,2,1,"center","bold","1px","#323ac2","#e6e6e6","16px"));
        table.appendChild(tr1);
        const tr2=document.createElement("tr"); tr2.append(createPkmTd(ppi.ppi_first_pkm),createPkmTd(ppi.ppi_secound_pkm)); table.appendChild(tr2);
        const municipalities=(Array.isArray(ppi.ppi_municipalities)?ppi.ppi_municipalities:(ppi.ppi_municipalities||"{}").replace(/[{}"]/g,"").split(",").map(s=>s.trim()));
        [["COORDENADAS",ppi.ppi_first_coordinate,ppi.ppi_secound_coordinate],
         ["ALTITUDE(m)",ppi.ppi_first_height??"",ppi.ppi_secound_height??""],
         ["MUNICÍPIOS(s)",municipalities.join(", ")||"",""]
        ].forEach(([label,col1,col2],idx)=>{
          const tr=document.createElement("tr"); tr.appendChild(createTd(label,2,1,"left","bold"));
          tr.appendChild(idx===2?createTd(col1,2,1,"center","bold"):createTd(col1,1,1,"center","bold"));
          if(idx!==2) tr.appendChild(createTd(col2,1,1,"center","bold"));
          table.appendChild(tr);
        });
      } catch(err){console.error("❌ Erro ao carregar PPI Linha Férrea:",err);showError(container,"Erro ao carregar PPI data. Veja o console.");}
      finally{loading.style.display="none";}
    }
    async function loadPPILinFerDataSpecials(gridId) {
      const container=ensureSpecialsContainer("ppilinfer-specials-container","ppilinfer-grid-container",null,true);
      if(!container) return;
      if(!container.querySelector(".ppilinfer-title")){
        const titleDiv=document.createElement("div"); titleDiv.textContent="SITUAÇÕES ESPECIAIS"; titleDiv.className="ppilinfer-title"; titleDiv.style.cssText=LINFER_SPECIAL_TITLE_STYLE; container.appendChild(titleDiv);
      }
      let dataContainer=container.querySelector(".ppilinfer-data");
      if(!dataContainer){dataContainer=document.createElement("div");dataContainer.className="ppilinfer-data";container.appendChild(dataContainer);}
      try {
        const res=await fetch(`${SUPABASE_URL}/rest/v1/ppilinfer_specials?select=*&grid_code=eq.${gridId}&order=row_order`,{headers:getSupabaseHeaders()});
        if(!res.ok) throw new Error(`Erro ao buscar ppilinfer_specials: ${res.status}`);
        const specials=await res.json();
        dataContainer.innerHTML=specials.length?specials.map(s=>{const div=document.createElement("div");div.style.cssText=LINFER_SPECIAL_ITEM_STYLE;div.innerHTML=formatSpecialsContentWithHighlights(s.content);return div.outerHTML;}).join(""):"Sem informações especiais para esta grelha.";
      } catch(err){console.error("❌ Erro ao carregar specials Linha Férrea:",err);dataContainer.innerHTML="Erro ao carregar informações especiais. Veja o console.";}
    }
    async function loadPPILinFerGridSeparated(gridId) {
      const container=document.getElementById("ppilinfer-grid-container"); if(!container) return;
      const tempContainer=document.createElement("div"); tempContainer.style.display="none";
      try {
        const corpNr=getCorpNr();
        const references=await fetchFromSupabase("ppilinfer_references",`grid_code=eq.${gridId}`);
        if(!references.length){container.innerHTML="Sem referências para esta grelha.";return;}
        const means=await fetchFromSupabase("ppilinfer_means",`reference_id=in.(${references.map(r=>r.id).join(",")})`);
        const occurrenceTypes={"Acidente - Abalroamento, Choque e Descarrilamento":"#a5d6a7","Substâncias Perigosas - Produtos Químicos/Produtos Biológicos":"#ffcc80","Incêndio em Transportes":"#90caf9"};
        tempContainer.appendChild(buildOccurrenceTable(occurrenceTypes,references,means,'LinhaFerrea',gridId,["80px","calc(33% - 40px)","80px","calc(33% - 40px)","33%"]));
        container.innerHTML=""; container.appendChild(tempContainer); tempContainer.style.display="block";
        createOrUpdateCumulativeAlert(tempContainer);
      } catch(err){
        console.error("❌ Erro ao carregar grelha Linha Férrea:",err);container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    function ppiLinFerABSNoteTable(container, buttonId) {
      if(!container||!buttonId) return;
      const letter=buttonId.toUpperCase();
      if(!"ABCDEFGHIJKLMNOP".includes(letter)) return;
      container.innerHTML="";
      const table=Object.assign(document.createElement("table"),{className:"table-elements"});
      table.style.cssText=LINFER_ABS_TABLE_STYLE;
      const td=Object.assign(document.createElement("td"),{innerHTML:`<b>* As ABSC</b> a despacho para o PPI da Linha Férrea do Algarve, não devem ser as afetas ao PEM do INEM, 
                                                                      sendo complementares às mobilizadas pelo CODU do INEM (GRELHA ${letter} - INEM)`});
      td.style.cssText=LINFER_ABS_CELL_STYLE;
      const tr=document.createElement("tr"); tr.appendChild(td); table.appendChild(tr); container.appendChild(table);
    }
