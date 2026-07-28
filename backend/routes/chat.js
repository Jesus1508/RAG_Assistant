const express = require("express");
const { body } = require("express-validator");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post(
  "/",
  [body("pregunta").notEmpty().withMessage("La pregunta es requerida")],
  chatController.chat
);

module.exports = router;
