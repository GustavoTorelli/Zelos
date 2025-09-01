import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/loginSchema'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/LoginSuccess'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccountInactive'
 *       404:
 *         $ref: '#/components/responses/NotFoundUser'
 */
router.post('/login', async (req, res) => {
	return await authController.login(req, res);
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Realiza logout (limpa cookie JWT)
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
router.post('/logout', async (req, res) => {
	return await authController.logout(req, res);
});

/**
 * @openapi
 * /auth/password-recovery:
 *   post:
 *     summary: Envia e-mail de recuperação de senha
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/passwordRecoverySchema'
 *     responses:
 *       200:
 *         description: E-mail de recuperação enviado
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       404:
 *         $ref: '#/components/responses/NotFoundUser'
 *       403:
 *         $ref: '#/components/responses/AccountInactive'
 */
router.post('/password-recovery', async (req, res) => {
	return await authController.passwordRecovery(req, res);
});

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reseta a senha do usuário usando token de recuperação
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de reset recebido por e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewPass123!
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token is invalid or has expired
 */
router.post('/reset-password', async (req, res) => {
	return await authController.resetPassword(req, res);
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retorna informações do usuário autenticado
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     role:
 *                       type: string
 *                       example: admin
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', auth(), async (req, res) => {
	return await authController.me(req, res);
});

export default router;
