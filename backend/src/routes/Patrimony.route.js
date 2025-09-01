import { Router } from 'express';
import { PatrimonyController } from '../controllers/Patrimony.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const patrimonyController = new PatrimonyController();

/**
 * @openapi
 * /patrimonies:
 *   get:
 *     summary: Busca todos os patrimônios (filtro opcional)
 *     tags:
 *       - Patrimonies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *           default: false
 *         required: false
 *         description: Se true, inclui patrimônios inativos
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Termo de busca (name, location, code, description)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PatrimoniesFound'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth(), async (req, res) => {
	return await patrimonyController.findAll(req, res);
});

/**
 * @openapi
 * /patrimonies/{code}:
 *   get:
 *     summary: Busca um patrimônio pelo código
 *     tags:
 *       - Patrimonies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Código único do patrimônio
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PatrimonyFound'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundPatrimony'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:code', auth(), async (req, res) => {
	return await patrimonyController.findByCode(req, res);
});

/**
 * @openapi
 * /patrimonies:
 *   post:
 *     summary: Cria um novo patrimônio
 *     tags:
 *       - Patrimonies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createPatrimonySchema'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/PatrimonyCreated'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         $ref: '#/components/responses/CodeAlreadyExists'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', auth('admin'), async (req, res) => {
	return await patrimonyController.create(req, res);
});

/**
 * @openapi
 * /patrimonies/batch:
 *   post:
 *     summary: Cria múltiplos patrimônios em lote
 *     tags:
 *       - Patrimonies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createManyPatrimoniesSchema'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/PatrimoniesCreated'
 *       400:
 *         description: Erros de validação ou códigos duplicados
 *         content:
 *           application/json:
 *             examples:
 *               validationErrors:
 *                 $ref: '#/components/examples/ValidationErrors'
 *               duplicateCodes:
 *                 $ref: '#/components/examples/DuplicateCodes'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         $ref: '#/components/responses/CodesAlreadyExist'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/batch', auth('admin'), async (req, res) => {
	return await patrimonyController.createMany(req, res);
});

/**
 * @openapi
 * /patrimonies/{code}:
 *   put:
 *     summary: Atualiza um patrimônio existente (por código)
 *     tags:
 *       - Patrimonies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Código do patrimônio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updatePatrimonySchema'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PatrimonyUpdated'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundPatrimony'
 *       409:
 *         $ref: '#/components/responses/CodeAlreadyExists'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:code', auth('admin'), async (req, res) => {
	return await patrimonyController.update(req, res);
});

/**
 * @openapi
 * /patrimonies/{code}:
 *   delete:
 *     summary: Remove um patrimônio (por código)
 *     tags:
 *       - Patrimonies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Código do patrimônio
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PatrimonyDeleted'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundPatrimony'
 *       409:
 *         $ref: '#/components/responses/PatrimonyHasTickets'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:code', auth('admin'), async (req, res) => {
	return await patrimonyController.delete(req, res);
});

export default router;
