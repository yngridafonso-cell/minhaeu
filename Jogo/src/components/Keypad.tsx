import { useState } from "react";

interface Props {
  length: number;
  /** Retorna true se o código estiver correto */
  onSubmit: (value: string) => boolean;
  errorText?: string;
}

export default function Keypad({ length, onSubmit, errorText = "Código incorreto!" }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (error) return;
    setValue((v) => (v.length < length ? v + d : v));
  };

  const submit = () => {
    if (value.length < length || error) return;
    const ok = onSubmit(value);
    if (!ok) {
      setError(true);
      setTimeout(() => {
        setError(false);
        setValue("");
      }, 700);
    }
  };

  return (
    <div className="mx-auto w-64">
      <div
        className={`mb-4 flex justify-center gap-2 rounded-xl border border-slate-700 bg-black/60 p-3 ${
          error ? "shake border-red-500" : ""
        }`}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`flex h-12 w-11 items-center justify-center rounded-md bg-slate-900 font-mono text-2xl font-bold ${
              error ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {value[i] ?? <span className="text-slate-700">–</span>}
          </div>
        ))}
      </div>
      <p className={`mb-3 h-5 text-center text-sm text-red-400 ${error ? "opacity-100" : "opacity-0"}`}>
        {errorText}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="rounded-lg bg-slate-700 py-3 text-xl font-semibold text-white transition hover:bg-slate-600 active:scale-95"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => setValue("")}
          className="rounded-lg bg-red-900/70 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-800 active:scale-95"
        >
          Limpar
        </button>
        <button
          onClick={() => press("0")}
          className="rounded-lg bg-slate-700 py-3 text-xl font-semibold text-white transition hover:bg-slate-600 active:scale-95"
        >
          0
        </button>
        <button
          onClick={submit}
          disabled={value.length < length}
          className="rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          OK
        </button>
      </div>
    </div>
  );
}
