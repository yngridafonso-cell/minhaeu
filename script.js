/**
 * JOGO: Escape the Room (5 Fases)
 * Arquivo: script.js
 */

(function () {
  // --- 1. CONFIGURAÇÃO DOS ESTILOS (CSS EMBUTIDO) ---
  const styles = `
    #escape-game-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #1a1a1a;
      color: #e0e0e0;
      width: 100%;
      height: 100%;
      min-height: 500px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 20px;
      position: relative;
    }
    #escape-game-container :box-sizing { box-sizing: border-box; }
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .game-title { margin: 0; color: #ff5722; font-size: 24px; }
    .fullscreen-btn {
      background-color: #333;
      color: #fff;
      border: 1px solid #555;
      padding: 8px 15px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .fullscreen-btn:hover { background-color: #444; }
    .game-body {
      display: flex;
      flex: 1;
      gap: 20px;
    }
    .room-view {
      flex: 2;
      background-color: #262626;
      border: 2px solid #3d3d3d;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .room-description { font-size: 18px; line-height: 1.6; margin-bottom: 20px; }
    .interaction-zone { display: flex; flex-direction: column; gap: 10px; }
    .action-btn {
      background-color: #ff5722;
      color: white;
      border: none;
      padding: 12px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 4px;
      text-align: left;
      transition: background 0.2s;
    }
    .action-btn:hover { background-color: #e64a19; }
    .input-group { display: flex; gap: 10px; margin-top: 10px; }
    .code-input {
      flex: 1;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #555;
      background: #333;
      color: white;
      border-radius: 4px;
    }
    .submit-btn {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      border-radius: 4px;
    }
    .submit-btn:hover { background-color: #388e3c; }
    .sidebar {
      flex: 1;
      background-color: #222;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 15px;
      display: flex;
      flex-direction: column;
    }
    .sidebar h3 { margin-top: 0; color: #ff9800; border-bottom: 1px solid #444; padding-bottom: 5px; }
    .inventory-list { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .inventory-item {
      background: #333;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      border: 1px solid #555;
    }
    .game-log {
      margin-top: 20px;
      flex: 1;
      background: #111;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
      overflow-y: auto;
      max-height: 150px;
      color: #888;
    }
    .system-msg { color: #00e676; }
    .error-msg { color: #ff5252; }
  `;

  // Injectar estilos no HEAD
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // --- 2. DADOS E FASES DO JOGO ---
  const gameState = {
    currentLevel: 1,
    inventory: [],
    logs: ["Você acordou trancado. Encontre uma saída."],
    solvedSteps: {} // Rastreia pequenos progressos dentro da mesma fase
  };

  const levels = {
    1: {
      title: "Fase 1: O Quarto Escuro",
      description: "Você está em um quarto mal iluminado. Há uma **escrivaninha velha**, uma porta trancada com chave comum e um tapete no centro do chão.",
      actions: (state) => {
        let list = [];
        if (!state.inventory.includes("Chave Enferrujada")) {
          list.push({ text: "Olhar debaixo do tapete", action: () => lookUnderRug() });
        }
        list.push({ text: "Examinar a escrivaninha velha", action: () => examineDesk1() });
        list.push({ text: "Tentar abrir a porta principal", action: () => tryOpenDoor1() });
        return list;
      }
    },
    2: {
      title: "Fase 2: A Sala dos Relógios",
      description: "Esta sala possui três relógios de parede parados marcando horas diferentes: 03:00, 06:00 e 09:00. Na parede, há uma inscrição: 'A soma do tempo liberta o próximo passo'. Há um teclado numérico eletrônico ao lado da porta.",
      hasInput: true,
      inputPlaceholder: "Digite a senha de 4 dígitos...",
      actions: (state) => [
        { text: "Examinar os relógios detalhadamente", action: () => log("Os relógios parecem indicar uma ordem numérica direta: 3... 6... 9... Qual seria o quarto número lógico?") }
      ],
      checkCode: (code) => {
        // Sequência aritmética simples: 3, 6, 9, 12 -> Senha: 36912 ou apenas o próximo número: 12. Vamos aceitar "12" ou "36912"
        if (code.trim() === "12" || code.trim() === "36912") {
          nextLevel("O teclado bipa verde e a porta se abre!");
          return true;
        }
        return false;
      }
    },
    3: {
      title: "Fase 3: O Laboratório de Alquimia",
      description: "Bancadas cheias de frascos químicos. Uma porta de aço possui uma fechadura mecânica em formato de engrenagem. Há uma fresta escura na parede que você não consegue alcançar com as mãos.",
      actions: (state) => {
        let list = [];
        if (!state.inventory.includes("Ímã Forte")) {
          list.push({ text: "Procurar nas gavetas do laboratório", action: () => findMagnet() });
        }
        if (state.inventory.includes("Ímã Forte") && !state.inventory.includes("Engrenagem de Bronze")) {
          list.push({ text: "Usar o Ímã na fresta escura da parede", action: () => useMagnet() });
        }
        list.push({ text: "Inserir engrenagem na porta de aço", action: () => tryOpenDoor3() });
        return list;
      }
    },
    4: {
      title: "Fase 4: A Biblioteca dos Enigmas",
      description: "Prateleiras do chão ao teto. Na mesa central, um livro aberto diz: 'Tenho cauda, mas não sou cão. Não tenho asas, mas sei voar. Se me soltam, fico parado. Se me prendem, fujo com o vento.'",
      hasInput: true,
      inputPlaceholder: "Escreva a resposta em uma palavra...",
      actions: (state) => [
        { text: "Procurar pistas nos livros", action: () => log("Um bilhete rasgado diz: 'É leve, feita de papel ou pano, adora dias de vento no parque.'") }
      ],
      checkCode: (code) => {
        const resposta = code.toLowerCase().trim();
        if (resposta === "pipa" || resposta === "papagaio") {
          nextLevel("Uma passagem secreta se abre atrás da estante!");
          return true;
        }
        return false;
      }
    },
    5: {
      title: "Fase Final: A Sala de Controle",
      description: "Você vê a luz do sol por uma janela blindada! O computador central gerencia a saída de emergência. A tela exibe: 'Para escapar, digite o ano atual do sistema.'",
      hasInput: true,
      inputPlaceholder: "Digite o ano de 4 dígitos...",
      actions: (state) => [
        { text: "Olhar os arquivos do painel", action: () => log(`O relógio interno do sistema operacional indica que hoje é dia 4 de novembro de ${new Date().getFullYear()}.`) }
      ],
      checkCode: (code) => {
        const currentYear = new Date().getFullYear().toString();
        if (code.trim() === currentYear) {
          gameState.currentLevel = "WIN";
          log("SISTEMA DESBLOQUEADO! A porta principal se abre. VOCÊ ESCAPOU!", "system");
          render();
          return true;
        }
        return false;
      }
    }
  };

  // --- 3. LÓGICAS ESPECÍFICAS DAS FASES ---
  function log(msg, type = "") {
    gameState.logs.unshift(msg); // Adiciona no início para aparecer primeiro
    render();
  }

  function nextLevel(successMsg) {
    log(successMsg, "system");
    gameState.currentLevel++;
    render();
  }

  // Fase 1
  function lookUnderRug() {
    if (!gameState.inventory.includes("Chave Enferrujada")) {
      gameState.inventory.push("Chave Enferrujada");
      log("Você encontrou uma [Chave Enferrujada] sob o tapete!", "system");
    }
  }
  function examineDesk1() {
    log("A escrivaninha está vazia, mas há marcas de arranhões apontando para o tapete.");
  }
  function tryOpenDoor1() {
    if (gameState.inventory.includes("Chave Enferrujada")) {
      nextLevel("Você usa a Chave Enferrujada. A porta range e se abre!");
    } else {
      log("A porta está trancada. Você precisa de uma chave.", "error");
    }
  }

  // Fase 3
  function findMagnet() {
    gameState.inventory.push("Ímã Forte");
    log("Você vasculhou as gavetas e achou um [Ímã Forte]!", "system");
  }
  function useMagnet() {
    if (gameState.inventory.includes("Ímã Forte")) {
      gameState.inventory.push("Engrenagem de Bronze");
      log("Usando o ímã, você puxou uma [Engrenagem de Bronze] de dentro da fresta!", "system");
    }
  }
  function tryOpenDoor3() {
    if (gameState.inventory.includes("Engrenagem de Bronze")) {
      nextLevel("A engrenagem se encaixa perfeitamente, o mecanismo gira e destranca a porta!");
    } else {
      log("Falta um componente mecânico em formato de roda dentada para ativar o painel.", "error");
    }
  }

  // --- 4. FUNÇÕES DE RENDERIZAÇÃO DA INTERFACE ---
  function render() {
    const root = document.getElementById("escape-game-project-root");
    if (!root) return;

    const lvlIdx = gameState.currentLevel;

      // --- 4. FUNÇÕES DE RENDERIZAÇÃO DA INTERFACE ---
  function render() {
    const root = document.getElementById("escape-game-project-root");
    if (!root) return;

    const lvlIdx = gameState.currentLevel;

    // Tela de Vitória
    if (lvlIdx === "WIN") {
      root.innerHTML = `
        <div id="escape-game-container">
          <div class="game-header">
            <h2 class="game-title">🎉 PARABÉNS! 🎉</h2>
            <button class="fullscreen-btn" id="toggle-fs">Tela Cheia</button>
          </div>
          <div class="room-view" style="text-align: center; justify-content: center; gap: 20px;">
            <h2>Você escapou com sucesso!</h2>
            <p style="font-size: 18px;">Sua mente afiada resolveu todos os 5 níveis do desafio.</p>
            <button class="action-btn" id="restart-game" style="align-self: center;">Jogar Novamente</button>
          </div>
        </div>
      `;
      document.getElementById("restart-game").addEventListener("click", resetGame);
      setupFullscreenEvent();
      return;
    }

    const currentLevelData = levels[lvlIdx];

    let actionsHTML = "";
    currentLevelData.actions(gameState).forEach((act, idx) => {
      actionsHTML += `<button class="action-btn" id="act-btn-${idx}">${act.text}</button>`;
    });

    let inputHTML = "";
    if (currentLevelData.hasInput) {
      inputHTML = `
        <div class="input-group"> 
          <input type="text" class="code-input" id="game-code-input" placeholder="${currentLevelData.inputPlaceholder}"> 
          <button class="submit-btn" id="game-code-submit">Enviar</button> 
        </div>
      `;
    }

    let inventoryHTML = "";
    if (gameState.inventory.length === 0) {
      inventoryHTML = "<p style='color:#666; font-style:italic; margin:0;'>Vazio</p>";
    } else {
      gameState.inventory.forEach(item => {
        inventoryHTML += `<li class="inventory-item">🔑 ${item}</li>`;
      });
    }

    let logsHTML = "";
    gameState.logs.forEach(logText => {
      let cssClass = "";
      if (logText.includes("encontrou") || logText.includes("abre") || logText.includes("desbloqueado")) cssClass = "class='system-msg'";
      if (logText.includes("trancada") || logText.includes("Falta") || logText.includes("incorreta")) cssClass = "class='error-msg'";
      logsHTML += `<div ${cssClass}>> ${logText}</div>`;
    });

    // Montagem do Layout Principal
    root.innerHTML = `
      <div id="escape-game-container"> 
        <div class="game-header"> 
          <h2 class="game-title">${currentLevelData.title}</h2> 
          <button class="fullscreen-btn" id="toggle-fs">🖥️ Tela Cheia</button> 
        </div> 
        <div class="game-body"> 
          <div class="room-view"> 
            <div class="room-description">${currentLevelData.description}</div> 
            <div class="interaction-zone"> 
              ${actionsHTML} 
              ${inputHTML} 
            </div> 
          </div> 
          <div class="sidebar"> 
            <h3>Inventário</h3> 
            <ul class="inventory-list">${inventoryHTML}</ul> 
            <div style="margin-top: auto; display: flex; flex-direction: column; height: 60%;"> 
              <h3 style="margin-top: 15px;">Histórico</h3> 
              <div class="game-log">${logsHTML}</div> 
            </div> 
          </div> 
        </div> 
      </div>
    `;

    // Vincular Eventos de Ações Dinâmicas
    currentLevelData.actions(gameState).forEach((act, idx) => {
      document.getElementById(`act-btn-${idx}`).addEventListener("click", act.action);
    });

    // Vincular Evento de Input (se aplicável)
    if (currentLevelData.hasInput) {
      const inputEl = document.getElementById("game-code-input");
      const submitEl = document.getElementById("game-code-submit");
      const executeSubmit = () => {
        const success = currentLevelData.checkCode(inputEl.value);
        if (!success) {
          log("Código ou resposta incorreta. Tente novamente.", "error");
        }
      };
      submitEl.addEventListener("click", executeSubmit);
      inputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") executeSubmit();
      });
    }

    setupFullscreenEvent();
  }

  // --- 5. CONTROLE DE TELA CHEIA (FULLSCREEN) ---
  function setupFullscreenEvent() {
    const fsBtn = document.getElementById("toggle-fs");
    if (!fsBtn) return;
    fsBtn.addEventListener("click", () => {
      const container = document.getElementById("escape-game-container");
      if (!document.fullscreenElement) {
        // Entrar em modo tela cheia
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.mozRequestFullScreen) { // Firefox
          container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) { // Chrome/Safari
          container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) { // IE/Edge
          container.msRequestFullscreen();
        }
      } else {
        // Sair do modo tela cheia
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  function resetGame() {
    gameState.currentLevel = 1;
    gameState.inventory = [];
    gameState.logs = ["O jogo foi reiniciado. Você está trancado novamente."];
    render();
  }

    // --- 6. INICIALIZAÇÃO CORRIGIDA ---
  function iniciarJogo() {
    let root = document.getElementById("escape-game-project-root");
    
    // Se não encontrar a div na seção, ele procura a área preta principal para se injetar
    if (!root) {
      root = document.createElement("div");
      root.id = "escape-game-project-root";
      root.style.width = "100%";
      root.style.maxWidth = "950px";
      root.style.margin = "0 auto";
      
      // Tenta injetar no corpo ou no primeiro container disponível para não quebrar
      const mainContainer = document.querySelector("main") || document.querySelector("section") || document.body;
      mainContainer.appendChild(root);
    }
    
    render();
  }

  // Executa imediatamente ou assim que o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarJogo);
  } else {
    iniciarJogo();
  }
})();

