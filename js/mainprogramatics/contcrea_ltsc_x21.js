    /* =======================================
       UTILITY GROUP
    ======================================= */
    /* =======================================
            CREATION OF DYNAMIC CONTAINERS
    ======================================= */
    /* =======================================
    NEW OCCURRENCE
    ======================================= */
    /* ============= VEHICLES ============= */
    const vehicleContainer = document.getElementById('vehicle-container');
    let vehicleCount = 0;    
    async function NewOCRaddVehicle() {
      vehicleCount++;
      const card = document.createElement('div');
      card.className = 'wsms-vehicle-card';
      card.innerHTML = `
        <div class="field-card-title">${vehicleCount}º VEÍCULO</div>
        <div class="wsms-row">
          <div class="wsms-field">
            <label>Data Saída</label>
            <input type="date" style="width: 120px;">
          </div>
          <div class="wsms-field">
            <label>Veículo</label>
            <select style="width: 100px;"><option></option></select>
          </div>
          <div class="wsms-field">
            <label>BBs</label>
            <input type="text" placeholder="00" style="width: 60px; text-align: center;" maxlength="2"
                   oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,2)">
          </div>
          <div class="wsms-field">
            <label>Hora Saída</label>
            <input type="time" style="width: 100px;">
          </div>
        </div>
      `;
      vehicleContainer.appendChild(card);
      const dateInput = card.querySelector('input[type="date"]');
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      const select = card.querySelector("select");
      await populateSingleVehicleSelect(select);
    }
    function NewOCRresetVehicles() {
      vehicleContainer.innerHTML = "";
      vehicleCount = 0;
      for (let i = 0; i < 3; i++) {
        NewOCRaddVehicle();
      }
    }
    /* =======================================
            CLOSE INCIDENT
    ======================================= */
    /* ========== OPTIONS BUTTONS ========== */
    function resetButtons() {
      const buttons = document.querySelectorAll('.action-buttons .btn-add');
      buttons.forEach(btn => btn.classList.remove('active'));
    }
    /* ========== VEHICLES ============= */
    const vehiclesContainer = document.getElementById('vehicles-container');
    let closeVehicleCount = 0;
    async function CloseOCRaddVehicle() {
      closeVehicleCount++;
      const card = document.createElement('div');
      card.className = 'wsms-card-mini';
      card.innerHTML = `
        <div class="field-card-title">${closeVehicleCount}º VEÍCULO</div>
        <div style="padding: 5px 0px; display: flex; flex-direction: column; gap: 5px;">
          <div class="wsms-row" style="margin-bottom: -10px; margin-top: -10px;">
            <div class="wsms-field wsms-field--fixed" style="display:flex !important; flex-direction:row !important; align-items:center; gap:8px;">
              <label style="margin:0;">Veículo</label>
              <select style="width: 150px;"></select>
            </div>
          </div>
          <div class="wsms-row" style="margin-bottom: -10px;">
            <div class="wsms-field wsms-field--fixed">
              <label>Dt. Ch. TO</label>
              <input type="date" style="width: 110px;">
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Hr. Ch. TO</label>
              <input type="time" style="width: 90px;">
            </div>
          </div>
          <div class="wsms-row" style="margin-bottom: -10px;">
            <div class="wsms-field wsms-field--fixed">
              <label>Dt. Sd. TO</label>
              <input type="date" style="width: 110px;">
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Hr. Sd. TO</label>
              <input type="time" style="width: 90px;">
            </div>
          </div>
          <div class="wsms-row" style="margin-bottom: -10px;">
            <div class="wsms-field wsms-field--fixed">
              <label>Dt. Ch. Und.</label>
              <input type="date" style="width: 110px;">
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Hr. Ch. Und.</label>
              <input type="time" style="width: 90px;">
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Kms.</label>
              <input type="text" placeholder="0" style="width: 65px; text-align: center;" maxlength="5"
                     oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,5)">
            </div>
          </div>
          <div class="wsms-row" style="margin-bottom: 10px;">
            <div class="wsms-field wsms-field--fixed">
              <label>Tempo de Bomba</label>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 0.06em;">Hr:</span>
                <input type="text" placeholder="0" style="width: 55px; text-align: center;" maxlength="3"
                       oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,3)">
                <span style="font-size: 11px; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 0.06em;">Min:</span>
                <input type="text" placeholder="0" style="width: 55px; text-align: center;" maxlength="2"
                       oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,2)">
              </div>
            </div>
          </div>
        </div>
      `;
      vehiclesContainer.appendChild(card);
      const today = new Date().toISOString().split('T')[0];
      card.querySelectorAll('input[type="date"]').forEach(input => input.value = today);
      const select = card.querySelector("select");
      await populateSingleVehicleSelect(select);
    }
    function CloseOCRresetVehicles() {
      vehiclesContainer.innerHTML = "";
      closeVehicleCount = 0;
      for (let i = 0; i < 3; i++) {
        CloseOCRaddVehicle();
      }
    }
    /* ============= VICTIMS ============== */
    const victimsContainer = document.getElementById('victims-container');
    let victimsCount = 0;
    async function addVictim() {
      victimsCount++;
      const idx = victimsCount;
      const div = document.createElement('div');
      div.className = 'wsms-card-mini';
      div.style.marginBottom = '6px';
      div.innerHTML = `
        <div style="padding:4px 6px;">
          <div class="wsms-row" style="flex-wrap: wrap; gap: 8px;">
            <div class="wsms-field wsms-field--fixed">
              <label>Género</label>
              <select id="victim_${idx}_gender" style="width: 110px;"></select>
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Idade</label>
              <div style="display:flex; gap:4px;">
                <input type="text" id="victim_${idx}_age_unit" style="width: 45px; text-align: center;">
                <select id="victim_${idx}_age" style="width:80px;"></select>
              </div>
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Nacionalidade</label>
              <input type="text" id="victim_${idx}_nation" style="width:150px;">
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Tipo</label>
              <select id="victim_${idx}_type" style="width:100px;"></select>
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Estado</label>
              <select id="victim_${idx}_status" style="width:100px;"></select>
            </div>
          </div>
        </div>
      `;
      victimsContainer.appendChild(div);
      await populateSingleVictimSelect(document.getElementById(`victim_${idx}_gender`), 'victim_gender');
      await populateSingleVictimSelect(document.getElementById(`victim_${idx}_age`), 'victim_age');
      await populateSingleVictimSelect(document.getElementById(`victim_${idx}_type`), 'victim_type');
      await populateSingleVictimSelect(document.getElementById(`victim_${idx}_status`), 'victim_status');
    }
    async function resetVictims(initialCount = 1) {
      const victimsCard = document.querySelector('.wsms-victims-card');
      if (victimsCard) victimsCard.classList.add('hidden');
      victimsContainer.innerHTML = "";
      victimsCount = 0;
      for (let i = 0; i < initialCount; i++) {
        await addVictim();
      }
    }
    document.addEventListener('DOMContentLoaded', async () => {
      await resetVictims(1);
    });
    /* = OTHER VEHICLES IN THE OCCURRENCE = */
    const extrasContainer = document.getElementById('extras-container');
    let extrasCount = 0;
    function addExtra(index = null) {
      extrasCount++;
      const i = index || extrasCount;
      const div = document.createElement('div');
      div.className = 'wsms-card-mini';
      div.style.marginBottom = '6px';
      div.innerHTML = `
        <div style="padding:4px 6px; display:flex; flex-direction:column; gap:4px;">
          <div class="wsms-row">
            <div class="wsms-field wsms-field--grow">
              <label>Descrição</label>
              <input type="text" style="width: 100%;">
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Veícs.</label>
              <input type="text" style="width:55px; text-align:center;">
            </div>
            <div class="wsms-field wsms-field--fixed">
              <label>Elems.</label>
              <input type="text" style="width:55px; text-align:center;">
            </div>
          </div>
        </div>
      `;
      extrasContainer.appendChild(div);
    }
    function resetExtras() {
      const extrasCard = document.querySelector('.wsms-extras-card');
      if (extrasCard) extrasCard.classList.add('hidden');
      extrasContainer.innerHTML = "";
      extrasCount = 0;
      for (let i = 1; i <= 1; i++) addExtra(i);
    }
    /* ========== DAMAGE CAUSED =========== */
    const damagesContainer = document.getElementById('damages-container');
    let damagesCount = 0;
    function addDamage(index = null) {
      damagesCount++;
      const i = index || damagesCount;
      const div = document.createElement('div');
      div.className = 'wsms-card-mini';
      div.style.marginBottom = '6px';
      div.innerHTML = `
        <div style="padding:4px 6px;">
          <div class="wsms-row">
            <div class="wsms-field wsms-field--grow">
              <label>Descrição</label>
              <input type="text" style="width: 100%;">
            </div>
          </div>
        </div>
      `;
      damagesContainer.appendChild(div);
    }
    function resetDamages() {
      const demageCard = document.querySelector('.wsms-demage-card');
      if (demageCard) demageCard.classList.add('hidden');
      damagesContainer.innerHTML = "";
      damagesCount = 0;
      addDamage(1);
    }
    /* ============ BURNT AREA ============ */
    function resetBurned() {
      const burnedCard = document.querySelector('.wsms-burned-card');
      if (burnedCard) burnedCard.classList.add('hidden');
    }
    /* ============= COMMENTS ============= */
    function resetObservations() {
      const observCard = document.querySelector('.wsms-observ-card');
      if (observCard) observCard.classList.add('hidden');    
    }
    /* ========== RESET BUTTONS =========== */    
    function resetButtons() {
      const buttons = document.querySelectorAll('.action-buttons .btn-add');
      buttons.forEach(btn => btn.classList.remove('active'));
    }
    /* =========== GLOBAL RESET =========== */    
    function CloseOCRresetAll() {
      CloseOCRresetVehicles();
      resetVictims();
      resetExtras();
      resetDamages();
      resetBurned();
      resetObservations();
      resetButtons();
    }
    /* =======================================
            EPE E PPI
    ======================================= */
    const epeCards = [{id: "epe-decir", label: "EPE SIOPS DECIR", buttons: ["MONITORIZAÇÃO", "NÍVEL I", "NÍVEL II", "NÍVEL III", "NÍVEL IV", ""]},
                      {id: "epe-diops", label: "EPE SIOPS DIOPS", buttons: ["MONITORIZAÇÃO", "NÍVEL I", "NÍVEL II", "NÍVEL III", "NÍVEL IV", ""]},
                      {id: "epe-nrbq", label: "EPE SIOPS NRBQ", buttons: ["MONITORIZAÇÃO", "NÍVEL I", "NÍVEL II", "NÍVEL III", "NÍVEL IV", ""]}];
    const ppiCards = [{id: "ppi-aero", label: "PPI AEROPORTO", buttons: ["MONITORIZAÇÃO", "AMARELO", "VERMELHO", "", "", ""]},
                      {id: "ppi-a22", label: "PPI A22", buttons: ["MONITORIZAÇÃO", "1º ALARME", "2º ALARME", "ALARME ESPECIAL", "", ""]},
                      {id: "ppi-linfer", label: "PPI LINHA FÉRREA", buttons: ["MONITORIZAÇÃO", "1º ALARME", "2º ALARME", "ALARME ESPECIAL", "", ""]}];
    function createEPEPPICard(cardData) {
      const divItem = document.createElement("div");
      divItem.className = "main-card";
      divItem.style.height = "160px";
      divItem.style.margin = "-10px 0 0 0";
      const spanLabel = document.createElement("span");
      spanLabel.className = "data-value";
      spanLabel.style.fontSize = "15px";
      spanLabel.textContent = cardData.label;
      divItem.appendChild(spanLabel);
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      buttonContainer.id = cardData.id;
      cardData.buttons.forEach(text => {
        const btn = document.createElement("button");
        btn.className = "panel-btn";
        btn.style.backgroundColor = "lightgrey";
        btn.style.color = "black";
        btn.textContent = text;
        buttonContainer.appendChild(btn);
      });
      divItem.appendChild(buttonContainer);
      return divItem;
    }
    const epeContainer = document.getElementById("epe-container");
    epeCards.forEach(card => epeContainer.appendChild(createEPEPPICard(card)));
    const ppiContainer = document.getElementById("ppi-container");
    ppiCards.forEach(card => ppiContainer.appendChild(createEPEPPICard(card)));
    /* =======================================
            RELEVANT INFORMATION
    ======================================= */
    function createRelevInfoInputs() {
      const infoContainer = document.getElementById('info-container');
      const totalRelevInfos = 4;
      infoContainer.innerHTML = '';
      for (let i = 1; i <= totalRelevInfos; i += 2) {
        let rowHtml = '<div class="data-grid">';
        for (let j = i; j < i + 2 && j <= totalRelevInfos; j++) {
          const n = String(j).padStart(2, '0');
          rowHtml += `
            <div class="main-card" id="relev-info-${n}" data-row-id="">
              <div class="global-field-horizontal">
                <label>De:</label>
                <input type="text" id="from-${n}" style="width: 207px;">
              </div>
              <div class="global-field-horizontal">
                <label>Para:</label>
                <input type="text" id="to-${n}" style="width: 200px;">
              </div>
              <div class="global-field-horizontal">
                <label>Info:</label>
                <textarea id="info-${n}" placeholder="Escreva a info..." rows="4"
                  style="width: 100%; height: 75px; resize: vertical;"></textarea>
              </div>
              <div class="action-buttons" style="margin: 10px 0 0 0;">
                <button class="btn btn-danger" onclick="clearInfoGroupFields('${n}')">LIMPAR</button>
                <button class="btn btn-success" onclick="saveInfoGroupFields('${n}')">EMITIR</button>
              </div>
            </div>
          `;
        }
        rowHtml += '</div>';
        infoContainer.innerHTML += rowHtml;
      }
    }
    /* =======================================
            ROAD CLOSURES
    ======================================= */
    function createRouteInputs(total = 13) {
      const routesContainer = document.getElementById('routes-container');
      routesContainer.innerHTML = '';
      for (let i = 1; i <= total; i++) {
        const n = String(i).padStart(2, '0');
        routesContainer.innerHTML += `
          <div class="global-field-horizontal" style="flex:1;">
            <label>${n}:</label>
            <input type="text" id="route-${n}-name" placeholder="Indique a via ou Arruamento" style="width: 250%;">
            <input type="text" id="route-${n}-motive" placeholder="Indique o motivo" style="width: 200%;">
            <input type="text" id="route-${n}-until" placeholder="Indique a previsão de términus" style="width: 100%;">
          </div>
        `;
      }
    }
    /* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
    function createCmaInputs() {
      const cmas = [{name: 'BHSP LOULÉ'}, {name: 'CMA S.B. ALPORTEL'}, {name: 'CMA CACHOPO'}, {name: 'CMA MONCHIQUE'}, {name: 'AERODROMO PORTIMÃO'}, {name: '-'}];
      const container = document.getElementById("cma-container");
      if (!container) return;
      container.innerHTML = '';
      cmas.forEach((cma, index) => {
        const id = String(index + 1).padStart(2, '0');
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("main-card");
        itemDiv.innerHTML = `
          <span class="data-value" style="font-size: 17px; margin-bottom:15px;">${cma.name}</span>
          <div class="cma-box">
            <div class="cma-left">
              <img id="cma_image_${id}" src="https://i.imgur.com/4Ho5HRV.png" alt="Foto CMA" style="object-fit:contain; width:125px;">
            </div>
            <div class="cma-right">
              <div class="cma-fields">
                <div class="global-field-horizontal" style="flex:1;">
                  <label>AERONAVE:</label>
                  <input id="cma_aero_type_${id}" type="text" style="width:100%; text-align:center; margin: 0 20px 0 0;">
                </div>
                <div class="global-field-horizontal" style="flex:1;">
                  <label>TIPOLOGIA:</label>
                  <select id="cma_type_${id}" style="width:100%; text-align:center; margin: 0 20px 0 0;"></select>
                </div>
                <div class="global-field-horizontal" style="flex:1;">
                  <label>AUTONOMIA:</label>
                  <input id="cma_auto_${id}" type="text" style="width:100%; text-align:center; margin: 0 20px 0 0;">
                </div>
              </div>
            </div>
          </div>
        `;
        container.appendChild(itemDiv);
        const selectElement = document.getElementById(`cma_type_${id}`);
        const optionNames = ["Selecionar...", "Heli Ligeiro", "Heli Médio", "Heli Pesado", "Avião de Asa Fixa Médio", "Avião de Asa Fixa Pesado"];
        optionNames.forEach(name => {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          selectElement.appendChild(opt);
        });
        const imageElement = document.getElementById(`cma_image_${id}`);
        selectElement.addEventListener("change", () => {
          let src;
          switch (selectElement.value) {
            case "Heli Ligeiro": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg"; break;
            case "Heli Médio": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg"; break;
            case "Heli Pesado": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg"; break;
            case "Avião de Asa Fixa Médio": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg"; break;
            case "Avião de Asa Fixa Pesado": src = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png";  break;
            default: src = "https://i.imgur.com/4Ho5HRV.png";
          }
          imageElement.src = src;
        });
      });
    }
    /* =======================================
            AVAILABILITY OF ELEMENTS
    ======================================= */
    async function fetchElemsFromSupabase() {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpOperNr) return [];
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/reg_elems?select=*`, {
          method: "GET",
          headers: getSupabaseHeaders()
        }
      );
      if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
      let data = await response.json();
      return data.filter(elem => elem.corp_oper_nr == currentCorpOperNr);
    }    
    async function loadElemsButtons() {
      try {
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
        if (!currentCorpOperNr) {
          const container = document.getElementById("elems-container");
          container.style.display = "block";
          container.innerHTML = `
            <div style="padding: 10px; font-size: 16px; color: #333;">
              ⚠️ Nenhuma corporação selecionada. Selecione uma corporação para visualizar os elementos.
            </div>
          `;
          return;
        }
        let elems = await fetchElemsFromSupabase();
        elems = sortElems(elems);
        createElemButtons(elems);        
      } catch (error) {
        console.error("❌ Erro ao carregar elementos:", error);
      }
    }    
    function createElemButtons(sortedElems) {
      const container = document.getElementById("elems-container");
      if (!container) return;
      if (!sortedElems || sortedElems.length === 0) {
        container.style.display = "block";
        container.innerHTML = `
          <div style="padding: 10px; font-size: 16px; color: #333;">
            🚫 Não existem elementos registados para esta corporação.
          </div>
        `;
        return;
      }
      container.innerHTML = "";
      sortedElems.forEach(row => {
        const btn = document.createElement("button");
        btn.classList.add("btn-elem");
        btn.textContent = row.n_int || row.id;
        if (row.elem_state === false) {
          btn.dataset.tooltip = "";
          btn.disabled = true;
        } else {
          btn.dataset.tooltip = row.abv_name || "";
          btn.disabled = false;
        }
        applyButtonStyle(btn, row.elem_state, row.situation);
        btn.addEventListener("click", () => toggleElemSituation(row, btn));
        container.appendChild(btn);
      });
    }    
    function sortElems(list) {
      return list.sort((a, b) => {
        const aVal = a.n_int ?? "";
        const bVal = b.n_int ?? "";
        if (!isNaN(aVal) && !isNaN(bVal)) return Number(aVal) - Number(bVal);
        return aVal.toString().localeCompare(bVal.toString(), "pt", { numeric: true });
      });
    }    
    function applyButtonStyle(btn, elemState, situation) {
      if (elemState === false) {
        btn.style.backgroundColor = "red";
        btn.style.color = "white";
      } else {
        if (situation === "available") {
          btn.style.backgroundColor = "green";
          btn.style.color = "white";
        } else {
          btn.style.backgroundColor = "rgb(158, 158, 158)";
          btn.style.color = "black";
        }
      }
    }    
    async function toggleElemSituation(row, btn) {
      if (row.elem_state === false) return;
      const newSituation = row.situation === "available" ? "unavailable" : "available";
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${encodeURIComponent(row.n_int)}&corp_oper_nr=eq.${currentCorpOperNr}`, {
            method: "PATCH",
            headers: getSupabaseHeaders({ returnRepresentation: true }),
            body: JSON.stringify({ situation: newSituation })
          }
        );
        if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
        row.situation = newSituation;
        applyButtonStyle(btn, row.elem_state, row.situation);
      } catch (err) {
        console.error("❌ Erro ao atualizar situação:", err);
        alert("Erro ao atualizar situação.");
      }
    }
    document.addEventListener("DOMContentLoaded", loadElemsButtons);
    /* =======================================
    UNAVAILABILITY OF HOSPITALS
    ======================================= */
    function createNoHospInputs(total = 12) {
      const noHospital = document.getElementById('no-hosp');      
      if (!noHospital) return;
      noHospital.innerHTML = '';
      const numColWidth = "5px";
      const gridLayout = `${numColWidth} 2fr 2fr 1fr 0.8fr 1fr 0.8fr 1.5fr`;
      const gap = "5px";
      const header = document.createElement('div');
      header.style.cssText = `display: grid; grid-template-columns: ${gridLayout}; gap: ${gap}; align-items: center; margin-bottom: 5px; font-size: 11px; 
                              font-weight: bold; color: #1f4b91; text-transform: uppercase; text-align: center;`;
      header.innerHTML = `
        <div></div> 
        <div>Hospital</div>
        <div>Serviço</div>
        <div style="grid-column: span 2; background: #d1d9e6; border-radius: 2px; margin-left: -5px;">Início (Deste)</div>
        <div style="grid-column: span 2; background: #d1d9e6; border-radius: 2px; margin-right: -5px;">Fim (Até)</div>
        <div>Referência</div>
      `;
      noHospital.appendChild(header);
      for (let i = 1; i <= total; i++) {
        const n = String(i).padStart(2, '0');
        const row = document.createElement('div');
        row.className = 'global-field-horizontal';
        row.style.cssText = "display: flex; gap: 5px; align-items: center; margin-bottom: 3px; flex-wrap: nowrap;";
        row.innerHTML = `
          <label style="font-weight: bold; min-width: 30px;">${n}:</label>
            <input type="text" id="nohosp-${n}" placeholder="Local/Ref." style="flex: 2;">
            <input type="text" id="nohosp-serv-${n}" placeholder="Serviço" style="flex: 2;">
            <input type="date" id="nohosp-form-date-${n}" style="flex: 1;">
            <input type="time" id="nohosp-form-time-${n}" style="flex: 0.8;">
            <input type="date" id="nohosp-to-date-${n}" style="flex: 1;">
            <input type="time" id="nohosp-to-time-${n}" style="flex: 0.8;">
            <input type="text" id="nextHosp-${n}" placeholder="Próximo Hosp." style="flex: 1.5;">
        `;
        noHospital.appendChild(row);
      }
    }
    /* =======================================
    OCCURRENCE REPORTS MISSING
    ======================================= */
    function createOcrReportsInputs(total = 24) {
      const ocrReportsContainer = document.getElementById('ocrReport');
      if (!ocrReportsContainer) return;
      ocrReportsContainer.innerHTML = '';
      for (let i = 1; i <= total; i++) {
        const n = String(i).padStart(2, '0');
        ocrReportsContainer.insertAdjacentHTML('beforeend', `
          <div class="global-field-horizontal ocr-item">
            <label style="font-weight: bold; min-width: 30px;">${n}:</label>
            <input type="text" id="report-${n}-nint" placeholder="Nº Int." style="width: 100%;">
            <input type="text" id="report-${n}-nr" placeholder="Nr. SADO" style="width: 200%;">
            <input type="date" id="report-${n}-date"style="width: 100%;">
            <select id="report-${n}-status" style="width: 120%; font-weight: 600;">
               <option value="">Estado</option>
               <option value="done">Efetuado</option>
               <option value="pending">Por Efetuar</option>
            </select>
          </div>
        `);
      }
    }
