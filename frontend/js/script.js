
// ===============================
// 📦 ESTADO GLOBAL
// ===============================
let resultadosPorPlaca = {};
let arquivosPorResultado = {};

let placaAtual = null;
let resultadoAtualIndex = 0;

let eventoSelecionado = null;

let cacheDadosBrutos = {};

// ===============================
// 📊 GRÁFICOS
// ===============================
let resultadoGraf = null;
let chartGraf = null;
let chartPizza = null; // 🔥 NOVO

// ===============================
// 🧠 CACHE INTELIGENTE (NOVO)
// ===============================

// 🔥 guarda dados por placa sem reprocessar
let cacheResultadosProcessados = {};

// 🔥 cache de filtros (evita recalcular)
const cacheFiltros = new Map();

//====================================================================

// ==============================================
// 🆕 STATUS DAS PLACAS (APTO / NÃO APTO)
// ==============================================
let statusPlacas = {};
// 🔥 CARREGA STATUS SALVO (persistência)
const statusSalvo = localStorage.getItem("statusPlacas");
if (statusSalvo) {
  statusPlacas = JSON.parse(statusSalvo);
}

// ==============================================
// 🆕 DEFINIR STATUS (BOTÕES)
// ==============================================
function definirStatus(tipo) {

  if (!placaAtual) {
    alert("Selecione uma placa primeiro");
    return;
  }

  // salva status
  statusPlacas[placaAtual] = tipo;

  // 🔥 persistência
  localStorage.setItem("statusPlacas", JSON.stringify(statusPlacas));

  atualizarBotoesStatus();
  atualizarSelectPlacas();
  atualizarStatusTopo();
}

// ==============================================
// 🆕 ATUALIZA BOTÕES VISUALMENTE
// ==============================================
function atualizarBotoesStatus() {

  const btnApto = document.getElementById("btnApto");
  const btnNaoApto = document.getElementById("btnNaoApto");

  if (!btnApto || !btnNaoApto) return;

  btnApto.classList.remove("ativo");
  btnNaoApto.classList.remove("ativo");

  const status = statusPlacas[placaAtual];

  if (status === "APTO") btnApto.classList.add("ativo");
  if (status === "NAO_APTO") btnNaoApto.classList.add("ativo");

  atualizarStatusTopo();

}

function filtrarPorComunicacao(dados, tipo) {

  if (!tipo || tipo === "TODOS") return dados;

  return dados.filter(e =>
    e.comunicacao?.toUpperCase().includes(tipo.toUpperCase())
  );
}



//=============================================================

// ===============================
// 🛠️ FORMATADOR DE DATA
// ===============================
function formatarData(data) {
  if (!data) return "-";

  try {
    if (typeof data === "string" && data.includes("/")) return data;

    const d = new Date(data);

    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  } catch {
    return data;
  }
}


// ==============================================
// 🚀 ENVIO CSV (COM CONTROLE DE UI + BLOQUEIO)
// (APENAS DISPARA PROCESSAMENTO)
// ==============================================
async function enviar() {

  const input = document.getElementById("csvFile");


  // ===============================
  // 🔒 ELEMENTOS DE CONTROLE UI
  // ===============================
  const btn = document.getElementById("btnProcessar");
  const textoBtn = document.getElementById("textoBtn");
  const loader = document.getElementById("loader");
  const progresso = document.getElementById("progresso");

  // ===============================
  // ⚠️ VALIDAÇÃO DE ARQUIVOS
  // ===============================
  if (!input.files.length) {
    alert("Selecione ao menos um CSV");
    return;
  }

  const files = [...input.files];
  const comunicacao = (document.getElementById("filtroComunicacao").value || "").toUpperCase();

  try {

    // ===============================
    // 🔒 BLOQUEIA BOTÃO (ANTI-SPAM)
    // ===============================
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";

    // ===============================
    // 🔄 ATIVA LOADER
    // ===============================
    loader.style.display = "inline-block";
    textoBtn.textContent = "Processando...";

    // ===============================
    // 📊 INICIALIZA PROGRESSO
    // ===============================
    progresso.innerText = `Processando 0 / ${files.length}`;

    // ===============================
    // 🚀 CHAMA A ENGINE CENTRAL
    // ===============================
    await processarArquivos(
      files,
      comunicacao,
      true,   // limpa tudo no upload inicial
      null,
      3       // concorrência
    );

    // ===============================
    // ✅ FINALIZAÇÃO COM SUCESSO
    // ===============================
    textoBtn.textContent = "Processar CSV";

  } catch (erro) {

    // ===============================
    // ❌ TRATAMENTO DE ERRO
    // ===============================
    console.error("Erro no envio:", erro);
    textoBtn.textContent = "Erro";

  } finally {

    // ===============================
    // 🔓 LIBERA BOTÃO (SEMPRE EXECUTA)
    // ===============================
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";

    // ===============================
    // 🛑 DESATIVA LOADER
    // ===============================
    loader.style.display = "none";
  }
  atualizarStatusTopo();
}

// ===============================
// 🎯 FILTRO FRONTEND (GLOBAL FIX)
// ===============================
function aplicarFiltrosFrontend() {

  if (!placaAtual) return;

  cacheFiltros.clear();

  const comunicacao = (document.getElementById("filtroComunicacao").value || "").toUpperCase();
  const periodoIndex = document.getElementById("filtroPeriodo").value;

  const chaveCache = JSON.stringify({
    placa: placaAtual,
    comunicacao,
    periodoIndex
  });

  if (cacheFiltros.has(chaveCache)) {
    renderizar(cacheFiltros.get(chaveCache));
    return;
  }

  let dadosOriginais = cacheResultadosProcessados[placaAtual] || [];

  let dados = [...dadosOriginais];

  // ===============================
  // 🔥 FILTRO COMUNICAÇÃO (ROBUSTO)
  // ===============================
  if (comunicacao) {

    dados = dados.map(d => {

      // filtra eventos dentro do resultado
      const eventosFiltrados = d.eventos.filter(e =>
        (e.comunicacao || "").toUpperCase().includes(comunicacao)
      );

      return {
        ...d,
        eventos: eventosFiltrados
      };

    }).filter(d => d.eventos.length > 0); // remove resultados vazios

    // 🚨 fallback inteligente (não quebra UI)
    if (!dados.length) {
      console.warn("⚠️ Nenhum dado com esse filtro de comunicação");
      dados = [];
    }
  }

  // ===============================
  // 📅 FILTRO PERÍODO
  // ===============================
  if (periodoIndex !== "" && dados[periodoIndex]) {
    dados = [dados[periodoIndex]];
  } else if (periodoIndex !== "") {
    console.warn("⚠️ Índice de período inválido após filtro");
    dados = [];
  }

  // ===============================
  // 🚨 PROTEÇÃO CONTRA VAZIO
  // ===============================
  if (!dados.length) {
    renderizar({
      placa: placaAtual,
      total: 0,
      eventos: [],
      dataInicio: null,
      dataFim: null,
      nomeArquivo: "-",
      intervaloTransmissao: "-"
    });
    return;
  }

  const resultado = agruparEventos(dados);

  cacheFiltros.set(chaveCache, resultado);

  renderizar(resultado);
}

