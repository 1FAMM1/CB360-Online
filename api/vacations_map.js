import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult } from "@adobe/pdfservices-node-sdk";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    let inputPath = null;
    try {
        const { year, employees } = req.body;
        console.log(`Iniciando geração para o ano ${year} com ${employees?.length} funcionários`);

        // 1. Validar Credenciais Adobe (Se faltar, dá erro 500 imediato)
        if (!process.env.ADOBE_CLIENT_ID || !process.env.ADOBE_CLIENT_SECRET) {
            throw new Error("Credenciais Adobe não configuradas nas Environment Variables da Vercel.");
        }

        const templateURL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/vacation_map_template.xlsx";
        const response = await fetch(templateURL);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await response.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        // 2. Preenchimento (Com proteção contra dados nulos)
        const ROW_START = 10;
        employees.forEach((emp, index) => {
            const row = ROW_START + index;
            worksheet.getCell(row, 2).value = emp.name || "N/A";
            
            // Desenhar bordas base
            for (let m = 3; m <= 14; m++) {
                const cell = worksheet.getCell(row, m);
                cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            }

            if (emp.periods && Array.isArray(emp.periods)) {
                emp.periods.forEach(p => {
                    const startCol = 2 + parseInt(p.startMonth);
                    const endCol = 2 + parseInt(p.endMonth);
                    
                    if (startCol >= 3 && endCol <= 14) {
                        if (startCol !== endCol) worksheet.mergeCells(row, startCol, row, endCol);
                        const cell = worksheet.getCell(row, startCol);
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7C6C7' } };
                        cell.alignment = { horizontal: 'center' };
                    }
                });
            }
            worksheet.getCell(row, 15).value = emp.totalDays || 0;
        });

        // 3. Conversão Adobe
        const tempDir = os.tmpdir();
        inputPath = path.join(tempDir, `mapa_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(inputPath);

        const credentials = new ServicePrincipalCredentials({
            clientId: process.env.ADOBE_CLIENT_ID,
            clientSecret: process.env.ADOBE_CLIENT_SECRET
        });
        const pdfServices = new PDFServices({ credentials });
        const inputAsset = await pdfServices.upload({
            readStream: fs.createReadStream(inputPath),
            mimeType: MimeType.XLSX
        });

        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await pdfServices.submit({ job });
        const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

        const chunks = [];
        for await (let chunk of streamAsset.readStream) chunks.push(chunk);

        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        return res.status(200).send(Buffer.concat(chunks));

    } catch (err) {
        console.error("ERRO DETALHADO:", err);
        return res.status(500).json({ error: err.message, stack: err.stack });
    }
}
