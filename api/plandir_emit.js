import ExcelJS from "exceljs";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { shift, date } = req.body || {};
    if (!shift || !date) {
      return res.status(400).json({ error: "Faltam shift ou date" });
    }

    console.log("Carregando template XLSX...");
    const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/template_planeamento.xlsx";
    const response = await fetch(templateUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet(1);

    const hora = shift === "D" ? "08:00-20:00" : "20:00-08:00";
    sheet.getCell("B14").value = `Caso ${shift}\nDia: ${date} | Turno ${shift} | ${hora}`;

    console.log("Gerando buffer XLSX...");
    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    const xlsxBase64 = xlsxBuffer.toString("base64");

    console.log("Convertendo para PDF...");
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(`
      <html><body>
        <embed src="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${xlsxBase64}" width="100%" height="1000px" type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
      </body></html>`, 
      { waitUntil: "networkidle0" }
    );

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    console.log("Enviando PDF...");
    res.setHeader("Content-Disposition", `attachment; filename=planeamento_${date}_${shift}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: err.message });
  }
}