function normalizarComunicacao(valor) {
  return (valor || "")
    .toString()
    .trim()
    .toUpperCase();
}

function agruparEventos(lista) {

  let total = 0;
  const contagem = {};

  let placa = placaAtual;
  let dataInicio = null;
  let dataFim = null;
  let nomeArquivo = "-";
  let intervalo = "-";

  lista.forEach(d => {

    nomeArquivo = d.nomeArquivo || nomeArquivo;
    intervalo = d.intervaloTransmissao || intervalo;

    if (!dataInicio || d.dataInicio < dataInicio) dataInicio = d.dataInicio;
    if (!dataFim || d.dataFim > dataFim) dataFim = d.dataFim;

    d.eventos.forEach(e => {

      if (!contagem[e.nome]) {
        contagem[e.nome] = {
          qtd: 0,
          comunicacao: e.comunicacao
        };
      }

      contagem[e.nome].qtd += e.qtd;
      total += e.qtd;
    });

  });

  const eventos = Object.entries(contagem).map(([nome, info]) => ({
    nome,
    qtd: info.qtd,
    percentual: total ? (info.qtd / total) * 100 : 0,
    comunicacao: info.comunicacao // 🔥 ESSENCIAL
  }));

  eventos.sort((a, b) => b.qtd - a.qtd);

  return {
    placa,
    total,
    eventos,
    dataInicio,
    dataFim,
    nomeArquivo,
    intervaloTransmissao: intervalo
  };
}

