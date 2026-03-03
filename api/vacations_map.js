import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult } from "@adobe/pdfservices-node-sdk";

// Funções de estilo idênticas às tuas outras APIs
function setFill(cell, hex) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + hex.replace("#", "") } };
}

function setBorder(cell) {
    const c = { argb: "FFD1D1D1" };
    cell.border = {
        top: { style: "thin", color: c }, left: { style: "thin", color: c },
        bottom: { style: "thin", color: c }, right: { style: "thin", color: c }
    };
}

export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    let inputPath = null;

    try {
        const { year, employees } = req.body;

        // 1. Carregar o Template (Verifica se este link abre no browser!)
        const templateURL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/global_vacation_template.xlsx";
        const response = await fetch(templateURL);
        if (!response.ok) throw new Error("Template Excel não encontrado no GitHub.");
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await response.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        // 2. Preencher Dados
        const ROW_START = 10;
        employees.forEach((emp, index) => {
            const row = ROW_START + index;
            
            // Coluna B: Nome
            const cellNome = worksheet.getCell(row, 2);
            cellNome.value = emp.name;
            setBorder(cellNome);

            // Pintar os 12 meses (Colunas C a N)
            for (let m = 3; m <= 14; m++) setBorder(worksheet.getCell(row, m));

            // Merges de Férias
            if (emp.periods) {
                emp.periods.forEach(p => {
                    const startCol = 2 + p.startMonth; // Jan=3
                    const endCol = 2 + p.endMonth;
                    
                    if (startCol === endCol) {
                        const cell = worksheet.getCell(row, startCol);
                        setFill(cell, "F7C6C7");
                        setBorder(cell);
                    } else {
                        worksheet.mergeCells(row, startCol, row, endCol);
                        const merged = worksheet.getCell(row, startCol);
                        setFill(merged, "F7C6C7");
                        setBorder(merged);
                    }
                });
            }

            // Coluna O: Total
            const cellTotal = worksheet.getCell(row, 15);
            cellTotal.value = emp.totalDays;
            setBorder(cellTotal);
        });

        // 3. Adobe PDF Services
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

        res.setHeader("Content-Type", "application/pdf");
        return res.status(200).send(Buffer.concat(chunks));

    } catch (err) {
        console.error("ERRO API:", err.message);
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        return res.status(500).json({ error: err.message });
    }
}
