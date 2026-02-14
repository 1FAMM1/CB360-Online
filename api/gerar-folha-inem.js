import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Configuração de CORS para permitir chamadas do Codepen ou qualquer origem
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Responder ao Preflight do Navegador
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

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

    // Cabeçalho e Carga Horária
    worksheet.getCell('B7').value = `${MONTH_NAMES[month - 1]} ${year}`;
    worksheet.getCell('B68').value = workingHours;

    const daysInMonth = new Date(year, month, 0).getDate();

    // Preencher calendário (Dias 1-31)
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

    // Preencher Funcionários e Cores
    employees.forEach((emp, idx) => {
      const excelRow = 13 + idx;
      if (idx >= 20) return; // Limite do template

      worksheet.getCell(excelRow, 2).value = emp.n_int;
      worksheet.getCell(excelRow, 3).value = emp.abv_name;
      worksheet.getCell(excelRow, 4).value = emp.function;
      worksheet.getCell(excelRow, 5).value = emp.team;
      worksheet.getCell(excelRow, 38).value = emp.total;

      emp.shifts.forEach((turno, dIdx) => {
        const colIndex = 7 + dIdx;
        const cell = worksheet.getCell(excelRow, colIndex);
        cell.value = turno;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        const hexColor = emp.colors[dIdx];
        // Se houver cor e não for branco/transparente
        if (hexColor && hexColor !== "FFFFFF" && hexColor !== "000000") {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + hexColor }
          };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.border = {
            top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
          };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Folha_INEM_${year}.xlsx"`);
    return res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ error: error.message });
  }
}
