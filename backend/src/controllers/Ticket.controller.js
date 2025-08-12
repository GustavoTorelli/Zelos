import { Ticket } from '../models/Ticket.model.js';
import { ZodError } from 'zod';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';
import { createTicket } from '../schemas/ticket.schema.js';

export class TicketController {
	constructor() {}

	async create(req, res) {
		try {
			const parsedData = createTicket.parse(req.body);

			const ticket = await Ticket.create(parsedData);
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
					errors: error.errors,
					code: 500,
				},
				res,
			);
		}
	}

	async findAll(req, res) {
		try {
			const { id, role } = req.user;
			const { categoryId, patrimonyId } = req.query;

			const tickets = await Ticket.findAll(
				{ userId: id, role },
				{
					categoryId,
					patrimonyId,
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
