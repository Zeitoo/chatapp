// src/routes/pedido.routes.ts
import { Router } from 'express';
import { PedidoController } from '../controllers/pedido.controller';

const router = Router();

router.delete('/', PedidoController.deletePedido);

export default router;