    /* =======================================
    EVENTS
    =======================================*/
    document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (btn && btn.getAttribute('data-page') === 'page-event-disp') {
        console.log("A carregar eventos para consulta...");
        await loadEvents();
      }
    });
    /* =========================== ADD SHIFT =========================== */
    function addShift() {
      const container = document.getElementById('shiftsList');
      const div = document.createElement('div');
      div.className = 'shift-item';
      div.innerHTML = `
        <div>
          <label>Data Turno:</label>
          <input type="date" class="shift-date">
        </div>
        <div>
          <label>Hora Início:</label>
          <input type="time" class="shift-start-time">
        </div>
        <div>
          <label>Hora Fim:</label>
          <input type="time" class="shift-end-time">
        </div>
        <button type="button" class="remove-btn" onclick="removeShift(this)">✕</button>
      `;
      container.appendChild(div);
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      updateCounter();
    }
    function updateCounter() {
      const totalShifs = document.querySelectorAll('.shift-item').length;
      document.getElementById('turno-count').innerText = `(${totalShifs} Inseridos)`;
    }
    /* ========================= REMOVE SHIFT ========================== */
    function removeShift(btn) {
      btn.parentElement.remove();
      updateCounter();
    }
    /* ========================== CLEAR FORM =========================== */
    function clearForm() {
      document.querySelectorAll('.admin-container input').forEach(i => i.value = '');
      document.getElementById('eventType').value = '';
      document.getElementById('shiftsList').innerHTML = '';
    }
    /* ========================= SUBMIT EVENT ========================== */
    async function submitEvent() {
      const eventName = document.getElementById('eventName').value.trim();
      const eventType = document.getElementById('eventType').value;
      const location = document.getElementById('eventLocation').value.trim();
      const startDate = document.getElementById('eventStartDate').value;
      const endDate = document.getElementById('eventEndDate').value;
      const operational = parseInt(document.getElementById('operational').value);
      const valueHour = parseFloat(document.getElementById('valueHour').value);
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      if (!eventName || !eventType || !location || !startDate || !endDate || isNaN(operational) || isNaN(valueHour)) {
        alert("Preencha todos os campos corretamente!"); 
        return;
      }
      const shifts = [...document.querySelectorAll('.shift-item')].map(item => {
        return { 
          event_shift_date: item.querySelector('.shift-date').value, 
          event_shift: `${item.querySelector('.shift-start-time').value}-${item.querySelector('.shift-end-time').value}`, 
          nec_oper: operational
        };
      }).filter(t => t.event_shift_date && t.event_shift !== "-");    
      if (shifts.length === 0) {
        alert("Adicione pelo menos um turno completo!");
        return;
      }    
      try {
        const headers = getSupabaseHeaders();
        const respCheck = await fetch(
          `${SUPABASE_URL}/rest/v1/event_list?event=eq.${encodeURIComponent(eventName)}&corp_oper_nr=eq.${corp_oper_nr}`, {
            headers: headers
          }
        );        
        const existingEvents = await respCheck.json();
        if (existingEvents.length > 0) { 
          alert(`O evento "${eventName}" já existe na sua corporação!`); 
          return;
        }
        const respEvent = await fetch(`${SUPABASE_URL}/rest/v1/event_list`, {
          method: 'POST', 
          headers: headers,
          body: JSON.stringify({event: eventName, event_type: eventType, corp_oper_nr: corp_oper_nr, date_start: startDate, date_end: endDate, value: valueHour, location: location})
        });    
        if (!respEvent.ok) throw new Error("Erro ao criar cabeçalho do evento");
        const shiftPromises = shifts.map(shift => fetch(`${SUPABASE_URL}/rest/v1/event_shifts`, {
          method: 'POST', 
          headers: headers,
          body: JSON.stringify({event: eventName,  event_shift_date: shift.event_shift_date, event_shift: shift.event_shift, nec_oper: shift.nec_oper, act_oper: 0, corp_oper_nr: corp_oper_nr})
        }));    
        await Promise.all(shiftPromises);    
        alert("Evento e turnos criados com sucesso!"); 
        clearForm();
        if (typeof loadEvents === "function") loadEvents();    
      } catch(e) { 
        console.error("Erro no submitEvent:", e);
        alert("Erro ao criar evento. Verifique a consola para mais detalhes."); 
      }
    }
    /* ========================= EVENT LOADING ========================= */
    function formatDateDisplay(dateStr) {
      if (!dateStr) return '---';
      const parts = dateStr.split('-');
      return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
    }
    function getStatusClass(state) {
      if (state === 'Aprovado') return 'bg-aprovado';
      if (state === 'Não Aprovado') return 'bg-rejeitado';
      if (state === 'Em Aprovação') return 'bg-pendente';
      return 'bg-default';
    }
    async function loadEvents() {
      const tbody = document.querySelector('#eventTable tbody');
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      
      tbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';      
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/event_list?corp_oper_nr=eq.${corp_oper_nr}&order=date_start.desc`, {
            headers: getSupabaseHeaders()
          }
        );
        const eventos = await resp.json();
        tbody.innerHTML = '';        
        eventos.forEach(ev => {
          const safeId = ev.event.replace(/\W/g,'');
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><b>${ev.event}</b></td>
            <td>${ev.location || '---'}</td>
            <td>${formatDateDisplay(ev.date_start)}</td>
            <td>${formatDateDisplay(ev.date_end)}</td>
            <td>
              <button class="view-btn" id="btn-v-${safeId}" onclick="toggleDisp('${ev.event}', this)">Ver</button>
              <button class="delete-event-btn" onclick="deleteFullEvent('${ev.event}')">🗑️</button>
            </td>
          `;
          tbody.appendChild(tr);    
          const trExp = document.createElement('tr');
          trExp.className = 'expandable'; 
          trExp.id = `row-expand-${safeId}`;
          trExp.innerHTML = `<td colspan="5" id="container-${safeId}" style="padding:15px; background:#f0f0f0"></td>`;
          tbody.appendChild(trExp);
        });
      } catch(e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>'; 
      }
    }
    /* ===================== DISPLAY EVENTS TABLE ====================== */
    async function buildDispTable(eventName) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const encodedName = encodeURIComponent(eventName);    
      try {
        const [rShifts, rDisp] = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/event_shifts?event=eq.${encodedName}&corp_oper_nr=eq.${corp_oper_nr}&order=event_shift_date.asc,event_shift.asc`, {
              headers: getSupabaseHeaders()
            }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/event_disp?event=eq.${encodedName}&corp_oper_nr=eq.${corp_oper_nr}&order=event_shift_date.asc,event_shift.asc`, {
              headers: getSupabaseHeaders()
            }
          )
        ]);    
        const shifts = await rShifts.json();
        const disps = await rDisp.json();    
        if (disps.length === 0) {
          return "<div style='padding:10px; color:#666;'>Sem disponibilidades registadas para este evento.</div>";
        }
        let html = `
          <div class="table-responsive-event">
            <table>
              <thead>
                <tr>
                  <th>Nº Int</th>
                  <th>Data</th>
                  <th>Turno</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
        `;    
        disps.forEach(d => {
          const sInfo = shifts.find(s => s.event_shift_date === d.event_shift_date && s.event_shift === d.event_shift);          
          const act = sInfo ? parseInt(sInfo.act_oper || 0) : 0;
          const nec = sInfo ? parseInt(sInfo.nec_oper || 0) : 0;          
          const isFull = act >= nec;
          const canAction = !isFull || d.shift_state === 'Aprovado';
          const rowClass = (isFull && d.shift_state !== 'Aprovado') ? 'row-full' : '';
          const statusClass = (isFull && d.shift_state !== 'Aprovado') ? 'bg-default' : getStatusClass(d.shift_state);
          const statusText = (isFull && d.shift_state !== 'Aprovado') ? 'Turno Cheio' : d.shift_state;    
          html += `
            <tr id="disp-row-${d.id}" class="${rowClass}">
              <td>${d.n_int}</td>
              <td>${formatDateDisplay(d.event_shift_date)}</td>
              <td>${d.event_shift} <br><small style="color:#666">Vagas: ${act}/${nec}</small></td>
              <td>
                <span class="status-badge ${statusClass}" data-state="${d.shift_state}">
                  ${statusText}
                </span>
              </td>
              <td>
                <div class="action-btn-container">
                  ${canAction ? `
                    <button title="Aprovar" class="action-btn approve-btn" 
                      onclick="updateState(${d.id}, 'Aprovado', '${d.event.replace(/'/g, "\\'")}', '${d.event_shift_date}', '${d.event_shift}')">✓</button>
                    <button title="Rejeitar" class="action-btn reject-btn" 
                      onclick="updateState(${d.id}, 'Não Aprovado', '${d.event.replace(/'/g, "\\'")}', '${d.event_shift_date}', '${d.event_shift}')">✕</button>
                  ` : '<small style="color:#999">Esgotado</small>'}
                </div>
              </td>
            </tr>
          `;
        });    
        html += `</tbody></table></div>`;
        return html;    
      } catch (e) {
        console.error("Erro em buildDispTable:", e);
        return "<div style='color:red; padding:10px;'>Erro ao processar tabela de detalhes.</div>";
      }
    }
    /* ======================== TOGGLE DISPLAY ========================= */
    async function toggleDisp(eventName, btn) {
      const safeId = eventName.replace(/\W/g,'');
      const container = document.getElementById(`container-${safeId}`);
      const trParent = document.getElementById(`row-expand-${safeId}`);
      if (trParent.style.display !== 'table-row') {
        document.querySelectorAll('.expandable').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.view-btn').forEach(b => { 
          b.textContent = 'Ver'; 
          b.classList.remove('close-btn');
        });
      }
      if (trParent.style.display === 'table-row') {
        trParent.style.display = 'none'; 
        btn.textContent = 'Ver'; 
        btn.classList.remove('close-btn');
        return;
      }
      btn.textContent = 'Fechar';
      btn.classList.add('close-btn');
      trParent.style.display = 'table-row';
      container.innerHTML = "<em>A carregar...</em>";
      try {
        container.innerHTML = await buildDispTable(eventName);
      } catch(e) {
        console.error(e);
        container.innerHTML = "Erro ao carregar detalhes.";
      }
    }
    /* ========================= REFRESH TABLE ========================= */
    async function refreshTableOnly(eventName, safeId) {
      const container = document.getElementById(`container-${safeId}`);
      try {
        const newContent = await buildDispTable(eventName);
        container.innerHTML = newContent;
      } catch(e) { 
        console.error(e);
      }
    }
    /* ========================= UPDATE STATE ========================= */
    async function updateState(id, newState, evName, sDate, sTime) {
      const row = document.getElementById(`disp-row-${id}`);
      const badge = row.querySelector('.status-badge');
      const oldState = badge.dataset.state;
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";    
      if (oldState === newState) return;    
      try {
        if (newState === 'Aprovado') {
          const r = await fetch(
            `${SUPABASE_URL}/rest/v1/event_shifts?event=eq.${encodeURIComponent(evName)}&event_shift_date=eq.${sDate}&event_shift=eq.${sTime}&corp_oper_nr=eq.${corp_oper_nr}`, 
            { headers: getSupabaseHeaders() }
          );
          const s = await r.json();          
          if (s.length > 0) {
            const currentAct = parseInt(s[0].act_oper) || 0;
            const currentNec = parseInt(s[0].nec_oper) || 0;
            
            if (currentAct >= currentNec) { 
              alert("Turno já está preenchido! Não há vagas disponíveis.");
              return;
            }
          }
        }
        const rUp = await fetch(`${SUPABASE_URL}/rest/v1/event_disp?id=eq.${id}`, {
          method: 'PATCH', 
          headers: getSupabaseHeaders(), 
          body: JSON.stringify({ shift_state: newState })
        });        
        if (!rUp.ok) throw new Error("Erro ao atualizar estado");
        let inc = 0;
        if (newState === 'Aprovado' && oldState !== 'Aprovado') {
          inc = 1;
        } else if (newState !== 'Aprovado' && oldState === 'Aprovado') {
          inc = -1;
        }
        if (inc !== 0) {
          const rGet = await fetch(
            `${SUPABASE_URL}/rest/v1/event_shifts?event=eq.${encodeURIComponent(evName)}&event_shift_date=eq.${sDate}&event_shift=eq.${sTime}&corp_oper_nr=eq.${corp_oper_nr}`, 
            { headers: getSupabaseHeaders() }
          );
          const cur = await rGet.json();          
          if (cur.length > 0) {
            const currentActOper = parseInt(cur[0].act_oper) || 0;
            const newActOper = Math.max(0, currentActOper + inc);            
            await fetch(`${SUPABASE_URL}/rest/v1/event_shifts?id=eq.${cur[0].id}`, {
              method: 'PATCH', 
              headers: getSupabaseHeaders(), 
              body: JSON.stringify({ act_oper: newActOper })
            });
          }
        }
        const safeId = evName.replace(/\W/g,'');
        await refreshTableOnly(evName, safeId);    
      } catch (e) { 
        console.error("Erro no updateState:", e);
        alert("Erro ao atualizar disponibilidade. Verifique a sua ligação.");
      }
    }
    /* ========================= DELETE EVENT ========================= */
    async function deleteFullEvent(eventName) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr') || "0805";
      const confirmation = confirm(`Deseja eliminar o evento "${eventName}"?`);
      if (!confirmation) return;    
      try {
        const headers = getSupabaseHeaders();
        const filter = `event=eq.${encodeURIComponent(eventName)}&corp_oper_nr=eq.${corp_oper_nr}`;        
        await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/event_list?${filter}`, { method: 'DELETE', headers }),
          fetch(`${SUPABASE_URL}/rest/v1/event_shifts?${filter}`, { method: 'DELETE', headers }),
          fetch(`${SUPABASE_URL}/rest/v1/event_disp?${filter}`, { method: 'DELETE', headers })
        ]);        
        alert("Eliminado com sucesso.");
        loadEvents();
      } catch (e) {
        console.error(e);
      }
    }
