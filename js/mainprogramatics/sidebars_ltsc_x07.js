/* =======================================
       SIDEBAR AND PANEL SIDEBAR
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
                  if (typeof createRelevInfoInputs === "function") createRelevInfoInputs();
                  if (typeof loadInfosFromSupabase === "function") loadInfosFromSupabase();
                  if (typeof loadRoutesFromSupabase === "function") loadRoutesFromSupabase();
                  if (typeof loadCMAsFromSupabase === "function") loadCMAsFromSupabase();
                  if (typeof loadElemsButtons === "function") loadElemsButtons();
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
  const styleId = `${blinkClass}-style`;
  const existingStyle = document.getElementById(styleId);
  
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .sidebar-menu-button.${blinkClass},
    .sidebar-menu-button.${blinkClass}:hover {
      animation: ${blinkClass}-anim 0.9s infinite !important;
      transition: none !important;
    }
    @keyframes ${blinkClass}-anim {
      0% { background: ${primaryColor} !important; }
      50% { background: ${blinkColor} !important; }
      100% { background: ${primaryColor} !important; }
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


