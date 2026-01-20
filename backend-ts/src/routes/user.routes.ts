// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.get('/search/:user_name', UserController.searchByName);
router.post('/', UserController.getUsersByIds);
router.get('/status', verifyAuth, UserController.getStatus);

export default router;