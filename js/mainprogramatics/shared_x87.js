/* =======================================
    CONSTANTES
    ======================================= */
    /* ─── CONSTANTES PARTILHADAS (DECIR + FOMIO) ────────────── */
    const MONTH_NAMES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const MONTH_NAMES_UPPER = MONTH_NAMES_PT.map(m => m.toUpperCase());
    const DECIR_MONTH_NAMES = ["Maio","Junho","Julho","Agosto","Setembro","Outubro"];
    const BLOCKED_MONTHS_DEFAULT = [0,1,2,3,10,11];
    /* ─── CONSTANTES FOMIO (SCALES) ─────────────────────────── */
    const SCALES_TITLE_MAIN_STYLE = "text-align:center;margin-top:30px;background:#ffcccc;padding:8px;font-weight:bold;font-size:18px;";
    const SCALES_TITLE_SUB_STYLE = "text-align:center;margin-bottom:5px;margin-top:-15px;font-size:14px;background:#ffcccc;padding:6px;";
    const TITLE_MONTHYEAR_STYLE = "text-align:center;margin-bottom:-15px;font-size:14px;font-weight:bold;background:#ffffcc;padding:6px;";
    const COMMON_TH_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;width:35px;padding:2px;font-size:11px;text-align:center;background:#f0f0f0;";
    const COMMON_THTOTAL_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;padding:2px;text-align:center;font-size:10px;width:30px;";
    const COMMON_TD_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;padding:4px;text-align:center;font-size:13px;width:35px;";
    const COMMON_TDSPECIAL_STYLE = "font-weight:bold;font-size:15px;background:#2b284f;color:#cfcfcf;height:12px;line-height:12px;";
    const COMMON_TDTOTAL_STYLE = "border:1px solid #ccc;border-top:0;border-left:0;padding:4px;width:30px;text-align:center;font-weight:bold;";
    const COMMON_TDLABEL_STYLE = "border:1px solid #ccc;border-top:0;border-bottom:0;border-left:0;padding:4px;width:30px;text-align:center;font-weight:bold;";
    const TABLE_STYLE = "margin-top:10px;border-collapse:separate;border-spacing:0 5px;font-size:12px;text-align:center;margin-left:auto;margin-right:auto;";
    const TD_CODE_STYLE = "border:1px solid #ccc;font-weight:bold;padding:4px 6px;width:40px;white-space:nowrap;";
    const TD_DESC_STYLE = "border:1px solid #ccc;background:#fff;padding:4px 6px;width:110px;text-align:left;font-size:13px;white-space:nowrap;border-left:0;";
    const TD_SPACER_STYLE = "width:5px;";
    const MAX_COLS_PER_ROW = 30;
    const WEEKEND_COLOR = "#f9e0b0";
    const BLOCKED_MONTHS_DECIR = [0,1,2,3,10,11];
    const CELL_COLORS = {PD:{background:"#2fc41a",color:"#fff"}, PN:{background:"#add8e6",color:"#000"}, PT:{background:"#183b7a",color:"#fff"},
                         BX:{background:"#ed1111",color:"#fff"}, FO:{background:"#b3b3b3",color:"#000"}, FE:{background:"#995520",color:"#fff"},
                         FD:{background:"#519294",color:"#fff"}, FN:{background:"#4f1969",color:"#fff"}, ED:{background:"#b6fcb6",color:"#000"},
                         EN:{background:"#1e3a8a",color:"#fff"}, ET:{background:"#006400",color:"#fff"}, EP:{background:"#ff9800",color:"#000"},
                         N: {background:"#383838",color:"#fff"}};
    const CONFLICT_MESSAGES = {DECIR_TO_PIQUETE: "Elemento já escalado para serviço de Piquete, selecione apenas ED ou solicite ao Chefe de Secção a remoção do elemento do serviço de Piquete!",
                               PIQUETE_TO_DECIR: "Elemento já escalado para serviço de DECIR, selecione outro dia ou solicite ao responsável pela escala de DECIR a remoção do elemento do serviço de DECIR!"};
    const DECIR_LEGEND  = [{code:"ED",desc:"ECIN Dia"},{code:"EN",desc:"ECIN Noite"},{code:"ET",desc:"ECIN 24 Hrs."}];
    const ESCALA_LEGEND = [{code:"PD",desc:"Piquete Dia"},{code:"PN",desc:"Piquete Noite"},{code:"PT",desc:"Piquete 24 Hrs."},
                           {code:"BX",desc:"Baixa"},{code:"FE",desc:"Férias"},{code:"FO",desc:"Formação"},{code:"FD",desc:"Estágio Dia"},{code:"FN",desc:"Estágio Noite"}];
    const ECIN_EXTRA = [{code:"ED",desc:"ECIN Dia"},{code:"EN",desc:"ECIN Noite"},{code:"ET",desc:"ECIN 24 Hrs."},{code:"EP",desc:"ECIN D\\Piquete N"}];    
    /* ─── HELPERS PARTILHADOS ────────────────────────────────── */
    const $ = id => document.getElementById(id);
    const parseCurrency = txt => !txt ? 0 : parseFloat(txt.replace('€','').replace(/\s/g,'').replace(/\./g,'').replace(',','.')) || 0;
    const parseVal = id => parseFloat(($( id)?.value||"0").replace(",",".")) || 0;
    const formatCurrency = v => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
    const formatNumber = v => new Intl.NumberFormat('pt-PT',{minimumFractionDigits:0,maximumFractionDigits:0}).format(v);
    const getCorpId = () => sessionStorage.getItem('currentCorpOperNr') || "0805";
    async function supabaseFetch(path, opts = {}) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {headers: getSupabaseHeaders(), ...opts});
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      return res.json();
    }
    function atNoonLocal(y, mIndex, d) {
      return new Date(y, mIndex, d, 12, 0, 0, 0);
    }
    function addDays(baseDate, days) {
      const d = new Date(baseDate);
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + days);
      return d;
    }
    function getPortugalHolidays(year) {
      const fixed = [{month:1,day:1,name:"Ano Novo"},{month:4,day:25,name:"Dia da Liberdade"},{month:5,day:1,name:"Dia do Trabalhador"},
                     {month:6,day:10,name:"Dia de Portugal"},{month:8,day:15,name:"Assunção de Nossa Senhora"},{month:9,day:7,name:"Dia da Cidade de Faro"},
                     {month:10,day:5,name:"Implantação da República"},{month:11,day:1,name:"Todos os Santos"},{month:12,day:1,name:"Restauração da Independência"},
                     {month:12,day:8,name:"Imaculada Conceição"},{month:12,day:25,name:"Natal"}];
      const a=year%19, b=Math.floor(year/100), c=year%100, d=Math.floor(b/4), e=b%4;
      const f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30;
      const i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451);
      const month=Math.floor((h+l-7*m+114)/31), day=((h+l-7*m+114)%31)+1;
      const easter = atNoonLocal(year, month-1, day);
      const mobile = [{date:addDays(easter,-47),name:"Carnaval",optional:true},{date:addDays(easter,-2),name:"Sexta-feira Santa",optional:false},
                      {date:easter,name:"Páscoa",optional:false},{date:addDays(easter,60),name:"Corpo de Deus",optional:false}];
      return [...fixed.map(h => ({date:atNoonLocal(year,h.month-1,h.day),name:h.name,optional:false})), ...mobile];
    }    
    function decirMakeWrapper(container) {
      let wrapper = container.querySelector(".table-container");
      if (!wrapper) {wrapper = document.createElement("div"); wrapper.className = "table-container"; container.appendChild(wrapper);}
      wrapper.innerHTML = "";
      Object.assign(wrapper.style, {position:"relative", maxHeight:"75vh", height:"450px", overflowY:"auto"});
      return wrapper;
    }
    function makeTh(txt, cssExtra = "", style = {}) {
      const th = document.createElement("th");
      th.innerHTML = txt;
      th.style.cssText = COMMON_TH_STYLE + cssExtra;
      Object.assign(th.style, style);
      return th;
    }
    function makeTd(txt = "", cssExtra = "") {
      const td = document.createElement("td");
      td.textContent = txt;
      td.style.cssText = COMMON_TD_STYLE + cssExtra;
      return td;
    }
    function makeTitle(text, bg = "#3ac55b") {
      const h = document.createElement("h3");
      h.textContent = text;
      Object.assign(h.style, {textAlign: "center", margin: "20px 0 -15px 0", background: bg, height: "30px", borderRadius: "3px", lineHeight: "30px", padding: "0 8px"});
      return h;
    }
