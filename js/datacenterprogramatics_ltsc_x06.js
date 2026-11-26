 /* =======================================================================
   CENTRO DE DADOS (CB360)
   ======================================================================= */
(function () {
  const PAGE = document.getElementById('page-data');
  if (!PAGE) return;

  /* ----------------------------- estilos ----------------------------- */
  (function css() {
    if (document.getElementById('dc-css')) return;
    const st = document.createElement('style');
    st.id = 'dc-css';
    st.textContent = `
      /* regras vindas dos ficheiros CSS gerais (só usadas neste módulo) */
      /* - de cards_ltsc_x04.css */
      .transparent-card {border: 2px solid #888; border-radius: 8px; background-color: transparent; padding: 15px; margin: 0 0 0 0;}
      .transparent-card .card-header {font-weight: bold; font-size: 16px; margin-bottom: 10px;}
      /* - de tables_ltsc_x04.css */
      .tab-btn {flex: 1; font-size: 10px; padding: 10px 5px; background: #f1f5f9; border: none; border-right: 1px solid #ddd; cursor: pointer; color: #64748b; font-weight: 600; text-transform: uppercase;
                transition: all 0.2s;}
      .tab-btn.active {background: #fff; border-bottom: 2px solid #1e40af; color: #1e40af; font-weight: bold;}
      .tab-content {display: none; padding: 10px; height: 250px; overflow-y: auto;}
      .tab-content.active {display: block;}
      /* - regras próprias do módulo */
      #page-data .major-card-header svg {opacity: .9;}
      #page-data .dc-r {display: flex; align-items: center; gap: 10px; margin-bottom: 3px;}
      #page-data .dc-r > label.f0 {flex-shrink: 0;}
      #page-data input.c {text-align: center;}
      /* corporação */
      #page-data .dc-corp {display: flex; gap: 10px; align-items: flex-start; flex-wrap: wrap;}
      #page-data .dc-logo {flex: 0 0 auto; border: 2px solid #ccc; border-radius: 8px; background-color: transparent; padding: 10px; width: 250px;}
      #page-data .dc-logo .card-header {text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px;}
      #page-data .dc-logo .card-content {text-align: center;}
      #page-data .dc-logo .img {margin: 10px 0;}
      #page-data .data-logo {width: 140px; height: 140px; border-radius: 5px; object-fit: cover; border: 1px solid #ccc; background: #888;}
      #page-data .dc-logo .btns {display: flex; gap: 5px; margin-top: 5px;}
      #page-data .dc-logo .btns.first {margin-top: 15px;}
      #page-data .dc-logo .btns .btn {flex: 1;}
      #page-data #corp-logo-input, #page-data #win_photo_input {display: none;}
      #page-data .dc-corp-form {flex: 1; max-width: 100%; height: 275px; overflow-y: auto; overflow-x: hidden; padding: 20px;}
      #page-data .dc-corp-form .dc-r {margin-bottom: 4px;}
      #page-data .dc-corp-form .dc-r.last {margin-bottom: -5px;}
      #page-data .dc-corp-form label {font-size: 13px;}
      #page-data .dc-corp-form input, #page-data .dc-corp-form select {padding: 4px; border: 1px solid #ccc; border-radius: 3px;}
      #page-data .dc-corp-save {text-align: right; margin-top: 10px;}
      #page-data .dc-corp-save .btn {padding: 6px 20px; cursor: pointer;}
      /* elementos */
      #page-data .dc-search {position: relative; display: flex; align-items: center;}
      #page-data #win_search_element {width: 300px; padding-right: 30px;}
      #page-data .dc-search svg {position: absolute; right: 8px; pointer-events: none; color: #aaa;}
      #page-data #elements-list, #page-data #elements-edit {padding: 0px; margin-top: 20px;}
      #page-data #elements-list .table-container {height: 500px; margin: 0;}
      #page-data #elements-container thead tr, #page-data #veícs-container thead tr {height: 40px;}
      #page-data .dc-edit-title {padding: 16px 20px; border-bottom: 1px solid #eee;}
      #page-data .dc-edit-title h3 {margin: 0; font-size: 16px;}
      #page-data #elements-tabs {display: flex; border-bottom: 1px solid #ddd;}
      #page-data .dc-tabs-body {padding: 20px;}
      #page-data .dc-main {display: flex; gap: 20px; align-items: flex-start;}
      #page-data .dc-photo {display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;}
      #page-data #win_photo_preview {width: 130px; height: 130px; border: 2px dashed #ccc; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fafafa;}
      #page-data .dc-photo .btn {width: 130px; padding: 6px 0;}
      #page-data .dc-photo .btn.rm {background: #eee; color: #555;}
      #page-data .dc-col {flex: 1; display: flex; flex-direction: column; gap: 0;}
      #page-data .dc-cols {display: flex; gap: 25px; align-items: flex-start; margin-bottom: 25px;}
      #page-data .dc-boxes {display: flex; gap: 15px; flex-wrap: wrap;}
      #page-data .dc-box {flex: 1; min-width: 240px; border: 1px solid #ddd; border-radius: 6px; padding: 12px 15px;}
      #page-data .dc-box > div:first-child {font-size: 14px; font-weight: bold; color: #a70c0c; margin-bottom: 10px;}
      #page-data .dc-box input {flex: 1; min-width: 0;}
      #page-data .dc-cred-title {margin-bottom: 15px; font-size: 15px; color: #777;}
      #page-data .dc-cred-title.mob {margin: 15px 0;}
      #page-data .dc-acc {display: flex; gap: 60px; flex-wrap: wrap; align-items: flex-start;}
      #page-data .dc-acc .dc-r {align-items: flex-start;}
      #page-data .dc-acc .dc-r > label {margin-right: 20px; font-size: 14px; white-space: nowrap;}
      #page-data .dc-acc .dc-r.ml50 {margin-left: 50px;}
      #page-data .dc-save {padding: 15px 20px; border-top: 1px solid #eee; text-align: right;}
      /* veículos */
      #page-data #panel-veícs .major-card-body {padding: 10px;}
      #page-data .dc-veic {display: flex; align-items: center; flex-wrap: wrap; margin-bottom: 3px; gap: 5px;}
      #page-data .dc-veic label {font-size: 12px; color: #555;}
      #page-data .dc-veic input, #page-data .dc-veic select {padding: 5px; border: 1px solid #ccc; border-radius: 4px;}
      #page-data .dc-veic input[type=date] {padding: 4px;}
      #page-data .dc-veic select {background: white;}
      #page-data #panel-veícs .table-container {height: 403px; margin-top: 5px;}
      /* emails */
      #page-data .dc-mail-note {color: red; font-weight: bold; font-style: italic; font-size: 12px;}
      #page-data .emails-config-container {max-height: 450px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; background: #fafafa; padding: 10px;}
      #page-data .emails-config-container .major-card {margin-bottom: 10px;}
      #page-data .emails-config-container .major-card.mb0 {margin-bottom: 0;}
      #page-data .dc-mail {display: flex; align-items: center; margin-bottom: 3px; white-space: nowrap; gap: 5px;}
      #page-data .dc-mail input {width: 100%;}
      /* ===== layout novo (só estilo; ids e funções iguais) ===== */
      #page-data .options-panel-container {background: #efefef; padding: 12px; gap: 12px; align-items: stretch;}
      #page-data .panel-sidebar {width: 230px; flex: 0 0 230px; background: #fff; backdrop-filter: none; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); padding: 8px;
                      align-self: stretch; box-sizing: border-box;}
      #page-data .panel-sidebar-menu-button {height: 34px; margin: 0 0 2px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: #2c3e50; font-size: 12px; font-weight: 600; gap: 0;
                      box-shadow: none; transition: background .15s, color .15s;}
      #page-data .panel-sidebar-menu-button::before, #page-data .panel-sidebar-menu-button::after {display: none;}
      #page-data .panel-sidebar-menu-button:hover {background: #f4f6f8; color: #b71c1c; transform: none; border: 0;}
      #page-data .panel-sidebar-menu-button.active {background: #fdecea; color: #b71c1c; font-weight: 800; border: 0; box-shadow: inset 3px 0 0 #c62828; padding-left: 12px;}
      #page-data .panel-content {background: transparent; overflow: visible; min-width: 0;}
      #page-data .panel-card {background: transparent; padding: 0; min-height: 0; animation: none;}
      #page-data .panel-card.active {display: flex; flex-direction: column; gap: 10px;}
      #page-data .panel-card > h3 {display: flex; align-items: center; gap: 9px; margin: 0; padding: 12px 14px 2px; background: #fff; border: 1px solid #e9ecef; border-bottom: 0; border-radius: 12px 12px 0 0;
                      font-size: 13px; font-weight: 800; color: #2c3e50; letter-spacing: .4px;}
      #page-data .panel-card > h3::before {content: ''; width: 4px; height: 16px; border-radius: 3px; background: #c62828; flex-shrink: 0;}
      #page-data .panel-card > h3 + p {margin: -10px 0 0; padding: 0 14px 11px 27px; background: #fff; border: 1px solid #e9ecef; border-top: 0; border-radius: 0 0 12px 12px; font-size: 12px; color: #6c757d;
                      line-height: 1.4; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
      #page-data .dc-mail-note {margin: 0; padding: 8px 12px; background: #fdecea; border: 1px solid #f3c1bc; border-radius: 10px; color: #b71c1c; font-size: 11.5px; font-style: normal;}
      #page-data .options-main-card, #page-data .transparent-card.dc-logo {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
      /* campos */
      #page-data label {font-size: 10.5px; font-weight: 800; color: #6c757d; text-transform: uppercase; letter-spacing: .3px;}
      #page-data input:not([type=checkbox]):not([type=radio]):not([type=file]), #page-data select {height: 30px; box-sizing: border-box; padding: 0 9px; border: 1px solid #c8c8c8; border-radius: 6px;
                      font-size: 12.5px; background-color: #fff;}
      #page-data input:not([type=checkbox]):not([type=radio]):focus, #page-data select:focus {border-color: #c62828; box-shadow: 0 0 0 2px rgba(198,40,40,.12); outline: none;}
      #page-data input[readonly], #page-data input:disabled {background: #f4f6f8; color: #6c757d;}
      #page-data .dc-r, #page-data .dc-veic, #page-data .dc-mail {gap: 8px; margin-bottom: 6px;}
      /* botões */
      #page-data .btn {transform: none !important; box-shadow: none; border-radius: 8px !important; font-weight: 800 !important; letter-spacing: .4px; border-bottom-width: 0;}
      #page-data .btn-success, #page-data .btn-add {background: linear-gradient(180deg,#d64535,#b0281a) !important; color: #fff !important; border: 0 !important; box-shadow: 0 2px 6px rgba(176,40,26,.25) !important;}
      #page-data .btn-success:hover, #page-data .btn-add:hover {filter: brightness(1.06);}
      #page-data .btn-analyze, #page-data .btn-danger, #page-data .dc-photo .btn, #page-data .dc-logo .btn-success {background: #fff !important; color: #2c3e50 !important; border: 1px solid #d0d5da !important;
                      box-shadow: none !important;}
      #page-data .btn-danger, #page-data .dc-photo .btn.rm {color: #b71c1c !important;}
      #page-data .btn-analyze:hover, #page-data .btn-danger:hover, #page-data .dc-photo .btn:hover, #page-data .dc-logo .btn-success:hover {border-color: #e6b3ad !important; background: #fdf6f5 !important;}
      #page-data .dc-corp-save .btn, #page-data .dc-save .btn, #page-data .action-buttons .btn, #page-data [data-act="elem-add"] {height: 34px; padding: 0 22px; font-size: 11.5px;}
      /* corporação */
      #page-data .dc-corp {gap: 10px;}
      #page-data .dc-logo {width: 230px; padding: 12px 14px;}
      #page-data .dc-logo .card-header {font-size: 12px; font-weight: 800; color: #2c3e50; letter-spacing: .4px; text-align: left; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #eef0f2;
                      padding-bottom: 8px; margin-bottom: 10px;}
      #page-data .dc-logo .card-header::before {content: ''; width: 4px; height: 14px; border-radius: 3px; background: #c62828;}
      #page-data .data-logo {border-radius: 12px; border: 1px solid #e3e7eb; background: #f8f9fa;}
      #page-data .dc-logo .btns .btn {height: 30px; font-size: 10.5px; padding: 0;}
      #page-data .dc-logo .btns:last-child .btn-add {background: linear-gradient(180deg,#d64535,#b0281a) !important;}
      #page-data .dc-corp-form {padding: 14px 16px;}
      #page-data .dc-corp-form label {font-size: 10.5px;}
      #page-data .dc-corp-save {margin-top: 0;}
      /* elementos */
      #page-data #elements-list, #page-data #elements-edit {margin-top: 0;}
      #page-data #elements-list {padding: 12px 14px;}
      #page-data #win_search_element {width: 300px;}
      #page-data .table-container {border: 1px solid #d3d8dd; border-radius: 10px; box-shadow: none; scrollbar-width: thin; scrollbar-color: #cfd4da transparent;}
      #page-data .table-container thead, #page-data .table-container th {background: #f1f3f5 !important;}
      #page-data .table-container th {color: #5b6670 !important; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px; border-color: #d3d8dd !important;}
      #page-data .table-container td {border-color: #d3d8dd !important; font-size: 12.5px;}
      #page-data .table-container tbody tr:nth-child(even) {background-color: transparent;}
      #page-data .table-container tbody tr:hover {background-color: #fdf6f5;}
      #page-data .table-container td[colspan] {border-left: 0 !important;}
      #page-data .table-container tbody tr:not(:has(~ tr:not([style*="display: none"]))) > td {border-bottom: 0 !important;}
      #page-data #elements-edit {padding: 0; overflow: hidden;}
      #page-data .dc-edit-title {padding: 12px 16px; border-bottom: 1px solid #eef0f2;}
      #page-data .dc-edit-title h3 {display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #2c3e50; text-transform: uppercase; letter-spacing: .4px; border: 0; padding: 0;}
      #page-data .dc-edit-title h3::before {content: ''; width: 4px; height: 16px; border-radius: 3px; background: #c62828;}
      #page-data #elements-tabs {display: inline-flex; align-self: flex-start; gap: 2px; margin: 12px 16px 0; padding: 3px; background: #f1f3f5; border: 0; border-radius: 999px;}
      #page-data #elements-tabs .tab-btn {flex: none; height: 28px; padding: 0 16px; border: 0; border-radius: 999px; background: transparent; color: #2c3e50; font-size: 11px; font-weight: 800; letter-spacing: .3px;}
      #page-data #elements-tabs .tab-btn:hover {background: #e4e7ea;}
      #page-data #elements-tabs .tab-btn.active {background: #2c3e50; color: #fff; border: 0;}
      #page-data .dc-tabs-body {padding: 14px 16px;}
      #page-data #win_photo_preview {border: 2px dashed #d3d8dd; border-radius: 12px; background: #f8f9fa;}
      #page-data .dc-photo .btn {height: 30px; font-size: 11px;}
      #page-data .dc-box {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 12px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
      #page-data .dc-box > div:first-child {display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: #2c3e50; text-transform: uppercase; letter-spacing: .4px;
                      border-bottom: 1px solid #eef0f2; padding-bottom: 8px;}
      #page-data .dc-box > div:first-child::before {content: ''; width: 4px; height: 14px; border-radius: 3px; background: #c62828;}
      #page-data .dc-cred-title {display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: #2c3e50; text-transform: uppercase; letter-spacing: .4px;}
      #page-data .dc-cred-title::before {content: ''; width: 4px; height: 14px; border-radius: 3px; background: #c62828;}
      #page-data .dc-save {border-top: 1px solid #eef0f2; padding: 12px 16px;}
      #page-data .options-main-footer {background: transparent;}
      /* cartões dentro dos painéis (Novo Veículo, Emails) */
      #page-data .panel-card .major-card {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); overflow: hidden; margin: 0;}
      #page-data .panel-card .major-card-header.header-black {text-shadow: none; box-shadow: none; background: #fff; color: #2c3e50; border-bottom: 1px solid #eef0f2; padding: 10px 14px; font-size: 12px; font-weight: 800; letter-spacing: .4px;
                      display: flex; align-items: center; gap: 8px;}
      #page-data .panel-card .major-card-header.header-black::before {content: ''; position: static; width: 4px; height: 14px; border-radius: 3px; background: #c62828; flex-shrink: 0;}
      #page-data .panel-card .major-card-header.header-black svg {display: none;}
      #page-data .panel-card .major-card-body {background: #fff; padding: 12px 14px;}
      #page-data .panel-card .major-card-footer {background: #fff; border-top: 1px solid #eef0f2; box-shadow: none; padding: 10px 14px;}
      #page-data .panel-card .major-card-footer::before {display: none;}
      #page-data #panel-veícs .table-container {margin-top: 0;}
      #page-data .emails-config-container {background: transparent; border: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin; scrollbar-color: #cfd4da transparent;}
      #page-data .emails-config-container .major-card, #page-data .emails-config-container .major-card.mb0 {margin: 0; flex-shrink: 0;}
      /* emails: a lista ocupa o espaço até ao fundo do menu lateral (scroll lá dentro) */
      #page-data .panel-content:has(> #panel-mails.active) {position: relative;}
      #page-data #panel-mails.active {position: absolute; inset: 0;}
      #page-data #panel-mails .emails-config-container {flex: 1 1 0; min-height: 0; max-height: none;}
    `;
    document.head.appendChild(st);
  })();

  /* ----------------------------- peças ----------------------------- */
  const ICON_USER = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
  const ICON_MAIL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path></svg>';
  const opts = list => list.map(o => `<option>${o}</option>`).join('');
  const yesNo = '<option value="true">Sim</option><option value="false">Não</option>';
  const R = (inner, cls = '') => `<div class="major-field"><div class="dc-r${cls ? ' ' + cls : ''}">${inner}</div></div>`;
  const L = (text, w, f0 = true) => `<label${f0 ? ' class="f0"' : ''}${w ? ` style="width:${w}px"` : ''}>${text}</label>`;
  const I = (id, style = 'flex:1', extra = '') => `<input type="text" id="${id}" style="${style}"${extra}>`;
  const D = (id, style = 'width:150px') => `<input type="date" id="${id}" style="${style}">`;
  const S = (id, style, inner) => `<select id="${id}" style="${style}">${inner}</select>`;
  /* linha simples "rótulo + caixa que estica" (Outros Dados) */
  const line = (lw, label, id, type = 'text') => R(L(label, lw) + (type === 'date' ? D(id, 'flex:1; min-width:0') : I(id, lw === 85 ? 'flex:1; min-width:0' : 'flex:1')));
  const box = (title, rows) => `<div class="dc-box"><div>${title}</div>${rows.map(([l, id, t]) => line(85, l, id, t)).join('')}</div>`;
  const num = (n, ph) => ` maxlength="${n}" inputmode="numeric" data-num placeholder="${ph}"`;
  const tel = ph => ` maxlength="16" inputmode="tel" data-tel placeholder="${ph}"`;

  /* emails: ordem, ids e categorias como antes */
  const MAIL_CARDS = [
    {key: 'plandir_emit', ids: ['to', 'cc', 'bcc'].map(f => `config_plandir_emit_${f}`), title: 'CONFIGURAÇÃO DE EMAILS PARA EMISSÃO DE PLANEAMENTOS DIÁRIOS.'},
    {key: 'pointjustif', title: 'CONFIGURAÇÃO DE EMAILS PARA JUSTIFICAÇÃO DE PICAGENS DE PONTO.'},
    {key: 'solfardam', title: 'CONFIGURAÇÃO DE EMAILS PARA SOLICITAÇÃO DE FARDAMENTO.'},
    {key: 'sitop_veiculos', title: 'CONFIGURAÇÃO DE EMAILS PARA SITUAÇÃO OPERACIONAL DE VEÍCULOS (CREPC).'},
    {key: 'moa', title: 'CONFIGURAÇÃO DE EMAILS PARA MEDIDAS OPERACIONAIS DE ANTECIPAÇÃO (CREPC).'},
    {key: 'bulk', title: 'CONFIGURAÇÃO DE EMAILS PARA ENVIOS EM MASSA (LISTA DE CONTACTOS).'},
    {key: 'attendance', title: 'CONFIGURAÇÃO DE EMAILS PARA LISTA DE COMPARÊNCIAS.'},
    {key: 'volunt_verify', title: 'CONFIGURAÇÃO DE EMAILS PARA SERVIÇOS DE VOLUNTARIADO - ENVIO PARA VALIDAÇÃO.'},
    {key: 'volunt_valid', title: 'CONFIGURAÇÃO DE EMAILS PARA SERVIÇOS DE VOLUNTARIADO - SERVIÇOS VALIDADOS.', mb0: 1},
    {key: 'volunt_invalid', title: 'CONFIGURAÇÃO DE EMAILS PARA SERVIÇOS DE VOLUNTARIADO - SERVIÇOS COM INCONSISTÊNCIAS.'},
    {key: 'decir_disp', title: 'CONFIGURAÇÃO DE EMAILS PARA DISPONIBILIDADES DECIR (MENSAGEM WHATSAPP).', mb0: 1, labels: [['Remeter para:', 110], ['Com conhecimento de:', 160]]},
    {key: 'rh_disp', title: 'CONFIGURAÇÃO DE EMAILS PARA DISPONIBILIDADES DAS ESCALAS INEM / EIP / OPTEL (MENSAGEM WHATSAPP).', mb0: 1, labels: [['Remeter para:', 110], ['Com conhecimento de:', 160]]}
  ];
  const MAIL_LABELS = [['Emails Para:', 80], ['Emails com Conhecimento:', 190], ['Emails com Conhecimento (BCC):', 240]];
  const mailCard = c => {
    const labels = c.labels || MAIL_LABELS;
    const ids = c.ids || labels.map((_, i) => `config_${c.key}_mail_${['to', 'cc', 'bcc'][i]}`);
    return `<div class="major-card${c.mb0 ? ' mb0' : ''}">
      <div class="major-card-header header-black">${ICON_MAIL}<span>${c.title}</span></div>
      <div class="major-card-body">${labels.map(([l, w], i) => `<div class="major-field"><div class="dc-mail"><label style="width:${w}px">${l}</label>
        <input type="text" id="${ids[i]}" placeholder="exemplo@mail.com,exemplo2@mail.com"></div></div>`).join('')}</div>
      <div class="major-card-footer"><div class="action-buttons" id="config_${c.key}_mail"><button class="btn btn-add" id="config_${c.key}_mail_save">ADICIONAR</button></div></div>
    </div>`;
  };

  /* ----------------------------- página ----------------------------- */
  PAGE.innerHTML = `
    <div class="major-card major-last-card">
      <div class="major-card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>
        <span>CENTRO DE DADOS</span>
      </div>
      <div class="options-panel-container">
        <div class="panel-sidebar">
          <button class="panel-sidebar-menu-button active" data-panel="assoc">Corporação</button>
          <button class="panel-sidebar-menu-button" data-panel="elems">Elementos</button>
          <button class="panel-sidebar-menu-button" data-panel="veícs">Veículos</button>
          <button class="panel-sidebar-menu-button" data-panel="mails">Emails Config.</button>
        </div>
        <div class="panel-content">

          <div id="panel-assoc" class="panel-card active">
            <h3>DADOS DA CORPORAÇÃO</h3>
            <p>Dados Gerais do Corpo de Bombeiros.</p>
            <div class="dc-corp">
              <div class="transparent-card dc-logo">
                <div class="card-header">LOGO</div>
                <div class="card-content">
                  <div class="img"><img alt="logo" class="data-logo"></div>
                  <input type="file" id="corp-logo-input" accept="image/*">
                  <div class="btns first"><button class="btn btn-success" data-act="logo-pick">ALTERAR</button><button class="btn btn-analyze" data-act="logo-reset">REPOR</button></div>
                  <div class="btns"><button class="btn btn-danger" data-act="logo-remove">REMOVER</button><button class="btn btn-add" data-act="logo-save">GUARDAR</button></div>
                </div>
              </div>
              <div class="options-main-card dc-corp-form">
                ${R(L('Nome da Associação:', 0, false) + I('assoc-name'))}
                ${R(L('Nome do CB:', 0, false) + I('cb-name'))}
                ${R(L('Morada do CB:', 0, false) + I('assoc-address'))}
                ${R(L('Localidade:', 0, false) + I('assoc-localidade', 'width:280px') + L('Código-Postal:', 0, false) + I('assoc-cp1', 'width:65px', ' class="c"' + num(4, '0000'))
                    + '<span>-</span>' + I('assoc-cp2', 'width:50px', ' class="c"' + num(3, '000')))}
                ${R(L('Distrito:', 0, false) + S('district_select_corp', 'width:175px', '') + L('Concelho:', 0, false) + S('council_select_corp', 'width:250px', '')
                    + L('Freguesia:', 0, false) + S('parish_select_corp', 'flex:1', ''))}
                ${R(L('NIF:', 0, false) + I('assoc-nif', 'width:150px', ' class="c"' + num(9, '999999999')) + L('Núm. Operacional:', 0, false)
                    + I('assoc-operational-nr', 'width:100px', ' class="c"' + num(4, '0000')) + L('Área de Avisos IPMA:', 0, false) + S('assoc-ipma-area', 'flex:1', ''))}
                ${R(L('Telemovél:', 0, false) + I('assoc-mobile-phone', 'width:150px', ' class="c"' + tel('+351 900 000 000')) + L('Telefone:', 0, false)
                    + I('assoc-landline-phone', 'width:150px', ' class="c"' + tel('+351 289 000 000')) + L('E-Mail:', 0, false) + I('assoc-email'), 'last')}
              </div>
            </div>
            <div class="dc-corp-save"><button class="btn btn-success" id="dc-save-corp" data-act="corp-save">ATUALIZAR</button></div>
          </div>

          <div id="panel-elems" class="panel-card">
            <h3>LISTAGEM DE ELEMENTOS</h3>
            <p>Adição, Remoção e Edição de elementos.</p>
            ${R(`<label for="win_search_element">Procurar</label>
                 <div class="dc-search"><input type="text" id="win_search_element" placeholder="Procurar Elemento">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                 <div style="flex:1"></div><button class="btn btn-add" data-act="elem-add">ADICIONAR</button>`)}
            <div class="options-main-card" id="elements-list">
              <div class="table-container"><table id="elements-container"><thead><tr>
                <th>Nº Interno</th><th>Nº Mecanográfico</th><th>Patente/Função</th><th>Nome Completo</th><th>Estado</th><th>Ações</th>
              </tr></thead><tbody></tbody></table></div>
            </div>
            <div class="options-main-card" id="elements-edit" style="display:none">
              <div class="dc-edit-title"><h3>Adicionar elemento</h3></div>
              <div id="elements-tabs">
                <button class="tab-btn active" data-tab="mainData">Dados Pessoais</button><button class="tab-btn" data-tab="otherData">Outros Dados</button>
                <button class="tab-btn" data-tab="appCredencials">Credenciais APP's</button><button class="tab-btn" data-tab="mainAccess">Acessos APP's</button>
              </div>
              <div class="dc-tabs-body">
                <div class="tab-content" id="mainData">
                  <div class="dc-main">
                    <div class="dc-photo">
                      <div id="win_photo_preview">${ICON_USER}</div>
                      <input type="file" id="win_photo_input" accept="image/*">
                      <button type="button" class="btn btn-add" data-act="photo-pick">📷 Escolher</button>
                      <button type="button" class="btn rm" data-act="photo-remove">🗑️ Remover</button>
                    </div>
                    <div class="dc-col">
                      ${R(L('Estado:', 75) + S('win_state', 'width:100px', opts(['&nbsp;', 'Ativo', 'Inativo'])) + '<label style="display:none">Desde:</label>' + D('win_state_from', 'width:150px; display:none')
                          + L('Tipo:', 30) + S('win_type', 'width:150px', opts(['&nbsp;', 'Administrador', 'Sub-Administrador', 'Utilizador']))
                          + L('OFOPE:', 40) + S('win_ofope', 'width:150px', opts(['&nbsp;', 'Sim', 'Não'])) + L('Vínculo:', 55) + S('link_type', 'width:150px', opts(['&nbsp;', 'Voluntário', 'Profissional'])))}
                      ${R(L('Nº Interno:', 75) + I('win_n_int', 'width:60px', ' class="c"') + L('Nº Mecanográfico:', 125) + I('win_n_file', 'width:120px', ' class="c"'))}
                      ${R(L('Patente:', 75) + S('win_patent', 'width:150px', '') + I('win_patent_abv', 'width:75px', ' class="c" readonly tabindex="-1"')
                          + L('Secção:', 50) + S('win_section', 'width:110px', opts(['&nbsp;', '1ª Secção', '2ª Secção', '3ª Secção', '4ª Secção']))
                          + L('Quadro:', 60) + S('win_quad', 'width:110px', opts(['&nbsp;', 'QCOM', 'QATIV', 'QEST', 'QEA', 'QHR', 'QRES'])))}
                      <div class="major-field"><div class="dc-r" style="display:none">${L('Nome Abreviado:', 100)}${I('win_abv_name')}</div></div>
                      ${R(L('Nome:', 75) + I('win_full_name'))}
                      ${R(L('M. Ligeiros:', 75) + S('win_ML', 'width:75px', yesNo) + '<label>M. Pesados:</label>' + S('win_MP', 'width:75px', yesNo) + '<label>TAS:</label>' + S('win_TAS', 'width:75px', yesNo))}
                    </div>
                  </div>
                </div>
                <div class="tab-content" id="otherData" style="display:none">
                  <div class="dc-cols">
                    <div class="dc-col">
                      ${line(100, 'Morada:', 'win_adress')}${line(100, 'Localidade:', 'win_localitie')}
                      ${R(L('Código Postal:', 100) + I('win_cpcode01', 'width:70px', ' class="c"') + '<label>-</label>' + I('win_cpcode02', 'width:50px', ' class="c"'))}
                      ${R(L('D. Nascimento:', 100) + D('win_birth_date') + I('win_age', 'width:100px', ' disabled'))}
                      ${line(100, 'Naturalidade:', 'win_birthplace')}${line(100, 'NIF:', 'win_nif')}${line(100, 'NIB:', 'win_nib')}
                    </div>
                    <div class="dc-col">
                      ${line(100, 'Nome Pai:', 'win_father_name')}${line(100, 'Nome Mãe:', 'win_mother_name')}${line(100, 'Profissão:', 'win_profession')}${line(100, 'Habilitações:', 'win_education')}
                      ${R(L('Estado Cívil:', 100) + S('win_civil_state', 'flex:1', opts(['&nbsp;', 'Solteiro', 'Casado', 'União de Facto', 'Divorciado', 'Viúvo'])))}
                      ${R(L('Grupo Sang.:', 100) + S('win_blood_type', 'width:80px', opts(['&nbsp;', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])) + '<label>Nº Utente:</label>' + I('win_health_nr'))}
                      ${R(L('Nº TAT:', 100, false) + I('win_tat_nr', 'flex:1; width:110px') + L('Nº TAS:', 50, false) + I('win_tas_nr', 'flex:1; width:110px'))}
                    </div>
                    <div class="dc-col">
                      ${[['NISS:', 'win_niss'], ['Telefone:', 'win_phone'], ['Telemóvel 1:', 'win_mobile'], ['Telemóvel 2:', 'win_mobile2'], ['T. Emprego:', 'win_work_phone'], ['Email:', 'win_mail'],
                         ['C. Emerg.:', 'win_emergency_contact']].map(([l, id]) => line(90, l, id)).join('')}
                    </div>
                  </div>
                  <div class="dc-boxes">
                    ${box('BI / CC', [['Número:', 'win_bicc_number'], ['Arquivo:', 'win_bicc_archive'], ['D. Emissão:', 'win_bicc_issue', 'date'], ['Validade:', 'win_bicc_validate', 'date']])}
                    ${box('Carta Condução', [['Tipo:', 'win_license_type'], ['Número:', 'win_license_number'], ['Entidade:', 'win_license_entity'], ['D. Emissão:', 'win_license_issue', 'date'],
                                             ['Validade:', 'win_license_validate', 'date']])}
                    ${box('Serviço Militar', [['Número:', 'win_military_number'], ['Unidade:', 'win_military_unit'], ['Ano Entrada:', 'win_military_year'], ['Graduação:', 'win_military_rank']])}
                    ${box('Aeroporto', [['Nº Cartão:', 'win_airport_card'], ['Validade:', 'win_airport_card_validate', 'date'], ['Nº C.C.:', 'win_airport_cc'], ['C.C. Validade:', 'win_airport_cc_validate', 'date']])}
                  </div>
                </div>
                <div class="tab-content" id="appCredencials" style="display:none">
                  <div class="dc-cred-title">Acessos CB360 Online</div>
                  ${R('<label>Username:</label>' + I('win_user_name_main') + '<label>Password:</label><input type="password" id="win_password_main" style="flex:1">')}
                  ${R('<label>Válido até:</label>' + D('win_validate_main', 'width:175px'))}
                  <div class="dc-cred-title mob">Acessos CB360 Mobile</div>
                  ${R('<label>Username:</label>' + I('win_user_name_mobile') + '<label>Password:</label><input type="password" id="win_password_mobile" style="flex:1">')}
                  ${R('<label>Válido até:</label>' + D('win_validate_mobile', 'width:175px'))}
                </div>
                <div class="tab-content" id="mainAccess" style="display:none">
                  <div class="dc-acc">
                    ${R('<label>💻 Online:</label><div class="checkbox-group" id="access-container"></div>')}
                    ${R('<label>📱 Mobile:</label><div class="checkbox-group" id="mobile-access-container"></div>', 'ml50')}
                  </div>
                </div>
              </div>
              <div class="options-main-footer"><div class="dc-save"><button class="btn btn-success" id="elems-saveBtn">💾 Guardar</button></div></div>
            </div>
          </div>

          <div id="panel-veícs" class="panel-card">
            <h3>LISTAGEM DE VEÍCULOS</h3>
            <p>Adição, Remoção e Edição de Veículos.</p>
            <div class="major-card">
              <div class="major-card-header header-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                  <circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
                <span>NOVO VEÍCULO</span>
              </div>
              <div class="major-card-body">
                <div class="major-field">
                  <div class="dc-veic"><label>NOMENCLATURA:</label><input type="text" id="new-veíc-name" style="width:150px">
                    <label>MATRÍCULA:</label><input type="text" id="new-veíc-registration" class="c" style="width:110px" placeholder="00-AA-00">
                    <label>MARCA:</label><input type="text" id="new-veíc-brand" style="width:230px"><label>MODELO:</label><input type="text" id="new-veíc-model" style="width:230px"></div>
                  <div class="dc-veic"><label>DATA COMPRA:</label><input type="date" id="new-veíc-buy-date" style="width:150px">
                    <label>DATA MATRÍCULA:</label><input type="date" id="new-veíc-registration-date" style="width:150px">
                    <label>ESTADO OPERACIONAL:</label><select id="new-veíc-state" style="width:250px">${opts(['&nbsp;', 'Disponível no Quartel', 'Em Serviço', 'Inoperacional'])}</select></div>
                </div>
              </div>
              <div class="major-card-footer"><div class="action-buttons" id="new-veíc-save"><button class="btn btn-add" id="new-veíc-save-update">ADICIONAR</button></div></div>
            </div>
            <div class="table-container"><table id="veícs-container"><thead><tr><th>Veículo</th><th>Matrícula</th><th>Estado Operacional</th><th>Ações</th></tr></thead><tbody></tbody></table></div>
          </div>

          <div id="panel-mails" class="panel-card">
            <h3>CONFIGURAÇÃO DE EMAILS</h3>
            <p>Configuração de emails para envio das Situações Operacionais de Veículos e Medidas Operacionais de Antecipação.</p>
            <p class="dc-mail-note">Os emails inseridsos, deverão ser separados apenas por uma virgula como indicado em exemplo na textbox.</p>
            <div class="emails-config-container">${MAIL_CARDS.map(mailCard).join('')}</div>
          </div>

        </div>
      </div>
      <div class="major-card-footer"></div>
    </div>`;

  /* ----------------------------- botões (ex-onclick) e filtros ----------------------------- */
  const ACTS = {
    'logo-pick': () => document.getElementById('corp-logo-input').click(), 'logo-reset': () => resetCorpLogo(), 'logo-remove': () => removeCorpLogo(), 'logo-save': () => saveCorpLogo(),
    'corp-save': () => saveCorporationData(), 'elem-add': () => toggleElementsView(),
    'photo-pick': () => document.getElementById('win_photo_input').click(), 'photo-remove': () => removePhoto()
  };
  PAGE.addEventListener('click', e => {
    const menu = e.target.closest('.panel-sidebar-menu-button[data-panel]');
    if (menu) return showPanelCardDataCenter(menu.dataset.panel);
    const b = e.target.closest('[data-act]');
    if (b && ACTS[b.dataset.act]) ACTS[b.dataset.act](b);
  });
  PAGE.addEventListener('input', e => {
    const t = e.target;
    if ('num' in t.dataset) t.value = t.value.replace(/[^0-9]/g, '');
    else if ('tel' in t.dataset) t.value = t.value.replace(/[^0-9+\s]/g, '');
  });
  document.getElementById('win_photo_input').addEventListener('change', e => handlePhotoUpload(e));

/* ================= (a partir daqui, a lógica de antes) ================= */
    /* =======================================
    DATA CENTER
    ======================================= */
    function showPanelCardDataCenter(panelId) {
      PAGE.querySelectorAll(".panel-card").forEach(el => el.classList.remove("active"));
      document.getElementById(`panel-${panelId}`).classList.add("active");
      PAGE.querySelectorAll(".panel-sidebar-menu-button").forEach(btn => btn.classList.remove("active"));
      const activeBtn = PAGE.querySelector(`.panel-sidebar-menu-button[data-panel="${panelId}"]`);
      if (activeBtn) activeBtn.classList.add("active");
      if (panelId === "assoc") {
        loadCorporationData();
      }
      if (panelId === "elems") {
        loadElementsTable();
        resetElementsTable();
        const search = document.getElementById("win_search_element");
        if (search) search.value = "";
      }
      if (panelId === "veícs") {
        loadVehiclesTable();
      }
      if (panelId === "mails") {
        loadMailsConfig();
      }
      const list = document.getElementById("elements-list");
      const edit = document.getElementById("elements-edit");
      if (list) list.style.display = "block";
      if (edit) edit.style.display = "none";
    }
    /* =======================================
    CORPORATION DATA
    ======================================= */
    /* ================= STATE ================= */
    let originalCorpLogo = null;
    let tempCorpLogoFile = null;
    /* ================= DOM READY SAFE ================= */
    document.addEventListener("DOMContentLoaded", () => {
      const fileInput = document.getElementById("corp-logo-input");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          tempCorpLogoFile = file;
          const reader = new FileReader();
          reader.onload = (ev) => {
            document.querySelector(".data-logo").src = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      }
      const resetBtn = document.querySelector("#btn-reset-logo");
      if (resetBtn) {
        resetBtn.addEventListener("click", resetCorpLogo);
      }
    });
    /* ================= RESET LOGO ================= */
    function resetCorpLogo() {
      const img = document.querySelector(".data-logo");
      const input = document.getElementById("corp-logo-input");
      if (!img) return;
      if (originalCorpLogo) {
        img.src = originalCorpLogo;
      } else {
        img.src = "";
      }
      if (input) input.value = "";
      tempCorpLogoFile = null;
    }
    /* ================= CHECK EXISTING ================= */
    async function checkExistingCorporation() {
      try {
        const currentCorpNr = sessionStorage.getItem("currentUserCorpNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?select=id&corp_oper_nr=eq.${currentCorpNr}&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error("Erro ao verificar corporação existente:", error);
        return null;
      }
    }
    /* ================= LOAD CORPORATION DATA ================= */
    async function loadCorporationData() {
      try {
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        if (!currentCorpNr) return;
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${encodeURIComponent(currentCorpNr)}&select=*`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.length) return;
        const corporation = data[0];
        document.getElementById("assoc-name").value = corporation.corporation || "";
        document.getElementById("cb-name").value = corporation.cb_name || "";
        document.getElementById("assoc-address").value = corporation.corp_address || "";
        document.getElementById("assoc-localidade").value = corporation.corp_localitie || "";
        document.getElementById("assoc-nif").value = corporation.corp_fiscal_nr || "";
        document.getElementById("assoc-operational-nr").value = corporation.corp_oper_nr || "";
        const {cp1, cp2} = splitPostalCode(corporation.corp_cp);
        document.getElementById("assoc-cp1").value = cp1;
        document.getElementById("assoc-cp2").value = cp2;
        document.getElementById("assoc-mobile-phone").value = corporation.corp_phone_mobile || "";
        document.getElementById("assoc-landline-phone").value = corporation.corp_phone_landline || "";
        document.getElementById("assoc-email").value = corporation.corp_email || "";
        fillIpmaAreaSelect(corporation.ipma_area || ipmaAreaFromDistrict(corporation.corp_district));
        await loadHierarchicalSelects(corporation);
      } catch (error) {
        console.error("❌ Erro ao carregar dados da corporação:", error);
      }
    }
    /* ================= ÁREA DE AVISOS IPMA ================= */
    const IPMA_AREAS = [
      ["AVR", "Aveiro"], ["BJA", "Beja"], ["BRG", "Braga"], ["BGC", "Bragança"], ["CBO", "Castelo Branco"], ["CBR", "Coimbra"],
      ["EVR", "Évora"], ["FAR", "Faro"], ["GDA", "Guarda"], ["LRA", "Leiria"], ["LSB", "Lisboa"], ["PTG", "Portalegre"],
      ["PTO", "Porto"], ["STM", "Santarém"], ["STB", "Setúbal"], ["VCT", "Viana do Castelo"], ["VRL", "Vila Real"], ["VIS", "Viseu"],
      ["MCN", "Madeira - Costa Norte"], ["MCS", "Madeira - Costa Sul"], ["MRM", "Madeira - Regiões Montanhosas"], ["MPS", "Madeira - Porto Santo"],
      ["AOC", "Açores - Grupo Ocidental"], ["ACE", "Açores - Grupo Central"], ["AOR", "Açores - Grupo Oriental"]
    ];
    function ipmaAreaFromDistrict(district) {
      const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      return IPMA_AREAS.find(([, name]) => norm(name) === norm(district))?.[0] || "";
    }
    function fillIpmaAreaSelect(value) {
      const sel = document.getElementById("assoc-ipma-area");
      if (!sel) return;
      if (sel.options.length <= 1) {
        sel.innerHTML = `<option value="">Selecione...</option>` + IPMA_AREAS.map(([c, n]) => `<option value="${c}">${n} (${c})</option>`).join("");
      }
      sel.value = value || "";
    }
    /* ================= LOAD LOGO ================= */
    async function loadCorporationLogo() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        if (!corpOperNr) return;
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?select=logo_url&corp_oper_nr=eq.${corpOperNr}&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        if (data?.length > 0 && data[0].logo_url) {
          const img = document.querySelector(".data-logo");
          if (img) {
            originalCorpLogo = data[0].logo_url;
            img.src = originalCorpLogo;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar logo:", error);
      }
    }
    document.addEventListener("DOMContentLoaded", loadCorporationLogo);
    /* ================= SAVE CORPORATION ================= */
    async function saveCorporationData() {
      const saveButton = document.getElementById("dc-save-corp");
      const originalText = saveButton?.textContent || "ATUALIZAR";
      try {
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.textContent = "A SALVAR...";
        }
        const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
        const corporationData = {corporation: document.getElementById("assoc-name")?.value?.trim() || null, cb_name: document.getElementById("cb-name")?.value?.trim() || null, 
                                 corp_address: document.getElementById("assoc-address")?.value?.trim() || null, corp_localitie: document.getElementById("assoc-localidade")?.value?.trim() || null, 
                                 corp_cp: getCombinedPostalCode(), corp_district: getSelectedDistrictName(), corp_council: getSelectedCouncilName(), corp_parish: document.getElementById("parish_select_corp")?.value?.trim() || null,
                                 corp_fiscal_nr: document.getElementById("assoc-nif")?.value?.trim() || null, corp_oper_nr: currentCorpNr || document.getElementById("assoc-operational-nr")?.value?.trim() || null,
                                 corp_phone_mobile: document.getElementById("assoc-mobile-phone")?.value?.trim() || null, corp_phone_landline: document.getElementById("assoc-landline-phone")?.value?.trim() || null,
                                 corp_email: document.getElementById("assoc-email")?.value?.trim() || null,
                                 ...(document.getElementById("assoc-ipma-area") ? {ipma_area: document.getElementById("assoc-ipma-area").value || null} : {})
                                };
        const validation = validateCorporationData(corporationData);
        if (!validation.isValid) throw new Error(validation.message);
        const existingResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${encodeURIComponent(corporationData.corp_oper_nr)}&select=id&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );
        const existingData = await existingResponse.json();
        let response;
        if (existingData.length > 0) {
          response = await updateCorporationData(
            existingData[0].id,
            corporationData
          );
        } else {
          response = await createCorporationData(corporationData);
        }
        showPopup("popup-success", "Dados da corporação salvos com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        showPopup("popup-danger", error.message || "Erro ao salvar dados da corporação");
      } finally {
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = originalText;
        }
      }
    }
    /* ================= CREATE ================= */
    async function createCorporationData(data) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data`, {
        method: "POST",
        headers: {...getSupabaseHeaders(), "Content-Type": "application/json", Prefer: "return=representation"},
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`CREATE ERROR: ${errorText}`);
      }
      return await response.json();
    }
    /* ================= UPDATE ================= */
    async function updateCorporationData(id, data) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/corporation_data?id=eq.${id}`, {
          method: "PATCH",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", Prefer: "return=representation"},
          body: JSON.stringify(data)
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`UPDATE ERROR: ${errorText}`);
      }
      return await response.json();
    }
    /* ================= HELPERS ================= */
    function splitPostalCode(fullPostalCode) {
      if (!fullPostalCode) return { cp1: "", cp2: "" };
      if (fullPostalCode.includes("-")) {
        const [cp1, cp2] = fullPostalCode.split("-");
        return { cp1: cp1 || "", cp2: cp2 || "" };
      }
      if (fullPostalCode.length === 7 && /^\d{7}$/.test(fullPostalCode)) {
        return {cp1: fullPostalCode.substring(0, 4), cp2: fullPostalCode.substring(4, 7)};
      }
      return {cp1: fullPostalCode, cp2: ""};
    }
    function getCombinedPostalCode() {
      const cp1 = document.getElementById("assoc-cp1")?.value?.trim();
      const cp2 = document.getElementById("assoc-cp2")?.value?.trim();
      if (cp1 && cp2) return `${cp1}-${cp2}`;
      return cp1 || cp2 || null;
    }
    function getSelectedDistrictName() {
      const el = document.getElementById("district_select_corp");
      if (!el?.value) return null;
      return el.options[el.selectedIndex]?.textContent?.trim() || null;
    }
    function getSelectedCouncilName() {
      const el = document.getElementById("council_select_corp");
      if (!el?.value) return null;
      return el.options[el.selectedIndex]?.textContent?.trim() || null;
    }
    async function loadHierarchicalSelects(corporation) {
      try {
        if (corporation.corp_district) {
          const districtId = await findDistrictIdByName(corporation.corp_district);
          if (districtId) {
            document.getElementById('district_select_corp').value = districtId;
            await populateCouncilSelectByDistrict(districtId, 'district_select_corp');
          }
        }
        if (corporation.corp_council) {
          const councilId = await findCouncilIdByName(corporation.corp_council);
          if (councilId) {
            document.getElementById('council_select_corp').value = councilId;
            await populateParishesByCouncil(councilId, 'council_select_corp');
          }
        }
        if (corporation.corp_parish) {
          document.getElementById('parish_select_corp').value = corporation.corp_parish;
        }
      } catch (error) {
        console.error('❌ Erro ao carregar selects hierárquicos:', error);
      }
    }    
    function validateCorporationData(data) {
      if (!data.corporation)
        return {isValid: false, message: "Nome da associação obrigatório"};
      if (!data.cb_name)
        return {isValid: false, message: "Nome do CB obrigatório"};
      if (!data.corp_fiscal_nr)
        return {isValid: false, message: "NIF obrigatório"};
      if (!/^\d{9}$/.test(data.corp_fiscal_nr))
        return {isValid: false, message: "NIF inválido"};
      if (!data.corp_oper_nr)
        return {isValid: false, message: "Operacional obrigatório"};
      return {isValid: true};
    }
    async function findDistrictIdByName(districtName) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/districts_select?select=id&district=eq.${encodeURIComponent(districtName)}`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.length > 0 ? data[0].id : null;
      } catch (error) {
        console.error('Erro ao buscar ID do distrito:', error);
        return null;
      }
    }    
    async function findCouncilIdByName(councilName) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/councils_select?select=id&council=eq.${encodeURIComponent(councilName)}`, {
          headers: getSupabaseHeaders()
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.length > 0 ? data[0].id : null;
      } catch (error) {
        console.error('Erro ao buscar ID do concelho:', error);
        return null;
      }
    }   
    /* ================= LOAD INIT ================= */
    document.addEventListener("DOMContentLoaded", async () => {
      setTimeout(async () => {
        await loadCorporationData();
      }, 500);
    });
    /* ===== Fotos dos elementos: bucket privado "elem-photos" (pasta por corporação) =====
       photo_url pode ser o link antigo (http..., bucket público cb_logos) ou o caminho novo "0805/0805_205.jpg". */
    const ELEM_PHOTO_BUCKET = "elem-photos";
    async function dcLoadPhoto(imgEl, photoUrl) {
      if (!imgEl || !photoUrl) return;
      if (/^https?:\/\//i.test(photoUrl)) { imgEl.src = photoUrl; return; }
      try {
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/${ELEM_PHOTO_BUCKET}/${photoUrl}`, {headers: storageHeaders()});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const url = URL.createObjectURL(await res.blob());
        imgEl.onload = () => URL.revokeObjectURL(url);
        imgEl.src = url;
      } catch (e) {
        console.warn("Não foi possível carregar a foto:", e);
        imgEl.style.visibility = "hidden";
      }
    }
    function storageHeaders(extra = {}) {
      const h = {...getSupabaseHeaders(), ...extra};
      if (!extra["Content-Type"]) delete h["Content-Type"];
      return h;
    }
    async function uploadCorpLogo(file, corpOperNr) {
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const fileName = `logo_cb_${corpOperNr}_${timestamp}.${fileExt}`;
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/cb_logos/${fileName}`, {
          method: "POST",
          headers: storageHeaders(),
          body: formData
        }
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return {
        fileName,
        url: `${SUPABASE_URL}/storage/v1/object/public/cb_logos/${fileName}`
      };
    }
    async function saveCorpLogo() {
      try {
        if (!tempCorpLogoFile) {
          showPopup("popup-danger", "Seleciona uma imagem primeiro!");
          return;
        }
        const localPreviewUrl = URL.createObjectURL(tempCorpLogoFile);
        const logoImg = document.querySelector(".data-logo");
        const logoHeaderImg = document.querySelector(".cb-logo img");
        if (logoImg) logoImg.src = localPreviewUrl;
        if (logoHeaderImg) logoHeaderImg.src = localPreviewUrl;
        const corpOperNr = (sessionStorage.getItem("currentCorpOperNr")).trim();
        const upload = await uploadCorpLogo(tempCorpLogoFile, corpOperNr);
        await updateLogoInDB(corpOperNr, upload.url);
        // O logo antigo NÃO é apagado: os emails já enviados continuam a apontar para ele.
        const cacheBusterUrl = `${upload.url}?t=${Date.now()}`;
        if (logoImg) logoImg.src = cacheBusterUrl;
        if (logoHeaderImg) logoHeaderImg.src = cacheBusterUrl;
        originalCorpLogo = upload.url;
        tempCorpLogoFile = null;
        const input = document.getElementById("corp-logo-input");
        if (input) input.value = "";
        showPopup("popup-success", "Logo atualizado com sucesso!");
      } catch (error) {
        console.error("SAVE LOGO ERROR:", error);
        showPopup("popup-danger", error.message || "Erro ao guardar logo");
        if (typeof loadCorporationHeader === "function") loadCorporationHeader();
      }
    }
    async function removeCorpLogo() {
      if (!originalCorpLogo) {
        showPopup("popup-danger", "Não existe nenhum logo guardado para remover.");
        return;
      }
      if (!confirm("Tem a certeza que pretende remover o logo da corporação?")) return;
      try {
        const corpOperNr = (sessionStorage.getItem("currentCorpOperNr") || "").trim();
        await deleteCorpLogo(originalCorpLogo);
        await updateLogoInDB(corpOperNr, null);
        originalCorpLogo = null;
        tempCorpLogoFile = null;
        const input = document.getElementById("corp-logo-input");
        if (input) input.value = "";
        const logoImg = document.querySelector(".data-logo");
        const logoHeaderImg = document.querySelector(".cb-logo img");
        if (logoImg) logoImg.src = "";
        if (logoHeaderImg) logoHeaderImg.src = "";
        showPopup("popup-success", "Logo removido com sucesso!");
      } catch (error) {
        console.error("REMOVE LOGO ERROR:", error);
        showPopup("popup-danger", error.message || "Erro ao remover logo");
      }
    }
    async function updateLogoInDB(corpOperNr, logoUrl) {
      const findRes = await fetch(
        `${SUPABASE_URL}/rest/v1/corporation_data?select=id&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        }
      );
      const findData = await findRes.json();
      if (!findData.length) {
        throw new Error("Corporação não encontrada");
      }
      const id = findData[0].id;
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/corporation_data?id=eq.${id}`, {
          method: "PATCH",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=representation"},
          body: JSON.stringify({logo_url: logoUrl})
        }
      );
      const text = await updateRes.text();
      if (!updateRes.ok) {
        throw new Error(text);
      }
      return JSON.parse(text);
    }
    async function deleteCorpLogo(oldFileUrl) {
      if (!oldFileUrl) return;
      try {
        const fileName = oldFileUrl.split("/cb_logos/")[1];
        if (!fileName) return;
        await fetch(
          `${SUPABASE_URL}/storage/v1/object/cb_logos/${fileName}`, {
            method: "DELETE",
            headers: storageHeaders()
          }
        );
      } catch (e) {
        console.warn("Erro ao apagar logo antigo:", e);
      }
    }
    /* =======================================
    FIREFIGHTER LISTING
    ======================================= */
    let currentEditId = null;
    /* árvore de acessos: vem da tabela cb360_modules (a mesma do system_admin) */
    let ACCESS_OPTIONS = [];
    async function loadAccessOptions() {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/cb360_modules?select=label,display_name,parent,sort_order&active=is.true&order=sort_order.asc,label.asc`, {
        headers: getSupabaseHeaders()
      });
      if (!r.ok) throw new Error(await r.text());
      const rows = await r.json();
      const byParent = {};
      rows.forEach(x => { const k = x.parent || ''; (byParent[k] = byParent[k] || []).push(x); });
      const build = (p) => (byParent[p] || []).map(x => {
        const kids = build(x.label);
        const o = {label: x.label, text: x.display_name || x.label};
        if (kids.length) o.children = kids;
        return o;
      });
      return build('');
    }
    function resetElementsTable() {
      const tbody = document.querySelector("#elements-container tbody");
      if (!tbody) return;
      tbody.querySelectorAll("tr").forEach(tr => {
        if (tr.querySelector('td[colspan]')) {
          const icon = tr.querySelector(".toggle-icon");
          if (icon) icon.textContent = "▶";
        } else {
          tr.style.display = "none";
        }
      });
    }
    function initTabs() {
      document.querySelectorAll("#elements-tabs .tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetId = btn.dataset.tab;
          document.querySelectorAll("#elements-tabs .tab-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          document.querySelectorAll("#elements-edit .tab-content").forEach(content => {
            content.style.display = "none";
            content.classList.remove("active");
          });
          const targetDiv = document.getElementById(targetId);
          if (targetDiv) {
            targetDiv.style.display = "block";
            targetDiv.classList.add("active");
          }
        });
      });
    }
    function resetToFirstTab() {
      const firstTab = document.querySelector("#elements-tabs .tab-btn[data-tab='mainData']");
      if (firstTab) firstTab.click();
    }
    function toggleElementsView() {
      const list = document.getElementById("elements-list");
      const edit = document.getElementById("elements-edit");
      if (list.style.display !== "none") {
        list.style.display = "none";
        edit.style.display = "block";
        resetToFirstTab();
        openNewCard();
        clearEditForm();
      } else {
        list.style.display = "block";
        edit.style.display = "none";
      }
    }
    function toggleStateDateVisibility() {
      const stateSelect = document.getElementById("win_state");
      const stateFromInput = document.getElementById("win_state_from");
      const stateFromLabel = stateFromInput ? stateFromInput.previousElementSibling : null;
      if (stateSelect && stateSelect.value === "Inativo") {
        if (stateFromInput) stateFromInput.style.display = "inline-block";
        if (stateFromLabel && stateFromLabel.tagName === "LABEL") {
          stateFromLabel.style.display = "inline-block";
        }
      } else {
        if (stateFromInput) {
          stateFromInput.style.display = "none";
          stateFromInput.value = "";
        }
        if (stateFromLabel && stateFromLabel.tagName === "LABEL") {
          stateFromLabel.style.display = "none";
        }
      }
    }
    async function loadElementsTable() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?select=*&corp_oper_nr=eq.${corpOperNr}`, {
          method: "GET",
          headers: getSupabaseHeaders()
        });
        let data = await response.json();
        const tbody = document.querySelector("#elements-container tbody");
        tbody.innerHTML = "";
        data.sort((a, b) => String(a.n_int).localeCompare(String(b.n_int), undefined, {numeric: true}));
        const quadDef = [{code: "QCOM", title: "QUADRO DE COMANDO"}, {code: "QATIV", title: "QUADRO ATIVO"}, {code: "QEST", title: "QUADRO DE ESTAGIÁRIOS"}, {code: "QEA", title: "QUADRO DE ESPECIALISTAS E AUXILIARES"}, 
                         {code: "QRES", title: "QUADRO DE RESERVA"}, {code: "QHR", title: "QUADRO DE HONRA"}, {code: null, title: "SEM QUADRO"}];
        quadDef.forEach(quadro => {
          const elems = data.filter(row => 
            quadro.code === null 
              ? !row.type_quad || row.type_quad === "" 
              : row.type_quad === quadro.code
          );
          if (!elems.length) return;
          const headerTr = document.createElement("tr");
          headerTr.innerHTML = `
            <td colspan="6" style="background:#ffebeb;color:#a70c0c;font-weight:bold;text-align:left;
              padding:8px 10px;font-size:12px;border-left:2px solid #d81c1c;
              letter-spacing:0.05em;cursor:pointer;user-select:none;">
              <span style="float:right;font-size:16px;" class="toggle-icon">▶</span>
              🔹 ${quadro.title} (${elems.length})
            </td>
          `;
          tbody.appendChild(headerTr);
          const quadroRows = [];
          elems.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td style="text-align:center">${row.n_int ?? ""}</td>
              <td style="text-align:center">${row.n_file ?? ""}</td>
              <td style="text-align:center">${row.patent ?? ""}</td>
              <td style="text-align:center">${row.full_name ?? ""}</td>
              <td style="text-align:center; color: ${row.elem_state ? 'green' : 'red'}">${row.elem_state ? 'ATIVO' : 'INATIVO'}</td>
              <td style="text-align:center">
                <button class="btn-action">✏️</button>
                <button class="btn-delete">🗑️</button>
              </td>
            `;
            tr.querySelector(".btn-action").addEventListener("click", () => openEditCard(row));
            tr.querySelector(".btn-delete").addEventListener("click", () => deleteRecord(row));
            tbody.appendChild(tr);
            quadroRows.push(tr);
          });
          quadroRows.forEach(tr => tr.style.display = "none");
          headerTr.querySelector(".toggle-icon").textContent = "▶";
          headerTr.addEventListener("click", () => {
            const icon = headerTr.querySelector(".toggle-icon");
            const isVisible = quadroRows[0]?.style.display !== "none";
            document.querySelectorAll("#elements-container tbody tr").forEach(tr => {
              if (tr === headerTr) return;
              if (tr.querySelector('td[colspan]')) {
                tr.querySelector(".toggle-icon").textContent = "▶";
              } else {
                tr.style.display = "none";
              }
            });
            quadroRows.forEach(tr => tr.style.display = isVisible ? "none" : "");
            icon.textContent = isVisible ? "▶" : "▼";
          })
        });        
      } catch (error) {
        console.error("Erro ao carregar tabela:", error);
      }
    }
    function clearEditForm() {
      const ids = ["win_state", "win_state_from", "win_type", "win_ofope", "win_n_int", "win_n_file", "win_patent", "win_patent_abv", "win_section", "win_quad", "win_abv_name", "win_full_name", "win_MP", 
                   "win_ML", "win_TAS", "win_nif", "win_niss", "win_nib", "win_phone", "win_mobile", "win_mail", "win_user_name_main", "win_password_main", "win_user_name_mobile", "win_password_mobile", "win_validate_main", "win_validate_mobile", "link_type"];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      removePhoto();
      toggleStateDateVisibility();
    }
    function mapPatentToAbv() {
      const patentSelect = document.getElementById("win_patent");
      const patentAbvInput = document.getElementById("win_patent_abv");
      const value = patentSelect.value;
      if (!value) { patentAbvInput.value = ""; return; }
      if (value === "Comandante") patentAbvInput.value = "COM";
      else if (value === "2º Comandante") patentAbvInput.value = "2COM";
      else if (value === "Adj. de Comando") patentAbvInput.value = "ACOM";
      else if (value.includes("Oficial")) patentAbvInput.value = "OFICI";
      else if (value === "Chefe") patentAbvInput.value = "CH";
      else if (value === "Subchefe") patentAbvInput.value = "SCH";
      else if (value === "Bombeiro(a) 1ª") patentAbvInput.value = "B1C";
      else if (value === "Bombeiro(a) 2ª") patentAbvInput.value = "B2C";
      else if (value === "Bombeiro(a) 3ª") patentAbvInput.value = "B3C";
      else if (value === "Estagiário(a)") patentAbvInput.value = "EST";
      else if (value === "Bº Especialista") patentAbvInput.value = "BESP";
      else patentAbvInput.value = "";
    }
    document.getElementById("win_patent").addEventListener("change", mapPatentToAbv);
    function openNewCard() {
      currentEditId = null;
      document.querySelector("#elements-edit h3").textContent = "Adicionar elemento";
      generateAccessCheckboxes();
      generateMobileAccessCheckboxes(null);
      window.scrollTo({top: 0, behavior: "smooth"});
    }
    async function openEditCard(row) {
      currentEditId = row.id;
      document.getElementById("elements-list").style.display = "none";
      document.getElementById("elements-edit").style.display = "block";
      document.querySelector("#elements-edit h3").textContent = "Editar: " + (row.abv_name || "");      
      const fields = ["n_int", "n_file", "patent", "patent_abv", "abv_name", "full_name", "section"];
      fields.forEach(f => {
        const el = document.getElementById("win_" + f);
        if (el) el.value = row[f] ?? "";
      });
      ["nif", "niss", "nib"].forEach(f => {
        const el = document.getElementById("win_" + f);
        if (el) el.value = "";
      });
      loadElemPrivate(row.id).then(priv => {
        if (!priv || currentEditId !== row.id) return;
        ["nif", "niss", "nib"].forEach(f => {
          const el = document.getElementById("win_" + f);
          if (el) el.value = priv[f] ?? "";
        });
      });
      const photoPreview = document.getElementById("win_photo_preview");
      if (photoPreview) {
        if (row.photo_url) {
          photoPreview.innerHTML = `<img style="width: 100%; height: 100%; object-fit: cover;">`;
          dcLoadPhoto(photoPreview.querySelector("img"), row.photo_url);
          photoPreview.dataset.photoUrl = row.photo_url;
        } else {
          photoPreview.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
          `;
          photoPreview.dataset.photoUrl = "";
        }
      }
      if (document.getElementById("win_ML")) document.getElementById("win_ML").value = String(row.ML);
      if (document.getElementById("win_MP")) document.getElementById("win_MP").value = String(row.MP);      
      if (document.getElementById("win_TAS")) document.getElementById("win_TAS").value = String(row.TAS);
      document.getElementById("win_quad").value = row.type_quad || "";
      document.getElementById("win_phone").value = row.phone || "";
      document.getElementById("win_mobile").value = row.mobile_phone || "";
      document.getElementById("win_mail").value = row.email || "";
      const linkEl = document.getElementById("link_type");
      if (linkEl) linkEl.value = row.link_type || "";
      if (document.getElementById("win_state")) {
        document.getElementById("win_state").value = row.elem_state ? "Ativo" : "Inativo";
      }
      if (document.getElementById("win_state_from")) {
        document.getElementById("win_state_from").value = row.inactive_from ?? "";
      }
      if (document.getElementById("win_ofope")) {
        document.getElementById("win_ofope").value = row.is_ofope ? "Sim" : "Não";
      }      
      toggleStateDateVisibility();      
      const roleMap = {admin: "Administrador", subadmin: "Sub-Administrador", user: "Utilizador"};
      if (document.getElementById("win_type")) document.getElementById("win_type").value = roleMap[row.user_role] || "";      
      await Promise.all([generateAccessCheckboxes(), generateMobileAccessCheckboxes(row.n_int)]);
      const userAccesses = row.acess ? row.acess.split(",").map(a => a.trim()) : [];
      setTimeout(() => {
        document.querySelectorAll(".access-checkbox").forEach(cb => {
          cb.checked = userAccesses.includes(cb.value);
        });
      }, 100);      
      const [login, mobileLogin] = await Promise.all([
      loadUserLogin(row.n_int, row.corp_oper_nr),
        loadMobileLogin(row.n_int, row.corp_oper_nr)
      ]);
      document.getElementById("win_user_name_main").value = login?.username || "";
      document.getElementById("win_password_main").value = "";
      const validMain = document.getElementById("win_validate_main");
      if (validMain) validMain.value = login?.validate ? String(login.validate).slice(0, 10) : "";
      document.getElementById("win_user_name_mobile").value = mobileLogin?.username || "";
      document.getElementById("win_password_mobile").value = "";
      const validMob = document.getElementById("win_validate_mobile");
      if (validMob) validMob.value = mobileLogin?.validate ? String(mobileLogin.validate).slice(0, 10) : "";
      resetToFirstTab();
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
    /* mensagem simples quando a base de dados recusa mexer em acessos (não é admin) */
    async function accessErrorMsg(res, prefixo) {
      const t = await res.text().catch(() => "");
      if (res.status === 403 || t.includes("42501") || t.includes("Só um administrador")) {
        return `${prefixo}: só um administrador pode criar, alterar ou apagar credenciais de acesso.`;
      }
      return `${prefixo}: ${t}`;
    }
    async function saveElement() {
      const nInt = document.getElementById("win_n_int").value.trim();
      const fullName = document.getElementById("win_full_name").value.trim();
      if (!nInt || !fullName) {
        showPopup('popup-danger', "O Nº Interno e o Nome Completo são obrigatórios.");
        return;
      }
      const typeVal = document.getElementById("win_type").value;
      if (!typeVal) {
        showPopup('popup-danger', "⚠️ Selecione o tipo de utilizador (Administrador / Sub-Administrador / Utilizador).");
        return;
      }
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const usernameVal = document.getElementById("win_user_name_main").value.trim();
      const passwordVal = document.getElementById("win_password_main").value.trim();
      const mobUserVal = document.getElementById("win_user_name_mobile").value.trim();
      const mobPassVal = document.getElementById("win_password_mobile").value.trim();
      const mobValidVal = document.getElementById("win_validate_mobile")?.value || null;
      const mainValidVal = document.getElementById("win_validate_main")?.value || null;
      try {
        /* ---------- validações das credenciais ANTES de gravar ---------- */
        let existingUser = null;
        if (usernameVal) {
          const checkUser = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(usernameVal)}&select=id,corp_oper_nr,full_name,n_int`, {
            headers: getSupabaseHeaders()
          });
          if (!checkUser.ok) throw new Error("Erro ao verificar utilizador Online");
          const found = await checkUser.json();
          const other = found.find(u => u.corp_oper_nr !== corpOperNr || !nintVariants(nInt).includes(String(u.n_int)));
          if (other) {
            showPopup('popup-danger', "⚠️ O username Online já está a ser usado por outro utilizador.\nPor favor introduza outro.");
            return;
          }
          existingUser = found[0] || await loadUserLogin(nInt, corpOperNr);
          if (!existingUser && !passwordVal) {
            showPopup('popup-danger', "⚠️ Para criar o acesso Online tem de definir uma password.");
            return;
          }
        }
        let existingMobile = null;
        if (mobUserVal) {
          const checkMob = await fetch(`${SUPABASE_URL}/rest/v1/users_mobile?username=eq.${encodeURIComponent(mobUserVal)}&select=id,corp_oper_nr,nint_corp`, {
            headers: getSupabaseHeaders()
          });
          if (!checkMob.ok) throw new Error("Erro ao verificar utilizador Mobile");
          const foundMob = await checkMob.json();
          const variants = nintVariants(nInt);
          const otherMob = foundMob.find(u => u.corp_oper_nr !== corpOperNr || !variants.includes(String(u.nint_corp)));
          if (otherMob) {
            showPopup('popup-danger', "⚠️ O username Mobile já está a ser usado por outro utilizador.\nPor favor introduza outro.");
            return;
          }
          existingMobile = foundMob[0] || await loadMobileLogin(nInt, corpOperNr);
          if (!existingMobile && !mobPassVal) {
            showPopup('popup-danger', "⚠️ Para criar o acesso Mobile tem de definir uma password.");
            return;
          }
        }
        /* ---------- foto ---------- */
        let photoUrl = document.getElementById("win_photo_preview")?.dataset.photoUrl || "";
        const photoInput = document.getElementById("win_photo_input");
        if (photoInput && photoInput.files && photoInput.files[0]) {
          const file = photoInput.files[0];
          const fileExt = file.name.split('.').pop();
          const filePath = `${corpOperNr}_${nInt}.${fileExt}`;
          const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${ELEM_PHOTO_BUCKET}/${corpOperNr}/${filePath}`, {
            method: "POST",
            headers: storageHeaders({"x-upsert": "true", "Content-Type": file.type || "application/octet-stream"}),
            body: file
          });
          if (!uploadRes.ok) throw new Error("Erro ao fazer upload da foto.");
          photoUrl = `${corpOperNr}/${filePath}`;
        }
        /* ---------- reg_elems ---------- */
        const payloadReg = {n_int: nInt, n_file: document.getElementById("win_n_file").value, patent: document.getElementById("win_patent").value, patent_abv: document.getElementById("win_patent_abv").value,
                            abv_name: (document.getElementById("win_abv_name")?.value || "").trim() || buildAbvName(fullName), full_name: fullName, photo_url: photoUrl, 
                            ML: document.getElementById("win_ML").value === "true", MP: document.getElementById("win_MP").value === "true", TAS: document.getElementById("win_TAS").value === "true", 
                            section: document.getElementById("win_section").value, type_quad: document.getElementById("win_quad").value,  phone: document.getElementById("win_phone").value, 
                            mobile_phone: document.getElementById("win_mobile").value, email: document.getElementById("win_mail").value,  is_ofope: document.getElementById("win_ofope").value === "Sim", 
                            elem_state: document.getElementById("win_state").value === "Ativo", inactive_from: document.getElementById("win_state").value === "Inativo" ? document.getElementById("win_state_from").value : null, link_type: document.getElementById("link_type")?.value || null,
                            acess: document.querySelector('.access-checkbox') ? Array.from(document.querySelectorAll('.access-checkbox:checked')).map(cb => cb.value).join(", ") : undefined, corp_oper_nr: corpOperNr, last_updated: new Date().toISOString(),
                            user_role: mapUserRole()
                          };
        const url = currentEditId
          ? `${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${currentEditId}`
          : `${SUPABASE_URL}/rest/v1/reg_elems`;          
        const resReg = await fetch(url, {
          method: currentEditId ? "PATCH" : "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=representation"},
          body: JSON.stringify(payloadReg)
        });
        if (!resReg.ok) {
          const errTxt = await resReg.text();
          let errMsg = errTxt;
          try { errMsg = JSON.parse(errTxt).message || errTxt; } catch (e) {}
          throw new Error(errMsg);
        }
        const savedReg = await resReg.json().catch(() => []);
        const elemId = currentEditId || savedReg?.[0]?.id;
        /* ---------- dados sensíveis (NIF / NISS / NIB) ---------- */
        if (elemId) {
          const resPriv = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems_private?on_conflict=elem_id`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
            body: JSON.stringify({
              elem_id: elemId,
              corp_oper_nr: corpOperNr,
              nif: document.getElementById("win_nif")?.value.trim() || null,
              niss: document.getElementById("win_niss")?.value.trim() || null,
              nib: document.getElementById("win_nib")?.value.trim() || null,
              updated_at: new Date().toISOString()
            })
          });
          if (!resPriv.ok) throw new Error("Elemento gravado, mas falhou NIF/NISS/NIB: " + await resPriv.text());
        }
        /* ---------- users (Online) ---------- */
        if (usernameVal) {
          const payloadUsers = {username: usernameVal, n_int: nInt, full_name: fullName, patent: payloadReg.patent, corp_oper_nr: corpOperNr};
          payloadUsers.validate = mainValidVal;
          if (passwordVal) payloadUsers.password = passwordVal;
          const resUser = await fetch(existingUser ? `${SUPABASE_URL}/rest/v1/users?id=eq.${existingUser.id}` : `${SUPABASE_URL}/rest/v1/users`, {
            method: existingUser ? "PATCH" : "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
            body: JSON.stringify(payloadUsers)
          });
          if (!resUser.ok) throw new Error(await accessErrorMsg(resUser, "Elemento gravado, mas o acesso Online não foi alterado"));
        }
        /* ---------- users_mobile (Mobile) ---------- */
        if (mobUserVal) {
          const payloadMob = {username: mobUserVal, corp_oper_nr: corpOperNr, nint_corp: String(parseInt(nInt, 10)).padStart(3, "0"), validate: mobValidVal};
          if (mobPassVal) payloadMob.password = mobPassVal;
          const resMob = await fetch(existingMobile ? `${SUPABASE_URL}/rest/v1/users_mobile?id=eq.${existingMobile.id}` : `${SUPABASE_URL}/rest/v1/users_mobile`, {
            method: existingMobile ? "PATCH" : "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
            body: JSON.stringify(payloadMob)
          });
          if (!resMob.ok) throw new Error(await accessErrorMsg(resMob, "Elemento gravado, mas o acesso Mobile não foi alterado"));
        }
        /* ---------- acessos da Mobile ---------- */
        await saveMobileAccesses(nInt, corpOperNr);
        document.getElementById("win_password_main").value = "";
        document.getElementById("win_password_mobile").value = "";
        showPopup('popup-success', currentEditId ? "✅ Elemento editado com sucesso!" : "✅ Elemento adicionado com sucesso!");
        toggleElementsView();
        loadElementsTable();        
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', "Erro ao gravar registo: " + (err.message || err));
      }
    }
    async function deleteRecord(row) {
      if (!confirm(`Deseja remover ${row.full_name}?`)) return;
      try {
        const resUsers = await fetch(`${SUPABASE_URL}/rest/v1/users?n_int=in.(${nintVariants(row.n_int).map(v => `"${v}"`).join(",")})&corp_oper_nr=eq.${row.corp_oper_nr}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (!resUsers.ok) throw new Error(await accessErrorMsg(resUsers, "O elemento não foi removido"));
        const list = nintVariants(row.n_int).map(v => `"${v}"`).join(",");
        const resMob = await fetch(`${SUPABASE_URL}/rest/v1/users_mobile?corp_oper_nr=eq.${row.corp_oper_nr}&nint_corp=in.(${list})`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (!resMob.ok) throw new Error(await accessErrorMsg(resMob, "O elemento não foi removido"));
        const resDel = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?id=eq.${row.id}`, {method: "DELETE", headers: getSupabaseHeaders()});
        if (!resDel.ok) throw new Error("Falhou a remoção do elemento: " + await resDel.text());
        showPopup('popup-success', `${row.full_name} removido com sucesso.`);
        loadElementsTable();
      } catch (e) {
        console.error(e);
        showPopup('popup-danger', "Erro ao eliminar elemento: " + (e.message || e));
      }
    }
    /* ===================== ACESSOS DA MOBILE =====================
       cb360_mobile_modules = botões da grelha da MainPage (data-module)
       user_accesses: can_access=false -> botão com cadeado na Mobile (sem linha = tem acesso) */
    let MOBILE_MODULES = [];
    let mobileAccessNint = null;      // formato do n_int usado nas linhas deste elemento
    async function generateMobileAccessCheckboxes(nInt) {
      const container = document.getElementById("mobile-access-container");
      if (!container) return;
      container.innerHTML = '';
      container.dataset.ready = '';
      try {
        if (!MOBILE_MODULES.length) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/cb360_mobile_modules?select=label,display_name&active=is.true&order=sort_order.asc,label.asc`, {headers: getSupabaseHeaders()});
          if (!r.ok) throw new Error(await r.text());
          MOBILE_MODULES = await r.json();
        }
        let locked = new Set();
        /* módulos desligados para toda a corporação (corporation_data.mobile_modules_off): ficam trancados e sem poder mexer */
        let corpOff = new Set();
        try {
          const rc = await fetch(`${SUPABASE_URL}/rest/v1/corporation_data?select=mobile_modules_off&corp_oper_nr=eq.${sessionStorage.getItem("currentCorpOperNr")}&limit=1`, {headers: getSupabaseHeaders()});
          if (rc.ok) corpOff = new Set(String((await rc.json())?.[0]?.mobile_modules_off || '').split(',').map(s => s.trim()).filter(Boolean));
        } catch (e) { console.warn("Módulos da corporação indisponíveis:", e); }
        mobileAccessNint = null;
        if (nInt) {
          const corp = sessionStorage.getItem("currentCorpOperNr");
          const r2 = await fetch(`${SUPABASE_URL}/rest/v1/user_accesses?select=n_int,module_key,can_access&corp_oper_nr=eq.${corp}&n_int=in.(${nintVariants(nInt).map(v => `"${v}"`).join(",")})`, {headers: getSupabaseHeaders()});
          if (!r2.ok) throw new Error(await r2.text());
          const rows = await r2.json();
          if (rows.length) mobileAccessNint = rows[0].n_int;
          locked = new Set(rows.filter(x => x.can_access === false).map(x => x.module_key));
        }
        if (!MOBILE_MODULES.length) {
          container.innerHTML = '<p style="color:#666; font-size:13px;">Sem módulos da Mobile configurados.</p>';
          return;
        }
        MOBILE_MODULES.forEach(m => {
          /* mesma estrutura e medidas das caixas do Online (createCheckbox) */
          const wrap = document.createElement("div");
          wrap.className = "access-wrapper";
          wrap.style.cssText = "margin-bottom: 5px; display: flex; align-items: center; gap: 8px;";
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.className = "mobile-access-checkbox";
          cb.value = m.label;
          cb.checked = !locked.has(m.label);
          cb.setAttribute("style", "width: 18px !important; height: 18px !important; cursor: pointer !important; outline: none !important; box-shadow: none !important; appearance: none; -webkit-appearance: checkbox;");
          const txt = document.createElement("span");
          txt.className = "label-text";
          txt.textContent = m.display_name || m.label;
          txt.style.cssText = "font-size: 14px; color: #444; cursor: pointer;";
          txt.addEventListener("click", () => { if (!cb.disabled) cb.click(); });
          if (corpOff.has(m.label)) {
            /* mantém o valor do elemento (para quando a corporação voltar a ter o módulo), mas não deixa mexer */
            cb.disabled = true;
            cb.style.cursor = "not-allowed";
            wrap.style.cursor = "not-allowed";
            wrap.style.opacity = "0.55";
            wrap.title = "Módulo desligado para a corporação";
            const tag = document.createElement("small");
            tag.textContent = "🔒 desligado na corporação";
            tag.style.cssText = "color:#c62828; font-size:11px;";
            wrap.append(cb, txt, tag);
          } else {
            wrap.append(cb, txt);
          }
          container.appendChild(wrap);
        });
        container.dataset.ready = '1';
      } catch (e) {
        console.error("Erro ao carregar acessos da Mobile:", e);
        container.innerHTML = '<p style="color:#c62828; font-size:13px;">Não foi possível carregar os acessos da Mobile. Não serão alterados ao gravar.</p>';
      }
    }
    async function saveMobileAccesses(nInt, corpOperNr) {
      const container = document.getElementById("mobile-access-container");
      if (!container || container.dataset.ready !== '1') return;   // não carregou: não mexe
      const nintKey = mobileAccessNint || String(parseInt(nInt, 10)).padStart(3, "0");
      const rows = Array.from(document.querySelectorAll('.mobile-access-checkbox')).map(cb => ({
        corp_oper_nr: corpOperNr, n_int: nintKey, module_key: cb.value, can_access: cb.checked
      }));
      if (!rows.length) return;
      /* apaga linhas do mesmo elemento gravadas com outro formato de n_int (005 / 5 / …) */
      const others = nintVariants(nInt).filter(v => v !== nintKey);
      if (others.length) {
        await fetch(`${SUPABASE_URL}/rest/v1/user_accesses?corp_oper_nr=eq.${corpOperNr}&n_int=in.(${others.map(v => `"${v}"`).join(",")})`, {
          method: "DELETE", headers: getSupabaseHeaders()
        });
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_accesses?on_conflict=corp_oper_nr,n_int,module_key`, {
        method: "POST",
        headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
        body: JSON.stringify(rows)
      });
      if (!res.ok) throw new Error(await accessErrorMsg(res, "Elemento gravado, mas os acessos da Mobile não foram alterados"));
    }
    async function generateAccessCheckboxes() {
      const container = document.getElementById("access-container");
      if (!container) return;
      container.innerHTML = '';
      if (!ACCESS_OPTIONS.length) {
        try {
          ACCESS_OPTIONS = await loadAccessOptions();
        } catch (e) {
          console.error("Erro ao carregar a árvore de acessos:", e);
        }
      }
      if (!ACCESS_OPTIONS.length) {
        container.innerHTML = '<p style="color:#c62828; font-size:13px;">Não foi possível carregar a lista de acessos. Os acessos deste elemento não serão alterados ao gravar.</p>';
        return;
      }
      ACCESS_OPTIONS.forEach(option => container.appendChild(createCheckbox(option, 0)));
    }
    function createCheckbox(option, level) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("access-wrapper");
      wrapper.style.marginLeft = level === 0 ? "0px" : "20px";
      wrapper.style.marginBottom = "5px";
      const closeAllChildren = (parent) => {
        parent.querySelectorAll(".child-container").forEach(c => c.style.display = "none");
        parent.querySelectorAll(".toggle-icon").forEach(t => t.textContent = "▶");
        parent.querySelectorAll(".label-text").forEach(l => {
          l.style.color = "#444";
          l.style.fontWeight = "normal";
        });
      };
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "8px";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "access-checkbox";
      cb.value = option.label;
      cb.setAttribute("style", `width: 18px !important; height: 18px !important; cursor: pointer !important; outline: none !important; box-shadow: none !important; appearance: none; -webkit-appearance: checkbox;`);
      const labelText = document.createElement("span");
      labelText.className = "label-text";
      labelText.textContent = option.text || option.label;
      labelText.style.fontSize = "14px";
      labelText.style.color = "#444";
      labelText.style.transition = "color 0.2s, font-weight 0.2s";
      const toggleContainer = document.createElement("div");
      toggleContainer.style.width = "15px";
      toggleContainer.style.display = "flex";
      toggleContainer.style.justifyContent = "center";
      const childContainer = document.createElement("div");
      childContainer.className = "child-container";
      childContainer.style.display = "none";
      if (option.children && option.children.length > 0) {
        const toggle = document.createElement("span");
        toggle.className = "toggle-icon";
        toggle.textContent = "▶";
        toggle.style.cursor = "pointer";
        toggle.style.fontSize = "10px";
        toggle.style.color = "#666";
        toggle.addEventListener("click", () => {
          const isOpen = childContainer.style.display !== "none";
          if (isOpen) {
            childContainer.style.display = "none";
            toggle.textContent = "▶";
            labelText.style.color = "#444";
            labelText.style.fontWeight = "normal";
            closeAllChildren(childContainer);
          } else {
            const parentElement = wrapper.parentElement;
            if (parentElement) {
              const siblings = parentElement.querySelectorAll(`:scope > .access-wrapper`);
              siblings.forEach(sibling => {
                if (sibling !== wrapper) {
                  const sChildContainer = sibling.querySelector(".child-container");
                  const sToggle = sibling.querySelector(".toggle-icon");
                  const sLabel = sibling.querySelector(".label-text");
                  if (sChildContainer) {
                    sChildContainer.style.display = "none";
                    if (sToggle) sToggle.textContent = "▶";
                    if (sLabel) {
                      sLabel.style.color = "#444";
                      sLabel.style.fontWeight = "normal";
                    }
                    closeAllChildren(sChildContainer);
                  }
                }
              });
            }
            childContainer.style.display = "block";
            toggle.textContent = "▼";
            labelText.style.color = "#e74c3c";
            labelText.style.fontWeight = "bold";
          }
        });
        toggleContainer.appendChild(toggle);
        option.children.forEach(child => {
          childContainer.appendChild(createCheckbox(child, level + 1));
        });
      }
      row.appendChild(toggleContainer);
      row.appendChild(cb);
      row.appendChild(labelText);
      wrapper.appendChild(row);
      wrapper.appendChild(childContainer);
      cb.addEventListener("change", () => {
        if (cb.checked) {
          let currentWrapper = wrapper;
          while (currentWrapper) {
            const parentWrapper = currentWrapper.parentElement.closest(".access-wrapper");
            if (parentWrapper) {
              const parentCb = parentWrapper.querySelector(":scope > div > .access-checkbox");
              if (parentCb) parentCb.checked = true;
              currentWrapper = parentWrapper;
            } else {
              currentWrapper = null;
            }
          }
        } else {
          childContainer.querySelectorAll(".access-checkbox").forEach(c => {
            c.checked = false;
          });
        }
      });
      return wrapper;
    }
    function buildAbvName(fullName) {
      const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1]}`;
    }
    function mapUserRole() {
      const val = document.getElementById("win_type").value;
      return val === "Administrador" ? "admin" : (val === "Sub-Administrador" ? "subadmin" : "user");
    }
    async function loadUserLogin(nInt, corp) {
      const list = nintVariants(nInt).map(v => `"${v}"`).join(",");
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users?n_int=in.(${list})&corp_oper_nr=eq.${corp}&select=id,username,validate`, {
        headers: getSupabaseHeaders()
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
    }
    async function loadElemPrivate(elemId) {
      if (!elemId) return null;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems_private?elem_id=eq.${elemId}&select=nif,niss,nib`, {
        headers: getSupabaseHeaders()
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
    }
    function nintVariants(nInt) {
      const raw = String(nInt ?? "").trim();
      const num = String(parseInt(raw, 10));
      return [...new Set([raw, num, num.padStart(3, "0")])].filter(v => v && v !== "NaN");
    }
    async function loadMobileLogin(nInt, corp) {
      const variants = nintVariants(nInt);
      if (!variants.length) return null;
      const list = variants.map(v => `"${v}"`).join(",");
      const res = await fetch(`${SUPABASE_URL}/rest/v1/users_mobile?corp_oper_nr=eq.${corp}&nint_corp=in.(${list})&select=id,username,validate`, {
        headers: getSupabaseHeaders()
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
    }
    document.addEventListener("DOMContentLoaded", () => {
      initTabs();
      loadElementsTable();
      document.getElementById("elems-saveBtn").addEventListener("click", saveElement);
      document.getElementById("win_state").addEventListener("change", toggleStateDateVisibility);
      document.getElementById("win_full_name")?.addEventListener("input", function () {
        const abvEl = document.getElementById("win_abv_name");
        if (abvEl) abvEl.value = buildAbvName(this.value);
      });
      ["win_password_main", "win_password_mobile"].forEach(id => document.getElementById(id)?.setAttribute("autocomplete", "new-password"));
      ["win_user_name_main", "win_user_name_mobile"].forEach(id => document.getElementById(id)?.setAttribute("autocomplete", "off"));
    });
    document.getElementById("win_search_element")?.addEventListener("input", function() {
      const filterText = this.value.toLowerCase().trim();
      const tbody = document.querySelector("#elements-container tbody");
      if (!tbody) return;
      const rows = tbody.querySelectorAll("tr");
      rows.forEach(row => {
        if (row.querySelector('td[colspan]')) return;
        const nInt = row.children[0]?.textContent.toLowerCase() || "";
        const nFile = row.children[1]?.textContent.toLowerCase() || "";
        const patent = row.children[2]?.textContent.toLowerCase() || "";
        const fullName = row.children[3]?.textContent.toLowerCase() || "";
        if (nInt.includes(filterText) || nFile.includes(filterText) || patent.includes(filterText) || fullName.includes(filterText)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
      rows.forEach(row => {
        if (!row.querySelector('td[colspan]')) return;
        let next = row.nextElementSibling;
        let hasVisible = false;
        while (next && !next.querySelector('td[colspan]')) {
          if (next.style.display !== "none") {hasVisible = true; break;}
          next = next.nextElementSibling;
        }
        row.style.display = hasVisible || filterText === "" ? "" : "none";
      });
    });
    function handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const photoPreview = document.getElementById("win_photo_preview");
          if (photoPreview) {
            photoPreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; display: block;">`;
          }
        };
        reader.readAsDataURL(file);
      }
    }
    function removePhoto() {
      const photoPreview = document.getElementById("win_photo_preview");
      const photoInput = document.getElementById("win_photo_input");
      if (photoPreview) {
        photoPreview.innerHTML = `
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
        `;
        photoPreview.dataset.photoUrl = "";
      }
      if (photoInput) photoInput.value = "";
    }
    /* =======================================
    VEHICLE LISTING
    ======================================= */
    /* ================= LOAD VEHICLES TABLE ================= */
    async function loadVehiclesTable() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        if (!corpOperNr) throw new Error("Corporação não definida");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?select=*&corp_oper_nr=eq.${encodeURIComponent(corpOperNr)}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
        const data = await response.json();
        const tbody = document.querySelector("#veícs-container tbody");
        tbody.innerHTML = "";
        if (!data.length) {
          const tr = document.createElement("tr");
          tr.innerHTML = 
            `<td colspan="5" style="text-align:center; padding:20px; color:#666;">
                Nenhum veículo encontrado.
             </td>            
            `;
          tbody.appendChild(tr);
          return;
        }
        data.sort((a, b) => (a.vehicle ?? "").localeCompare(b.vehicle ?? "", "pt", { numeric: true }));
        data.forEach(row => {
          const tr = document.createElement("tr");
          ["vehicle", "vehicle_registration", "current_status"].forEach(field => {
            const td = document.createElement("td");
            td.textContent = row[field] ?? "";
            td.style.textAlign = "center";
            if (field === "current_status") {
              if (row.current_status === "Disponível no Quartel") td.style.color = "green";
             else if (row.current_status === "Em Serviço") td.style.color = "orange";
             else if (row.current_status === "Inoperacional") td.style.color = "red";
            }
            tr.appendChild(td);
          });
          const tdAction = document.createElement("td");
          tdAction.style.textAlign = "center";
          const editBtn = document.createElement("button");
          editBtn.textContent = "✏️";
          editBtn.classList.add("btn-action");
          editBtn.style.marginRight = "5px";
          editBtn.addEventListener("click", () => fillVehicleForm(row));
          tdAction.appendChild(editBtn);
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "🗑️";
          deleteBtn.classList.add("btn-delete");
          deleteBtn.addEventListener("click", () => deleteVehicle(row.id, row.vehicle));
          tdAction.appendChild(deleteBtn);
          tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error("❌ Erro ao carregar veículos:", err);
      }
    }
    /* ================= FILL FORM FOR EDIT ================= */
    let editVehicleId = null;
    function fillVehicleForm(vehicle) {
      editVehicleId = vehicle.id;
      document.getElementById("new-veíc-name").value = vehicle.vehicle ?? "";
      document.getElementById("new-veíc-registration").value = vehicle.vehicle_registration ?? "";
      document.getElementById("new-veíc-brand").value = vehicle.vehicle_brand ?? "";
      document.getElementById("new-veíc-model").value = vehicle.vehicle_model ?? "";
      document.getElementById("new-veíc-buy-date").value = vehicle.buy_date ?? "";
      document.getElementById("new-veíc-registration-date").value = vehicle.registration_date ?? "";
      document.getElementById("new-veíc-state").value = vehicle.current_status ?? "";
    }
    /* ================= ADD / UPDATE VEHICLE ================= */
    document.querySelector("#new-veíc-save-update").addEventListener("click", async () => {
      const vehicleName = document.getElementById("new-veíc-name").value.trim();
      const vehicleRegistration = document.getElementById("new-veíc-registration").value.trim();
      const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!vehicleName || !vehicleRegistration) {
        showPopup('popup-danger', "Nome e matrícula são obrigatórios!");
        return;
      }
      if (!currentCorpOperNr) {
        showPopup('popup-danger', "Corporação não definida!");
        return;
      }
      const payload = {vehicle: vehicleName, vehicle_registration: vehicleRegistration, vehicle_brand: document.getElementById("new-veíc-brand").value,
                       vehicle_model: document.getElementById("new-veíc-model").value, buy_date: document.getElementById("new-veíc-buy-date").value,
                       registration_date: document.getElementById("new-veíc-registration-date").value, current_status: document.getElementById("new-veíc-state").value,
                       is_inop: document.getElementById("new-veíc-state").value === "Inoperacional", corp_oper_nr: currentCorpOperNr};
      try {
        let method, url;
        if (editVehicleId) {
          method = "PATCH";
          url = `${SUPABASE_URL}/rest/v1/vehicle_status?id=eq.${editVehicleId}`;
        } else {
          method = "POST";
          url = `${SUPABASE_URL}/rest/v1/vehicle_status`;
        }
        const response = await fetch(url, {
          method,
          headers: getSupabaseHeaders({ Prefer: "return=representation" }),
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`${response.status} - ${errorData.message || ''}`);
        }
        showPopup('popup-success', editVehicleId ? "Veículo atualizado com sucesso!" : "Veículo adicionado com sucesso!");
        editVehicleId = null;
        ["new-veíc-name","new-veíc-registration","new-veíc-brand","new-veíc-model","new-veíc-buy-date","new-veíc-registration-date","new-veíc-state"]
          .forEach(id => document.getElementById(id).value = "");
        loadVehiclesTable();
      } catch (err) {
        console.error("Erro:", err);
        showPopup('popup-danger', `Erro: ${err.message}`);
      }
    });
    /* ================= DELETE VEHICLE ================= */
    async function deleteVehicle(id, vehicleName) {
      const confirmDelete = confirm(`Tem certeza que deseja remover o veículo "${vehicleName}"?`);
      if (!confirmDelete) return;
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?id=eq.${id}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao remover veículo");
        showPopup('popup-success', "Veículo removido com sucesso!");
        loadVehiclesTable();
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', "Erro ao remover veículo.");
      }
    }
    /* ================= INITIAL LOAD ================= */
    document.addEventListener("DOMContentLoaded", () => {
      loadVehiclesTable();
    });
    /* =======================================
    EMAIL's FUNCTIONS
    ======================================= */
    /* ========== LOAD DE EMAILS ========== */
    async function loadMailsConfig() {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) return;
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${currentCorpNr}`, {
            method: "GET",
            headers: getSupabaseHeaders()
          }
        );
        const rows = await resp.json();
        if (!Array.isArray(rows)) return;
        document.getElementById("config_plandir_emit_to").value = rows.find(r => r.category === "plandir_emit_mail_to")?.value || "";
        document.getElementById("config_plandir_emit_cc").value = rows.find(r => r.category === "plandir_emit_mail_cc")?.value || "";
        document.getElementById("config_plandir_emit_bcc").value = rows.find(r => r.category === "plandir_emit_mail_bcc")?.value || "";
        document.getElementById("config_pointjustif_mail_to").value = rows.find(r => r.category === "pointjustif_mail_to")?.value || "";
        document.getElementById("config_pointjustif_mail_cc").value = rows.find(r => r.category === "pointjustif_mail_cc")?.value || "";
        document.getElementById("config_pointjustif_mail_bcc").value = rows.find(r => r.category === "pointjustif_mail_bcc")?.value || "";
        document.getElementById("config_solfardam_mail_to").value = rows.find(r => r.category === "solfardam_mail_to")?.value || "";
        document.getElementById("config_solfardam_mail_cc").value = rows.find(r => r.category === "solfardam_mail_cc")?.value || "";
        document.getElementById("config_solfardam_mail_bcc").value = rows.find(r => r.category === "solfardam_mail_bcc")?.value || "";
        document.getElementById("config_sitop_veiculos_mail_to").value = rows.find(r => r.category === "crepcsitop_mail_to")?.value || "";
        document.getElementById("config_sitop_veiculos_mail_cc").value = rows.find(r => r.category === "crepcsitop_mail_cc")?.value || "";
        document.getElementById("config_sitop_veiculos_mail_bcc").value = rows.find(r => r.category === "crepcsitop_mail_bcc")?.value || "";
        document.getElementById("config_moa_mail_to").value = rows.find(r => r.category === "crepcmoa_mail_to")?.value || "";
        document.getElementById("config_moa_mail_cc").value = rows.find(r => r.category === "crepcmoa_mail_cc")?.value || "";
        document.getElementById("config_moa_mail_bcc").value = rows.find(r => r.category === "crepcmoa_mail_bcc")?.value || "";
        const roTo = document.getElementById("config_ro_crepc_mail_to");
        const roCc = document.getElementById("config_ro_crepc_mail_cc");
        const roBcc = document.getElementById("config_ro_crepc_mail_bcc");
        if (roTo) roTo.value = rows.find(r => r.category === "ro_crepc_mail_to")?.value || "";
        if (roCc) roCc.value = rows.find(r => r.category === "ro_crepc_mail_cc")?.value || "";
        if (roBcc) roBcc.value = rows.find(r => r.category === "ro_crepc_mail_bcc")?.value || "";
        MAIL_EXTRA_GROUPS.forEach(g => g.fields.forEach(f => {
          const el = document.getElementById(`config_${g.prefix}_mail_${f}`);
          if (el) el.value = rows.find(r => r.category === `${g.prefix}_mail_${f}`)?.value || "";
        }));
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', "Erro ao carregar emails: " + err.message);
      }
    }
    /* ======= INSERT INTO SUPABASE ======= */
    async function insertMailsIntoSupabase(table, payload) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}`, {
            method: "POST",
            headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
            body: JSON.stringify(payload)
          }
        );
        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Erro Supabase POST: ${err}`);
        }
        return true;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    /* ========= EMAIL VALIDATION ========= */
    function validateEmails(emailString) {
      if (!emailString) return true;
      const emails = emailString.split(",").map(e => e.trim());
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every(email => regex.test(email));
    }
    /* ===== UPSERT HELPER ===== */
    async function saveMailConfigRow(corpOperNr, category, value) {
      const checkUrl = `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpOperNr}&category=eq.${category}&select=id`;
      const checkRes = await fetch(checkUrl, {headers: getSupabaseHeaders()});
      if (!checkRes.ok) throw new Error(`Erro ao ler ${category}: ` + await checkRes.text());
      const existing = await checkRes.json();
      let res;
      if (existing.length > 0) {
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpOperNr}&category=eq.${category}`, {
            method: "PATCH",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({value})
          }
        );
      } else {
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/mails_config`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Prefer": "return=minimal"},
            body: JSON.stringify({corp_oper_nr: corpOperNr, category, value})
          }
        );
      }
      if (!res.ok) {
        const t = await res.text();
        let msg = t;
        try { msg = JSON.parse(t).message || t; } catch (e) {}
        throw new Error(`Erro ao gravar ${category}: ${msg}`);
      }
    }
    async function saveMailRowsGroup(rows, successMsg) {
      const currentCorpNr = sessionStorage.getItem("currentCorpOperNr");
      if (!currentCorpNr) return;
      const invalid = rows.filter(r => !validateEmails(r.value));
      if (invalid.length) {
        showPopup('popup-danger', "Há emails com formato inválido. Separe vários emails por vírgula.");
        return;
      }
      try {
        for (const row of rows) {
          await saveMailConfigRow(currentCorpNr, row.category, (row.value || "").trim());
        }
        showPopup('popup-success', successMsg);
      } catch (err) {
        console.error(err);
        showPopup('popup-danger', err.message || "Erro ao gravar os emails.");
      }
    }
    /* ============ SAVE PLANOS DIÁRIOS (EMISSÃO) ============ */
    async function savePlandirEmitMails() {
      const rows = [{category: "plandir_emit_mail_to",  value: document.getElementById("config_plandir_emit_to").value}, {category: "plandir_emit_mail_cc",  value: document.getElementById("config_plandir_emit_cc").value}, {category: "plandir_emit_mail_bcc", value: document.getElementById("config_plandir_emit_bcc").value}];
      await saveMailRowsGroup(rows, "Emails para emissão de Planeamentos Diários atualizados com sucesso.");
    }
    /* ============ SAVE JUSTIFICAÇÃO DE PONTO ============ */
    async function savePointJustifMails() {
      const rows = [{category: "pointjustif_mail_to",  value: document.getElementById("config_pointjustif_mail_to").value}, {category: "pointjustif_mail_cc",  value: document.getElementById("config_pointjustif_mail_cc").value}, {category: "pointjustif_mail_bcc", value: document.getElementById("config_pointjustif_mail_bcc").value}];
      await saveMailRowsGroup(rows, "Emails para justificação de picagens de ponto atualizados com sucesso.");
    }
    /* ============ SAVE SOLICITAÇÃO DE FARDAMENTO ============ */
    async function saveSolFardamMails() {
      const rows = [{category: "solfardam_mail_to",  value: document.getElementById("config_solfardam_mail_to").value}, {category: "solfardam_mail_cc",  value: document.getElementById("config_solfardam_mail_cc").value}, {category: "solfardam_mail_bcc", value: document.getElementById("config_solfardam_mail_bcc").value}];
      await saveMailRowsGroup(rows, "Emails para solicitação de fardamento atualizados com sucesso.");
    }
    /* ============ SAVE SITOP VEÍCULOS ============ */
    async function saveSitopVeiculosMails() {
      const rows = [{category: "crepcsitop_mail_to",  value: document.getElementById("config_sitop_veiculos_mail_to").value}, {category: "crepcsitop_mail_cc",  value: document.getElementById("config_sitop_veiculos_mail_cc").value}, {category: "crepcsitop_mail_bcc", value: document.getElementById("config_sitop_veiculos_mail_bcc").value}];
      await saveMailRowsGroup(rows, "Emails para envio de Situações Operacionais de Veículos atualizados com sucesso.");
    }
    /* ============= SAVE MOA ============== */
    async function saveMoaMails() {
      const rows = [{category: "crepcmoa_mail_to",  value: document.getElementById("config_moa_mail_to").value}, {category: "crepcmoa_mail_cc",  value: document.getElementById("config_moa_mail_cc").value}, {category: "crepcmoa_mail_bcc", value: document.getElementById("config_moa_mail_bcc").value}];
      await saveMailRowsGroup(rows, "Emails para envio de Medidas Operacionais de Antecipação atualizados com sucesso.");
    }
    /* ======= SAVE RELATÓRIOS DE OCORRÊNCIA (CREPC) ======= */
    async function saveRoCrepcMails() {
      const rows = [{category: "ro_crepc_mail_to",  value: document.getElementById("config_ro_crepc_mail_to").value}, {category: "ro_crepc_mail_cc",  value: document.getElementById("config_ro_crepc_mail_cc").value}, {category: "ro_crepc_mail_bcc", value: document.getElementById("config_ro_crepc_mail_bcc").value}];
      await saveMailRowsGroup(rows, "Emails para envio de Relatórios de Ocorrência atualizados com sucesso.");
    }
    /* ======= NOVOS GRUPOS (antes estavam fixos no código com os emails de Faro) ======= */
    const MAIL_EXTRA_GROUPS = [
      {prefix: "bulk",           fields: ["to", "cc", "bcc"], msg: "Emails dos envios em massa atualizados com sucesso."},
      {prefix: "attendance",     fields: ["to", "cc", "bcc"], msg: "Emails da Lista de Comparências atualizados com sucesso."},
      {prefix: "volunt_verify",  fields: ["to", "cc", "bcc"], msg: "Emails de envio para validação (Voluntariado) atualizados com sucesso."},
      {prefix: "volunt_valid",   fields: ["to", "cc", "bcc"], msg: "Emails de serviços validados (Voluntariado) atualizados com sucesso."},
      {prefix: "volunt_invalid", fields: ["to", "cc", "bcc"], msg: "Emails de serviços com inconsistências (Voluntariado) atualizados com sucesso."},
      {prefix: "decir_disp",     fields: ["to", "cc"],        msg: "Emails das disponibilidades DECIR atualizados com sucesso."},
      {prefix: "rh_disp",        fields: ["to", "cc"],        msg: "Emails das disponibilidades das escalas (INEM/EIP/OPTEL) atualizados com sucesso."}
    ];
    MAIL_EXTRA_GROUPS.forEach(g => {
      document.getElementById(`config_${g.prefix}_mail_save`)?.addEventListener("click", async () => {
        const rows = g.fields.map(f => ({category: `${g.prefix}_mail_${f}`, value: document.getElementById(`config_${g.prefix}_mail_${f}`)?.value || ""}));
        await saveMailRowsGroup(rows, g.msg);
      });
    });
    /* ========== EVENT LISTENERS ========== */
    document.getElementById("config_plandir_emit_mail_save")?.addEventListener("click", savePlandirEmitMails);
    document.getElementById("config_pointjustif_mail_save")?.addEventListener("click", savePointJustifMails);
    document.getElementById("config_solfardam_mail_save")?.addEventListener("click", saveSolFardamMails);
    document.getElementById("config_sitop_veiculos_mail_save")?.addEventListener("click", saveSitopVeiculosMails);
    document.getElementById("config_moa_mail_save")?.addEventListener("click", saveMoaMails);
    document.getElementById("config_ro_crepc_mail_save")?.addEventListener("click", saveRoCrepcMails);
    /* ---------- globais (o mainloader chama-as depois do login) ---------- */
    window.generateAccessCheckboxes = generateAccessCheckboxes;
    window.loadElementsTable = loadElementsTable;
})();
