import ExcelJS from 'exceljs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';

const TEMPLATE_SIGNA_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/templates/000.xlsx";
const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

async function downloadTemplate(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d} / ${m} / ${y}`;
}

async function fetchFullNames(nints, corpOperNr) {
  if (!nints.length) return {};
  const paddedNints = nints.map(n => String(n).padStart(3, "0"));
  const query = `n_int=in.(${paddedNints.join(",")})&corp_oper_nr=eq.${corpOperNr}&select=n_int,full_name`;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/reg_elems?${query}`, {
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
  });
  if (!response.ok) {
    console.log("Supabase error:", response.status, await response.text());
    return {};
  }
  const data = await response.json();
  console.log("Supabase data:", JSON.stringify(data));
  return Object.fromEntries(data.map(e => [String(e.n_int), e.full_name || ""]));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const tempDir = os.tmpdir();
  let outputFile = null;

  try {
    const { date1, date2, year, fileName, ecin, elac, corpOperNr } = req.body;
    if (!date1 || !date2 || !year) return res.status(400).json({ error: "Dados incompletos" });

    const allMembers = [
      ...(ecin?.day1?.day || []), ...(ecin?.day1?.night || []),
      ...(ecin?.day2?.day || []), ...(ecin?.day2?.night || []),
      ...(elac?.day1?.day || []), ...(elac?.day1?.night || []),
      ...(elac?.day2?.day || []), ...(elac?.day2?.night || [])
    ];
    const allNints = [...new Set(allMembers.map(m => m.nint).filter(Boolean))];
    const fullNamesMap = await fetchFullNames(allNints, corpOperNr);
    console.log("allNints enviados:", allNints);
    console.log("fullNamesMap resultado:", JSON.stringify(fullNamesMap));
    console.log("exemplo member:", JSON.stringify(ecin?.day1?.day?.[0]));

    const templateBuffer = await downloadTemplate(TEMPLATE_SIGNA_URL);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    const sheet = workbook.worksheets[0];

    const title = `Dispositivo Especial Combate Incêndios Rurais (DECIR ${year})`;
    const period = `Período: ${formatDate(date1)}  a  ${formatDate(date2)}`;
    const date1Formatted = formatDate(date1);
    const date2Formatted = formatDate(date2);
    const dayShift   = "Turno: 08:00 Horas às 20:00 Horas";
    const nightShift = "Turno: 20:00 Horas às 08:00 Horas";

    [7, 60, 113, 167].forEach(row => sheet.getCell(`B${row}`).value = title);
    [9, 62, 115, 169].forEach(row => sheet.getCell(`B${row}`).value = period);
    [11, 20, 64, 73, 117, 123, 171, 177].forEach(row => sheet.getCell(`B${row}`).value = date1Formatted);
    [29, 38, 82, 91, 129, 135, 183, 189].forEach(row => sheet.getCell(`B${row}`).value = date2Formatted);
    [11, 29, 64, 82, 117, 129, 171, 183].forEach(row => sheet.getCell(`F${row}`).value = dayShift);
    [20, 38, 73, 91, 123, 135, 177, 189].forEach(row => sheet.getCell(`F${row}`).value = nightShift);

    const fillTeam = (startRow, members) => {
      if (!Array.isArray(members)) return;
      members.forEach((member, idx) => {
        const row = startRow + idx;
        if (member.n_file)   sheet.getCell(`B${row}`).value = member.n_file;
        if (member.patent)   sheet.getCell(`D${row}`).value = member.patent;
        if (member.abv_name) sheet.getCell(`F${row}`).value = member.abv_name;
      });
    };

    const fillTeamFull = (startRow, members) => {
      if (!Array.isArray(members)) return;
      members.forEach((member, idx) => {
        const row = startRow + idx;
        if (member.n_file) sheet.getCell(`B${row}`).value = member.n_file;
        if (member.patent) sheet.getCell(`D${row}`).value = member.patent;
        const fullName = fullNamesMap[String(member.nint).padStart(3,"0")] || member.abv_name || "";
        if (fullName) sheet.getCell(`F${row}`).value = fullName;
      });
    };

    fillTeam(14,  ecin?.day1?.day);
    fillTeam(23,  ecin?.day1?.night);
    fillTeam(32,  ecin?.day2?.day);
    fillTeam(41,  ecin?.day2?.night);
    fillTeam(120, elac?.day1?.day);
    fillTeam(126, elac?.day1?.night);
    fillTeam(132, elac?.day2?.day);
    fillTeam(138, elac?.day2?.night);

    fillTeamFull(67,  ecin?.day1?.day);
    fillTeamFull(76,  ecin?.day1?.night);
    fillTeamFull(85,  ecin?.day2?.day);
    fillTeamFull(94,  ecin?.day2?.night);
    fillTeamFull(174, elac?.day1?.day);
    fillTeamFull(180, elac?.day1?.night);
    fillTeamFull(186, elac?.day2?.day);
    fillTeamFull(192, elac?.day2?.night);

    outputFile = path.join(tempDir, `${fileName || "signa"}_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(outputFile);
    const fileBuffer = fs.readFileSync(outputFile);
    try { fs.unlinkSync(outputFile); } catch {}

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName || "signa"}.xlsx"`);
    return res.status(200).send(fileBuffer);

  } catch (e) {
    try { if (outputFile) fs.unlinkSync(outputFile); } catch {}
    return res.status(500).json({ error: "Erro interno", details: e.message });
  }
}
