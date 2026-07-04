/* ============================================================
   REFERÊNCIAS DOM
   ============================================================ */
const ladoEsquerdo    = document.getElementById("ladoEsquerdo");
const ladoDireito     = document.getElementById("ladoDireito");
const relogioEsquerda = document.getElementById("relogioEsquerda");
const relogioDireita  = document.getElementById("relogioDireita");
const relogioTotalEsquerda = document.getElementById("relogioTotalEsquerda");
const relogioTotalDireita  = document.getElementById("relogioTotalDireita");
const placarTopo      = document.getElementById("placarTopo");
const placarBase      = document.getElementById("placarBase");
const botaoIniciar    = document.getElementById("botaoIniciar");
const botaoReiniciar  = document.getElementById("botaoReiniciar");
const seletorTempoParcial = document.getElementById("seletorTempoParcial");
const seletorTempoTotal   = document.getElementById("seletorTempoTotal");
const exibicaoJogadasEsquerda = document.getElementById("exibicaoJogadasEsquerda");
const exibicaoJogadasDireita  = document.getElementById("exibicaoJogadasDireita");

/* ============================================================
   ESTADO DO JOGO
   ============================================================ */
let loopAtivo       = false;
let ultimoTick      = 0;

let tempoEsq        = 0;
let tempoDir        = 0;
let tempoTotal      = 0;
let tapeSeg         = 60;
let ativo           = null;    // "left" | "right" | null
let golEsq          = 0;
let golEsq2         = 0;
let golDir          = 0;
let golDir2         = 0;
let fimDeJogo       = false;
let pausado         = false;
let marcadorGol     = null;    // "left" | "right" | null
let jogadasEsq      = 0;
let jogadasDir      = 0;
let limiteJogadas   = 0;

let aguardandoReinicioPartida = false;

/* ============================================================
   ESTADO DOS PÊNALTIS
   ============================================================ */
let disputaPenaltis  = false;
let turnoPenalti     = "left";
let rodadaPenalti    = 1;
let penaltisEsq      = [];
let penaltisDir      = [];
let maxPenaltis      = 5;
let morteSubitaPen   = false;

/* ============================================================
   NOMES DOS JOGADORES
   ============================================================ */
var nomeJogadorVerde   = "Verde";
var nomeJogadorAmarelo = "Amarelo";

function coletarNomesJogadores() {
    const entradaVerde = prompt(
        'Nome do jogador Verde:\n(Pode deixar em branco)'
    );
    nomeJogadorVerde = (entradaVerde !== null && entradaVerde.trim() !== "")
        ? entradaVerde.trim()
        : "Verde";

    const entradaAmarelo = prompt(
        'Nome do jogador Amarelo:\n(Pode deixar em branco)'
    );
    nomeJogadorAmarelo = (entradaAmarelo !== null && entradaAmarelo.trim() !== "")
        ? entradaAmarelo.trim()
        : "Amarelo";
}

function obterNomeJogador(lado) {
    return lado === "left" ? nomeJogadorVerde : nomeJogadorAmarelo;
}

/* ============================================================
   SISTEMA DE CARTÕES E PENALIDADE
   ============================================================ */
let cartoesAmarelosJogadorVerde    = 0;
let cartoesVermelhosJogadorVerde   = 0;
let cartoesAmarelosJogadorAmarelo  = 0;
let cartoesVermelhosJogadorAmarelo = 0;

let cobracaoEmAndamento    = false;
let jogadorDefensorPenalti = null;
let jogadorCobradorPenalti = null;

function gerarHtmlCartoes(quantidadeAmarelos, quantidadeVermelhos) {
    let html = "";
    if (quantidadeAmarelos > 0) {
        html += `<div class="cartao-item cartao-amarelo-cor">
            ${quantidadeAmarelos > 1
                ? `<span class="contador-cartao">${quantidadeAmarelos}</span>`
                : ""}
        </div>`;
    }
    if (quantidadeVermelhos > 0) {
        html += `<div class="cartao-item cartao-vermelho-cor">
            ${quantidadeVermelhos > 1
                ? `<span class="contador-cartao">${quantidadeVermelhos}</span>`
                : ""}
        </div>`;
    }
    return html;
}

function atualizarExibicaoCartoes() {
    const htmlVerde   = gerarHtmlCartoes(cartoesAmarelosJogadorVerde, cartoesVermelhosJogadorVerde);
    const htmlAmarelo = gerarHtmlCartoes(cartoesAmarelosJogadorAmarelo, cartoesVermelhosJogadorAmarelo);

    document.getElementById("cartoesVerde-topo").innerHTML   = htmlVerde;
    document.getElementById("cartoesVerde-base").innerHTML   = htmlVerde;
    document.getElementById("cartoesAmarelo-topo").innerHTML = htmlAmarelo;
    document.getElementById("cartoesAmarelo-base").innerHTML = htmlAmarelo;
}

