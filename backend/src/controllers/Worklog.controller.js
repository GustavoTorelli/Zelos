import { Worklog } from '../models/Worklog.model.js';
import {
	createWorklogSchema,
	findAllWorklogSchema,
} from '../schemas/worklog.schema.js';
import { idSchema } from '../schemas/generic.schema.js';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';
import { ZodError } from 'zod';

export class WorklogController {
	constructor() {}

	async create(req, res) {
		try {
			const parsedData = createWorklogSchema.parse({
				ticketId: req.params.ticket_id,
				...req.body,
			});

			const worklog = await Worklog.create({
				...parsedData,
				technicianId: req.user.id,
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
