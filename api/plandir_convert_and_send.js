    /*************************************************************************
    * * 🟦 CB360 ONLINE - API ENGINE
    * 🚀 Desenvolvido por: [Fábio Martins / Sistemas de Informação]
    * 📅 Ano: 2023 - 2026
    * * Descrição: Handler principal para geração de Planeamentos Diários
    * com integração ExcelJS, Adobe PDF Services e Mailer.
    * *************************************************************************/
    import ExcelJS from "exceljs";
    import nodemailer from "nodemailer";
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFResult, CreatePDFJob,}
    from "@adobe/pdfservices-node-sdk";
    const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
    const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    export const config = {
      api: {bodyParser: {sizeLimit: '10mb',},},
    };
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
                🌱 <strong>Antes de imprimir este e-mail pense bem se é mesmo necessário.</strong> Poupe eletricidade, toner e papel.
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
    async function convertXLSXToPDF(xlsxBuffer, fileName) {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Erro de Configuração Adobe: As chaves não estão definidas.");
      }
      const inputFilePath = `/tmp/${fileName}_input_${Date.now()}.xlsx`;
      fs.writeFileSync(inputFilePath, xlsxBuffer);
      let pdfBuffer = null;
      try {
        const credentials = new ServicePrincipalCredentials({clientId: CLIENT_ID, clientSecret: CLIENT_SECRET});
        const pdfServices = new PDFServices({credentials});
        const inputAsset = await pdfServices.upload({
          readStream: fs.createReadStream(inputFilePath),
          mimeType: MimeType.XLSX
        });
        const job = new CreatePDFJob({inputAsset});
        const pollingURL = await pdfServices.submit({job});
        const pdfServicesResponse = await pdfServices.getJobResult({pollingURL, resultType: CreatePDFResult});
        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({asset: resultAsset});
        const chunks = [];
        await new Promise((resolve, reject) => {
          streamAsset.readStream.on('data', (chunk) => chunks.push(chunk));
          streamAsset.readStream.on('end', resolve);
          streamAsset.readStream.on('error', reject);
        });
        pdfBuffer = Buffer.concat(chunks);
      } catch (error) {
        console.error('Erro na API da Adobe:', error);
        throw new Error('Falha na conversão XLSX para PDF. Verifique as credenciais e o limite de uso da Adobe.');
      } finally {
        try {
          if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        } catch(e) {
          console.warn("Falha na limpeza de ficheiros temporários:", e);
        }
      }
      return pdfBuffer;
    }
    export default async function handler(req, res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.status(200).end();
      try {
        const {shift, date, tables, recipients, ccRecipients, bccRecipients, emailBody, logoUrl, corpName} = req.body || {};
        if (!shift || !date || !tables || !recipients || recipients.length === 0) {
          return res.status(400).json({
            error: "Faltam dados essenciais ou a lista de destinatários principais está vazia.",
            details: "Certifique-se que todos os dados do planeamento e destinatários 'TO' foram enviados."
          });
        }
        const response = await fetch("https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/planeamento_template.xlsx");
        const baseBuffer = Buffer.from(await response.arrayBuffer());
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(baseBuffer);
        const sheet = workbook.getWorksheet(1);
        const [year, month, day] = date.split("-");
        const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
        const monthName = monthNames[parseInt(month, 10) - 1] || month;
        const formattedDate = `${day} ${monthName} ${year}`;
        const shiftHours = shift === "D" ? "08:00-20:00" : "20:00-08:00";
        const compactDate = year + month.padStart(2, '0') + day.padStart(2, '0');
        const fileAndSubjectSuffix = `${compactDate} Turno ${shift}`;
        const finalFileName = `Planeamento Diário ${fileAndSubjectSuffix}`;
        sheet.getCell("B14").value = `Dia: ${formattedDate} | Turno ${shift} | ${shiftHours}`;
        const tableStartRows = {"OFOPE": 19, "CHEFE DE SERVIÇO": 24, "OPTEL": 29, "EQUIPA 01": 34, "EQUIPA 02": 43, "LOGÍSTICA": 52, "INEM": 58, "INEM - Reserva": 65, "SERVIÇO GERAL": 72,};
        for (let tbl of tables) {
          const startRow = tableStartRows[tbl.title];
          if (!startRow) continue;
          for (let i = 0; i < tbl.rows.length; i++) {
            const rowData = tbl.rows[i];
            const rowNum = startRow + i;
            sheet.getCell(`B${rowNum}`).value = rowData.n_int || "";
            sheet.getCell(`C${rowNum}`).value = rowData.patente || "";
            sheet.getCell(`D${rowNum}`).value = rowData.nome || "";
            sheet.getCell(`E${rowNum}`).value = rowData.entrada || "";
            sheet.getCell(`F${rowNum}`).value = rowData.saida || "";
            sheet.getCell(`G${rowNum}`).value = rowData.MP ? "X" : "";
            sheet.getCell(`H${rowNum}`).value = rowData.TAS ? "X" : "";
            sheet.getCell(`I${rowNum}`).value = rowData.obs || "";
          }
        }
        sheet.pageSetup = {orientation: 'portrait', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, verticalCentered: true,
                           margins: {left: 0.059, right: 0.059, top: 0.25, bottom: 0.25, header: 0.1, footer: 0.1}};
        const finalXLSXBuffer = await workbook.xlsx.writeBuffer();
        const pdfBuffer = await convertXLSXToPDF(finalXLSXBuffer, finalFileName);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD}
        });
        const htmlEmail = buildEmailTemplate({
          title: corpName || "",
          subtitle: `Planeamento Diário - Turno ${shift} | ${formattedDate}`,
          logoUrl: logoUrl || "",
          emailBody: emailBody || "",
          corpName: corpName || ""
        });
        await transporter.sendMail({
          from: GMAIL_EMAIL,
          to: recipients.join(', '),
          cc: ccRecipients && ccRecipients.length > 0 ? ccRecipients.join(', ') : '',
          bcc: bccRecipients && bccRecipients.length > 0 ? bccRecipients.join(', ') : '',
          subject: `Planeamento Diário ${fileAndSubjectSuffix}`,
          html: htmlEmail,
          text: 'Segue em anexo o documento de planeamento.',
          attachments: [{filename: `${finalFileName}.pdf`, content: pdfBuffer, contentType: 'application/pdf'}]
        });
        return res.status(200).json({
          success: true,
          message: `PDF gerado e enviado com sucesso para ${recipients.length} destinatário(s).`
        });
      } catch (err) {
        console.error("Erro no processo de conversão/envio:", err);
        return res.status(500).json({
          error: "Erro no processo de geração e envio de email",
          details: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      }
    }
