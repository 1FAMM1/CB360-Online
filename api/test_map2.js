import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { 
    ServicePrincipalCredentials, 
    PDFServices, 
    MimeType, 
    CreatePDFJob, 
    CreatePDFResult 
} from "@adobe/pdfservices-node-sdk";

export const config = {
    api: { bodyParser: { sizeLimit: "10mb" } },
};

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    let inputPath = null;

    try {
        // 1️⃣ Carregar template do GitHub
        const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
        const templateResponse = await fetch(TEMPLATE_URL);
        if (!templateResponse.ok) throw new Error("Erro ao carregar template do GitHub");

        const buffer = await templateResponse.buffer();
        console.log("Template carregado, tamanho:", buffer.length, "bytes");

        // 2️⃣ Guardar em ficheiro temporário SEM modificar nada
        const tempDir = os.tmpdir();
        inputPath = path.join(tempDir, `salary_test_${Date.now()}.xlsx`);
        fs.writeFileSync(inputPath, buffer);
        console.log("Ficheiro temporário criado:", inputPath);

        // 3️⃣ Adobe PDF Services
        const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
        const pdfServices = new PDFServices({ credentials });

        const inputAsset = await pdfServices.upload({
            readStream: fs.createReadStream(inputPath),
            mimeType: MimeType.XLSX
        });
        console.log("Upload Adobe OK");

        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await pdfServices.submit({ job });
        const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

        const chunks = [];
        for await (let chunk of streamAsset.readStream) chunks.push(chunk);
        console.log("PDF gerado, tamanho:", Buffer.concat(chunks).length, "bytes");

        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Mapa_Teste.pdf`);
        return res.status(200).send(Buffer.concat(chunks));

    } catch (error) {
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        console.error("Erro no handler:", error);
        return res.status(500).json({ error: error.message });
    }
}
