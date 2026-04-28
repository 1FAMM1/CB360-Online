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
      const nInt = sessionStorage.getItem("currentNInt") || "205";
      const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
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
          const readed = n.business_notifications_read?.some(r => r.n_int === nInt);
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
      }, 10000);
    }
    function initNotifDropdown() {
      const btn = document.getElementById("notifBtn");
      if (!btn) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const existing = document.getElementById("notif-dropdown");
        if (existing) {existing.remove(); return;}
        openNotifDropdown(btn);
      });
      document.addEventListener("click", () => {
        document.getElementById("notif-dropdown")?.remove();
      });
    }
    async function openNotifDropdown(btn) {
      const nInt = sessionStorage.getItem("currentNInt") || "205";
      const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const dropdown = document.createElement("div");
      dropdown.id = "notif-dropdown";
      Object.assign(dropdown.style, {position: "fixed", zIndex: "99999", background: "#fff", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.22)", width: "320px",
                                     maxHeight: "400px", overflowY: "auto", fontFamily: "'Segoe UI', sans-serif", border: "1px solid #eee",
                                     opacity: "0", transition: "opacity 0.15s ease"});
      const rect = btn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 8) + "px";
      dropdown.style.right = (window.innerWidth - rect.right) + "px";
      const header = document.createElement("div");
      Object.assign(header.style, {background: "linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%)", padding: "10px 14px", borderRadius: "10px 10px 0 0", color: "#fff",
                                   fontWeight: "700", fontSize: "13px"});
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
        const data = await res.json();
        const unread = data.filter(n => {
          if (n.n_int_to) return !n.readed;
          const jaLeu = n.business_notifications_read?.some(r => r.n_int === nInt);
          return !jaLeu;
        });
        if (!unread.length) {
          const empty = document.createElement("div");
          Object.assign(empty.style, {padding: "20px", textAlign: "center", color: "#999", fontSize: "13px"});
          empty.textContent = "Sem notificações por ler.";
          dropdown.appendChild(empty);
          dropdown.style.opacity = "1";
          return;
        }
        for (const notif of unread) {
          const item = document.createElement("div");
          Object.assign(item.style, {padding: "10px 14px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", transition: "background .15s"});
          item.addEventListener("mouseenter", () => item.style.background = "#fdf5f5");
          item.addEventListener("mouseleave", () => item.style.background = "#fff");
          const from = document.createElement("div");
          Object.assign(from.style, {fontSize: "11px", color: "#999", marginBottom: "3px"});
          const abvName = await getAbvNameByNInt(notif.n_int_from);
          const fromLabel = notif.n_int_from ? `${notif.n_int_from}${abvName ? ` - ${abvName}` : ""}` : "Sistema";
          from.textContent = `De: ${fromLabel} · ${new Date(notif.created_at).toLocaleString("pt-PT")}`;
          const msg = document.createElement("div");
          Object.assign(msg.style, {fontSize: "13px", color: "#333", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"});
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
        dropdown.style.opacity = "1";
      }
    }
    async function getAbvNameByNInt(nInt) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
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
      const nInt = sessionStorage.getItem("currentNInt") || "205";
      const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const overlay = document.createElement("div");
      overlay.id = "notif-modal";
      Object.assign(overlay.style, {position: "fixed", inset: "0", background: "rgba(10,8,8,0.78)", zIndex: "100000", display: "flex", alignItems: "center", justifyContent: "center",
                                    backdropFilter: "blur(4px)"});
      const box = document.createElement("div");
      Object.assign(box.style, {background: "#fff", borderRadius: "12px", width: "400px", boxShadow: "0 28px 72px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column",
                                overflow: "hidden", fontFamily: "'Segoe UI', sans-serif"});
      const header = document.createElement("div");
      Object.assign(header.style, {background: "linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%)", padding: "12px 16px", display: "flex", alignItems: "center",
                                   justifyContent: "space-between"});
      const headerTitle = document.createElement("div");
      Object.assign(headerTitle.style, {color: "#fff", fontWeight: "700", fontSize: "13px"});
      headerTitle.textContent = "🔔 Notificação";
      header.appendChild(headerTitle);
      const body = document.createElement("div");
      Object.assign(body.style, {padding: "20px", display: "flex", flexDirection: "column", gap: "10px"});
      const from = document.createElement("div");
      Object.assign(from.style, {fontSize: "12px", color: "#999"});
      const abvName = await getAbvNameByNInt(notif.n_int_from);
      const fromLabel = notif.n_int_from ? `${notif.n_int_from}${abvName ? ` - ${abvName}` : ""}` : "Sistema";
      from.textContent = `De: ${fromLabel} · ${new Date(notif.created_at).toLocaleString("pt-PT")}`;
      const msg = document.createElement("div");
      Object.assign(msg.style, {fontSize: "14px", color: "#333", lineHeight: "1.6", background: "#fdf5f5", padding: "12px", borderRadius: "8px", border: "1px solid #f5d0d0"});
      msg.textContent = notif.message;
      const textarea = document.createElement("textarea");
      textarea.placeholder = "Escreva a sua resposta...";
      Object.assign(textarea.style, {display: "none", width: "100%", minHeight: "80px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px",
                                     fontFamily: "'Segoe UI', sans-serif", resize: "vertical", boxSizing: "border-box", outline: "none", transition: "border-color .15s"});
      textarea.onfocus = () => textarea.style.borderColor = "#7b0000";
      textarea.onblur = () => textarea.style.borderColor = "#ddd";
      body.append(from, msg, textarea);
      const footer = document.createElement("div");
      Object.assign(footer.style, {padding: "12px 20px", display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #eee", background: "#fafafa"});
      const btnReply = document.createElement("button");
      btnReply.textContent = "↩ Responder";
      Object.assign(btnReply.style, {padding: "7px 16px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", color: "#555", fontSize: "13px", fontWeight: "600", cursor: "pointer"});
      const btnOk = document.createElement("button");
      btnOk.textContent = "✔ OK";
      Object.assign(btnOk.style, {padding: "7px 20px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #7b0000, #9a0f0f)", color: "#fff", fontSize: "13px",
                                  fontWeight: "600", cursor: "pointer"});
      const btnSend = document.createElement("button");
      btnSend.textContent = "📤 Enviar";
      btnSend.style.display = "none";
      Object.assign(btnSend.style, {padding: "7px 16px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #7b0000, #9a0f0f)", color: "#fff", fontSize: "13px",
                                      fontWeight: "600", cursor: "pointer"});
      const btnCancell = document.createElement("button");
      btnCancell.textContent = "✕ Cancelar";
      btnCancell.style.display = "none";
      Object.assign(btnCancell.style, {padding: "7px 16px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", color: "#555", fontSize: "13px", fontWeight: "600", cursor: "pointer"});
      btnReply.addEventListener("click", () => {
        textarea.style.display = "block";
        btnReply.style.display = "none";
        btnOk.style.display = "none";
        btnSend.style.display = "";
        btnCancell.style.display = "";
        textarea.focus();
      });
      btnCancell.addEventListener("click", () => {
        textarea.style.display = "none";
        textarea.value = "";
        btnReply.style.display = "";
        btnOk.style.display = "";
        btnSend.style.display = "none";
        btnCancell.style.display = "none";
      });
      async function markAsRead() {
        if (!notif.n_int_to) {
          await fetch(`${SUPABASE_URL}/rest/v1/business_notifications_read`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({notification_id: notif.id, n_int: nInt, corp_oper_nr: corpNr})
          });
        } else {
          await fetch(`${SUPABASE_URL}/rest/v1/business_notifications?id=eq.${notif.id}`, {
            method: "PATCH",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({readed: true})
          });
        }
      }
      btnOk.addEventListener("click", async () => {
        try {
          await markAsRead();
          overlay.remove();
          await loadNotifications();
        } catch(err) {
          console.error("Erro ao marcar como lida:", err);
        }
      });
      btnSend.addEventListener("click", async () => {
        const resposta = textarea.value.trim();
        if (!resposta) { textarea.style.borderColor = "#e74c3c"; return; }
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/business_notifications`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({n_int_from: nInt, n_int_to: notif.n_int_from, message: resposta, readed: false, corp_oper_nr: corpNr})
          });
          await markAsRead();
          overlay.remove();
          await loadNotifications();
        } catch(err) {
          console.error("Erro ao enviar resposta:", err);
        }
      });
      if (notif.n_int_from) footer.append(btnReply);
      footer.append(btnCancell, btnSend, btnOk);
      box.append(header, body, footer);
      overlay.appendChild(box);
      overlay.addEventListener("click", e => {if (e.target === overlay) overlay.remove();});
      document.body.appendChild(overlay);
    }
    async function sendNotification() {
      const nInt = sessionStorage.getItem("currentNInt") || "205";
      const corpNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const to = document.getElementById("notification-to")?.value?.trim() || null;
      const message = document.getElementById("notification-message")?.value?.trim();
      if (!message) {
        showPopup('popup-danger', "Preencha o campo de notificação.");
        return;
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/business_notifications`, {
          method: "POST",
          headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
          body: JSON.stringify({
            corp_oper_nr: corpNr,
            n_int_from: nInt,
            n_int_to: to || null,
            message: message.toUpperCase(),
            readed: false
          })
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
