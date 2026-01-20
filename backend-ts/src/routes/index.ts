// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import userRoutes from './user.routes';
import pedidoRoutes from './pedido.routes';

const router = Router();

// Prefixa todas as rotas com /api
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/users', userRoutes);
router.use('/pedidos', pedidoRoutes);

export default router;