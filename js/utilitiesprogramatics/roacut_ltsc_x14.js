    /* =======================================
            ROAD CLOSURES
    ======================================= */
    async function loadRoutesFromSupabase() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/street_cut?order=id.asc`, {
          method: "GET",
          headers: getSupabaseHeaders()
        });
        if (!response.ok) {
          throw new Error(`Erro Supabase: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        data.forEach((row, index) => {
          const n = String(row.id).padStart(2, '0');
          const nameInput = document.getElementById(`route-${n}-name`);
          const motiveInput = document.getElementById(`route-${n}-motive`);
          const untilInput = document.getElementById(`route-${n}-until`);
          if (nameInput) nameInput.value = row.street_name || "";
          if (motiveInput) motiveInput.value = row.cut_motive || "";
          if (untilInput) untilInput.value = row.cut_until || "";
        });
      } catch (error) {
        console.error("❌ Erro ao carregar dados do Supabase:", error);
      }
    }
    document.addEventListener("DOMContentLoaded", loadRoutesFromSupabase);
    async function saveRoutesGroupFields() {
      try {
        for (let i = 1; i <= 12; i++) {
          const n = String(i).padStart(2, '0');
          const streetName = document.getElementById(`route-${n}-name`).value.trim();
          const cutMotive = document.getElementById(`route-${n}-motive`).value.trim();
          const cutUntil = document.getElementById(`route-${n}-until`).value.trim();
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/street_cut?id=eq.${i}`, {
              method: "PATCH",
              headers: getSupabaseHeaders({
                returnRepresentation: true
              }),
              body: JSON.stringify({
                street_name: streetName || "",
                cut_motive: cutMotive || "",
                cut_until: cutUntil || ""
              })
            }
          );
          let data = null;
          if (response.headers.get("content-type")?.includes("application/json")) {
            data = await response.json();
          }
          if (!response.ok) {
            throw new Error(`Erro Supabase: ${response.status} - ${response.statusText} - ${JSON.stringify(data)}`);
          }
        }
        showPopupSuccess("Todos os cortes de Vias/Arruamentos foram atualizados com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao gravar no Supabase:", error);
        alert("Erro ao gravar no Supabase. Ver consola.");
      }

    }
