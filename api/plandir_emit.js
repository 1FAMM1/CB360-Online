import ExcelJS from "exceljs";

export default async function handler(req, res) {
  try {
    // 1. Buscar o template diretamente do GitHub raw
    const response = await fetch(
      "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/template_planeamento.xlsx"
    );
    const buffer = Buffer.from(await response.arrayBuffer());

    // 2. Carregar o workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet(1); // primeira sheet

    // 3. Preencher dados (exemplo estático)
    sheet.getCell("B2").value = "29 SET 2025"; // Dia
    sheet.getCell("C2").value = "Turno D";     // Turno
    sheet.getCell("D2").value = "08:00-20:00"; // Horário

    // Aqui podes ciclar as tuas tabelas e meter nomes, n_int, etc

    // 4. Gerar o novo Excel em memória
    const outputBuffer = await workbook.xlsx.writeBuffer();

    // 5. Enviar como download
    res.setHeader("Content-Disposition", "attachment; filename=planeamento.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(outputBuffer));
  } catch (err) {
    console.error("❌ Erro a emitir planeamento:", err);
    res.status(500).json({ error: "Erro a gerar planeamento" });
  }
}
