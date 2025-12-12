    import { createClient } from '@supabase/supabase-js';
    const supabaseUrl = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
    const supabaseKey = 'YOUR_SUPABASE_KEY';
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
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
    async function handleGetTeams(req, res) {
      const corpOperNr = req.query.corp_oper_nr || req.body?.corp_oper_nr;
      if (!corpOperNr) {
        return res.json({ success: true, teams: {}, timestamp: Date.now() });
      }
      const { data: teams, error } = await supabase
        .from('fomio_teams')
        .select('id, team_name, n_int, patente, nome, h_entrance, h_exit, MP, TAS, observ, corp_oper_nr')
        .eq('corp_oper_nr', corpOperNr)
        .order('team_name', { ascending: true })
        .order('id', { ascending: true });    
      if (error) throw error;    
      const teamData = {};
      teams.forEach(member => {
        if (!teamData[member.team_name]) teamData[member.team_name] = [];
        teamData[member.team_name].push({id: member.id, n_int: member.n_int, patente: member.patente, nome: member.nome, h_entrance: member.h_entrance, h_exit: member.h_exit,
                                         MP: member.MP, TAS: member.TAS, observ: member.observ});});    
      return res.json({ success: true, teams: teamData, timestamp: Date.now() });
    }
    async function handleGetHeader(req, res) {
      const corpOperNr = req.query.corp_oper_nr || req.body?.corp_oper_nr;
      if (!corpOperNr) {
        return res.status(200).json({ success: true, header: null, updated_at: null });
      }    
      const { data, error } = await supabase
        .from('fomio_date')
        .select('header_text, corp_oper_nr, updated_at')
        .eq('corp_oper_nr', corpOperNr)
        .order('updated_at', { ascending: false })
        .limit(1);    
      if (error) throw error;    
      const header = data.length > 0 ? data[0].header_text : null;
      const updatedAt = data.length > 0 ? data[0].updated_at : null;    
      return res.status(200).json({ success: true, header, updated_at: updatedAt });
    }
    async function handleUpdateTeam(req, res) {
      const { team_name, members, corp_oper_nr } = req.body;
      if (!corp_oper_nr) return res.status(400).json({ success: false, error: 'corp_oper_nr é obrigatório' });
      if (!team_name || !Array.isArray(members)) return res.status(400).json({ success: false, error: 'team_name e members são obrigatórios' });
     const { error: deleteError } = await supabase
        .from('fomio_teams')
        .delete()
        .eq('team_name', team_name)
        .eq('corp_oper_nr', corp_oper_nr);
      if (deleteError) throw deleteError;    
      if (members.length > 0) {
        const membersToInsert = members.map(member => ({team_name, n_int: member.n_int || '', patente: member.patente || '', nome: member.nome || '', h_entrance: member.h_entrance || '',
                                                        h_exit: member.h_exit || '', MP: member.MP || false, TAS: member.TAS || false, observ: member.observ || '', corp_oper_nr}));
        const { error: insertError } = await supabase
          .from('fomio_teams')
          .insert(membersToInsert);
        if (insertError) throw insertError;
      }    
      return res.json({ success: true, message: `Equipa ${team_name} atualizada com ${members.length} membros` });
    }    
    async function handleInsertMember(req, res) {
      const { team_name, n_int, patente, nome, h_entrance, h_exit, MP, TAS, observ, corp_oper_nr } = req.body;
      if (!corp_oper_nr) return res.status(400).json({ success: false, error: 'corp_oper_nr é obrigatório' });
      if (!team_name) return res.status(400).json({ success: false, error: 'team_name é obrigatório' });    
      const { data, error } = await supabase
        .from('fomio_teams')
        .insert([{ team_name, n_int, patente, nome, h_entrance, h_exit, MP, TAS, observ, corp_oper_nr }])
        .select();    
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }
    async function handleDeleteTeam(req, res) {
      const { team_name, corp_oper_nr } = req.body;
      if (!corp_oper_nr) return res.status(400).json({ success: false, error: 'corp_oper_nr é obrigatório' });
      if (!team_name) return res.status(400).json({ success: false, error: 'team_name é obrigatório' });    
      const { error } = await supabase
        .from('fomio_teams')
        .delete()
        .eq('team_name', team_name)
        .eq('corp_oper_nr', corp_oper_nr);
      if (error) throw error;    
      return res.json({ success: true, message: `Equipa ${team_name} limpa com sucesso` });
    }    
    async function handleClearAll(req, res) {
      const { corp_oper_nr } = req.body;
      if (!corp_oper_nr) return res.status(400).json({ success: false, error: 'corp_oper_nr é obrigatório' });    
      const { error } = await supabase
        .from('fomio_teams')
        .delete()
        .eq('corp_oper_nr', corp_oper_nr);    
      if (error) throw error;    
      return res.status(200).json({ success: true, message: 'Todos os dados da corperação foram limpos' });
    }    
    async function handleSaveHeader(req, res) {
      const { header_text, corp_oper_nr } = req.body;
      if (!corp_oper_nr) return res.status(400).json({ success: false, error: 'corp_oper_nr é obrigatório' });
      if (!header_text) return res.status(400).json({ success: false, error: 'header_text é obrigatório' });    
      await supabase.from('fomio_date').delete().eq('corp_oper_nr', corp_oper_nr);    
      const { data, error } = await supabase
        .from('fomio_date')
        .insert([{ header_text, corp_oper_nr }])
        .select();
      if (error) throw error;    
      return res.status(200).json({ success: true, message: 'Header salvo com sucesso', data });
    }
    async function handleResetSequence(req, res) {
      const { data, error } = await supabase.rpc('reset_fomio_sequence');
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Sequence reset com sucesso' });
    }    
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
