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
            // GUARDAR PLANO INICIAL (VEÍCULOS)
            const { incident_number, vehicles } = req.body
            
            // Validações
            if (!incident_number) {
                return res.status(400).json({
                    success: false,
                    error: 'Número da ocorrência é obrigatório'
                })
            }
            
            if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Lista de veículos é obrigatória'
                })
            }
            
            // Verificar se já existem veículos para esta ocorrência
            const { data: existingVehicles, error: checkError } = await supabase
                .from('initial_plan')
                .select('id, vehicle')
                .eq('incident_number', incident_number)
            
            if (checkError) {
                console.error('Erro ao verificar veículos:', checkError)
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar veículos existentes: ' + checkError.message
                })
            }
            
            // Se já existem, apagar primeiro (para substituir)
            if (existingVehicles && existingVehicles.length > 0) {
                const { error: deleteError } = await supabase
                    .from('initial_plan')
                    .delete()
                    .eq('incident_number', incident_number)
                
                if (deleteError) {
                    console.error('Erro ao apagar veículos antigos:', deleteError)
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao atualizar veículos: ' + deleteError.message
                    })
                }
            }
            
            // Preparar dados dos veículos
            const vehicleData = vehicles.map(vehicle => ({
                incident_number: incident_number,
                vehicle: vehicle.vehicle,
                capacity: parseFloat(vehicle.capacity) || 0,
                start_time: vehicle.start_time || null,
                kms_to_travel: parseFloat(vehicle.kms_to_travel) || 0,
                available_capacity: parseFloat(vehicle.available_capacity) || 0,
                lts_km: parseFloat(vehicle.lts_km) || 0,
                lts_hour: parseFloat(vehicle.lts_hour) || 0,
                transit_autonomy: vehicle.transit_autonomy || '',
                transit_consumption: vehicle.transit_consumption || '',
                work_autonomy: vehicle.work_autonomy || '',
                created_at: new Date().toISOString()
            }))
            
            // Inserir veículos
            const { data, error } = await supabase
                .from('initial_plan')
                .insert(vehicleData)
                .select()
            
            if (error) {
                console.error('Erro ao inserir veículos:', error)
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao salvar veículos: ' + error.message
                })
            }
            
            return res.status(200).json({
                success: true,
                message: `${data.length} veículos guardados para a ocorrência ${incident_number}`,
                data: data
            })
            
        } else if (req.method === 'GET') {
            // LISTAR OU BUSCAR VEÍCULOS
            const { incident_number } = req.query
            
            if (incident_number) {
                // Buscar veículos de uma ocorrência específica
                const { data, error } = await supabase
                    .from('initial_plan')
                    .select('*')
                    .eq('incident_number', incident_number)
                    .order('created_at', { ascending: true })
                
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
                
            } else {
                // Listar todos os planos
                const { data, error } = await supabase
                    .from('initial_plan')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100)
                
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
