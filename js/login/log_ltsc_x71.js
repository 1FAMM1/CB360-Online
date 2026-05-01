     /* ================= LOGIN ================= */
    async function loginUser(user, pass) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/users?username=eq.${user}&select=username,password,full_name,corp_oper_nr,n_int,validate&limit=1`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();
        if (!data || data.length === 0) {
          showToast("Utilizador não encontrado.", 2000, "error");
          return;
        }
        const userData = data[0];
        console.log("LOGIN DEBUG:", userData);
        if (userData.password !== pass) {
          showToast("Password incorreta.", 2000, "error");
          return;
        }
        if (userData.validate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expireDate = new Date(userData.validate);
          expireDate.setHours(0, 0, 0, 0);
          if (expireDate < today) {
            showToast("A sua conta expirou em " + expireDate.toLocaleDateString(), 3000, "error");
            return;
          }
        }
        const corp = userData.corp_oper_nr;
        if (!corp) {
          console.error("❌ corp_oper_nr inválido:", userData);
          showToast("Erro interno: corporação inválida.", 3000, "error");
          return;
        }
        const regResp = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=user_role,elem_state,acess&n_int=eq.${userData.n_int}&corp_oper_nr=eq.${corp}`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!regResp.ok) throw new Error("Erro ao buscar reg_elems");
        const regData = await regResp.json();
        if (regData.length > 0 && regData[0].elem_state === false) {
          showToast("Conta inativa nesta corporação.", 3000, "error");
          return;
        }
        sessionStorage.setItem("currentUserDisplay", userData.full_name);
        sessionStorage.setItem("currentUserName", userData.username);
        sessionStorage.setItem("currentCorpOperNr", corp);
        sessionStorage.setItem("currentNInt", userData.n_int);
        if (regData.length > 0) {
          sessionStorage.setItem("currentUserRole", regData[0].user_role || "user");
          sessionStorage.setItem("allowedModules", regData[0].acess || "");
        } else {
          sessionStorage.setItem("currentUserRole", "user");
          sessionStorage.setItem("allowedModules", "");
        }
        showToast("Login efetuado com sucesso!", 2000, "success");
        const userRole = regData[0]?.user_role || "user";
        setTimeout(() => {
          // Só entra se for as DUAS coisas ao mesmo tempo: role admin E corporação 0000
          if (userRole === "admin" && corp === "0000") {
            window.location.href = "system_admin.html";
          } else {
            // Todos os outros (admins de outras corps ou users normais) vão para a main
            window.location.href = "main.html";
          }
        }, 1500);
      } catch (err) {
        console.error("❌ ERRO LOGIN:", err);
        showToast("Erro ao validar acesso.", 3000, "error");
      }
    }
    document.getElementById("loginForm").addEventListener("submit", e => {
      e.preventDefault();
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();
      if (!user || !pass) {
        showToast("Preencha todos os campos.", 2000, "error");
        return;
      }
      loginUser(user, pass);
    });
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        togglePassword.classList.toggle("fa-eye");
        togglePassword.classList.toggle("fa-eye-slash");
      });
    }
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
      setTimeout(() => {
        toast.classList.remove("show");
      }, duration);
    }
    function updateGreeting() {
      const now = new Date();
      const hour = now.getHours();
      let greetingText = "🌙 Boa noite";
      if (hour >= 6 && hour < 12) greetingText = "☀️ Bom dia";
      else if (hour >= 12 && hour < 19) greetingText = "🌤️ Boa tarde";
      const greetingEl = document.getElementById("greetingText");
      const clockEl = document.getElementById("clock");
      if (greetingEl) greetingEl.textContent = greetingText;
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      }
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
    const usernameInput = document.getElementById("username");
    if (usernameInput) usernameInput.focus();
