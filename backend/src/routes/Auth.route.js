import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/login', async (req, res) => {
	return await authController.login(req, res);
});

router.post('/logout', async (req, res) => {
	return await authController.logout(req, res);
});

router.post('/password-recovery', async (req, res) => {
	return await authController.passwordRecovery(req, res);
});

router.post('/reset-password', async (req, res) => {
	return await authController.resetPassword(req, res);
});

router.get('/me', auth(), async (req, res) => {
	return await authController.me(req, res);
});

export default router;
