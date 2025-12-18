    /* =======================================
    PREVIOUS INTERVENTION PLANS
    ========================================*/
    /* =======================================
    PPI GENERIC FUNCTIONS
    ========================================*/
    /* ====== PPI's STYLE CONSTANTS ======= */    
    const HIGHLIGHT_WORDS = [`Rede Nacional de Áreas Protegidas`, `Rede Natura 2000`, `Linha de Média Tensão`, `áreas de declives acentuados`, `Passagem Superior`, `linhas de média e alta tensão`,
                             `linhas de média tensão`, `atravessa curso de água navegável`, `atravessa curso de água e pontos de água`, `outros compromissos internacionais`, `ALARME ESPECIAL`, `ALARME CONDICIONADO`,
                             `Troço com grandes limitações no acesso a meios terrestres, deverá ser avaliada a necessidade de mobilizar meios suplementares táticos (4x4).`];
    const A22_TITLE_STYLE = `background: linear-gradient(to right, #888, #c0c0c0); color: black; font-weight: bold; font-size: 12px; width: 100%;
                             max-width: 1572px; height: 20px; display: flex; justify-content: center; align-items: center; margin: 0;`;
    const A22_ROW_STYLE = `display: flex; justify-content: flex-start; margin: 0;`;
    const A22_GRID_BUTTON_STYLE = `margin: 5px 0; width: 78px; height: 40px;`;
    const A22_GRID_CONTAINER_STYLE = `display: flex; flex-direction: column; align-items: center;`;
    const A22_TABLE_STYLE = `width:100%; table-layout:fixed; border-collapse:collapse; margin:20px 0 10px;`;
    const A22_CELL_STYLE = `border:1px solid #bbb; padding:5px; font-weight:bold;`;
    const A22_CELL_STYLE_NORMAL = `border:1px solid #bbb; padding:5px; font-weight:normal;`;
    const A22_LABEL_CELL_STYLE = `border:1px solid #bbb; padding:5px; font-weight:bold; text-align:left;`;
    const A22_DIRECTION_TOP_STYLE = `font-size:14px;`;
    const A22_DIRECTION_MID_STYLE = `font-weight:bold; font-size:14px;`;
    const A22_DIRECTION_BOT_STYLE = `font-size:11px;`;
    const A22_NODE_KM_STYLE = `font-size:10px;`;
    const INTERVENTION_NOTICE_STYLE = `padding: 10px; margin: 20px 0 5px 0; border-radius: 3px; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: bold; font-size: 18px;`;
    const FINAL_H_TABLE_STYLE = `width: 100%; margin-top: -5px; border-collapse: collapse;`;
    const FINAL_H_CELL_STYLE = `background-color: navy; color: white; font-weight: bold; text-align: center; width: 80px; line-height: 15px; padding: 5px; border: 1px solid #bbb;`;
    const CUMULATIVE_ALERT_STYLE = `padding: 10px; margin: 5px 0 -5px 0; border-radius: 3px; font-weight: bold; background: #b30000; color: white; text-align: center;`;
    const FINAL_H_TEXT_STYLE = `padding: 5px; text-align: left; border: 1px solid #bbb; line-height: 15px;`;
    const AERO_LABEL_STYLE = {background: "linear-gradient(to right, #888, #c0c0c0)", borderRadius: "3px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "17px", fontWeight: "bold", color: "black", width: "100%", maxWidth: "920px", margin: "3px auto 0 auto"};
    const AERO_ROW_STYLE = { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "5px" };
    const AERO_BUTTON_STYLE = { marginTop: "5px", width: "180px", height: "30px", fontSize: "12px", fontWeight: "bold" };
    const AERO_HEADER_TABLE_STYLE = { width: "100%", margin: "25px 0 5px 0", borderCollapse: "collapse" };
    const AERO_HEADER_CELL_STYLE = { textAlign: "center", backgroundColor: "#8B0000", color: "#FFD700", fontWeight: "bold", fontSize: "16px", padding: "8px", borderRadius: "8px", whiteSpace: "pre-line" };
    const AERO_INFO_TABLE_STYLE = { width: "100%", margin: "5px 0 5px 0", borderCollapse: "collapse", border: "1px solid #bbb" };
    const AERO_CELL_STYLE = { textAlign: "left", padding: "4px", border: "1px solid #bbb", minHeight: "25px", verticalAlign: "top" };
    const AERO_RESERVA_CELL_STYLE = { textAlign: "center", padding: "4px", border: "1px solid #bbb", backgroundColor: "green", color: "white", fontWeight: "bold" };
    const AERO_ABS_NOTE_STYLE = { width: "100%", margin: "0", borderCollapse: "collapse", lineHeight: "15px", border: "1px solid #bbb" };
    const AERO_B1_TABLE_STYLE = {tableLayout: "fixed", width: "100%", marginBottom: "5px", marginTop: "10px"};
    const AERO_B1_COL_STYLE = ["10%", "40%", "10%", "40%"];
    const AERO_B1_HEADER1_STYLE = {textAlign: "center", padding: "4px", fontWeight: "bold", backgroundColor: "red", color: "white"};
    const AERO_B1_HEADER2_STYLE = {textAlign: "center", padding: "4px", fontSize: "12px", backgroundColor: "#f0f0f0", color: "black"};
    const AERO_B1_WRAPPER_STYLE = {display: "flex",alignItems: "center", justifyContent: "space-between", gap: "6px"};
    const AERO_B1_TITLE_DIV_STYLE = {flex: "1", textAlign: "center"};
    const LINFER_TITLE_STYLE = `background: linear-gradient(to right, #888, #c0c0c0); color: black; font-weight: bold; font-size: 17px; width: 100%; max-width: 1580px; height: 30px;
                                display: flex; justify-content: center; align-items: center; margin: 0 0 5px 0; border-radius: 3px;`;
    const LINFER_ROW_STYLE = `display: flex; justify-content: flex-start; margin: 0;`;
    const LINFER_GRID_BUTTON_STYLE = `width: 94px; height: 40px; font-size: 12px;`;
    const LINFER_DIRECTION_BUTTON_STYLE = `width: 160px; height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-weight: bold;`;
    const LINFER_DIRECTION_TOP_STYLE = `font-size: 14px;`;
    const LINFER_DIRECTION_BOT_STYLE = `font-size: 11px; font-weight: normal;`;
    const LINFER_INPUT_STYLE = `padding: 8px; width: 160px; text-align: center; border: 1px solid #ccc; border-radius: 4px; outline: none; transition: all 0.2s ease;`;
    const LINFER_CARD_STYLE = `display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; width: 400px; margin: 0 auto; margin-bottom: 5px;`;
    const LINFER_TITLE_LABEL_STYLE = `font-size: 16px; font-weight: bold;`;
    const LINFER_TABLE_STYLE = `width:100%; table-layout:fixed; border-collapse:collapse; margin:20px 0 10px`;
    const LINFER_CELL_STYLE = `border:1px solid #bbb; padding:5px; font-weight:bold;`;
    const LINFER_CELL_STYLE_NORMAL = `border:1px solid #bbb; padding:5px; font-weight:normal;`;
    const LINFER_LABEL_CELL_STYLE = `border:1px solid #bbb; padding:5px; font-weight:bold; text-align:left;`;
    const LINFER_PKM_FIRST_LINE_STYLE = `font-weight:bold; font-size:16px;`;
    const LINFER_PKM_SECOND_LINE_STYLE = `font-size:14px; color:#666; margin-top:2px;`;
    const LINFER_SPECIAL_TITLE_STYLE = `background-color: #fff3b0; font-weight: bold; text-align: center; padding: 4px; margin: -5px 0 -1px 0; border: 1px solid #bbb;`;
    const LINFER_SPECIAL_ITEM_STYLE = `border:1px solid #bbb; padding:4px 8px; margin-bottom:-1px; text-align:left;`;
    const LINFER_ABS_TABLE_STYLE = `width:100%; margin-top:-5px; border-collapse:collapse;`;
    /* =========== PPI's RESET ============ */    
    document.addEventListener("DOMContentLoaded", () => {
      function hideAllPPITables() {
        const ppiContainers = ["ppia2-specials-container", "ppia22-specials-container", "ppiaero-specials-container", "ppilinfer-specials-container",
                               "ppia2-grid-container", "ppia22-grid-container", "ppiaero-grid-container", "ppilinfer-grid-container",
                               "ppia2-grid-references", "ppia22-grid-references", "ppiaero-grid-references", "ppilinfer-grid-references",
                               "ppiaero-grid-info-container", "ppia22-abs-note", "ppilinfer-abs-note"];
        ppiContainers.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.innerHTML = "";
        });
        document.querySelectorAll("#ppia2-grid-controls button, #ppia22-grid-controls button, #ppiaero-grid-controls button, #ppilinfer-grid-controls button")
          .forEach(btn => btn.classList.remove("active"));
      }
      const planosButton = document.querySelector(".sidebar-submenu-button.sub-submenu-toggle");
      if (planosButton) {
        planosButton.addEventListener("click", () => {
          hideAllPPITables();
        });
      }
    });
    /* ==== PPI's RENDER GENERIC CELLS ==== */    
    function renderGenericAlarmCells(tr, alarmArray, i, skipState) {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (skipState.count > 0) {
        skipState.count--;
        return;
      }
      const item = alarmArray[i];
      if (!item) {
        const td1 = document.createElement("td");
        td1.textContent = "";
        tr.appendChild(td1);
        const td2 = document.createElement("td");
        td2.textContent = "";
        tr.appendChild(td2);
        return;
      }
      let meio, corp;
      if (item.means && item.means.includes("*")) {
        const parts = item.means.split("*");
        meio = parts[0] + "*";
        corp = parts[1] ? parts[1].trim().replace(/^[-\s]+/, "") : "";
      } else {
        const parts = (item.means || "").trim().split(/\s+(.+)/);
        meio = parts[0] || "";
        corp = parts[1] ? parts[1].trim() : "";
      }
      const td1 = document.createElement("td");
      td1.textContent = meio;
      td1.style.textAlign = "left";
      const td2 = document.createElement("td");
      td2.textContent = corp;
      td2.style.textAlign = "left";
      if (currentCorpNr && corp.includes(currentCorpNr)) {
        [td1, td2].forEach(td => {
          td.style.backgroundColor = "#839ec9";
          td.style.color = "white";
          td.style.fontWeight = "bold";
        });
      }
      tr.appendChild(td1);
      tr.appendChild(td2);
    }
    /* ===== PPI's CUMULATIVE ALERTS ====== */    
    function createOrUpdateCumulativeAlert(parentContainer) {
      const hasCBIntervention = checkIfHasCBIntervention(parentContainer);
      let alertDiv = parentContainer.querySelector(".cumulative-alert");
      if (!hasCBIntervention) {
        if (alertDiv) {
          alertDiv.remove();
        }
        return;
      }
      if (!alertDiv) {
        alertDiv = document.createElement("div");
        alertDiv.className = "cumulative-alert";
        alertDiv.style.cssText = CUMULATIVE_ALERT_STYLE;
        alertDiv.textContent = "ATENÇÃO! OS ALERTAS SÃO CUMULATIVOS, SE FOR ATIVADO O 2º ALARME SAEM OS MEIOS DE AMBOS OS ALARMES";
        const interventionNotice = parentContainer.querySelector(".intervention-notice");
        if (interventionNotice) {
          interventionNotice.insertAdjacentElement('afterend', alertDiv);
        } else {
          parentContainer.insertBefore(alertDiv, parentContainer.firstChild);
        }
      }
    }
    
    function checkIfHasCBIntervention(parentContainer) {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) {
        return false;
      }
      const tables = parentContainer.querySelectorAll('table');
      for (const table of tables) {
        const cells = table.querySelectorAll('td');
        for (const cell of cells) {
          if (cell.textContent && cell.textContent.includes(currentCorpNr)) {
            return true;
          }
        }
      }
      return false;
    }
    /* ====== PPI's AUDIO CREATION ======== */
    function playGenericSirene(type, gridId, level, occurrenceType = null) {
      let fileName = '';
      let soundFolder = '';
      switch (type) {
        case 'A22':
          soundFolder = 'A22';
          const mapTypesA22 = {"Acidente": "Acidente", "Substâncias Perigosas": "SubstanciasPerigosas", "Incêndio em Transportes": "IncendioTransportes"};
          const mapAlarmsA22 = {"1º Alarme": "1Alarme", "2º Alarme": "2Alarme", "Alarme Especial": "AlarmeEspecial"};
          fileName = `${gridId}-${mapTypesA22[occurrenceType]}-${mapAlarmsA22[level]}.mp3`;
          break;
        case 'Aeroporto':
          soundFolder = 'Aeroporto';
          fileName = `${gridId}-${level}.mp3`;
          break;
        case 'LinhaFerrea':
          soundFolder = 'LinhaFerrea';
          const mapTypesLinFer = {"Acidente - Abalroamento, Choque e Descarrilamento": "Acidente", "Substâncias Perigosas - Produtos Químicos/Produtos Biológicos": "SubstanciasPerigosas", "Incêndio em Transportes": "IncendioTransportes"};
          const mapAlarmsLinFer = {"1º Alarme": "1Alarme", "2º Alarme": "2Alarme", "Alarme Especial": "AlarmeEspecial"};
          fileName = `${gridId}-${mapTypesLinFer[occurrenceType]}-${mapAlarmsLinFer[level]}.mp3`;
          break;
        default:
          console.error(`Tipo de PPI não reconhecido: ${type}`);
          return;
      }
      const audioPath = `https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/sounds/${soundFolder}/${fileName}`;
      const audio = new Audio(audioPath);
      audio.play()
        .then(() => console.log(`▶️ A tocar: ${fileName}`))
        .catch(err => console.error("Erro ao tocar áudio:", err));
    }

    function createAudioButton(type, gridId, level, occurrenceType = null, customTitle = null) {
      const btn = document.createElement("button");
      btn.textContent = "🔊";
      btn.title = customTitle || `Toque rápido ${level}`;
      btn.style.cursor = "pointer";
      btn.onclick = (e) => {
        e.stopPropagation();
        playGenericSirene(type, gridId, level, occurrenceType);
      };
      return btn;
    }
    /* ==== PPI's REFERENCE NOTE ULS ====== */
    function createFinalHTable(container) {
      if (container.querySelector(".ppi-final-table")) {
        return;
      }
      const finalTable = document.createElement("table");
      finalTable.classList.add("table-elements", "ppi-final-table");
      finalTable.style.cssText = FINAL_H_TABLE_STYLE;
      const trFinal = document.createElement("tr");
      const tdH = document.createElement("td");
      tdH.textContent = "H";
      tdH.style.cssText = FINAL_H_CELL_STYLE;
      const tdText = document.createElement("td");
      tdText.textContent = "ULS, EPE ou de acordo com a Autoridade de Saúde no local, ou a definir pelo CODU/INEM.";
      tdText.style.cssText = FINAL_H_TEXT_STYLE;
      trFinal.appendChild(tdH);
      trFinal.appendChild(tdText);
      finalTable.appendChild(trFinal);
      container.appendChild(finalTable);
    }
    /* = PPI's WITH/WITHOUT INTERVENTION == */
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
      if (isIntervention) {
        notice.style.backgroundColor = "#229941";
        notice.style.color = "#fff";
        notice.textContent = "COM INTERVENÇÃO DO CORPO DE BOMBEIROS";
      } else {
        notice.style.backgroundColor = "#cc1d1d";
        notice.style.color = "#f2b30a";
        notice.textContent = "SEM INTERVENÇÃO DO CORPO DE BOMBEIROS";
      }
    }
    /* ==== PPI's HIGHLIGHT SPECIALS ====== */    
    function formatSpecialsContentWithHighlights(text) {
      if (!text) return "";
      let formattedText = text.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");
      HIGHLIGHT_WORDS.sort((a, b) => b.length - a.length);
      HIGHLIGHT_WORDS.forEach(word => {
        const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escapedWord})`, "gi");
        formattedText = formattedText.replace(regex, "<b>$1</b>");
      });
      return formattedText;
    }
    /* ===== PPI's CLEAN CONTAINERS ======= */    
    function clearPPIContainers(ppiPrefix) {
      const ids = [`${ppiPrefix}-grid-references`, `${ppiPrefix}-grid-container`, `${ppiPrefix}-specials-container`, `${ppiPrefix}-abs-note`];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
      });
    }

    function resetModulePage(modulePrefix) {
      const mainOptions = document.getElementById(`${modulePrefix}-main-options`);
      const gridControls = document.getElementById(`${modulePrefix}-grid-controls`);
      const gridReferences = document.getElementById(`${modulePrefix}-grid-references`);
      const gridContainer = document.getElementById(`${modulePrefix}-grid-container`);
      const specialsContainer = document.getElementById(`${modulePrefix}-specials-container`);
      const absNote = document.getElementById(`${modulePrefix}-abs-note`);
      if (mainOptions) mainOptions.style.display = "flex";
      if (gridControls) gridControls.style.display = "none";
      if (gridReferences) gridReferences.innerHTML = "";
      if (gridContainer) gridContainer.innerHTML = "";
      if (specialsContainer) specialsContainer.innerHTML = "";
      if (absNote) absNote.innerHTML = "";
      const controlButtons = gridControls ? gridControls.querySelectorAll("button") : [];
      controlButtons.forEach(b => b.classList.remove("active"));
    }
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetPage = btn.getAttribute("data-page");
        switch (targetPage) {
          case "page-ppia22":
            resetModulePage("ppia22");
            break;
          case "page-ppilinfer":
            resetModulePage("ppilinfer");
            break;
        }
      });
    });
    /* =======================================
    JAVA SCRIPT PPI A22
    ========================================*/
    /* == PPI A22 RENDER TYPE KILOMETER === */    
    function consultationGridA22KmType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      ShowA22KmControls();
    }

    function createKmDirectionButtons() {
      const dirRow = document.createElement("div");
      dirRow.style.display = "flex";
      dirRow.style.gap = "10px";
      const directions = [{id: "O-E", line1: "OESTE - ESTE", line2: "Lagos → VRSA"}, {id: "E-O", line1: "ESTE - OESTE", line2: "VRSA → Lagos"}];
      directions.forEach(d => {
        const btn = document.createElement("button");
        btn.id = "km-dir-" + d.id;
        btn.className = "btn btn-add";
        Object.assign(btn.style, {width: "160px", height: "50px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontWeight: "bold"});
        const l1 = document.createElement("div");
        l1.textContent = d.line1;
        l1.style.fontSize = "14px";
        const l2 = document.createElement("div");
        l2.textContent = d.line2;
        l2.style.fontSize = "11px";
        l2.style.fontWeight = "normal";
        btn.append(l1, l2);
        btn.onclick = () => {
          const isActive = btn.classList.contains("active");
          document.querySelectorAll("#ppia22-grid-controls .btn")
            .forEach(b => b.classList.remove("active"));
          if (!isActive) btn.classList.add("active");
        };
        dirRow.appendChild(btn);
      });
      return dirRow;
    }

    function createKmInput() {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Introduza o Quilómetro";
      input.id = "ppia22-km-input";
      Object.assign(input.style, {padding: "8px", width: "160px", textAlign: "center", border: "1px solid #ccc", borderRadius: "4px", transition: "all 0.2s ease", outline: "none",});
      input.addEventListener("focus", () => {
        input.style.borderColor = "#ccc";
        input.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";
      });
      input.addEventListener("blur", () => {
        input.style.borderColor = "#ccc";
        input.style.boxShadow = "none";
      });
      input.addEventListener("input", () => {
        let val = input.value.replace(",", ".").replace(/[^\d.]/g, "");
        const parts = val.split(".");
        if (parts.length > 2) val = parts[0] + "." + parts[1].slice(0, 2);
        else if (parts[1]) parts[1] = parts[1].slice(0, 2);
        if (parts[1]) val = parts[0] + "." + parts[1];
        input.value = val.slice(0, 6);
      });
      return input;
    }

    function ShowA22KmControls() {
      const container = document.getElementById("ppia22-grid-controls");
      if (!container) return;
      container.style.display = "block";
      container.innerHTML = "";
      const card = document.createElement("div");
      card.className = "main-card";
      Object.assign(card.style, {display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px", width: "400px", margin: "0 auto", marginBottom: "5px"});
      const title = document.createElement("label");
      title.textContent = "Selecione o Sentido";
      Object.assign(title.style, {fontSize: "16px", fontWeight: "bold"});
      card.appendChild(title);
      card.appendChild(createKmDirectionButtons());
      const inputKm = createKmInput();
      card.appendChild(inputKm);
      const btnSearch = document.createElement("button");
      btnSearch.textContent = "Procurar";
      btnSearch.className = "btn btn-add";
      btnSearch.style.width = "150px";
      btnSearch.onclick = async () => {
        const kmStr = inputKm.value.trim();
        const activeDir = document.querySelector("#ppia22-grid-controls .btn.active");
        if (!activeDir) return showPopupWarning("⚠️ Selecione o sentido primeiro!");
        if (!kmStr || isNaN(parseFloat(kmStr))) return showPopupWarning("⚠️ Introduza um quilómetro válido!");
        const sentido = activeDir.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE";
        const km = parseFloat(kmStr);
        await loadPPIA22DataFromKm(km, sentido);
      };
      card.appendChild(btnSearch);
      container.appendChild(card);
    }
    async function loadPPIA22DataFromKm(km, sentido) {
      try {
        const data = await fetchFromSupabase("ppia22_data", `ppi_sence=eq.${sentido}`);
        const filtered = data.filter(ppi => {
          const firstKm = parseFloat((ppi.ppi_first_node.match(/km ([\d.,]+)/i)?.[1] || "0").replace(",", "."));
          const secondKm = parseFloat((ppi.ppi_secound_node.match(/km ([\d.,]+)/i)?.[1] || "0").replace(",", "."));
          const minKm = Math.min(firstKm, secondKm);
          const maxKm = Math.max(firstKm, secondKm);
          return km >= minKm && km <= maxKm;
        });
        if (!filtered.length) {
          showPopupWarning("⚠️ Nenhuma grelha encontrada para este quilómetro.");
          return;
        }
        const limiteGrelhas = filtered.filter(ppi => {
          const firstKm = parseFloat((ppi.ppi_first_node.match(/km ([\d.,]+)/i)?.[1] || "0").replace(",", "."));
          const secondKm = parseFloat((ppi.ppi_secound_node.match(/km ([\d.,]+)/i)?.[1] || "0").replace(",", "."));
          return km === firstKm || km === secondKm;
        });
        if (limiteGrelhas.length > 1) {
          const grelhas = limiteGrelhas
            .map(ppi => ppi.ppi_grid)
            .sort((a, b) => a.localeCompare(b));
          const grelhaOptions = grelhas.length === 2 ?
            grelhas.join(" e ") :
            grelhas.join(", ");
          showPopupWarning(
            `⚠️ O quilómetro <b style="color:red">${km.toFixed(2)}</b> corresponde ao limite entre duas grelhas, <b style="color:red">${grelhaOptions}</b>.<br>` +
            `Para garantir maior precisão na atribuição de meios, recomenda-se a consulta direta por grelha. Obrigado.`
          );
          return;
        }
        const gridContainer = document.getElementById("ppia22-grid-container");
        for (const ppi of filtered) {
          await loadPPIA22DataInfoGrid(ppi.ppi_grid);
          await loadPPIA22DataSpecials(ppi.ppi_grid);
          await loadPPIA22GridSeparated(ppi.ppi_grid);
          const tempContainer = gridContainer.firstChild;
          if (tempContainer) createFinalHTable(tempContainer);
          let absContainer = document.getElementById("ppia22-abs-note");
          if (!absContainer) {
            absContainer = document.createElement("div");
            absContainer.id = "ppia22-abs-note";
            absContainer.style.marginTop = "10px";
            document.getElementById("ppia22-grid-controls").parentNode.appendChild(absContainer);
          }
          ppia22ABSNoteTable(absContainer, ppi.ppi_grid);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }
    /* === PPI A22 RENDER BUTTON TYPE ===== */    
    function consultationGridA22ButtonType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      document.getElementById("ppia22-grid-controls").style.display = "block";
      ShowA22GridButtons();
    }

    function createRowA22SenceTitle(justify = "flex-start") {
      const row = document.createElement("div");
      row.className = "form-row";
      row.style.display = "flex";
      row.style.justifyContent = justify;
      row.style.margin = "0";
      return row;
    }

    function createA22SenceTitle(text, isTop) {
      const row = createRowA22SenceTitle("center");
      row.style.cssText = A22_TITLE_STYLE;
      row.style.borderRadius = isTop ? "3px 3px 0 0" : "0 0 3px 3px";
      const label = document.createElement("label");
      label.textContent = text;
      row.appendChild(label);
      return row;
    }

    function createA22GridButtons(id, specialButtons) {
      const btn = document.createElement("button");
      btn.id = id;
      btn.textContent = id;
      btn.className = "btn btn-add";
      btn.style.cssText = A22_GRID_BUTTON_STYLE;
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (specialButtons.has(id) && currentCorpNr === "0805") {
        btn.classList.add("btn-special");
      }
      btn.onclick = (e) => {
        e.preventDefault();
        const isActive = btn.classList.contains("active");
        document
          .querySelectorAll("#ppia22-grid-controls button")
          .forEach(b => b.classList.remove("active"));
        if (isActive) {
          clearPPIContainers("ppia22");
        } else {
          btn.classList.add("active");
          loadPPIA22DataFromButton(id);
        }
      };
      return btn;
    }

    function ShowA22GridButtons() {
      const container = document.getElementById("ppia22-grid-controls");
      if (!container) return;
      container.style.cssText = A22_GRID_CONTAINER_STYLE;
      container.innerHTML = "";
      const directions = [{label: "SENTIDO OESTE - ESTE", sublabel: "(Lagos - Vila Real de Santo António)", prefix: "1"},
                          {label: "SENTIDO ESTE - OESTE", sublabel: "(Vila Real de Santo António - Lagos)", prefix: "2"}];
      const specialButtons = new Set(["1M", "1N", "1O", "1P", "1Q", "1R", "2J", "2K", "2L", "2M", "2N", "2O", "2P"]);
      directions.forEach(dir => {
        container.appendChild(createA22SenceTitle(dir.label, true));
        container.appendChild(createA22SenceTitle(dir.sublabel, false));
        const rowButtons = createRowA22SenceTitle("center");
        for (let i = 0; i < 19; i++) {
          const id = `${dir.prefix}${String.fromCharCode(65 + i)}`;
          rowButtons.appendChild(createA22GridButtons(id, specialButtons));
        }
        container.appendChild(rowButtons);
      });
    }
    /* ====== PPI A22 LOAD GRID DATA ====== */    
    async function loadPPIA22DataFromButton(buttonId) {
      await loadPPIA22DataInfoGrid(buttonId);
      await loadPPIA22DataSpecials(buttonId);
      await loadPPIA22GridSeparated(buttonId);
      const tempContainer = document.getElementById("ppia22-grid-container")?.firstChild;
      if (tempContainer) createFinalHTable(tempContainer);
      let absContainer = document.getElementById("ppia22-abs-note");
      if (!absContainer) {
        absContainer = document.createElement("div");
        absContainer.id = "ppia22-abs-note";
        absContainer.style.marginTop = "10px";
        document
          .getElementById("ppia22-grid-controls")
          .parentNode.appendChild(absContainer);
      }
      ppia22ABSNoteTable(absContainer, buttonId);
    }
    /* ===== PPI A22 LOAD INFO TABLE ====== */
    async function loadPPIA22DataInfoGrid(gridId) {
      const container = document.getElementById("ppia22-grid-references");
      if (!container) return;
      ensureLoadingMarker(container);
      const loading = container.querySelector(".loading-mark");
      loading.style.display = "block";
      try {
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        const data = await fetchFromSupabase("ppia22_data", `ppi_grid=eq.${gridId}`);
        const refs = await fetchFromSupabase("ppia22_references", `grid_code=eq.${gridId}`);
        const refIds = refs.map(r => r.id);
        let means = [];
        if (refIds.length) {
          means = await fetchFromSupabase("ppia22_means", `reference_id=in.(${refIds.join(",")})`);
        }
        const hasIntervention = currentCorpNr && means.some(
          m => typeof m.means === "string" && m.means.includes(currentCorpNr)
        );
        createOrUpdateInterventionNotice(container, hasIntervention);
        if (!data.length) return renderNoData(container);
        const ppi = data[0];
        let table = container.querySelector("table");
        if (!table) {
          table = document.createElement("table");
          table.className = "table-elements";
          table.style.cssText = A22_TABLE_STYLE;
          container.appendChild(table);
        }
        table.innerHTML = "";
        table.appendChild(createColGroup(["260px", "262px", "calc(33% - 40px)", "calc(33% - 40px)"]));
        const tr1 = document.createElement("tr");
        tr1.append(
          createCell(`GRELHA ${ppi.ppi_grid} - CB`, {rowSpan: 2, bold: true, center: true}),
          createDirectionCell(ppi),
          createCell("TROÇO", {colSpan: 2, bold: true, center: true})
        );
        table.appendChild(tr1);
        const tr2 = document.createElement("tr");
        tr2.append(
          createNodeCell(ppi.ppi_first_node),
          createNodeCell(ppi.ppi_secound_node)
        );
    table.appendChild(tr2);

    [
      ["COORDENADAS LAT/LONG", ppi.ppi_first_coordinate, ppi.ppi_secound_coordinate],
      ["ALTITUDE (m)", ppi.ppi_first_height, ppi.ppi_secound_height],
      ["Ponto de Trânsito (PT) / Local de Reforço Tático (LRT)", ppi.ppi_ptlrt_coordinates, ppi.ppi_ptlrt_coordinates]
    ].forEach(([label, left, right], index) => {
      const tr = document.createElement("tr");

      const tdLabel = document.createElement("td");
      tdLabel.colSpan = 2;
      tdLabel.style.cssText = A22_LABEL_CELL_STYLE;
      tdLabel.textContent = label || "";

      const tdLeft = document.createElement("td");
      tdLeft.textContent = left || "";
      tdLeft.style.cssText = A22_CELL_STYLE;

      if (index === 2) {
        tdLeft.colSpan = 2;
        tr.append(tdLabel, tdLeft);
      } else {
        const tdRight = document.createElement("td");
        tdRight.textContent = right || "";
        tdRight.style.cssText = A22_CELL_STYLE;
        tr.append(tdLabel, tdLeft, tdRight);
      }
      table.appendChild(tr);
    });
      } catch (err) {
        console.error("❌ Erro ao carregar PPI data:", err);
        showError(container, "Erro ao carregar PPI data. Veja o console.");
      } finally {
        loading.style.display = "none";
      }
    }
    /* ====== PPI A22 AUX FUNCTIONS ======= */    
    function ensureLoadingMarker(container) {
      if (!container.querySelector(".loading-mark")) {
        const lm = document.createElement("div");
        lm.className = "loading-mark";
        lm.style.display = "none";
        container.appendChild(lm);
      }
    }
    async function fetchFromSupabase(table, filter) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=*&${filter}`, {
          headers: getSupabaseHeaders()
        }
      );
      if (!res.ok) throw new Error(`Erro ao buscar ${table}: ${res.status}`);
      return res.json();
    }
    
    function renderNoData(container) {
      container.querySelector("table")?.remove();
      let noData = container.querySelector(".no-data-msg");
      if (!noData) {
        noData = document.createElement("div");
        noData.className = "no-data-msg";
        noData.style.padding = "10px 0";
        container.appendChild(noData);
      }
      noData.textContent = "Sem dados na tabela ppi_data.";
    }
    
    function showError(container, message) {
      let errDiv = container.querySelector(".data-error");
      if (!errDiv) {
        errDiv = document.createElement("div");
        errDiv.className = "data-error";
        errDiv.style.color = "red";
        errDiv.style.padding = "8px 0";
        container.appendChild(errDiv);
      }
      errDiv.textContent = message;
    }
    
    function createColGroup(widths) {
      const colgroup = document.createElement("colgroup");
      widths.forEach(w => {
        const col = document.createElement("col");
        col.style.width = w;
        colgroup.appendChild(col);
      });
      return colgroup;
    }
    
    function createCell(text, {colSpan = 1, rowSpan = 1, bold = false, center = false} = {}) {
      const td = document.createElement("td");
      td.colSpan = colSpan;
      td.rowSpan = rowSpan;
      td.textContent = text || "";
      td.style.cssText = bold ? A22_CELL_STYLE : A22_CELL_STYLE_NORMAL;
      td.style.textAlign = center ? "center" : "inherit";
      return td;
    }
    
    function createDirectionCell(ppi) {
      const td = createCell("", {rowSpan: 2, center: true});
      const top = document.createElement("div");
      top.textContent = "SENTIDO";
      top.style.cssText = A22_DIRECTION_TOP_STYLE;
      const mid = document.createElement("div");
      mid.textContent = ppi.ppi_sence;
      mid.style.cssText = A22_DIRECTION_MID_STYLE;
      const bot = document.createElement("div");
      bot.textContent = ppi.ppi_direction;
      bot.style.cssText = A22_DIRECTION_BOT_STYLE;
      td.append(top, mid, bot);
      return td;
    }
    
    function createNodeCell(nodeStr = "") {
      const [main, km] = nodeStr.split("(");
      const td = createCell("", {bold: true, center: true});
      td.innerHTML = `${main || ""}<span style="${A22_NODE_KM_STYLE}">(${km || ""}</span>`;
      return td;
    }
    /* == PPI A22 LOAD SPECIAL STUATIONS == */    
    async function loadPPIA22DataSpecials(gridId) {
      const infoContainer = document.getElementById("ppia22-grid-references");
      if (!infoContainer) return;
      let container = document.getElementById("ppia22-specials-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "ppia22-specials-container";
        infoContainer.parentNode.insertBefore(container, infoContainer.nextSibling);
      } else if (container.nextSibling !== infoContainer.nextSibling) {
        infoContainer.parentNode.insertBefore(container, infoContainer.nextSibling);
      }
      if (!container.querySelector(".ppia22-title")) {
        const titleDiv = document.createElement("div");
        titleDiv.textContent = "SITUAÇÕES ESPECIAIS";
        Object.assign(titleDiv.style, {backgroundColor: "#fff3b0", fontWeight: "bold", textAlign: "center", padding: "4px", margin: "-5px 0 -1px 0", border: "1px solid #bbb"});
        titleDiv.classList.add("ppia22-title");
        container.appendChild(titleDiv);
      }
      let dataContainer = container.querySelector(".ppia22-data");
      if (!dataContainer) {
        dataContainer = document.createElement("div");
        dataContainer.classList.add("ppia22-data");
        container.appendChild(dataContainer);
      }
      try {
        const specials = await fetchFromSupabase(
          "ppia22_specials",
          `grid_code=eq.${gridId}&order=part,row_order,col`
        );
        if (!specials.length) {
          dataContainer.innerHTML = "Sem informações especiais para esta grelha.";
          return;
        }
        const part1 = specials.filter(s => s.part === 1);
        let p1Div = dataContainer.querySelector(".ppia22-part1");
        if (!p1Div) {
          p1Div = document.createElement("div");
          Object.assign(p1Div.style, {border: "1px solid #bbb", padding: "0 0 0 8px", marginBottom: "-5px", textAlign: "left"});
          p1Div.classList.add("ppia22-part1");
          dataContainer.appendChild(p1Div);
        }
        p1Div.innerHTML = part1.map(s => formatSpecialsContentWithHighlights(s.content)).join("<br>");
        const part2 = specials.filter(s => s.part === 2);
        let table = dataContainer.querySelector("table");
        if (!table) {
          table = document.createElement("table");
          table.classList.add("table-elements");
          Object.assign(table.style, {width: "100%", borderCollapse: "collapse", margin: "4px 0 5px 0"});
          dataContainer.appendChild(table);
        }
        const rowsMap = groupByRow(part2);
        const tbody = table.tBodies[0] || table.createTBody();
        syncRowCount(tbody, Object.keys(rowsMap).length);
        Object.entries(rowsMap).forEach(([_, cols], idx) => {
          renderSpecialRow(tbody.rows[idx], cols);
        });
      } catch (err) {
        console.error("❌ Erro ao carregar specials PPIA22:", err);
        dataContainer.innerHTML = "Erro ao carregar informações especiais. Veja o console.";
      }
    }
    async function fetchFromSupabase(table, filter) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&${filter}`, {
        headers: getSupabaseHeaders()
      });
      if (!res.ok) throw new Error(`Erro ao buscar ${table}: ${res.status}`);
      return res.json();
    }

    function groupByRow(data) {
      return data.reduce((acc, s) => {
        acc[s.row_order] ??= {};
        acc[s.row_order][s.col] = s.content;
        return acc;
      }, {});
    }

    function syncRowCount(tbody, targetCount) {
      while (tbody.rows.length < targetCount) tbody.insertRow();
      while (tbody.rows.length > targetCount) tbody.deleteRow(-1);
    }

    function renderSpecialRow(tr, rowCols) {
      const col1 = rowCols[1] || "";
      const col2 = rowCols[2] || "";
      if ((col1 && !col2) || (!col1 && col2)) {
        tr.innerHTML = "";
        const td = tr.insertCell();
        td.colSpan = 2;
        applySpecialsCellStyle(td);
        td.innerHTML = formatSpecialsContentWithHighlights(col1 || col2);
        return;
      }
      while (tr.cells.length < 2) tr.insertCell();
      while (tr.cells.length > 2) tr.deleteCell(-1);
      [col1, col2].forEach((content, i) => {
        const td = tr.cells[i];
        applySpecialsCellStyle(td);
        td.colSpan = 1;
        td.innerHTML = formatSpecialsContentWithHighlights(content);
      });
    }

    function applySpecialsCellStyle(td) {
      Object.assign(td.style, {border: "1px solid #bbb", padding: "0 0 0 8px", textAlign: "left", verticalAlign: "top"});
    }
    /* = PPI A22 PAGINATION +1000 RECORDS = */
    async function fetchAllMeans() {
      const all = [];
      let start = 0;
      const pageSize = 1000;
      while (true) {
        const end = start + pageSize - 1;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ppia22_means?select=*`, {
          headers: {
            ...getSupabaseHeaders(),
            Range: `${start}-${end}`
          }
        });
        if (!res.ok) throw new Error(`Erro ao buscar ppia22_means: ${res.status}`);
        const chunk = await res.json();
        all.push(...chunk);
        if (chunk.length < pageSize) break;
        start += pageSize;
      }
      return all;
    }
    /* ===== PPI A22 LOAD GRIDS 1A-2S ===== */    
    async function loadPPIA22GridSeparated(gridId) {
      const container = document.getElementById("ppia22-grid-container");
      if (!container) return;
      const tempContainer = document.createElement("div");
      tempContainer.style.display = "none";
      try {
        const references = await fetchFromSupabase("ppia22_references", `grid_code=eq.${gridId}`);
        if (!references.length) return;
        const means = await fetchRelevantMeans(references.map(r => r.id));
        const occurrenceTypes = {"Acidente": "#a5d6a7", "Substâncias Perigosas": "#ffcc80", "Incêndio em Transportes": "#90caf9"};
        for (const [type, bgColor] of Object.entries(occurrenceTypes)) {
          const refs = references.filter(r => r.occurrence_type === type);
          if (!refs.length) continue;
          tempContainer.appendChild(createA22Header(`TIPO DE OCORRÊNCIA: ${type}`, bgColor));
          const table = document.createElement("table");
          table.classList.add("table-elements");
          Object.assign(table.style, {tableLayout: "fixed", width: "100%", marginBottom: "10px"});
          table.appendChild(createColGroup(["80px", "calc(33% - 40px)", "80px", "calc(33% - 40px)", "33%"]));
          const thead = table.createTHead();
          thead.appendChild(createTableHeaderRow(refs, means, gridId, type));
          const tbody = table.createTBody();
          refs.forEach(ref => {
            const firstAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "1º Alarme").sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
            const secondAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "2º Alarme").sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
            const specialAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "Alarme Especial").sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
            const maxRows = Math.max(firstAlarm.length, secondAlarm.length, specialAlarm.length);
            let skipFirst = {count: 0};
            let skipSecond = {count: 0};
            for (let i = 0; i < maxRows; i++) {
              const tr = tbody.insertRow();
              renderGenericAlarmCells(tr, firstAlarm, i, skipFirst);
              renderGenericAlarmCells(tr, secondAlarm, i, skipSecond);
              if (i === 0) {
                const tdSpecial = tr.insertCell();
                tdSpecial.rowSpan = maxRows;
                applyTdStyle(tdSpecial, true);
                tdSpecial.textContent = specialAlarm.map(m => m.means).join(", ") || "-";
              }
            }
          });
          table.appendChild(tbody);
          tempContainer.appendChild(table);
        }
        container.innerHTML = "";
        container.appendChild(tempContainer);
        tempContainer.style.display = "block";
        createOrUpdateCumulativeAlert(tempContainer);
      } catch (err) {
        console.error("❌ Erro ao carregar grelha PPI A22:", err);
        container.textContent = "Erro ao carregar grelha. Veja o console.";
      }
    }
    
    async function fetchRelevantMeans(ids) {
      if (!ids.length) return [];
      return fetchFromSupabase("ppia22_means", `reference_id=in.(${ids.join(",")})`);
    }
    
    function createA22Header(text, bgColor) {
      const h3 = document.createElement("h3");
      h3.textContent = text;
      Object.assign(h3.style, {fontSize: "15px", fontWeight: "bold", margin: "10px 0 0 0", padding: "3px 5px", backgroundColor: bgColor, color: "black", borderRadius: "2px"});
      return h3;
    }
    
    function createTableHeaderRow(refs, means, gridId, type) {
      const tr = document.createElement("tr");
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr"); 
      ["1º Alarme", "2º Alarme", "Alarme Especial"].forEach(level => {
        const th = document.createElement("th");
        th.style.textAlign = "center";
        th.style.padding = "4px";
        if (level === "1º Alarme") th.style.backgroundColor = "yellow";
        if (level === "2º Alarme") th.style.backgroundColor = "orange";
        if (level === "Alarme Especial") th.style.backgroundColor = "red";
        th.style.color = level === "Alarme Especial" ? "white" : "black";
        if (level !== "Alarme Especial") th.colSpan = 2;
        const hasCB = currentCorpNr && refs.some(ref =>means.some(m => m.reference_id === ref.id && m.alarm_level === level && m.means?.includes(currentCorpNr)));
        if (hasCB) {
          const wrapper = document.createElement("div");
          Object.assign(wrapper.style, {display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px"});
          const titleDiv = document.createElement("div");
          titleDiv.textContent = level; titleDiv.style.flex = "1";
          titleDiv.style.textAlign = "center";
          const btn = createAudioButton('A22', gridId, level, type, `Toque rápido ${level}`);
          btn.style.marginLeft = "8px";
          wrapper.appendChild(titleDiv);
          wrapper.appendChild(btn);
          th.innerHTML = "";
          th.appendChild(wrapper);
        } else {
          th.textContent = level;
        }
        tr.appendChild(th);
      });
      return tr;
    }
    
    function renderAlarmCell(tr, alarmMeans, idx, colSpan = 1, center = false) {
      const td = tr.insertCell();
      td.colSpan = colSpan;
      applyTdStyle(td, center);
      if (alarmMeans[idx]) td.textContent = alarmMeans[idx].means;
    }
    
    function applyTdStyle(td, center = false) {
      Object.assign(td.style, {border: "1px solid #bbb", padding: "4px", textAlign: center ? "center" : "left", verticalAlign: center ? "middle" : "top"});
    }
    /* ======= PPI A22 ABSC's NOTE ======== */
    function ppia22ABSNoteTable(container, buttonId) {
      if (!container || !buttonId || buttonId.length < 2) return;
      const dir = buttonId[0];
      const index = buttonId[1].toUpperCase().charCodeAt(0) - 65;
      let number;
      if (dir === '1') number = (index <= 1) ? 1 : (index >= 17 ? index : index);
      else if (dir === '2') number = (index === 0) ? 1 : (index >= 16 ? 18 : index + 1);
      container.innerHTML = "";
      const table = document.createElement("table");
      table.classList.add("table-elements");
      Object.assign(table.style, {
        width: "100%",
        marginTop: "-5px",
        borderCollapse: "collapse",
        lineHeight: "15px"
      });
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.textContent = `* As ABSC a despacho para o PPI da Via do Infante de Sagres, não devem ser as afetas ao PEM do INEM, sendo complementares às mobilizadas pelo CODU do INEM (GRELHA ${number} INEM)`;
      Object.assign(td.style, {
        padding: "5px",
        textAlign: "left",
        border: "1px solid #bbb"
      });
      tr.appendChild(td);
      table.appendChild(tr);
      container.appendChild(table);
    }
    /* =======================================
       JAVA SCRIPT AEROPORTO
    ========================================*/
    /* === PPI AERO RENDER BUTTON TYPE ==== */
    document.addEventListener("DOMContentLoaded", renderAeroCustomButtons);
    function renderAeroCustomButtons() {
      const container = document.getElementById("ppiaero-grid-controls");
      if (!container) return;
      container.innerHTML = "";
      const buttonsData = [{id: "A1", label: "11 a 20 Pessoas"}, {id: "A2", label: "21 a 30 Pessoas"}, {id: "A3", label: "31 a 100 Pessoas"}, {id: "A4", label: "+ de 101 Pessoas"}, {id: "B1", label: "Queda Declarada"}];
      const labelDiv = document.createElement("div");
      labelDiv.textContent = "GRELHAS DE ALARME";
      Object.assign(labelDiv.style, AERO_LABEL_STYLE);
      container.appendChild(labelDiv);
      const rowButtons = document.createElement("div");
      Object.assign(rowButtons.style, AERO_ROW_STYLE);
      buttonsData.forEach(btnData => {
        const btn = document.createElement("button");
        btn.id = btnData.id;
        btn.className = "btn btn-add";
        btn.textContent = `${btnData.id} (${btnData.label})`;
        Object.assign(btn.style, {...AERO_BUTTON_STYLE, background: getButtonBg(btnData.id), color: getButtonColor(btnData.id)});
        btn.addEventListener("click", e => handleAeroButtonClick(e, btn, btnData));
        rowButtons.appendChild(btn);
      });
      container.appendChild(rowButtons);
    }
    
    function getButtonBg(id) {
      return id==="B1" ? "black" : id==="A1" ? "green" : id==="A2" ? "yellow" : id==="A3" ? "orange" : "red";
    }
    
    function getButtonColor(id) {
      return id==="B1" ? "red" : id==="A2"||id==="A3" ? "black" : "white";
    }
    
    function handleAeroButtonClick(event, btn, btnData) {
      event.preventDefault();
      const isActive = btn.classList.contains("active");
      document.querySelectorAll("#ppiaero-grid-controls button").forEach(b => b.classList.remove("active"));
      if (isActive) {
        document.getElementById("ppiaero-grid-container").innerHTML = "";
        ["ppiaero-grid-header", "ppiaero-grid-info"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = "none";
        });
        return; 
      }
      btn.classList.add("active");
      if (btn.id === "B1") loadPPIAeroGridB1(btn.id);
      else loadPPIAeroGridSeparated(btn.id);
      ppiaeroHeaderTable(btn.id, btnData.label);
      ppiaeroInfoTable();
    }
    /* ==== PPI AERO LOAD HEADER TABLE ==== */     
    function ppiaeroHeaderTable(gridId, label) {
      const container = document.getElementById("ppiaero-grid-info-container");
      if (!container) return;
      let table = document.getElementById("ppiaero-grid-header");
      if (!table) {
        table = document.createElement("table");
        table.id = "ppiaero-grid-header";
        Object.assign(table.style, AERO_HEADER_TABLE_STYLE);
        container.prepend(table);
      }
      table.innerHTML = "";
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      Object.assign(td.style, AERO_HEADER_CELL_STYLE);
      td.textContent = gridId==="B1" ?
        `Grelha de Alarmes dos Corpos de Bombeiros - ${gridId} - Queda Declarada de Aeronave` :
        `Grelha de Alarmes dos Corpos de Bombeiros - ${gridId} - Aeronave com (${label} a Bordo)`;
      tr.appendChild(td);
      table.appendChild(tr);
      table.style.display = "table";
    }
    /* ===== PPI AERO LOAD INFO TABLE ===== */    
    function ppiaeroInfoTable() {
      const container = document.getElementById("ppiaero-grid-info-container");
      if (!container) return;
      let table = document.getElementById("ppiaero-grid-info");
      if (!table) {
        table = document.createElement("table");
        table.id = "ppiaero-grid-info";
        Object.assign(table.style, AERO_INFO_TABLE_STYLE);
        const colgroup = document.createElement("colgroup");
        const col1 = document.createElement("col"); col1.style.width="17%";
        const col2 = document.createElement("col"); col2.style.width="83%";
        colgroup.appendChild(col1); colgroup.appendChild(col2);
        table.appendChild(colgroup);
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.textContent = "GRELHA DE ALARME PARA OS CORPOS DE BOMBEIROS";
        Object.assign(td1.style, {...AERO_CELL_STYLE, textAlign:"center", backgroundColor:"orange", color:"black", fontWeight:"bold"});
        const td2 = document.createElement("td");
        td2.textContent = "Esta grelha aplica-se aos cenários de proteção e socorro. Podendo aplicar-se aos restantes cenários definidos pelo PAE Gago Coutinho - Faro, Algarve, desde que solicitado pelas forças de segurança ao CRERPC.";
        Object.assign(td2.style, {...AERO_CELL_STYLE, textAlign:"left", fontWeight:"bold"});
        tr.appendChild(td1); tr.appendChild(td2);
        table.appendChild(tr);
        container.appendChild(table);
      }
      table.style.display = "table";
    }
    /* ======== PPI AERO AUX CELLS ======== */    
    function splitMeans(means){
      let meio="", corp="";
      if(!means) return {meio, corp};
      if(means.includes("**")) [meio, corp] = means.split("**").map((s,i)=>i?s.trim():s+"**");
      else if(means.includes("*")) [meio, corp] = means.split("*").map((s,i)=>i?s.trim():s+"*");
      else [meio, corp] = (means.trim().split(/\s+(.+)/)||["",""]).map(s=>s||"");
      return {meio, corp};
    }
    
    function renderPPIAeroAlarmCells(tr, item){
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      let meio="", corp="";
      if(item?.means) ({meio, corp} = splitMeans(item.means));
      const createCell = (text)=>{
        const td = document.createElement("td");
        td.textContent = text;
        Object.assign(td.style, AERO_CELL_STYLE);
        return td;
      }
      const td1 = createCell(meio);
      const td2 = createCell(corp);
      if(currentCorpNr && corp.includes(currentCorpNr)) [td1,td2].forEach(td=>Object.assign(td.style,{backgroundColor:"#839ec9", color:"white", fontWeight:"bold"}));
      tr.appendChild(td1); tr.appendChild(td2);
    }
    
    function appendReservaCell(tr){
      const td = document.createElement("td");
      td.textContent = "RESERVA";
      td.colSpan = 2;
      Object.assign(td.style, AERO_RESERVA_CELL_STYLE);
      tr.appendChild(td);
    }
    
    function appendEmptyCells(tr, count){
      for(let i=0;i<count;i++){
        const td = document.createElement("td");
        td.textContent="";
        Object.assign(td.style, {border:"1px solid #bbb"});
        tr.appendChild(td);      
      }
    }
    
    function appendPPIAeroCells(tr, item){
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if(!item) return appendEmptyCells(tr,2);
      const {meio, corp} = splitMeans(item.means);
      [meio, corp].forEach(content=>{
        const td = document.createElement("td");
        td.textContent=content;
        Object.assign(td.style, AERO_CELL_STYLE);
        if(currentCorpNr && corp.includes(currentCorpNr)) Object.assign(td.style,{backgroundColor:"#839ec9", color:"white", fontWeight:"bold"});
        tr.appendChild(td);
      });
    }
    /* === PPI AERO FETCH E SORTING AUX === */    
    async function fetchJSON(url) {
      const res = await fetch(url, { headers: getSupabaseHeaders() });
      if (!res.ok) throw new Error(`Erro ao buscar ${url}: ${res.status}`);
      return res.json();
    }
    
    function sortedMeans(means, refId, alarmLevel) {
      return means
        .filter(m => m.reference_id === refId && (m.alarm_level || "").toUpperCase() === alarmLevel)
        .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
    }
    
    function createAeroHeaderRow(gridId) {
      const tr = document.createElement("tr");
      ["ALERTA AMARELO", "ALERTA VERMELHO"].forEach(title=>{
        const th = document.createElement("th");
        th.colSpan = 2;
        th.style.textAlign = "center";
        th.style.padding = "4px";
        th.style.fontWeight = "bold";
        th.style.backgroundColor = title.includes("AMARELO") ? "yellow" : "red";
        th.style.color = title.includes("AMARELO") ? "black" : "white";
        const wrapper = document.createElement("div");
        wrapper.style.display="flex";
        wrapper.style.alignItems="center";
        wrapper.style.justifyContent="space-between";
        wrapper.style.gap="6px";
        const titleDiv = document.createElement("div");
        titleDiv.textContent = title;
        titleDiv.style.flex = "1";
        titleDiv.style.textAlign="center";
        const btn = createAudioButton('Aeroporto', gridId, title, null, `Toque rápido ${title.split(" ")[1]}`);
        wrapper.appendChild(titleDiv);
        wrapper.appendChild(btn);
        th.innerHTML="";
        th.appendChild(wrapper);
        tr.appendChild(th);
      });
      return tr;
    }
    /* ==== PPI AERO LOAD GRIDS A1-A4 ===== */    
    async function loadPPIAeroGridSeparated(gridId){
      const container = document.getElementById("ppiaero-grid-container");
      if(!container) return;
      const tempContainer = document.createElement("div");
      tempContainer.style.display="none";
      try{
        const [references, means] = await Promise.all([
          fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_references?select=*&grid_code=eq.${gridId}`),
          fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_means?select=*`)]);
        const table = document.createElement("table");
        table.classList.add("table-elements");
        Object.assign(table.style, {tableLayout:"fixed", width:"100%", margin:"10px 0 5px 0"});
        const colgroup = document.createElement("colgroup");
        ["10%","40%","10%","40%"].forEach(w=>{const col=document.createElement("col"); col.style.width=w; colgroup.appendChild(col);});
        table.appendChild(colgroup);
        table.appendChild(createAeroHeaderRow(gridId));
        const tbody = document.createElement("tbody");
        references.forEach(ref=>{
          const amareloMeans = sortedMeans(means, ref.id, "AMARELO");
          const vermelhoMeans = sortedMeans(means, ref.id, "VERMELHO");
          const maxRows = Math.max(
            amareloMeans.length ? Math.max(...amareloMeans.map(m=>m.display_order??1)) : 0,
            vermelhoMeans.length ? Math.max(...vermelhoMeans.map(m=>m.display_order??1)) : 0
          );
          const reserveIndex = amareloMeans.length>1 ? Math.max(...amareloMeans.map(m=>m.display_order??1))-1 : null;
          for(let i=1;i<=maxRows;i++){
            const tr = document.createElement("tr");
            const aItem = amareloMeans.find(m=>(m.display_order??1)===i);
            const vItem = vermelhoMeans.find(m=>(m.display_order??1)===i);
            if(reserveIndex && i===reserveIndex && !aItem){
              appendReservaCell(tr);
              appendPPIAeroCells(tr, vItem);
            } else {
              appendPPIAeroCells(tr, aItem);
              appendPPIAeroCells(tr, vItem);
            }
            tbody.appendChild(tr);
          }
        });
        table.appendChild(tbody);
        tempContainer.appendChild(table);
        container.innerHTML="";
        tempContainer.style.display="block";
        container.appendChild(tempContainer);
        createOrUpdateCumulativeAlert(tempContainer);
        ppiaeroABSNoteTable(tempContainer);
      } catch(err){
        console.error("❌ Erro ao carregar grelha PPIAero:", err);
        container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    /* == PPI AERO LOAD SPECIAL GRID B1 === */    
    async function loadPPIAeroGridB1(gridId) {
      const container = document.getElementById("ppiaero-grid-container");
      if (!container) return;
      const tempContainer = document.createElement("div");
      tempContainer.style.display = "none";
      try {
        const references = await fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_references?select=*&grid_code=eq.${gridId}`);
        const means = await fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_means?select=*`);
        const table = document.createElement("table");
        table.classList.add("table-elements");
        Object.assign(table.style, AERO_B1_TABLE_STYLE);
        const colgroup = document.createElement("colgroup");
        AERO_B1_COL_STYLE.forEach(w => {
          const col = document.createElement("col");
          col.style.width = w;
          colgroup.appendChild(col);
        });
        table.appendChild(colgroup);
        const thead = document.createElement("thead");
        const trHead1 = document.createElement("tr");
        const th = document.createElement("th");
        th.colSpan = 4;
        Object.assign(th.style, AERO_B1_HEADER1_STYLE);
        const wrapper = document.createElement("div");
        Object.assign(wrapper.style, AERO_B1_WRAPPER_STYLE);
        const titleDiv = document.createElement("div");
        titleDiv.textContent = "ALERTA VERMELHO";
        Object.assign(titleDiv.style, AERO_B1_TITLE_DIV_STYLE);
        const btn = createAudioButton('Aeroporto', gridId, 'ALERTA VERMELHO', null, 'Toque rápido VERMELHO');
        wrapper.appendChild(titleDiv);
        wrapper.appendChild(btn);
        th.innerHTML = "";
        th.appendChild(wrapper);
        trHead1.appendChild(th);
        thead.appendChild(trHead1);
        const trHead2 = document.createElement("tr");
        ["Frente Aeroporto - Portaria do Aeroporto", "Frente Cidade - Parque Ribeirinho"].forEach(title => {
          const th = document.createElement("th");
          th.textContent = title;
          th.colSpan = 2;
          Object.assign(th.style, AERO_B1_HEADER2_STYLE);
          trHead2.appendChild(th);
        });
        thead.appendChild(trHead2);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        references.forEach(ref => {
          const aeroportoMeans = means.filter(m => m.reference_id === ref.id && m.alarm_level === "Frente Aeroporto - Portaria do Aeroporto")
          .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
          const cidadeMeans = means.filter(m => m.reference_id === ref.id && m.alarm_level === "Frente Cidade - Parque Ribeirinho")
          .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
          const maxRows = Math.max(aeroportoMeans.length, cidadeMeans.length);
          if (maxRows === 0) return;
          for (let i = 1; i <= maxRows; i++) {
            const tr = document.createElement("tr");
            const aeroItem = aeroportoMeans.find(m => (m.display_order ?? 1) === i);
            const cidadeItem = cidadeMeans.find(m => (m.display_order ?? 1) === i);
            renderPPIAeroAlarmCells(tr, aeroItem);
            renderPPIAeroAlarmCells(tr, cidadeItem);
            tbody.appendChild(tr);
          }
        });
        table.appendChild(tbody);
        tempContainer.appendChild(table);
        container.innerHTML = "";
        tempContainer.style.display = "block";
        container.appendChild(tempContainer);
        ppiaeroABSNoteTable(tempContainer);
      } catch (err) {
        console.error("❌ Erro ao carregar grelha B1:", err);
        container.textContent = "Erro ao carregar grelha. Veja o console.";
      }
    }
    /* ======= PPI AERO ABSC's NOTE ======= */
    function ppiaeroABSNoteTable(container){
      const singleTable = document.createElement("table");
      singleTable.classList.add("table-elements");
      Object.assign(singleTable.style, AERO_ABS_NOTE_STYLE);
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.style.padding="5px";
      td.style.textAlign="left";
      td.style.whiteSpace="pre-line";
      td.style.border="none";
      const line1 = document.createElement("span");
      line1.textContent="* As ABSC a despacho para o PPI do Aeroporto Gago Coutinho, não devem ser as afetas ao PEM do INEM.\n";
      Object.assign(line1.style, {fontSize:"12px", fontWeight:"bold", fontStyle:"italic"});
      const line2 = document.createElement("span");
      line2.textContent="** Equipas com capacidade de Resgate.";
      Object.assign(line2.style, {fontSize:"12px", fontWeight:"bold", fontStyle:"italic"});
      td.appendChild(line1);
      td.appendChild(line2);
      tr.appendChild(td);
      singleTable.appendChild(tr);
      container.appendChild(singleTable);
    }
    /* =======================================
    JAVA SCRIPT PPI LINHA FÉRREA DO ALGARVE
    =======================================*/
    /* = PPI RAILWAY LINE RENDER TYPE KILOMETER = */    
    function consultationGridLinFerKmType() {
      document.getElementById("ppilinfer-main-options").style.display = "none";
      ShowLinFerPKmControls();
    }
    
    function createPKmDirectionButtons() {
      const dirRow = document.createElement("div");
      dirRow.style.cssText = LINFER_ROW_STYLE;
      dirRow.style.gap = "10px";
      const directions = [{id: "T-L", line1: "TROÇO", line2: "Tunes → Lagos"}, {id: "T-V", line1: "TROÇO", line2: "Tunes → VRSA"}];
      directions.forEach(d => {
        const btn = document.createElement("button");
        btn.id = "Pkm-dir-" + d.id;
        btn.className = "btn btn-add";
        btn.style.cssText = LINFER_DIRECTION_BUTTON_STYLE;
        const l1 = document.createElement("div");
        l1.textContent = d.line1;
        l1.style.cssText = LINFER_DIRECTION_TOP_STYLE;
        const l2 = document.createElement("div");
        l2.textContent = d.line2;
        l2.style.cssText = LINFER_DIRECTION_BOT_STYLE;
        btn.append(l1, l2);
        btn.onclick = () => {
          const isActive = btn.classList.contains("active");
          document.querySelectorAll("#ppilinfer-grid-controls .btn")
            .forEach(b => b.classList.remove("active"));
          if (!isActive) btn.classList.add("active");
        };
        dirRow.appendChild(btn);
      });
      return dirRow;
    }
    
    function createPKmInput() {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Introduza o PKm";
      input.id = "ppiLinFer-Pkm-input";
      input.style.cssText = LINFER_INPUT_STYLE;
      input.addEventListener("focus", () => {
        input.style.borderColor = "#ccc";
        input.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";
      });
      input.addEventListener("blur", () => {
        input.style.borderColor = "#ccc";
        input.style.boxShadow = "none";
      });
      input.addEventListener("input", () => {
        let val = input.value.replace(",", ".").replace(/[^\d.]/g, "");
        const parts = val.split(".");
        if (parts[1]) parts[1] = parts[1].slice(0, 3);
        parts[0] = parts[0].slice(0, 3);
        val = parts[0] + (parts[1] ? "." + parts[1] : "");
        input.value = val;
      });
      return input;
    }
    
    function ShowLinFerPKmControls() {
      const container = document.getElementById("ppilinfer-grid-controls");
      if (!container) return;
      container.style.display = "block";
      container.innerHTML = "";
      const card = document.createElement("div");
      card.className = "main-card";
      card.style.cssText = LINFER_CARD_STYLE;
      const title = document.createElement("label");
      title.textContent = "Selecione o Troço";
      title.style.cssText = LINFER_TITLE_LABEL_STYLE;
      card.appendChild(title);
      card.appendChild(createPKmDirectionButtons());
      const inputKm = createPKmInput();
      card.appendChild(inputKm);
      const btnSearch = document.createElement("button");
      btnSearch.textContent = "Procurar";
      btnSearch.className = "btn btn-add";
      btnSearch.style.width = "150px";
      btnSearch.onclick = async () => {
        const kmStr = inputKm.value.trim();
        const activeDir = document.querySelector("#ppilinfer-grid-controls .btn.active");
        if (!activeDir)
          return showPopupWarning("⚠️ Selecione o troço primeiro!");
        if (!kmStr || isNaN(parseFloat(kmStr))) return showPopupWarning("⚠️ Introduza um ponto quilométrico válido!");
        const sentido = activeDir.id === "Pkm-dir-T-L" ? "TUNES-LAGOS" : "TUNES-VRSA";
        const km = parseFloat(kmStr);
        await loadPPILinFerDataFromKm(km, sentido);
      };
      card.appendChild(btnSearch);
      container.appendChild(card);
    }
    
    async function loadPPILinFerDataFromKm(km, sentido) {
      try {
        const gridContainer = document.getElementById("ppilinfer-grid-container");
        const refsContainer = document.getElementById("ppilinfer-grid-references");
        const specialsContainer = document.getElementById("ppilinfer-specials-container");
        const absContainer = document.getElementById("ppilinfer-abs-note");
        if (gridContainer) gridContainer.innerHTML = "";
        if (refsContainer) refsContainer.innerHTML = "";
        if (specialsContainer) specialsContainer.innerHTML = "";
        if (absContainer) absContainer.innerHTML = "";
        const data = await fetchFromSupabase("ppilinfer_data", `ppi_sence=ilike.*${sentido}*`);
        const filtered = data.filter(ppi => {
          const firstMatch = ppi.ppi_first_pkm?.match(/PK\s*([\d,]+)/i);
          const secondMatch = ppi.ppi_secound_pkm?.match(/PK\s*([\d,]+)/i);
          if (!firstMatch || !secondMatch) return false;
          const firstPk = parseFloat(firstMatch[1].replace(',', '.'));
          const secondPk = parseFloat(secondMatch[1].replace(',', '.'));
          const minPk = Math.min(firstPk, secondPk);
          const maxPk = Math.max(firstPk, secondPk);
          return km >= minPk && km <= maxPk;
        });
        if (!filtered.length) {
          showPopupWarning("⚠️ Nenhuma grelha encontrada para este ponto quilométrico no troço selecionado.");
          return;
        }
        const limiteGrelhas = filtered.filter(ppi => {
          const firstPk = parseFloat(ppi.ppi_first_pkm?.match(/PK\s*([\d,]+)/i)?.[1].replace(',', '.') || 0);
          const secondPk = parseFloat(ppi.ppi_secound_pkm?.match(/PK\s*([\d,]+)/i)?.[1].replace(',', '.') || 0);
          return km === firstPk || km === secondPk;
        });
        if (limiteGrelhas.length > 1) {
          const grelhas = limiteGrelhas
          .map(ppi => ppi.grid_id)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
          const grelhaOptions = grelhas.length === 2 ? grelhas.join(" e ") : grelhas.join(", ");
          showPopupWarning(
            `⚠️ O Ponto Quilométrico <b style="color:red">${km.toFixed(3)}</b> corresponde ao limite entre duas grelhas <b style="color:red">${grelhaOptions}</b>.<br>` +
            `Para garantir maior precisão na atribuição de meios, recomenda-se a consulta direta por grelha. Obrigado.`
          );
          return;
        }
        for (const ppi of filtered) {
          const gridId = ppi.grid_id;
          await loadPPILinFerDataInfoGrid(gridId);
          await loadPPILinFerDataSpecials(gridId);
          await loadPPILinFerGridSeparated(gridId);
          const tempContainer = gridContainer.firstChild;
          if (tempContainer) createFinalHTable(tempContainer);
          let newAbsContainer = document.getElementById("ppilinfer-abs-note");
          if (!newAbsContainer) {
            newAbsContainer = document.createElement("div");
            newAbsContainer.id = "ppilinfer-abs-note";
            newAbsContainer.style.marginTop = "10px";
            document.getElementById("ppilinfer-grid-controls").parentNode.appendChild(newAbsContainer);
          }
          ppiLinFerABSNoteTable(newAbsContainer, gridId);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }
    /* = PPI RAILWAY LINE RENDER BUTTON TYPE = */    
    function consultationGridLinFerButtonType() {
      document.getElementById("ppilinfer-main-options").style.display = "none";
      document.getElementById("ppilinfer-grid-controls").style.display = "block";
      ShowLinFerGridButtons();
    }
    
    function createLinFerRowTitle(justify = "flex-start") {
      const row = document.createElement("div");
      row.className = "form-row";
      row.style.cssText = LINFER_ROW_STYLE;
      row.style.justifyContent = justify;
      return row;
    }
    
    function createLinFerTitle(text) {
      const row = createLinFerRowTitle("center");
      row.style.cssText = LINFER_TITLE_STYLE;
      const label = document.createElement("label");
      label.textContent = text;
      row.appendChild(label);
      return row;
    }
    
    function createLinFerGridButtons(id, specialButtons) {
      const btn = document.createElement("button");
      btn.id = id;
      btn.textContent = id;
      btn.className = "btn btn-add";
      btn.style.cssText = LINFER_GRID_BUTTON_STYLE;
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (specialButtons.has(id) && currentCorpNr === "0805") {
        btn.classList.add("btn-special");
      }
      btn.onclick = (e) => {
        e.preventDefault();
        const isActive = btn.classList.contains("active");
        document.querySelectorAll("#ppilinfer-grid-controls button")
          .forEach(b => b.classList.remove("active"));
        if (isActive) {
          clearPPIContainers("ppilinfer");
          const absContainer = document.getElementById("ppilinfer-abs-note");
          if (absContainer) absContainer.innerHTML = "";
        } else {
          btn.classList.add("active");
          loadPPILinFerDataFromButton(id);
        }
      };
      return btn;
    }
    
    function ShowLinFerGridButtons() {
      const container = document.getElementById("ppilinfer-grid-controls");
      if (!container) return;
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      container.innerHTML = "";
      container.appendChild(createLinFerTitle("GRELHAS DE ALARME"));
      const letters = "ABCDEFGHIJKLMNOP".split("");
      const specialButtons = new Set(["F","G","H","I","J","K","L","M","N","O","P"]);
      const rowButtons = createLinFerRowTitle("center");
      letters.forEach(letter => {
        rowButtons.appendChild(createLinFerGridButtons(letter, specialButtons));
      });
      container.appendChild(rowButtons);
    }
    
    async function loadPPILinFerDataFromButton(buttonId) {
      await loadPPILinFerDataInfoGrid(buttonId);
      await loadPPILinFerDataSpecials(buttonId);
      await loadPPILinFerGridSeparated(buttonId);
      const tempContainer = document.getElementById("ppilinfer-grid-container")?.firstChild;
      if (tempContainer) createFinalHTable(tempContainer);
      let absContainer = document.getElementById("ppilinfer-abs-note");
      if (!absContainer) {
        absContainer = document.createElement("div");
        absContainer.id = "ppilinfer-abs-note";
        absContainer.style.marginTop = "10px";
        document.getElementById("ppilinfer-grid-controls").parentNode.appendChild(absContainer);
      }
      ppiLinFerABSNoteTable(absContainer, buttonId);
    }
    /* = PPI RAILWAY LINE LOAD INFO TABLE = */
    async function loadPPILinFerDataInfoGrid(gridId) {
      const container = document.getElementById("ppilinfer-grid-references");
      if (!container) return;
      ensureLoadingMarker(container);
      const loading = container.querySelector(".loading-mark");
      loading.style.display = "block";
      try {
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        const data = await fetchFromSupabase("ppilinfer_data", `grid_id=eq.${gridId}`);
        const refs = await fetchFromSupabase("ppilinfer_references", `grid_code=eq.${gridId}`);
        const refIds = refs.map(r => r.id);
        let means = [];
        if (refIds.length) {
          means = await fetchFromSupabase("ppilinfer_means", `reference_id=in.(${refIds.join(",")})`);
        }
        const hasIntervention = currentCorpNr && means.some(
          m => typeof m.means === "string" && m.means.includes(currentCorpNr)
        );
        createOrUpdateInterventionNotice(container, hasIntervention);
        if (!data.length) return renderNoData(container);
        const ppi = data[0];
        let table = container.querySelector("table");
        if (!table) {
          table = document.createElement("table");
          table.className = "table-elements";
          table.style.cssText = LINFER_TABLE_STYLE;
          container.appendChild(table);
        }
        table.innerHTML = "";
        table.appendChild(createColGroup(["200px", "200px", "calc(33% - 40px)", "calc(33% - 40px)"]));
        const tr1 = document.createElement("tr");
        tr1.append(
          createTd("", 2, 2, "center", "bold", "0px"),
          createTd(`GRELHA ${ppi.grid_id} - ${ppi.ppi_sence || "TROÇO"}`, 2, 1, "center", "bold", "1px", "#323ac2", "#e6e6e6", "16px")
        );
        table.appendChild(tr1);
        const tr2 = document.createElement("tr");
        tr2.append(
          createPkmTd(ppi.ppi_first_pkm),
          createPkmTd(ppi.ppi_secound_pkm)
        );
        table.appendChild(tr2);
        const municipalities = (Array.isArray(ppi.ppi_municipalities) ? ppi.ppi_municipalities : (ppi.ppi_municipalities || "{}").replace(/[{}"]/g, "").split(",").map(s => s.trim()));
        const rowsData = [["COORDENADAS", ppi.ppi_first_coordinate, ppi.ppi_secound_coordinate, ""],
                          ["ALTITUDE(m)", ppi.ppi_first_height ?? "", ppi.ppi_secound_height ?? "", ""],
                          ["MUNICÍPIOS(s)", municipalities.join(", ") || "", "", ""]];
        rowsData.forEach(([labelText, col1, col2, col3], idx) => {
          const tr = document.createElement("tr");
          tr.appendChild(createTd(labelText, 2, 1, "left", "bold"));
          if (idx === 2) {
            const td = createTd(col1, 2, 1, "center", "bold");
            tr.appendChild(td);
          } else {
            tr.appendChild(createTd(col1, 1, 1, "center", "bold"));
            tr.appendChild(createTd(col2, 1, 1, "center", "bold"));
          }
          table.appendChild(tr);
        });
      } catch (err) {
        console.error("❌ Erro ao carregar PPI Linha Férrea:", err);
        showError(container, "Erro ao carregar PPI data. Veja o console.");
      } finally {
        loading.style.display = "none";
      }
    }
    
    function ensureLoadingMarker(container) {
      if (!container.querySelector(".loading-mark")) {
        const lm = document.createElement("div");
        lm.className = "loading-mark";
        lm.style.display = "none";
        container.appendChild(lm);
      }
    }
    
    function createTd(text = "", colSpan = 1, rowSpan = 1, align = "left", bold = false, border = "1px", bgColor = "", color = "", fontSize = "14px") {
      const td = document.createElement("td");
      td.colSpan = colSpan;
      td.rowSpan = rowSpan;
      td.textContent = text;
      let css = `border: ${border} solid #bbb; padding: 5px; text-align: ${align}; font-weight: ${bold ? "bold" : "normal"}; font-size: ${fontSize};`;
      if (bgColor) css += ` background: ${bgColor};`;
      if (color) css += ` color: ${color};`;
      td.style.cssText = css;
      return td;
    }
    
    function createPkmTd(pkmStr) {
      const td = document.createElement("td");
      td.style.cssText = `border:1px solid #bbb; padding:5px; text-align:center; vertical-align:middle;`;
      if (!pkmStr) return td;
      const parts = pkmStr.split('\\n');
      const firstLine = document.createElement("div");
      firstLine.textContent = parts[0] || "";
      firstLine.style.cssText = LINFER_PKM_FIRST_LINE_STYLE;
      td.appendChild(firstLine);
      if (parts[1]) {
        const secondLine = document.createElement("div");
        secondLine.textContent = parts[1];
        secondLine.style.cssText = LINFER_PKM_SECOND_LINE_STYLE;
        td.appendChild(secondLine);
      }
      return td;
    }
    
    function createColGroup(widths) {
      const colgroup = document.createElement("colgroup");
      widths.forEach(w => {
        const col = document.createElement("col");
        col.style.width = w;
        colgroup.appendChild(col);
      });
      return colgroup;
    }
    
    function renderNoData(container) {
      container.querySelector("table")?.remove();
      let noData = container.querySelector(".no-data-msg");
      if (!noData) {
        noData = document.createElement("div");
        noData.className = "no-data-msg";
        noData.style.padding = "10px 0";
        container.appendChild(noData);
      }
      noData.textContent = "Sem dados na tabela ppi_data.";
    }
    
    function showError(container, message) {
      let errDiv = container.querySelector(".data-error");
      if (!errDiv) {
        errDiv = document.createElement("div");
        errDiv.className = "data-error";
        errDiv.style.color = "red";
        errDiv.style.padding = "8px 0";
        container.appendChild(errDiv);
      }
      errDiv.textContent = message;
    }
    
    async function fetchFromSupabase(table, filter) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=*&${filter}`, {
        headers: getSupabaseHeaders()
        }
      );
      if (!res.ok) throw new Error(`Erro ao buscar ${table}: ${res.status}`);
      return res.json();
    }
    /* = PPI RAILWAY LINE LOAD SPECIAL SITUATIONS = */    
    async function loadPPILinFerDataSpecials(gridId) {
      const infoContainer = document.getElementById("ppilinfer-grid-container");
      if (!infoContainer) return;
      let container = document.getElementById("ppilinfer-specials-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "ppilinfer-specials-container";
        infoContainer.parentNode.insertBefore(container, infoContainer);
      }
      if (!container.querySelector(".ppilinfer-title")) {
        const titleDiv = document.createElement("div");
        titleDiv.textContent = "SITUAÇÕES ESPECIAIS";
        titleDiv.className = "ppilinfer-title";
        titleDiv.style.cssText = LINFER_SPECIAL_TITLE_STYLE;
        container.appendChild(titleDiv);
      }
      let dataContainer = container.querySelector(".ppilinfer-data");
      if (!dataContainer) {
        dataContainer = document.createElement("div");
        dataContainer.className = "ppilinfer-data";
        container.appendChild(dataContainer);
      }
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/ppilinfer_specials?select=*&grid_code=eq.${gridId}&order=row_order`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error(`Erro ao buscar ppilinfer_specials: ${res.status}`);
        const specials = await res.json();
        dataContainer.innerHTML = specials.length ?
          specials.map(s => {
          const div = document.createElement("div");
          div.style.cssText = LINFER_SPECIAL_ITEM_STYLE;
          div.innerHTML = formatSpecialsContentWithHighlights(s.content);
          return div.outerHTML;
        }).join("") :
        "Sem informações especiais para esta grelha.";
      } catch (err) {
        console.error("❌ Erro ao carregar specials Linha Férrea:", err);
        dataContainer.innerHTML = "Erro ao carregar informações especiais. Veja o console.";
      }
    }
    /* = PPI RAILWAY LINE LOAD GRIDS A-P == */    
    async function loadPPILinFerGridSeparated(gridId) {
      const container = document.getElementById("ppilinfer-grid-container");
      if (!container) return;
      const tempContainer = document.createElement("div");
      tempContainer.style.display = "none";
      try {
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        const references = await fetchFromSupabase("ppilinfer_references", `grid_code=eq.${gridId}`);
        if (!references.length) {
          container.innerHTML = "Sem referências para esta grelha.";
          return;
        }
        const means = await fetchFromSupabase("ppilinfer_means", `reference_id=in.(${references.map(r => r.id).join(",")})`);
        const occurrenceTypes = {"Acidente - Abalroamento, Choque e Descarrilamento": "#a5d6a7",
                                 "Substâncias Perigosas - Produtos Químicos/Produtos Biológicos": "#ffcc80",
                                 "Incêndio em Transportes": "#90caf9"
                                };
        for (const [type, bgColor] of Object.entries(occurrenceTypes)) {
          const refs = references.filter(r => r.occurrence_type === type);
          if (!refs.length) continue;
          const h3 = document.createElement("h3");
          h3.dataset.type = type;
          h3.textContent = `TIPO DE OCORRÊNCIA: ${type}`;
          h3.style.cssText = `font-size:15px;font-weight:bold;margin-top:10px;margin-bottom:0;padding:3px 5px;background-color:${bgColor};color:black;border-radius:2px`;
          tempContainer.appendChild(h3);
          const table = document.createElement("table");
          table.dataset.type = type;
          table.classList.add("table-elements");
          table.style.cssText = "table-layout:fixed;width:100%;margin-bottom:10px";
          const colgroup = document.createElement("colgroup");
          ["80px", "calc(33% - 40px)", "80px", "calc(33% - 40px)", "33%"].forEach(w => {
            const col = document.createElement("col");
            col.style.width = w;
            colgroup.appendChild(col);
          });
          table.appendChild(colgroup);
          const thead = document.createElement("thead");
          const trHead1 = document.createElement("tr");
          ["1º Alarme","2º Alarme","Alarme Especial"].forEach(alarm => {
            const th = document.createElement("th");
            th.style.textAlign = "center";
            th.style.padding = "4px";
            if (alarm === "1º Alarme") th.style.backgroundColor = "yellow";
            if (alarm === "2º Alarme") th.style.backgroundColor = "orange";
            if (alarm === "Alarme Especial") th.style.backgroundColor = "red";
            th.style.color = alarm === "Alarme Especial" ? "white" : "black";
            if (alarm !== "Alarme Especial") th.colSpan = 2;
            const hasCB = currentCorpNr && refs.some(ref => means.some(m => m.reference_id === ref.id && m.alarm_level === alarm && m.means?.includes(currentCorpNr)));
            if (hasCB) {
              const wrapper = document.createElement("div");
              wrapper.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px";
              const titleDiv = document.createElement("div");
              titleDiv.textContent = alarm;
              titleDiv.style.flex = "1";
              titleDiv.style.textAlign = "center";
              const btn = createAudioButton('LinhaFerrea', gridId, alarm, type, `Toque rápido ${alarm}`);
              btn.style.marginLeft = "8px";
              wrapper.appendChild(titleDiv);
              wrapper.appendChild(btn);
              th.innerHTML = "";
              th.appendChild(wrapper);
            } else {
              th.textContent = alarm;
            }
            trHead1.appendChild(th);
          });
          thead.appendChild(trHead1);
          table.appendChild(thead);
          const tbody = document.createElement("tbody");
          refs.forEach(ref => {
            const firstAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "1º Alarme").sort((a,b)=>(a.display_order ?? 1)-(b.display_order ?? 1));
            const secondAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "2º Alarme").sort((a,b)=>(a.display_order ?? 1)-(b.display_order ?? 1));
            const specialAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "Alarme Especial").sort((a,b)=>(a.display_order ?? 1)-(b.display_order ?? 1));
            const maxRows = Math.max(firstAlarm.length, secondAlarm.length, specialAlarm.length);
            let skipFirst = { count: 0 };
            let skipSecond = { count: 0 };
            for (let i = 0; i < maxRows; i++) {
              const tr = document.createElement("tr");
              renderGenericAlarmCells(tr, firstAlarm, i, skipFirst);
              renderGenericAlarmCells(tr, secondAlarm, i, skipSecond);
              if (i === 0) {
                const tdSpecial = document.createElement("td");
                tdSpecial.textContent = specialAlarm.map(m => m.means).join(",") || "-";
                tdSpecial.style.textAlign = "center";
                tdSpecial.style.padding = "4px";
                tdSpecial.rowSpan = maxRows;
                tr.appendChild(tdSpecial);
              }
              tbody.appendChild(tr);
            }
          });
          table.appendChild(tbody);
          tempContainer.appendChild(table);
        }
        container.innerHTML = "";
        container.appendChild(tempContainer);
        tempContainer.style.display = "block";
        createOrUpdateCumulativeAlert(tempContainer);
      } catch (err) {
        console.error("❌ Erro ao carregar grelha Linha Férrea:", err);
        container.textContent = "Erro ao carregar grelha. Veja o console.";
      }
    }
    /* === PPI RAILWAY LINE ABSC's NOTE === */
    function ppiLinFerABSNoteTable(container, buttonId) {
      if (!container || !buttonId) return;
      const letter = buttonId.toUpperCase();
      if (!"ABCDEFGHIJKLMNOP".includes(letter)) return;
      container.innerHTML = "";
      const table = Object.assign(document.createElement("table"), {
        className: "table-elements"
      });
      table.style.cssText = LINFER_ABS_TABLE_STYLE;
      const td = Object.assign(document.createElement("td"), {
        innerHTML: `<b>* As ABSC</b> a despacho para o PPI da Linha Férrea do Algarve, não devem ser as afetas ao PEM do INEM, sendo complementares às mobilizadas pelo CODU do INEM (GRELHA ${letter} - INEM)`
      });
      td.style.cssText = LINFER_ABS_CELL_STYLE;
      const tr = document.createElement("tr");
      tr.appendChild(td);
      table.appendChild(tr);
      container.appendChild(table);

    }




