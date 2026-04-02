    /* =======================================
    POPUPS
    ======================================= */
    function showPopup(id, mensagem, clearFields = false) {
      const ul = document.querySelector('#' + id + ' .popup-body ul');
      if (!ul) return;
      if (Array.isArray(mensagem)) {
        ul.innerHTML = mensagem.map(m => `<li style="list-style:none;">• ${m}</li>`).join('');
      } else {
        ul.innerHTML = `<li>${mensagem}</li>`;
      }
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('show');
      const okBtn = modal.querySelector('.popup-btn');
      if (okBtn) {
        okBtn.onclick = () => {
          modal.classList.remove('show');
          if (clearFields) clearFormFields();
        };
      }
    }
    function closePopup(id) {
      document.getElementById(id).classList.remove('show');
    }
    /* =======================================
       TEMPORÁRIO PARA MÓDULOS EM COSTRUÇÃO
    ======================================= */
    function showTempWarning(message) {
      const modal = document.getElementById("popup-temp-modal");
      if (!modal) return;
      const textElem = modal.querySelector("p");
      if (textElem) textElem.innerHTML = message;
      modal.classList.add("show");
      modal.focus();
    }    
    function setupTempPopup() {
      const modal = document.getElementById("popup-temp-modal");
      const okBtn = document.getElementById("popup-temp-ok-btn");
      if (!modal || !okBtn) return;  
      okBtn.onclick = () => {
        modal.classList.remove("show");
        const mainButton = document.querySelector('[data-page="page-main"]');
        if (mainButton) {
          mainButton.click();
        }
      };  
      modal.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          okBtn.click();
        }
      });  
      modal.addEventListener("transitionend", () => {
        if (modal.classList.contains("show")) {
          modal.focus();
        }
      });
    }
    setupTempPopup();
