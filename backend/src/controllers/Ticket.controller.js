import { Ticket } from '../models/Ticket.model.js';
import { ZodError } from 'zod';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';
import {
	createTicket,
	updateTicket,
	updateStatus,
	assignTechnician,
	findAllTicket,
} from '../schemas/ticket.schema.js';
import { idSchema } from '../schemas/generic.schema.js';

export class TicketController {
	constructor() {}

	async create(req, res) {
		try {
			const { id } = req.user;
			const parsed_data = createTicket.parse(req.body);
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
			} = findAllTicket.parse(req.query);

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
			const parsed_data = updateTicket.parse(req.body);

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
			await Ticket.delete({ ticket_id: parsed_id, role: req.user.role });

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

			if (error.message === 'FORBIDDEN') {
				return apiResponse(
					{
						success: false,
						message:
							'You do not have permission to delete this ticket',
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
			const { status } = updateStatus.parse(req.body);

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
					? assignTechnician.parse(req.body).technician_id
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
