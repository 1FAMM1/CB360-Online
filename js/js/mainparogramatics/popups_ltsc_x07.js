    /* =======================================
       POPUPS
    ======================================= */
    function setupPopup(modalId, okBtnId, clearFields = false) {
      const modal = document.getElementById(modalId);
      const okBtn = document.getElementById(okBtnId);
      if (!modal || !okBtn) return;
      okBtn.onclick = () => {
        modal.classList.remove("show");
        if (clearFields) clearFormFields();
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
    setupPopup("popup-modal", "popup-ok-btn");
    setupPopup("popup-success-modal", "popup-success-ok-btn", true);
    setupPopup("popup-warning-modal", "popup-warning-ok-btn");

    function showPopupMissingFields(fields) {
      const modal = document.getElementById("popup-modal");
      const list = document.getElementById("missing-fields-list");
      if (!modal || !list) return;
      list.innerHTML = "";
      fields.forEach(f => {
        const li = document.createElement("li");
        li.textContent = f;
        list.appendChild(li);
      });
      modal.classList.add("show");
      modal.focus();
    }

    function showPopupSuccess(message = "", clearFields = false) {
      const modal = document.getElementById("popup-success-modal");
      if (!modal) return;
      const textElem = modal.querySelector("p");
      if (textElem) textElem.textContent = message;
      modal.classList.add("show");
      modal.focus();
      const okBtn = document.getElementById("popup-success-ok-btn");
      if (okBtn) {
        okBtn.onclick = () => {
          modal.classList.remove("show");
          if (clearFields) clearFormFields();
        };
      }
    }

    function showPopupWarning(message) {
      const modal = document.getElementById("popup-warning-modal");
      if (!modal) return;
      const textElem = modal.querySelector("p");
      if (textElem) textElem.innerHTML = message;
      modal.classList.add("show");
      modal.focus();
    }