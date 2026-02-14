import ExcelJS from 'exceljs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { year, month, employees } = req.body;
        const workbook = new ExcelJS.Workbook();
        const templateResponse = await fetch("https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/employees_template.xlsx");
        await workbook.xlsx.load(await templateResponse.arrayBuffer());
        const worksheet = workbook.worksheets[0];

        employees.forEach((emp, idx) => {
            const excelRow = 13 + idx; // Linha 13, 14, 15...
            
            // Preencher dados das colunas A-E (Sempre limpo/branco)
            const infoCols = [2, 3, 4, 5, 38];
            infoCols.forEach(col => {
                const cell = worksheet.getCell(excelRow, col);
                cell.value = (col === 2) ? emp.n_int : (col === 3) ? emp.abv_name : (col === 4) ? emp.function : (col === 5) ? emp.team : emp.total;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
            });

            // ✨ APLICAÇÃO CELULAR: Mapeia cada cor do site para a célula do Excel
            emp.shifts.forEach((turno, dIdx) => {
                const colIndex = 7 + dIdx; // Coluna G(7), H(8)...
                const cell = worksheet.getCell(excelRow, colIndex);
                const hexColor = emp.cellColors[dIdx] || "FFFFFF";

                cell.value = turno;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };

                // Aplica a cor que veio do site para ESTA célula específica
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF' + hexColor }
                };

                // Define a borda para manter a grelha
                cell.border = {
                    top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
                };

                // Se a cor for muito escura (como o azul do motorista), coloca texto branco
                const isDark = (hexColor === "00008B" || hexColor === "0000FF");
                cell.font = { 
                    bold: true, 
                    color: { argb: isDark ? 'FFFFFFFF' : 'FF000000' } 
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
