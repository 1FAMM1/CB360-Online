    async function checkPdfExists(nrCodu) {
      const fileName = `ocr_${nrCodu}.pdf`;
      const url = `${SUPABASE_URL}/storage/v1/object/public/inem-verbetes/${fileName}`;
      try {
        const res = await fetch(url, {method: "HEAD"});
        return res.ok;
      } catch {
        return false;
      }
    }
    async function loadInemEntries() {
      const dateFrom = document.getElementById("inem-date-from")?.value;
      const dateTo = document.getElementById("inem-date-to")?.value;
      const codu = document.getElementById("inem-filter-codu")?.value.trim();
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const tbody = document.querySelector("#inem-entries table tbody");
      const btnEmitir = document.getElementById("btn-inem-emitir");
      if (!dateFrom && !dateTo && !codu) {
        if (tbody) tbody.innerHTML = "";
        if (btnEmitir) btnEmitir.style.display = "none";
        return;
      }
      let query = `inem_entries?corp_oper_nr=eq.${corpOperNr}`;
      if (codu) {
        query += `&nr_codu=ilike.${codu}*`;
      } else {
        if (dateFrom) query += `&alert_date=gte.${dateFrom}`;
        if (dateTo) query += `&alert_date=lte.${dateTo}`;
      }
      query += `&order=alert_date.asc`;
      try {
        const data = await supabaseFetch(query);
        if (!tbody) return;
        tbody.innerHTML = "";
        if (btnEmitir) btnEmitir.style.display = "none";
        if (!data?.length) return;
        const COLUMNS = ["nr_codu", "alerta", "vitima", "morada", "tas", "via", "actions", "pdfstatus"];
        const totalCols = COLUMNS.length;
        data.forEach((item, i) => {
          const tr = document.createElement("tr");
          tr.style.background = i % 2 === 0 ? "#fff" : "#f5f6fa";
          COLUMNS.forEach((key, idx) => {
            const td = document.createElement("td");
            const isFirst   = idx === 0;
            const isLastCol = idx === totalCols - 1;
            Object.assign(td.style, {borderBottom: "1px solid #ddd", borderLeft: isFirst ? "none" : "1px solid #ddd", padding: "2px 6px", height: "24px", verticalAlign: "middle", 
                                     textAlign: "center", fontSize: "13px", fontWeight: "bold", userSelect: "text"});
            if (key === "nr_codu") {
              td.textContent = item.nr_codu || "";
            } else if (key === "alerta") {
              let alerta = "";
              if (item.alert_date) {
                const [y, m, d] = item.alert_date.split("-");
                alerta = `${d}/${m}/${y}`;
              }
              if (item.alert_hour) {
                alerta += (alerta ? "  " : "") + item.alert_hour.slice(0, 5);
              }
              td.textContent = alerta;
            } else if (key === "vitima") {
              const type = item.victim_type || "";
              const ageType = item.victim_age_type || "";
              const ageUnit = item.victim_age_unit || "";
              let vitima = "";
              if (type) vitima += type;
              if (ageType) vitima += (vitima ? " - " : "") + ageType;
              if (ageUnit) vitima += (vitima ? " "  : "") + ageUnit;
              td.textContent = vitima;
            } else if (key === "morada") {
              const address  = item.victim_address || "";
              const location = item.victim_location || "";
              td.textContent = [address, location].filter(Boolean).join(" - ");
            } else if (key === "tas") {
              td.textContent = item.tas || "";
            } else if (key === "via") {
              td.textContent = item.service_type || "";
            } else if (key === "actions") {
              td.classList.add("inem-actions-td");
              td.style.userSelect = "none";
              const nrCodu = item.nr_codu || "";
              const btnUp   = document.createElement("button");
              const btnDown = document.createElement("button");
              const btnView = document.createElement("button");
              btnUp.className = "btn-inem-upload";
              btnDown.className = "btn-inem-download";
              btnView.className = "btn-inem-view";
              btnUp.innerHTML = "&#8679;";
              btnDown.innerHTML = "&#8681;";
              btnView.innerHTML = "&#128269;";
              btnUp.title = "Upload PDF";
              btnDown.title = "Download PDF";
              btnView.title = "Visualizar PDF";
              btnUp.dataset.nr = nrCodu;
              btnDown.dataset.nr = nrCodu;
              btnView.dataset.nr = nrCodu;
              btnUp.addEventListener("click", () => inemUploadPdf(btnUp.dataset.nr));
              btnDown.addEventListener("click", () => inemDownloadPdf(btnDown.dataset.nr));
              btnView.addEventListener("click", () => inemViewPdf(btnView.dataset.nr));
              const gap = document.createElement("div");
              Object.assign(gap.style, {display: nrCodu ? "flex" : "none", gap: "3px", justifyContent: "center", alignItems: "center"});
              gap.append(btnUp, btnDown, btnView);
              td.appendChild(gap);
            } else if (key === "pdfstatus") {
              td.classList.add("inem-pdf-status-td");
              if (item.nr_codu) {
                td.textContent = "…";
                checkPdfExists(item.nr_codu).then(exists => {
                  td.textContent = exists ? "✅" : "❌";
                  td.style.fontSize = "17px";
                  td.title = exists ? "PDF disponível" : "PDF não encontrado";
                });
              }
            }
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        if (btnEmitir) btnEmitir.style.display = "";
      } catch(err) {
        console.error("Erro ao carregar verbetes INEM:", err);
        showPopupWarning("Erro ao carregar verbetes INEM.");
      }
    }
    /* ─── UPLOAD PDF ────────────────────────────────────────── */
    async function inemUploadPdf(nrCodu) {
      if (!nrCodu) return;
      const input = document.createElement("input");
      input.type   = "file";
      input.accept = "application/pdf";
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        const fileName = `ocr_${nrCodu}.pdf`;
        try {
          const res = await fetch(`${SUPABASE_URL}/storage/v1/object/inem-verbetes/${fileName}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/pdf",
              "x-upsert": "true"
            },
            body: file
          });
          if (!res.ok) throw new Error(await res.text());
          showPopupWarning("PDF carregado com sucesso.");
          const rows = document.querySelectorAll("#inem-entries table tbody tr");
          rows.forEach(tr => {
            const btnUp = tr.querySelector(".btn-inem-upload");
            if (btnUp?.dataset.nr === nrCodu) {
              const statusTd = tr.querySelector(".inem-pdf-status-td");
              if (statusTd) {
                statusTd.textContent = "✅";
                statusTd.style.fontSize = "17px";
                statusTd.title = "PDF disponível";
              }
            }
          });
        } catch(err) {
          console.error("Erro ao fazer upload:", err);
          showPopupWarning("Erro ao carregar o PDF.");
        }
      };
      input.click();
    }
    /* ─── DOWNLOAD PDF ──────────────────────────────────────── */
    async function inemDownloadPdf(nrCodu) {
      if (!nrCodu) return;
      const fileName = `ocr_${nrCodu}.pdf`;
      const url = `${SUPABASE_URL}/storage/v1/object/public/inem-verbetes/${fileName}`;
      try {
        const res  = await fetch(url);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(blobUrl);
      } catch(err) {
        showPopupWarning("PDF não encontrado.");
      }
    }
    /* ─── VISUALIZAR PDF (MODAL) ────────────────────────────── */
    async function inemViewPdf(nrCodu) {
      if (!nrCodu) return;
      const fileName = `ocr_${nrCodu}.pdf`;
      const url = `${SUPABASE_URL}/storage/v1/object/public/inem-verbetes/${fileName}`;
      document.getElementById("inem-pdf-modal")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "inem-pdf-modal";
      Object.assign(overlay.style, {position: "fixed", inset: "0", background: "rgba(0,0,0,0.6)", zIndex: "9999", display: "flex", alignItems: "center", justifyContent: "center"});
      const box = document.createElement("div");
      Object.assign(box.style, {background: "#fff", borderRadius: "10px", padding: "12px", width: "80vw", height: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.3)"});
      const header = document.createElement("div");
      Object.assign(header.style, {display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"});
      const headerTitle = document.createElement("span");
      headerTitle.textContent = `Verbete INEM — ${nrCodu}`;
      Object.assign(headerTitle.style, {fontFamily: "Segoe UI, sans-serif", fontWeight: "bold", fontSize: "14px", color: "#131a69"});
      const btnClose = document.createElement("button");
      btnClose.textContent = "✕";
      Object.assign(btnClose.style, {border: "none", background: "transparent", fontSize: "18px", cursor: "pointer", color: "#666", lineHeight: "1"});
      btnClose.onclick = () => overlay.remove();
      header.append(headerTitle, btnClose);
      const iframe = document.createElement("iframe");
      iframe.src = url;
      Object.assign(iframe.style, {flex: "1", border: "none", borderRadius: "6px", width: "100%"});
      box.append(header, iframe);
      overlay.appendChild(box);
      overlay.addEventListener("click", e => {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    }
    /* ─── CRIAR TABELA DE DADOS ─────────────────────────────── */
    function createInemEntriesTable() {
      const container = document.querySelector("#inem-entries .card-body");
      if (!container) return;
      container.innerHTML = "";
      const COLUMNS = [{key: "nr_codu", label: "Nr. CODU", width: "60px"}, {key: "alerta", label: "Alerta", width: "80px"}, {key: "vitima", label: "Vítima", width: "100px"},
                       {key: "morada", label: "Morada", width: "200px"}, {key: "tas", label: "TAS", width: "120px"}, {key: "via", label: "Via", width: "60px"},
                       {key: "actions", label: "Verbete", width: "90px"}, {key: "pdfstatus", label: "PDF", width: "50px"},];
      if (!document.getElementById("inem-entries-style")) {
        const style = document.createElement("style");
        style.id = "inem-entries-style";
        style.textContent = `
          #inem-entries .card-body > div::-webkit-scrollbar {display: none;}
          .btn-inem-upload, .btn-inem-download, .btn-inem-view {border: none; border-radius: 4px; width: 24px; height: 22px; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; 
                                                                justify-content: center; padding: 0; transition: opacity .15s;}
          .btn-inem-upload   {background: #c0392b; color: #fff;}
          .btn-inem-download {background: #27ae60; color: #fff;}
          .btn-inem-view     {background: #2980b9; color: #fff;}
          .btn-inem-upload:hover, .btn-inem-download:hover, .btn-inem-view:hover {opacity: .8;}
          .inem-pdf-status-td {font-size: 18px;}
        `;
        document.head.appendChild(style);
      }
      const title = document.createElement("div");
      title.textContent = "CONSULTA SAÍDAS INEM/RESERVA";
      Object.assign(title.style, {textAlign: "center", fontWeight: "bold", fontSize: "15px", fontFamily: "Segoe UI, sans-serif", color: "#131a69", marginBottom: "10px", letterSpacing: "0.5px"});
      container.appendChild(title);
      const filterWrapper = document.createElement("div");
      Object.assign(filterWrapper.style, {display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", fontFamily: "Segoe UI, sans-serif", gap: "10px"});
      function makeLabel(text) {
        const lbl = document.createElement("label");
        lbl.textContent = text;
        lbl.style.fontWeight = "bold";
        lbl.style.fontSize = "13px";
        return lbl;
      }
      function makeDate(id) {
        const input = document.createElement("input");
        input.type = "date";
        input.id = id;
        Object.assign(input.style, {padding: "5px 8px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer", fontSize: "13px"});
        return input;
      }
      function makeCoduInput() {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "inem-filter-codu";
        input.placeholder = "ex: 123...";
        Object.assign(input.style, {padding: "5px 8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px", width: "100px"});
        input.addEventListener("input", () => {
          const val = input.value.trim();
          if (!val) {
            const tbody = document.querySelector("#inem-entries table tbody");
            if (tbody) tbody.innerHTML = "";
            const btnEmitir = document.getElementById("btn-inem-emitir");
            if (btnEmitir) btnEmitir.style.display = "none";
            return;
          }
          loadInemEntries();
        });
        return input;
      }
      const coduGroup = document.createElement("div");
      Object.assign(coduGroup.style, {display: "flex", alignItems: "center", gap: "6px", flex: "1"});
      coduGroup.append(makeLabel("Nr. CODU:"), makeCoduInput());
      const datesGroup = document.createElement("div");
      Object.assign(datesGroup.style, {display: "flex", alignItems: "center", gap: "8px", flex: "1", justifyContent: "center"});
      const btnPesquisar = document.createElement("button");
      btnPesquisar.textContent = "Pesquisar";
      Object.assign(btnPesquisar.style, {padding: "5px 16px", borderRadius: "4px", border: "none", background: "#131a69", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "13px"});
      btnPesquisar.addEventListener("click", loadInemEntries);
      datesGroup.append(makeLabel("De:"), makeDate("inem-date-from"), makeLabel("Até:"), makeDate("inem-date-to"), btnPesquisar);
      const spacer = document.createElement("div");
      Object.assign(spacer.style, {flex: "1"});
      filterWrapper.append(coduGroup, datesGroup, spacer);
      container.appendChild(filterWrapper);
      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {overflowX: "auto", overflowY: "auto", width: "100%", maxHeight: "500px", scrollbarWidth: "none", msOverflowStyle: "none", borderRadius: "8px", border: "1px solid #ddd", 
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"});
      const table = document.createElement("table");
      table.style.cssText = "width: 100%; border-collapse: separate; border-spacing: 0; font-family: Segoe UI, sans-serif; font-size: 13px;";
      const thead = document.createElement("thead");
      const trHead = document.createElement("tr");
      COLUMNS.forEach((col, idx) => {
        const th = document.createElement("th");
        th.textContent = col.label;
        const isFirst = idx === 0;
        const isLast  = idx === COLUMNS.length - 1;
        Object.assign(th.style, {borderBottom: "1px solid #2a3580", borderLeft: isFirst ? "none" : "1px solid #2a3580", background: "#131a69", color: "#fff", textAlign: "center", padding: "8px 6px", 
                                 fontWeight: "bold", position: "sticky", top: "0", zIndex: "2", whiteSpace: "nowrap", fontSize: "12px", minWidth: col.width});
        if (isFirst) th.style.borderTopLeftRadius = "8px";
        if (isLast)  th.style.borderTopRightRadius = "8px";
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      wrapper.appendChild(table);
      container.appendChild(wrapper);
      const footer = document.createElement("div");
      Object.assign(footer.style, {display: "flex", justifyContent: "flex-end", marginTop: "12px"});
      const btnEmitir = document.createElement("button");
      btnEmitir.id = "btn-inem-emitir";
      btnEmitir.textContent = "📥 Emitir Registos";
      Object.assign(btnEmitir.style, {background: "#1e293b", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px", transition: "0.2s"});
      btnEmitir.style.display = "none";
      btnEmitir.addEventListener("mouseenter", () => btnEmitir.style.background = "#334155");
      btnEmitir.addEventListener("mouseleave", () => btnEmitir.style.background = "#1e293b");
      btnEmitir.addEventListener("click", () => exportInemEntries());
      footer.appendChild(btnEmitir);
      container.appendChild(footer);
    }
    document.querySelectorAll(".sidebar-menu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.page;
        if (page === "inem-entries") {
          createInemEntriesTable();
        }
      });
    });
