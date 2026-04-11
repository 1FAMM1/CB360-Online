    /* =======================================
    EMS SERVICES
    ======================================= */
    const inem  = document.getElementById('alert-inem');
    const reserv = document.getElementById('alert-reserv');
    const optInem  = document.getElementById('opt-inem');
    const optReserv = document.getElementById('opt-reserv');
    function updateTypeSelection() {
      optInem.classList.toggle('active', inem.checked);
      optReserv.classList.toggle('active', reserv.checked);
      const card = inem.closest('.wsms-card');
      if (card) card.classList.toggle('theme-inem', inem.checked);
      const header = card?.querySelector('.wsms-card-header span');
      if (header) header.textContent = reserv.checked ? 'SERVIÇOS EMERGÊNCIA MÉDICA - RESERVA' : 'SERVIÇOS EMERGÊNCIA MÉDICA';
    }
    inem.addEventListener('change', () => {
      if (inem.checked) reserv.checked = false;
      updateTypeSelection();
    });
    reserv.addEventListener('change', () => {
      if (reserv.checked) inem.checked = false;
      updateTypeSelection();
    });
    optInem.addEventListener('click', (e) => {
      if (e.target !== inem) {inem.checked = !inem.checked; inem.dispatchEvent(new Event('change'));}
    });
    optReserv.addEventListener('click', (e) => {
      if (e.target !== reserv) {reserv.checked = !reserv.checked; reserv.dispatchEvent(new Event('change'));}
    });
    document.getElementById("resp-tas-ni")?.addEventListener("input", async function () {
      const ni = this.value.trim();
      const nameInput = document.getElementById("resp-tas-name");
      if (!nameInput) return;
      if (ni.length < 3) {nameInput.value = ""; return;}
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const data = await supabaseFetch(`reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=eq.${ni}&select=abv_name&limit=1`);
        nameInput.value = data?.[0]?.abv_name || "";
      } catch (err) {
        console.error("Erro ao procurar elemento:", err);
        nameInput.value = "";
      }
    });
    function validateCODUServiceForm() {
      const fields = [{id: 'alert-inem', label: 'Tipo de Serviço (INEM ou Reserva)', type: 'checkbox-group'}, {id: 'alert-service', label: 'Hora Alerta', type: 'text'},
                      {id: 'address-service', label: 'Morada', type: 'text'}, {id: 'location-service', label: 'Localidade', type: 'text'}, 
                      {id: 'victim-gender-service', label: 'Género da Vítima', type: 'select'}, {id: 'victim-age-service', label: 'Idade da Vítima', type: 'text'}, 
                      {id: 'victim-age-type-service', label: 'Tipo de Idade', type: 'select'}, {id: 'situation-service', label: 'Situação', type: 'text'}, 
                      {id: 'nr-codu-service', label: 'Nr. CODU', type: 'text'}, {id: 'resp-tas-name', label: 'Nr. TAS', type: 'text'},];
      const missing = [];
      for (const field of fields) {
        if (field.type === 'checkbox-group') {
          if (!inem.checked && !reserv.checked) missing.push('Tipo de Serviço (INEM ou Reserva)');
          continue;
        }
        const el = document.getElementById(field.id);
        if (!el) continue;
        if (!el.value?.trim()) missing.push(field.label);
      }
      if (missing.length > 0) {
        const list = missing.map(f => `<li style="list-style:none;">• ${f}</li>`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br><ul style="margin:0;padding:0;">${list}</ul>`);
        return false;
      }
      return true;
    }
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
      const messageTitle = reserv.checked
        ? '*🚨⚠️ SERVIÇO INEM-Reserva ⚠️🚨*' : '*🚨⚠️ SERVIÇO INEM ⚠️🚨*';
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
          } catch (err) {
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
    function resetEMSTheme() {
      inem.checked = false;
      reserv.checked = false;
      optInem.classList.remove('active');
      optReserv.classList.remove('active');
      const card = inem.closest('.wsms-card');
      if (card) card.classList.remove('theme-inem');
      const header = card?.querySelector('.wsms-card-header span');
      if (header) header.textContent = 'SERVIÇOS EMERGÊNCIA MÉDICA';
    }
    function focusAddressField() {
      const el = document.getElementById("address-service");
      if (el) el.focus();
      else setTimeout(focusAddressField, 150);
    }
    function setCurrentTimeForINEMService() {
      const input = document.getElementById("alert-service");
      if (!input) return;
      const now = new Date();
      input.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
    function trySetTimeWithRetry(retries = 5, delay = 100) {
      let attempts = 0;
      const t = setInterval(() => {
        attempts++;
        if (document.getElementById("alert-service")) {
          setCurrentTimeForINEMService();
          clearInterval(t);
          return;
        }
        if (attempts >= retries) clearInterval(t);
      }, delay);
    }
    document.addEventListener("DOMContentLoaded", () => {
      const inemPage = document.getElementById("page-inem-services");
      if (!inemPage) return;
      const isVisible = () => {
        const s = window.getComputedStyle(inemPage);
        return s && s.display !== "none" && s.visibility !== "hidden" && inemPage.offsetParent !== null;
      };
      if (isVisible()) trySetTimeWithRetry();
    });
    function attachSidebarTimeSetter() {
      [".sidebar-submenu-button", ".sidebar-sub-submenu-button"].forEach(sel => {
        document.querySelectorAll(sel).forEach(btn => {
          if (btn._hasInemListener) return;
          btn._hasInemListener = true;
          btn.addEventListener("click", () => {
            if (btn.dataset.page === "page-inem-services") {
              resetEMSTheme();
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
        const s = window.getComputedStyle(node);
        if (s && s.display !== "none" && s.visibility !== "hidden" && node.offsetParent !== null) {
          resetEMSTheme();
          setCurrentTimeForINEMService();
          trySetTimeWithRetry();
          focusAddressField();
        }
      };
      new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes" && (m.attributeName === "class" || m.attributeName === "style")) setIfVisible(inemPage);
          if (m.type === "childList" && m.addedNodes.length) setIfVisible(inemPage);
        }
      }).observe(inemPage, {attributes: true, attributeFilter: ["class", "style"], childList: true, subtree: false});
      setIfVisible(inemPage);
    })();
    setInterval(attachSidebarTimeSetter, 1500);
