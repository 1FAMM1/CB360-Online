    /* =======================================
            AIR RESOURCE CENTERS
    ======================================= */
    async function loadCMAsFromSupabase() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/air_centers?order=id.asc`, {
          method: "GET",
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
        const data = await response.json();
        data.forEach(row => {
          const n = String(row.id).padStart(2, '0');
          const nameInput = document.getElementById(`cma_aero_type_${n}`);
          const typeSelect = document.getElementById(`cma_type_${n}`);
          const autoInput = document.getElementById(`cma_auto_${n}`);
          const imageElement = document.getElementById(`cma_image_${n}`);
          if (nameInput) nameInput.value = row.aero_name || "";
          if (typeSelect) {
            typeSelect.value = row.aero_type || "";
            if (imageElement) {
              let src;
              switch (typeSelect.value) {
                case "Heli Ligeiro":
                  src = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/img/heli_ligeiro.jpg";
                  break;
                case "Heli Médio":
                  src = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/img/heli_medio.jpg";
                  break;
                case "Heli Pesado":
                  src = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/img/heli_pesado.jpg";
                  break;
                case "Avião de Asa Fixa Médio":
                  src = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/img/aviao_asa_fixa_medio.jpg";
                  break;
                case "Avião de Asa Fixa Pesado":
                  src = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/img/aviao_asa_fixa_pesado.png";
                  break;
                default:
                  src = "https://i.imgur.com/4Ho5HRV.png";
              }
              imageElement.src = src;
            }
          }
          if (autoInput) autoInput.value = row.aero_autonomy || "";
        });
        console.log("✅ CMAs carregados com dados do Supabase:", data);
      } catch (error) {
        console.error("❌ Erro ao carregar CMAs do Supabase:", error);
      }
    }
    document.addEventListener("DOMContentLoaded", loadCMAsFromSupabase);