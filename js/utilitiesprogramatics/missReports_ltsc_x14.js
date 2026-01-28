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
      const corp_oper_nr = sessionStorage.getItem("currentCorpOperNr");
      if (!corp_oper_nr) {
        showPopupWarning("❌ Erro: corp não identificada.");
        if (saveBtn) {saveBtn.disabled = false; saveBtn.textContent = "Guardar";}
        return;
      }
      const rows = [];
      for (let i = 1; i <= total; i++) {
        const n = String(i).padStart(2, "0");
        const nIntEl = document.getElementById(`report-${n}-nint`);
        const nrEl   = document.getElementById(`report-${n}-nr`);
        const dateEl = document.getElementById(`report-${n}-date`);
        const stEl   = document.getElementById(`report-${n}-status`);
        const n_int_raw   = (nIntEl?.value || "").trim();
        const report_nr   = (nrEl?.value || "").trim();
        const report_date = (dateEl?.value || "").trim();
        const status      = (stEl?.value || "").trim();
        if (!n_int_raw && !report_nr && !report_date && !status) continue;
        const n_int = n_int_raw ? parseInt(n_int_raw, 10) : null;
        rows.push({corp_oper_nr, n_int, report_nr: report_nr || null, report_date: report_date || null, report_state: status === "done"});
      }
      if (rows.length === 0) {
        showPopupWarning("⚠️ Nada para guardar.");
        if (saveBtn) {saveBtn.disabled = false; saveBtn.textContent = "Guardar";}
        return;
      }
      const headers = getSupabaseHeaders();
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/reports_control`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=representation"
          },
          body: JSON.stringify(rows)
        });
        const raw = await res.text();
        let out = null;
        try {out = raw ? JSON.parse(raw) : null; } catch (_) { out = raw;}
        if (!res.ok) {
          console.error("Erro ao guardar reports_control:", out);
          showPopupWarning(`❌ Erro ao guardar: ${(out && out.message) ? out.message : res.status}`);
          return;
        }
        try {
          const now = new Date().toISOString();
          const uniqueNints = [...new Set(rows.map(r => r.n_int).filter(n => Number.isInteger(n)))];
          if (uniqueNints.length > 0) {
            const msgNotif = `📄 Existem atualizações nos seus relatórios de ocorrência pendentes. Consulte "Relatórios".`;
            const notifications = uniqueNints.map(nint => ({n_int: nint, corp_oper_nr: corp_oper_nr, title: "Relatórios de Ocorrência", message: msgNotif,
                                                            is_read: false, created_at: now}));
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
                  headers: {"Content-Type": "application/json"},
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
        showPopupSuccess("✅ Relatórios guardados com sucesso!");
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