function zerarTodosOsCartoes() {
    cartoesAmarelosJogadorVerde    = 0;
    cartoesVermelhosJogadorVerde   = 0;
    cartoesAmarelosJogadorAmarelo  = 0;
    cartoesVermelhosJogadorAmarelo = 0;

    cobracaoEmAndamento    = false;
    jogadorDefensorPenalti = null;
    jogadorCobradorPenalti = null;
    atualizarExibicaoCartoes();
}

function adicionarCartaoAmarelo(lado) {
    if (lado === "left") {
        if (cartoesVermelhosJogadorVerde > 0) {
            aplicarCartaoVermelhoDireto("left");
            return;
        }
        cartoesAmarelosJogadorVerde++;
        if (cartoesAmarelosJogadorVerde >= 2) {
            cartoesAmarelosJogadorVerde = 0;
            aplicarCartaoVermelhoDireto("left");
            return;
        }
    } else {
        if (cartoesVermelhosJogadorAmarelo > 0) {
            aplicarCartaoVermelhoDireto("right");
            return;
        }
        cartoesAmarelosJogadorAmarelo++;
        if (cartoesAmarelosJogadorAmarelo >= 2) {
            cartoesAmarelosJogadorAmarelo = 0;
            aplicarCartaoVermelhoDireto("right");
            return;
        }
    }
    atualizarExibicaoCartoes();
}

function aplicarCartaoVermelhoDireto(lado) {
    adicionarCartaoVermelho(lado);
}

function adicionarCartaoVermelho(lado) {
    if (lado === "left") {
        cartoesVermelhosJogadorVerde++;
    } else {
        cartoesVermelhosJogadorAmarelo++;
    }
    atualizarExibicaoCartoes();
    iniciarCobracaoPenalidade(lado);
}

function iniciarCobracaoPenalidade(ladoPenalizadoParam) {
    cobracaoEmAndamento    = true;
    jogadorDefensorPenalti = ladoPenalizadoParam;
    jogadorCobradorPenalti = ladoPenalizadoParam === "left" ? "right" : "left";

    const nomePenalizado = obterNomeJogador(jogadorDefensorPenalti);

    relogioTotalEsquerda.textContent = "⚽ PÊNALTI";
    relogioTotalDireita.textContent  = "⚽ PÊNALTI";

    alert(
        `🟥 CARTÃO VERMELHO! ${nomePenalizado} recebeu um cartão vermelho.`
    );

    configurarBotoesDuranteCobracao();
    
    // [MODIFICADO] Após o alerta, invoca a função que exibe a interface visual de pênalti
    exibirInterfaceCobrancaCartaoVermelho();
}

// [NOVO] Função para preparar e exibir a tela de pênaltis especificamente para o Cartão Vermelho
function exibirInterfaceCobrancaCartaoVermelho() {
    document.getElementById("nomePainelVerde").textContent   = nomeJogadorVerde;
    document.getElementById("nomePainelAmarelo").textContent = nomeJogadorAmarelo;

    // Limpa os indicadores de bolas (não usados nesta cobrança única)
    document.getElementById("bolasEsquerda").innerHTML = "";
    document.getElementById("bolasDireita").innerHTML = "";
    document.getElementById("placarPenaltisEsquerda").textContent = "0";
    document.getElementById("placarPenaltisDireita").textContent = "0";

    // Exibe a sobreposição
    document.getElementById("sobreposicaoPenaltis").classList.remove("d-none");
    
    // Ajusta o título e oculta os controles da disputa normal
    document.querySelector(".pen-titulo").textContent = "⚽ Cobrança de Pênalti";
    document.getElementById("botaoSorteioPenaltis").style.display = "none";
    
    const nomeCobrador = obterNomeJogador(jogadorCobradorPenalti);
    document.getElementById("etiquetaTurnoPenaltis").textContent = `Cobrador: ${nomeCobrador}`;
    document.getElementById("etiquetaTurnoPenaltis").style.display = "block";
    
    document.getElementById("informacaoRodadaPenaltis").style.display = "none";
    document.getElementById("resultadoPenaltis").style.display = "none";
    document.getElementById("botaoReiniciarPenaltis").style.display = "none";

    // Habilita somente os botões (Gol/Erro) do jogador que vai cobrar
    const habEsq = jogadorCobradorPenalti === "left";
    const habDir = jogadorCobradorPenalti === "right";

    document.getElementById("botaoPenGolEsquerda").disabled  = !habEsq;
    document.getElementById("botaoPenErroEsquerda").disabled = !habEsq;
    document.getElementById("botaoPenGolDireita").disabled   = !habDir;
    document.getElementById("botaoPenErroDireita").disabled  = !habDir;
}

