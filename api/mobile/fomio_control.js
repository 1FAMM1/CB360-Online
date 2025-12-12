import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjkbodfqsvckvnhjwmhg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const action = req.query.action || req.body?.action;
    
    console.log('📍 FOMIO API Called:', {
      method: req.method,
      action: action,
      query: req.query,
      body: req.body
    });
    
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
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}

async function handleGetTeams(req, res) {
  const corpOperNr = req.query.corp_oper_nr || req.body?.corp_oper_nr;
  
  console.log('🔍 GET_TEAMS:', { corpOperNr });
  
  if (!corpOperNr) {
    console.log('⚠️ Sem corpOperNr - retornando vazio');
    return res.json({
      success: true,
      teams: {},
      timestamp: Date.now()
    });
  }
  
  // CORREÇÃO: Usar um array de strings para 'select' para maior clareza e garantir que todos os campos são selecionados.
  const columnsToSelect = [
    'id', 'team_name', 'n_int', 'patente', 'nome', 
    'h_entrance', 'h_exit', 'MP', 'TAS', 'observ', 'corp_oper_nr'
  ];
  
  const { data: teams, error } = await supabase
    .from('fomio_teams')
    // Usamos .select(columnsToSelect.join(',')) para garantir que a query está bem formada
    .select(columnsToSelect.join(',')) 
    .eq('corp_oper_nr', corpOperNr)
    // Mantemos a ordenação para o frontend receber de forma consistente
    .order('team_name', { ascending: true }) 
    .order('id', { ascending: true });
  
  if (error) {
    // Melhorar o log de erro para incluir o código da query
    console.error('❌ Erro Supabase ao buscar teams:', error.message, error.details);
    throw error;
  }
  
  // NOVO LOG: Verificação imediata do número de registos retornados
  if (teams.length === 0) {
      console.log('⚠️ Query Supabase não retornou registos para:', corpOperNr);
  } else {
      console.log('📦 Teams encontradas (Supabase):', teams.length);
  }
  
  const teamData = {};
  teams.forEach(member => {
    // NOTE: Se 'team_name' estiver NULL no Supabase, este agrupamento falha.
    // É crucial que a coluna team_name tenha um valor.
    if (!member.team_name) {
        console.warn('⚠️ Membro com team_name NULL ignorado:', member.id, member.nome);
        return; 
    }
    
    if (!teamData[member.team_name]) {
      teamData[member.team_name] = [];
    }
    teamData[member.team_name].push({
      id: member.id,
      n_int: member.n_int,
      patente: member.patente,
      nome: member.nome,
      h_entrance: member.h_entrance,
      h_exit: member.h_exit,
      MP: member.MP,
      TAS: member.TAS,
      observ: member.observ
    });
  });
  
  console.log('✅ TeamData processado, chaves:', Object.keys(teamData));
  
  return res.json({
    success: true,
    teams: teamData,
    timestamp: Date.now()
  });
}

async function handleUpdateTeam(req, res) {
  const { team_name, members, corp_oper_nr } = req.body;
  
  console.log('📝 UPDATE_TEAM:', { team_name, membersCount: members?.length, corp_oper_nr });
  
  if (!team_name || !Array.isArray(members)) {
    return res.status(400).json({
      success: false,
      error: 'team_name e members (array) são obrigatórios'
    });
  }
  
  // Delete existing team members
  const { error: deleteError } = await supabase
    .from('fomio_teams')
    .delete()
    .eq('team_name', team_name)
    .eq('corp_oper_nr', corp_oper_nr);
  
  if (deleteError) {
    console.error('❌ Erro ao deletar:', deleteError);
    throw deleteError;
  }
  
  // Insert new members if any
  if (members.length > 0) {
    const membersToInsert = members.map(member => ({
      corp_oper_nr: corp_oper_nr,
      team_name,
      n_int: member.n_int || '',
      patente: member.patente || '',
      nome: member.nome || '',
      h_entrance: member.h_entrance || '',
      h_exit: member.h_exit || '',
      MP: member.MP || '',
      TAS: member.TAS || '',
      observ: member.observ || ''
    }));
    
    const { error: insertError } = await supabase
      .from('fomio_teams')
      .insert(membersToInsert);
    
    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      throw insertError;
    }
  }
  
  console.log('✅ Team atualizada:', team_name);
  
  return res.json({
    success: true,
    message: `Equipa ${team_name} atualizada com ${members.length} membros`
  });
}

async function handleDeleteTeam(req, res) {
  const { team_name, corp_oper_nr } = req.body;
  
  console.log('🗑️ DELETE_TEAM:', { team_name, corp_oper_nr });
  
  if (!team_name) {
    return res.status(400).json({
      success: false,
      error: 'team_name é obrigatório'
    });
  }
  
  const query = supabase
    .from('fomio_teams')
    .delete()
    .eq('team_name', team_name);
  
  if (corp_oper_nr) {
    query.eq('corp_oper_nr', corp_oper_nr);
  }
  
  const { error } = await query;
  
  if (error) {
    console.error('❌ Erro ao deletar team:', error);
    throw error;
  }
  
  console.log('✅ Team deletada:', team_name);
  
  return res.json({
    success: true,
    message: `Equipa ${team_name} limpa com sucesso`
  });
}

