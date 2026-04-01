    /* ================================
    INSERÇÃO VERBETES INEM
    ================================ */
    /* ─── LOAD ──────────────────────────────────────────── */
    async function loadInemEntries() {
      const dateFrom = document.getElementById("inem-date-from")?.value;
      const dateTo = document.getElementById("inem-date-to")?.value;
      const codu = document.getElementById("inem-filter-codu")?.value.trim();      
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const nInt = sessionStorage.getItem("n_int");
      const isReadOnly = parseInt(nInt) === 9000;
      const tbody = document.querySelector("#inem-entries table tbody");
      const btnEmitirXlsx = document.getElementById("btn-inem-emitir-xlsx");
      const btnEmitir = document.getElementById("btn-inem-emitir");
      if (!dateFrom && !dateTo && !codu) {
        if (tbody) tbody.innerHTML = "";
        if (btnEmitir) btnEmitir.style.display = "none";
        if (btnEmitirXlsx) btnEmitirXlsx.style.display = "none";
        const totalsEl = document.getElementById("inem-totals");
        if (totalsEl) totalsEl.innerHTML = `<span>TOTAL: 0</span> &nbsp;|&nbsp; <span>ITeams: 0</span> &nbsp;|&nbsp; <span>Verbete: 0</span>`;
        return;
      }
      let query = `inem_entries?corp_oper_nr=eq.${corpOperNr}`;
      if (codu) {
        query += `&nr_codu=ilike.${codu}*`;
      } else {
        if (dateFrom) query += `&alert_date=gte.${dateFrom}`;
        if (dateTo) query += `&alert_date=lte.${dateTo}`;
      }
      query += `&order=nr_codu.desc`;
      try {
        const data = await supabaseFetch(query);
        if (!tbody) return;
        tbody.innerHTML = "";
        if (btnEmitir) btnEmitir.style.display = "none";
        if (btnEmitirXlsx) btnEmitirXlsx.style.display = "none";
        if (!data?.length) return;
        const COLUMNS = ["nr_codu", "alerta", "vitima", "morada", "edit", "tas", "via", "actions", "pdfstatus"];
        const existsMap = new Map(
          await Promise.all(
            data.map(async item => {
              if (!item.nr_codu) return [item.nr_codu, false];
              const ext = item.service_type === "ITeams" ? "html" : "pdf";
              const url = `${SUPABASE_URL}/storage/v1/object/public/inem-verbetes/ocr_${item.nr_codu}.${ext}`;
              try {
                const res = await fetch(url, {method: "HEAD"});
                return [item.nr_codu, res.ok];
              } catch {
                return [item.nr_codu, false];
              }
            })
          )
        );
        data.forEach((item, i) => {
          const tr = document.createElement("tr");
          tr.style.background = i % 2 === 0 ? "#fff" : "#f5f6fa";
          COLUMNS.forEach((key, idx) => {
            const td = document.createElement("td");
            const isFirst = idx === 0;
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
              if (item.alert_hour) alerta += (alerta ? "  " : "") + item.alert_hour.slice(0, 5);
              td.textContent = alerta;
            } else if (key === "vitima") {
              const type = item.victim_type || "";
              const ageType = item.victim_age_type || "";
              const ageUnit = item.victim_age_unit || "";
              let vitima = "";
              if (type) vitima += type;
              if (ageType) vitima += (vitima ? " - " : "") + ageType;
              if (ageUnit) vitima += (vitima ? " " : "") + ageUnit;
              td.textContent = vitima;
            } else if (key === "morada") {
              const address = item.victim_address || "";
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
              const serviceType = item.service_type || "";
              const btnUp = document.createElement("button");
              const btnDown = document.createElement("button");
              const btnView = document.createElement("button");
              const btnDel = document.createElement("button");
              btnUp.className = "btn-inem-upload";
              btnDown.className = "btn-inem-download";
              btnView.className = "btn-inem-view";
              btnDel.className = "btn-inem-delete";
              btnUp.innerHTML = "&#8679;";
              btnDown.innerHTML = "&#8681;";
              btnView.innerHTML = "&#128269;";
              btnDel.innerHTML = "&#128465;";
              btnUp.title = "Upload";
              btnDown.title = "Download";
              btnView.title = "Visualizar";
              btnDel.title = "Eliminar ficheiro";
              btnUp.dataset.nr = nrCodu;
              btnDown.dataset.nr = nrCodu;
              btnView.dataset.nr = nrCodu;
              btnDel.dataset.nr = nrCodu;
              btnUp.dataset.type = serviceType;
              btnDown.dataset.type = serviceType;
              btnView.dataset.type = serviceType;
              btnDel.dataset.type = serviceType;
              btnUp.addEventListener("click", () => inemUploadPdf(btnUp.dataset.nr, btnUp.dataset.type));
              btnDown.addEventListener("click", () => inemDownloadPdf(btnDown.dataset.nr, btnDown.dataset.type));
              btnView.addEventListener("click", () => inemViewPdf(btnView.dataset.nr, btnView.dataset.type));
              btnDel.addEventListener("click", () => inemDeletePdf(btnDel.dataset.nr, btnDel.dataset.type));
              const gap = document.createElement("div");
              Object.assign(gap.style, {display: nrCodu ? "flex" : "none", gap: "3px", justifyContent: "center", alignItems: "center"});
              gap.append(btnUp, btnDown, btnView, btnDel);
              if (isReadOnly) {
                [btnDown, btnView, btnDel].forEach(btn => {
                  btn.disabled = true;
                  btn.style.opacity = "0.3";
                  btn.style.cursor = "not-allowed";
                  btn.style.pointerEvents = "none";
                });
              }
              td.appendChild(gap);
            } else if (key === "pdfstatus") {
              td.classList.add("inem-pdf-status-td");
              if (item.nr_codu) {
                const exists = existsMap.get(item.nr_codu);
                td.textContent = exists ? "✅" : "❌";
                td.style.fontSize = "17px";
                td.title = exists ? "Ficheiro disponível" : "Ficheiro não encontrado";
              }
            } else if (key === "edit") {
              td.style.userSelect = "none";
              const btnEdit = document.createElement("button");
              btnEdit.innerHTML = "✏️";
              btnEdit.title = "Editar";
              Object.assign(btnEdit.style, {border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", padding: "0", lineHeight: "1"});
              btnEdit.addEventListener("click", () => inemEditEntry(item));
              td.appendChild(btnEdit);
            }
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        const totalsEl = document.getElementById("inem-totals");
        if (totalsEl && data?.length) {
          const total   = data.length;
          const iteams  = data.filter(d => d.service_type === "ITeams").length;
          const verbete = data.filter(d => d.service_type !== "ITeams").length;
          totalsEl.innerHTML = `<span>TOTAL: ${total}</span> &nbsp;|&nbsp; <span>ITeams: ${iteams}</span> &nbsp;|&nbsp; <span>Verbete: ${verbete}</span>`;
        } else if (totalsEl) {
          totalsEl.innerHTML = `<span>TOTAL: 0</span> &nbsp;|&nbsp; <span>ITeams: 0</span> &nbsp;|&nbsp; <span>Verbete: 0</span>`;
        }
        if (btnEmitirXlsx) {
          btnEmitirXlsx.style.display = "";
          if (isReadOnly) {
            btnEmitirXlsx.disabled = true;
            btnEmitirXlsx.style.opacity = "0.3";
            btnEmitirXlsx.style.cursor = "not-allowed";
          }
        }
        if (btnEmitir) {
          btnEmitir.style.display = "";
          if (isReadOnly) {
            btnEmitir.disabled = true;
            btnEmitir.style.opacity = "0.3";
            btnEmitir.style.cursor = "not-allowed";
          }
        }
      } catch(err) {
        console.error("Erro ao carregar verbetes INEM:", err);
        showPopup('popup-danger', "Erro ao carregar verbetes INEM.");
      }
    }
    /* ─── CRIAR TABELA DE DADOS ─────────────────────────────── */
    function createInemEntriesTable() {
      const container = document.querySelector("#inem-entries .card-body");
      if (!container) return;
      container.innerHTML = "";
      const COLUMNS = [{key: "nr_codu", label: "Nr. CODU", width: "60px"}, {key: "alerta", label: "Alerta", width: "80px"}, {key: "vitima", label: "Vítima", width: "100px"},
                       {key: "morada", label: "Morada", width: "200px"}, {key: "edit", label: "Editar", width: "36px"}, {key: "tas", label: "TAS", width: "120px"}, {key: "via", label: "Via", width: "60px"},
                       {key: "actions", label: "Verbete", width: "90px"}, {key: "pdfstatus", label: "Status", width: "50px"}];
      if (!document.getElementById("inem-entries-style")) {
        const style = document.createElement("style");
        style.id = "inem-entries-style";
        style.textContent = `
          #inem-entries .card-body > div::-webkit-scrollbar {display: none;}
          .btn-inem-upload, .btn-inem-download, 
          .btn-inem-view, .btn-inem-delete {border: none; border-radius: 4px; width: 24px; height: 22px; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center;
                                            justify-content: center; padding: 0; transition: opacity .15s;}
          .btn-inem-upload {background: #c0392b; color: #fff;}
          .btn-inem-download {background: #27ae60; color: #fff;}
          .btn-inem-view {background: #2980b9; color: #fff;}
          .btn-inem-delete {background: #444; color: #fff;}
          .btn-inem-upload:hover, .btn-inem-download:hover, .btn-inem-view:hover, .btn-inem-delete:hover {opacity: .8;}
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
            const btnEmitirXlsx = document.getElementById("btn-inem-emitir-xlsx");
            if (btnEmitirXlsx) btnEmitirXlsx.style.display = "none";
            const totalsEl = document.getElementById("inem-totals");
            if (totalsEl) totalsEl.innerHTML = `<span>TOTAL: 0</span> &nbsp;|&nbsp; <span>ITeams: 0</span> &nbsp;|&nbsp; <span>Verbete: 0</span>`;
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
      const thead  = document.createElement("thead");
      const trHead = document.createElement("tr");
      const redCols = ["tas", "via", "actions", "pdfstatus"];
      COLUMNS.forEach((col, idx) => {
        const th = document.createElement("th");
        th.textContent = col.label;
        const isFirst = idx === 0;
        const isLast = idx === COLUMNS.length - 1;
        const thBg  = redCols.includes(col.key) ? "#9a1515" : "#131a69";
        const thBorder = redCols.includes(col.key) ? "#7b0000" : "#2a3580";
        Object.assign(th.style, {borderBottom: `1px solid ${thBorder}`, borderLeft: isFirst ? "none" : `1px solid ${thBorder}`, background: thBg, color: "#fff", textAlign: "center",
                                 padding: "8px 6px", fontWeight: "bold", position: "sticky", top: "0", zIndex: "2", whiteSpace: "nowrap", fontSize: "12px", minWidth: col.width});
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
      Object.assign(footer.style, {display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px"});
      const totalsEl = document.createElement("div");
      Object.assign(totalsEl.style, {fontSize: "12px", fontFamily: "Segoe UI, sans-serif", color: "#888", lineHeight: "1.6", fontWeight: "600"});
      totalsEl.id = "inem-totals";
      totalsEl.innerHTML = `<span>TOTAL: 0</span> &nbsp;|&nbsp; <span>ITeams: 0</span> &nbsp;|&nbsp; <span>Verbete: 0</span>`;
      footer.appendChild(totalsEl);
      const btnsRight = document.createElement("div");
      Object.assign(btnsRight.style, {display: "flex", gap: "8px"});
      const btnEmitirXlsx = document.createElement("button");
      btnEmitirXlsx.id = "btn-inem-emitir-xlsx";
      btnEmitirXlsx.textContent = "📊 Exportar Excel";
      Object.assign(btnEmitirXlsx.style, {background: "#059669", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "600",
                                          fontSize: "12px", transition: "0.2s"});
      btnEmitirXlsx.style.display = "none";
      btnEmitirXlsx.addEventListener("mouseenter", () => btnEmitirXlsx.style.opacity = "0.9");
      btnEmitirXlsx.addEventListener("mouseleave", () => btnEmitirXlsx.style.opacity = "1");
      btnEmitirXlsx.addEventListener("click", () => exportInemEntriesXlsx());
      const btnEmitir = document.createElement("button");
      btnEmitir.id = "btn-inem-emitir";
      btnEmitir.textContent = "📥 Emitir Mapa";
      Object.assign(btnEmitir.style, {background: "#1e293b", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", 
                                      fontSize: "12px", transition: "0.2s"});
      btnEmitir.style.display = "none";
      btnEmitir.addEventListener("mouseenter", () => btnEmitir.style.background = "#334155");
      btnEmitir.addEventListener("mouseleave", () => btnEmitir.style.background = "#1e293b");
      btnEmitir.addEventListener("click", () => exportInemEntriesPDF());
      btnsRight.append(btnEmitirXlsx, btnEmitir);
      footer.appendChild(btnsRight);
      container.appendChild(footer);
      const today = new Date().toISOString().split("T")[0];
      const dateFrom = document.getElementById("inem-date-from");
      const dateTo = document.getElementById("inem-date-to");
      if (dateFrom) dateFrom.value = today;
      if (dateTo) dateTo.value = today;
      loadInemEntries();
    }
    /* ─── EDITAR ────────────────────────────────────────── */   
    function inemEditEntry(item) {
      document.getElementById('inem-edit-modal')?.remove();
      const overlay = document.createElement('div');
      overlay.id = 'inem-edit-modal';
      Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(4px)'});
      const box = document.createElement('div');
      Object.assign(box.style, {background: '#fff', borderRadius: '12px', width: '420px', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column',
                                overflow: 'hidden', fontFamily: "'Segoe UI', sans-serif"});
      const header = document.createElement('div');
      Object.assign(header.style, {background: 'linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%)', padding: '12px 16px', display: 'flex', alignItems: 'center',
                                   justifyContent: 'space-between'});
      const headerTitle = document.createElement('div');
      Object.assign(headerTitle.style, {color: '#fff', fontWeight: '700', fontSize: '13px'});
      headerTitle.textContent = `✏️ Editar Verbete - Nr. CODU: ${item.nr_codu}`;
      const btnClose = document.createElement('button');
      btnClose.innerHTML = '✕';
      Object.assign(btnClose.style, {border: '1px solid rgba(255,80,80,0.22)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', width: '28px', height: '28px',
                                     borderRadius: '7px', cursor: 'pointer', fontSize: '14px'});
      btnClose.onclick = () => overlay.remove();
      header.append(headerTitle, btnClose);
      const body = document.createElement('div');
      Object.assign(body.style, {padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px'});
      const inputs = {};
      function makeInput(key, type, options) {
        let input;
        if (type === 'select') {
          input = document.createElement('select');
          options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if ((item[key] || '') === opt) option.selected = true;
            input.appendChild(option);
          });
        } else {
          input = document.createElement('input');
          input.type = type;
          input.value = item[key] || '';
        }
        Object.assign(input.style, {padding: '7px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', transition: 'border-color .15s',
                                    color: '#1a1a1a', background: '#fff', width: '100%', boxSizing: 'border-box'});
        input.onfocus = () => input.style.borderColor = '#7b0000';
        input.onblur  = () => input.style.borderColor = '#ddd';
        inputs[key] = input;
        return input;
      }
      function makeField(key, label, type, options) {
        const group = document.createElement('div');
        Object.assign(group.style, {display: 'flex', flexDirection: 'column', gap: '4px'});
        const lbl = document.createElement('label');
        lbl.textContent = label;
        Object.assign(lbl.style, {fontSize: '11.5px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '.4px'});
        group.append(lbl, makeInput(key, type, options));
        return group;
      }
      const row1 = document.createElement('div');
      Object.assign(row1.style, {display: 'flex', gap: '10px'});
      const coduField = makeField('nr_codu', 'Nr. CODU', 'text');
      Object.assign(coduField.style, {flex: '1'});
      const alertHourField = makeField('alert_hour', 'Hora Alerta', 'time');
      Object.assign(alertHourField.style, {flex: '1'});
      row1.append(coduField, alertHourField);
      body.appendChild(row1);
      const row2 = document.createElement('div');
      Object.assign(row2.style, {display: 'flex', gap: '10px', alignItems: 'flex-end'});
      const victimTypeField = makeField('victim_type', 'Vítima', 'select', ['Masculino', 'Feminino', 'Desconhecido']);
      Object.assign(victimTypeField.style, {flex: '1.5'});
      const ageTypeField = makeField('victim_age_type', 'Idade', 'text');
      Object.assign(ageTypeField.style, {flex: '1'});
      const ageUnitField = makeField('victim_age_unit', ' ', 'select', ['Anos', 'Meses', 'Dias']);
      Object.assign(ageUnitField.style, {flex: '1'});
      row2.append(victimTypeField, ageTypeField, ageUnitField);
      body.appendChild(row2);
      body.appendChild(makeField('victim_address', 'Morada', 'text'));
      body.appendChild(makeField('victim_location', 'Localidade', 'text'));
      const footer = document.createElement('div');
      Object.assign(footer.style, {padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #eee', background: '#fafafa'});
      const btnCancel = document.createElement('button');
      btnCancel.textContent = 'Cancelar';
      Object.assign(btnCancel.style, {padding: '7px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', color: '#555', fontSize: '13px', fontWeight: '600', 
                                      cursor: 'pointer'});
      btnCancel.onclick = () => overlay.remove();
      const btnSave = document.createElement('button');
      btnSave.textContent = '💾 Guardar';
      Object.assign(btnSave.style, {padding: '7px 16px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #7b0000, #9a0f0f)', color: '#fff', fontSize: '13px',
                                    fontWeight: '600', cursor: 'pointer'});
      btnSave.onclick = async () => {
        const updated = {};
        const FIELDS = [{key: 'nr_codu'}, {key: 'alert_hour'}, {key: 'victim_type'}, {key: 'victim_address'}, {key: 'victim_location'}, {key: 'victim_age_type'}, {key: 'victim_age_unit'}];
        FIELDS.forEach(f => {
          updated[f.key] = inputs[f.key].value.trim() || null;
        });
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_entries?nr_codu=eq.${item.nr_codu}`, {
            method: "PATCH",
            headers: {...getSupabaseHeaders(), "Content-Type":"application/json", "Prefer":"return=minimal"},
            body: JSON.stringify(updated)
          });
          if (!res.ok) throw new Error(await res.text());
          showPopup('popup-success', 'Verbete atualizado com sucesso.');
          overlay.remove();
          loadInemEntries();
        } catch(err) {
          console.error('Erro ao guardar:', err);
          showPopup('popup-danger', 'Erro ao guardar as alterações.');
        }
      };
      footer.append(btnCancel, btnSave);
      box.append(header, body, footer);
      overlay.appendChild(box);
      overlay.addEventListener('click', e => {if (e.target === overlay) overlay.remove();});
      document.body.appendChild(overlay);
    }
    /* ─── UPLOAD ────────────────────────────────────────── */
    async function inemUploadPdf(nrCodu, serviceType) {
      if (!nrCodu) return;
      const isHtml = serviceType === "ITeams";
      const ext = isHtml ? "html" : "pdf";
      const mime = isHtml ? "text/html" : "application/pdf";
      const input = document.createElement("input");
      input.type = "file";
      input.accept = isHtml ? "text/html" : "application/pdf";
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        const fileName = `ocr_${nrCodu}.${ext}`;
        try {
          const res = await fetch(`${SUPABASE_URL}/storage/v1/object/inem-verbetes/${fileName}`, {
            method: "POST",
            headers: {"Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": mime, "x-upsert": "true"},
            body: file
          });
          if (!res.ok) throw new Error(await res.text());
          showPopup('popup-success', `Verbete para a ocorrência <b>${nrCodu}</b> carregado com sucesso.`);
          document.querySelectorAll("#inem-entries table tbody tr").forEach(tr => {
            const btnUp = tr.querySelector(".btn-inem-upload");
            if (btnUp?.dataset.nr === nrCodu) {
              const statusTd = tr.querySelector(".inem-pdf-status-td");
              if (statusTd) {
                statusTd.textContent = "✅";
                statusTd.style.fontSize = "17px";
                statusTd.title = "Verbete disponível";
              }
            }
          });
        } catch(err) {
          console.error("Erro ao fazer upload:", err);
          showPopup('popup-danger', "Erro ao carregar o verbete.");
        }
      };
      input.click();
    }
    /* ─── DOWNLOAD ──────────────────────────────────────── */
    async function inemDownloadPdf(nrCodu, serviceType) {
      if (!nrCodu) return;
      const ext = serviceType === "ITeams" ? "html" : "pdf";
      const fileName = `ocr_${nrCodu}.${ext}`;
      const url = `${SUPABASE_URL}/storage/v1/object/public/inem-verbetes/${fileName}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(blobUrl);
      } catch(err) {
        showPopup('popup-danger', "Verbete não encontrado.");
      }
    }
    /* ─── VISUALIZAR ────────────────────────────────────── */
    const INEM_LOGO   = "https://rjkbodfqsvckvnhjwmhg.supabase.co/storage/v1/object/public/cb_logos/INEM_logo.png";
    const ITEAMS_LOGO = "https://rjkbodfqsvckvnhjwmhg.supabase.co/storage/v1/object/public/cb_logos/ITEAMS.png";
    const INEM_MODAL_STYLES = `
      @keyframes inemFadeIn {from {opacity: 0;} to {opacity: 1;}}
      @keyframes inemSlideUp {from {opacity: 0; transform: translateY(28px) scale(0.96);} to {opacity: 1; transform: translateY(0) scale(1);}}
      @keyframes inemSpin {to {transform: rotate(360deg);}}
      #inem-pdf-modal {animation: inemFadeIn .22s ease;}
      #inem-pdf-modal .inem-box {animation: inemSlideUp .28s cubic-bezier(.22,.68,0,1.2);}
      .inem-spinner {width: 36px; height: 36px; border: 3px solid #f0e8e8; border-top-color: #8b0000; border-radius: 50%; animation: inemSpin .75s linear infinite;}
      .inem-btn {border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); width: 30px; height: 30px; border-radius: 7px; cursor: pointer;
                 font-size: 14px; display: inline-flex; align-items: center; justify-content: center;  transition: background .15s, border-color .15s, transform .1s;}
      .inem-btn:hover  {background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.25); color: #fff;}
      .inem-btn:active {transform: scale(.91);}
      .inem-btn.inem-close-btn {border-color: rgba(255,80,80,0.22);}
      .inem-btn.inem-close-btn:hover {background: rgba(180,0,0,0.4); border-color: rgba(255,80,80,0.5);}
      .inem-print-btn {border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.92); padding: 6px 14px; border-radius: 7px; cursor: pointer;
                       font-size: 12.5px; font-weight: 600; font-family: 'Segoe UI', sans-serif; letter-spacing: .3px; display: inline-flex; align-items: center; gap: 6px;
                       transition: background .15s, border-color .15s, transform .1s;}
      .inem-print-btn:hover {background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.38);}
      .inem-print-btn:active {transform: scale(.96);}
      .inem-header {background: linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%); padding: 11px 14px; display: flex; align-items: center; justify-content: space-between;
                    gap: 10px; flex-shrink: 0; border-bottom: 1px solid rgba(0,0,0,0.2); position: relative;}
      .inem-header::before {content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%); pointer-events: none;}
      .inem-footer {background: linear-gradient(135deg, #5a0000 0%, #7b0000 100%); padding: 9px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    flex-shrink: 0; border-top: 1px solid rgba(0,0,0,0.15); position: relative;}
      .inem-footer::before {content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%); pointer-events: none;}
      .inem-logo-box {width: 34px; height: 34px; border-radius: 6px; overflow: hidden; flex-shrink: 0;}
      .inem-logo-box img {width: 100%; height: 100%; object-fit: cover;}
      .inem-logo-iteams {height: 22px; flex-shrink: 0; opacity: .85;}
      .inem-logo-iteams img {height: 100%; width: auto; object-fit: contain; filter: brightness(0) invert(1);}
      .inem-sep {width: 1px; height: 28px; background: rgba(255,255,255,0.18); flex-shrink: 0;}
      .inem-title-main {color: #fff; font-weight: 700; font-size: 13px; font-family: 'Segoe UI', sans-serif; letter-spacing: .1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
      .inem-title-sub {color: rgba(255,255,255,0.42); font-size: 10.5px; font-family: 'Segoe UI', sans-serif; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
      .inem-badge {background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700; 
                   font-family: 'Segoe UI', sans-serif; color: rgba(255,255,255,0.85); letter-spacing: .7px; text-transform: uppercase; flex-shrink: 0;}
      .inem-footer-info {color: rgba(255,255,255,0.38); font-size: 10.5px; font-family: 'Segoe UI', sans-serif; letter-spacing: .2px; position: relative; z-index: 1;}      
    `;
    function _inemInjectStyles() {
      if (document.getElementById('inem-modal-style')) return;
      const style = document.createElement('style');
      style.id = 'inem-modal-style';
      style.textContent = INEM_MODAL_STYLES;
      document.head.appendChild(style);
    }
    function _inemCloseModal(overlay, box) {
      box.style.animation = 'inemSlideUp .18s ease reverse forwards';
      overlay.style.animation = 'inemFadeIn .18s ease reverse forwards';
      setTimeout(() => overlay.remove(), 180);
    }
    function _inemBuildHeader(nrCodu, serviceType, ext, box, overlay) {
      const header = document.createElement('div');
      header.className = 'inem-header';
      const left = document.createElement('div');
      Object.assign(left.style, {display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '0', position: 'relative', zIndex: '1'});
      const logoInem = document.createElement('div');
      logoInem.className = 'inem-logo-box';
      const imgInem = document.createElement('img');
      imgInem.src = INEM_LOGO;
      imgInem.alt = 'INEM';
      logoInem.appendChild(imgInem);
      const sep1 = document.createElement('div');
      sep1.className = 'inem-sep';
      left.append(logoInem, sep1);
      if (serviceType === 'ITeams') {
        const logoIt = document.createElement('div');
        logoIt.className = 'inem-logo-iteams';
        const imgIt = document.createElement('img');
        imgIt.src = ITEAMS_LOGO;
        imgIt.alt = 'iTeams';
        logoIt.appendChild(imgIt);
        const sep2 = document.createElement('div');
        sep2.className = 'inem-sep';
        left.append(logoIt, sep2);
      }
      const titleWrap = document.createElement('div');
      titleWrap.style.cssText = 'min-width:0';
      const titleRow = document.createElement('div');
      Object.assign(titleRow.style, {display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px'});
      const titleMain = document.createElement('div');
      titleMain.className = 'inem-title-main';
      titleMain.textContent = serviceType === 'ITeams' ? `Verbete ITeams - ${nrCodu}` : `Verbete INEM - ${nrCodu}`;
      const badge = document.createElement('span');
      badge.className = 'inem-badge';
      badge.textContent = ext.toUpperCase();
      const titleSub = document.createElement('div');
      titleSub.className = 'inem-title-sub';
      titleSub.textContent = `Via ${serviceType} · ocr_${nrCodu}.${ext}`;
      titleRow.append(titleMain, badge);
      titleWrap.append(titleRow, titleSub);
      left.appendChild(titleWrap);
      const toolbar = document.createElement('div');
      Object.assign(toolbar.style, {display: 'flex', alignItems: 'center', gap: '5px', position: 'relative', zIndex: '1'});
      let isFs = false;
      const btnFs = document.createElement('button');
      btnFs.className = 'inem-btn';
      btnFs.innerHTML = '⛶';
      btnFs.title = 'Ecrã inteiro';
      btnFs.onclick = () => {
        isFs = !isFs;
        Object.assign(box.style, {width: isFs ? '100vw' : '82vw', height: isFs ? '100vh' : '90vh', borderRadius: isFs ? '0' : '14px',});
        btnFs.innerHTML = isFs ? '⊡' : '⛶';
      };
      const btnClose = document.createElement('button');
      btnClose.className = 'inem-btn inem-close-btn';
      btnClose.innerHTML = '✕';
      btnClose.title = 'Fechar';
      btnClose.style.fontSize = '15px';
      btnClose.onclick = () => _inemCloseModal(overlay, box);
      toolbar.append(btnFs, btnClose);
      header.append(left, toolbar);
      return { header, btnClose };
    }
    function _inemBuildContent(url, ext) {
      const content = document.createElement('div');
      Object.assign(content.style, {flex: '1', position: 'relative', overflow: 'hidden', background: '#fff'});
      const loadingEl = document.createElement('div');
      Object.assign(loadingEl.style, {position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', background: '#fff', zIndex: '2'});
      const spinner = document.createElement('div');
      spinner.className = 'inem-spinner';
      const loadingText = document.createElement('div');
      loadingText.textContent = 'A carregar ficheiro…';
      Object.assign(loadingText.style, {color: '#9ca3af', fontSize: '12.5px', fontFamily: "'Segoe UI', sans-serif"});
      loadingEl.append(spinner, loadingText);
      function showNotFound() {
        loadingEl.innerHTML = '';
        const icon = document.createElement('div');
        icon.textContent = '📄';
        Object.assign(icon.style, {fontSize: '48px', opacity: '0.4'});
        const msg = document.createElement('div');
        msg.textContent = 'Verbete Indisponível.';
        Object.assign(msg.style, {color: '#6b7280', fontSize: '15px', fontWeight: '600', fontFamily: "'Segoe UI', sans-serif"});
        const sub = document.createElement('div');
        sub.textContent = 'Ainda não foi carregado nenhum verbete para esta ocorrência.';
        Object.assign(sub.style, {color: '#9ca3af', fontSize: '12.5px', fontFamily: "'Segoe UI', sans-serif"});
        loadingEl.append(icon, msg, sub);
      }
      const iframe = document.createElement('iframe');
      Object.assign(iframe.style, {position: 'absolute', inset: '0', width: '100%', height: '100%', border: 'none', opacity: '0', transition: 'opacity .3s'});
      const revealIframe = () => {
        loadingEl.style.display = 'none';
        iframe.style.opacity = '1';
      };
      if (ext === 'html') {
        fetch(url)
          .then(r => {if (!r.ok) throw new Error(); return r.arrayBuffer();})
          .then(buf => new TextDecoder('windows-1252').decode(buf))
          .then(html => {
          iframe.onload = revealIframe;
          const scrollbarCSS = `<style>::-webkit-scrollbar {width: 10px; height: 6px;} ::-webkit-scrollbar-track {background: #1a0000;}
                                       ::-webkit-scrollbar-thumb {background: #7b0000; border-radius: 10px;} ::-webkit-scrollbar-thumb:hover {background: #9a0f0f;}</style>`;
          iframe.srcdoc = scrollbarCSS + html
            .replace(/window\.print\s*\(\s*\)/g, 'void 0')
            .replace(/onload\s*=\s*["']?print\s*\(\s*\)["']?/gi, '');
        })
          .catch(() => showNotFound());
      } else {
        fetch(url, {method: 'HEAD'})
          .then(r => {if (!r.ok) throw new Error();})
          .then(() => {
          iframe.src = url;
          iframe.onload = revealIframe;
        })
          .catch(() => showNotFound());
      }
      content.append(loadingEl, iframe);
      return {content, iframe};
    }
    function _inemBuildFooter(ext, iframe) {
      const footer = document.createElement('div');
      footer.className = 'inem-footer';
      const info = document.createElement('div');
      info.className = 'inem-footer-info';
      info.textContent = 'INEM · Instituto Nacional de Emergência Médica';
      footer.appendChild(info);
      if (ext === 'html') {
        const btnPrint = document.createElement('button');
        btnPrint.className = 'inem-print-btn';
        btnPrint.innerHTML = '🖨️ Imprimir';
        btnPrint.title = 'Imprimir verbete';
        btnPrint.style.position = 'relative';
        btnPrint.style.zIndex = '1';
        btnPrint.onclick = () => {
          try {iframe.contentWindow.print();} catch {window.print();}
        };
        footer.appendChild(btnPrint);
      }
      return footer;
    }
    async function inemViewPdf(nrCodu, serviceType) {
      if (!nrCodu) return;
      const ext = serviceType === 'ITeams' ? 'html' : 'pdf';
      const fileName = `ocr_${nrCodu}.${ext}`;
      const url = `${SUPABASE_URL}/storage/v1/object/public/inem-verbetes/${fileName}`;
      document.getElementById('inem-pdf-modal')?.remove();
      _inemInjectStyles();
      const overlay = document.createElement('div');
      overlay.id = 'inem-pdf-modal';
      Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',});
      const box = document.createElement('div');
      box.className = 'inem-box';
      Object.assign(box.style, {background: '#f8f8f8', borderRadius: '14px', width: '82vw', height: '90vh', display: 'flex', flexDirection: 'column', 
                                boxShadow: '0 28px 72px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.18)', overflow: 'hidden',});
      const {header, btnClose} = _inemBuildHeader(nrCodu, serviceType, ext, box, overlay);
      const {content, iframe} = _inemBuildContent(url, ext);
      const footer = _inemBuildFooter(ext, iframe);
      box.append(header, content, footer);
      overlay.appendChild(box);
      overlay.addEventListener('click', e => {if (e.target === overlay) _inemCloseModal(overlay, box);});
      const onKeyDown = e => {
        if (e.key === 'Escape') {_inemCloseModal(overlay, box); document.removeEventListener('keydown', onKeyDown);}
      };
      document.addEventListener('keydown', onKeyDown);
      document.body.appendChild(overlay);
    }
    /* ─── ELIMINAR ──────────────────────────────────────── */
    async function inemDeletePdf(nrCodu, serviceType) {
      if (!nrCodu) return;
      const ext = serviceType === "ITeams" ? "html" : "pdf";
      const fileName = `ocr_${nrCodu}.${ext}`;
      const confirmed = await new Promise(resolve => {
        document.getElementById('inem-confirm-modal')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'inem-confirm-modal';
        Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '10001', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                      backdropFilter: 'blur(4px)'});
        const box = document.createElement('div');
        Object.assign(box.style, {background: '#fff', borderRadius: '12px', width: '360px', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', overflow: 'hidden', 
                                  fontFamily: "'Segoe UI', sans-serif"});
        const header = document.createElement('div');
        Object.assign(header.style, {background: 'linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px'});
        const headerTitle = document.createElement('div');
        Object.assign(headerTitle.style, {color: '#fff', fontWeight: '700', fontSize: '13px'});
        headerTitle.textContent = '🗑️ Eliminar Verbete';
        header.appendChild(headerTitle);
        const body = document.createElement('div');
        Object.assign(body.style, {padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px'});
        const msg = document.createElement('div');
        Object.assign(msg.style, {fontSize: '13px', color: '#333'});
        msg.textContent = 'Tem a certeza que pretende eliminar o verbete:';
        const fileNameEl = document.createElement('div');
        Object.assign(fileNameEl.style, {fontSize: '13px', fontWeight: '700', color: '#7b0000', background: '#fff5f5', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca'});
        fileNameEl.textContent = fileName;
        body.append(msg, fileNameEl);
        const footer = document.createElement('div');
        Object.assign(footer.style, {padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #eee', background: '#fafafa'});
        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancelar';
        Object.assign(btnCancel.style, {padding: '7px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', color: '#555', fontSize: '13px', fontWeight: '600', cursor: 'pointer'});
        const btnConfirm = document.createElement('button');
        btnConfirm.textContent = '🗑️ Eliminar';
        Object.assign(btnConfirm.style, {padding: '7px 16px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #7b0000, #9a0f0f)', color: '#fff', fontSize: '13px', 
                                         fontWeight: '600', cursor: 'pointer'});
        btnCancel.onclick  = () => {overlay.remove(); resolve(false);};
        btnConfirm.onclick = () => {overlay.remove(); resolve(true);};
        overlay.addEventListener('click', e => { if (e.target === overlay) {overlay.remove(); resolve(false);}});
        footer.append(btnCancel, btnConfirm);
        box.append(header, body, footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
      });
      if (!confirmed) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/inem-verbetes/${fileName}`, {
          method: "DELETE",
          headers: {"Authorization": `Bearer ${SUPABASE_ANON_KEY}`}
        });
        if (!res.ok) throw new Error(await res.text());
        showPopup('popup-success', "Verbete eliminado com sucesso.");
        document.querySelectorAll("#inem-entries table tbody tr").forEach(tr => {
          const btnDel = tr.querySelector(".btn-inem-delete");
          if (btnDel?.dataset.nr === nrCodu) {
            const statusTd = tr.querySelector(".inem-pdf-status-td");
            if (statusTd) {
              statusTd.textContent = "❌";
              statusTd.style.fontSize = "17px";
              statusTd.title = "Ficheiro não encontrado";
            }
          }
        });
      } catch(err) {
        console.error("Erro ao eliminar:", err);
        showPopup('popup-danger', "Erro ao eliminar o verbete.");
      }
    }
    /* ─── EXPORT XLSX ───────────────────────────────────── */
    async function exportInemEntriesXlsx() {
      const rows = _buildInemExportRows();
      if (!rows.length) return showPopupWarning("Sem dados para exportar.");
      const btnXlsx = document.getElementById("btn-inem-emitir-xlsx");
      const originalText = btnXlsx.textContent;
      btnXlsx.textContent = "⏳ A Exportar...";
      btnXlsx.disabled = true;
      showLoadingPopup("🔄 A iniciar exportação XLSX...");
      try {
        const res = await fetch("https://cb360-online.vercel.app/api/inem-entries", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({rows, format: "xlsx", dateFrom: document.getElementById("inem-date-from")?.value, dateTo: document.getElementById("inem-date-to")?.value})
        });
        if (!res.ok) throw new Error(await res.text());
        updateLoadingPopup("💾 A gerar ficheiro XLSX...");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const dateFrom = document.getElementById("inem-date-from")?.value || "";
        const dateTo = document.getElementById("inem-date-to")?.value || "";
        function fmtFile(d) {if (!d) return ""; const [y,m,dd] = d.split("-"); return `${dd}-${m}-${y}`;}
        const sufix = dateFrom === dateTo || !dateTo ? fmtFile(dateFrom) : `${fmtFile(dateFrom)}_a_${fmtFile(dateTo)}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = `inem_entries_${sufix}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        updateLoadingPopup("✅ Exportação concluída!");
        showPopup('popup-info', `Mapa serviços INEM\Reserva gerado com sucesso.`);
      } catch (err) {
        console.error("Erro ao exportar XLSX:", err);
        showPopup('popup-danger', "Erro ao exportar XLSX.");
        updateLoadingPopup("❌ Erro durante a exportação.");
      } finally {
        hideLoadingPopup();
        btnXlsx.textContent = originalText;
        btnXlsx.disabled = false;
      }
    }
    /* ─── EXPORT PDF ────────────────────────────────────── */
    async function exportInemEntriesPDF() {
      const rows = _buildInemExportRows();
      if (!rows.length) return showPopupWarning("Sem dados para exportar.");
      const btnPdf = document.getElementById("btn-inem-emitir");
      const originalText = btnPdf.textContent;
      btnPdf.textContent = "⏳ A Gerar Mapa...";
      btnPdf.disabled = true;
      showLoadingPopup("🔄 A iniciar exportação PDF...");
      try {
        const res = await fetch("https://cb360-online.vercel.app/api/inem-entries", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({rows, format: "pdf", dateFrom: document.getElementById("inem-date-from")?.value, dateTo: document.getElementById("inem-date-to")?.value})
        });
        if (!res.ok) throw new Error(await res.text());
        updateLoadingPopup("💾 A gerar ficheiro PDF...");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const dateFrom = document.getElementById("inem-date-from")?.value || "";
        const dateTo = document.getElementById("inem-date-to")?.value || "";
        function fmtFile(d) {if (!d) return ""; const [y,m,dd] = d.split("-"); return `${dd}-${m}-${y}`;}
        const sufix = dateFrom === dateTo || !dateTo ? fmtFile(dateFrom) : `${fmtFile(dateFrom)}_a_${fmtFile(dateTo)}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = `inem_entries_${sufix}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        updateLoadingPopup("✅ Exportação concluída!");
        showPopup('popup-info', `Mapa serviços INEM\Reserva gerado com sucesso.`);
      } catch (err) {
        console.error("Erro ao exportar PDF:", err);
        showPopup('popup-danger', "Erro ao exportar PDF.");
        updateLoadingPopup("❌ Erro durante a exportação.");
      } finally {
        hideLoadingPopup();
        btnPdf.textContent = originalText;
        btnPdf.disabled = false;
      }
    }
    /* ─── HELPER: BUILD ROWS ────────────────────────────── */
    function _buildInemExportRows() {
      const rows = [];
      document.querySelectorAll("#inem-entries table tbody tr").forEach(tr => {
        const tds = tr.querySelectorAll("td");
        const nrCodu = tds[0]?.textContent.trim();
        if (!nrCodu) return;
        const alertaRaw = tds[1]?.textContent.trim() || "";
        const alertaParts = alertaRaw.split(/\s+/);
        let alert_date = "", alert_hour = "";
        if (alertaParts[0]) {
          const [d, m, y] = alertaParts[0].split("/");
          alert_date = `${y}-${m}-${d}`;
        }
        if (alertaParts[1]) alert_hour = alertaParts[1];
        const vit = tds[2]?.textContent.trim() || "";
        const vitParts = vit.split(" - ");
        const victim_type = vitParts[0] || "";
        const ageRaw = vitParts[1] || "";
        const ageMatch = ageRaw.match(/^(\d+)\s*(.*)$/);
        const victim_age_type = ageMatch ? ageMatch[1] : ageRaw;
        const victim_age_unit = ageMatch ? ageMatch[2].trim() : "";
        const moradaRaw = tds[3]?.textContent.trim() || "";
        const moradaParts = moradaRaw.split(" - ");
        const victim_address = moradaParts[0] || "";
        const victim_location = moradaParts.slice(1).join(" - ") || "";
        rows.push({nr_codu: nrCodu, alert_date, alert_hour, victim_type, victim_age_type, victim_age_unit, victim_address, victim_location,
                   tas: tds[5]?.textContent.trim() || "", service_type: tds[6]?.textContent.trim() || ""});});
      return rows;
    }
    /* ─── INICIALIZAÇÃO ─────────────────────────────────── */
    document.querySelectorAll(".sidebar-menu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.page;
        if (page === "inem-entries") createInemEntriesTable();
      });
    });
