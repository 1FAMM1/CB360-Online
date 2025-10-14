// api/convert-excel.js
import { ExecutionContext, FileRef, MimeType, PDFServices, ExportPDF, ExportPDFFormat } from '@adobe/pdfservices-sdk';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Acesso às variáveis de ambiente configuradas no Vercel
const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

// Importante: O Vercel precisa de um parser específico para o corpo binário.
// Se estiver a usar o Next.js API Routes, adicione esta configuração:
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Método não permitido');
    }
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return res.status(500).send("Erro: Chaves da Adobe não configuradas.");
    }

    // 1. Receber o buffer XLSX do Frontend (req.body será o buffer binário)
    // Nota: Se usar Next.js API Routes, o req.body será o stream ou buffer binário
    // se o bodyParser estiver desativado acima. Se não estiver a usar Next.js,
    // o req.body deve ser o buffer, mas pode precisar de concatenar streams.
    const xlsxBuffer = req.body; 
    const fileName = req.headers['x-file-name'] || 'Escala';

    const tempDir = os.tmpdir();
    const inputFilePath = path.join(tempDir, `${fileName}_input_${Date.now()}.xlsx`);
    const outputFilePath = path.join(tempDir, `${fileName}_output_${Date.now()}.pdf`);

    try {
        // 2. Guardar o buffer XLSX para um ficheiro temporário (necessário pelo SDK da Adobe)
        fs.writeFileSync(inputFilePath, xlsxBuffer);
        
        // 3. Autenticação e Execução do Serviço da Adobe
        // O SDK usa Client ID e Client Secret para gerar o JWT/Token.
        const credentials = ExecutionContext.authenticator.getServicePrincipalCredentials(
            CLIENT_ID,
            CLIENT_SECRET
            // Se falhar a autenticação, adicione aqui o Organization ID e Technical Account ID
        );

        const pdfServices = new PDFServices(credentials);
        
        // Cria uma referência ao ficheiro XLSX na cloud da Adobe
        const inputAsset = await pdfServices.uploadAssets(inputFilePath, MimeType.XLSX);
        
        // Define a operação de conversão
        const exportPDFOperation = ExportPDF.createNew(inputAsset, ExportPDFFormat.PDF);
        
        // Executa a operação
        const resultAsset = await pdfServices.process(exportPDFOperation);

        // 4. Descarregar o PDF e enviá-lo de volta
        await resultAsset.downloadAsset(outputFilePath);
        
        // Ler o ficheiro PDF gerado para um buffer para a resposta
        const pdfBuffer = fs.readFileSync(outputFilePath);

        // 5. Limpeza de recursos
        await pdfServices.deleteAsset(inputAsset); // Limpa o ficheiro da cloud da Adobe
        fs.unlinkSync(inputFilePath); // Apaga o temporário local
        fs.unlinkSync(outputFilePath); // Apaga o PDF local
        
        // 6. Enviar a resposta HTTP para o navegador (o download será forçado pelo frontend)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('Erro na API da Adobe:', error);
        
        // Limpeza de emergência (se algo falhar, tenta apagar os temporários)
        try {
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        } catch(e) { /* ignorar erros de limpeza */ }
        
        return res.status(500).send("Erro interno ao converter para PDF.");
    }
}
