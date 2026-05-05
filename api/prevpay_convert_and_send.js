    import ExcelJS from 'exceljs';
    import fs from 'fs';
    import os from 'os';
    import https from 'https';
    import nodemailer from "nodemailer";
    import {ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFResult, CreatePDFJob}
    from "@adobe/pdfservices-node-sdk";
    const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
    const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    const TEMPLATE_SIMPLIFIED = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/prevpay_simplified_template.xlsx";
    const TEMPLATE_DETAILED = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/prevpay_detailed_template.xlsx";
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
    async function convertXLSXToPDF(xlsxBuffer, fileName) {
      if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("Chaves Adobe não configuradas.");
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
    const MONTH_NAMES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    function formatDate(dataISO) {
      if (!dataISO) return '';
      const [y, m, d] = dataISO.split('-');
      return `${d}/${m}/${y}`;
    }
    function parseVal(val) {
      if (val === null || val === undefined || val === '' || val === '-') return null;
      const n = parseFloat(String(val).replace(',', '.'));
      return isNaN(n) ? null : n;
    }
    function fillSimplified(sheet, rows, year, month, globalTotal) {
      const monthName = MONTH_NAMES[parseInt(month)] || month;
      sheet.getCell('D5').value = monthName;
      sheet.getCell('F5').value = year;
      const MAX_PER_SIDE = 20;
      rows.forEach((item, idx) => {
        if (idx < MAX_PER_SIDE) {
          const rowNum = 10 + idx;
          sheet.getCell(`B${rowNum}`).value = item.n_int || '';
          sheet.getCell(`C${rowNum}`).value = item.abv_name || '';
          sheet.getCell(`D${rowNum}`).value = parseFloat(item.total) || null;
        } else {
          const rowNum = 10 + (idx - MAX_PER_SIDE);
          sheet.getCell(`F${rowNum}`).value = item.n_int || '';
          sheet.getCell(`G${rowNum}`).value = item.abv_name || '';
          sheet.getCell(`H${rowNum}`).value = parseFloat(item.total) || null;
        }
      });
      sheet.getCell('G31').value = parseFloat(globalTotal) || 0;
      const now = new Date();
      sheet.getCell('B38').value = `${now.getDate()} de ${MONTH_NAMES[now.getMonth()]} de ${now.getFullYear()}`;
      sheet.pageSetup = {orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                         margins: {left: 0.3, right: 0.7, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3}};
    }
    function fillDetailed(sheet, rows, year, month, globalTotal) {
      const monthName = MONTH_NAMES[parseInt(month)] || month;
      sheet.getCell('B5').value = `${monthName} ${year}`;
      rows.forEach((item, idx) => {
        const rowNum = 10 + idx;
        sheet.getCell(`B${rowNum}`).value = formatDate(item.service_date);
        sheet.getCell(`C${rowNum}`).value = item.service_type || '';
        sheet.getCell(`D${rowNum}`).value = item.service_local || '';
        sheet.getCell(`E${rowNum}`).value = parseVal(item.service_type_global_value);
        sheet.getCell(`F${rowNum}`).value = parseVal(item.prev_value_hour);
        sheet.getCell(`G${rowNum}`).value = parseVal(item.prev_total_hours);
        sheet.getCell(`H${rowNum}`).value = parseVal(item.prev_global_value);
        sheet.getCell(`I${rowNum}`).value = parseVal(item.service_sicks);
        sheet.getCell(`J${rowNum}`).value = parseVal(item.service_sicks_value);
        sheet.getCell(`K${rowNum}`).value = parseVal(item.service_whait_hours);
        sheet.getCell(`L${rowNum}`).value = parseVal(item.service_whait_hours_value);
        sheet.getCell(`M${rowNum}`).value = item.abv_name || '';
        sheet.getCell(`N${rowNum}`).value = parseVal(item.global_value);
      });
      sheet.getCell('N46').value = parseFloat(globalTotal) || 0;
      const lastDataRow = 10 + rows.length - 1;
      for (let r = lastDataRow + 1; r <= 66; r++) {
        sheet.getRow(r).hidden = true;
      }
      sheet.pageSetup = {orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
                         margins: {left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3}};
    }
    async function handleSendEmail(req, res) {
      const { to, cc, subject, body } = req.body || {};
      if (!to || !subject || !body) {
        return res.status(400).json({error: "Faltam dados essenciais (to, subject, body)."});
      }
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD}
        });
        await transporter.sendMail({ 
          from: `CB360 Online <${GMAIL_EMAIL}>`,
          to,
          cc,
          subject,
          html: body
        });
        return res.status(200).json({success: true, message: "Email enviado com sucesso."});
      } catch (error) {
        console.error("Erro no envio de email:", error);
        return res.status(500).json({error: "Falha ao enviar e-mail", details: error.message});
      }
    }
    async function handleGenerateReport(req, res) {
      const tempDir = os.tmpdir();
      let outputFile = null;
      const { rows, year, month, format, globalTotal, reportType } = req.body;
      if (!Array.isArray(rows)) return res.status(400).json({ error: 'Rows inválidas' });
      const isDetailed = reportType === 'Detalhado';
      const templateUrl = isDetailed ? TEMPLATE_DETAILED : TEMPLATE_SIMPLIFIED;
      const templateBuffer = await downloadTemplate(templateUrl);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      const sheet = workbook.worksheets[0];
      if (isDetailed) {
        fillDetailed(sheet, rows, year, month, globalTotal);
      } else {
        fillSimplified(sheet, rows, year, month, globalTotal);
      }
      const prefix = isDetailed ? 'prevencoes_detalhado' : 'pagamento_prevencoes';
      const safeFileName = `${prefix}_${year}_${String(month).padStart(2, '0')}`;
      if (format === 'pdf') {
        const xlsxBuffer = await workbook.xlsx.writeBuffer();
        const pdfBuffer = await convertXLSXToPDF(xlsxBuffer, safeFileName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.pdf"`);
        return res.status(200).send(pdfBuffer);
      } else {
        outputFile = `${tempDir}/${safeFileName}_${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(outputFile);
        const fileBuffer = fs.readFileSync(outputFile);
        try { fs.unlinkSync(outputFile); } catch {}
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.xlsx"`);
        return res.status(200).send(fileBuffer);
      }
    }
    export default async function handler(req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') return res.status(200).end();
      if (req.method !== 'POST') return res.status(405).json({error: 'Método não permitido'});
      try {
        const { action } = req.body || {};
        if (action === 'send-email') {
          return await handleSendEmail(req, res);
        } else if (action === 'generate-report') {
          return await handleGenerateReport(req, res);
        } else {
          return res.status(400).json({error: "Action inválida. Use 'send-email' ou 'generate-report'."});
        }
      } catch (err) {
        console.error("Erro:", err);
        return res.status(500).json({error: 'Erro interno', details: err.message});
      }
    }