// ===============================
// 🌐 API UPLOAD (PADRÃO)
// ===============================
async function apiUpload(url, formData) {

  const response = await fetchWithAuthRetry(API_BASE + url, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {

    const status = response.status;
    const text = await response.text();

    // console.error("Erro API:", status, text);

    if (status === 401) {
      throw new Error("NAO_AUTENTICADO");
    }

    if (status === 403) {
      throw new Error("SEM_PERMISSAO");
    }

    throw new Error(`ERRO_API_${status}`);
  }

  return response.json();
}

// ===============================
// ⚙️ ENGINE DE PROCESSAMENTO (ÚNICA)
// ===============================
async function processarArquivos(
  listaArquivos,
  comunicacao,
  limparTudo = false,
  placaFiltro = null,
  concorrencia = 3
) {

  if (!listaArquivos.length) {
    console.warn("Nenhum arquivo para processar");
    return;
  }

  // ===============================
  // 🧹 CONTROLE DE LIMPEZA
  // ===============================
  if (limparTudo) {
    resultadosPorPlaca = {};
    placaAtual = null;
  } else if (placaFiltro) {
    resultadosPorPlaca[placaFiltro] = [];
  }

  resultadoAtualIndex = 0;
  eventoSelecionado = null;

  let index = 0;
  let processados = 0;


  // ===============================
  // ⚙️ WORKER (NÃO REMOVER)
  // ===============================
  async function worker() {

    while (true) {
      let currentIndex;

      // 🔒 lock simples
      if (index >= listaArquivos.length) break;
      currentIndex = index++;

      const file = listaArquivos[currentIndex];

      try {

        const formData = new FormData();
        formData.append("file", file);
        formData.append("comunicacao", comunicacao);

        const data = await apiUpload("/api/excedente/processar", formData);

        // ✅ ATUALIZA PROGRESSO
        processados++;
        atualizarProgresso(processados, listaArquivos.length);

        data.comunicacao = normalizarComunicacao(data.comunicacao);
        // console.log("API RETORNO:", data);

        if (!data || !data.placa) {
          console.warn("Resposta inválida da API:", data);
          continue;
        }

        if (!cacheResultadosProcessados[data.placa]) {
          cacheResultadosProcessados[data.placa] = [];
        }

        cacheResultadosProcessados[data.placa].push(data);


        // console.log("CACHE:", cacheResultadosProcessados);

        // 🔥 mantém compatibilidade com sistema atual
        if (!resultadosPorPlaca[data.placa]) {
          resultadosPorPlaca[data.placa] = [];
        }

        data._id = `${data.placa}_${data.nomeArquivo}_${data.dataInicio}`;

        resultadosPorPlaca[data.placa].push(data);

        arquivosPorResultado[data._id] = file;

        if (!placaAtual) {
          placaAtual = data.placa;
        }

      } catch (err) {

        if (err.message === "NAO_AUTENTICADO") {
          alert("Sessão expirada. Faça login novamente.");
          localStorage.clear();
          window.location.href = "login.html";
          return;
        }

        if (err.message === "SEM_PERMISSAO") {
          alert("Você não tem permissão para essa ação.");
          return;
        }

        console.error("Erro ao processar:", err);
      }
    }
  }


  // ===============================
  // 🚀 CONTROLE DE CONCORRÊNCIA
  // ===============================
  const workers = Array.from({ length: concorrencia }, worker);
  await Promise.all(workers);

  // ===============================
  // 🔄 ATUALIZA UI
  // ===============================
  atualizarSelectPlacas();

  if (placaAtual) {
    document.getElementById("filtroPlaca").value = placaAtual;
    trocarPlaca(); // 🔥 força fluxo completo
    atualizarBotoesStatus(); // 🔥 IMPORTANTE
    carregarPeriodos();
  }

  if (placaAtual) {
    document.getElementById("filtroPlaca").value = placaAtual;

    atualizarBotoesStatus();
    carregarPeriodos();

    // 🔥 GARANTE que existe dado antes de renderizar
    if (cacheResultadosProcessados[placaAtual]?.length) {
      aplicarFiltrosFrontend();
    } else {
      console.warn("⚠️ Nenhum dado encontrado para a placa:", placaAtual);
    }
  }
}

// ===============================
// 🔄 FILTROS AGORA SÃO FRONTEND
// ===============================
document.getElementById("filtroComunicacao")
  .addEventListener("change", () => {
    cacheFiltros.clear();
    aplicarFiltrosFrontend();
  });

document.getElementById("filtroPeriodo")
  .addEventListener("change", aplicarFiltrosFrontend);

// ===============================
// 🔥 PROCESSAR TODOS (BOTÃO)
// ===============================
async function processarTodos() {

  const comunicacao = (document.getElementById("filtroComunicacao").value || "").toUpperCase();
  const arquivos = Object.values(arquivosPorResultado);

  if (!arquivos.length) {
    console.warn("Nenhum arquivo para processar");
    return;
  }

  await processarArquivos(
    arquivos,
    comunicacao,
    true,
    null,
    3
  );
}


// ===============================
// 📂 NOME DOS ARQUIVOS
// ===============================
document.getElementById("csvFile").addEventListener("change", function () {
  document.getElementById("nomeArquivos").innerText =
    [...this.files].map(f => f.name).join(", ");
});


// ===============================
// 🚗 SELECT PLACA (ATUALIZADO)
// ===============================
function atualizarSelectPlacas() {

  const select = document.getElementById("filtroPlaca");

  select.innerHTML = `<option value="">Selecione a placa</option>`;

  Object.keys(resultadosPorPlaca).forEach(placa => {

    let status = statusPlacas[placa];
    let label = placa;

    if (status === "APTO") {
      label += " (Apto a Desconto)";
    }

    if (status === "NAO_APTO") {
      label += " (Não Apto a Desconto)";
    }

    select.innerHTML += `<option value="${placa}">${label}</option>`;
  });
}

// ===============================
// 🔁 TROCAR PLACA
// ===============================
function trocarPlaca() {

  placaAtual = document.getElementById("filtroPlaca").value;

  if (!placaAtual) return;

  atualizarBotoesStatus();
  carregarPeriodos();
  atualizarStatusTopo();

  // 🔥 NOVO: aplica filtro automaticamente
  aplicarFiltrosFrontend();
}

// ===============================
// 📅 PERÍODOS
// ===============================
function carregarPeriodos() {

  const select = document.getElementById("filtroPeriodo");
  select.innerHTML = `<option value="">Todos os períodos</option>`;

  const comunicacao = (document.getElementById("filtroComunicacao").value || "").toUpperCase();

  let lista = cacheResultadosProcessados[placaAtual] || [];

  if (comunicacao) {
    lista = lista.filter(d => {
      const com = (d.comunicacao || "").toUpperCase().trim();
      return com.includes(comunicacao);
    });
  }
  if (!lista?.length) return;

  lista.forEach((r, i) => {
    select.innerHTML += `
      <option value="${i}">
        ${formatarData(r.dataInicio)} até ${formatarData(r.dataFim)}
        (${r.nomeArquivo})
      </option>
    `;
  });

  // 🔥 NÃO renderiza direto — usa filtro
  aplicarFiltrosFrontend();
  // 🔥 CORRETO (case sensitive)
  if (typeof atualizarStatusTopo === "function") {
    atualizarStatusTopo();
  }
}

// ===============================
// 🎯 RENDER
// ===============================
function renderizar(d) {

  // console.log("resultado final:", d);
  if (!d || !Array.isArray(d.eventos)) {
    console.warn("Dados inválidos para renderização");
    return;
  }

  resultadoGraf = d;

  // ===============================
  // 🧾 CARDS
  // ===============================
  document.getElementById("placa").innerText = d.placa;
  animarNumero(document.getElementById("total"), d.total);
  document.getElementById("intervalo").innerText = d.intervaloTransmissao || "-";

  const eventosOrdenados = [...d.eventos].sort((a, b) => b.qtd - a.qtd);

  document.getElementById("principal").innerText =
    eventosOrdenados[0]?.nome ?? "-";

  document.getElementById("periodo").innerText =
    `${formatarData(d.dataInicio)} até ${formatarData(d.dataFim)}`;

  document.getElementById("arquivo").innerText =
    d.nomeArquivo ?? "-";


  // ===============================
  // 📊 TABELA
  // ===============================
  const tbody = document.getElementById("tabelaDados");
  tbody.innerHTML = "";

  eventosOrdenados.forEach((e, i) => {

    // ===============================
    // 🎯 CONTROLE DE LINHA ATIVA
    // ===============================
    const ativo = e.nome === eventoSelecionado;

    // ===============================
    // 🏆 RANKING TOP 3 EVENTOS
    // ===============================
    let ranking = "";

    if (i === 0) ranking = "🥇";       // 1º lugar
    else if (i === 1) ranking = "🥈";  // 2º lugar
    else if (i === 2) ranking = "🥉";  // 3º lugar

    // ===============================
    // 🧾 RENDERIZAÇÃO DA LINHA
    // ===============================
    tbody.innerHTML += `
    <tr class="
        ${ativo ? "linha-ativa" : ""} 
        ${i === 0 ? "top1 destaque-maximo" : ""}
        ${i < 3 ? "top3" : ""}
      "
      onclick="filtrarEventoGraf('${e.nome.replace(/'/g, "\\'")}')">

      <!-- ===============================
           🏆 EVENTO + RANKING
      =============================== -->
      <td>
        ${ranking ? `<span class="ranking">${ranking}</span>` : ""}
        ${e.nome}
      </td>

      <!-- ===============================
           🔢 QUANTIDADE
      =============================== -->
      <td>${e.qtd}</td>

      <!-- ===============================
           📊 BARRA VISUAL DE PERCENTUAL
      =============================== -->
      <td>
        <div class="barra-container">
          
          <div class="barra">
            <div style="width:${e.percentual}%"></div>
          </div>

          <span class="percentual-texto">
            ${e.percentual.toFixed(2)}%
          </span>

        </div>
      </td>

    </tr>
  `;
  });


  // ===============================
  // 📈 GRÁFICO (ULTRA EVOLUÍDO)
  // ===============================
  const wrapper = document.getElementById("graficoWrapper");

  // ===============================
  // 🎯 FILTRA EVENTOS PARA GRÁFICO
  // ===============================
  const eventosGraf = eventoSelecionado
    ? eventosOrdenados.filter(e => e.nome === eventoSelecionado)
    : eventosOrdenados.slice(0, 15);

  // ===============================
  // 🚨 SEM DADOS → ESCONDE COM ANIMAÇÃO
  // ===============================
  if (!eventosGraf.length) {
    wrapper.classList.remove("ativo");

    setTimeout(() => {
      wrapper.classList.add("ativo");
    }, 50);

    return;
  }

  // ===============================
  // 🎬 ATIVA ANIMAÇÃO DO CONTAINER
  // ===============================
  wrapper.classList.add("ativo");

  // ===============================
  // 📊 GRÁFICO DE BARRA (MORPH REAL)
  // ===============================
  const ctx = document.getElementById("grafico");

  // =======================================
  // 🧠 CONTROLE DE HOVER (ANTI FLICKER)
  // =======================================
  if (!ctx.__hoverBound) {

    ctx.addEventListener("mouseenter", () => {
      if (window.__glowControl) {
        window.__glowControl.ativo = false;
      }
    });

    ctx.addEventListener("mouseleave", () => {
      if (window.__glowControl) {
        window.__glowControl.ativo = true;
      }
    });

    // 🔥 evita duplicar eventos a cada render
    ctx.__hoverBound = true;
  }


  // ===============================
  // 🔁 MORPH REAL (SEM DESTROY)
  // ===============================
  if (chartGraf) {

    // ===============================
    // 🔄 ATUALIZA DADOS (TRANSIÇÃO SUAVE)
    // ===============================
    chartGraf.data.labels = eventosGraf.map(e => e.nome);
    chartGraf.data.datasets[0].data = eventosGraf.map(e => e.qtd);

    chartGraf.options.plugins.title.text =
      eventoSelecionado || "Top 15 Eventos";

    chartGraf.update(); // 🔥 anima automaticamente

  } else {

    // ===============================
    // 🚀 CRIA GRÁFICO APENAS 1 VEZ
    // ===============================
    chartGraf = new Chart(ctx, {
      type: "bar",
      data: {
        labels: eventosGraf.map(e => e.nome),
        datasets: [{
          data: eventosGraf.map(e => e.qtd),

          // 🔥 cor inicial (será animada pelo glow)
          backgroundColor: "rgba(0,229,255,0.3)",
          borderColor: "#00e5ff",
          borderWidth: 1,
          borderRadius: 6,
          hoverBorderWidth: 2,
          hoverBorderColor: "#00e5ff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,

        // ===============================
        // 🎬 ANIMAÇÃO DE ENTRADA
        // ===============================
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
          delay: (ctx) => ctx.dataIndex * 60
        },

        scales: {
          x: {
            ticks: {
              color: "#aaa",
              maxRotation: 45,
              minRotation: 30
            },
            grid: { display: false }
          },
          y: {
            ticks: { color: "#aaa" },
            grid: { color: "rgba(255,255,255,0.05)" }
          }
        },

        plugins: {
          legend: { display: false },

          title: {
            display: true,
            text: eventoSelecionado || "Top 15 Eventos",
            color: "#00e5ff",
            font: { size: 14 }
          },

          tooltip: {
            backgroundColor: "#111",
            borderColor: "#00e5ff",
            borderWidth: 1,
            titleColor: "#00e5ff",
            bodyColor: "#fff"
          }
        }
      }
    });
  }

  // ===============================
  // 🥧 GRÁFICO DE PIZZA (COM MORPH)
  // ===============================
  const ctxPizza = document.getElementById("graficoPizza");

  const eventosPizza = eventosGraf.slice(0, 12);

  // ===============================
  // 🔁 MORPH PIZZA
  // ===============================
  if (chartPizza) {

    chartPizza.data.labels = eventosPizza.map(e => e.nome);
    chartPizza.data.datasets[0].data = eventosPizza.map(e => e.qtd);

    chartPizza.update();

  } else {

    chartPizza = new Chart(ctxPizza, {
      type: "doughnut",
      data: {
        labels: eventosPizza.map(e => e.nome),
        datasets: [{
          data: eventosPizza.map(e => e.qtd),

          backgroundColor: eventosPizza.map((_, i) =>
            `rgba(0,229,255,${0.3 + i * 0.08})`
          ),

          borderColor: "#00e5ff",
          borderWidth: 1,
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "70%",

        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200,
          easing: "easeOutExpo"
        },

        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#aaa",
              font: { size: 10 },
              padding: 10
            }
          },

          title: {
            display: true,
            text: "Distribuição (%)",
            color: "#00e5ff",
            font: { size: 13 }
          },

          tooltip: {
            backgroundColor: "#111",
            borderColor: "#00e5ff",
            borderWidth: 1
          }
        }
      }
    });
  }
}

