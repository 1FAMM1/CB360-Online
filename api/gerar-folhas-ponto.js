// /api/gerar-folhas-ponto.js

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
  SDKError,
  ServiceUsageError,
  ServiceApiError,
} from "@adobe/pdfservices-node-sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/stitch_marker_template.xlsx";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  const tempFiles = [];

  try {
    const { year, month, employees, workingHours } = req.body;

    if (!year || !month || !employees || workingHours === undefined) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ error: "Chaves Adobe não configuradas" });
    }

    // ✨ TESTAR SÓ COM 1 FUNCIONÁRIO
    console.log(`📊 TESTE: Gerando folha para 1 funcionário (${month}/${year})`);

    const MONTH_NAMES = [
      "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
      "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
    ];

    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const SHIFT_COLORS = {
      "D": "FFFF00",
      "N": "00008B",
      "M": "D3D3D3",
      "FR": "FFA500",
      "FO": "008000",
      "FE": "00B0F0",
      "BX": "FF0000",
      "LC": "FF0000",
      "LN": "FF0000",
      "LP": "FF0000",
      "FI": "FF0000",
      "FJ": "FF0000",
      "FOR": "808080",
      "DP": "000000"
    };

    function isDarkColor(hex) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luminance < 150;
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    // Buscar template
    const templateResponse = await fetch(TEMPLATE_URL);
    if (!templateResponse.ok) throw new Error("Erro ao carregar template");
    const templateBuffer = await templateResponse.arrayBuffer();

    const credentials = new ServicePrincipalCredentials({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const tempDir = os.tmpdir();

    // ✨ SÓ O PRIMEIRO FUNCIONÁRIO
    const emp = employees[0];
    console.log(`📄 Processando: ${emp.abv_name}`);

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);

    if (workbook.worksheets.length === 0) {
      throw new Error("Template não tem worksheets");
    }

    const worksheet = workbook.worksheets[0];

    // Preencher cabeçalho
    worksheet.getCell("D8").value = emp.abv_name || "";
    worksheet.getCell("J8").value = emp.function || "";
    worksheet.getCell("L46").value = workingHours;

    // Preencher dias e turnos
    for (let d = 1; d <= 31; d++) {
      const row = 11 + d;

      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const weekdayIndex = date.getDay();
        const weekday = WEEKDAY_NAMES[weekdayIndex];

        worksheet.getCell(row, 2).value = d;
        worksheet.getCell(row, 3).value = weekday;

        const turno = emp.shifts?.[d - 1] || "";
        const cellTurno = worksheet.getCell(row, 4);
        cellTurno.value = turno;

        if (turno && SHIFT_COLORS[turno]) {
          const colorHex = SHIFT_COLORS[turno];
          cellTurno.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF" + colorHex },
          };

          const isDark = isDarkColor(colorHex);
          cellTurno.font = {
            bold: true,
            color: { argb: isDark ? "FFFFFFFF" : "FF000000" },
          };

          cellTurno.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        }
      } else {
        worksheet.getCell(row, 2).value = "";
        worksheet.getCell(row, 3).value = "";
        worksheet.getCell(row, 4).value = "";
      }
    }

    worksheet.getCell("L44").value = emp.total || 0;

    // Salvar Excel temporário
    const xlsxPath = path.join(
      tempDir,
      `folha_teste_${Date.now()}.xlsx`
    );
    tempFiles.push(xlsxPath);
    
    console.log(`💾 Salvando Excel em: ${xlsxPath}`);
    await workbook.xlsx.writeFile(xlsxPath);
    
    // Verificar tamanho
    const stats = fs.statSync(xlsxPath);
    console.log(`📊 Tamanho do Excel: ${stats.size} bytes`);

    // Converter para PDF
    console.log(`🔄 Enviando para Adobe PDF Services...`);
    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(xlsxPath),
      mimeType: MimeType.XLSX,
    });

    const createJob = new CreatePDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job: createJob });
    
    console.log(`⏳ Aguardando conversão...`);
    const pdfResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult,
    });

    console.log(`✅ PDF gerado com sucesso!`);

    // Baixar PDF
    const streamAsset = await pdfServices.getContent({ asset: pdfResponse.result.asset });

    const finalPdfPath = path.join(
      tempDir,
      `Folha_Ponto_TESTE_${month}_${year}.pdf`
    );
    tempFiles.push(finalPdfPath);
    const writeStream = fs.createWriteStream(finalPdfPath);
    streamAsset.readStream.pipe(writeStream);
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
    const pdfBuffer = fs.readFileSync(finalPdfPath);
    console.log(`📄 PDF final: ${pdfBuffer.length} bytes`);
    tempFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (err) {
        console.warn(`⚠️ Erro ao limpar ${file}:`, err.message);
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Folha_Ponto_TESTE_${MONTH_NAMES[month - 1]}_${year}.pdf"`
    );
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    tempFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch {}
    });

    console.error("❌ Erro detalhado:", error);
    console.error("Stack:", error.stack);

    if (
      error instanceof SDKError ||
      error instanceof ServiceUsageError ||
      error instanceof ServiceApiError
    ) {
      return res.status(500).json({
        error: "Erro no serviço Adobe PDF Services",
        details: error.message,
        stack: error.stack
      });
    }

    return res.status(500).json({
      error: "Erro ao gerar folha de ponto",
      details: error?.message || String(error),
      stack: error?.stack
    });
  }
}
