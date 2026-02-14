// /api/gerar-folha-inem.js

import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    // 1. Buscar template
    const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error('Erro ao carregar template');
    }
    const templateBuffer = await templateResponse.arrayBuffer();

    // 2. Carregar com ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);

    if (workbook.worksheets.length === 0) {
      throw new Error('Template não tem worksheets');
    }

    const worksheet = workbook.worksheets[0];

    // 3. Cabeçalho
    worksheet.getCell('B7').value = `${MONTH_NAMES[month - 1]} ${year}`;
    worksheet.getCell('B68').value = workingHours;

    // 4. Dias do mês
    const daysInMonth = new Date(year, month, 0).getDate();

    // 5. Dias da semana e números
    for (let d = 1; d <= 31; d++) {
      const colIndex = 6 + d;

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

    // 6. Preencher funcionários
    const maxEmployees = Math.min(employees.length, 20);

    for (let idx = 0; idx < maxEmployees; idx++) {
      const emp = employees[idx];
      const excelRow = 13 + idx;

      // Dados básicos - SEM cores
      worksheet.getCell(excelRow, 2).value = emp.n_int;
      worksheet.getCell(excelRow, 3).value = emp.abv_name;
      worksheet.getCell(excelRow, 4).value = emp.function;
      worksheet.getCell(excelRow, 5).value = emp.team;
      worksheet.getCell(excelRow, 38).value = emp.total;

      // Turnos - SÓ motoristas INEM têm cor rosa
      for (let d = 0; d < daysInMonth; d++) {
        const turno = emp.shifts[d] || "";
        const isDriver = emp.drivers && emp.drivers[d]; // ✨ NOVO: flag de motorista
        const colIndex = 7 + d;
        
        const cell = worksheet.getCell(excelRow, colIndex);
        cell.value = turno;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        // ✨ APENAS aplicar cor rosa se for motorista
        if (isDriver) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF69B4' } // Rosa (motorista INEM)
          };
          cell.font = {
            bold: true,
            color: { argb: 'FF000000' } // Texto preto
          };
        }
      }
    }

    // 7. Limpar linhas vazias
    for (let i = maxEmployees; i < 20; i++) {
      const excelRow = 13 + i;
      
      for (let col = 2; col <= 38; col++) {
        worksheet.getCell(excelRow, col).value = "";
      }
    }

    // 8. Gerar Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // 9. Download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Folha_INEM_${MONTH_NAMES[month - 1]}_${year}.xlsx"`);
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Erro ao gerar folha:', error);
    res.status(500).json({ error: error.message });
  }
}
