import ExcelJS from 'exceljs';
import https from 'https';

const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/sitop_template.xlsx";

export const config = {
    api: {
        bodyParser: { sizeLimit: '10mb' }
    }
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

    try {
        const data = req.body;
        
        console.log('Dados recebidos:', data);

        // Download do template
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);
        const sheet = workbook.worksheets[0];

        // ====================================================
        // PREENCHIMENTO DAS CÉLULAS
        // ====================================================
        
        // Dados principais
        sheet.getCell('P11').value = data.vehicle || '';
        sheet.getCell('E17').value = data.registration || '';
        sheet.getCell('B17').value = data.gdh_inop || '';
        sheet.getCell('O14').value = data.failure_type || '';
        sheet.getCell('K16').value = data.failure_description ? `Descrição: ${data.failure_description}` : '';
        sheet.getCell('G23').value = data.gdh_op || '';
        sheet.getCell('E28').value = data.optel || '';

        // Checkboxes PPI individuais (coluna S)
        sheet.getCell('S1').value = data.ppi_airport ? 'VERDADEIRO' : 'FALSO';
        sheet.getCell('S2').value = data.ppi_a22 ? 'VERDADEIRO' : 'FALSO';
        sheet.getCell('S3').value = data.ppi_a2 ? 'VERDADEIRO' : 'FALSO';
        sheet.getCell('S4').value = data.ppi_linfer ? 'VERDADEIRO' : 'FALSO';
        sheet.getCell('S5').value = data.ppi_airfield ? 'VERDADEIRO' : 'FALSO';

        // Faz parte de PPI? (S6 ou S7)
        if (data.ppi_part) {
            sheet.getCell('S6').value = 'VERDADEIRO';
            sheet.getCell('S7').value = 'FALSO';
        } else {
            sheet.getCell('S6').value = 'FALSO';
            sheet.getCell('S7').value = 'VERDADEIRO';
        }

        // Tem substituição? (S8 ou S9)
        if (data.ppi_subs) {
            sheet.getCell('S8').value = 'VERDADEIRO';
            sheet.getCell('S9').value = 'FALSO';
        } else {
            sheet.getCell('S8').value = 'FALSO';
            sheet.getCell('S9').value = 'VERDADEIRO';
        }

        // ====================================================
        // GERA O BUFFER DO EXCEL PREENCHIDO
        // ====================================================
        const xlsxBuffer = await workbook.xlsx.writeBuffer();

        // ====================================================
        // RETORNA O FICHEIRO PARA DOWNLOAD
        // ====================================================
        const fileName = `SITOP_${data.vehicle}_${Date.now()}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.status(200).send(xlsxBuffer);

    } catch (error) {
        console.error('Erro ao preencher template:', error);
        return res.status(500).json({ 
            error: 'Erro ao processar template', 
            details: error.message 
        });
    }
}
