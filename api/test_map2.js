import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";
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

function escapeXml(str) {
    if (!str || str === "-") return "-";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/\n/g, "&#10;");
}

function makeCellXml(ref, styleIndex, value) {
    const escaped = escapeXml(value);
    return `<c r="${ref}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${escaped}</t></is></c>`;
}

// Novo template:
// Row 9  (primeira): B=7,  C=12, D=12, E=12, F=12, G=12, H=12, I=13
// Row 10+ (resto):   B=8,  C=14, D=14, E=14, F=14, G=14, H=14, I=15
// B = Nome | C = Sub. Turno | D = Baixa | E = Férias | F = Parental | G = Nojo | H = Just. | I = Injust.
function makeRowXml(rowNum, emp) {
    const isFirst = rowNum === 9;
    const styles = isFirst
        ? { B: 7,  C: 12, D: 12, E: 12, F: 12, G: 12, H: 12, I: 13 }
        : { B: 8,  C: 14, D: 14, E: 14, F: 14, G: 14, H: 14, I: 15 };

    const cols = ["B", "C", "D", "E", "F", "G", "H", "I"];
    const values = {
        B: emp.name,
        C: emp.subturno,
        D: emp.baixas,
        E: emp.ferias,
        F: emp.parental,
        G: emp.nojo,
        H: emp.justificadas,
        I: emp.injustificadas
    };

    const cells = cols.map(col => makeCellXml(`${col}${rowNum}`, styles[col], values[col] || "-")).join("");
    return `<row r="${rowNum}" spans="2:9" ht="15" x14ac:dyDescent="0.25">${cells}</row>`;
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    let inputPath = null;

    try {
        const { year, month, employees } = req.body;
        const MONTH_NAMES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
        const monthName = MONTH_NAMES[month - 1];

        // 1️⃣ Carregar template do GitHub
        const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
        const templateResponse = await fetch(TEMPLATE_URL);
        if (!templateResponse.ok) throw new Error("Erro ao carregar template do GitHub");
        const templateBuffer = await templateResponse.buffer();

        // 2️⃣ Abrir o ZIP
        const zip = new AdmZip(templateBuffer);

        // 3️⃣ Ler e modificar sheet XML
        let sheetXml = zip.readAsText("xl/worksheets/sheet1.xml");

        const ROW_START = 9;
        const ROW_MAX = 220;

        const sheetDataStart = sheetXml.indexOf("<sheetData>");
        const sheetDataEnd = sheetXml.indexOf("</sheetData>") + "</sheetData>".length;
        const beforeSheetData = sheetXml.substring(0, sheetDataStart);
        const afterSheetData = sheetXml.substring(sheetDataEnd);

        // Extrair rows de cabeçalho preservando conteúdo original
        const headerRows = [];
        for (const r of ["2", "3", "4", "6", "7", "8"]) {
            const match = sheetXml.match(new RegExp(`<row r="${r}"[^>]*>.*?</row>`, "s"));
            if (match) headerRows.push(match[0]);
        }

        // Substituir título em B6 com mês/ano dinâmico (s=10 no novo template)
        const row6Index = headerRows.findIndex(r => r.includes(`r="6"`));
        if (row6Index !== -1) {
            headerRows[row6Index] = headerRows[row6Index].replace(
                /<c r="B6"[^>]*>.*?<\/c>|<c r="B6"[^\/]*\/>/s,
                `<c r="B6" s="10" t="inlineStr"><is><t>MAPA SALARIAL - ${monthName} ${year}</t></is></c>`
            );
        }

        // 4️⃣ Construir rows de dados
        let dataRowsXml = "";
        employees.forEach((emp, index) => {
            const rowNum = ROW_START + index;
            if (rowNum > ROW_MAX) return;
            dataRowsXml += makeRowXml(rowNum, emp);
        });

        // Ocultar linhas não usadas
        for (let i = ROW_START + employees.length; i <= ROW_MAX; i++) {
            dataRowsXml += `<row r="${i}" spans="2:9" ht="15" hidden="1" x14ac:dyDescent="0.25"><c r="B${i}" s="8"/><c r="C${i}" s="14"/><c r="D${i}" s="14"/><c r="E${i}" s="14"/><c r="F${i}" s="14"/><c r="G${i}" s="14"/><c r="H${i}" s="14"/><c r="I${i}" s="15"/></row>`;
        }

        const newSheetData = `<sheetData>${headerRows.join("")}${dataRowsXml}</sheetData>`;
        let newSheetXml = beforeSheetData + newSheetData + afterSheetData;

        // Margens mínimas
        newSheetXml = newSheetXml.replace(
            /<pageMargins[^\/]*\/>/,
            `<pageMargins left="0.25" right="0.25" top="0.25" bottom="0.25" header="0" footer="0"/>`
        );

        // pageSetup landscape A4
        newSheetXml = newSheetXml.replace(
            /<pageSetup[^\/]*\/>/,
            `<pageSetup paperSize="9" scale="75" orientation="landscape" r:id="rId1"/>`
        );

        // Remover fitToPage
        newSheetXml = newSheetXml.replace(
            /<sheetPr><pageSetUpPr fitToPage="1"\/><\/sheetPr>/,
            `<sheetPr><pageSetUpPr fitToPage="0"/></sheetPr>`
        );

        // 5️⃣ Atualizar sheet no ZIP
        zip.updateFile("xl/worksheets/sheet1.xml", Buffer.from(newSheetXml, "utf8"));

        // 6️⃣ Gerar buffer
        const modifiedBuffer = zip.toBuffer();

        // 7️⃣ Guardar temporário
        const tempDir = os.tmpdir();
        inputPath = path.join(tempDir, `salary_${Date.now()}.xlsx`);
        fs.writeFileSync(inputPath, modifiedBuffer);

        // 8️⃣ Adobe PDF Services
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

        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Mapa_Salarial_${year}_${month}.pdf`);
        return res.status(200).send(Buffer.concat(chunks));

    } catch (error) {
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        console.error("Erro no handler:", error);
        return res.status(500).json({ error: error.message });
    }
}
