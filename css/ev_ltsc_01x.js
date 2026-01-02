/* ============================================================
   CARD 1: CRIAÇÃO DE EVENTOS (.admin-container-event)
   ============================================================ */

.admin-container-event {
    padding: 12px !important;
}

.admin-container-event .row-event {
    display: flex;
    gap: 8px;
    margin-bottom: 12px !important;
    align-items: flex-end;
    width: 100%;
}

.admin-container-event .form-group-event {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.admin-container-event label {
    display: block;
    font-size: 10px;
    font-weight: bold;
    color: #555;
    text-transform: uppercase;
    margin-bottom: 3px !important; 
}

.admin-container-event input, 
.admin-container-event select {
    height: 25px;
    font-size: 12px;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 0 8px;
    background: #fff;
    box-sizing: border-box;
    width: 100%;
}

.admin-container-event .turnos-wrapper {
    margin-top: 15px !important;
    padding: 12px;
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 4px;
}

.admin-container-event .turnos-title {
    font-size: 11px;
    font-weight: bold;
    color: #444;
    border-bottom: 1px solid #ddd;
    margin-bottom: 12px !important;
    padding-bottom: 4px;
    display: block;
    text-transform: uppercase;
}

.admin-container-event #shiftsList {
    max-height: 320px;
    overflow-y: auto;
    margin-bottom: 10px;
    padding-right: 5px;
}

.admin-container-event #shiftsList::-webkit-scrollbar { width: 5px; }
.admin-container-event #shiftsList::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }

.admin-container-event .shift-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    margin-bottom: 3px;
    background: #fff;
    padding: 4px;
    border-radius: 3px;
    border: 1px solid #f0f0f0;
}

.admin-container-event .shift-item div { display: flex; align-items: center; gap: 5px; }
.admin-container-event .shift-item label { margin: 0 !important; color: #888; text-transform: none; font-size: 10px; }
.admin-container-event .shift-item input { height: 24px; width: auto; }
.admin-container-event .shift-date { width: 115px !important; }
.admin-container-event .shift-start-time, 
.admin-container-event .shift-end-time { width: 80px !important; }

.admin-container-event .remove-btn {
    background: #fff5f5;
    border: 1px solid #ffcccc;
    color: red;
    width: 22px;
    height: 22px;
    cursor: pointer;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
}

.admin-container-event .add-shift-btn {
    background: #fff;
    border: 1px dashed #bbb;
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 3px;
    cursor: pointer;
    color: #666;
}

/* ============================================================
   CARD 2: CONSULTA DE DISPONIBILIDADES (.admin-container-disp)
   ============================================================ */

.admin-container-disp {
    padding: 10px !important;
}

.admin-container-disp table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
    background: #fff;
}

.admin-container-disp th {
    background: #f1f3f5;
    padding: 8px 5px;
    border: 1px solid #dee2e6;
    text-align: center;
    font-size: 11px;
    text-transform: uppercase;
    color: #495057;
}

.admin-container-disp td {
    padding: 6px 5px;
    border: 1px solid #dee2e6;
    text-align: center;
    font-size: 12px;
    color: #333;
}

/* --- Lógica de Expansão Corrigida --- */
.admin-container-disp .expandable, 
.admin-container-disp .expandable-row {
    display: none; /* Removido o !important para permitir o toggle via classe */
}

/* Esta classe será adicionada pelo JS para mostrar a linha */
.admin-container-disp .expandable-row.is-visible {
    display: table-row !important;
}

.admin-container-disp .details-content {
    padding: 10px;
    border: 1px inset #eee;
    background: #ffffff;
    margin: 5px;
    border-radius: 4px;
}

.admin-container-disp .row-full {
    background-color: #f8f9fa !important;
    color: #adb5bd;
}

/* Botões Principais */
.admin-container-disp .view-btn, 
.admin-container-disp .delete-event-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 12px;
    font-size: 11px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
}

.admin-container-disp .view-btn { background: #1976d2; color: white; }
.admin-container-disp .delete-event-btn { background: #ce1212; color: white; }
.admin-container-disp .view-btn.close-btn { background: #6c757d; }

/* Botões de Ação Internos */
.admin-container-disp .action-btn-container { display: flex; gap: 4px; justify-content: center; }
.admin-container-disp .action-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
    font-weight: bold;
}

.admin-container-disp .approve-btn { background: #2e7d32; color: white; }
.admin-container-disp .reject-btn { background: #e53935; color: white; }

/* Status Badges */
.admin-container-disp .status-badge {
    padding: 3px 8px;
    border-radius: 10px;
    color: white;
    font-weight: bold;
    font-size: 10px;
    display: inline-block;
    min-width: 80px;
    text-align: center;
}

.admin-container-disp .bg-aprovado { background-color: #2e7d32 !important; }
.admin-container-disp .bg-rejeitado { background-color: #e53935 !important; }
.admin-container-disp .bg-pendente { background-color: #7f0000 !important; }
.admin-container-disp .bg-default { background-color: #6c757d; }

.admin-container-disp .table-responsive-event { overflow-x: auto; }
