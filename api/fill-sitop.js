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
        
        const templateBuffer = await downloadTemplate(TEMPLATE_URL);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);
        const sheet = workbook.worksheets[0];

        // Preenche células
        sheet.getCell('P11').value = data.vehicle || '';
        sheet.getCell('E17').value = data.registration || '';
        sheet.getCell('B17').value = data.gdh_inop || '';
        sheet.getCell('O14').value = data.failure_type || '';
        sheet.getCell('K16').value = data.failure_description ? `Descrição: ${data.failure_description}` : '';
        sheet.getCell('G23').value = data.gdh_op || '';
        sheet.getCell('E28').value = data.optel || '';

        // Marcações de PPI e substituição (X em células específicas)
        if (data.ppi_part) {
            sheet.getCell('R20').value = 'X';
            sheet.getCell('T20').value = '';
        } else {
            sheet.getCell('R20').value = '';
            sheet.getCell('T20').value = 'X';
        }

        sheet.getCell('Q23').value = data.ppi_airport ? 'X' : '';
        sheet.getCell('Q26').value = data.ppi_a22 ? 'X' : '';
        sheet.getCell('Q29').value = data.ppi_a2 ? 'X' : '';
        sheet.getCell('Q32').value = data.ppi_linfer ? 'X' : '';
        sheet.getCell('Q35').value = data.ppi_airfield ? 'X' : '';

        if (data.ppi_subs) {
            sheet.getCell('R38').value = 'X';
            sheet.getCell('T38').value = '';
        } else {
            sheet.getCell('R38').value = '';
            sheet.getCell('T38').value = 'X';
        }

        // Gera o ficheiro Excel atualizado
        const xlsxBuffer = await workbook.xlsx.writeBuffer();
        const fileName = `SITOP_${data.vehicle}_${Date.now()}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.status(200).send(xlsxBuffer);

    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ 
            error: 'Erro ao processar template', 
            details: error.message 
        });
    }
}