function filtrarEventoGraf(nomeEvento) {

  // 🔁 alterna seleção (toggle)
  if (eventoSelecionado === nomeEvento) {
    eventoSelecionado = null;
  } else {
    eventoSelecionado = nomeEvento;
  }

  // 🔄 re-renderiza tudo
  aplicarFiltrosFrontend();
}


// =================================
// CONTADOR ANIMADO (KPIs)
// =================================
function animarNumero(elemento, valorFinal, duracao = 800) {

  let inicio = 0;
  const incremento = valorFinal / (duracao / 16);

  function atualizar() {
    inicio += incremento;

    if (inicio >= valorFinal) {
      elemento.innerText = valorFinal;
      return;
    }

    elemento.innerText = Math.floor(inicio);
    requestAnimationFrame(atualizar);
  }

  atualizar();
}



// ==========================================
// 🔄 REFRESH TOKEN (PADRÃO HEADER)
// ==========================================
async function refreshToken() {

  const refresh = localStorage.getItem("refreshToken");

  if (!refresh) throw new Error("SEM_REFRESH");

  const response = await fetch(API_BASE + "/auth/refresh", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + refresh
    }
  });

  if (!response.ok) {
    throw new Error("REFRESH_INVALIDO");
  }

  const data = await response.json();

  // 🔥 ATUALIZA AMBOS OS TOKENS
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);

  return data.token;
}

// ==========================================
// 🔁 FETCH COM RETRY + REFRESH AUTOMÁTICO
// ==========================================
async function fetchWithAuthRetry(url, options = {}, isRetry = false) {

  const token = localStorage.getItem("token");


  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": "Bearer " + token
    }
  });

  // ==========================================
  // 🔐 TOKEN EXPIRADO → TENTA REFRESH
  // ==========================================
  if ((response.status === 401 || response.status === 403) && !isRetry) {

    try {

      console.warn("🔄 Token expirado, tentando refresh...");

      await refreshToken();

      // 🔁 refaz a requisição já com token novo
      return fetchWithAuthRetry(url, options, true);

    } catch (err) {

      console.error("❌ Falha no refresh");

      localStorage.clear();
      window.location.href = "login.html";

      throw err;
    }
  }

  return response;
}



// =====================================================
// 🎨 CONFIGURAÇÃO GLOBAL DE ESTILO (TEMA DARK POWER BI)
// =====================================================
const ESTILO = {
  header: {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2D2D44" } },
    alignment: { horizontal: "center", vertical: "center" }
  },
  texto: {
    font: { color: { rgb: "FFFFFF" } }
  },
  fundo: {
    fill: { fgColor: { rgb: "1E1E2F" } }
  }
};

// =====================================================
// 🎨 APLICA TEMA DARK EM TODA A ABA
// =====================================================
function aplicarTemaDark(ws) {

  if (!ws["!ref"]) return;

  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {

      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[cellRef]) continue;

      ws[cellRef].s = {
        ...ESTILO.texto,
        ...ESTILO.fundo
      };
    }
  }
}

// =====================================================
// 📌 GRID PADRÃO (ALINHAMENTO PERFEITO)
// =====================================================
function aplicarGrid(ws) {

  if (!ws["!ref"]) return;

  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {

      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[cellRef]) continue;

      ws[cellRef].s = {
        ...ws[cellRef].s,
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  }
}

// =====================================================
// 📈 RANKING COM CORES DINÂMICAS (HEATMAP)
// =====================================================
function aplicarRankingCores(ws, colIndex, startRow, endRow) {

  const valores = [];

  for (let R = startRow; R <= endRow; R++) {
    const cell = ws[XLSX.utils.encode_cell({ r: R, c: colIndex })];
    if (cell && typeof cell.v === "number") valores.push(cell.v);
  }

  const max = Math.max(...valores);
  const min = Math.min(...valores);

  for (let R = startRow; R <= endRow; R++) {

    const cellRef = XLSX.utils.encode_cell({ r: R, c: colIndex });
    const cell = ws[cellRef];

    if (!cell || typeof cell.v !== "number") continue;

    const ratio = (cell.v - min) / (max - min || 1);

    let color;
    if (ratio > 0.7) color = "00C853";      // verde
    else if (ratio > 0.4) color = "FFAB00"; // amarelo
    else color = "FF5252";                  // vermelho

    cell.s = {
      ...cell.s,
      fill: { fgColor: { rgb: color } },
      font: { bold: true, color: { rgb: "FFFFFF" } }
    };
  }
}
// ===================
// BARRA DE PROGRESSO
// ===================
function aplicarBarraProgresso(ws, colIndex, startRow, endRow) {

  for (let R = startRow; R <= endRow; R++) {

    const cellRef = XLSX.utils.encode_cell({ r: R, c: colIndex });
    const cell = ws[cellRef];

    if (!cell || typeof cell.v !== "number") continue;

    const valor = cell.v;

    // 🔥 MAIS SUAVE (antes 10)
    const totalBlocos = 8;

    const preenchido = Math.round(valor * totalBlocos);

    const barra =
      "█".repeat(preenchido) +
      "░".repeat(totalBlocos - preenchido);

    let color;
    if (valor > 0.7) color = "00C853";
    else if (valor > 0.4) color = "FFAB00";
    else color = "FF5252";

    // 🔥 TEXTO MAIS CURTO
    cell.v = `${barra} ${(valor * 100).toFixed(1)}%`;

    cell.s = {
      ...cell.s,
      font: { color: { rgb: color }, bold: true },
      alignment: { horizontal: "left" }
    };
  }
}

