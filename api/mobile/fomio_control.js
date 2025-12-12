    import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const action = req.query.action || req.body?.action;

    switch (action) {
      case 'get_teams':
        return await handleGetTeams(req, res);
      case 'update_team':
        return await handleUpdateTeam(req, res);
      case 'delete_team':
        return await handleDeleteTeam(req, res);
      case 'insert_member':
        return await handleInsertMember(req, res);
      case 'clear_all':
        return await handleClearAll(req, res);
      case 'reset_sequence':
        return await handleResetSequence(req, res);
      case 'save_header':
        return await handleSaveHeader(req, res);
      case 'get_header':
        return await handleGetHeader(req, res);
      default:
        return await handleLegacyRouting(req, res);
    }

  } catch (error) {
    console.error('FOMIO Unified API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ====== TEAMS ======
async function handleGetTeams(req, res) {
  const corp_oper_nr = req.query.corp_oper_nr || req.body?.corp_oper_nr;

  const { data: teams, error } = await supabase
    .from('fomio_teams')
    .select('id, team_name, n_int, patente, nome, h_entrance, h_exit, MP, TAS, observ')
    .eq('corp_oper_nr', corp_oper_nr)
    .order('team_name')
    .order('id');

  if (error) throw error;

  const teamData = {};
  teams.forEach(member => {
    if (!teamData[member.team_name]) teamData[member.team_name] = [];
    teamData[member.team_name].push(member);
  });

  return res.json({ success: true, teams: teamData, timestamp: Date.now() });
}

async function handleUpdateTeam(req, res) {
  const { team_name, members, corp_oper_nr } = req.body;

  if (!team_name || !Array.isArray(members) || !corp_oper_nr)
    return res.status(400).json({ success: false, error: 'team_name, members e corp_oper_nr são obrigatórios' });

  await supabase
    .from('fomio_teams')
    .delete()
    .eq('team_name', team_name)
    .eq('corp_oper_nr', corp_oper_nr);

  if (members.length > 0) {
    const membersToInsert = members.map(m => ({
      corp_oper_nr,
      team_name,
      n_int: m.n_int || '',
      patente: m.patente || '',
      nome: m.nome || '',
      h_entrance: m.h_entrance || '',
      h_exit: m.h_exit || '',
      MP: m.MP || '',
      TAS: m.TAS || '',
      observ: m.observ || ''
    }));

    const { error } = await supabase.from('fomio_teams').insert(membersToInsert);
    if (error) throw error;
  }

  return res.json({ success: true, message: `Equipa ${team_name} atualizada com ${members.length} membros` });
}

async function handleDeleteTeam(req, res) {
  const { team_name, corp_oper_nr } = req.body;

  if (!team_name || !corp_oper_nr)
    return res.status(400).json({ success: false, error: 'team_name e corp_oper_nr são obrigatórios' });

  const { error } = await supabase
    .from('fomio_teams')
    .delete()
    .eq('team_name', team_name)
    .eq('corp_oper_nr', corp_oper_nr);

  if (error) throw error;
  return res.json({ success: true, message: `Equipa ${team_name} limpa com sucesso` });
}

async function handleInsertMember(req, res) {
  const { corp_oper_nr, team_name, n_int, patente, nome, h_entrance, h_exit, MP, TAS, observ } = req.body;

  if (!corp_oper_nr || !team_name || !nome)
    return res.status(400).json({ success: false, error: 'corp_oper_nr, team_name e nome são obrigatórios' });

  const { data, error } = await supabase
    .from('fomio_teams')
    .insert([{ corp_oper_nr, team_name, n_int, patente, nome, h_entrance, h_exit, MP, TAS, observ }])
    .select();

  if (error) throw error;
  return res.json({ success: true, data });
}

// ====== HEADER ======
async function handleSaveHeader(req, res) {
  const { header_text, corp_oper_nr } = req.body;

  if (!header_text || !corp_oper_nr)
    return res.status(400).json({ success: false, error: 'header_text e corp_oper_nr são obrigatórios' });

  await supabase.from('fomio_date').delete().eq('corp_oper_nr', corp_oper_nr);

  const { data, error } = await supabase
    .from('fomio_date')
    .insert([{ header_text, corp_oper_nr }])
    .select();

  if (error) throw error;
  return res.json({ success: true, data });
}

async function handleGetHeader(req, res) {
  const corp_oper_nr = req.query.corp_oper_nr || req.body?.corp_oper_nr;

  const { data, error } = await supabase
    .from('fomio_date')
    .select('header_text, updated_at')
    .eq('corp_oper_nr', corp_oper_nr)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return res.json({ success: true, header: data?.[0]?.header_text || null, updated_at: data?.[0]?.updated_at || null });
}

// ====== OTHER ======
async function handleClearAll(req, res) {
  const { corp_oper_nr } = req.body;
  if (!corp_oper_nr) return res.status(400).json({ success: false, error: 'corp_oper_nr obrigatório' });

  await supabase.from('fomio_teams').delete().eq('corp_oper_nr', corp_oper_nr);
  return res.json({ success: true, message: 'Todos os dados do operador apagados' });
}

async function handleResetSequence(req, res) {
  const { data, error } = await supabase.rpc('reset_fomio_sequence');
  if (error) throw error;
  return res.json({ success: true, message: 'Sequence reset com sucesso' });
}

// ====== LEGACY ======
async function handleLegacyRouting(req, res) {
  if (req.method === 'GET') return await handleGetTeams(req, res);
  if (req.method === 'POST') {
    if (req.body.team_name && req.body.members) return await handleUpdateTeam(req, res);
    if (req.body.header_text) return await handleSaveHeader(req, res);
    if (req.body.team_name && req.body.patente && req.body.nome) return await handleInsertMember(req, res);
  }
  if (req.method === 'DELETE') {
    if (req.body.team_name) return await handleDeleteTeam(req, res);
    return await handleClearAll(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed or missing parameters' });
}
