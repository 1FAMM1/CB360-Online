import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { year, month, employees, workingHours } = req.body;

    const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
    const templateResponse = await fetch(templateUrl);
    const templateBuffer = await templateResponse.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const worksheet = workbook.worksheets[0];

    // Cabeçalhos
    worksheet.getCell('B7').value = `${MONTH_NAMES[month - 1]} ${year}`;
    worksheet.getCell('B68').value = workingHours;

    const daysInMonth = new Date(year, month, 0).getDate();

    // Datas e dias da semana
    for (let d = 1; d <= 31; d++) {
      const colIndex = 6 + d;
      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        worksheet.getCell(10, colIndex).value = WEEKDAY_NAMES[date.getDay()];
        worksheet.getCell(11, colIndex).value = d;
      } else {
        worksheet.getCell(10, colIndex).value = "";
        worksheet.getCell(11, colIndex).value = "";
      }
    }

    // Processar Funcionários
    const maxEmployees = Math.min(employees.length, 20);

    for (let idx = 0; idx < maxEmployees; idx++) {
      const emp = employees[idx];
      const excelRow = 13 + idx;

      worksheet.getCell(excelRow, 2).value = emp.n_int;
      worksheet.getCell(excelRow, 3).value = emp.abv_name;
      worksheet.getCell(excelRow, 4).value = emp.function;
      worksheet.getCell(excelRow, 5).value = emp.team;
      worksheet.getCell(excelRow, 38).value = emp.total;

      // Turnos e Cores Dinâmicas
      for (let d = 0; d < daysInMonth; d++) {
        const colIndex = 7 + d;
        const cell = worksheet.getCell(excelRow, colIndex);
        
        cell.value = emp.shifts[d] || "";
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Aplicar a cor enviada pelo frontend (se não for branca)
        const hexColor = emp.colors ? emp.colors[d] : "FFFFFF";
        
        if (hexColor !== "FFFFFF" && hexColor !== "000000" && hexColor !== "TRANSPARENT") {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + hexColor } // FF garante opacidade total
          };
          // Estilo de texto para melhor leitura em células coloridas
          cell.font = { bold: true, color: { argb: 'FF000000' } };
        }
      }
    }

    // Limpar linhas restantes no template
    for (let i = maxEmployees; i < 20; i++) {
      const excelRow = 13 + i;
      for (let col = 2; col <= 38; col++) {
        const cell = worksheet.getCell(excelRow, col);
        cell.value = "";
        cell.fill = { type: 'none' }; // Remove qualquer preenchimento residual
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Folha_INEM.xlsx"`);
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
}