// =====================================================
// 📤 EXPORTAÇÃO EXCEL
// =====================================================
function exportarExcel() {

  if (!Object.keys(resultadosPorPlaca).length) {
    alert("Nenhum dado para exportar");
    return;
  }

  const wb = XLSX.utils.book_new();

  gerarAbaResumo(wb);
  gerarAbaDados(wb);
  gerarAbaTopEventos(wb);

  XLSX.writeFile(wb, "relatorio_power_bi.xlsx");
}

// =====================================================
// 📊 ABA DASHBOARD (PRINCIPAL)
// =====================================================
function gerarAbaResumo(wb) {

  const ws = XLSX.utils.aoa_to_sheet([]);

  // =========================
  // 🎯 TÍTULO
  // =========================
  XLSX.utils.sheet_add_aoa(ws, [["DASHBOARD DE EXCEDENTE"]], { origin: "A1" });

  ws["A1"].s = {
    font: { sz: 18, bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1E1E2F" } },
    alignment: { horizontal: "center" }
  };

  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

  // =========================
  // 📊 KPI
  // =========================
  const totalPlacas = Object.keys(resultadosPorPlaca).length;

  let totalEventos = 0;
  Object.values(resultadosPorPlaca).forEach(arr => {
    arr.forEach(d => totalEventos += d.total);
  });

  XLSX.utils.sheet_add_aoa(ws, [
    ["TOTAL PLACAS", totalPlacas, "", "TOTAL EVENTOS", totalEventos]
  ], { origin: "A3" });

  // =========================
  // 📦 TABELA
  // =========================
  const dadosResumo = [
    ["PLACA", "TOTAL", "INTERVALO", "STATUS", "EVENTO PRINCIPAL", "%"]
  ];

  Object.keys(resultadosPorPlaca).forEach(placa => {

    const d = resultadosPorPlaca[placa][0];

    const eventosOrdenados = [...d.eventos]
      .sort((a, b) => b.qtd - a.qtd);

    const principal = eventosOrdenados[0]?.nome || "-";
    const percentual = eventosOrdenados[0]?.percentual || 0;

    const status = statusPlacas[placa] || "NAO DEFINIDO";

    dadosResumo.push([
      placa,
      d.total,
      d.intervaloTransmissao,
      status,
      principal,
      percentual / 100
    ]);
  });

  XLSX.utils.sheet_add_aoa(ws, dadosResumo, { origin: "A6" });

  // =========================
  // 🎨 HEADER
  // =========================
  for (let C = 0; C <= 5; C++) {
    const cell = XLSX.utils.encode_cell({ r: 5, c: C });
    if (ws[cell]) ws[cell].s = ESTILO.header;
  }

  // =========================
  // 📏 COLUNAS
  // =========================
  ws["!cols"] = [
    { wch: 15 }, { wch: 12 }, { wch: 18 },
    { wch: 18 }, { wch: 30 }, { wch: 28 }
  ];

  // =========================
  // 🔍 FILTRO
  // =========================
  ws["!autofilter"] = { ref: `A6:F${dadosResumo.length + 5}` };

  // =========================
  // 🎨 APLICAÇÕES VISUAIS
  // =========================
  aplicarTemaDark(ws);
  aplicarGrid(ws);

  // 📈 ranking
  aplicarRankingCores(ws, 1, 6, dadosResumo.length + 5); // TOTAL
  aplicarBarraProgresso(ws, 5, 6, dadosResumo.length + 5); // %

  XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
}

// =====================================================
// 📦 ABA BASE DE DADOS
// =====================================================
function gerarAbaDados(wb) {

  const ws = XLSX.utils.aoa_to_sheet([]);

  const dados = [
    ["PLACA", "EVENTO", "QTD", "%", "DATA INICIO", "DATA FIM"]
  ];

  // =========================
  // 📥 MONTA DADOS
  // =========================
  Object.keys(resultadosPorPlaca).forEach(placa => {

    resultadosPorPlaca[placa].forEach(d => {

      d.eventos.forEach(e => {
        dados.push([
          placa,
          e.nome,
          e.qtd,
          e.percentual / 100, // ✔ mantém número (não texto)
          d.dataInicio,
          d.dataFim
        ]);
      });

    });

  });

  XLSX.utils.sheet_add_aoa(ws, dados, { origin: "A1" });

  // =========================
  // 🎨 HEADER
  // =========================
  for (let C = 0; C <= 5; C++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cell]) ws[cell].s = ESTILO.header;
  }

  // =========================
  // 🎯 FORMATA % CORRETAMENTE
  // =========================
  for (let R = 1; R < dados.length; R++) {

    const cellRef = XLSX.utils.encode_cell({ r: R, c: 3 }); // coluna %

    if (ws[cellRef]) {
      ws[cellRef].s = {
        ...ws[cellRef].s,
        numFmt: "0.0%" // 🔥 transforma 0.49 em 49.0%
      };
    }
  }

  // =========================
  // 📏 COLUNAS (AJUSTADAS)
  // =========================
  ws["!cols"] = [
    { wch: 15 }, // PLACA
    { wch: 35 }, // EVENTO
    { wch: 10 }, // QTD
    { wch: 12 }, // % (ajustado - sem barra aqui)
    { wch: 20 }, // DATA INICIO
    { wch: 20 }  // DATA FIM
  ];

  // =========================
  // 🔍 FILTRO
  // =========================
  ws["!autofilter"] = { ref: `A1:F${dados.length}` };

  // =========================
  // 🎨 APLICA TEMA (DEPOIS DO numFmt)
  // =========================
  aplicarTemaDark(ws);
  aplicarGrid(ws);

  // =========================
  // 📎 ADICIONA ABA
  // =========================
  XLSX.utils.book_append_sheet(wb, ws, "Base_Dados");
}


