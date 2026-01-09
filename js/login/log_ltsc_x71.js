   async function loginUser(user, pass) {
  try {
    // 1. Procuramos o utilizador na tabela 'users' (onde está o login e a validade)
    // Filtramos pelo username que o utilizador inseriu
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=username,password,full_name,corp_oper_nr,n_int,validate&username=eq.${user}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const data = await response.json();

    if (data.length === 0) {
      showToast("Utilizador não encontrado.", 2000, "error");
      return;
    }

    // 2. Encontrar o registo correto se houver duplicados (pela password)
    const userData = data.find(u => u.password === pass);

    if (!userData) {
      showToast("Password incorreta.", 2000, "error");
      return;
    }

    // 3. Verificação de Validade imediata no Login
    if (userData.validate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const expireDate = new Date(userData.validate);
      if (expireDate < today) {
        showToast("A sua conta expirou em " + expireDate.toLocaleDateString(), 3000, "error");
        return;
      }
    }

    // 4. Agora que temos a CORP certa do utilizador, vamos buscar o papel dele à reg_elems
    const corp = String(userData.corp_oper_nr || "").padStart(4, "0");
    const regResp = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=user_role,elem_state,acess&n_int=eq.${userData.n_int}&corp_oper_nr=eq.${corp}`, {
        headers: getSupabaseHeaders()
      }
    );
    const regData = await regResp.json();
    
    // Se não estiver ativo na reg_elems, bloqueia
    if (regData.length > 0 && regData[0].elem_state === false) {
      showToast("Conta inativa nesta corporação.", 3000, "error");
      return;
    }

    // 5. GRAVAÇÃO SEGURA NO SESSION STORAGE
    sessionStorage.setItem("currentUserDisplay", userData.full_name);
    sessionStorage.setItem("currentUserName", userData.username);
    sessionStorage.setItem("currentCorpOperNr", corp); // Aqui fica gravado 0801 ou 0805 conforme a linha da password
    sessionStorage.setItem("currentNInt", userData.n_int);
    
    // Dados da reg_elems
    if (regData.length > 0) {
      sessionStorage.setItem("currentUserRole", regData[0].user_role || "user");
      sessionStorage.setItem("allowedModules", regData[0].acess || "Menu Principal");
    }

    // 6. Redirecionamento
    showToast("Login efetuado com sucesso!", 2000, "success");
    setTimeout(() => { 
      window.location.href = (userData.user_role === "admin" || corp === "0000") ? "system_admin.html" : "main.html"; 
    }, 1500);

  } catch (err) {
    console.error(err);
    showToast("Erro ao validar acesso.", 3000, "error");
  }
}
    document.getElementById("loginForm").addEventListener("submit", e => {
      e.preventDefault();
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();
      loginUser(user, pass);
    });
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      togglePassword.classList.toggle("fa-eye");
      togglePassword.classList.toggle("fa-eye-slash");
    });

    function showToast(message, duration = 2000, type = "error") {
      let toast = document.getElementById("toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.className = "toast show";
      if (type === "success") toast.classList.add("success");
      setTimeout(() => toast.classList.remove("show"), duration);
    }

    function updateGreeting() {
      const now = new Date();
      const hour = now.getHours();
      let greetingText = "🌙 Boa noite";
      if (hour >= 6 && hour < 12) greetingText = "☀️ Bom dia";
      else if (hour >= 12 && hour < 19) greetingText = "🌤️ Boa tarde";
      document.getElementById("greetingText").textContent = greetingText;
      document.getElementById("clock").textContent = now.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    function startClock() {
      updateGreeting();
      const now = new Date();
      setTimeout(() => {
        updateGreeting();
        setInterval(updateGreeting, 1000);
      }, 1000 - now.getMilliseconds());
    }
    startClock();
    document.getElementById("username").focus();







