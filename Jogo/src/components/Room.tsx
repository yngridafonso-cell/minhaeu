export type SpotId = "door" | "clock" | "painting" | "shelf" | "desk" | "rug" | "plant" | "safe";

interface Props {
  onSelect: (id: SpotId) => void;
  onHover: (name: string | null) => void;
  drawerOpen: boolean;
  safeOpen: boolean;
  rugMoved: boolean;
  plantChecked: boolean;
  won: boolean;
}

const shelfColors = ["#b91c1c", "#1d4ed8", "#ca8a04", "#15803d", "#7e22ce", "#0e7490", "#b45309"];

export default function Room({ onSelect, onHover, drawerOpen, safeOpen, rugMoved, plantChecked, won }: Props) {
  const spot = (id: SpotId, name: string) => ({
    className: "hotspot",
    onClick: () => onSelect(id),
    onMouseEnter: () => onHover(name),
    onMouseLeave: () => onHover(null),
  });

  return (
    <svg viewBox="0 0 1000 560" className="block h-full w-full select-none" role="img" aria-label="Sala trancada">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3350" />
          <stop offset="1" stopColor="#1b2038" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3b22" />
          <stop offset="1" stopColor="#3a2414" />
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c4a24" />
          <stop offset="1" stopColor="#5e3517" />
        </linearGradient>
        <linearGradient id="doorg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4b2e1a" />
          <stop offset="1" stopColor="#3a2112" />
        </linearGradient>
        <radialGradient id="lamp" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </radialGradient>
        <radialGradient id="exit" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="1" stopColor="#fbbf24" />
        </radialGradient>
      </defs>

      {/* Parede e piso */}
      <rect width="1000" height="410" fill="url(#wall)" />
      {Array.from({ length: 11 }).map((_, i) => (
        <rect key={i} x={i * 95 - 10} y="0" width="2" height="410" fill="#ffffff" opacity="0.04" />
      ))}
      <rect y="395" width="1000" height="16" fill="#171a2c" />
      <rect y="410" width="1000" height="150" fill="url(#floor)" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1="0" x2="1000" y1={425 + i * 17} y2={425 + i * 17} stroke="#000" strokeOpacity="0.25" />
      ))}

      {/* Luminária de teto */}
      <line x1="450" y1="0" x2="450" y2="40" stroke="#555" strokeWidth="3" />
      <path d="M420 70 L430 40 L470 40 L480 70 Z" fill="#374151" />
      <ellipse cx="450" cy="72" rx="28" ry="6" fill="#fde68a" className="flicker" />
      <polygon points="425,75 475,75 640,410 260,410" fill="url(#lamp)" className="flicker" pointerEvents="none" />

      {/* Estante */}
      <g {...spot("shelf", "Estante de livros")}>
        <rect x="35" y="80" width="190" height="320" rx="4" fill="url(#wood)" stroke="#2f1a0b" strokeWidth="3" />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x="46" y={92 + r * 100} width="168" height="88" fill="#2a170a" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x={52 + i * 20}
                y={180 + r * 100 - (52 + ((i * 7 + r * 5) % 4) * 8)}
                width="16"
                height={52 + ((i * 7 + r * 5) % 4) * 8}
                fill={shelfColors[(i * 3 + r * 2) % shelfColors.length]}
                rx="1"
              />
            ))}
            <rect x="46" y={180 + r * 100} width="168" height="8" fill="#6b3f1d" />
          </g>
        ))}
      </g>

      {/* Quadro */}
      <g {...spot("painting", "Quadro na parede")}>
        <rect x="265" y="105" width="150" height="115" fill="#b8860b" stroke="#6b4e08" strokeWidth="4" />
        <rect x="275" y="115" width="130" height="95" fill="#1e3a5f" />
        <rect x="275" y="115" width="130" height="50" fill="#334e7a" />
        <polygon points="275,210 315,160 345,190 365,170 405,210" fill="#14301f" />
        <circle cx="375" cy="140" r="12" fill="#fcd34d" />
      </g>

      {/* Relógio */}
      <g {...spot("clock", "Relógio de parede")}>
        <circle cx="545" cy="135" r="52" fill="#78350f" stroke="#451a03" strokeWidth="5" />
        <circle cx="545" cy="135" r="43" fill="#fef3c7" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={545 + Math.sin(a) * 36}
              y1={135 - Math.cos(a) * 36}
              x2={545 + Math.sin(a) * 41}
              y2={135 - Math.cos(a) * 41}
              stroke="#451a03"
              strokeWidth="2"
            />
          );
        })}
        {/* 3:00 */}
        <line x1="545" y1="135" x2="575" y2="135" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" />
        <line x1="545" y1="135" x2="545" y2="103" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
        <circle cx="545" cy="135" r="4" fill="#b91c1c" />
      </g>

      {/* Porta de saída */}
      <g {...spot("door", "Porta de saída")}>
        <rect x="690" y="110" width="180" height="292" fill="#2a170a" stroke="#1a0e06" strokeWidth="6" />
        {won ? (
          <rect x="698" y="118" width="164" height="284" fill="url(#exit)" className="door-light" />
        ) : (
          <>
            <rect x="698" y="118" width="164" height="284" fill="url(#doorg)" />
            <rect x="714" y="136" width="62" height="100" fill="#3d2414" stroke="#24140a" strokeWidth="2" />
            <rect x="784" y="136" width="62" height="100" fill="#3d2414" stroke="#24140a" strokeWidth="2" />
            <rect x="714" y="256" width="62" height="130" fill="#3d2414" stroke="#24140a" strokeWidth="2" />
            <rect x="784" y="256" width="62" height="130" fill="#3d2414" stroke="#24140a" strokeWidth="2" />
            <circle cx="835" cy="270" r="8" fill="#d4a017" />
          </>
        )}
        {/* Painel do teclado */}
        <rect x="885" y="220" width="40" height="64" rx="6" fill="#111827" stroke="#374151" strokeWidth="2" />
        <rect x="891" y="227" width="28" height="12" rx="2" fill={won ? "#22c55e" : "#ef4444"} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={892 + (i % 3) * 9} y={246 + Math.floor(i / 3) * 12} width="7" height="9" rx="1" fill="#6b7280" />
        ))}
        <text x="780" y="102" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fca5a5" letterSpacing="4">
          SAÍDA
        </text>
      </g>

      {/* Cofre */}
      <g {...spot("safe", "Cofre")}>
        <rect x="900" y="325" width="85" height="85" rx="4" fill="#374151" stroke="#111827" strokeWidth="4" />
        <rect x="908" y="333" width="69" height="69" rx="2" fill={safeOpen ? "#0b0f19" : "#4b5563"} />
        {safeOpen ? (
          <rect x="912" y="345" width="38" height="22" fill="#fef9c3" transform="rotate(-6 930 356)" />
        ) : (
          <>
            <circle cx="942" cy="367" r="17" fill="#1f2937" stroke="#9ca3af" strokeWidth="3" />
            <line x1="942" y1="367" x2="942" y2="354" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* Tapete */}
      <g {...spot("rug", "Tapete")}>
        <polygon points="270,450 640,450 690,535 220,535" fill="#7f1d1d" stroke="#450a0a" strokeWidth="3" />
        <polygon points="295,461 615,461 650,522 255,522" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="8 6" />
        {rugMoved && (
          <>
            <polygon points="270,450 330,450 300,500 220,535" fill="#5b1414" />
            <rect x="268" y="505" width="26" height="9" rx="3" fill="#fbbf24" opacity="0.0" />
          </>
        )}
      </g>

      {/* Mesa com gaveta */}
      <g {...spot("desk", "Mesa com gaveta")}>
        <rect x="285" y="305" width="290" height="16" rx="3" fill="#8b5a2b" stroke="#3b2210" strokeWidth="2" />
        <rect x="295" y="321" width="270" height="84" fill="url(#wood)" stroke="#3b2210" strokeWidth="2" />
        <rect x="305" y="332" width="170" height="30" fill={drawerOpen ? "#1a0f07" : "#6b3f1d"} stroke="#3b2210" strokeWidth="2" />
        {drawerOpen ? (
          <rect x="305" y="362" width="170" height="14" fill="#8b5a2b" stroke="#3b2210" strokeWidth="2" />
        ) : (
          <>
            <circle cx="390" cy="347" r="5" fill="#d4a017" />
            <rect x="383" y="352" width="14" height="8" rx="2" fill="#111" opacity="0.7" />
          </>
        )}
        <rect x="490" y="332" width="65" height="64" fill="#6b3f1d" stroke="#3b2210" strokeWidth="2" />
        <circle cx="522" cy="364" r="4" fill="#d4a017" />
        {/* abajur */}
        <rect x="320" y="290" width="6" height="15" fill="#111" />
        <polygon points="305,290 341,290 332,265 314,265" fill="#fbbf24" />
        {/* papéis */}
        <rect x="430" y="296" width="44" height="9" fill="#e5e7eb" />
        <rect x="438" y="291" width="40" height="6" fill="#d1d5db" />
      </g>

      {/* Planta */}
      <g {...spot("plant", "Vaso de planta")}>
        <path d="M610 405 L620 355 L670 355 L680 405 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
        <rect x="614" y="350" width="62" height="10" rx="3" fill="#c2631a" />
        <path d="M645 350 C620 320 610 290 625 260 C640 290 645 320 645 350Z" fill="#15803d" />
        <path d="M645 350 C660 310 685 290 700 270 C685 310 660 330 645 350Z" fill="#16a34a" />
        <path d="M645 350 C640 300 650 270 660 240 C665 280 655 320 645 350Z" fill="#166534" />
        {plantChecked && <rect x="655" y="352" width="14" height="6" fill="#f5f5f4" transform="rotate(-10 660 355)" />}
      </g>

      <rect width="1000" height="560" fill="url(#vignette)" pointerEvents="none" />
    </svg>
  );
}
