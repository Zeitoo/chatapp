// src/routes/pedido.routes.ts
import { Router } from 'express';
import { PedidoController } from '../controllers/pedido.controller';

const router = Router();

router.delete('/', PedidoController.deletePedido);
router.put("/", PedidoController.putPedidoS)

export default router;