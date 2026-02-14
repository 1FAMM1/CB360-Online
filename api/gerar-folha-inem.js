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

    // Mapeamento de cores baseado no texto do turno (ajusta os códigos Hex se precisares)
    const SHIFT_COLORS = {
      'D': 'FFFF00',  // Amarelo
      'N': '0000FF',  // Azul (podes usar '1E90FF' para azul mais claro)
      'FO': '00FF00', // Verde
      'P': 'FF0000',  // Vermelho
    };

    employees.forEach((emp, idx) => {
      const excelRow = 13 + idx;
      
      // Limpar e preencher dados básicos (NI, Nome, Função, Equipa)
      [2, 3, 4, 5, 38].forEach(col => {
        const cell = worksheet.getCell(excelRow, col);
        cell.fill = { type: 'none' }; // Garante que fica branco
        cell.font = { color: { argb: 'FF000000' }, bold: false };
        
        if (col === 2) cell.value = emp.n_int;
        if (col === 3) cell.value = emp.abv_name;
        if (col === 4) cell.value = emp.function;
        if (col === 5) cell.value = emp.team;
        if (col === 38) cell.value = emp.total;
      });

      // Preencher turnos com cores inteligentes
      emp.shifts.forEach((turno, dIdx) => {
        const colIndex = 7 + dIdx;
        const cell = worksheet.getCell(excelRow, colIndex);
        cell.value = turno;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        const color = SHIFT_COLORS[turno];

        if (color) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + color }
          };
          // Se o fundo for Azul (N), colocar o texto em Branco para ler melhor
          cell.font = { 
            bold: true, 
            color: { argb: turno === 'N' ? 'FFFFFFFF' : 'FF000000' } 
          };
        } else {
          cell.fill = { type: 'none' };
          cell.font = { color: { argb: 'FF000000' } };
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
