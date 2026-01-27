// src/routes/pedido.routes.ts
import { Router } from "express";
import { PedidoController } from "../controllers/pedido.controller";
import { verifyAuth } from "../middleware";

const router = Router();

router.delete("/", verifyAuth, PedidoController.deletePedido);
router.put("/", verifyAuth, PedidoController.putPedidoS);

export default router;
