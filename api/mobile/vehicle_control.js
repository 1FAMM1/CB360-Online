import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rjkbodfqsvckvnhjwmhg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET' && req.query.action === 'list') {
      const { data, error } = await supabase
        .from('vehicle_status')
        .select('vehicle')
        .order('vehicle', { ascending: true })
      
      if (error) throw error
      
      const vehicles = data.map(v => v.vehicle)
      return res.status(200).json({ success: true, vehicles })
    }

    if (req.method === 'GET' && !req.query.action) {
      const { data: vehicles, error } = await supabase
        .from('vehicle_status')
        .select('vehicle, current_status, is_inop, vehic_id')
  
      if (error) throw error
  
      const vehicleStatuses = {}
      const vehicleINOP = {}
      const vehicleIDs = {}
      const allVehicles = []
  
      vehicles.forEach(vehicle => {
        allVehicles.push(vehicle.vehicle)
        vehicleStatuses[vehicle.vehicle] = vehicle.current_status || 'Disponível'
        vehicleINOP[vehicle.vehicle] = vehicle.is_inop
        vehicleIDs[vehicle.vehicle] = vehicle.vehic_id || null
      })
  
      return res.json({
        success: true,
        vehicles: allVehicles,
        vehicleStatuses,
        vehicleINOP,
        vehicleIDs,
        timestamp: Date.now()
      })
    }

    if (req.method === 'POST' && req.body.action === 'add') {
      const { vehicle, status } = req.body
      
      if (!vehicle || !status) {
        return res.status(400).json({ success: false, error: 'Veículo e status são obrigatórios' })
      }
      
      if (!/^[A-Z]{4}-\d{2}$/.test(vehicle)) {
        return res.status(400).json({ success: false, error: 'Formato inválido. Use: XXXX-XX (ex: VFCI-01)' })
      }
      
      const { data: existingVehicle } = await supabase
        .from('vehicle_status')
        .select('vehicle')
        .eq('vehicle', vehicle)
        .maybeSingle()
      
      if (existingVehicle) {
        return res.status(409).json({ success: false, error: `Veículo ${vehicle} já existe no sistema` })
      }
      
      const { data, error } = await supabase
        .from('vehicle_status')
        .insert([{ vehicle, current_status: status, is_inop: false }])
        .select()
      
      if (error) throw error
      
      return res.status(200).json({ 
        success: true, 
        message: `Veículo ${vehicle} adicionado com sucesso!`,
        data 
      })
    }
    
    if (req.method === 'POST' && !req.body.action) {
      const { vehicle, status } = req.body
      
      if (!vehicle || !status) {
        return res.status(400).json({ success: false, error: 'Veículo e status são obrigatórios.' })
      }
      
      console.log(`📡 Atualizando ${vehicle} para: ${status}`)
      
      const finalStatus = status === 'Chegada Und.' ? 'Disponível' : status
      
      const { error: updateError } = await supabase
        .from('vehicle_status')
        .update({ current_status: finalStatus })
        .eq('vehicle', vehicle)
      
      if (updateError) throw updateError

      console.log(`✅ ${vehicle} atualizado para: ${finalStatus}`)
      
      return res.json({
        success: true,
        message: `${vehicle} atualizado para: ${finalStatus}`,
        finalStatus
      })
    }

    if (req.method === 'PUT') {
      const { vehicle, inop, current_status } = req.body
      
      if (!vehicle) {
        return res.status(400).json({ error: 'Veículo é obrigatório.' })
      }
      
      const updates = {}
      if (typeof inop === 'boolean') updates.is_inop = inop
      if (typeof current_status === 'string') updates.current_status = current_status
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado para atualizar.' })
      }
      
      const { error } = await supabase
        .from('vehicle_status')
        .update(updates)
        .eq('vehicle', vehicle)
      
      if (error) throw error
      
      return res.json({ success: true, message: `${vehicle} atualizado.`, updates })
    }

    if (req.method === 'DELETE') {
      const { vehicle } = req.query
      
      if (!vehicle) {
        return res.status(400).json({ success: false, error: 'Vehicle name is required in query parameter' })
      }
      
      const { data: existingVehicle } = await supabase
        .from('vehicle_status')
        .select('vehicle')
        .eq('vehicle', vehicle)
        .maybeSingle()
      
      if (!existingVehicle) {
        return res.status(404).json({ success: false, error: `Vehicle '${vehicle}' not found` })
      }

      const { error: deleteError } = await supabase
        .from('vehicle_status')
        .delete()
        .eq('vehicle', vehicle)
      
      if (deleteError) throw deleteError
      
      return res.status(200).json({
        success: true,
        message: `Vehicle '${vehicle}' deleted successfully`
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
