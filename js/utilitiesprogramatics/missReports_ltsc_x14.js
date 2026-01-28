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
        const response = await fetch(url, {
          headers: getSupabaseHeaders()
        });
        const data = await response.json();
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
          if (nIntInput) nIntInput.value = report.n_int || '';
          if (nrInput)   nrInput.value   = report.report_nr || '';
          if (dateInput && report.report_date) {
            const d = new Date(report.report_date);
            if (!isNaN(d)) {
              dateInput.value = d.toISOString().split('T')[0];
            }
          }
          if (statusSel) {
            if (report.report_state === true) {
              statusSel.value = 'done';
            } else {
              statusSel.value = 'pending';
            }
          }
        });
      } catch (err) {
        console.error("Erro ao carregar OCR reports:", err);
        showPopupWarning("❌ Erro de ligação ao servidor.");
      }
    }
