    /* =======================================================================
    UTILITÁRIOS · CONSOLA DE UTILITÁRIOS (CB360)
    ======================================================================= */
(function () {
  const page = document.getElementById('page-utilities');
  if (!page) return;
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const corp = () => sessionStorage.getItem('currentCorpOperNr');
  const hdrCorp = (opts) => { const h = getSupabaseHeaders(opts); h['x-my-corpo'] = corp(); return h; };
  const PUSH_API = 'https://cb-360-app.vercel.app/api/sendPush';
  async function checkRes(res, label) {
    if (res && !res.ok) {
      const t = await res.text().catch(() => '');
      let msg = t;
      try { msg = JSON.parse(t).message || t; } catch (e) {}
      throw new Error(`${label}: ${msg || res.status}`);
    }
    return res;
  }

  /* ----------------------------- estilos ----------------------------- */
  (function css() {
    if ($('util-css')) return;
    const st = document.createElement('style');
    st.id = 'util-css';
    st.textContent = `
      /* regras vindas dos ficheiros CSS gerais (só usadas neste módulo) */
      /* - de buttons_ltsc_x04.css */
      .button-container {display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 10px; width: 100%; height: 60px;}
      .epeppi-panel-btn {flex: 1; min-width: 0; height: 52px; padding: 0 4px; border: 1.5px solid #D3D1C7; border-radius: 5px; background: #F1EFE8; color: #5F5E5A; cursor: pointer; font-weight: 500; font-size: 11px;
                         letter-spacing: 0.04em; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; transition: border-color 0.2s, background 0.2s, color 0.2s; 
                         overflow: hidden; text-align: center;}
      .epeppi-panel-btn::before {content: ''; width: 6px; height: 6px; border-radius: 50%; background: #B4B2A9; flex-shrink: 0; transition: background 0.2s, box-shadow 0.2s; margin-bottom: 5px; }
      .epeppi-panel-btn:hover {border-color: #888780; background: white; color: #2C2C2A;}
      .epeppi-panel-btn:empty {border-color: transparent; background: transparent; pointer-events: none;}
      .epeppi-panel-btn.s-monitor {background: #E6F1FB; color: #0C447C;}
      .epeppi-panel-btn.s-yellow {background: #FAEEDA; color: #633806;}
      .epeppi-panel-btn.s-orange {background: #FAECE7; color: #712B13;}
      .epeppi-panel-btn.s-red {background: #FCEBEB; color: #791F1F;}
      .epeppi-panel-btn.s-critical {background: #A32D2D; color: #FCEBEB;}
      .epeppi-panel-btn.s-monitor::before, .epeppi-panel-btn.s-yellow::before, .epeppi-panel-btn.s-orange::before, .epeppi-panel-btn.s-red::before,
      .epeppi-panel-btn.s-critical::before {background: lime; box-shadow: 0 0 6px 2px lime;}
      .epeppi-panel-btn.inactive::before {background: #E24B4A; box-shadow: 0 0 6px 2px #E24B4A;}
      /* - de sidebars_ltsc_x04.css */
      .panel-group-title {font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: rgba(255,255,255,0.45); text-transform: uppercase; margin: 14px 4px 6px; padding-bottom: 3px; border-bottom: 1px solid rgba(255,255,255,0.10); user-select: none; pointer-events: none;}
      /* - de utilities_ltsc_x04.css */
      .data-grid {display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;}
      .elems-container {display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 0 0; justify-content: flex-start;}
      .btn-elem {font-size: 14px; position: relative; padding: 15px 20px; cursor: pointer; border: 1px; border-radius: 5px; transition: background 0.2s, color 0.2s;}
      .btn-elem:hover {border-color: #555555; transform: scale(1.05); transition: all 0.3s ease; background: rgba(60, 60, 60, 0.75) !important; color: white !important}
      .btn-elem::after {content: attr(data-tooltip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.75); color: #fff; padding: 5px 8px; border-radius: 4px;
                        white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; font-size: 12px; z-index: 10;}
      .btn-elem:hover::after {opacity: 1;}
      /* - de animations_ltsc_x04.css */
      #ocrReport {display: grid; grid-template-columns: 1fr 1fr; gap: 3px 20px;}
      /* - regras próprias do módulo */
      #page-utilities .major-card-header svg {opacity: .9;}
      #page-utilities .panel-group-title.first {margin-top: 2px;}
      #page-utilities #ppi-container {margin-top: 20px;}
      #page-utilities .act {margin: 15px 0 0 0;}
      #page-utilities .act.cma {margin: 20px 0 0 0;}
      #page-utilities .in5 {margin: 5px 0 0 0;}
      /* EPE / PPI */
      #page-utilities .epe-card {height: 170px; margin: -10px 0 0 0;}
      #page-utilities .epe-card > .data-value {font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 12px; font-weight: bold;}
      /* informações relevantes */
      #page-utilities .add-info {margin-bottom: 20px; font-weight: bold;}
      #page-utilities #info-container {display: grid; grid-template-columns: 1fr 1fr; gap: 20px;}
      #page-utilities .ri-card {padding: 15px; background: #fdfdfd; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;}
      #page-utilities .ri-head {background: #343a40; margin: -15px -15px 15px -15px; padding: 8px 15px; border-radius: 8px 8px 0 0; font-weight: bold; color: #fff; display: flex;
                                justify-content: space-between; align-items: center; font-size: 12px; letter-spacing: 1px;}
      #page-utilities .ri-head button {background: #dc3545; border: none; color: #fff; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 10px; font-weight: bold;}
      #page-utilities .ri-row {display: flex; align-items: center; margin-bottom: 12px;}
      #page-utilities .ri-row.top {align-items: flex-start;}
      #page-utilities .ri-row label {width: 60px; font-weight: bold; font-size: 13px; color: #444; margin: 0;}
      #page-utilities .ri-row.top label {margin-top: 8px;}
      #page-utilities .ri-row input {flex: 1; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; outline: none;}
      #page-utilities .ri-row textarea {flex: 1; height: 80px; padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; resize: none; outline: none; font-family: inherit;}
      #page-utilities .ri-btns {display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;}
      #page-utilities .ri-btns .btn {padding: 5px 12px; font-size: 11px;}
      /* linhas numeradas (vias, hospitais, relatórios) */
      #page-utilities .nl {display: flex; align-items: center; gap: 5px; width: 100%; padding: 1px 0;}
      #page-utilities .nl > label {font-weight: bold; min-width: 25px; color: #444; margin: 0; font-size: 13px;}
      #page-utilities .nl input, #page-utilities .nl select {padding: 4px; border: 1px solid #ccc; border-radius: 4px; outline: none; font-size: 12px; height: 28px; box-sizing: border-box;}
      #page-utilities .nl input[type=date], #page-utilities .nl input[type=time] {color: #666;}
      #page-utilities #routes-container {display: flex; flex-direction: column; gap: 2px; padding: 2px; margin: 5px 0 0 0;}
      #page-utilities #ocrReport {display: grid; grid-template-columns: 1fr 1fr; gap: 2px 25px; padding: 2px; margin: 5px 0 0 0;}
      #page-utilities #ocrReport input[type=date] {padding: 3px;}
      #page-utilities #ocrReport select {font-weight: 600; cursor: pointer; background-color: white;}
      #page-utilities #no-hosp {display: flex; flex-direction: column; gap: 2px; padding: 2px; margin: 5px 0 0 0;}
      #page-utilities #no-hosp input {font-size: 11px;}
      #page-utilities .nh-head {display: flex; gap: 5px; align-items: center; padding: 2px 0; margin-bottom: 2px; text-transform: uppercase;}
      #page-utilities .nh-head > div {text-align: center; font-size: 12px; font-weight: bold; color: #1f4b91;}
      #page-utilities .nh-head .box {display: flex; justify-content: center;}
      #page-utilities .nh-head .box div {background: #d1d9e6; border-radius: 3px; width: 100%; padding: 2px 0; text-align: center; font-size: 12px; font-weight: bold; color: #1f4b91; box-sizing: border-box;}
      #page-utilities .nh-pair {display: flex; gap: 2px;}
      /* centros de meios aéreos */
      #page-utilities #cma-container {gap: 10px;}
      #page-utilities .cma-name {font-size: 16px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 5px; display: flex; justify-content: space-between; align-items: center;}
      #page-utilities .cma-sw {position: relative; display: inline-block; width: 46px; height: 24px;}
      #page-utilities .cma-sw input {opacity: 0; width: 0; height: 0;}
      #page-utilities .cma-sw > span {position: absolute; cursor: pointer; inset: 0; background: #ff3b30; transition: .3s; border-radius: 24px;}
      #page-utilities .cma-sw > span > span {position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; transition: .3s; border-radius: 50%;}
      #page-utilities .cma-sw input:checked + span {background: #28c840;}
      #page-utilities .cma-sw input:checked + span > span {transform: translateX(22px);}
      #page-utilities .cma-body {display: flex; gap: 15px; align-items: flex-start;}
      #page-utilities .cma-img {flex: 0 0 125px; background: #f9f9f9; padding: 5px; border-radius: 4px; border: 1px solid #ddd;}
      #page-utilities .cma-img img {object-fit: contain; width: 100%; height: 80px;}
      #page-utilities .cma-fields {flex: 1; display: flex; flex-direction: column; gap: 8px;}
      #page-utilities .cma-fields > div {display: flex; align-items: center;}
      #page-utilities .cma-fields label {width: 90px; font-weight: bold; font-size: 11px; margin-bottom: 0;}
      #page-utilities .cma-fields input, #page-utilities .cma-fields select {flex: 1; padding: 4px; border: 1px solid #ccc; border-radius: 3px; outline: none; font-size: 12px; background: #fff; color: #000;}
      #page-utilities .cma-fields input:disabled, #page-utilities .cma-fields select:disabled {background: #f3f3f3; color: #999;}
      /* elementos */
      #page-utilities #elems-container.list {display: flex; flex-wrap: wrap; justify-content: left; padding: 5px;}
      #page-utilities #elems-container .msg {padding: 10px; font-size: 16px; color: #333;}
      /* notificações */
      #page-utilities .nt-to {flex-direction: row; align-items: center; gap: 8px;}
      #page-utilities .nt-to > div {position: relative; display: inline-block;}
      #page-utilities #notification-to {width: 75px; text-align: center;}
      #page-utilities .nt-to .req {position: absolute; top: -5px; right: -8px; color: red; font-size: 14px; font-weight: bold;}
      #page-utilities .nt-row {margin-top: 10px;}
      #page-utilities .nt-msg {flex-direction: row; align-items: center; gap: 8px; width: 100%;}
      #page-utilities #notification-message {flex: 1; min-height: 200px; padding: 8px 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 13px; font-family: 'Segoe UI', sans-serif;
                                             resize: vertical; box-sizing: border-box; outline: none; transition: border-color .15s;}
      #page-utilities #notification-message:focus {border-color: #7b0000;}
      #page-utilities .nt-note {margin-top: 20px;}
      #page-utilities .nt-note label {font-size: 11px; color: red;}
      /* emails */
      #page-utilities .ml-card {margin-top: -5px; background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06);}
      #page-utilities .ml-types {padding: 10px 16px; display: flex; gap: 6px; border-bottom: 1px solid #eee; flex-wrap: wrap; align-items: center;}
      #page-utilities .ml-cap {font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.06em; margin-right: 4px;}
      #page-utilities .ml-type {display: inline-flex; align-items: center; background: transparent; border: 1px solid #ddd; border-radius: 8px; padding: 4px 12px; font-size: 12px; color: #666;
                                cursor: pointer; font-family: inherit;}
      #page-utilities .ml-type.on {background: #7b000012; border-color: #7b000055; color: #7b0000; font-weight: 500;}
      #page-utilities .ml-band {font-size: 10px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 16px; background: #fafafa; border-bottom: 1px solid #eee; border-top: 1px solid #eee;}
      #page-utilities .ml-line {display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 0 16px; min-height: 44px; gap: 10px;}
      #page-utilities .ml-line label, #page-utilities .ml-box > label {font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.06em; margin: 0;}
      #page-utilities .ml-line label {min-width: 36px;}
      #page-utilities .ml-line input {border: none; background: transparent; font-size: 13px; flex: 1; color: #222; font-family: inherit; outline: none; padding: 0;}
      #page-utilities .ml-box {padding: 12px 16px;}
      #page-utilities .ml-box.att {border-top: 1px solid #eee;}
      #page-utilities .ml-box > label {display: block; margin-bottom: 8px;}
      #page-utilities #mail-message {width: 100%; min-height: 160px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; font-size: 13px; font-family: 'Segoe UI', sans-serif; color: #222;
                                     resize: vertical; padding: 10px 12px; box-sizing: border-box; outline: none; transition: border-color .15s;}
      #page-utilities #mail-message:focus {border-color: #7b0000; background: #fff;}
      #page-utilities .ml-att {display: flex; align-items: center; gap: 10px;}
      #page-utilities .ml-att .btn {font-size: 12px; padding: 4px 12px;}
      #page-utilities #mail-attachments {display: none;}
      #page-utilities #mail-attachments-count {font-size: 12px; color: #666;}
      #page-utilities #mail-attachments-list {display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;}
      #page-utilities #sendMails {margin: 5px 0 0 0;}
      #page-utilities #sendMails .action-buttons {margin: 10px 0 -10px 0;}
      /* ===== layout novo (só estilo; ids e funções iguais) ===== */
      #page-utilities .options-panel-container {background: #efefef; padding: 12px; gap: 12px; align-items: stretch;}
      #page-utilities .panel-sidebar {width: 230px; flex: 0 0 230px; background: #fff; backdrop-filter: none; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); padding: 8px; align-self: stretch; box-sizing: border-box;}
      #page-utilities .panel-group-title {color: #8a949e; font-size: 10px; font-weight: 800; letter-spacing: .6px; border-bottom: 0; margin: 10px 8px 4px; padding: 0;}
      #page-utilities .panel-group-title.first {margin-top: 4px;}
      #page-utilities .panel-sidebar-menu-button {height: 34px; margin: 0 0 2px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: #2c3e50; font-size: 12px; font-weight: 600; gap: 0; box-shadow: none;
                      transition: background .15s, color .15s;}
      #page-utilities .panel-sidebar-menu-button::before, #page-utilities .panel-sidebar-menu-button::after {display: none;}
      #page-utilities .panel-sidebar-menu-button:hover {background: #f4f6f8; color: #b71c1c; transform: none; border: 0;}
      #page-utilities .panel-sidebar-menu-button.active {background: #fdecea; color: #b71c1c; font-weight: 800; border: 0; box-shadow: inset 3px 0 0 #c62828; padding-left: 12px;}
      #page-utilities .panel-content {background: transparent; overflow: visible; min-width: 0;}
      #page-utilities .panel-card {background: transparent; padding: 0; min-height: 0; animation: none;}
      #page-utilities .panel-card.active {display: flex; flex-direction: column; gap: 10px;}
      #page-utilities .panel-card > h3 {display: flex; align-items: center; gap: 9px; margin: 0; padding: 12px 14px 2px; background: #fff; border: 1px solid #e9ecef; border-bottom: 0; border-radius: 12px 12px 0 0;
                      font-size: 13px; font-weight: 800; color: #2c3e50; letter-spacing: .4px;}
      #page-utilities .panel-card > h3::before {content: ''; width: 4px; height: 16px; border-radius: 3px; background: #c62828; flex-shrink: 0;}
      #page-utilities .panel-card > p {margin: -10px 0 0; padding: 0 14px 11px 27px; background: #fff; border: 1px solid #e9ecef; border-top: 0; border-radius: 0 0 12px 12px; font-size: 12px; color: #6c757d;
                      line-height: 1.4; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
      #page-utilities .options-main-card {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); padding: 12px 14px; min-height: 0;}
      #page-utilities .options-main-card:focus-within {border-color: #e6b3ad;}
      .btn:has(> i.fa-solid) {gap: 6px;}   /* ícone + texto nos botões */
      /* botões */
      #page-utilities .btn {transform: none !important; box-shadow: none; border-radius: 8px !important; font-weight: 800 !important; letter-spacing: .4px;}
      #page-utilities .btn-success {background: #28a745 !important; color: #fff !important; border: 0 !important; height: 34px; padding: 0 22px; font-size: 11.5px;
                      box-shadow: 0 1px 3px rgba(0,0,0,.15) !important;}
      #page-utilities .btn-success:hover {filter: brightness(1.06);}
      #page-utilities .btn-danger {background: #dc3545 !important; color: #fff !important; border: 0 !important; box-shadow: 0 1px 3px rgba(0,0,0,.15) !important;}
      #page-utilities .btn-add {background: #3354a1 !important; color: #fff !important; border: 0 !important; box-shadow: 0 1px 3px rgba(0,0,0,.15) !important;}
      #page-utilities .btn-danger:hover, #page-utilities .btn-add:hover {filter: brightness(1.08);}
      #page-utilities .action-buttons.act, #page-utilities .action-buttons.act.cma, #page-utilities #sendMails .action-buttons {margin: 0; display: flex; justify-content: flex-end;}
      /* EPE / PPI */
      #page-utilities .data-grid {margin: 0; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr));}
      #page-utilities #ppi-container {margin-top: 0;}
      #page-utilities .epe-card {height: auto; margin: 0;}
      #page-utilities .epe-card > .data-value, #page-utilities .cma-name {display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: #2c3e50; text-transform: uppercase; letter-spacing: .4px;
                      border-bottom: 1px solid #eef0f2; padding-bottom: 8px; margin-bottom: 10px;}
      #page-utilities .epe-card > .data-value::before {content: ''; width: 4px; height: 14px; border-radius: 3px; background: #c62828; flex-shrink: 0;}
      #page-utilities .cma-name > span::before {content: ''; display: inline-block; width: 4px; height: 14px; border-radius: 3px; background: #c62828; margin-right: 8px; vertical-align: -2px;}
      #page-utilities .button-container {height: auto; margin: 0; gap: 6px;}
      #page-utilities .epeppi-panel-btn {height: 50px; border-radius: 10px; border: 1px solid #dfe3e7; font-size: 10.5px; font-weight: 800; letter-spacing: .3px; gap: 3px; background: #f8f9fa; color: #5b6670;}
      #page-utilities .epeppi-panel-btn::before {width: 6px; height: 6px; margin: 0; background: #c8cdd2; box-shadow: none;}
      #page-utilities .epeppi-panel-btn[data-active="false"] {background: #f8f9fa !important; color: #5b6670 !important;}
      #page-utilities .epeppi-panel-btn.inactive::before {background: #E24B4A; box-shadow: 0 0 6px 2px #E24B4A;}
      #page-utilities .epeppi-panel-btn[data-active="true"] {border-color: transparent; box-shadow: 0 2px 6px rgba(0,0,0,.12);}
      #page-utilities .epeppi-panel-btn[data-active="true"]::before {background: lime; box-shadow: 0 0 6px 2px lime;}
      #page-utilities .epeppi-panel-btn:hover {border-color: #e6b3ad; color: #b71c1c;}
      #page-utilities .epeppi-panel-btn[data-active="true"]:hover {color: inherit; filter: brightness(1.04);}
      #page-utilities .epeppi-panel-btn:empty {visibility: visible; background: #fafbfc !important; border: 1px dashed #e3e7eb; box-shadow: none; pointer-events: none;}
      #page-utilities .epeppi-panel-btn:empty::before {display: none;}
      /* informações relevantes */
      #page-utilities .add-info {margin: 0; align-self: flex-start;}
      #page-utilities #info-container {gap: 10px;}
      #page-utilities #info-container:empty {display: none;}
      #page-utilities .ri-card {padding: 12px 14px;}
      #page-utilities .ri-head {background: transparent; margin: 0 0 10px; padding: 0 0 8px; border-radius: 0; border-bottom: 1px solid #eef0f2; color: #2c3e50; font-size: 12px; letter-spacing: .4px;}
      #page-utilities .ri-head > span::before {content: ''; display: inline-block; width: 4px; height: 14px; border-radius: 3px; background: #c62828; margin-right: 8px; vertical-align: -2px;}
      #page-utilities .ri-head button {background: #dc3545; color: #fff; border: 0; border-radius: 6px; padding: 3px 10px; font-size: 10px; font-weight: 800;}
      #page-utilities .ri-head button:hover {filter: brightness(1.08);}
      #page-utilities .ri-row {margin-bottom: 8px;}
      #page-utilities .ri-row label, #page-utilities .cma-fields label {font-size: 10.5px; font-weight: 800; color: #6c757d; text-transform: uppercase; letter-spacing: .3px;}
      #page-utilities .ri-row input, #page-utilities .ri-row textarea {border: 1px solid #c8c8c8; border-radius: 6px; font-size: 12.5px;}
      #page-utilities .ri-btns {margin-top: 10px;}
      #page-utilities .ri-btns .btn {height: 30px; padding: 0 14px; font-size: 11px;}
      /* linhas de campos (cortes de vias, constrangimentos, relatórios) */
      #page-utilities #routes-container, #page-utilities #no-hosp {gap: 5px; padding: 0; margin: 0;}
      #page-utilities #ocrReport {gap: 5px 22px; padding: 0; margin: 0;}
      #page-utilities .nl {gap: 6px;}
      #page-utilities .nl > label {min-width: 26px; font-size: 11px; font-weight: 800; color: #8a949e;}
      #page-utilities .nl input, #page-utilities .nl select {height: 30px; padding: 0 9px; border: 1px solid #c8c8c8; border-radius: 6px; font-size: 12px; background: #fff;}
      #page-utilities .nl input:focus, #page-utilities .nl select:focus, #page-utilities .ri-row input:focus, #page-utilities .ri-row textarea:focus, #page-utilities .cma-fields input:focus,
      #page-utilities .cma-fields select:focus, #page-utilities #notification-to:focus, #page-utilities #notification-message:focus {border-color: #c62828 !important; box-shadow: 0 0 0 2px rgba(198,40,40,.12); outline: none;}
      #page-utilities .nl input[type=text]:not(:placeholder-shown) {background: #fffdf5; border-color: #e0c98a;}
      #page-utilities .nh-head {margin-bottom: 4px; padding: 0 0 6px; border-bottom: 1px solid #eef0f2;}
      #page-utilities .nh-head > div {font-size: 10.5px; font-weight: 800; color: #5b6670; letter-spacing: .4px;}
      #page-utilities .nh-head .box div {background: #f1f3f5; color: #5b6670; border-radius: 999px; font-size: 10.5px;}
      #page-utilities .nh-pair {gap: 4px;}
      /* centros de meios aéreos */
      #page-utilities #cma-container {gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr));}
      #page-utilities .cma-sw > span {background: #cfd4da;}
      #page-utilities .cma-sw input:checked + span {background: #2e7d32;}
      #page-utilities .cma-img {flex: 0 0 110px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px;}
      #page-utilities .cma-fields {gap: 6px;}
      #page-utilities .cma-fields label {width: 82px;}
      #page-utilities .cma-fields input, #page-utilities .cma-fields select {height: 28px; border: 1px solid #c8c8c8; border-radius: 6px;}
      #page-utilities .cma-fields input:disabled, #page-utilities .cma-fields select:disabled {background: #f4f6f8; color: #9aa3ad; border-color: #e3e7eb;}
      /* disponibilidade de elementos */
      #page-utilities #elems-container.list {gap: 6px; padding: 0;}
      #page-utilities .btn-elem {min-width: 54px; height: 36px; padding: 0 12px; border-radius: 9px; border: 1px solid transparent; font-size: 12.5px; font-weight: 800;}
      #page-utilities .btn-elem[style*="rgb(158, 158, 158)"] {background: #f1f3f5 !important; color: #5b6670 !important; border-color: #dfe3e7;}
      #page-utilities .btn-elem[style*="background-color: green"] {background: #2e7d32 !important; color: #fff !important;}
      #page-utilities .btn-elem[style*="background-color: red"] {background: #fdecea !important; color: #b71c1c !important; border-color: #f3c1bc; cursor: not-allowed;}
      #page-utilities .btn-elem:hover {transform: none; box-shadow: 0 2px 6px rgba(0,0,0,.12);}
      #page-utilities .btn-elem[style*="rgb(158, 158, 158)"]:hover {background: #fdf0ee !important; color: #b71c1c !important; border-color: #e6b3ad;}
      #page-utilities .btn-elem[style*="background-color: green"]:hover {background: #27692b !important; color: #fff !important;}
      #page-utilities .btn-elem[style*="background-color: red"]:hover {background: #fdecea !important; color: #b71c1c !important; box-shadow: none;}
      /* notificações e emails */
      #page-utilities .nt-to > label, #page-utilities .nt-msg > label {font-size: 10.5px; font-weight: 800; color: #6c757d; letter-spacing: .3px;}
      #page-utilities #notification-to {height: 30px; border: 1px solid #c8c8c8; border-radius: 6px;}
      #page-utilities #notification-message {border-color: #c8c8c8;}
      #page-utilities .nt-note {margin-top: 10px;}
      #page-utilities .nt-note label {color: #b71c1c;}
      #page-utilities .ml-card {margin-top: 0; padding: 0; border-color: #e9ecef; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
      #page-utilities .ml-type {border-radius: 999px; height: 28px; padding: 0 14px; font-weight: 700; color: #2c3e50; border-color: #d5dbe1;}
      #page-utilities .ml-type.on {background: #2c3e50; border-color: #2c3e50; color: #fff; font-weight: 800;}
      #page-utilities .ml-band {background: #f8f9fa; color: #8a949e; font-weight: 800;}
      #page-utilities #mail-message:focus {border-color: #c62828;}
    `;
    document.head.appendChild(st);
  })();

  /* ----------------------------- página ----------------------------- */
  const MENU = [['OPERACIONAL'], ['epe', 'Estados de EPE/PPI'], ['relev-info', 'Informações Relevantes'], ['interruption-roads-streets', 'Cortes de Vias/Arruamentos'],
                ['air-centers', 'Centros de Meios Aéreos'], ['analytics', 'Disponibilidade de Elementos'], ['nohosp', 'Constrangimentos Hospitalares'],
                ['ocrReport', 'Relatórios de Ocorrência'], ['nrbq-fni', 'Ficha NRBQ (FNI)'], ['COMUNICAÇÕES'], ['sendNotifications', 'Envio de Notificações'], ['sendMails', 'Envio de Emails']];
  const panel = (id, title, sub, body, active = false) => `<div id="panel-${id}" class="panel-card${active ? ' active' : ''}"><h3>${title}</h3><p>${sub}</p>${body}</div>`;
  const update = act => `<div class="action-buttons act"><button class="btn btn-success" data-act="${act}">ATUALIZAR</button></div>`;
  const mailLine = (id, label, ph) => `<div class="major-row ml-line"><label for="${id}">${label}</label><input type="text" id="${id}" placeholder="${ph}"></div>`;
  page.innerHTML = `
    <div class="major-card">
      <div class="major-card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1-2.83-2.83l-3.94 3.6z"/>
          <path d="M11.5 9.5l-7 7l-2 3l3-2l7-7"/><path d="M10 22L13 19"/><path d="M22 10l-3 3"/><path d="M12 12l-6-6"/><circle cx="12" cy="12" r="3"/></svg>
        CONSOLA DE UTILITÁRIOS
      </div>
      <div class="options-panel-container">
        <div class="panel-sidebar">${MENU.map(([id, text], i) => text === undefined
          ? `<div class="panel-group-title${i === 0 ? ' first' : ''}">${id}</div>`
          : `<button class="panel-sidebar-menu-button${id === 'epe' ? ' active' : ''}" data-panel="${id}">${text}</button>`).join('')}</div>
        <div class="panel-content">
          ${panel('epe', 'ESTADOS DE PRONTIDÃO ESPECIAL / PLANOS PRÉVIOS DE INTERVENÇÃO', 'Visão geral dos Estados de Prontidão Especial e Planos Prévios de Intervenção.',
                  '<div id="epe-container" class="data-grid"></div><div id="ppi-container" class="data-grid"></div>', true)}
          ${panel('relev-info', 'INFORMAÇÕES RELEVANTES', 'Informações de caráter relevante para conhecimento geral.',
                  '<button class="btn btn-success add-info" data-act="add-info">+ ADICIONAR INFORMAÇÃO</button><div id="info-container"></div>')}
          ${panel('interruption-roads-streets', 'CORTES DE VIAS E/OU ARRUAMENTOS', 'Vias ou Arruamentos impedidos ao trânsito (Obras, Eventos, Etc.)',
                  '<div class="options-main-card"><div id="routes-container"></div></div>' + update('routes').replace('class="action-buttons act"', 'class="action-buttons act" id="street-cut"'))}
          ${panel('air-centers', 'CENTROS DE MEIOS AÉREOS', "CMA's Ativos na Região.",
                  '<div id="cma-container" class="grid-3fr"></div>' + update('cmas').replace('class="action-buttons act"', 'class="action-buttons act cma" id="present-cmas"'))}
          ${panel('analytics', 'DISPONIBILIDADE DE ELEMENTOS', 'Elementos disponiveis para situações de exceção.', '<div class="options-main-card"><div id="elems-container" class="elems-container"></div></div>')}
          ${panel('nohosp', 'CONSTRANGIMENTOS HOSPITALARES', 'Serviços Hospitalares com Constrangimentos na Região.',
                  '<div class="options-main-card"><div id="no-hosp"></div></div>' + update('nohosp').replace('class="action-buttons act"', 'class="action-buttons act" id="nohosp"'))}
          ${panel('ocrReport', 'RELATÓRIOS DE OCORRÊNCIA', 'Relatórios de Ocorrência em incumprimento.', '<div class="options-main-card"><div id="ocrReport"></div></div>' + update('reports'))}
          ${panel('nrbq-fni', 'NRBQ — FICHA DE NOTIFICAÇÃO INICIAL (FNI)',
                  'Incidentes com suspeita ou envolvimento de agentes NRBQ (DON N.º 3). A ficha grava-se sozinha à medida que é preenchida e pode ser reaberta em "Fichas guardadas".', '<div id="nrbqFniBoard"></div>')}
          ${panel('sendNotifications', 'ENVIO DE NOTIFICAÇÕES', 'Envio interno de notificações: Utilizador para Utilizador, ou Utilizador para Geral.', `
            <div class="options-main-card">
              <div class="major-row"><div class="major-field nt-to"><label for="notification-to">PARA</label>
                <div><input type="text" id="notification-to" placeholder="000" maxlength="3" inputmode="numeric"><span class="req">*</span></div></div></div>
              <div class="major-row nt-row"><div class="major-field nt-msg"><label for="notification-to">NOTIFICAÇÃO</label><textarea id="notification-message" placeholder="Escreva a sua notificação..."></textarea></div></div>
              <div class="major-row nt-note"><label>*Caso a notificação seja para todos os elementos não preencher o campo.</label></div>
              <div id="sendNotifications" class="in5"></div>
            </div>
            <div class="action-buttons act"><button class="btn btn-success" data-act="notify">ENVIAR</button></div>`)}
          ${panel('sendMails', 'ENVIO DE EMAILS', 'Envio interno de notificações: Utilizador para Utilizador, ou Utilizador para Geral.', `
            <div class="options-main-card ml-card">
              <div class="ml-types"><span class="ml-cap">Tipo</span>
                <button type="button" class="ml-type on" id="mail-type-ro" data-mail-type="ro">RO's</button>
                <button type="button" class="ml-type" id="mail-type-outro" data-mail-type="outro">Outro</button>
                <input type="hidden" id="mail-type" value="ro"></div>
              <div class="ml-band">Destinatários</div>
              ${mailLine('mail-to', 'Para', 'nome@empresa.pt, ...')}${mailLine('mail-cc', 'CC', 'Opcional')}${mailLine('mail-bcc', 'BCC', 'Opcional')}${mailLine('mail-subject', 'Assunto', 'Assunto do email')}
              <div class="ml-band">Mensagem</div>
              <div class="major-row ml-box"><label for="mail-message">Corpo</label><textarea id="mail-message" placeholder="Escreva o corpo do seu email..."></textarea></div>
              <div class="major-row ml-box att"><label>Anexos</label>
                <div class="ml-att"><button type="button" class="btn btn-add" data-act="attach">+ Adicionar Ficheiro</button><input type="file" id="mail-attachments" multiple>
                  <span id="mail-attachments-count">Nenhum ficheiro selecionado</span></div>
                <div id="mail-attachments-list"></div>
              </div>
            </div>
            <div id="sendMails"><div class="action-buttons"><button class="btn btn-success" data-act="mail">ENVIAR</button></div></div>`)}
        </div>
      </div>
      <div class="major-card-footer"></div>
    </div>`;

  /* ----------------------------- navegação entre painéis ----------------------------- */
  function showPanel(id, btn) {
    page.querySelectorAll('.panel-card').forEach(c => c.classList.remove('active'));
    page.querySelectorAll('.panel-sidebar-menu-button').forEach(b => b.classList.remove('active'));
    $('panel-' + id).classList.add('active');
    btn?.classList.add('active');
    if (id === 'analytics') loadElemsButtons();
    if (id === 'nrbq-fni' && window.nrbqFniStart) window.nrbqFniStart();
  }

  /* =======================================================================
     ESTADOS EPE / PPI
     ======================================================================= */
  const EPE_LEVELS = ['MONITORIZAÇÃO', 'NÍVEL I', 'NÍVEL II', 'NÍVEL III', 'NÍVEL IV', ''];
  const EPE_CARDS = [{id: 'epe-decir', label: 'EPE SIOPS DECIR', buttons: EPE_LEVELS}, {id: 'epe-diops', label: 'EPE SIOPS DIOPS', buttons: EPE_LEVELS}, {id: 'epe-nrbq', label: 'EPE SIOPS NRBQ', buttons: EPE_LEVELS}];
  const PPI_CARDS = [{id: 'ppi-aero', label: 'PPI AEROPORTO', buttons: ['MONITORIZAÇÃO', 'AMARELO', 'VERMELHO', '', '', '']},
                     {id: 'ppi-a22', label: 'PPI A22', buttons: ['MONITORIZAÇÃO', '1º ALARME', '2º ALARME', 'ALARME ESPECIAL', '', '']},
                     {id: 'ppi-linfer', label: 'PPI LINHA FÉRREA', buttons: ['MONITORIZAÇÃO', '1º ALARME', '2º ALARME', 'ALARME ESPECIAL', '', '']}];
  const STATE_CLASS = {'MONITORIZAÇÃO': 's-monitor', 'NÍVEL I': 's-yellow', 'NÍVEL II': 's-orange', 'NÍVEL III': 's-red', 'NÍVEL IV': 's-critical',
                       'AMARELO': 's-yellow', 'VERMELHO': 's-red', '1º ALARME': 's-yellow', '2º ALARME': 's-orange', 'ALARME ESPECIAL': 's-critical'};
  const EPE_COLORS = [{bg: '#4CAF50', text: 'white'}, {bg: '#5B9BD5', text: 'white'}, {bg: '#FFD966', text: 'black'}, {bg: '#F4A460', text: 'black'}, {bg: '#E57373', text: 'white'}, {bg: '#D3D1C7', text: '#5F5E5A'}];
  const GREY = {bg: '#D3D1C7', text: '#5F5E5A'};
  const COLORS = {'epe-decir': EPE_COLORS, 'epe-diops': EPE_COLORS, 'epe-nrbq': EPE_COLORS,
                  'ppi-aero': [{bg: '#4CAF50', text: 'white'}, {bg: '#FFD966', text: 'black'}, {bg: '#E57373', text: 'white'}, GREY, GREY, GREY],
                  'ppi-a22': [{bg: '#4CAF50', text: 'white'}, {bg: '#FFD966', text: 'black'}, {bg: '#F4A460', text: 'black'}, {bg: '#E57373', text: 'white'}, GREY, GREY]};
  COLORS['ppi-linfer'] = COLORS['ppi-a22'];
  const paint = (btn, c, on) => { btn.style.backgroundColor = c ? c.bg : 'lightgrey'; btn.style.color = c ? c.text : 'black'; btn.dataset.active = on ? 'true' : 'false'; };
  $('epe-container').innerHTML = EPE_CARDS.map(epeCard).join('');
  $('ppi-container').innerHTML = PPI_CARDS.map(epeCard).join('');
  function epeCard(c) {
    return `<div class="options-main-card epe-card"><span class="data-value">${c.label}</span>
      <div class="button-container" id="${c.id}">${c.buttons.map((t, i) => `<button class="epeppi-panel-btn" data-i="${i}">${t}</button>`).join('')}</div></div>`;
  }
  async function epeLoad() {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/epe_status?corp_oper_nr=eq.${corp()}`, {method: 'GET', headers: hdrCorp()});
      if (!resp.ok) throw new Error(`Erro ao ler EPE: ${resp.status}`);
      (await resp.json()).forEach(row => {
        const box = $(row.epe_type);
        if (!box) return;
        box.querySelectorAll('.epeppi-panel-btn').forEach((btn, i) => {
          if (btn.textContent.trim() === row.epe) {
            paint(btn, COLORS[row.epe_type][i], true);
            if (STATE_CLASS[row.epe]) btn.classList.add(STATE_CLASS[row.epe]);
          } else {
            paint(btn, null, false);
            if (btn.textContent.trim()) btn.classList.add('inactive');
          }
        });
      });
    } catch (e) {
      console.error('❌ Erro ao carregar estados EPE:', e);
    }
  }
  async function epeSave(type, value) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/epe_status?epe_type=eq.${encodeURIComponent(type)}&corp_oper_nr=eq.${corp()}`, {
        method: 'PATCH', headers: hdrCorp({returnRepresentation: true}), body: JSON.stringify({epe: value, corp_oper_nr: corp()})
      });
      if (!resp.ok) { console.error('❌ Erro RLS ao atualizar EPE:', resp.status); return false; }
      const rows = await resp.json().catch(() => []);
      if (!Array.isArray(rows) || rows.length === 0) { console.error('❌ EPE: nenhuma linha atualizada para', type); return false; }
      return true;
    } catch (e) {
      console.error('❌ Erro na requisição EPE:', e);
      return false;
    }
  }
  function epeClick(btn) {
    const box = btn.closest('.button-container'), type = box.id, value = btn.textContent.trim(), cls = STATE_CLASS[value];
    /* 1) aspeto (classes) */
    if (value && cls) {
      const wasActive = btn.classList.contains(cls);
      box.querySelectorAll('.epeppi-panel-btn').forEach(b => { b.className = 'epeppi-panel-btn'; });
      if (!wasActive) {
        btn.classList.add(cls);
        box.querySelectorAll('.epeppi-panel-btn').forEach(b => { if (b !== btn && b.textContent.trim()) b.classList.add('inactive'); });
      }
    }
    /* 2) cores + gravar */
    box.querySelectorAll('.epeppi-panel-btn').forEach(b => paint(b, null, false));
    paint(btn, COLORS[type][+btn.dataset.i], true);
    epeSave(type, value).then(ok => {
      if (ok) showPopup('popup-success', `Estado do <b>${type.toUpperCase()}</b>, atualizado para <b>${value}</b>.`);
      else { showPopup('popup-danger', `Não foi possível gravar o estado do <b>${type.toUpperCase()}</b>.`); epeLoad(); }
    });
  }

  /* =======================================================================
     INFORMAÇÕES RELEVANTES
     ======================================================================= */
  let infoCount = 0;
  function addInfoCard() {
    const n = pad(++infoCount);
    $('info-container').insertAdjacentHTML('beforeend', `
      <div class="options-main-card ri-card" id="relev-info-${n}">
        <div class="ri-head"><span>INFO ${n}</span><button data-act="info-remove">REMOVER</button></div>
        <div class="ri-row"><label>DE:</label><input type="text" id="from-${n}"></div>
        <div class="ri-row"><label>PARA:</label><input type="text" id="to-${n}"></div>
        <div class="ri-row top"><label>INFO:</label><textarea id="info-${n}" placeholder="Escreva a info..."></textarea></div>
        <div class="ri-btns"><button class="btn btn-danger" data-act="info-clear" data-n="${n}">LIMPAR</button><button class="btn btn-success" data-act="info-save" data-n="${n}">EMITIR</button></div>
      </div>`);
  }
  async function loadInfosFromSupabase() {
    if (!corp()) return console.error('❌ currentCorpOperNr não definido!');
    try {
      $('info-container').innerHTML = '';
      infoCount = 0;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/infos_select?select=id,group_nr,from,destination,info&corp_oper_nr=eq.${corp()}&order=group_nr.asc`, {method: 'GET', headers: hdrCorp()});
      if (!res.ok) throw new Error(await res.text());
      let rows = await res.json();
      if (!rows || rows.length === 0) {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/infos_select`, {method: 'POST', headers: {...hdrCorp(), 'Prefer': 'return=representation'},
          body: JSON.stringify([1, 2, 3, 4].map(n => ({corp_oper_nr: corp(), group_nr: n, from: '', destination: '', info: ''})))});
        if (!r.ok) throw new Error(await r.text());
        rows = await r.json();
      }
      rows.forEach(row => {
        if (![row.from, row.destination, row.info].some(v => v && v.trim() !== '')) return;
        addInfoCard();
        const n = pad(infoCount);
        $(`relev-info-${n}`).dataset.rowId = row.id;
        $(`from-${n}`).value = row.from || '';
        $(`to-${n}`).value = row.destination || '';
        $(`info-${n}`).value = row.info || '';
      });
    } catch (e) {
      console.error('❌ Erro no loadInfosFromSupabase:', e);
    }
  }
  async function saveInfo(n) {
    const group = $(`relev-info-${n}`);
    if (!group || !corp()) return;
    let rowId = group.dataset.rowId;
    try {
      if (!rowId) {
        const d = await (await fetch(`${SUPABASE_URL}/rest/v1/infos_select?select=id&corp_oper_nr=eq.${corp()}&group_nr=eq.${parseInt(n, 10)}`, {method: 'GET', headers: hdrCorp()})).json();
        if (d.length > 0) rowId = group.dataset.rowId = d[0].id;
      }
      if (!rowId) return console.error(`⚠️ Sem rowId para relev-info-${n}`);
      const r = await fetch(`${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {method: 'PATCH', headers: {...hdrCorp(), 'Prefer': 'return=representation'},
        body: JSON.stringify({from: $(`from-${n}`).value || '', destination: $(`to-${n}`).value || '', info: $(`info-${n}`).value || '', corp_oper_nr: corp()})});
      if (!r.ok) throw new Error(await r.text());
      showPopup('popup-success', `A informação ${n} foi atualizada com sucesso.`, false);
    } catch (e) {
      console.error('❌ Erro ao salvar info:', e);
      showPopup('popup-danger', `Erro ao gravar a informação ${n}.`);
    }
  }
  async function clearInfo(n) {
    const group = $(`relev-info-${n}`);
    if (!group || !corp()) return;
    const rowId = group.dataset.rowId;
    if (!rowId) return console.error(`⚠️ Sem rowId para limpar relev-info-${n}`);
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/infos_select?id=eq.${rowId}`, {method: 'PATCH', headers: {...hdrCorp(), 'Prefer': 'return=representation'},
        body: JSON.stringify({from: '', destination: '', info: '', corp_oper_nr: corp()})});
      if (!r.ok) throw new Error(await r.text());
      ['from', 'to', 'info'].forEach(k => { $(`${k}-${n}`).value = ''; });
      showPopup('popup-success', `A informação ${n} foi limpa com sucesso.`);
    } catch (e) {
      console.error('❌ Erro ao limpar info:', e);
      showPopup('popup-danger', `Erro ao limpar a informação ${n}.`);
    }
  }

  /* =======================================================================
     CORTES DE VIAS
     ======================================================================= */
  function createRoutes(total = 12) {
    $('routes-container').innerHTML = Array.from({length: total}, (_, i) => { const n = pad(i + 1); return `<div class="nl"><label>${n}:</label>
      <input type="text" id="route-${n}-name" placeholder="Indique a via ou Arruamento" style="flex:2.5"><input type="text" id="route-${n}-motive" placeholder="Indique o motivo" style="flex:1.5">
      <input type="text" id="route-${n}-until" placeholder="Indique a previsão de términus" style="flex:1"></div>`; }).join('');
  }
  async function loadRoutesFromSupabase(total = 12) {
    createRoutes(total);
    if (!corp()) return console.error('❌ [ROUTES] currentCorpOperNr não definido!');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/street_cut?select=id,group_nr,street_name,cut_motive,cut_until&corp_oper_nr=eq.${corp()}&order=group_nr.asc`, {method: 'GET', headers: hdrCorp()});
      if (!res.ok) throw new Error(await res.text());
      (await res.json()).forEach(row => {
        const n = pad(row.group_nr), name = $(`route-${n}-name`), motive = $(`route-${n}-motive`), until = $(`route-${n}-until`);
        if (!name || !motive || !until) return;
        name.dataset.rowId = row.id;
        name.dataset.groupNr = row.group_nr;
        name.value = row.street_name || '';
        motive.value = row.cut_motive || '';
        until.value = row.cut_until || '';
      });
    } catch (e) {
      console.error('❌ [ROUTES] Erro ao carregar:', e);
    }
  }
  async function saveRoutes(total = 12) {
    if (!corp()) return showPopup('popup-danger', 'Erro: Sessão não identificada.');
    try {
      const headers = hdrCorp();
      for (let i = 1; i <= total; i++) {
        const n = pad(i), name = $(`route-${n}-name`);
        if (!name) continue;
        const data = {street_name: name.value.trim(), cut_motive: $(`route-${n}-motive`).value.trim(), cut_until: $(`route-${n}-until`).value.trim()};
        let rowId = name.dataset.rowId;
        if (!rowId) {
          const d = await (await fetch(`${SUPABASE_URL}/rest/v1/street_cut?select=id&corp_oper_nr=eq.${corp()}&group_nr=eq.${i}`, {headers})).json();
          if (d.length > 0) rowId = name.dataset.rowId = d[0].id;
        }
        if (!rowId) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/street_cut`, {method: 'POST', headers: {...headers, 'Prefer': 'return=representation'},
            body: JSON.stringify([{corp_oper_nr: corp(), group_nr: i, ...data}])});
          await checkRes(r, `Erro ao criar a via ${n}`);
          name.dataset.rowId = (await r.json())[0].id;
        } else {
          await checkRes(await fetch(`${SUPABASE_URL}/rest/v1/street_cut?id=eq.${rowId}`, {method: 'PATCH', headers, body: JSON.stringify({...data, corp_oper_nr: corp()})}), `Erro ao atualizar a via ${n}`);
        }
      }
      showPopup('popup-success', 'Cortes/Interrompimento de Vias atualizados com sucesso!');
      loadRoutesFromSupabase(total);
    } catch (error) {
      console.error('❌ [ROUTES] Erro ao gravar:', error);
      showPopup('popup-danger', 'Erro ao gravar Cortes/Interrompimento de Vias. ' + (error.message || ''));
    }
  }

  /* =======================================================================
     CENTROS DE MEIOS AÉREOS
     ======================================================================= */
  const CMA_NAMES = ['BHSP LOULÉ', 'CMA S.B. ALPORTEL', 'CMA CACHOPO', 'CMA MONCHIQUE', 'AERODROMO PORTIMÃO', '-'];
  const AIRCRAFT = ['Heli Ligeiro', 'Heli Médio', 'Heli Pesado', 'Avião de Asa Fixa Médio', 'Avião de Asa Fixa Pesado'];
  const IMG = {'Heli Ligeiro': 'heli_ligeiro.jpg', 'Heli Médio': 'heli_medio.jpg', 'Heli Pesado': 'heli_pesado.jpg', 'Avião de Asa Fixa Médio': 'aviao_asa_fixa_medio.jpg', 'Avião de Asa Fixa Pesado': 'aviao_asa_fixa_pesado.png'};
  const imgOf = t => IMG[t] ? `https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/${IMG[t]}` : 'https://i.imgur.com/4Ho5HRV.png';
  function createCmas() {
    $('cma-container').innerHTML = CMA_NAMES.map((name, i) => { const id = pad(i + 1); return `
      <div class="options-main-card">
        <div class="data-value cma-name"><span>${name}</span><label class="cma-sw"><input type="checkbox" id="cma_toggle_${id}" data-cma="${id}"><span><span></span></span></label></div>
        <div class="cma-body">
          <div class="cma-img"><img id="cma_image_${id}" src="${imgOf('')}" alt="Foto CMA"></div>
          <div class="cma-fields">
            <div><label>AERONAVE:</label><input id="cma_aero_type_${id}" type="text" disabled></div>
            <div><label>TIPOLOGIA:</label><select id="cma_type_${id}" disabled data-img="${id}">${['Selecionar...', ...AIRCRAFT].map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>
            <div><label>AUTONOMIA:</label><input id="cma_auto_${id}" type="text" disabled></div>
          </div>
        </div>
      </div>`; }).join('');
  }
  function toggleCma(id, on) {
    const f = ['cma_aero_type_', 'cma_type_', 'cma_auto_'].map(p => $(p + id)), toggle = $(`cma_toggle_${id}`);
    if (f.some(x => !x) || !toggle) return;
    f.forEach(x => { x.disabled = !on; if (!on) x.value = ''; });
    toggle.checked = on;
  }
  async function loadCMAsFromSupabase() {
    try {
      createCmas();
      if (!corp()) return console.error('❌ Erro: currentCorpOperNr não encontrado!');
      const res = await fetch(`${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corp()}&order=id.asc`, {method: 'GET', headers: hdrCorp()});
      if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
      const data = await res.json();
      if (data.length === 0) return console.warn('⚠️ O banco devolveu 0 linhas para a corp:', corp());
      data.forEach((row, i) => {
        const n = pad(i + 1), name = $(`cma_aero_type_${n}`), type = $(`cma_type_${n}`), auto = $(`cma_auto_${n}`);
        if (name) { name.value = row.aero_name || ''; name.dataset.rowId = row.id; }
        if (type) { type.value = row.aero_type || ''; $(`cma_image_${n}`).src = imgOf(row.aero_type); }
        if (auto) auto.value = row.aero_autonomy || '';
        if (row.is_active) toggleCma(n, true);
      });
    } catch (error) {
      console.error('❌ Erro no load:', error);
    }
  }
  async function saveCmas() {
    try {
      if (!corp()) return showPopup('popup-danger', 'Erro: Sessão expirada. Faça login novamente.');
      for (let i = 1; i <= 6; i++) {
        const n = pad(i), name = $(`cma_aero_type_${n}`);
        if (!name || !name.dataset.rowId) continue;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/air_centers?id=eq.${name.dataset.rowId}`, {method: 'PATCH', headers: hdrCorp(),
          body: JSON.stringify({aero_name: name.value || '', aero_type: $(`cma_type_${n}`).value || '', aero_autonomy: $(`cma_auto_${n}`).value || '',
                                is_active: $(`cma_toggle_${n}`)?.checked || false, corp_oper_nr: corp()})});
        if (!res.ok) {
          console.error(`❌ Erro no Card ${n}:`, (await res.json()).message);
          throw new Error(`Falha ao gravar card ${n}`);
        }
      }
      showPopup('popup-success', 'Centros de Meios Aéreos atualizados com sucesso!');
      loadCMAsFromSupabase();
    } catch (error) {
      console.error('❌ Erro fatal na gravação:', error);
      showPopup('popup-danger', 'Ocorreu um erro ao guardar os dados. Verifique a consola.');
    }
  }

  /* =======================================================================
     DISPONIBILIDADE DE ELEMENTOS
     ======================================================================= */
  const elemStyle = (btn, row) => {
    const [bg, fg] = row.elem_state === false ? ['red', 'white'] : row.situation === 'available' ? ['green', 'white'] : ['rgb(158, 158, 158)', 'black'];
    btn.style.backgroundColor = bg;
    btn.style.color = fg;
  };
  async function loadElemsButtons() {
    const box = $('elems-container');
    const msg = t => { box.classList.remove('list'); box.style.display = 'block'; box.innerHTML = `<div class="msg">${t}</div>`; };
    try {
      if (!corp()) return msg('<i class="fa-solid fa-triangle-exclamation"></i> Nenhuma corporação selecionada. Selecione uma corporação para visualizar os elementos.');
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=*&corp_oper_nr=eq.${corp() || '0805'}`, {method: 'GET', headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
      const elems = (await res.json()).filter(e => { const v = parseInt(e.n_int, 10); return !((v >= 900 && v <= 999) || (v >= 9000 && v <= 9999)); })
        .sort((a, b) => { const x = a.n_int ?? '', y = b.n_int ?? ''; return !isNaN(x) && !isNaN(y) ? Number(x) - Number(y) : x.toString().localeCompare(y.toString(), 'pt', {numeric: true}); });
      if (!elems.length) return msg('<i class="fa-solid fa-ban"></i> Não existem elementos registados para esta corporação.');
      box.innerHTML = '';
      box.style.display = '';
      box.classList.add('list');
      elems.forEach(row => {
        const btn = document.createElement('button');
        btn.className = 'btn-elem';
        btn.textContent = row.n_int || row.id;
        btn.dataset.tooltip = row.elem_state === false ? '' : row.abv_name || '';
        btn.disabled = row.elem_state === false;
        elemStyle(btn, row);
        btn.addEventListener('click', () => toggleElem(row, btn));
        box.appendChild(btn);
      });
    } catch (error) {
      console.error('❌ Erro ao carregar elementos:', error);
    }
  }
  async function toggleElem(row, btn) {
    if (row.elem_state === false) return;
    const situation = row.situation === 'available' ? 'unavailable' : 'available';
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${encodeURIComponent(row.n_int)}&corp_oper_nr=eq.${corp()}`, {
        method: 'PATCH', headers: getSupabaseHeaders({returnRepresentation: true}), body: JSON.stringify({situation})
      });
      if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);
      row.situation = situation;
      elemStyle(btn, row);
    } catch (err) {
      console.error('❌ Erro ao atualizar situação:', err);
      showPopup('popup-danger', 'Erro ao atualizar situação.');
    }
  }

  /* =======================================================================
     CONSTRANGIMENTOS HOSPITALARES
     ======================================================================= */
  const noHospSig = r => [r.hospital, r.service, r.start_date, r.start_time, r.end_date, r.end_time, r.next_hospital]
    .map(v => (v == null ? '' : String(v).slice(0, v && /^\d{2}:\d{2}/.test(String(v)) ? 5 : undefined))).join('|');
  function createNoHosp(total) {
    $('no-hosp').innerHTML = `
      <div class="nh-head"><div style="min-width:25px"></div><div style="flex:2">Hospital</div><div style="flex:2">Serviço</div>
        <div class="box" style="flex:1.8"><div style="margin-left:7px">Início</div></div><div class="box" style="flex:1.8"><div style="margin-right:7px">Fim</div></div>
        <div style="flex:1.5">Referência</div></div>` +
      Array.from({length: total}, (_, i) => { const n = pad(i + 1); return `<div class="nl"><label>${n}:</label>
        <input type="text" id="nohosp-${n}" placeholder="Local/Ref." style="flex:2"><input type="text" id="nohosp-serv-${n}" placeholder="Serviço" style="flex:2">
        <div class="nh-pair" style="flex:1.8"><input type="date" id="nohosp-form-date-${n}" style="flex:1"><input type="time" id="nohosp-form-time-${n}" style="flex:0.7"></div>
        <div class="nh-pair" style="flex:1.8"><input type="date" id="nohosp-to-date-${n}" style="flex:1"><input type="time" id="nohosp-to-time-${n}" style="flex:0.7"></div>
        <input type="text" id="nextHosp-${n}" placeholder="Próximo Hosp." style="flex:1.5"></div>`; }).join('');
  }
  const NH = {hospital: 'nohosp-', service: 'nohosp-serv-', start_date: 'nohosp-form-date-', start_time: 'nohosp-form-time-', end_date: 'nohosp-to-date-', end_time: 'nohosp-to-time-', next_hospital: 'nextHosp-'};
  async function loadNoHospFromSupabase(total = 12) {
    createNoHosp(total);
    if (!corp()) return console.error('❌ [NOHOSP] CorpOperNr não definido!');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions?select=*&corp_oper_nr=eq.${corp()}&order=group_nr.asc`, {method: 'GET', headers: hdrCorp()});
      if (!res.ok) throw new Error(await res.text());
      (await res.json()).forEach(row => {
        const n = pad(row.group_nr), main = $(`nohosp-${n}`);
        if (!main) return;
        main.dataset.rowId = row.id;
        Object.entries(NH).forEach(([k, p]) => { $(p + n).value = row[k] || ''; });
        main.dataset.orig = noHospSig(row);   /* o que está gravado, para saber depois o que mudou */
      });
    } catch (e) {
      console.error('❌ [NOHOSP] Erro ao carregar:', e);
    }
  }
  async function saveNoHosp(total = 12) {
    if (!corp()) return showPopup('popup-danger', 'Erro: Sessão não identificada.');
    try {
      const headers = hdrCorp(), novos = [];   /* hospitais com constrangimento novo ou alterado (para o push) */
      for (let i = 1; i <= total; i++) {
        const n = pad(i), main = $(`nohosp-${n}`);
        if (!main || main.value.trim() === '') continue;
        const val = id => { const v = $(id)?.value.trim(); return v ? v : null; };
        const payload = {corp_oper_nr: corp(), group_nr: i, hospital: main.value.trim()};
        Object.entries(NH).slice(1).forEach(([k, p]) => { payload[k] = val(p + n); });
        let rowId = main.dataset.rowId;
        if (!rowId) {
          const d = await (await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions?select=id&corp_oper_nr=eq.${corp()}&group_nr=eq.${i}`, {headers})).json();
          if (d && d.length > 0) rowId = d[0].id;
        }
        if (rowId && main.dataset.orig === noHospSig(payload)) continue;   /* nada mudou nesta linha */
        const res = !rowId
          ? await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions`, {method: 'POST', headers: {...headers, 'Prefer': 'return=representation'}, body: JSON.stringify([payload])})
          : await fetch(`${SUPABASE_URL}/rest/v1/hospital_restrictions?id=eq.${rowId}`, {method: 'PATCH', headers, body: JSON.stringify(payload)});
        if (!res.ok) throw new Error(await res.text());
        novos.push(payload.service ? `${payload.hospital} (${payload.service})` : payload.hospital);
      }
      /* push geral para a Mobile (abre a página dos constrangimentos); não espera pelo envio */
      if (novos.length) {
        fetch(PUSH_API, {method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({recipient_nint: 'geral', tipo: 'aviso', pagina: 'NoHospital', sender_name: 'CB360 Online', message_text: `🏥 Constrangimento hospitalar: ${novos.join(', ')}`})
        }).catch(e => console.error('Erro Push:', e));
      }
      showPopup('popup-success', 'Constrangimentos hospitalares atualizados com sucesso.');
      loadNoHospFromSupabase(total);
    } catch (error) {
      console.error('❌ [NOHOSP] Erro ao gravar:', error);
      showPopup('popup-danger', 'Erro ao gravar constrangimentos hospitalares.');
    }
  }

  /* =======================================================================
     RELATÓRIOS DE OCORRÊNCIA EM FALTA
     ======================================================================= */
  function createReports(total) {
    $('ocrReport').innerHTML = Array.from({length: total}, (_, i) => { const n = pad(i + 1); return `<div class="nl"><label>${n}:</label>
      <input type="text" id="report-${n}-nint" placeholder="Nº Int." style="flex:1"><input type="text" id="report-${n}-nr" placeholder="Nr. SADO" style="flex:1">
      <input type="date" id="report-${n}-date" style="flex:1.2">
      <select id="report-${n}-status" style="flex:1"><option value="">Estado</option><option value="done">Efetuado</option><option value="pending">Por Efetuar</option></select></div>`; }).join('');
  }
  async function loadocrReportsFromSupabase(total = 24) {
    createReports(total);
    if (!corp()) return showPopup('popup-danger', 'Erro: Sessão não identificada.');
    try {
      const raw = await (await fetch(`${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${corp()}&order=report_date.desc`, {headers: getSupabaseHeaders()})).text();
      const data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) { console.error('Resposta inválida:', data); return showPopup('popup-danger', 'Erro ao carregar dados.'); }
      data.slice(0, total).forEach((r, i) => {
        const n = pad(i + 1);
        $(`report-${n}-nint`).value = r.n_int ?? '';
        $(`report-${n}-nr`).value = r.report_nr ?? '';
        $(`report-${n}-date`).value = r.report_date ? String(r.report_date).slice(0, 10) : '';
        $(`report-${n}-status`).value = r.report_state === true ? 'done' : 'pending';
      });
    } catch (err) {
      console.error('Erro ao carregar OCR reports:', err);
      showPopup('popup-danger', 'Erro de ligação ao servidor.');
    }
  }
  async function saveReports(total = 24) {
    const c = corp();
    if (!c) return showPopup('popup-danger', 'Erro: Corporação não identificada.');
    const corp_oper_nr = c.toString().padStart(4, '0'), headers = getSupabaseHeaders();
    const norm = s => (s || '').toString().trim();
    const key = r => `${r.corp_oper_nr}|${r.n_int}|${norm(r.report_nr).toLowerCase()}|${r.report_date || ''}`;
    try {
      const form = new Map();
      for (let i = 1; i <= total; i++) {
        const n = pad(i), v = k => norm($(`report-${n}-${k}`)?.value);
        const nint = v('nint'), nr = v('nr'), date = v('date'), status = v('status');
        if (!nint && !nr && !date && !status) continue;
        const n_int = nint ? parseInt(nint, 10) : null;
        if (!Number.isInteger(n_int)) continue;
        const r = {corp_oper_nr, n_int, report_nr: nr || null, report_date: date || null, report_state: status === 'done'};
        form.set(key(r), r);
      }
      if (!form.size) return showPopup('popup-danger', 'Sem registos para guardar.');
      const raw = await (await fetch(`${SUPABASE_URL}/rest/v1/reports_control?select=n_int,report_nr,report_date,report_state&corp_oper_nr=eq.${corp_oper_nr}`, {headers})).text();
      const existing = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(existing)) { console.error('Existing inválido:', existing); return showPopup('popup-danger', 'Erro ao validar dados existentes.'); }
      const old = new Map(existing.map(r => [key({corp_oper_nr, n_int: r.n_int, report_nr: r.report_nr || null, report_date: r.report_date ? new Date(r.report_date).toISOString().split('T')[0] : null}),
                                             r.report_state === true]));
      const toInsert = [], toUpdate = [];
      for (const r of form.values()) {
        if (!old.has(key(r))) toInsert.push(r);
        else if (old.get(key(r)) !== (r.report_state === true)) toUpdate.push(r);
      }
      if (!toInsert.length && !toUpdate.length) return showPopup('popup-danger', 'Sem alterações para guardar.');
      if (toInsert.length) {
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/reports_control`, {method: 'POST', headers: {...headers, 'Content-Type': 'application/json', Prefer: 'return=representation'}, body: JSON.stringify(toInsert)});
        if (!ins.ok) { console.error('Erro INSERT reports_control:', await ins.text()); return showPopup('popup-danger', 'Erro ao inserir novos registos.'); }
      }
      for (const r of toUpdate) {
        const url = `${SUPABASE_URL}/rest/v1/reports_control?corp_oper_nr=eq.${corp_oper_nr}&n_int=eq.${r.n_int}&report_nr=eq.${encodeURIComponent(r.report_nr || '')}&report_date=eq.${r.report_date || ''}`;
        const upd = await fetch(url, {method: 'PATCH', headers: {...headers, 'Content-Type': 'application/json'}, body: JSON.stringify({report_state: r.report_state === true})});
        if (!upd.ok) { console.error('Erro UPDATE reports_control:', await upd.text(), 'URL:', url); return showPopup('popup-danger', 'Erro ao atualizar registos.'); }
      }
      /* aviso (notificação + push) a quem tem relatórios pendentes */
      try {
        const nints = [...new Set([...toInsert, ...toUpdate].map(r => r.n_int).filter(Number.isInteger))];
        if (nints.length) {
          const now = new Date().toISOString(), msg = `⚠️ ATENÇÃO! Tem Relatórios de Ocorrência Pendentes. Consulte o menú "Relatórios de Ocorrência".`;
          const nr = await fetch(`${SUPABASE_URL}/rest/v1/user_notifications`, {method: 'POST', headers: {...headers, 'Content-Type': 'application/json'},
            body: JSON.stringify(nints.map(n_int => ({n_int, corp_oper_nr, title: 'Relatórios de Ocorrência', message: msg, is_read: false, created_at: now})))});
          if (!nr.ok) console.error('Erro ao inserir user_notifications:', await nr.text());
          nints.forEach(n => fetch(PUSH_API, {method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({recipient_nint: n.toString(), tipo: 'aviso', pagina: 'MissReport', sender_name: 'CB360 Online', message_text: msg})
          }).catch(e => console.error('Erro ao enviar push (nint=' + n + '):', e)));
        }
      } catch (e) {
        console.error('Erro no fluxo de notificações:', e);
      }
      showPopup('popup-success', `Relatórios de Ocorrência Guardados! Novos: ${toInsert.length} | Atualizados: ${toUpdate.length}`);
    } catch (err) {
      console.error('Erro geral save OCR reports:', err);
      showPopup('popup-danger', 'Erro de ligação ao servidor.');
    }
  }

  /* ----------------------------- eventos ----------------------------- */
  const ACTS = {
    'add-info': () => addInfoCard(), 'info-remove': b => b.closest('.options-main-card').remove(), 'info-clear': b => clearInfo(b.dataset.n), 'info-save': b => saveInfo(b.dataset.n),
    routes: () => saveRoutes(), cmas: () => saveCmas(), nohosp: () => saveNoHosp(), reports: () => saveReports(20),
    notify: () => sendNotification(), mail: b => sendMail(b), attach: () => $('mail-attachments').click()
  };
  page.addEventListener('click', e => {
    const menu = e.target.closest('.panel-sidebar-menu-button[data-panel]');
    if (menu) return showPanel(menu.dataset.panel, menu);
    const epe = e.target.closest('.epeppi-panel-btn');
    if (epe) return epeClick(epe);
    const mt = e.target.closest('[data-mail-type]');
    if (mt) return selectMailType(mt, mt.dataset.mailType);
    const b = e.target.closest('[data-act]');
    if (b && ACTS[b.dataset.act]) ACTS[b.dataset.act](b);
  });
  page.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.cma) toggleCma(t.dataset.cma, t.checked);
    else if (t.dataset.img) $(`cma_image_${t.dataset.img}`).src = imgOf(t.value);
    else if (t.id === 'mail-attachments') updateAttachmentsList();
  });
  $('notification-to').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3); });
  $('notification-message').addEventListener('keydown', e => { if (e.key === 'Enter') e.stopPropagation(); });

  /* ----------------------------- globais e arranque ----------------------------- */
  Object.assign(window, {loadInfosFromSupabase, loadRoutesFromSupabase, loadCMAsFromSupabase, loadElemsButtons, loadNoHospFromSupabase, loadocrReportsFromSupabase});
  document.addEventListener('DOMContentLoaded', () => {
    epeLoad();
    loadRoutesFromSupabase();
    loadCMAsFromSupabase();
    loadElemsButtons();
    document.querySelectorAll('.sidebar-menu-button').forEach(btn => btn.addEventListener('click', () => { if (btn.dataset.page === 'page-utilities') epeLoad(); }));
  });
})();


    /* =====================================================================
    CB360 ONLINE — NRBQ: FICHA DE NOTIFICAÇÃO INICIAL (FNI)
    ===================================================================== */
    (function () {
      const SPEC = {"page": "NRBQ_FNI", "short": "FNI", "title": "NOTIFICAÇÃO INICIAL", "sub": "NRBQ · DON N.º 3", "pdfTitle": "FICHA DE NOTIFICAÇÃO INICIAL (FNI) — INCIDENTES COM SUSPEITA OU ENVOLVIMENTO DE AGENTES NRBQ", "file": "FNI_NRBQ", "icon": "campaign", "sections": [{"t": "Informação Geral", "i": "assignment", "f": [{"k": "ocorrencia", "l": "N.º Ocorrência ANEPC", "type": "text", "req": 1}, {"k": "data_notif", "l": "Data da Notificação", "type": "date", "req": 1, "now": 1, "half": 1}, {"k": "hora_notif", "l": "Hora da Notificação", "type": "time", "req": 1, "now": 1, "half": 1}, {"k": "operador", "l": "Nome do Operador (recetor)", "type": "text", "req": 1}, {"k": "emissor_id", "l": "Emissor da Notificação — Identificação", "type": "text", "req": 1}, {"k": "emissor_contactos", "l": "Emissor da Notificação — Contactos", "type": "text", "ph": "Telefone / email"}]}, {"t": "Informação Relativa ao Incidente", "i": "place", "f": [{"k": "data_inc", "l": "Data do Incidente", "type": "date", "half": 1}, {"k": "hora_inc", "l": "Hora do Incidente", "type": "time", "half": 1}, {"k": "data_obs", "l": "Data de Observação", "type": "date", "half": 1}, {"k": "hora_obs", "l": "Hora de Observação", "type": "time", "half": 1}, {"k": "local", "l": "Local / Concelho / Distrito", "type": "text", "req": 1}, {"k": "referencia", "l": "Ponto de Referência", "type": "text"}, {"k": "coordenadas", "l": "Coordenadas (Datum / Lat-Long)", "type": "gps"}, {"k": "onde", "l": "Onde ocorreu o incidente?", "type": "select", "opts": ["Via Pública", "Edifício"], "req": 1}]}, {"t": "1. Via Pública", "i": "add_road", "showIf": ["onde", "Via Pública"], "f": [{"k": "estrada", "l": "Estrada (km / sentido)", "type": "text"}, {"k": "arruamento", "l": "Arruamento (n.º Polícia / Porta e Sentido)", "type": "text"}, {"k": "ferrovia", "l": "Linha Ferroviária (km / pk / sentido)", "type": "text"}, {"k": "outra_ref", "l": "Outra referência do Local", "type": "text"}, {"k": "localidade", "l": "Localidade (exata ou a mais próxima)", "type": "text"}]}, {"t": "2. Edifício", "i": "apartment", "showIf": ["onde", "Edifício"], "f": [{"k": "estab_id", "l": "Identificação do Estabelecimento", "type": "text"}, {"k": "estab_morada", "l": "Morada", "type": "text"}, {"k": "estab_tipo", "l": "Tipo de Estabelecimento", "type": "select", "opts": ["Comércio", "Indústria", "Armazém", "Interface marítimo", "Interface rodoviário", "Interface ferroviário", "Aeroporto", "Habitação", "Escritórios", "Saúde", "Escola", "Lar", "Outro"]}, {"k": "estab_outro", "l": "Outro — especifique", "type": "text", "showIf": ["estab_tipo", "Outro"]}]}, {"t": "3. Eventuais Vítimas", "i": "personal_injury", "f": [{"k": "vitimas", "l": "Existem vítimas no local do incidente?", "type": "select", "opts": ["Sim", "Não"], "req": 1}, {"k": "n_vitimas", "l": "Quantas (aproximadamente)", "type": "number", "half": 1, "showIf": ["vitimas", "Sim"]}, {"k": "n_mortos", "l": "N.º de Mortos", "type": "number", "half": 1, "showIf": ["vitimas", "Sim"]}, {"k": "sintomas", "l": "Principais sintomas (descreva)", "type": "area", "showIf": ["vitimas", "Sim"]}]}, {"t": "4. Mercadorias e Substâncias Perigosas", "i": "science", "f": [{"k": "nome_comum", "l": "Nome Comum", "type": "text"}, {"k": "onu", "l": "N.º ONU", "type": "text", "half": 1, "ph": "Ex.: 1203"}, {"k": "perigo", "l": "N.º Perigo", "type": "text", "half": 1, "ph": "Ex.: 33"}, {"k": "etiquetas", "l": "Etiquetas ou Rótulos de perigo", "type": "text"}, {"k": "quantidade", "l": "Quantidade (estimada)", "type": "text"}, {"k": "descricao_visual", "l": "Descrição Visual", "type": "area"}, {"k": "contentor", "l": "Tipo de Contentor", "type": "select", "opts": ["Cisterna", "Garrafas de gás comprimido", "Tambores", "Outro"]}, {"k": "cisterna_m3", "l": "Cisterna — capacidade (m³)", "type": "number", "showIf": ["contentor", "Cisterna"]}, {"k": "garrafas_l", "l": "Garrafas — capacidade (litros)", "type": "number", "showIf": ["contentor", "Garrafas de gás comprimido"]}, {"k": "tambores_l", "l": "Tambores — capacidade (litros)", "type": "number", "showIf": ["contentor", "Tambores"]}, {"k": "contentor_outro", "l": "Outro contentor — especifique", "type": "text", "showIf": ["contentor", "Outro"]}, {"k": "transporte", "l": "Tipo de Transporte", "type": "select", "opts": ["Rodoviário", "Ferroviário", "Marítimo", "Fluvial", "Conduta (pipeline)", "Aéreo"]}, {"k": "fase", "l": "Fase do Transporte", "type": "select", "opts": ["Carga", "Descarga", "Em Transporte"]}]}, {"t": "5. Natureza do Incidente", "i": "local_fire_department", "f": [{"k": "derrame", "l": "Derrame (líquido) — Quantidade estimada", "type": "text"}, {"k": "fuga", "l": "Fuga (vapor / gás) — Quantidade estimada", "type": "text"}, {"k": "espalhamento", "l": "Espalhamento (sólido) — Quantidade estimada", "type": "text"}, {"k": "incendio", "l": "Incêndio", "type": "select", "opts": ["Sim", "Não"], "half": 1}, {"k": "explosao", "l": "Explosão", "type": "select", "opts": ["Sim", "Não"], "half": 1}, {"k": "outra_info", "l": "Outra informação relevante", "type": "area"}]}, {"t": "6. Matéria Não-identificada — Suspeita de risco NRBQ", "i": "help_center", "f": [{"k": "cheiro", "l": "Indícios de perigosidade — Cheiro", "type": "select", "opts": ["Sim", "Não"]}, {"k": "cheiro_tipo", "l": "Que tipo de cheiro", "type": "text", "ph": "Ex.: alho, piscina, ovos podres…", "showIf": ["cheiro", "Sim"]}, {"k": "cor_derrame", "l": "Cor do derrame", "type": "text"}, {"k": "origem_fuga", "l": "Origem da fuga", "type": "text"}, {"k": "vitimas_mat", "l": "Existem vítimas no local?", "type": "select", "opts": ["Sim", "Não"]}]}, {"t": "7. Origem do Incidente", "i": "travel_explore", "f": [{"k": "origem_conhecida", "l": "É conhecida a origem do incidente?", "type": "select", "opts": ["Sim", "Não"]}, {"k": "origem_qual", "l": "Qual", "type": "text", "showIf": ["origem_conhecida", "Sim"]}, {"k": "reg_explosao", "l": "Há registo de explosão?", "type": "select", "opts": ["Sim", "Não"]}, {"k": "reg_ataque", "l": "Há registo de outro tipo de incidente e/ou ataque?", "type": "select", "opts": ["Sim", "Não"]}, {"k": "ameaca_bomba", "l": "Existe ameaça de bomba no local?", "type": "select", "opts": ["Sim", "Não"]}]}, {"t": "8. Características da Chamada de Alerta", "i": "call", "closed": 1, "f": [{"k": "tipo_chamada", "l": "Tipo de Chamada", "type": "select", "opts": ["Local", "Regional", "Nacional", "Móvel", "Internacional"]}, {"k": "sexo", "l": "Sexo", "type": "select", "opts": ["Feminino", "Masculino"], "half": 1}, {"k": "idade", "l": "Idade aproximada", "type": "number", "half": 1}, {"k": "voz", "l": "Características da Voz", "type": "multi", "opts": ["Forte", "Suave", "Aguda", "Rouca", "Agradável", "Denotada Embriaguez"]}, {"k": "sotaque", "l": "Sotaque", "type": "select", "opts": ["Local", "Regional", "Estrangeiro", "Étnico", "Outros"]}, {"k": "modo", "l": "Modo", "type": "multi", "opts": ["Calmo", "Racional", "Coerente", "Deliberado", "Direto", "Correto", "Irritante", "Irracional", "Incoerente", "Emocional"]}, {"k": "sons", "l": "Sons de Fundo", "type": "multi", "opts": ["Barulho", "Silêncio", "Misturado", "Comboio", "Música", "Vozes", "Cozinha", "Aeronaves", "Animais", "Máquinas", "Tráfego de rua", "Reunião de rua", "Outros"]}]}, {"t": "9. Outras Informações", "i": "notes", "f": [{"k": "outras", "l": "Outras informações", "type": "area"}, {"k": "optel", "l": "OPTEL", "type": "text", "req": 1}]}]};
      const API_URL = 'https://cb360-online.vercel.app/api/various_convert_and_send';
      const FIELDS = SPEC.sections.flatMap(x => x.f);
      const ST = {id: null, status: 'rascunho', data: {}, dirty: false, saving: null, list: [], loaded: false};
      const ssGet = k => {try {return sessionStorage.getItem(k); } catch (_) { return null; }};
      const ssSet = (k, v) => {try {v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (_) {}};
      const corp = () => String(ssGet('currentCorpOperNr') || '').padStart(4, '0');
      const nint = () => ssGet('currentNInt') || '';
      const CUR_KEY = () => `cb360_nrbq_fni_atual_${corp()}`;
      const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
      const pad = n => String(n).padStart(2, '0');
      const nowLocal = () => {const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;};
      const nowFor = type => {const v = nowLocal(); return type === 'date' ? v.slice(0, 10) : type === 'time' ? v.slice(11) : v;};
      const hdr = (extra = {}) => ({...getSupabaseHeaders(), 'Content-Type': 'application/json', ...extra});
      const root = () => document.getElementById('nrbqFni');
      const q = sel => root() ? root().querySelector(sel) : null;
      let D = ST.data;
      /* ----------------------------- estilos (tudo dentro de #nrbqFni) ----------------------------- */
      (function css() {
        if (document.getElementById('nf-css')) return;
        if (!document.querySelector('link[href*="family=Material+Icons"]')) {
          const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'; document.head.appendChild(l);
        }
        const st = document.createElement('style'); st.id = 'nf-css';
        st.textContent = `
          #nrbqFni {--nf-red: #c62828; --nf-red-dark: #8b0000; --nf-red-light: rgba(198,40,40,.10); --nf-line: #d9dde3; --nf-txt: #1f2933; --nf-txt2: #5c6670; --nf-txt3: #9aa3ad;
                    --nf-bg: #f6f7f9; --nf-green: #2e7d32; display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: var(--nf-txt);}
          #nrbqFni .material-icons {font-size: 20px; line-height: 1;}
          #nrbqFni .nf-top {display: flex; flex-direction: column; gap: 10px;}
          #nrbqFni .nf-prog { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid var(--nf-line); border-radius: 12px; padding: 10px 14px;}
          #nrbqFni .nf-prog > .material-icons {color: var(--nf-red); font-size: 24px;}
          #nrbqFni .nf-prog-in {flex: 1; min-width: 0;}
          #nrbqFni .nf-prog-top {display: flex; justify-content: space-between; font-weight: 600; color: var(--nf-txt2); font-size: 12px;}
          #nrbqFni .nf-prog-top b {color: var(--nf-txt); font-size: 13px;}
          #nrbqFni .nf-bar {height: 6px; background: #eceff2; border-radius: 3px; overflow: hidden; margin-top: 6px;}
          #nrbqFni .nf-bar span {display: block; height: 100%; width: 0; background: linear-gradient(to right, var(--nf-red-dark), var(--nf-red)); transition: width .3s;}
          #nrbqFni .nf-draft {margin-top: 5px; font-size: 11px; color: var(--nf-txt3); display: flex; align-items: center; gap: 4px;}
          #nrbqFni .nf-draft .material-icons {font-size: 14px;}
          #nrbqFni .nf-draft.sent {color: var(--nf-green); font-weight: 700;}
          #nrbqFni .nf-side {display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end;}
          #nrbqFni .nf-list {box-sizing: border-box; height: 40px; margin: 0; min-width: 260px; border: 1px solid var(--nf-line); border-radius: 10px; padding: 0 10px; font: inherit; background: #fff; color: var(--nf-txt);}
          #nrbqFni .nf-btn {box-sizing: border-box; height: 40px; min-height: 40px; max-height: 40px; margin: 0; line-height: 1; border: 1px solid transparent; border-radius: 10px; padding: 0 14px; font: inherit; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;}
          #nrbqFni .nf-ghost {background: #fff; color: var(--nf-txt2); border: 1px solid var(--nf-line);}
          #nrbqFni .nf-ghost:hover {border-color: var(--nf-red); color: var(--nf-red);}
          #nrbqFni .nf-ghost.sure {background: var(--nf-red); color: #fff; border-color: var(--nf-red);}
          #nrbqFni .nf-main {background: linear-gradient(to right, var(--nf-red-dark), var(--nf-red)); border-color: var(--nf-red); color: #fff; box-shadow: 0 3px 10px rgba(198,40,40,.25);}
          #nrbqFni .nf-main.warn {background: linear-gradient(to right, #8a5a00, #ef8f00);}
          #nrbqFni .nf-btn:disabled {opacity: .6; cursor: default;}
          #nrbqFni .nf-scroll {height: calc(100vh - 470px); min-height: 420px; overflow-y: auto; padding-right: 6px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar {width: 8px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar-track {background: #eceff2; border-radius: 999px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar-thumb {background: linear-gradient(var(--nf-red), var(--nf-red-dark)); border-radius: 999px;}
          #nrbqFni .nf-scroll::-webkit-scrollbar-thumb:hover {background: var(--nf-red-dark);}
          #nrbqFni .nf-scroll::-webkit-scrollbar-button {display: none; height: 0;}
          @supports not selector(::-webkit-scrollbar) {#nrbqFni .nf-scroll {scrollbar-width: thin; scrollbar-color: var(--nf-red) #eceff2;}}
          #nrbqFni .nf-sec {background: #fff; border: 1px solid var(--nf-line); border-radius: 12px; margin-bottom: 10px; overflow: hidden;}
          #nrbqFni .nf-sec-head {display: flex; align-items: center; gap: 10px; padding: 11px 14px; cursor: pointer; user-select: none;}
          #nrbqFni .nf-sec-head:hover {background: #fafbfc;}
          #nrbqFni .nf-sec-icon {width: 32px; height: 32px; border-radius: 9px; background: var(--nf-red-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
          #nrbqFni .nf-sec-icon .material-icons {font-size: 18px; color: var(--nf-red);}
          #nrbqFni .nf-sec-title {flex: 1; font-weight: 700; font-size: 13.5px;}
          #nrbqFni .nf-cnt {font-size: 11px; font-weight: 700; color: var(--nf-txt2); background: #eef0f3; border-radius: 999px; padding: 3px 9px;}
          #nrbqFni .nf-cnt.done {background: rgba(46,125,50,.14); color: var(--nf-green);}
          #nrbqFni .nf-chev {color: var(--nf-txt3); transition: transform .2s;}
          #nrbqFni .nf-sec.closed .nf-chev {transform: rotate(-90deg);}
          #nrbqFni .nf-sec.closed .nf-body {display: none;}
          #nrbqFni .nf-sec.hidden {display: none;}
          #nrbqFni .nf-body {border-top: 1px solid #eef0f3; padding: 14px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px 14px;}
          #nrbqFni .nf-fld {grid-column: span 3; display: flex; flex-direction: column; gap: 5px; min-width: 0;}
          #nrbqFni .nf-fld.s2 {grid-column: span 2;}
          #nrbqFni .nf-fld.s6 {grid-column: span 6;}
          #nrbqFni .nf-fld.hidden {display: none;}
          #nrbqFni .nf-lbl {font-size: 11.5px; font-weight: 600; color: var(--nf-txt2);}
          #nrbqFni .nf-lbl .req {color: var(--nf-red); margin-left: 2px;}
          #nrbqFni .nf-lbl .hint {font-weight: 500; color: var(--nf-txt3); margin-left: 4px;}
          #nrbqFni .nf-in {width: 100%; height: 38px; border: 1px solid var(--nf-line); border-radius: 8px; background: #fff; color: var(--nf-txt); font: inherit; font-size: 13.5px; padding: 0 10px; box-sizing: border-box;}
          #nrbqFni textarea.nf-in {height: auto; min-height: 70px; padding: 8px 10px; resize: vertical; line-height: 1.4;}
          #nrbqFni .nf-in:focus {outline: none; border-color: var(--nf-red); box-shadow: 0 0 0 3px var(--nf-red-light);}
          #nrbqFni .nf-fld.missing .nf-in, #nrbqFni .nf-fld.missing .nf-chips {border-color: var(--nf-red); box-shadow: 0 0 0 3px var(--nf-red-light); border-radius: 8px;}
          #nrbqFni .nf-chips {display: flex; flex-wrap: wrap; gap: 6px;}
          #nrbqFni .nf-chip {border: 1px solid var(--nf-line); background: #fff; color: var(--nf-txt); border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer;}
          #nrbqFni .nf-chip:hover {border-color: var(--nf-red);}
      #nrbqFni .nf-chip.on {background: var(--nf-red); border-color: var(--nf-red); color: #fff;}
          #nrbqFni .nf-gps {display: flex; gap: 8px;}
          #nrbqFni .nf-gps a {flex-shrink: 0; width: 38px; height: 38px; border-radius: 8px; background: var(--nf-red-light); color: var(--nf-red); display: flex; align-items: center; justify-content: center; text-decoration: none;}
          #nrbqFni .nf-rows {display: flex; flex-direction: column; gap: 10px;}
          #nrbqFni .nf-row-card {border: 1px dashed var(--nf-line); border-radius: 10px; padding: 10px; background: var(--nf-bg);}
          #nrbqFni .nf-row-head {display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px;}
          #nrbqFni .nf-row-del {border: 0; background: transparent; color: var(--nf-txt3); cursor: pointer;}
          #nrbqFni .nf-row-body {display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px 12px;}
          #nrbqFni .nf-row-add {align-self: flex-start; border: 1px dashed var(--nf-red); background: var(--nf-red-light); color: var(--nf-red); border-radius: 999px; padding: 6px 14px 6px 10px; font: inherit; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;}
          #nrbqFni .zone {border-left: 4px solid; padding-left: 8px;}
          #nrbqFni .zone.hot {border-color: #d32f2f;} #nrbqFni .zone.warm {border-color: #f9a825;} #nrbqFni .zone.cold {border-color: #2e7d32;}
          @media (max-width: 1100px) {#nrbqFni .nf-fld, #nrbqFni .nf-fld.s2 {grid-column: span 6;}}
        `;
        document.head.appendChild(st);
      })();
      /* ----------------------------- regras do formulário ----------------------------- */
      function cond(c) {if (!c) return true; const [k, ...vals] = c; return vals.includes(D[k]);}
      function secOf(f) {return SPEC.sections.find(s => s.f.includes(f));}
      function visible(f) {return cond(f.showIf) && cond((secOf(f) || {}).showIf);}
      function rowEmpty(r) {return !r || Object.values(r).every(x => x == null || String(x).trim() === '');}
      function filled(f) {
        const v = D[f.k];
        if (f.type === 'rows') return Array.isArray(v) && v.some(r => !rowEmpty(r));
        return Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== '';
      }
      function span(f) {
        if (['area', 'rows', 'multi', 'gps'].includes(f.type)) return 's6';
        if (f.type === 'select' && (f.opts.length > 4 || f.opts.some(o => o.length > 22))) return 's6';
        if (f.half || f.third) return 's2';
        return '';
      }
      function rowsHtml(f) {
        if (!Array.isArray(D[f.k]) || !D[f.k].length) D[f.k] = [{}];
        const rows = D[f.k];
        const cell = (c, r, i) => {
          const v = r[c.k] == null ? '' : r[c.k];
          const at = `data-rk="${f.k}" data-ri="${i}" data-rc="${c.k}"`;
          let ctl;
          if (c.type === 'select') ctl = `<div class="nf-chips" ${at}>${c.opts.map(o => `<button type="button" class="nf-chip ${v === o ? 'on' : ''}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
          else {
            const ty = {number: 'number', datetime: 'datetime-local', time: 'time', date: 'date'}[c.type] || 'text';
            ctl = `<input class="nf-in" type="${ty}" ${at} value="${esc(v)}" placeholder="${esc(c.ph || '')}" autocomplete="off">`;
          }
          return `<div class="nf-fld ${c.type === 'select' ? 's6' : c.half ? 's2' : ''}"><span class="nf-lbl">${esc(c.l)}</span>${ctl}</div>`;
        };
        return `<div class="nf-rows">${rows.map((r, i) => `
          <div class="nf-row-card">
            <div class="nf-row-head"><span>${esc(f.item)} ${i + 1}</span>${rows.length > 1 ? `<button type="button" class="nf-row-del" data-rowdel="${f.k}" data-ri="${i}" title="Remover"><span class="material-icons">close</span></button>` : ''}</div>
            <div class="nf-row-body">${f.cols.map(c => cell(c, r, i)).join('')}</div>
          </div>`).join('')}
          ${rows.length < f.max ? `<button type="button" class="nf-row-add" data-rowadd="${f.k}"><span class="material-icons">add</span>Adicionar ${esc(f.item.toLowerCase())}</button>` : ''}</div>`;
      }
      function fieldHtml(f) {
        const v = D[f.k] == null ? '' : D[f.k];
        const cls = ['nf-fld', span(f), f.zone ? 'zone ' + f.zone : '', visible(f) ? '' : 'hidden'].join(' ');
        const lbl = `<label class="nf-lbl" for="nf_${f.k}">${esc(f.l)}${f.req ? '<span class="req">*</span>' : ''}${f.hint ? `<span class="hint">(${esc(f.hint)})</span>` : ''}</label>`;
        let ctl;
        if (f.type === 'rows') ctl = rowsHtml(f);
        else if (f.type === 'select' || f.type === 'multi') {
          const on = o => f.type === 'multi' ? (Array.isArray(v) && v.includes(o)) : v === o;
          ctl = `<div class="nf-chips" data-k="${f.k}"${f.type === 'multi' ? ' data-multi="1"' : ''}>${f.opts.map(o => `<button type="button" class="nf-chip ${on(o) ? 'on' : ''}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
        } else if (f.type === 'area') {
          ctl = `<textarea class="nf-in" id="nf_${f.k}" data-k="${f.k}" rows="2" placeholder="${esc(f.ph || '')}">${esc(v)}</textarea>`;
        } else if (f.type === 'gps') {
          const ll = String(v).match(/-?\d+(\.\d+)?/g);
          ctl = `<div class="nf-gps"><input class="nf-in" id="nf_${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="37.01928, -7.93044" autocomplete="off">` +
                `<a href="${ll && ll.length >= 2 ? `https://www.google.com/maps?q=${ll[0]},${ll[1]}` : 'https://www.google.com/maps'}" target="_blank" rel="noopener" title="Ver no mapa"><span class="material-icons">map</span></a></div>`;
        } else {
          const t = {text: 'text', number: 'number', time: 'time', date: 'date', datetime: 'datetime-local'}[f.type] || 'text';
          ctl = `<input class="nf-in" type="${t}" id="nf_${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph || '')}"${f.type === 'number' ? ' min="0"' : ''}${f.list ? ` list="nfdl_${f.k}"` : ''} autocomplete="off">` + (f.list ? `<datalist id="nfdl_${f.k}">${f.list.map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : '');
        }
        return `<div class="${cls}" id="nfw_${f.k}">${lbl}${ctl}</div>`;
      }
      /* ----------------------------- desenhar ----------------------------- */
      function shell() {
        const box = document.getElementById('nrbqFniBoard');
        if (!box || box.dataset.ready) return !!box;
        box.dataset.ready = '1';
        box.innerHTML = `
          <div id="nrbqFni">
            <div class="nf-top">
              <div class="nf-side">
                <select class="nf-list" id="nfList" title="Fichas guardadas"><option value="">Fichas guardadas…</option></select>
                <button type="button" class="nf-btn nf-ghost" id="nfNew"><span class="material-icons">restart_alt</span><span>Nova</span></button>
                <button type="button" class="nf-btn nf-ghost" id="nfPdf"><span class="material-icons">picture_as_pdf</span><span>PDF</span></button>
                <button type="button" class="nf-btn nf-main" id="nfSend"><span class="material-icons">send</span><span>Enviar ficha</span></button>
              </div>
              <div class="nf-prog">
                <span class="material-icons">${esc(SPEC.icon)}</span>
                <div class="nf-prog-in">
                  <div class="nf-prog-top"><span>Preenchimento</span><b id="nfProgTxt">0 / 0</b></div>
                  <div class="nf-bar"><span id="nfProgBar"></span></div>
                  <div class="nf-draft" id="nfDraft"><span class="material-icons">cloud_queue</span>Ficha nova (ainda não gravada)</div>
                </div>
              </div>
            </div>
            <div class="nf-scroll" id="nfScroll"><div id="nfForm"></div></div>
          </div>`;
        wire();
        return true;
      }
      function render() {
        FIELDS.forEach(f => { if (f.now && !D[f.k]) D[f.k] = nowFor(f.type); });
        q('#nfForm').innerHTML = SPEC.sections.map((s, i) => `
          <div class="nf-sec closed${cond(s.showIf) ? '' : ' hidden'}" id="nfs_${i}">
            <div class="nf-sec-head" data-sec="${i}">
              <div class="nf-sec-icon"><span class="material-icons">${s.i}</span></div>
              <div class="nf-sec-title">${esc(s.t)}</div>
              <span class="nf-cnt" id="nfc_${i}"></span>
              <span class="material-icons nf-chev">expand_more</span>
            </div>
            <div class="nf-body">${s.f.map(fieldHtml).join('')}</div>
          </div>`).join('');
        refresh();
        draftInfo();
      }
      function refresh() {
        let tot = 0, ok = 0;
        SPEC.sections.forEach((s, i) => {
          let st = 0, so = 0;
          const sec = q('#nfs_' + i); if (!sec) return;
          sec.classList.toggle('hidden', !cond(s.showIf));
          s.f.forEach(f => {
            const w = q('#nfw_' + f.k), vis = visible(f);
            if (w) w.classList.toggle('hidden', !vis);
            if (!vis) return;
            st++; if (filled(f)) {so++; if (w) w.classList.remove('missing');}
          });
          tot += st; ok += so;
          const c = q('#nfc_' + i); c.textContent = `${so}/${st}`; c.classList.toggle('done', so === st);
        });
        q('#nfProgTxt').textContent = `${ok} / ${tot}`;
        q('#nfProgBar').style.width = (tot ? Math.round(ok / tot * 100) : 0) + '%';
      }
      function openSec(sec, toggle) {
        if (!sec) return;
        const wasOpen = !sec.classList.contains('closed');
        root().querySelectorAll('.nf-sec').forEach(s => s.classList.add('closed'));
        if (toggle && wasOpen) return;
        sec.classList.remove('closed');
        const sc = q('#nfScroll');
        requestAnimationFrame(() => sc.scrollTo({top: Math.max(0, sec.offsetTop - sc.offsetTop), behavior: 'smooth'}));
      }
      function draftInfo(msg) {
        const el = q('#nfDraft'); if (!el) return;
        if (msg) {el.className = 'nf-draft'; el.innerHTML = msg; return;}
        if (!ST.id) {el.className = 'nf-draft'; el.innerHTML = '<span class="material-icons">cloud_queue</span>Ficha nova (ainda não gravada)'; return;}
        const sent = ST.status === 'enviada';
        el.className = 'nf-draft' + (sent ? ' sent' : '');
        el.innerHTML = sent ? `<span class="material-icons">mark_email_read</span>Ficha n.º ${ST.id} · enviada${D._enviada ? ' às ' + new Date(D._enviada).toLocaleTimeString('pt-PT', {hour: '2-digit', minute: '2-digit'}) : ''} (as alterações continuam a ser gravadas)`
                        : `<span class="material-icons">cloud_done</span>Ficha n.º ${ST.id} · rascunho gravado na base de dados`;
      }
      function note(msg, type = 'popup-success') {
        if (typeof showPopup === 'function') showPopup(type, msg); else alert(msg);
      }
      /* ----------------------------- gravar na base de dados (nrbq_forms) ----------------------------- */
      let saveT;
      function save(now) {
        ST.dirty = true;
        clearTimeout(saveT);
        saveT = setTimeout(persist, now ? 0 : 900);
      }
      async function persist() {
        while (ST.saving) await ST.saving;
        if (!ST.dirty) return ST.id;
        ST.dirty = false;
        const job = (async () => {
          await null;
          try {
            if (!ST.id) {
              const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms`, {method: 'POST', headers: hdr({Prefer: 'return=representation'}),
                body: JSON.stringify({corp_oper_nr: corp(), form_type: 'FNI', data: D, created_by: nint(), created_by_name: D.operador || D.optel || null})});
              if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()));
              const row = (await r.json())[0];
              ST.id = row.id; ST.status = row.status;
              ssSet(CUR_KEY(), String(ST.id));
              loadList();
            } else {
              const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?id=eq.${ST.id}`, {method: 'PATCH', headers: hdr(), body: JSON.stringify({data: D})});
              if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()));
            }
            draftInfo();
            const d = new Date();
            const el = q('#nfDraft'); if (el && ST.status !== 'enviada') el.innerHTML += ` às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          } catch (e) {
            console.error('[NRBQ FNI] Erro ao gravar:', e);
            ST.dirty = true;
            draftInfo('<span class="material-icons" style="color:#c62828">cloud_off</span><span style="color:#c62828">Não foi possível gravar. Nova tentativa na próxima alteração.</span>');
          }
        })();
        ST.saving = job;
        try { await job; } finally { if (ST.saving === job) ST.saving = null; }
        return ST.id;
      }
      async function loadList() {
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?select=id,occurrence_nr,status,created_at,updated_at,created_by_name&corp_oper_nr=eq.${corp()}&form_type=eq.FNI&order=updated_at.desc&limit=40`, {headers: hdr()});
          if (!r.ok) throw new Error('HTTP ' + r.status);
          ST.list = await r.json();
        } catch (e) { console.warn('[NRBQ FNI] Lista:', e); ST.list = []; }
        const sel = q('#nfList'); if (!sel) return;
        const fmt = iso => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
        sel.innerHTML = '<option value="">Fichas guardadas…</option>' + ST.list.map(x =>
          `<option value="${x.id}" ${x.id === ST.id ? 'selected' : ''}>N.º ${x.id} · ${esc(x.occurrence_nr || 'sem ocorrência')} · ${fmt(x.updated_at || x.created_at)} · ${x.status === 'enviada' ? 'Enviada' : 'Rascunho'}</option>`).join('');
      }
      async function openForm(id) {
        await persist();
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?select=id,status,data&id=eq.${id}&corp_oper_nr=eq.${corp()}`, {headers: hdr()});
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const row = (await r.json())[0];
          if (!row) throw new Error('Ficha não encontrada.');
          ST.id = row.id; ST.status = row.status; ST.dirty = false; D = ST.data = row.data || {};
          ssSet(CUR_KEY(), String(ST.id));
          render(); loadList();
          q('#nfScroll').scrollTo({top: 0});
        } catch (e) { note('Não foi possível abrir a ficha: ' + e.message, 'popup-danger'); }
      }
      function newForm() {
        clearTimeout(saveT);
        ST.id = null; ST.status = 'rascunho'; ST.dirty = false; D = ST.data = {};
        ssSet(CUR_KEY(), null);
        render(); prefillUser(); loadList();
        q('#nfScroll').scrollTo({top: 0, behavior: 'smooth'});
      }
      /* ----------------------------- eventos ----------------------------- */
      let clearArm = null, forceArm = null;
      function wire() {
        const r = root();
        r.addEventListener('input', e => {
          const ds = e.target.dataset || {};
      if (ds.rk) {D[ds.rk][+ds.ri][ds.rc] = e.target.value; refresh(); save(); return;}
          if (!ds.k) return;
          D[ds.k] = e.target.value;
          refresh(); save();
        });
        r.addEventListener('click', e => {
          const add = e.target.closest('[data-rowadd]');
          if (add) {D[add.dataset.rowadd].push({}); redrawRows(add.dataset.rowadd); return;}
          const del = e.target.closest('[data-rowdel]');
          if (del) {D[del.dataset.rowdel].splice(+del.dataset.ri, 1); redrawRows(del.dataset.rowdel); return;}
          const chip = e.target.closest('.nf-chip');
          if (chip && chip.parentElement.dataset.rk) {
            const b = chip.parentElement, row = D[b.dataset.rk][+b.dataset.ri];
            row[b.dataset.rc] = row[b.dataset.rc] === chip.dataset.v ? '' : chip.dataset.v;
            b.querySelectorAll('.nf-chip').forEach(c => c.classList.toggle('on', c.dataset.v === row[b.dataset.rc]));
            refresh(); save(); return;
          }
          if (chip) {
            const box = chip.parentElement, k = box.dataset.k, v = chip.dataset.v;
            if (box.dataset.multi) {
              const arr = Array.isArray(D[k]) ? D[k].slice() : [];
              const ix = arr.indexOf(v); if (ix >= 0) arr.splice(ix, 1); else arr.push(v);
              D[k] = arr; chip.classList.toggle('on', ix < 0);
            } else {
              D[k] = D[k] === v ? '' : v;
              box.querySelectorAll('.nf-chip').forEach(c => c.classList.toggle('on', c.dataset.v === D[k]));
            }
            refresh(); save(); return;
          }
          const head = e.target.closest('.nf-sec-head');
          if (head) openSec(q('#nfs_' + head.dataset.sec), true);
        });
        q('#nfList').onchange = ev => {if (ev.target.value) openForm(+ev.target.value);};
        q('#nfNew').onclick = () => {
          const b = q('#nfNew');
          if (!clearArm) {
            b.classList.add('sure'); b.lastElementChild.textContent = 'Começar nova?';
            clearArm = setTimeout(() => { clearArm = null; b.classList.remove('sure'); b.lastElementChild.textContent = 'Nova'; }, 3500);
            return;
          }
          clearTimeout(clearArm); clearArm = null; b.classList.remove('sure'); b.lastElementChild.textContent = 'Nova';
          persist().then(newForm);
        };
        q('#nfPdf').onclick = onPdf;
        q('#nfSend').onclick = onSend;
      }
      function redrawRows(k) {const f = FIELDS.find(x => x.k === k); const w = q('#nfw_' + k); if (f && w) { w.outerHTML = fieldHtml(f); refresh(); save(); }}
      function checkRequired(btn, label) {
        const missing = FIELDS.filter(f => f.req && visible(f) && !filled(f));
        if (missing.length && !forceArm) {
          missing.forEach(f => q('#nfw_' + f.k).classList.add('missing'));
          const first = q('#nfw_' + missing[0].k);
          openSec(first.closest('.nf-sec'), false);
          setTimeout(() => first.scrollIntoView({behavior: 'smooth', block: 'center'}), 80);
          note(`Faltam ${missing.length} campo(s) obrigatório(s). Carregue outra vez para continuar mesmo assim.`, 'popup-danger');
          btn.classList.add('warn'); btn.lastElementChild.textContent = 'Continuar mesmo assim';
          forceArm = setTimeout(() => { forceArm = null; btn.classList.remove('warn'); btn.lastElementChild.textContent = label; }, 5000);
          return false;
        }
        clearTimeout(forceArm); forceArm = null;
        btn.classList.remove('warn'); btn.lastElementChild.textContent = label;
        return true;
      }
      async function prefillUser() {
        if (!nint()) return;
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name&corp_oper_nr=eq.${corp()}&n_int=eq.${nint()}`, {headers: hdr()});
          const e = r.ok ? (await r.json())[0] : null;
          if (!e || !e.abv_name) return;
          ['optel', 'operador'].forEach(k => {
            if (FIELDS.some(f => f.k === k) && !D[k]) { D[k] = e.abv_name; const el = q('#nf_' + k); if (el) el.value = e.abv_name;}
          });
          refresh();
        } catch (_) {}
      }
      /* ----------------------------- dados da corporação / destinatários ----------------------------- */
      async function getCommon() {
        const out = {corpName: '', logoUrl: '', senderName: 'CB360 Online'};
        try {
          const [c, e] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corp()}&select=cb_name,logo_url,corp_address,corp_cp,corp_localitie,corp_phone_mobile,corp_phone_landline,corp_email`, {headers: hdr()}).then(r => r.ok ? r.json() : []),
            nint() ? fetch(`${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corp()}&n_int=eq.${nint()}&select=abv_name,patent`, {headers: hdr()}).then(r => r.ok ? r.json() : []) : []
          ]);
          const d = c[0] || {};
          Object.assign(out, {corpName: d.cb_name || '', logoUrl: d.logo_url || '', corpAddress: d.corp_address || '', corpCp: d.corp_cp || '', corpLocalitie: d.corp_localitie || '',
                              corpPhoneMobile: d.corp_phone_mobile || '', corpPhoneLandline: d.corp_phone_landline || '', corpEmail: d.corp_email || ''});
          if (e[0]) out.senderName = `${e[0].abv_name || 'CB360 Online'}<br>${e[0].patent || ''}`;
        } catch (err) {console.warn('[NRBQ FNI] Dados da corporação indisponíveis:', err);}
        return out;
      }
      async function getRecipients() {
        const t = SPEC.page.toLowerCase();
        const cats = [`${t}_mail_to`, `${t}_mail_cc`, `${t}_mail_bcc`, 'nrbq_mail_to', 'nrbq_mail_cc', 'nrbq_mail_bcc'];
        const r = await fetch(`${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corp()}&category=in.(${cats.join(',')})&select=category,value`, {headers: hdr()});
        if (!r.ok) throw new Error('Não foi possível ler os destinatários (HTTP ' + r.status + ').');
        const rows = await r.json();
        const list = c => String((rows.find(x => x.category === c) || {}).value || '').split(',').map(e => e.trim()).filter(Boolean);
        const own = {to: list(cats[0]), cc: list(cats[1]), bcc: list(cats[2])};
        return own.to.length ? own : {to: list(cats[3]), cc: list(cats[4]), bcc: list(cats[5])};
      }
      function visibleData() { const o = {}; FIELDS.forEach(f => { if (visible(f) && filled(f)) o[f.k] = D[f.k]; }); return o;}
      /* ----------------------------- enviar (template oficial + email, API) ----------------------------- */
      async function onSend() {
        const btn = q('#nfSend');
        if (!checkRequired(btn, 'Enviar ficha')) return;
        btn.disabled = true; btn.lastElementChild.textContent = 'A enviar…';
        try {
          ST.dirty = true; await persist();
          const [rcp, common] = await Promise.all([getRecipients(), getCommon()]);
          if (!rcp.to.length) throw new Error('Não há destinatários configurados para esta ficha (Centro de Dados → Emails Config.).');
          const r = await fetch(API_URL, {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${ssGet('authToken') || ''}`},
                                          body: JSON.stringify({type: SPEC.page.toLowerCase(), data: {...common, ...rcp, fields: visibleData()}})});
          const txt = await r.text();
          let j = {}; try { j = JSON.parse(txt); } catch (_) {}
          if (!r.ok || !j.success) throw new Error(j.error || (txt.trim().startsWith('<') ? `Erro do servidor (${r.status}).` : txt) || 'Falha no envio.');
          D._enviada = new Date().toISOString();
          ST.status = 'enviada';
          await fetch(`${SUPABASE_URL}/rest/v1/nrbq_forms?id=eq.${ST.id}`, {method: 'PATCH', headers: hdr(), body: JSON.stringify({data: D, status: 'enviada', sent_at: D._enviada})});
          draftInfo(); loadList();
          note(`Ficha enviada para ${(j.sentTo || rcp.to).join(', ')}.`);
        } catch (e) {
          console.error('[NRBQ FNI] Erro ao enviar:', e);
          note('Não foi possível enviar: ' + e.message, 'popup-danger');
        } finally {
          btn.disabled = false; btn.lastElementChild.textContent = 'Enviar ficha';
        }
      }
      /* ----------------------------- PDF (jsPDF, igual ao do Mobile) ----------------------------- */
      function loadScript(src) { return new Promise((res, rej) => {const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });}
      async function ensureJsPdf() {
        if (!(window.jspdf && window.jspdf.jsPDF)) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        const probe = new window.jspdf.jsPDF();
        if (typeof probe.autoTable !== 'function') await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
      }
      function fmtValue(f) {
        const v = D[f.k];
        if (f.type === 'rows') {
          const fmtC = (c, x) => c.type === 'datetime' && x ? x.replace(/^(\d{4})-(\d{2})-(\d{2})T/, '$3/$2/$1 ') : x;
          const out = (v || []).filter(r => !rowEmpty(r)).map((r, i) => `${i + 1}) ` + f.cols.filter(c => r[c.k] && String(r[c.k]).trim()).map(c => `${c.l}: ${fmtC(c, String(r[c.k]).trim())}`).join('  |  '));
          return out.length ? out.join('\n') : '—';
        }
        if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
        if (v == null || String(v).trim() === '') return '—';
        if (f.type === 'date') {const [y, m, dd] = String(v).split('-'); return `${dd}/${m}/${y}`;}
        if (f.type === 'datetime') {const [d, t] = String(v).split('T'); const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}${t ? ' ' + t : ''}`;}
        if (f.type === 'number' && /\(m\)$/.test(f.l)) return `${v} m`;
        return String(v).trim();
      }
      async function logoData(url) {
        if (!url) return null;
        try {
          const r = await fetch(url); if (!r.ok) return null;
          const b = await r.blob();
          return await new Promise(res => {const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b);});
        } catch (_) {return null;}
      }
      async function onPdf() {
        const btn = q('#nfPdf');
        if (!checkRequired(btn, 'PDF')) return;
        btn.disabled = true;
        try {
          await ensureJsPdf();
          const common = await getCommon();
          const {jsPDF} = window.jspdf;
          const doc = new jsPDF({unit: 'mm', format: 'a4'});
          const W = doc.internal.pageSize.getWidth();
          const logo = await logoData(common.logoUrl);
          doc.setFillColor(139, 0, 0); doc.rect(0, 0, W, 24, 'F');
          doc.setFillColor(198, 40, 40); doc.rect(0, 22, W, 2, 'F');
          let tx = 12;
          if (logo) { try {doc.addImage(logo, 8, 3, 18, 18); tx = 30; } catch (_) {}}
          doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5);
          doc.text(doc.splitTextToSize(SPEC.pdfTitle, W - tx - 10), tx, 10);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
          const d = new Date();
          doc.text(`Corporação ${corp()}  |  Gerado no CB360 Online em ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`, tx, 19.5);
          let y = 30;
          SPEC.sections.filter(s => cond(s.showIf)).forEach(s => {
            if (y > 250) {doc.addPage(); y = 16;}
            const rows = s.f.filter(visible).map(f => [f.l.replace(/\s*\(m\)$/, '').replace(/\s*\(até \d+\)$/, ''), fmtValue(f)]);
            doc.autoTable({startY: y, margin: {left: 12, right: 12}, head: [[{content: s.t.toUpperCase(), colSpan: 2}]], body: rows, theme: 'grid',
                           headStyles: {fillColor: [217, 225, 242], textColor: [31, 78, 120], fontStyle: 'bold', fontSize: 9.5, cellPadding: 2.4},
                           styles: {fontSize: 9, cellPadding: 2.2, lineColor: [210, 214, 220], lineWidth: 0.2, textColor: [30, 30, 30], valign: 'top'},
                           columnStyles: {0: {cellWidth: 68, fontStyle: 'bold', textColor: [60, 60, 60], fillColor: [249, 250, 252]}, 1: {cellWidth: 'auto'}}});
            y = doc.lastAutoTable.finalY + 5;
          });
          if (y > 262) { doc.addPage(); y = 20; }
          y += 6;
          doc.setDrawColor(150); doc.setLineWidth(0.3); doc.setTextColor(80); doc.setFontSize(8.5);
          doc.line(12, y + 10, 92, y + 10); doc.line(W - 92, y + 10, W - 12, y + 10);
          doc.text('Responsável pelo preenchimento (nome / posto)', 12, y + 14);
          doc.text('Assinatura', W - 92, y + 14);
          const n = doc.getNumberOfPages();
          for (let i = 1; i <= n; i++) {
            doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(140);
            doc.text(`${SPEC.short}  |  NRBQ  |  DON N.º 3`, 12, 290);
            doc.text(`Página ${i} de ${n}`, W - 12, 290, {align: 'right'});
          }
          const occ = String(D.ocorrencia || '').replace(/[^A-Za-z0-9-]+/g, '_').replace(/^_+|_+$/g, '');
          doc.save(`${SPEC.file}${occ ? '_' + occ : ''}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.pdf`);
        } catch (e) {
          console.error('[NRBQ FNI] Erro no PDF:', e);
          note('Não foi possível gerar o PDF.', 'popup-danger');
        } finally {btn.disabled = false;}
      }
      /* ----------------------------- arranque: só quando o painel é aberto ----------------------------- */
      async function start() {
        if (ST.loaded || !shell()) return;
        ST.loaded = true;
        const last = +ssGet(CUR_KEY());
        if (last) await openForm(last); else {render(); prefillUser(); loadList();}
      }
      window.addEventListener('beforeunload', () => {if (ST.dirty) persist();});
      const panel = () => document.getElementById('panel-nrbq-fni');
      new MutationObserver(() => {const p = panel(); if (p && p.classList.contains('active')) start();})
        .observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class']});
      window.nrbqFniStart = start;
    })();
