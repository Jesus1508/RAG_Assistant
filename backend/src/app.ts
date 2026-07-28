import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import chatRoutes from "./routes/chat";
import documentoRoutes from "./routes/documentos";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalhost = !origin || /^http:\/\/localhost:\d+$/.test(origin);
      const isConfiguredFrontend = Boolean(origin && origin === process.env.FRONTEND_URL);
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

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ success: true, message: "RAG Assistant API funcionando" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/documentos", documentoRoutes);

app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Error interno del servidor" });
});

export default app;
