require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { embed } = require("../services/ollama");

const DOCS_DIR = path.join(__dirname, "..", "docs");
const SALIDA = path.join(__dirname, "..", "data", "vectorstore.json");

const trocear = (contenido) =>
  contenido
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/, "").trim())
    .filter((p) => p.length > 40);

const run = async () => {
  const archivos = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));
  if (archivos.length === 0) {
    console.error(`No se encontraron documentos .md en ${DOCS_DIR}`);
    process.exit(1);
  }

  const fragmentos = [];
  let id = 1;

  for (const archivo of archivos) {
    const contenido = fs.readFileSync(path.join(DOCS_DIR, archivo), "utf-8");
    const parrafos = trocear(contenido);

    for (const parrafo of parrafos) {
      process.stdout.write(`Generando embedding ${id} (${archivo})…\n`);
      const embedding = await embed(parrafo);
      fragmentos.push({ id: id++, documento: archivo, fragmento: parrafo, embedding });
    }
  }

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, JSON.stringify(fragmentos, null, 2));
  console.log(`\nListo: ${fragmentos.length} fragmentos indexados en ${SALIDA}`);
};

run().catch((error) => {
  console.error("Error durante la ingesta:", error.message);
  process.exit(1);
});
