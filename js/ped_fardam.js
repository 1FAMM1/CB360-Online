    /* =======================================
    PEDIDOS DE FARDAMENTO
    (colar no fomioprogramatics, a seguir à secção VACATIONS)
    Pedidos: tabela uniform_orders (feitos na Mobile, página SolFardam)
    Artigos: tabela uniform_items (lista que a Mobile mostra)
    ======================================= */
    let unifOrdersCache = [];
    let unifElemMap = {};
    let unifItemsCache = [];
    const UNIF_TH = 'padding: 6px 5px; border: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #333;';
    function unifEsc(v) {
      return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    }
    function unifCorp() {
      const c = sessionStorage.getItem('currentCorpOperNr');
      return c ? c.padStart(4, "0") : null;
    }
    function unifFmtDate(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      return d.toLocaleDateString('pt-PT', {day: '2-digit', month: '2-digit', year: 'numeric'}) + ' ' +
             d.toLocaleTimeString('pt-PT', {hour: '2-digit', minute: '2-digit'});
    }
    function unifBadge(state) {
      const colors = {"Em Aprovação": "#f39c12", "Aprovado": "#0282fa", "Entregue": "#2e7d32", "Rejeitado": "#e53935"};
      return `<span style="background:${colors[state] || '#7f8c8d'}; color:#fff; padding:3px 8px; border-radius:50px; font-size:11px; white-space:nowrap;">${unifEsc(state)}</span>`;
    }
    document.addEventListener('click', async function(e) {
      const btn = e.target.closest('.sidebar-sub-submenu-button');
      if (!btn) return;
      const page = btn.getAttribute('data-page');
      if (page === 'page-uniform-orders') await unifLoadOrders();
      if (page === 'page-uniform-items') await unifLoadItems();
    });
    /* ========== PEDIDOS: CARREGAR ========== */
    async function unifLoadOrders() {
      const tbody = document.getElementById('unifOrdersBody');
      const corp = unifCorp();
      if (!tbody || !corp) return;
      tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH}">A carregar pedidos...</td></tr>`;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_orders?select=id,n_int,items,notes,status,order_date,approved_date,delivery_date,delivery_n_int&corp_oper_nr=eq.${corp}&order=order_date.desc&limit=500`, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        unifOrdersCache = await res.json();
        const nInts = [...new Set(unifOrdersCache.flatMap(o => [o.n_int, o.delivery_n_int]).filter(v => v !== null && v !== undefined && v !== ""))];
        unifElemMap = {};
        if (nInts.length) {
          const rElems = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp}&n_int=in.(${nInts.join(',')})&select=n_int,full_name,abv_name,patent`, {
            headers: getSupabaseHeaders()
          });
          if (rElems.ok) (await rElems.json()).forEach(e => unifElemMap[String(e.n_int)] = e);
        }
        unifRenderOrders();
      } catch (err) {
        console.error("Erro ao carregar pedidos de fardamento:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH} color:red;">Erro ao carregar os pedidos.</td></tr>`;
      }
    }
    /* ========== PEDIDOS: DESENHAR (com filtro) ========== */
    function unifRenderOrders() {
      const tbody = document.getElementById('unifOrdersBody');
      if (!tbody) return;
      const filter = document.getElementById('unifStateFilter')?.value || 'pendentes';
      const search = (document.getElementById('unifSearch')?.value || '').trim().toLowerCase();
      const rows = unifOrdersCache.filter(o => {
        if (filter === 'pendentes' && !['Em Aprovação', 'Aprovado'].includes(o.status)) return false;
        if (!['pendentes', 'todos'].includes(filter) && o.status !== filter) return false;
        if (search) {
          const el = unifElemMap[String(o.n_int)] || {};
          if (!String(o.n_int).includes(search) && !String(el.full_name || '').toLowerCase().includes(search)) return false;
        }
        return true;
      });
      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH} color:#666;">Sem pedidos para mostrar.</td></tr>`;
        return;
      }
      const btnStyle = 'padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold; color: #fff;';
      tbody.innerHTML = rows.map(o => {
        const el = unifElemMap[String(o.n_int)] || {};
        const items = (o.items || []).map(i =>
          `<div>${unifEsc(i.quantity)}x <b>${unifEsc(i.articleLabel || i.article)}</b>${i.size && i.size !== 'N/A' ? ' · Tam. ' + unifEsc(i.size) : ''}${i.brand && i.brand !== 'Não Aplicável' ? ' · ' + unifEsc(i.brand) : ''}</div>`
        ).join('');
        const notes = o.notes ? `<div style="color:#666; font-style:italic; margin-top:3px;">"${unifEsc(o.notes)}"</div>` : '';
        const meta = [];
        if (o.approved_date) meta.push(`Aprovado ${unifFmtDate(o.approved_date)}`);
        if (o.delivery_date) {
          const who = unifElemMap[String(o.delivery_n_int)];
          meta.push(`Entregue ${unifFmtDate(o.delivery_date)}${o.delivery_n_int ? ' por ' + unifEsc(who?.abv_name || who?.full_name || 'Nº ' + o.delivery_n_int) : ''}`);
        }
        let actions = '—';
        if (o.status === 'Em Aprovação') {
          actions = `<button title="Aprovar" onclick="unifSetState(${o.id}, 'Aprovado')" style="${btnStyle} background:#2e7d32;">✓</button>
                     <button title="Rejeitar" onclick="unifSetState(${o.id}, 'Rejeitado')" style="${btnStyle} background:#e53935;">✕</button>`;
        } else if (o.status === 'Aprovado') {
          actions = `<button title="Marcar como entregue" onclick="unifSetState(${o.id}, 'Entregue')" style="${btnStyle} background:#0282fa;">📦</button>
                     <button title="Rejeitar" onclick="unifSetState(${o.id}, 'Rejeitado')" style="${btnStyle} background:#e53935;">✕</button>`;
        }
        return `
          <tr>
            <td style="${UNIF_TH}">${unifFmtDate(o.order_date)}</td>
            <td style="${UNIF_TH}">${unifEsc(o.n_int)}</td>
            <td style="${UNIF_TH} text-align:left;">${unifEsc(el.patent ? el.patent + ' ' : '')}${unifEsc(el.full_name || '')}</td>
            <td style="${UNIF_TH} text-align:left;">${items}${notes}</td>
            <td style="${UNIF_TH}">${unifBadge(o.status)}${meta.length ? `<div style="font-size:10px; color:#777; margin-top:4px;">${meta.join('<br>')}</div>` : ''}</td>
            <td style="${UNIF_TH}"><div style="display:flex; gap:4px; justify-content:center;">${actions}</div></td>
          </tr>`;
      }).join('');
    }
    /* ========== PEDIDOS: MUDAR ESTADO ========== */
    async function unifSetState(id, newState) {
      const order = unifOrdersCache.find(o => o.id === id);
      if (!order || order.status === newState) return;
      const now = new Date().toISOString();
      const patch = {status: newState};
      if (newState === 'Aprovado') patch.approved_date = now;
      if (newState === 'Entregue') {
        patch.delivery_date = now;
        patch.delivery_n_int = sessionStorage.getItem('currentNInt') || null;
        if (!order.approved_date) patch.approved_date = now;
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_orders?id=eq.${id}`, {
          method: 'PATCH',
          headers: {...getSupabaseHeaders(), 'Prefer': 'return=representation'},
          body: JSON.stringify(patch)
        });
        if (!res.ok) throw new Error(await res.text());
        const [updated] = await res.json();
        if (!updated) throw new Error("Sem permissão para alterar este pedido.");
        Object.assign(order, updated);
        unifRenderOrders();
        const msg = newState === 'Aprovado' ? 'O teu pedido de fardamento foi aprovado! ✅'
                  : newState === 'Entregue' ? 'O teu pedido de fardamento foi marcado como entregue. 📦'
                  : 'O teu pedido de fardamento foi rejeitado. ❌';
        fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({n_int: order.n_int, corp_oper_nr: unifCorp(), title: "Pedidos de Fardamento", message: msg, is_read: false, created_at: now})
        }).catch(e => console.error('Erro notificação:', e));
        fetch('https://cb-360-app.vercel.app/api/sendPush', {
          method: 'POST',
          headers: cb360PushHeaders(),
          body: JSON.stringify({recipient_nint: Number(order.n_int), tipo: 'aviso', pagina: 'SolFardam', sender_name: "Pedidos de Fardamento", message_text: msg})
        }).catch(e => console.error('Erro Push:', e));   /* não espera pelo envio */
        showPopup('popup-success', `Pedido marcado como ${newState}.`);
      } catch (err) {
        console.error("Erro ao mudar estado do pedido:", err);
        showPopup('popup-danger', "Erro ao alterar o pedido: " + (err.message || err));
      }
    }
    /* ========== ARTIGOS: CARREGAR ========== */
    async function unifLoadItems() {
      const tbody = document.getElementById('unifItemsBody');
      const corp = unifCorp();
      if (!tbody || !corp) return;
      tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH}">A carregar artigos...</td></tr>`;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_items?select=id,code,label,size_type,brand,sort_order,active&corp_oper_nr=eq.${corp}&order=sort_order.asc,label.asc`, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        unifItemsCache = await res.json();
        unifRenderItems();
      } catch (err) {
        console.error("Erro ao carregar artigos:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="${UNIF_TH} color:red;">Erro ao carregar os artigos.</td></tr>`;
      }
    }
    function unifItemRowHTML(it) {
      const key = it ? it.id : 'new';
      const inp = 'width:100%; height:28px; padding:0 6px; font-size:12px; border:1px solid #ced4da; border-radius:4px; box-sizing:border-box;';
      const sizeSel = (v) => `
        <select id="unifSize_${key}" style="${inp}">
          <option value="" ${!v ? 'selected' : ''}>Sem tamanho</option>
          <option value="letter" ${v === 'letter' ? 'selected' : ''}>Letra (S, M, L…)</option>
          <option value="numeric" ${v === 'numeric' ? 'selected' : ''}>Número</option>
        </select>`;
      const nextOrder = unifItemsCache.reduce((m, x) => Math.max(m, x.sort_order || 0), 0) + 1;
      return `
        <tr style="${it ? (it.active ? '' : 'opacity:0.55;') : 'background:#fff8e1;'}">
          <td style="${UNIF_TH}"><input type="number" id="unifOrder_${key}" value="${it ? (it.sort_order ?? 0) : nextOrder}" style="${inp} text-align:center;"></td>
          <td style="${UNIF_TH}"><input type="text" id="unifLabel_${key}" value="${unifEsc(it ? it.label : '')}" placeholder="${it ? '' : 'Novo artigo...'}" maxlength="80" style="${inp}"></td>
          <td style="${UNIF_TH}">${sizeSel(it ? it.size_type : '')}</td>
          <td style="${UNIF_TH}"><input type="text" id="unifBrand_${key}" value="${unifEsc(it ? (it.brand || '') : '')}" placeholder="Não Aplicável" maxlength="60" style="${inp}"></td>
          <td style="${UNIF_TH}">${it ? `<input type="checkbox" id="unifActive_${key}" ${it.active ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;">` : ''}</td>
          <td style="${UNIF_TH}">
            <button onclick="unifSaveItem(${it ? it.id : 'null'})" style="padding: 4px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold; background: ${it ? '#ce1212' : '#2e7d32'}; color: #fff;">${it ? 'Guardar' : 'Adicionar'}</button>
          </td>
        </tr>`;
    }
    function unifRenderItems() {
      const tbody = document.getElementById('unifItemsBody');
      if (!tbody) return;
      tbody.innerHTML = unifItemRowHTML(null) + unifItemsCache.map(unifItemRowHTML).join('');
    }
    /* ========== ARTIGOS: GRAVAR (novo ou existente) ========== */
    function unifMakeCode(label) {
      let base = label.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'artigo';
      let code = base, n = 2;
      while (unifItemsCache.some(x => x.code === code)) code = `${base}_${n++}`;
      return code;
    }
    async function unifSaveItem(id) {
      const key = id === null ? 'new' : id;
      const label = (document.getElementById(`unifLabel_${key}`)?.value || '').trim();
      const sizeType = document.getElementById(`unifSize_${key}`)?.value || null;
      const brand = (document.getElementById(`unifBrand_${key}`)?.value || '').trim() || null;
      const sortOrder = parseInt(document.getElementById(`unifOrder_${key}`)?.value, 10) || 0;
      if (!label) return showPopup('popup-danger', "Indique o nome do artigo.");
      const dup = unifItemsCache.find(x => x.id !== id && x.label.trim().toLowerCase() === label.toLowerCase());
      if (dup) return showPopup('popup-danger', `Já existe um artigo com o nome "${dup.label}".`);
      const body = {label, size_type: sizeType || null, brand, sort_order: sortOrder};
      try {
        let res;
        if (id === null) {
          body.corp_oper_nr = unifCorp();
          body.code = unifMakeCode(label);
          body.active = true;
          res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_items`, {
            method: 'POST',
            headers: {...getSupabaseHeaders(), 'Prefer': 'return=representation'},
            body: JSON.stringify(body)
          });
        } else {
          body.active = !!document.getElementById(`unifActive_${key}`)?.checked;
          res = await fetch(`${SUPABASE_URL}/rest/v1/uniform_items?id=eq.${id}`, {
            method: 'PATCH',
            headers: {...getSupabaseHeaders(), 'Prefer': 'return=representation'},
            body: JSON.stringify(body)
          });
        }
        if (!res.ok) throw new Error(await res.text());
        const [saved] = await res.json();
        if (!saved) throw new Error("Sem permissão para gravar artigos.");
        showPopup('popup-success', id === null ? "Artigo adicionado." : "Artigo guardado.");
        await unifLoadItems();
      } catch (err) {
        console.error("Erro ao gravar artigo:", err);
        showPopup('popup-danger', "Erro ao gravar o artigo: " + (err.message || err));
      }
    }
