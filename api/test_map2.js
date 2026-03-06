import ExcelJS from "exceljs";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
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

// Funções de utilidade
function breakStyle(cell) {
    cell.style = { ...(cell.style || {}) };
    if (cell.style.alignment) cell.style.alignment = { ...cell.style.alignment };
    if (cell.style.border) cell.style.border = { ...cell.style.border };
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
    // ===== CORS =====
    res.setHeader("Access-Control-Allow-Origin", "*"); // ou "https://cdpn.io"
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Preflight
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    let inputPath = null;

    try {
        const { year, month, employees } = req.body;
        const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];

        // 1️⃣ Carregar template do GitHub
        const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
        const templateResponse = await fetch(TEMPLATE_URL);
        if (!templateResponse.ok) throw new Error("Erro ao carregar template do GitHub");

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        // 2️⃣ Cabeçalho
        worksheet.getCell("B6").value = `MAPA DE PROCESSAMENTO - ${MONTH_NAMES[month-1]} ${year}`;

        // 3️⃣ Preencher dados
        const ROW_START = 8;
        const ROW_MAX = 60;

        employees.forEach((emp, index) => {
            const rowNum = ROW_START + index;
            if (rowNum > ROW_MAX) return;

            const colMap = {
                name: "B",
                baixas: "C",
                ferias: "D",
                parental: "E",
                nojo: "F",
                justificadas: "G",
                injustificadas: "H"
            };

            const writeData = (col, val) => {
                const cell = worksheet.getCell(`${col}${rowNum}`);
                breakStyle(cell);
                // Colocar o conteúdo direto, sem \n
                cell.value = val || "-";
                cell.alignment = { 
                    vertical: 'middle',
                    horizontal: col === "B" ? 'left' : 'center',
                    wrapText: true
                };
                setBorder(cell);
            };

            writeData(colMap.name, emp.name);
            writeData(colMap.baixas, emp.baixas);
            writeData(colMap.ferias, emp.ferias);
            writeData(colMap.parental, emp.parental);
            writeData(colMap.nojo, emp.nojo);
            writeData(colMap.justificadas, emp.justificadas);
            writeData(colMap.injustificadas, emp.injustificadas);
        });

        // Ocultar linhas não usadas
        for (let i = ROW_START + employees.length; i <= ROW_MAX; i++) {
            worksheet.getRow(i).hidden = true;
        }

        // 4️⃣ Configuração de impressão
        worksheet.pageSetup = {
            orientation: "landscape",
            paperSize: 9, // A4
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: { left:0.1, right:0.1, top:0.2, bottom:0.2 }
        };

        // 5️⃣ Criar arquivo temporário
        const tempDir = os.tmpdir();
        inputPath = path.join(tempDir, `salary_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(inputPath);

        // 6️⃣ Adobe PDF Services
        const credentials = new ServicePrincipalCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
        const pdfServices = new PDFServices({ credentials });
        const inputAsset = await pdfServices.upload({
            readStream: fs.createReadStream(inputPath),
            mimeType: MimeType.XLSX
        });

        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await pdfServices.submit({ job });
        const result = await pdfServices.getJobResult({ pollingURL, resultType: CreatePDFResult });
        const streamAsset = await pdfServices.getContent({ asset: result.result.asset });

        const chunks = [];
        for await (let chunk of streamAsset.readStream) chunks.push(chunk);

        // Limpeza
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        // Enviar PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Mapa_Salarial_${year}_${month}.pdf`);
        return res.status(200).send(Buffer.concat(chunks));

    } catch (error) {
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        console.error("Erro no handler:", error);
        return res.status(500).json({ error: error.message });
    }
}
