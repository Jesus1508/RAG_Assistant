import { Router } from "express";
import { body } from "express-validator";
import { chat } from "../controllers/chatController";

const router = Router();

router.post("/", [body("pregunta").notEmpty().withMessage("La pregunta es requerida")], chat);

export default router;
