import PDFDocument from "pdfkit";
import getStream from "get-stream";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { shift, date, tables } = req.body || {};

    if (!shift || !date || !tables || !Array.isArray(tables)) {
      return res.status(400).json({ error: "Faltam shift, date ou tables válidos" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const primaryColor = "#1E293B";
    const accentColor = "#2563EB";
    const textGray = "#374151";
    const lightGray = "#E5E7EB";

    // Logotipo (opcional)
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 35, { width: 70 });
      }
    } catch (err) {
      console.warn("Logo não carregada:", err.message);
    }

    // Cabeçalho
    doc.font("Helvetica-Bold").fontSize(18).fillColor(primaryColor);
    doc.text("PLANEAMENTO DIÁRIO", 120, 50, { align: "center" });
    const hora = shift === "D" ? "08:00 - 20:00" : "20:00 - 08:00";
    doc.moveDown(0.8);
    doc.font("Helvetica").fontSize(12).fillColor(textGray);
    doc.text(`Dia: ${date} | Turno ${shift} | ${hora}`, { align: "center" });
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(accentColor).stroke();
    doc.moveDown(1.5);

    // Corpo do PDF
    for (const tbl of tables) {
      const tableTitle = tbl.title || "SEM TÍTULO";
      const rows = Array.isArray(tbl.rows) ? tbl.rows : [];

      const startY = doc.y + 8;
      const estimatedHeight = 30 + rows.length * 18;
      doc.save()
        .roundedRect(40, startY, 515, estimatedHeight, 8)
        .fillOpacity(0.04)
        .fill(accentColor)
        .restore();

      doc.font("Helvetica-Bold").fontSize(13).fillColor(accentColor);
      doc.text(tableTitle.toUpperCase(), 50, startY + 8);
      doc.moveDown(0.8);

      const headers = ["Nº", "Patente", "Nome", "Entrada", "Saída", "MP", "TAS", "Obs"];
      const colWidths = [30, 70, 150, 55, 55, 30, 30, 80];
      const colX = [50];
      for (let i = 1; i < colWidths.length; i++) colX.push(colX[i - 1] + colWidths[i - 1]);

      let y = doc.y;
      doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor);
      headers.forEach((h, i) => doc.text(h, colX[i] + 2, y, { width: colWidths[i], align: "left" }));

      y += 14;
      doc.moveTo(50, y).lineTo(530, y).strokeColor(lightGray).stroke();

      doc.font("Helvetica").fontSize(9).fillColor(textGray);
      rows.forEach((row, rowIndex) => {
        y += 4;
        if (y > 760) {
          doc.addPage();
          y = 60;
        }

        const rowData = [
          row.n_int || "",
          row.patente || "",
          row.nome || "",
          row.entraNCE || "",
          row.saida || "",
          row.MP ? "X" : "",
          row.TAS ? "X" : "",
          row.obs || ""
        ];

        if (rowIndex % 2 === 1) {
          doc.save()
            .rect(50, y - 2, 480, 14)
            .fillOpacity(0.03)
            .fill(primaryColor)
            .restore();
        }

        rowData.forEach((t, i) => {
          doc.text(t, colX[i] + 2, y, { width: colWidths[i], align: "left" });
        });

        y += 14;
        doc.moveTo(50, y).lineTo(530, y).strokeColor("#D1D5DB").stroke();
      });

      // Bordas da tabela
      doc.save().strokeColor("#D1D5DB");
      colX.forEach(x => doc.moveTo(x, startY).lineTo(x, y).stroke());
      doc.moveTo(530, startY).lineTo(530, y).stroke();
      doc.restore();

      doc.moveDown(1.5);
    }

    const horaAtual = new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    doc.moveDown(2);
    doc.fontSize(9).fillColor("#6B7280");
    doc.text(`Processado automaticamente por SALOC 360  |  Emitido em: ${date} às ${horaAtual}`, { align: "center" });

    doc.end();
    const pdfBuffer = await getStream.buffer(doc);

    res.setHeader("Content-Disposition", `attachment; filename=planeamento_${date}_${shift}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ error: "Erro ao gerar PDF", details: err.message });
  }
}
