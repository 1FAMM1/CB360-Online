/* =======================================
       OPERATIONAL MEASURES FOR ANTICIPATION
    ======================================= */
    function styleGrayIfSecond(select) {
      const updateColor = () => {
        select.style.color = select.selectedIndex === 1 ? 'gray' : 'black';
      };
      select.addEventListener('change', updateColor);
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
        if (select.id !== 'moa_ned_pront') {
          if (select.options.length > 1) {
            select.selectedIndex = 1;
            styleGrayIfSecond(select);
          }
        }
      });
      const nedPront = document.getElementById('moa_ned_pront');
      if (nedPront) {
        nedPront.innerHTML = '';
        const options = ['', 'Indique a forma de notificação', 'Via SMS', 'Via e-mail', 'Via Telefone', 'Via SMS e WhatsApp'];
        options.forEach(opt => {
          const optionEl = document.createElement('option');
          optionEl.value = opt;
          optionEl.textContent = opt;
          nedPront.appendChild(optionEl);
        });
        nedPront.selectedIndex = 1;
        styleGrayIfSecond(nedPront);
      }
    }
    
    function updateMOAGDH() {
      const dateInit = document.getElementById('moa_date_init')?.value;
      const timeInit = document.getElementById('moa_time_init')?.value;
      const dateEnd = document.getElementById('moa_date_end')?.value;
      const timeEnd = document.getElementById('moa_time_end')?.value;
      const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
      
      function formatMOAGDH(dateStr, timeStr) {
        if (!dateStr || !timeStr) return '';
        const date = new Date(dateStr + 'T' + timeStr);
        const day = String(date.getDate()).padStart(2,'0');
        const hour = String(date.getHours()).padStart(2,'0');
        const minutes = String(date.getMinutes()).padStart(2,'0');
        const month = monthNames[date.getMonth()];
        const year = String(date.getFullYear()).slice(-2);
        return `${day}${hour}${minutes}${month}${year}`;
      }
      const gdhInitEl = document.getElementById('moa_gdh_init');
      const gdhEndEl  = document.getElementById('moa_gdh_end');
      if (gdhInitEl) gdhInitEl.value = formatMOAGDH(dateInit, timeInit);
      if (gdhEndEl)  gdhEndEl.value  = formatMOAGDH(dateEnd, timeEnd);
    }
    ['moa_date_init','moa_time_init','moa_date_end','moa_time_end'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateMOAGDH);
    });
    /* =======================================
       GLOBAL INIT
    ======================================= */ 
    document.addEventListener("DOMContentLoaded", () => {
      const saveMOABtn = document.getElementById("saveMOABtn");
      const NewMOABtn = document.getElementById("NewMOABtn");
      const moaContainer = document.getElementById("moa-container");
      const actionButtonsContainer = document.querySelector('.action-buttons');
      if (moaContainer) {
        moaContainer.style.transition = "opacity 0.25s ease";
        moaContainer.style.opacity = "0";
        moaContainer.style.setProperty('display', 'none', 'important');
      }
      setupMOASelects(document);
      updateMOAGDH();
      if (!saveMOABtn) {
        console.error("❌ saveMOABtn não encontrado!");
        return;
      }
      const transitionTime = 250;
      window.hideMOAContainer = function() {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          moaContainer.style.width = "";
          setTimeout(() => {
            moaContainer.style.setProperty('display', 'none', 'important');
            if (actionButtonsContainer) actionButtonsContainer.style.display = "flex";
          }, transitionTime);
        }
        if (NewMOABtn) NewMOABtn.classList.remove("active");
      };
      window.showMOAContainer = function() {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          moaContainer.style.removeProperty('display');
          moaContainer.style.display = "block";
          moaContainer.style.width = "100%";
          setTimeout(() => {
            moaContainer.style.opacity = "1";
          }, 10); 
        }
      };
      window.emitMOAGlobal = async function() {
        const moa_device_type = document.getElementById("moa_device_type")?.value.trim();
        const moa_cb = document.getElementById("moa_cb")?.value.trim();
        if (!moa_device_type || !moa_cb) {
          alert("Por favor preencha: Tipo de Dispositivo e CB.");
          return;
        }
        if (typeof showPopupSuccess === 'function') showPopupSuccess(`MOA do dispositivo ${moa_device_type} criada. Aguarde o envio.`);
        saveMOABtn.disabled = true;
        const data = {
          moa_device_type,
          moa_cb,
          moa_epe_type: document.getElementById("moa_epe_type")?.value.trim() || "",
          moa_date_init: document.getElementById("moa_date_init")?.value || "",
          moa_time_init: document.getElementById("moa_time_init")?.value || "",
          moa_date_end: document.getElementById("moa_date_end")?.value || "",
          moa_time_end: document.getElementById("moa_time_end")?.value || "",
          moa_gdh_init: document.getElementById("moa_gdh_init")?.value || "",
          moa_gdh_end: document.getElementById("moa_gdh_end")?.value || "",
          moa_eco: document.getElementById("moa_eco")?.checked || false,
          moa_ned: document.getElementById("moa_ned")?.checked || false,
          moa_oco: document.getElementById("moa_oco")?.checked || false,
          moa_era: document.getElementById("moa_era")?.checked || false,
          moa_eob: document.getElementById("moa_eob")?.checked || false,
          moa_rsc: document.getElementById("moa_rsc")?.checked || false,
          moa_mef: document.getElementById("moa_mef")?.checked || false,
        };
        const fields = ['eco_sit', 'eco_pront', 'eco_observ', 'ned_sit', 'ned_pront', 'ned_observ', 'oco_sit', 'oco_pront', 'oco_observ',
                        'era_sit', 'era_pront', 'era_observ', 'eob_sit', 'eob_pront', 'eob_observ', 'rsc_sit', 'rsc_pront', 'rsc_observ',
                        'mef_sit', 'mef_pront', 'mef_observ', 'reie_type_01', 'reie_time_01', 'reie_nop_01', 'reie_obs_01', 'reie_type_02', 
                        'reie_time_02', 'reie_nop_02', 'reie_obs_02', 'reie_type_03', 'reie_time_03', 'reie_nop_03', 'reie_obs_03',
                        'otr_type_01', 'otr_time_01', 'otr_obs_01', 'otr_type_02', 'otr_time_02', 'otr_obs_02', 'otr_type_03', 'otr_time_03', 
                        'otr_obs_03', 'optel'];
        fields.forEach(field => {
          const el = document.getElementById(`moa_${field}`);
          data[`moa_${field}`] = el ? (el.value || '').toString().trim() : "";
        });
        try {
          const categories = ['moa_mail_to', 'moa_mail_cc', 'moa_mail_bcc'];
          const url = `${SUPABASE_URL}/rest/v1/static_options?category=in.(${categories.join(',')})&select=category,value`;
          const response = await fetch(url, { headers: getSupabaseHeaders() });
          const emailData = await response.json();
          const recipients = { to: [], cc: [], bcc: [] };
          emailData.forEach(row => {
            const emails = row.value?.split(",").map(e => e.trim()).filter(e => e) || [];
            if (row.category.endsWith("_to")) recipients.to = emails;
            if (row.category.endsWith("_cc")) recipients.cc = emails;
            if (row.category.endsWith("_bcc")) recipients.bcc = emails;});
          if (recipients.to.length === 0) recipients.to = ["fmartins.ahbfaro@gmail.com"];
          const signature = getEmailSignature();
          const greeting = getGreeting();
          const emailBodyHTML = `${greeting}<br><br>
          Encarrega-me o Sr. Comandante Jorge Carmo de remeter em anexo a Vossas Exª.s o Formulário das MEDIDAS OPERACIONAIS DE ANTECIPAÇÃO para o ${moa_device_type} de ${data.moa_gdh_init} a ${data.moa_gdh_end} do Corpo de Bombeiros ${moa_cb}.<br><br>
          Com os melhores cumprimentos,<br><br>
          OPTEL<br>${data.moa_optel}<br><br>
          <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
          Este email foi processado automaticamente por: CB360 Online<br><br></span>
          ${signature}
          `;
          const emailRes = await fetch('https://cb360-mobile.vercel.app/api/moa_convert_and_send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({data, recipients: recipients.to, ccRecipients: recipients.cc, bccRecipients: recipients.bcc,
                                  emailSubject: `MOA para o ${moa_device_type} de ${data.moa_gdh_init} a ${data.moa_gdh_end}_0805`,          
                                  emailBody: emailBodyHTML})});
          await emailRes.json();
          if (typeof showPopupSuccess === 'function') showPopupSuccess(`A MOA do dispositivo ${moa_device_type} foi enviada!`);
          window.hideMOAContainer();
          if (NewMOABtn) NewMOABtn.classList.remove("active");
        } catch (err) {
          alert(`❌ Erro: ${err.message}`);
          console.error(err);
        } finally {
          saveMOABtn.disabled = false;
        }
      };
      saveMOABtn.onclick = function(e) {
        e.preventDefault();
        window.emitMOAGlobal();
        return false;
      };
      /* =======================================
           CREATE AND SEND MOA
      ======================================= */
      if (NewMOABtn) {
        NewMOABtn.onclick = function() {
          const isActive = NewMOABtn.classList.toggle("active");
          if (isActive) {
            window.showMOAContainer();
            document.querySelectorAll('#moa-container input, #moa-container select').forEach(el => {
              if (el.tagName === 'SELECT') {
                el.selectedIndex = 0;
              } else if (el.type === 'checkbox') {
                el.checked = false;
              } else if (el.tagName !== 'SELECT') {
                el.value = '';
              }
            });
            setupMOASelects(moaContainer);
            updateMOAGDH();
          } else {
            window.hideMOAContainer();
          }
        };
      }
      /* =======================================
          LÓGICA DO RESTART DA PÁGINA (Para esconder o MOA ao navegar)
      ======================================= */
      const crepcAlgBtn = document.querySelector('[data-page="page-crepcalg"]');
      if (crepcAlgBtn) {
        crepcAlgBtn.addEventListener('click', () => {
          window.hideMOAContainer(); 
        });
      }
      saveMOABtn.onclick = function(e) {
        e.preventDefault();
        window.emitMOAGlobal();
        return false;
      };
      console.log("✅ MOA inicializado com sucesso!");

    });