function configurarBotoesDuranteCobracao() {
    document.getElementById("botaoGolEsquerda").disabled     = true;
    document.getElementById("botaoGolDireita").disabled      = true;
    botaoIniciar.disabled                                    = true;
    document.getElementById("botaoBandeiraCentral").disabled = true;
    document.getElementById("botaoJogadas").disabled         = true;
    seletorTempoParcial.disabled                             = true;
    seletorTempoTotal.disabled                               = true;

    // [MODIFICADO] Os botões de gol do tabuleiro NÃO são mais habilitados.
    // A ação agora ocorre exclusivamente pela interface (sobreposição) de pênalti.
}

function definirJogadorReinicio() {
    return jogadorDefensorPenalti;
}

function encerrarCobracaoPenalidade(marcouGol) {
    if (marcouGol) {
        if (jogadorCobradorPenalti === "left") { golEsq++; golEsq2++; }
        else                                   { golDir++; golDir2++; }
        atualizarPlacar();
    }

    const jogadorReinicio = definirJogadorReinicio();

    ativo    = jogadorReinicio;
    tempoEsq = parseInt(seletorTempoParcial.value);
    tempoDir = parseInt(seletorTempoParcial.value);

    pausado                   = true;
    aguardandoReinicioPartida = true;

    marcadorGol = (jogadorReinicio === "left") ? "right" : "left";

    cobracaoEmAndamento    = false;
    jogadorDefensorPenalti = null;
    jogadorCobradorPenalti = null;

    ladoEsquerdo.classList.remove("timeout");
    ladoDireito.classList.remove("timeout");

    definirEstadoControles(true);
    atualizarIconeInicio();
    atualizarTela();
}

/* ============================================================
   HELPER — identifica o modo de jogo
   ============================================================ */
function emModoJogadas() {
    return limiteJogadas > 0;
}

/* ============================================================
   DEBOUNCE
   ============================================================ */
