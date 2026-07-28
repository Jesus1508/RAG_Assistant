import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import MessageBubble from "./components/MessageBubble.jsx";
import { preguntar, listarDocumentos } from "./services/api.js";

const MENSAJE_BIENVENIDA = {
  rol: "asistente",
  texto:
    "Hola, soy el asistente interno. Pregúntame sobre vacaciones, onboarding, soporte de TI, código de conducta o viáticos — solo respondo con base en los documentos de la empresa.",
  fuentes: [],
};

export default function App() {
  const [documentos, setDocumentos] = useState([]);
  const [cargandoDocs, setCargandoDocs] = useState(true);
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA]);
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    listarDocumentos()
      .then(setDocumentos)
      .catch(() => setDocumentos([]))
      .finally(() => setCargandoDocs(false));
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarPregunta = async (e) => {
    e.preventDefault();
    const texto = pregunta.trim();
    if (!texto || enviando) return;

    setMensajes((prev) => [
      ...prev,
      { rol: "usuario", texto, fuentes: [] },
      { rol: "asistente", texto: "", fuentes: [], cargando: true },
    ]);
    setPregunta("");
    setEnviando(true);

    try {
      const data = await preguntar(texto);
      setMensajes((prev) => [
        ...prev.slice(0, -1),
        { rol: "asistente", texto: data.respuesta, fuentes: data.fuentes ?? [] },
      ]);
    } catch (error) {
      setMensajes((prev) => [
        ...prev.slice(0, -1),
        {
          rol: "asistente",
          texto:
            "Ocurrió un error al consultar al asistente. Verifica que el backend y Ollama estén corriendo.",
          fuentes: [],
        },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      <Sidebar documentos={documentos} cargando={cargandoDocs} />

      <div className="flex-1 flex flex-col min-h-0">
        <header className="border-b border-slate-800 px-4 py-3">
          <h1 className="text-lg font-semibold">RAG Assistant</h1>
          <p className="text-xs text-slate-500">
            Retrieval-Augmented Generation 100% local · Ollama, sin API keys
          </p>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {mensajes.map((m, i) => (
            <MessageBubble key={i} mensaje={m} />
          ))}
          <div ref={finRef} />
        </main>

        <form
          onSubmit={enviarPregunta}
          className="border-t border-slate-800 p-3 flex gap-2"
        >
          <input
            type="text"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="Escribe tu pregunta…"
            disabled={enviando}
            className="flex-1 bg-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-600 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={enviando || !pregunta.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
