const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "embeddinggemma:300m-qat-q8_0";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "llama3.1";

export const embed = async (texto: string): Promise<number[]> => {
  const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: texto }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embeddings respondió ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { embedding: number[] };
  return data.embedding;
};

export const generar = async (prompt: string): Promise<string> => {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: CHAT_MODEL, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama generate respondió ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { response: string };
  return data.response;
};
