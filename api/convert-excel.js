// api/convert-excel.js
import {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    CreatePDFJob,
    CreatePDFResult,
    SDKError,
    ServiceUsageError,
    ServiceApiError
} from "@adobe/pdfservices-node-sdk";
import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/fomio_template.xlsx";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};

// Função para descarregar o template
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
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("Erro: Credenciais Adobe não configuradas");
        return res.status(500).json({ error: "Erro: Chaves da Adobe não configuradas." });
    }

    const tempDir = os.tmpdir();
    let inputFilePath = null;
    let outputFilePath = null;

    try {
        // 1. Receber os dados JSON
        const data = req.body;
        console.log(`✅ Dados recebidos: ${data.fileName}`);
        
        // 2. Descarregar o template
        console.log('📥 A descarregar template...');
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);
        console.log(`✅ Template descarregado. Tamanho: ${templateBuffer.byteLength} bytes`);
        
        // 3. Carregar o template com ExcelJS
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);
        
        console.log(`✅ Workbook carregado. Total de sheets: ${workbook.worksheets.length}`);
        
        // Remover todas as sheets extra (deixar só a primeira)
        while (workbook.worksheets.length > 1) {
            workbook.removeWorksheet(workbook.worksheets[1].id);
        }
        
        const sheet = workbook.worksheets[0];
        console.log(`✅ A trabalhar com: ${sheet.name}`);
        
        // 4. Preencher o template
        // Título do mês em C9
        sheet.getCell("C9").value = `${data.monthName} ${data.year}`;
        
        // Cabeçalhos (dias da semana e números)
        const row11 = sheet.getRow(11);
        const row12 = sheet.getRow(12);
        
        for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1);
            row11.getCell(col).value = data.weekdays[d - 1] || '';
            row12.getCell(col).value = d;
        }
        row11.commit();
        row12.commit();
        
        // Linhas fixas (OFOPE) - começam na linha 15
        let currentRow = 15;
        data.fixedRows.forEach(fixedRow => {
            if (fixedRow.type === 'header') {
                return;
            }
            const row = sheet.getRow(currentRow);
            row.getCell(3).value = fixedRow.ni;
            row.getCell(4).value = fixedRow.nome;
            row.getCell(5).value = fixedRow.catg;
            
            for (let d = 1; d <= data.daysInMonth; d++) {
                const col = 6 + (d - 1);
                row.getCell(col).value = fixedRow.days[d] || '';
            }
            row.commit();
            currentRow++;
        });
        
        // Linhas normais - começam na linha 18
        currentRow = 18;
        data.normalRows.forEach(normalRow => {
            const row = sheet.getRow(currentRow);
            row.getCell(3).value = normalRow.ni;
            row.getCell(4).value = normalRow.nome;
            row.getCell(5).value = normalRow.catg;
            
            for (let d = 1; d <= data.daysInMonth; d++) {
                const col = 6 + (d - 1);
                row.getCell(col).value = normalRow.days[d] || '';
            }
            row.commit();
            currentRow++;
        });
        
        console.log('✅ Template preenchido');
        
        // 5. Limpar workbook para evitar corrupção
        sheet.properties.outlineLevelCol = undefined;
        sheet.properties.outlineLevelRow = undefined;
        
        sheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                if (cell.value === undefined || cell.value === null) {
                    cell.value = '';
                }
            });
        });
        
        console.log('✅ Workbook limpo e validado');

        // ✅ Forçar configuração de página para caber tudo numa única folha
        sheet.pageSetup = {
    orientation: 'portrait',       // Vertical
    paperSize: 9,                  // A4
    fitToPage: true,               // Ajustar para caber numa página
    fitToWidth: 1,                 // 1 página na largura
    fitToHeight: 1,                // 1 página na altura
    horizontalCentered: true,
    verticalCentered: true,
    margins: {
        left: 0.059,               // 1,5 mm
        right: 0.059,              // 1,5 mm
        top: 0.25,                 // 6,3 mm (mantemos para não cortar)
        bottom: 0.25,              // 6,3 mm
        header: 0.1,               // 2,5 mm
        footer: 0.1                // 2,5 mm
    }
};



        console.log('✅ Configuração de página ajustada para caber em uma folha');

        // 6. Guardar o XLSX preenchido COM VALIDAÇÃO
        inputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `${data.fileName}_${Date.now()}.pdf`);
        
        try {
            await workbook.xlsx.writeFile(inputFilePath);
            
            const stats = fs.statSync(inputFilePath);
            console.log(`✅ XLSX guardado: ${inputFilePath} (${stats.size} bytes)`);
            
            if (stats.size < 5000) {
                throw new Error('Ficheiro XLSX muito pequeno, pode estar corrompido');
            }
            
            const testWorkbook = new ExcelJS.Workbook();
            await testWorkbook.xlsx.readFile(inputFilePath);
            console.log('✅ XLSX validado com sucesso');
            
        } catch (validationError) {
            console.error('❌ XLSX inválido, a criar novo ficheiro do zero:', validationError);
            const newWorkbook = new ExcelJS.Workbook();
            const newSheet = newWorkbook.addWorksheet('Escala');
            newSheet.columns = [
                { width: 5 }, { width: 5 },
                { width: 8 }, { width: 20 }, { width: 8 }
            ];
            for (let d = 1; d <= data.daysInMonth; d++) {
                newSheet.getColumn(5 + d).width = 5;
            }
            newSheet.mergeCells('C9:H9');
            const titleCell = newSheet.getCell('C9');
            titleCell.value = `ESCALA DE SERVIÇO - ${data.monthName} ${data.year}`;
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            titleCell.font = { bold: true, size: 14 };
            newSheet.getCell('C11').value = 'NI';
            newSheet.getCell('D11').value = 'Nome';
            newSheet.getCell('E11').value = 'Catg.';
            for (let d = 1; d <= data.daysInMonth; d++) {
                const col = 6 + (d - 1);
                const colLetter = String.fromCharCode(64 + col);
                newSheet.getCell(`${colLetter}11`).value = data.weekdays[d - 1] || '';
                newSheet.getCell(`${colLetter}12`).value = d;
            }
            let currentRow = 15;
            data.fixedRows.forEach(fixedRow => {
                newSheet.getCell(`C${currentRow}`).value = fixedRow.ni;
                newSheet.getCell(`D${currentRow}`).value = fixedRow.nome;
                newSheet.getCell(`E${currentRow}`).value = fixedRow.catg;
                for (let d = 1; d <= data.daysInMonth; d++) {
                    const col = 6 + (d - 1);
                    const colLetter = String.fromCharCode(64 + col);
                    newSheet.getCell(`${colLetter}${currentRow}`).value = fixedRow.days[d] || '';
                }
                currentRow++;
            });
            currentRow = 18;
            data.normalRows.forEach(normalRow => {
                newSheet.getCell(`C${currentRow}`).value = normalRow.ni;
                newSheet.getCell(`D${currentRow}`).value = normalRow.nome;
                newSheet.getCell(`E${currentRow}`).value = normalRow.catg;
                for (let d = 1; d <= data.daysInMonth; d++) {
                    const col = 6 + (d - 1);
                    const colLetter = String.fromCharCode(64 + col);
                    newSheet.getCell(`${colLetter}${currentRow}`).value = normalRow.days[d] || '';
                }
                currentRow++;
            });
            await newWorkbook.xlsx.writeFile(inputFilePath);
            console.log('✅ Novo XLSX criado do zero');
        }

        // 7. Converter para PDF com Adobe
        console.log('🔄 A iniciar conversão para PDF...');
        
        const credentials = new ServicePrincipalCredentials({
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET
        });

        const pdfServices = new PDFServices({ credentials });

        const inputAsset = await pdfServices.upload({
            readStream: fs.createReadStream(inputFilePath),
            mimeType: MimeType.XLSX
        });
        console.log(`✅ Ficheiro XLSX enviado para Adobe. Asset ID: ${inputAsset}`);

        const job = new CreatePDFJob({ inputAsset });
        console.log('✅ Job de conversão criado');

        const pollingURL = await pdfServices.submit({ job });
        console.log(`✅ Job submetido. A aguardar resultado...`);

        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL,
            resultType: CreatePDFResult
        });
        console.log('✅ Resultado recebido');

        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({ asset: resultAsset });

        const writeStream = fs.createWriteStream(outputFilePath);
        streamAsset.readStream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log(`✅ PDF gerado com sucesso: ${outputFilePath}`);

        const pdfBuffer = fs.readFileSync(outputFilePath);

        try {
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
            console.log('✅ Ficheiros temporários removidos');
        } catch (cleanupError) {
            console.warn('⚠️ Erro ao limpar:', cleanupError);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('❌ Erro:', error);
        try {
            if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            if (outputFilePath && fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        } catch (e) {}
        if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
            return res.status(500).json({ 
                error: "Erro no serviço Adobe PDF Services",
                details: error.message 
            });
        }
        return res.status(500).json({ 
            error: "Erro interno ao converter para PDF",
            details: error.message 
        });
    }
}
