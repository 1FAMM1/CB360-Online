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

// Converte referência de coluna letra para índice (B=2, C=3, ...)
function colLetterToIndex(letter) {
    return letter.toUpperCase().charCodeAt(0) - 64;
}

// Escapa caracteres especiais XML
function escapeXml(str) {
    if (!str || str === "-") return "-";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Gera o XML de uma célula inline string com wrap text
function makeCellXml(ref, styleIndex, value) {
    const escaped = escapeXml(value);
    // Usa inline string (t="inlineStr") para evitar dependência de sharedStrings
    return `<c r="${ref}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${escaped}</t></is></c>`;
}

// Gera XML de uma row com os dados do funcionário
function makeRowXml(rowNum, emp) {
    // Estilos baseados no template: linhas 8-46 usam s=4,5,5,5,5,5,6 (primeira linha) 
    // e s=7,8,8,8,8,8,9 (restantes). Usamos os estilos das linhas do meio (7,8,8,8,8,8,9)
    const styles = { B: 7, C: 8, D: 8, E: 8, F: 8, G: 8, H: 9 };
    const cols = ["B", "C", "D", "E", "F", "G", "H"];
    const values = {
        B: emp.name,
        C: emp.baixas,
        D: emp.ferias,
        E: emp.parental,
        F: emp.nojo,
        G: emp.justificadas,
        H: emp.injustificadas
    };

    const cells = cols.map(col => makeCellXml(`${col}${rowNum}`, styles[col], values[col] || "-")).join("");
    return `<row r="${rowNum}" spans="2:8" ht="15.75" x14ac:dyDescent="0.25">${cells}</row>`;
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

        // 1️⃣ Carregar template do GitHub como buffer raw
        const TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/xs_template.xlsx";
        const templateResponse = await fetch(TEMPLATE_URL);
        if (!templateResponse.ok) throw new Error("Erro ao carregar template do GitHub");
        const templateBuffer = await templateResponse.buffer();

        // 2️⃣ Abrir o ZIP (XLSX é um ZIP)
        const zip = new AdmZip(templateBuffer);

        // 3️⃣ Ler o sheet XML
        let sheetXml = zip.readAsText("xl/worksheets/sheet1.xml");

        // 4️⃣ Construir as rows de dados (linhas 8 em diante)
        const ROW_START = 8;
        const ROW_MAX = 220;

        // Remover todas as rows de dados existentes (linhas 8 a 220) do XML
        // Mantemos tudo antes da primeira <row r="8" e depois do </sheetData>
        const sheetDataStart = sheetXml.indexOf("<sheetData>");
        const sheetDataEnd = sheetXml.indexOf("</sheetData>") + "</sheetData>".length;
        const beforeSheetData = sheetXml.substring(0, sheetDataStart);
        const afterSheetData = sheetXml.substring(sheetDataEnd);

        // Extrair apenas a row 7 (cabeçalhos) do sheetData original
        const row7Match = sheetXml.match(/<row r="7"[^>]*>.*?<\/row>/s);
        const row7Xml = row7Match ? row7Match[0] : "";

        // Construir rows de dados
        let dataRowsXml = "";
        employees.forEach((emp, index) => {
            const rowNum = ROW_START + index;
            if (rowNum > ROW_MAX) return;
            dataRowsXml += makeRowXml(rowNum, emp);
        });

        // Ocultar linhas não usadas (marcar como hidden)
        for (let i = ROW_START + employees.length; i <= ROW_MAX; i++) {
            dataRowsXml += `<row r="${i}" spans="2:8" ht="15.75" hidden="1" x14ac:dyDescent="0.25"><c r="B${i}" s="2"/><c r="C${i}" s="2"/><c r="D${i}" s="2"/><c r="E${i}" s="2"/><c r="F${i}" s="2"/><c r="G${i}" s="2"/><c r="H${i}" s="2"/></row>`;
        }

        // Reconstruir sheetData
        const newSheetData = `<sheetData>${row7Xml}${dataRowsXml}</sheetData>`;

        // Reconstruir XML completo
        // Também atualizar pageSetup para landscape A4
        let newSheetXml = beforeSheetData + newSheetData + afterSheetData;

        // Atualizar pageSetup se necessário
        newSheetXml = newSheetXml.replace(
            /<pageSetup[^\/]*\/>/,
            `<pageSetup paperSize="9" scale="65" orientation="landscape" fitToPage="1" r:id="rId1"/>`
        );

        // 5️⃣ Substituir o sheet no ZIP
        zip.updateFile("xl/worksheets/sheet1.xml", Buffer.from(newSheetXml, "utf8"));

        // 6️⃣ Gerar buffer do XLSX modificado
        const modifiedBuffer = zip.toBuffer();

        // 7️⃣ Guardar em ficheiro temporário
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