function bloquearCliqueRapido(fn, espera = 350) {
    let timeout = null;
    return function (...args) {
        if (timeout) return;
        fn.apply(this, args);
        timeout = setTimeout(() => { timeout = null; }, espera);
    };
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function formatarTempo(seg) {
    const m = String(Math.floor(seg / 60)).padStart(2, "0");
    const s = String(seg % 60).padStart(2, "0");
    return `${m}:${s}`;
}

/* ============================================================
   RENDERIZAÇÃO
   ============================================================ */
function atualizarRelogios() {
    relogioEsquerda.textContent = formatarTempo(tempoEsq);
    relogioDireita.textContent  = formatarTempo(tempoDir);

    if (fimDeJogo) {
        let resultado = "";
        if (golEsq > golDir)       resultado = `${nomeJogadorVerde} VENCEU!`;
        else if (golDir > golEsq)  resultado = `${nomeJogadorAmarelo} VENCEU!`;
        else                       resultado = "EMPATE!";
        relogioTotalEsquerda.textContent = resultado;
        relogioTotalDireita.textContent  = resultado;
    } else {
        if (limiteJogadas > 0) {
            relogioEsquerda.textContent = "";
            relogioDireita.textContent  = "";
            relogioTotalEsquerda.textContent = (ativo === "left")  ? "SUA VEZ!" : "";
            relogioTotalDireita.textContent  = (ativo === "right") ? "SUA VEZ!" : "";
        } else {
            const txt = formatarTempo(tempoTotal);
            relogioTotalEsquerda.textContent = txt;
            relogioTotalDireita.textContent  = txt;
        }
    }
}

function atualizarPlacar() {
    placarTopo.textContent = `${golEsq} : ${golDir}`;
    placarBase.textContent = `${golDir2} : ${golEsq2}`;
}

function atualizarJogadas() {
    exibicaoJogadasEsquerda.textContent = `Jogadas: ${jogadasEsq}`;
    exibicaoJogadasDireita.textContent  = `Jogadas: ${jogadasDir}`;
}

function atualizarTela() {
    atualizarRelogios();
    atualizarPlacar();
    atualizarJogadas();
}

/* ============================================================
   CONTROLE DE BOTÕES
   ============================================================ */
function definirEstadoControles(desabilitado) {
    if (cobracaoEmAndamento) return;

    document.getElementById("botaoGolEsquerda").disabled = desabilitado || ativo !== "left";
    document.getElementById("botaoGolDireita").disabled  = desabilitado || ativo !== "right";

    const jogoEmCurso = loopAtivo;
    document.getElementById("botaoJogadas").disabled = jogoEmCurso;
    seletorTempoParcial.disabled = jogoEmCurso;
    seletorTempoTotal.disabled   = jogoEmCurso;

    botaoIniciar.disabled = (marcadorGol !== null) || (ativo && pausado && !loopAtivo);
}

function atualizarIconeInicio() {
    const icone = botaoIniciar.querySelector("i");
    if (loopAtivo && !pausado) {
        icone.className = "bi bi-pause-fill";
        botaoIniciar.classList.replace("btn-primary", "btn-warning");
    } else {
        icone.className = "bi bi-play-fill";
        botaoIniciar.classList.replace("btn-warning", "btn-primary");
    }
}

/* ============================================================
   TIMER
   ============================================================ */
function executarLoopTempo(timestamp) {
    if (!loopAtivo) return;
    if (ultimoTick === 0) ultimoTick = timestamp;

    const delta = Math.floor((timestamp - ultimoTick) / 1000);
    if (delta >= 1) {
        ultimoTick = timestamp - ((timestamp - ultimoTick) % 1000);
        atualizarTempo();
    }
    requestAnimationFrame(executarLoopTempo);
}

function iniciarLoop() {
    if (loopAtivo) return;
    loopAtivo  = true;
    ultimoTick = 0;
    requestAnimationFrame(executarLoopTempo);
}

function pararLoop() {
    loopAtivo = false;
}

/* ============================================================
   LÓGICA PRINCIPAL — TICK
   ============================================================ */
function atualizarTempo() {
    if (fimDeJogo || pausado || !ativo) return;

    if (ativo === "left") {
        if (tempoEsq > 0) {
            tempoEsq--;
        } else {
            jogadasEsq++;
            atualizarJogadas();
            verificarFimDeJogo();
            if (fimDeJogo) return;
            ladoEsquerdo.classList.add("timeout");
            pausado = true;
            document.getElementById("botaoGolEsquerda").disabled = true;
            atualizarIconeInicio();
            atualizarRelogios();
            if (!emModoJogadas()) adicionarCartaoAmarelo("left");
            return;
        }
    } else if (ativo === "right") {
        if (tempoDir > 0) {
            tempoDir--;
        } else {
            jogadasDir++;
            atualizarJogadas();
            verificarFimDeJogo();
            if (fimDeJogo) return;
            ladoDireito.classList.add("timeout");
            pausado = true;
            document.getElementById("botaoGolDireita").disabled = true;
            atualizarIconeInicio();
            atualizarRelogios();
            if (!emModoJogadas()) adicionarCartaoAmarelo("right");
            return;
        }
    }

    if (limiteJogadas === 0) {
        if (tempoTotal > 0) {
            tempoTotal--;
        } else {
            fimDeJogo = true;
            pararLoop();
            tempoEsq = 0;
            tempoDir = 0;
            definirEstadoControles(true);
            atualizarIconeInicio();
            atualizarTela();
            verificarPenaltisPosJogo();
            return;
        }
    }

    atualizarRelogios();
}

/* ============================================================
   SORTEIO DE QUEM COMEÇA
   ============================================================ */
function iniciarSorteio() {
    if (loopAtivo || fimDeJogo) return;
    let iteracoes = 0;
    const maxIter = 10 + Math.floor(Math.random() * 10);
    botaoIniciar.disabled = true;

    const intervalo = setInterval(() => {
        if (iteracoes % 2 === 0) {
            ladoEsquerdo.classList.add("draw-highlight");
            ladoDireito.classList.remove("draw-highlight");
        } else {
            ladoDireito.classList.add("draw-highlight");
            ladoEsquerdo.classList.remove("draw-highlight");
        }
        iteracoes++;
        if (iteracoes >= maxIter) {
            clearInterval(intervalo);
            const vencedor = Math.random() < 0.5 ? "left" : "right";
            ladoEsquerdo.classList.remove("draw-highlight");
            ladoDireito.classList.remove("draw-highlight");
            setTimeout(() => anunciarVencedor(vencedor), 300);
        }
    }, 150);
}

function anunciarVencedor(vencedor) {
    tempoTotal = parseInt(seletorTempoTotal.value);
    tapeSeg    = parseInt(seletorTempoParcial.value);
    tempoEsq   = tapeSeg;
    tempoDir   = tapeSeg;
    ativo      = vencedor;
    pausado    = true;

    const elVencedor = vencedor === "left" ? ladoEsquerdo : ladoDireito;
    elVencedor.classList.add("draw-highlight");
    setTimeout(() => elVencedor.classList.remove("draw-highlight"), 3000);

    definirEstadoControles(true);
    atualizarTela();
    atualizarIconeInicio();
}

/* ============================================================
   VERIFICAR FIM DE JOGO
   ============================================================ */
function verificarFimDeJogo() {
    if (limiteJogadas <= 0) return;
    if (jogadasEsq >= limiteJogadas && jogadasDir >= limiteJogadas) {
        fimDeJogo = true;
        pararLoop();
        pausado  = true;
        tempoEsq = 0;
        tempoDir = 0;
        definirEstadoControles(true);
        atualizarIconeInicio();
        atualizarTela();
        verificarPenaltisPosJogo();
    }
}

/* ============================================================
   REINICIAR JOGO
   ============================================================ */
function reiniciarJogo() {
    pararLoop();
    pausado       = false;
    tempoEsq      = 0;
    tempoDir      = 0;
    tempoTotal    = 0;
    golEsq        = 0;
    golEsq2       = 0;
    golDir        = 0;
    golDir2       = 0;
    jogadasEsq    = 0;
    jogadasDir    = 0;
    ativo         = null;
    fimDeJogo     = false;
    marcadorGol   = null;
    limiteJogadas = 0;

    aguardandoReinicioPartida = false;

    nomeJogadorVerde   = "Verde";
    nomeJogadorAmarelo = "Amarelo";

    zerarTodosOsCartoes();

    disputaPenaltis = false;
    turnoPenalti    = "left";
    rodadaPenalti   = 1;
    penaltisEsq     = [];
    penaltisDir     = [];
    morteSubitaPen  = false;

    document.getElementById("sobreposicaoPenaltis").classList.add("d-none");
    document.getElementById("botaoReiniciarPenaltis").style.display      = "none";
    document.getElementById("botaoSorteioPenaltis").style.display        = "block";
    document.getElementById("botaoSorteioPenaltis").disabled             = false;
    document.getElementById("etiquetaTurnoPenaltis").style.display       = "none";
    document.getElementById("informacaoRodadaPenaltis").style.display    = "none";

    definirEstadoControles(false);
    atualizarIconeInicio();

    ladoEsquerdo.classList.remove("timeout");
    ladoDireito.classList.remove("timeout");

    tempoTotal = parseInt(seletorTempoTotal.value);
    atualizarTela();
}

/* ============================================================
   BOTÃO INICIAR / PAUSAR
   ============================================================ */
botaoIniciar.onclick = () => {
    if (fimDeJogo || cobracaoEmAndamento) return;

    if (!loopAtivo && ativo === null) {
        coletarNomesJogadores();
        entrarTelaCheia();
        iniciarSorteio();
        return;
    }

    if (pausado && marcadorGol !== null) {
        ativo = (marcadorGol === "left") ? "right" : "left";
        marcadorGol = null;
        pausado     = false;

        aguardandoReinicioPartida = false;

        tempoEsq = parseInt(seletorTempoParcial.value);
        tempoDir = parseInt(seletorTempoParcial.value);
        definirEstadoControles(false);
    } else {
        pausado = !pausado;
    }

    if (!loopAtivo && !pausado && !emModoJogadas()) iniciarLoop();

    atualizarIconeInicio();
    atualizarTela();
    acaoBandeira(ativo);
};

/* ============================================================
   CLIQUES NOS LADOS (trocar vez)
   ============================================================ */
ladoEsquerdo.onclick = bloquearCliqueRapido(() => {
    if (cobracaoEmAndamento) return;
    if (ladoEsquerdo.classList.contains("timeout")) return;
    if (fimDeJogo || (!loopAtivo && ativo === "right") || (pausado && marcadorGol === "left")) return;

    if (pausado) {
        if (!loopAtivo && !emModoJogadas()) iniciarLoop();
        ladoEsquerdo.classList.remove("timeout");
        ladoDireito.classList.remove("timeout");
        pausado     = false;

        aguardandoReinicioPartida = false;

        marcadorGol = null;
        ativo       = "left";
        definirEstadoControles(false);
    } else if (ativo === "left") {
        jogadasEsq++;
        atualizarJogadas();
        verificarFimDeJogo();
        if (fimDeJogo) return;
        tempoEsq = parseInt(seletorTempoParcial.value);
        tempoDir = parseInt(seletorTempoParcial.value);
        ativo    = "right";
    }

    atualizarIconeInicio();
    definirEstadoControles(pausado);
    atualizarRelogios();
});

ladoDireito.onclick = bloquearCliqueRapido(() => {
    if (cobracaoEmAndamento) return;
    if (ladoDireito.classList.contains("timeout")) return;
    if (fimDeJogo || (!loopAtivo && ativo === "left") || (pausado && marcadorGol === "right")) return;

    if (pausado) {
        if (!loopAtivo && !emModoJogadas()) iniciarLoop();
        ladoEsquerdo.classList.remove("timeout");
        ladoDireito.classList.remove("timeout");
        pausado     = false;

        aguardandoReinicioPartida = false;

        marcadorGol = null;
        ativo       = "right";
        definirEstadoControles(false);
    } else if (ativo === "right") {
        jogadasDir++;
        atualizarJogadas();
        verificarFimDeJogo();
        if (fimDeJogo) return;
        tempoEsq = parseInt(seletorTempoParcial.value);
        tempoDir = parseInt(seletorTempoParcial.value);
        ativo    = "left";
    }

    atualizarIconeInicio();
    definirEstadoControles(pausado);
    atualizarRelogios();
});

/* ============================================================
   CONFIRMAR GOL
   ============================================================ */
function confirmarGol() {
    return confirm("Confirmar o gol?");
}

/* Botão de gol — lado esquerdo (Verde) */
document.getElementById("botaoGolEsquerda").onclick = bloquearCliqueRapido(e => {
    e.stopPropagation();

    // [MODIFICADO] O bloco if (cobracaoEmAndamento) foi removido.
    // A ação de confirmar o pênalti por cartão ocorre agora através 
    // dos botões dedicados na sobreposição.

    if (!confirmarGol()) return;
    if (fimDeJogo || pausado) return;
    golEsq++; golEsq2++; jogadasEsq++;
    atualizarJogadas();
    verificarFimDeJogo();
    if (fimDeJogo) return;
    pausado     = true;
    marcadorGol = "left";
    definirEstadoControles(true);
    tempoEsq = parseInt(seletorTempoParcial.value);
    tempoDir = parseInt(seletorTempoParcial.value);
    atualizarIconeInicio();
    atualizarPlacar();
    atualizarRelogios();
});

/* Botão de gol — lado direito (Amarelo) */
document.getElementById("botaoGolDireita").onclick = bloquearCliqueRapido(e => {
    e.stopPropagation();

    // [MODIFICADO] O bloco if (cobracaoEmAndamento) foi removido.
    // A ação de confirmar o pênalti por cartão ocorre agora através 
    // dos botões dedicados na sobreposição.

    if (!confirmarGol()) return;
    if (fimDeJogo || pausado) return;
    golDir++; golDir2++; jogadasDir++;
    atualizarJogadas();
    verificarFimDeJogo();
    if (fimDeJogo) return;
    pausado     = true;
    marcadorGol = "right";
    definirEstadoControles(true);
    tempoEsq = parseInt(seletorTempoParcial.value);
    tempoDir = parseInt(seletorTempoParcial.value);
    atualizarIconeInicio();
    atualizarPlacar();
    atualizarRelogios();
});

/* ============================================================
   AÇÃO BANDEIRA (flag central)
   ============================================================ */
function acaoBandeira(lado) {
    if (fimDeJogo || pausado) return;

    if (lado === "left") jogadasEsq++;
    else                 jogadasDir++;

    atualizarJogadas();
    verificarFimDeJogo();
    if (fimDeJogo) return;

    pausado     = true;
    marcadorGol = lado;
    definirEstadoControles(true);
    tempoEsq = parseInt(seletorTempoParcial.value);
    tempoDir = parseInt(seletorTempoParcial.value);

    atualizarIconeInicio();
    atualizarRelogios();
}

document.getElementById("botaoJogadas").onclick = () => {
    if (loopAtivo) return;
    const entrada = prompt("Número de Jogadas (Limite):");
    if (entrada === null) return;
    if (entrada.trim() === "") { alert("O campo não pode estar vazio!"); return; }
    const valor = Number(entrada);
    if (isNaN(valor))  { alert("O valor digitado não é um número!"); return; }
    if (valor <= 0)    { alert("É necessário que seja um número maior que zero!"); return; }
    limiteJogadas = Math.floor(valor);
    atualizarRelogios();
};

document.getElementById("botaoBandeiraCentral").onclick = bloquearCliqueRapido(e => {
    e.stopPropagation();
    if (cobracaoEmAndamento || fimDeJogo || pausado || !ativo) return;

    if (ativo === "left") {
        jogadasEsq++;
        tempoEsq = parseInt(seletorTempoParcial.value);
    } else {
        jogadasDir++;
        tempoDir = parseInt(seletorTempoParcial.value);
    }

    atualizarJogadas();
    verificarFimDeJogo();
    if (fimDeJogo) return;

    pausado     = true;
    marcadorGol = ativo;
    definirEstadoControles(true);
    atualizarIconeInicio();
    atualizarRelogios();
    acaoBandeira(ativo);    
});

botaoReiniciar.onclick = () => { reiniciarJogo(); sairTelaCheia(); };

/* ============================================================
   TELA CHEIA
   ============================================================ */
function entrarTelaCheia() {
    const el = document.documentElement;
    if (el.requestFullscreen)            el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen)     el.msRequestFullscreen();
}

