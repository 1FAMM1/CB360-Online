import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://onunffdpdnqkpogmhlti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udW5mZmRwZG5xa3BvZ21obHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzkxNTIsImV4cCI6MjA2NjUxNTE1Mn0.qupKAwPZXR7NtgypQl8d0YhKZN9msABkknQ2Po3irbU';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { incident_number, logistics } = req.body;

      if (!incident_number || !logistics || !Array.isArray(logistics)) {
        return res.status(400).json({
          success: false,
          error: 'incident_number e logistics (array) são obrigatórios'
        });
      }

      const logisticsToInsert = logistics.map(item => ({
        incident_number,
        vehicle: item.vehicle,
        timestamp: item.gdh_logistics,
        liters_refueled: item.liters_supplied,
        full_fuel: item.full_capacity,
        recalculated_autonomy: item.autonomy_after,
        next_logistics_forecast: item.next_logistics_prediction,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('field_plan')
        .insert(logisticsToInsert)
        .select();

      if (error) {
        console.error('Erro Supabase:', error);
        return res.status(500).json({
          success: false,
          error: `Erro na base de dados: ${error.message}`
        });
      }

      return res.status(200).json({
        success: true,
        message: `${logistics.length} registos de logística guardados com sucesso`,
        data: data
      });

    } else if (req.method === 'GET') {

      const { incident_number } = req.query;

      if (!incident_number) {
        return res.status(400).json({
          success: false,
          error: 'incident_number é obrigatório'
        });
      }

      const { data, error } = await supabase
        .from('field_plan')
        .select('*')
        .eq('incident_number', incident_number)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Erro Supabase:', error);
        return res.status(500).json({
          success: false,
          error: `Erro na base de dados: ${error.message}`
        });
      }

      return res.status(200).json({
        success: true,
        data: data || []
      });

    } else {
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }

  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({
      success: false,
      error: `Erro interno: ${error.message}`
    });
  }
}
