// /api/gerar-folha-inem.js

import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { year, month, employees, workingHours } = req.body;

    if (!year || !month || !employees || !workingHours) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const MONTH_NAMES = [
      "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
      "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];

    const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // 1. Buscar template do GitHub
    const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error('Erro ao carregar template');
    }
    const templateBuffer = await templateResponse.arrayBuffer();

    // 2. Carregar template com ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);

    if (workbook.worksheets.length === 0) {
      throw new Error('Template não tem worksheets');
    }

    const worksheet = workbook.worksheets[0];

    // 3. Preencher cabeçalho
    worksheet.getCell('B7').value = `${MONTH_NAMES[month - 1]} ${year}`;
    worksheet.getCell('B68').value = workingHours;

    // 4. Calcular dias do mês
    const daysInMonth = new Date(year, month, 0).getDate();

    // 5. Preencher dias da semana e números (G10-AK10 e G11-AK11)
    for (let d = 1; d <= 31; d++) {
      const colIndex = 6 + d; // G=7, H=8... AK=37

      if (d <= daysInMonth) {
        const date = new Date(year, month - 1, d, 12, 0, 0);
        const weekday = WEEKDAY_NAMES[date.getDay()];

        worksheet.getCell(10, colIndex).value = weekday;
        worksheet.getCell(11, colIndex).value = d;
      } else {
        worksheet.getCell(10, colIndex).value = "";
        worksheet.getCell(11, colIndex).value = "";
      }
    }

    // 6. Preencher dados dos funcionários (rows 13-32, máximo 20)
    const maxEmployees = Math.min(employees.length, 20);

    for (let idx = 0; idx < maxEmployees; idx++) {
      const emp = employees[idx];
      const excelRow = 13 + idx;

      // Dados básicos (SEM CORES)
      worksheet.getCell(excelRow, 2).value = emp.n_int;        // B
      worksheet.getCell(excelRow, 3).value = emp.abv_name;     // C
      worksheet.getCell(excelRow, 4).value = emp.function;     // D
      worksheet.getCell(excelRow, 5).value = emp.team;         // E
      worksheet.getCell(excelRow, 38).value = emp.total;       // AL

      // Turnos (G-AK) = colunas 7-37 - SÓ AQUI TEM CORES
      for (let d = 0; d < emp.shifts.length && d < daysInMonth; d++) {
        const turno = emp.shifts[d];
        if (!turno) continue; // Pular dias vazios
        
        const colIndex = 7 + d; // G=7, H=8...

        const excelCell = worksheet.getCell(excelRow, colIndex);
        excelCell.value = turno;

        // Aplicar cores APENAS aos turnos
        const colorMap = {
          "D": { bg: "FFFF00", color: "000000" },
          "N": { bg: "00008B", color: "FFFFFF" },
          "M": { bg: "D3D3D3", color: "000000" },
          "FR": { bg: "FFA500", color: "000000" },
          "FO": { bg: "008000", color: "FFFFFF" },
          "FE": { bg: "00FFFF", color: "000000" },
          "BX": { bg: "FF0000", color: "FFFFFF" },
          "LC": { bg: "FF0000", color: "FFFFFF" },
          "LN": { bg: "FF0000", color: "FFFFFF" },
          "LP": { bg: "FF0000", color: "FFFFFF" },
          "FI": { bg: "FF0000", color: "FFFFFF" },
          "FJ": { bg: "FF0000", color: "FFFFFF" },
          "FOR": { bg: "808080", color: "FFFFFF" },
          "DP": { bg: "000000", color: "FFFFFF" }
        };

        if (colorMap[turno]) {
          const color = colorMap[turno];
          
          const bgArgb = color.bg.length === 6 ? 'FF' + color.bg : color.bg;
          const fontArgb = color.color.length === 6 ? 'FF' + color.color : color.color;
          
          excelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgArgb }
          };
          
          excelCell.font = {
            bold: true,
            color: { argb: fontArgb }
          };
          
          excelCell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
        }
      }
    }

    // 7. Limpar linhas vazias (se houver menos de 20 pessoas)
    for (let i = maxEmployees; i < 20; i++) {
      const excelRow = 13 + i;
      worksheet.getCell(excelRow, 2).value = "";
      worksheet.getCell(excelRow, 3).value = "";
      worksheet.getCell(excelRow, 4).value = "";
      worksheet.getCell(excelRow, 5).value = "";
      worksheet.getCell(excelRow, 38).value = "";

      for (let d = 1; d <= 31; d++) {
        const colIndex = 6 + d;
        worksheet.getCell(excelRow, colIndex).value = "";
      }
    }

    // 8. Gerar Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // 9. Retornar como download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Folha_INEM_${MONTH_NAMES[month - 1]}_${year}.xlsx"`);
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Erro ao gerar folha:', error);
    res.status(500).json({ error: error.message });
  }
}