function sairTelaCheia() {
    if (document.exitFullscreen) document.exitFullscreen();
}

/* ============================================================
   PÊNALTIS — VERIFICAR SE DEVE INICIAR
   ============================================================ */
function verificarPenaltisPosJogo() {
    if (!fimDeJogo) return;
    if (golEsq !== golDir) return;

    setTimeout(() => {
        const resposta = confirm("Partida empatada! Desejam disputar nos pênaltis?");
        if (resposta) iniciarDisputaPenaltis();
    }, 400);
}

/* ============================================================
   PÊNALTIS — INICIALIZAR
   ============================================================ */
function iniciarDisputaPenaltis() {
    disputaPenaltis = false;
    turnoPenalti    = "left";
    rodadaPenalti   = 1;
    penaltisEsq     = [];
    penaltisDir     = [];
    morteSubitaPen  = false;

    document.getElementById("nomePainelVerde").textContent   = nomeJogadorVerde;
    document.getElementById("nomePainelAmarelo").textContent = nomeJogadorAmarelo;

    document.getElementById("sobreposicaoPenaltis").classList.remove("d-none");
    
    // [MODIFICADO] Restaura o título padrão da tela de disputa de pênaltis
    document.querySelector(".pen-titulo").textContent = "⚽ Disputa de Pênaltis";
    
    document.getElementById("resultadoPenaltis").style.display       = "none";
    document.getElementById("botaoReiniciarPenaltis").style.display  = "none";
    document.getElementById("botaoSorteioPenaltis").style.display    = "block";
    document.getElementById("botaoSorteioPenaltis").disabled         = false;
    document.getElementById("etiquetaTurnoPenaltis").style.display   = "none";
    document.getElementById("informacaoRodadaPenaltis").style.display= "none";

    atualizarInterfacePenaltis();
    document.getElementById("botaoPenGolEsquerda").disabled  = true;
    document.getElementById("botaoPenErroEsquerda").disabled = true;
    document.getElementById("botaoPenGolDireita").disabled   = true;
    document.getElementById("botaoPenErroDireita").disabled  = true;
}

