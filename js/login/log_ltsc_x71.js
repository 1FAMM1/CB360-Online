    async function loginUser(user, pass) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/users?select=username,password,full_name,corp_oper_nr,patent&username=eq.${user}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) {
          throw new Error(`Erro ao buscar utilizador: ${response.status}`);
        }
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
        const corp = String(userData.corp_oper_nr || "").padStart(4, "0");
        if (corp === "0000") {
          sessionStorage.setItem("isMasterUser", "true");
          sessionStorage.setItem("currentUserDisplay", userData.full_name || user);
          sessionStorage.setItem("currentUserName", user);
          sessionStorage.setItem("currentCorpOperNr", "0000");
          showToast("Bem-vindo à administração do CB360 Online!", 2000, "success");
          setTimeout(() => {
            window.location.href = "system_admin.html";
          }, 2000);
          return;
        }
        const fullName = userData.full_name || user;
        const displayName = fullName;
        sessionStorage.setItem("currentUserDisplay", displayName);
        sessionStorage.setItem("currentUserName", user);
        sessionStorage.setItem("currentCorpOperNr", corp);
        showToast("Login efetuado com sucesso!", 2000, "success");
        setTimeout(() => {
          window.location.href = "main.html";}, 2000);
      } catch (err) {
        console.error(err);
        showToast("Erro de conexão. Verifique a tabela e a RLS.", 3000, "error");
      }
    }
    document.getElementById("loginForm").addEventListener("submit", e => {
      e.preventDefault();
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();
      loginUser(user, pass);
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
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
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