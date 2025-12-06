    /* =======================================
       GENERIC CLEAR
    ======================================= */    
    function clearFormFields() {
      const today = getCurrentDateStr();
      document.querySelectorAll('input[type="text"], input[type="time"]').forEach(i => i.value = '');
      document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
      document.querySelectorAll('input[type="date"]').forEach(i => i.value = today);
      document.querySelectorAll('textarea').forEach(t => t.value = '');
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      setTimeout(() => {
        const parishSelect = document.getElementById('parish_select');
        if (parishSelect) {
          parishSelect.innerHTML = '';
        }
      }, 10);
    }
    /* =======================================
       GENERIC MAIL GREETINGS
    ======================================= */
    function getGreeting(customDate) {
      const now = customDate ? new Date(customDate) : new Date();
      const hour = now.getHours();
      if (hour >= 6 && hour < 12) {
        return "Bom dia,";
      } else if (hour >= 12 && hour < 18) {
        return "Boa tarde,";
      } else {
        return "Boa noite,";
      }
    }
    /* =======================================
       GENERIC MAIL SIGNATURE
    ======================================= */
    function getEmailSignature() {
      return `
        <div style="font-family: Arial, sans-serif; font-size: 12px; color: #2c5dab;">
          <div style="font-size: 14px; margin: 10px 0 8px 0;">
            Central de Telecomunicações - SALOC 0805
          </div>
          <div style="font-size: 13px; color: #2c5dab; margin-bottom: 8px;">
            CORPO DE BOMBEIROS DE FARO  - CRUZ LUSA
          </div>
          <div style="font-size: 11px; color: #2c5dab; line-height: 1.4; margin-bottom: 8px;">
            Rua Comandante Francisco Manuel, 7 a 13 | 8000-250 Faro | Portugal<br>
            Telem.: +351 919 568 277 | Telef.: +351 289 803 066
          </div>
          <div style="font-size: 10px; color: #2c5dab; font-style: italic; margin-bottom: 10px;">
            Antes de imprimir este e-mail pense bem se é mesmo necessário. Poupe eletricidade, toner e papel.
          </div>
          <div style="font-size: 10px; color: #444; border-top: 1px solid #ccc; padding-top: 8px; text-align: justify;">
            <strong>AVISO DE CONFIDENCIALIDADE</strong><br><br>
            Esta mensagem e quaisquer anexos podem conter informação confidencial para uso exclusivo do destinatário.
            Cabe ao destinatário assegurar a verificação de vírus e outras medidas que assegurem que esta mensagem
            não afeta os seus sistemas. Se não for o destinatário, não deverá usar, distribuir ou copiar este email,
            devendo proceder à sua eliminação e informar o emissor. É estritamente proibido o uso, a distribuição,
            a cópia ou qualquer forma de disseminação não autorizada deste email e dos seus anexos. Obrigado.
          </div>
        </div>
      `;
    }

async function getCommanderName(corpOperNr) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name&corp_oper_nr=eq.${corpOperNr}&patent=eq.Comandante`, {
            headers: getSupabaseHeaders()
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar o comandante");
        const data = await res.json();
        return data[0]?.abv_name || "Comandante";
      } catch (err) {
        console.error(err);
        return "Comandante";
      }
    }