import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { year, month, employees, workingHours } = req.body;
        const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
        const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

        const templateUrl = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx";
        const templateResponse = await fetch(templateUrl);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        // Cabeçalhos
        worksheet.getCell('B7').value = `${MONTH_NAMES[month - 1]} ${year}`;
        worksheet.getCell('B68').value = workingHours;

        const daysInMonth = new Date(year, month, 0).getDate();

        // Datas e Dias da Semana
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

        // Preenchimento de Funcionários
        employees.forEach((emp, idx) => {
            const excelRow = 13 + idx;
            if (idx >= 20) return;

            // ✨ CORREÇÃO: Forçar colunas NI, Nome, Função e Equipa a ficarem BRANCAS (sem cor de turno)
            [2, 3, 4, 5, 38].forEach(col => {
                const cell = worksheet.getCell(excelRow, col);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                cell.font = { color: { argb: 'FF000000' }, bold: false };
                
                if (col === 2) cell.value = emp.n_int;
                if (col === 3) cell.value = emp.abv_name;
                if (col === 4) cell.value = emp.function;
                if (col === 5) cell.value = emp.team;
                if (col === 38) cell.value = emp.total;
            });

            // Turnos com as cores enviadas
            emp.shifts.forEach((turno, dIdx) => {
                const colIndex = 7 + dIdx;
                const cell = worksheet.getCell(excelRow, colIndex);
                const hexColor = emp.colors[dIdx] || "FFFFFF";

                cell.value = turno;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };

                // Aplica a cor do turno apenas se não for branca
                if (hexColor !== "FFFFFF") {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF' + hexColor }
                    };
                    // Texto branco para turnos escuros (ex: Azul Noite)
                    const isDark = (hexColor === "00008B" || hexColor === "0000FF");
                    cell.font = { bold: true, color: { argb: isDark ? 'FFFFFFFF' : 'FF000000' } };
                } else {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                }

                cell.border = {
                    top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(Buffer.from(buffer));

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
