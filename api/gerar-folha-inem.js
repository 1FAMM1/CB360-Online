import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const { year, month, employees, workingHours } = req.body;
    const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
    
    const templateResponse = await fetch(templateUrl);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await templateResponse.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    // Preenchimento de datas e cabeçalho (omitido para brevidade, manter igual ao anterior)
    worksheet.getCell('B7').value = `${month}/${year}`;
    worksheet.getCell('B68').value = workingHours;

    employees.forEach((emp, idx) => {
      const excelRow = 13 + idx;
      
      // Dados básicos
      worksheet.getCell(excelRow, 2).value = emp.n_int;
      worksheet.getCell(excelRow, 3).value = emp.abv_name;
      worksheet.getCell(excelRow, 4).value = emp.function;
      worksheet.getCell(excelRow, 5).value = emp.team;
      worksheet.getCell(excelRow, 38).value = emp.total;

      // Turnos e Cores
      emp.shifts.forEach((turno, dIdx) => {
        const colIndex = 7 + dIdx;
        const cell = worksheet.getCell(excelRow, colIndex);
        const hexColor = emp.colors[dIdx];

        cell.value = turno;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Só aplica preenchimento se não for branco puro
        if (hexColor && hexColor !== "FFFFFF") {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + hexColor }
          };
          // Força bordas para não sumirem com a cor
          cell.border = {
            top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
          };
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
