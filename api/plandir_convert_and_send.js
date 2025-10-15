import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
// Módulos Node.js para lidar com ficheiros temporários no Vercel
import fs from 'fs';
import os from 'os';
import path from 'path';

// 🚨 CORREÇÃO FINAL: Usamos a sintaxe de importação v3.x do SDK da Adobe,
// que é compatível com o seu projeto de Escalas.
import { 
    ServicePrincipalCredentials, 
    PDFServices,                 
    MimeType,
    CreatePDFResult,
    CreatePDFJob,
    // Não precisamos de ExecutionContext, CreatePDF, etc.
} from "@adobe/pdfservices-node-sdk"; 

// =========================================================================
// VARIÁVEIS DE AMBIENTE (Lidas a partir do Vercel Settings)
// =========================================================================
const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Configuração para garantir que o Vercel pode lidar com payloads maiores
export const config = {
  api: {
    bodyParser: {
        sizeLimit: '10mb', 
    },
  },
};

// =========================================================================
// FUNÇÃO AUXILIAR: CONVERSÃO XLSX -> PDF (Sintaxe v3.x da Adobe)
// =========================================================================

/**
 * Converte um Buffer XLSX para um Buffer PDF usando a Adobe Cloud Services (v3.x syntax).
 * @param {Buffer} xlsxBuffer - O buffer binário do ficheiro XLSX preenchido.
 * @param {string} fileName - Nome base para os ficheiros temporários.
 * @returns {Promise<Buffer>} O buffer binário do PDF resultante.
 */
async function convertXLSXToPDF(xlsxBuffer, fileName) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Erro de Configuração Adobe: As chaves não estão definidas.");
    }
    
    // É obrigatório escrever o Buffer para um ficheiro temporário para o SDK da Adobe 
    // o poder ler como stream para o upload.
    const inputFilePath = `/tmp/${fileName}_input_${Date.now()}.xlsx`; 
    
    // Escreve o XLSX recebido para um ficheiro temporário
    fs.writeFileSync(inputFilePath, xlsxBuffer); 

    let pdfBuffer = null;
    
    try {
        // 1. Autenticação (Sintaxe v3.x)
        const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
        const pdfServices = new PDFServices({ credentials });
        
        // 2. Upload (Criação de um stream de leitura)
        const inputAsset = await pdfServices.upload({ 
            readStream: fs.createReadStream(inputFilePath), 
            mimeType: MimeType.XLSX 
        });
        
        // 3. Conversão (Usa CreatePDFJob, o equivalente ao CreatePDF.createNew() na v3.x)
        const job = new CreatePDFJob({ inputAsset });
        
        // 4. Submissão e Poll do resultado
        const pollingURL = await pdfServices.submit({ job });
        const pdfServicesResponse = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const resultAsset = pdfServicesResponse.result.asset;
        
        // 5. Download do PDF para a memória (não para o disco)
        const streamAsset = await pdfServices.getContent({ asset: resultAsset });
        
        const chunks = [];
        await new Promise((resolve, reject) => {
            streamAsset.readStream.on('data', (chunk) => chunks.push(chunk));
            streamAsset.readStream.on('end', resolve);
            streamAsset.readStream.on('error', reject);
        });
        pdfBuffer = Buffer.concat(chunks);
        
    } catch (error) {
        // Lida com erros específicos da Adobe se a variável error for uma das classes
        console.error('Erro na API da Adobe:', error);
        throw new Error('Falha na conversão XLSX para PDF. Verifique as credenciais e o limite de uso da Adobe.');
    } finally {
        // Limpeza do ficheiro temporário local
        try {
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        } catch(e) { 
            console.warn("Falha na limpeza de ficheiros temporários:", e);
        }
    }
    
    return pdfBuffer;
}


// =========================================================================
// FUNÇÃO PRINCIPAL: Serverless Function (Handler)
// =========================================================================

