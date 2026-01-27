// src/routes/chat.routes.ts
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { verifyAuth } from '../middleware';

const router = Router();

router.post('/',verifyAuth ,ChatController.getChats);
router.put('/new_chat' ,verifyAuth,ChatController.newChat);

export default router;