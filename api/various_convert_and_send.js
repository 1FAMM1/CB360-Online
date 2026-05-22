    import ExcelJS from "exceljs";
    import fetch from "node-fetch";
    import fs from "fs";
    import os from "os";
    import path from "path";
    import nodemailer from "nodemailer";
    import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult} from "@adobe/pdfservices-node-sdk";
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
                      };
    const ALWAYS_TO = ["comando0805.ahbfaro@gmail.com", "central0805.ahbfaro@gmail.com"];
    const ALWAYS_TO_ATTENDANCE2 = ["comandante.faroahb@gmail.com", "comando0805.ahbfaro@gmail.com", "central0805.ahbfaro@gmail.com"];
    const ALWAYS_TO_ATTENDANCE = ["fmartins.ahbfaro@gmail.com"];
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
        const pdfServices = new PDFServices({credentials});
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
    // ===== MAIN HANDLER =====
    export default async function handler(req, res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") return res.status(200).end();
      if (req.method !== "POST") return res.status(405).json({success: false, error: "Método não permitido"});
      try {
        const {type, data} = req.body;
        // ===== PDF HANDLERS =====
        const {PDFDocument} = await import("pdf-lib");
        const mergedPdf = await PDFDocument.create();
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
                      Rua Comandante Francisco Manuel, 7 a 13 | 8000-250 Faro | Portugal<br>
                      Telem.: +351 917 629 626 | Telef: +351 289 803 066
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
          try {
            await transporter.sendMail({
              from: `"CB360 Online" <${process.env.GMAIL_EMAIL}>`,
              to: ALWAYS_TO_ATTENDANCE,
              subject: `Lista de Comparências - ${eventName}`,
              html: htmlAttendanceTemplate,
              attachments: [{filename: fileName, content: Buffer.from(finalPdf), contentType: "application/pdf"}],
            });
            console.log("✅ Email de comparências enviado com sucesso para:", ALWAYS_TO_ATTENDANCE);
          } catch (emailErr) {
            console.error("❌ Erro ao enviar email:", emailErr);
          }
          const dateToday = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
          return res.status(200).send(Buffer.from(finalPdf));
        }
        // ===== EMAIL =====
        if (type === "email") {
          const {to, subject, message, corpOperNr, corpName, logoUrl, senderName, isBulk, cc, attachment} = data;
          if (!to || !subject || !message) return res.status(400).json({success: false, error: "Campos obrigatórios em falta"});
          const senderDisplayName = `CB360 Online - ${corpOperNr || "Corporação"}`;
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
                  <p>Mensagem Enviada via CB360 Online</p>
                </div>
                <div class="email-body">
                  <div class="message-box">${message}</div>
                  <div style="margin-top:10px; margin-bottom:10px; font-size:14px; color:#1e293b;">
                    Com os melhores cumprimentos,
                  </div>
                  <div class="signature-section">
                    <div class="signature-user">${senderName}</div>
                    <div class="signature-corp">${corpName}</div>
                    <div class="signature-contacts">
                      Rua Comandante Francisco Manuel, 7 a 13 | 8000-250 Faro | Portugal<br>
                      Telem.: +351 917 629 626 | Telef: +351 289 803 066
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
          if (isBulk && Array.isArray(cc)) {
            mailOptions.to = ALWAYS_TO;
            mailOptions.cc = cc;
          } else {
            mailOptions.to = to;
            mailOptions.cc = "central0805.ahbfaro@gmail.com";
          }
          if (attachment) {
            mailOptions.attachments = [{
              filename: attachment.filename,
              content: attachment.content,
              encoding: "base64",
            }];
          }
          await transporter.sendMail(mailOptions);
          return res.status(200).json({success: true, message: "Processado com sucesso!"});
        }
      } catch (err) {
        res.status(500).json({error: "Erro", details: err.message});
      }
    }
