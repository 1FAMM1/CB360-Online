/* ============================================
    FASE 01 - CREATE AND CONTROL EMPLOYEE SCALES
    ============================================ */
    /* ==== EMPLOYEES SCALES MONTH BUTTONS ===== */    
    function createEmployeeScalesMonthButtons({
      monthsContainerId, 
      tableContainerId,
      yearSelectId,
      optionsContainerId,
      loadDataFunc,
      createTableFunc
    }) {
      const container = document.getElementById(monthsContainerId);
      if (!container) return;
      container.innerHTML = "";
      const mainWrapper = document.createElement("div");
      Object.assign(mainWrapper.style, {display: "flex", flexDirection: "column", alignItems: "center", gap: "12px"});
      const yearContainer = document.createElement("div");
      Object.assign(yearContainer.style, {display: "flex", alignItems: "center", gap: "8px"});
      const yearLabel = document.createElement("label");
      yearLabel.textContent = "Ano:";
      yearLabel.style.fontWeight = "bold";
      const yearSelect = document.createElement("select");
      yearSelect.id = yearSelectId;
      Object.assign(yearSelect.style, {padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer"});
      const targetYear = new Date().getFullYear();
      for (let y = 2025; y <= 2035; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        if (y === targetYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }
      yearSelect.value = targetYear;
      yearContainer.append(yearLabel, yearSelect);
      const monthsWrapper = document.createElement("div");
      Object.assign(monthsWrapper.style, {display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px", maxWidth: "800px"});
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      monthNames.forEach((month, idx) => {
        const btn = document.createElement("button");
        btn.textContent = month;
        btn.className = "btn btn-add";
        Object.assign(btn.style, {fontSize: "14px", fontWeight: "bold", width: "110px", height: "40px", borderRadius: "4px", margin: "2px"});
        btn.addEventListener("click", async () => {
          const tableContainer = document.getElementById(tableContainerId);
          const optionsContainer = document.getElementById(optionsContainerId);
          const isActive = btn.classList.contains("active");
          if (isActive) {
            if (tableContainer) tableContainer.innerHTML = "";
            if (optionsContainer) optionsContainer.style.display = "none";
            btn.classList.remove("active");
            return;
          }
          monthsWrapper.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const yearVal = parseInt(yearSelect.value, 10);
          const monthNum = idx + 1;
          const data = await loadDataFunc(yearVal, monthNum);
          await createTableFunc(tableContainerId, yearVal, monthNum, data);
          if (optionsContainer) optionsContainer.style.display = "flex";
        });
        monthsWrapper.appendChild(btn);
      });
      mainWrapper.append(yearContainer, monthsWrapper);
      container.appendChild(mainWrapper);
      setTimeout(() => {
        yearSelect.value = targetYear;
      }, 0);
    }
    /* ======== CREATE AND EMIT SCALES ========= */
    function toLocalYMD(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    function atNoonLocal(y, mIndex, d) {
      return new Date(y, mIndex, d, 12, 0, 0, 0);
    }
    function addDays(baseDate, days) {
      const d = new Date(baseDate);
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + days);
      return d;
    }
    const TEAM_ORDER = ["EQ01", "EQ02", "EQ03", "EQ04", "EQ05", "EQ06", "EQ07", "EQ08", "EQ09", "EQ10","TDNU", "OPC", "EP1", "EP2"];
    const SHIFT_VALUES = {"D": 12, "N": 12, "FR": 24, "FE": 8, "M": 8, "BX": 8, "FOR": 8, 
                          "FO": 0, "LC": 8, "LP": 8, "DP": 0, "LN": 8, "FI": 8, "FJ": 8};
    const SHIFT_COLORS = {"D": {bg: "#FFFF00", color: "#000000"}, "N": {bg: "#00008B", color: "#FFFFFF"}, "M": {bg: "#D3D3D3", color: "#000000"}, "FR": {bg: "#FFA500", color: "#000000"},
                          "FO": {bg: "#92D050", color: "#000000"}, "FE": {bg: "#00B0F0", color: "#000000"}, "BX": {bg: "#FF0000", color: "#FFFFFF"}, "LC": {bg: "#FF0000", color: "#FFFFFF"},
                          "LN": {bg: "#FF0000", color: "#FFFFFF"}, "LP": {bg: "#FF0000", color: "#FFFFFF"}, "FI": {bg: "#FF0000", color: "#FFFFFF"}, "FJ": {bg: "#FF0000", color: "#FFFFFF"},
                          "FOR": {bg: "#808080", color: "#FFFFFF"}, "DP": {bg: "#000000", color: "#FFFFFF"}};
    const HOLIDAY_COLOR = "#f7c6c7";
    const HOLIDAY_OPTIONAL_COLOR = "#d6ecff";
    const DRIVER_BG = "#ff69b4";
    const DRIVER_TEXT = "#000000";
    const OTHER_BG = "#800080";
    const OTHER_TEXT = "#ffffff";
    let __currentYear = null;
    let __currentMonth = null;
    let __currentDaysInMonth = null;
    let __currentHolidayMap = null;
    function getPortugalHolidays(year) {
      const fixed = [{month: 1, day: 1, name: "Ano Novo"}, {month: 4, day: 25, name: "Dia da Liberdade"}, {month: 5, day: 1, name: "Dia do Trabalhador"}, {month: 6, day: 10, name: "Dia de Portugal"},
                     {month: 8, day: 15, name: "Assunção de Nossa Senhora"}, {month: 9, day: 7, name: "Dia da Cidade de Faro"}, {month: 10, day: 5, name: "Implantação da República"},
                     {month: 11, day: 1, name: "Todos os Santos"}, {month: 12, day: 1, name: "Restauração da Independência"}, {month: 12, day: 8, name: "Imaculada Conceição"}, {month: 12, day: 25, name: "Natal"}];
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31);
      const day = ((h + l - 7 * m + 114) % 31) + 1;
      const easter = atNoonLocal(year, month - 1, day);
      const mobile = [{date: addDays(easter, -47), name: "Carnaval", optional: true}, {date: addDays(easter, -2),  name: "Sexta-feira Santa", optional: false}, 
                      {date: easter, name: "Páscoa", optional: false}, {date: addDays(easter, 60),  name: "Corpo de Deus", optional: false}];
      const fixedDates = fixed.map(h => ({date: atNoonLocal(year, h.month - 1, h.day), name: h.name, optional: false}));
      return [...fixedDates, ...mobile];
    }
    function calculateWorkingHours(year, month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const holidays = getPortugalHolidays(year);
      const holidayDates = new Set(
        holidays.filter(h => !h.optional).map(h => toLocalYMD(h.date))
      );
      const allHolidayDates = new Set(
        holidays.map(h => toLocalYMD(h.date))
      );
      let workingDays = 0;
      const holidaysInMonth = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = atNoonLocal(year, month - 1, d);
        const dayOfWeek = date.getDay();
        const dateStr = toLocalYMD(date);
        if (allHolidayDates.has(dateStr)) {
          const holiday = holidays.find(h => toLocalYMD(h.date) === dateStr);
          if (holiday) {holidaysInMonth.push({day: d, name: holiday.name, optional: !!holiday.optional});}
        }
        const isMandatoryHoliday = holidayDates.has(dateStr);
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isMandatoryHoliday) workingDays++;
      }
      return {workingDays, workingHours: workingDays * 8, holidaysInMonth, allHolidayDates};
    }
    function applyBaseDayColor(td, year, month, dayNum, holidayMap) {
      const val = (td.textContent || "").trim().toUpperCase();
      const hasShift = !!SHIFT_VALUES[val] || !!SHIFT_COLORS[val];
      const hasCustomColors = td.dataset.customBg || td.dataset.customColor;
      if (hasShift || hasCustomColors) return;      
      td.style.color = "";
      td.style.fontWeight = "";
      const holiday = holidayMap?.get(dayNum);
      if (holiday) {
        td.style.backgroundColor = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
        td.title = holiday.optional ? `${holiday.name} (Facultativo)` : holiday.name;
        return;
      }
      const date = atNoonLocal(year, month - 1, dayNum);
      const isWeekend = (date.getDay() === 0 || date.getDay() === 6);
      if (isWeekend) {
        td.style.backgroundColor = WEEKEND_COLOR || "#f9e0b0";
        td.title = "";
        return;
      }
      td.style.backgroundColor = "";
      td.title = "";
    }
    function displayWorkingHoursInfo(container, year, month) {
      const info = calculateWorkingHours(year, month);
      const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
      const infoDiv = document.createElement("div");
      infoDiv.style.cssText = `margin-top: 15px; padding: 12px; background: #f0f8ff; border: 2px solid #4682b4; border-radius: 5px; font-family: 'Segoe UI', sans-serif;
                               display: inline-block; width: fit-content; max-width: 100%;`;
      const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
      let holidaysHTML = '';
      if (info.holidaysInMonth.length > 0) {
        holidaysHTML = `
          <div>
            <strong style="color:#1e3a8a;">🎉 Feriados:</strong>
            <span style="color:#6b7280;">
              ${info.holidaysInMonth
                .map(h => `${h.day} (${h.name}${h.optional ? " - Facultativo" : ""})`)
                .join(", ")}
            </span>
          </div>
        `;
      }  
      infoDiv.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-start;">
          <div>
            <strong style="color:#1e3a8a;">📌 Mês:</strong>
            <span style="font-size:16px; font-weight:bold; color:#111827;">${monthLabel}</span>
          </div>    
          <div>
            <strong style="color:#1e3a8a;">📅 Dias Úteis:</strong>
            <span style="font-size:16px; font-weight:bold; color:#059669;">${info.workingDays}</span>
          </div>    
          <div>
            <strong style="color:#1e3a8a;">⏰ Carga Mensal:</strong>
            <span style="font-size:16px; font-weight:bold; color:#dc2626;">${info.workingHours}h</span>
          </div>
          ${holidaysHTML}
        </div>
      `;
      container.appendChild(infoDiv);
    }
    function isINEMRow(rowEl) {
      const teamTxt = rowEl.querySelector("td:nth-child(4)")?.textContent || "";
      const t = normalizeTeam(teamTxt);
      return t.startsWith("EQ") || t.startsWith("TDNU");
    }
    function applyDriverStyle(td) {
      if (td.dataset.driver !== "1") return;
      td.style.backgroundColor = DRIVER_BG;
      td.style.color = DRIVER_TEXT;
      td.style.fontWeight = "bold";
    }
    function applyOtherStyle(td) {
      if (td.dataset.outro !== "1") return;
      td.style.backgroundColor = OTHER_BG;
      td.style.color = OTHER_TEXT;
      td.style.fontWeight = "bold";
    }
    let __driverMenu = null;
    let __driverMenuCell = null;
    function ensureDriverMenu() {
      if (__driverMenu) return;
      const menu = document.createElement("div");
      menu.style.cssText = `position: fixed; z-index: 99999; display: none; background: #fff; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                            font-family: 'Segoe UI', sans-serif; padding: 8px; flex-direction: column; gap: 6px; min-width: 280px;`;
      menu.addEventListener("mousedown", (e) => e.stopPropagation());
      menu.addEventListener("click", (e) => e.stopPropagation());
      const bgSection = document.createElement("div");
      bgSection.innerHTML = `<div style="font-size: 11px; font-weight: bold; color: #666; margin-bottom: 4px; padding: 0 4px;">🎨 COR DE FUNDO:</div>`;      
      const bgGrid = document.createElement("div");
      bgGrid.style.cssText = "display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; padding: 4px;";      
      const shiftsList = [{code: "M", desc: "Manhã"}, {code: "D", desc: "Dia"}, {code: "N", desc: "Noite"}, {code: "FR", desc: "Feriado"}, {code: "FO", desc: "Folga"},
                          {code: "FE", desc: "Férias"}, {code: "FOR", desc: "Formação"}, {code: "BX", desc: "Baixa"}, {code: "DP", desc: "Dispensa"},
                          {code: "DRIVER", desc: "Motorista", bg: DRIVER_BG, color: DRIVER_TEXT}, {code: "OTHER", desc: "Outro Tipo", bg: OTHER_BG, color: OTHER_TEXT},
                          {code: "RESET", desc: "Limpar Cor", bg: "#ffffff", color: "#000000"}];      
      shiftsList.forEach(shift => {
        const colors = SHIFT_COLORS[shift.code] || {bg: shift.bg || "#ffffff", color: shift.color || "#000000"};
        const btn = document.createElement("button");
        btn.type = "button";
        btn.title = shift.desc;
        btn.textContent = shift.code === "RESET" ? "✖" : "";
        btn.style.cssText = `border: 1px solid #ddd; background: ${colors.bg}; color: ${colors.color}; 
                             padding: 6px 4px; cursor: pointer; font-size: 11px; font-weight: bold; border-radius: 4px;
                             transition: transform 0.1s; min-height: 32px; min-width: 32px;`;
        btn.addEventListener("mouseover", () => btn.style.transform = "scale(1.1)");
        btn.addEventListener("mouseout", () => btn.style.transform = "scale(1)");
        btn.addEventListener("click", () => {
          if (!__driverMenuCell) return;
          if (shift.code === "RESET") {
            delete __driverMenuCell.dataset.customBg;
            delete __driverMenuCell.dataset.customColor;
            const val = __driverMenuCell.textContent.trim().toUpperCase();
            applyCellColor(__driverMenuCell, val);
            if (__driverMenuCell.dataset.driver === "1") applyDriverStyle(__driverMenuCell);
          } else {
            __driverMenuCell.dataset.customBg = colors.bg;
            __driverMenuCell.dataset.customColor = colors.color;
            __driverMenuCell.style.backgroundColor = colors.bg;
            __driverMenuCell.style.color = colors.color;
            __driverMenuCell.style.fontWeight = "bold";
          }
          hideDriverMenu();
        });
        bgGrid.appendChild(btn);
      });      
      bgSection.appendChild(bgGrid);
      menu.appendChild(bgSection);
      const textSection = document.createElement("div");
      textSection.innerHTML = `<div style="font-size: 11px; font-weight: bold; color: #666; margin: 4px 0 4px 4px;">🖍️ COR DE LETRA:</div>`;      
      const textGrid = document.createElement("div");
      textGrid.style.cssText = "display: flex; gap: 4px; padding: 4px;";      
      [{label: "Preto", color: "#000000"}, {label: "Branco", color: "#FFFFFF"}, {label: "Vermelho", color: "#FF0000"}].forEach(item => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = item.label;
        let bgColor = "#fff";
        let textColor = "#000";
        if (item.color === "#000000") {
          bgColor = "#000";
          textColor = "#fff";
        } else if (item.color === "#FF0000") {
          bgColor = "#fff";
          textColor = "#FF0000";
        }
        btn.style.cssText = `border: 1px solid #ddd; background: ${bgColor}; 
                             color: ${textColor}; padding: 6px 12px; cursor: pointer; 
                             font-size: 11px; font-weight: bold; border-radius: 4px; flex: 1;`;
        btn.addEventListener("click", () => {
          if (!__driverMenuCell) return;
          __driverMenuCell.dataset.customColor = item.color;
          __driverMenuCell.style.color = item.color;
          hideDriverMenu();
        });
        textGrid.appendChild(btn);
      });      
      textSection.appendChild(textGrid);
      menu.appendChild(textSection);
      const separator = document.createElement("div");
      separator.style.cssText = "height: 1px; background: #ddd; margin: 4px 0;";
      menu.appendChild(separator);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.cssText = `border: none; background: #f0f0f0; padding: 8px 12px; cursor: pointer; width: 100%; 
                           text-align: left; display: block; border-radius: 4px; font-size: 12px;`;
      btn.addEventListener("mouseover", () => btn.style.background = "#e0e0e0");
      btn.addEventListener("mouseout", () => btn.style.background = "#f0f0f0");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!__driverMenuCell) return;
        const isDriver = __driverMenuCell.dataset.driver === "1";
        if (isDriver) {
          __driverMenuCell.dataset.driver = "0";
          const val = (__driverMenuCell.textContent || "").trim().toUpperCase();
          applyCellColor(__driverMenuCell, val);
        } else {
          __driverMenuCell.dataset.driver = "1";
          __driverMenuCell.dataset.outro = "0"; 
          applyDriverStyle(__driverMenuCell);
        }
        hideDriverMenu();
      });
      menu.appendChild(btn);
      const btnOutro = document.createElement("button");
      btnOutro.type = "button";
      btnOutro.style.cssText = `border: none; background: #f0f0f0; padding: 8px 12px; cursor: pointer; width: 100%; 
                                text-align: left; display: block; border-radius: 4px; font-size: 12px;`;
      btnOutro.addEventListener("mouseover", () => btnOutro.style.background = "#e0e0e0");
      btnOutro.addEventListener("mouseout", () => btnOutro.style.background = "#f0f0f0");
      btnOutro.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!__driverMenuCell) return;
        const isOutro = __driverMenuCell.dataset.outro === "1";
        if (isOutro) {
          __driverMenuCell.dataset.outro = "0";
          const val = (__driverMenuCell.textContent || "").trim().toUpperCase();
          applyCellColor(__driverMenuCell, val);
        } else {
          __driverMenuCell.dataset.outro = "1";
          __driverMenuCell.dataset.driver = "0";
          __driverMenuCell.style.backgroundColor = "#800080";
          __driverMenuCell.style.color = "#ffffff";
          __driverMenuCell.style.fontWeight = "bold";
        }
        hideDriverMenu();
      });
      menu.appendChild(btnOutro);      
      document.body.appendChild(menu);
      __driverMenu = menu;
      __driverMenu._btn = btn;
      __driverMenu._btnOutro = btnOutro;
      document.addEventListener("click", hideDriverMenu);
      document.addEventListener("scroll", hideDriverMenu, true);
    }
    function showDriverMenu(x, y, cell) {
      ensureDriverMenu();
      __driverMenuCell = cell;
      const tr = cell.closest("tr");
      const isInem = isINEMRow(tr);
      if (isInem) {
        __driverMenu._btn.style.display = "block";
        const isDriver = cell.dataset.driver === "1";
        __driverMenu._btn.textContent = isDriver ? "Remover Motorista INEM" : "Motorista INEM";
      } else {
        __driverMenu._btn.style.display = "none";
      }
      const isOutro = cell.dataset.outro === "1";
      __driverMenu._btnOutro.textContent = isOutro ? "Remover Outra Necessidade" : "Outra Necessidade";
      __driverMenu.style.left = x + "px";
      __driverMenu.style.top = y + "px";
      __driverMenu.style.display = "flex"; 
    }
    function hideDriverMenu() {
      if (__driverMenu) __driverMenu.style.display = "none";
      __driverMenuCell = null;
    }
    function applyCellColor(cell, value) {
      const upperValue = value.toUpperCase().trim();
      if (SHIFT_COLORS[upperValue]) {
        cell.style.backgroundColor = SHIFT_COLORS[upperValue].bg;
        cell.style.color = SHIFT_COLORS[upperValue].color;
        cell.style.fontWeight = "bold";
      } else {
        cell.style.backgroundColor = "";
        cell.style.color = "";
        cell.style.fontWeight = "";
      }
    }
    function calculateRowTotal(row) {
      const dayCells = row.querySelectorAll("td[contenteditable='true']");
      let total = 0;
      dayCells.forEach(cell => {
        const val = (cell.textContent || "").trim().toUpperCase();
        const hours = SHIFT_VALUES[val] || 0;
        total += hours;
      });
      const nInt = parseInt(row.getAttribute("data-nint"), 10);
      const entryDate = row.dataset.entryDate;
      if (entryDate) {
        const entry = new Date(entryDate);
        const entryYear = entry.getFullYear();
        const entryMonth = entry.getMonth() + 1;
        const entryDay = entry.getDate();
        if (entryYear === __currentYear && entryMonth === __currentMonth) {
          if (entryDay > 1) {
            let workingDaysNotWorked = 0;
            for (let d = 1; d < entryDay; d++) {
              const date = new Date(__currentYear, __currentMonth - 1, d);
              const dayOfWeek = date.getDay();
              const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
              const isHoliday = __currentHolidayMap?.has(d);
              if (!isWeekend && !isHoliday) {
                workingDaysNotWorked++;
              }
            }
            total += workingDaysNotWorked * 8;
          }
        }
      }
      return total;
    }
    function getHolidayMapForMonth(year, month) {
      let adjustedYear = year;
      let adjustedMonth = month;
      if (month > 12) {
        adjustedYear = year + 1;
        adjustedMonth = 1;
      } else if (month < 1) {
        adjustedYear = year - 1;
        adjustedMonth = 12;
      }
      const holidays = getPortugalHolidays(adjustedYear);
      const map = new Map();
      holidays.forEach(h => {
        const dt = h.date;
        if (dt.getFullYear() === adjustedYear && dt.getMonth() === adjustedMonth - 1) {
          map.set(dt.getDate(), { name: h.name, optional: !!h.optional });
        }
      });
      return map;
    }
    function updateRowTotal(row) {
      const totalMensal = calculateRowTotal(row);
      const totalMensalCell = row.querySelector(".total-mensal-cell");
      if (totalMensalCell) totalMensalCell.textContent = totalMensal;      
      const totalAcumCell = row.querySelector(".total-acumulado-cell");
      if (totalAcumCell) {
        const acumuladoBase = parseFloat(totalAcumCell.dataset.base || 0);
        const horasExtra = parseFloat(totalAcumCell.dataset.horasExtra || 0);
        const isJaneiro = (totalAcumCell.dataset.isJaneiro === "1");        
        const year = __currentYear;
        const month = __currentMonth;
        const cargaObrigatoria = calculateWorkingHours(year, month).workingHours;        
        const diferencaMes = totalMensal - cargaObrigatoria + horasExtra;        
        let totalAcumulado;
        if (isJaneiro) {
          totalAcumulado = diferencaMes;
        } else {
          totalAcumulado = acumuladoBase + diferencaMes;
        }
        totalAcumCell.textContent = totalAcumulado;
      }
    }
    function normalizeTeam(t) {
      return String(t || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[-_]/g, "");
    }
    function getGroupTitle(teamRaw) {
      const t = normalizeTeam(teamRaw);
      if (t.startsWith("EQ")) return "INEM";
      if (t.startsWith("TDNU")) return "Serviço Geral - TDNU";
      if (t.startsWith("OPC")) return "Central de Telecomunicações";
      if (t.startsWith("EP1") || t.startsWith("EP01") || t.startsWith("EIP1") || t.startsWith("EIP01")) return "Equipa de Intervenção Permanente 01";
      if (t.startsWith("EP2") || t.startsWith("EP02") || t.startsWith("EIP2") || t.startsWith("EIP02")) return "Equipa de Intervenção Permanente 02";
      return t || "SEM GRUPO";
    }
    function getOrderKey(teamRaw) {
      const t = normalizeTeam(teamRaw);
      if (t.startsWith("EQ01")) return "EQ01"; if (t.startsWith("EQ02")) return "EQ02"; if (t.startsWith("EQ03")) return "EQ03"; if (t.startsWith("EQ04")) return "EQ04";
      if (t.startsWith("EQ05")) return "EQ05"; if (t.startsWith("EQ06")) return "EQ06"; if (t.startsWith("EQ07")) return "EQ07"; if (t.startsWith("EQ08")) return "EQ08";
      if (t.startsWith("EQ09")) return "EQ09"; if (t.startsWith("EQ10")) return "EQ10";
      if (t.startsWith("TDNU")) return "TDNU";
      if (t.startsWith("OPC")) return "OPC";
      if (t.startsWith("EP1") || t.startsWith("EP01") || t.startsWith("EIP1") || t.startsWith("EIP01")) return "EP1";
      if (t.startsWith("EP2") || t.startsWith("EP02") || t.startsWith("EIP2") || t.startsWith("EIP02")) return "EP2";
      return t;
    }
    function paintWeekendHeaders(table, year, month, daysInMonth) {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = atNoonLocal(year, month - 1, d);
        const isWeekend = (date.getDay() === 0 || date.getDay() === 6);
        if (!isWeekend) continue;
        const thTop = table.querySelector(`th.day-header-${d}`);
        const thNum = table.querySelector(`th.day-number-${d}`);
        if (thTop) thTop.style.backgroundColor = WEEKEND_COLOR || "#f9e0b0";
        if (thNum) thNum.style.backgroundColor = WEEKEND_COLOR || "#f9e0b0";
      }
    }
    function paintHolidaysOnTable(tbody, table, year, month, daysInMonth, holidayMap) {
      const hm = holidayMap || getHolidayMapForMonth(year, month);
      for (let d = 1; d <= daysInMonth; d++) {
        const holiday = hm.get(d);
        if (!holiday) continue;
        const bg = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
        const title = holiday.optional ? `${holiday.name} (Facultativo)` : holiday.name;
        const thTop = table.querySelector(`th.day-header-${d}`);
        const thNum = table.querySelector(`th.day-number-${d}`);
        if (thTop) {thTop.style.backgroundColor = bg; thTop.title = title;}
        if (thNum) {thNum.style.backgroundColor = bg; thNum.title = title;}
         tbody.querySelectorAll(`.day-cell-${d}`).forEach((td) => {
           const val = (td.textContent || "").trim().toUpperCase();
           const hasShift = !!SHIFT_VALUES[val] || !!SHIFT_COLORS[val];
           const hasCustomColors = td.dataset.customBg || td.dataset.customColor;
           if (hasShift || hasCustomColors) return;
           td.style.backgroundColor = bg;
           td.title = title;
         });
      }
    }
    async function loadScalesShifts(year, month) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) {
          console.warn("Nenhum shift salvo ou erro ao carregar");
          return {shifts: {}, employeeData: {}};
        }
        const data = await response.json();
        const shifts = {};
        const employeeData = {};
        data.forEach(item => {
          const key = `${item.n_int}_${item.day}`;
          shifts[key] = {shift: item.shift, is_driver: !!item.is_driver, is_other: !!item.is_other, custom_bg_color: item.custom_bg_color || null,
                         custom_text_color: item.custom_text_color || null};
          if (!(item.n_int in employeeData)) {
            employeeData[item.n_int] = {
              position: item.position,
              team: item.team,
              function: item.function
            };
          }
        });
        return {shifts, employeeData};
      } catch (err) {
        console.error(err);
        return {shifts: {}, employeeData: {}};
      }
    }
    async function loadScalesEmployees(year, month) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const monthEnd = `${year}-${String(month).padStart(2, '0')}-${lastDayOfMonth}`;
        const url = `${SUPABASE_URL}/rest/v1/reg_employees` +  `?select=n_int,abv_name,function,team,entry_date,exit_date` +  `&corp_oper_nr=eq.${corpOperNr}` +
                    `&or=(entry_date.is.null,entry_date.lte.${monthEnd})` + `&or=(exit_date.is.null,exit_date.gte.${monthStart})`;
        const response = await fetch(url, {headers: getSupabaseHeaders()});
        if (!response.ok) {
          const body = await response.text();
          console.error("Erro Supabase (reg_employees):", response.status, body);
          throw new Error("Erro ao carregar profissionais");
        }
        const data = await response.json();
        if (!Array.isArray(data)) return [];        
        const isJaneiro = (month === 1);
        const acumuladosMap = {};
        const horasExtraMap = {};        
        if (!isJaneiro) {
          const acumPrevMonth = month - 1;
          const acumResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${acumPrevMonth}`,
            { headers: getSupabaseHeaders() }
          );
          if (acumResponse.ok) {
            const acumData = await acumResponse.json();
            acumData.forEach(item => {
              acumuladosMap[item.n_int] = item.total_acumulado || 0;
            });
          }
        }
        const horasExtraResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`,
          { headers: getSupabaseHeaders() }
        );
        if (horasExtraResponse.ok) {
          const horasExtraData = await horasExtraResponse.json();
          horasExtraData.forEach(item => {
            horasExtraMap[item.n_int] = item.horas_extra || 0;
          });
        }        
        const { shifts, employeeData } = await loadScalesShifts(year, month);        
        if (employeeData && Object.keys(employeeData).length > 0) {
          data.forEach((emp) => {
            const ed = employeeData[emp.n_int];
            if (ed) {
              emp.team = ed.team;
              emp.function = ed.function;
              emp._position = ed.position;
            }
            emp._acumulado = acumuladosMap[emp.n_int] || 0;
            emp._horasExtra = horasExtraMap[emp.n_int] || 0;
            emp._isJaneiro = isJaneiro;
          });
        } else {
          data.forEach((emp) => {
            emp._acumulado = acumuladosMap[emp.n_int] || 0;
            emp._horasExtra = horasExtraMap[emp.n_int] || 0;
            emp._isJaneiro = isJaneiro;
          });
        }
        const idx = (key) => {
          const i = TEAM_ORDER.indexOf(key);
          return i === -1 ? 999 : i;
        };
        data.sort((a, b) => {
          const ka = getOrderKey(a.team);
          const kb = getOrderKey(b.team);
          const ia = idx(ka);
          const ib = idx(kb);
          if (ia !== ib) return ia - ib;
          return parseInt(a.n_int, 10) - parseInt(b.n_int, 10);
        });
        data._shifts = shifts;
        return data;
      } catch (err) {
        console.error(err);
        showPopupWarning && showPopupWarning("Erro ao carregar profissionais.");
        return [];
      }
    }
    function applyShiftsToTable(shifts) {
      const rows = document.querySelectorAll("tr.data-row");
      rows.forEach(row => {
        const nInt = parseInt(row.getAttribute("data-nint"), 10);
        const dayCells = row.querySelectorAll("td[contenteditable='true']");
        dayCells.forEach((cell, idx) => {
          const day = idx + 1;
          const key = `${nInt}_${day}`;
          if (shifts[key]) {
            const rec = shifts[key];
            const shiftVal = (rec.shift || "").toUpperCase();
            cell.textContent = shiftVal;
            if (!rec.custom_bg_color && !rec.custom_text_color) {
              applyCellColor(cell, shiftVal);
            }
            if (rec.custom_bg_color) {
              cell.dataset.customBg = rec.custom_bg_color;
              cell.style.backgroundColor = rec.custom_bg_color;
            }
            if (rec.custom_text_color) {
              cell.dataset.customColor = rec.custom_text_color;
              cell.style.color = rec.custom_text_color;
            }
            if (rec.is_driver) {
              cell.dataset.driver = "1";
              cell.dataset.outro = "0";
              applyDriverStyle(cell);
            } else if (rec.is_other) {
              cell.dataset.outro = "1";
              cell.dataset.driver = "0";
              applyOtherStyle(cell);
            } else {
              cell.dataset.driver = "0";
              cell.dataset.outro = "0";
            }
          }
        });
      });
    }
    let globalDraggedRow = null;
    function enableRowDragAndDrop(tbody) {
      const rows = tbody.querySelectorAll("tr.data-row");
      rows.forEach(row => {
        row.draggable = true;
        row.style.cursor = "move";
        row.addEventListener("dragstart", (e) => {
          globalDraggedRow = row;
          row.style.opacity = "0.5";
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", "");
        });
        row.addEventListener("dragend", () => {
          row.style.opacity = "1";
          document.querySelectorAll("tr.data-row").forEach(r => r.style.backgroundColor = "");
          globalDraggedRow = null;
        });
        row.addEventListener("dragover", (e) => {
          e.preventDefault();
          if (globalDraggedRow && globalDraggedRow !== row) {
            row.style.backgroundColor = "#e3f2fd";
          }
        });
        row.addEventListener("dragleave", () => {
          row.style.backgroundColor = "";
        });
        row.addEventListener("drop", (e) => {
          e.preventDefault();
          if (!globalDraggedRow || globalDraggedRow === row) return;
          const dNI = globalDraggedRow.cells[0].textContent.trim();
          const dNome = globalDraggedRow.cells[1].textContent.trim();
          const dFuncao = globalDraggedRow.cells[2].textContent.trim();
          const dNint = globalDraggedRow.getAttribute("data-nint");
          const tNI = row.cells[0].textContent.trim();
          const tNome = row.cells[1].textContent.trim();
          const tFuncao = row.cells[2].textContent.trim();
          const tNint = row.getAttribute("data-nint");
          globalDraggedRow.cells[0].textContent = tNI;
          globalDraggedRow.cells[1].textContent = tNome;
          globalDraggedRow.cells[2].textContent = tFuncao;
          globalDraggedRow.setAttribute("data-nint", tNint);
          row.cells[0].textContent = dNI;
          row.cells[1].textContent = dNome;
          row.cells[2].textContent = dFuncao;
          row.setAttribute("data-nint", dNint);
          const dShifts = Array.from(globalDraggedRow.querySelectorAll("td[contenteditable='true']"));
          const tShifts = Array.from(row.querySelectorAll("td[contenteditable='true']"));
          dShifts.forEach((cell, i) => {
            const targetCell = tShifts[i];
            const tempText = cell.textContent;
            const tempBg = cell.style.backgroundColor;
            const tempColor = cell.style.color;
            const tempWeight = cell.style.fontWeight;
            const tempDriver = cell.dataset.driver;
            cell.textContent = targetCell.textContent;
            cell.style.backgroundColor = targetCell.style.backgroundColor;
            cell.style.color = targetCell.style.color;
            cell.style.fontWeight = targetCell.style.fontWeight;
            cell.dataset.driver = targetCell.dataset.driver;
            targetCell.textContent = tempText;
            targetCell.style.backgroundColor = tempBg;
            targetCell.style.color = tempColor;
            targetCell.style.fontWeight = tempWeight;
            targetCell.dataset.driver = tempDriver;
          });
          updateRowTotal(globalDraggedRow);
          updateRowTotal(row);
          row.style.backgroundColor = "";
          globalDraggedRow = null;
        });
      });
    }
    function getNextTeamNumber(teamPrefix) {
      const tbody = document.querySelector("table.employees-table tbody");
      if (!tbody) return teamPrefix === "EQ" ? "EQ05" : `${teamPrefix}02`;      
      const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
      const existingTeams = rows.map(r => r.querySelector("td:nth-child(4)")?.textContent.trim()).filter(Boolean);      
      if (teamPrefix === "EQ") {
        let maxNum = 4;
        existingTeams.forEach(t => {
          const match = t.match(/^EQ(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        return `EQ${String(maxNum + 1).padStart(2, "0")}`;
      } else {
        let maxNum = 1;
        existingTeams.forEach(t => {
          if (t.startsWith(teamPrefix)) {
            const match = t.match(/\d+$/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (num > maxNum) maxNum = num;
            }
          }
        });
        return `${teamPrefix}${String(maxNum + 1).padStart(2, "0")}`;
      }
    }    
    function addTeamRows(teamCode, count) {
      const tbody = document.querySelector("table.employees-table tbody");
      if (!tbody) return;      
      const separatorRows = Array.from(tbody.querySelectorAll("tr.team-separator-row"));
      let targetSeparator = null;      
      if (teamCode.startsWith("EQ")) {
        targetSeparator = separatorRows.find(r => r.textContent.includes("INEM"));
      } else if (teamCode.startsWith("TDNU")) {
        targetSeparator = separatorRows.find(r => r.textContent.includes("Serviço Geral"));
      } else if (teamCode.startsWith("OPC")) {
        targetSeparator = separatorRows.find(r => r.textContent.includes("Central de Telecomunicações"));
      }      
      if (!targetSeparator) return;      
      let insertAfter = targetSeparator;
      const allRows = Array.from(tbody.children);
      const sepIndex = allRows.indexOf(targetSeparator);      
      for (let i = sepIndex + 1; i < allRows.length; i++) {
        const row = allRows[i];
        if (row.classList.contains("team-separator-row")) break;
        if (row.classList.contains("data-row")) insertAfter = row;
      }      
      for (let i = 0; i < count; i++) {
        const tr = document.createElement("tr");
        tr.className = "data-row";
        tr.setAttribute("data-nint", "");        
        const tdNI = document.createElement("td");
        tdNI.textContent = "";
        tdNI.style.cssText = COMMON_TD_STYLE;
        tr.appendChild(tdNI);
        const tdNome = document.createElement("td");
        tdNome.textContent = "";
        tdNome.style.cssText = COMMON_TD_STYLE;
        tr.appendChild(tdNome);
        const tdFuncao = document.createElement("td");
        tdFuncao.textContent = "";
        tdFuncao.style.cssText = COMMON_TD_STYLE + "text-align:center;";
        tr.appendChild(tdFuncao);
        const tdEq = document.createElement("td");
        tdEq.textContent = teamCode;
        tdEq.style.cssText = COMMON_TD_STYLE + "text-align:center;";
        tr.appendChild(tdEq);
        for (let d = 1; d <= __currentDaysInMonth; d++) {
          const td = document.createElement("td");
          td.className = `day-cell-${d}`;
          td.contentEditable = true;
          td.style.cssText = COMMON_TD_STYLE;
          td.addEventListener("contextmenu", (ev) => {
            ev.preventDefault();
            showDriverMenu(ev.clientX, ev.clientY, td);
          });
          td.addEventListener("input", function() {
            const selection = window.getSelection();
            const range = selection.rangeCount ? selection.getRangeAt(0) : null;
            const cursorPos = range ? range.startOffset : 0;
            const value = this.textContent.trim().toUpperCase();
            if (this.textContent !== value) {
              this.textContent = value;
              if (this.firstChild) {
                const newRange = document.createRange();
                const newPos = Math.min(cursorPos, this.textContent.length);
                newRange.setStart(this.firstChild, newPos);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            }
            applyCellColor(this, value);
            applyBaseDayColor(this, __currentYear, __currentMonth, d, __currentHolidayMap);
            applyDriverStyle(this);
            updateRowTotal(tr);
            applyWeekendSpecialColors(tbody, __currentYear, __currentMonth);
          });
          td.addEventListener("keydown", (ev) => {
            if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Enter"].includes(ev.key)) return;
            ev.preventDefault();
            const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
            const cells = Array.from(tr.querySelectorAll("td[contenteditable='true']"));
            const currentIdx = cells.indexOf(td);
            const rowIdx = rows.indexOf(tr);
            let nextCell = null;
            if (ev.key === "ArrowRight" || ev.key === "Enter") {
              nextCell = currentIdx < cells.length - 1
                ? cells[currentIdx + 1]
              : rows[rowIdx + 1]?.querySelectorAll("td[contenteditable='true']")[0];
            } else if (ev.key === "ArrowLeft") {
              nextCell = currentIdx > 0 ? cells[currentIdx - 1] : null;
            } else if (ev.key === "ArrowDown") {
              const nextCells = Array.from(rows[rowIdx + 1]?.querySelectorAll("td[contenteditable='true']") || []);
              nextCell = nextCells[Math.min(currentIdx, nextCells.length - 1)];
            } else if (ev.key === "ArrowUp") {
              const prevCells = Array.from(rows[rowIdx - 1]?.querySelectorAll("td[contenteditable='true']") || []);
              nextCell = prevCells[Math.min(currentIdx, prevCells.length - 1)];
            }
            if (nextCell) {
              nextCell.focus();
              const range = document.createRange();
              range.selectNodeContents(nextCell);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
          });
          td.addEventListener("focus", () => {
            const range = document.createRange();
            range.selectNodeContents(td);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          });
          tr.appendChild(td);
        }        
        const tdTotalMensal = document.createElement("td");
        tdTotalMensal.className = "total-mensal-cell";
        tdTotalMensal.textContent = "0";
        tdTotalMensal.style.cssText = COMMON_TD_STYLE + "text-align:center; font-weight:bold; background:#f0f0f0;";
        tr.appendChild(tdTotalMensal);        
        const tdTotalAcum = document.createElement("td");
        tdTotalAcum.className = "total-acumulado-cell";
        tdTotalAcum.textContent = "0";
        tdTotalAcum.style.cssText = COMMON_TD_STYLE + "text-align:center; font-weight:bold; background:#ffe6e6;";
        tr.appendChild(tdTotalAcum);        
        insertAfter.insertAdjacentElement("afterend", tr);
        insertAfter = tr;
      }      
      enableRowDragAndDrop(tbody);     
      for (let d = 1; d <= __currentDaysInMonth; d++) {
        const date = atNoonLocal(__currentYear, __currentMonth - 1, d);
        if (date.getDay() === 0 || date.getDay() === 6) {
          tbody.querySelectorAll(`.day-cell-${d}`).forEach((td) => {
            const val = (td.textContent || "").trim().toUpperCase();
            const hasShift = !!SHIFT_VALUES[val] || !!SHIFT_COLORS[val];
            if (!hasShift) td.style.backgroundColor = WEEKEND_COLOR || "#f9e0b0";
          });
        }
      }
      paintHolidaysOnTable(tbody, document.querySelector("table.employees-table"), __currentYear, __currentMonth, __currentDaysInMonth, __currentHolidayMap);
    }
    function removeEmptyRows(teamPrefix) {
      const tbody = document.querySelector("table.employees-table tbody");
      if (!tbody) return;      
      const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
      let removedCount = 0;      
      rows.forEach(row => {
        const team = row.querySelector("td:nth-child(4)")?.textContent.trim();
        if (!team.startsWith(teamPrefix)) return;        
        const ni = row.querySelector("td:nth-child(1)")?.textContent.trim();
        const nome = row.querySelector("td:nth-child(2)")?.textContent.trim();
        const dayCells = row.querySelectorAll("td[contenteditable='true']");
        const hasShifts = Array.from(dayCells).some(cell => cell.textContent.trim() !== "");        
        if (!ni && !nome && !hasShifts) {
          row.remove();
          removedCount++;
        }
      });      
      if (removedCount > 0) {
        showPopupSuccess(`✅ ${removedCount} Elemento(s) Removido(s).`);
      } else {
        showPopupWarning("⚠️ Nenhuma linha vazia encontrada");
      }
    }
    async function loadWeekendAdjacentData(year, month) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      __prevMonthShiftsCache = {};
      __nextMonthShiftsCache = {};
      __lastFridayPrevCache = null;
      __firstMondayNextCache = null;
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) { prevMonth = 12; prevYear = year - 1; }
      let nextMonth = month + 1;
      let nextYear = year;
      if (nextMonth === 13) { nextMonth = 1; nextYear = year + 1; }
      const lastDayPrev = new Date(prevYear, prevMonth, 0).getDate();
      for (let d = lastDayPrev; d >= 1; d--) {
        const date = atNoonLocal(prevYear, prevMonth - 1, d);
        if (date.getDay() === 5) { __lastFridayPrevCache = d; break; }
      }
      for (let d = 1; d <= 7; d++) {
        const date = atNoonLocal(nextYear, nextMonth - 1, d);
        if (date.getDay() === 1) { __firstMondayNextCache = d; break; }
      }
      try {
        const [responsePrev, responseNext] = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${prevYear}&month=eq.${prevMonth}&day=gte.${Math.max(1, lastDayPrev - 7)}`,
            { headers: getSupabaseHeaders() }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${nextYear}&month=eq.${nextMonth}&day=lte.7`,
            { headers: getSupabaseHeaders() }
          )
        ]);
        if (responsePrev.ok) {
          const dataPrev = await responsePrev.json();
          dataPrev.forEach(item => { __prevMonthShiftsCache[`${item.n_int}_${item.day}`] = item.shift; });
        }
        if (responseNext.ok) {
          const dataNext = await responseNext.json();
          dataNext.forEach(item => { __nextMonthShiftsCache[`${item.n_int}_${item.day}`] = item.shift; });
        }
      } catch (err) { console.error("Erro ao carregar dados mês anterior/seguinte:", err); }
    }
    function applyWeekendSpecialColors(tbody, year, month) {
      const SPECIAL_TURNOS_FDS = ["BX", "FI", "FJ", "LC", "LP", "LN"];
      const SPECIAL_BEFORE_HOLIDAY_RED = ["FI", "FJ", "LC", "LP", "LN"];
      const daysInMonth = new Date(year, month, 0).getDate();
      const holidayMap = __currentHolidayMap;
      const rows = tbody.querySelectorAll("tr.data-row");
      rows.forEach(row => {
        for (let d = 1; d <= daysInMonth; d++) {
          const cell = row.querySelector(`.day-cell-${d}`);
          if (!cell) continue;
          const value = cell.textContent.trim().toUpperCase();
          const hasShiftColor = !!value && !!SHIFT_COLORS[value];
          const hasCustomColors = cell.dataset.customBg || cell.dataset.customColor;
          if (hasShiftColor || hasCustomColors) continue;          
          const holiday = holidayMap?.get(d);
          if (holiday) {
            cell.style.backgroundColor = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
            continue;
          }
          const date = atNoonLocal(year, month - 1, d);
          const dayOfWeek = date.getDay();
          const isWeekend = (dayOfWeek === 6 || dayOfWeek === 0);
          if (isWeekend) {
            cell.style.backgroundColor = WEEKEND_COLOR || "#f9e0b0";
          } else {
            cell.style.backgroundColor = "";
          }
        }
      });
      rows.forEach(row => {
        const rowNInt = parseInt(row.getAttribute("data-nint"), 10);
        if (!rowNInt) return;
        const lastDayPrevMonth = new Date(year, month - 1, 0).getDate();
        const turnoLastDayPrev = __prevMonthShiftsCache[`${rowNInt}_${lastDayPrevMonth}`] || null;
        if (turnoLastDayPrev === "FE" || turnoLastDayPrev === "BX") {
          let continuePainting = true;
          const corPintar = (turnoLastDayPrev === "FE") ? "#00B0F0" : "#FF0000";
          for (let d = 1; d <= daysInMonth && continuePainting; d++) {
            const date = atNoonLocal(year, month - 1, d);
            const dayOfWeek = date.getDay();
            const isWeekend = (dayOfWeek === 6 || dayOfWeek === 0);
            const isHoliday = holidayMap?.has(d);
            if (!isWeekend && !isHoliday) {
              continuePainting = false;
              break;
            }
            const cell = row.querySelector(`.day-cell-${d}`);
            if (cell) {
              const cellValue = cell.textContent.trim().toUpperCase();
              if (!cellValue || !SHIFT_COLORS[cellValue]) {
                cell.style.backgroundColor = corPintar;
                if (turnoLastDayPrev === "BX") {
                  cell.style.color = "#FFFFFF";
                  cell.style.fontWeight = "bold";
                }
              }
            }
          }
        }      
      });
      rows.forEach(row => {
        for (let d = 1; d <= daysInMonth; d++) {
          const cell = row.querySelector(`.day-cell-${d}`);
          if (!cell) continue;
          const turno = cell.textContent.trim().toUpperCase();
          const nextDay = d + 1;
          if (nextDay > daysInMonth) continue;
          const isNextDayHoliday = holidayMap?.has(nextDay);
          if (!isNextDayHoliday) continue;
          if (turno === "FE" || turno === "BX") {
            const corPintar = (turno === "FE") ? "#00B0F0" : "#FF0000";
            const nextCell = row.querySelector(`.day-cell-${nextDay}`);
            if (nextCell) {
              const nextValue = nextCell.textContent.trim().toUpperCase();
              if (!nextValue || !SHIFT_COLORS[nextValue]) {
                nextCell.style.backgroundColor = corPintar;
                if (turno === "BX") {
                  nextCell.style.color = "#FFFFFF";
                  nextCell.style.fontWeight = "bold";
                }
              }
            }
            const nextDate = atNoonLocal(year, month - 1, nextDay);
            if (nextDate.getDay() === 5) {
              const sabado = nextDay + 1;
              const domingo = nextDay + 2;
              if (sabado <= daysInMonth) {
                const sabCell = row.querySelector(`.day-cell-${sabado}`);
                if (sabCell) {
                  const sabValue = sabCell.textContent.trim().toUpperCase();
                  if (!sabValue || !SHIFT_COLORS[sabValue]) {
                    sabCell.style.backgroundColor = corPintar;
                    if (turno === "BX") {
                      sabCell.style.color = "#FFFFFF";
                      sabCell.style.fontWeight = "bold";
                    }
                  }
                }
              }
              if (domingo <= daysInMonth) {
                const domCell = row.querySelector(`.day-cell-${domingo}`);
                if (domCell) {
                  const domValue = domCell.textContent.trim().toUpperCase();
                  if (!domValue || !SHIFT_COLORS[domValue]) {
                    domCell.style.backgroundColor = corPintar;
                    if (turno === "BX") {
                      domCell.style.color = "#FFFFFF";
                      domCell.style.fontWeight = "bold";
                    }
                  }
                }
              }
            }
            continue;
          }
          if (SPECIAL_BEFORE_HOLIDAY_RED.includes(turno)) {
            const nextCell = row.querySelector(`.day-cell-${nextDay}`);
            if (nextCell) {
              const nextValue = nextCell.textContent.trim().toUpperCase();
              if (!nextValue || !SHIFT_COLORS[nextValue]) {
                nextCell.style.backgroundColor = "#FF0000";
                nextCell.style.color = "#FFFFFF";
                nextCell.style.fontWeight = "bold";
              }
            }
          }
        }
      });
      rows.forEach(row => {
        const rowNInt = parseInt(row.getAttribute("data-nint"), 10);
        if (!rowNInt) return;
        for (let d = 1; d <= daysInMonth; d++) {
          const date = atNoonLocal(year, month - 1, d);
          const dayOfWeek = date.getDay();
          if (dayOfWeek !== 6 && dayOfWeek !== 0) continue;
          let turnoSexta = null;
          let turnoSegunda = null;
          if (dayOfWeek === 6) {
            if (d === 1 && __lastFridayPrevCache) {
              turnoSexta = __prevMonthShiftsCache[`${rowNInt}_${__lastFridayPrevCache}`] || null;
            } else if (d > 1) {
              const cellSexta = row.querySelector(`.day-cell-${d - 1}`);
              turnoSexta = cellSexta ? cellSexta.textContent.trim().toUpperCase() : null;
            }
            if (d + 2 <= daysInMonth) {
              const cellSegunda = row.querySelector(`.day-cell-${d + 2}`);
              turnoSegunda = cellSegunda ? cellSegunda.textContent.trim().toUpperCase() : null;
            } else if (__firstMondayNextCache) {
              turnoSegunda = __nextMonthShiftsCache[`${rowNInt}_${__firstMondayNextCache}`] || null;
            }
          } else {
            if (d <= 2 && __lastFridayPrevCache) {
              turnoSexta = __prevMonthShiftsCache[`${rowNInt}_${__lastFridayPrevCache}`] || null;
            } else if (d > 2) {
              const cellSexta = row.querySelector(`.day-cell-${d - 2}`);
              turnoSexta = cellSexta ? cellSexta.textContent.trim().toUpperCase() : null;
            }
            if (d + 1 <= daysInMonth) {
              const cellSegunda = row.querySelector(`.day-cell-${d + 1}`);
              turnoSegunda = cellSegunda ? cellSegunda.textContent.trim().toUpperCase() : null;
            } else if (__firstMondayNextCache) {
              turnoSegunda = __nextMonthShiftsCache[`${rowNInt}_${__firstMondayNextCache}`] || null;
            }
          }
          const cellFDS = row.querySelector(`.day-cell-${d}`);
          if (!cellFDS) continue;
          const cellValue = cellFDS.textContent.trim().toUpperCase();
          if (cellValue && SHIFT_COLORS[cellValue]) continue;
          if (turnoSexta === "FE" || turnoSexta === "BX") {
            const corPintar = (turnoSexta === "FE") ? "#00B0F0" : "#FF0000";
            cellFDS.style.backgroundColor = corPintar;
            if (turnoSexta === "BX") {
              cellFDS.style.color = "#FFFFFF";
              cellFDS.style.fontWeight = "bold";
            }
            if (dayOfWeek === 6) {
              const segunda = d + 2;
              if (segunda <= daysInMonth) {
                const isSegundaHoliday = holidayMap?.has(segunda);
                if (isSegundaHoliday) {
                  const segCell = row.querySelector(`.day-cell-${segunda}`);
                  if (segCell) {
                    const segValue = segCell.textContent.trim().toUpperCase();
                    if (!segValue || !SHIFT_COLORS[segValue]) {
                      segCell.style.backgroundColor = corPintar;
                      if (turnoSexta === "BX") {
                        segCell.style.color = "#FFFFFF";
                        segCell.style.fontWeight = "bold";
                      }
                    }
                  }
                }
              }
            }
            continue;
          }
          if (SPECIAL_TURNOS_FDS.includes(turnoSexta) && SPECIAL_TURNOS_FDS.includes(turnoSegunda)) {
            if (dayOfWeek === 6) {
              const corSexta = SHIFT_COLORS[turnoSexta];
              if (corSexta) cellFDS.style.backgroundColor = corSexta.bg;
            } else {
              const corSegunda = SHIFT_COLORS[turnoSegunda];
              if (corSegunda) cellFDS.style.backgroundColor = corSegunda.bg;
            }
          }
        }
      });
    }
    function displayTurnosLegend(container) {
      const legendDiv = document.createElement("div");
      legendDiv.style.cssText = `margin-top: 15px; padding: 12px; background: #f0f8ff; border: 2px solid #4682b4; border-radius: 5px; font-family: 'Segoe UI', sans-serif;
                                 display: inline-block; width: fit-content; margin-left: 15px; vertical-align: top;`;
      const turnos = [{code: "FR", desc: "Feriado"}, {code: "M", desc: "08:00 - 15:00"}, {code: "D", desc: "08:00 - 20:00"}, {code: "N", desc: "20:00 - 08:00"}, {code: "", desc: "Condutor INEM", special: "driver"},
                      {code: "FO", desc: "Folga"}, {code: "FE", desc: "Férias"}, {code: "FOR", desc: "Formação"}, {code: "BX", desc: "Baixa"}, {code: "FI", desc: "Falta Injustificada"},
                      {code: "FJ", desc: "Falta Justificada"}, {code: "LP", desc: "Lic. Paternidade"}, {code: "LN", desc: "Lic. Nojo"}, {code: "LC", desc: "Lic. Casamento"}, {code: "DP", desc: "Dispensa"}];
      let html = `
        <div style="font-weight: bold; font-size: 14px; color: #1e3a8a; margin-bottom: 10px; text-align: center;">LEGENDA DE TURNOS</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
      `;
      const createItem = (turno) => {
        if (turno.special === "driver") {
          return `
            <div style="display: flex; align-items: stretch; background: #f5f5f5; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; width: 165px;">
              <div style="background: ${DRIVER_BG}; color: ${DRIVER_TEXT}; font-weight: bold; font-size: 14px; padding: 1px 0; width: 50px; text-align: center; display: flex; 
                          align-items: center; justify-content: center;">&nbsp;</div>
              <div style="font-size: 12px; color: #000; flex: 1; text-align: center; padding: 1px 8px; display: flex; align-items: center; justify-content: center;">${turno.desc}</div>
            </div>
          `;
        } else {
          const colors = SHIFT_COLORS[turno.code];
          const codeBg = colors ? colors.bg : "#FFFFFF";
          const codeColor = colors ? colors.color : "#000000";
          return `
            <div style="display: flex; align-items: stretch; background: #f5f5f5; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; width: 165px;">
              <div style="background: ${codeBg}; color: ${codeColor}; font-weight: bold; font-size: 14px; padding: 1px 0; width: 50px; text-align: center; display: flex; 
                          align-items: center; justify-content: center;">${turno.code}</div>
              <div style="font-size: 12px; color: #000; flex: 1; text-align: center; padding: 1px 8px; display: flex; align-items: center; justify-content: center;">${turno.desc}</div>
            </div>
          `;
        }
      };
      html += `<div style="display: flex; gap: 6px;">`;
      for (let i = 0; i < 5; i++) {
        html += createItem(turnos[i]);
      }
      html += `</div>`;
      html += `<div style="display: flex; gap: 6px;">`;
      for (let i = 5; i < 10; i++) {
        html += createItem(turnos[i]);
      }
      html += `</div>`;
      html += `<div style="display: flex; gap: 6px;">`;
      for (let i = 10; i < 15; i++) {
        html += createItem(turnos[i]);
      }
      html += `</div>`;
      html += `</div>`;
      legendDiv.innerHTML = html;
      container.appendChild(legendDiv);
    }
    let __prevMonthShiftsCache = {};
    let __nextMonthShiftsCache = {};
    let __lastFridayPrevCache = null;
    let __firstMondayNextCache = null;
    async function createEscalasTable(containerId, year, month, data) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const rowsData = Array.isArray(data) ? data : [];
      let tableHost = container.querySelector("#table-host");
      let infoHost  = container.querySelector("#info-host");
      if (!tableHost || !infoHost) {
        container.innerHTML = "";
        tableHost = document.createElement("div");
        tableHost.id = "table-host";
        infoHost = document.createElement("div");
        infoHost.id = "info-host";
        infoHost.style.cssText = "display:flex; align-items:flex-start; flex-wrap:wrap;";
        container.appendChild(tableHost);
        container.appendChild(infoHost);
      }
      tableHost.innerHTML = "";
      const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
      const daysInMonth = new Date(year, month, 0).getDate();
      const holidayMap = getHolidayMapForMonth(year, month);
      __currentYear = year;
      __currentMonth = month;
      __currentDaysInMonth = daysInMonth;
      __currentHolidayMap = holidayMap;
      const title = document.createElement("h3");
      title.textContent = `ESCALA - ${MONTH_NAMES[month - 1]} ${year}`;
      Object.assign(title.style, {textAlign: "center", margin: "20px 0 -15px 0", background: "#3ac55b", height: "30px", borderRadius: "3px", lineHeight: "30px"});
      tableHost.appendChild(title);
      const wrapper = createTableWrapper(tableHost);
      wrapper.style.height = "500px";
      wrapper.style.overflowY = "auto";
      const table = document.createElement("table");
      table.className = "employees-table";
      Object.assign(table.style, {width: "100%", borderCollapse: "separated"});
      const thead = document.createElement("thead");
      const trTop = document.createElement("tr");
      ["NI", "Nome", "Função", "Eq."].forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.rowSpan = 2;
        th.style.cssText = COMMON_TH_STYLE + "border-bottom:2px solid #ccc;";
        if (i === 0) th.style.width = "40px";
        if (i === 1) th.style.width = "140px";
        if (i === 2) th.style.width = "60px";
        if (i === 3) th.style.width = "40px";
        trTop.appendChild(th);
      });
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-header-${d}`;
        th.style.cssText = COMMON_TH_STYLE;
        trTop.appendChild(th);
      }
      const thTotalMensal = document.createElement("th");
      thTotalMensal.innerHTML = "TOTAL<br>Mensal";
      thTotalMensal.rowSpan = 2;
      thTotalMensal.style.cssText = COMMON_TH_STYLE + "border-bottom:2px solid #ccc; width:70px; background:#131a69; color:#fff; line-height:16px;";
      trTop.appendChild(thTotalMensal);
      const thTotalAcum = document.createElement("th");
      thTotalAcum.innerHTML = "TOTAL<br>Acumulado";
      thTotalAcum.rowSpan = 2;
      thTotalAcum.style.cssText = COMMON_TH_STYLE + "border-bottom:2px solid #ccc; width:70px; background:#8B0000; color:#fff; line-height:16px;";
      trTop.appendChild(thTotalAcum);
      thead.appendChild(trTop);
      const trNums = document.createElement("tr");
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-number-${d}`;
        th.textContent = d;
        th.style.cssText = COMMON_TH_STYLE + "border-bottom:2px solid #ccc;";
        trNums.appendChild(th);
      }
      thead.appendChild(trNums);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      wrapper.appendChild(table);
      updateDayHeaders(table, year, month, daysInMonth);
      Array.from(thead.querySelectorAll("th")).forEach((th) => {
        th.style.position = "sticky";
        th.style.top = "0";
        th.style.zIndex = "10";
      });
      const getRows = () => Array.from(tbody.querySelectorAll("tr.data-row"));
      const getEditableCells = (row) => Array.from(row.querySelectorAll("td[contenteditable='true']"));
      const getCellIndex = (td) => getEditableCells(td.parentElement).indexOf(td);
      const focusCell = (td) => {
        if (!td) return;
        td.focus();
        const range = document.createRange();
        range.selectNodeContents(td);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };
      const navigate = (td, dir) => {
        if (!td) return null;
        const rows = getRows();
        const tr = td.parentElement;
        const rowIdx = rows.indexOf(tr);
        const idx = getCellIndex(td);
        const cells = getEditableCells(tr);
        if (dir === "right") {
          if (idx < cells.length - 1) return cells[idx + 1];
          const nextRow = rows[rowIdx + 1];
          return nextRow ? getEditableCells(nextRow)[0] : null;
        }
        if (dir === "left") return idx > 0 ? cells[idx - 1] : null;
        if (dir === "down") {
          const nextRow = rows[rowIdx + 1];
          return nextRow ? getEditableCells(nextRow)[Math.min(idx, getEditableCells(nextRow).length - 1)] : null;
        }
        if (dir === "up") {
          const prevRow = rows[rowIdx - 1];
          return prevRow ? getEditableCells(prevRow)[Math.min(idx, getEditableCells(prevRow).length - 1)] : null;
        }
        return null;
      };
      const createDayCell = (dayNum, rowRef) => {
        const td = document.createElement("td");
        td.className = `day-cell-${dayNum}`;
        td.contentEditable = true;
        td.style.cssText = COMMON_TD_STYLE;
        td.addEventListener("contextmenu", (ev) => {
          ev.preventDefault();
          showDriverMenu(ev.clientX, ev.clientY, td);
        });
        td.addEventListener("input", () => {
          const selection = window.getSelection();
          const range = selection.rangeCount ? selection.getRangeAt(0) : null;
          const cursorPos = range ? range.startOffset : 0;
          const value = td.textContent.trim().toUpperCase();
          if (td.textContent !== value) {
            td.textContent = value;
            if (td.firstChild) {
              const newRange = document.createRange();
              const newPos = Math.min(cursorPos, td.textContent.length);
              newRange.setStart(td.firstChild, newPos);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
          applyCellColor(td, value);
          applyBaseDayColor(td, year, month, dayNum, holidayMap);
          applyDriverStyle(td);
          updateRowTotal(rowRef);
          applyWeekendSpecialColors(tbody, year, month);
        });
        td.addEventListener("paste", (ev) => {
          ev.preventDefault();
          const text = (ev.clipboardData || window.clipboardData).getData("text").trim().toUpperCase();
          document.execCommand("insertText", false, text);
        });
        td.addEventListener("keydown", (ev) => {
          if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Enter"].includes(ev.key)) {
            ev.preventDefault();
            const dir = ev.key === "ArrowRight" || ev.key === "Enter" ? "right"
            : ev.key === "ArrowLeft" ? "left"
            : ev.key === "ArrowUp" ? "up"
            : "down";
            const next = navigate(td, dir);
            if (next) focusCell(next);
          }
        });
        td.addEventListener("focus", () => focusCell(td));
        return td;
      };
      const addGroupSeparatorRow = (groupTitle) => {
        const trSep = document.createElement("tr");
        trSep.className = "team-separator-row";
        const td = document.createElement("td");
        td.colSpan = 4 + daysInMonth + 2;
        td.style.fontWeight = "bold";
        td.style.textAlign = "center";
        td.style.color = "#ffffff";
        td.style.padding = "4px 8px";
        td.style.letterSpacing = "0.5px";
        td.style.position = "relative";
        const title = groupTitle.toUpperCase();
        if (title.includes("INEM") || title.includes("CENTRAL DE TELECOMUNICAÇÕES") || title.includes("INTERVENÇÃO PERMANENTE 01") || title.includes("INTERVENÇÃO PERMANENTE 02")) {
          td.style.backgroundColor = "#00004d";
        } else if (title.includes("TDNU")) {
          td.style.backgroundColor = "#6b0000";
        } else {
          td.style.backgroundColor = "#2f4f4f";
        }
        const flexContainer = document.createElement("div");
        flexContainer.style.cssText = "display: flex; justify-content: center; align-items: center; position: relative;";
        const titleSpan = document.createElement("span");
        titleSpan.textContent = groupTitle;
        titleSpan.style.cssText = "flex: 1; text-align: center;";
        flexContainer.appendChild(titleSpan);
        if (title.includes("INEM")) {
          const buttonsDiv = document.createElement("div");
          buttonsDiv.style.cssText = "display: flex; gap: 8px; position: absolute; right: 0;";
          const btnAdd = document.createElement("button");
          btnAdd.textContent = "+";
          btnAdd.style.cssText = "background: #10b981; color: white; border: none; border-radius: 4px; width: 20px; height: 20px; cursor: pointer; font-size: 18px; font-weight: bold;";
          btnAdd.addEventListener("click", (e) => {
            e.stopPropagation();
            const nextTeam = getNextTeamNumber("EQ");
            addTeamRows(nextTeam, 2);
            showPopupSuccess(`✅ Equipa INEM Adicionada.`);
          });
          const btnRemove = document.createElement("button");
          btnRemove.textContent = "−";
          btnRemove.style.cssText = "background: #ef4444; color: white; border: none; border-radius: 4px; width: 20px; height: 20px; cursor: pointer; font-size: 18px; font-weight: bold;";
          btnRemove.addEventListener("click", (e) => {
            e.stopPropagation();
            removeEmptyRows("EQ");
          });
          buttonsDiv.appendChild(btnAdd);
          buttonsDiv.appendChild(btnRemove);
          flexContainer.appendChild(buttonsDiv);
        } else if (title.includes("TDNU")) {
          const buttonsDiv = document.createElement("div");
          buttonsDiv.style.cssText = "display: flex; gap: 8px; position: absolute; right: 0;";
          const btnAdd = document.createElement("button");
          btnAdd.textContent = "+";
          btnAdd.style.cssText = "background: #10b981; color: white; border: none; border-radius: 4px; width: 20px; height: 20px; cursor: pointer; font-size: 18px; font-weight: bold;";
          btnAdd.addEventListener("click", (e) => {
            e.stopPropagation();
            const nextTeam = getNextTeamNumber("TDNU");
            addTeamRows(nextTeam, 1);
            showPopupSuccess(`✅ Elemento Adicionado a Serviço Geral.`);
          });
          const btnRemove = document.createElement("button");
          btnRemove.textContent = "−";
          btnRemove.style.cssText = "background: #ef4444; color: white; border: none; border-radius: 4px; width: 20px; height: 20px; cursor: pointer; font-size: 18px; font-weight: bold;";
          btnRemove.addEventListener("click", (e) => {
            e.stopPropagation();
            removeEmptyRows("TDNU");
          });
          buttonsDiv.appendChild(btnAdd);
          buttonsDiv.appendChild(btnRemove);
          flexContainer.appendChild(buttonsDiv);
        } else if (title.includes("CENTRAL DE TELECOMUNICAÇÕES")) {
          const buttonsDiv = document.createElement("div");
          buttonsDiv.style.cssText = "display: flex; gap: 8px; position: absolute; right: 0;";
          const btnAdd = document.createElement("button");
          btnAdd.textContent = "+";
          btnAdd.style.cssText = "background: #10b981; color: white; border: none; border-radius: 4px; width: 20px; height: 20px; cursor: pointer; font-size: 18px; font-weight: bold;";
          btnAdd.addEventListener("click", (e) => {
            e.stopPropagation();
            const nextTeam = getNextTeamNumber("OPC");
            addTeamRows(nextTeam, 1);
            showPopupSuccess(`✅ Elemento Adicionado a Central de Telecomunicações.`);
          });
          const btnRemove = document.createElement("button");
          btnRemove.textContent = "−";
          btnRemove.style.cssText = "background: #ef4444; color: white; border: none; border-radius: 4px; width: 20px; height: 20px; cursor: pointer; font-size: 18px; font-weight: bold;";
          btnRemove.addEventListener("click", (e) => {
            e.stopPropagation();
            removeEmptyRows("OPC");
          });
          buttonsDiv.appendChild(btnAdd);
          buttonsDiv.appendChild(btnRemove);
          flexContainer.appendChild(buttonsDiv);
        }
        td.appendChild(flexContainer);
        trSep.appendChild(td);
        tbody.appendChild(trSep);
      };
      let lastGroupTitle = null;
      rowsData.forEach((item) => {
        const groupTitle = getGroupTitle(item.team);
        if (groupTitle !== lastGroupTitle) {
          addGroupSeparatorRow(groupTitle);
          lastGroupTitle = groupTitle;
        }
        const tr = document.createElement("tr");
        tr.className = "data-row";
        tr.setAttribute("data-nint", item.n_int);
        tr.dataset.entryDate = item.entry_date || null;
        const tdNI = document.createElement("td");
        tdNI.textContent = String(item.n_int).padStart(3, "0");
        tdNI.style.cssText = COMMON_TD_STYLE;
        tr.appendChild(tdNI);
        const tdNome = document.createElement("td");
        tdNome.textContent = item.abv_name || "";
        tdNome.style.cssText = COMMON_TD_STYLE;
        tr.appendChild(tdNome);
        const tdFuncao = document.createElement("td");
        tdFuncao.textContent = item.function || "";
        tdFuncao.style.cssText = COMMON_TD_STYLE + "text-align:center;";
        tr.appendChild(tdFuncao);
        const tdEq = document.createElement("td");
        tdEq.textContent = normalizeTeam(item.team);
        tdEq.style.cssText = COMMON_TD_STYLE + "text-align:center;";
        tr.appendChild(tdEq);
        for (let d = 1; d <= daysInMonth; d++) {
          tr.appendChild(createDayCell(d, tr));
        }
        const tdTotalMensal = document.createElement("td");
        tdTotalMensal.className = "total-mensal-cell";
        tdTotalMensal.textContent = "0";
        tdTotalMensal.style.cssText = COMMON_TD_STYLE + "text-align:center; font-weight:bold; background:#f0f0f0;";
        tr.appendChild(tdTotalMensal);
        const tdTotalAcum = document.createElement("td");
        tdTotalAcum.className = "total-acumulado-cell";
        const acumuladoBase = item._acumulado || 0;
        const horasExtra = item._horasExtra || 0;
        tdTotalAcum.textContent = acumuladoBase + horasExtra;
        tdTotalAcum.dataset.base = acumuladoBase;
        tdTotalAcum.dataset.horasExtra = horasExtra;
        tdTotalAcum.dataset.isJaneiro = item._isJaneiro ? "1" : "0";
        tdTotalAcum.style.cssText = COMMON_TD_STYLE + "text-align:center; font-weight:bold; background:#ffe6e6;";
        tr.appendChild(tdTotalAcum);
        tbody.appendChild(tr);
      });
      for (let d = 1; d <= daysInMonth; d++) {
        const date = atNoonLocal(year, month - 1, d);
        if (date.getDay() === 0 || date.getDay() === 6) {
          tbody.querySelectorAll(`.day-cell-${d}`).forEach((td) => {
            const val = (td.textContent || "").trim().toUpperCase();
            const hasShift = !!SHIFT_VALUES[val] || !!SHIFT_COLORS[val];
            if (!hasShift) td.style.backgroundColor = WEEKEND_COLOR || "#f9e0b0";
          });
        }
      }
      paintWeekendHeaders(table, year, month, daysInMonth);
      paintHolidaysOnTable(tbody, table, year, month, daysInMonth, holidayMap);
      enableRowDragAndDrop(tbody);
      const firstEditable = tbody.querySelector("tr.data-row td[contenteditable='true']");
      if (firstEditable) firstEditable.focus();
      if (data._shifts) {
        applyShiftsToTable(data._shifts);
        tbody.querySelectorAll("tr.data-row").forEach(row => updateRowTotal(row));
        tbody.querySelectorAll("tr.data-row").forEach(row => {
          row.querySelectorAll("td[contenteditable='true']").forEach((td, idx) => {
            applyBaseDayColor(td, year, month, idx + 1, holidayMap);
          });
        });
        paintWeekendHeaders(table, year, month, daysInMonth);
        paintHolidaysOnTable(tbody, table, year, month, daysInMonth, holidayMap);
        await loadWeekendAdjacentData(year, month);
        applyWeekendSpecialColors(tbody, year, month);
      }
      const temp = document.createElement("div");
      temp.style.cssText = infoHost.style.cssText;
      displayWorkingHoursInfo(temp, year, month);
      displayTurnosLegend(temp, year, month);
      infoHost.replaceChildren(...temp.childNodes);
    }
    async function cleanEmployeeScales({ autoSave = false } = {}) {
      const tbody = document.querySelector("table.employees-table tbody");
      if (!tbody) {
        showPopupWarning("Nenhuma tabela aberta.");
        return;
      }
      const yearSelect = document.getElementById("year-employees");
      const monthBtn = document.querySelector("#months-container-scales-employees .btn.active");
      if (!monthBtn || !yearSelect) {
        showPopupWarning("Seleciona mês e ano primeiro.");
        return;
      }
      const year = parseInt(yearSelect.value, 10);
      const month = Array.from(document.querySelectorAll("#months-container-scales-employees .btn")).indexOf(monthBtn) + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      const table = tbody.closest("table");
      const holidayMap = getHolidayMapForMonth(year, month);
      const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
      rows.forEach((row) => {
        const dayCells = Array.from(row.querySelectorAll("td[contenteditable='true']")).slice(0, daysInMonth);
        dayCells.forEach((cell, idx) => {
          const dayNum = idx + 1;
          cell.textContent = "";
          delete cell.dataset.driver;
          cell.style.color = "";
          cell.style.fontWeight = "";
          cell.style.backgroundColor = "";
          cell.title = "";
          applyBaseDayColor(cell, year, month, dayNum, holidayMap);
        });
        const totalMensalCell = row.querySelector(".total-mensal-cell");
        if (totalMensalCell) totalMensalCell.textContent = "0";
        const totalAcumCell = row.querySelector(".total-acumulado-cell");
        if (totalAcumCell) {
          const acumuladoBase = parseFloat(totalAcumCell.dataset.base || 0);
          const horasExtra = parseFloat(totalAcumCell.dataset.horasExtra || 0);
          const isJaneiro = (totalAcumCell.dataset.isJaneiro === "1");
          const cargaObrigatoria = calculateWorkingHours(year, month).workingHours;          
          const diferencaMes = 0 - cargaObrigatoria + horasExtra;
          let totalAcumulado;
          if (isJaneiro) {
            totalAcumulado = diferencaMes;
          } else {
            totalAcumulado = acumuladoBase + diferencaMes;
          }
          totalAcumCell.textContent = String(totalAcumulado);
        }
      });
      if (table) {
        paintWeekendHeaders(table, year, month, daysInMonth);
        paintHolidaysOnTable(tbody, table, year, month, daysInMonth, holidayMap);
      }
      showPopupSuccess("✅ Turnos Removidos. Escala Reíniciada.");
    }
    async function saveEmployeeScales() {
      const tbody = document.querySelector("table.employees-table tbody");
      if (!tbody) {
        showPopupWarning("Nenhuma tabela aberta.");
        return;
      }
      const yearSelect = document.getElementById("year-employees");
      const monthBtn = document.querySelector("#months-container-scales-employees .btn.active");
      if (!monthBtn || !yearSelect) {
        showPopupWarning("Seleciona mês e ano primeiro.");
        return;
      }
      const year = parseInt(yearSelect.value, 10);
      const month = Array.from(document.querySelectorAll("#months-container-scales-employees .btn")).indexOf(monthBtn) + 1;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const guardarBtn = document.getElementById("guardar-escala-btn");
      if (guardarBtn) {
        guardarBtn.disabled = true;
        guardarBtn.textContent = "A guardar...";
      }
      try {
        const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
        const shiftsPayload = [];
        const employeesUpdate = [];
        const acumuladosPayload = [];
        rows.forEach((row, position) => {
          const nInt = parseInt(row.getAttribute("data-nint"), 10);
          const abvName = row.querySelector("td:nth-child(2)")?.textContent.trim() || "";
          const func = row.querySelector("td:nth-child(3)")?.textContent.trim() || "";
          const team = row.querySelector("td:nth-child(4)")?.textContent.trim() || "";
          if (!nInt || !abvName) return;
          employeesUpdate.push({n_int: nInt, abv_name: abvName, function: func, team: team, corp_oper_nr: corpOperNr});
          const dayCells = row.querySelectorAll("td[contenteditable='true']");
          dayCells.forEach((cell, idx) => {
            const day = idx + 1;
            const shift = cell.textContent.trim().toUpperCase();
            const customBg = cell.dataset.customBg || null;
            const customColor = cell.dataset.customColor || null;
            const hasCustomColors = customBg || customColor;
            if (shift || hasCustomColors) {
              shiftsPayload.push({n_int: nInt, abv_name: abvName, day: day, month: month, year: year, shift: shift === "" ? " " : shift, team: team, function: func, position: position, 
                                  corp_oper_nr: corpOperNr, is_driver: (cell.dataset.driver === "1"), is_other: (cell.dataset.outro === "1"), custom_bg_color: customBg,
                                  custom_text_color: customColor});}});
          const totalMensal = calculateRowTotal(row);
          const celulas = row.cells;
          const totalAcumuladoTexto = celulas[celulas.length - 1].textContent.trim();
          const totalAcumulado = parseFloat(totalAcumuladoTexto.replace(',', '.')) || 0;
          acumuladosPayload.push({n_int: nInt, abv_name: abvName, year: year, month: month, total_mensal: totalMensal, horas_extra: 0, 
                                  total_acumulado: totalAcumulado, corp_oper_nr: corpOperNr});});
        const deleteShifts = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          }
        );
        if (!deleteShifts.ok) throw new Error("Erro ao limpar shifts antigos");
        if (shiftsPayload.length > 0) {
          const insertShifts = await fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts`, {
            method: "POST",
            headers: {
              ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(shiftsPayload)
          });
          if (!insertShifts.ok) {
            const errText = await insertShifts.text();
            throw new Error("Erro ao guardar shifts: " + errText);
          }
        }
        await Promise.all(
          employeesUpdate.map(emp => fetch(
            `${SUPABASE_URL}/rest/v1/reg_employees?n_int=eq.${emp.n_int}&corp_oper_nr=eq.${emp.corp_oper_nr}`, {
              method: "PATCH",
              headers: {
                ...getSupabaseHeaders(),
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
              },
              body: JSON.stringify({abv_name: emp.abv_name, function: emp.function, team: emp.team})
            }
          ).then(r => {
            if (!r.ok) console.warn(`⚠️ Erro ao atualizar employee ${emp.n_int}`);
          }).catch(err => {
            console.warn(`⚠️ Erro ao atualizar employee ${emp.n_int}:`, err);
          }))
        );
        const deleteAcum = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, {
            method: "DELETE",
            headers: getSupabaseHeaders() 
          }
        );
        if (!deleteAcum.ok) console.warn("⚠️ Erro ao limpar acumulados antigos");
        if (acumuladosPayload.length > 0) {
          const insertAcum = await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_acumul`, {
            method: "POST",
            headers: {
              ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(acumuladosPayload)
          });
          if (!insertAcum.ok) {
            const errText = await insertAcum.text();
            console.warn("⚠️ Erro ao guardar acumulados:", errText);
          } else {
          }
        }
        showPopupSuccess(`✅ Escala de ${monthBtn.textContent} ${year} guardada com sucesso!`);
      } catch (err) {
        console.error("Erro ao guardar escala:", err);
        showPopupWarning("❌ Erro ao guardar: " + err.message);
      } finally {
        if (guardarBtn) {
          guardarBtn.disabled = false;
          guardarBtn.textContent = "Guardar";
        }
      }
    }
    async function emitEmployeesScale(format = "xlsx") {
      const table = document.querySelector("table.employees-table") || document.querySelector("table.employees-table");
      const tbody = table?.querySelector("tbody");
      if (!tbody) {
        console.error("Erro: não encontrei a tabela (tbody). A tabela ainda não foi carregada?");
        return;
      }
      const yearEl = document.getElementById("year-employees");
      const monthsContainer = document.getElementById("months-container-scales-employees");
      const monthBtn = monthsContainer?.querySelector(".btn.active");
      if (!yearEl || !monthBtn) {
        console.error("Erro: ano/mês não selecionados ou elementos não encontrados.");
        return;
      }
      const year = parseInt(yearEl.value, 10);
      const month = Array.from(monthsContainer.querySelectorAll(".btn")).indexOf(monthBtn) + 1;
      try {
        const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
        if (rows.length === 0) {
          console.error("Erro: não encontrei linhas .data-row na tabela.");
          return;
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        const employees = rows.map(row => {
          const dayCells = Array.from(row.querySelectorAll("td[contenteditable='true']")).slice(0, daysInMonth);
          return {
            n_int: row.querySelector("td:nth-child(1)")?.textContent.trim() || "",
            abv_name: row.querySelector("td:nth-child(2)")?.textContent.trim() || "",
            function: row.querySelector("td:nth-child(3)")?.textContent.trim() || "",
            team: row.querySelector("td:nth-child(4)")?.textContent.trim() || "",
            total: parseInt(row.querySelector(".total-mensal-cell")?.textContent.trim() || "0", 10),
            shifts: dayCells.map(c => c.textContent.trim().toUpperCase()),
            cellColors: dayCells.map(cell => {
              const bg = getComputedStyle(cell).backgroundColor;
              const rgb = bg.match(/\d+/g);
              if (!rgb || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") return "FFFFFF";
              return rgb.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, "0")).join("").toUpperCase();
            })
          };
        });
        const {workingHours} = calculateWorkingHours(year, month);
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "escalas", year, month, employees, workingHours, format})
        });
        if (!response.ok) {
          const txt = await response.text().catch(() => "");
          throw new Error(`Erro API: ${response.status} ${txt}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Escala_Funcionários_${month}_${year}.${format === "pdf" ? "pdf" : "xlsx"}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Erro ao gerar folha:", err);
      }
    }
    function showLoadingPopup(message) {
      const existingPopup = document.getElementById("loading-popup");
      if (existingPopup) existingPopup.remove();
      const popup = document.createElement("div");
      popup.id = "loading-popup";
      popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px 40px; border-radius: 12px;
                             box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 10000; text-align: center; min-width: 350px;`;
      const spinner = document.createElement("div");
      spinner.style.cssText = `border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;
                               margin: 0 auto 20px;`;
      const text = document.createElement("p");
      text.id = "loading-popup-text";
      text.textContent = message;
      text.style.cssText = `font-size: 16px; font-weight: bold; color: #333; margin: 0;`;
      popup.appendChild(spinner);
      popup.appendChild(text);
      const overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;`;
      document.body.appendChild(overlay);
      document.body.appendChild(popup);
      if (!document.getElementById("spinner-style")) {
        const style = document.createElement("style");
        style.id = "spinner-style";
        style.textContent = `@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`;
        document.head.appendChild(style);
      }
    }
    function updateLoadingPopup(message) {
      const text = document.getElementById("loading-popup-text");
      if (text) text.textContent = message;
    }
    function hideLoadingPopup() {
      const popup = document.getElementById("loading-popup");
      const overlay = document.getElementById("loading-overlay");
      if (popup) popup.remove();
      if (overlay) overlay.remove();
    }
    async function emitStitchSheets() {
      const tbody = document.querySelector("table.employees-table tbody");
      if (!tbody) {
        showPopupWarning("Nenhuma tabela aberta.");
        return;
      }
      const yearSelect = document.getElementById("year-employees");
      const monthBtn = document.querySelector("#months-container-scales-employees .btn.active");
      if (!monthBtn || !yearSelect) {
        showPopupWarning("Selecione mês e ano primeiro.");
        return;
      }
      const year = parseInt(yearSelect.value, 10);
      const month = Array.from(document.querySelectorAll("#months-container-scales-employees .btn")).indexOf(monthBtn) + 1;
      const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
      try {
        const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
        const daysInMonth = new Date(year, month, 0).getDate();
        const employees = rows.map(row => {
          const dayCells = row.querySelectorAll("td[contenteditable='true']");
          const shifts = [];
          const cellColors = [];
          for (let d = 0; d < daysInMonth; d++) {
            const cell = dayCells[d];
            shifts.push(cell?.textContent.trim().toUpperCase() || "");
            if (cell) {
              const bgColor = window.getComputedStyle(cell).backgroundColor;
              const rgb = bgColor.match(/\d+/g);
              if (rgb && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
                const hex = rgb.slice(0, 3)
                .map(x => parseInt(x).toString(16).padStart(2, "0"))
                .join("")
                .toUpperCase();
                cellColors.push(hex);
              } else {
                cellColors.push("FFFFFF");
              }
            } else {
              cellColors.push("FFFFFF");
            }
          }
          return {
            abv_name: row.querySelector("td:nth-child(2)")?.textContent.trim() || "",
            function: row.querySelector("td:nth-child(3)")?.textContent.trim() || "",
            shifts: shifts,
            cellColors: cellColors,
            total: parseInt(row.querySelector(".total-mensal-cell")?.textContent.trim() || "0", 10)
          };
        }).filter(emp => emp.abv_name);
        if (employees.length === 0) {
          showPopupWarning("Nenhum funcionário encontrado.");
          return;
        }
        showLoadingPopup(`🔄 A iniciar geração de ${employees.length} folhas...`);
        const workingHours = calculateWorkingHours(year, month).workingHours;
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();
        for (let i = 0; i < employees.length; i++) {
          const emp = employees[i];
          updateLoadingPopup(`📄 A processar [${i + 1}/${employees.length}]: ${emp.abv_name}`);
          const response = await fetch('https://cb360-online.vercel.app/api/employees_convert_and_send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({mode: "folha_ponto", year, month, employee: emp, workingHours})
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro no funcionário ${emp.abv_name}: ${errorData.error || 'Falha na API'}`);
          }
          const pdfBytes = await response.arrayBuffer();
          const donorPdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        updateLoadingPopup("💾 A gerar ficheiro final...");
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Folhas_Ponto_${MONTH_NAMES[month - 1]}_${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        hideLoadingPopup();
        showPopupSuccess("✅ Todas as folhas foram geradas com sucesso!");
      } catch (err) {
        hideLoadingPopup();
        console.error("❌ Erro completo:", err);
        showPopupWarning("❌ Erro: " + err.message);
      }
    }
    document.querySelectorAll(".sidebar-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.page;
        if (page === "page-employee-scales") {
          const tableContainer = document.getElementById("table-container-employees");
          const optionsContainer = document.getElementById("employee-scales-options");
          if (tableContainer) tableContainer.innerHTML = "";
          if (optionsContainer) optionsContainer.style.display = "none";
          createEmployeeScalesMonthButtons({
            monthsContainerId: "months-container-scales-employees",
            tableContainerId: "table-container-employees",
            yearSelectId: "year-employees",
            optionsContainerId: "employee-scales-options",
            loadDataFunc: async (year, month) => await loadScalesEmployees(year, month),
            createTableFunc: createEscalasTable
          });
        }
      });
    });
    document.getElementById("employees-clean-btn")?.addEventListener("click", cleanEmployeeScales);
    document.getElementById("employees-save-btn")?.addEventListener("click", saveEmployeeScales);
    document.getElementById("employees-emit-xlsx-btn")?.addEventListener("click", () => emitEmployeesScale("xlsx"));
    document.getElementById("employees-emit-pdf-btn")?.addEventListener("click", () => emitEmployeesScale("pdf"));
    document.getElementById("employees-emit-stitch-marker-btn")?.addEventListener("click", emitStitchSheets);
    
    
    
    
    
    
    
    
    
    
    /* ============================================
    FASE 02 - EMPLOYEE EXTRA HOURS CONTROL
    ============================================ */  
    /* == EMPLOYEES EXTRA HOURS MONTH BUTTONS == */
    function createEmployeeExtraHourMonthButtons({
      monthsContainerId,
      tableContainerId,
      yearSelectId,
      optionsContainerId,
      loadDataFunc,
      createTableFunc
    }) {
      const container = document.getElementById(monthsContainerId);
      if (!container) return;
      container.innerHTML = "";
      const mainWrapper = document.createElement("div");
      Object.assign(mainWrapper.style, {display: "flex", flexDirection: "column", alignItems: "center", gap: "12px"});
      const yearContainer = document.createElement("div");
      Object.assign(yearContainer.style, {display: "flex", alignItems: "center", gap: "8px"});
      const yearLabel = document.createElement("label");
      yearLabel.textContent = "Ano:";
      yearLabel.style.fontWeight = "bold";
      const yearSelect = document.createElement("select");
      yearSelect.id = yearSelectId;
      Object.assign(yearSelect.style, {padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer"});
      const targetYear = new Date().getFullYear();
      for (let y = 2025; y <= 2035; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        if (y === targetYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }
      yearSelect.value = targetYear;
      yearContainer.append(yearLabel, yearSelect);
      const monthsWrapper = document.createElement("div");
      Object.assign(monthsWrapper.style, {display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px", maxWidth: "800px"});
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      monthNames.forEach((month, idx) => {
        const btn = document.createElement("button");
        btn.textContent = month;
        btn.className = "btn btn-add";
        Object.assign(btn.style, {fontSize: "14px", fontWeight: "bold", width: "110px", height: "40px", borderRadius: "4px", margin: "2px"});
        btn.addEventListener("click", async () => {
          const tableContainer = document.getElementById(tableContainerId);
          const optionsContainer = document.getElementById(optionsContainerId);
          const isActive = btn.classList.contains("active");
          if (isActive) {
            if (tableContainer) tableContainer.innerHTML = "";
            if (optionsContainer) optionsContainer.style.display = "none";
            btn.classList.remove("active");
            return;
          }
          monthsWrapper.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const yearVal = parseInt(yearSelect.value, 10);
          const monthNum = idx + 1;
          const data = await loadDataFunc(yearVal, monthNum);
          await createTableFunc(tableContainerId, yearVal, monthNum, data);
          if (optionsContainer) optionsContainer.style.display = "flex";
        });
        monthsWrapper.appendChild(btn);
      });
      mainWrapper.append(yearContainer, monthsWrapper);
      container.appendChild(mainWrapper);
      setTimeout(() => { yearSelect.value = targetYear; }, 0);
    }
    function horasDecimaisToMinutes(horas) {
      if (!horas || horas <= 0) return 0;
      return Math.round(horas * 60);
    }
    function minutesToHHMM(minutes) {
      if (!minutes || minutes <= 0) return "";
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    function isValidHHMM(value) {
      return /^\d{1,2}:\d{2}$/.test(value);
    }
    /* ====== CREATE AND SAVE EXTRA HOURS ====== */
    async function createExtraHoursTable(containerId, year, month, data) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const rowsData = data?.employees || [];
      container.innerHTML = "";
      const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
      const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
      const daysInMonth = new Date(year, month, 0).getDate();
      const holidayMap = getHolidayMapForMonth(year, month);
      const title = document.createElement("h3");
      title.textContent = `HORAS EXTRA - ${MONTH_NAMES[month - 1]} ${year}`;
      Object.assign(title.style, {textAlign: "center", margin: "20px 0 -15px 0", background: "#667eea", height: "30px", borderRadius: "3px", lineHeight: "30px", color: "white"});
      container.appendChild(title);
      const wrapper = createTableWrapper(container);
      wrapper.style.height = "500px";
      wrapper.style.overflowY = "auto";
      const table = document.createElement("table");
      table.className = "employees-table extra-hours-table";
      Object.assign(table.style, { width: "100%", borderCollapse: "separate" });
      const thead = document.createElement("thead");
      function getDayStyle(d, extraCss = "") {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const dow = date.getDay();
        const holiday = holidayMap.get(d);
        let bg = null;
        if (holiday) bg = holiday.optional ? "#d6ecff" : "#f7c6c7";
        else if (dow === 0 || dow === 6) bg = "#f9e0b0";
        return bg
          ? COMMON_TH_STYLE + `background: ${bg}; color: #000; ${extraCss}`
        : COMMON_TH_STYLE + extraCss;
      }
      const trWeek = document.createElement("tr");
      ["NI", "Nome"].forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.rowSpan = 2;
        th.style.cssText = COMMON_TH_STYLE + "border-bottom: 2px solid #ccc;";
        if (i === 0) th.style.width = "40px";
        if (i === 1) th.style.width = "140px";
        trWeek.appendChild(th);
      });
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        if (d > daysInMonth) {
          th.style.display = "none";
        } else {
          const dow = new Date(year, month - 1, d, 12, 0, 0).getDay();
          th.textContent = WEEKDAY_NAMES[dow];
          th.style.cssText = getDayStyle(d);
        }
        trWeek.appendChild(th);
      }
      const thTotalMensal = document.createElement("th");
      thTotalMensal.innerHTML = "TOTAL<br>Mês";
      thTotalMensal.rowSpan = 2;
      thTotalMensal.style.cssText = COMMON_TH_STYLE + "border-bottom: 2px solid #ccc; width: 70px; background: #131a69; color: #fff; line-height: 16px;";
      trWeek.appendChild(thTotalMensal);
      thead.appendChild(trWeek);
      const trNums = document.createElement("tr");
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.textContent = d;
        if (d > daysInMonth) {
          th.style.display = "none";
        } else {
          th.style.cssText = getDayStyle(d, "border-bottom: 2px solid #ccc;");
        }
        trNums.appendChild(th);
      }
      thead.appendChild(trNums);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      wrapper.appendChild(table);
      Array.from(thead.querySelectorAll("th")).forEach((th) => {
        th.style.position = "sticky";
        th.style.top = "0";
        th.style.zIndex = "10";
      });
      function getDayCellBg(d) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const dow = date.getDay();
        const holiday = holidayMap.get(d);
        if (holiday) return holiday.optional ? "#d6ecff" : "#f7c6c7";
        if (dow === 0 || dow === 6) return "#f9e0b0";
        return null;
      }
      rowsData.forEach((item) => {
        const tr = document.createElement("tr");
        tr.className = "data-row";
        tr.setAttribute("data-nint", item.n_int);
        const tdNI = document.createElement("td");
        tdNI.textContent = String(item.n_int).padStart(3, "0");
        tdNI.style.cssText = COMMON_TD_STYLE;
        tr.appendChild(tdNI);
        const tdNome = document.createElement("td");
        tdNome.textContent = item.abv_name || "";
        tdNome.style.cssText = COMMON_TD_STYLE;
        tr.appendChild(tdNome);
        for (let d = 1; d <= daysInMonth; d++) {
          const td = document.createElement("td");
          td.className = `day-cell-${d}`;
          td.contentEditable = true;
          const savedMinutes = item.extra_hours?.[d - 1] || 0;
          td.textContent = minutesToHHMM(savedMinutes);
          const bgColor = getDayCellBg(d);
          td.style.cssText = COMMON_TD_STYLE + "text-align: center;";
          if (bgColor) td.style.backgroundColor = bgColor;
          td.addEventListener("blur", () => {
            const raw = td.textContent.trim();
            if (raw === "" || !isValidHHMM(raw)) {
              td.textContent = "";
            } else {
              const [h, m] = raw.split(":").map(Number);
              td.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            }
            updateExtraHoursTotals(tr);
          });
          td.addEventListener("keydown", (ev) => {
            if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Enter"].includes(ev.key)) return;
            ev.preventDefault();
            const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
            const cells = Array.from(tr.querySelectorAll("td[contenteditable='true']"));
            const currentIdx = cells.indexOf(td);
            const rowIdx = rows.indexOf(tr);
            let nextCell = null;
            if (ev.key === "ArrowRight" || ev.key === "Enter") {
              nextCell = currentIdx < cells.length - 1 ? cells[currentIdx + 1] : rows[rowIdx + 1]?.querySelectorAll("td[contenteditable='true']")[0];
            } else if (ev.key === "ArrowLeft") {
              nextCell = currentIdx > 0 ? cells[currentIdx - 1] : null;
            } else if (ev.key === "ArrowDown") {
              const nextCells = Array.from(rows[rowIdx + 1]?.querySelectorAll("td[contenteditable='true']") || []);
              nextCell = nextCells[Math.min(currentIdx, nextCells.length - 1)];
            } else if (ev.key === "ArrowUp") {
              const prevCells = Array.from(rows[rowIdx - 1]?.querySelectorAll("td[contenteditable='true']") || []);
              nextCell = prevCells[Math.min(currentIdx, prevCells.length - 1)];
            }
            if (nextCell) {
              nextCell.focus();
              const range = document.createRange();
              range.selectNodeContents(nextCell);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
          });
          tr.appendChild(td);
        }
        const tdTotalMensal = document.createElement("td");
        tdTotalMensal.className = "total-mensal-extra-cell";
        tdTotalMensal.style.cssText = COMMON_TD_STYLE + "text-align: center; font-weight: bold; background: #f0f0f0;";
        tr.appendChild(tdTotalMensal);
        tbody.appendChild(tr);
        updateExtraHoursTotals(tr);
      });
      const firstEditable = tbody.querySelector("tr.data-row td[contenteditable='true']");
      if (firstEditable) firstEditable.focus();
    }
    function updateExtraHoursTotals(row) {
      const cells = row.querySelectorAll("td[contenteditable='true']");
      let totalMinutes = 0;
      cells.forEach(cell => {
        const value = (cell.textContent || "").trim();
        if (/^\d{1,2}:\d{2}$/.test(value)) {
          const [h, m] = value.split(":").map(Number);
          totalMinutes += h * 60 + m;
        }
      });
      const totalMonthCell = row.querySelector(".total-mensal-extra-cell");
      if (totalMonthCell) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        totalMonthCell.textContent = totalMinutes > 0 ? (m > 0 ? `${h}h${String(m).padStart(2, "0")}m` : `${h}h`) : "0h";
      }
    }
    async function saveExtraHours() {
      const tbody = document.querySelector("table.extra-hours-table tbody");
      if (!tbody) {
        showPopupWarning("Nenhuma tabela aberta."); 
        return; 
      }
      const yearSelect = document.getElementById("year-extra-hour-employees");
      const monthBtn = document.querySelector("#months-container-extra-hour-employees .btn.active");
      if (!monthBtn || !yearSelect) {
        showPopupWarning("Selecione mês e ano primeiro."); 
        return; 
      }
      const year = parseInt(yearSelect.value, 10);
      const month = Array.from(document.querySelectorAll("#months-container-extra-hour-employees .btn")).indexOf(monthBtn) + 1;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const guardarBtn = document.getElementById("employees-extra-save-btn");
      if (guardarBtn) { 
        guardarBtn.disabled = true; 
        guardarBtn.textContent = "A guardar..."; 
      }
      try {
        const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
        const recordsDiarios = [];
        const acumuladosPayload = [];
        const listaNIs = [];
        rows.forEach(row => {
          const n_int = parseInt(row.querySelector("td:nth-child(1)")?.textContent.trim());
          const abv_name = row.querySelector("td:nth-child(2)")?.textContent.trim();
          const cells = row.querySelectorAll("td[contenteditable='true']");
          let totalMinutosMes = 0;
          if (!isNaN(n_int)) listaNIs.push(n_int);
          cells.forEach((cell, idx) => {
            const value = cell.textContent.trim();
            if (value && isValidHHMM(value)) {
              const [h, m] = value.split(":").map(Number);
              const totalMinutes = h * 60 + m;
              if (totalMinutes > 0) {
                totalMinutosMes += totalMinutes;
                recordsDiarios.push({n_int, abv_name, year, month, day: idx + 1, qtd_hours: parseFloat((totalMinutes / 60).toFixed(2)), corp_oper_nr: corpOperNr});
              }
            }
          });
          acumuladosPayload.push({n_int, abv_name, year, month, total_mensal: 0, horas_extra: parseFloat((totalMinutosMes / 60).toFixed(2)), total_acumulado: 0, corp_oper_nr: corpOperNr});
        });
        await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_extra_hours?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, { 
          method: "DELETE", 
          headers: getSupabaseHeaders() 
        });
        if (recordsDiarios.length > 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_extra_hours`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
            body: JSON.stringify(recordsDiarios)
          });
        }
        if (acumuladosPayload.length > 0) {
          const stringNIs = listaNIs.join(",");
          await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}&n_int=in.(${stringNIs})`, {
            method: "DELETE",
            headers: getSupabaseHeaders()
          });
          const respAcum = await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_acumul`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
            body: JSON.stringify(acumuladosPayload)
          });
          if (!respAcum.ok) {
            const errorText = await respAcum.text();
            console.error("Erro ao inserir acumulados:", errorText);
            throw new Error("Erro na inserção final.");
          }
        }
        showPopupSuccess(`✅ Dados atualizados com sucesso!`);
      } catch (error) {
        console.error(error);
        showPopupWarning("❌ Erro ao atualizar dados.");
      } finally {
        if (guardarBtn) { 
          guardarBtn.disabled = false; 
          guardarBtn.textContent = "Guardar"; 
        }
      }
    }
    async function loadExtraHours(year, month) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const [empRes, hoursRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?select=n_int,abv_name&corp_oper_nr=eq.${corpOperNr}`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees_extra_hours?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, {
            headers: getSupabaseHeaders()
          })
        ]);
        const allEmployees = await empRes.json();
        const hoursData = await hoursRes.json();
        const employeesMap = new Map();
        allEmployees.forEach(emp => {
          employeesMap.set(emp.n_int, {n_int: emp.n_int, abv_name: emp.abv_name, extra_hours: new Array(31).fill(0)});
        });
        hoursData.forEach(record => {
          if (employeesMap.has(record.n_int)) {
            employeesMap.get(record.n_int).extra_hours[record.day - 1] = Math.round(record.qtd_hours * 60);
          }
        });
        const employeesList = Array.from(employeesMap.values()).sort((a, b) => a.n_int - b.n_int);
        return {employees: employeesList};
      } catch (error) {
        return {employees: []};
      }
    }
    document.querySelectorAll(".sidebar-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.page;
        if (page === "page-employee-extra-hour") {
          const tableContainer = document.getElementById("table-container-extra-hour-employees");
          const optionsContainer = document.getElementById("employee-extra-hours-options");
          if (tableContainer) tableContainer.innerHTML = "";
          if (optionsContainer) optionsContainer.style.display = "none";
          createEmployeeExtraHourMonthButtons({
            monthsContainerId: "months-container-extra-hour-employees",
            tableContainerId: "table-container-extra-hour-employees",
            yearSelectId: "year-extra-hour-employees",
            optionsContainerId: "employee-extra-hours-options",
            loadDataFunc: async (year, month) => await loadExtraHours(year, month),
            createTableFunc: createExtraHoursTable
          });
        }
      });
    });
    document.getElementById("employees-extra-save-btn")?.addEventListener("click", saveExtraHours);
    
    
    
    
    
    
    
    
    
    
    /* ============================================
    FASE 03 - EMPLOYEE INDIVIDUAL REGISTERS
    ============================================ */  
    /* ====== CREATE AND SAVE EXTRA HOURS ====== */
