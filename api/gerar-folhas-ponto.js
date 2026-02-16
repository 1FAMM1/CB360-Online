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
  CombinePDFJob,
  CombinePDFResult,
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

    console.log(`📊 Gerando ${employees.length} folhas de ponto para ${month}/${year}`);

    const MONTH_NAMES = [
      "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
      "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
    ];

    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Cores dos turnos (HEX sem #)
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

    const credentials = new ServicePrincipalCredentials({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
    const pdfServices = new PDFServices({ credentials });

    const pdfAssets = [];
    const tempDir = os.tmpdir();

    // ✨ GERAR PDF PARA CADA FUNCIONÁRIO (TEMPLATE FRESCO)
    for (let empIdx = 0; empIdx < employees.length; empIdx++) {
      const emp = employees[empIdx];
      console.log(`📄 Processando: ${emp.abv_name} (${empIdx + 1}/${employees.length})`);

      // ✨ BUSCAR TEMPLATE NOVO PARA CADA FUNCIONÁRIO
      const freshTemplateResponse = await fetch(TEMPLATE_URL);
      if (!freshTemplateResponse.ok) throw new Error("Erro ao carregar template");
      const freshTemplateBuffer = await freshTemplateResponse.arrayBuffer();

      // Criar workbook a partir do template FRESCO
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(freshTemplateBuffer);

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
        const row = 11 + d; // B12 = dia 1, então row 12

        if (d <= daysInMonth) {
          const date = new Date(year, month - 1, d, 12, 0, 0);
          const weekdayIndex = date.getDay();
          const weekday = WEEKDAY_NAMES[weekdayIndex];

          // Dia (número)
          worksheet.getCell(row, 2).value = d; // Coluna B

          // Dia (nome)
          worksheet.getCell(row, 3).value = weekday; // Coluna C

          // Turno
          const turno = emp.shifts?.[d - 1] || "";
          const cellTurno = worksheet.getCell(row, 4); // Coluna D
          cellTurno.value = turno;

          // Aplicar cor ao turno
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
          // Limpar linhas de dias que não existem no mês
          worksheet.getCell(row, 2).value = "";
          worksheet.getCell(row, 3).value = "";
          worksheet.getCell(row, 4).value = "";
        }
      }

      // Total de horas
      worksheet.getCell("L44").value = emp.total || 0;

      // Salvar Excel temporário
      const xlsxPath = path.join(
        tempDir,
        `folha_${emp.abv_name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${empIdx}.xlsx`
      );
      tempFiles.push(xlsxPath);
      await workbook.xlsx.writeFile(xlsxPath);

      // Converter para PDF
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

      pdfAssets.push(pdfResponse.result.asset);
    }

    console.log(`🔗 Merging ${pdfAssets.length} PDFs...`);

    // Combinar todos os PDFs
    const combineJob = new CombinePDFJob({ assets: pdfAssets });
    const combinePollingURL = await pdfServices.submit({ job: combineJob });
    const combineResponse = await pdfServices.getJobResult({
      pollingURL: combinePollingURL,
      resultType: CombinePDFResult,
    });

    const finalAsset = combineResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: finalAsset });

    // Salvar PDF final temporariamente
    const finalPdfPath = path.join(
      tempDir,
      `Folhas_Ponto_${month}_${year}_${Date.now()}.pdf`
    );
    tempFiles.push(finalPdfPath);

    const writeStream = fs.createWriteStream(finalPdfPath);
    streamAsset.readStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const pdfBuffer = fs.readFileSync(finalPdfPath);

    // Cleanup
    tempFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (err) {
        console.warn(`⚠️ Erro ao limpar ${file}:`, err.message);
      }
    });

    console.log(`✅ PDF final gerado com sucesso!`);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Folhas_Ponto_${MONTH_NAMES[month - 1]}_${year}.pdf"`
    );
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    // Cleanup em caso de erro
    tempFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch {}
    });

    console.error("❌ Erro ao gerar folhas:", error);

    if (
      error instanceof SDKError ||
      error instanceof ServiceUsageError ||
      error instanceof ServiceApiError
    ) {
      return res.status(500).json({
        error: "Erro no serviço Adobe PDF Services",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "Erro ao gerar folhas de ponto",
      details: error?.message || String(error),
    });
  }
}
