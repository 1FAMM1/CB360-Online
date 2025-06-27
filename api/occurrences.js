import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://onunffdpdnqkpogmhlti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udW5mZmRwZG5xa3BvZ21obHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzkxNTIsImV4cCI6MjA2NjUxNTE1Mn0.qupKAwPZXR7NtgypQl8d0YhKZN9msABkknQ2Po3irbU'

const supabase = createClient(supabaseUrl, supabaseKey)

// Função para gravar ocorrência
export async function saveOcorrencia() {
    try {
        // Coletar dados do formulário
        const incidentNumber = document.getElementById('ocorrencia').value?.trim()
        const groupIndicator = document.getElementById('indicativo-grupo').value?.trim()
        const gdhActivation = document.getElementById('gdh-grupo').value || null
        const pcoIndicator = document.getElementById('indicativo-pco').value?.trim()

        // Validações
        if (!incidentNumber) {
            showSimplePopup('Erro', 'Número da ocorrência é obrigatório!', 'error')
            return { success: false, error: 'Número da ocorrência é obrigatório' }
        }

        if (!groupIndicator) {
            showSimplePopup('Erro', 'Indicativo do grupo é obrigatório!', 'error')
            return { success: false, error: 'Indicativo do grupo é obrigatório' }
        }

        // Verificar se já existe
        const { data: existingIncident, error: checkError } = await supabase
            .from('incidents')
            .select('id, incident_number')
            .eq('incident_number', incidentNumber)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Erro ao verificar ocorrência:', checkError)
            showSimplePopup('Erro', 'Erro ao verificar ocorrência: ' + checkError.message, 'error')
            return { success: false, error: checkError.message }
        }

        if (existingIncident) {
            showSimplePopup('Erro', `Ocorrência ${incidentNumber} já existe no sistema!`, 'error')
            return { success: false, error: `Ocorrência ${incidentNumber} já existe` }
        }

        // Preparar dados para inserir
        const incidentData = {
            incident_number: incidentNumber,
            group_indicator: groupIndicator,
            gdh_activation: gdhActivation,
            pco_indicator: pcoIndicator,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        console.log('Dados a inserir:', incidentData)

        // Inserir na tabela incidents
        const { data: savedIncident, error: insertError } = await supabase
            .from('incidents')
            .insert([incidentData])
            .select()
            .single()

        if (insertError) {
            console.error('Erro ao inserir ocorrência:', insertError)
            showSimplePopup('Erro', 'Erro ao salvar ocorrência: ' + insertError.message, 'error')
            return { success: false, error: insertError.message }
        }

        console.log('Ocorrência salva:', savedIncident)

        // Mostrar sucesso
        showSimplePopup(
            'Sucesso', 
            `Ocorrência salva com sucesso!<br><br>
             <strong>Número:</strong> ${savedIncident.incident_number}<br>
             <strong>ID:</strong> ${savedIncident.id}<br>
             <strong>Grupo:</strong> ${savedIncident.group_indicator}`, 
            'success'
        )

        return {
            success: true,
            message: `Ocorrência ${incidentNumber} salva com sucesso!`,
            data: savedIncident
        }

    } catch (error) {
        console.error('Erro geral:', error)
        showSimplePopup('Erro', 'Erro interno: ' + error.message, 'error')
        return { success: false, error: error.message }
    }
}

// Função para carregar ocorrência
export async function loadOcorrencia() {
    try {
        const incidentNumber = prompt('Digite o número da ocorrência:')
        if (!incidentNumber?.trim()) {
            return { success: false, error: 'Número da ocorrência não fornecido' }
        }

        const { data: incident, error } = await supabase
            .from('incidents')
            .select('*')
            .eq('incident_number', incidentNumber.trim())
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                showSimplePopup('Erro', `Ocorrência ${incidentNumber} não encontrada!`, 'error')
                return { success: false, error: 'Ocorrência não encontrada' }
            }
            console.error('Erro ao carregar:', error)
            showSimplePopup('Erro', 'Erro ao carregar: ' + error.message, 'error')
            return { success: false, error: error.message }
        }

        // Preencher formulário
        document.getElementById('ocorrencia').value = incident.incident_number || ''
        document.getElementById('indicativo-grupo').value = incident.group_indicator || ''
        document.getElementById('indicativo-pco').value = incident.pco_indicator || ''
        
        if (incident.gdh_activation) {
            const date = new Date(incident.gdh_activation)
            const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)
            document.getElementById('gdh-grupo').value = localDateTime
        }

        showSimplePopup('Sucesso', `Ocorrência ${incidentNumber} carregada!`, 'success')
        return { success: true, data: incident }

    } catch (error) {
        console.error('Erro ao carregar:', error)
        showSimplePopup('Erro', 'Erro ao carregar: ' + error.message, 'error')
        return { success: false, error: error.message }
    }
}

// Função para testar conexão
export async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('incidents')
            .select('count', { count: 'exact', head: true })

        if (error) {
            console.error('Erro de conexão:', error)
            showSimplePopup('Erro', 'Erro de conexão: ' + error.message, 'error')
            return { success: false, error: error.message }
        }

        showSimplePopup('Sucesso', 'Conexão com Supabase OK!', 'success')
        return { success: true, message: 'Conexão OK' }

    } catch (error) {
        console.error('Erro de conexão:', error)
        showSimplePopup('Erro', 'Erro de conexão: ' + error.message, 'error')
        return { success: false, error: error.message }
    }
}