// =====================================================
// 📈 ABA TOP EVENTOS (RANKING)
// =====================================================
function gerarAbaTopEventos(wb) {

  const ws = XLSX.utils.aoa_to_sheet([]);

  const dados = [
    ["PLACA", "EVENTO", "QTD", "%"]
  ];

  Object.keys(resultadosPorPlaca).forEach(placa => {

    const d = resultadosPorPlaca[placa][0];

    const topEventos = [...d.eventos]
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 6);

    topEventos.forEach(e => {
      dados.push([
        placa,
        e.nome,
        e.qtd,
        e.percentual / 100
      ]);
    });

  });

  XLSX.utils.sheet_add_aoa(ws, dados, { origin: "A1" });

  // header
  for (let C = 0; C <= 3; C++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cell]) ws[cell].s = ESTILO.header;
  }

  ws["!cols"] = [
    { wch: 15 }, { wch: 35 },
    { wch: 10 }, { wch: 28 }
  ];

  ws["!autofilter"] = { ref: `A1:D${dados.length}` };

  aplicarTemaDark(ws);
  aplicarGrid(ws);

  // 📈 ranking visual
  aplicarRankingCores(ws, 2, 1, dados.length - 1); // QTD
  aplicarBarraProgresso(ws, 3, 1, dados.length - 1); // %

  XLSX.utils.book_append_sheet(wb, ws, "Top_Eventos");
}



// ========================
// EXPORTAR PDF (CHAMADA)
// ========================
function exportarPDF() {
  if (placaAtual) {
    exportarPDFDetalhado(); // 1 placa
  } else {
    exportarPDFGeral(); // todas
  }
}

// =============================
// PDF GERAL (TODAS AS PLACAS)
// =============================
function exportarPDFGeral() {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let y = 30;          // posição vertical global
  let pagina = 1;      // controle de página

  adicionarCabecalho(pdf, "RELATORIO GERAL DE EXCEDENTE");

  // ===============================
  // 🔁 LOOP POR PLACA
  // ===============================
  Object.keys(resultadosPorPlaca).forEach(placa => {

    const lista = resultadosPorPlaca[placa];

    lista.forEach(d => {

      // ===============================
      // 📊 ORDENAÇÃO + TOP 6 EVENTOS
      // ===============================
      const eventosOrdenados = [...d.eventos]
        .sort((a, b) => b.qtd - a.qtd);

      const topEventos = eventosOrdenados.slice(0, 6);

      const principal = eventosOrdenados[0]?.nome || "-";
      const percentualPrincipal =
        eventosOrdenados[0]?.percentual?.toFixed(2) || "0";

      const status = statusPlacas[placa];

      // ===============================
      // 📏 CONFIGURAÇÃO PARA 2 POR PÁGINA
      // ===============================
      const alturaCaixa = 110;  // 🔥 altura ideal para caber 2 blocos
      const espacamento = 10;   // 🔥 espaço entre blocos

      // ===============================
      // 🚨 QUEBRA DE PÁGINA INTELIGENTE (ANTES)
      // ===============================
      if (y + alturaCaixa + espacamento > 280) {
        adicionarRodape(pdf, pagina++);
        pdf.addPage();
        adicionarCabecalho(pdf, "RELATORIO GERAL DE EXCEDENTE");
        y = 30;
      }

      // ===============================
      // 📍 POSIÇÃO INICIAL DO BLOCO
      // ===============================
      const inicioBloco = y;

      // ===============================
      // 📦 CONTAINER PRINCIPAL (DASHBOARD)
      // ===============================
      pdf.setFillColor(10, 15, 30);
      pdf.roundedRect(8, inicioBloco - 8, 194, alturaCaixa, 3, 3, "F");

      let yInterno = inicioBloco;

      // ===============================
      // 🔷 PLACA
      // ===============================
      pdf.setTextColor(0, 229, 255);
      pdf.setFontSize(10);
      pdf.text(`PLACA: ${placa}`, 10, yInterno);

      yInterno += 7;

      // ===============================
      // 🎨 CARDS RESUMO (COMPACTO)
      // ===============================
      desenharCardsResumo(pdf, d, status, yInterno);

      yInterno += 25; // 🔥 reduzido

      // ===============================
      // 🎯 CARD EVENTO PRINCIPAL
      // ===============================
      pdf.setFillColor(20, 25, 40);
      pdf.roundedRect(10, yInterno - 3, 90, 14, 2, 2, "F");

      pdf.setTextColor(180);
      pdf.setFontSize(7);
      pdf.text("EVENTO PRINCIPAL", 12, yInterno);

      pdf.setTextColor(255);
      pdf.setFontSize(8);

      const nomeQuebrado = pdf.splitTextToSize(principal, 75);
      pdf.text(nomeQuebrado, 12, yInterno + 4);

      pdf.setTextColor(0, 229, 255);
      pdf.text(`${percentualPrincipal}%`, 75, yInterno + 10);

      // ===============================
      // 📅 CARD PERÍODO / ARQUIVO
      // ===============================
      pdf.setFillColor(20, 25, 40);
      pdf.roundedRect(105, yInterno - 3, 97, 14, 2, 2, "F");

      pdf.setTextColor(180);
      pdf.setFontSize(7);
      pdf.text("PERIODO / ARQUIVO", 107, yInterno);

      pdf.setTextColor(255);
      pdf.setFontSize(7);

      const periodoTexto =
        `${formatarData(d.dataInicio)} até ${formatarData(d.dataFim)}`;

      const periodoQuebrado = pdf.splitTextToSize(periodoTexto, 90);
      pdf.text(periodoQuebrado, 107, yInterno + 4);

      pdf.setTextColor(150);
      pdf.text(d.nomeArquivo || "-", 107, yInterno + 9);

      yInterno += 20; // 🔥 reduzido

      // ===============================
      // 📊 GRÁFICO (REDUZIDO)
      // ===============================
      const imgGrafico = gerarGraficoPDF(topEventos);

      if (imgGrafico) {
        // 🔥 menor altura para caber no layout
        pdf.addImage(imgGrafico, "PNG", 10, yInterno, 180, 40);
      }

      // ===============================
      // 🚀 AVANÇA PARA PRÓXIMO BLOCO
      // ===============================
      y = inicioBloco + alturaCaixa + espacamento;

    });

  });

  // ===============================
  // 📄 RODAPÉ FINAL
  // ===============================
  adicionarRodape(pdf, pagina);

  pdf.save("relatorio_geral.pdf");
}
// ===============================
// 📊 GERAR GRÁFICO PARA PDF (FIXO)
// ===============================
function gerarGraficoPDF(eventos) {

  const canvas = document.createElement("canvas");

  // 🔥 tamanho fixo (controle total)
  canvas.width = 800;
  canvas.height = 300;

  const ctx = canvas.getContext("2d");

  const chartTemp = new Chart(ctx, {
    type: "bar",
    data: {
      labels: eventos.map(e => e.nome),
      datasets: [{
        data: eventos.map(e => e.qtd),
        backgroundColor: "rgba(0,229,255,0.7)"
      }]
    },
    options: {
      responsive: false, // 🔥 ESSENCIAL
      animation: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: {
            color: "#ccc",
            maxRotation: 30,
            minRotation: 30
          }
        },
        y: {
          ticks: { color: "#ccc" }
        }
      }
    }
  });

  const imagem = canvas.toDataURL("image/png", 1.0);

  chartTemp.destroy(); // 🔥 importante

  return imagem;
}


