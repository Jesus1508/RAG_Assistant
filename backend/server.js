require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const chatRoutes = require("./routes/chat");
const documentoRoutes = require("./routes/documentos");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalhost = !origin || /^http:\/\/localhost:\d+$/.test(origin);
      const isConfiguredFrontend = origin && origin === process.env.FRONTEND_URL;
      if (isLocalhost || isConfiguredFrontend) {
        return callback(null, true);
      }
      callback(new Error("No permitido por CORS"));
    },
  })
);
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "RAG Assistant API funcionando" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/documentos", documentoRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Error interno del servidor" });
});

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`Servidor de RAG Assistant corriendo en el puerto ${PORT}`);
});
