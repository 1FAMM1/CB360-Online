import ExcelJS from "exceljs";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // ✅ CORS - headers para TODAS as respostas
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { shift, date, tables } = req.body || {};
    if (!shift || !date || !tables) {
      return res.status(400).json({ error: "Faltam shift, date ou tables" });
    }

    // 📊 Gerar Excel
    const response = await fetch(
      "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/template_planeamento.xlsx"
    );
    const buffer = Buffer.from(await response.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet(1);
    
    const hora = shift === "D" ? "08:00-20:00" : "20:00-08:00";
    sheet.getCell("B14").value = `Caso ${shift}\nDia: ${date} | Turno ${shift} | ${hora}`;
    
    const tableStartRows = {
      "OFOPE": 19,
      "CHEFE DE SERVIÇO": 24,
      "OPTEL": 29,
      "EQUIPA 01": 34,
      "EQUIPA 02": 43,
      "LOGÍSTICA": 52,
      "INEM": 58,
      "INEM - Reserva": 65,
      "SERVIÇO GERAL": 72
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

    const outputBuffer = await workbook.xlsx.writeBuffer();

    // 📧 Enviar Email via GMAIL
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL,
      subject: "AUTO_PLANEAMENTO",
      text: `Planeamento ${shift} - ${date}`,
      attachments: [
        {
          filename: `planeamento_${date}_${shift}.xlsx`,
          content: outputBuffer
        }
      ]
    });

    // ✅ Resposta de sucesso
    return res.status(200).json({ 
      success: true, 
      message: "Planeamento enviado com sucesso!" 
    });

  } catch (err) {
    console.error("❌ Erro a emitir planeamento:", err);
    return res.status(500).json({ 
      error: "Erro a gerar/enviar planeamento",
      details: err.message 
    });
  }
}
