const { listarDocumentos } = require("../services/vectorstore");

exports.listar = (req, res) => {
  try {
    res.json({ success: true, data: listarDocumentos() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar documentos", error: error.message });
  }
};
