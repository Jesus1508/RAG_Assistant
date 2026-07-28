const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "embeddinggemma:300m-qat-q8_0";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "llama3.1";

const embed = async (texto) => {
  const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: texto }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embeddings respondió ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.embedding;
};

const generar = async (prompt) => {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: CHAT_MODEL, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama generate respondió ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.response;
};

module.exports = { embed, generar };
