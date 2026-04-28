    /* =======================================
    LOAD MAIN DATA
    ======================================= */
    document.addEventListener('DOMContentLoaded', async () => {      
      const currentUser = sessionStorage.getItem("currentUserName") || "FMartins";
      const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
      const authNameEl = document.getElementById('authName');
      if (authNameEl) authNameEl.textContent = currentUserDisplay || "";
      /* ===================== VERIFICAÇÃO DE VALIDADE ===================== */
      async function checkUserValidity() {
        try {
          const nInt = sessionStorage.getItem("currentNInt") || "205";
          const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
          if (!nInt || !corpNr) {
            window.location.href = "index.html";
            return false;
          }
          const headers = getSupabaseHeaders();
          const urlReg = `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${nInt}&corp_oper_nr=eq.${corpNr}&select=full_name,elem_state,acess`;
          const respReg = await fetch(urlReg, { headers });
          const dataReg = await respReg.json();
          if (!dataReg || dataReg.length === 0) {
            console.error(`❌ Acesso Negado: O utilizador ${nInt} não existe na corporação ${corpNr}`);
            alert("Erro: Utilizador ou Corporação inválidos para este acesso.");
            window.location.href = "index.html";
            return false;
          }
          const userReg = dataReg[0];
          const officialName = userReg.full_name;
          const urlUsers = `${SUPABASE_URL}/rest/v1/users?full_name=eq.${encodeURIComponent(officialName)}&corp_oper_nr=eq.${corpNr}&select=validate`;
          const respUsers = await fetch(urlUsers, {headers});
          const dataUsers = await respUsers.json();
          if (dataUsers && dataUsers.length > 0) {
            const validade = dataUsers[0].validate;
            if (validade) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const expireDate = new Date(validade);
              expireDate.setHours(0, 0, 0, 0);
              if (expireDate < today) {
                alert(`❌ CONTA EXPIRADA (${corpNr})\nO seu acesso terminou a ${expireDate.toLocaleDateString()}.`);
                window.location.href = "index.html";
                return false;
              }
            }
          }
          sessionStorage.setItem("allowedModules", userReg.acess || "");
          return true;
        } catch (error) {
          console.error("Erro crítico no login/validação:", error);
          return false;
        }
      }
      /* ====================== SINCRONIZAÇÃO SIDEBAR ====================== */
      function updateSidebarAccess(allowedModules) {
        const sidebarButtons = document.querySelectorAll(".sidebar-menu-button, .sidebar-submenu-button, .sidebar-sub-submenu-button");
        sidebarButtons.forEach(btn => {
          const access = btn.dataset.access;
          if (access && allowedModules.includes(access)) {
            btn.style.display = "block";
          } else {
            btn.style.display = "none";
          }
        });
      }
      /* ===================== BLOQUEIA SIDEBAR COMPLETAMENTE ===================== */
      function blockAllSidebar() {
        const sidebarButtons = document.querySelectorAll(".sidebar-menu-button, .sidebar-submenu-button, .sidebar-sub-submenu-button");
        sidebarButtons.forEach(btn => {
          btn.style.opacity = "0.4";
          btn.style.cursor = "not-allowed";
          btn.style.pointerEvents = "none";
          btn.style.filter = "grayscale(100%)";
          btn.disabled = true;
          if (!btn.dataset.blocked && !btn.querySelector('.blocked-icon')) {
            const lockIcon = document.createElement('span');
            lockIcon.className = 'blocked-icon';
            lockIcon.textContent = ' 🔒';
            lockIcon.style.marginLeft = '5px';
            btn.appendChild(lockIcon);
          }
          if (!btn.dataset.blocked) {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("❌ Acesso negado: você não tem permissões registadas.");
            }, true);
            btn.dataset.blocked = "true";
          }
        });
      }
      /* ======================= LOAD COPORATION DATA ====================== */
      async function loadCorporationHeader() {
        try {
          const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/corporation_data?select=corporation,logo_url,corp_oper_nr,allowed_modules&corp_oper_nr=eq.${corpOperNr}`, { 
              headers: getSupabaseHeaders() 
            }
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const corp = data[0];
            const titleEl = document.querySelector('.header-title');
            const logoEl = document.querySelector('.cb-logo img');
            const nrEl = document.querySelector('.header-nr');
            if (titleEl) titleEl.textContent = corp.corporation;
            if (logoEl && corp.logo_url) logoEl.src = corp.logo_url;
            if (nrEl) nrEl.textContent = corp.corp_oper_nr;    
            const allowedModulesString = corp.allowed_modules || "";
            sessionStorage.setItem("allowedModules", allowedModulesString);
            return allowedModulesString.split(",").filter(m => m.trim());
          }
          return [];
        } catch (error) {
          console.error("Erro ao carregar header da corporação:", error);
          return [];
        }
      }
      /* ========== USER ACCESSES =========== */
      async function loadUserAccessesSafe(fullName, corpOperNr) {
        if (!fullName || !corpOperNr) {
          return {acess: [], corpOperNr};
        }    
        const corpOperNrString = String(corpOperNr).trim();    
        try {
          const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=acess,section,corp_oper_nr&full_name=eq.${encodeURIComponent(fullName)}&corp_oper_nr=eq.${corpOperNrString}`;
          const response = await fetch(url, { headers: getSupabaseHeaders() });
          if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
          const data = await response.json();
          const correctRecords = data.filter(record => {
            const recordCorpNr = String(record.corp_oper_nr).trim();
            return recordCorpNr === corpOperNrString;
          });    
          if (!correctRecords.length) {
            console.warn(`❌ Nenhum acesso encontrado para ${fullName} na corporação ${corpOperNrString}`);
            return { acess: [], corpOperNr: corpOperNrString };
          }
          const firstRecord = correctRecords[0];
          const accesses = firstRecord.acess?.split(",").map(a => a.trim()).filter(a => a) || [];
          return { acess: accesses, corpOperNr: corpOperNrString };
        } catch (err) {
          console.error("❌ ERRO:", err);
          return { acess: [], corpOperNr: corpOperNrString };
        }
      }
      /* ========== BLOCK ELEMENTS =========== */
      function blockIfNoAccess(el, accesses, userCorpOperNr) {
        const requiredAccess = el.getAttribute('data-access');
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        if (!requiredAccess) return;
        if (currentCorpOperNr !== userCorpOperNr) {
          el.disabled = true;
          el.style.opacity = 0.5;
          el.style.cursor = "not-allowed";
          if (!el.dataset.accessListener) {
            el.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();
              alert(`❌ Acesso negado: corporação não corresponde.`);
            });
            el.dataset.accessListener = "true";
          }
          return;
        }
        if (!accesses.includes(requiredAccess)) {
          el.disabled = true;
          el.style.opacity = 0.5;
          el.style.cursor = "not-allowed";
          if (!el.dataset.accessListener) {
            el.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();
              alert(`❌ Acesso negado: você não tem permissão para "${requiredAccess}".`);
            });
            el.dataset.accessListener = "true";
          }
        }
      }
      /* ========== APPLY ACCESSES =========== */
      function applyAccessesSafe(accessesObj) {
        const { acess: accesses, corpOperNr: userCorpOperNr } = accessesObj;
        if (!accesses || accesses.length === 0) {
          document.querySelectorAll('[data-access]').forEach(el => {
            el.disabled = true;
            el.style.opacity = 0.5;
            el.style.cursor = "not-allowed";
            if (!el.dataset.accessListener) {
              el.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                alert(`❌ Acesso negado: você não tem permissões registadas.`);
              });
              el.dataset.accessListener = "true";
            }
          });          
          return false;
        }
        document.querySelectorAll('[data-access]').forEach(el => blockIfNoAccess(el, accesses, userCorpOperNr));
        return true;
      }
      /* ================= FLUXO CORRETO ================= */
      const allowedModules = await loadCorporationHeader();
      const currentFullName = sessionStorage.getItem("currentUserDisplay") || "Fábio Alexandre Mateus Martins";
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const isValid = await checkUserValidity(currentFullName);
      const accessResult = await loadUserAccessesSafe(currentFullName, currentCorpOperNr);
      const userHasAccess = isValid && applyAccessesSafe(accessResult);
      if (userHasAccess) {
        updateSidebarAccess(allowedModules);
      } else {
        blockAllSidebar();
      }
      await loadNotifications();
      startNotifPolling();
      initNotifDropdown();
      generateAccessCheckboxes();
      loadElementsTable();
      /* ============== LOGOUT ============== */
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          sessionStorage.removeItem("currentUserName");
          sessionStorage.removeItem("currentUserDisplay");
          sessionStorage.removeItem("currentUserCorpNr");
          sessionStorage.removeItem("currentUserPatent");
          window.location.replace("index.html");
        });
      }
    });
    /* =======================================
    MAIN SIDEBAR AND PANEL SIDEBAR
    ======================================= */
    document.addEventListener("DOMContentLoaded", () => {
      const sidebar = document.querySelector(".sidebar");
      if (!sidebar) return;
      const pages = document.querySelectorAll(".page");
      const specialAvos = ["page-main", "page-utilities", "page-data"];
      function showPageAndResetScroll(pageId) {
        if (!pageId) return;
        pages.forEach(p => {
          p.classList.remove("active");
          p.style.display = "none";
        });
        const page = document.getElementById(pageId);
        if (!page) return;
        page.style.display = "block";
        page.classList.add("active");
        requestAnimationFrame(() => {
          const main = document.querySelector(".main-content");
          if (main) main.scrollTop = 0;
          page.scrollTop = 0;
          window.scrollTo(0, 0);
          if (typeof clearFormFields === "function") clearFormFields();
          if (typeof updateTypeSelection === "function") updateTypeSelection();
        });
      }
      function closeSubmenuRecursive(menu) {
        if (!menu) return;
        menu.style.display = "none";
        menu.querySelectorAll(
          ".sidebar-submenu-button, .sidebar-sub-submenu-button, .submenu-toggle, .sub-submenu-toggle"
        ).forEach(b => b.classList.remove("active"));
        menu.querySelectorAll(".submenu, .sub-submenu").forEach(sub => closeSubmenuRecursive(sub));
      }
      function deactivateSiblings(button) {
        let container = null;
        let selector = "";
        if (button.classList.contains("sidebar-menu-button")) {
          container = sidebar;
          selector = ".sidebar-menu-button";
        } else if (
          button.classList.contains("sidebar-submenu-button") ||
          button.classList.contains("sub-submenu-toggle")
        ) {
          container = button.closest(".submenu, .sub-submenu");
          selector = ".sidebar-submenu-button";
        } else if (button.classList.contains("sidebar-sub-submenu-button")) {
          container = button.closest(".sub-submenu");
          selector = ".sidebar-sub-submenu-button";
        }
        if (!container) return;
        Array.from(container.querySelectorAll(selector)).forEach(sib => {
          if (sib !== button) {
            sib.classList.remove("active");
            const next = sib.nextElementSibling;
            if (next && (next.classList.contains("submenu") || next.classList.contains("sub-submenu"))) {
              closeSubmenuRecursive(next);
            }
          }
        });
      }
      function openParentHierarchy(button) {
        let node = button.parentElement;
        while (node && node !== document.body) {
          if (node.classList && (node.classList.contains("submenu") || node.classList.contains("sub-submenu"))) {
            const toggle = node.previousElementSibling;
            if (toggle) toggle.classList.add("active");
            node.style.display = "flex";
          }
          node = node.parentElement;
        }
      }
      function clickWhenExists(selector, container = document, callback) {
        const button = container.querySelector(selector);
        if (button) {
          button.click();
          if (typeof callback === "function") callback();
          return true;
        }
        return false;
      }
      function navigateToPage(button) {
        if (!button) return;
        const isToggle = button.classList.contains("submenu-toggle") || button.classList.contains("sub-submenu-toggle");
        const hasPage = button.getAttribute("data-page")?.trim() !== "";
        const pageId = button.getAttribute("data-page");
        if (isToggle) {
          deactivateSiblings(button);
          openParentHierarchy(button);
          const nextMenu = button.nextElementSibling;
          if (nextMenu && (nextMenu.classList.contains("submenu") || nextMenu.classList.contains("sub-submenu"))) {
            if (nextMenu.style.display === "flex") {
              closeSubmenuRecursive(nextMenu);
              button.classList.remove("active");
            } else {
              nextMenu.style.display = "flex";
              button.classList.add("active");
            }
          }
          if (hasPage) showPageAndResetScroll(pageId);
          return;
        }
        if (!isToggle && button.classList.contains("sidebar-menu-button") && specialAvos.includes(pageId)) {
          button.classList.add("active");
          sidebar.querySelectorAll(".sidebar-menu-button").forEach(b => {
            if (b !== button) {
              b.classList.remove("active");
              const nextMenu = b.nextElementSibling;
              if (nextMenu && (nextMenu.classList.contains("submenu") || nextMenu.classList.contains("sub-submenu"))) {
                closeSubmenuRecursive(nextMenu);
              }
            }
          });
          openParentHierarchy(button);
          if (hasPage) showPageAndResetScroll(pageId);
        } else {
          deactivateSiblings(button);
          button.classList.add("active");
          openParentHierarchy(button);
          if (hasPage) showPageAndResetScroll(pageId);
        }
        if (pageId === "page-utilities") {
          const page = document.getElementById("page-utilities");
          if (page) {
            const interval = setInterval(() => {
              if (clickWhenExists(".panel-sidebar-menu-button[onclick*=\"showPanelCard('epe')\"]", page, () => {
                if (typeof loadVehiclesFromAPI === "function") loadVehiclesFromAPI();
                if (typeof loadInfosFromSupabase === "function") loadInfosFromSupabase();
                if (typeof loadRoutesFromSupabase === "function") loadRoutesFromSupabase();
                if (typeof loadCMAsFromSupabase === "function") loadCMAsFromSupabase();
                if (typeof loadElemsButtons === "function") loadElemsButtons();
                if (typeof loadNoHospFromSupabase === "function") loadNoHospFromSupabase();
                if (typeof loadocrReportsFromSupabase === "function") loadocrReportsFromSupabase();
                })) {
                clearInterval(interval);
              }
            }, 50);
          }
        }
        if (pageId === "page-data") {
          const page = document.getElementById("page-data");
          if (page) {
            const interval = setInterval(() => {
              if (clickWhenExists(".panel-sidebar-menu-button[onclick*=\"showPanelCard('assoc')\"]", page)) {
                clearInterval(interval);
              }
            }, 50);
          }
        }
        if (pageId === "page-plandir") {
          const page = document.getElementById("page-plandir");
          if (page) {
            const interval = setInterval(() => {
              if (clickWhenExists(".panel-sidebar-menu-button[onclick*=\"showPanelCard('plandir-d')\"]", page)) {
                clearInterval(interval);
              }
            }, 50);
          }
        }
        const onclickAttr = button.getAttribute("onclick");
        if (onclickAttr) {
          try {
            new Function(onclickAttr)();
          } catch (err) {
            console.warn("Erro onclick:", err);
          }
        }
      }
      sidebar.addEventListener("click", e => {
        const clicked = e.target.closest("button");
        if (!clicked || !sidebar.contains(clicked)) return;
        e.preventDefault();
        navigateToPage(clicked);
      });
      const initialActive = sidebar.querySelector("button.active");
      if (initialActive) navigateToPage(initialActive);
    });
    /* =======================================
    SIDEBAR BLINKER
    ======================================= */
    function createBlinker({pageId, tableId, blinkClass, primaryColor = "#343A40", blinkColor = "#DC3545"}) {
      let discoveryInterval = null;
      let discoveryObserver = null;
      let currentlyBlinkingTargets = [];
      function ensureBlinkStyle() {
        if (document.getElementById(`${blinkClass}-style`)) return;
        const style = document.createElement("style");
        style.id = `${blinkClass}-style`;
        style.textContent = `
          .${blinkClass} {
            animation: ${blinkClass}-anim 0.9s infinite;
          }
          @keyframes ${blinkClass}-anim {
            0% { background-color: ${primaryColor}; }
            50% { background-color: ${blinkColor}; }
            100% { background-color: ${primaryColor}; }
          }
        `;
        document.head.appendChild(style);
      }
      function isVisible(el) {
        return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
      }
      function findSubmenuButton() {
        return document.querySelector(`.sidebar-submenu-button[data-page="${pageId}"]`);
      }
      function findParentToggle() {
        const sidebar = document.querySelector(".sidebar");
        if (!sidebar) return null;
        const tops = sidebar.querySelectorAll(".sidebar-menu-button");
        for (const t of tops) {
          const next = t.nextElementSibling;
          if (next && (next.classList.contains("submenu") || next.classList.contains("sub-submenu"))) {
            if (next.querySelector(`button[data-page="${pageId}"]`)) return t;
          }
        }
        return null;
      }
      function startBlinkOnTargets(targets) {
        stopBlinking();
        ensureBlinkStyle();
        targets.forEach(el => el && el.classList.add(blinkClass));
        currentlyBlinkingTargets = targets.filter(Boolean);
      }
      function stopBlinking() {
        currentlyBlinkingTargets.forEach(el => el?.classList.remove(blinkClass));
        currentlyBlinkingTargets = [];
      }
      function decideAndStartBlink() {
        const btn = findSubmenuButton();
        if (btn && isVisible(btn)) {
          startBlinkOnTargets([btn]);
          return true;
        }
        const parentToggle = findParentToggle();
        if (parentToggle) {
          startBlinkOnTargets([parentToggle]);
          return true;
        }
        return false;
      }
      function startDiscovery() {
        if (discoveryInterval || discoveryObserver) return;
        if (decideAndStartBlink()) return;
        discoveryInterval = setInterval(() => {
          if (decideAndStartBlink()) {
            clearInterval(discoveryInterval);
            discoveryInterval = null;
          }
        }, 400);
        const sidebar = document.querySelector(".sidebar");
        if (!sidebar) return;
        discoveryObserver = new MutationObserver(() => {
          if (decideAndStartBlink() && discoveryInterval) {
            clearInterval(discoveryInterval);
            discoveryInterval = null;
          }
        });
        discoveryObserver.observe(sidebar, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }
      function stopDiscovery() {
        if (discoveryInterval) {
          clearInterval(discoveryInterval);
          discoveryInterval = null;
        }
        if (discoveryObserver) {
          discoveryObserver.disconnect();
          discoveryObserver = null;
        }
      }
      function startBlinkingSidebarButton() {
        if (!decideAndStartBlink()) startDiscovery();
      }

      function stopBlinkingSidebarButton() {
        stopBlinking();
        stopDiscovery();
      }
      async function tableHasData() {
        const tbody = document.getElementById(tableId);
        if (!tbody) return false;
        return Array.from(tbody.rows).some(row => !row.querySelector('td[colspan]'));
      }
      async function updateSidebarButtonBlinking() {
        try {
          if (await tableHasData()) {
            startBlinkingSidebarButton();
          } else {
            stopBlinkingSidebarButton();
          }
        } catch (err) {
          console.error("updateSidebarButtonBlinking erro:", err);
        }
      }
      setTimeout(updateSidebarButtonBlinking, 100);
      setInterval(updateSidebarButtonBlinking, 1000);
      return {
        start: startBlinkingSidebarButton,
        stop: stopBlinkingSidebarButton,
        update: updateSidebarButtonBlinking
      };
    }
    const veícIndispBlinker = createBlinker({
      pageId: "page-indisp",
      tableId: "active-unavailability-tbody",
      blinkClass: "blink-indisp-js",
      primaryColor: "#343A40",
      blinkColor: "#DC3545"
    });
    const occurrencesBlinker = createBlinker({
      pageId: "page-active_occurrences",
      tableId: "active-occurrences-tbody",
      blinkClass: "blink-active-occ-js",
      primaryColor: "#343A40",
      blinkColor: "#DC3545"
    });
    /* =======================================
    DATE CONFIGURATION
    ======================================= */
    function padNumber(num) {
      return String(num).padStart(2, '0');
    }
    function getCurrentDateStr() {
      const d = new Date();
      return `${d.getFullYear()}-${padNumber(d.getMonth()+1)}-${padNumber(d.getDate())}`;
    }
    function formatWSMSGDH(dateStr, timeStr) {
      if (!dateStr || !timeStr) return '';
      const date = new Date(dateStr + 'T' + timeStr);
      const day = padNumber(date.getDate());
      const hours = padNumber(date.getHours());
      const minutes = padNumber(date.getMinutes());
      const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const month = monthNames[date.getMonth()];
      const year = String(date.getFullYear()).slice(-2);
      return `${day} *${hours}${minutes}* ${month}${year}`;
    }
    /* =======================================
    DATA LOADING FIELDS
    ======================================= */
    /* ============= VEHICLES ============= */
    async function fetchVehiclesFromSupabase() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const vehicles = await response.json();
        return vehicles.map(vehicle => vehicle.vehicle);
      } catch (error) {
        console.error('Erro ao carregar veículos do Supabase:', error);
        return fallbackVehicles;
      }
    }
    async function populateSingleVehicleSelect(select) {
      let vehicles = await fetchVehiclesFromSupabase();
      vehicles.sort((a, b) => a.localeCompare(b, 'pt', {
        sensitivity: 'base'
      }));
      select.innerHTML = '<option value=""></option>';
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        select.appendChild(option);
      });
    }
    async function populateIndependentVehicleSelect() {
      const selectId = 'new_vehicle_unavailable';
      const select = document.getElementById(selectId);
      if (!select) return console.warn(`Select com id "${selectId}" não encontrado.`);
      const vehicles = await fetchVehiclesFromSupabase();
      vehicles.sort((a, b) => a.localeCompare(b, 'pt', {
        sensitivity: 'base'
      }));
      select.innerHTML = '<option value=""></option>';
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        select.appendChild(option);
      });
    }
    document.addEventListener('DOMContentLoaded', async () => {
      await populateIndependentVehicleSelect();
    });
    async function populateSitopVehicleSelect() {
      const selectId = 'sitop_veíc';
      const select = document.getElementById(selectId);
      if (!select) return console.warn(`Select com id "${selectId}" não encontrado.`);
      const vehicles = await fetchVehiclesFromSupabase();
      vehicles.sort((a, b) => a.localeCompare(b, 'pt', {
        sensitivity: 'base'
      }));
      select.innerHTML = '<option value=""></option>';
      vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        select.appendChild(option);
      });
    }
    document.addEventListener('DOMContentLoaded', async () => {
      await populateSitopVehicleSelect();
    });
    /* ===== OCCORRNECE DESCRIPTIONS ====== */
    async function fetchClassOccorrById(classId) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/class_occorr?select=occorr_descr&class_occorr=eq.${encodeURIComponent(classId)}`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.length > 0 ? data[0].occorr_descr : '';
      } catch (error) {
        console.error("Erro ao buscar descrição da classe:", error);
        return '';
      }
    }
    const classOccorrInput = document.getElementById('class_occorr_input');
    if (classOccorrInput) {
      classOccorrInput.addEventListener('input', async (e) => {
        const classId = e.target.value.trim();
        const descrInput = document.getElementById('occorr_descr_input');
        if (!classId) {
          descrInput.value = '';
          return;
        }
        const descr = await fetchClassOccorrById(classId);
        descrInput.value = descr;
      });
    }
    /* ============= DISTRICTS ============ */
    async function fetchDistrictsFromSupabase() {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/districts_select?select=id,district`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const districts = await resp.json();
        return districts.map(d => ({
          id: d.id,
          name: d.district
        }));
      } catch (e) {
        console.error("Erro ao buscar distritos:", e);
        return fallbackDistricts || [];
      }
    }
    async function populateAllDistrictSelects(defaultDistrictId = 8) {
      const districtSelects = document.querySelectorAll('[id*="district_select"]');
      if (districtSelects.length === 0) {
        return console.warn("Nenhum select de distritos encontrado");
      }
      const districts = await fetchDistrictsFromSupabase();
      const defaultDistrict = districts.find(d => d.id === defaultDistrictId);
      if (!defaultDistrict) {
        return console.warn(`⚠ Distrito com ID ${defaultDistrictId} não encontrado`);
      }
      const otherDistricts = districts
        .filter(d => d.id !== defaultDistrictId)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt', {
          sensitivity: 'base'
        }));
      const orderedDistricts = [defaultDistrict, ...otherDistricts];
      districtSelects.forEach((sel, index) => {
        sel.innerHTML = '';
        orderedDistricts.forEach(d => {
          const option = document.createElement('option');
          option.value = String(d.id);
          option.textContent = d.name;
          sel.appendChild(option);
        });
        sel.value = String(defaultDistrictId);
      });
    }
    /* ============= COUNCILS ============= */
    async function fetchCouncilsByDistrict(districtId) {
      if (!districtId) return [];
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/councils_select?select=id,council&district_id=eq.${districtId}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const councils = await resp.json();
        return councils.map(c => ({
          id: c.id,
          name: c.council
        }));
      } catch (e) {
        console.error("Erro ao buscar concelhos:", e);
        return fallbackCouncils[districtId] || [];
      }
    }
    async function populateCouncilSelectByDistrict(districtId, triggerSelectId = null) {
      let councilSelects;
      if (triggerSelectId) {
        const councilSelectId = triggerSelectId.replace('district', 'council');
        const specificSelect = document.getElementById(councilSelectId);
        councilSelects = specificSelect ? [specificSelect] : [];
      } else {
        councilSelects = document.querySelectorAll('[id*="council_select"]');
      }
      if (councilSelects.length === 0) return;
      const councils = await fetchCouncilsByDistrict(districtId);
      councilSelects.forEach(sel => {
        sel.innerHTML = '';
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        sel.appendChild(emptyOption);
        const parishSelectId = sel.id.replace('council', 'parish');
        const parishSelect = document.getElementById(parishSelectId);
        if (parishSelect) {
          parishSelect.innerHTML = '';
        }
        if (!councils.length) return;
        const orderedC = councils.sort((a, b) => a.name.localeCompare(b.name, 'pt', {
          sensitivity: 'base'
        }));
        orderedC.forEach(c => {
          const option = document.createElement('option');
          option.value = String(c.id);
          option.textContent = c.name;
          sel.appendChild(option);
        });
      });
    }
    /* ============= PARISHES ============= */
    async function fetchParishesByCouncil(councilId) {
      if (!councilId) return [];
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/parishes_select?select=parish&council_id=eq.${councilId}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const parishes = await resp.json();
        return parishes.map(p => p.parish);
      } catch (e) {
        console.error("Erro ao buscar freguesias:", e);
        return fallbackParishes[councilId] || [];
      }
    }
    async function populateParishesByCouncil(councilId, triggerSelectId) {
      const parishSelectId = triggerSelectId.replace('council', 'parish');
      const parishSelect = document.getElementById(parishSelectId);
      if (!parishSelect) return;
      const parishes = (await fetchParishesByCouncil(councilId))
        .sort((a, b) => a.localeCompare(b, 'pt', {
          sensitivity: 'base'
        }));
      parishSelect.innerHTML = '';
      parishes.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        parishSelect.appendChild(option);
      });
    }
    function setupHierarchicalSelects() {
      document.querySelectorAll('[id*="district_select"]').forEach(districtSelect => {
        districtSelect.addEventListener('change', async (e) => {
          const districtId = e.target.value;
          await populateCouncilSelectByDistrict(districtId, e.target.id);
        });
      });
      document.querySelectorAll('[id*="council_select"]').forEach(councilSelect => {
        councilSelect.addEventListener('change', async (e) => {
          const councilId = e.target.value;
          if (!councilId) {
            const parishSelectId = e.target.id.replace('council', 'parish');
            const parishSelect = document.getElementById(parishSelectId);
            if (parishSelect) {
              parishSelect.innerHTML = '';
            }
            return;
          }
          await populateParishesByCouncil(councilId, e.target.id);
        });
      });
    }
    document.addEventListener('DOMContentLoaded', async () => {
      const defaultDistrictId = 8;
      await populateAllDistrictSelects(defaultDistrictId);
      setupHierarchicalSelects();
      const districtSelects = document.querySelectorAll('[id*="district_select"]');
      for (const select of districtSelects) {
        await populateCouncilSelectByDistrict(select.value, select.id);
      }
    });
    function initializeNewSelectGroup(containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return;
      const districtSelects = container.querySelectorAll('[id*="district_select"]');
      const councilSelects = container.querySelectorAll('[id*="council_select"]');
      districtSelects.forEach(select => {
        select.addEventListener('change', async (e) => {
          const districtId = e.target.value;
          await populateCouncilSelectByDistrict(districtId, e.target.id);
        });
      });
      councilSelects.forEach(select => {
        select.addEventListener('change', async (e) => {
          const councilId = e.target.value;
          if (!councilId) {
            const parishSelectId = e.target.id.replace('council', 'parish');
            const parishSelect = document.getElementById(parishSelectId);
            if (parishSelect) parishSelect.innerHTML = '';
            return;
          }
          await populateParishesByCouncil(councilId, e.target.id);
        });
      });
      districtSelects.forEach(async (select) => {
        await populateAllDistrictSelects(8);
        await populateCouncilSelectByDistrict(select.value, select.id);
      });
    }
    /* ============= VICTIMS ============== */
    async function fetchVictimOptions(category) {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/static_options?select=value&category=eq.${category}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return data.map(d => d.value).filter(v => v);
      } catch (e) {
        console.error(`Erro ao buscar opções de ${category}:`, e);
        return [];
      }
    }
    async function populateSingleVictimSelect(select, category) {
      const options = await fetchVictimOptions(category);
      select.innerHTML = '<option value=""></option>';
      options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });
    }
    /* ======== GLOBAL PARAMETRES ========= */
    async function fetchGlobalOptions(category) {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/static_options?select=value&category=eq.${category}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return data.map(d => d.value).filter(v => v);
      } catch (e) {
        console.error(`Erro ao buscar opções de ${category}:`, e);
        return [];
      }
    }
    async function populateGlobalSelects() {
      const globalFields = [{id: 'alert_type', category: 'alert_type'}, {id: 'alert_source', category: 'alert_source'}, {id: 'channel_maneuver', category: 'channel_maneuver'},
                            {id: 'ppi_type', category: 'ppi_type'}, {id: 'solicitation_type', category: 'solicitation_type'}, {id: 'solicitation_motive', category: 'solicitation_motive'},
                            {id: 'solicitation_shift', category: 'solicitation_shift'}, {id: 'new_reason_unavailability', category: 'reason_unavailability'}, {id: 'new_unavailability_local', category: 'local_unavailability'},
                            {id: 'state_municipality_grid', category: 'municipality_grid'}, {id: 'cma_type_01', category: 'cma_type'}, {id: 'cma_type_02', category: 'cma_type'}, {id: 'cma_type_03', category: 'cma_type'},
                            {id: 'cma_type_04', category: 'cma_type'}, {id: 'cma_type_05', category: 'cma_type'}, {id: 'cma_type_06', category: 'cma_type'}, {id: 'win_patent', category: 'patent_choice'},
                            {id: 'service_refusal_type', category: 'refusal_type'}, {id: 'service_refusal_motive', category: 'refusal_motive'}, {id: 'reason_for_ineinop', category: 'refusal_motive'},
                            {id: 'refusals_year_filter', category: 'refusal_year_filter'}, {id: 'ineinop_year_filter', category: 'refusal_year_filter'}, {id: 'refusal_month_filter', category: 'refusal_month_filter'},
                            {id: 'refusal_year_filter', category: 'refusal_year_filter'},{id: 'sitop_type_failure', category: 'sitop_failure_type'},
                            <!---- MOA FIELDS ---->
                            {id: 'moa_cb', category: 'moa_cb_choose'}, {id: 'moa_device_type', category: 'moa_device'}, {id: 'moa_epe_type', category: 'moa_epe_state'},
                            {id: 'moa_eco_sit', category: 'moa_situation'}, {id: 'moa_oco_sit', category: 'moa_situation'}, {id: 'moa_era_sit', category: 'moa_situation'},
                            {id: 'moa_eob_sit', category: 'moa_situation'}, {id: 'moa_mef_sit', category: 'moa_mef_val'},
                            {id: 'moa_eco_pront', category: 'moa_pertime'}, {id: 'moa_ned_pront', category: 'moa_formnot'}, {id: 'moa_oco_pront', category: 'moa_pertime'}, 
                            {id: 'moa_era_pront', category: 'moa_pertime'}, {id: 'moa_eob_pront', category: 'moa_pertime'}, {id: 'moa_rsc_pront', category: 'moa_optref'}];
      for (let field of globalFields) {
        const select = document.getElementById(field.id);
        if (!select) {
          console.warn(`Select com id "${field.id}" não encontrado.`);
          continue;
        }
        select.innerHTML = '<option value=""></option>';
        const options = await fetchGlobalOptions(field.category);
        options.forEach(opt => {
          const optionEl = document.createElement('option');
          optionEl.value = opt;
          optionEl.textContent = opt;
          select.appendChild(optionEl);
        });
      }
    }
    document.addEventListener('DOMContentLoaded', populateGlobalSelects);
    /* =======================================
    POPUPS
    ======================================= */
    /* =========== SISTEMA DE POPUPS MODERNO =========== */
    function showPopup(id, mensagem, clearFields = false) {
      const modal = document.getElementById(id);
      if (!modal) return;
      const ul = modal.querySelector('.popup-body ul');
      if (ul && mensagem) {
        if (Array.isArray(mensagem)) {
          ul.innerHTML = mensagem.map(m => `<li style="list-style:none;">• ${m}</li>`).join('');
        } else {
          ul.innerHTML = `<li>${mensagem}</li>`;
        }
      }
      modal.classList.add('show');
      setTimeout(() => {
        modal.focus();
      }, 50);
      const okBtn = modal.querySelector('.popup-btn');
      if (okBtn) {
        okBtn.onclick = () => {
          closePopup(id);
          if (clearFields) clearFormFields();
        };
      }
    }
    function closePopup(id) {
      const modal = document.getElementById(id);
      if (modal) modal.classList.remove('show');
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const activeModal = document.querySelector('.popup-modal.show');
        if (activeModal) {
          e.preventDefault();
          const okBtn = activeModal.querySelector('.popup-btn');
          if (okBtn) okBtn.click();
        }
      }
    });
    /* ==================================== */    
    /* ============ TEMP POPUP ============ */    
    /* ==================================== */
    function showTempWarning(message) {
      const modal = document.getElementById("popup-temp-modal");
      if (!modal) return;
      const textElem = modal.querySelector("p");
      if (textElem) textElem.innerHTML = message;
      modal.classList.add("show");
      modal.focus();
    }    
    function setupTempPopup() {
      const modal = document.getElementById("popup-temp-modal");
      const okBtn = document.getElementById("popup-temp-ok-btn");
      if (!modal || !okBtn) return;  
      okBtn.onclick = () => {
        modal.classList.remove("show");
        const mainButton = document.querySelector('[data-page="page-main"]');
        if (mainButton) {
          mainButton.click();
        }
      };  
      modal.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          okBtn.click();
        }
      });  
      modal.addEventListener("transitionend", () => {
        if (modal.classList.contains("show")) {
          modal.focus();
        }
      });
    }
    setupTempPopup();    
    /* ==================================== */
    /* ==================================== */    
    /* ==================================== */
    /* =======================================
    GENERIC FUNCTIONS
    ======================================= */    
    /* ========== GENERIC CLEAR =========== */   
    function clearFormFields() {
      const today = getCurrentDateStr();
      document.querySelectorAll('input[type="text"], input[type="time"]').forEach(i => i.value = '');
      document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
      document.querySelectorAll('input[type="date"]').forEach(i => i.value = today);
      document.querySelectorAll('textarea').forEach(t => t.value = '');
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      setTimeout(() => {
        const parishSelect = document.getElementById('parish_select');
        if (parishSelect) {
          parishSelect.innerHTML = '';
        }
      }, 10);
    }
    /* ============= VEHICLES ============= */
    /* ====== GENERIC MAIL GREETINGS ====== */
    function getGreeting(customDate) {
      const now = customDate ? new Date(customDate) : new Date();
      const hour = now.getHours();
      if (hour >= 6 && hour < 12) {
        return "Bom dia,";
      } else if (hour >= 12 && hour < 18) {
        return "Boa tarde,";
      } else {
        return "Boa noite,";
      }
    }
    /* ====== GENERIC MAIL SIGNATURE ====== */
    function getEmailSignature() {
      return `
        <div style="font-family: Arial, sans-serif; font-size: 12px; color: #2c5dab;">
          <div style="font-size: 14px; margin: 10px 0 8px 0;">
            Central de Telecomunicações - SALOC 0805
          </div>
          <div style="font-size: 13px; color: #2c5dab; margin-bottom: 8px;">
            CORPO DE BOMBEIROS DE FARO  - CRUZ LUSA
          </div>
          <div style="font-size: 11px; color: #2c5dab; line-height: 1.4; margin-bottom: 8px;">
            Rua Comandante Francisco Manuel, 7 a 13 | 8000-250 Faro | Portugal<br>
            Telem.: +351 919 568 277 | Telef.: +351 289 803 066
          </div>
          <div style="font-size: 10px; color: #2c5dab; font-style: italic; margin-bottom: 10px;">
            Antes de imprimir este e-mail pense bem se é mesmo necessário. Poupe eletricidade, toner e papel.
          </div>
          <div style="font-size: 10px; color: #444; border-top: 1px solid #ccc; padding-top: 8px; text-align: justify;">
            <strong>AVISO DE CONFIDENCIALIDADE</strong><br><br>
            Esta mensagem e quaisquer anexos podem conter informação confidencial para uso exclusivo do destinatário.
            Cabe ao destinatário assegurar a verificação de vírus e outras medidas que assegurem que esta mensagem
            não afeta os seus sistemas. Se não for o destinatário, não deverá usar, distribuir ou copiar este email,
            devendo proceder à sua eliminação e informar o emissor. É estritamente proibido o uso, a distribuição,
            a cópia ou qualquer forma de disseminação não autorizada deste email e dos seus anexos. Obrigado.
          </div>
        </div>
      `;
    }
    /* ====== GENERIC COMMANDER LOAD ====== */
    async function getCommanderName(corpOperNr) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name&corp_oper_nr=eq.${corpOperNr}&patent=eq.Comandante`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar o comandante");
        const data = await res.json();
        return data[0]?.abv_name || "Comandante";
      } catch (err) {
        console.error(err);
        return "Comandante";
      }
    }
    function createTableWrapper(container) {
      let wrapper = container.querySelector(".table-container");
      if (!wrapper) {wrapper = document.createElement("div"); wrapper.className = "table-container"; container.appendChild(wrapper);}
      wrapper.innerHTML = "";
      Object.assign(wrapper.style, {position:"relative", maxHeight:"75vh", height:"450px", overflowY:"auto"});
      return wrapper;
    }
    /* =======================================
    CONSTANTES
    ======================================= */
    /* ─── CONSTANTES PARTILHADAS (DECIR + FOMIO) ────────────── */
    const MONTH_NAMES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const MONTH_NAMES_UPPER = MONTH_NAMES_PT.map(m => m.toUpperCase());
    const DECIR_MONTH_NAMES = ["Maio","Junho","Julho","Agosto","Setembro","Outubro"];
    const BLOCKED_MONTHS_DEFAULT = [0,1,2,3,10,11];
    /* ─── CONSTANTES FOMIO (SCALES) ─────────────────────────── */
    const SCALES_TITLE_MAIN_STYLE = "text-align:center;margin-top:10px;background:#ffcccc;padding:8px;font-weight:bold;font-size:18px;";
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
                         BX:{background:"#ed1111",color:"#fff"}, LC:{background:"#ed1111",color:"#fff"}, FO:{background:"#b3b3b3",color:"#000"}, 
                         FE:{background:"#995520",color:"#fff"}, FD:{background:"#519294",color:"#fff"}, FN:{background:"#4f1969",color:"#fff"}, 
                         ED:{background:"#b6fcb6",color:"#000"}, EN:{background:"#1e3a8a",color:"#fff"}, ET:{background:"#006400",color:"#fff"}, 
                         EP:{background:"#ff9800",color:"#000"}, N: {background:"#383838",color:"#fff"}};
    const CONFLICT_MESSAGES = {DECIR_TO_PIQUETE: "Elemento já escalado para serviço de Piquete, selecione apenas ED ou solicite ao Chefe de Secção a remoção do elemento do serviço de Piquete!",
                               PIQUETE_TO_DECIR: "Elemento já escalado para serviço de DECIR, selecione outro dia ou solicite ao responsável pela escala de DECIR a remoção do elemento do serviço de DECIR!"};
    const DECIR_LEGEND  = [{code:"ED",desc:"ECIN Dia"},{code:"EN",desc:"ECIN Noite"},{code:"ET",desc:"ECIN 24 Hrs."}];
    const ESCALA_LEGEND = [/*{code:"PD",desc:"Piquete Dia"}*/,{code:"PN",desc:"Piquete Noite"},/*{code:"PT",desc:"Piquete 24 Hrs."}*/,{code:"BX",desc:"Baixa"},
                           {code:"LC",desc:"Licença"},{code:"FE",desc:"Férias"},{code:"FO",desc:"Formação"},/*{code:"FD",desc:"Estágio Dia"},{code:"FN",desc:"Estágio Noite"}*/,];
    const ECIN_EXTRA = [{code:"ED",desc:"ECIN Dia"},{code:"EN",desc:"ECIN Noite"},{code:"ET",desc:"ECIN 24 Hrs."},{code:"EP",desc:"ECIN D\\Piquete N"}];    
    /* ─── HELPERS PARTILHADOS ────────────────────────────────── */
    const $ = id => document.getElementById(id);
    const parseCurrency = txt => !txt ? 0 : parseFloat(txt.replace('€','').replace(/\s/g,'').replace(/\./g,'').replace(',','.')) || 0;
    const parseVal = id => parseFloat(($( id)?.value||"0").replace(",",".")) || 0;
    const formatCurrency = v => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
    const formatNumber = v => new Intl.NumberFormat('pt-PT',{minimumFractionDigits:0,maximumFractionDigits:0}).format(v);
    const getCorpId = () => sessionStorage.getItem('currentCorpOperNr');
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
    function decirMakeWrapper(container) {
      let wrapper = container.querySelector(".table-container");
      if (!wrapper) {wrapper = document.createElement("div"); wrapper.className = "table-container"; container.appendChild(wrapper);}
      wrapper.innerHTML = "";
      Object.assign(wrapper.style, {position:"relative", maxHeight:"75vh", height:"500px", overflowY:"auto"});
      return wrapper;
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
    /* =========================
    POPUP EMIT
    ========================= */
    function showLoadingPopup(message) {
      document.getElementById("loading-popup")?.remove();
      document.getElementById("loading-overlay")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.style.cssText = `position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(6px); z-index: 10000; animation: fadeIn 0.25s ease;`;
      const popup = document.createElement("div");
      popup.id = "loading-popup";
      popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: #0f172a; padding: 36px 40px; border-radius: 18px;
                             box-shadow: 0 25px 60px rgba(0,0,0,0.4); z-index: 10000; text-align: center; min-width: 400px; max-width: 90%; 
                             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; animation: popupIn 0.25s ease;`;
      const spinner = document.createElement("div");
      spinner.style.cssText = `width: 52px; height: 52px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.12); border-top: 4px solid #38bdf8; margin: 0 auto 22px;
                               animation: spin 0.8s linear infinite;`;
      const text = document.createElement("p");
      text.id = "loading-popup-text";
      text.textContent = message;
      text.style.cssText = `font-size: 17px; font-weight: 600; color: #e2e8f0; margin: 0 0 18px;`;
      const progressBar = document.createElement("div");
      progressBar.id = "loading-progress-bar";
      progressBar.style.cssText = `width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;`;
      const progressFill = document.createElement("div");
      progressFill.id = "loading-progress-fill";
      progressFill.style.cssText = `width: 0%; height: 100%; background: linear-gradient(90deg,#38bdf8,#6366f1); border-radius: 999px; transition: width 0.35s ease;`;
      progressBar.appendChild(progressFill);
      popup.appendChild(spinner);
      popup.appendChild(text);
      popup.appendChild(progressBar);
      document.body.appendChild(overlay);
      document.body.appendChild(popup);
      if (!document.getElementById("popup-animations")) {
        const style = document.createElement("style");
        style.id = "popup-animations";
        style.textContent = `@keyframes spin {to {transform: rotate(360deg);}}
                             @keyframes popupIn {from {opacity: 0; transform: translate(-50%,-45%) scale(0.98);} to {opacity: 1; transform: translate(-50%,-50%) scale(1);}}
                             @keyframes fadeIn {from {opacity: 0;} to {opacity: 1;}}`;
        document.head.appendChild(style);
      }
    }
    function updateLoadingPopup(message, progress = null) {
      const text = document.getElementById("loading-popup-text");
      if (text) text.textContent = message;
      if (progress !== null) { const fill = document.getElementById("loading-progress-fill"); if (fill) fill.style.width = `${progress}%`; }
    }
    function hideLoadingPopup() {
      const duration = 0;
      ["loading-popup", "loading-overlay"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.animation = id === "loading-popup"
          ? "popupFadeOut 0.3s ease-out"
          : "overlayFadeOut 0.3s ease-out";
        setTimeout(() => el.remove(), duration);
      });
    }
