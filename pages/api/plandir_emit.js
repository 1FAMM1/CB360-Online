import ExcelJS from "exceljs";

export default async function handler(req, res) {
  // ======== CORS ========
  res.setHeader('Access-Control-Allow-Origin', '*'); // permite qualquer origem para teste local
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // responde preflight
  }

  try {
    const { shift, date } = req.body || {};
    if (!shift || !date) {
      return res.status(400).json({ error: "Faltam shift ou date" });
    }

    // 1. Buscar template
    const response = await fetch(
      "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/template_planeamento.xlsx"
    );
    const buffer = Buffer.from(await response.arrayBuffer());

    // 2. Carregar workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet(1);

    // 3. Preencher B14
    const hora = shift === "D" ? "08:00-20:00" : "20:00-08:00";
    sheet.getCell("B14").value = `Caso ${shift}\nDia: ${date} | Turno ${shift} | ${hora}`;

    // 4. Gerar Excel
    const outputBuffer = await workbook.xlsx.writeBuffer();

    // 5. Enviar para download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=planeamento.xlsx"
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
