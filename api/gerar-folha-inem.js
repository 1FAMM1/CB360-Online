import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { year, month, employees, workingHours } = req.body;
    const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
    
    const templateResponse = await fetch(templateUrl);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    employees.forEach((emp, idx) => {
      const excelRow = 13 + idx;
      
      // 1. Dados Básicos (NI, Nome, etc) - Garantir que fiquem SEM COR de fundo
      const colsInfo = [2, 3, 4, 5, 38];
      colsInfo.forEach(col => {
        const cell = worksheet.getCell(excelRow, col);
        cell.value = (col === 38) ? emp.total : (col === 2 ? emp.n_int : col === 3 ? emp.abv_name : col === 4 ? emp.function : emp.team);
        cell.fill = { type: 'none' }; // Remove cor do template
        cell.font = { color: { argb: 'FF000000' }, bold: false };
      });

      // 2. Turnos e Cores Dinâmicas
      emp.shifts.forEach((turno, dIdx) => {
        const colIndex = 7 + dIdx;
        const cell = worksheet.getCell(excelRow, colIndex);
        const hexColor = emp.colors[dIdx];

        cell.value = turno;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Só pinta se a cor não for branca (FFFFFF)
        if (hexColor && hexColor !== "FFFFFF") {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + hexColor }
          };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
        } else {
          cell.fill = { type: 'none' }; // Limpa a cor se for branco/folga
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buffer));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
