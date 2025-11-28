    /* =======================================
              EMS SERVICES
    ======================================= */
    const inem = document.getElementById('alert-inem');
    const reserv = document.getElementById('alert-reserv');
    inem.addEventListener('change', () => {
      if (inem.checked) reserv.checked = false;
    });
    reserv.addEventListener('change', () => {
      if (reserv.checked) inem.checked = false;
    });
    /* ================ CREATION OF EMS SERVICES MESSAGE =============== */
    function generateCODUserviceMessage() {
      const hourAlert = document.getElementById('alert-service')?.value || '';
      const address = document.getElementById('address-service')?.value?.trim() || '';
      const locality = document.getElementById('location-service')?.value?.trim() || '';
      const referencePoint = document.getElementById('reference-address-service')?.value?.trim() || '';
      const gender = document.getElementById('victim-gender-service')?.value || '';
      const age = document.getElementById('victim-age-service')?.value?.trim() || '';
      const ageType = document.getElementById('victim-age-type-service')?.value || '';
      const situation = document.getElementById('situation-service')?.value?.trim() || '';
      const nrCODU = document.getElementById('nr-codu-service')?.value?.trim() || '';
      const observations = document.getElementById('observations-service')?.value?.trim() || '';
      let messageTitle = `*🚨⚠️ SERVIÇO INEM ⚠️🚨*`;
      if (reserv.checked) {
        messageTitle = '*🚨⚠️ SERVIÇO INEM-Reserva ⚠️🚨*';
      }
      let message = `${messageTitle}\n\n`;
      if (nrCODU) message += `*Nr. CODU:* ${nrCODU}\n`;
      if (hourAlert) message += `*Hora Alerta:* ${hourAlert}\n`;
      if (address || locality) message += `*Local:* ${address}${address && locality ? ' - ' : ''}${locality}\n`;
      if (referencePoint) message += `*Ponto Ref.:* ${referencePoint}\n`;
      if (gender || age) message += `*Vítima:* ${gender}${gender && (age || ageType) ? ', ' : ''}${age} ${ageType}\n`;
      if (situation) message += `*Situação:* ${situation}\n\n`;
      if (observations) message += `*Observações:* ${observations}`;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).then(() => {
          showPopupSuccess("Mensagem criada e copiada! Pode colar no WhatsApp (CTRL+V).");
          clearFormFields();
        }).catch(() => showPopupWarning("Não foi possível copiar automaticamente. Copie manualmente."));
      } else {
        showPopupSuccess("Mensagem criada! Copie manualmente o texto.");
      }
      console.log(message);
      return message;
    }    
    /* ============== EMS SERVICES FIELDS CONFIGURATIONS =============== */
    function focusAddressField() {
      const addressInput = document.getElementById("address-service");
      if (addressInput) {
        addressInput.focus();
      } else {
        setTimeout(focusAddressField, 150);
      }
    }
    
    function setCurrentTimeForINEMService() {
      const timeInput = document.getElementById("alert-service");
      if (!timeInput) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      timeInput.value = `${hh}:${mm}`;
    }

    function trySetTimeWithRetry(retries = 5, delay = 100) {
      let attempts = 0;
      const t = setInterval(() => {
        attempts++;
        const input = document.getElementById("alert-service");
        if (input) {
          setCurrentTimeForINEMService();
          clearInterval(t);
          return;
        }
        if (attempts >= retries) clearInterval(t);
      }, delay);
    }
    document.addEventListener("DOMContentLoaded", () => {
      const inemPage = document.getElementById("page-inem-services");
      if (inemPage) {
        const isVisible = () => {
          const style = window.getComputedStyle(inemPage);
          return style && style.display !== "none" && style.visibility !== "hidden" && inemPage.offsetParent !== null;
        };
        if (isVisible()) {
          trySetTimeWithRetry();
        }
      }
    });

    function attachSidebarTimeSetter() {
      const selectors = [".sidebar-submenu-button", ".sidebar-sub-submenu-button"];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(btn => {
          if (btn._hasInemListener) return;
          btn._hasInemListener = true;
          btn.addEventListener("click", (ev) => {
            const target = btn.dataset.page;
            if (target === "page-inem-services") {
              setCurrentTimeForINEMService();
              trySetTimeWithRetry();
            }
          });
        });
      });
    }
    attachSidebarTimeSetter();
    (function observePageVisibility() {
      const inemPage = document.getElementById("page-inem-services");
      if (!inemPage) return;
      const setIfVisible = (node) => {
        const style = window.getComputedStyle(node);
        const visible = style && style.display !== "none" && style.visibility !== "hidden" && node.offsetParent !== null;
        if (visible) {
          setCurrentTimeForINEMService();
          trySetTimeWithRetry();
          focusAddressField();
        }
      };
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes" && (m.attributeName === "class" || m.attributeName === "style")) {
            setIfVisible(inemPage);
          }
          if (m.type === "childList" && m.addedNodes.length) {
            setIfVisible(inemPage);
          }
        }
      });
      mo.observe(inemPage, { attributes: true, attributeFilter: ["class", "style"], childList: true, subtree: false });
      setIfVisible(inemPage);
    })();
    setInterval(attachSidebarTimeSetter, 1500);