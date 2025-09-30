import ExcelJS from "exceljs";

export default async function handler(req, res) {
  // Configura CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // permite qualquer domínio
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde imediatamente a preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { shift, date, tables } = req.body || {};
    if (!shift || !date || !tables) {
      return res.status(400).json({ error: "Faltam shift, date ou tables" });
    }

    // Carrega o template do Excel
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

    // Define headers para download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=planeamento_${date}_${shift}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(Buffer.from(outputBuffer));
  } catch (err) {
    console.error("Erro a emitir planeamento:", err);
    res.status(500).json({ error: "Erro a gerar planeamento", details: err.message });
  }
}
