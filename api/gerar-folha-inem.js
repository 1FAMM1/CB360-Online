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

    // Preenchimento básico
    worksheet.getCell('B7').value = `FEVEREIRO ${year}`; // Exemplo simplificado
    worksheet.getCell('B68').value = workingHours;

    employees.forEach((emp, idx) => {
      const excelRow = 13 + idx;
      
      // Escrever dados (SEM cor de fundo aqui para as primeiras colunas ficarem limpas)
      worksheet.getCell(excelRow, 2).value = emp.n_int;
      worksheet.getCell(excelRow, 3).value = emp.abv_name;
      worksheet.getCell(excelRow, 4).value = emp.function;
      worksheet.getCell(excelRow, 5).value = emp.team;
      worksheet.getCell(excelRow, 38).value = emp.total;

      // Aplicar Turnos e Cores INDIVIDUAIS
      emp.shifts.forEach((turno, dIdx) => {
        const colIndex = 7 + dIdx; // Começa na coluna G
        const cell = worksheet.getCell(excelRow, colIndex);
        const color = emp.colors[dIdx];

        cell.value = turno;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        if (color && color !== "FFFFFF") {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + color }
          };
          // Borda fina para separar os dias coloridos
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
