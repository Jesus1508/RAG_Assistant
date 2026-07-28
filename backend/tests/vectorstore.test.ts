import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { existsSyncMock, readFileSyncMock } = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
}));

vi.mock("node:fs", () => ({
  default: {
    existsSync: existsSyncMock,
    readFileSync: readFileSyncMock,
  },
}));

import { buscar, listarDocumentos, similitudCoseno, _resetCacheForTests } from "../src/services/vectorstore";

const fixture = [
  { id: 1, documento: "a.md", fragmento: "Contenido A", embedding: [1, 0, 0] },
  { id: 2, documento: "b.md", fragmento: "Contenido B", embedding: [0, 1, 0] },
  { id: 3, documento: "c.md", fragmento: "Contenido C", embedding: [1, 1, 0] },
];

beforeEach(() => {
  _resetCacheForTests();
  existsSyncMock.mockReset().mockReturnValue(true);
  readFileSyncMock.mockReset().mockReturnValue(JSON.stringify(fixture));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("similitudCoseno", () => {
  it("devuelve 1 para vectores idénticos", () => {
    expect(similitudCoseno([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it("devuelve 0 para vectores ortogonales", () => {
    expect(similitudCoseno([1, 0], [0, 1])).toBeCloseTo(0);
  });
});

describe("buscar", () => {
  it("ordena los fragmentos por similitud descendente y no filtra el embedding crudo", () => {
    const resultados = buscar([1, 0, 0], 2);

    expect(resultados).toHaveLength(2);
    expect(resultados[0].documento).toBe("a.md");
    expect(resultados[0].similitud).toBeCloseTo(1);
    expect(resultados[1].documento).toBe("c.md");
    expect(resultados[1]).not.toHaveProperty("embedding");
  });

  it("lanza un error claro si no existe el vectorstore aún", () => {
    existsSyncMock.mockReturnValue(false);
    expect(() => buscar([1, 0, 0])).toThrow(/npm run ingest/);
  });
});

describe("listarDocumentos", () => {
  it("devuelve los nombres de documento sin duplicados", () => {
    expect(listarDocumentos()).toEqual(["a.md", "b.md", "c.md"]);
  });
});
