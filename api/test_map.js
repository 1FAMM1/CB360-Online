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

// Funções utilitárias para ExcelJS
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

// Limpar texto para Excel
function sanitizeText(value) {
    if (value == null) return "-";
    return String(value).replace(/[\n\r\t]+/g, " ").trim();
}

export default async function handleMapaSalarialTeste(req, res) {
    // Habilitar CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    let inputPath = null;

    try {
        const { year, month, employees } = req.body;
        const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];

        // 1. Carregar template
        const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
        const templateResponse = await fetch(TEMPLATE_URL);
        if (!templateResponse.ok) throw new Error(`Erro ao carregar template do GitHub: ${templateResponse.status}`);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        // 2. Cabeçalho
        worksheet.getCell("B6").value = `MAPA DE PROCESSAMENTO - ${MONTH_NAMES[month - 1]} ${year}`;

        // 3. Preenchimento de dados
        const ROW_START = 8;
        const ROW_MAX = 60;

        employees.forEach((emp, idx) => {
            const row = ROW_START + idx;
            if (row > ROW_MAX) return;

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
                const cell = worksheet.getCell(`${col}${row}`);
                breakStyle(cell);
                cell.value = sanitizeText(val);
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

        // 4. Configuração de impressão
        worksheet.pageSetup = {
            orientation: "landscape",
            paperSize: 9,
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: { left: 0.1, right: 0.1, top: 0.2, bottom: 0.2 }
        };

        // 5. Gerar arquivo temporário
        const tempDir = os.tmpdir();
        inputPath = path.join(tempDir, `salary_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(inputPath);
        if (!fs.existsSync(inputPath)) throw new Error("Erro: arquivo XLSX não foi gerado corretamente");

        // 6. Adobe PDF Services
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
        for await (const chunk of streamAsset.readStream) chunks.push(chunk);

        // Limpeza
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        // 7. Responder PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Mapa_Salarial_${year}_${month}.pdf`);
        return res.status(200).send(Buffer.concat(chunks));

    } catch (error) {
        if (inputPath && fs.existsSync(inputPath)) {
            try { fs.unlinkSync(inputPath); } catch(e) {}
        }
        console.error("Erro no Handler PDF:", error);
        return res.status(500).json({ error: error.message });
    }
}
