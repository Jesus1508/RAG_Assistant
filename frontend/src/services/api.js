import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4003/api",
});

export const preguntar = async (pregunta) => {
  const { data } = await api.post("/chat", { pregunta });
  return data.data;
};

export const listarDocumentos = async () => {
  const { data } = await api.get("/documentos");
  return data.data;
};

export default api;
