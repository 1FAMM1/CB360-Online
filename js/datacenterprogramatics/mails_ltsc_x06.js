    /* =======================================
    EMAIL's FUNCTIONS
    ======================================= */
    /* ========== LOAD DE EMAILS ========== */
    async function loadMailsConfig() {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) return;
      try {
        const responseSitop = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.sitop`, {
            method: "GET",
            headers: getSupabaseHeaders()
          }
        );
        if (!responseSitop.ok) throw new Error("Erro ao carregar SITOP");
        const dataSitop = await responseSitop.json();
        if (dataSitop.length > 0) {
          const sitop = dataSitop[0];
          document.getElementById("config_sitop_mail_to").value = sitop.crepcsitop_mail_to || "";
          document.getElementById("config_sitop_mail_cc").value = sitop.crepcsitop_mail_cc || "";
          document.getElementById("config_sitop_mail_bcc").value = sitop.crepcsitop_mail_bcc || "";
        } else {
          document.getElementById("config_sitop_mail_to").value = "";
          document.getElementById("config_sitop_mail_cc").value = "";
          document.getElementById("config_sitop_mail_bcc").value = "";
        }
        const responseMoa = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.moa`, {
            method: "GET", headers: getSupabaseHeaders()
          }
        );
        if (!responseMoa.ok) throw new Error("Erro ao carregar MOA");
        const dataMoa = await responseMoa.json();
        if (dataMoa.length > 0) {
          const moa = dataMoa[0];
          document.getElementById("config_moa_mail_to").value = moa.crepcsitop_mail_to || "";
          document.getElementById("config_moa_mail_cc").value = moa.crepcsitop_mail_cc || "";
          document.getElementById("config_moa_mail_bcc").value = moa.crepcsitop_mail_bcc || "";
        } else {
          document.getElementById("config_moa_mail_to").value = "";
          document.getElementById("config_moa_mail_cc").value = "";
          document.getElementById("config_moa_mail_bcc").value = "";
        }
      } catch (err) {
        console.error(err);
        showPopupWarning("Erro ao carregar configuração de emails: " + err.message);
      }
    }    
    /* ======= INSERT INTO SUPABASE ======= */
    async function insertMailsIntoSupabase(table, payload) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}`, {
            method: "POST",
            headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
            body: JSON.stringify(payload)
          }
        );
        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Erro Supabase POST: ${err}`);
        }
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    /* ========= EMAIL VALIDATION ========= */
    function validateEmails(emailString) {
      if (!emailString) return true;
      const emails = emailString.split(",").map(e => e.trim());
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every(email => regex.test(email));
    }    
    /* ============ SAVE SITOP ============ */
    async function saveSitopMails() {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) {
        showPopupWarning("Erro: Corpo Operacional não definido.");
        return;
      }
      const to = document.getElementById("config_sitop_mail_to").value.trim();
      const cc = document.getElementById("config_sitop_mail_cc").value.trim();
      const bcc = document.getElementById("config_sitop_mail_bcc").value.trim();
      if (!validateEmails(to) || !validateEmails(cc) || !validateEmails(bcc)) {
        showPopupWarning("Formato de email inválido! Verifique os campos.");
        return;
      }
      const payload = { crepcsitop_mail_to: to, crepcsitop_mail_cc: cc, crepcsitop_mail_bcc: bcc };
      try {
        const checkResp = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.sitop`, {
            method: "GET", headers: getSupabaseHeaders()
          }
        );
        const existing = await checkResp.json();
        if (existing.length > 0) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.sitop`, {
              method: "PATCH",
              headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" }, body: JSON.stringify(payload)
            }
          );
          showPopupSuccess("Configuração SITOP atualizada com sucesso!");
        } else {
          await insertMailsIntoSupabase("mails_config", { ...payload, corp_oper_nr: currentCorpNr, category: "sitop" });
          showPopupSuccess("Configuração SITOP gravada com sucesso!");
        }
      } catch (err) {
        console.error(err);
        showPopupWarning("Erro ao gravar configuração SITOP: " + err.message);
      }
    }    
    /* ============= SAVE MOA ============= */
    async function saveMoaMails() {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) {
        showPopupWarning("Erro: Corpo Operacional não definido.");
        return;
      }
      const to = document.getElementById("config_moa_mail_to").value.trim();
      const cc = document.getElementById("config_moa_mail_cc").value.trim();
      const bcc = document.getElementById("config_moa_mail_bcc").value.trim();
      if (!validateEmails(to) || !validateEmails(cc) || !validateEmails(bcc)) {
        showPopupWarning("Formato de email inválido! Verifique os campos.");
        return;
      }
      const payload = { crepcsitop_mail_to: to, crepcsitop_mail_cc: cc, crepcsitop_mail_bcc: bcc };
      try {
        const checkResp = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.moa`, {
            method: "GET",
            headers: getSupabaseHeaders()
          }
        );
        const existing = await checkResp.json();
        if (existing.length > 0) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.moa`, {
              method: "PATCH",
              headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" }, body: JSON.stringify(payload)
            }
          );
          showPopupSuccess("Configuração MOA atualizada com sucesso!");
        } else {
          await insertMailsIntoSupabase("mails_config", { ...payload, corp_oper_nr: currentCorpNr, category: "moa" });
          showPopupSuccess("Configuração MOA gravada com sucesso!");
        }
      } catch (err) {
        console.error(err);
        showPopupWarning("Erro ao gravar configuração MOA: " + err.message);
      }
    }
    /* ========= EVENT LISTENERS ========== */
    document.getElementById("config_sitop_mail_save").addEventListener("click", saveSitopMails);
    document.getElementById("config_moa_mail_save").addEventListener("click", saveMoaMails);
    const btnLoadMails = document.querySelector("button[onclick*='showPanelCard(\"mails\")']");
    btnLoadMails.addEventListener("click", () => {
      showPanelCard("mails");
      loadMailsConfig();
    });
