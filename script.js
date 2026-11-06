/**
 * ============================================================================
 * 1. CONFIGURAÇÕES E ESTADO INICIAL DO JOGO
 * ============================================================================
 */

// O Jogo da Velha suporta dois modos: 'dupla' ou 'computador'
let modoJogo = 'dupla'; 
let tabuleiro = ['', '', '', '', '', '', '', '', '']; 
let jogadorAtual = 'X'; // O jogador humano sempre começa como 'X'
let jogoAtivo = true; 

// Combinações de vitória (Corrigido: Adicionados os índices que faltavam)
const combinacoesVitoria = [, [3, 4, 5], [6, 7, 8], // Linhas, [1, 4, 7], [2, 5, 8], // Colunas, [2, 4, 6]             // Diagonais
];

/**
 * ============================================================================
 * 2. MAPEAMENTO DE ELEMENTOS DO DOM (HTML)
 * ============================================================================
 */

const celulas = document.querySelectorAll('.celula');
const statusTexto = document.getElementById('status');
const botaoReiniciar = document.getElementById('reiniciar');
const seletorModo = document.getElementById('modo-jogo');

/**
 * ============================================================================
 * 3. FLUXO PRINCIPAL E GERENCIAMENTO DE EVENTOS
 * ============================================================================
 */

// Inicializa os ouvintes de eventos (Event Listeners)
function iniciarJogo() {
    celulas.forEach(celula => celula.addEventListener('click', celulaClicada));
    botaoReiniciar.addEventListener('click', reiniciarJogo);
    seletorModo.addEventListener('change', alternarModo);
    atualizarStatus();
}

// Controla o clique do jogador humano
function celulaClicada(evento) {
    const celulaIndex = evento.target.getAttribute('data-index');

    // Impede o clique se a célula estiver ocupada ou o jogo tiver acabado
    if (tabuleiro[celulaIndex] !== '' || !jogoAtivo) return;

    // Se for o modo contra o computador, impede o clique se for o turno da IA
    if (modoJogo === 'computador' && jogadorAtual === 'O') return;

    jogada(celulaIndex);

    // Se o modo for computador e o jogo continuar ativo, a IA joga em seguida
    if (modoJogo === 'computador' && jogoAtivo && jogadorAtual === 'O') {
        setTimeout(jogadaComputador, 500); // Pequeno atraso para parecer mais natural
    }
}

// Executa a ação de preencher a célula e verificar o estado do jogo
function jogada(index) {
    tabuleiro[index] = jogadorAtual;
    celulas[index].textContent = jogadorAtual;
    celulas[index].classList.add(jogadorAtual.toLowerCase()); // Adiciona classe 'x' ou 'o' para CSS
    verificarResultado();
}

// Lógica de jogada do Computador
function jogadaComputador() {
    if (!jogoAtivo) return;
    
    // Encontra a melhor jogada usando o algoritmo Minimax
    const melhorJogada = encontrarMelhorJogada(tabuleiro);
    jogada(melhorJogada);
}

/**
 * ============================================================================
 * 4. ATUALIZAÇÃO DE INTERFACE (UI) E STATUS
 * ============================================================================
 */

// Alterna o jogador ativo e atualiza o texto na tela
function alternarJogador() {
    jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
    atualizarStatus();
}

// Atualiza o painel de status do jogo baseado no modo escolhido
function atualizarStatus() {
    if (modoJogo === 'computador') {
        statusTexto.textContent = jogadorAtual === 'X' ? "Sua vez (X)" : "Pensando (O)...";
    } else {
        statusTexto.textContent = `Vez do jogador ${jogadorAtual}`;
    }
}

// Destaca visualmente as três células que venceram o jogo
function destacarVitoria(indices) {
    indices.forEach(index => celulas[index].classList.add('vencedor'));
}

/**
 * ============================================================================
 * 5. REGRAS DE NEGÓCIO E VERIFICAÇÕES
 * ============================================================================
 */

// Verifica se houve vencedor ou empate
function verificarResultado() {
    let rodadaVencida = false;
    let combinacaoGanhadora = null;

    for (let i = 0; i < combinacoesVitoria.length; i++) {
        const condicao = combinacoesVitoria[i];
        const a = tabuleiro[condicao[0]];
        const b = tabuleiro[condicao[1]];
        const c = tabuleiro[condicao[2]];

        if (a === '' || b === '' || c === '') continue;

        if (a === b && b === c) {
            rodadaVencida = true;
            combinacaoGanhadora = condicao;
            break;
        }
    }

    if (rodadaVencida) {
        destacarVitoria(combinacaoGanhadora);
        if (modoJogo === 'computador') {
            statusTexto.textContent = jogadorAtual === 'X' ? "Você venceu! 🎉" : "O Computador venceu! 🤖";
        } else {
            statusTexto.textContent = `Jogador ${jogadorAtual} venceu! 🎉`;
        }
        jogoAtivo = false;
        return;
    }

    // Se não houver espaços vazios e ninguém venceu, é um empate
    if (!tabuleiro.includes('')) {
        statusTexto.textContent = "Empate! 🤝";
        jogoAtivo = false;
        return;
    }

    alternarJogador();
}

// Altera a configuração do modo de jogo
function alternarModo(evento) {
    modoJogo = evento.target.value;
    reiniciarJogo();
}

// Reseta todas as variáveis e a interface para o estado inicial
function reiniciarJogo() {
    tabuleiro = ['', '', '', '', '', '', '', '', ''];
    jogadorAtual = 'X';
    jogoAtivo = true;
    atualizarStatus();
    celulas.forEach(celula => {
        celula.textContent = '';
        celula.className = 'celula'; // Reseta as classes CSS (remove 'x', 'o' e 'vencedor')
    });
}

/**
 * ============================================================================
 * 6. ALGORITMO MINIMAX (Computador Inteligente)
 * ============================================================================
 */

function encontrarMelhorJogada(tabuleiroAtual) {
    let melhorPontuacao = -Infinity;
    let jogadaEscolhida;

    for (let i = 0; i < 9; i++) {
        if (tabuleiroAtual[i] === '') {
            tabuleiroAtual[i] = 'O'; // Computador simula jogada
            let pontuacao = minimax(tabuleiroAtual, 0, false);
            tabuleiroAtual[i] = '';  // Desfaz simulação

            if (pontuacao > melhorPontuacao) {
                melhorPontuacao = pontuacao;
                jogadaEscolhida = i;
            }
        }
    }
    return jogadaEscolhida;
}

function minimax(tabuleiroAtual, profundidade, ehMaximizando) {
    const resultado = avaliarMinimax(tabuleiroAtual);
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

// Função de avaliação interna exclusiva do Minimax (evita conflitos de escopo)
function avaliarMinimax(tabuleiroAtual) {
    const combinacoes = [, [3, 4, 5], [6, 7, 8],
, [1, 4, 7], [2, 5, 8],
, [2, 4, 6]
    ];

    for (let i = 0; i < combinacoes.length; i++) {
        const [a, b, c] = combinacoes[i];
        if (tabuleiroAtual[a] && tabuleiroAtual[a] === tabuleiroAtual[b] && tabuleiroAtual[a] === tabuleiroAtual[c]) {
            return tabuleiroAtual[a] === 'O' ? 10 : -10;
        }
    }

    if (!tabuleiroAtual.includes('')) return 0; // Empate
    return null; // Jogo ainda em andamento na simulação
}

/**
 * ============================================================================
 * 7. EXECUÇÃO
 * ============================================================================
 */

iniciarJogo();
