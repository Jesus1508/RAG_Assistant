import { useState } from "react";

function Fuente({ fuente, index }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-800"
      >
        <span className="truncate">
          Fuente {index + 1} · {fuente.documento} ·{" "}
          <span className="text-sky-400">
            {Math.round(fuente.similitud * 100)}% similitud
          </span>
        </span>
        <span>{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && (
        <p className="px-3 py-2 text-xs text-slate-400 bg-slate-900/60 whitespace-pre-wrap">
          {fuente.fragmento}
        </p>
      )}
    </div>
  );
}

export default function MessageBubble({ mensaje }) {
  const esUsuario = mensaje.rol === "usuario";

  return (
    <div className={`flex ${esUsuario ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          esUsuario
            ? "bg-sky-600 text-white rounded-br-sm"
            : "bg-slate-800 text-slate-100 rounded-bl-sm"
        }`}
      >
        {mensaje.cargando ? (
          <div className="flex gap-1 py-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{mensaje.texto}</p>
        )}

        {mensaje.fuentes?.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Fuentes recuperadas
            </p>
            {mensaje.fuentes.map((f, i) => (
              <Fuente key={i} fuente={f} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
