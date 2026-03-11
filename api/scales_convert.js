    import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';
import { ServicePrincipalCredentials, PDFServices, MimeType, CreatePDFJob, CreatePDFResult, SDKError, ServiceUsageError, ServiceApiError }
    from "@adobe/pdfservices-node-sdk";

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/fomio_template.xlsx";

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } }
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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
    if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).json({ error: "Erro: Chaves da Adobe não configuradas." });

    const tempDir = os.tmpdir();
    let inputFilePath = null;
    let outputFilePath = null;

    try {
        const data = req.body;
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);

        // Limpar folhas extras se existirem
        while (workbook.worksheets.length > 1) {
            workbook.removeWorksheet(workbook.worksheets[1].id);
        }

        const sheet = workbook.worksheets[0];
        
        // Título da Escala
        sheet.getCell("C9").value = `${data.monthName} ${data.year}`;

        const holidayDays = data.holidayDays || [];
        const optionalDays = data.optionalDays || []; // Carnaval

        // --- LÓGICA DE CORES E IDENTIFICAÇÃO DE FERIADOS ---
        const applyColumnFormat = (day, colorARGB) => {
            const colIndex = 6 + (day - 1);
            
            // 1. Escrever "FR" na linha de feriados
            const cellFR = sheet.getRow(8).getCell(colIndex);
            cellFR.value = 'FR';
            
            // 2. Pintar o fundo da célula de identificação e cabeçalhos
            [8, 11, 12].forEach(rowNum => {
                const cell = sheet.getRow(rowNum).getCell(colIndex);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: colorARGB }
                };
            });
        };

        // Aplicar Rosa (FFFFCCCC) para Feriados e Verde (FF2ECC71) para Carnaval
        holidayDays.forEach(day => applyColumnFormat(day, 'FFFFCCCC'));
        optionalDays.forEach(day => applyColumnFormat(day, 'FF2ECC71'));

        // Preencher Dias da Semana e Números
        const row11 = sheet.getRow(11);
        const row12 = sheet.getRow(12);
        for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1);
            row11.getCell(col).value = data.weekdays[d - 1] || '';
            row12.getCell(col).value = d;
        }
        row11.commit();
        row12.commit();

        // Preencher Linhas Fixas (OFOPE / Chefia)
        let currentRow = 14;
        data.fixedRows.forEach(fixedRow => {
            const row = sheet.getRow(currentRow);
            row.getCell(3).value = fixedRow.ni;
            row.getCell(4).value = fixedRow.nome;
            row.getCell(5).value = fixedRow.catg;
            for (let d = 1; d <= data.daysInMonth; d++) {
                row.getCell(6 + (d - 1)).value = fixedRow.days[d] || '';
            }
            row.commit();
            currentRow++;
        });

        // Preencher Linhas do Corpo Ativo
        currentRow = 18;
        data.normalRows.forEach(normalRow => {
            const row = sheet.getRow(currentRow);
            row.getCell(3).value = normalRow.ni;
            row.getCell(4).value = normalRow.nome;
            row.getCell(5).value = normalRow.catg;
            for (let d = 1; d <= data.daysInMonth; d++) {
                row.getCell(6 + (d - 1)).value = normalRow.days[d] || '';
            }
            row.commit();
            currentRow++;
        });

        // Esconder colunas de dias que não existem no mês (ex: dia 31 em Abril)
        for (let c = 6; c <= 36; c++) {
            if (c > 6 + data.daysInMonth - 1) {
                sheet.getColumn(c).hidden = true;
            }
        }

        // Esconder linhas de pessoal vazias para encurtar o PDF
        for (let r = 18; r <= 117; r++) {
            const cellNI = sheet.getRow(r).getCell(3);
            if (!cellNI.value || cellNI.value.toString().trim() === '') {
                sheet.getRow(r).hidden = true;
            }
        }

        // Configuração de Página para Adobe PDF
        sheet.pageSetup = {
            orientation: 'portrait',
            paperSize: 9, // A4
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            horizontalCentered: true,
            margins: { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2, header: 0, footer: 0 }
        };

        inputFilePath = path.join(tempDir, `input_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `output_${Date.now()}.pdf`);

        await workbook.xlsx.writeFile(inputFilePath);

        // --- INTEGRAÇÃO ADOBE PDF SERVICES ---
        const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
        const pdfServices = new PDFServices({ credentials });
        
        const inputAsset = await pdfServices.upload({ 
            readStream: fs.createReadStream(inputFilePath), 
            mimeType: MimeType.XLSX 
        });

        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await pdfServices.submit({ job });
        const pdfServicesResponse = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const streamAsset = await pdfServices.getContent({ asset: pdfServicesResponse.result.asset });

        const writeStream = fs.createWriteStream(outputFilePath);
        streamAsset.readStream.pipe(writeStream);
        
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        const pdfBuffer = fs.readFileSync(outputFilePath);

        // Limpeza de ficheiros temporários
        try {
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        } catch (e) { console.error("Erro na limpeza:", e); }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("Erro na API:", error);
        return res.status(500).json({ 
            error: "Falha na geração do PDF", 
            details: error.message 
        });
    }
}
