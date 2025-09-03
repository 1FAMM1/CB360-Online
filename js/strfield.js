/* ==============================
GRUPO UTILITÁRIOS
============================== */
/* ---- TRATAMENTO SCROLL BAR ----*/
function showPageAndResetScroll(pageId, {
smooth = false
} = {}) {
document.querySelectorAll('.page').forEach(p => {
p.classList.remove('active');
p.style.display = 'none';
});
const page = document.getElementById(pageId);
if (!page) return;
page.style.display = 'block';
page.classList.add('active');
requestAnimationFrame(() => {
const main = document.querySelector('.main-content');
if (main) {
if (smooth) main.scrollTo({
top: 0,
behavior: 'smooth'
});
else main.scrollTop = 0;
}
if (page.scrollTop !== undefined) {
if (smooth) page.scrollTo({
top: 0,
behavior: 'smooth'
});
else page.scrollTop = 0;
}
if (smooth) window.scrollTo({
top: 0,
behavior: 'smooth'
});
else window.scrollTo(0, 0);
clearFormFields();
});
}
document.addEventListener('DOMContentLoaded', () => {
document.querySelectorAll('.sidebar-menu-button[data-page]').forEach(btn => {
btn.addEventListener('click', (e) => {
const pageId = btn.getAttribute('data-page');
if (!pageId) return;
showPageAndResetScroll(pageId, {
smooth: false
});
document.querySelectorAll('.sidebar-menu-button').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
});
});
});
/* ---- NAVEGAÇÃO DA SIDEBAR ----*/
document.addEventListener("DOMContentLoaded", () => {
const buttons = document.querySelectorAll(".sidebar-menu-button");
const pages = document.querySelectorAll(".page");

function hideAllPages() {
pages.forEach(p => p.classList.remove("active"));
}

function removeActiveFromButtons() {
buttons.forEach(btn => btn.classList.remove("active"));
}
buttons.forEach(btn => {
btn.addEventListener("click", () => {
hideAllPages();
removeActiveFromButtons();
btn.classList.add("active");
const page = document.getElementById(btn.getAttribute("data-page"));
if (page) page.classList.add("active");
// === AQUI ===
// Se clicou em "📱 Utilitários", ativa o painel EPE/PPI
if (btn.getAttribute("data-page") === "page-utilities") {
const epeButton = document.querySelector('.panel-menu-button[onclick*="showPanelCard(\'epe\'"]');
if (epeButton) epeButton.click();
loadVehiclesFromAPI()
loadInfosFromSupabase()
}
});
});
});
/* ---- OBTENÇÃO E FORMATAÇÃO DE DATAS ----*/
function padNumber(num) {
return String(num).padStart(2, '0');
}

function getCurrentDateStr() {
const d = new Date();
return `${d.getFullYear()}-${padNumber(d.getMonth()+1)}-${padNumber(d.getDate())}`;
}

