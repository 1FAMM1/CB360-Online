    async function loginUser(user, pass) {
  try {
    // 1. Buscamos agora também o n_int e o user_role (ou access_level)
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=username,password,full_name,corp_oper_nr,n_int,user_role&username=eq.${user}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const data = await response.json();

    if (data.length === 0) {
      showToast("Utilizador não encontrado.", 2000, "error");
      return;
    }

    const userData = data[0];

    // 2. Validação de Password
    if (userData.password !== pass) {
      showToast("Password incorreta.", 2000, "error");
      return;
    }

    // 3. Preparação dos dados da Corporação
    const corp = String(userData.corp_oper_nr || "").padStart(4, "0");

    // 4. INJEÇÃO DE DADOS NO SESSION STORAGE
    // Estes dados serão usados pelo teu código para filtrar o que o user vê
    sessionStorage.setItem("currentUserDisplay", userData.full_name || user);
    sessionStorage.setItem("currentUserName", user);
    sessionStorage.setItem("currentCorpOperNr", corp);
    sessionStorage.setItem("currentNInt", userData.n_int); // FUNDAMENTAL PARA RLS
    sessionStorage.setItem("currentUserRole", userData.user_role || "user"); // FUNDAMENTAL PARA ADMIN

    // 5. Redirecionamento baseado no tipo de utilizador
    if (corp === "0000" || userData.user_role === "admin") {
      showToast("Bem-vindo, Administrador!", 2000, "success");
      setTimeout(() => { window.location.href = "system_admin.html"; }, 1500);
    } else {
      showToast("Login efetuado com sucesso!", 2000, "success");
      setTimeout(() => { window.location.href = "main.html"; }, 1500);
    }

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
