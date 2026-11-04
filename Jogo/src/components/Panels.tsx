import type { ReactNode } from "react";

export function Btn({
  children,
  onClick,
  variant = "amber",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "amber" | "violet" | "slate";
}) {
  const colors = {
    amber: "bg-amber-500 text-slate-900 hover:bg-amber-400",
    violet: "bg-violet-600 text-white hover:bg-violet-500",
    slate: "bg-slate-700 text-white hover:bg-slate-600",
  }[variant];
  return (
    <button onClick={onClick} className={`w-full rounded-lg px-4 py-2.5 font-semibold transition active:scale-95 ${colors}`}>
      {children}
    </button>
  );
}

export function ClockPanel() {
  return (
    <div className="space-y-4 text-center">
      <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48">
        <circle cx="100" cy="100" r="92" fill="#78350f" stroke="#451a03" strokeWidth="6" />
        <circle cx="100" cy="100" r="80" fill="#fef3c7" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x = 100 + Math.sin(a) * 64;
          const y = 100 - Math.cos(a) * 64;
          return (
            <text key={i} x={x} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#451a03">
              {i === 0 ? 12 : i}
            </text>
          );
        })}
        <line x1="100" y1="100" x2="148" y2="100" stroke="#1c1917" strokeWidth="7" strokeLinecap="round" />
        <line x1="100" y1="100" x2="100" y2="44" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="100" r="6" fill="#b91c1c" />
      </svg>
      <p className="text-slate-300">
        O relógio parou. Os ponteiros marcam exatamente <b className="text-amber-300">3 horas</b>.
      </p>
      <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-400">
        Atrás do vidro, um adesivo diz: <i>“A hora em que tudo parou.”</i>
      </p>
    </div>
  );
}

export function PaintingPanel({
  hasUV,
  uvOn,
  onToggleUV,
}: {
  hasUV: boolean;
  uvOn: boolean;
  onToggleUV: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className={`overflow-hidden rounded-lg border-4 ${uvOn ? "border-violet-500" : "border-amber-700"} transition`}>
        <svg viewBox="0 0 300 200" className="block w-full">
          <rect width="300" height="200" fill={uvOn ? "#0b0220" : "#1e3a5f"} />
          {!uvOn && <rect width="300" height="110" fill="#334e7a" />}
          <polygon points="0,200 80,100 140,150 190,110 300,200" fill={uvOn ? "#150833" : "#14301f"} />
          <circle cx="240" cy="55" r="22" fill={uvOn ? "#2e1065" : "#fcd34d"} />
          {uvOn && (
            <g className="uv-glow">
              <text
                x="85"
                y="80"
                fontSize="64"
                fontWeight="900"
                fill="#c4b5fd"
                fontFamily="monospace"
                style={{ filter: "drop-shadow(0 0 8px #a78bfa)" }}
              >
                7
              </text>
              <text x="40" y="180" fontSize="10" fill="#8b5cf6" fontFamily="monospace">
                «o que a luz comum não vê»
              </text>
            </g>
          )}
        </svg>
      </div>
      {!uvOn && (
        <p className="text-sm text-slate-400">
          Uma paisagem comum… mas a tinta parece estranhamente irregular em alguns pontos.
        </p>
      )}
      {uvOn && (
        <p className="text-sm text-violet-300">Sob a luz UV, um número brilha na tinta: <b>7</b>.</p>
      )}
      {hasUV ? (
        <Btn variant="violet" onClick={onToggleUV}>
          {uvOn ? "Desligar lanterna UV" : "🔦 Usar lanterna UV"}
        </Btn>
      ) : (
        <p className="text-center text-xs text-slate-500">Talvez uma luz especial ajude aqui…</p>
      )}
    </div>
  );
}

const shelves: string[][] = [
  ["red", "blue", "yellow", "blue", "green", "purple", "yellow"],
  ["purple", "blue", "yellow", "red", "purple", "yellow"],
  ["yellow", "blue", "purple", "yellow", "purple"],
];

const bookColor: Record<string, string> = {
  red: "bg-red-600",
  blue: "bg-blue-600",
  green: "bg-green-600",
  yellow: "bg-yellow-500",
  purple: "bg-purple-600",
};

export function ShelfPanel() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-lg border-4 border-amber-900 bg-[#2a170a] p-3">
        {shelves.map((row, r) => (
          <div key={r} className="flex items-end gap-1 border-b-8 border-amber-800 px-1">
            {row.map((c, i) => (
              <div
                key={i}
                className={`w-7 rounded-t-sm ${bookColor[c]} shadow-inner`}
                style={{ height: 56 + ((i * 7 + r * 5) % 4) * 9 }}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-400">
        Livros de várias cores, organizados em três prateleiras. Quantos de cada cor existem?
      </p>
    </div>
  );
}

export function DrawerPanel({
  open,
  hasKey,
  onUseKey,
}: {
  open: boolean;
  hasKey: boolean;
  onUseKey: () => void;
}) {
  if (open) {
    return (
      <div className="space-y-3">
        <p className="text-slate-300">A gaveta está aberta. Você já pegou tudo o que havia dentro:</p>
        <ul className="list-inside list-disc text-sm text-slate-400">
          <li>🔦 Lanterna de luz UV</li>
          <li>📝 Dois bilhetes (veja seu caderno)</li>
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-slate-300">🔒 A gaveta está trancada. A fechadura é bem pequena.</p>
      {hasKey ? (
        <Btn onClick={onUseKey}>🗝️ Usar chave pequena</Btn>
      ) : (
        <p className="text-sm text-slate-500">Talvez exista uma chave escondida em algum lugar da sala…</p>
      )}
    </div>
  );
}
