    /* =======================================
    LOAD MAIN DATA
    ======================================= */
    document.addEventListener('DOMContentLoaded', async () => {      
      const currentUser = sessionStorage.getItem("currentUserName") || "";
      const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
      const authNameEl = document.getElementById('authName');
      if (authNameEl) authNameEl.textContent = currentUserDisplay || "";
      /* ===================== VERIFICAÇÃO DE VALIDADE ===================== */
      async function checkUserValidity() {
        try {
          const nInt = sessionStorage.getItem("currentNInt");
          const corpNr = sessionStorage.getItem("currentCorpOperNr");
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
          const urlUsers = `${SUPABASE_URL}/rest/v1/users?n_int=eq.${encodeURIComponent(nInt)}&corp_oper_nr=eq.${corpNr}&select=validate`;;
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
      function updateSidebarAccess(allowedModules, userAccesses = []) {
        const sidebarButtons = document.querySelectorAll(".sidebar-menu-button, .sidebar-submenu-button, .sidebar-sub-submenu-button");
        sidebarButtons.forEach(btn => {
          const access = btn.dataset.access;
          const visible = access && allowedModules.includes(access) && userAccesses.includes(access);
          btn.style.display = visible ? "block" : "none";
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
          const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/corporation_data?select=corporation,logo_url,corp_oper_nr,allowed_modules,municipal_holiday,municipal_holiday_name&corp_oper_nr=eq.${corpOperNr}`, { 
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
            sessionStorage.setItem("municipalHoliday", corp.municipal_holiday || "");
            sessionStorage.setItem("municipalHolidayName", corp.municipal_holiday_name || "Feriado Municipal");
            return allowedModulesString.split(",").filter(m => m.trim());
          }
          return [];
        } catch (error) {
          console.error("Erro ao carregar header da corporação:", error);
          return [];
        }
      }
      /* ========== USER ACCESSES =========== */
      async function loadUserAccessesSafe(nInt, corpOperNr) {
        if (!nInt || !corpOperNr) {
          return {acess: [], corpOperNr};
        }    
        const corpOperNrString = String(corpOperNr).trim();    
        try {
          const url = `${SUPABASE_URL}/rest/v1/reg_elems?select=acess,section,corp_oper_nr&n_int=eq.${encodeURIComponent(nInt)}&corp_oper_nr=eq.${corpOperNrString}`;
          const response = await fetch(url, { headers: getSupabaseHeaders() });
          if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
          const data = await response.json();
          const correctRecords = data.filter(record => {
            const recordCorpNr = String(record.corp_oper_nr).trim();
            return recordCorpNr === corpOperNrString;
          });    
          if (!correctRecords.length) {
            console.warn(`❌ Nenhum acesso encontrado para o nº ${nInt} na corporação ${corpOperNrString}`);
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
        const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
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
      const currentFullName = sessionStorage.getItem("currentUserDisplay");
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const isValid = await checkUserValidity(currentFullName);
      const accessResult = await loadUserAccessesSafe(sessionStorage.getItem("currentNInt"), currentCorpOperNr);
      const userHasAccess = isValid && applyAccessesSafe(accessResult);
      if (userHasAccess) {
        updateSidebarAccess(allowedModules, accessResult.acess);
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
          if (pageId === "volunteer-services-consulting") {
            if (typeof initializeFilters === "function") initializeFilters();
          }
          if (document.getElementById("panel-sendMails")) {
            loadMailAddresses("ro");
          }
          if (pageId === "page-cb360-redund") {
            if (document.getElementById('cb360-incident-wrapper')) {
              closeCb360Incident();
            } else if (typeof setDateFilter === "function") {
              const tbody = document.getElementById('cb360-table-body');
              if (tbody) tbody.innerHTML = `<tr>...A carregar...</tr>`;
              setDateFilter('day');
            }
          }
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
              if (clickWhenExists(".panel-sidebar-menu-button[onclick*=\"showPanelCardUtilities('epe')\"]", page, () => {
              if (typeof loadVehiclesFromsessionStorage === "function") loadVehiclesFromsessionStorage();
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
              if (clickWhenExists(".panel-sidebar-menu-button[onclick*=\"showPanelCardDataCenter('assoc')\"]", page)) {
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
    let cachedDistricts = null;
    async function fetchDistrictsFromSupabase() {
      if (cachedDistricts) return cachedDistricts;
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/districts_select?select=id,district`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const districts = await resp.json();
        cachedDistricts = districts.map(d => ({
          id: d.id,
          name: d.district
        }));
        return cachedDistricts;
      } catch (e) {
        console.error("Erro ao buscar distritos:", e);
        return fallbackDistricts || [];
      }
    }
    let cachedCorpDistrictId;
    async function getCorpDefaultDistrictId(districts) {
      if (cachedCorpDistrictId !== undefined) return cachedCorpDistrictId;
      cachedCorpDistrictId = null;
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corpOperNr}&select=corp_district&limit=1`, {headers: getSupabaseHeaders()});
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const name = (await resp.json())[0]?.corp_district || "";
        const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        cachedCorpDistrictId = districts.find(d => norm(d.name) === norm(name))?.id ?? null;
      } catch (e) {
        console.warn("Não foi possível obter o distrito da corporação:", e);
      }
      return cachedCorpDistrictId;
    }
    async function populateAllDistrictSelects(defaultDistrictId = null) {
      const districtSelects = document.querySelectorAll('[id*="district_select"]');
      if (districtSelects.length === 0) {
        return console.warn("Nenhum select de distritos encontrado");
      }
      const districts = await fetchDistrictsFromSupabase();
      if (defaultDistrictId === null) defaultDistrictId = await getCorpDefaultDistrictId(districts);
      const defaultDistrict = districts.find(d => d.id === defaultDistrictId);
      const otherDistricts = districts
        .filter(d => d.id !== defaultDistrictId)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt', {sensitivity: 'base'}));
      // Com distrito da corporação: aparece em 1.º e fica escolhido. Sem ele: lista alfabética com opção vazia.
      const orderedDistricts = defaultDistrict ? [defaultDistrict, ...otherDistricts] : otherDistricts;
      districtSelects.forEach(sel => {
        sel.innerHTML = defaultDistrict ? '' : '<option value=""></option>';
        orderedDistricts.forEach(d => {
          const option = document.createElement('option');
          option.value = String(d.id);
          option.textContent = d.name;
          sel.appendChild(option);
        });
        sel.value = defaultDistrict ? String(defaultDistrict.id) : "";
      });
    }
    /* ============= COUNCILS ============= */
    const cachedCouncilsByDistrict = {};
    async function fetchCouncilsByDistrict(districtId) {
      if (!districtId) return [];
      if (cachedCouncilsByDistrict[districtId]) return cachedCouncilsByDistrict[districtId];
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/councils_select?select=id,council&district_id=eq.${districtId}`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const councils = await resp.json();
        const mapped = councils.map(c => ({
          id: c.id,
          name: c.council
        }));
        cachedCouncilsByDistrict[districtId] = mapped;
        return mapped;
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
    async function populateParishesByCouncil(councilId, triggerSelectId, targetParish = null) {
      const parishSelectId = triggerSelectId.replace('council', 'parish');
      const parishSelect = document.getElementById(parishSelectId);
      if (!parishSelect) return;  
      const parishes = (await fetchParishesByCouncil(councilId))
        .sort((a, b) => a.localeCompare(b, 'pt', {
        sensitivity: 'base'
      }));    
      parishSelect.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '';
      parishSelect.appendChild(defaultOption);
      parishes.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        parishSelect.appendChild(option);
      });
      if (targetParish) {
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const cleanTarget = normalize(targetParish);    
        const found = [...parishSelect.options].find(o => {
          if (!o.value) return false;
          const optText = normalize(o.text);
          return optText === cleanTarget || optText.includes(cleanTarget) || cleanTarget.includes(optText);
        });    
        if (found) {
          parishSelect.value = found.value;
          parishSelect.dispatchEvent(new Event('change'));
        } else {
          parishSelect.value = '';
          parishSelect.dispatchEvent(new Event('change'));
          console.warn("Freguesia do Nominatim não encontrada na base de dados oficial. Campo deixado em branco para evitar erros:", targetParish);
        }
      }
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
      await populateAllDistrictSelects();
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
        await populateAllDistrictSelects();
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
                            {id: 'refusal_year_filter', category: 'refusal_year_filter'}, {id: 'sitop_type_failure', category: 'sitop_failure_type'},
                            {id: 'moa_cb', category: 'moa_cb_choose'}, {id: 'moa_device_type', category: 'moa_device'}, {id: 'moa_epe_type', category: 'moa_epe_state'},
                            {id: 'moa_eco_sit', category: 'moa_situation'}, {id: 'moa_oco_sit', category: 'moa_situation'}, {id: 'moa_era_sit', category: 'moa_situation'},
                            {id: 'moa_eob_sit', category: 'moa_situation'}, {id: 'moa_mef_sit', category: 'moa_mef_val'},
                            {id: 'moa_eco_pront', category: 'moa_pertime'}, {id: 'moa_ned_pront', category: 'moa_formnot'}, {id: 'moa_oco_pront', category: 'moa_pertime'},
                            {id: 'moa_era_pront', category: 'moa_pertime'}, {id: 'moa_eob_pront', category: 'moa_pertime'}, {id: 'moa_rsc_pront', category: 'moa_optref'}];
      const categories = [...new Set(globalFields.map(f => f.category))];
      let byCategory = {};
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/static_options?select=category,value&category=in.(${categories.join(',')})&order=id`, {
          headers: getSupabaseHeaders()
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        (await resp.json()).forEach(r => {
          if (!r.value) return;
          (byCategory[r.category] ||= []).push(r.value);
        });
      } catch (e) {
        console.error("Erro ao buscar opções globais:", e);
      }
      for (const field of globalFields) {
        const select = document.getElementById(field.id);
        if (!select) continue;
        select.innerHTML = '<option value=""></option>';
        (byCategory[field.category] || []).forEach(opt => {
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
    function showbreve() {
      showPopup('popup-maininfo', `Este módulo estará brevemente disponível no CB360.`);
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
    document.getElementById('footer-year').textContent = new Date().getFullYear();
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
      } else if (hour >= 12 && hour < 20) {
        return "Boa tarde,";
      } else {
        return "Boa noite,";
      }
    }   
    /* ====== GENERIC COMMANDER LOAD ====== */
    async function getCommanderName(corpOperNr) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name&corp_oper_nr=eq.${corpOperNr}&patent=eq.Comandante&type_quad=eq.QCOM`, {
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
                     {month:6,day:10,name:"Dia de Portugal"},{month:8,day:15,name:"Assunção de Nossa Senhora"},
                     {month:10,day:5,name:"Implantação da República"},{month:11,day:1,name:"Todos os Santos"},{month:12,day:1,name:"Restauração da Independência"},
                     {month:12,day:8,name:"Imaculada Conceição"},{month:12,day:25,name:"Natal"}];
      const mh = (sessionStorage.getItem("municipalHoliday") || "").split("-").map(Number);
      if (mh.length === 2 && mh[0] && mh[1]) {
        fixed.push({month: mh[0], day: mh[1], name: sessionStorage.getItem("municipalHolidayName") || "Feriado Municipal"});
      }
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
    /* =====================================================================
       PAINEL DE FÉRIAS (layout novo) — usado pela Gestão Operacional (Voluntariado)
       e pelos Recursos Humanos (Profissional). Colar UMA vez no js (antes das secções
       VACATIONS e PEDIDOS DE FÉRIAS PROFISSIONAIS).
       Cada página cria o seu painel com createVacBoard({...}); aprovar/recusar continua
       a ser feito pelas funções que já existem (updateVacatState / rhvUpdateState).
       ===================================================================== */
    (function vbInjectCss() {
      if (document.getElementById('vb-css')) return;
      const css = `
      .vb {font-size: 13px; color: #2c3e50;}
      .vb-toolbar {display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 14px;}
      .vb-year {display: inline-flex; align-items: center; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; background: #fff;}
      .vb-year button {border: 0; background: #fff; width: 30px; height: 32px; cursor: pointer; font-size: 16px; color: #8b0000;}
      .vb-year button:hover {background: #f8eaea;}
      .vb-year span {min-width: 54px; text-align: center; font-weight: 700; font-size: 14px;}
      .vb-chips {display: inline-flex; gap: 6px; flex-wrap: wrap;}
      .vb-chip {border: 1px solid #dee2e6; background: #fff; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #495057; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;}
      .vb-chip i {width: 8px; height: 8px; border-radius: 50%; display: inline-block;}
      .vb-chip.on {background: #2c3e50; color: #fff; border-color: #2c3e50;}
      .vb-search {margin-left: auto; height: 32px; border: 1px solid #dee2e6; border-radius: 8px; padding: 0 10px; font-size: 12.5px; min-width: 220px;}
      .vb-kpis {display: grid; grid-template-columns: repeat(4, minmax(140px, 1fr)); gap: 10px; margin-bottom: 14px;}
      .vb-kpi {background: #fff; border: 1px solid #e9ecef; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); border-left: 4px solid var(--c);}
      .vb-kpi-ico {width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--c) 14%, #fff); color: var(--c); font-size: 17px; flex-shrink: 0;}
      .vb-kpi b {display: block; font-size: 22px; line-height: 1.1; color: #1f2d3a;}
      .vb-kpi small {font-size: 11px; color: #6c757d; text-transform: uppercase; letter-spacing: .4px; font-weight: 600;}
      .vb-months {display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px;}
      .vb-month {position: relative; background: #fff; border: 1px solid #e9ecef; border-radius: 10px; padding: 10px 10px 9px; cursor: pointer; text-align: left; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;}
      .vb-month:hover {transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.08);}
      .vb-month.empty {opacity: .5;}
      .vb-month.sel {border-color: #c62828; box-shadow: 0 0 0 2px rgba(198,40,40,.18);}
      .vb-month .vb-mname {font-weight: 700; font-size: 13px; color: #2c3e50;}
      .vb-month .vb-mcount {font-size: 11px; color: #6c757d; margin-top: 2px;}
      .vb-month .vb-mbar {display: flex; height: 5px; border-radius: 3px; overflow: hidden; margin-top: 7px; background: #f1f3f5;}
      .vb-month .vb-mbar span {display: block; height: 100%;}
      .vb-month .vb-pend {position: absolute; top: -7px; right: -7px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; background: #f39c12; color: #fff; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(243,156,18,.45);}
      .vb-panel {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
      .vb-panel-head {display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #e9ecef; background: #fafbfc;}
      .vb-panel-head h4 {margin: 0; font-size: 15px; color: #2c3e50;}
      .vb-panel-head .vb-sub {font-size: 12px; color: #6c757d;}
      .vb-legend {margin-left: auto; display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: #6c757d;}
      .vb-legend span {display: inline-flex; align-items: center; gap: 5px;}
      .vb-legend i {width: 12px; height: 12px; border-radius: 3px; display: inline-block;}
      .vb-scroll {overflow-x: auto;}
      .vb-grid {border-collapse: separate; border-spacing: 0; width: 100%;}
      .vb-grid th, .vb-grid td {border-bottom: 1px solid #f1f3f5; padding: 0;}
      .vb-grid thead th {position: sticky; top: 0; background: #fff; font-size: 10px; color: #6c757d; font-weight: 700; text-transform: uppercase; z-index: 1;}
      .vb-grid .vb-who {text-align: left; padding: 7px 10px 7px 16px; min-width: 190px; max-width: 230px; position: sticky; left: 0; background: #fff; z-index: 2; box-shadow: 1px 0 0 #f1f3f5;}
      .vb-grid thead .vb-who {z-index: 3;}
      .vb-who .vb-name {font-weight: 700; font-size: 12.5px; color: #2c3e50; white-space: nowrap;}
      .vb-who .vb-meta {font-size: 11px; color: #8a949e; white-space: nowrap;}
      .vb-who .vb-days {font-size: 11.5px; font-weight: 700; color: #2c3e50; margin-top: 2px; white-space: nowrap;}
      .vb-who .vb-days small {font-weight: 500; color: #8a949e;}
      .vb-day {width: 22px; min-width: 22px; text-align: center; height: 34px;}
      .vb-grid thead .vb-day {height: 38px; line-height: 1.15;}
      .vb-grid thead .vb-day b {display: block; font-size: 11px; color: #2c3e50;}
      .vb-day.we {background: rgba(240, 200, 120, .22);}
      .vb-day.hol {background: rgba(247, 198, 199, .55);}
      .vb-cell {display: block; margin: 0 auto; width: 18px; height: 18px; border-radius: 5px;}
      .vb-cell.p {background: linear-gradient(135deg, #ffb74d, #ef6c00);}
      .vb-cell.a {background: linear-gradient(135deg, #66bb6a, #2e7d32);}
      .vb-cell.r {background: repeating-linear-gradient(45deg, #ef9a9a 0 3px, #e53935 3px 6px); opacity: .75;}
      .vb-state {display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap;}
      .vb-state.p {background: #fff3e0; color: #e65100;}
      .vb-state.a {background: #e8f5e9; color: #2e7d32;}
      .vb-state.r {background: #ffebee; color: #c62828;}
      .vb-act {padding: 6px 16px 6px 6px; white-space: nowrap; text-align: right; width: 76px;}
      .vb-btn {border: 0; border-radius: 6px; width: 30px; height: 28px; padding: 0; font-size: 14px; font-weight: 700; cursor: pointer; color: #fff; display: inline-flex; align-items: center; justify-content: center;}
      .vb-btn.ok {background: #2e7d32;} .vb-btn.ok:hover {background: #1b5e20;}
      .vb-btn.no {background: #e53935;} .vb-btn.no:hover {background: #b71c1c;}
      .vb-btn:disabled {opacity: .35; cursor: default;}
      .vb-btn.busy {opacity: .6; pointer-events: none;}
      .vb-total td {background: #fafbfc; border-top: 2px solid #e9ecef;}
      .vb-total .vb-who {background: #fafbfc; font-size: 11px; font-weight: 700; color: #6c757d; text-transform: uppercase;}
      .vb-tot {font-size: 11px; font-weight: 700; color: #6c757d;}
      .vb-tot.hot {display: inline-block; min-width: 18px; border-radius: 4px; background: #c62828; color: #fff;}
      .vb-empty {padding: 30px; text-align: center; color: #8a949e;}
      .vb-loading {padding: 30px; text-align: center; color: #8a949e;}
      @media (max-width: 1100px) {.vb-months {grid-template-columns: repeat(4, 1fr);} .vb-kpis {grid-template-columns: repeat(2, 1fr);}}
      `;
      const st = document.createElement('style');
      st.id = 'vb-css';
      st.textContent = css;
      document.head.appendChild(st);
    })();

    function createVacBoard(cfg) {
      /* cfg: {root, type: 'Voluntariado'|'Profissional', badgeId: id => 'badge-'+id, setState: (id, state, year, month) => Promise,
               overlapLimit: n => número máximo por dia (opcional, só para destacar na linha "Por dia") } */
      const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const WD = ['D','S','T','Q','Q','S','S'];
      const ST = {'Em Aprovação': 'p', 'Aprovadas': 'a', 'Recusadas': 'r'};
      const ST_LABEL = {p: 'Em aprovação', a: 'Aprovadas', r: 'Recusadas'};
      const now = new Date();
      const S = {year: now.getFullYear(), month: null, filter: 'all', q: '', rows: [], elems: {}, loaded: false};
      const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const days = r => String(r.day || '').split(',').map(d => parseInt(d, 10)).filter(d => !isNaN(d)).sort((a, b) => a - b);
      const stKey = r => ST[r.state] || 'p';
      function groupDays(list) {
        const out = []; let s = null, e = null;
        list.forEach(d => { if (s === null) { s = e = d; } else if (d === e + 1) { e = d; } else { out.push(s === e ? `${s}` : `${s}–${e}`); s = e = d; } });
        if (s !== null) out.push(s === e ? `${s}` : `${s}–${e}`);
        return out.join(', ');
      }
      function holidays(year, month) {
        const fixed = [[1,1,'Ano Novo'],[4,25,'Dia da Liberdade'],[5,1,'Dia do Trabalhador'],[6,10,'Dia de Portugal'],[8,15,'Assunção de N. Senhora'],[10,5,'Implantação da República'],
                       [11,1,'Todos os Santos'],[12,1,'Restauração da Independência'],[12,8,'Imaculada Conceição'],[12,25,'Natal']];
        const list = fixed.map(([m, d, n]) => ({date: new Date(year, m - 1, d, 12), name: n}));
        const [mm, dd] = (sessionStorage.getItem('municipalHoliday') || '').split('-').map(Number);
        if (mm && dd) list.push({date: new Date(year, mm - 1, dd, 12), name: sessionStorage.getItem('municipalHolidayName') || 'Feriado Municipal'});
        const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
        const easter = new Date(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1, 12);
        const plus = n => { const x = new Date(easter); x.setDate(x.getDate() + n); return x; };
        list.push({date: plus(-47), name: 'Carnaval (facultativo)'}, {date: plus(-2), name: 'Sexta-feira Santa'}, {date: easter, name: 'Páscoa'}, {date: plus(60), name: 'Corpo de Deus'});
        const map = new Map();
        list.forEach(x => { if (x.date.getMonth() === month - 1) map.set(x.date.getDate(), x.name); });
        return map;
      }
      const root = () => document.getElementById(cfg.root);

      async function load() {
        const el = root(); if (!el) return;
        if (!S.loaded) el.innerHTML = '<div class="vb-loading">A carregar pedidos...</div>';
        const corp = sessionStorage.getItem('currentCorpOperNr');
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/ped_vacat?select=id,n_int,year,month,day,state&corp_oper_nr=eq.${corp}&vacation_type=eq.${encodeURIComponent(cfg.type)}&year=eq.${S.year}&order=month.asc,n_int.asc`, {headers: getSupabaseHeaders()});
          if (!r.ok) throw new Error(await r.text());
          S.rows = await r.json();
          const missing = [...new Set(S.rows.map(x => x.n_int))].filter(n => !S.elems[n]);
          if (missing.length) {
            const re = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,full_name,abv_name,patent&corp_oper_nr=eq.${corp}&n_int=in.(${missing.join(',')})`, {headers: getSupabaseHeaders()});
            if (re.ok) (await re.json()).forEach(e => { S.elems[e.n_int] = e; });
          }
          if (S.month === null) {
            const pend = S.rows.find(x => stKey(x) === 'p');
            S.month = pend ? pend.month : (S.year === now.getFullYear() ? now.getMonth() + 1 : 1);
          }
          S.loaded = true;
          render();
        } catch (e) {
          console.error('Painel de férias:', e);
          el.innerHTML = '<div class="vb-empty" style="color:#c62828;">Erro ao carregar os pedidos.</div>';
        }
      }
      function visibleRows(list) {
        const q = S.q.trim().toLowerCase();
        return list.filter(x => (S.filter === 'all' || stKey(x) === S.filter) &&
          (!q || String(x.n_int).includes(q) || String(S.elems[x.n_int]?.full_name || '').toLowerCase().includes(q)));
      }
      function render() {
        const el = root(); if (!el) return;
        const all = S.rows;
        const cnt = k => all.filter(x => stKey(x) === k).length;
        const totalDays = all.filter(x => stKey(x) !== 'r').reduce((s, x) => s + days(x).length, 0);
        const byMonth = m => all.filter(x => x.month === m);
        const kpi = (c, ico, n, label) => `<div class="vb-kpi" style="--c:${c}"><div class="vb-kpi-ico">${ico}</div><div><b>${n}</b><small>${label}</small></div></div>`;
        const chip = (k, label, color) => `<button type="button" class="vb-chip ${S.filter === k ? 'on' : ''}" data-f="${k}">${color ? `<i style="background:${color}"></i>` : ''}${label}</button>`;
        el.innerHTML = `
          <div class="vb">
            <div class="vb-toolbar">
              <div class="vb-year"><button type="button" data-y="-1" title="Ano anterior">‹</button><span>${S.year}</span><button type="button" data-y="1" title="Ano seguinte">›</button></div>
              <div class="vb-chips">${chip('all', 'Todos')}${chip('p', 'Em aprovação', '#ef6c00')}${chip('a', 'Aprovadas', '#2e7d32')}${chip('r', 'Recusadas', '#e53935')}</div>
              <input type="text" class="vb-search" placeholder="Procurar nº ou nome…" value="${esc(S.q)}">
            </div>
            <div class="vb-kpis">
              ${kpi('#ef6c00', '⏳', cnt('p'), 'Em aprovação')}
              ${kpi('#2e7d32', '✓', cnt('a'), 'Aprovadas')}
              ${kpi('#e53935', '✕', cnt('r'), 'Recusadas')}
              ${kpi('#1565c0', '📅', totalDays, `Dias pedidos em ${S.year}`)}
            </div>
            <div class="vb-months">
              ${MONTHS.map((n, i) => {
                const m = i + 1, list = byMonth(m), p = list.filter(x => stKey(x) === 'p').length;
                const a = list.filter(x => stKey(x) === 'a').length, r = list.filter(x => stKey(x) === 'r').length, t = list.length || 1;
                return `<div class="vb-month ${list.length ? '' : 'empty'} ${S.month === m ? 'sel' : ''}" data-m="${m}">
                  ${p ? `<span class="vb-pend" title="${p} por tratar">${p}</span>` : ''}
                  <div class="vb-mname">${n}</div>
                  <div class="vb-mcount">${list.length ? `${list.length} pedido${list.length > 1 ? 's' : ''}` : 'Sem pedidos'}</div>
                  <div class="vb-mbar">${list.length ? `<span style="width:${a / t * 100}%;background:#2e7d32"></span><span style="width:${p / t * 100}%;background:#ef6c00"></span><span style="width:${r / t * 100}%;background:#e53935"></span>` : ''}</div>
                </div>`;
              }).join('')}
            </div>
            <div class="vb-panel">${panel()}</div>
          </div>`;
        el.querySelectorAll('[data-y]').forEach(b => b.onclick = () => { S.year += Number(b.dataset.y); S.month = null; S.loaded = false; load(); });
        el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { S.filter = b.dataset.f; render(); });
        el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { S.month = Number(b.dataset.m); render(); });
        const search = el.querySelector('.vb-search');
        search.oninput = () => { S.q = search.value; const p = el.querySelector('.vb-panel'); p.innerHTML = panel(); bindPanel(); };
        bindPanel();
      }
      function panel() {
        const m = S.month, y = S.year;
        const list = visibleRows(S.rows.filter(x => x.month === m));
        const nDays = new Date(y, m, 0).getDate();
        const hol = holidays(y, m);
        const cols = Array.from({length: nDays}, (_, i) => i + 1);
        const cls = d => { const wd = new Date(y, m - 1, d).getDay(); return hol.has(d) ? 'hol' : (wd === 0 || wd === 6 ? 'we' : ''); };
        const head = `<div class="vb-panel-head">
            <h4>${MONTHS[m - 1]} ${y}</h4>
            <span class="vb-sub">${list.length} pedido${list.length === 1 ? '' : 's'}${S.filter !== 'all' ? ` · ${ST_LABEL[S.filter].toLowerCase()}` : ''}</span>
            <div class="vb-legend">
              <span><i style="background:linear-gradient(135deg,#ffb74d,#ef6c00)"></i>Em aprovação</span>
              <span><i style="background:linear-gradient(135deg,#66bb6a,#2e7d32)"></i>Aprovada</span>
              <span><i style="background:repeating-linear-gradient(45deg,#ef9a9a 0 3px,#e53935 3px 6px)"></i>Recusada</span>
              <span><i style="background:rgba(240,200,120,.5)"></i>Fim de semana</span>
              <span><i style="background:rgba(247,198,199,.9)"></i>Feriado</span>
            </div>
          </div>`;
        if (!list.length) return head + `<div class="vb-empty">Sem pedidos ${S.filter !== 'all' || S.q ? 'com estes filtros ' : ''}em ${MONTHS[m - 1].toLowerCase()}.</div>`;
        const perDay = {};
        list.filter(x => stKey(x) !== 'r').forEach(x => days(x).forEach(d => { perDay[d] = (perDay[d] || 0) + 1; }));
        const limit = cfg.overlapLimit || 0;
        const thead = `<tr><th class="vb-who">Elemento</th>${cols.map(d => `<th class="vb-day ${cls(d)}" title="${esc(hol.get(d) || '')}"><b>${d}</b>${WD[new Date(y, m - 1, d).getDay()]}</th>`).join('')}<th style="padding:0 8px;">Estado</th><th class="vb-act">Ações</th></tr>`;
        const body = list.map(x => {
          const e = S.elems[x.n_int] || {}, k = stKey(x), ds = new Set(days(x));
          return `<tr>
            <td class="vb-who"><div class="vb-name">${esc(e.full_name || 'Nº ' + x.n_int)}</div><div class="vb-meta">Nº ${esc(x.n_int)}${e.patent ? ' · ' + esc(e.patent) : ''}</div>
              <div class="vb-days">${groupDays([...ds])} <small>· ${ds.size} dia${ds.size === 1 ? '' : 's'}</small></div></td>
            ${cols.map(d => `<td class="vb-day ${cls(d)}">${ds.has(d) ? `<span class="vb-cell ${k}" title="${d}/${m} · ${ST_LABEL[k]}"></span>` : ''}</td>`).join('')}
            <td style="padding:0 8px; text-align:center;"><span class="vb-state ${k}" id="${cfg.badgeId(x.id)}">${esc(x.state)}</span></td>
            <td class="vb-act">
              <button type="button" class="vb-btn ok" data-id="${x.id}" data-s="Aprovadas" title="Aprovar" ${k === 'a' ? 'disabled' : ''}>✓</button>
              <button type="button" class="vb-btn no" data-id="${x.id}" data-s="Recusadas" title="Recusar" ${k === 'r' ? 'disabled' : ''}>✕</button>
            </td>
          </tr>`;
        }).join('');
        const total = `<tr class="vb-total"><td class="vb-who">Por dia</td>${cols.map(d => {
            const n = perDay[d] || 0;
            return `<td class="vb-day ${cls(d)}">${n ? `<span class="vb-tot ${limit && n > limit ? 'hot' : ''}" title="${n} de férias neste dia">${n}</span>` : ''}</td>`;
          }).join('')}<td colspan="2"></td></tr>`;
        return head + `<div class="vb-scroll"><table class="vb-grid"><thead>${thead}</thead><tbody>${body}${total}</tbody></table></div>`;
      }
      function bindPanel() {
        const el = root(); if (!el) return;
        el.querySelectorAll('.vb-btn[data-id]').forEach(b => b.onclick = async () => {
          const id = Number(b.dataset.id), row = S.rows.find(x => x.id === id);
          if (!row) return;
          el.querySelectorAll(`.vb-btn[data-id="${id}"]`).forEach(x => x.classList.add('busy'));
          try { await cfg.setState(id, b.dataset.s, row.year, row.month); } finally { await load(); }
        });
      }
      return {load, reset() { S.loaded = false; S.month = null; }};
    }
