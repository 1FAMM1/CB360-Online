    async function loginUser(user, pass) {
  try {
    // 1. Validar as credenciais na tabela 'users'
    const resUser = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=username,password,n_int&username=eq.${user}`, {
        headers: getSupabaseHeaders()
      }
    );
    
    if (!resUser.ok) throw new Error(`Erro na tabela users: ${resUser.status}`);
    const dataUser = await resUser.json();

    if (dataUser.length === 0 || dataUser[0].password !== pass) {
      showToast("Credenciais inválidas.", 2000, "error");
      return;
    }

    const nIntLogado = dataUser[0].n_int;

    // 2. Buscar permissões e dados na 'reg_elems' usando o n_int obtido
    const resElems = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=full_name,corp_oper_nr,user_role&n_int=eq.${nIntLogado}`, {
        headers: getSupabaseHeaders()
      }
    );
    
    if (!resElems.ok) throw new Error(`Erro na tabela reg_elems: ${resElems.status}`);
    const dataElems = await resElems.json();
    
    const detalhes = dataElems[0] || {};
    const corp = String(detalhes.corp_oper_nr || "").padStart(4, "0");
    const role = detalhes.user_role || "user"; // Agora usando user_role

    // 3. GRAVAÇÃO NO SESSION STORAGE
    sessionStorage.setItem("currentUserName", user);
    sessionStorage.setItem("currentNInt", nIntLogado);
    sessionStorage.setItem("currentCorpOperNr", corp);
    sessionStorage.setItem("currentUserRole", role);
    sessionStorage.setItem("currentUserDisplay", detalhes.full_name || user);

    showToast("Bem-vindo ao CB360!", 2000, "success");
    
    // 4. Redirecionamento Inteligente
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


