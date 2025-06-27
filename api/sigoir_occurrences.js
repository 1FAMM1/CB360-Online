import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://onunffdpdnqkpogmhlti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udW5mZmRwZG5xa3BvZ21obHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzkxNTIsImV4cCI6MjA2NjUxNTE1Mn0.qupKAwPZXR7NtgypQl8d0YhKZN9msABkknQ2Po3irbU'

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }
    
    try {
        if (req.method === 'POST') {
            // CRIAR/GUARDAR OCORRÊNCIA
            const { incident_number, group_indicator, gdh_activation, pco_indicator } = req.body
            
            // Validações
            if (!incident_number || !group_indicator) {
                return res.status(400).json({
                    success: false,
                    error: 'Número da ocorrência e indicativo do grupo são obrigatórios'
                })
            }
            
            // Verificar se já existe
            const { data: existingIncident, error: checkError } = await supabase
                .from('incidents')
                .select('id, incident_number')
                .eq('incident_number', incident_number)
                .single()
            
            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Erro ao verificar:', checkError)
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar ocorrência: ' + checkError.message
                })
            }
            
            if (existingIncident) {
                return res.status(409).json({
                    success: false,
                    error: `Ocorrência ${incident_number} já existe no sistema`
                })
            }
            
            // Inserir nova ocorrência
            const { data, error } = await supabase
                .from('incidents')
                .insert([{
                    incident_number,
                    group_indicator,
                    gdh_activation,
                    pco_indicator,
                    status: 'planning',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
            
            if (error) {
                console.error('Erro ao inserir:', error)
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao salvar: ' + error.message
                })
            }
            
            return res.status(200).json({
                success: true,
                message: `Ocorrência ${incident_number} guardada com sucesso!`,
                data: data[0]
            })
            
        } else if (req.method === 'GET') {
            // LISTAR OU BUSCAR OCORRÊNCIA
            const { incident_number } = req.query
            
            if (incident_number) {
                // Buscar ocorrência específica
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
                // Listar todas as ocorrências
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
