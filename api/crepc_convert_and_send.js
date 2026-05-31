    /*************************************************************************
    * * 🟦 CB360 ONLINE - API ENGINE
    * 🚀 Desenvolvido por: [Fábio Martins / Sistemas de Informação]
    * 📅 Ano: 2023 - 2026
    * * Descrição: Handler principal para geração de relatórios MOA e SITOP
    * com integração ExcelJS, Adobe PDF Services e Mailer.
    * *************************************************************************/
    import ExcelJS from "exceljs";
    import nodemailer from "nodemailer";
    import fs from "fs";
    import https from "https";
    import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFResult, CreatePDFJob,}
    from "@adobe/pdfservices-node-sdk";
    const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
    const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    const TEMPLATES = {moa: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/moa_template.xlsx",
                       sitop: "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/sitop_template.xlsx",
                      };
    export const config = {api: {bodyParser: {sizeLimit: "10mb"}},};
    // Template HTML partilhado
    function buildEmailTemplate({title, subtitle, logoUrl, emailBody, corpName}) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; color: #333333;}
            .email-container {max-width: 1200px; margin: 25px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);}
            .email-header {background: linear-gradient(135deg, #a70c0c 0%, #d81c1c 50%, #b91010 100%); padding: 15px 20px; text-align: center; color: #ffffff;}
            .brand-logo {max-height: 75px; width: auto; margin-bottom: 12px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));}
            .email-header h2 {margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.4;}
            .email-header p {margin: 6px 0 0 0; font-size: 13px; color: #fecaca; opacity: 0.9;}
            .email-body {padding: 15px 10px; line-height: 1.6; font-size: 14px;}
            .message-box {background-color: #f8fafc; border-left: 4px solid #d81c1c; padding: 20px; margin: 0 0 25px 0; border-radius: 0 6px 6px 0; white-space: pre-line; color: #1e293b; font-size: 14.5px;}
            .signature-section {margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 13px; color: #475569;}
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
              ${logoUrl ? `<img src="${logoUrl}" alt="Logotipo" class="brand-logo" height="100" style="height: 100px; max-height: 100px;" />` : ""}
              <h2>${title || ""}</h2>
              <p>${subtitle || ""}</p>
            </div>
            <div class="email-body">
              <div class="message-box">${emailBody || ""}</div>
              <div class="signature-section">
                <div class="signature-corp">${corpName || ""}</div>
                <div class="signature-contacts">
                  Rua Comandante Francisco Manuel, 7 a 13 | 8000-250 Faro | Portugal<br>
                  Telem.: +351 917 629 626 | Telef: +351 289 803 066
                </div>
              </div>
              <div class="eco-note">
                Antes de imprimir este e-mail pense bem se e mesmo necessario. Poupe eletricidade, toner e papel.
              </div>
              <div class="confidentiality-note">
                <strong>AVISO DE CONFIDENCIALIDADE:</strong><br>
                Esta mensagem e quaisquer anexos, podem conter informacao confidencial para uso exclusivo do destinatario. Cabe ao destinatario assegurar a verificacao de virus e outras medidas que assegurem que esta mensagem nao afeta os seus sistemas. Se nao for o destinatario, nao devera usar, distribuir ou copiar este email, devendo proceder a sua eliminacao e informar o emissor. E estritamente proibido o uso, a distribuicao, a copia ou qualquer forma de disseminacao nao autorizada deste email e dos seus anexos. Obrigado.
              </div>
            </div>
            <div class="email-footer">
              &copy; 2023 - ${new Date().getFullYear()} CB360 Online - Todos os direitos reservados.
            </div>
          </div>
        </body>
        </html>
      `;
    }
    // Helpers partilhados
    async function downloadTemplate(url) {
      return new Promise((resolve, reject) => {
        https.get(url, (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks)));
          response.on("error", reject);
        }).on("error", reject);
      });
    }
    async function convertXLSXToPDF(xlsxBuffer, fileName) {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Erro de Configuracao Adobe: As chaves nao estao definidas.");
      }
      const inputFilePath = `/tmp/${fileName}_input_${Date.now()}.xlsx`;
      fs.writeFileSync(inputFilePath, xlsxBuffer);
      try {
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const inputAsset = await pdfServices.upload({readStream: fs.createReadStream(inputFilePath), mimeType: MimeType.XLSX});
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const pdfServicesResponse = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({asset: resultAsset});
        const chunks = [];
        await new Promise((resolve, reject) => {
          streamAsset.readStream.on("data", (chunk) => chunks.push(chunk));
          streamAsset.readStream.on("end", resolve);
          streamAsset.readStream.on("error", reject);
        });
        return Buffer.concat(chunks);
      } catch (error) {
        console.error("Erro na API da Adobe:", error);
        throw new Error("Falha na conversao XLSX para PDF.");
      } finally {
        try { if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath); } catch (e) {
          console.warn("Falha na limpeza de ficheiros temporarios:", e);
        }
      }
    }
    // Handler MOA
    async function handleMOA(req, res) {
      const {data, recipients, ccRecipients, bccRecipients, emailBody, emailSubject} = req.body || {};
      if (!data || !recipients || recipients.length === 0) {
        return res.status(400).json({error: "Faltam dados essenciais ou a lista de destinatarios principais esta vazia."});
      }
      const templateBuffer = await downloadTemplate(TEMPLATES.moa);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      const sheet = workbook.worksheets[0];
      sheet.getCell("L9").value  = data.moa_device_type || '';
      sheet.getCell("L11").value = data.moa_cb || '';
      sheet.getCell("L13").value = data.moa_epe_type || '';
      sheet.getCell("L15").value = data.moa_gdh_init || '';
      sheet.getCell("O15").value = data.moa_gdh_end || '';
      sheet.getCell("E23").value = data.moa_eco ? "X" : '';
      sheet.getCell("E26").value = data.moa_ned ? "X" : '';
      sheet.getCell("E29").value = data.moa_oco ? "X" : '';
      sheet.getCell("E32").value = data.moa_era ? "X" : '';
      sheet.getCell("E35").value = data.moa_eob ? "X" : '';
      sheet.getCell("E38").value = data.moa_rsc ? "X" : '';
      sheet.getCell("E41").value = data.moa_mef ? "X" : '';
      sheet.getCell("I22").value = data.moa_eco_sit || '';
      sheet.getCell("L22").value = data.moa_eco_pront || '';
      sheet.getCell("P22").value = data.moa_eco_observ || '';
      sheet.getCell("I25").value = data.moa_ned_sit || '';
      sheet.getCell("L25").value = data.moa_ned_pront || '';
      sheet.getCell("P25").value = data.moa_ned_observ || '';
      sheet.getCell("I28").value = data.moa_oco_sit || '';
      sheet.getCell("L28").value = data.moa_oco_pront || '';
      sheet.getCell("P28").value = data.moa_oco_observ || '';
      sheet.getCell("I31").value = data.moa_era_sit || '';
      sheet.getCell("L31").value = data.moa_era_pront || '';
      sheet.getCell("P31").value = data.moa_era_observ || '';
      sheet.getCell("I34").value = data.moa_eob_sit || '';
      sheet.getCell("L34").value = data.moa_eob_pront || '';
      sheet.getCell("P34").value = data.moa_eob_observ || '';
      sheet.getCell("I37").value = data.moa_rsc_sit || '';
      sheet.getCell("L37").value = data.moa_rsc_pront || '';
      sheet.getCell("P37").value = data.moa_rsc_observ || '';
      sheet.getCell("I40").value = data.moa_mef_sit || '';
      sheet.getCell("L40").value = data.moa_mef_pront || '';
      sheet.getCell("P40").value = data.moa_mef_observ || '';
      sheet.getCell("D48").value = data.moa_reie_type_01 || '';
      sheet.getCell("I48").value = data.moa_reie_time_01 || '';
      sheet.getCell("L48").value = data.moa_reie_nop_01 || '';
      sheet.getCell("P48").value = data.moa_reie_obs_01 || '';
      sheet.getCell("D49").value = data.moa_reie_type_02 || '';
      sheet.getCell("I49").value = data.moa_reie_time_02 || '';
      sheet.getCell("L49").value = data.moa_reie_nop_02 || '';
      sheet.getCell("P49").value = data.moa_reie_obs_02 || '';
      sheet.getCell("D50").value = data.moa_reie_type_03 || '';
      sheet.getCell("I50").value = data.moa_reie_time_03 || '';
      sheet.getCell("L50").value = data.moa_reie_nop_03 || '';
      sheet.getCell("P50").value = data.moa_reie_obs_03 || '';
      sheet.getCell("D56").value = data.moa_otr_type_01 || '';
      sheet.getCell("I56").value = data.moa_otr_time_01 || '';
      sheet.getCell("O56").value = data.moa_otr_obs_01 || '';
      sheet.getCell("D57").value = data.moa_otr_type_02 || '';
      sheet.getCell("I57").value = data.moa_otr_time_02 || '';
      sheet.getCell("O57").value = data.moa_otr_obs_02 || '';
      sheet.getCell("D58").value = data.moa_otr_type_03 || '';
      sheet.getCell("I58").value = data.moa_otr_time_03 || '';
      sheet.getCell("O58").value = data.moa_otr_obs_03 || '';
      sheet.pageSetup = {orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1, horizontalCentered: true, verticalCentered: false,
                         margins: {left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3},};
      const deviceSafe = (data.moa_device_type || data.moa_cb || "MOA").replace(/\s+/g, "_");
      const gdhInit = data.moa_gdh_init || '';
      const gdhEnd  = data.moa_gdh_end  || '';
      const fileName = `MOA_${deviceSafe}_de_${gdhInit}_a_${gdhEnd}_${data.corp_oper_nr}`;
      const xlsxBuffer = await workbook.xlsx.writeBuffer();
      const pdfBuffer  = await convertXLSXToPDF(xlsxBuffer, fileName);
      const transporter = nodemailer.createTransport({service: "gmail", auth: {user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD}});
      const corpName = data.moa_cb?.includes(" - ") ? data.moa_cb.split(" - ").slice(1).join(" - ") : data.moa_cb || data.moa_device_type || "";
      const htmlEmail = buildEmailTemplate({title: corpName, subtitle: "Modulo de Ocorrencias e Avarias", logoUrl: data.logoUrl || "", emailBody: emailBody || `<p>Segue em anexo a MOA.</p>`, corpName,});
      await transporter.sendMail({from: `"SALOC ${data.corp_oper_nr || "Corporacao"}" <${GMAIL_EMAIL}>`, to: recipients.join(", "), cc: ccRecipients && ccRecipients.length  > 0 ? ccRecipients.join(", ")  : "",
                                  bcc: bccRecipients && bccRecipients.length > 0 ? bccRecipients.join(", ") : "", subject: emailSubject || `MOA - ${data.moa_cb || data.moa_device_type || ""}`,
                                  html: htmlEmail, text: "Segue em anexo a MOA.", attachments: [{filename: `${fileName}.pdf`, content: pdfBuffer, contentType: "application/pdf"}],
                                 });
      return res.status(200).json({success: true, message: `MOA gerada e enviada com sucesso para ${recipients.length} destinatario(s).`});
    }
    // Handler SITOP
    async function handleSITOP(req, res) {
      const {data, recipients, ccRecipients, bccRecipients, emailBody, emailSubject} = req.body || {};
      if (!data || !recipients || recipients.length === 0) {
        return res.status(400).json({error: "Faltam dados essenciais ou a lista de destinatarios principais esta vazia."});
      }
      const templateBuffer = await downloadTemplate(TEMPLATES.sitop);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      const sheet = workbook.worksheets[0];
      sheet.getCell("F11").value = data.cb_type || '';
      sheet.getCell("S11").value = data.vehicle || '';
      sheet.getCell("E17").value = data.registration || '';
      sheet.getCell("B17").value = data.gdh_inop || '';
      sheet.getCell("O14").value = data.failure_type || '';
      sheet.getCell("K16").value = data.failure_description ? `Descricao: ${data.failure_description}` : '';
      sheet.getCell("H17").value = data.failure_noc || '';
      sheet.getCell("G30").value = data.gdh_op || '';
      sheet.getCell("E41").value = data.optel || '';
      if (data.ppi_part) {sheet.getCell("R20").value = 'X'; sheet.getCell("T20").value = '';}
      else {sheet.getCell("R20").value = '';  sheet.getCell("T20").value = 'X';}
      sheet.getCell("O23").value = data.ppi_airport ? 'X' : '';
      sheet.getCell("O26").value = data.ppi_a22 ? 'X' : '';
      sheet.getCell("O29").value = data.ppi_a2 ? 'X' : '';
      sheet.getCell("O32").value = data.ppi_linfer ? 'X' : '';
      sheet.getCell("O35").value = data.ppi_airfield ? 'X' : '';
      if (data.ppi_subs) {sheet.getCell("R38").value = 'X'; sheet.getCell("T38").value = '';}
      else {sheet.getCell("R38").value = '';  sheet.getCell("T38").value = 'X';}
      sheet.pageSetup = {orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, verticalCentered: true,
                         margins: {left: 0.059, right: 0.059, top: 0.25, bottom: 0.25, header: 0.1, footer: 0.1},};
      const prefix = (!data.gdh_op || data.gdh_op.trim() === '') ? 'INOP' : 'OP';
      const fileName = `${prefix}_${data.vehicle}_${data.corp_oper_nr}`;
      const xlsxBuffer = await workbook.xlsx.writeBuffer();
      const pdfBuffer = await convertXLSXToPDF(xlsxBuffer, fileName);
      const transporter = nodemailer.createTransport({service: "gmail", auth: {user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD}});
      const corpName = data.cb_type?.includes(" - ") ? data.cb_type.split(" - ").slice(1).join(" - ") : data.cb_type || "";
      const htmlEmail = buildEmailTemplate({title: corpName, subtitle: `Situação Operacional de Veiculos - ${prefix} ${data.vehicle}`, logoUrl: data.logoUrl || "",
                                            emailBody: emailBody || `<p>Segue em anexo o documento de Situação operacional do veiculo ${data.vehicle || ""}.</p>`, corpName,
                                           });
      await transporter.sendMail({from: `"SALOC ${data.corp_oper_nr || "Corporacao"}" <${GMAIL_EMAIL}>`, to: recipients.join(", "), cc: ccRecipients && ccRecipients.length  > 0 ? ccRecipients.join(", ")  : '',
                                  bcc: bccRecipients && bccRecipients.length > 0 ? bccRecipients.join(", ") : '', subject: emailSubject || `Situação Operacional - ${prefix} ${data.vehicle}`, html: htmlEmail,
                                  text: 'Segue em anexo o documento de Situação operacional de veiculos.',
                                  attachments: [{filename: `${fileName}.pdf`, content: pdfBuffer, contentType: 'application/pdf'}],
                                 });
      return res.status(200).json({success: true, message: `PDF gerado e enviado com sucesso para ${recipients.length} destinatario(s).`});
    }
    // Handler principal
    export default async function handler(req, res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.status(200).end();
      try {
        const {mode} = req.body || {};
        if (!mode || !["moa", "sitop"].includes(mode)) {
          return res.status(400).json({error: "Modo invalido. Use 'moa' ou 'sitop'."});
        }
        if (mode === "moa") return await handleMOA(req, res);
        if (mode === "sitop") return await handleSITOP(req, res);
      } catch (err) {
        console.error("Erro no processo:", err);
        return res.status(500).json({
          error: "Erro no processo de geracao e envio",
          details: err.message,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
      }
    }
