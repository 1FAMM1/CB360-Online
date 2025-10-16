import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CreatePDFJob,
  CreatePDFResult,
} from "@adobe/pdfservices-node-sdk";
import ExcelJS from "exceljs";
import fs from "fs";
import os from "os";
import path from "path";
import https from "https";

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL =
  "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/sitop_template.xlsx";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

async function downloadTemplate(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  if (!CLIENT_ID || !CLIENT_SECRET)
    return res
      .status(500)
      .json({ error: "Faltam credenciais da Adobe PDF Services" });

  const tempDir = os.tmpdir();
  let inputFilePath = null;
  let outputFilePath = null;

  try {
    const data = req.body;
    const templateBuffer = await downloadTemplate(TEMPLATE_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    // 🧾 Preenche campos principais
    sheet.getCell("P11").value = data.vehicle || "";
    sheet.getCell("E17").value = data.registration || "";
    sheet.getCell("B17").value = data.gdh_inop || "";
    sheet.getCell("O14").value = data.failure_type || "";
    sheet.getCell("K16").value = data.failure_description
      ? `Descrição: ${data.failure_description}`
      : "";
    sheet.getCell("G23").value = data.gdh_op || "";
    sheet.getCell("E28").value = data.optel || "";

    // 🟩 Marca “X” nas células conforme o estado dos checkboxes
    // ppi_part → R20 ou T20
    sheet.getCell(data.ppi_part ? "R20" : "T20").value = "X";

    // PPI locais
    if (data.ppi_airport) sheet.getCell("Q23").value = "X";
    if (data.ppi_a22) sheet.getCell("Q26").value = "X";
    if (data.ppi_a2) sheet.getCell("Q29").value = "X";
    if (data.ppi_linfer) sheet.getCell("Q32").value = "X";
    if (data.ppi_airfield) sheet.getCell("Q35").value = "X";

    // ppi_subs → R38 ou T38
    sheet.getCell(data.ppi_subs ? "R38" : "T38").value = "X";

    inputFilePath = path.join(tempDir, `sitop_${Date.now()}.xlsx`);
    outputFilePath = path.join(tempDir, `sitop_${Date.now()}.pdf`);
    await workbook.xlsx.writeFile(inputFilePath);

    // 🧠 Converte XLSX → PDF via Adobe
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

    const writeStream = fs.createWriteStream(outputFilePath);
    streamAsset.readStream.pipe(writeStream);
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const pdfBuffer = fs.readFileSync(outputFilePath);

    // 🧹 Limpa ficheiros temporários
    try {
      if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
      if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
    } catch {}

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="SITOP_${data.vehicle || "relatorio"}.pdf"`
    );
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar PDF SITOP:", error);
    return res.status(500).json({
      error: "Erro ao gerar PDF SITOP",
      details: error.message,
    });
  }
}
