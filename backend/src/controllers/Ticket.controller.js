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
			const parsedData = createTicket.parse(req.body);
			parsedData.user_id = id;

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
				categoryId,
				patrimonyId,
				status,
				technicianId,
				createdAfter,
				createdBefore,
			} = findAllTicket.parse(req.query);

			const tickets = await Ticket.findAll(
				{ userId: id, role },
				{
					categoryId,
					patrimonyId,
					status,
					technicianId,
					createdAfter,
					createdBefore,
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
			const ticket = await Ticket.findById({
				ticketId: parsedId,
				userId: req.user.id,
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
			const parsedId = idSchema.parse(req.params.id);
			const parsedData = updateTicket.parse(req.body);

			const ticket = await Ticket.update({
				ticketId: parsedId,
				data: parsedData,
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

	async updateStatus(req, res) {
		try {
			const parsedId = idSchema.parse(req.params.id);
			const { status } = updateStatus.parse(req.body);

			const ticketInstance = new Ticket({ id: parsedId });
			const updated = await ticketInstance.updateStatus({
				status,
				userId: req.user.id,
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
			const parsedId = idSchema.parse(req.params.id);
			let technicianId;

			if (req.user.role === 'admin') {
				const { technician_id } = assignTechnician.parse(req.body);
				technicianId = technician_id;
			} else if (req.user.role === 'technician') {
				technicianId = req.user.id;
			}

			const ticket = new Ticket({ id: parsedId });
			const updated = await ticket.assignTechnician({
				technicianId,
				role: req.user.role,
				userId: req.user.id,
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
