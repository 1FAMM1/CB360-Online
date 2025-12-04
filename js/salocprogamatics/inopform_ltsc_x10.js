    /* =======================================
    INOP CREPC
    ======================================= */
    function preselectCorpInSitopCB() {
      const current = sessionStorage.getItem("currentCorpOperNr");
      if (!current) {
        return;
      }
      const select = document.getElementById("sitop_cb");
      if (!select) {
        return;
      }
      const clean = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      for (const option of select.options) {
        const optionText = clean(option.textContent);
        if (optionText.startsWith(clean(current))) {
          option.selected = true;
          console.log("✔ Selecionado:", option.textContent);
          return;
        }
      }
    }
    /* =============== ELEMENT VARIABLES =============== */
    const NewInopBtn = document.getElementById("NewInopBtn");
    const oldInopBtn = document.querySelector(".oldinop");
    const backBtn = document.getElementById("backBtn");
    const backFromTableBtn = document.getElementById("backFromTableBtn");
    const saveBtn = document.getElementById("saveBtn");
    const actionButtons = document.getElementById("inop-action-buttons");
    const sitopContainer = document.getElementById("sitop_container");
    const inopsTableContainer = document.getElementById("inopsTableContainer");
    const inopsTableBody = document.querySelector("#inopsTable tbody");
    const sitopCbSelect = document.getElementById("sitop_cb");
    const sitopVeicSelect = document.getElementById("sitop_veíc");
    const sitopVeicRegInput = document.getElementById("sitop_veíc_registration");
    const sitopGdhInopInput = document.getElementById("sitop_gdh_inop");
    const yesCheckbox = document.getElementById("ppi_yes");
    const noCheckbox = document.getElementById("ppi_no");
    const subsYesCheckbox = document.getElementById("ppi_subs_yes");
    const subsNoCheckbox = document.getElementById("ppi_subs_no");
    /* =========== UTILITY FUNCTIONS AND UI ============ */
    function formatSITOPGDH() {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
      const month = monthNames[now.getMonth()];
      const year = String(now.getFullYear()).slice(-2);
      return `${day}${hour}${minutes}${month}${year}`;
    }

    function clearSitopForm() {
      document.querySelectorAll("#sitop_container input, #sitop_container textarea").forEach(el => el.value = "");
      document.querySelectorAll('#sitop_container input[type="checkbox"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('#sitop_container select').forEach(sel => sel.selectedIndex = 0);
      sitopContainer.removeAttribute("data-record-id");
      saveBtn.textContent = "Emitir Inoperacionalidade";
      saveBtn.classList.remove("btn-success");
      saveBtn.classList.add("btn-danger");
    }

    function toggleSitopContainer(forceClose = false) {
      const isVisible = sitopContainer.style.display === "block";
      sitopContainer.style.transition = "opacity 0.25s ease";
      if (isVisible || forceClose) {
        sitopContainer.style.opacity = "0";
        setTimeout(() => {
          sitopContainer.style.display = "none";
          clearSitopForm();
        }, 250);
      } else {
        inopsTableContainer.style.display = "none";
        sitopContainer.style.display = "block";
        sitopContainer.style.opacity = "0";
        setTimeout(() => sitopContainer.style.opacity = "1", 10);
        clearSitopForm();
      }
    }

    function handleValidateOperationality(event) {
      preselectCorpInSitopCB();
      const btn = event.target;
      const recordAttr = btn.getAttribute("data-record");
      if (!recordAttr) return console.error("Erro: Atributo data-record não encontrado.");
      const record = JSON.parse(recordAttr);
      inopsTableContainer.style.display = "none";      
      oldInopBtn.classList.remove("active");
      sitopContainer.style.display = "block";
      sitopContainer.style.opacity = "0";
      setTimeout(() => sitopContainer.style.opacity = "1", 10);
      document.querySelector("#sitop_container .card-header").textContent = "COMUNICAR OPERACIONALIDADE";
      document.getElementById("sitop_veíc").value = record.vehicle || "";
      document.getElementById("sitop_veíc_registration").value = record.registration || "";
      document.getElementById("sitop_gdh_inop").value = record.gdh_inop || "";
      document.getElementById("sitop_gdh_op").value = formatSITOPGDH();
      document.getElementById("sitop_type_failure").value = record.failure_type || "";
      document.getElementById("sitop_failure_description").value = record.failure_description || "";
      document.getElementById("sitop_optel").value = record.optel || "";
      document.getElementById("ppi_yes").checked = record.ppi_part === true;
      document.getElementById("ppi_no").checked = record.ppi_part === false;
      document.getElementById("ppi_a2").checked = record.ppi_a2 === true;
      document.getElementById("ppi_a22").checked = record.ppi_a22 === true;
      document.getElementById("ppi_airport").checked = record.ppi_airport === true;
      document.getElementById("ppi_linfer").checked = record.ppi_linfer === true;
      document.getElementById("ppi_airfield").checked = record.ppi_airfield === true;
      document.getElementById("ppi_subs_yes").checked = record.ppi_subs === true;
      document.getElementById("ppi_subs_no").checked = record.ppi_subs === false;
      NewInopBtn.classList.add("active");      
      sitopContainer.setAttribute("data-record-id", record.id);
      saveBtn.textContent = "Emitir Operacionalidade";
      saveBtn.classList.remove("btn-danger");
      saveBtn.classList.add("btn-success");
    }    
    
    async function fetchCREPCSitopRecipientsFromSupabase(corpOperNr) {
      const categories = ['crepcsitop_mail_to', 'crepcsitop_mail_cc', 'crepcsitop_mail_bcc'];
      const url = `${SUPABASE_URL}/rest/v1/mails_config` + `?category=in.(${categories.join(',')})` + `&corp_oper_nr=eq.${corpOperNr}` + `&select=category,value`;
      try {
        const response = await fetch(url, { headers: getSupabaseHeaders() });
        if (!response.ok) throw new Error("Falha ao conectar ao Supabase.");
        const data = await response.json();
        const recipients = { to: [], cc: [], bcc: [] };
        data.forEach(row => {
          const emails = row.value?.split(",")
          .map(e => e.trim())
          .filter(e => e) || [];
          if (row.category.endsWith("_to")) recipients.to = emails;
          if (row.category.endsWith("_cc")) recipients.cc = emails;
          if (row.category.endsWith("_bcc")) recipients.bcc = emails;
        });
        if (recipients.to.length === 0) recipients.to = [""];
        return recipients;
      } catch (err) {
        console.error("Erro ao buscar e-mails:", err);
        return { to: ["central0805.ahbfaro@gmail.com"], cc: [], bcc: [] };
      }
    }
    /* ================= EMISSION LOGIC ================ */
    async function emitSitop() {
      const vehicle = document.getElementById("sitop_veíc").value.trim();
      showPopupSuccess(`Estado Operacional do veículo ${vehicle} criado com sucesso. Por favor aguarde uns segundos, receberá uma nova notificação após o envio para as entidades estar concluído!`);
      const cb_type = document.getElementById("sitop_cb").value.trim();
      const registration = document.getElementById("sitop_veíc_registration").value.trim();
      const gdh_inop = document.getElementById("sitop_gdh_inop").value.trim();
      const gdh_op = document.getElementById("sitop_gdh_op").value.trim();
      const failure_type = document.getElementById("sitop_type_failure").value.trim();
      const failure_description = document.getElementById("sitop_failure_description").value.trim();
      const ppi_part = document.getElementById("ppi_yes").checked;
      const ppi_a2 = document.getElementById("ppi_a2").checked;
      const ppi_a22 = document.getElementById("ppi_a22").checked;
      const ppi_airport = document.getElementById("ppi_airport").checked;
      const ppi_linfer = document.getElementById("ppi_linfer").checked;
      const ppi_airfield = document.getElementById("ppi_airfield").checked;
      const ppi_subs = document.getElementById("ppi_subs_yes").checked;
      const optel = document.getElementById("sitop_optel").value.trim();
      const recordId = sitopContainer.getAttribute("data-record-id");
      const isUpdate = !!recordId;
      const isOperational = !!gdh_op;
      if (!vehicle || !registration || !gdh_inop) {
        alert("Por favor preencha os campos obrigatórios: Veículo, Matrícula e GDH INOP.");
        return;
      }
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {
        alert("❌ Erro: O número da corporação não foi encontrado. Por favor, faça login novamente.");
        return;
      }
      saveBtn.disabled = true;
      const data = {cb_type, vehicle, registration, gdh_inop, gdh_op: gdh_op || null, failure_type, failure_description, ppi_part, ppi_a2, ppi_a22,
                    ppi_airport, ppi_linfer, ppi_airfield, ppi_subs, optel, corp_oper_nr: corpOperNr};
      try {
        if (!isUpdate && !isOperational) {
          const check = await fetch(
            `${SUPABASE_URL}/rest/v1/sitop_vehicles?select=vehicle&vehicle=eq.${encodeURIComponent(vehicle)}&gdh_op=is.null&corp_oper_nr=eq.${corpOperNr}`, { 
              headers: getSupabaseHeaders()
            }
          );
          if (!check.ok) throw new Error("Erro ao verificar duplicado.");
          const existing = await check.json();
          if (existing.length > 0) {
            alert(`❌ O veículo ${vehicle} já se encontra INOP nesta corporação!`);
            saveBtn.disabled = false;
            return;
          }
        }
        let response;
        let supabaseAction = 'INSERIR';
        if (isUpdate) {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${recordId}`, {
              method: "PATCH",
              headers: { ...getSupabaseHeaders(), "Content-Type": "application/json"},
              body: JSON.stringify(data)
            }
          );
          supabaseAction = isOperational ? 'VALIDAR/ATUALIZAR' : 'ATUALIZAR';
        } else {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/sitop_vehicles`, {
              method: "POST",
              headers: { ...getSupabaseHeaders(), "Content-Type": "application/json" },
              body: JSON.stringify(data)
            }
          );
        }
        if (!response.ok) throw new Error("Erro ao enviar dados ao Supabase.");
        const statusRes = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicle)}`, {
            method: "PATCH",
            headers: { ...getSupabaseHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ is_inop: !isOperational })
          }
        );
        if (!statusRes.ok) console.warn("⚠️ Erro ao atualizar status do veículo.");
        const { to, cc, bcc } = await fetchCREPCSitopRecipientsFromSupabase(corpOperNr);
        const signature = getEmailSignature();
        const greeting = getGreeting();
        const commanderName = await getCommanderName(corpOperNr);
        const fullCorpText = document.getElementById("sitop_cb").value.trim();
        const corpName = fullCorpText.includes(" - ") ? fullCorpText.split(" - ").slice(1).join(" - ") : fullCorpText;
        const article = corpName.includes("Companhia") ? "da" : "do";
        const emailBodyHTML = `${greeting}<br><br>
        Encarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s o Formulário de Situação Operacional 
        do veículo ${vehicle} ${article} ${corpName}.<br><br>
        Com os melhores cumprimentos,<br><br>
        OPTEL<br>${optel}<br><br>
        <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
        Este email foi processado automaticamente por: CB360 Online<br><br>
        </span>
        ${signature}
        `;
        const emailRes = await fetch('https://cb360-mobile.vercel.app/api/sitop_covert_and_send', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({data, recipients: to, ccRecipients: cc, bccRecipients: bcc, emailSubject: `Situação Operacional do Veículo ${vehicle}`, 
                                emailBody: emailBodyHTML})});
        const result = await emailRes.json();
        showPopupSuccess(`A situação operacional do veículo ${vehicle} foi enviada para as entidades.`);
        if (isOperational && isUpdate) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${recordId}`, {
              method: 'DELETE',
              headers: getSupabaseHeaders()
            }
          );
        }
        toggleSitopContainer(true);
        NewInopBtn.classList.remove("active");
        oldInopBtn?.classList.remove("active");
      } catch (err) {
        alert(`❌ Erro: ${err.message}`);
        console.error(err);
      } finally {
        saveBtn.disabled = false;
      }
    }
    /* ================ EVENT LISTENERS ================ */
    NewInopBtn.addEventListener("click", () => {
      preselectCorpInSitopCB();
      const isActive = NewInopBtn.classList.toggle("active");
      oldInopBtn.classList.remove("active");
      if (isActive) {
        toggleSitopContainer(false);
        inopsTableContainer.style.display = "none";
        document.querySelector("#sitop_container .card-header").textContent = "INSERÇÃO DE NOVA INOPERACIONALIDADE";
        preselectCorpInSitopCB() ;
      } else {
        toggleSitopContainer(true);
      }
    });
    saveBtn.addEventListener("click", async () => await emitSitop());
    if (oldInopBtn) {  
      oldInopBtn.addEventListener("click", async () => {    
        const isActive = oldInopBtn.classList.toggle("active");
        NewInopBtn.classList.remove("active");    
        if (!isActive) {
          inopsTableContainer.style.display = "none";
          return;
        }
        sitopContainer.style.display = "none";
        inopsTableBody.innerHTML =
          "<tr><td colspan='5' style='text-align:center;'>Carregando...</td></tr>";
        try {
            const corpOperNr = sessionStorage.getItem("currentCorpOperNr");            
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/sitop_vehicles?select=*&gdh_op=is.null&corp_oper_nr=eq.${corpOperNr}`,
              { headers: getSupabaseHeaders() }
            );
          if (!res.ok) throw new Error("Erro ao buscar inoperacionalidades");
          const data = await res.json();
          inopsTableBody.innerHTML = "";
          if (data.length === 0) {
            inopsTableBody.innerHTML =
              `<tr><td colspan="6" style="text-align:center;">Não foram encontrados veículos inoperacionais.</td></tr>`;
          } else {
            data.forEach(item => {
              const tr = document.createElement("tr");
              tr.innerHTML = `
                <td style="text-align:center;">${item.vehicle || ''}</td>
                <td style="text-align:center;">${item.gdh_inop || ''}</td>
                <td style="text-align:center;">${item.failure_type || ''}</td>
                <td>${item.failure_description || ''}</td>
                <td>${item.optel || ''}</td>
                <td style="text-align:center;">
                  <button class="btn btn-danger validate-btn" 
                          data-record='${JSON.stringify(item)}'
                          style="height:30px; padding:5px 10px;">
                    Validar Operacionalidade
                  </button>
                </td>`;
              inopsTableBody.appendChild(tr);
            });
            document.querySelectorAll(".validate-btn").forEach(btn =>
              btn.addEventListener("click", handleValidateOperationality)
            );
          }    
          inopsTableContainer.style.display = "block";
        } catch (err) {
          console.error(err);
          alert("❌ Erro ao carregar inoperacionalidades: " + err.message);
        }
      });
    }
    yesCheckbox.addEventListener("change", () => { if (yesCheckbox.checked) noCheckbox.checked = false; });
    noCheckbox.addEventListener("change", () => { if (noCheckbox.checked) yesCheckbox.checked = false; });
    subsYesCheckbox.addEventListener("change", () => { if (subsYesCheckbox.checked) subsNoCheckbox.checked = false; });
    subsNoCheckbox.addEventListener("change", () => { if (subsNoCheckbox.checked) subsYesCheckbox.checked = false; });
    sitopVeicSelect.addEventListener("change", async () => {
      const selectedVehicle = sitopVeicSelect.value;
      sitopGdhInopInput.value = formatSITOPGDH();
      if (!selectedVehicle) return sitopVeicRegInput.value = "";
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle_registration&vehicle=eq.${encodeURIComponent(selectedVehicle)}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar matrícula");
        const data = await res.json();
        sitopVeicRegInput.value = data[0]?.vehicle_registration || "";
      } catch (err) {
        console.error("Erro ao carregar matrícula:", err);
        sitopVeicRegInput.value = "";
      }
    });
    /* ================== RESTART PAGE ================= */
    document.querySelector('[data-page="page-inocrepc"]').addEventListener('click', () => {
      sitopContainer.style.display = 'none';
      inopsTableContainer.style.display = 'none';
    });