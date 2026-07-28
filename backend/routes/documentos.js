const express = require("express");
const documentoController = require("../controllers/documentoController");

const router = express.Router();

router.get("/", documentoController.listar);

module.exports = router;
