const { validationResult } = require("express-validator");
const { embed, generar } = require("../services/ollama");
const { buscar } = require("../services/vectorstore");

const construirPrompt = (pregunta, fuentes) => {
  const contexto = fuentes
    .map((f, i) => `[Fuente ${i + 1} — ${f.documento}]\n${f.fragmento}`)
    .join("\n\n");

  return `Eres un asistente interno de la empresa. Responde la pregunta del colaborador
usando ÚNICAMENTE la información del contexto proporcionado. Si el contexto no
contiene la respuesta, dilo claramente en vez de inventar información.

Contexto:
${contexto}

Pregunta: ${pregunta}

Respuesta:`;
};

exports.chat = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { pregunta } = req.body;

    const embeddingConsulta = await embed(pregunta);
    const fuentes = buscar(embeddingConsulta, 3);

    if (fuentes.length === 0) {
      return res.json({
        success: true,
        data: { respuesta: "Aún no hay documentos indexados en la base de conocimiento.", fuentes: [] },
      });
    }

    const prompt = construirPrompt(pregunta, fuentes);
    const respuesta = await generar(prompt);

    res.json({
      success: true,
      data: {
        respuesta: respuesta.trim(),
        fuentes: fuentes.map((f) => ({
          documento: f.documento,
          fragmento: f.fragmento,
          similitud: Math.round(f.similitud * 1000) / 1000,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al procesar la pregunta", error: error.message });
  }
};