/* ============================================================
   PÊNALTIS — SORTEIO DE QUEM COMEÇA
   ============================================================ */
function iniciarSorteioPenaltis() {
    const btnSortear    = document.getElementById("botaoSorteioPenaltis");
    btnSortear.disabled = true;

    const painelVerde   = document.querySelector(".pen-painel.verde");
    const painelAmarelo = document.querySelector(".pen-painel.amarelo");

    let iteracoes = 0;
    const maxIter = 10 + Math.floor(Math.random() * 10);

    const intervalo = setInterval(() => {
        if (iteracoes % 2 === 0) {
            painelVerde.classList.add("pen-draw-highlight");
            painelAmarelo.classList.remove("pen-draw-highlight");
        } else {
            painelAmarelo.classList.add("pen-draw-highlight");
            painelVerde.classList.remove("pen-draw-highlight");
        }
        iteracoes++;

        if (iteracoes >= maxIter) {
            clearInterval(intervalo);
            painelVerde.classList.remove("pen-draw-highlight");
            painelAmarelo.classList.remove("pen-draw-highlight");

            const vencedor = Math.random() < 0.5 ? "left" : "right";
            setTimeout(() => anunciarVencedorPenaltis(vencedor), 250);
        }
    }, 150);
}

function anunciarVencedorPenaltis(lado) {
    turnoPenalti    = lado;
    disputaPenaltis = true;

    document.getElementById("botaoSorteioPenaltis").style.display     = "none";
    document.getElementById("etiquetaTurnoPenaltis").style.display    = "block";
    document.getElementById("informacaoRodadaPenaltis").style.display = "block";

    const painelVencedor = lado === "left"
        ? document.querySelector(".pen-painel.verde")
        : document.querySelector(".pen-painel.amarelo");

    painelVencedor.classList.add("pen-draw-highlight");
    setTimeout(() => painelVencedor.classList.remove("pen-draw-highlight"), 1200);

    atualizarEtiquetaTurno();
    atualizarBotoesPenaltis();
}

