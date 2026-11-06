    /* =======================================
    NOTIFICATIONS
    ======================================= */
    function setNotifCount(n) {
      const btn = document.getElementById("notifBtn");
      const badge = document.getElementById("notifBadge");
      badge.textContent = n > 99 ? "99+" : n;
      badge.style.display = "flex";
      if (n > 0) {
        btn.classList.add("has-notif");
      } else {
        btn.classList.remove("has-notif");
      }
    }
    async function loadNotifications() {
      const nInt = sessionStorage.getItem("currentNInt");
      const corpNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/business_notifications?corp_oper_nr=eq.${corpNr}&or=(and(n_int_to.eq.${nInt},readed.eq.false),n_int_to.is.null)&select=*,business_notifications_read(n_int)&order=created_at.desc`, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const unread = data.filter(n => {
          if (n.n_int_to) return !n.readed;
          const readed = n.business_notifications_read?.some(r => String(r.n_int) === String(nInt));
          return !readed;
        });
        setNotifCount(unread.length);
      } catch(err) {
        console.error("Erro ao carregar notificações:", err);
      }
    }
    function startNotifPolling() {
      setInterval(async () => {
        await loadNotifications();
      }, 60000);
    }
    function initNotifDropdown() {
      const btn = document.getElementById("notifBtn");
      if (!btn) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const existing = document.getElementById("notif-dropdown");
        if (existing) { existing.remove(); return; }
        openNotifDropdown(btn);
      });
      document.addEventListener("click", () => {
        document.getElementById("notif-dropdown")?.remove();
      });
    }
    async function openNotifDropdown(btn) {
      const nInt = sessionStorage.getItem("currentNInt");
      const corpNr = sessionStorage.getItem("currentCorpOperNr");
      const dropdown = document.createElement("div");
      dropdown.id = "notif-dropdown";
      Object.assign(dropdown.style, {position: "fixed", zIndex: "99999", background: "#fff", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.22)", width: "320px", maxHeight: "400px", overflowY: "auto", 
                    fontFamily: "'Segoe UI', sans-serif", border: "1px solid #eee", opacity: "0", transition: "opacity 0.15s ease"});
      const rect = btn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 8) + "px";
      dropdown.style.right = (window.innerWidth - rect.right) + "px";
      const header = document.createElement("div");
      Object.assign(header.style, {background: "linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%)", padding: "10px 14px", borderRadius: "10px 10px 0 0", color: "#fff", fontWeight: "700", fontSize: "13px"});
      header.textContent = "🔔 Notificações";
      dropdown.appendChild(header);
      document.body.appendChild(dropdown);
      dropdown.addEventListener("click", e => e.stopPropagation());
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/business_notifications?corp_oper_nr=eq.${corpNr}&or=(and(n_int_to.eq.${nInt},readed.eq.false),n_int_to.is.null)&select=*,business_notifications_read(n_int)&order=created_at.desc`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const unread = data.filter(n => {
          if (n.n_int_to) return !n.readed;
          const jaLeu = n.business_notifications_read?.some(r => String(r.n_int) === String(nInt));
          return !jaLeu;
        });
        if (!unread.length) {
          const empty = document.createElement("div");
          Object.assign(empty.style, { padding: "20px", textAlign: "center", color: "#999", fontSize: "13px" });
          empty.textContent = "Sem notificações por ler.";
          dropdown.appendChild(empty);
          dropdown.style.opacity = "1";
          return;
        }
        for (const notif of unread) {
          const item = document.createElement("div");
          Object.assign(item.style, { padding: "10px 14px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", transition: "background .15s" });
          item.addEventListener("mouseenter", () => item.style.background = "#fdf5f5");
          item.addEventListener("mouseleave", () => item.style.background = "#fff");
          const from = document.createElement("div");
          Object.assign(from.style, { fontSize: "11px", color: "#999", marginBottom: "3px" });
          const abvName = await getAbvNameByNInt(notif.n_int_from);
          const fromLabel = notif.n_int_from ? `${notif.n_int_from}${abvName ? ` - ${abvName}` : ""}` : "Sistema";
          from.textContent = `De: ${fromLabel} · ${new Date(notif.created_at).toLocaleString("pt-PT")}`;
          const msg = document.createElement("div");
          Object.assign(msg.style, {fontSize: "13px", color: "#333", fontWeight: "600", whiteSpace: "pre-wrap", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical"});
          msg.textContent = notif.message;      
          item.append(from, msg);
          item.addEventListener("click", () => {
            document.getElementById("notif-dropdown")?.remove();
            openNotifModal(notif);
          });
          dropdown.appendChild(item);
        }
        dropdown.style.opacity = "1";
      } catch(err) {
        console.error("Erro ao carregar notificações:", err);
        const errEl = document.createElement("div");
        Object.assign(errEl.style, {padding: "20px", textAlign: "center", color: "#c0392b", fontSize: "13px"});
        errEl.textContent = "Erro ao carregar notificações.";
        dropdown.appendChild(errEl);
        dropdown.style.opacity = "1";
      }
    }
    async function getAbvNameByNInt(nInt) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const data = await supabaseFetch(
          `reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=eq.${nInt}&select=abv_name&limit=1`
        );
        return data?.[0]?.abv_name || "";
      } catch {
        return "";
      }
    }
    async function openNotifModal(notif) {
      document.getElementById("notif-modal")?.remove();
      const nInt = sessionStorage.getItem("currentNInt");
      const corpNr = sessionStorage.getItem("currentCorpOperNr");
      const overlay = document.createElement("div");
      overlay.id = "notif-modal";
      Object.assign(overlay.style, {position: "fixed", inset: "0", background: "rgba(10,8,8,0.78)", zIndex: "100000", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"});
      const box = document.createElement("div");
      Object.assign(box.style, {background: "#fff", borderRadius: "12px", width: "400px", boxShadow: "0 28px 72px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Segoe UI', sans-serif"});
      const header = document.createElement("div");
      Object.assign(header.style, {background: "linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between"});
      const headerTitle = document.createElement("div");
      Object.assign(headerTitle.style, { color: "#fff", fontWeight: "700", fontSize: "13px" });
      headerTitle.textContent = "🔔 Notificação";
      header.appendChild(headerTitle);
      const body = document.createElement("div");
      Object.assign(body.style, { padding: "20px", display: "flex", flexDirection: "column", gap: "10px" });
      const from = document.createElement("div");
      Object.assign(from.style, { fontSize: "12px", color: "#999" });
      const abvName = await getAbvNameByNInt(notif.n_int_from);
      const fromLabel = notif.n_int_from ? `${notif.n_int_from}${abvName ? ` - ${abvName}` : ""}` : "Sistema";
      from.textContent = `De: ${fromLabel} · ${new Date(notif.created_at).toLocaleString("pt-PT")}`;  
      const msg = document.createElement("div");
      Object.assign(msg.style, {fontSize: "14px", color: "#333", lineHeight: "1.6", background: "#fdf5f5", padding: "12px", borderRadius: "8px", border: "1px solid #f5d0d0", whiteSpace: "pre-wrap"});
      msg.textContent = notif.message;  
      const textarea = document.createElement("textarea");
      textarea.placeholder = "Escreva a sua resposta...";
      Object.assign(textarea.style, {display: "none", width: "100%", minHeight: "80px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", fontFamily: "'Segoe UI', sans-serif", 
                    resize: "vertical", boxSizing: "border-box", outline: "none", transition: "border-color .15s"});
      textarea.onfocus = () => textarea.style.borderColor = "#7b0000";
      textarea.onblur = () => textarea.style.borderColor = "#ddd";
      body.append(from, msg, textarea);  
      const footer = document.createElement("div");
      Object.assign(footer.style, {padding: "12px 20px", display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #eee", background: "#fafafa"});
      const btnReply = document.createElement("button");
      btnReply.textContent = "↩ Responder";
      Object.assign(btnReply.style, { padding: "7px 16px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", color: "#555", fontSize: "13px", fontWeight: "600", cursor: "pointer"});
      const btnOk = document.createElement("button");
      btnOk.textContent = "✔ OK";
      Object.assign(btnOk.style, {padding: "7px 20px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #7b0000, #9a0f0f)", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer"});
      const btnSend = document.createElement("button");
      btnSend.textContent = "📤 Enviar";
      btnSend.style.display = "none";
      Object.assign(btnSend.style, {padding: "7px 16px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #7b0000, #9a0f0f)", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer"});
      const btnCancell = document.createElement("button");
      btnCancell.textContent = "✕ Cancelar";
      btnCancell.style.display = "none";
      Object.assign(btnCancell.style, {padding: "7px 16px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", color: "#555", fontSize: "13px", fontWeight: "600", cursor: "pointer"});  
      btnReply.addEventListener("click", () => {textarea.style.display = "block"; btnReply.style.display = "none"; btnOk.style.display = "none"; btnSend.style.display = ""; btnCancell.style.display = ""; textarea.focus();});
      btnCancell.addEventListener("click", () => {textarea.style.display = "none"; textarea.value = ""; btnReply.style.display = ""; btnOk.style.display = ""; btnSend.style.display = "none"; btnCancell.style.display = "none";});  
      async function markAsRead() {
        let res;
        if (!notif.n_int_to) {
          res = await fetch(`${SUPABASE_URL}/rest/v1/business_notifications_read`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({notification_id: notif.id, n_int: nInt, corp_oper_nr: corpNr})
          });
        } else {
          res = await fetch(`${SUPABASE_URL}/rest/v1/business_notifications?id=eq.${notif.id}`, {
            method: "PATCH",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({readed: true})
          });
        }
        if (!res.ok) throw new Error("Não foi possível marcar como lida: " + await res.text());
      }  
      btnOk.addEventListener("click", async () => {
        try {
          await markAsRead();
          overlay.remove();
          await loadNotifications();
        } catch(err) {
          console.error("Erro ao marcar como lida:", err);
          showPopup('popup-danger', "Erro ao marcar a notificação como lida.");
        }
      });  
      btnSend.addEventListener("click", async () => {
        const resposta = textarea.value.trim();
        if (!resposta) { textarea.style.borderColor = "#e74c3c"; return; }
        try {
          const resReply = await fetch(`${SUPABASE_URL}/rest/v1/business_notifications`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({n_int_from: nInt, n_int_to: notif.n_int_from, message: resposta, readed: false, corp_oper_nr: corpNr})
          });
          if (!resReply.ok) throw new Error(await resReply.text());
          await markAsRead();
          overlay.remove();
          await loadNotifications();
        } catch(err) {
          console.error("Erro ao enviar resposta:", err);
          showPopup('popup-danger', "Erro ao enviar a resposta. A notificação continua por ler.");
        }
      });
      if (notif.n_int_from) footer.append(btnReply);
      footer.append(btnCancell, btnSend, btnOk);
      box.append(header, body, footer);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }
    async function sendNotification() {
      const nInt = sessionStorage.getItem("currentNInt");
      const corpNr = sessionStorage.getItem("currentCorpOperNr");
      const to = document.getElementById("notification-to")?.value?.trim() || null;
      const message = document.getElementById("notification-message")?.value?.trim();
      if (!message) {
        showPopup('popup-danger', "Preencha o campo de notificação.");
        return;
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/business_notifications`, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
          body: JSON.stringify({corp_oper_nr: corpNr, n_int_from: nInt, n_int_to: to || null, message: message, readed: false})
        });
        if (!res.ok) throw new Error(await res.text());
        document.getElementById("notification-to").value = "";
        document.getElementById("notification-message").value = "";
        showPopup('popup-success', "Notificação enviada com sucesso!");
      } catch (err) {
        console.error("Erro ao enviar notificação:", err);
        showPopup('popup-danger', "Erro ao enviar notificação.");
      }
    }
    /* =======================================
    MAILER
    ======================================= */
    /* ===== RO: dia de início, dia de fim, mês e ano ===== */
    const MAIL_RO_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    function mailRoValues() {
      const ini = parseInt(document.getElementById("mail-ro-ini")?.value, 10);
      const fim = parseInt(document.getElementById("mail-ro-fim")?.value, 10);
      const month = parseInt(document.getElementById("mail-ro-month")?.value, 10);
      const year = parseInt(document.getElementById("mail-ro-year")?.value, 10);
      return {ini, fim, month, year};
    }
    function mailRoPeriodText() {
      const {ini, fim, month, year} = mailRoValues();
      const d1 = Number.isInteger(ini) ? ini : "__";
      const d2 = Number.isInteger(fim) ? fim : "__";
      return `${d1} a ${d2} de ${MAIL_RO_MONTHS[month] || "____"} de ${year || "____"}`;
    }
    function mailRoFieldStyle(el, ok) {
      el.style.borderColor = ok ? "#16a34a" : "#d00000";
      el.style.background = ok ? "#f0fdf4" : "#fff5f5";
      el.style.color = ok ? "#1e293b" : "#d00000";
    }
    function mailRoRefreshStyles() {
      const {ini, fim, month, year} = mailRoValues();
      const last = new Date(year, month + 1, 0).getDate();
      const iniOk = Number.isInteger(ini) && ini >= 1 && ini <= last;
      const fimOk = Number.isInteger(fim) && fim >= 1 && fim <= last && (!iniOk || fim >= ini);
      mailRoFieldStyle(document.getElementById("mail-ro-ini"), iniOk);
      mailRoFieldStyle(document.getElementById("mail-ro-fim"), fimOk);
    }
    function mailBuildRoSubjectBox() {
      let box = document.getElementById("mail-subject-ro");
      if (box) return box;
      const subject = document.getElementById("mail-subject");
      if (!subject) return null;
      box = document.createElement("div");
      box.id = "mail-subject-ro";
      Object.assign(box.style, {display: "none", flex: "1", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "13px", color: "#222"});
      const baseStyle = {padding: "3px 6px", border: "1px solid #d00000", borderRadius: "5px", fontWeight: "700", fontSize: "12.5px", textAlign: "center",
                         outline: "none", background: "#fff5f5", color: "#d00000", fontFamily: "inherit"};
      const fixWidth = (el, w) => {
        ["width", "min-width", "max-width"].forEach(k => el.style.setProperty(k, w, "important"));
        el.style.setProperty("flex", `0 0 ${w}`, "important");
      };
      const mkDay = (id, ph) => {
        const i = document.createElement("input");
        i.type = "number";
        i.id = id;
        i.min = "1";
        i.max = "31";
        i.placeholder = ph;
        Object.assign(i.style, baseStyle);
        fixWidth(i, "64px");
        i.addEventListener("input", mailApplyRo);
        return i;
      };
      const mkSelect = (id, options, w) => {
        const sel = document.createElement("select");
        sel.id = id;
        options.forEach(([v, t]) => {
          const o = document.createElement("option");
          o.value = v;
          o.textContent = t;
          sel.appendChild(o);
        });
        Object.assign(sel.style, baseStyle, {border: "1px solid #ccc", background: "#fff", color: "#1e293b", cursor: "pointer",
                                             fontWeight: "normal", textAlign: "left", textAlignLast: "left"});
        fixWidth(sel, w);
        sel.addEventListener("change", mailApplyRo);
        return sel;
      };
      const thisYear = new Date().getFullYear();
      const ini = mkDay("mail-ro-ini", "Dia");
      const fim = mkDay("mail-ro-fim", "Dia");
      const month = mkSelect("mail-ro-month", MAIL_RO_MONTHS.map((m, i) => [i, m]), "120px");
      const year = mkSelect("mail-ro-year", [thisYear, thisYear - 1].map(y => [y, y]), "80px");
      const txt = (t) => { const s = document.createElement("span"); s.textContent = t; return s; };
      const suffix = txt("");
      suffix.id = "mail-subject-ro-suffix";
      box.append(txt("RO's de"), ini, txt("a"), fim, txt("de"), month, txt("de"), year, suffix);
      subject.insertAdjacentElement("afterend", box);
      return box;
    }
    function mailSetRoMode(on, corpNr) {
      const subject = document.getElementById("mail-subject");
      const box = mailBuildRoSubjectBox();
      if (!subject || !box) return;
      subject.style.display = on ? "none" : "";
      box.style.display = on ? "flex" : "none";
      if (on) {
        const now = new Date();
        document.getElementById("mail-subject-ro-suffix").textContent = `_${corpNr}`;
        box.dataset.corp = corpNr;
        document.getElementById("mail-ro-ini").value = "";
        document.getElementById("mail-ro-fim").value = "";
        document.getElementById("mail-ro-month").value = String(now.getMonth());
        document.getElementById("mail-ro-year").value = String(now.getFullYear());
        mailApplyRo();
      }
    }
    function mailApplyRo() {
      const box = document.getElementById("mail-subject-ro");
      if (!box || box.style.display === "none") return;
      const period = mailRoPeriodText();
      document.getElementById("mail-subject").value = `RO's de ${period}_${box.dataset.corp || ""}`;
      const msg = document.getElementById("mail-message");
      if (msg) msg.value = msg.value.replace(/(Relatórios de Ocorrência de ).*?( do )/, `$1${period}$2`);
      mailRoRefreshStyles();
    }
    function mailValidateRo() {
      const box = document.getElementById("mail-subject-ro");
      if (!box || box.style.display === "none") return true;
      const {ini, fim, month, year} = mailRoValues();
      const last = new Date(year, month + 1, 0).getDate();
      const iniEl = document.getElementById("mail-ro-ini");
      const fimEl = document.getElementById("mail-ro-fim");
      if (!Number.isInteger(ini) || ini < 1 || ini > last) { showPopup('popup-danger', `Dia de início inválido (1 a ${last}).`); iniEl.focus(); return false; }
      if (!Number.isInteger(fim) || fim < 1 || fim > last) { showPopup('popup-danger', `Dia de fim inválido (1 a ${last}).`); fimEl.focus(); return false; }
      if (fim < ini) { showPopup('popup-danger', "O dia de fim é anterior ao dia de início."); fimEl.focus(); return false; }
      return true;
    }
    function selectMailType(btn, value) {
      ['ro', 'outro'].forEach(function(t) {
        var b = document.getElementById('mail-type-' + t);
        if (t === value) {
          b.style.background = '#7b000012';
          b.style.border = '1px solid #7b000055';
          b.style.color = '#7b0000';
          b.style.fontWeight = '500';
        } else {
          b.style.background = 'transparent';
          b.style.border = '1px solid #ddd';
          b.style.color = '#666';
          b.style.fontWeight = 'normal';
        }
      });
      document.getElementById('mail-type').value = value;
      loadMailAddresses(value);
    }
    async function loadMailAddresses(type) {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      document.getElementById("mail-to").value = "";
      document.getElementById("mail-cc").value = "";
      document.getElementById("mail-bcc").value = "";
      document.getElementById("mail-subject").value = "";
      mailSetRoMode(false);
      if (!type || type === "outro" || !currentCorpNr) {
        document.getElementById("mail-message").value = "";
        return;
      }
      const prefix = "ro_crepc";
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}&category=in.(${prefix}_mail_to,${prefix}_mail_cc,${prefix}_mail_bcc)`, {
            headers: getSupabaseHeaders()
          }
        );
        const rows = await resp.json();
        if (!Array.isArray(rows)) return;
        document.getElementById("mail-to").value = rows.find(r => r.category === `${prefix}_mail_to`)?.value  || "";
        document.getElementById("mail-cc").value = rows.find(r => r.category === `${prefix}_mail_cc`)?.value  || "";
        document.getElementById("mail-bcc").value = rows.find(r => r.category === `${prefix}_mail_bcc`)?.value || "";
        if (type === "ro") {
          const commanderName = await getCommanderName(currentCorpNr);
          const greeting = getGreeting();
          let cbName = "";
          try {
            const corpRes = await fetch(
              `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${currentCorpNr}&select=cb_name`, {
                headers: getSupabaseHeaders()
              }
            );
            const corpData = await corpRes.json();
            cbName = corpData[0]?.cb_name || "";
          } catch(e) {
            console.error(e);
          }
          let optelInfo = "";
          try {
            const nInt = sessionStorage.getItem("currentNInt");
            const optelRes = await fetch(
              `${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${nInt}&corp_oper_nr=eq.${currentCorpNr}&select=patent_abv,abv_name`, {
                headers: getSupabaseHeaders()
              }
            );
            const optelData = await optelRes.json();
            const patent = optelData[0]?.patent_abv || "";
            const name = optelData[0]?.abv_name || "";
            optelInfo = `${patent} ${name}`.trim();
          } catch(e) {
            console.error(e);
          }
          document.getElementById("mail-message").value =
            `${greeting}\n\nEncarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s os Relatórios de Ocorrência de __ a __ de ____ do ${cbName}.\n\nCom os melhores cumprimentos,\n\nOPTEL\n${optelInfo}`;
          mailSetRoMode(true, currentCorpNr);
          document.getElementById("mail-ro-ini")?.focus();
        } else {
          document.getElementById("mail-message").value = "";
        }
      } catch (err) {
        console.error(err);
        showPopup("popup-danger", "Erro ao carregar emails: " + err.message);
      }
    }
    /* ===== Anexos acumulados: cada seleção junta-se às anteriores; ✕ remove um ficheiro ===== */
    let mailSelectedFiles = [];
    function updateAttachmentsList() {
      const input = document.getElementById("mail-attachments");
      Array.from(input?.files || []).forEach(f => {
        const dup = mailSelectedFiles.some(x => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified);
        if (!dup) mailSelectedFiles.push(f);
      });
      if (input) input.value = "";
      renderMailAttachments();
    }
    function renderMailAttachments() {
      const list = document.getElementById("mail-attachments-list");
      const count = document.getElementById("mail-attachments-count");
      const totalMb = mailSelectedFiles.reduce((t, f) => t + f.size, 0) / 1048576;
      if (count) count.textContent = mailSelectedFiles.length ? `${mailSelectedFiles.length} ficheiro(s) · ${totalMb.toFixed(1)} MB` : "Nenhum ficheiro selecionado";
      if (!list) return;
      list.innerHTML = "";
      mailSelectedFiles.forEach((file, idx) => {
        const tag = document.createElement("span");
        tag.style.cssText = "background: #e8f0fe; color: #1d4ed8; padding: 3px 6px 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;";
        const name = document.createElement("span");
        name.textContent = file.name;
        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "✕";
        del.title = "Remover anexo";
        del.style.cssText = "border: none; background: transparent; color: #1d4ed8; cursor: pointer; font-size: 11px; font-weight: 700; padding: 0 2px; line-height: 1;";
        del.onclick = () => { mailSelectedFiles.splice(idx, 1); renderMailAttachments(); };
        tag.append(name, del);
        list.appendChild(tag);
      });
    }
    function clearMailForm() {
      ['mail-to', 'mail-cc', 'mail-bcc', 'mail-subject', 'mail-message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const attach = document.getElementById('mail-attachments');
      if (attach) attach.value = '';
      mailSelectedFiles = [];
      const count = document.getElementById('mail-attachments-count');
      if (count) count.textContent = 'Nenhum ficheiro selecionado';
      const list = document.getElementById('mail-attachments-list');
      if (list) list.innerHTML = '';
      mailSetRoMode(false);
    }
    /* ===== Anexos via Supabase Storage (evita o limite de 4,5 MB da Vercel) ===== */
    const MAIL_ATTACH_BUCKET = "mail-attachments";
    function mailStorageHeaders(extra = {}) {
      const h = {...getSupabaseHeaders(), ...extra};
      if (!extra["Content-Type"]) delete h["Content-Type"];
      return h;
    }
    function mailSafeName(name) {
      return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
    }
    async function mailUploadAttachments(files, corpOperNr) {
      const batch = `${corpOperNr}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const done = [];
      try {
        const results = await Promise.all(files.map(async (file, idx) => {
          const path = `${batch}/${idx}_${mailSafeName(file.name)}`;
          const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${MAIL_ATTACH_BUCKET}/${path}`, {
            method: "POST",
            headers: mailStorageHeaders({"Content-Type": file.type || "application/octet-stream"}),
            body: file
          });
          if (!up.ok) throw new Error(`Falha ao carregar o anexo ${file.name}: ${await up.text()}`);
          done.push(path);
          const sign = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${MAIL_ATTACH_BUCKET}/${path}`, {
            method: "POST",
            headers: mailStorageHeaders({"Content-Type": "application/json"}),
            body: JSON.stringify({expiresIn: 600})
          });
          if (!sign.ok) throw new Error(`Falha ao preparar o anexo ${file.name}: ${await sign.text()}`);
          const {signedURL} = await sign.json();
          return {path, filename: file.name, url: `${SUPABASE_URL}/storage/v1${signedURL}`};
        }));
        return results;
      } catch (err) {
        mailDeleteAttachments(done);
        throw err;
      }
    }
    function mailDeleteAttachments(paths) {
      if (!paths || !paths.length) return;
      fetch(`${SUPABASE_URL}/storage/v1/object/${MAIL_ATTACH_BUCKET}`, {
        method: "DELETE",
        headers: mailStorageHeaders({"Content-Type": "application/json"}),
        body: JSON.stringify({prefixes: paths})
      }).catch(e => console.warn("Não foi possível apagar os anexos temporários:", e));
    }
    async function mailGetCorpContacts() {
      const corp = sessionStorage.getItem("currentCorpOperNr");
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corp}&select=corp_address,corp_cp,corp_localitie,corp_phone_mobile,corp_phone_landline,corp_email`, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) return {};
        const d = (await res.json())[0] || {};
        return {corpAddress: d.corp_address || "", corpCp: d.corp_cp || "", corpLocalitie: d.corp_localitie || "",
                corpPhoneMobile: d.corp_phone_mobile || "", corpPhoneLandline: d.corp_phone_landline || "", corpEmail: d.corp_email || ""};
      } catch (e) {
        console.warn("Erro ao carregar contactos da corporação:", e);
        return {};
      }
    }
    async function sendMail(btn) {
      const to = document.getElementById("mail-to").value.trim();
      const cc = document.getElementById("mail-cc").value.trim();
      const bcc = document.getElementById("mail-bcc").value.trim();
      const subject = document.getElementById("mail-subject").value.trim();
      const message = document.getElementById("mail-message").value.trim();
      if (!to || !subject || !message) {
        showPopup('popup-danger', "Preencha o destinatário, o assunto e a mensagem.");
        return;
      }
      if (!mailValidateRo()) return;
      const loading = (t) => { if (typeof updateLoadingPopup === "function") updateLoadingPopup(t); };
      const stopLoading = () => { if (typeof hideLoadingPopup === "function") hideLoadingPopup(); };
      if (btn) btn.disabled = true;
      if (typeof showLoadingPopup === "function") showLoadingPopup("A preparar o email...");
      let uploadedPaths = [];
      try {
        const [{corpOperNr, corpName, logoUrl, senderName}, corpContacts] = await Promise.all([_getEmailCommonData(), mailGetCorpContacts()]);
        const files = [...mailSelectedFiles];
        const totalMb = files.reduce((t, f) => t + f.size, 0) / 1048576;
        if (totalMb > 20) throw new Error(`Os anexos somam ${totalMb.toFixed(1)} MB. O limite é 20 MB.`);
        if (files.length) loading(`A carregar ${files.length} anexo(s)...`);
        const uploaded = await mailUploadAttachments(files, sessionStorage.getItem("currentCorpOperNr"));
        uploadedPaths = uploaded.map(u => u.path);
        const attachmentUrls = uploaded.map(u => ({filename: u.filename, url: u.url}));
        loading("A enviar o email...");
        const response = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({type: "email", data: {to, cc, bcc, subject, message, corpOperNr, corpName, logoUrl, senderName, attachmentUrls, ...corpContacts,
                                                      mailType: document.getElementById("mail-type")?.value || ""}})
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText.trim().startsWith("<") ? `Erro do Vercel (${response.status}).` : errorText || "Falha na resposta do servidor.");
        }
        const result = await response.json();
        if (!result.success) throw new Error(result.error || "Erro desconhecido no servidor.");
        stopLoading();
        showPopup('popup-success', "Email enviado com sucesso!");
        clearMailForm();
      } catch (err) {
        console.error("Erro ao enviar email:", err);
        stopLoading();
        showPopup('popup-danger', `Falha no envio: ${err.message}`);
      } finally {
        mailDeleteAttachments(uploadedPaths);
        stopLoading();
        if (btn) btn.disabled = false;
      }
    }
