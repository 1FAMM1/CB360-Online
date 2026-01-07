    async function loginUser(user, pass) {
  try {
    // PASSO 1: Validar username e password na tabela 'users'
    // Aqui só pedimos o que existe na 'users': username, password e n_int
    const resUser = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=username,password,n_int&username=eq.${encodeURIComponent(user)}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!resUser.ok) {
      const errorDetail = await resUser.json();
      console.error("Erro na tabela users:", errorDetail);
      throw new Error("Erro ao consultar tabela users");
    }

    const dataUser = await resUser.json();

    if (dataUser.length === 0) {
      showToast("Utilizador não encontrado.", 2000, "error");
      return;
    }

    const userData = dataUser[0];

    // Verificar password
    if (userData.password !== pass) {
      showToast("Password incorreta.", 2000, "error");
      return;
    }

    // PASSO 2: Agora que sabemos o n_int, vamos buscar o user_role à 'reg_elems'
    const resElems = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=full_name,corp_oper_nr,user_role&n_int=eq.${userData.n_int}`, {
        headers: getSupabaseHeaders()
      }
    );

    if (!resElems.ok) {
      console.error("Erro ao buscar dados em reg_elems");
      throw new Error("Erro na tabela reg_elems");
    }

    const dataElems = await resElems.json();
    const detalhes = dataElems[0] || {};

    // PASSO 3: Guardar tudo no SessionStorage
    const corp = String(detalhes.corp_oper_nr || "").padStart(4, "0");
    const role = detalhes.user_role || "user"; // Aqui sim, usamos a coluna que só existe na reg_elems

    sessionStorage.setItem("currentUserName", user);
    sessionStorage.setItem("currentNInt", userData.n_int);
    sessionStorage.setItem("currentCorpOperNr", corp);
    sessionStorage.setItem("currentUserRole", role);
    sessionStorage.setItem("currentUserDisplay", detalhes.full_name || user);

    showToast("Bem-vindo!", 2000, "success");

    // Redirecionamento
    setTimeout(() => {
      if (role === "admin" || corp === "0000") {
        window.location.href = "system_admin.html";
      } else {
        window.location.href = "main.html";
      }
    }, 1500);

  } catch (err) {
    console.error("Erro detalhado:", err);
    showToast("Erro ao processar login. Verifique a consola.", 3000, "error");
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



