    /* =======================================
    DAILY PLANNING
    ======================================= */
    const tableConfig = [{rows: 1, special: false, title: "OFOPE"}, {rows: 1, special: false, title: "CHEFE DE SERVIÇO"}, {rows: 1, special: false, title: "OPTEL"},
                         {rows: 5, special: true, title: "EQUIPA 01"}, {rows: 5, special: false, title: "EQUIPA 02"}, {rows: 2, special: false, title: "LOGÍSTICA"},
                         {rows: 3, special: false, title: "INEM"}, {rows: 3, special: false, title: "INEM - Reserva"}, {rows: 10, special: false, title: "SERVIÇO GERAL"}];
    function createInputCell({type = 'text', readonly = false, className = '',tabindex = 0}) {
      return `<td><input type="${type}" class="${className}" ${readonly ? 'readonly' : ''} tabindex="${tabindex}"></td>`;
    }    
    function calculateWorkHours(checkIn, checkOut, shift) {
      if (!checkIn || !checkOut) return 0;
      const [checkInH, checkInM] = checkIn.split(':').map(Number);
      const [checkOutH, checkOutM] = checkOut.split(':').map(Number);
      let checkInMinutes = checkInH * 60 + checkInM;
      let checkOutMinutes = checkOutH * 60 + checkOutM;
      if (shift === 'N' && checkOutMinutes < checkInMinutes) {
        checkOutMinutes += 1440;
      }
      const diffMinutes = checkOutMinutes - checkInMinutes;
      const hours = diffMinutes / 60;
      return Math.round(hours * 100) / 100;
    }
    function normalizeText(text) {
      if (!text) return '';
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    function hasOnCallStatus(obs) {
      if (!obs) return false;
      const normalized = normalizeText(obs);
      return /piq(uete|te|u)?/i.test(normalized);
    }
    function hasAbsenceStatus(obs) {
      if (!obs) return false;
      const normalized = normalizeText(obs);
      return /falt(a|as|a\s)?/i.test(normalized);
    }
    function hasReinforcementStatus(obs) {
      if (!obs) return false;
      const normalized = normalizeText(obs);
      return /refor(c|ç)o(s)?|ref\b/i.test(normalized);
    }
    async function saveAttendance(tables, shift, corpOperNr, day, month, year) {
      const recordsMap = new Map();
      const now = new Date();
      const currentDay = day ?? String(now.getDate()).padStart(2, "0");
      const currentMonth = month ?? String(now.getMonth() + 1).padStart(2, "0");
      const currentYear = year ?? String(now.getFullYear());
      for (const table of tables) {
        for (const row of table.rows) {
          const nInt = row.n_int?.trim();
          const checkIn = row.entrada?.trim();
          const checkOut = row.saida?.trim();
          const rawObs = (row.obs || "").trim();
          const obs = rawObs.toLowerCase();
          if (!nInt) continue;
          let recordType = "";
          let totalHours = "0";
          const isAbsent = hasAbsenceStatus(obs);
          const isOnCall = hasOnCallStatus(obs);
          const isReinforcement = hasReinforcementStatus(obs);
          const isSickLeave = obs.includes("baixa");
          const isLicence = obs.includes("licença") || obs.includes("licenca");
          const isDispense = obs.includes("dispensa");
          if (isSickLeave) recordType = "Baixa";
          else if (isLicence) recordType = "Licença";
          else if (isDispense) recordType = "Dispensa";
          else if (isAbsent) recordType = "Falta";
          else if (isOnCall) recordType = "Piquete";
          else if (isReinforcement) recordType = "Reforço";
          else continue;
          if ((recordType === "Piquete" || recordType === "Reforço") && checkIn && checkOut) {
            totalHours = String(calculateWorkHours(checkIn, checkOut, shift));
          }
          const key = `${nInt}_${currentDay}_${currentMonth}_${currentYear}_${corpOperNr}_${shift}_${recordType}`;
          if (recordsMap.has(key)) continue;
          recordsMap.set(key, {n_int: String(nInt), day: String(currentDay), month: String(currentMonth), year: String(currentYear), shift: String(shift), shift_type: String(recordType),
                               qtd_hours: String(totalHours), observ: rawObs, corp_oper_nr: String(corpOperNr),});}}
      const attendanceRecords = Array.from(recordsMap.values());
      try {
        const delUrl = `${SUPABASE_URL}/rest/v1/reg_assid` + `?corp_oper_nr=eq.${encodeURIComponent(String(corpOperNr))}` + `&day=eq.${encodeURIComponent(String(currentDay))}` +
                       `&month=eq.${encodeURIComponent(String(currentMonth))}` + `&year=eq.${encodeURIComponent(String(currentYear))}` + `&shift=eq.${encodeURIComponent(String(shift))}`;
        const delRes = await fetch(delUrl, {
          method: "DELETE",
          headers: getSupabaseHeaders(),
        });
        if (!delRes.ok) {
          const t = await delRes.text();
          throw new Error(`Erro a limpar reg_assid (${delRes.status}): ${t}`);
        }
        if (attendanceRecords.length === 0) return true;
        const insUrl = `${SUPABASE_URL}/rest/v1/reg_assid` + `?on_conflict=corp_oper_nr,n_int,year,month,day,shift,shift_type`;
        const insRes = await fetch(insUrl, {
          method: "POST",
          headers: {
            ...getSupabaseHeaders(),
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
          },
          body: JSON.stringify(attendanceRecords),
        });
        if (!insRes.ok) {
          const t = await insRes.text();
          throw new Error(`Erro a gravar reg_assid (${insRes.status}): ${t}`);
        }
        return true;
      } catch (err) {
        console.error("❌ Erro em saveAttendance:", err);
        showPopup('popup-danger', "O planeamento foi enviado, mas houve um erro ao registar as faltas/piquetes no sistema central.");
        return false;
      }
    }
    async function saveEligibility(tables, day, month, year, corpOperNr) {
      const eligibilityRecords = [];
      const fDay = String(day).padStart(2, '0');
      const fMonth = String(month).padStart(2, '0');
      const fYear = String(year);
      for (const table of tables) {
        const title = table.title.trim().toUpperCase();
        const isSpecialTeam = (title === "INEM" || title === "OPTEL");
        for (const row of table.rows) {
          const obs = (row.obs || "").toString().toLowerCase().trim();
          const nInt = (row.n_int || "").toString().trim();
          const entranceHour = (row.entrada || "").toString().trim();
          const exitHour = (row.saida || "").toString().trim();
          const abvName = (row.nome || "").toString().trim();
          if (!nInt || !obs.includes("profissional")) continue;
          let shouldSave = false;
          const hourParts = entranceHour.split(':');
          if (hourParts.length >= 1) {
            const hourNum = parseInt(hourParts[0], 10);
            if (!isNaN(hourNum) && hourNum >= 0 && hourNum <= 6) {
              shouldSave = true;
            }
          }
          if (isSpecialTeam && entranceHour.startsWith("20:") && exitHour === "08:00") {
            shouldSave = true;
          }
          if (shouldSave) {
            eligibilityRecords.push({n_int: nInt, abv_name: abvName, day: fDay, month: fMonth, year: fYear, exit_hour: entranceHour, corp_oper_nr: String(corpOperNr)});
          }
        }
      }
      if (eligibilityRecords.length === 0) return true;
      try {
        const nIntList = eligibilityRecords.map(r => r.n_int).join(',');
        const delUrl = `${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}&day=eq.${fDay}&month=eq.${fMonth}&year=eq.${fYear}&n_int=in.(${nIntList})`;
        await fetch(delUrl, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        const insUrl = `${SUPABASE_URL}/rest/v1/reg_eligibility`;
        const res = await fetch(insUrl, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
          body: JSON.stringify(eligibilityRecords)
        });
        if (res.ok) console.log(`✅ Registo concluído: ${eligibilityRecords.length} operacionais elegíveis.`);
        return res.ok;
      } catch (err) {
        console.error("❌ Erro em saveEligibility:", err);
        return false;
      }
    }
    function createTable(rows, isSpecial, title) {
      const specialClass = isSpecial ? ' special' : '';
      const rowsHTML = Array(rows).fill().map(() => `
        <tr>
          ${createInputCell({ className: 'plandir-nint-input' })}
          ${createInputCell({ className: 'plandir-readonly-field', readonly: true, tabindex: -1 })}
          ${createInputCell({ className: 'plandir-readonly-field', readonly: true, tabindex: -1 })}
          ${createInputCell({ className: 'plandir-entrance-input' })}
          ${createInputCell({ className: 'plandir-exit-input' })}
          <td class="mp-cell" tabindex="-1"></td>
          <td class="tas-cell" tabindex="-1"></td>
          ${createInputCell({ className: 'plandir-obs-input' })}
        </tr>
      `).join('');
      return `
      <div id="plandir-card-container" style="display: flex; justify-content: center;">
        <div class="plandir-main-card" style="margin: 10px 0 0 0; max-width: 1200px; transform:none !important; transition:none !important;">
          <div class="plandir-card-title"><span class="plandir-status-dot"></span>${title}</div>
          <table class="plandir-table">
            <colgroup>
              <col style="width: 75px;">
              <col style="width: 200px;">
              <col style="width: 250px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 400px;">
            </colgroup>
            <thead>
              <tr${specialClass}>
                <th rowspan="2">N. Int.</th>
                <th rowspan="2">Patente</th>
                <th rowspan="2">Nome</th>
                <th colspan="2">Horário</th>
                <th rowspan="2">MP</th>
                <th rowspan="2">TAS</th>
                <th rowspan="2">Observações</th>
              </tr>
              <tr>
                <th>Entrada</th>
                <th>Saída</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
      </div>
      `;
    }
    function updateStatusDots() {
      const thresholds = {"EQUIPA 01": {yellow: 4, green: 5}, "EQUIPA 02": {yellow: 4, green: 5}, "LOGÍSTICA": {yellow: 1, green: 2},
                          "INEM": {yellow: 1, green: 2}, "INEM - Reserva": {yellow: 1, green: 2},};
      document.querySelectorAll('.plandir-main-card').forEach(card => {
        const dot = card.querySelector('.plandir-status-dot');
        if (!dot) return;
        const titleEl = card.querySelector('.plandir-card-title');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const filledCount = [...card.querySelectorAll('.plandir-nint-input')]
        .filter(input => input.value.trim() !== '').length;
        const config = thresholds[title];
        if (config) {
          dot.classList.remove('filled', 'dot-yellow', 'dot-red');
          if (filledCount >= config.green) {
            dot.classList.add('filled');
          } else if (filledCount >= config.yellow) {
            dot.classList.add('dot-yellow');
          } else {
            dot.classList.add('dot-red');
          }
        } else {
          dot.classList.remove('dot-yellow', 'dot-red');
          dot.classList.toggle('filled', filledCount > 0);
        }
      });
      const sideTbody = document.getElementById('plandir-side-tbody');
      if (!sideTbody) return;
      const currentInputs = Array.from(document.querySelectorAll('.plandir-nint-input'))
        .map(i => i.value.trim().padStart(3, '0'))
        .filter(val => val !== '' && val !== '000');
      sideTbody.querySelectorAll('tr[data-side-nint]').forEach(tr => {
        const nint = tr.getAttribute('data-side-nint');
        const isFilled = currentInputs.includes(nint);
        tr.classList.toggle('row-highlight-green', isFilled);
        tr.classList.toggle('row-pending-red', !isFilled);
      });
    }
    function updateRowFields(row, data, shift) {
      const entrance = row.querySelector('.plandir-entrance-input');
      const exit = row.querySelector('.plandir-exit-input');
      const patent = row.querySelectorAll('td input')[1];
      const name = row.querySelectorAll('td input')[2];
      const mpCell = row.querySelectorAll('td')[5];
      const tasCell = row.querySelectorAll('td')[6];
      const obsInput = row.querySelectorAll('td input')[5];
      if (shift === 'D') {
        if (entrance) entrance.value = "08:00";
        if (exit) exit.value = "20:00";
      } else if (shift === 'N') {
        if (entrance) entrance.value = "20:00";
        if (exit) exit.value = "08:00";
      }
      if (data) {
        if (patent) patent.value = data.patent || "";
        if (name) name.value = data.abv_name || "";
        if (mpCell) {
          mpCell.textContent = data.MP ? "X" : "";
          mpCell.classList.toggle('plandir-mp-active', !!data.MP);
        }
        if (tasCell) {
          tasCell.textContent = data.TAS ? "X" : "";
          tasCell.classList.toggle('plandir-tas-active', !!data.TAS);
        }
      } else {
        if (entrance) entrance.value = "";
        if (exit) exit.value = "";
        if (patent) patent.value = "";
        if (name) name.value = "";
        if (mpCell) {
          mpCell.textContent = "";
          mpCell.classList.remove('plandir-mp-active');
        }
        if (tasCell) {
          tasCell.textContent = "";
          tasCell.classList.remove('plandir-tas-active');
        }
        if (obsInput) obsInput.value = "";
      }
    }
    function activateShiftButton(shift) {
      document.querySelectorAll('.options-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shift === shift);
      });
    }
    function createPlanDirHeader(shift, customTitle = null) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      let titleText, dateText;
      if (customTitle) {
        titleText = "Planeamento Diário";
        dateText = customTitle;
      } else if (shift === 'LAST') {
        titleText = "Último Planeamento";
        dateText = "Carregando dados salvos...";
      } else {
        const shiftHours = (shift === 'D') ? '08:00-20:00' : '20:00-08:00';
        titleText = "Planeamento Diário";
        dateText = `Dia: ${day} ${month} ${year} | Turno ${shift} | ${shiftHours}`;
      }
      const headerDiv = document.createElement('div');
      headerDiv.className = 'plandir-shift-header';
      headerDiv.innerHTML = `
        <div class="plandir-header-title">${titleText}</div>
        <div class="plandir-header-date">${dateText}</div>
      `;
      return headerDiv;
    }
    function collectTableData() {
      const tables = [...document.querySelectorAll('.plandir-main-card')].map(card => {
        const titleEl = card.querySelector('.plandir-card-title');
        const title = titleEl ? titleEl.textContent.trim() : "Sem título";
        const rows = [...card.querySelectorAll('tbody tr')].map(tr => {
          const inputs = tr.querySelectorAll('input');
          const mpCell = tr.querySelector('.mp-cell');
          const tasCell = tr.querySelector('.tas-cell');
          return {n_int: inputs[0]?.value?.trim() || "", patente: inputs[1]?.value?.trim() || "", nome: inputs[2]?.value?.trim() || "", entrada: inputs[3]?.value?.trim() || "",
                  saida: inputs[4]?.value?.trim() || "", MP: mpCell?.textContent === "X", TAS: tasCell?.textContent === "X", obs: inputs[5]?.value?.trim() || ""};});
        return {title, rows};
      });
      return tables;
    }
    function createEmitButton(container) {
      if (document.getElementById('emit-pp')) return;
      const btnWrapper = document.createElement('div');
      btnWrapper.style.display = 'flex';
      btnWrapper.style.justifyContent = 'center';
      btnWrapper.style.marginTop = '10px';
      const emitBtn = document.createElement('button');
      emitBtn.id = 'emit-pp';
      emitBtn.className = 'btn btn-success';
      emitBtn.textContent = 'EMITIR PLANEAMENTO';
      emitBtn.addEventListener('click', () => {
        let shift = document.querySelector('.shift-btn.active').dataset.shift;
        const date = new Date().toISOString().slice(0, 10);
        if (shift === "LAST") {
          let storedShift = sessionStorage.getItem("originalShift");
          if (!storedShift) {
            storedShift = localStorage.getItem("originalShift");
          }
          if (storedShift) {
            shift = storedShift;
          } else {
            showPopup('popup-danger', "Não foi possível determinar o turno original.");
            return;
          }
        }
        emitPlanning(shift, date);
      });
      btnWrapper.appendChild(emitBtn);
      container.appendChild(btnWrapper);
    }
    async function fetchRecipientsFromSupabase() {
      const categories = ['plandir_mail_to', 'plandir_mail_cc', 'plandir_mail_bcc'];
      const filterQuery = `category=in.(${categories.join(',')})&select=category,value`;
      const url = `${SUPABASE_URL}/rest/v1/static_options?${filterQuery}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: getSupabaseHeaders()
        });
        if (!response.ok) {
          console.error('Erro HTTP ao buscar e-mails:', response.status, response.statusText);
          throw new Error('Falha ao conectar ou autenticar com o Supabase.');
        }
        const data = await response.json();
        let recipients = {to: [], cc: [], bcc: []};
        for (const row of data) {
          const emails = row.value ?
            String(row.value)
            .split(',')
            .map(e => e.trim())
            .filter(e => e) : [];
          if (row.category === 'plandir_mail_to') {
            recipients.to = emails;
          } else if (row.category === 'plandir_mail_cc') {
            recipients.cc = emails;
          } else if (row.category === 'plandir_mail_bcc') {
            recipients.bcc = emails;
          }
        }
        if (recipients.to.length === 0) {
          recipients.to = ["fmartins.ahbfaro@gmail.com"];
        }
        return recipients;
      } catch (err) {
        console.error('Erro de rede ou Supabase desconhecido:', err);
        return {to: ["fmartins.ahbfaro@gmail.com"], cc: [], bcc: []};
      }
    }
    function getOptelName() {
      const tables = collectTableData();
      const optelTable = tables.find(t => t.title === "OPTEL");
      if (!optelTable || optelTable.rows.length === 0) {
        return "";
      }
      const optelRow = optelTable.rows[0];
      const optelName = optelRow.nome || "";
      return optelName;
    }
    async function emitPlanning(shift, date, baixar = false) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {
        showPopup('popup-danger', "Erro: Sessão expirada. Por favor, faça login novamente.");
        return;
      }
      const tables = collectTableData();
      const optelName = getOptelName();
      const [year, month, day] = date.split('-');
      const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const monthName = monthNames[parseInt(month, 10) - 1] || month;
      const formattedDate = `${year}${month}${day}`;
      const shiftHours = (shift === 'D') ? '08:00-20:00' : '20:00-08:00';
      const { to, cc, bcc } = await fetchRecipientsFromSupabase();
      const RECIPIENTS = to;
      const CC_RECIPIENTS = cc;
      const BCC_RECIPIENTS = bcc;
      if (RECIPIENTS.length === 0) {
        showPopup('popup-danger', "Erro: Defina pelo menos um destinatário.");
        return;
      }
     const teamNameMap = {"OFOPE": "ofope", "CHEFE DE SERVIÇO": "chefe_servico", "OPTEL": "optel", "EQUIPA 01": "equipa_01", "EQUIPA 02": "equipa_02", "LOGÍSTICA": "logistica",
                          "INEM": "inem", "INEM - Reserva": "inem_reserva", "SERVIÇO GERAL": "servico_geral"};
      try {
        for (let table of tables) {
          const team_name = teamNameMap[table.title];
          if (!team_name) continue;
          const nonEmptyRows = table.rows.filter(r => r.n_int || r.patente || r.nome || r.entrada || r.saida || r.MP || r.TAS || r.obs);
          await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams?team_name=eq.${encodeURIComponent(team_name)}&corp_oper_nr=eq.${corpOperNr}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          });
          if (nonEmptyRows.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams`, {
              method: "POST",
              headers: getSupabaseHeaders(),
              body: JSON.stringify(
                nonEmptyRows.map(r => ({team_name, n_int: r.n_int || '', patente: r.patente || '', nome: r.nome || '', h_entrance: r.entrada || '', h_exit: r.saida || '', MP: !!r.MP,
                                        TAS: !!r.TAS, observ: r.obs || '', corp_oper_nr: corpOperNr})))});}}
        await fetch(`${SUPABASE_URL}/rest/v1/fomio_date?corp_oper_nr=eq.${corpOperNr}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        await fetch(`${SUPABASE_URL}/rest/v1/fomio_date`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify([{header_text: `Dia: ${day} ${monthName} ${year} | Turno ${shift} | ${shiftHours}`, corp_oper_nr: corpOperNr}])
        });
        const attendanceSaved = await saveAttendance(tables, shift, corpOperNr, day, month, year);
        if (!attendanceSaved) {
          console.warn('⚠️ Aviso: Falha ao gravar dados de assiduidade na tabela reg_assid.');
        }
        const eligibilitySaved = await saveEligibility(tables, day, month, year, corpOperNr);
        if (!eligibilitySaved) {
          console.warn('⚠️ Aviso: Falha ao gravar dados na tabela reg_eligibility.');
        }
        const finalFileName = `Planeamento_${day}_${monthName}_${year}_${shift}`;
        const fileDisplayName = `Planeamento Diário ${formattedDate} Turno ${shift}`;
        const greeting = getGreeting();
        const signature = getEmailSignature();
        const emailBodyHTML = `
            ${greeting}<br><br>
            Remeto em anexo a Vossas Exª.s o ${fileDisplayName}<br><br>
            Com os melhores cumprimentos,<br><br>
            OPTEL<br>
            ${optelName}<br><br>        
            ${signature}
        `;
        showPopup('popup-success', `Planeamento gerado com sucesso. O mesmo está a ser enviado para as entidades.`);
        const response = await fetch("/api/plandir_convert_and_send", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({shift, date, tables, recipients: RECIPIENTS, ccRecipients: CC_RECIPIENTS, bccRecipients: BCC_RECIPIENTS, emailBody: emailBodyHTML})});
        const result = await response.json();
        if (!response.ok) {
          showPopup('popup-danger', `ERRO! O planeamento não foi enviado. Detalhes: ${result.details || 'Verificar consola.'}`);
          return;
        }
        showPopup('popup-success', `Planeamento do dia ${day}/${month}/${year} (Turno ${shift}) emitido e enviado com sucesso!`);
      } catch (err) {
        console.error('Erro no processo de emissão:', err);
        showPopup('popup-danger', 'Erro ao processar o planeamento. Por favor, tente novamente.');
      }
    }
    async function loadSideTable(shift) {
      const tbody = document.getElementById('plandir-side-tbody');
      const rightCol = document.getElementById('plandir-right-col');
      if (!tbody || !rightCol) return;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (!corpOperNr) return;
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#aaa; padding:12px;">A carregar...</td></tr>`;
      rightCol.style.display = 'block';
      try {
        let dataNormal = [];
        let dataEcin = [];
        let dataOfope = [];
        let dataPiquete = [];
        const urlNormal = `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&shift=eq.${shift}&select=n_int,abv_name`;
        const resNormal = await fetch(urlNormal, {headers: getSupabaseHeaders()});
        dataNormal = await resNormal.json();
        if (shift === 'D') {
          const urlEcin = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=in.(ED,ET)&select=n_int,abv_name`;
          const resEcin = await fetch(urlEcin, {headers: getSupabaseHeaders()});
          dataEcin = await resEcin.json();
        }
        if (shift === 'N') {
          const urlOfope = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=eq.N&select=n_int,abv_name`;
          const resOfope = await fetch(urlOfope, {headers: getSupabaseHeaders()});
          dataOfope = await resOfope.json();
          const urlPiquete = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=eq.PN&select=n_int,abv_name`;
          const resPiquete = await fetch(urlPiquete, {headers: getSupabaseHeaders()});
          dataPiquete = await resPiquete.json();
          const urlEcin = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=in.(EN,ET)&select=n_int,abv_name`;
          const resEcin = await fetch(urlEcin, {headers: getSupabaseHeaders()});
          dataEcin = await resEcin.json();
        }
        const sortFn = (a, b) => Number(a.n_int) - Number(b.n_int);
        dataNormal.sort(sortFn);
        dataEcin.sort(sortFn);
        dataOfope.sort(sortFn);
        dataPiquete.sort(sortFn);
        if (dataNormal.length === 0 && dataEcin.length === 0 && dataOfope.length === 0 && dataPiquete.length === 0) {
          tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#aaa; padding:12px;">Sem dados</td></tr>`;
          return;
        }
        const allNInts = [...dataNormal, ...dataEcin, ...dataOfope, ...dataPiquete].map(r => String(r.n_int).trim().padStart(3, '0'));
        const uniqueNInts = [...new Set(allNInts)];
        const resElems = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=in.(${uniqueNInts.join(',')})&select=n_int,patent`, {
          headers: getSupabaseHeaders()
        });
        const elems = await resElems.json();
        const patenteMap = {};
        elems.forEach(e => {
          const key = String(e.n_int || '').trim().padStart(3, '0');
          patenteMap[key] = e.patent || '';
        });
        const sectionHeader = (title) => `
          <tr>
            <td colspan="3" class="plandir-card-title black-variant" style="height: 30px; font-size: 11px; padding: 0; border: none; text-align: center; display: table-cell; border-top: 1px solid #fff;">
              ${title}
            </td>
          </tr>
        `;
        let htmlContent = "";
        htmlContent += sectionHeader(shift === 'D' ? 'PROFISSIONAIS' : 'PROFISSIONAIS');
        htmlContent += dataNormal.map(r => renderRow(r, patenteMap)).join('');
        if (shift === 'D') {
          if (dataEcin.length > 0) {
            htmlContent += sectionHeader('ECIN');
            htmlContent += dataEcin.map(r => renderRow(r, patenteMap)).join('');
          }
        }
        if (shift === 'N') {
          if (dataOfope.length > 0) {
            htmlContent += sectionHeader('OFOPE');
            htmlContent += dataOfope.map(r => renderRow(r, patenteMap)).join('');
          }
          if (dataPiquete.length > 0) {
            htmlContent += sectionHeader('PIQUETE');
            htmlContent += dataPiquete.map(r => renderRow(r, patenteMap)).join('');
          }
          if (dataEcin.length > 0) {
            htmlContent += sectionHeader('ECIN');
            htmlContent += dataEcin.map(r => renderRow(r, patenteMap)).join('');
          }
        }
        tbody.innerHTML = htmlContent;
        updateStatusDots();
      } catch (err) {
        console.error('Erro ao carregar escala:', err);
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#e44; padding:12px;">Erro ao carregar</td></tr>`;
      }
    }
    async function loadShift(shift) {
      const container = document.getElementById('plandir_container');
      const activeBtn = document.querySelector('.shift-btn.active');
      if (activeBtn && activeBtn.dataset.shift === shift) {
        activeBtn.classList.remove('active');
        container.innerHTML = '';
        document.getElementById('plandir-right-col').style.display = 'none';
        return;
      }
      activateShiftButton(shift);
      container.innerHTML = '';
      if (shift !== 'LAST') {
        sessionStorage.setItem("originalShift", shift);
        localStorage.setItem("originalShift", shift);
      }
      let header;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      if (shift === 'LAST') {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/fomio_date?select=header_text&limit=1`, {
            method: 'GET',
            headers: getSupabaseHeaders()
          });
          const dataArr = await res.json();
          let formattedHeader = null;
          let originalShift = null;
          if (dataArr && dataArr.length > 0) {
            const headerText = dataArr[0].header_text;
            const match = headerText.match(/Dia: (\d{2}) (\w{3}) (\d{4}) \| Turno (.) \| (.+)/);
            if (match) {
              const [_, day, month, year, shiftLetter, hours] = match;
              originalShift = shiftLetter;
              sessionStorage.setItem("originalShift", shiftLetter);
              localStorage.setItem("originalShift", shiftLetter);
            }
            formattedHeader = headerText;
          }
          header = createPlanDirHeader('LAST', formattedHeader);
          if (header) container.appendChild(header);
          container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
          try {
            const res2 = await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams?select=*`, {
              method: 'GET',
              headers: getSupabaseHeaders()
            });
            const allMembers = await res2.json();
            if (allMembers && allMembers.length > 0) {
              const teamNameMap = {"ofope": "OFOPE", "chefe_servico": "CHEFE DE SERVIÇO", "optel": "OPTEL", "equipa_01": "EQUIPA 01", "equipa_02": "EQUIPA 02", "logistica": "LOGÍSTICA",
                                   "inem": "INEM", "inem_reserva": "INEM - Reserva", "servico_geral": "SERVIÇO GERAL"};
              const teamsData = allMembers.reduce((acc, member) => {
                if (!acc[member.team_name]) acc[member.team_name] = [];
                acc[member.team_name].push(member);
                return acc;
              }, {});
              Object.keys(teamsData).forEach(dbTeamName => {
                const displayTitle = teamNameMap[dbTeamName];
                if (!displayTitle) return;
                const card = Array.from(document.querySelectorAll('.plandir-main-card')).find(
                  c => c.querySelector('.plandir-card-title')?.textContent.trim() === displayTitle
                );
                if (!card) return;
                const rows = Array.from(card.querySelectorAll('tbody tr'));
                teamsData[dbTeamName].forEach((member, i) => {
                  const tr = rows[i];
                  if (!tr) return;
                  const inputs = tr.querySelectorAll('input');
                  const mpCell = tr.querySelector('.mp-cell');
                  const tasCell = tr.querySelector('.tas-cell');
                  if (inputs[0]) inputs[0].value = member.n_int || '';
                  if (inputs[1]) inputs[1].value = member.patente || '';
                  if (inputs[2]) inputs[2].value = member.nome || '';
                  if (inputs[3]) inputs[3].value = member.h_entrance || '';
                  if (inputs[4]) inputs[4].value = member.h_exit || '';
                  if (mpCell) {
                    mpCell.textContent = member.MP ? 'X' : '';
                    mpCell.classList.toggle('plandir-mp-active', !!member.MP);
                  }
                  if (tasCell) {
                    tasCell.textContent = member.TAS ? 'X' : '';
                    tasCell.classList.toggle('plandir-tas-active', !!member.TAS);
                  }
                  if (inputs[5]) inputs[5].value = member.observ || '';
                });
              });
            }
          } catch (err) {
            console.error('Erro ao carregar dados salvos direto:', err);
          }
          updateStatusDots();
          if (originalShift) loadSideTable(originalShift);
        } catch (err) {
          console.error('Erro ao carregar header direto:', err);
          header = createPlanDirHeader('LAST');
          if (header) container.appendChild(header);
          container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
        }
      } else {
        header = createPlanDirHeader(shift);
        if (header) container.appendChild(header);
        container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
        loadSideTable(shift);
      }
      container.querySelectorAll('.plandir-nint-input').forEach(input => {
        input.addEventListener('input', async function() {
          this.value = this.value.replace(/\D/g, '').slice(0, 3);
          const row = this.closest('tr');
          if (this.value.length === 3) {
            const nIntFormatted = this.value.padStart(3, '0');
            const inputRef = this;
            let dataArr = [];
            try {
              const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${this.value}`, {
                headers: getSupabaseHeaders()
              });
              dataArr = await res.json();
              updateRowFields(row, dataArr[0], shift);
            } catch (err) {
              console.error('Erro reg_elems:', err);
            }
            const allNintInputs = Array.from(document.querySelectorAll('.plandir-nint-input'));
            const existingRow = allNintInputs.find(i => i !== inputRef && i.value.trim() === this.value.trim());
            if (existingRow) {
              const existingObs = existingRow.closest('tr').querySelectorAll('td input')[5];
              const obsInput = row.querySelectorAll('td input')[5];
              if (obsInput && existingObs) obsInput.value = existingObs.value;
              updateStatusDots();
              return;
            }
            const sideTbody = document.getElementById('plandir-side-tbody');
            const sideRow = sideTbody && sideTbody.querySelector(`tr[data-side-nint="${nIntFormatted}"]`);
            const existsInSide = !!sideRow;
            if (existsInSide) {
              const obsInput = row.querySelectorAll('td input')[5];
              if (shift === 'D') {
                try {
                  const resTeam = await fetch(`${SUPABASE_URL}/rest/v1/reg_employees?n_int=eq.${this.value}&select=team`, {
                    headers: getSupabaseHeaders()
                  });
                  const teamData = await resTeam.json();
                  const team = teamData[0]?.team || '';
                  if (obsInput) obsInput.value = team.startsWith('EIP') ? 'EIP' : 'Profissional';
                } catch (err) {
                  console.error('Erro ao buscar team:', err);
                  if (obsInput) obsInput.value = 'Profissional';
                }
              } else {
                let secao = '';
                let currentSection = '';
                sideTbody.querySelectorAll('tr').forEach(tr => {
                  const sectionCell = tr.querySelector('td.plandir-card-title');
                  if (sectionCell) {
                    currentSection = sectionCell.textContent.trim();
                  }
                  if (tr.getAttribute('data-side-nint') === nIntFormatted) {
                    secao = currentSection;
                  }
                });
                if (obsInput) {
                  if (secao === 'PROFISSIONAIS') obsInput.value = 'Profissional';
                  else if (secao === 'PIQUETE') obsInput.value = 'Piquete';
                  else if (secao === 'ECIN') obsInput.value = 'ECIN';
                  else if (secao === 'OFOPE') obsInput.value = '';
                  else obsInput.value = 'Profissional';
                }
              }
            } else {
              const nome = dataArr[0]?.abv_name || nIntFormatted;
              const msg = document.getElementById('popup-confirm-message');
              if (msg) msg.textContent = `O Elemento ${nIntFormatted} (${nome}) não consta na escala do dia. Deseja adicioná-lo ao planeamento?`;
              const modal1 = document.getElementById('popup-confirm-modal');
              const modal2 = document.getElementById('popup-service-type-modal');
              if (modal1) modal1.classList.add('show');
              const okBtn1 = document.getElementById('popup-confirm-ok-btn');
              const cancelBtn1 = document.getElementById('popup-confirm-cancel-btn');
              const okBtn2Raw = document.getElementById('popup-service-type-ok-btn');
              const cancelBtn2Raw = document.getElementById('popup-service-type-cancel-btn');
              const okBtn2 = okBtn2Raw.cloneNode(true);
              const cancelBtn2 = cancelBtn2Raw.cloneNode(true);
              okBtn2Raw.parentNode.replaceChild(okBtn2, okBtn2Raw);
              cancelBtn2Raw.parentNode.replaceChild(cancelBtn2, cancelBtn2Raw);
              if (okBtn1) okBtn1.onclick = () => {
                modal1.classList.remove('show');
                document.querySelectorAll('input[name="popup-service-type"]').forEach(r => r.checked = false);
                document.getElementById('service-swap-fields').style.display = 'none';
                document.getElementById('service-swap-nint').value = '';
                document.getElementById('service-swap-name').value = '';
                document.getElementById('service-other-fields').style.display = 'none';
                document.getElementById('service-other-text').value = '';
                setTimeout(() => {
                  if (modal2) modal2.classList.add('show');
                }, 50);
              };
              if (cancelBtn1) cancelBtn1.onclick = () => {
                modal1.classList.remove('show');
                inputRef.value = '';
                updateRowFields(row, null);
                updateStatusDots();
              };
              okBtn2.onclick = async () => {
                const selected = document.querySelector('input[name="popup-service-type"]:checked');
                if (!selected) {
                  showPopup('popup-danger', 'Por favor selecione uma opção.');
                  return;
                }
                if (selected.value === 'Troca de Serviço') {
                  const nIntSwap = document.getElementById('service-swap-nint')?.value?.trim();
                  if (!nIntSwap) {
                    showPopup('popup-danger', 'Por favor insira o Nº Int. do elemento para troca.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => {
                      closePopup('popup-danger');
                      dangerBtn.onclick = originalOnclick;
                      setTimeout(() => {
                        document.getElementById('service-swap-nint').focus();
                      }, 50);
                    };
                    return;
                  }
                  if (nIntSwap === inputRef.value.trim()) {
                    showPopup('popup-danger', 'O elemento não pode fazer troca consigo mesmo.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => {
                      closePopup('popup-danger');
                      dangerBtn.onclick = originalOnclick;
                      setTimeout(() => {
                        document.getElementById('service-swap-nint').focus();
                        document.getElementById('service-swap-nint').select();
                      }, 50);
                    };
                    return;
                  }
                }
                if (selected.value === 'Outro') {
                  const otherText = document.getElementById('service-other-text')?.value?.trim();
                  if (!otherText) {
                    showPopup('popup-danger', 'Por favor preencha o campo de observação.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => {
                      closePopup('popup-danger');
                      dangerBtn.onclick = originalOnclick;
                      setTimeout(() => {
                        document.getElementById('service-other-text').focus();
                      }, 50);
                    };
                    return;
                  }
                }
                modal2.classList.remove('show');
                const obsInput = row.querySelectorAll('td input')[5];
                if (selected.value === 'Troca de Serviço') {
                  const nIntSwap = document.getElementById('service-swap-nint')?.value?.trim();
                  const nameSwap = document.getElementById('service-swap-name')?.value?.trim();
                  const swapInfo = nIntSwap ? `${nIntSwap} ${nameSwap}` : '';
                  if (shift === 'D') {
                    if (obsInput) obsInput.value = `Profissional | Troca de Serviço | ${swapInfo}`;
                  } else {
                    let secaoSwap = '';
                    let currentSection = '';
                    const sideTbody = document.getElementById('plandir-side-tbody');
                    const nIntSwapFormatted = nIntSwap?.padStart(3, '0');
                    if (sideTbody && nIntSwapFormatted) {
                      sideTbody.querySelectorAll('tr').forEach(tr => {
                        const sectionCell = tr.querySelector('td.plandir-card-title');
                        if (sectionCell) {
                          currentSection = sectionCell.textContent.trim();
                        }
                        if (tr.getAttribute('data-side-nint') === nIntSwapFormatted) {
                          secaoSwap = currentSection;
                        }
                      });
                    }
                    let prefix = 'Piquete';
                    if (secaoSwap === 'PROFISSIONAIS') prefix = 'Profissional';
                    else if (secaoSwap === 'ECIN') prefix = 'ECIN';
                    else if (secaoSwap === 'PIQUETE') prefix = 'Piquete';
                    if (obsInput) obsInput.value = `${prefix} | Troca de Serviço | ${swapInfo}`;
                  }
                } else if (selected.value === 'Outro') {
                  const otherText = document.getElementById('service-other-text')?.value?.trim();
                  if (obsInput) obsInput.value = otherText || '';
                } else {
                  if (obsInput) obsInput.value = selected.value;
                }
              };
              cancelBtn2.onclick = () => {
                modal2.classList.remove('show');
                inputRef.value = '';
                updateRowFields(row, null);
                updateStatusDots();
              };
            }
          } else {
            updateRowFields(row, null);
          }
          updateStatusDots();
        });
      });
      container.querySelectorAll('.plandir-entrance-input').forEach(input => {
        input.addEventListener('change', function() {
          const row = this.closest('tr');
          const obsInput = row.querySelectorAll('td input')[5];
          if (!obsInput) return;
          if (shift !== 'D') return;
          if (!obsInput.value.startsWith('Profissional')) return;
          const val = this.value.trim();
          if (!val) return;
          const [h, m] = val.split(':').map(Number);
          const totalMinutes = h * 60 + m;
          const limit = 6 * 60 + 30;
          if (totalMinutes < limit) {
            obsInput.value = 'Profissional | Longo Curso';
          } else {
            obsInput.value = 'Profissional';
          }
        });
      });
      container.querySelectorAll('input:not([readonly]):not([disabled])').forEach(input => {
        input.addEventListener('keydown', function(e) {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const allInputs = Array.from(container.querySelectorAll('input:not([readonly]):not([disabled])'));
          const currentIndex = allInputs.indexOf(this);
          if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
            allInputs[currentIndex + 1].focus();
          }
        });
      });
      container.querySelectorAll('.plandir-nint-input').forEach(input => {
        input.addEventListener('dblclick', function() {
          const row = this.closest('tr');
          this.value = '';
          updateRowFields(row, null);
          updateStatusDots();
        });
      });
      createEmitButton(container);
    }
    function renderRow(r, patentMap) {
      const nIntFormatted = String(r.n_int || '').trim().padStart(3, '0');
      const patent = patentMap[nIntFormatted] || '';
      const isAlreadyFilled = Array.from(document.querySelectorAll('.plandir-nint-input'))
      .some(input => input.value.trim().padStart(3, '0') === nIntFormatted);
      const initialClass = isAlreadyFilled ? 'row-highlight-green' : 'row-pending-red';
      return `
        <tr data-side-nint="${nIntFormatted}" class="${initialClass}">
          <td style="text-align:center; padding: 5px 6px; width:75px;">${nIntFormatted}</td>
          <td style="padding: 5px 6px; width:150px;">${patent}</td>
          <td style="padding: 5px 6px; width:250px;">${r.abv_name || ''}</td>
        </tr>
      `;
    }
    document.querySelector('[data-page="page-plandir"]').addEventListener('click', () => {
      const container = document.getElementById('plandir_container');
      const rightCol = document.getElementById('plandir-right-col');
      if (container && container.innerHTML.trim() !== '') {
        container.innerHTML = '';
        if (rightCol) {
          rightCol.style.display = 'none';
        }
        document.querySelectorAll('.shift-btn').forEach(btn => btn.classList.remove('active'));
      }
    });
    document.querySelectorAll('input[name="popup-service-type"]').forEach(radio => {
      radio.addEventListener('change', function () {
        document.getElementById('service-swap-fields').style.display = this.value === 'Troca de Serviço' ? 'flex' : 'none';
        document.getElementById('service-other-fields').style.display = this.value === 'Outro' ? 'flex' : 'none';
      });
    });
    document.addEventListener('input', async function (e) {
      if (e.target.id !== 'service-swap-nint') return;
      const input = e.target;
      input.value = input.value.replace(/\D/g, '').slice(0, 3);
      const nameField = document.getElementById('service-swap-name');
      if (input.value.length === 3) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${input.value}`, {
            headers: getSupabaseHeaders()
          });
          const data = await res.json();
          nameField.value = data[0]?.abv_name || '';
        } catch (err) {
          console.error('Erro:', err);
          nameField.value = '';
        }
      } else {
        nameField.value = '';
      }
    });
    function blockShiftButtons() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const isDay = totalMinutes >= 8 * 60 && totalMinutes < 20 * 60;
      const btnD = document.querySelector('.options-btn[data-shift="D"]');
      const btnN = document.querySelector('.options-btn[data-shift="N"]');
      if (isDay) {
        btnN.disabled = true;
        btnN.style.opacity = '0.4';
        btnN.style.cursor = 'not-allowed';
        btnN.title = 'Turno N disponível após as 20:00';
      } else {
        btnD.disabled = true;
        btnD.style.opacity = '0.4';
        btnD.style.cursor = 'not-allowed';
        btnD.title = 'Turno D disponível após as 08:00';
      }
    }
    blockShiftButtons();
