const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0';
function getSupabaseHeaders(options = {}) {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      };
      if (options.returnRepresentation) {
        headers['Prefer'] = 'return=representation';
      }
      return headers;
    }


document.addEventListener('DOMContentLoaded', () => {
  const currentUser = sessionStorage.getItem("currentUserName");
  const currentUserDisplay = sessionStorage.getItem("currentUserDisplay");
  
  // Se não houver usuário logado, redireciona imediatamente
  if (!currentUser) {
    window.location.replace("index.html");
    return; // Para a execução de qualquer código seguinte
  }
  
  // Se chegou aqui, está autenticado - atualiza o nome
  const authNameEl = document.getElementById('authName');
  if (authNameEl) authNameEl.textContent = currentUserDisplay || "";
