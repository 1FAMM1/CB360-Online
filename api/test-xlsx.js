// api/test-xlsx.js
// Endpoint temporário para testar se o XLSX está a ser gerado corretamente

import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

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

    const tempDir = os.tmpdir();
    let xlsxFilePath = null;

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
        
        // Listar todas as sheets
        workbook.worksheets.forEach((sheet, index) => {
            console.log(`  Sheet ${index}: ${sheet.name}`);
        });
        
        // Remover todas as sheets extra (deixar só a primeira)
        while (workbook.worksheets.length > 1) {
            workbook.removeWorksheet(workbook.worksheets[1].id);
            console.log(`  ✅ Sheet extra removida`);
        }
        
        const sheet = workbook.worksheets[0];
        console.log(`✅ A trabalhar com: ${sheet.name}`);
        
        // 4. Preencher o template
        sheet.getCell("C9").value = `${data.monthName} ${data.year}`;
        
        // Cabeçalhos
        const row11 = sheet.getRow(11);
        const row12 = sheet.getRow(12);
        
        for (let d = 1; d <= data.daysInMonth; d++) {
            const col = 6 + (d - 1);
            row11.getCell(col).value = data.weekdays[d - 1] || '';
            row12.getCell(col).value = d;
        }
        row11.commit();
        row12.commit();
        
        // Linhas fixas
        let currentRow = 15;
        data.fixedRows.forEach(fixedRow => {
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
        
        // Linhas normais
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
        
        // 5. Guardar o XLSX
        xlsxFilePath = path.join(tempDir, `${data.fileName}_test_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(xlsxFilePath);
        
        const stats = fs.statSync(xlsxFilePath);
        console.log(`✅ XLSX guardado: ${xlsxFilePath} (${stats.size} bytes)`);
        
        // 6. Ler e enviar o XLSX
        const xlsxBuffer = fs.readFileSync(xlsxFilePath);
        
        // Limpeza
        fs.unlinkSync(xlsxFilePath);
        
        // 7. Retornar o XLSX
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fileName}.xlsx"`);
        return res.status(200).send(xlsxBuffer);

    } catch (error) {
        console.error('❌ Erro:', error);
        
        if (xlsxFilePath && fs.existsSync(xlsxFilePath)) {
            fs.unlinkSync(xlsxFilePath);
        }
        
        return res.status(500).json({ 
            error: "Erro ao gerar XLSX",
            details: error.message 
        });
    }
}
