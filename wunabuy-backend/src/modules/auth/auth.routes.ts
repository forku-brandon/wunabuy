import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/confirm', authController.resetPasswordConfirm);
router.post('/social', authController.socialLogin);
router.get('/me', authMiddleware, authController.getMe);

export default router;
