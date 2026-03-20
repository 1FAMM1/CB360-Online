    import ExcelJS from 'exceljs';
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    import https from 'https';
    import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFResult, CreatePDFJob,}
    from "@adobe/pdfservices-node-sdk";
    const TEMPLATE_PAG_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/decir_pag_template.xlsx";
    const TEMPLATE_REG_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/decir_reg_template.xlsx";
    const TEMPLATE_CODE_A33_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/cod_a33_template.xlsx";
    const TEMPLATE_ANEPC_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/anepc_template.xlsx";
    const TEMPLATE_OCORR_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/reg_ocorr_decir.xlsx";
    const TEMPLATE_REF_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/reg_ref_decir.xlsx";
    const TEMPLATE_SIGNA_ECIN_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/signa_decir_ecin_template.xlsx";
    const TEMPLATE_SIGNA_ECINELAC_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/signa_decir_ecinelac_template.xlsx";
    const TEMPLATE_SIGNA_BRIGADE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/signa_decir_brigade_template.xlsx";
    const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
    export const config = {
      api: { bodyParser: {sizeLimit: '10mb'}}
    };
    async function downloadTemplate(url) {
      return new Promise((resolve, reject) => {
        https.get(url, res => {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });
    }
    function monthNameToIndex(ptName) {
      if (!ptName) return null;
      const m = ptName.trim().toLowerCase();
      const map = {'janeiro': 1,'fevereiro': 2,'março': 3,'marco': 3,'abril': 4,'maio': 5,'junho': 6,'julho': 7,'agosto': 8,'setembro': 9,'outubro': 10,'novembro': 11,'dezembro': 12};
      return map[m] || null;
    }
    function formatDate(dateStr) {
      if (!dateStr) return "";
      const [y, m, d] = dateStr.split("-");
      return `${d} / ${m} / ${y}`;
    }
    async function convertXLSXToPDF(xlsxBuffer, fileName) {
      if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("Chaves Adobe não configuradas.");
      const inputFilePath = `/tmp/${fileName}_input_${Date.now()}.xlsx`;
      fs.writeFileSync(inputFilePath, xlsxBuffer);
      try {
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX,});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const pdfServicesResponse = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({asset: resultAsset});
        const chunks = [];
        await new Promise((resolve, reject) => {
          streamAsset.readStream.on("data", chunk => chunks.push(chunk));
          streamAsset.readStream.on("end", resolve);
          streamAsset.readStream.on("error", reject);
        });
        return Buffer.concat(chunks);
      } catch (error) {
        console.error("Erro Adobe:", error);
        throw new Error("Falha na conversão XLSX para PDF.");
      } finally {
        try {if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);} catch {}
      }
    }
    export default async function handler(req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') return res.status(200).end();
      if (req.method !== 'POST') return res.status(405).json({error: 'Método não permitido'});
      const tempDir = os.tmpdir();
      let outputFile = null;
      try {
        const data = req.body;
        if (!data || !data.type) return res.status(400).json({error: "Tipo não especificado"});
        const format = data.format || "xlsx";
        const workbook = new ExcelJS.Workbook();
        let sheet;
        // ---------- DAILY REGISTER ----------
        if (data.type === 'reg') {
          const requiredFields = ['monthName','year','daysInMonth','weekdays','fixedRows','normalRows'];
          if (!requiredFields.every(f => f in data)) return res.status(400).json({error: "Dados incompletos para registo diário"});
          const templateBuffer = await downloadTemplate(TEMPLATE_REG_URL);
          await workbook.xlsx.load(templateBuffer);
          sheet = workbook.worksheets[0];
          sheet.getCell("B7").value = `Registo Diário de Elementos - ${data.monthName} ${data.year}`;
          const rowWeekdays = sheet.getRow(9);
          const rowNumbers = sheet.getRow(10);
          for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1);
            rowWeekdays.getCell(col).value = data.weekdays[d - 1] || '';
            rowNumbers.getCell(col).value = d;
          }
          rowWeekdays.commit();
          rowNumbers.commit();
          if (Array.isArray(data.holidayDays)) {
            const rowHolidays = sheet.getRow(8);
            data.holidayDays.forEach(day => {rowHolidays.getCell(6 + (day - 1)).value = 'FR';});
            rowHolidays.commit();
          }
          const allPersons = {};
          (data.fixedRows || []).forEach(p => allPersons[p.ni] = {...p, days: p.days});
          (data.normalRows || []).forEach(p => {
            if (!allPersons[p.ni]) allPersons[p.ni] = { ...p, days: {} };
            Object.keys(p.days).forEach(d => {
              if (!allPersons[p.ni].days[d]) allPersons[p.ni].days[d] = {};
              allPersons[p.ni].days[d].N = p.days[d].N || '';
            });
          });
          let currentRow = 11;
          Object.values(allPersons).forEach(person => {
            const rowD = sheet.getRow(currentRow);
            rowD.getCell(2).value = String(person.ni).padStart(3,"0");
            rowD.getCell(3).value = person.nome;
            for (let d = 1; d <= data.daysInMonth; d++) rowD.getCell(6 + (d - 1)).value = person.days[d]?.D || '';
            rowD.getCell(38).value = person.amal || '';
            rowD.getCell(39).value = person.anepc || '';
            rowD.getCell(40).value = person.global || '';
            rowD.commit();
            const rowN = sheet.getRow(currentRow + 1);
            rowN.getCell(3).value = person.nome;
            for (let d = 1; d <= data.daysInMonth; d++) rowN.getCell(6 + (d - 1)).value = person.days[d]?.N || '';
            rowN.commit();
            currentRow += 2;
          });
          for (let r = 11; r <= 214; r++) {
            const cellAL = sheet.getRow(r).getCell(38);
            const cellAM = sheet.getRow(r).getCell(39);
            const cellAN = sheet.getRow(r).getCell(40);
            if (!cellAL.value || !cellAM.value || !cellAN.value || Number(cellAL.value)===0 || Number(cellAM.value)===0 || Number(cellAN.value)===0) sheet.getRow(r).hidden = true;
          }
          for (let c = 6; c <= 36; c++) {
            const cell = sheet.getRow(10).getCell(c);
            if (!cell.value || cell.value.toString().trim() === '') sheet.getColumn(c).hidden = true;
          }
          sheet.pageSetup = {orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                             margins: {left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3}};}
        // ---------- PAYMENTS ----------
        else if (data.type === 'pag') {
          if (!Array.isArray(data.rows)) return res.status(400).json({error: "Rows inválidas para pagamentos"});
          const templateBuffer = await downloadTemplate(TEMPLATE_PAG_URL);
          await workbook.xlsx.load(templateBuffer);
          sheet = workbook.worksheets[0];
          sheet.getCell("B7").value = `PAGAMENTOS DECIR - ${data.monthName} ${data.year}`;
          data.rows.forEach((row, idx) => {
            const r = sheet.getRow(10 + idx);
            r.getCell(2).value = String(row.ni).padStart(3,'0');
            r.getCell(3).value = row.nome || '';
            r.getCell(4).value = row.nif || '';
            r.getCell(5).value = row.nib || '';
            r.getCell(6).value = row.qtdTurnos || 0;
            r.getCell(7).value = row.valor || 0;
            r.commit();
          });
          for (let r = 10; r <= 113; r++) {
            const row = sheet.getRow(r);
            const qtd = Number(row.getCell(6).value) || 0;
            const val = Number(row.getCell(7).value) || 0;
            if (qtd === 0 && val === 0) row.hidden = true;
          }
          sheet.pageSetup = {orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                             margins: {left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3}};}
        // ---------- CODE A33 ----------
        else if (data.type === 'code_a33') {
          if (!Array.isArray(data.rows)) return res.status(400).json({error: "Rows inválidas para code_a33"});
          const templateBuffer = await downloadTemplate(TEMPLATE_CODE_A33_URL);
          await workbook.xlsx.load(templateBuffer);
          sheet = workbook.worksheets[0];
          sheet.getCell("B7").value = `Cod.A33 - ${data.year}`;
          sheet.getCell("D3").value = `Pagamentos DECIR_${data.year} Cód.A33`;
          let currentRow = 11;
          for (const person of data.rows) {
            const row = sheet.getRow(currentRow);
            row.getCell("B").value = String(person.ni).padStart(3,'0');
            row.getCell("C").value = person.nome || '';
            row.getCell("G").value = person.nif || '';
            const monthsMap = {ABRIL:"J",MAIO:"L",JUNHO:"N",JULHO:"P",AGOSTO:"R",SETEMBRO:"T",OUTUBRO:"V"};
            Object.entries(monthsMap).forEach(([month, col]) => {row.getCell(col).value = Number(person[month]) || 0;});
            row.commit();
            currentRow++;
          }
          for (let r = 11; r <= 112; r++) {
            const row = sheet.getRow(r);
            const allZero = ["J","L","N","P","R","T","V"].every(col => (Number(row.getCell(col).value) || 0) === 0);
            if (allZero) row.hidden = true;
          }
          sheet.pageSetup = {orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                             margins: {left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3}};}
        // ---------- ANEPC ----------
        else if (data.type === "anepc") {
          const buffer = await downloadTemplate(TEMPLATE_ANEPC_URL);
          await workbook.xlsx.load(buffer);
          sheet = workbook.worksheets[0];
          const year = Number(data.year);
          const mIdx = monthNameToIndex(data.monthName);
          let firstDay = 1, lastDay = new Date(year, mIdx, 0).getDate();
          if (mIdx === 5) firstDay = 15;
          if (mIdx === 10) lastDay = 15;
          const mm = String(mIdx).padStart(2,'0');
          const periodStr = `Período: ${String(firstDay).padStart(2,'0')} / ${mm} / ${year}  a  ${String(lastDay).padStart(2,'0')} / ${mm} / ${year}`;
          sheet.getCell("B7").value = `Dispositivo Especial Combate Incêndios Rurais (DECIR ${year}) ${periodStr}`;
          let row = 10;
          data.rows.forEach(r => {
            const line = sheet.getRow(row);
            line.getCell("B").value = r.niFile;
            line.getCell("C").value = r.funcao;
            line.getCell("D").value = r.nome;
            line.getCell("F").value = r.qtdTurnos;
            line.getCell("H").value = r.valor;
            line.commit();
            row++;
          });
          for (let r = 10; r <= 111; r++) {
            const line = sheet.getRow(r);
            const empty = (!line.getCell("B").value || line.getCell("B").value === "") && (!line.getCell("C").value || line.getCell("C").value === "") && (!line.getCell("D").value || line.getCell("D").value === "");
            const qtd = Number(line.getCell("F").value) || 0;
            const val = Number(line.getCell("H").value) || 0;
            if (empty || (qtd === 0 && val === 0)) line.hidden = true;
          }
          sheet.pageSetup = {orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                             margins: {left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3}};}
        // ---------- OCORRÊNCIAS ----------
        else if (data.type === 'ocorr') {
          if (!Array.isArray(data.rows)) return res.status(400).json({error: "Rows inválidas para ocorrências"});
          const templateBuffer = await downloadTemplate(TEMPLATE_OCORR_URL);
          await workbook.xlsx.load(templateBuffer);
          sheet = workbook.worksheets[0];
          sheet.getCell("B2").value = `REGISTO DE OCORRÊNCIAS DECIR - ${data.year}`;
          const MONTH_COLS = {"Maio" : {occ: "B", date: "C", act: "D"}, "Junho" : {occ: "E", date: "F", act: "G"}, "Julho" : {occ: "H", date: "I", act: "J"},
                              "Agosto" : {occ: "K", date: "L", act: "M"}, "Setembro" : {occ: "N", date: "O", act: "P"}, "Outubro" : {occ: "Q", date: "R", act: "S"}};
          data.rows.forEach(record => {
            const row = sheet.getRow(7 + (record.row_index ?? 0));
            Object.entries(MONTH_COLS).forEach(([month, cols]) => {
              const entry = record[month];
              if (!entry) return;
              if (entry.occurrence) row.getCell(cols.occ).value = entry.occurrence;
              if (entry.date) row.getCell(cols.date).value = entry.date;
              if (entry.acting) row.getCell(cols.act).value = entry.acting;
            });
            row.commit();
          });
          sheet.pageSetup = {orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, verticalCentered: false,
                             margins: {left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3}};}
        // ---------- REFEIÇÕES ----------
        else if (data.type === 'ref') {
          if (!Array.isArray(data.rows)) return res.status(400).json({error: "Rows inválidas para refeições"});
          const templateBuffer = await downloadTemplate(TEMPLATE_REF_URL);
          await workbook.xlsx.load(templateBuffer);
          sheet = workbook.worksheets[0];
          sheet.getCell("B6").value = `Refeições DECIR - ${data.monthName} ${data.year}`;
          data.rows.forEach((row, idx) => {
            const r = sheet.getRow(9 + idx);
            r.getCell("B").value = row.day || "";
            r.getCell("C").value = row.alert_state || "";
            r.getCell("E").value = row.restaurant || "";
            r.getCell("H").value = row.meal_prev || "";
            r.getCell("J").value = row.meal_efet || "";
            r.getCell("L").value = row.meal_devi || "";
            r.getCell("N").value = row.resp_name || "";
            r.commit();
          });
          const totals = {};
          data.rows.forEach(row => {
            const rest = row.restaurant || "";
            if (!rest) return;
            totals[rest] = (totals[rest] || 0) + (parseInt(row.meal_efet) || 0);
          });
          const entries = Object.entries(totals).filter(([k]) => k !== "").sort((a,b) => b[1]-a[1]);
          if (entries.length > 0) {
            const [mostName, mostTotal] = entries[0];
            sheet.getCell("E41").value = `Total de Refeições ${mostName}`;
            sheet.getCell("L41").value = mostTotal;
            sheet.getCell("C53").value = `Responsável ${mostName}`;
            if (entries.length > 1) {
              const [leastName, leastTotal] = entries[entries.length - 1];
              sheet.getCell("E43").value = `Total de Refeições ${leastName}`;
              sheet.getCell("L43").value = leastTotal;
              sheet.getCell("L53").value = `Responsável ${leastName}`;
            }
          }
          sheet.pageSetup = {orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                             margins: {left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3}};}
        // ---------- SIGNA ----------
        else if (data.type === 'signa') {
          const { date1, date2, year, ecin, elac, mode } = data;
          if (!date1 || !date2 || !year) return res.status(400).json({error: "Dados incompletos para signa"});
          const templateUrl = mode === "1_ecin" ? TEMPLATE_SIGNA_ECIN_URL
          : mode === "brigada" ? TEMPLATE_SIGNA_BRIGADE_URL : TEMPLATE_SIGNA_ECINELAC_URL;
          const templateBuffer = await downloadTemplate(templateUrl);
          await workbook.xlsx.load(templateBuffer);
          sheet = workbook.worksheets[0];
          const title = `Dispositivo Especial Combate Incêndios Rurais (DECIR ${year})`;
          const period = `Período: ${formatDate(date1)}  a  ${formatDate(date2)}`;
          const date1Formatted = formatDate(date1);
          const date2Formatted = formatDate(date2);
          const dayShift   = "Turno: 08:00 Horas às 20:00 Horas";
          const nightShift = "Turno: 20:00 Horas às 08:00 Horas";
          const fillTeam = (startRow, members) => {
            if (!Array.isArray(members)) return;
            members.forEach((member, idx) => {
              const row = startRow + idx;
              if (member.n_file)   sheet.getCell(`B${row}`).value = member.n_file;
              if (member.patent)   sheet.getCell(`D${row}`).value = member.patent;
              if (member.abv_name) sheet.getCell(`F${row}`).value = member.abv_name;
            });
          };
          const fillTeamFull = (startRow, members) => {
            if (!Array.isArray(members)) return;
            members.forEach((member, idx) => {
              const row = startRow + idx;
              if (member.n_file) sheet.getCell(`B${row}`).value = member.n_file;
              if (member.patent) sheet.getCell(`D${row}`).value = member.patent;
              const fullName = member.full_name || member.abv_name || "";
              if (fullName) sheet.getCell(`F${row}`).value = fullName;
            });
          };
          if (mode === "1_ecin") {
            [7, 60].forEach(row => sheet.getCell(`B${row}`).value = title);
            [9, 62].forEach(row => sheet.getCell(`B${row}`).value = period);
            [11, 20, 64, 73].forEach(row => sheet.getCell(`B${row}`).value = date1Formatted);
            [29, 38, 82, 91].forEach(row => sheet.getCell(`B${row}`).value = date2Formatted);
            [11, 29, 64, 82].forEach(row => sheet.getCell(`F${row}`).value = dayShift);
            [20, 38, 73, 91].forEach(row => sheet.getCell(`F${row}`).value = nightShift);
            fillTeam(14, ecin?.day1?.day); fillTeam(23, ecin?.day1?.night);
            fillTeam(32, ecin?.day2?.day); fillTeam(41, ecin?.day2?.night);
            fillTeamFull(67, ecin?.day1?.day); fillTeamFull(76, ecin?.day1?.night);
            fillTeamFull(85, ecin?.day2?.day); fillTeamFull(94, ecin?.day2?.night);
          } else if (mode === "brigada") {
            [7, 60, 113, 168].forEach(row => sheet.getCell(`B${row}`).value = title);
            [9, 62, 115, 170].forEach(row => sheet.getCell(`B${row}`).value = period);
            [11, 20, 64, 73, 117, 123, 172, 178].forEach(row => sheet.getCell(`B${row}`).value = date1Formatted);
            [29, 38, 82, 91, 129, 135, 184, 190].forEach(row => sheet.getCell(`B${row}`).value = date2Formatted);
            [11, 29, 64, 82, 117, 129, 172, 184].forEach(row => sheet.getCell(`F${row}`).value = dayShift);
            [20, 38, 73, 91, 123, 135, 178, 190].forEach(row => sheet.getCell(`F${row}`).value = nightShift);
            fillTeam(14, ecin?.day1?.day); fillTeam(23, ecin?.day1?.night);
            fillTeam(32, ecin?.day2?.day); fillTeam(41, ecin?.day2?.night);
          } else {
            [7, 60, 113, 168].forEach(row => sheet.getCell(`B${row}`).value = title);
            [9, 62, 115, 170].forEach(row => sheet.getCell(`B${row}`).value = period);
            [11, 20, 64, 73, 117, 123, 172, 178].forEach(row => sheet.getCell(`B${row}`).value = date1Formatted);
            [29, 38, 82, 91, 129, 135, 184, 190].forEach(row => sheet.getCell(`B${row}`).value = date2Formatted);
            [11, 29, 64, 82, 117, 129, 172, 184].forEach(row => sheet.getCell(`F${row}`).value = dayShift);
            [20, 38, 73, 91, 123, 135, 178, 190].forEach(row => sheet.getCell(`F${row}`).value = nightShift);
            fillTeam(14, ecin?.day1?.day); fillTeam(23, ecin?.day1?.night);
            fillTeam(32, ecin?.day2?.day); fillTeam(41, ecin?.day2?.night);
            fillTeam(120, elac?.day1?.day); fillTeam(126, elac?.day1?.night);
            fillTeam(132, elac?.day2?.day); fillTeam(138, elac?.day2?.night);
            fillTeamFull(67, ecin?.day1?.day); fillTeamFull(76, ecin?.day1?.night);
            fillTeamFull(85, ecin?.day2?.day); fillTeamFull(94, ecin?.day2?.night);
            fillTeamFull(175, elac?.day1?.day); fillTeamFull(181, elac?.day1?.night);
            fillTeamFull(187, elac?.day2?.day); fillTeamFull(193, elac?.day2?.night);
          }
          sheet.pageSetup = {orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                             margins: {left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3}};
        }
        // ---------- SAVE AND DOWNLOAD ----------
        const safeFileName = data.fileName || "decir";
        if (format === "pdf") {
          const xlsxBuffer = await workbook.xlsx.writeBuffer();
          const pdfBuffer = await convertXLSXToPDF(xlsxBuffer, safeFileName);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}.pdf"`);
          return res.status(200).send(pdfBuffer);
        } else {
          outputFile = path.join(tempDir, `${safeFileName}_${Date.now()}.xlsx`);
          await workbook.xlsx.writeFile(outputFile);
          const fileBuffer = fs.readFileSync(outputFile);
          try { fs.unlinkSync(outputFile); } catch {}
          res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}.xlsx"`);
          return res.status(200).send(fileBuffer);
        }
      } catch (e) {
        try { if (outputFile) fs.unlinkSync(outputFile); } catch {}
        return res.status(500).json({error: "Erro interno", details: e.message});
      }
    }