export default async function handler(req, res) {
    // Headers CORS 
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const { shift, date, tables, recipients } = req.body || {};
        
        if (!shift || !date || !tables || !recipients || recipients.length === 0) {
            return res.status(400).json({ 
                error: "Faltam dados essenciais ou a lista de destinatários está vazia.",
                details: "Certifique-se que 'shift', 'date', 'tables' e 'recipients' foram enviados." 
            });
        }
        
        // ----------------------------------------------------
        // A. PREENCHIMENTO DO EXCELJS
        // ----------------------------------------------------
        
        const response = await fetch("https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/template_planeamento.xlsx");
        const baseBuffer = Buffer.from(await response.arrayBuffer());
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(baseBuffer);
        const sheet = workbook.getWorksheet(1);

        const [year, month, day] = date.split("-");
        const monthNames = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
        const monthName = monthNames[parseInt(month, 10) - 1] || month;
        const formattedDate = `${day} ${monthName} ${year}`;
        const shiftHours = shift === "D" ? "08:00-20:00" : "20:00-08:00";
        const finalFileName = `planeamento_${day}_${monthName}_${year}_${shift}`;
        
        sheet.getCell("B14").value = `Dia: ${formattedDate} | Turno ${shift} | ${shiftHours}`;

        const tableStartRows = {"OFOPE": 19, "CHEFE DE SERVIÇO": 24, "OPTEL": 29, "EQUIPA 01": 34, "EQUIPA 02": 43, "LOGÍSTICA": 52, "INEM": 58, "INEM - Reserva": 65, "SERVIÇO GERAL": 72,};

        for (let tbl of tables) {
            const startRow = tableStartRows[tbl.title];
            if (!startRow) continue;

            for (let i = 0; i < tbl.rows.length; i++) {
                const rowData = tbl.rows[i];
                const rowNum = startRow + i;

                sheet.getCell(`B${rowNum}`).value = rowData.n_int || "";
                sheet.getCell(`C${rowNum}`).value = rowData.patente || "";
                sheet.getCell(`D${rowNum}`).value = rowData.nome || "";
                sheet.getCell(`E${rowNum}`).value = rowData.entrada || "";
                sheet.getCell(`F${rowNum}`).value = rowData.saida || "";
                sheet.getCell(`G${rowNum}`).value = rowData.MP ? "X" : "";
                sheet.getCell(`H${rowNum}`).value = rowData.TAS ? "X" : "";
                sheet.getCell(`I${rowNum}`).value = rowData.obs || "";
            }
        }
        
        const finalXLSXBuffer = await workbook.xlsx.writeBuffer();
        
        // ----------------------------------------------------
        // B. CONVERSÃO PARA PDF (Usando Adobe Services)
        // ----------------------------------------------------
        const pdfBuffer = await convertXLSXToPDF(finalXLSXBuffer, finalFileName);
        
        // ----------------------------------------------------
        // C. ENVIO DO PDF POR EMAIL (Usando Nodemailer)
        // ----------------------------------------------------
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL_EMAIL,
                pass: GMAIL_APP_PASSWORD
            }
        });
        
        await transporter.sendMail({
            from: GMAIL_EMAIL,
            to: recipients.join(', '), 
            subject: `[PLANEAMENTO] - ${shift} - ${date}`,
            text: `Segue em anexo o Planeamento para ${shift} - ${date}, no formato PDF.`,
            attachments: [
                {
                    filename: `${finalFileName}.pdf`, // Envia como PDF
                    content: pdfBuffer, 
                    contentType: 'application/pdf'
                }
            ]
        });

        // ----------------------------------------------------
        // D. RESPOSTA DE SUCESSO AO FRONTEND
        // ----------------------------------------------------
        return res.status(200).json({
            success: true,
            message: `PDF gerado e enviado com sucesso para ${recipients.length} destinatário(s) (${recipients.join(', ')}).`
        });

    } catch (err) {
        console.error("Erro no processo de conversão/envio:", err);
        return res.status(500).json({
            error: "Erro no processo de geração e envio de email",
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}
