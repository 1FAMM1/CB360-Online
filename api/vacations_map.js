import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult } from "@adobe/pdfservices-node-sdk";

// --- Constantes de Layout (Nuances do teu Template) ---
const HOLIDAY_COLOR = "F7C6C7"; // Rosa para férias
const ROW_START = 10;
const COL_NOME = 2; // B
const COL_JAN = 3;  // C
const COL_TOTAL = 15; // O

// --- Funções de Estilo (Mantendo o teu padrão breakStyle) ---
function breakStyle(cell) {
    cell.style = { ...(cell.style || {}) };
    if (cell.style.fill) cell.style.fill = { ...cell.style.fill };
    if (cell.style.border) cell.style.border = { ...cell.style.border };
}

function setFill(cell, hex) {
    breakStyle(cell);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + hex.replace("#", "") } };
}

function setBorder(cell) {
    breakStyle(cell);
    const c = { argb: "FFD1D1D1" };
    cell.border = {
        top: { style: "thin", color: c },
        left: { style: "thin", color: c },
        bottom: { style: "thin", color: c },
        right: { style: "thin", color: c },
    };
}

export default async function handler(req, res) {
    // Configurações de CORS para o teu CodePen
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    let inputFilePath = null;
    let outputFilePath = null;

    try {
        const { year, employees } = req.body;

        // 1. Carregar Template do GitHub
        const templateURL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/vacation_template.xlsx";
        const templateResponse = await fetch(templateURL);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        // 2. Título do Mapa
        worksheet.getCell("B7").value = `PLANO ANUAL DE FÉRIAS - ${year}`;

        // 3. Preenchimento dos Dados e Merges
        employees.forEach((emp, index) => {
            const currentRow = ROW_START + index;
            
            // Coluna Nome
            const cellNome = worksheet.getCell(currentRow, COL_NOME);
            cellNome.value = emp.name;
            setBorder(cellNome);

            // Borda padrão para os 12 meses
            for (let m = 0; m < 12; m++) {
                setBorder(worksheet.getCell(currentRow, COL_JAN + m));
            }

            // Lógica de Férias e União de Células (A Nuance!)
            if (emp.periods && emp.periods.length > 0) {
                emp.periods.forEach(p => {
                    const startCol = COL_JAN + (p.startMonth - 1);
                    const endCol = COL_JAN + (p.endMonth - 1);

                    if (startCol === endCol) {
                        // Férias num único mês: Pinta e coloca os dias
                        const cell = worksheet.getCell(currentRow, startCol);
                        cell.value = p.days;
                        setFill(cell, HOLIDAY_COLOR);
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        cell.font = { bold: true, size: 10 };
                    } else {
                        // Férias atravessam meses: UNE as células
                        worksheet.mergeCells(currentRow, startCol, currentRow, endCol);
                        const mergedCell = worksheet.getCell(currentRow, startCol);
                        mergedCell.value = p.days;
                        setFill(mergedCell, HOLIDAY_COLOR);
                        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
                        mergedCell.font = { bold: true, size: 10 };
                        // Re-aplicar bordas na união (o ExcelJS às vezes perde-as no merge)
                        setBorder(mergedCell);
                    }
                });
            }

            // Coluna Total de Dias
            const cellTotal = worksheet.getCell(currentRow, COL_TOTAL);
            cellTotal.value = emp.totalDays;
            setBorder(cellTotal);
            cellTotal.font = { bold: true };
        });

        // 4. Configuração de Impressão para o PDF
        worksheet.pageSetup = { 
            orientation: "landscape", 
            paperSize: 9, // A4
            fitToPage: true, 
            fitToWidth: 1, 
            fitToHeight: 0 
        };

        // 5. Integração com ADOBE PDF SERVICES (O que pediste)
        const tempDir = os.tmpdir();
        inputFilePath = path.join(tempDir, `global_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `global_${Date.now()}.pdf`);

        // Grava o Excel temporário para o Adobe ler
        await workbook.xlsx.writeFile(inputFilePath);

        const credentials = new ServicePrincipalCredentials({
            clientId: process.env.ADOBE_CLIENT_ID,
            clientSecret: process.env.ADOBE_CLIENT_SECRET
        });
        const pdfServices = new PDFServices({ credentials });

        // Upload do Excel para a Adobe
        const inputAsset = await pdfServices.upload({
            readStream: fs.createReadStream(inputFilePath),
            mimeType: MimeType.XLSX,
        });

        // Cria o Job de conversão
        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await pdfServices.submit({ job });
        const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

        // Coleta o PDF resultante em Chunks
        const chunks = [];
        for await (let chunk of streamAsset.readStream) {
            chunks.push(chunk);
        }

        // Limpeza dos ficheiros temporários do servidor
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);

        // Envia o PDF final para o Browser
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Mapa_Global_Ferias_${year}.pdf"`);
        return res.status(200).send(Buffer.concat(chunks));

    } catch (error) {
        console.error("Erro Crítico na API:", error);
        // Tenta limpar ficheiros se houver erro
        if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        return res.status(500).json({ error: "Erro na conversão PDF", details: error.message });
    }
}
