// src/routes/chat.routes.ts
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();

router.post('/', ChatController.getChats);
router.put('/new_msg', ChatController.newMessage);
router.put('/new_chat', ChatController.newChat);

export default router;