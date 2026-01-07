    async function loginUser(user, pass) {
  try {
    // 1. PASSO: Validar credenciais na tabela 'users'
    // Mantemos apenas as colunas que existem na tabela 'users'
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=username,password&username=eq.${encodeURIComponent(user)}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!response.ok) throw new Error(`Erro na tabela users: ${response.status}`);
    const data = await response.json();

    if (data.length === 0) {
      showToast("Utilizador não encontrado.", 2000, "error");
      return;
    }

    const userData = data[0];
    if (userData.password !== pass) {
      showToast("Password incorreta.", 2000, "error");
      return;
    }

    // 2. PASSO: Buscar os detalhes e o CARGO (Admin/User) na tabela 'reg_elems'
    // Ligamos as duas tabelas pelo 'username'
    const responseElems = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=full_name,corp_oper_nr,user_role,n_int,patent&username=eq.${encodeURIComponent(user)}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!responseElems.ok) throw new Error(`Erro na tabela reg_elems: ${responseElems.status}`);
    const dataElems = await responseElems.json();

    if (dataElems.length === 0) {
      showToast("Aviso: Utilizador sem ficha de elemento ativa.", 3000, "error");
      return;
    }

    const elemData = dataElems[0];
    const corp = String(elemData.corp_oper_nr || "").padStart(4, "0");
    const role = elemData.user_role || "user";
    const displayName = elemData.full_name || user;

    // 3. PASSO: Gravar Sessão (incluindo o novo user_role e n_int)
    sessionStorage.setItem("currentUserDisplay", displayName);
    sessionStorage.setItem("currentUserName", user);
    sessionStorage.setItem("currentCorpOperNr", corp);
    sessionStorage.setItem("currentNInt", elemData.n_int);
    sessionStorage.setItem("currentUserRole", role);

    // 4. PASSO: Lógica de Redirecionamento original + Admin
    if (corp === "0000") {
      sessionStorage.setItem("isMasterUser", "true");
      showToast("Bem-vindo à administração do CB360 Online!", 2000, "success");
      setTimeout(() => { window.location.href = "system_admin.html"; }, 1500);
    } else {
      showToast("Login efetuado com sucesso!", 2000, "success");
      setTimeout(() => { 
        // Se for admin da própria corporação, também pode ir para o admin
        window.location.href = (role === "admin") ? "system_admin.html" : "main.html";
      }, 1500);
    }

  } catch (err) {
    console.error("Erro detalhado:", err);
    showToast("Erro de conexão. Verifique a consola.", 3000, "error");
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




