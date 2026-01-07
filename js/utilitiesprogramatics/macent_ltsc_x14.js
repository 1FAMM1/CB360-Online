/* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
   async function loadCMAsFromSupabase() {
  console.log("🚀 [CMA] Iniciando leitura segura com imagens...");
  try {
    if (typeof createCmaInputs === "function") createCmaInputs();

    // Nota: Certifica-te se usas sessionStorage ou localStorage (vimos anteriormente que o teu getHeaders usa localStorage)
    const corpId = localStorage.getItem('currentCorpOperNr') || sessionStorage.getItem('currentCorpOperNr'); 
    
    if (!corpId) {
      console.error("❌ Erro: currentCorpOperNr não encontrado!");
      return;
    }

    const headers = getSupabaseHeaders();
    headers['x-my-corpo'] = corpId; 

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/air_centers?corp_oper_nr=eq.${corpId}&order=id.asc`, 
      {
        method: "GET",
        headers: headers
      }
    );

    if (!res.ok) throw new Error(`Erro Supabase: ${res.status}`);

    const data = await res.json();
    console.log("📦 Dados recebidos:", data);

    if (data.length === 0) {
      console.warn("⚠️ O banco devolveu 0 linhas para a corp:", corpId);
      return;
    }

    // Mapeamento das imagens
    const imagensAeronaves = {
      "Heli Ligeiro": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_ligeiro.jpg",
      "Heli Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_medio.jpg",
      "Heli Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/heli_pesado.jpg",
      "Avião de Asa Fixa Médio": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_medio.jpg",
      "Avião de Asa Fixa Pesado": "https://raw.githubusercontent.com/1FAMM1/CB360-Online/main/img/aviao_asa_fixa_pesado.png"
    };

    data.forEach((row, index) => {
      const n = String(index + 1).padStart(2, '0');
      const nameInput = document.getElementById(`cma_aero_type_${n}`);
      const typeSelect = document.getElementById(`cma_type_${n}`);
      const autoInput = document.getElementById(`cma_auto_${n}`);
      const imageElement = document.getElementById(`cma_image_${n}`);

      if (nameInput) {
        nameInput.value = row.aero_name || "";
        nameInput.dataset.rowId = row.id; 
      }

      if (typeSelect) {
        typeSelect.value = row.aero_type || "";
        
        // --- PARTE DAS IMAGENS ---
        if (imageElement) {
          const src = imagensAeronaves[row.aero_type] || "https://i.imgur.com/4Ho5HRV.png";
          imageElement.src = src;
        }
      }

      if (autoInput) {
        autoInput.value = row.aero_autonomy || "";
      }
    });

    console.log("✅ [CMA] Dados e imagens carregados com sucesso.");

  } catch (error) {
    console.error("❌ Erro no load:", error);
  }
}







    
    async function saveCMAsGroupFields() {
    console.log("💾 [CMA] A iniciar gravação segura...");
    try {
        // 1. Obter o ID da corporação (prioridade ao localStorage que o teu header usa)
        const corpId = localStorage.getItem('currentCorpOperNr') || sessionStorage.getItem('currentCorpOperNr');
        
        if (!corpId) {
            showPopupWarning("❌ Erro: Sessão expirada. Faça login novamente.");
            return;
        }

        const headers = getSupabaseHeaders();
        // Garantir que o header de segurança vai no pedido
        headers['x-my-corpo'] = corpId;

        // 2. Loop pelos 6 cards
        for (let i = 1; i <= 6; i++) {
            const n = String(i).padStart(2, '0');
            const nameInput = document.getElementById(`cma_aero_type_${n}`);
            const typeSelect = document.getElementById(`cma_type_${n}`);
            const autoInput = document.getElementById(`cma_auto_${n}`);

            // Só tentamos gravar se o input existir e tiver o ID que veio do Load
            if (nameInput && nameInput.dataset.rowId) {
                const dbId = nameInput.dataset.rowId;

                const payload = {
                    aero_name: nameInput.value || "",
                    aero_type: typeSelect.value || "",
                    aero_autonomy: autoInput.value || "",
                    corp_oper_nr: corpId // Mantém o vínculo de segurança
                };

                console.log(`📡 A atualizar Card ${n} (ID Banco: ${dbId})...`);

                const res = await fetch(
                    `${SUPABASE_URL}/rest/v1/air_centers?id=eq.${dbId}`, 
                    {
                        method: "PATCH",
                        headers: headers,
                        body: JSON.stringify(payload)
                    }
                );

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error(`❌ Erro no Card ${n}:`, errorData.message);
                    throw new Error(`Falha ao gravar card ${n}`);
                }
            }
        }

        showPopupSuccess("✅ Todos os dados foram guardados com sucesso!");
        
        // 3. Recarregar os dados para confirmar que o banco aceitou tudo
        loadCMAsFromSupabase();

    } catch (error) {
        console.error("❌ Erro fatal na gravação:", error);
        showPopupWarning("❌ Ocorreu um erro ao guardar os dados. Verifique a consola.");
    }
}
    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);






