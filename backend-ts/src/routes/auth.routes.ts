// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.get("/refresh", AuthController.refresh);

export default router;
