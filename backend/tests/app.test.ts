import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const { embedMock, generarMock, buscarMock } = vi.hoisted(() => ({
  embedMock: vi.fn(),
  generarMock: vi.fn(),
  buscarMock: vi.fn(),
}));

vi.mock("../src/services/ollama", () => ({
  embed: embedMock,
  generar: generarMock,
}));

vi.mock("../src/services/vectorstore", () => ({
  buscar: buscarMock,
  listarDocumentos: vi.fn(() => ["a.md", "b.md"]),
}));

import app from "../src/app";

beforeEach(() => {
  embedMock.mockReset().mockResolvedValue([1, 0, 0]);
  generarMock.mockReset().mockResolvedValue("  Respuesta generada por el modelo.  ");
  buscarMock.mockReset();
});

describe("GET /api/health", () => {
  it("responde 200 con success true", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "RAG Assistant API funcionando" });
  });
});

describe("POST /api/chat", () => {
  it("rechaza una pregunta vacía con 400", async () => {
    const res = await request(app).post("/api/chat").send({ pregunta: "" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("responde con la respuesta generada y las fuentes cuando hay contexto relevante", async () => {
    buscarMock.mockReturnValue([
      { id: 1, documento: "politica-vacaciones.md", fragmento: "Texto de ejemplo", similitud: 0.87654 },
    ]);

    const res = await request(app).post("/api/chat").send({ pregunta: "¿Cuántos días de vacaciones tengo?" });

    expect(res.status).toBe(200);
    expect(res.body.data.respuesta).toBe("Respuesta generada por el modelo.");
    expect(res.body.data.fuentes).toEqual([
      { documento: "politica-vacaciones.md", fragmento: "Texto de ejemplo", similitud: 0.877 },
    ]);
    expect(generarMock).toHaveBeenCalledTimes(1);
  });

  it("no alucina y evita llamar al modelo de generación cuando no hay fragmentos relevantes", async () => {
    buscarMock.mockReturnValue([]);

    const res = await request(app).post("/api/chat").send({ pregunta: "¿Cuál es la capital de la Luna?" });

    expect(res.status).toBe(200);
    expect(res.body.data.fuentes).toEqual([]);
    expect(res.body.data.respuesta).toMatch(/no hay documentos indexados/i);
    expect(generarMock).not.toHaveBeenCalled();
  });
});
