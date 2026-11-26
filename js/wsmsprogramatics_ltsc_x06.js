    /* =======================================================================
    WSMS 360 · COMUNICAÇÃO WSMS
    ======================================================================= */
    (function () {
      const $ = id => document.getElementById(id);
      const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
      const pad = n => String(n).padStart(2, '0');
      const corp = () => sessionStorage.getItem('currentCorpOperNr');
      const PUSH_API = 'https://cb-360-app.vercel.app/api/sendPush';
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
      function field(f) {
        const style = f.w ? ` style="width:${f.w}px"` : '';
        const ctrl = f.tag === 'select' ? `<select id="${f.id}"${style}${f.attrs || ''}>${f.opts ? options(f.opts) : ''}</select>` : `<input type="${f.type || 'text'}" id="${f.id}"${style}${f.c ? ' class="c"' : ''}${f.ph ? ` placeholder="${f.ph}"` : ''}${f.num ? ` maxlength="${f.num}" data-num="${f.num}"` : ''}${f.dec ? ' maxlength="6" data-dec' : ''}${f.attrs || ''}>`;
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
        </div>
      `;
      const box = (n, title, inner, extra = '', attrs = '') => `<div class="ins-box"${attrs}><div class="ins-bh">${n ? `<span class="ins-n">${n}</span>` : ''}${title}${extra}</div>${inner}</div>`;
      const grid = (cls, fields, style = '') => `<div class="ins-grid ${cls}"${style ? ` style="${style}"` : ''}>${fields.map(field).join('')}</div>`;
      const sumBox = (id, title, lines, note) => `<aside class="ins-sum" id="${id}"><div class="ins-sum-k">${title}</div><div class="ins-sum-t" id="${id}-t">—</div>
          ${lines.map(([l, k]) => `<div class="ins-sum-l"><span>${l}</span><b id="${id}-${k}">—</b></div>`).join('')}${note ? `<p class="ins-sum-p">${note}</p>` : ''}</aside>`;
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
          .wsms-card.theme-inem .wsms-card-header-ems svg {animation: pulse-red-inem 2s infinite;}
          .wsms-card-header-ems {background: #c0392b; color: #fff; padding: 9px 18px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; text-shadow: 0 1px 2px rgba(0,0,0,0.25);}
          .wsms-card-header-ems {background: #c0392b; color: #fff; padding: 5px 18px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; text-shadow: 0 1px 2px rgba(0,0,0,0.25); position: relative; overflow: hidden; z-index: 0;}
          .wsms-type-row {display: flex; gap: 10px;}
          .wsms-type-opt {display: flex; align-items: center; gap: 7px; padding: 6px 16px; border: 1px solid #d0d0d0; border-radius: 6px; background: #f9f9f9; cursor: pointer; transition: border-color 0.15s, background 0.15s; user-select: none;}
          .wsms-type-opt:hover {border-color: #c0392b; background: #fdf4f3;}
          .wsms-type-opt.active {border-color: #c0392b; background: #fdf0ee;}
          .wsms-card.theme-inem .wsms-card-header-ems {background: #f0b400; color: #1a2e4a;}
          .wsms-card.theme-inem .wsms-card-header-ems svg {stroke: #1a2e4a;}
          .wsms-card.theme-inem .major-field input:focus, .wsms-card.theme-inem .major-field select:focus {border-color: #f0b400 !important; box-shadow: 0 0 0 2px rgba(240,180,0,0.18) !important;}
          .wsms-card.theme-inem .wsms-type-opt:hover {border-color: #f0b400; background: #fffbea;}
          .wsms-card.theme-inem .wsms-type-opt.active {border-color: #f0b400; background: #fffbea;}
          .wsms-card.theme-inem .wsms-type-opt.active input[type="checkbox"] {accent-color: #f0b400;}
          .wsms-card.theme-inem .wsms-btn-send {background: #f0b400; color: #1a2e4a;}
          .wsms-card.theme-inem .wsms-btn-send:hover {background: #d4a000; color: #1a2e4a;}
          .wsms-card.theme-inem .wsms-btn-send:active {background: #b88c00; color: #1a2e4a;}
          .wsms-type-opt input[type="checkbox"] {width: 14px; height: 14px; accent-color: #c0392b; cursor: pointer !important; margin: 0;}
          .wsms-type-opt label {font-size: 12px; font-weight: 600; color: #444; cursor: pointer; letter-spacing: 0.03em;}
          #ipma-alerts {display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;}
          .ipma-card {border-radius: 12px; padding: 16px 16px 14px 16px; font-size: 13px; display: flex; flex-direction: column; justify-content: space-between; min-height: 160px; position: relative; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-left: 6px solid; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: all 0.18s ease;}
          .ipma-card:hover {transform: translateY(-4px); box-shadow: 0 8px 18px rgba(0,0,0,0.12);}
          .ipma-green {border-left-color: #43a047; background: linear-gradient(180deg, #f4fbf4 0%, #ffffff 100%);}
          .ipma-yellow {border-left-color: #fbc02d; background: linear-gradient(180deg, #fffdf3 0%, #ffffff 100%);}
          .ipma-orange {border-left-color: #fb8c00; background: linear-gradient(180deg, #fff7f0 0%, #ffffff 100%);}
          .ipma-red {border-left-color: #e53935; background: linear-gradient(180deg, #fff3f3 0%, #ffffff 100%);}
          .ipma-title {font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #1a1a1a; letter-spacing: 0.3px;}
          .ipma-time {font-size: 11px; color: #888; margin-top: 6px;}
          .ipma-card button {align-self: flex-end; margin-top: 12px; padding: 0 12px; font-size: 11px; font-weight: 600; border: none; border-radius: 6px; background: linear-gradient(135deg, #2980b9, #1f5f8a); color: #fff; cursor: pointer; height: 26px; letter-spacing: 0.04em; transition: all 0.15s ease;}
          .ipma-card button:hover {transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.15);}
          .ipma-card button:active {transform: scale(0.97);}
          .wsms-btn-send {background: #c0392b; color: #fff; border: none; border-radius: 6px; padding: 0 22px; height: 32px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; cursor: pointer; transition: background 0.15s;}
          .wsms-btn-send:hover {background: #a93226;}
          .wsms-btn-send:active {background: #922b21; transform: scale(0.98);}
          .wsms-pg [hidden] {display: none !important;}
          .wsms-pg .wsms-card.mb {margin-bottom: 10px;}
          .wsms-pg .wsms-card-header svg, .wsms-pg .wsms-card-header-ems svg {opacity: .9;}
          .wsms-pg svg.bi {margin-right: 6px; vertical-align: middle;}
          .wsms-pg .major-field.row {flex-direction: row; align-items: center; gap: 8px;}
          .wsms-pg input.c {text-align: center;}
          #active-occurrences-tbody td, #active-unavailability-tbody td {text-align: center; border: 1px solid #DEE2E6;}
          .wsms-pg .tbl-box {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden;}
          .wsms-pg .tbl-box .table-container {margin: 0 !important; border: 0; border-radius: 0; box-shadow: none; padding: 0; background: transparent;}
          .wsms-pg .tbl-box table {width: 100%; border-collapse: collapse; margin: 0; border: 0;}
          .wsms-pg .tbl-box thead th {background: #f1f3f5 !important; color: #5b6670 !important; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; text-align: left; padding: 9px 12px; border: 0 !important; border-bottom: 1px solid #e3e7eb !important;}
          .wsms-pg .tbl-box tbody td {text-align: left !important; border: 0 !important; border-bottom: 1px solid #eef0f2 !important; padding: 8px 12px; font-size: 12.5px; color: #2c3e50; background: #fff;}
          .wsms-pg .tbl-box tbody tr:last-child td {border-bottom: 0 !important;}
          .wsms-pg .tbl-box tbody td.empty {text-align: center !important; color: #6c757d;}
          .wsms-pg .occ-pill {height: 28px; padding: 0 14px; border-radius: 999px; border: 1px solid #d5dbe1; background: #fff; color: #2c3e50; font-size: 12px; font-weight: 700; cursor: pointer;}
          .wsms-pg .occ-pill.on {background: #2c3e50; border-color: #2c3e50; color: #fff;}
          .wsms-pg td.empty {padding: 20px; color: #6C757D;}
          .wsms-pg td.empty.err {color: red;}
          .wsms-pg .wsms-send-row {display: flex; justify-content: flex-end; margin-bottom: 50px;}
          .wsms-pg textarea.wsms-ta {width: 100%; resize: vertical; border: 1px solid #c8c8c8; border-radius: 5px; padding: 8px; font-size: 12px; box-sizing: border-box;}
          #page-wsms .major-card-body {font-family: 'Segoe UI', sans-serif;}
          #page-wsms .intro {font-size: 15px; margin-bottom: 20px; color: #333;}
          #page-wsms .feat-title {background: linear-gradient(90deg, #d5d5d5, #c9c9c9); padding: 15px 20px; border-left: 5px solid #171d8f; border-radius: 6px; margin-bottom: 20px;}
          #page-wsms ul {padding-left: 25px; line-height: 1.6;}
          #page-wsms li {margin-bottom: 8px;}
          #page-wsms .outro {margin-top: 40px; text-align: center; font-style: italic; color: #6c757d;}
          #page-active_occurrences .posit-btn, #page-active_occurrences .occ-upd-btn {font-size: 10px;}
          #page-active_occurrences .occ-upd-btn {background: #2c3e50; color: #fff;}
          #page-active_occurrences .occ-kpis {display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; align-items: center;}
          #page-active_occurrences .occ-kpi {background: #fff; border: 1px solid #e9ecef; border-left: 4px solid var(--c); border-radius: 10px; padding: 8px 14px; display: flex; gap: 12px; align-items: center;}
          #page-active_occurrences .occ-bar {display: flex; align-items: center; gap: 8px; margin: 0;}
          #page-active_occurrences .wsms-card-body {gap: 10px;}
          #page-active_occurrences .occ-card > .wsms-card-body {padding-bottom: 35px;}   /* página com a altura de antes */
          #page-active_occurrences .occ-pills {display: flex; gap: 6px; flex-wrap: wrap;}
          #page-active_occurrences .occ-bar .btn {margin: 0 0 0 auto;}
          #page-active_occurrences .occ-card > .wsms-card-footer {display: none;}
          #page-active_occurrences #ofu-card .table-container {margin-top: 0 !important;}
          #page-active_occurrences #ofu-card .ofu-filter {margin-bottom: 0;}
          #page-solicitation .ins-layout {grid-template-columns: minmax(0, 1fr) 300px;}
          #page-active_occurrences .occ-upd-btn {background: transparent !important; color: inherit !important; font-size: 14px !important; padding: 0 6px; box-shadow: none;}
          #page-active_occurrences .posit-btn {height: 24px; padding: 0 10px;}
          #page-active_occurrences > .wsms-card {margin-bottom: 10px;}
          #page-active_occurrences #ofu-card .table-container {background: #fff; border-radius: 12px; border: 1px solid #e9ecef; overflow: hidden;}
          #page-active_occurrences #ofu-card thead th {background: #f1f3f5; color: #5b6670; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; border: 0; border-bottom: 1px solid #e3e7eb;}
          #page-active_occurrences #ofu-tbody td {border: 0; border-bottom: 1px solid #eef0f2; background: #fff;}
          #page-active_occurrences .occ-kpi i {width: 34px; height: 34px; border-radius: 50%; background: color-mix(in srgb, var(--c) 14%, white); display: flex; align-items: center; justify-content: center; font-style: normal; font-size: 15px;}
          #page-active_occurrences .occ-kpi b {display: block; font-size: 20px; line-height: 1.1; color: #2c3e50;}
          #page-active_occurrences .occ-kpi small {font-size: 10.5px; color: #6c757d; text-transform: uppercase; font-weight: 700; letter-spacing: .3px;}
          #page-active_occurrences #active-occurrences-table {margin: 0;}
          #page-active_occurrences .wsms-card-body {padding-top: 12px; padding-bottom: 12px;}
          #page-active_occurrences .ofu-filter {margin: 0;}
          .wsms-pg .occ-st {display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 700; background: #eceff1; color: #455a64;}
          #page-active_occurrences .occ-st-em-curso {background: #fff3e0; color: #ef6c00;}
          #page-active_occurrences .occ-st-em-resolucao {background: #e3f2fd; color: #1565c0;}
          #page-active_occurrences .occ-st-em-conclusao {background: #e8f5e9; color: #2e7d32;}
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
          #page_insert_occurrence .lbl-animal {color: #c0392b;}
          #page_insert_occurrence .lbl-animal span {font-weight: 400; text-transform: none; letter-spacing: 0;}
          .wsms-pg .ins-card {display: flex; flex-direction: column;}
          .wsms-pg .ins-card, #page_close_occurrence > .wsms-card, #page-indisp > .wsms-card, #page-active_occurrences > .wsms-card {background: #efefef;}
          .wsms-pg .ins-card > .wsms-card-footer, #page_close_occurrence > .wsms-card > .wsms-card-footer, #page-indisp > .wsms-card > .wsms-card-footer, #page-active_occurrences > .wsms-card > .wsms-card-footer {background: #ddd;}
          .wsms-pg .ins-card > .wsms-card-body {padding: 12px 16px; flex: 1;}
          #page-solicitation .sol-card {min-height: 401px;}
          #page-inem-services .ems-card {min-height: 585px;}   /* mesmo tamanho do layout antigo */
          #page-inem-services .ems-card > .wsms-card-body {padding: 12px 16px;}
          #page-inem-services .ems-types {display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 5px;}
          #page-inem-services .ems-types .wsms-type-opt {padding: 12px 16px; border-width: 2px; border-color: #e9ecef; border-radius: 12px; background: #fff; position: relative; gap: 12px;}
          #page-inem-services .ems-types .wsms-type-opt input[type="checkbox"] {position: absolute; opacity: 0; pointer-events: none;}
          #page-inem-services .ems-dot {width: 22px; height: 22px; border-radius: 50%; flex: none; display: inline-block;}
          #page-inem-services .ems-dot-y {background: #f0b400;}
          #page-inem-services .ems-dot-r {background: #c62828;}
          #page-inem-services .theme-inem .ins-n {background: #f0b400; color: #1a2e4a;}
          #page-inem-services .theme-inem .ems-age input:focus, #page-inem-services .theme-inem .ems-age select:focus {border-color: #f0b400 !important; box-shadow: 0 0 0 2px rgba(240,180,0,.18) !important;}
          #page-inem-services #opt-reserv.active {border-color: #c0392b; background: #fdf0ee;}
          #page-inem-services #opt-inem.active {border-color: #f0b400; background: #fffbea;}
          #page-inem-services .theme-inem .ems-ticker {background: #fffbea; border-bottom-color: #f3e3a6;}
          #page-inem-services .ems-types .wsms-type-opt label {font-size: 15px; font-weight: 800; display: flex; flex-direction: column; gap: 2px; color: #2c3e50;}
          #page-inem-services .ems-age {display: flex; gap: 6px;}
          #page-inem-services .ems-age input {flex: 1; min-width: 0;}
          #page-inem-services .ems-age select {flex: 1.2; min-width: 0;}
          #page-inem-services .ems-sit {width: 100%; height: 148px; resize: none; border: 1px solid #c8c8c8; border-radius: 5px; padding: 8px 9px; font: inherit; font-size: 12px; color: #333; background: #fff; box-sizing: border-box; outline: none; transition: border-color .15s, box-shadow .15s;}
          #page-inem-services .ems-sit:focus {border-color: #c0392b; box-shadow: 0 0 0 2px rgba(192,57,43,.12);}   /* igual aos outros campos */
          #page-inem-services .theme-inem .ems-sit:focus {border-color: #f0b400; box-shadow: 0 0 0 2px rgba(240,180,0,.18);}
          #page-inem-services .ems-types .wsms-type-opt label small {font-size: 11.5px; font-weight: 500; color: #6c757d; letter-spacing: 0;}
          #page-inem-services .ems-cols {grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px;}
          #page-inem-services .ems-cols {grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr); grid-template-areas: "b1 b2 b4" "b3 b3 b4";}
          #page-inem-services #ems-b1 {grid-area: b1;}
          #page-inem-services #ems-b2 {grid-area: b2;}
          #page-inem-services #ems-b3 {grid-area: b3;}
          #page-inem-services #ems-b4 {grid-area: b4; display: flex; flex-direction: column;}
          #page-inem-services #ems-map {flex: 1; min-height: 240px; border: 1px solid #e3e7eb; border-radius: 8px; position: relative; z-index: 0;}
          #page-inem-services .ins-map-st {margin-top: 6px; font-size: 11.5px; line-height: 1.3; color: #8a949e;}
          #page-inem-services .ins-map-st.ok {color: #2e7d32; font-weight: 700;}
          #page-inem-services .ins-grid:not(.ems-cols):not(.sol-g2) {grid-template-columns: 1fr;}
          #page-inem-services .leaflet-control-layers-list label {display: block; margin: 0; cursor: pointer;}
          #page-inem-services .leaflet-control-layers-list label > span {display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: #2c3e50; white-space: nowrap;}
          #page-inem-services .leaflet-control-layers-selector {width: auto !important; height: auto !important; margin: 0 !important; position: static !important; flex: none; cursor: pointer;}
          #page-inem-services .leaflet-control-layers-base label + label {margin-top: 4px;}
          .ems-triage { display: flex; align-items: center; gap: 10px; }
          #page-inem-services .ems-triage select { width: 90px !important; flex: none; }
          #triage-dots { display: flex; gap: 4px; align-items: center; min-width: 50px; }
          #triage-dots i { width: 14px; height: 14px; border-radius: 50%; display: block; }
          #triage-dots { display: flex; gap: 4px; align-items: center; }
          #page-inem-services #triage-dots { display: flex; gap: 4px; align-items: center; min-width: 0 !important; }
          #page-inem-services .ems-triage { gap: 8px; }
          #page-inem-services .ems-vmer { display: none; align-items: center; gap: 10px; margin-left: 0; font-size: 12px; font-weight: 600; color: #444; }
          #page-inem-services .ems-vmer label { display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer !important; text-transform: none; letter-spacing: 0; white-space: nowrap; }
          #page-inem-services .ems-vmer input,
          #page-inem-services .ems-vmer input:hover,
          #page-inem-services .ems-vmer input:focus,
          #page-inem-services .ems-vmer input:focus-visible,
          #page-inem-services .ems-vmer input:active { width: 17px !important; height: 17px; margin: 0; accent-color: #c0392b; cursor: pointer !important; border: 0 !important; outline: none !important; box-shadow: none !important; }
          #page-indisp .ind-card {min-height: 370px;}
          #page-indisp .ind-g-new {grid-template-columns: 1fr 1fr 1fr 2fr 1fr;}
          #page-indisp .ind-g-end {grid-template-columns: 1fr 2fr 1fr 1fr;}
          #page-indisp .ind-act {display: flex; justify-content: flex-end; margin-top: 10px;}
          #page-indisp .ind-tabs {margin-left: auto; display: flex; gap: 6px; text-transform: none; letter-spacing: 0;}
          #page-indisp .ind-rl {padding: 0 10px;}
          #page-indisp .finalize-btn {height: 26px; padding: 0 16px; font-size: 12px;}
          #page-indisp .ind-st-inop {background: #fdecea; color: #c62828;}
          #page-indisp .ind-st-ret {background: #fff3e0; color: #ef6c00;}
          #page-indisp .ind-st-pausa {background: #e3f2fd; color: #1565c0;}
          #page-indisp #end_vehicle_unavailable, #page-indisp #end_reason_unavailability {background: #f4f6f8;}
          #page-solicitation .sol-g4 {grid-template-columns: 1fr 1.4fr 1.4fr .8fr;}
          #page-solicitation .sol-two {grid-template-columns: 1fr 1fr;}
          #page-solicitation .sol-stp {display: flex; align-items: center; border: 1px solid #ced4da; border-radius: 6px; background: #fff; overflow: hidden;}
          #page-solicitation .sol-stp input {border: 0 !important; box-shadow: none !important; flex: 1;}
          #page-solicitation .sol-stp button {width: 32px; height: 30px; border: 0; background: #f4f6f8; color: #2c3e50; font-size: 16px; font-weight: 700; cursor: pointer;}
          #page-solicitation .sol-stp button:hover {background: #e9ecef;}
          #page-solicitation .sol-prev {margin: 10px 0 0; padding: 10px 12px; border: 1px dashed #cfd6dd; border-radius: 8px; background: #f8f9fa; font: 12.5px/1.6 ui-monospace, Consolas, monospace; color: #2c3e50; white-space: pre-wrap; word-break: break-word;}
          .wsms-pg .sol-g2 {grid-template-columns: 1fr 1fr;}
          .wsms-pg .ins-grid input, .wsms-pg .ins-grid select {width: 100% !important; min-width: 0; box-sizing: border-box;}
          .wsms-pg .ins-grid .major-field {min-width: 0; margin: 0;}
          .wsms-pg .ins-grid .major-field label {white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
          #page_insert_occurrence .ins-card {min-height: 776px; display: flex; flex-direction: column;}   /* mesmo tamanho do layout antigo (2 cartões) */
          #page_insert_occurrence .ins-card .wsms-card-body {padding: 12px 16px; flex: 1;}
          .wsms-pg .ins-layout {display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 5px; align-items: stretch;}
          .wsms-pg .ins-main {display: flex; flex-direction: column; gap: 5px; min-width: 0;}
          .wsms-pg .ins-two {display: grid; grid-template-columns: 1fr 1.75fr; gap: 5px;}
          .wsms-pg .ins-box {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); padding: 10px 14px 12px; min-width: 0;}
          .wsms-pg .ins-bh {display: flex; align-items: center; gap: 9px; font-size: 12.5px; font-weight: 700; color: #2c3e50; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .4px;}
          .wsms-pg .ins-bh .btn {margin-left: auto;}
          .wsms-pg .ins-n {width: 22px; height: 22px; border-radius: 50%; background: #c62828; color: #fff; font-size: 11.5px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;}
          .wsms-pg .ins-grid {display: grid; gap: 10px;}
          #page_insert_occurrence .ins-g-alert {grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));}
          #page_insert_occurrence .ins-g-local {grid-template-columns: 2fr 1fr 1fr 1fr 1fr;}
          #page_insert_occurrence .ins-g-other {grid-template-columns: repeat(3, minmax(0, 1fr));}
          #page_insert_occurrence .ins-g-ppi {grid-template-columns: .8fr 1.3fr .9fr .55fr 1.2fr 1.3fr;}
          .wsms-pg .ins-grid .major-field {min-width: 0; margin: 0;}
          .wsms-pg .ins-grid .major-field label {white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
          .wsms-pg .ins-grid input, .wsms-pg .ins-grid select {width: 100% !important; min-width: 0; box-sizing: border-box;}
          #page_insert_occurrence #vehicle-container {grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0;}
          #page_insert_occurrence .wsms-vehicle-card {margin: 0; min-width: 0; border: 1px solid #f0dcda; border-left: 3px solid #ef9a9a; border-radius: 10px; overflow: hidden; background: #fff; box-shadow: 0 1px 4px rgba(198,40,40,.08); transition: box-shadow .15s, border-color .15s;}
          #page_insert_occurrence .wsms-vehicle-card:hover {box-shadow: 0 3px 10px rgba(198,40,40,.14);}
          #page_insert_occurrence .wsms-vehicle-card:has(> .field-card-title[data-v]:not([data-v=""])) {border-left-color: #c62828;}
          #page_insert_occurrence .wsms-vehicle-card > .field-card-title {background: #fdf3f2 !important; color: #2c3e50 !important; border-bottom: 1px solid #f0dcda; display: flex; align-items: center; justify-content: space-between; text-transform: none; font-size: 12.5px; font-weight: 800; text-shadow: none !important; height: 34px; box-sizing: border-box; padding-top: 0 !important; padding-bottom: 0 !important;}
          #page_insert_occurrence .wsms-vehicle-card > .field-card-title[data-v]:not([data-v=""])::after {content: attr(data-v); background: #2c3e50; color: #fff; border: 1px solid #2c3e50; border-radius: 999px; padding: 1px 10px; font-size: 11px; line-height: 18px;}
          #page_insert_occurrence .ocr-chip {background: #fdecea; color: #b71c1c; border-color: #f5c6c2;}
          #page_insert_occurrence .ocr-chip button {background: #f5c6c2; color: #b71c1c;}
          #page_insert_occurrence .ocr-chip.more {background: #f1f3f5; color: #555; border-color: #dcdfe3;}
          #page_insert_occurrence .wsms-vehicle-card .major-row {display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; padding: 8px 10px;}
          #page_insert_occurrence .wsms-vehicle-card .major-field {min-width: 0 !important; flex: none !important; margin: 0;}
          #page_insert_occurrence .wsms-vehicle-card .major-field:nth-child(2) {order: 1;}
          #page_insert_occurrence .wsms-vehicle-card .major-field.ocr-elems-field {order: 2;}
          #page_insert_occurrence .wsms-vehicle-card .major-field:nth-child(1) {order: 3;}
          #page_insert_occurrence .wsms-vehicle-card .major-field:nth-child(5) {order: 4;}
          #page_insert_occurrence .wsms-vehicle-card .major-field input, #page_insert_occurrence .wsms-vehicle-card .major-field select {width: 100% !important; box-sizing: border-box;}
          .wsms-pg .ins-sum {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); padding: 14px 16px; contain: size; overflow: hidden;}
          .wsms-pg .ins-sum-k {font-size: 11.5px; font-weight: 800; color: #c62828; text-transform: uppercase; letter-spacing: .4px;}
          .wsms-pg .ins-sum-t {font-size: 18px; font-weight: 800; color: #2c3e50; margin: 8px 0 8px; line-height: 1.25; word-break: break-word;}
          .wsms-pg .ins-sum-l {display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-bottom: 1px dashed #e3e7eb; font-size: 12.5px; color: #55606b;}
          .wsms-pg .ins-sum-l b {color: #2c3e50; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;}
          .wsms-pg .ins-sum-p {font-size: 11.5px; color: #8a949e; margin: 10px 0 0;}
          #page_insert_occurrence #wsms_output {display: none;}
          #page_insert_occurrence .wsms-card-footer .wsms-btn-green {margin: 0 10px;}
          #page_close_occurrence .cls-card {min-height: 680px;}
          #page_close_occurrence .cls-g-nr {grid-template-columns: 240px 1fr;}
          #page_close_occurrence .cls-info {height: 32px; display: flex; align-items: center; padding: 0 12px; border-radius: 6px; background: #f4f6f8; border: 1px solid #e3e7eb; color: #8a949e; font-size: 12.5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;}
          #page_close_occurrence .cls-info.ok {color: #2c3e50; background: #eef7ee; border-color: #cfe6cf;}
          #page_close_occurrence .cls-thead,
          #page_close_occurrence #vehicles-container .wsms-card-mini {display: grid; grid-template-columns: 160px 220px 220px 220px 91px 166px minmax(180px, 1fr); gap: 0; align-items: stretch;}
          #page_close_occurrence .cls-thead {background: #f1f3f5; border: 1px solid #e3e7eb; border-radius: 10px 10px 0 0; padding: 0 12px; font-size: 11px; font-weight: 800; color: #5b6670; text-transform: uppercase; letter-spacing: .4px;}
          #page_close_occurrence .cls-thead > span {padding: 9px 8px; border-left: 1px solid #d8dde2; display: flex; align-items: center; justify-content: center; text-align: center;}
          #page_close_occurrence .cls-thead > span:first-child {border-left: 0; padding-left: 0;}
          #page_close_occurrence .cls-thead > span:last-child {padding-right: 0;}
          #page_close_occurrence #vehicles-container {display: block; margin: 0; border: 1px solid #e3e7eb; border-top: 0; border-radius: 0 0 10px 10px; overflow: hidden; background: #fff;}
          #page_close_occurrence #vehicles-container:empty {display: none;}
          #page_close_occurrence #vehicles-container .wsms-card-mini {margin: 0 !important; padding: 0 12px !important; border: 0 !important; border-bottom: 1px solid #e3e7eb !important; border-radius: 0 !important; box-shadow: none !important; background: #fff !important;}
          #page_close_occurrence #vehicles-container .wsms-card-mini:last-child {border-bottom: 0 !important;}
          #page_close_occurrence #vehicles-container .wsms-card-mini > .field-card-title {display: none;}
          #page_close_occurrence #vehicles-container .wsms-card-mini > div:not(.field-card-title) {display: contents !important;}
          #page_close_occurrence #vehicles-container .major-row {margin: 0 !important; padding: 6px 8px !important; border-left: 1px solid #d8dde2; display: flex !important; flex-wrap: nowrap !important; align-items: center; gap: 8px; min-width: 0; box-sizing: border-box;}
          #page_close_occurrence #vehicles-container .major-row:first-child {border-left: 0; padding-left: 0 !important;}
          #page_close_occurrence #vehicles-container .major-row:last-child {padding-right: 0 !important;}
          #page_close_occurrence #vehicles-container .major-row:last-child .major-field {flex: 1 1 auto;}
          #page_close_occurrence #vehicles-container .major-row:last-child input {width: 100% !important;}
          #page_close_occurrence #vehicles-container .major-field {margin: 0 !important; min-width: 0; flex: 1 1 0;}
          #page_close_occurrence #vehicles-container .major-field label {display: none !important;}
          #page_close_occurrence #vehicles-container input, #page_close_occurrence #vehicles-container select {width: 100% !important; min-width: 0; box-sizing: border-box;}
          #page_close_occurrence #vehicles-container input[type="date"] {flex: none; width: 110px !important;}
          #page_close_occurrence #vehicles-container input[type="time"] {flex: none; width: 85px !important;}
          #page_close_occurrence #vehicles-container .major-field:has(> input[type="date"]) {flex: none;}
          #page_close_occurrence #vehicles-container .major-field:has(> input[type="time"]) {flex: none;}
          #page_close_occurrence #vehicles-container .major-row:nth-child(6) .major-field > div {gap: 4px;}
          #page_close_occurrence #vehicles-container .major-row:nth-child(6) span {display: none;}
          #page_close_occurrence #vehicles-container .major-row:nth-child(6) .major-field {flex: 1 1 auto;}
          #page_close_occurrence #vehicles-container .major-row:nth-child(6) .major-field > div {display: flex; width: 100%;}
          #page_close_occurrence #vehicles-container .major-row:nth-child(6) input {flex: 1 1 0; width: auto !important; text-align: center;}
          #page_close_occurrence .cls-tabs {display: flex; gap: 8px; flex-wrap: wrap;}
          #page_close_occurrence .cls-pill {height: 32px; padding: 0 14px; border-radius: 8px; border: 1px solid #d5dbe1; background: #fff; color: #2c3e50; font-size: 12.5px; font-weight: 700; cursor: pointer;}
          #page_close_occurrence .cls-pill.on {background: #c62828; border-color: #c62828; color: #fff;}
          #page_close_occurrence .cls-panels > .wsms-section:not(.hidden),
          #page_close_occurrence .cls-panels .grid-2fr {margin-top: 10px;}
          #page_close_occurrence .cls-top {margin-bottom: -10px;}
          #page_close_occurrence .field-card-title.bar {display: flex; justify-content: space-between; align-items: center;}
          #page_close_occurrence .field-card-title .btn {height: 22px; padding: 0 10px; font-size: 11px;}
          #page_close_occurrence .field-card-title svg.bi {width: 11px; height: 11px; margin-right: 4px;}
          #page_close_occurrence .cls-in {padding: 6px 10px;}
          #page_close_occurrence .cls-area {padding: 8px 12px;}
          #page_close_occurrence .wsms-observ-card textarea {height: 70px;}
          #page-weather-warnings .met-card {min-height: 243px;}
          #page-weather-warnings .met-bar {display: flex; align-items: center; gap: 10px; margin-bottom: 10px;}
          #page-weather-warnings .met-days {display: flex; gap: 6px;}
          #page-weather-warnings .met-upd {margin-left: auto; font-size: 11.5px; color: #6c757d;}
          #page-weather-warnings .met-card > .wsms-card-body {gap: 0;}
          #page-weather-warnings #ipma-alerts {display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px;}
          #page-weather-warnings .met-c {border-radius: 12px; padding: 10px 14px; color: #fff; display: flex; flex-direction: column; gap: 2px; min-height: 72px; box-sizing: border-box; min-width: 0; box-shadow: 0 1px 3px rgba(0,0,0,.08); position: relative;}
          #page-weather-warnings .met-c b {font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
          #page-weather-warnings .met-c small {font-size: 11.5px; opacity: .92;}
          #page-weather-warnings .met-c p {margin: 2px 0 0; font-size: 11.5px; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;}
          #page-weather-warnings .met-c button {align-self: flex-end; margin-top: 6px; height: 24px; padding: 0 12px; border: 1px solid rgba(255,255,255,.6); border-radius: 999px; background: rgba(255,255,255,.18); color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;}
          #page-weather-warnings .met-c button:hover {background: rgba(255,255,255,.32);}
          #page-weather-warnings .met-yellow {background: linear-gradient(135deg, #fbb534, #f7931e);}
          #page-weather-warnings .met-orange {background: linear-gradient(135deg, #f57c00, #e14d17);}
          #page-weather-warnings .met-red {background: linear-gradient(135deg, #e53935, #b71c1c);}
          #page-weather-warnings .met-none {background: linear-gradient(135deg, #9aa3ad, #7f8994);}
          #page-weather-warnings .met-wide {grid-column: 1 / -1;}
          #page-inem-services .wsms-card {margin: 0 0 25px 0;}
          #page-inem-services .ems-ticker {background: #fff5f5; overflow: hidden; width: 100%; padding: 6px 0; border-bottom: 1px solid #f5d0d0;}
          #page-inem-services .ems-ticker div {display: inline-block; white-space: nowrap; animation: ticker-scroll 45s linear infinite; color: #7b0000; font-size: 12px; font-weight: 600; font-family: 'Segoe UI', sans-serif; letter-spacing: .3px;}
          #ems-sug {position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; margin-top: 2px; background: #fff; border: 1px solid #d0d5da; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,.15); overflow: hidden;}
          #ems-sug .ems-sug-i {padding: 7px 10px; cursor: pointer; display: flex; flex-direction: column; gap: 1px; border-bottom: 1px solid #f0f2f4;}
          #ems-sug .ems-sug-i:last-child {border-bottom: 0;}
          #ems-sug .ems-sug-i b {font-size: 12.5px; color: #2c3e50;}
          #ems-sug .ems-sug-i small {font-size: 11px; color: #6c757d;}
          #ems-sug .ems-sug-i:hover, #ems-sug .ems-sug-i.on {background: #f4f6f8;}
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
                        ['🚑', 'Serviços EMS', 'Disponibilização via WSMS de serviços de Emergência Médica, facilitando a sua melhor percepção de escrita.'],
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
        </div>
      `);
      /* =======================================================================
      OCORRÊNCIAS EM CURSO (+ POSIT + Nr. OC)
      ======================================================================= */
      (function activeOccurrences() {
      const OCC_FILTERS = [['', 'Todas'], ['Em Curso', 'Em curso'], ['Em Resolução', 'Em resolução'], ['Em Conclusão', 'Em conclusão']];
      let occFilter = '';
        const page = mount('page-active_occurrences', `
          ${card({icon: 'fire', title: 'OCORRÊNCIAS EM CURSO', cls: 'occ-card',
                  body: `<div class="occ-kpis">
                           <div class="occ-kpi" style="--c:#c62828"><i>🔥</i><div><b id="occ-k-act">0</b><small>Ocorrências ativas</small></div></div>
                           <div class="occ-kpi" style="--c:#1565c0"><i>🚒</i><div><b id="occ-k-veh">0</b><small>Veículos empenhados</small></div></div>
                           <div class="occ-kpi" style="--c:#ef6c00"><i>📍</i><div><b id="occ-k-ter">0</b><small>Atualizações do terreno hoje</small></div></div>
                           <div class="occ-kpi" style="--c:#2e7d32"><i>⏱️</i><div><b id="occ-k-old">—</b><small>Mais antiga em curso</small></div></div>
                         </div>
                         <div class="occ-bar"><div class="occ-pills" id="occ-pills">${OCC_FILTERS.map(([f, t]) => `<button type="button" class="occ-pill${f ? '' : ' on'}" data-f="${f}">${t}</button>`).join('')}</div>
                           ${button('wsms-btn-green', 'reload', 'ATUALIZAR', 'reload')}</div>
                         <div class="tbl-box"><div class="table-container"><table id="active-occurrences-table"><thead><tr>
                           <th style="width:110px">Alerta</th><th>Descrição</th><th>Local</th><th>Veículos</th><th style="width:130px">Estado</th><th style="width:80px">POSIT</th><th style="width:60px"></th>
                         </tr></thead><tbody id="active-occurrences-tbody"></tbody></table></div></div>`})}
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
        let lastSig = null, rows = [];
        async function loadActiveOccurrences() {
          const tbody = $('active-occurrences-tbody');
          if (!tbody) return;
          const message = (html, sig) => { if (lastSig !== sig) { lastSig = sig; tbody.innerHTML = html; } };
          try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?select=*,vehicles&corp_oper_nr=eq.${corp()}&status=in.(Em Curso,Em Resolução,Em Conclusão)&order=id.asc`, {
              headers: getSupabaseHeaders()
            });
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            const occ = await resp.json();
            occKpis(occ);
            if (!occ.length) return message('<tr><td colspan="7" class="empty">Não existem ocorrências ativas neste momento.</td></tr>', 'vazia');
            const sig = JSON.stringify(occ.map(o => [o.id, o.start_date, o.occorrence, o.local, o.localitie, o.vehicles, o.status, o.nr_oc]));
            if (sig === lastSig) return;
            rows = occ.map(o => {
              const d = parseDateTime(o.start_date);
              const date = d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}` : o.start_date;
              const list = Array.isArray(o.vehicles) ? o.vehicles : typeof o.vehicles === 'string' ? o.vehicles.split(',') : [];
              const names = list.map(v => String(v ?? '').trim()).filter(Boolean), count = names.length;
              const short = d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}` : o.start_date;
              return {o, date, count, names, short};
            });
            const t = document.createElement('tbody');
            t.innerHTML = rows.map((r, i) => `<tr data-i="${i}" data-st="${esc(r.o.status)}"><td>${esc(r.short)}</td><td>${esc(r.o.occorrence)}</td><td>${esc([r.o.local, r.o.localitie].filter(Boolean).join(' · '))}</td>
              <td>${esc(r.names.join(' · ')) || '—'}</td>
              <td><span class="occ-st occ-st-${(r.o.status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').toLowerCase()}">${esc(r.o.status)}</span></td><td><button class="btn btn-danger posit-btn">POSIT</button></td><td><button class="btn occ-upd-btn" title="Atualizar (Nr. OC)">✏️</button></td></tr>`).join('');
            tbody.replaceChildren(...t.children);
            occApplyFilter();
            lastSig = sig;
          } catch (error) {
            console.error('Erro ao carregar ocorrências ativas:', error);
            message('<tr><td colspan="7" class="empty err">Erro ao carregar ocorrências</td></tr>', 'erro');
          }
        }
        window.loadActiveOccurrences = loadActiveOccurrences;
        function occKpis(occ) {
          const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
          const nveh = o => Array.isArray(o.vehicles) ? o.vehicles.length : typeof o.vehicles === 'string' ? o.vehicles.split(',').filter(v => v.trim() !== '').length : 0;
          set('occ-k-act', occ.length);
          set('occ-k-veh', occ.reduce((s, o) => s + nveh(o), 0));
          document.querySelectorAll('#occ-pills .occ-pill').forEach(b => {
            const n = b.dataset.f ? occ.filter(o => o.status === b.dataset.f).length : occ.length;
            b.textContent = `${OCC_FILTERS.find(([f]) => f === b.dataset.f)[1]} (${n})`;
          });
          const starts = occ.map(o => parseDateTime(o.start_date)).filter(Boolean).map(d => d.getTime());
          if (!starts.length) return set('occ-k-old', '—');
          const min = Math.max(0, Math.floor((Date.now() - Math.min(...starts)) / 60000));
          set('occ-k-old', `${pad(Math.floor(min / 60))}:${pad(min % 60)}`);
        }
        function occApplyFilter() {
          document.querySelectorAll('#active-occurrences-tbody tr[data-i]').forEach(tr => { tr.hidden = !!occFilter && tr.dataset.st !== occFilter; });
        }
        page.addEventListener('click', e => {
          const pill = e.target.closest('#occ-pills .occ-pill');
          if (!pill) return;
          occFilter = pill.dataset.f;
          document.querySelectorAll('#occ-pills .occ-pill').forEach(b => b.classList.toggle('on', b === pill));
          occApplyFilter();
        });
        function occTerrenoCount() {
          const tb = $('ofu-tbody'), el = $('occ-k-ter');
          if (!tb || !el) return false;
          el.textContent = [...tb.rows].filter(r => !r.querySelector('td[colspan]')).length;
          return true;
        }
        (function watchTerreno(n = 0) {
          if (occTerrenoCount()) return new MutationObserver(occTerrenoCount).observe($('ofu-tbody'), {childList: true});
          if (n < 60) setTimeout(() => watchTerreno(n + 1), 500);
        })();
        page.addEventListener('click', e => {
          const tr = e.target.closest('#active-occurrences-tbody tr[data-i]');
          if (!tr) return;
          const r = rows[+tr.dataset.i];
          if (e.target.closest('.posit-btn')) openPositPopup(r.o);
          else if (e.target.closest('.occ-upd-btn')) openOccUpdateModal(r.o, r.date, r.count);
        });
        /* ---------- ATUALIZAR OCORRÊNCIA (Nr. OC) ---------- */
        function occUpdEnsure() {
          if ($('occ-upd-modal')) return;
          const m = document.createElement('div');
          m.id = 'occ-upd-modal';
          m.innerHTML = `
            <div class="ou-box">
              <div class="wsms-card-header"><i class="fa-solid fa-pen-to-square"></i><span>ATUALIZAR OCORRÊNCIA</span><button type="button" class="ou-x" id="ou-x" title="Fechar">✕</button></div>
              <div class="ou-body" id="ou-body"></div>
              <div class="wsms-card-footer"><button type="button" class="btn btn-danger" id="ou-cancel">CANCELAR</button><button type="button" class="btn wsms-btn-green" id="ou-save">GRAVAR</button></div>
            </div>
          `;
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
            </div>
          `;
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
          <div class="wsms-card last-card ins-card">
            <div class="wsms-card-header">${svg('bolt')}<span>INSERIR / ALTERAR OCORRÊNCIA</span></div>
            <div class="wsms-card-body"><div class="ins-layout"><div class="ins-main">
              ${box(1, 'Alerta', grid('ins-g-alert', [
                {id: 'alert_type', label: 'Tipo de Alerta', tag: 'select'}, {id: 'alert_source', label: 'Fonte do Alerta', tag: 'select'},
                {id: 'ems_nr', label: 'Nr. CODU', ph: 'Ex. 123456789', wrapId: 'ems_group'},
                {id: 'alert_date', label: 'Data do Alerta', type: 'date'}, {id: 'alert_time', label: 'Hora do Alerta', type: 'time'},
                {id: 'class_occorr_input', label: 'Class. Ocorrência', ph: 'Ex. 3103', c: 1, num: 4}, {id: 'occorr_descr_input', label: 'Descr. de Ocorrência', ph: 'Ex. Incêndio de Mato', hidden: 1},
                {id: 'nr_occurrence_input', label: 'Nr. Ocorrência', ph: 'Ex. 123456789', c: 1, num: 11}, {id: 'channel_maneuver', label: 'Canal de Manobra', tag: 'select', opts: ['&nbsp;']}]))}
              ${box(2, 'Local', grid('ins-g-local', [
                {id: 'occorr_local_input', label: 'Morada da Ocorrência', ph: 'Ex. Rua Serpa Pinto, 00'}, {id: 'occorr_localitie_input', label: 'Localidade', ph: 'Ex. Faro'},
                {id: 'district_select', label: 'Distrito', tag: 'select'}, {id: 'council_select', label: 'Concelho', tag: 'select', opts: ['&nbsp;']},
                {id: 'parish_select', label: 'Freguesia', tag: 'select'}]))}
              <div class="ins-two">
                ${box(3, 'Contactante', `<div class="ins-grid ins-g-other">
                  ${field({id: 'contact_name', label: 'Contactante', ph: 'Ex. João Sousa'})}
                  ${field({id: 'contact_nr', label: 'Nr. Contactante', ph: 'Ex. 910 000 000', c: 1, num: 9})}
                  <div class="major-field"><label for="animal-type" class="lbl-animal" title="Preencher se a ocorrência for salvamento animal">Tipo de Animal</label><input type="text" id="animal-type" placeholder="Ex. Canídeo"></div>
                </div>`)}
                ${box(4, 'Plano prévio de intervenção', grid('ins-g-ppi', [
                  {id: 'ppi_type', label: 'Tipo de PPI', tag: 'select'}, {id: 'alert_level', label: 'Nível de Alerta', tag: 'select', opts: ['&nbsp;']},
                  {id: 'alarm_grid', label: 'Grelha', tag: 'select', opts: ['&nbsp;']}, {id: 'km', label: 'Km', ph: '00', c: 1, dec: 1},
                  {id: 'on_going', label: 'Sentido', tag: 'select'}, {id: 'incident_type', label: 'Tipo de Incidente', tag: 'select'}]))}
              </div>
              ${box(5, 'Veículos', `<div class="grid-2fr" id="vehicle-container"></div><textarea id="wsms_output" rows="4" cols="50" readonly></textarea>`,
                    `<button id="add-new-vehicle-btn" class="btn wsms-btn-blue" data-act="add">${svg('plus', 13).replace('<svg ', '<svg class="bi" ')}ADICIONAR</button>`)}
            </div>
            <aside class="ins-sum" id="ins-sum">
              <div class="ins-sum-k">Resumo da ocorrência</div>
              <div class="ins-sum-t" id="ins-sum-t">—</div>
              <div class="ins-sum-l"><span>Classificação</span><b id="ins-sum-class">—</b></div>
              <div class="ins-sum-l"><span>Local</span><b id="ins-sum-local">—</b></div>
              <div class="ins-sum-l"><span>Alerta</span><b id="ins-sum-alert">—</b></div>
              <div class="ins-sum-l"><span>Fonte</span><b id="ins-sum-src">—</b></div>
              <div class="ins-sum-l"><span>Contactante</span><b id="ins-sum-contact">—</b></div>
              <div class="ins-sum-l"><span>PPI</span><b id="ins-sum-ppi">—</b></div>
              <div class="ins-sum-l"><span>Veículos</span><b id="ins-sum-veh">0</b></div>
              <div class="ins-sum-l"><span>Elementos</span><b id="ins-sum-el">0</b></div>
              <p class="ins-sum-p"></p>
            </aside></div></div>
            <div class="wsms-card-footer">${button('wsms-btn-green', 'phone', 'BOMBEIROS', 'wsms')}${button('wsms-btn-send', 'phone', 'COMUNICAR CREPC', 'crepc')}</div>
          </div>
        `,
        {add: () => NewOCRaddVehicle(), wsms: () => generateWSMSMessage(), crepc: () => generateNewCREPCMessage()});
        if (!page) return;
        const v = id => $(id)?.value || '';
        function insSummary() {
          const set = (id, val) => { const el = $(id); if (el) el.textContent = val || '—'; };
          const sel = id => { const s = $(id); return s && s.value ? (s.options[s.selectedIndex]?.text || s.value).trim() : ''; };
          const cls = v('class_occorr_input').trim(), descr = v('occorr_descr_input').trim();
          set('ins-sum-t', descr || sel('alert_type'));
          set('ins-sum-class', cls);
          set('ins-sum-local', [v('occorr_localitie_input').trim(), sel('parish_select')].filter(Boolean).join(' · ') || v('occorr_local_input').trim());
          const d = v('alert_date'), h = v('alert_time');
          set('ins-sum-alert', d || h ? `${d ? d.split('-').reverse().slice(0, 2).join('/') : ''} ${h}`.trim() : '');
          set('ins-sum-src', sel('alert_source'));
          set('ins-sum-contact', v('contact_name').trim());
          set('ins-sum-ppi', [sel('ppi_type').replace(/^PPI\s*/, ''), sel('alarm_grid')].filter(Boolean).join(' · '));
          const cards = [...document.querySelectorAll('#page_insert_occurrence .wsms-vehicle-card')];
          cards.forEach(c => { const t = c.querySelector('.field-card-title'), s = c.querySelector('select'); if (t) t.dataset.v = s?.value?.trim() || ''; });
          set('ins-sum-veh', String(cards.filter(c => c.querySelector('select')?.value?.trim()).length));
          set('ins-sum-el', String(cards.reduce((s, c) => s + (c._nints ? c._nints.size : (parseInt(c.querySelector('input[type="text"]')?.value, 10) || 0)), 0)));
        }
        let insSumRaf = 0;
        const insSumLater = () => { cancelAnimationFrame(insSumRaf); insSumRaf = requestAnimationFrame(insSummary); };
        ['input', 'change', 'click'].forEach(ev => document.addEventListener(ev, () => { if (page.classList.contains('active')) insSumLater(); }, true));
        document.querySelector('button[data-page="page_insert_occurrence"]')?.addEventListener('click', () => setTimeout(insSummary, 300));
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
        const cardVehicles = () => [...document.querySelectorAll('.wsms-vehicle-card')].map(c => ({
          vehicle: c.querySelector('select')?.value?.trim() || '', bbs: c.querySelector('input[type="text"]')?.value?.trim() || '',
          date: c.querySelector('input[type="date"]')?.value || '', time: c.querySelector('input[type="time"]')?.value || ''
        }));
        const selText = id => { const s = $(id); return s?.options[s.selectedIndex]?.text || ''; };
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
          const ok = document.querySelector('#popup-success .popup-btn');
          if (ok) {
            const clearFields = ok.onclick;
            ok.onclick = () => {
              clearFields?.();
              if (typeof NewOCRresetVehicles === 'function') NewOCRresetVehicles();
              setTimeout(insSummary, 300);
            };
          }
          return message;
        }
        let councilCache = null;
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
        $('alert_type').addEventListener('change', toggleAlertTypeFields);
        $('ppi_type').addEventListener('change', toggleAlertTypeFields);
        $('alert_source').addEventListener('change', () => { toggleEMSNrField(); toggleContactFields(); });
        $('class_occorr_input').addEventListener('change', toggleAnimalTypeField);
        document.addEventListener('DOMContentLoaded', async () => {
          toggleAlertTypeFields();
          toggleEMSNrField();
          toggleContactFields();
          toggleAnimalTypeField();
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
        const TABS = [['wsms-victims-card', '👤', 'Vítimas', 'victims-container'], ['wsms-extras-card', '🚑', 'Outros meios', 'extras-container'], ['wsms-demage-card', '⚠️', 'Danos', 'damages-container'],
                      ['wsms-burned-card', '🔥', 'Área ardida'], ['wsms-observ-card', '📝', 'Observações']];
        const addBar = (title, act) => `<div class="field-card-title bar">${title}${button('wsms-btn-green', 'plus', 'ADICIONAR', act)}</div>`;
        const page = mount('page_close_occurrence', `
          <div class="wsms-card last-card ins-card cls-card">
            <div class="wsms-card-header">${svg('bolt')}<span>ENCERRAR OCORRÊNCIA</span></div>
            <div class="wsms-card-body"><div class="ins-main">
            ${box(1, 'Ocorrência', `<div class="ins-grid cls-g-nr">${field({id: 'close_nr_occurrence', label: 'Nr. Ocorrência', ph: 'Ex. 20251234567', c: 1, num: 11})}
                  <div class="major-field"><label>&nbsp;</label><div class="cls-info" id="cls-info">Indique o Nr. da ocorrência</div></div></div>`)}
                  ${box(2, 'Tempos dos veículos', `<div class="cls-thead"><span>Veículo</span><span>Chegada TO</span><span>Saída TO</span><span>Chegada unidade</span><span>Kms</span><span>Bomba (h / min)</span><span>Observações</span></div>
                  <div id="vehicles-container"></div>`,
                  `<button id="add-close-vehicle-btn" class="btn wsms-btn-blue" data-act="vehicle">${svg('plus', 13).replace('<svg ', '<svg class="bi" ')}ADICIONAR</button>`)}
            <div class="ins-box cls-extra"><div class="ins-bh"><span class="ins-n">3</span>Dados adicionais</div>
            <div class="cls-tabs">${TABS.map(([sec, icon, text, cnt]) => `<button type="button" class="cls-pill" data-act="tab" data-sec="${sec}">${icon} ${text}${cnt ? ` <span data-cnt="${cnt}">(0)</span>` : ''}</button>`).join('')}</div>
            <div class="cls-panels">
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
            </div></div>
            </div></div>
            <div class="wsms-card-footer">${button('wsms-btn-send', 'phone', 'COMUNICAR CREPC', 'crepc')}</div>
          </div>`, {
          vehicle: () => CloseOCRaddVehicle(), victim: () => addVictim(), extra: () => addExtra(), damage: () => addDamage(), crepc: () => generateCloseCREPCMessage(),
          tab: b => { const el = document.querySelector(`.${b.dataset.sec}`); if (el) b.classList.toggle('on', !el.classList.toggle('hidden')); }
        });
        if (!page) return;
        $('area_m2').addEventListener('input', () => { $('area_ha').value = ((parseFloat($('area_m2').value) || 0) / 10000).toFixed(2); });
        const filled = c => [...c.querySelectorAll('input:not([type="date"]):not([type="time"]):not([type="checkbox"]), select, textarea')].some(f => f.value && f.value.trim());
        const clsCounts = () => document.querySelectorAll('#page_close_occurrence [data-cnt]').forEach(s => {
          s.textContent = `(${[...($(s.dataset.cnt)?.querySelectorAll('.wsms-card-mini') || [])].filter(filled).length})`;
        });
        ['victims-container', 'extras-container', 'damages-container'].forEach(id => { const el = $(id); if (el) new MutationObserver(clsCounts).observe(el, {childList: true, subtree: true}); });
        ['input', 'change'].forEach(ev => page.addEventListener(ev, clsCounts));
        document.addEventListener('click', e => { if (e.target.closest('#popup-success .popup-btn')) setTimeout(clsCounts, 50); }, true);
        let clsT = 0;
        $('close_nr_occurrence').addEventListener('input', () => {
          clearTimeout(clsT);
          const nr = $('close_nr_occurrence').value.trim(), info = $('cls-info');
          if (nr.length < 4) { info.textContent = 'Indique o Nr. da ocorrência'; info.classList.remove('ok'); return; }
          clsT = setTimeout(async () => {
            try {
              const r = await fetch(`${SUPABASE_URL}/rest/v1/occurrences_control?select=occorrence,local,localitie,start_date,vehicles&corp_oper_nr=eq.${corp()}&nr_oc=eq.${encodeURIComponent(nr)}&limit=1`, {headers: getSupabaseHeaders()});
              const o = r.ok ? (await r.json())[0] : null;
              if ($('close_nr_occurrence').value.trim() !== nr) return;
              if (!o) { info.textContent = 'Ocorrência não encontrada nas ocorrências em curso'; info.classList.remove('ok'); return; }
              const nv = Array.isArray(o.vehicles) ? o.vehicles.length : String(o.vehicles || '').split(',').filter(x => x.trim()).length;
              const hm = (String(o.start_date || '').split(' ')[1] || '').slice(0, 5);
              info.textContent = [o.occorrence, o.local || o.localitie, hm ? `alerta ${hm}` : '', `${nv} veículo${nv === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
              info.classList.add('ok');
            } catch (e) { console.warn('Nr. ocorrência:', e); }
          }, 400);
        });    
        function generateCloseCREPCMessage() {
          const nr = $('close_nr_occurrence')?.value?.trim();
          if (!nr) return showPopup('popup-danger', 'Por favor, preencha o Nr. de Ocorrência para poder encerrar a ocorrência.');
          const sections = ['*⛔ Encerramento de Ocorrência*', `*N. OC:* ${nr}`];
          const cards = sel => [...document.querySelectorAll(`${sel} .wsms-card-mini`)];
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
            const vobs = c.querySelector('.vehclsocr-observacoes')?.value?.trim();
            if (vobs) lines.push(`*OBS:* ${vehicle} | ${vobs}`);
            return lines.join('\n');
          }).filter(Boolean);
          if (vehicleBlocks.length) sections.push(vehicleBlocks.join('\n\n'));
          const victims = cards('#victims-container').map((c, idx) => {
            const g = k => $(`victim_${idx + 1}_${k}`)?.value?.trim();
            const [gender, age, ageUnit, nation, type, status] = ['gender', 'age', 'age_unit', 'nation', 'type', 'status'].map(g);
            if (!(gender || age || nation || type || status)) return '';
            return [gender, (ageUnit || age) ? `${ageUnit || ''} ${age || ''}`.trim() : '', nation ? `Nacion: ${nation}` : '', type, status].filter(Boolean).join(' | ');
          }).filter(Boolean);
          if (victims.length) sections.push(`*VÍTIMA(s):*\n${victims.join('\n')}`);
          const extras = cards('#extras-container').map(c => {
            const [meio, veics, elems] = [...c.querySelectorAll('input[type="text"]')].map(i => i.value.trim());
            return [meio, veics ? `Veícs.: ${veics}` : '', elems ? `Elems.: ${elems}` : ''].filter(Boolean).join(' | ');
          }).filter(Boolean);
          if (extras.length) sections.push(`*OUTROS MEIOS NO TO:*\n${extras.join('\n')}`);
          const damages = cards('#damages-container').map(c => c.querySelector('input[type="text"]')?.value?.trim()).filter(Boolean);
          if (damages.length) sections.push(`*DANOS:*\n${damages.join('\n')}`);
          const m2 = document.querySelector('.wsms-burned-card #area_m2')?.value?.trim(), ha = document.querySelector('.wsms-burned-card #area_ha')?.value?.trim();
          if (m2 || ha) sections.push(`*ÁREA ARDIDA:*\n${[m2 ? `${m2} m²` : '', ha ? `${ha} ha` : ''].filter(Boolean).join(' | ')}`);
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
          <div class="wsms-card last-card ins-card sol-card">
            <div class="wsms-card-header">${svg('clip')}<span>SOLICITAR DISPONIBILIDADES</span></div>
            <div class="wsms-card-body"><div class="ins-layout"><div class="ins-main">
              ${box(1, 'Serviço', grid('sol-g4', [{id: 'solicitation_date', label: 'Data', type: 'date'}, {id: 'solicitation_type', label: 'Tipo', tag: 'select'},
                {id: 'solicitation_motive', label: 'Motivo', tag: 'select'}, {id: 'solicitation_shift', label: 'Turno', tag: 'select'}]))}
              <div class="ins-two sol-two">
                ${box(2, 'Meios', `<div class="ins-grid sol-g2">${[['drivers', 'Motoristas'], ['elements', 'Elementos']].map(([id, l]) => `<div class="major-field"><label for="${id}">${l}</label>
                  <div class="sol-stp"><button type="button" data-step="-1" data-for="${id}">−</button><input type="text" id="${id}" class="c" placeholder="0" maxlength="2" data-num="2"><button type="button" data-step="1" data-for="${id}">+</button></div></div>`).join('')}</div>`)}
                ${box(3, 'Destino', grid('sol-g2', [{id: 'exit_hour', label: 'Hora de Saída', type: 'time'}, {id: 'uls_desteny', label: 'ULS Destino', ph: 'Ex. IPO Lisboa'}]))}
              </div>
            </div>
            <aside class="ins-sum" id="sol-sum"><div class="ins-sum-k">Pré-visualização da mensagem</div><pre class="sol-prev" id="sol-prev"></pre></aside>
            </div></div>
            <div class="wsms-card-footer">${button('wsms-btn-send', 'phone', 'SOLICITAR', 'send')}</div>
          </div>`, {send: () => send()});
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
        function solSummary() {
          const val = id => ($(id)?.disabled ? '' : $(id)?.value?.trim()) || '';
          const d = $('solicitation_date').value, dr = parseInt($('drivers').value) || 0, el = parseInt($('elements').value) || 0;
          const shift = val('solicitation_shift'), dest = val('uls_desteny'), out = val('exit_hour');
          const lines = ['📋 PEDIDO DE DISPONIBILIDADE',
            [d ? d.split('-').reverse().join('/') : '', shift ? `Turno ${shift}` : ''].filter(Boolean).join(' · '),
            [$('solicitation_type').value, val('solicitation_motive')].filter(Boolean).join(' · '),
            [dr ? `${dr} motorista${dr > 1 ? 's' : ''}` : '', el ? `${el} elemento${el > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · '),
            out || dest ? [out ? `Saída ${out}` : '', dest].filter(Boolean).join(' → ') : ''].filter(Boolean);
          $('sol-prev').textContent = lines.length > 1 ? lines.join('\n') : `${lines[0]}\nPreencha os campos…`;
        }
        page.addEventListener('click', e => {
          const b = e.target.closest('.sol-stp button');
          if (!b) return;
          const inp = $(b.dataset.for);
          inp.value = String(Math.min(99, Math.max(0, (parseInt(inp.value) || 0) + Number(b.dataset.step)))).replace(/^0$/, '');
          inp.dispatchEvent(new Event('input', {bubbles: true}));
        });
        page.addEventListener('input', solSummary);
        page.addEventListener('change', solSummary);
        document.querySelector('button[data-page="page-solicitation"]')?.addEventListener('click', () => setTimeout(solSummary, 300));
        solSummary();
      })();
      /* =======================================================================
      INDISPONIBILIDADE DE VEÍCULOS
      ======================================================================= */
      (function unavailability() {
        const NEW = [{id: 'new_vehicle_unavailable', label: 'Veículo', msg: 'Veículo', tag: 'select', w: 120}, {id: 'new_unavailability_date', label: 'Data', msg: 'Data de Início', type: 'date', w: 130},
                     {id: 'new_unavailability_hour', label: 'Hora', msg: 'Hora de Início', type: 'time', w: 90}, {id: 'new_reason_unavailability', label: 'Motivo', msg: 'Motivo', tag: 'select', w: 175},
                     {id: 'new_unavailability_local', label: 'Local', msg: 'Local', tag: 'select', w: 175}];
        const END = [{id: 'end_vehicle_unavailable', label: 'Veículo', msg: 'Veículo', w: 100, attrs: ' readonly'}, {id: 'end_reason_unavailability', label: 'Motivo', msg: 'Motivo', w: 175, attrs: ' readonly'},
                     {id: 'end_unavailability_date', label: 'Data do fim', msg: 'Data de Fim', type: 'date', w: 130}, {id: 'end_unavailability_hour', label: 'Hora do fim', msg: 'Hora de Fim', type: 'time', w: 90}];
        const page = mount('page-indisp', `
          <div class="wsms-card last-card ins-card ind-card">
            <div class="wsms-card-header">${svg('warn')}<span>INDISPONIBILIDADE DE VEÍCULOS</span></div>
            <div class="wsms-card-body"><div class="ins-main">
              ${box(1, 'Nova indisponibilidade', grid('ind-g-new', NEW) + `<div class="ind-act">${button('wsms-btn-send', 'phone', 'ENVIAR INDISPONIBILIDADE', 'new')}</div>`)}
              ${box(3, 'Fim de indisponibilidade', grid('ind-g-end', END) + `<div class="ind-act">${button('wsms-btn-green', 'phone', 'ENVIAR DISPONIBILIDADE', 'end')}</div>`, '', ' id="availability-card" hidden')}
              ${box(2, 'Veículos indisponíveis', `<div class="tbl-box"><div class="table-container"><table id="active-unavailability-table"><thead id="ind-thead"></thead><tbody id="active-unavailability-tbody"></tbody></table></div></div>`,
                    `<div class="ind-tabs"><button type="button" class="occ-pill on" data-ind="act">Ativas (0)</button><button type="button" class="occ-pill" data-ind="fin">Finalizadas</button>
                     <button type="button" class="occ-pill ind-rl" data-act="reload" title="Atualizar lista">⟳</button></div>`)}
            </div></div>
          </div>
        `,
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
        let rows = [], indView = 'act';
        const dm = (d, h) => d ? `${d.split('-').reverse().slice(0, 2).join('/')} ${esc(String(h || '').slice(0, 5))}` : '';
        const kind = m => m === 'Pausa para Alimentação' ? ['Pausa', 'pausa'] : isRetention(m) ? ['Retido', 'ret'] : ['Inoperacional', 'inop'];
        async function loadActive() {
          const tbody = $('active-unavailability-tbody');
          if (!tbody) return;
          try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?status=eq.Em%20Aberto&corp_oper_nr=eq.${corp()}`, {headers: getSupabaseHeaders()});
            rows = await resp.json();
            const tab = document.querySelector('#page-indisp [data-ind="act"]');
            if (tab) tab.textContent = `Ativas (${rows.length})`;
            if (indView !== 'act') return;
            $('ind-thead').innerHTML = '<tr><th style="width:120px">Desde</th><th>Veículo</th><th>Motivo</th><th style="width:150px">Estado</th><th style="width:120px"></th></tr>';
            tbody.innerHTML = !rows.length
              ? '<tr><td colspan="5" class="empty">Não existem veículos indisponíveis neste momento.</td></tr>'
              : rows.map((r, i) => `<tr>
                  <td>${dm(r.start_unavailability_date, r.start_unavailability_hour)}</td>
                  <td><b>${esc(r.vehicle)}</b></td><td>${esc(r.unavailability_motive)}</td><td><span class="occ-st ind-st-${kind(r.unavailability_motive)[1]}">${kind(r.unavailability_motive)[0]}</span></td>
                  <td><button class="btn btn-sm wsms-btn-green finalize-btn" data-act="fin" data-i="${i}">Finalizar</button></td></tr>`).join('');
          } catch (e) {
            console.error('Erro ao carregar indisponibilidades:', e);
          }
        }
        async function loadFinished() {
          const tbody = $('active-unavailability-tbody');
          $('ind-thead').innerHTML = '<tr><th style="width:120px">Desde</th><th>Veículo</th><th>Motivo</th><th style="width:120px">Até</th><th style="width:120px">Tempo</th></tr>';
          tbody.innerHTML = '<tr><td colspan="5" class="empty">A carregar…</td></tr>';
          try {
            const from = new Date(Date.now() - 7 * 864e5).toLocaleDateString('sv-SE');
            const r = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability_history?select=vehicle,motive,start_date,start_hour,end_date,end_hour,total_time&corp_oper_nr=eq.${corp()}&end_date=gte.${from}&order=end_date.desc,end_hour.desc&limit=30`, {headers: getSupabaseHeaders()});
            const h = r.ok ? await r.json() : [];
            if (indView !== 'fin') return;
            tbody.innerHTML = !h.length ? '<tr><td colspan="5" class="empty">Sem indisponibilidades finalizadas nos últimos 7 dias.</td></tr>'
              : h.map(x => `<tr><td>${dm(x.start_date, x.start_hour)}</td><td><b>${esc(x.vehicle)}</b></td><td>${esc(x.motive)}</td><td>${dm(x.end_date, x.end_hour)}</td><td>${esc(x.total_time || '—')}</td></tr>`).join('');
          } catch (e) {
            console.error('Erro ao carregar finalizadas:', e);
            tbody.innerHTML = '<tr><td colspan="5" class="empty err">Erro ao carregar</td></tr>';
          }
        }
        page.addEventListener('click', e => {
          const t = e.target.closest('[data-ind]');
          if (!t) return;
          indView = t.dataset.ind;
          document.querySelectorAll('#page-indisp [data-ind]').forEach(b => b.classList.toggle('on', b === t));
          if (indView === 'fin') loadFinished(); else loadActive();
        });
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
          <div class="wsms-card ins-card ems-card">
            <div class="wsms-card-header-ems">${svg('pulse')}<span>SERVIÇOS DE EMERGÊNCIA PRÉ-HOSPITALAR</span></div>
            <div class="ems-ticker"><div>⚠️ AVISO: Devido ao incidente ocorrido com o portátil iTeams, informa-se que a partir das 00:00 do dia 27 de Abril, e até resolução do mesmo, todos os serviços emanados pelo INEM, serão efetuados via VERBETE MANUAL, tendo que o OPTEL de serviço efetuar a sua digitalização e upload manual à semelhança do procedimento dos serviços de RESERVA INEM. Pedimos desculpa por qualquer constrangimento. Departamento de Informática. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></div>
            <div class="wsms-card-body">
              <div class="wsms-type-row ems-types">
                  <div class="wsms-type-opt ems-type-inem" id="opt-inem"><input type="checkbox" id="alert-inem"><i class="ems-dot ems-dot-y"></i><label for="alert-inem">INEM<small>Serviço Emergência Pré-Hospitalar</small></label></div>
                  <div class="wsms-type-opt" id="opt-reserv"><input type="checkbox" id="alert-reserv"><i class="ems-dot ems-dot-r"></i><label for="alert-reserv">Reserva INEM<small>Serviço Emergência Pré-Hospitalar - Reserva</small></label></div></div>
                  <div class="ins-grid ems-cols">
                  ${box(1, 'Alerta e local', grid('', [{id: 'alert-service', label: 'Hora Alerta', type: 'time'}], 'grid-template-columns:150px') +
                    grid('', [{id: 'address-service', label: 'Morada', ph: 'Morada da ocorrência'}], 'margin-top:10px') +
                    grid('', [{id: 'door-service', label: 'Nr. Porta', ph: 'Nº', c: 1, attrs: ' maxlength="6" autocomplete="off"'}, {id: 'floor-service', label: 'Andar', ph: 'Andar'}], 'margin-top:10px;grid-template-columns:1fr 1fr') +
                    grid('', [{id: 'location-service', label: 'Localidade', ph: 'Localidade'}], 'margin-top:10px') +
                    grid('', [{id: 'reference-address-service', label: 'Ponto de Referência', ph: 'Ponto de referência'}], 'margin-top:10px'), '', ' id="ems-b1"')}
                  ${box(2, 'Vítima', `<div class="ins-grid sol-g2">${field({id: 'victim-gender-service', label: 'Género', tag: 'select', opts: ['&nbsp;', 'Masc.', 'Fem.', 'Desc.', 'Outro']})}
                    <div class="major-field"><label for="victim-age-service">Idade</label><div class="ems-age"><input type="text" id="victim-age-service" placeholder="00" maxlength="3" data-num="3" class="c" inputmode="numeric">
                        <select id="victim-age-type-service">${options(['&nbsp;', 'Dias', 'Meses', 'Anos'])}</select></div></div></div>
                    <div class="ins-grid" style="margin-top:10px"><div class="major-field"><label for="situation-service">Situação</label><textarea id="situation-service" class="ems-sit" placeholder="Descreva a situação clínica"></textarea></div></div>
                    <div class="ins-grid" style="margin-top:10px"><div class="major-field"><label for="triage-service">Triagem CODU</label><div class="ems-triage"><select id="triage-service">${options(['', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5'])}</select><div id="triage-dots"></div><div class="ems-vmer" id="vmer-box"><span>VMER:</span><label>Sim <input type="checkbox" id="vmer-sim"></label><label>Não <input type="checkbox" id="vmer-nao"></label></div></div></div></div>`, '', ' id="ems-b2"')}
                  ${box(3, 'Operacional', grid('', [{id: 'nr-codu-service', label: 'Nr. CODU', ph: '123456789', num: 9, c: 1, attrs: ' inputmode="numeric"'},
                    {id: 'resp-tas-ni', label: 'Nr. TAS', ph: '000', num: 3, c: 1, attrs: ' inputmode="numeric"'}], 'grid-template-columns:150px 90px;justify-content:start') +
                    grid('', [{id: 'resp-tas-name', label: 'Nome TAS', attrs: ' disabled'}, {id: 'observations-service', label: 'Observações', ph: 'Observações adicionais'}], 'margin-top:10px'), '', ' id="ems-b3"')}
                    ${box(4, 'Georreferenciação', `<div id="ems-map"></div><div class="ins-map-st" id="ems-map-st"></div>`, '', ' id="ems-b4"')}
                </div>
            </div>
            <div class="wsms-card-footer">${button('wsms-btn-send', 'send', 'ENVIAR SERVIÇO', 'send')}</div>
          </div>
        `,
        {send: () => send()});
        if (!page) return;
        let map = null, pin = null, pinSrc = '', lastReq = 0, reqSeq = 0, base = null;
        const val = id => $(id)?.value?.trim() || '';
        const mapStatus = (txt, ok) => { const el = $('ems-map-st'); if (el) { el.textContent = txt; el.classList.toggle('ok', !!ok); } };
        function mapPlace(lat, lng, src, zoom) {
          if (!map) return;
          if (pin) pin.setLatLng([lat, lng]);
          else {
            pin = L.marker([lat, lng], {draggable: true}).addTo(map);
            pin.on('dragend', () => { pinSrc = 'manual'; mapStatus('Pin ajustado à mão ✔ — o link GPS vai na mensagem.', true); });
          }
          pinSrc = src;
          if (zoom) map.setView([lat, lng], zoom);
          mapStatus(src === 'manual' ? 'Pin colocado à mão ✔ — o link GPS vai na mensagem.' : 'Morada localizada ✔ — o link GPS vai na mensagem.', true);
        }
        function placeBase(zoom) {
          if (!map || !base) return;
          mapPlace(base.lat, base.lng, 'base', zoom);
          mapStatus('Pin na corporação — escreva a morada ou clique no mapa. Sem localização, a mensagem segue sem link GPS.', false);
        }
        function mapReset() {
          if (pin && map) map.removeLayer(pin);
          pin = null; pinSrc = '';
          if (map && base) return placeBase(15);
          mapStatus('Sem localização no mapa — a mensagem segue sem link GPS. Escreva a morada ou clique no mapa.', false);
        }
        const gpsLink = () => {
          if (!pin || pinSrc === 'base') return '';
          const p = pin.getLatLng();
          return `https://www.google.com/maps/dir/?api=1&destination=${p.lat.toFixed(6)},${p.lng.toFixed(6)}&travelmode=driving`;
        };
        function mapInit() {
          const el = $('ems-map');
          if (map || !el || typeof L === 'undefined') return;
          map = L.map(el).setView([39.5, -8.0], 6);
          const ruas = L.tileLayer(`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`, {attribution: '&copy; TomTom', maxZoom: 22}).addTo(map);
          const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri', maxNativeZoom: 18, maxZoom: 19});
          L.control.layers({'Mapa': ruas, 'Satélite': satelite}, null, {position: 'topright', collapsed: false}).addTo(map);
          map.on('click', e => mapPlace(e.latlng.lat, e.latlng.lng, 'manual'));
          new ResizeObserver(() => map.invalidateSize()).observe(el);
          mapReset();
          fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corp()}&select=corp_address,default_lat,default_lng&limit=1`, {
            headers: getSupabaseHeaders()
          })
          .then(r => r.ok ? r.json() : []).then(async d => {
            const row = d[0] || {};
            let p = null;
            if (row.corp_address) {
              try {
                const res = (await tomtomGeocode(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(row.corp_address)}.json?key=${TOMTOM_KEY}&language=pt-PT&countrySet=PT&limit=1`)).filter(x => x.position);
                if (res[0]) p = {lat: res[0].position.lat, lng: res[0].position.lon};
              } catch (e) { console.warn('Morada da corporação:', e); }
            }
            if (!p) {
              const lat = parseFloat(row.default_lat), lng = parseFloat(row.default_lng);
              if (isFinite(lat) && isFinite(lng)) p = {lat, lng};
            }
            if (p) { base = p; if (!pin) placeBase(15); }
          }).catch(() => {});
        }
        const kmBetween = (a, b) => {
          const r = Math.PI / 180;
          return Math.hypot((b.lng - a.lng) * Math.cos(a.lat * r) * 111.32, (b.lat - a.lat) * 110.57);
        };
        const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        const inCity = (res, city) => {
          const a = res.address || {}, c = norm(city);
          return !c || [a.city, a.town, a.village, a.hamlet, a.suburb, a.city_district, a.municipality].some(x => x && (norm(x).includes(c) || c.includes(norm(x))));
        };
        async function nominatim(params, city) {
          await new Promise(r => setTimeout(r, Math.max(0, 1100 - (Date.now() - lastReq))));
          lastReq = Date.now();
          const bias = base ? `&viewbox=${base.lng - 0.3},${base.lat + 0.3},${base.lng + 0.3},${base.lat - 0.3}` : '';
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=pt${bias}&${params}`, {headers: {'Accept-Language': 'pt-PT'}});
          const d = r.ok ? await r.json() : [];
          return d.filter(x => inCity(x, city));
        }
        let ttDownUntil = 0;
        const ttDown = () => Date.now() < ttDownUntil;
        const markTTDown = st => {
          if (st !== 403 && st !== 429) return;
          ttDownUntil = Date.now() + 30 * 60 * 1000;
          console.warn(`[geo] TomTom recusou (${st}) — a usar o Geoapify durante 30 min`);
        };
        async function tomtomGeocode(url) {
          if (ttDown()) throw new Error('TomTom indisponível (quota)');
          const r = await fetch(url);
          if (!r.ok) { markTTDown(r.status); throw new Error(`TomTom HTTP ${r.status}`); }
          return (await r.json()).results || [];
        }
        const GEOAPIFY_KEY = 'ac1b5754cd2741699e1fc82d6c795622';
        async function geoapify(kind, text, limit = 8) {
          if (!GEOAPIFY_KEY || !text) return [];
          const p = new URLSearchParams({text, apiKey: GEOAPIFY_KEY, lang: 'pt', limit: String(limit), filter: 'countrycode:pt', format: 'json'});
          if (base) p.set('bias', `proximity:${base.lng},${base.lat}`);
          try {
            const r = await fetch(`https://api.geoapify.com/v1/geocode/${kind}?${p}`);
            if (!r.ok) { console.warn('[geo] Geoapify HTTP', r.status); return []; }
            return ((await r.json()).results || []).filter(x => isFinite(x.lat) && isFinite(x.lon)).map(x => ({
              type: x.housenumber ? 'Point Address' : x.result_type === 'amenity' && x.name ? 'POI' : x.street ? 'Street' : 'Geography',
              position: {lat: x.lat, lon: x.lon},
              poi: x.result_type === 'amenity' && x.name ? {name: x.name} : undefined,
              address: {streetName: x.street || '', streetNumber: x.housenumber || '', municipality: x.county || x.city || '',
                        municipalitySubdivision: x.village || x.suburb || x.hamlet || (x.city && x.city !== x.county ? x.city : '') || x.district || '', freeformAddress: x.formatted || ''},
              src: 'geoapify'
            }));
          } catch (e) { console.warn('[geo] Geoapify:', e); return []; }
        }
        async function mapLocate(manual) {
          mapInit();
          const rawStreet = val('address-service'), door = val('door-service'), city = val('location-service');
          const street = door && !/\d+\s?[A-Za-z]?$/.test(rawStreet) ? `${rawStreet}, ${door}` : rawStreet;
          if (!street && !city) { if (manual) showPopup('popup-danger', 'Indique a morada e a localidade.'); return; }
          if (!manual && !(street && city)) return;
          const seq = ++reqSeq;
          mapStatus('A procurar a morada…', false);
          try {
            const enc = encodeURIComponent;
            const m = street.match(/^(.*?)[,\s]+(\d+\s?[A-Za-z]?)$/);
            const name = m ? m[1].trim() : street;
            const bias = base ? `&lat=${base.lat}&lon=${base.lng}${!city ? '&radius=80000' : ''}` : '';
            const key = `key=${TOMTOM_KEY}&language=pt-PT`;
            const tries = [];
            const num = m ? m[2].replace(/\s/g, '') : '';
            if (street && city) {
              const gp = `${key}&countrySet=PT&limit=10${base ? `&lat=${base.lat}&lon=${base.lng}` : ''}`;
              if (m) {
                tries.push(`https://api.tomtom.com/search/2/geocode/${enc(`${name} ${num}, ${city}`)}.json?${gp}`);
                if (baseMunicipality && norm(baseMunicipality) !== norm(city)) tries.push(`https://api.tomtom.com/search/2/geocode/${enc(`${name} ${num}, ${baseMunicipality}`)}.json?${gp}`);
                tries.push(`https://api.tomtom.com/search/2/structuredGeocode.json?${key}&countryCode=PT&streetName=${enc(name)}&streetNumber=${enc(num)}&municipality=${enc(city)}`);
                if (baseMunicipality && norm(baseMunicipality) !== norm(city))
                  tries.push(`https://api.tomtom.com/search/2/structuredGeocode.json?${key}&countryCode=PT&streetName=${enc(name)}&streetNumber=${enc(num)}&municipality=${enc(baseMunicipality)}&municipalitySubdivision=${enc(city)}`);
                tries.push(`https://api.tomtom.com/search/2/search/${enc(`${name} ${num}, ${city}`)}.json?${key}&countrySet=PT&typeahead=true&limit=50${base ? `&lat=${base.lat}&lon=${base.lng}` : ''}`);
              } else {
                tries.push(`https://api.tomtom.com/search/2/geocode/${enc(`${street}, ${city}`)}.json?${key}&countrySet=PT&limit=5${bias}`);
              }
              tries.push(`https://api.tomtom.com/search/2/structuredGeocode.json?${key}&countryCode=PT&streetName=${enc(name)}&municipality=${enc(city)}`);
            } else {
              tries.push(`https://api.tomtom.com/search/2/geocode/${enc([street, city].filter(Boolean).join(', '))}.json?${key}&countrySet=PT&limit=5${bias}`);
            }
            const ADDR_TYPES = ['Point Address', 'Address Range', 'Street', 'Cross Street'];
            const GEN = /\b(rua|r|avenida|av|travessa|tv|trav|largo|lg|estrada|est|praceta|pct|praca|pc|caminho|sitio|beco|calcada|alameda|urbanizacao|urb|bairro|quinta|azinhaga|vila|rotunda|da|de|do|das|dos|e)\b\.?/g;
            const core = t => norm(t).replace(/[.,]/g, ' ').replace(GEN, ' ').replace(/\s+/g, ' ').trim();
            const nameCore = core(name);
            const sameStreet = x => {
              if (!m) return true;
              const c = core(x.address?.streetName || '');
              if (!c || !nameCore) return false;
              return c === nameCore || c.includes(nameCore) || nameCore.includes(c) || similarity(nameCore, c) >= 0.8;
            };
            const score = x => !m ? 1 : (x.type === 'Point Address' && norm(x.address?.streetNumber) === norm(num) && sameStreet(x)) ? 3
              : (x.type === 'Address Range' && sameStreet(x)) ? 2 : sameStreet(x) ? 1 : 0;
            let d = [], errs = 0, bestHit = null, bestScore = -1;
            for (const url of tries) {
              let res = [];
              try { res = (await tomtomGeocode(url)).filter(x => x.position && (!m || ADDR_TYPES.includes(x.type))); }
              catch (e) { errs++; console.warn('Geocoding:', e); }
              if (seq !== reqSeq) return;
              for (const x of res) { const sc = score(x); if (sc > bestScore) { bestScore = sc; bestHit = x; } }
              if (bestScore >= 3 || (!m && bestHit)) break;
            }
            if (bestScore < 3 && !(bestHit && !m)) {   /* TomTom não encontrou a porta (ou sem quota) → Geoapify */
              const ga = (await geoapify('search', m ? `${name} ${num}, ${city}` : [street, city].filter(Boolean).join(', '), 5))
                .filter(x => !m || ADDR_TYPES.includes(x.type));
              if (seq !== reqSeq) return;
              for (const x of ga) { const sc = score(x); if (sc > bestScore) { bestScore = sc; bestHit = x; } }
            }
            if (bestHit && bestScore > 0) d = [bestHit];
            if (!d.length) {
              const osm = await nominatim(`q=${enc([street, city].filter(Boolean).join(', '))}`, city);
              if (seq !== reqSeq) return;
              if (osm.length) {
                d = [{
                  position: {lat: parseFloat(osm[0].lat), lon: parseFloat(osm[0].lon)},
                  type: 'Street',
                  address: {freeformAddress: osm[0].display_name}
                }];
              }
            }
            if (!d.length && errs === tries.length) throw new Error('Todas as tentativas de geocoding falharam');
            if (!d.length) {
              if (pinSrc === 'search') mapReset();
              mapStatus(`Morada não encontrada${city ? ` em ${city}` : ''} — clique no mapa para marcar o local.`, false);
              return;
            }
            const best = d[0], p = {lat: best.position.lat, lng: best.position.lon};
            mapPlace(p.lat, p.lng, 'search', 17);
            const dist = base ? kmBetween(base, p) : 0, found = best.address?.freeformAddress || '';
            const noNr = m && !(best.type === 'Point Address' || best.type === 'Address Range');
            mapStatus(dist > 80 ? `⚠️ Fica a ${Math.round(dist)} km da corporação — confirme o pin. (${found})`
              : noNr ? `⚠️ O nº ${m[2]} não foi encontrado — pin colocado na rua; arraste-o para o sítio certo. (${found})`
              : `${found} ✔ — o link GPS vai na mensagem.`, dist <= 80 && !noNr);
          } catch (e) {
            console.warn('Pesquisa de morada:', e);
            mapStatus('Não foi possível pesquisar a morada — clique no mapa para marcar o local.', false);
          }
        }
        const TOMTOM_KEY = 'V2c5G1lkxCRzwZTFVKUv3rYUmV3wviqo';
        const addrEl = $('address-service'), sug = document.createElement('div');
        sug.id = 'ems-sug'; sug.hidden = true;
        addrEl.parentElement.style.position = 'relative';
        addrEl.parentElement.appendChild(sug);
        addrEl.setAttribute('autocomplete', 'off');
        let sugT = 0, sugAbort = null, sugItems = [], sugIdx = -1, pickedKey = '', sugSeq = 0, refAuto = '', locAuto = '', doorAuto = '';
        const INST = /\b(psp|gnr|policia|camara municipal|junta de freguesia|bombeiros|capitania|tribunal|financas|seguranca social|esquadra|posto territorial|hospital|centro de saude|cruz vermelha|protecao civil|aima)\b/;
        let instAuto = null;
        const sugCache = new Map();
        const hideSug = () => { sug.hidden = true; sugIdx = -1; };
        const markSug = () => [...sug.children].forEach((el, i) => el.classList.toggle('on', i === sugIdx));
        function renderSug() {
          sug.innerHTML = sugItems.map((s, i) => `<div class="ems-sug-i" data-i="${i}"><b>${esc(s.l1)}</b><small>${esc(s.l2)}</small></div>`).join('');
          sug.hidden = !sugItems.length; sugIdx = -1;
        }
        const SUG_DEBUG = false;
        const dbg = (...a) => {
          if (SUG_DEBUG) console.log('[sug]', ...a);
        };
        const FIX_POI_ADDRESS = true;
        const pinCache = new Map();
        let baseMunicipality = null;
        const parishCache = new Map();
        let municipalityParishes = null;
        let parishesPromise = null;
        let ttNext = 0;
        const TT_GAP = 250;
        const PARISH_LS = 'cb360_parish_cache';
        const ANCHOR_LS = 'cb360_parish_anchors';
        const MAX_PARISH_CACHE = 500;
        const MAX_ANCHORS = 600;
        let knownAnchors = [];
        let anchorsDirty = false;
        try {
          Object.entries(JSON.parse(localStorage.getItem(PARISH_LS) || '{}')).forEach(([k, v]) => {
            if (v) parishCache.set(k, v);
          });
        } catch (_) {}
        try {
          const saved = JSON.parse(localStorage.getItem(ANCHOR_LS) || '[]');
          if (Array.isArray(saved)) knownAnchors = saved;
        } catch (_) {}
        const saveParishCache = () => {
          try {
            const entries = [...parishCache].filter(([, v]) => v).slice(-MAX_PARISH_CACHE);
            localStorage.setItem(PARISH_LS, JSON.stringify(Object.fromEntries(entries)));
          } catch (_) {}
        };
        const saveAnchors = () => {
          if (!anchorsDirty) return;
          anchorsDirty = false;
          try {
            localStorage.setItem(ANCHOR_LS, JSON.stringify(knownAnchors));
          } catch (_) {}
        };
        const learnAnchor = it => {
          if (!it.parish || !it.streetName) return;
          const s = norm(it.streetName);
          const exists = knownAnchors.some(a => a.s === s && a.p === it.parish && Math.hypot((a.lat - it.lat) * 111, (a.lng - it.lng) * 92) < 0.15);
          if (exists) return;
          knownAnchors.push({s, p: it.parish, lat: +it.lat.toFixed(5), lng: +it.lng.toFixed(5)});
          if (knownAnchors.length > MAX_ANCHORS) knownAnchors.shift();
          anchorsDirty = true;
        };
        const pinKey = (lat, lng) => `${lat.toFixed(5)},${lng.toFixed(5)}`;
        async function tt(url, signal) {
          for (let attempt = 0; attempt < 2; attempt++) {
            if (ttDown()) return null;
            const now = Date.now();
            const start = Math.max(now, ttNext);
            ttNext = start + TT_GAP;
            if (start > now) await new Promise(r => setTimeout(r, start - now));
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            const r = await fetch(url, signal ? {signal} : undefined);
            if (r.status === 429) {
              await new Promise(res => setTimeout(res, 800));
              continue;
            }
            if (r.status === 403) markTTDown(403);
            if (!r.ok) console.warn('[sug] TomTom failed', r.status);
            return r.ok ? r.json() : null;
          }
          console.warn('[sug] TomTom 429 persistent');
          markTTDown(429);
          return null;
        }
        function lev(a, b) {
          if (a === b) return 0;
          if (!a.length) return b.length;
          if (!b.length) return a.length;
          let prev = Array.from({length: b.length + 1}, (_, i) => i);
          for (let i = 1; i <= a.length; i++) {
            const cur = [i];
            for (let j = 1; j <= b.length; j++) {
              cur[j] = Math.min(
                prev[j] + 1,
                cur[j - 1] + 1,
                prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
              );
            }
            prev = cur;
          }
          return prev[b.length];
        }
        function similarity(queryName, name) {
          const a = norm(queryName);
          const b = norm(name);
          if (!a || !b) return 0;
          if (a === b) return 1;
          const levScore = 1 - lev(a, b) / Math.max(a.length, b.length);
          const contains = (` ${b} `).includes(` ${a} `) ? 0.95 : 0;
          const prefix = (a.length >= 3 && b.startsWith(a)) ? 0.9 + 0.05 * (a.length / b.length) : 0;
          const significant = t => t.split(/\s+/).filter(w => w.length >= 3);
          const queryTokens = significant(a);
          const nameTokens = significant(b);
          let tokenScore = 0;
          if (queryTokens.length && nameTokens.length) {
            const matches = (w, t) => w === t || (w.length >= 5 && t.length >= 5 && lev(w, t) <= 1);
            const m = queryTokens.filter(w => nameTokens.some(t => matches(w, t))).length;
            tokenScore = 0.9 * (m / queryTokens.length) * (m / nameTokens.length);
          }
          return Math.max(levScore, prefix, tokenScore, contains);
        }
        async function ensureBase() {
          if (base && isFinite(base.lat) && isFinite(base.lng)) return base;
          try {
            const r = await fetch(
              `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corp()}&select=corp_address,default_lat,default_lng&limit=1`, {
                headers: getSupabaseHeaders()
              }
            );
            const d = r.ok ? await r.json() : [];
            const row = d[0] || {};
            if (row.corp_address) {
              const res = (await tomtomGeocode(
                `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(row.corp_address)}.json?key=${TOMTOM_KEY}&language=pt-PT&countrySet=PT&limit=1`
              )).filter(x => x.position);
              if (res[0]) {
                base = {lat: res[0].position.lat, lng: res[0].position.lon};
                baseMunicipality = res[0].address?.municipality || null;
              }
            }
            if (!base) {
              const lat = parseFloat(row.default_lat);
              const lng = parseFloat(row.default_lng);
              if (isFinite(lat) && isFinite(lng)) base = {lat, lng};
            }
          } catch (_) {}
          return base;
        }
        async function ensureBaseMunicipality() {
          if (baseMunicipality) return baseMunicipality;
          const b = await ensureBase();
          if (!b) return null;
          try {
            const j = await tt(
              `https://api.tomtom.com/search/2/reverseGeocode/${b.lat.toFixed(5)},${b.lng.toFixed(5)}.json?key=${TOMTOM_KEY}&language=pt-PT`
            );
            baseMunicipality = j?.addresses?.[0]?.address?.municipality || null;
          } catch (_) {}
          return baseMunicipality;
        }
        async function getMunicipalityParishes() {
          if (Array.isArray(municipalityParishes) && municipalityParishes.length) return municipalityParishes;
          if (parishesPromise) return parishesPromise;
          parishesPromise = (async () => {
            try {
              const b = await ensureBase();
              await ensureBaseMunicipality();
              if (!b) return [];
              const municipalityNorm = norm(baseMunicipality || '');
              const lsKey = `cb360_freg_${municipalityNorm}`;
              try {
                const cached = JSON.parse(localStorage.getItem(lsKey) || 'null');
                if (Array.isArray(cached) && cached.length) {
                  municipalityParishes = cached;
                  return cached;
                }
              } catch (_) {}
              const names = new Map();
              const add = a => {
                if (!a) return;
                if (municipalityNorm && norm(a.municipality || '') !== municipalityNorm) return;
                const n = String(a.municipalitySubdivision || a.localName || '').trim();
                if (!n || n.length < 3 || /^\d{4}/.test(n) || norm(n) === municipalityNorm) return;
                names.set(norm(n), n);
              };
              const terms = ['União das Freguesias', 'Freguesia', `Freguesia ${baseMunicipality || ''}`.trim()];
              for (const t of terms) {
                const p = new URLSearchParams({key: TOMTOM_KEY, typeahead: 'true', countrySet: 'PT', language: 'pt-PT', idxSet: 'Geo', lat: String(b.lat), lon: String(b.lng), radius: '25000', limit: '30'});
                try {
                  const j = await tt(`https://api.tomtom.com/search/2/search/${encodeURIComponent(t)}.json?${p}`);
                  (j?.results || []).forEach(x => add(x.address));
                } catch (_) {}
              }
              const cosLat = Math.cos((b.lat * Math.PI) / 180) || 1;
              for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
                const rad = (deg * Math.PI) / 180;
                const lat = b.lat + (8 * Math.sin(rad)) / 110.57;
                const lng = b.lng + (8 * Math.cos(rad)) / (111.32 * cosLat);
                try {
                  const j = await tt(
                    `https://api.tomtom.com/search/2/reverseGeocode/${lat.toFixed(5)},${lng.toFixed(5)}.json?key=${TOMTOM_KEY}&language=pt-PT`
                  );
                  add(j?.addresses?.[0]?.address);
                } catch (_) {}
              }
              const parishes = [...names.values()].slice(0, 10);
              if (parishes.length) {
                municipalityParishes = parishes;
                try {
                  localStorage.setItem(lsKey, JSON.stringify(parishes));
                } catch (_) {}
              }
              return parishes;
            } catch (_) {
              return [];
            } finally {
              parishesPromise = null;
            }
          })();
          return parishesPromise;
        }
        async function getParishAt(lat, lng) {
          const k = `${lat.toFixed(4)},${lng.toFixed(4)}`;
          const isMuni = n => !n || norm(n) === norm(baseMunicipality || '');
          if (parishCache.has(k) && !isMuni(parishCache.get(k))) return parishCache.get(k);   /* ignora o que ficou guardado só com o concelho */
          const pos = `${lat.toFixed(5)},${lng.toFixed(5)}`;
          const attempt = async extra => {
            try {
              const j = await tt(
                `https://api.tomtom.com/search/2/reverseGeocode/${pos}.json?key=${TOMTOM_KEY}&language=pt-PT${extra}`
              );
              const a = j?.addresses?.[0]?.address || {};
              return a.municipalitySubdivision || a.localName || '';
            } catch (_) {
              return '';
            }
          }; 
          let name = await attempt('&entityType=MunicipalitySubdivision');
          if (isMuni(name)) name = await attempt('&radius=500');
          /* o TomTom não tem a freguesia em muitas zonas rurais (devolve só o concelho) → pergunta ao Geoapify (OpenStreetMap) */
          if (isMuni(name) && GEOAPIFY_KEY) {
            try {
              const r = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=pt&format=json&apiKey=${GEOAPIFY_KEY}`);
              const x = r.ok ? (await r.json()).results?.[0] : null;
              const g = x && (x.village || x.suburb || x.hamlet || (x.city && x.city !== x.county ? x.city : '') || x.district || '');
              if (g && !isMuni(g)) name = g;
            } catch (_) {}
          }
          if (isMuni(name)) return '';   /* não guarda falhas: na próxima pesquisa volta a tentar */
          parishCache.set(k, name);
          saveParishCache();
          return name;
        }
        async function getAddressAtPin(lat, lng) {
          const k = pinKey(lat, lng);
          if (pinCache.has(k)) return pinCache.get(k);
          let out = null;
          try {
            const j = await tt(
                    `https://api.tomtom.com/search/2/reverseGeocode/${k}.json?key=${TOMTOM_KEY}&language=pt-PT&radius=60`
            );
            const a = j?.addresses?.[0]?.address;
            if (a?.streetName) {
              out = {street: a.streetName, number: /^\d{1,4}[A-Za-z]?$/.test(a.streetNumber || '') ? a.streetNumber : '', freeform: (a.freeformAddress || '').replace(/\s*\([^)]*\)/g, '').trim(),
                     subdivision: a.municipalitySubdivision || ''};
            }
          } catch (_) {}
          pinCache.set(k, out);
          return out;
        }
        async function suggest(q) {
          dbg('call:', JSON.stringify(q));
          await ensureBase();
          await ensureBaseMunicipality();
          const city = (val('location-service') || '').trim();
          const area = city || baseMunicipality || '';
          const key = `${area}|${norm(q)}`;
          if (sugCache.has(key)) {
            sugItems = sugCache.get(key);
            return renderSug();
          }
          sugAbort?.abort();
          sugAbort = new AbortController();
          const my = ++sugSeq;
          dbg('area=', JSON.stringify(area), 'baseMunicipality=', baseMunicipality, 'base=', JSON.stringify(base));
          await new Promise(r => setTimeout(r, 250));
          if (my !== sugSeq) {
            dbg('DISCARDED in debounce (sugSeq changed: my=' + my + ', now=' + sugSeq + ')');
            return;
          }
          const areaNorm = norm(area);
          const queryStreet = q.split(',')[0].replace(/\s+\d+\s*[A-Za-z]?\s*$/, '').trim() || q;
          let failures = 0;
          const inArea = x => {
            if (!area) return true;
            const a = x.address || {};
            if (city) {
              return norm(
                [a.municipality, a.municipalitySubdivision, a.localName, a.freeformAddress].filter(Boolean).join(' ')
              ).includes(areaNorm);
            }
            return norm(a.municipality || '') === areaNorm;
          };
          const fetchTomTom = async (queryText, limit = '50', radius = null) => {
            const p = new URLSearchParams({key: TOMTOM_KEY, typeahead: 'true', countrySet: 'PT', language: 'pt-PT', limit});
            if (base) {
              p.set('lat', base.lat);
              p.set('lon', base.lng);
              if (radius) p.set('radius', radius);
            }
            const j = await tt(
              `https://api.tomtom.com/search/2/search/${encodeURIComponent(queryText)}.json?${p}`,
              sugAbort.signal
            );
            if (!j) {
              failures++;
              return [];
            }
            return j.results || [];
          };
          const fetchStreets = async (queryText, radius, limit = '100') => {
            const p = new URLSearchParams({key: TOMTOM_KEY, typeahead: 'true', countrySet: 'PT', language: 'pt-PT', limit});
            if (base) {
              p.set('lat', base.lat);
              p.set('lon', base.lng);
              if (radius) p.set('radius', radius);
            }
            const j = await tt(
              `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(queryText)}.json?${p}`,
              sugAbort.signal
            );
            if (!j) {
              failures++;
              return [];
            }
            return j.results || [];
          };
          const distKm = (lat, lng) => {
            if (!base) return 0;
            const cos = Math.cos(base.lat * Math.PI / 180);
            return Math.hypot((lat - base.lat) * 110.57, (lng - base.lng) * 111.32 * cos);
          };
          const buildL2 = it => {
            const loc = it.parish || it.city || '';
            return (loc && !norm(it.baseSub).includes(norm(loc))) ? `${it.baseSub} — ${loc}` : it.baseSub;
          };
          const applyPoiFix = (it, r) => {
            if (!r || norm(r.street) === norm(it.streetName)) return;
            dbg('POI', it.poi, '| TomTom address:', it.street, '| street at pin:', r.street, r.number);
            it.streetOriginal = it.street;
            it.streetName = r.street;
            it.streetNumber = r.number || '';
            it.street = [r.street, r.number].filter(Boolean).join(', ');
            if (r.freeform) it.baseSub = r.freeform;
            if (r.subdivision && norm(r.subdivision) !== norm(baseMunicipality || '')) {
              it.parish = r.subdivision;
              it.city = r.subdivision;
            }
            it.l2 = buildL2(it);
          };
          const applyCache = it => {
            if (!it.parish) {
              const p = parishCache.get(`${it.lat.toFixed(4)},${it.lng.toFixed(4)}`);
              if (p && norm(p) !== norm(baseMunicipality || '')) {
                it.parish = p;
                it.city = p;
                it.l2 = buildL2(it);
              }
            }
            if (FIX_POI_ADDRESS && it.poi) applyPoiFix(it, pinCache.get(pinKey(it.lat, it.lng)));
          };
          const dedupe = items => {
            const seen = new Set();
            return items.filter(it => {
              const dk = `${norm(it.l1)}|${norm(it.parish || it.city)}`;
              if (seen.has(dk)) return false;
              seen.add(dk);
              return true;
            });
          };
          const formatResults = list => {
            const validNumber = n => /^\d{1,4}[A-Za-z]?$/.test(n || '');
            const allowedTypes = ['POI', 'Point Address', 'Address Range', 'Street', 'Cross Street', 'Geography', 'Locality', 'Neighborhood'];
            const isVia = /^(rua|r\.|av|avenida|travessa|tv\.|largo|lg\.|estrada|en\s?\d|em\s?\d|caminho|sitio|sítio|urbanizacao|urbanização|praceta|pct\.|bairr)/i.test(q.trim());
            const qNorm = norm(q);
            const qWords = qNorm.split(/\s+/).filter(w => w.length >= 3);
            const parts = q.split(',');
            const qMain = parts[0].replace(/\s+\d+\s*[A-Za-z]?\s*$/, '').trim();
            const localityHint = norm(parts.slice(1).join(' '));
            const mapped = [];
            for (const x of list) {
              if (!allowedTypes.includes(x.type) || !x.position) continue;
              if (!inArea(x)) continue;
              const a = x.address || {};
              const isPoi = x.type === 'POI';
              const street = [a.streetName, validNumber(a.streetNumber) ? a.streetNumber : ''].filter(Boolean).join(', ');
              const municipality = a.municipality || '';
              const subdivision = a.municipalitySubdivision || a.localName || '';
              const locality = (!subdivision || (municipality && norm(subdivision).includes(norm(municipality))))
                ? (municipality || subdivision)
                : subdivision;
              const fallbackLabel = subdivision || a.freeformAddress || '';
              const l1 = isPoi ? (x.poi?.name || street) : (street || fallbackLabel);
              const baseSub = (a.freeformAddress || '').replace(/\s*\([^)]*\)/g, '').trim();
              const l1Norm = norm(l1);
              const l1Words = l1Norm.split(/\s+/).filter(w => w.length >= 3);
              const strongMatch = l1Norm === qNorm || (!isPoi && norm(street) === qNorm) || (l1Words.length > 0 && l1Words.every(w => qNorm.includes(w))) || (qWords.length > 0 && qWords.every(w => l1Norm.includes(w)));
              const exact = l1Norm === qNorm || (!isPoi && norm(a.streetName || '') === qNorm);
              let rank;
              if (exact) rank = 0;
              else if (strongMatch) rank = 1;
              else rank = 2;
              if (isVia && isPoi) rank = 3;
              const nameForSimilarity = isPoi ? (x.poi?.name || l1) : (a.streetName || l1);
              const it = {sim: similarity(qMain, nameForSimilarity), streetName: a.streetName || '', streetNumber: (!isPoi && validNumber(a.streetNumber)) ? a.streetNumber : '', street: street || fallbackLabel, city: locality, poi: isPoi ? (x.poi?.name || '') : '', 
                          lat: x.position.lat, lng: x.position.lon, l1, baseSub, parish: (subdivision && norm(subdivision) !== norm(municipality)) ? subdivision : '', rank, dist: distKm(x.position.lat, x.position.lon)};
              it.l2 = buildL2(it);
              applyCache(it);
              mapped.push(it);
            }
            mapped.forEach(learnAnchor);
            const anchors = [
              ...mapped.filter(i => i.parish && i.streetName),
              ...knownAnchors.map(a => ({streetName: a.s, parish: a.p, lat: a.lat, lng: a.lng}))
            ];
            for (const it of mapped) {
              if (it.parish || !it.streetName) continue;
              let nearest = null;
              let nearestDist = 1.5;
              for (const o of anchors) {
                if (norm(o.streetName) !== norm(it.streetName)) continue;
                const d = Math.hypot((o.lat - it.lat) * 111, (o.lng - it.lng) * 92);
                if (d < nearestDist) {
                  nearest = o;
                  nearestDist = d;
                }
              }
              if (nearest) {
                it.parish = nearest.parish;
                it.city = nearest.parish;
                it.l2 = buildL2(it);
              }
            }
            saveAnchors();
            let candidates = mapped;
            if (mapped.length) {
              const best = Math.max(...mapped.map(i => i.sim));
              if (best >= 0.5) candidates = mapped.filter(i => i.sim >= Math.max(0.5, best - 0.08));
            }
            if (localityHint) {
              const matching = candidates.filter(i => norm(`${i.parish} ${i.city} ${i.baseSub}`).includes(localityHint));
              if (matching.length) candidates = matching;
            }
            candidates.sort((a, b) => (Math.round(b.sim * 50) - Math.round(a.sim * 50)) || (a.rank - b.rank) || (a.dist - b.dist));
            const withParish = candidates.filter(i => i.parish);
            const filtered = candidates.filter(i => i.parish || !withParish.some(o => norm(o.l1) === norm(i.l1) && Math.hypot((o.lat - i.lat) * 111, (o.lng - i.lng) * 92) < 1.5));
            const seen = new Set();
            const out = [];
            for (const it of filtered) {
              const dk = `${norm(it.l1)}|${norm(it.parish || it.city)}|${it.lat.toFixed(2)},${it.lng.toFixed(2)}`;
              if (seen.has(dk)) continue;
              seen.add(dk);
              out.push(it);
            }
            return out.slice(0, 15);
          };
          const enrich = async items => {
            const toEnrich = items.filter(it => !it.parish && !it.poi).slice(0, 4);
            const poiItems = FIX_POI_ADDRESS ? items.filter(it => it.poi).slice(0, 3) : [];
            if (!toEnrich.length && !poiItems.length) return;
            await Promise.all([
              ...toEnrich.map(async it => {
                const p = await getParishAt(it.lat, it.lng);
                if (p && norm(p) !== norm(baseMunicipality || '')) {
                  it.parish = p;
                  it.city = p;
                  learnAnchor(it);
                }
                it.l2 = buildL2(it);
              }),
              ...poiItems.map(async it => {
                applyPoiFix(it, await getAddressAtPin(it.lat, it.lng));
              })
            ]);
            if (my !== sugSeq) return;
            saveAnchors();
            sugItems.forEach(applyCache);
            sugItems = dedupe(sugItems);
            renderSug();
            if (sugItems.length && !failures) sugCache.set(key, sugItems);
          };
          try {
            const calls = [fetchTomTom(area ? `${q}, ${area}` : q, '50', city ? null : '40000')];
            if (!city) calls.push(fetchStreets(queryStreet, '25000'));
            const settled = await Promise.allSettled(calls);
            if (my !== sugSeq) return;
            const allResults = [];
            for (const r of settled) {
              if (r.status === 'fulfilled' && Array.isArray(r.value)) allResults.push(...r.value);
            }
            sugItems = formatResults(allResults);
            dbg('phase1: received', allResults.length, '| inside area', allResults.filter(inArea).length, '| showing', sugItems.length, '| failures', failures);
            if (allResults.length) {
              dbg('sample', allResults.slice(0, 3).map(x => x.type + ' | ' + x.address?.freeformAddress + ' | muni=' + x.address?.municipality));
            }
            renderSug();
            enrich(sugItems);
            if (!city && !sugItems.length && !ttDown()) {   /* procurar por freguesia só se a 1ª pesquisa não trouxe nada */
              const parishNames = new Map();
              for (const x of allResults) {
                const a = x.address || {};
                const p = a.municipalitySubdivision || a.localName || '';
                if (p && inArea(x) && norm(p) !== norm(a.municipality || '')) parishNames.set(norm(p), p);
              }
              const parishes = await getMunicipalityParishes();
              for (const p of parishes) {
                if (!parishNames.has(norm(p))) parishNames.set(norm(p), p);
              }
              if (my !== sugSeq) return;
              const phase2 = await Promise.allSettled(
                [...parishNames.values()].slice(0, 8).map(p => fetchStreets(`${q}, ${p}`, null, '8'))
              );
              if (my !== sugSeq) return;
              for (const r of phase2) {
                if (r.status === 'fulfilled' && Array.isArray(r.value)) allResults.push(...r.value);
              }
              sugItems = formatResults(allResults);
              renderSug();
            }
            if (!sugItems.length) {   /* TomTom sem resultados ou sem quota → Geoapify */
              const ga = await geoapify('autocomplete', area ? `${q}, ${area}` : q, 10);
              if (my !== sugSeq) return;
              if (ga.length) { allResults.push(...ga); sugItems = formatResults(allResults); renderSug(); }
            }
            if (sugItems.length && !failures) sugCache.set(key, sugItems);
            enrich(sugItems);
          } catch (e) {
            if (e.name !== 'AbortError') {
              console.error('[sug] ERROR:', e);
              hideSug();
            }
          }
        }
        function pickSug(s) {
          mapInit();
          const refEl = $('reference-address-service');
          const inst = !!s.poi && INST.test(norm(s.poi));
          const nice = t => t.replace(/\b(psp|gnr|aima|cm|ctt)\b/gi, m => m.toUpperCase());
          if (refAuto && refEl.value.trim() === refAuto) refEl.value = '';
          refAuto = '';
          instAuto = null;
          if (inst) {
            const city = s.city || val('location-service');
            const name = nice(s.poi);
            addrEl.value = city && !norm(name).includes(norm(city)) ? `${name} ${city}` : name;
            instAuto = {name: addrEl.value, street: s.street || s.l2};
          } else {
            addrEl.value = (s.streetNumber && s.streetName) ? s.streetName : (s.street || s.l2 || addrEl.value);
            if (s.poi) { refEl.value = s.poi; refAuto = s.poi; }
          }
          const doorEl = $('door-service');
          if (s.streetNumber && !inst) { doorEl.value = s.streetNumber; doorAuto = s.streetNumber; }
          else if (doorAuto && doorEl.value.trim() === doorAuto) { doorEl.value = ''; doorAuto = ''; }
          locAuto = s.city || '';
          if (s.city) $('location-service').value = s.city;
          pickedKey = `${val('address-service')}|${val('location-service')}`;
          /* escolheu antes de a freguesia chegar (ficou só o concelho): procura-a e troca a Localidade, se o operador ainda não a mudou */
          if (!s.parish && !inst) {
            const was = val('location-service');
            getParishAt(s.lat, s.lng).then(p => {
              if (!p || val('location-service') !== was) return;
              $('location-service').value = p; locAuto = p;
              pickedKey = `${val('address-service')}|${p}`;
            }).catch(() => {});
          }
          hideSug();
          reqSeq++;
          mapPlace(s.lat, s.lng, 'search', 17);
          if (!s.streetNumber && val('door-service')) locateDoor();
          const dist = base ? kmBetween(base, s) : 0;
          if (dist > 40) mapStatus(`⚠️ Fica a ${Math.round(dist)} km da corporação — confirme o pin.`, false);
        }
        addrEl.addEventListener('input', e => {
          if (pickedKey && e.inputType?.startsWith('delete')) {
            const locEl = $('location-service');
            if (locAuto && locEl.value.trim() === locAuto) locEl.value = '';
            $('door-service').value = '';
            $('floor-service').value = '';
            locAuto = ''; doorAuto = ''; pickedKey = '';
          }
          clearTimeout(sugT);
          const q = addrEl.value.trim();
          if (!q) {
            const refEl = $('reference-address-service');
            if (refAuto && refEl.value.trim() === refAuto) refEl.value = '';
            refAuto = '';
            instAuto = null;
            $('door-service').value = '';
            $('floor-service').value = '';
          }
          if (q.length < 5) return hideSug();
          sugT = setTimeout(() => suggest(q).catch(() => hideSug()), 450);
        });
        addrEl.addEventListener('keydown', e => {
          if (sug.hidden) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + sugItems.length) % sugItems.length;
            markSug();
          } else if (e.key === 'Enter' && sugIdx >= 0) {e.preventDefault(); pickSug(sugItems[sugIdx]);}
          else if (e.key === 'Escape') hideSug();
        });
        sug.addEventListener('mousedown', e => {
            const it = e.target.closest('.ems-sug-i');
            if (it) {e.preventDefault(); pickSug(sugItems[+it.dataset.i]);}
          });
        addrEl.addEventListener('blur', () => setTimeout(hideSug, 150));
        ['address-service', 'location-service'].forEach(id => $(id).addEventListener('change', () => {
          if (`${val('address-service')}|${val('location-service')}` === pickedKey) return;
          mapLocate(false);
        }));
        
        let doorT = 0;
        const locateDoor = () => {
          clearTimeout(doorT);
          if (!val('address-service') || !val('location-service')) return;
          doorT = setTimeout(() => mapLocate(false), 600);
        };
        $('door-service').addEventListener('input', locateDoor);
        $('door-service').addEventListener('change', () => {
          clearTimeout(doorT);
          if (val('address-service') && val('location-service')) mapLocate(false);
        });
      document.querySelector('button[data-page="page-inem-services"]')?.addEventListener('click', () => setTimeout(() => {
        if (!map) return mapInit();
          map.invalidateSize();
          mapReset();
        }, 300));
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
          </div>
        `;
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
          c.querySelector('.wsms-card-header-ems span').textContent = reserv.checked ? 'SERVIÇOS DE EMERGÊNCIA PRÉ-HOSPITALAR · RESERVA' : inem.checked ? 'SERVIÇOS DE EMERGÊNCIA PRÉ-HOSPITALAR · INEM' : 'SERVIÇOS DE EMERGÊNCIA PRÉ-HOSPITALAR';
        }
        inem.addEventListener('change', () => { if (inem.checked) { reserv.checked = false; selectedType = ''; openTypePopup(); } updateTypeSelection(); });
        reserv.addEventListener('change', () => { if (reserv.checked) { inem.checked = false; selectedType = ''; setNow(); } updateTypeSelection(); });
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
        const TRIAGE_BALLS = {P0: '⚫', P1: '🔴', P2: '🟠🟡', P3: '🟡🟢🔵', P4: '🟢🔵', P5: '⚪'};
        const triageText = t => t ? `*PRIORIDADE ${t.replace(/^P/, '')}* ${TRIAGE_BALLS[t] || ''}`.trim() : '';
        const TRIAGE_CSS = {P0: ['#000'], P1: ['#e53935'], P2: ['#fb8c00', '#fdd835'], P3: ['#fdd835', '#43a047', '#1e88e5'], P4: ['#43a047', '#1e88e5'], P5: ['#d0d0d0']};
        const triageSel = $('triage-service'), triageDots = $('triage-dots');
        const showDots = () => { triageDots.innerHTML = (TRIAGE_CSS[triageSel.value] || []).map(c => `<i style="background:${c}"></i>`).join(''); };
        const vmerBox = $('vmer-box'), vmerSim = $('vmer-sim'), vmerNao = $('vmer-nao');
        const showVmer = () => {
          const p1 = triageSel.value === 'P1';
          vmerBox.style.display = p1 ? 'flex' : 'none';
          if (!p1) vmerSim.checked = vmerNao.checked = false;
        };
        vmerSim.addEventListener('change', () => { if (vmerSim.checked) vmerNao.checked = false; });
        vmerNao.addEventListener('change', () => { if (vmerNao.checked) vmerSim.checked = false; });
        triageSel.addEventListener('change', () => { showDots(); showVmer(); });       
        async function send() {
          const miss = [...(!inem.checked && !reserv.checked ? ['Tipo de Serviço (INEM ou Reserva)'] : []), ...REQ.filter(([id]) => !$(id)?.value?.trim()).map(([, l]) => l)];
          if (miss.length) return showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br><ul style="margin:0;padding:0;">${miss.map(f => `<li style="list-style:none;">• ${f}</li>`).join('')}</ul>`);
          if (inem.checked && !selectedType) return openTypePopup();
          const g = id => $(id)?.value?.trim() || '';
          const hourAlert = $('alert-service').value || '', address = g('address-service'), floor = g('floor-service'), locality = g('location-service'), ref = g('reference-address-service');
          const door = g('door-service');
          const streetFull = door && !/\d+\s?[A-Za-z]?$/.test(address) ? `${address}, ${door}` : address;
          const fullAddress = [streetFull, floor].filter(Boolean).join(', ');
          const realAddr = instAuto && address === instAuto.name ? instAuto.street : streetFull;
          const gender = $('victim-gender-service').value || '', age = g('victim-age-service'), ageType = $('victim-age-type-service').value || '';
          const situation = g('situation-service'), nrCODU = g('nr-codu-service'), tasName = g('resp-tas-name'), obs = g('observations-service');
          const triage = g('triage-service');
          let message = `${reserv.checked ? '*🚨⚠️ SERVIÇO INEM-Reserva ⚠️🚨*' : '*🚨⚠️ SERVIÇO INEM ⚠️🚨*'}\n\n`;
          if (nrCODU) message += `*Nr. CODU:* ${nrCODU}\n`;
          if (hourAlert) message += `*Hora Alerta:* ${hourAlert}\n`;
          if (fullAddress || locality) message += `*Local:* ${fullAddress}${fullAddress && locality ? ' - ' : ''}${locality}\n`;
          if (ref) message += `*Ponto Ref.:* ${ref}\n`;
          if (gender || age) message += `*Vítima:* ${gender}${age ? `, ${age} ${ageType}` : ''}\n`;
          if (situation) message += `*Situação:* ${situation}\n\n`;
          if (triage) message += `*Triagem CODU:* ${triageText(triage)}\n`;
          const vmerTxt = vmerSim.checked ? 'VMER a caminho/no local' : vmerNao.checked ? 'VMER Indisponível' : '';
          const obsFull = [vmerTxt, obs].filter(Boolean).join(' - ');
          if (obsFull) message += `*Observações:* ${obsFull}\n\n`;
          const gps = gpsLink();
          if (gps) message += `*Localização GPS:* ${gps}`;
          const now = new Date();
          try {
            await navigator.clipboard.writeText(message);
            showPopup('popup-success', 'Mensagem criada e copiada!');
            const record = {corp_oper_nr: corp(), nr_codu: nrCODU || null, alert_date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, alert_hour: hourAlert || null,
                            victim_type: ({'Masc.': 'Masculino', 'Fem.': 'Feminino', 'Desc.': 'Desconhecido'})[gender] || gender || null, victim_age_type: age || null, victim_age_unit: ageType || null,
                            victim_address: realAddr || null, victim_location: locality || null, service_type: selectedType || (inem.checked ? 'ITeams' : 'Verbete'), tas: tasName || null};
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
          showDots();
          showVmer();
          mapReset();
          pickedKey = '';
          selectedType = '';
          radios().forEach(r => { r.checked = false; });
          inem.checked = false;
          reserv.checked = false;
          updateTypeSelection();
        }
      })();
      /* =======================================================================
      AVISOS METEO (IPMA)
      ======================================================================= */
      (function weatherWarnings() {
        const TYPES = ['Agitação Marítima', 'Vento', 'Precipitação', 'Trovoada', 'Tempo quente / frio', 'Nevoeiro'];
        const group = t => /^tempo (quente|frio)$/i.test(t || '') ? 'Tempo quente / frio' : t;
        const DAYS = [['0', 'Hoje'], ['1', 'Amanhã'], ['2', 'Depois de amanhã']];
        const page = mount('page-weather-warnings', `
          <div class="wsms-card last-major-card ins-card met-card">
            <div class="wsms-card-header">${svg('cloud')}<span id="met-title">AVISOS METEOROLÓGICOS · IPMA</span></div>
            <div class="wsms-card-body">
              <div class="met-bar"><div class="met-days">${DAYS.map(([d, t]) => `<button type="button" class="occ-pill${d === '0' ? ' on' : ''}" data-day="${d}">${t}</button>`).join('')}</div>
                <span class="met-upd" id="met-upd"></span></div>
              <div id="ipma-alerts"></div>
            </div>
          </div>
        `);
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
        let fetchOk = true;
        async function fetchWarnings() {
          try {
            const a = await getArea();
            if (!a) { console.warn('Área de avisos IPMA não configurada (Centro de Dados → Corporação).'); return []; }
            const r = await fetch('https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json');
            if (!r.ok) throw new Error(`IPMA HTTP ${r.status}`);
            fetchOk = true;
            return (await r.json()).filter(x => x.idAreaAviso === a && x.awarenessLevelID !== 'green');
          } catch (err) {
            console.error('Erro ao buscar avisos IPMA:', err);
            fetchOk = false;
            return [];
          }
        }
        const LEVEL = {yellow: ['Amarelo', 'met-yellow', 1], orange: ['Laranja', 'met-orange', 2], red: ['Vermelho', 'met-red', 3]};
        const dm = v => { const d = new Date(v); return isNaN(d) ? '' : `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
        let list = [], day = 0;
        function forDay() {
          const now = new Date(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day), d1 = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1);
          return list.map((w, i) => ({w, i})).filter(({w}) => new Date(w.endTime) > now && new Date(w.startTime) < d1 && new Date(w.endTime) > d0);
        }
        function render() {
          const box = $('ipma-alerts');
          if (!area) { box.innerHTML = `<div class="met-c met-none met-wide"><b>Área IPMA não configurada</b><small>Centro de Dados → Corporação → Área de Avisos IPMA.</small></div>`; return; }
          const act = forDay();
          const types = [...new Set([...TYPES, ...act.map(x => group(x.w.awarenessTypeName))])];
          const cards = types.map(t => {
            const ws = act.filter(x => group(x.w.awarenessTypeName) === t).sort((a, b) => (LEVEL[b.w.awarenessLevelID]?.[2] || 0) - (LEVEL[a.w.awarenessLevelID]?.[2] || 0) || new Date(a.w.startTime) - new Date(b.w.startTime));
            if (!ws.length) return {lvl: 0, html: `<div class="met-c met-none"><b>${esc(t)}</b><small>Sem aviso</small></div>`};
            return {lvl: Math.max(...ws.map(x => LEVEL[x.w.awarenessLevelID]?.[2] || 0)), html: ws.map(({w, i}) => {
              const [nome, cls] = LEVEL[w.awarenessLevelID] || ['', 'met-none'];
              return `<div class="met-c ${cls}" data-i="${i}" data-end-time="${esc(w.endTime)}"><b>⚠️ ${nome} · ${esc(w.awarenessTypeName)}</b><small>${dm(w.startTime)} → ${dm(w.endTime)}</small>
                        ${w.text ? `<p title="${esc(w.text)}">${esc(w.text)}</p>` : ''}<button type="button">Emitir aviso</button></div>`;
            }).join('')};
          });
          box.innerHTML = cards.sort((a, b) => b.lvl - a.lvl).map(c => c.html).join('');
        }
        async function update() {
          list = (await fetchWarnings()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          $('met-title').textContent = `AVISOS METEOROLÓGICOS · IPMA · ${area ? zoneName().toUpperCase() : 'SEM ÁREA'}`;
          const n = new Date();
          $('met-upd').textContent = fetchOk ? `Atualizado às ${pad(n.getHours())}:${pad(n.getMinutes())} · fonte IPMA` : 'Não foi possível ler o IPMA · tenta de novo daqui a 10 min';
          render();
        }
        page.addEventListener('click', e => {
          const p = e.target.closest('[data-day]');
          if (p) { day = +p.dataset.day; page.querySelectorAll('[data-day]').forEach(b => b.classList.toggle('on', b === p)); return render(); }
          const c = e.target.closest('.met-c[data-i] > button') && e.target.closest('.met-c');
          if (c) issueNotice(list[+c.dataset.i]);
        });
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
        setInterval(() => {
          const now = new Date();
          if ([...document.querySelectorAll('#ipma-alerts .met-c[data-end-time]')].some(c => new Date(c.dataset.endTime) <= now)) render();
        }, 60 * 1000);
        update();
        setInterval(update, 10 * 60 * 1000);
      })();
      document.addEventListener('input', e => {
        const t = e.target;
        if (!t.closest?.('.wsms-pg')) return;
        if (t.dataset.num) t.value = t.value.replace(/[^0-9]/g, '').slice(0, +t.dataset.num);
        else if ('dec' in t.dataset) t.value = t.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6);
      }, true);
    })();
    /* =======================================================================
     ASSINATURA
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
