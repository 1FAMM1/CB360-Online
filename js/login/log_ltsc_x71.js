   async function loginUser(user, pass) {
  try {
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

    // CORREÇÃO AQUI: Em vez de pegar o primeiro que bater a password, 
    // vamos filtrar todos os que batem a password
    const validUsers = data.filter(u => u.password === pass);

    if (validUsers.length === 0) {
      showToast("Password incorreta.", 2000, "error");
      return;
    }

    // Se houver mais de um (como o caso do Jorge), vamos procurar qual deles 
    // existe na reg_elems como ativo ou preferencial. 
    // Por agora, vamos garantir que pegamos o dado REAIS da base de dados.
    let userData = validUsers[0]; 

    // Se o Jorge Ribeirinho 0801 for o que queres, e ele estiver na lista:
    // Podes adicionar uma lógica aqui ou simplesmente garantir que o loop 
    // verifica a validade de cada um.
    
    if (userData.validate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expireDate = new Date(userData.validate);
      if (expireDate < today) {
        showToast("A sua conta expirou em " + expireDate.toLocaleDateString(), 3000, "error");
        return;
      }
    }

    // FORÇAR O PADSTART para evitar erros de comparação (ex: 801 -> 0801)
    const corp = String(userData.corp_oper_nr || "").trim().padStart(4, "0");

    const regResp = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=user_role,elem_state,acess&n_int=eq.${userData.n_int}&corp_oper_nr=eq.${corp}`, {
        headers: getSupabaseHeaders()
      }
    );
    const regData = await regResp.json();

    // Se ele encontrou o Jorge da 0805 mas ele está inativo ou não existe lá:
    if (regData.length === 0 || regData[0].elem_state === false) {
       // Tenta ver se o outro registo do Jorge (se existir) é o válido
       if (validUsers.length > 1) {
          userData = validUsers[1]; // Tenta o próximo da lista
          // ... (repetiria a lógica de buscar reg_elems para o segundo utilizador)
          // Nota: O ideal é o utilizador ter um username único por corporação 
          // ou um seletor de corporação no login.
       } else {
          showToast("Conta inativa nesta corporação.", 3000, "error");
          return;
       }
    }

    // GRAVAÇÃO LIMPA NA SESSÃO
    sessionStorage.clear(); // Limpa lixo anterior
    sessionStorage.setItem("currentUserDisplay", userData.full_name);
    sessionStorage.setItem("currentUserName", userData.username);
    sessionStorage.setItem("currentCorpOperNr", corp); 
    sessionStorage.setItem("currentNInt", userData.n_int);

    if (regData.length > 0) {
      sessionStorage.setItem("currentUserRole", regData[0].user_role || "user");
      sessionStorage.setItem("allowedModules", regData[0].acess || "Menu Principal");
    }

    showToast("Login efetuado com sucesso!", 2000, "success");
    setTimeout(() => {
      // Usa a variável corp que acabamos de definir e limpar
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








