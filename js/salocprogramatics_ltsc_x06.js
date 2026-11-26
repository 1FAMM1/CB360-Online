    /* =======================================
    SALOC PROGRAMATICS (CB360)
    ======================================= */
    (() => {
    /* ----------------------------- estilos ----------------------------- */
    if (!document.getElementById('saloc-css')) {
      const css = document.createElement('style');
      css.id = 'saloc-css';
      css.textContent = `
        /* PPIs: grelha aparece de uma vez, já montada */
        [id^="page-ppi"] [id$="-grid-references"], [id^="page-ppi"] [id$="-grid-container"], [id^="page-ppi"] [id$="-specials-container"],
        [id^="page-ppi"] [id$="-grid-info-container"], [id^="page-ppi"] [id$="-abs-note"] {transition: opacity .15s ease-out;}
        .ppi-busy [id$="-grid-references"], .ppi-busy [id$="-grid-container"], .ppi-busy [id$="-specials-container"],
        .ppi-busy [id$="-grid-info-container"], .ppi-busy [id$="-abs-note"] {opacity: .15 !important; transition: opacity .1s ease-in !important;}


        /* ===== Consola de Alarmes (layout novo, só estilo) ===== */
        #page-alarm-console .sl-255 {gap: 10px !important;}
        #page-alarm-console .sl-256, #page-alarm-console .sl-264 {background: #fff !important; border: 1px solid #e9ecef !important; border-radius: 12px !important; box-shadow: 0 1px 3px rgba(0,0,0,.05) !important;
                     padding: 14px 16px !important; margin: 0 !important; align-items: stretch !important; box-sizing: border-box;}
        #page-alarm-console .sl-257, #page-alarm-console .sl-265 {display: flex; align-items: center; gap: 9px; margin: 0 0 12px !important; padding: 0 0 8px; border-bottom: 1px solid #eef0f2; font-size: 12.5px !important;
                     font-weight: 800 !important; color: #2c3e50 !important; letter-spacing: .4px !important; text-transform: uppercase;}
        #page-alarm-console .sl-257::before, #page-alarm-console .sl-265::before {content: ''; width: 4px; height: 16px; border-radius: 3px; background: #c62828; flex: none;}
        #page-alarm-console .sl-258, #page-alarm-console .sl-214 {font-size: 11px !important; font-weight: 800 !important; color: #8a949e !important; text-transform: uppercase; letter-spacing: .4px; margin: 0 0 8px !important; text-align: left;}
        #page-alarm-console .sl-259 {display: grid !important; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px !important; margin: 0 !important;}
        #page-alarm-console .sl-260 {width: auto !important; height: 46px !important; margin: 0 !important; background: #f8f9fa !important; color: #2c3e50 !important; border: 1px solid #dfe3e7 !important; border-radius: 10px !important;
                     font-size: 11px !important; font-weight: 800 !important; letter-spacing: .3px; line-height: 1.2; box-shadow: none; transform: none; transition: background .15s, border-color .15s;}
        #page-alarm-console .sl-260:hover {background: #fdf0ee !important; border-color: #e6b3ad !important;}
        #page-alarm-console .sl-260.active {background: #2c3e50 !important; color: #fff !important; border-color: #2c3e50 !important;}
        #page-alarm-console .sl-261 {flex-direction: column; align-items: stretch !important; gap: 0 !important; margin-top: 14px !important;}
        #page-alarm-console .sl-261 select {height: 34px !important; background: #fff !important; color: #2c3e50 !important; border: 1px solid #c8c8c8 !important; border-radius: 8px !important; font-size: 12.5px; outline: none;}
        #page-alarm-console .sl-261 select:focus {border-color: #c0392b !important; box-shadow: 0 0 0 2px rgba(192,57,43,.12);}
        #page-alarm-console .sl-262 {height: 40px !important; margin-top: 12px !important; border: 0 !important; border-radius: 10px !important; background: linear-gradient(180deg,#d64535,#b0281a) !important; color: #fff !important;
                     font-weight: 800 !important; letter-spacing: .6px; box-shadow: 0 2px 6px rgba(176,40,26,.25); transform: none;}
        #page-alarm-console .sl-262:hover {filter: brightness(1.06);}
        #page-alarm-console .sl-264 {max-width: 520px !important; margin: 10px auto 0 !important; display: flex !important;}
        #page-alarm-console .sl-266 {display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px !important; margin: 0 !important;}
        #page-alarm-console .sl-267 {width: auto !important; height: 44px !important; margin: 0 !important; background: #2c3e50 !important; color: #fff !important; border: 0 !important; border-left: 4px solid #c62828 !important;
                     border-radius: 10px !important; font-weight: 800 !important; letter-spacing: .6px; box-shadow: none; transform: none;}
        #page-alarm-console .sl-267:hover {background: #34495e !important;}
        #page-alarm-console button:disabled:not(.is-transmitting) {opacity: .55;}
        #page-alarm-console .sl-260.is-transmitting, #page-alarm-console .sl-262.is-transmitting, #page-alarm-console .sl-267.is-transmitting {background: #ff4444 !important; color: #fff !important; border-color: #ff0000 !important; opacity: 1; filter: none !important; animation: pulse-live 1s infinite !important;}

        /* ===== Hemodiálise (layout novo, só estilo) ===== */
        .slx-hemo .sl-185 {width: auto !important; max-width: none !important; flex: none !important;}
        #hemo-utentdata-card > .options-main-card, #hemo-utentlist-card > .options-main-card, .slx-hemo .sl-202, .slx-hemo .sl-210 {background: #fff !important; border: 1px solid #e9ecef !important; border-radius: 12px !important;
                     box-shadow: 0 1px 3px rgba(0,0,0,.05) !important; padding: 12px 14px !important; box-sizing: border-box;}
        .slx-hemo .sl-186 {display: flex; align-items: center; gap: 9px; background: none !important; margin: 0 0 10px !important; padding: 0 0 8px !important; font-size: 12.5px !important; font-weight: 800 !important;
                     color: #2c3e50 !important; letter-spacing: .4px !important; border: 0 !important; border-bottom: 1px solid #eef0f2 !important; text-align: left !important; justify-content: flex-start !important;}
        .slx-hemo .sl-186::before, .slx-hemo .sl-203::before {content: ''; width: 4px; height: 16px; border-radius: 3px; background: #c62828; flex: none;}
        #hemo-utentdata-card label.sl-33 {font-size: 11px !important; font-weight: 800 !important; color: #6c757d !important; text-transform: uppercase; letter-spacing: .3px;}
        #hemo-utentdata-card input[type="text"], #hemo-utentdata-card select, #utent_h_treatment_days_btn {height: 32px !important; min-height: 32px !important; border: 1px solid #c8c8c8 !important; border-radius: 6px !important;
                     font-size: 12.5px !important; padding: 0 9px !important; box-sizing: border-box; background: #fff; outline: none;}
        #utent_h_treatment_days_btn {display: flex !important; align-items: center;}
        #hemo-utentdata-card input[type="text"]:focus, #hemo-utentdata-card select:focus {border-color: #c0392b !important; box-shadow: 0 0 0 2px rgba(192,57,43,.12);}
        #utent_h_treatment_days_dropdown {border-radius: 10px !important; border-color: #e3e7eb !important; padding: 8px 12px !important; box-shadow: 0 8px 22px rgba(0,0,0,.12) !important;}
        #utent_h_treatment_days_dropdown input {accent-color: #c0392b;}
        .slx-hemo .sl-194 {margin-top: 12px !important; padding-top: 10px; border-top: 1px solid #eef0f2;}
        /* tabelas */
        .slx-hemo table.sl-143 {border-collapse: separate !important; border-spacing: 0; width: 100%; border: 1px solid #e3e7eb !important; overflow: hidden;}
        #hemo-utentlist-card .sl-195 {max-height: 340px; border: 1px solid #e3e7eb; border-radius: 10px; scrollbar-width: thin; scrollbar-color: #e57373 #fbe9e7;}
        #hemo-utentlist-card table.sl-143 {border: 0 !important; border-radius: 0; overflow: visible !important;}
        #hemo-utentlist-card thead.sl-196 th {position: sticky; top: 0; z-index: 2;}
        .slx-hemo .sl-205 + table.sl-143, .slx-hemo .sl-211 + table.sl-143, .slx-hemo .sl-204 table.sl-143 {border-radius: 0 0 10px 10px;}
        .slx-hemo table.sl-143 th {background: #f1f3f5 !important; color: #5b6670 !important; border: 0 !important; border-bottom: 1px solid #e3e7eb !important; font-size: 11px !important; font-weight: 800 !important;
                     text-transform: uppercase; letter-spacing: .4px; padding: 6px 10px !important;}
        .slx-hemo table.sl-143 td {border: 0 !important; border-bottom: 1px solid #eef0f2 !important; padding: 4px 10px !important; font-size: 12.5px; background: #fff; line-height: 1.35;}
        .slx-hemo table.sl-143 tbody tr:last-child td {border-bottom: 0 !important;}
        .slx-hemo table.sl-143 tbody tr:hover td {background: #fdf6f5;}
        /* listagem semanal */
        .slx-hemo .sl-203 {display: flex !important; align-items: center; gap: 9px; justify-content: flex-start !important; text-align: left !important; font-size: 12.5px !important; font-weight: 800 !important; color: #2c3e50 !important;
                     background: none !important; text-transform: uppercase; letter-spacing: .4px; border: 0 !important; border-bottom: 1px solid #eef0f2 !important; padding: 0 0 8px !important; margin: 0 0 10px !important;}
        .slx-hemo .sl-204 {gap: 8px !important; scrollbar-width: thin; scrollbar-color: #e57373 #fbe9e7;}
        .slx-hemo .sl-205, .slx-hemo .sl-211 {background: #fff !important; color: #2c3e50 !important; text-align: left !important; border: 1px solid #e3e7eb !important; border-bottom: 0 !important; border-left: 4px solid var(--hc) !important;
                     border-radius: 10px 10px 0 0 !important; padding: 6px 12px !important; font-size: 12.5px !important; font-weight: 800 !important; margin-top: 0 !important;}
        .slx-hemo .sl-205 {--hc: #1565c0;} .slx-hemo .sl-211 {--hc: #c62828;}
        #hemo-utentdata-card, #hemo-utentlist-card, #hemo-week-cards {margin-top: 0 !important;}
        .slx-hemo > .major-card-body {gap: 8px !important;}
        #hemo-utentdata-card > .options-main-card, #hemo-utentlist-card > .options-main-card {margin: 0 !important;}
        .slx-hemo .sl-85 {margin-bottom: 0 !important;}
        .slx-hemo .sl-201 {margin: 0 !important;}
        .slx-hemo .sl-202, .slx-hemo .sl-210 {background: #e9ebee !important; border-color: #dcdfe3 !important;}
        .slx-hemo .sl-202 .sl-203, .slx-hemo .sl-210 .sl-203 {border-bottom-color: #d6d9dd !important;}
        .slx-hemo .sl-205, .slx-hemo .sl-211 {border-color: #d6d9dd !important;}
        .slx-hemo .sl-204 table.sl-143 {border-color: #d6d9dd !important;}
        .slx-hemo .sl-204 table.sl-143 td {font-weight: 600 !important;}
        #hemo-utentlist-tbody button {height: 24px; margin-top: 0 !important; margin-bottom: 0 !important; padding: 3px 9px !important; border-radius: 6px !important; font-size: 12px !important; transition: filter .15s;}
        #hemo-utentlist-tbody button[onclick^="editHemoUtent"] {background: #f1f3f5 !important; border: 1px solid #d5dbe1 !important; color: #2c3e50 !important;}
        #hemo-utentlist-tbody button[onclick^="deleteHemoUtent"] {background: #fff !important; border: 1px solid #f0b8b3 !important; color: #c62828 !important;}
        #hemo-utentlist-tbody button:hover {filter: brightness(.94);}
        #hemo-utentdata-card label.sl-33 {white-space: nowrap;}
        #utent_h_save {background: linear-gradient(180deg,#d64535,#b0281a) !important; color: #fff !important; border: 0 !important; border-radius: 8px !important; height: 34px; padding: 0 20px !important;
                     font-weight: 800 !important; letter-spacing: .4px; box-shadow: 0 2px 6px rgba(176,40,26,.25) !important;}
        #utent_h_save:hover {filter: brightness(1.06);}

        /* ===== Dashboard (layout novo, só estilo) ===== */
        .slx-dash .sl-63 {display: none;}
        .slx-dash .sl-64 {display: inline-flex !important; flex-direction: row !important; align-self: flex-start; align-items: center; gap: 10px !important; margin: 0 !important; background: #fff; border: 1px solid #e9ecef;
                          border-radius: 12px; padding: 8px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
        .slx-dash .sl-64 .major-field {flex-direction: row !important; align-items: center; gap: 10px; margin: 0 !important;}
        .slx-dash .sl-64 label {font-size: 11px !important; font-weight: 800 !important; color: #6c757d !important; text-transform: uppercase; letter-spacing: .3px; margin: 0 !important;}
        .slx-dash .sl-64 select {height: 32px; border: 1px solid #c8c8c8; border-radius: 6px; padding: 0 8px; font-size: 12.5px; background: #fff;}
        .slx-dash .sl-65, .slx-dash .sl-73, .slx-dash .sl-78 {gap: 10px !important; margin: 0 !important;}
        .slx-dash .sl-66, .slx-dash .sl-69, .slx-dash .sl-71 {background: #fff !important; border: 1px solid #e9ecef !important; border-left: 4px solid var(--c) !important; border-top: 1px solid #e9ecef !important;
                          border-radius: 10px !important; box-shadow: 0 1px 3px rgba(0,0,0,.05) !important; text-align: left !important; padding: 10px 16px !important;}
        .slx-dash .sl-66 {--c: #1565c0;} .slx-dash .sl-69 {--c: #c62828;} .slx-dash .sl-71 {--c: #ef6c00;}
        .slx-dash .sl-67 {font-size: 10.5px !important; font-weight: 800; color: #6c757d !important; letter-spacing: .4px !important; margin-bottom: 4px !important;}
        .slx-dash .sl-68, .slx-dash .sl-70, .slx-dash .sl-72 {font-size: 22px !important; line-height: 1.2;}
        .slx-dash .sl-74, .slx-dash .sl-77, .slx-dash .sl-79, .slx-dash .sl-80, .slx-dash .sl-81 {background: #fff !important; border: 1px solid #e9ecef !important; border-radius: 12px !important;
                          box-shadow: 0 1px 3px rgba(0,0,0,.05) !important; padding: 0 0 12px !important; overflow: hidden;}
        .slx-dash .sl-75 {text-align: left !important; font-size: 12px !important; font-weight: 800; color: #2c3e50 !important; letter-spacing: .4px; padding: 10px 14px; margin: 0 0 10px !important;
                          border-bottom: 1px solid #eef0f2; border-left: 4px solid var(--c, #3498db);}
        .slx-dash .sl-74 {--c: #3498db;} .slx-dash .sl-77 {--c: #e74c3c;} .slx-dash .sl-79 {--c: #9b59b6;} .slx-dash .sl-80 {--c: #e67e22;} .slx-dash .sl-81 {--c: #95a5a6;}
        .slx-dash .sl-76 {margin: 0 12px; max-width: calc(100% - 24px);}

        /* ===== Relatórios mensais (layout novo, só estilo) ===== */
        .slx-rep .sl-45 {display: inline-flex !important; align-self: flex-start; align-items: center; gap: 10px !important; margin: 0 !important; background: #fff; border: 1px solid #e9ecef; border-radius: 12px;
                         padding: 8px 14px; box-shadow: 0 1px 3px rgba(0,0,0,.05);}
        .slx-rep .sl-45 label {font-size: 11px !important; font-weight: 800 !important; color: #6c757d !important; text-transform: uppercase; letter-spacing: .3px; margin: 0 !important;}
        .slx-rep .sl-45 select {height: 32px; border: 1px solid #c8c8c8; border-radius: 6px; padding: 0 8px; font-size: 12.5px; background: #fff;}
        .slx-rep .sl-48 {gap: 10px !important;}
        .slx-rep .sl-49, .slx-rep .sl-59 {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); overflow: hidden;}
        .slx-rep .sl-50, .slx-rep .sl-60, .slx-rep .sl-61 {background: #fff !important; color: #2c3e50 !important; border-radius: 0 !important; border-bottom: 1px solid #eef0f2; font-size: 12.5px !important;
                         font-weight: 800 !important; text-transform: uppercase; letter-spacing: .4px !important; padding: 10px 14px !important; border-left: 4px solid var(--c);}
        .slx-rep .sl-50 {--c: #c62828;} .slx-rep .sl-60 {--c: #2e7d32;} .slx-rep .sl-61 {--c: #1565c0;}
        .slx-rep .sl-51 th {background: #f1f3f5; color: #5b6670 !important; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid #e3e7eb !important; padding: 8px 12px !important;}
        .slx-rep .sl-51 tbody td {border-bottom: 1px solid #eef0f2; padding: 7px 12px; font-size: 12.5px; color: #2c3e50;}
        .slx-rep .sl-51 tbody tr:hover td {background: #fdf6f5;}
        .slx-rep .sl-56 td {background: #f8f9fa; border-top: 1px solid #e3e7eb !important; font-weight: 800; color: #2c3e50; padding: 9px 12px !important;}

        /* ===== PPIs (A22, Aeroporto, Linha Férrea): só estilo, mesmas funções e cores de alarme ===== */
        #page-ppia22 > .major-card > .major-card-body, #page-ppiaero > .major-card > .major-card-body, #page-ppilinfer > .major-card > .major-card-body {background: #f4f5f7; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px;}
        /* escolha do tipo de consulta: contentor branco ao centro */
        #page-ppia22 .sl-14, #page-ppilinfer .sl-14 {justify-content: center !important; margin: 0 !important;}
        #ppia22-main-options, #ppilinfer-main-options {flex-direction: row !important; align-items: center !important; gap: 10px; background: #fff !important; border: 1px solid #e3e7eb !important;
                     border-radius: 999px !important; padding: 4px 4px 4px 16px !important; box-shadow: 0 1px 4px rgba(0,0,0,.06) !important; width: auto !important; margin: 0 !important;}
        #ppia22-main-options > label, #ppilinfer-main-options > label {margin: 0 !important; font-size: 11px !important; font-weight: 800 !important; color: #8a949e !important; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap;}
        #ppia22-options, #ppilinfer-options {display: flex !important; gap: 4px !important; margin: 0 !important; width: auto !important; max-width: none !important;}
        #ppia22-options .options-btn, #ppilinfer-options .options-btn {flex: none !important; min-width: 0 !important; max-width: none !important;}
        .ppia22-part1, #ppilinfer-specials-container .ppilinfer-part1 {border: 1px solid #e3e7eb !important; border-top: 0 !important; background: #fff; padding: 8px 12px !important; margin: 0 !important;}
        #ppia22-options .options-btn, #ppilinfer-options .options-btn {height: 32px !important; width: auto !important; padding: 0 16px !important; border-radius: 999px !important; border: 0 !important; background: transparent !important;
                     color: #2c3e50 !important; font-size: 12px !important; font-weight: 700 !important; text-transform: none; letter-spacing: 0; box-shadow: none !important; transform: none !important; white-space: nowrap;}
        #ppia22-options .options-btn:hover:not(:disabled), #ppilinfer-options .options-btn:hover:not(:disabled) {background: #f1f3f5 !important;}
        #ppia22-options .options-btn:disabled, #ppilinfer-options .options-btn:disabled {opacity: .4; cursor: not-allowed;}
        /* cartão de pesquisa (sentido/troço + km + Procurar) */
        #ppia22-grid-controls > .options-main-card, #ppilinfer-grid-controls > .options-main-card {background: #fff !important; border: 1px solid #e9ecef !important; border-radius: 14px !important;
                     box-shadow: 0 2px 8px rgba(0,0,0,.06) !important; padding: 18px 20px !important; width: 560px !important; max-width: 100%; margin: 0 auto !important; flex-direction: row !important;
                     flex-wrap: wrap; justify-content: center !important; align-items: center !important; gap: 12px !important;}
        #ppia22-grid-controls > .options-main-card > label, #ppilinfer-grid-controls > .options-main-card > label {flex-basis: 100%; text-align: center; font-size: 12.5px !important; font-weight: 800 !important;
                     color: #2c3e50 !important; text-transform: uppercase; letter-spacing: .5px; margin: 0 !important;}
        #ppia22-grid-controls > .options-main-card > div:has(> .btn), #ppilinfer-grid-controls > .options-main-card > div:has(> .btn) {flex-basis: 100%; display: flex !important; justify-content: center !important; gap: 0 !important;}
        #ppia22-grid-controls > .options-main-card > div > .btn, #ppilinfer-grid-controls > .options-main-card > div > .btn {width: 200px !important; height: 52px !important; margin: 0 !important; border: 1px solid #c3ccd5 !important;
                     background: #f1f4f7 !important; color: #1f2d3a !important; box-shadow: none !important; transform: none !important; border-radius: 0 !important; text-transform: none !important;}
        #ppia22-grid-controls > .options-main-card > div > .btn:first-child, #ppilinfer-grid-controls > .options-main-card > div > .btn:first-child {border-radius: 10px 0 0 10px !important;}
        #ppia22-grid-controls > .options-main-card > div > .btn:last-child, #ppilinfer-grid-controls > .options-main-card > div > .btn:last-child {border-radius: 0 10px 10px 0 !important; border-left: 0 !important;}
        #ppia22-grid-controls > .options-main-card > div > .btn.active, #ppilinfer-grid-controls > .options-main-card > div > .btn.active {background: #2c3e50 !important; color: #fff !important; border-color: #2c3e50 !important;}
        #ppia22-grid-controls > .options-main-card > div > .btn div:last-child, #ppilinfer-grid-controls > .options-main-card > div > .btn div:last-child {opacity: .75;}
        #ppia22-grid-controls > .options-main-card input, #ppia22-grid-controls > .options-main-card select, #ppilinfer-grid-controls > .options-main-card input,
        #ppilinfer-grid-controls > .options-main-card select {height: 38px !important; width: 260px !important; border: 1px solid #c8c8c8 !important; border-radius: 8px !important; font-size: 14px !important;
                     padding: 0 12px !important; box-shadow: none !important; margin: 0 !important;}
        #ppia22-grid-controls > .options-main-card input:focus, #ppia22-grid-controls > .options-main-card select:focus, #ppilinfer-grid-controls > .options-main-card input:focus,
        #ppilinfer-grid-controls > .options-main-card select:focus {border-color: #c0392b !important; box-shadow: 0 0 0 3px rgba(192,57,43,.12) !important;}
        #ppia22-grid-controls .options-black-btn, #ppilinfer-grid-controls .options-black-btn {height: 38px !important; width: auto !important; padding: 0 22px !important; border-radius: 8px !important; background: #c0392b !important;
                     border: 0 !important; color: #fff !important; font-size: 12.5px !important; font-weight: 800 !important; letter-spacing: .4px; box-shadow: 0 2px 6px rgba(192,57,43,.3) !important; transform: none !important;}
        #ppia22-grid-controls .options-black-btn:hover, #ppilinfer-grid-controls .options-black-btn:hover {background: #a93226 !important;}
        /* grelhas (botões 1A…2S / A…P): cada sentido num contentor com risca vermelha */
        #ppia22-grid-controls:has(.ppi-dir), #ppilinfer-grid-controls:has(.ppi-dir) {gap: 8px; align-items: stretch !important;}
        .ppi-dir {background: #fff; border: 1px solid #e3e7eb; border-left: 4px solid #c62828; border-radius: 12px; padding: 10px 14px 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05);
                  display: flex; flex-direction: column; align-items: center;}
        .ppi-dir > .major-row:not(:has(.btn)) {background: none !important; border: 0 !important; box-shadow: none !important; height: auto !important; text-shadow: none !important; color: #1f2d3a !important;
                  justify-content: center !important; margin: 0 !important; font-size: 13px !important; font-weight: 800 !important; letter-spacing: .6px !important;}
        .ppi-dir > .major-row:not(:has(.btn)) + .major-row:not(:has(.btn)) {margin-top: 1px !important; font-size: 11px !important; font-weight: 600 !important; color: #6c757d !important;}
        .ppi-dir > .major-row:has(.btn) {flex-wrap: wrap; gap: 5px !important; justify-content: center !important; margin: 10px 0 0 !important; width: 100%;}
        .ppi-dir .btn {width: 56px !important; height: 40px !important; margin: 0 !important; border-radius: 8px !important; border: 1px solid #c3ccd5 !important; background: #f1f4f7 !important;
                  color: #1f2d3a !important; font-size: 13px !important; font-weight: 800 !important; box-shadow: 0 1px 0 rgba(0,0,0,.06) !important; transform: none !important; padding: 0 !important;
                  transition: background .12s, border-color .12s;}
        .ppi-dir .btn:hover {background: #fff !important; border-color: #c0392b !important; color: #c0392b !important;}
        .ppi-dir .btn.options-yellow-btn {background: #ffe7a0 !important; border-color: #e0ad2b !important; color: #6b4500 !important;}
        .ppi-dir .btn.options-yellow-btn:hover {background: #ffdb73 !important; color: #6b4500 !important;}
        .ppi-dir .btn.active, .ppi-dir .btn.active:hover {background: #2c3e50 !important; border-color: #2c3e50 !important; color: #fff !important; box-shadow: 0 2px 6px rgba(44,62,80,.35) !important;}
        #ppia22-grid-controls:has(.options-yellow-btn)::after, #ppilinfer-grid-controls:has(.options-yellow-btn)::after {content: 'Amarelo = grelhas com meios do seu Corpo de Bombeiros'; font-size: 11px; color: #8a949e;
                  text-align: center;}
        /* Aeroporto: mesmas cores de alarme, botões arredondados e o escolhido em destaque */
        #ppiaero-grid-controls {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 12px 14px;}
        #ppiaero-grid-controls > div:first-child {background: none !important; border: 0 !important; box-shadow: none !important; text-shadow: none !important; color: #2c3e50 !important; font-size: 12.5px !important;
                     font-weight: 800 !important; height: auto !important; margin: 0 0 8px !important; width: auto !important;}
        #ppiaero-grid-controls .btn {width: 220px !important; height: 40px !important; margin: 0 !important; border-radius: 10px !important; border: 2px solid transparent !important; box-shadow: none !important;
                     transform: none !important; font-size: 12px !important; font-weight: 800 !important; text-transform: none; opacity: .9;}
        #ppiaero-grid-controls #A1 {background: #2e7d32 !important;} #ppiaero-grid-controls #A2 {background: #fdd835 !important;} #ppiaero-grid-controls #A3 {background: #fb8c00 !important;}
        #ppiaero-grid-controls #A4 {background: #e53935 !important;} #ppiaero-grid-controls #B1 {background: #212121 !important; color: #ff5252 !important;}
        #ppiaero-grid-controls .btn:hover {opacity: 1;}
        #ppiaero-grid-controls .btn.active {opacity: 1; border-color: #fff !important; box-shadow: 0 0 0 3px #2c3e50 !important;}
        #ppiaero-grid-controls:has(.btn.active) .btn:not(.active) {opacity: .45;}
        /* resultados: tabelas e títulos */
        #page-ppia22 .table-elements, #page-ppiaero .table-elements, #page-ppilinfer .table-elements {border-collapse: separate !important; border-spacing: 0 !important; background: #fff; border: 1px solid #dfe3e8 !important; border-radius: 10px; overflow: hidden; margin: 6px 0 10px !important;}
        #page-ppia22 .table-elements td, #page-ppiaero .table-elements td, #page-ppilinfer .table-elements td, #page-ppia22 .table-elements th, #page-ppiaero .table-elements th, #page-ppilinfer .table-elements th {border: 0 !important; border-bottom: 1px solid #e3e7eb !important; padding: 7px 10px !important; font-size: 12.5px;}
        #page-ppia22 .table-elements td + td, #page-ppiaero .table-elements td + td, #page-ppilinfer .table-elements td + td, #page-ppia22 .table-elements th + th, #page-ppiaero .table-elements th + th, #page-ppilinfer .table-elements th + th {border-left: 1px solid #e3e7eb !important;}
        #page-ppia22 .table-elements tr:last-child td, #page-ppiaero .table-elements tr:last-child td, #page-ppilinfer .table-elements tr:last-child td {border-bottom: 0 !important;}
        #page-ppia22 .table-elements th, #page-ppiaero .table-elements th, #page-ppilinfer .table-elements th {font-size: 12px !important; font-weight: 800 !important; letter-spacing: .3px;}
        #page-ppia22 .table-elements th button, #page-ppiaero .table-elements th button, #page-ppilinfer .table-elements th button, #page-ppia22 .table-elements td button, #page-ppiaero .table-elements td button, #page-ppilinfer .table-elements td button {border: 0; border-radius: 6px; background: rgba(255,255,255,.75); padding: 2px 8px; font-size: 14px; cursor: pointer;}
        #page-ppia22 h3, #page-ppiaero h3, #page-ppilinfer h3 {border-radius: 8px !important; padding: 7px 12px !important; font-size: 13px !important; letter-spacing: .3px; margin: 8px 0 0 !important;}
        #page-ppia22 .intervention-notice, #page-ppiaero .intervention-notice, #page-ppilinfer .intervention-notice, #page-ppia22 .cumulative-alert, #page-ppiaero .cumulative-alert, #page-ppilinfer .cumulative-alert {border-radius: 10px !important; margin: 0 0 8px !important; font-size: 13.5px !important; padding: 10px 14px !important;}
        #ppia22-specials-container > div:first-child, #ppilinfer-specials-container > div:first-child {border-radius: 10px 10px 0 0; margin: 0 !important;}
        #ppiaero-grid-header td {border-radius: 10px !important;}
        /* espaçamentos de 5px entre blocos do resultado */
        #page-ppia22 > .major-card > .major-card-body, #page-ppiaero > .major-card > .major-card-body, #page-ppilinfer > .major-card > .major-card-body {gap: 5px !important;}
        #page-ppia22 .table-elements, #page-ppiaero .table-elements, #page-ppilinfer .table-elements {margin: 0 !important;}
        #page-ppia22 h3, #page-ppiaero h3, #page-ppilinfer h3 {margin: 0 0 5px !important;}
        #page-ppia22 .table-elements + h3, #page-ppiaero .table-elements + h3, #page-ppilinfer .table-elements + h3 {margin-top: 5px !important;}
        #page-ppia22 .intervention-notice, #page-ppiaero .intervention-notice, #page-ppilinfer .intervention-notice, #page-ppia22 .cumulative-alert, #page-ppiaero .cumulative-alert, #page-ppilinfer .cumulative-alert {margin: 0 0 5px !important;}
        #page-ppia22 [id$="-abs-note"], #page-ppiaero [id$="-abs-note"], #page-ppilinfer [id$="-abs-note"] {margin-top: 0 !important;}
        #page-ppia22 .ppi-final-table, #page-ppiaero .ppi-final-table, #page-ppilinfer .ppi-final-table {margin-top: 5px !important;}
        #ppiaero-grid-container > * + *, #ppiaero-grid-info-container > * + * {margin-top: 5px !important;}
        #page-ppia22 .table-elements + .table-elements, #page-ppiaero .table-elements + .table-elements, #page-ppilinfer .table-elements + .table-elements {margin-top: 5px !important;}
        /* linha que faltava entre o Sentido e o 1.º nó do troço */
        /* tabela da grelha: a 2.ª linha começa a meio (células com rowspan), por isso a 1.ª célula dela também leva a linha da esquerda */
        #page-ppia22 .table-elements td.ppi-span-last, #page-ppiaero .table-elements td.ppi-span-last, #page-ppilinfer .table-elements td.ppi-span-last {border-bottom: 0 !important;}
        #ppia22-grid-references table tr:nth-of-type(2) > td:first-child, #ppilinfer-grid-references table tr:nth-of-type(2) > td:first-child {border-left: 1px solid #e3e7eb !important;}
        /* Situações especiais: um só cartão (título, texto e tabela juntos, só os cantos de fora arredondados) */
        #ppia22-specials-container > div:first-child, #ppilinfer-specials-container > div:first-child {border: 1px solid #f0d97a !important; border-radius: 10px 10px 0 0 !important;}
        #ppia22-specials-container .table-elements, #ppilinfer-specials-container .table-elements {border-radius: 0 0 10px 10px !important; border-top: 0 !important; margin: 0 !important;}
        #ppia22-specials-container .ppia22-part1, #ppilinfer-specials-container [class$="-part1"] {border-bottom: 1px solid #e3e7eb !important;}
        #ppia22-specials-container .ppia22-data > :last-child, #ppilinfer-specials-container [class$="-data"] > :last-child {border-radius: 0 0 10px 10px !important;}
        /* sem tabela na 2.ª parte: o texto fecha o cartão (arredondado e sem a linha dupla) */
        #ppia22-specials-container .ppia22-data > table:not(:has(td)) {display: none !important;}
        #ppia22-specials-container .ppia22-data:not(:has(td)) .ppia22-part1, #ppia22-specials-container .ppia22-part1:last-child {border-radius: 0 0 10px 10px !important;}
        /* Linha Férrea: itens das Situações Especiais com as mesmas linhas da A22 */
        #ppilinfer-specials-container .ppilinfer-data > div {border: 1px solid #e3e7eb !important; border-top: 0 !important; background: #fff; padding: 8px 12px !important; margin: 0 !important;}
        #ppilinfer-specials-container .ppilinfer-data > div:last-child {border-radius: 0 0 10px 10px !important;}
        #ppilinfer-specials-container .ppilinfer-data:not(:has(div)) {border: 1px solid #e3e7eb; border-top: 0; border-radius: 0 0 10px 10px; background: #fff; padding: 8px 12px;}
        #ppia22-specials-container .ppia22-data:not(:has(div, table)) {border: 1px solid #e3e7eb; border-top: 0; border-radius: 0 0 10px 10px; background: #fff; padding: 8px 12px;}

        /* ===== Planeamento Diário (layout novo) ===== */
        #page-plandir > .major-card > .major-card-body {background: #f4f5f7; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px;}
        #page-plandir .plandir-shift-header {background: #fff !important; border: 1px solid #e9ecef !important; border-radius: 12px !important; box-shadow: none !important; margin: 0 !important; padding: 10px 16px !important;
                                             display: flex; align-items: baseline; justify-content: space-between; gap: 12px;}
        #page-plandir .plandir-shift-header .plandir-header-title {font-size: 14px !important; margin: 0 !important; text-transform: uppercase; letter-spacing: .4px; color: #2c3e50 !important;}
        #page-plandir .plandir-shift-header .plandir-header-date {font-size: 13px !important; font-weight: 700; color: #2c3e50 !important;}
        .plandir-kpis {display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;}
        .plandir-kpi {background: #fff; border: 1px solid #e9ecef; border-left: 4px solid var(--c); border-radius: 10px; padding: 8px 14px; display: flex; gap: 12px; align-items: center;}
        .plandir-kpi i {width: 34px; height: 34px; border-radius: 50%; background: color-mix(in srgb, var(--c) 14%, white); display: flex; align-items: center; justify-content: center; font-style: normal; font-size: 15px;}
        .plandir-kpi b {display: block; font-size: 20px; line-height: 1.1; color: #2c3e50;}
        .plandir-kpi small {font-size: 10.5px; color: #6c757d; text-transform: uppercase; font-weight: 700; letter-spacing: .3px;}
        #page-plandir #plandir-layout-wrapper {gap: 8px !important; margin: 0 !important;}
        #page-plandir #plandir-left-col {flex: 1; max-height: max(320px, calc(100vh - 400px)); overflow-y: auto; padding-right: 6px; scrollbar-width: thin; scrollbar-color: #e57373 #fbe9e7;}
        #page-plandir #plandir-left-col::-webkit-scrollbar {width: 6px;}
        #page-plandir #plandir-left-col::-webkit-scrollbar-track {background: #fbe9e7; border-radius: 999px;}
        #page-plandir #plandir-left-col::-webkit-scrollbar-thumb {background: #e57373; border-radius: 999px;}
        #page-plandir #plandir-left-col::-webkit-scrollbar-thumb:hover {background: #c62828;}
        #page-plandir #plandir-left-col #plandir-card-container {justify-content: stretch !important;}
        #page-plandir .plandir-main-card {max-width: none !important; width: 100% !important; margin: 0 0 8px 0 !important; background: #fff; border: 1px solid #e9ecef !important; border-left: 3px solid #c62828 !important;
                                          border-radius: 10px !important; box-shadow: none !important;}
        #page-plandir .plandir-card-title {background: linear-gradient(90deg, #fdecea, #fff6f5) !important; color: #b71c1c !important; font-weight: 800 !important; justify-content: flex-start !important; text-align: left !important; font-size: 12px !important; letter-spacing: .5px !important;
                                           text-shadow: none !important; border: 0 !important; border-bottom: 1px solid #f5c6c2 !important; padding: 9px 40px 9px 12px !important; position: relative;}
        #page-plandir .plandir-status-dot {width: 12px !important; height: 12px !important; border-radius: 50% !important; top: 50%; transform: translateY(-50%); box-shadow: none !important;}
        #page-plandir .plandir-table th, #page-plandir .plandir-side-table th, #page-plandir .plandir-table .special th {background: #f1f3f5 !important; color: #5b6670 !important; border: 0 !important;
                     border-bottom: 1px solid #e3e7eb !important; font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase; letter-spacing: .4px; padding: 6px 8px !important;}
        #page-plandir .plandir-table td, #page-plandir .plandir-side-table td {border: 0 !important; border-bottom: 1px solid #dfe3e8 !important; background: #fff !important;}
        #page-plandir .plandir-table td + td, #page-plandir .plandir-side-table td + td {border-left: 1px solid #dfe3e8 !important;}
        #page-plandir .plandir-table th {border-left: 1px solid #dfe3e8 !important; border-bottom: 1px solid #d5dbe1 !important;}
        #page-plandir .plandir-table thead tr:first-child th:first-child {border-left: 0 !important;}
        #page-plandir .plandir-table tbody tr:nth-child(even) td, #page-plandir .plandir-side-table tbody tr:nth-child(even) td {background: #fafbfc !important;}
        #page-plandir .plandir-table tbody tr:hover td, #page-plandir .plandir-side-table tbody tr:hover td {background: #fdf6f5 !important;}
        #page-plandir .plandir-table input:focus {background: #fff5f4 !important; color: #2c3e50 !important;}
        #page-plandir .plandir-table td.plandir-mp-active {background: #e8f5e9 !important;} #page-plandir .plandir-table td.plandir-tas-active {background: #fff8e1 !important;}
        #page-plandir .plandir-side-table {border: 0 !important;}
        /* células bloqueadas (preenchidas a partir do n.º interno): cinzento, para se ver que não se editam */
        #page-plandir .plandir-table td:has(> input[readonly]), #page-plandir .plandir-table tbody tr:hover td:has(> input[readonly]),
        #page-plandir .plandir-table tbody tr:nth-child(even) td:has(> input[readonly]), #page-plandir .plandir-table td.mp-cell, #page-plandir .plandir-table td.tas-cell,
        #page-plandir .plandir-table tbody tr:hover td.mp-cell, #page-plandir .plandir-table tbody tr:hover td.tas-cell,
        #page-plandir .plandir-table tbody tr:nth-child(even) td.mp-cell, #page-plandir .plandir-table tbody tr:nth-child(even) td.tas-cell {background: #eceff1 !important; cursor: not-allowed;}
        #page-plandir .plandir-table input[readonly] {color: #455a64 !important; cursor: not-allowed; background: transparent !important;}
        #page-plandir .plandir-table td.mp-cell.plandir-mp-active {background: #dcefdc !important;} #page-plandir .plandir-table td.tas-cell.plandir-tas-active {background: #fff3cd !important;}
        /* forma nova em todos os botões .btn do SALOC (cores de origem mantidas) */
        :is(#page-saloc,#page-ppis,#page-ppiaero,#page-ppia22,#page-ppilinfer,#page-ineminop,#page-recserv,#page-recservdescr,#page-recinoreports,#page-inocrepc,#page-crepcalg,#page-plandir,#page-dashboard,#page-docimport,#page-phonebook,#page-contact-list,#page-material-request,#page-fleet-cards,#page-hemodialysis,#page-alarm-console,#page-attendance-list) .btn {border-radius: 8px !important; border-bottom: 0 !important; transform: none !important; box-shadow: 0 1px 3px rgba(0,0,0,.15) !important;}
        :is(#page-saloc,#page-ppis,#page-ppiaero,#page-ppia22,#page-ppilinfer,#page-ineminop,#page-recserv,#page-recservdescr,#page-recinoreports,#page-inocrepc,#page-crepcalg,#page-plandir,#page-dashboard,#page-docimport,#page-phonebook,#page-contact-list,#page-material-request,#page-fleet-cards,#page-hemodialysis,#page-alarm-console,#page-attendance-list) .btn:hover {filter: brightness(1.08); transform: none !important;}
        .btn:has(> i.fa-solid) {gap: 6px;}
        /* botões Guardar rascunho / Emitir: barra fixa no fundo da coluna */
        #page-plandir #plandir_container > div:has(#emit-pp) {position: sticky; bottom: 0; z-index: 2; justify-content: center !important; margin: 0 !important; padding: 8px 0 2px; background: #f4f5f7;}   /* sem caixa: o fundo é o do cartão */
        #page-plandir #draft-pp, #page-plandir #emit-pp {height: 34px; padding: 0 18px !important; border-radius: 8px !important; font-size: 12px !important; font-weight: 700 !important; letter-spacing: .3px !important;
                     display: inline-flex; align-items: center; gap: 6px; transition: background .15s, box-shadow .15s;}
        #page-plandir #draft-pp {background: #3354a1 !important; color: #fff !important; border: 0 !important;}   /* cor de origem (btn-add) */
        #page-plandir #draft-pp:hover {filter: brightness(1.08);}
        #page-plandir #emit-pp {background: #c0392b !important; color: #fff !important; box-shadow: 0 2px 6px rgba(192,57,43,.3);}
        #page-plandir #emit-pp:hover {background: #a93226 !important;}
        #page-plandir #plandir-right-col {width: 360px !important;}
        #page-plandir #plandir-right-col .plandir-main-card {width: 100% !important;}
        #page-plandir .plandir-card-title.red-variant {color: #c62828 !important;}

        /* ===== CREPC Algarve (MOA) e Situação Operacional (layout novo) ===== */
        #page-crepcalg > .major-card > .major-card-body, #page-inocrepc > .major-card > .major-card-body {background: #efefef; padding: 12px 16px;}
        /* botões de opção: dentro de um contentor branco, ao centro */
        #page-crepcalg .sl-85, #page-inocrepc .sl-85, #page-plandir .sl-85, #page-hemodialysis .sl-85 {justify-content: center !important; margin: 0 !important;}
        #page-crepcalg .options-main-card.sl-86, #page-inocrepc .options-main-card.sl-86, #page-plandir .options-main-card.sl-86, #page-hemodialysis .options-main-card.sl-86 {display: inline-flex !important; flex-direction: row !important; align-items: center; gap: 10px; background: #fff !important; border: 1px solid #e3e7eb !important;
                     border-radius: 999px !important; padding: 4px 4px 4px 16px !important; margin: 0 !important; box-shadow: 0 1px 4px rgba(0,0,0,.06) !important; width: auto !important;}
        #page-crepcalg .options-main-card.sl-86 > label, #page-inocrepc .options-main-card.sl-86 > label, #page-plandir .options-main-card.sl-86 > label, #page-hemodialysis .options-main-card.sl-86 > label {margin: 0 !important; font-size: 11px !important; font-weight: 800 !important; color: #8a949e !important; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap;}
        #page-crepcalg .options-main-card.sl-86 .action-buttons, #page-inocrepc .options-main-card.sl-86 .action-buttons, #page-plandir .options-main-card.sl-86 .action-buttons, #page-hemodialysis .options-main-card.sl-86 .action-buttons {gap: 4px !important; margin: 0 !important; justify-content: center !important; display: flex !important;}
        #page-crepcalg .options-main-card.sl-86 .options-btn, #page-inocrepc .options-main-card.sl-86 .options-btn, #page-plandir .options-main-card.sl-86 .options-btn, #page-hemodialysis .options-main-card.sl-86 .options-btn {height: 30px !important; padding: 0 18px !important; border-radius: 999px !important; border: 0 !important; background: transparent !important; color: #2c3e50 !important;
                     font-size: 12px !important; font-weight: 700 !important; text-transform: none; letter-spacing: 0; box-shadow: none !important; transform: none !important; min-width: 0; width: auto;}
        #page-crepcalg .options-main-card.sl-86 .options-btn:hover, #page-inocrepc .options-main-card.sl-86 .options-btn:hover, #page-plandir .options-main-card.sl-86 .options-btn:hover, #page-hemodialysis .options-main-card.sl-86 .options-btn:hover {background: #f1f3f5 !important;}
        #page-crepcalg .options-main-card.sl-86 .options-btn.active, #page-inocrepc .options-main-card.sl-86 .options-btn.active, #page-plandir .options-main-card.sl-86 .options-btn.active, #page-hemodialysis .options-main-card.sl-86 .options-btn.active {background: #2c3e50 !important; color: #fff !important;}
        #page-plandir .options-main-card.sl-86 .options-btn[data-shift="LAST"]:not(.active) {color: #ef6c00 !important;}
        /* MOA e G2: mesmo espaçamento das Inoperacionalidades */
        #page-crepcalg #moa-container, #page-crepcalg #g2-container {margin-top: 12px !important;}
        /* ao trocar entre MOA's / G1 / G2, o que está a sair esconde-se logo (não fica por baixo durante o fade) */
        #page-crepcalg #moa-container[style*="opacity: 0"], #page-crepcalg #g2-container[style*="opacity: 0"] {display: none !important;}
        /* ===== Anexo G2 (só estilo: tabelas, ids e funções iguais) ===== */
        #g2-container > .major-card, #g2_form_container > .major-card {background: transparent !important; border: 0 !important; box-shadow: none !important; margin: 0 !important; width: 100% !important;}
        #g2-container > .major-card > .major-card-body, #g2_form_container > .major-card > .major-card-body {background: transparent !important; padding: 0 !important; display: flex; flex-direction: column; gap: 8px;}
        #g2-container > .major-card > .major-card-header, #g2_form_container > .major-card > .major-card-header {background: none !important; color: #2c3e50 !important; font-size: 12px !important; font-weight: 800 !important; box-shadow: none !important; border-radius: 0 !important;
                     padding: 0 0 8px 2px !important; letter-spacing: .4px; text-shadow: none !important; border: 0 !important; justify-content: center;}
        #g2_form_container > .major-card > .major-card-header {justify-content: flex-start;}
        #g2-container > .major-card > .major-card-header::before, #g2-container > .major-card > .major-card-header::after {display: none !important;}
        #g2-container #g2TableContainer, #g2-container #g2_form_container {margin-top: 4px !important;}
        #g2TableContainer > h3 {display: none;}
        #g2-container .table-container:not(.g2-list), #g2_form_container .major-row.sl-123 {background: #fff !important; border: 1px solid #e9ecef !important; border-radius: 12px !important; box-shadow: 0 1px 3px rgba(0,0,0,.05) !important;
                     padding: 10px 14px 12px !important; margin: 0 !important; overflow-x: auto; height: auto !important; max-height: none !important;}
        #g2_form_container .major-row.sl-123 .major-field {display: flex; flex-direction: column; align-items: flex-start; gap: 4px;}
        #g2-container table {width: 100% !important; border-collapse: collapse !important; border: 0 !important; margin: 0 !important;}
        #g2-container th {background: #f1f3f5 !important; color: #5b6670 !important; border: 0 !important; border-bottom: 1px solid #e3e7eb !important; padding: 8px 10px !important; font-size: 11px !important;
                     font-weight: 800 !important; text-transform: uppercase; letter-spacing: .4px; text-align: left !important;}
        #g2-container th[colspan] {background: #fff !important; color: #2c3e50 !important; font-size: 12.5px !important; padding: 2px 0 10px !important; border: 0 !important; position: relative;}
        #g2-container th[colspan]::before {content: ''; display: inline-block; width: 6px; height: 16px; border-radius: 3px; background: #c62828; margin-right: 8px; vertical-align: -3px;}
        #g2-container td {border: 0 !important; border-bottom: 1px solid #eef0f2 !important; padding: 6px 8px !important; background: #fff !important; font-size: 12.5px; text-align: left !important; vertical-align: middle !important;}
        /* tabelas do formulário: mesmo aspeto das outras (contorno arredondado, sem linhas verticais) */
        #g2_form_container .table-container table {border-collapse: separate !important; border-spacing: 0 !important;}
        #g2-container thead, #g2-container thead th {position: static !important; z-index: auto !important; top: auto !important;}   /* não passa por cima do rodapé */
        #g2-container thead th[colspan] {position: relative !important;}
        #g2_form_container #g2_gdh_activation_date {width: 150px !important;} #g2_form_container #g2_gdh_activation_hour {width: 110px !important;}
        #g2_form_container .table-container thead tr:nth-child(2) th {border-top: 1px solid #e3e7eb !important;}
        #g2_form_container .table-container thead tr:nth-child(2) th:first-child {border-left: 1px solid #e3e7eb !important; border-top-left-radius: 10px;}
        #g2_form_container .table-container thead tr:nth-child(2) th:last-child {border-right: 1px solid #e3e7eb !important; border-top-right-radius: 10px;}
        #g2_form_container .table-container tbody td:first-child {border-left: 1px solid #e3e7eb !important;}
        #g2_form_container .table-container tbody td:last-child {border-right: 1px solid #e3e7eb !important;}
        #g2_form_container .table-container tbody tr:last-child td {border-bottom: 1px solid #e3e7eb !important;}
        #g2_form_container .table-container tbody tr:last-child td:first-child {border-bottom-left-radius: 10px;}
        #g2_form_container .table-container tbody tr:last-child td:last-child {border-bottom-right-radius: 10px;}
        #g2_form_container .table-container tbody td:first-child {color: #8a949e; font-weight: 700; text-align: center !important;}
        #g2_form_container .table-container tbody tr:hover td {background: #fdf6f5 !important;}
        #g2TableContainer tbody tr:last-child td {border-bottom: 0 !important;}
        #g2-container td input, #g2-container td select, #g2_form_container .major-row input {height: 30px !important; border: 1px solid #c8c8c8 !important; border-radius: 6px !important; font-size: 12.5px !important;
                     padding: 0 8px !important; box-sizing: border-box; background-color: #fff; outline: none;}
        #g2-container td input:focus, #g2-container td select:focus, #g2_form_container .major-row input:focus {border-color: #c0392b !important; box-shadow: 0 0 0 2px rgba(192,57,43,.12) !important;}
        #g2-container td input[readonly], #g2_form_container input[readonly] {background-color: #eceff1 !important; color: #455a64; cursor: not-allowed;}
        #g2-container .sl-140 {gap: 6px;}
        #g2-container #addG2LeaderBtn, #g2-container #addG2CrewBtn {position: absolute !important; right: 0 !important; top: 0 !important; left: auto !important; width: auto !important; min-width: 0 !important; height: 28px !important; line-height: 1 !important; margin: 0 !important; padding: 0 12px 0 10px !important; border-radius: 999px !important; border: 1px solid #f0b8b3 !important; background: #fff !important; white-space: nowrap; transform: none !important;
                     color: #c62828; font-size: 15px; font-weight: 800; display: inline-flex !important; align-items: center; gap: 4px; cursor: pointer; letter-spacing: 0; text-transform: none;}
        #g2-container #addG2LeaderBtn::after, #g2-container #addG2CrewBtn::after {content: 'Adicionar linha'; font-size: 11.5px; font-weight: 700;}
        #g2-container #addG2LeaderBtn:hover, #g2-container #addG2CrewBtn:hover {background: #c62828 !important; color: #fff !important; border-color: #c62828 !important;}
        /* lista "Missões em curso": igual às outras tabelas (texto à esquerda, sem linhas verticais, botões ao meio) */
        #g2TableContainer .g2-list {border: 1px solid #e3e7eb !important; border-radius: 10px !important; padding: 0 !important; overflow: hidden;}
        #g2TableContainer .g2-list th + th, #g2TableContainer .g2-list td + td {border-left: 0 !important;}
        #g2TableContainer .g2-list td {text-align: left !important; vertical-align: middle !important; padding: 8px 12px !important;}
        #g2TableContainer .g2-list th {padding: 9px 12px !important;}
        #g2TableContainer .g2-list td:last-child {text-align: right !important; white-space: nowrap;}
        #g2TableContainer .g2-list th:last-child {text-align: right !important;}
        #g2TableContainer .g2-list td:last-child .btn {margin: 0 0 0 6px !important; vertical-align: middle; display: inline-flex; align-items: center;}
        #g2TableContainer .g2-list td:first-child {font-weight: 700;}
        #g2-container #g2VehicleTable thead tr:nth-child(2) th {cursor: pointer;}
        #g2-container #g2VehicleTable thead tr:nth-child(2) th:nth-child(n+4)::after {content: ' ⟳'; color: #c62828; font-weight: 800;}
        #g2-container #g2InterventionTable td {text-align: left !important;}
        #g2_form_container .major-row.sl-123 label {font-size: 11px !important; font-weight: 800 !important; color: #6c757d !important; text-transform: uppercase; letter-spacing: .3px;}
        #g2_form_container .sl-158 {margin: 0 2px; font-size: 11px; color: #8a949e;}
        #g2_form_container .sl-159 {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 10px 14px; margin: 0 !important;}
        #g2_form_container .sl-160 {align-items: center; gap: 8px;}
        #g2_form_container .sl-160 label {font-size: 11px !important; font-weight: 800 !important; color: #6c757d !important; text-transform: uppercase; margin: 0 6px 0 0 !important;}
        #g2_form_container > .major-card > .major-card-footer {background: #ddd !important; border-radius: 10px; padding: 10px 14px !important; margin-top: 8px; justify-content: flex-end !important; box-shadow: none !important;}
        #g2_form_container > .major-card > .major-card-footer::before, #g2_form_container > .major-card > .major-card-footer::after {display: none !important;}
        #g2SaveBtn {height: 34px; width: auto !important; padding: 0 20px !important; font-size: 12px !important; font-weight: 700;}
        #g2Table .g2-edit-btn, #g2Table .g2-finalize-btn {height: 28px !important; padding: 0 12px !important; font-size: 11.5px; font-weight: 700; border-radius: 6px;}
        .slx-lay {display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 8px; align-items: start;}
        .slx-main {display: flex; flex-direction: column; gap: 8px; min-width: 0;}
        .slx-sum {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 14px 16px; position: sticky; top: 8px;}
        .slx-sum-k {font-size: 11.5px; font-weight: 800; color: #c62828; text-transform: uppercase; letter-spacing: .4px;}
        .slx-prev {margin: 10px 0 0; padding: 10px 12px; border: 1px dashed #cfd6dd; border-radius: 8px; background: #f8f9fa; font: 12px/1.6 ui-monospace, Consolas, monospace; color: #2c3e50; white-space: pre-wrap; word-break: break-word; min-height: 60px;}
        .slx-sum-p {font-size: 11px; color: #8a949e; margin: 8px 0 0;}
        .slx-foot {display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; padding: 10px 14px; background: #ddd; border-radius: 10px;}
        .slx-foot .btn {height: 34px; width: auto !important; padding: 0 20px !important; font-size: 12px !important; font-weight: 700;}
        .slx-sub {background: transparent !important; color: #2c3e50 !important; font-size: 12px !important; font-weight: 800 !important; padding: 0 0 8px 2px !important; letter-spacing: .4px; text-shadow: none !important; border: 0 !important;}
        /* título do formulário (Inserção / Comunicar operacionalidade / G2): risca vermelha + linha fina até ao fim */
        .slx-sub, #g2_form_container > .major-card > .major-card-header {display: flex !important; align-items: center; gap: 10px; background: none !important; box-shadow: none !important; border: 0 !important;
                     border-radius: 0 !important; overflow: visible !important; color: #2c3e50 !important; font-size: 13px !important; font-weight: 800 !important; letter-spacing: .6px !important;
                     text-transform: uppercase; text-shadow: none !important; padding: 4px 2px 10px !important; margin: 0 !important; justify-content: flex-start !important;}
        .slx-sub::before, #g2_form_container > .major-card > .major-card-header::before {content: '' !important; display: block !important; position: static !important; flex: none; width: 4px !important;
                     height: 18px !important; border-radius: 3px !important; background: #c62828 !important; box-shadow: none !important;}
        .slx-sub::after, #g2_form_container > .major-card > .major-card-header::after {content: '' !important; display: block !important; position: static !important; flex: 1; height: 1px !important;
                     width: auto !important; background: linear-gradient(90deg, #d5dbe1, rgba(213,219,225,0)) !important; border-radius: 0 !important;}
        .slx-cnt {font-size: 11.5px; color: #8a949e; font-weight: 600;}
        .slx-scroll {max-height: max(300px, calc(100vh - 470px)); overflow-y: auto; padding-right: 4px;}
        #inopsTableContainer .slx-scroll {max-height: max(300px, calc(100vh - 330px));}
        .slx-moa-ctx {grid-template-columns: 1.5fr 1fr 1fr 1.25fr 1.25fr 1fr;}
        .slx-dt {display: flex; gap: 6px;} .slx-dt input[type="date"] {flex: 1.4;} .slx-dt input[type="time"] {flex: 1;}
        .slx-meds {display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start;}
        .slx-m {border: 1px solid #eef0f2; border-radius: 10px; padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; min-width: 0;}
        .slx-m.slx-wide {grid-column: 1 / -1;}
        .slx-m:has(.slx-swi:checked) {border-color: #f0c9c5; background: #fffafa; border-left: 3px solid #c62828;}
        .slx-m:not(:has(.slx-swi:checked)) .slx-mf {display: none;}
        .slx-mh {display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #2c3e50; cursor: pointer; margin: 0; text-transform: none !important; letter-spacing: 0 !important;}
        .slx-mh small {margin-left: auto; color: #8a949e; font-weight: 500; font-size: 11.5px;}
        .slx-m:has(.slx-swi:checked) .slx-mh small {display: none;}
        .slx-swi {position: absolute; opacity: 0; pointer-events: none;}
        .slx-sw {width: 36px; height: 20px; border-radius: 999px; background: #ced4da; position: relative; flex: none; transition: background .15s;}
        .slx-sw::before {content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #fff; top: 2px; left: 2px; box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: left .15s;}
        .slx-swi:checked + .slx-sw {background: #c62828;} .slx-swi:checked + .slx-sw::before {left: 18px;}
        .slx-swi:focus-visible + .slx-sw {outline: 2px solid #c62828; outline-offset: 2px;}
        .slx-mf {display: grid; grid-template-columns: 1fr 1fr 1.6fr; gap: 8px;}
        .slx-mf4 {grid-template-columns: 1.2fr 1fr .8fr 1.6fr;}
        .slx-in-veh {grid-template-columns: 2fr 1fr 1fr;}
        .slx-in-av {grid-template-columns: 1fr .7fr 1.2fr 2.2fr 1fr;}
        .slx-two2 {display: grid; grid-template-columns: 1.6fr 1fr; gap: 8px;}
        .slx-in-sub {grid-template-columns: auto 1fr; align-items: end;}
        .slx-ppi {display: flex; gap: 10px; align-items: center; flex-wrap: wrap;}
        .slx-seg {display: inline-flex; border: 1px solid #d5dbe1; border-radius: 8px; overflow: hidden; flex: none;}
        .slx-seg label {padding: 0 16px; height: 32px; display: flex; align-items: center; font-size: 12.5px; font-weight: 700; background: #fff; cursor: pointer; margin: 0; text-transform: none !important; color: #2c3e50 !important; letter-spacing: 0 !important;}
        .slx-seg label + label {border-left: 1px solid #d5dbe1;}
        .slx-seg label:has(input:checked) {background: #c62828; color: #fff !important;}
        .slx-seg input, .slx-chip2 input {position: absolute; opacity: 0; pointer-events: none;}
        .slx-chip2 {display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 999px; border: 1px solid #d5dbe1; background: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer; margin: 0; color: #2c3e50;}
        .slx-chip2:has(input:checked) {background: #fdecea; border-color: #f0b8b3; color: #b71c1c;}
        .slx-chip2:has(input:checked)::before {content: '✓';}
        .slx-ppi:has(#ppi_no:checked) .slx-chip2 {opacity: .45;}
        .slx-st {display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700; white-space: nowrap;}
        .slx-st-warn {background: #fff3e0; color: #ef6c00;} .slx-st-bad {background: #fdecea; color: #c62828;} .slx-st-type {background: #eceff1; color: #37474f;}
        #inopsTableContainer .validate-btn {height: 28px !important; padding: 0 12px !important; font-size: 11.5px; font-weight: 700; border-radius: 6px;}
        #moa-container .slx-box, #sitop_container .slx-box, #inopsTableContainer .slx-box {padding: 10px 14px 12px;}

        /* ===== layout novo (caixas numeradas), formulários do SALOC ===== */
        .slx > .major-card-body {background: #efefef; display: flex; flex-direction: column; gap: 10px; padding: 12px 16px;}
        .slx-recserv {min-height: 651px;} .slx-ineminop {min-height: 636px;}   /* mesmo tamanho do layout antigo */
        .slx-recserv > .major-card-body, .slx-ineminop > .major-card-body {flex: 1;}
        .slx-recserv, .slx-ineminop {display: flex; flex-direction: column;}
        #page-recserv .slx-tbl.sl-34 {height: 257px;} #page-ineminop .slx-tbl.sl-43 {height: 264px;}   /* caixas novas: tabela mais baixa para a página ficar com a altura de antes */
        .slx .slx-tbl tbody td:last-child {white-space: nowrap;}
        .slx-box {background: #fff; border: 1px solid #e9ecef; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); padding: 10px 14px 12px; min-width: 0;}
        .slx-bh {display: flex; align-items: center; gap: 9px; font-size: 12.5px; font-weight: 700; color: #2c3e50; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .4px; min-height: 30px;}
        .slx-n {width: 22px; height: 22px; border-radius: 50%; background: #c62828; color: #fff; font-size: 11.5px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;}
        .slx-tools {margin-left: auto; display: flex; align-items: center; gap: 8px; text-transform: none; letter-spacing: 0; font-weight: 600; flex-wrap: wrap; justify-content: flex-end;}
        .slx-tools label {font-size: 11px; font-weight: 700; color: #6c757d; text-transform: uppercase; margin: 0;}
        .slx-grid {display: grid; gap: 10px;}
        .slx-g1 {grid-template-columns: 1fr;} .slx-g2 {grid-template-columns: 1fr 1fr;} .slx-g3 {grid-template-columns: repeat(3, minmax(0, 1fr));}
        .slx-g4 {grid-template-columns: repeat(4, minmax(0, 1fr));} .slx-g6 {grid-template-columns: repeat(6, minmax(0, 1fr));}
        .slx-s2 {grid-column: span 2;} .slx-s3 {grid-column: span 3;} .slx-s4 {grid-column: span 4;} .slx-s6 {grid-column: 1 / -1;}
        .slx-f {display: flex; flex-direction: column; gap: 4px; min-width: 0;}
        .slx-f > label {font-size: 11px; font-weight: 700; color: #6c757d; text-transform: uppercase; letter-spacing: .3px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
        .slx .slx-in {width: 100% !important; height: 32px !important; border: 1px solid #c8c8c8 !important; border-radius: 6px !important; padding: 0 9px !important; font-size: 12.5px !important; background: #fff;
                      color: #333; box-sizing: border-box; outline: none; transition: border-color .15s, box-shadow .15s; max-width: none !important; min-width: 0 !important;}
        .slx .slx-in:focus {border-color: #c0392b !important; box-shadow: 0 0 0 2px rgba(192,57,43,.12);}
        .slx .slx-year {width: 90px !important;}
        .slx .slx-search {width: 260px !important; border-radius: 999px !important;}
        .slx-act {display: flex; justify-content: flex-end; align-items: flex-end; gap: 8px;}
        .slx-act .btn {height: 32px;}
        .slx-two {display: grid; grid-template-columns: 1fr 1.4fr .6fr; gap: 10px;}
        .slx-cc {display: flex; align-items: center; gap: 6px;} .slx-cc span {color: #8a949e;}
        .slx-cc input:last-child {width: 70px !important; flex: none;}
        .slx-fav {display: flex !important; align-items: center; gap: 8px; height: 32px; font-size: 12.5px !important; font-weight: 600 !important; color: #2c3e50 !important; text-transform: none !important; cursor: pointer;}
        .slx-fav input {width: 16px; height: 16px; accent-color: #c0392b;}
        .slx-chips {display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;}
        .slx-chip {--c: #2c3e50; display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 11px; border-radius: 999px; font-size: 11.5px; font-weight: 700;
                   background: color-mix(in srgb, var(--c) 10%, white); color: var(--c); border: 1px solid color-mix(in srgb, var(--c) 25%, white); white-space: nowrap;}
        .slx-chip b {font-size: 12.5px;}
        .slx-chip.slx-dark {background: #2c3e50; color: #fff; border-color: #2c3e50;}
        .slx-chip.slx-ok {--c: #2e7d32;} .slx-chip.slx-bad {--c: #c62828;}
        /* tabelas */
        .slx .slx-tbl {border: 1px solid #e3e7eb !important; border-radius: 10px; overflow: auto; background: #fff; box-shadow: none !important; margin: 0 !important; padding: 0 !important;}
        .slx .slx-tbl table {width: 100%; border-collapse: collapse; margin: 0; border: 0;}
        .slx .slx-tbl thead {position: sticky; top: 0; z-index: 1;}
        .slx .slx-tbl thead th {background: #f1f3f5 !important; color: #5b6670 !important; border: 0 !important; border-bottom: 1px solid #e3e7eb !important; padding: 9px 10px !important;
                                font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase; letter-spacing: .4px; text-align: left !important;}
        .slx .slx-tbl tbody td {border: 0 !important; border-bottom: 1px solid #eef0f2 !important; padding: 7px 10px !important; font-size: 12.5px !important; text-align: left !important; color: #2c3e50; background: #fff;}
        .slx .slx-tbl tbody tr:hover td {background: #fdf6f5 !important;}
        .slx .slx-tbl tbody td[colspan] {text-align: center !important; color: #8a949e;}
        .slx .slx-tbl tbody tr.quadro-header-row td, .slx .slx-tbl tbody tr.quadro-header-row:hover td {background: #fdf3f2 !important; color: #a70c0c !important; font-weight: 800 !important; text-align: left !important;
                                                                                                           border-left: 3px solid #c62828 !important; font-size: 11.5px !important; letter-spacing: .4px;}
        .slx .slx-tbl tbody button {border-radius: 6px !important; padding: 3px 9px !important; border: 1px solid transparent !important; font-size: 12px !important; cursor: pointer;}
        .slx .slx-tbl tbody button[onclick*="Edit"], .slx .slx-tbl tbody button[onclick*="edit"] {background: #f1f3f5 !important; border-color: #d5dbe1 !important; color: #2c3e50 !important;}
        .slx .slx-tbl tbody button[onclick*="Delete"], .slx .slx-tbl tbody button[onclick*="delete"], .slx .slx-tbl tbody .btn-delete {background: #fff !important; border-color: #f0b8b3 !important; color: #c62828 !important;}
        .slx .slx-tbl tbody button:hover {filter: brightness(.95);}
        .slx .slx-tbl tbody input[type="checkbox"], .slx .slx-tbl tbody input[type="radio"] {accent-color: #c0392b;}
        .slx .slx-tbl tbody input[type="text"] {height: 28px; border: 1px solid #c8c8c8; border-radius: 6px; padding: 0 8px; box-sizing: border-box;}
        .slx .slx-head {display: flex; align-items: center; gap: 8px;}
        .slx .slx-head svg {opacity: .9;}

        /* regras vindas dos ficheiros CSS gerais (só usadas neste módulo) */
        /* - de cards_ltsc_x04.css */
        .major-card-header.header-blue {background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: #ffffff; border-bottom: 1px solid #000000; padding: 5px 18px; font-size: 12px; font-weight: 600;
                                        letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; text-shadow: 0 1px 2px rgba(0,0,0,0.4);}
        /* - de containers_ltsc_x04.css */
        .is-transmitting {animation: pulse-live 1s infinite; background-color: #ff4444 !important; color: white !important; border-color: #ff0000 !important; z-index: 10;}
        .console-dimmed {opacity: 1; pointer-events: none; transition: all 0.5s ease;}
        /* - de buttons_ltsc_x04.css */
        .options-btn {padding: 7px 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #c5c9d1; border-radius: 6px; background-color: #e2e4e9;
                      color: #2d3748; cursor: pointer; transition: all 0.2s ease; border-bottom: 2px solid #b1b5be;}
        .options-btn:hover {background-color: #d1d5db; transform: translateY(-1px);}
        .options-btn.active {background-color: #1e40af; color: #ffffff; border-bottom: 0; transform: translateY(1px); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);}
        .options-black-btn {padding: 7px 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #000; border-radius: 6px; background-color: #1a1a1a; color: #fff; cursor: pointer;
                            transition: all 0.2s; border-bottom: 2px solid #000;}
        .options-black-btn:hover {background-color: #262626; transform: translateY(-1px);}
        .options-black-btn.active {background-color: #880808; color: #fff; border-bottom: 0; transform: translateY(1px); box-shadow: inset 0 2px 6px rgba(0,0,0,0.5);}
        .options-yellow-btn {padding: 7px 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #d9a406; border-radius: 6px; background-color: #f5b800; color: #453200; cursor: pointer;
                             transition: all 0.2s; border-bottom: 2px solid #c29200;}
        .options-yellow-btn:hover {background-color: #ffc800; transform: translateY(-1px);}
        .options-yellow-btn.active {background-color: #c2410c; color: #fff; border-bottom: 0; transform: translateY(1px); box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
        .options-btn:focus, .options-black-btn:focus, .options-yellow-btn:focus {outline: none !important; box-shadow: none;}
        .options-btn.active:focus, .options-black-btn.active:focus, .options-yellow-btn.active:focus {box-shadow: inset 0 2px 5px rgba(0,0,0,0.3) !important;}
        /* - de tables_ltsc_x04.css */
        .table-elements {width: 100%; border-collapse: collapse;}
        .table-elements th, .table-elements td {border: 1px solid #bbb; padding: 2px; text-align: center;}
        .table-elements th {background-color: #f2f2f2;}
        /* - de dayliplan_ltsc_x04.css */
        #plandir-layout-wrapper {display: flex; align-items: flex-start; gap: 12px; margin-top: 10px; overflow: visible;}
        #plandir-left-col {min-width: 0;}
        #plandir-right-col {width: 500px; flex-shrink: 0; position: -webkit-sticky; position: sticky; top: 10px; height: fit-content; align-self: flex-start; z-index: 0;}
        .plandir-side-table {width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #d0d0d0;}
        .plandir-side-table th {padding: 6px 8px; text-align: center; background-color: #dcdcdc; color: #444; font-size: 12px; font-weight: 600; letter-spacing: 0.03em; border: 1px solid #b8b8b8;}
        .plandir-side-table td {border: 1px solid #d0d0d0; padding: 5px 8px; background: #f5f5f5; font-size: 12px;}
        .plandir-side-table tbody tr:hover td {background-color: #f0f4ff;}
        .row-highlight-green td {background-color: #dcfce7 !important; color: #15803d !important; font-weight: 600;}
        .plandir-side-table tbody tr.row-highlight-green:hover td {background-color: #bbf7d0 !important;}
        .row-pending-red td {background-color: #fee2e2 !important; color: #991b1b !important; transition: all 0.3s ease;}
        .plandir-shift-header {width: 100%; margin: 5px auto; margin-bottom: 0px; text-align: center; padding: 10px 16px; border-radius: 10px; border: 1px solid #d0d0d0;
                               background: linear-gradient(to bottom, #ffffff, #f0f0f0); box-shadow: 0 2px 8px rgba(0,0,0,0.1);}
        .plandir-shift-header .plandir-header-title {font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px;}
        .plandir-shift-header .plandir-header-date {font-size: 14px; color: #555;}
        .plandir-status-dot {width: 15px; height: 15px; border-radius: 4px; position: absolute; right: 14px; background: linear-gradient(to bottom, #ef4444 0%, #b91c1c 50%, #991b1b 100%);
                             box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2);}
        .plandir-status-dot.filled {background: linear-gradient(to bottom, #22c55e 0%, #16a34a 50%, #15803d 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2);}
        .plandir-status-dot.dot-yellow {background: linear-gradient(to bottom, #facc15 0%, #eab308 50%, #ca8a04 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2);}
        .plandir-status-dot.dot-red {background: linear-gradient(to bottom, #ef4444 0%, #b91c1c 50%, #991b1b 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2);}
        .plandir-card-title {padding: 8px 14px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; text-align: center; display: flex; align-items: center;
                             justify-content: center; position: relative; background: linear-gradient(to bottom, #2a3f6f 0%, #1a2a4a 50%, #152238 100%);
                             box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2); text-shadow: 0 1px 2px rgba(0,0,0,0.3);}
        .plandir-card-title.red-variant {background: linear-gradient(to bottom, #b91c1c 0%, #991b1b 50%, #7f1d1d 100%);}
        .plandir-card-title.green-variant {background: linear-gradient(to bottom, #22c55e 0%, #16a34a 50%, #15803d 100%); margin-top: 0; border-top: 1px solid rgba(255,255,255,0.2);}
        .plandir-card-title.black-variant {background: linear-gradient(to bottom, #454545 0%, #1a1a1a 50%, #000000 100%); margin-top: 0; border-top: 1px solid rgba(255,255,255,0.15);
                                           color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.8);}
        .plandir-main-card {margin: 10px 0 0 0; max-width: 1200px; border: 1px solid #d0d0d0; border-radius: 10px 10px 0 0; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); transform: none !important;
                            transition: none !important;}
        .plandir-table {width: 100%; border-collapse: collapse; font-size: 12px;}
        .plandir-table th {padding: 6px 8px; text-align: center; background-color: #dcdcdc; color: #444; font-size: 12px; font-weight: 600; letter-spacing: 0.03em; border: 1px solid #b8b8b8;}
        .plandir-table col:nth-child(1) {width: 75px;}
        .plandir-table col:nth-child(2) {width: 200px;}
        .plandir-table col:nth-child(3) {width: 300px;}
        .plandir-table col:nth-child(4) {width: 75px;}
        .plandir-table col:nth-child(5) {width: 75px;}
        .plandir-table col:nth-child(6) {width: 75px;}
        .plandir-table col:nth-child(7) {width: 75px;}
        .plandir-table col:nth-child(8) {width: 500px;}
        .plandir-table .special {background-color: #3c3a8c;}
        .plandir-table td {border: 1px solid #d0d0d0; padding: 0; transition: background 0.1s;}
        .plandir-table tbody td {background: #f5f5f5;}
        .plandir-table tbody tr:hover td {background-color: #f0f4ff;}
        .plandir-table input {width: 100%; padding: 5px 6px; border: none; outline: none; background: transparent; font-size: 12px; font-family: inherit; color: #1a1a1a; transition: background 0.12s;}
        .plandir-table input:focus {background: #eef3ff; color: #1d4ed8;}
        .plandir-table td:nth-child(1) input, .plandir-table td:nth-child(4) input, .plandir-table td:nth-child(5) input, .plandir-table td:nth-child(6) input,
        .plandir-table td:nth-child(7) input {text-align: center;}
        .plandir-table td:nth-child(2) input, .plandir-table td:nth-child(3) input, .plandir-table td:nth-child(8) input {text-align: left;}
        .mp-cell, .tas-cell {text-align: center; font-size: 12px; font-weight: 600; color: #bbb; user-select: none;}
        .plandir-mp-active {background: #dcfce7 !important; color: #15803d !important; font-weight: bold; text-align: center;}
        .plandir-tas-active {background: #fef9c3 !important; color: #a16207 !important; font-weight: bold; text-align: center;}
        .plandir-readonly-field {background: #f5f5f5; color: #555;}
        .plandir-nint-input, .plandir-entrance-input, .plandir-exit-input, .plandir-obs-input {width: 100%;}
        /* - estilos que estavam escritos nos elementos das páginas (style="...") */
        #page-docimport .sl-1, #page-ppis .sl-1, #page-recservdescr .sl-1, #page-saloc .sl-1 {font-family: 'Segoe UI', sans-serif;}
        #page-docimport .sl-2, #page-ppis .sl-2, #page-recservdescr .sl-2, #page-saloc .sl-2 {font-size: 15px; margin-bottom: 20px; color: #333;}
        #page-ppis .sl-3, #page-recservdescr .sl-3, #page-saloc .sl-3 {background: linear-gradient(90deg, #e0e0e0, #d6d6d6); padding: 15px 20px; border-left: 5px solid #dc3545; border-radius: 6px; margin-bottom: 20px;}
        #page-saloc .sl-4 {margin-bottom: 20px;}
        #page-saloc .sl-5 {list-style: none; padding-left: 10px; line-height: 1.8;}
        #page-ppis .sl-6, #page-recservdescr .sl-6, #page-saloc .sl-6 {color:#0d630e;}
        #page-ppis .sl-7, #page-saloc .sl-7 {margin-top: 30px; color: #444;}
        #page-docimport .sl-8, #page-ppis .sl-8, #page-recservdescr .sl-8, #page-saloc .sl-8 {margin-top: 40px; text-align:center; font-style: italic; color: #6c757d;}
        #page-ppis .sl-9, #page-recservdescr .sl-9 {list-style: none; padding-left: 20px; line-height: 1.7; font-size: 14.5px;}
        #page-ppis .sl-10, #page-recservdescr .sl-10 {color:#c20c0c;}
        #page-ppis .sl-11, #page-recservdescr .sl-11 {background: linear-gradient(90deg, #e0e0e0, #d6d6d6); padding: 15px 20px; border-left: 5px solid #0d630e; border-radius: 6px; margin: 25px 0 20px 0;}
        #page-ppia2 .sl-12 {margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #aaa;}
        #page-crepcalg .sl-13, #page-dashboard .sl-13, #page-ineminop .sl-13, #page-inocrepc .sl-13, #page-plandir .sl-13, #page-ppia22 .sl-13, #page-ppiaero .sl-13, #page-ppilinfer .sl-13, #page-recinoreports .sl-13, #page-recserv .sl-13 {opacity:.9;}
        #page-ppia22 .sl-14, #page-ppilinfer .sl-14 {margin: 3px 0 0 0; justify-content: center;}
        #page-crepcalg .sl-15, #page-hemodialysis .sl-15, #page-inocrepc .sl-15, #page-plandir .sl-15, #page-ppia22 .sl-15, #page-ppilinfer .sl-15 {margin-bottom: 10px; font-size: 14px; font-weight: bold;}
        #page-ppia22 .sl-16, #page-ppilinfer .sl-16 {grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%; max-width: 400px;}
        #page-ppia22 .sl-17, #page-ppilinfer .sl-17 {height: 35px; width: 100%;}
        #page-crepcalg .sl-18, #page-inocrepc .sl-18, #page-plandir .sl-18, #page-ppilinfer .sl-18 {height: 35px;}
        #page-ppilinfer .sl-19 {height: 35px; width: 100%; opacity: 0.6; cursor: not-allowed;}
        #page-recservdescr .sl-20 {font-size: 14.5px; color: #444; line-height: 1.6; margin-bottom: 20px;}
        #page-ineminop .sl-21, #page-recserv .sl-21 {width: 100%;}
        #page-recserv .sl-22 {font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #444; margin: -12px -12px 15px -12px; padding: 10px 14px; background: linear-gradient(90deg, rgba(220,53,69,0.16), rgba(255,255,255,0.03)); border-left: 3px solid rgba(220,53,69,0.9); border-radius: 6px 6px 0 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);}
        #page-ineminop .sl-23, #page-recserv .sl-23 {margin-bottom: 5px;}
        #page-ineminop .sl-24, #page-recserv .sl-24 {flex-direction: row; align-items: center; gap: 10px;}
        #page-crepcalg .sl-25, #page-ineminop .sl-25, #page-inocrepc .sl-25, #page-recserv .sl-25 {width: 120px;}
        #page-crepcalg .sl-26, #page-ineminop .sl-26, #page-inocrepc .sl-26, #page-phonebook .sl-26, #page-recserv .sl-26 {width: 100px;}
        #page-crepcalg .sl-27, #page-hemodialysis .sl-27, #page-ineminop .sl-27, #page-inocrepc .sl-27, #page-recserv .sl-27 {width: 200px;}
        #page-recserv .sl-28 {min-width: 120px;}
        #page-ineminop .sl-29, #page-recserv .sl-29 {margin: 20px 0;}
        #page-ineminop .sl-30, #page-recserv .sl-30 {justify-content: space-between; align-items: center; margin-bottom: 10px;}
        #page-ineminop .sl-31, #page-recserv .sl-31 {font-size: 16px; color: #444; margin: 0;}
        #page-crepcalg .sl-32, #page-dashboard .sl-32, #page-fleet-cards .sl-32, #page-hemodialysis .sl-32, #page-ineminop .sl-32, #page-inocrepc .sl-32, #page-phonebook .sl-32, #page-recserv .sl-32 {flex-direction: row; align-items: center; gap: 8px;}
        #page-attendance-list .sl-33, #page-contact-list .sl-33, #page-crepcalg .sl-33, #page-fleet-cards .sl-33, #page-hemodialysis .sl-33, #page-inocrepc .sl-33, #page-material-request .sl-33, #page-phonebook .sl-33, #page-recserv .sl-33 {font-size: 13px;}
        #page-recserv .sl-34 {margin: 0 0 0 0; height: 285px;}
        #page-ineminop .sl-35, #page-recserv .sl-35 {width: 70px;}
        #page-ineminop .sl-36, #page-recserv .sl-36 {width: 50px;}
        #page-crepcalg .sl-37, #page-recserv .sl-37 {width: 170px;}
        #page-crepcalg .sl-38, #page-dashboard .sl-38, #page-hemodialysis .sl-38, #page-inocrepc .sl-38, #page-phonebook .sl-38, #page-recserv .sl-38 {width: 150px;}
        #page-crepcalg .sl-39, #page-recserv .sl-39 {width: 180px;}
        #page-ineminop .sl-40 {font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #444; margin: -12px -12px 15px -12px; padding: 10px 14px; background: linear-gradient(90deg, rgba(220,53,69,0.18), rgba(255,255,255,0.03)); border-left: 3px solid rgba(220,53,69,0.9); border-radius: 6px 6px 0 0; align-items: center; gap: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);}
        #page-ineminop .sl-41 {width: 75px;}
        #page-dashboard .sl-42, #page-ineminop .sl-42, #page-recinoreports .sl-42 {font-size: 14px;}
        #page-ineminop .sl-43 {margin: 0 0 0 0; height: 300px;}
        #page-crepcalg .sl-44, #page-ineminop .sl-44, #page-inocrepc .sl-44, #page-phonebook .sl-44 {width: 250px;}
        #page-recinoreports .sl-45 {flex-direction: row; align-items: center; gap: 8px; margin-bottom: 18px;}
        #page-phonebook .sl-46, #page-recinoreports .sl-46 {width: 130px;}
        #page-recinoreports .sl-47 {font-size: 14px; margin-left: 8px;}
        #page-recinoreports .sl-48 {gap: 16px; flex-wrap: wrap; align-items: flex-start;}
        #page-recinoreports .sl-49 {flex: 1; min-width: 220px;}
        #page-recinoreports .sl-50 {font-size: 13px; font-weight: 600; color: #fff; background: #dc3545; padding: 7px 12px; border-radius: 6px 6px 0 0; letter-spacing: 0.4px;}
        #page-recinoreports .sl-51 {width: 100%; border-collapse: collapse; font-size: 13px;}
        #page-recinoreports .sl-52 {background: #f1f3f5;}
        #page-recinoreports .sl-53 {padding: 7px 10px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057;}
        #page-recinoreports .sl-54 {padding: 7px 10px; text-align: center; border-bottom: 2px solid #dee2e6; color: #495057;}
        #page-recinoreports .sl-55 {text-align:center; padding: 12px; color: #aaa;}
        #page-recinoreports .sl-56 {background: #f8f9fa; font-weight: 600;}
        #page-recinoreports .sl-57 {padding: 7px 10px; border-top: 2px solid #dee2e6;}
        #page-recinoreports .sl-58 {padding: 7px 10px; text-align: center; border-top: 2px solid #dee2e6;}
        #page-recinoreports .sl-59 {flex: 1; min-width: 320px;}
        #page-recinoreports .sl-60 {font-size: 13px; font-weight: 600; color: #fff; background: #198754; padding: 7px 12px; border-radius: 6px 6px 0 0; letter-spacing: 0.4px;}
        #page-recinoreports .sl-61 {font-size: 13px; font-weight: 600; color: #fff; background: #0d6efd; padding: 7px 12px; border-radius: 6px 6px 0 0; letter-spacing: 0.4px;}
        #page-crepcalg .sl-62, #page-dashboard .sl-62 {align-items:center; gap:8px;}
        #page-dashboard .sl-63 {font-size: 14px; font-weight: 600; text-align: center; color: #2c3e50; margin: 0 0 18px 0; padding: 10px 14px; border-left: 4px solid #3498db; background: linear-gradient(90deg, rgba(52,152,219,0.10), rgba(255,255,255,0.02)); border-radius: 6px; letter-spacing: 0.3px;}
        #page-contact-list .sl-64, #page-dashboard .sl-64, #page-phonebook .sl-64 {flex-direction: row; align-items: center; gap: 8px; margin-bottom: 15px;}
        #page-dashboard .sl-65 {gap: 12px; margin-bottom: 14px; flex-wrap: wrap;}
        #page-dashboard .sl-66 {flex: 1; min-width: 180px; padding: 14px; text-align: center; border-radius: 10px; background: linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow: 0 2px 6px rgba(0,0,0,0.06); border-top: 3px solid #e74c3c;}
        #page-dashboard .sl-67 {font-size: 11px; color: #6c7a89; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;}
        #page-dashboard .sl-68 {font-size: 32px; font-weight: 700; color: #2c3e50;}
        #page-dashboard .sl-69 {flex: 1; min-width: 180px; padding: 14px; text-align: center; border-radius: 10px; background: linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow: 0 2px 6px rgba(0,0,0,0.06); border-top: 3px solid #c0392b;}
        #page-dashboard .sl-70 {font-size: 32px; font-weight: 700; color: #c0392b;}
        #page-dashboard .sl-71 {flex: 1; min-width: 180px; padding: 14px; text-align: center; border-radius: 10px; background: linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow: 0 2px 6px rgba(0,0,0,0.06); border-top: 3px solid #e67e22;}
        #page-dashboard .sl-72 {font-size:32px; font-weight:700; color:#e67e22;}
        #page-dashboard .sl-73 {gap: 12px; margin-bottom: 12px; flex-wrap: wrap;}
        #page-dashboard .sl-74 {flex: 1; min-width: 250px; padding: 14px; border-radius: 10px; background: linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow: 0 2px 6px rgba(0,0,0,0.06); border-top: 3px solid #3498db;}
        #page-dashboard .sl-75 {font-size: 11px; text-align: center; margin-bottom: 10px; color: #5f6f7f; text-transform: uppercase;}
        #page-dashboard .sl-76 {height: 150px;}
        #page-dashboard .sl-77 {flex:1; min-width:250px; padding:14px; border-radius:10px; background:linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow:0 2px 6px rgba(0,0,0,0.06); border-top:3px solid #e74c3c;}
        #page-dashboard .sl-78 {gap: 12px; flex-wrap: wrap;}
        #page-dashboard .sl-79 {flex: 1; min-width: 250px; padding: 14px; border-radius: 10px; background: linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow: 0 2px 6px rgba(0,0,0,0.06); border-top: 3px solid #9b59b6;}
        #page-dashboard .sl-80 {flex: 1; min-width: 250px; padding: 14px; border-radius: 10px; background: linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow: 0 2px 6px rgba(0,0,0,0.06); border-top: 3px solid #e67e22;}
        #page-dashboard .sl-81 {flex: 1; min-width: 250px; padding: 14px; border-radius: 10px; background: linear-gradient(180deg,#f8f9fa,#eef1f4); box-shadow: 0 2px 6px rgba(0,0,0,0.06); border-top: 3px solid #95a5a6;}
        #page-docimport .sl-82 {background: linear-gradient(90deg, #d5d5d5, #c9c9c9); padding: 15px 20px; border-left: 5px solid #171d8f; border-radius: 6px; margin-bottom: 20px;}
        #page-docimport .sl-83 {padding-left: 25px; line-height: 1.6;}
        #page-docimport .sl-84 {margin-bottom: 8px;}
        #page-crepcalg .sl-85, #page-hemodialysis .sl-85, #page-inocrepc .sl-85, #page-plandir .sl-85 {margin: 0; justify-content: center;}
        #page-crepcalg .sl-86, #page-hemodialysis .sl-86, #page-inocrepc .sl-86, #page-plandir .sl-86 {flex-direction: column; align-items: center;}
        #page-crepcalg .sl-87 {margin:0 0 0 0;}
        #page-crepcalg .sl-88, #page-inocrepc .sl-88 {justify-content: center;}
        #page-crepcalg .sl-89 {margin: 0 0 0 0;}
        #page-crepcalg .sl-90 {font-size: 13px; font-weight: bold;}
        #page-crepcalg .sl-91 {width: 230px;}
        #page-crepcalg .sl-92 {width: 160px;}
        #page-crepcalg .sl-93 {margin: 10px 0 0 0; align-items: center;}
        #page-crepcalg .sl-94 {flex-direction: row; align-items: center;}
        #page-crepcalg .sl-95 {font-size: 13px; font-weight: bold; white-space: nowrap;}
        #page-crepcalg .sl-96 {width: 140px;}
        #page-crepcalg .sl-97 {width: 90px;}
        #page-crepcalg .sl-98 {margin: 20px 0 0 0; align-items: flex-start; text-align: left;}
        #page-crepcalg .sl-99 {margin: 5px 0 0 0;}
        #page-crepcalg .sl-100 {font-size: 14px; font-weight: 600; letter-spacing: 0.04em; color: #444; margin: 0 0 10px 0; padding: 8px 12px; background: linear-gradient(90deg, rgba(220,53,69,0.18), rgba(255,255,255,0.03)); border-left: 3px solid rgba(220,53,69,0.9); border-radius: 6px 6px 0 0; align-items: center; gap: 8px;}
        #page-crepcalg .sl-101 {align-items: center; margin: 3px 0;}
        #page-crepcalg .sl-102 {width: 280px; align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap;}
        #page-crepcalg .sl-103, #page-inocrepc .sl-103 {width: 17px; height: 17px; cursor: pointer !important;}
        #page-crepcalg .sl-104 {flex-direction: row; align-items: center; gap: 8px; flex: 1; min-width: 0;}
        #page-crepcalg .sl-105 {width: 754px;}
        #page-crepcalg .sl-106 {width: 280px; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;}
        #page-crepcalg .sl-107 {width:17px; height:17px; cursor: pointer !important;}
        #page-crepcalg .sl-108 {width: 200px; background: #5e5e5e;}
        #page-crepcalg .sl-109 {width: 250px; background: #5e5e5e;}
        #page-crepcalg .sl-110 {width: 754px; background: #909090;}
        #page-crepcalg .sl-111 {margin: 10px 0 0 0; align-items: flex-start; text-align: left;}
        #page-crepcalg .sl-112 {align-items: center; margin: 2px 0;}
        #page-crepcalg .sl-113 {font-size: 15px;}
        #page-crepcalg .sl-114 {width: 75px; text-align: center;}
        #page-crepcalg .sl-115 {width: 632px;}
        #page-crepcalg .sl-116 {margin: 15px 0 0 0;}
        #page-crepcalg .sl-117 {width: 350px;}
        #page-crepcalg .sl-118 {width: 728px;}
        #page-crepcalg .sl-119 {flex-direction: row; align-items: center; gap: 8px; margin: 15px 0 0 0;}
        #page-crepcalg .sl-120, #page-hemodialysis .sl-120, #page-phonebook .sl-120 {width: 300px;}
        #page-crepcalg .sl-121, #page-inocrepc .sl-121, #page-plandir .sl-121 {gap: 5px;}
        #page-crepcalg .sl-122, #page-inocrepc .sl-122 {margin-bottom: 0px;}
        #page-crepcalg .sl-123, #page-inocrepc .sl-123 {margin-top: 5px;}
        #page-crepcalg .sl-124 {width: 150px; text-align: center; font-size: 14px;}
        #page-crepcalg .sl-125 {margin-top: 10px;}
        #page-crepcalg .sl-126 {width: 100%; border-collapse: collapse; table-layout: fixed;}
        #page-crepcalg .sl-127 {background-color: #721c24; color: #ffffff; text-align: center; padding: 8px 10px; font-weight: bold; font-size: 13px; border: 0;}
        #page-crepcalg .sl-128 {width:50%; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-129 {width:50%; border-top: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-130 {padding: 4px; white-space: nowrap; text-align: center;}
        #page-crepcalg .sl-131 {padding: 4px;}
        #page-crepcalg .sl-132 {margin-top: 10px; width: 100%;}
        #page-crepcalg .sl-133 {width: 100% !important; border-collapse: collapse; table-layout: fixed !important;}
        #page-crepcalg .sl-134 {width: 30% !important;}
        #page-crepcalg .sl-135 {width: 8% !important;}
        #page-crepcalg .sl-136 {width: 14% !important;}
        #page-crepcalg .sl-137 {width: 16% !important;}
        #page-crepcalg .sl-138 {border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-139 {border-top: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-140 {gap: 3px;}
        #page-crepcalg .sl-141 {font-size: 12px; width: 58%; height: 24px; padding: 0 2px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none;}
        #page-crepcalg .sl-142 {font-size: 12px; width: 42%; height: 24px; padding: 0 2px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none;}
        #page-attendance-list .sl-143, #page-contact-list .sl-143, #page-crepcalg .sl-143, #page-fleet-cards .sl-143, #page-hemodialysis .sl-143, #page-material-request .sl-143, #page-phonebook .sl-143 {width: 100%; border-collapse: collapse;}
        #page-crepcalg .sl-144 {background-color: #721c24; color: #ffffff; text-align: center; padding: 8px 10px; font-weight: bold; font-size: 13px; border: 0; position: relative;}
        #page-crepcalg .sl-145 {position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background-color: #28a745; color: white; border: none; border-radius: 4px; width: 24px; height: 24px; font-size: 16px; cursor: pointer; align-items: center; justify-content: center;}
        #page-crepcalg .sl-146 {width:30px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-147 {width:40px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-148 {width:150px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-149 {width:250px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-150 {width:160px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-151 {width:160px; border-top: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-152 {width:50px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-153 {width:110px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-154 {width:200px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-155 {width:100px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-156 {width:180px; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-157 {width:180px; border-top: 1px solid #ccc; padding: 6px;}
        #page-crepcalg .sl-158 {font-size: 15px; color: #666; margin-top: 10px; text-align: center;}
        #page-crepcalg .sl-159 {align-items: center; margin: 15px 0 0 0;}
        #page-crepcalg .sl-160 {flex-direction: row; align-items: center; gap: 3px;}
        #page-crepcalg .sl-161, #page-inocrepc .sl-161 {flex-wrap: wrap; justify-content: flex-end;}
        #page-plandir .sl-162 {height: 35px; background: orange; color: black;}
        #page-plandir .sl-163 {margin: 10px 0 0 0; width: 500px;}
        #page-plandir .sl-164 {padding: 5px 6px; width: 75px;}
        #page-plandir .sl-165 {padding: 5px 6px; width: 150px;}
        #page-plandir .sl-166 {padding: 5px 6px; width: 200px;}
        #page-inocrepc .sl-167, #page-phonebook .sl-167 {width: 400px;}
        #page-inocrepc .sl-168 {width: 125px;}
        #page-inocrepc .sl-169 {width: 120px; text-align: center;}
        #page-inocrepc .sl-170 {width: 395px;}
        #page-inocrepc .sl-171 {width: 150px; text-align: center;}
        #page-inocrepc .sl-172 {font-weight: bold; font-size: 13px; margin-top: 15px; margin-bottom: 5px;}
        #page-inocrepc .sl-173 {margin-left: 20px;}
        #page-inocrepc .sl-174 {align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap;}
        #page-inocrepc .sl-175 {align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap; margin-left: 15px;}
        #page-inocrepc .sl-176 {margin-left: 40px;}
        #page-inocrepc .sl-177 {align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap; width: 100px;}
        #page-inocrepc .sl-178 {align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap; width: 60px;}
        #page-inocrepc .sl-179 {align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap; width: 50px;}
        #page-inocrepc .sl-180 {align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap; width: 190px;}
        #page-inocrepc .sl-181 {align-items: center; gap: 8px; font-size: 15px; cursor: pointer; white-space: nowrap; width: 170px;}
        #page-inocrepc .sl-182 {flex-direction: row; align-items: center; gap: 8px; margin-top: 15px;}
        #page-inocrepc .sl-183 {font-size: 13px; font-weight: bold; color: #444;}
        #page-alarm-console .sl-184, #page-attendance-list .sl-184, #page-contact-list .sl-184, #page-fleet-cards .sl-184, #page-hemodialysis .sl-184, #page-material-request .sl-184, #page-phonebook .sl-184 {align-items: center; gap: 10px;}
        #page-hemodialysis .sl-185 {width: 100px; height: 35px;}
        #page-hemodialysis .sl-186 {font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #444; margin: -12px -12px 15px -12px; padding: 5px 14px; background: linear-gradient(90deg, rgba(220,53,69,0.16), rgba(255,255,255,0.03)); border-left: 3px solid rgba(220,53,69,0.9); border-radius: 6px 6px 0 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);}
        #page-hemodialysis .sl-187 {width: 700px;}
        #page-hemodialysis .sl-188, #page-phonebook .sl-188 {flex-direction: row; align-items: center; gap: 8px; margin-top: 5px;}
        #page-hemodialysis .sl-189 {width: 550px;}
        #page-hemodialysis .sl-190 {width: 500px;}
        #page-hemodialysis .sl-191 {position: relative;}
        #page-hemodialysis .sl-192 {align-items: center; justify-content: flex-start; gap: 6px; font-size: 13px; padding: 3px 0; cursor: pointer; width: 100%; text-align: left;}
        #page-hemodialysis .sl-193 {width: 16px; height: 16px; margin: 0; cursor: pointer !important; outline: none !important; box-shadow: none !important;}
        #page-hemodialysis .sl-194 {flex-direction: row; align-items: center; gap: 8px; justify-content: flex-end; margin-top: 15px;}
        #page-attendance-list .sl-195, #page-contact-list .sl-195, #page-fleet-cards .sl-195, #page-hemodialysis .sl-195, #page-material-request .sl-195, #page-phonebook .sl-195 {max-height: 500px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #bdc3c7 #f1f1f1;}
        #page-attendance-list .sl-196, #page-contact-list .sl-196, #page-fleet-cards .sl-196, #page-hemodialysis .sl-196, #page-material-request .sl-196, #page-phonebook .sl-196 {position: sticky; top: 0; z-index: 1;}
        #page-attendance-list .sl-197, #page-contact-list .sl-197, #page-fleet-cards .sl-197, #page-hemodialysis .sl-197, #page-material-request .sl-197, #page-phonebook .sl-197 {background: #1e3a8a; color: #fff;}
        #page-fleet-cards .sl-198, #page-hemodialysis .sl-198, #page-material-request .sl-198, #page-phonebook .sl-198 {padding: 6px; border: 1px solid #ddd; font-size: 12px;}
        #page-hemodialysis .sl-199 {padding: 6px; border: 1px solid #ddd; font-size: 12px; width: 100px;}
        #page-fleet-cards .sl-200, #page-hemodialysis .sl-200, #page-phonebook .sl-200 {text-align: center; padding: 8px; font-size: 12px; color: #999;}
        #page-hemodialysis .sl-201 {justify-content: center; gap: 10px; flex-wrap: wrap; align-items: stretch; padding: 0;}
        #page-hemodialysis .sl-202 {min-width: 250px; flex-direction: column; align-items: center; height: 100%; margin-left: 0;}
        #page-hemodialysis .sl-203 {font-size: 14px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; width: 100%; text-align: center;}
        #page-hemodialysis .sl-204 {flex-direction: column; gap: 15px; width: 100%; max-height: 500px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #bdc3c7 #f1f1f1;}
        #page-hemodialysis .sl-205 {font-size: 13px; font-weight: bold; background: #1e3a8a; color: #fff; padding: 5px 10px; border-radius: 4px 4px 0 0; text-align: center;}
        #page-hemodialysis .sl-206 {background: #f0f0f0;}
        #page-hemodialysis .sl-207 {padding: 5px; width: 200px; border: 1px solid #ddd; font-size: 12px;}
        #page-hemodialysis .sl-208 {padding: 5px; width: 390px; border: 1px solid #ddd; font-size: 12px;}
        #page-hemodialysis .sl-209 {padding: 5px; width: 150px; border: 1px solid #ddd; font-size: 12px;}
        #page-hemodialysis .sl-210 {min-width: 250px; flex-direction: column; align-items: center; height: 100%; margin-right: 0;}
        #page-hemodialysis .sl-211 {font-size: 13px; font-weight: bold; background: #6b0000; color: #fff; padding: 5px 10px; border-radius: 4px 4px 0 0; text-align: center;}
        #page-alarm-console .sl-212, #page-attendance-list .sl-212, #page-contact-list .sl-212, #page-fleet-cards .sl-212, #page-material-request .sl-212, #page-phonebook .sl-212 {opacity:.9; vertical-align: middle;}
        #page-material-request .sl-213 {flex-direction: row; align-items: center; gap: 8px; flex-wrap: wrap;}
        #page-alarm-console .sl-214, #page-material-request .sl-214 {font-size: 13px; white-space: nowrap;}
        #page-material-request .sl-215 {flex: 3; min-width: 350px;}
        #page-material-request .sl-216 {flex: 2; min-width: 100px; max-width: 200px;}
        #page-material-request .sl-217 {margin-top: 5px; flex-direction: row; align-items: center; gap: 8px; flex-wrap: wrap;}
        #page-fleet-cards .sl-218, #page-material-request .sl-218 {margin-top: 20px;}
        #page-attendance-list .sl-219, #page-contact-list .sl-219, #page-material-request .sl-219, #page-phonebook .sl-219 {font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #444; margin: -12px -12px 15px -12px; padding: 5px 14px; background: linear-gradient(90deg, rgba(30,58,138,0.13), rgba(255,255,255,0.03)); border-left: 3px solid rgba(30,58,138,0.9); border-radius: 6px 6px 0 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);}
        #page-material-request .sl-220 {padding: 6px; border: 1px solid #ddd; font-size: 12px; width: 80px;}
        #page-material-request .sl-221 {text-align:center; padding:8px; font-size:12px; color:#999;}
        #page-attendance-list .sl-222, #page-contact-list .sl-222, #page-fleet-cards .sl-222, #page-material-request .sl-222, #page-phonebook .sl-222 {justify-content: flex-end; gap: 10px;}
        #page-fleet-cards .sl-223 {font-size: 13px; font-weight: 6000; letter-spacing: 0.04em; color: #444; margin: -12px -12px 15px -12px; padding: 5px 14px; background: linear-gradient(90deg, rgba(30,58,138,0.13), rgba(255,255,255,0.03)); border-left: 3px solid rgba(30,58,138,0.9); border-radius: 6px 6px 0 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);}
        #page-fleet-cards .sl-224, #page-phonebook .sl-224 {padding: 6px; border: 1px solid #ddd; font-size: 12px; width: 120px;}
        #page-fleet-cards .sl-225, #page-phonebook .sl-225 {margin-top: 10px; gap: 20px; font-size: 14px; font-weight: 600; color: #444;}
        #page-fleet-cards .sl-226, #page-phonebook .sl-226 {color: #1e3a8a;}
        #page-fleet-cards .sl-227 {color: #16a34a;}
        #page-fleet-cards .sl-228 {color: #dc2626;}
        #page-contact-list .sl-229, #page-phonebook .sl-229 {position: relative; align-items: center;}
        #page-contact-list .sl-230, #page-phonebook .sl-230 {width: 300px; padding-right: 30px;}
        #page-contact-list .sl-231, #page-phonebook .sl-231 {position: absolute; right: 8px; color: #aaa; cursor: pointer; pointer-events: none;}
        #page-attendance-list .sl-232, #page-contact-list .sl-232 {padding: 6px; border: 1px solid #ddd; font-size: 13px;}
        #page-contact-list .sl-233 {padding: 6px; border: 1px solid #ddd; font-size: 13px; width: 80px;}
        #page-attendance-list .sl-234, #page-contact-list .sl-234 {text-align:center; padding:8px; font-size:14px; color:#999;}
        #page-attendance-list .sl-235, #page-contact-list .sl-235 {margin-top: 10px; font-size: 13px; font-weight: 600; color: #444; gap: 10px; flex-wrap: wrap; align-items: center;}
        #page-attendance-list .sl-236, #page-contact-list .sl-236 {background: #1e3a8a; color: #fff; padding: 2px 8px; border-radius: 4px;}
        #page-contact-list .sl-237 {color: #a70c0c; background: #ffebeb; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccc;}
        #page-contact-list .sl-238 {color: #2c5282; background: #ebf8ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;}
        #page-contact-list .sl-239 {color: #b45309; background: #fffbeb; padding: 2px 6px; border-radius: 4px; border: 1px solid #fef3c7;}
        #page-contact-list .sl-240 {color: #15803d; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;}
        #page-contact-list .sl-241 {color: #6b21a8; background: #f3e8ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e9d5ff;}
        #page-contact-list .sl-242 {color: #4a5568; background: #edf2f7; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;}
        #page-attendance-list .sl-243 {flex-direction: row; align-items: center; gap: 8px; margin-bottom: 15px; justify-content: space-between;}
        #page-attendance-list .sl-244 {align-items: center; gap: 8px;}
        #page-attendance-list .sl-245 {padding: 6px; border: 1px solid #ddd; font-size: 13px; width: 160px;}
        #page-attendance-list .sl-246 {padding: 6px; border: 1px solid #ddd; font-size: 13px; width: 500px;}
        #page-attendance-list .sl-247 {color: #166534; background: #dcfce7; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;}
        #page-attendance-list .sl-248 {color: #991b1b; background: #fee2e2; padding: 2px 6px; border-radius: 4px; border: 1px solid #fecaca;}
        #page-phonebook .sl-249 {justify-content: flex-start; margin-bottom: 15px;}
        #page-phonebook .sl-250 {font-size: 13px; align-items: center; gap: 4px;}
        #page-phonebook .sl-251 {width: 18px; height: 18px; accent-color: #f59e0b; margin: 0; cursor: pointer !important; outline: none !important; box-shadow: none !important;}
        #page-phonebook .sl-252 {justify-content: flex-end; margin-top: 15px;}
        #page-phonebook .sl-253 {margin-top: 0px;}
        #page-phonebook .sl-254 {color: #f59e0b;}
        #page-alarm-console .sl-255 {grid-template-columns: 1fr 1fr; gap: 20px;}
        #page-alarm-console .sl-256 {flex-direction: column; align-items: center; padding: 15px; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;}
        #page-alarm-console .sl-257 {font-size: 15px; font-weight: 700; margin: 0 0 15px 0; color: #dc3545; letter-spacing: 1px;}
        #page-alarm-console .sl-258 {margin-bottom: 12px; font-size: 13px; color: #888;}
        #page-alarm-console .sl-259 {flex-wrap: wrap; justify-content: center; gap: 8px;}
        #page-alarm-console .sl-260 {height: 38px; width: 120px; font-size: 11px;}
        #page-alarm-console .sl-261 {align-items: center; gap: 10px; width: 100%; margin-top: 25px;}
        #page-alarm-console .sl-262 {height: 42px; width: 100%; margin-top: 20px; font-weight: 700;}
        #page-alarm-console .sl-263 {flex-grow: 1; height: 32px; background: #1b1e22; border: 1px solid #333; color: white; border-radius: 6px; padding: 0 10px;}
        #page-alarm-console .sl-264 {margin: 20px auto 0 auto; max-width: 500px; flex-direction: column; align-items: center; padding: 15px; border-top: 2px solid #dc3545; background: rgba(220,53,69,0.03); border-radius: 12px;}
        #page-alarm-console .sl-265 {font-size: 15px; font-weight: 700; margin: 0 0 10px 0;}
        #page-alarm-console .sl-266 {gap: 15px; margin-top: 10px;}
        #page-alarm-console .sl-267 {height: 45px; width: 140px; background: #1b1e22; border: 1px solid #dc3545; color: white;}
        #page-alarm-console .sl-268 {height: 20px;}
      `;
      document.head.appendChild(css);
    }
    const PAGES = {
      'page-saloc': `

        <div class="major-card last-card">
          <div class="major-card-header">BEM-VINDO AO SALOC 360</div>
          <div class="major-card-body sl-1">
            <p class="sl-2">
              O <strong>SALOC 360</strong> é um sistema digital de gestão operacional diária da
              <strong>Sala de Operações e Comunicações (SALOC)</strong> do seu Corpo de Bombeiros.
              Este sistema integra as principais ferramentas de apoio à decisão, planeamento e monitorização das atividades
              logísticas e operacionais em tempo real.
            </p>
            <div class="sl-3">
              <strong>Funcionalidades Principais:</strong>
            </div>
            <div class="sl-4">
              <ul class="sl-5">
                <li class="sl-6"><i class="fa-solid fa-map"></i> Consulta dos Planos Prévios de Intervenção (A22, Aeroporto e Linha Ferroviária)</li>
                <li class="sl-6"><i class="fa-solid fa-pen-to-square"></i> Registo de Recusas de Serviço e de Inoperacionalidades INEM, com relatórios mensais</li>
                <li class="sl-6"><i class="fa-solid fa-chart-column"></i> Dashboard de Estatísticas Operacionais</li>
                <li class="sl-6"><i class="fa-solid fa-envelope-open-text"></i> Documentação para o Comando Sub-Regional: MOA, Anexo G1/G2 e Situação Operacional</li>
                <li class="sl-6"><i class="fa-solid fa-calendar-days"></i> Planeamento Diário e gestão de turnos</li>
                <li class="sl-6"><i class="fa-solid fa-truck-medical"></i> Listagem semanal e gestão dos utentes de Hemodiálise</li>
                <li class="sl-6"><i class="fa-solid fa-folder"></i> Requisição de equipamentos, cartões frota, contactos e listas nominais</li>
                <li class="sl-6"><i class="fa-solid fa-bell"></i> Consola de Alarmes Interna (chamadas individuais, de grupo e alarmes)</li>
              </ul>
            </div>
            <p class="sl-7">
              Estas funcionalidades proporcionam uma visão integrada do estado operacional da corporação,
              reforçando a capacidade de planeamento, comunicação e resposta coordenada em tempo real.
            </p>
            <div class="sl-8">
              Selecione uma opção no menu lateral para começar.
            </div>
          </div>
          <div class="major-card-footer"></div>
        </div>

`,
      'page-ppis': `

        <div class="major-card major-last-card">
          <div class="major-card-header">PLANOS PRÉVIOS DE INTERVENÇÃO (PPI) – ALGARVE</div>
          <div class="major-card-body sl-1">
            <p class="sl-2">
              O módulo <strong>PPI 360</strong> integra o sistema de gestão e visualização dos
              <strong>Planos Prévios de Intervenção (PPI)</strong> da região do Algarve,
              permitindo o acesso rápido e atualizado à informação estratégica de apoio à decisão operacional
              e à gestão de emergências complexas.
            </p>
            <div class="sl-3">
              <strong>Planos Disponíveis:</strong>
            </div>
            <ul class="sl-9">
              <!-- <li class="sl-10">🛣️ PPI - Autoestrada do Sul (A2) <em>(Em atualização pela ANEPC)</em></li> -->
              <li class="sl-6"><i class="fa-solid fa-road"></i> PPI - Via do Infante de Sagres (A22)</li>
              <li class="sl-6"><i class="fa-solid fa-plane"></i> PPI - Aeroporto Internacional Gago Coutinho</li>
              <li class="sl-6"><i class="fa-solid fa-train"></i> PPI - Linha Ferroviária do Algarve</li>
            </ul>
            <div class="sl-11">
              <strong>Funcionalidades do Módulo:</strong>
            </div>
            <ul class="sl-9">
              <li class="sl-6"><i class="fa-solid fa-location-dot"></i> Consulta geográfica interativa dos PPIs</li>
              <li class="sl-6"><i class="fa-solid fa-file-lines"></i> Acesso a tabelas técnicas e recursos associados</li>
              <li class="sl-6"><i class="fa-solid fa-compass"></i> Identificação de meios e acessos operacionais</li>
              <li class="sl-6"><i class="fa-solid fa-arrows-rotate"></i> Atualização e integração contínua de dados</li>
            </ul>
            <p class="sl-7">
              Os PPIs são uma ferramenta fundamental para garantir a resposta coordenada e eficiente em situações
              de emergência, assegurando o conhecimento prévio do terreno, acessos, riscos e recursos disponíveis.
            </p>
            <div class="sl-8">
              Selecione um PPI no menu lateral para visualizar os detalhes.
            </div>
          </div>
          <div class="major-card-footer"></div>
        </div>

`,
      'page-ppia2': `

      <div class="major-card major-last-card">
        <div class="major-card-header">PLANO PRÉVIO DE INTERVENÇÃO - AUTO ESTRADA DO SUL - A2</div>
        <div class="major-card-body">
          <label class="sl-12">⟳ PPI EM ATUALIZAÇÃO PELA ANEPC</label>
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-ppia22': `

      <div class="major-card major-last-card">
        <div class="major-card-header header-blue">
          <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
            <circle cx="9" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
          <span>PLANO PRÉVIO DE INTERVENÇÃO - VIA DO INFANTE DE SAGRES - A22</span>
        </div>
        <div class="major-card-body">
          <div class="major-row sl-14" style="display: flex;">
            <div class="options-main-card" id="ppia22-main-options" style="display: flex; flex-direction: column; align-items: center;">
              <label class="sl-15">Selecione uma Opção</label>
              <div class="action-buttons sl-16" id="ppia22-options" style="display: grid;">
                <button id="ppi_a22_by_km" class="btn btn-add options-btn sl-17" onclick="consultationGridA22KmType()">Consulta por Km</button>
                <button id="ppi_a22_by_section" class="btn btn-add options-btn sl-17" onclick="consultationGridA22SectionType()">Consulta por Troço</button>
                <button id="ppi_a22_by_structure" class="btn btn-add options-btn sl-17" onclick="consultationGridA22StructureType()">Consulta por Referência</button>
                <button id="ppi_a22_by_grid" class="btn btn-add options-btn sl-17" onclick="consultationGridA22ButtonType()">Consulta por Grelha</button>
              </div>
            </div>
          </div>
          <div id="ppia22-grid-controls"></div>
          <div id="ppia22-grid-references"></div>
          <div id="ppia22-grid-container"></div>          
          <div id="ppia22-specials-container"></div>
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-ppiaero': `

      <div class="major-card major-last-card">
        <div class="major-card-header header-blue">
          <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 4c-2 0-4 2-4 2L7 7.2l-3.5-.5-1.5 1.5 4 2-1 3 2 1 3-1 2 4 1.8-1z"/>
          </svg>
          <span>PLANO PRÉVIO DE INTERVENÇÃO - AEROPORTO GAGO COUTINHO</span>
        </div>
        <div class="major-card-body">
          <div id="ppiaero-grid-controls"></div>
          <div id="ppiaero-grid-info-container"></div>
          <div id="ppiaero-grid-container"></div>
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-ppilinfer': `

      <div class="major-card major-last-card">
        <div class="major-card-header header-blue">
          <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="20" y2="22"/>
          </svg>
          <span>PLANO PRÉVIO DE INTERVENÇÃO - LINHA FERROVIÁRIA DO ALGARVE</span>
        </div>
        <div class="major-card-body">
          <div class="major-row sl-14" style="display: flex;">
            <div class="options-main-card" id="ppilinfer-main-options" style="display: flex; flex-direction: column; align-items: center;">
              <label class="sl-15">Selecione uma Opção</label>
              <div class="action-buttons sl-16" id="ppilinfer-options" style="display: grid;">
                <button id="ppi_linfer_by_pkm" class="btn btn-add options-btn sl-18" onclick="consultationGridLinFerKmType()">Cosulta por PKm</button>
                <button id="ppi_linfer_by_section" class="btn btn-add options-btn sl-17" onclick="consultationGridLinFerSectionType()">Consulta por Troço</button>
                <button id="ppi_linfer_by_structure" class="btn btn-add options-btn sl-19" title="Não exitem Pontos de Referência para este PPI." 
                        onclick="consultationGridLinFerStructureType()" disabled>Consulta por Referência</button>
                <button id="ppi_linfer_by_grid" class="btn btn-add options-btn sl-18" onclick="consultationGridLinFerButtonType()">Consulta por Grelha</button>
              </div>
            </div>
          </div>
          <div id="ppilinfer-grid-controls"></div>
          <div id="ppilinfer-grid-references"></div>
          <div id="ppilinfer-specials-container"></div>
          <div id="ppilinfer-grid-container"></div>
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-recservdescr': `

        <div class="major-card major-last-card">
          <div class="major-card-header">GESTÃO DE RECUSAS DE SERVIÇOS E INOPERACIONALIDADES (INEM)</div>
          <div class="major-card-body sl-1">
            <p class="sl-2">
              O módulo <strong>REGOPS 360</strong> centraliza a <strong>gestão de recusas de serviços</strong> e
              <strong>inoperacionalidades de meios INEM</strong>, permitindo um controlo detalhado e
              automatizado da disponibilidade operacional das viaturas integradas no
              protocolo de emergência pré-hospitalar, bem como a recusa de serviços do seu Corpo de Bombeiros.
            </p>
            <div class="sl-3">
              <strong>Funcionalidades Principais:</strong>
            </div>
            <ul class="sl-9">
              <li class="sl-6"><i class="fa-solid fa-pen-to-square"></i> Registo de Recusas de Serviços</li>
              <li class="sl-6"><i class="fa-solid fa-truck-medical"></i> Registo de Inoperacionalidades (INEM)</li>
              <li class="sl-6"><i class="fa-solid fa-chart-column"></i> Dashboard Gráfico de Estatísticas</li>
              <li class="sl-10"><i class="fa-solid fa-calendar-days"></i> Relatórios Mensais <em>(Brevemente)</em></li>
            </ul>
            <div class="sl-11">
              <strong>Objetivo do Módulo:</strong>
            </div>
            <p class="sl-20">
              Este módulo visa garantir o <strong>acompanhamento em tempo real</strong> da disponibilidade operacional,
              reduzindo o impacto das inoperacionalidades no sistema de resposta pré-hospitalar e recusas de serviços.
              Permite ainda a análise de padrões, apoio à decisão e criação de relatórios estatísticos.
            </p>
            <ul class="sl-9">
              <li class="sl-6"><i class="fa-solid fa-chart-line"></i> Monitorização contínua da disponibilidade operacional do veículo INEM</li>
              <li class="sl-6"><i class="fa-solid fa-clipboard-list"></i> Monitorização contínua das recusas de serviços</li>
              <li class="sl-6"><i class="fa-solid fa-clock-rotate-left"></i> Histórico de eventos e registos detalhados</li>
            </ul>
            <div class="sl-8">
              Selecione uma opção no menu lateral para começar a gestão dos registos.
            </div>
          </div>
          <div class="major-card-footer"></div>
        </div>

`,
      'page-recserv': `

      <div class="major-card major-last-card slx slx-recserv">
        <div class="major-card-header slx-head">
          <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
            <path d="M8.5 8.5L15.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M15.5 8.5L8.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          RECUSAS DE SERVIÇOS DE TRANSPORTE DE DOENTES
        </div>
        <div class="major-card-body">
          <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Registo da recusa</div><div class="slx-grid slx-g4"><div class="slx-f"><label for="service_refusal_date">Data da recusa</label><input type="date" id="service_refusal_date" class="slx-in"></div><div class="slx-f"><label for="service_refusal_time">Hora da recusa</label><input type="time" id="service_refusal_time" class="slx-in"></div><div class="slx-f"><label for="service_refusal_type">Tipo de serviço</label><select id="service_refusal_type" class="slx-in"></select></div><div class="slx-f"><label for="service_refusal_motive">Motivo da recusa</label><select id="service_refusal_motive" class="slx-in"></select></div><div class="slx-f slx-s2"><label for="service_refusal_origin">Origem do serviço</label><input type="text" id="service_refusal_origin" class="slx-in"></div><div class="slx-f slx-s2"><label for="service_refusal_destination">Destino do serviço</label><input type="text" id="service_refusal_destination" class="slx-in"></div><div class="slx-f"><label for="service_refusal_optel">Optel de serviço</label><input type="text" id="service_refusal_optel" class="slx-in"></div><div class="slx-f"><label for="service_refusal_validation">Validado por</label><input type="text" id="service_refusal_validation" class="slx-in"></div><div class="slx-act slx-s2" id="service-refusal"><button class="btn btn-add slx-save" onclick="insertServiceRefusal()"><i class="fa-solid fa-floppy-disk"></i> GUARDAR</button></div></div></section><section class="slx-box"><div class="slx-bh"><span class="slx-n">2</span>Recusas registadas<div class="slx-tools"><label for="refusals_year_filter">Ano</label><select id="refusals_year_filter" class="slx-in slx-year"></select></div></div><div class="table-container sl-34 slx-tbl">
            <table id="service-refusals-table">
              <thead><tr><th style="width:95px">Data</th><th style="width:65px">Hora</th><th>Tipo</th><th>Origem</th><th>Destino</th><th>Motivo</th><th>Optel</th><th>Validação</th><th style="width:44px"></th></tr></thead>
              <tbody></tbody>
            </table>
          </div></section>
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-ineminop': `

      <div class="major-card major-last-card slx slx-ineminop">
        <div class="major-card-header slx-head">
          <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 13V8C3 6.9 3.9 6 5 6H14C15.1 6 16 6.9 16 8V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="7" cy="16.5" r="1.5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="14" cy="16.5" r="1.5" stroke="currentColor" stroke-width="1.6"/>
            <path d="M18 6L22 10M22 6L18 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          INOPERACIONALIDADES VEÍCULO (INEM)
        </div>
        <div class="major-card-body">
          <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Registo da inoperacionalidade</div><div class="slx-grid slx-g4"><div class="slx-f"><label for="ineinop_date">Data</label><input type="date" id="ineinop_date" class="slx-in"></div><div class="slx-f"><label for="ineinop_shift">Turno</label><select id="ineinop_shift" class="slx-in"><option>&nbsp;</option><option>D</option><option>N</option></select></div><div class="slx-f"><label for="ineinop_hour_qtd">Qtd. horas</label><input type="time" id="ineinop_hour_qtd" class="slx-in"></div><div class="slx-f"><label for="reason_for_ineinop">Motivo da inoperacionalidade</label><select id="reason_for_ineinop" class="slx-in"></select></div><div class="slx-f slx-s2"><label for="ineinop_crew">Tripulante</label><input type="text" id="ineinop_crew" class="slx-in"></div><div class="slx-f"><label for="ineinop_optel">Optel de serviço</label><input type="text" id="ineinop_optel" class="slx-in"></div><div class="slx-f"><label for="ineinop_validation">Validado por</label><input type="text" id="ineinop_validation" class="slx-in"></div><div class="slx-act slx-s4" id="inem-inop"><button class="btn btn-add slx-save" onclick="insertIneInop()"><i class="fa-solid fa-floppy-disk"></i> GUARDAR</button></div></div></section><section class="slx-box"><div class="slx-bh"><span class="slx-n">2</span>Inoperacionalidades registadas<div class="slx-tools"><label for="ineinop_year_filter">Ano</label><select id="ineinop_year_filter" class="slx-in slx-year"></select></div></div><div class="table-container sl-43 slx-tbl">
            <table id="ineinop-table">
              <thead><tr><th style="width:95px">Data</th><th style="width:60px">Turno</th><th style="width:90px">Qtd. horas</th><th>Motivo</th><th>Tripulante</th><th>Optel</th><th>Validação</th><th style="width:44px"></th></tr></thead>
              <tbody></tbody>
            </table>
          </div></section>
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-recinoreports': `

      <div class="major-card major-last-card slx slx-rep">
        <div class="major-card-header">
          <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M7 3h10l3 3v15H7V3z"/>
            <path d="M17 3v4h4"/>
            <path d="M9 17v-4"/>
            <path d="M12 17v-7"/>
            <path d="M15 17v-2"/>
          </svg>
          RELATÓRIOS MENSAIS DE RECUSAS DE SERVIÇOS E INOPERACIONALIDADES (INEM)
        </div>
        <div class="major-card-body">
          <!-- FILTROS -->
          <div class="major-field sl-45">
            <label class="sl-42">Mês:</label>
            <select class="sl-46" id="refusal_month_filter"></select>
            <label class="sl-47">Ano:</label>
            <select id="refusal_year_filter" style="width: 80px;"></select>
          </div>
          <!-- TABELAS -->
          <div class="sl-48" style="display: flex;">
            <!-- TABELA RECUSAS -->
            <div class="sl-49">
              <div class="sl-50">
                <i class="fa-solid fa-ban"></i> Recusas de Serviço
              </div>
              <table class="sl-51">
                <thead>
                  <tr class="sl-52">
                    <th class="sl-53">Tipo de Serviço</th>
                    <th class="sl-54">Qtd.</th>
                  </tr>
                </thead>
                <tbody id="table-refusals-body">
                  <tr><td class="sl-55" colspan="2">A carregar...</td></tr>
                </tbody>
                <tfoot>
                  <tr class="sl-56">
                    <td class="sl-57">Total</td>
                    <td class="sl-58" id="table-refusals-total">0</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <!-- TABELA INEM D -->
            <div class="sl-59">
              <div class="sl-60">
                <i class="fa-solid fa-sun"></i> Inoperacionalidades INEM — Turno D
              </div>
              <table class="sl-51">
                <thead>
                  <tr class="sl-52">
                    <th class="sl-54">Mês</th>
                    <th class="sl-54">Motivo</th>
                    <th class="sl-54">Qtd.</th>
                    <th class="sl-54">Total Horas</th>
                  </tr>
                </thead>
                <tbody id="table-inemD-body">
                  <tr><td class="sl-55" colspan="4">A carregar...</td></tr>
                </tbody>
                <tfoot>
                  <tr class="sl-56">
                    <td class="sl-57">Total</td>
                    <td class="sl-57"></td>
                    <td class="sl-58" id="table-inemD-total-qty">0</td>
                    <td class="sl-58" id="table-inemD-total-hrs">0h 0m</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <!-- TABELA INEM N -->
            <div class="sl-59">
              <div class="sl-61">
                <i class="fa-solid fa-moon"></i> Inoperacionalidades INEM — Turno N
              </div>
              <table class="sl-51">
                <thead>
                  <tr class="sl-52">
                    <th class="sl-54">Mês</th>
                    <th class="sl-54">Motivo</th>
                    <th class="sl-54">Qtd.</th>
                    <th class="sl-54">Total Horas</th>
                  </tr>
                </thead>
                <tbody id="table-inemN-body">
                  <tr><td class="sl-55" colspan="4">A carregar...</td></tr>
                </tbody>
                <tfoot>
                  <tr class="sl-56">
                    <td class="sl-57">Total</td>
                    <td class="sl-57"></td>
                    <td class="sl-58" id="table-inemN-total-qty">0</td>
                    <td class="sl-58" id="table-inemN-total-hrs">0h 0m</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div class="major-card-footer">
          <div class="action-buttons" id="inem-inop">
            <button class="btn btn-danger" onclick="insertIneInop()"><i class="fa-solid fa-file-lines"></i> EMITIR</button>
          </div>
        </div>
      </div>

`,
      'page-dashboard': `

        <div class="major-card major-last-card slx slx-dash">
          <div class="major-card-header sl-62" style="display:flex;">
            <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 3v18h18"/>
              <path d="M7 14l3-3 4 4 5-6"/>
            </svg>
            DASHBOARD GRÁFICO DE ESTATÍSTICAS
          </div>
          <div class="major-card-body">
            <h4 class="sl-63">
              Representação Gráfica de Inoperacionalidades INEM e Recusas de Serviços
            </h4>
            <div class="major-field sl-64">
              <label class="sl-42">Mês:</label>
              <select class="sl-38" id="dashboard_refusal_month_filter"></select>
              <div class="major-field sl-32">
                <label class="sl-42">Ano:</label>
                <select id="dashboard_refusal_year_filter" style="width: 70px;"></select>
              </div>
            </div>
            <div class="sl-65" style="display: flex;">
              <div class="sl-66">
                <div class="sl-67">Inop. Turno D</div>
                <div class="sl-68" id="sum-inop-d">0</div>
              </div>
              <div class="sl-66">
                <div class="sl-67">Inop. Turno N</div>
                <div class="sl-68" id="sum-inop-n">0</div>
              </div>
              <div class="sl-69">
                <div class="sl-67">Total INOP.</div>
                <div class="sl-70" id="sum-inop-total">0</div>
              </div>
              <div class="sl-71">
                <div class="sl-67">Recusas Total</div>
                <div class="sl-72" id="sum-refusals-total">0</div>
              </div>
            </div>
            <div class="sl-73" style="display: flex;">
              <div class="sl-74">
                <div class="sl-75">INOP. Turno D</div>
                <canvas class="sl-76" id="chart-ine-d"></canvas>
              </div>
              <div class="sl-74">
                <div class="sl-75">INOP. Turno N</div>
                <canvas class="sl-76" id="chart-ine-n"></canvas>
              </div>
              <div class="sl-77">
                <div class="sl-75">Total INOP.</div>
                <canvas class="sl-76" id="chart-ine-total"></canvas>
              </div>
            </div>
            <div class="sl-78" style="display: flex;">
              <div class="sl-79">
                <div class="sl-75">Recusas por Entidade</div>
                <canvas class="sl-76" id="chart-refusals-type"></canvas>
              </div>
              <div class="sl-80">
                <div class="sl-75">Total Recusas</div>
                <canvas class="sl-76" id="chart-refusals-total"></canvas>
              </div>
              <div class="sl-81">
                <div class="sl-75">
                  Reservado
                </div>
                <canvas class="sl-76"></canvas>
              </div>
            </div>
          </div>
          <div class="major-card-footer"></div>
        </div>

`,
      'page-docimport': `

        <div class="major-card last-card">
          <div class="major-card-header">GESTÃO DE DOCUMENTAÇÃO OPERACIONAL E INSTITUCIONAL (DOC 360)</div>
          <div class="major-card-body sl-1">
            <p class="sl-2">
              O módulo <strong>DOCS 360</strong> é o módulo responsável pela <strong>gestão e comunicação documental</strong> essencial à atividade operacional e administrativa do seu Corpo de Bombeiros.
              Este sistema integra processos de reporte, planeamento e envio de documentação às entidades competentes, garantindo rigor e rastreabilidade em todas as comunicações oficiais.
            </p>
            <div class="sl-82">
              <strong>Funcionalidades Principais:</strong>
            </div>
            <ul class="sl-83">
              <li class="sl-84"><i class="fa-solid fa-file-lines"></i> <strong>Formulários Oficiais CREPC Algarve</strong> – envio e atualização de documentação obrigatória, como <em>MOA</em>, <em>Anexo G2</em> e outros 
                formulários operacionais.</li>
              <li class="sl-84"><i class="fa-solid fa-calendar-days"></i> <strong>Planeamentos Diários</strong> – gestão estruturada de recursos e previsões do serviço diário do CB Faro - Cruz Lusa.</li>
              <li class="sl-84"><i class="fa-solid fa-fire"></i> <strong>Comunicação de Inoperacionalidades e Operacionalidades</strong> – automatização do envio de estados de veículos e equipamentos às entidades 
                designadas (CREPC, CHEFIAS, COMANDO, etc.).</li>
            </ul>
            <div class="sl-8">
              Selecione uma opção no menu lateral para aceder à documentação correspondente.
            </div>
          </div>
          <div class="major-card-footer"></div>
        </div>

`,
      'page-crepcalg': `

        <div class="major-card major-last-card slx">
          <div class="major-card-header sl-62" style="display:flex;">
            <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M7 3h10l3 3v15H7V3z"/>
              <path d="M17 3v4h4"/>
              <path d="M9 12h6"/>
              <path d="M9 15h6"/>
              <path d="M9 18h4"/>
            </svg>
            DOCUMENTAÇÃO CREPC ALGARVE
          </div>
          <div class="major-card-body">
            <div id="crepcbtn-container">
              <div class="major-row sl-85" style="display: flex;">
                <div class="options-main-card sl-86" style="display: flex;">
                  <label class="sl-15">Selecione uma Opção</label>
                  <div class="action-buttons" id="docs-crepc" style="gap: 5px;">
                    <button id="NewMOABtn" class="btn btn-add options-btn sl-18">MOA's</button>
                    <button class="btn btn-add options-btn sl-18" onclick="showbreve()">Anexo G1</button>
                    <button id="NewAnxG2Btn" class="btn btn-add options-btn sl-18">Anexo G2</button>
                  </div>
                </div>
              </div>
              <!-- MOA (CREPC SUB SUB-MODULE) -->
              <div id="moa-container" style="margin: 0; display: none;">
                <div class="slx-lay"><div class="slx-main">
                  <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Contexto</div><div class="slx-grid slx-moa-ctx"><div class="slx-f"><label for="moa_cb">Corpo de Bombeiros</label><select id="moa_cb" class="slx-in"></select></div><div class="slx-f"><label for="moa_device_type">Dispositivo</label><select id="moa_device_type" class="slx-in"></select></div><div class="slx-f"><label for="moa_epe_type">EPE</label><select id="moa_epe_type" class="slx-in"></select></div><div class="slx-f"><label for="moa_date_init">De</label><div class="slx-dt"><input type="date" id="moa_date_init" class="slx-in"><input type="time" id="moa_time_init" class="slx-in"></div></div><div class="slx-f"><label for="moa_date_end">Até</label><div class="slx-dt"><input type="date" id="moa_date_end" class="slx-in"><input type="time" id="moa_time_end" class="slx-in"></div></div><div class="slx-f"><label for="moa_optel">OPTEL</label><input type="text" id="moa_optel" class="slx-in"></div><input type="text" id="moa_gdh_init" style="display: none;"><input type="text" id="moa_gdh_end" style="display: none;"></div></section>
                  <section class="slx-box"><div class="slx-bh"><span class="slx-n">2</span>Medidas<div class="slx-tools"><span class="slx-cnt" id="moa-count">0 de 9 ativas</span></div></div><div class="slx-scroll"><div class="slx-meds"><div class="slx-m"><label class="slx-mh"><input type="checkbox" id="moa_eco" class="slx-swi"><span class="slx-sw"></span>Elemento de Comando às operações<small>desligada</small></label><div class="slx-mf"><select id="moa_eco_sit" class="slx-in"></select><select id="moa_eco_pront" class="slx-in"></select><input type="text" id="moa_eco_observ" class="slx-in" placeholder="Observações"></div></div><div class="slx-m"><label class="slx-mh"><input type="checkbox" id="moa_ned" class="slx-swi"><span class="slx-sw"></span>Notificação à Entidade Detentora<small>desligada</small></label><div class="slx-mf"><select id="moa_ned_sit" class="slx-in" disabled></select><select id="moa_ned_pront" class="slx-in"></select><input type="text" id="moa_ned_observ" class="slx-in" placeholder="Observações"></div></div><div class="slx-m"><label class="slx-mh"><input type="checkbox" id="moa_oco" class="slx-swi"><span class="slx-sw"></span>Oficial / Chefe em ordenança<small>desligada</small></label><div class="slx-mf"><select id="moa_oco_sit" class="slx-in"></select><select id="moa_oco_pront" class="slx-in"></select><input type="text" id="moa_oco_observ" class="slx-in" placeholder="Observações"></div></div><div class="slx-m"><label class="slx-mh"><input type="checkbox" id="moa_era" class="slx-swi"><span class="slx-sw"></span>ERAS locais<small>desligada</small></label><div class="slx-mf"><select id="moa_era_sit" class="slx-in"></select><select id="moa_era_pront" class="slx-in"></select><input type="text" id="moa_era_observ" class="slx-in" placeholder="Observações"></div></div><div class="slx-m"><label class="slx-mh"><input type="checkbox" id="moa_eob" class="slx-swi"><span class="slx-sw"></span>Equipas de observação<small>desligada</small></label><div class="slx-mf"><select id="moa_eob_sit" class="slx-in"></select><select id="moa_eob_pront" class="slx-in"></select><input type="text" id="moa_eob_observ" class="slx-in" placeholder="Observações"></div></div><div class="slx-m"><label class="slx-mh"><input type="checkbox" id="moa_rsc" class="slx-swi"><span class="slx-sw"></span>Reforço da SALOC<small>desligada</small></label><div class="slx-mf"><select id="moa_rsc_sit" class="slx-in" disabled></select><select id="moa_rsc_pront" class="slx-in"></select><input type="text" id="moa_rsc_observ" class="slx-in" placeholder="Observações"></div></div><div class="slx-m"><label class="slx-mh"><input type="checkbox" id="moa_mef" class="slx-swi"><span class="slx-sw"></span>Mobilização do efetivo<small>desligada</small></label><div class="slx-mf"><select id="moa_mef_sit" class="slx-in"></select><select id="moa_mef_pront" class="slx-in" disabled></select><input type="text" id="moa_mef_observ" class="slx-in" placeholder="Observações" disabled></div></div><div class="slx-m slx-wide"><label class="slx-mh"><input type="checkbox" class="slx-swi"><span class="slx-sw"></span>Reforço de equipas de intervenção extraordinárias<small>desligada</small></label><div class="slx-mf slx-mf4"><input type="text" id="moa_reie_type_01" class="slx-in" placeholder="Tipologia"><input type="text" id="moa_reie_time_01" class="slx-in" placeholder="Período"><input type="text" id="moa_reie_nop_01" class="slx-in" placeholder="N.º operacionais"><input type="text" id="moa_reie_obs_01" class="slx-in" placeholder="Observações"></div><div class="slx-mf slx-mf4"><input type="text" id="moa_reie_type_02" class="slx-in" placeholder="Tipologia"><input type="text" id="moa_reie_time_02" class="slx-in" placeholder="Período"><input type="text" id="moa_reie_nop_02" class="slx-in" placeholder="N.º operacionais"><input type="text" id="moa_reie_obs_02" class="slx-in" placeholder="Observações"></div><div class="slx-mf slx-mf4"><input type="text" id="moa_reie_type_03" class="slx-in" placeholder="Tipologia"><input type="text" id="moa_reie_time_03" class="slx-in" placeholder="Período"><input type="text" id="moa_reie_nop_03" class="slx-in" placeholder="N.º operacionais"><input type="text" id="moa_reie_obs_03" class="slx-in" placeholder="Observações"></div></div><div class="slx-m slx-wide"><label class="slx-mh"><input type="checkbox" class="slx-swi"><span class="slx-sw"></span>Outras<small>desligada</small></label><div class="slx-mf"><input type="text" id="moa_otr_type_01" class="slx-in" placeholder="Medida"><input type="text" id="moa_otr_time_01" class="slx-in" placeholder="Período"><input type="text" id="moa_otr_obs_01" class="slx-in" placeholder="Observações"></div><div class="slx-mf"><input type="text" id="moa_otr_type_02" class="slx-in" placeholder="Medida"><input type="text" id="moa_otr_time_02" class="slx-in" placeholder="Período"><input type="text" id="moa_otr_obs_02" class="slx-in" placeholder="Observações"></div><div class="slx-mf"><input type="text" id="moa_otr_type_03" class="slx-in" placeholder="Medida"><input type="text" id="moa_otr_time_03" class="slx-in" placeholder="Período"><input type="text" id="moa_otr_obs_03" class="slx-in" placeholder="Observações"></div></div></div></div></section>
                </div>
                <aside class="slx-sum"><div class="slx-sum-k">Resumo da MOA</div><pre class="slx-prev" id="moa-prev"></pre><p class="slx-sum-p">Vai por email, com o formulário em PDF, para os destinatários do Centro de Dados.</p></aside></div>
                <div class="slx-foot" id="moa-emit"><button class="btn btn-danger" id="saveMOABtn"><i class="fa-solid fa-file-lines"></i> EMITIR MOA</button></div>
              </div>
          </div>
          <!-- G2 (CREPC SUB SUB-MODULE) -->
          <div id="g2-container" style="margin: 20px 0 0 0; display: none;">
            <div class="major-card major-last-card sl-87">
              <div class="major-card-header header-black sl-88" style="display: flex;">LISTA NOMINAL DE MEIOS DO CB (ANEXO G2)</div>
              <div class="major-card-body">
                <div class="major-row sl-85" style="display: flex;">
                  <div class="options-main-card sl-86" style="display: flex;">
                    <label class="sl-15">Selecione uma Opção</label>
                    <div class="action-buttons sl-121" id="g2-action-buttons">
                      <button class="btn btn-add options-btn oldg2 sl-18">EM CURSO</button>
                      <button class="btn btn-add options-btn sl-18" id="NewG2Btn">NOVO</button>
                    </div>
                  </div>
                </div>
                <!-- MISSÕES EM CURSO -->
                <div id="g2TableContainer" style="display: none; margin-top: 20px;">
                  <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Missões em curso</div>
                  <div class="table-container slx-tbl g2-list">
                    <table id="g2Table">
                      <thead>
                        <tr>
                          <th class="sl-97">Nº Sequencial</th>
                          <th class="sl-26">Viatura</th>
                          <th class="sl-25">GDH Acionamento</th>
                          <th class="sl-117">Local de Intervenção</th>
                          <th class="sl-38">Ação</th>
                        </tr>
                      </thead>
                      <tbody></tbody>
                    </table>
                  </div></section>
                </div>
                <!-- FORMULÁRIO -->
                <div id="g2_form_container" style="display: none; margin-top: 20px;">
                  <div class="major-card major-last-card sl-122">
                    <div class="major-card-header header-black sl-88" style="display: flex;">INSERÇÃO DE NOVA LISTA NOMINAL DE MEIOS</div>
                    <div class="major-card-body">
                      <div class="major-row sl-123">              
                        <div class="major-field sl-32">
                          <label class="sl-33">Nº Sequencial:</label>
                          <input class="sl-124" type="text" id="g2_seq_number">
                        </div>
                      </div>
                      <!-- INTERVENÇÃO (50/50) -->
                      <div class="table-container sl-125">
                        <table class="sl-126" id="g2InterventionTable">
                          <thead>
                            <tr>
                              <th class="sl-127" colspan="2">INTERVENÇÃO</th>
                            </tr>
                            <tr>
                              <th class="sl-128">GDH Acionamento</th>
                              <th class="sl-129">Local de Intervenção (Concelho/Sub-Região)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td class="sl-130">
                                <input type="date" id="g2_gdh_activation_date" style="font-size: 12px; width: 105px; height: 24px; padding: 0 4px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;" onfocus="this.style.borderColor='#80bdff'; this.style.boxShadow='0 0 5px rgba(0, 123, 255, 0.25)';" onblur="this.style.borderColor='#ccc'; this.style.boxShadow='none';">
                                <input type="time" id="g2_gdh_activation_hour" style="font-size: 12px; width: 75px; height: 24px; padding: 0 4px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;" onfocus="this.style.borderColor='#80bdff'; this.style.boxShadow='0 0 5px rgba(0, 123, 255, 0.25)';" onblur="this.style.borderColor='#ccc'; this.style.boxShadow='none';">
                                <input type="text" id="g2_gdh_activation" style="display: none;" readonly tabindex="-1">
                              </td>
                              <td class="sl-131">
                                <input type="text" id="g2_intervention_location" style="font-size: 12px; width: 100%; height: 24px; padding: 0 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;" onfocus="this.style.borderColor='#80bdff'; this.style.boxShadow='0 0 5px rgba(0, 123, 255, 0.25)';" onblur="this.style.borderColor='#ccc'; this.style.boxShadow='none';">
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <!-- VEÍCULO (6 colunas com COLGROUP para forçar as larguras) -->
                      <div class="table-container sl-132">
                        <table class="sl-133" id="g2VehicleTable">
                          <colgroup>
                            <col class="sl-134">
                            <col class="sl-135">
                            <col class="sl-136">
                            <col class="sl-137">
                            <col class="sl-137">
                            <col class="sl-137">
                          </colgroup>
                          <thead>
                            <tr>
                              <th class="sl-127" colspan="6">VEÍCULOS</th>
                            </tr>
                            <tr>
                              <th class="sl-138">Corpo de Bombeiros</th>
                              <th class="sl-138">Meios</th>
                              <th class="sl-138">ISSI SIRESP (móvel)</th>
                              <th class="sl-138">GDH Saída Quartel</th>
                              <th class="sl-138">GDH Local Concentração</th>
                              <th class="sl-139">GDH no TO</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td class="sl-131">
                                <select id="g2_cb" style="font-size: 12px; width: 100%; height: 24px; padding: 0 4px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none;" onfocus="this.style.borderColor='#80bdff';" onblur="this.style.borderColor='#ccc';">
                                  <option>0801 - Companhia Sapadores de Faro</option>
                                  <option>0802 - Corpo de Bombeiros de Lagos</option>
                                  <option>0803 - Companhia Sapadores de Tavira</option>
                                  <option>0804 - Corpo de Bombeiros de Vila Real de Sto. António e Castro Marim</option>
                                  <option>0805 - Corpo de Bombeiros de Faro - Cruz Lusa</option>
                                  <option>0806 - Corpo de Bombeiros de de Silves</option>
                                  <option>0807 - Corpo de Bombeiros de Portimão</option>
                                  <option>0808 - Corpo de Bombeiros Municipais de Loulé</option>
                                  <option>0809 - Corpo de Bombeiros de São Brás de Alportel</option>
                                  <option>0810 - Corpo de Bombeiros Municipais de Olhão</option>
                                  <option>0811 - Corpo de Bombeiros de Monchique</option>
                                  <option>0812 - Corpo de Bombeiros de Aljezur</option>
                                  <option>0813 - Corpo de Bombeiros de São Bartolomeu de Messines</option>
                                  <option>0814 - Corpo de Bombeiros de Albufeira</option>
                                  <option>0815 - Corpo de Bombeiros de Lagoa</option>
                                  <option>0816 - Corpo de Bombeiros de Vila do Bispo</option>
                                  <option>0817 - Corpo de Bombeiros de Alcoutim</option>
                                </select>
                              </td>
                              <td class="sl-131">
                                <select id="g2_vehicle" style="font-size: 12px; text-align-last: center; width: 100%; height: 24px; padding: 0 2px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none;" onfocus="this.style.borderColor='#80bdff';" onblur="this.style.borderColor='#ccc';"></select>
                              </td>
                              <td class="sl-131">
                                <input type="text" id="g2_vehicle_issi" style="font-size: 12px; width: 100%; height: 24px; padding: 0 4px; box-sizing: border-box; text-align: center; border: 1px solid #ccc; border-radius: 4px; outline: none;" onfocus="this.style.borderColor='#80bdff';" onblur="this.style.borderColor='#ccc';">
                              </td>                  
                              <!-- GDH SAÍDA -->
                              <td class="sl-131">
                                <div class="sl-140" style="display: flex;">
                                  <input class="sl-141" type="date" id="g2_gdh_station_departure_date">
                                  <input class="sl-142" type="time" id="g2_gdh_station_departure_hour">
                                </div>
                                <input type="text" id="g2_gdh_station_departure" style="display: none;" readonly tabindex="-1">
                              </td>                    
                              <!-- GDH CONCENTRAÇÃO -->
                              <td class="sl-131">
                                <div class="sl-140" style="display: flex;">
                                  <input class="sl-141" type="date" id="g2_gdh_assembly_point_date">
                                  <input class="sl-142" type="time" id="g2_gdh_assembly_point_hour">
                                </div>
                                <input type="text" id="g2_gdh_assembly_point" style="display: none;" readonly tabindex="-1">
                              </td>                    
                              <!-- GDH TO -->
                              <td class="sl-131">
                                <div class="sl-140" style="display: flex;">
                                  <input class="sl-141" type="date" id="g2_gdh_incident_site_date">
                                  <input class="sl-142" type="time" id="g2_gdh_incident_site_hour">
                                </div>
                                <input type="text" id="g2_gdh_incident_site" style="display: none;" readonly tabindex="-1">
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <!-- CHEFE DE EQUIPA (linhas geradas por JS) -->
                      <div class="table-container sl-125">
                        <table class="sl-143" id="g2LeadersTable">
                          <thead>
                            <tr>
                              <th class="sl-144" colspan="6">
                                CHEFE DE EQUIPA
                                <button class="sl-145" id="addG2LeaderBtn" style="display: flex;">+</button>
                              </th>
                            </tr>
                            <tr>
                              <th class="sl-146">ID</th>
                              <th class="sl-147">Nº Int.</th>
                              <th class="sl-148">Categoria</th>
                              <th class="sl-149">Nome</th>
                              <th class="sl-150">ISSI SIRESP (móvel)</th>
                              <th class="sl-151">Telefone</th>
                            </tr>
                          </thead>
                          <tbody></tbody>
                        </table>
                      </div>
                      <!-- EQUIPA (linhas geradas por JS) -->
                      <div class="table-container sl-125">
                        <table class="sl-143" id="g2CrewTable">
                          <thead>
                            <tr>
                              <th class="sl-144" colspan="9">
                                EQUIPA (INCLUIR O CHEFE DE EQUIPA)
                                <button class="sl-145" id="addG2CrewBtn" style="display: flex;">+</button>
                              </th>
                            </tr>
                            <tr>
                              <th class="sl-147">ID</th>
                              <th class="sl-152">Nº Int.</th>
                              <th class="sl-153">Nº Mec.</th>
                              <th class="sl-148">Categoria</th>
                              <th class="sl-154">Nome</th>
                              <th class="sl-152">SitDisp<br>(E/N/S/G)</th>
                              <th class="sl-155">Rede (ID)</th>
                              <th class="sl-156">GDH Saída</th>
                              <th class="sl-157">GDH Chegada</th>
                            </tr>
                          </thead>
                          <tbody></tbody>
                        </table>
                      </div>
                      <p class="sl-158">SitDisp = Situação no Dispositivo | E = Escalado | N = Não Escalado | S = Substituído | G = Gruata</p>
                      <div class="major-row sl-159" style="display: flex;">
                        <div class="major-field sl-160" style="display: flex;">
                          <label class="sl-33">OPTEL:</label>
                          <input type="text" id="g2_optel_nint" style="width: 60px; height: 25px !important; box-sizing: border-box; padding: 0; text-align: center; border: 1px solid #ccc; border-radius: 4px;   transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;" onfocus="this.style.setProperty('border-color', '#80bdff', 'important'); this.style.setProperty('box-shadow', '0 0 5px rgba(0, 123, 255, 0.25)', 'important');"  onblur="this.style.setProperty('border-color', '#ccc', 'important'); this.style.setProperty('box-shadow', 'none', 'important');">
                          <input type="text" id="g2_optel_patent" readonly tabindex="-1" style="width: 75px; height: 25px !important; box-sizing: border-box; padding: 0; text-align: center; border: 1px solid #ccc; border-radius: 4px; background-color: #e9ecef !important; cursor: not-allowed; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;" onfocus="this.style.setProperty('border-color', '#80bdff', 'important'); this.style.setProperty('box-shadow', '0 0 5px rgba(0, 123, 255, 0.25)', 'important');" onblur="this.style.setProperty('border-color', '#ccc', 'important'); this.style.setProperty('box-shadow', 'none', 'important');">
                          <input type="text" id="g2_optel_name" readonly tabindex="-1" style="width: 175px; height: 25px !important; box-sizing: border-box; padding: 0; border: 1px solid #ccc; border-radius: 4px; background-color: #e9ecef !important; cursor: not-allowed; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;" onfocus="this.style.setProperty('border-color', '#80bdff', 'important'); this.style.setProperty('box-shadow', '0 0 5px rgba(0, 123, 255, 0.25)', 'important');" onblur="this.style.setProperty('border-color', '#ccc', 'important'); this.style.setProperty('box-shadow', 'none', 'important');">
                        </div>
                      </div>  
                    </div>
                    <div class="major-card-footer sl-161" style="display: flex;">
                      <button class="btn btn-danger" id="g2SaveBtn" style="font-size: 12px;">Salvar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>          
          </div>  
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-plandir': `

        <div class="major-card major-last-card">
          <div class="major-card-header">
            <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <line x1="8" y1="10" x2="16" y2="10"/>
              <line x1="8" y1="14" x2="16" y2="14"/>
              <line x1="8" y1="18" x2="12" y2="18"/>
            </svg>
            PLANEAMENTOS DIÁRIOS
          </div>
          <div class="major-card-body">
            <div class="major-row sl-85" style="display: flex;">
              <div class="options-main-card sl-86" style="display: flex;">
                <label class="sl-15">Selecione um Turno</label>
                <div class="action-buttons sl-121" id="plandir-shift">
                  <button class="btn btn-add options-btn sl-18" data-shift="D" onclick="loadShift('D')">TURNO "D"</button>
                  <button class="btn btn-add options-btn sl-18" data-shift="N" onclick="loadShift('N')">TURNO "N"</button>
                  <button class="btn btn-add options-btn sl-162" data-shift="LAST" onclick="loadShift('LAST')">ÚLTIMO</button>
                </div>
              </div>
            </div>
            <div id="plandir-header-container"></div>
            <div class="plandir-kpis" id="plandir-kpis" hidden>
              <div class="plandir-kpi" style="--c:#c62828"><i><i class="fa-solid fa-users"></i></i><div><b id="plandir-k-el">0</b><small>Elementos escalados</small></div></div>
              <div class="plandir-kpi" style="--c:#1565c0"><i><i class="fa-solid fa-fire"></i></i><div><b id="plandir-k-eq">0</b><small>Equipas com elementos</small></div></div>
              <div class="plandir-kpi" style="--c:#2e7d32"><i><i class="fa-solid fa-truck-medical"></i></i><div><b id="plandir-k-tas">0</b><small>TAS</small></div></div>
              <div class="plandir-kpi" style="--c:#ef6c00"><i><i class="fa-solid fa-triangle-exclamation"></i></i><div><b id="plandir-k-inc">0</b><small>Secções por completar</small></div></div>
            </div>
            <div id="plandir-layout-wrapper">
              <div id="plandir-left-col">
                <div id="plandir_container"></div>
              </div>
              <div id="plandir-right-col" style="display: none;">
                <div id="plandir-card-container">
                  <div class="plandir-main-card sl-163">
                    <div class="plandir-card-title red-variant">ELEMENTOS ESCALADOS</div>
                    <table class="plandir-side-table">
                      <thead>
                        <tr>
                          <th class="sl-164">Nº Int.</th>
                          <th class="sl-165">Patente</th>
                          <th class="sl-166">Nome</th>
                        </tr>
                      </thead>
                      <tbody id="plandir-side-tbody"></tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="major-card-footer"></div>
        </div>

`,
      'page-inocrepc': `

      <div class="major-card major-last-card slx">
        <div class="major-card-header">
          <svg class="sl-13" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="1" y="10" width="22" height="10" rx="2" ry="2"/>
            <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/>
            <circle cx="7" cy="20" r="2"/>
            <circle cx="17" cy="20" r="2"/>
            <line x1="7" y1="10" x2="7" y2="14"/>
            <line x1="12" y1="10" x2="12" y2="14"/>
            <line x1="17" y1="10" x2="17" y2="14"/>
          </svg>
          SITUAÇÃO OPERACIONAL DE VEÍCULOS (CREPC)
        </div>
        <div class="major-card-body">
          <div class="major-row sl-85" style="display: flex;">
            <div class="options-main-card sl-86" style="display: flex;">
              <label class="sl-15">Selecione uma Opção</label>
              <div class="action-buttons sl-121" id="inop-action-buttons">
                <button class="btn btn-add options-btn oldinop sl-18">EM CURSO</button>
                <button class="btn btn-add options-btn sl-18" id="NewInopBtn">NOVA</button>
              </div>
            </div>
          </div>
          <div id="inopsTableContainer" style="display: none; margin-top: 0;">
            <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Inoperacionalidades em curso</div>
            <div class="table-container slx-tbl slx-scroll">
              <table id="inopsTable">
                <thead>
                  <tr>
                    <th style="width:110px">Veículo</th>
                    <th style="width:130px">GDH INOP</th>
                    <th style="width:110px">Há</th>
                    <th style="width:150px">Tipo de avaria</th>
                    <th>Descrição da avaria</th>
                    <th style="width:150px">OPTEL</th>
                    <th style="width:200px"></th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div></section>
          </div>
          <div id="sitop_container" style="display: none; margin-top: 0;">
            <div class="major-card-header slx-sub">INSERÇÃO DE NOVA INOPERACIONALIDADE</div>
            <div class="slx-lay"><div class="slx-main">
              <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Veículo</div><div class="slx-grid slx-in-veh"><div class="slx-f"><label for="sitop_cb">Corpo de Bombeiros</label><select id="sitop_cb" class="slx-in">
                      <option>0801 - Companhia Sapadores de Faro</option>
                      <option>0802 - Corpo de Bombeiros de Lagos</option>
                      <option>0803 - Companhia Sapadores de Tavira</option>
                      <option>0804 - Corpo de Bombeiros de Vila Real de Sto. António e Castro Marim</option>
                      <option>0805 - Corpo de Bombeiros de Faro - Cruz Lusa</option>
                      <option>0806 - Corpo de Bombeiros de de Silves</option>
                      <option>0807 - Corpo de Bombeiros de Portimão</option>
                      <option>0808 - Corpo de Bombeiros Municipais de Loulé</option>
                      <option>0809 - Corpo de Bombeiros de São Brás de Alportel</option>
                      <option>0810 - Corpo de Bombeiros Municipais de Olhão</option>
                      <option>0811 - Corpo de Bombeiros de Monchique</option>
                      <option>0812 - Corpo de Bombeiros de Aljezur</option>
                      <option>0813 - Corpo de Bombeiros de São Bartolomeu de Messines</option>
                      <option>0814 - Corpo de Bombeiros de Albufeira</option>
                      <option>0815 - Corpo de Bombeiros de Lagoa</option>
                      <option>0816 - Corpo de Bombeiros de Vila do Bispo</option>
                      <option>0817 - Corpo de Bombeiros de Alcoutim</option>
                    </select></div><div class="slx-f"><label for="sitop_veíc">Veículo</label><select id="sitop_veíc" class="slx-in"></select></div><div class="slx-f"><label for="sitop_veíc_registration">Matrícula</label><input type="text" id="sitop_veíc_registration" class="slx-in" readonly tabindex="-1"></div><input type="text" id="sitop_gdh_inop" style="display: none;" readonly tabindex="-1"><input type="text" id="sitop_gdh_op" style="display: none;" readonly tabindex="-1"></div></section>
              <section class="slx-box"><div class="slx-bh"><span class="slx-n">2</span>Avaria</div><div class="slx-grid slx-in-av"><div class="slx-f"><label for="sitop_veíc_date">Data</label><input type="date" id="sitop_veíc_date" class="slx-in"></div><div class="slx-f"><label for="sitop_veíc_hour">Hora</label><input type="time" id="sitop_veíc_hour" class="slx-in"></div><div class="slx-f"><label for="sitop_type_failure">Tipo de avaria</label><select id="sitop_type_failure" class="slx-in"></select></div><div class="slx-f"><label for="sitop_failure_description">Descrição da avaria</label><input type="text" id="sitop_failure_description" class="slx-in"></div><div class="slx-f"><label for="sitop_failure_noc">NOC</label><input type="text" id="sitop_failure_noc" class="slx-in"></div></div></section>
              <div class="slx-two2">
                <section class="slx-box"><div class="slx-bh"><span class="slx-n">3</span>Faz parte de algum PPI?</div><div class="slx-ppi"><div class="slx-seg"><label><input type="checkbox" id="ppi_yes">Sim</label><label><input type="checkbox" id="ppi_no">Não</label></div><label class="slx-chip2"><input type="checkbox" id="ppi_airport">Aeroporto</label><label class="slx-chip2"><input type="checkbox" id="ppi_a22">A22</label><label class="slx-chip2"><input type="checkbox" id="ppi_a2">A2</label><label class="slx-chip2"><input type="checkbox" id="ppi_linfer">Linha Férrea do Algarve</label><label class="slx-chip2"><input type="checkbox" id="ppi_airfield">Aeródromo Portimão</label></div></section>
                <section class="slx-box"><div class="slx-bh"><span class="slx-n">4</span>Substituição e OPTEL</div><div class="slx-grid slx-in-sub"><div class="slx-f"><label>Veículo similar?</label><div class="slx-seg"><label><input type="checkbox" id="ppi_subs_yes">Sim</label><label><input type="checkbox" id="ppi_subs_no">Não</label></div></div><div class="slx-f"><label for="sitop_optel">OPTEL</label><input type="text" id="sitop_optel" class="slx-in"></div></div></section>
              </div>
            </div>
            <aside class="slx-sum"><div class="slx-sum-k">Resumo do envio</div><pre class="slx-prev" id="sitop-prev"></pre><p class="slx-sum-p">Vai por email, com o formulário em PDF, para os destinatários do Centro de Dados.</p></aside></div>
            <div class="slx-foot"><button class="btn btn-danger" id="saveBtn">Emitir Inoperacionalidade</button></div>
          </div>
        </div>
        <div class="major-card-footer"></div>
      </div>

`,
      'page-hemodialysis': `

      <div class="major-card slx slx-hemo">
        <div class="major-card-header sl-184" style="display: flex;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            <polyline points="22 12 18 12 15 19 9 5 6 12 2 12"/>
          </svg>
          UTENTES DE HEMODIÁLISE
        </div>
        <div class="major-card-body">
          <div class="major-row sl-85" style="display: flex;">
            <div class="options-main-card sl-86" style="display: flex;">
              <label class="sl-15">Selecione uma Opção</label>
              <div class="action-buttons" id="docs-crepc" style="gap: 5px;">
                <button id="HemoWeekList" class="btn btn-add options-btn sl-185">Listagem Semanal</button>
                <button id="HemoWAdresses" class="btn btn-add options-btn sl-185">Utentes</button>
                <button id="HemoOther" class="btn btn-add options-btn sl-185" onclick="showbreve()">Outros</button>
              </div>
            </div>
          </div>          
          <div id="hemo-utentdata-card" style="display: none; margin-top: 20px;">
            <div class="options-main-card">
              <h3 class="sl-186">
               DADOS DO UTENTE
              </h3>
              <div class="major-field sl-32">
                <label class="sl-33">Nome do Utente:</label>
                <input class="sl-187" type="text" id="utent_h_name">
                <label class="sl-33">Nr. de Utente:</label>
                <input class="sl-38" type="text" id="utent_h_nr">
              </div>
              <div class="major-field sl-188">
                <label class="sl-33">Morada do Utente:</label>
                <input class="sl-189" type="text" id="utent_h_adress">
                <label class="sl-33">Localidade:</label>
                <input class="sl-190" type="text" id="utent_h_localitie">
              </div>
              <div class="major-field sl-188">
                <label class="sl-33">Contactos:</label>
                <input class="sl-120" type="text" id="utent_h_contacts">
              </div>
              <div class="major-field sl-188">
                <label class="sl-33">Dias Tratamento:</label>
                <div class="sl-191" style="display: inline-block;">
                  <div id="utent_h_treatment_days_btn" onclick="toggleDaysDropdown()"
                       style="width: 200px; padding: 4px 8px; border: 1px solid #ccc; border-radius: 3px; cursor: pointer; background: #fff; font-size: 13px; min-height: 28px;">
                    Selecionar dias...
                  </div>
                  <div id="utent_h_treatment_days_dropdown" style="display: none; position: absolute; z-index: 999; background: #fff; border: 1px solid #ccc; border-radius: 4px; 
                                                                   padding: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); min-width: 160px; text-align: left;">
                    <label class="sl-192" style="display: flex;">
                      <input class="sl-193" type="checkbox" value="SEG">Segunda</label>
                    <label class="sl-192" style="display: flex;">
                      <input class="sl-193" type="checkbox" value="TER">Terça</label>
                    <label class="sl-192" style="display: flex;">
                      <input class="sl-193" type="checkbox" value="QUA">Quarta</label>
                    <label class="sl-192" style="display: flex;">
                      <input class="sl-193" type="checkbox" value="QUI">Quinta</label>
                    <label class="sl-192" style="display: flex;">
                      <input class="sl-193" type="checkbox" value="SEX">Sexta</label>
                    <label class="sl-192" style="display: flex;">
                      <input class="sl-193" type="checkbox" value="SAB">Sábado</label>
                  </div>
                </div>
                <label class="sl-33">Turno Tratamento:</label>
                <select class="sl-38" id="utent_h_treatment_sift">
                  <option></option>
                  <option>07:00-12:00</option>
                  <option>11:00-17:00</option>
                  <option>16:00-23:00</option>
                </select>
                <label class="sl-33">Local Tratamento:</label>
                <select class="sl-27" id="utent_h_treatment_local">
                  <option></option>
                  <option>ULSA Faro</option>
                  <option>Nephrocare Faro</option>
                  <option>Outro</option>
                </select>
                <label class="sl-33">Posição:</label>
                <select class="sl-27" id="utent_h_treatment_position">
                  <option></option>
                  <option>Sentado</option>
                  <option>Deitado</option>
                  <option>Cadeira de Rodas</option>
                </select>
              </div>
              <div class="major-field sl-194">
                <button id="utent_h_save" class="btn btn-add"><i class="fa-solid fa-floppy-disk"></i> GRAVAR</button> 
              </div>
            </div>
          </div>
          <div id="hemo-utentlist-card" style="display: none; margin-top: 20px;">
            <div class="options-main-card">
              <h3 class="sl-186">
                LISTAGEM DE UTENTES
              </h3>
              <div class="hemo-scroll sl-195">
                <table class="sl-143">
                  <thead class="sl-196">
                    <tr class="sl-197">
                      <th class="sl-198">Nome</th>
                      <th class="sl-198">Morada</th>
                      <th class="sl-198">Localidade</th>
                      <th class="sl-198">Contacto</th>
                      <th class="sl-198">Nr. Benif.</th>
                      <th class="sl-198">Destino</th>
                      <th class="sl-198">Dias</th>
                      <th class="sl-198">Turno</th>
                      <th class="sl-198">Posição</th>
                      <th class="sl-199">Ações</th>
                    </tr>
                  </thead>
                  <tbody id="hemo-utentlist-tbody">
                    <tr><td class="sl-200" colspan="9">Sem registos</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div id="hemo-week-cards" style="display: none; margin-top: 20px;">
            <div class="major-row sl-201" style="display: flex;">
              <div class="options-main-card sl-202" style="display: flex;">
                <div class="sl-203">
                  Segundas / Quartas / Sextas
                </div>
                <div class="sl-204" style="display: flex;">
                  <div>
                    <div class="sl-205">
                      07:00 — 12:00
                    </div>
                    <table class="sl-143">
                      <thead>
                        <tr class="sl-206">
                          <th class="sl-207">Nome</th>
                          <th class="sl-208">Origem</th>
                          <th class="sl-209">Destino</th>
                        </tr>
                      </thead>
                      <tbody id="hemo-sqx-0700">
                        <tr><td class="sl-200" colspan="3">Sem registos</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div class="sl-205">
                      11:00 — 17:00
                    </div>
                    <table class="sl-143">
                      <thead>
                        <tr class="sl-206">
                          <th class="sl-207">Nome</th>
                          <th class="sl-208">Origem</th>
                          <th class="sl-209">Destino</th>
                        </tr>
                      </thead>
                      <tbody id="hemo-sqx-1100">
                        <tr><td class="sl-200" colspan="3">Sem registos</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div class="sl-205">
                      16:00 — 23:00
                    </div>
                    <table class="sl-143">
                      <thead>
                        <tr class="sl-206">
                          <th class="sl-207">Nome</th>
                          <th class="sl-208">Origem</th>
                          <th class="sl-209">Destino</th>
                        </tr>
                      </thead>
                      <tbody id="hemo-sqx-1600">
                        <tr><td class="sl-200" colspan="3">Sem registos</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="options-main-card sl-210" style="display: flex;">
                <div class="sl-203">
                  Terças / Quintas / Sábados
                </div>
                <div class="sl-204" style="display: flex;">
                  <div>
                    <div class="sl-211">
                      07:00 — 12:00
                    </div>
                    <table class="sl-143">
                      <thead>
                        <tr class="sl-206">
                          <th class="sl-207">Nome</th>
                          <th class="sl-208">Origem</th>
                          <th class="sl-209">Destino</th>
                        </tr>
                      </thead>
                      <tbody id="hemo-tqs-0700">
                        <tr><td class="sl-200" colspan="3">Sem registos</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div class="sl-211">
                      11:00 — 17:00
                    </div>
                    <table class="sl-143">
                      <thead>
                        <tr class="sl-206">
                          <th class="sl-207">Nome</th>
                          <th class="sl-208">Origem</th>
                          <th class="sl-209">Destino</th>
                        </tr>
                      </thead>
                      <tbody id="hemo-tqs-1100">
                        <tr><td class="sl-200" colspan="3">Sem registos</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div class="sl-211">
                      16:00 — 23:00
                    </div>
                    <table class="sl-143">
                      <thead>
                        <tr class="sl-206">
                          <th class="sl-207">Nome</th>
                          <th class="sl-208">Origem</th>
                          <th class="sl-209">Destino</th>
                        </tr>
                      </thead>
                      <tbody id="hemo-tqs-1600">
                        <tr><td class="sl-200" colspan="3">Sem registos</td></tr>                        
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="major-card-footer">
          <div id="hemodialysis-options" style="display: none; justify-content: flex-end; gap: 10px;">            
            <button id="hemodialysis-emit" class="btn btn-danger"><i class="fa-solid fa-file-lines"></i> EMITIR LISTAGEM</button> 
          </div>
        </div>
      </div>

`,
      'page-material-request': `

      <div class="major-card slx ">
        <div class="major-card-header slx-head">
          <svg class="sl-212" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
          REQUISIÇÃO DE EQUIPAMENTOS
        </div>
        <div class="major-card-body">
          <div class="slx-two"><section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Requisitante</div><div class="slx-grid slx-g3"><div class="slx-f slx-s3"><label for="requesting_name">Nome do requisitante</label><input type="text" id="requesting_name" class="slx-in"></div><div class="slx-f slx-s2"><label for="requesting_cc">BI / CC / Passaporte</label><div class="slx-cc"><input type="text" id="requesting_cc" class="slx-in"><span>-</span><input type="text" id="requesting_cc_secur" class="slx-in"></div></div><div class="slx-f"><label for="requesting_contact">Contacto</label><input type="text" id="requesting_contact" class="slx-in"></div></div></section><section class="slx-box"><div class="slx-bh"><span class="slx-n">2</span>Equipamento</div><div class="slx-grid slx-g4"><div class="slx-f slx-s4"><label for="requesting_equipment">Equipamento(s) requisitado(s)</label><input type="text" id="requesting_equipment" class="slx-in"></div><div class="slx-f"><label for="delivery_date">Data de entrega</label><input type="date" id="delivery_date" class="slx-in"></div><div class="slx-f"><label for="return_estimate">Previsão de devolução</label><input type="date" id="return_estimate" class="slx-in"></div><div class="slx-f"><label for="autoryzed_by">Autorizado por</label><input type="text" id="autoryzed_by" class="slx-in"></div><div class="slx-f"><label for="optel">OPTEL</label><input type="text" id="optel" class="slx-in"></div></div></section><section class="slx-box"><div class="slx-bh"><span class="slx-n">3</span>Devolução</div><div class="slx-grid slx-g1"><div class="slx-f"><label for="return_date">Data de devolução</label><input type="date" id="return_date" class="slx-in"></div><div class="slx-f"><label for="return_status">Estado</label><input type="text" id="return_status" class="slx-in"></div></div></section></div><section class="slx-box"><div class="slx-bh"><span class="slx-n">4</span>Requisições de equipamentos</div><div class="sl-195 slx-tbl">
                <table class="sl-143">
                  <thead><tr><th>Nome</th><th>BI/CC</th><th>Contacto</th><th>Equipamento(s)</th><th>Entrega</th><th>Prev. devolução</th><th>Autorizado por</th><th>Estado</th><th style="width:90px">Ações</th></tr></thead>
                  <tbody id="equipment-request-tbody">
                    <tr><td class="sl-221" colspan="9">Sem registos</td></tr>
                  </tbody>
                </table>
              </div></section>
        </div>
        <div class="major-card-footer"><div class="sl-222" id="equipment-request-options">
            <button id="equipment-request-save" class="btn btn-add"><i class="fa-solid fa-floppy-disk"></i> GRAVAR</button>
            <button id="equipment-request-emit" class="btn btn-danger" disabled><i class="fa-solid fa-file-lines"></i> EMITIR</button>
          </div></div>
      </div>

`,
      'page-fleet-cards': `

      <div class="major-card slx ">
        <div class="major-card-header slx-head">
          <svg class="sl-212" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
            <path d="M3 22h12"/>
            <path d="M15 8h2a2 2 0 0 1 2 2v6a1 1 0 0 0 2 0v-7l-2-3"/>
            <line x1="7" y1="10" x2="11" y2="10"/>
          </svg>
          CARTÕES FROTA
        </div>
        <div class="major-card-body">
          <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Cartão frota</div><div class="slx-grid slx-g4"><div class="slx-f"><label for="veíc_card_name">Veículo</label><input type="text" id="veíc_card_name" class="slx-in"></div><div class="slx-f"><label for="veíc_card_register">Matrícula</label><input type="text" id="veíc_card_register" class="slx-in"></div><div class="slx-f"><label for="veíc_card_code">Código do cartão</label><input type="text" id="veíc_card_code" class="slx-in"></div><div class="slx-f"><label for="veíc_card_contact">Telemóvel</label><input type="text" id="veíc_card_contact" class="slx-in"></div></div></section><section class="slx-box"><div class="slx-bh"><span class="slx-n">2</span>Cartões frota<div class="slx-tools"><span class="slx-chip">Total <b id="fleet-total">0</b></span><span class="slx-chip slx-ok">Operacionais <b id="fleet-operacional">0</b></span><span class="slx-chip slx-bad">Inoperacionais <b id="fleet-inoperacional">0</b></span></div></div><div class="sl-195 slx-tbl">
                <table class="sl-143">
                  <thead><tr><th>Veículo</th><th>Matrícula</th><th>Código cartão</th><th>Contacto</th><th>Estado</th><th style="width:90px">Ações</th></tr></thead>
                  <tbody id="fleet-cards-tbody">
                    <tr><td class="sl-200" colspan="5">Sem registos</td></tr>
                  </tbody>
                </table>
              </div></section>
        </div>
        <div class="major-card-footer"><div class="sl-222" id="card-fleet-options">
            <button id="card-fleet-save" class="btn btn-add"><i class="fa-solid fa-floppy-disk"></i> GRAVAR</button>
            <button id="card-fleet-emit" class="btn btn-danger"><i class="fa-solid fa-file-lines"></i> EMITIR</button>
          </div></div>
      </div>

`,
      'page-contact-list': `

      <div class="major-card slx ">
        <div class="major-card-header slx-head">
          <svg class="sl-212" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          LISTA DE CONTACTOS
        </div>
        <div class="major-card-body">
          <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Contactos internos<div class="slx-tools"><input type="search" id="contact-list-search" class="slx-in slx-search" placeholder="Pesquisar nº, patente ou nome..."></div></div><div class="slx-chips">
            <span class="slx-chip slx-dark">Total <b id="contact-total">0</b></span>
            <span class="slx-chip" style="--c:#c62828">Q. Comando <b id="contact-qcom">0</b></span>
            <span class="slx-chip" style="--c:#1565c0">Q. Ativo <b id="contact-qativ">0</b></span>
            <span class="slx-chip" style="--c:#ef6c00">Q. Estagiários <b id="contact-qest">0</b></span>
            <span class="slx-chip" style="--c:#2e7d32">Q. Espec./Aux. <b id="contact-qea">0</b></span>
            <span class="slx-chip" style="--c:#6a1b9a">Q. Reserva <b id="contact-qres">0</b></span>
            <span class="slx-chip" style="--c:#546e7a">Q. Honra <b id="contact-qhr">0</b></span>
          </div>
          <div class="sl-195 slx-tbl">
              <table class="sl-143">
                <thead><tr><th style="width:70px">Nº Int.</th><th style="width:110px">Patente</th><th>Nome completo</th><th>Telefone</th><th>Telemóvel</th><th>Email</th><th colspan="2" style="width:170px">Ações</th></tr></thead>
                <tbody id="contact-list-tbody">
                  <tr><td class="sl-234" colspan="8">Sem registos</td></tr>
                </tbody>
              </table>
            </div></section>
        </div>
        <div class="major-card-footer"><div class="sl-222" style="display: flex;">
            <button id="contact-list-selected-email" class="btn btn-add" disabled style="opacity:0.4; cursor:not-allowed;"><i class="fa-solid fa-envelope"></i> Enviar para Selecionados (<span id="contact-selected-count">0</span>)</button>
            <button id="contact-list-global-email" class="btn btn-danger"><i class="fa-solid fa-envelope"></i> Enviar para Todos</button>
            <button id="contact-list-emit" class="btn btn-success"><i class="fa-solid fa-print"></i> Emitir Listagem</button>
          </div></div>
      </div>

`,
      'page-attendance-list': `

      <div class="major-card slx ">
        <div class="major-card-header slx-head">
          <svg class="sl-212" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="8" y1="14" x2="8.01" y2="14"/>
            <line x1="12" y1="14" x2="12.01" y2="14"/>
            <line x1="16" y1="14" x2="16.01" y2="14"/>
          </svg>
          LISTA DE COMPARÊNCIAS EM EVENTOS
        </div>
        <div class="major-card-body">
          <section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Evento</div><div class="slx-grid slx-g2"><div class="slx-f"><label for="attendance-event-name">Nome do evento</label><input type="text" id="attendance-event-name" class="slx-in"></div><div class="slx-f"><label for="attendance-recent-events">Eventos recentes</label><select id="attendance-recent-events" class="slx-in"><option></option></select></div></div></section><section class="slx-box"><div class="slx-bh"><span class="slx-n">2</span>Listagem<div class="slx-tools"><span class="slx-chip slx-dark">Contactados <b id="contact-attendance-total">0</b></span><span class="slx-chip slx-ok">Comparece <b id="contact-attendance">0</b></span><span class="slx-chip slx-bad">Não comparece <b id="contact-noattendance">0</b></span></div></div><div class="sl-195 slx-tbl">
              <table class="sl-143">
                <thead><tr><th style="width:70px">Nº Int.</th><th style="width:110px">Patente</th><th>Nome completo</th><th>Telefone</th><th>Telemóvel</th><th colspan="2" style="width:170px">Comparência</th><th>Motivo de falta</th></tr></thead>
                <tbody id="attendance-list-tbody">
                  <tr><td class="sl-234" colspan="8">Sem registos</td></tr>
                </tbody>
              </table>
            </div></section>
        </div>
        <div class="major-card-footer"><div class="sl-222" style="display: flex;">
            <button id="attendance-list-save" class="btn btn-add"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
            <button id="attendance-list-delete" class="btn btn-danger"><i class="fa-solid fa-trash-can"></i> Eliminar</button>
            <button id="attendance-list-emit" class="btn btn-success"><i class="fa-solid fa-print"></i> Emitir Listagem</button>
          </div></div>
      </div>

`,
      'page-phonebook': `

      <div class="major-card slx ">
        <div class="major-card-header slx-head">
          <svg class="sl-212" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l1.88-1.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          AGENDA TELEFÓNICA
        </div>
        <div class="major-card-body">
          <section class="slx-box" id="phonebook-form-container" style="display: none;"><div class="slx-bh"><span class="slx-n"><i class="fa-solid fa-pen"></i></span>Dados do contacto / entidade</div><div class="slx-grid slx-g6"><div class="slx-f slx-s2"><label for="phonebook-name">Nome / designação</label><input type="text" id="phonebook-name" class="slx-in"></div><div class="slx-f"><label for="phonebook-type">Tipo</label><select id="phonebook-type" class="slx-in"><option value="">Selecionar...</option><option value="Pessoa">Pessoa</option><option value="Entidade">Entidade</option><option value="Serviço">Serviço</option></select></div><div class="slx-f"><label for="phonebook-category">Categoria</label><select id="phonebook-category" class="slx-in"><option value="">Selecionar...</option><option value="Bombeiros">Bombeiros</option><option value="GNR">GNR</option><option value="PSP">PSP</option><option value="INEM">INEM</option><option value="Câmara">Câmara</option><option value="Hospital">Hospital</option><option value="Outros">Outros</option></select></div><div class="slx-f"><label for="phonebook-subcategory">Subcategoria</label><input type="text" id="phonebook-subcategory" class="slx-in"></div><div class="slx-f"><label for="phonebook-availability">Disponibilidade</label><select id="phonebook-availability" class="slx-in"><option value="">Selecionar...</option><option value="24h">24 Horas</option><option value="Laboral">Horário Laboral</option><option value="Outro">Outro</option></select></div><div class="slx-f"><label for="phonebook-phone">Telefone</label><input type="text" id="phonebook-phone" class="slx-in"></div><div class="slx-f"><label for="phonebook-mobile">Telemóvel</label><input type="text" id="phonebook-mobile" class="slx-in"></div><div class="slx-f slx-s2"><label for="phonebook-email">Email</label><input type="text" id="phonebook-email" class="slx-in"></div><div class="slx-f slx-s2"><label>&nbsp;</label><label class="slx-fav" for="phonebook-favorite"><input type="checkbox" id="phonebook-favorite"> <i class="fa-solid fa-star" style="color:#f5b301"></i> Favorito</label></div><div class="slx-f slx-s2"><label for="phonebook-address">Morada</label><input type="text" id="phonebook-address" class="slx-in"></div><div class="slx-f"><label for="phonebook-locality">Localidade</label><input type="text" id="phonebook-locality" class="slx-in"></div><div class="slx-f"><label for="phonebook-zipcode">Cód. postal</label><input type="text" id="phonebook-zipcode" class="slx-in" placeholder="0000-000"></div><div class="slx-f slx-s2"><label for="phonebook-notes">Notas</label><input type="text" id="phonebook-notes" class="slx-in"></div><div class="slx-act slx-s6"><button id="phonebook-save" class="btn btn-success"><i class="fa-solid fa-floppy-disk"></i> GRAVAR</button></div></div></section><section class="slx-box"><div class="slx-bh"><span class="slx-n">1</span>Entidades<div class="slx-tools"><span class="slx-chip slx-dark">Total <b id="phonebook-total">0</b></span><span class="slx-chip" style="--c:#f9a825"><i class="fa-solid fa-star" style="color:#f5b301"></i> Favoritos <b id="phonebook-favorites">0</b></span><input type="search" id="phonebook-search" class="slx-in slx-search" placeholder="Nome, categoria, telefone..."><button id="phonebook-add" class="btn btn-add"><i class="fa-solid fa-plus"></i> ADICIONAR</button></div></div><div class="sl-195 slx-tbl">
                <table class="sl-143">
                  <thead><tr><th style="width:50px">Fav.</th><th>Nome / designação</th><th>Tipo</th><th>Categoria</th><th>Telefone</th><th>Telemóvel</th><th>Email</th><th>Disponibilidade</th><th style="width:90px">Ações</th></tr></thead>
                  <tbody id="phonebook-tbody">
                    <tr><td class="sl-200" colspan="9">Sem registos</td></tr>
                  </tbody>
                </table>
              </div></section>
        </div>
        <div class="major-card-footer"><div class="sl-222" style="display: flex;">
            <button id="phonebook-delete" class="btn btn-danger" style="display: none;" disabled><i class="fa-solid fa-trash-can"></i> ELIMINAR</button>
            <button id="phonebook-emit" class="btn btn-danger"><i class="fa-solid fa-file-lines"></i> EMITIR</button>
          </div></div>
      </div>

`,
      'page-alarm-console': `

      <div class="major-card slx slx-ac">
        <div class="major-card-header sl-184" style="display: flex;">
          <svg class="sl-212" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 12L19 7.5"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
          </svg>
          CONSOLA DE ALARMES INTERNA
        </div>
        <div class="major-card-body">
          <div class="grid-2fr sl-255" style="display: grid;">
            <div class="options-main-card sl-256" id="cons-indiv" style="display: flex;">
              <h3 class="sl-257">CHAMADA INDIVIDUAL</h3>
              <label class="sl-258">Selecione o Local de Destino:</label>
              <div class="action-buttons sl-259" id="alarm-console-indiv" style="display: flex;">
                <button id="ca-indiv-pv"  class="btn btn-add sl-260">Parque Viaturas</button>
                <button id="ca-indiv-cc"  class="btn btn-add sl-260">Contacto Central</button>
                <button id="ca-indiv-sb"  class="btn btn-add sl-260">Sala Bombeiro</button>
                <button id="ca-indiv-gch" class="btn btn-add sl-260">Gabinete Chefes</button>
                <button id="ca-indiv-gcm" class="btn btn-add sl-260">Gabinete Comando</button>
              </div>
              <div class="major-field sl-261" style="display: flex;">
                <label class="sl-214">Elemento:</label>
                <select id="ca-indiv-catch" style="flex-grow: 1; height: 32px; background: #1b1e22; border: 1px solid #333; color: white; border-radius: 6px; padding: 0 10px;"></select>
              </div>
              <button id="ca-call-indiv" class="btn btn-success sl-262">INICIAR CHAMADA</button>
            </div>
            <div class="options-main-card sl-256" id="cons-group" style="display: flex;">
              <h3 class="sl-257">CHAMADA DE GRUPO</h3>
              <label class="sl-258">Selecione o Local de Destino:</label>
              <div class="action-buttons sl-259" id="alarm-console-group" style="display: flex;">
                <button id="ca-glob-pv"  class="btn btn-add sl-260">Parque Viaturas</button>
                <button id="ca-glob-sb"  class="btn btn-add sl-260">Sala Bombeiro</button>
                <button id="ca-glob-sn"  class="btn btn-add sl-260">Salão Nobre</button>
                <button id="ca-glob-gch" class="btn btn-add sl-260">Gabinete Chefes</button>
                <button id="ca-glob-gcm" class="btn btn-add sl-260">Gabinete Comando</button>
              </div>
              <div class="major-field sl-261" style="display: flex;">
                <label class="sl-214">Grupo:</label>
                <select class="sl-263" id="ca-group-catch">
                  <option>&nbsp;</option>
                  <option>Elementos de Serviço</option>
                  <option>EIP</option>
                </select>
              </div>
              <button id="ca-call-group" class="btn btn-success sl-262">INICIAR CHAMADA</button>
            </div>
          </div>
          <div class="options-main-card sl-264" id="cons-internal" style="display: flex;">
            <h3 class="sl-265">ALARMES INTERNOS</h3>
            <div class="action-buttons sl-266" style="display: flex;">
              <button id="ca-format" class="btn btn-add sl-267">FORMATURA</button>
              <button id="ca-alvor" class="btn btn-add sl-267">ALVORADA</button>
            </div>
          </div>
        </div>
        <div class="major-card-footer sl-268"></div>
      </div>

`
    };
    Object.entries(PAGES).forEach(([id, html]) => { const p = document.getElementById(id); if (p) p.innerHTML = html; });
    /* popups deste módulo (antes no main.html): entram antes do #popup-maininfo, como estavam */
    const addPopup = html => {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      const ref = document.getElementById('popup-maininfo');
      if (ref) ref.before(t.content); else document.body.appendChild(t.content);
    };
    addPopup(`
    <div id="popup-service-type-modal" class="popup-modal popup-warning" tabindex="0">
      <div class="popup-content" style="min-width: 450px;">
        <div class="popup-header"><h3><i class="fa-solid fa-triangle-exclamation"></i> TIPO DE SERVIÇO</h3></div>
        <div class="popup-body">
          <ul style="list-style:none; padding:0; margin:0;">
            <li style="list-style:none; margin-bottom: 8px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer !important;">
                <input type="radio" name="popup-service-type" value="Extra" style="cursor:pointer !important;"> Extra
              </label>
            </li>
            <li style="list-style:none; margin-bottom: 8px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer !important;">
                <input type="radio" name="popup-service-type" value="Reforço" style="cursor:pointer !important;"> Reforço
              </label>
            </li>
            <li style="list-style:none; margin-bottom: 8px; display:flex; align-items:center; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer !important; white-space:nowrap;">
                <input type="radio" name="popup-service-type" value="Troca de Serviço" style="cursor:pointer !important;"> Troca de Serviço
              </label>
              <div id="service-swap-fields" style="display:none; align-items:center; gap:8px;">
                <label style="white-space:nowrap; line-height:1; display:flex; align-items:center;">| Nº Int.</label>
                <input type="text" id="service-swap-nint" style="width:50px; padding:4px 6px; border:1px solid #dee2e6; border-radius:4px; font-size:0.85em; text-align:center;">
                <input type="text" id="service-swap-name" style="width:175px; padding:4px 6px; border:1px solid #dee2e6; border-radius:4px; font-size:0.85em;" readonly disabled>
              </div>
            </li>
            <li style="list-style:none; display:flex; align-items:center; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer !important; white-space:nowrap;">
                <input type="radio" name="popup-service-type" value="Outro" style="cursor:pointer !important;"> Outro
              </label>
              <div id="service-other-fields" style="display:none; align-items:center; gap:8px;">
                <input type="text" id="service-other-text" style="width:250px; padding:4px 6px; border:1px solid #dee2e6; border-radius:4px; font-size:0.85em;">
              </div>
            </li>
          </ul>
        </div>
        <div class="popup-footer" style="gap: 10px;">
          <button id="popup-service-type-ok-btn" class="popup-btn" style="background-color: #FD7E14;">Confirmar</button>
          <button id="popup-service-type-cancel-btn" class="popup-btn" style="background-color: #6C757D;">Cancelar</button>
        </div>
      </div>
    </div>
    `);
    addPopup(`
    <div id="popup-hemodialysis-type-modal" class="popup-modal popup-superdanger">
      <div class="popup-content">
        <div class="popup-header">
          <div class="header-content" style="display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 850; letter-spacing: 1px;">TIPO DE FORMULÁRIO</h3>
          </div>
        </div>
        <div class="popup-body">
          <ul style="list-style:none; padding:0; margin:0;">
            <li style="list-style:none; margin-bottom: 12px; display:flex; justify-content:center; gap:30px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="radio" name="popup-hemos-type" value="SALOC" style="cursor:pointer !important;">
                SALOC
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="radio" name="popup-hemos-type" value="Veículos" style="cursor:pointer !important;">
                Veículos
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="radio" name="popup-hemos-type" value="Ambos" style="cursor:pointer !important;">
                Ambos
              </label>
            </li>
          </ul>
        </div>
        <div class="popup-footer" style="gap: 10px;">
          <button id="popup-hemos-type-ok-btn" class="popup-btn">Confirmar</button>
          <button id="popup-hemos-type-cancel-btn" class="popup-btn" style="background-color: #6C757D;">Cancelar</button>
        </div>
      </div>
    </div>
    `);
    })();
    /* ------------------------- fim da construção ------------------------- */
    /* ================================
    SALOC 360
    ================================ */
    /* =======================================
    PPI MODULE
    ======================================= */
    /* ─── STYLE CONSTANTS ────────────────────────────────────── */
    const HIGHLIGHT_WORDS = [`Rede Nacional de Áreas Protegidas`,`Rede Natura 2000`,`Linha de Média Tensão`,`áreas de declives acentuados`, `Passagem Superior`,`linhas de média e alta tensão`,
                             `linhas de média tensão`,`atravessa curso de água navegável`, `atravessa curso de água e pontos de água`,`outros compromissos internacionais`,`ALARME ESPECIAL`,
                             `ALARME CONDICIONADO`, `Troço com grandes limitações no acesso a meios terrestres, deverá ser avaliada a necessidade de mobilizar meios suplementares táticos (4x4).`];
    const A22_TITLE_STYLE_UP = `font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%);  color: #1e293b; font-weight: 850; 
                                font-size: 13px; text-transform: uppercase; letter-spacing: 1px; width: 100%; max-width: 1572px; height: 26px; display: flex; justify-content: center; align-items: center; 
                                margin: 0 auto; border: 1px solid #94a3b8; border-bottom: none; border-radius: 8px 8px 0 0; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8); 
                                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), -2px 0 5px -2px rgba(0,0,0,0.1), 2px 0 5px -2px rgba(0,0,0,0.1);`;
    const A22_TITLE_STYLE_DOWN = `font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%); color: #334155; font-weight: 600; 
                                  font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; width: 100%; max-width: 1572px; height: 22px; display: flex; justify-content: center; align-items: center; 
                                  margin: 0 auto; border: 1px solid #94a3b8; border-top: none; border-radius: 0 0 8px 8px; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
                                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), -2px 0 5px -2px rgba(0,0,0,0.1), 2px 0 5px -2px rgba(0,0,0,0.1);`;
    const A22_ROW_STYLE = `display: flex; justify-content: flex-start ;margin: 0;`;
    const A22_GRID_BUTTON_STYLE = `margin: 10px 0 5px 0; width: 78px; height: 40px;`;
    const A22_GRID_CONTAINER_STYLE  = `display: flex; flex-direction: column; align-items: center;`;
    const A22_TABLE_STYLE = `width: 100%; table-layout: fixed; border-collapse: collapse; margin: 20px 0 10px;`;
    const A22_CELL_STYLE = `border:1px solid #bbb;padding:5px;font-weight:bold;`;
    const A22_CELL_STYLE_NORMAL = `border: 1px solid #bbb; padding: 5px; font-weight: normal;`;
    const A22_LABEL_CELL_STYLE = `border: 1px solid #bbb; padding: 5px; font-weight: bold;text-align: left;`;
    const A22_DIRECTION_TOP_STYLE = `font-size: 14px;`;
    const A22_DIRECTION_MID_STYLE = `font-weight: bold; font-size: 14px;`;
    const A22_DIRECTION_BOT_STYLE = `font-size: 11px;`;
    const A22_NODE_KM_STYLE = `font-size: 10px;`;
    const INTERVENTION_NOTICE_STYLE = `padding: 10px 14px; margin: 5px 0 -10px 0; border-radius: 5px; text-align: center; font-weight: 700; font-size: 15px;`;
    const FINAL_H_TABLE_STYLE = `width: 100%; margin-top: -5px; border-collapse: collapse;`;
    const FINAL_H_CELL_STYLE = `background-color: navy; color: white; font-weight: bold; text-align: center; width: 80px; line-height: 15px; padding: 5px; border: 1px solid #bbb;`;
    const CUMULATIVE_ALERT_STYLE = `padding: 10px 14px; margin: 5px 0 -5px 0; border-radius: 5px; font-weight: 700; text-align: center; font-size: 15px; color: #842029; background-color: #f8d7da;
                                    border: 1px solid #842029;`;
    const FINAL_H_TEXT_STYLE = `padding: 5px; text-align: left; border: 1px solid #bbb; line-height: 15px;`;
    const AERO_LABEL_STYLE = {fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: "linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%)", color: "#1e293b", fontWeight: "850",
                              fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", textShadow: "0 1px 0 rgba(255, 255, 255, 0.8)", width: "100%", maxWidth: "1065px", height: "36px", display: "flex",
                              alignItems: "center", justifyContent: "center", borderRadius: "6px", border: "1px solid #94a3b8", 
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)", margin: "3px auto 8px auto",};
    const AERO_ROW_STYLE = {display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "5px"};
    const AERO_BUTTON_STYLE = {marginTop: "5px", width: "210px", height: "35px", fontSize: "12px", fontWeight: "bold"};
    const AERO_HEADER_TABLE_STYLE = {width: "100%", margin: "5px 0 0 0", borderCollapse: "separated"};
    const AERO_HEADER_CELL_STYLE = {width: "100%", textAlign: "center", background: "#e7f1ff", color: "#084298", fontWeight: "700", fontSize: "15px", padding: "10px 12px", borderRadius: "6px",
                                    whiteSpace: "pre-line", border: "1px solid #084298"};
    const AERO_INFO_TABLE_STYLE = {width: "100%", margin: "5px 0 5px 0", borderCollapse: "collapse", border: "1px solid #bbb"};
    const AERO_CELL_STYLE = {textAlign: "left", padding: "4px", border: "1px solid #bbb", minHeight: "25px", verticalAlign: "top"};
    const AERO_RESERVA_CELL_STYLE = {textAlign: "center", padding: "4px", border: "1px solid #bbb", backgroundColor: "green", color: "white", fontWeight:"bold"};
    const AERO_ABS_NOTE_STYLE = {width: "100%", margin: "0", borderCollapse: "collapse", lineHeight: "15px", border: "1px solid #bbb"};
    const AERO_B1_TABLE_STYLE = {tableLayout: "fixed", width: "100%", marginBottom: "5px", marginTop: "10px"};
    const AERO_B1_COL_STYLE = ["10%","40%","10%","40%"];
    const AERO_B1_HEADER1_STYLE = {textAlign: "center", padding: "4px", fontWeight: "bold", backgroundColor: "red", color: "white"};
    const AERO_B1_HEADER2_STYLE = {textAlign: "center", padding: "4px", fontSize: "12px", backgroundColor: "#f0f0f0", color:"black"};
    const AERO_B1_WRAPPER_STYLE = {display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px"};
    const AERO_B1_TITLE_DIV_STYLE = {flex: "1", textAlign: "center"};
    const LINFER_TITLE_STYLE = `font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%); color: #1e293b; font-weight: 850;
                                font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8); width: 100%; max-width: 1580px; height: 36px; display: flex;
                                align-items: center; justify-content: center; border-radius: 6px; border: 1px solid #94a3b8; 
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9); margin: 0px auto 8px auto;`;
    const LINFER_ROW_STYLE = `display: flex; justify-content: flex-start; margin: 0;`;
    const LINFER_GRID_BUTTON_STYLE = `margin: 5px 0; width: 93px; height: 40px; font-size: 12px;`;
    const LINFER_DIRECTION_BUTTON_STYLE = `width: 160px; height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-weight: bold;`;
    const LINFER_DIRECTION_TOP_STYLE = `font-size: 14px;`;
    const LINFER_DIRECTION_BOT_STYLE = `font-size: 11px; font-weight: normal;`;
    const LINFER_INPUT_STYLE = `padding: 8px; width: 160px; text-align: center; border: 1px solid #ccc; border-radius: 4px; outline: none; transition: all 0.2s ease;`;
    const LINFER_CARD_STYLE = `display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; width: 400px; margin: 0 auto; margin-bottom: 5px;`;
    const LINFER_TITLE_LABEL_STYLE = `font-size: 16px; font-weight: bold;`;
    const LINFER_TABLE_STYLE = `width: 100%; table-layout: fixed; border-collapse: collapse; margin: 20px 0 10px;`;
    const LINFER_CELL_STYLE = `border: 1px solid #bbb; padding: 5px; font-weight: bold;`;
    const LINFER_CELL_STYLE_NORMAL = `border: 1px solid #bbb; padding: 5px; font-weight: normal;`;
    const LINFER_LABEL_CELL_STYLE = `border: 1px solid #bbb; padding: 5px; font-weight: bold; text-align: left;`;
    const LINFER_PKM_FIRST_LINE_STYLE = `font-weight: bold; font-size: 16px;`;
    const LINFER_PKM_SECOND_LINE_STYLE = `font-size: 14px; color: #666; margin-top: 2px;`;
    const LINFER_SPECIAL_TITLE_STYLE = `background-color: #fff3b0; font-weight: bold; text-align: center; padding: 4px; margin: -5px 0 -1px 0; border: 1px solid #bbb;`;
    const LINFER_SPECIAL_ITEM_STYLE = `border: 1px solid #bbb; padding: 4px 8px; margin-bottom: -1px; text-align: left;`;
    const LINFER_ABS_TABLE_STYLE = `width: 100%; margin-top: -5px; border-collapse: collapse;`;
    const LINFER_ABS_CELL_STYLE = `border: 1px solid #bbb; text-align: left;`;
    /* ─── HELPERS ────────────────────────────────────────────── */
    const getCorpNr = () => sessionStorage.getItem("currentCorpOperNr");
    async function salocCheckRes(res, label) {
      if (res && !res.ok) {
        const t = await res.text().catch(() => "");
        let msg = t;
        try { msg = JSON.parse(t).message || t; } catch (e) {}
        throw new Error(`${label}: ${msg || res.status}`);
      }
      return res;
    }
    async function fetchFromSupabase(table, filter) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&${filter}`, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error(`Erro ao buscar ${table}: ${res.status}`);
      return res.json();
    }
    async function fetchJSON(url) {
      const res = await fetch(url, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error(`Erro ao buscar ${url}: ${res.status}`);
      return res.json();
    }
    function ensureLoadingMarker(container) {
      if (!container.querySelector(".loading-mark")) {
        const lm = document.createElement("div");
        lm.className = "loading-mark"; lm.style.display = "none";
        container.appendChild(lm);
      }
    }
    function renderNoData(container) {
      container.querySelector("table")?.remove();
      let noData = container.querySelector(".no-data-msg");
      if (!noData) {noData = document.createElement("div"); noData.className = "no-data-msg"; noData.style.padding = "10px 0"; container.appendChild(noData);}
      noData.textContent = "Sem dados na tabela ppi_data.";
    }
    function showError(container, message) {
      let errDiv = container.querySelector(".data-error");
      if (!errDiv) {errDiv = document.createElement("div"); errDiv.className = "data-error"; errDiv.style.color = "red"; errDiv.style.padding = "8px 0"; container.appendChild(errDiv);}
      errDiv.textContent = message;
    }
    function createColGroup(widths) {
      const cg = document.createElement("colgroup");
      widths.forEach(w => {const col = document.createElement("col"); col.style.width = w; cg.appendChild(col);});
      return cg;
    }
    function groupByRow(data) {
      return data.reduce((acc, s) => {acc[s.row_order] ??= {}; acc[s.row_order][s.col] = s.content; return acc;}, {});
    }
    function syncRowCount(tbody, targetCount) {
      while (tbody.rows.length < targetCount) tbody.insertRow();
      while (tbody.rows.length > targetCount) tbody.deleteRow(-1);
    }
    function sortedMeans(means, refId, alarmLevel) {
      return means.filter(m => m.reference_id === refId && (m.alarm_level || "").toUpperCase() === alarmLevel)
                  .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
    }
    /* ─── AUDIO ──────────────────────────────────────────────── */
    function playGenericSirene(type, gridId, level, occurrenceType = null) {
      const mapAlarmsA22 = {"1º Alarme" : "1Alarme", "2º Alarme" : "2Alarme", "Alarme Especial" : "AlarmeEspecial"};
      const mapTypesA22 = {"Acidente" : "Acidente", "Substâncias Perigosas" : "SubstanciasPerigosas", "Incêndio em Transportes" : "IncendioTransportes"};
      const mapTypesLinFer = {"Acidente - Abalroamento, Choque e Descarrilamento" : "Acidente", "Substâncias Perigosas - Produtos Químicos/Produtos Biológicos" : 
                              "SubstanciasPerigosas","Incêndio em Transportes":"IncendioTransportes"};
      let fileName, soundFolder;
      switch (type) {
        case 'A22' : soundFolder='A22'; fileName=`${gridId}-${mapTypesA22[occurrenceType]}-${mapAlarmsA22[level]}.mp3`;
          break;
        case 'Aeroporto' : soundFolder='Aeroporto'; fileName=`${gridId}-${level}.mp3`;
          break;
        case 'LinhaFerrea' : soundFolder='LinhaFerrea'; fileName=`${gridId}-${mapTypesLinFer[occurrenceType]}-${mapAlarmsA22[level]}.mp3`;
          break;
        default: console.error(`Tipo de PPI não reconhecido: ${type}`);
          return;
      }
      const audio = new Audio(`https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/sounds/${soundFolder}/${fileName}`);
      audio.play().catch(() => {});
    }
    function createAudioButton(type, gridId, level, occurrenceType = null, customTitle = null) {
      const btn = document.createElement("button");
      btn.innerHTML = "<i class='fa-solid fa-volume-high'></i>"; btn.title = customTitle || `Toque rápido ${level}`; btn.style.cursor = "pointer";
      btn.onclick = e => {e.stopPropagation(); playGenericSirene(type, gridId, level, occurrenceType);};
      return btn;
    }
    /* ─── ALARM HEADER ROW (shared by A22 + LinFer) ─────────── */
    function createAlarmHeaderRow(refs, means, ppiType, gridId, alarmLevels, bgColors, textColors, colSpans) {
      const tr = document.createElement("tr");
      const corpNr = getCorpNr();
      alarmLevels.forEach((level, i) => {
        const th = document.createElement("th");
        th.style.textAlign = "center"; th.style.padding = "4px";
        th.style.backgroundColor = bgColors[i]; th.style.color = textColors[i];
        if (colSpans[i]) th.colSpan = colSpans[i];
        const hasCB = corpNr && refs.some(ref => means.some(m => m.reference_id === ref.id && m.alarm_level === level && m.means?.includes(corpNr)));
        if (hasCB) {
          const wrapper = document.createElement("div");
          Object.assign(wrapper.style, {display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"});
          const titleDiv = document.createElement("div"); titleDiv.textContent = level; titleDiv.style.flex = "1"; titleDiv.style.textAlign = "center";
          const btn = createAudioButton(ppiType, gridId, level, refs[0]?.occurrence_type || null, `Toque rápido ${level}`);
          btn.style.marginLeft = "8px";
          wrapper.append(titleDiv, btn);
          th.innerHTML = ""; th.appendChild(wrapper);
        } else {
          th.textContent = level;
        }
        tr.appendChild(th);
      });
      return tr;
    }
    /* ─── GENERIC ALARM CELLS ────────────────────────────────── */
    function renderGenericAlarmCells(tr, alarmArray, i, skipState) {
      const corpNr = getCorpNr();
      if (skipState.count > 0) {skipState.count--; return;}
      const item = alarmArray[i];
      if (!item) {tr.appendChild(document.createElement("td")); tr.appendChild(document.createElement("td")); return;}
      let meio, corp;
      if (item.means?.includes("*")) {
        const parts = item.means.split("*"); meio = parts[0] + "*"; corp = parts[1] ? parts[1].trim().replace(/^[-\s]+/, "") : "";
      } else {
        const parts = (item.means || "").trim().split(/\s+(.+)/); meio = parts[0] || ""; corp = parts[1] ? parts[1].trim() : "";
      }
      const td1 = document.createElement("td"); td1.textContent = meio; td1.style.textAlign = "left";
      const td2 = document.createElement("td"); td2.textContent = corp; td2.style.textAlign = "left";
      if (corpNr && corp.includes(corpNr)) [td1, td2].forEach(td => {td.style.backgroundColor = "#839ec9"; td.style.color = "white"; td.style.fontWeight = "bold";});
      tr.append(td1, td2);
    }
    function applyTdStyle(td, center = false) {
      Object.assign(td.style, {border:"1px solid #bbb",padding:"4px",textAlign:center?"center":"left",verticalAlign:center?"middle":"top"});
    }
    function renderAlarmCell(tr, alarmMeans, idx, colSpan = 1, center = false) {
      const td = tr.insertCell(); td.colSpan = colSpan; applyTdStyle(td, center);
      if (alarmMeans[idx]) td.textContent = alarmMeans[idx].means;
    }
    /* ─── SHARED OCCURRENCE TABLE BUILDER ───────────────────── */
    function buildOccurrenceTable(occurrenceTypes, references, means, ppiType, gridId, colWidths) {
      const frag = document.createDocumentFragment();
      for (const [type, bgColor] of Object.entries(occurrenceTypes)) {
        const refs = references.filter(r => r.occurrence_type === type);
        if (!refs.length) continue;
        const h3 = document.createElement("h3");
        h3.textContent = `TIPO DE OCORRÊNCIA: ${type}`;
        Object.assign(h3.style, {fontSize:"15px",fontWeight:"bold",margin:"10px 0 0 0",padding:"3px 5px",backgroundColor:bgColor,color:"black",borderRadius:"2px"});
        frag.appendChild(h3);
        const table = document.createElement("table");
        table.classList.add("table-elements");
        Object.assign(table.style, {tableLayout:"fixed",width:"100%",marginBottom:"10px"});
        table.appendChild(createColGroup(colWidths));
        const alarmLevels = ["1º Alarme","2º Alarme","Alarme Especial"];
        const headerRow = createAlarmHeaderRow(refs, means, ppiType, gridId, alarmLevels, ["yellow","orange","red"], ["black","black","white"], [2,2,null]);
        table.createTHead().appendChild(headerRow);
        const tbody = table.createTBody();
        refs.forEach((ref, refIdx) => {
          const firstAlarm  = means.filter(m => m.reference_id === ref.id && m.alarm_level === "1º Alarme" ).sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const secondAlarm = means.filter(m => m.reference_id === ref.id && m.alarm_level === "2º Alarme" ).sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const specialAlarm= means.filter(m => m.reference_id === ref.id && m.alarm_level === "Alarme Especial").sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const maxRows = Math.max(firstAlarm.length, secondAlarm.length, specialAlarm.length);
          let skipFirst = {count:0}, skipSecond = {count:0};
          for (let i = 0; i < maxRows; i++) {
            const tr = tbody.insertRow();
            renderGenericAlarmCells(tr, firstAlarm,  i, skipFirst);
            renderGenericAlarmCells(tr, secondAlarm, i, skipSecond);
            if (i === 0) {
              const tdSpecial = tr.insertCell(); tdSpecial.rowSpan = maxRows; applyTdStyle(tdSpecial, true);
              if (refIdx === refs.length - 1) tdSpecial.classList.add("ppi-span-last");   /* desce até ao fim da tabela: sem linha em baixo (evita os 2px) */
              tdSpecial.textContent = specialAlarm.map(m => m.means).join(", ") || "-";
            }
          }
        });
        frag.appendChild(table);
      }
      return frag;
    }
    /* ─── INTERVENTION NOTICE & CUMULATIVE ALERT ─────────────── */
    function createOrUpdateInterventionNotice(parentContainer, isIntervention) {
      let notice = parentContainer.querySelector(".intervention-notice");
      if (!notice) {
        notice = document.createElement("div");
        notice.className = "intervention-notice";
        notice.setAttribute("role", "alert");
        notice.setAttribute("aria-live", "polite");
        notice.style.cssText = INTERVENTION_NOTICE_STYLE;
        parentContainer.insertBefore(notice, parentContainer.firstChild);
      }
      notice.style.background = isIntervention ? "#e6f7ec" : "#fdeaea";
      notice.style.color = isIntervention ? "#1e7a3b" : "#a11a1a";
      notice.style.border = `1px solid ${isIntervention ? "#1e7a3b" : "#a11a1a"}`;
      notice.textContent = isIntervention
        ? "COM INTERVENSÃO DO CORPO DE BOMBEIROS" : "SEM INTERVENSÃO DO CORPO DE BOMBEIROS";
    }
    function checkIfHasCBIntervention(parentContainer) {
      const corpNr = getCorpNr();
      if (!corpNr) return false;
      for (const cell of parentContainer.querySelectorAll("table td")) {
        if (cell.textContent?.includes(corpNr)) return true;
      }
      return false;
    }
    function createOrUpdateCumulativeAlert(parentContainer) {
      let alertDiv = parentContainer.querySelector(".cumulative-alert");
      if (!checkIfHasCBIntervention(parentContainer)) {alertDiv?.remove(); return;}
      if (!alertDiv) {
        alertDiv = document.createElement("div"); alertDiv.className = "cumulative-alert";
        alertDiv.style.cssText = CUMULATIVE_ALERT_STYLE;
        alertDiv.textContent = "ATENÇÃO! OS ALERTAS SÃO CUMULATIVOS, SE FOR ATIVADO O 2º ALARME SAEM OS MEIOS DE AMBOS OS ALARMES";
        const notice = parentContainer.querySelector(".intervention-notice");
        notice ? notice.insertAdjacentElement('afterend', alertDiv) : parentContainer.insertBefore(alertDiv, parentContainer.firstChild);
      }
    }
    /* ─── FINAL H TABLE (ULS note) ───────────────────────────── */
    function createFinalHTable(container) {
      if (container.querySelector(".ppi-final-table")) return;
      const table = document.createElement("table");
      table.classList.add("table-elements","ppi-final-table"); table.style.cssText = FINAL_H_TABLE_STYLE;
      const tr = document.createElement("tr");
      const tdH = document.createElement("td"); tdH.textContent = "H"; tdH.style.cssText = FINAL_H_CELL_STYLE;
      const tdText = document.createElement("td"); tdText.textContent = "ULS, EPE ou de acordo com a Autoridade de Saúde no local, ou a definir pelo CODU/INEM."; tdText.style.cssText = FINAL_H_TEXT_STYLE;
      tr.append(tdH, tdText); table.appendChild(tr); container.appendChild(table);
    }
    /* ─── SPECIALS CONTENT ───────────────────────────────────── */
    function formatSpecialsContentWithHighlights(text) {
      if (!text) return "";
      let out = text.replace(/\\n/g,"<br>").replace(/\n/g,"<br>");
      HIGHLIGHT_WORDS.sort((a,b) => b.length - a.length).forEach(word => {
        out = out.replace(new RegExp(`(${word.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')})`, "gi"), "<b>$1</b>");
      });
      return out;
    }
    function applySpecialsCellStyle(td) {
      Object.assign(td.style, {border:"1px solid #bbb",padding:"0 0 0 8px",textAlign:"left",verticalAlign:"top"});
    }
    function renderSpecialRow(tr, rowCols) {
      const col1 = rowCols[1] || "", col2 = rowCols[2] || "";
      if ((col1 && !col2) || (!col1 && col2)) {
        tr.innerHTML = ""; const td = tr.insertCell(); td.colSpan = 2; applySpecialsCellStyle(td); td.innerHTML = formatSpecialsContentWithHighlights(col1 || col2); return;
      }
      while (tr.cells.length < 2) tr.insertCell();
      while (tr.cells.length > 2) tr.deleteCell(-1);
      [col1, col2].forEach((content, i) => {const td = tr.cells[i]; applySpecialsCellStyle(td); td.colSpan = 1; td.innerHTML = formatSpecialsContentWithHighlights(content);});
    }
    /* ─── SPECIALS CONTAINER (shared setup) ─────────────────── */
    function ensureSpecialsContainer(containerId, parentContainerId, titleClass, insertBefore = false) {
      const parentEl = document.getElementById(parentContainerId);
      if (!parentEl) return null;
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement("div"); container.id = containerId;
        insertBefore ? parentEl.parentNode.insertBefore(container, parentEl) : parentEl.parentNode.insertBefore(container, parentEl.nextSibling);
      } else if (!insertBefore && container.nextSibling !== parentEl.nextSibling) {
        parentEl.parentNode.insertBefore(container, parentEl.nextSibling);
      }
      return container;
    }    
    /* ─── CLEAR / RESET ──────────────────────────────────────── */
    function clearPPIContainers(ppiPrefix) {
      [`${ppiPrefix}-grid-references`,`${ppiPrefix}-grid-container`,`${ppiPrefix}-specials-container`,`${ppiPrefix}-abs-note`]
        .forEach(id => {const el = document.getElementById(id); if (el) el.innerHTML = "";});
    }
    function resetModulePage(modulePrefix) {
      const ids = ["main-options","grid-controls","grid-references","grid-container","specials-container","abs-note"];
      const els = ids.reduce((acc,s) => {acc[s] = document.getElementById(`${modulePrefix}-${s}`); return acc;}, {});
      if (els["main-options"]) els["main-options"].style.display = "flex";
      if (els["grid-controls"]) {els["grid-controls"].style.display = "none"; els["grid-controls"].querySelectorAll("button").forEach(b => b.classList.remove("active"));}
      ["grid-references","grid-container","specials-container","abs-note"].forEach(s => {if (els[s]) els[s].innerHTML = "";});
    }
    /* ─── SIDEBAR RESET ──────────────────────────────────────── */
    document.addEventListener("DOMContentLoaded", () => {
      function hideAllPPITables() {
        ["ppia2","ppia22","ppiaero","ppilinfer"].forEach(prefix => {
          [`${prefix}-specials-container`,`${prefix}-grid-container`,`${prefix}-grid-references`,`${prefix}-abs-note`]
            .forEach(id => {const el = document.getElementById(id); if (el) el.innerHTML = "";});
        });
        document.getElementById("ppiaero-grid-info-container") && (document.getElementById("ppiaero-grid-info-container").innerHTML = "");
        document.getElementById("ppia22-abs-note") && (document.getElementById("ppia22-abs-note").innerHTML = "");
        document.getElementById("ppilinfer-abs-note") && (document.getElementById("ppilinfer-abs-note").innerHTML = "");
        document.querySelectorAll("#ppia2-grid-controls button,#ppia22-grid-controls button,#ppiaero-grid-controls button,#ppilinfer-grid-controls button")
          .forEach(btn => btn.classList.remove("active"));
      }
      document.querySelector(".sidebar-submenu-button.sub-submenu-toggle")?.addEventListener("click", hideAllPPITables);
      renderAeroCustomButtons();
    });
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach(btn => {
      btn.addEventListener("click", () => {
        const map = {"page-ppia22":"ppia22","page-ppilinfer":"ppilinfer"};
        const prefix = map[btn.getAttribute("data-page")];
        if (prefix) resetModulePage(prefix);
        if (btn.getAttribute("data-page") === "page-ppiaero") resetAeroPage();   /* Aeroporto: fecha as tabelas, como nos outros PPI */
      });
    });
    /* ─── ENSURE ABS CONTAINER ───────────────────────────────── */
    function ensureAbsContainer(id, controlsId) {
      let absContainer = document.getElementById(id);
      if (!absContainer) {
        absContainer = document.createElement("div"); absContainer.id = id; absContainer.style.marginTop = "10px";
        document.getElementById(controlsId).parentNode.appendChild(absContainer);
      }
      return absContainer;
    }
    /* =============== PPI A22 =============== */
    function consultationGridA22KmType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      ShowA22KmControls();
    }
    function consultationGridA22SectionType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      ShowA22SectionControls();
    }
    function consultationGridA22StructureType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      ShowA22StructureControls();
    }
    function consultationGridA22ButtonType() {
      document.getElementById("ppia22-main-options").style.display = "none";
      document.getElementById("ppia22-grid-controls").style.display = "block";
      ShowA22GridButtons();
    }
    /* Enter no campo de pesquisa = carregar em Procurar */
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      const card = e.target.closest?.("#ppia22-grid-controls > .options-main-card, #ppilinfer-grid-controls > .options-main-card");
      if (!card || !/^(INPUT|SELECT)$/.test(e.target.tagName)) return;
      const btn = card.querySelector(".options-black-btn");
      if (btn) { e.preventDefault(); btn.click(); }
    });
    /* ─── KM INPUT (shared between A22 and LinFer) ──────────── */
    function createKmInputField({id, placeholder, maxLen, decimalPlaces, style}) {
      const input = document.createElement("input");
      input.type = "text"; input.placeholder = placeholder; input.id = id;
      input.style.cssText = style || `padding:8px;width:160px;text-align:center;border:1px solid #ccc;border-radius:4px;transition:all 0.2s ease;outline:none;`;
      input.addEventListener("focus", () => {input.style.borderColor="#ccc"; input.style.boxShadow="0 0 5px rgba(0,0,0,0.1)";});
      input.addEventListener("blur",  () => {input.style.borderColor="#ccc"; input.style.boxShadow="none";});
      input.addEventListener("input", () => {
        let val = input.value.replace(",",".").replace(/[^\d.]/g,"");
        const parts = val.split(".");
        if (parts.length > 2) val = parts[0]+"."+parts[1];
        if (parts[1]) parts[1] = parts[1].slice(0, decimalPlaces);
        if (parts[0]) parts[0] = parts[0].slice(0, maxLen - (decimalPlaces + 1));
        val = parts[1] !== undefined ? parts[0]+"."+parts[1] : parts[0];
        input.value = val;
      });
      return input;
    }
    function createKmInput() {
      return createKmInputField({id:"ppia22-km-input", placeholder:"Introduza o Quilómetro", maxLen:6, decimalPlaces:2});
    }
    function createPKmInput() {
      return createKmInputField({id:"ppiLinFer-Pkm-input", placeholder:"Introduza o PKm", maxLen:7, decimalPlaces:3, style:LINFER_INPUT_STYLE});
    }
    /* ─── DIRECTION BUTTONS (shared) ─────────────────────────── */
    function createDirectionButtons(dirRow, directions, idPrefix, btnStyle, topStyle, botStyle, controlsSelector) {
      directions.forEach(d => {
        const btn = document.createElement("button");
        btn.id = idPrefix + d.id; btn.className = "btn btn-add options-btn"; btn.style.cssText = btnStyle;
        const l1 = document.createElement("div"); l1.textContent = d.line1; l1.style.cssText = topStyle;
        const l2 = document.createElement("div"); l2.textContent = d.line2; l2.style.cssText = botStyle;
        btn.append(l1, l2);
        btn.onclick = () => {
          const isActive = btn.classList.contains("active");
          document.querySelectorAll(`${controlsSelector} .btn`).forEach(b => b.classList.remove("active"));
          if (!isActive) btn.classList.add("active");
        };
        dirRow.appendChild(btn);
      });
    }
    function createKmDirectionButtons() {
      const dirRow = document.createElement("div"); dirRow.style.display="flex"; dirRow.style.gap="10px";
      createDirectionButtons(
        dirRow, [{id:"O-E",line1:"OESTE - ESTE",line2:"Lagos → VRSA"},{id:"E-O",line1:"ESTE - OESTE",line2:"VRSA → Lagos"}],
        "km-dir-", `width:160px;height:50px;display:flex;flex-direction:column;justify-content:center;align-items:center;font-weight:bold;`,
        "font-size:14px;", "font-size:11px;font-weight:normal;", "#ppia22-grid-controls");
      return dirRow;
    }
    function createPKmDirectionButtons() {
      const dirRow = document.createElement("div"); dirRow.style.cssText = LINFER_ROW_STYLE; dirRow.style.gap = "10px";
      createDirectionButtons(
        dirRow, [{id:"T-L",line1:"TROÇO",line2:"Tunes → Lagos"},{id:"T-V",line1:"TROÇO",line2:"Tunes → VRSA"}],
        "Pkm-dir-", LINFER_DIRECTION_BUTTON_STYLE, LINFER_DIRECTION_TOP_STYLE, LINFER_DIRECTION_BOT_STYLE, "#ppilinfer-grid-controls");
      return dirRow;
    }
    function createSectionDirectionButtons() {
      const dirRow = document.createElement("div");
      dirRow.style.cssText = LINFER_ROW_STYLE; 
      dirRow.style.gap = "10px";
      createDirectionButtons(
        dirRow, [{id: "T-L", line1: "TROÇO", line2: "Tunes → Lagos"}, {id: "T-V", line1: "TROÇO", line2: "Tunes → VRSA"}],
        "Section-dir-", LINFER_DIRECTION_BUTTON_STYLE, LINFER_DIRECTION_TOP_STYLE, LINFER_DIRECTION_BOT_STYLE, "#ppilinfer-grid-controls");
      return dirRow;
    }
    function buildKmSearchCard({containerId, titleText, directionButtons, inputEl, searchHandler, cardStyle, titleStyle}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.style.display = "block"; container.innerHTML = "";
      const card = document.createElement("div"); card.className = "options-main-card"; card.style.cssText = cardStyle;
      const title = document.createElement("label"); title.textContent = titleText; title.style.cssText = titleStyle;
      const btnSearch = document.createElement("button"); btnSearch.textContent = "Procurar"; btnSearch.className = "btn btn-add options-black-btn"; btnSearch.style.width = "150px";
      btnSearch.onclick = searchHandler;
      card.append(title, directionButtons, inputEl, btnSearch);
      container.appendChild(card);
    }    
    function buildSectionSearchCard({containerId, titleText, directionButtons, inputEl, searchHandler, cardStyle, titleStyle}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.style.display = "block"; container.innerHTML = "";
      const card = document.createElement("div"); card.className = "options-main-card"; card.style.cssText = cardStyle;
      const title = document.createElement("label"); title.textContent = titleText; title.style.cssText = titleStyle;
      const btnSearch = document.createElement("button"); btnSearch.textContent = "Procurar"; btnSearch.className = "btn btn-add options-black-btn"; btnSearch.style.width = "150px";
      btnSearch.onclick = searchHandler;
      card.append(title, directionButtons, inputEl, btnSearch);
      container.appendChild(card);
    }
    function buildStructureSearchCard({containerId, titleText, directionButtons, inputEl, searchHandler, cardStyle, titleStyle}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.style.display = "block"; container.innerHTML = "";
      const card = document.createElement("div"); card.className = "options-main-card"; card.style.cssText = cardStyle;
      const title = document.createElement("label"); title.textContent = titleText; title.style.cssText = titleStyle;
      const btnSearch = document.createElement("button"); btnSearch.textContent = "Procurar"; btnSearch.className = "btn btn-add options-black-btn"; btnSearch.style.width = "150px";
      btnSearch.onclick = searchHandler;
      card.append(title, directionButtons, inputEl, btnSearch);
      container.appendChild(card);
    }
    function ShowA22KmControls() {
      const inputKm = createKmInput();
      buildKmSearchCard({
        containerId: "ppia22-grid-controls", titleText: "Selecione o Sentido",
        directionButtons: createKmDirectionButtons(), inputEl: inputKm,
        cardStyle: `display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;width:400px;margin:0 auto;margin-bottom:5px;`,
        titleStyle: `font-size:16px;font-weight:bold;`,
        searchHandler: async () => {
          const kmStr = inputKm.value.trim();
          const activeDir = document.querySelector("#ppia22-grid-controls .btn.active");
          if (!activeDir) return showPopup('popup-info', "Selecione o sentido primeiro!");
          if (!kmStr || isNaN(parseFloat(kmStr))) return showPopup('popup-info', "Introduza um quilómetro válido!");
          await loadPPIA22DataFromKm(parseFloat(kmStr), activeDir.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE");
        }
      });
    }
    async function ShowA22SectionControls() {
      const directionButtons = createKmDirectionButtons();
      const selectEl = document.createElement('select');
      selectEl.id = 'ppia22-local-select';
      selectEl.style = 'padding:10px;font-size:14px;width:100%;border-radius:6px;';
      selectEl.innerHTML = `<option value="">Selecione o sentido primeiro</option>`;
      let troços = [];
      let sentidoAtual = null;
      async function loadTroçosForSentido(sentido) {
        if (sentido === sentidoAtual) return;
        sentidoAtual = sentido;
        selectEl.innerHTML = `<option value="">A carregar...</option>`;
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/ppia22_data?ppi_sence=eq.${sentido}&select=id,ppi_first_node,ppi_secound_node,ppi_sence`, {
              headers: getSupabaseHeaders()
            }
          );
          troços = await res.json();
          const getKm = (node) => {
            const m = String(node).match(/km ([\d.,]+)/i);
            return m ? parseFloat(m[1].replace(",", ".")) : 0;
          };
          troços.sort((a, b) => {
            const kmA = getKm(a.ppi_first_node);
            const kmB = getKm(b.ppi_first_node);
            return sentido === "OESTE-ESTE" ? kmA - kmB : kmB - kmA;
          });
        } catch (err) {
          console.error('Erro ao carregar troços:', err);
          troços = [];
        }
        selectEl.innerHTML = `<option value="">Selecione o troço</option>` + troços.map(t => `<option value="${t.id}">${t.ppi_first_node} - ${t.ppi_secound_node}</option>`).join('');
      }
      buildSectionSearchCard({
        containerId: "ppia22-grid-controls", titleText: "Selecione o Sentido e o Troço",
        directionButtons, inputEl: selectEl,
        cardStyle: `display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;width:400px;margin:0 auto;margin-bottom:5px;`,
        titleStyle: `font-size:16px;font-weight:bold;`,
        searchHandler: async () => {
          if (!sentidoAtual) return showPopup('popup-info', "Selecione o sentido primeiro!");
          const selectedId = selectEl.value;
          if (!selectedId) return showPopup('popup-info', "Selecione o troço primeiro!");
          const troço = troços.find(t => String(t.id) === String(selectedId));
          if (!troço) return showPopup('popup-info', "Troço inválido!");
          await loadPPIA22DataFromSection(troço.ppi_first_node, troço.ppi_secound_node, sentidoAtual);
        }
      });
      document.querySelectorAll("#ppia22-grid-controls .btn[id^='km-dir-']").forEach(btn => {
        btn.addEventListener('click', () => {
          const sentido = btn.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE";
          loadTroçosForSentido(sentido);
        });
      });
      const defaultActive = document.querySelector("#ppia22-grid-controls .btn.active");
      if (defaultActive) {
        const sentidoInicial = defaultActive.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE";
        loadTroçosForSentido(sentidoInicial);
      }
    }
    async function ShowA22StructureControls() {
      const directionButtons = createKmDirectionButtons();
      const selectEl = document.createElement('select');
      selectEl.id = 'ppia22-structure-select';
      selectEl.style = 'padding:10px;font-size:14px;width:100%;border-radius:6px;';
      selectEl.innerHTML = `<option value="">Selecione o sentido primeiro</option>`;
      let allStructures = [];
      let sentidoAtual = null;
      async function filterStructuresForSentido(sentido) {
        if (sentido === sentidoAtual) return;
        sentidoAtual = sentido;
        selectEl.innerHTML = `<option value="">A carregar...</option>`;
        try {
          if (allStructures.length === 0) {
            const data = await fetchFromSupabase("ppia22_specials", `select=ppi_grid,grid_code,content`);
            allStructures = data
              .map(s => {
              let rawName = s.content || "";
              let firstLine = rawName.split('\n')[0];
              let cleanName = firstLine
              .replace(/\\nCOORDENADAS.*/i, "")
              .replace(/COORDENADAS.*/i, "")
              .replace(/O\s+troço.*/i, "")
              .trim();
              let codeIdentifier = s.grid_code || s.ppi_grid || "";
              return {grid_code: codeIdentifier.trim(), name: cleanName};
            })
              .filter(s => s.name && s.grid_code);
          }
          const filtered = allStructures.filter(s => {
            if (sentido === "OESTE-ESTE") {
              return /1[A-Z]?$/i.test(s.grid_code); 
            } else {
              return /2[A-Z]?$/i.test(s.grid_code);
            }
          });
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          if (filtered.length === 0) {
            selectEl.innerHTML = `<option value="">Nenhuma estrutura encontrada para este sentido</option>`;
          } else {
            selectEl.innerHTML = `<option value="">Selecione a estrutura</option>` + filtered.map(s => `<option value="${s.grid_code}">${s.name}</option>`).join('');
          }
        } catch (err) {
          console.error('Erro ao carregar estruturas:', err);
          selectEl.innerHTML = `<option value="">Erro ao carregar</option>`;
        }
      }
      buildStructureSearchCard({
        containerId: "ppia22-grid-controls",
        titleText: "Selecione o Sentido e a Estrutura",
        directionButtons,
        inputEl: selectEl,
        cardStyle: `display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;width:400px;margin:0 auto;margin-bottom:5px;`,
        titleStyle: `font-size:16px;font-weight:bold;`,
        searchHandler: async () => {
          if (!sentidoAtual) return showPopup('popup-info', "Selecione o sentido primeiro!");
          const selectedGridCode = selectEl.value;
          if (!selectedGridCode) return showPopup('popup-info', "Selecione a estrutura primeiro!");
          await loadPPIA22DataFromStructure(selectedGridCode);
        }
      });
      document.querySelectorAll("#ppia22-grid-controls .btn[id^='km-dir-']").forEach(btn => {
        btn.addEventListener('click', () => {
          const sentido = btn.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE";
          filterStructuresForSentido(sentido);
        });
      });
      const defaultActive = document.querySelector("#ppia22-grid-controls .btn.active");
      if (defaultActive) {
        const sentidoInicial = defaultActive.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE";
        filterStructuresForSentido(sentidoInicial);
      }
    }
    function ShowLinFerPKmControls() {
      const inputKm = createPKmInput();
      buildKmSearchCard({
        containerId: "ppilinfer-grid-controls", titleText: "Selecione o Troço",
        directionButtons: createPKmDirectionButtons(), inputEl: inputKm,
        cardStyle: LINFER_CARD_STYLE, titleStyle: LINFER_TITLE_LABEL_STYLE,
        searchHandler: async () => {
          const kmStr = inputKm.value.trim();
          const activeDir = document.querySelector("#ppilinfer-grid-controls .btn.active");
          if (!activeDir) return showPopup('popup-info', "Selecione o troço primeiro!");
          if (!kmStr || isNaN(parseFloat(kmStr))) return showPopup('popup-info', "Introduza um ponto quilométrico válido!");
          await loadPPILinFerDataFromKm(parseFloat(kmStr), activeDir.id === "Pkm-dir-T-L" ? "TUNES-LAGOS" : "TUNES-VRSA");
        }
      });
    }
    async function ShowLinFerSectionControls() {
      const directionButtons = createSectionDirectionButtons();
      const selectEl = document.createElement('select');
      selectEl.id = 'ppilinfer-section-select';
      selectEl.style = 'padding:10px;font-size:14px;width:100%;border-radius:6px;';
      selectEl.innerHTML = `<option value="">Selecione o troço primeiro</option>`;
      let sentidoAtual = null;      
      async function loadSelectOptionsForSentido(sentidoBotao) {
        sentidoAtual = sentidoBotao;
        selectEl.innerHTML = `<option value="">A carregar opções...</option>`;
        try {
          const data = await fetchFromSupabase("ppilinfer_data", "select=ppi_sence");
          const allRows = data || [];
          const termoProcura = sentidoBotao.replace("-", "").toUpperCase();
          const filteredRows = allRows.filter(item => {
            if (!item.ppi_sence) return false;
            const senceBD = String(item.ppi_sence).replace("-", "").toUpperCase();
            return senceBD.includes(termoProcura);
          });
          const uniqueOptions = [...new Set(filteredRows.map(item => item.ppi_sence.trim()))];
          uniqueOptions.sort();
          if (uniqueOptions.length === 0) {
            selectEl.innerHTML = `<option value="">Nenhum troço encontrado para esta direção</option>`;
          } else {
            selectEl.innerHTML = `<option value="">Selecione o Troço</option>` + uniqueOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
          }
        } catch (err) {
          console.error('Erro ao conectar à tabela ppilinfer_data:', err);
          selectEl.innerHTML = `<option value="">Erro ao carregar dados</option>`;
        }
      }
      buildSectionSearchCard({
        containerId: "ppilinfer-grid-controls",
        titleText: "Selecione o Troço da Linha Férrea",
        directionButtons,
        inputEl: selectEl,
        cardStyle: LINFER_CARD_STYLE,
        titleStyle: LINFER_TITLE_LABEL_STYLE,
        searchHandler: async () => {
          const activeDir = document.querySelector("#ppilinfer-grid-controls .btn.active");
          if (!activeDir) return showPopup('popup-info', "Selecione a direção primeiro!");
          const selectedSection = selectEl.value;
          if (!selectedSection) return showPopup('popup-info', "Selecione o troço no menu!");
          await loadPPILinFerDataFromSection(selectedSection);
        }
      });
      document.querySelectorAll("#ppilinfer-grid-controls .btn[id^='Section-dir-']").forEach(btn => {
        btn.addEventListener('click', async () => {
          document.querySelectorAll("#ppilinfer-grid-controls .btn[id^='Section-dir-']").forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sentidoStr = btn.id === "Section-dir-T-L" ? "TUNES-LAGOS" : "TUNES-VRSA";
          await loadSelectOptionsForSentido(sentidoStr);
        });
      });
    }
    /* ─── A22 GRID BUTTONS ───────────────────────────────────── */
    function createA22SenceTitle(text, isTop) {
      const row = document.createElement("div");
      row.className = "major-row";
      row.style.cssText = isTop ? A22_TITLE_STYLE_UP : A22_TITLE_STYLE_DOWN;
      const label = document.createElement("label");
      label.textContent = text;
      label.style.cursor = "inherit";
      row.appendChild(label);
      return row;
    }
    function createA22GridButtons(id, specialButtons) {
      const btn = document.createElement("button"); btn.id = id; btn.textContent = id; btn.className = "btn btn-add options-btn"; btn.style.cssText = A22_GRID_BUTTON_STYLE;
      if (specialButtons.has(id) && getCorpNr() === "0805") btn.classList.add("options-yellow-btn");
      btn.onclick = e => {
        e.preventDefault();
        const isActive = btn.classList.contains("active");
        document.querySelectorAll("#ppia22-grid-controls button").forEach(b => b.classList.remove("active"));
        isActive ? clearPPIContainers("ppia22") : (btn.classList.add("active"), loadPPIA22DataFromButton(id));
      };
      return btn;
    }
    function ShowA22GridButtons() {
      const container = document.getElementById("ppia22-grid-controls");
      if (!container) return;
      container.style.cssText = A22_GRID_CONTAINER_STYLE; container.innerHTML = "";
      const directions = [{label:"SENTIDO OESTE - ESTE",sublabel:"(Lagos - Vila Real de Santo António)",prefix:"1"},
                          {label:"SENTIDO ESTE - OESTE",sublabel:"(Vila Real de Santo António - Lagos)",prefix:"2"}];
      const specialButtons = new Set(["1M","1N","1O","1P","1Q","1R","2J","2K","2L","2M","2N","2O","2P"]);
      directions.forEach(dir => {
        const sec = document.createElement("div"); sec.className = "ppi-dir";   /* cada sentido no seu contentor */
        sec.append(createA22SenceTitle(dir.label, true), createA22SenceTitle(dir.sublabel, false));
        const rowButtons = document.createElement("div"); rowButtons.className = "major-row";
        rowButtons.style.cssText = A22_ROW_STYLE; rowButtons.style.justifyContent = "center";
        for (let i=0; i<19; i++) rowButtons.appendChild(createA22GridButtons(`${dir.prefix}${String.fromCharCode(65+i)}`, specialButtons));
        sec.appendChild(rowButtons);
        container.appendChild(sec);
      });
    }
    /* ─── A22 CELL HELPERS ───────────────────────────────────── */
    function createCell(text, {colSpan=1, rowSpan=1, bold=false, center=false} = {}) {
      const td = document.createElement("td"); td.colSpan=colSpan; td.rowSpan=rowSpan; td.textContent=text||"";
      td.style.cssText = bold ? A22_CELL_STYLE : A22_CELL_STYLE_NORMAL;
      td.style.textAlign = center ? "center" : "inherit"; return td;
    }
    function createDirectionCell(ppi) {
      const td = createCell("", {rowSpan:2, center:true});
      const top = document.createElement("div"); top.textContent="SENTIDO"; top.style.cssText=A22_DIRECTION_TOP_STYLE;
      const mid = document.createElement("div"); mid.textContent=ppi.ppi_sence; mid.style.cssText=A22_DIRECTION_MID_STYLE;
      const bot = document.createElement("div"); bot.textContent=ppi.ppi_direction; bot.style.cssText=A22_DIRECTION_BOT_STYLE;
      td.append(top, mid, bot); return td;
    }
    function createNodeCell(nodeStr="") {
      const [main, km] = nodeStr.split("(");
      const td = createCell("", {bold:true, center:true});
      td.innerHTML = `${main||""}<span style="${A22_NODE_KM_STYLE}">(${km||""}</span>`; return td;
    }
    /* ─── A22 LOAD DATA ──────────────────────────────────────── */
    // Carrega tudo em paralelo; as tabelas que já estão no ecrã são atualizadas no sítio (sem as apagar e voltar a criar)
    async function loadPPIA22All(gridId) {
      await Promise.all([loadPPIA22DataInfoGrid(gridId), loadPPIA22DataSpecials(gridId), loadPPIA22GridSeparated(gridId)]);
    }
    /* mostra a grelha só quando está toda montada (sem aparecer aos bocados) */
    async function ppiHoldRun(prefix, fn) {
      const p = document.getElementById(`page-${prefix}`);
      p?.classList.add("ppi-busy");
      try { return await fn(); } finally { requestAnimationFrame(() => p?.classList.remove("ppi-busy")); }
    }
    async function loadPPIA22DataFromButton(buttonId) {
      return ppiHoldRun("ppia22", async () => {
        await loadPPIA22All(buttonId);
        const tempContainer = document.getElementById("ppia22-grid-container")?.firstChild;
        if (tempContainer) createFinalHTable(tempContainer);
        ppia22ABSNoteTable(ensureAbsContainer("ppia22-abs-note","ppia22-grid-controls"), buttonId);
      });
    }
    async function loadPPIA22DataFromKm(km, sentido) {
      try {
        const data = await fetchFromSupabase("ppia22_data", `ppi_sence=eq.${sentido}`);
        const filtered = data.filter(ppi => {
          const f = parseFloat((ppi.ppi_first_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          const s = parseFloat((ppi.ppi_secound_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          return km >= Math.min(f,s) && km <= Math.max(f,s);
        });
        if (!filtered.length) {
          showPopup('popup-danger', "Nenhuma grelha encontrada para este quilómetro.");           
          return;
        }
        const limiteGrelhas = filtered.filter(ppi => {
          const f = parseFloat((ppi.ppi_first_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          const s = parseFloat((ppi.ppi_secound_node.match(/km ([\d.,]+)/i)?.[1]||"0").replace(",","."));
          return km === f || km === s;
        });
        if (limiteGrelhas.length > 1) {
          const grelhas = limiteGrelhas.map(p=>p.ppi_grid).sort((a,b)=>a.localeCompare(b));
          showPopup('popup-danger', `O quilómetro <b style="color:red">${km.toFixed(2)}</b> corresponde ao limite entre duas grelhas, 
                                     <b style="color:red">${grelhas.length===2?grelhas.join(" e "):grelhas.join(", ")}</b>.<br>Para garantir maior precisão na atribuição de meios, 
                                     recomenda-se a consulta direta por grelha. Obrigado.`);
          return;
        }
        const gridContainer = document.getElementById("ppia22-grid-container");
        for (const ppi of filtered) {
          await loadPPIA22All(ppi.ppi_grid);
          const tempContainer = gridContainer.firstChild;
          if (tempContainer) createFinalHTable(tempContainer);
          ppia22ABSNoteTable(ensureAbsContainer("ppia22-abs-note","ppia22-grid-controls"), ppi.ppi_grid);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }
    async function loadPPIA22DataFromSection(firstNode, secondNode, sentido) {
      const gridContainer = document.getElementById("ppia22-grid-container");
      const absContainer = ensureAbsContainer("ppia22-abs-note", "ppia22-grid-controls");
      try {
        const data = await fetchFromSupabase("ppia22_data", `ppi_sence=eq.${sentido}`);
        const filtered = data.filter(ppi => ppi.ppi_first_node === firstNode && ppi.ppi_secound_node === secondNode);
        if (!filtered.length) {
          gridContainer.innerHTML = ''; absContainer.innerHTML = '';
          showPopup('popup-danger', "Nenhuma grelha encontrada para este troço.");
          return;
        }
        for (const ppi of filtered) {
          await loadPPIA22All(ppi.ppi_grid);
          const tempContainer = gridContainer.firstChild;
          if (tempContainer) createFinalHTable(tempContainer);
          ppia22ABSNoteTable(absContainer, ppi.ppi_grid);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }
    async function loadPPIA22DataFromStructure(gridCode) {
      const gridContainer = document.getElementById("ppia22-grid-container");
      const absContainer = ensureAbsContainer("ppia22-abs-note", "ppia22-grid-controls");
      const activeBtn = document.querySelector("#ppia22-grid-controls .btn.active");
      const sentido = activeBtn && activeBtn.id === "km-dir-O-E" ? "OESTE-ESTE" : "ESTE-OESTE";
      try {
        const data = await fetchFromSupabase("ppia22_data", `ppi_sence=eq.${sentido}`);
        const filtered = data.filter(ppi => String(ppi.grid_code || ppi.ppi_grid).trim().toLowerCase() === String(gridCode).trim().toLowerCase());
        if (!filtered.length) {
          gridContainer.innerHTML = ''; absContainer.innerHTML = '';
          console.warn("Código procurado:", gridCode, "no sentido:", sentido);
          showPopup('popup-danger', `Nenhuma grelha encontrada para a referência ${gridCode} no sentido ${sentido}.`);
          return;
        }
        for (const ppi of filtered) {
          await loadPPIA22All(ppi.ppi_grid);
          const tempContainer = gridContainer.firstChild;
          if (tempContainer) {
            createFinalHTable(tempContainer);
          }
          ppia22ABSNoteTable(absContainer, ppi.ppi_grid);
        }
      } catch (err) {
        console.error("Erro ao carregar dados estruturados via Referência:", err);
        alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }    
    async function loadPPIA22DataInfoGrid(gridId) {
      const container = document.getElementById("ppia22-grid-references");
      if (!container) return;
      ensureLoadingMarker(container);
      const loading = container.querySelector(".loading-mark");
      loading.style.display = "block";
      try {
        const corpNr = getCorpNr();
        const [data, refs] = await Promise.all([fetchFromSupabase("ppia22_data", `ppi_grid=eq.${gridId}`),
                                                fetchFromSupabase("ppia22_references", `grid_code=eq.${gridId}`)]);
        const refIds = refs.map(r => r.id);
        const means = refIds.length ? await fetchFromSupabase("ppia22_means", `reference_id=in.(${refIds.join(",")})`) : [];
        createOrUpdateInterventionNotice(container, corpNr && means.some(m => typeof m.means==="string" && m.means.includes(corpNr)));
        if (!data.length) return renderNoData(container);
        const ppi = data[0];
        let table = container.querySelector("table");
        if (!table) {table=document.createElement("table"); table.className="table-elements"; table.style.cssText=A22_TABLE_STYLE; container.appendChild(table);}
        table.innerHTML = "";
        table.appendChild(createColGroup(["260px","262px","calc(33% - 40px)","calc(33% - 40px)"]));
        const tr1 = document.createElement("tr");
        tr1.append(createCell(`GRELHA ${ppi.ppi_grid} - CB`,{rowSpan:2,bold:true,center:true}), createDirectionCell(ppi), createCell("TROÇO",{colSpan:2,bold:true,center:true}));
        table.appendChild(tr1);
        const tr2 = document.createElement("tr"); tr2.append(createNodeCell(ppi.ppi_first_node), createNodeCell(ppi.ppi_secound_node)); table.appendChild(tr2);
        [["COORDENADAS LAT/LONG",ppi.ppi_first_coordinate,ppi.ppi_secound_coordinate],
         ["ALTITUDE (m)",ppi.ppi_first_height,ppi.ppi_secound_height],
         ["Ponto de Trânsito (PT) / Local de Reforço Tático (LRT)",ppi.ppi_ptlrt_coordinates,ppi.ppi_ptlrt_coordinates]
        ].forEach(([label,left,right], index) => {
          const tr = document.createElement("tr");
          const tdLabel = document.createElement("td"); tdLabel.colSpan=2; tdLabel.style.cssText=A22_LABEL_CELL_STYLE; tdLabel.textContent=label||"";
          const tdLeft = document.createElement("td"); tdLeft.textContent=left||""; tdLeft.style.cssText=A22_CELL_STYLE;
          if (index===2) {tdLeft.colSpan=2; tr.append(tdLabel,tdLeft);}
          else {const tdRight=document.createElement("td"); tdRight.textContent=right||""; tdRight.style.cssText=A22_CELL_STYLE; tr.append(tdLabel,tdLeft,tdRight);}
          table.appendChild(tr);
        });
      } catch (err) {
        console.error("❌ Erro ao carregar PPI data:", err);
        showError(container,"Erro ao carregar PPI data. Veja o console.");
      }
      finally {loading.style.display = "none";}
    }
    async function loadPPIA22DataSpecials(gridId) {
      const container = ensureSpecialsContainer("ppia22-specials-container","ppia22-grid-references");
      if (!container) return;
      if (!container.querySelector(".ppia22-title")) {
        const titleDiv = document.createElement("div"); titleDiv.textContent="SITUAÇÕES ESPECIAIS";
        Object.assign(titleDiv.style,{backgroundColor:"#fff3b0",fontWeight:"bold",textAlign:"center",padding:"4px",margin:"-5px 0 -1px 0",border:"1px solid #bbb"});
        titleDiv.classList.add("ppia22-title"); container.appendChild(titleDiv);
      }
      let dataContainer = container.querySelector(".ppia22-data");
      if (!dataContainer) {dataContainer=document.createElement("div"); dataContainer.classList.add("ppia22-data"); container.appendChild(dataContainer);}
      try {
        dataContainer = container.querySelector(".ppia22-data");
        const specials = await fetchFromSupabase("ppia22_specials",`grid_code=eq.${gridId}&order=part,row_order,col`);
        if (!specials.length) {dataContainer.innerHTML="Sem informações especiais para esta grelha."; return;}
        const part1 = specials.filter(s=>s.part===1);
        let p1Div = dataContainer.querySelector(".ppia22-part1");
        if (!p1Div) {p1Div=document.createElement("div"); Object.assign(p1Div.style,{border:"1px solid #bbb",padding:"0 0 0 8px",marginBottom:"-5px",textAlign:"left"});
                     p1Div.classList.add("ppia22-part1"); dataContainer.appendChild(p1Div);}
        p1Div.innerHTML = part1.map(s=>formatSpecialsContentWithHighlights(s.content)).join("<br>");
        let table = dataContainer.querySelector("table");
        if (!table) {
          table=document.createElement("table"); table.classList.add("table-elements"); 
          Object.assign(table.style,{width:"100%",borderCollapse:"collapse",margin:"4px 0 5px 0"}); dataContainer.appendChild(table);}
        const rowsMap = groupByRow(specials.filter(s=>s.part===2));
        const tbody = table.tBodies[0] || table.createTBody();
        syncRowCount(tbody, Object.keys(rowsMap).length);
        Object.values(rowsMap).forEach((cols,idx) => renderSpecialRow(tbody.rows[idx], cols));
      } catch (err) {
        console.error("❌ Erro ao carregar specials PPIA22:", err); dataContainer.innerHTML="Erro ao carregar informações especiais. Veja o console.";
      }
    }
    async function fetchAllMeans() {
      const all=[]; let start=0; const pageSize=1000;
      while(true) {
        const end=start+pageSize-1;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ppia22_means?select=*`,{headers:{...getSupabaseHeaders(),Range:`${start}-${end}`}});
        if(!res.ok) throw new Error(`Erro ao buscar ppia22_means: ${res.status}`);
        const chunk=await res.json(); all.push(...chunk);
        if(chunk.length<pageSize) break; start+=pageSize;
      }
      return all;
    }
    async function fetchRelevantMeans(ids) {
      if(!ids.length) return [];
      return fetchFromSupabase("ppia22_means",`reference_id=in.(${ids.join(",")})`);
    }
    async function loadPPIA22GridSeparated(gridId) {
      const container = document.getElementById("ppia22-grid-container");
      if (!container) return;
      const tempContainer = document.createElement("div"); tempContainer.style.display="none";
      try {
        const references = await fetchFromSupabase("ppia22_references",`grid_code=eq.${gridId}`);
        if (!references.length) return;
        const means = await fetchRelevantMeans(references.map(r=>r.id));
        const occurrenceTypes = {"Acidente":"#a5d6a7","Substâncias Perigosas":"#ffcc80","Incêndio em Transportes":"#90caf9"};
        tempContainer.appendChild(buildOccurrenceTable(occurrenceTypes, references, means, 'A22', gridId, ["80px","calc(33% - 40px)","80px","calc(33% - 40px)","33%"]));
        container.innerHTML=""; container.appendChild(tempContainer); tempContainer.style.display="block";
        createOrUpdateCumulativeAlert(tempContainer);
      } catch(err) {
        console.error("❌ Erro ao carregar grelha PPI A22:", err); container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    function ppia22ABSNoteTable(container, buttonId) {
      if(!container||!buttonId||buttonId.length<2) return;
      const dir=buttonId[0], index=buttonId[1].toUpperCase().charCodeAt(0)-65;
      let number = dir==='1' ? (index<=1?1:index) : (index===0?1:index>=16?18:index+1);
      container.innerHTML="";
      const table=document.createElement("table");
      table.classList.add("table-elements");
      Object.assign(table.style,{width:"100%",marginTop:"-5px",borderCollapse:"collapse",lineHeight:"15px"});
      const tr=document.createElement("tr"), td=document.createElement("td");
      td.innerHTML = `<b>* As ABSC</b> a despacho para o PPI da Via do Infante de Sagres, não devem ser as afetas ao PEM do INEM, sendo complementares às mobilizadas pelo CODU do INEM (GRELHA ${number} INEM)`;
      Object.assign(td.style,{padding:"5px",textAlign:"left",border:"1px solid #bbb"});
      tr.appendChild(td);
      table.appendChild(tr);
      container.appendChild(table);
    }
    /* ============ PPI AEROPORTO ============ */
    function renderAeroCustomButtons() {
      const container = document.getElementById("ppiaero-grid-controls");
      if (!container) return;
      container.innerHTML="";
      const buttonsData=[{id:"A1",label:"11 a 20 Pessoas"},{id:"A2",label:"21 a 30 Pessoas"},{id:"A3",label:"31 a 100 Pessoas"},{id:"A4",label:"+ de 101 Pessoas"},{id:"B1",label:"Queda Declarada"}];
      const labelDiv=document.createElement("div"); labelDiv.textContent="GRELHAS DE ALARME"; Object.assign(labelDiv.style,AERO_LABEL_STYLE);
      container.appendChild(labelDiv);
      const rowButtons=document.createElement("div"); Object.assign(rowButtons.style, AERO_ROW_STYLE);
      buttonsData.forEach(btnData => {
        const btn=document.createElement("button"); btn.id=btnData.id; btn.className="btn btn-add options-btn";
        btn.textContent=`${btnData.id} (${btnData.label})`;
        const bgMap={B1:"black", A1:"green", A2:"yellow", A3:"orange", A4:"red"};
        const colorMap={B1:"red",A2:"black",A3:"black"};
        Object.assign(btn.style,{...AERO_BUTTON_STYLE,background:bgMap[btnData.id]||"red",color:colorMap[btnData.id]||"white"});
        btn.addEventListener("click", e=>handleAeroButtonClick(e,btn,btnData));
        rowButtons.appendChild(btn);
      });
      container.appendChild(rowButtons);
    }
    function resetAeroPage() {
      document.querySelectorAll("#ppiaero-grid-controls button").forEach(b=>b.classList.remove("active"));
      const grid=document.getElementById("ppiaero-grid-container"); if(grid) grid.innerHTML="";
      ["ppiaero-grid-header","ppiaero-grid-info"].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display="none";});
    }
    function handleAeroButtonClick(event, btn, btnData) {
      event.preventDefault();
      const isActive=btn.classList.contains("active");
      document.querySelectorAll("#ppiaero-grid-controls button").forEach(b=>b.classList.remove("active"));
      if (isActive) {
        document.getElementById("ppiaero-grid-container").innerHTML="";
        ["ppiaero-grid-header","ppiaero-grid-info"].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display="none";});
        return;
      }
      btn.classList.add("active");
      ppiHoldRun("ppiaero", () => btn.id==="B1" ? loadPPIAeroGridB1(btn.id) : loadPPIAeroGridSeparated(btn.id));
      ppiaeroHeaderTable(btn.id, btnData.label);
      ppiaeroInfoTable();
    }
    function ppiaeroHeaderTable(gridId, label) {
      const container=document.getElementById("ppiaero-grid-info-container"); if(!container) return;
      let table=document.getElementById("ppiaero-grid-header");
      if (!table) {
        table=document.createElement("table"); table.id="ppiaero-grid-header";
        Object.assign(table.style,AERO_HEADER_TABLE_STYLE); container.prepend(table);
      }
      table.innerHTML="";
      const tr=document.createElement("tr"), td=document.createElement("td"); Object.assign(td.style,AERO_HEADER_CELL_STYLE);
      td.textContent=gridId==="B1"?`Grelha de Alarmes dos Corpos de Bombeiros - ${gridId} - Queda Declarada de Aeronave`:`Grelha de Alarmes dos Corpos de Bombeiros - ${gridId} - Aeronave com (${label} a Bordo)`;
      tr.appendChild(td); table.appendChild(tr); table.style.display="table";
    }
    function ppiaeroInfoTable() {
      const container=document.getElementById("ppiaero-grid-info-container"); if(!container) return;
      let table=document.getElementById("ppiaero-grid-info");
      if (!table) {
        table=document.createElement("table"); table.id="ppiaero-grid-info"; Object.assign(table.style,AERO_INFO_TABLE_STYLE);
        const cg=document.createElement("colgroup");
        [["col1","17%"],["col2","83%"]].forEach(([,w])=>{const col=document.createElement("col");col.style.width=w;cg.appendChild(col);});
        table.appendChild(cg);
        const tr=document.createElement("tr");
        const td1=document.createElement("td"); td1.textContent="GRELHA DE ALARME PARA OS CORPOS DE BOMBEIROS";
        Object.assign(td1.style,{...AERO_CELL_STYLE,textAlign:"center",backgroundColor:"orange",color:"black",fontWeight:"bold"});
        const td2=document.createElement("td"); 
        td2.textContent="Esta grelha aplica-se aos cenários de proteção e socorro. Podendo aplicar-se aos restantes cenários definidos pelo PAE Gago Coutinho - Faro, Algarve, desde que solicitado pelas forças de segurança ao CRERPC.";
        Object.assign(td2.style,{...AERO_CELL_STYLE,textAlign:"left",fontWeight:"bold"});
        tr.append(td1,td2); table.appendChild(tr); container.appendChild(table);
      }
      table.style.display="table";
    }
    function splitMeans(means) {
      if (!means) return {meio:"",corp:""};
      if (means.includes("**")) {const [a,b]=means.split("**"); return {meio:a+"**",corp:b?.trim()||""};}
      if (means.includes("*"))  {const [a,b]=means.split("*");  return {meio:a+"*", corp:b?.trim()||""};}
      const [a,b]=(means.trim().split(/\s+(.+)/)||["",""]);
      return {meio:a||"",corp:b||""};
    }
    function renderPPIAeroAlarmCells(tr, item) {
      const corpNr=getCorpNr();
      const {meio,corp}=item?.means?splitMeans(item.means):{meio:"",corp:""};
      [meio,corp].forEach(content=>{
        const td=document.createElement("td"); td.textContent=content; Object.assign(td.style,AERO_CELL_STYLE);
        if(corpNr&&corp.includes(corpNr)) Object.assign(td.style,{backgroundColor:"#839ec9",color:"white",fontWeight:"bold"});
        tr.appendChild(td);
      });
    }
    function appendReservaCell(tr) {
      const td=document.createElement("td"); td.textContent="RESERVA"; td.colSpan=2; Object.assign(td.style,AERO_RESERVA_CELL_STYLE); tr.appendChild(td);
    }
    function appendEmptyCells(tr,count) {
      for(let i=0;i<count;i++){const td=document.createElement("td");td.textContent="";Object.assign(td.style,{border:"1px solid #bbb"});tr.appendChild(td);}
    }
    function appendPPIAeroCells(tr,item){
      if(!item) return appendEmptyCells(tr,2);
      const corpNr=getCorpNr(), {meio,corp}=splitMeans(item.means);
      [meio,corp].forEach(content=>{
        const td=document.createElement("td"); td.textContent=content; Object.assign(td.style,AERO_CELL_STYLE);
        if(corpNr&&corp.includes(corpNr)) Object.assign(td.style,{backgroundColor:"#839ec9",color:"white",fontWeight:"bold"});
        tr.appendChild(td);
      });
    }
    function createAeroHeaderRow(gridId) {
      const tr=document.createElement("tr");
      [{title:"ALERTA AMARELO",bg:"yellow",color:"black"},{title:"ALERTA VERMELHO",bg:"red",color:"white"}].forEach(({title,bg,color})=>{
        const th=document.createElement("th"); th.colSpan=2; th.style.textAlign="center"; th.style.padding="4px"; th.style.fontWeight="bold";
        th.style.backgroundColor=bg; th.style.color=color;
        const wrapper=document.createElement("div"); Object.assign(wrapper.style,{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"6px"});
        const titleDiv=document.createElement("div"); titleDiv.textContent=title; titleDiv.style.flex="1"; titleDiv.style.textAlign="center";
        const btn=createAudioButton('Aeroporto',gridId,title,null,`Toque rápido ${title.split(" ")[1]}`);
        wrapper.append(titleDiv,btn); th.innerHTML=""; th.appendChild(wrapper); tr.appendChild(th);
      });
      return tr;
    }
    let cachedPpiaeroMeans = null;
    async function fetchPpiaeroMeansCached() {
      if (!cachedPpiaeroMeans) cachedPpiaeroMeans = await fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_means?select=*`);
      return cachedPpiaeroMeans;
    }
    async function loadPPIAeroGridSeparated(gridId) {
      const container=document.getElementById("ppiaero-grid-container"); if(!container) return;
      const tempContainer=document.createElement("div"); tempContainer.style.display="none";
      try {
        const [references,means]=await Promise.all([fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_references?select=*&grid_code=eq.${gridId}`),fetchPpiaeroMeansCached()]);
        const table=document.createElement("table"); table.classList.add("table-elements");
        Object.assign(table.style,{tableLayout:"fixed",width:"100%",margin:"10px 0 5px 0"});
        table.appendChild(createColGroup(AERO_B1_COL_STYLE));
        table.appendChild(createAeroHeaderRow(gridId));
        const tbody=document.createElement("tbody");
        references.forEach(ref=>{
          const amareloMeans=sortedMeans(means,ref.id,"AMARELO"), vermelhoMeans=sortedMeans(means,ref.id,"VERMELHO");
          const maxRows=Math.max(amareloMeans.length?Math.max(...amareloMeans.map(m=>m.display_order??1)):0,vermelhoMeans.length?Math.max(...vermelhoMeans.map(m=>m.display_order??1)):0);
          const reserveIndex=amareloMeans.length>1?Math.max(...amareloMeans.map(m=>m.display_order??1))-1:null;
          for(let i=1;i<=maxRows;i++){
            const tr=document.createElement("tr");
            const aItem=amareloMeans.find(m=>(m.display_order??1)===i), vItem=vermelhoMeans.find(m=>(m.display_order??1)===i);
            if(reserveIndex&&i===reserveIndex&&!aItem){appendReservaCell(tr);appendPPIAeroCells(tr,vItem);}
            else{appendPPIAeroCells(tr,aItem);appendPPIAeroCells(tr,vItem);}
            tbody.appendChild(tr);
          }
        });
        table.appendChild(tbody); tempContainer.appendChild(table);
        container.innerHTML=""; tempContainer.style.display="block"; container.appendChild(tempContainer);
        createOrUpdateCumulativeAlert(tempContainer); ppiaeroABSNoteTable(tempContainer);
      } catch(err){
        console.error("❌ Erro ao carregar grelha PPIAero:",err);container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    async function loadPPIAeroGridB1(gridId) {
      const container=document.getElementById("ppiaero-grid-container"); if(!container) return;
      const tempContainer=document.createElement("div"); tempContainer.style.display="none";
      try {
        const [references,means]=await Promise.all([fetchJSON(`${SUPABASE_URL}/rest/v1/ppiaero_references?select=*&grid_code=eq.${gridId}`),fetchPpiaeroMeansCached()]);
        const table=document.createElement("table"); table.classList.add("table-elements"); Object.assign(table.style,AERO_B1_TABLE_STYLE);
        table.appendChild(createColGroup(AERO_B1_COL_STYLE));
        const thead=document.createElement("thead");
        const trHead1=document.createElement("tr"), th=document.createElement("th"); th.colSpan=4; Object.assign(th.style,AERO_B1_HEADER1_STYLE);
        const wrapper=document.createElement("div");
        Object.assign(wrapper.style,AERO_B1_WRAPPER_STYLE);
        const titleDiv=document.createElement("div"); titleDiv.textContent="ALERTA VERMELHO"; Object.assign(titleDiv.style,AERO_B1_TITLE_DIV_STYLE);
        const btn=createAudioButton('Aeroporto',gridId,'ALERTA VERMELHO',null,'Toque rápido VERMELHO');
        wrapper.append(titleDiv,btn); th.innerHTML=""; th.appendChild(wrapper); trHead1.appendChild(th); thead.appendChild(trHead1);
        const trHead2=document.createElement("tr");
        ["Frente Aeroporto - Portaria do Aeroporto","Frente Cidade - Parque Ribeirinho"].forEach((title, i) => {
          const th = document.createElement("th"); th.textContent = title; th.colSpan = 2; Object.assign(th.style, AERO_B1_HEADER2_STYLE);
          if (i === 0) {
            th.style.backgroundColor = "#e7f1ff";
            th.style.color = "#084298";
            th.style.border = "1px solid #b6d4fe";
          } else {
            th.style.backgroundColor = "#e9f7ef";
            th.style.color = "#146c43";
            th.style.border = "1px solid #badbcc";
          }
          trHead2.appendChild(th);
        });
        thead.appendChild(trHead2); table.appendChild(thead);
        const tbody=document.createElement("tbody");
        references.forEach(ref=>{
          const aeroportoMeans=means.filter(m=>m.reference_id===ref.id&&m.alarm_level==="Frente Aeroporto - Portaria do Aeroporto").sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const cidadeMeans=means.filter(m=>m.reference_id===ref.id&&m.alarm_level==="Frente Cidade - Parque Ribeirinho").sort((a,b)=>(a.display_order??1)-(b.display_order??1));
          const maxRows=Math.max(aeroportoMeans.length,cidadeMeans.length);
          if(maxRows===0) return;
          for(let i=1;i<=maxRows;i++){
            const tr=document.createElement("tr");
            renderPPIAeroAlarmCells(tr,aeroportoMeans.find(m=>(m.display_order??1)===i));
            renderPPIAeroAlarmCells(tr,cidadeMeans.find(m=>(m.display_order??1)===i));
            tbody.appendChild(tr);
          }
        });
        table.appendChild(tbody); tempContainer.appendChild(table);
        container.innerHTML=""; tempContainer.style.display="block"; container.appendChild(tempContainer);
        ppiaeroABSNoteTable(tempContainer);
      } catch(err) {
        console.error("❌ Erro ao carregar grelha B1:",err);container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    function ppiaeroABSNoteTable(container) {
      const table=document.createElement("table"); table.classList.add("table-elements"); Object.assign(table.style,AERO_ABS_NOTE_STYLE);
      const tr=document.createElement("tr"), td=document.createElement("td");
      Object.assign(td.style,{padding:"5px",textAlign:"left",whiteSpace:"pre-line",border:"none"});
      const line1=document.createElement("span"); line1.textContent="* As ABSC a despacho para o PPI do Aeroporto Gago Coutinho, não devem ser as afetas ao PEM do INEM.\n";
      Object.assign(line1.style,{fontSize:"12px",fontWeight:"bold",fontStyle:"italic"});
      const line2=document.createElement("span"); line2.textContent="** Equipas com capacidade de Resgate."; Object.assign(line2.style,{fontSize:"12px",fontWeight:"bold",fontStyle:"italic"});
      td.append(line1,line2); tr.appendChild(td); table.appendChild(tr); container.appendChild(table);
    }
    /* ===== PPI LINHA FÉRREA DO ALGARVE ===== */
    function consultationGridLinFerKmType() {
      document.getElementById("ppilinfer-main-options").style.display="none";
      ShowLinFerPKmControls();
    }
    function consultationGridLinFerSectionType() {
      document.getElementById("ppilinfer-main-options").style.display="none";
      ShowLinFerSectionControls();
    }
    function consultationGridLinFerButtonType() {
      document.getElementById("ppilinfer-main-options").style.display="none";
      document.getElementById("ppilinfer-grid-controls").style.display="block";
      ShowLinFerGridButtons();
    }
    function createLinFerGridButtons(id, specialButtons) {
      const btn=document.createElement("button"); btn.id=id; btn.textContent=id; btn.className="btn btn-add options-btn"; btn.style.cssText=LINFER_GRID_BUTTON_STYLE;
      if(specialButtons.has(id)&&getCorpNr()==="0805") btn.classList.add("options-yellow-btn");
      btn.onclick=e=>{
        e.preventDefault();
        const isActive=btn.classList.contains("active");
        document.querySelectorAll("#ppilinfer-grid-controls button").forEach(b=>b.classList.remove("active"));
        if(isActive){clearPPIContainers("ppilinfer");const a=document.getElementById("ppilinfer-abs-note");if(a)a.innerHTML="";}
        else{btn.classList.add("active");loadPPILinFerDataFromButton(id);}
      };
      return btn;
    }
    function ShowLinFerGridButtons() {
      const container=document.getElementById("ppilinfer-grid-controls"); if(!container) return;
      Object.assign(container.style,{display:"flex",flexDirection:"column",alignItems:"center"}); container.innerHTML="";
      const sec=document.createElement("div"); sec.className="ppi-dir";   /* grelhas num contentor */
      const titleRow=document.createElement("div"); titleRow.className="major-row"; titleRow.style.cssText=LINFER_TITLE_STYLE;
      const label=document.createElement("label"); label.textContent="GRELHAS DE ALARME"; titleRow.appendChild(label); sec.appendChild(titleRow); container.appendChild(sec);
      const specialButtons=new Set(["F","G","H","I","J","K","L","M","N","O","P"]);
      const rowButtons=document.createElement("div"); rowButtons.className="major-row"; rowButtons.style.cssText=LINFER_ROW_STYLE; rowButtons.style.justifyContent="center";
      "ABCDEFGHIJKLMNOP".split("").forEach(letter=>rowButtons.appendChild(createLinFerGridButtons(letter,specialButtons)));
      sec.appendChild(rowButtons);
    }
    // Carrega tudo em paralelo; as tabelas que já estão no ecrã são atualizadas no sítio (sem as apagar e voltar a criar)
    async function loadPPILinFerAll(gridId) {
      await Promise.all([loadPPILinFerDataInfoGrid(gridId), loadPPILinFerDataSpecials(gridId), loadPPILinFerGridSeparated(gridId)]);
    }
    async function loadPPILinFerDataFromButton(buttonId) {
      return ppiHoldRun("ppilinfer", async () => {
        await loadPPILinFerAll(buttonId);
        const tempContainer=document.getElementById("ppilinfer-grid-container")?.firstChild;
        if(tempContainer) createFinalHTable(tempContainer);
        ppiLinFerABSNoteTable(ensureAbsContainer("ppilinfer-abs-note","ppilinfer-grid-controls"), buttonId);
      });
    }
    async function loadPPILinFerDataFromKm(km, sentido) {
      try {
        ["ppilinfer-grid-container","ppilinfer-grid-references","ppilinfer-specials-container","ppilinfer-abs-note"]
          .forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML="";});
        const data=await fetchFromSupabase("ppilinfer_data",`ppi_sence=ilike.*${sentido}*`);
        const filtered=data.filter(ppi=>{
          const f=parseFloat(ppi.ppi_first_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          const s=parseFloat(ppi.ppi_secound_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          return km>=Math.min(f,s)&&km<=Math.max(f,s);
        });
        if(!filtered.length){
          showPopup('popup-danger', "Nenhuma grelha encontrada para este ponto quilométrico no troço selecionado.");
          return;
        }
        const limiteGrelhas=filtered.filter(ppi=>{
          const f=parseFloat(ppi.ppi_first_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          const s=parseFloat(ppi.ppi_secound_pkm?.match(/PK\s*([\d,]+)/i)?.[1]?.replace(',','.')||0);
          return km===f||km===s;
        });
        if(limiteGrelhas.length>1){
          const grelhas=limiteGrelhas.map(p=>p.grid_id).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
          showPopup('popup-danger', `O Ponto Quilométrico <b style="color:red">${km.toFixed(3)}</b> corresponde ao limite entre duas grelhas 
                                     <b style="color:red">${grelhas.length===2?grelhas.join(" e "):grelhas.join(", ")}</b>.<br>Para garantir maior precisão na atribuição de meios, 
                                     recomenda-se a consulta direta por grelha. Obrigado.`);
          return;
        }
        const gridContainer=document.getElementById("ppilinfer-grid-container");
        for(const ppi of filtered){
          const gridId=ppi.grid_id;
          await loadPPILinFerAll(gridId);
          const tempContainer=gridContainer.firstChild; if(tempContainer) createFinalHTable(tempContainer);
          ppiLinFerABSNoteTable(ensureAbsContainer("ppilinfer-abs-note","ppilinfer-grid-controls"), gridId);
        }
      } catch(err){
        console.error("Erro ao carregar dados:",err);alert("❌ Erro ao carregar dados. Veja o console.");
      }
    }
    async function loadPPILinFerDataFromSection(sectionStr) {
      const gridContainer = document.getElementById("ppilinfer-grid-container");
      const specialsContainer = document.getElementById("ppilinfer-specials-container");
      if (!gridContainer) return;
      try {
        const data = await fetchFromSupabase("ppilinfer_data", `ppi_sence=eq.${encodeURIComponent(sectionStr)}`);
        if (!data || data.length === 0) {
          ["ppilinfer-grid-references", "ppilinfer-specials-container", "ppilinfer-abs-note"]
            .forEach(id => {const el = document.getElementById(id); if (el) el.innerHTML = "";});
          gridContainer.innerHTML = '<div class="alert alert-warning">Nenhum dado encontrado para o troço selecionado.</div>';
          return;
        }
        for (const ppi of data) {
          const gridId = ppi.grid_id;
          await loadPPILinFerAll(gridId);
          const tempContainer = gridContainer.firstChild;
          if (tempContainer) {
            createFinalHTable(tempContainer);
          }
          ppiLinFerABSNoteTable(ensureAbsContainer("ppilinfer-abs-note", "ppilinfer-grid-controls"), gridId);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do troço ferroviário:", err);
        gridContainer.innerHTML = '<div class="alert alert-danger">Erro ao processar a pesquisa.</div>';
      }
    }
    /* ─── LINFER CELL HELPERS ────────────────────────────────── */
    function createTd(text="",colSpan=1,rowSpan=1,align="left",bold=false,border="1px",bgColor="",color="",fontSize="14px") {
      const td=document.createElement("td"); td.colSpan=colSpan; td.rowSpan=rowSpan; td.textContent=text;
      let css=`border:${border} solid #bbb;padding:5px;text-align:${align};font-weight:${bold?"bold":"normal"};font-size:${fontSize};`;
      if(bgColor) css+=` background:${bgColor};`; if(color) css+=` color:${color};`;
      td.style.cssText=css; return td;
    }
    function createPkmTd(pkmStr) {
      const td=document.createElement("td"); td.style.cssText=`border:1px solid #bbb;padding:5px;text-align:center;vertical-align:middle;`;
      if(!pkmStr) return td;
      const parts=pkmStr.split('\\n');
      const firstLine=document.createElement("div"); firstLine.textContent=parts[0]||""; firstLine.style.cssText=LINFER_PKM_FIRST_LINE_STYLE;
      td.appendChild(firstLine);
      if(parts[1]){const secondLine=document.createElement("div");secondLine.textContent=parts[1];secondLine.style.cssText=LINFER_PKM_SECOND_LINE_STYLE;td.appendChild(secondLine);}
      return td;
    }
    async function loadPPILinFerDataInfoGrid(gridId) {
      const container=document.getElementById("ppilinfer-grid-references"); if(!container) return;
      ensureLoadingMarker(container);
      const loading=container.querySelector(".loading-mark"); loading.style.display="block";
      try {
        const corpNr=getCorpNr();
        const [data, refs] = await Promise.all([fetchFromSupabase("ppilinfer_data",`grid_id=eq.${gridId}`),
                                                fetchFromSupabase("ppilinfer_references",`grid_code=eq.${gridId}`)]);
        const means=refs.length?await fetchFromSupabase("ppilinfer_means",`reference_id=in.(${refs.map(r=>r.id).join(",")})`):[]; 
        createOrUpdateInterventionNotice(container,corpNr&&means.some(m=>typeof m.means==="string"&&m.means.includes(corpNr)));
        if(!data.length) return renderNoData(container);
        const ppi=data[0];
        let table=container.querySelector("table");
        if(!table){table=document.createElement("table");table.className="table-elements";table.style.cssText=LINFER_TABLE_STYLE;container.appendChild(table);}
        table.innerHTML="";
        table.appendChild(createColGroup(["200px","200px","calc(33% - 40px)","calc(33% - 40px)"]));
        const tr1=document.createElement("tr");
        tr1.append(createTd("",2,2,"center","bold","0px"),createTd(`GRELHA ${ppi.grid_id} - ${ppi.ppi_sence||"TROÇO"}`,2,1,"center","bold","1px","#323ac2","#e6e6e6","16px"));
        table.appendChild(tr1);
        const tr2=document.createElement("tr"); tr2.append(createPkmTd(ppi.ppi_first_pkm),createPkmTd(ppi.ppi_secound_pkm)); table.appendChild(tr2);
        const municipalities=(Array.isArray(ppi.ppi_municipalities)?ppi.ppi_municipalities:(ppi.ppi_municipalities||"{}").replace(/[{}"]/g,"").split(",").map(s=>s.trim()));
        [["COORDENADAS",ppi.ppi_first_coordinate,ppi.ppi_secound_coordinate],
         ["ALTITUDE(m)",ppi.ppi_first_height??"",ppi.ppi_secound_height??""],
         ["MUNICÍPIOS(s)",municipalities.join(", ")||"",""]
        ].forEach(([label,col1,col2],idx)=>{
          const tr=document.createElement("tr"); tr.appendChild(createTd(label,2,1,"left","bold"));
          tr.appendChild(idx===2?createTd(col1,2,1,"center","bold"):createTd(col1,1,1,"center","bold"));
          if(idx!==2) tr.appendChild(createTd(col2,1,1,"center","bold"));
          table.appendChild(tr);
        });
      } catch(err){console.error("❌ Erro ao carregar PPI Linha Férrea:",err);showError(container,"Erro ao carregar PPI data. Veja o console.");}
      finally{loading.style.display="none";}
    }
    async function loadPPILinFerDataSpecials(gridId) {
      const container=ensureSpecialsContainer("ppilinfer-specials-container","ppilinfer-grid-container",null,true);
      if(!container) return;
      if(!container.querySelector(".ppilinfer-title")){
        const titleDiv=document.createElement("div"); titleDiv.textContent="SITUAÇÕES ESPECIAIS"; titleDiv.className="ppilinfer-title"; titleDiv.style.cssText=LINFER_SPECIAL_TITLE_STYLE; container.appendChild(titleDiv);
      }
      let dataContainer=container.querySelector(".ppilinfer-data");
      if(!dataContainer){dataContainer=document.createElement("div");dataContainer.className="ppilinfer-data";container.appendChild(dataContainer);}
      try {
        const res=await fetch(`${SUPABASE_URL}/rest/v1/ppilinfer_specials?select=*&grid_code=eq.${gridId}&order=row_order`,{headers:getSupabaseHeaders()});
        if(!res.ok) throw new Error(`Erro ao buscar ppilinfer_specials: ${res.status}`);
        const specials=await res.json();
        dataContainer.innerHTML=specials.length?specials.map(s=>{const div=document.createElement("div");div.style.cssText=LINFER_SPECIAL_ITEM_STYLE;div.innerHTML=formatSpecialsContentWithHighlights(s.content);return div.outerHTML;}).join(""):"Sem informações especiais para esta grelha.";
      } catch(err){console.error("❌ Erro ao carregar specials Linha Férrea:",err);dataContainer.innerHTML="Erro ao carregar informações especiais. Veja o console.";}
    }
    async function loadPPILinFerGridSeparated(gridId) {
      const container=document.getElementById("ppilinfer-grid-container"); if(!container) return;
      const tempContainer=document.createElement("div"); tempContainer.style.display="none";
      try {
        const corpNr=getCorpNr();
        const references=await fetchFromSupabase("ppilinfer_references",`grid_code=eq.${gridId}`);
        if(!references.length){container.innerHTML="Sem referências para esta grelha.";return;}
        const means=await fetchFromSupabase("ppilinfer_means",`reference_id=in.(${references.map(r=>r.id).join(",")})`);
        const occurrenceTypes={"Acidente - Abalroamento, Choque e Descarrilamento":"#a5d6a7","Substâncias Perigosas - Produtos Químicos/Produtos Biológicos":"#ffcc80","Incêndio em Transportes":"#90caf9"};
        tempContainer.appendChild(buildOccurrenceTable(occurrenceTypes,references,means,'LinhaFerrea',gridId,["80px","calc(33% - 40px)","80px","calc(33% - 40px)","33%"]));
        container.innerHTML=""; container.appendChild(tempContainer); tempContainer.style.display="block";
        createOrUpdateCumulativeAlert(tempContainer);
      } catch(err){
        console.error("❌ Erro ao carregar grelha Linha Férrea:",err);container.textContent="Erro ao carregar grelha. Veja o console.";
      }
    }
    function ppiLinFerABSNoteTable(container, buttonId) {
      if(!container||!buttonId) return;
      const letter=buttonId.toUpperCase();
      if(!"ABCDEFGHIJKLMNOP".includes(letter)) return;
      container.innerHTML="";
      const table=Object.assign(document.createElement("table"),{className:"table-elements"});
      table.style.cssText=LINFER_ABS_TABLE_STYLE;
      const td=Object.assign(document.createElement("td"),{innerHTML:`<b>* As ABSC</b> a despacho para o PPI da Linha Férrea do Algarve, não devem ser as afetas ao PEM do INEM, 
                                                                         sendo complementares às mobilizadas pelo CODU do INEM (GRELHA ${letter} - INEM)`});
      td.style.cssText=LINFER_ABS_CELL_STYLE;
      const tr=document.createElement("tr"); tr.appendChild(td); table.appendChild(tr); container.appendChild(table);
    }
    /* =======================================
       REFUSALS OF SERVICES AND INOPs INEM
    ======================================= */
    /* =======================================
       REFUSAL OF TRANSPORT SERVICES
    ======================================= */
    /* ========== VERIFICATION OF REFUSAL FIELDS ========== */
    function validateRequiredServiceRefusalFields() {
      const missingFields = [];
      const refusalTime = document.getElementById('service_refusal_time')?.value.trim();
      const serviceType = document.getElementById('service_refusal_type')?.value.trim();
      const refusalMotive = document.getElementById('service_refusal_motive')?.value.trim();
      const serviceOrigin = document.getElementById('service_refusal_origin')?.value.trim();
      const serviceDestination = document.getElementById('service_refusal_destination')?.value.trim();
      const optelRefusal = document.getElementById('service_refusal_optel')?.value.trim();
      const validatedRefusal = document.getElementById('service_refusal_validation')?.value.trim();
      if (!refusalTime) missingFields.push("Hora da Recusa");
      if (!serviceType) missingFields.push("Tipo de Serviço");
      if (!refusalMotive) missingFields.push("Motivo da Recusa");
      if (!serviceOrigin) missingFields.push("Origem do Serviço");
      if (!serviceDestination) missingFields.push("Destino do Serviço");
      if (!optelRefusal) missingFields.push("Optel de Serviço");
      if (!validatedRefusal) missingFields.push("Validado por");
      if (missingFields.length > 0) {
        const list = missingFields.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
        return false;
      }
      return true;
    }
    /* ============= INSERTION OF NEW REFUSAL ============= */
    async function insertServiceRefusal() { 
      if (!validateRequiredServiceRefusalFields()) return;
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      const payload = {corp_oper_nr: corpOperNr, refusal_date: document.getElementById('service_refusal_date').value, refusal_time: document.getElementById('service_refusal_time').value,
                       service_type: document.getElementById('service_refusal_type').value, reason_for_refusal: document.getElementById('service_refusal_motive').value,
                       service_origin: document.getElementById('service_refusal_origin').value, service_destination: document.getElementById('service_refusal_destination').value,
                       optel_refusal: document.getElementById('service_refusal_optel').value, validated_refusal: document.getElementById('service_refusal_validation').value};
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showPopup('popup-success', "Recusa de serviço registada com sucesso!");
          loadServiceRefusals();
          document.getElementById('service_refusal_time').value = '';
          document.getElementById('service_refusal_type').value = '';
          document.getElementById('service_refusal_motive').value = '';
          document.getElementById('service_refusal_origin').value = '';
          document.getElementById('service_refusal_destination').value = '';
          document.getElementById('service_refusal_optel').value = '';
          document.getElementById('service_refusal_validation').value = '';
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao gravar recusa:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ================ REFUSAL ELIMINATION =============== */
    async function deleteServiceRefusal(id) {
      if (!confirm("Tem certeza que quer eliminar este registro?")) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?id=eq.${id}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (res.ok) {
          showPopup('popup-success', "Registro eliminado!");
          loadServiceRefusals();
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao eliminar registro:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ========== FORMATTING DATES IN THE TABLE =========== */
    function ServiceRefusalsformatDate(dateStr) {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    /* ================= LOADING REFUSALS ================= */
    async function loadServiceRefusals() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        const url = `${SUPABASE_URL}/rest/v1/service_refusals?corp_oper_nr=eq.${corpOperNr}&order=refusal_date.desc`;
        const res = await fetch(url, {
          headers: getSupabaseHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const tbody = document.querySelector("#service-refusals-table tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        if (data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #666;">Não foram encontradas recusas para a corporação ${corpOperNr}.</td></tr>`;
          return;
        }
        data.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${ServiceRefusalsformatDate(item.refusal_date)}</td>
            <td>${item.refusal_time}</td>
            <td>${item.service_type}</td>
            <td>${item.service_origin}</td>
            <td>${item.service_destination}</td>
            <td>${item.reason_for_refusal}</td>
            <td>${item.optel_refusal}</td>
            <td>${item.validated_refusal}</td>
            <td style="width: 10px;"><button class="btn-delete" onclick="deleteServiceRefusal('${item.id}')"><i class="fa-solid fa-trash-can"></i></button></td>
          `;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Erro ao carregar recusas:", error);
      }
    }
    /* ============= FILTER REFUSALS BY YEAR ============== */
    function filterServiceRefusalsByYear(year) {
      const rows = document.querySelectorAll('#service-refusals-table tbody tr');
      rows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) {
          const [day, month, yearStr] = dateCell.textContent.split('-');
          row.style.display = yearStr == year ? '' : 'none';
        }
      });
    }
    function populateRefusalsYearFilter() {
      const select = document.getElementById('refusals_year_filter');
      if (!select) return;
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }
    }
    const yearSelect = document.getElementById('refusals_year_filter');
    if (yearSelect) {
      yearSelect.addEventListener('change', function() {
        filterServiceRefusalsByYear(this.value);
      });
    }
    populateRefusalsYearFilter();
    /* ============== LOAD REFUSALS ON OPEN =============== */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId === 'page-recserv') {
          loadServiceRefusals();
        }
      });
    });
    /* =======================================
    INEM NON-OPERATIONALITY
    ======================================= */
    /* ==== VERIFICATION OF NON-OPERATIONALITY FIELDS ===== */
    function validateRequiredIneInopFields() {
      const missingFields = [];
      const ineinopDate = document.getElementById('ineinop_date')?.value.trim();
      const ineinopShift = document.getElementById('ineinop_shift')?.value.trim();
      const ineinopHourQtd = document.getElementById('ineinop_hour_qtd')?.value.trim();
      const reasonForIneInop = document.getElementById('reason_for_ineinop')?.value.trim();
      const ineinopCrew = document.getElementById('ineinop_crew')?.value.trim();
      const optelRefusal = document.getElementById('ineinop_optel')?.value.trim();
      const validatedRefusal = document.getElementById('ineinop_validation')?.value.trim();
      if (!ineinopShift) missingFields.push("Turno");
      if (!ineinopHourQtd) missingFields.push("Horas/Qtde");
      if (!reasonForIneInop) missingFields.push("Motivo");
      if (!ineinopCrew) missingFields.push("Tripulação");
      if (!optelRefusal) missingFields.push("Optel de Serviço");
      if (!validatedRefusal) missingFields.push("Validado por");
      if (missingFields.length > 0) {
        const list = missingFields.map(f => `</li><li style="list-style:none;">• ${f}`).join('');
        showPopup('popup-danger', `<strong>PREENCHA OS CAMPOS OBRIGATÓRIOS:</strong><br><br>${list}`);
        return false;
      }
      return true;
    }
    /* ======= INSERTION OF NEW NON-OPERATIONALITY ======== */
    async function insertIneInop() {
      if (!validateRequiredIneInopFields()) return;
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');    
      const payload = {corp_oper_nr: corpOperNr, ineinop_date: document.getElementById('ineinop_date').value, ineinop_shift: document.getElementById('ineinop_shift').value,
                       ineinop_hour_qtd: document.getElementById('ineinop_hour_qtd').value, reason_for_ineinop: document.getElementById('reason_for_ineinop').value,
                       ineinop_crew: document.getElementById('ineinop_crew').value, optel_refusal: document.getElementById('ineinop_optel').value,
                       validated_refusal: document.getElementById('ineinop_validation').value};    
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop`, {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify(payload)
        });    
        if (res.ok) {
          showPopup('popup-success', "Inoperacionalidade registada com sucesso!");
          loadIneInops();
          document.getElementById('ineinop_shift').value = '';
          document.getElementById('ineinop_hour_qtd').value = '';
          document.getElementById('reason_for_ineinop').value = '';
          document.getElementById('ineinop_crew').value = '';
          document.getElementById('ineinop_optel').value = '';
          document.getElementById('ineinop_validation').value = '';
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao gravar inoperacionalidade:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ============= REMOVAL OF INOPERABILITY ============= */
    async function deleteIneInop(id) {
      if (!confirm("Tem certeza que quer eliminar este registro?")) return;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?id=eq.${id}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (res.ok) {
          showPopup('popup-success', "Registro eliminado!");
          loadIneInops();
        } else {
          const err = await res.text();
          showPopup('popup-danger', "Erro ao eliminar registro:\n" + err);
        }
      } catch (error) {
        console.error(error);
        showPopup('popup-danger', "Erro de conexão com o servidor.");
      }
    }
    /* ========== FORMATTING DATES IN THE TABLE =========== */
    function IneInopFormatDate(dateStr) {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    /* =========== LOADING NON-OPERATIONALITIES =========== */
    async function loadIneInops(yearFilter = null) {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        let url = `${SUPABASE_URL}/rest/v1/inem_inop?corp_oper_nr=eq.${corpOperNr}&order=ineinop_date.desc`;
        if (yearFilter) url += `&ineinop_date=ilike.${yearFilter}%`;    
        const res = await fetch(url, {
          headers: getSupabaseHeaders()
        });    
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const tbody = document.querySelector("#ineinop-table tbody");
        if (!tbody) return;    
        tbody.innerHTML = "";        
        if (data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                Não foram encontradas inoperacionalidades INEM para a corporação ${corpOperNr}.
              </td>
            </tr>`;
          return;
        }    
        data.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${IneInopFormatDate(item.ineinop_date)}</td>
            <td>${item.ineinop_shift}</td>
            <td>${item.ineinop_hour_qtd}</td>
            <td>${item.reason_for_ineinop}</td>
            <td>${item.ineinop_crew}</td>
            <td>${item.optel_refusal}</td>
            <td>${item.validated_refusal}</td>
            <td style="width: 10px;"><button class="btn-delete" onclick="deleteIneInop('${item.id}')"><i class="fa-solid fa-trash-can"></i></button></td>
          `;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Erro ao carregar inoperacionalidades:", error);
      }
    }
    /* ======= FILTER NON-OPERATIONALITIES BY YEAR ======== */
    function filterIneInopByYear(year) {
      const rows = document.querySelectorAll('#ineinop-table tbody tr');
      rows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) {
          const [day, month, yearStr] = dateCell.textContent.split('-');
          row.style.display = yearStr == year ? '' : 'none';
        }
      });
    }
    function populateIneInopYearFilter() {
      const select = document.getElementById('ineinop_year_filter');
      if (!select) return;
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }
    }
    const ineYearSelect = document.getElementById('ineinop_year_filter');
    if (ineYearSelect) {
      ineYearSelect.addEventListener('change', function() {
        filterIneInopByYear(this.value);
      });
    }
    populateIneInopYearFilter();
    /* ======== LOAD NON-OPERATIONALITIES ON OPEN ========= */
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        if (pageId === 'page-ineminop') {
          loadIneInops();
        }
      });
    });
    /* =======================================
    MONTHLY REPORTS: REFUSALS & INOPS
    ======================================= */
    function initRecinoReportsFilters() {
      const monthSelect = document.getElementById('refusal_month_filter');
      const yearSelect = document.getElementById('refusal_year_filter');
      if (!monthSelect || !yearSelect) return;
      const monthLabelsLocal = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
      monthSelect.innerHTML = `<option value="ALL">Todos os Meses</option>` +
        monthLabelsLocal.map((m, i) => `<option value="${i}">${m}</option>`).join('');
      let yearHTML = '';
      for (let y = 2025; y <= 2035; y++) yearHTML += `<option value="${y}">${y}</option>`;
      yearSelect.innerHTML = yearHTML;
      const now = new Date();
      setTimeout(() => {
        monthSelect.value = String(now.getMonth());
        yearSelect.value = String(now.getFullYear());
      }, 0);
      monthSelect.addEventListener('change', loadRecinoReports);
      yearSelect.addEventListener('change', loadRecinoReports);
    }
    async function loadRecinoReports() {
      const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
      const monthSelect = document.getElementById('refusal_month_filter');
      const yearSelect = document.getElementById('refusal_year_filter');
      if (!monthSelect || !yearSelect) return;
      const selectedMonth = monthSelect.value;
      const selectedYear = parseInt(yearSelect.value);
      const monthLabelsLocal = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
      const parseHourQty = (str) => {
        if (!str) return { h: 0, m: 0 };
        const [h, m] = str.split(':').map(Number);
        return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
      };
      const sumHours = (records) => {
        let totalH = 0, totalM = 0;
        records.forEach(r => {
          const { h, m } = parseHourQty(r.ineinop_hour_qtd);
          totalH += h; totalM += m;
        });
        totalH += Math.floor(totalM / 60);
        totalM = totalM % 60;
        return `${totalH}h ${totalM}m`;
      };
      const filterByYearMonth = (records, dateField) => records.filter(r => {
        const d = parseDateFlexible(r[dateField]);
        if (isNaN(d)) return false;
        if (d.getFullYear() !== selectedYear) return false;
        if (selectedMonth !== 'ALL' && d.getMonth() !== parseInt(selectedMonth)) return false;
        return true;
      });
      const monthsToShow = selectedMonth === 'ALL'
        ? monthLabelsLocal.map((name, i) => ({ name, index: i }))
        : [{ name: monthLabelsLocal[parseInt(selectedMonth)], index: parseInt(selectedMonth) }];
      try {
        /* --- RECUSAS --- */
        const refRes = await fetch(
          `${SUPABASE_URL}/rest/v1/service_refusals?select=refusal_date,service_type&corp_oper_nr=eq.${corpOperNr}`,
          { headers: getSupabaseHeaders() }
        );
        if (!refRes.ok) throw new Error('Falha ao carregar service_refusals');
        const allRefusals = await refRes.json();
        const refusals = filterByYearMonth(allRefusals, 'refusal_date');
        const refByType = {};
        refusals.forEach(r => {
          const type = r.service_type || '(sem tipo)';
          refByType[type] = (refByType[type] || 0) + 1;
        });
        const refBody = document.getElementById('table-refusals-body');
        const refTotal = document.getElementById('table-refusals-total');
        if (refBody) {
          const types = Object.keys(refByType);
          if (types.length === 0) {
            refBody.innerHTML = `<tr><td colspan="2" style="text-align:center;padding:12px;color:#aaa;">Sem registos</td></tr>`;
          } else {
            refBody.innerHTML = types.map(t =>
              `<tr style="border-bottom:1px solid #f1f3f5;">
                <td style="padding:6px 10px;">${t}</td>
                <td style="padding:6px 10px;text-align:center;font-weight:600;">${refByType[t]}</td>
              </tr>`
            ).join('');
          }
          if (refTotal) refTotal.textContent = refusals.length;
        }
        /* --- INOPS --- */
        const inopRes = await fetch(
          `${SUPABASE_URL}/rest/v1/inem_inop?select=ineinop_date,ineinop_shift,ineinop_hour_qtd,reason_for_ineinop&corp_oper_nr=eq.${corpOperNr}`,
          { headers: getSupabaseHeaders() }
        );
        if (!inopRes.ok) throw new Error('Falha ao carregar inem_inop');
        const allInops = await inopRes.json();
        const inops = filterByYearMonth(allInops, 'ineinop_date');
        const buildInopTable = (shift, bodyId, totalQtyId, totalHrsId) => {
          const shiftData = inops.filter(r => (r.ineinop_shift || '').toUpperCase() === shift);
          const body = document.getElementById(bodyId);
          const totalQty = document.getElementById(totalQtyId);
          const totalHrs = document.getElementById(totalHrsId);
          if (!body) return;
          const rows = monthsToShow.flatMap(({ name, index }) => {
            const monthRecords = shiftData.filter(r => parseDateFlexible(r.ineinop_date).getMonth() === index);
            if (monthRecords.length === 0) return [];
            return monthRecords.map(r => `
              <tr style="border-bottom:1px solid #f1f3f5;">
                <td style="padding:6px 10px;text-align:center;">${name}</td>
                <td style="padding:6px 10px;text-align:center;">${r.reason_for_ineinop || '-'}</td>
                <td style="padding:6px 10px;text-align:center;font-weight:600;">1</td>
                <td style="padding:6px 10px;text-align:center;">${r.ineinop_hour_qtd || '-'}</td>
              </tr>
            `);
          });
          if (rows.length === 0) {
            body.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:12px;color:#aaa;">Sem registos</td></tr>`;
          } else {
            body.innerHTML = rows.join('');
          }
          if (totalQty) totalQty.textContent = shiftData.length;
          if (totalHrs) totalHrs.textContent = sumHours(shiftData);
        };
        buildInopTable('D', 'table-inemD-body', 'table-inemD-total-qty', 'table-inemD-total-hrs');
        buildInopTable('N', 'table-inemN-body', 'table-inemN-total-qty', 'table-inemN-total-hrs');
      } catch (e) {
        console.error('❌ Erro ao carregar relatório:', e);
        showPopup('popup-danger', 'Erro ao carregar relatório.');
      }
    }
    function loadRecinoReportsPage() {
      initRecinoReportsFilters();
      setTimeout(() => {
        loadRecinoReports();
      }, 5);
    }
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('data-page') === 'page-recinoreports') {
          loadRecinoReportsPage();
        }
      });
    });
    /* =======================================
    DASHBOARD: NON-OPERATIONALITIES
    DASHBOARD: REFUSALS
    ======================================= */
    const monthLabels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const charts = {};
    function parseDateFlexible(dateStr) {
      if (!dateStr) return new Date(NaN);
      const cleanStr = String(dateStr).trim();
      if (cleanStr.includes('-')) {
        const parts = cleanStr.split('-');
        if (parts[0].length === 4) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      return new Date(cleanStr);
    }
    function groupByMonth(records, dateField) {
      const monthCounts = {};
      records.forEach(item => {
        if (!item[dateField]) return;
        const date = parseDateFlexible(item[dateField]);
        if (isNaN(date)) return;
        const month = date.getMonth();
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });
      return monthCounts;
    }
    function createOrUpdateChart(canvasId, labels, data, label, color) {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      if (charts[canvasId]) {
        charts[canvasId].data.labels = labels;
        charts[canvasId].data.datasets[0].data = data;
        charts[canvasId].update('none');
      } else {
        charts[canvasId] = new Chart(ctx, {
          type: 'line',
          data: {labels, datasets: [{label, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, pointRadius: 5}]},
          options: {responsive: true,
            plugins: {legend: { display: true},
            tooltip: {mode: 'index', intersect: false}},
            scales: {y: {beginAtZero: true, ticks: {stepSize: 1}}}}});}}
    function createOrUpdateMultiDatasetChart(canvasId, labels, datasets) {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      if (charts[canvasId]) {
        charts[canvasId].data.labels = labels;
        charts[canvasId].data.datasets = datasets;
        charts[canvasId].update('none');
      } else {
        charts[canvasId] = new Chart(ctx, {
          type: 'line',
          data: {labels, datasets},
          options: {responsive: true,
            plugins: {legend: {display: true},
            tooltip: {mode: 'index', intersect: false}},
            scales: {y: {beginAtZero: true, ticks: {stepSize: 1}}}}});}}    
    /* ================== INICIALIZAR FILTROS ===================== */
    function initializeDashboardFilters() {
      const monthSelect = document.getElementById('dashboard_refusal_month_filter');
      const yearSelect = document.getElementById('dashboard_refusal_year_filter');
      if (!monthSelect || !yearSelect) return;
      const monthLabels = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho", "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
      monthSelect.innerHTML = `<option value="ALL">Todos os Meses</option>` + monthLabels.map((m, i) => `<option value="${i}">${m}</option>`).join('');
      let yearHTML = "";
      for (let y = 2025; y <= 2035; y++) {
        yearHTML += `<option value="${y}">${y}</option>`;
      }
      yearSelect.innerHTML = yearHTML;
      const now = new Date();
      setTimeout(() => {
        const currentMonth = String(new Date().getMonth());
        const currentYear = String(new Date().getFullYear());
        const validYears = Array.from({ length: 11 }, (_, i) => String(2025 + i));
        let savedMonth = sessionStorage.getItem('dash_filter_month');
        let savedYear = sessionStorage.getItem('dash_filter_year');
        const monthOptions = Array.from(monthSelect.options).map(o => o.value);
        if (!monthOptions.includes(savedMonth)) {
          savedMonth = currentMonth;
        }
        if (!validYears.includes(savedYear)) {
          savedYear = currentYear;
        }
        monthSelect.value = savedMonth;
        yearSelect.value = savedYear;
        sessionStorage.setItem('dash_filter_month', savedMonth);
        sessionStorage.setItem('dash_filter_year', savedYear);
      }, 0);
    }
    /* ================== ESCUTADOR DE EVENTOS ===================== */
    document.addEventListener('DOMContentLoaded', () => {
      const monthSelect = document.getElementById('dashboard_refusal_month_filter');
      const yearSelect = document.getElementById('dashboard_refusal_year_filter');
      if (monthSelect) {
        monthSelect.addEventListener('change', () => {
          sessionStorage.setItem('dash_filter_month', monthSelect.value);
          loadIneInopsCharts();
          loadServiceRefusalsCharts();
          loadSummaryData();
        });
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', () => {
          sessionStorage.setItem('dash_filter_year', yearSelect.value);
          loadIneInopsCharts();
          loadServiceRefusalsCharts();
          loadSummaryData();
        });
      }
    });
    /* ================== SUMMARY DATA & CARTS FILTERS ===================== */
    async function loadSummaryData() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        const targetYear = parseInt(sessionStorage.getItem('dash_filter_year') || new Date().getFullYear());
        const targetMonth = sessionStorage.getItem('dash_filter_month') || "ALL";
        const inemRes = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?select=ineinop_date,ineinop_shift,ineinop_hour_qtd&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!inemRes.ok) throw new Error("Falha ao carregar inem_inop");
        const rawInemData = await inemRes.json();
        const inemData = rawInemData.filter(r => {
          const d = parseDateFlexible(r.ineinop_date);
          if (isNaN(d)) return false;
          const matchYear = d.getFullYear() === targetYear;
          const matchMonth = targetMonth === "ALL" || d.getMonth() === parseInt(targetMonth);
          return matchYear && matchMonth;
        });
        const parseHourQuantity = (str) => {
          if (!str) return {h: 0, m: 0};
          const [h, m] = str.split(':').map(Number);
          return {h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m};
        };    
        const sumTimes = (records) => {
          let totalH = 0, totalM = 0;
          records.forEach(r => {
            const {h, m} = parseHourQuantity(r.ineinop_hour_qtd);
            totalH += h;
            totalM += m;
          });
          totalH += Math.floor(totalM / 60);
          totalM = totalM % 60;
          return `<i class="fa-solid fa-clock"></i> ${totalH} Hrs. ${totalM} Mts.`;
        };
        document.getElementById("sum-inop-d").innerHTML = sumTimes(inemData.filter(r => (r.ineinop_shift || "").toUpperCase() === "D"));
        document.getElementById("sum-inop-n").innerHTML = sumTimes(inemData.filter(r => (r.ineinop_shift || "").toUpperCase() === "N"));
        document.getElementById("sum-inop-total").innerHTML = sumTimes(inemData);
        const refusalsRes = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?select=refusal_date&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });
        const rawRefusals = await refusalsRes.json();        
        const refusalsData = rawRefusals.filter(r => {
          const d = parseDateFlexible(r.refusal_date);
          if (isNaN(d)) return false;
          const matchYear = d.getFullYear() === targetYear;
          const matchMonth = targetMonth === "ALL" || d.getMonth() === parseInt(targetMonth);
          return matchYear && matchMonth;
        });
        document.getElementById("sum-refusals-total").innerHTML = `<i class="fa-solid fa-ban"></i> ${refusalsData.length}`;    
      } catch (e) {
        console.error("❌ Erro ao atualizar cards resumo:", e);
      }
    }
    /* ================== REFUSALS CHARTS ================= */
    const refusalColors = ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'];
    async function loadServiceRefusalsCharts() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        const targetYear = parseInt(sessionStorage.getItem('dash_filter_year') || new Date().getFullYear());
        const selectedMonth = sessionStorage.getItem('dash_filter_month') || "ALL";
        const res = await fetch(`${SUPABASE_URL}/rest/v1/service_refusals?select=refusal_date,service_type&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!res.ok) throw new Error(await res.text());
        const allRegistros = await res.json();        
        const registros = allRegistros.filter(r => {
          const d = parseDateFlexible(r.refusal_date);
          return !isNaN(d) && d.getFullYear() === targetYear;
        });        
        const serviceTypes = [...new Set(registros.map(r => r.service_type).filter(Boolean))];
        const datasets = serviceTypes.map((type, index) => {
          const typeRecords = registros.filter(r => r.service_type === type);
          const countsByMonth = groupByMonth(typeRecords, 'refusal_date');          
          const data = monthLabels.map((_, i) => {
            if (selectedMonth !== "ALL" && parseInt(selectedMonth) !== i) return 0;
            return countsByMonth[i] || 0;
          });
          const color = refusalColors[index % refusalColors.length];
          return {label: type, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, pointRadius: 5};
        });    
        createOrUpdateMultiDatasetChart('chart-refusals-type', monthLabels, datasets);
        const totalCounts = {};
        registros.forEach(r => {
          const d = parseDateFlexible(r.refusal_date);
          if (isNaN(d)) return;
          totalCounts[d.getMonth()] = (totalCounts[d.getMonth()] || 0) + 1;
        });        
        const totalData = monthLabels.map((_, i) => {
          if (selectedMonth !== "ALL" && parseInt(selectedMonth) !== i) return 0;
          return totalCounts[i] || 0;
        });
        createOrUpdateChart('chart-refusals-total', monthLabels, totalData, 'Total de Recusas', 'rgba(255, 159, 64, 0.7)');    
      } catch (e) {
        console.error("Erro Recusas:", e);
      }
    }
    /* ========= INEM NON-OPERATIONALITIES CHARTS ========= */
    async function loadIneInopsCharts() {
      try {
        const corpOperNr = sessionStorage.getItem('currentCorpOperNr');
        const targetYear = parseInt(sessionStorage.getItem('dash_filter_year') || new Date().getFullYear());
        const selectedMonth = sessionStorage.getItem('dash_filter_month') || "ALL";
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inem_inop?select=ineinop_date,ineinop_shift&corp_oper_nr=eq.${corpOperNr}`, {
          headers: getSupabaseHeaders()
        });        
        if (!res.ok) throw new Error(await res.text());
        const allRegistros = await res.json();
        
        const registros = allRegistros.filter(r => {
          const d = parseDateFlexible(r.ineinop_date);
          return !isNaN(d) && d.getFullYear() === targetYear;
        });        
        const dShifts = registros.filter(r => r.ineinop_shift === 'D');
        const nShifts = registros.filter(r => r.ineinop_shift === 'N');
        const dCounts = groupByMonth(dShifts, 'ineinop_date');
        const nCounts = groupByMonth(nShifts, 'ineinop_date');        
        const totalData = monthLabels.map((_, i) => {
          if (selectedMonth !== "ALL" && parseInt(selectedMonth) !== i) return 0;
          return (dCounts[i] || 0) + (nCounts[i] || 0);
        });
        createOrUpdateChart('chart-ine-d', monthLabels, monthLabels.map((_, i) => (selectedMonth !== "ALL" && parseInt(selectedMonth) !== i) ? 0 : (dCounts[i] || 0)), 'Inoperacionalidades D', 'rgba(75,192,192,0.6)');
        createOrUpdateChart('chart-ine-n', monthLabels, monthLabels.map((_, i) => (selectedMonth !== "ALL" && parseInt(selectedMonth) !== i) ? 0 : (nCounts[i] || 0)), 'Inoperacionalidades N', 'rgba(255,99,132,0.6)');   
        createOrUpdateChart('chart-ine-total', monthLabels, totalData, 'Inoperacionalidades Total', 'rgba(54,162,235,0.6)');    
      } catch (e) {
        console.error("Erro INEM Charts:", e);
      }
    }
    /* ================ LOAD DASHBOARD ==================== */
    function loadDashboardCharts() {
      initializeDashboardFilters();
      setTimeout(() => {
        loadIneInopsCharts();
        loadServiceRefusalsCharts();
        loadSummaryData();
      }, 5);
    }
    document.querySelectorAll('.sidebar-sub-submenu-button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('data-page') === 'page-dashboard') {
          loadDashboardCharts();
        }
      });
    });
    /* =======================================
    OPERATIONAL ANTICIPATION MEASURES
    ======================================= */
    async function _getMOAEmailCommonData(corpOperNr) {
      try {
        const corpRes = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corpOperNr}&select=logo_url,cb_name,corp_address,corp_cp,corp_localitie,corp_phone_mobile,corp_phone_landline,corp_email`, {
            headers: getSupabaseHeaders()
          }
        );
        const corpData = await corpRes.json();
        return {logoUrl: corpData[0]?.logo_url || "", cbName: corpData[0]?.cb_name || "", corpAddress: corpData[0]?.corp_address || "", corpCp: corpData[0]?.corp_cp || "", corpLocalitie: corpData[0]?.corp_localitie || "", 
                corpPhoneMobile: corpData[0]?.corp_phone_mobile || "", corpPhoneLandline: corpData[0]?.corp_phone_landline || "", corpEmail: corpData[0]?.corp_email || ""
               };
      } catch (err) {
        console.error("Erro ao carregar dados da corporação:", err);
        return {logoUrl: "", cbName: "", corpAddress: "", corpCp: "", corpLocalitie: "", corpPhoneMobile: "", corpPhoneLandline: "", corpEmail: ""};
      }
    }
    /* ================ SELECT UTILITIES =============== */
    function styleGrayIfSecond(select) {
      const updateColor = () => {
        select.style.color = select.selectedIndex === 1 ? "gray" : "black";
      };
      select.addEventListener("change", updateColor);
      updateColor();
    }
    function setupMOASelects(page) {
      page.querySelectorAll('select[id$="_sit"]').forEach(select => {
        if (select.options.length > 1) {
          select.selectedIndex = 1;
          styleGrayIfSecond(select);
        }
      });
      page.querySelectorAll('select[id$="_pront"]').forEach(select => {
        if (select.id !== "moa_ned_pront") {
          if (select.options.length > 1) {
            select.selectedIndex = 1;
            styleGrayIfSecond(select);
          }
        }
      });
      const nedPront = document.getElementById("moa_ned_pront");
      if (nedPront) {
        nedPront.innerHTML = "";
        const options = ["", "Indique a forma de notificação", "Via SMS", "Via e-mail", "Via Telefone", "Via SMS e WhatsApp"];
        options.forEach(opt => {
          const el = document.createElement("option");
          el.value = opt;
          el.textContent = opt;
          nedPront.appendChild(el);
        });
        nedPront.selectedIndex = 1;
        styleGrayIfSecond(nedPront);
      }
    }
    /* ====================== GDH ====================== */
    function updateMOAGDH() {
      const dateInit = document.getElementById("moa_date_init")?.value;
      const timeInit = document.getElementById("moa_time_init")?.value;
      const dateEnd = document.getElementById("moa_date_end")?.value;
      const timeEnd = document.getElementById("moa_time_end")?.value;
      const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
      function formatGDH(dateStr, timeStr) {
        if (!dateStr || !timeStr) return "";
        const d = new Date(dateStr + "T" + timeStr);
        const day = String(d.getDate()).padStart(2,"0");
        const hour = String(d.getHours()).padStart(2,"0");
        const min = String(d.getMinutes()).padStart(2,"0");
        const month = monthNames[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        return `${day}${hour}${min}${month}${year}`;
      }
      const gdhInitEl = document.getElementById("moa_gdh_init");
      const gdhEndEl = document.getElementById("moa_gdh_end");
      if (gdhInitEl) gdhInitEl.value = formatGDH(dateInit, timeInit);
      if (gdhEndEl) gdhEndEl.value = formatGDH(dateEnd, timeEnd);
    }
    ["moa_date_init","moa_time_init","moa_date_end","moa_time_end"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", updateMOAGDH);
    });
    /* resumo lateral da MOA e contador das medidas ligadas (só lê os campos) */
    function moaSummary() {
      const box = document.getElementById("moa-container"); if (!box) return;
      const v = id => (document.getElementById(id)?.value || "").trim();
      const ms = [...box.querySelectorAll(".slx-m")], on = ms.filter(m => m.querySelector(".slx-swi")?.checked);
      const cnt = document.getElementById("moa-count"); if (cnt) cnt.textContent = `${on.length} de ${ms.length} ativas`;
      updateMOAGDH();
      const lines = [`📋 MOA · ${v("moa_cb") || "—"}`, [v("moa_device_type"), v("moa_epe_type")].filter(Boolean).join(" · "),
                     v("moa_gdh_init") || v("moa_gdh_end") ? `${v("moa_gdh_init") || "?"} → ${v("moa_gdh_end") || "?"}` : "", ""];
      on.forEach(m => {
        const t = m.querySelector(".slx-mh")?.childNodes[2]?.textContent.trim() || "";
        const vals = [...m.querySelectorAll(".slx-mf select, .slx-mf input")].filter(x => !x.disabled || x.tagName === "SELECT").map(x => (x.tagName === "SELECT" ? x.options[x.selectedIndex]?.text : x.value) || "")
                     .map(x => x.trim()).filter(x => x && !/^Indique/i.test(x));
        lines.push(`• ${t}${vals.length ? `: ${vals.join(" · ")}` : ""}`);
      });
      if (!on.length) lines.push("Sem medidas ligadas.");
      const el = document.getElementById("moa-prev"); if (el) el.textContent = lines.filter((x, i) => x || i === 3).join("\n");
    }
    ["input", "change"].forEach(ev => document.getElementById("moa-container")?.addEventListener(ev, () => setTimeout(moaSummary, 0)));
    document.getElementById("NewMOABtn")?.addEventListener("click", () => setTimeout(moaSummary, 50));
    /* ================ EMAIL RECIPIENTS =============== */
    async function fetchMOARecipients(corpOperNr) {
      const categories = ["crepcmoa_mail_to", "crepcmoa_mail_cc", "crepcmoa_mail_bcc"];
      const url = `${SUPABASE_URL}/rest/v1/mails_config?category=in.(${categories.join(",")})&corp_oper_nr=eq.${corpOperNr}&select=category,value`;
      try {
        const resp = await fetch(url, {headers: getSupabaseHeaders()});
        if (!resp.ok) throw new Error("Falha ao buscar e-mails da MOA.");
        const data = await resp.json();
        const recipients = { to: [], cc: [], bcc: [] };
        data.forEach(row => {
          const emails = row.value?.split(",").map(e => e.trim()).filter(e => e) || [];
          if (row.category.endsWith("_to")) recipients.to = emails;
          if (row.category.endsWith("_cc")) recipients.cc = emails;
          if (row.category.endsWith("_bcc")) recipients.bcc = emails;
        });
        if (!recipients.to.length) recipients.to = [""];
        return recipients;
      } catch (err) {
        console.error("Erro emails MOA:", err);
        return { to: ["cb360.online.support@gmail.com"], cc: [], bcc: [] };
      }
    }
    /* ================ BUILD EMAIL HTML =============== */
    async function buildMOAEmailHTML(data, corpOperNr) {
      const greeting = getGreeting();
      const commanderName = await getCommanderName(corpOperNr);
      const article = data.moa_cb?.includes("Companhia") ? "da" : "do";
      return `${greeting}<br>
      Encarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s o Formulário das <strong>MEDIDAS OPERACIONAIS DE ANTECIPAÇÃO</strong> 
      para o <strong>${data.moa_device_type}</strong> de <strong>${data.moa_gdh_init}</strong> a <strong>${data.moa_gdh_end}</strong> 
      ${article} <strong>${data.moa_cb}</strong>.<br>
      Com os melhores cumprimentos,<br>
      OPTEL<br>${data.moa_optel}<br>
      <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
      Este email foi processado automaticamente por: CB360 Online</span>`;
    }
    /* =================== SEND EMAIL ================== */
    async function sendMOAEmail(data, recipients, corpOperNr) {
      const emailBodyHTML = await buildMOAEmailHTML(data, corpOperNr);
      const result = await fetch("https://cb360-online.vercel.app/api/crepc_convert_and_send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({mode: "moa", data, recipients: recipients.to, ccRecipients: recipients.cc, bccRecipients: recipients.bcc,
                              emailSubject: `MOA para o ${data.moa_device_type} de ${data.moa_gdh_init} a ${data.moa_gdh_end}_${corpOperNr}`,
                              emailBody: emailBodyHTML})
      });
      const out = await result.json().catch(() => ({}));
      if (!result.ok || out.success === false || out.error) {
        throw new Error(out.error || `Falha no envio do email (${result.status})`);
      }
      return out;
    }
    /* ================= EPE STATUS UPSERT ================= */
    function extractEpeLevel(epeType) {
      if (!epeType) return "";
      return epeType.split(" - ")[0].trim().toUpperCase();
    }
    /* Dispositivo escolhido na MOA -> linha da epe_status que muda */
    const MOA_EPE_TYPES = {DIOPS: "epe-diops", DECIR: "epe-decir", NRBQ: "epe-nrbq"};   /* DIRACAERO: não tem EPE na epe_status */
    function moaEpeType(data) {
      return MOA_EPE_TYPES[String(data.moa_device_type || "").trim().toUpperCase()] || null;
    }
    /* Grava o EPE da MOA:
       - início agora ou já passado -> passa logo a ser o nível atual (epe / start_date / end_date)
       - início no futuro           -> fica como PRÓXIMO nível (next_*); o Supabase troca-o
                                       sozinho quando chega a hora (tarefa epe-voltar-monitorizacao) */
    async function updateEpeStatus(corpOperNr, epeType, epeLevel, startDate, endDate, startAt) {
      if (!epeType || !epeLevel) {
        console.warn("MOA: tipo/nível de EPE não identificado — epe_status não foi alterado.");
        return false;
      }
      const future = startAt instanceof Date && !isNaN(startAt) && startAt.getTime() > Date.now() + 60 * 1000;
      const fields = future
        ? {next_epe: epeLevel, next_start_date: startDate, next_end_date: endDate}
        : {epe: epeLevel, start_date: startDate, end_date: endDate};
      try {
        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/epe_status?corp_oper_nr=eq.${corpOperNr}&epe_type=eq.${epeType}&select=id`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!checkRes.ok) throw new Error(`Erro ao verificar epe_status (${checkRes.status})`);
        const existing = await checkRes.json();
        if (existing.length > 0) {
          const patchRes = await fetch(
            `${SUPABASE_URL}/rest/v1/epe_status?corp_oper_nr=eq.${corpOperNr}&epe_type=eq.${epeType}`, {
              method: "PATCH",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify(fields)
            }
          );
          if (!patchRes.ok) throw new Error(`Erro ao atualizar epe_status (${patchRes.status})`);
        } else {
          const postRes = await fetch(
            `${SUPABASE_URL}/rest/v1/epe_status`, {
              method: "POST",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify({corp_oper_nr: corpOperNr, epe_type: epeType,
                                    ...(future ? {epe: "MONITORIZAÇÃO"} : {}), ...fields})
            }
          );
          if (!postRes.ok) throw new Error(`Erro ao inserir epe_status (${postRes.status})`);
        }
        return future ? "agendado" : true;
      } catch (err) {
        console.error("Erro em updateEpeStatus:", err);
        return false;
      }
    }
    /* ================= MAIN FUNCTION ================= */
    async function emitMOAGlobal() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {showPopup('popup-danger', "Erro: O número da corporação não foi encontrado."); return;}
      const moa_device_type = document.getElementById("moa_device_type")?.value.trim();
      const moa_cb = document.getElementById("moa_cb")?.value.trim();
      if (!moa_device_type || !moa_cb) {showPopup('popup-danger', "Preencha: Tipo de Dispositivo e CB."); return;}
      if (typeof showPopup === "function")
        showPopup('popup-info', `A enviar a MOA do dispositivo ${moa_device_type}. Aguarde...`);
      const btn = document.getElementById("saveMOABtn");
      if (btn) btn.disabled = true;
      const data = {};
      const baseFields = ["device_type","cb","epe_type","date_init","time_init","date_end","time_end","gdh_init","gdh_end","eco","ned","oco","era","eob","rsc","mef"];
      baseFields.forEach(f => {
        const el = document.getElementById(`moa_${f}`);
        if (!el) return;
        data[`moa_${f}`] = el.type === "checkbox" ? el.checked : el.value || "";
      });
      const extraFields = ["eco_sit","eco_pront","eco_observ","ned_sit","ned_pront","ned_observ","oco_sit","oco_pront","oco_observ","era_sit","era_pront","era_observ",
                           "eob_sit","eob_pront","eob_observ","rsc_sit","rsc_pront","rsc_observ","mef_sit","mef_pront","mef_observ","reie_type_01","reie_time_01","reie_nop_01",
                           "reie_obs_01","reie_type_02","reie_time_02","reie_nop_02","reie_obs_02","reie_type_03","reie_time_03","reie_nop_03","reie_obs_03","otr_type_01",
                           "otr_time_01","otr_obs_01","otr_type_02","otr_time_02","otr_obs_02","otr_type_03","otr_time_03","otr_obs_03","optel"];
      extraFields.forEach(f => {
        const el = document.getElementById(`moa_${f}`);
        data[`moa_${f}`] = el ? (el.value || "").trim() : "";
      });
      data.corp_oper_nr = corpOperNr;
      try {
        const {logoUrl, cbName, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail} = await _getMOAEmailCommonData(corpOperNr);
        data.logoUrl = logoUrl;
        data.corpAddress = corpAddress;
        data.corpCp = corpCp;
        data.corpLocalitie = corpLocalitie;
        data.corpPhoneMobile = corpPhoneMobile;
        data.corpPhoneLandline = corpPhoneLandline;
        data.corpEmail = corpEmail;
        if (cbName) data.moa_cb = cbName;
        const recipients = await fetchMOARecipients(corpOperNr);
        await sendMOAEmail(data, recipients, corpOperNr);   /* se o email falhar, pára aqui e o EPE não muda */
        const startAt = (data.moa_date_init && data.moa_time_init) ? new Date(`${data.moa_date_init}T${data.moa_time_init}`) : null;
        const epeOk = await updateEpeStatus(corpOperNr, moaEpeType(data), extractEpeLevel(data.moa_epe_type), data.moa_gdh_init, data.moa_gdh_end, startAt);
        if (typeof showPopup === "function")
          showPopup(epeOk ? 'popup-success' : 'popup-warning',
            epeOk === "agendado" ? `A MOA do dispositivo ${data.moa_device_type} foi enviada! O nível entra em vigor a ${data.moa_gdh_init}.`
            : epeOk ? `A MOA do dispositivo ${data.moa_device_type} foi enviada!`
                    : `A MOA foi enviada, mas o estado do EPE não foi atualizado (dispositivo sem EPE associado).`);
        window.hideMOAContainer();
        const btnNew = document.getElementById("NewMOABtn");
        if (btnNew) btnNew.classList.remove("active");
      } catch (err) {
        showPopup('popup-danger', `Erro ao enviar MOA: ${err.message}`);
        console.error(err);
      } finally {
        if (btn) btn.disabled = false;
      }
    }
    /* ================ INITIALIZE PAGE ================ */
    document.addEventListener("DOMContentLoaded", () => {
      const saveMOABtn = document.getElementById("saveMOABtn");
      const NewMOABtn = document.getElementById("NewMOABtn");
      const moaContainer = document.getElementById("moa-container");
      const actionButtonsContainer = document.querySelector(".action-buttons");
      if (moaContainer) {
        moaContainer.style.transition = "opacity 0.25s ease";
        moaContainer.style.opacity = "0";
        moaContainer.style.setProperty("display", "none", "important");
      }
      setupMOASelects(document);
      updateMOAGDH();
      window.hideMOAContainer = function () {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          setTimeout(() => {
            moaContainer.style.setProperty("display", "none", "important");
            if (actionButtonsContainer) actionButtonsContainer.style.display = "flex";
          }, 250);
        }
        if (NewMOABtn) NewMOABtn.classList.remove("active");
      };
      window.showMOAContainer = function () {
        if (moaContainer) {
          moaContainer.style.opacity = "0";
          moaContainer.style.removeProperty("display");
          moaContainer.style.display = "block";
          moaContainer.style.width = "100%";
          setTimeout(() => { moaContainer.style.opacity = "1"; }, 10);
        }
      };
      if (NewMOABtn) {
        NewMOABtn.onclick = () => {
          const isActive = NewMOABtn.classList.toggle("active");
          if (isActive) {
            const NewAnxG2Btn = document.getElementById("NewAnxG2Btn");
            if (NewAnxG2Btn && NewAnxG2Btn.classList.contains("active")) {
              NewAnxG2Btn.classList.remove("active");
              if (typeof window.hideG2Container === "function") window.hideG2Container();
              if (typeof toggleG2FormContainer === "function") toggleG2FormContainer(true);
              const g2TableContainerEl = document.getElementById("g2TableContainer");
              if (g2TableContainerEl) g2TableContainerEl.style.display = "none";
              const g2NewBtnEl = document.getElementById("NewG2Btn");
              const g2OldBtnEl = document.querySelector(".oldg2");
              if (g2NewBtnEl) g2NewBtnEl.classList.remove("active");
              if (g2OldBtnEl) g2OldBtnEl.classList.remove("active");
            }
            window.showMOAContainer();
            document.querySelectorAll("#moa-container input, #moa-container select").forEach(el => {
              if (el.tagName === "SELECT") el.selectedIndex = 0;
              else if (el.type === "checkbox") el.checked = false;
              else el.value = "";
            });
            setupMOASelects(moaContainer);
            updateMOAGDH();
          } else {window.hideMOAContainer();}
        };
      }
      if (saveMOABtn) {
        saveMOABtn.onclick = e => { e.preventDefault(); emitMOAGlobal(); return false; };
      }
      /* ================== RESET PAGE =================== */
      const crepcAlgBtn = document.querySelector('[data-page="page-crepcalg"]');
      if (crepcAlgBtn) {
        crepcAlgBtn.addEventListener('click', () => { window.hideMOAContainer(); });
      }
    });
    /* =======================================
    LISTA NOMINAL DE MEIOS - ANEXO G2
    ======================================= */
    const G2_LEADER_COUNT = 4;
    const G2_CREW_COUNT = 10;
    const G2_LEADER_FIELDS = ["id", "category", "name", "issi", "phone"];
    const G2_CREW_TEXT_FIELDS = ["id", "mec", "category", "name", "status", "network"];
    const G2_SIMPLE_FIELDS = ["seq_number", "intervention_location", "vehicle", "vehicle_issi"];
    const G2_MONTHS  = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
    const G2_LOOKUP_DEBOUNCE_MS = 150;
    const G2_GDH_FIELDS = [{base: "g2_gdh_activation", key: "gdh_activation"}, {base: "g2_gdh_station_departure", key: "gdh_station_departure"}, {base: "g2_gdh_assembly_point", key: "gdh_assembly_point"},
                           {base: "g2_gdh_incident_site", key: "gdh_incident_site"}];
    for (let i = 1; i <= G2_CREW_COUNT; i++) {
      G2_GDH_FIELDS.push(
        {base: `g2_crew${i}_departure`, key: `crew${i}_gdh_departure`},
        {base: `g2_crew${i}_arrival`, key: `crew${i}_gdh_arrival`}
      );
    }
    const G2_REG_ELEMS_MAP = {
      leader: {category: "patent", name: "full_name"},
      crew: {category: "patent", name: "full_name", mec: "n_file"}
    };
    /* ============ GERAÇÃO DAS LINHAS (INLINE) ============ */
    const G2_TRANSITION = 'transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;';
    const G2_INPUT_STYLE = `font-size: 12px; width: 100%; height: 22px; padding: 0 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none; ${G2_TRANSITION}`;
    const G2_DT_STYLE = `font-size: 11px; height: 22px; padding: 0 4px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; outline: none; ${G2_TRANSITION}`;
    const G2_FOCUS = `onfocus="this.style.borderColor='#80bdff'; this.style.boxShadow='0 0 5px rgba(0, 123, 255, 0.25)';" onblur="this.style.borderColor='#ccc'; this.style.boxShadow='none';"`;
    const G2_TD_NUM = 'text-align: center; border-top: 1px solid #ccc; border-right: 1px solid #ccc; padding: 4px;';
    const G2_TD = 'padding: 4px;';
    const G2_TD_GDH = 'padding: 4px; white-space: nowrap;';
    function g2Text(id, center = false, readOnly = false) {
      const alignStyle = center ? ' text-align: center;' : '';
      const readOnlyStyle = readOnly ? ' background-color: #e9ecef; cursor: not-allowed;' : '';
      const readOnlyAttr = readOnly ? ' readonly tabindex="-1"' : '';
      return `<input type="text" id="${id}" style="${G2_INPUT_STYLE}${alignStyle}${readOnlyStyle}" ${readOnlyAttr} ${G2_FOCUS}>`;
    }
    function g2Select(id) {
      return `
        <select id="${id}" style="${G2_INPUT_STYLE} text-align-last: center;" ${G2_FOCUS}>
          <option value=""></option>
          <option value="E">E</option>
          <option value="N">N</option>
          <option value="S">S</option>
          <option value="G">G</option>
        </select>
      `;
    }
    function g2Hidden(id) {
      return `<input type="text" id="${id}" style="display: none;" readonly tabindex="-1">`;
    }
    function g2DateTime(prefix) {
      return `
        <input type="date" id="${prefix}_date" style="${G2_DT_STYLE} width: 105px;" ${G2_FOCUS}>
        <input type="time" id="${prefix}_hour" style="${G2_DT_STYLE} width: 75px;" ${G2_FOCUS}>`;
    }
    function buildG2Leaders(rows = G2_LEADER_COUNT) {
      const tbody = document.querySelector('#g2LeadersTable tbody');
      if (!tbody) return;
      let html = '';
      for (let i = 1; i <= rows; i++) {
        const p = `g2_leader${i}`;
        html += `
          <tr>
            <td style="${G2_TD_NUM}">${i}</td>
            <td style="${G2_TD}">${g2Text(`${p}_id`, true)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_category`, false, true)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_name`, false, true)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_issi`, true)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_phone`, true)}</td>
          </tr>
        `;
      }
      tbody.innerHTML = html;
    }
    function buildG2Crew(rows = G2_CREW_COUNT) {
      const tbody = document.querySelector('#g2CrewTable tbody');
      if (!tbody) return;
      let html = '';
      for (let i = 1; i <= rows; i++) {
        const p = `g2_crew${i}`;
        html += `
          <tr>
            <td style="${G2_TD_NUM}">${i}</td>
            <td style="${G2_TD}">${g2Text(`${p}_id`, true)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_mec`, true, true)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_category`, true, true)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_name`, false, true)}</td>
            <td style="${G2_TD}">${g2Select(`${p}_status`)}</td>
            <td style="${G2_TD}">${g2Text(`${p}_network`, true)}</td>
            <td style="${G2_TD_GDH}">${g2DateTime(`${p}_departure`)}${g2Hidden(`${p}_gdh_departure`)}</td>
            <td style="${G2_TD_GDH}">${g2DateTime(`${p}_arrival`)}${g2Hidden(`${p}_gdh_arrival`)}</td>
          </tr>
        `;
      }
      tbody.innerHTML = html;
    }
    /* ================= GDH ================= */
    function formatG2GDH(date = new Date()) {
      const p = n => String(n).padStart(2, "0");
      return `${p(date.getDate())}${p(date.getHours())}${p(date.getMinutes())}${G2_MONTHS[date.getMonth()]}${String(date.getFullYear()).slice(-2)}`;
    }
    function parseG2GDH(gdh) {
      const m = /^(\d{2})(\d{2})(\d{2})([A-Z]{3})(\d{2})$/.exec(gdh || "");
      if (!m) return null;
      const mo = G2_MONTHS.indexOf(m[4]);
      if (mo < 0) return null;
      return {date: `20${m[5]}-${String(mo + 1).padStart(2, "0")}-${m[1]}`, time: `${m[2]}:${m[3]}`};
    }
    function buildG2DateFromInputs(dateStr, timeStr) {
      if (!dateStr || !timeStr) return null;
      const [y, m, d] = dateStr.split("-").map(Number);
      const [hh, mm] = timeStr.split(":").map(Number);
      return new Date(y, m - 1, d, hh, mm);
    }
    function g2HiddenId(base) {
      return base.replace(/^(g2_crew\d+)_(departure|arrival)$/, "$1_gdh_$2");
    }
    function updateG2Gdh(base) {
      const dateEl = document.getElementById(`${base}_date`);
      const hourEl = document.getElementById(`${base}_hour`);
      const hiddenEl = document.getElementById(g2HiddenId(base));
      if (!dateEl || !hourEl || !hiddenEl) return;
      const dt = buildG2DateFromInputs(dateEl.value, hourEl.value);
      hiddenEl.value = dt ? formatG2GDH(dt) : "";
    }
    function setG2Gdh(base, gdh) {
      const set = (id, v) => {const el = document.getElementById(id); if (el) el.value = v;};
      const parsed = parseG2GDH(gdh);
      set(g2HiddenId(base), gdh || "");
      set(`${base}_date`, parsed?.date || "");
      set(`${base}_hour`, parsed?.time || "");
    }
    function setNowInDateHour(base) {
      const now = new Date();
      const p = n => String(n).padStart(2, "0");
      document.getElementById(`${base}_date`).value = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
      document.getElementById(`${base}_hour`).value = `${p(now.getHours())}:${p(now.getMinutes())}`;
      updateG2Gdh(base);
    }
    /* ======= CHEFE DE EQUIPA / EQUIPA: dados via reg_elems ======= */
    async function fetchG2RegElem(nInt, corpOperNr) {
      const url = `${SUPABASE_URL}/rest/v1/reg_elems`
        + `?select=patent,full_name,n_file`
        + `&n_int=eq.${encodeURIComponent(nInt)}`
        + `&corp_oper_nr=eq.${encodeURIComponent(corpOperNr)}`
        + `&limit=1`;
      const res = await fetch(url, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error("Erro ao buscar dados do elemento");
      const data = await res.json();
      return data[0] || null;
    }
    async function fillG2FromRegElems(idInput) {
      const m = /^g2_(leader|crew)(\d+)_id$/.exec(idInput.id);
      if (!m) return;
      const [, type, row] = m;
      const map = G2_REG_ELEMS_MAP[type];
      const setFields = record => {
        for (const [field, column] of Object.entries(map)) {
          const el = document.getElementById(`g2_${type}${row}_${field}`);
          if (el) el.value = record?.[column] ?? "";
        }
      };
      const nInt = idInput.value.trim();
      if (!nInt) {setFields(null); return;}
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) return;
      try {
        const record = await fetchG2RegElem(nInt, corpOperNr);
        if (idInput.value.trim() !== nInt) return;
        setFields(record);
      } catch (err) {
        console.error("Erro ao carregar dados do elemento:", err);
        setFields(null);
      }
    }
    async function fetchG2Optel(nInt, corpOperNr) {
      const url = `${SUPABASE_URL}/rest/v1/reg_elems`
        + `?select=patent_abv,abv_name`
        + `&n_int=eq.${encodeURIComponent(nInt)}`
        + `&corp_oper_nr=eq.${encodeURIComponent(corpOperNr)}`
        + `&limit=1`;
      const res = await fetch(url, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error("Erro ao buscar dados do OPTEL");
      const data = await res.json();
      return data[0] || null;
    }
    async function fillG2Optel(nIntInput) {
      const patentEl = document.getElementById("g2_optel_patent");
      const nameEl = document.getElementById("g2_optel_name");
      const setFields = record => {
        if (patentEl) patentEl.value = record?.patent_abv ?? "";
        if (nameEl) nameEl.value = record?.abv_name ?? "";
      };
      const nInt = nIntInput.value.trim();
      if (!nInt) {setFields(null); return;}
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) return;
      try {
        const record = await fetchG2Optel(nInt, corpOperNr);
        if (nIntInput.value.trim() !== nInt) return; // o utilizador já mudou o valor
        setFields(record);
      } catch (err) {
        console.error("Erro ao carregar dados do OPTEL:", err);
        setFields(null);
      }
    }
    /* =========== UTILITY FUNCTIONS AND UI ============ */
    const g2Esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    function preselectCorpInG2CB() {
      const current = sessionStorage.getItem("currentCorpOperNr");
      if (!current) return;
      const select = document.getElementById("g2_cb");
      if (!select) return;
      const clean = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      for (const option of select.options) {
        if (clean(option.textContent).startsWith(clean(current))) {
          option.selected = true;
          return;
        }
      }
    }
    function clearG2Form() {
      document.querySelectorAll("#g2_form_container input, #g2_form_container textarea").forEach(el => el.value = "");
      document.querySelectorAll("#g2_form_container select").forEach(sel => sel.selectedIndex = 0);
      buildG2Leaders();
      buildG2Crew();
      const g2FormContainer = document.getElementById("g2_form_container");
      const g2SaveBtn = document.getElementById("g2SaveBtn");
      if (g2FormContainer) {
        g2FormContainer.removeAttribute("data-record-id");
        g2FormContainer.removeAttribute("data-closing");
      }
      if (g2SaveBtn) {
        g2SaveBtn.textContent = "Emitir Lista Nominal de Meios";
        g2SaveBtn.classList.remove("btn-success");
        g2SaveBtn.classList.add("btn-danger");
        g2SaveBtn.style.width = "22%";
      }
    }
    function toggleG2FormContainer(forceClose = false) {
      const g2FormContainer = document.getElementById("g2_form_container");
      const g2TableContainer = document.getElementById("g2TableContainer");
      if (!g2FormContainer) return;
      const isVisible = g2FormContainer.style.display === "block";
      g2FormContainer.style.transition = "opacity 0.25s ease";
      if (isVisible || forceClose) {
        g2FormContainer.style.opacity = "0";
        setTimeout(() => {
          g2FormContainer.style.display = "none";
          clearG2Form();
        }, 250);
      } else {
        if (g2TableContainer) g2TableContainer.style.display = "none";
        g2FormContainer.style.display = "block";
        g2FormContainer.style.opacity = "0";
        setTimeout(() => g2FormContainer.style.opacity = "1", 10);
        clearG2Form();
      }
    }
    function collectG2FormData() {
      const val = id => document.getElementById(id).value.trim();
      const data = {};
      G2_SIMPLE_FIELDS.forEach(f => data[f] = val(`g2_${f}`));
      G2_GDH_FIELDS.forEach(({ base, key }) => data[key] = val(g2HiddenId(base)));
      for (let i = 1; i <= G2_LEADER_COUNT; i++) {
        G2_LEADER_FIELDS.forEach(f => data[`leader${i}_${f}`] = val(`g2_leader${i}_${f}`));
      }
      for (let i = 1; i <= G2_CREW_COUNT; i++) {
        G2_CREW_TEXT_FIELDS.forEach(f => {
          const column = f === "mec" ? "mec_number" : f;
          data[`crew${i}_${column}`] = val(`g2_crew${i}_${f}`);
        });
      }
      return data;
    }
    function populateG2Form(record) {
      const set = (id, v) => {const el = document.getElementById(id); if (el) el.value = v || "";};
      G2_SIMPLE_FIELDS.forEach(f => set(`g2_${f}`, record[f]));
      G2_GDH_FIELDS.forEach(({ base, key }) => setG2Gdh(base, record[key]));
      for (let i = 1; i <= G2_LEADER_COUNT; i++) {
        G2_LEADER_FIELDS.forEach(f => set(`g2_leader${i}_${f}`, record[`leader${i}_${f}`]));
      }
      for (let i = 1; i <= G2_CREW_COUNT; i++) {
        G2_CREW_TEXT_FIELDS.forEach(f => {
          const column = f === "mec" ? "mec_number" : f;
          set(`g2_crew${i}_${f}`, record[`crew${i}_${column}`]);
        });
      }
    }
    function openG2MissionRecord(record, closing) {
      const g2FormContainer = document.getElementById("g2_form_container");
      const g2TableContainer = document.getElementById("g2TableContainer");
      const NewG2Btn = document.getElementById("NewG2Btn");
      const oldG2Btn = document.querySelector(".oldg2");
      const g2SaveBtn = document.getElementById("g2SaveBtn");
      g2TableContainer.style.display = "none";
      if (oldG2Btn) oldG2Btn.classList.remove("active");
      g2FormContainer.style.display = "block";
      g2FormContainer.style.opacity = "0";
      setTimeout(() => g2FormContainer.style.opacity = "1", 10);
      const header = g2FormContainer.querySelector(".major-card-header");
      if (header) header.textContent = closing ? "FINALIZAR MISSÃO" : "EDITAR LISTA NOMINAL DE MEIOS";
      populateG2Form(record);
      preselectCorpInG2CB();
      if (NewG2Btn) NewG2Btn.classList.add("active");
      g2FormContainer.setAttribute("data-record-id", record.id);
      g2FormContainer.setAttribute("data-closing", closing ? "true" : "false");
      g2SaveBtn.textContent = closing ? "Finalizar Missão" : "Atualizar";
      g2SaveBtn.classList.remove("btn-danger", "btn-success");
      g2SaveBtn.classList.add(closing ? "btn-success" : "btn-add");
      g2SaveBtn.style.width = "22%";
    }
    async function fetchG2RecipientsFromSupabase(corpOperNr) {
      const categories = ['g2_mail_to', 'g2_mail_cc', 'g2_mail_bcc'];
      const url = `${SUPABASE_URL}/rest/v1/mails_config` + `?category=in.(${categories.join(',')})` + `&corp_oper_nr=eq.${corpOperNr}` + `&select=category,value`;
      try {
        const response = await fetch(url, { headers: getSupabaseHeaders() });
        if (!response.ok) throw new Error("Falha ao conectar ao Supabase.");
        const data = await response.json();
        const recipients = { to: [], cc: [], bcc: [] };
        data.forEach(row => {
          const emails = row.value?.split(",")
            .map(e => e.trim())
            .filter(e => e) || [];
          if (row.category.endsWith("_to")) recipients.to = emails;
          if (row.category.endsWith("_cc")) recipients.cc = emails;
          if (row.category.endsWith("_bcc")) recipients.bcc = emails;
        });
        if (recipients.to.length === 0) recipients.to = [""];
        return recipients;
      } catch (err) {
        console.error("Erro ao buscar e-mails:", err);
        throw new Error("Não foi possível obter os destinatários (Centro de Dados → Emails Config.).");
      }
    }
    /* ================= EMISSION LOGIC ================ */
    async function emitG2() {
      const g2FormContainer = document.getElementById("g2_form_container");
      const g2SaveBtn = document.getElementById("g2SaveBtn");
      const NewG2Btn = document.getElementById("NewG2Btn");
      const oldG2Btn = document.querySelector(".oldg2");
      const cb_type = document.getElementById("g2_cb")?.value.trim() || "";
      const formData = collectG2FormData();
      const optelPatent = document.getElementById("g2_optel_patent")?.value.trim() || "";
      const optelName = document.getElementById("g2_optel_name")?.value.trim() || "";
      const optelLine = [optelPatent, optelName].filter(Boolean).map(g2Esc).join(" ");
      const greeting = getGreeting();
      if (!formData.vehicle || !formData.gdh_activation) {
        showPopup('popup-danger', "Por favor preencha os campos obrigatórios: Veículo e GDH Acionamento.");
        return;
      }
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {
        showPopup('popup-danger', "Erro: O número da corporação não foi encontrado. Por favor, faça login novamente.");
        return;
      }
      const recordId = g2FormContainer.getAttribute("data-record-id");
      const isUpdate = !!recordId;
      const isClosing = g2FormContainer.getAttribute("data-closing") === "true";
      g2SaveBtn.disabled = true;
      showPopup('popup-success', `Lista Nominal de Meios ${isUpdate ? "atualizada" : "criada"} com sucesso. Por favor aguarde uns segundos, receberá uma nova notificação após o envio para as entidades estar concluído!`);
      const supabaseData = { ...formData, corp_oper_nr: corpOperNr, mission_status: !isClosing };
      let insertedId = null;
      try {
        const supabaseUrl = isUpdate ? `${SUPABASE_URL}/rest/v1/g2_resource_list?id=eq.${recordId}` : `${SUPABASE_URL}/rest/v1/g2_resource_list`;
        const method = isUpdate ? "PATCH" : "POST";
        const response = await fetch(supabaseUrl, {
          method,
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=representation"},
          body: JSON.stringify(supabaseData)
        });
        if (!response.ok) throw new Error("Erro ao enviar dados ao Supabase.");
        const savedRows = await response.json();
        if (!isUpdate) insertedId = savedRows?.[0]?.id ?? null;
        // ===== ENVIO DO ANEXO G2 =====
        const {to, cc, bcc} = await fetchG2RecipientsFromSupabase(corpOperNr);
        const {logoUrl, cbName, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail} = await _getMOAEmailCommonData(corpOperNr);
        const corpName = cb_type.includes(" - ") ? cb_type.split(" - ").slice(1).join(" - ") : cb_type;
        const article = corpName.includes("Companhia") ? "da" : "do";
        const emailBodyHTML = `${greeting}<br>
        Encarrega-me o Sr. Comandante ${await getCommanderName(corpOperNr)} de remeter em anexo a Vossas Exª.s a Lista Nominal de Meios ${article} <strong>${corpName}</strong>, acionados para a ocorrência <strong>${formData.seq_number || ""}</strong>, em <strong>${formData.intervention_location || ""}</strong>.<br>
        Com os melhores cumprimentos,<br>
        OPTEL:
        ${optelLine ? `${optelLine}<br>` : ""}
        <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
          Este email foi processado automaticamente por: CB360 Online
        </span>`;
        const emailRes = await fetch('https://cb360-online.vercel.app/api/crepc_convert_and_send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: "g2",
            data: {...formData, cb_type, corp_oper_nr: corpOperNr, logoUrl, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail},
            recipients: to,
            ccRecipients: cc,
            bccRecipients: bcc,
            emailSubject: `Lista Nominal de Meios - Veículo ${formData.vehicle}_${corpOperNr}`,
            emailBody: emailBodyHTML
          })
        });
        if (!emailRes.ok) {
          let details = "";
          try { const errJson = await emailRes.json(); details = errJson.details || errJson.error || ""; } catch (_) {}
          throw new Error(`EMAIL_FAILED::${details || "sem detalhes (provável timeout de 60s na Vercel)"}`);
        }
        showPopup('popup-success', `A Lista Nominal de Meios do veículo ${formData.vehicle} foi enviada para as entidades.`);
        toggleG2FormContainer(true);
        if (NewG2Btn) NewG2Btn.classList.remove("active");
        if (oldG2Btn) oldG2Btn.classList.remove("active");
      } catch (err) {
        console.error(err);
        const isEmailFailure = err.message?.startsWith("EMAIL_FAILED::");
        if (isEmailFailure) {
          try {
            if (!isUpdate) {
              if (insertedId) {
                await fetch(`${SUPABASE_URL}/rest/v1/g2_resource_list?id=eq.${insertedId}`, {
                  method: "DELETE",
                  headers: getSupabaseHeaders()
                });
              }
            } else if (isClosing) {
              await fetch(`${SUPABASE_URL}/rest/v1/g2_resource_list?id=eq.${recordId}`, {
                method: "PATCH",
                headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
                body: JSON.stringify({mission_status: true})
              });
            }
          } catch (rollbackErr) {
            console.error("Falha ao reverter estado após erro de envio:", rollbackErr);
          }
          showPopup('popup-danger', `Não foi possível gerar ou enviar o documento (possível lentidão de um serviço externo). O registo foi revertido — por favor tente novamente dentro de alguns minutos.`);
        } else {
          showPopup('popup-danger', `Erro: ${err.message}`);
        }
      } finally {
        g2SaveBtn.disabled = false;
      }
    }
    async function populateG2VehicleSelect() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {
        console.warn("corpOperNr não encontrado");
        return;
      }
      const select = document.getElementById("g2_vehicle");
      if (!select) {
        console.warn("select g2_vehicle não encontrado");
        return;
      }
      const G2_VEHICLE_PREFIX_ORDER = ["VCOT", "VFCI", "VTTF", "VTTU", "VTTP", "ABSC", "ABTM", "VDTD", "VOPE", "ARTL"];
      const g2VehicleSortKey = vehicle => {
        const prefix = G2_VEHICLE_PREFIX_ORDER.find(p => vehicle.toUpperCase().startsWith(p));
        const prefixIndex = prefix ? G2_VEHICLE_PREFIX_ORDER.indexOf(prefix) : G2_VEHICLE_PREFIX_ORDER.length;
        return [prefixIndex, vehicle];
      };
      try {
        const url = `${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle&corp_oper_nr=eq.${corpOperNr}`;
        const res = await fetch(url, {headers: getSupabaseHeaders()});
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        const data = await res.json();
        const vehicles = [...new Set(data.map(row => row.vehicle).filter(v => v))]
        .sort((a, b) => {
          const [aIdx, aVal] = g2VehicleSortKey(a);
          const [bIdx, bVal] = g2VehicleSortKey(b);
          return aIdx !== bIdx ? aIdx - bIdx : aVal.localeCompare(bVal, "pt", { numeric: true });
        });
        select.innerHTML = '<option value=""></option>';
        vehicles.forEach(vehicle => {
          const option = document.createElement("option");
          option.value = vehicle;
          option.textContent = vehicle;
          select.appendChild(option);
        });
      } catch (err) {
        console.error("Erro ao carregar veículos:", err);
      }
    }
    function setCurrentDateTimeToInput(inputElement) {
      const now = new Date();
      const p = n => String(n).padStart(2, "0");
      if (inputElement.type === "date") {
        inputElement.value = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
      } else if (inputElement.type === "time") {
        inputElement.value = `${p(now.getHours())}:${p(now.getMinutes())}`;
      }
      const base = inputElement.id.replace(/_date$|_hour$/, "");
      updateG2Gdh(base);
    }
    function addG2LeaderRow() {
      const tbody = document.querySelector('#g2LeadersTable tbody');
      if (!tbody) return;
      const currentRows = tbody.querySelectorAll('tr').length;
      const newRowNum = currentRows + 1;
      const p = `g2_leader${newRowNum}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="${G2_TD_NUM}">${newRowNum}</td>
        <td style="${G2_TD}">${g2Text(`${p}_id`, true)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_category`, false, true)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_name`, false, true)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_issi`, true)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_phone`, true)}</td>
      `;
      tbody.appendChild(tr);
    }
    function addG2CrewRow() {
      const tbody = document.querySelector('#g2CrewTable tbody');
      if (!tbody) return;
      const currentRows = tbody.querySelectorAll('tr').length;
      const newRowNum = currentRows + 1;
      const p = `g2_crew${newRowNum}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="${G2_TD_NUM}">${newRowNum}</td>
        <td style="${G2_TD}">${g2Text(`${p}_id`, true)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_mec`, true, true)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_category`, true, true)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_name`, false, true)}</td>
        <td style="${G2_TD}">${g2Select(`${p}_status`)}</td>
        <td style="${G2_TD}">${g2Text(`${p}_network`, true)}</td>
        <td style="${G2_TD_GDH}">${g2DateTime(`${p}_departure`)}${g2Hidden(`${p}_gdh_departure`)}</td>
        <td style="${G2_TD_GDH}">${g2DateTime(`${p}_arrival`)}${g2Hidden(`${p}_gdh_arrival`)}</td>
      `;
      tbody.appendChild(tr);
      const idInput = tr.querySelector(`#${p}_id`);
      if (idInput) {
        idInput.addEventListener('input', e => {
          if (!/^g2_(leader|crew)\d+_id$/.test(e.target.id)) return;
          clearTimeout(g2IdTimers.get(e.target));
          g2IdTimers.set(e.target, setTimeout(() => fillG2FromRegElems(e.target), G2_LOOKUP_DEBOUNCE_MS));
        });
      }
    }
    /* ================ INITIALIZE MODULE ================ */
    document.addEventListener("DOMContentLoaded", () => {
      buildG2Leaders();
      buildG2Crew();
      populateG2VehicleSelect();
      const addG2LeaderBtn = document.getElementById("addG2LeaderBtn");
      const addG2CrewBtn = document.getElementById("addG2CrewBtn");
      if (addG2LeaderBtn) {
        addG2LeaderBtn.addEventListener('click', addG2LeaderRow);
      }
      if (addG2CrewBtn) {
        addG2CrewBtn.addEventListener('click', addG2CrewRow);
      }
      const gdhMappings = [{headerText: "GDH Saída Quartel", dateId: "g2_gdh_station_departure_date", hourId: "g2_gdh_station_departure_hour"}, {headerText: "GDH Local Concentração", dateId: "g2_gdh_assembly_point_date", hourId: "g2_gdh_assembly_point_hour"},
                           {headerText: "GDH no TO", dateId: "g2_gdh_incident_site_date", hourId: "g2_gdh_incident_site_hour"}];
      const vehicleTableHeaders = document.querySelectorAll("#g2VehicleTable thead th");
      vehicleTableHeaders.forEach(th => {
        const mapping = gdhMappings.find(m => th.textContent.trim() === m.headerText);
        if (mapping) {
          th.style.cursor = "pointer";
          th.addEventListener('click', () => {
            const now = new Date();
            const p = n => String(n).padStart(2, "0");
            const dateEl = document.getElementById(mapping.dateId);
            const hourEl = document.getElementById(mapping.hourId);
            if (dateEl) dateEl.value = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
            if (hourEl) hourEl.value = `${p(now.getHours())}:${p(now.getMinutes())}`;
            const base = mapping.dateId.replace(/_date$/, "");
            updateG2Gdh(base);
          });
        }
      });
      const crewGdhMappings = [{headerText: "GDH Saída", prefix: "departure"}, {headerText: "GDH Chegada", prefix: "arrival"}];
      const crewTableHeaders = document.querySelectorAll("#g2CrewTable thead th");
      crewTableHeaders.forEach(th => {
        const mapping = crewGdhMappings.find(m => th.textContent.trim() === m.headerText);
        if (!mapping) return;
        th.style.cursor = "pointer";
        th.addEventListener('click', () => {
          const now = new Date();
          const p = n => String(n).padStart(2, "0");
          const dateStr = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
          const hourStr = `${p(now.getHours())}:${p(now.getMinutes())}`;
          document.querySelectorAll('#g2CrewTable tbody tr').forEach(tr => {
            const idInput = tr.querySelector('input[id$="_id"]');
            if (!idInput) return;
            const m = /^g2_crew(\d+)_id$/.exec(idInput.id);
            if (!m) return;
            const rowNum = m[1];
            const nameInput = document.getElementById(`g2_crew${rowNum}_name`);
            if (!nameInput || !nameInput.value.trim()) return;
            const base = `g2_crew${rowNum}_${mapping.prefix}`;
            const dateEl = document.getElementById(`${base}_date`);
            const hourEl = document.getElementById(`${base}_hour`);
            if (dateEl) dateEl.value = dateStr;
            if (hourEl) hourEl.value = hourStr;
            updateG2Gdh(base);
          });
        });
      });
      const NewAnxG2Btn = document.getElementById("NewAnxG2Btn");
      const g2Container = document.getElementById("g2-container");
      if (!NewAnxG2Btn || !g2Container) return;
      const NewG2Btn = document.getElementById("NewG2Btn");
      const oldG2Btn = document.querySelector(".oldg2");
      const g2SaveBtn = document.getElementById("g2SaveBtn");
      const g2FormContainer = document.getElementById("g2_form_container");
      const g2TableContainer = document.getElementById("g2TableContainer");
      const g2TableBody = document.querySelector("#g2Table tbody");
      const actionButtonsContainer = document.getElementById("docs-crepc");
      g2Container.style.transition = "opacity 0.25s ease";
      g2Container.style.opacity = "0";
      g2Container.style.setProperty("display", "none", "important");
      g2FormContainer.addEventListener("change", e => {
        const m = /^(.+)_(?:date|hour)$/.exec(e.target.id);
        if (m) updateG2Gdh(m[1]);
      });
      const g2IdTimers = new Map();
      g2FormContainer.addEventListener("input", e => {
        const id = e.target.id;
        const isRow = /^g2_(leader|crew)\d+_id$/.test(id);
        const isOptel = id === "g2_optel_nint";
        if (!isRow && !isOptel) return;
        clearTimeout(g2IdTimers.get(e.target));
        g2IdTimers.set(e.target, setTimeout(
          () => isOptel ? fillG2Optel(e.target) : fillG2FromRegElems(e.target),
          G2_LOOKUP_DEBOUNCE_MS
        ));
      });
      window.hideG2Container = function () {
        g2Container.style.opacity = "0";
        setTimeout(() => {
          g2Container.style.setProperty("display", "none", "important");
          if (actionButtonsContainer) actionButtonsContainer.style.display = "flex";
        }, 250);
        NewAnxG2Btn.classList.remove("active");
      };
      window.showG2Container = function () {
        g2Container.style.opacity = "0";
        g2Container.style.removeProperty("display");
        g2Container.style.display = "block";
        g2Container.style.width = "100%";
        setTimeout(() => { g2Container.style.opacity = "1"; }, 10);
      };
      NewAnxG2Btn.onclick = () => {
        const isActive = NewAnxG2Btn.classList.toggle("active");
        if (isActive) {
          const NewMOABtn = document.getElementById("NewMOABtn");
          if (NewMOABtn && NewMOABtn.classList.contains("active")) {
            NewMOABtn.classList.remove("active");
            if (typeof window.hideMOAContainer === "function") window.hideMOAContainer();
          }
          window.showG2Container();
        } else {
          window.hideG2Container();
          toggleG2FormContainer(true);
          g2TableContainer.style.display = "none";
          if (NewG2Btn) NewG2Btn.classList.remove("active");
          if (oldG2Btn) oldG2Btn.classList.remove("active");
        }
      };
      if (NewG2Btn) {
        NewG2Btn.addEventListener("click", () => {
          const isActive = NewG2Btn.classList.toggle("active");
          if (oldG2Btn) oldG2Btn.classList.remove("active");
          if (isActive) {
            toggleG2FormContainer(false);
            g2TableContainer.style.display = "none";
            const header = document.querySelector("#g2_form_container .major-card-header");
            if (header) header.textContent = "INSERÇÃO DE NOVA LISTA NOMINAL DE MEIOS";
            preselectCorpInG2CB();
            setNowInDateHour("g2_gdh_activation");
          } else {
            toggleG2FormContainer(true);
          }
        });
      }
      if (g2SaveBtn) {
        g2SaveBtn.addEventListener("click", emitG2);
      }
      if (oldG2Btn) {
        oldG2Btn.addEventListener("click", async () => {
          const isActive = oldG2Btn.classList.toggle("active");
          if (NewG2Btn) NewG2Btn.classList.remove("active");
          if (!isActive) {
            g2TableContainer.style.display = "none";
            return;
          }
          g2FormContainer.style.display = "none";
          g2TableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Carregando...</td></tr>";
          try {
            const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/g2_resource_list?select=*&mission_status=eq.true&corp_oper_nr=eq.${corpOperNr}`,
              {headers: getSupabaseHeaders()}
            );
            if (!res.ok) throw new Error("Erro ao buscar missões em curso");
            const data = await res.json();
            g2TableBody.innerHTML = "";
            if (data.length === 0) {
              g2TableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Não foram encontradas missões em curso.</td></tr>`;
            } else {
              data.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                  <td style="text-align:center;">${g2Esc(item.seq_number)}</td>
                  <td style="text-align:center;">${g2Esc(item.vehicle)}</td>
                  <td style="text-align:center;">${g2Esc(item.gdh_activation)}</td>
                  <td>${g2Esc(item.intervention_location)}</td>
                  <td style="text-align:center;">
                    <button class="btn btn-add g2-edit-btn" style="height:30px; padding:5px 10px; margin-right:5px;">Editar</button>
                    <button class="btn btn-success g2-finalize-btn" style="height:30px; padding:5px 10px;">Finalizar</button>
                  </td>
                `;
                tr.querySelector(".g2-edit-btn").addEventListener("click", () => openG2MissionRecord(item, false));
                tr.querySelector(".g2-finalize-btn").addEventListener("click", () => openG2MissionRecord(item, true));
                g2TableBody.appendChild(tr);
              });
            }
            g2TableContainer.style.display = "block";
          } catch (err) {
            console.error(err);
            showPopup('popup-danger', "Erro ao carregar missões em curso: " + err.message);
          }
        });
      }
      /* ================== RESET PAGE =================== */
      const crepcAlgBtn = document.querySelector('[data-page="page-crepcalg"]');
      if (crepcAlgBtn) {
        crepcAlgBtn.addEventListener('click', () => {
          window.hideG2Container();
          toggleG2FormContainer(true);
          g2TableContainer.style.display = 'none';
        });
      }
    });
    /* =======================================
    DAILY PLANNING
    ======================================= */
    async function _getPLANDIREmailCommonData(corpOperNr) {
      let logoUrl = "", cbName = "", corpAddress = "", corpCp = "", corpLocalitie = "", corpPhoneMobile = "", corpPhoneLandline = "", corpEmail = "";
      try {
        const corpRes = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corpOperNr}&select=logo_url,cb_name,corp_address,corp_cp,corp_localitie,corp_phone_mobile,corp_phone_landline,corp_email`, {
            headers: getSupabaseHeaders()
          }
        );
        const corpData = await corpRes.json();
        if (corpData.length) {
          logoUrl = corpData[0].logo_url || ""; cbName = corpData[0].cb_name || ""; corpAddress = corpData[0].corp_address || ""; corpCp = corpData[0].corp_cp || "";
          corpLocalitie = corpData[0].corp_localitie || ""; corpPhoneMobile = corpData[0].corp_phone_mobile || ""; corpPhoneLandline = corpData[0].corp_phone_landline || "";
          corpEmail = corpData[0].corp_email || "";
        }
      } catch (err) {
        console.error("Erro ao carregar dados da corporação:", err);
      }
      return {logoUrl, cbName, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail};
    }
    const tableConfig = [{rows: 1, special: false, title: "OFOPE"}, {rows: 1, special: false, title: "CHEFE DE SERVIÇO"}, {rows: 1, special: false, title: "OPTEL"},
                     {rows: 5, special: true, title: "EQUIPA 01"}, {rows: 5, special: false, title: "EQUIPA 02"}, {rows: 2, special: false, title: "LOGÍSTICA"},
                     {rows: 3, special: false, title: "INEM"}, {rows: 3, special: false, title: "INEM - Reserva"}, {rows: 10, special: false, title: "SERVIÇO GERAL"}];
    /* turno D: o grupo OFOPE não existe (só no turno N) */
    const planTableConfig = shift => tableConfig.filter(cfg => !(cfg.title === "OFOPE" && shift === "D"));
    const DECIR_MODE_TEAMS = {"1_ecin": ["EQUIPA 01"], "1_ecin_1_elac": ["EQUIPA 01", "LOGÍSTICA"], "2_ecin_1_elac": ["EQUIPA 01", "EQUIPA 02", "LOGÍSTICA"]};
    function createInputCell({type = 'text', readonly = false, className = '', tabindex = 0}) {
      return `<td><input type="${type}" class="${className}" ${readonly ? 'readonly' : ''} tabindex="${tabindex}"></td>`;
    }
    function calculateWorkHours(checkIn, checkOut, shift) {
      if (!checkIn || !checkOut) return 0;
      const [checkInH, checkInM] = checkIn.split(':').map(Number);
      const [checkOutH, checkOutM] = checkOut.split(':').map(Number);
      let checkInMinutes = checkInH * 60 + checkInM;
      let checkOutMinutes = checkOutH * 60 + checkOutM;
      if (shift === 'N' && checkOutMinutes < checkInMinutes) checkOutMinutes += 1440;
      const diffMinutes = checkOutMinutes - checkInMinutes;
      return Math.round((diffMinutes / 60) * 100) / 100;
    }
    function normalizeText(text) {
      if (!text) return '';
      return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    }
    function hasOnCallStatus(obs) {
      if (!obs) return false;
      return /piq(uete|te|u)?/i.test(normalizeText(obs));
    }
    function hasAbsenceStatus(obs) {
      if (!obs) return false;
      return /falt(a|as|a\s)?/i.test(normalizeText(obs));
    }
    function hasReinforcementStatus(obs) {
      if (!obs) return false;
      return /refor(c|ç)o(s)?|ref\b/i.test(normalizeText(obs));
    }
    async function saveAttendance(tables, shift, corpOperNr, day, month, year) {
      const recordsMap = new Map();
      const now = new Date();
      const currentDay = day ?? String(now.getDate()).padStart(2, "0");
      const currentMonth = month ?? String(now.getMonth() + 1).padStart(2, "0");
      const currentYear = year ?? String(now.getFullYear());
      for (const table of tables) {
        for (const row of table.rows) {
          const nInt = row.n_int?.trim();
          const checkIn = row.entrada?.trim();
          const checkOut = row.saida?.trim();
          const rawObs = (row.obs || "").trim();
          const obs = rawObs.toLowerCase();
          if (!nInt) continue;
          let recordType = "";
          let totalHours = "0";
          const isAbsent = hasAbsenceStatus(obs);
          const isOnCall = hasOnCallStatus(obs);
          const isReinforcement = hasReinforcementStatus(obs);
          const isSickLeave = obs.includes("baixa");
          const isLicence = obs.includes("licença") || obs.includes("licenca");
          const isDispense = obs.includes("dispensa");
          if (isSickLeave) recordType = "Baixa";
          else if (isLicence) recordType = "Licença";
          else if (isDispense) recordType = "Dispensa";
          else if (isAbsent) recordType = "Falta";
          else if (isOnCall) recordType = "Piquete";
          else if (isReinforcement) recordType = "Reforço";
          else continue;
          if ((recordType === "Piquete" || recordType === "Reforço") && checkIn && checkOut) {
            totalHours = String(calculateWorkHours(checkIn, checkOut, shift));
          }
          const key = `${nInt}_${currentDay}_${currentMonth}_${currentYear}_${corpOperNr}_${shift}_${recordType}`;
          if (recordsMap.has(key)) continue;
          recordsMap.set(key, {n_int: String(nInt), day: String(currentDay), month: String(currentMonth), year: String(currentYear), shift: String(shift), shift_type: String(recordType),
                               qtd_hours: String(totalHours), observ: rawObs, corp_oper_nr: String(corpOperNr)});
        }
      }
      const attendanceRecords = Array.from(recordsMap.values());
      try {
        const delUrl = `${SUPABASE_URL}/rest/v1/reg_assid` + `?corp_oper_nr=eq.${encodeURIComponent(String(corpOperNr))}` + `&day=eq.${encodeURIComponent(String(currentDay))}` +
                       `&month=eq.${encodeURIComponent(String(currentMonth))}` + `&year=eq.${encodeURIComponent(String(currentYear))}` + `&shift=eq.${encodeURIComponent(String(shift))}`;
        const delRes = await fetch(delUrl, {method: "DELETE", headers: getSupabaseHeaders()});
        if (!delRes.ok) {
          const t = await delRes.text();
          throw new Error(`Erro a limpar reg_assid (${delRes.status}): ${t}`);
        }
        if (attendanceRecords.length === 0) return true;
        const insUrl = `${SUPABASE_URL}/rest/v1/reg_assid` + `?on_conflict=corp_oper_nr,n_int,year,month,day,shift,shift_type`;
        const insRes = await fetch(insUrl, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"},
          body: JSON.stringify(attendanceRecords)
        });
        if (!insRes.ok) {
          const t = await insRes.text();
          throw new Error(`Erro a gravar reg_assid (${insRes.status}): ${t}`);
        }
        return true;
      } catch (err) {
        console.error("❌ Erro em saveAttendance:", err);
        showPopup('popup-danger', "O planeamento foi enviado, mas houve um erro ao registar as faltas/piquetes no sistema central.");
        return false;
      }
    }
    async function saveEligibility(tables, day, month, year, corpOperNr) {
      const eligibilityRecords = [];
      const fDay = String(day).padStart(2, '0');
      const fMonth = String(month).padStart(2, '0');
      const fYear = String(year);
      for (const table of tables) {
        const title = table.title.trim().toUpperCase();
        const isSpecialTeam = (title === "INEM" || title === "OPTEL");
        for (const row of table.rows) {
          const obs = (row.obs || "").toString().toLowerCase().trim();
          const nInt = (row.n_int || "").toString().trim();
          const entranceHour = (row.entrada || "").toString().trim();
          const exitHour = (row.saida || "").toString().trim();
          const abvName = (row.nome || "").toString().trim();
          if (!nInt || !obs.includes("profissional")) continue;
          let shouldSave = false;
          const hourParts = entranceHour.split(':');
          if (hourParts.length >= 1) {
            const hourNum = parseInt(hourParts[0], 10);
            if (!isNaN(hourNum) && hourNum >= 0 && hourNum <= 6) shouldSave = true;
          }
          if (isSpecialTeam && entranceHour.startsWith("20:") && exitHour === "08:00") shouldSave = true;
          if (shouldSave) {
            eligibilityRecords.push({n_int: nInt, abv_name: abvName, day: fDay, month: fMonth, year: fYear, exit_hour: entranceHour, corp_oper_nr: String(corpOperNr)});
          }
        }
      }
      if (eligibilityRecords.length === 0) return true;
      try {
        const nIntList = eligibilityRecords.map(r => r.n_int).join(',');
        const delUrl = `${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}&day=eq.${fDay}&month=eq.${fMonth}&year=eq.${fYear}&n_int=in.(${nIntList})`;
        await fetch(delUrl, {method: "DELETE", headers: getSupabaseHeaders()});
        const insUrl = `${SUPABASE_URL}/rest/v1/reg_eligibility`;
        const res = await fetch(insUrl, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
          body: JSON.stringify(eligibilityRecords)
        });        
        return res.ok;
      } catch (err) {
        console.error("❌ Erro em saveEligibility:", err);
        return false;
      }
    }
    async function fetchDecirMode(corpOperNr) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/decir_mode?corp_oper_nr=eq.${encodeURIComponent(String(corpOperNr))}&select=mode`,
          {headers: getSupabaseHeaders()}
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data[0]?.mode || null;
      } catch (err) {
        console.error('Erro ao buscar decir_mode:', err);
        return null;
      }
    }
        async function saveDecirEcin(tables, shift, corpOperNr, day, month, year) {
      const planDate = new Date(Number(year), Number(month) - 1, Number(day), 12);
      const y = planDate.getFullYear();
      const decirStart = new Date(y, 4, 14, 12);   // 14 de maio (só turno N)
      const decirEnd   = new Date(y, 9, 15, 12);   // 15 de outubro (inclusive)
      if (planDate < decirStart || planDate > decirEnd) {
        return { ok: true, skipped: true, count: 0 };
      }
      if (planDate.getTime() === decirStart.getTime() && shift !== 'N') {
        return { ok: true, skipped: true, count: 0 };
      }
      const mode = await fetchDecirMode(corpOperNr);
      if (!mode) return {ok: false, reason: 'sem mode definido em decir_mode'};
      const teamTitles = DECIR_MODE_TEAMS[mode];
      if (!teamTitles) {
        return {ok: false, reason: `mode "${mode}" não reconhecido`};
      }
      const records = [];
      for (const table of tables) {
        if (!teamTitles.includes(table.title)) continue;
        for (const row of table.rows) {
          const nInt = row.n_int?.trim();
          if (!nInt) continue;
          records.push({n_int: String(nInt), abv_name: row.nome || '', year: String(year), month: String(month), day: String(day), shift: String(shift), corp_oper_nr: String(corpOperNr)});
        }
      }
      try {
        const delUrl = `${SUPABASE_URL}/rest/v1/decir_reg_pag_ecin`
          + `?corp_oper_nr=eq.${encodeURIComponent(String(corpOperNr))}`
          + `&day=eq.${encodeURIComponent(String(day))}`
          + `&month=eq.${encodeURIComponent(String(month))}`
          + `&year=eq.${encodeURIComponent(String(year))}`
          + `&shift=eq.${encodeURIComponent(String(shift))}`;
        const delRes = await fetch(delUrl, {method: "DELETE", headers: getSupabaseHeaders()});
        if (!delRes.ok) throw new Error(`Erro a limpar decir_reg_pag_ecin (${delRes.status}): ${await delRes.text()}`);
        if (records.length === 0) return {ok: true, mode, teamTitles, count: 0};
        const insUrl = `${SUPABASE_URL}/rest/v1/decir_reg_pag_ecin`;
        const res = await fetch(insUrl, {
          method: "POST",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
          body: JSON.stringify(records)
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Erro a gravar decir_reg_pag_ecin (${res.status}): ${t}`);
        }
        return {ok: true, mode, teamTitles, count: records.length};
      } catch (err) {
        console.error('❌ Erro em saveDecirEcin:', err);
        return {ok: false, reason: err.message};
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
        <div class="plandir-main-card" style="margin: 10px 0 0 0; max-width: 1200px; transform:none !important; transition:none !important;">
          <div class="plandir-card-title"><span class="plandir-status-dot"></span>${title}</div>
          <table class="plandir-table">
            <colgroup>
              <col style="width: 75px;">
              <col style="width: 200px;">
              <col style="width: 250px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 75px;">
              <col style="width: 400px;">
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
    function updateStatusDots() {
      const thresholds = {"EQUIPA 01": {yellow: 4, green: 5}, "EQUIPA 02": {yellow: 4, green: 5}, "LOGÍSTICA": {yellow: 1, green: 2},
                          "INEM": {yellow: 1, green: 2}, "INEM - Reserva": {yellow: 1, green: 2}};
      document.querySelectorAll('.plandir-main-card').forEach(card => {
        const dot = card.querySelector('.plandir-status-dot');
        if (!dot) return;
        const titleEl = card.querySelector('.plandir-card-title');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const filledCount = [...card.querySelectorAll('.plandir-nint-input')].filter(input => input.value.trim() !== '').length;
        const config = thresholds[title];
        if (config) {
          dot.classList.remove('filled', 'dot-yellow', 'dot-red');
          if (filledCount >= config.green) dot.classList.add('filled');
          else if (filledCount >= config.yellow) dot.classList.add('dot-yellow');
          else dot.classList.add('dot-red');
        } else {
          dot.classList.remove('dot-yellow', 'dot-red');
          dot.classList.toggle('filled', filledCount > 0);
        }
      });
      const sideTbody = document.getElementById('plandir-side-tbody');
      if (!sideTbody) return;
      const currentInputs = Array.from(document.querySelectorAll('.plandir-nint-input'))
      .map(i => i.value.trim().padStart(3, '0'))
      .filter(val => val !== '' && val !== '000');
      const tables = collectTableData();
      const swapNints = [];
      tables.forEach(table => {
        table.rows.forEach(row => {
          if (row.obs && row.obs.includes('Troca de Serviço')) {
            const parts = row.obs.split('|');
            const lastPart = parts[parts.length - 1].trim();
            const match = lastPart.match(/^(\d{1,3})/);
            if (match) swapNints.push(match[1].padStart(3, '0'));
          }
        });
      });
      const allFilledNints = [...new Set([...currentInputs, ...swapNints])];
      sideTbody.querySelectorAll('tr[data-side-nint]').forEach(tr => {
        const nint = tr.getAttribute('data-side-nint');
        const isFilled = allFilledNints.includes(nint);
        tr.classList.toggle('row-highlight-green', isFilled);
        tr.classList.toggle('row-pending-red', !isFilled);
      });
    }
    function updateRowFields(row, data, shift) {
      const entrance = row.querySelector('.plandir-entrance-input');
      const exit = row.querySelector('.plandir-exit-input');
      const patent = row.querySelectorAll('td input')[1];
      const name = row.querySelectorAll('td input')[2];
      const mpCell = row.querySelectorAll('td')[5];
      const tasCell = row.querySelectorAll('td')[6];
      const obsInput = row.querySelectorAll('td input')[5];
      if (shift === 'D') {
        if (entrance) entrance.value = "08:00";
        if (exit) exit.value = "20:00";
      } else if (shift === 'N') {
        if (entrance) entrance.value = "20:00";
        if (exit) exit.value = "08:00";
      }
      if (data) {
        if (patent) patent.value = data.patent || "";
        if (name) name.value = data.abv_name || "";
        if (mpCell) { mpCell.textContent = data.MP ? "X" : ""; mpCell.classList.toggle('plandir-mp-active', !!data.MP); }
        if (tasCell) { tasCell.textContent = data.TAS ? "X" : ""; tasCell.classList.toggle('plandir-tas-active', !!data.TAS); }
      } else {
        if (entrance) entrance.value = "";
        if (exit) exit.value = "";
        if (patent) patent.value = "";
        if (name) name.value = "";
        if (mpCell) { mpCell.textContent = ""; mpCell.classList.remove('plandir-mp-active'); }
        if (tasCell) { tasCell.textContent = ""; tasCell.classList.remove('plandir-tas-active'); }
        if (obsInput) obsInput.value = "";
      }
    }
    function activateShiftButton(shift) {
      document.querySelectorAll('.options-btn').forEach(btn => {
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
      const tables = [...document.querySelectorAll('.plandir-main-card')].map(card => {
        const titleEl = card.querySelector('.plandir-card-title');
        const title = titleEl ? titleEl.textContent.trim() : "Sem título";
        const rows = [...card.querySelectorAll('tbody tr')].map(tr => {
          const inputs = tr.querySelectorAll('input');
          const mpCell = tr.querySelector('.mp-cell');
          const tasCell = tr.querySelector('.tas-cell');
          return {n_int: inputs[0]?.value?.trim() || "", patente: inputs[1]?.value?.trim() || "", nome: inputs[2]?.value?.trim() || "", entrada: inputs[3]?.value?.trim() || "",
                  saida: inputs[4]?.value?.trim() || "", MP: mpCell?.textContent === "X", TAS: tasCell?.textContent === "X", obs: inputs[5]?.value?.trim() || ""};
        });
        return {title, rows};
      });
      return tables;
    }
    function createEmitButton(container) {
      if (document.getElementById('emit-pp')) return;
      const btnWrapper = document.createElement('div');
      btnWrapper.style.display = 'flex';
      btnWrapper.style.flexDirection = 'row';
      btnWrapper.style.justifyContent = 'center';
      btnWrapper.style.alignItems = 'center';
      btnWrapper.style.gap = '10px';
      btnWrapper.style.margin = '10px auto 0 auto';
      const btnStyle = (btn) => {
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '12px';
        btn.style.fontWeight = '500';
        btn.style.letterSpacing = '0.01em';
        btn.style.textTransform = 'uppercase';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.color = '#ffffff';
      };
      const draftBtn = document.createElement('button');
      draftBtn.id = 'draft-pp';
      draftBtn.className = 'btn btn-add';
      draftBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> GUARDAR RASCUNHO';
      btnStyle(draftBtn);
      draftBtn.addEventListener('click', async () => {
        if (draftBtn.disabled || emitBtn.disabled) return;
        draftBtn.disabled = true;
        emitBtn.disabled = true;
        draftBtn.textContent = 'A GUARDAR...';
        draftBtn.style.opacity = '0.6';
        draftBtn.style.cursor = 'not-allowed';
        emitBtn.style.opacity = '0.6';
        emitBtn.style.cursor = 'not-allowed';
        try {
          let shift = document.querySelector('.options-btn.active')?.dataset.shift;
          if (!shift || shift === 'LAST') {
            shift = sessionStorage.getItem("originalShift") || localStorage.getItem("originalShift");
          }
          if (!shift) {
            showPopup('popup-danger', 'Não foi possível determinar o turno.');
            return;
          }
          await saveDraft(shift);
          showPopup('popup-success', 'Rascunho guardado com sucesso!');
        } finally {
          draftBtn.disabled = false;
          emitBtn.disabled = false;
          draftBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> GUARDAR RASCUNHO';
          draftBtn.style.opacity = '1';
          draftBtn.style.cursor = 'pointer';
          emitBtn.style.opacity = '1';
          emitBtn.style.cursor = 'pointer';
        }
      });
      const emitBtn = document.createElement('button');
      emitBtn.id = 'emit-pp';
      emitBtn.className = 'btn btn-success';
      emitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> EMITIR PLANEAMENTO';
      btnStyle(emitBtn);
      emitBtn.addEventListener('click', async () => {
        if (emitBtn.disabled || draftBtn.disabled) return;
        emitBtn.disabled = true;
        draftBtn.disabled = true;
        emitBtn.textContent = 'A EMITIR PLANEAMENTO...';
        emitBtn.style.opacity = '0.6';
        emitBtn.style.cursor = 'not-allowed';
        draftBtn.style.opacity = '0.6';
        draftBtn.style.cursor = 'not-allowed';
        try {
          let shift = document.querySelector('.options-btn.active').dataset.shift;
          let date = new Date().toLocaleDateString('sv-SE');
          if (shift === "LAST") {
            let storedShift = sessionStorage.getItem("originalShift") || localStorage.getItem("originalShift");
            if (storedShift) {
              shift = storedShift;
            } else {
              showPopup('popup-danger', "Não foi possível determinar o turno original.");
              return;
            }
            const storedDate = sessionStorage.getItem("originalDate") || localStorage.getItem("originalDate");
            if (storedDate) date = storedDate;
          }
          await emitPlanning(shift, date);
        } finally {
          emitBtn.disabled = false;
          draftBtn.disabled = false;
          emitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> EMITIR PLANEAMENTO';
          emitBtn.style.opacity = '1';
          emitBtn.style.cursor = 'pointer';
          draftBtn.style.opacity = '1';
          draftBtn.style.cursor = 'pointer';
        }
      });
      btnWrapper.appendChild(draftBtn);
      btnWrapper.appendChild(emitBtn);
      container.appendChild(btnWrapper);
    }
    async function fetchRecipientsFromSupabase() {
      // Centro de Dados → Emails Config. → Emissão de Planeamentos Diários (por corporação)
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const categories = ['plandir_emit_mail_to', 'plandir_emit_mail_cc', 'plandir_emit_mail_bcc'];
      const url = `${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpOperNr}&category=in.(${categories.join(',')})&select=category,value`;
      const response = await fetch(url, {method: 'GET', headers: getSupabaseHeaders()});
      if (!response.ok) throw new Error('Não foi possível obter os destinatários do Planeamento (Emails Config.).');
      const data = await response.json();
      const recipients = {to: [], cc: [], bcc: []};
      for (const row of data) {
        const emails = row.value ? String(row.value).split(',').map(e => e.trim()).filter(e => e) : [];
        if (row.category === 'plandir_emit_mail_to') recipients.to = emails;
        else if (row.category === 'plandir_emit_mail_cc') recipients.cc = emails;
        else if (row.category === 'plandir_emit_mail_bcc') recipients.bcc = emails;
      }
      if (recipients.to.length === 0) throw new Error('Configure os destinatários do Planeamento em Centro de Dados → Emails Config.');
      return recipients;
    }
    function getOptelName() {
      const tables = collectTableData();
      const optelTable = tables.find(t => t.title === "OPTEL");
      if (!optelTable || optelTable.rows.length === 0) return "";
      return optelTable.rows[0].nome || "";
    }
    async function emitPlanning(shift, date, baixar = false) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {
        showPopup('popup-danger', "Erro: Sessão expirada. Por favor, faça login novamente.");
        return;
      }
      const loading = (t) => { if (typeof updateLoadingPopup === "function") updateLoadingPopup(t); };
      const stopLoading = () => { if (typeof hideLoadingPopup === "function") hideLoadingPopup(); };
      if (typeof showLoadingPopup === "function") showLoadingPopup("A preparar o planeamento...");
      try {
        const tables = collectTableData();
        const optelName = getOptelName();
        const [year, month, day] = date.split('-');
        const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        const monthName = monthNames[parseInt(month, 10) - 1] || month;
        const formattedDate = `${year}${month}${day}`;
        const shiftHours = (shift === 'D') ? '08:00-20:00' : '20:00-08:00';
        const [{to, cc, bcc}, common] = await Promise.all([fetchRecipientsFromSupabase(), _getPLANDIREmailCommonData(corpOperNr)]);
        if (to.length === 0) {
          stopLoading();
          showPopup('popup-danger', "Erro: Defina pelo menos um destinatário.");
          return;
        }
        const {logoUrl, cbName, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail} = common;
        const teamNameMap = {"OFOPE": "ofope", "CHEFE DE SERVIÇO": "chefe_servico", "OPTEL": "optel", "EQUIPA 01": "equipa_01", "EQUIPA 02": "equipa_02", "LOGÍSTICA": "logistica",
                             "INEM": "inem", "INEM - Reserva": "inem_reserva", "SERVIÇO GERAL": "servico_geral"};
        /* ---------- 1) PDF + envio: arranca já (não depende das gravações) ---------- */
        const fileDisplayName = `Planeamento Diário ${formattedDate} Turno ${shift}`;
        const greeting = getGreeting();
        const emailBodyHTML = `
          ${greeting}<br>
          Remeto em anexo a Vossas Exª.s o  ${fileDisplayName}<br>
          Com os melhores cumprimentos,<br>
          OPTEL<br>${optelName}`;
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const lastUpdated = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        const sendPromise = (async () => {
          const response = await fetch("https://cb360-online.vercel.app/api/plandir_convert_and_send", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({shift, date, tables, recipients: to, ccRecipients: cc, bccRecipients: bcc, emailBody: emailBodyHTML,
                                  logoUrl: logoUrl, corpName: cbName, corpOperNr: corpOperNr, lastUpdated,
                                  corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail})
          });
          let result = {};
          try { result = await response.json(); } catch (e) {}
          return {ok: response.ok, details: result.details || result.error || ""};
        })().catch(err => ({ok: false, details: err.message}));
        /* ---------- 2) Gravações na base de dados (em paralelo) ---------- */
        loading("A gravar na base de dados...");
        const saveWarnings = [];
        const saveFomioTeams = Promise.all(tables.map(async table => {
          const team_name = teamNameMap[table.title];
          if (!team_name) return;
          const nonEmptyRows = table.rows.filter(r => r.n_int || r.patente || r.nome || r.entrada || r.saida || r.MP || r.TAS || r.obs);
          const delTeam = await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams?team_name=eq.${encodeURIComponent(team_name)}&corp_oper_nr=eq.${corpOperNr}`, {method: "DELETE", headers: getSupabaseHeaders()});
          if (!delTeam.ok) { saveWarnings.push(`FOMIO (${table.title})`); return; }
          if (nonEmptyRows.length > 0) {
            const insTeam = await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams`, {
              method: "POST",
              headers: getSupabaseHeaders(),
              body: JSON.stringify(nonEmptyRows.map(r => ({team_name, n_int: r.n_int || '', patente: r.patente || '', nome: r.nome || '', h_entrance: r.entrada || '', h_exit: r.saida || '',
                                                           MP: !!r.MP, TAS: !!r.TAS, observ: r.obs || '', corp_oper_nr: corpOperNr})))
            });
            if (!insTeam.ok) saveWarnings.push(`FOMIO (${table.title})`);
          }
        })).catch(() => saveWarnings.push("FOMIO"));
        const saveFomioDate = (async () => {
          const delDate = await fetch(`${SUPABASE_URL}/rest/v1/fomio_date?corp_oper_nr=eq.${corpOperNr}`, {method: "DELETE", headers: getSupabaseHeaders()});
          const insDate = delDate.ok ? await fetch(`${SUPABASE_URL}/rest/v1/fomio_date`, {
            method: "POST",
            headers: getSupabaseHeaders(),
            body: JSON.stringify([{header_text: `Dia: ${day} ${monthName} ${year} | Turno ${shift} | ${shiftHours}`, corp_oper_nr: corpOperNr}])
          }) : null;
          if (!delDate.ok || !insDate?.ok) saveWarnings.push("FOMIO (data)");
        })().catch(() => saveWarnings.push("FOMIO (data)"));
        const saveAtt = saveAttendance(tables, shift, corpOperNr, day, month, year)
          .then(ok => { if (!ok) { console.warn('⚠️ Aviso: Falha ao gravar dados de assiduidade na tabela reg_assid.'); saveWarnings.push("Assiduidade"); } })
          .catch(() => saveWarnings.push("Assiduidade"));
        const saveElig = saveEligibility(tables, day, month, year, corpOperNr)
          .then(ok => { if (!ok) { console.warn('⚠️ Aviso: Falha ao gravar dados na tabela reg_eligibility.'); saveWarnings.push("Elegibilidade"); } })
          .catch(() => saveWarnings.push("Elegibilidade"));
        const saveDecir = saveDecirEcin(tables, shift, corpOperNr, day, month, year)
          .then(r => { if (!r.ok) { console.warn(`⚠️ Aviso: DECIR não gravado — ${r.reason}`); saveWarnings.push(`DECIR (${r.reason})`); } })
          .catch(err => saveWarnings.push(`DECIR (${err.message})`));
        await Promise.all([saveFomioTeams, saveFomioDate, saveAtt, saveElig, saveDecir]);
        /* ---------- 3) Esperar pelo envio ---------- */
        loading("A gerar o PDF e a enviar...");
        const sent = await sendPromise;
        stopLoading();
        if (!sent.ok) {
          showPopup('popup-danger', `ERRO! O planeamento não foi enviado. Detalhes: ${sent.details || 'Verificar consola.'}` +
                                    (saveWarnings.length ? ` Também falhou a gravação em: ${saveWarnings.join(", ")}.` : ""));
          return;
        }
        if (saveWarnings.length) {
          showPopup('popup-danger', `Planeamento do dia ${day}/${month}/${year} (Turno ${shift}) enviado, mas NÃO foi gravado em: ${saveWarnings.join(", ")}. Volte a emitir ou contacte o administrador.`);
        } else {
          showPopup('popup-success', `Planeamento do dia ${day}/${month}/${year} (Turno ${shift}) emitido e enviado com sucesso!`);
        }
        await fetch(`${SUPABASE_URL}/rest/v1/fomio_draft?corp_oper_nr=eq.${corpOperNr}&shift=eq.${shift}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
      } catch (err) {
        console.error('Erro no processo de emissão:', err);
        stopLoading();
        showPopup('popup-danger', 'Erro ao processar o planeamento. Por favor, tente novamente.');
      }
    }
    async function loadSideTable(shift) {
      const tbody = document.getElementById('plandir-side-tbody');
      const rightCol = document.getElementById('plandir-right-col');
      if (!tbody || !rightCol) return;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) return;
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#aaa; padding:12px;">A carregar...</td></tr>`;
      rightCol.style.display = 'block';
      try {
        let dataNormal = [], dataEip = [], dataEcin = [], dataOfope = [], dataPiquete = [];
        if (shift === 'D') {
          const urlNormal = `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&or=(shift.in.(D,M,HA),shift.like.EP*)&select=n_int,abv_name,shift,function`;
          const resNormal = await fetch(urlNormal, {headers: getSupabaseHeaders()});
          const allD = await resNormal.json();
          dataNormal = allD.filter(r => !String(r.function || '').toUpperCase().startsWith('EP'));
          dataEip = allD.filter(r => String(r.function || '').toUpperCase().startsWith('EP'));
          const urlEcin = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=in.(ED,ET)&select=n_int,abv_name`;
          dataEcin = await (await fetch(urlEcin, {headers: getSupabaseHeaders()})).json();
        } else {
          const urlNormal = `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&shift=eq.${shift}&select=n_int,abv_name`;
          const resNormal = await fetch(urlNormal, {headers: getSupabaseHeaders()});
          dataNormal = await resNormal.json();
        }
        if (shift === 'N') {
          const urlOfope = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=eq.N&select=n_int,abv_name`;
          dataOfope = await (await fetch(urlOfope, {headers: getSupabaseHeaders()})).json();
          const urlPiquete = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=eq.PN&select=n_int,abv_name`;
          dataPiquete = await (await fetch(urlPiquete, {headers: getSupabaseHeaders()})).json();
          const urlEcin = `${SUPABASE_URL}/rest/v1/reg_serv?corp_oper_nr=eq.${corpOperNr}&day=eq.${day}&month=eq.${month}&year=eq.${year}&value=in.(EN,ET)&select=n_int,abv_name`;
          dataEcin = await (await fetch(urlEcin, {headers: getSupabaseHeaders()})).json();
        }
        if (dataNormal.length === 0 && dataEip.length === 0 && dataEcin.length === 0 && dataOfope.length === 0 && dataPiquete.length === 0) {
          tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#aaa; padding:12px;">Sem dados</td></tr>`;
          return;
        }
        const allNInts = [...dataNormal, ...dataEip, ...dataEcin, ...dataOfope, ...dataPiquete].map(r => String(r.n_int).trim().padStart(3, '0'));
        const uniqueNInts = [...new Set(allNInts)];
        const resElems = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=in.(${uniqueNInts.join(',')})&select=n_int,patent`, {headers: getSupabaseHeaders()});
        const elems = await resElems.json();
        const patenteMap = {};
        elems.forEach(e => { patenteMap[String(e.n_int || '').trim().padStart(3, '0')] = e.patent || ''; });
        const sortFn = (a, b) => {
          const patentA = patenteMap[String(a.n_int).trim().padStart(3, '0')] || '';
          const patentB = patenteMap[String(b.n_int).trim().padStart(3, '0')] || '';
          const isChefeA = patentA.toLowerCase().includes('chefe');
          const isChefeB = patentB.toLowerCase().includes('chefe');
          if (isChefeA && !isChefeB) return -1;
          if (!isChefeA && isChefeB) return 1;
          return Number(a.n_int) - Number(b.n_int);
        };
        dataNormal.sort(sortFn); dataEip.sort(sortFn); dataEcin.sort(sortFn); dataOfope.sort(sortFn); dataPiquete.sort(sortFn);
        const sectionHeader = (title) => `
          <tr>
            <td colspan="3" class="plandir-card-title black-variant" style="height: 30px; font-size: 11px; padding: 0; border: none; text-align: center; display: table-cell; border-top: 1px solid #fff;">
              ${title}
            </td>
          </tr>
        `;
        let htmlContent = sectionHeader('PROFISSIONAIS');
        htmlContent += dataNormal.map(r => renderRow(r, patenteMap)).join('');
        if (shift === 'D') {
          if (dataEip.length > 0) {htmlContent += sectionHeader('EQUIPA DE INTERVENÇÃO PERMANENTE'); htmlContent += dataEip.map(r => renderRow(r, patenteMap)).join('');}
          if (dataEcin.length > 0) {htmlContent += sectionHeader('ECIN'); htmlContent += dataEcin.map(r => renderRow(r, patenteMap)).join('');}
        }
        if (shift === 'N') {
          if (dataOfope.length > 0) {htmlContent += sectionHeader('OFOPE'); htmlContent += dataOfope.map(r => renderRow(r, patenteMap)).join('');}
          if (dataPiquete.length > 0) {htmlContent += sectionHeader('PIQUETE'); htmlContent += dataPiquete.map(r => renderRow(r, patenteMap)).join('');}
          if (dataEcin.length > 0) {htmlContent += sectionHeader('ECIN'); htmlContent += dataEcin.map(r => renderRow(r, patenteMap)).join('');}
        }
        tbody.innerHTML = htmlContent;
        updateStatusDots();
      } catch (err) {
        console.error('Erro ao carregar escala:', err);
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#e44; padding:12px;">Erro ao carregar</td></tr>`;
      }
    }
    /* contadores do planeamento (só leem a grelha) */
    (function plandirKpis() {
      const cont = document.getElementById('plandir_container'), box = document.getElementById('plandir-kpis');
      if (!cont || !box) return;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      let t = 0;
      const upd = () => {
        const cards = [...cont.querySelectorAll('.plandir-main-card')];
        box.hidden = !cards.length;
        if (!cards.length) return;
        const filled = c => [...c.querySelectorAll('.plandir-nint-input')].filter(i => i.value.trim()).length;
        set('plandir-k-el', new Set([...cont.querySelectorAll('.plandir-nint-input')].map(i => i.value.trim()).filter(Boolean)).size);
        set('plandir-k-eq', cards.filter(c => /^EQUIPA/i.test(c.querySelector('.plandir-card-title')?.textContent.trim() || '') && filled(c)).length);
        set('plandir-k-tas', cont.querySelectorAll('.plandir-tas-active').length);
        set('plandir-k-inc', cont.querySelectorAll('.plandir-status-dot.dot-red').length);
      };
      const later = () => { clearTimeout(t); t = setTimeout(upd, 80); };
      new MutationObserver(later).observe(cont, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
      cont.addEventListener('input', later);
    })();
    async function loadShift(shift) {
      const container = document.getElementById('plandir_container');
      const headerContainer = document.getElementById('plandir-header-container');
      const activeBtn = document.querySelector('.options-btn.active');
      if (activeBtn && activeBtn.dataset.shift === shift) {
        activeBtn.classList.remove('active');
        container.innerHTML = '';
        if (headerContainer) headerContainer.innerHTML = '';
        document.getElementById('plandir-right-col').style.display = 'none';
        return;
      }
      activateShiftButton(shift);
      container.innerHTML = '';
      if (headerContainer) headerContainer.innerHTML = '';
      if (shift !== 'LAST') {
        sessionStorage.setItem("originalShift", shift);
        localStorage.setItem("originalShift", shift);
      }
      let header;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (shift === 'LAST') {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/fomio_date?select=header_text&limit=1`, {method: 'GET', headers: getSupabaseHeaders()});
          const dataArr = await res.json();
          let formattedHeader = null;
          let originalShift = null;
          if (dataArr && dataArr.length > 0) {
            const headerText = dataArr[0].header_text;
            const match = headerText.match(/Dia: (\d{2}) (\w{3}) (\d{4}) \| Turno (.) \| (.+)/);
            if (match) {
              const [_, day, month, year, shiftLetter, hours] = match;
              originalShift = shiftLetter;
              sessionStorage.setItem("originalShift", shiftLetter);
              localStorage.setItem("originalShift", shiftLetter);
              const monthNamesShort = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
              const monthNum = String(monthNamesShort.indexOf(month) + 1).padStart(2, '0');
              const originalDate = `${year}-${monthNum}-${day}`;
              sessionStorage.setItem("originalDate", originalDate);
              localStorage.setItem("originalDate", originalDate);
            }
            formattedHeader = headerText;
          }
          header = createPlanDirHeader('LAST', formattedHeader);
          if (header && headerContainer) headerContainer.appendChild(header); // ← ALTERADO
          container.insertAdjacentHTML('beforeend', planTableConfig(originalShift).map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
          try {
            const res2 = await fetch(`${SUPABASE_URL}/rest/v1/fomio_teams?select=*&corp_oper_nr=eq.${corpOperNr}`, {method: 'GET', headers: getSupabaseHeaders()});
            const allMembers = await res2.json();
            if (allMembers && allMembers.length > 0) {
              const teamNameMap = {"ofope": "OFOPE", "chefe_servico": "CHEFE DE SERVIÇO", "optel": "OPTEL", "equipa_01": "EQUIPA 01", "equipa_02": "EQUIPA 02", "logistica": "LOGÍSTICA",
                                   "inem": "INEM", "inem_reserva": "INEM - Reserva", "servico_geral": "SERVIÇO GERAL"};
              const teamsData = allMembers.reduce((acc, member) => {
                if (!acc[member.team_name]) acc[member.team_name] = [];
                acc[member.team_name].push(member);
                return acc;
              }, {});
              Object.keys(teamsData).forEach(dbTeamName => {
                const displayTitle = teamNameMap[dbTeamName];
                if (!displayTitle) return;
                const card = Array.from(document.querySelectorAll('.plandir-main-card')).find(
                  c => c.querySelector('.plandir-card-title')?.textContent.trim() === displayTitle
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
                  if (mpCell) {mpCell.textContent = member.MP ? 'X' : ''; mpCell.classList.toggle('plandir-mp-active', !!member.MP);}
                  if (tasCell) {tasCell.textContent = member.TAS ? 'X' : ''; tasCell.classList.toggle('plandir-tas-active', !!member.TAS);}
                  if (inputs[5]) inputs[5].value = member.observ || '';
                });
              });
            }
          } catch (err) {
            console.error('Erro ao carregar dados salvos direto:', err);
          }
          updateStatusDots();
          if (originalShift) loadSideTable(originalShift);
        } catch (err) {
          console.error('Erro ao carregar header direto:', err);
          header = createPlanDirHeader('LAST');
          if (header && headerContainer) headerContainer.appendChild(header);
          container.insertAdjacentHTML('beforeend', tableConfig.map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
        }
      } else {
        header = createPlanDirHeader(shift);
        if (header && headerContainer) headerContainer.appendChild(header);
        container.insertAdjacentHTML('beforeend', planTableConfig(shift).map(cfg => createTable(cfg.rows, cfg.special, cfg.title)).join(''));
        const draftMembers = await loadDraft(shift, corpOperNr);
        if (draftMembers) {
          const teamNameMap = {"ofope": "OFOPE", "chefe_servico": "CHEFE DE SERVIÇO", "optel": "OPTEL", "equipa_01": "EQUIPA 01", "equipa_02": "EQUIPA 02", "logistica": "LOGÍSTICA",
                               "inem": "INEM", "inem_reserva": "INEM - Reserva", "servico_geral": "SERVIÇO GERAL"};
          const teamsData = draftMembers.reduce((acc, member) => {
            if (!acc[member.team_name]) acc[member.team_name] = [];
            acc[member.team_name].push(member);
            return acc;
          }, {});
          Object.keys(teamsData).forEach(dbTeamName => {
            const displayTitle = teamNameMap[dbTeamName];
            if (!displayTitle) return;
            const card = Array.from(document.querySelectorAll('.plandir-main-card')).find(
              c => c.querySelector('.plandir-card-title')?.textContent.trim() === displayTitle
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
              if (inputs[2]) inputs[2].value = member.abv_name || '';
              if (inputs[3]) inputs[3].value = member.h_entrance || '';
              if (inputs[4]) inputs[4].value = member.h_exit || '';
              if (mpCell) {mpCell.textContent = member.MP ? 'X' : ''; mpCell.classList.toggle('plandir-mp-active', !!member.MP);}
              if (tasCell) {tasCell.textContent = member.TAS ? 'X' : ''; tasCell.classList.toggle('plandir-tas-active', !!member.TAS);}
              if (inputs[5]) inputs[5].value = member.observ || '';
            });
          });
          updateStatusDots();
        }
        loadSideTable(shift);
      }
      container.querySelectorAll('.plandir-nint-input').forEach(input => {
        input.addEventListener('input', async function() {
          this.value = this.value.replace(/\D/g, '').slice(0, 3);
          const row = this.closest('tr');
          if (this.value.length === 3) {
            const nIntFormatted = this.value.padStart(3, '0');
            const inputRef = this;
            let dataArr = [];
            try {
              const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${this.value}`, {headers: getSupabaseHeaders()});
              dataArr = await res.json();
              updateRowFields(row, dataArr[0], shift);
            } catch (err) {
              console.error('Erro reg_elems:', err);
            }
            const allNintInputs = Array.from(document.querySelectorAll('.plandir-nint-input'));
            const existingRow = allNintInputs.find(i => i !== inputRef && i.value.trim() === this.value.trim());
            if (existingRow) {
              const existingObs = existingRow.closest('tr').querySelectorAll('td input')[5];
              const obsInput = row.querySelectorAll('td input')[5];
              if (obsInput && existingObs) obsInput.value = existingObs.value;
              updateStatusDots();
              return;
            }
            const sideTbody = document.getElementById('plandir-side-tbody');
            const sideRow = sideTbody && sideTbody.querySelector(`tr[data-side-nint="${nIntFormatted}"]`);
            const existsInSide = !!sideRow;
            if (existsInSide) {
              const obsInput = row.querySelectorAll('td input')[5];
              if (shift === 'D') {
                try {
                  let secao = '';
                  let currentSection = '';
                  const sideTbody = document.getElementById('plandir-side-tbody');
                  sideTbody.querySelectorAll('tr').forEach(tr => {
                    const sectionCell = tr.querySelector('td.plandir-card-title');
                    if (sectionCell) currentSection = sectionCell.textContent.trim();
                    if (tr.getAttribute('data-side-nint') === nIntFormatted) secao = currentSection;
                  });
                  if (secao === 'ECIN') {
                    if (obsInput) obsInput.value = 'ECIN';
                  } else {
                    const resTeam = await fetch(`${SUPABASE_URL}/rest/v1/reg_employees?n_int=eq.${this.value}&select=team`, {
                      headers: getSupabaseHeaders()
                    });
                    const teamData = await resTeam.json();
                    const team = teamData[0]?.team || '';
                    if (obsInput) obsInput.value = team.startsWith('EIP') ? 'EIP' : 'Profissional';
                  }
                } catch (err) {
                  console.error('Erro ao buscar team:', err);
                  if (obsInput) obsInput.value = 'Profissional';
                }
              } else {
                let secao = '';
                let currentSection = '';
                sideTbody.querySelectorAll('tr').forEach(tr => {
                  const sectionCell = tr.querySelector('td.plandir-card-title');
                  if (sectionCell) currentSection = sectionCell.textContent.trim();
                  if (tr.getAttribute('data-side-nint') === nIntFormatted) secao = currentSection;
                });
                if (obsInput) {
                  if (secao === 'PROFISSIONAIS') obsInput.value = 'Profissional';
                  else if (secao === 'PIQUETE') obsInput.value = 'Piquete';
                  else if (secao === 'ECIN') obsInput.value = 'ECIN';
                  else if (secao === 'OFOPE') obsInput.value = '';
                  else obsInput.value = 'Profissional';
                }
              }
            } else {
              const nome = dataArr[0]?.abv_name || nIntFormatted;
              const msg = document.getElementById('popup-confirm-message');
              if (msg) msg.textContent = `O Elemento ${nIntFormatted} (${nome}) não consta na escala do dia. Deseja adicioná-lo ao planeamento?`;
              const modal1 = document.getElementById('popup-confirm-modal');
              const modal2 = document.getElementById('popup-service-type-modal');
              if (modal1) modal1.classList.add('show');
              const okBtn1 = document.getElementById('popup-confirm-ok-btn');
              const cancelBtn1 = document.getElementById('popup-confirm-cancel-btn');
              const okBtn2Raw = document.getElementById('popup-service-type-ok-btn');
              const cancelBtn2Raw = document.getElementById('popup-service-type-cancel-btn');
              const okBtn2 = okBtn2Raw.cloneNode(true);
              const cancelBtn2 = cancelBtn2Raw.cloneNode(true);
              okBtn2Raw.parentNode.replaceChild(okBtn2, okBtn2Raw);
              cancelBtn2Raw.parentNode.replaceChild(cancelBtn2, cancelBtn2Raw);
              if (okBtn1) okBtn1.onclick = () => {
                modal1.classList.remove('show');
                document.querySelectorAll('input[name="popup-service-type"]').forEach(r => r.checked = false);
                document.getElementById('service-swap-fields').style.display = 'none';
                document.getElementById('service-swap-nint').value = '';
                document.getElementById('service-swap-name').value = '';
                document.getElementById('service-other-fields').style.display = 'none';
                document.getElementById('service-other-text').value = '';
                setTimeout(() => { if (modal2) modal2.classList.add('show'); }, 50);
              };
              if (cancelBtn1) cancelBtn1.onclick = () => {
                modal1.classList.remove('show');
                inputRef.value = '';
                updateRowFields(row, null);
                updateStatusDots();
              };
              okBtn2.onclick = async () => {
                const selected = document.querySelector('input[name="popup-service-type"]:checked');
                if (!selected) { showPopup('popup-danger', 'Por favor selecione uma opção.'); return; }
                if (selected.value === 'Troca de Serviço') {
                  const nIntSwap = document.getElementById('service-swap-nint')?.value?.trim();
                  if (!nIntSwap) {
                    showPopup('popup-danger', 'Por favor insira o Nº Int. do elemento para troca.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => { closePopup('popup-danger'); dangerBtn.onclick = originalOnclick; setTimeout(() => { document.getElementById('service-swap-nint').focus(); }, 50); };
                    return;
                  }
                  if (nIntSwap === inputRef.value.trim()) {
                    showPopup('popup-danger', 'O elemento não pode fazer troca consigo mesmo.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => {closePopup('popup-danger'); dangerBtn.onclick = originalOnclick; setTimeout(() => {
                      document.getElementById('service-swap-nint').focus(); document.getElementById('service-swap-nint').select();}, 50);};
                    return;
                  }
                }
                if (selected.value === 'Outro') {
                  const otherText = document.getElementById('service-other-text')?.value?.trim();
                  if (!otherText) {
                    showPopup('popup-danger', 'Por favor preencha o campo de observação.');
                    const dangerBtn = document.querySelector('#popup-danger .popup-btn');
                    const originalOnclick = dangerBtn.onclick;
                    dangerBtn.onclick = () => {closePopup('popup-danger'); dangerBtn.onclick = originalOnclick; setTimeout(() => {document.getElementById('service-other-text').focus();}, 50);};
                    return;
                  }
                }
                modal2.classList.remove('show');
                const obsInput = row.querySelectorAll('td input')[5];
                if (selected.value === 'Troca de Serviço') {
                  const nIntSwap = document.getElementById('service-swap-nint')?.value?.trim();
                  const nameSwap = document.getElementById('service-swap-name')?.value?.trim();
                  const swapInfo = nIntSwap ? `${nIntSwap} ${nameSwap}` : '';
                  let secaoSwap = '';
                  let currentSection = '';
                  const sideTbody = document.getElementById('plandir-side-tbody');
                  const nIntSwapFormatted = nIntSwap?.padStart(3, '0');
                  if (sideTbody && nIntSwapFormatted) {
                    sideTbody.querySelectorAll('tr').forEach(tr => {
                      const sectionCell = tr.querySelector('td.plandir-card-title');
                      if (sectionCell) currentSection = sectionCell.textContent.trim();
                      if (tr.getAttribute('data-side-nint') === nIntSwapFormatted) secaoSwap = currentSection;
                    });
                  }
                  let prefix;
                  if (shift === 'D') {
                    prefix = secaoSwap === 'ECIN' ? 'ECIN' : 'Profissional';
                  } else {
                    prefix = 'Piquete';
                    if (secaoSwap === 'PROFISSIONAIS') prefix = 'Profissional';
                    else if (secaoSwap === 'ECIN') prefix = 'ECIN';
                    else if (secaoSwap === 'PIQUETE') prefix = 'Piquete';
                  }
                  if (obsInput) obsInput.value = `${prefix} | Troca de Serviço | ${swapInfo}`;
                } else if (selected.value === 'Outro') {
                  const otherText = document.getElementById('service-other-text')?.value?.trim();
                  if (obsInput) obsInput.value = otherText || '';
                } else {
                  if (obsInput) obsInput.value = selected.value;
                }
                updateStatusDots();
              };
              cancelBtn2.onclick = () => {
                modal2.classList.remove('show');
                inputRef.value = '';
                updateRowFields(row, null);
                updateStatusDots();
              };
            }
          } else {
            updateRowFields(row, null);
          }
          updateStatusDots();
        });
      });
      container.querySelectorAll('.plandir-entrance-input').forEach(input => {
        input.addEventListener('change', function() {
          const row = this.closest('tr');
          const obsInput = row.querySelectorAll('td input')[5];
          if (!obsInput || shift !== 'D' || !obsInput.value.startsWith('Profissional')) return;
          const val = this.value.trim();
          if (!val) return;
          const [h, m] = val.split(':').map(Number);
          const totalMinutes = h * 60 + m;
          obsInput.value = totalMinutes < (6 * 60 + 30) ? 'Profissional | Longo Curso' : 'Profissional';
        });
      });
      container.querySelectorAll('input:not([readonly]):not([disabled])').forEach(input => {
        input.addEventListener('keydown', function(e) {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const allInputs = Array.from(container.querySelectorAll('input:not([readonly]):not([disabled])'));
          const currentIndex = allInputs.indexOf(this);
          if (currentIndex !== -1 && currentIndex < allInputs.length - 1) allInputs[currentIndex + 1].focus();
        });
      });
      container.querySelectorAll('.plandir-nint-input').forEach(input => {
        input.addEventListener('dblclick', function() {
          const row = this.closest('tr');
          this.value = '';
          updateRowFields(row, null);
          updateStatusDots();
        });
      });
      createEmitButton(container);
    }
    function renderRow(r, patentMap) {
      const nIntFormatted = String(r.n_int || '').trim().padStart(3, '0');
      const patent = patentMap[nIntFormatted] || '';
      const isAlreadyFilled = Array.from(document.querySelectorAll('.plandir-nint-input'))
        .some(input => input.value.trim().padStart(3, '0') === nIntFormatted);
      return `
        <tr data-side-nint="${nIntFormatted}" class="${isAlreadyFilled ? 'row-highlight-green' : 'row-pending-red'}">
          <td style="text-align:center; padding: 5px 6px; width:75px;">${nIntFormatted}</td>
          <td style="padding: 5px 6px; width:150px;">${patent}</td>
          <td style="padding: 5px 6px; width:250px;">${r.abv_name || ''}</td>
        </tr>
      `;
    }
    document.querySelector('[data-page="page-plandir"]').addEventListener('click', () => {
      const container = document.getElementById('plandir_container');
      const rightCol = document.getElementById('plandir-right-col');
      const headerContainer = document.getElementById('plandir-header-container');
      if (container && container.innerHTML.trim() !== '') {
        container.innerHTML = '';
        if (headerContainer) headerContainer.innerHTML = '';
        if (rightCol) rightCol.style.display = 'none';
        document.querySelectorAll('.options-btn').forEach(btn => btn.classList.remove('active'));
      }
      blockShiftButtons();
    });
    document.querySelectorAll('input[name="popup-service-type"]').forEach(radio => {
      radio.addEventListener('change', function () {
        document.getElementById('service-swap-fields').style.display = this.value === 'Troca de Serviço' ? 'flex' : 'none';
        document.getElementById('service-other-fields').style.display = this.value === 'Outro' ? 'flex' : 'none';
      });
    });
    document.addEventListener('input', async function (e) {
      if (e.target.id !== 'service-swap-nint') return;
      const input = e.target;
      input.value = input.value.replace(/\D/g, '').slice(0, 3);
      const nameField = document.getElementById('service-swap-name');
      if (input.value.length === 3) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?n_int=eq.${input.value}`, {headers: getSupabaseHeaders()});
          const data = await res.json();
          nameField.value = data[0]?.abv_name || '';
        } catch (err) {
          console.error('Erro:', err);
          nameField.value = '';
        }
      } else {
        nameField.value = '';
      }
    });
    function blockShiftButtons() {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      const isDay = totalMinutes >= 8 * 60 && totalMinutes < 20 * 60;
      const btnD = document.querySelector('.options-btn[data-shift="D"]');
      const btnN = document.querySelector('.options-btn[data-shift="N"]');
      btnD.disabled = false; btnD.style.opacity = '1'; btnD.style.cursor = 'pointer'; btnD.title = '';
      btnN.disabled = false; btnN.style.opacity = '1'; btnN.style.cursor = 'pointer'; btnN.title = '';
      if (isDay) {
        btnN.disabled = true; btnN.style.opacity = '0.4'; btnN.style.cursor = 'not-allowed'; btnN.title = 'Turno N disponível após as 20:00';
      } else {
        btnD.disabled = true; btnD.style.opacity = '0.4'; btnD.style.cursor = 'not-allowed'; btnD.title = 'Turno D disponível após as 08:00';
      }
    }
    blockShiftButtons();    
    async function saveDraft(shift) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr || !shift || shift === 'LAST') return;
      const tables = collectTableData();
      const teamNameMap = {"OFOPE": "ofope", "CHEFE DE SERVIÇO": "chefe_servico", "OPTEL": "optel", "EQUIPA 01": "equipa_01", "EQUIPA 02": "equipa_02", "LOGÍSTICA": "logistica",
                           "INEM": "inem", "INEM - Reserva": "inem_reserva", "SERVIÇO GERAL": "servico_geral"};
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/fomio_draft?corp_oper_nr=eq.${corpOperNr}&shift=eq.${shift}`, {
          method: "DELETE", 
          headers: getSupabaseHeaders()
        });
        for (let table of tables) {
          const team_name = teamNameMap[table.title];
          if (!team_name) continue;
          const nonEmptyRows = table.rows.filter(r => r.n_int || r.patente || r.nome || r.entrada || r.saida || r.MP || r.TAS || r.obs);
          if (nonEmptyRows.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/fomio_draft`, {
              method: "POST",
              headers: getSupabaseHeaders(),
              body: JSON.stringify(nonEmptyRows.map(r => ({team_name, shift, n_int: r.n_int || '', patente: r.patente || '', abv_name: r.nome || '', h_entrance: r.entrada || '', 
                                                           h_exit: r.saida || '', MP: !!r.MP, TAS: !!r.TAS, observ: r.obs || '', corp_oper_nr: corpOperNr})))
            });
          }
        }
      } catch (err) {
        console.error('❌ Erro ao guardar draft:', err);
      }
    }
    async function loadDraft(shift, corpOperNr) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/fomio_draft?corp_oper_nr=eq.${corpOperNr}&shift=eq.${shift}&select=*`, {
          headers: getSupabaseHeaders()
        });
        const members = await res.json();
        return members && members.length > 0 ? members : null;
      } catch (err) {
        console.error('❌ Erro ao carregar draft:', err);
        return null;
      }
    }
    /* =======================================
    /* =======================================
    INOP CREPC
    ======================================= */
    async function _getCREPCEmailCommonData(corpOperNr) {
      let logoUrl = "", corpAddress = "", corpCp = "", corpLocalitie = "", corpPhoneMobile = "", corpPhoneLandline = "", corpEmail = "";
      try {
        const corpRes = await fetch(
          `${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corpOperNr}&select=logo_url,corp_address,corp_cp,corp_localitie,corp_phone_mobile,corp_phone_landline,corp_email`, {
            headers: getSupabaseHeaders()
          }
        );
        const corpData = await corpRes.json();
        if (corpData.length) {logoUrl = corpData[0].logo_url || ""; corpAddress = corpData[0].corp_address || ""; corpCp = corpData[0].corp_cp || ""; corpLocalitie = corpData[0].corp_localitie || "";
                              corpPhoneMobile = corpData[0].corp_phone_mobile || ""; corpPhoneLandline = corpData[0].corp_phone_landline || ""; corpEmail = corpData[0].corp_email || "";
                             }
      } catch (err) {
        console.error("Erro ao carregar logo:", err);
      }
      return {logoUrl, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail};
    }
    function preselectCorpInSitopCB() {
      const current = sessionStorage.getItem("currentCorpOperNr");
      if (!current) {
        return;
      }
      const select = document.getElementById("sitop_cb");
      if (!select) {
        return;
      }
      const clean = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      for (const option of select.options) {
        const optionText = clean(option.textContent);
        if (optionText.startsWith(clean(current))) {
          option.selected = true;
          return;
        }
      }
    }
    /* =============== ELEMENT VARIABLES =============== */
    const NewInopBtn = document.getElementById("NewInopBtn");
    const oldInopBtn = document.querySelector(".oldinop");
    const backBtn = document.getElementById("backBtn");
    const backFromTableBtn = document.getElementById("backFromTableBtn");
    const saveBtn = document.getElementById("saveBtn");
    const actionButtons = document.getElementById("inop-action-buttons");
    const sitopContainer = document.getElementById("sitop_container");
    const inopsTableContainer = document.getElementById("inopsTableContainer");
    const inopsTableBody = document.querySelector("#inopsTable tbody");
    const sitopCbSelect = document.getElementById("sitop_cb");
    const sitopVeicSelect = document.getElementById("sitop_veíc");
    const sitopVeicRegInput = document.getElementById("sitop_veíc_registration");
    const sitopGdhInopInput = document.getElementById("sitop_gdh_inop");
    const sitopVeicDateInput = document.getElementById("sitop_veíc_date");
    const sitopVeicHourInput = document.getElementById("sitop_veíc_hour");
    const yesCheckbox = document.getElementById("ppi_yes");
    const noCheckbox = document.getElementById("ppi_no");
    const subsYesCheckbox = document.getElementById("ppi_subs_yes");
    const subsNoCheckbox = document.getElementById("ppi_subs_no");
    /* =========== UTILITY FUNCTIONS AND UI ============ */
    function formatSITOPGDH(date = new Date()) {
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
      const month = monthNames[date.getMonth()];
      const year = String(date.getFullYear()).slice(-2);
      return `${day}${hour}${minutes}${month}${year}`;
    }
    function buildDateFromInputs(dateStr, timeStr) {
      if (!dateStr || !timeStr) return null;
      const [y, m, d] = dateStr.split("-").map(Number);
      const [hh, mm] = timeStr.split(":").map(Number);
      return new Date(y, m - 1, d, hh, mm);
    }
    function updateSitopGdhInop() {
      const dt = buildDateFromInputs(sitopVeicDateInput.value, sitopVeicHourInput.value);
      sitopGdhInopInput.value = dt ? formatSITOPGDH(dt) : "";
    }
    function clearSitopForm() {
      document.querySelectorAll("#sitop_container input, #sitop_container textarea").forEach(el => el.value = "");
      document.querySelectorAll('#sitop_container input[type="checkbox"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('#sitop_container select').forEach(sel => sel.selectedIndex = 0);
      sitopContainer.removeAttribute("data-record-id");
      saveBtn.textContent = "Emitir Inoperacionalidade";
      saveBtn.classList.remove("btn-success");
      saveBtn.classList.add("btn-danger");
      saveBtn.style.width = "";
    }
    function toggleSitopContainer(forceClose = false) {
      const isVisible = sitopContainer.style.display === "block";
      sitopContainer.style.transition = "opacity 0.25s ease";
      if (isVisible || forceClose) {
        sitopContainer.style.opacity = "0";
        setTimeout(() => {
          sitopContainer.style.display = "none";
          clearSitopForm();
        }, 250);
      } else {
        inopsTableContainer.style.display = "none";
        sitopContainer.style.display = "block";
        sitopContainer.style.opacity = "0";
        setTimeout(() => sitopContainer.style.opacity = "1", 10);
        clearSitopForm();
      }
    }
    function handleValidateOperationality(event) {
      preselectCorpInSitopCB();
      const btn = event.currentTarget;
      const recordAttr = btn.getAttribute("data-record");
      if (!recordAttr) {
        console.error("Erro: Atributo data-record não encontrado.");
        return;
      }
      const record = JSON.parse(recordAttr);
      inopsTableContainer.style.display = "none";
      if (oldInopBtn) oldInopBtn.classList.remove("active");
      sitopContainer.style.display = "block";
      sitopContainer.style.opacity = "0";
      setTimeout(() => sitopContainer.style.opacity = "1", 10);
      const header = sitopContainer.querySelector(".major-card-header") || sitopContainer.querySelector(".major-card-header");
      if (header) header.textContent = "COMUNICAR OPERACIONALIDADE";
      document.getElementById("sitop_veíc").value = record.vehicle || "";
      document.getElementById("sitop_veíc_registration").value = record.registration || "";
      document.getElementById("sitop_gdh_inop").value = record.gdh_inop || "";
      const nowValidate = new Date();
      sitopVeicDateInput.value = nowValidate.toLocaleDateString('sv-SE');
      sitopVeicHourInput.value = String(nowValidate.getHours()).padStart(2,"0") + ":" + String(nowValidate.getMinutes()).padStart(2,"0");
      document.getElementById("sitop_gdh_op").value = formatSITOPGDH(nowValidate);
      document.getElementById("sitop_type_failure").value = record.failure_type || "";
      document.getElementById("sitop_failure_description").value = record.failure_description || "";
      document.getElementById("sitop_failure_noc").value = record.failure_noc || "";
      document.getElementById("sitop_optel").value = record.optel || "";
      document.getElementById("ppi_yes").checked = record.ppi_part === true;
      document.getElementById("ppi_no").checked = record.ppi_part === false;
      document.getElementById("ppi_a2").checked = record.ppi_a2 === true;
      document.getElementById("ppi_a22").checked = record.ppi_a22 === true;
      document.getElementById("ppi_airport").checked = record.ppi_airport === true;
      document.getElementById("ppi_linfer").checked = record.ppi_linfer === true;
      document.getElementById("ppi_airfield").checked = record.ppi_airfield === true;
      document.getElementById("ppi_subs_yes").checked = record.ppi_subs === true;
      document.getElementById("ppi_subs_no").checked = record.ppi_subs === false;
      if (NewInopBtn) NewInopBtn.classList.add("active");
      sitopContainer.setAttribute("data-record-id", record.id);
      saveBtn.textContent = "Emitir Operacionalidade";
      saveBtn.classList.remove("btn-danger");
      saveBtn.classList.add("btn-success");
      saveBtn.style.width = "";
    }
    async function fetchCREPCSitopRecipientsFromSupabase(corpOperNr) {
      const categories = ['crepcsitop_mail_to', 'crepcsitop_mail_cc', 'crepcsitop_mail_bcc'];
      const url = `${SUPABASE_URL}/rest/v1/mails_config` + `?category=in.(${categories.join(',')})` + `&corp_oper_nr=eq.${corpOperNr}` + `&select=category,value`;
      try {
        const response = await fetch(url, { headers: getSupabaseHeaders() });
        if (!response.ok) throw new Error("Falha ao conectar ao Supabase.");
        const data = await response.json();
        const recipients = { to: [], cc: [], bcc: [] };
        data.forEach(row => {
          const emails = row.value?.split(",")
          .map(e => e.trim())
          .filter(e => e) || [];
          if (row.category.endsWith("_to")) recipients.to = emails;
          if (row.category.endsWith("_cc")) recipients.cc = emails;
          if (row.category.endsWith("_bcc")) recipients.bcc = emails;
        });
        if (recipients.to.length === 0) recipients.to = [""];
        return recipients;
      } catch (err) {
        console.error("Erro ao buscar e-mails:", err);
        throw new Error("Não foi possível obter os destinatários (Centro de Dados → Emails Config.).");
      }
    }
    /* ================= EMISSION LOGIC ================ */
    async function emitSitop() {
      const cb_type = document.getElementById("sitop_cb").value.trim();
      const vehicle = document.getElementById("sitop_veíc").value.trim();
      const registration = document.getElementById("sitop_veíc_registration").value.trim();
      const gdh_inop = document.getElementById("sitop_gdh_inop").value.trim();
      const gdh_op = document.getElementById("sitop_gdh_op").value.trim() || null;
      const failure_type = document.getElementById("sitop_type_failure").value.trim();
      const failure_description = document.getElementById("sitop_failure_description").value.trim();
      const failure_noc = document.getElementById("sitop_failure_noc").value.trim();
      const ppi_part = document.getElementById("ppi_yes").checked;
      const ppi_a2 = document.getElementById("ppi_a2").checked;
      const ppi_a22 = document.getElementById("ppi_a22").checked;
      const ppi_airport = document.getElementById("ppi_airport").checked;
      const ppi_linfer = document.getElementById("ppi_linfer").checked;
      const ppi_airfield = document.getElementById("ppi_airfield").checked;
      const ppi_subs = document.getElementById("ppi_subs_yes").checked;
      const optel = document.getElementById("sitop_optel").value.trim();
      if (!vehicle || !registration || !gdh_inop) {
        showPopup('popup-danger', "Por favor preencha os campos obrigatórios: Veículo, Matrícula e GDH INOP.");
        return;
      }
      showPopup('popup-success', `Estado Operacional do veículo ${vehicle} criado com sucesso. Por favor aguarde uns segundos, receberá uma nova notificação após o envio para as entidades estar concluído!`);
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      if (!corpOperNr) {
        showPopup('popup-danger', "Erro: O número da corporação não foi encontrado. Por favor, faça login novamente.");
        return;
      }
      saveBtn.disabled = true;
      const recordId = sitopContainer.getAttribute("data-record-id");
      const isUpdate = !!recordId;
      const isOperational = !!gdh_op;
      const {logoUrl, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail} = await _getCREPCEmailCommonData(corpOperNr);
      const data = {cb_type, vehicle, registration, gdh_inop, gdh_op, failure_type, failure_description, failure_noc, ppi_part, ppi_a2, ppi_a22, ppi_airport, ppi_linfer, ppi_airfield, ppi_subs, optel,
                    corp_oper_nr: corpOperNr, logoUrl, corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail};
      const supabaseData = {...data};
      delete supabaseData.cb_type;
      delete supabaseData.logoUrl;
      delete supabaseData.corpAddress;
      delete supabaseData.corpCp;
      delete supabaseData.corpLocalitie;
      delete supabaseData.corpPhoneMobile;
      delete supabaseData.corpPhoneLandline;
      delete supabaseData.corpEmail;
      let insertedId = null;
      try {
        if (!isUpdate && !isOperational) {
          const checkUrl = `${SUPABASE_URL}/rest/v1/sitop_vehicles?select=vehicle&vehicle=eq.${encodeURIComponent(vehicle)}&gdh_op=is.null&corp_oper_nr=eq.${encodeURIComponent(corpOperNr)}`;
          const checkRes = await fetch(checkUrl, { headers: getSupabaseHeaders() });
          if (!checkRes.ok) throw new Error(`Erro ao verificar duplicado.`);
          const existing = await checkRes.json();
          if (existing.length > 0) {
            showPopup('popup-danger', `O veículo ${vehicle} já se encontra INOP!`);
            saveBtn.disabled = false;
            return;
          }
        }
        const supabaseUrl = isUpdate ? `${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${recordId}` : `${SUPABASE_URL}/rest/v1/sitop_vehicles`;
        const method = isUpdate ? "PATCH" : "POST";
        const response = await fetch(supabaseUrl, {
          method,
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=representation"},
          body: JSON.stringify(supabaseData)
        });
        if (!response.ok) throw new Error("Erro ao enviar dados ao Supabase.");
        const savedRows = await response.json();
        if (!isUpdate) insertedId = savedRows?.[0]?.id ?? null;
        const statusRes = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicle)}`, {
          method: "PATCH",
          headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
          body: JSON.stringify({ is_inop: !isOperational })
        });
        if (!statusRes.ok) console.warn("⚠️ Erro ao atualizar status do veículo.");
        const { to, cc, bcc } = await fetchCREPCSitopRecipientsFromSupabase(corpOperNr);
        const greeting = getGreeting();
        const commanderName = await getCommanderName(corpOperNr);
        const corpName = cb_type.includes(" - ") ? cb_type.split(" - ").slice(1).join(" - ") : cb_type;
        const article = corpName.includes("Companhia") ? "da" : "do";
        const emailBodyHTML = `${greeting}<br>
        Encarrega-me o Sr. Comandante ${commanderName} de remeter em anexo a Vossas Exª.s o Formulário de Situação Operacional do veículo <strong>${data.vehicle || ""}</strong> 
        ${article} ${corpName}.<br>
        Com os melhores cumprimentos,<br>
        OPTEL<br>${optel}<br>
        <span style="font-family: 'Arial'; font-size: 10px; color: gray;">
          Este email foi processado automaticamente por: CB360 Online
        </span>`;
        const emailRes = await fetch('https://cb360-online.vercel.app/api/crepc_convert_and_send', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({mode: "sitop", data, recipients: to, ccRecipients: cc, bccRecipients: bcc, emailSubject: `Situação Operacional do Veículo ${vehicle}_${corpOperNr}`, emailBody: emailBodyHTML})
        });
        if (!emailRes.ok) {
          let details = "";
          try {const errJson = await emailRes.json(); details = errJson.details || errJson.error || "";} catch (_) {}
          throw new Error(`EMAIL_FAILED::${details || "sem detalhes (provável timeout de 60s na Vercel)"}`);
        }
        showPopup('popup-success', `A situação operacional do veículo ${vehicle} foi enviada para as entidades.`);
        if (isOperational && isUpdate) {
          await fetch(`${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${recordId}`, {
            method: 'DELETE',
            headers: getSupabaseHeaders()
          });
        }
        toggleSitopContainer(true);
        NewInopBtn.classList.remove("active");
        if (oldInopBtn) oldInopBtn.classList.remove("active");
      } catch (err) {
        console.error(err);
        const isEmailFailure = err.message?.startsWith("EMAIL_FAILED::");
        if (isEmailFailure) {
          try {
            const targetId = isUpdate ? recordId : insertedId;
            if (targetId) {
              if (!isUpdate) {
                await fetch(`${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${targetId}`, {
                  method: "DELETE",
                  headers: getSupabaseHeaders()
                });
              } else if (isOperational) {
                await fetch(`${SUPABASE_URL}/rest/v1/sitop_vehicles?id=eq.${targetId}`, {
                  method: "PATCH",
                  headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
                  body: JSON.stringify({ gdh_op: null })
                });
              }
            }
            await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicle)}`, {
              method: "PATCH",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
              body: JSON.stringify({ is_inop: isOperational })
            });
          } catch (rollbackErr) {
            console.error("Falha ao reverter estado após erro de envio:", rollbackErr);
          }
          showPopup('popup-danger', `Não foi possível gerar ou enviar o documento (possível lentidão de um serviço externo). O registo foi revertido — por favor tente novamente dentro de alguns minutos.`);
        } else {
          showPopup('popup-danger', `Erro: ${err.message}`);
        }
      } finally {
        saveBtn.disabled = false;
      }
    }
    /* há quanto tempo (a partir do GDH "DDHHMMMESAA") */
    function sitopAgo(gdh) {
      const m = /^(\d{2})(\d{2})(\d{2})([A-Z]{3})(\d{2})$/.exec(String(gdh || '').trim().toUpperCase());
      const mon = m ? ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"].indexOf(m[4]) : -1;
      if (mon < 0) return null;
      const d = new Date(2000 + +m[5], mon, +m[1], +m[2], +m[3]);
      const min = Math.max(0, Math.floor((Date.now() - d) / 60000)), days = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60);
      return {txt: days ? `há ${days}d ${h}h` : `há ${h}h${String(min % 60).padStart(2, '0')}`, long: days >= 1};
    }
    /* resumo lateral do envio (só lê os campos) */
    function sitopSummary() {
      const v = id => (document.getElementById(id)?.value || '').trim(), c = id => !!document.getElementById(id)?.checked;
      const ppis = [['ppi_airport', 'Aeroporto'], ['ppi_a22', 'A22'], ['ppi_a2', 'A2'], ['ppi_linfer', 'Linha Férrea'], ['ppi_airfield', 'Aeródromo Portimão']].filter(([id]) => c(id)).map(([, t]) => t);
      const isOp = !!v('sitop_gdh_op');
      const lines = [isOp ? '✅ OPERACIONALIDADE' : '🚨 INOPERACIONALIDADE', v('sitop_cb').split(' - ')[0] + (v('sitop_veíc') ? ` · ${v('sitop_veíc')}` : '') + (v('sitop_veíc_registration') ? ` (${v('sitop_veíc_registration')})` : ''),
                     v('sitop_gdh_inop') ? `GDH INOP ${v('sitop_gdh_inop')}` : '', isOp ? `GDH OP ${v('sitop_gdh_op')}` : '',
                     [v('sitop_type_failure'), v('sitop_failure_description')].filter(Boolean).join(': '), v('sitop_failure_noc') ? `NOC ${v('sitop_failure_noc')}` : '',
                     c('ppi_yes') ? `PPI: ${ppis.join(', ') || 'sim'}` : c('ppi_no') ? 'PPI: não' : '', c('ppi_subs_yes') ? 'Substituição: sim' : c('ppi_subs_no') ? 'Substituição: não' : '',
                     v('sitop_optel') ? `OPTEL: ${v('sitop_optel')}` : ''].filter(Boolean);
      const el = document.getElementById('sitop-prev');
      if (el) el.textContent = lines.join('\n');
    }
    ['input', 'change'].forEach(ev => sitopContainer?.addEventListener(ev, () => setTimeout(sitopSummary, 0)));
    new MutationObserver(() => { if (sitopContainer.style.display === 'block') setTimeout(sitopSummary, 50); }).observe(sitopContainer, {attributes: true, attributeFilter: ['style']});
    /* ================ EVENT LISTENERS ================ */
    sitopVeicHourInput.addEventListener("change", updateSitopGdhInop);
    NewInopBtn.addEventListener("click", () => {
      preselectCorpInSitopCB();
      const isActive = NewInopBtn.classList.toggle("active");
      oldInopBtn.classList.remove("active");
      if (isActive) {
        toggleSitopContainer(false);
        inopsTableContainer.style.display = "none";
        document.querySelector("#sitop_container .major-card-header").textContent = "INSERÇÃO DE NOVA INOPERACIONALIDADE";
        preselectCorpInSitopCB();
        const now = new Date();
        sitopVeicDateInput.value = now.toLocaleDateString('sv-SE');
        sitopVeicHourInput.value = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
        updateSitopGdhInop();
      } else {
        toggleSitopContainer(true);
      }
    });
    saveBtn.addEventListener("click", async () => await emitSitop());
    if (oldInopBtn) {
      oldInopBtn.addEventListener("click", async () => {
        const isActive = oldInopBtn.classList.toggle("active");
        NewInopBtn.classList.remove("active");
        if (!isActive) {
          inopsTableContainer.style.display = "none";
          return;
        }
        sitopContainer.style.display = "none";
        inopsTableBody.innerHTML =
          "<tr><td colspan='7' style='text-align:center;'>A carregar...</td></tr>";
        try {
            const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/sitop_vehicles?select=*&gdh_op=is.null&corp_oper_nr=eq.${corpOperNr}`,
              { headers: getSupabaseHeaders() }
            );
          if (!res.ok) throw new Error("Erro ao buscar inoperacionalidades");
          const data = await res.json();
          inopsTableBody.innerHTML = "";
          if (data.length === 0) {
            inopsTableBody.innerHTML =
              `<tr><td colspan="7" style="text-align:center;">Não foram encontrados veículos inoperacionais.</td></tr>`;
          } else {
            data.forEach(item => {
              const tr = document.createElement("tr");
              const ago = sitopAgo(item.gdh_inop);
              tr.innerHTML = `
                <td><b>${item.vehicle || ''}</b>${item.registration ? ` <span style="color:#8a949e;">${item.registration}</span>` : ''}</td>
                <td>${item.gdh_inop || ''}</td>
                <td>${ago ? `<span class="slx-st ${ago.long ? 'slx-st-bad' : 'slx-st-warn'}">${ago.txt}</span>` : '—'}</td>
                <td>${item.failure_type ? `<span class="slx-st slx-st-type">${item.failure_type}</span>` : ''}</td>
                <td>${item.failure_description || ''}</td>
                <td>${item.optel || ''}</td>
                <td style="text-align:right;">
                  <button class="btn btn-success validate-btn" data-record='${JSON.stringify(item)}' style="height:30px; padding:5px 10px;">Validar Operacionalidade</button>
                </td>`;
              inopsTableBody.appendChild(tr);
            });
            document.querySelectorAll(".validate-btn").forEach(btn =>
              btn.addEventListener("click", handleValidateOperationality)
            );
          }
          inopsTableContainer.style.display = "block";
        } catch (err) {
          console.error(err);
          showPopup('popup-danger', "Erro ao carregar inoperacionalidades: " + err.message);
        }
      });
    }
    yesCheckbox.addEventListener("change", () => { if (yesCheckbox.checked) noCheckbox.checked = false; });
    noCheckbox.addEventListener("change", () => { if (noCheckbox.checked) yesCheckbox.checked = false; });
    subsYesCheckbox.addEventListener("change", () => { if (subsYesCheckbox.checked) subsNoCheckbox.checked = false; });
    subsNoCheckbox.addEventListener("change", () => { if (subsNoCheckbox.checked) subsYesCheckbox.checked = false; });
    sitopVeicSelect.addEventListener("change", async () => {
      const selectedVehicle = sitopVeicSelect.value;
      updateSitopGdhInop();
      if (!selectedVehicle) return sitopVeicRegInput.value = "";
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle_registration&vehicle=eq.${encodeURIComponent(selectedVehicle)}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar matrícula");
        const data = await res.json();
        sitopVeicRegInput.value = data[0]?.vehicle_registration || "";
      } catch (err) {
        console.error("Erro ao carregar matrícula:", err);
        sitopVeicRegInput.value = "";
      }
    });
    /* ================== RESTART PAGE ================= */
    document.querySelector('[data-page="page-inocrepc"]').addEventListener('click', () => {
      sitopContainer.style.display = 'none';
      inopsTableContainer.style.display = 'none';
    });
    /* =======================================
    VARIOUS MODULE
    ======================================= */
    /* ===== VARIOUS PDF MODAL =====*/
    const VARIOUS_MODAL_STYLES = `
      @keyframes variousFadeIn {from {opacity: 0;} to {opacity: 1;}}
      @keyframes variousSlideUp {from {opacity: 0; transform: translateY(28px) scale(0.96);} to {opacity: 1; transform: translateY(0) scale(1);}}
      @keyframes variousSpin {to {transform: rotate(360deg);}}
      #various-pdf-modal {animation: variousFadeIn .22s ease;}
      #various-pdf-modal .various-box {animation: variousSlideUp .28s cubic-bezier(.22,.68,0,1.2);}
      .various-spinner {width: 36px; height: 36px; border: 3px solid #f0e8e8; border-top-color: #2c3e50; border-radius: 50%; animation: variousSpin .75s linear infinite;}
      .various-btn {border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); width: 30px; height: 30px; border-radius: 7px; cursor: pointer;
                   font-size: 14px; display: inline-flex; align-items: center; justify-content: center; transition: background .15s, border-color .15s, transform .1s;}
      .various-btn:hover {background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.25); color: #fff;}
      .various-btn:active {transform: scale(.91);}
      .various-btn.various-close-btn {border-color: rgba(255,80,80,0.22);}
      .various-btn.various-close-btn:hover {background: rgba(180,0,0,0.4); border-color: rgba(255,80,80,0.5);}
      .various-print-btn {border: 1px solid rgba(255,255,255,0.2); background: #27ae60; color: white; padding: 6px 14px; border-radius: 7px; cursor: pointer; font-size: 12.5px; font-weight: 600;
                         font-family: 'Segoe UI', sans-serif; letter-spacing: .3px; display: inline-flex; align-items: center; gap: 6px; transition: all .15s;}
      .various-print-btn:hover {background: #2ecc71; border-color: rgba(255,255,255,0.38);}
      .various-print-btn:active {transform: scale(.96);}
      .various-header {background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 45%, #34495e 100%); padding: 11px 14px; display: flex; align-items: center; justify-content: space-between;
                      gap: 10px; flex-shrink: 0; border-bottom: 1px solid rgba(0,0,0,0.2); position: relative;}
      .various-header::before {content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%); pointer-events: none;}
      .various-footer {background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%); padding: 9px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
                      flex-shrink: 0; border-top: 1px solid rgba(0,0,0,0.15); position: relative;}
      .various-footer::before {content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%); pointer-events: none;}
      .various-sep {width: 1px; height: 28px; background: rgba(255,255,255,0.18); flex-shrink: 0;}
      .various-title-main {color: #fff; font-weight: 700; font-size: 13px; font-family: 'Segoe UI', sans-serif; letter-spacing: .1px;}
      .various-title-sub {color: rgba(255,255,255,0.5); font-size: 10.5px; font-family: 'Segoe UI', sans-serif; margin-top: 2px;}
      .various-badge {background: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.4); border-radius: 5px; padding: 2px 7px; font-size: 10px; font-weight: 700;
                     font-family: 'Segoe UI', sans-serif; color: #2ecc71; letter-spacing: .7px; text-transform: uppercase;}
      .various-footer-info {color: rgba(255,255,255,0.38); font-size: 10.5px; font-family: 'Segoe UI', sans-serif;}
    `;
    function _variousInjectStyles() {
      if (document.getElementById('various-modal-styles')) return;
      const style = document.createElement('style');
      style.id = 'various-modal-styles';
      style.textContent = VARIOUS_MODAL_STYLES;
      document.head.appendChild(style);
    }
    /* ===== HEMODIALYSIS INIT =====*/
    document.querySelector('.sidebar-sub-submenu-button[data-page="page-hemodialysis"]')?.addEventListener("click", () => {
      document.getElementById("hemo-week-cards").style.display = "none";
      document.getElementById("hemo-utentdata-card").style.display = "none";
      document.getElementById("hemo-utentlist-card").style.display = "none";
      document.getElementById("hemodialysis-options").style.display = "none";
      document.getElementById("HemoWeekList").classList.remove("active");
      document.getElementById("HemoWAdresses").classList.remove("active");
      document.getElementById("utent_h_name").value = "";
      document.getElementById("utent_h_nr").value = "";
      document.getElementById("utent_h_adress").value = "";
      document.getElementById("utent_h_localitie").value = "";
      document.getElementById("utent_h_contacts").value = "";
      document.getElementById("utent_h_treatment_local").value = "";
      document.getElementById("utent_h_treatment_position").value = "";
      document.getElementById("utent_h_treatment_sift").value = "";
      document.querySelectorAll("#utent_h_treatment_days_dropdown input:checked")
        .forEach(cb => cb.checked = false);
      document.getElementById("utent_h_treatment_days_btn").textContent = "Selecionar dias...";
      const saveBtn = document.getElementById("utent_h_save");
      if (saveBtn) {delete saveBtn.dataset.editId; saveBtn.innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";}
    });    
    /* ===== LOAD, EMIT HEMODIALYSIS LIST =====*/
    async function loadHemoWeekList() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/hemodialysis_list?corp_oper_nr=eq.${corpOperNr}&select=utent_name,utent_adress,utent_desteny,utent_shift,utent_shift_days`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar hemodiálises");
        const data = await response.json();
        ["hemo-sqx-0700", "hemo-sqx-1100", "hemo-sqx-1600", "hemo-tqs-0700", "hemo-tqs-1100", "hemo-tqs-1600"].forEach(id => {
          document.getElementById(id).innerHTML =
            `<tr><td colspan="3" style="text-align:center;padding:8px;font-size:12px;color:#999;">Sem registos</td></tr>`;
        });
        data.forEach(utent => {
          const days = (utent.utent_shift_days || "").toUpperCase();
          const shift = (utent.utent_shift || "").replace(/ /g, "");
          const prefix = days.includes("SQX") || days === "SQX" || ["SEG","QUA","SEX"].some(d => days.includes(d))
            ? "hemo-sqx"
            : days.includes("TQS") || days === "TQS" || ["TER","QUI","SAB"].some(d => days.includes(d))
            ? "hemo-tqs"
            : null;
          if (!prefix) return;
          let suffix = "";
          if (shift === "07:00-12:00") suffix = "0700";
          else if (shift === "11:00-17:00") suffix = "1100";
          else if (shift === "16:00-23:00") suffix = "1600";
          else return;
          const tbodyId = `${prefix}-${suffix}`;
          const tbody = document.getElementById(tbodyId);
          if (!tbody) return;
          if (tbody.querySelector("td[colspan]")) tbody.innerHTML = "";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="padding:5px;border:1px solid #ddd;font-size:13px;font-weight:bold;">${utent.utent_name || ""}</td>
            <td style="padding:5px;border:1px solid #ddd;font-size:13px;font-weight:bold;">${utent.utent_adress || ""}</td>
            <td style="padding:5px;border:1px solid #ddd;font-size:13px;font-weight:bold;">${utent.utent_desteny || ""}</td>
          `;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error("Erro ao carregar hemodiálises:", err);
      }
    }
    function openHemodialysisTypePopup() {
      const modal = document.getElementById("popup-hemodialysis-type-modal");
      if (!modal) return;
      document.querySelectorAll('input[name="popup-hemos-type"]').forEach(el => {
        el.checked = false;
      });
      modal.classList.add("show");
    }
    function closeHemodialysisTypePopup() {
      const modal = document.getElementById("popup-hemodialysis-type-modal");
      if (modal) modal.classList.remove("show");
    }
    document.getElementById("hemodialysis-emit")?.addEventListener("click", openHemodialysisTypePopup);
    document.getElementById("popup-hemos-type-cancel-btn")?.addEventListener("click", closeHemodialysisTypePopup);
    document.getElementById("popup-hemos-type-ok-btn")?.addEventListener("click", () => {
      const selected = document.querySelector('input[name="popup-hemos-type"]:checked');
      if (!selected) {
        showPopup('popup-danger', "Selecione uma opção.");
        return;
      }
      const typeValue = selected.value.toLowerCase();
      closeHemodialysisTypePopup();
      emitHemoWeekList(typeValue); 
    });
    async function emitHemoWeekList(type) {
      try {
        showLoadingPopup("A preparar listagem...");
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const fields = ["utent_name", "utent_adress", "utent_desteny", "utent_shift", "utent_shift_days", "utent_niss", "utent_localitie", "utent_contact", "utent_position"].join(",");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/hemodialysis_list?corp_oper_nr=eq.${corpOperNr}&select=${fields}&order=utent_shift_days.asc,utent_shift.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar dados do banco de dados.");
        const data = await response.json();
        updateLoadingPopup("A gerar Listagem de Hemodiálises...");
        const res = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({type: type, data: data})
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Erro na API: ${errorText}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        hideLoadingPopup();
        document.getElementById('various-pdf-modal')?.remove();
        _variousInjectStyles();
        const overlay = document.createElement('div');
        overlay.id = 'various-pdf-modal';
        Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'});
        const box = document.createElement('div');
        box.className = 'various-box';
        Object.assign(box.style, {background: '#f8f8f8', borderRadius: '14px', width: '82vw', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', overflow: 'hidden'});
        const header = document.createElement('div');
        header.className = 'various-header';
        header.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex:1;position:relative;z-index:1;">
            <div style="color:#fff;font-weight:700;font-size:13px;"><i class="fa-solid fa-clipboard-list"></i> Listagem de Diversos</div>
          </div>
          <div style="display:flex;gap:5px;position:relative;z-index:1;">
            <button class="various-btn" id="various-pdf-fullscreen" title="Ecrã inteiro"><i class="fa-solid fa-expand"></i></button>
            <button class="various-btn various-close-btn" id="various-pdf-close" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
        const content = document.createElement('div');
        Object.assign(content.style, {flex: '1', position: 'relative', overflow: 'hidden', background: '#fff'});
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {position: 'absolute', inset: '0', width: '100%', height: '100%', border: 'none'});
        iframe.src = url;
        content.appendChild(iframe);
        const footer = document.createElement('div');
        footer.className = 'various-footer';
        footer.innerHTML = `
          <div class="various-footer-info">Documento gerado com sucesso</div>
          <button class="various-print-btn" id="various-pdf-print"><i class="fa-solid fa-print"></i> Imprimir</button>
        `;
        box.append(header, content, footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        let isFs = false;
        document.getElementById("various-pdf-fullscreen").onclick = () => {
          isFs = !isFs;
          Object.assign(box.style, {width: isFs ? '100vw' : '82vw', height: isFs ? '100vh' : '90vh', borderRadius: isFs ? '0' : '14px'});
        };
        document.getElementById("various-pdf-close").onclick = () => {
          URL.revokeObjectURL(url);
          overlay.remove();
        };
        document.getElementById("various-pdf-print").onclick = () => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        };
        //overlay.addEventListener('click', e => {if (e.target === overlay) overlay.remove();});
      } catch (err) {
        hideLoadingPopup();
        console.error("Erro:", err);
        showPopup('popup-danger', err.message);
      }
    }
    /* ===== ADD, EDIT, REMOVE HEMODIALYSIS UTENT ===== */
    async function loadHemoUtentList() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/hemodialysis_list?
          corp_oper_nr=eq.${corpOperNr}&select=id,utent_name,utent_adress,utent_localitie,utent_contact,utent_niss,utent_desteny,utent_shift_days,utent_shift,utent_position,utent_days_selected&order=utent_name.asc`, {headers: getSupabaseHeaders()}
        );
        if (!response.ok) throw new Error("Erro ao carregar utentes");
        const data = await response.json();
        const tbody = document.getElementById("hemo-utentlist-tbody");
        if (!data.length) {
          tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:8px;font-size:12px;color:#999;">Sem registos</td></tr>`;
          return;
        }
        tbody.innerHTML = "";
        data.forEach(utent => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;font-weight:bold;">${utent.utent_name || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;">${utent.utent_adress || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;">${utent.utent_localitie || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;">${utent.utent_contact || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;">${utent.utent_niss || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;">${utent.utent_desteny || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;">${utent.utent_days_selected || utent.utent_shift_days || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;">${utent.utent_shift || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;">${utent.utent_position || ""}</td>
            <td style="padding:5px;border:1px solid #ccc;text-align:center;">
              <button onclick="editHemoUtent(${utent.id})" style="background:#1e3a8a;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;margin-right:3px;"><i class="fa-solid fa-pen"></i></button>
              <button onclick="deleteHemoUtent(${utent.id})" style="background:#dc2626;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error("Erro ao carregar utentes:", err);
      }
    }
    function toggleDaysDropdown() {
      const dropdown = document.getElementById("utent_h_treatment_days_dropdown");
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    }
    document.addEventListener("click", function(e) {
      const btn = document.getElementById("utent_h_treatment_days_btn");
      const dropdown = document.getElementById("utent_h_treatment_days_dropdown");
      if (!btn?.contains(e.target) && !dropdown?.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
    document.querySelectorAll("#utent_h_treatment_days_dropdown input[type='checkbox']").forEach(cb => {
      cb.addEventListener("change", () => {
        const selected = Array.from(document.querySelectorAll("#utent_h_treatment_days_dropdown input:checked")).map(c => c.value);
        document.getElementById("utent_h_treatment_days_btn").textContent = selected.length > 0 ? selected.join(", ") : "Selecionar dias...";
      });
    });
    async function editHemoUtent(id) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/hemodialysis_list?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}&select=*`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar utente");
        const data = await response.json();
        if (!data.length) return;
        const utent = data[0];
        document.getElementById("utent_h_name").value = utent.utent_name || "";
        document.getElementById("utent_h_nr").value = utent.utent_niss || "";
        document.getElementById("utent_h_adress").value = utent.utent_adress || "";
        document.getElementById("utent_h_localitie").value = utent.utent_localitie || "";
        document.getElementById("utent_h_contacts").value = utent.utent_contact || "";
        document.getElementById("utent_h_treatment_local").value = utent.utent_desteny || "";
        document.getElementById("utent_h_treatment_position").value = utent.utent_position || "";
        document.getElementById("utent_h_treatment_sift").value = utent.utent_shift || "";
        const selectedDays = (utent.utent_days_selected || "").split("/");
        document.querySelectorAll("#utent_h_treatment_days_dropdown input[type='checkbox']").forEach(cb => {
          cb.checked = selectedDays.includes(cb.value);
        });
        const checkedDays = selectedDays.filter(d => d).join(", ");
        document.getElementById("utent_h_treatment_days_btn").textContent = checkedDays || "Selecionar dias...";
        document.getElementById("utent_h_save").dataset.editId = id;
        document.getElementById("utent_h_save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> ATUALIZAR";
        document.getElementById("hemo-utentdata-card").scrollIntoView({behavior: "smooth"});
      } catch (err) {
        console.error("Erro ao editar utente:", err);
        showPopup('popup-danger', "Erro ao carregar dados: " + err.message);
      }
    }
    async function deleteHemoUtent(id) {
      if (!confirm("Tem a certeza que pretende eliminar este utente?")) return;
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/hemodialysis_list?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}`, {
            method: "DELETE", 
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao eliminar utente");
        showPopup('popup-success', "Utente eliminado com sucesso!");
        loadHemoUtentList();
      } catch (err) {
        console.error("Erro ao eliminar utente:", err);
        showPopup('popup-danger', "Erro ao eliminar: " + err.message);
      }
    }
    async function saveHemoUtent() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const name = document.getElementById("utent_h_name").value.trim();
      const nr = document.getElementById("utent_h_nr").value.trim();
      const adress = document.getElementById("utent_h_adress").value.trim();
      const localitie = document.getElementById("utent_h_localitie").value.trim();
      const contact = document.getElementById("utent_h_contacts").value.trim();
      const desteny = document.getElementById("utent_h_treatment_local").value.trim();
      const position = document.getElementById("utent_h_treatment_position").value.trim();
      const shift = document.getElementById("utent_h_treatment_sift").value.trim();
      const selectedDays = Array.from(
        document.querySelectorAll("#utent_h_treatment_days_dropdown input:checked")
      ).map(c => c.value);
      const SQX_DAYS = ["SEG", "QUA", "SEX"];
      const TQS_DAYS = ["TER", "QUI", "SAB"];
      const hasSQX = selectedDays.some(d => SQX_DAYS.includes(d));
      const hasTQS = selectedDays.some(d => TQS_DAYS.includes(d));
      let shiftDays = "";
      if (hasSQX && !hasTQS) shiftDays = "SQX";
      else if (hasTQS && !hasSQX) shiftDays = "TQS";
      else shiftDays = selectedDays.join("/");
      if (!name) {
        showPopup('popup-danger', "Nome do utente é obrigatório.");
        return;
      }
      if (!desteny) {
        showPopup('popup-danger', "Local de tratamento é obrigatório.");
        return;
      }
      if (!selectedDays.length) {
        showPopup('popup-danger', "Selecione pelo menos um dia de tratamento.");
        return;
      }
      if (!shift) {
        showPopup('popup-danger', "Selecione o turno de tratamento.");
        return;
      }
      const saveBtn = document.getElementById("utent_h_save");
      const editId = saveBtn.dataset.editId;
      if (saveBtn) {saveBtn.disabled = true; saveBtn.textContent = "A guardar...";}
      const payload = {utent_name: name, utent_niss: nr, utent_adress: adress, utent_localitie: localitie, utent_contact: contact, utent_desteny: desteny, 
                       utent_position: position, utent_shift_days: shiftDays, utent_shift: shift, utent_days_selected: selectedDays.join("/")};
      try {
        let response;
        if (editId) {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/hemodialysis_list?id=eq.${editId}&corp_oper_nr=eq.${corpOperNr}`, {
              method: "PATCH", 
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify(payload)}
          );
          if (!response.ok) throw new Error("Erro ao atualizar utente: " + await response.text());
          showPopup('popup-success', "Utente atualizado com sucesso!");
          delete saveBtn.dataset.editId;
        } else {
          response = await fetch(`${SUPABASE_URL}/rest/v1/hemodialysis_list`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
            body: JSON.stringify({...payload, corp_oper_nr: corpOperNr})
          });
          if (!response.ok) throw new Error("Erro ao guardar utente: " + await response.text());
          showPopup('popup-success', "Utente guardado com sucesso!");
        }
        document.getElementById("utent_h_name").value = "";
        document.getElementById("utent_h_nr").value = "";
        document.getElementById("utent_h_adress").value = "";
        document.getElementById("utent_h_localitie").value = "";
        document.getElementById("utent_h_contacts").value = "";
        document.getElementById("utent_h_treatment_local").value = "";
        document.getElementById("utent_h_treatment_position").value = "";
        document.getElementById("utent_h_treatment_sift").value = "";
        document.querySelectorAll("#utent_h_treatment_days_dropdown input:checked")
          .forEach(cb => cb.checked = false);
        document.getElementById("utent_h_treatment_days_btn").textContent = "Selecionar dias...";
        loadHemoUtentList();
      } catch (err) {
        console.error("Erro ao guardar utente:", err);
        showPopup('popup-danger', "Erro ao guardar: " + err.message);
      } finally {
        if (saveBtn) {saveBtn.disabled = false; saveBtn.innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";}
      }
    }
    /* ===== DOM HEMODIALYSIS ===== */
    document.getElementById("utent_h_save").addEventListener("click", saveHemoUtent);
    document.getElementById("HemoWeekList").addEventListener("click", function() {
      const cards = document.getElementById("hemo-week-cards");
      const utentData = document.getElementById("hemo-utentdata-card");
      const utentList = document.getElementById("hemo-utentlist-card");
      const options = document.getElementById("hemodialysis-options");
      const isVisible = cards.style.display !== "none";
      cards.style.display = isVisible ? "none" : "block";
      utentData.style.display = "none";
      utentList.style.display = "none";
      options.style.display = isVisible ? "none" : "flex";
      this.classList.toggle("active", !isVisible);
      document.getElementById("HemoWAdresses").classList.remove("active");
      if (!isVisible) loadHemoWeekList();
    });
    document.getElementById("HemoWAdresses").addEventListener("click", function() {
      const utentData = document.getElementById("hemo-utentdata-card");
      const utentList = document.getElementById("hemo-utentlist-card");
      const cards = document.getElementById("hemo-week-cards");
      const options = document.getElementById("hemodialysis-options");
      const isVisible = utentData.style.display !== "none";
      utentData.style.display = isVisible ? "none" : "block";
      utentList.style.display = isVisible ? "none" : "block";
      cards.style.display = "none";
      options.style.display = "none";
      this.classList.toggle("active", !isVisible);
      document.getElementById("HemoWeekList").classList.remove("active");
      if (!isVisible) loadHemoUtentList();
    });
    /* ===== FORMATION FORM ===== */
    document.querySelectorAll('.sidebar-sub-submenu-button[data-access="Diversos"]').forEach(btn => {
      if (btn.textContent.trim() === "Formulário Formação") {
        btn.removeAttribute("onclick");
        btn.addEventListener("click", async () => {
          try {
            showLoadingPopup("A preparar Formulário de Formação...");
            const res = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({type: "formacao"})
            });
            if (!res.ok) throw new Error(await res.text());
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            hideLoadingPopup();
            document.getElementById('various-pdf-modal')?.remove();
            _variousInjectStyles();
            const overlay = document.createElement('div');
            overlay.id = 'various-pdf-modal';
            Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'});
            const box = document.createElement('div');
            box.className = 'various-box';
            Object.assign(box.style, {background: '#f8f8f8', borderRadius: '14px', width: '82vw', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', overflow: 'hidden'});
            const header = document.createElement('div');
            header.className = 'various-header';
            header.innerHTML = `
              <div style="display:flex;align-items:center;gap:10px;flex:1;position:relative;z-index:1;">
                <div style="color:#fff;font-weight:700;font-size:13px;"><i class="fa-solid fa-clipboard-list"></i> Formulário de Formação</div>
              </div>
              <div style="display:flex;gap:5px;position:relative;z-index:1;">
                <button class="various-btn" id="various-pdf-fullscreen" title="Ecrã inteiro"><i class="fa-solid fa-expand"></i></button>
                <button class="various-btn various-close-btn" id="various-pdf-close" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
              </div>
            `;
            const content = document.createElement('div');
            Object.assign(content.style, {flex: '1', position: 'relative', overflow: 'hidden', background: '#fff'});
            const iframe = document.createElement('iframe');
            Object.assign(iframe.style, {position: 'absolute', inset: '0', width: '100%', height: '100%', border: 'none'});
            iframe.src = url;
            content.appendChild(iframe);
            const footer = document.createElement('div');
            footer.className = 'various-footer';
            footer.innerHTML = `
              <div class="various-footer-info">Documento gerado com sucesso</div>
              <button class="various-print-btn" id="various-pdf-print"><i class="fa-solid fa-print"></i> Imprimir</button>
            `;
            box.append(header, content, footer);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            let isFs = false;
            document.getElementById("various-pdf-fullscreen").onclick = () => {
              isFs = !isFs;
              Object.assign(box.style, {width: isFs ? '100vw' : '82vw', height: isFs ? '100vh' : '90vh', borderRadius: isFs ? '0' : '14px'});
            };
            document.getElementById("various-pdf-close").onclick = () => {
              URL.revokeObjectURL(url);
              overlay.remove();
            };
            document.getElementById("various-pdf-print").onclick = () => {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            };
            setTimeout(() => {
              //overlay.addEventListener('click', e => {if (e.target === overlay) overlay.remove();});
            }, 100);
          } catch (err) {
            hideLoadingPopup();
            showPopup('popup-danger', err.message);
          }
        });
      }
    });
    /* ===== EQUIPMENT REQUEST INIT ===== */
    document.querySelector('.sidebar-sub-submenu-button[data-page="page-material-request"]')?.addEventListener("click", () => {
      equipmentRequestEditId = null;
      document.getElementById("equipment-request-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
      ["requesting_name", "requesting_cc", "requesting_cc_secur", "requesting_contact", "requesting_equipment", "autoryzed_by", "optel", "return_status"]
        .forEach(id => document.getElementById(id).value = "");
      setTimeout(() => {
        ["delivery_date", "return_estimate", "return_date"]
          .forEach(id => document.getElementById(id).value = "");
      }, 50);
      loadEquipmentRequestTable();
      document.getElementById("equipment-request-emit").disabled = true;
      document.getElementById("equipment-request-emit").style.opacity = "0.4";
      document.getElementById("equipment-request-emit").style.cursor = "not-allowed";
      document.getElementById("equipment-request-emit").style.filter = "grayscale(60%)";
    });
    /* ===== LOAD EQUIPMENT REQUEST ===== */
    async function loadEquipmentRequestTable() {
      const tbody = document.getElementById("equipment-request-tbody");
      if (!tbody) return;
      tbody.style.opacity = "0.5";
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/equipment_request?corp_oper_nr=eq.${corpOperNr}&order=created_at.desc`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar requisições");
        const data = await response.json();
        tbody.style.opacity = "1";
        if (!data.length) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:8px;font-size:12px;color:#999;">Sem registos</td></tr>`;
          return;
        }
        const tdStyle = `padding:5px;border:1px solid #ccc;font-size:12px;text-align:center;`;
        tbody.innerHTML = "";
        data.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="${tdStyle} font-weight:bold;">${item.requesting_name || ""}</td>
            <td style="${tdStyle}">${item.requesting_cc || ""}</td>
            <td style="${tdStyle}">${item.requesting_contact || ""}</td>
            <td style="${tdStyle}">${item.requesting_equipment || ""}</td>
            <td style="${tdStyle}">${item.delivery_date || ""}</td>
            <td style="${tdStyle}">${item.preview_return_date || ""}</td>
            <td style="${tdStyle}">${item.autotized_by || ""}</td>
            <td style="${tdStyle}">${item.status || ""}</td>
            <td style="${tdStyle}">
              <button onclick="equipmentRequestEdit(${item.id})" style="background:#1e3a8a;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;margin-right:3px;"><i class="fa-solid fa-pen"></i></button>
              <button onclick="equipmentRequestDelete(${item.id})" style="background:#dc2626;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          `;
          tr.addEventListener("mouseover", () => tr.style.background = "#c8d8f5");
          tr.addEventListener("mouseout",  () => tr.style.background = "");
          tbody.appendChild(tr);
        });
      } catch (err) {
        tbody.style.opacity = "1";
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:8px;font-size:12px;color:red;">Erro ao carregar dados.</td></tr>`;
        console.error("Erro ao carregar requisições:", err);
      }
    }
    /* ===== EDIT EQUIPMENT REQUEST ===== */
    async function equipmentRequestEdit(id) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/equipment_request?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}&select=*`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar registo");
        const data = await response.json();
        if (!data.length) return;
        const item = data[0];
        const cc_parts = (item.requesting_cc || "").split("-");
        document.getElementById("requesting_name").value = item.requesting_name || "";
        document.getElementById("requesting_cc").value = cc_parts[0] || "";
        document.getElementById("requesting_cc_secur").value = cc_parts[1] || "";
        document.getElementById("requesting_contact").value = item.requesting_contact || "";
        document.getElementById("requesting_equipment").value = item.requesting_equipment || "";
        document.getElementById("delivery_date").value = item.delivery_date || "";
        document.getElementById("return_estimate").value = item.preview_return_date || "";
        document.getElementById("autoryzed_by").value = item.autotized_by || "";
        document.getElementById("optel").value = item.optel || "";
        document.getElementById("return_date").value = item.return_date || "";
        document.getElementById("return_status").value = item.status || "";
        equipmentRequestEditId = id;
        document.getElementById("equipment-request-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> ATUALIZAR";
        document.getElementById("requesting_name").focus();
      } catch (err) {
        console.error("Erro ao editar requisição:", err);
        showPopup("popup-danger", "Erro ao carregar dados: " + err.message);
      }
    }
    document.getElementById("return_date")?.addEventListener("change", () => {
      const returnDate = document.getElementById("return_date").value;
      document.getElementById("return_status").value = returnDate ? "Devolvido" : "Por Devolver";
    });
    /* ===== DELETE EQUIPMENT REQUEST ===== */
    async function equipmentRequestDelete(id) {
      if (!confirm("Tem a certeza que pretende eliminar esta requisição?")) return;
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/equipment_request?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao eliminar requisição");
        showPopup("popup-success", "Requisição eliminada com sucesso!");
        loadEquipmentRequestTable();
      } catch (err) {
        console.error("Erro ao eliminar requisição:", err);
        showPopup("popup-danger", "Erro ao eliminar: " + err.message);
      }
    }
    /* ===== SAVE EQUIPMENT REQUEST ===== */
    let equipmentRequestEditId = null;
    async function equipmentRequestSave() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const requesting_name = document.getElementById("requesting_name").value.trim();
      const cc = document.getElementById("requesting_cc").value.trim();
      const cc_secur = document.getElementById("requesting_cc_secur").value.trim();
      const requesting_cc = cc_secur ? `${cc}-${cc_secur}` : cc;
      const requesting_contact = document.getElementById("requesting_contact").value.trim();
      const requesting_equipment = document.getElementById("requesting_equipment").value.trim();
      const delivery_date = document.getElementById("delivery_date").value || null;
      const preview_return_date = document.getElementById("return_estimate").value || null;
      const autotized_by = document.getElementById("autoryzed_by").value.trim();
      const optel = document.getElementById("optel").value.trim();
      const return_date = document.getElementById("return_date").value || null;
      const status = document.getElementById("return_status").value.trim() || (!return_date ? "Por Devolver" : "");
      if (!requesting_name) {showPopup("popup-danger", "O Nome do Requisitante é obrigatório.");return;}
      if (!requesting_cc) {showPopup("popup-danger", "O BI/CC/Passaporte é obrigatório.");return;}
      if (!requesting_contact) {showPopup("popup-danger", "O Contacto é obrigatório."); return;}
      if (!requesting_equipment) {showPopup("popup-danger", "Indique o(s) Equipamento(s) Requisitado(s)."); return;}
      if (!delivery_date) {showPopup("popup-danger", "A Data de Entrega é obrigatória."); return;}
      if (!preview_return_date) {showPopup("popup-danger", "A Previsão de Devolução é obrigatória."); return;}
      if (!autotized_by) {showPopup("popup-danger", "O campo Autorizado Por é obrigatório."); return;}
      if (!optel) {showPopup("popup-danger", "O campo OPTEL é obrigatório."); return;}
      const saveBtn = document.getElementById("equipment-request-save");
      saveBtn.disabled = true;
      saveBtn.innerHTML = "A guardar...";
      const payload = {requesting_name, requesting_cc, requesting_contact, requesting_equipment, delivery_date, preview_return_date, autotized_by, optel, return_date, status};
      try {
        let response;
        if (equipmentRequestEditId !== null) {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/equipment_request?id=eq.${equipmentRequestEditId}&corp_oper_nr=eq.${corpOperNr}`, {
              method: "PATCH",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify(payload)
            }
          );
          if (!response.ok) throw new Error("Erro ao atualizar: " + await response.text());
          showPopup("popup-success", "Requisição atualizada com sucesso!");
          document.getElementById("equipment-request-emit").disabled = false;
          document.getElementById("equipment-request-emit").style.opacity = "";
          document.getElementById("equipment-request-emit").style.cursor = "";
          document.getElementById("equipment-request-emit").style.filter = "";
          equipmentRequestEditId = null;
        } else {
          response = await fetch(`${SUPABASE_URL}/rest/v1/equipment_request`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
            body: JSON.stringify({...payload, corp_oper_nr: corpOperNr})
          });
          if (!response.ok) throw new Error("Erro ao guardar: " + await response.text());
          showPopup("popup-success", "Requisição gravada com sucesso!");
          document.getElementById("equipment-request-emit").disabled = false;
          document.getElementById("equipment-request-emit").style.opacity = "";
          document.getElementById("equipment-request-emit").style.cursor = "";
          document.getElementById("equipment-request-emit").style.filter = "";
        }
        loadEquipmentRequestTable();
      } catch (err) {
        console.error("Erro ao guardar requisição:", err);
        showPopup("popup-danger", "Erro ao guardar: " + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
      }
    }
    document.getElementById("equipment-request-save")?.addEventListener("click", equipmentRequestSave);
    /* ===== EMIT EQUIPMENT REQUEST ===== */
    document.getElementById("equipment-request-emit")?.addEventListener("click", async () => {
      const requesting_name = document.getElementById("requesting_name").value.trim();
      const cc = document.getElementById("requesting_cc").value.trim();
      const cc_secur = document.getElementById("requesting_cc_secur").value.trim();
      const requesting_cc = cc_secur ? `${cc}-${cc_secur}` : cc;
      const requesting_contact = document.getElementById("requesting_contact").value.trim();
      const requesting_equipment = document.getElementById("requesting_equipment").value.trim();
      const delivery_date = document.getElementById("delivery_date").value || "";
      const preview_return_date = document.getElementById("return_estimate").value || "";
      if (!requesting_name || !requesting_equipment) {
        showPopup("popup-danger", "Preencha pelo menos o Nome e o(s) Equipamento(s).");
        return;
      }
      try {
        showLoadingPopup("A preparar requisição...");
        const res = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            type: "equipment_request",
            data: {requesting_name, requesting_cc, requesting_contact, requesting_equipment, delivery_date, preview_return_date}
          })
        });
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        hideLoadingPopup();
        ["requesting_name", "requesting_cc", "requesting_cc_secur", "requesting_contact", "requesting_equipment", "delivery_date", "return_estimate", "autoryzed_by", "optel", "return_date", "return_status"]
          .forEach(id => document.getElementById(id).value = "");
        equipmentRequestEditId = null;
        document.getElementById("equipment-request-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
        document.getElementById("equipment-request-emit").disabled = true;
        document.getElementById("equipment-request-emit").style.opacity = "0.4";
        document.getElementById("equipment-request-emit").style.cursor = "not-allowed";
        document.getElementById("equipment-request-emit").style.filter = "grayscale(60%)";
        document.getElementById('various-pdf-modal')?.remove();
        _variousInjectStyles();
        const overlay = document.createElement('div');
        overlay.id = 'various-pdf-modal';
        Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'});
        const box = document.createElement('div');
        box.className = 'various-box';
        Object.assign(box.style, {background: '#f8f8f8', borderRadius: '14px', width: '82vw', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', overflow: 'hidden'});
        const header = document.createElement('div');
        header.className = 'various-header';
        header.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex:1;position:relative;z-index:1;">
            <div style="color:#fff;font-weight:700;font-size:13px;"><i class="fa-solid fa-clipboard-list"></i> Requisição de Equipamento</div>
          </div>
          <div style="display:flex;gap:5px;position:relative;z-index:1;">
            <button class="various-btn" id="various-pdf-fullscreen" title="Ecrã inteiro"><i class="fa-solid fa-expand"></i></button>
            <button class="various-btn various-close-btn" id="various-pdf-close" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
        const content = document.createElement('div');
        Object.assign(content.style, {flex: '1', position: 'relative', overflow: 'hidden', background: '#fff'});
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {position: 'absolute', inset: '0', width: '100%', height: '100%', border: 'none'});
        iframe.src = url;
        content.appendChild(iframe);
        const footer = document.createElement('div');
        footer.className = 'various-footer';
        footer.innerHTML = `
          <div class="various-footer-info">Documento gerado com sucesso</div>
            <button class="various-print-btn" id="various-pdf-print"><i class="fa-solid fa-print"></i> Imprimir</button>
          `;
        box.append(header, content, footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        let isFs = false;
        document.getElementById("various-pdf-fullscreen").onclick = () => {
          isFs = !isFs;
          Object.assign(box.style, {width: isFs ? '100vw' : '82vw', height: isFs ? '100vh' : '90vh', borderRadius: isFs ? '0' : '14px'});
        };
        document.getElementById("various-pdf-close").onclick = () => {URL.revokeObjectURL(url); overlay.remove();};
        document.getElementById("various-pdf-print").onclick = () => {iframe.contentWindow.focus(); iframe.contentWindow.print();};
        //overlay.addEventListener('click', e => {if (e.target === overlay) overlay.remove();});
      } catch (err) {
        hideLoadingPopup();
        console.error("Erro:", err);
        showPopup("popup-danger", err.message);
      }
    });
    /* ===== FLEET CARDS INIT ===== */
    document.querySelector('.sidebar-sub-submenu-button[data-page="page-fleet-cards"]')?.addEventListener("click", () => {
      fleetEditId = null;
      document.getElementById("card-fleet-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
      ["veíc_card_name", "veíc_card_register", "veíc_card_code", "veíc_card_contact"]
        .forEach(id => document.getElementById(id).value = "");
      loadFleetCardsTable();
    });
    /* ===== LOAD, ADD, EDIT, REMOVE FLEET CARDS ===== */
    let fleetEditId = null;
    async function loadFleetCardsTable() {
      const tbody = document.getElementById("fleet-cards-tbody");
      if (!tbody) return;
      tbody.style.opacity = "0.5";
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const [responseFleet, responseStatus] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/fleet_cards?corp_oper_nr=eq.${corpOperNr}&order=vehicle.asc`, {headers: getSupabaseHeaders()}),
          fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?corp_oper_nr=eq.${corpOperNr}`, {headers: getSupabaseHeaders()})
        ]);
        if (!responseFleet.ok) throw new Error("Erro ao carregar cartões frota");
        const data = await responseFleet.json();
        const statusData = responseStatus.ok ? await responseStatus.json() : [];
        tbody.style.opacity = "1";
        if (!data.length) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:8px;font-size:12px;color:#999;">Sem registos</td></tr>`;
          return;
        }
        const tdStyle = `padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;`;
        tbody.innerHTML = "";
        data.forEach(item => {
          const status = statusData.find(s => s.vehicle === item.vehicle);
          const isInop = status ? status.is_inop : false;
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="${tdStyle} font-weight:bold;">${item.vehicle || ""}</td>
            <td style="${tdStyle}">${item.registration || ""}</td>
            <td style="${tdStyle}">${item.card_code || ""}</td>
            <td style="${tdStyle}">${item.contact || ""}</td>
            <td style="${tdStyle} font-weight:bold; color:${isInop ? '#dc2626' : '#16a34a'};">
              ${isInop ? "Inoperacional" : "Operacional"}
            </td>
            <td style="${tdStyle}">
              <button onclick="fleetCardEdit(${item.id})" style="background:#1e3a8a;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;margin-right:3px;"><i class="fa-solid fa-pen"></i></button>
              <button onclick="fleetCardDelete(${item.id})" style="background:#dc2626;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          `;
          tr.addEventListener("mouseover", () => tr.style.background = "#c8d8f5");
          tr.addEventListener("mouseout",  () => tr.style.background = "");
          tbody.appendChild(tr);
        });
        document.getElementById("fleet-total").textContent = data.length;
        document.getElementById("fleet-operacional").textContent = data.filter(item => {
          const status = statusData.find(s => s.vehicle === item.vehicle);
          return !status || !status.is_inop;
        }).length;
        document.getElementById("fleet-inoperacional").textContent = data.filter(item => {
          const status = statusData.find(s => s.vehicle === item.vehicle);
          return status && status.is_inop;
        }).length;
      } catch (err) {
        tbody.style.opacity = "1";
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:8px;font-size:12px;color:red;">Erro ao carregar dados.</td></tr>`;
        console.error("Erro ao carregar cartões frota:", err);
      }
    }
    /* ===== FLEET CARDS EDIT ===== */
    async function fleetCardEdit(id) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/fleet_cards?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}&select=*`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar registo");
        const data = await response.json();
        if (!data.length) return;
        const item = data[0];
        document.getElementById("veíc_card_name").value = item.vehicle || "";
        document.getElementById("veíc_card_register").value = item.registration || "";
        document.getElementById("veíc_card_code").value = item.card_code || "";
        document.getElementById("veíc_card_contact").value = item.contact || "";
        fleetEditId = id;
        document.getElementById("card-fleet-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> ATUALIZAR";
        document.getElementById("veíc_card_name").focus();
      } catch (err) {
        console.error("Erro ao editar cartão frota:", err);
        showPopup("popup-danger", "Erro ao carregar dados: " + err.message);
      }
    }
    /* ===== FLEET CARDS DELETE ===== */
    async function fleetCardDelete(id) {
      if (!confirm("Tem a certeza que pretende eliminar este registo?")) return;
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/fleet_cards?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao eliminar registo");
        showPopup("popup-success", "Registo eliminado com sucesso!");
        loadFleetCardsTable();
      } catch (err) {
        console.error("Erro ao eliminar cartão frota:", err);
        showPopup("popup-danger", "Erro ao eliminar: " + err.message);
      }
    }
    /* ===== FLEET CARDS SAVE ===== */
    async function fleetCardSave() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const vehicle = document.getElementById("veíc_card_name").value.trim();
      const registration = document.getElementById("veíc_card_register").value.trim();
      const card_code = document.getElementById("veíc_card_code").value.trim();
      const contact = document.getElementById("veíc_card_contact").value.trim();
      if (!vehicle || !registration) {
        showPopup("popup-danger", "Preencha pelo menos o Veículo e a Matrícula.");
        return;
      }
      const saveBtn = document.getElementById("card-fleet-save");
      saveBtn.disabled = true;
      saveBtn.innerHTML = "A guardar...";
      const payload = {vehicle, registration, card_code, contact};
      try {
        let response;
        if (fleetEditId !== null) {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/fleet_cards?id=eq.${fleetEditId}&corp_oper_nr=eq.${corpOperNr}`, {
              method: "PATCH",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify(payload)
            }
          );
          if (!response.ok) throw new Error("Erro ao atualizar: " + await response.text());
          showPopup("popup-success", "Registo atualizado com sucesso!");
          fleetEditId = null;
        } else {
          response = await fetch(`${SUPABASE_URL}/rest/v1/fleet_cards`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
            body: JSON.stringify({...payload, corp_oper_nr: corpOperNr})
          });
          if (!response.ok) throw new Error("Erro ao guardar: " + await response.text());
          showPopup("popup-success", "Registo guardado com sucesso!");
        }
        ["veíc_card_name", "veíc_card_register", "veíc_card_code", "veíc_card_contact"]
          .forEach(id => document.getElementById(id).value = "");
        loadFleetCardsTable();
      } catch (err) {
        console.error("Erro ao guardar cartão frota:", err);
        showPopup("popup-danger", "Erro ao guardar: " + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
      }
    }
    document.getElementById("card-fleet-save")?.addEventListener("click", fleetCardSave);
    /* ===== FLEET CARDS EMIT ===== */
    document.getElementById("card-fleet-emit")?.addEventListener("click", async () => {
      try {
        showLoadingPopup("A preparar listagem...");
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/fleet_cards?corp_oper_nr=eq.${corpOperNr}&order=vehicle.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await response.json();
        updateLoadingPopup("A gerar Listagem Cartões Frota...");
        const res = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "fleet_cards", data })
        });
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        hideLoadingPopup();
        document.getElementById('various-pdf-modal')?.remove();
        _variousInjectStyles();
        const overlay = document.createElement('div');
        overlay.id = 'various-pdf-modal';
        Object.assign(overlay.style, { position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' });
        const box = document.createElement('div');
        box.className = 'various-box';
        Object.assign(box.style, { background: '#f8f8f8', borderRadius: '14px', width: '82vw', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', overflow: 'hidden' });
        const header = document.createElement('div');
        header.className = 'various-header';
        header.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex:1;position:relative;z-index:1;">
            <div style="color:#fff;font-weight:700;font-size:13px;"><i class="fa-solid fa-clipboard-list"></i> Cartões Frota</div>
          </div>
          <div style="display:flex;gap:5px;position:relative;z-index:1;">
            <button class="various-btn" id="various-pdf-fullscreen" title="Ecrã inteiro"><i class="fa-solid fa-expand"></i></button>
            <button class="various-btn various-close-btn" id="various-pdf-close" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
        const content = document.createElement('div');
        Object.assign(content.style, { flex: '1', position: 'relative', overflow: 'hidden', background: '#fff' });
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', border: 'none' });
        iframe.src = url;
        content.appendChild(iframe);
        const footer = document.createElement('div');
        footer.className = 'various-footer';
        footer.innerHTML = `
          <div class="various-footer-info">Documento gerado com sucesso</div>
          <button class="various-print-btn" id="various-pdf-print"><i class="fa-solid fa-print"></i> Imprimir</button>
        `;
        box.append(header, content, footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        let isFs = false;
        document.getElementById("various-pdf-fullscreen").onclick = () => {
          isFs = !isFs;
          Object.assign(box.style, { width: isFs ? '100vw' : '82vw', height: isFs ? '100vh' : '90vh', borderRadius: isFs ? '0' : '14px' });
        };
        document.getElementById("various-pdf-close").onclick = () => { URL.revokeObjectURL(url); overlay.remove(); };
        document.getElementById("various-pdf-print").onclick = () => { iframe.contentWindow.focus(); iframe.contentWindow.print(); };
        //overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
      } catch (err) {
        hideLoadingPopup();
        console.error("Erro:", err);
        showPopup('popup-danger', err.message);
      }
    });
    /* ===== CONTACT LIST INIT ===== */
    /* ===== COMMON DATA ===== */
    /* ===== Destinatários dos envios em massa (Centro de Dados → Emails Config. → bulk_mail_*) ===== */
    async function salocGetBulkRecipients() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const cats = ["bulk_mail_to", "bulk_mail_cc", "bulk_mail_bcc"];
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpOperNr}&category=in.(${cats.join(",")})&select=category,value`, {headers: getSupabaseHeaders()});
      if (!res.ok) throw new Error("Não foi possível obter os destinatários dos envios em massa.");
      const rows = await res.json();
      const list = (cat) => String(rows.find(r => r.category === cat)?.value || "").split(",").map(e => e.trim()).filter(Boolean);
      const out = {to: list("bulk_mail_to"), cc: list("bulk_mail_cc"), bcc: list("bulk_mail_bcc")};
      if (!out.to.length) throw new Error("Configure o destinatário dos envios em massa em Centro de Dados → Emails Config.");
      return out;
    }
    /* ===== Destinatários da Lista de Comparências (Centro de Dados → Emails Config. → attendance_mail_*) ===== */
    async function salocGetAttendanceRecipients() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const cats = ["attendance_mail_to", "attendance_mail_cc", "attendance_mail_bcc"];
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/mails_config?corp_oper_nr=eq.${corpOperNr}&category=in.(${cats.join(",")})&select=category,value`, {headers: getSupabaseHeaders()});
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        const list = (cat) => String(rows.find(r => r.category === cat)?.value || "").split(",").map(e => e.trim()).filter(Boolean);
        return {to: list(cats[0]), cc: list(cats[1]), bcc: list(cats[2])};
      } catch (err) {
        console.warn("Não foi possível obter os destinatários da Lista de Comparências:", err);
        return {to: [], cc: [], bcc: []};
      }
    }
    async function _getEmailCommonData() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const nInt = sessionStorage.getItem("currentNInt");
      let corpName = "";
      let logoUrl = "";
      let senderName = "Utilizador";
      try {
        const [corpRes, elemRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/corporation_data?corp_oper_nr=eq.${corpOperNr}&select=cb_name,logo_url`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=eq.${nInt}&select=abv_name,patent`, {
            headers: getSupabaseHeaders()})
        ]);
        const corpData = await corpRes.json();
        const elemData = await elemRes.json();
        if (corpData.length) {corpName = corpData[0].cb_name || corpName; logoUrl = corpData[0].logo_url || "";}
        if (elemData.length) {senderName = `${elemData[0].abv_name || "Utilizador"}<br>${elemData[0].patent || "CB360"}`;}
      } catch (err) {console.error("Erro ao carregar dados comuns:", err);}
      return {corpOperNr, corpName, logoUrl, senderName};
    }
    document.querySelector('.sidebar-sub-submenu-button[data-page="page-contact-list"]')?.addEventListener("click", () => {
      loadContactList();
    });
    document.getElementById("contact-list-search")?.addEventListener("input", function() {
      const filterText = this.value.toLowerCase().trim();
      const tbody = document.getElementById("contact-list-tbody");
      if (!tbody) return;
      const rows = tbody.querySelectorAll("tr");
      if (rows.length === 1 && rows[0].querySelector('td')?.getAttribute('colspan') === '8') return;
      rows.forEach(row => {
        if (row.classList.contains("quadro-header-row")) return;
        const nInt = row.children[0]?.textContent.toLowerCase() || "";
        const patent = row.children[1]?.textContent.toLowerCase() || "";
        const fullName = row.children[2]?.textContent.toLowerCase() || "";
        if (nInt.includes(filterText) || patent.includes(filterText) || fullName.includes(filterText)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
      const headers = tbody.querySelectorAll(".quadro-header-row");
      headers.forEach(header => {
        let next = header.nextElementSibling;
        let hasVisibleRows = false;
        while (next && !next.classList.contains("quadro-header-row")) {
          if (next.style.display !== "none") {
            hasVisibleRows = true;
            break;
          }
          next = next.nextElementSibling;
        }
        header.style.display = hasVisibleRows || filterText === "" ? "" : "none";
      });
    });
    async function loadContactList() {
      const tbody = document.getElementById("contact-list-tbody");
      if (!tbody) return;
      const searchInput = document.getElementById("contact-list-search");
      if (searchInput) searchInput.value = "";
      tbody.style.opacity = "0.5";
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=lt.900&select=id,n_int,patent,full_name,phone,mobile_phone,email,type_quad,elem_state,inactive_from&order=n_int.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar contactos");
        const data = await response.json();
        const now = new Date();
        const filtered = data.filter(item => {
          if (["QHR", "QRES"].includes(item.type_quad)) return true;
          if (!item.inactive_from && item.elem_state) return true;
          if (!item.inactive_from) return false;
          return new Date(item.inactive_from) > now;
        });
        tbody.style.opacity = "1";
        if (!filtered.length) {
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:8px;font-size:13px;color:#999;">Sem registos</td></tr>`;
          ["contact-total", "contact-qcom", "contact-qativ", "contact-qest", "contact-qea", "contact-qres", "contact-qhr"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = "0";
          });
          return;
        }
        const masterCheckbox = document.getElementById("contact-list-master-checkbox");
        if (masterCheckbox) masterCheckbox.checked = false;
        if (document.getElementById("contact-selected-count")) {
          document.getElementById("contact-selected-count").textContent = "0";
        }
        const quadDef = [{code: "QCOM", title: "QUADRO DE COMANDO"}, {code: "QATIV", title: "QUADRO ATIVO"}, {code: "QEST", title: "QUADRO DE ESTAGIÁRIOS"}, 
                         {code: "QEA", title: "QUADRO DE ESPECIALISTAS E AUXILIARES"}, {code: "QRES", title: "QUADRO DE RESERVA"}, {code: "QHR", title: "QUADRO DE HONRA"}];
        tbody.innerHTML = "";
        const tdStyle = `padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;`;
        let totalRendered = 0;
        quadDef.forEach(quadro => {
          const elemDoQuadro = filtered.filter(item => item.type_quad === quadro.code);
          if (elemDoQuadro.length === 0) return;
          totalRendered += elemDoQuadro.length;
          const headerTr = document.createElement("tr");
          headerTr.className = "quadro-header-row";
          headerTr.innerHTML = `
            <td colspan="8" style="background: #ffebeb; color: #a70c0c; font-weight: bold; text-align: left; padding: 8px 10px; font-size: 13px; border: 1px solid #ccc; border-left: 2px solid #d81c1c; letter-spacing: 0.05em;">
              <i class="fa-solid fa-diamond"></i> ${quadro.title} (${elemDoQuadro.length})
            </td>
          `;
          tbody.appendChild(headerTr);
          elemDoQuadro.forEach(item => {
            const tr = document.createElement("tr");
            const emailTarget = item.email || "";
            const phoneTarget = item.mobile_phone || item.phone || "";
            tr.dataset.typeQuad = quadro.code;
            tr.innerHTML = `
              <td style="${tdStyle}; font-weight: bold;">${item.n_int || ""}</td>
              <td style="${tdStyle}; font-weight: bold;">${item.patent || ""}</td>
              <td style="${tdStyle}; text-align:left; font-weight: bold;">${item.full_name || ""}</td>
              <td style="${tdStyle}; font-weight: bold;">${item.phone || ""}</td>
              <td style="${tdStyle}; font-weight: bold;">${item.mobile_phone || ""}</td>
              <td style="${tdStyle}; font-weight:bold; color: blue;">${item.email || ""}</td>
              <td style="${tdStyle}; width: 75px; text-align: center; white-space: nowrap;">
                <input type="checkbox" class="contact-row-checkbox contact-email-cb" data-email="${emailTarget}" style="margin-right: 6px; vertical-align: middle; width: 18px; height: 18px; cursor: pointer !important;">
                <button onclick="contactEmail('${emailTarget}')" style="background:#d81c1c; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:14px; vertical-align: middle;"><i class="fa-solid fa-envelope"></i></button>
              </td>
              <td style="${tdStyle} width: 75px; text-align: center; white-space: nowrap;">
                <input type="checkbox" class="contact-row-checkbox contact-sms-cb" disabled data-phone="${phoneTarget}" style="margin-right: 6px; vertical-align: middle; width: 18px; height: 18px; cursor: pointer !important;">
                <button onclick="showbreve()" style="background:#27ae60; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:14px; vertical-align: middle;"><i class="fa-solid fa-comment"></i></button>
              </td>
            `;
            tr.addEventListener("mouseover", () => tr.style.background = "#c8d8f5");
            tr.addEventListener("mouseout", () => tr.style.background = "");
            tbody.appendChild(tr);
          });
        });
        if (totalRendered === 0) {
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:8px;font-size:13px;color:#999;">Sem registos classificados</td></tr>`;
        }
        document.getElementById("contact-total").textContent = filtered.length;
        document.getElementById("contact-qcom").textContent = filtered.filter(item => item.type_quad === "QCOM").length;
        document.getElementById("contact-qativ").textContent = filtered.filter(item => item.type_quad === "QATIV").length;
        document.getElementById("contact-qest").textContent = filtered.filter(item => item.type_quad === "QEST").length;
        document.getElementById("contact-qea").textContent = filtered.filter(item => item.type_quad === "QEA").length;
        document.getElementById("contact-qres").textContent = filtered.filter(item => item.type_quad === "QRES").length;
        document.getElementById("contact-qhr").textContent = filtered.filter(item => item.type_quad === "QHR").length;
      } catch (err) {
        tbody.style.opacity = "1";
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:8px;font-size:12px;color:red;">Erro ao carregar contactos.</td></tr>`;
        console.error("Erro ao carregar contactos:", err);
        ["contact-total", "contact-qcom", "contact-qativ", "contact-qest", "contact-qea", "contact-qres", "contact-qhr"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = "0";
        });
      }
    }
    const CONTACT_EMAIL_POPUP_STYLES = `
      @keyframes contactPopIn {from {opacity: 0; transform: scale(0.9) translateY(10px);} to {opacity: 1; transform: scale(1) translateY(0);}}
      @keyframes contactFadeIn {from {opacity: 0;} to {opacity: 1;}}
      .contact-email-overlay {position: fixed; inset: 0; background: rgba(10, 12, 15, 0.6); z-index: 10005; display: flex; align-items: center; justify-content: center; 
                              backdrop-filter: blur(3px); animation: contactFadeIn 0.2s ease;}
      .contact-email-card {background: #fff; width: 480px; border-radius: 12px; box-shadow: 0 15px 45px rgba(0,0,0,0.3); overflow: hidden; animation: contactPopIn 0.25s cubic-bezier(.22,.68,0,1.2); 
                           font-family: 'Segoe UI', sans-serif;}
      .contact-email-header {background: linear-gradient(135deg, #a70c0c 0%, #d81c1c 45%, #b91010 100%); color: #fff; padding: 12px 16px; font-size: 13.5px; font-weight: 600; display: flex; 
                             justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.1);}
      .contact-email-body {padding: 16px; display: flex; flex-direction: column; gap: 12px;}
      .contact-email-field {display: flex; flex-direction: column; gap: 4px;}
      .contact-email-field label {font-size: 11.5px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;}
      .contact-email-input-box {display: flex; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #f8fafc; transition: all 0.2s;}
      .contact-email-input-box:focus-within {border-color: #d81c1c; background: #fff;}
      .contact-email-input {flex: 1; border: none; background: transparent; padding: 8px 10px; font-size: 13px; color: #333; outline: none;}
      .contact-email-textarea {width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 13px; color: #333; outline: none; background: #f8fafc; resize: vertical; 
                               min-height: 120px; font-family: inherit; box-sizing: border-box; transition: all 0.2s;}
      .contact-email-textarea:focus {background: #fff; border-color: #d81c1c;}
      .contact-email-btn-action {background: #d81c1c; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; text-align: center; 
                                 display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s; margin-top: 6px; width: 100%;}
      .contact-email-btn-action:hover {background: #b91010;}
      .contact-email-btn-copy {background: #e2e8f0; border: none; border-left: 1px solid #cbd5e1; padding: 0 12px; cursor: pointer; transition: background 0.15s;}
      .contact-email-btn-copy:hover {background: #cbd5e1;}
    `;
    function _contactInjectPopupStyles() {
      if (document.getElementById('contact-popup-styles-tag')) return;
      const style = document.createElement('style');
      style.id = 'contact-popup-styles-tag';
      style.innerHTML = CONTACT_EMAIL_POPUP_STYLES;
      document.head.appendChild(style);
    }
    
    /* ===== HELPER: LÊ FICHEIRO E CONVERTE PARA BASE64 ===== */
    async function _readAttachment() {
      const fileInput = document.getElementById('contact-email-attachment');
      if (!fileInput?.files.length) return null;
      const file = fileInput.files[0];
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return {filename: file.name, content: base64, encoding: 'base64'};
    }
    /* ===== HELPER: LISTENER DO NOME DO FICHEIRO ===== */
    function _attachFileListener() {
      document.getElementById('contact-email-attachment')?.addEventListener('change', function() {
        const name = this.files.length > 0 ? this.files[0].name : 'Nenhum ficheiro selecionado';
        document.getElementById('contact-attachment-name').textContent = name;
      });
    }
    const ATTACHMENT_FIELD_HTML = `
      <div class="contact-email-field">
        <label>Anexo (opcional):</label>
        <div class="contact-email-input-box" style="padding: 6px 10px; align-items: center; gap: 8px;">
          <input type="file" id="contact-email-attachment" style="display:none;">
          <button type="button" onclick="document.getElementById('contact-email-attachment').click()" 
                                style="background:#1e3a8a; color:#fff; border:none; border-radius:4px; padding:5px 12px; font-size:12px; cursor:pointer; white-space:nowrap;"><i class="fa-solid fa-paperclip"></i> Escolher Ficheiro</button>
          <span id="contact-attachment-name" style="font-size:12px; color:#64748b; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            Nenhum ficheiro selecionado
          </span>
        </div>
      </div>
    `;
   async function _autoCopyForWhatsApp() {
      const subjectInput = document.getElementById('contact-email-subject');
      const messageTextarea = document.getElementById('contact-email-body-text');
      if (!subjectInput || !messageTextarea) return;
      const subjectText = subjectInput.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
      const messageText = messageTextarea.value.trim();
      if (!messageText) return;
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const nInt = sessionStorage.getItem("currentNInt");
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=eq.${nInt}&select=abv_name,patent_abv`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await res.json();
        const abvName = data[0]?.abv_name || "";
        const patentAbv = data[0]?.patent_abv || "";
        const signature = `OPTEL: ${patentAbv} ${abvName}`;
        const finalText = `⚠️*AVISO*⚠️\n\n${messageText}\n\n${signature}`;
        if (subjectText.includes('ro') || subjectText.includes('relatorio')) {
          await navigator.clipboard.writeText(finalText);
          messageTextarea.style.borderColor = "#25D366";
          messageTextarea.style.boxShadow = "0 0 4px rgba(37,211,102,0.4)";
        } else {
          messageTextarea.style.borderColor = "#cbd5e1";
          messageTextarea.style.boxShadow = "none";
        }
      } catch(err) {
        console.error("Erro ao copiar automaticamente:", err);
      }
    }
    function contactEmail(email) {
      if (!email) {
        showPopup('popup-danger', "Este elemento não tem e-mail registado.");
        return;
      }
      _contactInjectPopupStyles();
      document.getElementById('contact-email-popup-overlay')?.remove();
      const overlay = document.createElement('div');
      overlay.id = 'contact-email-popup-overlay';
      overlay.className = 'contact-email-overlay';
      overlay.innerHTML = `
        <div class="contact-email-card">
          <div class="contact-email-header">
            <span><i class="fa-solid fa-envelope"></i> Escrever E-mail para o Contacto</span>
            <button style="background:none; border:none; color:#fff; cursor:pointer; font-size:14px;" id="contact-email-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="contact-email-body">
            <div class="contact-email-field">
              <label>Para:</label>
              <div class="contact-email-input-box" style="background: #e2e8f0;">
                <input type="text" class="contact-email-input" value="${email}" readonly id="contact-email-to" style="color: #475569; font-weight: 500;">
                <button class="contact-email-btn-copy" id="contact-email-copy" title="Copiar Destinatário"><i class="fa-solid fa-clipboard-list"></i></button>
              </div>
            </div>
            <div class="contact-email-field">
              <label>Assunto:</label>
              <div class="contact-email-input-box">
                <input type="text" class="contact-email-input" id="contact-email-subject" placeholder="Introduza o assunto do e-mail...">
              </div>
            </div>
            <div class="contact-email-field">
              <label>Mensagem:</label>
             <textarea class="contact-email-textarea" id="contact-email-body-text" placeholder="Escreva a sua mensagem aqui..."></textarea>
            </div>
            ${ATTACHMENT_FIELD_HTML}
            <button class="contact-email-btn-action" id="contact-email-send"><span><i class="fa-solid fa-paper-plane"></i> Enviar E-mail</span></button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      _attachFileListener();
      const closePopup = () => overlay.remove();
      document.getElementById('contact-email-close').onclick = closePopup;
      document.getElementById('contact-email-copy').onclick = function() {
        const emailInput = document.getElementById('contact-email-to');
        emailInput.select();
        navigator.clipboard.writeText(emailInput.value);
        this.innerHTML = "<i class='fa-solid fa-circle-check'></i>";
        setTimeout(() => {this.innerHTML = "<i class='fa-solid fa-clipboard-list'></i>";}, 1500);
      };
      document.getElementById('contact-email-send').onclick = async function() {
        const to = document.getElementById('contact-email-to').value;
        const subject = document.getElementById('contact-email-subject').value.trim();
        const message = document.getElementById('contact-email-body-text').value.trim();
        const btn = this;
        if (!subject || !message) {
          showPopup('popup-danger', "Por favor, preencha o assunto e o corpo da mensagem.");
          return;
        }
        btn.disabled = true; btn.style.background = "#64748b"; btn.style.cursor = "not-allowed"; btn.innerHTML = `<span><i class="fa-solid fa-hourglass-half"></i> A enviar...</span>`;
        try {
          const {corpOperNr, corpName, logoUrl, senderName} = await _getEmailCommonData();
          const attachment = await _readAttachment();
          const response = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({type: "email", data: {to, subject, message, corpOperNr, corpName, logoUrl, senderName, attachment}})
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText.trim().startsWith("<") ? `Erro do Vercel (${response.status}).` : errorText || "Falha na resposta do servidor.");
          }
          const result = await response.json();
          if (result.success) {
            await _autoCopyForWhatsApp();
            showPopup('popup-success', "E-mail enviado com sucesso!");
            closePopup();
          }
          else throw new Error(result.error || "Erro desconhecido no servidor.");
        } catch (err) {
          console.error("Erro:", err);
          showPopup('popup-danger', `Falha no envio: ${err.message}`);
          btn.disabled = false; btn.style.background = "#d81c1c"; btn.style.cursor = "pointer"; btn.innerHTML = `<span><i class="fa-solid fa-paper-plane"></i> Enviar E-mail</span>`;
        }
      };
    }
    document.getElementById("contact-list-global-email")?.addEventListener("click", async () => {
      const tbody = document.getElementById("contact-list-tbody");
      if (!tbody) return;
      if (tbody.textContent.includes("Sem registos")) {
        showPopup('popup-danger', "Não há contactos carregados.");
        return;
      }
      const rows = tbody.querySelectorAll("tr:not(.quadro-header-row)");
      const emails = [];
      rows.forEach(row => {
        if (row.style.display === "none") return;
        const email = row.children[5]?.textContent.trim();
        if (email) emails.push(email);
      });
      if (!emails.length) {
        showPopup('popup-danger', "Nenhum dos elementos visíveis tem e-mail registado.");
        return;
      }
      _contactInjectPopupStyles();
      document.getElementById('contact-email-popup-overlay')?.remove();
      const overlay = document.createElement('div');
      overlay.id = 'contact-email-popup-overlay';
      overlay.className = 'contact-email-overlay';
      overlay.innerHTML = `
        <div class="contact-email-card">
          <div class="contact-email-header">
            <span><i class="fa-solid fa-envelope"></i> Este e-mail vai ser enviado para ${emails.length} destinatários</span>
            <button style="background:none; border:none; color:#fff; cursor:pointer; font-size:14px;" id="contact-email-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="contact-email-body">
            <div class="contact-email-field">
              <label>Assunto:</label>
              <div class="contact-email-input-box">
                <input type="text" class="contact-email-input" id="contact-email-subject" placeholder="Introduza o assunto do e-mail...">
              </div>
            </div>
            <div class="contact-email-field">
              <label>Mensagem:</label>
              <textarea class="contact-email-textarea" id="contact-email-body-text" placeholder="Escreva a sua mensagem aqui..."></textarea>
            </div>
            ${ATTACHMENT_FIELD_HTML}
            <button class="contact-email-btn-action" id="contact-email-send"><span><i class="fa-solid fa-paper-plane"></i> Enviar para Todos</span></button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      _attachFileListener();
      const closePopup = () => overlay.remove();
      document.getElementById('contact-email-close').onclick = closePopup;
      //overlay.onclick = (e) => {if (e.target === overlay) closePopup();};
      document.getElementById('contact-email-send').onclick = async function() {
        const subject = document.getElementById('contact-email-subject').value.trim();
        const message = document.getElementById('contact-email-body-text').value.trim();
        const btn = this;
        if (!subject || !message) {
          showPopup('popup-danger', "Por favor, preencha o assunto e o corpo da mensagem.");
          return;
        }
        btn.disabled = true; btn.style.background = "#64748b"; btn.style.cursor = "not-allowed"; btn.innerHTML = `<span><i class="fa-solid fa-hourglass-half"></i> A enviar...</span>`;
        try {
          const [{corpOperNr, corpName, logoUrl, senderName}, bulk, corpContacts] = await Promise.all([_getEmailCommonData(), salocGetBulkRecipients(), _getPLANDIREmailCommonData(sessionStorage.getItem("currentCorpOperNr"))]);
          const attachment = await _readAttachment();
          const response = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({type: "email", data: {to: bulk.to, subject, message, corpOperNr, corpName, logoUrl, senderName, isBulk: true, cc: bulk.cc, bcc: [...bulk.bcc, ...emails], attachment,
                                                        corpAddress: corpContacts.corpAddress, corpCp: corpContacts.corpCp, corpLocalitie: corpContacts.corpLocalitie, corpPhoneMobile: corpContacts.corpPhoneMobile, corpPhoneLandline: corpContacts.corpPhoneLandline, corpEmail: corpContacts.corpEmail}})
          });
          if (!response.ok) throw new Error(await response.text());
          const result = await response.json();
          if (result.success) {
            showPopup('popup-success', `E-mail enviado com sucesso para ${emails.length} destinatários!`); closePopup();
          }
          else throw new Error(result.error || "Erro desconhecido.");
        } catch (err) {
          console.error("Erro:", err);
          showPopup('popup-danger', `Falha no envio: ${err.message}`);
          btn.disabled = false; btn.style.background = "#d81c1c"; btn.style.cursor = "pointer"; btn.innerHTML = `<span><i class="fa-solid fa-paper-plane"></i> Enviar para Todos</span>`;
        }
      };
    });
    document.getElementById("contact-list-tbody")?.addEventListener("change", function(e) {
      if (!e.target.classList.contains("contact-row-checkbox")) return;
      const checked = document.querySelectorAll(".contact-row-checkbox:checked");
      const count = checked.length;
      const btn = document.getElementById("contact-list-selected-email");
      document.getElementById("contact-selected-count").textContent = count;
      if (count > 0) {btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer";}
      else {btn.disabled = true; btn.style.opacity = "0.4"; btn.style.cursor = "not-allowed";}
    });
    document.getElementById("contact-list-selected-email")?.addEventListener("click", () => {
      const checked = document.querySelectorAll(".contact-row-checkbox:checked");
      const emails = [];
      checked.forEach(cb => {const email = cb.dataset.email; if (email) emails.push(email);});
      if (!emails.length) {
        showPopup('popup-danger', "Nenhum elemento selecionado tem e-mail registado.");
        return;
      }
      _contactInjectPopupStyles();
      document.getElementById('contact-email-popup-overlay')?.remove();
      const overlay = document.createElement('div');
      overlay.id = 'contact-email-popup-overlay';
      overlay.className = 'contact-email-overlay';
      overlay.innerHTML = `
        <div class="contact-email-card">
          <div class="contact-email-header">
            <span><i class="fa-solid fa-envelope"></i> Este e-mail vai ser enviado para ${emails.length} destinatários</span>
            <button style="background:none; border:none; color:#fff; cursor:pointer; font-size:14px;" id="contact-email-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="contact-email-body">
            <div class="contact-email-field">
              <label>Assunto:</label>
              <div class="contact-email-input-box">
                <input type="text" class="contact-email-input" id="contact-email-subject" placeholder="Introduza o assunto do e-mail...">
              </div>
            </div>
            <div class="contact-email-field">
              <label>Mensagem:</label>
              <textarea class="contact-email-textarea" id="contact-email-body-text" placeholder="Escreva a sua mensagem aqui..."></textarea>
            </div>
            ${ATTACHMENT_FIELD_HTML}
            <button class="contact-email-btn-action" id="contact-email-send"><span><i class="fa-solid fa-paper-plane"></i> Enviar para Selecionados</span></button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);      
      _attachFileListener();
      const closePopup = () => overlay.remove();
      document.getElementById('contact-email-close').onclick = closePopup;
      //overlay.onclick = (e) => {if (e.target === overlay) closePopup();};
      document.getElementById('contact-email-send').onclick = async function() {
        const subject = document.getElementById('contact-email-subject').value.trim();
        const message = document.getElementById('contact-email-body-text').value.trim();
        const btn = this;
        if (!subject || !message) {
          showPopup('popup-danger', "Por favor, preencha o assunto e o corpo da mensagem.");
          return;
        }
        btn.disabled = true; btn.style.background = "#64748b"; btn.style.cursor = "not-allowed"; btn.innerHTML = `<span><i class="fa-solid fa-hourglass-half"></i> A enviar...</span>`;
        try {
          const [{corpOperNr, corpName, logoUrl, senderName}, bulk, corpContacts] = await Promise.all([_getEmailCommonData(), salocGetBulkRecipients(), _getPLANDIREmailCommonData(sessionStorage.getItem("currentCorpOperNr"))]);
          const attachment = await _readAttachment();
          const response = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({type: "email", data: {to: bulk.to, subject, message, corpOperNr, corpName, logoUrl, senderName, isBulk: true, cc: bulk.cc, bcc: [...bulk.bcc, ...emails], attachment,
                                                        corpAddress: corpContacts.corpAddress, corpCp: corpContacts.corpCp, corpLocalitie: corpContacts.corpLocalitie, corpPhoneMobile: corpContacts.corpPhoneMobile, corpPhoneLandline: corpContacts.corpPhoneLandline, corpEmail: corpContacts.corpEmail}})
          });
          if (!response.ok) throw new Error(await response.text());
          const result = await response.json();
          if (result.success) {
            showPopup('popup-success', `E-mail enviado com sucesso para ${emails.length} destinatários!`);
            document.querySelectorAll(".contact-row-checkbox:checked").forEach(cb => cb.checked = false);
            document.getElementById("contact-selected-count").textContent = "0";
            const selBtn = document.getElementById("contact-list-selected-email");
            selBtn.disabled = true; selBtn.style.opacity = "0.4"; selBtn.style.cursor = "not-allowed";
            closePopup();
          } else throw new Error(result.error || "Erro desconhecido.");
        } catch (err) {
          console.error("Erro:", err);
          showPopup('popup-danger', `Falha no envio: ${err.message}`);
          btn.disabled = false; btn.style.background = "#d81c1c"; btn.style.cursor = "pointer"; btn.innerHTML = `<span><i class="fa-solid fa-paper-plane"></i> Enviar para Selecionados</span>`;
        }
      };
    });
    /* ===== CONTACT LIST EMIT ===== */
    document.getElementById("contact-list-emit")?.addEventListener("click", async () => {
      const tbody = document.getElementById("contact-list-tbody");
      if (!tbody || tbody.textContent.includes("Sem registos")) {
        showPopup('popup-danger', "Não há contactos carregados.");
        return;
      }
      try {
        showLoadingPopup("A preparar listagem...");
        const {corpName} = await _getEmailCommonData();
        const quadDef = [{code: "QCOM", title: "QUADRO DE COMANDO"}, {code: "QATIV", title: "QUADRO ATIVO"}, {code: "QEST", title: "QUADRO DE ESTAGIÁRIOS"},
                         {code: "QEA", title: "QUADRO DE ESPECIALISTAS E AUXILIARES"}, {code: "QRES", title: "QUADRO DE RESERVA"}, {code: "QHR", title: "QUADRO DE HONRA"}];
        const rows = tbody.querySelectorAll("tr:not(.quadro-header-row)");
        const allElements = [];
        rows.forEach(row => {
          if (row.style.display === "none") return;
          allElements.push({type_quad: row.dataset.typeQuad || "", n_int: row.children[0]?.textContent.trim(), patent: row.children[1]?.textContent.trim(), full_name: row.children[2]?.textContent.trim(), 
                            phone: row.children[3]?.textContent.trim(), mobile_phone: row.children[4]?.textContent.trim(), email: row.children[5]?.textContent.trim()});});
        const quad = quadDef.map(q => ({code: q.code, elements: allElements.filter(el => el.type_quad === q.code)}));
        updateLoadingPopup("A gerar Listagem de Contactos...");
        const response = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({type: "contact_list", data: {corpName, quad}}),
        });
        if (!response.ok) throw new Error(await response.text());
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        hideLoadingPopup();
        document.getElementById('various-pdf-modal')?.remove();
        _variousInjectStyles();
        const overlay = document.createElement('div');
        overlay.id = 'various-pdf-modal';
        Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'});
        const box = document.createElement('div');
        box.className = 'various-box';
        Object.assign(box.style, {background: '#f8f8f8', borderRadius: '14px', width: '82vw', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', overflow: 'hidden'});
        const header = document.createElement('div');
        header.className = 'various-header';
        header.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex:1;position:relative;z-index:1;">
            <div style="color:#fff;font-weight:700;font-size:13px;"><i class="fa-solid fa-clipboard-list"></i> Listagem de Contactos</div>
          </div>
          <div style="display:flex;gap:5px;position:relative;z-index:1;">
            <button class="various-btn" id="various-pdf-fullscreen" title="Ecrã inteiro"><i class="fa-solid fa-expand"></i></button>
            <button class="various-btn various-close-btn" id="various-pdf-close" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
        const content = document.createElement('div');
        Object.assign(content.style, {flex: '1', position: 'relative', overflow: 'hidden', background: '#fff'});
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {position: 'absolute', inset: '0', width: '100%', height: '100%', border: 'none'});
        iframe.src = url;
        content.appendChild(iframe);
        const footer = document.createElement('div');
        footer.className = 'various-footer';
        footer.innerHTML = `
          <div class="various-footer-info">Documento gerado com sucesso</div>
          <button class="various-print-btn" id="various-pdf-print"><i class="fa-solid fa-print"></i> Imprimir</button>
        `;
        box.append(header, content, footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        let isFs = false;
        document.getElementById("various-pdf-fullscreen").onclick = () => {
          isFs = !isFs;
          Object.assign(box.style, {width: isFs ? '100vw' : '82vw', height: isFs ? '100vh' : '90vh', borderRadius: isFs ? '0' : '14px'});
        };
        document.getElementById("various-pdf-close").onclick = () => { 
          URL.revokeObjectURL(url);
          overlay.remove();
        };
        document.getElementById("various-pdf-print").onclick = () => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        };
        //overlay.addEventListener('click', e => {if (e.target === overlay) {URL.revokeObjectURL(url); overlay.remove();}});
      } catch (err) {
        hideLoadingPopup();
        console.error("Erro ao emitir listagem:", err);
        showPopup('popup-danger', `Erro ao gerar PDF: ${err.message}`);
      }
    });
    /* ===== ATTENDANCE LIST INIT ===== */
    document.querySelector('.sidebar-sub-submenu-button[data-page="page-attendance-list"]')?.addEventListener("click", () => {
      loadAttendanceList();
    });
    document.getElementById("attendance-list-tbody")?.addEventListener("change", (e) => {
      const tbody = document.getElementById("attendance-list-tbody");
      if (!tbody) return;
      if (e.target.classList.contains("att-radio")) {
        const emptyMotives = tbody.querySelectorAll('.att-motive:not([disabled])');
        for (const motive of emptyMotives) {
          if (motive.dataset.id === e.target.dataset.id) continue;
          if (motive.value.trim() === "") {
            const tr = motive.closest("tr");
            const name = tr?.children[2]?.textContent.trim() || "desconhecido";
            e.target.checked = false;
            showPopup('popup-danger', `<i class="fa-solid fa-triangle-exclamation"></i> O elemento <strong>${name}</strong> tem motivo de não comparência por preencher!`);
            const modal = document.getElementById('popup-danger');
            if (modal) {
              const observer = new MutationObserver(() => {
                if (!modal.classList.contains('show')) {
                  motive.dataset.errorFocus = "true";
                  motive.focus();
                  observer.disconnect();
                }
              });
              observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
            }
            return;
          }
        }
      }
      if (tbody) updateAttendanceCounts(tbody);
      if (e.target.classList.contains("att-radio")) {
        const id = e.target.dataset.id;
        const motiveInput = tbody.querySelector(`.att-motive[data-id="${id}"]`);
        if (!motiveInput) return;
        if (e.target.value === "nao") {
          motiveInput.disabled = false;
          motiveInput.style.background = "";
          motiveInput.style.color = "";
          motiveInput.style.cursor = "text";
          motiveInput.focus();
        } else {
          motiveInput.disabled = true;
          motiveInput.value = "";
          motiveInput.style.background = "#f5f5f5";
          motiveInput.style.color = "#999";
          motiveInput.style.cursor = "not-allowed";
        }
      }
    });
    document.getElementById("attendance-list-emit")?.addEventListener("click", () => {
      const tbody = document.getElementById("attendance-list-tbody");
      if (!tbody) return;
      const rows = tbody.querySelectorAll("tr:not(.quadro-header-row)");
      const result = [];
      rows.forEach(tr => {
        const radioYes = tr.querySelector('.att-radio[value="sim"]');
        const radioNo = tr.querySelector('.att-radio[value="nao"]');
        if (!radioYes && !radioNo) return;
        result.push({
          n_int: tr.children[0]?.textContent.trim(),
          patent: tr.children[1]?.textContent.trim(),
          full_name: tr.children[2]?.textContent.trim(),
          attends: radioYes?.checked ? "Sim" : radioNo?.checked ? "Não" : "—",
          motive: tr.querySelector('.att-motive')?.value.trim() || ""
        });
      });
    });
    async function loadAttendanceList() {
      const tbody = document.getElementById("attendance-list-tbody");
      if (!tbody) return;
      const totalEl = document.getElementById("contact-attendance-total");
      totalEl.textContent = "0/0";
      totalEl.dataset.total = "0";
      document.getElementById("contact-attendance").textContent = "0";
      document.getElementById("contact-noattendance").textContent = "0";
      tbody.style.opacity = "0.5";
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?corp_oper_nr=eq.${corpOperNr}&n_int=lt.900&select=id,n_int,patent,full_name,type_quad,elem_state,inactive_from,phone,mobile_phone&order=n_int.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar lista");
        const data = await response.json();
        const now = new Date();
        const filtered = data.filter(item => {
          if (["QHR", "QRES"].includes(item.type_quad)) return true;
          if (!item.inactive_from && item.elem_state) return true;
          if (!item.inactive_from) return false;
          return new Date(item.inactive_from) > now;
        });
        tbody.style.opacity = "1";
        if (!filtered.length) {
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:8px;font-size:14px;color:#999;">Sem registos</td></tr>`;
          return;
        }
        const quadDef = [{code: "QCOM", title: "QUADRO DE COMANDO"}, {code: "QATIV", title: "QUADRO ATIVO"}, {code: "QEST", title: "QUADRO DE ESTAGIÁRIOS"},
                         {code: "QEA", title: "QUADRO DE ESPECIALISTAS E AUXILIARES"}, {code: "QRES", title: "QUADRO DE RESERVA"}, {code: "QHR", title: "QUADRO DE HONRA"}];
        tbody.innerHTML = "";
        const tdStyle = `padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;`;
        let totalRendered = 0;
        quadDef.forEach(quadro => {
          const elems = filtered.filter(item => item.type_quad === quadro.code);
          if (!elems.length) return;
          totalRendered += elems.length;
          const headerTr = document.createElement("tr");
          headerTr.className = "quadro-header-row";
          headerTr.innerHTML = `
            <td colspan="8" style="background:#ffebeb;color:#a70c0c;font-weight:bold;text-align:left;
                padding:8px 10px;font-size:13px;border:1px solid #ccc;border-left:2px solid #d81c1c;
                letter-spacing:0.05em;">
              <i class="fa-solid fa-diamond"></i> ${quadro.title} (${elems.length})
            </td>
          `;
          tbody.appendChild(headerTr);
          elems.forEach(item => {
            const tr = document.createElement("tr");
            tr.dataset.typeQuad = quadro.code;
            tr.innerHTML = `
              <td style="${tdStyle} font-weight:bold;">${item.n_int || ""}</td>
              <td style="${tdStyle} font-weight:bold;">${item.patent || ""}</td>
              <td style="${tdStyle} text-align:left; font-weight:bold;">${item.full_name || ""}</td>
              <td style="${tdStyle}; font-weight:bold;">${item.phone || ""}</td>
              <td style="${tdStyle}; font-weight:bold;">${item.mobile_phone || ""}</td>
              <td style="${tdStyle} width:80px;">
                <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;color:#166534;font-weight:600;">
                  <input type="radio" name="att_${item.id}" value="sim" class="att-radio" data-id="${item.id}" style="width:16px;height:16px;cursor:pointer!important;accent-color:#16a34a;">
                  Sim
                </label>
              </td>
              <td style="${tdStyle} width:80px;">
                <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;color:#991b1b;font-weight:600;">
                  <input type="radio" name="att_${item.id}" value="nao" class="att-radio" data-id="${item.id}" style="width:16px;height:16px;cursor:pointer!important;accent-color:#dc2626;">
                  Não
                </label>
              </td>
              <td style="${tdStyle} text-align:left;">
                <input type="text" class="att-motive" data-id="${item.id}" placeholder="Motivo de não comparência." disabled
                style="width:100%;font-size:12px;padding:3px 6px;border:1px solid #ccc;border-radius:3px;background:#f5f5f5;color:#999;cursor:not-allowed;"
                onfocus="
                  this.style.outline='none';
                  if(this.dataset.errorFocus === 'true'){
                    this.style.border='1px solid #fca5a5';
                    this.style.boxShadow='0 0 0 3px rgba(252,165,165,0.3)';
                    this.dataset.errorFocus='false';
                  } else {
                    this.style.border='1px solid #93c5fd';
                    this.style.boxShadow='0 0 0 3px rgba(147,197,253,0.3)';
                  }"
                onblur="this.style.border='1px solid #ccc';this.style.boxShadow='';">
              </td>
            `;
            tr.addEventListener("mouseover", () => tr.style.background = "#c8d8f5");
            tr.addEventListener("mouseout", () => tr.style.background = "");
            tbody.appendChild(tr);
          });
        });
        if (!totalRendered) {
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:8px;font-size:13px;color:#999;">Sem registos classificados</td></tr>`;
        }
        totalEl.textContent = `0/${filtered.length}`;
        totalEl.dataset.total = filtered.length;
        await loadRecentAttendanceEvents(); 
      } catch (err) {
        tbody.style.opacity = "1";
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:8px;font-size:12px;color:red;">Erro ao carregar lista.</td></tr>`;
        console.error("Erro ao carregar lista de comparências:", err);
      }
    }
    function updateAttendanceCounts(tbody) {
      const yesCount = tbody.querySelectorAll('.att-radio[value="sim"]:checked').length;
      const noCount = tbody.querySelectorAll('.att-radio[value="nao"]:checked').length;
      const totalEl = document.getElementById("contact-attendance-total");
      const total = totalEl.dataset.total || "0";
      document.getElementById("contact-attendance").textContent = yesCount;
      document.getElementById("contact-noattendance").textContent = noCount;
      totalEl.textContent = `${yesCount + noCount}/${total}`;
    }
    /* ===== ATTENDANCE LIST EMIT ===== */
    document.getElementById("attendance-list-emit")?.addEventListener("click", async () => {
      const tbody = document.getElementById("attendance-list-tbody");
      if (!tbody || tbody.textContent.includes("Sem registos")) {
        showPopup('popup-danger', "Não há lista carregada.");
        return;
      }
      const eventName = document.getElementById("attendance-event-name")?.value.trim() || "";
      if (!eventName) {
        showPopup('popup-danger', "Por favor indique o nome do evento antes de emitir.");
        return;
      }
      try {
        showLoadingPopup("A preparar listagem...");
        const [{corpName, logoUrl, senderName}, corpContacts, attRecipients] = await Promise.all([
          _getEmailCommonData(),
          _getPLANDIREmailCommonData(sessionStorage.getItem("currentCorpOperNr")),
          salocGetAttendanceRecipients()
        ]);
        const {corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail} = corpContacts;
        const quadDef = [{code: "QCOM", title: "QUADRO DE COMANDO"}, {code: "QATIV", title: "QUADRO ATIVO"}, {code: "QEST", title: "QUADRO DE ESTAGIÁRIOS"},
                         {code: "QEA", title: "QUADRO DE ESPECIALISTAS E AUXILIARES"}, {code: "QRES", title: "QUADRO DE RESERVA"}, {code: "QHR", title: "QUADRO DE HONRA"}];
        const rows = tbody.querySelectorAll("tr:not(.quadro-header-row)");
        const allElements = [];
        rows.forEach(row => {
          const radioYes = row.querySelector('.att-radio[value="sim"]');
          const radioNo = row.querySelector('.att-radio[value="nao"]');
          if (!radioYes && !radioNo) return;
          allElements.push({
            type_quad: row.dataset.typeQuad || "",
            n_int: row.children[0]?.textContent.trim(),
            patent: row.children[1]?.textContent.trim(),
            full_name: row.children[2]?.textContent.trim(),
            attends: radioYes?.checked ? "Sim" : radioNo?.checked ? "Não" : "—",
            motive: row.querySelector('.att-motive')?.value.trim() || ""
          });
        });
        const quad = quadDef.map(q => ({code: q.code, elements: allElements.filter(el => el.type_quad === q.code)}));
        updateLoadingPopup("A gerar Lista de Comparências...");
        const response = await fetch("https://cb360-online.vercel.app/api/various_convert_and_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({type: "attendance_list", data: {corpName, logoUrl, senderName, eventName, quad,
                                                                corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail,
                                                                attendanceTo: attRecipients.to, attendanceCc: attRecipients.cc, attendanceBcc: attRecipients.bcc}}),
        });
        if (!response.ok) throw new Error(await response.text());
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        hideLoadingPopup();
        document.getElementById('various-pdf-modal')?.remove();
        _variousInjectStyles();
        const overlay = document.createElement('div');
        overlay.id = 'various-pdf-modal';
        Object.assign(overlay.style, {position: 'fixed', inset: '0', background: 'rgba(10,8,8,0.78)', zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'});
        const box = document.createElement('div');
        box.className = 'various-box';
        Object.assign(box.style, {background: '#f8f8f8', borderRadius: '14px', width: '82vw', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 72px rgba(0,0,0,0.45)', overflow: 'hidden'});
        const header = document.createElement('div');
        header.className = 'various-header';
        header.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex:1;position:relative;z-index:1;">
            <div style="color:#fff;font-weight:700;font-size:13px;"><i class="fa-solid fa-clipboard-list"></i> Lista de Comparências - ${eventName}</div>
          </div>
          <div style="display:flex;gap:5px;position:relative;z-index:1;">
            <button class="various-btn" id="various-pdf-fullscreen" title="Ecrã inteiro"><i class="fa-solid fa-expand"></i></button>
            <button class="various-btn various-close-btn" id="various-pdf-close" title="Fechar"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
        const content = document.createElement('div');
        Object.assign(content.style, {flex: '1', position: 'relative', overflow: 'hidden', background: '#fff'});
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {position: 'absolute', inset: '0', width: '100%', height: '100%', border: 'none'});
        iframe.src = url;
        content.appendChild(iframe);
        const footer = document.createElement('div');
        footer.className = 'various-footer';
        footer.innerHTML = `
          <div class="various-footer-info">Documento gerado com sucesso</div>
          <button class="various-print-btn" id="various-pdf-print"><i class="fa-solid fa-print"></i> Imprimir</button>
        `;
        box.append(header, content, footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        let isFs = false;
        document.getElementById("various-pdf-fullscreen").onclick = () => {
          isFs = !isFs;
          Object.assign(box.style, {width: isFs ? '100vw' : '82vw', height: isFs ? '100vh' : '90vh', borderRadius: isFs ? '0' : '14px'});
        };
        document.getElementById("various-pdf-close").onclick = () => {
          URL.revokeObjectURL(url);
          overlay.remove();
        };
        document.getElementById("various-pdf-print").onclick = () => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        };
      } catch (err) {
        hideLoadingPopup();
        console.error("Erro ao emitir lista de comparências:", err);
        showPopup('popup-danger', `Erro ao gerar PDF: ${err.message}`);
      }
    });
    /* ===== ATTENDANCE LIST SAVE ===== */
    document.getElementById("attendance-list-save")?.addEventListener("click", async () => {
      const tbody = document.getElementById("attendance-list-tbody");
      if (!tbody || tbody.textContent.includes("Sem registos")) {
        showPopup('popup-danger', "Não há lista carregada.");
        return;
      }
      const eventName = document.getElementById("attendance-event-name")?.value.trim() || "";
      if (!eventName) {
        showPopup('popup-danger', "Por favor indique o nome do evento antes de guardar.");
        return;
      }
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const saveBtn = document.getElementById("attendance-list-save");
      saveBtn.disabled = true;
      saveBtn.textContent = "⌛ A guardar...";
      try {
        const checkResp = await fetch(
          `${SUPABASE_URL}/rest/v1/attendance_events?corp_oper_nr=eq.${corpOperNr}&event_name=eq.${encodeURIComponent(eventName)}&select=id`, {
            headers: getSupabaseHeaders()
          }
        );
        const existing = await checkResp.json();
        let eventId;
        if (existing.length > 0) {
          eventId = existing[0].id;
          await salocCheckRes(await fetch(
            `${SUPABASE_URL}/rest/v1/attendance_events?id=eq.${eventId}`, {
              method: "PATCH",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
              body: JSON.stringify({updated_at: new Date().toISOString()})
            }
          ), "Erro ao atualizar o evento");
          await salocCheckRes(await fetch(
            `${SUPABASE_URL}/rest/v1/attendance_records?event_id=eq.${eventId}`, {
              method: "DELETE",
              headers: getSupabaseHeaders()
            }
          ), "Erro ao limpar a lista anterior");
        } else {
          const insertResp = await fetch(
            `${SUPABASE_URL}/rest/v1/attendance_events`, {
              method: "POST",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=representation"},
              body: JSON.stringify({corp_oper_nr: corpOperNr, event_name: eventName})
            }
          );
          await salocCheckRes(insertResp, "Erro ao criar o evento");
          const inserted = await insertResp.json();
          eventId = inserted[0].id;
        }
        const records = [];
        tbody.querySelectorAll("tr:not(.quadro-header-row)").forEach(tr => {
          const radioYes = tr.querySelector('.att-radio[value="sim"]');
          const radioNo = tr.querySelector('.att-radio[value="nao"]');
          if (!radioYes && !radioNo) return;
          const n_int = parseInt(tr.children[0]?.textContent.trim(), 10);
          if (isNaN(n_int)) return;
          records.push({event_id: eventId, n_int, attends: radioYes?.checked ? "sim" : radioNo?.checked ? "nao" : null, motive: tr.querySelector('.att-motive')?.value.trim() || null});
        });
        if (records.length > 0) {
          await salocCheckRes(await fetch(
            `${SUPABASE_URL}/rest/v1/attendance_records`, {
              method: "POST",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify(records)
            }
          ), "Erro ao gravar as comparências");
        }
        showPopup('popup-success', "Lista de comparências guardada com sucesso!");
        await loadRecentAttendanceEvents();
      } catch (err) {
        console.error("Erro ao guardar lista:", err);
        showPopup('popup-danger', "Erro ao guardar: " + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "<i class='fa-solid fa-floppy-disk'></i> Guardar";
      }
    });
    /* ===== CARREGAR EVENTOS RECENTES ===== */
    async function loadRecentAttendanceEvents() {
      const select = document.getElementById("attendance-recent-events");
      if (!select) return;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/attendance_events?corp_oper_nr=eq.${corpOperNr}&select=id,event_name,updated_at&order=updated_at.desc&limit=20`, {
            headers: getSupabaseHeaders()
          }
        );
        const events = await resp.json();
        select.innerHTML = `<option value="">-- Selecionar evento --</option>`;
        events.forEach(ev => {
          const opt = document.createElement("option");
          opt.value = ev.id;
          opt.textContent = ev.event_name;
          select.appendChild(opt);
        });
      } catch (err) {
        console.error("Erro ao carregar eventos recentes:", err);
      }
    }
    /* ===== RECARREGAR EVENTO SELECIONADO ===== */
    document.getElementById("attendance-recent-events")?.addEventListener("change", async (e) => {
      const eventId = e.target.value;
      if (!eventId) return;
      const tbody = document.getElementById("attendance-list-tbody");
      if (!tbody) return;
      try {
        const evResp = await fetch(
          `${SUPABASE_URL}/rest/v1/attendance_events?id=eq.${eventId}&select=event_name`, {
            headers: getSupabaseHeaders()
          }
        );
        const evData = await evResp.json();
        if (evData.length > 0) {
          const input = document.getElementById("attendance-event-name");
          if (input) input.value = evData[0].event_name;
        }
        const recResp = await fetch(
          `${SUPABASE_URL}/rest/v1/attendance_records?event_id=eq.${eventId}&select=n_int,attends,motive`, {
            headers: getSupabaseHeaders()
          }
        );
        const records = await recResp.json();
        const recordMap = {};
        records.forEach(r => {recordMap[r.n_int] = r;});
        tbody.querySelectorAll("tr:not(.quadro-header-row)").forEach(tr => {
          const n_int = parseInt(tr.children[0]?.textContent.trim(), 10);
          if (isNaN(n_int)) return;
          const rec = recordMap[n_int];
          if (!rec) return;
          const radioYes = tr.querySelector('.att-radio[value="sim"]');
          const radioNo = tr.querySelector('.att-radio[value="nao"]');
          const motiveInput = tr.querySelector('.att-motive');
          if (rec.attends === "sim" && radioYes) {
            radioYes.checked = true;
            if (motiveInput) {motiveInput.disabled = true; motiveInput.value = ""; motiveInput.style.background = "#f5f5f5"; motiveInput.style.color = "#999"; motiveInput.style.cursor = "not-allowed";}
          } else if (rec.attends === "nao" && radioNo) {
            radioNo.checked = true;
            if (motiveInput) {motiveInput.disabled = false; motiveInput.value = rec.motive || ""; motiveInput.style.background = ""; motiveInput.style.color = ""; motiveInput.style.cursor = "text";}
          }
        });
        updateAttendanceCounts(tbody);
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
        showPopup('popup-danger', "Erro ao carregar evento: " + err.message);
      }
    });
    /* ===== ELIMINAR EVENTO ===== */
    document.getElementById("attendance-list-delete")?.addEventListener("click", async () => {
      const eventName = document.getElementById("attendance-event-name")?.value.trim() || "";
      if (!eventName) {
        showPopup('popup-danger', "Nenhum evento selecionado para eliminar.");
        return;
      }
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      try {
        const checkResp = await fetch(
          `${SUPABASE_URL}/rest/v1/attendance_events?corp_oper_nr=eq.${corpOperNr}&event_name=eq.${encodeURIComponent(eventName)}&select=id`, {
            headers: getSupabaseHeaders()
          }
        );
        const existing = await checkResp.json();
        if (!existing.length) {
          showPopup('popup-danger', "Evento não encontrado na base de dados.");
          return;
        }
        const eventId = existing[0].id;
        await salocCheckRes(await fetch(
          `${SUPABASE_URL}/rest/v1/attendance_events?id=eq.${eventId}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        ), "Erro ao eliminar o evento");
        document.getElementById("attendance-event-name").value = "";
        const tbody = document.getElementById("attendance-list-tbody");
        if (tbody) {
          tbody.querySelectorAll("tr:not(.quadro-header-row)").forEach(tr => {
            tr.querySelectorAll('.att-radio').forEach(r => r.checked = false);
            const motiveInput = tr.querySelector('.att-motive');
            if (motiveInput) {motiveInput.value = ""; motiveInput.disabled = true; motiveInput.style.background = "#f5f5f5"; motiveInput.style.color = "#999";}
          });
          updateAttendanceCounts(tbody);
        }
        showPopup('popup-success', "Evento eliminado com sucesso!");
        await loadRecentAttendanceEvents();
      } catch (err) {
        console.error("Erro ao eliminar evento:", err);
        showPopup('popup-danger', "Erro ao eliminar: " + err.message);
      }
    });
    /* ===== PHONEBOOK SUB-MODULE VARIABLES ===== */
    let phonebookEditId = null;
    /* ===== PHONEBOOK INIT ===== */
    document.querySelector('.sidebar-sub-submenu-button[data-page="page-phonebook"]')?.addEventListener("click", () => {
      phonebookEditId = null;
      document.getElementById("phonebook-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
      ["phonebook-name", "phonebook-subcategory", "phonebook-phone", "phonebook-mobile", "phonebook-email", "phonebook-address", "phonebook-locality", "phonebook-zipcode", "phonebook-notes"]
        .forEach(id => {const el = document.getElementById(id); if (el) el.value = "";});
      document.getElementById("phonebook-type").value = "";
      document.getElementById("phonebook-category").value = "";
      document.getElementById("phonebook-availability").value = "";
      document.getElementById("phonebook-favorite").checked = false;
      document.getElementById("phonebook-delete").disabled = true;
      const formContainer = document.getElementById("phonebook-form-container");
      if (formContainer) formContainer.style.display = "none";
      loadPhonebookTable();
    });
    /* ===== PHONEBOOK SEARCH ===== */
    document.getElementById("phonebook-search")?.addEventListener("input", function() {
      const filter = this.value.toLowerCase().trim();
      const rows = document.querySelectorAll("#phonebook-tbody tr");
      rows.forEach(row => {
        if (row.querySelector('td[colspan]')) return;
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    });
    /* ===== PHONEBOOK LOAD TABLE ===== */
    async function loadPhonebookTable() {
      const tbody = document.getElementById("phonebook-tbody");
      if (!tbody) return;
      tbody.style.opacity = "0.5";
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/phonebook?corp_oper_nr=eq.${corpOperNr}&order=name.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar agenda");
        const data = await response.json();
        tbody.style.opacity = "1";
        if (!data.length) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:8px;font-size:12px;color:#999;">Sem registos</td></tr>`;
          document.getElementById("phonebook-total").textContent = "0";
          document.getElementById("phonebook-favorites").textContent = "0";
          return;
        }
        const tdStyle = `padding:5px;border:1px solid #ccc;font-size:13px;text-align:center;`;
        tbody.innerHTML = "";
        const sorted = [...data].sort((a, b) => {
          if (b.is_favorite - a.is_favorite) return b.is_favorite - a.is_favorite;
          return (a.name || "").localeCompare(b.name || "");
        });    
        sorted.forEach(item => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="${tdStyle}">${item.is_favorite ? "<i class='fa-solid fa-star' style='color:#f5b301'></i>" : ""}</td>
            <td style="${tdStyle} text-align:left; font-weight:bold;">${item.name || ""}</td>
            <td style="${tdStyle}">${item.contact_type || ""}</td>
            <td style="${tdStyle}">${item.category || ""}</td>
            <td style="${tdStyle}; font-weight: bold;">${item.phone || ""}</td>
            <td style="${tdStyle}">${item.mobile || ""}</td>
            <td style="${tdStyle}">${item.email || ""}</td>
            <td style="${tdStyle}">${item.availability || ""}</td>
            <td style="${tdStyle}">
              <button onclick="phonebookEdit(${item.id})" style="background:#1e3a8a;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;margin-right:3px;"><i class="fa-solid fa-pen"></i></button>
              <button onclick="phonebookDelete(${item.id})" style="background:#dc2626;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          `;
          tr.addEventListener("mouseover", () => tr.style.background = "#c8d8f5");
          tr.addEventListener("mouseout",  () => tr.style.background = "");
          tbody.appendChild(tr);
        });
        document.getElementById("phonebook-total").textContent = data.length;
        document.getElementById("phonebook-favorites").textContent = data.filter(i => i.is_favorite).length;
      } catch (err) {
        tbody.style.opacity = "1";
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:8px;font-size:12px;color:red;">Erro ao carregar dados.</td></tr>`;
        console.error("Erro ao carregar agenda:", err);
      }
    }
    /* ===== PHONEBOOK EDIT (CLICK NO LÁPIS) ===== */
    async function phonebookEdit(id) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/phonebook?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}&select=*`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar registo");
        const data = await response.json();
        if (!data.length) return;
        const item = data[0];
        const formContainer = document.getElementById("phonebook-form-container");
        if (formContainer) formContainer.style.display = "block";
        document.getElementById("phonebook-name").value = item.name || "";
        document.getElementById("phonebook-type").value = item.contact_type || "";
        document.getElementById("phonebook-category").value = item.category || "";
        document.getElementById("phonebook-subcategory").value = item.subcategory || "";
        document.getElementById("phonebook-phone").value = item.phone || "";
        document.getElementById("phonebook-mobile").value = item.mobile || "";
        document.getElementById("phonebook-email").value = item.email || "";
        document.getElementById("phonebook-availability").value = item.availability || "";
        document.getElementById("phonebook-favorite").checked = item.is_favorite || false;
        document.getElementById("phonebook-address").value = item.address || "";
        document.getElementById("phonebook-locality").value = item.locality || "";
        document.getElementById("phonebook-zipcode").value = item.zipcode || "";
        document.getElementById("phonebook-notes").value = item.notes || "";    
        phonebookEditId = id;
        document.getElementById("phonebook-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> ATUALIZAR";
        document.getElementById("phonebook-delete").disabled = false;
        document.getElementById("phonebook-name").focus();    
      } catch (err) {
        console.error("Erro ao editar contacto:", err);
        showPopup("popup-danger", "Erro ao carregar dados: " + err.message);
      }
    }
    /* ===== PHONEBOOK DELETE FUNÇÃO BASE ===== */
    async function phonebookDelete(id) {
      if (!confirm("Tem a certeza que pretende eliminar este contacto?")) return;
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/phonebook?id=eq.${id}&corp_oper_nr=eq.${corpOperNr}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao eliminar registo");
        showPopup("popup-success", "Contacto eliminado com sucesso!");
        phonebookEditId = null;
        document.getElementById("phonebook-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
        document.getElementById("phonebook-delete").disabled = true;
        ["phonebook-name", "phonebook-subcategory", "phonebook-phone", "phonebook-mobile", "phonebook-email", "phonebook-address", "phonebook-locality", "phonebook-zipcode", "phonebook-notes"]
          .forEach(id => {const el = document.getElementById(id); if (el) el.value = "";});
        document.getElementById("phonebook-type").value = "";
        document.getElementById("phonebook-category").value = "";
        document.getElementById("phonebook-availability").value = "";
        document.getElementById("phonebook-favorite").checked = false;
        const formContainer = document.getElementById("phonebook-form-container");
        if (formContainer) formContainer.style.display = "none";
        loadPhonebookTable();
      } catch (err) {
        console.error("Erro ao eliminar contacto:", err);
        showPopup("popup-danger", "Erro ao eliminar: " + err.message);
      }
    }
    /* ===== PHONEBOOK SAVE / UPDATE (AÇÃO DO BOTÃO GRAVAR) ===== */
    async function phonebookSave() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
      const name = document.getElementById("phonebook-name").value.trim();
      if (!name) {
        showPopup("popup-danger", "Preencha pelo menos o Nome / Designação.");
        return;
      }
      const payload = {name, contact_type: document.getElementById("phonebook-type").value, category: document.getElementById("phonebook-category").value,
                       subcategory: document.getElementById("phonebook-subcategory").value.trim(), phone: document.getElementById("phonebook-phone").value.trim(),
                       mobile: document.getElementById("phonebook-mobile").value.trim(), email: document.getElementById("phonebook-email").value.trim(),
                       availability: document.getElementById("phonebook-availability").value, is_favorite: document.getElementById("phonebook-favorite").checked,
                       address: document.getElementById("phonebook-address").value.trim(), locality: document.getElementById("phonebook-locality").value.trim(),
                       zipcode: document.getElementById("phonebook-zipcode").value.trim(), notes: document.getElementById("phonebook-notes").value.trim()
                      };
      const saveBtn = document.getElementById("phonebook-save");
      saveBtn.disabled = true;
      saveBtn.innerHTML = "A guardar...";
      try {
        let response;
        if (phonebookEditId !== null) {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/phonebook?id=eq.${phonebookEditId}&corp_oper_nr=eq.${corpOperNr}`, {
              method: "PATCH",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify(payload)
            }
          );
          if (!response.ok) throw new Error("Erro ao atualizar: " + await response.text());
          showPopup("popup-success", "Contacto atualizado com sucesso!");
          phonebookEditId = null;
        } else {
          response = await fetch(`${SUPABASE_URL}/rest/v1/phonebook`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
            body: JSON.stringify({...payload, corp_oper_nr: corpOperNr})
          });
          if (!response.ok) throw new Error("Erro ao guardar: " + await response.text());
          showPopup("popup-success", "Contacto guardado com sucesso!");
        }
        ["phonebook-name", "phonebook-subcategory", "phonebook-phone", "phonebook-mobile", "phonebook-email", "phonebook-address", "phonebook-locality", "phonebook-zipcode", "phonebook-notes"]
          .forEach(id => {const el = document.getElementById(id); if (el) el.value = "";});
        document.getElementById("phonebook-type").value = "";
        document.getElementById("phonebook-category").value = "";
        document.getElementById("phonebook-availability").value = "";
        document.getElementById("phonebook-favorite").checked = false;
        document.getElementById("phonebook-delete").disabled = true;
        const formContainer = document.getElementById("phonebook-form-container");
        if (formContainer) formContainer.style.display = "none";
        loadPhonebookTable();
      } catch (err) {
        console.error("Erro ao guardar contacto:", err);
        showPopup("popup-danger", "Erro ao guardar: " + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = phonebookEditId !== null ? "<i class='fa-solid fa-floppy-disk'></i> ATUALIZAR" : "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
      }
    }
    /* ===== EVENT LISTENERS PRINCIPAIS ===== */
    document.getElementById("phonebook-save")?.addEventListener("click", phonebookSave);
    document.getElementById("phonebook-add")?.addEventListener("click", () => {
      phonebookEditId = null;
      document.getElementById("phonebook-save").innerHTML = "<i class='fa-solid fa-floppy-disk'></i> GRAVAR";
      document.getElementById("phonebook-delete").disabled = true;
      ["phonebook-name", "phonebook-subcategory", "phonebook-phone", "phonebook-mobile", "phonebook-email", "phonebook-address", "phonebook-locality", "phonebook-zipcode", "phonebook-notes"]
        .forEach(id => {const el = document.getElementById(id); if (el) el.value = "";});
      document.getElementById("phonebook-type").value = "";
      document.getElementById("phonebook-category").value = "";
      document.getElementById("phonebook-availability").value = "";
      document.getElementById("phonebook-favorite").checked = false;
      const formContainer = document.getElementById("phonebook-form-container");
      if (formContainer) formContainer.style.display = "block";
      document.getElementById("phonebook-name").focus();
    });
    document.getElementById("phonebook-delete")?.addEventListener("click", () => {
      if (phonebookEditId) phonebookDelete(phonebookEditId);
    });
    /* =======================================
    ALARM CONSOLE
    ======================================= */
    async function fetchRegElemsFromSupabase() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name,n_int,elem_state&order=n_int.asc`, {
            method: 'GET',
            headers: getSupabaseHeaders(),
          }
        );
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        const filteredData = data.filter(item => {
          const num = parseInt(item.n_int);
          const isForbiddenRange = num >= 900 && num <= 999;
          return (
            item.abv_name !== "Cargo Aberto" && item.elem_state === true &&  !isForbiddenRange
          );
        });
        return filteredData;
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return [];
      }
    }
    async function populateIndivSelect(select) {
      const elems = await fetchRegElemsFromSupabase();
      elems.sort((a, b) => (a.n_int || 9999) - (b.n_int || 9999));
      select.innerHTML = '<option value=""></option>';
      elems.forEach(elem => {
        const option = document.createElement('option');
        option.value = elem.abv_name;
        option.textContent = `${elem.n_int} - ${elem.abv_name}`;
        select.appendChild(option);
      });
    }
    const soundKeys = {'ca-indiv-pv': 'PV', 'ca-indiv-cc': 'CC', 'ca-indiv-sb': 'SB', 'ca-indiv-gch': 'GCH', 'ca-indiv-gcm': 'GCM',
                       'ca-glob-pv': 'PV', 'ca-glob-sb': 'SB', 'ca-glob-sn': 'SN', 'ca-glob-gch': 'GCH', 'ca-glob-gcm': 'GCM'};
    let selectedButton = null;
    let isPlaying = false;
    function setupButtonContainer(containerId, otherContainerIds = []) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.querySelectorAll('button').forEach(btn => {
        if (btn.id.includes('call')) return;
        btn.addEventListener('click', () => {
          if (isPlaying) {
            showPopup('popup-danger', "Aguarde até o som atual terminar!");
            return;
          }
          const wasActive = btn.classList.contains('active');
          container.querySelectorAll('button').forEach(b => {
            if (!b.id.includes('call')) b.classList.remove('active');
          });
          otherContainerIds.forEach(otherId => {
            const otherContainer = document.getElementById(otherId);
            if (otherContainer) {
              otherContainer.querySelectorAll('button').forEach(b => {
                if (!b.id.includes('call')) b.classList.remove('active');
              });
            }
          });
          if (!wasActive) {
            btn.classList.add('active');
            selectedButton = btn.id;
          } else {
            selectedButton = null;
          }
        });
      });
    }
    function disableAllControls(disabled) {
      document
        .querySelectorAll('#alarm-console-indiv button, #alarm-console-group button, #alarm-console-internal button')
        .forEach(btn => (btn.disabled = disabled));
      const selects = ['ca-indiv-catch', 'ca-group-catch'];
      selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = disabled;
      });
    }
    function playSelectedSound(selectId) {
      if (isPlaying) {
        showPopup('popup-danger', "Aguarde até o som atual terminar!");
        return;
      }
      const select = document.getElementById(selectId);
      if (!select) return;
      const elementLabel = select.options[select.selectedIndex]?.text || "";
      let selectedElement = select.value.trim();
      if (!selectedButton) return showPopup('popup-danger', "Selecione uma opção de chamada!");
      if (!selectedElement) return showPopup('popup-danger', "Selecione um elemento!");
      if (selectedElement.includes('-')) {
        selectedElement = selectedElement.split('-').slice(1).join('-').trim();
      }
      const soundKey = soundKeys[selectedButton];
      if (!soundKey) return showPopup('popup-danger', "Opção de chamada inválida!");
      const fileName = `${selectedElement}_${soundKey}.mp3`;
      const baseUrl = 'https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/sounds/Internal/';
      const btnTipo = document.getElementById(selectedButton);
      const btnPlay = (selectId === 'ca-indiv-catch')
        ? document.getElementById('ca-call-indiv')
        : document.getElementById('ca-call-group');
      const allContainers = document.querySelectorAll('#cons-indiv, #cons-group, #cons-internal');
      const originalPlayText = btnPlay ? btnPlay.textContent : "CHAMAR";
      isPlaying = true;
      disableAllControls(true);
      if (btnTipo) btnTipo.classList.add('is-transmitting');
      if (btnPlay) {
        btnPlay.classList.add('is-transmitting');
        btnPlay.textContent = `A CHAMAR: ${elementLabel}`;
      }
      allContainers.forEach(c => c.classList.add('console-dimmed'));
      const resetConsole = () => {
        if (btnTipo) btnTipo.classList.remove('is-transmitting');
        if (btnPlay) {
          btnPlay.classList.remove('is-transmitting');
          btnPlay.textContent = originalPlayText;
        }
        allContainers.forEach(c => c.classList.remove('console-dimmed'));
        document.querySelectorAll('.active').forEach(b => b.classList.remove('active'));
        selectedButton = null;
        if (select) select.value = '';
        disableAllControls(false);
        isPlaying = false;
      };
      fetch(`${baseUrl}${fileName}`, {method: 'HEAD'})
        .then(response => {
        if (!response.ok) {
          showPopup('popup-danger', `Ficheiro "${fileName}" não encontrado!`);
          resetConsole();
          return;
        }
        const audio1 = new Audio(`${baseUrl}init_call.mp3`);
        audio1.onerror = () => {resetConsole(); showPopup('popup-danger', "Erro: init_call.mp3");};
        audio1.play();
        audio1.onended = () => {
          const audio2 = new Audio(`${baseUrl}${fileName}`);
          audio2.onerror = () => {resetConsole(); showPopup('popup-danger', "Erro no ficheiro de voz");};
          audio2.play();
          audio2.onended = () => {
            const audio3 = new Audio(`${baseUrl}init_call.mp3`);
            audio3.play();
            audio3.onended = resetConsole;
          };
        };
      })
        .catch(() => {
        showPopup('popup-danger', "Erro de ligação ao servidor!");
        resetConsole();
      });
    }
    window.addEventListener('load', () => {
      const select = document.getElementById('ca-indiv-catch');
      if (select) populateIndivSelect(select);
      setupButtonContainer('alarm-console-indiv', ['alarm-console-group', 'cons-internal']);
      setupButtonContainer('alarm-console-group', ['alarm-console-indiv', 'cons-internal']);
      const callIndivBtn = document.getElementById('ca-call-indiv');
      if (callIndivBtn) {
        callIndivBtn.addEventListener('click', () => playSelectedSound('ca-indiv-catch'));
      }
      const callGroupBtn = document.getElementById('ca-call-group');
      if (callGroupBtn) {
        callGroupBtn.addEventListener('click', () => playSelectedSound('ca-group-catch'));
      }
      const internalSoundKeys = {'ca-format': 'Formatura', 'ca-alvor': 'Alvorada'};
      document.querySelectorAll('#cons-internal button').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = internalSoundKeys[btn.id];
          if (!key) return;
          if (isPlaying) {
            showPopup('popup-danger', "Aguarde até o som atual terminar!");
            return;
          }
          const originalText = btn.textContent;
          isPlaying = true;
          disableAllControls(true);
          btn.classList.add('is-transmitting');
          btn.textContent = `A REPRODUZIR: ${key.toUpperCase()}`;
          document.querySelectorAll('#cons-indiv, #cons-group').forEach(c => c.classList.add('console-dimmed'));
          const audio = new Audio(`https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/sounds/Internal/${key}.mp3`);
          const finalizeInternal = () => {
            btn.classList.remove('is-transmitting');
            btn.textContent = originalText;
            document.querySelectorAll('.console-dimmed').forEach(c => c.classList.remove('console-dimmed'));
            disableAllControls(false);
            isPlaying = false;
          };
          audio.onerror = () => {
            showPopup('popup-danger', `Som "${key}" não encontrado!`);
            finalizeInternal();
          };
          audio.play();
          audio.onended = finalizeInternal;
        });
      });
    });
