import { useCallback, useEffect, useRef, useState } from "react";
import Room, { type SpotId } from "./components/Room";
import Modal from "./components/Modal";
import Keypad from "./components/Keypad";
import { Btn, ClockPanel, DrawerPanel, PaintingPanel, ShelfPanel } from "./components/Panels";

const DOOR_CODE = "3796"; // relógio, quadro, cofre, vaso
const SAFE_CODE = "241"; // vermelhos, azuis, verdes

interface Note {
  id: string;
  icon: string;
  title: string;
  text: string;
}

interface Item {
  id: string;
  icon: string;
  name: string;
}

const ITEMS: Record<string, Item> = {
  key: { id: "key", icon: "🗝️", name: "Chave pequena" },
  uv: { id: "uv", icon: "🔦", name: "Lanterna UV" },
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function beep(freq: number, dur = 0.12, type: OscillatorType = "sine") {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
    setTimeout(() => ctx.close(), dur * 1000 + 100);
  } catch {
    /* sem áudio */
  }
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [best, setBest] = useState<number | null>(() => {
    const v = localStorage.getItem("escape-best");
    return v ? Number(v) : null;
  });

  const [inventory, setInventory] = useState<string[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [modal, setModal] = useState<SpotId | "notebook" | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; kind: "info" | "good" | "hint" } | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [safeOpen, setSafeOpen] = useState(false);
  const [rugMoved, setRugMoved] = useState(false);
  const [plantChecked, setPlantChecked] = useState(false);
  const [uvOn, setUvOn] = useState(false);

  const toastTimer = useRef<number | undefined>(undefined);

  const say = useCallback((text: string, kind: "info" | "good" | "hint" = "info") => {
    setToast({ text, kind });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  // Cronômetro
  useEffect(() => {
    if (!started || won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, won]);

  const giveItem = (id: string) => setInventory((inv) => (inv.includes(id) ? inv : [...inv, id]));
  const addNote = (n: Note) => setNotes((ns) => (ns.some((x) => x.id === n.id) ? ns : [...ns, n]));

  const has = (id: string) => notes.some((n) => n.id === id);
  const digitsFound = ["d-clock", "d-paint", "d-safe", "d-plant"].filter(has).length;

  const select = (id: SpotId) => {
    switch (id) {
      case "rug":
        if (!rugMoved) {
          setRugMoved(true);
          giveItem("key");
          beep(660);
          say("Você levantou o tapete e achou uma chave pequena! 🗝️", "good");
        } else {
          say("Não há mais nada embaixo do tapete.");
        }
        return;
      case "plant":
        if (!plantChecked) {
          setPlantChecked(true);
          beep(660);
          addNote({
            id: "d-plant",
            icon: "🌿",
            title: "Papel no vaso",
            text: "Um papel amassado enterrado na terra: “Último número: 6”.",
          });
          say("Havia um papel enterrado na terra do vaso! 📄", "good");
        } else {
          say("A planta parece bem cuidada. O papel já está no seu caderno.");
        }
        return;
      default:
        setModal(id);
    }
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    giveItem("uv");
    addNote({
      id: "n-order",
      icon: "📝",
      title: "Bilhete 1 – A saída",
      text: "“Para sair, digite 4 números, na ordem do caminho: RELÓGIO → QUADRO → COFRE → VASO.”",
    });
    addNote({
      id: "n-safe",
      icon: "📝",
      title: "Bilhete 2 – O cofre",
      text: "“O cofre guarda um número. Sua senha tem 3 dígitos: conte os livros VERMELHOS, AZUIS e VERDES (nessa ordem).”",
    });
    beep(520);
    say("A gaveta abriu! Você pegou uma lanterna UV e dois bilhetes.", "good");
  };

  const toggleUV = () => {
    const next = !uvOn;
    setUvOn(next);
    if (next) {
      beep(900, 0.15, "triangle");
      addNote({
        id: "d-paint",
        icon: "🎨",
        title: "Quadro (sob luz UV)",
        text: "Um número brilhou na tinta do quadro: 7.",
      });
    }
  };

  const openSafe = (code: string) => {
    if (code !== SAFE_CODE) {
      beep(180, 0.3, "sawtooth");
      return false;
    }
    setSafeOpen(true);
    beep(700);
    addNote({
      id: "d-safe",
      icon: "🔐",
      title: "Dentro do cofre",
      text: "Um cartão com um único número impresso: 9.",
    });
    say("O cofre abriu! 🔓", "good");
    setModal(null);
    return true;
  };

  const tryDoor = (code: string) => {
    if (code !== DOOR_CODE) {
      beep(180, 0.3, "sawtooth");
      return false;
    }
    beep(880, 0.2);
    setTimeout(() => beep(1175, 0.3), 200);
    setWon(true);
    setModal(null);
    setTimeout(() => setShowWin(true), 1600);
    const prev = best;
    if (prev === null || seconds < prev) {
      setBest(seconds);
      localStorage.setItem("escape-best", String(seconds));
    }
    return true;
  };

  const hint = () => {
    let text = "";
    if (!rugMoved && !drawerOpen) text = "Algo brilha perto do tapete. Que tal olhar embaixo dele?";
    else if (!drawerOpen) text = "A chave pequena serve na gaveta da mesa.";
    else if (!has("d-paint")) text = "A lanterna UV revela segredos escondidos. Experimente no quadro da parede.";
    else if (!has("d-clock")) text = "Olhe com atenção a hora que o relógio de parede está marcando.";
    else if (!safeOpen) text = "Na estante: 2 livros vermelhos, 4 azuis e 1 verde… Isso forma a senha do cofre: 241.";
    else if (!has("d-plant")) text = "O vaso de planta pode estar escondendo algo na terra.";
    else text = "Digite os números na ordem do bilhete: Relógio, Quadro, Cofre, Vaso → 3 · 7 · 9 · 6.";
    setHintsUsed((h) => h + 1);
    say("💡 " + text, "hint");
  };

  const restart = () => {
    setWon(false);
    setShowWin(false);
    setSeconds(0);
    setHintsUsed(0);
    setInventory([]);
    setNotes([]);
    setModal(null);
    setDrawerOpen(false);
    setSafeOpen(false);
    setRugMoved(false);
    setPlantChecked(false);
    setUvOn(false);
    setToast(null);
  };

  // Ao ler o relógio, registra no caderno
  const openClock = () => {
    addNote({
      id: "d-clock",
      icon: "🕒",
      title: "Relógio parado",
      text: "Os ponteiros pararam às 3 horas em ponto. Número: 3.",
    });
  };

  useEffect(() => {
    if (modal === "clock") openClock();
    if (modal !== "painting") setUvOn(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  /* ---------- Tela inicial ---------- */
  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-[#12152a] to-black p-6">
        <div className="pop max-w-lg space-y-6 text-center">
          <div className="text-6xl">🔐</div>
          <h1 className="text-4xl font-black tracking-tight text-amber-300 sm:text-5xl">Códigos Perdidos</h1>
          <p className="text-slate-300">
            Você acordou em um escritório antigo, e a porta está trancada. Alguém espalhou{" "}
            <b className="text-amber-200">4 números</b> pela sala. Explore, junte pistas, resolva os enigmas e
            descubra o código para escapar.
          </p>
          <ul className="mx-auto max-w-sm space-y-1 text-left text-sm text-slate-400">
            <li>🖱️ Clique nos objetos da sala para investigar.</li>
            <li>🎒 Itens e pistas vão para o seu inventário e caderno.</li>
            <li>💡 Precisa de ajuda? Use o botão de dica.</li>
          </ul>
          <button
            onClick={() => {
              setStarted(true);
              beep(440);
            }}
            className="rounded-xl bg-amber-500 px-8 py-3 text-lg font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 active:scale-95"
          >
            Começar o jogo
          </button>
          {best !== null && <p className="text-xs text-slate-500">Melhor tempo: {fmt(best)}</p>}
        </div>
      </div>
    );
  }

  /* ---------- Jogo ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black px-3 py-4 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Cabeçalho */}
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <h1 className="text-lg font-black tracking-tight text-amber-300">🔐 Códigos Perdidos</h1>
          <div className="flex items-center gap-2" title="Números encontrados">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-bold ${
                  i < digitsFound
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    : "border-slate-700 bg-slate-800 text-slate-600"
                }`}
              >
                {i < digitsFound ? "✓" : "?"}
              </div>
            ))}
            <span className="ml-1 text-xs text-slate-400">números</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-black/50 px-3 py-1 font-mono text-emerald-400">⏱ {fmt(seconds)}</span>
            <button
              onClick={hint}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-amber-200 transition hover:bg-slate-700"
            >
              💡 Dica ({hintsUsed})
            </button>
          </div>
        </header>

        {/* Sala */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 shadow-2xl shadow-black">
          <div className="aspect-[1000/560] w-full">
            <Room
              onSelect={select}
              onHover={setHover}
              drawerOpen={drawerOpen}
              safeOpen={safeOpen}
              rugMoved={rugMoved}
              plantChecked={plantChecked}
              won={won}
            />
          </div>
          <div className="pointer-events-none absolute left-3 top-3 min-h-8 rounded-md bg-black/60 px-3 py-1.5 text-sm text-amber-200">
            {hover ?? "Clique nos objetos para investigar"}
          </div>
          {toast && (
            <div
              className={`pop absolute inset-x-3 bottom-3 mx-auto max-w-xl rounded-lg border px-4 py-3 text-center text-sm shadow-xl ${
                toast.kind === "good"
                  ? "border-emerald-500 bg-emerald-950/95 text-emerald-100"
                  : toast.kind === "hint"
                  ? "border-amber-500 bg-amber-950/95 text-amber-100"
                  : "border-slate-600 bg-slate-900/95 text-slate-200"
              }`}
            >
              {toast.text}
            </div>
          )}
        </div>

        {/* Inventário e Caderno */}
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">🎒 Inventário</h2>
            {inventory.length === 0 ? (
              <p className="text-sm text-slate-600">Vazio</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {inventory.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                  >
                    <span className="text-xl">{ITEMS[id].icon}</span>
                    {ITEMS[id].name}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">📓 Caderno de pistas</h2>
            {notes.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhuma pista ainda. Investigue a sala!</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {notes.map((n) => (
                  <li key={n.id} className="pop rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm">
                    <div className="mb-1 font-semibold text-amber-200">
                      {n.icon} {n.title}
                    </div>
                    <p className="text-slate-300">{n.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Modais */}
      {modal === "clock" && (
        <Modal title="🕒 Relógio de parede" onClose={() => setModal(null)}>
          <ClockPanel />
        </Modal>
      )}
      {modal === "painting" && (
        <Modal title="🖼️ Quadro" onClose={() => setModal(null)}>
          <PaintingPanel hasUV={inventory.includes("uv")} uvOn={uvOn} onToggleUV={toggleUV} />
        </Modal>
      )}
      {modal === "shelf" && (
        <Modal title="📚 Estante" onClose={() => setModal(null)}>
          <ShelfPanel />
        </Modal>
      )}
      {modal === "desk" && (
        <Modal title="🗄️ Gaveta da mesa" onClose={() => setModal(null)}>
          <DrawerPanel open={drawerOpen} hasKey={inventory.includes("key")} onUseKey={openDrawer} />
        </Modal>
      )}
      {modal === "safe" && (
        <Modal title="🔐 Cofre" onClose={() => setModal(null)}>
          {safeOpen ? (
            <p className="text-slate-300">O cofre está aberto. Havia um cartão com o número <b className="text-amber-300">9</b>.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-slate-400">Digite a senha de 3 dígitos.</p>
              <Keypad length={3} onSubmit={openSafe} />
            </div>
          )}
        </Modal>
      )}
      {modal === "door" && (
        <Modal title="🚪 Porta de saída" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-center text-sm text-slate-400">
              A porta está trancada com um teclado de 4 dígitos. Qual é o código?
            </p>
            <Keypad length={4} onSubmit={tryDoor} />
            {digitsFound < 4 && (
              <p className="text-center text-xs text-slate-600">Você ainda não encontrou todos os números…</p>
            )}
          </div>
        </Modal>
      )}

      {/* Vitória */}
      {showWin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur">
          <div className="pop w-full max-w-md space-y-5 rounded-2xl border border-amber-500/50 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-black text-amber-300">Você escapou!</h2>
            <p className="text-slate-300">A porta se abriu e a luz do dia inundou a sala. Parabéns, detetive!</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-800 p-3">
                <div className="text-slate-400">Tempo</div>
                <div className="font-mono text-xl text-emerald-400">{fmt(seconds)}</div>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <div className="text-slate-400">Dicas usadas</div>
                <div className="font-mono text-xl text-amber-300">{hintsUsed}</div>
              </div>
            </div>
            {best !== null && <p className="text-xs text-slate-500">Melhor tempo: {fmt(best)}</p>}
            <Btn onClick={restart}>Jogar novamente</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
