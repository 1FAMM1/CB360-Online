/* =======================================================================
   OCORRÊNCIAS ATIVAS · ATUALIZAÇÕES DO TERRENO (substitui o grupo do Telegram)
   - O telemóvel (Ocorrências em Curso) grava em ocr_field_updates (SQL 42) e as fotos,
     já tapadas, no bucket privado ocr_photos.
   - Aqui: tabela por baixo das Ocorrências Ativas + botão VER (modal com a informação,
     miniaturas, foto em grande e "Reter").
   - Tempo real pelo sinal "mudou" do canal cb360-ocr-<corporação>; se cair, volta a ler de 15 em 15 s.
   Só é preciso carregar este ficheiro em main.html (o cartão e o modal criam-se sozinhos).
   ======================================================================= */
(function () {
  const OFU = {date: null, rows: [], cur: null, urls: {}, lb: {list: [], i: 0}, rt: {client: null, ch: null, ok: false, retry: null, deb: null}, timer: null};
  const BUCKET = 'ocr_photos';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const corp = () => String(sessionStorage.getItem('currentCorpOperNr') || '').padStart(4, '0');
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const hdr = (extra = {}) => ({...getSupabaseHeaders(), 'Content-Type': 'application/json', ...extra});
  const $ = id => document.getElementById(id);
  const fmtDT = iso => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const note = (msg, type = 'popup-success') => (typeof showPopup === 'function' ? showPopup(type, msg) : console.log(msg));

  /* ----------------------------- estilos ----------------------------- */
  (function css() {
    if ($('ofu-css')) return;
    const st = document.createElement('style'); st.id = 'ofu-css';
    st.textContent = `
      #ofu-card {margin-top: 16px;}
      #ofu-card .ofu-head-right {margin-left: auto; display: flex; align-items: center; gap: 10px;}
      #ofu-card .ofu-badge {background: #fff; color: #c0392b; border-radius: 999px; padding: 2px 9px; font-size: 11px; font-weight: 800; display: none;}
      #ofu-card .ofu-badge.on {display: inline-block;}
      #ofu-card .ofu-filter {display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 12px; color: #555; flex-wrap: wrap;}
      #ofu-card .ofu-filter input[type=date] {height: 30px; border: 1px solid #c8c8c8; border-radius: 6px; padding: 0 8px; font: inherit;}
      #ofu-tbody tr.unread td {font-weight: 700; background: #fff5f5;}
      #ofu-tbody .ofu-new {background: #c0392b; color: #fff; border-radius: 999px; padding: 1px 7px; font-size: 9.5px; font-weight: 800; margin-left: 6px; letter-spacing: .4px;}
      #ofu-tbody .ofu-ret {color: #8a5a00; font-size: 10px; font-weight: 800; margin-left: 6px;}
      #ofu-tbody td {text-align: center; border: 1px solid #DEE2E6;}
      #ofu-tbody td.l {text-align: left;}
      #ofu-modal {display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5); justify-content: center; align-items: center; z-index: 1000;}
      #ofu-modal.open {display: flex;}
      #ofu-modal .ofu-box {background: #fff; border-radius: 10px; width: 92%; max-width: 640px; max-height: 88vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,.3);}
      #ofu-modal .ofu-body {padding: 14px 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; font-size: 13px;}
      #ofu-modal .ofu-grid {display: grid; grid-template-columns: 110px 1fr; gap: 6px 10px;}
      #ofu-modal .ofu-grid b {color: #555; font-size: 12px;}
      #ofu-modal .ofu-msg {white-space: pre-wrap; background: #f6f7f9; border: 1px solid #e3e6ea; border-radius: 8px; padding: 10px 12px; min-height: 40px;}
      #ofu-modal .ofu-thumbs {display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px;}
      #ofu-modal .ofu-thumbs button {border: 1px solid #ddd; padding: 0; border-radius: 8px; overflow: hidden; aspect-ratio: 4 / 3; background: #eee center / cover no-repeat; cursor: zoom-in;}
      #ofu-modal .ofu-ret-row {display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px dashed #d4a017; background: #fffbea; border-radius: 8px; font-size: 12px;}
      #ofu-modal .ofu-ret-row input {width: 15px; height: 15px; accent-color: #c0392b;}
      #ofu-modal .ofu-read {font-size: 11px; color: #888;}
      /* aspeto do modal */
      #ofu-modal .ofu-box {border-radius: 14px; max-width: 680px;}
      #ofu-modal .ofu-x {margin-left: auto; width: 28px; height: 28px; border-radius: 50%; border: 0; background: rgba(255,255,255,.18); color: #fff; cursor: pointer; font-size: 14px;}
      #ofu-modal .ofu-x:hover {background: rgba(255,255,255,.32);}
      #ofu-modal .ofu-body {padding: 18px 20px; gap: 14px; background: #f4f5f7;}
      #ofu-modal .ofu-hero {background: #fff; border-radius: 12px; padding: 14px 16px; border-left: 5px solid #c0392b; box-shadow: 0 1px 3px rgba(0,0,0,.06); display: flex; gap: 12px; align-items: flex-start;}
      #ofu-modal .ofu-hero-ico {flex: none; width: 42px; height: 42px; border-radius: 12px; background: #fdecea; color: #c0392b; display: flex; align-items: center; justify-content: center; font-size: 18px;}
      #ofu-modal .ofu-hero-main {flex: 1; min-width: 0;}
      #ofu-modal .ofu-hero-t {font-size: 16px; font-weight: 800; color: #222; line-height: 1.3;}
      #ofu-modal .ofu-hero-l {margin-top: 4px; font-size: 12.5px; color: #666; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: .02em;}
      #ofu-modal .ofu-pill {flex: none; padding: 4px 11px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; background: #fef3c7; color: #92400e;}
      #ofu-modal .ofu-pill.fin {background: #d1fae5; color: #065f46;}
      #ofu-modal .ofu-facts {display: grid; grid-template-columns: 1fr 1fr; gap: 10px;}
      #ofu-modal .ofu-fact {background: #fff; border-radius: 10px; padding: 10px 12px; display: flex; gap: 10px; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,.06); min-width: 0;}
      #ofu-modal .ofu-fact i {color: #c0392b; font-size: 15px; width: 18px; text-align: center;}
      #ofu-modal .ofu-fact small {display: block; font-size: 10.5px; color: #999; text-transform: uppercase; letter-spacing: .05em; font-weight: 700;}
      #ofu-modal .ofu-fact span {display: block; font-size: 13px; font-weight: 700; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
      #ofu-modal .ofu-sec {font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;}
      #ofu-modal .ofu-sec i {color: #c0392b;}
      #ofu-modal .ofu-msg {background: #fff; border: 0; border-left: 3px solid #c0392b; border-radius: 8px; padding: 12px 14px; font-size: 13.5px; color: #333; line-height: 1.5; box-shadow: 0 1px 3px rgba(0,0,0,.06);}
      #ofu-modal .ofu-thumbs button {border: 0; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.15); transition: transform .15s;}
      #ofu-modal .ofu-thumbs button:hover {transform: scale(1.03);}
      #ofu-modal .ofu-ret-row {border: 0; background: #fff; border-radius: 10px; padding: 12px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.06); cursor: pointer; gap: 12px;}
      #ofu-modal .ofu-ret-row input {position: absolute; opacity: 0; pointer-events: none;}
      #ofu-modal .ofu-sw {flex: none; width: 38px; height: 22px; border-radius: 999px; background: #ccc; position: relative; transition: background .2s;}
      #ofu-modal .ofu-sw::after {content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left .2s; box-shadow: 0 1px 2px rgba(0,0,0,.3);}
      #ofu-modal .ofu-ret-row input:checked + .ofu-sw {background: #d4a017;}
      #ofu-modal .ofu-ret-row input:checked + .ofu-sw::after {left: 19px;}
      #ofu-modal .ofu-ret-row small {display: block; color: #888; font-size: 11.5px; margin-top: 2px;}
      #ofu-modal .ofu-read {display: flex; align-items: center; gap: 6px; color: #2e7d32;}
      @media (max-width: 560px) {#ofu-modal .ofu-facts {grid-template-columns: 1fr;}}
      #ofu-lightbox {display: none; position: fixed; inset: 0; z-index: 1100; background: rgba(0,0,0,.92); align-items: center; justify-content: center;}
      #ofu-lightbox.open {display: flex;}
      #ofu-lightbox img {max-width: 92vw; max-height: 86vh; border-radius: 6px; box-shadow: 0 6px 24px rgba(0,0,0,.6);}
      #ofu-lightbox .ofu-lb-btn {position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(255,255,255,.15); color: #fff; font-size: 22px; cursor: pointer;}
      #ofu-lightbox .ofu-lb-prev {left: 18px;} #ofu-lightbox .ofu-lb-next {right: 18px;}
      #ofu-lightbox .ofu-lb-top {position: absolute; top: 14px; right: 18px; display: flex; gap: 10px; align-items: center; color: #fff; font-size: 12px;}
      #ofu-lightbox .ofu-lb-top a, #ofu-lightbox .ofu-lb-top button {color: #fff; background: rgba(255,255,255,.15); border: 0; border-radius: 6px; padding: 6px 10px; font: inherit; cursor: pointer; text-decoration: none;}`;
    document.head.appendChild(st);
  })();

  /* ----------------------------- cartão + modal (criados sozinhos) ----------------------------- */
  function mount() {
    const page = $('page-active_occurrences');
    if (!page || $('ofu-card')) return !!$('ofu-card');
    const first = page.querySelector('.wsms-card');
    const card = document.createElement('div');
    card.className = 'wsms-card'; card.id = 'ofu-card';
    card.innerHTML = `
      <div class="wsms-card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="opacity:.9;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <span>ATUALIZAÇÕES DO TERRENO</span>
        <span class="ofu-head-right"><span class="ofu-badge" id="ofu-badge"></span></span>
      </div>
      <div class="wsms-card-body">
        <div class="ofu-filter">
          <label>Dia <input type="date" id="ofu-date"></label>
          <span>As que ainda não foram vistas aparecem sempre, seja qual for o dia.</span>
        </div>
        <div style="overflow-x: auto;"><div class="table-container">
          <table id="ofu-table">
            <thead><tr>
              <th style="width: 110px;">Data/Hora</th>
              <th style="width: 260px;">Ocorrência</th>
              <th style="width: 280px;">Local</th>
              <th style="width: 110px;">Estado</th>
              <th style="width: 160px;">Enviado por</th>
              <th style="width: 70px;">Fotos</th>
              <th style="width: 80px;">Ver</th>
            </tr></thead>
            <tbody id="ofu-tbody"></tbody>
          </table>
        </div></div>
      </div>`;
    if (first && first.nextSibling) first.parentNode.insertBefore(card, first.nextSibling); else page.appendChild(card);

    const modal = document.createElement('div');
    modal.id = 'ofu-modal';
    modal.innerHTML = `
      <div class="ofu-box">
        <div class="wsms-card-header" style="background:#c0392b;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span>ATUALIZAÇÃO DO TERRENO</span>
          <button type="button" class="ofu-x" id="ofu-x" title="Fechar">✕</button>
        </div>
        <div class="ofu-body" id="ofu-body"></div>
        <div class="wsms-card-footer" style="justify-content: center;">
          <button type="button" class="btn wsms-btn-green" id="ofu-close" style="width: 40%;">FECHAR</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const lb = document.createElement('div');
    lb.id = 'ofu-lightbox';
    lb.innerHTML = `
      <div class="ofu-lb-top"><span id="ofu-lb-count"></span><a id="ofu-lb-dl" href="#" target="_blank" rel="noopener">Abrir / descarregar</a><button type="button" id="ofu-lb-close">Fechar ✕</button></div>
      <button type="button" class="ofu-lb-btn ofu-lb-prev" id="ofu-lb-prev">‹</button>
      <img id="ofu-lb-img" alt="">
      <button type="button" class="ofu-lb-btn ofu-lb-next" id="ofu-lb-next">›</button>`;
    document.body.appendChild(lb);

    $('ofu-date').value = OFU.date = today();
    $('ofu-date').onchange = e => { OFU.date = e.target.value || today(); load(); };
    $('ofu-close').onclick = closeModal;
    $('ofu-x').onclick = closeModal;
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    $('ofu-lb-close').onclick = () => lb.classList.remove('open');
    lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
    $('ofu-lb-prev').onclick = () => lbShow(OFU.lb.i - 1);
    $('ofu-lb-next').onclick = () => lbShow(OFU.lb.i + 1);
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowLeft') lbShow(OFU.lb.i - 1);
      if (e.key === 'ArrowRight') lbShow(OFU.lb.i + 1);
    });
    return true;
  }

  /* ----------------------------- ler e desenhar a tabela ----------------------------- */
  async function load() {
    if (!mount()) return;
    const from = new Date(OFU.date + 'T00:00:00'), to = new Date(OFU.date + 'T00:00:00'); to.setDate(to.getDate() + 1);
    const sel = 'id,occurrence_id,occurrence,local,status,message,photos,sender_nint,sender_name,created_at,is_read,read_at,read_by,retain';
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/ocr_field_updates?select=${sel}&corp_oper_nr=eq.${corp()}&created_at=gte.${from.toISOString()}&created_at=lt.${to.toISOString()}&order=created_at.desc`, {headers: hdr()}),
        fetch(`${SUPABASE_URL}/rest/v1/ocr_field_updates?select=${sel}&corp_oper_nr=eq.${corp()}&is_read=eq.false&order=created_at.desc&limit=100`, {headers: hdr()})
      ]);
      if (!r1.ok || !r2.ok) throw new Error('HTTP ' + (r1.ok ? r2.status : r1.status));
      const byId = new Map();
      [...await r2.json(), ...await r1.json()].forEach(x => byId.set(x.id, x));
      OFU.rows = [...byId.values()].sort((a, b) => (a.is_read - b.is_read) || (new Date(b.created_at) - new Date(a.created_at)));
      await senderNames(OFU.rows);
      draw();
    } catch (e) {
      console.warn('Atualizações do terreno:', e);
      const tb = $('ofu-tbody');
      if (tb && !OFU.rows.length) tb.innerHTML = '<tr><td colspan="7" style="padding: 20px; color: red;">Erro ao carregar as atualizações do terreno</td></tr>';
    }
  }
  /* "Enviado por": patente - nome (reg_elems) a partir do n.º interno de quem enviou; sem n.º fica o nome gravado */
  OFU.names = OFU.names || {};
  const normN = v => String(v ?? '').trim().replace(/^0+(?=\d)/, '');
  async function senderNames(rows) {
    const need = [...new Set(rows.map(x => normN(x.sender_nint)).filter(n => n && !(n in OFU.names)))];
    if (need.length) {
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,patent_abv,abv_name&corp_oper_nr=eq.${corp()}&n_int=in.(${need.join(',')})`, {headers: hdr()});
        if (r.ok) (await r.json()).forEach(e => { OFU.names[normN(e.n_int)] = [e.patent_abv, e.abv_name].filter(Boolean).join(' - '); });
      } catch (e) { console.warn('Nomes de quem enviou:', e); }
      need.forEach(n => { if (!(n in OFU.names)) OFU.names[n] = ''; });
    }
    rows.forEach(x => { x.sender_label = OFU.names[normN(x.sender_nint)] || x.sender_name || '—'; });
  }
  function draw() {
    const tb = $('ofu-tbody'); if (!tb) return;
    const unread = OFU.rows.filter(x => !x.is_read).length;
    const badge = $('ofu-badge');
    badge.textContent = `${unread} por ver`; badge.classList.toggle('on', unread > 0);
    if (!OFU.rows.length) {
      tb.innerHTML = '<tr><td colspan="7" style="padding: 20px; color: #6C757D;">Sem atualizações do terreno neste dia.</td></tr>';
      return;
    }
    tb.innerHTML = OFU.rows.map(x => `
      <tr class="${x.is_read ? '' : 'unread'}">
        <td>${fmtDT(x.created_at)}</td>
        <td class="l">${esc(x.occurrence || '—')}${x.is_read ? '' : '<span class="ofu-new">NOVO</span>'}${x.retain ? '<span class="ofu-ret">RETIDA</span>' : ''}</td>
        <td class="l">${esc(x.local || '—')}</td>
        <td>${esc(x.status || '—')}</td>
        <td>${esc(x.sender_label || x.sender_name || '—')}</td>
        <td>${(x.photos || []).length || '—'}</td>
        <td><button class="btn btn-danger" style="font-size: 10px;" data-ofu="${x.id}">VER</button></td>
      </tr>`).join('');
    tb.querySelectorAll('[data-ofu]').forEach(b => b.onclick = () => openModal(Number(b.dataset.ofu)));
  }

  /* ----------------------------- links temporários das fotos (bucket privado) ----------------------------- */
  async function signed(paths, expiresIn = 900) {
    const need = paths.filter(p => p && !(OFU.urls[p] && OFU.urls[p].exp > Date.now() + 60000));
    if (need.length) {
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}`, {method: 'POST', headers: hdr(), body: JSON.stringify({expiresIn, paths: need})});
      if (!r.ok) throw new Error('Fotos: HTTP ' + r.status);
      (await r.json()).forEach(x => {
        if (x && x.signedURL && x.path) OFU.urls[x.path] = {url: `${SUPABASE_URL}/storage/v1${x.signedURL}`, exp: Date.now() + expiresIn * 1000};
      });
    }
    return paths.map(p => (OFU.urls[p] || {}).url || '');
  }

  /* ----------------------------- modal ----------------------------- */
  async function openModal(id) {
    const x = OFU.rows.find(r => r.id === id); if (!x) return;
    OFU.cur = x;
    const photos = x.photos || [];
    const fin = /finaliz|encerr/i.test(x.status || '');
    $('ofu-body').innerHTML = `
      <div class="ofu-hero">
        <div class="ofu-hero-ico"><i class="fa-solid fa-fire"></i></div>
        <div class="ofu-hero-main">
          <div class="ofu-hero-t">${esc(x.occurrence || '—')}</div>
          <div class="ofu-hero-l"><i class="fa-solid fa-location-dot"></i>${esc(x.local || '—')}</div>
        </div>
        <span class="ofu-pill${fin ? ' fin' : ''}">${esc(x.status || '—')}</span>
      </div>
      <div class="ofu-facts">
        <div class="ofu-fact"><i class="fa-solid fa-user-shield"></i><div style="min-width:0;"><small>Enviado por</small><span>${esc(x.sender_label || x.sender_name || '—')}</span></div></div>
        <div class="ofu-fact"><i class="fa-regular fa-clock"></i><div style="min-width:0;"><small>Data / Hora</small><span>${new Date(x.created_at).toLocaleString('pt-PT')}</span></div></div>
      </div>
      <div><div class="ofu-sec"><i class="fa-solid fa-align-left"></i>Descrição</div><div class="ofu-msg">${esc(x.message || 'Sem descrição.')}</div></div>
      ${photos.length ? `<div><div class="ofu-sec"><i class="fa-solid fa-camera"></i>Fotos (${photos.length})</div><div class="ofu-thumbs" id="ofu-thumbs">${photos.map((p, i) => `<button type="button" data-i="${i}" title="Ver em grande"></button>`).join('')}</div></div>` : ''}
      <label class="ofu-ret-row"><input type="checkbox" id="ofu-retain" ${x.retain ? 'checked' : ''}><span class="ofu-sw"></span>
        <span><b>Reter</b><small>Não apagar automaticamente ao fim de 2 anos (pedido das autoridades, processo em curso…)</small></span></label>
      <div class="ofu-read" id="ofu-read">${x.is_read ? `<i class="fa-solid fa-check-double"></i>Vista ${x.read_by ? 'por ' + esc(x.read_by) + ' ' : ''}${x.read_at ? 'em ' + new Date(x.read_at).toLocaleString('pt-PT') : ''}` : ''}</div>`;
    $('ofu-modal').classList.add('open');
    $('ofu-retain').onchange = e => setRetain(x, e.target.checked);
    if (photos.length) {
      try {
        const urls = await signed(photos.map(p => p.thumb || p.path));
        document.querySelectorAll('#ofu-thumbs [data-i]').forEach(b => {
          const u = urls[+b.dataset.i];
          if (u) b.style.backgroundImage = `url("${u}")`;
          b.onclick = () => lbOpen(photos, +b.dataset.i);
        });
      } catch (e) { console.warn(e); note('Não foi possível carregar as fotos.', 'popup-danger'); }
    }
    if (!x.is_read) markRead(x);
  }
  function closeModal() { $('ofu-modal').classList.remove('open'); OFU.cur = null; }
  async function markRead(x) {
    const who = sessionStorage.getItem('currentUserDisplay') || sessionStorage.getItem('currentUserName') || sessionStorage.getItem('currentNInt') || 'Online';
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/ocr_field_updates?id=eq.${x.id}`, {method: 'PATCH', headers: hdr({Prefer: 'return=representation'}),
        body: JSON.stringify({is_read: true, read_at: new Date().toISOString(), read_by: who})});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const row = (await r.json())[0];
      if (row) Object.assign(x, row);
      draw();
    } catch (e) { console.warn('Marcar como vista:', e); }
  }
  async function setRetain(x, on) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/ocr_field_updates?id=eq.${x.id}`, {method: 'PATCH', headers: hdr(), body: JSON.stringify({retain: on})});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      x.retain = on; draw();
      note(on ? 'Atualização marcada para reter: não será apagada automaticamente.' : 'Deixou de estar retida.');
    } catch (e) {
      $('ofu-retain').checked = !on;
      note('Não foi possível alterar o "Reter": ' + e.message, 'popup-danger');
    }
  }

  /* ----------------------------- foto em grande ----------------------------- */
  function lbOpen(photos, i) { OFU.lb = {list: photos, i: 0}; $('ofu-lightbox').classList.add('open'); lbShow(i); }
  async function lbShow(i) {
    const L = OFU.lb.list; if (!L.length) return;
    OFU.lb.i = (i + L.length) % L.length;
    const p = L[OFU.lb.i];
    $('ofu-lb-count').textContent = `${OFU.lb.i + 1} / ${L.length}`;
    $('ofu-lb-prev').style.display = $('ofu-lb-next').style.display = L.length > 1 ? '' : 'none';
    try {
      const [u] = await signed([p.path]);
      $('ofu-lb-img').src = u; $('ofu-lb-dl').href = u;
    } catch (e) { note('Não foi possível abrir a foto.', 'popup-danger'); }
  }

  /* ----------------------------- tempo real (sinal do SQL 42) + rede de segurança ----------------------------- */
  function kick() { clearTimeout(OFU.rt.deb); OFU.rt.deb = setTimeout(load, 300); }
  async function rtConnect() {
    const rt = OFU.rt; clearTimeout(rt.retry);
    try {
      if (!rt.client) rt.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {accessToken: async () => sessionStorage.getItem('authToken')});
      if (rt.ch) { const old = rt.ch; rt.ch = null; try { await rt.client.removeChannel(old); } catch (_) {} }
      const ch = rt.client.channel(`cb360-ocr-${corp()}`)
        .on('broadcast', {event: 'mudou'}, kick)
        .subscribe(st => {
          if (rt.ch !== ch) return;
          if (st === 'SUBSCRIBED') { rt.ok = true; kick(); return; }
          rt.ok = false; rt.retry = setTimeout(rtConnect, 5000);
        });
      rt.ch = ch;
    } catch (e) { rt.ok = false; rt.retry = setTimeout(rtConnect, 15000); }
  }
  function start() {
    if (OFU.timer) return;
    load();
    const tick = () => { if (!document.hidden) load(); OFU.timer = setTimeout(tick, OFU.rt.ok ? 60000 : 15000); };
    OFU.timer = setTimeout(tick, 15000);
    const go = () => {
      rtConnect();
      setInterval(() => { const rt = OFU.rt; if (rt.client && (!rt.ch || rt.ch.state !== 'joined' || !rt.client.realtime.isConnected())) { rt.ok = false; rtConnect(); } }, 30000);
    };
    if (typeof SUPABASE_ANON_KEY === 'undefined') return;
    if (window.supabase && window.supabase.createClient) return go();
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    sc.onload = go;
    document.head.appendChild(sc);
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-page="page-active_occurrences"]')) setTimeout(load, 50); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 1500)); else setTimeout(start, 1500);
  window.ofuReload = load;
})();
