    import ExcelJS from "exceljs";
    import fetch from "node-fetch";
    import fs from "fs";
    import os from "os";
    import path from "path";
    import AdmZip from "adm-zip";
    import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult, SDKError,
            ServiceUsageError, ServiceApiError,} from "@adobe/pdfservices-node-sdk";
    export const config = {
      api: { bodyParser: {sizeLimit: "10mb"}},
    };
    const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
    const TEMPLATES = {
      escalas: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx",
      folha_ponto: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx",
      formulário_férias: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employee_vacations_mark_template.xlsx",
      mapa_ferias: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/vacation_map_template.xlsx",
      prioridade_ferias: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/priority_vacation_template.xlsx",
      mapa_salarial: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx",
    };
    // ─── Helpers API 01 ──────────────────────────────────────────────────────────
    const HOLIDAY_COLOR = "F7C6C7";
    const HOLIDAY_OPTIONAL_COLOR = "D6ECFF";
    const WEEKEND_COLOR = "F9E0B0";
    const DRIVER_BG = "FF69B4";
    const FE_BG = "00B0F0";
    function breakStyle(cell) {
      cell.style = {...(cell.style || {})};
      if (cell.style.fill) cell.style.fill = {...cell.style.fill};
      if (cell.style.font) cell.style.font = {...cell.style.font};
      if (cell.style.alignment) cell.style.alignment = {...cell.style.alignment};
      if (cell.style.border) cell.style.border = {...cell.style.border};
    }
    function normalizeHex6(hex) {
      return String(hex || "FFFFFF").replace("#", "").toUpperCase().padStart(6, "0").slice(0, 6);
    }
    function setFill(cell, hex6) {
      breakStyle(cell);
      const h = normalizeHex6(hex6);
      cell.fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FF" + h}};
    }
    function isDarkHex(hex6) {
      const h = normalizeHex6(hex6);
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luminance < 150;
    }
    function setFontKeepTemplate(cell, {bold = null, italic = false, bgHex = "FFFFFF", forceTextColor = null} = {}) {
      breakStyle(cell);
      const base = cell.font || {};
      const bg = normalizeHex6(bgHex);
      let colorArgb;
      if (bg === normalizeHex6(DRIVER_BG) || bg === normalizeHex6(FE_BG)) {
        colorArgb = "FF000000";
      } else if (forceTextColor) {
        colorArgb = forceTextColor.toUpperCase().startsWith("FF") ? forceTextColor : "FF" + forceTextColor;
      } else {
        const dark = isDarkHex(bg);
        colorArgb = dark ? "FFFFFFFF" : "FF000000";
      }
      cell.font = {
        ...base,
        ...(bold === null ? {} : {bold: !!bold}),
        italic: !!italic,
        color: {argb: colorArgb},
      };
    }
    function setBorder(cell) {
      breakStyle(cell);
      const c = {argb: "FFD1D1D1"};
      cell.border = {
        top: {style: "thin", color: c},
        left: {style: "thin", color: c},
        bottom: {style: "thin", color: c},
        right: {style: "thin", color: c},
      };
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
    function getPortugalHolidays(y) {
      const fixed = [{month: 1, day: 1, name: "Ano Novo"}, {month: 4, day: 25, name: "Dia da Liberdade"}, {month: 5, day: 1, name: "Dia do Trabalhador"},
                     {month: 6, day: 10, name: "Dia de Portugal"}, {month: 8, day: 15, name: "Assunção de Nossa Senhora"}, {month: 9, day: 7, name: "Dia da Cidade de Faro"},
                     {month: 10, day: 5, name: "Implantação da República"}, {month: 11, day: 1, name: "Todos os Santos"}, {month: 12, day: 1, name: "Restauração da Independência"},
                     {month: 12, day: 8, name: "Imaculada Conceição"}, {month: 12, day: 25, name: "Natal"},];
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
      const emonth = Math.floor((h + l - 7 * m + 114) / 31);
      const eday = ((h + l - 7 * m + 114) % 31) + 1;
      const easter = atNoonLocal(y, emonth - 1, eday);
      const mobile = [{date: addDays(easter, -47), name: "Carnaval", optional: true}, {date: addDays(easter, -2), name: "Sexta-feira Santa", optional: false},
                      {date: easter, name: "Páscoa", optional: false}, {date: addDays(easter, 60), name: "Corpo de Deus", optional: false},];
      const fixedDates = fixed.map((x) => ({
        date: atNoonLocal(y, x.month - 1, x.day),
        name: x.name,
        optional: false,
      }));
      return [...fixedDates, ...mobile];
    }
    function getHolidayMapForMonth(y, mo) {
      const holidays = getPortugalHolidays(y);
      const map = new Map();
      holidays.forEach((h) => {
        const dt = h.date;
        if (dt.getFullYear() === y && dt.getMonth() === mo - 1) {
          map.set(dt.getDate(), {name: h.name, optional: !!h.optional});
        }
      });
      return map;
    }
    // ─── Helpers API 02 ──────────────────────────────────────────────────────────
    function escapeXml(str) {
      if (!str || str === "-") return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/\n/g, "&#10;");
    }
    function makeCellXml(ref, styleIndex, value) {
      const escaped = escapeXml(value);
      return `<c r="${ref}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${escaped}</t></is></c>`;
    }
    function makeRowXml(rowNum, emp) {
      const isFirst = rowNum === 9;
      const styles = isFirst
      ? {B: 7,  C: 12, D: 12, E: 12, F: 12, G: 12, H: 12, I: 13}
      : {B: 8,  C: 14, D: 14, E: 14, F: 14, G: 14, H: 14, I: 15};
      const cols = ["B", "C", "D", "E", "F", "G", "H", "I"];
      const values = {B: emp.name, C: emp.subShift, D: emp.casualties, E: emp.vacations, F: emp.parental, G: emp.disgust, H: emp.justified, I: emp.unjustified};
      const cells = cols.map(col => makeCellXml(`${col}${rowNum}`, styles[col], values[col] || "-")).join("");
      return `<row r="${rowNum}" spans="2:9" ht="15" x14ac:dyDescent="0.25">${cells}</row>`;
    }
    export default async function handler(req, res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.status(200).end();
      if (req.method !== "POST") return res.status(405).json({error: "Método não permitido"});
      try {
        const {mode} = req.body;
        if (!mode || !["escalas", "folha_ponto", "formulário_férias", "mapa_ferias", "prioridade_ferias", "mapa_salarial"].includes(mode)) {
          return res.status(400).json({error: "Modo inválido."});
        }
        if (mode === "escalas") return await handleEscalas(req, res);
        if (mode === "folha_ponto") return await handleFolhaPonto(req, res);
        if (mode === "formulário_férias") return await handleVacation(req, res);
        if (mode === "mapa_ferias") return await handleMapaFerias(req, res);
        if (mode === "prioridade_ferias") return await handlePriority(req, res);
        if (mode === "mapa_salarial") return await handleMapaSalarial(req, res);
      } catch (error) {
        if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
          return res.status(500).json({error: "Erro no serviço Adobe", details: error.message});
        }
        return res.status(500).json({error: "Erro ao processar", details: error?.message || String(error)});
      }
    }
    async function handleEscalas(req, res) {
      let inputFilePath = null;
      let outputFilePath = null;
      try {
        const {year, month, employees, workingHours, format = "xlsx"} = req.body;
        if (!year || !month || !employees || workingHours === undefined) {
          return res.status(400).json({error: "Dados incompletos"});
        }
        if (format === "pdf" && (!CLIENT_ID || !CLIENT_SECRET)) {
          return res.status(500).json({error: "Chaves Adobe não configuradas"});
        }
        const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
        const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
        const templateResponse = await fetch(TEMPLATES.escalas);
        if (!templateResponse.ok) throw new Error("Erro ao carregar template");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        if (workbook.worksheets.length === 0) throw new Error("Template sem worksheets");
        const worksheet = workbook.worksheets[0];
        function detectDayStartCol(ws) {
          const r = 11;
          for (let c = 1; c <= 150; c++) {
            const v = ws.getCell(r, c).value;
            if (v === 1 || v === "1") return c;
          }
          return 7;
        }
        const DAY_START_COL = detectDayStartCol(worksheet);
        worksheet.getCell("B7").value = `${MONTH_NAMES[month - 1]} ${year}`;
        worksheet.getCell("B65").value = `${workingHours} Horas`;
        const daysInMonth = new Date(year, month, 0).getDate();
        const holidayMap = getHolidayMapForMonth(year, month);
        for (let d = 1; d <= 31; d++) {
          const colIndex = DAY_START_COL + (d - 1);
          const cellWeek = worksheet.getCell(10, colIndex);
          const cellDay = worksheet.getCell(11, colIndex);
          breakStyle(cellWeek);
          breakStyle(cellDay);
          if (d <= daysInMonth) {
            const date = new Date(year, month - 1, d, 12, 0, 0);
            const weekdayIndex = date.getDay();
            const weekday = WEEKDAY_NAMES[weekdayIndex];
            cellWeek.value = weekday;
            cellDay.value = d;
            const holiday = holidayMap.get(d);
            let headerBg = null;
            if (holiday) headerBg = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
            else if (weekdayIndex === 0 || weekdayIndex === 6) headerBg = WEEKEND_COLOR;
            if (headerBg) {
              setFill(cellWeek, headerBg);
              setFill(cellDay, headerBg);
              setFontKeepTemplate(cellWeek, {bold: true, italic: false, bgHex: headerBg});
              setFontKeepTemplate(cellDay, {bold: true, italic: false, bgHex: headerBg});
            } else {
              setFontKeepTemplate(cellWeek, {bold: true, italic: false, bgHex: "FFFFFF"});
              setFontKeepTemplate(cellDay, {bold: true, italic: false, bgHex: "FFFFFF"});
            }
            setBorder(cellWeek);
            setBorder(cellDay);
          } else {
            cellWeek.value = "";
            cellDay.value = "";
            setFontKeepTemplate(cellWeek, {bold: true, italic: false, bgHex: "FFFFFF"});
            setFontKeepTemplate(cellDay, {bold: true, italic: false, bgHex: "FFFFFF"});
            setBorder(cellWeek);
            setBorder(cellDay);
          }
        }
        for (let d = 1; d <= 31; d++) {
          const colIndex = DAY_START_COL + (d - 1);
          const col = worksheet.getColumn(colIndex);
          col.hidden = d > daysInMonth;
        }
        const GROUP_RANGES = {
          INEM: {start: 13, end: 32},
          TDNU: {start: 34, end: 39},
          OPC: {start: 41, end: 45},
          EP1: {start: 47, end: 51},
          EP2: {start: 53, end: 57},
        };
        function normalizeTeam(t) {
          return String(t || "").trim().toUpperCase().replace(/\s+/g, "").replace(/[-_]/g, "");
        }
        function getGroupKey(teamRaw) {
          const t = normalizeTeam(teamRaw);
          if (t.startsWith("EQ")) return "INEM";
          if (t.startsWith("TDNU")) return "TDNU";
          if (t.startsWith("OPC")) return "OPC";
          if (t.startsWith("EP1") || t.startsWith("EP01") || t.startsWith("EIP1") || t.startsWith("EIP01")) return "EP1";
          if (t.startsWith("EP2") || t.startsWith("EP02") || t.startsWith("EIP2") || t.startsWith("EIP02")) return "EP2";
          return null;
        }
        function isValidEmployee(emp) {
          const n = String(emp?.n_int ?? "").trim();
          const team = String(emp?.team ?? "").trim();
          return /^\d+$/.test(n) && team.length > 0;
        }
        const byGroup = {INEM: [], TDNU: [], OPC: [], EP1: [], EP2: []};
        (employees || []).filter(isValidEmployee).forEach((emp) => {
          const key = getGroupKey(emp.team);
          if (key) byGroup[key].push(emp);
        });
        function fillEmployeeAtRow(emp, excelRow) {
          worksheet.getRow(excelRow).hidden = false;
          const infoCols = [2, 3, 4, 5, 38];
          infoCols.forEach((col) => {
            const cell = worksheet.getCell(excelRow, col);
            breakStyle(cell);
            cell.value = col === 2 ? emp.n_int : col === 3 ? emp.abv_name : col === 4 ? emp.function : col === 5 ? emp.team : emp.total;
            setFill(cell, "FFFFFF");
            setFontKeepTemplate(cell, {bold: null, italic: false, bgHex: "FFFFFF"});
            setBorder(cell);
          });
          for (let d = 0; d < daysInMonth; d++) {
            const colIndex = DAY_START_COL + d;
            const cell = worksheet.getCell(excelRow, colIndex);
            breakStyle(cell);
            const turno = (emp.shifts?.[d] || "").toString();
            cell.value = turno;
            cell.alignment = {horizontal: "center", vertical: "middle"};
            const bg = normalizeHex6(emp.cellColors?.[d] || "FFFFFF");
            setFill(cell, bg);
            setBorder(cell);
            setFontKeepTemplate(cell, {bold: true, italic: false, bgHex: bg});
          }
          infoCols.forEach((col) => setFill(worksheet.getCell(excelRow, col), "FFFFFF"));
        }
        function clearAndHideRow(excelRow) {
          const row = worksheet.getRow(excelRow);
          for (let col = 2; col <= 38; col++) {
            const cell = row.getCell(col);
            breakStyle(cell);
            cell.value = "";
            setFill(cell, "FFFFFF");
            setFontKeepTemplate(cell, {bold: null, italic: false, bgHex: "FFFFFF"});
            setBorder(cell);
          }
          row.hidden = true;
        }
        const ORDER = ["INEM", "TDNU", "OPC", "EP1", "EP2"];
        ORDER.forEach((key) => {
          const range = GROUP_RANGES[key];
          const list = byGroup[key] || [];
          const capacity = range.end - range.start + 1;
          const n = Math.min(list.length, capacity);
          for (let i = 0; i < n; i++) fillEmployeeAtRow(list[i], range.start + i);
          for (let i = n; i < capacity; i++) clearAndHideRow(range.start + i);
        });     
        worksheet.pageSetup = {orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                               margins: {left: 0.25, right: 0.25, top: 0.75, bottom: 0.25, header: 0, footer: 0}};
        if (format !== "pdf") {
          const buffer = await workbook.xlsx.writeBuffer();
          res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          res.setHeader("Content-Disposition", `attachment; filename="Escala_Profissionais_${MONTH_NAMES[month - 1]}_${year}.xlsx"`);
          return res.status(200).send(Buffer.from(buffer));
        }
        const tempDir = os.tmpdir();
        inputFilePath = path.join(tempDir, `Escala_${month}_${year}_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `Escala_${month}_${year}_${Date.now()}.pdf`);
        await workbook.xlsx.writeFile(inputFilePath);
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const pdfServicesResponse = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({asset: resultAsset});
        const writeStream = fs.createWriteStream(outputFilePath);
        streamAsset.readStream.pipe(writeStream);
        await new Promise((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });
        const pdfBuffer = fs.readFileSync(outputFilePath);
        try {
          if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
          if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        } catch {}
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Escala_Profissionais_${MONTH_NAMES[month - 1]}_${year}.pdf"`);
        return res.status(200).send(pdfBuffer);
      } catch (error) {
        try {
          if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
          if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        } catch {}
        throw error;
      }
    }
    async function handleFolhaPonto(req, res) {
      try {
        const {year, month, employee, workingHours} = req.body;
        if (!year || !month || !employee || workingHours === undefined) {
          return res.status(400).json({error: "Dados incompletos"});
        }
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const templateResponse = await fetch(TEMPLATES.folha_ponto);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];
        const WEEKDAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
        const daysInMonth = new Date(year, month, 0).getDate();
        const holidays = getHolidayMapForMonth(year, month);
        worksheet.getCell("D8").value = employee.abv_name || "";
        worksheet.getCell("J8").value = employee.function || "";
        worksheet.getCell("L46").value = workingHours;
        worksheet.getCell("L44").value = employee.total || 0;
        for (let d = 1; d <= 31; d++) {
          const row = 11 + d;
          const cellDia = worksheet.getCell(row, 2);
          const cellSemana = worksheet.getCell(row, 3);
          const cellTurno = worksheet.getCell(row, 4);
          breakStyle(cellDia);
          breakStyle(cellSemana);
          breakStyle(cellTurno);
          if (d <= daysInMonth) {
            const date = new Date(year, month - 1, d, 12, 0, 0);
            const wDay = date.getDay();
            const isWeekend = (wDay === 0 || wDay === 6);
            const holiday = holidays.get(d);
            cellDia.value = d;
            cellSemana.value = WEEKDAY_NAMES[wDay];
            cellTurno.value = employee.shifts?.[d - 1] || "";
            let dateBg = null;
            if (holiday) {
              dateBg = holiday.optional ? HOLIDAY_OPTIONAL_COLOR : HOLIDAY_COLOR;
            } else if (isWeekend) {
              dateBg = WEEKEND_COLOR;
            }
            if (dateBg) {
              setFill(cellDia, dateBg);
              setFill(cellSemana, dateBg);
              setFontKeepTemplate(cellDia, {bold: true, italic: false, bgHex: dateBg});
              setFontKeepTemplate(cellSemana, {bold: true, italic: false, bgHex: dateBg});
            }
            const bgHex = normalizeHex6(employee.cellColors?.[d - 1] || "FFFFFF");
            setFill(cellTurno, bgHex);
            setFontKeepTemplate(cellTurno, {bold: true, italic: false, bgHex: bgHex});
            [cellDia, cellSemana, cellTurno].forEach(c => {
              c.alignment = {horizontal: "center", vertical: "middle"};
            });
          } else {
            worksheet.getRow(row).hidden = true;
          }
        }
        const tempDir = os.tmpdir();
        const xlsxPath = path.join(tempDir, `f_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(xlsxPath);
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(xlsxPath), mimeType: MimeType.XLSX});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const result = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const streamAsset = await pdfServices.getContent({asset: result.result.asset});
        const chunks = [];
        for await (let chunk of streamAsset.readStream) {chunks.push(chunk);}
        fs.unlinkSync(xlsxPath);
        res.setHeader("Content-Type", "application/pdf");
        return res.status(200).send(Buffer.concat(chunks));
      } catch (error) {
        throw error;
      }
    }
    async function handleVacation(req, res) {
      let inputFilePath = null;
      try {
        const {employeeName, nInt, periods} = req.body;
        if (!employeeName || !nInt || !periods) {
          return res.status(400).json({error: "Dados incompletos para férias"});
        }
        const templateResponse = await fetch(TEMPLATES["formulário_férias"]);
        if (!templateResponse.ok) throw new Error("Erro ao carregar template de férias");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];
        function padNumber(num, length) {
          return String(num).padStart(length, "0");
        }
        worksheet.getCell("F7").value = String(employeeName);
        worksheet.getCell("Q7").value = padNumber(nInt, 3);
        periods.forEach((p, i) => {
          if (i > 2) return;
          const row = 11 + (i * 2);
          if (p.start && typeof p.start === "object") {
            worksheet.getCell(`C${row}`).value = padNumber(p.start.day, 2);
            worksheet.getCell(`E${row}`).value = padNumber(p.start.month, 2);
            worksheet.getCell(`G${row}`).value = p.start.year;
          }
          if (p.end && typeof p.end === "object") {
            worksheet.getCell(`I${row}`).value = padNumber(p.end.day, 2);
            worksheet.getCell(`K${row}`).value = padNumber(p.end.month, 2);
            worksheet.getCell(`M${row}`).value = p.end.year;
          }
          worksheet.getCell(`Q${row}`).value = padNumber(Number(p.days) || 0, 2);
        });
        worksheet.pageSetup = {orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1};
        const tempDir = os.tmpdir();
        inputFilePath = path.join(tempDir, `vac_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(inputFilePath);
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const result = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const streamAsset = await pdfServices.getContent({asset: result.result.asset});
        const chunks = [];
        for await (let chunk of streamAsset.readStream) {chunks.push(chunk);}
        if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        res.setHeader("Content-Type", "application/pdf");
        return res.status(200).send(Buffer.concat(chunks));
      } catch (error) {
        if (inputFilePath && fs.existsSync(inputFilePath)) try {fs.unlinkSync(inputFilePath);} catch(e) {}
        console.error("Erro Vacation:", error);
        return res.status(500).json({error: error.message});
      }
    }
    async function handleMapaFerias(req, res) {
      let inputPath = null;
      try {
        const { year, employees } = req.body;
        const templateResponse = await fetch(TEMPLATES.mapa_ferias);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];
        worksheet.getCell("B6").value = `MAPA DE FÉRIAS - ${year}`;
        const ROW_START = 10, ROW_END = 49;
        employees.forEach((emp, index) => {
          const row = ROW_START + index;
          if (row <= ROW_END) {
            worksheet.getCell(row, 2).value = emp.name;
            worksheet.getCell(row, 15).value = emp.totalDays;
            const periods = emp.periods.map(p => {
              const sP = p.s.split('-');
              const eP = p.e.split('-');
              return {sD: parseInt(sP[2]), sM: parseInt(sP[1]), eD: parseInt(eP[2]), eM: parseInt(eP[1])};
            });
            const processedMonths = new Set();
            for (let m = 1; m <= 12; m++) {
              if (processedMonths.has(m)) continue;
              let startPeriods = periods.filter(p => p.sM === m);
              if (startPeriods.length > 0) {
                let maxEM = Math.max(...startPeriods.map(p => p.eM));
                let allInBlock = periods.filter(p => p.sM >= m && p.sM <= maxEM);
                maxEM = Math.max(maxEM, ...allInBlock.map(p => p.eM));
                allInBlock = periods.filter(p => p.sM >= m && p.sM <= maxEM);
                let span = (maxEM - m) + 1;
                const sCol = 2 + m;
                let txt = allInBlock
                .sort((a, b) => (a.sM * 100 + a.sD) - (b.sM * 100 + b.sD))
                .map(x => {
                  const dS = x.sD.toString().padStart(2, '0');
                  const dE = x.eD.toString().padStart(2, '0');
                  return (x.sM === x.eM && x.sD === x.eD) ? dS : `${dS} a ${dE}`;
                }).join(' e ');
                if (span > 1) {
                  try {worksheet.mergeCells(row, sCol, row, sCol + (span - 1));} catch (e) {}
                }
                const cell = worksheet.getCell(row, sCol);
                cell.value = txt;
                cell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true};
                for (let i = 0; i < span; i++) processedMonths.add(m + i);
              }
            }
          }
        });
        for (let i = ROW_START; i <= ROW_END; i++) {
          if (!worksheet.getCell(i, 2).value) worksheet.getRow(i).hidden = true;
        }
        worksheet.pageSetup = {orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                               margins: {left: 0.25, right: 0.25, top: 0.75, bottom: 0.25, header: 0, footer: 0}};
        const tempDir = os.tmpdir();
        inputPath = path.join(tempDir, `mapa_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(inputPath);
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputPath), mimeType: MimeType.XLSX});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const result = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const streamAsset = await pdfServices.getContent({asset: result.result.asset});
        const chunks = [];
        for await (let chunk of streamAsset.readStream) chunks.push(chunk);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.setHeader("Content-Type", "application/pdf");
        return res.status(200).send(Buffer.concat(chunks));
      } catch (err) {
        if (inputPath && fs.existsSync(inputPath)) try {fs.unlinkSync(inputPath);} catch(e) {}
        console.error(err);
        res.status(500).json({error: err.message});
      }
    }
    async function handlePriority(req, res) {
      let inputPath = null;
      try {
        const {priorityYear, employees} = req.body;
        if (!priorityYear || !Array.isArray(employees)) {
          return res.status(400).json({error: "Dados inválidos para prioridade"});
        }
        if (!CLIENT_ID || !CLIENT_SECRET) {
          return res.status(500).json({error: "Chaves Adobe não configuradas"});
        }
        const ROW_START = 10, ROW_END = 43;
        const MAX_ROWS = ROW_END - ROW_START + 1;
        const safeEmployees = employees.slice(0, MAX_ROWS);
        const templateResponse = await fetch(TEMPLATES.prioridade_ferias);
        if (!templateResponse.ok) throw new Error("Erro ao carregar template de prioridade");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];
        worksheet.getCell("C3").value = `MAPA DE PRIORIDADE DE MARCAÇÃO DE FÉRIAS - ${priorityYear}`;
        safeEmployees.forEach((emp, index) => {
          const rowNumber = ROW_START + index;
          worksheet.getCell(`B${rowNumber}`).value = emp.name || "";
          const scores = Array.isArray(emp.scores) ? emp.scores.slice(0, 24) : [];
          for (let i = 0; i < 24; i++) {
            const colIndex = 3 + i;
            const value = Number(scores[i]) || 0;
            const cell = worksheet.getCell(rowNumber, colIndex);
            cell.value = value > 0 ? value : "-";
            if (value > 0) cell.font = {bold: true};
          }
          worksheet.getCell(rowNumber, 27).value = Number(emp.totalScore) || 0;
        });
        for (let i = ROW_START; i <= ROW_END; i++) {
          const nameCell = worksheet.getCell(`B${i}`).value;
          if (!nameCell || nameCell.toString().trim() === "") worksheet.getRow(i).hidden = true;
        }
        worksheet.pageSetup = {orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                               margins: {left: 0.25, right: 0.25, top: 0.75, bottom: 0.25, header: 0, footer: 0}};
        const tempDir = os.tmpdir();
        inputPath = path.join(tempDir, `prioridades_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(inputPath);
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputPath), mimeType: MimeType.XLSX});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const result = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const streamAsset = await pdfServices.getContent({asset: result.result.asset});
        const chunks = [];
        for await (let chunk of streamAsset.readStream) chunks.push(chunk);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Prioridades_${priorityYear}.pdf`);
        return res.status(200).send(Buffer.concat(chunks));
      } catch (err) {
        if (inputPath && fs.existsSync(inputPath)) try {fs.unlinkSync(inputPath);} catch {}
        console.error("Erro API Prioridades:", err);
        return res.status(500).json({error: err.message});
      }
    }
    async function handleMapaSalarial(req, res) {
  const { year, month, employees } = req.body;
  let inputPath = null;
  try {
    const templateRes = await fetch(TEMPLATES.mapa_salarial);
    const arrayBuffer = await templateRes.arrayBuffer();
    const zip = new AdmZip(Buffer.from(arrayBuffer));
    let newSheetXml = zip.readAsText("xl/worksheets/sheet1.xml");

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const titulo = `MAPA SALARIAL - ${meses[month - 1].toUpperCase()} ${year}`;

    // 1. Corrigir o Título (Célula A1)
    newSheetXml = newSheetXml.replace(/<c r="A1" t="s"><v>.*?<\/v><\/c>/, `<c r="A1" t="t"><v>${escapeXml(titulo)}</v></c>`);

    // 2. Gerar as linhas dos funcionários (Herdando o estilo fino do template)
    const sheetDataMatch = newSheetXml.match(/<sheetData>(.*?)<\/sheetData>/s);
    const headerRow = sheetDataMatch[1].match(/<row r="2".*?<\/row>/s)[0];
    let newRowsXml = headerRow;

    employees.forEach((emp, index) => {
      const rowIndex = index + 3;
      // Removido ht="25" e customHeight para não esmagar a linha
      newRowsXml += `<row r="${rowIndex}">
        <c r="A${rowIndex}" t="t"><v>${escapeXml(emp.name)}</v></c>
        <c r="B${rowIndex}" t="t"><v>${escapeXml(emp.subShift)}</v></c>
        <c r="C${rowIndex}" t="t"><v>${escapeXml(emp.casualties)}</v></c>
        <c r="D${rowIndex}" t="t"><v>${escapeXml(emp.vacations)}</v></c>
        <c r="E${rowIndex}" t="t"><v>${escapeXml(emp.parental)}</v></c>
        <c r="F${rowIndex}" t="t"><v>${escapeXml(emp.disgust)}</v></c>
        <c r="G${rowIndex}" t="t"><v>${escapeXml(emp.justified)}</v></c>
        <c r="H${rowIndex}" t="t"><v>${escapeXml(emp.unjustified)}</v></c>
      </row>`;
    });

    newSheetXml = newSheetXml.replace(/<sheetData>.*?<\/sheetData>/s, `<sheetData>${newRowsXml}</sheetData>`);

    // 3. Unir Células do Título (Acaba com as margens internas em A1:H1)
    if (newSheetXml.includes("</sheetData>")) {
      newSheetXml = newSheetXml.replace(/<mergeCells.*?>.*?<\/mergeCells>/s, ""); // Limpa merges antigos
      newSheetXml = newSheetXml.replace("</sheetData>", `</sheetData><mergeCells count="1"><mergeCell ref="A1:H1"/></mergeCells>`);
    }

    // 4. Uniformizar Margens (Topo 0.75, Laterais 0.25)
    newSheetXml = newSheetXml.replace(/<pageMargins[^\/]*\/>/, `<pageMargins left="0.25" right="0.25" top="0.75" bottom="0.25" header="0" footer="0"/>`);

    // 5. Ajustar para caber na largura (Fit to Page)
    newSheetXml = newSheetXml.replace(/<sheetPr>.*?<\/sheetPr>/, `<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>`);
    newSheetXml = newSheetXml.replace(/<pageSetup[^\/]*\/>/, `<pageSetup paperSize="9" orientation="landscape" r:id="rId1"/>`);

    zip.updateFile("xl/worksheets/sheet1.xml", Buffer.from(newSheetXml, "utf8"));
    const modifiedBuffer = zip.toBuffer();
    
    const tempDir = os.tmpdir();
    inputPath = path.join(tempDir, `salary_${Date.now()}.xlsx`);
    fs.writeFileSync(inputPath, modifiedBuffer);

    // Envio para Adobe
    const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
    const pdfServices = new PDFServices({credentials});
    const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputPath), mimeType: MimeType.XLSX});
    const job = new CreatePDFJob({inputAsset});
    const pollingURL = await pdfServices.submit({job});
    const result = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
    const streamAsset = await pdfServices.getContent({asset: result.result.asset});

    const chunks = [];
    for await (let chunk of streamAsset.readStream) chunks.push(chunk);

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Mapa_Salarial_${meses[month-1]}_${year}.pdf`);
    return res.status(200).send(Buffer.concat(chunks));

  } catch (error) {
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    console.error("Erro handleMapaSalarial:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Função auxiliar essencial para não quebrar o XML
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
