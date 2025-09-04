import { Router } from 'express';
import { TicketController } from '../controllers/Ticket.controller.js';
import { WorklogController } from '../controllers/Worklog.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const ticketController = new TicketController();
const worklogController = new WorklogController();

/**
 * @openapi
 * /tickets:
 *   get:
 *     summary: Busca todos os tickets com filtros opcionais
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         required: false
 *         description: Filtrar tickets por status
 *       - in: query
 *         name: technician_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar tickets por técnico
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar tickets por categoria
 *       - in: query
 *         name: patrimony_code
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar tickets por código do patrimônio
 *       - in: query
 *         name: created_after
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Filtrar tickets criados após esta data
 *       - in: query
 *         name: created_before
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Filtrar tickets criados antes desta data
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TicketsFound'
 *       400:
 *         $ref: '#/components/responses/InvalidTicketRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundPatrimony'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth(), async (req, res) => {
	return await ticketController.findAll(req, res);
});

/**
 * @openapi
 * /tickets/{id}:
 *   get:
 *     summary: Busca um ticket pelo ID
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID único do ticket
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TicketFound'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundTicket'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', auth(), async (req, res) => {
	return await ticketController.findById(req, res);
});

/**
 * @openapi
 * /tickets:
 *   post:
 *     summary: Cria um novo ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createTicketSchema'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/TicketCreated'
 *       400:
 *         $ref: '#/components/responses/InvalidTicketRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Patrimônio ou categoria não encontrados
 *         content:
 *           application/json:
 *             examples:
 *               patrimonyNotFound:
 *                 $ref: '#/components/responses/NotFoundPatrimony'
 *               categoryNotFound:
 *                 $ref: '#/components/responses/NotFoundCategory'
 *       409:
 *         description: Ticket duplicado para o mesmo patrimônio
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "A ticket with the same patrimony already exists"
 *               code: 409
 *               data: null
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', auth(), async (req, res) => {
	return await ticketController.create(req, res);
});

/**
 * @openapi
 * /tickets/{id}:
 *   put:
 *     summary: Atualiza um ticket existente
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateTicketSchema'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TicketUpdated'
 *       400:
 *         $ref: '#/components/responses/InvalidTicketRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundTicket'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', auth(), async (req, res) => {
	return await ticketController.update(req, res);
});

/**
 * @openapi
 * /tickets/{id}:
 *   delete:
 *     summary: Remove um ticket (apenas admin)
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do ticket
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TicketDeleted'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundTicket'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', auth(['admin']), async (req, res) => {
	return await ticketController.delete(req, res);
});

/**
 * @openapi
 * /tickets/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateStatusSchema'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TicketStatusUpdated'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundTicket'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/status', auth(['admin', 'technician']), async (req, res) => {
	return await ticketController.updateStatus(req, res);
});

/**
 * @openapi
 * /tickets/{id}/assign:
 *   patch:
 *     summary: Atribui um técnico ao ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/assignTechnicianSchema'
 *           description: Para técnicos, atribui automaticamente a si próprio (ignora o body)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TechnicianAssigned'
 *       400:
 *         $ref: '#/components/responses/InvalidTicketRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Técnico não autorizado para esta categoria ou sem permissão
 *         content:
 *           application/json:
 *             examples:
 *               forbiddenCategory:
 *                 value:
 *                   success: false
 *                   message: "Technician is not allowed to handle this ticket category"
 *                   code: 403
 *                   data: null
 *               forbidden:
 *                 value:
 *                   success: false
 *                   message: "You do not have permission to assign technician"
 *                   code: 403
 *                   data: null
 *       404:
 *         description: Ticket ou técnico não encontrado
 *         content:
 *           application/json:
 *             examples:
 *               ticketNotFound:
 *                 value:
 *                   success: false
 *                   message: "Ticket not found"
 *                   code: 404
 *                   data: null
 *               technicianNotFound:
 *                 value:
 *                   success: false
 *                   message: "Technician not found"
 *                   code: 404
 *                   data: null
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/assign', auth(['admin', 'technician']), async (req, res) => {
	return await ticketController.assignTechnician(req, res);
});

/**
 * @openapi
 * /tickets/{ticket_id}/worklogs:
 *   get:
 *     summary: Busca todos os worklogs de um ticket
 *     tags:
 *       - Worklogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do ticket
 *       - in: query
 *         name: technician_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar worklogs por técnico
 *     responses:
 *       200:
 *         $ref: '#/components/responses/WorklogsFound'
 *       400:
 *         $ref: '#/components/responses/InvalidWorklogRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:ticket_id/worklogs', auth(), (req, res) => {
	return worklogController.findAll(req, res);
});

/**
 * @openapi
 * /tickets/{ticket_id}/worklogs/{id}:
 *   get:
 *     summary: Busca um worklog específico de um ticket
 *     tags:
 *       - Worklogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do ticket
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do worklog
 *     responses:
 *       200:
 *         $ref: '#/components/responses/WorklogFound'
 *       400:
 *         $ref: '#/components/responses/InvalidRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Worklog não pertence ao ticket ou usuário sem permissão
 *         content:
 *           application/json:
 *             examples:
 *               invalidTicket:
 *                 $ref: '#/components/responses/InvalidWorklogTicket'
 *               forbidden:
 *                 value:
 *                   success: false
 *                   message: "You are not the technician of this worklog"
 *                   code: 403
 *                   data: null
 *       404:
 *         $ref: '#/components/responses/NotFoundWorklog'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:ticket_id/worklogs/:id', auth(), (req, res) => {
	return worklogController.findById(req, res);
});

/**
 * @openapi
 * /tickets/{ticket_id}/worklogs:
 *   post:
 *     summary: Cria um novo worklog para um ticket
 *     tags:
 *       - Worklogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 example: "Realizei diagnóstico inicial. Identificado problema na fonte de alimentação."
 *             required:
 *               - description
 *     responses:
 *       201:
 *         $ref: '#/components/responses/WorklogCreated'
 *       400:
 *         $ref: '#/components/responses/InvalidWorklogRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Ticket não está em progresso ou usuário não é o técnico
 *         content:
 *           application/json:
 *             examples:
 *               ticketNotInProgress:
 *                 value:
 *                   success: false
 *                   message: "Ticket is not in progress"
 *                   code: 403
 *                   data: null
 *               notAssignedTechnician:
 *                 value:
 *                   success: false
 *                   message: "You are not the technician of this ticket"
 *                   code: 403
 *                   data: null
 *       404:
 *         description: Ticket não encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Ticket not found"
 *               code: 404
 *               data: null
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
	'/:ticket_id/worklogs',
	auth(['admin', 'technician']),
	(req, res) => {
		return worklogController.create(req, res);
	},
);

export default router;
