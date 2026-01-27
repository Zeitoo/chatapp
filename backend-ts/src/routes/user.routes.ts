// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.get('/search/:user_name', verifyAuth ,UserController.searchByName);
router.post('/', UserController.getUsersByIds);

export default router;