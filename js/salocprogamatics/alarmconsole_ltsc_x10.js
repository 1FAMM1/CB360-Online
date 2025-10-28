    /* =======================================
                ALARM CONSOLE
    ======================================= */
    async function fetchRegElemsFromSupabase() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/reg_elems?select=abv_name,n_int,elem_state&elem_state=eq.true&order=n_int.asc`, {
            method: 'GET',
            headers: getSupabaseHeaders(),
          }
        );
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        return [];
      }
    }
    async function populateIndivSelect(select) {
      const elems = await fetchRegElemsFromSupabase();
      elems.sort((a, b) => (a.n_int || 9999) - (b.n_int || 9999));
      select.innerHTML = '<option value=""></option>';
      elems.forEach(elem => {
        const option = document.createElement('option');
        option.value = elem.abv_name;
        option.textContent = `${elem.n_int} - ${elem.abv_name}`;
        select.appendChild(option);
      });
    }
    const soundKeys = {'ca-indiv-pv': 'PV', 'ca-indiv-cc': 'CC', 'ca-indiv-sb': 'SB', 'ca-indiv-gch': 'GCH', 'ca-indiv-gcm': 'GCM',
                       'ca-glob-pv': 'PV', 'ca-glob-sb': 'SB', 'ca-glob-sn': 'SN', 'ca-glob-gch': 'GCH', 'ca-glob-gcm': 'GCM'};
    let selectedButton = null;
    let isPlaying = false;

    function setupButtonContainer(containerId, otherContainerIds = []) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.querySelectorAll('button').forEach(btn => {
        if (btn.id.includes('call')) return;
        btn.addEventListener('click', () => {
          if (isPlaying) {
            showPopupWarning("Aguarde até o som atual terminar!");
            return;
          }
          const wasActive = btn.classList.contains('active');
          container.querySelectorAll('button').forEach(b => {
            if (!b.id.includes('call')) b.classList.remove('active');
          });
          otherContainerIds.forEach(otherId => {
            const otherContainer = document.getElementById(otherId);
            if (otherContainer) {
              otherContainer.querySelectorAll('button').forEach(b => {
                if (!b.id.includes('call')) b.classList.remove('active');
              });
            }
          });
          if (!wasActive) {
            btn.classList.add('active');
            selectedButton = btn.id;
          } else {
            selectedButton = null;
          }
        });
      });
    }

    function disableAllControls(disabled) {
      document
        .querySelectorAll('#alarm-console-indiv button, #alarm-console-group button, #alarm-console-internal button')
        .forEach(btn => (btn.disabled = disabled));
      const selects = ['ca-indiv-catch', 'ca-group-catch'];
      selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = disabled;
      });
    }

    function playSelectedSound(selectId) {
      if (isPlaying) {
        showPopupWarning("Aguarde até o som atual terminar!");
        return;
      }
      const select = document.getElementById(selectId);
      if (!select) return;
      let selectedElement = select.value.trim();
      if (!selectedButton) return showPopupWarning("Selecione uma opção de chamada!");
      if (!selectedElement) return showPopupWarning("Selecione um elemento!");
      if (selectedElement.includes('-')) {
        selectedElement = selectedElement.split('-').slice(1).join('-').trim();
      }
      const soundKey = soundKeys[selectedButton];
      if (!soundKey) return showPopupWarning("Opção de chamada inválida!");
      const fileName = `${selectedElement}_${soundKey}.mp3`;
      const baseUrl = 'https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/sounds/Internal/';
      isPlaying = true;
      disableAllControls(true);
      fetch(`${baseUrl}${fileName}`, {
          method: 'HEAD'
        })
        .then(response => {
          if (!response.ok) {
            showPopupWarning(`Não é possível reproduzir os itens selecionados!`);
            throw new Error("Som não encontrado");
          }
          const audio1 = new Audio(`${baseUrl}init_call.mp3`);
          audio1.onerror = () => alert(`Ficheiro de som "init_call.mp3" não encontrado!`);
          audio1.play();
          audio1.onended = () => {
            const audio2 = new Audio(`${baseUrl}${fileName}`);
            audio2.play();
            audio2.onended = () => {
              const audio3 = new Audio(`${baseUrl}init_call.mp3`);
              audio3.play();
              audio3.onended = () => {
                document
                  .querySelectorAll('#alarm-console-indiv button, #alarm-console-group button, #alarm-console-internal button')
                  .forEach(btn => btn.classList.remove('active'));
                selectedButton = null;
                if (select) select.value = '';
                disableAllControls(false);
                isPlaying = false;
              };
            };
          };
        })
        .catch(() => {
          alert(`Erro ao verificar ficheiro "${fileName}"!`);
          disableAllControls(false);
          isPlaying = false;
        });
    }
    window.addEventListener('load', () => {
      const select = document.getElementById('ca-indiv-catch');
      if (select) populateIndivSelect(select);
      setupButtonContainer('alarm-console-indiv', ['alarm-console-group', 'alarm-console-internal']);
      setupButtonContainer('alarm-console-group', ['alarm-console-indiv', 'alarm-console-internal']);
      setupButtonContainer('alarm-console-internal', ['alarm-console-indiv', 'alarm-console-group']);
      const callIndivBtn = document.getElementById('ca-call-indiv');
      if (callIndivBtn) {
        callIndivBtn.addEventListener('click', () => playSelectedSound('ca-indiv-catch'));
      }
      const callGroupBtn = document.getElementById('ca-call-group');
      if (callGroupBtn) {
        callGroupBtn.addEventListener('click', () => playSelectedSound('ca-group-catch'));
      }
      const internalSoundKeys = {'ca-format': 'Formatura', 'ca-alvor': 'Alvorada'};
      document.querySelectorAll('#alarm-console-internal button').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = internalSoundKeys[btn.id];
          if (!key) return;
          if (isPlaying) {
            showPopupWarning("Aguarde até o som atual terminar!");
            return;
          }
          isPlaying = true;
          disableAllControls(true);
          const audio = new Audio(`https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/sounds/Internal/${key}.mp3`);
          audio.onerror = () => alert(`Ficheiro de som "${key}.mp3" não encontrado!`);
          audio.play();
          audio.onended = () => {
            disableAllControls(false);
            isPlaying = false;
          };
        });
      });
    });
