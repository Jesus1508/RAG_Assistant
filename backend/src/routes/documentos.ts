import { Router } from "express";
import { listar } from "../controllers/documentoController";

const router = Router();

router.get("/", listar);

export default router;
