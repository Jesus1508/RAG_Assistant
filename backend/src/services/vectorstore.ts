import fs from "node:fs";
import path from "node:path";

export interface Fragmento {
  id: number;
  documento: string;
  fragmento: string;
  embedding: number[];
}

export type ResultadoBusqueda = Omit<Fragmento, "embedding"> & { similitud: number };

const RUTA_STORE = path.join(__dirname, "..", "..", "data", "vectorstore.json");

let cache: Fragmento[] | null = null;

const cargar = (): Fragmento[] => {
  if (cache) return cache;
  if (!fs.existsSync(RUTA_STORE)) {
    throw new Error(
      "No se encontró data/vectorstore.json. Corre `npm run ingest` primero para generar los embeddings."
    );
  }
  cache = JSON.parse(fs.readFileSync(RUTA_STORE, "utf-8")) as Fragmento[];
  return cache;
};

export const similitudCoseno = (a: number[], b: number[]): number => {
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

export const buscar = (embeddingConsulta: number[], k = 3): ResultadoBusqueda[] => {
  const fragmentos = cargar();
  return fragmentos
    .map((f) => ({ ...f, similitud: similitudCoseno(embeddingConsulta, f.embedding) }))
    .sort((a, b) => b.similitud - a.similitud)
    .slice(0, k)
    .map(({ embedding, ...resto }) => resto);
};

export const listarDocumentos = (): string[] => {
  const fragmentos = cargar();
  return [...new Set(fragmentos.map((f) => f.documento))];
};

/** Only for tests: the in-memory cache is module-level, so tests that mock `fs` need to clear it between cases. */
export const _resetCacheForTests = (): void => {
  cache = null;
};
