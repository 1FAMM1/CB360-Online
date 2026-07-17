          /* ================= LOGIN ================= */
 const SUPABASE_URL = 'https://rjkbodfqsvckvnhjwmhg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa2JvZGZxc3Zja3ZuaGp3bWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjM3NjQsImV4cCI6MjA2MzczOTc2NH0.jX5OPZkz1JSSwrahCoFzqGYw8tYkgE8isbn12uP43-0';
const LOGIN_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/dynamic-task`;

async function loginUser(user, pass) {
  try {
    const response = await fetch(LOGIN_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await response.json();

    if (!response.ok) {
      // A function deve devolver algo como { error: "Utilizador não encontrado" } ou { error: "Password incorreta" }
      showToast(data.error || "Erro ao validar acesso.", 2500, "error");
      return;
    }

    if (!data.token) {
      console.error("❌ Resposta de login sem token:", data);
      showToast("Erro interno: resposta de login inválida.", 3000, "error");
      return;
    }

    console.log("LOGIN DEBUG:", { ...data, token: data.token.slice(0, 20) + "..." });

    // ---- Guardar sessão ----
    sessionStorage.setItem("authToken", data.token);
    sessionStorage.setItem("currentUserDisplay", data.full_name);
    sessionStorage.setItem("currentUserName", data.username || user);
    sessionStorage.setItem("currentCorpOperNr", data.corp_oper_nr);
    sessionStorage.setItem("currentNInt", data.n_int);
    sessionStorage.setItem("currentUserRole", data.user_role || "user");
    sessionStorage.setItem("allowedModules", data.allowed_modules || "");

    showToast("Login efetuado com sucesso!", 2000, "success");

    const userRole = data.user_role || "user";
    const corp = data.corp_oper_nr;

    setTimeout(() => {
      if (userRole === "admin" && corp === "0000") {
        window.location.href = "system_admin.html";
      } else {
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
document.getElementById('login-footer-year').textContent = new Date().getFullYear();
