import { Router } from 'express';
import { login, refresh, logout, changePassword, updateMe, getMe } from '../controllers/authController';
import { jwtAuth } from '../middlewares/jwtAuth';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/change-password', jwtAuth, changePassword);
router.patch('/me', jwtAuth, updateMe);
router.get('/me', jwtAuth, getMe);

export default router;