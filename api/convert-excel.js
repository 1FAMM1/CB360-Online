// api/convert-excel.js
import {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    ExportPDFJob,
    ExportPDFParams,
    ExportPDFTargetFormat,
    ExportPDFResult,
    SDKError,
    ServiceUsageError,
    ServiceApiError
} from "@adobe/pdfservices-node-sdk";
import fs from 'fs';
import os from 'os';
import path from 'path';

// Acesso às variáveis de ambiente configuradas no Vercel
const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

// ⚠️ IMPORTANTE: Configuração para Next.js API Routes
export const config = {
    api: {
        bodyParser: false, // Desabilita o parser automático para receber dados binários
    },
};

// Função auxiliar para ler o stream do req.body
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    // ✅ CORS Headers - ADICIONA LOGO NO INÍCIO
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name');

    // ✅ Handler para OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("Erro: ADOBE_CLIENT_ID ou ADOBE_CLIENT_SECRET não configurados");
        return res.status(500).json({ error: "Erro: Chaves da Adobe não configuradas." });
    }

    const tempDir = os.tmpdir();
    let inputFilePath = null;
    let outputFilePath = null;

    try {
        // 1. Receber o buffer XLSX do Frontend
        const xlsxBuffer = await getRawBody(req);
        const fileName = req.headers['x-file-name'] || 'Escala';
        
        inputFilePath = path.join(tempDir, `${fileName}_input_${Date.now()}.xlsx`);
        outputFilePath = path.join(tempDir, `${fileName}_output_${Date.now()}.pdf`);

        // 2. Guardar o buffer XLSX num ficheiro temporário
        fs.writeFileSync(inputFilePath, xlsxBuffer);
        console.log(`✅ Ficheiro XLSX guardado em: ${inputFilePath}`);

        // 3. Criar credenciais da Adobe
        const credentials = new ServicePrincipalCredentials({
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET
        });

        // 4. Criar instância do PDFServices
        const pdfServices = new PDFServices({ credentials });

        // 5. Criar um asset de input a partir do ficheiro XLSX
        const inputAsset = await pdfServices.upload({
            readStream: fs.createReadStream(inputFilePath),
            mimeType: MimeType.XLSX
        });
        console.log(`✅ Ficheiro enviado para Adobe. Asset ID: ${inputAsset}`);

        // 6. Criar parâmetros e job de exportação
        const params = new ExportPDFParams({
            targetFormat: ExportPDFTargetFormat.PDF
        });

        const job = new ExportPDFJob({ inputAsset, params });

        // 7. Submeter o job e aguardar resultado
        const pollingURL = await pdfServices.submit({ job });
        console.log(`✅ Job submetido. Polling URL: ${pollingURL}`);

        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL,
            resultType: ExportPDFResult
        });

        // 8. Obter o asset resultante
        const resultAsset = pdfServicesResponse.result.asset;

        // 9. Fazer download do PDF
        const streamAsset = await pdfServices.getContent({ asset: resultAsset });

        // Guardar o stream no ficheiro de output
        const writeStream = fs.createWriteStream(outputFilePath);
        streamAsset.readStream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log(`✅ PDF gerado com sucesso em: ${outputFilePath}`);

        // 10. Ler o PDF e enviar como resposta
        const pdfBuffer = fs.readFileSync(outputFilePath);

        // 11. Limpeza de ficheiros temporários
        try {
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
            console.log('✅ Ficheiros temporários removidos');
        } catch (cleanupError) {
            console.warn('⚠️ Erro ao limpar ficheiros temporários:', cleanupError);
        }

        // 12. Enviar resposta com o PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('❌ Erro na conversão:', error);

        // Limpeza de emergência
        try {
            if (inputFilePath && fs.existsSync(inputFilePath)) {
                fs.unlinkSync(inputFilePath);
            }
            if (outputFilePath && fs.existsSync(outputFilePath)) {
                fs.unlinkSync(outputFilePath);
            }
        } catch (cleanupError) {
            console.warn('⚠️ Erro ao limpar ficheiros de emergência:', cleanupError);
        }

        // Tratamento de erros específicos da Adobe
        if (error instanceof SDKError || error instanceof ServiceUsageError || error instanceof ServiceApiError) {
            console.error('Erro da Adobe PDF Services:', {
                message: error.message,
                statusCode: error.statusCode,
                requestTrackingId: error.requestTrackingId
            });
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
