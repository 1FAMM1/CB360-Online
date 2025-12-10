    /* =======================================
    EMAIL's FUNCTIONS
    ======================================= */
    /* ========== LOAD DE EMAILS ========== */
    async function loadMailsConfig() {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) return;
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}`, {
            method: "GET",
            headers: getSupabaseHeaders()
          }
        );
        const rows = await resp.json();
        if (!Array.isArray(rows)) return;
        document.getElementById("config_sitop_mail_to").value = rows.find(r => r.category === "crepcsitop_mail_to")?.value || "";
        document.getElementById("config_sitop_mail_cc").value = rows.find(r => r.category === "crepcsitop_mail_cc")?.value || "";
        document.getElementById("config_sitop_mail_bcc").value = rows.find(r => r.category === "crepcsitop_mail_bcc")?.value || "";
        document.getElementById("config_moa_mail_to").value = rows.find(r => r.category === "crepcmoa_mail_to")?.value || "";
        document.getElementById("config_moa_mail_cc").value = rows.find(r => r.category === "crepcmoa_mail_cc")?.value || "";
        document.getElementById("config_moa_mail_bcc").value = rows.find(r => r.category === "crepcmoa_mail_bcc")?.value || "";
      } catch (err) {
        console.error(err);
        showPopupWarning("Erro ao carregar emails: " + err.message);
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
      if (!currentCorpNr) return;
      const rows = [{category: "crepcsitop_mail_to",  value: document.getElementById("config_sitop_mail_to").value},
                    {category: "crepcsitop_mail_cc",  value: document.getElementById("config_sitop_mail_cc").value},
                    {category: "crepcsitop_mail_bcc", value: document.getElementById("config_sitop_mail_bcc").value}];
      for (const row of rows) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.${row.category}`, {
            method: "PATCH",
            headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
            body: JSON.stringify({ value: row.value })
          }
        );
      }
      showPopupSuccess("Emails SITOP atualizados!");
    }
    /* ============= SAVE MOA ============= */
    async function saveMoaMails() {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) return;
      const rows = [{category: "crepcmoa_mail_to",  value: document.getElementById("config_moa_mail_to").value},
                    {category: "crepcmoa_mail_cc",  value: document.getElementById("config_moa_mail_cc").value},
                    {category: "crepcmoa_mail_bcc", value: document.getElementById("config_moa_mail_bcc").value}];
      for (const row of rows) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=eq.${row.category}`, {
            method: "PATCH",
            headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
            body: JSON.stringify({ value: row.value })
          }
        );
      }
      showPopupSuccess("Emails MOA atualizados!");
    }
    /* ========= EVENT LISTENERS ========== */
    document.getElementById("config_sitop_mail_save").addEventListener("click", saveSitopMails);
    document.getElementById("config_moa_mail_save").addEventListener("click", saveMoaMails);
    const btnLoadMails = document.querySelector("button[onclick*=\"showPanelCard('mails')\"]");
    if (btnLoadMails) {
      btnLoadMails.addEventListener("click", () => {
        showPanelCard("mails");
        loadMailsConfig();
      });
    } else {
      console.warn("Botão Emails Config não encontrado!");
    }
