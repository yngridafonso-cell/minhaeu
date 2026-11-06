// O Jogo da Velha suporta dois modos: 'dupla' ou 'computador'
let modoJogo = 'dupla';
let tabuleiro = ['', '', '', '', '', '', '', '', ''];
let jogadorAtual = 'X'; // O jogador humano sempre começa como 'X'
let jogoAtivo = true;

// Combinações de vitória do Jogo da Velha (CORRIGIDO)
const combinacoesVitoria = [, [3, 4, 5], [6, 7, 8], // Linhas, [1, 4, 7], [2, 5, 8], // Colunas, [2, 4, 6]             // Diagonais
];

// Mapeamento dos elementos do HTML
const celulas = document.querySelectorAll('.celula');
const statusTexto = document.getElementById('status');
const botaoReiniciar = document.getElementById('reiniciar');
const seletorModo = document.getElementById('modo-jogo');

// Inicializa os ouvintes de eventos
function iniciarJogo() {
    celulas.forEach(celula => celula.addEventListener('click', celulaClicada));
    if (botaoReiniciar) botaoReiniciar.addEventListener('click', reiniciarJogo);
    if (seletorModo) seletorModo.addEventListener('change', alternarModo);
    atualizarStatus();
}

// Controla o clique do jogador humano
function celulaClicada(evento) {
    const celulaIndex = evento.target.getAttribute('data-index');

    if (tabuleiro[celulaIndex] !== '' || !jogoAtivo) return;
    if (modoJogo === 'computador' && jogadorAtual === 'O') return;

    jogada(celulaIndex);

    if (modoJogo === 'computador' && jogoAtivo && jogadorAtual === 'O') {
        setTimeout(jogadaComputador, 500);
    }
}

function jogada(index) {
    tabuleiro[index] = jogadorAtual;
    celulas[index].textContent = jogadorAtual;
    celulas[index].classList.add(jogadorAtual.toLowerCase());

    verificarResultado();
}

function jogadaComputador() {
    if (!jogoAtivo) return;
    const melhorJogada = encontrarMelhorJogada(tabuleiro);
    jogada(melhorJogada);
}

function alternarJogador() {
    jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
    atualizarStatus();
}

function atualizarStatus() {
    if (!statusTexto) return;
    if (modoJogo === 'computador') {
        statusTexto.textContent = jogadorAtual === 'X' ? "Sua vez (X)" : "Pensando (O)...";
    } else {
        statusTexto.textContent = `Vez do jogador ${jogadorAtual}`;
    }
}

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

    if (!tabuleiro.includes('')) {
        if (statusTexto) statusTexto.textContent = "Empate! 🤝";
        jogoAtivo = false;
        return;
    }

    alternarJogador();
}

function destacarVitoria(indices) {
    indices.forEach(index => celulas[index].classList.add('vencedor'));
}

function alternarModo(evento) {
    modoJogo = evento.target.value;
    reiniciarJogo();
}

function reiniciarJogo() {
    tabuleiro = ['', '', '', '', '', '', '', '', ''];
    jogadorAtual = 'X';
    jogoAtivo = true;
    atualizarStatus();
   
    celulas.forEach(celula => {
        celula.textContent = '';
        celula.className = 'celula';
    });
}

// --- ALGORITMO MINIMAX ---
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

iniciarJogo();
