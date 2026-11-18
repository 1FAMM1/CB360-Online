    /* =======================================
    DIGITAL PANEL CONSOLE GROUP
    ======================================= */
    async function utilCheckRes(res, label) {
      if (res && !res.ok) {
        const t = await res.text().catch(() => "");
        let msg = t;
        try { msg = JSON.parse(t).message || t; } catch (e) {}
        throw new Error(`${label}: ${msg || res.status}`);
      }
      return res;
    }
    /* ========== SIDEBAR BUTTON CONTROL AND NAVIGATION ========== */
    function showPanelCardUtilities(cardId) {
      const allCards = document.querySelectorAll('.panel-card');
      allCards.forEach(card => {
        card.classList.remove('active');
      });
      const allButtons = document.querySelectorAll('.panel-sidebar-menu-button');
      allButtons.forEach(button => {
        button.classList.remove('active');
      });
      document.getElementById('panel-' + cardId).classList.add('active');
      event.target.classList.add('active');
      if (cardId === "analytics") {
        if (typeof loadElemsButtons === "function") loadElemsButtons();
      }
    }
    /* =======================================
    SPECIAL READINESS STATES
    ======================================= */
    /* ========== COLOR CONTROL EPE ========== */
    class EPEButtonColorManager {
      constructor(supabaseUrl, supabaseKey) {
        this.SUPABASE_URL = supabaseUrl;
        this.SUPABASE_ANON_KEY = supabaseKey;
        const epeColors = [{bg: '#4CAF50', text: 'white'}, {bg: '#5B9BD5', text: 'white'}, {bg: '#FFD966', text: 'black'}, 
                           {bg: '#F4A460', text: 'black'}, {bg: '#E57373', text: 'white'}, {bg: '#D3D1C7', text: '#5F5E5A'}];
        const ppiAeroColors = [{bg: '#4CAF50', text: 'white'}, {bg: '#FFD966', text: 'black'}, {bg: '#E57373', text: 'white'},
                               {bg: '#D3D1C7', text: '#5F5E5A'}, {bg: '#D3D1C7', text: '#5F5E5A'}, {bg: '#D3D1C7', text: '#5F5E5A'}];
        const ppiA22LinferColors = [{bg: '#4CAF50', text: 'white'}, {bg: '#FFD966', text: 'black'}, {bg: '#F4A460', text: 'black'},
                                    {bg: '#E57373', text: 'white'}, {bg: '#D3D1C7', text: '#5F5E5A'}, {bg: '#D3D1C7', text: '#5F5E5A'}];
        this.buttonColors = {"epe-decir": epeColors, "epe-diops": epeColors, "epe-nrbq": epeColors, "ppi-aero": ppiAeroColors, "ppi-a22": ppiA22LinferColors, "ppi-linfer": ppiA22LinferColors};
        this.initializeButtons();
      }
      initializeButtons() {
        Object.keys(this.buttonColors).forEach(containerId => {
          const container = document.getElementById(containerId);
          if (!container) return;
          const buttons = container.querySelectorAll('.epeppi-panel-btn');
          buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
              this.toggleButton(containerId, button, index);
            });
          });
        });
      }
      toggleButton(containerId, button, index) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.querySelectorAll('.epeppi-panel-btn').forEach(btn => {
          btn.style.backgroundColor = 'lightgrey';
          btn.style.color = 'black';
          btn.dataset.active = 'false';
        });
        const colors = this.buttonColors[containerId][index];
        button.style.backgroundColor = colors.bg;
        button.style.color = colors.text;
        button.dataset.active = 'true';
        const epe_type = containerId;
        const epe_value = button.textContent.trim();
        this.saveToSupabase(epe_type, epe_value).then(ok => {
          if (ok) {
            showPopup('popup-success', `Estado do <b>${epe_type.toUpperCase()}</b>, atualizado para <b>${epe_value}</b>.`);
          } else {
            showPopup('popup-danger', `Não foi possível gravar o estado do <b>${epe_type.toUpperCase()}</b>.`);
            this.loadFromSupabase();
          }
        });
      }
      async loadFromSupabase() {
      try {
        const corpId = sessionStorage.getItem('currentCorpOperNr');
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = corpId;
        const resp = await fetch(`${this.SUPABASE_URL}/rest/v1/epe_status?corp_oper_nr=eq.${corpId}`, {
          method: 'GET',
          headers: headers
        });
        if (!resp.ok) throw new Error(`Erro ao ler EPE: ${resp.status}`);
        const data = await resp.json();
        data.forEach(row => {
          const containerId = row.epe_type;
          const epeValue = row.epe;
          const container = document.getElementById(containerId);
          if (!container) return;
          const buttons = container.querySelectorAll('.epeppi-panel-btn');
          buttons.forEach((btn, index) => {
            if (btn.textContent.trim() === epeValue) {
              const colors = this.buttonColors[containerId][index];
              btn.style.backgroundColor = colors.bg;
              btn.style.color = colors.text;
              btn.dataset.active = 'true';
              const stateClass = stateMap[epeValue];
              if (stateClass) btn.classList.add(stateClass);
            } else {
              btn.style.backgroundColor = 'lightgrey';
              btn.style.color = 'black';
              btn.dataset.active = 'false';
              if (btn.textContent.trim()) btn.classList.add('inactive');
            }
          });
        });
      } catch (e) {
        console.error('❌ Erro ao carregar estados EPE:', e);
      }
     }
      async saveToSupabase(epe_type, epe_value) {
        try {
          const corpId = sessionStorage.getItem('currentCorpOperNr');
          const headers = getSupabaseHeaders({ returnRepresentation: true });
          headers['x-my-corpo'] = corpId;
          const body = {epe: epe_value, corp_oper_nr: corpId};
          const resp = await fetch(`${this.SUPABASE_URL}/rest/v1/epe_status?epe_type=eq.${encodeURIComponent(epe_type)}&corp_oper_nr=eq.${corpId}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(body)
          });
          if (!resp.ok) {
            console.error('❌ Erro RLS ao atualizar EPE:', resp.status);
            return false;
          }
          const rows = await resp.json().catch(() => []);
          if (!Array.isArray(rows) || rows.length === 0) {
            console.error('❌ EPE: nenhuma linha atualizada para', epe_type);
            return false;
          }
          return true;
        } catch (e) {
          console.error('❌ Erro na requisição EPE:', e);
          return false;
        }
      }      
    }
    document.addEventListener('DOMContentLoaded', () => {
      window.colorManager = new EPEButtonColorManager(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.colorManager.loadFromSupabase();
      document.querySelectorAll('.sidebar-menu-button').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = btn.dataset.page;
          if (page === 'page-utilities') {
            if (window.colorManager) {
              window.colorManager.loadFromSupabase();
            }
          }
        });
      });
    });    
    /* =======================================
    RELEVANT INFORMATION
    ======================================= */
    async function createDefaultInfoRows(corp) {
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = corp;
      const defaultRows = [1, 2, 3, 4].map(n => ({corp_oper_nr: corp, group_nr: n, from: "", destination: "", info: ""}));
      const res = await fetch(`${SUPABASE_URL}/rest/v1/infos_select`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=representation" },
        body: JSON.stringify(defaultRows)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    async function waitForInputs() {
      const requiredIds = ['relev-info-01', 'relev-info-02', 'relev-info-03', 'relev-info-04'];
      return new Promise(resolve => {
        const interval = setInterval(() => {
          const allExist = requiredIds.every(id => document.getElementById(id));
          if (allExist) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }
    async function loadInfosFromSupabase() {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpOperNr) return console.error("❌ currentCorpOperNr não definido!");
      try {
        const infoContainer = document.getElementById('info-container');
        if (infoContainer) infoContainer.innerHTML = '';
        currentInfoCount = 0;
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        let res = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?select=id,group_nr,from,destination,info&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, {
            method: 'GET', headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        let rows = await res.json();
        if (!rows || rows.length === 0) {
          rows = await createDefaultInfoRows(currentCorpOperNr);
        }
        rows.forEach(row => {
          const hasContent = (row.from && row.from.trim() !== "") || (row.destination && row.destination.trim() !== "") || (row.info && row.info.trim() !== "");
          if (hasContent) {
            addNewRelevInfoCard();
            const n = String(currentInfoCount).padStart(2, '0');
            const group = document.getElementById(`relev-info-${n}`);
            if (group) {
              group.dataset.rowId = row.id;
              const fromInput = document.getElementById(`from-${n}`);
              const toInput = document.getElementById(`to-${n}`);
              const infoTA = document.getElementById(`info-${n}`);
              if (fromInput) fromInput.value = row.from || "";
              if (toInput) toInput.value = row.destination || "";
              if (infoTA) infoTA.value = row.info || "";
            }
          }
        });
      } catch (e) {
        console.error("❌ Erro no loadInfosFromSupabase:", e);
      }
    }
    async function saveInfoGroupFields(n) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const group = document.getElementById(`relev-info-${n}`);
      if (!group || !currentCorpOperNr) return;    
      const fromVal = document.getElementById(`from-${n}`).value || "";
      const toVal = document.getElementById(`to-${n}`).value || "";
      const infoVal = document.getElementById(`info-${n}`).value || "";    
      let rowId = group.dataset.rowId;
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = currentCorpOperNr;
      try {
        if (!rowId) {
          const resGet = await fetch(
            `${SUPABASE_URL}/rest/v1/infos_select?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${parseInt(n,10)}`, {
              method: 'GET',
              headers: headers
            }
          );
          const dataGet = await resGet.json();
          if (dataGet.length > 0) rowId = group.dataset.rowId = dataGet[0].id;
        }
        if (!rowId) return console.error(`⚠️ Sem rowId para relev-info-${n}`);
        const resPatch = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
            method: "PATCH",
            headers: { ...headers, "Prefer": "return=representation" },
            body: JSON.stringify({from: fromVal, destination: toVal, info: infoVal, corp_oper_nr: currentCorpOperNr})
          }
        );
        if (!resPatch.ok) throw new Error(await resPatch.text());
        showPopup('popup-success', `A informação ${n} foi atualizada com sucesso.`, false);
      } catch (e) {
        console.error("❌ Erro ao salvar info:", e);
        showPopup('popup-danger', `Erro ao gravar a informação ${n}.`);
      }
    }
    async function clearInfoGroupFields(n) {
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr"); 
      const group = document.getElementById(`relev-info-${n}`);
      if (!group || !currentCorpOperNr) return;
      const rowId = group.dataset.rowId;
      if (!rowId) return console.error(`⚠️ Sem rowId para limpar relev-info-${n}`);
      const headers = getSupabaseHeaders();
      headers['x-my-corpo'] = currentCorpOperNr;
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {
            method: "PATCH",
            headers: { ...headers, "Prefer": "return=representation" },
            body: JSON.stringify({from: "", destination: "", info: "", corp_oper_nr: currentCorpOperNr})
          }
        );
        if (!res.ok) throw new Error(await res.text());
        document.getElementById(`from-${n}`).value = "";
        document.getElementById(`to-${n}`).value = "";
        document.getElementById(`info-${n}`).value = "";
        showPopup('popup-success', `A informação ${n} foi limpa com sucesso.`);
      } catch (e) {
        console.error("❌ Erro ao limpar info:", e);
        showPopup('popup-danger', `Erro ao limpar a informação ${n}.`);
      }
    }
    /* =======================================
    ROAD CLOSURES
    ======================================= */
    async function waitForRouteInputs(total = 12) {
      const requiredIds = Array.from({ length: total }, (_, i) => `route-${String(i + 1).padStart(2, '0')}-name`);
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (requiredIds.every(id => document.getElementById(id))) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }
    async function loadRoutesFromSupabase(total = 12) {
      createRouteInputs(total);
      await waitForRouteInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) {
        return console.error("❌ [ROUTES] currentCorpOperNr não definido!");
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/street_cut?select=id,group_nr,street_name,cut_motive,cut_until&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, {
            method: "GET",
            headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (nameInput && motiveInput && untilInput) {
            nameInput.dataset.rowId = row.id;
            nameInput.dataset.groupNr = row.group_nr;
            nameInput.value = row.street_name || "";
            motiveInput.value = row.cut_motive || "";
            untilInput.value = row.cut_until || "";
          }
        });
      } catch (e) {
        console.error("❌ [ROUTES] Erro ao carregar:", e);
      }
    }
    async function saveRoutesGroupFields(total = 12) {
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Erro: Sessão não identificada.");
        return;
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (!nameInput) continue;
          const streetName = nameInput.value.trim();
          const cutMotive = motiveInput.value.trim();
          const cutUntil = untilInput.value.trim();
          let rowId = nameInput.dataset.rowId;
          if (!rowId) {
            const resCheck = await fetch(
              `${SUPABASE_URL}/rest/v1/street_cut?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`, {
                headers: headers
              }
            );
            const dataCheck = await resCheck.json();
            if (dataCheck.length > 0) {
              rowId = nameInput.dataset.rowId = dataCheck[0].id;
            }
          }
          if (!rowId) {
            const payloadInsert = [{corp_oper_nr: currentCorpOperNr, group_nr: i, street_name: streetName, cut_motive: cutMotive, cut_until: cutUntil}];
            const resCreate = await fetch(`${SUPABASE_URL}/rest/v1/street_cut`, {
              method: "POST",
              headers: { ...headers, "Prefer": "return=representation" },
              body: JSON.stringify(payloadInsert)
            });
            await utilCheckRes(resCreate, `Erro ao criar a via ${n}`);
            const created = await resCreate.json();
            nameInput.dataset.rowId = created[0].id;
          } 
          else {
            const payloadUpdate = {street_name: streetName, cut_motive: cutMotive, cut_until: cutUntil, corp_oper_nr: currentCorpOperNr};
            await utilCheckRes(await fetch(`${SUPABASE_URL}/rest/v1/street_cut?id=eq.${rowId}`, {
              method: "PATCH",
              headers: headers,
              body: JSON.stringify(payloadUpdate)
            }), `Erro ao atualizar a via ${n}`);
          }
        }
        showPopup('popup-success', "Cortes/Interrompimento de Vias atualizados com sucesso!");
        loadRoutesFromSupabase(total);
      } catch (error) {
        console.error("❌ [ROUTES] Erro ao gravar:", error);
        showPopup('popup-danger', "Erro ao gravar Cortes/Interrompimento de Vias. " + (error.message || ""));
      }
    }
    document.addEventListener("DOMContentLoaded", () => loadRoutesFromSupabase());
    /* =======================================
    AIR RESOURCE CENTERS
    ======================================= */
    function toggleCMAFields(id, enabled) {
      const aero = document.getElementById(`cma_aero_type_${id}`);
      const type = document.getElementById(`cma_type_${id}`);
      const auto = document.getElementById(`cma_auto_${id}`);
      const toggle = document.getElementById(`cma_toggle_${id}`);
      if (!aero || !type || !auto || !toggle) return;
      aero.disabled = !enabled;
      type.disabled = !enabled;
      auto.disabled = !enabled;
      if (!enabled) {
        aero.value = "";
        type.value = "";
        auto.value = "";
      }
      aero.style.background = enabled ? "#fff" : "#f3f3f3";
      type.style.background = enabled ? "#fff" : "#f3f3f3";
      auto.style.background = enabled ? "#fff" : "#f3f3f3";
      aero.style.color = enabled ? "#000" : "#999";
      type.style.color = enabled ? "#000" : "#999";
      auto.style.color = enabled ? "#000" : "#999";
      const slider = toggle.nextElementSibling;
      const circle = slider.firstElementChild;
      if (enabled) {
        slider.style.background = "#28c840";
        circle.style.transform = "translateX(22px)";
        toggle.checked = true;
      } else {
        slider.style.background = "#ff3b30";
        circle.style.transform = "translateX(0px)";
        toggle.checked = false;
      }
    }
    async function loadCMAsFromSupabase() {
      try {
        if (typeof createCmaInputs === "function") createCmaInputs();
        const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
        if (!currentCorpOperNr) {
          console.error("❌ Erro: currentCorpOperNr não encontrado!");
          return;
        }
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr; 
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${currentCorpOperNr}&order=id.asc`, {
            method: "GET",
            headers: headers
          }
        );
        if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
        const data = await res.json();
        if (data.length === 0) {
          console.warn("⚠️ O banco devolveu 0 linhas para a corp:", currentCorpOperNr);
          return;
        }
        const imagensAeronaves = {
          "Heli Ligeiro": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg",
          "Heli Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg",
          "Heli Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg",
          "Avião de Asa Fixa Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg",
          "Avião de Asa Fixa Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"
        };
        data.forEach((row, index) => {
          const n = String(index + 1).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          const imageElement = document.getElementById(`cma_image_${n}`);
          if (nameInput) {
            nameInput.value = row.aero_name || "";
            nameInput.dataset.rowId = row.id; 
          }
          if (typeSelect) {
            typeSelect.value = row.aero_type || "";
            if (imageElement) {
              const src = imagensAeronaves[row.aero_type] || "https://i.imgur.com/4Ho5HRV.png";
              imageElement.src = src;
            }
          }
          if (autoInput) {
            autoInput.value = row.aero_autonomy || "";
          }
          if (row.is_active) {
            toggleCMAFields(n, true);
          }
        });
      } catch (error) {
        console.error("❌ Erro no load:", error);
      }
    }
    async function saveCMAsGroupFields() {
      try {
        const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
        if (!currentCorpOperNr) {
          showPopup('popup-danger', "Erro: Sessão expirada. Faça login novamente.");
          return;
        }
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        for (let i = 1; i <= 6; i++) {
          const n = String(i).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          const toggle = document.getElementById(`cma_toggle_${n}`);
          if (nameInput && nameInput.dataset.rowId) {
            const dbId = nameInput.dataset.rowId;
            const payload = {aero_name: nameInput.value || "", aero_type: typeSelect.value || "", aero_autonomy: autoInput.value || "", is_active: toggle ? toggle.checked : false, corp_oper_nr: currentCorpOperNr};
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${dbId}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(payload)
              }
            );
            if (!res.ok) {
              const errorData = await res.json();
              console.error(`❌ Erro no Card ${n}:`, errorData.message);
              throw new Error(`Falha ao gravar card ${n}`);
            }
          }
        }
        showPopup('popup-success', "Centros de Meios Aéreos atualizados com sucesso!");
        loadCMAsFromSupabase();
      } catch (error) {
        console.error("❌ Erro fatal na gravação:", error);
        showPopup('popup-danger', "Ocorreu um erro ao guardar os dados. Verifique a consola.");
      }
    }
    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);
    /* =======================================
    NO HOSPITAL
    ======================================= */    
    function noHospSig(r) {
      return [r.hospital, r.service, r.start_date, r.start_time, r.end_date, r.end_time, r.next_hospital]
        .map(v => (v == null ? "" : String(v).slice(0, v && /^\d{2}:\d{2}/.test(String(v)) ? 5 : undefined))).join("|");
    }
    async function loadNoHospFromSupabase(total = 12) {
      createNoHospInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) return console.error("❌ [NOHOSP] CorpOperNr não definido!");
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/hospital_restrictions?select=*&corp_oper_nr=eq.${currentCorpOperNr}&order=group_nr.asc`, { 
            method: "GET", 
            headers: headers
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        rows.forEach(row => {
          const n = String(row.group_nr).padStart(2, '0');
          const fields = {
            nohosp: document.getElementById(`nohosp-${n}`),
            serv: document.getElementById(`nohosp-serv-${n}`),
            fromDate: document.getElementById(`nohosp-form-date-${n}`),
            fromTime: document.getElementById(`nohosp-form-time-${n}`),
            toDate: document.getElementById(`nohosp-to-date-${n}`),
            toTime: document.getElementById(`nohosp-to-time-${n}`),
            nextHosp: document.getElementById(`nextHosp-${n}`)
          };
          if (fields.nohosp) {
            fields.nohosp.dataset.rowId = row.id;
            fields.nohosp.value = row.hospital || "";
            fields.serv.value = row.service || "";
            fields.fromDate.value = row.start_date || "";
            fields.fromTime.value = row.start_time || "";
            fields.toDate.value = row.end_date || "";
            fields.toTime.value = row.end_time || "";
            fields.nextHosp.value = row.next_hospital || "";
            // assinatura do que está gravado, para saber depois o que mudou
            fields.nohosp.dataset.orig = noHospSig(row);
          }
        });
      } catch (e) {
        console.error("❌ [NOHOSP] Erro ao carregar:", e);
      }
    }
    /* ====== SAVE NO HOSP GROUP FIELDS (VERSÃO OTIMIZADA) ====== */
    async function saveNoHospGroupFields(total = 12) {
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Erro: Sessão não identificada.");
        return;
      }
      try {
        const headers = getSupabaseHeaders();
        headers['x-my-corpo'] = currentCorpOperNr;
        const novos = [];   // hospitais com constrangimento novo ou alterado (para o push)
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, '0');
          const mainInput = document.getElementById(`nohosp-${n}`);
          if (!mainInput) continue;
          const hospitalValue = mainInput.value.trim();
          if (hospitalValue === "") {
            continue; 
          }
          const clean = (id) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const val = el.value.trim();
            return val === "" ? null : val;
          };
          const payload = {corp_oper_nr: currentCorpOperNr, group_nr: i, hospital: hospitalValue, service: clean(`nohosp-serv-${n}`), start_date: clean(`nohosp-form-date-${n}`),
                           start_time: clean(`nohosp-form-time-${n}`), end_date: clean(`nohosp-to-date-${n}`), end_time: clean(`nohosp-to-time-${n}`), next_hospital: clean(`nextHosp-${n}`)};
          let rowId = mainInput.dataset.rowId;
          if (!rowId) {
            const resCheck = await fetch(
              `${SUPABASE_URL}/rest/v1/hospital_restrictions?select=id&corp_oper_nr=eq.${currentCorpOperNr}&group_nr=eq.${i}`,
              {headers: headers}
            );
            const dataCheck = await resCheck.json();
            if (dataCheck && dataCheck.length > 0) rowId = dataCheck[0].id;
          }
          const changed = !rowId || mainInput.dataset.orig !== noHospSig(payload);
          if (!changed) continue;   // nada mudou nesta linha: não grava nem avisa
          const res = !rowId
            ? await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions`, {
                method: "POST",
                headers: {...headers, "Prefer": "return=representation"},
                body: JSON.stringify([payload])
              })
            : await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions?id=eq.${rowId}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(payload)
              });
          if (!res.ok) throw new Error(await res.text());
          novos.push(payload.service ? `${hospitalValue} (${payload.service})` : hospitalValue);
        }
        /* push geral para a Mobile (abre a página dos constrangimentos); não espera pelo envio */
        if (novos.length) {
          fetch('https://cb-360-app.vercel.app/api/sendPush', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({recipient_nint: 'geral', tipo: 'aviso', pagina: 'NoHospital', sender_name: 'CB360 Online',
                                  message_text: `🏥 Constrangimento hospitalar: ${novos.join(', ')}`})
          }).catch(e => console.error('Erro Push:', e));
        }
        showPopup('popup-success', "Constrangimentos hospitalares atualizados com sucesso.");
        loadNoHospFromSupabase(total);
      } catch (error) {
        console.error("❌ [NOHOSP] Erro ao gravar:", error);
        showPopup('popup-danger', "Erro ao gravar constrangimentos hospitalares.");
      }
    }
    /* =======================================
    MISSING REPORTS
    ======================================= */
    async function loadocrReportsFromSupabase(total = 24) {
      createOcrReportsInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Erro: Sessão não identificada.");
        return;
      }
      try {
        const url = `${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${currentCorpOperNr}&order=report_date.desc`;
        const response = await fetch(url, {headers: getSupabaseHeaders()});
        const raw = await response.text();
        const data = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(data)) {
          console.error("Resposta inválida:", data);
          showPopup('popup-danger', "Erro ao carregar dados.");
          return;
        }
        data.slice(0, total).forEach((report, index) => {
          const n = String(index + 1).padStart(2, '0');
          const nIntInput = document.getElementById(`report-${n}-nint`);
          const nrInput   = document.getElementById(`report-${n}-nr`);
          const dateInput = document.getElementById(`report-${n}-date`);
          const statusSel = document.getElementById(`report-${n}-status`);
          if (nIntInput) nIntInput.value = report.n_int ?? '';
          if (nrInput)   nrInput.value   = report.report_nr ?? '';
          if (dateInput) {
            if (report.report_date) {
              dateInput.value = report.report_date ? String(report.report_date).slice(0, 10) : '';
            } else {
              dateInput.value = '';
            }
          }
          if (statusSel) {
            statusSel.value = (report.report_state === true) ? 'done' : 'pending';
          }
        });
      } catch (err) {
        console.error("Erro ao carregar OCR reports:", err);
        showPopup('popup-danger', "Erro de ligação ao servidor.");
      }
    }
    async function saveOcrReportsToSupabase(total = 24) {
      const saveBtn = document.getElementById("save-ocr-reports");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
      }    
      const corp_oper_nr_raw = sessionStorage.getItem("currentCorpOperNr");
      if (!corp_oper_nr_raw) {
        showPopup('popup-danger', "Erro: Corporação não identificada.");
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Guardar"; }
        return;
      }
      const corp_oper_nr = corp_oper_nr_raw.toString().padStart(4, "0");
      const headers = getSupabaseHeaders();
      const normText = (s) => (s || "").toString().trim();
      const normKeyText = (s) => normText(s).toLowerCase();
      const makeKey = (r) =>
        `${r.corp_oper_nr}|${r.n_int}|${normKeyText(r.report_nr)}|${r.report_date || ""}`;    
      try {
        const rowsRaw = [];
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, "0");    
          const nIntEl = document.getElementById(`report-${n}-nint`);
          const nrEl   = document.getElementById(`report-${n}-nr`);
          const dateEl = document.getElementById(`report-${n}-date`);
          const stEl   = document.getElementById(`report-${n}-status`);    
          const n_int_raw   = normText(nIntEl?.value);
          const report_nr   = normText(nrEl?.value);
          const report_date = normText(dateEl?.value);
          const status      = normText(stEl?.value);    
          if (!n_int_raw && !report_nr && !report_date && !status) continue;    
          const n_int = n_int_raw ? parseInt(n_int_raw, 10) : null;
          if (!Number.isInteger(n_int)) continue;    
          rowsRaw.push({corp_oper_nr, n_int, report_nr: report_nr || null, report_date: report_date || null, report_state: status === "done"});
        }
        if (rowsRaw.length === 0) {
          showPopup('popup-danger', "Sem registos para guardar.");
          return;
        }
        const formMap = new Map();
        for (const r of rowsRaw) formMap.set(makeKey(r), r);
        const rows = [...formMap.values()];
        const getUrl = `${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${corp_oper_nr}`;    
        const getRes = await fetch(getUrl, { headers });
        const getRaw = await getRes.text();
        const existing = getRaw ? JSON.parse(getRaw) : [];    
        if (!Array.isArray(existing)) {
          console.error("Existing inválido:", existing);
          showPopup('popup-danger', "Erro ao validar dados existentes.");
          return;
        }
        const existingMap = new Map();
        for (const r of existing) {
          const key = makeKey({corp_oper_nr, n_int: r.n_int, report_nr: r.report_nr || null, report_date: r.report_date ? new Date(r.report_date).toISOString().split("T")[0] : null});
          existingMap.set(key, { report_state: r.report_state === true });
        }
        const toInsert = [];
        const toUpdate = [];    
        for (const r of rows) {
          const key = makeKey(r);
          const old = existingMap.get(key);    
          if (!old) {
            toInsert.push(r);
          } else {
            if (old.report_state !== (r.report_state === true)) {
              toUpdate.push(r);
            }
          }
        }    
        if (toInsert.length === 0 && toUpdate.length === 0) {
          showPopup('popup-danger', "Sem alterações para guardar.");
          return;
        }
        if (toInsert.length > 0) {
          const insRes = await fetch(`${SUPABASE_URL}/rest/v1/reports_control`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation"
            },
            body: JSON.stringify(toInsert)
          });    
          if (!insRes.ok) {
            const t = await insRes.text();
            console.error("Erro INSERT reports_control:", t);
            showPopup('popup-danger', "Erro ao inserir novos registos.");
            return;
          }
        }
        for (const r of toUpdate) {
          const reportNrEncoded = encodeURIComponent(r.report_nr || "");
          const reportDateVal = r.report_date || "";    
          const updUrl =
            `${SUPABASE_URL}/rest/v1/reports_control` +
            `?corp_oper_nr=eq.${corp_oper_nr}` +
            `&n_int=eq.${r.n_int}` +
            `&report_nr=eq.${reportNrEncoded}` +
            `&report_date=eq.${reportDateVal}`;    
          const updRes = await fetch(updUrl, {
            method: "PATCH",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ report_state: r.report_state === true })
          });    
          if (!updRes.ok) {
            const t = await updRes.text();
            console.error("Erro UPDATE reports_control:", t, "URL:", updUrl);
            showPopup('popup-danger', "Erro ao atualizar registos.");
            return;
          }
        }
        try {
          const affected = [...toInsert, ...toUpdate];
          const uniqueNints = [...new Set(affected.map(r => r.n_int).filter(n => Number.isInteger(n)))];    
          if (uniqueNints.length > 0) {
            const now = new Date().toISOString();
            const msgNotif = `⚠️ ATENÇÃO! Tem Relatórios de Ocorrência Pendentes. Consulte o menú "Relatórios de Ocorrência".`;    
            const notifications = uniqueNints.map(nint => ({n_int: nint, corp_oper_nr: corp_oper_nr, title: "Relatórios de Ocorrência", message: msgNotif, is_read: false, created_at: now}));    
            const notifRes = await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify(notifications)
            });
    
            if (!notifRes.ok) {
              const rawN = await notifRes.text();
              console.error("Erro ao inserir user_notifications:", rawN);
            }    
            for (const nint of uniqueNints) {
              fetch("https://cb-360-app.vercel.app/api/sendPush", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({recipient_nint: nint.toString(), tipo: 'aviso', pagina: 'MissReport', sender_name: "CB360 Online", message_text: msgNotif})
              }).catch(errPush => console.error("Erro ao enviar push (nint=" + nint + "):", errPush));
            }
          }
        } catch (errNotif) {
          console.error("Erro no fluxo de notificações:", errNotif);
        }    
        showPopup('popup-success', `Relatórios de Ocorrência Guardados! Novos: ${toInsert.length} | Atualizados: ${toUpdate.length}`);    
      } catch (err) {
        console.error("Erro geral save OCR reports:", err);
        showPopup('popup-danger', "Erro de ligação ao servidor.");
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar";
        }
      }
    }
    /* =====================================================================
    CB360 ONLINE — NRBQ: FICHA DE NOTIFICAÇÃO INICIAL (FNI)
    ===================================================================== */
    (function () {
      const SPEC = {"page": "NRBQ_FNI", "short": "FNI", "title": "NOTIFICAÇÃO INICIAL", "sub": "NRBQ · DON N.º 3", "pdfTitle": "FICHA DE NOTIFICAÇÃO INICIAL (FNI) — INCIDENTES COM SUSPEITA OU ENVOLVIMENTO DE AGENTES NRBQ", "file": "FNI_NRBQ", "icon": "campaign", "sections": [{"t": "Informação Geral", "i": "assignment", "f": [{"k": "ocorrencia", "l": "N.º Ocorrência ANEPC", "type": "text", "req": 1}, {"k": "data_notif", "l": "Data da Notificação", "type": "date", "req": 1, "now": 1, "half": 1}, {"k": "hora_notif", "l": "Hora da Notificação", "type": "time", "req": 1, "now": 1, "half": 1}, {"k": "operador", "l": "Nome do Operador (recetor)", "type": "text", "req": 1}, {"k": "emissor_id", "l": "Emissor da Notificação — Identificação", "type": "text", "req": 1}, {"k": "emissor_contactos", "l": "Emissor da Notificação — Contactos", "type": "text", "ph": "Telefone / email"}]}, {"t": "Informação Relativa ao Incidente", "i": "place", "f": [{"k": "data_inc", "l": "Data do Incidente", "type": "date", "half": 1}, {"k": "hora_inc", "l": "Hora do Incidente", "type": "time", "half": 1}, {"k": "data_obs", "l": "Data de Observação", "type": "date", "half": 1}, {"k": "hora_obs", "l": "Hora de Observação", "type": "time", "half": 1}, {"k": "local", "l": "Local / Concelho / Distrito", "type": "text", "req": 1}, {"k": "referencia", "l": "Ponto de Referência", "type": "text"}, {"k": "coordenadas", "l": "Coordenadas (Datum / Lat-Long)", "type": "gps"}, {"k": "onde", "l": "Onde ocorreu o incidente?", "type": "select", "opts": ["Via Pública", "Edifício"], "req": 1}]}, {"t": "1. Via Pública", "i": "add_road", "showIf": ["onde", "Via Pública"], "f": [{"k": "estrada", "l": "Estrada (km / sentido)", "type": "text"}, {"k": "arruamento", "l": "Arruamento (n.º Polícia / Porta e Sentido)", "type": "text"}, {"k": "ferrovia", "l": "Linha Ferroviária (km / pk / sentido)", "type": "text"}, {"k": "outra_ref", "l": "Outra referência do Local", "type": "text"}, {"k": "localidade", "l": "Localidade (exata ou a mais próxima)", "type": "text"}]}, {"t": "2. Edifício", "i": "apartment", "showIf": ["onde", "Edifício"], "f": [{"k": "estab_id", "l": "Identificação do Estabelecimento", "type": "text"}, {"k": "estab_morada", "l": "Morada", "type": "text"}, {"k": "estab_tipo", "l": "Tipo de Estabelecimento", "type": "select", "opts": ["Comércio", "Indústria", "Armazém", "Interface marítimo", "Interface rodoviário", "Interface ferroviário", "Aeroporto", "Habitação", "Escritórios", "Saúde", "Escola", "Lar", "Outro"]}, {"k": "estab_outro", "l": "Outro — especifique", "type": "text", "showIf": ["estab_tipo", "Outro"]}]}, {"t": "3. Eventuais Vítimas", "i": "personal_injury", "f": [{"k": "vitimas", "l": "Existem vítimas no local do incidente?", "type": "select", "opts": ["Sim", "Não"], "req": 1}, {"k": "n_vitimas", "l": "Quantas (aproximadamente)", "type": "number", "half": 1, "showIf": ["vitimas", "Sim"]}, {"k": "n_mortos", "l": "N.º de Mortos", "type": "number", "half": 1, "showIf": ["vitimas", "Sim"]}, {"k": "sintomas", "l": "Principais sintomas (descreva)", "type": "area", "showIf": ["vitimas", "Sim"]}]}, {"t": "4. Mercadorias e Substâncias Perigosas", "i": "science", "f": [{"k": "nome_comum", "l": "Nome Comum", "type": "text"}, {"k": "onu", "l": "N.º ONU", "type": "text", "half": 1, "ph": "Ex.: 1203"}, {"k": "perigo", "l": "N.º Perigo", "type": "text", "half": 1, "ph": "Ex.: 33"}, {"k": "etiquetas", "l": "Etiquetas ou Rótulos de perigo", "type": "text"}, {"k": "quantidade", "l": "Quantidade (estimada)", "type": "text"}, {"k": "descricao_visual", "l": "Descrição Visual", "type": "area"}, {"k": "contentor", "l": "Tipo de Contentor", "type": "select", "opts": ["Cisterna", "Garrafas de gás comprimido", "Tambores", "Outro"]}, {"k": "cisterna_m3", "l": "Cisterna — capacidade (m³)", "type": "number", "showIf": ["contentor", "Cisterna"]}, {"k": "garrafas_l", "l": "Garrafas — capacidade (litros)", "type": "number", "showIf": ["contentor", "Garrafas de gás comprimido"]}, {"k": "tambores_l", "l": "Tambores — capacidade (litros)", "type": "number", "showIf": ["contentor", "Tambores"]}, {"k": "contentor_outro", "l": "Outro contentor — especifique", "type": "text", "showIf": ["contentor", "Outro"]}, {"k": "transporte", "l": "Tipo de Transporte", "type": "select", "opts": ["Rodoviário", "Ferroviário", "Marítimo", "Fluvial", "Conduta (pipeline)", "Aéreo"]}, {"k": "fase", "l": "Fase do Transporte", "type": "select", "opts": ["Carga", "Descarga", "Em Transporte"]}]}, {"t": "5. Natureza do Incidente", "i": "local_fire_department", "f": [{"k": "derrame", "l": "Derrame (líquido) — Quantidade estimada", "type": "text"}, {"k": "fuga", "l": "Fuga (vapor / gás) — Quantidade estimada", "type": "text"}, {"k": "espalhamento", "l": "Espalhamento (sólido) — Quantidade estimada", "type": "text"}, {"k": "incendio", "l": "Incêndio", "type": "select", "opts": ["Sim", "Não"], "half": 1}, {"k": "explosao", "l": "Explosão", "type": "select", "opts": ["Sim", "Não"], "half": 1}, {"k": "outra_info", "l": "Outra informação relevante", "type": "area"}]}, {"t": "6. Matéria Não-identificada — Suspeita de risco NRBQ", "i": "help_center", "f": [{"k": "cheiro", "l": "Indícios de perigosidade — Cheiro", "type": "select", "opts": ["Sim", "Não"]}, {"k": "cheiro_tipo", "l": "Que tipo de cheiro", "type": "text", "ph": "Ex.: alho, piscina, ovos podres…", "showIf": ["cheiro", "Sim"]}, {"k": "cor_derrame", "l": "Cor do derrame", "type": "text"}, {"k": "origem_fuga", "l": "Origem da fuga", "type": "text"}, {"k": "vitimas_mat", "l": "Existem vítimas no local?", "type": "select", "opts": ["Sim", "Não"]}]}, {"t": "7. Origem do Incidente", "i": "travel_explore", "f": [{"k": "origem_conhecida", "l": "É conhecida a origem do incidente?", "type": "select", "opts": ["Sim", "Não"]}, {"k": "origem_qual", "l": "Qual", "type": "text", "showIf": ["origem_conhecida", "Sim"]}, {"k": "reg_explosao", "l": "Há registo de explosão?", "type": "select", "opts": ["Sim", "Não"]}, {"k": "reg_ataque", "l": "Há registo de outro tipo de incidente e/ou ataque?", "type": "select", "opts": ["Sim", "Não"]}, {"k": "ameaca_bomba", "l": "Existe ameaça de bomba no local?", "type": "select", "opts": ["Sim", "Não"]}]}, {"t": "8. Características da Chamada de Alerta", "i": "call", "closed": 1, "f": [{"k": "tipo_chamada", "l": "Tipo de Chamada", "type": "select", "opts": ["Local", "Regional", "Nacional", "Móvel", "Internacional"]}, {"k": "sexo", "l": "Sexo", "type": "select", "opts": ["Feminino", "Masculino"], "half": 1}, {"k": "idade", "l": "Idade aproximada", "type": "number", "half": 1}, {"k": "voz", "l": "Características da Voz", "type": "multi", "opts": ["Forte", "Suave", "Aguda", "Rouca", "Agradável", "Denotada Embriaguez"]}, {"k": "sotaque", "l": "Sotaque", "type": "select", "opts": ["Local", "Regional", "Estrangeiro", "Étnico", "Outros"]}, {"k": "modo", "l": "Modo", "type": "multi", "opts": ["Calmo", "Racional", "Coerente", "Deliberado", "Direto", "Correto", "Irritante", "Irracional", "Incoerente", "Emocional"]}, {"k": "sons", "l": "Sons de Fundo", "type": "multi", "opts": ["Barulho", "Silêncio", "Misturado", "Comboio", "Música", "Vozes", "Cozinha", "Aeronaves", "Animais", "Máquinas", "Tráfego de rua", "Reunião de rua", "Outros"]}]}, {"t": "9. Outras Informações", "i": "notes", "f": [{"k": "outras", "l": "Outras informações", "type": "area"}, {"k": "optel", "l": "OPTEL", "type": "text", "req": 1}]}]};
      const API_URL = 'https://cb360-online.vercel.app/api/various_convert_and_send';
      const FIELDS = SPEC.sections.flatMap(x => x.f);
      const ST = {id: null, status: 'rascunho', data: {}, dirty: false, saving: null, list: [], loaded: false};
      const ssGet = k => {try {return sessionStorage.getItem(k); } catch (_) { return null; }};
      const ssSet = (k, v) => {try {v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (_) {}};
      const corp = () => String(ssGet('currentCorpOperNr') || '').padStart(4, '0');
      const nint = () => ssGet('currentNInt') || '';
      const CUR_KEY = () => `cb360_nrbq_fni_atual_${corp()}`;
      const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
      const pad = n => String(n).padStart(2, '0');
      const nowLocal = () => {const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;};
      const nowFor = type => {const v = nowLocal(); return type === 'date' ? v.slice(0, 10) : type === 'time' ? v.slice(11) : v;};
      const hdr = (extra = {}) => ({...getSupabaseHeaders(), 'Content-Type': 'application/json', ...extra});
      const root = () => document.getElementById('nrbqFni');
      const q = sel => root() ? root().querySelector(sel) : null;
      let D = ST.data;
      /* ----------------------------- estilos (tudo dentro de #nrbqFni) ----------------------------- */
      (function css() {
        if (document.getElementById('nf-css')) return;
        if (!document.querySelector('link[href*="family=Material+Icons"]')) {
          const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'; document.head.appendChild(l);
        }
        const st = document.createElement('style'); st.id = 'nf-css';
        st.textContent = `
          #nrbqFni {--nf-red: #c62828; --nf-red-dark: #8b0000; --nf-red-light: rgba(198,40,40,.10); --nf-line: #d9dde3; --nf-txt: #1f2933; --nf-txt2: #5c6670; --nf-txt3: #9aa3ad;
                    --nf-bg: #f6f7f9; --nf-green: #2e7d32; display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: var(--nf-txt);}
          #nrbqFni .material-icons {font-size: 20px; line-height: 1;}
          #nrbqFni .nf-top {display: flex; flex-direction: column; gap: 10px;}
          #nrbqFni .nf-prog { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid var(--nf-line); border-radius: 12px; padding: 10px 14px;}
          #nrbqFni .nf-prog > .material-icons {color: var(--nf-red); font-size: 24px;}
          #nrbqFni .nf-prog-in {flex: 1; min-width: 0;}
          #nrbqFni .nf-prog-top {display: flex; justify-content: space-between; font-weight: 600; color: var(--nf-txt2); font-size: 12px;}
          #nrbqFni .nf-prog-top b {color: var(--nf-txt); font-size: 13px;}
          #nrbqFni .nf-bar {height: 6px; background: #eceff2; border-radius: 3px; overflow: hidden; margin-top: 6px;}
          #nrbqFni .nf-bar span {display: block; height: 100%; width: 0; background: linear-gradient(to right, var(--nf-red-dark), var(--nf-red)); transition: width .3s;}
          #nrbqFni .nf-draft {margin-top: 5px; font-size: 11px; color: var(--nf-txt3); display: flex; align-items: center; gap: 4px;}
          #nrbqFni .nf-draft .material-icons {font-size: 14px;}
          #nrbqFni .nf-draft.sent {color: var(--nf-green); font-weight: 700;}
          #nrbqFni .nf-side {display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end;}
          #nrbqFni .nf-list {box-sizing: border-box; height: 40px; margin: 0; min-width: 260px; border: 1px solid var(--nf-line); border-radius: 10px; padding: 0 10px; font: inherit; background: #fff; color: var(--nf-txt);}
          #nrbqFni .nf-btn {box-sizing: border-box; height: 40px; min-height: 40px; max-height: 40px; margin: 0; line-height: 1; border: 1px solid transparent; border-radius: 10px; padding: 0 14px; font: inherit; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;}
          #nrbqFni .nf-ghost {background: #fff; color: var(--nf-txt2); border: 1px solid var(--nf-line);}
          #nrbqFni .nf-ghost:hover {border-color: var(--nf-red); color: var(--nf-red);}
          #nrbqFni .nf-ghost.sure {background: var(--nf-red); color: #fff; border-color: var(--nf-red);}
          #nrbqFni .nf-main {background: linear-gradient(to right, var(--nf-red-dark), var(--nf-red)); border-color: var(--nf-red); color: #fff; box-shadow: 0 3px 10px rgba(198,40,40,.25);}
          #nrbqFni .nf-main.warn {background: linear-gradient(to right, #8a5a00, #ef8f00);}
          #nrbqFni .nf-btn:disabled {opacity: .6; cursor: default;}
          #nrbqFni .nf-scroll {height: calc(100vh - 470px); min-height: 420px; overflow-y: auto; padding-right: 6px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar {width: 8px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar-track {background: #eceff2; border-radius: 999px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar-thumb {background: linear-gradient(var(--nf-red), var(--nf-red-dark)); border-radius: 999px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar-thumb:hover {background: var(--nf-red-dark);}
          #nrbqFni .nf-scroll::-webkit-scrollbar-button {display: none; height: 0;}
          @supports not selector(::-webkit-scrollbar) {#nrbqFni .nf-scroll {scrollbar-width: thin; scrollbar-color: var(--nf-red) #eceff2;}}
          #nrbqFni .nf-sec {background: #fff; border: 1px solid var(--nf-line); border-radius: 12px; margin-bottom: 10px; overflow: hidden;}
          #nrbqFni .nf-sec-head {display: flex; align-items: center; gap: 10px; padding: 11px 14px; cursor: pointer; user-select: none;}
          #nrbqFni .nf-sec-head:hover {background: #fafbfc;}
          #nrbqFni .nf-sec-icon {width: 32px; height: 32px; border-radius: 9px; background: var(--nf-red-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
          #nrbqFni .nf-sec-icon .material-icons {font-size: 18px; color: var(--nf-red);}
          #nrbqFni .nf-sec-title {flex: 1; font-weight: 700; font-size: 13.5px;}
          #nrbqFni .nf-cnt {font-size: 11px; font-weight: 700; color: var(--nf-txt2); background: #eef0f3; border-radius: 999px; padding: 3px 9px;}
          #nrbqFni .nf-cnt.done {background: rgba(46,125,50,.14); color: var(--nf-green);}
          #nrbqFni .nf-chev {color: var(--nf-txt3); transition: transform .2s;}
          #nrbqFni .nf-sec.closed .nf-chev {transform: rotate(-90deg);}
          #nrbqFni .nf-sec.closed .nf-body {display: none;}
          #nrbqFni .nf-sec.hidden {display: none;}
          #nrbqFni .nf-body {border-top: 1px solid #eef0f3; padding: 14px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px 14px;}
          #nrbqFni .nf-fld {grid-column: span 3; display: flex; flex-direction: column; gap: 5px; min-width: 0;}
          #nrbqFni .nf-fld.s2 {grid-column: span 2;}
          #nrbqFni .nf-fld.s6 {grid-column: span 6;}
          #nrbqFni .nf-fld.hidden {display: none;}
          #nrbqFni .nf-lbl {font-size: 11.5px; font-weight: 600; color: var(--nf-txt2);}
          #nrbqFni .nf-lbl .req {color: var(--nf-red); margin-left: 2px;}
          #nrbqFni .nf-lbl .hint {font-weight: 500; color: var(--nf-txt3); margin-left: 4px;}
          #nrbqFni .nf-in {width: 100%; height: 38px; border: 1px solid var(--nf-line); border-radius: 8px; background: #fff; color: var(--nf-txt); font: inherit; font-size: 13.5px; padding: 0 10px; box-sizing: border-box;}
          #nrbqFni textarea.nf-in {height: auto; min-height: 70px; padding: 8px 10px; resize: vertical; line-height: 1.4;}
          #nrbqFni .nf-in:focus {outline: none; border-color: var(--nf-red); box-shadow: 0 0 0 3px var(--nf-red-light);}
          #nrbqFni .nf-fld.missing .nf-in, #nrbqFni .nf-fld.missing .nf-chips {border-color: var(--nf-red); box-shadow: 0 0 0 3px var(--nf-red-light); border-radius: 8px;}
          #nrbqFni .nf-chips {display: flex; flex-wrap: wrap; gap: 6px;}
          #nrbqFni .nf-chip {border: 1px solid var(--nf-line); background: #fff; color: var(--nf-txt); border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer;}
          #nrbqFni .nf-chip:hover {border-color: var(--nf-red);}
      #nrbqFni .nf-chip.on {background: var(--nf-red); border-color: var(--nf-red); color: #fff;}
          #nrbqFni .nf-gps {display: flex; gap: 8px;}
          #nrbqFni .nf-gps a {flex-shrink: 0; width: 38px; height: 38px; border-radius: 8px; background: var(--nf-red-light); color: var(--nf-red); display: flex; align-items: center; justify-content: center; text-decoration: none;}
          #nrbqFni .nf-rows {display: flex; flex-direction: column; gap: 10px;}
          #nrbqFni .nf-row-card {border: 1px dashed var(--nf-line); border-radius: 10px; padding: 10px; background: var(--nf-bg);}
          #nrbqFni .nf-row-head {display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px;}
          #nrbqFni .nf-row-del {border: 0; background: transparent; color: var(--nf-txt3); cursor: pointer;}
          #nrbqFni .nf-row-body {display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px 12px;}
          #nrbqFni .nf-row-add {align-self: flex-start; border: 1px dashed var(--nf-red); background: var(--nf-red-light); color: var(--nf-red); border-radius: 999px; padding: 6px 14px 6px 10px; font: inherit; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;}
          #nrbqFni .zone {border-left: 4px solid; padding-left: 8px;}
          #nrbqFni .zone.hot {border-color: #d32f2f;} #nrbqFni .zone.warm {border-color: #f9a825;} #nrbqFni .zone.cold {border-color: #2e7d32;}
          @media (max-width: 1100px) {#nrbqFni .nf-fld, #nrbqFni .nf-fld.s2 {grid-column: span 6;}}
        `;
        document.head.appendChild(st);
      })();
      /* ----------------------------- regras do formulário ----------------------------- */
      function cond(c) {if (!c) return true; const [k, ...vals] = c; return vals.includes(D[k]);}
      function secOf(f) {return SPEC.sections.find(s => s.f.includes(f));}
      function visible(f) {return cond(f.showIf) && cond((secOf(f) || {}).showIf);}
      function rowEmpty(r) {return !r || Object.values(r).every(x => x == null || String(x).trim() === '');}
      function filled(f) {
        const v = D[f.k];
        if (f.type === 'rows') return Array.isArray(v) && v.some(r => !rowEmpty(r));
        return Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== '';
      }
      function span(f) {
        if (['area', 'rows', 'multi', 'gps'].includes(f.type)) return 's6';
        if (f.type === 'select' && (f.opts.length > 4 || f.opts.some(o => o.length > 22))) return 's6';
        if (f.half || f.third) return 's2';
        return '';
      }
      function rowsHtml(f) {
        if (!Array.isArray(D[f.k]) || !D[f.k].length) D[f.k] = [{}];
        const rows = D[f.k];
        const cell = (c, r, i) => {
          const v = r[c.k] == null ? '' : r[c.k];
          const at = `data-rk="${f.k}" data-ri="${i}" data-rc="${c.k}"`;
          let ctl;
          if (c.type === 'select') ctl = `<div class="nf-chips" ${at}>${c.opts.map(o => `<button type="button" class="nf-chip ${v === o ? 'on' : ''}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
          else {
            const ty = {number: 'number', datetime: 'datetime-local', time: 'time', date: 'date'}[c.type] || 'text';
            ctl = `<input class="nf-in" type="${ty}" ${at} value="${esc(v)}" placeholder="${esc(c.ph || '')}" autocomplete="off">`;
          }
          return `<div class="nf-fld ${c.type === 'select' ? 's6' : c.half ? 's2' : ''}"><span class="nf-lbl">${esc(c.l)}</span>${ctl}</div>`;
        };
        return `<div class="nf-rows">${rows.map((r, i) => `
          <div class="nf-row-card">
            <div class="nf-row-head"><span>${esc(f.item)} ${i + 1}</span>${rows.length > 1 ? `<button type="button" class="nf-row-del" data-rowdel="${f.k}" data-ri="${i}" title="Remover"><span class="material-icons">close</span></button>` : ''}</div>
            <div class="nf-row-body">${f.cols.map(c => cell(c, r, i)).join('')}</div>
          </div>`).join('')}
          ${rows.length < f.max ? `<button type="button" class="nf-row-add" data-rowadd="${f.k}"><span class="material-icons">add</span>Adicionar ${esc(f.item.toLowerCase())}</button>` : ''}</div>`;
      }
      function fieldHtml(f) {
        const v = D[f.k] == null ? '' : D[f.k];
        const cls = ['nf-fld', span(f), f.zone ? 'zone ' + f.zone : '', visible(f) ? '' : 'hidden'].join(' ');
        const lbl = `<label class="nf-lbl" for="nf_${f.k}">${esc(f.l)}${f.req ? '<span class="req">*</span>' : ''}${f.hint ? `<span class="hint">(${esc(f.hint)})</span>` : ''}</label>`;
        let ctl;
        if (f.type === 'rows') ctl = rowsHtml(f);
        else if (f.type === 'select' || f.type === 'multi') {
          const on = o => f.type === 'multi' ? (Array.isArray(v) && v.includes(o)) : v === o;
          ctl = `<div class="nf-chips" data-k="${f.k}"${f.type === 'multi' ? ' data-multi="1"' : ''}>${f.opts.map(o => `<button type="button" class="nf-chip ${on(o) ? 'on' : ''}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
        } else if (f.type === 'area') {
          ctl = `<textarea class="nf-in" id="nf_${f.k}" data-k="${f.k}" rows="2" placeholder="${esc(f.ph || '')}">${esc(v)}</textarea>`;
        } else if (f.type === 'gps') {
          const ll = String(v).match(/-?\d+(\.\d+)?/g);
          ctl = `<div class="nf-gps"><input class="nf-in" id="nf_${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="37.01928, -7.93044" autocomplete="off">` +
                `<a href="${ll && ll.length >= 2 ? `https://www.google.com/maps?q=${ll[0]},${ll[1]}` : 'https://www.google.com/maps'}" target="_blank" rel="noopener" title="Ver no mapa"><span class="material-icons">map</span></a></div>`;
        } else {
          const t = {text: 'text', number: 'number', time: 'time', date: 'date', datetime: 'datetime-local'}[f.type] || 'text';
          ctl = `<input class="nf-in" type="${t}" id="nf_${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph || '')}"${f.type === 'number' ? ' min="0"' : ''}${f.list ? ` list="nfdl_${f.k}"` : ''} autocomplete="off">` + (f.list ? `<datalist id="nfdl_${f.k}">${f.list.map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : '');
        }
        return `<div class="${cls}" id="nfw_${f.k}">${lbl}${ctl}</div>`;
      }
      /* ----------------------------- desenhar ----------------------------- */
      function shell() {
        const box = document.getElementById('nrbqFniBoard');
        if (!box || box.dataset.ready) return !!box;
        box.dataset.ready = '1';
        box.innerHTML = `
          <div id="nrbqFni">
            <div class="nf-top">
              <div class="nf-side">
                <select class="nf-list" id="nfList" title="Fichas guardadas"><option value="">Fichas guardadas…</option></select>
                <button type="button" class="nf-btn nf-ghost" id="nfNew"><span class="material-icons">restart_alt</span><span>Nova</span></button>
                <button type="button" class="nf-btn nf-ghost" id="nfPdf"><span class="material-icons">picture_as_pdf</span><span>PDF</span></button>
                <button type="button" class="nf-btn nf-main" id="nfSend"><span class="material-icons">send</span><span>Enviar ficha</span></button>
              </div>
              <div class="nf-prog">
                <span class="material-icons">${esc(SPEC.icon)}</span>
                <div class="nf-prog-in">
                  <div class="nf-prog-top"><span>Preenchimento</span><b id="nfProgTxt">0 / 0</b></div>
                  <div class="nf-bar"><span id="nfProgBar"></span></div>
                  <div class="nf-draft" id="nfDraft"><span class="material-icons">cloud_queue</span>Ficha nova (ainda não gravada)</div>
                </div>
              </div>
            </div>
            <div class="nf-scroll" id="nfScroll"><div id="nfForm"></div></div>
          </div>`;
        wire();
        return true;
      }
      function render() {
        FIELDS.forEach(f => { if (f.now && !D[f.k]) D[f.k] = nowFor(f.type); });
        q('#nfForm').innerHTML = SPEC.sections.map((s, i) => `
          <div class="nf-sec closed${cond(s.showIf) ? '' : ' hidden'}" id="nfs_${i}">
            <div class="nf-sec-head" data-sec="${i}">
              <div class="nf-sec-icon"><span class="material-icons">${s.i}</span></div>
              <div class="nf-sec-title">${esc(s.t)}</div>
              <span class="nf-cnt" id="nfc_${i}"></span>
              <span class="material-icons nf-chev">expand_more</span>
            </div>
            <div class="nf-body">${s.f.map(fieldHtml).join('')}</div>
          </div>`).join('');
        refresh();
        draftInfo();
      }
      function refresh() {
        let tot = 0, ok = 0;
        SPEC.sections.forEach((s, i) => {
          let st = 0, so = 0;
          const sec = q('#nfs_' + i); if (!sec) return;
          sec.classList.toggle('hidden', !cond(s.showIf));
          s.f.forEach(f => {
            const w = q('#nfw_' + f.k), vis = visible(f);
            if (w) w.classList.toggle('hidden', !vis);
            if (!vis) return;
            st++; if (filled(f)) {so++; if (w) w.classList.remove('missing');}
          });
          tot += st; ok += so;
          const c = q('#nfc_' + i); c.textContent = `${so}/${st}`; c.classList.toggle('done', so === st);
        });
        q('#nfProgTxt').textContent = `${ok} / ${tot}`;
        q('#nfProgBar').style.width = (tot ? Math.round(ok / tot * 100) : 0) + '%';
      }
      function openSec(sec, toggle) {
        if (!sec) return;
        const wasOpen = !sec.classList.contains('closed');
        root().querySelectorAll('.nf-sec').forEach(s => s.classList.add('closed'));
        if (toggle && wasOpen) return;
        sec.classList.remove('closed');
        const sc = q('#nfScroll');
        requestAnimationFrame(() => sc.scrollTo({top: Math.max(0, sec.offsetTop - sc.offsetTop), behavior: 'smooth'}));
      }
      function draftInfo(msg) {
        const el = q('#nfDraft'); if (!el) return;
        if (msg) {el.className = 'nf-draft'; el.innerHTML = msg; return;}
        if (!ST.id) {el.className = 'nf-draft'; el.innerHTML = '<span class="material-icons">cloud_queue</span>Ficha nova (ainda não gravada)'; return;}
        const sent = ST.status === 'enviada';
        el.className = 'nf-draft' + (sent ? ' sent' : '');
        el.innerHTML = sent ? `<span class="material-icons">mark_email_read</span>Ficha n.º ${ST.id} · enviada${D._enviada ? ' às ' + new Date(D._enviada).toLocaleTimeString('pt-PT', {hour: '2-digit', minute: '2-digit'}) : ''} (as alterações continuam a ser gravadas)`
                        : `<span class="material-icons">cloud_done</span>Ficha n.º ${ST.id} · rascunho gravado na base de dados`;
      }
      function note(msg, type = 'popup-success') {
        if (typeof showPopup === 'function') showPopup(type, msg); else alert(msg);
      }
      /* ----------------------------- gravar na base de dados (nrbq_forms) ----------------------------- */
      let saveT;
      function save(now) {
        ST.dirty = true;
        clearTimeout(saveT);
        saveT = setTimeout(persist, now ? 0 : 900);
      }
      async function persist() {
        while (ST.saving) await ST.saving;
        if (!ST.dirty) return ST.id;
        ST.dirty = false;
        const job = (async () => {
          await null;
          try {
            if (!ST.id) {
              const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms`, {method: 'POST', headers: hdr({Prefer: 'return=representation'}),
                body: JSON.stringify({corp_oper_nr: corp(), form_type: 'FNI', data: D, created_by: nint(), created_by_name: D.operador || D.optel || null})});
              if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()));
              const row = (await r.json())[0];
              ST.id = row.id; ST.status = row.status;
              ssSet(CUR_KEY(), String(ST.id));
              loadList();
            } else {
              const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?id=eq.${ST.id}`, {method: 'PATCH', headers: hdr(), body: JSON.stringify({data: D})});
              if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()));
            }
            draftInfo();
            const d = new Date();
            const el = q('#nfDraft'); if (el && ST.status !== 'enviada') el.innerHTML += ` às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          } catch (e) {
            console.error('[NRBQ FNI] Erro ao gravar:', e);
            ST.dirty = true;
            draftInfo('<span class="material-icons" style="color:#c62828">cloud_off</span><span style="color:#c62828">Não foi possível gravar. Nova tentativa na próxima alteração.</span>');
          }
        })();
        ST.saving = job;
        try { await job; } finally { if (ST.saving === job) ST.saving = null; }
        return ST.id;
      }
      async function loadList() {
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?select=id,occurrence_nr,status,created_at,updated_at,created_by_name&corp_oper_nr=eq.${corp()}&form_type=eq.FNI&order=updated_at.desc&limit=40`, {headers: hdr()});
          if (!r.ok) throw new Error('HTTP ' + r.status);
          ST.list = await r.json();
        } catch (e) { console.warn('[NRBQ FNI] Lista:', e); ST.list = []; }
        const sel = q('#nfList'); if (!sel) return;
        const fmt = iso => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
        sel.innerHTML = '<option value="">Fichas guardadas…</option>' + ST.list.map(x =>
          `<option value="${x.id}" ${x.id === ST.id ? 'selected' : ''}>N.º ${x.id} · ${esc(x.occurrence_nr || 'sem ocorrência')} · ${fmt(x.updated_at || x.created_at)} · ${x.status === 'enviada' ? 'Enviada' : 'Rascunho'}</option>`).join('');
      }
      async function openForm(id) {
        await persist();
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?select=id,status,data&id=eq.${id}&corp_oper_nr=eq.${corp()}`, {headers: hdr()});
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const row = (await r.json())[0];
          if (!row) throw new Error('Ficha não encontrada.');
          ST.id = row.id; ST.status = row.status; ST.dirty = false; D = ST.data = row.data || {};
          ssSet(CUR_KEY(), String(ST.id));
          render(); loadList();
          q('#nfScroll').scrollTo({top: 0});
        } catch (e) { note('Não foi possível abrir a ficha: ' + e.message, 'popup-danger'); }
      }
      function newForm() {
        clearTimeout(saveT);
        ST.id = null; ST.status = 'rascunho'; ST.dirty = false; D = ST.data = {};
        ssSet(CUR_KEY(), null);
        render(); prefillUser(); loadList();
        q('#nfScroll').scrollTo({top: 0, behavior: 'smooth'});
      }
      /* ----------------------------- eventos ----------------------------- */
      let clearArm = null, forceArm = null;
      function wire() {
        const r = root();
        r.addEventListener('input', e => {
          const ds = e.target.dataset || {};
      if (ds.rk) {D[ds.rk][+ds.ri][ds.rc] = e.target.value; refresh(); save(); return;}
          if (!ds.k) return;
          D[ds.k] = e.target.value;
          refresh(); save();
        });
        r.addEventListener('click', e => {
          const add = e.target.closest('[data-rowadd]');
          if (add) {D[add.dataset.rowadd].push({}); redrawRows(add.dataset.rowadd); return;}
          const del = e.target.closest('[data-rowdel]');
          if (del) {D[del.dataset.rowdel].splice(+del.dataset.ri, 1); redrawRows(del.dataset.rowdel); return;}
          const chip = e.target.closest('.nf-chip');
          if (chip && chip.parentElement.dataset.rk) {
            const b = chip.parentElement, row = D[b.dataset.rk][+b.dataset.ri];
            row[b.dataset.rc] = row[b.dataset.rc] === chip.dataset.v ? '' : chip.dataset.v;
            b.querySelectorAll('.nf-chip').forEach(c => c.classList.toggle('on', c.dataset.v === row[b.dataset.rc]));
            refresh(); save(); return;
          }
          if (chip) {
            const box = chip.parentElement, k = box.dataset.k, v = chip.dataset.v;
            if (box.dataset.multi) {
              const arr = Array.isArray(D[k]) ? D[k].slice() : [];
              const ix = arr.indexOf(v); if (ix >= 0) arr.splice(ix, 1); else arr.push(v);
              D[k] = arr; chip.classList.toggle('on', ix < 0);
            } else {
              D[k] = D[k] === v ? '' : v;
              box.querySelectorAll('.nf-chip').forEach(c => c.classList.toggle('on', c.dataset.v === D[k]));
            }
            refresh(); save(); return;
          }
          const head = e.target.closest('.nf-sec-head');
          if (head) openSec(q('#nfs_' + head.dataset.sec), true);
        });
        q('#nfList').onchange = ev => {if (ev.target.value) openForm(+ev.target.value);};
        q('#nfNew').onclick = () => {
          const b = q('#nfNew');
          if (!clearArm) {
            b.classList.add('sure'); b.lastElementChild.textContent = 'Começar nova?';
            clearArm = setTimeout(() => { clearArm = null; b.classList.remove('sure'); b.lastElementChild.textContent = 'Nova'; }, 3500);
            return;
          }
          clearTimeout(clearArm); clearArm = null; b.classList.remove('sure'); b.lastElementChild.textContent = 'Nova';
          persist().then(newForm);
        };
        q('#nfPdf').onclick = onPdf;
        q('#nfSend').onclick = onSend;
      }
      function redrawRows(k) {const f = FIELDS.find(x => x.k === k); const w = q('#nfw_' + k); if (f && w) { w.outerHTML = fieldHtml(f); refresh(); save(); }}
      function checkRequired(btn, label) {
        const missing = FIELDS.filter(f => f.req && visible(f) && !filled(f));
        if (missing.length && !forceArm) {
          missing.forEach(f => q('#nfw_' + f.k).classList.add('missing'));
          const first = q('#nfw_' + missing[0].k);
          openSec(first.closest('.nf-sec'), false);
          setTimeout(() => first.scrollIntoView({behavior: 'smooth', block: 'center'}), 80);
          note(`Faltam ${missing.length} campo(s) obrigatório(s). Carregue outra vez para continuar mesmo assim.`, 'popup-danger');
          btn.classList.add('warn'); btn.lastElementChild.textContent = 'Continuar mesmo assim';
          forceArm = setTimeout(() => { forceArm = null; btn.classList.remove('warn'); btn.lastElementChild.textContent = label; }, 5000);
          return false;
        }
        clearTimeout(forceArm); forceArm = null;
        btn.classList.remove('warn'); btn.lastElementChild.textContent = label;
        return true;
      }
      async function prefillUser() {
        if (!nint()) return;
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name&corp_oper_nr=eq.${corp()}&n_int=eq.${nint()}`, {headers: hdr()});
          const e = r.ok ? (await r.json())[0] : null;
          if (!e || !e.abv_name) return;
          ['optel', 'operador'].forEach(k => {
            if (FIELDS.some(f => f.k === k) && !D[k]) { D[k] = e.abv_name; const el = q('#nf_' + k); if (el) el.value = e.abv_name;}
          });
          refresh();
        } catch (_) {}
      }
      /* ----------------------------- dados da corporação / destinatários ----------------------------- */
      async function getCommon() {
        const out = {corpName: '', logoUrl: '', senderName: 'CB360 Online'};
        try {
          const [c, e] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corp()}&select=cb_name,logo_url,corp_address,corp_cp,corp_localitie,corp_phone_mobile,corp_phone_landline,corp_email`, {headers: hdr()}).then(r => r.ok ? r.json() : []),
            nint() ? fetch(`${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp()}&n_int=eq.${nint()}&select=abv_name,patent`, {headers: hdr()}).then(r => r.ok ? r.json() : []) : []
          ]);
          const d = c[0] || {};
          Object.assign(out, {corpName: d.cb_name || '', logoUrl: d.logo_url || '', corpAddress: d.corp_address || '', corpCp: d.corp_cp || '', corpLocalitie: d.corp_localitie || '',
                              corpPhoneMobile: d.corp_phone_mobile || '', corpPhoneLandline: d.corp_phone_landline || '', corpEmail: d.corp_email || ''});
          if (e[0]) out.senderName = `${e[0].abv_name || 'CB360 Online'}<br>${e[0].patent || ''}`;
        } catch (err) {console.warn('[NRBQ FNI] Dados da corporação indisponíveis:', err);}
        return out;
      }
      async function getRecipients() {
        const t = SPEC.page.toLowerCase();
        const cats = [`${t}_mail_to`, `${t}_mail_cc`, `${t}_mail_bcc`, 'nrbq_mail_to', 'nrbq_mail_cc', 'nrbq_mail_bcc'];
        const r = await fetch(`${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corp()}&category=in.(${cats.join(',')})&select=category,value`, {headers: hdr()});
        if (!r.ok) throw new Error('Não foi possível ler os destinatários (HTTP ' + r.status + ').');
        const rows = await r.json();
        const list = c => String((rows.find(x => x.category === c) || {}).value || '').split(',').map(e => e.trim()).filter(Boolean);
        const own = {to: list(cats[0]), cc: list(cats[1]), bcc: list(cats[2])};
        return own.to.length ? own : {to: list(cats[3]), cc: list(cats[4]), bcc: list(cats[5])};
      }
      function visibleData() { const o = {}; FIELDS.forEach(f => { if (visible(f) && filled(f)) o[f.k] = D[f.k]; }); return o;}
      /* ----------------------------- enviar (template oficial + email, API) ----------------------------- */
      async function onSend() {
        const btn = q('#nfSend');
        if (!checkRequired(btn, 'Enviar ficha')) return;
        btn.disabled = true; btn.lastElementChild.textContent = 'A enviar…';
        try {
          ST.dirty = true; await persist();
          const [rcp, common] = await Promise.all([getRecipients(), getCommon()]);
          if (!rcp.to.length) throw new Error('Não há destinatários configurados para esta ficha (Centro de Dados → Emails Config.).');
          const r = await fetch(API_URL, {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${ssGet('authToken') || ''}`},
                                          body: JSON.stringify({type: SPEC.page.toLowerCase(), data: {...common, ...rcp, fields: visibleData()}})});
          const txt = await r.text();
          let j = {}; try { j = JSON.parse(txt); } catch (_) {}
          if (!r.ok || !j.success) throw new Error(j.error || (txt.trim().startsWith('<') ? `Erro do servidor (${r.status}).` : txt) || 'Falha no envio.');
          D._enviada = new Date().toISOString();
          ST.status = 'enviada';
          await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?id=eq.${ST.id}`, {method: 'PATCH', headers: hdr(), body: JSON.stringify({data: D, status: 'enviada', sent_at: D._enviada})});
          draftInfo(); loadList();
          note(`Ficha enviada para ${(j.sentTo || rcp.to).join(', ')}.`);
        } catch (e) {
          console.error('[NRBQ FNI] Erro ao enviar:', e);
          note('Não foi possível enviar: ' + e.message, 'popup-danger');
        } finally {
          btn.disabled = false; btn.lastElementChild.textContent = 'Enviar ficha';
        }
      }
      /* ----------------------------- PDF (jsPDF, igual ao do Mobile) ----------------------------- */
      function loadScript(src) { return new Promise((res, rej) => {const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });}
      async function ensureJsPdf() {
        if (!(window.jspdf && window.jspdf.jsPDF)) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        const probe = new window.jspdf.jsPDF();
        if (typeof probe.autoTable !== 'function') await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
      }
      function fmtValue(f) {
        const v = D[f.k];
        if (f.type === 'rows') {
          const fmtC = (c, x) => c.type === 'datetime' && x ? x.replace(/^(\d{4})-(\d{2})-(\d{2})T/, '$3/$2/$1 ') : x;
          const out = (v || []).filter(r => !rowEmpty(r)).map((r, i) => `${i + 1}) ` + f.cols.filter(c => r[c.k] && String(r[c.k]).trim()).map(c => `${c.l}: ${fmtC(c, String(r[c.k]).trim())}`).join('  |  '));
          return out.length ? out.join('\n') : '—';
        }
        if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
        if (v == null || String(v).trim() === '') return '—';
        if (f.type === 'date') {const [y, m, dd] = String(v).split('-'); return `${dd}/${m}/${y}`;}
        if (f.type === 'datetime') {const [d, t] = String(v).split('T'); const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}${t ? ' ' + t : ''}`;}
        if (f.type === 'number' && /\(m\)$/.test(f.l)) return `${v} m`;
        return String(v).trim();
      }
      async function logoData(url) {
        if (!url) return null;
        try {
          const r = await fetch(url); if (!r.ok) return null;
          const b = await r.blob();
          return await new Promise(res => {const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b);});
        } catch (_) {return null;}
      }
      async function onPdf() {
        const btn = q('#nfPdf');
        if (!checkRequired(btn, 'PDF')) return;
        btn.disabled = true;
        try {
          await ensureJsPdf();
          const common = await getCommon();
          const {jsPDF} = window.jspdf;
          const doc = new jsPDF({unit: 'mm', format: 'a4'});
          const W = doc.internal.pageSize.getWidth();
          const logo = await logoData(common.logoUrl);
          doc.setFillColor(139, 0, 0); doc.rect(0, 0, W, 24, 'F');
          doc.setFillColor(198, 40, 40); doc.rect(0, 22, W, 2, 'F');
          let tx = 12;
          if (logo) { try {doc.addImage(logo, 8, 3, 18, 18); tx = 30; } catch (_) {}}
          doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5);
          doc.text(doc.splitTextToSize(SPEC.pdfTitle, W - tx - 10), tx, 10);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
          const d = new Date();
          doc.text(`Corporação ${corp()}  |  Gerado no CB360 Online em ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`, tx, 19.5);
          let y = 30;
          SPEC.sections.filter(s => cond(s.showIf)).forEach(s => {
            if (y > 250) {doc.addPage(); y = 16;}
            const rows = s.f.filter(visible).map(f => [f.l.replace(/\s*\(m\)$/, '').replace(/\s*\(até \d+\)$/, ''), fmtValue(f)]);
            doc.autoTable({startY: y, margin: {left: 12, right: 12}, head: [[{content: s.t.toUpperCase(), colSpan: 2}]], body: rows, theme: 'grid',
                           headStyles: {fillColor: [217, 225, 242], textColor: [31, 78, 120], fontStyle: 'bold', fontSize: 9.5, cellPadding: 2.4},
                           styles: {fontSize: 9, cellPadding: 2.2, lineColor: [210, 214, 220], lineWidth: 0.2, textColor: [30, 30, 30], valign: 'top'},
                           columnStyles: {0: {cellWidth: 68, fontStyle: 'bold', textColor: [60, 60, 60], fillColor: [249, 250, 252]}, 1: {cellWidth: 'auto'}}});
            y = doc.lastAutoTable.finalY + 5;
          });
          if (y > 262) { doc.addPage(); y = 20; }
          y += 6;
          doc.setDrawColor(150); doc.setLineWidth(0.3); doc.setTextColor(80); doc.setFontSize(8.5);
          doc.line(12, y + 10, 92, y + 10); doc.line(W - 92, y + 10, W - 12, y + 10);
          doc.text('Responsável pelo preenchimento (nome / posto)', 12, y + 14);
          doc.text('Assinatura', W - 92, y + 14);
          const n = doc.getNumberOfPages();
          for (let i = 1; i <= n; i++) {
            doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(140);
            doc.text(`${SPEC.short}  |  NRBQ  |  DON N.º 3`, 12, 290);
            doc.text(`Página ${i} de ${n}`, W - 12, 290, {align: 'right'});
          }
          const occ = String(D.ocorrencia || '').replace(/[^A-Za-z0-9-]+/g, '_').replace(/^_+|_+$/g, '');
          doc.save(`${SPEC.file}${occ ? '_' + occ : ''}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.pdf`);
        } catch (e) {
          console.error('[NRBQ FNI] Erro no PDF:', e);
          note('Não foi possível gerar o PDF.', 'popup-danger');
        } finally {btn.disabled = false;}
      }
      /* ----------------------------- arranque: só quando o painel é aberto ----------------------------- */
      async function start() {
        if (ST.loaded || !shell()) return;
        ST.loaded = true;
        const last = +ssGet(CUR_KEY());
        if (last) await openForm(last); else {render(); prefillUser(); loadList();}
      }
      window.addEventListener('beforeunload', () => {if (ST.dirty) persist();});
      const panel = () => document.getElementById('panel-nrbq-fni');
      new MutationObserver(() => {const p = panel(); if (p && p.classList.contains('active')) start();})
        .observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class']});
      window.nrbqFniStart = start;
    })();