/* ============================================================
   PÊNALTIS — REGISTRAR COBRANÇA
   ============================================================ */
function registrarPenalti(lado, gol) {
    // [MODIFICADO] Intercepta a ação caso seja a cobrança de um cartão vermelho
    if (cobracaoEmAndamento) {
        if (lado !== jogadorCobradorPenalti) return;
        
        // Remove a sobreposição e repassa o resultado da cobrança (true/false)
        document.getElementById("sobreposicaoPenaltis").classList.add("d-none");
        encerrarCobracaoPenalidade(gol);
        return;
    }

    if (!disputaPenaltis) return;
    if (lado !== turnoPenalti) return;

    const lista = lado === "left" ? penaltisEsq : penaltisDir;
    lista.push(gol);

    atualizarInterfacePenaltis();
    alternarTurnoPenaltis();
    verificarFimPenaltis();
}

/* ============================================================
   PÊNALTIS — ALTERNAR TURNO
   ============================================================ */
function alternarTurnoPenaltis() {
    if (turnoPenalti === "left") {
        turnoPenalti = "right";
    } else {
        turnoPenalti = "left";
        if (!morteSubitaPen) rodadaPenalti++;
    }
    atualizarBotoesPenaltis();
    atualizarEtiquetaTurno();
}

/* ============================================================
   PÊNALTIS — ATUALIZAR UI
   ============================================================ */
function atualizarInterfacePenaltis() {
    renderizarBolas("left",  penaltisEsq);
    renderizarBolas("right", penaltisDir);

    document.getElementById("placarPenaltisEsquerda").textContent = penaltisEsq.filter(Boolean).length;
    document.getElementById("placarPenaltisDireita").textContent  = penaltisDir.filter(Boolean).length;

    atualizarEtiquetaTurno();
}

