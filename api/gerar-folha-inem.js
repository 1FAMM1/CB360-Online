// /api/gerar-folha-inem.js

import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

// Função para converter RGB para ARGB hex
function rgbToArgb(rgbString) {
  if (!rgbString || rgbString === 'rgb(255, 255, 255)' || rgbString === '') {
    return null;
  }
  
  // Remover espaços extras
  const cleaned = rgbString.replace(/\s+/g, '');
  
  const match = cleaned.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!match) {
    console.log(`❌ ERRO: RGB inválido: "${rgbString}"`);
    return null;
  }
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  const result = 'FF' + r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
  
  return result;
}

// Calcular se o texto deve ser preto ou branco
function getTextColor(argbBg) {
  if (!argbBg || argbBg.length < 8) return 'FF000000';
  
  const r = parseInt(argbBg.substring(2, 4), 16);
  const g = parseInt(argbBg.substring(4, 6), 16);
  const b = parseInt(argbBg.substring(6, 8), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
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

    console.log(`📊 Gerando folha para ${month}/${year} com ${employees.length} funcionários`);

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
    console.log(`📅 Dias no mês: ${daysInMonth}`);

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

      console.log(`👤 Processando: ${emp.abv_name} (row ${excelRow})`);

      // Dados básicos - SEM cores
      worksheet.getCell(excelRow, 2).value = emp.n_int;
      worksheet.getCell(excelRow, 2).fill = null;
      worksheet.getCell(excelRow, 2).font = { bold: false, color: { argb: 'FF000000' } };
      
      worksheet.getCell(excelRow, 3).value = emp.abv_name;
      worksheet.getCell(excelRow, 3).fill = null;
      worksheet.getCell(excelRow, 3).font = { bold: false, color: { argb: 'FF000000' } };
      
      worksheet.getCell(excelRow, 4).value = emp.function;
      worksheet.getCell(excelRow, 4).fill = null;
      worksheet.getCell(excelRow, 4).font = { bold: false, color: { argb: 'FF000000' } };
      
      worksheet.getCell(excelRow, 5).value = emp.team;
      worksheet.getCell(excelRow, 5).fill = null;
      worksheet.getCell(excelRow, 5).font = { bold: false, color: { argb: 'FF000000' } };
      
      worksheet.getCell(excelRow, 38).value = emp.total;
      worksheet.getCell(excelRow, 38).fill = null;
      worksheet.getCell(excelRow, 38).font = { bold: false, color: { argb: 'FF000000' } };

      // Turnos - COM cores do frontend
      for (let d = 0; d < daysInMonth; d++) {
        const turno = emp.shifts[d] || "";
        const colorRgb = emp.colors && emp.colors[d] ? emp.colors[d] : "";
        const colIndex = 7 + d;
        
        const cell = worksheet.getCell(excelRow, colIndex);
        cell.value = turno;
        
        // Converter cor RGB para ARGB
        const argbColor = rgbToArgb(colorRgb);
        
        if (argbColor) {
          // Aplicar cor de fundo
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: argbColor }
          };
          
          // Calcular cor do texto
          const textColor = getTextColor(argbColor);
          
          cell.font = {
            bold: true,
            color: { argb: textColor }
          };
          
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
          
          if (d < 3) {
            console.log(`  Dia ${d+1}: turno="${turno}", RGB="${colorRgb}", ARGB="${argbColor}"`);
          }
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

    console.log(`✅ Excel gerado com sucesso`);

    // 8. Gerar Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // 9. Download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Folha_INEM_${MONTH_NAMES[month - 1]}_${year}.xlsx"`);
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('❌ Erro ao gerar folha:', error);
    res.status(500).json({ error: error.message });
  }
}
