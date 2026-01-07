/* =======================================
    VACATIONS
    ======================================= */
     document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (btn && btn.getAttribute('data-page') === 'page-vacations-request') {
        console.log("A carregar eventos para consulta...");
        await loadVacationsAdmin();
      }
    });
    /* === LOAD VACATIONS SOLICITATIONS === */    
    async function loadVacationsAdmin() {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const tbody = document.getElementById('vacationsSummaryBody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="4">A carregar pedidos...</td></tr>';
       try {
         const res = await fetch(`${SUPABASE_URL}/rest/v1/ped_vacat?corp_oper_nr=eq.${corp_oper_nr}&order=year.desc,month.desc`, {
           headers: getSupabaseHeaders()
         });
         const allData = await res.json();
         if (!allData || allData.length === 0) {
           tbody.innerHTML = '<tr><td colspan="4">Não existem pedidos de férias registados.</td></tr>';
           return;
         }
         const summary = {};
         allData.forEach(item => {
           const key = `${item.year}-${item.month}`;
           if (!summary[key]) {
             summary[key] = { year: item.year, month: item.month, total: 0, pending: 0 };
           }
           summary[key].total++;
           if (item.state === 'Em Aprovação') summary[key].pending++;
         });
         const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
         let html = '';
         Object.values(summary).forEach((s, index) => {
           const rowId = `details-vacat-${index}`;
           const counterId = `pending-count-${s.year}-${s.month}`;
           html += `
             <tr>
               <td><b>${monthNames[s.month - 1]} ${s.year}</b></td>
               <td>${s.total}</td>
               <td>
                 <span id="${counterId}" style="color: ${s.pending > 0 ? '#e67e22' : '#27ae60'}; font-weight: bold;">${s.pending}</span>
               </td>
               <td>
                  <button class="view-btn" onclick="toggleVacatDetails('${rowId}', ${s.month}, ${s.year})">Ver</button>
               </td>
             </tr>
             <tr id="${rowId}" class="expandable" style="display: none;">
               <td colspan="4" id="content-${rowId}" style="padding:15px; background:#f0f0f0"></td>
             </tr>
           `;
         });
         tbody.innerHTML = html;
       } catch (err) {
         console.error(err);
         tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Erro ao carregar dados.</td></tr>';
       }
    }
    /* ========== TOGGLE DISPLAY ========== */
    async function toggleVacatDetails(rowId, month, year) {
      const trParent = document.getElementById(rowId);
      const container = document.getElementById(`content-${rowId}`);
      const btn = event.target;
      if (trParent.style.display !== 'table-row') {
        document.querySelectorAll('.expandable').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.view-btn').forEach(b => {
          b.textContent = "Ver";
          b.classList.remove('close-btn');
        });
        trParent.style.display = 'table-row';
        btn.textContent = "Fechar";
        btn.classList.add('close-btn');
        container.innerHTML = "<em>A carregar...</em>";
        container.innerHTML = await buildVacatTable(month, year);
      } else {
        trParent.style.display = 'none';
        btn.textContent = "Ver";
        btn.classList.remove('close-btn');
      }
    }    
    /* ====== BUILD VACATIONS TABLE ======= */
    async function buildVacatTable(month, year) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      try {
        const rVacat = await fetch(
          `${SUPABASE_URL}/rest/v1/ped_vacat?month=eq.${month}&year=eq.${year}&corp_oper_nr=eq.${corp_oper_nr}&order=n_int.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        const vacations = await rVacat.json();
        const nInts = [...new Set(vacations.map(v => v.n_int))];        
        const rElems = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp_oper_nr}&n_int=in.(${nInts.join(',')})&select=n_int,full_name,patent`, {
            headers: getSupabaseHeaders()
          }
        );
        const elems = await rElems.json();
        const elemMap = {};
        elems.forEach(e => { elemMap[e.n_int] = e; });    
        let html = `
        <div class="table-responsive-event">
          <table>
            <thead>
              <tr>
                <th>Nº Int</th>
                <th>Patente</th>
                <th>Nome</th>
                <th>Dias</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
          <tbody>
        `;    
        vacations.forEach(v => {
          const elem = elemMap[v.n_int] || { full_name: v.n_int, patent: '---' };
          const statusClass = getVacatiosStatusClass(v.state);    
          html += `
            <tr id="vacat-row-${v.id}">
              <td>${v.n_int}</td>
              <td>${elem.patent}</td>
              <td>${elem.full_name}</td>
              <td><strong>${formatDaysGrouped(v.day)}</strong></td>
              <td><span class="status-badge ${statusClass}" id="badge-${v.id}">${v.state}</span></td>
              <td>
                <div class="action-btn-container">
                  <button title="Aprovar" class="action-btn approve-btn" onclick="updateVacatState(${v.id}, 'Aprovadas', ${year}, ${month})">✓</button>
                  <button title="Rejeitar" class="action-btn reject-btn" onclick="updateVacatState(${v.id}, 'Recusadas', ${year}, ${month})">✕</button>
                </div>
              </td>
            </tr>
          `;
        });
        html += `</tbody></table></div>`;
        return html;
      } catch (e) {
        console.error(e);
        return "<div style='color:red;'>Erro ao processar detalhes.</div>";
      }
    }    
    /* ====== UPDATE VACATIONS STATE ====== */
    async function updateVacatState(id, newState, year, month) {
      try {
        const badge = document.getElementById(`badge-${id}`);
        const oldState = badge ? badge.textContent.trim() : "";
        if (oldState === newState) return;
        const respPed = await fetch(`${SUPABASE_URL}/rest/v1/ped_vacat?id=eq.${id}`, {
          headers: getSupabaseHeaders()
        });
        const [request] = await respPed.json();
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ped_vacat?id=eq.${id}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({ state: newState })
        });    
        if (res.ok) {
          if (newState === 'Aprovadas') {
            await deleteDaysOnVacation(request);
            await recordDaysOnVacation(request);
          } else if (oldState === 'Aprovadas' && newState !== 'Aprovadas') {
            await deleteDaysOnVacation(request);
          }
          const msgNotif = newState === 'Aprovadas' 
            ? `As tuas férias de ${month}/${year} foram aprovadas! ✅` 
            : `O teu pedido de férias para ${month}/${year} foi colocado como: ${newState}.`;    
          await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
            method: 'POST',
            headers: getSupabaseHeaders(),
            body: JSON.stringify({n_int: request.n_int, corp_oper_nr: request.corp_oper_nr, title: "Gestão de Férias", message: msgNotif, is_read: false, created_at: new Date().toISOString()})
          });
          if (badge) {
            badge.textContent = newState;
            badge.className = `status-badge ${getVacatiosStatusClass(newState)}`;
          }
          if (oldState === "Em Aprovação") {
            const counterSpan = document.getElementById(`pending-count-${year}-${month}`);
            if (counterSpan) {
              let currentVal = parseInt(counterSpan.textContent) || 0;
              if (currentVal > 0) {
                let newVal = currentVal - 1;
                counterSpan.textContent = newVal;
                if (newVal === 0) counterSpan.style.color = '#27ae60';
              }
            }
          }          
          console.log("Fluxo concluído: Base de dados atualizada e notificação enviada.");
    
        } else {
          throw new Error("Falha ao atualizar o estado no servidor.");
        }    
      } catch (err) {
        console.error("Erro no fluxo updateVacatState:", err);
        alert("Erro ao processar alteração.");
      }
    }    
    /* ========== SAVA VACATIONS ========== */
    async function recordDaysOnVacation(request) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const respElem = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${request.n_int}&corp_oper_nr=eq.${corp_oper_nr}`, {
        headers: getSupabaseHeaders()
      });
      const [elem] = await respElem.json();
      if (!elem) return;    
      const listaDias = request.day.split(',').map(d => d.trim());    
      const promises = listaDias.map(dia => fetch(`${SUPABASE_URL}/rest/v1/reg_serv`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({n_int: request.n_int, section: elem.section, abv_name: elem.abv_name, year: request.year, month: request.month, day: parseInt(dia), value: "FE", corp_oper_nr: corp_oper_nr})
        })
      );
      await Promise.all(promises);
    }    
    /* ========= DELETE VACATIONS ========= */
    async function deleteDaysOnVacation(request) {
      const corp_oper_nr = sessionStorage.getItem('currentCorpOperNr');
      const query = `n_int=eq.${request.n_int}&year=eq.${request.year}&month=eq.${request.month}&value=eq.FE&corp_oper_nr=eq.${corp_oper_nr}`;      
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_serv?${query}`, {
          method: 'DELETE',
          headers: getSupabaseHeaders()
        });       
      } catch (err) {
        console.error("Erro ao apagar dias de férias:", err);
      }
    }
    function formatDaysGrouped(daysString) {
      const days = daysString.split(',').map(Number).sort((a, b) => a - b);
      let groups = [], start = days[0], end = start;
      for (let i = 1; i <= days.length; i++) {
        if (days[i] === end + 1) { end = days[i]; } 
        else {
          groups.push(start === end ? String(start).padStart(2,'0') : `${String(start).padStart(2,'0')} a ${String(end).padStart(2,'0')}`);
          start = days[i]; end = start;
        }
      }
      return groups.join(', ');
    }
    function getVacatiosStatusClass(state) {
      const s = state ? state.trim() : '';      
      if (s === 'Aprovadas' || s === 'Aprovado') return 'bg-approved';
      if (s === 'Recusadas' || s === 'Não Aprovado' || s === 'Rejeitado') return 'bg-rejected';
      return 'bg-pending';
    }
