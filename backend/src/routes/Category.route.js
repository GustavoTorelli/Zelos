import { Router } from 'express';
import { CategoryController } from '../controllers/Category.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const categoryController = new CategoryController();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Se true, inclui categorias inativas
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoriesFound'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth(), async (req, res) => {
	return await categoryController.findAll(req, res);
});

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoryFound'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundCategory'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', auth(), async (req, res) => {
	return await categoryController.findById(req, res);
});

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createCategorySchema'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CategoryCreated'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         $ref: '#/components/responses/AlreadyExists'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', auth('admin'), async (req, res) => {
	return await categoryController.create(req, res);
});

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateCategorySchema'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoryUpdated'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundCategory'
 *       409:
 *         $ref: '#/components/responses/AlreadyExists'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', auth('admin'), async (req, res) => {
	return await categoryController.update(req, res);
});

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Exclui uma categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoryDeleted'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundCategory'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', auth('admin'), async (req, res) => {
	return await categoryController.delete(req, res);
});

/**
 * @openapi
 * /categories/{id}/activate:
 *   patch:
 *     summary: Ativa uma categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoryActivated'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundCategory'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/activate', auth('admin'), async (req, res) => {
	return await categoryController.activate(req, res);
});

/**
 * @openapi
 * /categories/{id}/deactivate:
 *   patch:
 *     summary: Desativa uma categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoryDeactivated'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundCategory'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/deactivate', auth('admin'), async (req, res) => {
	return await categoryController.deactivate(req, res);
});

export default router;
