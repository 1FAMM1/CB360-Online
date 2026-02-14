// /api/gerar-folha-inem.js

import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

// Função para converter RGB para ARGB hex
function rgbToArgb(rgbString) {
  if (!rgbString || rgbString === 'rgb(255, 255, 255)' || rgbString === '') {
    return null; // Sem cor (branco ou vazio)
  }
  
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return 'FF' + r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
}

// Calcular se o texto deve ser preto ou branco baseado no brilho do fundo
function getTextColor(argbBg) {
  if (!argbBg || argbBg.length < 8) return 'FF000000';
  
  // Pegar RGB (ignorar alpha)
  const r = parseInt(argbBg.substring(2, 4), 16);
  const g = parseInt(argbBg.substring(4, 6), 16);
  const b = parseInt(argbBg.substring(6, 8), 16);
  
  // Calcular brilho (luminosidade)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Se fundo claro -> texto preto, se escuro -> texto branco
  return brightness > 128 ? 'FF000000' : 'FFFFFFFF';
}

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
      const cellB = worksheet.getCell(excelRow, 2);
      cellB.value = emp.n_int;
      cellB.fill = null;
      cellB.font = { bold: false, color: { argb: 'FF000000' } };
      
      const cellC = worksheet.getCell(excelRow, 3);
      cellC.value = emp.abv_name;
      cellC.fill = null;
      cellC.font = { bold: false, color: { argb: 'FF000000' } };
      
      const cellD = worksheet.getCell(excelRow, 4);
      cellD.value = emp.function;
      cellD.fill = null;
      cellD.font = { bold: false, color: { argb: 'FF000000' } };
      
      const cellE = worksheet.getCell(excelRow, 5);
      cellE.value = emp.team;
      cellE.fill = null;
      cellE.font = { bold: false, color: { argb: 'FF000000' } };
      
      const cellAL = worksheet.getCell(excelRow, 38);
      cellAL.value = emp.total;
      cellAL.fill = null;
      cellAL.font = { bold: false, color: { argb: 'FF000000' } };

      // Turnos - COM cores do frontend
      for (let d = 0; d < daysInMonth; d++) {
        const turno = emp.shifts[d] || "";
        const colorRgb = emp.colors ? emp.colors[d] : "";
        const colIndex = 7 + d;
        
        const cell = worksheet.getCell(excelRow, colIndex);
        cell.value = turno;
        
        // Converter cor RGB do frontend para ARGB do Excel
        const argbColor = rgbToArgb(colorRgb);
        
        if (argbColor) {
          // Aplicar cor de fundo
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: argbColor }
          };
          
          // Calcular cor do texto (preto ou branco)
          const textColor = getTextColor(argbColor);
          
          cell.font = {
            bold: true,
            color: { argb: textColor }
          };
          
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
        } else {
          // Sem cor - limpar formatação
          cell.fill = null;
          cell.font = { bold: false, color: { argb: 'FF000000' } };
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
        }
      }
    }

    // 7. Limpar linhas vazias
    for (let i = maxEmployees; i < 20; i++) {
      const excelRow = 13 + i;
      
      for (let col = 2; col <= 38; col++) {
        const cell = worksheet.getCell(excelRow, col);
        cell.value = "";
        cell.fill = null;
        cell.font = { bold: false, color: { argb: 'FF000000' } };
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
