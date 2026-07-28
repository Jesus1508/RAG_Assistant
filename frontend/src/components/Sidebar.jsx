const nombreLegible = (archivo) =>
  archivo
    .replace(/\.md$/, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

export default function Sidebar({ documentos, cargando }) {
  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Base de conocimiento
      </h2>
      {cargando ? (
        <p className="text-sm text-slate-500">Cargando documentos…</p>
      ) : (
        <ul className="space-y-2">
          {documentos.map((doc) => (
            <li
              key={doc}
              className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/60 rounded-lg px-3 py-2"
            >
              <span className="text-sky-400">📄</span>
              <span className="truncate">{nombreLegible(doc)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-500 leading-relaxed">
        El asistente responde únicamente con base en estos documentos,
        usando embeddings y generación 100% locales con Ollama — sin API
        keys de por medio.
      </p>
    </aside>
  );
}
