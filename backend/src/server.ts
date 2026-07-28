import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`Servidor de RAG Assistant corriendo en el puerto ${PORT}`);
});
