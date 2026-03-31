    /* =========================
    POPUP EMIT
    ========================= */
    function showLoadingPopup(message) {
      document.getElementById("loading-popup")?.remove();
      document.getElementById("loading-overlay")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.style.cssText = `position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(6px); z-index: 10000; animation: fadeIn 0.25s ease;`;
      const popup = document.createElement("div");
      popup.id = "loading-popup";
      popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: #0f172a; padding: 36px 40px; border-radius: 18px;
                             box-shadow: 0 25px 60px rgba(0,0,0,0.4); z-index: 10000; text-align: center; min-width: 400px; max-width: 90%; 
                             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; animation: popupIn 0.25s ease;`;
      const spinner = document.createElement("div");
      spinner.style.cssText = `width: 52px; height: 52px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.12); border-top: 4px solid #38bdf8; margin: 0 auto 22px;
                               animation: spin 0.8s linear infinite;`;
      const text = document.createElement("p");
      text.id = "loading-popup-text";
      text.textContent = message;
      text.style.cssText = `font-size: 17px; font-weight: 600; color: #e2e8f0; margin: 0 0 18px;`;
      const progressBar = document.createElement("div");
      progressBar.id = "loading-progress-bar";
      progressBar.style.cssText = `width: 100%; height: 5px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;`;
      const progressFill = document.createElement("div");
      progressFill.id = "loading-progress-fill";
      progressFill.style.cssText = `width: 0%; height: 100%; background: linear-gradient(90deg,#38bdf8,#6366f1); border-radius: 999px; transition: width 0.35s ease;`;
      progressBar.appendChild(progressFill);
      popup.appendChild(spinner);
      popup.appendChild(text);
      popup.appendChild(progressBar);
      document.body.appendChild(overlay);
      document.body.appendChild(popup);
      if (!document.getElementById("popup-animations")) {
        const style = document.createElement("style");
        style.id = "popup-animations";
        style.textContent = `@keyframes spin {to {transform: rotate(360deg);}}
                             @keyframes popupIn {from {opacity: 0; transform: translate(-50%,-45%) scale(0.98);} to {opacity: 1; transform: translate(-50%,-50%) scale(1);}}
                             @keyframes fadeIn {from {opacity: 0;} to {opacity: 1;}}`;
        document.head.appendChild(style);
      }
    }
    function updateLoadingPopup(message, progress = null) {
      const text = document.getElementById("loading-popup-text");
      if (text) text.textContent = message;
      if (progress !== null) { const fill = document.getElementById("loading-progress-fill"); if (fill) fill.style.width = `${progress}%`; }
    }
    function hideLoadingPopup() {
      const duration = 0;
      ["loading-popup", "loading-overlay"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.animation = id === "loading-popup"
          ? "popupFadeOut 0.3s ease-out"
          : "overlayFadeOut 0.3s ease-out";
        setTimeout(() => el.remove(), duration);
      });
    }