/* =======================================================================
   WSMS 360 · COMUNICAÇÃO WSMS
   - Este ficheiro cria as páginas todas do módulo (logo ao carregar, para o
     mainloader e o cardfieldscreator encontrarem os campos no arranque).
     Em main.html só fica um <div id="..." class="page"></div> por página.
   - Estilos num só bloco (#wsms-css); tudo dentro da função, nada global
     a não ser getOptelSignature (usada também na FOMIO e no Voluntariado).
   - Páginas: Bem-vindo · Ocorrências em Curso (+ POSIT e Nr. OC) · Inserir/Alterar
     Ocorrência · Encerrar Ocorrência · Solicitar Disponibilidades · Indisponibilidade
     de Veículos · Grelha do Município · SMS Pré-Hospitalar · Avisos METEO
   ======================================================================= */
(function () {
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const corp = () => sessionStorage.getItem('currentCorpOperNr');
  const PUSH_API = 'https://cb-360-app.vercel.app/api/sendPush';

  /* ----------------------------- ícones e peças comuns ----------------------------- */
  const ICON = {
    fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.25-2.5-.5-5.5 1-7 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    reload: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.24 1.01z"/>',
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    amb: '<path d="M19 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8l4 4v6a2 2 0 0 1-2 2z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><line x1="10" y1="9" x2="10" y2="13"/><line x1="8" y1="11" x2="12" y2="11"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    truck: '<rect x="1" y="9" width="15" height="10" rx="1"/><path d="M16 13h4l3 3v3h-7V13z"/><circle cx="5.5" cy="19.5" r="1.5"/><circle cx="18.5" cy="19.5" r="1.5"/>',
    warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    clip: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>',
    off: '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',
    ok: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    cloud: '<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/><line x1="16" y1="13" x2="16" y2="15"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="12" y1="15" x2="12" y2="17"/>'
  };
  const svg = (k, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${ICON[k]}</svg>`;
  const button = (cls, icon, text, act, extra = '') => `<button class="btn ${cls}" data-act="${act}"${extra}>${svg(icon, 13).replace('<svg ', '<svg class="bi" ')}${text}</button>`;
  const options = list => list.map(o => `<option>${o}</option>`).join('');
  /* campo: {id, label, type|tag:'select', w, c (centrado), ph, num (n.º de algarismos), dec, grow, row (label ao lado), opts, wrapId, hidden, attrs} */
  function field(f) {
    const style = f.w ? ` style="width:${f.w}px"` : '';
    const ctrl = f.tag === 'select' ? `<select id="${f.id}"${style}${f.attrs || ''}>${f.opts ? options(f.opts) : ''}</select>`
               : `<input type="${f.type || 'text'}" id="${f.id}"${style}${f.c ? ' class="c"' : ''}${f.ph ? ` placeholder="${f.ph}"` : ''}${f.num ? ` maxlength="${f.num}" data-num="${f.num}"` : ''}${f.dec ? ' maxlength="6" data-dec' : ''}${f.attrs || ''}>`;
    const cls = ['major-field', f.row ? 'row' : '', f.grow ? `major-field--${f.grow}` : ''].filter(Boolean).join(' ');
    return `<div class="${cls}"${f.wrapId ? ` id="${f.wrapId}"` : ''}${f.hidden ? ' hidden' : ''}><label for="${f.id}">${f.label}</label>${ctrl}</div>`;
  }
  const row = fields => `<div class="major-row">${fields.map(field).join('')}</div>`;
  const section = (label, inner) => `<div class="wsms-section">${label ? `<div class="wsms-section-label">${label}</div>` : ''}${inner}</div>`;
  const card = ({icon, title, body, foot = '', cls = '', attrs = '', head = 'wsms-card-header'}) => `
    <div class="wsms-card ${cls}"${attrs}>
      <div class="${head}">${svg(icon)}<span>${title}</span></div>
      <div class="wsms-card-body">${body}</div>
      <div class="wsms-card-footer">${foot}</div>
    </div>`;
  /* monta a página e liga os botões data-act */
  function mount(id, html, acts = {}) {
    const page = $(id);
    if (!page) return null;
    page.classList.add('wsms-pg');
    page.innerHTML = html;
    page.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (b && page.contains(b) && acts[b.dataset.act]) acts[b.dataset.act](b, e);
    });
    return page;
  }
  /* mensagem → caixa wsms_output + área de transferência + aviso */
  async function deliver(message, text = 'Mensagem criada e copiada! Pode colar no WhatsApp.', flag = true) {
    const out = $('wsms_output');
    if (out) out.value = message;
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(message).catch(() => {});
    showPopup('popup-success', text, flag);
    return message;
  }
  const missingPopup = list => showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list.map(f => `</li><li style="list-style:none;">• ${f}`).join('')}`);

  /* ----------------------------- estilos ----------------------------- */
  (function css() {
    if ($('wsms-css')) return;
    const st = document.createElement('style');
    st.id = 'wsms-css';
    st.textContent = `
      .wsms-pg [hidden] {display: none !important;}
      .wsms-pg .wsms-card.mb {margin-bottom: 10px;}
      .wsms-pg .wsms-card-header svg, .wsms-pg .wsms-card-header-ems svg {opacity: .9;}
      .wsms-pg svg.bi {margin-right: 6px; vertical-align: middle;}
      .wsms-pg .major-field.row {flex-direction: row; align-items: center; gap: 8px;}
      .wsms-pg input.c {text-align: center;}
      #active-occurrences-tbody td, #active-unavailability-tbody td {text-align: center; border: 1px solid #DEE2E6;}
      .wsms-pg td.empty {padding: 20px; color: #6C757D;}
      .wsms-pg td.empty.err {color: red;}
      .wsms-pg .wsms-send-row {display: flex; justify-content: flex-end; margin-bottom: 50px;}
      .wsms-pg textarea.wsms-ta {width: 100%; resize: vertical; border: 1px solid #c8c8c8; border-radius: 5px; padding: 8px; font-size: 12px; box-sizing: border-box;}
      /* bem-vindo */
      #page-wsms .major-card-body {font-family: 'Segoe UI', sans-serif;}
      #page-wsms .intro {font-size: 15px; margin-bottom: 20px; color: #333;}
      #page-wsms .feat-title {background: linear-gradient(90deg, #d5d5d5, #c9c9c9); padding: 15px 20px; border-left: 5px solid #171d8f; border-radius: 6px; margin-bottom: 20px;}
      #page-wsms ul {padding-left: 25px; line-height: 1.6;}
      #page-wsms li {margin-bottom: 8px;}
      #page-wsms .outro {margin-top: 40px; text-align: center; font-style: italic; color: #6c757d;}
      /* ocorrências em curso */
      #page-active_occurrences .posit-btn, #page-active_occurrences .occ-upd-btn {font-size: 10px;}
      #page-active_occurrences .occ-upd-btn {background: #2c3e50; color: #fff;}
      #popup-posit-modal {position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;}
      #popup-posit-modal .pp-box {background: #fff; border-radius: 10px; width: 90%; max-width: 420px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3); position: relative;}
      #popup-posit-modal .wsms-card-header {justify-content: center; background: #c0392b;}
      #popup-posit-modal .wsms-card-header svg {opacity: 1;}
      #popup-posit-modal .pp-body {padding: 16px 20px; display: flex; flex-direction: column; gap: 10px;}
      #popup-posit-modal #posit-error {color: #D8000C; background: #FFD2D2; padding: 8px 12px; border-radius: 6px; font-size: 12px; text-align: center;}
      #popup-posit-modal .major-field.row label {width: 90px; min-width: 90px;}
      #popup-posit-modal .major-field.row input, #popup-posit-modal .major-field.row select {flex: 1;}
      #popup-posit-modal #posit-time {flex: none; width: 70px;}
      #popup-posit-modal .pp-ta {gap: 4px;}
      #popup-posit-modal .pp-chk {display: flex; align-items: center; gap: 8px;}
      #popup-posit-modal .pp-chk input {width: 14px; height: 14px; accent-color: #c0392b; cursor: pointer;}
      #popup-posit-modal .pp-chk label {font-size: 12px; font-weight: 600; color: #444; cursor: pointer;}
      #popup-posit-modal .wsms-card-footer {justify-content: center;}
      #popup-posit-modal #posit-send-btn {width: 50%;}
      #occ-upd-modal {display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5); justify-content: center; align-items: center; z-index: 1000;}
      #occ-upd-modal.open {display: flex;}
      #occ-upd-modal .ou-box {background: #fff; border-radius: 14px; width: 92%; max-width: 620px; max-height: 88vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,.3);}
      #occ-upd-modal .wsms-card-header {background: #c0392b;}
      #occ-upd-modal .ou-x {margin-left: auto; width: 28px; height: 28px; border-radius: 50%; border: 0; background: rgba(255,255,255,.18); color: #fff; cursor: pointer;}
      #occ-upd-modal .ou-body {padding: 18px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f4f5f7; font-size: 13px;}
      #occ-upd-modal .ou-hero {background: #fff; border-radius: 12px; padding: 14px 16px; border-left: 5px solid #c0392b; box-shadow: 0 1px 3px rgba(0,0,0,.06); display: flex; gap: 12px; align-items: flex-start;}
      #occ-upd-modal .ou-hero > div:nth-child(2) {min-width: 0;}
      #occ-upd-modal .ou-ico {flex: none; width: 42px; height: 42px; border-radius: 12px; background: #fdecea; color: #c0392b; display: flex; align-items: center; justify-content: center; font-size: 18px;}
      #occ-upd-modal .ou-t {font-size: 16px; font-weight: 800; color: #222;}
      #occ-upd-modal .ou-l {margin-top: 4px; font-size: 12.5px; color: #666; text-transform: uppercase;}
      #occ-upd-modal .ou-pill {margin-left: auto; flex: none; padding: 4px 11px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #fef3c7; color: #92400e;}
      #occ-upd-modal .ou-facts {display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;}
      #occ-upd-modal .ou-fact {background: #fff; border-radius: 10px; padding: 10px 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); min-width: 0;}
      #occ-upd-modal .ou-fact small {display: block; font-size: 10.5px; color: #999; text-transform: uppercase; letter-spacing: .05em; font-weight: 700;}
      #occ-upd-modal .ou-fact span {display: block; font-weight: 700; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
      #occ-upd-modal .ou-nr {background: #fff; border-radius: 10px; padding: 12px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 6px;}
      #occ-upd-modal .ou-nr label {font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: .06em;}
      #occ-upd-modal .ou-nr input {height: 36px; border: 1px solid #c8c8c8; border-radius: 8px; padding: 0 10px; font: inherit; font-size: 14px; font-weight: 700;}
      #occ-upd-modal .ou-nr input:focus {outline: none; border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,.15);}
      #occ-upd-modal .ou-nr small {color: #888; font-size: 11.5px;}
      #occ-upd-modal .wsms-card-footer {justify-content: center; gap: 10px;}
      #occ-upd-modal .wsms-card-footer button {width: 30%;}
      @media (max-width: 560px) {#occ-upd-modal .ou-facts {grid-template-columns: 1fr 1fr;}}
      /* inserir ocorrência */
      #page_insert_occurrence .lbl-animal {color: #c0392b;}
      #page_insert_occurrence .lbl-animal span {font-weight: 400; text-transform: none; letter-spacing: 0;}
      #page_insert_occurrence #add-new-vehicle-btn {margin-top: -15px;}
      #page_insert_occurrence #vehicle-container {margin-top: -10px;}
      #page_insert_occurrence #wsms_output {display: none;}
      #page_insert_occurrence .wsms-card-footer .wsms-btn-green {margin: 0 10px;}
      /* encerrar ocorrência */
      #page_close_occurrence .cls-tabs {justify-content: center; padding: 10px 20px; border-bottom: 0.5px solid #e0e0e0;}
      #page_close_occurrence .cls-top {margin-bottom: -10px;}
      #page_close_occurrence .field-card-title.bar {display: flex; justify-content: space-between; align-items: center;}
      #page_close_occurrence .field-card-title .btn {height: 22px; padding: 0 10px; font-size: 11px;}
      #page_close_occurrence .field-card-title svg.bi {width: 11px; height: 11px; margin-right: 4px;}
      #page_close_occurrence .cls-in {padding: 6px 10px;}
      #page_close_occurrence .cls-area {padding: 8px 12px;}
      #page_close_occurrence .wsms-observ-card textarea {height: 70px;}
      /* SMS pré-hospitalar */
      #page-inem-services .wsms-card {margin: 0 0 25px 0;}
      #page-inem-services .ems-ticker {background: #fff5f5; overflow: hidden; width: 100%; padding: 6px 0; border-bottom: 1px solid #f5d0d0;}
      #page-inem-services .ems-ticker div {display: inline-block; white-space: nowrap; animation: ticker-scroll 45s linear infinite; color: #7b0000; font-size: 12px; font-weight: 600;
                                           font-family: 'Segoe UI', sans-serif; letter-spacing: .3px;}
      #popup-inem-type-modal .header-content {display: flex; align-items: center; gap: 8px;}
      #popup-inem-type-modal h3 {margin: 0; color: #ffffff; font-size: 13px; font-weight: 850; letter-spacing: 1px;}
      #popup-inem-type-modal ul {list-style: none; padding: 0; margin: 0;}
      #popup-inem-type-modal li {list-style: none; margin-bottom: 12px; display: flex; justify-content: center; gap: 30px;}
      #popup-inem-type-modal li label {display: flex; align-items: center; gap: 8px; cursor: pointer;}
      #popup-inem-type-modal li input {cursor: pointer !important;}
      #popup-inem-type-modal .popup-footer {gap: 10px;}
      #popup-inem-type-cancel-btn {background-color: #6C757D;}
    `;
    document.head.appendChild(st);
  })();

  /* =======================================================================
     BEM-VINDO
     ======================================================================= */
  const FEATURES = [['🚨', 'Ocorrências em Curso', 'visualização dinâmica e em tempo real de todas as ocorrências ativas.'],
                    ['📝', 'Nova ou Alteração de Ocorrência', 'criação e atualização de ocorrências com fluxos simplificados e validados automaticamente.'],
                    ['✅', 'Encerramento de Ocorrências', 'finalização estruturada de registos com histórico e rastreabilidade total.'],
                    ['📋', 'Solicitação de Disponibilidades', 'comunicação direta com os elementos, para recolha de disponibilidades operacionais.'],
                    ['🚒', 'Indisponibilidade de Veículos', 'registo rápido e envio automático do estado dos meios às entidades competentes.'],
                    ['📊', 'Informação do Estado da Grelha Intermunicipal', 'atualização e consulta imediata da disponibilidade municipal de recursos.'],
                    ['🚑', 'Serviços EMS', 'Disponibilização via WSMS de serviços de Emergência Médica, facilitando asu melhor percepção de escrita.'],
                    ['⛈️', 'Avisos METEO', 'Automatização de avisos meteorológicos via IPMA, com envio automático via WSMS, para mobilização de elementos, para eventos extremos.']];
  mount('page-wsms', `
    <div class="major-card major-last-card">
      <div class="major-card-header">BEM-VINDO À COMUNICAÇÃO WSMS</div>
      <div class="major-card-body">
        <p class="intro">O módulo <strong>COMUNICAÇÃO WSMS</strong> foi desenvolvido para garantir uma <strong>gestão simplificada, eficaz e de máxima precisão</strong> nas comunicações operacionais do seu Corpo de Bombeiros.
          Desenvolvido para garantir <strong>simplicidade, eficácia e máxima precisão</strong>, este sistema assegura que todas as comunicações sigam um formato padronizado, reduzindo erros e otimizando o fluxo
          informativo entre as entidades competentes, de forma automatizada e integrada.</p>
        <div class="feat-title"><strong>Funcionalidades Principais:</strong></div>
        <ul>${FEATURES.map(([i, t, d]) => `<li>${i} <strong>${t}</strong> – ${d}</li>`).join('')}</ul>
        <div class="outro">Utilize o menu lateral para aceder às ferramentas de gestão e comunicação do módulo WSMS.</div>
      </div>
      <div class="major-card-footer"></div>
    </div>`);

  /* =======================================================================
     OCORRÊNCIAS EM CURSO (+ POSIT + Nr. OC)
     ======================================================================= */
  (function activeOccurrences() {
    const page = mount('page-active_occurrences', `
      ${card({icon: 'fire', title: 'OCORRÊNCIAS ATIVAS',
              body: `<div style="overflow-x:auto;"><div class="table-container"><table id="active-occurrences-table"><thead><tr>
                       <th style="width:150px">Data/Hora Alerta</th><th style="width:300px">Descrição</th><th style="width:350px">Local</th><th style="width:300px">Localidade</th>
                       <th style="width:70px">Veículos</th><th style="width:100px">Estado</th><th style="width:80px">POSIT</th><th style="width:90px">Editar</th>
                     </tr></thead><tbody id="active-occurrences-tbody"></tbody></table></div></div>`,
              foot: button('wsms-btn-green', 'reload', 'ATUALIZAR LISTA', 'reload')})}
      <div id="popup-posit-modal" class="popup-modal" style="display:none;">
        <div class="pp-box">
          <div class="wsms-card-header">${svg('pin')}<span>POSIT</span></div>
          <div class="pp-body">
            <div id="posit-error" hidden></div>
            ${field({id: 'posit-description', label: 'Descrição', row: 1, attrs: ' readonly'})}
            ${field({id: 'posit-local', label: 'Local', row: 1, attrs: ' readonly'})}
            <input type="hidden" id="posit-localidade-hidden" value="">
            ${field({id: 'posit-status', label: 'Estado', row: 1, tag: 'select', opts: ['Em Curso', 'Em Resolução', 'Em Conclusão', 'Encerrada']})}
            ${field({id: 'posit-time', label: 'Hora POSIT', row: 1})}
            <div class="major-field pp-ta"><label for="posit-text">POSIT</label><textarea id="posit-text" rows="5" class="wsms-ta"></textarea></div>
            <div class="pp-chk"><input type="checkbox" id="desmobilizacao"><label for="desmobilizacao">Desmobilização de meios</label></div>
          </div>
          <div class="wsms-card-footer"><button id="posit-send-btn" class="btn wsms-btn-send">${svg('phone', 13).replace('<svg ', '<svg class="bi" ')}ENVIAR POSIT</button></div>
        </div>
      </div>`, {reload: () => loadActiveOccurrences()});
    if (!page) return;

    function parseDateTime(s) {
      if (!s) return null;
      const [datePart, timePart] = s.split(' ');
      if (!datePart || !timePart) return null;
      const [day, month, year] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    /* sem "piscar": as linhas novas são montadas fora da tabela e trocadas de uma vez, só quando algo mudou */
    let lastSig = null, rows = [];
    async function loadActiveOccurrences() {
      const tbody = $('active-occurrences-tbody');
      if (!tbody) return;
      const message = (html, sig) => { if (lastSig !== sig) { lastSig = sig; tbody.innerHTML = html; } };
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?select=*,vehicles&corp_oper_nr=eq.${corp()}&status=in.(Em Curso,Em Resolução,Em Conclusão)&order=id.asc`, {headers: getSupabaseHeaders()});
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const occ = await resp.json();
        if (!occ.length) return message('<tr><td colspan="9" class="empty">Não existem ocorrências ativas neste momento.</td></tr>', 'vazia');
        /* nada mudou desde a última leitura: não mexe na tabela */
        const sig = JSON.stringify(occ.map(o => [o.id, o.start_date, o.occorrence, o.local, o.localitie, o.vehicles, o.status, o.nr_oc]));
        if (sig === lastSig) return;
        rows = occ.map(o => {
          const d = parseDateTime(o.start_date);
          const date = d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}` : o.start_date;
          const count = Array.isArray(o.vehicles) ? o.vehicles.length : typeof o.vehicles === 'string' ? o.vehicles.split(',').filter(v => v.trim() !== '').length : 0;
          return {o, date, count};
        });
        const t = document.createElement('tbody');
        t.innerHTML = rows.map((r, i) => `<tr data-i="${i}"><td>${esc(r.date)}</td><td>${esc(r.o.occorrence)}</td><td>${esc(r.o.local)}</td><td>${esc(r.o.localitie)}</td><td>${r.count}</td>
          <td>${esc(r.o.status)}</td><td><button class="btn btn-danger posit-btn">POSIT</button></td><td><button class="btn occ-upd-btn" title="Atualizar (Nr. OC)">ATUALIZAR</button></td></tr>`).join('');
        tbody.replaceChildren(...t.children);
        lastSig = sig;
      } catch (error) {
        console.error('Erro ao carregar ocorrências ativas:', error);
        message('<tr><td colspan="9" class="empty err">Erro ao carregar ocorrências</td></tr>', 'erro');
      }
    }
    window.loadActiveOccurrences = loadActiveOccurrences;
    page.addEventListener('click', e => {
      const tr = e.target.closest('#active-occurrences-tbody tr[data-i]');
      if (!tr) return;
      const r = rows[+tr.dataset.i];
      if (e.target.closest('.posit-btn')) openPositPopup(r.o);
      else if (e.target.closest('.occ-upd-btn')) openOccUpdateModal(r.o, r.date, r.count);
    });

    /* ---------- ATUALIZAR OCORRÊNCIA (Nr. OC) ----------
       Grava o Nr. OC na ocorrência e copia-o para as atualizações do terreno e os POSIT dela (SQL 48). */
    function occUpdEnsure() {
      if ($('occ-upd-modal')) return;
      const m = document.createElement('div');
      m.id = 'occ-upd-modal';
      m.innerHTML = `
        <div class="ou-box">
          <div class="wsms-card-header"><i class="fa-solid fa-pen-to-square"></i><span>ATUALIZAR OCORRÊNCIA</span><button type="button" class="ou-x" id="ou-x" title="Fechar">✕</button></div>
          <div class="ou-body" id="ou-body"></div>
          <div class="wsms-card-footer"><button type="button" class="btn btn-danger" id="ou-cancel">CANCELAR</button><button type="button" class="btn wsms-btn-green" id="ou-save">GRAVAR</button></div>
        </div>`;
      document.body.appendChild(m);
      const close = () => m.classList.remove('open');
      $('ou-x').onclick = close;
      $('ou-cancel').onclick = close;
      m.addEventListener('click', e => { if (e.target === m) close(); });
    }
    function openOccUpdateModal(occ, formattedDate, vehiclesCount) {
      occUpdEnsure();
      $('ou-body').innerHTML = `
        <div class="ou-hero">
          <div class="ou-ico"><i class="fa-solid fa-fire"></i></div>
          <div><div class="ou-t">${esc(occ.occorrence || '—')}</div>
            <div class="ou-l"><i class="fa-solid fa-location-dot"></i> ${esc(occ.local || '—')}${occ.localitie ? ' · ' + esc(occ.localitie) : ''}</div></div>
          <span class="ou-pill">${esc(occ.status || '—')}</span>
        </div>
        <div class="ou-facts">
          <div class="ou-fact"><small>Data/Hora Alerta</small><span>${esc(formattedDate || '—')}</span></div>
          <div class="ou-fact"><small>Veículos</small><span>${vehiclesCount}</span></div>
          <div class="ou-fact"><small>Elementos</small><span>${esc(occ.elements ?? '—')}</span></div>
        </div>
        <div class="ou-nr">
          <label for="ou-nr-oc">Nr. OC</label>
          <input type="text" id="ou-nr-oc" maxlength="40" placeholder="N.º da ocorrência" value="${esc(occ.nr_oc || '')}">
          <small>Fica também em todas as atualizações do terreno e POSIT desta ocorrência (guardados 2 anos), e nas que forem enviadas depois.</small>
        </div>`;
      const inp = $('ou-nr-oc'), save = $('ou-save');
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); save.click(); } };
      save.disabled = false;
      save.onclick = async () => {
        save.disabled = true;
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cb360_set_nr_oc`, {method: 'POST', headers: getSupabaseHeaders(), body: JSON.stringify({p_occurrence_id: occ.id, p_nr_oc: inp.value.trim()})});
          if (!r.ok) {
            const t = await r.text().catch(() => '');
            throw new Error(r.status === 404 ? 'Falta o SQL 48 no Supabase.' : (/"message":"([^"]+)"/.exec(t) || [])[1] || `Erro ${r.status}`);
          }
          const res = await r.json().catch(() => ({}));
          $('occ-upd-modal').classList.remove('open');
          showPopup('popup-success', `Nr. OC gravado.${res && (res.atualizacoes || res.posit) ? ` Atualizado também em ${res.atualizacoes || 0} atualização(ões) do terreno e ${res.posit || 0} POSIT.` : ''}`);
          lastSig = null;
          loadActiveOccurrences();
          if (typeof window.ofuReload === 'function') window.ofuReload();
        } catch (e) {
          showPopup('popup-danger', 'Não foi possível gravar o Nr. OC: ' + e.message);
        } finally {
          save.disabled = false;
        }
      };
      $('occ-upd-modal').classList.add('open');
      setTimeout(() => inp.focus(), 50);
    }

    /* ---------- POSIT ---------- */
    let positId = null, positNrOc = null, positStatus0 = null;
    function openPositPopup(o) {
      positId = o.id; positNrOc = o.nr_oc || null; positStatus0 = o.status;
      $('posit-description').value = o.occorrence || '';
      $('posit-local').value = o.local || '';
      $('posit-localidade-hidden').value = o.localitie || '';
      $('posit-status').value = o.status || '';
      $('posit-text').value = '';
      $('posit-time').value = '';
      $('desmobilizacao').checked = false;
      $('popup-posit-modal').style.display = 'flex';
    }
    function closePositPopup() {
      $('popup-posit-modal').style.display = 'none';
      loadActiveOccurrences();
    }
    /* hora HH:MM enquanto se escreve */
    $('posit-time').addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
      const h = val.slice(0, 2), m = val.slice(2, 4);
      if ((h.length === 2 && Number(h) > 23) || (m.length === 2 && Number(m) > 59)) { e.target.value = ''; return; }
      e.target.value = m ? `${h}:${m}` : h;
    });
    $('posit-send-btn').onclick = async function () {
      if (!positId) return showPopup('popup-danger', 'Nenhuma ocorrência selecionada.');
      const occorrence = $('posit-description').value, local = $('posit-local').value, localidade = $('posit-localidade-hidden').value;
      const status = $('posit-status').value, horaPosit = $('posit-time').value.trim(), positText = $('posit-text').value.trim(), desmob = $('desmobilizacao').checked;
      if (!horaPosit || horaPosit.length < 5) return showPopup('popup-danger', 'Indique a hora do POSIT (HH:MM).');
      if (!positText) return showPopup('popup-danger', 'Indique o texto do POSIT.');
      const optel = await getOptelSignature();
      const mensagem = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*Ocorrência: ${occorrence}, _${local}, ${localidade}._*\n*\\\\POSIT: ${horaPosit},* _${positText}_` + (desmob ? ' _*Desmobilização dos Meios Integrantes.*_' : '') + optel;
      try {
        /* gravar o POSIT (histórico no telemóvel, SQL 47); não bloqueia o POSIT: se falhar, segue na mesma */
        try {
          const rp = await fetch(`${SUPABASE_URL}/rest/v1/ocr_posits`, {
            method: 'POST', headers: getSupabaseHeaders(),
            body: JSON.stringify({corp_oper_nr: String(corp() || '').padStart(4, '0'), occurrence_id: Number(positId) || null, occurrence: occorrence || null,
                                  local: [local, localidade].filter(Boolean).join(', ') || null, status, posit_time: horaPosit, posit: positText,
                                  demob: !!desmob, sender_name: optel.replace(/^\s*(OPTEL:\s*)?/, '').trim() || null, nr_oc: positNrOc})
          });
          if (!rp.ok) console.warn('Gravar POSIT:', rp.status, await rp.text().catch(() => ''));
        } catch (e) { console.warn('Gravar POSIT:', e); }
        if (status === 'Encerrada') {
          const del = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?id=eq.${positId}`, {method: 'DELETE', headers: getSupabaseHeaders()});
          if (!del.ok) throw new Error('Erro ao apagar ocorrência.');
        } else if (status !== positStatus0) {
          const upd = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?id=eq.${positId}`, {method: 'PATCH', headers: getSupabaseHeaders({returnRepresentation: true}), body: JSON.stringify({status})});
          if (!upd.ok) throw new Error('Erro ao atualizar status.');
        }
        /* push para todos os elementos; não bloqueia o POSIT */
        try {
          const tk = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
          let txt = `${occorrence}${local ? ' · ' + local : ''} — POSIT ${horaPosit}: ${positText}${desmob ? ' · Desmobilização dos meios' : ''}`;
          if (txt.length > 230) txt = txt.slice(0, 227) + '…';
          fetch(PUSH_API, {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${tk}`},
            body: JSON.stringify({recipient_nint: 'geral', tipo: 'aviso', pagina: status === 'Encerrada' ? '' : 'OnGoingOcr',
                                  sender_name: status === 'Encerrada' ? '🚨 POSIT · Ocorrência encerrada' : '🚨 POSIT', message_text: txt})
          }).catch(e => console.warn('Push POSIT:', e));
        } catch (e) { console.warn('Push POSIT:', e); }
        await navigator.clipboard.writeText(mensagem);
        showPopup('popup-success', 'POSIT criado, enviado aos elementos e copiado! Pode colar no WhatsApp.', true);
        setTimeout(closePositPopup, 500);
      } catch (err) {
        console.error('Erro no POSIT:', err);
        showPopup('popup-danger', 'Erro ao criar POSIT!');
      }
    };

    document.addEventListener('DOMContentLoaded', () => {
      document.querySelector('button[data-page="page-active_occurrences"]')?.addEventListener('click', () => loadActiveOccurrences());
      $('popup-posit-modal').style.display = 'none';
      loadActiveOccurrences();
    });
    async function refresh() {
      await loadActiveOccurrences();
      await occurrencesBlinker.update();
    }
    refresh();
    setInterval(refresh, 10000);
  })();

  /* =======================================================================
     INSERIR / ALTERAR OCORRÊNCIA
     ======================================================================= */
  (function insertOccurrence() {
    const page = mount('page_insert_occurrence', `
      ${card({icon: 'bolt', title: 'DADOS GLOBAIS DA NOVA OCORRÊNCIA', cls: 'mb', body:
        section('Local da Ocorrência',
          row([{id: 'alert_type', label: 'Tipo de Alerta', tag: 'select'}, {id: 'alert_source', label: 'Fonte do Alerta', tag: 'select'}, {id: 'ems_nr', label: 'Nr. CODU', ph: 'Ex. 123456789', wrapId: 'ems_group'}]) +
          row([{id: 'alert_date', label: 'Data do Alerta', type: 'date'}, {id: 'alert_time', label: 'Hora do Alerta', type: 'time'},
               {id: 'class_occorr_input', label: 'Class. de Ocorrência', ph: 'Ex. 3103', w: 140, c: 1, num: 4}, {id: 'occorr_descr_input', label: 'Descr. de Ocorrência', ph: 'Ex. Incêndio de Mato', hidden: 1},
               {id: 'nr_occurrence_input', label: 'Nr. de Ocorrência', ph: 'Ex. 123456789', w: 170, c: 1, num: 11}, {id: 'channel_maneuver', label: 'Canal de Manobra', tag: 'select', w: 130, opts: ['&nbsp;']}]) +
          row([{id: 'occorr_local_input', label: 'Morada da Ocorrência', ph: 'Ex. Rua Serpa Pinto, 00', grow: 'grow3'}, {id: 'occorr_localitie_input', label: 'Localidade', ph: 'Ex. Faro', grow: 'grow2'},
               {id: 'district_select', label: 'Distrito', tag: 'select', grow: 'grow2'}, {id: 'council_select', label: 'Concelho', tag: 'select', grow: 'grow2', opts: ['&nbsp;']},
               {id: 'parish_select', label: 'Freguesia', tag: 'select', grow: 'grow2'}])) +
        section('Outros Dados', `<div class="major-row">
          ${field({id: 'contact_name', label: 'Nome do Contactante', w: 250, ph: 'Ex. João Sousa'})}
          ${field({id: 'contact_nr', label: 'Nr. do Contactante', ph: 'Ex. 910 000 000', w: 150, c: 1, num: 9})}
          <div class="major-field major-field--grow"><label for="animal-type" class="lbl-animal">Tipo de Animal <span>(preencher se ocorrência for salvamento animal)</span></label><input type="text" id="animal-type" style="width:400px" placeholder="Ex. Canídeo"></div>
        </div>`) +
        section('Planos Prévios de Intervenção',
          row([{id: 'ppi_type', label: 'Tipo de PPI', tag: 'select'}, {id: 'alert_level', label: 'Nível de Alerta', tag: 'select', grow: 'grow2', opts: ['&nbsp;']},
               {id: 'alarm_grid', label: 'Grelha de Alarme', tag: 'select', w: 120, opts: ['&nbsp;']}, {id: 'km', label: 'Km', ph: '00', w: 75, c: 1, dec: 1},
               {id: 'on_going', label: 'Sentido', tag: 'select', grow: 'grow2'}, {id: 'incident_type', label: 'Tipo de Incidente', tag: 'select', grow: 'grow2'}]))})}
      ${card({icon: 'amb', title: 'VEÍCULOS AFETOS À OCORRÊNCIA', cls: 'last-card',
              body: `<div><button id="add-new-vehicle-btn" class="btn wsms-btn-blue" data-act="add">${svg('plus', 13).replace('<svg ', '<svg class="bi" ')}ADICIONAR</button></div>
                     <div class="grid-2fr" id="vehicle-container"></div>
                     <textarea id="wsms_output" rows="4" cols="50" readonly></textarea>`,
              foot: button('wsms-btn-green', 'phone', 'BOMBEIROS', 'wsms') + button('wsms-btn-send', 'phone', 'COMUNICAR CREPC', 'crepc')})}`,
      {add: () => NewOCRaddVehicle(), wsms: () => generateWSMSMessage(), crepc: () => generateNewCREPCMessage()});
    if (!page) return;
    const v = id => $(id)?.value || '';

    /* ---------- campos que dependem do tipo de alerta / PPI / fonte / classificação ---------- */
    const fill = (sel, list) => { sel.innerHTML = '<option value=""></option>' + list.map(o => `<option value="${o}">${o}</option>`).join(''); };
    function toggleAlertTypeFields() {
      const alertType = v('alert_type'), ppiType = v('ppi_type');
      const ppiTypeField = $('ppi_type'), alertLevel = $('alert_level'), alarmGrid = $('alarm_grid'), kmField = $('km'), onGoing = $('on_going'), incidentType = $('incident_type');
      const kmLabel = document.querySelector('label[for="km"]');
      const block = [ppiTypeField, alertLevel, alarmGrid, kmField, onGoing, incidentType];
      if (alertType !== 'Plano Prévio de Intervenção') {
        block.forEach(f => { f.value = ''; f.disabled = true; if (f.tagName === 'SELECT' && f !== ppiTypeField) f.innerHTML = '<option value=""></option>'; });
        kmLabel.textContent = 'Km:';
        return;
      }
      block.forEach(f => { f.disabled = false; });
      const airport = ppiType === 'PPI Aeroporto Gago Coutinho', a22 = ppiType === 'PPI Via do Infante - A22', rail = ppiType === 'PPI Linha Férrea do Algarve';
      if (airport) [kmField, onGoing, incidentType].forEach(f => { f.disabled = true; });
      kmLabel.textContent = rail ? 'Pkm:' : 'Km:';
      fill(alertLevel, airport ? ['AMARELO', 'VERMELHO'] : ppiType ? ['1º ALARME', '2º ALARME', 'ALARME ESPECIAL'] : []);
      fill(alarmGrid, airport ? ['A1', 'A2', 'A3', 'A4', 'B1'] : a22 ? [...'ABCDEFGHIJKLMNOPQRST'].flatMap(l => [`1${l}`, `2${l}`]) : rail ? [...'ABCDEFGHIJKLMNOP'] : []);
      fill(incidentType, a22 ? ['Acidente', 'Substâncias Perigosas', 'Incêndio em Transportes']
                       : rail ? ['Acidente - Abalroamento, Choque e Descarrilamento', 'Substâncias Perigosas - Produtos Químicos/Produtos Biológicos', 'Incêndio em Transportes'] : []);
      fill(onGoing, a22 ? ['Faro --- Vila Real de Santo António', 'Faro --- Portimão'] : rail ? ['Tunes --- Lagos', 'Tunes --- Vila Real de Santo António'] : []);
    }
    function toggleEMSNrField() {
      $('ems_group').style.display = ['CODU', 'INEM'].includes(v('alert_source')) ? 'flex' : 'none';
    }
    function toggleContactFields() {
      const on = ['Popular', 'Particular'].includes(v('alert_source'));
      ['contact_name', 'contact_nr'].forEach(id => { $(id).disabled = !on; if (!on) $(id).value = ''; });
    }
    function toggleAnimalTypeField() {
      const on = ['4331', '4333'].includes(v('class_occorr_input'));
      $('animal-type').disabled = !on;
      if (!on) $('animal-type').value = '';
    }

    function validateRequiredFields() {
      const miss = [];
      const alertSource = v('alert_source'), classOccorr = v('class_occorr_input');
      if (!v('alert_type')) miss.push('Tipo de Alerta');
      if (!alertSource) miss.push('Fonte do Alerta');
      if ($('ems_group').style.display !== 'none' && !v('ems_nr').trim()) miss.push('Nr. CODU');
      if (!v('alert_time')) miss.push('Hora do Alerta');
      if (!classOccorr) miss.push('Classificação da Ocorrência');
      if (!v('occorr_local_input')) miss.push('Local da Ocorrência');
      if (!v('occorr_localitie_input')) miss.push('Localidade da Ocorrência');
      if (alertSource === 'Popular') {
        if (!v('contact_name').trim()) miss.push('Nome do Contactante');
        if (!v('contact_nr').trim()) miss.push('Contacto do Contactante');
      }
      if (['4331', '4333'].includes(classOccorr) && !v('animal-type').trim()) miss.push('Tipo de Animal');
      if (![...document.querySelectorAll('.wsms-vehicle-card select')].some(s => s.value.trim() !== '')) miss.push('A ocorrência deve conter pelo menos 1 Veículo');
      if (!miss.length) return true;
      missingPopup(miss);
      return false;
    }
    /* veículos dos cartões (cardfieldscreator) */
    const cardVehicles = () => [...document.querySelectorAll('.wsms-vehicle-card')].map(c => ({
      vehicle: c.querySelector('select')?.value?.trim() || '', bbs: c.querySelector('input[type="text"]')?.value?.trim() || '',
      date: c.querySelector('input[type="date"]')?.value || '', time: c.querySelector('input[type="time"]')?.value || ''
    }));
    const selText = id => { const s = $(id); return s?.options[s.selectedIndex]?.text || ''; };

    /* ---------- mensagem CREPC (nova ocorrência / agregar) ---------- */
    function generateNewCREPCMessage() {
      if (!validateRequiredFields()) return '';
      const alertSource = v('alert_source'), nrOccurrence = v('nr_occurrence_input').trim(), emsNr = v('ems_nr').trim();
      const local = `${v('occorr_local_input')} - ${selText('district_select')} - ${selText('council_select')} - ${selText('parish_select')}`;
      const vehicles = cardVehicles().filter(c => c.vehicle).map(c => `*GDH Sd Und:* ${c.vehicle} | ${formatWSMSGDH(c.date, c.time)} | ${c.bbs ? c.bbs + ' BBs.' : ''}`).join('\n');
      const head = `*FONTE ALERTA:* ${alertSource}\n`, gdh = `*GDH ALERTA:* ${formatWSMSGDH(v('alert_date'), v('alert_time'))}\n`;
      let message;
      if (nrOccurrence) {
        message = `*🔗 Agregar à Ocorrência*\n\n${head}*N. OC:* ${nrOccurrence}\n${gdh}*CLASS OC:* ${v('class_occorr_input')}\n*LOCAL:* ${local}\n${vehicles}`;
      } else {
        const contact = ['Popular', 'Particular'].includes(alertSource.trim()) ? `*CONTACTANTE:* ${v('contact_name').trim()} - ${v('contact_nr').trim()}.\n\n` : '';
        const animal = v('animal-type').trim() ? `*Ser Vivo Não-Humano:* ${v('animal-type').trim()}\n\n` : '';
        message = `*📋 Registo de Nova Ocorrência*\n\n${head}${emsNr ? `*Nr. CODU:* ${emsNr}\n` : ''}${gdh}*CLASS OCORR.:* ${v('class_occorr_input')}\n*LOCAL:* ${local}\n${vehicles}\n\n${contact}${animal}*Agradeço N. OC:*`;
      }
      const out = $('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopup('popup-success', 'Mensagem criada e copiada! Pode colar no WhatsApp.', true);
      return message;
    }

    /* ---------- mensagem para os bombeiros (grava a ocorrência + push) ---------- */
    let councilCache = null;   /* concelho da corporação (Centro de Dados → Corporação) */
    async function corpCouncil() {
      if (councilCache !== null) return councilCache;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corp()}&select=corp_council,corp_localitie&limit=1`, {headers: getSupabaseHeaders()});
        if (!res.ok) throw new Error(await res.text());
        const d = (await res.json())[0] || {};
        councilCache = d.corp_council || d.corp_localitie || '';
      } catch (err) {
        console.warn('Não foi possível obter o concelho da corporação:', err);
        return '';
      }
      return councilCache;
    }
    async function generateWSMSMessage() {
      if (!validateRequiredFields()) return '';
      const alertType = v('alert_type'), alertSource = v('alert_source'), alertTime = v('alert_time');
      const descrOccorr = v('occorr_descr_input'), localOccorr = v('occorr_local_input'), localitie = v('occorr_localitie_input');
      const ppiType = v('ppi_type'), alertLevel = v('alert_level'), ppiGrid = v('alarm_grid'), ppiKm = v('km'), ppiDirection = v('on_going'), ppiIncident = v('incident_type');
      const channel = v('channel_maneuver').trim();
      const vehicles = cardVehicles().filter(c => c.vehicle).map(c => c.bbs ? `${c.vehicle}|${c.bbs} BBs.` : c.vehicle);
      try {
        if (await saveOccurrence({descrOccorr, localOccorr, localitie}, vehicles.length) === 'DUPLICATE') return '';
      } catch (e) {
        console.warn('Erro ao gravar no Supabase:', e);
        showPopup('popup-danger', 'Erro ao gravar no Supabase, mas a mensagem será criada.');
      }
      const head = `*🚨🚨INFORMAÇÃO🚨🚨*\n\n*\\\\${alertSource}, HI: ${alertTime}, `;
      let message = '';
      if (alertType === 'Ocorrência') {
        message = `${head}Ativação para ${descrOccorr} em ${await corpCouncil()}\\${localitie}\\${localOccorr}${vehicles.length ? `, Saída de ${vehicles.join(', ')}` : ''}* `;
      } else if (alertType === 'Plano Prévio de Intervenção') {
        if (ppiType === 'PPI Aeroporto Gago Coutinho') {
          if (alertLevel.toUpperCase() === 'AMARELO') {
            message = `${head}Ativação do ${ppiType} de nível ${alertLevel.toUpperCase()}, para a Grelha ${ppiGrid}, PREVENÇÃO LOCAL.*`;
          } else if (alertLevel.toUpperCase() === 'VERMELHO') {
            message = `${head}Ativação do ${ppiType} de nível VERMELHO, para a Grelha ${ppiGrid}, MOBILIZAÇÃO TOTAL DO CB.*\n\n*Veículos: VCOT, ABSC - Devem Posicionar-se na LRT*\n` +
                      `*Veículos: VCI, VTT - Devem Posicionar-se na ZCR*\n\n*LOCALIZAÇÃO LRT:* (https://www.google.com/maps?q=37.020046,-7.973326)\n*LOCALIZAÇÃO ZCR:* (https://www.google.com/maps?q=37.019382,-7.977624)`;
          }
        } else {
          message = `${head}Ativação do ${alertLevel} para o ${ppiType}, para a Grelha ${ppiGrid}, ao km: ${ppiKm}, no sentido ${ppiDirection} para ${ppiIncident}*`;
        }
      }
      if (channel) message += `\n*Canal Manobra:* ${channel}`;
      message += await getOptelSignature();
      const out = $('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(message).catch(() => {});
      /* push geral para a Mobile: abre "Ocorrências em Curso"; não espera pelo envio */
      const pushText = alertType === 'Plano Prévio de Intervenção'
        ? `🚨 Ativação do ${ppiType}${alertLevel ? ` (${alertLevel})` : ''}${ppiGrid ? ` · Grelha ${ppiGrid}` : ''}`
        : `🚨 ${descrOccorr || 'Nova ocorrência'}${localitie || localOccorr ? ` · ${[localitie, localOccorr].filter(Boolean).join(', ')}` : ''}${vehicles.length ? ` · ${vehicles.map(x => x.split('|')[0]).join(', ')}` : ''}`;
      fetch(PUSH_API, {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({recipient_nint: 'geral', tipo: 'aviso', pagina: 'OnGoingOcr', sender_name: 'CB360 Online', message_text: pushText.slice(0, 180)})
      }).catch(e => console.error('Erro Push:', e));
      showPopup('popup-success', 'Mensagem criada e copiada! Pode colar no WhatsApp.', false);
      window.loadActiveOccurrences?.();
      return message;
    }
    const safeJson = async r => { try { return await r.json(); } catch { return null; } };
    async function saveOccurrence(data, vehiclesCount) {
      try {
        const alertDate = v('alert_date'), alertTime = v('alert_time'), c = corp();
        if (!alertDate || !alertTime || !c) { console.error('Dados em falta: Data, Hora ou Corp ID'); return null; }
        const d = new Date(`${alertDate}T${alertTime}`);
        const startDate = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        const totalElements = [...document.querySelectorAll('.wsms-vehicle-card')].reduce((s, card) => {
          const n = parseInt(card.querySelector('input[type="text"]')?.value || '0', 10);
          return isNaN(n) ? s : s + n;
        }, 0);
        const q = `occorrence=eq.${encodeURIComponent(data.descrOccorr)}&local=eq.${encodeURIComponent(data.localOccorr)}&start_date=eq.${encodeURIComponent(startDate)}`;
        const existing = await safeJson(await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?${q}`, {headers: getSupabaseHeaders()}));
        if (existing && existing.length > 0) {
          const ex = existing[0];
          if (Number(ex.vehicles || 0) === vehiclesCount && Number(ex.elements || 0) === totalElements) {
            showPopup('popup-danger', 'Já existe uma ocorrência idêntica registada.');
            return 'DUPLICATE';
          }
          const up = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?id=eq.${ex.id}`, {
            method: 'PATCH', headers: getSupabaseHeaders({returnRepresentation: true}), body: JSON.stringify({vehicles: vehiclesCount, elements: totalElements})
          });
          if (!up.ok) {
            console.error('Erro ao atualizar ocorrência:', up.status, await up.text());
            showPopup('popup-danger', '❌ Erro ao atualizar a ocorrência no controlo de ocorrências.');
            return null;
          }
          return await safeJson(up);
        }
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control`, {
          method: 'POST', headers: getSupabaseHeaders({returnRepresentation: true}),
          body: JSON.stringify({start_date: startDate, occorrence: data.descrOccorr, local: data.localOccorr, localitie: data.localitie, vehicles: vehiclesCount, elements: totalElements,
                                status: 'Em Curso', corp_oper_nr: c})
        });
        if (!ins.ok) {
          console.error('Erro ao gravar ocorrência:', ins.status, await ins.text());
          showPopup('popup-danger', '❌ Erro ao gravar a ocorrência no controlo de ocorrências.');
          return null;
        }
        return await safeJson(ins);
      } catch (e) {
        console.error('Erro ao gravar ocorrência:', e);
        showPopup('popup-danger', '❌ Erro ao comunicar com a base de dados.');
        return null;
      }
    }

    /* ---------- arranque ---------- */
    $('alert_type').addEventListener('change', toggleAlertTypeFields);
    $('ppi_type').addEventListener('change', toggleAlertTypeFields);
    $('alert_source').addEventListener('change', () => { toggleEMSNrField(); toggleContactFields(); });
    $('class_occorr_input').addEventListener('change', toggleAnimalTypeField);
    document.addEventListener('DOMContentLoaded', async () => {
      toggleAlertTypeFields();
      toggleEMSNrField();
      toggleContactFields();
      toggleAnimalTypeField();
      /* (como antes) datas de hoje e horas limpas em todo o Online */
      document.querySelectorAll('input[type="date"]').forEach(i => i.value = getCurrentDateStr());
      document.querySelectorAll('input[type="time"]').forEach(i => i.value = '');
      await populateCouncilSelectByDistrict();
      await populateIndependentVehicleSelect();
      toggleEMSNrField();
      toggleContactFields();
    });
  })();

  /* =======================================================================
     ENCERRAR OCORRÊNCIA
     ======================================================================= */
  (function closeOccurrence() {
    const TABS = [['wsms-victims-card', 'user', 'VÍTIMAS'], ['wsms-extras-card', 'truck', 'OUTROS MEIOS'], ['wsms-demage-card', 'warn', 'DANOS'], ['wsms-burned-card', 'fire', 'ÁREA ARDIDA'], ['wsms-observ-card', 'doc', 'OBSERVAÇÕES']];
    const addBar = (title, act) => `<div class="field-card-title bar">${title}${button('wsms-btn-green', 'plus', 'ADICIONAR', act)}</div>`;
    const page = mount('page_close_occurrence', `
      ${card({icon: 'bolt', title: 'DADOS PARA ENCERRAMENTO DE OCORRÊNCIA', cls: 'mb', body:
        section('Ocorrência', row([{id: 'close_nr_occurrence', label: 'Nr. Ocorrência', row: 1, ph: 'Ex. 20251234567', w: 170, c: 1, num: 11}])) +
        section('Veículos', `<div class="major-row"><button id="add-close-vehicle-btn" class="btn wsms-btn-blue" data-act="vehicle">${svg('plus', 13).replace('<svg ', '<svg class="bi" ')}ADICIONAR</button></div><div class="grid-3fr" id="vehicles-container"></div>`)})}
      <div class="wsms-card mb">
        <div class="wsms-card-header">${svg('info')}<span>DADOS ADICIONAIS</span></div>
        <div class="major-row cls-tabs">${TABS.map(([sec, icon, text]) => button('wsms-btn-blue', icon, text, 'tab', ` data-sec="${sec}"`)).join('')}</div>
        <div class="wsms-card-body">
          <div class="wsms-section wsms-victims-card hidden cls-top">${addBar('VÍTIMAS', 'victim')}<div class="wsms-card-body cls-in"><div id="victims-container"></div></div></div>
          <div class="grid-2fr">
            <div class="wsms-section wsms-extras-card hidden cls-top">${addBar('OUTROS MEIOS NO TO', 'extra')}<div id="extras-container" class="cls-in"></div></div>
            <div class="wsms-section wsms-demage-card hidden cls-top">${addBar('DANOS CAUSADOS', 'damage')}<div id="damages-container" class="cls-in"></div></div>
          </div>
          <div class="grid-2fr">
            <div class="wsms-section wsms-burned-card hidden">
              <div class="field-card-title">ÁREA ARDIDA</div>
              <div class="major-row cls-area">
                <div class="major-field major-field--fixed"><label>Metros²</label><input type="number" id="area_m2" placeholder="0" class="c" style="width:120px"></div>
                <div class="major-field major-field--fixed"><label>Hectares</label><input type="text" id="area_ha" placeholder="0" class="c" style="width:120px" readonly></div>
              </div>
            </div>
            <div class="wsms-section wsms-observ-card hidden"><div class="field-card-title">OBSERVAÇÕES</div><div class="cls-area"><textarea placeholder="Escreva as observações..." rows="4" class="wsms-ta"></textarea></div></div>
          </div>
        </div>
        <div class="wsms-card-footer">${button('wsms-btn-send', 'phone', 'COMUNICAR CREPC', 'crepc')}</div>
      </div>`, {
      vehicle: () => CloseOCRaddVehicle(), victim: () => addVictim(), extra: () => addExtra(), damage: () => addDamage(), crepc: () => generateCloseCREPCMessage(),
      tab: b => { const el = document.querySelector(`.${b.dataset.sec}`); if (el) b.classList.toggle('active', !el.classList.toggle('hidden')); }
    });
    if (!page) return;
    $('area_m2').addEventListener('input', () => { $('area_ha').value = ((parseFloat($('area_m2').value) || 0) / 10000).toFixed(2); });

    function generateCloseCREPCMessage() {
      const nr = $('close_nr_occurrence')?.value?.trim();
      if (!nr) return showPopup('popup-danger', 'Por favor, preencha o Nr. de Ocorrência para poder encerrar a ocorrência.');
      const sections = ['*⛔ Encerramento de Ocorrência*', `*N. OC:* ${nr}`];
      const cards = sel => [...document.querySelectorAll(`${sel} .wsms-card-mini`)];
      /* veículos */
      const vehicleBlocks = cards('#vehicles-container').map(c => {
        const vehicle = c.querySelector('select')?.value?.trim();
        if (!vehicle) return '';
        const [d1, d2, d3] = [...c.querySelectorAll('input[type="date"]')].map(i => i.value), [t1, t2, t3] = [...c.querySelectorAll('input[type="time"]')].map(i => i.value);
        const tx = [...c.querySelectorAll('input[type="text"]')], kms = tx[0]?.value?.trim() || '', ph = tx[1]?.value?.trim(), pm = tx[2]?.value?.trim();
        const lines = [];
        if (d1 || t1) lines.push(`*GDH Ch TO:* ${vehicle} | ${formatWSMSGDH(d1, t1)}`);
        if (d2 || t2) lines.push(`*GDH Sd TO:* ${vehicle} | ${formatWSMSGDH(d2, t2)}`);
        if (d3 || t3 || kms) lines.push(`*GDH Ch Und:* ${vehicle} | ${formatWSMSGDH(d3, t3)}${kms ? ` | ${kms} Kms` : ''}`);
        if (ph || pm) lines.push(`*TEMPO BOMBA:* ${ph || '00'} Hrs. ${pm || '00'} Mins.`);
        return lines.join('\n');
      }).filter(Boolean);
      if (vehicleBlocks.length) sections.push(vehicleBlocks.join('\n\n'));
      /* vítimas */
      const victims = cards('#victims-container').map((c, idx) => {
        const g = k => $(`victim_${idx + 1}_${k}`)?.value?.trim();
        const [gender, age, ageUnit, nation, type, status] = ['gender', 'age', 'age_unit', 'nation', 'type', 'status'].map(g);
        if (!(gender || age || nation || type || status)) return '';
        return [gender, (ageUnit || age) ? `${ageUnit || ''} ${age || ''}`.trim() : '', nation ? `Nacion: ${nation}` : '', type, status].filter(Boolean).join(' | ');
      }).filter(Boolean);
      if (victims.length) sections.push(`*VÍTIMA(s):*\n${victims.join('\n')}`);
      /* outros meios */
      const extras = cards('#extras-container').map(c => {
        const [meio, veics, elems] = [...c.querySelectorAll('input[type="text"]')].map(i => i.value.trim());
        return [meio, veics ? `Veícs.: ${veics}` : '', elems ? `Elems.: ${elems}` : ''].filter(Boolean).join(' | ');
      }).filter(Boolean);
      if (extras.length) sections.push(`*OUTROS MEIOS NO TO:*\n${extras.join('\n')}`);
      /* danos */
      const damages = cards('#damages-container').map(c => c.querySelector('input[type="text"]')?.value?.trim()).filter(Boolean);
      if (damages.length) sections.push(`*DANOS:*\n${damages.join('\n')}`);
      /* área ardida */
      const m2 = document.querySelector('.wsms-burned-card #area_m2')?.value?.trim(), ha = document.querySelector('.wsms-burned-card #area_ha')?.value?.trim();
      if (m2 || ha) sections.push(`*ÁREA ARDIDA:*\n${[m2 ? `${m2} m²` : '', ha ? `${ha} ha` : ''].filter(Boolean).join(' | ')}`);
      /* observações */
      const obs = document.querySelector('.wsms-observ-card textarea')?.value?.trim();
      if (obs) sections.push(`*OBSERVAÇÕES:*\n${obs}`);
      const message = sections.join('\n\n');
      const out = $('wsms_output');
      if (out) out.value = message;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
      showPopup('popup-success', 'Mensagem criada e copiada! Pode colar no WhatsApp.', true);
      return message;
    }
  })();

  /* =======================================================================
     SOLICITAR DISPONIBILIDADES
     ======================================================================= */
  (function solicitation() {
    const LOCKED = ['solicitation_motive', 'solicitation_shift', 'exit_hour', 'uls_desteny'];
    const page = mount('page-solicitation', `
      ${card({icon: 'clip', title: 'TIPO DE SOLICITAÇÃO', cls: 'mb', body: section('', row([{id: 'solicitation_date', label: 'Data do Serviço', row: 1, type: 'date', w: 130},
        {id: 'solicitation_type', label: 'Tipo de Solicitação', row: 1, tag: 'select', w: 200}, {id: 'solicitation_motive', label: 'Motivo da Solicitação', row: 1, tag: 'select', w: 200},
        {id: 'solicitation_shift', label: 'Turno', row: 1, tag: 'select', w: 80}]))})}
      ${card({icon: 'user', title: 'MEIOS SOLICITADOS', cls: 'mb', body: section('', row([{id: 'drivers', label: 'Motoristas', row: 1, w: 75, c: 1, ph: '0', num: 2},
        {id: 'elements', label: 'Elementos', row: 1, w: 75, c: 1, ph: '0', num: 2}]))})}
      ${card({icon: 'pin', title: 'DESTINO DO SERVIÇO', cls: 'mb', body: section('', row([{id: 'exit_hour', label: 'Hora de Saída', row: 1, type: 'time', w: 90},
        {id: 'uls_desteny', label: 'ULS Destino', row: 1, w: 250, c: 1, ph: 'Ex. IPO Lisboa'}]))})}
      <div class="wsms-send-row">${button('wsms-btn-send', 'phone', 'SOLICITAR', 'send')}</div>`, {send: () => send()});
    if (!page) return;
    function toggleFields() {
      const type = $('solicitation_type').value;
      const on = type === 'Transporte de Doentes' ? ['exit_hour', 'uls_desteny'] : type === 'INEM' || type === 'Serviço Geral' ? ['solicitation_shift']
               : type === 'Reforço Piquete' || type === 'DECIR' ? ['solicitation_motive', 'solicitation_shift'] : [];
      LOCKED.forEach(id => { const el = $(id); el.disabled = !on.includes(id); el.style.backgroundColor = el.disabled ? '#e9ecef' : ''; });
    }
    async function send() {
      const v = id => $(id).value.trim();
      const type = v('solicitation_type'), destination = v('uls_desteny'), hourOut = $('exit_hour').value, motive = v('solicitation_motive'), shift = v('solicitation_shift'), date = v('solicitation_date');
      if (!type) return showPopup('popup-danger', 'Selecione o tipo de solicitação.');
      if (!v('drivers') && !v('elements')) return showPopup('popup-danger', 'Deve indicar pelo menos um Motorista ou um Elemento.');
      if (type === 'Transporte de Doentes' && (!destination || !hourOut)) return showPopup('popup-danger', 'Para Transporte de Doentes, o Destino e a Hora de Saída são obrigatórios.');
      const drivers = parseInt(v('drivers')) || 0, elements = parseInt(v('elements')) || 0;
      const day = date ? ` no dia ${date.split('-').reverse().join('/')}` : '';
      const parts = [];
      if (drivers > 0 || elements > 0) {
        let meios = 'Solicita-se ' + [drivers > 0 ? `${drivers} Motorista${drivers > 1 ? 's' : ''}` : '', elements > 0 ? `${elements} Elemento${elements > 1 ? 's' : ''}` : ''].filter(Boolean).join(' e ');
        if (['INEM', 'Reforço Piquete'].includes(type) && elements > 0) meios += ' preferencialmente TAS';
        parts.push(meios);
      }
      parts.push(type === 'Transporte de Doentes' ? `para efetuar serviço de ${type} para ${destination}${day}, com saída da unidade pelas ${hourOut}`
                                                 : `para efetuar serviço de ${type}${day}${shift ? ` no turno ${shift}` : ''}`);
      if (type === 'Reforço Piquete' && motive === 'Grelha Município') parts.push(`a fim de assegurar a ${motive}`);
      const to = ['DECIR', 'DIOPS', 'Dispositivo Especial'].includes(type) ? 'ao Sr. Adjunto de Comando' : 'à SALOC';
      const message = await deliver(`*🚨🚨INFORMAÇÃO🚨🚨*\n\n${parts.join(' ')}. As disponibilidades deverão ser remetidas ${to}, com a maior brevidade possível. Obrigado!` + await getOptelSignature(),
                                    'Mensagem criada e copiada!');
      LOCKED.forEach(id => { $(id).disabled = true; });
      return message;
    }
    $('solicitation_type').addEventListener('change', toggleFields);
    toggleFields();
  })();

  /* =======================================================================
     INDISPONIBILIDADE DE VEÍCULOS
     ======================================================================= */
  (function unavailability() {
    const NEW = [{id: 'new_vehicle_unavailable', label: 'Veículo', msg: 'Veículo', tag: 'select', w: 120}, {id: 'new_unavailability_date', label: 'Data da Indisponibilidade', msg: 'Data de Início', type: 'date', w: 130},
                 {id: 'new_unavailability_hour', label: 'Hora da Indisponibilidade', msg: 'Hora de Início', type: 'time', w: 90}, {id: 'new_reason_unavailability', label: 'Motivo', msg: 'Motivo', tag: 'select', w: 175},
                 {id: 'new_unavailability_local', label: 'Local', msg: 'Local', tag: 'select', w: 175}].map(f => ({...f, row: 1}));
    const END = [{id: 'end_vehicle_unavailable', label: 'Veículo', msg: 'Veículo', w: 100, c: 1}, {id: 'end_reason_unavailability', label: 'Motivo da Indisponibilidade', msg: 'Motivo', w: 175, c: 1},
                 {id: 'end_unavailability_date', label: 'Data da Disponibilidade', msg: 'Data de Fim', type: 'date', w: 130}, {id: 'end_unavailability_hour', label: 'Hora da Disponibilidade', msg: 'Hora de Fim', type: 'time', w: 90}].map(f => ({...f, row: 1}));
    const page = mount('page-indisp', `
      ${card({icon: 'off', title: 'NOVA INDISPONIBILIDADE DE VEÍCULO', cls: 'mb', body: section('', row(NEW)), foot: button('wsms-btn-send', 'phone', 'ENVIAR INDISPONIBILIDADE', 'new')})}
      ${card({icon: 'truck', title: 'VEÍCULOS INDISPONÍVEIS', cls: 'mb', body: `<div class="table-container"><table id="active-unavailability-table"><thead><tr>
                <th style="width:150px">Data/Hora</th><th style="width:200px">Veículo</th><th style="width:400px">Motivo</th><th style="width:200px">Estado</th><th style="width:200px">Finalizar</th>
              </tr></thead><tbody id="active-unavailability-tbody"></tbody></table></div>`, foot: button('wsms-btn-green', 'reload', 'ATUALIZAR LISTA', 'reload')})}
      ${card({icon: 'ok', title: 'FIM DE INDISPONIBILIDADE DE VEÍCULO', body: section('', row(END)), foot: button('wsms-btn-green', 'phone', 'ENVIAR DISPONIBILIDADE', 'end'), attrs: ' id="availability-card" hidden'})}`,
      {new: () => sendNew(), end: () => sendEnd(), reload: () => loadActive(), fin: b => openEnd(rows[+b.dataset.i])});
    if (!page) return;
    const displayName = x => x === 'ABSC-02' ? 'INEM-Reserva' : ['ABSC-01', 'ABSC-03'].includes(x) ? 'INEM' : x;
    const isRetention = m => ['Falta de Macas', 'Aguarda Triagem'].includes(m);
    function validate(fields) {
      const miss = fields.filter(f => !$(f.id)?.value.trim()).map(f => f.msg);
      if (miss.length) missingPopup(miss);
      return !miss.length;
    }
    async function save(d) {
      try {
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability`, {
          method: 'POST', headers: getSupabaseHeaders({returnRepresentation: true}),
          body: JSON.stringify({vehicle: d.vehicle, start_unavailability_date: d.date, start_unavailability_hour: d.hour, unavailability_motive: d.motive, status: 'Em Aberto', corp_oper_nr: corp()})
        });
        if (!ins.ok) { console.error('❌ Erro ao gravar no Supabase:', await ins.text()); return null; }
        const saved = await ins.json();
        const rec = saved[0] || saved;
        const hist = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability_history`, {
          method: 'POST', headers: getSupabaseHeaders({returnRepresentation: false}),
          body: JSON.stringify({id: rec.id, vehicle: d.vehicle, start_date: d.date, end_date: null, start_hour: d.hour, end_hour: null, total_time: null, motive: d.motive, corp_oper_nr: corp()})
        });
        if (!hist.ok) {
          console.error('❌ Erro ao gravar histórico:', await hist.text());
          showPopup('popup-danger', 'Indisponibilidade registada, mas falhou o registo no histórico.');
        }
        return rec;
      } catch (e) {
        console.error('❌ Erro inesperado ao gravar no Supabase:', e);
        return null;
      }
    }
    async function sendNew() {
      if (!validate(NEW)) return '';
      const d = {vehicle: $('new_vehicle_unavailable').value, date: $('new_unavailability_date').value, hour: $('new_unavailability_hour').value,
                 motive: $('new_reason_unavailability').value, local: $('new_unavailability_local').value};
      const gdh = formatWSMSGDH(d.date, d.hour);
      const what = d.motive === 'Pausa para Alimentação' ? `${d.motive}, ${d.local}, ${gdh}`
                 : isRetention(d.motive) ? `Retido(a) por: ${d.motive}, ${d.local}, ${gdh}` : `Inoperacional por: ${d.motive}, ${d.local}, ${gdh}.`;
      const message = await deliver(`*🚨INFORMAÇÃO🚨*\n\n*${displayName(d.vehicle)}:*\n${what}` + await getOptelSignature());
      try { await save(d); } catch (e) { console.error('Erro ao gravar indisponibilidade:', e); }
      loadActive();
      return message;
    }
    let rows = [];
    async function loadActive() {
      const tbody = $('active-unavailability-tbody');
      if (!tbody) return;
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?status=eq.Em%20Aberto&corp_oper_nr=eq.${corp()}`, {headers: getSupabaseHeaders()});
        rows = await resp.json();
        tbody.innerHTML = !rows.length
          ? '<tr><td colspan="8" class="empty">Não existem veículos indisponíveis neste momento.</td></tr>'
          : rows.map((r, i) => `<tr>
              <td>${r.start_unavailability_date ? `${r.start_unavailability_date.split('-').reverse().join('/')} ${esc(r.start_unavailability_hour || '')}` : ''}</td>
              <td>${esc(r.vehicle)}</td><td>${esc(r.unavailability_motive)}</td><td>${esc(r.status)}</td>
              <td><button class="btn btn-danger btn-sm finalize-btn" data-act="fin" data-i="${i}">Finalizar Indisponibilidade</button></td></tr>`).join('');
      } catch (e) {
        console.error('Erro ao carregar indisponibilidades:', e);
      }
    }
    function openEnd(r) {
      $('end_vehicle_unavailable').value = r.vehicle;
      $('end_reason_unavailability').value = r.unavailability_motive;
      $('end_unavailability_date').value = new Date().toLocaleDateString('sv-SE');
      $('end_unavailability_hour').value = '';
      $('availability-card').hidden = false;
      $('end_unavailability_hour').focus();
    }
    async function sendEnd() {
      if (!validate(END)) return '';
      const vehicle = $('end_vehicle_unavailable').value, motive = $('end_reason_unavailability').value;
      const endDate = $('end_unavailability_date').value, endHour = $('end_unavailability_hour').value;
      try {
        const q = `vehicle=eq.${encodeURIComponent(vehicle)}&unavailability_motive=eq.${encodeURIComponent(motive)}&status=eq.Em%20Aberto&corp_oper_nr=eq.${corp()}`;
        const data = await (await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?${q}`, {headers: getSupabaseHeaders()})).json();
        if (!data.length) { showPopup('popup-danger', 'Não foi encontrada nenhuma indisponibilidade em aberto para este veículo.'); return ''; }
        const rec = data[0];
        const diff = new Date(`${endDate}T${endHour}`) - new Date(`${rec.start_unavailability_date}T${rec.start_unavailability_hour}`);
        const total = `${pad(Math.floor(diff / 3600000))}h${pad(Math.floor((diff % 3600000) / 60000))}m`;
        const what = motive === 'Pausa para Alimentação' ? 'Fim de' : isRetention(motive) ? 'Fim de Retenção por' : 'Fim de Inoperacionalidade por';
        const message = await deliver(`*🚨INFORMAÇÃO🚨*\n\n*${displayName(vehicle)}:*\n${what}: ${motive}, ${formatWSMSGDH(endDate, endHour)}.\nTempo Indisponível: ${total}.` + await getOptelSignature());
        const hist = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability_history?id=eq.${rec.id}`, {
          method: 'PATCH', headers: getSupabaseHeaders(), body: JSON.stringify({end_date: endDate, end_hour: endHour, total_time: total})
        });
        if (!hist.ok) {
          console.error('Erro ao fechar histórico:', await hist.text());
          showPopup('popup-danger', 'Mensagem criada, mas falhou o fecho no histórico. Volte a tentar.');
          return message;
        }
        const del = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?id=eq.${rec.id}`, {method: 'DELETE', headers: getSupabaseHeaders()});
        if (!del.ok) {
          console.error('Erro ao fechar indisponibilidade:', await del.text());
          showPopup('popup-danger', 'Mensagem criada, mas a indisponibilidade continua em aberto. Volte a tentar.');
          return message;
        }
        $('availability-card').hidden = true;
        loadActive();
        return message;
      } catch (e) {
        console.error('Erro ao gerar fim de indisponibilidade:', e);
        showPopup('popup-danger', 'Erro ao gerar mensagem de fim de indisponibilidade.');
        return '';
      }
    }
    document.addEventListener('DOMContentLoaded', () => {
      loadActive();
      setInterval(loadActive, 10000);
    });
  })();

  /* =======================================================================
     GRELHA DO MUNICÍPIO
     ======================================================================= */
  (function municipalityGrid() {
    const page = mount('page-municipality-grid', card({icon: 'grid', title: 'ESTADO OPERACIONAL DA GRELHA DO MUNICÍPIO', cls: 'mb',
      body: section('', row([{id: 'state_municipality_grid', label: 'Estado Operacional', row: 1, tag: 'select', w: 200}]) +
                        row([{id: 'municipality_grid_output', label: 'Motivo do Estado', row: 1, w: 500, ph: 'Indique um motivo para o estado da grelha.'}])),
      foot: button('wsms-btn-send', 'phone', 'ENVIAR ESTADO', 'send')}), {send: () => send()});
    if (!page) return;
    const state = () => $('state_municipality_grid').value.trim(), out = $('municipality_grid_output');
    $('state_municipality_grid').addEventListener('change', () => {
      if (!state()) return;
      const auto = state() === 'Sem Constrangimentos';
      out.value = auto ? 'Selecionou Sem Constrangimentos, a mensagem foi gerada de forma automática.' : '';
      out.readOnly = auto;
    });
    async function send() {
      const s = state();
      if (!s) return showPopup('popup-danger', 'Por favor, selecione o estado da Grelha do Município.');
      if ((s === 'Com Constrangimentos' || s === 'Inoperacional') && !out.value.trim()) return showPopup('popup-danger', 'Por favor, indique o motivo do constrangimento ou inoperacionalidade.');
      const body = s === 'Sem Constrangimentos' ? '*✅ Grelha do Município 100% assegurada sem qualquer constrangimento.*\n'
                 : s === 'Com Constrangimentos' ? `*⚠️ Grelha do Município irá encontrar-se com constrangimentos.*\n\n*Motivo: ${out.value}*\n`
                 : s === 'Inoperacional' ? `*❌ Grelha do Município irá ficar Inoperacional.*\n\n*Motivo: ${out.value}*\n` : null;
      const message = body === null ? '' : `*🚨INFORMAÇÃO🚨*\n\n${body}_Planeamento será emitido oportunamente._`;
      return deliver(message + await getOptelSignature(), undefined, false);
    }
  })();

  /* =======================================================================
     SMS PRÉ-HOSPITALAR (serviços INEM / INEM-Reserva)
     ======================================================================= */
  (function emsServices() {
    const page = mount('page-inem-services', `
      <div class="wsms-card">
        <div class="wsms-card-header-ems">${svg('pulse')}<span>SERVIÇOS DE EMERGÊNCIA PRÉ-HOSPITALAR</span></div>
        <div class="ems-ticker"><div>⚠️ AVISO: Devido ao incidente ocorrido com o portátil iTeams, informa-se que a partir das 00:00 do dia 27 de Abril, e até resolução do mesmo, todos os serviços emanados pelo INEM, serão efetuados via VERBETE MANUAL, tendo que o OPTEL de serviço efetuar a sua digitalização e upload manual à semelhança do procedimento dos serviços de RESERVA INEM. Pedimos desculpa por qualquer constrangimento. Departamento de Informática. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></div>
        <div class="wsms-card-body">
          ${section('Tipo de serviço', `<div class="wsms-type-row">
              <div class="wsms-type-opt ems-type-inem" id="opt-inem"><input type="checkbox" id="alert-inem"><label for="alert-inem">INEM</label></div>
              <div class="wsms-type-opt" id="opt-reserv"><input type="checkbox" id="alert-reserv"><label for="alert-reserv">RESERVA</label></div></div>`)}
          ${section('Temporização', row([{id: 'alert-service', label: 'Hora Alerta', type: 'time', w: 110}]))}
          ${section('Localização', row([{id: 'address-service', label: 'Morada', ph: 'Morada da ocorrência', grow: 'grow3'}, {id: 'location-service', label: 'Localidade', ph: 'Localidade', grow: 'grow2'},
                                        {id: 'reference-address-service', label: 'Ponto de Referência', ph: 'Ponto de referência', grow: 'grow3'}]))}
          ${section('Vítima', row([{id: 'victim-gender-service', label: 'Género', tag: 'select', w: 90, opts: ['&nbsp;', 'Masc.', 'Fem.', 'Desc.', 'Outro']},
                                   {id: 'victim-age-service', label: 'Idade', ph: '00', num: 3, w: 55, c: 1, attrs: ' inputmode="numeric"'},
                                   {id: 'victim-age-type-service', label: ' ', tag: 'select', w: 85, opts: ['&nbsp;', 'Dias', 'Meses', 'Anos']},
                                   {id: 'situation-service', label: 'Situação', ph: 'Descreva a situação clínica', grow: 'grow'}]))}
          ${section('Operacional', row([{id: 'nr-codu-service', label: 'Nr. CODU', ph: '123456789', num: 9, w: 120, c: 1, attrs: ' inputmode="numeric"'},
                                        {id: 'resp-tas-ni', label: 'Nr. TAS', ph: '000', num: 3, w: 60, c: 1, attrs: ' inputmode="numeric"'},
                                        {id: 'resp-tas-name', label: 'Nome TAS', grow: 'grow2', attrs: ' disabled'}, {id: 'observations-service', label: 'Observações', ph: 'Observações adicionais', grow: 'grow2'}]))}
        </div>
        <div class="wsms-card-footer">${button('wsms-btn-send', 'send', 'ENVIAR SERVIÇO', 'send')}</div>
      </div>`, {send: () => send()});
    if (!page) return;
    /* popup "tipo de verbete" (iTeams / Verbete Manual) */
    const modal = document.createElement('div');
    modal.id = 'popup-inem-type-modal';
    modal.className = 'popup-modal popup-superdanger';
    modal.innerHTML = `
      <div class="popup-content">
        <div class="popup-header"><div class="header-content"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><h3>TIPO DE VERBETE</h3></div></div>
        <div class="popup-body"><ul><li>
          <label><input type="radio" name="popup-inem-type" value="ITeams"> iTeams</label>
          <label><input type="radio" name="popup-inem-type" value="Verbete"> Verbete Manual</label>
        </li></ul></div>
        <div class="popup-footer"><button id="popup-inem-type-ok-btn" class="popup-btn">Confirmar</button><button id="popup-inem-type-cancel-btn" class="popup-btn">Cancelar</button></div>
      </div>`;
    document.body.appendChild(modal);

    const inem = $('alert-inem'), reserv = $('alert-reserv'), optInem = $('opt-inem'), optReserv = $('opt-reserv');
    let selectedType = '';
    const radios = () => document.querySelectorAll('input[name="popup-inem-type"]');
    function openTypePopup() { radios().forEach(r => { r.checked = false; }); selectedType = ''; modal.classList.add('show'); }
    const closeTypePopup = () => modal.classList.remove('show');
    function setNow() { const n = new Date(); $('alert-service').value = `${pad(n.getHours())}:${pad(n.getMinutes())}`; }
    function updateTypeSelection() {
      optInem.classList.toggle('active', inem.checked);
      optReserv.classList.toggle('active', reserv.checked);
      const c = inem.closest('.wsms-card');
      c.classList.toggle('theme-inem', inem.checked);
      c.querySelector('.wsms-card-header-ems span').textContent = reserv.checked ? 'SERVIÇOS DE EMERGÊNCIA PRÉ-HOSPITALAR - RESERVA' : 'SERVIÇOS DE EMERGÊNCIA PRÉ-HOSPITALAR';
    }
    inem.addEventListener('change', () => { if (inem.checked) { reserv.checked = false; selectedType = ''; openTypePopup(); } updateTypeSelection(); });
    reserv.addEventListener('change', () => { if (reserv.checked) { inem.checked = false; selectedType = ''; setNow(); } updateTypeSelection(); });
    /* clicar em qualquer ponto do cartão do tipo liga/desliga a caixa */
    [[optInem, inem], [optReserv, reserv]].forEach(([opt, chk]) => opt.addEventListener('click', e => {
      if (e.target === chk) return;
      const label = e.target.closest('label');
      if (label && (label.htmlFor === chk.id || label.contains(chk))) return;
      chk.checked = !chk.checked;
      chk.dispatchEvent(new Event('change'));
    }));
    $('popup-inem-type-ok-btn').addEventListener('click', () => {
      const sel = document.querySelector('input[name="popup-inem-type"]:checked');
      if (!sel) return showPopup('popup-danger', 'Selecione o tipo de serviço.');
      selectedType = sel.value;
      closeTypePopup();
      setTimeout(() => { setNow(); $('address-service')?.focus(); }, 100);
    });
    $('popup-inem-type-cancel-btn').addEventListener('click', () => { inem.checked = false; updateTypeSelection(); closeTypePopup(); });
    /* nome do TAS pelo n.º interno */
    $('resp-tas-ni').addEventListener('input', async function () {
      const ni = this.value.trim(), name = $('resp-tas-name');
      if (ni.length < 3) { name.value = ''; return; }
      try {
        const data = await supabaseFetch(`reg_elems?corp_oper_nr=eq.${corp()}&n_int=eq.${ni}&select=abv_name&limit=1`);
        name.value = data?.[0]?.abv_name || '';
      } catch (err) {
        console.error('Erro ao procurar elemento:', err);
        name.value = '';
      }
    });
    const REQ = [['alert-service', 'Hora Alerta'], ['address-service', 'Morada'], ['location-service', 'Localidade'], ['victim-gender-service', 'Género da Vítima'], ['victim-age-service', 'Idade da Vítima'],
                 ['victim-age-type-service', 'Tipo de Idade'], ['situation-service', 'Situação'], ['nr-codu-service', 'Nr. CODU'], ['resp-tas-name', 'Nr. TAS']];
    async function send() {
      const miss = [...(!inem.checked && !reserv.checked ? ['Tipo de Serviço (INEM ou Reserva)'] : []), ...REQ.filter(([id]) => !$(id)?.value?.trim()).map(([, l]) => l)];
      if (miss.length) return showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br><ul style="margin:0;padding:0;">${miss.map(f => `<li style="list-style:none;">• ${f}</li>`).join('')}</ul>`);
      if (inem.checked && !selectedType) return openTypePopup();
      const g = id => $(id)?.value?.trim() || '';
      const hourAlert = $('alert-service').value || '', address = g('address-service'), locality = g('location-service'), ref = g('reference-address-service');
      const gender = $('victim-gender-service').value || '', age = g('victim-age-service'), ageType = $('victim-age-type-service').value || '';
      const situation = g('situation-service'), nrCODU = g('nr-codu-service'), tasName = g('resp-tas-name'), obs = g('observations-service');
      let message = `${reserv.checked ? '*🚨⚠️ SERVIÇO INEM-Reserva ⚠️🚨*' : '*🚨⚠️ SERVIÇO INEM ⚠️🚨*'}\n\n`;
      if (nrCODU) message += `*Nr. CODU:* ${nrCODU}\n`;
      if (hourAlert) message += `*Hora Alerta:* ${hourAlert}\n`;
      if (address || locality) message += `*Local:* ${address}${address && locality ? ' - ' : ''}${locality}\n`;
      if (ref) message += `*Ponto Ref.:* ${ref}\n`;
      if (gender || age) message += `*Vítima:* ${gender}${age ? `, ${age} ${ageType}` : ''}\n`;
      if (situation) message += `*Situação:* ${situation}\n\n`;
      if (obs) message += `*Observações:* ${obs}`;
      const now = new Date();
      try {
        await navigator.clipboard.writeText(message);
        showPopup('popup-success', 'Mensagem criada e copiada!');
        const record = {corp_oper_nr: corp(), nr_codu: nrCODU || null, alert_date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, alert_hour: hourAlert || null,
                        victim_type: ({'Masc.': 'Masculino', 'Fem.': 'Feminino', 'Desc.': 'Desconhecido'})[gender] || gender || null, victim_age_type: age || null, victim_age_unit: ageType || null,
                        victim_address: address || null, victim_location: locality || null, service_type: selectedType || (inem.checked ? 'ITeams' : 'Verbete'), tas: tasName || null};
        const r = await fetch(`${SUPABASE_URL}/rest/v1/inem_entries`, {method: 'POST', headers: {...getSupabaseHeaders(), 'Prefer': 'return=minimal'}, body: JSON.stringify(record)});
        if (!r.ok) {
          console.error('Erro ao gravar inem_entries:', await r.text());
          showPopup('popup-danger', 'Mensagem copiada, mas o registo NÃO foi gravado nos Verbetes INEM.');
        }
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', 'Erro ao copiar ou guardar registo.');
      }
      clearFormFields();
      selectedType = '';
      radios().forEach(r => { r.checked = false; });
    }
  })();

  /* =======================================================================
     AVISOS METEO (IPMA)
     ======================================================================= */
  (function weatherWarnings() {
    const page = mount('page-weather-warnings', `
      <div class="wsms-card last-major-card">
        <div class="wsms-card-header">${svg('cloud')}<span>AVISOS METEOROLÓGICOS</span></div>
        <div class="major-card-body" id="ipma-alerts"></div>
        <div class="major-card-footer"></div>
      </div>`);
    if (!page) return;
    const AREAS = {AVR: 'Aveiro', BJA: 'Beja', BRG: 'Braga', BGC: 'Bragança', CBO: 'Castelo Branco', CBR: 'Coimbra', EVR: 'Évora', FAR: 'Algarve (Faro)', GDA: 'Guarda', LRA: 'Leiria', LSB: 'Lisboa',
                   PTG: 'Portalegre', PTO: 'Porto', STM: 'Santarém', STB: 'Setúbal', VCT: 'Viana do Castelo', VRL: 'Vila Real', VIS: 'Viseu', MCN: 'Madeira - Costa Norte', MCS: 'Madeira - Costa Sul',
                   MRM: 'Madeira - Regiões Montanhosas', MPS: 'Madeira - Porto Santo', AOC: 'Açores - Grupo Ocidental', ACE: 'Açores - Grupo Central', AOR: 'Açores - Grupo Oriental'};
    let area = null;   /* área de avisos IPMA da corporação (Centro de Dados → Corporação → Área de Avisos IPMA) */
    const zoneName = (code = area) => code ? AREAS[code] || code : 'Área IPMA não configurada';
    async function getArea() {
      if (area) return area;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corp()}&select=ipma_area&limit=1`, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error(await res.text());
      area = (await res.json())?.[0]?.ipma_area || null;
      return area;
    }
    async function fetchWarnings() {
      try {
        const a = await getArea();
        if (!a) { console.warn('Área de avisos IPMA não configurada (Centro de Dados → Corporação).'); return []; }
        const r = await fetch('https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json');
        if (!r.ok) throw new Error(`IPMA HTTP ${r.status}`);
        return (await r.json()).filter(x => x.idAreaAviso === a && x.awarenessLevelID !== 'green');
      } catch (err) {
        console.error('Erro ao buscar avisos IPMA:', err);
        return [];
      }
    }
    const greenCard = () => `<div class="ipma-card ipma-green"><div><div class="ipma-title">Sem avisos meteorológicos</div><div>Zona: <b>${zoneName()}</b></div>
                             <div class="ipma-time">Não existem avisos meteorológicos para esta zona.</div></div></div>`;
    let list = [];
    async function update() {
      const box = $('ipma-alerts');
      box.innerHTML = 'A carregar avisos...';
      list = (await fetchWarnings()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      box.innerHTML = !list.length ? greenCard() : list.map((w, i) => `
        <div class="ipma-card ${({yellow: 'ipma-yellow', orange: 'ipma-orange', red: 'ipma-red'})[w.awarenessLevelID]}" data-i="${i}" data-end-time="${esc(w.endTime)}">
          <div>
            <div class="ipma-title">${esc(w.awarenessTypeName)}</div>
            <div>Zona: <b>${zoneName(w.idAreaAviso)}</b></div>
            <div class="ipma-time"><b>Início:</b> ${new Date(w.startTime).toLocaleString('pt-PT')}</div>
            <div class="ipma-time"><b>Fim:</b> ${new Date(w.endTime).toLocaleString('pt-PT')}</div>
            ${w.text ? `<div style="margin-top:6px">${esc(w.text)}</div>` : ''}
          </div>
          <button>Emitir Aviso</button>
        </div>`).join('');
    }
    $('ipma-alerts').addEventListener('click', e => {
      const c = e.target.closest('.ipma-card[data-i] > button') && e.target.closest('.ipma-card');
      if (c) issueNotice(list[+c.dataset.i]);
    });
    /* GDH para a mensagem: DDHHMMMESAA */
    function gdh(s) {
      const d = new Date(s);
      if (isNaN(d)) return s;
      return `${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${d.toLocaleString('en-US', {month: 'short'}).toUpperCase()}${String(d.getFullYear()).slice(-2)}`;
    }
    function issueNotice(w) {
      if (!w) return showPopup('popup-danger', 'Aviso não encontrado.');
      const nivel = ({yellow: 'AMARELO', orange: 'LARANJA', red: 'VERMELHO'})[w.awarenessLevelID] || '';
      const top = `*⚠️🚨AVISO METEOROLÓGICO🚨⚠️*\n\n`, when = `para o Distrito de *${gdh(w.startTime)}* até *${gdh(w.endTime)}*.\n`, texto = w.text || '';
      const mensagem = nivel === 'AMARELO' ? `${top}*🟡 AVISO METEO ${nivel}* ${when}*${texto}* \\Fonte IPMA`
                     : nivel === 'LARANJA' ? `${top}*🟠 AVISO METEO ${nivel}* ${when}*${texto}* \\\\Fonte IPMA\n\n_Solicita-se disponibilidade de elementos para eventual elevado número de ocorrências._\n` +
                                             `_As disponibilidades devem ser remetidas à SALOC com a maior brevidade possível._\nObrigado!`
                     : nivel === 'VERMELHO' ? `${top}*🔴 AVISO METEO ${nivel}* ${when}*${texto}* \\Fonte IPMA\n\n_*MOBILIZAÇÃO GERAL DO EFETIVO DO CORPO DE BOMBEIROS.*_\nObrigado!` : '';
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(mensagem).then(() => showPopup('popup-success', 'Mensagem criada e copiada! Pode colar no WhatsApp.'))
          .catch(() => showPopup('popup-danger', 'Não foi possível copiar automaticamente. Copie manualmente:\n\n' + mensagem));
      } else {
        showPopup('popup-danger', 'Copie manualmente a mensagem:\n\n' + mensagem);
      }
    }
    /* de minuto a minuto tira os avisos que já acabaram */
    setInterval(() => {
      const now = new Date(), box = $('ipma-alerts');
      box.querySelectorAll('.ipma-card[data-end-time]').forEach(c => { if (new Date(c.dataset.endTime) <= now) c.remove(); });
      if (!box.querySelector('.ipma-card')) box.innerHTML = greenCard();
    }, 60 * 1000);
    update();
    setInterval(update, 10 * 60 * 1000);
  })();

  /* ----------------------------- números só com algarismos (ex-oninput no HTML) ----------------------------- */
  document.addEventListener('input', e => {
    const t = e.target;
    if (!t.closest?.('.wsms-pg')) return;
    if (t.dataset.num) t.value = t.value.replace(/[^0-9]/g, '').slice(0, +t.dataset.num);
    else if ('dec' in t.dataset) t.value = t.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6);
  }, true);
})();

/* =======================================================================
   ASSINATURA (patente + nome; "OPTEL:" se a função for OPTEL)
   Global: também é usada na FOMIO e nos Serviços de Voluntariado.
   ======================================================================= */
async function getOptelSignature() {
  const nInt = sessionStorage.getItem('currentNInt');
  const corpNr = sessionStorage.getItem('currentCorpOperNr');
  if (!nInt || !corpNr) return '';
  try {
    const dataElems = await (await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=patent_abv,abv_name&n_int=eq.${nInt}&corp_oper_nr=eq.${corpNr}`, {headers: getSupabaseHeaders()})).json();
    if (!dataElems || dataElems.length === 0) return '';
    const user = dataElems[0];
    const dataEmp = await (await fetch(`${SUPABASE_URL}/rest/v1/reg_employees?select=function&n_int=eq.${nInt}&corp_oper_nr=eq.${corpNr}`, {headers: getSupabaseHeaders()})).json();
    return dataEmp?.[0]?.function === 'OPTEL' ? `\nOPTEL: ${user.patent_abv} ${user.abv_name}` : `\n${user.patent_abv} ${user.abv_name}`;
  } catch (error) {
    console.error('Erro ao obter assinatura OPTEL:', error);
  }
  return '';
}