async function handleInsertMember(req, res) {
  const { 
    team_name, 
    patente, 
    nome, 
    n_int = '', 
    h_entrance = '', 
    h_exit = '', 
    MP = '', 
    TAS = '', 
    observ = '',
    corp_oper_nr 
  } = req.body;
  
  console.log('➕ INSERT_MEMBER:', { team_name, patente, nome, corp_oper_nr });
  
  if (!team_name || !patente || !nome) {
    return res.status(400).json({
      success: false,
      error: 'team_name, patente e nome são obrigatórios'
    });
  }
  
  const { data, error } = await supabase
    .from('fomio_teams')
    .insert([{
      corp_oper_nr,
      team_name, 
      patente, 
      nome, 
      n_int,
      h_entrance, 
      h_exit, 
      MP, 
      TAS, 
      observ
    }])
    .select();
  
  if (error) {
    console.error('❌ Erro ao inserir membro:', error);
    throw error;
  }
  
  console.log('✅ Membro inserido:', nome);
  
  return res.status(200).json({
    success: true,
    data
  });
}

async function handleClearAll(req, res) {
  const { corp_oper_nr } = req.body;
  
  console.log('🧹 CLEAR_ALL:', { corp_oper_nr });
  
  try {
    // Try TRUNCATE first (if you have RPC function)
    const { data: truncateData, error: truncateError } = await supabase
      .rpc('sql', {
        query: 'TRUNCATE TABLE fomio_teams RESTART IDENTITY CASCADE;'
      });
    
    if (!truncateError) {
      console.log('✅ TRUNCATE executado');
      return res.status(200).json({
        success: true,
        message: 'Data cleared with TRUNCATE',
        method: 'truncate_sql'
      });
    }
    
    // Try custom function
    const { data: funcData, error: funcError } = await supabase
      .rpc('truncate_fomio_teams');
    
    if (!funcError) {
      console.log('✅ Custom function executada');
      return res.status(200).json({
        success: true,
        message: 'Data cleared with custom function',
        method: 'custom_function'
      });
    }
    
    // Fallback to DELETE
    const deleteQuery = supabase
      .from('fomio_teams')
      .delete()
      .neq('id', 0);
    
    if (corp_oper_nr) {
      deleteQuery.eq('corp_oper_nr', corp_oper_nr);
    }
    
    const { data: deleteData, error: deleteError } = await deleteQuery;
    
    if (deleteError) {
      console.error('❌ Erro no DELETE:', deleteError);
      throw deleteError;
    }
    
    console.log('✅ DELETE executado');
    
    // Try to reset sequence
    try {
      await supabase.rpc('sql', {
        query: "SELECT setval('fomio_teams_id_seq', 1, false);"
      });
    } catch (seqError) {
      console.log('⚠️ Não foi possível resetar sequence:', seqError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Data cleared with DELETE',
      method: 'delete_fallback'
    });
  } catch (error) {
    console.error('💥 Erro no Clear:', error);
    throw error;
  }
}

async function handleResetSequence(req, res) {
  console.log('🔄 RESET_SEQUENCE');
  
  const { data, error } = await supabase.rpc('reset_fomio_sequence');
  
  if (error) {
    console.error('❌ Erro ao resetar sequence:', error);
    throw error;
  }
  
  console.log('✅ Sequence resetada');
  
  return res.status(200).json({
    success: true,
    message: 'Sequence reset com sucesso'
  });
}

async function handleSaveHeader(req, res) {
  const { header_text, corp_oper_nr } = req.body;
  
  console.log('💾 SAVE_HEADER:', { header_text, corp_oper_nr });
  
  if (!header_text) {
    return res.status(400).json({
      success: false,
      error: 'Header text é obrigatório'
    });
  }
  
  // Delete existing headers for this corp
  if (corp_oper_nr) {
    await supabase
      .from('fomio_date')
      .delete()
      .eq('corp_oper_nr', corp_oper_nr);
  } else {
    await supabase
      .from('fomio_date')
      .delete()
      .neq('id', 0);
  }
  
  const { data, error } = await supabase
    .from('fomio_date')
    .insert({ 
      header_text,
      corp_oper_nr 
    })
    .select();
  
  if (error) {
    console.error('❌ Erro ao salvar header:', error);
    throw error;
  }
  
  console.log('✅ Header salvo');
  
  return res.status(200).json({
    success: true,
    message: 'Header salvo com sucesso',
    data
  });
}

async function handleGetHeader(req, res) {
  const corpOperNr = req.query.corp_oper_nr || req.body?.corp_oper_nr;
  
  console.log('📋 GET_HEADER:', { corpOperNr });
  
  if (!corpOperNr) {
    console.log('⚠️ Sem corpOperNr para header');
    return res.status(200).json({
      success: true,
      header: null,
      updated_at: null
    });
  }
  
  const { data, error } = await supabase
    .from('fomio_date')
    .select('header_text, corp_oper_nr, updated_at')
    .eq('corp_oper_nr', corpOperNr)
    .order('updated_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('❌ Erro ao buscar header:', error);
    throw error;
  }
  
  const header = data.length > 0 ? data[0].header_text : null;
  const updatedAt = data.length > 0 ? data[0].updated_at : null;
  
  console.log('✅ Header encontrado:', header);
  
  return res.status(200).json({
    success: true,
    header,
    updated_at: updatedAt
  });
}

async function handleLegacyRouting(req, res) {
  console.log('🔀 LEGACY_ROUTING:', req.method);
  
  if (req.method === 'GET') {
    return await handleGetTeams(req, res);
  }
  
  if (req.method === 'POST') {
    if (req.body.team_name && req.body.members) {
      return await handleUpdateTeam(req, res);
    }
    if (req.body.header_text) {
      return await handleSaveHeader(req, res);
    }
    if (req.body.team_name && req.body.patente && req.body.nome) {
      return await handleInsertMember(req, res);
    }
  }
  
  if (req.method === 'DELETE') {
    if (req.body.team_name) {
      return await handleDeleteTeam(req, res);
    }
    return await handleClearAll(req, res);
  }
  
  console.log('❌ Method not allowed');
  
  return res.status(405).json({ 
    error: 'Method not allowed or missing parameters',
    method: req.method,
    body: req.body
  });
}
