      async function loginUser(user, pass) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?username=eq.${user}&select=username,password,full_name,corp_oper_nr,n_int,validate&limit=1`,
      { headers: getSupabaseHeaders() }
    );

    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    const data = await response.json();

    // 🔒 Validação básica
    if (!data || data.length === 0) {
      showToast("Utilizador não encontrado.", 2000, "error");
      return;
    }

    const userData = data[0];

    console.log("LOGIN DEBUG USER:", userData);

    // 🔐 Password
    if (userData.password !== pass) {
      showToast("Password incorreta.", 2000, "error");
      return;
    }

    // 📅 Validade
    if (userData.validate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expireDate = new Date(userData.validate);
      expireDate.setHours(0, 0, 0, 0);

      if (expireDate < today) {
        showToast(
          "A sua conta expirou em " + expireDate.toLocaleDateString(),
          3000,
          "error"
        );
        return;
      }
    }

    // 🏢 Corporação (SEM fallback!)
    const corp = userData.corp_oper_nr;

    if (!corp) {
      console.error("❌ corp_oper_nr inválido:", userData);
      showToast("Erro interno: corporação inválida.", 3000, "error");
      return;
    }

    console.log("CORP DETETADO:", corp);

    // 👤 Buscar reg_elems (acessos)
    const regResp = await fetch(
      `${SUPABASE_URL}/rest/v1/reg_elems?select=user_role,elem_state,acess&n_int=eq.${userData.n_int}&corp_oper_nr=eq.${corp}`,
      { headers: getSupabaseHeaders() }
    );

    if (!regResp.ok) throw new Error("Erro ao buscar reg_elems");

    const regData = await regResp.json();

    console.log("REG DATA:", regData);

    // 🚫 Conta inativa
    if (regData.length > 0 && regData[0].elem_state === false) {
      showToast("Conta inativa nesta corporação.", 3000, "error");
      return;
    }

    // 💾 GUARDAR SESSION (fonte única!)
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

    // 🚀 Redirecionamento correto
    const userRole = regData[0]?.user_role || "user";

    setTimeout(() => {
      if (userRole === "admin" || corp === "0000") {
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
