import { Ticket } from '../models/Ticket.model.js';
import { ZodError } from 'zod';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';
import {
	createTicketSchema,
	updateTicketSchema,
	updateStatusSchema,
	assignTechnicianSchema,
	findAllTicketSchema,
} from '../schemas/ticket.schema.js';
import { idSchema } from '../schemas/generic.schema.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Notebook não liga"
 *         description:
 *           type: string
 *           example: "O notebook não está ligando após atualização do sistema"
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *           example: "pending"
 *         started_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-09-03T14:30:00.000Z"
 *         closed_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-09-04T16:45:00.000Z"
 *         duration_seconds:
 *           type: integer
 *           nullable: true
 *           example: 8100
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-02T09:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-03T12:15:00.000Z"
 *         technician_id:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         user_id:
 *           type: integer
 *           example: 1
 *         User:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "João Silva"
 *             email:
 *               type: string
 *               example: "joao.silva@empresa.com"
 *         Technician:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *               example: 2
 *             name:
 *               type: string
 *               example: "Maria Santos"
 *             email:
 *               type: string
 *               example: "maria.santos@empresa.com"
 *         Category:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             title:
 *               type: string
 *               example: "Hardware"
 *         Patrimony:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             code:
 *               type: string
 *               example: "PAT-0001"
 *             name:
 *               type: string
 *               example: "Notebook Dell"
 *             description:
 *               type: string
 *               example: "Notebook da equipe de desenvolvimento"
 *
 *   examples:
 *     TicketValidationErrors:
 *       summary: Erro de validação dos dados do ticket
 *       value:
 *         success: false
 *         message: "Invalid request data"
 *         code: 400
 *         data: null
 *         errors:
 *           - path: ["title"]
 *             message: "Title cannot be empty"
 *             expected: undefined
 *
 *     DuplicatedTicket:
 *       summary: Ticket duplicado para o mesmo patrimônio
 *       value:
 *         success: false
 *         message: "A ticket with the same patrimony already exists"
 *         code: 409
 *         data: null
 *
 *     ForbiddenTicketAccess:
 *       summary: Usuário sem permissão para acessar este ticket
 *       value:
 *         success: false
 *         message: "You do not have permission to view this ticket"
 *         code: 403
 *         data: null
 *
 *     ForbiddenTechnicianCategory:
 *       summary: Técnico não autorizado para esta categoria
 *       value:
 *         success: false
 *         message: "Technician is not allowed to handle this ticket category"
 *         code: 403
 *         data: null
 *
 *   responses:
 *     TicketsFound:
 *       description: Lista de tickets encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Tickets found successfully"
 *             code: 200
 *             data:
 *               - id: 1
 *                 title: "Notebook não liga"
 *                 description: "O notebook não está ligando"
 *                 status: "pending"
 *                 started_at: null
 *                 closed_at: null
 *                 duration_seconds: null
 *                 created_at: "2025-09-02T09:00:00.000Z"
 *                 updated_at: "2025-09-03T12:15:00.000Z"
 *                 technician_id: null
 *                 user_id: 1
 *                 User:
 *                   id: 1
 *                   name: "João Silva"
 *                   email: "joao.silva@empresa.com"
 *                 Technician: null
 *                 Category:
 *                   id: 1
 *                   title: "Hardware"
 *                 Patrimony:
 *                   id: 1
 *                   code: "PAT-0001"
 *                   name: "Notebook Dell"
 *                   description: "Notebook da equipe"
 *
 *     TicketFound:
 *       description: Ticket encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Ticket find successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "Notebook não liga"
 *               description: "O notebook não está ligando"
 *               status: "in_progress"
 *               started_at: "2025-09-03T14:30:00.000Z"
 *               closed_at: null
 *               duration_seconds: null
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-03T12:15:00.000Z"
 *               technician_id: 2
 *               user_id: 1
 *               User:
 *                 id: 1
 *                 name: "João Silva"
 *                 email: "joao.silva@empresa.com"
 *               Technician:
 *                 id: 2
 *                 name: "Maria Santos"
 *                 email: "maria.santos@empresa.com"
 *               Category:
 *                 id: 1
 *                 title: "Hardware"
 *               Patrimony:
 *                 id: 1
 *                 code: "PAT-0001"
 *                 name: "Notebook Dell"
 *                 description: "Notebook da equipe"
 *
 *     TicketCreated:
 *       description: Ticket criado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Ticket created successfully"
 *             code: 201
 *             data:
 *               id: 3
 *               title: "Mouse não funciona"
 *               description: "Mouse óptico parou de funcionar"
 *               status: "pending"
 *               started_at: null
 *               closed_at: null
 *               duration_seconds: null
 *               created_at: "2025-09-04T08:00:00.000Z"
 *               updated_at: "2025-09-04T08:00:00.000Z"
 *               technician_id: null
 *               user_id: 1
 *
 *     TicketUpdated:
 *       description: Ticket atualizado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Ticket updated successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "Notebook Dell não liga - Atualizado"
 *               description: "Descrição atualizada do problema"
 *               status: "pending"
 *               started_at: null
 *               closed_at: null
 *               duration_seconds: null
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-05T10:00:00.000Z"
 *
 *     TicketDeleted:
 *       description: Ticket deletado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Ticket deleted successfully"
 *             code: 200
 *             data: null
 *
 *     TicketStatusUpdated:
 *       description: Status do ticket atualizado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Ticket status updated successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "Notebook não liga"
 *               status: "completed"
 *               started_at: "2025-09-03T14:30:00.000Z"
 *               closed_at: "2025-09-04T16:45:00.000Z"
 *               duration_seconds: 8100
 *
 *     TechnicianAssigned:
 *       description: Técnico atribuído com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Technician assigned successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               title: "Notebook não liga"
 *               status: "in_progress"
 *               technician_id: 2
 *               started_at: "2025-09-04T09:00:00.000Z"
 *
 *     NotFoundTicket:
 *       description: Ticket não encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Ticket not found"
 *             code: 404
 *             data: null
 *
 *     NotFoundPatrimony:
 *       description: Patrimônio não encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Patrimony not found"
 *             code: 404
 *             data: null
 *
 *     NotFoundCategory:
 *       description: Categoria não encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Category not found"
 *             code: 404
 *             data: null
 *
 *     NotFoundTechnician:
 *       description: Técnico não encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Technician not found"
 *             code: 404
 *             data: null
 *
 *     InvalidTicketRequest:
 *       description: Erro de validação dos dados do ticket
 *       content:
 *         application/json:
 *           examples:
 *             validationErrors:
 *               $ref: '#/components/examples/TicketValidationErrors'
 *             duplicatedTicket:
 *               $ref: '#/components/examples/DuplicatedTicket'
 *             forbiddenAccess:
 *               $ref: '#/components/examples/ForbiddenTicketAccess'
 *             forbiddenCategory:
 *               $ref: '#/components/examples/ForbiddenTechnicianCategory'
 */
