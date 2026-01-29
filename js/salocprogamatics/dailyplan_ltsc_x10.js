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
      const currentDay = day ?? String(now.getDate()).padStart(2, '0');
      const currentMonth = month ?? String(now.getMonth() + 1).padStart(2, '0');
      const currentYear = year ?? String(now.getFullYear());
      for (const table of tables) {
        for (const row of table.rows) {
          const nInt = row.n_int?.trim();
          const checkIn = row.entrada?.trim();
          const checkOut = row.saida?.trim();
          const rawObs = (row.obs || '').trim();
          const obs = rawObs.toLowerCase();
          if (!nInt) continue;
          let recordType = '';
          let totalHours = '0';
          const isAbsent = hasAbsenceStatus(obs);
          const isOnCall = hasOnCallStatus(obs);
          const isReinforcement = hasReinforcementStatus(obs);
          const isSickLeave = obs.includes('baixa');
          const isLicence = obs.includes('licença') || obs.includes('licenca');
          const isDispense = obs.includes('dispensa');
          if (isSickLeave) {
            recordType = 'Baixa';
          } else if (isLicence) {
            recordType = 'Licença';
          } else if (isDispense) {
            recordType = 'Dispensa';
          } else if (isAbsent) {
            recordType = 'Falta';
          } else if (isOnCall) {
            recordType = 'Piquete';
          } else if (isReinforcement) {
            recordType = 'Reforço';
          } else {
            continue;
          }
          if ((recordType === 'Piquete' || recordType === 'Reforço') && checkIn && checkOut) {
            totalHours = String(calculateWorkHours(checkIn, checkOut, shift));
          }
          const key = `${nInt}_${currentDay}_${currentMonth}_${currentYear}_${corpOperNr}_${recordType}`;
          if (recordsMap.has(key)) continue;
          recordsMap.set(key, {n_int: String(nInt), day: String(currentDay), month: String(currentMonth), year: String(currentYear), shift: String(shift), shift_type: String(recordType),
                               qtd_hours: String(totalHours), observ: rawObs, corp_oper_nr: String(corpOperNr)});
        }
      }
      const attendanceRecords = Array.from(recordsMap.values());
      if (attendanceRecords.length === 0) {
        return true;
      }
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_assid`, {
            method: 'POST',
            headers: {
              ...getSupabaseHeaders(),
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(attendanceRecords)
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro na comunicação com a base de dados.');
        }
        return true;
      } catch (err) {
        console.error('❌ Erro em saveAttendance:', err);
        showPopupWarning('O planeamento foi enviado, mas houve um erro ao registar as faltas/piquetes no sistema central.');
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
        <div class="main-card" style="margin: 10px 0 0 0; max-width: 1200px; transform:none !important; transition:none !important;">
          <div class="card-title">${title}</div>
          <table class="plandir-table">
            <colgroup>
              <col style="width: 75px;">
              <col style="width: 200px;">
              <col style="width: 300px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 500px;">
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
    function updateRowFields(row, data, shift) {
      const entrada = row.querySelector('.plandir-entrance-input');
      const saida = row.querySelector('.plandir-exit-input');
      const patente = row.querySelectorAll('td input')[1];
      const nome = row.querySelectorAll('td input')[2];
      const mpCell = row.querySelectorAll('td')[5];
      const tasCell = row.querySelectorAll('td')[6];
      const obsInput = row.querySelectorAll('td input')[7];
      if (shift === 'D') {
        if (entrada) entrada.value = "08:00";
        if (saida) saida.value = "20:00";
      } else if (shift === 'N') {
        if (entrada) entrada.value = "20:00";
        if (saida) saida.value = "08:00";
      }
      if (data) {
        if (patente) patente.value = data.patent || "";
        if (nome) nome.value = data.abv_name || "";
        if (mpCell) {
          mpCell.textContent = data.MP ? "X" : "";
          mpCell.classList.toggle('plandir-mp-active', !!data.MP);
        }
        if (tasCell) {
          tasCell.textContent = data.TAS ? "X" : "";
          tasCell.classList.toggle('plandir-tas-active', !!data.TAS);
        }
      } else {
        if (entrada) entrada.value = "";
        if (saida) saida.value = "";
        if (patente) patente.value = "";
        if (nome) nome.value = "";
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
      document.querySelectorAll('.shift-btn').forEach(btn => {
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
      const tables = [...document.querySelectorAll('.main-card')].map(card => {
        const titleEl = card.querySelector('.card-title');
        const title = titleEl ? titleEl.textContent : "Sem título";
        const rows = [...card.querySelectorAll('tbody tr')].map(tr => {
          const inputs = tr.querySelectorAll('input');
          const mpCell = tr.querySelector('.mp-cell');
          const tasCell = tr.querySelector('.tas-cell');
          return {
            n_int: inputs[0]?.value?.trim() || "",
            patente: inputs[1]?.value?.trim() || "",
            nome: inputs[2]?.value?.trim() || "",
            entrada: inputs[3]?.value?.trim() || "",
            saida: inputs[4]?.value?.trim() || "",
            MP: mpCell?.textContent === "X",
            TAS: tasCell?.textContent === "X",
            obs: inputs[5]?.value?.trim() || ""
          };
        });
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
            showPopupWarning("Não foi possível determinar o turno original.");
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
        showPopupWarning("❌ Erro: Sessão expirada. Por favor, faça login novamente.");
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
        showPopupWarning("Erro: Defina pelo menos um destinatário.");
        return;
      }
     const teamNameMap = {"OFOPE": "ofope", "CHEFE DE SERVIÇO": "chefe_servico", "OPTEL": "optel",
                          "EQUIPA 01": "equipa_01", "EQUIPA 02": "equipa_02", "LOGÍSTICA": "logistica",
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
        showPopupSuccess(`Planeamento gerado com sucesso. O mesmo está a ser enviado para as entidades.`);
        const response = await fetch(
          "/api/plandir_convert_and_send",), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({shift, date, tables, recipients: RECIPIENTS, ccRecipients: CC_RECIPIENTS, bccRecipients: BCC_RECIPIENTS, emailBody: emailBodyHTML})});
        const result = await response.json();
        if (!response.ok) {
          showPopupWarning(`ERRO! O planeamento não foi enviado. Detalhes: ${result.details || 'Verificar consola.'}`);
          return;
        }
        showPopupSuccess(`✅ Planeamento do dia ${day}/${month}/${year} (Turno ${shift}) emitido e enviado com sucesso!`);
      } catch (err) {
        console.error('Erro no processo de emissão:', err);
        showPopupWarning('Erro ao processar o planeamento. Por favor, tente novamente.');
      }
    }
    async function loadShift(shift) {
      const container = document.getElementById('plandir_container');
      const activeBtn = document.querySelector('.shift-btn.active');
      if (activeBtn && activeBtn.dataset.shift === shift) {
        activeBtn.classList.remove('active');
        container.innerHTML = '';
        return;
      }
      activateShiftButton(shift);
      container.innerHTML = '';
      if (shift !== 'LAST') {
        sessionStorage.setItem("originalShift", shift);
        localStorage.setItem("originalShift", shift);
      }
      let header;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (shift === 'LAST') {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/fomio_date?select=header_text&limit=1`, {
            method: 'GET',
            headers: getSupabaseHeaders()
          });
          const dataArr = await res.json();
          let formattedHeader = null;
          if (dataArr && dataArr.length > 0) {
            const headerText = dataArr[0].header_text;
            const match = headerText.match(/Dia: (\d{2}) (\w{3}) (\d{4}) \| Turno (.) \| (.+)/);
            if (match) {
              const [_, day, month, year, shiftLetter, hours] = match;
              sessionStorage.setItem("originalShift", shiftLetter);
              localStorage.setItem("originalShift", shiftLetter);
            }
            formattedHeader = headerText;
          }
          header = createPlanDirHeader('LAST', formattedHeader);
        } catch (err) {
          console.error('Erro ao carregar header direto:', err);
          header = createPlanDirHeader('LAST');
        }
      } else {
        header = createPlanDirHeader(shift);
      }
      if (header) container.appendChild(header);
      container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
      if (shift === 'LAST') {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams?select=*`, {
            method: 'GET',
            headers: getSupabaseHeaders()
          });
          const allMembers = await res.json();
          if (allMembers && allMembers.length > 0) {
            const teamNameMap = {"ofope": "OFOPE", "chefe_servico": "CHEFE DE SERVIÇO", "optel": "OPTEL", 
                                 "equipa_01": "EQUIPA 01", "equipa_02": "EQUIPA 02", "logistica": "LOGÍSTICA", 
                                 "inem": "INEM", "inem_reserva": "INEM - Reserva", "servico_geral": "SERVIÇO GERAL"};
            const teamsData = allMembers.reduce((acc, member) => {
              if (!acc[member.team_name]) acc[member.team_name] = [];
              acc[member.team_name].push(member);
              return acc;
            }, {});
            Object.keys(teamsData).forEach(dbTeamName => {
              const displayTitle = teamNameMap[dbTeamName];
              if (!displayTitle) return;
              const card = Array.from(document.querySelectorAll('.main-card')).find(
                c => c.querySelector('.card-title')?.textContent === displayTitle
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
      }
      container.querySelectorAll('.plandir-nint-input').forEach(input => {
        input.addEventListener('input', async function() {
          this.value = this.value.replace(/\D/g, '').slice(0, 3);
          const row = this.closest('tr');
          if (this.value.length === 3) {
            try {
              const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${this.value}`, {
                headers: getSupabaseHeaders()
              });
              const dataArr = await res.json();
              updateRowFields(row, dataArr[0], shift);
            } catch (err) {
              console.error('Erro reg_elems:', err);
            }
          } else {
            updateRowFields(row, null);
          }
        });
      });
      createEmitButton(container);
    }
    document.querySelector('[data-page="page-plandir"]').addEventListener('click', () => {
      const container = document.getElementById('plandir_container');
      if (container && container.innerHTML.trim() !== '') {
        container.innerHTML = '';
        document.querySelectorAll('.shift-btn').forEach(btn => btn.classList.remove('active'));
      }
    });