function formatGDH(dateStr, timeStr) {
if (!dateStr || !timeStr) return '';
const date = new Date(dateStr + 'T' + timeStr);
const day = padNumber(date.getDate());
const hours = padNumber(date.getHours());
const minutes = padNumber(date.getMinutes());
const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const month = monthNames[date.getMonth()];
const year = String(date.getFullYear()).slice(-2);
return `${day} *${hours}${minutes}* ${month}${year}`;
}
/* ---- CARREGAMENTO DE DADOS PARA CAMPOS ---- */
/* --- Carregamento de Veículos ---*/
async function fetchVehiclesFromSupabase() {
try {
const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?select=vehicle`, {
headers: getSupabaseHeaders()
});
if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
const vehicles = await response.json();
return vehicles.map(vehicle => vehicle.vehicle);
} catch (error) {
console.error('Erro ao carregar veículos do Supabase:', error);
return fallbackVehicles;
}
}
async function populateVehicleSelects() {
const vehicleSelects = document.querySelectorAll('.vehicle-field select, .vehicle-field-horizontal select');
vehicleSelects.forEach(select => {
select.innerHTML = '<option></option>';
});
let vehicles = await fetchVehiclesFromSupabase();
vehicles.sort((a, b) => a.localeCompare(b, 'pt', {
sensitivity: 'base'
}));
vehicleSelects.forEach(select => {
select.innerHTML = '<option value=""></option>';
vehicles.forEach(vehicle => {
const option = document.createElement('option');
option.value = vehicle;
option.textContent = vehicle;
select.appendChild(option);
});
});
}
/* --- Tratamento Tipo de Ocorrência --- */
async function fetchClassOccorrById(classId) {
try {
const response = await fetch(`${SUPABASE_URL}/rest/v1/class_occorr?select=occorr_descr&class_occorr=eq.${encodeURIComponent(classId)}`, {
headers: getSupabaseHeaders()
});
if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
const data = await response.json();
return data.length > 0 ? data[0].occorr_descr : '';
} catch (error) {
console.error("Erro ao buscar descrição da classe:", error);
return '';
}
}
const classOccorrInput = document.getElementById('class_occorr_input');
if (classOccorrInput) {
classOccorrInput.addEventListener('input', async (e) => {
const classId = e.target.value.trim();
const descrInput = document.getElementById('occorr_descr_input');
if (!classId) {
descrInput.value = '';
return;
}
const descr = await fetchClassOccorrById(classId);
descrInput.value = descr;
});
}
/* --- Carregamento de Concelhos --- */
async function fetchCouncilsFromSupabase() {
try {
const resp = await fetch(`${SUPABASE_URL}/rest/v1/councils_select?select=id,council`, {
headers: getSupabaseHeaders()
});
if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
const councils = await resp.json();
return councils.map(c => ({
id: c.id,
name: c.council
}));
} catch (e) {
console.error("Erro ao buscar concelhos:", e);
return fallbackCouncils;
}
}
async function populateCouncilSelect() {
const sel = document.getElementById('council_select');
if (!sel) return;
sel.innerHTML = '<option></option>';
const councils = (await fetchCouncilsFromSupabase()).sort((a, b) =>
a.name.localeCompare(b.name, 'pt', {
sensitivity: 'base'
})
);
sel.innerHTML = '<option></option>';
councils.forEach(c => {
const o = document.createElement('option');
o.value = c.id;
o.textContent = c.name;
sel.appendChild(o);
});
if (sel.value) {
populateParishes(sel.value);
}
}
/* --- Carregamento de Freguesias ---*/
async function fetchParishesByCouncil(councilId) {
if (!councilId) return [];
try {
const resp = await fetch(`${SUPABASE_URL}/rest/v1/parishes_select?select=parish&council_id=eq.${councilId}`, {
headers: getSupabaseHeaders()
});
if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
const parishes = await resp.json();
return parishes.map(p => p.parish);
} catch (e) {
console.error("Erro ao buscar freguesias:", e);
return fallbackParishes[councilId] || [];
}
}
async function populateParishes(councilId) {
const sel = document.getElementById('parish_select');
if (!sel) return;
sel.innerHTML = '';
const parishes = (await fetchParishesByCouncil(councilId)).sort((a, b) =>
a.localeCompare(b, 'pt', {
sensitivity: 'base'
})
);
sel.innerHTML = '';
parishes.forEach(p => {
const o = document.createElement('option');
o.value = p;
o.textContent = p;
sel.appendChild(o);
});
}
document.addEventListener('DOMContentLoaded', () => {
const councilSelect = document.getElementById('council_select');
if (councilSelect) {
populateCouncilSelect();
councilSelect.addEventListener('change', async (e) => {
const councilId = e.target.value;
const parishSelect = document.getElementById('parish_select');
if (!councilId) {
parishSelect.innerHTML = '<option value=""></option>';
return;
}
await populateParishes(councilId);
});
}
});
/* --- Carregamento de Parâmetros Globais ---*/
async function fetchGlobalOptions(category) {
try {
const resp = await fetch(`${SUPABASE_URL}/rest/v1/static_options?select=value&category=eq.${category}`, {
headers: getSupabaseHeaders()
});
if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
const data = await resp.json();
return data.map(d => d.value).filter(v => v); // ignora nulos
} catch (e) {
console.error(`Erro ao buscar opções de ${category}:`, e);
return [];
}
}
async function populateGlobalSelects() {
const globalFields = [{id: 'alert_type', category: 'alert_type'},
{id: 'alert_source', category: 'alert_source'},
{id: 'channel_maneuver', category: 'channel_maneuver'},
{id: 'ppi_type', category: 'ppi_type'},
{id: 'solicitation_type', category: 'solicitation_type'},
{id: 'solicitation_motive', category: 'solicitation_motive'},
{id: 'solicitation_shift', category: 'solicitation_shift'},
{id: 'new_reason_unavailability', category: 'reason_unavailability'},
{id: 'new_unavailability_local', category: 'local_unavailability'},
{id: 'state_municipality_grid', category: 'municipality_grid'}];
const victimCategories = ['victim_gender', 'victim_age', 'victim_type', 'victim_status'];
const victimsCount = 3;
const victimFields = [];
for (let i = 1; i <= victimsCount; i++) { for (let cat of victimCategories) { const fieldId=`victim_${i}_${cat.split('_')[1]}`; victimFields.push({ id: fieldId, category: cat }); } } const allFields=[...globalFields, ...victimFields]; for (let f of allFields) { const select=document.getElementById(f.id); if (!select) { console.warn(`Select com id "${f.id}" não encontrado.`); continue; } select.innerHTML='<option></option>' ; const options=await fetchGlobalOptions(f.category); options.forEach(opt=> {
  const o = document.createElement('option');
  o.value = opt;
  o.textContent = opt;
  select.appendChild(o);
  });
  }
  }
  document.addEventListener('DOMContentLoaded', populateGlobalSelects);
  /* ---- POPUPUS E AVISOS ----*/
  function showPopupMissingFields(fields) {
  const modal = document.getElementById('popup-modal');
  const list = document.getElementById('missing-fields-list');
  if (!modal || !list) return;
  list.innerHTML = '';
  fields.forEach(f => {
  const li = document.createElement('li');
  li.textContent = f;
  list.appendChild(li);
  });
  modal.classList.add('show');
  const okBtn = document.getElementById('popup-ok-btn');
  if (okBtn) okBtn.onclick = () => modal.classList.remove('show');
  }

  function showPopupSuccess(message = "", clearFields = false) {
  const modal = document.getElementById('popup-success-modal');
  if (!modal) return;
  const textElem = modal.querySelector('p');
  if (textElem) textElem.textContent = message;
  modal.classList.add('show');
  const okBtn = document.getElementById('popup-success-ok-btn');
  if (okBtn) {
  okBtn.onclick = () => {
  modal.classList.remove('show');
  if (clearFields) clearFormFields();
  };
  }
  }

  function showPopupWarning(message) {
  const modal = document.getElementById('popup-warning-modal');
  if (!modal) return;
  const textElem = modal.querySelector('p');
  if (textElem) textElem.textContent = message;
  modal.classList.add('show');
  const okBtn = document.getElementById('popup-warning-ok-btn');
  if (okBtn) okBtn.onclick = () => modal.classList.remove('show');
  }