// =========================
// PDF DETALHADO (1 PLACA)
// =========================
function exportarPDFDetalhado() {

  if (!resultadoGraf) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let pagina = 1;

  adicionarCabecalho(pdf, "RELATORIO DE EXCEDENTE");

  const status = statusPlacas[resultadoGraf.placa];

  let y = 30;

  // ===============================
  // 🔷 BLOCO RESUMO
  // ===============================
  pdf.setTextColor(255);
  pdf.setFontSize(12);
  pdf.text(`PLACA: ${resultadoGraf.placa}`, 10, y);

  y += 8;

  // 🔥 NOVO DASHBOARD (CARDS)
  desenharCardsResumo(pdf, resultadoGraf, status, y);

  // ===============================
  // 📏 ESPAÇO REAL DOS CARDS
  // ===============================
  const alturaCard = 20;
  const gapY = 6;
  const espacamentoExtra = 10;

  y += (alturaCard * 2) + gapY + espacamentoExtra;

  // ===============================
  // 📊 GRÁFICO (PROPORÇÃO CORRETA)
  // ===============================
  const eventosOrdenadosGraf = [...resultadoGraf.eventos]
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 15);

  const imgGrafico = gerarGraficoPDF(eventosOrdenadosGraf);

  if (imgGrafico) {

    const larguraGrafico = 180;

    // 🔥 proporção original do canvas (800x300)
    const proporcao = 300 / 800;

    const alturaGrafico = larguraGrafico * proporcao;

    pdf.addImage(imgGrafico, "PNG", 10, y, larguraGrafico, alturaGrafico);

    // 🔥 usa altura real (sem chute)
    y += alturaGrafico + 10;
  }

  // ===============================
  // 🔷 CABEÇALHO DA TABELA
  // ===============================
  pdf.setTextColor(0, 229, 255);
  pdf.setFontSize(11);

  pdf.text("EVENTO", 10, y);
  pdf.text("QTD", 130, y);
  pdf.text("%", 170, y);

  y += 4;

  pdf.setDrawColor(0, 229, 255);
  pdf.line(10, y, 200, y);

  y += 6;

  // ===============================
  // 📋 DADOS DA TABELA
  // ===============================
  const eventosOrdenados = [...resultadoGraf.eventos]
    .sort((a, b) => b.qtd - a.qtd);

  eventosOrdenados.forEach((e, index) => {

    // 🔲 Zebra (linhas alternadas)
    if (index % 2 === 0) {
      pdf.setFillColor(20, 20, 30);
      pdf.rect(10, y - 4, 190, 6, "F");

      pdf.setTextColor(255); // branco
    } else {
      pdf.setTextColor(20); // cinza escuro (melhor que preto puro)
    }

    pdf.setFontSize(10);

    pdf.text(e.nome, 10, y);
    pdf.text(String(e.qtd), 130, y);
    pdf.text(`${e.percentual.toFixed(2)}%`, 170, y);

    y += 6;

    // 🔄 QUEBRA DE PÁGINA
    if (y > 270) {
      adicionarRodape(pdf, pagina++);
      pdf.addPage();
      adicionarCabecalho(pdf, "RELATORIO DE EXCEDENTE");
      y = 30;
    }

  });

  adicionarRodape(pdf, pagina);

  pdf.save(`relatorio_${resultadoGraf.placa}.pdf`);
}


// ===============================
// 🧾 CABEÇALHO PDF
// ===============================
function adicionarCabecalho(pdf, titulo) {

  pdf.setFillColor(5, 1, 13);
  pdf.rect(0, 0, 210, 20, "F");

  pdf.setTextColor(0, 229, 255);
  pdf.setFontSize(14);
  pdf.text(titulo, 10, 12);

  pdf.setTextColor(150);
  pdf.setFontSize(8);
  pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 150, 12);
}


// ===============================
// 📄 RODAPÉ PDF
// ===============================
function adicionarRodape(pdf, pagina) {

  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text(`Pagina ${pagina}`, 180, 290);
}


// ===============================
// 📊 CAPTURAR GRÁFICO (Chart.js)
// ===============================
function obterImagemGrafico() {

  const canvas = document.getElementById("grafico");
  if (!canvas) return null;

  return canvas.toDataURL("image/png", 1.0);
}
// ===============================
// 🎨 CARDS RESUMO (LAYOUT CORRIGIDO 3 EM CIMA / 2 EMBAIXO)
// ===============================
function desenharCardsResumo(pdf, d, status, yInicial) {

  // ===============================
  // 📏 CONFIGURAÇÕES DE LAYOUT
  // ===============================
  const larguraCard = 58;   // largura base (linha de cima)
  const alturaCard = 20;

  const gapX = 6;
  const gapY = 6;

  const xInicial = 10;

  // ===============================
  // 📐 LARGURA TOTAL DO GRID
  // ===============================
  const larguraTotal = (larguraCard * 3) + (gapX * 2);

  // 🔥 AGORA DIVIDIMOS EM 2 CARDS IGUAIS
  const larguraCardInferior = (larguraTotal - gapX) / 2;

  // ===============================
  // 🎯 POSIÇÕES
  // ===============================
  const linha1Y = yInicial;
  const linha2Y = yInicial + alturaCard + gapY;

  const col1 = xInicial;
  const col2 = xInicial + larguraCard + gapX;
  const col3 = xInicial + (larguraCard + gapX) * 2;

  // ===============================
  // 🟦 LINHA 1 (3 CARDS)
  // ===============================

  // INTERVALO
  desenharCard(pdf, col1, linha1Y, larguraCard, alturaCard,
    "INTERVALO",
    d.intervaloTransmissao || "-"
  );

  // TOTAL
  desenharCard(pdf, col2, linha1Y, larguraCard, alturaCard,
    "TOTAL",
    String(d.total)
  );

  // STATUS
  let statusTexto = "NAO DEFINIDO";
  let corStatus = [150, 150, 150];

  if (status === "APTO") {
    statusTexto = "APTO";
    corStatus = [0, 200, 0];
  } else if (status === "NAO_APTO") {
    statusTexto = "NAO APTO";
    corStatus = [255, 60, 60];
  }

  desenharCard(pdf, col3, linha1Y, larguraCard, alturaCard,
    "STATUS",
    statusTexto,
    corStatus
  );

  // ===============================
  // 🟦 LINHA 2 (AGORA 2 CARDS IGUAIS ✅)
  // ===============================

  // 🔥 EVENTO PRINCIPAL
  const eventosOrdenados = [...d.eventos]
    .sort((a, b) => b.qtd - a.qtd);

  const principal = eventosOrdenados[0]?.nome || "-";
  const percentual = eventosOrdenados[0]?.percentual?.toFixed(2) || "0";

  desenharCardMultilinha(
    pdf,
    col1,
    linha2Y,
    larguraCardInferior,
    alturaCard,
    "EVENTO PRINCIPAL",
    principal,
    `${percentual}%`
  );

  // 🔥 PERÍODO / ARQUIVO
  const periodo =
    `${formatarData(d.dataInicio)} até ${formatarData(d.dataFim)}`;

  desenharCardMultilinha(
    pdf,
    col1 + larguraCardInferior + gapX,
    linha2Y,
    larguraCardInferior,
    alturaCard,
    "PERIODO / ARQUIVO",
    periodo,
    d.nomeArquivo || "-"
  );
}
// =======================
// CARD SIMPLES
// =======================
function desenharCard(pdf, x, y, w, h, titulo, valor, corValor = [255, 255, 255]) {

  // fundo
  pdf.setFillColor(20, 25, 40);
  pdf.roundedRect(x, y - 4, w, h, 2, 2, "F");

  // título
  pdf.setTextColor(150);
  pdf.setFontSize(7);
  pdf.text(titulo, x + 2, y);

  // valor
  pdf.setTextColor(...corValor);
  pdf.setFontSize(10);
  pdf.text(valor, x + 2, y + 7);
}
// ======================
// CARD MÙLTIPLAS LINHAS
// ======================
function desenharCardMultilinha(pdf, x, y, w, h, titulo, linha1, linha2) {

  // fundo
  pdf.setFillColor(20, 25, 40);
  pdf.roundedRect(x, y - 4, w, h, 2, 2, "F");

  // título
  pdf.setTextColor(150);
  pdf.setFontSize(7);
  pdf.text(titulo, x + 2, y);

  // ===============================
  // 🔥 LINHA 1 (DINÂMICA)
  // ===============================
  pdf.setTextColor(255);
  pdf.setFontSize(8);

  const texto = pdf.splitTextToSize(linha1, w - 4);

  // desenha linha 1
  pdf.text(texto, x + 2, y + 5);

  // ===============================
  // 🔥 CALCULA ALTURA REAL USADA
  // ===============================
  const alturaTexto = texto.length * 4; // ajuste fino

  // ===============================
  // 🔷 LINHA 2 (AZUL - ARQUIVO)
  // ===============================
  if (linha2) {
    pdf.setTextColor(0, 229, 255);

    pdf.text(
      linha2,
      x + 2,
      y + 5 + alturaTexto // 🔥 posição dinâmica (corrige duplicação)
    );
  }
}


