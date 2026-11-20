    /* =======================================================================
    VERBETES INEM · CONSULTA SAÍDAS INEM | INEM-RESERVA
    ======================================================================= */
    (function () {
    const BUCKET = 'inem-verbetes';
    const API = 'https://cb360-online.vercel.app/api/inem-entries';
    const INEM_LOGO = `${SUPABASE_URL}/storage/v1/object/public/cb_logos/INEM_logo.png`;
    const ITEAMS_LOGO = `${SUPABASE_URL}/storage/v1/object/public/cb_logos/ITEAMS.png`;
    const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const UR_TYPES = ['Pausa para Alimentação', 'Falta de Macas', 'Aguarda Triagem', 'Avaria', 'Falta de Tripulação', 'Outro', 'Limpeza'];
    const COLUMNS = [{key: 'nr_codu', label: 'Nr. CODU', w: 60}, {key: 'alerta', label: 'Alerta', w: 80}, {key: 'vitima', label: 'Vítima', w: 100}, {key: 'morada', label: 'Morada', w: 200},
                     {key: 'edit', label: 'Editar', w: 36}, {key: 'tas', label: 'TAS', w: 120, red: true}, {key: 'via', label: 'Via', w: 60, red: true},
                     {key: 'actions', label: 'Verbete', w: 90, red: true}, {key: 'pdfstatus', label: 'Status', w: 50, red: true}];
    const ST = {rows: [], readOnly: false, roKey: null};
    const $ = id => document.getElementById(id);
    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
    const pad = n => String(n).padStart(2, '0');
    const corp = () => sessionStorage.getItem('currentCorpOperNr');
    const fmtDate = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; };
    const fileExt = type => type === 'ITeams' ? 'html' : 'pdf';
    const fileOf = (nr, type) => `ocr_${nr}.${fileExt(type)}`;
    const storeHdr = (extra = {}) => { const h = {...getSupabaseHeaders(), ...extra}; if (!extra['Content-Type']) delete h['Content-Type']; return h; };
    const fileUrl = name => `${SUPABASE_URL}/storage/v1/object/authenticated/${BUCKET}/${encodeURIComponent(name)}`;
    const objUrl = name => `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`;
    const TOTALS0 = '<span>TOTAL: 0</span> &nbsp;|&nbsp; <span>ITeams: 0</span> &nbsp;|&nbsp; <span>Verbete: 0</span>';
    function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
    /* ----------------------------- Font Awesome ----------------------------- */
    function ensureFA() {
      if ($('inem-fa-css')) return;
      if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => /font-?awesome/i.test(l.href))) return;
      document.head.appendChild(Object.assign(document.createElement('link'), {id: 'inem-fa-css', rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'}));
    }  
    /* ----------------------------- estilos ----------------------------- */
    const UR_TABLE_CSS = `
      .inem-ur-table {width: 100%; border-collapse: collapse; font-size: 12px; color: #333; table-layout: fixed;}
      .inem-ur-table th, .inem-ur-table td {padding: 8px; border: 1px solid #ddd; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
      .inem-ur-table thead tr {background: #f0f0f0; border-bottom: 2px solid #ccc;}
      .inem-ur-table td.v {font-weight: 600; color: #2b6ecb;}
      .inem-ur-table td.t {font-weight: 600; text-align: right;}
      .inem-ur-table td.m {text-align: left;}
      .inem-ur-table tr.tot {background: #f9f9f9; border-top: 2px solid #ccc;}
      .inem-ur-table tr.tot td {font-weight: bold; text-align: right;}
      .inem-ur-table tr.tot td.sum {color: #d9534f;}`;
    (function css() {
      if ($('inem-css')) return;
      const st = document.createElement('style');
      st.id = 'inem-css';
      st.textContent = `
        /* página */
        #inem-entries .inem-filter {display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-family: 'Segoe UI', sans-serif; gap: 10px;}
        #inem-entries .inem-filter > div {display: flex; align-items: center; flex: 1;}
        #inem-entries .inem-f-codu {gap: 6px;}
        #inem-entries .inem-f-dates {gap: 8px; justify-content: center;}
        #inem-entries .inem-filter label {font-weight: bold; font-size: 13px;}
        #inem-entries .inem-filter input {padding: 5px 8px; border-radius: 6px; border: 1px solid #c8c8c8; font-size: 13px; height: 32px; box-sizing: border-box;}
        #inem-entries .inem-filter input[type=date] {cursor: pointer;}
        #inem-entries .inem-filter #inem-filter-codu {width: 100px;}
        #inem-entries .inem-search {height: 32px; padding: 0 16px; border-radius: 6px; border: none; background: #c0392b; color: #fff; font-weight: bold; cursor: pointer; font-size: 12.5px;}
        #inem-entries .inem-search:hover {background: #a93226;}
        #inem-entries .inem-wrap {overflow: auto; width: 100%; max-height: 500px; scrollbar-width: none; border-radius: 10px; border: 1px solid #e3e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); background: #fff;}
        #inem-entries .inem-wrap::-webkit-scrollbar {display: none;}
        #inem-entries table {width: 100%; border-collapse: separate; border-spacing: 0; font-family: 'Segoe UI', sans-serif; font-size: 13px;}
        #inem-entries th {background: #f1f3f5; color: #5b6670; text-align: center; padding: 9px 6px; font-weight: 800; position: sticky; top: 0; z-index: 2; white-space: nowrap; font-size: 11px;
                          text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid #dfe3e8; border-left: 1px solid #e3e7eb;}   /* cabeçalho claro, como as outras tabelas */
        #inem-entries th.red {background: #fdecea; color: #b71c1c; border-bottom-color: #f5c6c2; border-left-color: #f5c6c2;}
        #inem-entries th:first-child {border-left: none; border-top-left-radius: 8px;}
        #inem-entries th:last-child {border-top-right-radius: 8px;}
        #inem-entries tbody tr:nth-child(even) {background: #f5f6fa;}
        #inem-entries tbody tr:nth-child(odd) {background: #fff;}
        #inem-entries td {border-bottom: 1px solid #eef0f2; border-left: 1px solid #eef0f2; padding: 2px 6px; height: 24px; vertical-align: middle; text-align: center; font-size: 13px; font-weight: bold; user-select: text;}
        #inem-entries td:first-child {border-left: none;}
        #inem-entries td.nosel {user-select: none;}
        #inem-entries .inem-acts {display: flex; gap: 3px; justify-content: center; align-items: center;}
        #inem-entries .inem-acts button {border: none; border-radius: 4px; width: 24px; height: 22px; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; justify-content: center;
                                         padding: 0; transition: opacity .15s; color: #fff;}
        #inem-entries .inem-acts button:hover {opacity: .8;}
        #inem-entries .inem-acts button:disabled {opacity: .3; cursor: not-allowed; pointer-events: none;}
        #inem-entries .btn-inem-upload {background: #c0392b;}
        #inem-entries .btn-inem-download {background: #27ae60;}
        #inem-entries .btn-inem-view {background: #2980b9;}
        #inem-entries .btn-inem-delete {background: #444;}
        #inem-entries .inem-edit {border: none; background: transparent; cursor: pointer; font-size: 14px; padding: 0; line-height: 1; color: #131a69;}
        #inem-entries td.inem-st {font-size: 17px;}
        #inem-entries .inem-foot {display: flex; justify-content: space-between; align-items: center; margin-top: 12px;}
        #inem-entries #inem-totals {font-size: 12px; font-family: 'Segoe UI', sans-serif; color: #888; line-height: 1.6; font-weight: 600;}
        #inem-entries .inem-foot-btns {display: flex; gap: 8px;}
        #inem-entries .inem-foot-btns button {color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s;}
        #inem-entries .inem-foot-btns button:disabled {opacity: .3; cursor: not-allowed;}
        #btn-inem-indisp-report {background: #9a1515;}
        #btn-inem-indisp-report:hover:not(:disabled) {background: #7b0000;}
        #btn-inem-emitir-xlsx {background: #059669;}
        #btn-inem-emitir-xlsx:hover:not(:disabled) {opacity: .9;}
        #btn-inem-emitir {background: #1e293b;}
        #btn-inem-emitir:hover:not(:disabled) {background: #334155;}
        @keyframes inemFadeIn {from {opacity: 0;} to {opacity: 1;}}
        @keyframes inemSlideUp {from {opacity: 0; transform: translateY(28px) scale(0.96);} to {opacity: 1; transform: translateY(0) scale(1);}}
        @keyframes inemSpin {to {transform: rotate(360deg);}}
        .inem-ov {position: fixed; inset: 0; background: rgba(10,8,8,0.78); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);}
        .inem-dlg {background: #fff; border-radius: 12px; width: 420px; box-shadow: 0 28px 72px rgba(0,0,0,0.45); display: flex; flex-direction: column; overflow: hidden; font-family: 'Segoe UI', sans-serif;}
        .inem-dlg.sm {width: 360px;}
        .inem-dlg-head {background: linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
                        color: #fff; font-weight: 700; font-size: 13px;}
        .inem-dlg-x {border: 1px solid rgba(255,80,80,0.22); background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); width: 28px; height: 28px; border-radius: 7px; cursor: pointer; font-size: 14px;}
        .inem-dlg-body {padding: 18px 20px; display: flex; flex-direction: column; gap: 12px;}
        .inem-dlg.sm .inem-dlg-body {padding: 20px; gap: 8px; font-size: 13px; color: #333;}
        .inem-dlg-file {font-weight: 700; color: #7b0000; background: #fff5f5; padding: 6px 10px; border-radius: 6px; border: 1px solid #fecaca;}
        .inem-row {display: flex; gap: 10px; align-items: flex-end;}
        .inem-row.top {align-items: stretch;}
        .inem-fld {display: flex; flex-direction: column; gap: 4px; flex: 1;}
        .inem-fld.w15 {flex: 1.5;}
        .inem-fld.w2 {flex: 2;}
        .inem-fld label {font-size: 11.5px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: .4px; min-height: 1.2em;}
        .inem-fld input, .inem-fld select {padding: 7px 10px; border-radius: 6px; border: 1px solid #ddd; font-size: 13px; outline: none; transition: border-color .15s; color: #1a1a1a; background: #fff;
                                           width: 100%; box-sizing: border-box;}
        .inem-fld input:focus, .inem-fld select:focus {border-color: #7b0000;}
        .inem-fld input:disabled {border-color: #eee; color: #666; background: #f5f5f5; cursor: not-allowed;}
        .inem-fld select.short {max-width: 150px;}
        .inem-dlg-foot {padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #eee; background: #fafafa;}
        .inem-dlg-foot button {padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;}
        .inem-dlg-foot .no {border: 1px solid #ddd; background: #fff; color: #555;}
        .inem-dlg-foot .yes {border: none; background: linear-gradient(135deg, #7b0000, #9a0f0f); color: #fff;}
  
        #inem-pdf-modal {z-index: 9999; animation: inemFadeIn .22s ease;}
        #inem-pdf-modal .inem-box {background: #f8f8f8; border-radius: 14px; width: 82vw; height: 90vh; display: flex; flex-direction: column; overflow: hidden;
                                   box-shadow: 0 28px 72px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.18); animation: inemSlideUp .28s cubic-bezier(.22,.68,0,1.2);}
        #inem-pdf-modal .inem-box.fs {width: 100vw; height: 100vh; border-radius: 0;}
        #inem-pdf-modal.closing {animation: inemFadeIn .18s ease reverse forwards;}
        #inem-pdf-modal.closing .inem-box {animation: inemSlideUp .18s ease reverse forwards;}
        .inem-header {background: linear-gradient(135deg, #5a0000 0%, #7b0000 45%, #9a0f0f 100%); padding: 11px 14px; display: flex; align-items: center; justify-content: space-between;
                      gap: 10px; flex-shrink: 0; border-bottom: 1px solid rgba(0,0,0,0.2); position: relative;}
        .inem-header::before {content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%); pointer-events: none;}
        .inem-header > div {position: relative; z-index: 1; display: flex; align-items: center;}
        .inem-hl {gap: 10px; flex: 1; min-width: 0;}
        .inem-hr {gap: 5px;}
        .inem-tw {min-width: 0;}
        .inem-trow {display: flex; align-items: center; gap: 7px; margin-bottom: 2px;}
        .inem-btn {border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); width: 30px; height: 30px; border-radius: 7px; cursor: pointer;
                   font-size: 14px; display: inline-flex; align-items: center; justify-content: center; transition: background .15s, border-color .15s, transform .1s;}
        .inem-btn:hover {background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.25); color: #fff;}
        .inem-btn:active {transform: scale(.91);}
        .inem-btn.inem-close-btn {border-color: rgba(255,80,80,0.22); font-size: 15px;}
        .inem-btn.inem-close-btn:hover {background: rgba(180,0,0,0.4); border-color: rgba(255,80,80,0.5);}
        .inem-print-btn {border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.92); padding: 6px 14px; border-radius: 7px; cursor: pointer;
                         font-size: 12.5px; font-weight: 600; font-family: 'Segoe UI', sans-serif; letter-spacing: .3px; display: inline-flex; align-items: center; gap: 6px;
                         transition: background .15s, border-color .15s, transform .1s; position: relative; z-index: 1;}
        .inem-print-btn:hover {background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.38);}
        .inem-print-btn:active {transform: scale(.96);}
        .inem-footer {background: linear-gradient(135deg, #5a0000 0%, #7b0000 100%); padding: 9px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
                      flex-shrink: 0; border-top: 1px solid rgba(0,0,0,0.15); position: relative;}
        .inem-footer::before {content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%); pointer-events: none;}
        .inem-footer-info {color: rgba(255,255,255,0.38); font-size: 10.5px; font-family: 'Segoe UI', sans-serif; letter-spacing: .2px; position: relative; z-index: 1;}
        .inem-logo-box {width: 34px; height: 34px; border-radius: 6px; overflow: hidden; flex-shrink: 0;}
        .inem-logo-box img {width: 100%; height: 100%; object-fit: cover;}
        .inem-logo-iteams {height: 22px; flex-shrink: 0; opacity: .85;}
        .inem-logo-iteams img {height: 100%; width: auto; object-fit: contain; filter: brightness(0) invert(1);}
        .inem-sep {width: 1px; height: 28px; background: rgba(255,255,255,0.18); flex-shrink: 0;}
        .inem-title-main {color: #fff; font-weight: 700; font-size: 13px; font-family: 'Segoe UI', sans-serif; letter-spacing: .1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
        .inem-title-sub {color: rgba(255,255,255,0.42); font-size: 10.5px; font-family: 'Segoe UI', sans-serif; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
        .inem-badge {background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700;
                     font-family: 'Segoe UI', sans-serif; color: rgba(255,255,255,0.85); letter-spacing: .7px; text-transform: uppercase; flex-shrink: 0;}
        .inem-content {flex: 1; position: relative; overflow: hidden; background: #fff;}
        .inem-loading {position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: #fff; z-index: 2;
                       color: #9ca3af; font-size: 12.5px; font-family: 'Segoe UI', sans-serif;}
        .inem-loading[hidden] {display: none;}
        .inem-loading .ico {font-size: 48px; opacity: .4; color: #6b7280;}
        .inem-loading .msg {color: #6b7280; font-size: 15px; font-weight: 600;}
        .inem-spinner {width: 36px; height: 36px; border: 3px solid #f0e8e8; border-top-color: #8b0000; border-radius: 50%; animation: inemSpin .75s linear infinite;}
        .inem-content iframe {position: absolute; inset: 0; width: 100%; height: 100%; border: none; opacity: 0; transition: opacity .3s;}
        .inem-content iframe.on {opacity: 1;}
        .inem-ur-ov {position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 9999;}
        .inem-ur {background: #fff; border: 1px solid #ccc; border-radius: 6px; width: 420px; max-width: 90%; box-shadow: 0 4px 15px rgba(0,0,0,0.2); overflow: hidden;}
        .inem-ur.big {width: 750px;}
        .inem-ur-head {background: #d9534f; color: #fff; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600;}
        .inem-ur-head .x {font-weight: bold; cursor: pointer;}
        .inem-ur-months {padding: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;}
        .inem-ur-months button {background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; padding: 12px 10px; font-size: 12.5px; font-weight: 600; color: #333; cursor: pointer; text-align: center;}
        .inem-ur-months button:hover {background: #f0f6ff; border-color: #2b6ecb; color: #2b6ecb;}
        .inem-ur-months i {color: #2b6ecb; display: block; font-size: 16px; margin-bottom: 4px;}
        .inem-ur-filters {background: #f9f2f2; padding: 12px 20px; border-bottom: 1px solid #ebccd1; display: flex; gap: 15px; align-items: center; font-size: 12px;}
        .inem-ur-filters div {display: flex; align-items: center; gap: 6px;}
        .inem-ur-filters label {font-weight: 600; color: #a94442;}
        .inem-ur-filters select {padding: 5px 8px; border: 1px solid #ebccd1; border-radius: 4px; font-size: 12px; background: #fff; transition: all 0.2s;}
        .inem-ur-filters select:focus {border-color: #d9534f; outline: none; box-shadow: 0 0 5px rgba(217,83,79,0.4);}
        .inem-ur-content {padding: 20px; background: #fff; min-height: 200px; max-height: 380px; overflow-y: auto;}
        .inem-ur-msg {text-align: center; color: #666; padding: 30px 0;}
        .inem-ur-msg.err {color: #d9534f;}
        .inem-ur-msg.load {padding: 40px 0;}
        .inem-ur-msg.load i {font-size: 24px; color: #2b6ecb; margin-bottom: 10px;}
        .inem-ur-foot {background: #e5e5e5; padding: 10px 20px; border-top: 1px solid #ccc; display: flex; justify-content: flex-end; align-items: center; gap: 10px;}
        .inem-ur-foot.split {justify-content: space-between;}
        .inem-ur-foot div {display: flex; gap: 10px;}
        .inem-ur-foot button {color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; background: #2b6ecb;}
        .inem-ur-foot button.close {background: #f0ad4e;}
        ${UR_TABLE_CSS}
      `;
      document.head.appendChild(st);
    })();  
    /* ----------------------------- utilizador iTeams ----------------------------- */
    async function isRestricted() {
      const key = `${corp()}_${sessionStorage.getItem('currentNInt')}`;
      if (ST.roKey === key) return ST.readOnly;
      let value = false;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp()}&n_int=eq.${sessionStorage.getItem('currentNInt')}&select=abv_name&limit=1`, {headers: getSupabaseHeaders()});
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        value = String(rows?.[0]?.abv_name || '').trim().toLowerCase() === 'iteams';
      } catch (err) {
        console.warn('Não foi possível verificar o tipo de utilizador INEM:', err);
      }
      ST.roKey = key; ST.readOnly = value;
      return value;
    }  
    /* ----------------------------- página ----------------------------- */
    function render() {
      ensureFA();
      const page = $('inem-entries');
      if (!page) return;
      const today = new Date().toLocaleDateString('sv-SE');
      page.innerHTML = `
        <div class="major-card major-last-card" id="inem-entries-registration">
          <div class="major-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="opacity:.9;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            CONSULTA SAÍDAS INEM | INEM-RESERVA
          </div>
          <div class="major-card-body">
            <div class="inem-filter">
              <div class="inem-f-codu"><label>Nr. CODU:</label><input type="text" id="inem-filter-codu" placeholder="ex: 123..."></div>
              <div class="inem-f-dates">
                <label>De:</label><input type="date" id="inem-date-from" value="${today}">
                <label>Até:</label><input type="date" id="inem-date-to" value="${today}">
                <button class="inem-search"><i class="fa-solid fa-magnifying-glass"></i> Pesquisar</button>
              </div>
              <div></div>
            </div>
            <div class="inem-wrap">
              <table>
                <thead><tr>${COLUMNS.map(c => `<th class="${c.red ? 'red' : ''}" style="min-width:${c.w}px">${c.label}</th>`).join('')}</tr></thead>
                <tbody id="inem-tbody"></tbody>
              </table>
            </div>
            <div class="inem-foot">
              <div id="inem-totals">${TOTALS0}</div>
              <div class="inem-foot-btns">
                <button id="btn-inem-indisp-report" hidden><i class="fa-solid fa-truck-medical"></i> Relatório Indisponibilidades</button>
                <button id="btn-inem-emitir-xlsx" hidden><i class="fa-solid fa-file-excel"></i> Exportar Excel</button>
                <button id="btn-inem-emitir" hidden><i class="fa-solid fa-file-pdf"></i> Emitir Mapa</button>
              </div>
            </div>
          </div>
          <div class="major-card-footer"></div>
        </div>`;
      const codu = $('inem-filter-codu');
      codu.addEventListener('input', () => codu.value.trim() ? load() : clear());
      page.querySelectorAll('.inem-filter input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); load(); } }));
      page.querySelector('.inem-search').addEventListener('click', load);
      $('btn-inem-indisp-report').addEventListener('click', urPickMonth);
      $('btn-inem-emitir-xlsx').addEventListener('click', () => exportEntries('xlsx'));
      $('btn-inem-emitir').addEventListener('click', () => exportEntries('pdf'));
      $('inem-tbody').addEventListener('click', onTableClick);
      load();
    }  
    function showFootButtons(show) {
      ['btn-inem-indisp-report', 'btn-inem-emitir-xlsx', 'btn-inem-emitir'].forEach(id => {
        const b = $(id);
        if (!b) return;
        b.hidden = !show;
        b.disabled = show && ST.readOnly;
      });
    }
    function clear() {
      const tb = $('inem-tbody');
      if (tb) tb.innerHTML = '';
      ST.rows = [];
      showFootButtons(false);
      const t = $('inem-totals');
      if (t) t.innerHTML = TOTALS0;
    }  
    const statusIcon = ok => ok ? '<i class="fa-solid fa-circle-check" style="color:#27ae60"></i>' : '<i class="fa-solid fa-circle-xmark" style="color:#c0392b"></i>';
    function setStatus(nr, ok) {
      document.querySelectorAll(`#inem-tbody tr[data-nr="${CSS.escape(nr)}"] td.inem-st`).forEach(td => {
        td.innerHTML = statusIcon(ok);
        td.title = ok ? 'Ficheiro disponível' : 'Ficheiro não encontrado';
      });
    }  
    async function load() {
      const from = $('inem-date-from')?.value, to = $('inem-date-to')?.value, codu = $('inem-filter-codu')?.value.trim();
      await isRestricted();
      if (!from && !to && !codu) return clear();
      let query = `inem_entries?corp_oper_nr=eq.${corp()}`;
      if (codu) query += `&nr_codu=ilike.${codu}*`;
      else { if (from) query += `&alert_date=gte.${from}`; if (to) query += `&alert_date=lte.${to}`; }
      query += '&order=nr_codu.desc';
      try {
        const data = await supabaseFetch(query);
        const tb = $('inem-tbody');
        if (!tb) return;
        clear();
        if (!data?.length) return;
        ST.rows = data;
        const exists = new Map(await Promise.all(data.map(async it => {
          if (!it.nr_codu) return [it.nr_codu, false];
          try { const r = await fetch(fileUrl(fileOf(it.nr_codu, it.service_type)), {method: 'HEAD', headers: storeHdr()}); return [it.nr_codu, r.ok]; }
          catch { return [it.nr_codu, false]; }
        })));
        const ro = ST.readOnly ? ' disabled' : '';
        tb.innerHTML = data.map((it, i) => {
          const nr = it.nr_codu || '';
          const alerta = [fmtDate(it.alert_date), (it.alert_hour || '').slice(0, 5)].filter(Boolean).join('  ');
          let vitima = it.victim_type || '';
          if (it.victim_age_type) vitima += (vitima ? ' - ' : '') + it.victim_age_type;
          if (it.victim_age_unit) vitima += (vitima ? ' ' : '') + it.victim_age_unit;
          const morada = [it.victim_address, it.victim_location].filter(Boolean).join(' - ');
          const acts = nr ? `<div class="inem-acts">
                <button class="btn-inem-upload" data-act="up" title="Upload"><i class="fa-solid fa-upload"></i></button>
                <button class="btn-inem-download" data-act="down" title="Download"${ro}><i class="fa-solid fa-download"></i></button>
                <button class="btn-inem-view" data-act="view" title="Visualizar"${ro}><i class="fa-solid fa-magnifying-glass"></i></button>
                <button class="btn-inem-delete" data-act="del" title="Eliminar ficheiro"${ro}><i class="fa-solid fa-trash"></i></button></div>` : '';
          const ok = exists.get(it.nr_codu);
          return `<tr data-i="${i}" data-nr="${esc(nr)}">
            <td>${esc(nr)}</td><td>${esc(alerta)}</td><td>${esc(vitima)}</td><td>${esc(morada)}</td>
            <td class="nosel"><button class="inem-edit" data-act="edit" title="Editar"><i class="fa-solid fa-pen"></i></button></td>
            <td>${esc(it.tas)}</td><td>${esc(it.service_type)}</td>
            <td class="nosel">${acts}</td>
            <td class="inem-st"${nr ? ` title="${ok ? 'Ficheiro disponível' : 'Ficheiro não encontrado'}"` : ''}>${nr ? statusIcon(ok) : ''}</td></tr>`;
        }).join('');
        const iteams = data.filter(d => d.service_type === 'ITeams').length;
        $('inem-totals').innerHTML = `<span>TOTAL: ${data.length}</span> &nbsp;|&nbsp; <span>ITeams: ${iteams}</span> &nbsp;|&nbsp; <span>Verbete: ${data.length - iteams}</span>`;
        showFootButtons(true);
      } catch (err) {
        console.error('Erro ao carregar verbetes INEM:', err);
        showPopup('popup-danger', 'Erro ao carregar verbetes INEM.');
      }
    }  
    function onTableClick(e) {
      const b = e.target.closest('button[data-act]');
      if (!b || b.disabled) return;
      const it = ST.rows[+b.closest('tr').dataset.i];
      if (!it) return;
      const nr = it.nr_codu || '', type = it.service_type || '';
      ({edit: () => editEntry(it), up: () => upload(nr, type), down: () => download(nr, type), view: () => view(nr, type), del: () => remove(nr, type)})[b.dataset.act]?.();
    }  
    /* ----------------------------- editar ----------------------------- */
    function editEntry(item) {
      ensureFA();
      $('inem-edit-modal')?.remove();
      const opts = (list, cur) => list.map(o => `<option value="${esc(o)}"${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('');
      const inp = (key, type) => `<input type="${type}" data-k="${key}" value="${esc(item[key] || '')}">`;
      const fld = (label, inner, cls = '') => `<div class="inem-fld ${cls}"><label>${label}</label>${inner}</div>`;
      const ov = el(`
        <div id="inem-edit-modal" class="inem-ov">
          <div class="inem-dlg">
            <div class="inem-dlg-head"><div><i class="fa-solid fa-pen"></i> Editar Verbete - Nr. CODU: ${esc(item.nr_codu)}</div><button class="inem-dlg-x"><i class="fa-solid fa-xmark"></i></button></div>
            <div class="inem-dlg-body">
              ${fld('Tipo de Documento', `<select data-k="service_type" class="short">${opts(['', 'ITeams', 'Verbete'], item.service_type === 'ITeams' ? 'ITeams' : 'Verbete')}</select>`)}
              <div class="inem-row top">${fld('Nr. CODU', inp('nr_codu', 'text'))}${fld('Data Alerta', inp('alert_date', 'date'))}${fld('Hora Alerta', inp('alert_hour', 'time'))}</div>
              <div class="inem-row">
                ${fld('Vítima', `<select data-k="victim_type">${opts(['Masculino', 'Feminino', 'Desconhecido'], item.victim_type || '')}</select>`, 'w15')}
                ${fld('Idade', inp('victim_age_type', 'text'))}
                ${fld('&nbsp;', `<select data-k="victim_age_unit">${opts(['Anos', 'Meses', 'Dias'], item.victim_age_unit || '')}</select>`)}
              </div>
              ${fld('Morada', inp('victim_address', 'text'))}
              ${fld('Localidade', inp('victim_location', 'text'))}
              <div class="inem-row">
                ${fld('TAS', '<input type="text" class="tas-nint" placeholder="N.º Int.">')}
                ${fld('&nbsp;', `<input type="text" class="tas-name" placeholder="Nome TAS" value="${esc(item.tas || '')}" readonly disabled>`, 'w2')}
              </div>
            </div>
            <div class="inem-dlg-foot"><button class="no">Cancelar</button><button class="yes"><i class="fa-solid fa-floppy-disk"></i> Guardar</button></div>
          </div>
        </div>`);
      const q = s => ov.querySelector(s);
      const nint = q('.tas-nint'), name = q('.tas-name');
      const close = () => ov.remove();
      q('.inem-dlg-x').onclick = close;
      q('.no').onclick = close;
      if (item.tas) {
        fetch(`${SUPABASE_URL}/rest/v1/reg_elems?abv_name=eq.${encodeURIComponent(item.tas)}&select=n_int`, {headers: getSupabaseHeaders()})
          .then(r => r.json()).then(d => { if (d.length > 0) nint.value = d[0].n_int; })
          .catch(err => console.error('Erro na busca inicial do TAS:', err));
      }
      nint.addEventListener('input', async () => {
        const v = nint.value.trim();
        if (v.length !== 3) { name.value = ''; return; }
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${encodeURIComponent(v)}&select=abv_name`, {headers: getSupabaseHeaders()});
          name.value = (await r.json())[0]?.abv_name || '';
        } catch { name.value = ''; }
      });
      q('.yes').onclick = async () => {
        const updated = {};
        ov.querySelectorAll('[data-k]').forEach(i => { updated[i.dataset.k] = i.value.trim() || null; });
        updated.tas = name.value.trim() || null;
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_entries?id=eq.${item.id}`, {
            method: 'PATCH', headers: {...getSupabaseHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=minimal'}, body: JSON.stringify(updated)
          });
          if (!res.ok) throw new Error(await res.text());
          showPopup('popup-success', 'Verbete atualizado com sucesso.');
          close();
          load();
        } catch (err) {
          console.error('Erro ao guardar:', err);
          showPopup('popup-danger', 'Erro ao guardar as alterações.');
        }
      };
      document.body.appendChild(ov);
    }  
    /* ----------------------------- ficheiros ----------------------------- */
    async function fetchFile(name) {
      const res = await fetch(fileUrl(name), {headers: storeHdr()});
      if (!res.ok) throw new Error(`Ficheiro indisponível (${res.status})`);
      return res;
    }
    function saveBlob(blob, name) {
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {href: url, download: name});
      a.click();
      URL.revokeObjectURL(url);
    }
    function upload(nr, type) {
      if (!nr) return;
      const isHtml = type === 'ITeams';
      const input = Object.assign(document.createElement('input'), {type: 'file', accept: isHtml ? 'text/html' : 'application/pdf'});
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        try {
          const res = await fetch(objUrl(fileOf(nr, type)), {method: 'POST', headers: storeHdr({'Content-Type': isHtml ? 'text/html' : 'application/pdf', 'x-upsert': 'true'}), body: file});
          if (!res.ok) throw new Error(await res.text());
          showPopup('popup-success', `Verbete para a ocorrência <b>${esc(nr)}</b> carregado com sucesso.`);
          setStatus(nr, true);
        } catch (err) {
          console.error('Erro ao fazer upload:', err);
          showPopup('popup-danger', 'Erro ao carregar o verbete.');
        }
      };
      input.click();
    }
    async function download(nr, type) {
      if (!nr) return;
      try { saveBlob(await (await fetchFile(fileOf(nr, type))).blob(), fileOf(nr, type)); }
      catch { showPopup('popup-danger', 'Verbete não encontrado.'); }
    }  
    /* ----------------------------- visualizar ----------------------------- */
    function view(nr, type) {
      if (!nr) return;
      ensureFA();
      const ext = fileExt(type), name = fileOf(nr, type);
      $('inem-pdf-modal')?.remove();
      const ov = el(`
        <div id="inem-pdf-modal" class="inem-ov">
          <div class="inem-box">
            <div class="inem-header">
              <div class="inem-hl">
                <div class="inem-logo-box"><img src="${INEM_LOGO}" alt="INEM"></div><div class="inem-sep"></div>
                ${type === 'ITeams' ? `<div class="inem-logo-iteams"><img src="${ITEAMS_LOGO}" alt="iTeams"></div><div class="inem-sep"></div>` : ''}
                <div class="inem-tw">
                  <div class="inem-trow"><div class="inem-title-main">Verbete ${type === 'ITeams' ? 'ITeams' : 'INEM'} - ${esc(nr)}</div><span class="inem-badge">${ext.toUpperCase()}</span></div>
                  <div class="inem-title-sub">Via ${esc(type)} · ${esc(name)}</div>
                </div>
              </div>
              <div class="inem-hr">
                <button class="inem-btn fs" title="Ecrã inteiro"><i class="fa-solid fa-expand"></i></button>
                <button class="inem-btn inem-close-btn" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
              </div>
            </div>
            <div class="inem-content"><div class="inem-loading"><div class="inem-spinner"></div><div>A carregar ficheiro…</div></div><iframe></iframe></div>
            <div class="inem-footer">
              <div class="inem-footer-info">INEM · Instituto Nacional de Emergência Médica</div>
              ${ext === 'html' ? '<button class="inem-print-btn" title="Imprimir verbete"><i class="fa-solid fa-print"></i> Imprimir</button>' : ''}
            </div>
          </div>
        </div>`);
      const q = s => ov.querySelector(s);
      const box = q('.inem-box'), iframe = q('iframe'), loading = q('.inem-loading');
      const close = () => {
        document.removeEventListener('keydown', onKey);
        if (iframe.dataset.blobUrl) URL.revokeObjectURL(iframe.dataset.blobUrl);
        ov.classList.add('closing');
        setTimeout(() => ov.remove(), 180);
      };
      const onKey = e => { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', onKey);
      q('.inem-close-btn').onclick = close;
      q('.fs').onclick = function () {
        const fs = box.classList.toggle('fs');
        this.innerHTML = `<i class="fa-solid fa-${fs ? 'compress' : 'expand'}"></i>`;
        this.title = fs ? 'Sair de ecrã inteiro' : 'Ecrã inteiro';
      };
      if (q('.inem-print-btn')) q('.inem-print-btn').onclick = () => { try { iframe.contentWindow.print(); } catch { window.print(); } };
      const reveal = () => { loading.hidden = true; iframe.classList.add('on'); };
      const notFound = () => {
        loading.innerHTML = '<div class="ico"><i class="fa-regular fa-file"></i></div><div class="msg">Verbete Indisponível.</div><div>Ainda não foi carregado nenhum verbete para esta ocorrência.</div>';
      };
      if (ext === 'html') {
        fetchFile(name).then(r => r.arrayBuffer()).then(buf => new TextDecoder('windows-1252').decode(buf)).then(html => {
          iframe.onload = reveal;
          iframe.srcdoc = `<style>::-webkit-scrollbar {width: 10px; height: 6px;} ::-webkit-scrollbar-track {background: #1a0000;}
                           ::-webkit-scrollbar-thumb {background: #7b0000; border-radius: 10px;} ::-webkit-scrollbar-thumb:hover {background: #9a0f0f;}</style>`
            + html.replace(/window\.print\s*\(\s*\)/g, 'void 0').replace(/onload\s*=\s*["']?print\s*\(\s*\)["']?/gi, '');
        }).catch(notFound);
      } else {
        fetchFile(name).then(r => r.blob()).then(blob => {
          const url = URL.createObjectURL(new Blob([blob], {type: 'application/pdf'}));
          iframe.dataset.blobUrl = url;
          iframe.onload = reveal;
          iframe.src = url;
        }).catch(notFound);
      }
      document.body.appendChild(ov);
    }  
    /* ----------------------------- eliminar ----------------------------- */
    function confirmDelete(name) {
      return new Promise(resolve => {
        $('inem-confirm-modal')?.remove();
        const ov = el(`
          <div id="inem-confirm-modal" class="inem-ov" style="z-index:10001">
            <div class="inem-dlg sm">
              <div class="inem-dlg-head"><div><i class="fa-solid fa-trash"></i> Eliminar Verbete</div></div>
              <div class="inem-dlg-body"><div>Tem a certeza que pretende eliminar o verbete:</div><div class="inem-dlg-file">${esc(name)}</div></div>
              <div class="inem-dlg-foot"><button class="no">Cancelar</button><button class="yes"><i class="fa-solid fa-trash"></i> Eliminar</button></div>
            </div>
          </div>`);
        const done = v => { ov.remove(); resolve(v); };
        ov.querySelector('.no').onclick = () => done(false);
        ov.querySelector('.yes').onclick = () => done(true);
        ov.addEventListener('click', e => { if (e.target === ov) done(false); });
        document.body.appendChild(ov);
      });
    }
    async function remove(nr, type) {
      if (!nr) return;
      ensureFA();
      const name = fileOf(nr, type);
      if (!(await confirmDelete(name))) return;
      try {
        const res = await fetch(objUrl(name), {method: 'DELETE', headers: storeHdr()});
        if (!res.ok) throw new Error(await res.text());
        showPopup('popup-success', 'Verbete eliminado com sucesso.');
        setStatus(nr, false);
      } catch (err) {
        console.error('Erro ao eliminar:', err);
        showPopup('popup-danger', 'Erro ao eliminar o verbete.');
      }
    }  
    /* ----------------------------- exportar (Excel / PDF) ----------------------------- */
    function exportRows() {
      return ST.rows.filter(it => it.nr_codu).map(it => ({
        nr_codu: String(it.nr_codu), alert_date: it.alert_date || '', alert_hour: (it.alert_hour || '').slice(0, 5), victim_type: it.victim_type || '',
        victim_age_type: it.victim_age_type || '', victim_age_unit: it.victim_age_unit || '', victim_address: it.victim_address || '', victim_location: it.victim_location || '',
        tas: it.tas || '', service_type: it.service_type || ''
      }));
    }
    async function exportEntries(format) {
      const rows = exportRows();
      if (!rows.length) return showPopupWarning('Sem dados para exportar.');
      const F = format.toUpperCase();
      const btn = $(format === 'xlsx' ? 'btn-inem-emitir-xlsx' : 'btn-inem-emitir');
      const original = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${format === 'xlsx' ? 'A Exportar...' : 'A Gerar Mapa...'}`;
      btn.disabled = true;
      showLoadingPopup(`A iniciar exportação ${F}...`);
      const dateFrom = $('inem-date-from')?.value || '', dateTo = $('inem-date-to')?.value || '';
      try {
        const res = await fetch(API, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({rows, format, dateFrom, dateTo})});
        if (!res.ok) throw new Error(await res.text());
        updateLoadingPopup(`A gerar ficheiro ${F}...`);
        const f = d => d ? d.split('-').reverse().join('-') : '';
        const sufix = dateFrom === dateTo || !dateTo ? f(dateFrom) : `${f(dateFrom)}_a_${f(dateTo)}`;
        saveBlob(await res.blob(), `inem_entries_${sufix}.${format}`);
        updateLoadingPopup('Exportação concluída!');
        showPopup('popup-info', 'Mapa serviços INEM/Reserva gerado com sucesso.');
      } catch (err) {
        console.error(`Erro ao exportar ${F}:`, err);
        showPopup('popup-danger', `Erro ao exportar ${F}.`);
        updateLoadingPopup('Erro durante a exportação.');
      } finally {
        hideLoadingPopup();
        btn.innerHTML = original;
        btn.disabled = ST.readOnly;
      }
    }  
    /* =======================================================================
       RELATÓRIO DE INDISPONIBILIDADES DOS VEÍCULOS (vehicle_unavailability_history)
       ======================================================================= */
    function urOverlay(html) {
      $('inem-ur-modal')?.remove();
      const ov = el(`<div id="inem-ur-modal" class="inem-ur-ov">${html}</div>`);
      document.body.appendChild(ov);
      return ov;
    }
    function urPickMonth() {
      ensureFA();
      const ov = urOverlay(`
        <div class="inem-ur">
          <div class="inem-ur-head"><span><i class="fa-solid fa-calendar"></i> Selecionar Mês</span><span class="x">✕</span></div>
          <div class="inem-ur-months">${MONTHS.map((m, i) => `<button data-m="${i + 1}"><i class="fa-regular fa-calendar-days"></i>${m}</button>`).join('')}</div>
          <div class="inem-ur-foot"><button class="close"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button></div>
        </div>`);
      ov.querySelector('.x').onclick = ov.querySelector('.close').onclick = () => ov.remove();
      ov.querySelectorAll('[data-m]').forEach(b => b.onclick = () => urReport(+b.dataset.m));
    }
    function urReport(month) {
      const ov = urOverlay(`
        <div class="inem-ur big">
          <div class="inem-ur-head"><span><i class="fa-solid fa-file-lines"></i> Relatório de Indisponibilidades</span><span class="x">✕</span></div>
          <div class="inem-ur-filters">
            <div><label for="inem-ur-month">Mês:</label><select id="inem-ur-month">${MONTHS.map((m, i) => `<option value="${i + 1}"${i + 1 === month ? ' selected' : ''}>${m}</option>`).join('')}</select></div>
            <div><label for="inem-ur-type">Tipo:</label><select id="inem-ur-type"><option value="">Todos os tipos</option>${UR_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
          </div>
          <div class="inem-ur-content" id="inem-ur-content"></div>
          <div class="inem-ur-foot split">
            <button class="back"><i class="fa-solid fa-arrow-left"></i>&nbsp;&nbsp;Voltar</button>
            <div><button class="print"><i class="fa-solid fa-print"></i>&nbsp;&nbsp;Imprimir</button><button class="close"><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Fechar</button></div>
          </div>
        </div>`);
      const q = s => ov.querySelector(s);
      q('.x').onclick = q('.close').onclick = () => ov.remove();
      q('.back').onclick = urPickMonth;
      const reload = () => urLoad(+$('inem-ur-month').value, $('inem-ur-type').value);
      $('inem-ur-month').onchange = $('inem-ur-type').onchange = reload;
      q('.print').onclick = urPrint;
      reload();
    }
    function minutesOf(txt) {
      const t = String(txt || '').toLowerCase();
      const h = t.match(/(\d+)\s*(?:h|hora|horas)/), m = t.match(/(\d+)\s*(?:m|min|minuto|minutos)/);
      if (h || m) return (h ? +h[1] : 0) * 60 + (m ? +m[1] : 0);
      const p = t.split(':');
      return p.length === 2 ? (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0) : 0;
    }
    async function urLoad(month, type) {
      const box = $('inem-ur-content');
      box.innerHTML = '<div class="inem-ur-msg load"><i class="fa-solid fa-spinner fa-spin"></i><p>A carregar dados...</p></div>';
      try {
        const year = new Date().getFullYear(), mm = pad(month);
        let query = `corp_oper_nr=eq.${corp()}&start_date=gte.${year}-${mm}-01&start_date=lte.${year}-${mm}-${pad(new Date(year, month, 0).getDate())}&order=start_date.desc`;
        if (type) query += `&motive=eq.${encodeURIComponent(type)}`;
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability_history?${query}`, {headers: getSupabaseHeaders()});
        const recs = await resp.json();
        if (!resp.ok || !Array.isArray(recs)) {
          console.error('Erro na resposta do Supabase:', recs);
          box.innerHTML = `<div class="inem-ur-msg err">Erro ao carregar dados: ${esc(recs?.message || 'Resposta inválida do servidor.')}</div>`;
          return;
        }
        if (!recs.length) { box.innerHTML = '<div class="inem-ur-msg">Nenhum registo encontrado para os filtros selecionados.</div>'; return; }
        const total = recs.reduce((s, r) => s + minutesOf(r.total_time), 0);
        box.innerHTML = `
          <table class="inem-ur-table">
            <colgroup><col style="width:12%"><col style="width:18%"><col style="width:18%"><col style="width:15%"><col style="width:37%"></colgroup>
            <thead><tr><th>Veículo</th><th>Início</th><th>Fim</th><th>Tempo Total</th><th>Motivo</th></tr></thead>
            <tbody>
              ${recs.map(r => `<tr><td class="v">${esc(r.vehicle || '-')}</td><td>${fmtDate(r.start_date)} ${esc(r.start_hour || '')}</td>
                <td>${fmtDate(r.end_date)} ${esc(r.end_hour || '')}</td><td class="t">${esc(r.total_time || 'Em aberto')}</td><td class="m">${esc(r.motive || '-')}</td></tr>`).join('')}
              <tr class="tot"><td colspan="3">TOTAL:</td><td class="sum">${pad(Math.floor(total / 60))}h${pad(total % 60)}m</td><td></td></tr>
            </tbody>
          </table>`;
      } catch (e) {
        console.error('Erro de rede ao carregar relatório:', e);
        box.innerHTML = '<div class="inem-ur-msg err">Erro ao conectar com o servidor.</div>';
      }
    }
    async function urPrint() {
      const c = corp();
      let logoUrl = '';
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${c}&select=logo_url`, {headers: getSupabaseHeaders()});
        logoUrl = (await r.json())?.[0]?.logo_url || '';
      } catch (err) {
        console.error('Erro ao buscar logo da corporação:', err);
      }
      const blackLogo = `${SUPABASE_URL}/storage/v1/object/public/cb_logos/logo_cb_${String(c || '').padStart(4, '0')}_Mobile.png`;
      const title = `Relatório de Indisponibilidades - ${MONTHS[+$('inem-ur-month').value - 1]}`;
      const w = window.open('', '_blank', 'height=600,width=800');
      if (!w) return showPopup('popup-danger', 'Por favor, permita os pop-ups para conseguir imprimir o relatório.');
      w.document.open();
      w.document.write(`<html><head><title>${title}</title><style>
        @page {size: auto; margin: 10mm;}
        body {font-family: sans-serif; padding: 10px; margin: 0; color: #333;}
        .header {display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #d9534f; padding-bottom: 10px; margin-bottom: 20px;}
        .logo {max-height: 60px;}
        h2 {margin: 0; color: #333; font-size: 18px; text-align: right;}
        .inem-ur-msg {text-align: center; color: #666; padding: 30px 0;}
        ${UR_TABLE_CSS}
      </style></head><body>
        <div class="header"><img src="${blackLogo}" alt="Logo Corporação" class="logo" onerror="this.onerror=null; ${logoUrl ? `this.src='${esc(logoUrl)}'` : `this.style.display='none'`};"><h2>${title}</h2></div>
        ${$('inem-ur-content').innerHTML}
      </body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); w.close(); }, 600);
    }  
    /* ----------------------------- arranque ----------------------------- */
    document.querySelectorAll('.sidebar-menu-button').forEach(btn => btn.addEventListener('click', () => { if (btn.dataset.page === 'inem-entries') render(); }));
  })();
