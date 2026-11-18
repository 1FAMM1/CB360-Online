    /*************************************************************************
    * * 🟦 CB360 ONLINE - API ENGINE
    * 🚀 Desenvolvido por: [Fábio Martins / Sistemas de Informação]
    * 📅 Ano: 2023 - 2026
    * * Descrição: Handler principal para geração de emails
    * com integração ExcelJS, Adobe PDF Services e Mailer.
    * *************************************************************************/
    import ExcelJS from "exceljs";
    import fetch from "node-fetch";
    import fs from "fs";
    import os from "os";
    import path from "path";
    import nodemailer from "nodemailer";
    import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult, ClientConfig, Region} from "@adobe/pdfservices-node-sdk";
    export const maxDuration = 60;   // a conversão Excel→PDF (Adobe) das fichas grandes pode passar dos 10 s
    const ADOBE_CLIENT_CONFIG = new ClientConfig({region: (process.env.ADOBE_REGION || "EU").toUpperCase() === "US" ? Region.US : Region.EU});
    export const config = {api: {bodyParser: {sizeLimit: "10mb"}}};
    const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
    const TEMPLATES = {saloc: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_saloc_template.xlsx",
                       global: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_global_template.xlsx",
                       veiculos: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/hemodialysis_list_veícs_template.xlsx",
                       formacao: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/formation_template.xlsx",
                       fleet_cards: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/fleet_cards_template.xlsx",
                       equipment_request: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/request_equipment_template.xlsx",
                       contact_list: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/contact_list_template.xlsx",
                       attendance_list: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/attendance_list_template.xlsx",
                       nrbq_fni: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/nrbq_fni_template.xlsx",
                       nrbq_fr: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/nrbq_fr_template.xlsx",
                       nrbq_fi: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/nrbq_fi_template.xlsx",
                      };
    /* ===== SEGURANÇA: só com sessão iniciada ===== */
    const SB_URL = process.env.SUPABASE_URL || "https://rjkbodfqsvckvnhjwmhg.supabase.co";
    async function whoami(token) {
      if (!token) return null;
      try {
        const r = await fetch(`${SB_URL}/rest/v1/rpc/cb360_whoami`, {
          method: "POST",
          headers: {apikey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
                    Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
          body: "{}",
        });
        if (!r.ok) return null;
        const c = await r.json();
        return c && c.role === "authenticated" && c.corp_oper_nr ? c : null;
      } catch {
        return null;
      }
    }
    const MAX_RECIPIENTS = 200;   /* to + cc + bcc (o envio em massa usa cc) */
    const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;
    function badRecipients(list) {
      return list.length > MAX_RECIPIENTS || !list.every(e => EMAIL_RE.test(e));
    }
    const mailList = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map(e => String(e).trim()).filter(Boolean);
    // ===== CONTACTOS DA CORPORAÇÃO (assinatura dos emails) =====
    // Vêm da corporation_data da corporação com sessão iniciada. Se não vierem, a linha fica vazia.
    function corpContactsHtml(d = {}) {
      const {corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail} = d;
      return [[corpAddress, [corpCp, corpLocalitie].filter(Boolean).join(" "), "Portugal"].filter(Boolean).join(" | "),
              [corpPhoneMobile ? `Telem.: ${corpPhoneMobile}` : "", corpPhoneLandline ? `Telef: ${corpPhoneLandline}` : ""].filter(Boolean).join(" | "),
              corpEmail ? `Email: ${corpEmail}` : ""].filter(Boolean).join("<br>");
    }
    // ===== CELL ALIGNMENT HELPERS =====
    const fitCell = (cell) => {
      cell.alignment = {vertical: "middle", horizontal: "left", wrapText: true};
    };
    const fitCellTemplate = (cell) => {
      cell.alignment = {vertical: "middle", horizontal: "center", wrapText: true};
    };
    // ===== XLSX → PDF VIA ADOBE =====
    async function workbookToPdfBuffer(workbook, prefix = "doc") {
      const tempDir = os.tmpdir();
      const inputFilePath = path.join(tempDir, `${prefix}_${Date.now()}.xlsx`);
      const outputFilePath = path.join(tempDir, `${prefix}_${Date.now()}_out.pdf`);
      const cleanup = () => {
        try {if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);} catch {}
        try {if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);} catch {}
      };
      try {
        await workbook.xlsx.writeFile(inputFilePath);
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials, clientConfig: ADOBE_CLIENT_CONFIG});
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const resAdobe = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const streamAsset = await pdfServices.getContent({asset: resAdobe.result.asset});
        const writeStream = fs.createWriteStream(outputFilePath);
        streamAsset.readStream.pipe(writeStream);
        await new Promise((res, rej) => {writeStream.on("finish", res); writeStream.on("error", rej);});
        const buf = fs.readFileSync(outputFilePath);
        cleanup();
        return buf;
      } catch (err) {
        cleanup();
        throw err;
      }
    }
    // ===== FICHAS NRBQ (DON N.º 3): preenche o template oficial com os dados da app =====
    const NRBQ_MAPS = {"nrbq_fni": {"text": {"ocorrencia": "AI12", "data_notif": "H17", "hora_notif": "AB17", "operador": "H18", "emissor_id": "G21", "emissor_contactos": "F22", "data_inc": "G26", "hora_inc": "AA26", "data_obs": "N27", "hora_obs": "AH27", "local": "K28", "referencia": "I29", "coordenadas": "N30", "estrada": "H35", "arruamento": "AD35", "ferrovia": "K36", "outra_ref": "I37", "localidade": "K38", "estab_id": "K42", "estab_morada": "W42", "estab_outro": "AE46", "n_vitimas": "AD52", "sintomas": "J53", "n_mortos": "W53", "nome_comum": "F57", "descricao_visual": "Z57", "onu": "E58", "perigo": "E59", "etiquetas": "J60", "quantidade": "H61", "cisterna_m3": "K63", "garrafas_l": "Q64", "tambores_l": "L65", "contentor_outro": "AH63", "derrame": "O74", "fuga": "O75", "espalhamento": "P76", "outra_info": "J79", "cheiro_tipo": "AA84", "cor_derrame": "G85", "origem_fuga": "G86", "origem_qual": "F92", "idade": "AI111", "outras": "B121", "optel": "AG127"}, "choice": {"estab_tipo": {"Comércio": "U43", "Indústria": "U44", "Armazém": "U45", "Interface marítimo": "U46", "Interface rodoviário": "U47", "Interface ferroviário": "U48", "Aeroporto": "AC43", "Habitação": "AC44", "Escritórios": "AC45", "Saúde": "AC46", "Escola": "AC47", "Lar": "AC48", "Outro": "AH43"}, "vitimas": {"Sim": "N52", "Não": "R52"}, "contentor": {"Cisterna": "K63", "Garrafas de gás comprimido": "Q64", "Tambores": "L65", "Outro": "J66"}, "transporte": {"Rodoviário": "E68", "Marítimo": "I68", "Conduta (pipeline)": "R68", "Ferroviário": "E69", "Fluvial": "I69", "Aéreo": "O69"}, "fase": {"Carga": "AM67", "Descarga": "AM68", "Em Transporte": "AM69"}, "incendio": {"Sim": "H77", "Não": "K77"}, "explosao": {"Sim": "H78", "Não": "K78"}, "cheiro": {"Sim": "F84", "Não": "I84"}, "vitimas_mat": {"Sim": "K87", "Não": "O87"}, "origem_conhecida": {"Sim": "O91", "Não": "R91"}, "reg_explosao": {"Sim": "K93", "Não": "O93"}, "reg_ataque": {"Sim": "T94", "Não": "W94"}, "ameaca_bomba": {"Sim": "O95", "Não": "R95"}, "tipo_chamada": {"Local": "J99", "Regional": "J100", "Nacional": "J101", "Móvel": "J102", "Internacional": "J103"}, "voz": {"Forte": "AB99", "Suave": "AB100", "Aguda": "AB101", "Rouca": "AB102", "Agradável": "AB103", "Denotada Embriaguez": "AB104"}, "sexo": {"Feminino": "AG99", "Masculino": "AK99"}, "sotaque": {"Local": "J105", "Regional": "J106", "Outros": "J107", "Estrangeiro": "P105", "Étnico": "P106"}, "modo": {"Calmo": "AB105", "Racional": "AB106", "Coerente": "AB107", "Deliberado": "AB108", "Direto": "AB109", "Correto": "AB110", "Irritante": "AM105", "Irracional": "AM106", "Incoerente": "AM107", "Emocional": "AM108"}, "sons": {"Barulho": "P111", "Silêncio": "P112", "Misturado": "P113", "Comboio": "P114", "Música": "P115", "Vozes": "P116", "Cozinha": "AB111", "Aeronaves": "AB112", "Animais": "AB113", "Máquinas": "AB114", "Tráfego de rua": "AB115", "Reunião de rua": "AB116", "Outros": "AB117"}}, "rows": {}}, "nrbq_fr": {"text": {"ocorrencia": "AK12", "data_hora": "AK14", "data_inc": "G27", "hora_inc": "AB27", "data_obs": "N28", "hora_obs": "AH28", "local": "K29", "referencia": "I30", "coordenadas": "N31", "estrada": "H36", "arruamento": "AE36", "ferrovia": "K37", "outra_ref": "I38", "localidade": "L39", "estab_id": "K43", "estab_morada": "X43", "estab_outro": "AF47", "nome_comum": "F53", "descricao_visual": "V54", "onu": "E54", "perigo": "E55", "etiquetas": "J56", "quantidade": "H57", "cisterna_m3": "M58", "garrafas_l": "R59", "tambores_l": "L60", "contentor_outro": "Y59", "derrame": "O70", "fuga": "O71", "espalhamento": "P72", "outra_info": "J75", "cheiro_tipo": "AC80", "cor_derrame": "G81", "origem_fuga": "G82", "origem_qual": "F88", "n_vitimas": "AE95", "sintomas": "J96", "n_mortos": "X96", "det_nr_info": "L102", "det_b_info": "L103", "det_q_info": "L104", "vento_kmh": "AM116", "ceu": "G117", "temperatura": "AB117", "outras": "B122", "optel": "AH131"}, "choice": {"estab_tipo": {"Comércio": "V44", "Indústria": "V45", "Armazém": "V46", "Interface marítimo": "V47", "Interface rodoviário": "V48", "Interface ferroviário": "V49", "Aeroporto": "AD44", "Habitação": "AD45", "Escritórios": "AD46", "Saúde": "AD47", "Escola": "AD48", "Lar": "AD49", "Outro": "AH44"}, "contentor": {"Cisterna": "K58", "Garrafas de gás comprimido": "Q59", "Tambores": "L60", "Outro": "J61"}, "transporte": {"Rodoviário": "E65", "Marítimo": "J65", "Conduta (pipeline)": "S65", "Ferroviário": "E66", "Fluvial": "J66", "Aéreo": "O66"}, "fase": {"Carga": "AO64", "Descarga": "AO65", "Em Transporte": "AO66"}, "incendio": {"Sim": "H73", "Não": "K73"}, "explosao": {"Sim": "H74", "Não": "K74"}, "cheiro": {"Sim": "F80", "Não": "I80"}, "vitimas_mat": {"Sim": "K83", "Não": "O83"}, "origem_conhecida": {"Sim": "O87", "Não": "S87"}, "reg_explosao": {"Sim": "K89", "Não": "O89"}, "reg_ataque": {"Sim": "U90", "Não": "X90"}, "ameaca_bomba": {"Sim": "O91", "Não": "S91"}, "vitimas": {"Sim": "N95", "Não": "S95"}, "equip_detecao": {"Sim": "@R100:R100", "Não": "@U100:U100"}, "agentes_equip": {"NR": "AG100", "B": "AI100", "Q": "AL100"}, "det_nr": {"Sim": "G102", "Não": "I102"}, "det_b": {"Sim": "G103", "Não": "I103"}, "det_q": {"Sim": "G104", "Não": "I104"}, "vento_dir": {"Norte": "M116", "Sul": "O116", "Este": "S116", "Oeste": "V116"}, "vento_int": {"Fraco": "AC116", "Moderado": "AG116", "Forte": "AJ116"}, "precipitacao": {"Sim": "H118", "Não": "K118"}}, "rows": {"eras": {"start": 18, "max": 6, "cols": {"org": "I", "nome": "U", "idade": "AG", "id": "AL"}}, "medicoes": {"start": 108, "max": 5, "cols": {"dh": "B", "tipo": "F", "coord": "J", "equip": "T", "res": "AF", "un": "AL"}}}}, "nrbq_fi": {"text": {"ocorrencia": "AJ12", "fi_n": "AJ14", "data_hora": "AJ16", "equipa": "J20", "vento_kmh": "AL54", "ceu": "G55", "temperatura": "AB55", "info": "B59", "optel": "AH65"}, "choice": {"det_nr": {"Sim": "G38", "Não": "I38"}, "det_b": {"Sim": "G39", "Não": "I39"}, "det_q": {"Sim": "G40", "Não": "I40"}, "vento_dir": {"Norte": "M54", "Sul": "O54", "Este": "S54", "Oeste": "V54"}, "vento_int": {"Fraco": "AC54", "Moderado": "AG54", "Forte": "@AH54:AH54"}, "precipitacao": {"Sim": "H56", "Não": "K56"}}, "rows": {"elementos": {"start": 22, "max": 10, "cols": {"org": "I", "nome": "U", "idade": "AG", "id": "AK"}}, "medicoes": {"start": 44, "max": 7, "cols": {"dh": "B", "tipo": "F", "coord": "K", "equip": "R", "res": "AF", "un": "AK"}}}}};
    const NRBQ_DATE_KEYS = /^(data_|dh$)/;
    function nrbqFmt(v) {
      if (v == null) return "";
      let s = String(v).trim();
      let m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
      if (m) return `${m[3]}/${m[2]}/${m[1]} ${m[4]}`;
      m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;
      return s;
    }
    function fillNrbq(ws, type, data, opts = {}) {
      const map = NRBQ_MAPS[type];
      if (!map) throw new Error("Tipo de ficha NRBQ desconhecido: " + type);
      // o ExcelJS partilha o mesmo objeto de estilo entre células iguais: copia antes de mexer, senão altera o template todo
      const put = (addr, val, center, mark) => {
        const cell = ws.getCell(addr);
        cell.style = JSON.parse(JSON.stringify(cell.style || {}));
        cell.value = val;
        cell.alignment = {vertical: "middle", horizontal: center ? "center" : "left", wrapText: !mark};
        cell.font = {name: "Arial", size: mark ? 9 : 8, bold: !!mark, color: {argb: "FF000000"}};
      };
      for (const [k, addr] of Object.entries(map.text)) {
        const v = nrbqFmt(data[k]);
        if (v) put(addr, v);
      }
      for (const [k, options] of Object.entries(map.choice)) {
        const chosen = Array.isArray(data[k]) ? data[k] : (data[k] ? [data[k]] : []);
        for (const [opt, addr] of Object.entries(options)) {
          if (!(opts.allMarks || chosen.includes(opt))) continue;
          if (addr.startsWith("@")) {   // opções sem espaço para o X: realça a própria palavra
            const [a1, a2] = addr.slice(1).split(":");
            const r1 = ws.getCell(a1), r2 = ws.getCell(a2 || a1);
            for (let c = r1.col; c <= r2.col; c++) {
              const cell = ws.getRow(r1.row).getCell(c);
              cell.style = JSON.parse(JSON.stringify(cell.style || {}));
              cell.fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFFFD966"}};
              if (cell.value) cell.font = {...(cell.font || {}), bold: true};
            }
            continue;
          }
          {
            // nos contentores a célula da opção é a da capacidade: só marca X se não houver valor lá
            const cur = ws.getCell(addr).value;
            if (!cur || opts.allMarks) put(addr, "X", true, true);
          }
        }
      }
      for (const [k, def] of Object.entries(map.rows)) {
        const rows = (Array.isArray(data[k]) ? data[k] : []).filter(r => r && Object.values(r).some(x => String(x ?? "").trim()));
        rows.slice(0, def.max).forEach((r, i) => {
          for (const [ck, col] of Object.entries(def.cols)) {
            let v = nrbqFmt(r[ck]);
            if (ck === "dh") v = v.replace(/^(\d{2}\/\d{2})\/\d{4}/, "$1");   // coluna estreita: só dia/mês e hora
            if (v) put(`${col}${def.start + i}`, v, ck === "tipo" || ck === "idade");
          }
        });
      }
      ws.pageSetup = {...ws.pageSetup, paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
    }

    const NRBQ_INFO = {
      nrbq_fni: {nome: "Ficha de Notificação Inicial (FNI)", ficheiro: "FNI_NRBQ", destino: "CDOS"},
      nrbq_fr: {nome: "Ficha de Reconhecimento (FR)", ficheiro: "FR_NRBQ", destino: "CDOS"},
      nrbq_fi: {nome: "Ficha de Intervenção (FI)", ficheiro: "FI_NRBQ", destino: "PCOC"},
    };
    const nrbqEsc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
    // ===== MAIN HANDLER =====
    export default async function handler(req, res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") return res.status(200).end();
      if (req.method !== "POST") return res.status(405).json({success: false, error: "Método não permitido"});
      const claims = await whoami(String(req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
      if (!claims) return res.status(401).json({success: false, error: "Sessão inválida"});
      try {
        const {type, data} = req.body;
        // ===== PDF HANDLERS ===== (só carrega o pdf-lib quando é preciso; o envio de email não o usa)
        let PDFDocument = null, mergedPdf = null;
        if (type !== "email") {
          ({PDFDocument} = await import("pdf-lib"));
          mergedPdf = await PDFDocument.create();
        }
        // ===== HEMODIÁLISES =====
        if (["saloc", "veiculos", "veículos", "ambos", "global"].includes(type)) {
          const sqx = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "SQX");
          const tqs = data.filter(u => (u.utent_shift_days || "").toUpperCase() === "TQS");
          if (type === "saloc" || type === "ambos") {
            const tplRes = await fetch(TEMPLATES.saloc);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await tplRes.arrayBuffer());
            const ws = workbook.worksheets[0];
            ws.pageSetup = {paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
            ws.getRow(43).addPageBreak();
            const fillS = (list, rows) => {
              const shifts = ["07:00-12:00", "11:00-17:00", "16:00-23:00"];
              shifts.forEach((s, idx) => {
                list.filter(u => u.utent_shift === s).forEach((u, i) => {
                  if (i < 7) {
                    const cell = ws.getCell(`B${rows[idx] + i}`);
                    cell.value = u.utent_name || "";
                    fitCell(cell);
                  }
                });
              });
            };
            fillS(sqx, [14, 22, 30]);
            fillS(tqs, [57, 65, 73]);
            const pdfBuf = await workbookToPdfBuffer(workbook, "saloc");
            const doc = await PDFDocument.load(pdfBuf);
            const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
            pages.forEach(p => mergedPdf.addPage(p));
          }
          if (type === "veículos" || type === "ambos") {
            const tplRes = await fetch(TEMPLATES.veiculos);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await tplRes.arrayBuffer());
            const ws = workbook.worksheets[0];
            ws.pageSetup = {paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
            ws.getRow(53).addPageBreak();
            const fillV = (list, startRows) => {
              const shifts = ["07:00-12:00", "11:00-17:00", "16:00-23:00"];
              shifts.forEach((s, idx) => {
                list.filter(u => u.utent_shift === s).forEach((u, i) => {
                  if (i < 7) {
                    const r = startRows[idx] + i;
                    const cName = ws.getCell(`B${r}`);
                    const cDest = ws.getCell(`F${r}`);
                    const cCont = ws.getCell(`I${r}`);
                    cName.value = u.utent_name || "";
                    cDest.value = u.utent_desteny || "";
                    cCont.value = u.utent_contact || "";
                    [cName, cDest, cCont].forEach(fitCell);
                  }
                });
              });
            };
            fillV(sqx, [16, 28, 40]);
            fillV(tqs, [69, 81, 93]);
            const pdfBuf = await workbookToPdfBuffer(workbook, "veiculos");
            const doc = await PDFDocument.load(pdfBuf);
            const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
            pages.forEach(p => mergedPdf.addPage(p));
          }
          const tplRes = await fetch(TEMPLATES.global);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await tplRes.arrayBuffer());
          const ws = workbook.worksheets[0];
          ws.pageSetup = {paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
          const fillG = (list, start) => {
            for (let i = 0; i < 21; i++) {
              const r = start + i;
              const u = list[i];
              const row = ws.getRow(r);
              if (!u) {
                row.hidden = true;
              } else {
                const cells = [
                  ws.getCell(`B${r}`), ws.getCell(`C${r}`), ws.getCell(`D${r}`),
                  ws.getCell(`E${r}`), ws.getCell(`F${r}`), ws.getCell(`G${r}`), ws.getCell(`H${r}`),
                ];
                cells[0].value = u.utent_name || "";
                cells[1].value = u.utent_niss || "";
                cells[2].value = u.utent_adress || "";
                cells[3].value = u.utent_localitie || "";
                cells[4].value = u.utent_desteny || "";
                cells[5].value = u.utent_contact || "";
                cells[6].value = u.utent_position || "";
                cells.forEach(fitCell);
              }
              row.commit();
            }
          };
          fillG(sqx, 13);
          fillG(tqs, 37);
          const pdfBuf = await workbookToPdfBuffer(workbook, "global");
          const doc = await PDFDocument.load(pdfBuf);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          const finalPdf = await mergedPdf.save();
          const dataHoje = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="Listagem_Hemo_${dataHoje}.pdf"`);
          return res.status(200).send(Buffer.from(finalPdf));
        }
        // ===== FORMAÇÃO =====
        if (type === "formacao") {
          const tplRes = await fetch(TEMPLATES.formacao);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await tplRes.arrayBuffer());
          const pdfBuf = await workbookToPdfBuffer(workbook, "formacao");
          const doc = await PDFDocument.load(pdfBuf);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          const finalPdf = await mergedPdf.save();
          const dateToday = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="Formulario_Formacao_${dateToday}.pdf"`);
          return res.status(200).send(Buffer.from(finalPdf));
        }
        // ===== EQUIPMENT REQUEST =====
        if (type === "equipment_request") {
          const formatDate = (d) => {
            if (!d) return "";
            const [y, m, day] = d.split("-");
            return `${day}/${m}/${y}`;
          };
          const tplRes = await fetch(TEMPLATES.equipment_request);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await tplRes.arrayBuffer());
          const ws = workbook.worksheets[0];
          ws.pageSetup = {paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
          const cName = ws.getCell("W12");
          const cCC = ws.getCell("B14");
          const cContact = ws.getCell("Z14");
          const cEquip = ws.getCell("B18");
          const cPreview = ws.getCell("AV26");
          const cDelivery = ws.getCell("Q26");
          cName.value = data.requesting_name || "";
          cCC.value = data.requesting_cc || "";
          cContact.value = data.requesting_contact || "";
          cEquip.value = data.requesting_equipment || "";
          cPreview.value = formatDate(data.preview_return_date);
          cDelivery.value = formatDate(data.delivery_date);
          [cName, cCC, cContact, cEquip, cPreview, cDelivery].forEach(fitCell);
          const pdfBuf = await workbookToPdfBuffer(workbook, "equipment_request");
          const doc = await PDFDocument.load(pdfBuf);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          const finalPdf = await mergedPdf.save();
          const dateToday = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="Requisicao_Equipamento_${dateToday}.pdf"`);
          return res.status(200).send(Buffer.from(finalPdf));
        }
        // ===== FLEET CARDS =====
        if (type === "fleet_cards") {
          const tplRes = await fetch(TEMPLATES.fleet_cards);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await tplRes.arrayBuffer());
          const ws = workbook.worksheets[0];
          ws.pageSetup = {paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
          data.forEach((item, i) => {
            const r = 11 + i;
            const cVehicle = ws.getCell(`C${r}`);
            const cRegist = ws.getCell(`F${r}`);
            const cContact = ws.getCell(`I${r}`);
            const cCode = ws.getCell(`L${r}`);
            cVehicle.value = item.vehicle || "";
            cRegist.value = item.registration || "";
            cContact.value = item.contact || "";
            cCode.value = item.card_code || "";
            [cVehicle, cRegist, cContact, cCode].forEach(fitCellTemplate);
          });
          const startRow = 11 + data.length;
          for (let r = startRow; r <= 33; r++) {
            const row = ws.getRow(r);
            row.hidden = true;
          }
          const pdfBuf = await workbookToPdfBuffer(workbook, "fleet_cards");
          const doc = await PDFDocument.load(pdfBuf);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          const finalPdf = await mergedPdf.save();
          const dateToday = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="Cartoes_Frota_${dateToday}.pdf"`);
          return res.status(200).send(Buffer.from(finalPdf));
        }
        // ===== CONTACT LIST =====
        if (type === "contact_list") {
          const quadMap = {QCOM: {startRow: 9, endRow: 11}, QATIV: {startRow: 17, endRow: 116}, QEST: {startRow: 122, endRow: 142},
                           QEA: {startRow: 148, endRow: 157}, QHR: {startRow: 163, endRow: 182},};
          const {quad} = data;
          const tplRes = await fetch(TEMPLATES.contact_list);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await tplRes.arrayBuffer());
          const ws = workbook.worksheets[0];
          ws.pageSetup = {paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
          ws.getRow(117).addPageBreak();
          quad.forEach(({code, elements}) => {
            const map = quadMap[code];
            if (!map) return;
            const maxRows = map.endRow - map.startRow + 1;
            elements.slice(0, maxRows).forEach((el, i) => {
              const r = map.startRow + i;
              const cNInt = ws.getCell(`B${r}`);
              const cPatent = ws.getCell(`C${r}`);
              const cName = ws.getCell(`F${r}`);
              const cPhone = ws.getCell(`M${r}`);
              const cMobile = ws.getCell(`N${r}`);
              const cEmail = ws.getCell(`O${r}`);
              cNInt.value = el.n_int || "";
              cPatent.value = el.patent || "";
              cName.value = el.full_name || "";
              cPhone.value = el.phone || "";
              cMobile.value = el.mobile_phone || "";
              cEmail.value  = el.email || "";
              [cNInt, cPatent, cName, cPhone, cMobile, cEmail].forEach(fitCellTemplate);
            });
            const filledCount = Math.min(elements.length, maxRows);
            for (let i = filledCount; i < maxRows; i++) {
              const row = ws.getRow(map.startRow + i);
              row.hidden = true;
              row.commit();
            }
            if (elements.length === 0) {
              for (let r = map.startRow - 4; r < map.startRow; r++) {
                const row = ws.getRow(r);
                row.hidden = true;
                row.commit();
              }
            }
          });
          const pdfBuf = await workbookToPdfBuffer(workbook, "contact_list");
          const doc = await PDFDocument.load(pdfBuf);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          const finalPdf = await mergedPdf.save();
          const dateToday = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="Lista_Contactos_${dateToday}.pdf"`);
          return res.status(200).send(Buffer.from(finalPdf));
        }
        // ===== ATTENDANCE LIST =====
        if (type === "attendance_list") {
          const quadMap = {QCOM: {startRow: 11, endRow: 13}, QATIV: {startRow: 19, endRow: 118}, QEST: {startRow: 124, endRow: 144},
                           QEA: {startRow: 150, endRow: 159}, QHR: {startRow: 165, endRow: 184},};
          const { quad, eventName, corpName } = data;
          const tplRes = await fetch(TEMPLATES.attendance_list);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await tplRes.arrayBuffer());
          const ws = workbook.worksheets[0];
          ws.pageSetup = {paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0};
          ws.getRow(119).addPageBreak();
          const cEventName = ws.getCell("B5");
          cEventName.value = eventName || "";
          fitCellTemplate(cEventName);
          quad.forEach(({code, elements}) => {
            const map = quadMap[code];
            if (!map) return;
            const maxRows = map.endRow - map.startRow + 1;
            elements.slice(0, maxRows).forEach((el, i) => {
              const r = map.startRow + i;
              const cNInt = ws.getCell(`B${r}`);
              const cPatent = ws.getCell(`C${r}`);
              const cName = ws.getCell(`F${r}`);
              const cAttends = ws.getCell(`M${r}`);
              const cMotive = ws.getCell(`N${r}`);
              cNInt.value = el.n_int || "";
              cPatent.value = el.patent || "";
              cName.value = el.full_name || "";
              cAttends.value = el.attends || "—";
              cMotive.value = el.motive || "";
              [cNInt, cPatent, cName, cAttends, cMotive].forEach(fitCellTemplate);
            });
            const filledCount = Math.min(elements.length, maxRows);
            for (let i = filledCount; i < maxRows; i++) {
              const row = ws.getRow(map.startRow + i);
              row.hidden = true;
              row.commit();
            }
            if (elements.length === 0) {
              for (let r = map.startRow - 4; r < map.startRow; r++) {
                const row = ws.getRow(r);
                row.hidden = true;
                row.commit();
              }
            }
          });
          const pdfBuf = await workbookToPdfBuffer(workbook, "attendance_list");
          const doc = await PDFDocument.load(pdfBuf);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          const finalPdf = await mergedPdf.save();
          const fileName = `Lista_Comparencias_${eventName}.pdf`;
          // ===== ENVIO EMAIL EM SEGUNDO PLANO =====
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {user: process.env.GMAIL_EMAIL, pass: process.env.GMAIL_APP_PASSWORD},
          });
          const {logoUrl, senderName} = data;
          const htmlAttendanceTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: #333333;}
                .email-container {max-width: 1000px; margin: 25px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);}
                .email-header {background: linear-gradient(135deg, #a70c0c 0%, #d81c1c 50%, #b91010 100%); padding: 15px 20px; text-align: center; color: #ffffff;}
                .brand-logo {max-height: 75px; width: auto; margin-bottom: 12px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));}
                .email-header h2 {margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.4;}
                .email-header p {margin: 6px 0 0 0; font-size: 13px; color: #fecaca; opacity: 0.9;}
                .email-body {padding: 15px 10px; line-height: 1.6; font-size: 14px;}
                .message-box {background-color: #f8fafc; border-left: 4px solid #d81c1c; padding: 20px; margin: 0 0 25px 0; border-radius: 0 6px 6px 0; white-space: pre-line; color: #1e293b; font-size: 14.5px;}
                .signature-section {margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 13px; color: #475569;}
                .signature-user {font-weight: bold; font-size: 14px; color: #1e293b; text-transform: uppercase; margin-bottom: 2px;}
                .signature-corp {font-weight: bold; color: #d81c1c; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;}
                .signature-contacts {color: #475569; font-size: 11.5px;}
                .eco-note {font-size: 11px; color: #16a34a; margin-top: 25px; line-height: 1.4;}
                .confidentiality-note {font-size: 10px; color: #94a3b8; margin-top: 15px; line-height: 1.4; text-align: justify; border-top: 1px solid #f1f5f9; padding-top: 10px;}
                .email-footer {background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6;}
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-header">
                  ${logoUrl ? `<img src="${logoUrl}" alt="Logótipo" class="brand-logo" height="100" style="height: 100px; max-height: 100px;" />` : ""}
                  <h2>${corpName}</h2>
                  <p>Lista de Comparências em Eventos</p>
                </div>
                <div class="email-body">
                  <div class="message-box">Segue em anexo a lista de comparências do evento: <strong>${eventName}</strong>.</div>
                  <div style="margin-top:10px; margin-bottom:10px; font-size:14px; color:#1e293b;">
                    Com os melhores cumprimentos,
                  </div>
                  <div class="signature-section">
                    <div class="signature-user">${senderName}</div>
                    <div class="signature-corp">${corpName}</div>
                    <div class="signature-contacts">
                      ${corpContactsHtml(data)}
                    </div>
                  </div>
                  <div class="eco-note">
                    🌱 <strong>Antes de imprimir este e-mail pense bem se é mesmo necessário.</strong> Poupe eletricidade, toner e papel.
                  </div>
                  <div class="confidentiality-note">
                    <strong>AVISO DE CONFIDENCIALIDADE:</strong><br>
                    Esta mensagem e quaisquer anexos, podem conter informação confidencial para uso exclusivo do destinatário. Cabe ao destinatário assegurar a verificação de vírus e outras medidas que assegurem que esta mensagem não afeta os seus sistemas. Se não for o destinatário, não deverá usar, distribuir ou copiar este email, devendo proceder à sua eliminação e informar o emissor. É estritamente proibido o uso, a distribuição, a cópia ou qualquer forma de disseminação não autorizada deste email e dos seus anexos. Obrigado.
                  </div>
                </div>
                <div class="email-footer">
                  &copy; ${new Date().getFullYear()} CB360 Online - Todos os direitos reservados.
                </div>
              </div>
            </body>
            </html>
          `;
          const attTo = mailList(data.attendanceTo);
          try {
            if (badRecipients([...attTo, ...mailList(data.attendanceCc), ...mailList(data.attendanceBcc)])) {
              console.warn("⚠️ Lista de Comparências: destinatários inválidos ou em excesso. Email não enviado.");
            } else if (!attTo.length) {
              console.warn("⚠️ Lista de Comparências sem destinatários configurados (attendance_mail_to). Email não enviado.");
            } else {
              const attCc = mailList(data.attendanceCc);
              const attBcc = mailList(data.attendanceBcc);
              await transporter.sendMail({
                from: `"CB360 Online" <${process.env.GMAIL_EMAIL}>`,
                to: attTo,
                ...(attCc.length ? {cc: attCc} : {}),
                ...(attBcc.length ? {bcc: attBcc} : {}),
                subject: `Lista de Comparências - ${eventName}`,
                html: htmlAttendanceTemplate,
                attachments: [{filename: fileName, content: Buffer.from(finalPdf), contentType: "application/pdf"}],
              });
              console.log("✅ Email de comparências enviado com sucesso para:", attTo);
            }
          } catch (emailErr) {
            console.error("❌ Erro ao enviar email:", emailErr);
          }
          const dateToday = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
          return res.status(200).send(Buffer.from(finalPdf));
        }
        // ===== FICHAS NRBQ (FNI / FR / FI) =====
        if (["nrbq_fni", "nrbq_fr", "nrbq_fi"].includes(type)) {
          const info = NRBQ_INFO[type];
          const fields = data.fields || {};
          const tplRes = await fetch(TEMPLATES[type]);
          if (!tplRes.ok) throw new Error(`Template ${type} não encontrado (${tplRes.status})`);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await tplRes.arrayBuffer());
          fillNrbq(workbook.worksheets[0], type, fields);
          const pdfBuf = await workbookToPdfBuffer(workbook, type);
          const doc = await PDFDocument.load(pdfBuf);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          const finalPdf = await mergedPdf.save();
          const occ = String(fields.ocorrencia || "").replace(/[^A-Za-z0-9-]+/g, "_").replace(/^_+|_+$/g, "");
          const stamp = new Date().toLocaleString("pt-PT", {timeZone: "Europe/Lisbon"}).replace(/[/:, ]+/g, "-");
          const fileName = `${info.ficheiro}${occ ? "_" + occ : ""}_${stamp}.pdf`;
          const to = mailList(data.to), cc = mailList(data.cc), bcc = mailList(data.bcc);
          if (!to.length) return res.status(400).json({success: false, error: "Sem destinatários configurados para esta ficha (Emails Config.)."});
          const {corpName = "", logoUrl = "", senderName = "CB360 Mobile"} = data;
          const linhas = [
            ["N.º Ocorrência", fields.ocorrencia], ["Local", fields.local], ["Natureza", fields.natureza || fields.categoria],
            ["Vítimas", fields.vitimas], ["Equipa", fields.equipa], ["Preenchida por (OPTEL)", fields.optel],
          ].filter(([, v]) => v && String(v).trim());
          const html = `
            <!DOCTYPE html><html><head><meta charset="utf-8"></head>
            <body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;background:#f3f4f6;color:#333;">
              <div style="max-width:760px;margin:25px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">
                <div style="background:linear-gradient(135deg,#a70c0c 0%,#d81c1c 50%,#b91010 100%);padding:15px 20px;text-align:center;color:#fff;">
                  ${logoUrl ? `<img src="${logoUrl}" alt="Logótipo" height="90" style="height:90px;margin-bottom:10px;">` : ""}
                  <h2 style="margin:0;font-size:19px;">${nrbqEsc(corpName)}</h2>
                  <p style="margin:6px 0 0;font-size:13px;color:#fecaca;">${info.nome} — Incidente NRBQ (DON N.º 3)</p>
                </div>
                <div style="padding:18px 16px;font-size:14px;line-height:1.6;">
                  <div style="background:#fff5f5;border-left:4px solid #d81c1c;padding:14px 16px;border-radius:0 6px 6px 0;margin-bottom:18px;">
                    Segue em anexo a <strong>${info.nome}</strong>, preenchida no CB360 Mobile. Por favor confirme a receção via telefone.
                  </div>
                  ${linhas.length ? `<table style="border-collapse:collapse;width:100%;font-size:13px;">${linhas.map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:40%;">${k}</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">${nrbqEsc(v)}</td></tr>`).join("")}</table>` : ""}
                  <div style="margin-top:26px;border-top:1px dashed #cbd5e1;padding-top:12px;font-size:13px;color:#475569;">
                    <div style="font-weight:bold;color:#1e293b;text-transform:uppercase;">${senderName}</div>
                    <div style="font-weight:bold;color:#d81c1c;font-size:12px;text-transform:uppercase;">${nrbqEsc(corpName)}</div>
                    <div style="font-size:11.5px;">${corpContactsHtml(data)}</div>
                  </div>
                </div>
                <div style="background:#f1f5f9;padding:14px;text-align:center;font-size:11px;color:#6b7280;">&copy; ${new Date().getFullYear()} CB360 - Todos os direitos reservados.</div>
              </div>
            </body></html>`;
          const transporter = nodemailer.createTransport({service: "gmail", auth: {user: process.env.GMAIL_EMAIL, pass: process.env.GMAIL_APP_PASSWORD}});
          await transporter.sendMail({
            from: `"CB360 Mobile" <${process.env.GMAIL_EMAIL}>`,
            to, ...(cc.length ? {cc} : {}), ...(bcc.length ? {bcc} : {}),
            subject: `${info.nome.replace(/ \(.*\)$/, "")} NRBQ${fields.ocorrencia ? " – Ocorrência n.º " + fields.ocorrencia : ""}${corpName ? " – " + corpName : ""}`,
            html,
            attachments: [{filename: fileName, content: Buffer.from(finalPdf), contentType: "application/pdf"}],
          });
          return res.status(200).json({success: true, sentTo: to, fileName});
        }
        // ===== EMAIL =====
        if (type === "email") {
          const {to, subject, message, corpOperNr, corpName, logoUrl, senderName, isBulk, cc, bcc, attachment, attachments, attachmentUrls, mailType,
                 corpAddress, corpCp, corpLocalitie, corpPhoneMobile, corpPhoneLandline, corpEmail} = data;
          const contactsHtml = corpContactsHtml(data);
          const isRO = mailType === "ro";
          const toList = (v) => (Array.isArray(v) ? v : String(v || "").split(","))
            .map(e => String(e).trim()).filter(Boolean);
          const uniq = (arr) => [...new Map(arr.map(e => [e.toLowerCase(), e])).values()];
          if (!to || !subject || !message) return res.status(400).json({success: false, error: "Campos obrigatórios em falta"});
          const senderDisplayName = `CB360 Online - ${claims.corp_oper_nr}`;
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {user: process.env.GMAIL_EMAIL, pass: process.env.GMAIL_APP_PASSWORD},
          });
          const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: #333333;}
                .email-container {max-width: 1000px; margin: 25px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);}
                .email-header {background: linear-gradient(135deg, #a70c0c 0%, #d81c1c 50%, #b91010 100%); padding: 15px 20px; text-align: center; color: #ffffff;}
                .brand-logo {max-height: 75px; width: auto; margin-bottom: 12px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));}
                .email-header h2 {margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.4;}
                .email-header p {margin: 6px 0 0 0; font-size: 13px; color: #fecaca; opacity: 0.9;}
                .email-body {padding: 15px 10px; line-height: 1.6; font-size: 14px;}
                .message-box {background-color: #f8fafc; border-left: 4px solid #d81c1c; padding: 20px; margin: 0 0 25px 0; border-radius: 0 6px 6px 0; white-space: pre-line; color: #1e293b; font-size: 14.5px;}
                .signature-section {margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 13px; color: #475569;}
                .signature-user {font-weight: bold; font-size: 14px; color: #1e293b; text-transform: uppercase; margin-bottom: 2px;}
                .signature-corp {font-weight: bold; color: #d81c1c; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;}
                .signature-contacts {color: #475569; font-size: 11.5px;}
                .eco-note {font-size: 11px; color: #16a34a; margin-top: 25px; line-height: 1.4;}
                .confidentiality-note {font-size: 10px; color: #94a3b8; margin-top: 15px; line-height: 1.4; text-align: justify; border-top: 1px solid #f1f5f9; padding-top: 10px;}
                .email-footer {background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #f3f4f6;}
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-header">
                  ${logoUrl ? `<img src="${logoUrl}" alt="Logótipo" class="brand-logo" height="100" style="height: 100px; max-height: 100px;" />` : ""}
                  <h2>${corpName}</h2>
                  <p>${isRO ? "Relatórios de Ocorrência" : "Mensagem Enviada via CB360 Online"}</p>
                </div>
                <div class="email-body">
                  <div class="message-box">${message}${isRO ? `<div style="margin-top:12px; font-size:11px; color:#94a3b8; font-style:italic; white-space:normal;">RO's conferidos, corrigidos e compilados automaticamente por CB360 Online by Grupo CB 360</div>` : ""}</div>
                  ${isRO ? "" : `<div style="margin-top:10px; margin-bottom:10px; font-size:14px; color:#1e293b;">
                    Com os melhores cumprimentos,
                  </div>`}
                  <div class="signature-section">
                    ${isRO ? "" : `<div class="signature-user">${senderName}</div>`}
                    <div class="signature-corp">${corpName}</div>
                    <div class="signature-contacts">
                      ${contactsHtml}
                    </div>
                  </div>
                  <div class="eco-note">
                    🌱 <strong>Antes de imprimir este e-mail pense bem se é mesmo necessário.</strong> Poupe eletricidade, toner e papel.
                  </div>
                  <div class="confidentiality-note">
                    <strong>AVISO DE CONFIDENCIALIDADE:</strong><br>
                    Esta mensagem e quaisquer anexos, podem conter informação confidencial para uso exclusivo do destinatário. Cabe ao destinatário assegurar a verificação de vírus e outras medidas que assegurem que esta mensagem não afeta os seus sistemas. Se não for o destinatário, não deverá usar, distribuir ou copiar este email, devendo proceder à sua eliminação e informar o emissor. É estritamente proibido o uso, a distribuição, a cópia ou qualquer forma de disseminação não autorizada deste email e dos seus anexos. Obrigado.
                  </div>
                </div>
                <div class="email-footer">
                  &copy; ${new Date().getFullYear()} CB360 Online - Todos os direitos reservados.
                </div>
              </div>
            </body>
            </html>
          `;
          let mailOptions = {
            from: `"${senderDisplayName}" <${process.env.GMAIL_EMAIL}>`,
            subject: subject,
            html: htmlTemplate,
          };
          mailOptions.to = toList(to);
          if (!mailOptions.to.length) return res.status(400).json({success: false, error: "Sem destinatário. Configure em Centro de Dados → Emails Config."});
          if (badRecipients([...mailOptions.to, ...toList(cc), ...toList(bcc), ...(corpEmail ? [corpEmail] : [])])) {
            return res.status(400).json({success: false, error: `Endereços inválidos ou mais de ${MAX_RECIPIENTS} destinatários.`});
          }
          mailOptions.subject = String(subject).replace(/[\r\n]+/g, " ").slice(0, 250);
          if (isBulk) {
            mailOptions.cc = uniq(toList(cc));
          } else {
            // Cópia sempre para o email da corporação (Centro de Dados → Corporação → E-mail)
            mailOptions.cc = uniq([...toList(cc), ...(corpEmail ? [corpEmail] : [])]);
          }
          if (!mailOptions.cc.length) delete mailOptions.cc;
          const bccList = toList(bcc);
          if (bccList.length) mailOptions.bcc = bccList;
          const files = Array.isArray(attachments) && attachments.length ? attachments : (attachment ? [attachment] : []);
          const mailAttachments = files
            .filter(f => f && f.filename && f.content)
            .map(f => ({filename: f.filename, content: f.content, encoding: "base64"}));
          // Anexos grandes: o browser carrega-os para o Supabase Storage e envia só links temporários
          if (Array.isArray(attachmentUrls)) {
            const valid = attachmentUrls.filter(f => f?.url && f?.filename);
            if (valid.some(f => !/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/sign\//.test(f.url))) {
              return res.status(400).json({success: false, error: "Endereço de anexo inválido."});
            }
            const fetched = await Promise.all(valid.map(async f => {
              const fileRes = await fetch(f.url);
              if (!fileRes.ok) throw new Error(`Não foi possível obter o anexo ${f.filename}.`);
              return {filename: f.filename, content: Buffer.from(await fileRes.arrayBuffer())};
            }));
            mailAttachments.push(...fetched);
          }
          if (mailAttachments.length) mailOptions.attachments = mailAttachments;
          await transporter.sendMail(mailOptions);
          return res.status(200).json({success: true, message: "Processado com sucesso!"});
        }
      } catch (err) {
        res.status(500).json({error: "Erro", details: err.message});
      }
    }
