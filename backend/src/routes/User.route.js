import { Router } from 'express';
import { UserController } from '../controllers/User.controller.js';
import { auth } from '../middlewares/auth.js';
import apiResponse from '../utils/api-response.js';

const router = Router();
const userController = new UserController();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Busca todos os usuários com filtros opcionais
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *         required: false
 *         description: Se true, inclui usuários inativos
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, technician]
 *         required: false
 *         description: Filtra usuários por role
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtra técnicos por categoria (apenas para role=technician)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UsersFound'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth('admin'), async (req, res) => {
	return await userController.getAll(req, res);
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID único do usuário
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserFound'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/UnauthorizedUserAccess'
 *       404:
 *         $ref: '#/components/responses/NotFoundUser'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', auth(), async (req, res) => {
	if (req.user.role !== 'admin' && Number(req.params.id) !== req.user.id) {
		return apiResponse(
			{
				success: false,
				message: 'You are not authorized to access this resource',
				code: 403,
			},
			res,
		);
	}
	return await userController.getById(req, res);
});

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userCreateSchema'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/UserCreated'
 *       400:
 *         $ref: '#/components/responses/InvalidUserData'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         $ref: '#/components/responses/EmailAlreadyExists'
 *       422:
 *         description: Categorias inválidas ou inativas
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Some categories are invalid or inactive"
 *               code: 422
 *               data: null
 *               errors:
 *                 invalid: [99, 100]
 *                 inactive: [2, 5]
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', auth('admin'), async (req, res) => {
	return await userController.create(req, res);
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userUpdateSchema'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserUpdated'
 *       400:
 *         $ref: '#/components/responses/InvalidUserData'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/UnauthorizedUserAccess'
 *       404:
 *         $ref: '#/components/responses/NotFoundUser'
 *       409:
 *         $ref: '#/components/responses/EmailAlreadyExists'
 *       422:
 *         description: Categorias inválidas ou inativas
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Some categories are invalid or inactive"
 *               code: 422
 *               data: null
 *               errors:
 *                 invalid: [99, 100]
 *                 inactive: [2, 5]
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', auth('admin'), async (req, res) => {
	if (req.user.role !== 'admin' && Number(req.params.id) !== req.user.id) {
		return apiResponse(
			{
				success: false,
				message: 'You are not authorized to access this resource',
				code: 403,
			},
			res,
		);
	}
	return await userController.update(req, res);
});

/**
 * @openapi
 * /users/{id}/activate:
 *   patch:
 *     summary: Ativa um usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserActivated'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundUser'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/activate', auth('admin'), async (req, res) => {
	return await userController.activate(req, res);
});

/**
 * @openapi
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Desativa um usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserDeactivated'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundUser'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/deactivate', auth('admin'), async (req, res) => {
	return await userController.deactivate(req, res);
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserDeleted'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundUser'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', auth('admin'), async (req, res) => {
	return await userController.delete(req, res);
});

export default router;
