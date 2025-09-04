import { Worklog } from '../models/Worklog.model.js';
import {
	createWorklogSchema,
	findAllWorklogSchema,
} from '../schemas/worklog.schema.js';
import { idSchema } from '../schemas/generic.schema.js';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';
import { ZodError } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     Worklog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         description:
 *           type: string
 *           example: "Realizei diagnóstico inicial. Identificado problema na fonte de alimentação."
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-03T15:30:00.000Z"
 *         technician_id:
 *           type: integer
 *           example: 2
 *         ticket_id:
 *           type: integer
 *           example: 1
 *         Technician:
 *           type: object
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
 *         Ticket:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             title:
 *               type: string
 *               example: "Notebook não liga"
 *             status:
 *               type: string
 *               example: "in_progress"
 *             user_id:
 *               type: integer
 *               example: 1
 *             technician_id:
 *               type: integer
 *               example: 2
 *
 *   examples:
 *     WorklogValidationErrors:
 *       summary: Erro de validação dos dados do worklog
 *       value:
 *         success: false
 *         message: "Invalid request data"
 *         code: 400
 *         data: null
 *         errors:
 *           - path: ["description"]
 *             message: "Description cannot be empty"
 *             expected: undefined
 *
 *     TicketNotInProgress:
 *       summary: Ticket não está em progresso
 *       value:
 *         success: false
 *         message: "Ticket is not in progress"
 *         code: 403
 *         data: null
 *
 *     NotAssignedTechnician:
 *       summary: Usuário não é o técnico responsável
 *       value:
 *         success: false
 *         message: "You are not the technician of this ticket"
 *         code: 403
 *         data: null
 *
 *   responses:
 *     WorklogsFound:
 *       description: Lista de worklogs encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Worklogs found successfully"
 *             code: 200
 *             data:
 *               - id: 1
 *                 description: "Realizei diagnóstico inicial"
 *                 created_at: "2025-09-03T15:30:00.000Z"
 *                 technician_id: 2
 *                 ticket_id: 1
 *                 Technician:
 *                   id: 2
 *                   name: "Maria Santos"
 *                   email: "maria.santos@empresa.com"
 *                 Ticket:
 *                   id: 1
 *                   title: "Notebook não liga"
 *                   status: "in_progress"
 *                   user_id: 1
 *                   technician_id: 2
 *
 *     WorklogFound:
 *       description: Worklog encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Worklog found successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               description: "Realizei diagnóstico inicial. Problema identificado."
 *               created_at: "2025-09-03T15:30:00.000Z"
 *               technician_id: 2
 *               ticket_id: 1
 *               Technician:
 *                 id: 2
 *                 name: "Maria Santos"
 *                 email: "maria.santos@empresa.com"
 *               Ticket:
 *                 id: 1
 *                 title: "Notebook não liga"
 *                 status: "in_progress"
 *                 user_id: 1
 *                 technician_id: 2
 *
 *     WorklogCreated:
 *       description: Worklog criado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Worklog created successfully"
 *             code: 201
 *             data:
 *               id: 3
 *               description: "Substituí a fonte de alimentação. Problema resolvido."
 *               created_at: "2025-09-04T10:15:00.000Z"
 *               technician_id: 2
 *               ticket_id: 1
 *               Technician:
 *                 id: 2
 *                 name: "Maria Santos"
 *                 email: "maria.santos@empresa.com"
 *               Ticket:
 *                 id: 1
 *                 title: "Notebook não liga"
 *                 status: "in_progress"
 *                 user_id: 1
 *                 technician_id: 2
 *
 *     NotFoundWorklog:
 *       description: Worklog não encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Worklog not found"
 *             code: 404
 *             data: null
 *
 *     InvalidWorklogTicket:
 *       description: Worklog não pertence a este ticket
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Worklog does not belong to this ticket"
 *             code: 403
 *             data: null
 *
 *     InvalidWorklogRequest:
 *       description: Erro de validação dos dados do worklog
 *       content:
 *         application/json:
 *           examples:
 *             validationErrors:
 *               $ref: '#/components/examples/WorklogValidationErrors'
 *             ticketNotInProgress:
 *               $ref: '#/components/examples/TicketNotInProgress'
 *             notAssignedTechnician:
 *               $ref: '#/components/examples/NotAssignedTechnician'
 */
export class WorklogController {
	constructor() {}

	async create(req, res) {
		try {
			const parsedData = createWorklogSchema.parse({
				ticket_id: req.params.ticket_id,
				...req.body,
			});

			const worklog = await Worklog.create({
				...parsedData,
				technician_id: req.user.id,
				role: req.user.role,
			});

			return apiResponse(
				{
					success: true,
					message: 'Worklog created successfully',
					data: worklog,
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

			if (error.message === 'FORBIDDEN_STATUS') {
				return apiResponse(
					{
						success: false,
						message: 'Ticket is not in progress',
						code: 403,
					},
					res,
				);
			}

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						success: false,
						message: 'You are not the technician of this ticket',
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

	async findAll(req, res) {
		try {
			const parsedData = findAllWorklogSchema.parse({
				ticketId: req.params.ticket_id,
				technicianId: req.query.technician_id,
			});

			const worklogs = await Worklog.findAll(parsedData);

			return apiResponse(
				{
					success: true,
					message: 'Worklogs found successfully',
					data: worklogs,
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
			const parsedId = idSchema.parse(req.params.id);

			const worklog = await Worklog.findById({
				worklogId: parsedId,
				userId: req.user.id,
				role: req.user.role,
			});

			return apiResponse(
				{
					success: true,
					message: 'Worklog found successfully',
					data: worklog,
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
						message: 'Worklog not found',
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'INVALID_TICKET') {
				return apiResponse(
					{
						success: false,
						message: 'Worklog does not belong to this ticket',
						code: 403,
					},
					res,
				);
			}

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						success: false,
						message: 'You are not the technician of this worklog',
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