export class TicketController {
	constructor() {}

	async create(req, res) {
		try {
			const { id } = req.user;
			const parsed_data = createTicketSchema.parse(req.body);
			parsed_data.user_id = id;

			const ticket = await Ticket.create(parsed_data);
			return apiResponse(
				{
					success: true,
					message: 'Ticket created successfully',
					data: ticket,
					code: 201,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'PATRIMONY_NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony not found',
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'CATEGORY_NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Category not found',
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'DUPLICATED_TICKET') {
				return apiResponse(
					{
						success: false,
						message:
							'A ticket with the same patrimony already exists',
						code: 409,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async findAll(req, res) {
		try {
			const { id, role } = req.user;
			const {
				category_id,
				patrimony_code,
				status,
				technician_id,
				created_after,
				created_before,
			} = findAllTicketSchema.parse(req.query);

			const tickets = await Ticket.findAll(
				{ user_id: id, role },
				{
					category_id,
					patrimony_code,
					status,
					technician_id,
					created_after,
					created_before,
				},
			);

			return apiResponse(
				{
					success: true,
					message: 'Tickets found successfully',
					data: tickets,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony not found',
						code: 404,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async findById(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			const ticket = await Ticket.findById({
				ticket_id: parsed_id,
				user_id: req.user.id,
				role: req.user.role,
			});

			return apiResponse(
				{
					success: true,
					message: 'Ticket find successfully',
					data: ticket,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Ticket not found',
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						success: false,
						message:
							'You do not have permission to view this ticket',
						code: 403,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async update(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			const parsed_data = updateTicketSchema.parse(req.body);

			const ticket = await Ticket.update({
				ticket_id: parsed_id,
				data: parsed_data,
				role: req.user.role,
			});

			return apiResponse(
				{
					success: true,
					message: 'Ticket updated successfully',
					data: ticket,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						success: false,
						message:
							'You do not have permission to update this ticket',
						code: 403,
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Ticket not found',
						code: 404,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async delete(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			await Ticket.delete({ ticket_id: parsed_id });

			return apiResponse(
				{
					success: true,
					message: 'Ticket deleted successfully',
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Ticket not found',
						code: 404,
					},
					res,
				);
			}

			return apiResponse(
				{
					code: 500,
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
				},
				res,
			);
		}
	}

	async updateStatus(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);
			const { status } = updateStatusSchema.parse(req.body);

			const ticketInstance = new Ticket({ id: parsed_id });
			const updated = await ticketInstance.updateStatus({
				status,
				user_id: req.user.id,
				role: req.user.role,
			});

			return apiResponse(
				{
					success: true,
					message: 'Ticket status updated successfully',
					data: updated,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError)
				return apiResponse(
					{
						success: false,
						message: 'Invalid status',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			if (error.message === 'NOT_FOUND')
				return apiResponse(
					{ success: false, message: 'Ticket not found', code: 404 },
					res,
				);
			if (error.message === 'FORBIDDEN')
				return apiResponse(
					{
						success: false,
						message:
							'You do not have permission to change this ticket status',
						code: 403,
					},
					res,
				);
			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async assignTechnician(req, res) {
		try {
			const parsed_id = idSchema.parse(req.params.id);

			let technician_id =
				req.user.role === 'admin'
					? assignTechnicianSchema.parse(req.body).technician_id
					: req.user.id;

			const ticket = new Ticket({ id: parsed_id });
			const updated = await ticket.assignTechnician({
				technician_id,
				role: req.user.role,
				user_id: req.user.id,
			});

			return apiResponse(
				{
					success: true,
					message: 'Technician assigned successfully',
					data: updated,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						success: false,
						message:
							'You do not have permission to assign technician',
						errors: error.message,
						code: 403,
					},
					res,
				);
			}

			if (error.message === 'TICKET_NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Ticket not found',
						errors: error.message,
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'TECHNICIAN_NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Technician not found',
						errors: error.message,
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'FORBIDDEN_CATEGORY') {
				return apiResponse(
					{
						success: false,
						message:
							'Technician is not allowed to handle this ticket category',
						errors: error.message,
						code: 403,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}
}
