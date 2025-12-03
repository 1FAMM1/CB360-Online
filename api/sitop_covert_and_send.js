import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import fs from 'fs';
import https from 'https';
import { 
  ServicePrincipalCredentials, 
  PDFServices,                 
  MimeType,
  CreatePDFResult,
  CreatePDFJob,
} from "@adobe/pdfservices-node-sdk"; 

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/sitop_template.xlsx";
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', 
    },
  },
};

async function downloadTemplate(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function convertXLSXToPDF(xlsxBuffer, fileName) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Erro de Configuração Adobe: As chaves não estão definidas.");
  }    
  const inputFilePath = `/tmp/${fileName}_input_${Date.now()}.xlsx`; 
  fs.writeFileSync(inputFilePath, xlsxBuffer);
  try {
    const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const pdfServices = new PDFServices({ credentials });    
    const inputAsset = await pdfServices.upload({ 
      readStream: fs.createReadStream(inputFilePath), 
      mimeType: MimeType.XLSX 
    });        
    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });        
    const chunks = [];
    await new Promise((resolve, reject) => {
      streamAsset.readStream.on('data', (chunk) => chunks.push(chunk));
      streamAsset.readStream.on('end', resolve);
      streamAsset.readStream.on('error', reject);
    });
      return Buffer.concat(chunks);       
    } catch (error) {
      console.error('Erro na API da Adobe:', error);
      throw new Error('Falha na conversão XLSX para PDF.');
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
    const {data, recipients, ccRecipients, bccRecipients, emailBody, emailSubject} = req.body || {};        
    if (!data || !recipients || recipients.length === 0) {
      return res.status(400).json({ 
        error: "Faltam dados essenciais ou a lista de destinatários principais está vazia."
    });
  }
  const templateBuffer = await downloadTemplate(TEMPLATE_URL);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);
  const sheet = workbook.worksheets[0];
  sheet.getCell('F11').value = data.cb_type || '';
  sheet.getCell('S11').value = data.vehicle || '';
  sheet.getCell('E17').value = data.registration || '';
  sheet.getCell('B17').value = data.gdh_inop || '';
  sheet.getCell('O14').value = data.failure_type || '';
  sheet.getCell('K16').value = data.failure_description ? `Descrição: ${data.failure_description}` : '';
  sheet.getCell('G30').value = data.gdh_op || '';
  sheet.getCell('E41').value = data.optel || '';
  if (data.ppi_part) {
    sheet.getCell('R20').value = 'X';
    sheet.getCell('T20').value = '';
  } else {
    sheet.getCell('R20').value = '';
    sheet.getCell('T20').value = 'X';
  }
  sheet.getCell('O23').value = data.ppi_airport ? 'X' : '';
  sheet.getCell('O26').value = data.ppi_a22 ? 'X' : '';
  sheet.getCell('O29').value = data.ppi_a2 ? 'X' : '';
  sheet.getCell('O32').value = data.ppi_linfer ? 'X' : '';
  sheet.getCell('O35').value = data.ppi_airfield ? 'X' : '';
  if (data.ppi_subs) {
    sheet.getCell('R38').value = 'X';
    sheet.getCell('T38').value = '';
  } else {
    sheet.getCell('R38').value = '';
    sheet.getCell('T38').value = 'X';
  }
  sheet.pageSetup = {orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0,
                     horizontalCentered: true, verticalCentered: true,
                     margins: {left: 0.059, right: 0.059, top: 0.25, bottom: 0.25, header: 0.1, footer: 0.1}};
  const prefix = (!data.gdh_op || data.gdh_op.trim() === '') ? 'INOP' : 'OP';
  const fileName = `${prefix}_${data.vehicle}_${data.corp_oper_nr}`;
  const xlsxBuffer = await workbook.xlsx.writeBuffer();
  const pdfBuffer = await convertXLSXToPDF(xlsxBuffer, fileName);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_EMAIL,
      pass: GMAIL_APP_PASSWORD
    }
  });        
  await transporter.sendMail({
    from: GMAIL_EMAIL,
    to: recipients.join(', '), 
    cc: ccRecipients && ccRecipients.length > 0 ? ccRecipients.join(', ') : '', 
    bcc: bccRecipients && bccRecipients.length > 0 ? bccRecipients.join(', ') : '',
    subject: emailSubject || `Situação Operacional - ${prefix} ${data.vehicle}`,
    html: emailBody || 'Segue em anexo o documento de situação operacional de veículos.',
    text: 'Segue em anexo o documento de situação operacional de veículos.', 
    attachments: [
      {
        filename: `${fileName}.pdf`, 
        content: pdfBuffer, 
        contentType: 'application/pdf'
      }
    ]
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
