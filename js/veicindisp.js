/* ==============================
GRUPO INDISPONIBILIDADES
============================== */
/* ---- CRIAÇÃO DE MENSAGEM DE VEÍCULOS INDISPONÍVEIS ---- */
let lastUnavailabilityData = null;
async function generateNewUnvailability() {
let vehicle = document.getElementById('new_vehicle_unavailable')?.value || '';
const startDate = document.getElementById('new_unavailability_date')?.value || '';
const startHour = document.getElementById('new_unavailability_hour')?.value || '';
const motive = document.getElementById('new_reason_unavailability')?.value || '';
const local = document.getElementById('new_unavailability_local')?.value || '';
if (!vehicle || !startDate || !startHour || !motive || !local) {
showPopupWarning("Preencha todos os campos obrigatórios!");
return '';
}
if (vehicle === 'ABSC-02') {
vehicle = 'INEM-Reserva';
} else if (vehicle === 'ABSC-01' || vehicle === 'ABSC-03') {
vehicle = 'INEM';
}
const gdh = formatGDH(startDate, startHour);
const currentData = {
vehicle,
startDate,
startHour,
motive,
local
};
try {
const query = `vehicle=eq.${encodeURIComponent(vehicle)}&start_unavailability_date=eq.${encodeURIComponent(startDate)}&start_unavailability_hour=eq.${encodeURIComponent(startHour)}`;
const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?${query}`, {
headers: getSupabaseHeaders()
});
const existing = await checkResp.json();
console.log("🔍 Query usada:", query);
console.log("📦 Resposta Supabase:", existing);
if (existing.length > 0) {
showPopupWarning("Já existe um registo de indisponibilidade para este veículo com as mesmas caractisticas.");
return '';
}
} catch (e) {
console.error("❌ Erro ao verificar Supabase:", e);
showPopupWarning("Erro ao verificar indisponibilidades.");
return '';
}
lastUnavailabilityData = currentData;
let message = '';
if (motive === "Pausa para Alimentação") {
message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\n${motive}, ${local}, ${gdh}`;
} else if (motive === "Falta de Macas" || motive === "Aguarda Triagem") {
message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nRetido(a) por: ${motive}, ${local}, ${gdh}`;
} else {
message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nInoperacional por: ${motive}, ${local}, ${gdh}.`;
}
const out = document.getElementById('wsms_output');
if (out) out.value = message;
if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
showPopupSuccess("Mensagem criada com sucesso! Abra o WhatsApp e prima CTRL+V", true);
await saveUnavailabilityToSupabase(currentData);
loadActiveUnavailability();
return message;
}
/* ---- GRAVAÇÃO DE VEÍCULOS INDISPONÍVEIS EM DB ---- */
async function saveUnavailabilityToSupabase(data) {
try {
const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability`, {
method: 'POST',
headers: {
'apikey': SUPABASE_ANON_KEY,
'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
'Content-Type': 'application/json',
'Prefer': 'return=representation'
},
body: JSON.stringify({
vehicle: data.vehicle,
start_unavailability_date: data.startDate,
start_unavailability_hour: data.startHour,
unavailability_motive: data.motive,
status: "Em Aberto",
})
});
const inserted = await insertResp.json();
console.log("🚚 Indisponibilidade gravada:", inserted);
return inserted;
} catch (e) {
console.error("❌ Erro inesperado:", e);
showPopupWarning("Erro inesperado ao gravar indisponibilidade.");
return null;
}
}

/* ==============================
BLINK — INDISPONIBILIDADES
============================== */
let blinkIntervalUnavailability = null;

function startBlinkingUnavailabilityButton() {
const btn = document.querySelector('.sidebar-menu-button[data-page="page-indisp"]');
if (!btn || blinkIntervalUnavailability) return;

const originalColor = '#343A40';
const activeColor = '#DC3545';
let isOriginal = false;

blinkIntervalUnavailability = setInterval(() => {
btn.style.backgroundColor = isOriginal ? originalColor : activeColor;
isOriginal = !isOriginal;
}, 900);
}

function stopBlinkingUnavailabilityButton() {
const btn = document.querySelector('.sidebar-menu-button[data-page="page-indisp"]');
if (!btn) return;

clearInterval(blinkIntervalUnavailability);
blinkIntervalUnavailability = null;
btn.style.backgroundColor = '';
}

async function tableUnavailabilityHasData() {
const tbody = document.getElementById('active-unavailability-tbody');
if (!tbody) return false;
return Array.from(tbody.rows).some(row => !row.querySelector('td[colspan]'));
}

async function updateUnavailabilityBlinking() {
if (await tableUnavailabilityHasData()) {
startBlinkingUnavailabilityButton();
} else {
stopBlinkingUnavailabilityButton();
}
}

/* chama logo ao carregar */
loadActiveUnavailability().then(() => updateUnavailabilityBlinking());

/* verifica a cada 1s */
setInterval(updateUnavailabilityBlinking, 1000);

async function loadActiveUnavailability() {
const tbody = document.getElementById('active-unavailability-tbody');
if (!tbody) return;
try {
const resp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?status=eq.Em%20Aberto`, {
headers: getSupabaseHeaders()
});
const data = await resp.json();
tbody.innerHTML = '';
if (data.length === 0) {
tbody.innerHTML = `
<tr>
  <td colspan="8" style="padding: 30px; text-align: center; color: #6C757D;">
    Não existem veículos indisponíveis neste momento.
  </td>
</tr>`;
return;
}

function formatDateDisplay(dateTimeStr) {
if (!dateTimeStr) return '';
const [datePart, timePart] = dateTimeStr.split(' ');
const [year, month, day] = datePart.split('-');
return `${day}/${month}/${year} ${timePart}`;
}
data.forEach(item => {
const tr = document.createElement('tr');
const dateHour = formatDateDisplay(`${item.start_unavailability_date} ${item.start_unavailability_hour}`);
tr.innerHTML = `
<td style="text-align:center; border: 1px solid #DEE2E6;">${dateHour}</td>
<td style="text-align:center; border: 1px solid #DEE2E6;">${item.vehicle}</td>
<td style="text-align:center; border: 1px solid #DEE2E6;">${item.unavailability_motive}</td>
<td style="text-align:center; border: 1px solid #DEE2E6;">${item.status}</td>
<td style="text-align:center; border: 1px solid #DEE2E6;">
  <button class="btn btn-danger btn-sm finalize-btn">Finalizar Indisponibilidade</button>
</td>
`;
const finalizeBtn = tr.querySelector('.finalize-btn');
finalizeBtn.addEventListener('click', () => {
document.getElementById('end_vehicle_unavailable').value = item.vehicle;
document.getElementById('end_reason_unavailability').value = item.unavailability_motive;
const endCard = document.getElementById('availability-card');
if (endCard) {
endCard.style.display = 'block';
}
});
tbody.appendChild(tr);
});
} catch (e) {
console.error("Erro ao carregar indisponibilidades:", e);
showPopupWarning("❌ Erro ao carregar indisponibilidades em aberto.");
}
}
/* ---- CRIAÇÃO DE MENSAGEM DE FIM DE INDISPONIBILIDADE DE VEÍCULOS E REMOÇÃO EM DB ---- */
async function generateEndUnavailability() {
const vehicle = document.getElementById('end_vehicle_unavailable')?.value || '';
const motive = document.getElementById('end_reason_unavailability')?.value || '';
const endDateField = document.getElementById('end_unavailability_date')?.value;
const endHourField = document.getElementById('end_unavailability_hour')?.value;
const endCard = document.querySelector('.card.last-card');
if (!vehicle || !motive || !endDateField || !endHourField) {
showPopupWarning("Preencha os campos obrigatórios!");
return '';
}
try {
const query = `vehicle=eq.${encodeURIComponent(vehicle)}&unavailability_motive=eq.${encodeURIComponent(motive)}&status=eq.Em%20Aberto`;
const resp = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?${query}`, {
headers: getSupabaseHeaders()
});
const data = await resp.json();
if (data.length === 0) {
showPopupWarning("Não foi encontrada indisponibilidade em aberto para este veículo.");
return '';
}
const record = data[0];
const startDateTime = new Date(`${record.start_unavailability_date}T${record.start_unavailability_hour}`);
const endDateTime = new Date(`${endDateField}T${endHourField}`);
const diffMs = endDateTime - startDateTime;
const hours = Math.floor(diffMs / (1000 * 60 * 60));
const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
const timeUnavailable = `${padNumber(hours)}h${padNumber(minutes)}m`;
const gdhEnd = formatGDH(endDateField, endHourField);
let displayName = vehicle;
if (vehicle === "ABSC-02") {
displayName = "INEM-Reserva";
} else if (vehicle === "ABSC-01" || vehicle === "ABSC-03") {
displayName = "INEM";
}
let message = '';
if (motive === "Pausa para Alimentação") {
message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nFim de: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
} else if (motive === "Falta de Macas" || motive === "Aguarda Triagem") {
message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nFim de Retenção por: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
} else {
message = `*🚨INFORMAÇÃO🚨*\n\n*${vehicle}:*\nFim de Inoperacionalidade por: ${motive}, ${gdhEnd}.\nTempo Indisponível: ${timeUnavailable}.`;
}
const out = document.getElementById('wsms_output');
if (out) out.value = message;
if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message).catch(() => {});
showPopupSuccess(true);
await fetch(`${SUPABASE_URL}/rest/v1/vehicle_unavailability?id=eq.${record.id}`, {
method: 'DELETE',
headers: getSupabaseHeaders()
});
console.log("✅ Indisponibilidade finalizada e removida:", record);
const endCard = document.getElementById('availability-card');
if (endCard) {
endCard.style.display = 'none';
}
loadActiveUnavailability();
return message;
} catch (e) {
console.error("❌ Erro ao gerar fim de indisponibilidade:", e);
showPopupWarning("Erro ao gerar mensagem de fim de indisponibilidade.");
return '';
}
}
document.addEventListener('DOMContentLoaded', () => {
loadActiveUnavailability();
});
