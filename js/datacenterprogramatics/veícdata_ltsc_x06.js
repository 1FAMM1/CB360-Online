    /* =======================================
               VEHICLE LISTING
    ======================================= */
    /* ================= LOAD VEHICLES TABLE ================= */
    async function loadVehiclesTable() {
  try {
    const corpOperNr = sessionStorage.getItem("currentCorpOperNr");
    if (!corpOperNr) throw new Error("Corporação não definida");

    const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?select=*&corp_oper_nr=eq.${encodeURIComponent(corpOperNr)}`, {
      method: "GET",
      headers: getSupabaseHeaders()
    });
    if (!response.ok) throw new Error(`Erro Supabase: ${response.status}`);
    const data = await response.json();

    const tbody = document.querySelector("#veícs-container tbody");
    tbody.innerHTML = "";

    if (!data.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="text-align:center; padding:20px; color:#666;">
                        Nenhum veículo encontrado.
                      </td>`;
      tbody.appendChild(tr);
      return;
    }

    data.sort((a, b) => (a.vehicle ?? "").localeCompare(b.vehicle ?? "", "pt", { numeric: true }));

    data.forEach(row => {
      const tr = document.createElement("tr");
      ["vehicle", "vehicle_registration", "current_status"].forEach(field => {
        const td = document.createElement("td");
        td.textContent = row[field] ?? "";
        td.style.textAlign = "center";
        if (field === "current_status") {
          if (row.current_status === "Disponível no Quartel") td.style.color = "green";
          else if (row.current_status === "Em Serviço") td.style.color = "orange";
          else if (row.current_status === "Inoperacional") td.style.color = "red";
        }
        tr.appendChild(td);
      });

      const tdAction = document.createElement("td");
      tdAction.style.textAlign = "center";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.classList.add("btn-action");
      editBtn.style.marginRight = "5px";
      editBtn.addEventListener("click", () => fillVehicleForm(row));
      tdAction.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.classList.add("btn-delete");
      deleteBtn.addEventListener("click", () => deleteVehicle(row.id, row.vehicle));
      tdAction.appendChild(deleteBtn);

      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("❌ Erro ao carregar veículos:", err);
  }
}

    /* ================= FILL FORM FOR EDIT ================= */
    let editingVehicleId = null;
    function fillVehicleForm(vehicle) {
      editingVehicleId = vehicle.id;
      document.getElementById("new-veíc-name").value = vehicle.vehicle ?? "";
      document.getElementById("new-veíc-registration").value = vehicle.vehicle_registration ?? "";
      document.getElementById("new-veíc-brand").value = vehicle.vehicle_brand ?? "";
      document.getElementById("new-veíc-model").value = vehicle.vehicle_model ?? "";
      document.getElementById("new-veíc-buy-date").value = vehicle.buy_date ?? "";
      document.getElementById("new-veíc-registration-date").value = vehicle.registration_date ?? "";
      document.getElementById("new-veíc-state").value = vehicle.current_status ?? "";
    }
    /* ================= ADD / UPDATE VEHICLE ================= */
    document.querySelector("#new-veíc-save-update").addEventListener("click", async () => {
  const vehicleName = document.getElementById("new-veíc-name").value;
  const vehicleRegistration = document.getElementById("new-veíc-registration").value;
  const currentCorpOperNr = sessionStorage.getItem("currentCorpOperNr"); // pegar a corporação atual

  if (!vehicleName || !vehicleRegistration) {
    alert("Nome e matrícula são obrigatórios!");
    return;
  }
  
  if (!currentCorpOperNr) {
    alert("Corporação não definida!");
    return;
  }

  const payload = {
    vehicle: vehicleName,
    vehicle_registration: vehicleRegistration,
    vehicle_brand: document.getElementById("new-veíc-brand").value,
    vehicle_model: document.getElementById("new-veíc-model").value,
    buy_date: document.getElementById("new-veíc-buy-date").value,
    registration_date: document.getElementById("new-veíc-registration-date").value,
    current_status: document.getElementById("new-veíc-state").value,
    is_inop: document.getElementById("new-veíc-state").value === "Inoperacional",
    corp_oper_nr: currentCorpOperNr  // adiciona aqui
  };

  try {
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicleName)}&vehicle_registration=eq.${encodeURIComponent(vehicleRegistration)}&corp_oper_nr=eq.${encodeURIComponent(currentCorpOperNr)}`,
      {
        method: "GET",
        headers: getSupabaseHeaders()
      }
    );

    if (!checkResponse.ok) throw new Error(`Erro ao verificar veículo: ${checkResponse.status}`);

    const existingVehicles = await checkResponse.json();

    if (existingVehicles.length > 0) {
      // UPDATE
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/vehicle_status?vehicle=eq.${encodeURIComponent(vehicleName)}&vehicle_registration=eq.${encodeURIComponent(vehicleRegistration)}&corp_oper_nr=eq.${encodeURIComponent(currentCorpOperNr)}`,
        {
          method: "PATCH",
          headers: getSupabaseHeaders({ Prefer: "return=representation" }),
          body: JSON.stringify(payload)
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Erro ao atualizar: ${updateResponse.status} - ${errorData.message || ''}`);
      }

      alert("Veículo atualizado com sucesso!");
    } else {
      // INSERT
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/vehicle_status`,
        {
          method: "POST",
          headers: getSupabaseHeaders({ Prefer: "return=representation" }),
          body: JSON.stringify(payload)
        }
      );

      if (!insertResponse.ok) {
        const errorData = await insertResponse.json();
        throw new Error(`Erro ao criar: ${insertResponse.status} - ${errorData.message || ''}`);
      }

      alert("Veículo adicionado com sucesso!");
    }

    loadVehiclesTable();

    // limpar campos
    ["new-veíc-name","new-veíc-registration","new-veíc-brand","new-veíc-model","new-veíc-buy-date","new-veíc-registration-date","new-veíc-state"].forEach(id => {
      document.getElementById(id).value = "";
    });

  } catch (err) {
    console.error("Erro:", err);
    alert(`Erro: ${err.message}`);
  }
});

    /* ================= DELETE VEHICLE ================= */
    async function deleteVehicle(id, vehicleName) {
      const confirmDelete = confirm(`Tem certeza que deseja remover o veículo "${vehicleName}"?`);
      if (!confirmDelete) return;    
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_status?id=eq.${id}`, {
          method: "DELETE",
          headers: getSupabaseHeaders()
        });
        if (!response.ok) throw new Error("Erro ao remover veículo");
        alert("Veículo removido com sucesso!");
        loadVehiclesTable();
      } catch (err) {
        console.error(err);
        alert("Erro ao remover veículo.");
      }
    }
    document.addEventListener("DOMContentLoaded", () => {
      loadVehiclesTable();
    });