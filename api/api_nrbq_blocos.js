    /* =====================================================================
       FICHAS NRBQ (DON N.º 3) — FNI / FR / FI   ·   CB360 Mobile → API
       Colar em 3 sítios do various_convert_and_send.js (ver comentários A, B e C)
       ===================================================================== */

    /* ---------- A) dentro do objeto TEMPLATES, a seguir a attendance_list ---------- */
                       nrbq_fni: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/nrbq_fni_template.xlsx",
                       nrbq_fr: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/nrbq_fr_template.xlsx",
                       nrbq_fi: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/nrbq_fi_template.xlsx",

    /* ---------- B) antes do "export default async function handler" ---------- */
    // ===== FICHAS NRBQ (DON N.º 3): preenche o template oficial com os dados da app =====
    const NRBQ_MAPS = {"nrbq_fni": {"text": {"ocorrencia": "AG12", "data_notif": "H17", "hora_notif": "Z17", "operador": "H18", "emissor_id": "G21", "emissor_contactos": "F22", "data_inc": "G26", "hora_inc": "Y26", "data_obs": "M27", "hora_obs": "AE27", "local": "K28", "referencia": "I29", "coordenadas": "M30", "estrada": "H35", "arruamento": "AB35", "ferrovia": "K36", "outra_ref": "I37", "localidade": "L38", "estab_id": "K42", "estab_morada": "U42", "estab_outro": "AC46", "n_vitimas": "AB52", "sintomas": "J53", "n_mortos": "U53", "nome_comum": "F57", "descricao_visual": "S58", "onu": "E58", "perigo": "E59", "etiquetas": "J60", "quantidade": "H61", "cisterna_m3": "K66", "garrafas_l": "P67", "tambores_l": "L68", "contentor_outro": "V67", "derrame": "N76", "fuga": "N77", "espalhamento": "O78", "outra_info": "J81", "cheiro_tipo": "Z86", "cor_derrame": "G87", "origem_fuga": "G88", "origem_qual": "F94", "idade": "AF113", "outras": "B123", "optel": "AE129"}, "choice": {"estab_tipo": {"Comércio": "S43", "Indústria": "S44", "Armazém": "S45", "Interface marítimo": "S46", "Interface rodoviário": "S47", "Interface ferroviário": "S48", "Aeroporto": "AA43", "Habitação": "AA44", "Escritórios": "AA45", "Saúde": "AA46", "Escola": "AA47", "Lar": "AA48", "Outro": "AE43"}, "vitimas": {"Sim": "N52", "Não": "Q52"}, "contentor": {"Cisterna": "K66", "Garrafas de gás comprimido": "P67", "Tambores": "L68", "Outro": "K69"}, "transporte": {"Rodoviário": "F71", "Marítimo": "K71", "Conduta (pipeline)": "T71", "Ferroviário": "F72", "Fluvial": "K72", "Aéreo": "T72"}, "fase": {"Carga": "AK70", "Descarga": "AK71", "Em Transporte": "AK72"}, "incendio": {"Sim": "H79", "Não": "K79"}, "explosao": {"Sim": "H80", "Não": "K80"}, "cheiro": {"Sim": "F86", "Não": "I86"}, "vitimas_mat": {"Sim": "K89", "Não": "N89"}, "origem_conhecida": {"Sim": "N93", "Não": "Q93"}, "reg_explosao": {"Sim": "K95", "Não": "N95"}, "reg_ataque": {"Sim": "R96", "Não": "U96"}, "ameaca_bomba": {"Sim": "N97", "Não": "Q97"}, "tipo_chamada": {"Local": "J101", "Regional": "J102", "Nacional": "J103", "Móvel": "J104", "Internacional": "J105"}, "voz": {"Forte": "Z101", "Suave": "Z102", "Aguda": "Z103", "Rouca": "Z104", "Agradável": "Z105", "Denotada Embriaguez": "Z106"}, "sexo": {"Feminino": "@AC101:AD101", "Masculino": "@AE101:AG101"}, "sotaque": {"Local": "J107", "Regional": "J108", "Outros": "J109", "Estrangeiro": "O107", "Étnico": "O108"}, "modo": {"Calmo": "Z107", "Racional": "Z108", "Coerente": "Z109", "Deliberado": "Z110", "Direto": "Z111", "Correto": "Z112", "Irritante": "AK107", "Irracional": "AK108", "Incoerente": "AK109", "Emocional": "AK110"}, "sons": {"Barulho": "O113", "Silêncio": "O114", "Misturado": "O115", "Comboio": "O116", "Música": "O117", "Vozes": "O118", "Cozinha": "Z113", "Aeronaves": "Z114", "Animais": "Z115", "Máquinas": "Z116", "Tráfego de rua": "Z117", "Reunião de rua": "Z118", "Outros": "Z119"}}, "rows": {}}, "nrbq_fr": {"text": {"ocorrencia": "AG12", "data_hora": "AG14", "data_inc": "G27", "hora_inc": "Y27", "data_obs": "M28", "hora_obs": "AE28", "local": "K29", "referencia": "I30", "coordenadas": "M31", "estrada": "H36", "arruamento": "AB36", "ferrovia": "K37", "outra_ref": "I38", "localidade": "L39", "estab_id": "K43", "estab_morada": "U43", "estab_outro": "AC47", "nome_comum": "F53", "descricao_visual": "S54", "onu": "E54", "perigo": "E55", "etiquetas": "J56", "quantidade": "H57", "cisterna_m3": "K58", "garrafas_l": "P59", "tambores_l": "L60", "contentor_outro": "V59", "derrame": "N70", "fuga": "N71", "espalhamento": "O72", "outra_info": "J75", "cheiro_tipo": "Z80", "cor_derrame": "G81", "origem_fuga": "G82", "origem_qual": "F88", "n_vitimas": "AB95", "sintomas": "J96", "n_mortos": "U96", "det_nr_info": "L102", "det_b_info": "L103", "det_q_info": "L104", "vento_kmh": "AI116", "ceu": "G117", "temperatura": "Y117", "outras": "B122", "optel": "AE131"}, "choice": {"estab_tipo": {"Comércio": "S44", "Indústria": "S45", "Armazém": "S46", "Interface marítimo": "S47", "Interface rodoviário": "S48", "Interface ferroviário": "S49", "Aeroporto": "AA44", "Habitação": "AA45", "Escritórios": "AA46", "Saúde": "AA47", "Escola": "AA48", "Lar": "AA49", "Outro": "AE44"}, "contentor": {"Cisterna": "K58", "Garrafas de gás comprimido": "P59", "Tambores": "L60", "Outro": "K61"}, "transporte": {"Rodoviário": "F65", "Marítimo": "K65", "Conduta (pipeline)": "T65", "Ferroviário": "F66", "Fluvial": "K66", "Aéreo": "T66"}, "fase": {"Carga": "AK64", "Descarga": "AK65", "Em Transporte": "AK66"}, "incendio": {"Sim": "H73", "Não": "K73"}, "explosao": {"Sim": "H74", "Não": "K74"}, "cheiro": {"Sim": "F80", "Não": "I80"}, "vitimas_mat": {"Sim": "K83", "Não": "N83"}, "origem_conhecida": {"Sim": "N87", "Não": "Q87"}, "reg_explosao": {"Sim": "K89", "Não": "N89"}, "reg_ataque": {"Sim": "R90", "Não": "U90"}, "ameaca_bomba": {"Sim": "N91", "Não": "Q91"}, "vitimas": {"Sim": "N95", "Não": "Q95"}, "equip_detecao": {"Sim": "Q100", "Não": "S100"}, "agentes_equip": {"NR": "AD100", "B": "AF100", "Q": "AH100"}, "det_nr": {"Sim": "G102", "Não": "I102"}, "det_b": {"Sim": "G103", "Não": "I103"}, "det_q": {"Sim": "G104", "Não": "I104"}, "vento_dir": {"Norte": "@K116:L116", "Sul": "@M116:N116", "Este": "@O116:P116", "Oeste": "@Q116:S116"}, "vento_int": {"Fraco": "@X116:Z116", "Moderado": "@AA116:AD116", "Forte": "@AE116:AF116"}, "precipitacao": {"Sim": "H118", "Não": "K118"}}, "rows": {"eras": {"start": 18, "max": 6, "cols": {"org": "I", "nome": "R", "idade": "AD", "id": "AH"}}, "medicoes": {"start": 108, "max": 5, "cols": {"dh": "B", "tipo": "F", "coord": "J", "equip": "Q", "res": "AC", "un": "AH"}}}}, "nrbq_fi": {"text": {"ocorrencia": "AG12", "fi_n": "AG14", "data_hora": "AG16", "equipa": "J20", "vento_kmh": "AI54", "ceu": "G55", "temperatura": "Y55", "info": "B64", "optel": "AE129"}, "choice": {"det_nr": {"Sim": "G38", "Não": "I38"}, "det_b": {"Sim": "G39", "Não": "I39"}, "det_q": {"Sim": "G40", "Não": "I40"}, "vento_dir": {"Norte": "@K54:L54", "Sul": "@M54:N54", "Este": "@O54:P54", "Oeste": "@Q54:S54"}, "vento_int": {"Fraco": "@X54:Z54", "Moderado": "@AA54:AD54", "Forte": "@AE54:AF54"}, "precipitacao": {"Sim": "H56", "Não": "K56"}}, "rows": {"elementos": {"start": 22, "max": 10, "cols": {"org": "I", "nome": "R", "idade": "AD", "id": "AH"}}, "medicoes": {"start": 44, "max": 7, "cols": {"dh": "B", "tipo": "F", "coord": "K", "equip": "P", "res": "AC", "un": "AH"}}}}};
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
            const v = nrbqFmt(r[ck]);
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

    /* ---------- C) dentro do handler, antes de "// ===== EMAIL =====" ---------- */
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