// ===============================
// 👤 USUÁRIO LOGADO
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const nome = localStorage.getItem("usuario");
  const campo = document.getElementById("usuarioLogado");

  campo.innerHTML = nome
    ? `👤 ${nome} <span class="status online"></span>`
    : `👤 Usuário <span class="status offline"></span>`;
});


// ===============================
// 📊 PROGRESSO
// ===============================
function atualizarProgresso(atual, total) {
  document.getElementById("progresso").innerText =
    `${atual} / ${total}`;
}


// ===============================
// 🚪 LOGOUT
// ===============================
async function logout() {
  try {

    await apiRequest("/auth/logout", {
      method: "POST"
    });

  } catch (e) {
    console.warn("Erro ao fazer logout no servidor");
  }

  // 🔥 LIMPA TUDO (IMPORTANTE)
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("usuario");
  localStorage.removeItem("perfil");

  // 🔄 Redireciona
  window.location.href = "login.html";
}

// ===================================
// 👑 PAINEL MASTER - USUÁRIOS ONLINE
// ===================================
async function carregarUsuariosOnline() {

  const container = document.getElementById("usuariosOnlineMaster");
  const usuarioAtual = localStorage.getItem("usuario");

  if (!container) return;

  container.innerHTML = "Carregando...";

  try {

    const response = await fetchWithAuthRetry(API_BASE + "/usuario/online");
    const lista = await response.json();

    if (!Array.isArray(lista) || lista.length === 0) {
      container.innerHTML = "Nenhum usuário online";
      return;
    }

    container.innerHTML = "";

    lista.forEach(u => {

      const statusClass = u.online ? "online" : "offline";

      // 🔥 destaque do usuário atual
      const isMe = u.nome === usuarioAtual ? "me" : "";

      container.innerHTML += `
        <div class="usuario-item ${statusClass} ${isMe}">
          <span>👤 ${u.nome}</span>
          <span class="status-dot"></span>
        </div>
      `;
    });

  } catch (e) {

    console.error("Erro ao carregar usuários:", e);
    container.innerHTML = "Erro ao carregar";

  }
}
// ===============================
// 👤 USUÁRIO LOGADO + DROPDOWN
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const nome = localStorage.getItem("usuario");
  const perfil = (localStorage.getItem("perfil") || "").toUpperCase();

  const campo = document.getElementById("usuarioLogado");
  const painel = document.getElementById("painelMaster");

  // ===============================
  // 👤 RENDER USUÁRIO
  // ===============================
  campo.innerHTML = nome
    ? `👤 ${nome} <span class="status online"></span>`
    : `👤 Usuário <span class="status offline"></span>`;

  // ===============================
  // 👑 SOMENTE MASTER TEM DROPDOWN
  // ===============================
  if (perfil === "MASTER") {

    painel.classList.remove("hidden");

    // 🔽 toggle estilo Discord
    campo.addEventListener("click", () => {
      painel.classList.toggle("hidden");
    });

    // 🔥 primeira carga
    carregarUsuariosOnline();

    // 🔁 atualização automática
    setInterval(carregarUsuariosOnline, 5000);

  }

});

// =========================================
// 👑 EXIBIR SOMENTE MASTER (CORRIGIDO)
// =========================================

// 🔁 CONTROLE DO INTERVALO MASTER
let intervalUsuarios = null;

document.addEventListener("DOMContentLoaded", () => {

  // 🔐 Recupera perfil do usuário
  let perfil = localStorage.getItem("perfil"); // ✅ TROCA CONST → LET

  // 🔐 NORMALIZAÇÃO (evita erro null e case sensitive)
  perfil = perfil ? perfil.toUpperCase() : null;

  const painel = document.getElementById("painelMaster");

  // 🔒 ESCONDE POR PADRÃO
  if (painel) painel.classList.add("hidden");

  // 👑 SOMENTE MASTER VÊ O PAINEL
  if (perfil === "MASTER") {

    console.log("👑 MASTER detectado");

    painel.classList.remove("hidden");

    // 🔥 primeira carga
    carregarUsuariosOnline();

    // 🔁 atualização automática a cada 5s
    if (!intervalUsuarios) {
      intervalUsuarios = setInterval(carregarUsuariosOnline, 5000);
    }
  } else {
    console.log("👤 Usuário comum");
  }

});



// ===================================
// ⏱ MANTER USUÁRIO ATIVO (SEGURO)
// ===================================
setInterval(() => {

  fetchWithAuthRetry(API_BASE + "/usuario/heartbeat", {
    method: "POST"
  });

}, 60000); // a cada 1 min

function atualizarStatusTopo() {
  const el = document.getElementById("statusTopo");
  if (!el) return;

  const status = statusPlacas[placaAtual];

  el.classList.remove("apto", "nao-apto");

  if (!status) {
    el.innerText = "Status: —";
    return;
  }

  if (status === "APTO") {
    el.innerText = "Status: 🟢 Apto a Desconto";
    el.classList.add("apto");
  }

  if (status === "NAO_APTO") {
    el.innerText = "Status: 🔴 Não Apto a Desconto";
    el.classList.add("nao-apto");
  }
}

// ==================
// ANIMAÇÂO CASCADE
// =================
window.addEventListener("load", () => {
  const elementos = document.querySelectorAll(".fade-in");

  elementos.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("show");
    }, index * 200); // delay progressivo
  });
});