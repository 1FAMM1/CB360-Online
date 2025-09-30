// pages/api/emitir_planeamento.js
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { shift, date, tables } = req.body || {};
    if (!shift || !date || !tables) {
      return res.status(400).json({ error: "Faltam shift, date ou tables" });
    }

    // 🔹 Passo 1: Carregar template XLSX
    let workbook, sheet;
    try {
      const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/template_planeamento.xlsx";
      const templateResponse = await fetch(templateUrl);
      if (!templateResponse.ok) throw new Error("Falha ao baixar template XLSX");
      const templateBuffer = Buffer.from(await templateResponse.arrayBuffer());

      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);
      sheet = workbook.getWorksheet(1);
    } catch (err) {
      console.error("Erro ExcelJS:", err);
      return res.status(500).json({ error: "Erro ao carregar template XLSX", details: err.message });
    }

    // Preencher dados
    const hora = shift === "D" ? "08:00-20:00" : "20:00-08:00";
    sheet.getCell("B14").value = `Caso ${shift}\nDia: ${date} | Turno ${shift} | ${hora}`;

    const tableStartRows = {
      "OFOPE": 19, "CHEFE DE SERVIÇO": 24, "OPTEL": 29, "EQUIPA 01": 34,
      "EQUIPA 02": 43, "LOGÍSTICA": 52, "INEM": 58, "INEM - Reserva": 65, "SERVIÇO GERAL": 72
    };

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

    // 🔹 Passo 2: Gerar buffer XLSX
    let xlsxBuffer;
    try {
      xlsxBuffer = await workbook.xlsx.writeBuffer();
    } catch (err) {
      console.error("Erro gerar buffer XLSX:", err);
      return res.status(500).json({ error: "Erro ao gerar buffer XLSX", details: err.message });
    }
    const xlsxBase64 = xlsxBuffer.toString("base64");

    // 🔹 Passo 3: Converter para PDF
    let pdfBuffer;
    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true
      });
      const page = await browser.newPage();

      const htmlContent = `
        <html>
        <body>
          <embed src="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${xlsxBase64}" width="100%" height="1000px" type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
        </body>
        </html>
      `;

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      pdfBuffer = await page.pdf({ format: "A4" });
      await browser.close();
    } catch (err) {
      console.error("Erro gerar PDF:", err);
      return res.status(500).json({ error: "Erro ao gerar PDF", details: err.message });
    }

    // 🔹 Passo 4: Enviar email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_EMAIL, pass: process.env.GMAIL_APP_PASSWORD }
      });

      await transporter.sendMail({
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL,
        subject: `Planeamento Diário - ${shift} ${date}`,
        text: `Segue em anexo o planeamento diário ${shift} - ${date}`,
        attachments: [{ filename: `planeamento_${date}_${shift}.pdf`, content: pdfBuffer }]
      });
    } catch (err) {
      console.error("Erro enviar email:", err);
      return res.status(500).json({ error: "Erro ao enviar email", details: err.message });
    }

    return res.status(200).json({ success: true, message: "PDF gerado e email enviado!" });

  } catch (err) {
    console.error("Erro geral:", err);
    return res.status(500).json({ error: "Erro inesperado", details: err.message });
  }
}