function renderizarBolas(lado, lista) {
    const container = document.getElementById(
        `bolas${lado === "left" ? "Esquerda" : "Direita"}`
    );
    container.innerHTML = "";

    const total = morteSubitaPen
        ? Math.max(penaltisEsq.length, penaltisDir.length, 1)
        : maxPenaltis;

    for (let i = 0; i < total; i++) {
        const bola = document.createElement("i");
        if (lista[i] === true) {
            bola.className = "fa-solid fa-futbol text-success";
        } else if (lista[i] === false) {
            bola.className = "fa-solid fa-futbol text-danger";
        } else {
            bola.className = "fa-solid fa-futbol text-secondary opacity-50";
        }
        container.appendChild(bola);
    }
}

function atualizarEtiquetaTurno() {
    const nomeAtual = obterNomeJogador(turnoPenalti);
    document.getElementById("etiquetaTurnoPenaltis").textContent = `Vez de ${nomeAtual}`;

    const rodadaLabel = morteSubitaPen
        ? `Cobranças Alternadas ${rodadaPenalti}`
        : `Rodada ${Math.min(rodadaPenalti, maxPenaltis)} de ${maxPenaltis}`;
    document.getElementById("informacaoRodadaPenaltis").textContent = rodadaLabel;
}

function atualizarBotoesPenaltis() {
    const habEsq = disputaPenaltis && turnoPenalti === "left";
    const habDir = disputaPenaltis && turnoPenalti === "right";

    document.getElementById("botaoPenGolEsquerda").disabled  = !habEsq;
    document.getElementById("botaoPenErroEsquerda").disabled = !habEsq;
    document.getElementById("botaoPenGolDireita").disabled   = !habDir;
    document.getElementById("botaoPenErroDireita").disabled  = !habDir;
}

/* ============================================================
   PÊNALTIS — VERIFICAR FIM
   ============================================================ */
function verificarFimPenaltis() {
    const golsE = penaltisEsq.filter(Boolean).length;
    const golsD = penaltisDir.filter(Boolean).length;
    const cobE  = penaltisEsq.length;
    const cobD  = penaltisDir.length;

    if (!morteSubitaPen) {
        const restamD = maxPenaltis - cobD;
        if (golsE > golsD + restamD && cobE <= maxPenaltis) { finalizarPenaltis("left");  return; }
        const restamE = maxPenaltis - cobE;
        if (golsD > golsE + restamE && cobD <= maxPenaltis) { finalizarPenaltis("right"); return; }

        if (cobE >= maxPenaltis && cobD >= maxPenaltis) {
            if (golsE !== golsD) {
                finalizarPenaltis(golsE > golsD ? "left" : "right");
            } else {
                morteSubitaPen = true;
                rodadaPenalti  = 1;
                turnoPenalti   = "left";
                atualizarBotoesPenaltis();
                atualizarEtiquetaTurno();
                atualizarInterfacePenaltis();
            }
        }
    } else {
        if (cobE > cobD) return;
        if (cobE === cobD && cobE > 0) {
            const ultimoE = penaltisEsq[penaltisEsq.length - 1];
            const ultimoD = penaltisDir[penaltisDir.length - 1];
            if (ultimoE && !ultimoD) { finalizarPenaltis("left");  return; }
            if (!ultimoE && ultimoD) { finalizarPenaltis("right"); return; }
            rodadaPenalti++;
            turnoPenalti = "left";
            atualizarBotoesPenaltis();
            atualizarEtiquetaTurno();
            atualizarInterfacePenaltis();
        }
    }
}

/* ============================================================
   PÊNALTIS — FINALIZAR
   ============================================================ */
function finalizarPenaltis(vencedor) {
    disputaPenaltis = false;
    document.getElementById("botaoPenGolEsquerda").disabled  = true;
    document.getElementById("botaoPenErroEsquerda").disabled = true;
    document.getElementById("botaoPenGolDireita").disabled   = true;
    document.getElementById("botaoPenErroDireita").disabled  = true;

    const nomeVencedor = obterNomeJogador(vencedor);
    const emoji        = vencedor === "left" ? "🟢" : "🟡";

    const resultEl = document.getElementById("resultadoPenaltis");
    resultEl.style.display = "block";
    resultEl.textContent   = `🏆 ${emoji} ${nomeVencedor} VENCEU!`;

    document.getElementById("etiquetaTurnoPenaltis").textContent    = "Disputa encerrada";
    document.getElementById("informacaoRodadaPenaltis").textContent = "";
    document.getElementById("botaoReiniciarPenaltis").style.display = "block";

    const textoRelógio = `${nomeVencedor} VENCEU!`;
    relogioTotalEsquerda.textContent = textoRelógio;
    relogioTotalDireita.textContent  = textoRelógio;
}

reiniciarJogo();