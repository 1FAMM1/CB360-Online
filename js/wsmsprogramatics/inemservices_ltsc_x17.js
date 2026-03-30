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
    document.getElementById("resp-tas-ni")?.addEventListener("input", async function () {
      const ni = this.value.trim();
      const nameInput = document.getElementById("resp-tas-name");
      if (!nameInput) return;
      if (ni.length < 3) {
        nameInput.value = "";
        return;
      }
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const data = await supabaseFetch(`reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=eq.${ni}&select=abv_name&limit=1`);
        nameInput.value = data?.[0]?.abv_name || "";
      } catch(err) {
        console.error("Erro ao procurar elemento:", err);
        nameInput.value = "";
      }
    });    
    /* ============== VALIDATION =============== */
    function validateCODUServiceForm() {
      const fields = [{id: 'alert-inem', label: 'Tipo de Serviço (INEM ou Reserva)', type: 'checkbox-group'}, {id: 'alert-service', label: 'Hora Alerta', type: 'text'}, 
                      {id: 'address-service', label: 'Morada', type: 'text'}, {id: 'location-service', label: 'Localidade', type: 'text'}, {id: 'victim-gender-service', label: 'Género da Vítima', type: 'select'}, 
                      {id: 'victim-age-service', label: 'Idade da Vítima', type: 'text'}, {id: 'victim-age-type-service', label: 'Tipo de Idade', type: 'select'}, 
                      {id: 'situation-service', label: 'Situação', type: 'text'}, {id: 'nr-codu-service', label: 'Nr. CODU', type: 'text'}, {id: 'resp-tas-name', label: 'Nr. TAS', type: 'text'},];
      const missing = [];
      for (const field of fields) {
        if (field.type === 'checkbox-group') {
          if (!inem.checked && !reserv.checked) {
            missing.push('Tipo de Serviço (INEM ou Reserva)');
          }
          continue;
        }
        const el = document.getElementById(field.id);
        if (!el) continue;        
        const value = el.value?.trim();
        if (!value) {
          missing.push(field.label);
        }
      }
     if (missing.length > 0) {
       const list = missing.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
       showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
       return false;
     }
      return true;
    }
    /* ================ CREATION OF EMS SERVICES MESSAGE =============== */
    async function generateCODUserviceMessage() {
      if (!validateCODUServiceForm()) return;
      const hourAlert = document.getElementById('alert-service')?.value || '';
      const address = document.getElementById('address-service')?.value?.trim() || '';
      const locality = document.getElementById('location-service')?.value?.trim() || '';
      const referencePoint = document.getElementById('reference-address-service')?.value?.trim() || '';
      const gender = document.getElementById('victim-gender-service')?.value || '';
      const age = document.getElementById('victim-age-service')?.value?.trim() || '';
      const ageType = document.getElementById('victim-age-type-service')?.value || '';
      const situation = document.getElementById('situation-service')?.value?.trim() || '';
      const nrCODU = document.getElementById('nr-codu-service')?.value?.trim() || '';
      const tasName = document.getElementById('resp-tas-name')?.value?.trim() || '';
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
      const victimTypeMap = {"Masc.": "Masculino", "Fem.": "Feminino", "Desc.": "Desconhecido"};
      const victimType = victimTypeMap[gender] || gender;
      const serviceType = inem.checked ? "ITeams" : reserv.checked ? "Verbete" : "";
      const now = new Date();
      const alertDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(message).then(async () => {
          showPopup('popup-success', "Mensagem criada e copiada! Pode colar no WhatsApp.");
          try {
            const record = {corp_oper_nr: corpOperNr, nr_codu: nrCODU || null, alert_date: alertDate, alert_hour: hourAlert || null, victim_type: victimType || null,
                            victim_age_type: age || null, victim_age_unit: ageType || null, victim_address: address || null, victim_location: locality || null,
                            service_type: serviceType || null, tas: tasName || null,};
            const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_entries`, {
              method: "POST",
              headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
              body: JSON.stringify(record)
            });
            if (!res.ok) throw new Error(await res.text());
          } catch(err) {
            console.error("Erro ao gravar registo INEM:", err);
            showPopup('popup-success', "Mensagem copiada, mas erro ao gravar registo.");
           }
           clearFormFields();
         }).catch(() => showPopup('popup-danger', "Não foi possível copiar automaticamente. Copie manualmente."));
       } else {
         showPopup('popup-success', "Mensagem criada! Copie manualmente o texto.");
       }
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
      mo.observe(inemPage, {attributes: true, attributeFilter: ["class", "style"], childList: true, subtree: false});
      setIfVisible(inemPage);
    })();
    setInterval(attachSidebarTimeSetter, 1500);
