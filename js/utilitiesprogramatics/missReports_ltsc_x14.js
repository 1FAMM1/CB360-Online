    /* =======================================
    MISSING REPORTS
    ======================================= */
    async function loadocrReportsFromSupabase(total = 24) {
      createOcrReportsInputs(total);
      const currentCorpOperNr = sessionStorage.getItem('currentCorpOperNr');
      if (!currentCorpOperNr) {
        showPopupWarning("❌ Erro: Sessão não identificada.");
        return;
      }
      try {
        const url = `${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${currentCorpOperNr}&order=report_date.desc`;
        const response = await fetch(url, {headers: getSupabaseHeaders()});
        const raw = await response.text();
        const data = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(data)) {
          console.error("Resposta inválida:", data);
          showPopupWarning("❌ Erro ao carregar dados.");
          return;
        }
        data.slice(0, total).forEach((report, index) => {
          const n = String(index + 1).padStart(2, '0');
          const nIntInput = document.getElementById(`report-${n}-nint`);
          const nrInput   = document.getElementById(`report-${n}-nr`);
          const dateInput = document.getElementById(`report-${n}-date`);
          const statusSel = document.getElementById(`report-${n}-status`);
          if (nIntInput) nIntInput.value = report.n_int ?? '';
          if (nrInput)   nrInput.value   = report.report_nr ?? '';
          if (dateInput) {
            if (report.report_date) {
              const d = new Date(report.report_date);
              dateInput.value = !isNaN(d) ? d.toISOString().split('T')[0] : '';
            } else {
              dateInput.value = '';
            }
          }
          if (statusSel) {
            statusSel.value = (report.report_state === true) ? 'done' : 'pending';
          }
        });
      } catch (err) {
        console.error("Erro ao carregar OCR reports:", err);
        showPopupWarning("❌ Erro de ligação ao servidor.");
      }
    }
    async function saveOcrReportsToSupabase(total = 24) {
      const saveBtn = document.getElementById("save-ocr-reports");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
      }    
      const corp_oper_nr_raw = sessionStorage.getItem("currentCorpOperNr");
      if (!corp_oper_nr_raw) {
        showPopupWarning("❌ Erro: corp não identificada.");
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Guardar"; }
        return;
      }
      const corp_oper_nr = corp_oper_nr_raw.toString().padStart(4, "0");
      const headers = getSupabaseHeaders();
      const normText = (s) => (s || "").toString().trim();
      const normKeyText = (s) => normText(s).toLowerCase();
      const makeKey = (r) =>
        `${r.corp_oper_nr}|${r.n_int}|${normKeyText(r.report_nr)}|${r.report_date || ""}`;    
      try {
        const rowsRaw = [];
        for (let i = 1; i <= total; i++) {
          const n = String(i).padStart(2, "0");    
          const nIntEl = document.getElementById(`report-${n}-nint`);
          const nrEl   = document.getElementById(`report-${n}-nr`);
          const dateEl = document.getElementById(`report-${n}-date`);
          const stEl   = document.getElementById(`report-${n}-status`);    
          const n_int_raw   = normText(nIntEl?.value);
          const report_nr   = normText(nrEl?.value);
          const report_date = normText(dateEl?.value);
          const status      = normText(stEl?.value);    
          if (!n_int_raw && !report_nr && !report_date && !status) continue;    
          const n_int = n_int_raw ? parseInt(n_int_raw, 10) : null;
          if (!Number.isInteger(n_int)) continue;    
          rowsRaw.push({corp_oper_nr, n_int, report_nr: report_nr || null, report_date: report_date || null, report_state: status === "done"});
        }
        if (rowsRaw.length === 0) {
          showPopupWarning("⚠️ Nada para guardar.");
          return;
        }
        const formMap = new Map();
        for (const r of rowsRaw) formMap.set(makeKey(r), r);
        const rows = [...formMap.values()];
        const getUrl = `${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${corp_oper_nr}`;    
        const getRes = await fetch(getUrl, { headers });
        const getRaw = await getRes.text();
        const existing = getRaw ? JSON.parse(getRaw) : [];    
        if (!Array.isArray(existing)) {
          console.error("Existing inválido:", existing);
          showPopupWarning("❌ Erro ao validar dados existentes.");
          return;
        }
        const existingMap = new Map();
        for (const r of existing) {
          const key = makeKey({corp_oper_nr, n_int: r.n_int, report_nr: r.report_nr || null, report_date: r.report_date ? new Date(r.report_date).toISOString().split("T")[0] : null});
          existingMap.set(key, { report_state: r.report_state === true });
        }
        const toInsert = [];
        const toUpdate = [];    
        for (const r of rows) {
          const key = makeKey(r);
          const old = existingMap.get(key);    
          if (!old) {
            toInsert.push(r);
          } else {
            if (old.report_state !== (r.report_state === true)) {
              toUpdate.push(r);
            }
          }
        }    
        if (toInsert.length === 0 && toUpdate.length === 0) {
          showPopupWarning("✅ Sem alterações (não havia nada para guardar).");
          return;
        }
        if (toInsert.length > 0) {
          const insRes = await fetch(`${SUPABASE_URL}/rest/v1/reports_control`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation"
            },
            body: JSON.stringify(toInsert)
          });    
          if (!insRes.ok) {
            const t = await insRes.text();
            console.error("Erro INSERT reports_control:", t);
            showPopupWarning("❌ Erro ao inserir novos registos.");
            return;
          }
        }
        for (const r of toUpdate) {
          const reportNrEncoded = encodeURIComponent(r.report_nr || "");
          const reportDateVal = r.report_date || "";    
          const updUrl =
            `${SUPABASE_URL}/rest/v1/reports_control` +
            `?corp_oper_nr=eq.${corp_oper_nr}` +
            `&n_int=eq.${r.n_int}` +
            `&report_nr=eq.${reportNrEncoded}` +
            `&report_date=eq.${reportDateVal}`;    
          const updRes = await fetch(updUrl, {
            method: "PATCH",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ report_state: r.report_state === true })
          });    
          if (!updRes.ok) {
            const t = await updRes.text();
            console.error("Erro UPDATE reports_control:", t, "URL:", updUrl);
            showPopupWarning("❌ Erro ao atualizar registos.");
            return;
          }
        }
        try {
          const affected = [...toInsert, ...toUpdate];
          const uniqueNints = [...new Set(affected.map(r => r.n_int).filter(n => Number.isInteger(n)))];    
          if (uniqueNints.length > 0) {
            const now = new Date().toISOString();
            const msgNotif = `⚠️ ATENÇÃO! Tem Relatórios de Ocorrência Pendentes. Consulte o menú "Relatórios de Ocorrência".`;    
            const notifications = uniqueNints.map(nint => ({n_int: nint, corp_oper_nr: corp_oper_nr, title: "Relatórios de Ocorrência", message: msgNotif, is_read: false, created_at: now}));    
            const notifRes = await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify(notifications)
            });
    
            if (!notifRes.ok) {
              const rawN = await notifRes.text();
              console.error("Erro ao inserir user_notifications:", rawN);
            }    
            for (const nint of uniqueNints) {
              try {
                await fetch("https://cb-360-app.vercel.app/api/sendPush", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({recipient_nint: nint.toString(), corp_nr: corp_oper_nr, sender_name: "CB360 Online", message_text: msgNotif, sender_nint: "0"})
                });
              } catch (errPush) {
                console.error("Erro ao enviar push (nint=" + nint + "):", errPush);
              }
            }
          }
        } catch (errNotif) {
          console.error("Erro no fluxo de notificações:", errNotif);
        }    
        showPopupSuccess(`✅ Guardado! Novos: ${toInsert.length} | Atualizados: ${toUpdate.length}`);    
      } catch (err) {
        console.error("Erro geral save OCR reports:", err);
        showPopupWarning("❌ Erro de ligação ao servidor.");
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar";
        }
      }
    }
