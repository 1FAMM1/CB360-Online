    /* =======================================
              WEATHER WARNINGS
    ======================================= */
    async function fetchIPMAWarnings() {
      try {
        const response = await fetch("https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json");
        const data = await response.json();
        return data.filter(a => a.idAreaAviso === "FAR" && a.awarenessLevelID !== "green");
      } catch (err) {
        console.error("Erro ao buscar avisos IPMA:", err);
        return [];
      }
    }

    function createIPMAAlertCard(alert) {
      const card = document.createElement("div");    
      const levelClass = { yellow: "ipma-yellow", orange: "ipma-orange", red: "ipma-red" }[alert.awarenessLevelID];
      card.className = `ipma-card ${levelClass}`;    
      card.dataset.startTime = alert.startTime;
      card.dataset.endTime = alert.endTime;
      card.innerHTML = `
        <div>
          <div class="ipma-title">${alert.awarenessTypeName}</div>
          <div>Zona: <b>Algarve (Faro)</b></div>
          <div class="ipma-time"><b>Início:</b> ${new Date(alert.startTime).toLocaleString("pt-PT")}</div>
          <div class="ipma-time"><b>Fim:</b> ${new Date(alert.endTime).toLocaleString("pt-PT")}</div>
          ${alert.text ? `<div style="margin-top:6px">${alert.text}</div>` : ""}
        </div>
      `;
      const btn = document.createElement("button");
      btn.textContent = "Emitir Aviso";
      btn.onclick = () => issueNotice(card);
      card.appendChild(btn);    
      return card;
    }

    async function updateWarnings() {
      const container = document.getElementById("ipma-alerts");
      container.innerHTML = "A carregar avisos...";
      const warnings = await fetchIPMAWarnings();
      container.innerHTML = "";
      if (warnings.length === 0) {
        const card = document.createElement("div");
        card.className = "ipma-card ipma-green";
        card.innerHTML = `
          <div>
            <div class="ipma-title">Sem avisos meteorológicos</div>
            <div>Zona: <b>Algarve (Faro)</b></div>
            <div class="ipma-time">Não existem avisos meteorológicos para o Algarve.</div>
          </div>
        `;
        container.appendChild(card);
        return;
      }
      warnings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      warnings.forEach(alert => container.appendChild(createIPMAAlertCard(alert)));
    }
    setInterval(() => {
      const now = new Date();
      document.querySelectorAll("#ipma-alerts .ipma-card").forEach(card => {
        const endTime = new Date(card.dataset.endTime);
        if (endTime <= now) card.remove();
      });
    
      const container = document.getElementById("ipma-alerts");
      if (!container.querySelector(".ipma-card")) {
        const card = document.createElement("div");
        card.className = "ipma-card ipma-green";
        card.innerHTML = `
          <div>
            <div class="ipma-title">Sem avisos meteorológicos</div>
            <div>Zona: <b>Algarve (Faro)</b></div>
            <div class="ipma-time">Não existem avisos meteorológicos para o Algarve.</div>
          </div>
        `;
        container.appendChild(card);
      }
    }, 60 * 1000);
    updateWarnings();
    setInterval(updateWarnings, 10 * 60 * 1000);

    function issueNotice(card) {
      if (!card) return alert("Aviso não encontrado.");
      const tipo = card.querySelector(".ipma-title")?.textContent || "Aviso";
      const startTime = card.dataset.startTime;
      const endTime = card.dataset.endTime;
      const texto = card.querySelector("div > div:nth-child(5)")?.textContent || "";
      let nivel = "";
      if (card.classList.contains("ipma-yellow")) nivel = "AMARELO";
      else if (card.classList.contains("ipma-orange")) nivel = "LARANJA";
      else if (card.classList.contains("ipma-red")) nivel = "VERMELHO";
      let mensagem = "";
      if (nivel === "AMARELO") {
        mensagem =
          `*⚠️🚨AVISO METEOROLÓGICO🚨⚠️*\n\n` +
          `*🟡 AVISO METEO ${nivel}* para o Distrito de *${formatDate(startTime)}* até *${formatDate(endTime)}*.\n` +
          `*${texto}* \\\Fonte IPMA`;
      }
      else if (nivel === "LARANJA") {
        mensagem =
          `*⚠️🚨AVISO METEOROLÓGICO🚨⚠️*\n\n` +
          `*🟠 AVISO METEO ${nivel}* para o Distrito de *${formatDate(startTime)}* até *${formatDate(endTime)}*.\n` +
          `*${texto}* \\\\Fonte IPMA\n\n` +
          `_Solicita-se disponibilidade de elementos para eventual elevado número de ocorrências._\n` +
          `_As disponibilidades devem ser remetidas à SALOC com a maior brevidade possível._\n` +
          `Obrigado!`;
      }
      else if (nivel === "VERMELHO") {
        mensagem =
          `*⚠️🚨AVISO METEOROLÓGICO🚨⚠️*\n\n` +
          `*🔴 AVISO METEO ${nivel}* para o Distrito de *${formatDate(startTime)}* até *${formatDate(endTime)}*.\n` +
          `*${texto}* \\\Fonte IPMA\n\n` +
          `_*MOBILIZAÇÃO GERAL DO EFETIVO DO CORPO DE BOMBEIROS.*_\n` +
          `Obrigado!`;
      }
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(mensagem).then(() => {
          alert("Mensagem copiada! Pode colar no WhatsApp ou outro chat.");
        }).catch(() => {
          alert("Não foi possível copiar automaticamente. Copie manualmente:\n\n" + mensagem);
        });
      } else {
        alert("Copie manualmente a mensagem:\n\n" + mensagem);
      }
    }
    
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      if (isNaN(date)) return dateStr;
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const year = String(date.getFullYear()).slice(-2);
      return `${day}${hour}${min}${month}${year}`;
    }