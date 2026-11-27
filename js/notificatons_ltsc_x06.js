    /* =======================================
    NOTIFICATIONS · MAILER
    ======================================= */
    (() => {
    /* ----------------------------- estilos ----------------------------- */
    if (!document.getElementById('notif-css')) {
      const css = document.createElement('style');
      css.id = 'notif-css';
      css.textContent = `
        #notif-dropdown {position: fixed; z-index: 99999; background: #fff; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.22); width: 320px; max-height: 400px; overflow-y: auto;
                         font-family: 'Segoe UI', sans-serif; border: 1px solid #eee; opacity: 0; transition: opacity 0.15s ease;}
        #notif-dropdown .nf-head {background: linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%); padding: 10px 14px; border-radius: 10px 10px 0 0; color: #fff; font-weight: 700; font-size: 13px;}
        #notif-dropdown .nf-info {padding: 20px; text-align: center; color: #999; font-size: 13px;}
        #notif-dropdown .nf-info.err {color: #c0392b;}
        #notif-dropdown .nf-item {padding: 10px 14px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background .15s;}
        #notif-dropdown .nf-item:hover {background: #fdf5f5;}
        #notif-dropdown .nf-from {font-size: 11px; color: #999; margin-bottom: 3px;}
        #notif-dropdown .nf-msg {font-size: 13px; color: #333; font-weight: 600; white-space: pre-wrap; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;}
        #notif-modal {position: fixed; inset: 0; background: rgba(10,8,8,0.78); z-index: 100000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);}
        #notif-modal .nf-box {background: #fff; border-radius: 12px; width: 400px; box-shadow: 0 28px 72px rgba(0,0,0,0.45); display: flex; flex-direction: column; overflow: hidden; font-family: 'Segoe UI', sans-serif;}
        #notif-modal .nf-head {background: linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;}
        #notif-modal .nf-head > div {color: #fff; font-weight: 700; font-size: 13px;}
        #notif-modal .nf-body {padding: 20px; display: flex; flex-direction: column; gap: 10px;}
        #notif-modal .nf-from {font-size: 12px; color: #999;}
        #notif-modal .nf-msg {font-size: 14px; color: #333; line-height: 1.6; background: #fdf5f5; padding: 12px; border-radius: 8px; border: 1px solid #f5d0d0; white-space: pre-wrap;}
        #notif-modal textarea {display: none; width: 100%; min-height: 80px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 13px; font-family: 'Segoe UI', sans-serif;
                               resize: vertical; box-sizing: border-box; outline: none; transition: border-color .15s;}
        #notif-modal .nf-foot {padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #eee; background: #fafafa;}
        #notif-modal .nf-foot button {padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #ddd; background: #fff; color: #555;}
        #notif-modal .nf-foot button.dark {border: none; background: linear-gradient(135deg, #7b0000, #9a0f0f); color: #fff;}
        #notif-modal .nf-foot button.ok {padding: 7px 20px;}
        #page-utilities #mail-subject-ro {display: none; flex: 1; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 13px; color: #222;}
        #page-utilities #mail-subject-ro input, #page-utilities #mail-subject-ro select {padding: 3px 6px; border: 1px solid #d00000; border-radius: 5px; font-weight: 700; font-size: 12.5px; text-align: center;
                                                         outline: none; background: #fff5f5; color: #d00000; font-family: inherit;}
        #page-utilities #mail-subject-ro select {border: 1px solid #ccc; background: #fff; color: #1e293b; cursor: pointer; font-weight: normal; text-align: left; text-align-last: left;}
        #page-utilities #mail-subject-ro input {width: 64px !important; min-width: 64px !important; max-width: 64px !important; flex: 0 0 64px !important;}
        #page-utilities #mail-subject-ro #mail-ro-month {width: 120px !important; min-width: 120px !important; max-width: 120px !important; flex: 0 0 120px !important;}
        #page-utilities #mail-subject-ro #mail-ro-year {width: 80px !important; min-width: 80px !important; max-width: 80px !important; flex: 0 0 80px !important;}
        #mail-attachments-list .mail-att {background: #e8f0fe; color: #1d4ed8; padding: 3px 6px 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;}
        #mail-attachments-list .mail-att button {border: none; background: transparent; color: #1d4ed8; cursor: pointer; font-size: 11px; font-weight: 700; padding: 0 2px; line-height: 1;}
      `;
      document.head.appendChild(css);
    }
    const $ = id => document.getElementById(id);
    const el = (tag, cls, text) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    };
    const session = () => ({nInt: sessionStorage.getItem("currentNInt"), corpNr: sessionStorage.getItem("currentCorpOperNr")});

    /* =======================================
    NOTIFICATIONS
    ======================================= */
    /* notificações gerais (para todos) só dos últimos 60 dias: sem isto, a lista crescia para sempre e era lida a cada minuto.
       As pessoais (para mim) contam sempre enquanto não forem lidas. Da lista de quem já leu, só interessa saber se fui eu. */
    const NOTIF_GERAIS_DIAS = 60;
    async function fetchUnread(cols = "*") {
      const {nInt, corpNr} = session();
      const since = new Date(Date.now() - NOTIF_GERAIS_DIAS * 86400000).toISOString();
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/business_notifications?corp_oper_nr=eq.${corpNr}` +
        `&or=(and(n_int_to.eq.${nInt},readed.eq.false),and(n_int_to.is.null,created_at.gte.${encodeURIComponent(since)}))` +
        `&select=${cols},business_notifications_read(n_int)&business_notifications_read.n_int=eq.${encodeURIComponent(nInt)}&order=created_at.desc`, {
        headers: getSupabaseHeaders()
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.filter(n => n.n_int_to ? !n.readed : !n.business_notifications_read?.some(r => String(r.n_int) === String(nInt)));
    }
    function setNotifCount(n) {
      const btn = $("notifBtn");
      const badge = $("notifBadge");
      badge.textContent = n > 99 ? "99+" : n;
      badge.style.display = "flex";
      btn.classList.toggle("has-notif", n > 0);
    }
    async function loadNotifications() {
      try {
        setNotifCount((await fetchUnread("id,n_int_to,readed")).length);   /* para o número só bastam estas colunas */
      } catch(err) {
        console.error("Erro ao carregar notificações:", err);
      }
    }
    /* o sino atualiza pelo sinal "mudou" do canal cb360-notif-<corporação> (SQL 53). Sem o sinal ligado, de 60 em 60 s como antes;
       com o sinal ligado, só de 10 em 10 min por segurança. Voltar à janela já é tratado pelo cb360RT. */
    let notifStarted = false;
    function startNotifPolling() {
      if (notifStarted) return;
      notifStarted = true;
      let deb = null;
      const rt = window.cb360RT?.on('notif', () => { clearTimeout(deb); deb = setTimeout(loadNotifications, 400); });
      const tick = () => {
        if (!rt?.ok() || !document.hidden) loadNotifications();
        setTimeout(tick, rt?.ok() ? 600000 : 60000);
      };
      setTimeout(tick, rt ? 600000 : 60000);
    }
    function initNotifDropdown() {
      const btn = $("notifBtn");
      if (!btn) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const existing = $("notif-dropdown");
        if (existing) { existing.remove(); return; }
        openNotifDropdown(btn);
      });
      document.addEventListener("click", () => $("notif-dropdown")?.remove());
    }
    async function getAbvNameByNInt(nInt) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const data = await supabaseFetch(`reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=eq.${nInt}&select=abv_name&limit=1`);
        return data?.[0]?.abv_name || "";
      } catch {
        return "";
      }
    }
    async function fromText(notif) {
      const abvName = await getAbvNameByNInt(notif.n_int_from);
      const fromLabel = notif.n_int_from ? `${notif.n_int_from}${abvName ? ` - ${abvName}` : ""}` : "Sistema";
      return `De: ${fromLabel} · ${new Date(notif.created_at).toLocaleString("pt-PT")}`;
    }
    async function openNotifDropdown(btn) {
      const dropdown = el("div");
      dropdown.id = "notif-dropdown";
      const rect = btn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 8) + "px";
      dropdown.style.right = (window.innerWidth - rect.right) + "px";
      dropdown.appendChild(el("div", "nf-head", "🔔 Notificações"));
      document.body.appendChild(dropdown);
      dropdown.addEventListener("click", e => e.stopPropagation());
      try {
        const unread = await fetchUnread();
        if (!unread.length) dropdown.appendChild(el("div", "nf-info", "Sem notificações por ler."));
        for (const notif of unread) {
          const item = el("div", "nf-item");
          item.append(el("div", "nf-from", await fromText(notif)), el("div", "nf-msg", notif.message));
          item.addEventListener("click", () => {
            $("notif-dropdown")?.remove();
            openNotifModal(notif);
          });
          dropdown.appendChild(item);
        }
      } catch(err) {
        console.error("Erro ao carregar notificações:", err);
        dropdown.appendChild(el("div", "nf-info err", "Erro ao carregar notificações."));
      }
      dropdown.style.opacity = "1";
    }
    async function openNotifModal(notif) {
      $("notif-modal")?.remove();
      const {nInt, corpNr} = session();
      const overlay = el("div");
      overlay.id = "notif-modal";
      const box = el("div", "nf-box");
      const header = el("div", "nf-head");
      header.appendChild(el("div", null, "🔔 Notificação"));
      const body = el("div", "nf-body");
      const textarea = el("textarea");
      textarea.placeholder = "Escreva a sua resposta...";
      textarea.onfocus = () => textarea.style.borderColor = "#7b0000";
      textarea.onblur = () => textarea.style.borderColor = "#ddd";
      body.append(el("div", "nf-from", await fromText(notif)), el("div", "nf-msg", notif.message), textarea);
      const footer = el("div", "nf-foot");
      const btnReply = el("button", null, "↩ Responder");
      const btnOk = el("button", "dark ok", "✔ OK");
      const btnSend = el("button", "dark", "📤 Enviar");
      const btnCancell = el("button", null, "✕ Cancelar");
      btnSend.style.display = btnCancell.style.display = "none";
      const replyMode = on => {
        textarea.style.display = on ? "block" : "none";
        btnReply.style.display = btnOk.style.display = on ? "none" : "";
        btnSend.style.display = btnCancell.style.display = on ? "" : "none";
      };
      btnReply.addEventListener("click", () => { replyMode(true); textarea.focus(); });
      btnCancell.addEventListener("click", () => { textarea.value = ""; replyMode(false); });
      const post = (path, method, payload) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method, headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"}, body: JSON.stringify(payload)
      });
      async function markAsRead() {
        const res = !notif.n_int_to
          ? await post("business_notifications_read", "POST", {notification_id: notif.id, n_int: nInt, corp_oper_nr: corpNr})
          : await post(`business_notifications?id=eq.${notif.id}`, "PATCH", {readed: true});
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
          const resReply = await post("business_notifications", "POST", {n_int_from: nInt, n_int_to: notif.n_int_from, message: resposta, readed: false, corp_oper_nr: corpNr});
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
      const {nInt, corpNr} = session();
      const to = $("notification-to")?.value?.trim() || null;
      const message = $("notification-message")?.value?.trim();
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
        $("notification-to").value = "";
        $("notification-message").value = "";
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
      const v = id => parseInt($(id)?.value, 10);
      return {ini: v("mail-ro-ini"), fim: v("mail-ro-fim"), month: v("mail-ro-month"), year: v("mail-ro-year")};
    }
    function mailRoPeriodText() {
      const {ini, fim, month, year} = mailRoValues();
      const d = n => Number.isInteger(n) ? String(n).padStart(2, "0") : "__";
      return `${d(ini)} a ${d(fim)} de ${MAIL_RO_MONTHS[month] || "____"} de ${year || "____"}`;
    }
    function mailRoFieldStyle(e, ok) {
      e.style.borderColor = ok ? "#16a34a" : "#d00000";
      e.style.background = ok ? "#f0fdf4" : "#fff5f5";
      e.style.color = ok ? "#1e293b" : "#d00000";
    }
    function mailRoRefreshStyles() {
      const {ini, fim, month, year} = mailRoValues();
      const last = new Date(year, month + 1, 0).getDate();
      const iniOk = Number.isInteger(ini) && ini >= 1 && ini <= last;
      const fimOk = Number.isInteger(fim) && fim >= 1 && fim <= last && (!iniOk || fim >= ini);
      mailRoFieldStyle($("mail-ro-ini"), iniOk);
      mailRoFieldStyle($("mail-ro-fim"), fimOk);
    }
    function mailBuildRoSubjectBox() {
      let box = $("mail-subject-ro");
      if (box) return box;
      const subject = $("mail-subject");
      if (!subject) return null;
      box = el("div");
      box.id = "mail-subject-ro";
      const mkDay = id => {
        const i = el("input");
        Object.assign(i, {type: "text", inputMode: "numeric", maxLength: 2, id, placeholder: "Dia"});
        i.addEventListener("input", () => { i.value = i.value.replace(/\D/g, ""); mailApplyRo(); });
        // Ao sair do campo, 1 a 9 passa a 01 a 09
        i.addEventListener("blur", () => { const n = parseInt(i.value, 10); if (Number.isInteger(n) && n >= 1 && n <= 9) i.value = String(n).padStart(2, "0"); });
        return i;
      };
      const mkSelect = (id, options) => {
        const sel = el("select");
        sel.id = id;
        options.forEach(([v, t]) => { const o = el("option", null, t); o.value = v; sel.appendChild(o); });
        sel.addEventListener("change", mailApplyRo);
        return sel;
      };
      const thisYear = new Date().getFullYear();
      const suffix = el("span", null, "");
      suffix.id = "mail-subject-ro-suffix";
      box.append(el("span", null, "RO's de"), mkDay("mail-ro-ini"), el("span", null, "a"), mkDay("mail-ro-fim"), el("span", null, "de"),
                 mkSelect("mail-ro-month", MAIL_RO_MONTHS.map((m, i) => [i, m])), el("span", null, "de"),
                 mkSelect("mail-ro-year", [thisYear, thisYear - 1].map(y => [y, y])), suffix);
      subject.insertAdjacentElement("afterend", box);
      return box;
    }
    function mailSetRoMode(on, corpNr) {
      const subject = $("mail-subject");
      const box = mailBuildRoSubjectBox();
      if (!subject || !box) return;
      subject.style.display = on ? "none" : "";
      box.style.display = on ? "flex" : "none";
      if (on) {
        const now = new Date();
        $("mail-subject-ro-suffix").textContent = `_${corpNr}`;
        box.dataset.corp = corpNr;
        $("mail-ro-ini").value = "";
        $("mail-ro-fim").value = "";
        $("mail-ro-month").value = String(now.getMonth());
        $("mail-ro-year").value = String(now.getFullYear());
        mailApplyRo();
      }
    }
    function mailApplyRo() {
      const box = $("mail-subject-ro");
      if (!box || box.style.display === "none") return;
      const period = mailRoPeriodText();
      $("mail-subject").value = `RO's de ${period}_${box.dataset.corp || ""}`;
      const msg = $("mail-message");
      if (msg) msg.value = msg.value.replace(/(Relatórios de Ocorrência de ).*?( do )/, `$1${period}$2`);
      mailRoRefreshStyles();
    }
    function mailValidateRo() {
      const box = $("mail-subject-ro");
      if (!box || box.style.display === "none") return true;
      const {ini, fim, month, year} = mailRoValues();
      const last = new Date(year, month + 1, 0).getDate();
      const iniEl = $("mail-ro-ini");
      const fimEl = $("mail-ro-fim");
      if (!Number.isInteger(ini) || ini < 1 || ini > last) { showPopup('popup-danger', `Dia de início inválido (1 a ${last}).`); iniEl.focus(); return false; }
      if (!Number.isInteger(fim) || fim < 1 || fim > last) { showPopup('popup-danger', `Dia de fim inválido (1 a ${last}).`); fimEl.focus(); return false; }
      if (fim < ini) { showPopup('popup-danger', "O dia de fim é anterior ao dia de início."); fimEl.focus(); return false; }
      return true;
    }
    function selectMailType(btn, value) {
      ['ro', 'outro'].forEach(t => {
        const b = $('mail-type-' + t);
        const on = t === value;
        b.style.background = on ? '#7b000012' : 'transparent';
        b.style.border = on ? '1px solid #7b000055' : '1px solid #ddd';
        b.style.color = on ? '#7b0000' : '#666';
        b.style.fontWeight = on ? '500' : 'normal';
      });
      $('mail-type').value = value;
      loadMailAddresses(value);
    }
    async function loadMailAddresses(type) {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      ["mail-to", "mail-cc", "mail-bcc", "mail-subject"].forEach(id => $(id).value = "");
      mailSetRoMode(false);
      if (!type || type === "outro" || !currentCorpNr) {
        $("mail-message").value = "";
        return;
      }
      const prefix = "ro_crepc";
      const get = path => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {headers: getSupabaseHeaders()}).then(r => r.json());
      try {
        const rows = await get(`mails_config?corp_oper_nr=eq.${currentCorpNr}&category=in.(${prefix}_mail_to,${prefix}_mail_cc,${prefix}_mail_bcc)`);
        if (!Array.isArray(rows)) return;
        ["to", "cc", "bcc"].forEach(f => $(`mail-${f}`).value = rows.find(r => r.category === `${prefix}_mail_${f}`)?.value || "");
        if (type === "ro") {
          const commanderName = await getCommanderName(currentCorpNr);
          const greeting = getGreeting();
          let cbName = "";
          try {
            const corpData = await get(`corporation_data?corp_oper_nr=eq.${currentCorpNr}&select=cb_name`);
            cbName = corpData[0]?.cb_name || "";
          } catch(e) {
            console.error(e);
          }
          let optelInfo = "";
          try {
            const nInt = sessionStorage.getItem("currentNInt");
            const optelData = await get(`reg_elems?n_int=eq.${nInt}&corp_oper_nr=eq.${currentCorpNr}&select=patent_abv,abv_name`);
            optelInfo = `${optelData[0]?.patent_abv || ""} ${optelData[0]?.abv_name || ""}`.trim();
          } catch(e) {
            console.error(e);
          }
          $("mail-message").value =
            `${greeting}\n\nEncarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s os Relatórios de Ocorrência de __ a __ de ____ do ${cbName}.\n\nCom os melhores cumprimentos,\n\nOPTEL\n${optelInfo}`;
          mailSetRoMode(true, currentCorpNr);
          $("mail-ro-ini")?.focus();
        } else {
          $("mail-message").value = "";
        }
      } catch (err) {
        console.error(err);
        showPopup("popup-danger", "Erro ao carregar emails: " + err.message);
      }
    }
    /* ===== Anexos acumulados: cada seleção junta-se às anteriores; ✕ remove um ficheiro ===== */
    let mailSelectedFiles = [];
    function updateAttachmentsList() {
      const input = $("mail-attachments");
      Array.from(input?.files || []).forEach(f => {
        const dup = mailSelectedFiles.some(x => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified);
        if (!dup) mailSelectedFiles.push(f);
      });
      if (input) input.value = "";
      renderMailAttachments();
    }
    function renderMailAttachments() {
      const list = $("mail-attachments-list");
      const count = $("mail-attachments-count");
      const totalMb = mailSelectedFiles.reduce((t, f) => t + f.size, 0) / 1048576;
      if (count) count.textContent = mailSelectedFiles.length ? `${mailSelectedFiles.length} ficheiro(s) · ${totalMb.toFixed(1)} MB` : "Nenhum ficheiro selecionado";
      if (!list) return;
      list.innerHTML = "";
      mailSelectedFiles.forEach((file, idx) => {
        const tag = el("span", "mail-att");
        const del = el("button", null, "✕");
        del.type = "button";
        del.title = "Remover anexo";
        del.onclick = () => { mailSelectedFiles.splice(idx, 1); renderMailAttachments(); };
        tag.append(el("span", null, file.name), del);
        list.appendChild(tag);
      });
    }
    function clearMailForm() {
      ['mail-to', 'mail-cc', 'mail-bcc', 'mail-subject', 'mail-message', 'mail-attachments'].forEach(id => { const e = $(id); if (e) e.value = ''; });
      mailSelectedFiles = [];
      const count = $('mail-attachments-count');
      if (count) count.textContent = 'Nenhum ficheiro selecionado';
      const list = $('mail-attachments-list');
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
      return name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
    }
    async function mailUploadAttachments(files, corpOperNr) {
      const batch = `${corpOperNr}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const done = [];
      try {
        return await Promise.all(files.map(async (file, idx) => {
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
      const [to, cc, bcc, subject, message] = ["mail-to", "mail-cc", "mail-bcc", "mail-subject", "mail-message"].map(id => $(id).value.trim());
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
                                                      mailType: $("mail-type")?.value || ""}})
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

    /* usadas pelo mainloader e pelos Utilitários */
    Object.assign(window, {loadNotifications, startNotifPolling, initNotifDropdown, sendNotification,
                           selectMailType, loadMailAddresses, updateAttachmentsList, sendMail});
    })();
