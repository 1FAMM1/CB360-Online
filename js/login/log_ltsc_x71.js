   async function loginUser(user, pass) {
  try {
    // 1. Validar na tabela 'users'
    const resUser = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=username,password,n_int&username=eq.${encodeURIComponent(user)}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!resUser.ok) throw new Error(`Erro na tabela users: ${resUser.status}`);
    const dataUser = await resUser.json();

    if (dataUser.length === 0 || dataUser[0].password !== pass) {
      showToast("Credenciais inválidas.", 2000, "error");
      return;
    }

    const userData = dataUser[0];

    // 2. Buscar detalhes na tabela 'reg_elems' para injeção de dados
    const resElems = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=n_int,full_name,corp_oper_nr,user_role&n_int=eq.${userData.n_int}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!resElems.ok) throw new Error("Erro ao aceder a reg_elems");
    const dataElems = await resElems.json();

    if (dataElems.length === 0) {
      showToast("Utilizador sem ficha de elemento.", 3000, "error");
      return;
    }

    const elem = dataElems[0];
    const corp = String(elem.corp_oper_nr || "").padStart(4, "0");

    // 3. Injeção de dados na sessão (Para as RLS funcionarem internamente)
    sessionStorage.setItem("currentUserName", user);
    sessionStorage.setItem("currentNInt", elem.n_int);
    sessionStorage.setItem("currentCorpOperNr", corp);
    sessionStorage.setItem("currentUserRole", elem.user_role || "user");
    sessionStorage.setItem("currentUserDisplay", elem.full_name);

    showToast("Login efetuado com sucesso!", 2000, "success");

    // 4. Redirecionamento restrito pelo Número de Corporação
    setTimeout(() => {
      if (corp === "0000") {
        // Apenas o nr 0000 vai para a administração
        sessionStorage.setItem("isMasterUser", "true");
        window.location.href = "system_admin.html";
      } else {
        // Todos os outros (mesmo que sejam admin no user_role) vão para a main
        window.location.href = "main.html";
      }
    }, 1500);

  } catch (err) {
    console.error("Erro:", err);
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






