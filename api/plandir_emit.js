import ExcelJS from "exceljs";

export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // responde ao preflight
  }

  try {
    const { shift, date, tables } = req.body || {};
    if (!shift || !date || !tables) {
      return res.status(400).json({ error: "Faltam shift, date ou tables" });
    }

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
        const row = sheet.getRow(startRow + i);

       row.getCell("A").value = rowData.n_int || "";
        row.getCell("A").value = rowData.patente || "";
        row.getCell("A").value = rowData.nome || "";
        row.getCell("A").value = rowData.entrada || "";
        row.getCell("A").value = rowData.saida || "";
        row.getCell("A").value = rowData.MP ? "X" : "";
        row.getCell("A").value = rowData.TAS ? "X" : "";
        row.getCell("A").value = rowData.obs || "";

        row.commit();
      }
    }

    const outputBuffer = await workbook.xlsx.writeBuffer();
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
    console.error("❌ Erro a emitir planeamento:", err);
    res.status(500).json({ error: "Erro a gerar planeamento" });
  }
}
