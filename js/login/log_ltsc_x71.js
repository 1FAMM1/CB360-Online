    async function loginUser(user, pass) {
  try {
    // 1. Procuramos na tabela 'users' e trazemos os dados da 'reg_elems' ligada pelo n_int
    // Nota: Certifica-te que a coluna n_int existe em ambas as tabelas para eles se "falarem"
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=username,password,n_int,reg_elems(full_name,corp_oper_nr,user_role)&username=eq.${user}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!response.ok) throw new Error(`Erro na rede: ${response.status}`);
    
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

    // 3. Extração dos dados (que vêm dentro do objeto reg_elems devido ao join)
    const detalhes = userData.reg_elems; 
    const corp = String(detalhes?.corp_oper_nr || "").padStart(4, "0");
    const role = detalhes?.user_role || "user";

    // 4. Gravação no SessionStorage
    sessionStorage.setItem("currentUserName", user);
    sessionStorage.setItem("currentNInt", userData.n_int);
    sessionStorage.setItem("currentCorpOperNr", corp);
    sessionStorage.setItem("currentUserRole", role);
    sessionStorage.setItem("currentUserDisplay", detalhes?.full_name || user);

    // 5. Redirecionamento
    showToast("Bem-vindo!", 2000, "success");
    
    setTimeout(() => {
      if (role === "admin" || corp === "0000") {
        window.location.href = "system_admin.html";
      } else {
        window.location.href = "main.html";
      }
    }, 1500);

  } catch (err) {
    console.error("Erro no login:", err);
    showToast("Erro ao validar acesso. Verifique a consola.", 3000, "error");
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

