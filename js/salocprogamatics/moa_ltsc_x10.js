    /* =======================================
    OPERATIONAL ANTICIPATION MEASURES
    ======================================= */
    /* ================ SELECT UTILITIES =============== */
    function styleGrayIfSecond(select) {
      const updateColor = () => {
        select.style.color = select.selectedIndex === 1 ? "gray" : "black";
      };
      select.addEventListener("change", updateColor);
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
        if (select.id !== "moa_ned_pront") {
          if (select.options.length > 1) {
            select.selectedIndex = 1;
            styleGrayIfSecond(select);
          }
        }
      });
      const nedPront = document.getElementById("moa_ned_pront");
      if (nedPront) {
        nedPront.innerHTML = "";
        const options = ["", "Indique a forma de notificação", "Via SMS", "Via e-mail", "Via Telefone", "Via SMS e WhatsApp"];
        options.forEach(opt => {
          const el = document.createElement("option");
          el.value = opt;
          el.textContent = opt;
          nedPront.appendChild(el);
        });
        nedPront.selectedIndex = 1;
        styleGrayIfSecond(nedPront);
      }
    }
    /* ====================== GDH ====================== */
    function updateMOAGDH() {
      const dateInit = document.getElementById("moa_date_init")?.value;
      const timeInit = document.getElementById("moa_time_init")?.value;
      const dateEnd = document.getElementById("moa_date_end")?.value;
      const timeEnd = document.getElementById("moa_time_end")?.value;
      const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
      
      function formatGDH(dateStr, timeStr) {
        if (!dateStr || !timeStr) return "";
        const d = new Date(dateStr + "T" + timeStr);
        const day = String(d.getDate()).padStart(2,"0");
        const hour = String(d.getHours()).padStart(2,"0");
        const min = String(d.getMinutes()).padStart(2,"0");
        const month = monthNames[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        return `${day}${hour}${min}${month}${year}`;
      }
      const gdhInitEl = document.getElementById("moa_gdh_init");
      const gdhEndEl = document.getElementById("moa_gdh_end");
      if (gdhInitEl) gdhInitEl.value = formatGDH(dateInit, timeInit);
      if (gdhEndEl) gdhEndEl.value = formatGDH(dateEnd, timeEnd);
    }
    ["moa_date_init","moa_time_init","moa_date_end","moa_time_end"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", updateMOAGDH);
    });
    /* ================ EMAIL RECIPIENTS =============== */
    async function fetchMOARecipients(corpOperNr) {
      const categories = ["crepcmoa_mail_to", "crepcmoa_mail_cc", "crepcmoa_mail_bcc"];
      const url = `${SUPABASE_URL}/rest/v1/mails_config?category=in.(${categories.join(",")})&corp_oper_nr=eq.${corpOperNr}&select=category,value`;
      try {
        const resp = await fetch(url, { headers: getSupabaseHeaders() });
        if (!resp.ok) throw new Error("Falha ao buscar e-mails da MOA.");
        const data = await resp.json();
        const recipients = { to: [], cc: [], bcc: [] };
        data.forEach(row => {
          const emails = row.value?.split(",").map(e => e.trim()).filter(e => e) || [];
          if (row.category.endsWith("_to")) recipients.to = emails;
          if (row.category.endsWith("_cc")) recipients.cc = emails;
          if (row.category.endsWith("_bcc")) recipients.bcc = emails;
        });
        if (!recipients.to.length) recipients.to = [""];
        return recipients;
      } catch (err) {
        console.error("Erro emails MOA:", err);
        return { to: ["cb360.online.support@gmail.com"], cc: [], bcc: [] };
      }
    }
    /* ================ BUILD EMAIL HTML =============== */
    async function buildMOAEmailHTML(data, corpOperNr) {
      const signature = getEmailSignature();
      const greeting = getGreeting();
      const commanderName = await getCommanderName(corpOperNr);
      return `${greeting}<br><br>
      Encarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s o Formulário das <strong>MEDIDAS OPERACIONAIS DE ANTECIPAÇÃO</strong> 
      para o <strong>${data.moa_device_type}</strong> de <strong>${data.moa_gdh_init}</strong> a <strong>${data.moa_gdh_end}</strong> 
      do Corpo de Bombeiros <strong>${data.moa_cb}</strong>.<br><br>
      Com os melhores cumprimentos,<br><br>
      OPTEL<br>${data.moa_optel}<br><br>
      <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
      Este email foi processado automaticamente por: CB360 Online<br><br></span>
      ${signature}`;
    }
    /* =================== SEND EMAIL ================== */
    async function sendMOAEmail(data, recipients, corpOperNr) {
      const emailBodyHTML = await buildMOAEmailHTML(data, corpOperNr);
      const result = await fetch("https://cb360-mobile.vercel.app/api/moa_convert_and_send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({data, recipients: recipients.to, ccRecipients: recipients.cc, bccRecipients: recipients.bcc,
                              emailSubject: `MOA para o ${data.moa_device_type} de ${data.moa_gdh_init} a ${data.moa_gdh_end}_${corpOperNr}`,
                              emailBody: emailBodyHTML})
      });
      return result.json();
    }    
    /* ================= MAIN FUNCTION ================= */
    async function emitMOAGlobal() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) { alert("❌ Erro: O número da corporação não foi encontrado."); return; }
      const moa_device_type = document.getElementById("moa_device_type")?.value.trim();
      const moa_cb = document.getElementById("moa_cb")?.value.trim();
      if (!moa_device_type || !moa_cb) { alert("Preencha: Tipo de Dispositivo e CB."); return; }
      if (typeof showPopupSuccess === "function")
        showPopupSuccess(`MOA do dispositivo ${moa_device_type} criada. Aguarde o envio.`);
      const btn = document.getElementById("saveMOABtn");
      if (btn) btn.disabled = true;
      const data = {};
      const baseFields = ["device_type","cb","epe_type","date_init","time_init","date_end","time_end", "gdh_init","gdh_end","eco","ned","oco","era","eob","rsc","mef"];
      baseFields.forEach(f => {
        const el = document.getElementById(`moa_${f}`);
        if (!el) return;
        data[`moa_${f}`] = el.type === "checkbox" ? el.checked : el.value || "";
      });
      const extraFields = ["eco_sit","eco_pront","eco_observ","ned_sit","ned_pront","ned_observ","oco_sit","oco_pront","oco_observ","era_sit","era_pront","era_observ",
                           "eob_sit","eob_pront","eob_observ","rsc_sit","rsc_pront","rsc_observ","mef_sit","mef_pront","mef_observ","reie_type_01","reie_time_01","reie_nop_01",
                           "reie_obs_01","reie_type_02","reie_time_02","reie_nop_02","reie_obs_02","reie_type_03","reie_time_03","reie_nop_03","reie_obs_03","otr_type_01",
                           "otr_time_01","otr_obs_01","otr_type_02","otr_time_02","otr_obs_02","otr_type_03","otr_time_03","otr_obs_03","optel"];
      extraFields.forEach(f => {
        const el = document.getElementById(`moa_${f}`);
        data[`moa_${f}`] = el ? (el.value || "").trim() : "";
      });
      data.corp_oper_nr = corpOperNr;
      try {
        const recipients = await fetchMOARecipients(corpOperNr);
        await sendMOAEmail(data, recipients, corpOperNr);
        if (typeof showPopupSuccess === "function")
          showPopupSuccess(`A MOA do dispositivo ${data.moa_device_type} foi enviada!`);
        window.hideMOAContainer();
        const btnNew = document.getElementById("NewMOABtn");
        if (btnNew) btnNew.classList.remove("active");
      } catch (err) {
        alert(`Erro ao enviar MOA: ${err.message}`);
        console.error(err);
      } finally {
        if (btn) btn.disabled = false;
      }
    }
    /* ================ INITIALIZE PAGE ================ */
    document.addEventListener("DOMContentLoaded", () => {
      const saveMOABtn = document.getElementById("saveMOABtn");
      const NewMOABtn = document.getElementById("NewMOABtn");
      const moaContainer = document.getElementById("moa-container");
      const actionButtonsContainer = document.querySelector(".action-buttons");
      if (moaContainer) {
        moaContainer.style.transition = "opacity 0.25s ease";
        moaContainer.style.opacity = "0";
        moaContainer.style.setProperty("display", "none", "important");
      }
      setupMOASelects(document);
      updateMOAGDH();
      window.hideMOAContainer = function () {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          setTimeout(() => {
            moaContainer.style.setProperty("display", "none", "important");
            if (actionButtonsContainer) actionButtonsContainer.style.display = "flex";
          }, 250);
        }
        if (NewMOABtn) NewMOABtn.classList.remove("active");
      };
      window.showMOAContainer = function () {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          moaContainer.style.removeProperty("display");
          moaContainer.style.display = "block";
          moaContainer.style.width = "100%";
          setTimeout(() => { moaContainer.style.opacity = "1"; }, 10);
        }
      };
      if (NewMOABtn) {
        NewMOABtn.onclick = () => {
          const isActive = NewMOABtn.classList.toggle("active");
          if (isActive) {
            window.showMOAContainer();
            document.querySelectorAll("#moa-container input, #moa-container select").forEach(el => {
              if (el.tagName === "SELECT") el.selectedIndex = 0;
              else if (el.type === "checkbox") el.checked = false;
              else el.value = "";
            });
            setupMOASelects(moaContainer);
            updateMOAGDH();
          } else { window.hideMOAContainer();}
        };
      }
      if (saveMOABtn) {
        saveMOABtn.onclick = e => { e.preventDefault(); emitMOAGlobal(); return false; };
      }
      /* ================== RESET PAGE =================== */
      const crepcAlgBtn = document.querySelector('[data-page="page-crepcalg"]');
      if (crepcAlgBtn) {
        crepcAlgBtn.addEventListener('click', () => { window.hideMOAContainer(); });
      }
    });