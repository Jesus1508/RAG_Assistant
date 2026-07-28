const fs = require("fs");
const path = require("path");

const RUTA_STORE = path.join(__dirname, "..", "data", "vectorstore.json");

let cache = null;

const cargar = () => {
  if (cache) return cache;
  if (!fs.existsSync(RUTA_STORE)) {
    throw new Error(
      "No se encontró data/vectorstore.json. Corre `npm run ingest` primero para generar los embeddings."
    );
  }
  cache = JSON.parse(fs.readFileSync(RUTA_STORE, "utf-8"));
  return cache;
};

const similitudCoseno = (a, b) => {
  let punto = 0;
  let normaA = 0;
  let normaB = 0;
  for (let i = 0; i < a.length; i++) {
    punto += a[i] * b[i];
    normaA += a[i] * a[i];
    normaB += b[i] * b[i];
  }
  return punto / (Math.sqrt(normaA) * Math.sqrt(normaB));
};

const buscar = (embeddingConsulta, k = 3) => {
  const fragmentos = cargar();
  return fragmentos
    .map((f) => ({ ...f, similitud: similitudCoseno(embeddingConsulta, f.embedding) }))
    .sort((a, b) => b.similitud - a.similitud)
    .slice(0, k)
    .map(({ embedding, ...resto }) => resto);
};

const listarDocumentos = () => {
  const fragmentos = cargar();
  return [...new Set(fragmentos.map((f) => f.documento))];
};

module.exports = { buscar, listarDocumentos };
