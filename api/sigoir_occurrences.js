import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://onunffdpdnqkpogmhlti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udW5mZmRwZG5xa3BvZ21obHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzkxNTIsImV4cCI6MjA2NjUxNTE1Mn0.qupKAwPZXR7NtgypQl8d0YhKZN9msABkknQ2Po3irbU'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }
    
    try {
        if (req.method === 'POST') {
            const { incident_number, group_indicator, gdh_activation, pco_indicator, ocorr_status } = req.body
            
            if (!incident_number || !group_indicator) {
                return res.status(400).json({
                    success: false,
                    error: 'Número da ocorrência e indicativo do grupo são obrigatórios'
                })
            }

            const { data, error } = await supabase
                .from('incidents')
                .upsert([{
                    incident_number,
                    group_indicator,
                    gdh_activation,
                    ocorr_status: ocorr_status || null,
                    pco_indicator,
                    status: 'planning',
                    updated_at: new Date().toISOString()
                }], { 
                    onConflict: 'incident_number',
                    ignoreDuplicates: false 
                })
                .select()
            
            if (error) {
                console.error('Erro ao inserir/atualizar:', error)
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao salvar: ' + error.message
                })
            }
            
            return res.status(200).json({
                success: true,
                message: `Ocorrência ${incident_number} guardada/atualizada com sucesso!`,
                data: data[0]
            })
            
        } else if (req.method === 'GET') {
            const { incident_number } = req.query
            
            if (incident_number) {
                const { data, error } = await supabase
                    .from('incidents')
                    .select('*')
                    .eq('incident_number', incident_number)
                    .single()
                
                if (error) {
                    if (error.code === 'PGRST116') {
                        return res.status(404).json({
                            success: false,
                            error: `Ocorrência ${incident_number} não encontrada`
                        })
                    }
                    return res.status(500).json({
                        success: false,
                        error: error.message
                    })
                }
                
                return res.status(200).json({
                    success: true,
                    data: data
                })
                
            } else {
                const { data, error } = await supabase
                    .from('incidents')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50)
                
                if (error) {
                    return res.status(500).json({
                        success: false,
                        error: error.message
                    })
                }
                
                return res.status(200).json({
                    success: true,
                    data: data
                })
            }
            
        } else {
            return res.status(405).json({
                success: false,
                error: 'Método não permitido'
            })
        }
        
    } catch (error) {
        console.error('Erro geral:', error)
        return res.status(500).json({
            success: false,
            error: 'Erro interno: ' + error.message
        })
    }
}
