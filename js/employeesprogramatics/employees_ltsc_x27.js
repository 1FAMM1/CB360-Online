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
      for (let y = 2026; y <= 2036; y++) {
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
    const COMMON_EMP_TH_STYLE = "border: 1px solid #ccc; border-top: 0px solid #ccc; border-left: 0px solid #ccc; width: 35px; padding: 2px; font-size: 11px; text-align: center; background: #f0f0f0;";
    const COMMON_EMP_TD_STYLE = "border: 1px solid #ccc; border-top: 0px solid #ccc; border-left: 0px solid #ccc; padding: 4px; text-align: center; font-size: 13px; width: 35px;";
    const TEAM_ORDER = ["EQ01", "EQ02", "EQ03", "EQ04", "EQ05", "EQ06", "EQ07", "EQ08", "EQ09", "EQ10","TDNU", "OPC", "EP1", "EP2"];
    const SHIFT_VALUES = {"D": 12, "N": 12, "FR": 24, "FE": 8, "M": 8, "BX": 8, "FOR": 8, 
                          "FO": 0, "LC": 8, "LP": 8, "DP": 0, "LN": 8, "FI": 8, "FJ": 8};
    const SHIFT_COLORS = {"D": {bg: "#FFFF00", color: "#000000"}, "N": {bg: "#00008B", color: "#FFFFFF"}, "M": {bg: "#D3D3D3", color: "#000000"}, "FR": {bg: "#FFA500", color: "#000000"},
                          "FO": {bg: "#92D050", color: "#000000"}, "FE": {bg: "#00B0F0", color: "#000000"}, "BX": {bg: "#FF0000", color: "#FFFFFF"}, "LC": {bg: "#FF0000", color: "#FFFFFF"},
                          "LN": {bg: "#FF0000", color: "#FFFFFF"}, "LP": {bg: "#FF0000", color: "#FFFFFF"}, "FI": {bg: "#FF0000", color: "#FFFFFF"}, "FJ": {bg: "#FF0000", color: "#FFFFFF"},
                          "FOR": {bg: "#808080", color: "#FFFFFF"}, "DP": {bg: "#000000", color: "#FFFFFF"}};
    const WEEKEND_EMPLOYEES_COLOR = "#f9e0b0";
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
        td.style.backgroundColor = WEEKEND_EMPLOYEES_COLOR || "#f9e0b0";
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
      infoDiv.style.cssText = `margin-top: 5px; padding: 12px; background: #f0f8ff; border: 1px solid #4682b4; border-radius: 5px; font-family: 'Segoe UI', sans-serif;
                               display: inline-block; width: fit-content; width: 315px; height: 150px;`;
      const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
      let holidaysHTML = '';
      if (info.holidaysInMonth.length > 0) {
        holidaysHTML = `
          <div>
            <strong style="color:#1e3a8a;">🎉 Feriados:</strong>
            <span style="color:#6b7280;">
              ${info.holidaysInMonth
                .map(h => `Dia: ${h.day}`)
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
      if (td.dataset.other !== "1") return;
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
      const btnDriver = document.createElement("button");
      btnDriver.type = "button";
      btnDriver.style.cssText = `border: none; background: #f0f0f0; padding: 8px 12px; cursor: pointer; width: 100%; 
                           text-align: left; display: block; border-radius: 4px; font-size: 12px;`;
      btnDriver.addEventListener("mouseover", () => btnDriver.style.background = "#e0e0e0");
      btnDriver.addEventListener("mouseout", () => btnDriver.style.background = "#f0f0f0");
      btnDriver.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!__driverMenuCell) return;
        const isDriver = __driverMenuCell.dataset.driver === "1";
        if (isDriver) {
          __driverMenuCell.dataset.driver = "0";
          const val = (__driverMenuCell.textContent || "").trim().toUpperCase();
          applyCellColor(__driverMenuCell, val);
        } else {
          __driverMenuCell.dataset.driver = "1";
          __driverMenuCell.dataset.other = "0"; 
          applyDriverStyle(__driverMenuCell);
        }
        hideDriverMenu();
      });
      menu.appendChild(btnDriver);
      const btnOther = document.createElement("button");
      btnOther.type = "button";
      btnOther.style.cssText = `border: none; background: #f0f0f0; padding: 8px 12px; cursor: pointer; width: 100%; 
                                text-align: left; display: block; border-radius: 4px; font-size: 12px;`;
      btnOther.addEventListener("mouseover", () => btnOther.style.background = "#e0e0e0");
      btnOther.addEventListener("mouseout", () => btnOther.style.background = "#f0f0f0");
      btnOther.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!__driverMenuCell) return;
        const isOther = __driverMenuCell.dataset.other === "1";
        if (isOther) {
          __driverMenuCell.dataset.other = "0";
          const val = (__driverMenuCell.textContent || "").trim().toUpperCase();
          applyCellColor(__driverMenuCell, val);
        } else {
          __driverMenuCell.dataset.other = "1";
          __driverMenuCell.dataset.driver = "0";
          __driverMenuCell.style.backgroundColor = "#800080";
          __driverMenuCell.style.color = "#ffffff";
          __driverMenuCell.style.fontWeight = "bold";
        }
        hideDriverMenu();
      });
      menu.appendChild(btnOther);      
      document.body.appendChild(menu);
      __driverMenu = menu;
      __driverMenu._btnDriver = btnDriver;
      __driverMenu._btnOther = btnOther;
      document.addEventListener("click", hideDriverMenu);
      document.addEventListener("scroll", hideDriverMenu, true);
    }
    function showDriverMenu(x, y, cell) {
      ensureDriverMenu();
      __driverMenuCell = cell;
      const tr = cell.closest("tr");
      const isInem = isINEMRow(tr);
      if (isInem) {
        __driverMenu._btnDriver.style.display = "block";
        const isDriver = cell.dataset.driver === "1";
        __driverMenu._btnDriver.textContent = isDriver ? "Remover Motorista INEM" : "Motorista INEM";
      } else {
        __driverMenu._btnDriver.style.display = "none";
      }
      const isOther = cell.dataset.other === "1";
      __driverMenu._btnOther.textContent = isOther ? "Remover Outra Necessidade" : "Outra Necessidade";
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
    function calculateProfessionalsRowTotal(row) {
      const dayCells = row.querySelectorAll("td[contenteditable='true']");
      const year = __currentYear;
      const month = __currentMonth;
      const daysInMonth = __currentDaysInMonth;
      const holidayMap = __currentHolidayMap;
      let total = 0;
      dayCells.forEach((cell, index) => {
        const dayNum = index + 1;
        if (dayNum > daysInMonth) return;
        const val = (cell.textContent || "").trim().toUpperCase();
        let hours = SHIFT_VALUES[val];
        if (hours !== undefined) {
          if (val === "N") {
            const holiday = holidayMap?.get(dayNum);
            const nextDayHoliday = holidayMap?.get(dayNum + 1);
            if (holiday && !holiday.optional) {
              hours = 16;
            } else if (nextDayHoliday && !nextDayHoliday.optional) {
              hours = 20;
            } else if (dayNum === daysInMonth) {
              const nextMonthHolidays = typeof getHolidayMapForMonth === "function" ? getHolidayMapForMonth(year, month + 1) : null;
              const firstDayNextMonth = nextMonthHolidays?.get(1);
              if (firstDayNextMonth && !firstDayNextMonth.optional) {
                hours = 20;
              }
            }
          }
          total += hours;
        }
      });
      const entryDateStr = row.dataset.entryDate;
      if (entryDateStr) {
        const entry = new Date(entryDateStr);
        const entryYear = entry.getFullYear();
        const entryMonth = entry.getMonth() + 1;
        const entryDay = entry.getDate();
        if (entryYear === year && entryMonth === month) {
          if (entryDay > 1) {
            let workingDaysNotWorked = 0;
            for (let d = 1; d < entryDay; d++) {
              const date = new Date(year, month - 1, d);
              const dayOfWeek = date.getDay();
              const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
              const isHoliday = holidayMap?.has(d) && !holidayMap.get(d).optional;
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
      const totalMonthly = calculateProfessionalsRowTotal(row);
      const totalMonthlyCell = row.querySelector(".total-monthly-cell");
      if (totalMonthlyCell) totalMonthlyCell.textContent = totalMonthly;      
      const totalAcumCell = row.querySelector(".total-accumulated-cell");
      if (totalAcumCell) {
        const accumulatedBase = parseFloat(totalAcumCell.dataset.base || 0);
        const extraHours = parseFloat(totalAcumCell.dataset.extraHours || 0);
        const isJanuary = (totalAcumCell.dataset.isJanuary === "1");        
        const year = __currentYear;
        const month = __currentMonth;
        const mandatoryCargo = calculateWorkingHours(year, month).workingHours;        
        const differenceMonth = totalMonthly - mandatoryCargo + extraHours;        
        let totalAccumulated;
        if (isJanuary) {
          totalAccumulated = differenceMonth;
        } else {
          totalAccumulated = accumulatedBase + differenceMonth;
        }
        totalAcumCell.textContent = totalAccumulated;
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
        if (thTop) thTop.style.backgroundColor = WEEKEND_EMPLOYEES_COLOR || "#f9e0b0";
        if (thNum) thNum.style.backgroundColor = WEEKEND_EMPLOYEES_COLOR || "#f9e0b0";
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
        const url = `${SUPABASE_URL}/rest/v1/reg_employees` + `?select=n_int,abv_name,function,team,entry_date,exit_date` + `&corp_oper_nr=eq.${corpOperNr}` + `&function=not.in.(COM,SEC)` +
                    `&or=(entry_date.is.null,entry_date.lte.${monthEnd})` + `&or=(exit_date.is.null,exit_date.gte.${monthStart})`;
        const response = await fetch(url, {headers: getSupabaseHeaders()});
        if (!response.ok) {
          const body = await response.text();
          console.error("Erro Supabase (reg_employees):", response.status, body);
          throw new Error("Erro ao carregar profissionais");
        }
        const data = await response.json();
        if (!Array.isArray(data)) return [];        
        const isJanuary = (month === 1);
        const accumulatedMap = {};
        const extraHoursMap = {};        
        if (!isJanuary) {
          const acumPrevMonth = month - 1;
          const acumResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${acumPrevMonth}`,
            { headers: getSupabaseHeaders() }
          );
          if (acumResponse.ok) {
            const acumData = await acumResponse.json();
            acumData.forEach(item => {
              accumulatedMap[item.n_int] = item.total_accumulated || 0;
            });
          }
        }
        const extraHoursResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employees_extra_hours?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`,
          { headers: getSupabaseHeaders() }
        );
        if (extraHoursResponse.ok) {
          const extraHoursData = await  extraHoursResponse.json();
          extraHoursData.forEach(item => {
            if (!extraHoursMap[item.n_int]) {
              extraHoursMap[item.n_int] = 0;
            }
            extraHoursMap[item.n_int] += item.qtd_hours;
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
            emp._accumulated = accumulatedMap[emp.n_int] || 0;
            emp._extraHours = extraHoursMap[emp.n_int] || 0;
            emp._isJanuary = isJanuary;
          });
        } else {
          data.forEach((emp) => {
            emp._accumulated = accumulatedMap[emp.n_int] || 0;
            emp._extraHours = extraHoursMap[emp.n_int] || 0;
            emp._isJanuary = isJanuary;
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
              cell.dataset.other = "0";
              applyDriverStyle(cell);
            } else if (rec.is_other) {
              cell.dataset.other = "1";
              cell.dataset.driver = "0";
              applyOtherStyle(cell);
            } else {
              cell.dataset.driver = "0";
              cell.dataset.other = "0";
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
          const dName = globalDraggedRow.cells[1].textContent.trim();
          const dFunction = globalDraggedRow.cells[2].textContent.trim();
          const dTeam = globalDraggedRow.cells[3].textContent.trim();
          const dNint = globalDraggedRow.getAttribute("data-nint");
          const tNI = row.cells[0].textContent.trim();
          const tName = row.cells[1].textContent.trim();
          const tFunction = row.cells[2].textContent.trim();
          const tTeam = row.cells[3].textContent.trim();
          const tNint = row.getAttribute("data-nint");
          globalDraggedRow.cells[0].textContent = tNI;
          globalDraggedRow.cells[1].textContent = tName;
          globalDraggedRow.cells[2].textContent = tFunction;
          globalDraggedRow.cells[3].textContent = dTeam;
          globalDraggedRow.setAttribute("data-nint", tNint);
          row.cells[0].textContent = dNI;
          row.cells[1].textContent = dName;
          row.cells[2].textContent = dFunction;
          row.cells[3].textContent = tTeam;
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
        const teamCount = {};
        existingTeams.forEach(t => {
          const match = t.match(/^EQ(\d+)$/);
          if (match) {
            teamCount[t] = (teamCount[t] || 0) + 1;
          }
        });
        const incompleteTeam = Object.keys(teamCount).sort().find(t => teamCount[t] < 2);
        if (incompleteTeam) return incompleteTeam;
        let maxNum = 4;
        Object.keys(teamCount).forEach(t => {
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
        tdNI.style.cssText = COMMON_EMP_TD_STYLE;
        tr.appendChild(tdNI);
        const tdName = document.createElement("td");
        tdName.textContent = "";
        tdName.style.cssText = COMMON_EMP_TD_STYLE;
        tr.appendChild(tdName);
        const tdFunction = document.createElement("td");
        tdFunction.textContent = "";
        tdFunction.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center;";
        tr.appendChild(tdFunction);
        const tdEq = document.createElement("td");
        tdEq.textContent = teamCode;
        tdEq.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center;";
        tr.appendChild(tdEq);
        for (let d = 1; d <= __currentDaysInMonth; d++) {
          const td = document.createElement("td");
          td.className = `day-cell-${d}`;
          td.contentEditable = true;
          td.style.cssText = COMMON_EMP_TD_STYLE;
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
        const tdTotalMonthly = document.createElement("td");
        tdTotalMonthly.className = "total-monthly-cell";
        tdTotalMonthly.textContent = "0";
        tdTotalMonthly.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center; font-weight:bold; background:#f0f0f0;";
        tr.appendChild(tdTotalMonthly);        
        const tdTotalAcum = document.createElement("td");
        tdTotalAcum.className = "total-accumulated-cell";
        tdTotalAcum.textContent = "0";
        tdTotalAcum.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center; font-weight:bold; background:#ffe6e6;";
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
            if (!hasShift) td.style.backgroundColor = WEEKEND_EMPLOYEES_COLOR || "#f9e0b0";
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
      const SPECIAL_SHIFTS_FDS = ["BX", "FI", "FJ", "LC", "LP", "LN"];
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
            cell.style.backgroundColor = WEEKEND_EMPLOYEES_COLOR || "#f9e0b0";
          } else {
            cell.style.backgroundColor = "";
          }
        }
      });
      rows.forEach(row => {
        const rowNInt = parseInt(row.getAttribute("data-nint"), 10);
        if (!rowNInt) return;
        const lastDayPrevMonth = new Date(year, month - 1, 0).getDate();
        const shiftLastDayPrev = __prevMonthShiftsCache[`${rowNInt}_${lastDayPrevMonth}`] || null;
        if (shiftLastDayPrev === "FE" || shiftLastDayPrev === "BX") {
          let continuePainting = true;
          const corPintar = (shiftLastDayPrev === "FE") ? "#00B0F0" : "#FF0000";
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
                if (shiftLastDayPrev === "BX") {
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
          const shift = cell.textContent.trim().toUpperCase();
          const nextDay = d + 1;
          if (nextDay > daysInMonth) continue;
          const isNextDayHoliday = holidayMap?.has(nextDay);
          if (!isNextDayHoliday) continue;
          if (shift === "FE" || shift === "BX") {
            const corPintar = (shift === "FE") ? "#00B0F0" : "#FF0000";
            const nextCell = row.querySelector(`.day-cell-${nextDay}`);
            if (nextCell) {
              const nextValue = nextCell.textContent.trim().toUpperCase();
              if (!nextValue || !SHIFT_COLORS[nextValue]) {
                nextCell.style.backgroundColor = corPintar;
                if (shift === "BX") {
                  nextCell.style.color = "#FFFFFF";
                  nextCell.style.fontWeight = "bold";
                }
              }
            }
            const nextDate = atNoonLocal(year, month - 1, nextDay);
            if (nextDate.getDay() === 5) {
              const saturday = nextDay + 1;
              const sunday = nextDay + 2;
              if (saturday <= daysInMonth) {
                const satCell = row.querySelector(`.day-cell-${saturday}`);
                if (satCell) {
                  const sabValue = satCell.textContent.trim().toUpperCase();
                  if (!sabValue || !SHIFT_COLORS[sabValue]) {
                    satCell.style.backgroundColor = corPintar;
                    if (shift === "BX") {
                      satCell.style.color = "#FFFFFF";
                      satCell.style.fontWeight = "bold";
                    }
                  }
                }
              }
              if (sunday <= daysInMonth) {
                const sunCell = row.querySelector(`.day-cell-${sunday}`);
                if (sunCell) {
                  const domValue = sunCell.textContent.trim().toUpperCase();
                  if (!domValue || !SHIFT_COLORS[domValue]) {
                    sunCell.style.backgroundColor = corPintar;
                    if (shift === "BX") {
                      sunCell.style.color = "#FFFFFF";
                      sunCell.style.fontWeight = "bold";
                    }
                  }
                }
              }
            }
            continue;
          }
          if (SPECIAL_BEFORE_HOLIDAY_RED.includes(shift)) {
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
          let shiftFriday = null;
          let shiftMonday = null;
          if (dayOfWeek === 6) {
            if (d === 1 && __lastFridayPrevCache) {
              shiftFriday = __prevMonthShiftsCache[`${rowNInt}_${__lastFridayPrevCache}`] || null;
            } else if (d > 1) {
              const cellFriday = row.querySelector(`.day-cell-${d - 1}`);
              shiftFriday = cellFriday ? cellFriday.textContent.trim().toUpperCase() : null;
            }
            if (d + 2 <= daysInMonth) {
              const cellSegunda = row.querySelector(`.day-cell-${d + 2}`);
              shiftMonday = cellSegunda ? cellSegunda.textContent.trim().toUpperCase() : null;
            } else if (__firstMondayNextCache) {
              shiftMonday = __nextMonthShiftsCache[`${rowNInt}_${__firstMondayNextCache}`] || null;
            }
          } else {
            if (d <= 2 && __lastFridayPrevCache) {
              shiftFriday = __prevMonthShiftsCache[`${rowNInt}_${__lastFridayPrevCache}`] || null;
            } else if (d > 2) {
              const cellFriday = row.querySelector(`.day-cell-${d - 2}`);
              shiftFriday = cellFriday ? cellFriday.textContent.trim().toUpperCase() : null;
            }
            if (d + 1 <= daysInMonth) {
              const cellSegunda = row.querySelector(`.day-cell-${d + 1}`);
              shiftMonday = cellSegunda ? cellSegunda.textContent.trim().toUpperCase() : null;
            } else if (__firstMondayNextCache) {
              shiftMonday = __nextMonthShiftsCache[`${rowNInt}_${__firstMondayNextCache}`] || null;
            }
          }
          const cellFDS = row.querySelector(`.day-cell-${d}`);
          if (!cellFDS) continue;
          const cellValue = cellFDS.textContent.trim().toUpperCase();
          if (cellValue && SHIFT_COLORS[cellValue]) continue;
          if (shiftFriday === "FE" || shiftFriday === "BX") {
            const colorPaint = (shiftFriday === "FE") ? "#00B0F0" : "#FF0000";
            cellFDS.style.backgroundColor = colorPaint;
            if (shiftFriday === "BX") {
              cellFDS.style.color = "#FFFFFF";
              cellFDS.style.fontWeight = "bold";
            }
            if (dayOfWeek === 6) {
              const monday = d + 2;
              if (monday <= daysInMonth) {
                const isMondayHoliday = holidayMap?.has(monday);
                if (isMondayHoliday) {
                  const monCell = row.querySelector(`.day-cell-${monday}`);
                  if (monCell) {
                    const monValue = monCell.textContent.trim().toUpperCase();
                    if (!monValue || !SHIFT_COLORS[monValue]) {
                      monCell.style.backgroundColor = colorPaint;
                      if (shiftFriday === "BX") {
                        monCell.style.color = "#FFFFFF";
                        monCell.style.fontWeight = "bold";
                      }
                    }
                  }
                }
              }
            }
            continue;
          }
          if (SPECIAL_SHIFTS_FDS.includes(shiftFriday) && SPECIAL_SHIFTS_FDS.includes(shiftMonday)) {
            if (dayOfWeek === 6) {
              const colorFriday = SHIFT_COLORS[shiftFriday];
              if (colorFriday) cellFDS.style.backgroundColor = colorFriday.bg;
            } else {
              const colorMonday = SHIFT_COLORS[shiftMonday];
              if (colorMonday) cellFDS.style.backgroundColor = colorMonday.bg;
            }
          }
        }
      });
    }
    function displayShiftsLegend(container) {
      const legendDiv = document.createElement("div");
      legendDiv.style.cssText = `margin-top: 5px; padding: 12px; background: #f0f8ff; border: 1px solid #4682b4; border-radius: 5px; font-family: 'Segoe UI', sans-serif;
                                 display: inline-block; width: fit-content; margin-left: 5px; vertical-align: top; height: 150px;`;
      const shifts = [{code: "FR", desc: "Feriado"}, {code: "M", desc: "08:00 - 15:00"}, {code: "D", desc: "08:00 - 20:00"}, {code: "N", desc: "20:00 - 08:00"}, {code: "", desc: "Condutor INEM", special: "driver"},
                      {code: "FO", desc: "Folga"}, {code: "FE", desc: "Férias"}, {code: "FOR", desc: "Formação"}, {code: "BX", desc: "Baixa"}, {code: "FI", desc: "Falta Injustificada"},
                      {code: "FJ", desc: "Falta Justificada"}, {code: "LP", desc: "Lic. Paternidade"}, {code: "LN", desc: "Lic. Nojo"}, {code: "LC", desc: "Lic. Casamento"}, {code: "DP", desc: "Dispensa"}];
      let html = `
        <div style="font-weight: bold; font-size: 14px; color: #1e3a8a; margin-bottom: 10px; text-align: center;">LEGENDA DE TURNOS</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
      `;
      const createItem = (shift) => {
        if (shift.special === "driver") {
          return `
            <div style="display: flex; align-items: stretch; background: #f5f5f5; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; width: 140px;">
              <div style="background: ${DRIVER_BG}; color: ${DRIVER_TEXT}; font-weight: bold; font-size: 14px; padding: 1px 0; width: 30px; text-align: center; display: flex; 
                          align-items: center; justify-content: center;">&nbsp;</div>
              <div style="font-size: 12px; color: #000; flex: 1; text-align: center; padding: 1px 8px; display: flex; align-items: center; justify-content: center;">${shift.desc}</div>
            </div>
          `;
        } else {
          const colors = SHIFT_COLORS[shift.code];
          const codeBg = colors ? colors.bg : "#FFFFFF";
          const codeColor = colors ? colors.color : "#000000";
          return `
            <div style="display: flex; align-items: stretch; background: #f5f5f5; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; width: 140px;">
              <div style="background: ${codeBg}; color: ${codeColor}; font-weight: bold; font-size: 14px; padding: 1px 0; width: 30px; text-align: center; display: flex; 
                          align-items: center; justify-content: center;">${shift.code}</div>
              <div style="font-size: 12px; color: #000; flex: 1; text-align: center; padding: 1px 8px; display: flex; align-items: center; justify-content: center;">${shift.desc}</div>
            </div>
          `;
        }
      };
      html += `<div style="display: flex; gap: 6px;">`;
      for (let i = 0; i < 5; i++) {
        html += createItem(shifts[i]);
      }
      html += `</div>`;
      html += `<div style="display: flex; gap: 6px;">`;
      for (let i = 5; i < 10; i++) {
        html += createItem(shifts[i]);
      }
      html += `</div>`;
      html += `<div style="display: flex; gap: 6px;">`;
      for (let i = 10; i < 15; i++) {
        html += createItem(shifts[i]);
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
    async function createEmployeeScalesTable(containerId, year, month, data) {
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
      Object.assign(title.style, {textAlign: "center", margin: "20px 0 -15px 0", background: "radial-gradient(circle, #ff4d4d 0%, #b30000 100%)", height: "30px", 
                                  borderRadius: "3px", lineHeight: "30px", color: "#fff"});
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
        th.style.cssText = COMMON_EMP_TH_STYLE + "border-bottom:2px solid #ccc;";
        if (i === 0) th.style.width = "40px";
        if (i === 1) th.style.width = "140px";
        if (i === 2) th.style.width = "60px";
        if (i === 3) th.style.width = "40px";
        trTop.appendChild(th);
      });
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-header-${d}`;
        th.style.cssText = COMMON_EMP_TH_STYLE;
        trTop.appendChild(th);
      }
      const thMonthlyTotal = document.createElement("th");
      thMonthlyTotal.innerHTML = "TOTAL<br>Mensal";
      thMonthlyTotal.rowSpan = 2;
      thMonthlyTotal.style.cssText = COMMON_EMP_TH_STYLE + "border-bottom:2px solid #ccc; width:70px; background:#131a69; color:#fff; line-height:16px;";
      trTop.appendChild(thMonthlyTotal);
      const thTotalAcum = document.createElement("th");
      thTotalAcum.innerHTML = "TOTAL<br>Acumulado";
      thTotalAcum.rowSpan = 2;
      thTotalAcum.style.cssText = COMMON_EMP_TH_STYLE + "border-bottom:2px solid #ccc; width:70px; background:#8B0000; color:#fff; line-height:16px;";
      trTop.appendChild(thTotalAcum);
      thead.appendChild(trTop);
      const trNums = document.createElement("tr");
      for (let d = 1; d <= 31; d++) {
        const th = document.createElement("th");
        th.className = `day-number-${d}`;
        th.textContent = d;
        th.style.cssText = COMMON_EMP_TH_STYLE + "border-bottom:2px solid #ccc;";
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
        td.style.cssText = COMMON_EMP_TD_STYLE;
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
            const tbody = document.querySelector("table.employees-table tbody");
            const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
            const existingCount = rows.filter(r => r.querySelector("td:nth-child(4)")?.textContent.trim() === nextTeam).length;
            const countToAdd = existingCount >= 1 ? 1 : 2;
            addTeamRows(nextTeam, countToAdd);
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
        tdNI.style.cssText = COMMON_EMP_TD_STYLE;
        tr.appendChild(tdNI);
        const tdName = document.createElement("td");
        tdName.textContent = item.abv_name || "";
        tdName.style.cssText = COMMON_EMP_TD_STYLE;
        tr.appendChild(tdName);
        const tdFunction = document.createElement("td");
        tdFunction.textContent = item.function || "";
        tdFunction.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center;";
        tr.appendChild(tdFunction);
        const tdEq = document.createElement("td");
        tdEq.textContent = normalizeTeam(item.team);
        tdEq.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center;";
        tr.appendChild(tdEq);
        for (let d = 1; d <= daysInMonth; d++) {
          tr.appendChild(createDayCell(d, tr));
        }
        const tdMonthlyTotal = document.createElement("td");
        tdMonthlyTotal.className = "total-monthly-cell";
        tdMonthlyTotal.textContent = "0";
        tdMonthlyTotal.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center; font-weight:bold; background:#f0f0f0;";
        tr.appendChild(tdMonthlyTotal);
        const tdTotalAcum = document.createElement("td");
        tdTotalAcum.className = "total-accumulated-cell";
        const accumulatedBase = item._accumulated || 0;
        const extraHours = item._extraHours || 0;
        tdTotalAcum.textContent = accumulatedBase + extraHours;
        tdTotalAcum.dataset.base = accumulatedBase;
        tdTotalAcum.dataset.extraHours = extraHours;
        tdTotalAcum.dataset.isJanuary = item._isJanuary ? "1" : "0";
        tdTotalAcum.style.cssText = COMMON_EMP_TD_STYLE + "text-align:center; font-weight:bold; background:#ffe6e6;";
        tr.appendChild(tdTotalAcum);
        tbody.appendChild(tr);
      });
      for (let d = 1; d <= daysInMonth; d++) {
        const date = atNoonLocal(year, month - 1, d);
        if (date.getDay() === 0 || date.getDay() === 6) {
          tbody.querySelectorAll(`.day-cell-${d}`).forEach((td) => {
            const val = (td.textContent || "").trim().toUpperCase();
            const hasShift = !!SHIFT_VALUES[val] || !!SHIFT_COLORS[val];
            if (!hasShift) td.style.backgroundColor = WEEKEND_EMPLOYEES_COLOR || "#f9e0b0";
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
      displayShiftsLegend(temp, year, month);
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
        const totalMonthlyCell = row.querySelector(".total-monthly-cell");
        if (totalMonthlyCell) totalMonthlyCell.textContent = "0";
        const totalAcumCell = row.querySelector(".total-accumulated-cell");
        if (totalAcumCell) {
          const accumulatedBase = parseFloat(totalAcumCell.dataset.base || 0);
          const extraHours = parseFloat(totalAcumCell.dataset.extraHours || 0);
          const isJanuary = (totalAcumCell.dataset.isJanuary === "1");
          const mandatoryCargo = calculateWorkingHours(year, month).workingHours;          
          const differenceMonth = 0 - mandatoryCargo + extraHours;
          let totalAccumulated;
          if (isJanuary) {
            totalAccumulated = differenceMonth;
          } else {
            totalAccumulated = accumulatedBase + differenceMonth;
          }
          totalAcumCell.textContent = String(totalAccumulated);
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
      const saveBtn = document.getElementById("employees-save-btn");
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
      }
      try {
        const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
        const shiftsPayload = [];
        const employeesUpdate = [];
        const accumulatedPayload = [];
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
                                  corp_oper_nr: corpOperNr, is_driver: (cell.dataset.driver === "1"), is_other: (cell.dataset.other === "1"), custom_bg_color: customBg,
                                  custom_text_color: customColor});}});
          const totalMonthly = calculateProfessionalsRowTotal(row);
          const cells = row.cells;
          const totalAccumulatedText = cells[cells.length - 1].textContent.trim();
          const totalAccumulated = parseFloat(totalAccumulatedText.replace(',', '.')) || 0;
          accumulatedPayload.push({n_int: nInt, abv_name: abvName, year: year, month: month, monthly_total: totalMonthly,
                                   total_accumulated: totalAccumulated, corp_oper_nr: corpOperNr});});
        const deleteShifts = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}&function=not.in.(COM,SEC)`, {
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
        if (accumulatedPayload.length > 0) {
          const insertAcum = await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_acumul`, {
            method: "POST",
            headers: {
              ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(accumulatedPayload)
          });
          if (!insertAcum.ok) {
            const errText = await insertAcum.text();
            console.warn("⚠️ Erro ao guardar acumulados:", errText);
          }
        }
        showPopupSuccess(`✅ Escala de ${monthBtn.textContent} ${year} guardada com sucesso!`);
      } catch (err) {
        console.error("Erro ao guardar escala:", err);
        showPopupWarning("❌ Erro ao guardar: " + err.message);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar";
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
        showLoadingPopup("🔄 A preparar escala...");
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
            total: parseInt(row.querySelector(".total-monthly-cell")?.textContent.trim() || "0", 10),
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
        updateLoadingPopup(`📊 A gerar escala em ${format === "pdf" ? "PDF" : "Excel"}...`);
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "monthly_scales", year, month, employees, workingHours, format})
        });
        if (!response.ok) {
          const txt = await response.text().catch(() => "");
          throw new Error(`Erro API: ${response.status} ${txt}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const fullMonthNames = monthNames[month - 1];        
        a.download = `Escala_Funcionários_${fullMonthNames}_${year}.${format === "pdf" ? "pdf" : "xlsx"}`;
        a.click();
        URL.revokeObjectURL(url);
        hideLoadingPopup();
        showPopupSuccess(`✅ Escala gerada com sucesso!`);
      } catch (err) {
        hideLoadingPopup();
        console.error("Erro ao gerar folha:", err);
        showPopupWarning(`❌ Erro: ${err.message}`);
      }
    }
    function showLoadingPopup(message) {
      const existingPopup = document.getElementById("loading-popup");
      if (existingPopup) existingPopup.remove();      
      const popup = document.createElement("div");
      popup.id = "loading-popup";
      popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 50px; 
                             border-radius: 20px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4); z-index: 10000; text-align: center; min-width: 400px; animation: popupFadeIn 0.3s ease-out;`;      
      const spinner = document.createElement("div");
      spinner.style.cssText = `border: 5px solid rgba(255, 255, 255, 0.3); border-top: 5px solid #ffffff; border-radius: 50%; width: 60px; height: 60px; animation: spin 0.8s linear infinite;
                               margin: 0 auto 25px;`;      
      const text = document.createElement("p");
      text.id = "loading-popup-text";
      text.textContent = message;
      text.style.cssText = `font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 15px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2);`;      
      const progressBar = document.createElement("div");
      progressBar.id = "loading-progress-bar";
      progressBar.style.cssText = `width: 100%; height: 4px; background: rgba(255, 255, 255, 0.3); border-radius: 2px; overflow: hidden; margin-top: 15px;`;      
      const progressFill = document.createElement("div");
      progressFill.id = "loading-progress-fill";
      progressFill.style.cssText = `width: 0%; height: 100%; background: #ffffff; border-radius: 2px; transition: width 0.3s ease;`;
      progressBar.appendChild(progressFill);      
      popup.appendChild(spinner);
      popup.appendChild(text);
      popup.appendChild(progressBar);      
      const overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); z-index: 9999; animation: overlayFadeIn 0.3s ease-out;`;      
      document.body.appendChild(overlay);
      document.body.appendChild(popup);      
      if (!document.getElementById("popup-animations")) {
        const style = document.createElement("style");
        style.id = "popup-animations";
        style.textContent = `@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}
                             @keyframes popupFadeIn {from {opacity: 0; transform: translate(-50%, -45%);} to {opacity: 1; transform: translate(-50%, -50%);}}
                             @keyframes overlayFadeIn {from {opacity: 0;} to {opacity: 1;}}
                             @keyframes popupFadeOut {from {opacity: 1; transform: translate(-50%, -50%);} to {opacity: 0; transform: translate(-50%, -55%);}}
                             @keyframes overlayFadeOut {from {opacity: 1;} to {opacity: 0;}}`;
        document.head.appendChild(style);
      }
    }
    function updateLoadingPopup(message, progress = null) {
      const text = document.getElementById("loading-popup-text");
      if (text) text.textContent = message;
      
      if (progress !== null) {
        const fill = document.getElementById("loading-progress-fill");
        if (fill) fill.style.width = `${progress}%`;
      }
    }
    function hideLoadingPopup() {
      const popup = document.getElementById("loading-popup");
      const overlay = document.getElementById("loading-overlay");
      if (popup) {
        popup.style.animation = "popupFadeOut 0.3s ease-out";
        setTimeout(() => popup.remove(), 300);
      }
      if (overlay) {
        overlay.style.animation = "overlayFadeOut 0.3s ease-out";
        setTimeout(() => overlay.remove(), 300);
      }
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
            total: parseInt(row.querySelector(".total-monthly-cell")?.textContent.trim() || "0", 10)
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
          const progress = Math.round(((i + 1) / employees.length) * 100);
          updateLoadingPopup(`📄 A processar [${i + 1}/${employees.length}]: ${emp.abv_name}`, progress);
          const response = await fetch('https://cb360-online.vercel.app/api/employees_convert_and_send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({mode: "point_sheet", year, month, employee: emp, workingHours})
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
            createTableFunc: createEmployeeScalesTable
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
    function maskTimeExtraHours(event) {
      const cell = event.target;
      let value = cell.textContent.replace(/\D/g, "");
      if (value.length > 4) value = value.slice(0, 4);
      if (value.length > 2) {
        value = value.slice(0, 2) + ":" + value.slice(2);
      }
      if (cell.textContent !== value) {
        cell.textContent = value;
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(cell);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
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
      for (let y = 2026; y <= 2036; y++) {
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
    function decimalHoursToMinutes(hours) {
      if (!hours || hours <= 0) return 0;
      return Math.round(hours * 60);
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
          ? COMMON_EMP_TH_STYLE + `background: ${bg}; color: #000; ${extraCss}`
        : COMMON_EMP_TH_STYLE + extraCss;
      }
      const trWeek = document.createElement("tr");
      ["NI", "Nome"].forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        th.rowSpan = 2;
        th.style.cssText = COMMON_EMP_TH_STYLE + "border-bottom: 2px solid #ccc;";
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
      const thMonthlyTotal = document.createElement("th");
      thMonthlyTotal.innerHTML = "TOTAL<br>Mês";
      thMonthlyTotal.rowSpan = 2;
      thMonthlyTotal.style.cssText = COMMON_EMP_TH_STYLE + "border-bottom: 2px solid #ccc; width: 70px; background: #131a69; color: #fff; line-height: 16px;";
      trWeek.appendChild(thMonthlyTotal);
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
        tdNI.style.cssText = COMMON_EMP_TD_STYLE;
        tr.appendChild(tdNI);
        const tdName = document.createElement("td");
        tdName.textContent = item.abv_name || "";
        tdName.style.cssText = COMMON_EMP_TD_STYLE;
        tr.appendChild(tdName);
        for (let d = 1; d <= daysInMonth; d++) {
          const td = document.createElement("td");
          td.className = `day-cell-${d}`;
          td.contentEditable = true;
          const savedMinutes = item.extra_hours?.[d - 1] || 0;
          td.textContent = minutesToHHMM(savedMinutes);
          const bgColor = getDayCellBg(d);
          td.style.cssText = COMMON_EMP_TD_STYLE + "text-align: center;";
          if (bgColor) td.style.backgroundColor = bgColor;          
          td.addEventListener("input", maskTimeExtraHours);
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
        const tdMonthlyTotal = document.createElement("td");
        tdMonthlyTotal.className = "total-monthly-extra-cell";
        tdMonthlyTotal.style.cssText = COMMON_EMP_TD_STYLE + "text-align: center; font-weight: bold; background: #f0f0f0;";
        tr.appendChild(tdMonthlyTotal);
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
      const totalMonthCell = row.querySelector(".total-monthly-extra-cell");
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
      const saveExtraHoursBtn = document.getElementById("employees-extra-save-btn");
      if (saveExtraHoursBtn) {
        saveExtraHoursBtn.disabled = true; 
        saveExtraHoursBtn.textContent = "A guardar..."; 
      }
      try {
        const rows = Array.from(tbody.querySelectorAll("tr.data-row"));
        const dailyRecords = [];
        rows.forEach(row => {
          const n_int = parseInt(row.querySelector("td:nth-child(1)")?.textContent.trim());
          const abv_name = row.querySelector("td:nth-child(2)")?.textContent.trim();
          const cells = row.querySelectorAll("td[contenteditable='true']");
          cells.forEach((cell, idx) => {
            const value = cell.textContent.trim();
            if (value && isValidHHMM(value)) {
              const [h, m] = value.split(":").map(Number);
              const totalMinutes = h * 60 + m;
              if (totalMinutes > 0) {
                dailyRecords.push({n_int, abv_name, year, month, day: idx + 1, qtd_hours: parseFloat((totalMinutes / 60).toFixed(2)), corp_oper_nr: corpOperNr});
              }
            }
          });
        });
        await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_extra_hours?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, { 
          method: "DELETE", 
          headers: getSupabaseHeaders() 
        });
        if (dailyRecords.length > 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_extra_hours`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json"},
            body: JSON.stringify(dailyRecords)
          });
        }
        try {
          let prevMonth = month - 1;
          let prevYear = year;
          if (prevMonth === 0) { prevMonth = 12; prevYear--; }
          const [shiftsRes, acumPrevRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, {
              headers: getSupabaseHeaders()
            }),
            month > 1
            ? fetch(`${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${prevYear}&month=eq.${prevMonth}`, { 
              headers: getSupabaseHeaders()
            })
            : Promise.resolve(null)
          ]);
          const allShifts = shiftsRes.ok ? await shiftsRes.json() : [];
          const acumPrevData = (acumPrevRes && acumPrevRes.ok) ? await acumPrevRes.json() : [];
          const acumPrevMap = {};
          acumPrevData.forEach(r => {acumPrevMap[r.n_int] = r.total_accumulated || 0;});
          const newExtraMap = {};
          dailyRecords.forEach(r => {
            newExtraMap[r.n_int] = (newExtraMap[r.n_int] || 0) + r.qtd_hours;
          });
          const {workingHours: mandatoryCargo} = calculateWorkingHours(year, month);
          const holidayMap = getHolidayMapForMonth(year, month);
          const daysInMonth = new Date(year, month, 0).getDate();
          const isJanuary = (month === 1);
          const shiftsByEmp = {};
          allShifts.forEach(s => {
            if (!shiftsByEmp[s.n_int]) shiftsByEmp[s.n_int] = {abv_name: s.abv_name, shifts: {}};
            shiftsByEmp[s.n_int].shifts[s.day] = s.shift;
          });
          const newAccumulatedPayload = Object.entries(shiftsByEmp).map(([nIntStr, empData]) => {
            const nInt = parseInt(nIntStr, 10);
            let totalMonthly = 0;
            for (let d = 1; d <= daysInMonth; d++) {
              const shift = (empData.shifts[d] || "").trim().toUpperCase();
              if (!shift || shift === " ") {
                const date = atNoonLocal(year, month - 1, d);
                const dow = date.getDay();
                const isHoliday = holidayMap?.has(d) && !holidayMap.get(d).optional;
                if (dow !== 0 && dow !== 6 && !isHoliday) totalMonthly += 8;
              } else {
                totalMonthly += (SHIFT_VALUES[shift] !== undefined ? SHIFT_VALUES[shift] : 0);
              }
            }
            const extraHours = newExtraMap[nInt] || 0;
            const accumulatedBase = isJanuary ? 0 : (acumPrevMap[nInt] || 0);
            const totalAccumulated = isJanuary
            ? (totalMonthly - mandatoryCargo + extraHours)
            : (accumulatedBase + totalMonthly - mandatoryCargo + extraHours);
            return { n_int: nInt, abv_name: empData.abv_name, year, month, monthly_total: totalMonthly, total_accumulated: totalAccumulated, corp_oper_nr: corpOperNr };
          });
          if (newAccumulatedPayload.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${month}`, { 
              method: "DELETE", 
              headers: getSupabaseHeaders()
            });
            await fetch(`${SUPABASE_URL}/rest/v1/reg_employees_acumul`, {
              method: "POST",
              headers: { ...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal" },
              body: JSON.stringify(newAccumulatedPayload)
            });
          }
        } catch (acumErr) {
          console.warn("⚠️ Horas extra guardadas, mas erro ao atualizar acumulados:", acumErr);
        }
        showPopupSuccess(`✅ Dados atualizados com sucesso!`);
      } catch (error) {
        console.error(error);
        showPopupWarning("❌ Erro ao atualizar dados.");
      } finally {
        if (saveExtraHoursBtn) { 
          saveExtraHoursBtn.disabled = false; 
          saveExtraHoursBtn.textContent = "Guardar"; 
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
    /* ===== CREATE EMPLOYEE GENERAL DATA ====== */
    function createEmployeePersonalGraphic() {
      const cardBody = document.querySelector("#individual-records .card-body");
      if (!cardBody) return;
      cardBody.innerHTML = "";
      const mainWrapper = document.createElement("div");
      mainWrapper.style.cssText = `display: flex; flex-direction: column; margin-top: -20px; gap: 10px; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`;
      const selectorSection = document.createElement("div");
      selectorSection.style.cssText = `display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 15px; background: white; border-radius: 8px; 
                                       box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;
      const leftGroup = document.createElement("div");
      leftGroup.style.cssText = `display: flex; align-items: center; gap: 10px;`;
      const label = document.createElement("label");
      label.textContent = "Selecionar Funcionário:";
      label.style.cssText = "font-weight: bold; font-size: 14px;";
      const select = document.createElement("select");
      select.id = "employee-graphic-select";
      select.style.cssText = `padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; min-width: 250px; cursor: pointer;`;
      const yearLabel = document.createElement("label");
      yearLabel.textContent = "Ano:";
      yearLabel.style.cssText = "font-weight: bold; font-size: 14px; margin-left: 10px;";
      const yearSelect = document.createElement("select");
      yearSelect.id = "year-personal-graphic";
      yearSelect.style.cssText = `padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; cursor: pointer;`;
      const currentYear = new Date().getFullYear();
      for (let y = 2026; y <= 2036; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }
      leftGroup.append(label, select, yearLabel, yearSelect);
      const cardsGroup = document.createElement("div");
      cardsGroup.style.cssText = `display: flex; gap: 10px; align-items: center;`;
      const createMicroCard = (id, labelText, borderCol) => {
        const div = document.createElement("div");
        div.style.cssText = `background: #f9f9f9; border-left: 4px solid ${borderCol}; padding: 4px 12px; border-radius: 4px; box-shadow: inset 0 0 4px rgba(0,0,0,0.05); min-width: 140px;`;
        div.innerHTML = `
          <div style="font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 2px;">${labelText}</div>
          <div id="${id}" style="font-size: 15px; font-weight: bold; color: #333;">---</div>
        `;
        return div;
      };
      const cardTimeBank = createMicroCard("micro-card-banco", "Banco de Horas Atual", "#00c07f");
      cardsGroup.append(cardTimeBank);
      selectorSection.append(leftGroup, cardsGroup);
      const contentWrapper = document.createElement("div");
      contentWrapper.id = "personal-graphic-content";
      contentWrapper.style.cssText = `display: none; grid-template-columns: auto 1fr; gap: 20px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;
      mainWrapper.append(selectorSection, contentWrapper);
      cardBody.appendChild(mainWrapper);
      loadEmployeesForGraphic();
      const triggerUpdate = () => {
        if (select.value && yearSelect.value) {
          loadPersonalGraphicData(select.value, parseInt(yearSelect.value));
        }
      };
      select.addEventListener("change", triggerUpdate);
      yearSelect.addEventListener("change", triggerUpdate);
    }
    async function loadEmployeesForGraphic() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employees?select=n_int,abv_name&corp_oper_nr=eq.${corpOperNr}&order=n_int`, { 
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Error loading employees");
        const employees = await response.json();
        const select = document.getElementById("employee-graphic-select");
        if (!select) return;
        select.innerHTML = '<option value="">-- Selecionar --</option>';
        employees.forEach(emp => {
          const option = document.createElement("option");
          option.value = emp.n_int;
          option.textContent = emp.abv_name;
          select.appendChild(option);
        });
      } catch (error) {
        console.error("Error loading employees:", error);
        showPopupWarning && showPopupWarning("Error loading employees list");
      }
    }
    async function loadPersonalGraphicData(nInt, year) {
      try {
        const contentWrapper = document.getElementById("personal-graphic-content");
        if (!contentWrapper) return;
        contentWrapper.style.display = "grid";
        if (!contentWrapper.dataset.loaded) {
          contentWrapper.innerHTML = "A Carregar...";
        }
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const [employeeRes, accumulatedRes, shiftsRes, extraHoursRes] = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/reg_employees?select=n_int,abv_name&corp_oper_nr=eq.${corpOperNr}&n_int=eq.${nInt}`, { 
              headers: getSupabaseHeaders()
            }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/reg_employees_acumul?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&n_int=eq.${nInt}&order=month`, {
              headers: getSupabaseHeaders()
            }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&n_int=eq.${nInt}`, {
              headers: getSupabaseHeaders()
            }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/reg_employees_extra_hours?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&n_int=eq.${nInt}&select=month,qtd_hours`, {
              headers: getSupabaseHeaders()
            }
          )
        ]);
        const employeeData = await employeeRes.json();
        const accumulatedData = await accumulatedRes.json();
        const shiftsData = await shiftsRes.json();
        const extraHoursData = await extraHoursRes.json();
        const extraHoursByMonth = {};
        for (let m = 1; m <= 12; m++) extraHoursByMonth[m] = 0;
        extraHoursData.forEach(record => {
          if (extraHoursByMonth[record.month] !== undefined) {
            extraHoursByMonth[record.month] += parseFloat(record.qtd_hours) || 0;
          }
        });
        if (employeeData.length === 0) {
          contentWrapper.innerHTML = "Funcionário não encontrado";
          return;
        }
        const employee = employeeData[0];
        const shiftTotalsByMonth = {};
        for (let m = 1; m <= 12; m++) {
          shiftTotalsByMonth[m] = {FE: 0, FOR: 0, BX: 0, FJ: 0, FI: 0};
        }
        shiftsData.forEach(shift => {
          const m = shift.month;
          const type = shift.shift;
          if (shiftTotalsByMonth[m] && shiftTotalsByMonth[m][type] !== undefined) {
            shiftTotalsByMonth[m][type]++;
          }
        });
        const monthsData = [];
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        for (let m = 1; m <= 12; m++) {
          const monthData = accumulatedData.find(d => d.month === m);
          const shiftMonth = shiftTotalsByMonth[m];
          const monthlyHours = monthData ? monthData.monthly_total : 0;
          const extraHours = extraHoursByMonth[m] || 0;
          monthsData.push({month: m, name: monthNames[m - 1], monthlyHours: monthlyHours, extraHours: extraHours,
                           accumulatedHours: 0, holidays: shiftMonth.FE, training: shiftMonth.FOR, sick: shiftMonth.BX,
                           justifiedAbsences: shiftMonth.FJ, unjustifiedAbsences: shiftMonth.FI});}
        let runningTotal = 0;
        monthsData.forEach(d => {
          if (d.month === 7) runningTotal = 0;
          runningTotal += d.monthlyHours + d.extraHours;
          d.accumulatedHours = runningTotal;
        });
        const currentMonth = new Date().getMonth() + 1;
        const currentMonthRecord = accumulatedData.find(d => d.month === currentMonth);
        const microCardBanco = document.getElementById("micro-card-banco");
        if (microCardBanco && currentMonthRecord) {
          const currentAccumulated = currentMonthRecord.total_accumulated || 0;
          microCardBanco.textContent = formatHoursIndividual(currentAccumulated) + "h";
          if (currentAccumulated > 0) {
            microCardBanco.style.color = "#00c853";
          } else if (currentAccumulated < 0) {
            microCardBanco.style.color = "#f44336";
          } else {
            microCardBanco.style.color = "#333";
          }
        } else if (microCardBanco) {
          microCardBanco.textContent = "0.00h";
          microCardBanco.style.color = "#333";
        }        
        contentWrapper.dataset.loaded = "true";
        let tableContainer = contentWrapper.querySelector("#personal-table-container");
        let chartContainer = contentWrapper.querySelector("#personal-chart-container");
        if (!tableContainer) {
          tableContainer = document.createElement("div");
          tableContainer.id = "personal-table-container";
          chartContainer = document.createElement("div");
          chartContainer.id = "personal-chart-container";
          chartContainer.style.cssText = "min-height: 500px;";
          contentWrapper.innerHTML = "";
          contentWrapper.append(tableContainer, chartContainer);
        }
        createPersonalGraphicTable(tableContainer, employee, monthsData);
        createPersonalGraphicChart(chartContainer, monthsData);
      } catch (error) {
        console.error("Error loading personal graphic data:", error);
        showPopupWarning && showPopupWarning("Error loading data");
      }
    }
    function calculateWorkingHoursIndividual(startDate, endDate, year) {
      function getEasterDate(y) {
        const a = y % 19;
        const b = Math.floor(y / 100);
        const c = y % 100;
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
        return new Date(y, month - 1, day);
      }
      const easter = getEasterDate(year);
      const goodFriday = new Date(easter);
      goodFriday.setDate(easter.getDate() - 2);
      const corpusChristi = new Date(easter);
      corpusChristi.setDate(easter.getDate() + 60);
      const fixedHolidays = ["01-01", "04-25", "05-01", "06-10", "08-15", "09-07", "10-05","11-01", "12-01", "12-08", "12-25"];
      function formatMD(date) {
        return String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0');
      }
      const mobileHolidays = [
        formatMD(goodFriday),
        formatMD(corpusChristi)
      ];
      let totalHours = 0;
      let current = new Date(startDate);
      while (current <= endDate) {
        const day = current.getDay();
        const md = formatMD(current);
        const isWeekend = (day === 0 || day === 6);
        const isFixedHoliday = fixedHolidays.includes(md);
        const isMobileHoliday = mobileHolidays.includes(md);
        if (!isWeekend && !isFixedHoliday && !isMobileHoliday) {
          totalHours += 8;
        }
        current.setDate(current.getDate() + 1);
      }
      return totalHours;
    }
    function createPersonalGraphicTable(container, employee, monthsData) {
      container.innerHTML = "";
      const table = document.createElement("table");
      table.style.cssText = `border-collapse: collapse; font-family: 'Segoe UI', sans-serif; font-size: 13px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden;`;
      const colgroup = document.createElement("colgroup");
      const widths = ["100px", "80px", "80px", "80px", "75px", "75px", "75px", "75px", "75px"];
      widths.forEach(w => {
        const col = document.createElement("col");
        col.style.width = w;
        colgroup.appendChild(col);
      });
      table.appendChild(colgroup);
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = [{label: "Meses", bg: "#f0f0f0", color: "#333"}, {label: "Total<br>Mensal", bg: "#ffdd00", color: "#333" }, {label: "Horas<br>Extra", bg: "#ff6600", color: "#fff"},
                       {label: "Total<br>Acumulado", bg: "#00c07f", color: "#fff"}, {label: "Férias", bg: "#0099ff", color: "#fff"}, {label: "Formação", bg: "#888888", color: "#fff"},
                       { label: "Baixa<br>Médica", bg: "#e02020", color: "#fff"}, {label: "Falta<br>Justificada", bg: "#aa0000", color: "#fff"}, {label: "Falta<br>Injustificada", bg: "#ffcc00", color: "#333"},];
      headers.forEach(h => {
        const th = document.createElement("th");
        th.innerHTML = h.label;
        th.style.cssText = `background: ${h.bg}; color:${h.color}; padding: 3px 8px; text-align:center; font-weight: 700; font-size: 12px; letter-spacing: 0.3px; border-bottom: 2px solid rgba(0,0,0,0.1);`;
      headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      monthsData.forEach((data, idx) => {
        const row = document.createElement("tr");
        row.style.cssText = `background: ${idx % 2 === 0 ? "#ffffff" : "#f8f9fa"}; transition: background 0.15s;`;
        row.addEventListener("mouseover", () => row.style.background = "#e8f4ff");
        row.addEventListener("mouseout",  () => row.style.background = idx % 2 === 0 ? "#ffffff" : "#f8f9fa");
        const values = [data.name, formatHoursIndividual(data.monthlyHours), formatHoursIndividual(data.extraHours), formatHoursIndividual(data.accumulatedHours), data.holidays, data.training,
                        data.sick, data.justifiedAbsences, data.unjustifiedAbsences];
        values.forEach((val, i) => {
          const td = document.createElement("td");
          td.textContent = val;
          td.style.cssText = `border-bottom: 1px solid #eee; padding: 5px; text-align:center; color:#333;`;
          if (i === 0) {
            td.style.textAlign = "left";
            td.style.fontWeight = "600";
            td.style.color = "#444";
            td.style.paddingLeft = "12px";
          }
          if (i >= 4 && parseInt(val) > 0) {
            td.style.fontWeight = "700";
            td.style.color = "#383352";
          }
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      const selectedYear = parseInt(document.getElementById("year-personal-graphic").value);
      const semester1Hours = calculateWorkingHoursIndividual(
        new Date(selectedYear, 0, 1),
        new Date(selectedYear, 5, 30),
        selectedYear
      );
      const semester2Hours = calculateWorkingHoursIndividual(
        new Date(selectedYear, 6, 1),
        new Date(selectedYear, 11, 31),
        selectedYear
      );
      const totalsData = calculateTotals(monthsData, semester1Hours, semester2Hours);
      function createSummaryRow(title, data, bgColor, textColor) {
        const row = document.createElement("tr");
        const values = [title, formatHoursIndividual(data.monthly), formatHoursIndividual(data.extra), formatHoursIndividual(data.accumulated), data.holidays, data.training, data.sick,
                        data.justified, data.unjustified];
        values.forEach((val, i) => {
          const td = document.createElement("td");
          td.textContent = val;
          const cellBg = i === 0 ? bgColor : "#f0f0f0";
          const cellColor = i === 0 ? (textColor || "#222") : "#222";
          td.style.cssText = `padding: 6px 8px; text-align: center; font-weight: 700; font-size: 13px; background: ${cellBg}; color:${cellColor} !important; border-top: 2px solid rgba(0,0,0,0.1);`;
          if (i === 0) { td.style.textAlign = "left"; td.style.paddingLeft = "12px"; }
          row.appendChild(td);
        });
        return row;
      }
      tbody.appendChild(createSummaryRow("1º Semestre", totalsData.semester1, "#c8e6ff", "#1a5276"));
      tbody.appendChild(createSummaryRow("2º Semestre", totalsData.semester2, "#c8e6ff", "#1a5276"));
      tbody.appendChild(createSummaryRow("Total Anual",   totalsData.year,       "#1a5276", "#ffffff"));
      table.appendChild(tbody);
      container.appendChild(table);
    }
    function createPersonalGraphicChart(container, monthsData) {
      container.innerHTML = "";
      const chartWrapper = document.createElement("div");
      chartWrapper.style.cssText = `background: #2d2d2d; padding: 20px; border-radius: 8px; display: flex; flex-direction: column;`;
      const title = document.createElement("div");
      title.textContent = "Gráfico Pessoal";
      title.style.cssText = `color: white; font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 10px;`;
      const canvasWrapper = document.createElement("div");
      canvasWrapper.style.cssText = `position: relative; height: 449px; width: 100%;`;
      const canvas = document.createElement("canvas");
      canvas.id = "personal-chart-canvas";
      canvasWrapper.appendChild(canvas);
      chartWrapper.append(title, canvasWrapper);
      container.appendChild(chartWrapper);
      drawPersonalChart(canvas, monthsData);
    }
    function drawPersonalChart(canvas, monthsData) {
      const labels = monthsData.map(d => d.name.substring(0, 3));
      if (window._personalChart) {
        window._personalChart.destroy();
        window._personalChart = null;
      }
      window._personalChart = new Chart(canvas, {
        data: {labels: labels, datasets: [{type: "bar", label: "Horas Mensais", data: monthsData.map(d => d.monthlyHours), backgroundColor: "#ffff00", yAxisID: "y", order: 2,},
                                          {type: "bar", label: "Horas Extra", data: monthsData.map(d => d.extraHours), backgroundColor: "#ff6600", yAxisID: "y", order: 2,},
                                          {type: "line", label: "Total Acumulado", data: monthsData.map(d => d.accumulatedHours), borderColor: "#00ff99", backgroundColor: "rgba(0,255,153,0.1)",
                                           borderWidth: 2, pointRadius: 4, pointBackgroundColor: "#00ff99", fill: false, tension: 0.3, yAxisID: "y2", order: 1,},
                                          {type: "bar", label: "Férias (FE)", data: monthsData.map(d => d.holidays), backgroundColor: "#0099ff", yAxisID: "y", order: 2,},
                                          {type: "bar", label: "Formação (FOR)", data: monthsData.map(d => d.training), backgroundColor: "#999999", yAxisID: "y", order: 2,},
                                          {type: "bar", label: "Baixa (BX)", data: monthsData.map(d => d.sick), backgroundColor: "#ff0000", yAxisID: "y", order: 2,},
                                          {type: "bar", label: "Falta Just. (FJ)", data: monthsData.map(d => d.justifiedAbsences), backgroundColor: "#cc0000", yAxisID: "y", order: 2,},
                                          {type: "bar", label: "Falta Injust. (FI)", data: monthsData.map(d => d.unjustifiedAbsences), backgroundColor: "#ffcc00", yAxisID: "y", order: 2,},]},
        options: {responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
                  plugins: {legend: {labels: {color: "#ffffff", font: {size: 11}}},
                            tooltip: {mode: "index", intersect: false}},
                  scales: {x: {ticks: {color: "#cccccc"},
                               grid: {color: "rgba(255,255,255,0.1)"}},
                           y: {position: "left", title: {display: true, text: "Horas", color: "#cccccc"}, ticks: {color: "#cccccc"},
                               grid: {color: "rgba(255,255,255,0.1)"}},
                           y2: {position: "right", title: {display: true, text: "Acumulado", color: "#00ff99"}, ticks: {color: "#00ff99"},
                                grid: {drawOnChartArea: false}}}}});}
    function calculateTotals(monthsData, semester1Hours, semester2Hours) {
      const semester1 = monthsData.slice(0, 6);
      const semester2 = monthsData.slice(6, 12);
      const sum = (arr, key) => arr.reduce((acc, m) => acc + (m[key] || 0), 0);      
      const s1Monthly = sum(semester1, 'monthlyHours');
      const s2Monthly = sum(semester2, 'monthlyHours');
      const totalMonthly = sum(monthsData, 'monthlyHours');
      return {
        semester1: {monthly: s1Monthly - semester1Hours, extra: sum(semester1, 'extraHours'), accumulated: semester1[5]?.accumulatedHours || 0, holidays: sum(semester1, 'holidays'),
                    training: sum(semester1, 'training'), sick: sum(semester1, 'sick'), justified: sum(semester1, 'justifiedAbsences'), unjustified: sum(semester1, 'unjustifiedAbsences')},
        semester2: {monthly: s2Monthly - semester2Hours, extra: sum(semester2, 'extraHours'), accumulated: semester2[5]?.accumulatedHours || 0, 
                    holidays: sum(semester2, 'holidays'), training: sum(semester2, 'training'), sick: sum(semester2, 'sick'), justified: sum(semester2, 'justifiedAbsences'),
                    unjustified: sum(semester2, 'unjustifiedAbsences')},
        year: {monthly: totalMonthly - (semester1Hours + semester2Hours), extra: sum(monthsData, 'extraHours'), accumulated: (semester1[5]?.accumulatedHours || 0) + (semester2[5]?.accumulatedHours || 0), 
               holidays: sum(monthsData, 'holidays'), training: sum(monthsData, 'training'), sick: sum(monthsData, 'sick'), justified: sum(monthsData, 'justifiedAbsences'),
               unjustified: sum(monthsData, 'unjustifiedAbsences')}};}
    function formatHoursIndividual(value) {
      if (!value) return "0";
      return parseFloat(value).toFixed(2);
    }
    document.querySelectorAll(".sidebar-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const access = btn.dataset.access;
        if (access === "Registos Individuais") {
          createEmployeePersonalGraphic();
        }
      });
    });
    /* ============================================
    FASE 04 - EMPLOYEE HOLIDAY MANAGEMENT
    ============================================ */
    /* === CREATE EMPLOYEE VACATIONS MANAGER === */
    function getEasterDateForHolidays(year) {
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
      return new Date(year, month - 1, day);
    }    
    function getPortugalHolidaysForVacations(year) {
      const holidays = [];
      const fixedHolidays = [{month: 1, day: 1, name: "Ano Novo"}, {month: 4, day: 25, name: "Dia da Liberdade"}, {month: 5, day: 1, name: "Dia do Trabalhador"},
                             {month: 6, day: 10, name: "Dia de Portugal"}, {month: 8, day: 15, name: "Assunção de Nossa Senhora"}, {month: 9, day: 7, name: "Dia do Município (Faro)"}, 
                             {month: 10, day: 5, name: "Implantação da República"}, {month: 11, day: 1, name: "Dia de Todos os Santos"}, {month: 12, day: 1, name: "Restauração da Independência"}, 
                             {month: 12, day: 8, name: "Imaculada Conceição"}, {month: 12, day: 25, name: "Natal"}];      
      fixedHolidays.forEach(h => {
        holidays.push({ month: h.month, day: h.day, name: h.name, optional: false });
      });
      const easter = getEasterDateForHolidays(year);
      const goodFriday = new Date(easter);
      goodFriday.setDate(easter.getDate() - 2);
      holidays.push({month: goodFriday.getMonth() + 1, day: goodFriday.getDate(), name: "Sexta-feira Santa", optional: false});
      const corpusChristi = new Date(easter);
      corpusChristi.setDate(easter.getDate() + 60);
      holidays.push({month: corpusChristi.getMonth() + 1, day: corpusChristi.getDate(), name: "Corpo de Deus", optional: false});      
      return holidays;
    }
    function createHolidayManagement() {
      const cardBody = document.querySelector("#vacation-scheduling .card-body");
      if (!cardBody) return;      
      cardBody.innerHTML = "";      
      const mainWrapper = document.createElement("div");
      mainWrapper.style.cssText = `display: flex; flex-direction: column; margin-top: -20px; gap: 5px; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`;
      const titleSection = document.createElement("div");
      titleSection.style.cssText = `display: flex; align-items: center; margin-bottom: 10px; gap: 8px; font-size: 16px; font-weight: 800; color: #1e293b;`;
      titleSection.innerHTML = `<span style="background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px;">RH</span> MARCAÇÃO DE FÉRIAS`;
      const selectorSection = document.createElement("div");
      selectorSection.style.cssText = `display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;      
      const label = document.createElement("label");
      label.textContent = "Selecionar Funcionário:";
      label.style.cssText = "font-weight: bold; font-size: 14px;";      
      const select = document.createElement("select");
      select.id = "holiday-employee-select";
      select.style.cssText = `padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; min-width: 250px; cursor: pointer;`;      
      const yearLabel = document.createElement("label");
      yearLabel.textContent = "Ano:";
      yearLabel.style.cssText = "font-weight: bold; font-size: 14px; margin-left: 20px;";      
      const yearSelect = document.createElement("select");
      yearSelect.id = "holiday-year-select";
      yearSelect.style.cssText = `padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; cursor: pointer;`;      
      const currentYear = new Date().getFullYear();
      for (let y = 2026; y <= 2036; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }      
      selectorSection.append(label, select, yearLabel, yearSelect);
      const infoSection = document.createElement("div");
      infoSection.id = "holiday-info-section";
      infoSection.style.cssText = `display: none; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;      
      const createInfoCard = (id, label, icon, color) => {
        const card = document.createElement("div");
        card.style.cssText = `background: linear-gradient(135deg, ${color}22 0%, ${color}11 100%); border: 2px solid ${color}; border-radius: 8px; padding: 15px; text-align: center;`;        
        card.innerHTML = `
          <div style="color: ${color}; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
            ${icon} ${label}
          </div>
          <div id="${id}" style="color: #333; font-size: 24px; font-weight: bold;">
            ---
          </div>
        `;        
        return card;
      };      
      infoSection.appendChild(createInfoCard("holiday-total-days", "Total de Férias", "📅", "#2196f3"));
      infoSection.appendChild(createInfoCard("holiday-used-days", "Dias Usados", "✅", "#ff9800"));
      infoSection.appendChild(createInfoCard("holiday-available-days", "Dias Disponíveis", "🎯", "#00c853"));
      const periodsSection = document.createElement("div");
      periodsSection.id = "holiday-periods-section";
      periodsSection.style.cssText = `display: none; flex-direction: column; gap: 5px; margin-top: 10px;`;
      const periodsTitle = document.createElement("h3");
      periodsTitle.textContent = "Marcar Períodos de Férias";
      periodsTitle.style.cssText = `margin: 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 18px; color: #333;`;
      const cardsWrapper = document.createElement("div");
      cardsWrapper.style.cssText = `display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;`;
      periodsSection.appendChild(periodsTitle);
      periodsSection.appendChild(cardsWrapper);
      for (let i = 1; i <= 3; i++) {
        const periodCard = createPeriodCard(i);
        cardsWrapper.appendChild(periodCard);
      }
      const actionsDiv = document.createElement("div");
      actionsDiv.style.cssText = `display: flex; gap: 10px; margin-top: 10px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;      
      const previewBtn = document.createElement("button");
      previewBtn.id = "holiday-preview-btn";
      previewBtn.textContent = "👁️ Pré-visualizar";
      previewBtn.className = "btn btn-secondary";
      previewBtn.style.cssText = `flex: 1; padding: 12px; font-size: 14px; font-weight: bold; cursor: pointer;`;      
      const saveBtn = document.createElement("button");
      saveBtn.id = "holiday-save-btn";
      saveBtn.textContent = "💾 Gravar Férias";
      saveBtn.className = "btn btn-add";
      saveBtn.style.cssText = `flex: 1; padding: 12px; font-size: 14px; font-weight: bold; cursor: pointer;`;
      const pdfBtn = document.createElement("button");
      pdfBtn.id = "holiday-pdf-btn";
      pdfBtn.textContent = "📄 Gerar Formulário (PDF)";
      pdfBtn.className = "btn btn-info";
      pdfBtn.style.cssText = `flex: 1; padding: 12px; font-size: 14px; font-weight: bold; cursor: pointer; background-color: #455a64; color: white; border: none; border-radius: 4px;`;
      actionsDiv.append(previewBtn, saveBtn, pdfBtn);
      periodsSection.appendChild(actionsDiv);
      const previewSection = document.createElement("div");
      previewSection.id = "holiday-preview-section";
      previewSection.style.cssText = `display: none; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;      
      periodsSection.appendChild(previewSection);      
      mainWrapper.append(titleSection, selectorSection, infoSection, periodsSection);      
      cardBody.appendChild(mainWrapper);
      setTimeout(() => {
        for (let i = 1; i <= 3; i++) {
          const start = document.getElementById(`holiday-start-${i}`);
          const end = document.getElementById(`holiday-end-${i}`);
          if (start) start.value = "";
          if (end) end.value = "";
        }
      }, 0);
      loadEmployeesForHolidays();
      select.addEventListener("change", () => {
        if (select.value && yearSelect.value) {
          loadHolidayData(select.value, parseInt(yearSelect.value));
        }
      });      
      yearSelect.addEventListener("change", () => {
        if (select.value && yearSelect.value) {
          loadHolidayData(select.value, parseInt(yearSelect.value));
        }
      });      
      previewBtn.addEventListener("click", previewHolidays);
      saveBtn.addEventListener("click", saveHolidays);
      pdfBtn.addEventListener("click", prepareVacationForm);
    }    
    function createPeriodCard(periodNumber) {
      const card = document.createElement("div");
      card.className = "holiday-period-card";
      card.style.cssText = `padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #2196f3;`;      
      const title = document.createElement("div");
      title.textContent = `Período ${periodNumber}`;
      title.style.cssText = `font-size: 16px; font-weight: bold; color: #2196f3; margin-bottom: 15px;`;      
      const fieldsContainer = document.createElement("div");
      fieldsContainer.style.cssText = `display: grid; grid-template-columns: 1fr 1fr auto; gap: 15px; align-items: end;`;
      const startGroup = document.createElement("div");
      startGroup.innerHTML = `
        <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 13px;">
          Data Início
        </label>
        <input 
          type="date" 
          id="holiday-start-${periodNumber}"
          style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
        />
      `;
      const endGroup = document.createElement("div");
      endGroup.innerHTML = `
        <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 13px;">
          Data Fim
        </label>
        <input 
          type="date" 
          id="holiday-end-${periodNumber}"
          style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
        />
      `;
      const daysInfo = document.createElement("div");
      daysInfo.innerHTML = `
        <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 13px;">
          Dias Úteis
        </label>
        <div 
          id="holiday-days-${periodNumber}"
          style="padding: 8px 12px; background: #f0f0f0; border-radius: 4px; font-weight: bold; text-align: center; min-width: 80px;"
        >
          ---
        </div>
      `;      
      fieldsContainer.append(startGroup, endGroup, daysInfo);      
      card.append(title, fieldsContainer);
      const startInput = card.querySelector(`#holiday-start-${periodNumber}`);
      const endInput = card.querySelector(`#holiday-end-${periodNumber}`);
      const daysDisplay = card.querySelector(`#holiday-days-${periodNumber}`);
      const updateDays = () => {
        if (startInput.value && endInput.value) {
          const start = new Date(startInput.value.replace(/-/g, '\/'));
          const end = new Date(endInput.value.replace(/-/g, '\/'));      
          if (start <= end) {
            const yearSelect = document.getElementById("holiday-year-select");
            const year = parseInt(yearSelect.value);
            const workingDays = calculateWorkingDaysInPeriod(start, end, year);
            daysDisplay.textContent = `${workingDays} dias`;
            daysDisplay.style.color = workingDays > 0 ? "#00c853" : "#333";
          } else {
            daysDisplay.textContent = "Inválido";
            daysDisplay.style.color = "#f44336";
          }
        } else {
          daysDisplay.textContent = "---";
          daysDisplay.style.color = "#333";
        }
      };      
      startInput.addEventListener("change", updateDays);
      endInput.addEventListener("change", updateDays);      
      return card;
    }    
    let employeesForHolidays = [];
    async function loadEmployeesForHolidays() {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employees?select=n_int,abv_name,team,function&corp_oper_nr=eq.${corpOperNr}&order=n_int`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error("Erro ao carregar funcionários");
        const employees = await response.json();
        employeesForHolidays = employees;
        const select = document.getElementById("holiday-employee-select");
        if (!select) return;
        select.innerHTML = '<option value="">-- Selecionar --</option>';
        employees.forEach(emp => {
          const option = document.createElement("option");
          option.value = emp.n_int;
          option.textContent = emp.abv_name;
          select.appendChild(option);
        });
      } catch (error) {
        console.error("Error loading employees:", error);
        showPopupWarning && showPopupWarning("Erro ao carregar funcionários");
      }
    }
    async function loadHolidayData(nInt, year) {
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const shiftsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&n_int=eq.${nInt}&shift=eq.FE&order=month.asc,day.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!shiftsResponse.ok) throw new Error("Erro ao carregar dados do servidor");
        const shifts = await shiftsResponse.json();
        const usedDays = shifts.length;
        const totalDays = 22;
        const availableDays = totalDays - usedDays;
        document.getElementById("holiday-total-days").textContent = totalDays;
        document.getElementById("holiday-used-days").textContent = usedDays;
        const availEl = document.getElementById("holiday-available-days");
        if (availEl) {
          availEl.textContent = availableDays;
          availEl.style.color = availableDays > 0 ? "#00c853" : "#f44336";
        }
        const periods = [];
        if (shifts.length > 0) {
          const dates = shifts.map(s => new Date(year, s.month - 1, s.day, 12, 0, 0));
          let start = dates[0];
          let end = dates[0];
          for (let i = 1; i < dates.length; i++) {
            const currentDate = dates[i];
            if (isNextWorkingDay(end, currentDate, year)) {
              end = currentDate;
            } else {
              periods.push({start, end});
              start = currentDate;
              end = currentDate;
            }
          }
          periods.push({start, end});
        }
        document.getElementById("holiday-info-section").style.display = "grid";
        document.getElementById("holiday-periods-section").style.display = "flex";
        for (let i = 1; i <= 3; i++) {
          const startInput = document.getElementById(`holiday-start-${i}`);
          const endInput = document.getElementById(`holiday-end-${i}`);
          const daysDisplay = document.getElementById(`holiday-days-${i}`);
          const p = periods[i - 1];
          if (p) {
            startInput.value = p.start.toLocaleDateString('sv-SE');
            endInput.value = p.end.toLocaleDateString('sv-SE');
            const workingDays = calculateWorkingDaysInPeriod(p.start, p.end, year);
            daysDisplay.textContent = `${workingDays} dias`;
            daysDisplay.style.color = "#2196f3";
          } else {
            startInput.value = "";
            endInput.value = "";
            daysDisplay.textContent = "---";
            daysDisplay.style.color = "#333";
          }
        }
        const previewSection = document.getElementById("holiday-preview-section");
        if (previewSection) {
          previewSection.innerHTML = "";
          previewSection.style.display = "none";
        }
      } catch (error) {
        console.error("Error loading holiday data:", error);
        if (typeof showPopupWarning === "function") showPopupWarning("Erro ao carregar dados de férias");
      }
    }
    function isNextWorkingDay(lastDate, nextDate, year) {
      let checkDate = new Date(lastDate);
      const holidays = getPortugalHolidaysForVacations(year);
      do {
        checkDate.setDate(checkDate.getDate() + 1);
      } while (
        checkDate.getDay() === 0 ||
        checkDate.getDay() === 6 ||
        holidays.some(h => h.month === (checkDate.getMonth() + 1) && h.day === checkDate.getDate())
      );
      return checkDate.getFullYear() === nextDate.getFullYear() && checkDate.getMonth() === nextDate.getMonth() && checkDate.getDate() === nextDate.getDate();
    }
    function calculateWorkingDaysInPeriod(startDate, endDate, year) {
      const holidays = getPortugalHolidaysForVacations(year);
      const holidaysMap = new Map();      
      holidays.forEach(h => {
        const key = `${h.month}-${h.day}`;
        holidaysMap.set(key, true);
      });      
      let workingDays = 0;
      let current = new Date(startDate);      
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        const month = current.getMonth() + 1;
        const day = current.getDate();
        const key = `${month}-${day}`;        
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const isHoliday = holidaysMap.has(key);        
        if (!isWeekend && !isHoliday) {
          workingDays++;
        }        
        current.setDate(current.getDate() + 1);
      }      
      return workingDays;
    }    
    function previewHolidays() {
      const select = document.getElementById("holiday-employee-select");
      const yearSelect = document.getElementById("holiday-year-select");
      const availableDaysEl = document.getElementById("holiday-available-days");      
      if (!select.value) {
        showPopupWarning && showPopupWarning("Selecione um funcionário");
        return;
      }      
      const year = parseInt(yearSelect.value);
      const availableDays = parseInt(availableDaysEl.textContent);
      const periods = [];
      let totalDaysRequested = 0;      
      for (let i = 1; i <= 3; i++) {
        const startInput = document.getElementById(`holiday-start-${i}`);
        const endInput = document.getElementById(`holiday-end-${i}`);        
        if (startInput.value && endInput.value) {
          const start = new Date(startInput.value.replace(/-/g, '\/'));
          const end = new Date(endInput.value.replace(/-/g, '\/'));
          const days = calculateWorkingDaysInPeriod(start, end, year);          
          periods.push({ period: i, start, end, days });
          totalDaysRequested += days;
        }
      }      
      if (periods.length === 0) {
        showPopupWarning && showPopupWarning("Adicione pelo menos um período");
        return;
      }
      if (totalDaysRequested > availableDays) {
        showPopupWarning && showPopupWarning(
          `Dias solicitados (${totalDaysRequested}) excedem dias disponíveis (${availableDays})`
        );
        return;
      }
      const previewSection = document.getElementById("holiday-preview-section");
      previewSection.style.display = "block";      
      let html = '<h4 style="margin: 0 0 15px 0;">Pré-visualização:</h4>';
      html += '<div style="display: flex; flex-direction: column; gap: 10px;">';      
      periods.forEach(p => {
        const startStr = p.start.toLocaleDateString('pt-PT');
        const endStr = p.end.toLocaleDateString('pt-PT');        
        html += `
          <div style="padding: 10px; background: #f0f0f0; border-radius: 4px; border-left: 3px solid #2196f3;">
            <strong>Período ${p.period}:</strong> ${startStr} a ${endStr} 
            <span style="color: #00c853; font-weight: bold;">(${p.days} dias úteis)</span>
          </div>
        `;
      });      
      html += '</div>';
      html += `<div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 4px; text-align: center;">
        <strong>Total de dias a marcar:</strong> <span style="color: #2196f3; font-size: 18px;">${totalDaysRequested}</span>
      </div>`;      
      previewSection.innerHTML = html;
    }
    async function saveHolidays() {
      const select = document.getElementById("holiday-employee-select");
      const yearSelect = document.getElementById("holiday-year-select");
      if (!select.value) {
        if (typeof showPopupWarning === "function") showPopupWarning("Selecione um funcionário");
        return;
      }
      const nInt = parseInt(select.value);
      const year = parseInt(yearSelect.value);
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const allFERecords = [];
      for (let i = 1; i <= 3; i++) {
        const startInput = document.getElementById(`holiday-start-${i}`);
        const endInput = document.getElementById(`holiday-end-${i}`);
        if (startInput.value && endInput.value) {
          const start = new Date(startInput.value.replace(/-/g, '\/'));
          const end = new Date(endInput.value.replace(/-/g, '\/'));
          if (start.getFullYear() !== year || end.getFullYear() !== year) {
            if (typeof showPopupWarning === "function") 
              showPopupWarning(`Erro no Período ${i}: As datas devem pertencer ao ano ${year}`);
            return;
          }
          const feRecords = generateFERecords(start, end, nInt, year, corpOperNr);
          allFERecords.push(...feRecords);
        }
      }
      if (allFERecords.length > 22) {
        const excess = allFERecords.length;
        const confirmExcess = confirm(
          `⚠️ ATENÇÃO: O plano selecionado tem ${excess} dias úteis.\n\n` +
          `O limite padrão anual é de 22 dias. Isto inclui dias transferidos do ano anterior?\n\n` +
          `Clique em 'OK' para gravar ${excess} dias ou 'Cancelar' para rever.`
        );
        if (!confirmExcess) return;
      }
      try {
        const monthsInvolved = [...new Set(allFERecords.map(r => r.month))].join(',');
        const conflictsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employee_shifts?n_int=eq.${nInt}&year=eq.${year}&month=in.(${monthsInvolved})&shift=neq.FE&corp_oper_nr=eq.${corpOperNr}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (conflictsResponse.ok) {
          const allOtherShifts = await conflictsResponse.json();
          const conflicts = allOtherShifts.filter(shift => allFERecords.some(fe => fe.month === shift.month && fe.day === shift.day));
          if (conflicts.length > 0) {
            const conflictDaysText = conflicts
            .sort((a, b) => a.month - b.month || a.day - b.day)
            .map(c => `${c.day}/${c.month} (${c.shift})`)
            .join(', ');
            const message = `⚠️ ATENÇÃO: Existem turnos marcados nos seguintes dias:\n\n${conflictDaysText}\n\nAs férias irão SUBSTITUIR estes turnos.\n\nDeseja continuar?`;
            if (!confirm(message)) return;
            const orConditions = conflicts
            .map(c => `and(month.eq.${c.month},day.eq.${c.day})`)
            .join(',');
            await fetch(
              `${SUPABASE_URL}/rest/v1/reg_employee_shifts?n_int=eq.${nInt}&year=eq.${year}&corp_oper_nr=eq.${corpOperNr}&shift=neq.FE&or=(${orConditions})`, {
                method: "DELETE", headers: getSupabaseHeaders()
              }
            );
          }
        }
        const deleteOldFEResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employee_shifts?n_int=eq.${nInt}&year=eq.${year}&shift=eq.FE&corp_oper_nr=eq.${corpOperNr}`, {
            method: "DELETE", headers: getSupabaseHeaders()
          }
        );
        if (!deleteOldFEResponse.ok) throw new Error("Erro ao limpar registos de férias antigos");
        if (allFERecords.length > 0) {
          const saveResponse = await fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts`, {
            method: "POST",
            headers: {
          ...getSupabaseHeaders(),
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(allFERecords)
          });
          if (!saveResponse.ok) throw new Error("Erro ao gravar novas férias");
        }
        if (typeof showPopupSuccess === "function")
          showPopupSuccess(`✅ Férias atualizadas com sucesso: ${allFERecords.length} dias.`);
        loadHolidayData(nInt, year);
      } catch (error) {
        console.error("Save error:", error);
        if (typeof showPopupWarning === "function") showPopupWarning("Erro ao processar a atualização das férias");
      }
    }
    function generateFERecords(startDate, endDate, nInt, year, corpOperNr) {
      const holidays = getPortugalHolidaysForVacations(year);
      const holidaysMap = new Map();
      holidays.forEach(h => holidaysMap.set(`${h.month}-${h.day}`, true));
      const selectedEmployee = employeesForHolidays.find(emp => emp.n_int === nInt);
      if (!selectedEmployee) throw new Error("Funcionário não encontrado");
      const records = [];
      let current = new Date(startDate);
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        const month = current.getMonth() + 1;
        const day = current.getDate();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); 
        const isHoliday = holidaysMap.has(`${month}-${day}`);
        if (!isWeekend && !isHoliday) {
          records.push({n_int: nInt, abv_name: selectedEmployee.abv_name, team: selectedEmployee.team, function: selectedEmployee.function, year: year,
                        month: month, day: day, shift: "FE", corp_oper_nr: corpOperNr});}
        current.setDate(current.getDate() + 1);
      }
      return records;
    }
    async function prepareVacationForm() {
      const select = document.getElementById("holiday-employee-select");
      const yearSelect = document.getElementById("holiday-year-select");
      if (!select.value) {
        return showPopupWarning("Selecione um funcionário primeiro.");
      }
      const nInt = select.value;
      const employeeName = select.options[select.selectedIndex].text;
      const year = parseInt(yearSelect.value);
      const periods = [];
      for (let i = 1; i <= 3; i++) {
        const startVal = document.getElementById(`holiday-start-${i}`).value;
        const endVal = document.getElementById(`holiday-end-${i}`).value;
        if (startVal && endVal) {
          const startDate = new Date(startVal.replace(/-/g, '/'));
          const endDate = new Date(endVal.replace(/-/g, '/'));
          const days = calculateWorkingDaysInPeriod(startDate, endDate, year);
          periods.push({
            start: {day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear()},
            end: {day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear()},
            days
          });
        }
      }
      if (periods.length === 0) {
        return showPopupWarning("Preencha pelo menos um período de férias.");
      }
      try {
        if (typeof showPopupSuccess === "function")
          showPopupSuccess("A gerar PDF... Por favor aguarde.");
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "vacation_form", employeeName, nInt, periods})});
        if (!response.ok) throw new Error("Erro ao gerar PDF");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Formulario_Ferias_${employeeName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(error);
        showPopupWarning("Falha ao gerar o formulário em PDF.");
      }
    }
    function getIntervalInMonth(startDate, endDate, month, year) {
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);
      if (endDate < firstDayOfMonth || startDate > lastDayOfMonth) return null;
      const start = new Date(Math.max(startDate, firstDayOfMonth));
      const end = new Date(Math.min(endDate, lastDayOfMonth));
      const pad = (n) => n.toString().padStart(2, '0');
      return `${pad(start.getDate())} a ${pad(end.getDate())}`;
    }
    /* MAPA DE FÉRIAS */
    async function createGlobalHolidayMap() {
      const cardBody = document.querySelector("#vacation-scheduling-map .card-body");
      if (!cardBody) return;

      if (!document.getElementById("map-core-css")) {
        const s = document.createElement("style");
        s.id = "map-core-css";
        s.innerHTML = ` 
          .m-wrapper {font-family: 'Inter', sans-serif; color: #1e293b;}
          .m-title {font-size: 16px; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;}
          .m-badge-rh {background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px;}
          .m-container {max-height: 500px; overflow: auto; border: 1px solid #cbd5e1; border-radius: 6px; position: relative; scrollbar-width: none; -ms-overflow-style: none;}
          .m-container::-webkit-scrollbar { display: none; }
          .m-table {width: 100%; border-collapse: separate; border-spacing: 0; font-size: 10.5px; table-layout: fixed;}
          .m-table th {position: sticky; top: 0; z-index: 10; background: #f8fafc; border-bottom: 2px solid #94a3b8; border-right: 1px solid #cbd5e1; padding: 8px 2px; text-align: center;}
          .m-table th:first-child, .m-table td:first-child {position: sticky; left: 0; width: 150px; z-index: 11; background: #f1f5f9; border-right: 2px solid #cbd5e1; text-align: left; padding-left: 10px;}
          .m-table th:first-child {z-index: 12;}
          .m-table td {border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 4px; text-align: center; vertical-align: middle; height: 30px;}
          .m-no-holiday {color: #cbd5e1; transition: color 0.2s;}
          .m-holiday {background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 4px; font-weight: 700; font-size: 9px; padding: 3px; line-height: 1.2;}
          .m-total {font-weight: 800; background: #475569 !important; color: #fff !important; width: 50px; transition: all 0.2s;}
          .m-footer {display: flex; justify-content: flex-end; margin-top: 10px; gap: 8px;}
          .m-btn {background: #1e293b; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;}
          .m-btn:hover {background: #334155;}
          .m-btn-secondary {background: #64748b; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;}
          .m-btn-secondary:hover {background: #475569;}
          .holiday-row:hover td {background-color: #f1f5f9 !important;}
          .holiday-row:hover .m-no-holiday {color: #64748b !important;}
          .holiday-row:hover td strong {color: #000;}
          .holiday-row:hover .m-total {background: #334155 !important; color: #fbbf24 !important;}
          .p-year-select {padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 400; outline: none;}
        `;
        document.head.appendChild(s);
      }
      if (!document.getElementById("holiday-table-body")) {
        const defaultYear = new Date().getFullYear();
        let yearOptions = "";
        for (let y = 2026; y <= 2036; y++) {
          yearOptions += `<option value="${y}" ${y === defaultYear ? 'selected' : ''}>${y}</option>`;
        }
        cardBody.innerHTML = `
          <div class="m-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div class="m-title" id="holiday-map-title" style="margin:0;"><span class="m-badge-rh">RH</span> MAPA DE FÉRIAS ${defaultYear}</div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;">
                <span>Ano:</span>
                <select id="global-year-filter" class="p-year-select" onchange="loadGlobalHolidayData()">${yearOptions}</select>
              </div>
            </div>
            <div class="m-container">
              <table class="m-table">
                <thead>
                  <tr>
                    <th>FUNCIONÁRIO</th>
                    ${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map(m => `<th style="width:70px;">${m.toUpperCase()}</th>`).join('')}
                    <th class="m-total">DIAS</th>
                  </tr>
                </thead>
                <tbody id="holiday-table-body">
                  <tr><td colspan="14" style="padding:40px; text-align:center;">⌛ A carregar mapa de férias...</td></tr>
                </tbody>
              </table>
            </div>
            <div class="m-footer">
              <button class="m-btn-secondary" onclick="consultDiscrepancies()">🔍 Consultar Anómalias</button>
              <button class="m-btn" onclick="exportGlobalHolidayMap()">📥 Emitir Mapa</button>
            </div>
          </div>`;
      }
      loadGlobalHolidayData();
    }
    async function loadGlobalHolidayData() {
      const filterElem = document.getElementById("global-year-filter");
      const year = filterElem ? parseInt(filterElem.value) : new Date().getFullYear();
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const tableBody = document.getElementById("holiday-table-body");
      const titleElem = document.getElementById("holiday-map-title");
      if (titleElem) titleElem.innerHTML = `<span class="m-badge-rh">RH</span> MAPA DE FÉRIAS ${year}`;
      tableBody.innerHTML = `<tr><td colspan="14" style="padding:40px; text-align:center;">⌛ A carregar dados de ${year}...</td></tr>`;
      try {
        const [empRes, shiftRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&order=abv_name.asc`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&shift=eq.FE&order=n_int,month,day`, {
            headers: getSupabaseHeaders()
          })
        ]);
        const allEmployees = await empRes.json();
        const allShifts = await shiftRes.json();
        const employees = allEmployees.filter(emp => allShifts.some(s => s.n_int === emp.n_int));
        if (employees.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="14" style="padding:40px; text-align:center; color:#64748b;">Não existem férias marcadas para o ano ${year}.</td></tr>`;
          return;
        }
        let rows = "";
        employees.forEach(emp => {
          const shifts = allShifts.filter(s => s.n_int === emp.n_int);
          let p = [];
          if (shifts.length > 0) {
            shifts.sort((a, b) => (a.month * 100 + a.day) - (b.month * 100 + b.day));
            let start = new Date(year, shifts[0].month - 1, shifts[0].day);
            let end = new Date(year, shifts[0].month - 1, shifts[0].day);
            for (let i = 1; i < shifts.length; i++) {
              let current = new Date(year, shifts[i].month - 1, shifts[i].day);
              if (isNextWorkingDay(end, current, year)) {
                end = current;
              } else {
                p.push({s: new Date(start), e: new Date(end)});
                start = current;
                end = current;
              }
            }
            p.push({s: new Date(start), e: new Date(end)});
          }
          rows += `<tr class="holiday-row"><td><strong>${emp.abv_name}</strong></td>`;
          for (let m = 1; m <= 12; m++) {
            let periodsStartingHere = p.filter(x => (x.s.getMonth() + 1) === m);
            if (periodsStartingHere.length > 0) {
              let maxMonthReached = m;
              periodsStartingHere.forEach(x => {
                const endMonth = x.e.getMonth() + 1;
                if (endMonth > maxMonthReached) maxMonthReached = endMonth;
              });
              const span = (maxMonthReached - m) + 1;
              let allPeriodsInThisBlock = p.filter(x => {
                const startMonth = x.s.getMonth() + 1;
                return (startMonth >= m && startMonth <= maxMonthReached);
              });
              let txt = allPeriodsInThisBlock.map(x => {
                const dS = x.s.getDate().toString().padStart(2, '0');
                const dE = x.e.getDate().toString().padStart(2, '0');
                return dS === dE ? dS : `${dS} a ${dE}`;
              }).join(' e ');
              rows += `<td colspan="${span}"><div class="m-holiday">${txt}</div></td>`;
              m += (span - 1);
            } else {
              rows += `<td><span class="m-no-holiday">-</span></td>`;
            }
          }
          rows += `<td class="m-total" style="text-align:center">${shifts.length}</td></tr>`;
        });
        tableBody.innerHTML = rows;
      } catch (err) {
        console.error("Erro no Mapa:", err);
        tableBody.innerHTML = `<tr><td colspan="14" style="color:red; text-align:center;">Erro: ${err.message}</td></tr>`;
      }
    }
    async function exportGlobalHolidayMap() {
      const year = parseInt(document.getElementById("holiday-year-select")?.value || new Date().getFullYear());
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const btn = document.querySelector(".m-btn");
      const originalText = btn.innerHTML;
      btn.innerHTML = "⌛ A Gerar Mapa...";
      btn.disabled = true;
      const formatDateSafe = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      };
      try {
        const [empRes, shiftRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&order=abv_name.asc`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&shift=eq.FE&order=n_int,month,day`, {
            headers: getSupabaseHeaders()
          })
        ]);
        const employees = await empRes.json();
        const allShifts = await shiftRes.json();
        const filteredEmployees = employees.filter(emp => allShifts.some(s => s.n_int === emp.n_int));
        const employeesFormatted = filteredEmployees.map(emp => {
          const shifts = allShifts.filter(s => s.n_int === emp.n_int);
          let periods = [];
          if (shifts.length > 0) {
            shifts.sort((a, b) => (a.month * 100 + a.day) - (b.month * 100 + b.day));
            let s = new Date(year, shifts[0].month - 1, shifts[0].day);
            let e = new Date(year, shifts[0].month - 1, shifts[0].day);
            for (let i = 1; i < shifts.length; i++) {
              let c = new Date(year, shifts[i].month - 1, shifts[i].day);
              if (isNextWorkingDay(e, c, year)) {
                e = c;
              } else {
                periods.push({s: formatDateSafe(s), e: formatDateSafe(e)});
                s = c; e = c;
              }
            }
            periods.push({s: formatDateSafe(s), e: formatDateSafe(e)});
          }
          return { name: emp.abv_name, totalDays: shifts.length, periods: periods };
        });
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "vacation_map", year, employees: employeesFormatted})
        });
        if (!response.ok) throw new Error("Erro na resposta da API");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Mapa_Global_Ferias_${year}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Erro:", error);
        alert("Falha ao gerar o mapa global.");
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
    async function consultDiscrepancies() {
      const year = parseInt(document.getElementById("global-year-filter")?.value || new Date().getFullYear());
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const DAYS_RIGHT = 22;    
      let modal = document.getElementById("discrepancy-modal");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "discrepancy-modal";
        modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;";
        document.body.appendChild(modal);
      }      
      modal.style.display = "flex";
      modal.innerHTML = `
        <div style="background:#ffffff; padding:0; border-radius:16px; width:92%; max-width:720px; box-shadow:0 30px 80px rgba(0,0,0,0.35); animation:modalIn .25s ease;
                    overflow:hidden; font-family:system-ui,Segoe UI,Roboto;">
          <div style="padding:18px 22px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,#3b82f6,#2563eb);
                      color:white;">
          <div style="font-size:16px;font-weight:700;">🔍 Análise de Férias ${year}</div>
          <button onclick="document.getElementById('discrepancy-modal').style.display='none'" style=" border:none; background:rgba(255,255,255,0.15); color:white; width:32px; height:32px;
                           border-radius:8px; cursor:pointer; font-size:18px;">✕</button></div>
          <div style="padding:22px;">
            <div id="disc-content">⌛ A analisar dados...</div>
          </div>
          <div style="padding:16px 22px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc;">
            <button id="export-discrepancies-btn" onclick="exportDiscrepancies()" style="padding:8px 16px; border:none; border-radius:8px; background:#3b82f6; color:white; font-weight:600;
            cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">📊 Exportar</button>
            <button onclick="document.getElementById('discrepancy-modal').style.display='none'" style=" padding:8px 16px; border:none; border-radius:8px; background:#64748b; color:white;
                             font-weight:600; cursor:pointer;">Fechar</button>
          </div>
        </div>
        <style>
          @keyframes modalIn{from{transform:translateY(30px); opacity:0;} to {transform:translateY(0); opacity:1;}}
        </style>
      `;
      try {
        const [empRes, shiftRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&exit_date=is.null&order=abv_name.asc`, { 
            headers: getSupabaseHeaders() 
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&shift=eq.FE`, { 
            headers: getSupabaseHeaders() 
          })
        ]);
        const employees = await empRes.json();
        const allShifts = await shiftRes.json();
        const content = document.getElementById("disc-content");
        const data = employees.map(emp => {
          const marked = allShifts.filter(s => s.n_int === emp.n_int).length;
          const missing = DAYS_RIGHT - marked;
          return { ...emp, marked, missing };
        });
        const withDiscrepancies = data.filter(d => d.missing !== 0).sort((a, b) => Math.abs(b.missing) - Math.abs(a.missing));    
        const ok = employees.length - withDiscrepancies.length;
        const missing = withDiscrepancies.filter(d => d.missing > 0).length;
        const excess = withDiscrepancies.filter(d => d.missing < 0).length;
        window.discrepancyData = { year, data: withDiscrepancies };    
        if (withDiscrepancies.length === 0) {
          content.innerHTML = `
            <div style="padding:40px;background:#f0fdf4;color:#166534;border-radius:8px;text-align:center;font-size:16px;">
              ✅ <strong>Excelente!</strong><br>
              Todos os ${employees.length} funcionários ativos têm exatamente 22 dias marcados.
            </div>`;
          return;
        }
        let html = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
            <div style="background:#f0fdf4;padding:15px;border-radius:8px;text-align:center;border:2px solid #bbf7d0;">
              <div style="font-size:28px;font-weight:800;color:#166534;">${ok}</div>
              <div style="font-size:11px;color:#166534;margin-top:5px;">✅ COMPLETOS</div>
            </div>
            <div style="background:#fef2f2;padding:15px;border-radius:8px;text-align:center;border:2px solid #fecaca;">
              <div style="font-size:28px;font-weight:800;color:#ef4444;">${missing}</div>
              <div style="font-size:11px;color:#ef4444;margin-top:5px;">⚠️ POR MARCAR</div>
            </div>
            <div style="background:#eff6ff;padding:15px;border-radius:8px;text-align:center;border:2px solid #bfdbfe;">
              <div style="font-size:28px;font-weight:800;color:#3b82f6;">${excess}</div>
              <div style="font-size:11px;color:#3b82f6;margin-top:5px;">➕ EXCESSO</div>
            </div>
            <div style="background:#fafaf9;padding:15px;border-radius:8px;text-align:center;border:2px solid #e7e5e4;">
              <div style="font-size:28px;font-weight:800;color:#44403c;">${employees.length}</div>
              <div style="font-size:11px;color:#44403c;margin-top:5px;">👥 TOTAL</div>
            </div>
          </div>    
          <div style="max-height:350px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f8fafc;position:sticky;top:0;z-index:1;">
                  <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:600;">Funcionário</th>
                  <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;font-weight:600;">Direito</th>
                  <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;font-weight:600;">Marcados</th>
                  <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;font-weight:600;">Diferença</th>
                  <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;font-weight:600;">Estado</th>
                  <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;font-weight:600;">Excesso Transitório?</th>                  
                </tr>
              </thead>
            <tbody>`;
        withDiscrepancies.forEach((emp, i) => {
          const color = emp.missing > 0 ? "#ef4444" : "#3b82f6";
          const bgColor = emp.missing > 0 ? "#fef2f2" : "#eff6ff";
          const icon = emp.missing > 0 ? "⚠️" : "➕";
          const status = emp.missing > 0 ? "Por marcar" : "Excesso";         
          html += `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};border-bottom:1px solid #f1f5f9;">
              <td style="padding:12px;font-weight:500;">${emp.abv_name}</td>
              <td style="padding:12px;text-align:center;color:#64748b;">${DAYS_RIGHT}</td>
              <td style="padding:12px;text-align:center;font-weight:600;">${emp.marked}</td>
              <td style="padding:12px;text-align:center;font-weight:700;color:${color};font-size:15px;">
                ${emp.missing > 0 ? '+' : ''}${emp.missing}
              </td>
              <td style="padding:12px;">
                <span style="background:${bgColor};color:${color};padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;">
                  ${icon} ${status}
                </span>
              </td>
              <td style="padding:12px;text-align:center;">
                <button ${emp.missing >= 0 ? 'disabled' : ''} 
                  onclick="this.parentElement.parentElement.setAttribute('data-transitory','sim');this.style.background='#10b981';this.style.color='#fff';
                  this.nextElementSibling.style.background='#f1f5f9';this.nextElementSibling.style.color='#64748b';" 
                  style="padding:4px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:11px;font-weight:600;cursor:${emp.missing < 0 ? 'pointer' : 'not-allowed'};
                  background:#f1f5f9;color:${emp.missing < 0 ? '#64748b' : '#cbd5e1'};margin-right:4px;opacity:${emp.missing < 0 ? '1' : '0.4'};">
                  Sim
                </button>
                <button ${emp.missing >= 0 ? 'disabled' : ''} 
                  onclick="this.parentElement.parentElement.setAttribute('data-transitory','nao');this.style.background='#ef4444';this.style.color='#fff';
                  this.previousElementSibling.style.background='#f1f5f9';this.previousElementSibling.style.color='#64748b';"
                  style="padding:4px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:11px;font-weight:600;cursor:${emp.missing < 0 ? 'pointer' : 'not-allowed'};
                  background:#f1f5f9;color:${emp.missing < 0 ? '#64748b' : '#cbd5e1'};opacity:${emp.missing < 0 ? '1' : '0.4'};">
                  Não
                </button>
              </td>
            </tr>`;
        });    
        html += `</tbody></table></div>`;
        content.innerHTML = html;
      } catch (error) {
        console.error("Erro:", error);
        document.getElementById("disc-content").innerHTML = `
        <div style="padding:20px;background:#fef2f2;color:#991b1b;border-radius:8px;text-align:center;">
          ❌ Erro ao carregar dados: ${error.message}
        </div>`;
      }
    }
    async function exportDiscrepancies() {
      if (!window.discrepancyData) {
        alert("Nenhum dado para exportar");
        return;
      }
      const { year, data } = window.discrepancyData;
      const rows = document.querySelectorAll("#discrepancy-modal tbody tr");
      const payload = {
        mode: "vacation_anomalies", year, rows: 
        data.map((emp, i) => ({abv_name: emp.abv_name, marked: emp.marked, missing: emp.missing, transitory: rows[i]?.getAttribute("data-transitory") || "—"}))};
      try {
        const btn = document.getElementById("export-discrepancies-btn");
        if (btn) {btn.disabled = true; btn.textContent = "⌛ A gerar...";}
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        } 
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Discrepancias_Ferias_${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        alert("❌ Erro ao gerar PDF: " + error.message);
      } finally {
        const btn = document.getElementById("export-discrepancies-btn");
        if (btn) {btn.disabled = false; btn.textContent = "📊 Exportar";}
      }
    }
    /* PRIORIDADE FÉRIAS */
    async function createPriorityMap() {
      const cardBody = document.querySelector("#priority-scheduling-map .card-body");
      if (!cardBody) return;
      if (!document.getElementById("priority-core-css")) {
        const s = document.createElement("style");
        s.id = "priority-core-css";
        s.innerHTML = `
          .p-wrapper {font-family: 'Inter', sans-serif; color: #1e293b;}
          .p-container {max-height: 500px; overflow: auto; border: 1px solid #cbd5e1; border-radius: 6px; position: relative; scrollbar-width: none;}
          .p-container::-webkit-scrollbar {display: none;}
          .p-table {width: 100%; border-collapse: separate; border-spacing: 0; font-size: 10px; table-layout: fixed;}
          .p-table thead tr:first-child th {position: sticky; top: 0; z-index: 100; background: #f8fafc; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; height: 35px;}
          .p-table thead tr.q-header th {position: sticky; top: 35px; z-index: 90; background: #e2e8f0; border-bottom: 2px solid #94a3b8; height: 20px;}
          .p-name-col {position: sticky !important; left: 0; width: 150px; z-index: 80; background: #f1f5f9 !important; border-right: 2px solid #cbd5e1 !important; text-align: left !important; 
                       padding-left: 10px !important;}
          .p-score-col {position: sticky !important; right: 0; width: 70px; z-index: 80; background: #475569 !important; color: #fff !important; border-left: 2px solid #cbd5e1 !important; 
                        font-weight: 900; font-size: 12px; text-align: center;}
          .priority-row:hover .p-score-col {background: #334155 !important; color: #fbbf24 !important;}
          thead tr:first-child th.p-name-col {z-index: 110; left: 0; top: 0;}
          thead tr.q-header th.p-name-col {z-index: 105; left: 0; top: 35px;}
          thead tr:first-child th.p-score-col {z-index: 110; right: 0; top: 0;}
          thead tr.q-header th.p-score-col {z-index: 105; right: 0; top: 35px;}
          .p-table td {border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 4px; height: 32px; text-align: center; vertical-align: middle;}
          .q-val {color: #94a3b8;}
          .q-has-data {color: #1e293b !important; font-weight: 800 !important; background: #f8fafc;}
          .q1 {border-right: 1px dotted #cbd5e1 !important;}
          .p-badge-rh {background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px;}
          .p-footer {display: flex; justify-content: flex-end; margin-top: 10px; gap: 8px;}
          .p-btn {background: #1e293b; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;}
          .priority-row:hover td {background-color: #f1f5f9 !important;}
          .p-header-flex {display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;}
          .p-title {font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px; margin: 0;}
          .p-filter-box {display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;}
          .p-year-select {padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 400; outline: none;}
        `;
        document.head.appendChild(s);
      }
      if (!document.getElementById("priority-table-body")) {
        const defaultYear = new Date().getFullYear();
        const defaultPriorityYear = defaultYear + 1;
        let yearOptions = "";
        for (let y = 2026; y <= 2036; y++) {
          yearOptions += `<option value="${y}" ${y === defaultYear ? 'selected' : ''}>${y}</option>`;
        }
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        cardBody.innerHTML = `
          <div class="p-wrapper">
            <div class="p-header-flex">
              <div class="p-title" id="priority-map-title">
                <span class="p-badge-rh">RH</span> PRIORIDADE DE MARCAÇÃO DE FÉRIAS ${defaultPriorityYear}
              </div>
              <div class="p-filter-box">
                <span>Ano:</span>
                <select id="priority-year-filter" class="p-year-select" onchange="loadPriorityData()">${yearOptions}</select>
              </div>
            </div>
            <div class="p-container">
              <table class="p-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="p-name-col">FUNCIONÁRIO</th>
                    ${meses.map(m => `<th colspan="2" style="width:75px;">${m.toUpperCase()}</th>`).join('')}
                    <th rowspan="2" class="p-score-col">TOTAL</th>
                  </tr>
                  <tr class="q-header">
                    ${Array(12).fill(0).map(() => `<th class="q1">Q1</th><th>Q2</th>`).join('')}
                  </tr>
                </thead>
                <tbody id="priority-table-body">
                  <tr><td colspan="26" style="padding:40px; text-align:center;">⌛ A calcular pontuações de prioridade...</td></tr>
                </tbody>
              </table>
            </div>
            <div class="p-footer">
              <button class="p-btn" onclick="exportPrioritiesMap()">📥 Emitir Mapa</button>
            </div>
          </div>`;
      }
      loadPriorityData();
    }
    async function loadPriorityData() {
      const filterElem = document.getElementById("priority-year-filter");
      const selectedYear = filterElem ? parseInt(filterElem.value) : new Date().getFullYear();
      const priorityYear = selectedYear + 1;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const tableBody = document.getElementById("priority-table-body");
      const titleElem = document.getElementById("priority-map-title");
      if (titleElem) titleElem.innerHTML = `<span class="p-badge-rh">RH</span> PRIORIDADE DE MARCAÇÃO DE FÉRIAS ${priorityYear}`;
      tableBody.innerHTML = `<tr><td colspan="26" style="padding:40px; text-align:center;">⌛ A calcular pontuações de prioridade para ${priorityYear}...</td></tr>`;
      const weights = {1: [1, 1], 2: [1, 1], 3: [1, 1], 4: [1, 1], 5: [4, 4], 6: [4, 8], 7: [12, 12], 8: [12, 12], 9: [12, 8], 10: [4, 4], 11: [1, 1], 12: [2, 8]};
      try {
        const [empRes, shiftRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&function=neq.SEC&function=neq.COM&order=abv_name.asc`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${selectedYear}&shift=eq.FE`, {
            headers: getSupabaseHeaders()
          })
        ]);
        const allEmployees = await empRes.json();
        const allShifts = await shiftRes.json();
        const employeesWithVacation = allEmployees.filter(emp => allShifts.some(s => s.n_int === emp.n_int));
        if (employeesWithVacation.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="26" style="padding:40px; text-align:center; color:#64748b;">Não existem dados de férias em ${selectedYear} para calcular prioridades.</td></tr>`;
          return;
        } 
        let rows = "";
        employeesWithVacation.forEach(emp => {
          const empShifts = allShifts.filter(s => s.n_int === emp.n_int);
          let totalScore = 0;
          let fortnightlyHTML = "";
          for (let m = 1; m <= 12; m++) {
            const q1Days = empShifts.filter(s => s.month === m && s.day <= 15).length;
            const q1Score = q1Days * weights[m][0];
            const q2Days = empShifts.filter(s => s.month === m && s.day > 15).length;
            const q2Score = q2Days * weights[m][1];
            totalScore += (q1Score + q2Score);
            fortnightlyHTML += `
              <td class="q1 q-val ${q1Score > 0 ? 'q-has-data' : ''}">${q1Score > 0 ? q1Score : '-'}</td>
              <td class="q-val ${q2Score > 0 ? 'q-has-data' : ''}">${q2Score > 0 ? q2Score : '-'}</td>
            `;
          }
          rows += `
            <tr class="priority-row">
              <td class="p-name-col"><strong>${emp.abv_name}</strong></td>
              ${fortnightlyHTML}
              <td class="p-score-col">${totalScore}</td>
            </tr>
          `;
        });
        tableBody.innerHTML = rows;
      } catch (err) {
        console.error("Erro na Prioridade:", err);
        tableBody.innerHTML = `<tr><td colspan="26" style="color:red; text-align:center;">Erro: ${err.message}</td></tr>`;
      }
    } 
    async function exportPrioritiesMap() {
      const selectedYear = parseInt(document.getElementById("holiday-year-select")?.value || new Date().getFullYear());
      const priorityYear = selectedYear + 1;
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const btn = event?.target;
      const originalText = btn ? btn.innerText : "";
      if (btn) btn.innerText = "⌛ A Gerar Mapa...";
      const weights = {1: [1, 1], 2: [1, 1], 3: [1, 1], 4: [1, 1], 5: [4, 4], 6: [4, 8], 7: [12, 12], 8: [12, 12], 9: [12, 8], 10: [4, 4], 11: [1, 1], 12: [2, 8]};
      try {
        const [empRes, shiftRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&function=neq.SEC&function=neq.COM&order=abv_name.asc`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${selectedYear}&shift=eq.FE`, {
            headers: getSupabaseHeaders()
          })
        ]);
        const allEmployees = await empRes.json();
        const allShifts = await shiftRes.json();
        const employeesPayload = allEmployees
        .filter(emp => allShifts.some(s => s.n_int === emp.n_int))
        .map(emp => {
          const empShifts = allShifts.filter(s => s.n_int === emp.n_int);
          let totalScore = 0;
          let scoresArray = [];
          for (let m = 1; m <= 12; m++) {
            const q1Days = empShifts.filter(s => s.month === m && s.day <= 15).length;
            const q1Score = q1Days * weights[m][0];
            const q2Days = empShifts.filter(s => s.month === m && s.day > 15).length;
            const q2Score = q2Days * weights[m][1];
            scoresArray.push(q1Score);
            scoresArray.push(q2Score);
            totalScore += (q1Score + q2Score);
          }
          return {name: emp.abv_name, scores: scoresArray, totalScore: totalScore};
        });
        if (employeesPayload.length === 0) {
          alert("Não existem dados para exportar.");
          return;
        }
        const response = await fetch('https://cb360-online.vercel.app/api/employees_convert_and_send', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({mode: "vacation_priority", priorityYear: priorityYear, employees: employeesPayload})
        });
        if (!response.ok) throw new Error("Erro na resposta da API");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Prioridades_Ferias_${priorityYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Erro ao exportar:", err);
        alert("Erro ao gerar o PDF. Verifica a consola.");
      } finally {
        if (btn) btn.innerText = originalText;
      }
    } 
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const access = btn.dataset.access;
        const pageId = btn.dataset.page;
        if (access === "Marcação de Férias") {
          createHolidayManagement(); 
        } 
        else if (access === "Mapa de Férias") {
          createGlobalHolidayMap();
        }
        else if (access === "Mapa de Prioridade") {
          createPriorityMap();
        }
      });
    });
    /* ============================================
    FASE 05 - SHIFT ALLOWANCE MANAGEMENT
    ============================================ */
    async function createEmployeeShiftAllowance() {
      const cardBody = document.querySelector("#eligibility-subs-shift .card-body");
      if (!cardBody) return;
      if (!document.getElementById("eligibility-core-css")) {
        const s = document.createElement("style");
        s.id = "eligibility-core-css";
        s.innerHTML = `
          .e-wrapper {font-family: 'Inter', sans-serif; color: #1e293b;}
          .e-title {font-size: 16px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;}
          .e-badge-rh {background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px;}          
          .e-container {max-height: 500px; overflow: auto; border: 1px solid #cbd5e1; border-radius: 6px; position: relative; scrollbar-width: none;}
          .e-container::-webkit-scrollbar {display: none;}
          .e-table {width: 100%; border-collapse: separate; border-spacing: 0; font-size: 10.5px; table-layout: fixed;}
          .e-table th {position: sticky; top: 0; z-index: 10; background: #f8fafc; border-bottom: 2px solid #94a3b8; border-right: 1px solid #cbd5e1; padding: 8px 2px; text-align: center;}
          .e-table th:first-child, .e-table td:first-child {position: sticky; left: 0; width: 150px; min-width: 150px; z-index: 11; background: #f1f5f9; border-right: 2px solid #cbd5e1; 
                                                            text-align: left; padding-left: 10px;}
          .e-table th:first-child {z-index: 12;}
          .e-table td {border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 4px; text-align: center; vertical-align: middle; height: 35px;}
          .e-eligible {background-color: #10b981 !important; color: white !important; font-weight: bold; border-radius: 4px; padding: 4px 10px; font-size: 9px;}
          .e-no-data {color: #cbd5e1;}
          .e-year-select {padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 400; outline: none; cursor: pointer;}
          .holiday-row:hover td {background-color: #f1f5f9 !important;}
          .e-footer {display: flex; justify-content: flex-end; margin-top: 15px; gap: 10px;}
          .e-btn {background: #1e293b; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; display: flex; align-items: center; gap: 6px;}
          .e-btn:hover {background: #334155;}
          .e-btn-info {background: #64748b;}
          .e-btn-info:hover {background: #475569;}      
        `;
        document.head.appendChild(s);
      }
      if (!document.getElementById("eligibility-table-body")) {
        const defaultYear = new Date().getFullYear();
        let yearOptions = "";
        for (let y = 2026; y <= 2036; y++) {
          yearOptions += `<option value="${y}" ${y === defaultYear ? 'selected' : ''}>${y}</option>`;
        }
        cardBody.innerHTML = `
          <div class="e-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div class="e-title" style="margin:0;"><span class="e-badge-rh">RH</span> ELIGIBILIDADE PARA SUBSÍDIO DE TURNO</div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;">
                <span>Ano:</span>
                <select id="eligibility-year-filter" class="e-year-select" onchange="loadEligibilityData()">${yearOptions}</select>
              </div>
            </div>
            <div class="e-container">
              <table class="e-table">
                <thead>
                  <tr>
                    <th>FUNCIONÁRIO</th>
                    ${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map(m => `<th style="width:70px;">${m.toUpperCase()}</th>`).join('')}
                  </tr>
                </thead>
                <tbody id="eligibility-table-body">
                  <tr><td colspan="13" style="padding:40px; text-align:center;">⌛ A carregar dados de elegibilidade...</td></tr>
                </tbody>
              </table>
            </div>
            <div class="e-footer">
              <button class="e-btn e-btn-info" onclick="createConsultationEligibility()">🔍 Consulta Detalhada</button>
              <button class="e-btn" onclick="exportShiftEligibility()">📥 Emitir Mapa</button>
            </div>
          </div>`;
      }
      loadEligibilityData();
    }
    async function loadEligibilityData() {
      const filterElem = document.getElementById("eligibility-year-filter");
      const year = filterElem ? parseInt(filterElem.value) : new Date().getFullYear();
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const tableBody = document.getElementById("eligibility-table-body");
      tableBody.innerHTML = `<tr><td colspan="13" style="padding:40px; text-align:center;">⌛ A carregar dados de ${year}...</td></tr>`;
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}`, {
          headers: getSupabaseHeaders()
        });
        const data = await response.json();
        if (!data || data.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="13" style="padding:40px; text-align:center; color:#64748b;">Sem registos para o ano ${year}.</td></tr>`;
          return;
        }
        const employeeMap = {};
        data.forEach(reg => {
          if (!employeeMap[reg.n_int]) {
            employeeMap[reg.n_int] = {name: reg.abv_name, months: new Set()};
          }
          employeeMap[reg.n_int].months.add(parseInt(reg.month));
        });
        const sortedNInts = Object.keys(employeeMap).sort((a, b) => parseInt(a) - parseInt(b));
        let rows = "";
        sortedNInts.forEach(n_int => {
          const emp = employeeMap[n_int];
          rows += `
            <tr class="holiday-row">
              <td><strong>${emp.name}</strong> <small style="color:#94a3b8; font-weight:normal;">(${n_int})</small></td>
              ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                return emp.months.has(m)
                  ? `<td><span class="e-eligible">SIM</span></td>`
                  : `<td><span class="e-no-data">-</span></td>`;
              }).join('')}
            </tr>`;
        });
        tableBody.innerHTML = rows;
      } catch (err) {
        console.error("Erro:", err);
        tableBody.innerHTML = `<tr><td colspan="13" style="color:red; text-align:center;">Erro: ${err.message}</td></tr>`;
      }
    }
    async function createConsultationEligibility() {
      const filterElem = document.getElementById("eligibility-year-filter");
      const year = filterElem ? parseInt(filterElem.value) : new Date().getFullYear();
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      let modal = document.getElementById("eligibility-modal");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "eligibility-modal";
        modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15, 23, 42, 0.7);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);";
        document.body.appendChild(modal);
      }
      modal.style.display = "flex";
      modal.innerHTML = `
        <div style="background:#fff;padding:0;border-radius:12px;width:95%;max-width:900px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);overflow:hidden;font-family:'Inter',sans-serif;">
          <div style="background:#1e293b;padding:20px;color:white;display:flex;justify-content:space-between;align-items:center;">
            <h5 style="margin:0;font-size:18px;font-weight:700;">🔍 Detalhe de Elegibilidade - ${year}</h5>
            <button onclick="document.getElementById('eligibility-modal').style.display='none'" style="border:none;background:none;cursor:pointer;font-size:24px;color:#94a3b8;line-height:1;">&times;</button>
          </div>
          <div style="padding:20px;">        
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; padding:15px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:13px; font-weight:700; color:#475569;">Mês:</span>
                <select id="modal-month-filter" style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; font-size:13px; outline:none; cursor:pointer;" onchange="renderEligibilityTable()">
                  <option value="all">--Selecione o Mês--</option>
                  <option value="1">Janeiro</option><option value="2">Fevereiro</option><option value="3">Março</option>
                  <option value="4">Abril</option><option value="5">Maio</option><option value="6">Junho</option>
                  <option value="7">Julho</option><option value="8">Agosto</option><option value="9">Setembro</option>
                  <option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
                </select>
              </div>
              <div id="eligibility-count" style="font-size:12px; color:#64748b; margin-left:auto; font-weight:500;"></div>
            </div>
            <div id="eligibility-content" style="min-height:200px;">⌛ A carregar registos...</div>        
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px; padding-top:15px; border-top:1px solid #e2e8f0;">
              <button onclick="exportDetailedShiftEligibility()" style="background:#1e293b; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:600; 
                               cursor:pointer; font-size:13px;">📥 Emitir</button>
              <button onclick="document.getElementById('eligibility-modal').style.display='none'" 
              style="background:#64748b; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:600; cursor:pointer; font-size:13px;">Fechar</button>
            </div>
          </div>
        </div>
      `;
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&order=abv_name.asc,month.asc,day.asc`, {
          headers: getSupabaseHeaders()
        });
        const data = await response.json();
        window.rawEligibilityData = data;
        renderEligibilityTable();
      } catch (error) {
        console.error("Erro:", error);
        document.getElementById("eligibility-content").innerHTML = `<div style="color:#ef4444; text-align:center; padding:20px;">❌ Erro ao ligar ao servidor.</div>`;
      }
    }
    function renderEligibilityTable() {
      const monthFilter = document.getElementById("modal-month-filter").value;
      const content = document.getElementById("eligibility-content");
      const countDisplay = document.getElementById("eligibility-count");
      const data = window.rawEligibilityData || [];
      const filteredData = monthFilter === "all" 
        ? data 
        : data.filter(d => parseInt(d.month) === parseInt(monthFilter));
      countDisplay.innerHTML = `Registos encontrados: <span style="color:#1e293b;">${filteredData.length}</span>`;
      if (filteredData.length === 0) {
        content.innerHTML = `<div style="text-align:center; padding:50px; color:#94a3b8; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;">Nenhum turno elegível encontrado para este período.</div>`;
        return;
      }
      const mesesNomes = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      let html = `
        <div style="max-height:420px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px; scrollbar-width: thin;">
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead>
              <tr style="background:#f1f5f9; position:sticky; top:0; z-index:10; box-shadow:0 1px 0 #cbd5e1;">
                <th style="padding:12px; text-align:left; color:#475569; font-weight:700;">FUNCIONÁRIO</th>
                <th style="padding:12px; text-align:center; color:#475569; font-weight:700;">DIA</th>
                <th style="padding:12px; text-align:left; color:#475569; font-weight:700;">MÊS</th>
                <th style="padding:12px; text-align:center; color:#475569; font-weight:700;">SAÍDA</th>
                <th style="padding:12px; text-align:center; color:#475569; font-weight:700;">STATUS</th>
              </tr>
            </thead>
          <tbody>
        `;
      filteredData.forEach((reg, i) => {
        html += `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'}; border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 12px;">
              <div style="font-weight:700; color:#1e293b;">${reg.abv_name}</div>
              <div style="font-size:10px; color:#94a3b8;">#${reg.n_int}</div>
            </td>
            <td style="padding:10px 12px; text-align:center; font-weight:600; color:#1e293b;">${String(reg.day).padStart(2, '0')}</td>
            <td style="padding:10px 12px; color:#64748b;">${mesesNomes[parseInt(reg.month)]}</td>
            <td style="padding:10px 12px; text-align:center;">
              <span style="background:#f1f5f9; color:#0f172a; padding:4px 8px; border-radius:4px; font-family:monospace; font-weight:800; border:1px solid #e2e8f0;">
                ${reg.exit_hour || '--:--'}
              </span>
            </td>
            <td style="padding:10px 12px; text-align:center;">
              <span style="background:#dcfce7; color:#166534; padding:4px 10px; border-radius:20px; font-size:10px; font-weight:800; letter-spacing:0.3px; border:1px solid #bbf7d0;">
                ELEGÍVEL
              </span>
            </td>
          </tr>
        `;
      });
      html += `</tbody></table></div>`;
      content.innerHTML = html;
    }
    async function exportShiftEligibility() {      
      const filterElem = document.getElementById("eligibility-year-filter");
      const year = filterElem ? parseInt(filterElem.value) : new Date().getFullYear();
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const btn = event?.target;
      const originalText = btn ? btn.innerText : "";
      if (btn) {btn.disabled = true; btn.innerText = "⌛ A Gerar Mapa...";}
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}`, {
          headers: getSupabaseHeaders()
        });
        const data = await response.json();
        if (!data || data.length === 0) {
          showPopupWarning("Sem dados para exportar."); 
          return;
        }
        const employeeMap = {};
        data.forEach(reg => {
          if (!employeeMap[reg.n_int]) {
            employeeMap[reg.n_int] = {name: reg.abv_name, months: new Set()};
          }
          employeeMap[reg.n_int].months.add(parseInt(reg.month));
        });
        const employees = Object.values(employeeMap)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(emp => ({
          name: emp.name,
          months: [1,2,3,4,5,6,7,8,9,10,11,12].map(m => emp.months.has(m) ? "SIM" : "")
        }));
        const apiResponse = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "shift_allowance", year, employees})
        });
        if (!apiResponse.ok) {
          const text = await apiResponse.text();
          throw new Error(text);
        }
        const blob = await apiResponse.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Elegibilidade_Mensal_Subsidio_Turno_${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Erro:", err);
        showPopupWarning("❌ Erro ao gerar PDF: " + err.message);
      } finally {
        if (btn) {btn.disabled = false; btn.innerText = originalText;}
      }
    }    
    async function exportDetailedShiftEligibility() {
      const filterElem = document.getElementById("eligibility-year-filter");
      const year = filterElem ? parseInt(filterElem.value) : new Date().getFullYear();
      const monthFilter = document.getElementById("modal-month-filter")?.value;
      if (!monthFilter || monthFilter === "all") {
        showPopupWarning("Por favor selecione um mês antes de emitir.");
        return;
      }
      const month = parseInt(monthFilter);
      const data = window.rawEligibilityData || [];
      const records = data.filter(d => parseInt(d.month) === month);
      if (records.length === 0) {
        showPopupWarning("Sem registos para emitir."); 
        return;
      }
      const btn = event?.target;
      const originalText = btn ? btn.innerText : "";
      if (btn) { btn.disabled = true; btn.innerText = "⌛ A gerar..."; }
      try {
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "detailed_shift_allowance", year, month, records})
        });
        if (!response.ok) { const text = await response.text(); throw new Error(text); }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Detalhe_Elegibilidade_${year}_${month}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        showPopupWarning("❌ Erro ao gerar PDF: " + err.message);
      } finally {
        if (btn) { btn.disabled = false; btn.innerText = originalText; }
      }
    }
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const access = btn.dataset.access;
        const pageId = btn.dataset.page;
        if (access === "Subsidio de Turno") {
          createEmployeeShiftAllowance(); 
        }        
      });
    });
    /* ============================================
    FASE 06 - SALARY PROCESSING MAP
    ============================================ */
    async function createSalaryProcessingMap() {
      const cardBody = document.querySelector("#salary-processing-map .card-body");
      if (!cardBody) return;      
      if (!document.getElementById("salary-core-css")) {
        const s = document.createElement("style");
        s.id = "salary-core-css";
        s.innerHTML = `
          .s-wrapper {font-family: 'Inter', sans-serif; color: #1e293b;}
          .s-header-flex {display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;}
          .s-title {font-size: 16px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;}
          .s-badge-rh {background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px;}
          .s-container {max-height: 500px; overflow: auto; border: 1px solid #cbd5e1; border-radius: 8px; position: relative; -ms-overflow-style: none; scrollbar-width: none;}
          .s-container::-webkit-scrollbar {display: none;}
          .s-table {width: 100%; border-collapse: separate; border-spacing: 0; font-size: 11px; table-layout: fixed;}
          .s-table th {position: sticky; top: 0; z-index: 10; background: #f8fafc; border-bottom: 2px solid #94a3b8; border-right: 1px solid #cbd5e1; padding: 8px 2px; text-align: center;}          
          .s-name-col {position: sticky !important; left: 0; z-index: 20 !important; background: #f1f5f9 !important; border-right: 2px solid #cbd5e1 !important; text-align: left !important; 
                       padding-left: 12px !important; font-weight: 700; width: 180px; min-width: 180px;}
          .s-table thead th.s-name-col {z-index: 30 !important; top: 0;}          
          .s-table td {border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 6px 4px; text-align: center; vertical-align: middle !important;}          
          .s-row:hover td {background-color: #f8fafc !important;}
          .s-card-base {background: #fee2e2; color: #991b1b; border: 1px solid currentColor; border-radius: 4px; font-weight: 700; font-size: 9px; padding: 3px; line-height: 1.2;}
          .s-val-sickleave {color: #dc2626; background: #fef2f2;}
          .s-val-vacation {color: #2563eb; background: #eff6ff;}
          .s-val-parental {color: #7c3aed; background: #f5f3ff;}
          .s-val-disgust {color: #4b5563; background: #f3f4f6;}
          .s-val-f-just {color: #d97706; background: #fffbeb; border-color: #fcd34d;}
          .s-val-f-unjust {color: #dc2626; background: #fee2e2; border-color: #fca5a5;}          
          .s-status-badge {background: #fee2e2; color: #991b1b; border: 1px solid currentColor; border-radius: 4px; font-weight: 700; font-size: 9px; padding: 3px; line-height: 1.2;}
          .s-status-yes {font-size: 9px; color: #10b981; background: #ecfdf5;}
          .s-status-no {color: #dc2626; background: #fef2f2;}
          .s-filter-select {padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-size: 13px; font-weight: 600;}
          .s-footer {display: flex; justify-content: flex-end; margin-top: 15px; gap: 10px;}
          .s-btn {background: #1e293b; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s;}
          .s-btn:hover {opacity: 0.9;}
        `;
        document.head.appendChild(s);
      }
      const defaultYear = new Date().getFullYear();
        const defaultPriorityYear = defaultYear + 1;
        let yearOptions = "";
        for (let y = 2026; y <= 2036; y++) {
          yearOptions += `<option value="${y}" ${y === defaultYear ? 'selected' : ''}>${y}</option>`;
        }
      const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const defaultMonth = new Date().getMonth() + 1;
      let monthOptions = months.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');;   
      cardBody.innerHTML = `
        <div class="s-wrapper">
          <div class="s-header-flex">
            <div class="s-title" style="margin:0;"><span class="s-badge-rh">RH</span> PROCESSAMENTO SALARIAL</div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;">
             <span>Ano:</span>
             <select id="salary-year-filter" class="s-filter-select" onchange="loadSalaryData()">${yearOptions}</select>
              <span>Mês:</span>
              <select id="salary-month-filter" class="s-filter-select" onchange="loadSalaryData()">${monthOptions}</select>
            </div>
          </div>
          <div class="s-container">
            <table class="s-table">
              <thead>
                <tr>
                  <th class="s-name-col">FUNCIONÁRIO</th>
                  <th>SUB. TURNO</th>
                  <th>BAIXA MÉDICA</th>
                  <th>FÉRIAS</th>
                  <th>LIC. PARENTAL</th>
                  <th>LIC. NOJO</th>
                  <th>FALTAS JUST.</th>
                  <th>FALTAS INJUST.</th>
                </tr>
              </thead>
              <tbody id="salary-table-body">
                <tr><td colspan="8" style="padding:40px; text-align:center;">⌛ A carregar dados de Janeiro...</td></tr>
              </tbody>
            </table>
          </div>
          <div class="s-footer">
            <button class="s-btn" style="background:#059669;" onclick="exportSalaryMapXlsx()">📊 Exportar Excel</button>
            <button class="s-btn" onclick="exportSalaryMap(event)">📥 Emitir Mapa</button>
          </div>
        </div>`;
      setTimeout(() => {
        const monthSelect = document.getElementById("salary-month-filter");
        monthSelect.value = defaultMonth;
        loadSalaryData();
      }, 0);
    }
    async function loadSalaryData() {
      const monthFilter = parseInt(document.getElementById("salary-month-filter").value);
      const year = parseInt(document.getElementById("salary-year-filter").value);
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const tableBody = document.getElementById("salary-table-body");
      const firstDayOfMonth = `${year}-${String(monthFilter).padStart(2, '0')}-01`;
      const lastDayMonth = new Date(year, monthFilter, 0).getDate();
      const prevMonth = monthFilter === 1 ? 12 : monthFilter - 1;
      const prevYear = monthFilter === 1 ? year - 1 : year;
      const nextMonth = monthFilter === 12 ? 1 : monthFilter + 1;
      const nextYear = monthFilter === 12 ? year + 1 : year;
      const monthName = document.getElementById("salary-month-filter").options[document.getElementById("salary-month-filter").selectedIndex].text;
      const defaultMonth = new Date().getMonth() + 1;      
      tableBody.innerHTML = `<tr><td colspan="8" style="padding:40px; text-align:center;">⌛ A carregar dados de ${monthName}...</td></tr>`;
      try {
        const [empRes, eligRes, shiftRes, prevShiftRes, nextShiftRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&or=(exit_date.is.null,exit_date.gte.${firstDayOfMonth},team.in.(COM,SEC))`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&month=eq.${monthFilter}`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${prevYear}&month=eq.${prevMonth}&day=gt.25`, {
            headers: getSupabaseHeaders()
          }),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&year=eq.${nextYear}&month=eq.${nextMonth}&day=lt.6`, {
            headers: getSupabaseHeaders()
          })
        ]);
        let employees = await empRes.json();
        const allEligibility = await eligRes.json();
        const shifts = await shiftRes.json();
        const prevShifts = await prevShiftRes.json();
        const nextShifts = await nextShiftRes.json();
        employees.sort((a, b) => parseInt(a.n_int) - parseInt(b.n_int));
        let html = "";
        employees.forEach(emp => {
          const n_int_formatted = String(emp.n_int).padStart(3, '0');
          const empShifts = shifts.filter(s => String(s.n_int).padStart(3, '0') === n_int_formatted);
          const empPrevShifts = prevShifts.filter(s => String(s.n_int).padStart(3, '0') === n_int_formatted);
          const empNextShifts = nextShifts.filter(s => String(s.n_int).padStart(3, '0') === n_int_formatted);
          const hasSubsidy = allEligibility.some(reg => String(reg.n_int).padStart(3, '0') === n_int_formatted && parseInt(reg.month) === monthFilter);
          const subShiftDisplay = hasSubsidy
            ? `<span class="s-status-badge s-status-yes">SIM</span>`
            : `<span class="s-status-badge s-status-no">NÃO</span>`;
          const formatPeriod = (code, classeCss) => {
            const days = empShifts.filter(s => s.shift === code).map(s => parseInt(s.day)).sort((a, b) => a - b);
            if (days.length === 0) return "-";
            let periods = [], current = [days[0]];
            for (let i = 1; i < days.length; i++) {
              if (days[i] - days[i - 1] <= 4) current.push(days[i]);
              else {periods.push(current); current = [days[i]];}
            }
            periods.push(current);
            return periods.map((period, index) => {
              let pStart = period[0], pEnd = period[period.length - 1];
              if (index === 0) {
                const codePrev = empPrevShifts.filter(s => s.shift === code).sort((a,b) => b.day - a.day);
                if (codePrev.length > 0) {
                  const diff = Math.round((new Date(year, monthFilter-1, pStart) - new Date(prevYear, prevMonth-1, codePrev[0].day)) / 86400000);
                  if (diff === 1) pStart = 1;
                  else if (diff <= 3) {
                    const dw = new Date(year, monthFilter-1, 1).getDay();
                    if ((pStart === 2 && (dw === 0 || dw === 1)) || (pStart === 3 && dw === 0)) pStart = 1;
                  }
                }
              }
              if (index === periods.length - 1) {
                const codeNext = empNextShifts.filter(s => s.shift === code).sort((a,b) => a.day - b.day);
                if (codeNext.length > 0) {
                  const diff = Math.round((new Date(nextYear, nextMonth-1, codeNext[0].day) - new Date(year, monthFilter-1, pEnd)) / 86400000);
                  if (diff === 1) pEnd = lastDayMonth;
                  else if (diff <= 3) {
                    const dwLast = new Date(year, monthFilter-1, lastDayMonth).getDay();
                    if (pEnd >= lastDayMonth - 2 && (dwLast === 5 || dwLast === 6)) pEnd = lastDayMonth;
                  }
                }
              }
              return `<div class="s-card-base ${classeCss}">${String(pStart).padStart(2,'0')} a ${String(pEnd).padStart(2,'0')} (${(pEnd-pStart)+1} Dias)</div>`;
            }).join("");
          };
          const vacationDays = empShifts.filter(s => s.shift === 'FE').map(s => parseInt(s.day)).sort((a, b) => a - b);
          let vacationInfo = "-";
          if (vacationDays.length > 0) {
            let vPeriods = [], vCurrent = [vacationDays[0]];
            for (let i = 1; i < vacationDays.length; i++) {
              if (vacationDays[i] - vacationDays[i - 1] <= 4) vCurrent.push(vacationDays[i]);
              else { vPeriods.push(vCurrent); vCurrent = [vacationDays[i]]; }
            }
            vPeriods.push(vCurrent);
            vacationInfo = vPeriods.map(p => {
              const useful = p.filter(d => {
                const dw = new Date(year, monthFilter-1, d).getDay(); 
                return dw !== 0 && dw !== 6; 
              }).length;
              return `<div class="s-card-base s-val-vacation">${String(p[0]).padStart(2,'0')} a ${String(p[p.length-1]).padStart(2,'0')} (${useful} Úteis)</div>`;
            }).join("");
          }
          const formatAbsence = (code, classeCss) => {
          const days = empShifts.filter(s => s.shift === code).map(s => parseInt(s.day)).sort((a, b) => a - b);
          if (days.length === 0) return "-";
          let text = days.length === 1 ? `Dia: ${String(days[0]).padStart(2, '0')}` : `${days.join(", ")} (${days.length} Dias)`;
          return `<div class="s-card-base ${classeCss}">${text}</div>`;
        };
        html += `
          <tr class="s-row">
            <td class="s-name-col">${emp.abv_name}</td>
            <td style="text-align:center;">${subShiftDisplay}</td>
            <td>${formatPeriod('BX', 's-val-sickleave')}</td>
            <td>${vacationInfo}</td>
            <td>${formatPeriod('LP', 's-val-parental')}</td>
            <td>${formatPeriod('LN', 's-val-disgust')}</td>
            <td>${formatAbsence('FJ', 's-val-f-just')}</td>
            <td>${formatAbsence('FI', 's-val-f-unjust')}</td>
          </tr>
        `;
        });
        tableBody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;">Nenhum funcionário encontrado.</td></tr>';        
      } catch (e) {
        console.error(e);
        tableBody.innerHTML = `<tr><td colspan="8" style="color:red;text-align:center;">Erro ao carregar dados: ${e.message}</td></tr>`;
      }
    }
    async function exportSalaryMap(event) {
      const btn = event?.target;
      const originalText = btn ? btn.innerText : "";
      try {
        if (btn) {
          btn.innerText = "⌛ A Gerar Mapa...";
          btn.disabled = true;
        }
        const year = parseInt(document.getElementById("salary-year-filter").value);
        const monthValue = parseInt(document.getElementById("salary-month-filter").value);
        const monthsNames = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const months = monthsNames[monthValue - 1];
        const rows = document.querySelectorAll("#salary-table-body tr");
        const employees = [];
        rows.forEach(row => {
          const cells = row.querySelectorAll("td");
          if (cells.length < 8) return;
          const extractCards = (cell) => {
            const cards = cell.querySelectorAll(".s-card-base");
            if (cards.length === 0) return "-";
            return Array.from(cards).map(c => c.innerText.trim().replace(/[\n\r\t]+/g, " ")).join("\n");
          };
          const extractBadge = (cell) => {
            const badge = cell.querySelector(".s-status-badge");
            return badge ? badge.innerText.trim() : "-";
          };
          employees.push({name: cells[0].innerText.trim(), subShift: extractBadge(cells[1]), casualties: extractCards(cells[2]), vacations: extractCards(cells[3]),
                          parental: extractCards(cells[4]), disgust: extractCards(cells[5]), justified: extractCards(cells[6]), unjustified: extractCards(cells[7])});});
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "salary_map", year, month: monthValue, employees})
        });
        if (!response.ok) throw new Error("Erro na resposta da API");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Mapa_Salarial_${months}_${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao gerar mapa salarial.");
      } finally {
        if (btn) {
          btn.innerText = originalText;
          btn.disabled = false;
        }
      }
    }
    async function exportSalaryMapXlsx() {
      const btn = event?.target;
      const originalText = btn ? btn.innerText : "";
      try {
        if (btn) {
          btn.innerText = "⌛ A Gerar Mapa...";
          btn.disabled = true;
        }
        const year = parseInt(document.getElementById("salary-year-filter").value);
        const monthValue = parseInt(document.getElementById("salary-month-filter").value);
        const monthsNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const months = monthsNames[monthValue - 1];
        const rows = document.querySelectorAll("#salary-table-body tr");
        const employees = [];
        rows.forEach(row => {
          const cells = row.querySelectorAll("td");
          if (cells.length < 8) return;
          const extractCards = (cell) => {
            const cards = cell.querySelectorAll(".s-card-base");
            if (cards.length === 0) return "-";
            return Array.from(cards)
              .map(c => c.innerText.trim().replace(/[\n\r\t]+/g, " "))
              .join("\n");
          };
          const extractBadge = (cell) => {
            const badge = cell.querySelector(".s-status-badge");
            return badge ? badge.innerText.trim() : "-";
          };
          employees.push({name: cells[0].innerText.trim(), subShift: extractBadge(cells[1]), casualties: extractCards(cells[2]), vacations: extractCards(cells[3]),
                          parental: extractCards(cells[4]), disgust: extractCards(cells[5]), justified: extractCards(cells[6]), unjustified: extractCards(cells[7])});});
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "salary_map_xlsx", year, month: monthValue, employees})
        });
        if (!response.ok) throw new Error("Erro na resposta da API");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Mapa_Salarial_${months}_${year}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao gerar Excel.");
      } finally {
        if (btn) {
          btn.innerText = originalText;
          btn.disabled = false;
        }
      }
    }
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const access = btn.dataset.access;
        const pageId = btn.dataset.page;
        if (access === "Processamento Salarial") {
          createSalaryProcessingMap();
        }        
      });
    });
    /* ============================================
    FASE 07 - ANNUAL FRAMEWORK EIPs
    ============================================ */    
    async function createEIPAnnualShiftMap() {
      const cardBody = document.querySelector("#annual-eip-shift-map .card-body");
      if (!cardBody) return;
      if (!document.getElementById("annual-core-css")) {
        const s = document.createElement("style");
        s.id = "annual-core-css";
        s.innerHTML = `
          .a-wrapper {font-family: 'Inter', sans-serif; color: #1e293b;}
          .a-title {font-size: 16px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;}
          .a-badge-rh {background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px;}
          .a-container {max-height: 500px; overflow: auto; border: 1px solid #cbd5e1; border-radius: 8px; position: relative; scrollbar-width: none; -ms-overflow-style: none;}
          .a-container::-webkit-scrollbar {display: none;}
          .a-table {width: 100%; border-collapse: separate; border-spacing: 0; font-size: 10.5px; table-layout: fixed;}
          .a-table thead tr.a-month-header th {position: sticky; top: 0; z-index: 10; background: #1e293b; color: #fff; font-size: 11px; font-weight: 800; text-align: center; 
                                               padding: 7px 2px; border-right: 2px solid #cbd5e1; letter-spacing: 0.5px;}
          .a-table thead tr.a-month-header th:last-child {border-right: none;}
          .a-table thead tr.a-month-header th {border-bottom: 2px solid #94a3b8;}
          .a-table td {border-bottom: 1px solid #b0bec5; border-right: 1px solid #b0bec5; padding: 4px 3px; text-align: center; vertical-align: middle; height: 22px; white-space: nowrap;}
          .a-table td.a-last-col {border-right: 2px solid #94a3b8;}
          .a-table td:last-child {border-right: none;}
          .a-col-day {font-weight: 700; font-size: 10px; width: 18px; min-width: 18px; color: #334155;}
          .a-col-wd {font-size: 9.5px; width: 28px; min-width: 28px; color: #64748b;}
          .a-col-shift {font-size: 10px; width: 38px; min-width: 38px; font-weight: 600;}
          .a-eip01 {background-color: #dbeafe; color: #1d4ed8; border-radius: 3px; padding: 1px 3px; font-size: 11px; font-weight: 700;}
          .a-eip02 {background-color: #dcfce7; color: #15803d; border-radius: 3px; padding: 1px 3px; font-size: 11px; font-weight: 700;}
          .a-weekend {background-color: #f9e0b0;}
          .a-holiday {background-color: #f7c6c7;}
          .a-holiday-optional {background-color: #d6ecff;}
          .a-empty {background: #f8fafc;}
          .a-table tbody tr:hover td {background-color: #f1f5f9 !important;}
          .a-year-select {padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 400; outline: none; cursor: pointer;}
          .a-footer {display: flex; justify-content: flex-end; margin-top: 12px; gap: 8px;}
          .a-btn {background: #1e293b; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: 0.2s;}
          .a-btn:hover {background: #334155;}
        `;
        document.head.appendChild(s);
      }
      if (!document.getElementById("annual-table-body")) {
        const defaultYear = new Date().getFullYear();
        let yearOptions = "";
        for (let y = 2026; y <= 2036; y++) {
          yearOptions += `<option value="${y}" ${y === defaultYear ? 'selected' : ''}>${y}</option>`;
        }
        const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        const COL_DAY_W = 18, COL_WD_W = 28, COL_SHIFT_W = 38;
        const colgroup = "<colgroup>" + MONTHS.map(() => `<col style="width:${COL_DAY_W}px"><col style="width:${COL_WD_W}px"><col style="width:${COL_SHIFT_W}px">`).join("") + "</colgroup>";
        const monthHeaders = MONTHS.map(m => `<th colspan="3">${m.toUpperCase()}</th>`).join("");
        cardBody.innerHTML = `
          <div class="a-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div class="a-title" id="annual-map-title" style="margin:0;"><span class="a-badge-rh">RH</span> ENQUADRAMENTO ANUAL (EIPs) - ${defaultYear}</div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;">
                <span>Ano:</span>
                <select id="annual-year-filter" class="a-year-select" onchange="loadEIPData()">${yearOptions}</select>
              </div>
            </div>
            <div class="a-container">
              <table class="a-table">${colgroup}
                <thead>
                  <tr class="a-month-header">${monthHeaders}</tr>
                </thead>
                <tbody id="annual-table-body">
                  <tr><td colspan="36" style="padding:40px; text-align:center;">⌛ A carregar mapa anual...</td></tr>
                </tbody>
              </table>
            </div>
            <div class="a-footer">
              <button class="a-btn" onclick="exportAnnualMap(event)">📥 Emitir Mapa</button>
            </div>
          </div>`;
      }
      loadEIPData();
    }
    async function loadEIPData() {
      const filterElem = document.getElementById("annual-year-filter");
      const year = filterElem ? parseInt(filterElem.value) : new Date().getFullYear();
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const tableBody = document.getElementById("annual-table-body");
      const titleElem = document.getElementById("annual-map-title");
      if (titleElem) titleElem.innerHTML = `<span class="a-badge-rh">RH</span> ENQUADRAMENTO ANUAL (EIPs) - ${year}`;
      tableBody.innerHTML = `<tr><td colspan="36" style="padding:40px; text-align:center;">⌛ A carregar dados de ${year}...</td></tr>`;
      const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
      const WEEKDAYS = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
      function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
      function getHolidays(y) {
        const fixed = [[1,1],[4,25],[5,1],[6,10],[8,15],[9,7],[10,5],[11,1],[12,1],[12,8],[12,25]];
        const a = y%19, b = Math.floor(y/100), c = y%100, d = Math.floor(b/4), e = b%4;
        const f = Math.floor((b+8)/25), g = Math.floor((b-f+1)/3), h = (19*a+b-d-g+15)%30;
        const i = Math.floor(c/4), k = c%4, l = (32+2*e+2*i-h-k)%7;
        const m = Math.floor((a+11*h+22*l)/451);
        const eMonth = Math.floor((h+l-7*m+114)/31);
        const eDay = ((h+l-7*m+114)%31)+1;
        const easter = new Date(y, eMonth-1, eDay);
        const addD = (dt, n) => { const r = new Date(dt); r.setDate(r.getDate()+n); return r; };
        const mobile = [addD(easter,-2), easter, addD(easter,60)];
        const set = new Set();
        const optionalSet = new Set();
        fixed.forEach(([mo,dy]) => set.add(`${mo}-${dy}`));
        mobile.forEach(dt => set.add(`${dt.getMonth()+1}-${dt.getDate()}`));
        const carnaval = addD(easter, -47);
        optionalSet.add(`${carnaval.getMonth()+1}-${carnaval.getDate()}`);
        return { set, optionalSet };
      }
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_eip_anual?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&order=month,day`,
          { headers: getSupabaseHeaders() }
        );
        const eipData = await res.json();
        if (!eipData || eipData.length === 0) {
          await checkAndSeedEIPYear(year);
          return;
        }
        window._eipCurrentData = {year, days: eipData.map(r => ({month: r.month, day: r.day, team: r.team }))};
        const eipMap = {};
        eipData.forEach(r => {eipMap[`${r.month}-${r.day}`] = r.team;});
        const holidays = getHolidays(year);
        const maxDays = 31;
        const monthDays = MONTHS.map((_, mi) => daysInMonth(year, mi + 1));
        const rowspanInserted = new Array(12).fill(false);
        let rows = "";
        for (let day = 1; day <= maxDays; day++) {
          rows += `<tr>`;
          MONTHS.forEach((_, mi) => {
            const month = mi + 1;
            const isLast = mi === 11;
            const lastClass = isLast ? '' : 'a-last-col';
            const totalDays = monthDays[mi];
            const emptySpan = maxDays - totalDays;
            if (rowspanInserted[mi]) return;
            if (day > totalDays && emptySpan > 0) {
              rowspanInserted[mi] = true;
              rows += `<td colspan="3" rowspan="${emptySpan}" class="${lastClass}" style="background:transparent;"></td>`;
              return;
            }
            const date = new Date(year, mi, day);
            const wd = date.getDay();
            const isWeekend = wd === 0 || wd === 6;
            const isHoliday = holidays.set.has(`${month}-${day}`);
            const isHolidayOpt = holidays.optionalSet.has(`${month}-${day}`);
            const bgCls = isHoliday ? 'a-holiday' : isHolidayOpt ? 'a-holiday-optional' : isWeekend ? 'a-weekend' : '';
            const team = eipMap[`${month}-${day}`] || '';
            const teamCls = team === 'EIP-01' ? 'a-eip01' : team === 'EIP-02' ? 'a-eip02' : '';
            rows += `<td class="a-col-day ${bgCls}">${String(day).padStart(2,'0')}</td>`;
            rows += `<td class="a-col-wd ${bgCls}">${WEEKDAYS[wd]}</td>`;
            rows += `<td class="a-col-shift ${lastClass} ${bgCls}"><span class="${teamCls}">${team}</span></td>`;
          });
          rows += `</tr>`;
        }
        tableBody.innerHTML = rows;
      } catch (err) {
        console.error("Erro no Mapa Anual EIP:", err);
        tableBody.innerHTML = `<tr><td colspan="36" style="color:red; text-align:center;">Erro: ${err.message}</td></tr>`;
      }
    } 
    async function exportAnnualMap(event) { 
      const btn = event?.target;
      const originalText = btn ? btn.innerText : "";
      try {
        if (btn) { btn.innerText = "⌛ A Gerar Mapa..."; btn.disabled = true; }
        const data = window._eipCurrentData;
        if (!data || !data.days || data.days.length === 0) {
          alert("Sem dados para exportar. Carregue o mapa primeiro.");
          return;
        } 
        const response = await fetch("https://cb360-online.vercel.app/api/employees_convert_and_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({mode: "eip_annual_map", year: data.year, days: data.days, format: "pdf" })
        });
        if (!response.ok) throw new Error("Erro na resposta da API");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Enquadramento_EIPs_${data.year}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao gerar mapa EIP.");
      } finally {
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
      }
    } 
    async function checkAndSeedEIPYear(year) {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/reg_eip_anual?corp_oper_nr=eq.${corpOperNr}&year=eq.${year}&limit=1`,
        { headers: getSupabaseHeaders() }
      );
      const checkData = await checkRes.json();
      if (checkData.length > 0) return;
      const confirmed = await showEIPSeedPopup(year);
      if (!confirmed) return;
      const prevYear = year - 1;
      const prevRes = await fetch(
        `${SUPABASE_URL}/rest/v1/reg_eip_anual?corp_oper_nr=eq.${corpOperNr}&year=eq.${prevYear}&month=eq.12&order=day.desc&limit=4`,
        { headers: getSupabaseHeaders() }
      );
      const prevData = await prevRes.json();
      const PATTERN = ["EIP-01", "EIP-01", "EIP-02", "EIP-02"];
      let startPatternIndex = 0;
      if (prevData && prevData.length > 0) {
        const lastDays = prevData.sort((a, b) => b.day - a.day);
        const lastTeam = lastDays[0].team;
        let consecutiveCount = 0;
        for (let i = 0; i < lastDays.length; i++) {
          if (lastDays[i].team === lastTeam) consecutiveCount++;
          else break;
        }
        consecutiveCount = Math.min(consecutiveCount, 2);
        if (lastTeam === "EIP-02") {
          startPatternIndex = consecutiveCount === 1 ? 1 : 2;
        } else {
          startPatternIndex = consecutiveCount === 1 ? 3 : 0;
        }
      }
      const records = [];
      let patternIndex = startPatternIndex;
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          records.push({corp_oper_nr: corpOperNr, year: year, month: month, day: day, team: PATTERN[patternIndex % 4]}); patternIndex++;
        }
      }
      const BATCH_SIZE = 500;
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/reg_eip_anual`, {
          method: "POST",
          headers: { ...getSupabaseHeaders(), "Prefer": "return=minimal" },
          body: JSON.stringify(batch)
        });
        if (!res.ok) {
          const err = await res.text();
          console.error("Erro ao inserir lote:", err);
          alert("Erro ao gerar enquadramento. Tente novamente.");
          return;
        }
      }
      loadEIPData();
    }
    function showEIPSeedPopup(year) {
      return new Promise((resolve) => {
        const existing = document.getElementById("eip-seed-popup");
        if (existing) existing.remove();
        const overlay = document.createElement("div");
        overlay.id = "eip-seed-popup";
        Object.assign(overlay.style, {
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        });
        overlay.innerHTML = `
          <div style="background:#fff; border-radius:10px; padding:32px; max-width:420px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3); font-family:'Inter',sans-serif;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
              <span style="background:#1e293b; color:#fff; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:800;">RH</span>
              <span style="font-size:15px; font-weight:800; color:#1e293b;">ENQUADRAMENTO EIPs</span>
            </div>
            <p style="color:#475569; font-size:13px; line-height:1.6; margin-bottom:8px;">
              Não existem registos de enquadramento para <strong>${year}</strong>.
            </p>
            <p style="color:#475569; font-size:13px; line-height:1.6; margin-bottom:24px;">
              Deseja gerar automaticamente o enquadramento para as EIP para ${year}, 
              com continuação da sequência de ${year - 1}?
            </p>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button id="eip-seed-no" style="padding:10px 20px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; color:#475569; font-weight:600; font-size:13px; cursor:pointer;">
                Não
              </button>
              <button id="eip-seed-yes" style="padding:10px 20px; border-radius:6px; border:none; background:#1e293b; color:#fff; font-weight:600; font-size:13px; cursor:pointer;">
                ✅ Sim, Gerar
              </button>
            </div>
          </div>`;
        document.body.appendChild(overlay);
        document.getElementById("eip-seed-yes").addEventListener("click", () => {
          overlay.remove();
          resolve(true);
        });
        document.getElementById("eip-seed-no").addEventListener("click", () => {
          overlay.remove();
          resolve(false);
          const filterElem = document.getElementById("annual-year-filter");
          if (filterElem) filterElem.value = new Date().getFullYear();
          loadEIPData();
        });
      });
    }
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const access = btn.dataset.access;
        if (access === "Enquadramento EIPs") {
          createEIPAnnualShiftMap(); 
        }        
      });
    });
    /* ============================================
    FASE 08 - EMPLOYEE REGISTRATIONS
    ============================================ */
    async function createEmployeeRegistration() {
      const cardBody = document.querySelector("#employee-registration .card-body");
      if (!cardBody) return;
      if (!document.getElementById("reg-core-css")) {
        const s = document.createElement("style");
        s.id = "reg-core-css";
        s.innerHTML = `
          .reg-wrapper {font-family: 'Inter', sans-serif; color: #1e293b;}
          .reg-grid {display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;}
          .reg-grid-full {grid-column: 1 / -1;}
          .reg-field {display: flex; flex-direction: column; gap: 5px;}
          .reg-label {font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;}
          .reg-input, .reg-select {width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-family: 'Inter', sans-serif;
                                   color: #1e293b; background: #fff; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;}
          .reg-input:focus, .reg-select:focus {border-color: #1e293b; box-shadow: 0 0 0 3px rgba(30,41,59,0.08);}
          .reg-input::placeholder {color: #94a3b8;}
          .reg-divider {height: 1px; background: #e2e8f0; margin: 8px 0 20px;}
          .reg-table-wrapper {max-height: 380px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; scrollbar-width: none; -ms-overflow-style: none;}
          .reg-table-wrapper::-webkit-scrollbar {display: none;}
          .reg-table {width: 100%; border-collapse: collapse; font-size: 12px;}
          .reg-table thead th {position: sticky; top: 0; background: #1e293b; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700;
                               text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;}
          .reg-table tbody tr {border-bottom: 1px solid #f1f5f9; transition: background 0.15s;}
          .reg-table tbody tr:hover {background: #f8fafc;}
          .reg-table tbody td {padding: 9px 12px; color: #334155; vertical-align: middle;}
          .reg-table tbody td:last-child {text-align: center;}
          .reg-badge {display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;}
          .reg-badge-active {background: #dcfce7; color: #15803d;}
          .reg-badge-inactive {background: #fee2e2; color: #991b1b;}
          .reg-btn {border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; font-family: 'Inter', sans-serif; transition: 0.2s;}
          .reg-btn-primary {background: #1e293b; color: #fff;}
          .reg-btn-primary:hover {background: #334155;}
          .reg-btn-secondary {background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;}
          .reg-btn-secondary:hover {background: #e2e8f0;}
          .reg-btn-danger {background: #fee2e2; color: #991b1b;}
          .reg-btn-danger:hover {background: #fecaca;}
          .reg-btn-edit {background: #eff6ff; color: #1d4ed8;}
          .reg-btn-edit:hover {background: #dbeafe;}
          .reg-btn-sm {padding: 5px 10px; font-size: 11px;}
          .reg-footer {display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px;}
          .reg-section-title {font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;}
          .reg-badge-rh {background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px;}
          .reg-empty {padding: 40px; text-align: center; color: #94a3b8; font-size: 13px;}
          .reg-search {width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-family: 'Inter', sans-serif;
                       color: #1e293b; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 12px center; outline: none; transition: border-color 0.2s; box-sizing: border-box;}
          .reg-search:focus {border-color: #1e293b;}
          .reg-header-bar {display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 12px;}
        `;
        document.head.appendChild(s);
      }
      cardBody.innerHTML = `
        <div class="reg-wrapper">
          <div class="reg-section-title"><span class="reg-badge-rh">RH</span> CADASTRO DE FUNCIONÁRIO</div>
          <div class="reg-grid" id="reg-form-grid">
            <div class="reg-field">
              <label class="reg-label">Nº Interno</label>
              <input type="text" id="reg-n-int" class="reg-input" placeholder="Ex: 001">
            </div>
            <div class="reg-field">
              <label class="reg-label">Nome</label>
              <input type="text" id="reg-name" class="reg-input" placeholder="Nome do funcionário">
            </div>
            <div class="reg-field">
              <label class="reg-label">Função</label>
              <select id="reg-function" class="reg-select">
                <option value="">— Selecionar —</option>
                <option value="Comando">COMANDO</option>
                <option value="Coordenador">COORDENADOR</option>
                <option value="Secretariado">SECRETARIADO</option>
                <option value="TAT">TAT</option>
                <option value="TAS">TAS</option>
                <option value="OPTEL">OPTEL</option>
                <option value="EIP">EIP</option>
              </select>
            </div>
            <div class="reg-field">
              <label class="reg-label">Equipa</label>
              <select id="reg-team" class="reg-select">
                <option value="">— Selecionar —</option>
                <option value="Comando">COMANDO</option>
                <option value="Coordenação">COORDENAÇÃO</option>
                <option value="Secretariado">SECRETARIADO</option>
                <option value="INEM">INEM</option>
                <option value="TDNU">TDNU</option>
                <option value="SALOC">SALOC</option>
                <option value="EIP01">EIP01</option>
                <option value="EIP02">EIP02</option>
                <option value="EIP03">EIP03</option>
                <option value="EIP04">EIP04</option>
              </select>
            </div>
            <div class="reg-field">
              <label class="reg-label">Data de Entrada</label>
              <input type="date" id="reg-entry-date" class="reg-input">
            </div>
            <div class="reg-field">
              <label class="reg-label">Data de Saída</label>
              <input type="date" id="reg-exit-date" class="reg-input">
            </div>
          </div>
          <div class="reg-footer" style="margin-bottom: 24px;">
            <button class="reg-btn reg-btn-secondary" id="reg-clear-btn">Limpar</button>
            <button class="reg-btn reg-btn-primary" id="reg-save-btn">Guardar</button>
          </div>
          <div class="reg-divider"></div>
          <div class="reg-header-bar">
            <div class="reg-section-title" style="margin:0;"><span class="reg-badge-rh">RH</span> LISTA DE FUNCIONÁRIOS</div>
            <input type="text" id="reg-search" class="reg-search" placeholder="Pesquisar funcionário..." style="max-width:260px;">
          </div>
          <div class="reg-table-wrapper">
            <table class="reg-table">
              <thead>
                <tr>
                  <th style="width:70px;">Nº Int.</th>
                  <th>Nome</th>
                  <th style="width:90px;">Função</th>
                  <th style="width:80px;">Equipa</th>
                  <th style="width:105px;">Dt. Entrada</th>
                  <th style="width:105px;">Dt. Saída</th>
                  <th style="width:70px;">Estado</th>
                  <th style="width:100px;">Ações</th>
                </tr>
              </thead>
              <tbody id="reg-table-body">
                <tr><td colspan="8" class="reg-empty">⌛ A carregar funcionários...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      const entry = document.getElementById("reg-entry-date");
      const exit  = document.getElementById("reg-exit-date");
      setTimeout(() => {
        entry.value = "";
        exit.value = "";
      }, 0);
      document.getElementById("reg-save-btn").addEventListener("click", saveEmployee);
      document.getElementById("reg-clear-btn").addEventListener("click", clearRegForm);
      document.getElementById("reg-search").addEventListener("input", filterRegTable);
      await loadEmployees();
    }
    let __regEditingNInt = null;
    function clearRegForm() {
      __regEditingNInt = null;
      document.getElementById("reg-n-int").value = "";
      document.getElementById("reg-n-int").disabled = false;
      document.getElementById("reg-name").value = "";
      document.getElementById("reg-function").value = "";
      document.getElementById("reg-team").value = "";
      document.getElementById("reg-entry-date").value = "";
      document.getElementById("reg-exit-date").value  = "";
      document.getElementById("reg-save-btn").textContent = "Guardar";
    }
    async function loadEmployees() {
      const tbody = document.getElementById("reg-table-body");
      if (!tbody) return;
      tbody.innerHTML = `<tr><td colspan="8" class="reg-empty">⌛ A carregar...</td></tr>`;
      try {
        const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&order=n_int.asc`, {
            headers: getSupabaseHeaders()
          }
        );
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" class="reg-empty">Nenhum funcionário registado.</td></tr>`;
          return;
        }
        window._regAllEmployees = data;
        renderRegTable(data);
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="reg-empty" style="color:#dc2626;">Erro: ${err.message}</td></tr>`;
      }
    }
    function renderRegTable(data) {
      const tbody = document.getElementById("reg-table-body");
      if (!tbody) return;
      const today = new Date();
      today.setHours(0,0,0,0);
      tbody.innerHTML = data.map(emp => {
        const exitDate = emp.exit_date ? new Date(emp.exit_date.split("T")[0]) : null;
        const isActive = !exitDate || exitDate >= today;
        const badge = isActive
          ? `<span class="reg-badge reg-badge-active">Ativo</span>`
          : `<span class="reg-badge reg-badge-inactive">Inativo</span>`;
        const entryFmt = emp.entry_date ? emp.entry_date.split("T")[0] : "—";
        const exitFmt  = emp.exit_date  ? emp.exit_date.split("T")[0]  : "—";
        return `
          <tr>
            <td>${String(emp.n_int).padStart(3,"0")}</td>
            <td>${emp.abv_name || "—"}</td>
            <td>${emp.function || "—"}</td>
            <td>${emp.team || "—"}</td>
            <td>${entryFmt}</td>
            <td>${exitFmt}</td>
            <td>${badge}</td>
            <td>
              <button class="reg-btn reg-btn-edit reg-btn-sm" onclick="editEmployee(${emp.n_int})">✏️ Editar</button>
            </td>
          </tr>
        `;
      }).join("");
    }
    function filterRegTable() {
      const q = (document.getElementById("reg-search")?.value || "").toLowerCase();
      const all = window._regAllEmployees || [];
      const filtered = q
      ? all.filter(e => String(e.n_int).includes(q) || (e.abv_name || "").toLowerCase().includes(q) || (e.function || "").toLowerCase().includes(q) || (e.team || "").toLowerCase().includes(q))
      : all;
      renderRegTable(filtered);
    }
    function editEmployee(nInt) {
      const emp = (window._regAllEmployees || []).find(e => e.n_int == nInt);
      if (!emp) return;
      __regEditingNInt = nInt;
      const nIntField = document.getElementById("reg-n-int");
      nIntField.value = String(emp.n_int).padStart(3,"0");
      nIntField.disabled = true;
      document.getElementById("reg-name").value = emp.abv_name || "";
      const FUNCTION_REVERSE = {"COM": "Comando", "CRD": "Coordenador", "SEC": "Secretariado"};
      document.getElementById("reg-function").value = FUNCTION_REVERSE[emp.function] || emp.function || "";
      const TEAM_REVERSE = {"COM": "Comando", "CRD": "Coordenação", "SEC": "Secretariado"};
      document.getElementById("reg-team").value = TEAM_REVERSE[emp.team] || emp.team || "";
      document.getElementById("reg-entry-date").value = emp.entry_date ? emp.entry_date.split("T")[0] : "";
      document.getElementById("reg-exit-date").value = emp.exit_date  ? emp.exit_date.split("T")[0]  : "";
      document.getElementById("reg-save-btn").textContent = "Atualizar";
      const container = document.querySelector("#employee-registration .card-body");
      if (container) container.scrollTop = 0;
    }
    async function saveEmployee() {
      const nInt = document.getElementById("reg-n-int").value.trim();
      const name = document.getElementById("reg-name").value.trim();
      const funcRaw = document.getElementById("reg-function").value;
      const teamRaw = document.getElementById("reg-team").value;
      const entryDate = document.getElementById("reg-entry-date").value;
      const exitDate  = document.getElementById("reg-exit-date").value;
      if (!nInt || !name) {
        showPopupWarning("⚠️ Nº Interno e Nome são obrigatórios.");
        return;
      }
      if (entryDate && exitDate && new Date(exitDate) < new Date(entryDate)) {
        showPopupWarning("⚠️ A Data de Saída não pode ser anterior à Data de Entrada.");
        return;
      }
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const saveBtn = document.getElementById("reg-save-btn");
      saveBtn.disabled = true;
      saveBtn.textContent = "A guardar...";
      try {
        const allRes = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}&select=function,team,n_int`, {
            headers: getSupabaseHeaders()
          }
        );
        const allEmps = await allRes.json();
        if (!__regEditingNInt) {
          const exists = allEmps.some(e => e.n_int == nInt);
          if (exists) {
            showPopupWarning("⚠️ Nº interno já existe nesta corporação.");
            saveBtn.disabled = false;
            saveBtn.textContent = "Guardar";
            return;
          }
        }
        let func = funcRaw;
        const FUNCTION_MAP = {"Comando": "COM", "Coordenador": "CRD", "Secretariado": "SEC", "TAS": "TAS", "TAT": "TAT", "OPTEL": "OPTEL"};
        if (FUNCTION_MAP[funcRaw]) func = FUNCTION_MAP[funcRaw];
        else if (funcRaw === "EIP") {
          const eipMatch = teamRaw.match(/^EIP0?(\d+)$/);
          if (eipMatch) {
            const eipNum = eipMatch[1];
            const prefix = `EP${eipNum}`;
            const existing = allEmps
            .map(e => e.function || "")
            .filter(f => f.startsWith(prefix))
            .map(f => parseInt(f.replace(prefix, ""), 10))
            .filter(n => !isNaN(n));
            const lastNum = existing.length > 0 ? Math.max(...existing) : 0;
            func = `${prefix}${String(lastNum + 1).padStart(2, "0")}`;
          }
        }
        let team = teamRaw;
        const TEAM_MAP = {"Comando": "COM", "Coordenação": "CRD", "Secretariado": "SEC"};
        if (TEAM_MAP[teamRaw]) team = TEAM_MAP[teamRaw];
        else if (teamRaw === "INEM") {
          const existing = allEmps
          .map(e => e.team || "")
          .filter(t => /^EQ\d+$/.test(t))
          .map(t => parseInt(t.replace("EQ", ""), 10))
          .filter(n => !isNaN(n));
          const lastNum = existing.length > 0 ? Math.max(...existing) : 0;
          team = `EQ${String(lastNum + 1).padStart(2, "0")}`;
        } else if (teamRaw === "TDNU") {
          const existing = allEmps
          .map(e => e.team || "")
          .filter(t => /^TDNU\d+$/.test(t))
          .map(t => parseInt(t.replace("TDNU", ""), 10))
          .filter(n => !isNaN(n));
          const lastNum = existing.length > 0 ? Math.max(...existing) : 0;
          team = `TDNU${String(lastNum + 1).padStart(2, "0")}`;
        } else if (teamRaw === "SALOC") {
          const existing = allEmps
          .map(e => e.team || "")
          .filter(t => /^OPC\d+$/.test(t))
          .map(t => parseInt(t.replace("OPC", ""), 10))
          .filter(n => !isNaN(n));
          const lastNum = existing.length > 0 ? Math.max(...existing) : 0;
          team = `OPC${String(lastNum + 1).padStart(2, "0")}`;
        } else if (/^EIP\d+$/.test(teamRaw)) {
          team = teamRaw;
        }
        const payload = {n_int: parseInt(nInt, 10), abv_name: name, function: func || null, team: team || null, entry_date: entryDate || null, exit_date: exitDate || null, corp_oper_nr: corpOperNr};
        let res;
        if (__regEditingNInt) {
          res = await fetch(
            `${SUPABASE_URL}/rest/v1/reg_employees?n_int=eq.${__regEditingNInt}&corp_oper_nr=eq.${corpOperNr}`, {
              method: "PATCH",
              headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
              body: JSON.stringify(payload)
            }
          );
        } else {
          res = await fetch(`${SUPABASE_URL}/rest/v1/reg_employees`, {
            method: "POST",
            headers: {...getSupabaseHeaders(), "Content-Type": "application/json", "Prefer": "return=minimal"},
            body: JSON.stringify(payload)
          });
        }
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err);
        }
        showPopupSuccess(__regEditingNInt ? "✅ Funcionário atualizado!" : "✅ Funcionário registado!");
        clearRegForm();
        await loadEmployees();
      } catch (err) {
        console.error(err);
        showPopupWarning("❌ Erro: " + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = __regEditingNInt ? "Atualizar" : "Guardar";
      }
    }
    document.querySelectorAll(".sidebar-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.access === "Cadastro de Funcionários") {
          createEmployeeRegistration();
        }
      });
    });
    async function createRHDashboard() {
      const cardBody = document.querySelector("#dashboard-rh .card-body");
      if (!cardBody) {
        console.error("❌ Card body não encontrado!");
        return;
      }
      if (!document.getElementById("dashboard-core-css")) {
        const s = document.createElement("style");
        s.id = "dashboard-core-css";
        s.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          .dash-title {font-size: 16px; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; color: #1e293b;}
          .dash-badge-rh {background: #1e293b; color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-family: 'Inter', sans-serif; color: #1e293b;}
          .dash-wrapper {font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; background: linear-gradient(135deg, #f0f4ff 0%, #fafbff 60%, #f0f7f4 100%); padding: 24px;
                         border-radius: 16px; min-height: 100%;}
          .dash-filters {display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;}
          .dash-filter-label {font-size: 18px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;}
          .dash-filter-select {padding: 8px 14px; border: 1.5px solid rgba(99,102,241,0.25); border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
                               font-weight: 600; color: #1e293b; background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); cursor: pointer; outline: none;
                               transition: border-color 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(99,102,241,0.08);}
          .dash-filter-select:focus {border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15);}
          .dash-filter-btn {padding: 8px 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif;
                            font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 4px 12px rgba(99,102,241,0.3);}
          .dash-filter-btn:hover {opacity: 0.9; transform: translateY(-1px);}
          .dash-filter-btn:active {transform: translateY(0);}
          .dash-cards {display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;}
          @media (max-width: 1200px) {.dash-cards {grid-template-columns: repeat(2, 1fr);}}
          @media (max-width: 600px) {.dash-cards {grid-template-columns: 1fr;}}
          .dash-card {position: relative; background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1.5px solid rgba(255, 255, 255, 0.85);
                      border-radius: 20px; padding: 22px 20px 18px; box-shadow: 0 8px 32px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9); overflow: hidden;
                      transition: transform 0.25s, box-shadow 0.25s;}
          .dash-card:hover {transform: translateY(-4px); box-shadow: 0 16px 40px rgba(99,102,241,0.14), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9);}
          .dash-card::before {content: ''; position: absolute; top: -40px; right: -40px; width: 100px; height: 100px; border-radius: 50%; opacity: 0.12;}
          .dash-card-0::before {background: #6366f1;}
          .dash-card-1::before {background: #10b981;}
          .dash-card-2::before {background: #f59e0b;}
          .dash-card-3::before {background: #ec4899;}
          .dash-card-header {display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;}
          .dash-card-icon-wrap {width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);}
          .dash-card-0 .dash-card-icon-wrap {background: linear-gradient(135deg, #6366f1, #8b5cf6);}
          .dash-card-1 .dash-card-icon-wrap {background: linear-gradient(135deg, #10b981, #059669);}
          .dash-card-2 .dash-card-icon-wrap {background: linear-gradient(135deg, #f59e0b, #d97706);}
          .dash-card-3 .dash-card-icon-wrap {background: linear-gradient(135deg, #ec4899, #db2777);}
          .dash-card-value {font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1; letter-spacing: -1px;}
          .dash-card-label {font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-top: 4px;}
          .dash-progress-wrap {margin-top: 16px;}
          .dash-progress-meta {display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #94a3b8; margin-bottom: 6px;}
          .dash-progress-track {width: 100%; height: 6px; background: rgba(0,0,0,0.07); border-radius: 99px; overflow: hidden;}
          .dash-progress-bar {height: 100%; border-radius: 99px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);}
          .dash-card-0 .dash-progress-bar {background: linear-gradient(90deg, #6366f1, #8b5cf6);}
          .dash-card-1 .dash-progress-bar {background: linear-gradient(90deg, #10b981, #34d399);}
          .dash-card-2 .dash-progress-bar {background: linear-gradient(90deg, #f59e0b, #fbbf24);}
          .dash-card-3 .dash-progress-bar {background: linear-gradient(90deg, #ec4899, #f472b6);}
          .dash-charts {display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;}
          @media (max-width: 768px) {.dash-charts {grid-template-columns: 1fr;}}
          .dash-chart-box {background: rgba(255,255,255,0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1.5px solid rgba(255,255,255,0.85); border-radius: 20px;
                           padding: 22px; box-shadow: 0 8px 32px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.9); min-height: 300px;}
          .dash-chart-title {font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;}
          .dash-badge-rh {background: linear-gradient(135deg, #1e293b, #334155); color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;}
          .dash-loading {display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: dash-spin 0.7s linear infinite;
                         vertical-align: middle;}
          @keyframes dash-spin {to{transform: rotate(360deg);}}
          .dash-fade-in {animation: dashFadeIn 0.5s ease forwards; opacity: 0;}
          @keyframes dashFadeIn {from {opacity: 0; transform: translateY(10px);} to {opacity: 1; transform: translateY(0);}}
        `;
        document.head.appendChild(s);
      }
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      let monthOptions = monthNames.map((m, i) => `<option value="${i+1}" ${i+1 === currentMonth ? 'selected' : ''}>${m}</option>`).join('');
      const defaultYear = new Date().getFullYear();
      let yearOptions = '';
      for (let y = 2026; y <= 2036; y++) {
        yearOptions += `<option value="${y}" ${y === defaultYear ? 'selected' : ''}>${y}</option>`;
      }
      cardBody.innerHTML = `
        <div class="dash-title"><span class="dash-badge-rh">RH</span> DASHBOARD</div>
        <div class="dash-wrapper">
          <div class="dash-filters">
            <span class="dash-filter-label">
              <span style="position: relative; top: -2px;">🗓</span> Período:</span>
            <select class="dash-filter-select" id="dash-filter-month">${monthOptions}</select>
            <select class="dash-filter-select" id="dash-filter-year">${yearOptions}</select>
          </div>
          <div class="dash-cards">
            <div class="dash-card dash-card-0 dash-fade-in" style="animation-delay:0.05s">
              <div class="dash-card-header">
                <div>
                  <div class="dash-card-value" id="total-employees"><span class="dash-loading"></span></div>
                  <div class="dash-card-label">Total de Funcionários</div>
                </div>
                <div class="dash-card-icon-wrap">👥</div>
              </div>
              <div class="dash-progress-wrap">
                <div class="dash-progress-meta">
                  <span>Headcount</span>
                  <span id="total-employees-pct">—</span>
                    </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-bar" id="total-employees-bar" style="width:0%"></div>
                </div>
              </div>
            </div>
            <div class="dash-card dash-card-1 dash-fade-in" style="animation-delay:0.12s">
              <div class="dash-card-header">
                <div>
                  <div class="dash-card-value" id="active-employees"><span class="dash-loading"></span></div>
                  <div class="dash-card-label">Funcionários Ativos</div>
                </div>
                <div class="dash-card-icon-wrap">✅</div>
              </div>
              <div class="dash-progress-wrap">
                <div class="dash-progress-meta">
                  <span>% do total</span>
                  <span id="active-employees-pct">—</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-bar" id="active-employees-bar" style="width:0%"></div>
                </div>
              </div>
            </div>
            <div class="dash-card dash-card-2 dash-fade-in" style="animation-delay:0.19s">
              <div class="dash-card-header">
                <div>
                  <div class="dash-card-value" id="vacation-month"><span class="dash-loading"></span></div>
                  <div class="dash-card-label">Funcionários de Férias Este Mês</div>
                </div>
                <div class="dash-card-icon-wrap">🏖️</div>
              </div>
              <div class="dash-progress-wrap">
                <div class="dash-progress-meta">
                  <span>% do total</span>
                  <span id="vacation-month-pct">—</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-bar" id="vacation-month-bar" style="width:0%"></div>
                </div>
              </div>
            </div>
            <div class="dash-card dash-card-3 dash-fade-in" style="animation-delay:0.26s">
              <div class="dash-card-header">
                <div>
                  <div class="dash-card-value" id="subsidy-month"><span class="dash-loading"></span></div>
                  <div class="dash-card-label">Funcionários com Subsídio Turno</div>
                </div>
                <div class="dash-card-icon-wrap">💰</div>
              </div>
              <div class="dash-progress-wrap">
                <div class="dash-progress-meta">
                  <span>% do total</span>
                  <span id="subsidy-month-pct">—</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-bar" id="subsidy-month-bar" style="width:0%"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="dash-charts">
            <div class="dash-chart-box dash-fade-in" style="animation-delay:0.33s">
              <div class="dash-chart-title">
                <span class="dash-badge-rh">RH</span> Funcionários por Função
              </div>
              <canvas id="chart-by-team" style="max-height:250px;"></canvas>
            </div>
            <div class="dash-chart-box dash-fade-in" style="animation-delay:0.4s">
              <div class="dash-chart-title">
                <span class="dash-badge-rh">RH</span> Férias por Mês (<span id="chart-year-label">${currentYear}</span>)
              </div>
              <canvas id="chart-vacations" style="max-height:250px;"></canvas>
            </div>
          </div>
        </div>
      `;
      document.getElementById("dash-filter-month").addEventListener("change", loadDashboardData);
      document.getElementById("dash-filter-year").addEventListener("change", loadDashboardData);
      setTimeout(() => {
        const filterMonth = document.getElementById("dash-filter-month");
        const filterYear  = document.getElementById("dash-filter-year");
        if (filterMonth) filterMonth.value = currentMonth;
        if (filterYear)  filterYear.value  = currentYear;
      }, 0);
      await loadDashboardData();
    }
    let _dashChartTeam = null;
    let _dashChartVac = null;
    async function loadDashboardData() {
      const corpOperNr = sessionStorage.getItem("currentCorpOperNr") || "0805";
      const filterMonth = document.getElementById("dash-filter-month");
      const filterYear = document.getElementById("dash-filter-year");
      const selectedMonth = filterMonth ? parseInt(filterMonth.value) : new Date().getMonth() + 1;
      const selectedYear = filterYear ? parseInt(filterYear.value) : new Date().getFullYear();
      const monthStr = String(selectedMonth);
      const monthWithZero = selectedMonth < 10 ? `0${selectedMonth}` : String(selectedMonth);
      const yearStr = String(selectedYear);
      if (document.getElementById("chart-year-label"))
        document.getElementById("chart-year-label").textContent = selectedYear;
      ["total-employees","active-employees","vacation-month","subsidy-month"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<span class="dash-loading"></span>';
      });
      try {
        const headers = getSupabaseHeaders();
        const [empRes, vacRes, eligRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/reg_employees?corp_oper_nr=eq.${corpOperNr}`, {headers}),
          fetch(`${SUPABASE_URL}/rest/v1/reg_employee_shifts?corp_oper_nr=eq.${corpOperNr}&shift=eq.FE`, {headers}),
          fetch(`${SUPABASE_URL}/rest/v1/reg_eligibility?corp_oper_nr=eq.${corpOperNr}`, {headers})
        ]);
        const employees = await empRes.json();
        const vacations = await vacRes.json();
        const eligibility = await eligRes.json();
        const total = employees.length;
        const active = employees.filter(e => !e.exit_date || new Date(e.exit_date) >= new Date()).length;
        const vacMonth = new Set(
          vacations.filter(v => {
            const vMonth = String(v.month).trim();
            const vYear = String(v.year || "").trim();
            return (vMonth === monthStr || vMonth === monthWithZero) && vYear === yearStr;
          }).map(v => v.n_int)
        ).size;
        const filteredElig = eligibility.filter(e => {
          const eYear = String(e.year).trim();
          const eMonth = String(e.month).trim();
          return eYear === yearStr && (eMonth === monthStr || eMonth === monthWithZero);
        });
        const subsidy = new Set(filteredElig.map(e => String(e.n_int || ""))).size;
        const setCard = (valueId, barId, pctId, value, total) => {
          const el = document.getElementById(valueId);
          if (el) el.textContent = value;
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          const barEl = document.getElementById(barId);
          const pctEl = document.getElementById(pctId);
          if (barEl) setTimeout(() => { barEl.style.width = pct + "%"; }, 100);
          if (pctEl) pctEl.textContent = pct + "%";
        };
        setCard("total-employees", "total-employees-bar", "total-employees-pct", total, 50);
        setCard("active-employees", "active-employees-bar", "active-employees-pct", active, total);
        setCard("vacation-month", "vacation-month-bar", "vacation-month-pct", vacMonth, active);
        setCard("subsidy-month", "subsidy-month-bar", "subsidy-month-pct", subsidy, active);
        if (typeof Chart !== 'undefined') {
          if (_dashChartTeam) {_dashChartTeam.destroy(); _dashChartTeam = null;}
          if (_dashChartVac) {_dashChartVac.destroy(); _dashChartVac = null;}
          const today = new Date();
          const teamCounts = {};
          employees.forEach(e => {
            const exitDate = e.exit_date ? new Date(e.exit_date) : null;
            if (!exitDate || exitDate >= today) {
              let team = String(e.function || "Sem Função").trim();
              if (team.startsWith("EP1")) team = "EIP-01";
              else if (team.startsWith("EP2")) team = "EIP-02";
              teamCounts[team] = (teamCounts[team] || 0) + 1;
            }
          });
          const teamOrder = ["COM", "CRD", "TAS", "TAT", "OPTEL", "EIP-01", "EIP-02", "SEC"];
          const sortedTeams = Object.entries(teamCounts).sort((a, b) => {
            const indexA = teamOrder.indexOf(a[0]);
            const indexB = teamOrder.indexOf(b[0]);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          const teamLabels = sortedTeams.map(t => t[0]);
          const teamValues = sortedTeams.map(t => t[1]);
          const teamColors = ['rgba(99,102,241,0.85)', 'rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)',
                              'rgba(236,72,153,0.85)', 'rgba(59,130,246,0.85)', 'rgba(239,68,68,0.85)'];
          _dashChartTeam = new Chart(
            document.getElementById("chart-by-team"), {
              type: 'bar',
              data: {labels: teamLabels, datasets: [{label: 'Funcionários', data: teamValues, backgroundColor: teamColors, borderRadius: 8, borderSkipped: false}]},
              options: {responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}},
              scales: {x: {grid: {display: false}, ticks: {font: {family: 'Plus Jakarta Sans', weight: '600', size: 11}}},
                       y: {grid: { color: 'rgba(0,0,0,0.05)' }, ticks: {stepSize: 1, font: {family: 'Plus Jakarta Sans', size: 11}}}}}});
          const vacByMonth = Array(12).fill(0);
          vacations
            .filter(v => String(v.year || "") === yearStr)
            .forEach(v => {
            const mesIdx = parseInt(v.month) - 1;
            if (mesIdx >= 0 && mesIdx < 12) {
              vacByMonth[mesIdx]++;
            }
          });
          _dashChartVac = new Chart(
            document.getElementById("chart-vacations"), {
              type: 'line',
              data: {labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'], 
              datasets: [{label: 'Dias de Férias', data: vacByMonth, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true,
                          pointBackgroundColor: '#10b981', pointRadius: 5, pointHoverRadius: 7}]},
              options: {responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}},
              scales: {x: {grid: {display: false}, ticks: {font: {family: 'Plus Jakarta Sans', weight: '600', size: 11}}},
                       y: {grid: {color: 'rgba(0,0,0,0.05)'}, ticks: {stepSize: 1, font: {family: 'Plus Jakarta Sans', size: 11}}}}}});}
      } catch (error) {
        console.error("❌ Erro dashboard:", error);
      }
    }
    document.querySelectorAll(".sidebar-sub-submenu-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const access = btn.dataset.access;
        if (access === "dashboard-RH") {
          createRHDashboard();
        }
      });
    });
