import type { Request, Response } from "express";
import { listarDocumentos } from "../services/vectorstore";

export const listar = (req: Request, res: Response): void => {
  try {
    res.json({ success: true, data: listarDocumentos() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ success: false, message: "Error al listar documentos", error: message });
  }
};
