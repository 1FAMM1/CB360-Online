// pages/api/moa_convert_and_send.js
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import fs from "fs";
import https from "https";
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
// template MOA no teu repo
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/moa_template.xlsx";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb", // aumentar se necessário
    },
  },
};

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
    throw new Error("Erro de Configuração Adobe: As chaves não estão definidas.");
  }

  const inputFilePath = `/tmp/${fileName}_input_${Date.now()}.xlsx`;
  fs.writeFileSync(inputFilePath, xlsxBuffer);

  try {
    const credentials = new ServicePrincipalCredentials({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType: MimeType.XLSX,
    });

    const job = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult,
    });
    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    const chunks = [];
    await new Promise((resolve, reject) => {
      streamAsset.readStream.on("data", (chunk) => chunks.push(chunk));
      streamAsset.readStream.on("end", resolve);
      streamAsset.readStream.on("error", reject);
    });
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Erro na API da Adobe:", error);
    throw new Error("Falha na conversão XLSX para PDF.");
  } finally {
    try {
      if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
    } catch (e) {
      console.warn("Falha na limpeza de ficheiros temporários:", e);
    }
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { data, recipients, ccRecipients, bccRecipients, emailBody, emailSubject } = req.body || {};

    if (!data || !recipients || recipients.length === 0) {
      return res.status(400).json({
        error: "Faltam dados essenciais ou a lista de destinatários principais está vazia.",
      });
    }

    // A. carregar template e preencher
    const templateBuffer = await downloadTemplate(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    // Mapeamento das células conforme o teu pedido
    sheet.getCell("L9").value = data.moa_device_type || "";
    sheet.getCell("L11").value = data.moa_cb || ""; // moa_cb
    sheet.getCell("L13").value = data.moa_epe_type || "";
    sheet.getCell("L15").value = data.moa_gdh_init || "";
    sheet.getCell("O15").value = data.moa_gdh_end || "";

    // Checkboxes -> marca X nas células correspondentes
    sheet.getCell("E23").value = data.moa_eco ? "X" : "";
    sheet.getCell("E26").value = data.moa_ned ? "X" : "";
    sheet.getCell("E29").value = data.moa_oco ? "X" : "";
    sheet.getCell("E32").value = data.moa_era ? "X" : "";
    sheet.getCell("E35").value = data.moa_eob ? "X" : "";
    sheet.getCell("E38").value = data.moa_rsc ? "X" : "";
    sheet.getCell("E41").value = data.moa_mef ? "X" : "";

    // MOA ECO
    sheet.getCell("I22").value = data.moa_eco_sit || "";
    sheet.getCell("L22").value = data.moa_eco_pront || "";
    sheet.getCell("P22").value = data.moa_eco_observ || "";

    // MOA NED
    sheet.getCell("I25").value = data.moa_ned_sit || "";
    sheet.getCell("L25").value = data.moa_ned_pront || "";
    sheet.getCell("P25").value = data.moa_ned_observ || "";

    // MOA OCO
    sheet.getCell("I28").value = data.moa_oco_sit || "";
    sheet.getCell("L28").value = data.moa_oco_pront || "";
    sheet.getCell("P28").value = data.moa_oco_observ || "";

    // MOA ERA
    sheet.getCell("I31").value = data.moa_era_sit || "";
    sheet.getCell("L31").value = data.moa_era_pront || "";
    sheet.getCell("P31").value = data.moa_era_observ || "";

    // MOA EOB
    sheet.getCell("I34").value = data.moa_eob_sit || "";
    sheet.getCell("L34").value = data.moa_eob_pront || "";
    sheet.getCell("P34").value = data.moa_eob_observ || "";

    // MOA RSC
    sheet.getCell("I37").value = data.moa_rsc_sit || "";
    sheet.getCell("L37").value = data.moa_rsc_pront || "";
    sheet.getCell("P37").value = data.moa_rsc_observ || "";

    // MOA MEF
    sheet.getCell("I40").value = data.moa_mef_sit || "";
    sheet.getCell("L40").value = data.moa_mef_pront || "";
    sheet.getCell("P40").value = data.moa_mef_observ || "";

    // Reforço Equipas (REIE)
    sheet.getCell("D48").value = data.moa_reie_type_01 || "";
    sheet.getCell("I48").value = data.moa_reie_time_01 || "";
    sheet.getCell("L48").value = data.moa_reie_nop_01 || "";
    sheet.getCell("P48").value = data.moa_reie_obs_01 || "";

    sheet.getCell("D49").value = data.moa_reie_type_02 || "";
    sheet.getCell("I49").value = data.moa_reie_time_02 || "";
    sheet.getCell("L49").value = data.moa_reie_nop_02 || "";
    sheet.getCell("P49").value = data.moa_reie_obs_02 || "";

    sheet.getCell("D50").value = data.moa_reie_type_03 || "";
    sheet.getCell("I50").value = data.moa_reie_time_03 || "";
    sheet.getCell("L50").value = data.moa_reie_nop_03 || "";
    sheet.getCell("P50").value = data.moa_reie_obs_03 || "";

    // Outras
    sheet.getCell("D56").value = data.moa_otr_type_01 || "";
    sheet.getCell("I56").value = data.moa_otr_time_01 || "";
    sheet.getCell("O56").value = data.moa_otr_obs_01 || "";

    sheet.getCell("D57").value = data.moa_otr_type_02 || "";
    sheet.getCell("I57").value = data.moa_otr_time_02 || "";
    sheet.getCell("O57").value = data.moa_otr_obs_02 || "";

    sheet.getCell("D58").value = data.moa_otr_type_03 || "";
    sheet.getCell("I58").value = data.moa_otr_time_03 || "";
    sheet.getCell("O58").value = data.moa_otr_obs_03 || "";

    // OPTEL / signature-like field (se existir no template)
   

     sheet.pageSetup = {
  orientation: "portrait",
  paperSize: 9,       // A4
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 1,     // força altura em 1 página
  horizontalCentered: true,
  verticalCentered: false, // evita deslocamento estranho
  margins: {
    left: 0.5,
    right: 0.5,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  },
};


    // Construir nome do ficheiro
     const deviceSafe = (data.moa_device_type || data.moa_cb || "MOA").replace(/\s+/g, "_");
    const gdhInit = data.moa_gdh_init || "";
    const gdhEnd = data.moa_gdh_end || "";
    const fileName = `MOA_${deviceSafe}_de_${gdhInit}_a_${gdhEnd}_0805`;

    const xlsxBuffer = await workbook.xlsx.writeBuffer();

    // B. converter para PDF
    const pdfBuffer = await convertXLSXToPDF(xlsxBuffer, fileName);

    // C. enviar por email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: GMAIL_EMAIL,
      to: recipients.join(", "),
      cc: ccRecipients && ccRecipients.length > 0 ? ccRecipients.join(", ") : "",
      bcc: bccRecipients && bccRecipients.length > 0 ? bccRecipients.join(", ") : "",
      subject: emailSubject || `MOA – ${data.moa_cb || data.moa_device_type || ""}`,
      html:
        emailBody ||
        `<p>Segue em anexo a MOA.</p><p>OPTEL<br>${data.moa_optel || ""}</p>`,
      text: "Segue em anexo a MOA.",
      attachments: [
        {
          filename: `${fileName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: `MOA gerada e enviada com sucesso para ${recipients.length} destinatário(s).`,
    });
  } catch (err) {
    console.error("Erro no processo MOA:", err);
    return res.status(500).json({
      error: "Erro no processo de geração e envio da MOA",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}
