# RAG Assistant

Asistente interno con Retrieval-Augmented Generation **100% local**: embeddings
y generación de texto corren sobre [Ollama](https://ollama.com) en tu propia
máquina, sin depender de OpenAI, Cohere ni ninguna API de pago. El asistente
responde preguntas usando únicamente la base de conocimiento indexada, cita
las fuentes recuperadas y reconoce explícitamente cuando no tiene la
respuesta en vez de inventarla.

## Stack

- **Backend**: Node.js, Express, [Ollama](https://ollama.com) (embeddings +
  generación local), búsqueda vectorial por similitud coseno en un índice
  JSON (sin base de datos vectorial externa), helmet, express-validator,
  express-rate-limit.
- **Frontend**: React 19, Vite, Tailwind CSS v4, axios.

## Estructura

```
RAG_Assistant/
  backend/
    docs/          documentos fuente de la base de conocimiento (Markdown)
    scripts/ingest.js   trocea los documentos y genera sus embeddings
    services/       cliente de Ollama + almacén vectorial
    controllers/    lógica de chat y listado de documentos
  frontend/         SPA en React (chat + panel de documentos)
```

## Requisitos previos

Este proyecto necesita [Ollama](https://ollama.com) instalado y corriendo en
tu máquina — es lo que reemplaza a cualquier API de pago (OpenAI, Cohere,
etc.) para generar embeddings y respuestas.

### 1. Instalar Ollama

- **macOS**: descarga el instalador desde [ollama.com/download](https://ollama.com/download),
  o con Homebrew:
  ```bash
  brew install ollama
  ```
- **Linux**:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```
- **Windows**: descarga el instalador desde [ollama.com/download](https://ollama.com/download).

Después de instalarlo, asegúrate de que el servicio esté corriendo (Ollama
suele iniciarse solo como app/servicio en segundo plano; si no, ejecuta
`ollama serve` en una terminal aparte). Puedes verificarlo con:

```bash
curl http://127.0.0.1:11434/api/version
```

### 2. Descargar los modelos necesarios

```bash
ollama pull embeddinggemma:300m-qat-q8_0   # embeddings
ollama pull llama3.1                       # generación de respuestas
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run ingest   # trocea backend/docs/*.md y genera backend/data/vectorstore.json
npm run dev
```

Variables de entorno (`.env`):

- `PORT` — puerto del servidor (por defecto 4003).
- `FRONTEND_URL` — origen permitido por CORS en producción.
- `OLLAMA_HOST` — URL de Ollama (usa `127.0.0.1`, no `localhost`, para evitar
  problemas de resolución IPv6 en algunos entornos Node).
- `OLLAMA_EMBED_MODEL` / `OLLAMA_CHAT_MODEL` — modelos a usar para embeddings
  y generación respectivamente.

`npm run ingest` debe ejecutarse cada vez que se agreguen o modifiquen
documentos en `backend/docs/`.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu backend no corre en localhost:4003
npm run dev
```

## Cómo funciona

1. **Ingesta** (`npm run ingest`): cada documento en `backend/docs/` se
   divide en fragmentos por párrafo, y cada fragmento se convierte en un
   vector de embeddings vía Ollama. Todo se guarda en
   `backend/data/vectorstore.json`.
2. **Consulta**: la pregunta del usuario se convierte también en un
   embedding, se compara por similitud coseno contra todos los fragmentos
   indexados, y se seleccionan los 3 más relevantes.
3. **Generación**: esos fragmentos se inyectan como contexto en el prompt
   enviado al modelo de chat, instruyéndolo a responder únicamente con esa
   información y a admitir cuando no la tiene.
4. El frontend muestra la respuesta junto con las fuentes recuperadas
   (documento, fragmento exacto y porcentaje de similitud).

## Base de conocimiento de ejemplo

`backend/docs/` incluye 5 documentos ficticios de una empresa (política de
vacaciones, onboarding, soporte de TI, código de conducta y guía de
viáticos) para poder probar el asistente sin necesidad de datos reales.
