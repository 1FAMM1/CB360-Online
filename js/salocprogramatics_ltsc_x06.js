    /* ================================
    SALOC 360
    ================================ */
    /* =======================================
    PPI MODULE
    ======================================= */
    /* ─── STYLE CONSTANTS ────────────────────────────────────── */
    const HIGHLIGHT_WORDS = [`Rede Nacional de Áreas Protegidas`,`Rede Natura 2000`,`Linha de Média Tensão`,`áreas de declives acentuados`, `Passagem Superior`,`linhas de média e alta tensão`,
                             `linhas de média tensão`,`atravessa curso de água navegável`, `atravessa curso de água e pontos de água`,`outros compromissos internacionais`,`ALARME ESPECIAL`,
                             `ALARME CONDICIONADO`, `Troço com grandes limitações no acesso a meios terrestres, deverá ser avaliada a necessidade de mobilizar meios suplementares táticos (4x4).`];
    const A22_TITLE_STYLE_UP = `font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%);  color: #1e293b; font-weight: 850; 
                                font-size: 13px; text-transform: uppercase; letter-spacing: 1px; width: 100%; max-width: 1572px; height: 26px; display: flex; justify-content: center; align-items: center; 
                                margin: 0 auto; border: 1px solid #94a3b8; border-bottom: none; border-radius: 8px 8px 0 0; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8); 
                                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), -2px 0 5px -2px rgba(0,0,0,0.1), 2px 0 5px -2px rgba(0,0,0,0.1);`;
    const A22_TITLE_STYLE_DOWN = `font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%); color: #334155; font-weight: 600; 
                                  font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; width: 100%; max-width: 1572px; height: 22px; display: flex; justify-content: center; align-items: center; 
                                  margin: 0 auto; border: 1px solid #94a3b8; border-top: none; border-radius: 0 0 8px 8px; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
                                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), -2px 0 5px -2px rgba(0,0,0,0.1), 2px 0 5px -2px rgba(0,0,0,0.1);`;
    const A22_ROW_STYLE = `display: flex; justify-content: flex-start ;margin: 0;`;
    const A22_GRID_BUTTON_STYLE = `margin: 10px 0 5px 0; width: 78px; height: 40px;`;
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
    const AERO_LABEL_STYLE = {fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: "linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%)", color: "#1e293b", fontWeight: "850",
                              fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", textShadow: "0 1px 0 rgba(255, 255, 255, 0.8)", width: "100%", maxWidth: "1065px", height: "36px", display: "flex",
                              alignItems: "center", justifyContent: "center", borderRadius: "6px", border: "1px solid #94a3b8", 
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)", margin: "3px auto 8px auto",};
    const AERO_ROW_STYLE = {display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "5px"};
    const AERO_BUTTON_STYLE = {marginTop: "5px", width: "210px", height: "35px", fontSize: "12px", fontWeight: "bold"};
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
    const LINFER_TITLE_STYLE = `font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%); color: #1e293b; font-weight: 850;
                                font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8); width: 100%; max-width: 1580px; height: 36px; display: flex;
                                align-items: center; justify-content: center; border-radius: 6px; border: 1px solid #94a3b8; 
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9); margin: 0px auto 8px auto;`;
    const LINFER_ROW_STYLE = `display: flex; justify-content: flex-start; margin: 0;`;
    const LINFER_GRID_BUTTON_STYLE = `margin: 5px 0; width: 93px; height: 40px; font-size: 12px;`;
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
    const LINFER_ABS_CELL_STYLE = `border: 1px solid #bbb; text-align: left;`;
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
      const row = document.createElement("div");
      row.className = "major-row";
      row.style.cssText = isTop ? A22_TITLE_STYLE_UP : A22_TITLE_STYLE_DOWN;
      const label = document.createElement("label");
      label.textContent = text;
      label.style.cursor = "inherit";
      row.appendChild(label);
      return row;
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
        const rowButtons = document.createElement("div"); rowButtons.className = "major-row";
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
      const table=document.createElement("table");
      table.classList.add("table-elements");
      Object.assign(table.style,{width:"100%",marginTop:"-5px",borderCollapse:"collapse",lineHeight:"15px"});
      const tr=document.createElement("tr"), td=document.createElement("td");
      td.innerHTML = `<b>* As ABSC</b> a despacho para o PPI da Via do Infante de Sagres, não devem ser as afetas ao PEM do INEM, sendo complementares às mobilizadas pelo CODU do INEM (GRELHA ${number} INEM)`;
      Object.assign(td.style,{padding:"5px",textAlign:"left",border:"1px solid #bbb"});
      tr.appendChild(td);
      table.appendChild(tr);
      container.appendChild(table);
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
      const titleRow=document.createElement("div"); titleRow.className="major-row"; titleRow.style.cssText=LINFER_TITLE_STYLE;
      const label=document.createElement("label"); label.textContent="GRELHAS DE ALARME"; titleRow.appendChild(label); container.appendChild(titleRow);
      const specialButtons=new Set(["F","G","H","I","J","K","L","M","N","O","P"]);
      const rowButtons=document.createElement("div"); rowButtons.className="major-row"; rowButtons.style.cssText=LINFER_ROW_STYLE; rowButtons.style.justifyContent="center";
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
    /* =======================================
       REFUSALS OF SERVICES AND INOPs INEM
    ======================================= */
    /* =======================================
       REFUSAL OF TRANSPORT SERVICES
    ======================================= */
    /* ========== VERIFICATION OF REFUSAL FIELDS ========== */
    function validateRequiredServiceRefusalFields() {
      const missingFields = [];
      const refusalTime = document.getElementById('service_refusal_time')?.value.trim();
      const serviceType = document.getElementById('service_refusal_type')?.value.trim();
      const refusalMotive = document.getElementById('service_refusal_motive')?.value.trim();
      const serviceOrigin = document.getElementById('service_refusal_origin')?.value.trim();
      const serviceDestination = document.getElementById('service_refusal_destination')?.value.trim();
      const optelRefusal = document.getElementById('service_refusal_optel')?.value.trim();
      const validatedRefusal = document.getElementById('service_refusal_validation')?.value.trim();
      if (!refusalTime) missingFields.push("Hora da Recusa");
      if (!serviceType) missingFields.push("Tipo de Serviço");
      if (!refusalMotive) missingFields.push("Motivo da Recusa");
      if (!serviceOrigin) missingFields.push("Origem do Serviço");
      if (!serviceDestination) missingFields.push("Destino do Serviço");
      if (!optelRefusal) missingFields.push("Optel de Serviço");
      if (!validatedRefusal) missingFields.push("Validado por");
      if (missingFields.length > 0) {
        const list = missingFields.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
        return false;
      }
      return true;
    }
    /* ============= INSERTION OF NEW REFUSAL ============= */
    async function insertServiceRefusal() { 
      if (!validateRequiredServiceRefusalFields()) return;
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const payload = {corp_oper_nr: corpOperNr, refusal_date: document.getElementById('service_refusal_date').value, refusal_time: document.getElementById('service_refusal_time').value,
                       service_type: document.getElementById('service_refusal_type').value, reason_for_refusal: document.getElementById('service_refusal_motive').value,
                       service_origin: document.getElementById('service_refusal_origin').value, service_destination: document.getElementById('service_refusal_destination').value,
                       optel_refusal: document.getElementById('service_refusal_optel').value, validated_refusal: document.getElementById('service_refusal_validation').value};
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showPopup('popup-success', "Recusa de serviço registada com sucesso!");
          loadServiceRefusals();
          document.getElementById('service_refusal_time').value = '';
          document.getElementById('service_refusal_type').value = '';
          document.getElementById('service_refusal_motive').value = '';
          document.getElementById('service_refusal_origin').value = '';
          document.getElementById('service_refusal_destination').value = '';
          document.getElementById('service_refusal_optel').value = '';
          document.getElementById('service_refusal_validation').value = '';
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao gravar recusa:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ================ REFUSAL ELIMINATION =============== */
    async function deleteServiceRefusal(id) {
      if (!confirm("Tem certeza que quer eliminar este registro?")) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?id=eq.${id}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (res.ok) {
          showPopup('popup-success', "Registro eliminado!");
          loadServiceRefusals();
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao eliminar registro:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ========== FORMATTING DATES IN THE TABLE =========== */
    function ServiceRefusalsformatDate(dateStr) {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    /* ================= LOADING REFUSALS ================= */
    async function loadServiceRefusals() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
        const url = `${SUPABASE_URL}/rest/v1/service_refusals?corp_oper_nr=eq.${corpOperNr}&order=refusal_date.desc`;
        const res = await fetch(url, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const tbody = document.querySelector("#service-refusals-table tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        if (data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">Não foram encontradas recusas para a corporação ${corpOperNr}.</td></tr>`;
          return;
        }
        data.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${ServiceRefusalsformatDate(item.refusal_date)}</td>
            <td>${item.refusal_time}</td>
            <td>${item.service_type}</td>
            <td>${item.service_origin}</td>
            <td>${item.service_destination}</td>
            <td>${item.reason_for_refusal}</td>
            <td>${item.optel_refusal}</td>
            <td>${item.validated_refusal}</td>
            <td style="width: 10px;"><button class="btn-delete" onclick="deleteServiceRefusal('${item.id}')">🗑️</button></td>
          `;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Erro ao carregar recusas:", error);
      }
    }
    /* ============= FILTER REFUSALS BY YEAR ============== */
    function filterServiceRefusalsByYear(year) {
      const rows = document.querySelectorAll('#service-refusals-table tbody tr');
      rows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) {
          const [day, month, yearStr] = dateCell.textContent.split('-');
          row.style.display = yearStr == year ? '' : 'none';
        }
      });
    }
    function populateRefusalsYearFilter() {
      const select = document.getElementById('refusals_year_filter');
      if (!select) return;
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }
    }
    const yearSelect = document.getElementById('refusals_year_filter');
    if (yearSelect) {
      yearSelect.addEventListener('change', function() {
        filterServiceRefusalsByYear(this.value);
      });
    }
    populateRefusalsYearFilter();
    /* ============== LOAD REFUSALS ON OPEN =============== */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId === 'page-recserv') {
          loadServiceRefusals();
        }
      });
    });
    /* =======================================
    INEM NON-OPERATIONALITY
    ======================================= */
    /* ==== VERIFICATION OF NON-OPERATIONALITY FIELDS ===== */
    function validateRequiredIneInopFields() {
      const missingFields = [];
      const ineinopDate = document.getElementById('ineinop_date')?.value.trim();
      const ineinopShift = document.getElementById('ineinop_shift')?.value.trim();
      const ineinopHourQtd = document.getElementById('ineinop_hour_qtd')?.value.trim();
      const reasonForIneInop = document.getElementById('reason_for_ineinop')?.value.trim();
      const ineinopCrew = document.getElementById('ineinop_crew')?.value.trim();
      const optelRefusal = document.getElementById('ineinop_optel')?.value.trim();
      const validatedRefusal = document.getElementById('ineinop_validation')?.value.trim();
      if (!ineinopShift) missingFields.push("Turno");
      if (!ineinopHourQtd) missingFields.push("Horas/Qtde");
      if (!reasonForIneInop) missingFields.push("Motivo");
      if (!ineinopCrew) missingFields.push("Tripulação");
      if (!optelRefusal) missingFields.push("Optel de Serviço");
      if (!validatedRefusal) missingFields.push("Validado por");
      if (missingFields.length > 0) {
        const list = missingFields.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
        return false;
      }
      return true;
    }
    /* ======= INSERTION OF NEW NON-OPERATIONALITY ======== */
    async function insertIneInop() {
      if (!validateRequiredIneInopFields()) return;
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";    
      const payload = {corp_oper_nr: corpOperNr, ineinop_date: document.getElementById('ineinop_date').value, ineinop_shift: document.getElementById('ineinop_shift').value,
                       ineinop_hour_qtd: document.getElementById('ineinop_hour_qtd').value, reason_for_ineinop: document.getElementById('reason_for_ineinop').value,
                       ineinop_crew: document.getElementById('ineinop_crew').value, optel_refusal: document.getElementById('ineinop_optel').value,
                       validated_refusal: document.getElementById('ineinop_validation').value};    
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        });    
        if (res.ok) {
          showPopup('popup-success', "Inoperacionalidade registada com sucesso!");
          loadIneInops();
          document.getElementById('ineinop_shift').value = '';
          document.getElementById('ineinop_hour_qtd').value = '';
          document.getElementById('reason_for_ineinop').value = '';
          document.getElementById('ineinop_crew').value = '';
          document.getElementById('ineinop_optel').value = '';
          document.getElementById('ineinop_validation').value = '';
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao gravar inoperacionalidade:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ============= REMOVAL OF INOPERABILITY ============= */
    async function deleteIneInop(id) {
      if (!confirm("Tem certeza que quer eliminar este registro?")) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?id=eq.${id}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (res.ok) {
          showPopup('popup-success', "Registro eliminado!");
          loadIneInops();
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao eliminar registro:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ========== FORMATTING DATES IN THE TABLE =========== */
    function IneInopFormatDate(dateStr) {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    /* =========== LOADING NON-OPERATIONALITIES =========== */
    async function loadIneInops(yearFilter = null) {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
        let url = `${SUPABASE_URL}/rest/v1/inem_inop?corp_oper_nr=eq.${corpOperNr}&order=ineinop_date.desc`;
        if (yearFilter) url += `&ineinop_date=ilike.${yearFilter}%`;    
        const res = await fetch(url, {
          headers: getSupabaseHeaders()
        });    
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const tbody = document.querySelector("#ineinop-table tbody");
        if (!tbody) return;    
        tbody.innerHTML = "";        
        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                Não foram encontradas inoperacionalidades INEM para a corporação ${corpOperNr}.
              </td>
            </tr>`;
          return;
        }    
        data.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${IneInopFormatDate(item.ineinop_date)}</td>
            <td>${item.ineinop_shift}</td>
            <td>${item.ineinop_hour_qtd}</td>
            <td>${item.reason_for_ineinop}</td>
            <td>${item.ineinop_crew}</td>
            <td>${item.optel_refusal}</td>
            <td>${item.validated_refusal}</td>
            <td style="width: 10px;"><button class="btn-delete" onclick="deleteIneInop('${item.id}')">🗑️</button></td>
          `;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Erro ao carregar inoperacionalidades:", error);
      }
    }
    /* ======= FILTER NON-OPERATIONALITIES BY YEAR ======== */
    function filterIneInopByYear(year) {
      const rows = document.querySelectorAll('#ineinop-table tbody tr');
      rows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) {
          const [day, month, yearStr] = dateCell.textContent.split('-');
          row.style.display = yearStr == year ? '' : 'none';
        }
      });
    }
    function populateIneInopYearFilter() {
      const select = document.getElementById('ineinop_year_filter');
      if (!select) return;
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }
    }
    const ineYearSelect = document.getElementById('ineinop_year_filter');
    if (ineYearSelect) {
      ineYearSelect.addEventListener('change', function() {
        filterIneInopByYear(this.value);
      });
    }
    populateIneInopYearFilter();
    /* ======== LOAD NON-OPERATIONALITIES ON OPEN ========= */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId === 'page-ineminop') {
          loadIneInops();
        }
      });
    });
    /* =======================================
    DASHBOARD: NON-OPERATIONALITIES
    DASHBOARD: REFUSALS
    ======================================= */
    const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const charts = {};
    function groupByMonth(records, dateField) {
      const monthCounts = {};
      records.forEach(item => {
        if (!item[dateField]) return;
        const date = new Date(item[dateField]);
        if (isNaN(date)) return;
        const month = date.getMonth();
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });
      return monthCounts;
    }
    function createOrUpdateChart(canvasId, labels, data, label, color) {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      if (charts[canvasId]) {
        charts[canvasId].data.labels = labels;
        charts[canvasId].data.datasets[0].data = data;
        charts[canvasId].update();
      } else {
        charts[canvasId] = new Chart(ctx, {
          type: 'line',
          data: {labels, datasets: [{label, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, pointRadius: 5}]},
          options: {responsive: true,
            plugins: {legend: { display: true},
            tooltip: {mode: 'index', intersect: false}},
            scales: {y: {beginAtZero: true, ticks: {stepSize: 1}}}}});}}
    function createOrUpdateMultiDatasetChart(canvasId, labels, datasets) {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      if (charts[canvasId]) {
        charts[canvasId].data.labels = labels;
        charts[canvasId].data.datasets = datasets;
        charts[canvasId].update();
      } else {
        charts[canvasId] = new Chart(ctx, {
          type: 'line',
          data: {labels, datasets},
          options: {responsive: true,
            plugins: {legend: {display: true},
            tooltip: {mode: 'index', intersect: false}},
            scales: {y: {beginAtZero: true, ticks: {stepSize: 1}}}}});}}
    /* ================== SUMARY DATA ===================== */
    async function loadSummaryData() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
        const inemRes = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?select=ineinop_shift,ineinop_hour_qtd&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!inemRes.ok) throw new Error("Falha ao carregar inem_inop");
        const inemData = await inemRes.json();    
        const parseHourQuantity = (str) => {
          if (!str) return {h: 0, m: 0};
          const [h, m] = str.split(':').map(Number);
          return {h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m};
        };    
        const sumTimes = (records) => {
          let totalH = 0, totalM = 0;
          records.forEach(r => {
            const {h, m} = parseHourQuantity(r.ineinop_hour_qtd);
            totalH += h;
            totalM += m;
          });
          totalH += Math.floor(totalM / 60);
          totalM = totalM % 60;
          return `🕒 ${totalH} Hrs. ${totalM} Mts.`;
        };    
        const dRecords = inemData.filter(r => (r.ineinop_shift || "").toUpperCase() === "D");
        const nRecords = inemData.filter(r => (r.ineinop_shift || "").toUpperCase() === "N");    
        document.getElementById("sum-inop-d").textContent = sumTimes(dRecords);
        document.getElementById("sum-inop-n").textContent = sumTimes(nRecords);
        document.getElementById("sum-inop-total").textContent = sumTimes(inemData);
        const refusalsRes = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?select=id&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });
        const refusalsData = await refusalsRes.json();
        document.getElementById("sum-refusals-total").textContent = `🤒 ${refusalsData.length}`;    
      } catch (e) {
        console.error("❌ Erro ao atualizar cards resumo:", e);
      }
    }
    /* ================== REFUSALS CHARTS ================= */
    const refusalColors = ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
                           'rgba(199, 199, 199, 0.7)', 'rgba(255, 99, 71, 0.7)', 'rgba(60, 179, 113, 0.7)', 'rgba(100, 149, 237, 0.7)', 'rgba(255, 140, 0, 0.7)', 'rgba(220, 20, 60, 0.7)',
                           'rgba(186, 85, 211, 0.7)', 'rgba(46, 139, 87, 0.7)', 'rgba(70, 130, 180, 0.7)'];
    async function loadServiceRefusalsCharts() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr') || "0805";
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?select=refusal_date,service_type&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!res.ok) throw new Error(await res.text());
        const registros = await res.json();
        if (!registros?.length) return;    
        const serviceTypes = [...new Set(registros.map(r => r.service_type).filter(Boolean))];
        const datasets = serviceTypes.map((type, index) => {
          const typeRecords = registros.filter(r => r.service_type === type);
          const countsByMonth = groupByMonth(typeRecords, 'refusal_date');
          const data = monthLabels.map((_, i) => countsByMonth[i] || 0);
          const color = refusalColors[index % refusalColors.length];
          return {label: type, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, pointRadius: 5};
        });    
        createOrUpdateMultiDatasetChart('chart-refusals-type', monthLabels, datasets);    
        const totalCounts = {};
        registros.forEach(r => {
          if (!r.refusal_date) return;
          const m = new Date(r.refusal_date).getMonth();
          if (!isNaN(m)) totalCounts[m] = (totalCounts[m] || 0) + 1;
        });
        const totalData = monthLabels.map((_, i) => totalCounts[i] || 0);
        createOrUpdateChart('chart-refusals-total', monthLabels, totalData, 'Total de Recusas', 'rgba(255, 159, 64, 0.7)');    
      } catch (e) {
        console.error("Erro Recusas:", e);
      }
    }
    /* ========= INEM NON-OPERATIONALITIES CHARTS ========= */
    async function loadIneInopsCharts() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?select=ineinop_date,ineinop_shift&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!res.ok) throw new Error(await res.text());
        const registros = await res.json();
        if (!registros?.length) return;    
        const dShifts = registros.filter(r => r.ineinop_shift === 'D');
        const nShifts = registros.filter(r => r.ineinop_shift === 'N');
        const dCounts = groupByMonth(dShifts, 'ineinop_date');
        const nCounts = groupByMonth(nShifts, 'ineinop_date');    
        createOrUpdateChart('chart-ine-d', monthLabels, monthLabels.map((_, i) => dCounts[i] || 0), 'Inoperacionalidades D', 'rgba(75,192,192,0.6)');
        createOrUpdateChart('chart-ine-n', monthLabels, monthLabels.map((_, i) => nCounts[i] || 0), 'Inoperacionalidades N', 'rgba(255,99,132,0.6)');        
        const totalData = monthLabels.map((_, i) => (dCounts[i] || 0) + (nCounts[i] || 0));
        createOrUpdateChart('chart-ine-total', monthLabels, totalData, 'Inoperacionalidades Total', 'rgba(54,162,235,0.6)');    
      } catch (e) {
        console.error("Erro INEM Charts:", e);
      }
    }
    /* ================ LOAD DASHBORAD ==================== */
    function loadDashboardCharts() {
      loadIneInopsCharts();
      loadServiceRefusalsCharts();
      loadSummaryData()
    }
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('data-page') === 'page-dashboard') {
          loadDashboardCharts();
        }
      });
    });
    /* =======================================
    OPERATIONAL ANTICIPATION MEASURES
    ======================================= */
    /* ================ SELECT UTILITIES =============== */
    function styleGrayIfSecond(select) {
      const updateColor = () => {
        select.style.color = select.selectedIndex === 1 ? "gray" : "black";
      };
      select.addEventListener("change", updateColor);
      updateColor();
    }
    
    function setupMOASelects(page) {
      page.querySelectorAll('select[id$="_sit"]').forEach(select => {
        if (select.options.length > 1) {
          select.selectedIndex = 1;
          styleGrayIfSecond(select);
        }
      });
      page.querySelectorAll('select[id$="_pront"]').forEach(select => {
        if (select.id !== "moa_ned_pront") {
          if (select.options.length > 1) {
            select.selectedIndex = 1;
            styleGrayIfSecond(select);
          }
        }
      });
      const nedPront = document.getElementById("moa_ned_pront");
      if (nedPront) {
        nedPront.innerHTML = "";
        const options = ["", "Indique a forma de notificação", "Via SMS", "Via e-mail", "Via Telefone", "Via SMS e WhatsApp"];
        options.forEach(opt => {
          const el = document.createElement("option");
          el.value = opt;
          el.textContent = opt;
          nedPront.appendChild(el);
        });
        nedPront.selectedIndex = 1;
        styleGrayIfSecond(nedPront);
      }
    }
    /* ====================== GDH ====================== */
    function updateMOAGDH() {
      const dateInit = document.getElementById("moa_date_init")?.value;
      const timeInit = document.getElementById("moa_time_init")?.value;
      const dateEnd = document.getElementById("moa_date_end")?.value;
      const timeEnd = document.getElementById("moa_time_end")?.value;
      const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
      
      function formatGDH(dateStr, timeStr) {
        if (!dateStr || !timeStr) return "";
        const d = new Date(dateStr + "T" + timeStr);
        const day = String(d.getDate()).padStart(2,"0");
        const hour = String(d.getHours()).padStart(2,"0");
        const min = String(d.getMinutes()).padStart(2,"0");
        const month = monthNames[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        return `${day}${hour}${min}${month}${year}`;
      }
      const gdhInitEl = document.getElementById("moa_gdh_init");
      const gdhEndEl = document.getElementById("moa_gdh_end");
      if (gdhInitEl) gdhInitEl.value = formatGDH(dateInit, timeInit);
      if (gdhEndEl) gdhEndEl.value = formatGDH(dateEnd, timeEnd);
    }
    ["moa_date_init","moa_time_init","moa_date_end","moa_time_end"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", updateMOAGDH);
    });
    /* ================ EMAIL RECIPIENTS =============== */
    async function fetchMOARecipients(corpOperNr) {
      const categories = ["crepcmoa_mail_to", "crepcmoa_mail_cc", "crepcmoa_mail_bcc"];
      const url = `${SUPABASE_URL}/rest/v1/mails_config?category=in.(${categories.join(",")})&corp_oper_nr=eq.${corpOperNr}&select=category,value`;
      try {
        const resp = await fetch(url, { headers: getSupabaseHeaders() });
        if (!resp.ok) throw new Error("Falha ao buscar e-mails da MOA.");
        const data = await resp.json();
        const recipients = { to: [], cc: [], bcc: [] };
        data.forEach(row => {
          const emails = row.value?.split(",").map(e => e.trim()).filter(e => e) || [];
          if (row.category.endsWith("_to")) recipients.to = emails;
          if (row.category.endsWith("_cc")) recipients.cc = emails;
          if (row.category.endsWith("_bcc")) recipients.bcc = emails;
        });
        if (!recipients.to.length) recipients.to = [""];
        return recipients;
      } catch (err) {
        console.error("Erro emails MOA:", err);
        return { to: ["cb360.online.support@gmail.com"], cc: [], bcc: [] };
      }
    }
    /* ================ BUILD EMAIL HTML =============== */
    async function buildMOAEmailHTML(data, corpOperNr) {
      const signature = getEmailSignature();
      const greeting = getGreeting();
      const commanderName = await getCommanderName(corpOperNr);
      return `${greeting}<br><br>
      Encarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s o Formulário das <strong>MEDIDAS OPERACIONAIS DE ANTECIPAÇÃO</strong> 
      para o <strong>${data.moa_device_type}</strong> de <strong>${data.moa_gdh_init}</strong> a <strong>${data.moa_gdh_end}</strong> 
      do Corpo de Bombeiros <strong>${data.moa_cb}</strong>.<br><br>
      Com os melhores cumprimentos,<br><br>
      OPTEL<br>${data.moa_optel}<br><br>
      <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
      Este email foi processado automaticamente por: CB360 Online<br><br></span>
      ${signature}`;
    }
    /* =================== SEND EMAIL ================== */
    async function sendMOAEmail(data, recipients, corpOperNr) {
      const emailBodyHTML = await buildMOAEmailHTML(data, corpOperNr);
      const result = await fetch("https://cb360-online.vercel.app/api/crepc_convert_and_send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({mode: "moa", data, recipients: recipients.to, ccRecipients: recipients.cc, bccRecipients: recipients.bcc,
                              emailSubject: `MOA para o ${data.moa_device_type} de ${data.moa_gdh_init} a ${data.moa_gdh_end}_${corpOperNr}`,
                              emailBody: emailBodyHTML})
      });
      return result.json();
    }    
    /* ================= MAIN FUNCTION ================= */
    async function emitMOAGlobal() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!corpOperNr) {showPopup('popup-danger', "Erro: O número da corporação não foi encontrado."); return;}
      const moa_device_type = document.getElementById("moa_device_type")?.value.trim();
      const moa_cb = document.getElementById("moa_cb")?.value.trim();
      if (!moa_device_type || !moa_cb) {showPopup('popup-danger', "Preencha: Tipo de Dispositivo e CB."); return;}
      if (typeof showPopup === "function")
        showPopup('popup-success', `MOA do dispositivo ${moa_device_type} criada. Aguarde o envio.`);
      const btn = document.getElementById("saveMOABtn");
      if (btn) btn.disabled = true;
      const data = {};
      const baseFields = ["device_type","cb","epe_type","date_init","time_init","date_end","time_end", "gdh_init","gdh_end","eco","ned","oco","era","eob","rsc","mef"];
      baseFields.forEach(f => {
        const el = document.getElementById(`moa_${f}`);
        if (!el) return;
        data[`moa_${f}`] = el.type === "checkbox" ? el.checked : el.value || "";
      });
      const extraFields = ["eco_sit","eco_pront","eco_observ","ned_sit","ned_pront","ned_observ","oco_sit","oco_pront","oco_observ","era_sit","era_pront","era_observ",
                           "eob_sit","eob_pront","eob_observ","rsc_sit","rsc_pront","rsc_observ","mef_sit","mef_pront","mef_observ","reie_type_01","reie_time_01","reie_nop_01",
                           "reie_obs_01","reie_type_02","reie_time_02","reie_nop_02","reie_obs_02","reie_type_03","reie_time_03","reie_nop_03","reie_obs_03","otr_type_01",
                           "otr_time_01","otr_obs_01","otr_type_02","otr_time_02","otr_obs_02","otr_type_03","otr_time_03","otr_obs_03","optel"];
      extraFields.forEach(f => {
        const el = document.getElementById(`moa_${f}`);
        data[`moa_${f}`] = el ? (el.value || "").trim() : "";
      });
      data.corp_oper_nr = corpOperNr;
      try {
        const recipients = await fetchMOARecipients(corpOperNr);
        await sendMOAEmail(data, recipients, corpOperNr);
        if (typeof showPopup === "function")
          showPopup('popup-success', `A MOA do dispositivo ${data.moa_device_type} foi enviada!`);
        window.hideMOAContainer();
        const btnNew = document.getElementById("NewMOABtn");
        if (btnNew) btnNew.classList.remove("active");
      } catch (err) {
        showPopup('popup-danger', `Erro ao enviar MOA: ${err.message}`);
        console.error(err);
      } finally {
        if (btn) btn.disabled = false;
      }
    }
    /* ================ INITIALIZE PAGE ================ */
    document.addEventListener("DOMContentLoaded", () => {
      const saveMOABtn = document.getElementById("saveMOABtn");
      const NewMOABtn = document.getElementById("NewMOABtn");
      const moaContainer = document.getElementById("moa-container");
      const actionButtonsContainer = document.querySelector(".action-buttons");
      if (moaContainer) {
        moaContainer.style.transition = "opacity 0.25s ease";
        moaContainer.style.opacity = "0";
        moaContainer.style.setProperty("display", "none", "important");
      }
      setupMOASelects(document);
      updateMOAGDH();
      window.hideMOAContainer = function () {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          setTimeout(() => {
            moaContainer.style.setProperty("display", "none", "important");
            if (actionButtonsContainer) actionButtonsContainer.style.display = "flex";
          }, 250);
        }
        if (NewMOABtn) NewMOABtn.classList.remove("active");
      };
      window.showMOAContainer = function () {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          moaContainer.style.removeProperty("display");
          moaContainer.style.display = "block";
          moaContainer.style.width = "100%";
          setTimeout(() => { moaContainer.style.opacity = "1"; }, 10);
        }
      };
      if (NewMOABtn) {
        NewMOABtn.onclick = () => {
          const isActive = NewMOABtn.classList.toggle("active");
          if (isActive) {
            window.showMOAContainer();
            document.querySelectorAll("#moa-container input, #moa-container select").forEach(el => {
              if (el.tagName === "SELECT") el.selectedIndex = 0;
              else if (el.type === "checkbox") el.checked = false;
              else el.value = "";
            });
            setupMOASelects(moaContainer);
            updateMOAGDH();
          } else { window.hideMOAContainer();}
        };
      }
      if (saveMOABtn) {
        saveMOABtn.onclick = e => { e.preventDefault(); emitMOAGlobal(); return false; };
      }
      /* ================== RESET PAGE =================== */
      const crepcAlgBtn = document.querySelector('[data-page="page-crepcalg"]');
      if (crepcAlgBtn) {
        crepcAlgBtn.addEventListener('click', () => { window.hideMOAContainer(); });
      }
    });
    /* =======================================
    DAILY PLANNING
    ======================================= */
    const tableConfig = [{rows: 1, special: false, title: "OFOPE"}, {rows: 1, special: false, title: "CHEFE DE SERVIÇO"}, {rows: 1, special: false, title: "OPTEL"},
                     {rows: 5, special: true, title: "EQUIPA 01"}, {rows: 5, special: false, title: "EQUIPA 02"}, {rows: 2, special: false, title: "LOGÍSTICA"},
                     {rows: 3, special: false, title: "INEM"}, {rows: 3, special: false, title: "INEM - Reserva"}, {rows: 10, special: false, title: "SERVIÇO GERAL"}];
    function createInputCell({type = 'text', readonly = false, className = '', tabindex = 0}) {
      return `<td><input type="${type}" class="${className}" ${readonly ? 'readonly' : ''} tabindex="${tabindex}"></td>`;
    }
    function calculateWorkHours(checkIn, checkOut, shift) {
      if (!checkIn || !checkOut) return 0;
      const [checkInH, checkInM] = checkIn.split(':').map(Number);
      const [checkOutH, checkOutM] = checkOut.split(':').map(Number);
      let checkInMinutes = checkInH * 60 + checkInM;
      let checkOutMinutes = checkOutH * 60 + checkOutM;
      if (shift === 'N' && checkOutMinutes < checkInMinutes) checkOutMinutes += 1440;
      const diffMinutes = checkOutMinutes - checkInMinutes;
      return Math.round((diffMinutes / 60) * 100) / 100;
    }
    function normalizeText(text) {
      if (!text) return '';
      return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    }
    function hasOnCallStatus(obs) {
      if (!obs) return false;
      return /piq(uete|te|u)?/i.test(normalizeText(obs));
    }
    function hasAbsenceStatus(obs) {
      if (!obs) return false;
      return /falt(a|as|a\s)?/i.test(normalizeText(obs));
    }
    function hasReinforcementStatus(obs) {
      if (!obs) return false;
      return /refor(c|ç)o(s)?|ref\b/i.test(normalizeText(obs));
    }
    async function saveAttendance(tables, shift, corpOperNr, day, month, year) {
      const recordsMap = new Map();
      const now = new Date();
      const currentDay = day ?? String(now.getDate()).padStart(2, "0");
      const currentMonth = month ?? String(now.getMonth() + 1).padStart(2, "0");
      const currentYear = year ?? String(now.getFullYear());
      for (const table of tables) {
        for (const row of table.rows) {
          const nInt = row.n_int?.trim();
          const checkIn = row.entrada?.trim();
          const checkOut = row.saida?.trim();
          const rawObs = (row.obs || "").trim();
          const obs = rawObs.toLowerCase();
          if (!nInt) continue;
          let recordType = "";
          let totalHours = "0";
          const isAbsent = hasAbsenceStatus(obs);
          const isOnCall = hasOnCallStatus(obs);
          const isReinforcement = hasReinforcementStatus(obs);
          const isSickLeave = obs.includes("baixa");
          const isLicence = obs.includes("licença") || obs.includes("licenca");
          const isDispense = obs.includes("dispensa");
          if (isSickLeave) recordType = "Baixa";
          else if (isLicence) recordType = "Licença";
          else if (isDispense) recordType = "Dispensa";
          else if (isAbsent) recordType = "Falta";
          else if (isOnCall) recordType = "Piquete";
          else if (isReinforcement) recordType = "Reforço";
          else continue;
          if ((recordType === "Piquete" || recordType === "Reforço") && checkIn && checkOut) {
            totalHours = String(calculateWorkHours(checkIn, checkOut, shift));
          }
          const key = `${nInt}_${currentDay}_${currentMonth}_${currentYear}_${corpOperNr}_${shift}_${recordType}`;
          if (recordsMap.has(key)) continue;
          recordsMap.set(key, {n_int: String(nInt), day: String(currentDay), month: String(currentMonth), year: String(currentYear), shift: String(shift), shift_type: String(recordType),
                               qtd_hours: String(totalHours), observ: rawObs, corp_oper_nr: String(corpOperNr)});
        }
      }
      const attendanceRecords = Array.from(recordsMap.values());
      try {
        const delUrl = `${SUPABASE_URL}/rest/v1/reg_assid` + `?corp_oper_nr=eq.${encodeURIComponent(String(corpOperNr))}` + `&day=eq.${encodeURIComponent(String(currentDay))}` +
                       `&month=eq.${encodeURIComponent(String(currentMonth))}` + `&year=eq.${encodeURIComponent(String(currentYear))}` + `&shift=eq.${encodeURIComponent(String(shift))}`;
        const delRes = await fetch(delUrl, {method: "DELETE", headers: getSupabaseHeaders()});
        if (!delRes.ok) {
          const t = await delRes.text();
          throw new Error(`Erro a limpar reg_assid (${delRes.status}): ${t}`);
        }
        if (attendanceRecords.length === 0) return true;
        const insUrl = `${SUPABASE_URL}/rest/v1/reg_assid` + `?on_conflict=corp_oper_nr,n_int,year,month,day,shift,shift_type`;
        const insRes = await fetch(insUrl, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
          body: JSON.stringify(attendanceRecords)
        });
        if (!insRes.ok) {
          const t = await insRes.text();
          throw new Error(`Erro a gravar reg_assid (${insRes.status}): ${t}`);
        }
        return true;
      } catch (err) {
        console.error("❌ Erro em saveAttendance:", err);
        showPopup('popup-danger', "O planeamento foi enviado, mas houve um erro ao registar as faltas/piquetes no sistema central.");
        return false;
      }
    }
    async function saveEligibility(tables, day, month, year, corpOperNr) {
      const eligibilityRecords = [];
      const fDay = String(day).padStart(2, '0');
      const fMonth = String(month).padStart(2, '0');
      const fYear = String(year);
      for (const table of tables) {
        const title = table.title.trim().toUpperCase();
        const isSpecialTeam = (title === "INEM" || title === "OPTEL");
        for (const row of table.rows) {
          const obs = (row.obs || "").toString().toLowerCase().trim();
          const nInt = (row.n_int || "").toString().trim();
          const entranceHour = (row.entrada || "").toString().trim();
          const exitHour = (row.saida || "").toString().trim();
          const abvName = (row.nome || "").toString().trim();
          if (!nInt || !obs.includes("profissional")) continue;
          let shouldSave = false;
          const hourParts = entranceHour.split(':');
          if (hourParts.length >= 1) {
            const hourNum = parseInt(hourParts[0], 10);
            if (!isNaN(hourNum) && hourNum >= 0 && hourNum <= 6) shouldSave = true;
          }
          if (isSpecialTeam && entranceHour.startsWith("20:") && exitHour === "08:00") shouldSave = true;
          if (shouldSave) {
            eligibilityRecords.push({n_int: nInt, abv_name: abvName, day: fDay, month: fMonth, year: fYear, exit_hour: entranceHour, corp_oper_nr: String(corpOperNr)});
          }
        }
      }
      if (eligibilityRecords.length === 0) return true;
      try {
        const nIntList = eligibilityRecords.map(r => r.n_int).join(',');
        const delUrl = `${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}&day=eq.${fDay}&month=eq.${fMonth}&year=eq.${fYear}&n_int=in.(${nIntList})`;
        await fetch(delUrl, {method: "DELETE", headers: getSupabaseHeaders()});
        const insUrl = `${SUPABASE_URL}/rest/v1/reg_eligibility`;
        const res = await fetch(insUrl, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
          body: JSON.stringify(eligibilityRecords)
        });
        if (res.ok) console.log(`✅ Registo concluído: ${eligibilityRecords.length} operacionais elegíveis.`);
        return res.ok;
      } catch (err) {
        console.error("❌ Erro em saveEligibility:", err);
        return false;
      }
    }
    function createTable(rows, isSpecial, title) {
      const specialClass = isSpecial ? ' special' : '';
      const rowsHTML = Array(rows).fill().map(() => `
        <tr>
          ${createInputCell({ className: 'plandir-nint-input' })}
          ${createInputCell({ className: 'plandir-readonly-field', readonly: true, tabindex: -1 })}
          ${createInputCell({ className: 'plandir-readonly-field', readonly: true, tabindex: -1 })}
          ${createInputCell({ className: 'plandir-entrance-input' })}
          ${createInputCell({ className: 'plandir-exit-input' })}
          <td class="mp-cell" tabindex="-1"></td>
          <td class="tas-cell" tabindex="-1"></td>
          ${createInputCell({ className: 'plandir-obs-input' })}
        </tr>
      `).join('');
      return `
      <div id="plandir-card-container" style="display: flex; justify-content: center;">
        <div class="plandir-main-card" style="margin: 10px 0 0 0; max-width: 1200px; transform:none !important; transition:none !important;">
          <div class="plandir-card-title"><span class="plandir-status-dot"></span>${title}</div>
          <table class="plandir-table">
            <colgroup>
              <col style="width: 75px;">
              <col style="width: 200px;">
              <col style="width: 250px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 400px;">
            </colgroup>
            <thead>
              <tr${specialClass}>
                <th rowspan="2">N. Int.</th>
                <th rowspan="2">Patente</th>
                <th rowspan="2">Nome</th>
                <th colspan="2">Horário</th>
                <th rowspan="2">MP</th>
                <th rowspan="2">TAS</th>
                <th rowspan="2">Observações</th>
              </tr>
              <tr>
                <th>Entrada</th>
                <th>Saída</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
      </div>
      `;
    }
    function updateStatusDots() {
      const thresholds = {"EQUIPA 01": {yellow: 4, green: 5}, "EQUIPA 02": {yellow: 4, green: 5}, "LOGÍSTICA": {yellow: 1, green: 2},
                          "INEM": {yellow: 1, green: 2}, "INEM - Reserva": {yellow: 1, green: 2}};
      document.querySelectorAll('.plandir-main-card').forEach(card => {
        const dot = card.querySelector('.plandir-status-dot');
        if (!dot) return;
        const titleEl = card.querySelector('.plandir-card-title');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const filledCount = [...card.querySelectorAll('.plandir-nint-input')].filter(input => input.value.trim() !== '').length;
        const config = thresholds[title];
        if (config) {
          dot.classList.remove('filled', 'dot-yellow', 'dot-red');
          if (filledCount >= config.green) dot.classList.add('filled');
          else if (filledCount >= config.yellow) dot.classList.add('dot-yellow');
          else dot.classList.add('dot-red');
        } else {
          dot.classList.remove('dot-yellow', 'dot-red');
          dot.classList.toggle('filled', filledCount > 0);
        }
      });
      const sideTbody = document.getElementById('plandir-side-tbody');
      if (!sideTbody) return;
      const currentInputs = Array.from(document.querySelectorAll('.plandir-nint-input'))
        .map(i => i.value.trim().padStart(3, '0'))
        .filter(val => val !== '' && val !== '000');
      sideTbody.querySelectorAll('tr[data-side-nint]').forEach(tr => {
        const nint = tr.getAttribute('data-side-nint');
        const isFilled = currentInputs.includes(nint);
        tr.classList.toggle('row-highlight-green', isFilled);
        tr.classList.toggle('row-pending-red', !isFilled);
      });
    }
    function updateRowFields(row, data, shift) {
      const entrance = row.querySelector('.plandir-entrance-input');
      const exit = row.querySelector('.plandir-exit-input');
      const patent = row.querySelectorAll('td input')[1];
      const name = row.querySelectorAll('td input')[2];
      const mpCell = row.querySelectorAll('td')[5];
      const tasCell = row.querySelectorAll('td')[6];
      const obsInput = row.querySelectorAll('td input')[5];
      if (shift === 'D') {
        if (entrance) entrance.value = "08:00";
        if (exit) exit.value = "20:00";
      } else if (shift === 'N') {
        if (entrance) entrance.value = "20:00";
        if (exit) exit.value = "08:00";
      }
      if (data) {
        if (patent) patent.value = data.patent || "";
        if (name) name.value = data.abv_name || "";
        if (mpCell) { mpCell.textContent = data.MP ? "X" : ""; mpCell.classList.toggle('plandir-mp-active', !!data.MP); }
        if (tasCell) { tasCell.textContent = data.TAS ? "X" : ""; tasCell.classList.toggle('plandir-tas-active', !!data.TAS); }
      } else {
        if (entrance) entrance.value = "";
        if (exit) exit.value = "";
        if (patent) patent.value = "";
        if (name) name.value = "";
        if (mpCell) { mpCell.textContent = ""; mpCell.classList.remove('plandir-mp-active'); }
        if (tasCell) { tasCell.textContent = ""; tasCell.classList.remove('plandir-tas-active'); }
        if (obsInput) obsInput.value = "";
      }
    }
    function activateShiftButton(shift) {
      document.querySelectorAll('.options-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shift === shift);
      });
    }
    function createPlanDirHeader(shift, customTitle = null) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      let titleText, dateText;
      if (customTitle) {
        titleText = "Planeamento Diário";
        dateText = customTitle;
      } else if (shift === 'LAST') {
        titleText = "Último Planeamento";
        dateText = "Carregando dados salvos...";
      } else {
        const shiftHours = (shift === 'D') ? '08:00-20:00' : '20:00-08:00';
        titleText = "Planeamento Diário";
        dateText = `Dia: ${day} ${month} ${year} | Turno ${shift} | ${shiftHours}`;
      }
      const headerDiv = document.createElement('div');
      headerDiv.className = 'plandir-shift-header';
      headerDiv.innerHTML = `
        <div class="plandir-header-title">${titleText}</div>
        <div class="plandir-header-date">${dateText}</div>
      `;
      return headerDiv;
    }
    function collectTableData() {
      const tables = [...document.querySelectorAll('.plandir-main-card')].map(card => {
        const titleEl = card.querySelector('.plandir-card-title');
        const title = titleEl ? titleEl.textContent.trim() : "Sem título";
        const rows = [...card.querySelectorAll('tbody tr')].map(tr => {
          const inputs = tr.querySelectorAll('input');
          const mpCell = tr.querySelector('.mp-cell');
          const tasCell = tr.querySelector('.tas-cell');
          return {n_int: inputs[0]?.value?.trim() || "", patente: inputs[1]?.value?.trim() || "", nome: inputs[2]?.value?.trim() || "", entrada: inputs[3]?.value?.trim() || "",
                  saida: inputs[4]?.value?.trim() || "", MP: mpCell?.textContent === "X", TAS: tasCell?.textContent === "X", obs: inputs[5]?.value?.trim() || ""};
        });
        return {title, rows};
      });
      return tables;
    }
    function createEmitButton(container) {
      if (document.getElementById('emit-pp')) return;
      const btnWrapper = document.createElement('div');
      btnWrapper.style.display = 'flex';
      btnWrapper.style.justifyContent = 'center';
      btnWrapper.style.marginTop = '10px';
      const emitBtn = document.createElement('button');
      emitBtn.id = 'emit-pp';
      emitBtn.className = 'btn btn-success';
      emitBtn.textContent = 'EMITIR PLANEAMENTO';
      emitBtn.addEventListener('click', async () => {
        if (emitBtn.disabled) return;
        emitBtn.disabled = true;
        emitBtn.textContent = 'A EMITIR...';
        emitBtn.style.opacity = '0.6';
        emitBtn.style.cursor = 'not-allowed';
        try {
          let shift = document.querySelector('.options-btn.active').dataset.shift;
          const date = new Date().toISOString().slice(0, 10);
          if (shift === "LAST") {
            let storedShift = sessionStorage.getItem("originalShift") || localStorage.getItem("originalShift");
            if (storedShift) {
              shift = storedShift;
            } else {
              showPopup('popup-danger', "Não foi possível determinar o turno original.");
              return;
            }
          }
          await emitPlanning(shift, date);
        } finally {
          emitBtn.disabled = false;
          emitBtn.textContent = 'EMITIR PLANEAMENTO';
          emitBtn.style.opacity = '1';
          emitBtn.style.cursor = 'pointer';
        }
      });
      btnWrapper.appendChild(emitBtn);
      container.appendChild(btnWrapper);
    }
    async function fetchRecipientsFromSupabase() {
      const categories = ['plandir_mail_to', 'plandir_mail_cc', 'plandir_mail_bcc'];
      const filterQuery = `category=in.(${categories.join(',')})&select=category,value`;
      const url = `${SUPABASE_URL}/rest/v1/static_options?${filterQuery}`;
      try {
        const response = await fetch(url, {method: 'GET', headers: getSupabaseHeaders()});
        if (!response.ok) throw new Error('Falha ao conectar ou autenticar com o Supabase.');
        const data = await response.json();
        let recipients = {to: [], cc: [], bcc: []};
        for (const row of data) {
          const emails = row.value ? String(row.value).split(',').map(e => e.trim()).filter(e => e) : [];
          if (row.category === 'plandir_mail_to') recipients.to = emails;
          else if (row.category === 'plandir_mail_cc') recipients.cc = emails;
          else if (row.category === 'plandir_mail_bcc') recipients.bcc = emails;
        }
        if (recipients.to.length === 0) recipients.to = ["fmartins.ahbfaro@gmail.com"];
        return recipients;
      } catch (err) {
        console.error('Erro de rede ou Supabase desconhecido:', err);
        return {to: ["fmartins.ahbfaro@gmail.com"], cc: [], bcc: []};
      }
    }
    function getOptelName() {
      const tables = collectTableData();
      const optelTable = tables.find(t => t.title === "OPTEL");
      if (!optelTable || optelTable.rows.length === 0) return "";
      return optelTable.rows[0].nome || "";
    }
    async function emitPlanning(shift, date, baixar = false) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!corpOperNr) {
        showPopup('popup-danger', "Erro: Sessão expirada. Por favor, faça login novamente.");
        return;
      }
      const tables = collectTableData();
      const optelName = getOptelName();
      const [year, month, day] = date.split('-');
      const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const monthName = monthNames[parseInt(month, 10) - 1] || month;
      const formattedDate = `${year}${month}${day}`;
      const shiftHours = (shift === 'D') ? '08:00-20:00' : '20:00-08:00';
      const { to, cc, bcc } = await fetchRecipientsFromSupabase();
      const RECIPIENTS = to;
      const CC_RECIPIENTS = cc;
      const BCC_RECIPIENTS = bcc;
      if (RECIPIENTS.length === 0) {
        showPopup('popup-danger', "Erro: Defina pelo menos um destinatário.");
        return;
      }
      const teamNameMap = {"OFOPE": "ofope", "CHEFE DE SERVIÇO": "chefe_servico", "OPTEL": "optel", "EQUIPA 01": "equipa_01", "EQUIPA 02": "equipa_02", "LOGÍSTICA": "logistica",
                           "INEM": "inem", "INEM - Reserva": "inem_reserva", "SERVIÇO GERAL": "servico_geral"};
      showPopup('popup-success', `Planeamento gerado com sucesso. O mesmo está a ser enviado para as entidades.`);
      try {
        for (let table of tables) {
          const team_name = teamNameMap[table.title];
          if (!team_name) continue;
          const nonEmptyRows = table.rows.filter(r => r.n_int || r.patente || r.nome || r.entrada || r.saida || r.MP || r.TAS || r.obs);
          await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams?team_name=eq.${encodeURIComponent(team_name)}&corp_oper_nr=eq.${corpOperNr}`, {method: "DELETE", headers: getSupabaseHeaders()});
          if (nonEmptyRows.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams`, {
              method: "POST",
              headers: getSupabaseHeaders(),
              body: JSON.stringify(nonEmptyRows.map(r => ({team_name, n_int: r.n_int || '', patente: r.patente || '', nome: r.nome || '', h_entrance: r.entrada || '', h_exit: r.saida || '',
                                                           MP: !!r.MP, TAS: !!r.TAS, observ: r.obs || '', corp_oper_nr: corpOperNr})))
            });
          }
        }
        await fetch(`${SUPABASE_URL}/rest/v1/fomio_date?corp_oper_nr=eq.${corpOperNr}`, {method: "DELETE", headers: getSupabaseHeaders()});
        await fetch(`${SUPABASE_URL}/rest/v1/fomio_date`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify([{header_text: `Dia: ${day} ${monthName} ${year} | Turno ${shift} | ${shiftHours}`, corp_oper_nr: corpOperNr}])
        });
        const attendanceSaved = await saveAttendance(tables, shift, corpOperNr, day, month, year);
        if (!attendanceSaved) console.warn('⚠️ Aviso: Falha ao gravar dados de assiduidade na tabela reg_assid.');
        const eligibilitySaved = await saveEligibility(tables, day, month, year, corpOperNr);
        if (!eligibilitySaved) console.warn('⚠️ Aviso: Falha ao gravar dados na tabela reg_eligibility.');
        const fileDisplayName = `Planeamento Diário ${formattedDate} Turno ${shift}`;
        const greeting = getGreeting();
        const signature = getEmailSignature();
        const emailBodyHTML = `
          ${greeting}<br><br>
          Remeto em anexo a Vossas Exª.s o ${fileDisplayName}<br><br>
          Com os melhores cumprimentos,<br><br>
          OPTEL<br>${optelName}<br><br>
          ${signature}
        `;        
        const response = await fetch("https://cb360-online.vercel.app/api/plandir_convert_and_send", {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({shift, date, tables, recipients: RECIPIENTS, ccRecipients: CC_RECIPIENTS, bccRecipients: BCC_RECIPIENTS, emailBody: emailBodyHTML})
        });
        const result = await response.json();
        if (!response.ok) {
          showPopup('popup-danger', `ERRO! O planeamento não foi enviado. Detalhes: ${result.details || 'Verificar consola.'}`);
          return;
        }
        showPopup('popup-success', `Planeamento do dia ${day}/${month}/${year} (Turno ${shift}) emitido e enviado com sucesso!`);
      } catch (err) {
        console.error('Erro no processo de emissão:', err);
        showPopup('popup-danger', 'Erro ao processar o planeamento. Por favor, tente novamente.');
      }
    }
    async function loadSideTable(shift) {
      const tbody = document.getElementById('plandir-side-tbody');
      const rightCol = document.getElementById('plandir-right-col');
      if (!tbody || !rightCol) return;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!corpOperNr) return;
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#aaa; padding:12px;">A carregar...</td></tr>`;
      rightCol.style.display = 'block';
      try {
        let dataNormal = [], dataEcin = [], dataOfope = [], dataPiquete = [];
        const urlNormal = `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&shift=eq.${shift}&select=n_int,abv_name`;
        const resNormal = await fetch(urlNormal, {headers: getSupabaseHeaders()});
        dataNormal = await resNormal.json();
        if (shift === 'D') {
          const urlEcin = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=in.(ED,ET)&select=n_int,abv_name`;
          dataEcin = await (await fetch(urlEcin, {headers: getSupabaseHeaders()})).json();
        }
        if (shift === 'N') {
          const urlOfope = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=eq.N&select=n_int,abv_name`;
          dataOfope = await (await fetch(urlOfope, {headers: getSupabaseHeaders()})).json();
          const urlPiquete = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=eq.PN&select=n_int,abv_name`;
          dataPiquete = await (await fetch(urlPiquete, {headers: getSupabaseHeaders()})).json();
          const urlEcin = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=in.(EN,ET)&select=n_int,abv_name`;
          dataEcin = await (await fetch(urlEcin, {headers: getSupabaseHeaders()})).json();
        }
        const sortFn = (a, b) => Number(a.n_int) - Number(b.n_int);
        dataNormal.sort(sortFn); dataEcin.sort(sortFn); dataOfope.sort(sortFn); dataPiquete.sort(sortFn);
        if (dataNormal.length === 0 && dataEcin.length === 0 && dataOfope.length === 0 && dataPiquete.length === 0) {
          tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#aaa; padding:12px;">Sem dados</td></tr>`;
          return;
        }
        const allNInts = [...dataNormal, ...dataEcin, ...dataOfope, ...dataPiquete].map(r => String(r.n_int).trim().padStart(3, '0'));
        const uniqueNInts = [...new Set(allNInts)];
        const resElems = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=in.(${uniqueNInts.join(',')})&select=n_int,patent`, {headers: getSupabaseHeaders()});
        const elems = await resElems.json();
        const patenteMap = {};
        elems.forEach(e => { patenteMap[String(e.n_int || '').trim().padStart(3, '0')] = e.patent || ''; });
        const sectionHeader = (title) => `
          <tr>
            <td colspan="3" class="plandir-card-title black-variant" style="height: 30px; font-size: 11px; padding: 0; border: none; text-align: center; display: table-cell; border-top: 1px solid #fff;">
              ${title}
            </td>
          </tr>
        `;
        let htmlContent = sectionHeader('PROFISSIONAIS');
        htmlContent += dataNormal.map(r => renderRow(r, patenteMap)).join('');
        if (shift === 'D') {
          if (dataEcin.length > 0) { htmlContent += sectionHeader('ECIN'); htmlContent += dataEcin.map(r => renderRow(r, patenteMap)).join(''); }
        }
        if (shift === 'N') {
          if (dataOfope.length > 0) { htmlContent += sectionHeader('OFOPE'); htmlContent += dataOfope.map(r => renderRow(r, patenteMap)).join(''); }
          if (dataPiquete.length > 0) { htmlContent += sectionHeader('PIQUETE'); htmlContent += dataPiquete.map(r => renderRow(r, patenteMap)).join(''); }
          if (dataEcin.length > 0) { htmlContent += sectionHeader('ECIN'); htmlContent += dataEcin.map(r => renderRow(r, patenteMap)).join(''); }
        }
        tbody.innerHTML = htmlContent;
        updateStatusDots();
      } catch (err) {
        console.error('Erro ao carregar escala:', err);
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#e44; padding:12px;">Erro ao carregar</td></tr>`;
      }
    }
    async function loadShift(shift) {
      const container = document.getElementById('plandir_container');
      const headerContainer = document.getElementById('plandir-header-container');
      const activeBtn = document.querySelector('.options-btn.active');
      if (activeBtn && activeBtn.dataset.shift === shift) {
        activeBtn.classList.remove('active');
        container.innerHTML = '';
        if (headerContainer) headerContainer.innerHTML = '';
        document.getElementById('plandir-right-col').style.display = 'none';
        return;
      }
      activateShiftButton(shift);
      container.innerHTML = '';
      if (headerContainer) headerContainer.innerHTML = '';
      if (shift !== 'LAST') {
        sessionStorage.setItem("originalShift", shift);
        localStorage.setItem("originalShift", shift);
      }
      let header;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (shift === 'LAST') {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/fomio_date?select=header_text&limit=1`, {method: 'GET', headers: getSupabaseHeaders()});
          const dataArr = await res.json();
          let formattedHeader = null;
          let originalShift = null;
          if (dataArr && dataArr.length > 0) {
            const headerText = dataArr[0].header_text;
            const match = headerText.match(/Dia: (\d{2}) (\w{3}) (\d{4}) \| Turno (.) \| (.+)/);
            if (match) {
              const [_, day, month, year, shiftLetter, hours] = match;
              originalShift = shiftLetter;
              sessionStorage.setItem("originalShift", shiftLetter);
              localStorage.setItem("originalShift", shiftLetter);
            }
            formattedHeader = headerText;
          }
          header = createPlanDirHeader('LAST', formattedHeader);
          if (header && headerContainer) headerContainer.appendChild(header); // ← ALTERADO
          container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
          try {
            const res2 = await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams?select=*`, {method: 'GET', headers: getSupabaseHeaders()});
            const allMembers = await res2.json();
            if (allMembers && allMembers.length > 0) {
              const teamNameMap = {"ofope": "OFOPE", "chefe_servico": "CHEFE DE SERVIÇO", "optel": "OPTEL", "equipa_01": "EQUIPA 01", "equipa_02": "EQUIPA 02", "logistica": "LOGÍSTICA",
                                   "inem": "INEM", "inem_reserva": "INEM - Reserva", "servico_geral": "SERVIÇO GERAL"};
              const teamsData = allMembers.reduce((acc, member) => {
                if (!acc[member.team_name]) acc[member.team_name] = [];
                acc[member.team_name].push(member);
                return acc;
              }, {});
              Object.keys(teamsData).forEach(dbTeamName => {
                const displayTitle = teamNameMap[dbTeamName];
                if (!displayTitle) return;
                const card = Array.from(document.querySelectorAll('.plandir-main-card')).find(
                  c => c.querySelector('.plandir-card-title')?.textContent.trim() === displayTitle
                );
                if (!card) return;
                const rows = Array.from(card.querySelectorAll('tbody tr'));
                teamsData[dbTeamName].forEach((member, i) => {
                  const tr = rows[i];
                  if (!tr) return;
                  const inputs = tr.querySelectorAll('input');
                  const mpCell = tr.querySelector('.mp-cell');
                  const tasCell = tr.querySelector('.tas-cell');
                  if (inputs[0]) inputs[0].value = member.n_int || '';
                  if (inputs[1]) inputs[1].value = member.patente || '';
                  if (inputs[2]) inputs[2].value = member.nome || '';
                  if (inputs[3]) inputs[3].value = member.h_entrance || '';
                  if (inputs[4]) inputs[4].value = member.h_exit || '';
                  if (mpCell) { mpCell.textContent = member.MP ? 'X' : ''; mpCell.classList.toggle('plandir-mp-active', !!member.MP); }
                  if (tasCell) { tasCell.textContent = member.TAS ? 'X' : ''; tasCell.classList.toggle('plandir-tas-active', !!member.TAS); }
                  if (inputs[5]) inputs[5].value = member.observ || '';
                });
              });
            }
          } catch (err) {
            console.error('Erro ao carregar dados salvos direto:', err);
          }
          updateStatusDots();
          if (originalShift) loadSideTable(originalShift);
        } catch (err) {
          console.error('Erro ao carregar header direto:', err);
          header = createPlanDirHeader('LAST');
          if (header && headerContainer) headerContainer.appendChild(header);
          container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
        }
      } else {
        header = createPlanDirHeader(shift);
        if (header && headerContainer) headerContainer.appendChild(header);
        container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
        loadSideTable(shift);
      }
      container.querySelectorAll('.plandir-nint-input').forEach(input => {
        input.addEventListener('input', async function() {
          this.value = this.value.replace(/\D/g, '').slice(0, 3);
          const row = this.closest('tr');
          if (this.value.length === 3) {
            const nIntFormatted = this.value.padStart(3, '0');
            const inputRef = this;
            let dataArr = [];
            try {
              const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${this.value}`, {headers: getSupabaseHeaders()});
              dataArr = await res.json();
              updateRowFields(row, dataArr[0], shift);
            } catch (err) {
              console.error('Erro reg_elems:', err);
            }
            const allNintInputs = Array.from(document.querySelectorAll('.plandir-nint-input'));
            const existingRow = allNintInputs.find(i => i !== inputRef && i.value.trim() === this.value.trim());
            if (existingRow) {
              const existingObs = existingRow.closest('tr').querySelectorAll('td input')[5];
              const obsInput = row.querySelectorAll('td input')[5];
              if (obsInput && existingObs) obsInput.value = existingObs.value;
              updateStatusDots();
              return;
            }
            const sideTbody = document.getElementById('plandir-side-tbody');
            const sideRow = sideTbody && sideTbody.querySelector(`tr[data-side-nint="${nIntFormatted}"]`);
            const existsInSide = !!sideRow;
            if (existsInSide) {
              const obsInput = row.querySelectorAll('td input')[5];
              if (shift === 'D') {
                try {
                  const resTeam = await fetch(`${SUPABASE_URL}/rest/v1/reg_employees?n_int=eq.${this.value}&select=team`, {headers: getSupabaseHeaders()});
                  const teamData = await resTeam.json();
                  const team = teamData[0]?.team || '';
                  if (obsInput) obsInput.value = team.startsWith('EIP') ? 'EIP' : 'Profissional';
                } catch (err) {
                  console.error('Erro ao buscar team:', err);
                  if (obsInput) obsInput.value = 'Profissional';
                }
              } else {
                let secao = '';
                let currentSection = '';
                sideTbody.querySelectorAll('tr').forEach(tr => {
                  const sectionCell = tr.querySelector('td.plandir-card-title');
                  if (sectionCell) currentSection = sectionCell.textContent.trim();
                  if (tr.getAttribute('data-side-nint') === nIntFormatted) secao = currentSection;
                });
                if (obsInput) {
                  if (secao === 'PROFISSIONAIS') obsInput.value = 'Profissional';
                  else if (secao === 'PIQUETE') obsInput.value = 'Piquete';
                  else if (secao === 'ECIN') obsInput.value = 'ECIN';
                  else if (secao === 'OFOPE') obsInput.value = '';
                  else obsInput.value = 'Profissional';
                }
              }
            } else {
              const nome = dataArr[0]?.abv_name || nIntFormatted;
              const msg = document.getElementById('popup-confirm-message');
              if (msg) msg.textContent = `O Elemento ${nIntFormatted} (${nome}) não consta na escala do dia. Deseja adicioná-lo ao planeamento?`;
              const modal1 = document.getElementById('popup-confirm-modal');
              const modal2 = document.getElementById('popup-service-type-modal');
              if (modal1) modal1.classList.add('show');
              const okBtn1 = document.getElementById('popup-confirm-ok-btn');
              const cancelBtn1 = document.getElementById('popup-confirm-cancel-btn');
              const okBtn2Raw = document.getElementById('popup-service-type-ok-btn');
              const cancelBtn2Raw = document.getElementById('popup-service-type-cancel-btn');
              const okBtn2 = okBtn2Raw.cloneNode(true);
              const cancelBtn2 = cancelBtn2Raw.cloneNode(true);
              okBtn2Raw.parentNode.replaceChild(okBtn2, okBtn2Raw);
              cancelBtn2Raw.parentNode.replaceChild(cancelBtn2, cancelBtn2Raw);
              if (okBtn1) okBtn1.onclick = () => {
                modal1.classList.remove('show');
                document.querySelectorAll('input[name="popup-service-type"]').forEach(r => r.checked = false);
                document.getElementById('service-swap-fields').style.display = 'none';
                document.getElementById('service-swap-nint').value = '';
                document.getElementById('service-swap-name').value = '';
                document.getElementById('service-other-fields').style.display = 'none';
                document.getElementById('service-other-text').value = '';
                setTimeout(() => { if (modal2) modal2.classList.add('show'); }, 50);
              };
              if (cancelBtn1) cancelBtn1.onclick = () => {
                modal1.classList.remove('show');
                inputRef.value = '';
                updateRowFields(row, null);
                updateStatusDots();
              };
              okBtn2.onclick = async () => {
                const selected = document.querySelector('input[name="popup-service-type"]:checked');
                if (!selected) { showPopup('popup-danger', 'Por favor selecione uma opção.'); return; }
                if (selected.value === 'Troca de Serviço') {
                  const nIntSwap = document.getElementById('service-swap-nint')?.value?.trim();
                  if (!nIntSwap) {
                    showPopup('popup-danger', 'Por favor insira o Nº Int. do elemento para troca.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => { closePopup('popup-danger'); dangerBtn.onclick = originalOnclick; setTimeout(() => { document.getElementById('service-swap-nint').focus(); }, 50); };
                    return;
                  }
                  if (nIntSwap === inputRef.value.trim()) {
                    showPopup('popup-danger', 'O elemento não pode fazer troca consigo mesmo.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => {closePopup('popup-danger'); dangerBtn.onclick = originalOnclick; setTimeout(() => {
                      document.getElementById('service-swap-nint').focus(); document.getElementById('service-swap-nint').select();}, 50);};
                    return;
                  }
                }
                if (selected.value === 'Outro') {
                  const otherText = document.getElementById('service-other-text')?.value?.trim();
                  if (!otherText) {
                    showPopup('popup-danger', 'Por favor preencha o campo de observação.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => {closePopup('popup-danger'); dangerBtn.onclick = originalOnclick; setTimeout(() => {document.getElementById('service-other-text').focus();}, 50);};
                    return;
                  }
                }
                modal2.classList.remove('show');
                const obsInput = row.querySelectorAll('td input')[5];
                if (selected.value === 'Troca de Serviço') {
                  const nIntSwap = document.getElementById('service-swap-nint')?.value?.trim();
                  const nameSwap = document.getElementById('service-swap-name')?.value?.trim();
                  const swapInfo = nIntSwap ? `${nIntSwap} ${nameSwap}` : '';
                  if (shift === 'D') {
                    if (obsInput) obsInput.value = `Profissional | Troca de Serviço | ${swapInfo}`;
                  } else {
                    let secaoSwap = '';
                    let currentSection = '';
                    const sideTbody = document.getElementById('plandir-side-tbody');
                    const nIntSwapFormatted = nIntSwap?.padStart(3, '0');
                    if (sideTbody && nIntSwapFormatted) {
                      sideTbody.querySelectorAll('tr').forEach(tr => {
                        const sectionCell = tr.querySelector('td.plandir-card-title');
                        if (sectionCell) currentSection = sectionCell.textContent.trim();
                        if (tr.getAttribute('data-side-nint') === nIntSwapFormatted) secaoSwap = currentSection;
                      });
                    }
                    let prefix = 'Piquete';
                    if (secaoSwap === 'PROFISSIONAIS') prefix = 'Profissional';
                    else if (secaoSwap === 'ECIN') prefix = 'ECIN';
                    else if (secaoSwap === 'PIQUETE') prefix = 'Piquete';
                    if (obsInput) obsInput.value = `${prefix} | Troca de Serviço | ${swapInfo}`;
                  }
                } else if (selected.value === 'Outro') {
                  const otherText = document.getElementById('service-other-text')?.value?.trim();
                  if (obsInput) obsInput.value = otherText || '';
                } else {
                  if (obsInput) obsInput.value = selected.value;
                }
              };
              cancelBtn2.onclick = () => {
                modal2.classList.remove('show');
                inputRef.value = '';
                updateRowFields(row, null);
                updateStatusDots();
              };
            }
          } else {
            updateRowFields(row, null);
          }
          updateStatusDots();
        });
      });
      container.querySelectorAll('.plandir-entrance-input').forEach(input => {
        input.addEventListener('change', function() {
          const row = this.closest('tr');
          const obsInput = row.querySelectorAll('td input')[5];
          if (!obsInput || shift !== 'D' || !obsInput.value.startsWith('Profissional')) return;
          const val = this.value.trim();
          if (!val) return;
          const [h, m] = val.split(':').map(Number);
          const totalMinutes = h * 60 + m;
          obsInput.value = totalMinutes < (6 * 60 + 30) ? 'Profissional | Longo Curso' : 'Profissional';
        });
      });
      container.querySelectorAll('input:not([readonly]):not([disabled])').forEach(input => {
        input.addEventListener('keydown', function(e) {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const allInputs = Array.from(container.querySelectorAll('input:not([readonly]):not([disabled])'));
          const currentIndex = allInputs.indexOf(this);
          if (currentIndex !== -1 && currentIndex < allInputs.length - 1) allInputs[currentIndex + 1].focus();
        });
      });
      container.querySelectorAll('.plandir-nint-input').forEach(input => {
        input.addEventListener('dblclick', function() {
          const row = this.closest('tr');
          this.value = '';
          updateRowFields(row, null);
          updateStatusDots();
        });
      });
      createEmitButton(container);
    }
    function renderRow(r, patentMap) {
      const nIntFormatted = String(r.n_int || '').trim().padStart(3, '0');
      const patent = patentMap[nIntFormatted] || '';
      const isAlreadyFilled = Array.from(document.querySelectorAll('.plandir-nint-input'))
        .some(input => input.value.trim().padStart(3, '0') === nIntFormatted);
      return `
        <tr data-side-nint="${nIntFormatted}" class="${isAlreadyFilled ? 'row-highlight-green' : 'row-pending-red'}">
          <td style="text-align:center; padding: 5px 6px; width:75px;">${nIntFormatted}</td>
          <td style="padding: 5px 6px; width:150px;">${patent}</td>
          <td style="padding: 5px 6px; width:250px;">${r.abv_name || ''}</td>
        </tr>
      `;
    }
    document.querySelector('[data-page="page-plandir"]').addEventListener('click', () => {
      const container = document.getElementById('plandir_container');
      const rightCol = document.getElementById('plandir-right-col');
      const headerContainer = document.getElementById('plandir-header-container'); // ← NOVO
      if (container && container.innerHTML.trim() !== '') {
        container.innerHTML = '';
        if (headerContainer) headerContainer.innerHTML = ''; // ← NOVO
        if (rightCol) rightCol.style.display = 'none';
        document.querySelectorAll('.options-btn').forEach(btn => btn.classList.remove('active'));
      }
      blockShiftButtons();
    });
    document.querySelectorAll('input[name="popup-service-type"]').forEach(radio => {
      radio.addEventListener('change', function () {
        document.getElementById('service-swap-fields').style.display = this.value === 'Troca de Serviço' ? 'flex' : 'none';
        document.getElementById('service-other-fields').style.display = this.value === 'Outro' ? 'flex' : 'none';
      });
    });
    document.addEventListener('input', async function (e) {
      if (e.target.id !== 'service-swap-nint') return;
      const input = e.target;
      input.value = input.value.replace(/\D/g, '').slice(0, 3);
      const nameField = document.getElementById('service-swap-name');
      if (input.value.length === 3) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${input.value}`, {headers: getSupabaseHeaders()});
          const data = await res.json();
          nameField.value = data[0]?.abv_name || '';
        } catch (err) {
          console.error('Erro:', err);
          nameField.value = '';
        }
      } else {
        nameField.value = '';
      }
    });
    function blockShiftButtons() {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      const isDay = totalMinutes >= 8 * 60 && totalMinutes < 20 * 60;
      const btnD = document.querySelector('.options-btn[data-shift="D"]');
      const btnN = document.querySelector('.options-btn[data-shift="N"]');
      btnD.disabled = false; btnD.style.opacity = '1'; btnD.style.cursor = 'pointer'; btnD.title = '';
      btnN.disabled = false; btnN.style.opacity = '1'; btnN.style.cursor = 'pointer'; btnN.title = '';
      if (isDay) {
        btnN.disabled = true; btnN.style.opacity = '0.4'; btnN.style.cursor = 'not-allowed'; btnN.title = 'Turno N disponível após as 20:00';
      } else {
        btnD.disabled = true; btnD.style.opacity = '0.4'; btnD.style.cursor = 'not-allowed'; btnD.title = 'Turno D disponível após as 08:00';
      }
    }
    blockShiftButtons();
    /* =======================================
    INOP CREPC
    ======================================= */
    function preselectCorpInSitopCB() {
      const current = sessionStorage.getItem("currentCorpOperNr");
      if (!current) {
        return;
      }
      const select = document.getElementById("sitop_cb");
      if (!select) {
        return;
      }
      const clean = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      for (const option of select.options) {
        const optionText = clean(option.textContent);
        if (optionText.startsWith(clean(current))) {
          option.selected = true;
          console.log("✔ Selecionado:", option.textContent);
          return;
        }
      }
    }
    /* =============== ELEMENT VARIABLES =============== */
    const NewInopBtn = document.getElementById("NewInopBtn");
    const oldInopBtn = document.querySelector(".oldinop");
    const backBtn = document.getElementById("backBtn");
    const backFromTableBtn = document.getElementById("backFromTableBtn");
    const saveBtn = document.getElementById("saveBtn");
    const actionButtons = document.getElementById("inop-action-buttons");
    const sitopContainer = document.getElementById("sitop_container");
    const inopsTableContainer = document.getElementById("inopsTableContainer");
    const inopsTableBody = document.querySelector("#inopsTable tbody");
    const sitopCbSelect = document.getElementById("sitop_cb");
    const sitopVeicSelect = document.getElementById("sitop_veíc");
    const sitopVeicRegInput = document.getElementById("sitop_veíc_registration");
    const sitopGdhInopInput = document.getElementById("sitop_gdh_inop");
    const yesCheckbox = document.getElementById("ppi_yes");
    const noCheckbox = document.getElementById("ppi_no");
    const subsYesCheckbox = document.getElementById("ppi_subs_yes");
    const subsNoCheckbox = document.getElementById("ppi_subs_no");
    /* =========== UTILITY FUNCTIONS AND UI ============ */
    function formatSITOPGDH() {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
      const month = monthNames[now.getMonth()];
      const year = String(now.getFullYear()).slice(-2);
      return `${day}${hour}${minutes}${month}${year}`;
    }
    function clearSitopForm() {
      document.querySelectorAll("#sitop_container input, #sitop_container textarea").forEach(el => el.value = "");
      document.querySelectorAll('#sitop_container input[type="checkbox"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('#sitop_container select').forEach(sel => sel.selectedIndex = 0);
      sitopContainer.removeAttribute("data-record-id");
      saveBtn.textContent = "Emitir Inoperacionalidade";
      saveBtn.classList.remove("btn-success");
      saveBtn.classList.add("btn-danger");
    }
    function toggleSitopContainer(forceClose = false) {
      const isVisible = sitopContainer.style.display === "block";
      sitopContainer.style.transition = "opacity 0.25s ease";
      if (isVisible || forceClose) {
        sitopContainer.style.opacity = "0";
        setTimeout(() => {
          sitopContainer.style.display = "none";
          clearSitopForm();
        }, 250);
      } else {
        inopsTableContainer.style.display = "none";
        sitopContainer.style.display = "block";
        sitopContainer.style.opacity = "0";
        setTimeout(() => sitopContainer.style.opacity = "1", 10);
        clearSitopForm();
      }
    }
    function handleValidateOperationality(event) {
      preselectCorpInSitopCB();
      const btn = event.currentTarget;
      const recordAttr = btn.getAttribute("data-record");
      if (!recordAttr) {
        console.error("Erro: Atributo data-record não encontrado.");
        return;
      }
      const record = JSON.parse(recordAttr);
      inopsTableContainer.style.display = "none";
      if (oldInopBtn) oldInopBtn.classList.remove("active");
      sitopContainer.style.display = "block";
      sitopContainer.style.opacity = "0";
      setTimeout(() => sitopContainer.style.opacity = "1", 10);
      const header = sitopContainer.querySelector(".major-card-header") || sitopContainer.querySelector(".major-card-header");
      if (header) header.textContent = "COMUNICAR OPERACIONALIDADE";
      document.getElementById("sitop_veíc").value = record.vehicle || "";
      document.getElementById("sitop_veíc_registration").value = record.registration || "";
      document.getElementById("sitop_gdh_inop").value = record.gdh_inop || "";
      document.getElementById("sitop_gdh_op").value = formatSITOPGDH();
      document.getElementById("sitop_type_failure").value = record.failure_type || "";
      document.getElementById("sitop_failure_description").value = record.failure_description || "";
      document.getElementById("sitop_optel").value = record.optel || "";
      document.getElementById("ppi_yes").checked = record.ppi_part === true;
      document.getElementById("ppi_no").checked = record.ppi_part === false;
      document.getElementById("ppi_a2").checked = record.ppi_a2 === true;
      document.getElementById("ppi_a22").checked = record.ppi_a22 === true;
      document.getElementById("ppi_airport").checked = record.ppi_airport === true;
      document.getElementById("ppi_linfer").checked = record.ppi_linfer === true;
      document.getElementById("ppi_airfield").checked = record.ppi_airfield === true;
      document.getElementById("ppi_subs_yes").checked = record.ppi_subs === true;
      document.getElementById("ppi_subs_no").checked = record.ppi_subs === false;
      if (NewInopBtn) NewInopBtn.classList.add("active");
      sitopContainer.setAttribute("data-record-id", record.id);
      saveBtn.textContent = "📄 Emitir Operacionalidade";
      saveBtn.classList.remove("btn-danger");
      saveBtn.classList.add("btn-success");
    }
    async function fetchCREPCSitopRecipientsFromSupabase(corpOperNr) {
      const categories = ['crepcsitop_mail_to', 'crepcsitop_mail_cc', 'crepcsitop_mail_bcc'];
      const url = `${SUPABASE_URL}/rest/v1/mails_config` + `?category=in.(${categories.join(',')})` + `&corp_oper_nr=eq.${corpOperNr}` + `&select=category,value`;
      try {
        const response = await fetch(url, { headers: getSupabaseHeaders() });
        if (!response.ok) throw new Error("Falha ao conectar ao Supabase.");
        const data = await response.json();
        const recipients = { to: [], cc: [], bcc: [] };
        data.forEach(row => {
          const emails = row.value?.split(",")
          .map(e => e.trim())
          .filter(e => e) || [];
          if (row.category.endsWith("_to")) recipients.to = emails;
          if (row.category.endsWith("_cc")) recipients.cc = emails;
          if (row.category.endsWith("_bcc")) recipients.bcc = emails;
        });
        if (recipients.to.length === 0) recipients.to = [""];
        return recipients;
      } catch (err) {
        console.error("Erro ao buscar e-mails:", err);
        return { to: ["central0805.ahbfaro@gmail.com"], cc: [], bcc: [] };
      }
    }
    /* ================= EMISSION LOGIC ================ */
    async function emitSitop() {
      const cb_type = document.getElementById("sitop_cb").value.trim();
      const vehicle = document.getElementById("sitop_veíc").value.trim();
      const registration = document.getElementById("sitop_veíc_registration").value.trim();
      const gdh_inop = document.getElementById("sitop_gdh_inop").value.trim();
      const gdh_op = document.getElementById("sitop_gdh_op").value.trim() || null;
      const failure_type = document.getElementById("sitop_type_failure").value.trim();
      const failure_description = document.getElementById("sitop_failure_description").value.trim();
      const ppi_part = document.getElementById("ppi_yes").checked;
      const ppi_a2 = document.getElementById("ppi_a2").checked;
      const ppi_a22 = document.getElementById("ppi_a22").checked;
      const ppi_airport = document.getElementById("ppi_airport").checked;
      const ppi_linfer = document.getElementById("ppi_linfer").checked;
      const ppi_airfield = document.getElementById("ppi_airfield").checked;
      const ppi_subs = document.getElementById("ppi_subs_yes").checked;
      const optel = document.getElementById("sitop_optel").value.trim();
      if (!vehicle || !registration || !gdh_inop) {
        showPopup('popup-danger', "Por favor preencha os campos obrigatórios: Veículo, Matrícula e GDH INOP.");
        return;
      }
      showPopup('popup-success', `Estado Operacional do veículo ${vehicle} criado com sucesso. Por favor aguarde uns segundos, receberá uma nova notificação após o envio para as entidades estar concluído!`);
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {
        showPopup('popup-danger', "Erro: O número da corporação não foi encontrado. Por favor, faça login novamente.");
        return;
      }
      saveBtn.disabled = true;
      const recordId = sitopContainer.getAttribute("data-record-id");
      const isUpdate = !!recordId;
      const isOperational = !!gdh_op;
      const data = {cb_type, vehicle, registration, gdh_inop, gdh_op, failure_type, failure_description, ppi_part, 
                    ppi_a2, ppi_a22, ppi_airport, ppi_linfer, ppi_airfield, ppi_subs, optel, corp_oper_nr: corpOperNr};
      const supabaseData = { ...data };
      delete supabaseData.cb_type; // O Supabase não precisa do nome da corporação formatado, apenas do NR
      try {
        if (!isUpdate && !isOperational) {
          const checkUrl = `${SUPABASE_URL}/rest/v1/sitop_vehicles?select=vehicle&vehicle=eq.${encodeURIComponent(vehicle)}&gdh_op=is.null&corp_oper_nr=eq.${encodeURIComponent(corpOperNr)}`;
          const checkRes = await fetch(checkUrl, { headers: getSupabaseHeaders() });
          if (!checkRes.ok) throw new Error(`Erro ao verificar duplicado.`);
          const existing = await checkRes.json();
          if (existing.length > 0) {
            showPopup('popup-danger', `O veículo ${vehicle} já se encontra INOP!`);
            saveBtn.disabled = false;
            return;
          }
        }
        const supabaseUrl = isUpdate ? `${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${recordId}` : `${SUPABASE_URL}/rest/v1/sitop_vehicles`;
        const method = isUpdate ? "PATCH" : "POST";
        const response = await fetch(supabaseUrl, {
          method,
          headers: { ...getSupabaseHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(supabaseData)
        });
        if (!response.ok) throw new Error("Erro ao enviar dados ao Supabase.");
        const statusRes = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicle)}`, {
          method: "PATCH",
          headers: { ...getSupabaseHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ is_inop: !isOperational })
        });
        if (!statusRes.ok) console.warn("⚠️ Erro ao atualizar status do veículo.");
        const { to, cc, bcc } = await fetchCREPCSitopRecipientsFromSupabase(corpOperNr);
        const signature = getEmailSignature();
        const greeting = getGreeting();
        const commanderName = await getCommanderName(corpOperNr);
        const corpName = cb_type.includes(" - ") ? cb_type.split(" - ").slice(1).join(" - ") : cb_type;
        const article = corpName.includes("Companhia") ? "da" : "do";
        const emailBodyHTML = `${greeting}<br><br>
        Encarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s o Formulário de Situação Operacional 
        do veículo ${vehicle} ${article} ${corpName}.<br><br>
        Com os melhores cumprimentos,<br><br>
        OPTEL<br>${optel}<br><br>
        <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
        Este email foi processado automaticamente por: CB360 Online<br><br>
        </span>
        ${signature}`;
        const emailRes = await fetch('https://cb360-online.vercel.app/api/crepc_convert_and_send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({mode: "sitop", data, recipients: to, ccRecipients: cc, bccRecipients: bcc, emailSubject: `Situação Operacional do Veículo ${vehicle}`, emailBody: emailBodyHTML})
        });
        if (!emailRes.ok) throw new Error("Erro ao enviar email via Vercel.");
        showPopup('popup-success', `A situação operacional do veículo ${vehicle} foi enviada para as entidades.`);
        if (isOperational && isUpdate) {
          await fetch(`${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${recordId}`, {
            method: 'DELETE',
            headers: getSupabaseHeaders()
          });
        }
        toggleSitopContainer(true);
        NewInopBtn.classList.remove("active");
        if (oldInopBtn) oldInopBtn.classList.remove("active");
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', `Erro: ${err.message}`);
      } finally {
        saveBtn.disabled = false;
      }
    }
    /* ================ EVENT LISTENERS ================ */
    NewInopBtn.addEventListener("click", () => {
      preselectCorpInSitopCB();
      const isActive = NewInopBtn.classList.toggle("active");
      oldInopBtn.classList.remove("active");
      if (isActive) {
        toggleSitopContainer(false);
        inopsTableContainer.style.display = "none";
        document.querySelector("#sitop_container .card-header").textContent = "INSERÇÃO DE NOVA INOPERACIONALIDADE";
        preselectCorpInSitopCB() ;
      } else {
        toggleSitopContainer(true);
      }
    });
    saveBtn.addEventListener("click", async () => await emitSitop());
    if (oldInopBtn) {  
      oldInopBtn.addEventListener("click", async () => {    
        const isActive = oldInopBtn.classList.toggle("active");
        NewInopBtn.classList.remove("active");    
        if (!isActive) {
          inopsTableContainer.style.display = "none";
          return;
        }
        sitopContainer.style.display = "none";
        inopsTableBody.innerHTML =
          "<tr><td colspan='5' style='text-align:center;'>Carregando...</td></tr>";
        try {
            const corpOperNr = sessionStorage.getItem("currentCorpOperNr");            
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/sitop_vehicles?select=*&gdh_op=is.null&corp_oper_nr=eq.${corpOperNr}`,
              { headers: getSupabaseHeaders() }
            );
          if (!res.ok) throw new Error("Erro ao buscar inoperacionalidades");
          const data = await res.json();
          inopsTableBody.innerHTML = "";
          if (data.length === 0) {
            inopsTableBody.innerHTML =
              `<tr><td colspan="6" style="text-align:center;">Não foram encontrados veículos inoperacionais.</td></tr>`;
          } else {
            data.forEach(item => {
              const tr = document.createElement("tr");
              tr.innerHTML = `
                <td style="text-align:center;">${item.vehicle || ''}</td>
                <td style="text-align:center;">${item.gdh_inop || ''}</td>
                <td style="text-align:center;">${item.failure_type || ''}</td>
                <td>${item.failure_description || ''}</td>
                <td>${item.optel || ''}</td>
                <td style="text-align:center;">
                  <button class="btn btn-danger validate-btn" 
                          data-record='${JSON.stringify(item)}'
                          style="height:30px; padding:5px 10px;">
                    Validar Operacionalidade
                  </button>
                </td>`;
              inopsTableBody.appendChild(tr);
            });
            document.querySelectorAll(".validate-btn").forEach(btn =>
              btn.addEventListener("click", handleValidateOperationality)
            );
          }    
          inopsTableContainer.style.display = "block";
        } catch (err) {
          console.error(err);
          showPopup('popup-danger', "Erro ao carregar inoperacionalidades: " + err.message);
        }
      });
    }
    yesCheckbox.addEventListener("change", () => { if (yesCheckbox.checked) noCheckbox.checked = false; });
    noCheckbox.addEventListener("change", () => { if (noCheckbox.checked) yesCheckbox.checked = false; });
    subsYesCheckbox.addEventListener("change", () => { if (subsYesCheckbox.checked) subsNoCheckbox.checked = false; });
    subsNoCheckbox.addEventListener("change", () => { if (subsNoCheckbox.checked) subsYesCheckbox.checked = false; });
    sitopVeicSelect.addEventListener("change", async () => {
      const selectedVehicle = sitopVeicSelect.value;
      sitopGdhInopInput.value = formatSITOPGDH();
      if (!selectedVehicle) return sitopVeicRegInput.value = "";
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle_registration&vehicle=eq.${encodeURIComponent(selectedVehicle)}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar matrícula");
        const data = await res.json();
        sitopVeicRegInput.value = data[0]?.vehicle_registration || "";
      } catch (err) {
        console.error("Erro ao carregar matrícula:", err);
        sitopVeicRegInput.value = "";
      }
    });
    /* ================== RESTART PAGE ================= */
    document.querySelector('[data-page="page-inocrepc"]').addEventListener('click', () => {
      sitopContainer.style.display = 'none';
      inopsTableContainer.style.display = 'none';
    });
    /* =======================================
    ALARM CONSOLE
    ======================================= */
    async function fetchRegElemsFromSupabase() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name,n_int,elem_state&order=n_int.asc`, {
            method: 'GET',
            headers: getSupabaseHeaders(),
          }
        );
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        const filteredData = data.filter(item => {
          const num = parseInt(item.n_int);
          const isForbiddenRange = num >= 900 && num <= 999;
          return (
            item.abv_name !== "Cargo Aberto" && item.elem_state === true &&  !isForbiddenRange
          );
        });
        return filteredData;
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return [];
      }
    }
    async function populateIndivSelect(select) {
      const elems = await fetchRegElemsFromSupabase();
      elems.sort((a, b) => (a.n_int || 9999) - (b.n_int || 9999));
      select.innerHTML = '<option value=""></option>';
      elems.forEach(elem => {
        const option = document.createElement('option');
        option.value = elem.abv_name;
        option.textContent = `${elem.n_int} - ${elem.abv_name}`;
        select.appendChild(option);
      });
    }
    const soundKeys = {'ca-indiv-pv': 'PV', 'ca-indiv-cc': 'CC', 'ca-indiv-sb': 'SB', 'ca-indiv-gch': 'GCH', 'ca-indiv-gcm': 'GCM',
                       'ca-glob-pv': 'PV', 'ca-glob-sb': 'SB', 'ca-glob-sn': 'SN', 'ca-glob-gch': 'GCH', 'ca-glob-gcm': 'GCM'};
    let selectedButton = null;
    let isPlaying = false;
    function setupButtonContainer(containerId, otherContainerIds = []) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.querySelectorAll('button').forEach(btn => {
        if (btn.id.includes('call')) return;
        btn.addEventListener('click', () => {
          if (isPlaying) {
            showPopup('popup-danger', "Aguarde até o som atual terminar!");
            return;
          }
          const wasActive = btn.classList.contains('active');
          container.querySelectorAll('button').forEach(b => {
            if (!b.id.includes('call')) b.classList.remove('active');
          });
          otherContainerIds.forEach(otherId => {
            const otherContainer = document.getElementById(otherId);
            if (otherContainer) {
              otherContainer.querySelectorAll('button').forEach(b => {
                if (!b.id.includes('call')) b.classList.remove('active');
              });
            }
          });
          if (!wasActive) {
            btn.classList.add('active');
            selectedButton = btn.id;
          } else {
            selectedButton = null;
          }
        });
      });
    }
    function disableAllControls(disabled) {
      document
        .querySelectorAll('#alarm-console-indiv button, #alarm-console-group button, #alarm-console-internal button')
        .forEach(btn => (btn.disabled = disabled));
      const selects = ['ca-indiv-catch', 'ca-group-catch'];
      selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = disabled;
      });
    }
    function playSelectedSound(selectId) {
      if (isPlaying) {
        showPopup('popup-danger', "Aguarde até o som atual terminar!");
        return;
      }
      const select = document.getElementById(selectId);
      if (!select) return;
      const elementLabel = select.options[select.selectedIndex]?.text || "";
      let selectedElement = select.value.trim();
      if (!selectedButton) return showPopup('popup-danger', "Selecione uma opção de chamada!");
      if (!selectedElement) return showPopup('popup-danger', "Selecione um elemento!");
      if (selectedElement.includes('-')) {
        selectedElement = selectedElement.split('-').slice(1).join('-').trim();
      }
      const soundKey = soundKeys[selectedButton];
      if (!soundKey) return showPopup('popup-danger', "Opção de chamada inválida!");
      const fileName = `${selectedElement}_${soundKey}.mp3`;
      const baseUrl = 'https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/sounds/Internal/';
      const btnTipo = document.getElementById(selectedButton);
      const btnPlay = (selectId === 'ca-indiv-catch')
        ? document.getElementById('ca-call-indiv')
        : document.getElementById('ca-call-group');
      const allContainers = document.querySelectorAll('#cons-indiv, #cons-group, #cons-internal');
      const originalPlayText = btnPlay ? btnPlay.textContent : "CHAMAR";
      isPlaying = true;
      disableAllControls(true);
      if (btnTipo) btnTipo.classList.add('is-transmitting');
      if (btnPlay) {
        btnPlay.classList.add('is-transmitting');
        btnPlay.textContent = `A CHAMAR: ${elementLabel}`;
      }
      allContainers.forEach(c => c.classList.add('console-dimmed'));
      const resetConsole = () => {
        if (btnTipo) btnTipo.classList.remove('is-transmitting');
        if (btnPlay) {
          btnPlay.classList.remove('is-transmitting');
          btnPlay.textContent = originalPlayText;
        }
        allContainers.forEach(c => c.classList.remove('console-dimmed'));
        document.querySelectorAll('.active').forEach(b => b.classList.remove('active'));
        selectedButton = null;
        if (select) select.value = '';
        disableAllControls(false);
        isPlaying = false;
      };
      fetch(`${baseUrl}${fileName}`, {method: 'HEAD'})
        .then(response => {
        if (!response.ok) {
          showPopup('popup-danger', `Ficheiro "${fileName}" não encontrado!`);
          resetConsole();
          return;
        }
        const audio1 = new Audio(`${baseUrl}init_call.mp3`);
        audio1.onerror = () => {resetConsole(); showPopup('popup-danger', "Erro: init_call.mp3");};
        audio1.play();
        audio1.onended = () => {
          const audio2 = new Audio(`${baseUrl}${fileName}`);
          audio2.onerror = () => {resetConsole(); showPopup('popup-danger', "Erro no ficheiro de voz");};
          audio2.play();
          audio2.onended = () => {
            const audio3 = new Audio(`${baseUrl}init_call.mp3`);
            audio3.play();
            audio3.onended = resetConsole;
          };
        };
      })
        .catch(() => {
        showPopup('popup-danger', "Erro de ligação ao servidor!");
        resetConsole();
      });
    }
    window.addEventListener('load', () => {
      const select = document.getElementById('ca-indiv-catch');
      if (select) populateIndivSelect(select);
      setupButtonContainer('alarm-console-indiv', ['alarm-console-group', 'cons-internal']);
      setupButtonContainer('alarm-console-group', ['alarm-console-indiv', 'cons-internal']);
      const callIndivBtn = document.getElementById('ca-call-indiv');
      if (callIndivBtn) {
        callIndivBtn.addEventListener('click', () => playSelectedSound('ca-indiv-catch'));
      }
      const callGroupBtn = document.getElementById('ca-call-group');
      if (callGroupBtn) {
        callGroupBtn.addEventListener('click', () => playSelectedSound('ca-group-catch'));
      }
      const internalSoundKeys = {'ca-format': 'Formatura', 'ca-alvor': 'Alvorada'};
      document.querySelectorAll('#cons-internal button').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = internalSoundKeys[btn.id];
          if (!key) return;
          if (isPlaying) {
            showPopup('popup-danger', "Aguarde até o som atual terminar!");
            return;
          }
          const originalText = btn.textContent;
          isPlaying = true;
          disableAllControls(true);
          btn.classList.add('is-transmitting');
          btn.textContent = `A REPRODUZIR: ${key.toUpperCase()}`;
          document.querySelectorAll('#cons-indiv, #cons-group').forEach(c => c.classList.add('console-dimmed'));
          const audio = new Audio(`https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/sounds/Internal/${key}.mp3`);
          const finalizeInternal = () => {
            btn.classList.remove('is-transmitting');
            btn.textContent = originalText;
            document.querySelectorAll('.console-dimmed').forEach(c => c.classList.remove('console-dimmed'));
            disableAllControls(false);
            isPlaying = false;
          };
          audio.onerror = () => {
            showPopup('popup-danger', `Som "${key}" não encontrado!`);
            finalizeInternal();
          };
          audio.play();
          audio.onended = finalizeInternal;
        });
      });
    });
