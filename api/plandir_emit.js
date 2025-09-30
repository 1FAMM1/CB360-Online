import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

export default async function handler(req, res) {
  // headers CORS etc. (igual ao teu código)
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
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

    // Caminho da pasta Processar
    const pastaProcessar = "C:\\Planeamentos\\Processar\\";
    if (!fs.existsSync(pastaProcessar)) {
      fs.mkdirSync(pastaProcessar, { recursive: true });
    }

    const fileName = `Planeamento Diário ${date} ${shift}.xlsx`;
    const filePath = path.join(pastaProcessar, fileName);

    await workbook.xlsx.writeFile(filePath);

    // Retornar apenas status de sucesso
    res.status(200).json({ message: "Ficheiro criado na pasta Processar", path: filePath });

  } catch (err) {
    console.error("Erro a emitir planeamento:", err);
    res.status(500).json({ error: "Erro a gerar planeamento", details: err.message });
  }
}
