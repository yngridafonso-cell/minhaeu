// Configurações iniciais do jogo
let modoJogo = 'dupla';
let tabuleiro = ['', '', '', '', '', '', '', '', ''];
let jogadorAtual = 'X'; // O jogador humano inicial sempre será o 'X'
let jogoAtivo = true;

// Definição correta das posições vencedoras do tabuleiro
const combinacoesVitoria = [, [3, 4, 5], [6, 7, 8], // Linhas Horizontais, [1, 4, 7], [2, 5, 8], // Colunas Verticais, [2, 4, 6]             // Linhas Diagonais
];

// Seleção dos elementos do HTML
const celulas = document.querySelectorAll('.celula');
const statusTexto = document.getElementById('status');
const botaoReiniciar = document.getElementById('reiniciar');
const seletorModo = document.getElementById('modo-jogo');

// Inicia os ouvintes de clique e seletores
function iniciarJogo() {
    celulas.forEach(celula => celula.addEventListener('click', celulaClicada));
    if (botaoReiniciar) botaoReiniciar.addEventListener('click', reiniciarJogo);
    if (seletorModo) seletorModo.addEventListener('change', alternarModo);
    atualizarStatus();
}

// Controla o clique em cada quadrado do tabuleiro
function celulaClicada(evento) {
    const celulaIndex = evento.target.getAttribute('data-index');

    // Bloqueia se o espaço já estiver preenchido ou se o jogo acabou
    if (tabuleiro[celulaIndex] !== '' || !jogoAtivo) return;
   
    // Bloqueia o clique se for o turno da inteligência artificial
    if (modoJogo === 'computador' && jogadorAtual === 'O') return;

    executarJogada(celulaIndex);

    // Se o modo for contra o computador e o jogo continuar, a máquina joga
    if (modoJogo === 'computador' && jogoAtivo && jogadorAtual === 'O') {
        setTimeout(jogadaComputador, 500); // 0.5 segundos para simular pensamento
    }
}

// Renderiza a jogada no tabuleiro físico e lógico
function ejecutarJogada(index) {
    tabuleiro[index] = jogadorAtual;
    celulas[index].textContent = jogadorAtual;
    celulas[index].classList.add(jogadorAtual.toLowerCase()); // Adiciona classe 'x' ou 'o' para estilização CSS

    verificarResultado();
}

// Gerencia o turno da Inteligência Artificial
function jogadaComputador() {
    if (!jogoAtivo) return;
    const melhorJogada = encontrarMelhorJogada(tabuleiro);
    ejecutarJogada(melhorJogada);
}

// Alterna os turnos perfeitamente entre 'X' e 'O'
function alternarJogador() {
    jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
    atualizarStatus();
}

// Atualiza a barra de texto informativa
function atualizarStatus() {
    if (!statusTexto) return;
    if (modoJogo === 'computador') {
        statusTexto.textContent = jogadorAtual === 'X' ? "Sua vez (X)" : "Pensando (O)...";
    } else {
        statusTexto.textContent = `Vez do jogador ${jogadorAtual}`;
    }
}

// Analisa se a rodada terminou em vitória ou empate
function verificarResultado() {
    let rodadaVencida = false;

    for (let i = 0; i < combinacoesVitoria.length; i++) {
        const condicao = combinacoesVitoria[i];
        const a = tabuleiro[condicao[0]];
        const b = tabuleiro[condicao[1]];
        const c = tabuleiro[condicao[2]];

        if (a === '' || b === '' || c === '') continue;
       
        if (a === b && b === c) {
            rodadaVencida = true;
            destacarVitoria(condicao);
            break;
        }
    }

    if (rodadaVencida) {
        if (statusTexto) {
            if (modoJogo === 'computador') {
                statusTexto.textContent = jogadorAtual === 'X' ? "Você venceu! 🎉" : "O Computador venceu! 🤖";
            } else {
                statusTexto.textContent = `Jogador ${jogadorAtual} venceu! 🎉`;
            }
        }
        jogoAtivo = false;
        return;
    }

    // Verifica se houve empate (tabuleiro cheio)
    if (!tabuleiro.includes('')) {
        if (statusTexto) statusTexto.textContent = "Empate! 🤝";
        jogoAtivo = false;
        return;
    }

    alternarJogador();
}

// Coloca cor diferenciada nas 3 casinhas vitoriosas
function destacarVitoria(indices) {
    indices.forEach(index => celulas[index].classList.add('vencedor'));
}

// Modifica as regras caso mude o seletor na tela
function alternarModo(evento) {
    modoJogo = evento.target.value;
    reiniciarJogo();
}

// Limpa todo o tabuleiro para uma nova partida
function reiniciarJogo() {
    tabuleiro = ['', '', '', '', '', '', '', '', ''];
    jogadorAtual = 'X';
    jogoAtivo = true;
    atualizarStatus();
   
    celulas.forEach(celula => {
        celula.textContent = '';
        celula.className = 'celula'; // Limpa classes antigas de estilo
    });
}

// --- ALGORITMO MINIMAX (Lógica do Computador) ---

function encontrarMelhorJogada(tabuleiroAtual) {
    let melhorPontuacao = -Infinity;
    let jogadaEscolhida = 0;

    for (let i = 0; i < 9; i++) {
        if (tabuleiroAtual[i] === '') {
            tabuleiroAtual[i] = 'O';
            let pontuacao = minimax(tabuleiroAtual, 0, false);
            tabuleiroAtual[i] = '';

            if (pontuacao > melhorPontuacao) {
                melhorPontuacao = pontuacao;
                jogadaEscolhida = i;
            }
        }
    }
    return jogadaEscolhida;
}

function minimax(tabuleiroAtual, profundidade, ehMaximizando) {
    const resultado = avaliarTabuleiro(tabuleiroAtual);
    if (resultado !== null) return resultado;

    if (ehMaximizando) {
        let melhorPontuacao = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (tabuleiroAtual[i] === '') {
                tabuleiroAtual[i] = 'O';
                let pontuacao = minimax(tabuleiroAtual, profundidade + 1, false);
                tabuleiroAtual[i] = '';
                melhorPontuacao = Math.max(pontuacao, melhorPontuacao);
            }
        }
        return melhorPontuacao;
    } else {
        let melhorPontuacao = Infinity;
        for (let i = 0; i < 9; i++) {
            if (tabuleiroAtual[i] === '') {
                tabuleiroAtual[i] = 'X';
                let pontuacao = minimax(tabuleiroAtual, profundidade + 1, true);
                tabuleiroAtual[i] = '';
                melhorPontuacao = Math.min(pontuacao, melhorPontuacao);
            }
        }
        return melhorPontuacao;
    }
}

function avaliarTabuleiro(tabuleiroAtual) {
    for (let i = 0; i < combinacoesVitoria.length; i++) {
        const [a, b, c] = combinacoesVitoria[i];
        if (tabuleiroAtual[a] && tabuleiroAtual[a] === tabuleiroAtual[b] && tabuleiroAtual[a] === tabuleiroAtual[c]) {
            return tabuleiroAtual[a] === 'O' ? 10 : -10;
        }
    }
    if (!tabuleiroAtual.includes('')) return 0;
    return null;
}

// Inicializa a escuta geral do script
iniciarJogo();