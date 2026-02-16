import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CreatePDFJob,
  CreatePDFResult,
  CombinePDFJob,
  CombinePDFResult,
} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const tempFiles = [];
  try {
    const { year, month, employees, workingHours } = req.body;
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.ADOBE_CLIENT_ID,
      clientSecret: process.env.ADOBE_CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });
    const tempDir = os.tmpdir();

    // 1. BUSCAR TEMPLATE APENAS UMA VEZ
    const freshTemplateResponse = await fetch(TEMPLATE_URL);
    const freshTemplateBuffer = await freshTemplateResponse.arrayBuffer();

    // 2. FUNÇÃO PARA PROCESSAR UM ÚNICO FUNCIONÁRIO
    const processEmployee = async (emp, empIdx) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(freshTemplateBuffer);
      const worksheet = workbook.worksheets[0];

      // Preenchimento (Lógica mantida)
      worksheet.getCell("D8").value = emp.abv_name || "";
      worksheet.getCell("J8").value = emp.function || "";
      worksheet.getCell("L46").value = workingHours;
      worksheet.getCell("L44").value = emp.total || 0;

      // ... (sua lógica de preencher dias e cores aqui) ...

      const xlsxPath = path.join(tempDir, `f_${empIdx}_${Date.now()}.xlsx`);
      await workbook.xlsx.writeFile(xlsxPath);
      tempFiles.push(xlsxPath);

      const inputAsset = await pdfServices.upload({
        readStream: fs.createReadStream(xlsxPath),
        mimeType: MimeType.XLSX,
      });

      const createJob = new CreatePDFJob({ inputAsset });
      const pollingURL = await pdfServices.submit({ job: createJob });
      const pdfResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: CreatePDFResult,
      });

      return pdfResponse.result.asset;
    };

    // 3. EXECUTAR EM PARALELO (Acelera muito o processo)
    console.log("🚀 Iniciando processamento paralelo...");
    const pdfAssets = await Promise.all(employees.map((emp, idx) => processEmployee(emp, idx)));

    // 4. MERGE FINAL
    if (!pdfAssets || pdfAssets.length === 0) throw new Error("Falha ao gerar assets");

    const combineJob = new CombinePDFJob({ assets: pdfAssets });
    const combinePollingURL = await pdfServices.submit({ job: combineJob });
    const combineResponse = await pdfServices.getJobResult({
      pollingURL: combinePollingURL,
      resultType: CombinePDFResult,
    });

    const streamAsset = await pdfServices.getContent({ asset: combineResponse.result.asset });
    
    // Ler o stream para buffer
    const chunks = [];
    for await (let chunk of streamAsset.readStream) { chunks.push(chunk); }
    const pdfBuffer = Buffer.concat(chunks);

    // Cleanup
    tempFiles.forEach(f => { if(fs.existsSync(f)) fs.unlinkSync(f); });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Folhas_Ponto.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error("❌ Erro:", error);
    return res.status(500).json({ error: "Erro na geração", details: error.message });
  }
}
